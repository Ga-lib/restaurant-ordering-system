# src/firebase/

Firebase client SDK setup for the frontend.

Will contain:
- firebaseConfig.js -> your Firebase project config keys (apiKey, projectId, etc.)
- Initializes Firebase Auth, Firestore, Storage for direct frontend use
  (e.g. real-time table/order status updates, image URLs from Storage)

NOTE: config keys here are safe to expose in frontend (they're not secret,
unlike the backend's service account key) — Firebase security rules protect
your data, not hiding these keys.
