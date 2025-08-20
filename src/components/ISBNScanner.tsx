
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Camera, ScanLine, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { extractIsbnFromImage } from '@/ai/flows/extract-isbn-from-image';

interface ISBNScannerProps {
    onScan: (isbn: string) => Promise<{error?: string}>;
    isScanning: boolean;
    onCancel: () => void;
    userProfile: UserProfile;
}

export function ISBNScanner({ onScan, isScanning, onCancel, userProfile }: ISBNScannerProps) {
    const [isbn, setIsbn] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAiScanning, setIsAiScanning] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [showAiButton, setShowAiButton] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();
    const codeReader = useRef(new BrowserMultiFormatReader());
    const aiButtonTimer = useRef<NodeJS.Timeout | null>(null);

    const stopScan = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsProcessing(false);
        if (aiButtonTimer.current) {
            clearTimeout(aiButtonTimer.current);
            aiButtonTimer.current = null;
        }
        setShowAiButton(false);
    }, []);
    
    useEffect(() => {
        if (isScannerOpen) {
            const startScan = async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
        
                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  
                  aiButtonTimer.current = setTimeout(() => {
                      setShowAiButton(true);
                  }, 3000);

                  codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
                    if (result && !isProcessing) {
                        const code = result.getText();
                        const isIsbn = /^\d{10}$|^\d{13}$/.test(code.replace(/[-\s]/g, ''));
                        if (!isIsbn) {
                            // Not a valid ISBN format, ignore and keep scanning
                            return;
                        }

                        setIsProcessing(true);
                        stopScan();
                        const { error } = await onScan(code);
                        if (!error) {
                            setIsScannerOpen(false);
                        } else {
                            setIsProcessing(false); // Ready for another scan attempt
                        }
                    }
                  });
                }
              } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                  variant: 'destructive',
                  title: 'Camera Access Denied',
                  description: 'Please enable camera permissions in your browser settings to use this app.',
                });
                setIsScannerOpen(false);
              }
            };
        
            startScan();
        } else {
            stopScan();
        }

        return () => {
            stopScan();
        };
    }, [isScannerOpen, stopScan, toast, onScan, isProcessing]);

    const handleAiScan = async () => {
        if (!videoRef.current) return;
        setIsAiScanning(true);
        setShowAiButton(false);

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not capture image from camera.' });
            setIsAiScanning(false);
            return;
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/jpeg');

        try {
            const result = await extractIsbnFromImage({ imageDataUri });
            if (result.isbn) {
                stopScan();
                const { error } = await onScan(result.isbn);
                 if (!error) {
                    setIsScannerOpen(false);
                }
            } else {
                toast({ variant: 'destructive', title: 'No ISBN Found', description: 'Could not find an ISBN in the image. Please try again.' });
            }
        } catch (e) {
            console.error("AI Scan Error:", e);
            toast({ variant: 'destructive', title: 'AI Scan Failed', description: 'An unexpected error occurred during the AI scan.' });
        } finally {
            setIsAiScanning(false);
            setIsProcessing(false);
        }
    };


    const handleDialogOpen = (open: boolean) => {
        if (open) {
            setIsProcessing(false);
            setIsScannerOpen(true);
        } else {
            setIsScannerOpen(false);
            if (!isProcessing) {
              onCancel();
            }
        }
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
                        <Button type="submit" disabled={isScanning || !isbn.trim() || (userProfile?.credits < 1)} className="min-w-[100px]">
                            {isScanning ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Fetch
                                </>
                            )}
                        </Button>
                         <Button type="button" variant="outline" onClick={() => handleDialogOpen(true)} disabled={isScanning || (userProfile?.credits < 1)}>
                            <Camera className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Dialog open={isScannerOpen} onOpenChange={handleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan ISBN</DialogTitle>
                        <DialogDescription>
                            Point your camera at the book's barcode or the ISBN text.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                        <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2/3 h-1/3 border-4 border-red-500 rounded-lg shadow-lg" />
                        </div>
                        {hasCameraPermission === false && (
                             <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter className="sm:justify-between gap-2">
                        <div className="flex-grow">
                        {(showAiButton || isAiScanning) && (
                            <Button variant="outline" onClick={handleAiScan} disabled={isAiScanning || isProcessing}>
                                {isAiScanning ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <Wand2 className="mr-2" />
                                )}
                                Find ISBN with AI
                            </Button>
                        )}
                        </div>
                        <Button variant="outline" onClick={() => handleDialogOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
