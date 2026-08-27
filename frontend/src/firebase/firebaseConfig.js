import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbRgZp2Sro5HIWVhNT4zZmixFsvjYd0LE",
  authDomain: "restaurant-ordering-syst-c83fb.firebaseapp.com",
  projectId: "restaurant-ordering-syst-c83fb",
  storageBucket: "restaurant-ordering-syst-c83fb.firebasestorage.app",
  messagingSenderId: "1039384107027",
  appId: "1:1039384107027:web:664723fdfcee51b2ac87e6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);