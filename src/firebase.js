// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "AIzaSyCJeNW1vGeHnaqUCjavPxjafwoX11uwTIA",
  // authDomain: "login-19151.firebaseapp.com",
  // projectId: "login-19151",
  // storageBucket: "login-19151.firebasestorage.app",
  // messagingSenderId: "573085469225",
  // appId: "1:573085469225:web:78fdf8e219deb37841ea38",
  // measurementId: "G-FPNZ2ZP646",
  apiKey: "AIzaSyB0pn7rZOtyOVMjphnFDDnhnFVeJiz3v30",
  authDomain: "eyeq-7216a.firebaseapp.com",
  projectId: "eyeq-7216a",
  storageBucket: "eyeq-7216a.firebasestorage.app",
  messagingSenderId: "721817237033",
  appId: "1:721817237033:web:f3f364bdd0f7dab3460e38",
  measurementId: "G-TNY4KW1QM8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
