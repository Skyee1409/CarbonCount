import React from 'react';
import { CalculateInput } from '@/validators/schemas';
import WelcomeStep from './steps/WelcomeStep';
import TravelStep from './steps/TravelStep';
import EnergyStep from './steps/EnergyStep';
import DietStep from './steps/DietStep';
import WasteStep from './steps/WasteStep';

interface OnboardingWizardProps {
  showWizard: boolean;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  finishOnboarding: () => void;
  calculatorData: CalculateInput;
  updateCalculatorValue: <K extends keyof CalculateInput>(key: K, value: CalculateInput[K]) => void;
  scannerState: 'default' | 'scanning' | 'success';
  scannedKwh: number | null;
  scannedFileName: string | null;
  handleFileDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetScanner: (e: React.MouseEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function OnboardingWizard({
  showWizard,
  currentStep,
  nextStep,
  prevStep,
  finishOnboarding,
  calculatorData,
  updateCalculatorValue,
  scannerState,
  scannedKwh,
  scannedFileName,
  handleFileDrop,
  handleFileChange,
  handleResetScanner,
  fileInputRef
}: OnboardingWizardProps) {
  return (
    <section className={`onboarding-overlay ${showWizard ? 'active' : ''}`}>
      <div className="onboarding-card glass-panel">
        <div className="onboarding-header">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              id="onboarding-progress"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
          <div className="steps-indicator">
            {[1, 2, 3, 4, 5].map(step => (
              <span
                key={step}
                className={`step-dot ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
                data-step={step}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {currentStep === 1 && <WelcomeStep nextStep={nextStep} />}
        {currentStep === 2 && (
          <TravelStep
            calculatorData={calculatorData}
            updateCalculatorValue={updateCalculatorValue}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )}
        {currentStep === 3 && (
          <EnergyStep
            calculatorData={calculatorData}
            updateCalculatorValue={updateCalculatorValue}
            scannerState={scannerState}
            scannedKwh={scannedKwh}
            scannedFileName={scannedFileName}
            handleFileDrop={handleFileDrop}
            handleFileChange={handleFileChange}
            handleResetScanner={handleResetScanner}
            fileInputRef={fileInputRef}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )}
        {currentStep === 4 && (
          <DietStep
            calculatorData={calculatorData}
            updateCalculatorValue={updateCalculatorValue}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )}
        {currentStep === 5 && (
          <WasteStep
            calculatorData={calculatorData}
            updateCalculatorValue={updateCalculatorValue}
            finishOnboarding={finishOnboarding}
            prevStep={prevStep}
          />
        )}
      </div>
    </section>
  );
}
