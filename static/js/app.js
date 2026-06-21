let appState = {
    currentStep: 1,
    totalSteps: 5,
    userProfile: { xp: 420, unlockedBadges: [] },
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
    results: null,
    committedActions: {},
    completedActions: {},
    activeMode: 'personal',
    leaderboardScope: 'team',
    offsetPercent: 0
};

const ECO_ACTIONS = [
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
    travel: '#10b981',
    energy: '#34d399',
    diet: '#f59e0b',
    shopping: '#8ea69a',
    waste: '#ef4444'
};

document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    lucide.createIcons();
    renderActionsList();
    setupOcrScanner();
    if (appState.results) {
        document.getElementById('onboarding-overlay').classList.remove('active');
        document.getElementById('dashboard').style.display = 'grid';
        updateDashboardView();
        loadLeaderboard();
    } else {
        updateOnboardingStep();
    }
});

function updateOnboardingStep() {
    for (let i = 1; i <= appState.totalSteps; i++) {
        const stepDiv = document.getElementById(`step-${i}`);
        if (stepDiv) stepDiv.classList.remove('active');
    }
    document.getElementById(`step-${appState.currentStep}`).classList.add('active');
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
    const progressPercent = ((appState.currentStep - 1) / (appState.totalSteps - 1)) * 100;
    document.getElementById('onboarding-progress').style.width = `${progressPercent}%`;
}

