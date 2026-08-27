import React, { useState } from 'react';
import { Coffee, Check, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Preset, SomedayItem } from '../types';

interface SomedayTabProps {
  somedayItems: SomedayItem[];
  presets: Preset[];
  onAddSomeday: (name: string, presetId: string) => void;
  onCompleteSomeday: (id: string) => void;
  onAskDeleteSomeday: (id: string, name: string) => void;
}

export const SomedayTab: React.FC<SomedayTabProps> = ({
  somedayItems,
  presets,
  onAddSomeday,
  onCompleteSomeday,
  onAskDeleteSomeday
}) => {
  const [name, setName] = useState('');
  const [presetId, setPresetId] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSomeday(name, presetId);
    setName('');
  };

  return (
    <div style={{ padding: '16px 16px 28px 16px' }} id="someday-tab-content">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="unit-card flex items-start gap-2"
        style={{
          background: '#FFFCE0',
          border: '1.5px solid #FFF450',
          marginBottom: '16px'
        }}
      >
        <Coffee size={16} color="#8A7B00" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs leading-relaxed" style={{ margin: 0, color: '#8A7B00' }}>
          ここでの完了は本来の復習スケジュールには影響しません。余力があるときだけどうぞ。完了すると、選んだプリセットの2回目以降が自動で「今日の復習」に登録されます。
        </p>
      </motion.div>

      <form onSubmit={handleAddSubmit}>
        <div className="field" style={{ marginBottom: '10px' }}>
          <label htmlFor="someday-name">単元名</label>
          <input
            type="text"
            id="someday-name"
            placeholder="例：リスニング教材を1本聴く"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field" style={{ marginBottom: '16px' }}>
          <label htmlFor="someday-preset">復習プリセット（任意）</label>
          <select
            id="someday-preset"
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
          >
            <option value="">選択しない（この場限り）</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}（{p.steps.join('・')}日後）
              </option>
            ))}
          </select>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          type="submit"
          id="submit-add-someday-btn"
          className="btn-primary"
          style={{
            background: '#FFF450',
            color: '#8A7B00',
            marginBottom: '20px',
            boxShadow: '0 3px 10px rgba(255, 244, 80, 0.45)'
          }}
        >
          追加する
        </motion.button>
      </form>

      {somedayItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="empty-state"
          style={{ padding: '45px 20px' }}
          id="someday-empty-state"
        >
          <Coffee size={32} color="#B5B5C0" strokeWidth={1.8} />
          <p>まだ項目がありません。</p>
        </motion.div>
      ) : (
        <div id="someday-list">
          <AnimatePresence mode="popLayout">
            {somedayItems.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, x: 30, transition: { duration: 0.2 } }}
                transition={{
                  layout: { type: 'spring', stiffness: 450, damping: 32 },
                  y: { type: 'spring', stiffness: 450, damping: 30 }
                }}
                id={`someday-item-${it.id}`}
                className="flex items-center gap-3"
                style={{
                  padding: '12px',
                  borderRadius: '16px',
                  border: '1.5px solid #FFF450',
                  marginBottom: '8px',
                  background: '#fff',
                  boxShadow: '0 2px 6px rgba(43, 43, 51, 0.04)'
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.82 }}
                  whileHover={{ scale: 1.08 }}
                  id={`complete-someday-${it.id}`}
                  className="icon-btn-round"
                  style={{
                    width: 36,
                    height: 36,
                    background: '#FFF450',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(255, 244, 80, 0.5)'
                  }}
                  onClick={() => onCompleteSomeday(it.id)}
                  aria-label="余裕項目を完了"
                >
                  <Check size={16} color="#8A7B00" strokeWidth={2.8} />
                </motion.button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ margin: 0, color: '#2B2B33' }}>
                    {it.name}
                  </p>
                  {it.presetName && (
                    <p className="text-xs" style={{ margin: '2px 0 0 0', color: '#6B6B76' }}>
                      {it.presetName}
                    </p>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.82 }}
                  id={`delete-someday-${it.id}`}
                  className="card-trash"
                  onClick={() => onAskDeleteSomeday(it.id, it.name)}
                  aria-label="余裕項目を削除"
                >
                  <Trash2 size={15} color="#C9C9D2" strokeWidth={2} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
