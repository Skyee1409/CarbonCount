// ==========================================================================
// CARBONFLOW SYSTEM APPLICATION ENGINE
// ==========================================================================

// Global Application State
let appState = {
    currentStep: 1,
    totalSteps: 5,
    userProfile: {
        xp: 420,
        unlockedBadges: []
    },
    calculatorData: {
        travelType: 'petrol_car',
        travelKm: 80,
        flightHours: 4,
        electricityKwh: 250,
        acHours: 15,
        gasKwh: 100,
        dietType: 'meat_heavy',
        shoppingLevel: 'medium',
        wasteType: 'moderate'
    },
    results: null, // Populated via calculate API
    committedActions: {}, // Track committed actions (actionId: true)
    completedActions: {}, // Track completed actions (actionId: true)
    activeMode: 'personal', // personal, office, school
    leaderboardScope: 'team', // team, global
    offsetPercent: 0
};

// Default Environmental Actions Repository
const ECO_ACTIONS = [
    {
        id: 'action_led',
        title: 'Switch to LED Bulbs',
        category: 'energy',
        carbonSaving: 150, // kg CO2 / year
        cashSaving: 60, // $ / year
        desc: 'Swap traditional incandescent bulbs with energy-efficient LED alternatives.',
        icon: 'zap',
        badge: 'LED Wizard'
    },
    {
        id: 'action_bike',
        title: 'Commute by Bicycle',
        category: 'travel',
        carbonSaving: 500, // kg CO2 / year
        cashSaving: 350, // $ / year
        desc: 'Ride a bicycle or walk for short commuting trips under 8 km.',
        icon: 'bike',
        badge: 'Commuter Hero'
    },
    {
        id: 'action_ac_temp',
        title: 'Set AC to 24°C (75°F)',
        category: 'energy',
        carbonSaving: 200, // kg CO2 / year
        cashSaving: 80, // $ / year
        desc: 'Raise AC thermostatic temp setting during summer to lower compressor runtime.',
        icon: 'thermometer-sun',
        badge: 'Climate Cooler'
    },
    {
        id: 'action_meatless',
        title: 'Meatless Mondays',
        category: 'diet',
        carbonSaving: 400, // kg CO2 / year
        cashSaving: 150, // $ / year
        desc: 'Replace meat-heavy dishes with healthy plant-based foods once a week.',
        icon: 'salad',
        badge: 'Plant Champion'
    },
    {
        id: 'action_cold_wash',
        title: 'Cold Water Wash Only',
        category: 'energy',
        carbonSaving: 75, // kg CO2 / year
        cashSaving: 30, // $ / year
        desc: 'Wash clothing laundry at 30°C/cold setting to save water-heating electricity.',
        icon: 'droplet',
        badge: 'H2O Savior'
    },
    {
        id: 'action_unplug',
        title: 'Cut Vampire Power Load',
        category: 'energy',
        carbonSaving: 100, // kg CO2 / year
        cashSaving: 45, // $ / year
        desc: 'Unplug adapters and computers when not in active use, or use smart strips.',
        icon: 'power',
        badge: 'Phantom Slayer'
    }
];

// SVG color definitions for charts
const CATEGORY_COLORS = {
    travel: '#10b981',    // Emerald
    energy: '#34d399',    // Mint
    diet: '#f59e0b',      // Orange
    shopping: '#8ea69a',  // Muted Slate
    waste: '#ef4444'      // Red
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Load local storage if exists
    loadStateFromStorage();
    
    // Initialize UI icons
    lucide.createIcons();

    // Render Actions initially
    renderActionsList();
    
    // Setup Drag-Drop events for OCR Scanner
    setupOcrScanner();
    
    // If onboarding is not completed, show overlay, else show dashboard
    if (appState.results) {
        document.getElementById('onboarding-overlay').classList.remove('active');
        document.getElementById('dashboard').style.display = 'grid';
        updateDashboardView();
        loadLeaderboard();
    } else {
        updateOnboardingStep();
    }
});

// ==========================================================================
// WIZARD ONBOARDING CONTROLLERS
// ==========================================================================

function updateOnboardingStep() {
    // Hide all steps
    for (let i = 1; i <= appState.totalSteps; i++) {
        const stepDiv = document.getElementById(`step-${i}`);
        if (stepDiv) stepDiv.classList.remove('active');
    }
    
    // Show current step
    document.getElementById(`step-${appState.currentStep}`).classList.add('active');
    
    // Update step dots
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, index) => {
        const dotNum = index + 1;
        dot.classList.remove('active', 'completed');
        if (dotNum === appState.currentStep) {
            dot.classList.add('active');
        } else if (dotNum < appState.currentStep) {
            dot.classList.add('completed');
        }
    });

    // Update wizard progress line
    const progressPercent = ((appState.currentStep - 1) / (appState.totalSteps - 1)) * 100;
    document.getElementById('onboarding-progress').style.width = `${progressPercent}%`;
}

