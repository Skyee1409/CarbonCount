import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const billFile = formData.get('billFile');
    const fileName = formData.get('fileName') as string || 'electricity_bill.pdf';

    if (!billFile && !fileName) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Mock OCR parsing
    const kwhReadings = [120, 245, 380, 410, 185];
    const selectedKwh = kwhReadings[Math.floor(Math.random() * kwhReadings.length)];
    const monthlyCo2Kg = selectedKwh * 0.38; // 0.38 kg CO2/kWh

    return NextResponse.json({
      success: true,
      extracted_kwh: selectedKwh,
      estimated_monthly_co2_kg: Math.round(monthlyCo2Kg * 10) / 10,
      extracted_billing_period: "Last 30 Days",
      provider: "EcoPower Grid Co."
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process document' }, { status: 400 });
  }
}
