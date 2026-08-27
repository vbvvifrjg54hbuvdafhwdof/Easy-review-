export interface ColorPalette {
  border: string;
  bg: string;
  text: string;
}

export interface CustomColor extends ColorPalette {
  key: string;
  label: string;
}

export interface Unit {
  id: string;
  name: string;
  memo?: string;
  presetId?: string | null;
  presetName?: string | null;
  steps: number[];
  stepIndex: number;
  nextDate: string; // ISO format "YYYY-MM-DD"
  color: number;
  subject?: string;
  colorKey?: string | null;
}

export interface Preset {
  id: string;
  name: string;
  steps: number[];
}

export interface SomedayItem {
  id: string;
  name: string;
  presetId?: string | null;
  presetName?: string | null;
  steps?: number[] | null;
  color: number;
}

export interface ScheduleItem {
  id: string;
  day: string; // "月", "火", "水", "木", "金", "土", "日"
  period: string; // "1限", "2限", etc.
  subject: string;
  colorKey?: string | null;
}

export interface SubjectItem {
  name: string;
  colorKey?: string | null;
}

export interface PeriodTime {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export type PeriodTimes = Record<string, PeriodTime>;

export interface HolidayRange {
  id: string;
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
}

export interface CanceledClass {
  date: string; // "YYYY-MM-DD"
  scheduleId: string;
}

export interface StockLogItem {
  scheduleId: string;
  date: string; // "YYYY-MM-DD"
  status: "registered" | "discarded";
}

export interface Settings {
  dayCutoffHour: number; // 0..5
}

export interface AppState {
  units: Unit[];
  presets: Preset[];
  someday: SomedayItem[];
  schedule: ScheduleItem[];
  subjects: SubjectItem[];
  periodTimes: PeriodTimes;
  periodCount: number;
  holidays: string[];
  holidayRanges: HolidayRange[];
  customColors: CustomColor[];
  canceledClasses: CanceledClass[];
  settings: Settings;
  stockLog: StockLogItem[];
}

export interface PendingStockItem {
  scheduleId: string;
  subject: string;
  period: string;
  colorKey?: string | null;
  suggestedName: string;
}

export interface ConfirmModalData {
  type: "end" | "continue";
  unitId: string;
}

export interface DeleteConfirmData {
  kind: "unit" | "someday" | "schedule" | "preset" | "holidayRange" | "stock" | "color";
  id: string;
  label: string;
}

export interface MemoModalData {
  unitId: string;
  memo: string;
}

export interface ClassEditDraft {
  id: string | null;
  day: string;
  period: string;
  subject: string;
  colorKey: string | null;
}

export interface PresetDraft {
  id: string | null;
  name: string;
  steps: number[];
}

export type TabType = "review" | "new" | "someday" | "calendar";
export type SubTabType = "add" | "schedule";
