import React from 'react';
import { Car, Zap, Bus, Bike, ArrowLeft, ArrowRight } from 'lucide-react';
import { CalculateInput } from '@/validators/schemas';

interface TravelStepProps {
  calculatorData: CalculateInput;
  updateCalculatorValue: <K extends keyof CalculateInput>(key: K, value: CalculateInput[K]) => void;
  prevStep: () => void;
  nextStep: () => void;
}

export default function TravelStep({
  calculatorData,
  updateCalculatorValue,
  prevStep,
  nextStep
}: TravelStepProps) {
  return (
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
  );
}
