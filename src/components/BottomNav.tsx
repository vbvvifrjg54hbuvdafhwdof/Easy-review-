import React from 'react';
import { RefreshCw, PlusCircle, Coffee, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  reviewBadge: number;
  stockBadge: number;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  reviewBadge,
  stockBadge,
  onSelectTab
}) => {
  const tabs = [
    { key: 'review' as TabType, label: '今日の復習', icon: RefreshCw, badge: reviewBadge },
    { key: 'new' as TabType, label: '新規学習', icon: PlusCircle, badge: stockBadge },
    { key: 'someday' as TabType, label: '余裕があれば', icon: Coffee, badge: 0 },
    { key: 'calendar' as TabType, label: 'カレンダー', icon: Calendar, badge: 0 }
  ];

  return (
    <div id="bottomnav">
      {tabs.map((t) => {
        const IconComponent = t.icon;
        const isActive = activeTab === t.key;
        return (
          <motion.button
            key={t.key}
            whileTap={{ scale: 0.88 }}
            id={`nav-btn-${t.key}`}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(t.key)}
            style={{ position: 'relative' }}
          >
            {/* Smooth animated active pill background */}
            {isActive && (
              <motion.div
                layoutId="activeBottomTabPill"
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 32,
                  mass: 0.7
                }}
                style={{
                  position: 'absolute',
                  inset: '4px 6px',
                  background: 'var(--blueSoft)',
                  borderRadius: '16px',
                  zIndex: 0
                }}
              />
            )}

            <div className="nav-icon-wrap" style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive && t.key === 'review' ? -180 : 0
                }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 22
                }}
              >
                <IconComponent
                  size={20}
                  color={isActive ? '#3D5FBF' : '#9E9EA8'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              {t.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  id={`badge-${t.key}`}
                  className="badge"
                >
                  {t.badge}
                </motion.span>
              )}
            </div>
            <span
              className="nav-label"
              style={{
                position: 'relative',
                zIndex: 1,
                color: isActive ? '#3D5FBF' : undefined
              }}
            >
              {t.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
