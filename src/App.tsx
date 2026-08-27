/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AppState,
  ClassEditDraft,
  ConfirmModalData,
  CustomColor,
  DeleteConfirmData,
  MemoModalData,
  PendingStockItem,
  PeriodTimes,
  Preset,
  PresetDraft,
  ScheduleItem,
  TabType
} from './types';
import {
  addDays,
  DEFAULT_PERIOD_TIMES,
  effectiveHM,
  getPeriods,
  getToday,
  isHoliday,
  todayWeekdayJP,
  uid
} from './utils/date';
import { createCustomColor } from './utils/color';
import { defaultState, loadState, saveState } from './utils/storage';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ReviewTab } from './components/ReviewTab';
import { NewTab } from './components/NewTab';
import { SomedayTab } from './components/SomedayTab';
import { CalendarTab } from './components/CalendarTab';
import { Toast } from './components/Toast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

import { SettingsModal } from './components/Modals/SettingsModal';
import { PresetModal } from './components/Modals/PresetModal';
import { ClassEditModal } from './components/Modals/ClassEditModal';
import { DayDetailModal } from './components/Modals/DayDetailModal';
import { MemoEditModal } from './components/Modals/MemoEditModal';
import { ConfirmDialogs } from './components/Modals/ConfirmDialogs';

const TAB_INDEX_MAP: Record<TabType, number> = {
  review: 0,
  new: 1,
  someday: 2,
  calendar: 3
};

const pageSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 16 : direction < 0 ? -16 : 0,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -16 : direction < 0 ? 16 : 0,
    opacity: 0
  })
};

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeTab, setActiveTab] = useState<TabType>('review');
  const [tabDirection, setTabDirection] = useState<number>(0);
  const prevTabRef = useRef<TabType>('review');

  // UI state
  const [finalChoiceId, setFinalChoiceId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmData | null>(null);
  const [presetModalOpen, setPresetModalOpen] = useState<boolean>(false);
  const [presetDraft, setPresetDraft] = useState<PresetDraft>({
    id: null,
    name: '',
    steps: [1]
  });
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>(() =>
    getToday(state.settings?.dayCutoffHour || 0)
  );
  const [calendarDayModal, setCalendarDayModal] = useState<string | null>(null);
  const [calendarSearchQuery, setCalendarSearchQuery] = useState<string>('');

  const [classEditModalOpen, setClassEditModalOpen] = useState<boolean>(false);
  const [classEditDraft, setClassEditDraft] = useState<ClassEditDraft>({
    id: null,
    day: '月',
    period: '1限',
    subject: '',
    colorKey: null
  });

  const [memoEditModal, setMemoEditModal] = useState<MemoModalData | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastShow, setToastShow] = useState<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastShow(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastShow(false);
    }, 2200);
  }, []);

  // Save state on any change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const dayCutoff = state.settings?.dayCutoffHour || 0;
  const today = getToday(dayCutoff);

  const handleSelectTab = (newTab: TabType) => {
    if (newTab === activeTab) return;
    const oldIdx = TAB_INDEX_MAP[activeTab];
    const newIdx = TAB_INDEX_MAP[newTab];
    setTabDirection(newIdx > oldIdx ? 1 : -1);
    prevTabRef.current = activeTab;
    setActiveTab(newTab);
    setFinalChoiceId(null);
  };

  // Calculate pending stock items from finished classes
  const getPendingStockItems = useCallback((): PendingStockItem[] => {
    /* ルール①：休止期間中の授業は完全シャットアウト（休み） */
    if (isHoliday(today, state)) return [];

    const hm = effectiveHM(dayCutoff);
    const wd = todayWeekdayJP(dayCutoff);
    const pending: PendingStockItem[] = [];

    state.schedule.forEach((entry) => {
      if (entry.day !== wd) return;
      const isCanceled = (state.canceledClasses || []).some(
        (c) => c.date === today && c.scheduleId === entry.id
      );
      if (isCanceled) return;

      const pt = state.periodTimes[entry.period];
      if (!pt || !pt.end) return;
      if (hm < pt.end) return;

      const already = state.stockLog.some(
        (l) => l.scheduleId === entry.id && l.date === today
      );
      if (already) return;

      const countExisting = state.units.filter((u) => u.subject === entry.subject).length;
      pending.push({
        scheduleId: entry.id,
        subject: entry.subject,
        period: entry.period,
        colorKey: entry.colorKey || null,
        suggestedName: `${entry.subject} ${countExisting + 1}`
      });
    });

    return pending;
  }, [state, today, dayCutoff]);

  const pendingStockItems = getPendingStockItems();
  const reviewDueCount = state.units.filter((u) => u.nextDate <= today).length;

  const findUnit = useCallback(
    (id: string) => state.units.find((u) => u.id === id),
    [state.units]
  );

  const findPreset = useCallback(
    (id: string) => state.presets.find((p) => p.id === id),
    [state.presets]
  );

  // -------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------

  const handleCompleteUnit = (unitId: string) => {
    const u = findUnit(unitId);
    if (!u) return;
    const isLast = u.stepIndex >= u.steps.length - 1;
    if (isLast) {
      setFinalChoiceId(u.id);
      return;
    }
    const nextIndex = u.stepIndex + 1;
    const interval = u.steps[nextIndex];
    /* ルール②：休止期間に入る前の授業の復習はスライドせず予定通り登録 */
    setState((prev) => ({
      ...prev,
      units: prev.units.map((item) =>
        item.id === u.id
          ? {
              ...item,
              stepIndex: nextIndex,
              nextDate: addDays(today, interval)
            }
          : item
      )
    }));
  };

  const handleRequestFinalPick = (unitId: string, type: 'end' | 'continue') => {
    setConfirmModal({ type, unitId });
  };

  const handleExecuteFinalChoice = () => {
    if (!confirmModal) return;
    const { type, unitId } = confirmModal;
    const u = findUnit(unitId);
    if (u) {
      if (type === 'end') {
        setState((prev) => ({
          ...prev,
          units: prev.units.filter((x) => x.id !== u.id)
        }));
        showToast('復習を終了しました');
      } else {
        const lastInterval = u.steps[u.steps.length - 1] || 1;
        const nextDate = addDays(today, lastInterval);
        setState((prev) => ({
          ...prev,
          units: prev.units.map((item) =>
            item.id === u.id
              ? {
                  ...item,
                  stepIndex: u.steps.length - 1,
                  nextDate
                }
              : item
          )
        }));
        showToast('復習を継続しました');
      }
    }
    setConfirmModal(null);
    setFinalChoiceId(null);
  };

  const handleAddUnit = (name: string, date: string, presetId: string, memo: string) => {
    const p = findPreset(presetId) || state.presets[0];
    if (!p) {
      showToast('プリセットを選択してください');
      return;
    }
    const steps = p.steps.length > 0 ? p.steps : [1];
    const initialInterval = steps[0];
    const nextDate = addDays(date, initialInterval);

    const newUnit = {
      id: uid(),
      name: name.trim(),
      subject: '',
      colorKey: null,
      steps,
      stepIndex: 0,
      nextDate,
      presetName: p.name,
      memo: memo.trim()
    };

    setState((prev) => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
    showToast('単元を追加しました');
  };

  const handleRegisterStockItem = (
    scheduleId: string,
    name: string,
    memo: string,
    presetId: string
  ) => {
    const item = state.schedule.find((s) => s.id === scheduleId);
    if (!item) return;

    const p = findPreset(presetId) || state.presets[0];
    if (!p) {
      showToast('プリセットを選択してください');
      return;
    }
    const steps = p.steps.length > 0 ? p.steps : [1];
    const nextDate = addDays(today, steps[0]);

    const newUnit = {
      id: uid(),
      name: name.trim() || item.subject,
      subject: item.subject,
      colorKey: item.colorKey || null,
      steps,
      stepIndex: 0,
      nextDate,
      presetName: p.name,
      memo: memo.trim()
    };

    setState((prev) => ({
      ...prev,
      units: [...prev.units, newUnit],
      stockLog: [...prev.stockLog, { scheduleId: item.id, date: today }]
    }));
    showToast('復習に追加しました');
  };

  const handleAddSomeday = (name: string, presetId: string) => {
    const p = presetId ? findPreset(presetId) : null;
    const newItem = {
      id: uid(),
      name: name.trim(),
      presetId: p ? p.id : null,
      presetName: p ? p.name : null
    };
    setState((prev) => ({
      ...prev,
      someday: [...prev.someday, newItem]
    }));
    showToast('余裕項目を追加しました');
  };

  const handleCompleteSomeday = (id: string) => {
    const it = state.someday.find((s) => s.id === id);
    if (!it) return;

    let toastMsg = '完了しました';
    if (it.presetId) {
      const p = findPreset(it.presetId);
      if (p && p.steps.length > 1) {
        const interval = p.steps[1];
        const nextDate = addDays(today, interval);
        const newUnit = {
          id: uid(),
          name: it.name,
          subject: '',
          colorKey: null,
          steps: p.steps,
          stepIndex: 1,
          nextDate,
          presetName: p.name,
          memo: ''
        };
        setState((prev) => ({
          ...prev,
          someday: prev.someday.filter((s) => s.id !== id),
          units: [...prev.units, newUnit]
        }));
        toastMsg = '完了しました（2回目の復習を登録）';
        showToast(toastMsg);
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      someday: prev.someday.filter((s) => s.id !== id)
    }));
    showToast(toastMsg);
  };

  const handleToggleHoliday = (dateISO: string) => {
    const exists = state.holidays.includes(dateISO);
    setState((prev) => ({
      ...prev,
      holidays: exists
        ? prev.holidays.filter((d) => d !== dateISO)
        : [...prev.holidays, dateISO]
    }));
    showToast(exists ? '休みの設定を解除しました' : '休みを設定しました');
  };

  const handleToggleCanceledClass = (scheduleId: string, dateISO: string) => {
    const list = state.canceledClasses || [];
    const exists = list.some((c) => c.date === dateISO && c.scheduleId === scheduleId);
    setState((prev) => ({
      ...prev,
      canceledClasses: exists
        ? list.filter((c) => !(c.date === dateISO && c.scheduleId === scheduleId))
        : [...list, { scheduleId, date: dateISO }]
    }));
    showToast(exists ? '休講を解除しました' : 'このコマを休講にしました');
  };

  const handleAddHolidayRange = (start: string, end: string) => {
    if (!start || !end) return;
    const newRange = { id: uid(), start, end };
    setState((prev) => ({
      ...prev,
      holidayRanges: [...prev.holidayRanges, newRange]
    }));
    showToast('休暇期間を設定しました');
  };

  const handleSavePreset = (draft: PresetDraft) => {
    if (!draft.name.trim() || draft.steps.length === 0) return;
    if (draft.id) {
      setState((prev) => ({
        ...prev,
        presets: prev.presets.map((p) =>
          p.id === draft.id ? { ...p, name: draft.name.trim(), steps: draft.steps } : p
        )
      }));
      showToast('プリセットを更新しました');
    } else {
      const newPreset: Preset = {
        id: uid(),
        name: draft.name.trim(),
        steps: draft.steps
      };
      setState((prev) => ({
        ...prev,
        presets: [...prev.presets, newPreset]
      }));
      showToast('プリセットを作成しました');
    }
    setPresetModalOpen(false);
  };

  const handleSubmitClassDraft = (
    subject: string,
    day: string,
    period: string,
    colorKey: string | null
  ) => {
    if (classEditDraft.id) {
      setState((prev) => ({
        ...prev,
        schedule: prev.schedule.map((s) =>
          s.id === classEditDraft.id
            ? { ...s, subject: subject.trim(), day, period, colorKey }
            : s
        )
      }));
      showToast('時間割を更新しました');
    } else {
      const newScheduleItem: ScheduleItem = {
        id: uid(),
        day,
        period,
        subject: subject.trim(),
        colorKey
      };
      setState((prev) => ({
        ...prev,
        schedule: [...prev.schedule, newScheduleItem]
      }));
      showToast('時間割に追加しました');
    }

    setClassEditDraft({
      id: null,
      day,
      period: getPeriods(state.periodCount)[0] || '1限',
      subject: '',
      colorKey: state.customColors[0]?.key || null
    });
  };

  const handleAskDelete = (
    kind: 'unit' | 'stock' | 'someday' | 'schedule' | 'preset' | 'holidayRange' | 'color',
    id: string,
    label: string
  ) => {
    setDeleteConfirm({ kind, id, label });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    const { kind, id } = deleteConfirm;

    switch (kind) {
      case 'unit':
        setState((prev) => ({ ...prev, units: prev.units.filter((u) => u.id !== id) }));
        showToast('単元を削除しました');
        break;
      case 'stock':
        setState((prev) => ({
          ...prev,
          stockLog: [...prev.stockLog, { scheduleId: id, date: today }]
        }));
        showToast('ストックを破棄しました');
        break;
      case 'someday':
        setState((prev) => ({ ...prev, someday: prev.someday.filter((s) => s.id !== id) }));
        showToast('余裕項目を削除しました');
        break;
      case 'schedule':
        setState((prev) => ({ ...prev, schedule: prev.schedule.filter((s) => s.id !== id) }));
        showToast('授業を削除しました');
        break;
      case 'preset':
        setState((prev) => ({ ...prev, presets: prev.presets.filter((p) => p.id !== id) }));
        showToast('プリセットを削除しました');
        break;
      case 'holidayRange':
        setState((prev) => ({
          ...prev,
          holidayRanges: prev.holidayRanges.filter((r) => r.id !== id)
        }));
        showToast('休暇期間を削除しました');
        break;
      case 'color':
        setState((prev) => ({
          ...prev,
          customColors: prev.customColors.filter((c) => c.key !== id),
          schedule: prev.schedule.map((s) => (s.colorKey === id ? { ...s, colorKey: null } : s)),
          units: prev.units.map((u) => (u.colorKey === id ? { ...u, colorKey: null } : u))
        }));
        showToast('カラーを削除しました');
        break;
    }
    setDeleteConfirm(null);
  };

  const handleAddCustomColor = (hex: string): string => {
    const count = state.customColors.length + 1;
    const newColor = createCustomColor(hex, `カラー ${count}`);
    setState((prev) => ({
      ...prev,
      customColors: [...prev.customColors, newColor]
    }));
    showToast('カラーを追加しました');
    return newColor.key;
  };

  const handleSaveUnitMemo = (unitId: string, memo: string) => {
    setState((prev) => ({
      ...prev,
      units: prev.units.map((u) => (u.id === unitId ? { ...u, memo: memo.trim() } : u))
    }));
    setMemoEditModal(null);
    showToast('メモを保存しました');
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Easy review!',
      version: 3,
      data: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easy-review-backup-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showToast('バックアップを書き出しました');
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const data = parsed && parsed.data ? parsed.data : parsed;
        if (!data || typeof data !== 'object') throw new Error('invalid data');

        setState({
          units: Array.isArray(data.units) ? data.units : [],
          presets: Array.isArray(data.presets) ? data.presets : [],
          someday: Array.isArray(data.someday) ? data.someday : [],
          schedule: Array.isArray(data.schedule) ? data.schedule : [],
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
          periodTimes:
            data.periodTimes && typeof data.periodTimes === 'object'
              ? data.periodTimes
              : JSON.parse(JSON.stringify(DEFAULT_PERIOD_TIMES)),
          stockLog: Array.isArray(data.stockLog) ? data.stockLog : [],
          periodCount: Math.max(1, Math.min(10, data.periodCount || 6)),
          holidays: Array.isArray(data.holidays) ? data.holidays : [],
          holidayRanges: Array.isArray(data.holidayRanges) ? data.holidayRanges : [],
          customColors: Array.isArray(data.customColors) ? data.customColors : [],
          canceledClasses: Array.isArray(data.canceledClasses) ? data.canceledClasses : [],
          settings:
            data.settings && typeof data.settings === 'object'
              ? { dayCutoffHour: data.settings.dayCutoffHour || 0 }
              : { dayCutoffHour: 0 }
        });
        setSettingsOpen(false);
        showToast('データを復元しました');
      } catch (e) {
        showToast('読み込みに失敗しました。ファイルを確認してください');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="shell">
      {/* PWA Install banner for smartphones and desktop */}
      <PWAInstallPrompt />

      {/* Header */}
      <Header
        activeTab={activeTab}
        dayCutoffHour={dayCutoff}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Tab Area with Fast and Smooth Tab Transitions */}
      <div id="main-content" style={{ position: 'relative', overflowX: 'hidden' }}>
        <AnimatePresence mode="popLayout" custom={tabDirection} initial={false}>
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={pageSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.14,
              ease: [0.25, 1, 0.5, 1]
            }}
            style={{ width: '100%', minHeight: '100%' }}
          >
            {activeTab === 'review' && (
              <ReviewTab
                units={state.units}
                customColors={state.customColors}
                dayCutoffHour={dayCutoff}
                finalChoiceId={finalChoiceId}
                onCompleteUnit={handleCompleteUnit}
                onRequestFinalPick={handleRequestFinalPick}
                onOpenMemoModal={(id) => {
                  const u = findUnit(id);
                  if (u) setMemoEditModal({ unitId: u.id, memo: u.memo || '' });
                }}
                onAskDeleteUnit={(id, name) => handleAskDelete('unit', id, name)}
              />
            )}

            {activeTab === 'new' && (
              <NewTab
                presets={state.presets}
                periodCount={state.periodCount}
                periodTimes={state.periodTimes}
                pendingStockItems={pendingStockItems}
                customColors={state.customColors}
                dayCutoffHour={dayCutoff}
                onAddUnit={handleAddUnit}
                onOpenPresetModal={() => {
                  setPresetDraft({ id: null, name: '', steps: [1] });
                  setPresetModalOpen(true);
                }}
                onOpenClassEditModal={() => {
                  setClassEditDraft({
                    id: null,
                    day: '月',
                    period: getPeriods(state.periodCount)[0] || '1限',
                    subject: '',
                    colorKey: state.customColors[0]?.key || null
                  });
                  setClassEditModalOpen(true);
                }}
                onRegisterStockItem={handleRegisterStockItem}
                onAskDeleteStock={(id, label) => handleAskDelete('stock', id, label)}
                onPeriodCountDelta={(delta) => {
                  setState((prev) => ({
                    ...prev,
                    periodCount: Math.max(1, Math.min(10, (prev.periodCount || 6) + delta))
                  }));
                }}
                onSavePeriodTimes={(times) => {
                  setState((prev) => ({ ...prev, periodTimes: times }));
                  showToast('時限の時間を保存しました');
                }}
                onResetPeriodTimes={() => {
                  setState((prev) => ({
                    ...prev,
                    periodTimes: JSON.parse(JSON.stringify(DEFAULT_PERIOD_TIMES))
                  }));
                  showToast('時間設定を初期値に戻しました');
                }}
              />
            )}

            {activeTab === 'someday' && (
              <SomedayTab
                somedayItems={state.someday}
                presets={state.presets}
                onAddSomeday={handleAddSomeday}
                onCompleteSomeday={handleCompleteSomeday}
                onAskDeleteSomeday={(id, name) => handleAskDelete('someday', id, name)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab
                state={state}
                customColors={state.customColors}
                dayCutoffHour={dayCutoff}
                calendarYear={calYear}
                calendarMonth={calMonth}
                selectedDate={calendarSelectedDate}
                searchQuery={calendarSearchQuery}
                onYearMonthChange={(y, m) => {
                  setCalYear(y);
                  setCalMonth(m);
                }}
                onSelectDate={(date) => setCalendarSelectedDate(date)}
                onSearchChange={(q) => setCalendarSearchQuery(q)}
                onOpenDayDetail={(date) => setCalendarDayModal(date)}
                onToggleCanceledClass={handleToggleCanceledClass}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        reviewBadge={reviewDueCount}
        stockBadge={pendingStockItems.length}
        onSelectTab={handleSelectTab}
      />

      {/* Modals & Dialogs with fluid spring backdrop and sheet animations */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal
            key="settings-modal"
            dayCutoffHour={dayCutoff}
            holidayRanges={state.holidayRanges}
            onClose={() => setSettingsOpen(false)}
            onUpdateDayCutoff={(h) => {
              setState((prev) => ({
                ...prev,
                settings: { ...prev.settings, dayCutoffHour: h }
              }));
              showToast('切り替え時刻を保存しました');
            }}
            onAddHolidayRange={handleAddHolidayRange}
            onAskDeleteHolidayRange={(id, label) => handleAskDelete('holidayRange', id, label)}
            onOpenPresetModal={() => {
              setPresetDraft({ id: null, name: '', steps: [1] });
              setPresetModalOpen(true);
              setSettingsOpen(false);
            }}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}

        {presetModalOpen && (
          <PresetModal
            key="preset-modal"
            presets={state.presets}
            draft={presetDraft}
            onClose={() => setPresetModalOpen(false)}
            onSavePreset={handleSavePreset}
            onEditPreset={(p) => {
              setPresetDraft({ id: p.id, name: p.name, steps: [...p.steps] });
            }}
            onAskDeletePreset={(id, name) => handleAskDelete('preset', id, name)}
          />
        )}

        {classEditModalOpen && (
          <ClassEditModal
            key="class-edit-modal"
            draft={classEditDraft}
            schedule={state.schedule}
            periodCount={state.periodCount}
            customColors={state.customColors}
            onClose={() => setClassEditModalOpen(false)}
            onSubmitDraft={handleSubmitClassDraft}
            onEditItem={(item: ScheduleItem) => {
              setClassEditDraft({
                id: item.id,
                day: item.day,
                period: item.period,
                subject: item.subject,
                colorKey: item.colorKey || null
              });
            }}
            onCancelEdit={() => {
              setClassEditDraft({
                id: null,
                day: '月',
                period: getPeriods(state.periodCount)[0] || '1限',
                subject: '',
                colorKey: null
              });
            }}
            onAskDeleteClass={(id, label) => handleAskDelete('schedule', id, label)}
            onAddCustomColor={handleAddCustomColor}
            onAskDeleteColor={(key, label) => handleAskDelete('color', key, label)}
          />
        )}

        {calendarDayModal && (
          <DayDetailModal
            key="day-detail-modal"
            dateISO={calendarDayModal}
            isHoliday={isHoliday(calendarDayModal, state)}
            dueUnits={state.units.filter((u) => u.nextDate === calendarDayModal)}
            customColors={state.customColors}
            onClose={() => setCalendarDayModal(null)}
            onToggleHoliday={handleToggleHoliday}
            onAskDeleteUnit={(id, name) => handleAskDelete('unit', id, name)}
          />
        )}

        {memoEditModal && (
          <MemoEditModal
            key="memo-modal"
            unit={findUnit(memoEditModal.unitId)}
            onClose={() => setMemoEditModal(null)}
            onSaveMemo={handleSaveUnitMemo}
          />
        )}
      </AnimatePresence>

      <ConfirmDialogs
        confirmModal={confirmModal}
        deleteConfirm={deleteConfirm}
        findUnit={findUnit}
        onCancelFinalChoice={() => setConfirmModal(null)}
        onExecuteFinalChoice={handleExecuteFinalChoice}
        onCancelDelete={() => setDeleteConfirm(null)}
        onExecuteDelete={handleExecuteDelete}
      />

      {/* Global Toast */}
      <Toast message={toastMessage} show={toastShow} />
    </div>
  );
}
