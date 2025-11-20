
import React, { useEffect, useRef, useState } from 'react';

// Type definition for the global library
declare const Html5QrcodeScanner: any;

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize scanner
    try {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText: string) => {
          // Success
          scanner.clear();
          onScan(decodedText);
        },
        (errorMessage: string) => {
          // Parse error, ignore usually
        }
      );

      scannerRef.current = scanner;
    } catch (e) {
      console.error("Failed to init scanner", e);
      setError("Could not initialize camera. Please ensure camera permissions are granted.");
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          console.error("Error clearing scanner", e);
        }
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 bg-emerald-600 flex justify-between items-center text-white">
            <h3 className="font-bold text-lg">Scan Product Barcode</h3>
            <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="p-4 bg-black">
            <div id="reader" className="w-full bg-gray-800 rounded-lg overflow-hidden"></div>
        </div>

        {error && (
            <div className="p-4 text-red-600 bg-red-50 dark:bg-red-900/20 text-center">
                {error}
            </div>
        )}

        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
            Point camera at a barcode to search prices automatically.
        </div>
      </div>
    </div>
  );
};
