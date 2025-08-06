"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Camera, ScanLine } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { extractIsbnFromImage } from '@/ai/flows/extract-isbn-from-image';

interface ISBNScannerProps {
    onScan: (isbn: string) => Promise<void>;
    isScanning: boolean;
}

export function ISBNScanner({ onScan, isScanning }: ISBNScannerProps) {
    const [isbn, setIsbn] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
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

    const handleCaptureAndScan = async () => {
        if (!videoRef.current) return;
        setIsProcessing(true);
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageDataUri = canvas.toDataURL('image/jpeg');
            
            try {
                const { isbn: extractedIsbn } = await extractIsbnFromImage({ imageDataUri });
                if (extractedIsbn) {
                    await onScan(extractedIsbn);
                    handleDialogClose(false);
                } else {
                    toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not find an ISBN in the image. Please try again.' });
                }
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during scanning.' });
                 console.error(error);
            } finally {
                setIsProcessing(false);
            }
        }
    }

    return (
        <>
            <Card className="w-full max-w-md mx-auto shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ScanLine className="h-6 w-6" />
                        Scan Book ISBN
                    </CardTitle>
                    <CardDescription>
                        Enter an ISBN manually, or scan it with your camera.
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
                        <DialogTitle>Scan ISBN</DialogTitle>
                        <DialogDescription>
                            Point your camera at a book's ISBN code.
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
                         {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                                <Loader2 className="animate-spin text-white h-10 w-10" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
                        <Button onClick={handleCaptureAndScan} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : <ScanLine className="mr-2 h-4 w-4"/>}
                            Scan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