function nextStep() {
    if (appState.currentStep < appState.totalSteps) {
        // Capture inputs if advancing from input steps
        captureStepInputs();
        appState.currentStep++;
        updateOnboardingStep();
    }
}

function prevStep() {
    if (appState.currentStep > 1) {
        appState.currentStep--;
        updateOnboardingStep();
    }
}

function captureStepInputs() {
    if (appState.currentStep === 2) {
        appState.calculatorData.travelType = document.getElementById('input-travel-type').value;
        appState.calculatorData.travelKm = parseFloat(document.getElementById('input-travel-km').value);
        appState.calculatorData.flightHours = parseFloat(document.getElementById('input-flights').value);
    } else if (appState.currentStep === 3) {
        appState.calculatorData.electricityKwh = parseFloat(document.getElementById('input-electricity').value) || 0;
        appState.calculatorData.acHours = parseFloat(document.getElementById('input-ac-hours').value) || 0;
        appState.calculatorData.gasKwh = parseFloat(document.getElementById('input-gas').value) || 0;
    } else if (appState.currentStep === 4) {
        appState.calculatorData.dietType = document.getElementById('input-diet-type').value;
    } else if (appState.currentStep === 5) {
        appState.calculatorData.shoppingLevel = document.getElementById('input-shopping').value;
        appState.calculatorData.wasteType = document.getElementById('input-waste').value;
    }
}

// Selector updates
function selectTransit(el) {
    document.querySelectorAll('#step-2 .selector-option').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
    const val = el.getAttribute('data-value');
    document.getElementById('input-travel-type').value = val;
    
    // Toggle distance input visibility if Walking/Biking is chosen
    const distGroup = document.getElementById('group-travel-km');
    if (val === 'bike_walk') {
        distGroup.style.opacity = '0.4';
        distGroup.style.pointerEvents = 'none';
    } else {
        distGroup.style.opacity = '1';
        distGroup.style.pointerEvents = 'all';
    }
}

function selectDiet(el) {
    document.querySelectorAll('#step-4 .selector-option').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('input-diet-type').value = el.getAttribute('data-value');
}

function selectShopping(el) {
    document.querySelectorAll('#step-5 .selector-option[data-value="low"], #step-5 .selector-option[data-value="medium"], #step-5 .selector-option[data-value="high"]').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('input-shopping').value = el.getAttribute('data-value');
}

function selectWaste(el) {
    document.querySelectorAll('#step-5 .selector-option[data-value="zero_waste"], #step-5 .selector-option[data-value="moderate"], #step-5 .selector-option[data-value="unrecycled"]').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('input-waste').value = el.getAttribute('data-value');
}

function updateSliderVal(el) {
    const bubbleId = `val-${el.id.replace('input-', '')}`;
    const bubble = document.getElementById(bubbleId);
    if (bubble) {
        const unit = el.id === 'input-flights' ? 'hours' : 'km';
        bubble.innerText = `${el.value} ${unit}`;
    }
}

// Submit data & close wizard
async function finishOnboarding() {
    captureStepInputs();
    
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appState.calculatorData)
        });
        
        if (!response.ok) throw new Error('API Calculation failed');
        
        const res = await response.json();
        appState.results = res;
        
        // Hide overlay, display dashboard
        document.getElementById('onboarding-overlay').classList.remove('active');
        document.getElementById('dashboard').style.display = 'grid';
        
        // Reset offset slider
        appState.offsetPercent = 0;
        document.getElementById('offset-slider').value = 0;
        simulateOffset(0);

        saveStateToStorage();
        updateDashboardView();
        loadLeaderboard();
        
    } catch (err) {
        console.error(err);
        alert('Could not calculate carbon footprint. Using estimated offline metrics instead.');
        loadMockOfflineResults();
    }
}

