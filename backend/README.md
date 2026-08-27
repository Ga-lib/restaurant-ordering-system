# backend/ (Django project)

This is the Python/Django backend. It talks to Firebase (via firebase-admin SDK)
and exposes API endpoints that the React frontend will call.

## What goes where
- `config/`        -> Django project settings, main URLs, WSGI/ASGI entry
- `apps/`          -> One Django "app" per feature (users, menu, orders, etc.)
- `firebase/`      -> Firebase Admin SDK setup + your service account key (NEVER commit this file)
- `utils/`         -> Shared helper functions (e.g. Bayesian rating calculation, bill/invoice generator)
- `requirements.txt` -> Python package list (Django, firebase-admin, etc.)
- `manage.py`      -> Django's command-line tool (created automatically when we run `django-admin startproject`)
- `.env`           -> Secret keys (Grok API key, weather API key, Firebase config) — NEVER commit this file

## Setup order (once we start coding)
1. Create virtual environment, install Django + firebase-admin
2. Run `django-admin startproject config .`
3. Create each app inside `apps/` with `python manage.py startapp <name>`
4. Connect Firebase using the service account key in `firebase/`
5. Build API endpoints app by app
