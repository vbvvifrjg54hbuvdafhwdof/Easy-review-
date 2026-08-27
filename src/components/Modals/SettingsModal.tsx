import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { HolidayRange } from '../../types';
import { formatJP } from '../../utils/date';

interface SettingsModalProps {
  dayCutoffHour: number;
  holidayRanges: HolidayRange[];
  onClose: () => void;
  onUpdateDayCutoff: (hour: number) => void;
  onAddHolidayRange: (start: string, end: string) => void;
  onAskDeleteHolidayRange: (id: string, label: string) => void;
  onOpenPresetModal: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  dayCutoffHour,
  holidayRanges,
  onClose,
  onUpdateDayCutoff,
  onAddHolidayRange,
  onAskDeleteHolidayRange,
  onOpenPresetModal,
  onExportData,
  onImportData
}) => {
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddHolidayRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rangeStart || !rangeEnd) return;
    onAddHolidayRange(rangeStart, rangeEnd);
    setRangeStart('');
    setRangeEnd('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportData(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="modal-backdrop bottom-sheet"
      id="settings-modal-backdrop"
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
        id="settings-modal-card"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>設定</h3>
          <motion.button
            whileTap={{ scale: 0.82 }}
            id="close-settings-btn"
            onClick={onClose}
            aria-label="設定を閉じる"
            style={{ padding: 4 }}
          >
            <X size={22} color="#6B6B76" strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* Day cutoff hour */}
        <p className="text-xs font-semibold" style={{ color: '#6B6B76', margin: '0 0 10px 0' }}>
          1日の切り替え時刻
        </p>
        <p className="text-xs" style={{ color: '#B5B5C0', margin: '0 0 10px 0', lineHeight: '1.6' }}>
          深夜に学習する場合も、ここで設定した時刻までは「前日」として扱われます。
        </p>
        <select
          id="day-cutoff-select"
          className="input-smart"
          style={{ width: '100%', marginBottom: '22px' }}
          value={dayCutoffHour}
          onChange={(e) => onUpdateDayCutoff(parseInt(e.target.value, 10) || 0)}
        >
          {[0, 1, 2, 3, 4, 5].map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </select>

        {/* Vacation holiday range bulk settings */}
        <p className="text-xs font-semibold" style={{ color: '#6B6B76', margin: '0 0 10px 0' }}>
          休暇期間の一括設定
        </p>
        <form onSubmit={handleAddHolidayRangeSubmit} style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '10px'
            }}
          >
            <div className="field">
              <label htmlFor="holiday-range-start">開始日</label>
              <input
                type="date"
                id="holiday-range-start"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="holiday-range-end">終了日</label>
              <input
                type="date"
                id="holiday-range-end"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            id="add-holiday-range-btn"
            className="btn-primary"
            style={{
              background: '#fff',
              border: '1.5px solid #6495ED',
              color: '#3D5FBF',
              boxShadow: 'none'
            }}
          >
            この期間を休みにする
          </motion.button>
        </form>

        {holidayRanges.length > 0 ? (
          <div style={{ marginBottom: '8px' }}>
            {holidayRanges.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                id={`holiday-range-item-${r.id}`}
                className="flex items-center justify-between"
                style={{
                  padding: '9px 12px',
                  borderRadius: '14px',
                  background: 'var(--bg)',
                  marginBottom: '6px'
                }}
              >
                <span className="text-xs font-semibold">
                  {formatJP(r.start)} 〜 {formatJP(r.end)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.82 }}
                  id={`delete-holiday-range-${r.id}`}
                  className="card-trash"
                  onClick={() =>
                    onAskDeleteHolidayRange(r.id, `${formatJP(r.start)}〜${formatJP(r.end)}`)
                  }
                  aria-label="休暇期間を削除"
                >
                  <Trash2 size={14} color="#C15C7C" strokeWidth={2} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: '#B5B5C0', marginBottom: '6px' }}>
            長期休暇の期間はまだ設定されていません。
          </p>
        )}
        <p
          className="text-xs"
          style={{ color: '#B5B5C0', margin: '8px 0 22px 0', lineHeight: '1.6' }}
        >
          ※休止期間中の授業からは復習が一切発生しません。
        </p>

        {/* Preset management button */}
        <p className="text-xs font-semibold" style={{ color: '#6B6B76', margin: '0 0 10px 0' }}>
          復習プリセットの管理
        </p>
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.01 }}
          id="settings-open-presets-btn"
          className="btn-primary"
          style={{
            background: '#fff',
            border: '1.5px solid #6495ED',
            color: '#3D5FBF',
            marginBottom: '22px',
            boxShadow: 'none'
          }}
          onClick={onOpenPresetModal}
        >
          プリセットを編集する
        </motion.button>

        {/* Backup and Restore */}
        <p className="text-xs font-semibold" style={{ color: '#6B6B76', margin: '0 0 10px 0' }}>
          データのバックアップ・復元
        </p>
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.01 }}
          id="export-data-btn"
          className="btn-primary"
          style={{
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onClick={onExportData}
        >
          <Download size={16} color="#fff" strokeWidth={2.4} /> データを書き出す（バックアップ）
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.01 }}
          id="import-data-btn"
          className="btn-primary"
          style={{
            background: '#fff',
            border: '1.5px solid #EDEDF2',
            color: '#2B2B33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: 'none'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} color="#2B2B33" strokeWidth={2.4} /> データを読み込む（復元）
        </motion.button>
        <input
          type="file"
          id="import-file-input"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </motion.div>
    </motion.div>
  );
};
