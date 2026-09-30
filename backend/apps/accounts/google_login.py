import base64
import hashlib
import secrets
import time
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.contrib.auth import login
from django.db import IntegrityError, transaction
from django.shortcuts import redirect
from google.auth.transport.requests import Request
from google.auth.exceptions import GoogleAuthError
from google.oauth2 import id_token

from .models import ReaderAccount
from .reader_services import ReaderError, create_reader, rate_limit, reader_for, send_account_email


def callback_uri():
    return settings.FRONTEND_BASE_URL.rstrip("/") + "/api/visitor/google/callback"


def google_start(request, data):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise ReaderError("Google sign-in is not configured yet.", 503)
    rate_limit("google", request.session.session_key or request.META.get("REMOTE_ADDR"), 30, 3600)
    linking = data.get("link") is True
    reader = reader_for(request, verified=True) if linking else None
    state, nonce, verifier = (secrets.token_urlsafe(32) for _ in range(3))
    request.session["google_flow"] = {"state": state, "nonce": nonce, "verifier": verifier,
        "created": time.time(), "link_reader": reader.pk if reader else None}
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return {"url": "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID, "redirect_uri": callback_uri(), "response_type": "code",
        "scope": "openid email profile", "state": state, "nonce": nonce,
        "code_challenge": challenge, "code_challenge_method": "S256", "prompt": "select_account",
    })}


def google_callback(request):
    flow = request.session.pop("google_flow", None)
    try:
        if not flow or time.time() - flow["created"] > 600 or not secrets.compare_digest(flow["state"], request.GET.get("state", "")):
            raise ReaderError("Google sign-in expired. Please try again.")
        if request.GET.get("error") or not request.GET.get("code"):
            raise ReaderError("Google sign-in was cancelled.")
        response = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.GOOGLE_CLIENT_ID, "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": request.GET["code"], "redirect_uri": callback_uri(), "grant_type": "authorization_code",
            "code_verifier": flow["verifier"],
        }, timeout=10)
        response.raise_for_status()
        claims = id_token.verify_oauth2_token(response.json()["id_token"], Request(), settings.GOOGLE_CLIENT_ID)
        if not secrets.compare_digest(str(claims.get("nonce", "")), flow["nonce"]) or claims.get("email_verified") is not True:
            raise ReaderError("Google could not verify this account.")
        email, subject = claims["email"].strip().lower(), claims["sub"]
        if not isinstance(subject, str) or not subject:
            raise ReaderError("Invalid Google account.")
        with transaction.atomic():
            reader = ReaderAccount.objects.select_related("user").filter(google_subject=subject).first()
            if flow["link_reader"]:
                current = reader_for(request, verified=True)
                if current.pk != flow["link_reader"] or current.email != email or (reader and reader.pk != current.pk):
                    raise ReaderError("Sign in to the matching visitor account before linking Google.")
                if current.google_subject and current.google_subject != subject:
                    raise ReaderError("A different Google account is already connected.")
                current.google_subject = subject
                current.save(update_fields=["google_subject"])
                reader = current
            elif reader is None:
                if ReaderAccount.objects.filter(email=email).exists():
                    raise ReaderError("Sign in with your password first, then connect Google from your profile.")
                # For third-party email domains Google is not authoritative for
                # ongoing mailbox ownership. Require our own email verification.
                authoritative = email.endswith("@gmail.com") or bool(claims.get("hd"))
                reader = create_reader(email, str(claims.get("name", "Reader"))[:80],
                    google_subject=subject, verified=authoritative)
            if not reader.user.is_active or reader.user.is_staff or reader.user.is_superuser:
                raise ReaderError("This visitor account is unavailable.")
        login(request, reader.user, backend="django.contrib.auth.backends.ModelBackend")
        request.session.set_expiry(60 * 60 * 24 * 14)
        if not reader.verified_at:
            send_account_email(reader, "verify")
        return redirect(settings.FRONTEND_BASE_URL.rstrip("/") + "/account")
    except ReaderError as exc:
        message = exc.message
    except (requests.RequestException, GoogleAuthError, ValueError, KeyError, IntegrityError):
        message = "Google sign-in could not be completed. Please try again."
    return redirect(settings.FRONTEND_BASE_URL.rstrip("/") + "/account?" + urlencode({"error": message}))
