import React, { useState, useEffect } from 'react';
import { 
  Bus, Zap, Utensils, Trash2, ShoppingBag, Plus, Minus, Coins, 
  ArrowUpRight, BarChart3, Users, Leaf, Bike, Train, Car, Plane, 
  Trash, ShoppingCart, Award, CheckCircle2, ChevronRight, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardView({ 
  userStats, 
  onLogAction, 
  activeScope, 
  setActiveScope, 
  recentLogs 
}) {
  // Tracker and scope definitions
  const scopeData = {
    personal: {
      saved: userStats.savedPersonal,
      goal: 40.0,
      label: 'Personal Target',
      treesSnippet: `Yay! Your CO2 savings equal what ${Math.round(userStats.savedPersonal * 0.52)} trees fix in a month.`
    },
    sagecorp: {
      saved: userStats.savedSageCorp,
      goal: 2000.0,
      label: 'Sage Corp Target',
      treesSnippet: `Awesome! Sage Corp savings equal what ${Math.round(userStats.savedSageCorp * 0.52)} trees fix in a month.`
    },
    global: {
      saved: userStats.savedGlobal,
      goal: 1200000.0,
      label: 'Global Target',
      treesSnippet: `Incredible! Global savings equal what ${Math.round(userStats.savedGlobal * 0.52).toLocaleString()} trees fix in a month.`
    }
  };

  const currentScopeStats = scopeData[activeScope] || scopeData.personal;
  const progressPercent = Math.min(100, Math.max(0, (currentScopeStats.saved / currentScopeStats.goal) * 100));

  // Log action interactive states
  const [activeCategory, setActiveCategory] = useState('travel');
  
  // Selection states for travel
  const [travelBy, setTravelBy] = useState('bicycle');
  const [travelDistance, setTravelDistance] = useState(5);
  const [travelInsteadOf, setTravelInsteadOf] = useState('car');

  // Selection states for energy
  const [energyBy, setEnergyBy] = useState('solar');
  const [energyHours, setEnergyHours] = useState(4);
  const [energyInsteadOf, setEnergyInsteadOf] = useState('grid');

  // Selection states for food
  const [foodBy, setFoodBy] = useState('plant');
  const [foodPortions, setFoodPortions] = useState(1);
  const [foodInsteadOf, setFoodInsteadOf] = useState('beef');

  // Selection states for waste
  const [wasteBy, setWasteBy] = useState('composting');
  const [wasteWeight, setWasteWeight] = useState(2);
  const [wasteInsteadOf, setWasteInsteadOf] = useState('landfill');

  // Selection states for shopping
  const [shoppingBy, setShoppingBy] = useState('secondhand');
  const [shoppingItems, setShoppingItems] = useState(1);
  const [shoppingInsteadOf, setShoppingInsteadOf] = useState('fastfashion');

  // Success logged notification
  const [showLogSuccess, setShowLogSuccess] = useState(false);
  const [lastSavedAmount, setLastSavedAmount] = useState(0);

  // Analytics toggle
  const [analyticsMetric, setAnalyticsMetric] = useState('emissions'); // 'points' or 'emissions'

  // Factor definitions for emissions (kg CO2eq saved per unit)
  const emissionFactors = {
    travel: {
      by: { bicycle: 0, bus: 0.03, train: 0.02 },
      instead: { car: 0.18, flight: 0.25, rickshaw: 0.12 }
    },
    energy: {
      by: { solar: 0, led: 0.005, fan: 0.04 },
      instead: { grid: 0.5, incandescent: 0.06, ac: 1.2 }
    },
    food: {
      by: { plant: 0.6, local: 0.3, organic: 0.4 },
      instead: { beef: 3.3, imported: 1.8, fastfood: 1.2 }
    },
    waste: {
      by: { composting: 0, recycling: 0.1, ewaste: 0 },
      instead: { landfill: 2.0, burning: 2.5, plastic: 3.0 }
    },
    shopping: {
      by: { secondhand: 0.5, reusable: 0, refill: 0.1 },
      instead: { fastfashion: 8.0, plasticbag: 0.15, container: 0.4 }
    }
  };

  // Calculate savings dynamically
  const calculateCurrentSavings = () => {
    let factorBy = 0;
    let factorInstead = 0;
    let qty = 0;

    switch (activeCategory) {
      case 'travel':
        factorBy = emissionFactors.travel.by[travelBy];
        factorInstead = emissionFactors.travel.instead[travelInsteadOf];
        qty = travelDistance;
        break;
      case 'energy':
        factorBy = emissionFactors.energy.by[energyBy];
        factorInstead = emissionFactors.energy.instead[energyInsteadOf];
        qty = energyHours;
        break;
      case 'food':
        factorBy = emissionFactors.food.by[foodBy];
        factorInstead = emissionFactors.food.instead[foodInsteadOf];
        qty = foodPortions;
        break;
      case 'waste':
        factorBy = emissionFactors.waste.by[wasteBy];
        factorInstead = emissionFactors.waste.instead[wasteInsteadOf];
        qty = wasteWeight;
        break;
      case 'shopping':
        factorBy = emissionFactors.shopping.by[shoppingBy];
        factorInstead = emissionFactors.shopping.instead[shoppingInsteadOf];
        qty = shoppingItems;
        break;
      default:
        break;
    }

    const diff = factorInstead - factorBy;
    return Math.max(0, parseFloat((diff * qty).toFixed(2)));
  };

  const currentSavings = calculateCurrentSavings();
  const currentCoolPoints = Math.round(currentSavings * 10);

  const handleLogActionSubmit = () => {
    if (currentSavings <= 0) return;

    let desc = '';
    switch (activeCategory) {
      case 'travel':
        desc = `Travelled by ${travelBy} instead of ${travelInsteadOf} for ${travelDistance} km`;
        break;
      case 'energy':
        desc = `Used ${energyBy} instead of ${energyInsteadOf} for ${energyHours} hours`;
        break;
      case 'food':
        desc = `Ate ${foodBy}-based meal instead of ${foodInsteadOf} (${foodPortions} portions)`;
        break;
      case 'waste':
        desc = `Managed waste via ${wasteBy} instead of ${wasteInsteadOf} (${wasteWeight} kg)`;
        break;
      case 'shopping':
        desc = `Bought ${shoppingBy} instead of ${shoppingInsteadOf} (${shoppingItems} items)`;
        break;
      default:
        desc = `Saved carbon emission in ${activeCategory}`;
    }

    onLogAction({
      category: activeCategory,
      savings: currentSavings,
      points: currentCoolPoints,
      description: desc
    });

    setLastSavedAmount(currentSavings);
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 4000);
  };

  // Semicircular gauge calculations
  // Path for a beautiful curved semi-circle
  // SVG size is 200x120, center is 100, 100, radius is 80.
  // Semicircle arc length = pi * R = 3.14159 * 80 = 251.3
  const arcRadius = 80;
  const strokeDash = 251.3;
  const strokeOffset = strokeDash - (progressPercent / 100) * strokeDash;

  return (
    <div className="space-y-6">
      
      {/* 1. The Target Tracker Card (Hero Section) */}
      <div className="relative overflow-hidden bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-neon-emerald transition-all duration-300">
        
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Tracker Left Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between md:justify-start gap-4">
              <h2 className="text-xl font-semibold text-white tracking-wide">
                {currentScopeStats.label}
              </h2>
              {/* Target Tracker Scope Toggle */}
              <div className="relative flex bg-gray-950 p-1 rounded-xl border border-gray-800 self-start">
                <button
                  onClick={() => setActiveScope('personal')}
                  className={`relative z-10 px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activeScope === 'personal' ? 'text-gray-950 bg-emerald-400 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveScope('sagecorp')}
                  className={`relative z-10 px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activeScope === 'sagecorp' ? 'text-gray-950 bg-emerald-400 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sage Corp
                </button>
                <button
                  onClick={() => setActiveScope('global')}
                  className={`relative z-10 px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activeScope === 'global' ? 'text-gray-950 bg-emerald-400 font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Global
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Target</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {currentScopeStats.saved.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                </span>
                <span className="text-emerald-400 font-semibold text-lg">kg CO2eq</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400 text-lg">
                  {currentScopeStats.goal.toLocaleString()} kg
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex items-center gap-3">
              <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-emerald-300 text-sm font-medium">
                {currentScopeStats.treesSnippet}
              </p>
            </div>
          </div>

          {/* Semicircular Progress Bar */}
          <div className="flex flex-col items-center justify-center shrink-0 self-center">
            <div className="relative w-48 h-28">
              <svg className="w-full h-full" viewBox="0 0 200 120">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Foreground filled arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={strokeDash}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {progressPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 2. "Log Action" Interactive Widget (Col span 7) */}
        <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between hover:border-gray-700/80 transition-all duration-300 relative">
          
          {showLogSuccess && (
            <div className="absolute inset-x-6 top-6 bg-emerald-500 text-gray-950 p-4 rounded-2xl flex items-center justify-between shadow-lg z-20 animate-bounce">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-bold">Action Logged Successfully!</p>
                  <p className="text-xs font-medium opacity-90">Saved {lastSavedAmount} kg CO2eq and earned +{Math.round(lastSavedAmount * 10)} Cool Points.</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Log Sustainability Action</h3>
                <p className="text-xs text-gray-400">Log daily actions to decrease emissions and build points.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Current Savings</div>
                <div className="text-lg font-extrabold text-emerald-400 flex items-center gap-1 justify-end">
                  <span>{currentSavings} kg CO2</span>
                </div>
              </div>
            </div>

            {/* Category Button Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[
                { id: 'travel', label: 'Travel', icon: Bus },
                { id: 'energy', label: 'Energy', icon: Zap },
                { id: 'food', label: 'Food', icon: Utensils },
                { id: 'waste', label: 'Waste', icon: Trash2 },
                { id: 'shopping', label: 'Shopping', icon: ShoppingBag }
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-neon-emerald' 
                        : 'bg-gray-950/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-semibold tracking-wider uppercase">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Category Comparison Engine Form */}
            <div className="bg-gray-950/60 border border-gray-800/80 rounded-2xl p-5 space-y-5">
              
              {/* TRAVEL FORM */}
              {activeCategory === 'travel' && (
                <div className="space-y-4">
                  {/* I Travelled By */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I travelled by:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bicycle', label: 'Bicycle', icon: Bike },
                        { id: 'bus', label: 'Bus', icon: Bus },
                        { id: 'train', label: 'Train/Metro', icon: Train }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setTravelBy(item.id)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            travelBy === item.id 
                              ? 'bg-emerald-500 text-gray-950 border-emerald-500' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance (km) */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Distance:</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setTravelDistance(d => Math.max(1, d - 1))}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">
                        {travelDistance} <span className="text-gray-400 font-medium text-xs">km</span>
                      </div>
                      <button 
                        onClick={() => setTravelDistance(d => d + 1)}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Range slider for fluid input */}
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={travelDistance}
                      onChange={(e) => setTravelDistance(parseInt(e.target.value))}
                      className="w-full accent-emerald-400 bg-gray-900 rounded-lg appearance-none h-1 cursor-pointer mt-4" 
                    />
                  </div>

                  {/* Instead Of */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'car', label: 'Car', icon: Car },
                        { id: 'flight', label: 'Flight', icon: Plane },
                        { id: 'rickshaw', label: 'Rickshaw', icon: Bus }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setTravelInsteadOf(item.id)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            travelInsteadOf === item.id 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ENERGY FORM */}
              {activeCategory === 'energy' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I used:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'solar', label: 'Solar Power' },
                        { id: 'led', label: 'LED Bulbs' },
                        { id: 'fan', label: 'Ceiling Fan' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setEnergyBy(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            energyBy === item.id 
                              ? 'bg-emerald-500 text-gray-950 border-emerald-500' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Duration:</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEnergyHours(h => Math.max(1, h - 1))}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">
                        {energyHours} <span className="text-gray-400 font-medium text-xs">hours</span>
                      </div>
                      <button 
                        onClick={() => setEnergyHours(h => h + 1)}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="24" 
                      value={energyHours}
                      onChange={(e) => setEnergyHours(parseInt(e.target.value))}
                      className="w-full accent-emerald-400 bg-gray-900 rounded-lg appearance-none h-1 cursor-pointer mt-4" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'grid', label: 'Grid Power' },
                        { id: 'incandescent', label: 'Incandescent' },
                        { id: 'ac', label: 'Air Conditioner' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setEnergyInsteadOf(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            energyInsteadOf === item.id 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FOOD FORM */}
              {activeCategory === 'food' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I ate:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'plant', label: 'Plant-Based' },
                        { id: 'local', label: 'Local Produce' },
                        { id: 'organic', label: 'Organic Food' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFoodBy(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            foodBy === item.id 
                              ? 'bg-emerald-500 text-gray-950 border-emerald-500' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Quantity:</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setFoodPortions(p => Math.max(1, p - 1))}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">
                        {foodPortions} <span className="text-gray-400 font-medium text-xs">portions</span>
                      </div>
                      <button 
                        onClick={() => setFoodPortions(p => p + 1)}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'beef', label: 'Beef / Red Meat' },
                        { id: 'imported', label: 'Imported Meal' },
                        { id: 'fastfood', label: 'Fast Food' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setFoodInsteadOf(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            foodInsteadOf === item.id 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WASTE FORM */}
              {activeCategory === 'waste' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I did:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'composting', label: 'Composting' },
                        { id: 'recycling', label: 'Recycling' },
                        { id: 'ewaste', label: 'E-Waste Pick' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setWasteBy(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            wasteBy === item.id 
                              ? 'bg-emerald-500 text-gray-950 border-emerald-500' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Weight:</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setWasteWeight(w => Math.max(1, w - 1))}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">
                        {wasteWeight} <span className="text-gray-400 font-medium text-xs">kg</span>
                      </div>
                      <button 
                        onClick={() => setWasteWeight(w => w + 1)}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'landfill', label: 'Landfill / Trash' },
                        { id: 'burning', label: 'Open Burning' },
                        { id: 'plastic', label: 'Plastic Dump' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setWasteInsteadOf(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            wasteInsteadOf === item.id 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SHOPPING FORM */}
              {activeCategory === 'shopping' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I bought:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'secondhand', label: 'Second-hand' },
                        { id: 'reusable', label: 'Reusable Bag' },
                        { id: 'refill', label: 'Refill Pack' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setShoppingBy(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            shoppingBy === item.id 
                              ? 'bg-emerald-500 text-gray-950 border-emerald-500' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Quantity:</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShoppingItems(i => Math.max(1, i - 1))}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">
                        {shoppingItems} <span className="text-gray-400 font-medium text-xs">items</span>
                      </div>
                      <button 
                        onClick={() => setShoppingItems(i => i + 1)}
                        className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'fastfashion', label: 'Fast Fashion' },
                        { id: 'plasticbag', label: 'Plastic Bag' },
                        { id: 'container', label: 'New Plastic' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setShoppingInsteadOf(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            shoppingInsteadOf === item.id 
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl py-3 px-4 flex-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Calculated Savings</p>
                <p className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black">{currentSavings}</span>
                  <span className="text-gray-400 font-semibold text-xs">kg CO2eq</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Cool Points</p>
                <p className="text-lg font-bold text-yellow-400 flex items-center gap-1 justify-end">
                  <Coins className="w-4 h-4" />
                  <span>+{currentCoolPoints}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogActionSubmit}
              disabled={currentSavings <= 0}
              className={`px-6 py-4 rounded-2xl text-sm font-bold tracking-wide uppercase transition-all duration-300 shrink-0 select-none ${
                currentSavings > 0 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold cursor-pointer shadow-neon-emerald shadow-emerald-500/30 active:scale-95' 
                  : 'bg-gray-800 text-gray-600 border border-gray-700/50 cursor-not-allowed'
              }`}
            >
              Log Action
            </button>
          </div>
        </div>

        {/* 3. Analytics & Breakdown Card (Col span 5) */}
        <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between hover:border-gray-700/80 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">My Savings</h3>
                <p className="text-xs text-gray-400">Carbon savings breakdown by categories.</p>
              </div>
              {/* Metric Selector Toggle */}
              <div className="flex bg-gray-950 p-0.5 rounded-xl border border-gray-800">
                <button
                  onClick={() => setAnalyticsMetric('points')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all duration-150 ${
                    analyticsMetric === 'points' ? 'bg-gray-850 text-emerald-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Points
                </button>
                <button
                  onClick={() => setAnalyticsMetric('emissions')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all duration-150 ${
                    analyticsMetric === 'emissions' ? 'bg-gray-850 text-emerald-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  CO2
                </button>
              </div>
            </div>

            {/* List of Categories with Horizontal Progress Bars */}
            <div className="space-y-4">
              {[
                { 
                  name: 'Travel', 
                  savings: userStats.categoryBreakdown.travel, 
                  color: 'bg-emerald-500', 
                  textColor: 'text-emerald-400',
                  icon: Bus 
                },
                { 
                  name: 'Energy', 
                  savings: userStats.categoryBreakdown.energy, 
                  color: 'bg-amber-500', 
                  textColor: 'text-amber-400',
                  icon: Zap 
                },
                { 
                  name: 'Food', 
                  savings: userStats.categoryBreakdown.food, 
                  color: 'bg-rose-500', 
                  textColor: 'text-rose-400',
                  icon: Utensils 
                },
                { 
                  name: 'Waste', 
                  savings: userStats.categoryBreakdown.waste, 
                  color: 'bg-purple-500', 
                  textColor: 'text-purple-400',
                  icon: Trash2 
                },
                { 
                  name: 'Shopping', 
                  savings: userStats.categoryBreakdown.shopping, 
                  color: 'bg-blue-500', 
                  textColor: 'text-blue-400',
                  icon: ShoppingBag 
                }
              ].map((category) => {
                const totalSavings = Object.values(userStats.categoryBreakdown).reduce((a, b) => a + b, 0) || 1;
                const percentage = ((category.savings / totalSavings) * 100).toFixed(0);
                const displayVal = analyticsMetric === 'points' 
                  ? `${Math.round(category.savings * 10)} pts` 
                  : `${category.savings.toFixed(1)} kg`;

                const CatIcon = category.icon;

                return (
                  <div key={category.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CatIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>{category.name}</span>
                        <span className="text-[10px] text-gray-500 font-normal">({percentage}%)</span>
                      </div>
                      <span className={`${category.textColor} font-bold`}>{displayVal}</span>
                    </div>
                    {/* Outer Progress Tracker */}
                    <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800/60">
                      <div 
                        className={`h-full ${category.color} rounded-full transition-all duration-750`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings mini-graph */}
          <div className="mt-6 pt-5 border-t border-gray-850">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly trend</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>+12.4% this week</span>
              </span>
            </div>
            {/* Minimal visual sparkline */}
            <div className="h-16 w-full opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userStats.weeklyTrend}>
                  <defs>
                    <linearGradient id="miniGraphGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af', fontSize: '10px' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#miniGraphGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 4. Community & Leaderboard Card (Col span 12 or fit inside side panels) */}
        <div className="lg:col-span-12 bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-gray-700/80 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Community Leaderboard</h3>
              <p className="text-xs text-gray-400">See how you rank against top climate champions.</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-gray-950 border border-gray-800 rounded-2xl py-1 px-3">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-gray-300 font-medium">10,241 active users</span>
            </div>
          </div>

          {/* Top 3 Podium Layout */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-xl mx-auto mb-8 items-end">
            
            {/* 2nd Place Podium */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gray-400 overflow-hidden bg-gray-800">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gray-400 text-gray-950 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
              </div>
              <p className="text-xs font-bold text-white text-center truncate w-24">Sarah Jenkins</p>
              <p className="text-[10px] text-gray-400 mb-2 font-medium">34.2 kg saved</p>
              <div className="w-full bg-gray-950/80 border-t border-x border-gray-800 h-20 rounded-t-2xl flex items-center justify-center">
                <span className="text-xl font-extrabold text-gray-400">2nd</span>
              </div>
            </div>

            {/* 1st Place Podium (Slightly taller) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                  <Award className="w-6 h-6 fill-yellow-400/20" />
                </div>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-yellow-400 overflow-hidden bg-gray-800 p-0.5">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="David Miller" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-950 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">1</div>
              </div>
              <p className="text-xs font-extrabold text-white text-center truncate w-24">David Miller</p>
              <p className="text-[10px] text-yellow-400 mb-2 font-semibold">38.5 kg saved</p>
              <div className="w-full bg-emerald-500/10 border-t-2 border-x border-emerald-500/30 h-28 rounded-t-2xl flex items-center justify-center">
                <span className="text-2xl font-black text-emerald-400">1st</span>
              </div>
            </div>

            {/* 3rd Place Podium */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-amber-600 overflow-hidden bg-gray-800">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Emily Chen" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
              </div>
              <p className="text-xs font-bold text-white text-center truncate w-24">Emily Chen</p>
              <p className="text-[10px] text-gray-400 mb-2 font-medium">31.8 kg saved</p>
              <div className="w-full bg-gray-950/80 border-t border-x border-gray-800 h-16 rounded-t-2xl flex items-center justify-center">
                <span className="text-lg font-extrabold text-amber-600">3rd</span>
              </div>
            </div>

          </div>

          {/* Runners-up List */}
          <div className="space-y-2 max-w-2xl mx-auto">
            {[
              { rank: 4, name: 'You (Current User)', savings: userStats.savedPersonal, isUser: true, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
              { rank: 5, name: 'Alex Rivera', savings: 26.4, isUser: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
              { rank: 6, name: 'Jessica Taylor', savings: 24.1, isUser: false, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' }
            ].map((runner) => (
              <div 
                key={runner.rank} 
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  runner.isUser 
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-neon-emerald' 
                    : 'bg-gray-950/50 border-gray-800/80 hover:border-gray-800 hover:bg-gray-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 text-center text-xs font-bold ${runner.isUser ? 'text-emerald-400' : 'text-gray-400'}`}>
                    #{runner.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                    <img src={runner.avatar} alt={runner.name} className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-sm font-semibold ${runner.isUser ? 'text-white font-extrabold' : 'text-gray-200'}`}>
                    {runner.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${runner.isUser ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {runner.savings.toFixed(2)} kg
                  </span>
                  <span className="text-[10px] text-gray-500">CO2eq</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
