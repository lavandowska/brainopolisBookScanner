"use server";

import { Book } from "./types";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function saveBook(bookId: string, bookData: Book) {
    try {
        await setDoc(doc(db, "books", bookId), bookData);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
