import React from 'react';
import {
  Globe,
  ArrowRight,
  Car,
  Zap,
  Bus,
  Bike,
  ArrowLeft,
  Scan,
  FileText,
  CheckCircle,
  Beef,
  Drumstick,
  Egg,
  Salad,
  ShoppingBag,
  ShoppingCart,
  Store,
  Recycle,
  Trash2,
  Flame,
  Sparkles
} from 'lucide-react';
import { CalculateInput } from '@/validators/schemas';

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

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="onboarding-step-content active" id="step-1">
            <Globe className="welcome-icon text-emerald" />
            <h2>Let&apos;s Discover Your Environmental Impact</h2>
            <p className="welcome-lead">Before you can reduce your carbon footprint, we need to calculate your current emissions. This will take less than 2 minutes!</p>
            <button className="btn btn-primary" onClick={nextStep}>
              Get Started <ArrowRight />
            </button>
          </div>
        )}

        {/* Step 2: Travel */}
        {currentStep === 2 && (
          <div className="onboarding-step-content active" id="step-2">
            <h2>1. How do you Travel?</h2>
            <p className="step-desc">Transportation accounts for 27% of greenhouse gas emissions. Tell us how you get around.</p>

            <div className="selector-grid" role="radiogroup" aria-label="Transit modes">
              <div
                className={`selector-option ${calculatorData.travelType === 'petrol_car' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('travelType', 'petrol_car')}
                role="radio"
                aria-checked={calculatorData.travelType === 'petrol_car'}
                tabIndex={0}
                aria-label="Petrol Car option"
              >
                <Car aria-hidden="true" />
                <span>Petrol Car</span>
              </div>
              <div
                className={`selector-option ${calculatorData.travelType === 'ev_car' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('travelType', 'ev_car')}
                role="radio"
                aria-checked={calculatorData.travelType === 'ev_car'}
                tabIndex={0}
                aria-label="Electric EV option"
              >
                <Zap aria-hidden="true" />
                <span>Electric EV</span>
              </div>
              <div
                className={`selector-option ${calculatorData.travelType === 'public_transit' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('travelType', 'public_transit')}
                role="radio"
                aria-checked={calculatorData.travelType === 'public_transit'}
                tabIndex={0}
                aria-label="Bus or Train option"
              >
                <Bus aria-hidden="true" />
                <span>Bus/Train</span>
              </div>
              <div
                className={`selector-option ${calculatorData.travelType === 'bike_walk' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('travelType', 'bike_walk')}
                role="radio"
                aria-checked={calculatorData.travelType === 'bike_walk'}
                tabIndex={0}
                aria-label="Walk or Bike option"
              >
                <Bike aria-hidden="true" />
                <span>Walk/Bike</span>
              </div>
            </div>

            <div
              className="form-group"
              id="group-travel-km"
              style={{
                opacity: calculatorData.travelType === 'bike_walk' ? 0.4 : 1,
                pointerEvents: calculatorData.travelType === 'bike_walk' ? 'none' : 'all'
              }}
            >
              <label htmlFor="input-travel-km">Weekly Distance (Kilometers)</label>
              <div className="slider-container">
                <input
                  type="range"
                  id="input-travel-km"
                  min="0"
                  max="500"
                  value={calculatorData.travelKm}
                  onChange={e => updateCalculatorValue('travelKm', Number(e.target.value))}
                />
                <span className="slider-bubble" id="val-travel-km">{calculatorData.travelKm} km</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="input-flights">Annual Flight Hours</label>
              <div className="slider-container">
                <input
                  type="range"
                  id="input-flights"
                  min="0"
                  max="50"
                  value={calculatorData.flightHours}
                  onChange={e => updateCalculatorValue('flightHours', Number(e.target.value))}
                />
                <span className="slider-bubble" id="val-flights">{calculatorData.flightHours} hours</span>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight /></button>
            </div>
          </div>
        )}

        {/* Step 3: Home Energy */}
        {currentStep === 3 && (
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
        )}

        {/* Step 4: Diet */}
        {currentStep === 4 && (
          <div className="onboarding-step-content active" id="step-4">
            <h2>3. What is your Diet?</h2>
            <p className="step-desc">Agriculture, especially livestock, is a massive carbon driver. Choose your closest eating pattern.</p>

            <div className="selector-grid vertical" role="radiogroup" aria-label="Dietary choices">
              <div
                className={`selector-option vertical ${calculatorData.dietType === 'meat_heavy' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('dietType', 'meat_heavy')}
                role="radio"
                aria-checked={calculatorData.dietType === 'meat_heavy'}
                tabIndex={0}
                aria-label="Meat Heavy diet description"
              >
                <div className="option-header">
                  <Beef className="meat-red" aria-hidden="true" />
                  <strong>Meat-Heavy</strong>
                </div>
                <p className="option-sub">Eat beef, pork, or lamb almost daily. (~2,900 kg CO₂e/yr)</p>
              </div>
              <div
                className={`selector-option vertical ${calculatorData.dietType === 'balanced' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('dietType', 'balanced')}
                role="radio"
                aria-checked={calculatorData.dietType === 'balanced'}
                tabIndex={0}
                aria-label="Balanced diet description"
              >
                <div className="option-header">
                  <Drumstick className="meat-white" aria-hidden="true" />
                  <strong>Balanced</strong>
                </div>
                <p className="option-sub">Eat meat, poultry, and fish in moderation. (~1,700 kg CO₂e/yr)</p>
              </div>
              <div
                className={`selector-option vertical ${calculatorData.dietType === 'vegetarian' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('dietType', 'vegetarian')}
                role="radio"
                aria-checked={calculatorData.dietType === 'vegetarian'}
                tabIndex={0}
                aria-label="Vegetarian diet description"
              >
                <div className="option-header">
                  <Egg className="text-orange" aria-hidden="true" />
                  <strong>Vegetarian</strong>
                </div>
                <p className="option-sub">No meat, but eat eggs and dairy. (~1,200 kg CO₂e/yr)</p>
              </div>
              <div
                className={`selector-option vertical ${calculatorData.dietType === 'vegan' ? 'active' : ''}`}
                onClick={() => updateCalculatorValue('dietType', 'vegan')}
                role="radio"
                aria-checked={calculatorData.dietType === 'vegan'}
                tabIndex={0}
                aria-label="Vegan diet description"
              >
                <div className="option-header">
                  <Salad className="text-emerald" aria-hidden="true" />
                  <strong>Vegan</strong>
                </div>
                <p className="option-sub">100% plant-based diet. (~800 kg CO₂e/yr)</p>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
              <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight /></button>
            </div>
          </div>
        )}

        {/* Step 5: Lifestyle & Waste */}
        {currentStep === 5 && (
          <div className="onboarding-step-content active" id="step-5">
            <h2>4. Lifestyle & Waste Habits</h2>
            <p className="step-desc">Purchasing goods and sending waste to landfills also contributes to overall greenhouse gases.</p>

            <div className="form-group">
              <label>Consumption Level (Clothes, Gadgets, Packages)</label>
              <div className="selector-grid" role="radiogroup" aria-label="Consumption Level">
                <div
                  className={`selector-option ${calculatorData.shoppingLevel === 'low' ? 'active' : ''}`}
                  onClick={() => updateCalculatorValue('shoppingLevel', 'low')}
                  role="radio"
                  aria-checked={calculatorData.shoppingLevel === 'low'}
                  tabIndex={0}
                  aria-label="Minimalist consumption"
                >
                  <ShoppingBag className="text-mint" aria-hidden="true" />
                  <span>Minimalist</span>
                </div>
                <div
                  className={`selector-option ${calculatorData.shoppingLevel === 'medium' ? 'active' : ''}`}
                  onClick={() => updateCalculatorValue('shoppingLevel', 'medium')}
                  role="radio"
                  aria-checked={calculatorData.shoppingLevel === 'medium'}
                  tabIndex={0}
                  aria-label="Moderate consumption"
                >
                  <ShoppingCart className="text-emerald" aria-hidden="true" />
                  <span>Moderate</span>
                </div>
                <div
                  className={`selector-option ${calculatorData.shoppingLevel === 'high' ? 'active' : ''}`}
                  onClick={() => updateCalculatorValue('shoppingLevel', 'high')}
                  role="radio"
                  aria-checked={calculatorData.shoppingLevel === 'high'}
                  tabIndex={0}
                  aria-label="Frequent consumption"
                >
                  <Store className="text-red" aria-hidden="true" />
                  <span>Frequent</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Waste Recycling habits</label>
              <div className="selector-grid" role="radiogroup" aria-label="Recycling habits">
                <div
                  className={`selector-option ${calculatorData.wasteType === 'zero_waste' ? 'active' : ''}`}
                  onClick={() => updateCalculatorValue('wasteType', 'zero_waste')}
                  role="radio"
                  aria-checked={calculatorData.wasteType === 'zero_waste'}
                  tabIndex={0}
                  aria-label="Diligent recycling"
                >
                  <Recycle className="text-mint" aria-hidden="true" />
                  <span>Diligent</span>
                </div>
                <div
                  className={`selector-option ${calculatorData.wasteType === 'moderate' ? 'active' : ''}`}
                  onClick={() => updateCalculatorValue('wasteType', 'moderate')}
                  role="radio"
                  aria-checked={calculatorData.wasteType === 'moderate'}
                  tabIndex={0}
                  aria-label="Occasional recycling"
                >
                  <Trash2 className="text-emerald" aria-hidden="true" />
                  <span>Occasional</span>
                </div>
                <div
                  className={`selector-option ${calculatorData.wasteType === 'unrecycled' ? 'active' : ''}`}
                  onClick={() => updateCalculatorValue('wasteType', 'unrecycled')}
                  role="radio"
                  aria-checked={calculatorData.wasteType === 'unrecycled'}
                  tabIndex={0}
                  aria-label="No Recycling"
                >
                  <Flame className="text-red" aria-hidden="true" />
                  <span>No Recycling</span>
                </div>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
              <button className="btn btn-primary" onClick={finishOnboarding}>
                <Sparkles /> Calculate Footprint
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
