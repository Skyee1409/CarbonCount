import { CalculateInput } from '../validators/schemas';

export async function calculateCarbon(data: CalculateInput) {
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Carbon calculation service failed');
  }
  return response.json();
}

export async function scanElectricityBill(file: File) {
  const formData = new FormData();
  formData.append('billFile', file);
  formData.append('fileName', file.name);

  const response = await fetch('/api/scan-bill', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('OCR bill scanning service failed');
  }
  return response.json();
}

export async function askChatbot(message: string) {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error('Eco-Assistant chatbot service failed');
  }
  return response.json();
}

export async function getLeaderboards() {
  const response = await fetch('/api/leaderboard');
  if (!response.ok) {
    throw new Error('Leaderboard service failed');
  }
  return response.json();
}
