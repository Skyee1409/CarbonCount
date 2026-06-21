'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  ArrowRight,
  Car,
  Zap,
  Bus,
  Bike,
  ArrowLeft,
  Scan,
  FileText,
  CheckCircle,
  Beef,
  Drumstick,
  Egg,
  Salad,
  ShoppingBag,
  ShoppingCart,
  Store,
  Recycle,
  Trash2,
  Flame,
  Sparkles,
  Info,
  DollarSign,
  Trees,
  Wind,
  Calculator,
  MessageSquare,
  Bot,
  X,
  Send,
  Check
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useCarbonState } from '@/hooks/useCarbonState';
import { calculateCarbon, scanElectricityBill, askChatbot, getLeaderboards } from '@/services/api';

interface EcoAction {
  id: string;
  title: string;
  category: string;
  carbonSaving: number;
  cashSaving: number;
  desc: string;
  icon: string;
  badge: string;
}

const ECO_ACTIONS: EcoAction[] = [
  {
    id: 'action_led',
    title: 'Switch to LED Bulbs',
    category: 'energy',
    carbonSaving: 150,
    cashSaving: 60,
    desc: 'Swap traditional incandescent bulbs with energy-efficient LED alternatives.',
    icon: 'zap',
    badge: 'LED Wizard'
  },
  {
    id: 'action_bike',
    title: 'Commute by Bicycle',
    category: 'travel',
    carbonSaving: 500,
    cashSaving: 350,
    desc: 'Ride a bicycle or walk for short commuting trips under 8 km.',
    icon: 'bike',
    badge: 'Commuter Hero'
  },
  {
    id: 'action_ac_temp',
    title: 'Set AC to 24°C (75°F)',
    category: 'energy',
    carbonSaving: 200,
    cashSaving: 80,
    desc: 'Raise AC thermostatic temp setting during summer to lower compressor runtime.',
    icon: 'thermometer-sun',
    badge: 'Climate Cooler'
  },
  {
    id: 'action_meatless',
    title: 'Meatless Mondays',
    category: 'diet',
    carbonSaving: 400,
    cashSaving: 150,
    desc: 'Replace meat-heavy dishes with healthy plant-based foods once a week.',
    icon: 'salad',
    badge: 'Plant Champion'
  },
  {
    id: 'action_cold_wash',
    title: 'Cold Water Wash Only',
    category: 'energy',
    carbonSaving: 75,
    cashSaving: 30,
    desc: 'Wash clothing laundry at 30°C/cold setting to save water-heating electricity.',
    icon: 'droplet',
    badge: 'H2O Savior'
  },
  {
    id: 'action_unplug',
    title: 'Cut Vampire Power Load',
    category: 'energy',
    carbonSaving: 100,
    cashSaving: 45,
    desc: 'Unplug adapters and computers when not in active use, or use smart strips.',
    icon: 'power',
    badge: 'Phantom Slayer'
  }
];

const CATEGORY_COLORS = {
  travel: '#10b981',    // Emerald
  energy: '#34d399',    // Mint
  diet: '#f59e0b',      // Orange
  shopping: '#8ea69a',  // Muted Slate
  waste: '#ef4444'      // Red
};

