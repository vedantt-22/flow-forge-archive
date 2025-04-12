
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loginUser, registerUser, getUserById, verifyToken } from '@/lib/auth-service';
import { UserDocument } from '@/lib/mongodb';

interface AuthContextType {
  user: UserDocument | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a localStorage wrapper with error handling
const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Memoized token check function
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check for token in localStorage
      const token = storage.getItem('token');
      if (!token) {
        return false;
      }
      
      // Verify token
      const { userId } = verifyToken(token);
      
      // Get user data
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
        return true;
      } else {
        // Invalid user ID or user not found, clear token
        storage.removeItem('token');
        return false;
      }
    } catch (error) {
      // Invalid token, clear it
      storage.removeItem('token');
      console.error('Auth check error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Perform auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle sign in with optimized error handling
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: userData, token } = await loginUser(email, password);
      
      // Store token
      storage.setItem('token', token);
      
      // Set user
      setUser(userData);
      
      toast({
        title: "Success",
        description: "You have been signed in",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Handle sign up with optimized error handling
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      await registerUser(email, password, fullName);
      
      toast({
        title: "Account created",
        description: "Please sign in with your new account",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Handle sign out
  const signOut = useCallback(async () => {
    try {
      // Clear token
      storage.removeItem('token');
      
      // Clear user
      setUser(null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
