
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UserDocument {
  _id?: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

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

  // Simulated users for demo purposes
  const demoUsers = [
    {
      _id: '1',
      email: 'demo@example.com',
      password: 'password',
      fullName: 'Demo User',
    },
    {
      _id: '2',
      email: 'admin@example.com',
      password: 'password',
      fullName: 'Admin User',
    }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check for stored user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser({
            _id: userData._id,
            email: userData.email,
            fullName: userData.fullName,
            avatarUrl: userData.avatarUrl
          });
        }
      } catch (error) {
        // Invalid user data, clear storage
        localStorage.removeItem('user');
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Find user in demo data
      const foundUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      const userData = {
        _id: foundUser._id,
        email: foundUser.email,
        fullName: foundUser.fullName,
        avatarUrl: '' // No avatar in demo
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      
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
      // Check if user already exists
      if (demoUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // In a real app, we would create a new user in the database
      // For this demo, we'll just simulate success
      
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
      // Clear stored user data
      localStorage.removeItem('user');
      
      // Clear user state
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
