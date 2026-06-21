import { NextResponse } from 'next/server';
import { calculateInputSchema } from '../../../validators/schemas';

const EMISSION_FACTORS = {
  travel: {
    petrol_car: 0.23,       // kg CO2 per km
    ev_car: 0.05,           // kg CO2 per km
    public_transit: 0.037,  // kg CO2 per km
    bike_walk: 0.0,         // kg CO2 per km
    flight_hour: 150.0      // kg CO2 per flight hour
  },
  energy: {
    electricity_kwh: 0.38,  // kg CO2 per kWh
    ac_hour: 0.5,           // kg CO2 per hour of AC use
    gas_heating: 0.18       // kg CO2 per kWh of gas
  },
  diet: {
    meat_heavy: 2900.0,     // kg CO2 per year
    balanced: 1700.0,       // kg CO2 per year
    vegetarian: 1200.0,     // kg CO2 per year
    vegan: 800.0            // kg CO2 per year
  },
  shopping: {
    high: 1500.0,           // kg CO2 per year
    medium: 800.0,          // kg CO2 per year
    low: 300.0              // kg CO2 per year
  },
  waste: {
    unrecycled: 400.0,      // kg CO2 per year
    moderate: 200.0,        // kg CO2 per year
    zero_waste: 50.0        // kg CO2 per year
  }
};

const NATIONAL_AVERAGE = 16.0;
const GLOBAL_TARGET = 2.0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod validation
    const parsed = calculateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }
    
    const data = parsed.data;

    // 1. Travel Emissions
    const travelFactor = EMISSION_FACTORS.travel[data.travelType];
    const travelAnnualCo2 = (data.travelKm * travelFactor * 52.0) + (data.flightHours * EMISSION_FACTORS.travel.flight_hour);

    // 2. Energy Emissions
    const electricityAnnualCo2 = data.electricityKwh * EMISSION_FACTORS.energy.electricity_kwh * 12.0;
    const acAnnualCo2 = data.acHours * EMISSION_FACTORS.energy.ac_hour * 52.0;
    const gasAnnualCo2 = data.gasKwh * EMISSION_FACTORS.energy.gas_heating * 12.0;
    const energyAnnualCo2 = electricityAnnualCo2 + acAnnualCo2 + gasAnnualCo2;

    // 3. Diet Emissions
    const dietAnnualCo2 = EMISSION_FACTORS.diet[data.dietType];

    // 4. Shopping Emissions
    const shoppingAnnualCo2 = EMISSION_FACTORS.shopping[data.shoppingLevel];

    // 5. Waste Emissions
    const wasteAnnualCo2 = EMISSION_FACTORS.waste[data.wasteType];

    // Totals
    const totalCo2Kg = travelAnnualCo2 + energyAnnualCo2 + dietAnnualCo2 + shoppingAnnualCo2 + wasteAnnualCo2;
    const totalCo2Tonnes = totalCo2Kg / 1000.0;

    // Rating and Grade
    let rating = "";
    let ratingDesc = "";
    let grade = "";

    if (totalCo2Tonnes <= GLOBAL_TARGET) {
      rating = "Climate Hero";
      ratingDesc = "Outstanding! Your footprint meets the sustainable global target to keep warming below 1.5°C.";
      grade = "A+";
    } else if (totalCo2Tonnes <= 5.0) {
      rating = "Eco-Champ";
      ratingDesc = "Great job! You are well below average and taking meaningful green steps.";
      grade = "A";
    } else if (totalCo2Tonnes <= 10.0) {
      rating = "Conscious Citizen";
      ratingDesc = "Good effort, but you still have potential areas where you can reduce emissions.";
      grade = "B";
    } else if (totalCo2Tonnes <= NATIONAL_AVERAGE) {
      rating = "Carbon Consumer";
      ratingDesc = "Your carbon footprint is around the national average. Let's look at ways to cut back.";
      grade = "C";
    } else {
      rating = "High Impact Consumer";
      ratingDesc = "Your carbon emissions are higher than average. Focus on the recommended actions below.";
      grade = "D";
    }

    return NextResponse.json({
      breakdown: {
        travel: Math.round(travelAnnualCo2 * 10) / 10,
        energy: Math.round(energyAnnualCo2 * 10) / 10,
        diet: Math.round(dietAnnualCo2 * 10) / 10,
        shopping: Math.round(shoppingAnnualCo2 * 10) / 10,
        waste: Math.round(wasteAnnualCo2 * 10) / 10
      },
      total_kg: Math.round(totalCo2Kg * 10) / 10,
      total_tonnes: Math.round(totalCo2Tonnes * 100) / 100,
      rating,
      rating_desc: ratingDesc,
      grade,
      national_average: NATIONAL_AVERAGE,
      global_target: GLOBAL_TARGET
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload request' }, { status: 400 });
  }
}
