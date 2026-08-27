import React from 'react';
import { Calendar, Settings as SettingsIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatJP, getToday } from '../utils/date';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  dayCutoffHour: number;
  onOpenSettings: () => void;
}

const TAB_TITLES: Record<TabType, string> = {
  review: "今日の復習",
  new: "今日の新規学習",
  someday: "余裕があれば",
  calendar: "カレンダー"
};

export const Header: React.FC<HeaderProps> = ({ activeTab, dayCutoffHour, onOpenSettings }) => {
  const today = getToday(dayCutoffHour);

  return (
    <div id="header">
      <div>
        <div style={{ position: 'relative', minHeight: '26px', display: 'flex', alignItems: 'center' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={activeTab}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              id="header-title"
              style={{
                margin: 0,
                whiteSpace: 'nowrap',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1.2
              }}
            >
              {TAB_TITLES[activeTab]}
            </motion.h1>
          </AnimatePresence>
        </div>
        <div className="date-badge" id="header-date">
          <Calendar size={13} strokeWidth={2} />
          <span>{formatJP(today)}</span>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.86, rotate: 45 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        id="settings-btn"
        onClick={onOpenSettings}
        aria-label="設定を開く"
      >
        <SettingsIcon size={20} strokeWidth={1.8} />
      </motion.button>
    </div>
  );
};
