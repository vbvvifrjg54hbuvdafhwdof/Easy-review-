import React, { useRef, useState } from 'react';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ClassEditDraft, CustomColor, ScheduleItem } from '../../types';
import { colorFor } from '../../utils/color';
import { getPeriods, WEEKDAYS } from '../../utils/date';

interface ClassEditModalProps {
  draft: ClassEditDraft;
  schedule: ScheduleItem[];
  periodCount: number;
  customColors: CustomColor[];
  onClose: () => void;
  onSubmitDraft: (subject: string, day: string, period: string, colorKey: string | null) => void;
  onEditItem: (item: ScheduleItem) => void;
  onCancelEdit: () => void;
  onAskDeleteClass: (id: string, label: string) => void;
  onAddCustomColor: (hex: string) => string;
  onAskDeleteColor: (key: string, label: string) => void;
}

export const ClassEditModal: React.FC<ClassEditModalProps> = ({
  draft,
  schedule,
  periodCount,
  customColors,
  onClose,
  onSubmitDraft,
  onEditItem,
  onCancelEdit,
  onAskDeleteClass,
  onAddCustomColor,
  onAskDeleteColor
}) => {
  const [day, setDay] = useState(draft.day || WEEKDAYS[0]);
  const [period, setPeriod] = useState(draft.period || getPeriods(periodCount)[0]);
  const [subject, setSubject] = useState(draft.subject || '');
  const [colorKey, setColorKey] = useState<string | null>(
    draft.colorKey || customColors[0]?.key || null
  );

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [newColorHex, setNewColorHex] = useState('#6495ED');

  const colorLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isColorLongPressRef = useRef<boolean>(false);

  React.useEffect(() => {
    setDay(draft.day || WEEKDAYS[0]);
    setPeriod(draft.period || getPeriods(periodCount)[0]);
    setSubject(draft.subject || '');
    setColorKey(draft.colorKey || customColors[0]?.key || null);
  }, [draft, customColors, periodCount]);

  const periods = getPeriods(periodCount);

  const handleColorTouchStart = (key: string, label: string) => {
    isColorLongPressRef.current = false;
    if (colorLongPressTimerRef.current) clearTimeout(colorLongPressTimerRef.current);
    colorLongPressTimerRef.current = setTimeout(() => {
      isColorLongPressRef.current = true;
      onAskDeleteColor(key, label);
    }, 450);
  };

  const handleColorTouchEnd = () => {
    if (colorLongPressTimerRef.current) clearTimeout(colorLongPressTimerRef.current);
  };

  const handleColorClick = (key: string) => {
    if (isColorLongPressRef.current) {
      isColorLongPressRef.current = false;
      return;
    }
    setColorKey(key);
  };

  const handleConfirmAddColor = () => {
    const newKey = onAddCustomColor(newColorHex);
    setColorKey(newKey);
    setColorPickerOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    onSubmitDraft(subject.trim(), day, period, colorKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="modal-backdrop bottom-sheet"
      id="class-edit-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
        className="modal-card"
        id="class-edit-modal-card"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>時間割（教科）の登録・編集</h3>
          <motion.button
            whileTap={{ scale: 0.82 }}
            id="close-class-edit-btn"
            onClick={onClose}
            aria-label="時間割モーダルを閉じる"
            style={{ padding: 4 }}
          >
            <X size={22} color="#6B6B76" strokeWidth={2.2} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '14px'
            }}
          >
            <div className="field">
              <label htmlFor="class-edit-day">曜日</label>
              <select
                id="class-edit-day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                {WEEKDAYS.map((w) => (
                  <option key={w} value={w}>
                    {w}曜日
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="class-edit-period">時限</label>
              <select
                id="class-edit-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '14px' }}>
            <label htmlFor="class-edit-subject">科目名</label>
            <input
              type="text"
              id="class-edit-subject"
              placeholder="例：物理"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Color swatch picker */}
          <div className="field" style={{ marginBottom: '18px' }}>
            <label>教科カラー</label>
            <div className="swatch-row" style={{ alignItems: 'center' }}>
              {customColors.map((c) => {
                const sel = colorKey === c.key;
                return (
                  <motion.button
                    key={c.key}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    type="button"
                    id={`swatch-btn-${c.key}`}
                    className="swatch"
                    style={{
                      background: c.border,
                      boxShadow: sel ? `0 0 0 3px #fff, 0 0 0 5px ${c.border}` : undefined
                    }}
                    title={`${c.label}（長押しで削除）`}
                    onTouchStart={() => handleColorTouchStart(c.key, c.label)}
                    onTouchEnd={handleColorTouchEnd}
                    onMouseDown={() => handleColorTouchStart(c.key, c.label)}
                    onMouseUp={handleColorTouchEnd}
                    onClick={() => handleColorClick(c.key)}
                  />
                );
              })}
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                type="button"
                id="open-color-popover-btn"
                className="swatch"
                style={{
                  background: '#fff',
                  border: '1.5px dashed #B5B5C0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setColorPickerOpen(true)}
                aria-label="色を追加"
              >
                <Plus size={14} color="#6B6B76" strokeWidth={2.4} />
              </motion.button>
            </div>

            {customColors.length === 0 ? (
              <p className="text-xs" style={{ color: '#B5B5C0', marginTop: '6px' }}>
                まだ教科カラーがありません。「＋」から作成してください。
              </p>
            ) : (
              <p className="text-xs" style={{ color: '#B5B5C0', marginTop: '6px' }}>
                ※作成したカラーを長押しすると削除できます。
              </p>
            )}

            <AnimatePresence>
              {colorPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, height: 0 }}
                  animate={{ opacity: 1, scale: 1, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.94, height: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className="color-popover"
                  id="color-popover"
                >
                  <input
                    type="color"
                    id="new-custom-color-input"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    style={{
                      width: 44,
                      height: 44,
                      border: 'none',
                      borderRadius: '12px',
                      padding: 0,
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    id="confirm-add-color-btn"
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px 12px', fontSize: '13px' }}
                    onClick={handleConfirmAddColor}
                  >
                    この色を追加する
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    id="cancel-add-color-btn"
                    className="btn-outline"
                    style={{ flex: '0 0 auto', width: 38, padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setColorPickerOpen(false)}
                  >
                    <X size={15} color="#6B6B76" strokeWidth={2.2} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2" style={{ marginBottom: '22px' }}>
            {draft.id && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                id="cancel-class-edit-btn"
                className="btn-outline"
                onClick={onCancelEdit}
              >
                キャンセル
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              id="submit-class-draft-btn"
              className="btn-primary"
              style={{ flex: 2 }}
              disabled={!subject.trim()}
            >
              {draft.id ? '更新する' : '時間割に追加'}
            </motion.button>
          </div>
        </form>

        {/* Existing Schedule list organized by weekday */}
        <div style={{ borderTop: '1px solid #EDEDF2', paddingTop: '14px' }} id="class-schedule-list">
          {WEEKDAYS.map((w) => {
            const items = schedule
              .filter((s) => s.day === w)
              .sort((a, b) => a.period.localeCompare(b.period));
            if (items.length === 0) return null;

            return (
              <div key={w} style={{ marginBottom: '10px' }}>
                <p className="text-xs font-bold" style={{ color: '#3D5FBF', margin: '10px 0 6px 0' }}>
                  {w}曜日
                </p>
                <AnimatePresence mode="popLayout">
                  {items.map((s) => {
                    const sc = colorFor(s.colorKey, customColors);
                    return (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        id={`class-row-${s.id}`}
                        className="flex items-center justify-between"
                        style={{
                          padding: '9px 12px',
                          borderRadius: '14px',
                          background: 'var(--bg)',
                          marginBottom: '6px',
                          borderLeft: `4px solid ${sc.border || '#6495ED'}`
                        }}
                      >
                        <span className="text-sm font-semibold">
                          {s.subject}
                          <span className="text-xs font-normal" style={{ color: '#6B6B76', marginLeft: '8px' }}>
                            {s.period}
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileTap={{ scale: 0.82 }}
                            id={`edit-class-item-${s.id}`}
                            onClick={() => onEditItem(s)}
                            aria-label="科目を編集"
                            style={{ padding: 4 }}
                          >
                            <Pencil size={14} color="#6495ED" strokeWidth={2} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.82 }}
                            id={`delete-class-item-${s.id}`}
                            className="card-trash"
                            onClick={() => onAskDeleteClass(s.id, s.subject)}
                            aria-label="科目を削除"
                          >
                            <Trash2 size={14} color="#C9C9D2" strokeWidth={2} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          })}
          {schedule.length === 0 && (
            <p className="text-xs" style={{ color: '#B5B5C0' }}>
              まだ授業が登録されていません。
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
