// This file centralizes the Firebase configuration for the NEW project.

// 1. Firebase Configuration for the new project "tpr-work-os-v2"
const firebaseConfig = {
  apiKey: "AIzaSyCf4l_cTErZborNJTGaUmkUUVoCLbr9aPE",
  authDomain: "tpr-work-os-v2.firebaseapp.com",
  projectId: "tpr-work-os-v2",
  storageBucket: "tpr-work-os-v2.firebasestorage.app",
  messagingSenderId: "34936035678",
  appId: "1:34936035678:web:a614c89fb2a4d43fead7cf",
  measurementId: "G-4Q532YK25J"
};

// 2. Initialize Firebase using the "compat" libraries
firebase.initializeApp(firebaseConfig);

// 3. Create globally accessible instances
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

console.log("Firebase initialized correctly from firebase-init.js for project: " + firebaseConfig.projectId);
