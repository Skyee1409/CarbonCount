import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    office: [
      { rank: 1, name: 'Engineering Team', emissions_reduction: '3,450 kg', members: 14, points: 890 },
      { rank: 2, name: 'Marketing & Design', emissions_reduction: '2,910 kg', members: 10, points: 740 },
      { rank: 3, name: 'Sales Department', emissions_reduction: '2,150 kg', members: 18, points: 680 },
      { rank: 4, name: 'HR & Operations', emissions_reduction: '1,950 kg', members: 8, points: 590 },
      { rank: 5, name: 'Finance & Legal', emissions_reduction: '1,200 kg', members: 6, points: 420 }
    ],
    school: [
      { rank: 1, name: 'Environmental Science Class', emissions_reduction: '4,100 kg', members: 28, points: 950 },
      { rank: 2, name: 'Grade 11 Physics B', emissions_reduction: '3,200 kg', members: 24, points: 810 },
      { rank: 3, name: 'Eco-Club Alpha', emissions_reduction: '2,850 kg', members: 15, points: 790 },
      { rank: 4, name: 'Grade 10 Chemistry', emissions_reduction: '2,400 kg', members: 30, points: 690 },
      { rank: 5, name: 'Computer Science Department', emissions_reduction: '1,800 kg', members: 22, points: 530 }
    ],
    personal: [
      { rank: 1, name: 'GreenWarrior99', emissions_reduction: '1,450 kg', points: 650 },
      { rank: 2, name: 'EcoWizard_Joe', 'emissions_reduction': '1,200 kg', points: 580 },
      { rank: 3, name: 'TreePlanterLisa', 'emissions_reduction': '1,150 kg', points: 540 },
      { rank: 4, name: 'You (Current Profile)', 'emissions_reduction': '840 kg', points: 420 },
      { rank: 5, name: 'SolarPoweredGuy', 'emissions_reduction': '610 kg', points: 310 }
    ]
  };
  return NextResponse.json(data);
}
