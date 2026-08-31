import React, { useEffect, useRef } from 'react';
import { ConfirmModalData, DeleteConfirmData, MemoModalData, TabType } from '../types';

interface UseNavigationHistoryProps {
  activeTab: TabType;
  // Modals & dialogs state
  settingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  presetModalOpen: boolean;
  setPresetModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  classEditModalOpen: boolean;
  setClassEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  calendarDayModal: string | null;
  setCalendarDayModal: React.Dispatch<React.SetStateAction<string | null>>;
  memoEditModal: MemoModalData | null;
  setMemoEditModal: React.Dispatch<React.SetStateAction<MemoModalData | null>>;
  confirmModal: ConfirmModalData | null;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalData | null>>;
  deleteConfirm: DeleteConfirmData | null;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmData | null>>;
  finalChoiceId: string | null;
  setFinalChoiceId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useNavigationHistory({
  settingsOpen,
  setSettingsOpen,
  presetModalOpen,
  setPresetModalOpen,
  classEditModalOpen,
  setClassEditModalOpen,
  calendarDayModal,
  setCalendarDayModal,
  memoEditModal,
  setMemoEditModal,
  confirmModal,
  setConfirmModal,
  deleteConfirm,
  setDeleteConfirm,
  finalChoiceId,
  setFinalChoiceId,
}: UseNavigationHistoryProps) {
  // Keep live refs for all states to prevent stale closures in popstate handler
  const settingsOpenRef = useRef(settingsOpen);
  settingsOpenRef.current = settingsOpen;

  const presetModalOpenRef = useRef(presetModalOpen);
  presetModalOpenRef.current = presetModalOpen;

  const classEditModalOpenRef = useRef(classEditModalOpen);
  classEditModalOpenRef.current = classEditModalOpen;

  const calendarDayModalRef = useRef(calendarDayModal);
  calendarDayModalRef.current = calendarDayModal;

  const memoEditModalRef = useRef(memoEditModal);
  memoEditModalRef.current = memoEditModal;

  const confirmModalRef = useRef(confirmModal);
  confirmModalRef.current = confirmModal;

  const deleteConfirmRef = useRef(deleteConfirm);
  deleteConfirmRef.current = deleteConfirm;

  const finalChoiceIdRef = useRef(finalChoiceId);
  finalChoiceIdRef.current = finalChoiceId;

  // Initialize history trap on mount so back button is always intercepted
  useEffect(() => {
    // Push an initial trap state
    window.history.pushState({ app: 'stay' }, '');

    const handlePopState = (e: PopStateEvent) => {
      // Always immediately re-push history state to trap future back presses and prevent app exit
      window.history.pushState({ app: 'stay' }, '');

      // 1. Delete confirmation dialog -> close dialog
      if (deleteConfirmRef.current) {
        setDeleteConfirm(null);
        return;
      }

      // 2. Final choice confirmation dialog -> close dialog
      if (confirmModalRef.current) {
        setConfirmModal(null);
        return;
      }

      // 3. Memo edit modal -> close modal
      if (memoEditModalRef.current) {
        setMemoEditModal(null);
        return;
      }

      // 4. Calendar Day Detail modal -> close modal
      if (calendarDayModalRef.current) {
        setCalendarDayModal(null);
        return;
      }

      // 5. Class Edit modal -> close modal
      if (classEditModalOpenRef.current) {
        setClassEditModalOpen(false);
        return;
      }

      // 6. Preset modal -> close modal
      if (presetModalOpenRef.current) {
        setPresetModalOpen(false);
        return;
      }

      // 7. Settings modal -> close modal
      if (settingsOpenRef.current) {
        setSettingsOpen(false);
        return;
      }

      // 8. Step-card final choice buttons selection -> cancel selection
      if (finalChoiceIdRef.current) {
        setFinalChoiceId(null);
        return;
      }

      // 9. If already in default state of current tab:
      // Do nothing! Do not change tabs, do not exit app.
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
    setFinalChoiceId,
  ]);
}
