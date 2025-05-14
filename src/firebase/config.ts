// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxEZesHHtm0lc1ytd9y5ifrb3VuIpiPAw",
  authDomain: "study-tracker-abdb2.firebaseapp.com",
  projectId: "study-tracker-abdb2",
  storageBucket: "study-tracker-abdb2.appspot.com",
  messagingSenderId: "1001014195663",
  appId: "1:1001014195663:web:16847b0bdbc9a58675ceba",
  measurementId: "G-DLKYWV3LGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only if supported in the current environment
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(error => {
  console.error("Analytics not supported or blocked:", error);
});

// Enable offline data persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.log('Persistence is not available in this browser');
    } else {
      console.error("Persistence error:", err);
    }
  });

export { app, auth, db, analytics };