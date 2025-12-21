import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXRr-EcwZNQ41xkLQxPARpBbnhgZCHbTA",
  authDomain: "smartread-app.firebaseapp.com",
  projectId: "smartread-app",
  storageBucket: "smartread-app.firebasestorage.app",
  messagingSenderId: "111367447822",
  appId: "1:111367447822:web:6b7ecae00620531c0e235f",
  measurementId: "G-73HE9FFQFV",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
