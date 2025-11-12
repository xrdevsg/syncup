import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile } from '../services/firestoreService';
import { Mode } from '../types';
import { LogoIcon } from './Logo';

type AuthMode = 'login' | 'signup' | 'forgot';

const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        if (!email || !password) {
            setError("Please enter both email and password.");
            setIsLoading(false);
            return;
        }
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'signup') {
        if (!email || !password || !name) {
            setError("Please fill out all fields.");
            setIsLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          // Send email verification
          await sendEmailVerification(userCredential.user);
          await createUserProfile(userCredential.user, name, Mode.Social);
          setSuccess("Account created! A verification email has been sent.");
        } else {
          throw new Error("User creation failed.");
        }
      } else if (mode === 'forgot') {
        if (!email) {
            setError("Please enter your email address.");
            setIsLoading(false);
            return;
        }
        await sendPasswordResetEmail(auth, email);
        setSuccess("Password reset email sent! Check your inbox.");
        setEmail('');
      }
    } catch (err: any) {
        // More user-friendly error messages
        console.error("Auth error details:", err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError('Invalid email or password.');
        } else if (err.code === 'auth/email-already-in-use') {
            setError('An account with this email already exists.');
        } else if (err.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters.');
        } else if (err.code === 'auth/user-not-found' && mode === 'forgot') {
            setError('No account found with this email.');
        } else if (err.code === 'permission-denied') {
            setError('Permission denied. Firestore rules may need to be updated.');
        } else {
            setError(`An error occurred: ${err.message || 'Please try again.'}`);
        }
        console.error("Firebase auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <LogoIcon />
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mt-4">Welcome to SyncUp</h1>
        <p className="text-slate-600 mt-2">Connect on purpose.</p>
      </div>
      
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
        {mode !== 'forgot' && (
          <div className="flex border-b border-gray-200 mb-6">
              <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className={`flex-1 py-2 font-semibold text-center transition-colors ${mode === 'login' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
                  Log In
              </button>
              <button onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} className={`flex-1 py-2 font-semibold text-center transition-colors ${mode === 'signup' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500'}`}>
                  Sign Up
              </button>
          </div>
        )}
        
        {mode === 'forgot' && (
          <h2 className="text-xl font-bold text-slate-900 mb-6">Reset Password</h2>
        )}

        <form onSubmit={handleAuthAction} className="space-y-4">
            {mode === 'signup' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>
            {mode !== 'forgot' && (
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password</label>
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center">{success}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-400">
                {isLoading ? 'Processing...' : (mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email')}
            </button>
        </form>

        {mode !== 'forgot' && (
          <button onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }} className="w-full text-sm text-sky-600 hover:text-sky-700 mt-4 font-medium">
              Forgot Password?
          </button>
        )}
        {mode === 'forgot' && (
          <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className="w-full text-sm text-sky-600 hover:text-sky-700 mt-4 font-medium">
              Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;


