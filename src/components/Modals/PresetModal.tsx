import React, { useState } from 'react';
import { X, Pencil, Trash2, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Preset, PresetDraft } from '../../types';

interface PresetModalProps {
  presets: Preset[];
  draft: PresetDraft;
  onClose: () => void;
  onSavePreset: (draft: PresetDraft) => void;
  onEditPreset: (preset: Preset) => void;
  onAskDeletePreset: (id: string, name: string) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  presets,
  draft,
  onClose,
  onSavePreset,
  onEditPreset,
  onAskDeletePreset
}) => {
  const [name, setName] = useState(draft.name);
  const [steps, setSteps] = useState<number[]>(draft.steps.length > 0 ? draft.steps : [1]);
  const [editId, setEditId] = useState<string | null>(draft.id);

  React.useEffect(() => {
    setName(draft.name);
    setSteps(draft.steps.length > 0 ? draft.steps : [1]);
    setEditId(draft.id);
  }, [draft]);

  const handleStepChange = (index: number, val: number) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = Math.max(1, val || 1);
      return next;
    });
  };

  const handleAddStep = () => {
    setSteps((prev) => {
      let nextVal = 1;
      if (prev.length === 0) nextVal = 1;
      else if (prev.length === 1) nextVal = 7;
      else if (prev.length === 2) nextVal = 14;
      else if (prev.length === 3) nextVal = 30;
      else {
        const lastV = prev[prev.length - 1] || 30;
        nextVal = lastV + 30;
      }
      return [...prev, nextVal];
    });
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || steps.length === 0) return;
    onSavePreset({
      id: editId,
      name: name.trim(),
      steps: steps.map((s) => Math.max(1, s || 1))
    });
    setName('');
    setSteps([1]);
    setEditId(null);
  };

  const handleEditClick = (p: Preset) => {
    setEditId(p.id);
    setName(p.name);
    setSteps([...p.steps]);
    onEditPreset(p);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="modal-backdrop bottom-sheet"
      id="preset-modal-backdrop"
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
        id="preset-modal-card"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
          <h3 style={{ margin: 0 }}>復習プリセット</h3>
          <motion.button
            whileTap={{ scale: 0.82 }}
            id="close-preset-modal-btn"
            onClick={onClose}
            aria-label="プリセットモーダルを閉じる"
            style={{ padding: 4 }}
          >
            <X size={22} color="#6B6B76" strokeWidth={2.2} />
          </motion.button>
        </div>

        {presets.length > 0 && (
          <div style={{ marginBottom: '16px' }} id="preset-list">
            <AnimatePresence mode="popLayout">
              {presets.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  id={`preset-row-${p.id}`}
                  className="preset-row"
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ margin: 0 }}>
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ margin: '2px 0 0 0', color: '#6B6B76' }}>
                      {p.steps.join('日 → ')}日後
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      id={`edit-preset-btn-${p.id}`}
                      onClick={() => handleEditClick(p)}
                      aria-label="プリセットを編集"
                    >
                      <Pencil size={15} color="#6495ED" strokeWidth={2} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      id={`delete-preset-btn-${p.id}`}
                      onClick={() => onAskDeletePreset(p.id, p.name)}
                      aria-label="プリセットを削除"
                    >
                      <Trash2 size={15} color="#C15C7C" strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <form onSubmit={handleSaveSubmit} style={{ borderTop: '1px solid #EDEDF2', paddingTop: '14px' }}>
          <div className="field" style={{ marginBottom: '14px' }}>
            <label htmlFor="preset-name-input">プリセット名</label>
            <input
              type="text"
              id="preset-name-input"
              placeholder="例：標準復習"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <p className="text-xs font-semibold" style={{ color: '#6B6B76', margin: '0 0 8px 0' }}>
            復習ステップ（何日後に復習するか）
          </p>

          <AnimatePresence>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="step-row"
              >
                <span className="step-label">{i + 1}回目</span>
                <input
                  type="number"
                  min={1}
                  id={`preset-step-input-${i}`}
                  value={s}
                  onChange={(e) => handleStepChange(i, parseInt(e.target.value, 10) || 1)}
                  required
                />
                <span className="text-xs" style={{ color: '#6B6B76' }}>
                  日後
                </span>
                {steps.length > 1 && (
                  <motion.button
                    whileTap={{ scale: 0.82 }}
                    type="button"
                    id={`remove-step-${i}`}
                    onClick={() => handleRemoveStep(i)}
                    aria-label="ステップを削除"
                  >
                    <Trash2 size={15} color="#C15C7C" strokeWidth={2} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.01 }}
            type="button"
            id="add-preset-step-btn"
            className="btn-primary"
            style={{
              background: '#fff',
              border: '1.5px dashed #6495ED',
              color: '#3D5FBF',
              marginBottom: '18px',
              marginTop: '10px',
              boxShadow: 'none'
            }}
            onClick={handleAddStep}
          >
            <Plus size={15} color="#3D5FBF" strokeWidth={2.4} /> {steps.length + 1}回目のステップを追加
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            id="save-preset-submit-btn"
            className="btn-primary"
            disabled={!name.trim()}
          >
            {editId ? 'このプリセットを更新' : 'このプリセットを保存'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};
