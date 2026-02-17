import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Input Error',
        description: 'Please enter your credentials.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Signed In',
        description: 'Welcome back.',
      });
      navigate('/library');
    } catch (error: unknown) {
      const err = error as any;
      toast({
        title: 'Authentication Failed',
        description: err.response?.data?.message || 'Invalid email or password.',
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
          <CardHeader className="space-y-1 pb-3 pt-5 text-center border-b border-zinc-800/50">
            <CardTitle className="text-xl font-bold text-white">Sign In</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">
              Access your research library
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 pt-5">
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-6 pt-1 px-8">
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98] text-sm sm:text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
              
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-widest">Demo</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <div className="w-full bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                 <div className="text-sm sm:text-base text-zinc-500 leading-tight">
                    <p className="font-medium text-zinc-300 tracking-tight">test@papertrail.com</p>
                    <p className="text-xs sm:text-sm">password123</p>
                 </div>
                 <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs sm:text-sm font-bold text-primary hover:bg-primary/10 rounded-lg px-3"
                    onClick={() => {
                      setEmail('test@papertrail.com');
                      setPassword('password123');
                    }}
                  >
                    Auto-fill
                  </Button>
              </div>

              <p className="text-sm sm:text-base text-zinc-500 text-center">
                New here?{' '}
                <Link to="/signup" className="text-primary font-bold hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
