import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJusUaBN2ZMKS8E5Dy4rBg-GbCzzU-mGc",
  authDomain: "libre-ad313.firebaseapp.com",
  projectId: "libre-ad313",
  storageBucket: "libre-ad313.appspot.com",
  messagingSenderId: "982734233976",
  appId: "1:982734233976:web:246d0cfeeb4a281504e88d",
  measurementId: "G-5W45EBKQNG"
};

const app = initializeApp(firebaseConfig);
export default getFirestore();