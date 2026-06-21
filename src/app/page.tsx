'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Leaf, User, Briefcase, GraduationCap, Award, Check, Calculator } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useCarbonState } from '@/hooks/useCarbonState';
import { calculateCarbon, scanElectricityBill, askChatbot } from '@/services/api';
import { ECO_ACTIONS, CATEGORY_COLORS } from '@/components/ecoActions';
import OnboardingWizard from '@/components/OnboardingWizard';
import ChatbotWidget from '@/components/ChatbotWidget';
import LeaderboardCard from '@/components/LeaderboardCard';
import OffsetSimulator from '@/components/OffsetSimulator';
import SavingsTracker from '@/components/SavingsTracker';
import EmissionsTrend from '@/components/EmissionsTrend';
import { getEmissionsGrade, getEmissionsRating, getEmissionsRatingDesc } from '@/utils/carbonUtils';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

export default function CarbonFlowDashboard() {
  const {
    currentStep, setCurrentStep, calculatorData, updateCalculatorValue,
    results, setCalculationResults, committedActions, toggleActionCommit,
    offsetPercent, setOffsetPercent, activeMode, setActiveMode,
    leaderboardScope, setLeaderboardScope, xp, addXp
  } = useCarbonState();

  const [showWizard, setShowWizard] = useState(true);
  const [scannerState, setScannerState] = useState<'default' | 'scanning' | 'success'>('default');
  const [scannedKwh, setScannedKwh] = useState<number | null>(null);
  const [scannedFileName, setScannedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<'all' | 'travel' | 'energy' | 'diet'>('all');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hi! I'm your CarbonFlow Eco-Assistant. Ask me any questions about saving energy, diet swaps, transport efficiency, or carbon tracking!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results) setShowWizard(false);
  }, [results]);

  useEffect(() => {
    if (chatMessagesEndRef.current) chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  let savingsCo2 = 0, savingsCash = 0;
  ECO_ACTIONS.forEach(action => {
    if (committedActions[action.id]) {
      savingsCo2 += action.carbonSaving;
      savingsCash += action.cashSaving;
    }
  });

  const baseEmissions = results?.total_kg ?? 0;
  const netAnnualEmissionsKg = Math.max(0, baseEmissions - savingsCo2);
  const netAnnualEmissionsTonnes = netAnnualEmissionsKg / 1000.0;
  const finalOffsetEmissionsTonnes = netAnnualEmissionsTonnes * (1 - (offsetPercent / 100.0));

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
      travel: `🚲 Travel accounts for ${percent}% of your footprint. Swap just 2 short drives weekly for a bike/walk to cut 100kg CO₂ and save on fuel.`,
      energy: `⚡ Home power accounts for ${percent}% of your footprint. Set your AC to 24°C and unplug vampire adapters to save ~$120/year.`,
      diet: `🥗 Diet accounts for ${percent}% of your footprint. Swapping beef for poultry or going meatless on Mondays reduces food emissions by up to 50%!`,
      shopping: `🛍️ Shopping accounts for ${percent}% of your footprint. Try buying quality, second-hand items or delay new gadget purchases to reduce raw waste.`,
      waste: `♻️ Waste accounts for ${percent}% of your footprint. Proper separation and recycling can divert organic waste from methane-producing landfills.`
    };
    return tips[selectedCategory] || "Select slices to show tips.";
  };

  const handleOcrFile = async (file: File) => {
    setScannerState('scanning');
    try {
      const res = await scanElectricityBill(file);
      await new Promise(r => setTimeout(r, 2200));
      setScannerState('success');
      setScannedKwh(res.extracted_kwh);
      setScannedFileName(file.name);
      updateCalculatorValue('electricityKwh', res.extracted_kwh);
    } catch (err) {
      console.error(err);
      setScannerState('default');
      alert('OCR Scanning issue. Please enter kWh value manually.');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msgText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: msgText }]);
    setChatMessages(prev => [...prev, { sender: 'bot', text: 'Thinking...', isTyping: true }]);
    try {
      const res = await askChatbot(msgText);
      setChatMessages(prev => [...prev.filter(m => !m.isTyping), { sender: 'bot', text: res.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev.filter(m => !m.isTyping), { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    }
  };

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
        cx="50" cy="50" r="40" fill="none"
        stroke={CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#10b981'}
        strokeWidth="12" strokeDasharray={`${strokeDash} ${strokeDashOffset}`} strokeDashoffset="0"
        transform={`rotate(${rotateAngle} 50 50)`} style={{ cursor: 'pointer' }}
        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
      />
    );
  }).filter(Boolean);

  if (donutSegments.length === 0 || totalVal === 0) {
    donutSegments.push(<circle key="placeholder" cx="50" cy="50" r="40" stroke="var(--mint)" strokeWidth="12" fill="none" />);
  }

  const offsetKgTotal = netAnnualEmissionsKg * (offsetPercent / 100.0);
  const offsetTonnes = offsetKgTotal / 1000.0;
  const activeBadges = ECO_ACTIONS.filter(a => committedActions[a.id]);

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
          <div className="profile-info">
            <span className="profile-name">Eco Explorer</span>
            <span className="profile-xp">{xp} XP</span>
          </div>
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
              setCalculationResults({ breakdown: { travel: 2200, energy: 3100, diet: 1700, shopping: 800, waste: 200 }, total_kg: 8000, total_tonnes: 8.0, rating: 'Eco-Champ', rating_desc: 'Offline calculations: Good effort!', grade: 'A', national_average: 16.0, global_target: 2.0 });
              setShowWizard(false);
            }
          }}
          calculatorData={calculatorData} updateCalculatorValue={updateCalculatorValue}
          scannerState={scannerState} scannedKwh={scannedKwh} scannedFileName={scannedFileName}
          handleFileDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleOcrFile(e.dataTransfer.files[0]); }}
          handleFileChange={e => { if (e.target.files?.[0]) handleOcrFile(e.target.files[0]); }}
          handleResetScanner={e => { e.stopPropagation(); setScannerState('default'); setScannedKwh(null); setScannedFileName(null); }}
          fileInputRef={fileInputRef}
        />

        <section id="dashboard" className="dashboard-grid" style={{ display: results ? 'grid' : 'none' }}>
          <div className="dashboard-card main-summary glass-panel">
            <div className="summary-top"><div className="heading-sub">Your Carbon Status</div><h2>Carbon Footprint Score</h2></div>
            <div className="gauge-center">
              <div className="gauge-outer">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="40" />
                  <circle className="gauge-value" cx="50" cy="50" r="40" strokeDasharray="251" strokeDashoffset={strokeDashoffset} stroke={gaugeColor} />
                </svg>
                <div className="gauge-content"><span className="gauge-number">{finalOffsetEmissionsTonnes.toFixed(2)}</span><span className="gauge-unit">tonnes CO₂e / yr</span></div>
              </div>
            </div>
            <div className="summary-footer">
              <div className="rating-badge-container">
                Grade: <span className="grade-badge">{getEmissionsGrade(finalOffsetEmissionsTonnes)}</span>
                <span className="rating-text">{getEmissionsRating(finalOffsetEmissionsTonnes)}</span>
              </div>
              <p className="rating-description">{getEmissionsRatingDesc(finalOffsetEmissionsTonnes)}</p>
              <div className="benchmark-bar">
                <div className="benchmark-marker" style={{ left: '12%' }}><span className="marker-label">Target (2t)</span></div>
                <div className="benchmark-marker" style={{ left: '80%' }}><span className="marker-label">Average (16t)</span></div>
                <div className="benchmark-progress" style={{ left: `${userMarkerPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="dashboard-card breakdown-chart glass-panel">
            <h3>Emissions Breakdown</h3>
            <p className="section-desc">Click slices below to view details and personalized adjustments.</p>
            <div className="chart-flex">
              <div className="svg-chart-container">
                <svg className="donut-svg" viewBox="0 0 100 100">{donutSegments}</svg>
                <div className="donut-center-info"><Leaf className="text-emerald" /><span id="selected-slice-lbl" style={{ textTransform: 'capitalize' }}>{selectedCategory ?? 'All Categories'}</span></div>
              </div>
              <div className="chart-legend">
                {Object.keys(catValues).map(cat => {
                  const val = catValues[cat as keyof typeof catValues];
                  if (val <= 0) return null;
                  return (
                    <div key={cat} className={`legend-item ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}>
                      <div className="legend-lbl-group">
                        <span className="legend-color" style={{ backgroundColor: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] }} />
                        <span className="legend-title" style={{ textTransform: 'capitalize' }}>{cat}</span>
                      </div>
                      <span className="legend-val">{(val / 1000).toFixed(1)}t ({totalVal > 0 ? Math.round((val / totalVal) * 100) : 0}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="category-insight-box"><Info className="insight-icon" /><span>{getInsightText()}</span></div>
          </div>

          <SavingsTracker
            savingsCo2={savingsCo2} savingsCash={savingsCash}
            milestoneRatio={milestoneRatio} milestonePercent={milestonePercent} activeBadges={activeBadges}
          />

          <EmissionsTrend
            monthlyEmissionsKg={monthlyEmissionsKg} months={months} maxTrendVal={maxTrendVal}
          />

          <div className="dashboard-card action-planner glass-panel">
            <div className="card-header-flex">
              <h3>Action Reduction Planner</h3>
              <div className="action-filters">
                {['all', 'travel', 'energy', 'diet'].map(filter => (
                  <button key={filter} className={`tab-btn ${actionFilter === filter ? 'active' : ''}`} onClick={() => setActionFilter(filter as any)} style={{ textTransform: 'capitalize' }}>{filter}</button>
                ))}
              </div>
            </div>
            <div className="action-list scrollable">
              {ECO_ACTIONS.filter(a => actionFilter === 'all' || a.category === actionFilter).map(action => (
                <div key={action.id} className={`action-item-card ${committedActions[action.id] ? 'committed' : ''}`}>
                  <div className="action-info-group">
                    <div className="action-icon-badge"><Leaf className="action-icon" /></div>
                    <div className="action-details">
                      <span className="action-title">{action.title}</span>
                      <div className="action-savings"><span className="saving-co2">-{action.carbonSaving} kg CO₂/yr</span><span className="saving-cash">+${action.cashSaving}/yr</span></div>
                    </div>
                  </div>
                  <button className={`action-btn ${committedActions[action.id] ? 'committed' : ''}`} onClick={() => toggleActionCommit(action.id, action.carbonSaving)}>
                    {committedActions[action.id] ? <>Committed <Check size={14} style={{ display: 'inline', marginLeft: 4 }} /></> : 'Commit'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <LeaderboardCard
            activeMode={activeMode} leaderboardScope={leaderboardScope}
            setLeaderboardScope={setLeaderboardScope} leaderboardLoading={leaderboardLoading} leaderboardData={leaderboardData}
          />

          <OffsetSimulator
            offsetPercent={offsetPercent} setOffsetPercent={setOffsetPercent}
            trees={Math.round(offsetKgTotal / 22.0)} turbineHours={Math.round(offsetKgTotal / 0.5)}
            offsetTonnes={offsetTonnes} cost={Math.max(1, Math.round(offsetTonnes * 12.0))}
            handleCheckoutOffset={() => { alert(`Success! Offsetted ${offsetPercent}%. Unlocked XP bonus +200.`); addXp(200); setOffsetPercent(0); }}
          />
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
