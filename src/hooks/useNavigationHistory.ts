import React, { useEffect, useRef } from 'react';
import { ConfirmModalData, DeleteConfirmData, MemoModalData, SubTabType, TabType } from '../types';

interface UseNavigationHistoryProps {
  activeTab: TabType;

  // Global & common modals
  settingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  presetModalOpen: boolean;
  setPresetModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  classEditModalOpen: boolean;
  setClassEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteConfirm: DeleteConfirmData | null;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmData | null>>;

  // Review tab sub-states
  confirmModal: ConfirmModalData | null;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalData | null>>;
  memoEditModal: MemoModalData | null;
  setMemoEditModal: React.Dispatch<React.SetStateAction<MemoModalData | null>>;
  finalChoiceId: string | null;
  setFinalChoiceId: React.Dispatch<React.SetStateAction<string | null>>;

  // New tab sub-states
  newSubTab: SubTabType;
  setNewSubTab: React.Dispatch<React.SetStateAction<SubTabType>>;

  // Calendar tab sub-states
  calendarDayModal: string | null;
  setCalendarDayModal: React.Dispatch<React.SetStateAction<string | null>>;
  calendarSearchQuery: string;
  setCalendarSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function useNavigationHistory({
  activeTab,
  settingsOpen,
  setSettingsOpen,
  presetModalOpen,
  setPresetModalOpen,
  classEditModalOpen,
  setClassEditModalOpen,
  deleteConfirm,
  setDeleteConfirm,
  confirmModal,
  setConfirmModal,
  memoEditModal,
  setMemoEditModal,
  finalChoiceId,
  setFinalChoiceId,
  newSubTab,
  setNewSubTab,
  calendarDayModal,
  setCalendarDayModal,
  calendarSearchQuery,
  setCalendarSearchQuery
}: UseNavigationHistoryProps) {
  // Live refs to avoid stale closures in window popstate event listener
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const settingsOpenRef = useRef(settingsOpen);
  settingsOpenRef.current = settingsOpen;

  const presetModalOpenRef = useRef(presetModalOpen);
  presetModalOpenRef.current = presetModalOpen;

  const classEditModalOpenRef = useRef(classEditModalOpen);
  classEditModalOpenRef.current = classEditModalOpen;

  const deleteConfirmRef = useRef(deleteConfirm);
  deleteConfirmRef.current = deleteConfirm;

  const confirmModalRef = useRef(confirmModal);
  confirmModalRef.current = confirmModal;

  const memoEditModalRef = useRef(memoEditModal);
  memoEditModalRef.current = memoEditModal;

  const finalChoiceIdRef = useRef(finalChoiceId);
  finalChoiceIdRef.current = finalChoiceId;

  const newSubTabRef = useRef(newSubTab);
  newSubTabRef.current = newSubTab;

  const calendarDayModalRef = useRef(calendarDayModal);
  calendarDayModalRef.current = calendarDayModal;

  const calendarSearchQueryRef = useRef(calendarSearchQuery);
  calendarSearchQueryRef.current = calendarSearchQuery;

  // Initialize history depth buffer on mount so back navigation is always trapped
  useEffect(() => {
    // Fill history buffer with dummy states
    for (let i = 0; i < 8; i++) {
      window.history.pushState({ trap: true, depth: i }, '');
    }

    const handlePopState = () => {
      // 1. Immediately replenish history stack to prevent tab closure / app exit on rapid clicks
      window.history.pushState({ trap: true }, '');
      window.history.pushState({ trap: true }, '');

      // 2. Global overlay 1: Delete confirmation modal
      if (deleteConfirmRef.current) {
        setDeleteConfirm(null);
        return;
      }

      // 3. Global overlay 2: Step final choice confirm modal
      if (confirmModalRef.current) {
        setConfirmModal(null);
        return;
      }

      // 4. Global overlay 3: Memo edit modal
      if (memoEditModalRef.current) {
        setMemoEditModal(null);
        return;
      }

      // 5. Global overlay 4: Calendar day detail modal
      if (calendarDayModalRef.current) {
        setCalendarDayModal(null);
        return;
      }

      // 6. Global overlay 5: Class edit modal
      if (classEditModalOpenRef.current) {
        setClassEditModalOpen(false);
        return;
      }

      // 7. Global overlay 6: Preset modal
      if (presetModalOpenRef.current) {
        setPresetModalOpen(false);
        return;
      }

      // 8. Global overlay 7: Settings modal
      if (settingsOpenRef.current) {
        setSettingsOpen(false);
        return;
      }

      // 9. Tab-specific non-default state unwinding (Step-by-step back to default within current tab):
      const currentTab = activeTabRef.current;

      // [New Tab]: Default is subTab 'add' ("当日学習の追加")
      if (currentTab === 'new') {
        if (newSubTabRef.current !== 'add') {
          setNewSubTab('add');
          return;
        }
      }

      // [Calendar Tab]: Default is no search query
      if (currentTab === 'calendar') {
        if (calendarSearchQueryRef.current.trim() !== '') {
          setCalendarSearchQuery('');
          return;
        }
      }

      // [Review Tab]: Default is no finalChoiceId active
      if (currentTab === 'review') {
        if (finalChoiceIdRef.current !== null) {
          setFinalChoiceId(null);
          return;
        }
      }

      // 10. Already at default state of current tab:
      // Empty loop (No-op) — Do not switch tabs, do not close the app, do not exit tab.
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    setDeleteConfirm,
    setConfirmModal,
    setMemoEditModal,
    setCalendarDayModal,
    setClassEditModalOpen,
    setPresetModalOpen,
    setSettingsOpen,
    setNewSubTab,
    setCalendarSearchQuery,
    setFinalChoiceId
  ]);
}
