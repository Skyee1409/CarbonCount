import React from 'react';
import { Zap } from 'lucide-react';

interface LeaderboardCardProps {
  activeMode: string;
  leaderboardScope: string;
  setLeaderboardScope: (scope: string) => void;
  leaderboardLoading: boolean;
  leaderboardData: any[];
}

export default function LeaderboardCard({
  activeMode,
  leaderboardScope,
  setLeaderboardScope,
  leaderboardLoading,
  leaderboardData
}: LeaderboardCardProps) {

  const renderChallengeAlert = () => {
    if (activeMode === 'personal') return null;
    const challengeText = activeMode === 'office'
      ? { title: 'Corporate Office Challenge: Commute Less Week', desc: 'Walk or bike to work twice this week. Top department wins team credits!' }
      : { title: 'Active Challenge: Green Campus Month', desc: 'Eat vegetarian lunches 3 times/week to gain bonus group points!' };

    return (
      <div className="org-challenge-alert" id="org-challenge-box">
        <Zap className="text-orange animate-bounce" size={16} />
        <div>
          <strong>{challengeText.title}</strong>
          <p>{challengeText.desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-card leaderboard-card glass-panel" id="card-leaderboard">
      <div className="card-header-flex">
        <h3 id="lbl-leaderboard-title">
          {activeMode === 'personal'
            ? 'Personal Global Leaderboard'
            : activeMode === 'office'
            ? 'Corporate Division Leaderboard'
            : 'Campus Classroom Leaderboard'}
        </h3>
        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab-btn ${leaderboardScope === 'team' ? 'active' : ''}`}
            id="lb-team-tab"
            onClick={() => setLeaderboardScope('team')}
          >
            {activeMode === 'personal' ? 'Top Friends' : activeMode === 'office' ? 'Departments' : 'Classrooms'}
          </button>
          <button
            className={`leaderboard-tab-btn ${leaderboardScope === 'global' ? 'active' : ''}`}
            id="lb-global-tab"
            onClick={() => setLeaderboardScope('global')}
          >
            Overall Players
          </button>
        </div>
      </div>

      {renderChallengeAlert()}

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th className="text-right">CO₂ Reduced</th>
            <th className="text-right">Points / XP</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardLoading ? (
            <tr>
              <td colSpan={4}>Loading scoreboard standings...</td>
            </tr>
          ) : leaderboardData.length > 0 ? (
            leaderboardData.map((row, idx) => {
              const isUser = row.name.includes('You') || row.name === 'You (Current Profile)';
              return (
                <tr key={idx} className={isUser ? 'highlighted' : ''}>
                  <td><strong>#{row.rank}</strong></td>
                  <td>{row.name}</td>
                  <td className="text-right text-mint">{row.emissions_reduction}</td>
                  <td className="text-right">{row.points ?? 0} pts</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="text-red">Error loading standings. Offline fallback active.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