function openRecalculateWizard() {
    appState.currentStep = 2; // Jump straight to input page
    
    // Repopulate inputs from state
    document.getElementById('input-travel-km').value = appState.calculatorData.travelKm;
    document.getElementById('val-travel-km').innerText = `${appState.calculatorData.travelKm} km`;
    document.getElementById('input-flights').value = appState.calculatorData.flightHours;
    document.getElementById('val-flights').innerText = `${appState.calculatorData.flightHours} hours`;
    document.getElementById('input-electricity').value = appState.calculatorData.electricityKwh;
    document.getElementById('input-ac-hours').value = appState.calculatorData.acHours;
    document.getElementById('input-gas').value = appState.calculatorData.gasKwh;
    
    // Update selectors active state
    document.querySelectorAll('#step-2 .selector-option').forEach(opt => {
        if (opt.getAttribute('data-value') === appState.calculatorData.travelType) selectTransit(opt);
    });
    document.querySelectorAll('#step-4 .selector-option').forEach(opt => {
        if (opt.getAttribute('data-value') === appState.calculatorData.dietType) selectDiet(opt);
    });
    document.querySelectorAll('#step-5 .selector-option[data-value]').forEach(opt => {
        if (opt.getAttribute('data-value') === appState.calculatorData.shoppingLevel) selectShopping(opt);
        if (opt.getAttribute('data-value') === appState.calculatorData.wasteType) selectWaste(opt);
    });
    
    document.getElementById('onboarding-overlay').classList.add('active');
    updateOnboardingStep();
}

// Offline fallback
function loadMockOfflineResults() {
    appState.results = {
        breakdown: { travel: 2200, energy: 3100, diet: 1700, shopping: 800, waste: 200 },
        total_kg: 8000,
        total_tonnes: 8.0,
        rating: 'Eco-Champ',
        rating_desc: 'Offline calculations: Good effort, you are well below national average!',
        grade: 'A',
        national_average: 16.0,
        global_target: 2.0
    };
    document.getElementById('onboarding-overlay').classList.remove('active');
    document.getElementById('dashboard').style.display = 'grid';
    updateDashboardView();
    loadLeaderboard();
}

// ==========================================================================
// SIMULATED OCR BILL SCANNER
// ==========================================================================

function setupOcrScanner() {
    const dropzone = document.getElementById('bill-dropzone');
    const fileInput = document.getElementById('bill-file-input');
    
    if (!dropzone || !fileInput) return;

    // Trigger click on click
    dropzone.addEventListener('click', () => {
        // Only trigger click if not currently scanning or completed
        if (document.getElementById('dropzone-scanning').classList.contains('hidden') && 
            document.getElementById('dropzone-success').classList.contains('hidden')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleOcrFile(e.target.files[0]);
        }
    });

    // Drag-drop events
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--mint)';
        dropzone.style.background = 'rgba(52, 211, 153, 0.05)';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'rgba(16, 185, 129, 0.25)';
        dropzone.style.background = 'rgba(16, 185, 129, 0.02)';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'rgba(16, 185, 129, 0.25)';
        dropzone.style.background = 'rgba(16, 185, 129, 0.02)';
        
        if (e.dataTransfer.files.length > 0) {
            handleOcrFile(e.dataTransfer.files[0]);
        }
    });
}

async function handleOcrFile(file) {
    const dropzoneDefault = document.querySelector('.dropzone-default');
    const dropzoneScanning = document.getElementById('dropzone-scanning');
    const dropzoneSuccess = document.getElementById('dropzone-success');
    const resultText = document.getElementById('scan-result-text');
    
    // Toggle UI: show scanning
    dropzoneDefault.classList.add('hidden');
    dropzoneScanning.classList.remove('hidden');
    
    // Prepare FormData
    const formData = new FormData();
    formData.append('billFile', file);
    formData.append('fileName', file.name);

    try {
        const response = await fetch('/api/scan-bill', {
            method: 'POST',
            body: formData
        });
        
        // Wait at least 2.2s for scanning effect to finish nicely
        await new Promise(r => setTimeout(r, 2200));

        if (!response.ok) throw new Error('OCR Scan failed');
        const res = await response.json();
        
        // Hide scanning, show success
        dropzoneScanning.classList.add('hidden');
        dropzoneSuccess.classList.remove('hidden');
        resultText.innerHTML = `Extracted <strong>${res.extracted_kwh} kWh</strong> from <em>${file.name}</em>!`;
        
        // Automatically populate input field!
        document.getElementById('input-electricity').value = res.extracted_kwh;
        
    } catch (err) {
        console.error(err);
        dropzoneScanning.classList.add('hidden');
        dropzoneDefault.classList.remove('hidden');
        alert('OCR Scanning issue. Please enter kWh value manually below.');
    }
}

function resetScanner(e) {
    e.stopPropagation();
    document.getElementById('dropzone-success').classList.add('hidden');
    document.querySelector('.dropzone-default').classList.remove('hidden');
    document.getElementById('bill-file-input').value = '';
}

