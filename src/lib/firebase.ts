"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  "projectId": "brainopolisbooks-ptjrj",
  "appId": "1:595646494295:web:7f41b262a2ce7b6263d512",
  "storageBucket": "brainopolisbooks-ptjrj.firebasestorage.app",
  "apiKey": "AIzaSyBa75E6Pn-u2JXFRKZKV4LPeXAWC6-S6pk",
  "authDomain": "brainopolisbooks-ptjrj.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "595646494295"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { app, auth, googleProvider, facebookProvider, appleProvider };
