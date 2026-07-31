import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, SportType } from '../types';
import { 
  Calendar, Building2, Smartphone, ShieldCheck, 
  CheckCircle2, RefreshCw, KeyRound, Globe, ArrowRight, Check, MapPin, DollarSign,
  Upload, X, ChevronLeft, Clock, AlertCircle, Sparkles, Image as ImageIcon
} from 'lucide-react';

interface SignUpPageProps {
  onNavigateHome: (targetView?: string) => void;
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

const AVAILABLE_SPORTS: SportType[] = ['Football', 'Cricket', 'Box Cricket', 'Badminton', 'Tennis', 'Volleyball'];

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigateHome }) => {
  const { loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, completeOwnerProfile, user } = useAuth();

  // Wizard Step: 1 (Role), 2 (Auth Method), 3 (Owner Extra Fields), 4 (Complete)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Role State ('customer' | 'owner')
  const [selectedRole, setSelectedRole] = useState<'customer' | 'owner'>('customer');

  // Step 2: Auth Method & Form State
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [serverOtpCode, setServerOtpCode] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Owner Extra Fields
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [area, setArea] = useState('Bandra West');
  const [latitude, setLatitude] = useState<number>(19.0596);
  const [longitude, setLongitude] = useState<number>(72.8295);
  const [selectedSports, setSelectedSports] = useState<SportType[]>(['Football', 'Box Cricket']);
  const [pricePerHour, setPricePerHour] = useState<number>(1200);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80'
  ]);

  // UI Feedback & Loading
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

  // Handle Step 1 -> Step 2
  const handleSelectRole = (role: 'customer' | 'owner') => {
    setSelectedRole(role);
    setErrorMessage('');
    setCurrentStep(2);
  };

  // Step 2: Google Auth
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const success = await loginWithGoogle(selectedRole);
      if (success) {
        if (selectedRole === 'customer') {
          setSuccessMessage('Authenticated successfully! Redirecting to Customer Dashboard...');
          setTimeout(() => {
            onNavigateHome('customer-dashboard');
          }, 800);
        } else {
          setSuccessMessage('Google authentication verified! Please fill in your venue details.');
          setOwnerPhone(user?.phone || '');
          setCurrentStep(3);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send Phone OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanNum = phone.replace(/\D/g, '');
    if (!cleanNum || cleanNum.length < 8) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${cleanNum}`;
      const res = await sendPhoneOtp(fullPhone, countryCode);

      if (res.success) {
        setServerOtpCode(res.otpCode || '');
        setOtpDigits(['', '', '', '', '', '']);
        setOtpStep('verify');
        setCountdown(res.resendCooldownSeconds || 30);
        setSuccessMessage(`OTP sent to ${fullPhone}. Rate limit: max 3 requests per 10 mins.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
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

  // Step 2: Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
      const success = await verifyPhoneOtp(fullPhone, enteredOtp, undefined, selectedRole);

      if (success) {
        if (selectedRole === 'customer') {
          setSuccessMessage('Phone verified! Redirecting to Customer Portal...');
          setTimeout(() => {
            onNavigateHome('customer-dashboard');
          }, 800);
        } else {
          setSuccessMessage('Phone verified! Proceeding to venue details...');
          setOwnerPhone(fullPhone);
          setCurrentStep(3);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle Sport Toggle
  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length === 1) {
        setErrorMessage('Please select at least one sport offered by your venue.');
        return;
      }
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
    setErrorMessage('');
  };

  // Step 3: Handle File Image Upload (min 1, max 5)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setErrorMessage('Maximum 5 images allowed per venue listing.');
      return;
    }

    setErrorMessage('');
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload valid image files (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          setUploadedImages(prev => [...prev.slice(0, 4), reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    if (uploadedImages.length === 1) {
      setErrorMessage('At least 1 turf image is required.');
      return;
    }
    setUploadedImages(uploadedImages.filter((_, idx) => idx !== indexToRemove));
    setErrorMessage('');
  };

  // Step 3: Submit Owner Profile Extra Fields
  const handleSubmitOwnerDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!businessName.trim()) {
      setErrorMessage('Please enter your Turf / Business Name.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your Turf Address / Location.');
      return;
    }

    if (selectedSports.length === 0) {
      setErrorMessage('Please select at least 1 sport offered.');
      return;
    }

    if (!pricePerHour || pricePerHour <= 0) {
      setErrorMessage('Please enter a valid hourly rate.');
      return;
    }

    if (uploadedImages.length === 0) {
      setErrorMessage('Please upload at least 1 turf photo.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await completeOwnerProfile({
        businessName,
        location: address,
        city,
        area,
        latitude,
        longitude,
        sportTypes: selectedSports,
        pricePerHour: Number(pricePerHour),
        images: uploadedImages,
        phone: ownerPhone || phone
      });

      if (res.success) {
        setSuccessMessage('Venue details saved!');
        setCurrentStep(4);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting owner profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = selectedRole === 'customer' ? 2 : 4;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header & Back Navigation */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            {currentStep > 1 && currentStep < 4 && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setCurrentStep(prev => prev - 1);
                }}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all mr-1 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Multi-Step Account Registration
              </span>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                {currentStep === 1 && 'Step 1: Choose Account Role'}
                {currentStep === 2 && 'Step 2: Authenticate Identity'}
                {currentStep === 3 && 'Step 3: Turf Venue Profile'}
                {currentStep === 4 && 'Registration Pending Review'}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {currentStep === 4 ? 'Complete' : `Step ${currentStep} of ${totalSteps}`}
            </span>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Banners for Error or Success */}
        {errorMessage && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: ROLE SELECTION ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <p className="text-xs text-slate-400">
              Select how you will use the Turf Booking platform to get tailored access.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Role Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('customer')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  selectedRole === 'customer'
                    ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-1">I'm a Customer</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Search nearby turfs, check real-time slot availability, reserve matches, and earn rewards.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Player & Booker</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Turf Owner Role Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('owner')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  selectedRole === 'owner'
                    ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-1">I'm a Turf Owner</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    List sports grounds, manage slot schedules, set surge rates, and receive online player payments.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-400">
                  <span>Venue Management</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-500">
              ⚡ Note: Platform Admin accounts have strictly no public registration and are invited directly by system administrators.
            </div>
          </div>
        )}

        {/* ================= STEP 2: AUTHENTICATION METHOD ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">Selected Account Type:</span>
              <span className="font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                {selectedRole === 'customer' ? '👤 Customer' : '🏟️ Turf Owner'}
              </span>
            </div>

            {/* Auth Method Navigation Tabs */}
            <div className="grid grid-cols-2 bg-slate-800/80 p-1 rounded-2xl text-xs font-bold gap-1 border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMethod === 'google'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" /> Google OAuth
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMethod === 'phone'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Phone Number OTP
              </button>
            </div>

            {/* GOOGLE AUTH OPTION */}
            {authMethod === 'google' && (
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg text-xs cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Continue with Google Identity</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Captures Google verified name, email, and avatar profile picture automatically.
                </p>
              </div>
            )}

            {/* PHONE OTP OPTION */}
            {authMethod === 'phone' && (
              <div className="space-y-4 pt-1">
                {otpStep === 'input' ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Enter Mobile Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                      Send 6-Digit OTP Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-300">
                          Enter 6-Digit Code
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Sent to {countryCode}{phone}
                        </span>
                      </div>

                      <div className="grid grid-cols-6 gap-2">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="bg-slate-800 border border-slate-700 text-center font-black text-lg text-emerald-400 rounded-xl py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Resend code in:</span>
                      {countdown > 0 ? (
                        <span className="font-bold text-emerald-400">{countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Verify OTP & Complete Step
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: TURF OWNER EXTRA FIELDS ================= */}
        {currentStep === 3 && selectedRole === 'owner' && (
          <form onSubmit={handleSubmitOwnerDetails} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Turf / Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Champions Box Cricket & Football Ground"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Address / Location *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="102 Sports Complex Way, Bandra West"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Area / Locality</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Bandra West"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Sport Types Multi-select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Sport Type(s) Offered * (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SPORTS.map((sport) => {
                  const isSelected = selectedSports.includes(sport);
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {sport}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price per hour */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Standard Price Per Hour (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Image Upload min 1 max 5 */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Turf Ground Photos (Min 1, Max 5) *
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {uploadedImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden group border border-slate-700">
                    <img src={imgUrl} alt={`Turf photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {uploadedImages.length < 5 && (
                  <label className="aspect-video bg-slate-800/80 border border-dashed border-slate-600 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-300">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              Submit Venue Profile for Admin Review
            </button>
          </form>
        )}

        {/* ================= STEP 4: COMPLETION SCREEN (OWNER REVIEW PENDING) ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white mb-2">Your Turf Registration is Under Review!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                We have received your venue submission for <span className="text-emerald-400 font-bold">{businessName || 'your turf'}</span>. Our administrator team will verify your address, turf images, and pricing.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> Account Status: Pending Approval
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You can access your venue dashboard to edit profile details and ground configurations. Slot publishing and public player bookings will activate immediately upon administrator approval.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateHome('owner-dashboard')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Go to Owner Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
