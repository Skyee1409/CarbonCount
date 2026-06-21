import React from 'react';
import { ShoppingBag, ShoppingCart, Store, Recycle, Trash2, Flame, ArrowLeft, Sparkles } from 'lucide-react';
import { CalculateInput } from '@/validators/schemas';

interface WasteStepProps {
  calculatorData: CalculateInput;
  updateCalculatorValue: <K extends keyof CalculateInput>(key: K, value: CalculateInput[K]) => void;
  finishOnboarding: () => void;
  prevStep: () => void;
}

export default function WasteStep({
  calculatorData,
  updateCalculatorValue,
  finishOnboarding,
  prevStep
}: WasteStepProps) {
  return (
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
  );
}
