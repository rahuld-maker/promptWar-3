import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { Leaf, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      // Friendly messages for standard Firebase/browser auth failure codes
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed before completion. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('A previous sign-in attempt was interrupted. Refresh and try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups.');
      } else {
        setError(err.message || 'An unexpected error occurred during Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main aria-label="Sign in to CoolEarth" className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background glow graphics */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

      <div className="w-full max-w-md bg-gray-900 border border-gray-850 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-neon-emerald mb-6" aria-hidden="true">
          <Leaf className="w-9 h-9 text-emerald-400" aria-hidden="true" />
        </div>

        {/* Text Details */}
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">CoolEarth</h1>
        <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest mb-6">Carbon Footprint Awareness</p>
        
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          Join Sage Corp's sustainable initiative. Track your daily habits, join ecological challenges, and view our team's carbon savings in real-time.
        </p>

        {/* Preview Mode Notification */}
        {!auth && (
          <div
            role="note"
            aria-live="polite"
            className="mb-6 p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl text-left flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-amber-300">Preview Mode Active</p>
              <p className="text-[11px] text-amber-450/80 leading-relaxed mt-0.5">
                VITE_FIREBASE_API_KEY environment variable is not configured. Clicking Sign-In below will log you in as a mock preview user.
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-left flex items-start gap-3 animate-fade-in"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-rose-300 font-medium leading-relaxed">{error}</p>
          </div>
        )}


        {/* Google sign-in Button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          aria-label="Sign in with Google"
          aria-busy={loading}
          className={`w-full py-4 px-6 rounded-2xl border flex items-center justify-center gap-3 text-sm font-bold tracking-wide uppercase transition-all duration-300 ${
            loading 
              ? 'bg-gray-850 border-gray-800 text-gray-500 cursor-wait' 
              : 'bg-white border-transparent text-gray-950 hover:bg-gray-100 hover:scale-[1.01] active:scale-95 cursor-pointer font-black shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              {/* SVG Google Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 01-2.5 3.77v3.13h4.05c2.37-2.18 3.73-5.39 3.73-8.75z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.05-3.13c-1.12.75-2.56 1.2-3.88 1.2-2.99 0-5.52-2.02-6.42-4.73H1.27v3.25C3.25 21.84 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.58 14.43A7.16 7.16 0 015.14 12c0-.85.14-1.68.44-2.43V6.32H1.27A11.96 11.96 0 000 12c0 2.08.53 4.04 1.47 5.75l4.11-3.32z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.16 1.27 5.75l4.31 3.32c.9-2.71 3.43-4.73 6.42-4.73z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-gray-850 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
            SECURED THROUGH FIREBASE GOOGLE OAUTH
          </p>
        </div>
      </main>
  );
}
