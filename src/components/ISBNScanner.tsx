"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barcode, Loader2, Search, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useToast } from '@/hooks/use-toast';
import { convertUpcToIsbn } from '@/lib/actions';
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

    const startScan = useCallback(async () => {
        if (!isScannerOpen || !videoRef.current) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
                    if (result) {
                        const upc = result.getText();
                        setIsScannerOpen(false);
                        const { isbn, error } = await convertUpcToIsbn(upc);
                        if (isbn) {
                            onScan(isbn);
                        } else {
                            toast({ variant: 'destructive', title: 'Error', description: error });
                        }
                    }
                    if (err && err.message.includes('No MultiFormat Readers were able to detect a barcode')) {
                        // This is the NotFoundException equivalent, we can ignore it.
                    } else if (err) {
                        console.error(err);
                        toast({ variant: "destructive", title: "Scan Error", description: "Could not decode barcode." });
                        setIsScannerOpen(false);
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
    }, [isScannerOpen, onScan, toast]);

    useEffect(() => {
        if (isScannerOpen) {
            startScan();
        } else {
            codeReader.current.stop();
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        }
        return () => {
            codeReader.current.stop();
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, [isScannerOpen, startScan]);


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
                         <Button type="button" variant="outline" onClick={() => setIsScannerOpen(true)} disabled={isScanning}>
                            <Camera className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Barcode</DialogTitle>
                        <DialogDescription>
                            Point your camera at a book's barcode.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
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
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Loader2 className="animate-spin text-white h-10 w-10" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsScannerOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
