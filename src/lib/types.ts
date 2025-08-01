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
  tags: string; // New or Used
}
