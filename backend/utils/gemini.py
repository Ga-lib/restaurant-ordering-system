import os
import requests

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3.5-flash-lite:generateContent"
)


def ask_gemini(prompt):
    """
    Sends a prompt to Gemini and returns the text response.
    Returns None if anything goes wrong — AI features must never break the app.
    """
    if not GEMINI_API_KEY:
        return None

    try:
        response = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            },
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print("Gemini API error:", repr(e))
        return None