// ==========================================================================
// DYNAMIC DASHBOARD VIEWS & UPDATE
// ==========================================================================

function updateDashboardView() {
    if (!appState.results) return;
    
    // Calculate total net emissions after subtracting completed actions & adding offsets
    const currentBaseEmissions = appState.results.total_kg;
    let savingsCo2 = 0;
    let savingsCash = 0;
    
    // Sum committed actions
    ECO_ACTIONS.forEach(action => {
        if (appState.committedActions[action.id]) {
            savingsCo2 += action.carbonSaving;
            savingsCash += action.cashSaving;
        }
    });

    const netAnnualEmissionsKg = Math.max(0, currentBaseEmissions - savingsCo2);
    const netAnnualEmissionsTonnes = netAnnualEmissionsKg / 1000.0;
    const finalOffsetEmissionsTonnes = netAnnualEmissionsTonnes * (1 - (appState.offsetPercent / 100.0));
    
    // Update Score Badge & Speedometer
    document.getElementById('dashboard-total-tonnes').innerText = finalOffsetEmissionsTonnes.toFixed(2);
    document.getElementById('dashboard-grade').innerText = getEmissionsGrade(finalOffsetEmissionsTonnes);
    document.getElementById('dashboard-rating').innerText = getEmissionsRating(finalOffsetEmissionsTonnes);
    document.getElementById('dashboard-rating-desc').innerText = getEmissionsRatingDesc(finalOffsetEmissionsTonnes);

    // Speedometer Stroke calculation (circumference is 251.2)
    // 0 tonnes = fill dashoffset 251 (green)
    // 16 tonnes (average) or more = fill dashoffset 0 (red)
    const maxVal = 16.0;
    const boundedEmissions = Math.min(maxVal, finalOffsetEmissionsTonnes);
    const percentage = boundedEmissions / maxVal;
    const strokeDashoffset = 251.2 - (percentage * 251.2);
    
    const fillCircle = document.getElementById('gauge-fill-circle');
    fillCircle.setAttribute('stroke-dashoffset', strokeDashoffset);
    
    // Set circle stroke color dynamically
    if (finalOffsetEmissionsTonnes <= 2.0) {
        fillCircle.style.stroke = 'var(--mint)';
    } else if (finalOffsetEmissionsTonnes <= 6.0) {
        fillCircle.style.stroke = 'var(--primary)';
    } else if (finalOffsetEmissionsTonnes <= 12.0) {
        fillCircle.style.stroke = 'var(--orange)';
    } else {
        fillCircle.style.stroke = 'var(--red)';
    }

    // Benchmark horizontal slider pointer positioning
    const userMarkerPercent = Math.min(100, Math.max(0, (finalOffsetEmissionsTonnes / 18.0) * 100));
    document.getElementById('benchmark-user-pos').style.left = `${userMarkerPercent}%`;

    // Update savings statistics boxes
    document.getElementById('stats-co2-prevented').innerText = `${savingsCo2} kg`;
    document.getElementById('stats-cash-saved').innerText = `$${savingsCash}`;

    // Update milestones & badge achievements
    updateBadgeAchievements();

    // Render Charts
    renderSvgDonutChart(savingsCo2);
    renderTrendBarChart(netAnnualEmissionsKg);
    
    // Refresh actions lists classes
    renderActionsList();
    
    // Refresh XP
    document.getElementById('profile-xp-val').innerText = `${appState.userProfile.xp} XP`;
    
    // Recalculate offset slider metrics
    simulateOffset(appState.offsetPercent);
}

function getEmissionsGrade(t) {
    if (t <= 2.0) return 'A+';
    if (t <= 5.0) return 'A';
    if (t <= 10.0) return 'B';
    if (t <= 16.0) return 'C';
    return 'D';
}

function getEmissionsRating(t) {
    if (t <= 2.0) return 'Climate Hero';
    if (t <= 5.0) return 'Eco-Champ';
    if (t <= 10.0) return 'Conscious Citizen';
    if (t <= 16.0) return 'Carbon Consumer';
    return 'High Impact';
}

function getEmissionsRatingDesc(t) {
    if (t <= 2.0) return 'Outstanding! Your footprint meets the sustainable global target to keep warming below 1.5°C.';
    if (t <= 5.0) return 'Great job! You are well below average and taking meaningful green steps.';
    if (t <= 10.0) return 'Good effort, but you still have potential areas where you can reduce emissions.';
    if (t <= 16.0) return 'Your carbon footprint is around the national average. Let\'s look at ways to cut back.';
    return 'Your carbon emissions are higher than average. Focus on the recommended actions below.';
}

