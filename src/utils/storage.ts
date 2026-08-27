import { AppState } from '../types';
import { DEFAULT_PERIOD_TIMES } from './date';

export const STORAGE_KEY = "easyReviewAppData_v3";

export function defaultState(): AppState {
  return {
    units: [],
    presets: [],
    someday: [],
    schedule: [],
    subjects: [],
    periodTimes: JSON.parse(JSON.stringify(DEFAULT_PERIOD_TIMES)),
    stockLog: [],
    periodCount: 6,
    holidays: [],
    holidayRanges: [],
    customColors: [],
    canceledClasses: [],
    settings: { dayCutoffHour: 0 }
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        units: Array.isArray(parsed.units) ? parsed.units : [],
        presets: Array.isArray(parsed.presets) ? parsed.presets : [],
        someday: Array.isArray(parsed.someday) ? parsed.someday : [],
        schedule: Array.isArray(parsed.schedule) ? parsed.schedule : [],
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
        periodTimes:
          parsed.periodTimes && Object.keys(parsed.periodTimes).length > 0
            ? parsed.periodTimes
            : JSON.parse(JSON.stringify(DEFAULT_PERIOD_TIMES)),
        periodCount: Math.max(1, Math.min(10, parsed.periodCount || 6)),
        holidays: Array.isArray(parsed.holidays) ? parsed.holidays : [],
        holidayRanges: Array.isArray(parsed.holidayRanges) ? parsed.holidayRanges : [],
        customColors: Array.isArray(parsed.customColors) ? parsed.customColors : [],
        canceledClasses: Array.isArray(parsed.canceledClasses) ? parsed.canceledClasses : [],
        settings:
          parsed.settings && typeof parsed.settings === "object"
            ? { dayCutoffHour: parsed.settings.dayCutoffHour || 0 }
            : { dayCutoffHour: 0 },
        stockLog: Array.isArray(parsed.stockLog) ? parsed.stockLog : []
      };
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
  }
  return defaultState();
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
    return false;
  }
}
