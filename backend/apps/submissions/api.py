import hashlib
from pathlib import Path

from PIL import Image
from django.core.cache import cache
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from rest_framework import serializers
from rest_framework.exceptions import Throttled
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.events.models import Event
from .models import Enquiry, NewsletterSubscriber, Nomination


class SubmissionSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    consent = serializers.BooleanField()
    website = serializers.CharField(required=False, allow_blank=True, max_length=200)

    def validate_email(self, value):
        return value.strip().lower()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Please confirm your consent before submitting.")
        return value

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Unable to accept this submission.")
        return value


class NominationSerializer(SubmissionSerializer):
    submission_id = serializers.UUIDField()
    open_call = serializers.ChoiceField(choices=Nomination.Call.choices)
    full_name = serializers.CharField(max_length=150)
    portfolio_link = serializers.URLField(required=False, allow_blank=True)
    portfolio_file = serializers.FileField(required=False)
    statement = serializers.CharField(max_length=10000)

    def validate_portfolio_file(self, file):
        if file.size > 20 * 1024 * 1024:
            raise serializers.ValidationError("The portfolio must be 20 MB or smaller.")
        suffix = Path(file.name).suffix.lower()
        try:
            if suffix == ".pdf":
                if not file.read(5) == b"%PDF-":
                    raise ValueError()
            elif suffix in {".jpg", ".jpeg"}:
                with Image.open(file) as image:
                    if image.format != "JPEG":
                        raise ValueError()
                    image.verify()
            else:
                raise ValueError()
        except Exception:
            raise serializers.ValidationError("Upload a valid PDF or JPG file.")
        finally:
            file.seek(0)
        return file


class EnquirySerializer(SubmissionSerializer):
    submission_id = serializers.UUIDField()
    kind = serializers.ChoiceField(choices=Enquiry.Kind.choices)
    full_name = serializers.CharField(max_length=150)
    company = serializers.CharField(max_length=200, required=False, allow_blank=True)
    message = serializers.CharField(max_length=10000, required=False, allow_blank=True)
    event = serializers.SlugRelatedField(slug_field="slug", queryset=Event.objects.all(), required=False, allow_null=True)

    def validate(self, data):
        if data["kind"] == Enquiry.Kind.EVENT and not data.get("event"):
            raise serializers.ValidationError({"event": "Choose an event."})
        if data["kind"] != Enquiry.Kind.EVENT and not data.get("message"):
            raise serializers.ValidationError({"message": "Please enter your message."})
        if data["kind"] == Enquiry.Kind.SPONSORSHIP and not data.get("company"):
            raise serializers.ValidationError({"company": "Please enter your company name."})
        return data


class SubmissionView(APIView):
    permission_classes = []
    authentication_classes = []
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request, kind):
        serializer_class = {"newsletter": SubmissionSerializer, "nominations": NominationSerializer, "enquiries": EnquirySerializer}.get(kind)
        if not serializer_class:
            raise Http404
        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        # Per-address throttling also works behind the Next.js proxy without
        # trusting a caller-supplied forwarded IP address.
        key = "submissions:" + hashlib.sha256(data["email"].encode()).hexdigest()
        cache.add(key, 0, 3600)
        if cache.incr(key) > 10:
            raise Throttled(wait=3600)
        data.pop("website", None)
        data.pop("consent")
        if kind == "newsletter":
            subscriber, created = NewsletterSubscriber.objects.get_or_create(email=data["email"])
            # Repeated public requests never reactivate a staff-disabled record.
            return Response({"detail": "Your signup has been recorded."}, status=201 if created else 200)
        model = Nomination if kind == "nominations" else Enquiry
        submission_id = data.pop("submission_id")
        record, created = model.objects.get_or_create(submission_id=submission_id, defaults=data)
        if record.email != data["email"]:
            return Response({"detail": "Please refresh the page and submit again."}, status=409)
        return Response({"detail": "Your submission has been received.", "reference": str(record.reference)}, status=201 if created else 200)


def nomination_portfolio(request, pk):
    if not request.user.is_authenticated or not request.user.has_perm("submissions.view_nomination"):
        raise PermissionDenied
    nomination = get_object_or_404(Nomination, pk=pk)
    if not nomination.portfolio_file:
        raise Http404
    try:
        file = nomination.portfolio_file.open("rb")
    except FileNotFoundError:
        raise Http404
    response = FileResponse(file, as_attachment=True, filename=f"portfolio-{nomination.reference}{Path(file.name).suffix}")
    response["Cache-Control"] = "private, no-store"
    response["X-Content-Type-Options"] = "nosniff"
    return response