// Update Badges unlocked based on actions committed
function updateBadgeAchievements() {
    const badgesRow = document.getElementById('dashboard-badges');
    badgesRow.innerHTML = '';
    
    let committedCount = 0;
    
    ECO_ACTIONS.forEach(action => {
        if (appState.committedActions[action.id]) {
            committedCount++;
            
            const badgeDiv = document.createElement('div');
            badgeDiv.className = 'achievement-badge';
            badgeDiv.innerHTML = `<i data-lucide="award"></i> ${action.badge}`;
            badgesRow.appendChild(badgeDiv);
        }
    });

    if (committedCount === 0) {
        badgesRow.innerHTML = '<div class="badge-lock-info">Commit to green actions to unlock rewards.</div>';
    }

    document.getElementById('milestone-ratio').innerText = `${committedCount} of ${ECO_ACTIONS.length} Committed`;
    const milestoneProgressPercent = (committedCount / ECO_ACTIONS.length) * 100;
    document.getElementById('milestone-progress').style.width = `${milestoneProgressPercent}%`;
    
    lucide.createIcons();
}

// Render dynamic SVDonut Breakdown Chart
function renderSvgDonutChart(currentSavingsTotal) {
    const donut = document.getElementById('donut-chart');
    const legend = document.getElementById('chart-legend');
    if (!donut || !legend) return;
    
    donut.innerHTML = '';
    legend.innerHTML = '';
    
    const breakdown = appState.results.breakdown;
    
    // Scale categories dynamically using current calculations minus committed offsets in those categories
    // Get net category values
    const catValues = {
        travel: Math.max(0, breakdown.travel - sumSavingsByCategory('travel')),
        energy: Math.max(0, breakdown.energy - sumSavingsByCategory('energy')),
        diet: Math.max(0, breakdown.diet - sumSavingsByCategory('diet')),
        shopping: Math.max(0, breakdown.shopping - sumSavingsByCategory('shopping')),
        waste: Math.max(0, breakdown.waste - sumSavingsByCategory('waste'))
    };
    
    const totalVal = Object.values(catValues).reduce((a, b) => a + b, 0);
    
    if (totalVal === 0) {
        donut.innerHTML = `<circle cx="50" cy="50" r="40" stroke="var(--mint)" stroke-width="12" fill="none"></circle>`;
        legend.innerHTML = 'All categories fully carbon neutralized! 🌳';
        return;
    }
    
    let cumulatedPercent = 0;
    
    Object.keys(catValues).forEach((cat) => {
        const value = catValues[cat];
        const percent = value / totalVal;
        const strokeDash = percent * 251.3;
        const strokeDashOffset = 251.3 - strokeDash;
        const rotateAngle = (cumulatedPercent * 360) - 90;
        
        if (value > 0) {
            // Circle slice path
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'donut-segment');
            circle.setAttribute('cx', '50');
            circle.setAttribute('cy', '50');
            circle.setAttribute('r', '40');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', CATEGORY_COLORS[cat]);
            circle.setAttribute('stroke-width', '12');
            circle.setAttribute('stroke-dasharray', `${strokeDash} ${strokeDashOffset}`);
            circle.setAttribute('stroke-dashoffset', '0');
            circle.setAttribute('transform', `rotate(${rotateAngle} 50 50)`);
            circle.setAttribute('data-category', cat);
            circle.setAttribute('data-value', (value/1000).toFixed(2));
            circle.setAttribute('data-percent', (percent*100).toFixed(0));
            
            // Interaction: click slice
            circle.addEventListener('click', () => {
                selectCategoryBreakdown(cat, (value/1000).toFixed(2), (percent*100).toFixed(0));
            });
            
            donut.appendChild(circle);
            
            // Legend Item
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.setAttribute('data-category', cat);
            legendItem.innerHTML = `
                <div class="legend-lbl-group">
                    <span class="legend-color" style="background-color: ${CATEGORY_COLORS[cat]}"></span>
                    <span class="legend-title">${cat}</span>
                </div>
                <span class="legend-val">${(value/1000).toFixed(1)}t (${(percent*100).toFixed(0)}%)</span>
            `;
            
            legendItem.addEventListener('click', () => {
                selectCategoryBreakdown(cat, (value/1000).toFixed(2), (percent*100).toFixed(0));
            });
            
            legend.appendChild(legendItem);
        }
        
        cumulatedPercent += percent;
    });
}

function sumSavingsByCategory(cat) {
    let saved = 0;
    ECO_ACTIONS.forEach(action => {
        if (action.category === cat && appState.committedActions[action.id]) {
            saved += action.carbonSaving;
        }
    });
    return saved;
}

