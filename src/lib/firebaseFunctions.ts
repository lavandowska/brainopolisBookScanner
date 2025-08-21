
"use server";

import { Book, UserProfile } from "./types";
import { getAdminDb } from "./firebase-admin";
import * as admin from 'firebase-admin';

const BOOKS_DB = "books";
const USER_PROFILE = "user_profiles";


export async function getBook(isbn: string): Promise<Book | null> {
    try {
        const docRef = getAdminDb().collection(BOOKS_DB).doc(isbn);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as Book;
        }
    } catch (e) {
        console.log("Could not get book, it may not have been scanned before, on databaseId " + getAdminDb().databaseId);
    }
    return null;
}

export async function saveBook(bookId: string, bookData: Book) {
    const docRef = getAdminDb().collection(BOOKS_DB).doc(bookId);
    try {
        // try fetching book, on error add new book
        await docRef.get();
        await docRef.set(bookData, {merge: true});
    } catch (e) {
        try {
            console.log("Create new Book " + bookData.id);
            await docRef.create(bookData);
        } catch (e2) {
            console.error("Error adding book: ", e2);
            throw new Error("Unable to save new book for ISBN " + bookData.id + " on databaseId " + getAdminDb().databaseId);
        }
    }
}

export async function getUserProfile(userEmail: string): Promise<UserProfile> {
    try {
        const docRef = getAdminDb().collection(USER_PROFILE).doc(userEmail);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data() as UserProfile;
        }
    } catch (e) {
        console.log("Could not get profile, it may not have been created yet");
    }
    return await createUserProfile(userEmail);
}

export async function getUserBooks(userEmail: string): Promise<Book[]> {
    try {
        const userProfile = await getUserProfile(userEmail);

        const bookIds = userProfile.isbns;
        if (bookIds.length === 0) {
            return [];
        }

        const bookDocs = await getAdminDb().collection(BOOKS_DB)
            .where(admin.firestore.FieldPath.documentId(), 'in', bookIds).get();

        const books = bookDocs.docs.map(doc => doc.data() as Book);
        
        return books.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e) {
        //console.log("Could not get user books.", e);
        // Don't throw, just return empty array
    }
    return [];
}

export async function saveUserIsbns(userEmail: string, isbns: string[]) {
    const userProfile = await getUserProfile(userEmail);
    userProfile.isbns = isbns;
    await saveUserProfile(userProfile);
}

// do not export this - exposes it to FE where the 'credits' could be modified
async function saveUserProfile(userProfile: UserProfile) {
    const docRef = getAdminDb().collection(USER_PROFILE).doc(userProfile.userId);
    try {
        // try fetching book, on error add new book
        await docRef.get();
        await docRef.set(userProfile, {merge: true});
    } catch (e) {
        throw new Error("Unable to save UserProfile.");
    }
}

export async function saveUserBook(isbn: string, userEmail: string) {
    const userProfile = await getUserProfile(userEmail);
    if (userProfile.isbns.includes(isbn)) {
        return;
    }
    userProfile.isbns.push(isbn);
    userProfile.credits--;
    try {
        await saveUserProfile(userProfile);
    } catch (e) {
        throw new Error("Unable to save book to user profile.");
    }
}

export async function createUserProfile(userEmail: string): Promise<UserProfile> {
    const docRef = getAdminDb().collection(USER_PROFILE).doc(userEmail);
    const defaultProfile: UserProfile = {
        userId: userEmail,
        credits: 5, // Default credits
        amazonAffId: "",
        isbns: []
    };
    try {
        await docRef.set(defaultProfile);
    } catch (e) {
        throw new Error("Unable to create UserProfile.");
    }
    return defaultProfile;
}

