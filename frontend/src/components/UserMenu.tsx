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
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

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

  // Countdown timer for resend
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
      setMessage({ type: 'success', text: 'OTP sent to your email!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send OTP' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit OTP' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await authAPI.verifyOtp(otp);
      updateUser(response.data.user);
      setMessage({ type: 'success', text: 'Email verified successfully!' });
      setShowVerification(false);
      setOtp('');
      setOtpSent(false);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid OTP' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
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
      if (!open) {
        resetVerification();
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="none" className="flex items-center gap-2 px-3 hover:bg-none">
          <div className="relative">
            <User className="h-4 w-4" />
            {!user?.isEmailVerified && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="hidden sm:inline max-w-[150px] truncate">{user?.name}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user?.email}</span>
              {user?.isEmailVerified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Email Verification Section */}
        {!user?.isEmailVerified && (
          <>
            {!showVerification ? (
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  setShowVerification(true);
                }}
                className="cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-amber-500" />
                <span>Verify Email</span>
                <span className="ml-auto text-xs text-amber-500">Not verified</span>
              </DropdownMenuItem>
            ) : (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verify your email</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={resetVerification}
                  >
                    Cancel
                  </Button>
                </div>

                {message && (
                  <div className={`text-xs px-2 py-1.5 rounded ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {message.text}
                  </div>
                )}

                {!otpSent ? (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-3 w-3 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="6-digit verification code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-8 text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-2" />
                          Verify OTP
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                    >
                      {countdown > 0 
                        ? `Resend OTP in ${countdown}s` 
                        : 'Resend OTP'}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Verified Badge */}
        {user?.isEmailVerified && (
          <>
            <div className="px-2 py-1.5 flex items-center gap-2 text-sm text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>Email Verified</span>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:!bg-transparent">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
