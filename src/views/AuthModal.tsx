import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  X, Trophy, Mail, Phone, ShieldCheck, Sparkles, Smartphone, 
  CheckCircle2, RefreshCw, KeyRound, Globe, ArrowRight 
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  
  // Auth Method: 'google' | 'phone' | 'email'
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | 'email'>('google');
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [role, setRole] = useState<UserRole>('customer');

  // OTP State
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [serverOtpCode, setServerOtpCode] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (otpStep === 'verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpStep, countdown]);

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const success = await loginWithGoogle(role);
      if (success) {
        setSuccessMessage('Google authentication successful! Redirecting...');
        setTimeout(() => {
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Phone OTP Handler
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanNumber = phone.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      setErrorMessage('Please enter a valid phone number (minimum 8 to 10 digits).');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${cleanNumber}`;
      const res = await sendPhoneOtp(fullPhone, countryCode);
      
      if (res.success) {
        setServerOtpCode(res.otpCode || '');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpStep('verify');
        setCountdown(res.resendCooldownSeconds || 30);
        setSuccessMessage(`OTP code sent successfully to ${fullPhone}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillOtp = () => {
    if (serverOtpCode && serverOtpCode.length === 6) {
      setOtpDigits(serverOtpCode.split(''));
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify Phone OTP Handler
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
      const success = await verifyPhoneOtp(fullPhone, enteredOtp, fullname, role, countryCode);
      if (success) {
        setSuccessMessage('Phone OTP verified! Redirecting...');
        setTimeout(() => {
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Login Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      let success = false;
      if (isRegister) {
        success = await register(fullname, email, phone, role, password);
      } else {
        success = await login(email, role, password);
      }

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (selectedRole: UserRole) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      if (selectedRole === 'customer') {
        await login('john@example.com', 'customer', 'password123');
      } else if (selectedRole === 'owner') {
        await login('owner@turfhub.com', 'owner', 'password123');
      } else {
        await login('admin@turfhub.com', 'admin', 'password123');
      }
      setSuccessMessage(`Logged in as ${selectedRole.toUpperCase()} demo profile!`);
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (type: UserRole) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (type === 'customer') {
      setEmail('john@example.com');
      setPhone('9876543210');
      setPassword('password123');
      setRole('customer');
      setFullname('John Doe');
    } else if (type === 'owner') {
      setEmail('owner@turfhub.com');
      setPhone('9811122233');
      setPassword('password123');
      setRole('owner');
      setFullname('David Miller');
    } else {
      setEmail('admin@turfhub.com');
      setPhone('9900011223');
      setPassword('password123');
      setRole('admin');
      setFullname('Platform Admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">TurfHub Sign In / Sign Up</h3>
              <p className="text-[11px] text-slate-400">Secure Access for Players & Venue Owners</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Method Selection Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              authMethod === 'google'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setOtpStep('input');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              authMethod === 'phone'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              authMethod === 'email'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>

        <div className="p-5 space-y-4">


          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <span className="shrink-0 text-red-500 font-bold">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* METHOD 1: GOOGLE OAUTH */}
          {authMethod === 'google' && (
            <div className="space-y-4 text-xs py-1">
              <div className="text-center space-y-1">
                <p className="font-bold text-slate-800 text-sm">One-Tap Google Authentication</p>
                <p className="text-slate-500 text-[11px]">
                  Sign in using your Google account details or pick an instant demo profile below.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Google Account Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:border-emerald-600 focus:bg-white cursor-pointer"
                >
                  <option value="customer">Player / Customer</option>
                  <option value="owner">Turf Venue Owner</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 font-extrabold py-3.5 px-4 border border-slate-300 rounded-2xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-3 text-xs active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting to Google OAuth...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                    </svg>
                    <span>Continue with Google Account</span>
                  </>
                )}
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Instant Demo Login (1-Click)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('customer')}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <p className="font-extrabold text-slate-800 group-hover:text-emerald-700 text-[11px]">⚽ Player</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">John Doe</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('owner')}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <p className="font-extrabold text-slate-800 group-hover:text-emerald-700 text-[11px]">🏟️ Owner</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">David Miller</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <p className="font-extrabold text-slate-800 group-hover:text-emerald-700 text-[11px]">🛡️ Admin</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Platform</p>
                </button>
              </div>

              <div className="pt-1 text-center text-[10px] text-slate-400">
                🔒 Protected by Google OAuth & JWT Encrypted Cookies
              </div>
            </div>
          )}

          {/* METHOD 2: PHONE + OTP */}
          {authMethod === 'phone' && (
            <div className="space-y-3 text-xs">
              {otpStep === 'input' ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name (Optional for new user)</label>
                    <input
                      type="text"
                      value={fullname}
                      onChange={e => setFullname(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Country Code & Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-700 outline-none focus:border-emerald-600 cursor-pointer text-xs"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-800"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:border-emerald-600 focus:bg-white cursor-pointer"
                    >
                      <option value="customer">Player / Customer</option>
                      <option value="owner">Turf Venue Owner</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Send 6-Digit OTP</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    ⏱️ Rate limited: Max 3 OTP requests per 10 minutes per number
                  </p>
                </form>
              ) : (
                /* STEP 2: VERIFY OTP CODE */
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  {/* Generated OTP Preview Banner */}
                  {serverOtpCode && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-900">
                          🔑 Generated OTP Code (Server):
                        </p>
                        <p className="text-base font-black text-emerald-700 tracking-widest mt-0.5">
                          {serverOtpCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutofillOtp}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Auto-fill OTP
                      </button>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="font-bold text-slate-800 text-xs">Enter 6-Digit Verification Code</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sent to {countryCode} {phone}
                    </p>
                  </div>

                  {/* 6 Input Boxes */}
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleDigitChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        className="w-10 h-12 text-center text-lg font-black bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying OTP & Signing In...</span>
                      </>
                    ) : (
                      <span>Verify Code & Complete Sign In</span>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('input');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      ← Change Phone Number
                    </button>

                    {countdown > 0 ? (
                      <span className="text-slate-400 font-medium">Resend OTP in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendPhoneOtp()}
                        className="text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend OTP Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* METHOD 3: EMAIL + PASSWORD */}
          {authMethod === 'email' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              {isRegister && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={e => setFullname(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Password</label>
                  <span className="text-[10px] text-slate-400 font-medium">Min 6 characters</span>
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Register As</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:border-emerald-600 focus:bg-white cursor-pointer"
                    >
                      <option value="customer">Player / Customer</option>
                      <option value="owner">Turf Venue Owner</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isRegister ? 'Create Account' : 'Sign In with Password'}</span>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {isRegister ? 'Already registered? Sign In here' : 'New user? Click here to Register'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
