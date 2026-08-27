import React from 'react';
import { X, Sparkles, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomColor, Unit } from '../../types';
import { formatJP } from '../../utils/date';
import { paletteFor } from '../../utils/color';

interface DayDetailModalProps {
  dateISO: string;
  isHoliday: boolean;
  dueUnits: Unit[];
  customColors: CustomColor[];
  onClose: () => void;
  onToggleHoliday: (date: string) => void;
  onAskDeleteUnit: (id: string, name: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dateISO,
  isHoliday,
  dueUnits,
  customColors,
  onClose,
  onToggleHoliday,
  onAskDeleteUnit
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="modal-backdrop bottom-sheet"
      id="day-detail-modal-backdrop"
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
        id="day-detail-modal-card"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>{formatJP(dateISO)}の復習単元</h3>
          <motion.button
            whileTap={{ scale: 0.82 }}
            id="close-day-detail-btn"
            onClick={onClose}
            aria-label="詳細モーダルを閉じる"
            style={{ padding: 4 }}
          >
            <X size={22} color="#6B6B76" strokeWidth={2.2} />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          id="toggle-holiday-btn"
          className="btn-outline"
          style={{
            width: '100%',
            marginBottom: '16px',
            background: isHoliday ? '#FFFCE0' : '#fff',
            color: isHoliday ? '#8A7B00' : 'var(--inkSoft)',
            borderColor: isHoliday ? '#FFF450' : 'var(--line)',
            fontWeight: 700
          }}
          onClick={() => onToggleHoliday(dateISO)}
        >
          {isHoliday ? '休みの設定を解除する' : 'この日を休みにする（授業をシャットアウト）'}
        </motion.button>

        {dueUnits.length === 0 ? (
          <div className="empty-state" style={{ padding: '36px 10px' }} id="day-detail-empty-state">
            <Sparkles size={26} color="#B5B5C0" strokeWidth={1.8} />
            <p>この日に予定されている復習単元はありません。</p>
          </div>
        ) : (
          <div id="day-detail-unit-list">
            <AnimatePresence mode="popLayout">
              {dueUnits.map((u) => {
                const palette = paletteFor(u, customColors);
                return (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    id={`day-detail-unit-${u.id}`}
                    className="flex items-center gap-3"
                    style={{
                      padding: '12px',
                      borderRadius: '16px',
                      border: `1.5px solid ${palette.border}`,
                      marginBottom: '8px',
                      background: '#fff',
                      boxShadow: '0 2px 6px rgba(43, 43, 51, 0.04)'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ margin: 0 }}>
                        {u.name}
                      </p>
                      {u.memo && (
                        <p className="text-xs" style={{ margin: '2px 0 0 0', color: '#6B6B76' }}>
                          メモ: {u.memo}
                        </p>
                      )}
                      <span
                        className="pill"
                        style={{
                          background: palette.bg,
                          color: palette.text,
                          marginTop: '5px',
                          display: 'inline-flex'
                        }}
                      >
                        {u.presetName || '標準'}（{u.stepIndex + 1}/{u.steps.length}回目）
                      </span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      id={`day-detail-delete-unit-${u.id}`}
                      className="card-trash"
                      style={{ width: 34, height: 34 }}
                      onClick={() => onAskDeleteUnit(u.id, u.name)}
                      aria-label="単元を削除"
                    >
                      <Trash2 size={16} color="#C15C7C" strokeWidth={2} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
