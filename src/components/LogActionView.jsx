import { useState } from 'react';
import { 
  Bus, Zap, Utensils, Trash2, ShoppingBag, Coins,
  History, Search, Trash, Calendar
} from 'lucide-react';

export default function LogActionView({ 
  userStats, 
  onLogAction, 
  onDeleteLog,
  recentLogs 
}) {
  const [activeCategory, setActiveCategory] = useState('travel');
  const [searchQuery, setSearchQuery] = useState('');

  // Local widget inputs
  const [travelBy, setTravelBy] = useState('bicycle');
  const [travelDistance, setTravelDistance] = useState(10);
  const [travelInsteadOf, setTravelInsteadOf] = useState('car');

  const [energyBy, setEnergyBy] = useState('led');
  const [energyHours, setEnergyHours] = useState(8);
  const [energyInsteadOf, setEnergyInsteadOf] = useState('incandescent');

  const [foodBy, setFoodBy] = useState('plant');
  const [foodPortions, setFoodPortions] = useState(2);
  const [foodInsteadOf, setFoodInsteadOf] = useState('beef');

  const [wasteBy, setWasteBy] = useState('recycling');
  const [wasteWeight, setWasteWeight] = useState(5);
  const [wasteInsteadOf, setWasteInsteadOf] = useState('landfill');

  const [shoppingBy, setShoppingBy] = useState('reusable');
  const [shoppingItems, setShoppingItems] = useState(3);
  const [shoppingInsteadOf, setShoppingInsteadOf] = useState('plasticbag');

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

    let desc;
    switch (activeCategory) {
      case 'travel':
        desc = `Commuted via ${travelBy} (saving car emissions) for ${travelDistance} km`;
        break;
      case 'energy':
        desc = `Used ${energyBy} instead of ${energyInsteadOf} for ${energyHours} hours`;
        break;
      case 'food':
        desc = `Chose ${foodBy}-based meals instead of ${foodInsteadOf} (${foodPortions} serving)`;
        break;
      case 'waste':
        desc = `Managed ${wasteWeight} kg waste via ${wasteBy} instead of ${wasteInsteadOf}`;
        break;
      case 'shopping':
        desc = `Eco shopping: ${shoppingItems}x ${shoppingBy} items instead of ${shoppingInsteadOf}`;
        break;
      default:
        desc = `Log carbon emission saved in ${activeCategory}`;
    }

    onLogAction({
      category: activeCategory,
      savings: currentSavings,
      points: currentCoolPoints,
      description: desc
    });
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'travel': return Bus;
      case 'energy': return Zap;
      case 'food': return Utensils;
      case 'waste': return Trash2;
      case 'shopping': return ShoppingBag;
      default: return History;
    }
  };

  const filteredLogs = recentLogs.filter(log => 
    log.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight my-0">Log Sustainable Action</h1>
          <p className="text-sm text-gray-400">Calculate and record emissions saved from daily habit changes.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl py-2 px-4 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Personal Savings</span>
            <p className="text-xl font-bold text-emerald-400">{userStats.savedPersonal.toFixed(2)} kg</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl py-2 px-4 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Points</span>
            <p className="text-xl font-bold text-yellow-400 flex items-center gap-1">
              <Coins className="w-4 h-4" aria-hidden="true" />
              {userStats.coolPoints}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Dashboard */}
        <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between hover:border-gray-750 transition-all duration-300">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide mb-4">Emissions Savings Calculator</h3>
            
            {/* Horizontal selector grid */}
            <div className="grid grid-cols-5 gap-2 mb-6" role="tablist" aria-label="Select category to log">
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
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${
                      isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-neon-emerald' 
                        : 'bg-gray-950/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" aria-hidden="true" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Inputs per Category */}
            <div 
              role="tabpanel" 
              id={`tabpanel-${activeCategory}`} 
              aria-label={`${activeCategory} calculator`}
              className="bg-gray-950 border border-gray-850 rounded-2xl p-5 space-y-5"
            >
              {activeCategory === 'travel' && (
                <div className="space-y-4">
                  <div>
                    <span id="travel-by-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I travelled by:</span>
                    <div role="group" aria-labelledby="travel-by-label" className="grid grid-cols-3 gap-2">
                      {['bicycle', 'bus', 'train'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setTravelBy(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            travelBy === mode ? 'bg-emerald-500 text-gray-950 border-emerald-500 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span id="travel-distance-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Distance:</span>
                    <div role="group" aria-labelledby="travel-distance-label" className="flex items-center gap-3">
                      <button onClick={() => setTravelDistance(d => Math.max(1, d - 1))} aria-label="Decrease travel distance" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">-</button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">{travelDistance} km</div>
                      <button onClick={() => setTravelDistance(d => d + 1)} aria-label="Increase travel distance" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div>
                    <span id="travel-instead-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</span>
                    <div role="group" aria-labelledby="travel-instead-label" className="grid grid-cols-3 gap-2">
                      {['car', 'flight', 'rickshaw'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setTravelInsteadOf(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            travelInsteadOf === mode ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'energy' && (
                <div className="space-y-4">
                  <div>
                    <span id="energy-by-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I used:</span>
                    <div role="group" aria-labelledby="energy-by-label" className="grid grid-cols-3 gap-2">
                      {['solar', 'led', 'fan'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setEnergyBy(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            energyBy === mode ? 'bg-emerald-500 text-gray-950 border-emerald-500 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span id="energy-hours-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Hours:</span>
                    <div role="group" aria-labelledby="energy-hours-label" className="flex items-center gap-3">
                      <button onClick={() => setEnergyHours(h => Math.max(1, h - 1))} aria-label="Decrease energy hours" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">-</button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">{energyHours} hours</div>
                      <button onClick={() => setEnergyHours(h => h + 1)} aria-label="Increase energy hours" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div>
                    <span id="energy-instead-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</span>
                    <div role="group" aria-labelledby="energy-instead-label" className="grid grid-cols-3 gap-2">
                      {['grid', 'incandescent', 'ac'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setEnergyInsteadOf(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            energyInsteadOf === mode ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'food' && (
                <div className="space-y-4">
                  <div>
                    <span id="food-by-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I ate:</span>
                    <div role="group" aria-labelledby="food-by-label" className="grid grid-cols-3 gap-2">
                      {['plant', 'local', 'organic'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFoodBy(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            foodBy === mode ? 'bg-emerald-500 text-gray-950 border-emerald-500 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span id="food-portions-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Portions:</span>
                    <div role="group" aria-labelledby="food-portions-label" className="flex items-center gap-3">
                      <button onClick={() => setFoodPortions(p => Math.max(1, p - 1))} aria-label="Decrease food portions" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">-</button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">{foodPortions} portions</div>
                      <button onClick={() => setFoodPortions(p => p + 1)} aria-label="Increase food portions" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div>
                    <span id="food-instead-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</span>
                    <div role="group" aria-labelledby="food-instead-label" className="grid grid-cols-3 gap-2">
                      {['beef', 'imported', 'fastfood'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFoodInsteadOf(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            foodInsteadOf === mode ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'waste' && (
                <div className="space-y-4">
                  <div>
                    <span id="waste-by-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I did:</span>
                    <div role="group" aria-labelledby="waste-by-label" className="grid grid-cols-3 gap-2">
                      {['composting', 'recycling', 'ewaste'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setWasteBy(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            wasteBy === mode ? 'bg-emerald-500 text-gray-950 border-emerald-500 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span id="waste-weight-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Weight:</span>
                    <div role="group" aria-labelledby="waste-weight-label" className="flex items-center gap-3">
                      <button onClick={() => setWasteWeight(w => Math.max(1, w - 1))} aria-label="Decrease waste weight" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">-</button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">{wasteWeight} kg</div>
                      <button onClick={() => setWasteWeight(w => w + 1)} aria-label="Increase waste weight" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div>
                    <span id="waste-instead-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</span>
                    <div role="group" aria-labelledby="waste-instead-label" className="grid grid-cols-3 gap-2">
                      {['landfill', 'burning', 'plastic'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setWasteInsteadOf(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            wasteInsteadOf === mode ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'shopping' && (
                <div className="space-y-4">
                  <div>
                    <span id="shopping-by-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">I bought:</span>
                    <div role="group" aria-labelledby="shopping-by-label" className="grid grid-cols-3 gap-2">
                      {['secondhand', 'reusable', 'refill'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setShoppingBy(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            shoppingBy === mode ? 'bg-emerald-500 text-gray-950 border-emerald-500 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span id="shopping-items-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Quantity:</span>
                    <div role="group" aria-labelledby="shopping-items-label" className="flex items-center gap-3">
                      <button onClick={() => setShoppingItems(i => Math.max(1, i - 1))} aria-label="Decrease shopping items quantity" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">-</button>
                      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl py-2 px-4 text-center font-bold text-white">{shoppingItems} items</div>
                      <button onClick={() => setShoppingItems(i => i + 1)} aria-label="Increase shopping items quantity" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div>
                    <span id="shopping-instead-label" className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Instead of:</span>
                    <div role="group" aria-labelledby="shopping-instead-label" className="grid grid-cols-3 gap-2">
                      {['fastfashion', 'plasticbag', 'container'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setShoppingInsteadOf(mode)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition ${
                            shoppingInsteadOf === mode ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="bg-gray-950 border border-gray-850 rounded-2xl py-3 px-4 flex-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Savings</p>
                <p className="text-lg font-bold text-white">{currentSavings} <span className="text-gray-400 font-medium text-xs">kg CO2eq</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Points</p>
                <p className="text-lg font-bold text-yellow-400 flex items-center gap-1 justify-end">
                  <Coins className="w-4 h-4" aria-hidden="true" />
                  <span>+{currentCoolPoints}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogActionSubmit}
              disabled={currentSavings <= 0}
              aria-label={`Log ${activeCategory} action: save ${currentSavings} kg CO2eq`}
              className={`px-8 py-4 rounded-2xl text-sm font-bold tracking-wide uppercase transition-all duration-300 shrink-0 select-none ${
                currentSavings > 0 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black cursor-pointer shadow-neon-emerald active:scale-95' 
                  : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
              }`}
            >
              Log Action
            </button>
          </div>
        </div>

        {/* Right: History Log List */}
        <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between hover:border-gray-750 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                Action History
              </h3>
              <span className="text-xs text-gray-400 font-semibold">{recentLogs.length} logged actions</span>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="history-search" className="sr-only">Search logged actions</label>
              <input
                id="history-search"
                type="text"
                placeholder="Search logged habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 placeholder-gray-500"
              />
            </div>

            {/* List of logged actions */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-gray-950/40 border border-gray-800/80 rounded-2xl">
                  <History className="w-8 h-8 text-gray-600 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm font-semibold text-gray-400">No actions found</p>
                  <p className="text-xs text-gray-500 mt-1">Start by logging a carbon saving option on the left.</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const LogIcon = getCategoryIcon(log.category);
                  return (
                    <div 
                      key={log.id} 
                      className="group flex items-center justify-between p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/60 hover:border-gray-700/80 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                          <LogIcon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-200 line-clamp-1">{log.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                            <span className="capitalize text-emerald-400 font-bold">{log.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
                              {log.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-white">-{log.savings.toFixed(2)} kg</p>
                          <p className="text-[10px] text-yellow-400 font-semibold">+{log.points} pts</p>
                        </div>
                        {onDeleteLog && (
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 hover:bg-rose-950/50 hover:border-rose-900/40 text-gray-500 hover:text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                            aria-label={`Remove log: ${log.description}`}
                          >
                            <Trash className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-850 text-center text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            All logged actions represent verified carbon reductions
          </div>
        </div>
      </div>
    </div>
  );
}
