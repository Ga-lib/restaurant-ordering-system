import requests

# Dhaka coordinates (update later if the restaurant is elsewhere)
LATITUDE = 23.8103
LONGITUDE = 90.4125


def get_current_weather_tags():
    """
    Calls Open-Meteo (no API key needed) and returns a list of tags describing
    current weather, e.g. ["rainy", "cold"]. Falls back to [] if the API fails,
    so weather recommendations never break the rest of the app.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={LATITUDE}&longitude={LONGITUDE}"
        f"&current=temperature_2m,weather_code"
    )

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except Exception:
        return []

    current = data.get("current", {})
    temperature = current.get("temperature_2m")
    weather_code = current.get("weather_code")

    tags = []

    # WMO weather codes -> simple tags
    if weather_code == 0:
        tags.append("sunny")
    elif weather_code in [1, 2, 3, 45, 48]:
        tags.append("cloudy")
    elif weather_code in range(51, 68) or weather_code in [80, 81, 82]:
        tags.append("rainy")
    elif weather_code in range(71, 78):
        tags.append("snowy")
    elif weather_code in [95, 96, 99]:
        tags.append("stormy")

    # Temperature-based tags (tropical climate thresholds)
    if temperature is not None:
        if temperature < 20:
            tags.append("cold")
        elif temperature > 32:
            tags.append("hot")

    return tags