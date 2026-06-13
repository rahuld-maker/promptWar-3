import { useState } from 'react';
import { Search, Trophy, TrendingUp } from 'lucide-react';

export default function LeaderboardView({ userStats }) {
  const [boardTab, setBoardTab] = useState('individuals'); // 'individuals', 'sagecorp', 'globalteams'
  const [searchQuery, setSearchQuery] = useState('');

  const individuals = [
    { rank: 1, name: 'David Miller', savings: 38.5, points: 385, location: 'New York, US', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', badges: ['🥇 First', '🔥 Streak'] },
    { rank: 2, name: 'Sarah Jenkins', savings: 34.2, points: 342, location: 'London, UK', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', badges: ['🥈 Silver'] },
    { rank: 3, name: 'Emily Chen', savings: 31.8, points: 318, location: 'Singapore', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', badges: ['🥉 Bronze'] },
    { rank: 4, name: 'You (Current User)', savings: userStats.savedPersonal, points: userStats.coolPoints, location: 'Sage Corp, Engineering', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', badges: ['🌳 Eco Starter'], isUser: true },
    { rank: 5, name: 'Alex Rivera', savings: 26.4, points: 264, location: 'Madrid, ES', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', badges: [] },
    { rank: 6, name: 'Jessica Taylor', savings: 24.1, points: 241, location: 'Toronto, CA', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', badges: [] },
    { rank: 7, name: 'Marcus Vance', savings: 22.0, points: 220, location: 'Berlin, DE', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', badges: [] },
    { rank: 8, name: 'Aaliyah Jackson', savings: 19.5, points: 195, location: 'Cape Town, ZA', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=100', badges: [] }
  ];

  // If user stats emissions are higher than David, Sarah, Emily, we dynamically reorder the individuals!
  const sortedIndividuals = [...individuals]
    .map(ind => ind.isUser ? { ...ind, savings: userStats.savedPersonal, points: userStats.coolPoints } : ind)
    .sort((a, b) => b.savings - a.savings)
    .map((ind, idx) => ({ ...ind, rank: idx + 1 }));

  const departments = [
    { rank: 1, name: 'Engineering', savings: 450.2, members: 42, points: 4500 },
    { rank: 2, name: 'Marketing & Design', savings: 380.5, members: 25, points: 3800 },
    { rank: 3, name: 'HR & Operations', savings: 310.8, members: 18, points: 3100 },
    { rank: 4, name: 'Sales & Partners', savings: 279.0, members: 30, points: 2790 },
    { rank: 5, name: 'Finance', savings: 189.5, members: 12, points: 1890 }
  ];

  const globalTeams = [
    { rank: 1, name: 'Sage Corp', savings: userStats.savedSageCorp, members: 127, points: 12700, industry: 'Technology' },
    { rank: 2, name: 'GreenSpace Ltd', savings: 1890.4, members: 154, points: 18900, industry: 'Real Estate' },
    { rank: 3, name: 'EcoRetail Alliance', savings: 1560.8, members: 92, points: 15600, industry: 'Retail' },
    { rank: 4, name: 'Stellar Logistics', savings: 1104.2, members: 78, points: 11000, industry: 'Transportation' }
  ];

  // Re-sort global teams based on Sage Corp live stats
  const sortedGlobalTeams = [...globalTeams]
    .map(team => team.name === 'Sage Corp' ? { ...team, savings: userStats.savedSageCorp, points: Math.round(userStats.savedSageCorp * 10) } : team)
    .sort((a, b) => b.savings - a.savings)
    .map((t, idx) => ({ ...t, rank: idx + 1 }));

  const getFilteredData = () => {
    if (boardTab === 'individuals') {
      return sortedIndividuals.filter(ind => ind.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (boardTab === 'sagecorp') {
      return departments.filter(dept => dept.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return sortedGlobalTeams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight my-0">Community Standings</h1>
          <p className="text-sm text-gray-400">Track climate actions across individuals, company departments, and global corporate cohorts.</p>
        </div>

        {/* Board switcher */}
        <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-2xl" role="tablist" aria-label="Filter leaderboard standings by category">
          {[
            { id: 'individuals', label: 'Individuals' },
            { id: 'sagecorp', label: 'Sage Corp' },
            { id: 'globalteams', label: 'Global Teams' }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={boardTab === tab.id}
              onClick={() => { setBoardTab(tab.id); setSearchQuery(''); }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl uppercase tracking-wider transition-all duration-200 ${
                boardTab === tab.id 
                  ? 'text-gray-950 bg-emerald-400 font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Summary Banner */}
        <div className="xl:col-span-4 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Your Standing</h3>
              <p className="text-xs text-gray-400">Currently in top 5% of Sage Corp</p>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-850 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Personal Rank</span>
              <span className="text-white font-extrabold">
                #{sortedIndividuals.find(ind => ind.isUser)?.rank || 4}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Emissions Saved</span>
              <span className="text-emerald-400 font-extrabold">{userStats.savedPersonal.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Total Points</span>
              <span className="text-yellow-400 font-extrabold">{userStats.coolPoints} pts</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              Promotion Status
            </span>
            <p className="text-xs text-emerald-300 leading-relaxed font-medium">
              Save another <span className="font-black">2.4 kg CO2eq</span> to pass Emily Chen and claim the 3rd place podium spot!
            </p>
          </div>
        </div>

        {/* Right: Detailed Table */}
        <div className="xl:col-span-8 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 hover:border-gray-750 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white tracking-wide">
              {boardTab === 'individuals' && 'Global Individual Leaderboard'}
              {boardTab === 'sagecorp' && 'Sage Corp Department Standings'}
              {boardTab === 'globalteams' && 'Global Corporate Cohort'}
            </h3>
            {/* Search Input */}
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
              <label htmlFor="board-search" className="sr-only">Search standings</label>
              <input
                id="board-search"
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="text-gray-500 border-b border-gray-850 uppercase tracking-wider">
                  <th className="pb-3 font-bold w-12 text-center">Rank</th>
                  <th className="pb-3 font-bold">
                    {boardTab === 'individuals' ? 'Name' : 'Team / Department'}
                  </th>
                  <th className="pb-3 font-bold text-right">Members</th>
                  <th className="pb-3 font-bold text-right">Emissions Saved</th>
                  <th className="pb-3 font-bold text-right">Cool Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850/60">
                {filteredData.map((row) => (
                  <tr 
                    key={row.rank + '-' + row.name} 
                    className={`transition ${row.isUser ? 'bg-emerald-500/5 text-emerald-400 font-extrabold' : 'text-gray-300 hover:bg-gray-950/30'}`}
                  >
                    <td className="py-4 font-black text-center text-sm">
                      {row.rank === 1 && '🥇'}
                      {row.rank === 2 && '🥈'}
                      {row.rank === 3 && '🥉'}
                      {row.rank > 3 && `#${row.rank}`}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {row.avatar && (
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-850 border border-gray-800">
                            <img src={row.avatar} alt={`${row.name}'s profile photo`} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className={`font-semibold ${row.isUser ? 'text-emerald-400' : 'text-white'}`}>{row.name}</p>
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                            {row.location || row.industry || 'Sage Corp'}
                          </span>
                        </div>
                        {row.badges && row.badges.map(b => (
                          <span key={b} className="text-[9px] font-bold bg-gray-950 text-gray-400 border border-gray-850 px-2 py-0.5 rounded-lg shrink-0">
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-right text-gray-400">
                      {row.members || '1'}
                    </td>
                    <td className="py-4 text-right text-white font-bold">
                      {row.savings.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg
                    </td>
                    <td className="py-4 text-right text-yellow-400 font-bold">
                      {row.points.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
