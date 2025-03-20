import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import {setPersistence, browserLocalPersistence } from 'firebase/auth';



const firebaseConfig = {
  apiKey: "AIzaSyCgUhEhglSdskaIGit2zTqQztZEOQZp0L0",
  authDomain: "robocare-bea33.firebaseapp.com",
  projectId: "robocare-bea33",
  storageBucket: "robocare-bea33.firebasestorage.app",
  messagingSenderId: "218668211013",
  appId: "1:218668211013:web:085fc8e012ed706f083c2c",
  measurementId: "G-LRH7DZV40S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
