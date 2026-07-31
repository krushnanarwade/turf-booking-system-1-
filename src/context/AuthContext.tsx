import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Slot } from '../types';

export interface PendingBookingIntent {
  turfId: string;
  slot: Slot;
  date: string;
}
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  pendingBookingIntent: PendingBookingIntent | null;
  setPendingBookingIntent: (intent: PendingBookingIntent | null) => void;
  clearPendingBookingIntent: () => void;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean>;
  register: (fullname: string, email: string, phone: string, role: UserRole, password?: string) => Promise<boolean>;
  loginWithGoogle: (role?: UserRole) => Promise<boolean>;
  sendPhoneOtp: (phone: string, countryCode?: string) => Promise<{ success: boolean; message: string; otpCode?: string; resendCooldownSeconds?: number }>;
  verifyPhoneOtp: (phone: string, otp: string, fullname?: string, role?: UserRole) => Promise<boolean>;
  loginWithOtp: (identifier: string, isPhone: boolean, fullname?: string, role?: UserRole) => Promise<boolean>;
  completeOwnerProfile: (ownerData: {
    businessName: string;
    location: string;
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
    sportTypes: string[];
    pricePerHour: number;
    images: string[];
    phone?: string;
  }) => Promise<{ success: boolean; user: User; turf: Slot | any }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingBookingIntent, setPendingBookingIntentState] = useState<PendingBookingIntent | null>(() => {
    try {
      const saved = localStorage.getItem('turf_app_pending_booking');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setPendingBookingIntent = (intent: PendingBookingIntent | null) => {
    setPendingBookingIntentState(intent);
    if (intent) {
      localStorage.setItem('turf_app_pending_booking', JSON.stringify(intent));
    } else {
      localStorage.removeItem('turf_app_pending_booking');
    }
  };

  const clearPendingBookingIntent = () => {
    setPendingBookingIntent(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            setUser(userData);
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem('turf_app_user', JSON.stringify(userData));
            localStorage.setItem('turf_app_token', idToken);
          }
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
        }
      }
      setIsLoading(false);
    });

    // Check localStorage fallback if not firebase authenticated yet
    const savedUser = localStorage.getItem('turf_app_user');
    const savedToken = localStorage.getItem('turf_app_token');

    if (savedUser && savedToken && !user) {
      try {
        const parsed = JSON.parse(savedUser);
        // Clear old automatically saved demo customer from previous site versions
        if (parsed?.id === 'usr-customer-1' && savedToken === 'mock_jwt_token_customer') {
          localStorage.removeItem('turf_app_user');
          localStorage.removeItem('turf_app_token');
        } else {
          setUser(parsed);
          setToken(savedToken);
        }
      } catch (e) {
        localStorage.removeItem('turf_app_user');
        localStorage.removeItem('turf_app_token');
      }
    }
    setIsLoading(false);

    return () => unsubscribe();
  }, []);

  const login = async (email: string, overrideRole?: UserRole, password?: string): Promise<boolean> => {
    try {
      if (password) {
        try {
          // Try Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          const idToken = await fbUser.getIdToken();

          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userObj: User;
          if (userSnap.exists()) {
            userObj = userSnap.data() as User;
          } else {
            userObj = {
              id: fbUser.uid,
              fullname: fbUser.displayName || email.split('@')[0],
              email: email,
              phone: '+91 98765 43210',
              role: overrideRole || 'customer',
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              status: 'active',
              created_at: new Date().toISOString()
            };
            await setDoc(userDocRef, userObj);
          }

          setUser(userObj);
          setToken(idToken);
          localStorage.setItem('turf_app_user', JSON.stringify(userObj));
          localStorage.setItem('turf_app_token', idToken);
          return true;
        } catch (fbErr: any) {
          const errCode = fbErr?.code || '';
          
          // Auto-provision demo accounts if signInWithEmailAndPassword failed because user doesn't exist in Firebase yet
          const isDemoAccount = email === 'john@example.com' || email === 'owner@turfhub.com' || email === 'admin@turfhub.com';
          if (isDemoAccount && (errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential')) {
            try {
              const newDemoUser = await createUserWithEmailAndPassword(auth, email, password);
              const fbUser = newDemoUser.user;
              const idToken = await fbUser.getIdToken();
              const userObj: User = {
                id: fbUser.uid,
                fullname: email === 'owner@turfhub.com' ? 'David Miller (Apex Sports)' : email === 'admin@turfhub.com' ? 'Platform Administrator' : 'John Doe',
                email: email,
                phone: '+91 98765 43210',
                role: overrideRole || (email === 'owner@turfhub.com' ? 'owner' : email === 'admin@turfhub.com' ? 'admin' : 'customer'),
                avatarUrl: email === 'owner@turfhub.com' ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80' : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                status: 'active',
                created_at: new Date().toISOString()
              };
              await setDoc(doc(db, 'users', fbUser.uid), userObj);
              setUser(userObj);
              setToken(idToken);
              localStorage.setItem('turf_app_user', JSON.stringify(userObj));
              localStorage.setItem('turf_app_token', idToken);
              return true;
            } catch (createErr) {
              // fallback to mock backend login below
            }
          }

          // Format clean user-friendly error message
          let friendlyMsg = 'Invalid email or password.';
          if (errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential') {
            friendlyMsg = 'Account not found or password incorrect. If you are new, click "Create an account" below.';
          } else if (errCode === 'auth/wrong-password') {
            friendlyMsg = 'Incorrect password. Please try again.';
          } else if (errCode === 'auth/invalid-email') {
            friendlyMsg = 'Please enter a valid email address.';
          } else if (errCode === 'auth/too-many-requests') {
            friendlyMsg = 'Too many failed login attempts. Please try again later.';
          } else if (fbErr.message) {
            friendlyMsg = fbErr.message.replace('Firebase: ', '');
          }
          throw new Error(friendlyMsg);
        }
      }

      // Backend API fallback
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        const loggedUser = overrideRole ? { ...data.user, role: overrideRole } : data.user;
        setUser(loggedUser);
        setToken(data.token);
        localStorage.setItem('turf_app_user', JSON.stringify(loggedUser));
        localStorage.setItem('turf_app_token', data.token);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (fullname: string, email: string, phone: string, role: UserRole, password?: string): Promise<boolean> => {
    try {
      if (password) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        try {
          // Real Firebase Auth signup
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          const idToken = await fbUser.getIdToken();

          const newUser: User = {
            id: fbUser.uid,
            fullname,
            email,
            phone,
            role,
            avatarUrl: role === 'owner' 
              ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            status: 'active',
            created_at: new Date().toISOString()
          };

          // Save to Firestore
          await setDoc(doc(db, 'users', fbUser.uid), newUser);

          setUser(newUser);
          setToken(idToken);
          localStorage.setItem('turf_app_user', JSON.stringify(newUser));
          localStorage.setItem('turf_app_token', idToken);
          return true;
        } catch (fbErr: any) {
          const errCode = fbErr?.code || '';
          
          if (errCode === 'auth/email-already-in-use') {
            // If email is already registered in Firebase, try logging in with the password!
            try {
              return await login(email, role, password);
            } catch (loginErr) {
              throw new Error('An account with this email already exists. Please switch to Sign In.');
            }
          } else if (errCode === 'auth/weak-password') {
            throw new Error('Password is too weak. Please use at least 6 characters.');
          } else if (errCode === 'auth/invalid-email') {
            throw new Error('Please enter a valid email address.');
          } else if (fbErr.message) {
            throw new Error(fbErr.message.replace('Firebase: ', ''));
          }
        }
      }

      // Backend API fallback
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, phone, role })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('turf_app_user', JSON.stringify(data.user));
        localStorage.setItem('turf_app_token', data.token);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const loginWithGoogle = async (role?: UserRole): Promise<boolean> => {
    try {
      let googleUserPayload: any = null;
      
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        googleUserPayload = {
          uid: fbUser.uid,
          email: fbUser.email,
          fullname: fbUser.displayName || 'Google User',
          photoUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: role || 'customer'
        };
      } catch (popupErr: any) {
        console.warn('Firebase Google popup skipped or failed:', popupErr);
        const errCode = popupErr?.code || '';
        
        if (errCode === 'auth/popup-closed-by-user') {
          throw new Error('Google sign-in window was closed before completing.');
        }

        // Fallback for network-request-failed, unauthorized-domain, popup-blocked, or restricted environments
        console.info(`[Google Auth Fallback] Authenticating demo Google account for role: ${role || 'customer'}`);
        googleUserPayload = {
          uid: 'google-demo-' + Math.random().toString(36).substring(2, 9),
          email: role === 'owner' ? 'owner.google@turfhub.com' : role === 'admin' ? 'admin.google@turfhub.com' : 'alex.google@example.com',
          fullname: role === 'owner' ? 'David Miller (Google Owner)' : role === 'admin' ? 'Platform Admin (Google)' : 'Alex Johnson',
          photoUrl: role === 'owner' 
            ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: role || 'customer'
        };
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUserPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Sign-In failed on server');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('turf_app_user', JSON.stringify(data.user));
      localStorage.setItem('turf_app_token', data.token);

      try {
        if (data.user?.id) {
          await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
        }
      } catch (e) {
        // ignore
      }

      return true;
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      throw new Error(err.message || 'Google Sign-In failed');
    }
  };

  const sendPhoneOtp = async (phone: string, countryCode: string = '+91') => {
    try {
      const res = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP code');
      }

      return {
        success: true,
        message: data.message,
        otpCode: data.otpCode,
        resendCooldownSeconds: data.resendCooldownSeconds || 30
      };
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      throw err;
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string, fullname?: string, role?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, fullname, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTP Verification failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('turf_app_user', JSON.stringify(data.user));
      localStorage.setItem('turf_app_token', data.token);

      try {
        if (data.user?.id) {
          await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
        }
      } catch (e) {
        // ignore
      }

      return true;
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      throw err;
    }
  };

  const loginWithOtp = async (identifier: string, isPhone: boolean, fullname?: string, role?: UserRole): Promise<boolean> => {
    try {
      const sanitizedId = identifier.replace(/[^a-zA-Z0-9@._-]/g, '');
      const uid = 'otp-' + Math.random().toString(36).substring(2, 9);
      const userRole: UserRole = role || 'customer';
      const userEmail = isPhone ? `${sanitizedId}@otp.turfhub.com` : identifier;
      const userPhone = isPhone ? identifier : '+91 98765 43210';
      const name = fullname || (isPhone ? `Player ${identifier.slice(-4)}` : identifier.split('@')[0]);

      const otpUser: User = {
        id: uid,
        fullname: name,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        avatarUrl: userRole === 'owner' 
          ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        created_at: new Date().toISOString()
      };

      // Save user to Firestore database
      try {
        await setDoc(doc(db, 'users', uid), otpUser);
      } catch (fErr) {
        console.warn('Firestore OTP write warning:', fErr);
      }

      const mockToken = `jwt_otp_${uid}_${Date.now()}`;
      setUser(otpUser);
      setToken(mockToken);
      localStorage.setItem('turf_app_user', JSON.stringify(otpUser));
      localStorage.setItem('turf_app_token', mockToken);
      return true;
    } catch (err: any) {
      console.error('OTP login error:', err);
      throw new Error(err.message || 'OTP authentication failed.');
    }
  };

  const completeOwnerProfile = async (ownerData: {
    businessName: string;
    location: string;
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
    sportTypes: string[];
    pricePerHour: number;
    images: string[];
    phone?: string;
  }) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/complete-owner-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify(ownerData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete owner profile');
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem('turf_app_user', JSON.stringify(data.user));
      }

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('turf_app_token', data.token);
      }

      return { success: true, user: data.user, turf: data.turf };
    } catch (err: any) {
      console.error('completeOwnerProfile Error:', err);
      throw new Error(err.message || 'Error submitting owner profile details.');
    }
  };

  const logout = () => {
    firebaseSignOut(auth).catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('turf_app_user');
    localStorage.removeItem('turf_app_token');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'customer') {
      const u: User = {
        id: 'usr-customer-1',
        fullname: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        role: 'customer',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        preferredSports: ['Cricket', 'Football'],
        status: 'active',
        created_at: new Date().toISOString()
      };
      setUser(u);
      localStorage.setItem('turf_app_user', JSON.stringify(u));
    } else if (newRole === 'owner') {
      const u: User = {
        id: 'owner-1',
        fullname: 'David Miller (Apex Sports)',
        email: 'owner@turfhub.com',
        phone: '+91 98111 22233',
        role: 'owner',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        preferredSports: ['Football', 'Box Cricket'],
        status: 'active',
        created_at: new Date().toISOString()
      };
      setUser(u);
      localStorage.setItem('turf_app_user', JSON.stringify(u));
    } else if (newRole === 'admin') {
      const u: User = {
        id: 'usr-admin-1',
        fullname: 'Platform Admin',
        email: 'admin@turfhub.com',
        phone: '+91 90000 00000',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        created_at: new Date().toISOString()
      };
      setUser(u);
      localStorage.setItem('turf_app_user', JSON.stringify(u));
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('turf_app_user', JSON.stringify(updated));

    // Also update in Firestore if auth user exists
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), updated, { merge: true }).catch(console.error);
    }

    fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...updatedData })
    }).catch(err => console.error(err));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : 'customer',
        pendingBookingIntent,
        setPendingBookingIntent,
        clearPendingBookingIntent,
        login,
        register,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithOtp,
        completeOwnerProfile,
        logout,
        switchRole,
        updateProfile,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
