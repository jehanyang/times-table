import type { SessionStats, ImprovementIndicator, QuestionStats, QuestionAttempt } from '../types';

export const calculateImprovementIndicators = (
  sessionStats: SessionStats,
  currentQuestionStats: QuestionStats
): ImprovementIndicator[] => {
  const improvements: ImprovementIndicator[] = [];
  
  for (const questionResult of sessionStats.questions) {
    const { question } = questionResult;
    const questionKey = `${question.factor1}x${question.factor2}`;
    const reverseKey = `${question.factor2}x${question.factor1}`;
    
    const stat = currentQuestionStats[questionKey] || currentQuestionStats[reverseKey];
    
    if (!stat || !stat.recentAttempts || stat.recentAttempts.length < 6) {
      // Need at least 6 attempts to calculate meaningful improvement
      continue;
    }
    
    // Split attempts into recent (last 3) and previous (3 before that)
    const sortedAttempts = [...stat.recentAttempts].sort((a, b) => a.date.getTime() - b.date.getTime());
    const recentAttempts = sortedAttempts.slice(-3);
    const previousAttempts = sortedAttempts.slice(-6, -3);
    
    if (recentAttempts.length < 3 || previousAttempts.length < 3) {
      continue;
    }
    
    const recentAverageTime = calculateAverageTime(recentAttempts);
    const previousAverageTime = calculateAverageTime(previousAttempts);
    
    if (previousAverageTime === 0) continue;
    
    const improvement = ((previousAverageTime - recentAverageTime) / previousAverageTime) * 100;
    const isSignificant = Math.abs(improvement) >= 15;
    
    improvements.push({
      questionKey,
      factor1: question.factor1,
      factor2: question.factor2,
      recentAverageTime,
      previousAverageTime,
      improvement,
      isSignificant
    });
  }
  
  return improvements.filter(imp => imp.isSignificant);
};

const calculateAverageTime = (attempts: QuestionAttempt[]): number => {
  if (attempts.length === 0) return 0;
  const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
  return totalTime / attempts.length;
};

export const updateQuestionStatsWithAttempts = (
  currentStats: QuestionStats,
  sessionStats: SessionStats
): QuestionStats => {
  const updatedStats = { ...currentStats };
  
  for (const questionResult of sessionStats.questions) {
    const { question, timeSpent, isCorrect } = questionResult;
    const questionKey = `${question.factor1}x${question.factor2}`;
    
    if (!updatedStats[questionKey]) {
      updatedStats[questionKey] = {
        factor1: question.factor1,
        factor2: question.factor2,
        attempts: 0,
        correct: 0,
        totalTime: 0,
        averageTime: 0,
        successRate: 0,
        lastAttempted: new Date(),
        recentAttempts: []
      };
    }
    
    const stat = updatedStats[questionKey];
    
    // Add new attempt to recent attempts
    const newAttempt: QuestionAttempt = {
      timeSpent,
      isCorrect,
      date: new Date()
    };
    
    if (!stat.recentAttempts) {
      stat.recentAttempts = [];
    }
    
    stat.recentAttempts.push(newAttempt);
    
    // Keep only the last 10 attempts
    if (stat.recentAttempts.length > 10) {
      stat.recentAttempts = stat.recentAttempts.slice(-10);
    }
    
    // Update overall stats
    stat.attempts++;
    if (isCorrect) stat.correct++;
    stat.totalTime += timeSpent;
    stat.averageTime = Math.round(stat.totalTime / stat.attempts);
    stat.successRate = Math.round((stat.correct / stat.attempts) * 100);
    stat.lastAttempted = new Date();
  }
  
  return updatedStats;
};

export const formatImprovementMessage = (improvement: ImprovementIndicator): string => {
  const timeChange = Math.abs(improvement.previousAverageTime - improvement.recentAverageTime);
  const timeFormatted = (timeChange / 1000).toFixed(1);
  
  if (improvement.improvement > 0) {
    return `${improvement.factor1} × ${improvement.factor2}: ${timeFormatted}s faster (${improvement.improvement.toFixed(1)}% improvement)`;
  } else {
    return `${improvement.factor1} × ${improvement.factor2}: ${timeFormatted}s slower (${Math.abs(improvement.improvement).toFixed(1)}% decline)`;
  }
};