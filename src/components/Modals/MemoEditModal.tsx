import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { Unit } from '../../types';

interface MemoEditModalProps {
  unit: Unit | undefined;
  onClose: () => void;
  onSaveMemo: (unitId: string, memo: string) => void;
}

export const MemoEditModal: React.FC<MemoEditModalProps> = ({ unit, onClose, onSaveMemo }) => {
  const [memo, setMemo] = useState(unit?.memo || '');

  React.useEffect(() => {
    setMemo(unit?.memo || '');
  }, [unit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;
    onSaveMemo(unit.id, memo);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="modal-backdrop bottom-sheet"
      id="memo-modal-backdrop"
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
        id="memo-modal-card"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>一言メモの編集</h3>
          <motion.button
            whileTap={{ scale: 0.82 }}
            id="close-memo-modal-btn"
            onClick={onClose}
            aria-label="メモ編集を閉じる"
            style={{ padding: 4 }}
          >
            <X size={22} color="#6B6B76" strokeWidth={2.2} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: '18px' }}>
            <label htmlFor="memo-edit-input">メモ内容（{unit?.name}）</label>
            <input
              type="text"
              id="memo-edit-input"
              value={memo}
              placeholder="例：P.12〜15"
              onChange={(e) => setMemo(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              id="cancel-memo-btn"
              className="btn-outline"
              onClick={onClose}
            >
              キャンセル
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              id="save-memo-btn"
              className="btn-primary"
              style={{ flex: 1 }}
            >
              保存する
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
