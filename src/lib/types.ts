export interface Book {
  id: string; // ISBN
  userId: string, 
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
