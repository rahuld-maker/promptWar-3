/**
 * @file AICoachCard.jsx
 * @description AI Sustainability Coach widget powered by Google Gemini.
 * Fetches personalized carbon footprint coaching tips from the backend and
 * renders them with rich, accessible UI including skeleton loaders.
 *
 * @param {Object} props
 * @param {Object} props.userStats - The current user statistics state.
 * @param {Array}  props.recentLogs - The user's recent activity logs.
 * @param {Function} props.getIdToken - Function to retrieve Firebase ID token.
 */

import { useState, useCallback } from 'react';
import {
  Sparkles, Zap, Leaf, ShoppingBag, Lightbulb, Car,
  Trash2, RefreshCw, ChevronRight, Trophy, Target
} from 'lucide-react';

// ─── Helper: Category Icon Mapping ───────────────────────────────────────────
const CATEGORY_META = {
  travel:   { icon: Car,         color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  energy:   { icon: Lightbulb,   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  food:     { icon: Leaf,        color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  waste:    { icon: Trash2,      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  shopping: { icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

const IMPACT_COLORS = {
  High:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Low:    'text-gray-400 bg-gray-500/10 border-gray-600/30',
};

// ─── Sub-component: Skeleton Loader ──────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading AI coaching tips" aria-busy="true">
      {/* Headline skeleton */}
      <div className="h-6 bg-gray-800 rounded-xl w-3/4" />
      {/* Summary skeletons */}
      <div className="space-y-2">
        <div className="h-3.5 bg-gray-800 rounded-xl w-full" />
        <div className="h-3.5 bg-gray-800 rounded-xl w-5/6" />
        <div className="h-3.5 bg-gray-800 rounded-xl w-2/3" />
      </div>
      {/* Tip cards skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
          <div className="w-10 h-10 bg-gray-800 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-800 rounded-xl w-4/5" />
            <div className="h-3 bg-gray-800 rounded-xl w-2/3" />
          </div>
        </div>
      ))}
      {/* Challenge skeleton */}
      <div className="h-16 bg-gray-900/50 rounded-2xl border border-gray-800" />
    </div>
  );
}

// ─── Sub-component: Error State ───────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <Zap className="w-6 h-6 text-rose-400" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">Coach Unavailable</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        aria-label="Retry fetching AI coaching tips"
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 hover:border-emerald-500/50 text-xs font-bold text-gray-300 hover:text-white rounded-xl transition-all duration-200"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}

// ─── Sub-component: Idle/Empty State ─────────────────────────────────────────
function IdleState({ onFetch, isLoading }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shadow-lg shadow-emerald-500/5">
        <Sparkles className="w-8 h-8 text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">Your AI Coach is Ready</p>
        <p className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">
          Get personalized sustainability tips powered by Google Gemini, based on your actual activity logs.
        </p>
      </div>
      <button
        onClick={onFetch}
        disabled={isLoading}
        aria-label="Get AI coaching tips from Google Gemini"
        className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 text-xs font-black rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        Get My Coaching Tips
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AICoachCard({ userStats, recentLogs, getIdToken }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [coaching, setCoaching] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Fetches coaching tips from the protected backend endpoint.
   * Passes the Firebase ID token for authorization.
   */
  const fetchCoachingTips = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Authentication token is missing. Please sign in again.');
      }

      const payload = {
        totalSaved: userStats.savedPersonal,
        totalPoints: userStats.coolPoints,
        categoryBreakdown: userStats.categoryBreakdown,
        recentLogs: recentLogs.slice(0, 5),
      };

      const response = await fetch('/api/coach/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        // Show friendly quota message
        if (response.status === 429) {
          throw new Error('Daily API quota reached. The AI Coach resets at midnight. Try again tomorrow!');
        }
        throw new Error(errData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      setCoaching(result.data);
      setStatus('success');
    } catch (err) {
      console.error('[AI Coach] Fetch failed:', err.message);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setStatus('error');
    }
  }, [userStats, recentLogs, getIdToken]);

  // ─── Render States ──────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return <IdleState onFetch={fetchCoachingTips} isLoading={false} />;

      case 'loading':
        return <SkeletonLoader />;

      case 'error':
        return <ErrorState message={errorMessage} onRetry={fetchCoachingTips} />;

      case 'success':
        if (!coaching) return null;
        return (
          <div className="space-y-4">
            {/* Headline */}
            <div>
              <h3 className="text-base font-black text-white leading-tight">{coaching.headline}</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{coaching.summary}</p>
            </div>

            {/* Tips */}
            <div className="space-y-2.5" role="list" aria-label="AI coaching tips">
              {(coaching.tips || []).map((tip, i) => {
                const meta = CATEGORY_META[tip.category?.toLowerCase()] || CATEGORY_META.energy;
                const Icon = meta.icon;
                return (
                  <div
                    key={i}
                    role="listitem"
                    className={`flex gap-3 p-3.5 rounded-2xl border ${meta.bg} ${meta.border} transition-all hover:scale-[1.01]`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border ${meta.border}`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 leading-relaxed">{tip.tip}</p>
                      <span
                        className={`inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${IMPACT_COLORS[tip.impact] || IMPACT_COLORS.Medium}`}
                        aria-label={`Impact level: ${tip.impact}`}
                      >
                        {tip.impact} Impact
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekly Challenge */}
            {coaching.challenge && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Weekly Challenge</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{coaching.challenge}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Kudos */}
            {coaching.kudos && (
              <div className="p-3.5 rounded-2xl bg-yellow-950/30 border border-yellow-800/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">Kudos</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{coaching.kudos}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchCoachingTips}
              aria-label="Refresh AI coaching tips"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900/80 border border-gray-800 hover:border-emerald-500/40 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-400 rounded-xl transition-all duration-200"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              Refresh Tips
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section
      aria-label="AI Sustainability Coach"
      className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5 backdrop-blur-sm"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">AI Coach</h2>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Powered by Google Gemini</p>
          </div>
        </div>
        {/* Live indicator when active */}
        {status === 'success' && (
          <div className="flex items-center gap-1.5" aria-label="Tips are active and up to date">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Live Tips</span>
          </div>
        )}
      </div>

      {/* Dynamic Content Area */}
      {renderContent()}
    </section>
  );
}
