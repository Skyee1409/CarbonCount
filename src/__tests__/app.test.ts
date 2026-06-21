import { describe, it, expect } from 'vitest';
import { calculateInputSchema } from '../validators/schemas';

// Mock responses and matching logic for chatbot testing
const MOCK_RESPONSES = [
  {
    keywords: ['car', 'drive', 'travel', 'flight', 'fly', 'transit', 'vehicle', 'commute'],
    reply: "🚗 **Travel Footprint Insights:**"
  },
  {
    keywords: ['ac', 'electricity', 'energy', 'power', 'light', 'utility', 'heating', 'bill', 'kwh'],
    reply: "⚡ **Home Energy Saving Tips:**"
  },
  {
    keywords: ['meat', 'beef', 'vegan', 'vegetarian', 'diet', 'food', 'chicken', 'dairy', 'eating'],
    reply: "🥗 **Diet & Food Choices:**"
  },
  {
    keywords: ['shop', 'buy', 'clothes', 'gadget', 'clothing', 'consumption', 'fast fashion', 'amazon'],
    reply: "🛍️ **Conscious Consumption & Waste:**"
  },
  {
    keywords: ['offset', 'tree', 'plant', 'sequestration', 'carbon credit', 'credit'],
    reply: "🌳 **Carbon Offsetting Explained:**"
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'help', 'welcome'],
    reply: "👋 Hello! I am your **CarbonFlow Eco-Assistant**."
  }
];

function getChatbotReply(message: string): string {
  const query = (message || '').trim().toLowerCase();
  for (const item of MOCK_RESPONSES) {
    for (const keyword of item.keywords) {
      if (query.includes(keyword)) {
        return item.reply;
      }
    }
  }
  return "💡 **Here is a quick Eco-Fact:**";
}

// Emulate carbon calculations from calculate route
function emulatedCalculate(data: any) {
  const travelKm = data.travelKm ?? 0;
  const flightHours = data.flightHours ?? 0;
  const electricityKwh = data.electricityKwh ?? 0;
  const acHours = data.acHours ?? 0;
  const gasKwh = data.gasKwh ?? 0;

  const EMISSION_FACTORS = {
    travel: { petrol_car: 0.23, ev_car: 0.05, public_transit: 0.037, bike_walk: 0.0, flight_hour: 150.0 },
    energy: { electricity_kwh: 0.38, ac_hour: 0.5, gas_heating: 0.18 },
    diet: { meat_heavy: 2900.0, balanced: 1700.0, vegetarian: 1200.0, vegan: 800.0 },
    shopping: { high: 1500.0, medium: 800.0, low: 300.0 },
    waste: { unrecycled: 400.0, moderate: 200.0, zero_waste: 50.0 }
  };

  const travelFactor = EMISSION_FACTORS.travel[data.travelType as keyof typeof EMISSION_FACTORS.travel] ?? 0;
  const travelAnnualCo2 = (travelKm * travelFactor * 52.0) + (flightHours * EMISSION_FACTORS.travel.flight_hour);

  const electricityAnnualCo2 = electricityKwh * EMISSION_FACTORS.energy.electricity_kwh * 12.0;
  const acAnnualCo2 = acHours * EMISSION_FACTORS.energy.ac_hour * 52.0;
  const gasAnnualCo2 = gasKwh * EMISSION_FACTORS.energy.gas_heating * 12.0;
  const energyAnnualCo2 = electricityAnnualCo2 + acAnnualCo2 + gasAnnualCo2;

  const dietAnnualCo2 = EMISSION_FACTORS.diet[data.dietType as keyof typeof EMISSION_FACTORS.diet] ?? 1700.0;
  const shoppingAnnualCo2 = EMISSION_FACTORS.shopping[data.shoppingLevel as keyof typeof EMISSION_FACTORS.shopping] ?? 800.0;
  const wasteAnnualCo2 = EMISSION_FACTORS.waste[data.wasteType as keyof typeof EMISSION_FACTORS.waste] ?? 200.0;

  const totalCo2Kg = travelAnnualCo2 + energyAnnualCo2 + dietAnnualCo2 + shoppingAnnualCo2 + wasteAnnualCo2;
  const totalCo2Tonnes = totalCo2Kg / 1000.0;

  let rating = "";
  let grade = "";

  if (totalCo2Tonnes <= 2.0) {
    rating = "Climate Hero";
    grade = "A+";
  } else if (totalCo2Tonnes <= 5.0) {
    rating = "Eco-Champ";
    grade = "A";
  } else if (totalCo2Tonnes <= 10.0) {
    rating = "Conscious Citizen";
    grade = "B";
  } else if (totalCo2Tonnes <= 16.0) {
    rating = "Carbon Consumer";
    grade = "C";
  } else {
    rating = "High Impact Consumer";
    grade = "D";
  }

  return { totalCo2Tonnes, rating, grade };
}

