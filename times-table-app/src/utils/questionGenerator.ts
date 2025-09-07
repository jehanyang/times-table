import type { Question, QuestionStats, PracticeSettings } from '../types';

export const generateRandomQuestion = (selectedTables: number[]): Question => {
  if (selectedTables.length === 0) {
    throw new Error('No multiplication tables selected');
  }

  // Pick a random table from selected ones
  const randomTable = selectedTables[Math.floor(Math.random() * selectedTables.length)];
  
  // Generate a random factor between 1 and 12
  const randomFactor = Math.floor(Math.random() * 12) + 1;
  
  // Randomly decide which factor goes first for variety
  const factor1 = Math.random() < 0.5 ? randomTable : randomFactor;
  const factor2 = factor1 === randomTable ? randomFactor : randomTable;
  
  const answer = factor1 * factor2;
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    factor1,
    factor2,
    answer,
    id
  };
};

export const generateQuestionSet = (
  selectedTables: number[], 
  count: number = 20
): Question[] => {
  const questions: Question[] = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let question: Question;
    
    do {
      question = generateRandomQuestion(selectedTables);
      const combinationKey = `${Math.min(question.factor1, question.factor2)}-${Math.max(question.factor1, question.factor2)}`;
      
      if (!usedCombinations.has(combinationKey) || attempts > 50) {
        usedCombinations.add(combinationKey);
        break;
      }
      attempts++;
    } while (attempts <= 50);
    
    questions.push(question);
  }

  return questions;
};

export const generateAdaptiveQuestionSet = (
  selectedTables: number[], 
  count: number = 20,
  questionStats: QuestionStats,
  settings: PracticeSettings
): Question[] => {
  if (!settings.adaptiveDifficulty) {
    return generateQuestionSet(selectedTables, count);
  }

  const questionPool = createWeightedQuestionPool(selectedTables, questionStats, settings.difficultyMultiplier);
  const questions: Question[] = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let question: Question;
    
    do {
      question = selectFromWeightedPool(questionPool);
      const combinationKey = `${Math.min(question.factor1, question.factor2)}-${Math.max(question.factor1, question.factor2)}`;
      
      if (!usedCombinations.has(combinationKey) || attempts > 50) {
        usedCombinations.add(combinationKey);
        break;
      }
      attempts++;
    } while (attempts <= 50);
    
    questions.push(question);
  }

  return questions;
};

interface WeightedQuestion {
  factor1: number;
  factor2: number;
  weight: number;
}

const createWeightedQuestionPool = (
  selectedTables: number[],
  questionStats: QuestionStats,
  difficultyMultiplier: number
): WeightedQuestion[] => {
  const pool: WeightedQuestion[] = [];
  
  // Generate all possible combinations for selected tables
  for (const table of selectedTables) {
    for (let factor = 1; factor <= 12; factor++) {
      const factor1 = table;
      const factor2 = factor;
      
      // Calculate weight based on performance
      const weight = calculateQuestionWeight(factor1, factor2, questionStats, difficultyMultiplier);
      
      pool.push({ factor1, factor2, weight });
      
      // Also add the reverse to ensure variety
      if (factor1 !== factor2) {
        const reverseWeight = calculateQuestionWeight(factor2, factor1, questionStats, difficultyMultiplier);
        pool.push({ factor1: factor2, factor2: factor1, weight: reverseWeight });
      }
    }
  }
  
  return pool;
};

const calculateQuestionWeight = (
  factor1: number,
  factor2: number,
  questionStats: QuestionStats,
  difficultyMultiplier: number
): number => {
  const key1 = `${factor1}x${factor2}`;
  const key2 = `${factor2}x${factor1}`;
  
  const stat = questionStats[key1] || questionStats[key2];
  
  if (!stat || stat.attempts < 3) {
    // New questions get normal weight
    return 1.0;
  }
  
  // Base weight is 1.0
  let weight = 1.0;
  
  // Increase weight for low success rate (below 80%)
  if (stat.successRate < 80) {
    const successPenalty = (80 - stat.successRate) / 80; // 0 to 1
    weight += successPenalty * difficultyMultiplier;
  }
  
  // Increase weight for slow response times (above 3 seconds)
  if (stat.averageTime > 3000) {
    const timePenalty = Math.min((stat.averageTime - 3000) / 5000, 1); // Cap at 1
    weight += timePenalty * difficultyMultiplier;
  }
  
  return weight;
};

const selectFromWeightedPool = (pool: WeightedQuestion[]): Question => {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      return {
        factor1: item.factor1,
        factor2: item.factor2,
        answer: item.factor1 * item.factor2,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }
  
  // Fallback to last item
  const lastItem = pool[pool.length - 1];
  return {
    factor1: lastItem.factor1,
    factor2: lastItem.factor2,
    answer: lastItem.factor1 * lastItem.factor2,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};