# backend/config/

Django's main project folder (created by `django-admin startproject`).
Will contain: settings.py, urls.py, wsgi.py, asgi.py.

This is where:
- Installed apps are registered (all our `apps/*`)
- Firebase credentials/config are loaded
- Grok AI API key and Weather API key are loaded from `.env`
- Main URL routing connects to each app's urls.py
