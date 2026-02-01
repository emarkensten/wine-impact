'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { useClimate } from '@/context/ClimateContext';
import { getProductByBarcode } from '@/lib/api';
import {
  Camera,
  X,
  Loader2,
  AlertCircle,
  ScanLine,
} from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { addProduct } = useClimate();

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
    setIsScanning(false);
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      await stopScanner();
      setIsLoading(true);
      setError(null);

      try {
        const product = await getProductByBarcode(decodedText);
        if (product) {
          addProduct(product);
          handleClose();
        } else {
          setError(`Streckkod ${decodedText} hittades inte i produktkatalogen. Testa att söka på produktnamnet istället.`);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Kunde inte hämta produktinformation.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [stopScanner, addProduct, handleClose]
  );

  const startScanner = useCallback(async () => {
    setError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('barcode-reader');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.5,
        },
        handleScanSuccess,
        () => {} // Ignore scan failures
      );

      setIsScanning(true);
    } catch (e) {
      console.error('Scanner error:', e);
      setError('Kunde inte starta kameran. Kontrollera att du har gett tillgång.');
    }
  }, [handleScanSuccess]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Skanna streckkod
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-[3/2] rounded-2xl overflow-hidden bg-black">
          <div id="barcode-reader" className="w-full h-full" />

          {/* Scan Overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-eco-green rounded-tl" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-eco-green rounded-tr" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-eco-green rounded-bl" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-eco-green rounded-br" />

              {/* Scan line animation */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2">
                <div className="h-0.5 bg-eco-green/50 animate-pulse" />
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-eco-green" />
                <p className="text-sm">Hämtar produkt...</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-white/70">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ScanLine className="w-4 h-4" />
            <p className="text-sm">Rikta kameran mot streckkoden</p>
          </div>
          <p className="text-xs">EAN-koden finns oftast på baksidan</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-destructive/20 rounded-xl text-white max-w-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-destructive" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 pb-8">
        <Button
          variant="outline"
          className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleClose}
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
}