function selectCategoryBreakdown(cat, tonnes, percent) {
    // Highlights category slice / legend
    document.querySelectorAll('.donut-segment').forEach(seg => {
        seg.classList.remove('active');
        if (seg.getAttribute('data-category') === cat) {
            seg.classList.add('active');
        } else {
            seg.classList.add('inactive');
        }
    });
    
    document.querySelectorAll('.legend-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-category') === cat) item.classList.add('active');
    });

    document.getElementById('selected-slice-lbl').innerText = cat;
    
    // Insights tip generator details
    const insightBox = document.getElementById('category-insight');
    const insightText = document.getElementById('category-insight-text');
    
    const tips = {
        travel: `🚲 Travel accounts for ${percent}% of your footprint. Swap just 2 short drives weekly for a bike/walk to cut 100kg CO₂ and save on fuel.`,
        energy: `⚡ Home power accounts for ${percent}% of your footprint. Set your AC to 24°C and unplug vampire adapters to save ~$120/year.`,
        diet: `🥗 Diet accounts for ${percent}% of your footprint. swapping beef for poultry or going meatless on Mondays reduces food emissions by up to 50%!`,
        shopping: `🛍️ Shopping accounts for ${percent}% of your footprint. Try buying quality, second-hand items or delay new gadget purchases to reduce raw waste.`,
        waste: `♻️ Waste accounts for ${percent}% of your footprint. Proper separation and recycling can divert organic waste from methane-producing landfills.`
    };
    
    insightText.innerHTML = tips[cat] || `Select slices to show tips.`;
}

// Render dynamic trend comparison bars (Historical track)
function renderTrendBarChart(netAnnualKg) {
    const container = document.getElementById('trend-bar-chart');
    if (!container) return;
    
    container.innerHTML = '';
    
    // We simulate historical trend bar graphs leading to user current status
    // Jan, Feb, Mar are historical (usually higher). Current (NetAnnualKg) represents June.
    const monthlyEmissionsKg = [
        1200, // Jan (Highest)
        1050, // Feb
        920,  // Mar
        800,  // Apr
        750,  // May
        Math.round(netAnnualKg / 12) // Current Month (June) - dynamically reflects user savings!
    ];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (You)'];
    const maxVal = Math.max(...monthlyEmissionsKg, 1000);
    
    monthlyEmissionsKg.forEach((val, idx) => {
        const heightPercent = (val / maxVal) * 100;
        
        // Add vertical trend bar group
        const group = document.createElement('div');
        group.className = 'chart-bar-group';
        
        // Give red/orange styling to bars exceeding a monthly target threshold (e.g. 500kg = 6 tonnes/year)
        const isHigh = val > 650;
        const colorClass = isHigh ? 'high-emissions' : '';
        
        group.innerHTML = `
            <div class="bar-wrapper" title="${val} kg CO₂">
                <div class="bar-inner ${colorClass}" style="height: ${heightPercent}%;"></div>
            </div>
            <span class="bar-label">${months[idx]}</span>
        `;
        container.appendChild(group);
    });
}

// ==========================================================================
// ACTION PLANNER & REDUCTION COMMITS
// ==========================================================================

function renderActionsList() {
    const list = document.getElementById('action-list-container');
    if (!list) return;
    
    list.innerHTML = '';
    
    ECO_ACTIONS.forEach(action => {
        const isCommitted = appState.committedActions[action.id];
        
        const card = document.createElement('div');
        card.className = `action-item-card ${isCommitted ? 'committed' : ''}`;
        
        let btnText = "Commit";
        let btnClass = "";
        
        if (isCommitted) {
            btnText = "Committed <i data-lucide='check'></i>";
            btnClass = "committed";
        }
        
        card.innerHTML = `
            <div class="action-info-group">
                <div class="action-icon-badge">
                    <i data-lucide="${action.icon || 'leaf'}"></i>
                </div>
                <div class="action-details">
                    <span class="action-title">${action.title}</span>
                    <div class="action-savings">
                        <span class="saving-co2">-${action.carbonSaving} kg CO₂/yr</span>
                        <span class="saving-cash">+$${action.cashSaving}/yr</span>
                    </div>
                </div>
            </div>
            <button class="action-btn ${btnClass}" onclick="toggleActionCommit('${action.id}')">
                ${btnText}
            </button>
        `;
        
        list.appendChild(card);
    });
    
    lucide.createIcons();
}

