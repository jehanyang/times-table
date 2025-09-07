import { useState, useCallback } from 'react';
import type { Question } from '../types';
import { generateRandomQuestion, generateQuestionSet } from '../utils/questionGenerator';

interface UseQuestionGeneratorReturn {
  currentQuestion: Question | null;
  questionSet: Question[];
  questionIndex: number;
  generateNewQuestion: () => Question | null;
  generateNewSet: (selectedTables: number[], count?: number) => void;
  setQuestionSet: (questions: Question[]) => void;
  nextQuestion: () => Question | null;
  hasMoreQuestions: boolean;
  resetGenerator: () => void;
}

export const useQuestionGenerator = (
  selectedTables: number[] = []
): UseQuestionGeneratorReturn => {
  const [questionSet, setQuestionSet] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  const generateNewQuestion = useCallback((): Question | null => {
    if (selectedTables.length === 0) return null;
    
    try {
      const newQuestion = generateRandomQuestion(selectedTables);
      setCurrentQuestion(newQuestion);
      return newQuestion;
    } catch (error) {
      console.error('Error generating question:', error);
      return null;
    }
  }, [selectedTables]);

  const generateNewSet = useCallback((
    tables: number[], 
    count: number = 20
  ): void => {
    if (tables.length === 0) {
      setQuestionSet([]);
      setCurrentQuestion(null);
      setQuestionIndex(0);
      return;
    }
    
    try {
      const newSet = generateQuestionSet(tables, count);
      setQuestionSet(newSet);
      setQuestionIndex(0);
      
      // Set the first question as current
      if (newSet.length > 0) {
        setCurrentQuestion(newSet[0]);
      } else {
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error generating question set:', error);
      setQuestionSet([]);
      setCurrentQuestion(null);
      setQuestionIndex(0);
    }
  }, []);

  const nextQuestion = useCallback((): Question | null => {
    const nextIndex = questionIndex + 1;
    
    if (nextIndex < questionSet.length) {
      setQuestionIndex(nextIndex);
      const next = questionSet[nextIndex];
      setCurrentQuestion(next);
      return next;
    } else {
      // No more questions in the set
      setCurrentQuestion(null);
      return null;
    }
  }, [questionIndex, questionSet]);

  const hasMoreQuestions = questionIndex < questionSet.length - 1;

  const setQuestions = useCallback((questions: Question[]) => {
    setQuestionSet(questions);
    setQuestionIndex(0);
    if (questions.length > 0) {
      setCurrentQuestion(questions[0]);
    } else {
      setCurrentQuestion(null);
    }
  }, []);

  const resetGenerator = useCallback(() => {
    setQuestionSet([]);
    setQuestionIndex(0);
    setCurrentQuestion(null);
  }, []);

  return {
    currentQuestion,
    questionSet,
    questionIndex,
    generateNewQuestion,
    generateNewSet,
    setQuestionSet: setQuestions,
    nextQuestion,
    hasMoreQuestions,
    resetGenerator
  };
};