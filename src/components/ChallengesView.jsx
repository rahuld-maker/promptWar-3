import { useState } from 'react';
import { Award, Leaf, Zap, Utensils, Trash2, ShoppingBag, Bus, CheckCircle2, Flame, Users } from 'lucide-react';

export default function ChallengesView({ 
  challenges, 
  onJoinChallenge, 
  onLogChallengeProgress 
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'joined', 'available'

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'travel': return Bus;
      case 'energy': return Zap;
      case 'food': return Utensils;
      case 'waste': return Trash2;
      case 'shopping': return ShoppingBag;
      default: return Leaf;
    }
  };

  const getCategoryStyles = (category) => {
    switch (category.toLowerCase()) {
      case 'travel': return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' };
      case 'energy': return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' };
      case 'food': return { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' };
      case 'waste': return { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400' };
      case 'shopping': return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' };
      default: return { bg: 'bg-gray-800', text: 'text-gray-400' };
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (filter === 'joined') return c.joined && c.progress < 100;
    if (filter === 'available') return !c.joined;
    if (filter === 'completed') return c.progress >= 100;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight my-0">Sustainability Challenges</h1>
          <p className="text-sm text-gray-400">Join community goals and push your eco-friendly habits further.</p>
        </div>
        {/* Filters */}
        <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-2xl" role="tablist" aria-label="Filter challenges by status">
          {[
            { id: 'all', label: 'All' },
            { id: 'joined', label: 'Joined' },
            { id: 'available', label: 'Available' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl uppercase tracking-wider transition-all duration-200 ${
                filter === tab.id 
                  ? 'text-gray-950 bg-emerald-400 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl">
            <Award className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">No challenges matches the selected filter.</p>
            <p className="text-xs text-gray-500 mt-1">Try toggling filters or join new available activities.</p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => {
            const CatIcon = getCategoryIcon(challenge.category);
            const style = getCategoryStyles(challenge.category);
            const isCompleted = challenge.progress >= 100;

            return (
              <div 
                key={challenge.id} 
                className={`bg-gray-950/60 border rounded-3xl p-6 hover:border-gray-750 transition-all duration-300 flex flex-col justify-between ${
                  challenge.joined 
                    ? 'border-emerald-500/25 bg-emerald-500/[0.01] shadow-neon-emerald/5' 
                    : 'border-gray-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 border px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                      <CatIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{challenge.category}</span>
                    </div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : challenge.joined ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500/80">
                        <Flame className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Available</span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug mb-1">{challenge.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{challenge.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-900 border border-gray-850/60 rounded-2xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Goal Savings</p>
                      <p className="text-sm font-black text-white mt-0.5">-{challenge.savedCO2} kg CO2</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-850/60 rounded-2xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Reward</p>
                      <p className="text-sm font-black text-yellow-400 mt-0.5 flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        +{challenge.points} pts
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  {challenge.joined && (
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-400">Challenge Progress</span>
                        <span className="text-emerald-400">{challenge.progress}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={challenge.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${challenge.title} progress: ${challenge.progress}%`}
                        className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-850"
                      >
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isCompleted ? (
                    <div className="w-full text-center py-2.5 px-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs font-extrabold uppercase rounded-2xl tracking-wider">
                      Completed &amp; Points Claimed
                    </div>
                  ) : challenge.joined ? (
                    <button
                      onClick={() => onLogChallengeProgress(challenge.id)}
                      aria-label={`Log progress for ${challenge.title} challenge (+20%)`}
                      className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-black uppercase rounded-2xl tracking-wider transition shadow-neon-emerald cursor-pointer"
                    >
                      Log Progress (+20%)
                    </button>
                  ) : (
                    <button
                      onClick={() => onJoinChallenge(challenge.id)}
                      aria-label={`Join the ${challenge.title} challenge`}
                      className="w-full py-2.5 px-4 bg-gray-900 border border-gray-850 text-white hover:border-emerald-500/50 hover:text-emerald-400 text-xs font-extrabold uppercase rounded-2xl tracking-wider transition cursor-pointer"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Community Stats Footer */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center" aria-hidden="true">
            <Users className="w-6 h-6 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Community Engagement</h4>
            <p className="text-xs text-gray-400">Join teams to compete with Sage Corp departments or other corporations globally.</p>
          </div>
        </div>
        <div className="flex gap-6 shrink-0 text-center">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Active Challenges</span>
            <p className="text-lg font-black text-white mt-0.5">14,204</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Points Shared Today</span>
            <p className="text-lg font-black text-yellow-400 mt-0.5">340,900</p>
          </div>
        </div>
      </div>
    </div>
  );
}