function toggleActionCommit(id) {
    const action = ECO_ACTIONS.find(a => a.id === id);
    if (!action) return;
    
    if (appState.committedActions[id]) {
        // Uncommit
        delete appState.committedActions[id];
        appState.userProfile.xp = Math.max(0, appState.userProfile.xp - 50);
    } else {
        // Commit & Reward XP!
        appState.committedActions[id] = true;
        appState.userProfile.xp += 100; // Unlocking badge / action adds XP
    }
    
    saveStateToStorage();
    updateDashboardView();
}

function filterActions(category) {
    document.querySelectorAll('.action-filters .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === category) btn.classList.add('active');
    });

    document.querySelectorAll('.action-item-card').forEach((card, index) => {
        const action = ECO_ACTIONS[index];
        if (category === 'all' || action.category === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// ==========================================================================
// OFFSEITING SIMULATOR
// ==========================================================================

function simulateOffset(percent) {
    appState.offsetPercent = parseInt(percent);
    document.getElementById('offset-percent-lbl').innerText = `${percent}%`;
    
    if (!appState.results) return;
    
    // Sum committed reductions
    let savingsCo2 = 0;
    ECO_ACTIONS.forEach(action => {
        if (appState.committedActions[action.id]) savingsCo2 += action.carbonSaving;
    });

    const netAnnualKg = Math.max(0, appState.results.total_kg - savingsCo2);
    const offsetKgTotal = netAnnualKg * (percent / 100.0);
    const offsetTonnes = offsetKgTotal / 1000.0;
    
    // Calculate Equivalents
    // 1 Tree absorbs ~22kg of CO2 / year
    const trees = Math.round(offsetKgTotal / 22.0);
    // 1 Turbine hour replaces ~0.5kg of fossil fuel CO2
    const turbineHours = Math.round(offsetKgTotal / 0.5);
    
    document.getElementById('offset-tree-count').innerText = trees.toLocaleString();
    document.getElementById('offset-turbine-count').innerText = turbineHours.toLocaleString();
    
    // Update payment checkout panel
    const checkoutPanel = document.getElementById('offset-cta');
    if (percent > 0) {
        checkoutPanel.style.display = 'flex';
        document.getElementById('offset-tonnes-lbl').innerText = offsetTonnes.toFixed(2);
        // Cost estimation: $12 per tonne
        const cost = Math.max(1, Math.round(offsetTonnes * 12.0));
        document.getElementById('offset-cost-lbl').innerText = `$${cost}`;
    } else {
        checkoutPanel.style.display = 'none';
    }
}

function checkoutOffset() {
    alert(`Success! You have offsetted ${appState.offsetPercent}% of your emissions. Unlocked XP bonus +200.`);
    appState.userProfile.xp += 200;
    
    // Lock in offset by resetting slider and lowering footprint score baseline permanently
    appState.offsetPercent = 0;
    document.getElementById('offset-slider').value = 0;
    simulateOffset(0);
    
    saveStateToStorage();
    updateDashboardView();
}

// ==========================================================================
// CONTEXT SWITCHER: PERSONAL / OFFICE / SCHOOL MODE
// ==========================================================================

function switchMode(mode) {
    appState.activeMode = mode;
    
    // Update navbar active classes
    document.querySelectorAll('.mode-selector .mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${mode}`).classList.add('active');
    
    // Update Leaderboard Header label
    const title = document.getElementById('lbl-leaderboard-title');
    const orgChallenge = document.getElementById('org-challenge-box');
    const lbTeamTab = document.getElementById('lb-team-tab');
    
    if (mode === 'personal') {
        title.innerText = 'Personal Global Leaderboard';
        orgChallenge.classList.add('hidden');
        lbTeamTab.innerText = 'Top Friends';
    } else if (mode === 'office') {
        title.innerText = 'Corporate Division Leaderboard';
        orgChallenge.classList.remove('hidden');
        orgChallenge.querySelector('strong').innerText = 'Corporate Office Challenge: Commute Less Week';
        orgChallenge.querySelector('p').innerText = 'Walk or bike to work twice this week. Top department wins team credits!';
        lbTeamTab.innerText = 'Departments';
    } else if (mode === 'school') {
        title.innerText = 'Campus Classroom Leaderboard';
        orgChallenge.classList.remove('hidden');
        orgChallenge.querySelector('strong').innerText = 'Active Challenge: Green Campus Month';
        orgChallenge.querySelector('p').innerText = 'Eat vegetarian lunches 3 times/week to gain bonus group points!';
        lbTeamTab.innerText = 'Classrooms';
    }
    
    loadLeaderboard();
}

function toggleLeaderboardScope(scope) {
    appState.leaderboardScope = scope;
    document.querySelectorAll('.leaderboard-tabs button').forEach(btn => btn.classList.remove('active'));
    
    if (scope === 'team') {
        document.getElementById('lb-team-tab').classList.add('active');
    } else {
        document.getElementById('lb-global-tab').classList.add('active');
    }
    
    loadLeaderboard();
}

async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="4">Loading scoreboard standings...</td></tr>';
    
    try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) throw new Error('Could not fetch leaderboard data');
        const data = await response.json();
        
        tbody.innerHTML = '';
        
        let dataset = [];
        
        // Select appropriate mock data category based on active scope
        if (appState.leaderboardScope === 'global') {
            dataset = data.personal; // Overall single player ranks
        } else {
            // Team ranks
            dataset = (appState.activeMode === 'personal') ? data.personal : data[appState.activeMode];
        }
        
        dataset.forEach((row) => {
            const tr = document.createElement('tr');
            
            // Highlight user row
            if (row.name.includes('You') || row.name === 'You (Current Profile)') {
                tr.className = 'highlighted';
            }
            
            tr.innerHTML = `
                <td><strong>#${row.rank}</strong></td>
                <td>${row.name}</td>
                <td class="text-right text-mint">${row.emissions_reduction}</td>
                <td class="text-right">${row.points || row.points || 0} pts</td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-red">Error loading standings. Offline fallback active.</td></tr>';
    }
}

// ==========================================================================
// AI ASSISTANT CHATBOT DRAWER
// ==========================================================================

function toggleChatbot() {
    const chatBox = document.getElementById('chat-box-container');
    const trigger = document.getElementById('chat-icon-trigger');
    
    chatBox.classList.toggle('active');
    
    if (chatBox.classList.contains('active')) {
        trigger.setAttribute('data-lucide', 'x');
        // Auto scroll messages to bottom
        const container = document.getElementById('chat-messages-container');
        container.scrollTop = container.scrollHeight;
    } else {
        trigger.setAttribute('data-lucide', 'message-square');
    }
    lucide.createIcons();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    const msgText = input.value.trim();
    if (!msgText) return;
    
    input.value = '';
    
    const messagesContainer = document.getElementById('chat-messages-container');
    
    // 1. Append User Message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'msg user-msg';
    userMsgDiv.innerHTML = `<p>${escapeHtml(msgText)}</p>`;
    messagesContainer.appendChild(userMsgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 2. Append Typing/Loader Bubble
    const botLoadingDiv = document.createElement('div');
    botLoadingDiv.className = 'msg bot-msg';
    botLoadingDiv.innerHTML = `<p class="animate-pulse">Thinking...</p>`;
    messagesContainer.appendChild(botLoadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msgText })
        });
        
        if (!response.ok) throw new Error('Chatbot API issue');
        const res = await response.json();
        
        // Remove typing bubble, insert real reply
        messagesContainer.removeChild(botLoadingDiv);
        
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'msg bot-msg';
        
        // Convert Markdown bold (**text**) to HTML strong elements for cleaner rendering
        const formattedReply = formatMarkdownToHtml(res.reply);
        botMsgDiv.innerHTML = `<p>${formattedReply}</p>`;
        
        messagesContainer.appendChild(botMsgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (err) {
        console.error(err);
        messagesContainer.removeChild(botLoadingDiv);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'msg bot-msg text-red';
        errorDiv.innerHTML = `<p>Sorry, I'm having trouble connecting right now. Try again later!</p>`;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function handleChatKeypress(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

// Helpers
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatMarkdownToHtml(str) {
    // Basic Markdown conversion (**bold** -> <strong>, *italic* -> <em>, lists etc.)
    let html = escapeHtml(str);
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Newlines to linebreaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// ==========================================================================
// LOCAL STORAGE INTEGRATION
// ==========================================================================

function saveStateToStorage() {
    localStorage.setItem('carbonflow_state', JSON.stringify({
        calculatorData: appState.calculatorData,
        results: appState.results,
        committedActions: appState.committedActions,
        completedActions: appState.completedActions,
        userProfile: appState.userProfile
    }));
}

function loadStateFromStorage() {
    const raw = localStorage.getItem('carbonflow_state');
    if (!raw) return;
    
    try {
        const saved = JSON.parse(raw);
        appState.calculatorData = saved.calculatorData || appState.calculatorData;
        appState.results = saved.results || null;
        appState.committedActions = saved.committedActions || {};
        appState.completedActions = saved.completedActions || {};
        appState.userProfile = saved.userProfile || appState.userProfile;
    } catch (err) {
        console.error('Could not parse saved storage states', err);
    }
}
