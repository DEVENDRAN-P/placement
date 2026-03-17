import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration from the Firebase Console
const firebaseConfig = {
  apiKey: 'AIzaSyCmU9yKvzZWfXcQfYBknYaPaZFKoae0-KA',
  authDomain: 'userauth-bb93a.firebaseapp.com',
  projectId: 'userauth-bb93a',
  storageBucket: 'userauth-bb93a.firebasestorage.app',
  messagingSenderId: '306198446238',
  appId: '1:306198446238:web:7fae37c67d6b1d01c2fb8f',
  measurementId: 'G-CHYPGZ47R3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
