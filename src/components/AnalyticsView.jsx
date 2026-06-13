import { useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Calendar, BarChart3, PieChart as PieIcon } from 'lucide-react';

export default function AnalyticsView({ userStats }) {
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly', 'monthly'

  // Categories mapping
  const categoryData = [
    { name: 'Travel', value: userStats.categoryBreakdown.travel, color: '#10b981' },
    { name: 'Energy', value: userStats.categoryBreakdown.energy, color: '#f59e0b' },
    { name: 'Food', value: userStats.categoryBreakdown.food, color: '#f43f5e' },
    { name: 'Waste', value: userStats.categoryBreakdown.waste, color: '#a855f7' },
    { name: 'Shopping', value: userStats.categoryBreakdown.shopping, color: '#3b82f6' }
  ].filter(c => c.value > 0);

  // Fallback if no categories are logged
  const cleanCategoryData = categoryData.length > 0 ? categoryData : [
    { name: 'Travel', value: 12.5, color: '#10b981' },
    { name: 'Energy', value: 6.2, color: '#f59e0b' },
    { name: 'Food', value: 4.3, color: '#f43f5e' },
    { name: 'Waste', value: 3.5, color: '#a855f7' }
  ];

  // Daily target vs actual
  const targetVsActualData = userStats.weeklyTrend.map(t => ({
    day: t.day,
    savings: t.savings,
    target: 4.5 // daily target
  }));

  const totalCO2Saved = Object.values(userStats.categoryBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight my-0">Savings Analytics</h1>
          <p className="text-sm text-gray-400">Detailed visualizations of your progress and lifestyle carbon reduction trend.</p>
        </div>
        <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-2xl" role="group" aria-label="Timeframe selector">
          <button
            onClick={() => setTimeframe('weekly')}
            aria-pressed={timeframe === 'weekly'}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl uppercase tracking-wider transition-all duration-200 ${
              timeframe === 'weekly' ? 'text-gray-950 bg-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            aria-pressed={timeframe === 'monthly'}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl uppercase tracking-wider transition-all duration-200 ${
              timeframe === 'monthly' ? 'text-gray-950 bg-emerald-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 hover:border-gray-750 transition-all duration-300">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total CO2 Savings</p>
          <h3 className="text-2xl font-black text-white mt-1">{totalCO2Saved.toFixed(2)} kg</h3>
          <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Top 5% of active users</span>
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 hover:border-gray-750 transition-all duration-300">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cool Points Earned</p>
          <h3 className="text-2xl font-black text-yellow-400 mt-1">{userStats.coolPoints} pts</h3>
          <p className="text-xs text-gray-400 font-semibold mt-2">Claimable rewards available</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 hover:border-gray-750 transition-all duration-300">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Activity Streak</p>
          <h3 className="text-2xl font-black text-orange-400 mt-1">12 Days</h3>
          <p className="text-xs text-orange-300 font-semibold mt-2">🔥 Keep it up! 3x multiplier active</p>
        </div>
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Area Chart (Col 7) */}
        <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-gray-750 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Savings Trend
            </h3>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Last 7 Days
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userStats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '16px' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" name="Savings (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart (Col 5) */}
        <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-gray-750 transition-all duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2 mb-6">
              <PieIcon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Category Breakdown
            </h3>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cleanCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {cleanCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '12px', fontSize: '11px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white">{totalCO2Saved.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total kg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {cleanCategoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                <span className="text-xs font-semibold text-gray-300">{cat.name}</span>
                <span className="text-xs text-gray-500 font-bold">({cat.value.toFixed(1)} kg)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart comparing Savings vs Target (Col 12) */}
        <div className="lg:col-span-12 bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-gray-750 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Daily Comparison vs Target (4.5 kg Goal)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '16px' }}
                  labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" fontSize={10} wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} name="Saved Emissions" />
                <Bar dataKey="target" fill="#374151" radius={[4, 4, 0, 0]} name="Target Limit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
