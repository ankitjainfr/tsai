// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2HHgQM7kRJhYN2KZbFutP0vlb3vmjuwE",
  authDomain: "turboswap-ac4a7.firebaseapp.com",
  projectId: "turboswap-ac4a7",
  storageBucket: "turboswap-ac4a7.appspot.com",
  messagingSenderId: "118486762879",
  appId: "1:118486762879:web:e08781895926e5a51f464a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase initialized:", app);
console.log("Firestore initialized:", db);

export { db };
