import type { SessionStats, QuestionResult } from '../types';

export const calculateAccuracy = (sessionStats: SessionStats): number => {
  if (sessionStats.total === 0) return 0;
  return Math.round((sessionStats.correct / sessionStats.total) * 100);
};

export const calculateTotalTime = (sessionStats: SessionStats): number => {
  if (!sessionStats.endTime) return 0;
  return sessionStats.endTime.getTime() - sessionStats.startTime.getTime();
};

export const calculateAverageTime = (sessionStats: SessionStats): number => {
  if (sessionStats.questions.length === 0) return 0;
  const totalTime = sessionStats.questions.reduce((sum, q) => sum + q.timeSpent, 0);
  return Math.round(totalTime / sessionStats.questions.length);
};

export const getPerformanceByTable = (sessionStats: SessionStats): Record<number, { correct: number; total: number; accuracy: number }> => {
  const tableStats: Record<number, { correct: number; total: number; accuracy: number }> = {};
  
  sessionStats.questions.forEach(questionResult => {
    const { factor1, factor2 } = questionResult.question;
    const tables = [factor1, factor2];
    
    tables.forEach(table => {
      if (!tableStats[table]) {
        tableStats[table] = { correct: 0, total: 0, accuracy: 0 };
      }
      
      tableStats[table].total++;
      if (questionResult.isCorrect) {
        tableStats[table].correct++;
      }
    });
  });
  
  // Calculate accuracy for each table
  Object.keys(tableStats).forEach(table => {
    const stats = tableStats[parseInt(table)];
    stats.accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  });
  
  return tableStats;
};

export const getPerformanceGrade = (accuracy: number): { grade: string; color: string; message: string } => {
  if (accuracy >= 95) {
    return { grade: 'A+', color: '#22c55e', message: 'Excellent work!' };
  } else if (accuracy >= 90) {
    return { grade: 'A', color: '#16a34a', message: 'Great job!' };
  } else if (accuracy >= 85) {
    return { grade: 'B+', color: '#65a30d', message: 'Very good!' };
  } else if (accuracy >= 80) {
    return { grade: 'B', color: '#84cc16', message: 'Good work!' };
  } else if (accuracy >= 75) {
    return { grade: 'B-', color: '#a3a3a3', message: 'Keep practicing!' };
  } else if (accuracy >= 70) {
    return { grade: 'C+', color: '#f59e0b', message: 'You\'re improving!' };
  } else if (accuracy >= 65) {
    return { grade: 'C', color: '#f97316', message: 'More practice needed!' };
  } else {
    return { grade: 'C-', color: '#ef4444', message: 'Keep trying!' };
  }
};

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const getStreakInfo = (questions: QuestionResult[]): { currentStreak: number; longestStreak: number } => {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate current streak (from the end)
  for (let i = questions.length - 1; i >= 0; i--) {
    if (questions[i].isCorrect) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (const question of questions) {
    if (question.isCorrect) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return { currentStreak, longestStreak };
};