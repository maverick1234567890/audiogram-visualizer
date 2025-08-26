import { Thresholds } from '@/hooks/use-audiogram-state';

export const frequencies = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000];

// Chart dimensions
export const CHART_CONFIG = {
  width: 700,
  height: 600,
  marginLeft: 80,
  marginRight: 30,
  marginTop: 40,
  marginBottom: 80,
  plotWidth: 590,
  plotHeight: 480,
  gridSize: 40,
};

// Scale functions
export function getXPosition(frequency: number): number {
  const index = frequencies.indexOf(frequency);
  if (index === -1) return CHART_CONFIG.marginLeft;
  
  const step = CHART_CONFIG.plotWidth / (frequencies.length - 1);
  return CHART_CONFIG.marginLeft + index * step;
}

export function getYPosition(dbValue: number): number {
  // dB range is -10 to 120 (13 steps of 10)
  const minDb = -10;
  const maxDb = 120;
  const range = maxDb - minDb;
  const normalized = (dbValue - minDb) / range;
  return CHART_CONFIG.marginTop + normalized * CHART_CONFIG.plotHeight;
}

export function getDbFromY(yPosition: number): number {
  const relativeY = yPosition - CHART_CONFIG.marginTop;
  const normalized = relativeY / CHART_CONFIG.plotHeight;
  return -10 + normalized * 130; // -10 to 120 dB range
}

export function getFrequencyFromX(xPosition: number): number {
  const relativeX = xPosition - CHART_CONFIG.marginLeft;
  const step = CHART_CONFIG.plotWidth / (frequencies.length - 1);
  const index = Math.round(relativeX / step);
  return frequencies[Math.max(0, Math.min(frequencies.length - 1, index))] || frequencies[0];
}

export function generatePathString(thresholds: Thresholds): string {
  const points = frequencies.map(freq => {
    const x = getXPosition(freq);
    const y = getYPosition(thresholds[freq] || 0);
    return `${x},${y}`;
  });
  return points.join(' ');
}

export function snapToGrid(value: number, increment: number = 5): number {
  return Math.round(value / increment) * increment;
}

export function clampDbValue(value: number): number {
  return Math.max(-10, Math.min(120, value));
}

// Generate Y-axis ticks
export function getYAxisTicks(): Array<{ value: number; position: number }> {
  const ticks = [];
  for (let db = -10; db <= 120; db += 10) {
    ticks.push({
      value: db,
      position: getYPosition(db),
    });
  }
  return ticks;
}

// Generate X-axis ticks
export function getXAxisTicks(): Array<{ value: number; position: number; label: string }> {
  return frequencies.map(freq => ({
    value: freq,
    position: getXPosition(freq),
    label: freq === 750 ? '750' : freq >= 1000 ? `${freq / 1000}k` : freq.toString(),
  }));
}
