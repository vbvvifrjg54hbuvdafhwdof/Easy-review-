import React from 'react';
import { Sparkles, Pencil, Clock, Check, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CustomColor, Unit } from '../types';
import { formatJP, getToday } from '../utils/date';
import { paletteFor } from '../utils/color';

interface ReviewTabProps {
  units: Unit[];
  customColors: CustomColor[];
  dayCutoffHour: number;
  finalChoiceId: string | null;
  onCompleteUnit: (unitId: string) => void;
  onRequestFinalPick: (unitId: string, type: 'end' | 'continue') => void;
  onOpenMemoModal: (unitId: string) => void;
  onAskDeleteUnit: (unitId: string, name: string) => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  units,
  customColors,
  dayCutoffHour,
  finalChoiceId,
  onCompleteUnit,
  onRequestFinalPick,
  onOpenMemoModal,
  onAskDeleteUnit
}) => {
  const today = getToday(dayCutoffHour);
  const dueUnits = units
    .filter((u) => u.nextDate <= today)
    .sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1));

  if (dueUnits.length === 0) {
    return (
      <motion.div
        className="empty-state"
        id="review-empty-state"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        <motion.div
          animate={{
            rotate: [0, -12, 12, -6, 6, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 2.5,
            ease: 'easeInOut'
          }}
        >
          <Sparkles size={38} color="#6495ED" strokeWidth={1.8} />
        </motion.div>
        <p style={{ fontWeight: 600, color: 'var(--inkSoft)' }}>
          今日の復習項目はすべて終わりました！
        </p>
      </motion.div>
    );
  }

  const ringR = 16;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div style={{ padding: '16px 16px 24px 16px' }} id="review-list">
      <AnimatePresence mode="popLayout">
        {dueUnits.map((u) => {
          const palette = paletteFor(u, customColors);
          const overdue = u.nextDate < today;
          const isLastStep = u.stepIndex >= u.steps.length - 1;
          const showFinal = finalChoiceId === u.id;
          const pct = Math.min((u.stepIndex + 1) / u.steps.length, 1);
          const dashOffset = ringC * (1 - pct);

          return (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.88,
                x: 40,
                transition: { duration: 0.22, ease: [0.2, 0, 0, 1] }
              }}
              transition={{
                layout: { type: 'spring', stiffness: 450, damping: 32 },
                opacity: { duration: 0.2 },
                y: { type: 'spring', stiffness: 450, damping: 30 }
              }}
              id={`unit-card-${u.id}`}
              className="unit-card"
              style={{
                border: `2px solid ${palette.border}`,
                marginBottom: '12px',
                position: 'relative'
              }}
            >
              <div className="flex items-center gap-3">
                {/* Circular Progress Ring */}
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                  <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="20"
                      cy="20"
                      r={ringR}
                      stroke="#EDEDF2"
                      strokeWidth="4"
                      fill="none"
                    />
                    <motion.circle
                      cx="20"
                      cy="20"
                      r={ringR}
                      stroke={palette.border}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={ringC}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#2B2B33'
                    }}
                  >
                    {u.stepIndex + 1}/{u.steps.length}
                  </div>
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1_5">
                    <p className="text-sm font-bold truncate" style={{ margin: 0 }}>
                      {u.name}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      id={`edit-memo-btn-${u.id}`}
                      onClick={() => onOpenMemoModal(u.id)}
                      style={{ color: '#6B6B76', padding: '2px' }}
                      aria-label="メモを編集"
                    >
                      <Pencil size={13} strokeWidth={2} />
                    </motion.button>
                  </div>
                  {u.memo && (
                    <p className="text-xs" style={{ margin: '3px 0 0 0', color: '#6B6B76' }}>
                      メモ: {u.memo}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '5px' }}>
                    <span
                      className="pill"
                      style={{ background: palette.bg, color: palette.text }}
                    >
                      {u.presetName || '標準'}
                    </span>
                    {overdue && (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="pill"
                        style={{ background: '#FDEBF1', color: '#C15C7C', fontWeight: 700 }}
                      >
                        <Clock size={11} strokeWidth={2} />
                        期限超過・{formatJP(u.nextDate)}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Complete & Trash action buttons */}
                {!showFinal && (
                  <motion.button
                    whileTap={{ scale: 0.82 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    id={`complete-unit-${u.id}`}
                    className="icon-btn-round"
                    style={{
                      background: palette.border,
                      boxShadow: `0 3px 10px ${palette.border}55`
                    }}
                    onClick={() => onCompleteUnit(u.id)}
                    aria-label="復習を完了"
                  >
                    <Check size={18} color="#fff" strokeWidth={2.8} />
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.82 }}
                  id={`delete-unit-${u.id}`}
                  className="card-trash"
                  onClick={() => onAskDeleteUnit(u.id, u.name)}
                  aria-label="単元を削除"
                >
                  <Trash2 size={15} color="#C9C9D2" strokeWidth={2} />
                </motion.button>
              </div>

              {/* Final Choice Banner */}
              <AnimatePresence>
                {showFinal ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px dashed #EDEDF2',
                      overflow: 'hidden'
                    }}
                  >
                    <p className="text-xs" style={{ color: '#6B6B76', margin: '0 0 10px 0' }}>
                      最後の復習が完了しました。このあと、どうしますか？
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ scale: 1.02 }}
                        id={`final-pick-end-${u.id}`}
                        className="btn-outline"
                        style={{ borderColor: palette.border, color: palette.text }}
                        onClick={() => onRequestFinalPick(u.id, 'end')}
                      >
                        終了
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ scale: 1.02 }}
                        id={`final-pick-continue-${u.id}`}
                        className="btn-outline"
                        style={{
                          background: palette.border,
                          color: '#fff',
                          borderColor: palette.border
                        }}
                        onClick={() => onRequestFinalPick(u.id, 'continue')}
                      >
                        継続
                      </motion.button>
                    </div>
                  </motion.div>
                ) : isLastStep ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs"
                    style={{ margin: '8px 0 0 0', color: '#6B6B76' }}
                  >
                    これが最後の復習です
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
