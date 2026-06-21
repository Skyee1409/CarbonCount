import { useState, useEffect } from 'react';
import { CalculateInput } from '../validators/schemas';

const STORAGE_KEY = 'carbonflow_state_next';

export interface CalculationResult {
  breakdown: {
    travel: number;
    energy: number;
    diet: number;
    shopping: number;
    waste: number;
  };
  total_kg: number;
  total_tonnes: number;
  rating: string;
  rating_desc: string;
  grade: string;
  national_average: number;
  global_target: number;
}

export function useCarbonState() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [calculatorData, setCalculatorData] = useState<CalculateInput>({
    travelType: 'petrol_car',
    travelKm: 80,
    flightHours: 4,
    electricityKwh: 250,
    acHours: 15,
    gasKwh: 100,
    dietType: 'meat_heavy',
    shoppingLevel: 'medium',
    wasteType: 'moderate',
  });
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [committedActions, setCommittedActions] = useState<Record<string, boolean>>({});
  const [offsetPercent, setOffsetPercent] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<string>('personal');
  const [leaderboardScope, setLeaderboardScope] = useState<string>('team');
  const [xp, setXp] = useState<number>(420);

  // Sync state from storage initially
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.calculatorData) setCalculatorData(saved.calculatorData);
        if (saved.results) setResults(saved.results);
        if (saved.committedActions) setCommittedActions(saved.committedActions);
        if (saved.xp !== undefined) setXp(saved.xp);
      } catch (e) {
        console.error('Failed to parse carbon state from storage', e);
      }
    }
  }, []);

  // Save changes to storage
  const saveState = (
    newCalc: CalculateInput,
    newResults: CalculationResult | null,
    newCommits: Record<string, boolean>,
    newXp: number
  ) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        calculatorData: newCalc,
        results: newResults,
        committedActions: newCommits,
        xp: newXp,
      })
    );
  };

  const updateCalculatorValue = <K extends keyof CalculateInput>(key: K, value: CalculateInput[K]) => {
    setCalculatorData((prev) => {
      const updated = { ...prev, [key]: value };
      saveState(updated, results, committedActions, xp);
      return updated;
    });
  };

  const setCalculationResults = (newResults: CalculationResult) => {
    setResults(newResults);
    saveState(calculatorData, newResults, committedActions, xp);
  };

  const toggleActionCommit = (actionId: string, carbonSaving: number) => {
    setCommittedActions((prev) => {
      const updated = { ...prev };
      let xpChange = 0;
      if (updated[actionId]) {
        delete updated[actionId];
        xpChange = -50;
      } else {
        updated[actionId] = true;
        xpChange = 100;
      }
      const newXp = Math.max(0, xp + xpChange);
      setXp(newXp);
      saveState(calculatorData, results, updated, newXp);
      return updated;
    });
  };

  const addXp = (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    saveState(calculatorData, results, committedActions, newXp);
  };

  return {
    currentStep,
    setCurrentStep,
    calculatorData,
    updateCalculatorValue,
    results,
    setCalculationResults,
    committedActions,
    toggleActionCommit,
    offsetPercent,
    setOffsetPercent,
    activeMode,
    setActiveMode,
    leaderboardScope,
    setLeaderboardScope,
    xp,
    addXp,
  };
}
