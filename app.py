from flask import Flask, render_template, jsonify, request
import os
import random

app = Flask(__name__, template_folder='templates', static_folder='static')

EMISSION_FACTORS = {
    'travel': {
        'petrol_car': 0.23,       # kg CO2 per km
        'ev_car': 0.05,           # kg CO2 per km
        'public_transit': 0.037,  # kg CO2 per km
        'bike_walk': 0.0,         # kg CO2 per km
        'flight_hour': 150.0      # kg CO2 per flight hour
    },
    'energy': {
        'electricity_kwh': 0.38,  # kg CO2 per kWh
        'ac_hour': 0.5,           # kg CO2 per hour of AC use
        'gas_heating': 0.18       # kg CO2 per kWh of gas
    },
    'diet': {
        'meat_heavy': 2900.0,     # kg CO2 per year
        'balanced': 1700.0,       # kg CO2 per year
        'vegetarian': 1200.0,     # kg CO2 per year
        'vegan': 800.0            # kg CO2 per year
    },
    'shopping': {
        'high': 1500.0,           # kg CO2 per year
        'medium': 800.0,          # kg CO2 per year
        'low': 300.0              # kg CO2 per year
    },
    'waste': {
        'unrecycled': 400.0,      # kg CO2 per year
        'moderate': 200.0,        # kg CO2 per year
        'zero_waste': 50.0        # kg CO2 per year
    }
}

NATIONAL_AVERAGE = 16.0
GLOBAL_TARGET = 2.0

@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' unpkg.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: images.openai.com; connect-src 'self';"
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json or {}
    
    travel_type = data.get('travelType', 'bike_walk')
    travel_km_weekly = float(data.get('travelKm', 0))
    flight_hours_annual = float(data.get('flightHours', 0))
    
    weekly_travel_factor = EMISSION_FACTORS['travel'].get(travel_type, 0.0)
    travel_annual_co2 = (travel_km_weekly * weekly_travel_factor * 52.0) + (flight_hours_annual * EMISSION_FACTORS['travel']['flight_hour'])
    
    electricity_kwh_monthly = float(data.get('electricityKwh', 0))
    ac_hours_weekly = float(data.get('acHours', 0))
    gas_kwh_monthly = float(data.get('gasKwh', 0))
    
    electricity_annual_co2 = electricity_kwh_monthly * EMISSION_FACTORS['energy']['electricity_kwh'] * 12.0
    ac_annual_co2 = ac_hours_weekly * EMISSION_FACTORS['energy']['ac_hour'] * 52.0
    gas_annual_co2 = gas_kwh_monthly * EMISSION_FACTORS['energy']['gas_heating'] * 12.0
    energy_annual_co2 = electricity_annual_co2 + ac_annual_co2 + gas_annual_co2
    
    diet_type = data.get('dietType', 'balanced')
    diet_annual_co2 = EMISSION_FACTORS['diet'].get(diet_type, 1700.0)
    
    shopping_level = data.get('shoppingLevel', 'medium')
    shopping_annual_co2 = EMISSION_FACTORS['shopping'].get(shopping_level, 800.0)
    
    waste_type = data.get('wasteType', 'moderate')
    waste_annual_co2 = EMISSION_FACTORS['waste'].get(waste_type, 200.0)
    
    total_co2_kg = travel_annual_co2 + energy_annual_co2 + diet_annual_co2 + shopping_annual_co2 + waste_annual_co2
    total_co2_tonnes = total_co2_kg / 1000.0
    
    if total_co2_tonnes <= GLOBAL_TARGET:
        rating = "Climate Hero"
        rating_desc = "Outstanding! Your footprint meets the sustainable global target to keep warming below 1.5°C."
        grade = "A+"
    elif total_co2_tonnes <= 5.0:
        rating = "Eco-Champ"
        rating_desc = "Great job! You are well below average and taking meaningful green steps."
        grade = "A"
    elif total_co2_tonnes <= 10.0:
        rating = "Conscious Citizen"
        rating_desc = "Good effort, but you still have potential areas where you can reduce emissions."
        grade = "B"
    elif total_co2_tonnes <= NATIONAL_AVERAGE:
        rating = "Carbon Consumer"
        rating_desc = "Your carbon footprint is around the national average. Let's look at ways to cut back."
        grade = "C"
    else:
        rating = "High Impact Consumer"
        rating_desc = "Your carbon emissions are higher than average. Focus on the recommended actions below."
        grade = "D"
        
    return jsonify({
        'breakdown': {
            'travel': round(travel_annual_co2, 1),
            'energy': round(energy_annual_co2, 1),
            'diet': round(diet_annual_co2, 1),
            'shopping': round(shopping_annual_co2, 1),
            'waste': round(waste_annual_co2, 1)
        },
        'total_kg': round(total_co2_kg, 1),
        'total_tonnes': round(total_co2_tonnes, 2),
        'rating': rating,
        'rating_desc': rating_desc,
        'grade': grade,
        'national_average': NATIONAL_AVERAGE,
        'global_target': GLOBAL_TARGET
    })

