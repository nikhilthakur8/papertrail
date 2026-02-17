import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Mail, Lock, User } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Form Incomplete',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Complexity Error',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, password);
      toast({
        title: 'Success',
        description: 'Welcome to PaperTrail!',
      });
      navigate('/library');
    } catch (error: unknown) {
      const err = error as any;
      toast({
        title: 'Registration Failed',
        description: err.response?.data?.message || 'Could not create account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-4 font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Paper Trail</h1>
        </div>

        <Card className="w-full bg-zinc-900 border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 pt-6 text-center border-b border-zinc-800/50">
            <CardTitle className="text-xl font-bold text-white">Create Account</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">
              Start tracking your research today
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm sm:text-base font-medium text-zinc-400 ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium text-zinc-400 ml-1">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm sm:text-base font-medium text-zinc-400 ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium text-zinc-400 ml-1">Confirm</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-zinc-950/50 border-zinc-800 h-12 text-zinc-200 placeholder:text-zinc-700 rounded-xl text-sm sm:text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-6 pt-2 px-8">
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98] text-sm sm:text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Sign Up'}
              </Button>
              <p className="text-sm sm:text-base text-zinc-500 text-center">
                Already registered?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
