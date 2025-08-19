
"use server";

import { Book, UserBook } from "./types";
import { getAdminDb } from "./firebase-admin";
import * as admin from 'firebase-admin';

const isFirebaseAdminInitialized = () => {
    try {
        getAdminDb();
        return true;
    } catch (e) {
        return false;
    }
}

export async function getBook(isbn: string): Promise<Book | null> {
    if (!isFirebaseAdminInitialized()) {
        console.warn("Could not get book, Firebase Admin SDK not initialized.");
        return null;
    }
    try {
        const docRef = getAdminDb().collection("books").doc(isbn);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as Book;
        }
    } catch (e) {
        console.warn("Could not get book, Firebase Admin SDK not initialized.", e);
    }
    return null;
}

export async function saveBook(bookId: string, bookData: Book) {
    if (!isFirebaseAdminInitialized()) {
        throw new Error("Firebase Admin SDK not initialized. Cannot save book.");
    }
    try {
        const docRef = getAdminDb().collection("books").doc(bookId);
        await docRef.set(bookData, { merge: true });
    } catch (e) {
        console.error("Error adding book: ", e);
        throw new Error("Error adding book: " + (e as Error).message);
    }
}

export async function getUserBooks(userId: string): Promise<Book[]> {
    if (!isFirebaseAdminInitialized()) {
        console.warn("Could not get user books, Firebase Admin SDK not initialized.");
        return [];
    }
    try {
        const userBooksRef = getAdminDb().collection("user-books");
        const q = userBooksRef.where("userId", "==", userId);
        const userBooksSnapshot = await q.get();

        if (userBooksSnapshot.empty) {
            return [];
        }

        const bookIds = userBooksSnapshot.docs.map(doc => doc.data().id);

        if (bookIds.length === 0) {
            return [];
        }

        const bookDocs = await getAdminDb().collection('books').where(admin.firestore.FieldPath.documentId(), 'in', bookIds).get();

        const books = bookDocs.docs.map(doc => doc.data() as Book);
        
        return books.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {
        console.warn("Could not get user books, Firebase Admin SDK not initialized.", e);
        // Don't throw, just return empty array
        return [];
    }
}

export async function saveUserBook(isbn: string, userId: string) {
    if (!isFirebaseAdminInitialized()) {
        throw new Error("Firebase Admin SDK not initialized. Cannot save user book.");
    }
    try {
        const docRef = getAdminDb().collection("user-books").doc(`${userId}:${isbn}`);
        await docRef.set({id: isbn, userId: userId});
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Unable to save new UserBook record: " + (e as Error).message);
    }
}