@app.route('/api/scan-bill', methods=['POST'])
def scan_bill():
    if 'billFile' not in request.files and not request.form.get('fileName'):
        return jsonify({'error': 'No file uploaded'}), 400
        
    fileName = request.form.get('fileName', 'electricity_bill.pdf')
    
    kwh_readings = [120, 245, 380, 410, 185]
    selected_kwh = random.choice(kwh_readings)
    monthly_co2_kg = selected_kwh * EMISSION_FACTORS['energy']['electricity_kwh']
    
    return jsonify({
        'success': True,
        'extracted_kwh': selected_kwh,
        'estimated_monthly_co2_kg': round(monthly_co2_kg, 1),
        'extracted_billing_period': "Last 30 Days",
        'provider': "EcoPower Grid Co."
    })

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    user_msg = request.json.get('message', '').strip().lower()
    
    responses = [
        {
            'keywords': ['car', 'drive', 'travel', 'flight', 'fly', 'transit', 'vehicle', 'commute'],
            'reply': "🚗 **Travel Footprint Insights:**\n\nTransportation is usually the largest source of personal carbon emissions. To reduce it:\n1. **Active Commuting:** Walk, bike, or use an e-scooter for trips under 5 km.\n2. **Public Transit:** Taking a bus or train reduces emissions by up to **80%** compared to a single-occupancy petrol vehicle.\n3. **Eco-Driving:** Keep tires inflated (improves efficiency) and avoid rapid acceleration.\n4. **Fly Less:** One long-haul flight can produce more CO₂ than an entire year of driving. Consider trains or local 'staycations' where possible!"
        },
        {
            'keywords': ['ac', 'electricity', 'energy', 'power', 'light', 'utility', 'heating', 'bill', 'kwh'],
            'reply': "⚡ **Home Energy Saving Tips:**\n\nReducing electricity usage is great for the planet and your wallet!\n1. **AC Temp:** Setting your AC to **24°C (75°F)** instead of 20°C can save up to **10-15%** on cooling bills.\n2. **LED Lighting:** LEDs use **75-80% less energy** than traditional incandescent bulbs and last 25 times longer.\n3. **Vampire Load:** Electronics consume power even when turned off. Unplug chargers, TVs, and game consoles, or use smart power strips to cut power completely.\n4. **Cold Wash:** Washing laundry at 30°C/Cold water saves **75-90%** of the machine's energy, which goes solely toward heating water!"
        },
        {
            'keywords': ['meat', 'beef', 'vegan', 'vegetarian', 'diet', 'food', 'chicken', 'dairy', 'eating'],
            'reply': "🥗 **Diet & Food Choices:**\n\nWhat you eat matters significantly for greenhouse gas emissions!\n1. **The Beef Impact:** Producing 1 kg of beef releases about **27 kg of CO₂e** (equivalent to driving a car 110 km). Swapping beef for chicken reduces that footprint by **80%**.\n2. **Meatless Days:** Dedicating just 1 or 2 days a week to vegetarian/vegan meals can save over **400 kg of CO₂** annually.\n3. **Local & Seasonal:** Buying local cuts down on 'food miles' (transportation carbon).\n4. **Reduce Food Waste:** About 1/3 of all food is wasted. Wasted food rotting in landfills produces methane, a potent greenhouse gas."
        },
        {
            'keywords': ['shop', 'buy', 'clothes', 'gadget', 'clothing', 'consumption', 'fast fashion', 'amazon'],
            'reply': "🛍️ **Conscious Consumption & Waste:**\n\nEvery product has a lifecycle footprint (raw materials, manufacture, transport, disposal).\n1. **Fast Fashion:** The clothing industry accounts for 10% of global emissions. Buy high-quality, long-lasting items, or shop second-hand.\n2. **Electronics:** Extending the life of your phone or laptop by just 1 year reduces its lifetime carbon footprint by **25%**.\n3. **Reduce, Reuse, Recycle:** Recycling saves energy. For example, recycling aluminum cans saves **95%** of the energy needed to make new ones from raw bauxite!"
        },
        {
            'keywords': ['offset', 'tree', 'plant', 'sequestration', 'carbon credit', 'credit'],
            'reply': "🌳 **Carbon Offsetting Explained:**\n\nOffsetting means funding projects that reduce or absorb greenhouse gases elsewhere to balance out your own emissions.\n* **Tree Planting:** A single mature tree absorbs roughly **22 kg (48 lbs) of CO₂** per year.\n* **Wind/Solar Farms:** Funding carbon credits helps build renewable grids that replace col/gas energy.\n* **Note:** Offsetting should be a **last resort**! It's always better to *reduce* emissions first, then offset the remainder."
        },
        {
            'keywords': ['hello', 'hi', 'hey', 'start', 'help', 'welcome'],
            'reply': "👋 Hello! I am your **CarbonFlow Eco-Assistant**.\n\nI can help you understand carbon sources and provide personalized tips. Ask me anything like:\n* *'How do I save energy at home?'*\n* *'Why is beef bad for the environment?'*\n* *'How can I lower travel emissions?'*\n* *'What does offsetting mean?'*"
        }
    ]
    
    matched_reply = None
    for item in responses:
        for kw in item['keywords']:
            if kw in user_msg:
                matched_reply = item['reply']
                break
        if matched_reply:
            break
            
    if not matched_reply:
        matched_reply = "💡 **Here is a quick Eco-Fact:**\n\nDid you know that if food waste were a country, it would be the third-largest emitter of greenhouse gases in the world, behind only the US and China?\n\n*Feel free to ask me specifically about **Travel**, **Energy**, **Diet**, or **Shopping** for targeted advice!*"
        
    return jsonify({
        'reply': matched_reply
    })

