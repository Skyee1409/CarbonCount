export const getEmissionsGrade = (t: number) => {
  if (t <= 2.0) return 'A+';
  if (t <= 5.0) return 'A';
  if (t <= 10.0) return 'B';
  if (t <= 16.0) return 'C';
  return 'D';
};

export const getEmissionsRating = (t: number) => {
  if (t <= 2.0) return 'Climate Hero';
  if (t <= 5.0) return 'Eco-Champ';
  if (t <= 10.0) return 'Conscious Citizen';
  if (t <= 16.0) return 'Carbon Consumer';
  return 'High Impact';
};

export const getEmissionsRatingDesc = (t: number) => {
  if (t <= 2.0) return 'Outstanding! Your footprint meets the sustainable global target to keep warming below 1.5°C.';
  if (t <= 5.0) return 'Great job! You are well below average and taking meaningful green steps.';
  if (t <= 10.0) return 'Good effort, but you still have potential areas where you can reduce emissions.';
  if (t <= 16.0) return "Your carbon footprint is around the national average. Let's look at ways to cut back.";
  return 'Your carbon emissions are higher than average. Focus on the recommended actions below.';
};
