import React from 'react';

interface EmissionsTrendProps {
  monthlyEmissionsKg: number[];
  months: string[];
  maxTrendVal: number;
}

export default function EmissionsTrend({
  monthlyEmissionsKg,
  months,
  maxTrendVal
}: EmissionsTrendProps) {
  return (
    <div className="dashboard-card trend-graph glass-panel">
      <h3>Monthly Carbon Trend</h3>
      <p className="section-desc">Visual track of emissions comparing weeks or months.</p>
      <div className="bar-chart-container">
        {monthlyEmissionsKg.map((val, idx) => (
          <div key={idx} className="chart-bar-group">
            <div className="bar-wrapper" title={`${val} kg CO₂`}>
              <div className={`bar-inner ${val > 650 ? 'high-emissions' : ''}`} style={{ height: `${(val / maxTrendVal) * 100}%` }} />
            </div>
            <span className="bar-label">{months[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
