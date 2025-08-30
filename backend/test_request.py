import os
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    raise Exception("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")

data = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "participant_id": "123e4567-e89b-12d3-a456-426614174000",
    "answers": "Test answer"
}

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/Responses",
    json=data,
    headers=headers
)

print("Status Code:", response.status_code)
print("Response Body:", response.text)
