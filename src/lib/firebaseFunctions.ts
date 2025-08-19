
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
        await setDoc(doc(db, "books", bookId), bookData);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function getUserBooks(userId: string): Promise<Book[]> {
    try {
        const userBooksRef = collection(db, "user-books");
        const q = query(userBooksRef, where("userId", "==", userId));
        const userBooksSnapshot = await getDocs(q);

        const books: Book[] = [];
        for (const docSnapshot of userBooksSnapshot.docs) {
            const userBook = docSnapshot.data() as UserBook;
            const bookDocRef = doc(db, "books", userBook.id);
            const bookDocSnap = await getDoc(bookDocRef);

            if (bookDocSnap.exists()) {
                books.push(bookDocSnap.data() as Book);
            }
        }
        return books.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {
        console.error("Error getting user books: ", e);
    }
    return [];
}


export async function saveUserBook(isbn: string, userId: string) {
    try {
        await setDoc(doc(db, "user-books", isbn + ":" + userId), {id: isbn, userId: userId});
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
