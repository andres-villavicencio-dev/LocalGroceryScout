import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyCgnwpbMI6X_gFcnVkqYf6-8KHS6x0VwBY",
  authDomain: "local-grocery-scout.firebaseapp.com",
  projectId: "local-grocery-scout",
  storageBucket: "local-grocery-scout.firebasestorage.app",
  messagingSenderId: "661830129146",
  appId: "1:661830129146:web:c6fb8b4521f3fdd39c8043",
  measurementId: "G-7W3M6R55Q5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
