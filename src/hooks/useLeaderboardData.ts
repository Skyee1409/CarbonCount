import { useState, useEffect } from 'react';
import { getLeaderboards } from '@/services/api';

export function useLeaderboardData(activeMode: string, leaderboardScope: string) {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const data = await getLeaderboards();
        if (!active) return;
        let dataset = [];
        if (leaderboardScope === 'global') {
          dataset = data.personal;
        } else {
          dataset = activeMode === 'personal' ? data.personal : data[activeMode];
        }
        setLeaderboardData(dataset || []);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        if (active) setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
    return () => {
      active = false;
    };
  }, [activeMode, leaderboardScope]);

  return {
    leaderboardData,
    leaderboardLoading
  };
}
