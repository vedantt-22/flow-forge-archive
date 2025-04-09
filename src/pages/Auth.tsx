
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, User, Mail, Eye, EyeOff, Database, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Auth: React.FC = () => {
  const { user, signIn, signUp, isLoading, isSupabaseConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await signUp(email, password, fullName);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {!isSupabaseConnected ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              <span className="text-fileflow-600">File</span>
              <span>Flow</span>
            </CardTitle>
            <CardDescription className="text-center">Database Connection Required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <Database className="h-16 w-16 text-fileflow-600" />
            </div>
            <Alert className="border-amber-500">
              <AlertTitle className="flex items-center">
                <Database className="h-4 w-4 mr-2" /> 
                Supabase Not Connected
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  To use authentication and database features, please connect to Supabase:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click on the green Supabase button in the top-right corner</li>
                  <li>Follow the prompts to connect your Lovable project to Supabase</li>
                  <li>Enter the connection details shown in your Supabase dashboard</li>
                  <li>Return to this page after connection is complete</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <p className="text-sm text-gray-500">
              Need help? Check the{" "}
              <a 
                href="https://docs.lovable.dev/integrations/supabase/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-fileflow-600 hover:underline inline-flex items-center"
              >
                Supabase integration docs
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
          </CardFooter>
        </Card>
      ) : (
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="text-2xl font-bold text-fileflow-800 dark:text-fileflow-400">
              <span className="text-fileflow-600">File</span>
              <span>Flow</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Secure file sharing platform</p>
            <div className="flex items-center justify-center mt-2 text-green-500 gap-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Connected to Supabase</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-fileflow-600 hover:bg-fileflow-700"
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-fileflow-600 hover:bg-fileflow-700"
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing up..." : "Sign Up"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>
              By signing in or creating an account, you agree to our{" "}
              <a href="#" className="text-fileflow-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-fileflow-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
