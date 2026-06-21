import React from 'react';
import { Leaf, Info } from 'lucide-react';
import { CATEGORY_COLORS } from '@/components/ecoActions';

interface BreakdownChartProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  catValues: Record<string, number>;
  totalVal: number;
  insightText: string;
}

export default function BreakdownChart({
  selectedCategory,
  setSelectedCategory,
  catValues,
  totalVal,
  insightText
}: BreakdownChartProps) {
  let cumulatedPercent = 0;
  const donutSegments = Object.entries(catValues).map(([cat, val]) => {
    if (val <= 0 || totalVal <= 0) return null;
    const percent = val / totalVal;
    const strokeDash = percent * 251.3;
    const strokeDashOffset = 251.3 - strokeDash;
    const rotateAngle = (cumulatedPercent * 360) - 90;
    cumulatedPercent += percent;

    return (
      <circle
        key={cat}
        className={`donut-segment ${selectedCategory === cat ? 'active' : selectedCategory ? 'inactive' : ''}`}
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#10b981'}
        strokeWidth="12"
        strokeDasharray={`${strokeDash} ${strokeDashOffset}`}
        strokeDashoffset="0"
        transform={`rotate(${rotateAngle} 50 50)`}
        style={{ cursor: 'pointer' }}
        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
      />
    );
  }).filter(Boolean);

  if (donutSegments.length === 0 || totalVal === 0) {
    donutSegments.push(
      <circle
        key="placeholder"
        cx="50"
        cy="50"
        r="40"
        stroke="var(--mint)"
        strokeWidth="12"
        fill="none"
      />
    );
  }

  return (
    <div className="dashboard-card breakdown-chart glass-panel">
      <h3>Emissions Breakdown</h3>
      <p className="section-desc">Click slices below to view details and personalized adjustments.</p>
      <div className="chart-flex">
        <div className="svg-chart-container">
          <svg className="donut-svg" viewBox="0 0 100 100">
            {donutSegments}
          </svg>
          <div className="donut-center-info">
            <Leaf className="text-emerald" />
            <span id="selected-slice-lbl" style={{ textTransform: 'capitalize' }}>
              {selectedCategory ?? 'All Categories'}
            </span>
          </div>
        </div>
        <div className="chart-legend">
          {Object.keys(catValues).map(cat => {
            const val = catValues[cat];
            if (val <= 0) return null;
            return (
              <div
                key={cat}
                className={`legend-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              >
                <div className="legend-lbl-group">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] }}
                  />
                  <span className="legend-title" style={{ textTransform: 'capitalize' }}>
                    {cat}
                  </span>
                </div>
                <span className="legend-val">
                  {(val / 1000).toFixed(1)}t ({totalVal > 0 ? Math.round((val / totalVal) * 100) : 0}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="category-insight-box">
        <Info className="insight-icon" />
        <span>{insightText}</span>
      </div>
    </div>
  );
}
