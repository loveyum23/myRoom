
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// 사용자가 제공한 Firebase 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyAKOUoacVrz6DvtD6VpY_584UlhHCmwx9g",
  authDomain: "myproject-ad21b.firebaseapp.com",
  projectId: "myproject-ad21b",
  storageBucket: "myproject-ad21b.firebasestorage.app",
  messagingSenderId: "460406834460",
  appId: "1:460406834460:web:42b5682c72aeb2e5b366d9",
  measurementId: "G-73JE6CNVD1"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { auth, db, storage, analytics };
