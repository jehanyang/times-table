import type { UserProfile, SessionStats } from '../types';
import { updateQuestionStatsWithAttempts } from './improvementTracker';

const STORAGE_KEYS = {
  USERS: 'times-table-users',
  CURRENT_USER: 'times-table-current-user'
};

export const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createUserProfile = (name: string): UserProfile => {
  return {
    id: generateUserId(),
    name,
    createdAt: new Date(),
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    questionStats: {}
  };
};

export const getAllUsers = (): UserProfile[] => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!users) return [];
    
    const parsed = JSON.parse(users);
    // Convert date strings back to Date objects
    return parsed.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      questionStats: Object.fromEntries(
        Object.entries(user.questionStats).map(([key, stat]: [string, any]) => [
          key,
          { 
            ...stat, 
            lastAttempted: new Date(stat.lastAttempted),
            recentAttempts: stat.recentAttempts?.map((attempt: any) => ({
              ...attempt,
              date: new Date(attempt.date)
            })) || []
          }
        ])
      )
    }));
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUser = (user: UserProfile): void => {
  try {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUserId) return null;
    
    const users = getAllUsers();
    return users.find(user => user.id === currentUserId) || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = (userId: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
};

export const updateUserWithSession = (user: UserProfile, sessionStats: SessionStats): UserProfile => {
  const updatedUser = { ...user };
  
  // Update overall stats
  updatedUser.totalSessions++;
  updatedUser.totalQuestions += sessionStats.total;
  updatedUser.totalCorrect += sessionStats.correct;
  
  // Update question-specific stats with improved tracking
  updatedUser.questionStats = updateQuestionStatsWithAttempts(updatedUser.questionStats, sessionStats);
  
  return updatedUser;
};

export const getQuestionHistory = (user: UserProfile, factor1: number, factor2: number): any => {
  const key1 = `${factor1}x${factor2}`;
  const key2 = `${factor2}x${factor1}`;
  
  return user.questionStats[key1] || user.questionStats[key2] || null;
};

export const deleteUser = (userId: string): void => {
  try {
    const users = getAllUsers().filter(user => user.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // If we're deleting the current user, clear that too
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (currentUserId === userId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};