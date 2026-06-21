import React from 'react';
import { Trees, Wind } from 'lucide-react';

interface OffsetSimulatorProps {
  offsetPercent: number;
  setOffsetPercent: (percent: number) => void;
  trees: number;
  turbineHours: number;
  offsetTonnes: number;
  cost: number;
  handleCheckoutOffset: () => void;
}

export default function OffsetSimulator({
  offsetPercent,
  setOffsetPercent,
  trees,
  turbineHours,
  offsetTonnes,
  cost,
  handleCheckoutOffset
}: OffsetSimulatorProps) {
  return (
    <div className="dashboard-card offset-box glass-panel">
      <h3>Carbon Offset Simulator</h3>
      <p className="section-desc">Simulate planting trees or funding energy to offset remaining impact.</p>

      <div className="offset-slider-group">
        <label htmlFor="offset-slider">
          Offset Percentage:{' '}
          <span id="offset-percent-lbl" className="text-emerald font-bold">
            {offsetPercent}%
          </span>
        </label>
        <div className="slider-container">
          <input
            type="range"
            id="offset-slider"
            min="0"
            max="100"
            value={offsetPercent}
            onChange={e => setOffsetPercent(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="offset-illustrations">
        <div className="illustration-item">
          <div className="ill-graphic-container">
            <Trees className="ill-icon tree-icon" />
            <span className="ill-count" id="offset-tree-count">
              {trees.toLocaleString()}
            </span>
          </div>
          <span className="ill-lbl">Trees to Plant</span>
        </div>

        <div className="illustration-item">
          <div className="ill-graphic-container">
            <Wind className="ill-icon wind-icon" />
            <span className="ill-count" id="offset-turbine-count">
              {turbineHours.toLocaleString()}
            </span>
          </div>
          <span className="ill-lbl">Turbine hours funded</span>
        </div>
      </div>

      {offsetPercent > 0 && (
        <div className="offset-checkout-panel" id="offset-cta">
          <p className="checkout-detail">
            Offsetting <span id="offset-tonnes-lbl">{offsetTonnes.toFixed(2)}</span> tonnes CO₂e costs approx.{' '}
            <span id="offset-cost-lbl">${cost}</span>.
          </p>
          <button className="btn btn-primary sm" onClick={handleCheckoutOffset}>
            Support Green Offsets
          </button>
        </div>
      )}
    </div>
  );
}
