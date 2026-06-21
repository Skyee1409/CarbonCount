'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Leaf, User, Award, Calculator } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useCarbonState } from '@/hooks/useCarbonState';
import { useChatbot } from '@/hooks/useChatbot';
import { useOcrScanner } from '@/hooks/useOcrScanner';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { calculateCarbon } from '@/services/api';
import { ECO_ACTIONS } from '@/components/ecoActions';
import OnboardingWizard from '@/components/OnboardingWizard';
import ChatbotWidget from '@/components/ChatbotWidget';
import LeaderboardCard from '@/components/LeaderboardCard';
import OffsetSimulator from '@/components/OffsetSimulator';
import SavingsTracker from '@/components/SavingsTracker';
import EmissionsTrend from '@/components/EmissionsTrend';
import EmissionsGauge from '@/components/EmissionsGauge';
import BreakdownChart from '@/components/BreakdownChart';
import ActionPlanner from '@/components/ActionPlanner';

export default function CarbonFlowDashboard() {
  const {
    currentStep, setCurrentStep, calculatorData, updateCalculatorValue,
    results, setCalculationResults, committedActions, toggleActionCommit,
    offsetPercent, setOffsetPercent, activeMode, setActiveMode,
    leaderboardScope, setLeaderboardScope, xp, addXp
  } = useCarbonState();

  const { isChatOpen, setIsChatOpen, chatMessages, chatInput, setChatInput, handleSendMessage } = useChatbot();
  const { scannerState, scannedKwh, scannedFileName, handleOcrFile, handleResetScanner } = useOcrScanner(updateCalculatorValue);
  const { leaderboardData, leaderboardLoading } = useLeaderboardData(activeMode, leaderboardScope);

  const [showWizard, setShowWizard] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results) setShowWizard(false);
  }, [results]);

  let savingsCo2 = 0, savingsCash = 0;
  ECO_ACTIONS.forEach(action => {
    if (committedActions[action.id]) {
      savingsCo2 += action.carbonSaving;
      savingsCash += action.cashSaving;
    }
  });

  const netAnnualEmissionsKg = Math.max(0, (results?.total_kg ?? 0) - savingsCo2);
  const finalOffsetEmissionsTonnes = (netAnnualEmissionsKg / 1000.0) * (1 - (offsetPercent / 100.0));

  const getSavingsByCategory = (cat: string) => {
    let saved = 0;
    ECO_ACTIONS.forEach(action => {
      if (action.category === cat && committedActions[action.id]) saved += action.carbonSaving;
    });
    return saved;
  };

  const catValues = {
    travel: Math.max(0, (results?.breakdown?.travel ?? 0) - getSavingsByCategory('travel')),
    energy: Math.max(0, (results?.breakdown?.energy ?? 0) - getSavingsByCategory('energy')),
    diet: Math.max(0, (results?.breakdown?.diet ?? 0) - getSavingsByCategory('diet')),
    shopping: Math.max(0, (results?.breakdown?.shopping ?? 0) - getSavingsByCategory('shopping')),
    waste: Math.max(0, (results?.breakdown?.waste ?? 0) - getSavingsByCategory('waste')),
  };

  const totalVal = Object.values(catValues).reduce((a, b) => a + b, 0);
  const strokeDashoffset = 251.2 - ((Math.min(16.0, finalOffsetEmissionsTonnes) / 16.0) * 251.2);

  let gaugeColor = 'var(--mint)';
  if (finalOffsetEmissionsTonnes <= 2.0) gaugeColor = 'var(--mint)';
  else if (finalOffsetEmissionsTonnes <= 6.0) gaugeColor = 'var(--primary)';
  else if (finalOffsetEmissionsTonnes <= 12.0) gaugeColor = 'var(--orange)';
  else gaugeColor = 'var(--red)';

  const userMarkerPercent = Math.min(100, Math.max(0, (finalOffsetEmissionsTonnes / 18.0) * 100));

  const getInsightText = () => {
    if (!selectedCategory) return "Select a category on the chart to generate smart feedback.";
    const val = catValues[selectedCategory as keyof typeof catValues] ?? 0;
    const percent = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
    const tips: Record<string, string> = {
      travel: `🚲 Travel accounts for ${percent}% of your footprint. Swap just 2 short drives weekly for a bike/walk.`,
      energy: `⚡ Home power accounts for ${percent}% of your footprint. Set your AC to 24°C and unplug vampire adapters.`,
      diet: `🥗 Diet accounts for ${percent}% of your footprint. Swap beef for poultry.`,
      shopping: `🛍️ Shopping accounts for ${percent}% of your footprint. Buy second-hand.`,
      waste: `♻️ Waste accounts for ${percent}% of your footprint. Recycle organic waste.`
    };
    return tips[selectedCategory] || "Select slices to show tips.";
  };

  const monthlyEmissionsKg = [1200, 1050, 920, 800, 750, Math.round(netAnnualEmissionsKg / 12)];

  return (
    <div className="app-container">
      <header className="app-header" role="banner">
        <h1 className="header-logo" aria-label="CarbonFlow Home">
          <Leaf className="logo-icon animate-pulse" aria-hidden="true" />
          <span className="logo-text">Carbon<span>Flow</span></span>
        </h1>
        <nav className="mode-selector" aria-label="Mode selector">
          {['personal', 'office', 'school'].map(mode => (
            <button key={mode} className={`mode-btn ${activeMode === mode ? 'active' : ''}`} onClick={() => { setActiveMode(mode); setSelectedCategory(null); }} style={{ textTransform: 'capitalize' }}>
              <User aria-hidden="true" size={16} /> {mode}
            </button>
          ))}
        </nav>
        <div className="header-profile">
          <div className="badge-icon-container"><Award className="gold-badge animate-bounce" /></div>
          <div className="profile-info"><span className="profile-name">Eco Explorer</span><span className="profile-xp">{xp} XP</span></div>
        </div>
      </header>

      <main className="app-main">
        <OnboardingWizard
          showWizard={showWizard} currentStep={currentStep}
          nextStep={() => setCurrentStep(currentStep + 1)} prevStep={() => setCurrentStep(currentStep - 1)}
          finishOnboarding={async () => {
            try {
              const res = await calculateCarbon(calculatorData);
              setCalculationResults(res);
              setOffsetPercent(0);
              setShowWizard(false);
            } catch (err) {
              setCalculationResults({ breakdown: { travel: 2200, energy: 3100, diet: 1700, shopping: 800, waste: 200 }, total_kg: 8000, total_tonnes: 8.0, rating: 'Eco-Champ', rating_desc: 'Offline calculations!', grade: 'A', national_average: 16.0, global_target: 2.0 });
              setShowWizard(false);
            }
          }}
          calculatorData={calculatorData} updateCalculatorValue={updateCalculatorValue}
          scannerState={scannerState} scannedKwh={scannedKwh} scannedFileName={scannedFileName}
          handleFileDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleOcrFile(e.dataTransfer.files[0]); }}
          handleFileChange={e => { if (e.target.files?.[0]) handleOcrFile(e.target.files[0]); }}
          handleResetScanner={handleResetScanner} fileInputRef={fileInputRef}
        />

        <section id="dashboard" className="dashboard-grid" style={{ display: results ? 'grid' : 'none' }}>
          <EmissionsGauge finalOffsetEmissionsTonnes={finalOffsetEmissionsTonnes} strokeDashoffset={strokeDashoffset} gaugeColor={gaugeColor} userMarkerPercent={userMarkerPercent} />
          <BreakdownChart selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} catValues={catValues} totalVal={totalVal} insightText={getInsightText()} />
          <SavingsTracker savingsCo2={savingsCo2} savingsCash={savingsCash} milestoneRatio={milestoneRatio} milestonePercent={milestonePercent} activeBadges={ECO_ACTIONS.filter(a => committedActions[a.id])} />
          <EmissionsTrend monthlyEmissionsKg={monthlyEmissionsKg} months={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (You)']} maxTrendVal={Math.max(...monthlyEmissionsKg, 1000)} />
          <ActionPlanner actionFilter={actionFilter} setActionFilter={setActionFilter} committedActions={committedActions} toggleActionCommit={toggleActionCommit} />
          <LeaderboardCard activeMode={activeMode} leaderboardScope={leaderboardScope} setLeaderboardScope={setLeaderboardScope} leaderboardLoading={leaderboardLoading} leaderboardData={leaderboardData} />
          <OffsetSimulator offsetPercent={offsetPercent} setOffsetPercent={setOffsetPercent} trees={Math.round((netAnnualEmissionsKg * (offsetPercent / 100.0)) / 22.0)} turbineHours={Math.round((netAnnualEmissionsKg * (offsetPercent / 100.0)) / 0.5)} offsetTonnes={(netAnnualEmissionsKg * (offsetPercent / 100.0)) / 1000.0} cost={Math.max(1, Math.round(((netAnnualEmissionsKg * (offsetPercent / 100.0)) / 1000.0) * 12.0))} handleCheckoutOffset={() => { alert(`Success! Offsetted ${offsetPercent}%. Unlocked XP bonus +200.`); addXp(200); setOffsetPercent(0); }} />
        </section>
      </main>

      {results && (
        <button className="recalc-float-btn" title="Recalculate Carbon footprint" onClick={() => { setCurrentStep(2); setShowWizard(true); }}>
          <Calculator aria-hidden="true" /><span>Recalculate</span>
        </button>
      )}

      <ChatbotWidget
        isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} chatMessages={chatMessages}
        chatInput={chatInput} setChatInput={setChatInput} handleSendMessage={handleSendMessage}
        chatMessagesEndRef={chatMessagesEndRef} chatContainerRef={chatContainerRef}
        formatMarkdownToHtml={str => {
          let html = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
          html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
          return DOMPurify.sanitize(html);
        }}
      />
      <footer className="app-footer"><p>CarbonFlow &copy; 2026. Empowering communities to target the sustainable 2.0 tonne goal. Built with React & Next.js.</p></footer>
    </div>
  );
}
