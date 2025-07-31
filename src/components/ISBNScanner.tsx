"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barcode, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ISBNScannerProps {
    onScan: (isbn: string) => Promise<void>;
    isScanning: boolean;
}

export function ISBNScanner({ onScan, isScanning }: ISBNScannerProps) {
    const [isbn, setIsbn] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isbn.trim()) {
            await onScan(isbn.trim());
            setIsbn('');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Barcode className="h-6 w-6" />
                    Scan Book ISBN
                </CardTitle>
                <CardDescription>
                    Enter the ISBN of a book to fetch its details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="e.g., 9780596000486"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        required
                        aria-label="Book ISBN"
                    />
                    <Button type="submit" disabled={isScanning || !isbn.trim()} className="min-w-[100px]">
                        {isScanning ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Fetch
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
