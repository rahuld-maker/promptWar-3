import { describe, it, expect } from 'vitest';

// Replicating the core calculation engine from LogActionView.jsx
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

function calculateSavings(category, by, insteadOf, qty) {
  const catFactors = emissionFactors[category];
  if (!catFactors) return 0;
  const factorBy = catFactors.by[by] ?? 0;
  const factorInstead = catFactors.instead[insteadOf] ?? 0;
  const diff = factorInstead - factorBy;
  return Math.max(0, parseFloat((diff * qty).toFixed(2)));
}

describe('Carbon Footprint Savings Calculations', () => {
  describe('Travel Category', () => {
    it('should calculate bicycle instead of car correctly', () => {
      // bicycle = 0, car = 0.18, qty = 10 km
      // expected: (0.18 - 0) * 10 = 1.8
      expect(calculateSavings('travel', 'bicycle', 'car', 10)).toBe(1.8);
    });

    it('should calculate bus instead of flight correctly', () => {
      // bus = 0.03, flight = 0.25, qty = 100 km
      // expected: (0.25 - 0.03) * 100 = 22.0
      expect(calculateSavings('travel', 'bus', 'flight', 100)).toBe(22);
    });

    it('should not allow negative savings', () => {
      // If we travel by bus (0.03) instead of walking (assumed 0, default to 0)
      // expected savings should be 0, not negative
      expect(calculateSavings('travel', 'bus', 'nonexistent', 50)).toBe(0);
    });
  });

  describe('Energy Category', () => {
    it('should calculate solar instead of grid energy savings', () => {
      // solar = 0, grid = 0.5, qty = 24 hours
      // expected: (0.5 - 0) * 24 = 12.0
      expect(calculateSavings('energy', 'solar', 'grid', 24)).toBe(12.0);
    });

    it('should calculate led instead of incandescent savings', () => {
      // led = 0.005, incandescent = 0.06, qty = 10 hours
      // expected: (0.06 - 0.005) * 10 = 0.55
      expect(calculateSavings('energy', 'led', 'incandescent', 10)).toBe(0.55);
    });
  });

  describe('Food Category', () => {
    it('should calculate plant-based instead of beef savings', () => {
      // plant = 0.6, beef = 3.3, qty = 2 portions
      // expected: (3.3 - 0.6) * 2 = 5.4
      expect(calculateSavings('food', 'plant', 'beef', 2)).toBe(5.4);
    });
  });

  describe('Waste Category', () => {
    it('should calculate composting instead of landfill savings', () => {
      // composting = 0, landfill = 2.0, qty = 5 kg
      // expected: (2.0 - 0) * 5 = 10.0
      expect(calculateSavings('waste', 'composting', 'landfill', 5)).toBe(10.0);
    });
  });

  describe('Shopping Category', () => {
    it('should calculate reusable bag instead of plastic bag savings', () => {
      // reusable = 0, plasticbag = 0.15, qty = 4 items
      // expected: (0.15 - 0) * 4 = 0.6
      expect(calculateSavings('shopping', 'reusable', 'plasticbag', 4)).toBe(0.60);
    });

    it('should calculate secondhand clothes instead of fastfashion savings', () => {
      // secondhand = 0.5, fastfashion = 8.0, qty = 2 items
      // expected: (8.0 - 0.5) * 2 = 15.0
      expect(calculateSavings('shopping', 'secondhand', 'fastfashion', 2)).toBe(15.0);
    });
  });
});
