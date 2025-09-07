import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface UserProfileProps {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onCreateUser: (name: string) => void;
  onSelectUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onViewProfile: () => void;
  onBackToSetup: () => void;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({
  currentUser,
  allUsers,
  onCreateUser,
  onSelectUser,
  onDeleteUser,
  onViewProfile,
  onBackToSetup
}) => {
  const [newUserName, setNewUserName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      onCreateUser(newUserName.trim());
      setNewUserName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user profile? All progress will be lost.')) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>User Profiles</h1>
        <p>Select or create a user profile to track your progress over time</p>
      </div>

      {currentUser && (
        <div className="current-user-section">
          <h2>Current User</h2>
          <div className="current-user-card">
            <div className="user-info">
              <h3>{currentUser.name}</h3>
              <div className="user-summary">
                <span>{currentUser.totalSessions} sessions completed</span>
                <span>{currentUser.totalQuestions} questions answered</span>
                <span>{currentUser.totalQuestions > 0 ? Math.round((currentUser.totalCorrect / currentUser.totalQuestions) * 100) : 0}% accuracy</span>
              </div>
            </div>
            <div className="user-actions">
              <button onClick={onViewProfile} className="primary-btn">
                View Detailed Stats
              </button>
              <button onClick={onBackToSetup} className="secondary-btn">
                Start Practice
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="user-selection-section">
        <div className="section-header">
          <h2>All Users</h2>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="create-user-btn"
          >
            + Create New User
          </button>
        </div>

        {showCreateForm && (
          <div className="create-user-form">
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name..."
                className="user-name-input"
                autoFocus
              />
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Create User
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewUserName('');
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="users-list">
          {allUsers.length === 0 ? (
            <div className="no-users">
              <p>No users created yet. Create your first user profile to start tracking your progress!</p>
            </div>
          ) : (
            allUsers.map(user => (
              <div 
                key={user.id} 
                className={`user-card ${currentUser?.id === user.id ? 'current' : ''}`}
              >
                <div className="user-card-info">
                  <h3>{user.name}</h3>
                  <div className="user-stats">
                    <div className="stat">
                      <span className="stat-value">{user.totalSessions}</span>
                      <span className="stat-label">Sessions</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{user.totalQuestions}</span>
                      <span className="stat-label">Questions</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {user.totalQuestions > 0 ? Math.round((user.totalCorrect / user.totalQuestions) * 100) : 0}%
                      </span>
                      <span className="stat-label">Accuracy</span>
                    </div>
                  </div>
                  <div className="user-meta">
                    <span className="created-date">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="user-card-actions">
                  {currentUser?.id !== user.id && (
                    <button 
                      onClick={() => onSelectUser(user.id)}
                      className="select-btn"
                    >
                      Select
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!currentUser && allUsers.length > 0 && (
        <div className="no-current-user">
          <p>Select a user profile above to continue</p>
        </div>
      )}
    </div>
  );
};

export default UserProfileComponent;