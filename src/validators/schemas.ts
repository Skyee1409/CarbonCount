import { z } from 'zod';

export const calculateInputSchema = z.object({
  travelType: z.enum(['petrol_car', 'ev_car', 'public_transit', 'bike_walk']),
  travelKm: z.number().nonnegative().default(0),
  flightHours: z.number().nonnegative().default(0),
  electricityKwh: z.number().nonnegative().default(0),
  acHours: z.number().nonnegative().default(0),
  gasKwh: z.number().nonnegative().default(0),
  dietType: z.enum(['meat_heavy', 'balanced', 'vegetarian', 'vegan']),
  shoppingLevel: z.enum(['low', 'medium', 'high']),
  wasteType: z.enum(['zero_waste', 'moderate', 'unrecycled'])
});

export type CalculateInput = z.infer<typeof calculateInputSchema>;
