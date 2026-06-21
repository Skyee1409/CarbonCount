import { NextResponse } from 'next/server';

const RESPONSES = [
  {
    keywords: ['car', 'drive', 'travel', 'flight', 'fly', 'transit', 'vehicle', 'commute'],
    reply: "🚗 **Travel Footprint Insights:**\n\nTransportation is usually the largest source of personal carbon emissions. To reduce it:\n1. **Active Commuting:** Walk, bike, or use an e-scooter for trips under 5 km.\n2. **Public Transit:** Taking a bus or train reduces emissions by up to **80%** compared to a single-occupancy petrol vehicle.\n3. **Eco-Driving:** Keep tires inflated (improves efficiency) and avoid rapid acceleration.\n4. **Fly Less:** One long-haul flight can produce more CO₂ than an entire year of driving. Consider trains or local 'staycations' where possible!"
  },
  {
    keywords: ['ac', 'electricity', 'energy', 'power', 'light', 'utility', 'heating', 'bill', 'kwh'],
    reply: "⚡ **Home Energy Saving Tips:**\n\nReducing electricity usage is great for the planet and your wallet!\n1. **AC Temp:** Setting your AC to **24°C (75°F)** instead of 20°C can save up to **10-15%** on cooling bills.\n2. **LED Lighting:** LEDs use **75-80% less energy** than traditional incandescent bulbs and last 25 times longer.\n3. **Vampire Load:** Electronics consume power even when turned off. Unplug chargers, TVs, and game consoles, or use smart power strips to cut power completely.\n4. **Cold Wash:** Washing laundry at 30°C/Cold water saves **75-90%** of the machine's energy, which goes solely toward heating water!"
  },
  {
    keywords: ['meat', 'beef', 'vegan', 'vegetarian', 'diet', 'food', 'chicken', 'dairy', 'eating'],
    reply: "🥗 **Diet & Food Choices:**\n\nWhat you eat matters significantly for greenhouse gas emissions!\n1. **The Beef Impact:** Producing 1 kg of beef releases about **27 kg of CO₂e** (equivalent to driving a car 110 km). Swapping beef for chicken reduces that footprint by **80%**.\n2. **Meatless Days:** Dedicating just 1 or 2 days a week to vegetarian/vegan meals can save over **400 kg of CO₂** annually.\n3. **Local & Seasonal:** Buying local cuts down on 'food miles' (transportation carbon).\n4. **Reduce Food Waste:** About 1/3 of all food is wasted. Wasted food rotting in landfills produces methane, a potent greenhouse gas."
  },
  {
    keywords: ['shop', 'buy', 'clothes', 'gadget', 'clothing', 'consumption', 'fast fashion', 'amazon'],
    reply: "🛍️ **Conscious Consumption & Waste:**\n\nEvery product has a lifecycle footprint (raw materials, manufacture, transport, disposal).\n1. **Fast Fashion:** The clothing industry accounts for 10% of global emissions. Buy high-quality, long-lasting items, or shop second-hand.\n2. **Electronics:** Extending the life of your phone or laptop by just 1 year reduces its lifetime carbon footprint by **25%**.\n3. **Reduce, Reuse, Recycle:** Recycling saves energy. For example, recycling aluminum cans saves **95%** of the energy needed to make new ones from raw bauxite!"
  },
  {
    keywords: ['offset', 'tree', 'plant', 'sequestration', 'carbon credit', 'credit'],
    reply: "🌳 **Carbon Offsetting Explained:**\n\nOffsetting means funding projects that reduce or absorb greenhouse gases elsewhere to balance out your own emissions.\n* **Tree Planting:** A single mature tree absorbs roughly **22 kg (48 lbs) of CO₂** per year.\n* **Wind/Solar Farms:** Funding carbon credits helps build renewable grids that replace coal/gas energy.\n* **Note:** Offsetting should be a **last resort**! It's always better to *reduce* emissions first, then offset the remainder."
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'help', 'welcome'],
    reply: "👋 Hello! I am your **CarbonFlow Eco-Assistant**.\n\nI can help you understand carbon sources and provide personalized tips. Ask me anything like:\n* *'How do I save energy at home?'*\n* *'Why is beef bad for the environment?'*\n* *'How can I lower travel emissions?'*\n* *'What does offsetting mean?'*"
  }
];

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const query = (message || '').trim().toLowerCase();

    // Word keyword intersection search
    let matchedReply = "";
    for (const item of RESPONSES) {
      for (const keyword of item.keywords) {
        if (query.includes(keyword)) {
          matchedReply = item.reply;
          break;
        }
      }
      if (matchedReply) break;
    }

    if (!matchedReply) {
      matchedReply = "💡 **Here is a quick Eco-Fact:**\n\nDid you know that if food waste were a country, it would be the third-largest emitter of greenhouse gases in the world, behind only the US and China?\n\n*Feel free to ask me specifically about **Travel**, **Energy**, **Diet**, or **Shopping** for targeted advice!*";
    }

    return NextResponse.json({ reply: matchedReply });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process chat query' }, { status: 400 });
  }
}
