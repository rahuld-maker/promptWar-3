/**
 * Shared carbon-calculation constants used across dashboard and logging views.
 *
 * @constant {Object<string, Object>} EMISSION_FACTORS
 * @constant {Object<string, string>} CATEGORY_LABELS
 * @constant {Object<string, number>} DEFAULT_SCOPE_GOALS
 * @constant {number} TOAST_DURATION_MS
 */
export const EMISSION_FACTORS = {
  travel: {
    by: { bicycle: 0, bus: 0.03, train: 0.02 },
    instead: { car: 0.18, flight: 0.25, rickshaw: 0.12 },
  },
  energy: {
    by: { solar: 0, led: 0.005, fan: 0.04 },
    instead: { grid: 0.5, incandescent: 0.06, ac: 1.2 },
  },
  food: {
    by: { plant: 0.6, local: 0.3, organic: 0.4 },
    instead: { beef: 3.3, imported: 1.8, fastfood: 1.2 },
  },
  waste: {
    by: { composting: 0, recycling: 0.1, ewaste: 0 },
    instead: { landfill: 2.0, burning: 2.5, plastic: 3.0 },
  },
  shopping: {
    by: { secondhand: 0.5, reusable: 0, refill: 0.1 },
    instead: { fastfashion: 8.0, plasticbag: 0.15, container: 0.4 },
  },
};

export const CATEGORY_LABELS = {
  travel: 'Travel',
  energy: 'Energy',
  food: 'Food',
  waste: 'Waste',
  shopping: 'Shopping',
};

export const DEFAULT_SCOPE_GOALS = {
  personal: 40,
  sagecorp: 2000,
  global: 1200000,
};

export const TOAST_DURATION_MS = 4000;
