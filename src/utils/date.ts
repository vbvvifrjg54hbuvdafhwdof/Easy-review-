import { AppState, ColorPalette, PeriodTimes } from '../types';

export const UNIT_PALETTE: ColorPalette[] = [
  { border: "#6495ED", bg: "#EAF0FE", text: "#3D5FBF" },
  { border: "#F7ADC3", bg: "#FDEBF1", text: "#C15C7C" },
  { border: "#8FD19E", bg: "#EAFBEF", text: "#3F8B54" },
  { border: "#B8A6F0", bg: "#F1ECFF", text: "#6C4FCB" },
  { border: "#FFC078", bg: "#FFF3E4", text: "#C9781B" },
  { border: "#7FD1EE", bg: "#E9F8FD", text: "#1D87A6" }
];

export const DEFAULT_PERIOD_TIMES: PeriodTimes = {
  "1限": { start: "08:50", end: "09:40" },
  "2限": { start: "09:50", end: "10:40" },
  "3限": { start: "10:50", end: "11:40" },
  "4限": { start: "11:50", end: "12:40" },
  "5限": { start: "13:25", end: "14:15" },
  "6限": { start: "14:25", end: "15:15" },
  "7限": { start: "15:25", end: "16:15" },
  "8限": { start: "16:25", end: "17:15" },
  "9限": { start: "17:25", end: "18:15" },
  "10限": { start: "18:25", end: "19:15" }
};

export const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

export function getPeriods(periodCount: number = 6): string[] {
  const n = Math.max(1, Math.min(10, periodCount || 6));
  const arr: string[] = [];
  for (let i = 1; i <= n; i++) {
    arr.push(`${i}限`);
  }
  return arr;
}

export function toISO(d: Date | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + Number(days));
  return toISO(d);
}

export function getEffectiveNow(cutoffHour: number = 0): Date {
  let now = new Date();
  if (cutoffHour > 0 && now.getHours() < cutoffHour) {
    now = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  return now;
}

export function getToday(cutoffHour: number = 0): string {
  return toISO(getEffectiveNow(cutoffHour));
}

export function formatJP(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日(${w})`;
}

export function uid(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function nowHM(): string {
  const n = new Date();
  return `${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
}

export function effectiveHM(cutoffHour: number = 0): string {
  const now = new Date();
  if (cutoffHour > 0 && now.getHours() < cutoffHour) {
    return "24:00";
  }
  return nowHM();
}

export function todayWeekdayJP(cutoffHour: number = 0): string {
  return WEEKDAYS[(getEffectiveNow(cutoffHour).getDay() + 6) % 7];
}

export function isHoliday(iso: string, state: AppState): boolean {
  if (state.holidays && state.holidays.includes(iso)) return true;
  if (state.holidayRanges) {
    for (const r of state.holidayRanges) {
      if (iso >= r.start && iso <= r.end) return true;
    }
  }
  return false;
}
