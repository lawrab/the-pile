import re
from typing import Dict, Optional
import urllib.parse
import urllib.request

from app.core.config import settings


class SteamAuth:
    def __init__(self):
        self.steam_openid_url = "https://steamcommunity.com/openid/login"
        self.return_url = f"{settings.BASE_URL}/api/v1/auth/steam/callback"

    def get_auth_url(self) -> str:
        """Generate Steam OpenID authentication URL"""
        params = {
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.mode": "checkid_setup",
            "openid.return_to": self.return_url,
            "openid.realm": settings.BASE_URL,
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        }

        query_string = urllib.parse.urlencode(params)
        return f"{self.steam_openid_url}?{query_string}"

    def verify_authentication(self, params: Dict[str, str]) -> Optional[str]:
        """Verify Steam OpenID authentication response"""
        try:
            # Change mode to check_authentication
            verification_params = params.copy()
            verification_params["openid.mode"] = "check_authentication"

            # Create verification request
            data = urllib.parse.urlencode(verification_params).encode("utf-8")
            req = urllib.request.Request(self.steam_openid_url, data=data)

            with urllib.request.urlopen(req) as response:
                response_text = response.read().decode("utf-8")

            # Check if authentication is valid
            if "is_valid:true" in response_text:
                # Extract Steam ID from identity URL
                identity = params.get("openid.identity", "")
                match = re.search(r"steamcommunity\.com/openid/id/(\d+)", identity)
                if match:
                    return match.group(1)

            return None

        except Exception as e:
            print(f"Steam auth verification error: {e}")
            return None
