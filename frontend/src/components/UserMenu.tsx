import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await authAPI.sendOtp();
      setOtpSent(true);
      setCountdown(60);
      setMessage({ type: 'success', text: 'Verification code sent to your email.' });
    } catch (error: unknown) {
      const err = error as any;
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to send code.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Enter 6-digit code.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await authAPI.verifyOtp(otp);
      updateUser(response.data.user);
      setMessage({ type: 'success', text: 'Email verified!' });
      setShowVerification(false);
      setOtp('');
      setOtpSent(false);
    } catch (error: unknown) {
      const err = error as any;
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Invalid code.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetVerification = () => {
    setShowVerification(false);
    setOtp('');
    setMessage(null);
    setOtpSent(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetVerification();
    }}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 group outline-none">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-zinc-700 transition-colors">
            <User className="h-4 w-4 text-zinc-400" />
          </div>
          <span className="text-sm font-medium text-zinc-300 hidden sm:inline">{user?.name}</span>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border-zinc-800 rounded-xl p-1 mt-2 shadow-xl">
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="truncate">{user?.email}</span>
              {user?.isEmailVerified ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-500" />
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-zinc-800" />

        {!user?.isEmailVerified && (
          <div className="p-1">
            {!showVerification ? (
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  setShowVerification(true);
                }}
                className="cursor-pointer rounded-lg focus:bg-zinc-800 text-amber-500"
              >
                <span>Verify Email</span>
              </DropdownMenuItem>
            ) : (
              <div className="p-3 space-y-3 bg-zinc-950/50 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400">Email Verification</span>
                  <button onClick={resetVerification} className="text-[11px] text-zinc-600 hover:text-white transition-colors">Cancel</button>
                </div>

                {message && (
                  <div className={cn(
                    "text-[10px] px-2 py-1.5 rounded font-medium",
                    message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  )}>
                    {message.text}
                  </div>
                )}

                {!otpSent ? (
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send Code"}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-8 bg-zinc-900 border-zinc-800 text-center text-sm font-mono tracking-widest text-white"
                      maxLength={6}
                    />
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                    </Button>
                    <button
                      className="w-full text-[10px] text-zinc-500 hover:text-white disabled:opacity-50"
                      onClick={() => !countdown && handleSendOtp()}
                      disabled={countdown > 0 || isLoading}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                )}
              </div>
            )}
            <DropdownMenuSeparator className="bg-zinc-800" />
          </div>
        )}

        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/5 rounded-lg p-2.5">
          <LogOut className="h-4 w-4 mr-2" />
          <span className="text-sm">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
