// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5iHG9GHX-t1ibbez7w4UzYGqnsRA1-8Q",
  authDomain: "searchmystudy-104e4.firebaseapp.com",
  projectId: "searchmystudy-104e4",
  storageBucket: "searchmystudy-104e4.appspot.com",
  messagingSenderId: "775588977406",
  appId: "1:775588977406:web:3b3ee577fedf6a239363af",
  measurementId: "G-7RJVGH30WF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);