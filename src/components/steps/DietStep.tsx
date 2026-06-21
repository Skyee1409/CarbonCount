import React from 'react';
import { Beef, Drumstick, Egg, Salad, ArrowLeft, ArrowRight } from 'lucide-react';
import { CalculateInput } from '@/validators/schemas';

interface DietStepProps {
  calculatorData: CalculateInput;
  updateCalculatorValue: <K extends keyof CalculateInput>(key: K, value: CalculateInput[K]) => void;
  prevStep: () => void;
  nextStep: () => void;
}

export default function DietStep({
  calculatorData,
  updateCalculatorValue,
  prevStep,
  nextStep
}: DietStepProps) {
  return (
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
  );
}
