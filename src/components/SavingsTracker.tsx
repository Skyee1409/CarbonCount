import React from 'react';
import { Check, DollarSign, Award } from 'lucide-react';

interface SavingsTrackerProps {
  savingsCo2: number;
  savingsCash: number;
  milestoneRatio: string;
  milestonePercent: number;
  activeBadges: any[];
}

export default function SavingsTracker({
  savingsCo2,
  savingsCash,
  milestoneRatio,
  milestonePercent,
  activeBadges
}: SavingsTrackerProps) {
  return (
    <div className="dashboard-card double-tracker glass-panel">
      <h3>Projected reductions</h3>
      <p className="section-desc">Track details of your environmental and financial savings side-by-side.</p>
      <div className="double-stats-grid">
        <div className="stat-box co2-reduced">
          <div className="stat-header"><Check className="text-emerald" /><span>CO₂ Prevented</span></div>
          <div className="stat-number">{savingsCo2} kg</div>
          <div className="stat-label">of greenhouse gases / yr</div>
        </div>
        <div className="stat-box cash-saved">
          <div className="stat-header"><DollarSign className="text-emerald" /><span>Money Saved</span></div>
          <div className="stat-number">${savingsCash}</div>
          <div className="stat-label">estimated utility & fuel / yr</div>
        </div>
      </div>
      <div className="milestone-tracker">
        <div className="milestone-header"><span>Next Badge Milestone</span><span>{milestoneRatio}</span></div>
        <div className="progress-bar-container mini">
          <div className="progress-bar-fill" style={{ width: `${milestonePercent}%` }} />
        </div>
        <div className="badges-row-unlocked">
          {activeBadges.length > 0 ? activeBadges.map(action => (
            <div key={action.id} className="achievement-badge"><Award size={14} /> {action.badge}</div>
          )) : <div className="badge-lock-info">Commit to green actions to unlock rewards.</div>}
        </div>
      </div>
    </div>
  );
}
