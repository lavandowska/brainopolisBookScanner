
"use server";

import { Book, UserBook } from "./types";
import { getAdminDb } from "./firebase-admin";

export async function getBook(isbn: string): Promise<Book | null> {
    try {
        const docRef = getAdminDb().collection("books").doc(isbn);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as Book;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
    }
    return null;
}

export async function saveBook(bookId: string, bookData: Book) {
    try {
        const docRef = getAdminDb().collection("books").doc(bookId);
        await docRef.set(bookData, { merge: true });
    } catch (e) {
        console.error("Error adding book: ", e);
        throw new Error("Error adding book: " + (e as Error).message);
    }
}

export async function getUserBooks(userId: string): Promise<Book[]> {
    try {
        const userBooksRef = getAdminDb().collection("user-books");
        const q = userBooksRef.where("userId", "==", userId);
        const userBooksSnapshot = await q.get();

        const bookPromises = userBooksSnapshot.docs.map(async (docSnapshot) => {
            const userBook = docSnapshot.data() as UserBook;
            return await getBook(userBook.id);
        });

        const books = (await Promise.all(bookPromises))
                         .filter((book): book is Book => book !== null);
        
        return books.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {
        console.error("Error getting user books: ", e);
        throw new Error("Error getting user books: " + (e as Error).message);
    }
}

export async function saveUserBook(isbn: string, userId: string) {
    try {
        const docRef = getAdminDb().collection("user-books").doc(`${userId}:${isbn}`);
        await docRef.set({id: isbn, userId: userId});
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Unable to save new UserBook record: " + (e as Error).message);
    }
}
