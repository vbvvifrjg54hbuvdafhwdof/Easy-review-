import React, { useState } from 'react';
import { Plus, Check, Trash2, Pencil, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CustomColor,
  PendingStockItem,
  PeriodTimes,
  Preset,
  SubTabType
} from '../types';
import { colorFor } from '../utils/color';
import { getPeriods, getToday } from '../utils/date';

interface NewTabProps {
  presets: Preset[];
  periodCount: number;
  periodTimes: PeriodTimes;
  pendingStockItems: PendingStockItem[];
  customColors: CustomColor[];
  dayCutoffHour: number;
  onAddUnit: (name: string, date: string, presetId: string, memo: string) => void;
  onOpenPresetModal: () => void;
  onOpenClassEditModal: () => void;
  onRegisterStockItem: (
    scheduleId: string,
    name: string,
    memo: string,
    presetId: string
  ) => void;
  onAskDeleteStock: (scheduleId: string, label: string) => void;
  onPeriodCountDelta: (delta: number) => void;
  onSavePeriodTimes: (times: PeriodTimes) => void;
  onResetPeriodTimes: () => void;
}

export const NewTab: React.FC<NewTabProps> = ({
  presets,
  periodCount,
  periodTimes,
  pendingStockItems,
  customColors,
  dayCutoffHour,
  onAddUnit,
  onOpenPresetModal,
  onOpenClassEditModal,
  onRegisterStockItem,
  onAskDeleteStock,
  onPeriodCountDelta,
  onSavePeriodTimes,
  onResetPeriodTimes
}) => {
  const [subTab, setSubTab] = useState<SubTabType>('add');
  const today = getToday(dayCutoffHour);

  // Add unit form state
  const [unitName, setUnitName] = useState('');
  const [unitMemo, setUnitMemo] = useState('');
  const [unitDate, setUnitDate] = useState(today);
  const [unitPresetId, setUnitPresetId] = useState(presets[0]?.id || '');

  // Pending stock inputs state
  const [stockInputs, setStockInputs] = useState<
    Record<string, { name: string; memo: string; presetId: string }>
  >({});

  // Period times editable state
  const [localPeriodTimes, setLocalPeriodTimes] = useState<PeriodTimes>(periodTimes);

  React.useEffect(() => {
    setLocalPeriodTimes(periodTimes);
  }, [periodTimes]);

  const handleStockInputChange = (
    scheduleId: string,
    field: 'name' | 'memo' | 'presetId',
    val: string
  ) => {
    setStockInputs((prev) => ({
      ...prev,
      [scheduleId]: {
        name: field === 'name' ? val : prev[scheduleId]?.name ?? '',
        memo: field === 'memo' ? val : prev[scheduleId]?.memo ?? '',
        presetId: field === 'presetId' ? val : prev[scheduleId]?.presetId ?? presets[0]?.id ?? ''
      }
    }));
  };

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;
    const selectedPreset = unitPresetId || presets[0]?.id;
    if (!selectedPreset) return;
    onAddUnit(unitName, unitDate || today, selectedPreset, unitMemo);
    setUnitName('');
    setUnitMemo('');
  };

  const periods = getPeriods(periodCount);

  return (
    <div style={{ paddingTop: '16px' }} id="new-tab-content">
      {/* Sub tabs switcher with smooth spring pill */}
      <div
        className="flex gap-1"
        style={{
          margin: '0 16px 16px 16px',
          padding: '4px',
          background: 'var(--bg)',
          borderRadius: 999,
          border: '1.5px solid var(--line)',
          position: 'relative'
        }}
      >
        <button
          type="button"
          id="subtab-add-btn"
          className="subtab-btn"
          onClick={() => setSubTab('add')}
          style={{
            position: 'relative',
            color: subTab === 'add' ? '#fff' : 'var(--inkSoft)'
          }}
        >
          {subTab === 'add' && (
            <motion.div
              layoutId="subTabIndicator"
              transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.7 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--blue)',
                borderRadius: 999,
                boxShadow: '0 2px 8px rgba(100, 149, 237, 0.35)',
                zIndex: 0
              }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>当日学習の追加</span>
        </button>

        <button
          type="button"
          id="subtab-schedule-btn"
          className="subtab-btn"
          onClick={() => setSubTab('schedule')}
          style={{
            position: 'relative',
            color: subTab === 'schedule' ? '#fff' : 'var(--inkSoft)'
          }}
        >
          {subTab === 'schedule' && (
            <motion.div
              layoutId="subTabIndicator"
              transition={{ type: 'spring', stiffness: 450, damping: 32, mass: 0.7 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--blue)',
                borderRadius: 999,
                boxShadow: '0 2px 8px rgba(100, 149, 237, 0.35)',
                zIndex: 0
              }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>授業スケジュール</span>
        </button>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {subTab === 'add' ? (
          <motion.div
            key="add-subtab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{ padding: '0 16px 28px 16px' }}
          >
            <p className="text-xs" style={{ color: '#6B6B76', margin: '0 0 18px 0' }}>
              入力はシンプルに。単元名と日付だけで登録できます。
            </p>

            {presets.length === 0 ? (
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="unit-card"
                style={{ background: '#FFFCE0', border: '1.5px solid #FFF450', marginBottom: '18px' }}
              >
                <p className="text-xs" style={{ margin: 0, color: '#8A7B00', lineHeight: '1.6' }}>
                  まだ復習プリセットがありません。先にプリセットを作成すると単元を追加できます。
                </p>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  id="create-preset-prompt-btn"
                  className="btn-primary"
                  style={{ marginTop: '12px' }}
                  onClick={onOpenPresetModal}
                >
                  <Plus size={15} color="#fff" strokeWidth={2.4} /> プリセットを作成する
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleAddUnitSubmit}>
                <div className="field" style={{ marginBottom: '16px' }}>
                  <label htmlFor="new-unit-name">単元名</label>
                  <input
                    type="text"
                    id="new-unit-name"
                    placeholder="例：英単語 Unit 4"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: '16px' }}>
                  <label htmlFor="new-unit-memo">一言メモ（任意）</label>
                  <input
                    type="text"
                    id="new-unit-memo"
                    placeholder="例：P.45〜50"
                    value={unitMemo}
                    onChange={(e) => setUnitMemo(e.target.value)}
                  />
                </div>

                <div className="field" style={{ marginBottom: '16px' }}>
                  <label htmlFor="new-unit-date">日付</label>
                  <input
                    type="date"
                    id="new-unit-date"
                    value={unitDate}
                    onChange={(e) => setUnitDate(e.target.value)}
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: '8px' }}>
                  <label htmlFor="new-unit-preset">復習プリセット</label>
                  <select
                    id="new-unit-preset"
                    value={unitPresetId || presets[0]?.id}
                    onChange={(e) => setUnitPresetId(e.target.value)}
                  >
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}（{p.steps.join('・')}日後）
                      </option>
                    ))}
                  </select>
                </div>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  id="open-preset-create-btn"
                  className="text-xs font-semibold"
                  style={{
                    color: '#3D5FBF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '20px',
                    padding: '6px 0'
                  }}
                  onClick={onOpenPresetModal}
                >
                  <Plus size={13} strokeWidth={2.4} /> 新しいプリセットを作成
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  type="submit"
                  id="submit-add-unit-btn"
                  className="btn-primary"
                  disabled={!unitName.trim()}
                >
                  追加する
                </motion.button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="schedule-subtab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{ padding: '0 16px 28px 16px' }}
          >
            {/* Pending Stock Section */}
            {pendingStockItems.length > 0 && (
              <motion.div
                layout
                id="pending-stock-section"
                style={{
                  marginBottom: '24px',
                  padding: '14px',
                  borderRadius: '18px',
                  background: '#F0F4FE',
                  border: '1.5px solid var(--blue)'
                }}
              >
                <div className="flex items-center gap-1_5" style={{ marginBottom: '10px' }}>
                  <Sparkles size={14} color="#3D5FBF" strokeWidth={2.2} />
                  <p className="text-xs font-bold" style={{ color: '#3D5FBF', margin: 0 }}>
                    完了した授業（復習に未登録）
                  </p>
                </div>
                <AnimatePresence mode="popLayout">
                  {pendingStockItems.map((item) => {
                    const c = colorFor(item.colorKey, customColors);
                    const currentName =
                      stockInputs[item.scheduleId]?.name !== undefined
                        ? stockInputs[item.scheduleId].name
                        : item.suggestedName;
                    const currentMemo = stockInputs[item.scheduleId]?.memo || '';
                    const currentPresetId =
                      stockInputs[item.scheduleId]?.presetId || presets[0]?.id || '';

                    return (
                      <motion.div
                        key={item.scheduleId}
                        layout
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, x: 30, transition: { duration: 0.22 } }}
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        id={`stock-card-${item.scheduleId}`}
                        className="unit-card"
                        style={{ border: `1.5px solid ${c.border || '#6495ED'}`, marginBottom: '10px' }}
                      >
                        <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                          <span
                            className="pill"
                            style={{ background: c.bg || '#EAF0FE', color: c.text || '#3D5FBF' }}
                          >
                            {item.subject}・{item.period}
                          </span>
                        </div>

                        <div className="field" style={{ marginBottom: '6px' }}>
                          <label style={{ fontSize: '11px' }}>単元名</label>
                          <input
                            type="text"
                            id={`stock-name-${item.scheduleId}`}
                            value={currentName}
                            onChange={(e) =>
                              handleStockInputChange(item.scheduleId, 'name', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              border: '1.5px solid var(--line)',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        <div className="field" style={{ marginBottom: '6px' }}>
                          <label style={{ fontSize: '11px' }}>一言メモ（任意）</label>
                          <input
                            type="text"
                            id={`stock-memo-${item.scheduleId}`}
                            placeholder="例：P.12〜15"
                            value={currentMemo}
                            onChange={(e) =>
                              handleStockInputChange(item.scheduleId, 'memo', e.target.value)
                            }
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              border: '1.5px solid var(--line)',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        {presets.length > 0 && (
                          <div className="field" style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '11px' }}>復習プリセット</label>
                            <select
                              id={`stock-preset-${item.scheduleId}`}
                              value={currentPresetId}
                              onChange={(e) =>
                                handleStockInputChange(item.scheduleId, 'presetId', e.target.value)
                              }
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '10px',
                                border: '1.5px solid var(--line)',
                                fontSize: '13px',
                                background: '#fff'
                              }}
                            >
                              {presets.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {presets.length > 0 ? (
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              whileHover={{ scale: 1.01 }}
                              id={`register-stock-${item.scheduleId}`}
                              className="btn-primary"
                              style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                padding: '9px'
                              }}
                              onClick={() =>
                                onRegisterStockItem(
                                  item.scheduleId,
                                  currentName,
                                  currentMemo,
                                  currentPresetId
                                )
                              }
                            >
                              <Check size={14} color="#fff" strokeWidth={2.6} /> 復習に追加
                            </motion.button>
                          ) : (
                            <p
                              className="text-xs"
                              style={{ flex: 1, color: '#B5B5C0', margin: 0, alignSelf: 'center' }}
                            >
                              プリセット作成後に登録できます
                            </p>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.86 }}
                            id={`delete-stock-${item.scheduleId}`}
                            className="card-trash"
                            style={{ width: 36, height: 36 }}
                            onClick={() =>
                              onAskDeleteStock(item.scheduleId, `${item.subject}・${item.period}`)
                            }
                            aria-label="ストックを破棄"
                          >
                            <Trash2 size={16} color="#C15C7C" strokeWidth={2} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            <p className="text-xs" style={{ color: '#6B6B76', margin: '0 0 18px 0' }}>
              授業の時限数・時間を設定してください。曜日ごとの時間割は下のボタンから行えます。
            </p>

            {/* Period count and times */}
            <div id="period-settings-section">
              <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                <p className="text-xs font-bold" style={{ color: '#6B6B76', margin: 0 }}>
                  時限数
                </p>
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
                <motion.button
                  whileTap={{ scale: 0.84 }}
                  type="button"
                  id="period-minus-btn"
                  className="icon-btn-round"
                  style={{ width: 36, height: 36, background: 'var(--bg)', color: '#3D5FBF', fontWeight: 700 }}
                  onClick={() => onPeriodCountDelta(-1)}
                >
                  －
                </motion.button>
                <motion.span
                  key={periods.length}
                  initial={{ scale: 1.25, color: 'var(--blueDark)' }}
                  animate={{ scale: 1, color: 'var(--ink)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="text-sm font-bold"
                  style={{ minWidth: 44, textAlign: 'center' }}
                >
                  {periods.length}限
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.84 }}
                  type="button"
                  id="period-plus-btn"
                  className="icon-btn-round"
                  style={{ width: 36, height: 36, background: 'var(--bg)', color: '#3D5FBF', fontWeight: 700 }}
                  onClick={() => onPeriodCountDelta(1)}
                >
                  ＋
                </motion.button>
                <span className="text-xs" style={{ color: '#B5B5C0' }}>
                  （最大10限）
                </span>
              </div>

              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <p className="text-xs font-bold" style={{ color: '#6B6B76', margin: 0 }}>
                  時限ごとの時間設定
                </p>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  id="reset-period-times-btn"
                  className="text-xs font-semibold"
                  style={{ color: '#3D5FBF', padding: '2px 6px' }}
                  onClick={onResetPeriodTimes}
                >
                  【初期値に戻す】
                </motion.button>
              </div>
              <p className="text-xs" style={{ color: '#B5B5C0', margin: '0 0 12px 0' }}>
                終了時刻を過ぎると、未登録の授業が上に自動で溜まります。
              </p>

              <AnimatePresence>
                {periods.map((p) => {
                  const pt = localPeriodTimes[p] || { start: '', end: '' };
                  return (
                    <motion.div
                      key={p}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="flex items-center gap-2"
                      style={{ marginBottom: '8px', overflow: 'hidden' }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ width: 36, flexShrink: 0, color: '#3D5FBF' }}
                      >
                        {p}
                      </span>
                      <input
                        type="time"
                        className="input-smart"
                        id={`period-start-${p}`}
                        value={pt.start}
                        onChange={(e) =>
                          setLocalPeriodTimes((prev) => ({
                            ...prev,
                            [p]: { start: e.target.value, end: prev[p]?.end || '' }
                          }))
                        }
                        style={{ flex: 1, padding: '9px 10px', fontSize: '13px', minWidth: 0 }}
                      />
                      <span className="text-xs" style={{ color: '#6B6B76' }}>
                        〜
                      </span>
                      <input
                        type="time"
                        className="input-smart"
                        id={`period-end-${p}`}
                        value={pt.end}
                        onChange={(e) =>
                          setLocalPeriodTimes((prev) => ({
                            ...prev,
                            [p]: { start: prev[p]?.start || '', end: e.target.value }
                          }))
                        }
                        style={{ flex: 1, padding: '9px 10px', fontSize: '13px', minWidth: 0 }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.01 }}
                id="save-period-times-btn"
                className="btn-primary"
                style={{ marginTop: '10px' }}
                onClick={() => onSavePeriodTimes(localPeriodTimes)}
              >
                時限の時間を保存する
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.01 }}
              id="open-class-schedule-modal-btn"
              className="btn-primary"
              style={{
                marginTop: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={onOpenClassEditModal}
            >
              <Pencil size={15} color="#fff" strokeWidth={2.4} /> 時間割（教科）を登録・編集
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
