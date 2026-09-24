#!/usr/bin/env python
"""FastCGI entry point for TechNE-style hosting (Apache + mod_fastcgi/
mod_fcgid via .htaccess), where a direct WSGI/reverse-proxy setup isn't
available. Requires `flup6` (a maintained, Python 3-compatible fork of the
classic `flup` FastCGI bridge — the `django-fastcgi` package sometimes
suggested for this is Python 2-only and cannot run here, see backend/README.md).

TechNE's .htaccess routes requests to this script; it wraps the same
Django WSGI application gunicorn serves in dev/other environments, so
behavior is identical regardless of which server fronts it.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "glitz_backend.settings.production")

from flup.server.fcgi import WSGIServer
from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

if __name__ == "__main__":
    WSGIServer(application).run()
