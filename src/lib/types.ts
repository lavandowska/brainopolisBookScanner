export interface Book {
  id: string; // ISBN
  isbn10: string;
  title: string;
  authors: string[];
  description: string;
  imageUrl: string;
  imageHint: string;
  genre: string[];
  price: number;
  asin: string;
  tag: string; // New or Used
  height: string;
  width: string;
  length: string;
  weight: string;
}

export interface UserProfile {
  credits: number,
  amazonAffId: string, 
  isbns: string[]
}