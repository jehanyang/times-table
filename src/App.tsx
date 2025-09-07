import { useState, useCallback, useRef } from 'react';
import NumberSelector from './components/NumberSelector';
import PracticeSession from './components/PracticeSession';
import ResultsScreen from './components/ResultsScreen';
import UserProfileComponent from './components/UserProfile';
import ProfileStats from './components/ProfileStats';
import { useQuestionGenerator } from './hooks/useQuestionGenerator';
import { usePracticeSession } from './hooks/usePracticeSession';
import { useUserProfile } from './hooks/useUserProfile';
import { generateAdaptiveQuestionSet } from './utils/questionGenerator';
import type { ScreenType, PracticeSettings } from './types';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('profile');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [practiceSettings, setPracticeSettings] = useState<PracticeSettings>({
    selectedTables: [],
    adaptiveDifficulty: false,
    difficultyMultiplier: 2.0,
    sessionLength: 20,
    questionDelay: 1500
  });
  const questionStartTime = useRef<number>(0);
  
  const questionGenerator = useQuestionGenerator(selectedTables);
  const practiceSession = usePracticeSession();
  const userProfile = useUserProfile();

  const handleSelectionChange = useCallback((numbers: number[]) => {
    setSelectedTables(numbers);
    setPracticeSettings(prev => ({
      ...prev,
      selectedTables: numbers
    }));
  }, []);

  const handleStartPractice = useCallback(() => {
    if (selectedTables.length === 0) return;
    
    const sessionLength = practiceSettings.sessionLength || 20;
    
    if (practiceSettings.adaptiveDifficulty && userProfile.currentUser) {
      // Use adaptive difficulty
      const adaptiveQuestions = generateAdaptiveQuestionSet(
        selectedTables,
        sessionLength,
        userProfile.currentUser.questionStats,
        practiceSettings
      );
      questionGenerator.setQuestionSet(adaptiveQuestions);
    } else {
      // Use regular question generation
      questionGenerator.generateNewSet(selectedTables, sessionLength);
    }
    
    practiceSession.startSession();
    questionStartTime.current = Date.now();
    setCurrentScreen('practice');
  }, [selectedTables, practiceSettings, questionGenerator, practiceSession, userProfile.currentUser]);

  const handleAnswerSubmit = useCallback((userAnswer: number) => {
    if (!questionGenerator.currentQuestion) return;
    
    practiceSession.submitAnswer(
      questionGenerator.currentQuestion, 
      userAnswer,
      Date.now() - questionStartTime.current
    );
    
    if (questionGenerator.hasMoreQuestions) {
      questionGenerator.nextQuestion();
      questionStartTime.current = Date.now();
    } else {
      practiceSession.endSession();
      
      // Update user stats if there's a current user and session
      if (userProfile.currentUser && practiceSession.sessionStats) {
        userProfile.updateUserStats(practiceSession.sessionStats);
      }
      
      setCurrentScreen('results');
    }
  }, [questionGenerator, practiceSession]);

  const handleEndSession = useCallback(() => {
    practiceSession.endSession();
    
    // Update user stats if there's a current user and session
    if (userProfile.currentUser && practiceSession.sessionStats) {
      userProfile.updateUserStats(practiceSession.sessionStats);
    }
    
    setCurrentScreen('results');
  }, [practiceSession, userProfile]);

  const handleNewSession = useCallback(() => {
    const sessionLength = practiceSettings.sessionLength || 20;
    
    if (practiceSettings.adaptiveDifficulty && userProfile.currentUser) {
      // Use adaptive difficulty
      const adaptiveQuestions = generateAdaptiveQuestionSet(
        selectedTables,
        sessionLength,
        userProfile.currentUser.questionStats,
        practiceSettings
      );
      questionGenerator.setQuestionSet(adaptiveQuestions);
    } else {
      // Use regular question generation
      questionGenerator.generateNewSet(selectedTables, sessionLength);
    }
    
    practiceSession.startSession();
    questionStartTime.current = Date.now();
    setCurrentScreen('practice');
  }, [selectedTables, practiceSettings, questionGenerator, practiceSession, userProfile.currentUser]);

  const handleChangeSettings = useCallback(() => {
    questionGenerator.resetGenerator();
    setCurrentScreen('setup');
  }, [questionGenerator]);

  // Profile-related handlers
  const handleCreateUser = useCallback((name: string) => {
    const newUser = userProfile.createUser(name);
    userProfile.selectUser(newUser.id);
  }, [userProfile]);

  const handleSelectUser = useCallback((userId: string) => {
    userProfile.selectUser(userId);
  }, [userProfile]);

  const handleDeleteUser = useCallback((userId: string) => {
    userProfile.removeUser(userId);
  }, [userProfile]);

  const handleViewProfile = useCallback(() => {
    setShowDetailedStats(true);
  }, []);

  const handleBackToProfile = useCallback(() => {
    setShowDetailedStats(false);
  }, []);

  const handleBackToSetup = useCallback(() => {
    setCurrentScreen('setup');
  }, []);

  const handleShowProfile = useCallback(() => {
    setCurrentScreen('profile');
    setShowDetailedStats(false);
  }, []);

  const handleSettingsChange = useCallback((settings: PracticeSettings) => {
    setPracticeSettings(settings);
  }, []);

  const renderCurrentScreen = () => {
    // Show detailed stats if requested
    if (currentScreen === 'profile' && showDetailedStats && userProfile.currentUser) {
      return (
        <ProfileStats
          user={userProfile.currentUser}
          onBack={handleBackToProfile}
        />
      );
    }

    switch (currentScreen) {
      case 'profile':
        return (
          <UserProfileComponent
            currentUser={userProfile.currentUser}
            allUsers={userProfile.allUsers}
            onCreateUser={handleCreateUser}
            onSelectUser={handleSelectUser}
            onDeleteUser={handleDeleteUser}
            onViewProfile={handleViewProfile}
            onBackToSetup={handleBackToSetup}
          />
        );

      case 'setup':
        return (
          <NumberSelector
            selectedNumbers={selectedTables}
            onSelectionChange={handleSelectionChange}
            onStartPractice={handleStartPractice}
            practiceSettings={practiceSettings}
            onSettingsChange={handleSettingsChange}
          />
        );
      
      case 'practice':
        if (!questionGenerator.currentQuestion || !practiceSession.sessionStats) {
          return <div>Loading...</div>;
        }
        
        return (
          <PracticeSession
            currentQuestion={questionGenerator.currentQuestion}
            questionIndex={questionGenerator.questionIndex}
            totalQuestions={questionGenerator.questionSet.length}
            score={{
              correct: practiceSession.sessionStats.correct,
              total: practiceSession.sessionStats.total
            }}
            onAnswerSubmit={handleAnswerSubmit}
            onEndSession={handleEndSession}
            questionDelay={practiceSettings.questionDelay}
          />
        );
      
      case 'results':
        if (!practiceSession.sessionStats) {
          return <div>No session data available</div>;
        }
        
        return (
          <ResultsScreen
            sessionStats={practiceSession.sessionStats}
            onNewSession={handleNewSession}
            onChangeSettings={handleChangeSettings}
            questionStats={userProfile.currentUser?.questionStats}
          />
        );
      
      default:
        return <div>Unknown screen</div>;
    }
  };

  return (
    <div className="app">
      {/* Navigation Header */}
      {currentScreen !== 'practice' && (
        <nav className="app-navigation">
          <div className="nav-section">
            <h1 className="app-title">Times Table Practice</h1>
            {userProfile.currentUser && (
              <div className="current-user-info">
                Welcome, {userProfile.currentUser.name}!
              </div>
            )}
          </div>
          <div className="nav-buttons">
            <button 
              onClick={handleShowProfile}
              className={currentScreen === 'profile' ? 'nav-btn active' : 'nav-btn'}
            >
              Profile
            </button>
            {userProfile.currentUser && (
              <button 
                onClick={handleBackToSetup}
                className={currentScreen === 'setup' ? 'nav-btn active' : 'nav-btn'}
              >
                Practice
              </button>
            )}
          </div>
        </nav>
      )}
      
      <div className="app-content">
        {renderCurrentScreen()}
      </div>
    </div>
  );
}

export default App;
