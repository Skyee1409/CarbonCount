export interface EcoAction {
  id: string;
  title: string;
  category: string;
  carbonSaving: number;
  cashSaving: number;
  desc: string;
  icon: string;
  badge: string;
}

export const ECO_ACTIONS: EcoAction[] = [
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

export const CATEGORY_COLORS = {
  travel: '#10b981',    // Emerald
  energy: '#34d399',    // Mint
  diet: '#f59e0b',      // Orange
  shopping: '#8ea69a',  // Muted Slate
  waste: '#ef4444'      // Red
};
