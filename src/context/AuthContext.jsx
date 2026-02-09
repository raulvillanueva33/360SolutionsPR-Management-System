import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() });
          } else {
            setProfile({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              role: 'viewer',
            });
          }
        } catch (err) {
          console.error('Error cargando perfil:', err);
          setProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'viewer',
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  function hasRole(...roles) {
    return profile && roles.includes(profile.role);
  }

  const value = { user, profile, loading, login, logout, resetPassword, hasRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
