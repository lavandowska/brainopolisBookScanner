"use server";

import { Book } from "@/lib/types";
import { enhanceBookDescription } from "@/ai/flows/enhance-book-description";

const mockBookDatabase: Record<string, Omit<Book, 'id' | 'enhancedDescription'>> = {
  "9780596000486": {
    title: "CGI Programming with Perl",
    authors: ["Scott Guelich", "Shishir Gundavaram", "Gunther Birznieks"],
    description: "This book is a comprehensive guide to CGI programming in Perl, the most popular language for web scripting. It covers everything from basic CGI concepts to advanced techniques.",
    imageUrl: "https://placehold.co/300x450.png",
    imageHint: "perl programming",
    genre: ["Web Development", "Perl"],
    price: 29.99,
    asin: "0596000480",
  },
  "9781449355738": {
    title: "React: Up & Running",
    authors: ["Stoyan Stefanov"],
    description: "Hit the ground running with React, the open-source technology from Facebook for building rich web applications fast. With this practical guide, you’ll learn how to build components, the basic building blocks of a React app.",
    imageUrl: "https://placehold.co/300x450.png",
    imageHint: "react framework",
    genre: ["JavaScript", "Web Development", "React"],
    price: 34.95,
    asin: "1449355738",
  },
  "9780321765723": {
    title: "The C++ Programming Language",
    authors: ["Bjarne Stroustrup"],
    description: "The C++ Programming Language, 4th Edition, delivers a comprehensive, modern, and accessible introduction to the C++ programming language.",
    imageUrl: "https://placehold.co/300x450.png",
    imageHint: "c++ language",
    genre: ["Programming", "C++"],
    price: 69.99,
    asin: "0321765723",
  },
};

export async function fetchBookData(isbn: string): Promise<{ book?: Book, error?: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const bookData = mockBookDatabase[isbn];

  if (!bookData) {
    return { error: "Book not found for this ISBN." };
  }

  return { book: { id: isbn, ...bookData } };
}

export async function getEnhancedDescription(description: string): Promise<{ enhancedDescription?: string, error?: string }> {
    try {
        const result = await enhanceBookDescription({ bookDescription: description });
        return { enhancedDescription: result.enhancedDescription };
    } catch (e) {
        console.error(e);
        return { error: "Failed to enhance description." };
    }
}
