import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA1Iwf-Hv0hERQqJWJ54-hCG4VH8PdzMCw',
  authDomain: 'music-app-5da5b.firebaseapp.com',
  projectId: 'music-app-5da5b',
  storageBucket: 'music-app-5da5b.appspot.com',
  messagingSenderId: '729575315985',
  appId: '1:729575315985:web:b7b561576a13aa48186fb0',
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const usersCollection = db.collection('users');
const songsCollection = db.collection('songs');
const commentsCollection = db.collection('comments');

export { auth, db, usersCollection, storage, songsCollection, commentsCollection };
