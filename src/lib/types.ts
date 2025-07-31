export interface Book {
  id: string; // ISBN
  title: string;
  authors: string[];
  description: string;
  imageUrl: string;
  imageHint: string;
  genre: string[];
  price: number;
  asin: string;
  enhancedDescription?: string;
}
