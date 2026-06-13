from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request


APK_URL = "https://github.com/LikeNmuFF/Novu/releases/latest/download/app-release.apk"


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        kv_url = os.environ.get("KV_REST_API_URL")
        kv_token = os.environ.get("KV_REST_API_TOKEN")

        if not kv_url or not kv_token:
            self.send_response(302)
            self.send_header("Location", APK_URL)
            self.end_headers()
            return

        try:
            req = urllib.request.Request(
                f"{kv_url}/incr/download_count",
                method="POST",
                headers={
                    "Authorization": f"Bearer {kv_token}",
                    "Content-Type": "application/json",
                },
            )
            urllib.request.urlopen(req, timeout=5).read()

        except Exception:
            pass

        self.send_response(302)
        self.send_header("Location", APK_URL)
        self.end_headers()
