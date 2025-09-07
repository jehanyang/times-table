import React, { useState } from 'react';
import type { PracticeSettings } from '../types';

interface NumberSelectorProps {
  selectedNumbers: number[];
  onSelectionChange: (numbers: number[]) => void;
  onStartPractice: () => void;
  practiceSettings?: PracticeSettings;
  onSettingsChange?: (settings: PracticeSettings) => void;
}

const NumberSelector: React.FC<NumberSelectorProps> = ({
  selectedNumbers,
  onSelectionChange,
  onStartPractice,
  practiceSettings,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleNumberToggle = (number: number) => {
    if (selectedNumbers.includes(number)) {
      onSelectionChange(selectedNumbers.filter(n => n !== number));
    } else {
      onSelectionChange([...selectedNumbers, number]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(numbers);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleSettingsChange = (key: keyof PracticeSettings, value: any) => {
    if (practiceSettings && onSettingsChange) {
      onSettingsChange({
        ...practiceSettings,
        [key]: value
      });
    }
  };

  return (
    <div className="number-selector">
      <div className="header">
        <h1>Times Table Practice</h1>
        <p>Select which multiplication tables you'd like to practice:</p>
      </div>

      <div className="controls">
        <div className="selection-controls">
          <button onClick={handleSelectAll} className="control-btn">
            Select All
          </button>
          <button onClick={handleClearAll} className="control-btn">
            Clear All
          </button>
        </div>
        {practiceSettings && onSettingsChange && (
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="control-btn settings-btn"
          >
            ⚙️ Settings
          </button>
        )}
      </div>

      <div className="number-grid">
        {numbers.map(number => (
          <label key={number} className="number-option">
            <input
              type="checkbox"
              checked={selectedNumbers.includes(number)}
              onChange={() => handleNumberToggle(number)}
            />
            <span className="number-display">
              {number}
            </span>
            <span className="table-label">
              {number} times table
            </span>
          </label>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && practiceSettings && onSettingsChange && (
        <div className="settings-panel">
          <h3>Practice Settings</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={practiceSettings.adaptiveDifficulty}
                onChange={(e) => handleSettingsChange('adaptiveDifficulty', e.target.checked)}
              />
              <span>Adaptive Difficulty</span>
            </label>
            <p className="setting-description">
              Show questions you struggle with more often
            </p>
          </div>

          {practiceSettings.adaptiveDifficulty && (
            <div className="setting-item">
              <label className="setting-label">
                <span>Difficulty Multiplier: {practiceSettings.difficultyMultiplier.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={practiceSettings.difficultyMultiplier}
                onChange={(e) => handleSettingsChange('difficultyMultiplier', parseFloat(e.target.value))}
                className="difficulty-slider"
              />
              <p className="setting-description">
                How much more often difficult questions appear (1.0 = normal, 3.0 = 3x more often)
              </p>
            </div>
          )}

          <div className="setting-item">
            <label className="setting-label">
              <span>Session Length: {practiceSettings.sessionLength || 20} questions</span>
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={practiceSettings.sessionLength || 20}
              onChange={(e) => handleSettingsChange('sessionLength', parseInt(e.target.value))}
              className="session-length-slider"
            />
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <span>Question Transition Delay: {(practiceSettings.questionDelay / 1000).toFixed(1)}s</span>
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={practiceSettings.questionDelay}
              onChange={(e) => handleSettingsChange('questionDelay', parseInt(e.target.value))}
              className="question-delay-slider"
            />
            <p className="setting-description">
              Time to show feedback before moving to the next question
            </p>
          </div>
        </div>
      )}

      <div className="selected-info">
        {selectedNumbers.length > 0 ? (
          <p>
            Selected: {selectedNumbers.sort((a, b) => a - b).join(', ')} 
            ({selectedNumbers.length} table{selectedNumbers.length !== 1 ? 's' : ''})
          </p>
        ) : (
          <p>No tables selected</p>
        )}
      </div>

      <div className="start-section">
        <button
          onClick={onStartPractice}
          disabled={selectedNumbers.length === 0}
          className="start-btn"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default NumberSelector;