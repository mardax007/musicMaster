import { GoogleAuthProvider, signInWithPopup, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAmlbDSoq_tJABuJbqxv3zEYh8P7eEUy5g",
    authDomain: "musicmastermvp.firebaseapp.com",
    projectId: "musicmastermvp",
    storageBucket: "musicmastermvp.appspot.com",
    messagingSenderId: "927097953296",
    appId: "1:927097953296:web:ae244fb1393a3bc4fcbe95",
    measurementId: "G-QV6KFHV8VF"
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const signInWithGoogle = () => signInWithPopup(auth, provider);
const signinWithEmailAndPass = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        switch (error.message) {
            case 'Firebase: Error (auth/user-not-found).':
                alert('Incorrect credentials');
                break;
            case 'Firebase: Error (auth/wrong-password).':
                alert('Incorrect credentials');
                break;
            default:
                alert(error.message);
                break;
        }
    }
};

const signupWithEmailAndPass = async (email: string, password: string) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        switch (error.message) {
            case 'Firebase: Error (auth/email-already-in-use).':
                alert('Email already in use');
                break;
            case 'Firebase: Error (auth/invalid-email).':
                alert('Invalid email');
                break;
            default:
                alert(error.message);
                break;
        }
    }
};

export { app, auth, signInWithGoogle, signinWithEmailAndPass, signupWithEmailAndPass };