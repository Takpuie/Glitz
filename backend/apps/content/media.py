import re
from urllib.parse import parse_qs, urlsplit


def video_embed_url(url):
    """Build an embed URL from a supported public video link, never raw HTML."""
    parsed = urlsplit(url)
    if parsed.scheme != "https":
        return None
    host = parsed.hostname
    parts = parsed.path.strip("/").split("/")
    video_id = None
    if host == "youtu.be" and len(parts) == 1:
        video_id = parts[0]
    elif host in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [None])[0]
        elif len(parts) == 2 and parts[0] in {"shorts", "embed", "live"}:
            video_id = parts[1]
    if video_id and re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        return f"https://www.youtube-nocookie.com/embed/{video_id}"
    if host in {"vimeo.com", "www.vimeo.com"} and len(parts) == 1 and parts[0].isdigit():
        return f"https://player.vimeo.com/video/{parts[0]}"
    if host == "player.vimeo.com" and len(parts) == 2 and parts[0] == "video" and parts[1].isdigit():
        return f"https://player.vimeo.com/video/{parts[1]}"
    return None
