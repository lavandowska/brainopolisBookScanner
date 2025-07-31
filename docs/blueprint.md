# **App Name**: BookLook

## Core Features:

- ISBN Scanner: Scan ISBN barcodes using the device's camera. Note: due to the mobile-only constraint and lack of database persistence, the barcode history will only last for the duration of a user's active browser session.
- Book Data Fetch: Fetch book details using the Google Books API, and Amazon Products API (title, image, authors, genre, ASIN, and description, and also price)
- Book Info Display: Display book information (title, image, authors, genre, ASIN, description, price) in a clear, accessible format following WCAG AA guidelines, and also adhering to semantic HTML conventions.
- Export to WooCommerce CSV: Allows the user to export to CSV matching the format specified for WooCommerce based on https://github.com/woocommerce/woocommerce/wiki/Product-CSV-Import-Schema#csv-columns-and-formatting.

## Style Guidelines:

- Primary color: Slate Blue (#717BFF), offering a modern and calming feel suitable for focus.
- Background color: Very light grayish-blue (#F2F4FF), provides a soft backdrop that's easy on the eyes.
- Accent color: Lavender (#B17CFF) for interactive elements and highlights.
- Body and headline font: 'Inter', a sans-serif font that ensures readability and a modern look.
- Simple, outline-style icons for navigation and actions. These should be easily understandable and visually consistent.
- Clean and simple layout with a focus on readability. Use of white space to separate content and guide the user through the application. Maintain consistent spacing and alignment throughout.