// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDT3AMQ-7frv06UAagGb5QgsnkP3Zb51j0",
  authDomain: "shadab-8be79.firebaseapp.com",
  databaseURL: "https://shadab-8be79-default-rtdb.firebaseio.com",
  projectId: "shadab-8be79",
  storageBucket: "shadab-8be79.appspot.com",
  messagingSenderId: "1000644464692",
  appId: "1:1000644464692:web:30132d02d0bed1d4b53a61",
  measurementId: "G-1B11ZCCK54"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);