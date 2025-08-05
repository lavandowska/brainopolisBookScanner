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
    const amazonAffTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG; 
    const amazonAffQuery = amazonAffTag == undefined ? undefined : `?tag=${amazonAffTag}&language=en_US&th=1&ref_=as_li_ss_tl`;
    
    const rows = books.map(book => {
        // exports with HTML in them must be uploaded to the server and Imported to WooCommerce from there
        // this is a "limitation" in WordPress for security's sake
        const alsoOnAmazon = amazonAffQuery == undefined ? '' : ` <a href='https://www.amazon.com/dp/${book.isbn10}${amazonAffQuery}' target='amazon'>Also on Amazon</a>`;
        const description = book.description + alsoOnAmazon;
        const row = {
            "Type": "simple",
            "SKU": book.id,
            "Name": book.title,
            "Published": "1",
            "Is featured?": "0",
            "Visibility in catalog": "visible",
            "Short description": book.imageHint, 
            "Description": description,
            "Tax status": "taxable",
            "In stock?": "1",
            "Stock": "1",
            "Backorders allowed?": "0",
            "Sold individually?": "1",
            "Weight (kg)": book.weight,
            "Length (cm)": book.length,
            "Width (cm)": book.width,
            "Height (cm)": book.height,
            "Allow customer reviews?": "1",
            "Purchase note": "",
            "Sale price": "",
            "Regular price": book.price || '',
            "Categories": book.genre?.join(', '),
            "Tags": book.authors?.join(', ') + ", " + book.tag,
            "Shipping class": "",
            "Images": book.imageUrl,
            "External URL": amazonAffQuery == undefined ? '' : `https://www.amazon.com/dp/${book.isbn10}${amazonAffQuery}`,
            "Button text": amazonAffQuery == undefined ? '' : "Also on Amazon",
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
