import React, { useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AppState, CustomColor, Unit } from '../types';
import { formatJP, getPeriods, getToday, isHoliday, toISO, WEEKDAYS } from '../utils/date';
import { colorFor, paletteFor } from '../utils/color';

interface CalendarTabProps {
  state: AppState;
  customColors: CustomColor[];
  dayCutoffHour: number;
  calendarYear: number;
  calendarMonth: number;
  selectedDate: string;
  searchQuery: string;
  onYearMonthChange: (year: number, month: number) => void;
  onSelectDate: (date: string) => void;
  onSearchChange: (query: string) => void;
  onOpenDayDetail: (date: string) => void;
  onToggleCanceledClass: (scheduleId: string, dateISO: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  state,
  customColors,
  dayCutoffHour,
  calendarYear,
  calendarMonth,
  selectedDate,
  searchQuery,
  onYearMonthChange,
  onSelectDate,
  onSearchChange,
  onOpenDayDetail,
  onToggleCanceledClass
}) => {
  const today = getToday(dayCutoffHour);
  const selDate = selectedDate || today;
  const [navDirection, setNavDirection] = useState<number>(0);

  // Long press timer ref for timetable cells
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isLongPressFiredRef = useRef<boolean>(false);

  const handleCellTouchStart = (scheduleId: string, cellDateISO: string, e: React.TouchEvent | React.MouseEvent) => {
    isLongPressFiredRef.current = false;
    if ('touches' in e && e.touches[0]) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressFiredRef.current = true;
      onToggleCanceledClass(scheduleId, cellDateISO);
    }, 450);
  };

  const handleCellTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }
    }
  };

  const handleCellTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const handleCellClick = (scheduleId: string, cellDateISO: string) => {
    if (isLongPressFiredRef.current) {
      isLongPressFiredRef.current = false;
      return;
    }
    onSelectDate(cellDateISO);
  };

  const firstWeekday = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calendarYear, calendarMonth, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const filterUnits = (list: Unit[]) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => u.name.toLowerCase().includes(q));
  };

  const navMonth = (delta: number) => {
    setNavDirection(delta);
    let m = calendarMonth + delta;
    let y = calendarYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    onYearMonthChange(y, m);
  };

  const periods = getPeriods(state.periodCount);
  const selD = new Date(`${selDate}T00:00:00`);
  const selDayOfWeek = (selD.getDay() + 6) % 7;
  const monD = new Date(selD.getTime() - selDayOfWeek * 24 * 60 * 60 * 1000);

  return (
    <div style={{ padding: '14px 14px 28px 14px', width: '100%', boxSizing: 'border-box' }} id="calendar-tab-content">
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <span
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#B5B5C0',
            display: 'flex',
            zIndex: 1
          }}
        >
          <Search size={15} strokeWidth={2} />
        </span>
        <input
          id="calendar-search-input"
          type="text"
          placeholder="単元名で検索"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            borderRadius: 999,
            border: '1.5px solid var(--line)',
            fontSize: '13px',
            outline: 'none',
            background: '#fff'
          }}
        />
      </div>

      {/* Month Navigation */}
      <div className="cal-head" style={{ padding: '0 4px', marginBottom: '8px' }}>
        <motion.button
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.1 }}
          id="cal-prev-month-btn"
          className="cal-nav-btn"
          onClick={() => navMonth(-1)}
          aria-label="前の月"
        >
          <ChevronLeft size={20} color="#3D5FBF" strokeWidth={2.4} />
        </motion.button>
        <motion.p
          key={`${calendarYear}-${calendarMonth}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-bold"
          style={{ margin: 0, color: 'var(--ink)' }}
        >
          {calendarYear}年 {calendarMonth + 1}月
        </motion.p>
        <motion.button
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.1 }}
          id="cal-next-month-btn"
          className="cal-nav-btn"
          onClick={() => navMonth(1)}
          aria-label="次の月"
        >
          <ChevronRight size={20} color="#3D5FBF" strokeWidth={2.4} />
        </motion.button>
      </div>

      {/* Weekday Header */}
      <div className="cal-grid" style={{ padding: '0 2px', marginBottom: '4px' }}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-wd">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Date Grid */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '2px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${calendarYear}-${calendarMonth}`}
            initial={{ opacity: 0, x: navDirection > 0 ? 16 : navDirection < 0 ? -16 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: navDirection > 0 ? -16 : 16 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="cal-grid"
            id="calendar-grid"
          >
            {cells.map((d, index) => {
              if (!d) return <div key={`empty-${index}`} />;
              const iso = toISO(d);
              const isToday = iso === today;
              const isSel = iso === selDate;
              const holiday = isHoliday(iso, state);
              const dueUnits = filterUnits(state.units.filter((u) => u.nextDate === iso));

              return (
                <motion.button
                  key={iso}
                  whileTap={{ scale: 0.92 }}
                  id={`cal-cell-${iso}`}
                  className={`cal-cell ${isToday ? 'today' : ''} ${isSel ? 'selected' : ''}`}
                  style={{
                    background: holiday ? '#F5F5F8' : undefined,
                    opacity: holiday ? 0.65 : undefined
                  }}
                  onClick={() => onSelectDate(iso)}
                >
                  <span className="cal-day-num">{d.getDate()}</span>
                  <div className="cal-dots">
                    {dueUnits.slice(0, 3).map((u) => {
                      const pal = paletteFor(u, customColors);
                      return (
                        <span
                          key={u.id}
                          className="cal-dot"
                          style={{ background: pal.border }}
                          title={u.name}
                        />
                      );
                    })}
                    {dueUnits.length > 3 && (
                      <span style={{ fontSize: '8px', color: '#6B6B76' }}>
                        +{dueUnits.length - 3}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Day Detail Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        id="open-day-detail-btn"
        className="btn-primary"
        style={{
          marginTop: '16px',
          background: '#fff',
          border: '1.5px solid #6495ED',
          color: '#3D5FBF',
          boxShadow: '0 2px 8px rgba(100, 149, 237, 0.12)'
        }}
        onClick={() => onOpenDayDetail(selDate)}
      >
        {formatJP(selDate)} の詳細・復習一覧を見る
      </motion.button>

      {/* Weekly Timetable Grid */}
      <div style={{ marginTop: '22px', borderTop: '1px solid #EDEDF2', paddingTop: '16px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px', padding: '0 2px' }}>
          <p className="text-xs font-bold" style={{ color: '#2B2B33', margin: 0 }}>
            週間時間割（選択日: {formatJP(selDate)}）
          </p>
          <span className="text-xs" style={{ color: '#B5B5C0' }}>
            ※コマ長押しで休講切り替え
          </span>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '1px' }}>
          <table className="tt-table" id="weekly-timetable-table" style={{ margin: 0, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 34 }}>時限</th>
                {WEEKDAYS.map((w, wIdx) => {
                  const cellDateD = new Date(monD.getTime() + wIdx * 24 * 60 * 60 * 1000);
                  const cellDateISO = toISO(cellDateD);
                  const isSelWd = cellDateISO === selDate;
                  return (
                    <th
                      key={w}
                      style={{
                        background: isSelWd ? 'var(--blueSoft)' : undefined,
                        color: isSelWd ? 'var(--blueDark)' : undefined,
                        fontWeight: isSelWd ? 700 : undefined
                      }}
                    >
                      {w}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p}>
                  <th>{p}</th>
                  {WEEKDAYS.map((w, wIdx) => {
                    const item = state.schedule.find((s) => s.day === w && s.period === p);
                    const cellDateD = new Date(monD.getTime() + wIdx * 24 * 60 * 60 * 1000);
                    const cellDateISO = toISO(cellDateD);
                    const isSelWd = cellDateISO === selDate;

                    if (item) {
                      const isCanceled = (state.canceledClasses || []).some(
                        (c) => c.date === cellDateISO && c.scheduleId === item.id
                      );
                      const colorObj = colorFor(item.colorKey, customColors);

                      let bgStyle: React.CSSProperties = {
                        cursor: 'pointer',
                        transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      };

                      if (isCanceled) {
                        bgStyle = {
                          ...bgStyle,
                          background: '#F0F0F3',
                          color: '#A0A0AB',
                          textDecoration: 'line-through'
                        };
                      } else if (colorObj.bg) {
                        bgStyle = {
                          ...bgStyle,
                          background: colorObj.bg,
                          color: colorObj.text
                        };
                      }

                      if (isSelWd && !isCanceled) {
                        bgStyle.boxShadow = 'inset 0 0 0 2px var(--blue)';
                      }

                      return (
                        <td
                          key={`${p}-${w}`}
                          id={`tt-cell-${item.id}-${cellDateISO}`}
                          className={isCanceled ? 'canceled' : ''}
                          style={bgStyle}
                          title={`${item.subject} (長押しで休講切替)`}
                          onTouchStart={(e) => handleCellTouchStart(item.id, cellDateISO, e)}
                          onTouchMove={handleCellTouchMove}
                          onTouchEnd={handleCellTouchEnd}
                          onMouseDown={(e) => handleCellTouchStart(item.id, cellDateISO, e)}
                          onMouseUp={handleCellTouchEnd}
                          onClick={() => handleCellClick(item.id, cellDateISO)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onToggleCanceledClass(item.id, cellDateISO);
                          }}
                        >
                          {item.subject}
                          {isCanceled && (
                            <>
                              <br />
                              <span style={{ fontSize: '9px', color: '#A0A0AB' }}>[休講]</span>
                            </>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={`${p}-${w}`} style={{ color: '#E0E0E5' }}>
                        -
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
