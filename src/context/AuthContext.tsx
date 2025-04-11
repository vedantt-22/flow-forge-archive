
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Verify token
        const { userId } = verifyToken(token);
        
        // Get user data
        const userData = await getUserById(userId);
        if (userData) {
          setUser(userData);
        } else {
          // Invalid user ID or user not found, clear token
          localStorage.removeItem('token');
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: userData, token } = await loginUser(email, password);
      
      // Store token
      localStorage.setItem('token', token);
      
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
  };

  const signUp = async (email: string, password: string, fullName: string) => {
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
  };

  const signOut = async () => {
    try {
      // Clear token
      localStorage.removeItem('token');
      
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
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