interface Message {
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

export default function CarbonFlowDashboard() {
  const {
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
    addXp
  } = useCarbonState();

  // Wizard popup active state
  const [showWizard, setShowWizard] = useState(true);

  // Scanner state
  const [scannerState, setScannerState] = useState<'default' | 'scanning' | 'success'>('default');
  const [scannedKwh, setScannedKwh] = useState<number | null>(null);
  const [scannedFileName, setScannedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Donut segment selection state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Action Filter Tab state
  const [actionFilter, setActionFilter] = useState<'all' | 'travel' | 'energy' | 'diet'>('all');

  // Leaderboard data states
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi! I'm your CarbonFlow Eco-Assistant. Ask me any questions about saving energy, diet swaps, transport efficiency, or carbon tracking!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to hide wizard if results exist
  useEffect(() => {
    if (results) {
      setShowWizard(false);
    }
  }, [results]);

  // Fetch leaderboard data when view mode changes
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

  // Chat scroll to bottom
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Dynamic calculations
  let savingsCo2 = 0;
  let savingsCash = 0;
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

  // Milestones
  const committedCount = ECO_ACTIONS.filter(a => committedActions[a.id]).length;
  const milestoneRatio = `${committedCount} of ${ECO_ACTIONS.length} Committed`;
  const milestonePercent = (committedCount / ECO_ACTIONS.length) * 100;

  // Category values for donut chart
  const getSavingsByCategory = (cat: string) => {
    let saved = 0;
    ECO_ACTIONS.forEach(action => {
      if (action.category === cat && committedActions[action.id]) {
        saved += action.carbonSaving;
      }
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

  // Speedometer details
  const maxVal = 16.0;
  const boundedEmissions = Math.min(maxVal, finalOffsetEmissionsTonnes);
  const speedometerPercentage = boundedEmissions / maxVal;
  const strokeDashoffset = 251.2 - (speedometerPercentage * 251.2);

  let gaugeColor = 'var(--mint)';
  if (finalOffsetEmissionsTonnes <= 2.0) {
    gaugeColor = 'var(--mint)';
  } else if (finalOffsetEmissionsTonnes <= 6.0) {
    gaugeColor = 'var(--primary)';
  } else if (finalOffsetEmissionsTonnes <= 12.0) {
    gaugeColor = 'var(--orange)';
  } else {
    gaugeColor = 'var(--red)';
  }

  const userMarkerPercent = Math.min(100, Math.max(0, (finalOffsetEmissionsTonnes / 18.0) * 100));

  // Dynamic carbon grade/rating description
  const getEmissionsGrade = (t: number) => {
    if (t <= 2.0) return 'A+';
    if (t <= 5.0) return 'A';
    if (t <= 10.0) return 'B';
    if (t <= 16.0) return 'C';
    return 'D';
  };

  const getEmissionsRating = (t: number) => {
    if (t <= 2.0) return 'Climate Hero';
    if (t <= 5.0) return 'Eco-Champ';
    if (t <= 10.0) return 'Conscious Citizen';
    if (t <= 16.0) return 'Carbon Consumer';
    return 'High Impact';
  };

  const getEmissionsRatingDesc = (t: number) => {
    if (t <= 2.0) return 'Outstanding! Your footprint meets the sustainable global target to keep warming below 1.5°C.';
    if (t <= 5.0) return 'Great job! You are well below average and taking meaningful green steps.';
    if (t <= 10.0) return 'Good effort, but you still have potential areas where you can reduce emissions.';
    if (t <= 16.0) return "Your carbon footprint is around the national average. Let's look at ways to cut back.";
    return 'Your carbon emissions are higher than average. Focus on the recommended actions below.';
  };

  // Trend Chart Monthly data June You
  const juneEmissions = Math.round(netAnnualEmissionsKg / 12);
  const monthlyEmissionsKg = [1200, 1050, 920, 800, 750, juneEmissions];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (You)'];
  const maxTrendVal = Math.max(...monthlyEmissionsKg, 1000);

  // Category Insights Tips generator
  const getInsightText = () => {
    if (!selectedCategory) {
      return "Select a category on the chart to generate smart feedback.";
    }
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

  // Onboarding controllers
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = async () => {
    try {
      const res = await calculateCarbon(calculatorData);
      setCalculationResults(res);
      setOffsetPercent(0);
      setShowWizard(false);
    } catch (err) {
      console.error(err);
      alert('Could not calculate carbon footprint. Using estimated offline metrics instead.');
      setCalculationResults({
        breakdown: { travel: 2200, energy: 3100, diet: 1700, shopping: 800, waste: 200 },
        total_kg: 8000,
        total_tonnes: 8.0,
        rating: 'Eco-Champ',
        rating_desc: 'Offline calculations: Good effort, you are well below national average!',
        grade: 'A',
        national_average: 16.0,
        global_target: 2.0
      });
      setShowWizard(false);
    }
  };

  const openRecalculateWizard = () => {
    setCurrentStep(2);
    setShowWizard(true);
  };

  // Drag-Drop OCR events
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleOcrFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleOcrFile(e.target.files[0]);
    }
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
      alert('OCR Scanning issue. Please enter kWh value manually below.');
    }
  };

  const handleResetScanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScannerState('default');
    setScannedKwh(null);
    setScannedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Offset Simulator values
  const offsetKgTotal = netAnnualEmissionsKg * (offsetPercent / 100.0);
  const offsetTonnes = offsetKgTotal / 1000.0;
  const trees = Math.round(offsetKgTotal / 22.0);
  const turbineHours = Math.round(offsetKgTotal / 0.5);
  const cost = Math.max(1, Math.round(offsetTonnes * 12.0));

  const handleCheckoutOffset = () => {
    alert(`Success! You have offsetted ${offsetPercent}% of your emissions. Unlocked XP bonus +200.`);
    addXp(200);
    setOffsetPercent(0);
  };

  // Chat message send handler
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msgText = chatInput.trim();
    setChatInput('');

    setChatMessages(prev => [...prev, { sender: 'user', text: msgText }]);
    setChatMessages(prev => [...prev, { sender: 'bot', text: 'Thinking...', isTyping: true }]);

    try {
      const res = await askChatbot(msgText);
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { sender: 'bot', text: res.reply }];
      });
    } catch (err) {
      console.error(err);
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Try again later!" }];
      });
    }
  };

  const formatMarkdownToHtml = (str: string) => {
    let html = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');

    return DOMPurify.sanitize(html);
  };

  // Action Icon renderer mapping
  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="action-icon" />;
      case 'bike': return <Bike className="action-icon" />;
      case 'salad': return <Salad className="action-icon" />;
      case 'droplet': return <CheckCircle className="action-icon text-mint" />;
      case 'power': return <Zap className="action-icon" />;
      default: return <Leaf className="action-icon" />;
    }
  };

  // SVG Donut Slices calculation
  let cumulatedPercent = 0;
  const donutSegments = Object.entries(catValues).map(([cat, val]) => {
    if (val <= 0 || totalVal <= 0) return null;
    const percent = val / totalVal;
    const strokeDash = percent * 251.3;
    const strokeDashOffset = 251.3 - strokeDash;
    const rotateAngle = (cumulatedPercent * 360) - 90;
    cumulatedPercent += percent;

    const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#10b981';
    const isActive = selectedCategory === cat;

    return (
      <circle
        key={cat}
        className={`donut-segment ${isActive ? 'active' : selectedCategory ? 'inactive' : ''}`}
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={color}
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

  // Challenge alerts switcher
  const renderChallengeAlert = () => {
    if (activeMode === 'personal') return null;
    const challengeText = activeMode === 'office'
      ? { title: 'Corporate Office Challenge: Commute Less Week', desc: 'Walk or bike to work twice this week. Top department wins team credits!' }
      : { title: 'Active Challenge: Green Campus Month', desc: 'Eat vegetarian lunches 3 times/week to gain bonus group points!' };

    return (
      <div className="org-challenge-alert" id="org-challenge-box">
        <Zap className="text-orange animate-bounce" />
        <div>
          <strong>{challengeText.title}</strong>
          <p>{challengeText.desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header" role="banner">
        <h1 className="header-logo" aria-label="CarbonFlow Home">
          <Leaf className="logo-icon animate-pulse" aria-hidden="true" />
          <span className="logo-text">Carbon<span>Flow</span></span>
        </h1>

        <nav className="mode-selector" aria-label="Mode selector">
          <button
            className={`mode-btn ${activeMode === 'personal' ? 'active' : ''}`}
            id="btn-personal"
            onClick={() => {
              setActiveMode('personal');
              setSelectedCategory(null);
            }}
            aria-label="Switch to Personal Mode"
          >
            <User aria-hidden="true" size={16} /> Personal
          </button>
          <button
            className={`mode-btn ${activeMode === 'office' ? 'active' : ''}`}
            id="btn-office"
            onClick={() => {
              setActiveMode('office');
              setSelectedCategory(null);
            }}
            aria-label="Switch to Office Team Mode"
          >
            <Briefcase aria-hidden="true" size={16} /> Office Team
          </button>
          <button
            className={`mode-btn ${activeMode === 'school' ? 'active' : ''}`}
            id="btn-school"
            onClick={() => {
              setActiveMode('school');
              setSelectedCategory(null);
            }}
            aria-label="Switch to School Campus Mode"
          >
            <GraduationCap aria-hidden="true" size={16} /> School Campus
          </button>
        </nav>

        <div className="header-profile">
          <div className="badge-icon-container">
            <Award className="gold-badge animate-bounce" />
          </div>
          <div className="profile-info">
            <span className="profile-name">Eco Explorer</span>
            <span className="profile-xp" id="profile-xp-val">{xp} XP</span>
          </div>
        </div>
      </header>

      {/* Main Main Workspace */}
      <main className="app-main">
        {/* Onboarding Overlay */}
        <section className={`onboarding-overlay ${showWizard ? 'active' : ''}`}>
          <div className="onboarding-card glass-panel">
            <div className="onboarding-header">
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  id="onboarding-progress"
                  style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                />
              </div>
              <div className="steps-indicator">
                {[1, 2, 3, 4, 5].map(step => (
                  <span
                    key={step}
                    className={`step-dot ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
                    data-step={step}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="onboarding-step-content active" id="step-1">
                <Globe className="welcome-icon text-emerald" />
                <h2>Let&apos;s Discover Your Environmental Impact</h2>
                <p className="welcome-lead">Before you can reduce your carbon footprint, we need to calculate your current emissions. This will take less than 2 minutes!</p>
                <button className="btn btn-primary" onClick={nextStep}>
                  Get Started <ArrowRight />
                </button>
              </div>
            )}

            {/* Step 2: Travel */}
            {currentStep === 2 && (
              <div className="onboarding-step-content active" id="step-2">
                <h2>1. How do you Travel?</h2>
                <p className="step-desc">Transportation accounts for 27% of greenhouse gas emissions. Tell us how you get around.</p>

                <div className="selector-grid" role="radiogroup" aria-label="Transit modes">
                  <div
                    className={`selector-option ${calculatorData.travelType === 'petrol_car' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('travelType', 'petrol_car')}
                    role="radio"
                    aria-checked={calculatorData.travelType === 'petrol_car'}
                    tabIndex={0}
                    aria-label="Petrol Car option"
                  >
                    <Car aria-hidden="true" />
                    <span>Petrol Car</span>
                  </div>
                  <div
                    className={`selector-option ${calculatorData.travelType === 'ev_car' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('travelType', 'ev_car')}
                    role="radio"
                    aria-checked={calculatorData.travelType === 'ev_car'}
                    tabIndex={0}
                    aria-label="Electric EV option"
                  >
                    <Zap aria-hidden="true" />
                    <span>Electric EV</span>
                  </div>
                  <div
                    className={`selector-option ${calculatorData.travelType === 'public_transit' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('travelType', 'public_transit')}
                    role="radio"
                    aria-checked={calculatorData.travelType === 'public_transit'}
                    tabIndex={0}
                    aria-label="Bus or Train option"
                  >
                    <Bus aria-hidden="true" />
                    <span>Bus/Train</span>
                  </div>
                  <div
                    className={`selector-option ${calculatorData.travelType === 'bike_walk' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('travelType', 'bike_walk')}
                    role="radio"
                    aria-checked={calculatorData.travelType === 'bike_walk'}
                    tabIndex={0}
                    aria-label="Walk or Bike option"
                  >
                    <Bike aria-hidden="true" />
                    <span>Walk/Bike</span>
                  </div>
                </div>

                <div
                  className="form-group"
                  id="group-travel-km"
                  style={{
                    opacity: calculatorData.travelType === 'bike_walk' ? 0.4 : 1,
                    pointerEvents: calculatorData.travelType === 'bike_walk' ? 'none' : 'all'
                  }}
                >
                  <label htmlFor="input-travel-km">Weekly Distance (Kilometers)</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      id="input-travel-km"
                      min="0"
                      max="500"
                      value={calculatorData.travelKm}
                      onChange={e => updateCalculatorValue('travelKm', Number(e.target.value))}
                    />
                    <span className="slider-bubble" id="val-travel-km">{calculatorData.travelKm} km</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="input-flights">Annual Flight Hours</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      id="input-flights"
                      min="0"
                      max="50"
                      value={calculatorData.flightHours}
                      onChange={e => updateCalculatorValue('flightHours', Number(e.target.value))}
                    />
                    <span className="slider-bubble" id="val-flights">{calculatorData.flightHours} hours</span>
                  </div>
                </div>

                <div className="step-nav">
                  <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
                  <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight /></button>
                </div>
              </div>
            )}

            {/* Step 3: Home Energy */}
            {currentStep === 3 && (
              <div className="onboarding-step-content active" id="step-3">
                <h2>2. Home Energy Consumption</h2>
                <p className="step-desc">Powering homes makes up nearly 20% of emissions. Scan a bill or type estimation manually.</p>

                <div className="bill-scanner-box">
                  <div
                    className="scanner-dropzone"
                    id="bill-dropzone"
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => {
                      if (scannerState === 'default') fileInputRef.current?.click();
                    }}
                  >
                    {scannerState === 'default' && (
                      <div className="dropzone-default">
                        <Scan className="scanner-icon animate-pulse" />
                        <p className="dropzone-text">Drag & Drop Electricity Bill here or <span className="text-emerald">browse files</span></p>
                        <span className="file-hint">Simulate OCR scan (PNG, JPG, PDF)</span>
                      </div>
                    )}
                    {scannerState === 'scanning' && (
                      <div className="dropzone-scanning" id="dropzone-scanning">
                        <div className="scan-laser"></div>
                        <FileText className="text-emerald" />
                        <p>Extracting kWh values from document...</p>
                      </div>
                    )}
                    {scannerState === 'success' && (
                      <div className="dropzone-success" id="dropzone-success">
                        <CheckCircle className="text-mint" />
                        <p id="scan-result-text">
                          Extracted <strong>{scannedKwh} kWh</strong> from <em>{scannedFileName}</em>!
                        </p>
                        <button className="btn-text-only" onClick={handleResetScanner}>Rescan</button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="bill-file-input"
                    className="hidden"
                    accept="image/*,application/pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>

                <div className="manual-inputs-grid">
                  <div className="form-group">
                    <label htmlFor="input-electricity">Electricity / Month (kWh)</label>
                    <input
                      type="number"
                      id="input-electricity"
                      min="0"
                      value={calculatorData.electricityKwh}
                      onChange={e => updateCalculatorValue('electricityKwh', Number(e.target.value))}
                      placeholder="e.g. 250"
                      aria-label="Monthly electricity usage in kilowatt hours"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="input-ac-hours">Weekly AC Usage (Hours)</label>
                    <input
                      type="number"
                      id="input-ac-hours"
                      min="0"
                      value={calculatorData.acHours}
                      onChange={e => updateCalculatorValue('acHours', Number(e.target.value))}
                      placeholder="e.g. 15"
                      aria-label="Weekly air conditioner usage hours"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="input-gas">Gas Heating / Month (kWh)</label>
                    <input
                      type="number"
                      id="input-gas"
                      min="0"
                      value={calculatorData.gasKwh}
                      onChange={e => updateCalculatorValue('gasKwh', Number(e.target.value))}
                      placeholder="e.g. 100"
                      aria-label="Monthly gas usage in kilowatt hours"
                    />
                  </div>
                </div>

                <div className="step-nav">
                  <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
                  <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight /></button>
                </div>
              </div>
            )}

            {/* Step 4: Diet */}
            {currentStep === 4 && (
              <div className="onboarding-step-content active" id="step-4">
                <h2>3. What is your Diet?</h2>
                <p className="step-desc">Agriculture, especially livestock, is a massive carbon driver. Choose your closest eating pattern.</p>

                <div className="selector-grid vertical" role="radiogroup" aria-label="Dietary choices">
                  <div
                    className={`selector-option vertical ${calculatorData.dietType === 'meat_heavy' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('dietType', 'meat_heavy')}
                    role="radio"
                    aria-checked={calculatorData.dietType === 'meat_heavy'}
                    tabIndex={0}
                    aria-label="Meat Heavy diet description"
                  >
                    <div className="option-header">
                      <Beef className="meat-red" aria-hidden="true" />
                      <strong>Meat-Heavy</strong>
                    </div>
                    <p className="option-sub">Eat beef, pork, or lamb almost daily. (~2,900 kg CO₂e/yr)</p>
                  </div>
                  <div
                    className={`selector-option vertical ${calculatorData.dietType === 'balanced' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('dietType', 'balanced')}
                    role="radio"
                    aria-checked={calculatorData.dietType === 'balanced'}
                    tabIndex={0}
                    aria-label="Balanced diet description"
                  >
                    <div className="option-header">
                      <Drumstick className="meat-white" aria-hidden="true" />
                      <strong>Balanced</strong>
                    </div>
                    <p className="option-sub">Eat meat, poultry, and fish in moderation. (~1,700 kg CO₂e/yr)</p>
                  </div>
                  <div
                    className={`selector-option vertical ${calculatorData.dietType === 'vegetarian' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('dietType', 'vegetarian')}
                    role="radio"
                    aria-checked={calculatorData.dietType === 'vegetarian'}
                    tabIndex={0}
                    aria-label="Vegetarian diet description"
                  >
                    <div className="option-header">
                      <Egg className="text-orange" aria-hidden="true" />
                      <strong>Vegetarian</strong>
                    </div>
                    <p className="option-sub">No meat, but eat eggs and dairy. (~1,200 kg CO₂e/yr)</p>
                  </div>
                  <div
                    className={`selector-option vertical ${calculatorData.dietType === 'vegan' ? 'active' : ''}`}
                    onClick={() => updateCalculatorValue('dietType', 'vegan')}
                    role="radio"
                    aria-checked={calculatorData.dietType === 'vegan'}
                    tabIndex={0}
                    aria-label="Vegan diet description"
                  >
                    <div className="option-header">
                      <Salad className="text-emerald" aria-hidden="true" />
                      <strong>Vegan</strong>
                    </div>
                    <p className="option-sub">100% plant-based diet. (~800 kg CO₂e/yr)</p>
                  </div>
                </div>

                <div className="step-nav">
                  <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
                  <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight /></button>
                </div>
              </div>
            )}

            {/* Step 5: Lifestyle & Waste */}
            {currentStep === 5 && (
              <div className="onboarding-step-content active" id="step-5">
                <h2>4. Lifestyle & Waste Habits</h2>
                <p className="step-desc">Purchasing goods and sending waste to landfills also contributes to overall greenhouse gases.</p>

                <div className="form-group">
                  <label>Consumption Level (Clothes, Gadgets, Packages)</label>
                  <div className="selector-grid" role="radiogroup" aria-label="Consumption Level">
                    <div
                      className={`selector-option ${calculatorData.shoppingLevel === 'low' ? 'active' : ''}`}
                      onClick={() => updateCalculatorValue('shoppingLevel', 'low')}
                      role="radio"
                      aria-checked={calculatorData.shoppingLevel === 'low'}
                      tabIndex={0}
                      aria-label="Minimalist consumption"
                    >
                      <ShoppingBag className="text-mint" aria-hidden="true" />
                      <span>Minimalist</span>
                    </div>
                    <div
                      className={`selector-option ${calculatorData.shoppingLevel === 'medium' ? 'active' : ''}`}
                      onClick={() => updateCalculatorValue('shoppingLevel', 'medium')}
                      role="radio"
                      aria-checked={calculatorData.shoppingLevel === 'medium'}
                      tabIndex={0}
                      aria-label="Moderate consumption"
                    >
                      <ShoppingCart className="text-emerald" aria-hidden="true" />
                      <span>Moderate</span>
                    </div>
                    <div
                      className={`selector-option ${calculatorData.shoppingLevel === 'high' ? 'active' : ''}`}
                      onClick={() => updateCalculatorValue('shoppingLevel', 'high')}
                      role="radio"
                      aria-checked={calculatorData.shoppingLevel === 'high'}
                      tabIndex={0}
                      aria-label="Frequent consumption"
                    >
                      <Store className="text-red" aria-hidden="true" />
                      <span>Frequent</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Waste Recycling habits</label>
                  <div className="selector-grid" role="radiogroup" aria-label="Recycling habits">
                    <div
                      className={`selector-option ${calculatorData.wasteType === 'zero_waste' ? 'active' : ''}`}
                      onClick={() => updateCalculatorValue('wasteType', 'zero_waste')}
                      role="radio"
                      aria-checked={calculatorData.wasteType === 'zero_waste'}
                      tabIndex={0}
                      aria-label="Diligent recycling"
                    >
                      <Recycle className="text-mint" aria-hidden="true" />
                      <span>Diligent</span>
                    </div>
                    <div
                      className={`selector-option ${calculatorData.wasteType === 'moderate' ? 'active' : ''}`}
                      onClick={() => updateCalculatorValue('wasteType', 'moderate')}
                      role="radio"
                      aria-checked={calculatorData.wasteType === 'moderate'}
                      tabIndex={0}
                      aria-label="Occasional recycling"
                    >
                      <Trash2 className="text-emerald" aria-hidden="true" />
                      <span>Occasional</span>
                    </div>
                    <div
                      className={`selector-option ${calculatorData.wasteType === 'unrecycled' ? 'active' : ''}`}
                      onClick={() => updateCalculatorValue('wasteType', 'unrecycled')}
                      role="radio"
                      aria-checked={calculatorData.wasteType === 'unrecycled'}
                      tabIndex={0}
                      aria-label="No Recycling"
                    >
                      <Flame className="text-red" aria-hidden="true" />
                      <span>No Recycling</span>
                    </div>
                  </div>
                </div>

                <div className="step-nav">
                  <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft /> Back</button>
                  <button className="btn btn-primary" onClick={finishOnboarding}>
                    <Sparkles /> Calculate Footprint
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Dashboard Grid */}
        <section
          id="dashboard"
          className="dashboard-grid"
          style={{ display: results ? 'grid' : 'none' }}
        >
          {/* Carbon Gauge Panel */}
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
                    id="gauge-fill-circle"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray="251"
                    strokeDashoffset={strokeDashoffset}
                    stroke={gaugeColor}
                  />
                </svg>
                <div className="gauge-content">
                  <span className="gauge-number" id="dashboard-total-tonnes">
                    {finalOffsetEmissionsTonnes.toFixed(2)}
                  </span>
                  <span className="gauge-unit">tonnes CO₂e / yr</span>
                </div>
              </div>
            </div>

            <div className="summary-footer">
              <div className="rating-badge-container">
                Grade: <span className="grade-badge" id="dashboard-grade">{getEmissionsGrade(finalOffsetEmissionsTonnes)}</span>
                <span className="rating-text" id="dashboard-rating">{getEmissionsRating(finalOffsetEmissionsTonnes)}</span>
              </div>
              <p className="rating-description" id="dashboard-rating-desc">
                {getEmissionsRatingDesc(finalOffsetEmissionsTonnes)}
              </p>
              <div className="benchmark-bar">
                <div className="benchmark-marker" style={{ left: '12%' }} title="Sustainable Target (2.0t)">
                  <span className="marker-label">Target (2t)</span>
                </div>
                <div className="benchmark-marker" style={{ left: '80%' }} title="National Average (16.0t)">
                  <span className="marker-label">Average (16t)</span>
                </div>
                <div
                  className="benchmark-progress"
                  id="benchmark-user-pos"
                  style={{ left: `${userMarkerPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Emissions Breakdown Chart Card */}
          <div className="dashboard-card breakdown-chart glass-panel">
            <h3>Emissions Breakdown</h3>
            <p className="section-desc">Click slices below to view details and personalized adjustments.</p>

            <div className="chart-flex">
              <div className="svg-chart-container">
                <svg className="donut-svg" id="donut-chart" viewBox="0 0 100 100">
                  {donutSegments}
                </svg>
                <div className="donut-center-info">
                  <Leaf className="text-emerald" />
                  <span id="selected-slice-lbl" style={{ textTransform: 'capitalize' }}>
                    {selectedCategory ?? 'All Categories'}
                  </span>
                </div>
              </div>

              <div className="chart-legend" id="chart-legend">
                {Object.keys(catValues).map(cat => {
                  const val = catValues[cat as keyof typeof catValues];
                  if (val <= 0) return null;
                  const percent = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
                  const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
                  const isActive = selectedCategory === cat;

                  return (
                    <div
                      key={cat}
                      className={`legend-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    >
                      <div className="legend-lbl-group">
                        <span className="legend-color" style={{ backgroundColor: color }} />
                        <span className="legend-title" style={{ textTransform: 'capitalize' }}>{cat}</span>
                      </div>
                      <span className="legend-val">{(val / 1000).toFixed(1)}t ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Alert Box */}
            <div className="category-insight-box" id="category-insight">
              <Info className="insight-icon" />
              <span id="category-insight-text">{getInsightText()}</span>
            </div>
          </div>

          {/* Double Impact Counter */}
          <div className="dashboard-card double-tracker glass-panel">
            <h3>Projected reductions</h3>
            <p className="section-desc">Track details of your environmental and financial savings side-by-side.</p>

            <div className="double-stats-grid">
              <div className="stat-box co2-reduced">
                <div className="stat-header">
                  <Check className="text-emerald" />
                  <span>CO₂ Prevented</span>
                </div>
                <div className="stat-number" id="stats-co2-prevented">{savingsCo2} kg</div>
                <div className="stat-label">of greenhouse gases / yr</div>
              </div>
              <div className="stat-box cash-saved">
                <div className="stat-header">
                  <DollarSign className="text-emerald" />
                  <span>Money Saved</span>
                </div>
                <div className="stat-number" id="stats-cash-saved">${savingsCash}</div>
                <div className="stat-label">estimated utility & fuel / yr</div>
              </div>
            </div>

            <div className="milestone-tracker">
              <div className="milestone-header">
                <span>Next Badge Milestone</span>
                <span id="milestone-ratio">{milestoneRatio}</span>
              </div>
              <div className="progress-bar-container mini">
                <div
                  className="progress-bar-fill"
                  id="milestone-progress"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>
              <div className="badges-row-unlocked" id="dashboard-badges">
                {activeBadges.length > 0 ? (
                  activeBadges.map(action => (
                    <div key={action.id} className="achievement-badge">
                      <Award size={14} /> {action.badge}
                    </div>
                  ))
                ) : (
                  <div className="badge-lock-info">Commit to green actions to unlock rewards.</div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Carbon trend Graph Card */}
          <div className="dashboard-card trend-graph glass-panel">
            <h3>Monthly Carbon Trend</h3>
            <p className="section-desc">Visual track of emissions comparing weeks or months.</p>

            <div className="bar-chart-container" id="trend-bar-chart">
              {monthlyEmissionsKg.map((val, idx) => {
                const heightPercent = (val / maxTrendVal) * 100;
                const isHigh = val > 650;
                return (
                  <div key={idx} className="chart-bar-group">
                    <div className="bar-wrapper" title={`${val} kg CO₂`}>
                      <div
                        className={`bar-inner ${isHigh ? 'high-emissions' : ''}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="bar-label">{months[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action reduction plan card */}
          <div className="dashboard-card action-planner glass-panel">
            <div className="card-header-flex">
              <h3>Action Reduction Planner</h3>
              <div className="action-filters">
                <button
                  className={`tab-btn ${actionFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActionFilter('all')}
                >
                  All
                </button>
                <button
                  className={`tab-btn ${actionFilter === 'travel' ? 'active' : ''}`}
                  onClick={() => setActionFilter('travel')}
                >
                  Travel
                </button>
                <button
                  className={`tab-btn ${actionFilter === 'energy' ? 'active' : ''}`}
                  onClick={() => setActionFilter('energy')}
                >
                  Energy
                </button>
                <button
                  className={`tab-btn ${actionFilter === 'diet' ? 'active' : ''}`}
                  onClick={() => setActionFilter('diet')}
                >
                  Diet
                </button>
              </div>
            </div>
            <div className="action-list scrollable" id="action-list-container">
              {ECO_ACTIONS.filter(a => actionFilter === 'all' || a.category === actionFilter).map(action => {
                const isCommitted = committedActions[action.id];
                return (
                  <div key={action.id} className={`action-item-card ${isCommitted ? 'committed' : ''}`}>
                    <div className="action-info-group">
                      <div className="action-icon-badge">
                        {renderActionIcon(action.icon)}
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
                      className={`action-btn ${isCommitted ? 'committed' : ''}`}
                      onClick={() => toggleActionCommit(action.id, action.carbonSaving)}
                    >
                      {isCommitted ? (
                        <>
                          Committed <Check size={14} style={{ display: 'inline', marginLeft: 4 }} />
                        </>
                      ) : (
                        'Commit'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Standings / Leaderboards card */}
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

          {/* Offset Simulator Box */}
          <div className="dashboard-card offset-box glass-panel">
            <h3>Carbon Offset Simulator</h3>
            <p className="section-desc">Simulate planting trees or funding energy to offset remaining impact.</p>

            <div className="offset-slider-group">
              <label htmlFor="offset-slider">
                Offset Percentage:{' '}
                <span id="offset-percent-lbl" className="text-emerald font-bold">
                  {offsetPercent}%
                </span>
              </label>
              <div className="slider-container">
                <input
                  type="range"
                  id="offset-slider"
                  min="0"
                  max="100"
                  value={offsetPercent}
                  onChange={e => setOffsetPercent(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="offset-illustrations">
              <div className="illustration-item">
                <div className="ill-graphic-container">
                  <Trees className="ill-icon tree-icon" />
                  <span className="ill-count" id="offset-tree-count">
                    {trees.toLocaleString()}
                  </span>
                </div>
                <span className="ill-lbl">Trees to Plant</span>
              </div>

              <div className="illustration-item">
                <div className="ill-graphic-container">
                  <Wind className="ill-icon wind-icon" />
                  <span className="ill-count" id="offset-turbine-count">
                    {turbineHours.toLocaleString()}
                  </span>
                </div>
                <span className="ill-lbl">Turbine hours funded</span>
              </div>
            </div>

            {offsetPercent > 0 && (
              <div className="offset-checkout-panel" id="offset-cta">
                <p className="checkout-detail">
                  Offsetting <span id="offset-tonnes-lbl">{offsetTonnes.toFixed(2)}</span> tonnes CO₂e costs approx.{' '}
                  <span id="offset-cost-lbl">${cost}</span>.
                </p>
                <button className="btn btn-primary sm" onClick={handleCheckoutOffset}>
                  Support Green Offsets
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Recalculate Sticky Float Button */}
      {results && (
        <button
          className="recalc-float-btn"
          title="Recalculate Carbon footprint"
          onClick={openRecalculateWizard}
          aria-label="Recalculate Carbon footprint"
        >
          <Calculator aria-hidden="true" />
          <span>Recalculate</span>
        </button>
      )}

      {/* AI Assistant Floating Widget */}
      <div className="ai-widget-container" id="ai-chat-widget">
        <button
          className="ai-chat-trigger"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Open AI Eco-Assistant Chat"
        >
          {isChatOpen ? <X id="chat-icon-trigger" aria-hidden="true" /> : <MessageSquare id="chat-icon-trigger" aria-hidden="true" />}
          {!isChatOpen && <span className="pulse-ring" aria-hidden="true"></span>}
        </button>

        <div className={`ai-chat-box glass-panel ${isChatOpen ? 'active' : ''}`} id="chat-box-container" role="dialog" aria-label="AI Eco-Assistant Panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <Bot className="chat-bot-icon text-emerald" aria-hidden="true" />
              <div>
                <h4>Eco-Assistant</h4>
                <span className="status-indicator">Online</span>
              </div>
            </div>
            <button className="close-chat-btn" onClick={() => setIsChatOpen(false)} aria-label="Close chatbot">
              <X aria-hidden="true" />
            </button>
          </div>

          <div className="chat-messages" id="chat-messages-container" aria-live="polite" ref={chatContainerRef as any}>
            {chatMessages.map((msg, index) => (
              <div key={index} className={`msg ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                {msg.isTyping ? (
                  <p className="animate-pulse">{msg.text}</p>
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(msg.text) }} />
                )}
              </div>
            ))}
            <div ref={chatMessagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              id="chat-input-field"
              placeholder="Ask a green question..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              aria-label="Type your sustainability question"
            />
            <button className="send-msg-btn" onClick={handleSendMessage} aria-label="Send message">
              <Send aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>CarbonFlow &copy; 2026. Empowering communities to target the sustainable 2.0 tonne goal. Built with React & Next.js.</p>
      </footer>
    </div>
  );
}
