
"use server";

import { Book, UserBook } from "./types";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function getBook(isbn: string) {
    try {
        const docRef = doc(db, "books", isbn);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Book;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
    }
    return null;
}

export async function saveBook(bookId: string, bookData: Book) {
    try {
        await setDoc(doc(db, "books", bookId), bookData, { merge: true });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function getUserBooks(userId: string): Promise<Book[]> {
    try {
        const userBooksRef = collection(db, "user-books");
        const q = query(userBooksRef, where("userId", "==", userId));
        const userBooksSnapshot = await getDocs(q);

        const bookPromises = userBooksSnapshot.docs.map(async (docSnapshot) => {
            const userBook = docSnapshot.data() as UserBook;
            const book = await getBook(userBook.id);
            return book;
        });

        const books = (await Promise.all(bookPromises)).filter((book): book is Book => book !== null);
        
        return books.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {
        console.error("Error getting user books: ", e);
        // Throw the error to be caught by the caller
        throw new Error("An unexpected response was received from the server.");
    }
}


export async function saveUserBook(isbn: string, userId: string) {
    try {
        await setDoc(doc(db, "user-books", `${userId}:${isbn}`), {id: isbn, userId: userId});
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
