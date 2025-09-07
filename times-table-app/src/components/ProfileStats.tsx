import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { formatTime } from '../utils/scoreCalculator';

interface ProfileStatsProps {
  user: UserProfile;
  onBack: () => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user, onBack }) => {
  const [sortBy, setSortBy] = useState<'attempts' | 'successRate' | 'averageTime'>('attempts');
  const [filterTable, setFilterTable] = useState<number | 'all'>('all');

  // Get all question stats and sort them
  const questionStats = Object.entries(user.questionStats)
    .map(([key, stat]) => ({ key, ...stat }))
    .filter(stat => filterTable === 'all' || stat.factor1 === filterTable || stat.factor2 === filterTable)
    .sort((a, b) => {
      switch (sortBy) {
        case 'attempts':
          return b.attempts - a.attempts;
        case 'successRate':
          return b.successRate - a.successRate;
        case 'averageTime':
          return a.averageTime - b.averageTime;
        default:
          return 0;
      }
    });

  // Get multiplication tables that the user has practiced
  const practicedTables = Array.from(new Set(
    Object.values(user.questionStats).flatMap(stat => [stat.factor1, stat.factor2])
  )).sort((a, b) => a - b);

  // Calculate overall statistics
  const overallStats = {
    totalQuestions: user.totalQuestions,
    totalCorrect: user.totalCorrect,
    overallAccuracy: user.totalQuestions > 0 ? Math.round((user.totalCorrect / user.totalQuestions) * 100) : 0,
    totalSessions: user.totalSessions,
    averageQuestionsPerSession: user.totalSessions > 0 ? Math.round(user.totalQuestions / user.totalSessions) : 0
  };

  // Get best and worst performing questions
  const sortedBySuccess = [...questionStats].sort((a, b) => b.successRate - a.successRate);
  const bestQuestions = sortedBySuccess.slice(0, 3);
  const worstQuestions = sortedBySuccess.slice(-3).reverse();

  // Get most and least practiced questions
  const sortedByAttempts = [...questionStats].sort((a, b) => b.attempts - a.attempts);
  const mostPracticed = sortedByAttempts.slice(0, 5);
  const leastPracticed = sortedByAttempts.slice(-5).reverse();

  return (
    <div className="profile-stats">
      <div className="stats-header">
        <h1>{user.name}'s Performance Statistics</h1>
        <button onClick={onBack} className="back-btn">
          ← Back to Profile
        </button>
      </div>

      {/* Overall Statistics */}
      <section className="overall-stats">
        <h2>Overall Performance</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-value">{overallStats.overallAccuracy}%</div>
            <div className="stat-label">Overall Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overallStats.totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overallStats.totalQuestions}</div>
            <div className="stat-label">Questions Answered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{overallStats.averageQuestionsPerSession}</div>
            <div className="stat-label">Avg Questions/Session</div>
          </div>
        </div>
      </section>

      {/* Performance Insights */}
      <section className="performance-insights">
        <h2>Performance Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Best Performance</h3>
            {bestQuestions.length > 0 ? (
              <div className="question-list">
                {bestQuestions.map(q => (
                  <div key={q.key} className="question-item success">
                    <span className="question">{q.factor1} × {q.factor2}</span>
                    <span className="rate">{q.successRate}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No data available</p>
            )}
          </div>
          
          <div className="insight-card">
            <h3>Needs Practice</h3>
            {worstQuestions.length > 0 ? (
              <div className="question-list">
                {worstQuestions.map(q => (
                  <div key={q.key} className="question-item needs-work">
                    <span className="question">{q.factor1} × {q.factor2}</span>
                    <span className="rate">{q.successRate}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No data available</p>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Question Statistics */}
      <section className="detailed-stats">
        <div className="section-header">
          <h2>Question-by-Question Statistics</h2>
          <div className="controls">
            <select 
              value={filterTable} 
              onChange={(e) => setFilterTable(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="filter-select"
            >
              <option value="all">All Tables</option>
              {practicedTables.map(table => (
                <option key={table} value={table}>{table} Times Table</option>
              ))}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="attempts">Sort by Attempts</option>
              <option value="successRate">Sort by Success Rate</option>
              <option value="averageTime">Sort by Average Time</option>
            </select>
          </div>
        </div>

        {questionStats.length > 0 ? (
          <div className="questions-table">
            <div className="table-header">
              <span className="col-question">Question</span>
              <span className="col-attempts">Attempts</span>
              <span className="col-success">Success Rate</span>
              <span className="col-time">Avg Time</span>
              <span className="col-last">Last Attempted</span>
            </div>
            {questionStats.map(stat => (
              <div key={stat.key} className="table-row">
                <span className="col-question">
                  <strong>{stat.factor1} × {stat.factor2}</strong> = {stat.factor1 * stat.factor2}
                </span>
                <span className="col-attempts">{stat.attempts}</span>
                <span className={`col-success ${stat.successRate >= 80 ? 'good' : stat.successRate >= 60 ? 'okay' : 'poor'}`}>
                  {stat.successRate}%
                </span>
                <span className="col-time">{formatTime(stat.averageTime)}</span>
                <span className="col-last">
                  {new Date(stat.lastAttempted).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-stats">
            <p>
              {filterTable === 'all' 
                ? 'No practice data available yet. Complete some practice sessions to see detailed statistics!'
                : `No practice data for the ${filterTable} times table yet.`
              }
            </p>
          </div>
        )}
      </section>

      {/* Most and Least Practiced */}
      {questionStats.length > 0 && (
        <section className="practice-frequency">
          <h2>Practice Frequency</h2>
          <div className="frequency-grid">
            <div className="frequency-card">
              <h3>Most Practiced</h3>
              <div className="frequency-list">
                {mostPracticed.map(q => (
                  <div key={q.key} className="frequency-item">
                    <span className="question">{q.factor1} × {q.factor2}</span>
                    <span className="count">{q.attempts} attempts</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="frequency-card">
              <h3>Least Practiced</h3>
              <div className="frequency-list">
                {leastPracticed.map(q => (
                  <div key={q.key} className="frequency-item">
                    <span className="question">{q.factor1} × {q.factor2}</span>
                    <span className="count">{q.attempts} attempts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfileStats;