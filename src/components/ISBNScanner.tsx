"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barcode, Loader2, Search, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';
import { useToast } from '@/hooks/use-toast';
import { convertUpcToIsbn } from "@/ai/flows/upc-to-isbn";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ISBNScannerProps {
    onScan: (isbn: string) => Promise<void>;
    isScanning: boolean;
}

export function ISBNScanner({ onScan, isScanning }: ISBNScannerProps) {
    const [isbn, setIsbn] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    const codeReader = useRef(new BrowserMultiFormatReader());
    const isScanningRef = useRef(false);

    const stopScan = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);
    
    useEffect(() => {
        return () => {
            stopScan();
        };
    }, [stopScan]);


    const handleScannerOpen = async () => {
        setIsScannerOpen(true);
        isScanningRef.current = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                const hints = new Map();
                const formats = [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A];
                hints.set(2, formats); // Corresponds to DecodeHintType.POSSIBLE_FORMATS
                
                codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                    if (result && isScanningRef.current) {
                        isScanningRef.current = false; // Prevent further scans
                        stopScan();
                        const upc = result.getText();
                        setIsScannerOpen(false);
                        convertUpcToIsbn(upc).then(({ isbn, error }) => {
                             if (isbn) {
                                onScan(isbn);
                            } else {
                                toast({ variant: 'destructive', title: 'Error', description: error || `Failed to convert UPC ${upc}.` });
                            }
                        });
                    }
                    if (err && !(err.constructor.name === 'NotFoundException')) {
                         console.error("Barcode decoding error:", err);
                    }
                });
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
            setIsScannerOpen(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        if(!open) {
            isScanningRef.current = false;
            stopScan();
        }
        setIsScannerOpen(open);
    }
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isbn.trim()) {
            await onScan(isbn.trim());
            setIsbn('');
        }
    };

    return (
        <>
            <Card className="w-full max-w-md mx-auto shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Barcode className="h-6 w-6" />
                        Scan Book ISBN
                    </CardTitle>
                    <CardDescription>
                        Enter the ISBN of a book, or scan a barcode.
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
                            {isScanning && !isScannerOpen ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Fetch
                                </>
                            )}
                        </Button>
                         <Button type="button" variant="outline" onClick={handleScannerOpen} disabled={isScanning}>
                            <Camera className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Dialog open={isScannerOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Barcode</DialogTitle>
                        <DialogDescription>
                            Point your camera at a book's barcode.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                         {/* Overlay for scanning guidance */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="w-64 h-32 border-2 border-dashed border-primary rounded-md"></div>
                            <p className="mt-4 text-sm text-muted-foreground text-center">Center the barcode within the frame.</p>
                        </div>
                        <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                        {hasCameraPermission === false && (
                             <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                         {isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                                <Loader2 className="animate-spin text-white h-10 w-10" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
