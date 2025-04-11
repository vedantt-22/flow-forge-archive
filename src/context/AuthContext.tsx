
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Update check to use the new client
const isSupabaseConnected = () => {
  // Since we're now connected to Supabase, this should return true
  return true;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabaseConnected = isSupabaseConnected();

  useEffect(() => {
    if (!supabaseConnected) {
      setIsLoading(false);
      return;
    }

    const getSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          try {
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (!profileError && profileData) {
              setProfile(profileData);
            }
          } catch (profileErr) {
            console.error('Error fetching profile:', profileErr);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlocks
          setTimeout(async () => {
            try {
              // Fetch updated profile
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newSession.user.id)
                .single();
                
              if (profileData) {
                setProfile(profileData);
              }
            } catch (err) {
              console.error('Error fetching profile after auth change:', err);
            }
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    getSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseConnected]);

  const signIn = async (email: string, password: string) => {
    if (!supabaseConnected) {
      toast({
        title: "Connection Error",
        description: "Supabase is not connected. Please connect via the Supabase integration first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
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
    if (!supabaseConnected) {
      toast({
        title: "Connection Error",
        description: "Supabase is not connected. Please connect via the Supabase integration first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user }, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (user) {
        try {
          // Create profile entry
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            avatar_url: null,
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.error('Error creating profile:', profileErr);
        }
      }
      
      toast({
        title: "Account created",
        description: "Please verify your email to log in",
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
    if (!supabaseConnected) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
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
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        isSupabaseConnected: supabaseConnected,
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
