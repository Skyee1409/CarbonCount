import React from 'react';
import { Scan, FileText, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { CalculateInput } from '@/validators/schemas';

interface EnergyStepProps {
  calculatorData: CalculateInput;
  updateCalculatorValue: <K extends keyof CalculateInput>(key: K, value: CalculateInput[K]) => void;
  scannerState: 'default' | 'scanning' | 'success';
  scannedKwh: number | null;
  scannedFileName: string | null;
  handleFileDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetScanner: (e: React.MouseEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  prevStep: () => void;
  nextStep: () => void;
}

export default function EnergyStep({
  calculatorData,
  updateCalculatorValue,
  scannerState,
  scannedKwh,
  scannedFileName,
  handleFileDrop,
  handleFileChange,
  handleResetScanner,
  fileInputRef,
  prevStep,
  nextStep
}: EnergyStepProps) {
  return (
    <div className="onboarding-step-content active" id="step-3">
      <h2>2. Home Energy Consumption</h2>
      <p className="step-desc">Powering homes makes up nearly 20% of emissions. Scan a bill or type estimation manually.</p>

      <div className="bill-scanner-box">
        <div
          className="scanner-dropzone"
          id="bill-dropzone"
          onDragOver={e => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => {
            if (scannerState === 'default') fileInputRef.current?.click();
          }}
        >
          {scannerState === 'default' && (
            <div className="dropzone-default">
              <Scan className="scanner-icon animate-pulse" />
              <p className="dropzone-text">Drag & Drop Electricity Bill here or <span className="text-emerald">browse files</span></p>
              <span className="file-hint">Simulate OCR scan (PNG, JPG, PDF)</span>
            </div>
          )}
          {scannerState === 'scanning' && (
            <div className="dropzone-scanning" id="dropzone-scanning">
              <div className="scan-laser"></div>
              <FileText className="text-emerald" />
              <p>Extracting kWh values from document...</p>
            </div>
          )}
          {scannerState === 'success' && (
            <div className="dropzone-success" id="dropzone-success">
              <CheckCircle className="text-mint" />
              <p id="scan-result-text">
                Extracted <strong>{scannedKwh} kWh</strong> from <em>{scannedFileName}</em>!
              </p>
              <button className="btn-text-only" onClick={handleResetScanner}>Rescan</button>
            </div>
          )}
        </div>
        <input
          type="file"
          id="bill-file-input"
          className="hidden"
          accept="image/*,application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="manual-inputs-grid">
        <div className="form-group">
          <label htmlFor="input-electricity">Electricity / Month (kWh)</label>
          <input
            type="number"
            id="input-electricity"
            min="0"
            value={calculatorData.electricityKwh}
            onChange={e => updateCalculatorValue('electricityKwh', Number(e.target.value))}
            placeholder="e.g. 250"
            aria-label="Monthly electricity usage in kilowatt hours"
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-ac-hours">Weekly AC Usage (Hours)</label>
          <input
            type="number"
            id="input-ac-hours"
            min="0"
            value={calculatorData.acHours}
            onChange={e => updateCalculatorValue('acHours', Number(e.target.value))}
            placeholder="e.g. 15"
            aria-label="Weekly air conditioner usage hours"
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-gas">Gas Heating / Month (kWh)</label>
          <input
            type="number"
            id="input-gas"
            min="0"
            value={calculatorData.gasKwh}
            onChange={e => updateCalculatorValue('gasKwh', Number(e.target.value))}
            placeholder="e.g. 100"
            aria-label="Monthly gas usage in kilowatt hours"
          />
        </div>
      </div>

      <div className="step-nav">
        <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
        <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight /></button>
      </div>
    </div>
  );
}