@app.route('/api/leaderboard')
def leaderboard():
    data = {
        'office': [
            {'rank': 1, 'name': 'Engineering Team', 'emissions_reduction': '3,450 kg', 'members': 14, 'points': 890},
            {'rank': 2, 'name': 'Marketing & Design', 'emissions_reduction': '2,910 kg', 'members': 10, 'points': 740},
            {'rank': 3, 'name': 'Sales Department', 'emissions_reduction': '2,150 kg', 'members': 18, 'points': 680},
            {'rank': 4, 'name': 'HR & Operations', 'emissions_reduction': '1,950 kg', 'members': 8, 'points': 590},
            {'rank': 5, 'name': 'Finance & Legal', 'emissions_reduction': '1,200 kg', 'members': 6, 'points': 420}
        ],
        'school': [
            {'rank': 1, 'name': 'Environmental Science Class', 'emissions_reduction': '4,100 kg', 'members': 28, 'points': 950},
            {'rank': 2, 'name': 'Grade 11 Physics B', 'emissions_reduction': '3,200 kg', 'members': 24, 'points': 810},
            {'rank': 3, 'name': 'Eco-Club Alpha', 'emissions_reduction': '2,850 kg', 'members': 15, 'points': 790},
            {'rank': 4, 'name': 'Grade 10 Chemistry', 'emissions_reduction': '2,400 kg', 'members': 30, 'points': 690},
            {'rank': 5, 'name': 'Computer Science Department', 'emissions_reduction': '1,800 kg', 'members': 22, 'points': 530}
        ],
        'personal': [
            {'rank': 1, 'name': 'GreenWarrior99', 'emissions_reduction': '1,450 kg', 'points': 650},
            {'rank': 2, 'name': 'EcoWizard_Joe', 'emissions_reduction': '1,200 kg', 'points': 580},
            {'rank': 3, 'name': 'TreePlanterLisa', 'emissions_reduction': '1,150 kg', 'points': 540},
            {'rank': 4, 'name': 'You (Current Profile)', 'emissions_reduction': '840 kg', 'points': 420},
            {'rank': 5, 'name': 'SolarPoweredGuy', 'emissions_reduction': '610 kg', 'points': 310}
        ]
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
