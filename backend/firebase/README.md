# backend/firebase/

Firebase Admin SDK connection lives here.

Will contain:
- firebase_config.py (initializes firebase-admin using the service account key)
- firebase-service-account.json  <-- you will download this from Firebase Console
  (Project Settings -> Service Accounts -> Generate new private key)
  NEVER commit this file to GitHub — it's already in .gitignore

This lets Django read/write Firestore, verify Firebase Auth tokens,
and manage files in Firebase Storage (food/drink images).