function nextStep() {
    if (appState.currentStep < appState.totalSteps) {
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

function selectTransit(el) {
    document.querySelectorAll('#step-2 .selector-option').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
    const val = el.getAttribute('data-value');
    document.getElementById('input-travel-type').value = val;
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
        document.getElementById('onboarding-overlay').classList.remove('active');
        document.getElementById('dashboard').style.display = 'grid';
        appState.offsetPercent = 0;
        document.getElementById('offset-slider').value = 0;
        simulateOffset(0);
        saveStateToStorage();
        updateDashboardView();
        loadLeaderboard();
    } catch (err) {
        console.error(err);
        loadMockOfflineResults();
    }
}

function openRecalculateWizard() {
    appState.currentStep = 2;
    document.getElementById('input-travel-km').value = appState.calculatorData.travelKm;
    document.getElementById('val-travel-km').innerText = `${appState.calculatorData.travelKm} km`;
    document.getElementById('input-flights').value = appState.calculatorData.flightHours;
    document.getElementById('val-flights').innerText = `${appState.calculatorData.flightHours} hours`;
    document.getElementById('input-electricity').value = appState.calculatorData.electricityKwh;
    document.getElementById('input-ac-hours').value = appState.calculatorData.acHours;
    document.getElementById('input-gas').value = appState.calculatorData.gasKwh;
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

function setupOcrScanner() {
    const dropzone = document.getElementById('bill-dropzone');
    const fileInput = document.getElementById('bill-file-input');
    if (!dropzone || !fileInput) return;
    dropzone.addEventListener('click', () => {
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
    dropzoneDefault.classList.add('hidden');
    dropzoneScanning.classList.remove('hidden');
    const formData = new FormData();
    formData.append('billFile', file);
    formData.append('fileName', file.name);
    try {
        const response = await fetch('/api/scan-bill', {
            method: 'POST',
            body: formData
        });
        await new Promise(r => setTimeout(r, 2200));
        if (!response.ok) throw new Error('OCR Scan failed');
        const res = await response.json();
        dropzoneScanning.classList.add('hidden');
        dropzoneSuccess.classList.remove('hidden');
        resultText.innerHTML = `Extracted <strong>${res.extracted_kwh} kWh</strong> from <em>${file.name}</em>!`;
        document.getElementById('input-electricity').value = res.extracted_kwh;
    } catch (err) {
        console.error(err);
        dropzoneScanning.classList.add('hidden');
        dropzoneDefault.classList.remove('hidden');
        alert('OCR Scanning issue. Enter kWh manually.');
    }
}

function resetScanner(e) {
    e.stopPropagation();
    document.getElementById('dropzone-success').classList.add('hidden');
    document.querySelector('.dropzone-default').classList.remove('hidden');
    document.getElementById('bill-file-input').value = '';
}

function updateDashboardView() {
    if (!appState.results) return;
    const currentBaseEmissions = appState.results.total_kg;
    let savingsCo2 = 0;
    let savingsCash = 0;
    ECO_ACTIONS.forEach(action => {
        if (appState.committedActions[action.id]) {
            savingsCo2 += action.carbonSaving;
            savingsCash += action.cashSaving;
        }
    });
    const netAnnualEmissionsKg = Math.max(0, currentBaseEmissions - savingsCo2);
    const netAnnualEmissionsTonnes = netAnnualEmissionsKg / 1000.0;
    const finalOffsetEmissionsTonnes = netAnnualEmissionsTonnes * (1 - (appState.offsetPercent / 100.0));
    document.getElementById('dashboard-total-tonnes').innerText = finalOffsetEmissionsTonnes.toFixed(2);
    document.getElementById('dashboard-grade').innerText = getEmissionsGrade(finalOffsetEmissionsTonnes);
    document.getElementById('dashboard-rating').innerText = getEmissionsRating(finalOffsetEmissionsTonnes);
    document.getElementById('dashboard-rating-desc').innerText = getEmissionsRatingDesc(finalOffsetEmissionsTonnes);
    const maxVal = 16.0;
    const boundedEmissions = Math.min(maxVal, finalOffsetEmissionsTonnes);
    const percentage = boundedEmissions / maxVal;
    const strokeDashoffset = 251.2 - (percentage * 251.2);
    const fillCircle = document.getElementById('gauge-fill-circle');
    fillCircle.setAttribute('stroke-dashoffset', strokeDashoffset);
    if (finalOffsetEmissionsTonnes <= 2.0) {
        fillCircle.style.stroke = 'var(--mint)';
    } else if (finalOffsetEmissionsTonnes <= 6.0) {
        fillCircle.style.stroke = 'var(--primary)';
    } else if (finalOffsetEmissionsTonnes <= 12.0) {
        fillCircle.style.stroke = 'var(--orange)';
    } else {
        fillCircle.style.stroke = 'var(--red)';
    }
    const userMarkerPercent = Math.min(100, Math.max(0, (finalOffsetEmissionsTonnes / 18.0) * 100));
    document.getElementById('benchmark-user-pos').style.left = `${userMarkerPercent}%`;
    document.getElementById('stats-co2-prevented').innerText = `${savingsCo2} kg`;
    document.getElementById('stats-cash-saved').innerText = `$${savingsCash}`;
    updateBadgeAchievements();
    renderSvgDonutChart(savingsCo2);
    renderTrendBarChart(netAnnualEmissionsKg);
    renderActionsList();
    document.getElementById('profile-xp-val').innerText = `${appState.userProfile.xp} XP`;
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
    if (t <= 16.0) return "Your carbon footprint is around the national average. Let's look at ways to cut back.";
    return 'Your carbon emissions are higher than average. Focus on the recommended actions below.';
}

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

function renderSvgDonutChart(currentSavingsTotal) {
    const donut = document.getElementById('donut-chart');
    const legend = document.getElementById('chart-legend');
    if (!donut || !legend) return;
    donut.innerHTML = '';
    legend.innerHTML = '';
    const breakdown = appState.results.breakdown;
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
        legend.innerHTML = 'All neutralized! 🌳';
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
            circle.addEventListener('click', () => {
                selectCategoryBreakdown(cat, (value/1000).toFixed(2), (percent*100).toFixed(0));
            });
            donut.appendChild(circle);
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
    const insightText = document.getElementById('category-insight-text');
    const tips = {
        travel: `🚲 Travel accounts for ${percent}% of your footprint. Swap just 2 short drives weekly for a bike/walk.`,
        energy: `⚡ Home power accounts for ${percent}% of your footprint. Set your AC to 24°C and unplug vampire adapters.`,
        diet: `🥗 Diet accounts for ${percent}% of your footprint. Swap beef for poultry.`,
        shopping: `🛍️ Shopping accounts for ${percent}% of your footprint. Buy second-hand.`,
        waste: `♻️ Waste accounts for ${percent}% of your footprint. Recycle organic waste.`
    };
    insightText.innerHTML = tips[cat] || `Select slices to show tips.`;
}

function renderTrendBarChart(netAnnualKg) {
    const container = document.getElementById('trend-bar-chart');
    if (!container) return;
    container.innerHTML = '';
    const monthlyEmissionsKg = [
        1200, 1050, 920, 800, 750,
        Math.round(netAnnualKg / 12)
    ];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (You)'];
    const maxVal = Math.max(...monthlyEmissionsKg, 1000);
    monthlyEmissionsKg.forEach((val, idx) => {
        const heightPercent = (val / maxVal) * 100;
        const group = document.createElement('div');
        group.className = 'chart-bar-group';
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
                        <span class="saving-co2">-${action.carbonSaving} kg/yr</span>
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
    if (appState.committedActions[id]) {
        delete appState.committedActions[id];
        appState.userProfile.xp = Math.max(0, appState.userProfile.xp - 50);
    } else {
        appState.committedActions[id] = true;
        appState.userProfile.xp += 100;
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

function simulateOffset(percent) {
    appState.offsetPercent = parseInt(percent);
    document.getElementById('offset-percent-lbl').innerText = `${percent}%`;
    if (!appState.results) return;
    let savingsCo2 = 0;
    ECO_ACTIONS.forEach(action => {
        if (appState.committedActions[action.id]) savingsCo2 += action.carbonSaving;
    });
    const netAnnualKg = Math.max(0, appState.results.total_kg - savingsCo2);
    const offsetKgTotal = netAnnualKg * (percent / 100.0);
    const offsetTonnes = offsetKgTotal / 1000.0;
    const trees = Math.round(offsetKgTotal / 22.0);
    const turbineHours = Math.round(offsetKgTotal / 0.5);
    document.getElementById('offset-tree-count').innerText = trees.toLocaleString();
    document.getElementById('offset-turbine-count').innerText = turbineHours.toLocaleString();
    const checkoutPanel = document.getElementById('offset-cta');
    if (percent > 0) {
        checkoutPanel.style.display = 'flex';
        document.getElementById('offset-tonnes-lbl').innerText = offsetTonnes.toFixed(2);
        const cost = Math.max(1, Math.round(offsetTonnes * 12.0));
        document.getElementById('offset-cost-lbl').innerText = `$${cost}`;
    } else {
        checkoutPanel.style.display = 'none';
    }
}

function checkoutOffset() {
    alert(`Success! Offsetted ${appState.offsetPercent}%. Unlocked XP bonus +200.`);
    appState.userProfile.xp += 200;
    appState.offsetPercent = 0;
    document.getElementById('offset-slider').value = 0;
    simulateOffset(0);
    saveStateToStorage();
    updateDashboardView();
}

function switchMode(mode) {
    appState.activeMode = mode;
    document.querySelectorAll('.mode-selector .mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${mode}`).classList.add('active');
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
        orgChallenge.querySelector('p').innerText = 'Walk or bike to work twice this week.';
        lbTeamTab.innerText = 'Departments';
    } else if (mode === 'school') {
        title.innerText = 'Campus Classroom Leaderboard';
        orgChallenge.classList.remove('hidden');
        orgChallenge.querySelector('strong').innerText = 'Active Challenge: Green Campus Month';
        orgChallenge.querySelector('p').innerText = 'Eat vegetarian lunches 3 times/week.';
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
        if (appState.leaderboardScope === 'global') {
            dataset = data.personal;
        } else {
            dataset = (appState.activeMode === 'personal') ? data.personal : data[appState.activeMode];
        }
        dataset.forEach((row) => {
            const tr = document.createElement('tr');
            if (row.name.includes('You') || row.name === 'You (Current Profile)') {
                tr.className = 'highlighted';
            }
            tr.innerHTML = `
                <td><strong>#${row.rank}</strong></td>
                <td>${row.name}</td>
                <td class="text-right text-mint">${row.emissions_reduction}</td>
                <td class="text-right">${row.points || 0} pts</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-red">Error loading standings.</td></tr>';
    }
}

function toggleChatbot() {
    const chatBox = document.getElementById('chat-box-container');
    const trigger = document.getElementById('chat-icon-trigger');
    chatBox.classList.toggle('active');
    if (chatBox.classList.contains('active')) {
        trigger.setAttribute('data-lucide', 'x');
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
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'msg user-msg';
    userMsgDiv.innerHTML = `<p>${escapeHtml(msgText)}</p>`;
    messagesContainer.appendChild(userMsgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
        messagesContainer.removeChild(botLoadingDiv);
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'msg bot-msg';
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

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatMarkdownToHtml(str) {
    let html = escapeHtml(str);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

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
