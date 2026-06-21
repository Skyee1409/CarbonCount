import React from 'react';
import { Leaf, Check } from 'lucide-react';
import { ECO_ACTIONS } from '@/components/ecoActions';

interface ActionPlannerProps {
  actionFilter: 'all' | 'travel' | 'energy' | 'diet';
  setActionFilter: (val: 'all' | 'travel' | 'energy' | 'diet') => void;
  committedActions: Record<string, boolean>;
  toggleActionCommit: (id: string, saving: number) => void;
}

export default function ActionPlanner({
  actionFilter,
  setActionFilter,
  committedActions,
  toggleActionCommit
}: ActionPlannerProps) {
  return (
    <div className="dashboard-card action-planner glass-panel">
      <div className="card-header-flex">
        <h3>Action Reduction Planner</h3>
        <div className="action-filters">
          {['all', 'travel', 'energy', 'diet'].map(filter => (
            <button
              key={filter}
              className={`tab-btn ${actionFilter === filter ? 'active' : ''}`}
              onClick={() => setActionFilter(filter as any)}
              style={{ textTransform: 'capitalize' }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="action-list scrollable">
        {ECO_ACTIONS.filter(a => actionFilter === 'all' || a.category === actionFilter).map(action => (
          <div key={action.id} className={`action-item-card ${committedActions[action.id] ? 'committed' : ''}`}>
            <div className="action-info-group">
              <div className="action-icon-badge">
                <Leaf className="action-icon" />
              </div>
              <div className="action-details">
                <span className="action-title">{action.title}</span>
                <div className="action-savings">
                  <span className="saving-co2">-{action.carbonSaving} kg CO₂/yr</span>
                  <span className="saving-cash">+${action.cashSaving}/yr</span>
                </div>
              </div>
            </div>
            <button
              className={`action-btn ${committedActions[action.id] ? 'committed' : ''}`}
              onClick={() => toggleActionCommit(action.id, action.carbonSaving)}
            >
              {committedActions[action.id] ? (
                <>
                  Committed <Check size={14} style={{ display: 'inline', marginLeft: 4 }} />
                </>
              ) : (
                'Commit'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
