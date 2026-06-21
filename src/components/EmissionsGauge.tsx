import React from 'react';
import { getEmissionsGrade, getEmissionsRating, getEmissionsRatingDesc } from '@/utils/carbonUtils';

interface EmissionsGaugeProps {
  finalOffsetEmissionsTonnes: number;
  strokeDashoffset: number;
  gaugeColor: string;
  userMarkerPercent: number;
}

export default function EmissionsGauge({
  finalOffsetEmissionsTonnes,
  strokeDashoffset,
  gaugeColor,
  userMarkerPercent
}: EmissionsGaugeProps) {
  return (
    <div className="dashboard-card main-summary glass-panel">
      <div className="summary-top">
        <div className="heading-sub">Your Carbon Status</div>
        <h2>Carbon Footprint Score</h2>
      </div>
      <div className="gauge-center">
        <div className="gauge-outer">
          <svg className="gauge-svg" viewBox="0 0 100 100">
            <circle className="gauge-bg" cx="50" cy="50" r="40" />
            <circle
              className="gauge-value"
              cx="50"
              cy="50"
              r="40"
              strokeDasharray="251"
              strokeDashoffset={strokeDashoffset}
              stroke={gaugeColor}
            />
          </svg>
          <div className="gauge-content">
            <span className="gauge-number">{finalOffsetEmissionsTonnes.toFixed(2)}</span>
            <span className="gauge-unit">tonnes CO₂e / yr</span>
          </div>
        </div>
      </div>
      <div className="summary-footer">
        <div className="rating-badge-container">
          Grade: <span className="grade-badge">{getEmissionsGrade(finalOffsetEmissionsTonnes)}</span>
          <span className="rating-text">{getEmissionsRating(finalOffsetEmissionsTonnes)}</span>
        </div>
        <p className="rating-description">{getEmissionsRatingDesc(finalOffsetEmissionsTonnes)}</p>
        <div className="benchmark-bar">
          <div className="benchmark-marker" style={{ left: '12%' }}>
            <span className="marker-label">Target (2t)</span>
          </div>
          <div className="benchmark-marker" style={{ left: '80%' }}>
            <span className="marker-label">Average (16t)</span>
          </div>
          <div className="benchmark-progress" style={{ left: `${userMarkerPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
