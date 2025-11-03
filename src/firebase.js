// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzVpRgrH5Gd6I6wzN6ipffuwG4sCY7_24",
  authDomain: "studymate-ousl.firebaseapp.com",
  projectId: "studymate-ousl",
  storageBucket: "studymate-ousl.firebasestorage.app",
  messagingSenderId: "376982879297",
  appId: "1:376982879297:web:77491303f345a367ee1ac0",
  measurementId: "G-KP47ERR3HG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
