import React, { useState, useEffect, useRef } from 'react';
import type { Question } from '../types';

interface PracticeSessionProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  score: { correct: number; total: number };
  onAnswerSubmit: (answer: number) => void;
  onEndSession: () => void;
  questionDelay?: number; // Delay in milliseconds between questions
}

const PracticeSession: React.FC<PracticeSessionProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  score,
  onAnswerSubmit,
  onEndSession,
  questionDelay = 1500
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer?: number;
  }>({ show: false, isCorrect: false });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Focus when new question appears
  useEffect(() => {
    setUserAnswer('');
    setFeedback({ show: false, isCorrect: false });
    
    // Focus input when new question appears - use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userAnswer.trim() === '') return;
    
    const answer = parseInt(userAnswer);
    const isCorrect = answer === currentQuestion.answer;
    
    // Show feedback
    setFeedback({
      show: true,
      isCorrect,
      correctAnswer: currentQuestion.answer
    });
    
    // Submit the answer after a configurable delay to show feedback
    setTimeout(() => {
      onAnswerSubmit(answer);
      // Focus will be handled by the useEffect when the new question loads
    }, questionDelay);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setUserAnswer(value);
    }
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const progress = ((questionIndex) / totalQuestions) * 100;

  return (
    <div className="practice-session">
      <div className="session-header">
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            Question {questionIndex + 1} of {totalQuestions}
          </div>
        </div>
        
        <div className="score-section">
          <div className="score">
            Score: {score.correct}/{score.total}
          </div>
          <div className="accuracy">
            {accuracy}% Accuracy
          </div>
        </div>
        
        <button onClick={onEndSession} className="end-btn">
          End Session
        </button>
      </div>

      <div className="question-section">
        <div className="question">
          <span className="factor">{currentQuestion.factor1}</span>
          <span className="operator">×</span>
          <span className="factor">{currentQuestion.factor2}</span>
          <span className="equals">=</span>
          <span className="answer-placeholder">?</span>
        </div>

        <form onSubmit={handleSubmit} className="answer-form">
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={handleInputChange}
            placeholder="Type your answer..."
            className="answer-input"
            disabled={feedback.show}
          />
          <button 
            type="submit" 
            disabled={userAnswer.trim() === '' || feedback.show}
            className="submit-btn"
          >
            Submit
          </button>
        </form>

        {feedback.show && (
          <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback.isCorrect ? (
              <div>
                <div className="feedback-icon">✓</div>
                <div className="feedback-text">Correct!</div>
              </div>
            ) : (
              <div>
                <div className="feedback-icon">✗</div>
                <div className="feedback-text">
                  The answer is {feedback.correctAnswer}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="instructions">
        <p>Type your answer and press Enter, or click Submit</p>
      </div>
    </div>
  );
};

export default PracticeSession;