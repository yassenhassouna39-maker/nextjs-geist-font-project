'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types';
import { 
  loadCurrentUser, 
  saveCurrentUser, 
  removeCurrentUser, 
  getUsers, 
  saveUsers, 
  generateId, 
  nowISO, 
  ADMIN_EMAIL 
} from '@/lib/storage';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAdmin: false,
    isAuthenticated: false
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      const user = loadCurrentUser();
      if (user) {
        setAuthState({
          currentUser: user,
          isAdmin: user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
          isAuthenticated: true
        });
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return { success: false, message: 'أدخل بريدك الإلكتروني' };
      }

      const users = getUsers();
      let user = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());

      // Auto-provision account if not found
      if (!user) {
        user = {
          id: generateId(),
          name: '',
          email: trimmedEmail,
          createdAt: nowISO()
        };
        users.unshift(user);
        saveUsers(users);
      }

      const isAdmin = trimmedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      setAuthState({
        currentUser: user,
        isAdmin,
        isAuthenticated: true
      });

      saveCurrentUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName || !trimmedEmail) {
        return { success: false, message: 'أدخل الاسم والبريد' };
      }

      const users = getUsers();
      
      // Check if user already exists
      if (users.some(u => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
        return { success: false, message: 'هذا البريد مسجل مسبقًا' };
      }

      const newUser: User = {
        id: generateId(),
        name: trimmedName,
        email: trimmedEmail,
        createdAt: nowISO()
      };

      users.unshift(newUser);
      saveUsers(users);

      const isAdmin = trimmedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      setAuthState({
        currentUser: newUser,
        isAdmin,
        isAuthenticated: true
      });

      saveCurrentUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      removeCurrentUser();
      setAuthState({
        currentUser: null,
        isAdmin: false,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!authState.currentUser) return;

    const updatedUser = { ...authState.currentUser, ...updates };
    
    setAuthState(prev => ({
      ...prev,
      currentUser: updatedUser
    }));

    saveCurrentUser(updatedUser);

    // Update in users list as well
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
    }
  }, [authState.currentUser]);

  return {
    ...authState,
    isLoading,
    login,
    signup,
    logout,
    updateUser
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
