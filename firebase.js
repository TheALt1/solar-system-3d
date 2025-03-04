import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// 🔹 Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqPssts3Tg7HjiPPBn6WyEibHn3ew2k-E",
    authDomain: "solarsystem3d-7e7b0.firebaseapp.com",
    projectId: "solarsystem3d-7e7b0",
    storageBucket: "solarsystem3d-7e7b0.firebaseapp.com",
    messagingSenderId: "964531314552",
    appId: "1:964531314552:web:f15441302a72c936cb328d",
    measurementId: "G-MH7GE558Z9"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc };
