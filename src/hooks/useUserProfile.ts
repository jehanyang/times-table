import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, SessionStats } from '../types';
import {
  getAllUsers,
  getCurrentUser,
  setCurrentUser,
  saveUser,
  createUserProfile,
  updateUserWithSession,
  deleteUser
} from '../utils/userStorage';

interface UseUserProfileReturn {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  createUser: (name: string) => UserProfile;
  selectUser: (userId: string) => void;
  updateUserStats: (sessionStats: SessionStats) => void;
  removeUser: (userId: string) => void;
  refreshUsers: () => void;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Load users and current user on mount
  useEffect(() => {
    const users = getAllUsers();
    setAllUsers(users);
    
    const current = getCurrentUser();
    setCurrentUserState(current);
  }, []);

  const refreshUsers = useCallback(() => {
    const users = getAllUsers();
    setAllUsers(users);
    
    const current = getCurrentUser();
    setCurrentUserState(current);
  }, []);

  const createUser = useCallback((name: string): UserProfile => {
    const newUser = createUserProfile(name);
    saveUser(newUser);
    
    // Refresh the users list
    const users = getAllUsers();
    setAllUsers(users);
    
    return newUser;
  }, []);

  const selectUser = useCallback((userId: string) => {
    setCurrentUser(userId);
    
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserState(user);
    }
  }, []);

  const updateUserStats = useCallback((sessionStats: SessionStats) => {
    if (!currentUser) return;
    
    const updatedUser = updateUserWithSession(currentUser, sessionStats);
    saveUser(updatedUser);
    
    // Update local state
    setCurrentUserState(updatedUser);
    
    // Refresh all users
    const users = getAllUsers();
    setAllUsers(users);
  }, [currentUser]);

  const removeUser = useCallback((userId: string) => {
    deleteUser(userId);
    
    // Refresh users
    const users = getAllUsers();
    setAllUsers(users);
    
    // If we deleted the current user, clear it
    if (currentUser?.id === userId) {
      setCurrentUserState(null);
    }
  }, [currentUser]);

  return {
    currentUser,
    allUsers,
    createUser,
    selectUser,
    updateUserStats,
    removeUser,
    refreshUsers
  };
};