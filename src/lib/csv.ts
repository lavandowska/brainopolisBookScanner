import { Book } from "./types";

export function exportToWooCommerceCsv(books: Book[]) {
    const headers = [
        "Type", "SKU", "Name", "Published", "Is featured?", "Visibility in catalog", "Short description",
        "Description", "Date sale price starts", "Date sale price ends", "Tax status", "Tax class", "In stock?",
        "Stock", "Backorders allowed?", "Sold individually?", "Weight (kg)", "Length (cm)", "Width (cm)",
        "Height (cm)", "Allow customer reviews?", "Purchase note", "Sale price", "Regular price", "Categories",
        "Tags", "Shipping class", "Images", "Download limit", "Download expiry days", "Parent",
        "Grouped products", "Upsells", "Cross-sells", "External URL", "Button text", "Position"
    ];

    const rows = books.map(book => {
        const description = book.description;
        const row = {
            "Type": "simple",
            "SKU": book.id,
            "Name": book.title,
            "Published": "1",
            "Is featured?": "0",
            "Visibility in catalog": "visible",
            "Short description": description.substring(0, 100) + (description.length > 100 ? '...' : ''),
            "Description": description,
            "Date sale price starts": "",
            "Date sale price ends": "",
            "Tax status": "taxable",
            "Tax class": "",
            "In stock?": "1",
            "Stock": "",
            "Backorders allowed?": "0",
            "Sold individually?": "0",
            "Weight (kg)": "",
            "Length (cm)": "",
            "Width (cm)": "",
            "Height (cm)": "",
            "Allow customer reviews?": "1",
            "Purchase note": "",
            "Sale price": "",
            "Regular price": book.price.toString(),
            "Categories": book.genre.join(', '),
            "Tags": book.authors.join(', '),
            "Shipping class": "",
            "Images": book.imageUrl,
            "Download limit": "",
            "Download expiry days": "",
            "Parent": "",
            "Grouped products": "",
            "Upsells": "",
            "Cross-sells": "",
            "External URL": "",
            "Button text": "",
            "Position": "0"
        };
        // Ensure keys match headers for proper CSV creation
        return headers.map(header => `"${(row[header as keyof typeof row] || '').toString().replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "woocommerce_products.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
