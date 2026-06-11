import React, { useState, useEffect } from 'react';
import { 
  Home, LogIn, Award, BarChart3, Users, Leaf, Coins, 
  Search, ShieldCheck, ChevronDown, Menu, X, CheckCircle2 
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import LogActionView from './components/LogActionView';
import ChallengesView from './components/ChallengesView';
import LeaderboardView from './components/LeaderboardView';
import AnalyticsView from './components/AnalyticsView';

export default function App() {
  // Navigation active tab state: 'home', 'log', 'challenges', 'leaderboard', 'analytics'
  const [activeTab, setActiveTab] = useState('home');
  const [activeScope, setActiveScope] = useState('personal');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global State for user metrics
  const [userStats, setUserStats] = useState({
    coolPoints: 1250,
    savedPersonal: 28.94,
    savedSageCorp: 1420.50,
    savedGlobal: 842910.00,
    categoryBreakdown: {
      travel: 14.5,
      energy: 7.2,
      food: 4.3,
      waste: 2.94,
      shopping: 0.0
    },
    weeklyTrend: [
      { day: 'Mon', savings: 3.2 },
      { day: 'Tue', savings: 4.8 },
      { day: 'Wed', savings: 2.9 },
      { day: 'Thu', savings: 5.1 },
      { day: 'Fri', savings: 3.8 },
      { day: 'Sat', savings: 6.2 },
      { day: 'Sun', savings: 2.94 }
    ]
  });

  // Recent logs state
  const [recentLogs, setRecentLogs] = useState([
    { id: 'log-1', category: 'travel', savings: 4.5, points: 45, description: 'Commuted by train instead of driving a personal sedan', date: 'Jun 11, 2026' },
    { id: 'log-2', category: 'food', savings: 2.7, points: 27, description: 'Chose a local plant-based salad over an imported beef burger', date: 'Jun 10, 2026' },
    { id: 'log-3', category: 'energy', savings: 1.8, points: 18, description: 'Switched off home AC and used standard ceiling fan for 3 hours', date: 'Jun 09, 2026' },
    { id: 'log-4', category: 'waste', savings: 2.0, points: 20, description: 'Recycled and composted household organic and plastic materials', date: 'Jun 08, 2026' }
  ]);

  // Challenges state
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Commute-Free Week', category: 'travel', description: 'Switch your commute to cycling, walking, or public transport for 7 consecutive days.', savedCO2: 12.0, points: 200, progress: 40, joined: true },
    { id: 2, title: 'Meat-Free Week', category: 'food', description: 'Eat plant-based meals exclusively for one week to save livestock and import emissions.', savedCO2: 8.5, points: 250, progress: 0, joined: false },
    { id: 3, title: 'Zero Waste Weekend', category: 'waste', description: 'Compost organic waste and recycle plastic, cardboard, and metal for 2 full days.', savedCO2: 5.0, points: 150, progress: 60, joined: true },
    { id: 4, title: 'Solar Switch', category: 'energy', description: 'Switch off major grids and power devices using personal solar adapters or natural light.', savedCO2: 15.0, points: 300, progress: 0, joined: false },
    { id: 5, title: 'Fast-Fashion Detox', category: 'shopping', description: 'Refrain from buying any fast-fashion garments this month; repair or shop second-hand instead.', savedCO2: 18.0, points: 250, progress: 0, joined: false }
  ]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Actions logging handler
  const handleLogAction = (action) => {
    // 1. Update stats
    setUserStats(prev => {
      const updatedPersonal = parseFloat((prev.savedPersonal + action.savings).toFixed(2));
      const updatedSageCorp = parseFloat((prev.savedSageCorp + action.savings).toFixed(2));
      const updatedGlobal = parseFloat((prev.savedGlobal + action.savings).toFixed(2));
      
      const newBreakdown = { ...prev.categoryBreakdown };
      newBreakdown[action.category] = parseFloat((newBreakdown[action.category] + action.savings).toFixed(2));

      // Update Sunday (today) trend savings
      const newWeeklyTrend = prev.weeklyTrend.map(item => {
        if (item.day === 'Sun') {
          return { ...item, savings: parseFloat((item.savings + action.savings).toFixed(2)) };
        }
        return item;
      });

      return {
        ...prev,
        coolPoints: prev.coolPoints + action.points,
        savedPersonal: updatedPersonal,
        savedSageCorp: updatedSageCorp,
        savedGlobal: updatedGlobal,
        categoryBreakdown: newBreakdown,
        weeklyTrend: newWeeklyTrend
      };
    });

    // 2. Add log entry
    const newLog = {
      id: `log-${Date.now()}`,
      category: action.category,
      savings: action.savings,
      points: action.points,
      description: action.description,
      date: 'Jun 11, 2026' // hardcoded current mock date
    };
    setRecentLogs(prev => [newLog, ...prev]);

    showToast(`Logged Action! +${action.points} Cool Points and saved ${action.savings} kg CO2eq!`);
  };

  // Delete Log handler
  const handleDeleteLog = (id) => {
    const targetLog = recentLogs.find(log => log.id === id);
    if (!targetLog) return;

    setUserStats(prev => {
      const updatedPersonal = Math.max(0, parseFloat((prev.savedPersonal - targetLog.savings).toFixed(2)));
      const updatedSageCorp = Math.max(0, parseFloat((prev.savedSageCorp - targetLog.savings).toFixed(2)));
      const updatedGlobal = Math.max(0, parseFloat((prev.savedGlobal - targetLog.savings).toFixed(2)));
      
      const newBreakdown = { ...prev.categoryBreakdown };
      newBreakdown[targetLog.category] = Math.max(0, parseFloat((newBreakdown[targetLog.category] - targetLog.savings).toFixed(2)));

      const newWeeklyTrend = prev.weeklyTrend.map(item => {
        if (item.day === 'Sun') {
          return { ...item, savings: Math.max(0, parseFloat((item.savings - targetLog.savings).toFixed(2))) };
        }
        return item;
      });

      return {
        ...prev,
        coolPoints: Math.max(0, prev.coolPoints - targetLog.points),
        savedPersonal: updatedPersonal,
        savedSageCorp: updatedSageCorp,
        savedGlobal: updatedGlobal,
        categoryBreakdown: newBreakdown,
        weeklyTrend: newWeeklyTrend
      };
    });

    setRecentLogs(prev => prev.filter(log => log.id !== id));
    showToast(`Removed log: Saved ${targetLog.savings} kg CO2eq removed.`);
  };

  // Join challenge handler
  const handleJoinChallenge = (id) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === id) {
        return { ...ch, joined: true, progress: 0 };
      }
      return ch;
    }));
    const chName = challenges.find(c => c.id === id)?.title;
    showToast(`Joined Challenge: "${chName}"! Let's get to work.`);
  };

  // Log progress inside challenges
  const handleLogChallengeProgress = (id) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === id) {
        const nextProgress = Math.min(100, ch.progress + 20);
        if (nextProgress === 100) {
          // Trigger reward stats increase
          setUserStats(statsPrev => {
            const updatedPersonal = parseFloat((statsPrev.savedPersonal + ch.savedCO2).toFixed(2));
            const updatedSageCorp = parseFloat((statsPrev.savedSageCorp + ch.savedCO2).toFixed(2));
            const updatedGlobal = parseFloat((statsPrev.savedGlobal + ch.savedCO2).toFixed(2));
            
            const newBreakdown = { ...statsPrev.categoryBreakdown };
            newBreakdown[ch.category] = parseFloat((newBreakdown[ch.category] + ch.savedCO2).toFixed(2));

            return {
              ...statsPrev,
              coolPoints: statsPrev.coolPoints + ch.points,
              savedPersonal: updatedPersonal,
              savedSageCorp: updatedSageCorp,
              savedGlobal: updatedGlobal,
              categoryBreakdown: newBreakdown
            };
          });

          // Show Toast celebration
          setTimeout(() => {
            showToast(`🎉 Challenge Completed! "${ch.title}" earned you +${ch.points} pts & saved ${ch.savedCO2} kg CO2!`);
          }, 300);
        } else {
          showToast(`Progress logged for "${ch.title}" (+20%)`);
        }
        return { ...ch, progress: nextProgress };
      }
      return ch;
    }));
  };

  // Determine which view component to render
  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardView 
            userStats={userStats} 
            onLogAction={handleLogAction}
            activeScope={activeScope}
            setActiveScope={setActiveScope}
            recentLogs={recentLogs}
          />
        );
      case 'log':
        return (
          <LogActionView 
            userStats={userStats} 
            onLogAction={handleLogAction}
            onDeleteLog={handleDeleteLog}
            recentLogs={recentLogs}
          />
        );
      case 'challenges':
        return (
          <ChallengesView 
            challenges={challenges}
            onJoinChallenge={handleJoinChallenge}
            onLogChallengeProgress={handleLogChallengeProgress}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardView userStats={userStats} />
        );
      case 'analytics':
        return (
          <AnalyticsView userStats={userStats} />
        );
      default:
        return (
          <DashboardView 
            userStats={userStats} 
            onLogAction={handleLogAction}
            activeScope={activeScope}
            setActiveScope={setActiveScope}
            recentLogs={recentLogs}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row relative">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 border border-emerald-500/50 px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/10 flex items-center gap-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-gray-850 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">CoolEarth</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 1. Left Sidebar (Fixed for Desktop) */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-850 flex flex-col justify-between shrink-0 z-40 transition-transform duration-300 md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo & Title */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-center shadow-neon-emerald">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white block">CoolEarth</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Sage Corp Ecosystem</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-8 space-y-1.5">
            {[
              { id: 'home', label: 'Home (Dashboard)', icon: Home },
              { id: 'log', label: 'Log Action', icon: LogIn },
              { id: 'challenges', label: 'Challenges', icon: Award },
              { id: 'leaderboard', label: 'Leaderboard', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl border text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-500 text-gray-950 border-emerald-500 shadow-neon-emerald font-black' 
                      : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-850/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings/Profile details */}
        <div className="p-6 border-t border-gray-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border-2 border-emerald-500/30">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Rahul K.</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Climate Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* 2. Top Header */}
        <header className="sticky top-0 bg-gray-950/80 backdrop-blur-md border-b border-gray-900/50 py-3.5 px-6 flex items-center justify-between z-20 gap-4">
          
          {/* Search bar */}
          <div className="relative max-w-md w-full md:block hidden">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search actions, challenges, team mates..."
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 placeholder-gray-550"
            />
          </div>
          <div className="md:hidden"></div>

          {/* User Metrics & Level Badge */}
          <div className="flex items-center gap-3">
            {/* Level badge */}
            <div className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/40 py-1.5 px-3 rounded-2xl shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Level 4: Guardian</span>
            </div>

            {/* Cool Points badge */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 py-1.5 px-3.5 rounded-2xl shrink-0">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-black text-yellow-400 tracking-wide">{userStats.coolPoints.toLocaleString()}</span>
              <span className="text-[9px] uppercase font-bold text-yellow-500/70 tracking-widest hidden sm:inline">pts</span>
            </div>

            {/* Profile Avatar Trigger */}
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-800 shrink-0 bg-gray-800 cursor-pointer hover:border-emerald-500/40 transition">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* 3. Main Content Area */}
        <section className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </section>
      </main>
    </div>
  );
}
