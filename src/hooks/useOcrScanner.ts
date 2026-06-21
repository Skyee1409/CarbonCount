import { useState } from 'react';
import { scanElectricityBill } from '@/services/api';

export function useOcrScanner(updateCalculatorValue: <K extends keyof any>(key: K, value: any) => void) {
  const [scannerState, setScannerState] = useState<'default' | 'scanning' | 'success'>('default');
  const [scannedKwh, setScannedKwh] = useState<number | null>(null);
  const [scannedFileName, setScannedFileName] = useState<string | null>(null);

  const handleOcrFile = async (file: File) => {
    setScannerState('scanning');
    try {
      const res = await scanElectricityBill(file);
      await new Promise(r => setTimeout(r, 2200));
      setScannerState('success');
      setScannedKwh(res.extracted_kwh);
      setScannedFileName(file.name);
      updateCalculatorValue('electricityKwh', res.extracted_kwh);
    } catch (err) {
      console.error(err);
      setScannerState('default');
      alert('OCR Scanning issue. Please enter kWh value manually.');
    }
  };

  const handleResetScanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScannerState('default');
    setScannedKwh(null);
    setScannedFileName(null);
  };

  return {
    scannerState,
    setScannerState,
    scannedKwh,
    setScannedKwh,
    scannedFileName,
    setScannedFileName,
    handleOcrFile,
    handleResetScanner
  };
}