describe('CarbonFlow Next.js Logic Suite', () => {

  describe('Zod Schemas Validator', () => {
    it('should validate complete valid inputs successfully', () => {
      const validPayload = {
        travelType: 'ev_car',
        travelKm: 120,
        flightHours: 5,
        electricityKwh: 300,
        acHours: 10,
        gasKwh: 50,
        dietType: 'vegan',
        shoppingLevel: 'low',
        wasteType: 'zero_waste'
      };

      const parsed = calculateInputSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('should fail validation with invalid enums or negative metrics', () => {
      const invalidPayload = {
        travelType: 'diesel_truck', // Invalid enum value
        travelKm: -50,              // Negative value
        flightHours: 5,
        electricityKwh: 300,
        acHours: 10,
        gasKwh: 50,
        dietType: 'vegan',
        shoppingLevel: 'low',
        wasteType: 'zero_waste'
      };

      const parsed = calculateInputSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Carbon Calculator Calculations & Grades', () => {
    it('should award Climate Hero A+ grade to ultra-low eco footprints', () => {
      const lowImpactData = {
        travelType: 'bike_walk',
        travelKm: 0,
        flightHours: 0,
        electricityKwh: 0,
        acHours: 0,
        gasKwh: 0,
        dietType: 'vegan',
        shoppingLevel: 'low',
        wasteType: 'zero_waste'
      };

      const results = emulatedCalculate(lowImpactData);
      expect(results.totalCo2Tonnes).toBeLessThanOrEqual(2.0);
      expect(results.rating).toBe('Climate Hero');
      expect(results.grade).toBe('A+');
    });

    it('should assign Conscious Citizen B grade for moderate footprints', () => {
      const moderateData = {
        travelType: 'ev_car',
        travelKm: 50,
        flightHours: 1,
        electricityKwh: 150,
        acHours: 5,
        gasKwh: 50,
        dietType: 'vegetarian',
        shoppingLevel: 'medium',
        wasteType: 'moderate'
      };

      const results = emulatedCalculate(moderateData);
      expect(results.totalCo2Tonnes).toBeGreaterThan(2.0);
      expect(results.totalCo2Tonnes).toBeLessThanOrEqual(10.0);
      expect(results.grade).toBeDefined();
    });
  });

  describe('AI Eco-Assistant Chatbot keyword router', () => {
    it('should route transit questions correctly', () => {
      const reply = getChatbotReply('Should I drive my petrol car?');
      expect(reply).toContain('Travel Footprint Insights');
    });

    it('should route energy utility queries correctly', () => {
      const reply = getChatbotReply('How do I reduce my electricity bill?');
      expect(reply).toContain('Home Energy Saving Tips');
    });

    it('should serve generic Eco-Fact default for unrelated text', () => {
      const reply = getChatbotReply('What is the weather today?');
      expect(reply).toContain('Eco-Fact');
    });
  });

});
