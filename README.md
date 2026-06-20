# CarbonFlow 🌳

CarbonFlow is a high-fidelity, interactive, and gamified web application designed to help individuals, corporate teams, and school campuses understand, track, and reduce their carbon footprint through simple actions and personalized insights.

![CarbonFlow Interface Mockup](https://images.openai.com/static-rsc-4/qu9T0Rx3GIJME9PzXVupJnF2MfdDRv19ZLoAVNUVHKICa_7qWGOxLM2FfzowM3UEdy73erPaHjejDC0XNoK0kGEePoRGWHqb_jgCkZD_riFTcy6t2H3YaWgVc2RVNzrw-0OqSw1vrnEx3vR7NG24W0-4XaHzPBhs-NewY0afYPz8GwN6D8iVedSLEes5bbDq?purpose=fullsize)

---

## 🚀 Key Features

*   **Understand (Onboarding Wizard):** A 5-step onboarding form that calculates your annual carbon footprint score ($tCO_2e$) across 5 lifestyle categories: Travel, Home Energy, Diet, Shopping, and Waste.
*   **Track (Analytics & Trends):** A main summary card displaying your rating (e.g. *Eco-Champ*) and grade, an SVG Category Donut chart, and a monthly trend bar graph showing emissions reductions.
*   **Reduce (Double-Impact Action Planner):** Recommends simple daily habits, tracking both **Carbon Savings (kg CO₂)** and **Cash Savings ($)** side-by-side. 
*   **Context Switcher:** Toggle the dashboard view and leaderboards between:
    *   *Personal Mode* (Personal stats & friends rankings).
    *   *Office Team Mode* (Department leaderboards & office energy challenges).
    *   *School Campus Mode* (Classroom rankings & campus sustainability challenges).
*   **Simulated OCR Bill Scanner:** Drag-and-drop or select an electricity bill to scan it (with animations), extract kWh values, and update your energy baseline.
*   **AI Eco-Assistant (Chatbot):** An interactive chatbot drawer providing formatted sustainability tips, transport swaps, and diet facts.
*   **Carbon Offset Simulator:** Interactively calculates equivalent real-world achievements (e.g. number of trees to plant or wind turbine hours to fund) to offset remaining emissions.

---

## 🛠️ Technology Stack

*   **Backend:** Python 3.x, Flask (Rest API engine)
*   **Frontend:** Semantic HTML5, Vanilla CSS3 (Glassmorphism, native animations), JavaScript ES6+ (Fetch API, DOM rendering)
*   **Icons:** Lucide Icons CDN

---

## ⚙️ How to Run Locally

### 1. Prerequisites
Ensure you have Python 3.x installed.

### 2. Install Flask
If not already installed, run:
```bash
pip install Flask
```

### 3. Run the Server
From the root project directory:
```bash
python app.py
```

### 4. Open in Browser
Open your browser and navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🌍 Calibrations & Emission Factors (Metric System)
All parameters use the standard metric system:
*   **Petrol Car:** 0.23 kg CO₂/km (replaces miles to match the standard $2.3$ kg CO₂ per 10 km target).
*   **Electric EV:** 0.05 kg CO₂/km.
*   **Public Transit:** 0.037 kg CO₂/km.
*   **Electricity:** 0.38 kg CO₂/kWh.
*   **AC Cooling:** 0.50 kg CO₂/hour.
*   **Gas Heating:** 0.18 kg CO₂/kWh.

---

## 🚀 Deploy to Render.com

This project is pre-configured for automated deployment on **Render.com** using the `render.yaml` Blueprint:

1.  Log in to your **Render.com** account.
2.  Go to the **Blueprints** dashboard and click **New Blueprint Instance**.
3.  Connect your GitHub repository: `https://github.com/Skyee1409/CarbonCount.git`.
4.  Render will automatically parse `render.yaml` and set up the Python Web Service running Gunicorn.
5.  Click **Approve** to build and spin up the live environment!

