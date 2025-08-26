
"use server";

import { Book, UserProfile } from "./types";
import { getAdminDb } from "./firebase-admin";
import Stripe from 'stripe'
import * as admin from 'firebase-admin';
import { DocumentData } from "firebase/firestore";

const BOOKS_DB = "books";
const USER_PROFILES = "user_profiles";

const POINTS_PER_PENNY = 1.0;  // 1 penny per point == 1 point per penny

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
        const docRef = getAdminDb().collection(USER_PROFILES).doc(userEmail);
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
    await saveUserProfile(userProfile, userEmail);
}

// do not export this - exposes it to FE where the 'credits' could be modified
async function saveUserProfile(userProfile: UserProfile, userEmail: string) {
    const docRef = getAdminDb().collection(USER_PROFILES).doc(userEmail);
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

    // Perform the update within a transaction
    await getAdminDb().runTransaction(async (transaction) => {
    userProfile.isbns.push(isbn);
    userProfile.credits--;

    // Update the user profile within the transaction
    const userProfileRef = getAdminDb().collection(USER_PROFILES).doc(userEmail);
    transaction.set(userProfileRef, userProfile, { merge: true });
    });
}

export async function createUserProfile(userEmail: string): Promise<UserProfile> {
    const docRef = getAdminDb().collection(USER_PROFILES).doc(userEmail);
    const defaultProfile: UserProfile = {
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

async function findCustomerRecord(userId: string): Promise<DocumentData> {
    const sessionPath = "/customers/" + userId;
    const docRef = getAdminDb().doc(sessionPath);
    return await docRef.get();
}

// This function handles updating the credits on the user profile
export async function creditsPurchased(userId: string, amountTotal: number): Promise<UserProfile | undefined> {
    try {
        const customer = findCustomerRecord(userId);
        if (customer.email) {
            const userProfile = await getUserProfile(customer.email);
            userProfile.credits = userProfile.credits + (POINTS_PER_PENNY * amountTotal);
            saveUserProfile(userProfile, customer.email);
            return userProfile;
        } else {
            console.error("No user_email found for customer %s", userId);
            throw new Error("No user_email found for customer ");
        }
    } catch (error) {
        throw new Error("Unable to record payment: " + (error as Error).message);
    }
}
