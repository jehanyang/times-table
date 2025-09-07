import React from 'react';
import type { SessionStats, QuestionStats } from '../types';
import { 
  calculateAccuracy, 
  calculateTotalTime, 
  calculateAverageTime,
  getPerformanceByTable,
  getPerformanceGrade,
  formatTime,
  getStreakInfo
} from '../utils/scoreCalculator';
import { calculateImprovementIndicators, formatImprovementMessage } from '../utils/improvementTracker';

interface ResultsScreenProps {
  sessionStats: SessionStats;
  onNewSession: () => void;
  onChangeSettings: () => void;
  questionStats?: QuestionStats; // For improvement tracking
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  sessionStats,
  onNewSession,
  onChangeSettings,
  questionStats
}) => {
  const accuracy = calculateAccuracy(sessionStats);
  const totalTime = calculateTotalTime(sessionStats);
  const averageTime = calculateAverageTime(sessionStats);
  const grade = getPerformanceGrade(accuracy);
  const tablePerformance = getPerformanceByTable(sessionStats);
  const streakInfo = getStreakInfo(sessionStats.questions);
  
  // Calculate improvement indicators if we have question stats
  const improvements = questionStats ? calculateImprovementIndicators(sessionStats, questionStats) : [];

  return (
    <div className="results-screen">
      <div className="results-header">
        <h1>Practice Complete!</h1>
        <div className="grade-section" style={{ color: grade.color }}>
          <div className="grade">{grade.grade}</div>
          <div className="grade-message">{grade.message}</div>
        </div>
      </div>

      <div className="results-summary">
        <div className="stat-card primary">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{sessionStats.correct}</div>
          <div className="stat-label">Correct</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{sessionStats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatTime(totalTime)}</div>
          <div className="stat-label">Time</div>
        </div>
      </div>

      <div className="additional-stats">
        <div className="stat-row">
          <span className="stat-label">Average time per question:</span>
          <span className="stat-value">{formatTime(averageTime)}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Current streak:</span>
          <span className="stat-value">{streakInfo.currentStreak} correct</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Longest streak:</span>
          <span className="stat-value">{streakInfo.longestStreak} correct</span>
        </div>
      </div>

      {/* Improvement Indicators */}
      {improvements.length > 0 && (
        <div className="improvement-section">
          <h3>📈 Speed Improvements Detected!</h3>
          <div className="improvement-list">
            {improvements.map(improvement => (
              <div 
                key={improvement.questionKey} 
                className={`improvement-item ${improvement.improvement > 0 ? 'improved' : 'declined'}`}
              >
                <div className="improvement-icon">
                  {improvement.improvement > 0 ? '⚡' : '⏰'}
                </div>
                <div className="improvement-text">
                  {formatImprovementMessage(improvement)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-performance">
        <h3>Performance by Table</h3>
        <div className="table-grid">
          {Object.entries(tablePerformance)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([table, stats]) => (
              <div key={table} className="table-stat">
                <div className="table-number">{table}</div>
                <div className="table-accuracy">{stats.accuracy}%</div>
                <div className="table-fraction">
                  {stats.correct}/{stats.total}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="question-review">
        <h3>Question Review</h3>
        <div className="question-list">
          {sessionStats.questions.map((questionResult, index) => (
            <div 
              key={questionResult.question.id}
              className={`question-item ${questionResult.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="question-number">{index + 1}</div>
              <div className="question-text">
                {questionResult.question.factor1} × {questionResult.question.factor2} = {questionResult.question.answer}
              </div>
              <div className="user-answer">
                Your answer: {questionResult.userAnswer ?? 'No answer'}
              </div>
              <div className="question-time">
                {formatTime(questionResult.timeSpent)}
              </div>
              <div className="status-icon">
                {questionResult.isCorrect ? '✓' : '✗'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={onNewSession} className="primary-btn">
          Practice Again
        </button>
        <button onClick={onChangeSettings} className="secondary-btn">
          Change Settings
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;