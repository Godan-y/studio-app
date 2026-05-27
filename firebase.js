import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCp1ibpCBUb43nmjmA0aOomdzM8bECB2fc",
    authDomain: "ebook-shop-3ded1.firebaseapp.com",
    projectId: "ebook-shop-3ded1",
    storageBucket: "ebook-shop-3ded1.firebasestorage.app",
    messagingSenderId: "78873532344",
    appId: "1:78873532344:web:8032aa10b00b7939ea614d"
  };
  
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);