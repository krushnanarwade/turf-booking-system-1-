import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  login: (email: string, role?: UserRole, password?: string) => Promise<boolean>;
  register: (fullname: string, email: string, phone: string, role: UserRole, password?: string) => Promise<boolean>;
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
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setIsLoading(false);
    } else if (!user && !savedUser) {
      // Default demo customer
      const defaultCustomer: User = {
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
      setUser(defaultCustomer);
      setToken('mock_jwt_token_customer');
      localStorage.setItem('turf_app_user', JSON.stringify(defaultCustomer));
      localStorage.setItem('turf_app_token', 'mock_jwt_token_customer');
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email: string, overrideRole?: UserRole, password?: string): Promise<boolean> => {
    try {
      if (password) {
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
        alert(error.error || 'Login failed');
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.message || 'Login error occurred');
      return false;
    }
  };

  const register = async (fullname: string, email: string, phone: string, role: UserRole, password?: string): Promise<boolean> => {
    try {
      if (password) {
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
        alert(error.error || 'Registration failed');
        return false;
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(err.message || 'Registration failed');
      return false;
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
        login,
        register,
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
