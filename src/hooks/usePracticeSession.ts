import { useState, useCallback, useRef } from 'react';
import type { SessionStats, QuestionResult, Question } from '../types';

interface UsePracticeSessionReturn {
  sessionStats: SessionStats | null;
  startSession: () => void;
  submitAnswer: (question: Question, userAnswer: number, timeSpent: number) => void;
  endSession: () => void;
  isSessionActive: boolean;
}

export const usePracticeSession = (): UsePracticeSessionReturn => {
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const questionStartTime = useRef<number>(0);

  const startSession = useCallback(() => {
    const newSession: SessionStats = {
      correct: 0,
      total: 0,
      startTime: new Date(),
      questions: []
    };
    
    setSessionStats(newSession);
    setIsSessionActive(true);
    questionStartTime.current = Date.now();
  }, []);

  const submitAnswer = useCallback((
    question: Question, 
    userAnswer: number, 
    timeSpent?: number
  ) => {
    if (!sessionStats) return;

    const actualTimeSpent = timeSpent ?? (Date.now() - questionStartTime.current);
    const isCorrect = userAnswer === question.answer;
    
    const questionResult: QuestionResult = {
      question,
      userAnswer,
      isCorrect,
      timeSpent: actualTimeSpent
    };

    setSessionStats(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        questions: [...prev.questions, questionResult]
      };
    });

    // Reset timer for next question
    questionStartTime.current = Date.now();
  }, [sessionStats]);

  const endSession = useCallback(() => {
    setSessionStats(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        endTime: new Date()
      };
    });
    
    setIsSessionActive(false);
  }, []);

  return {
    sessionStats,
    startSession,
    submitAnswer,
    endSession,
    isSessionActive
  };
};