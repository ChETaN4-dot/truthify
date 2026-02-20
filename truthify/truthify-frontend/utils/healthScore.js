export const calculateHealthScore = (flaggedIngredients) => {
  let score = 100;

  flaggedIngredients.forEach(ing => {
    switch (ing.data.risk) {
      case 'High':
        score -= 30;
        break;
      case 'Moderate':
        score -= 20;
        break;
      case 'Environmental':
        score -= 10;
        break;
      default:
        break;
    }
  });

  return Math.max(0, score);
};
