import React, { useCallback, useEffect, useRef } from 'react';
import { ConfirmModalData, DeleteConfirmData, MemoModalData, TabType } from '../types';

interface UseNavigationHistoryProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setTabDirection: (dir: number) => void;
  prevTabRef: React.MutableRefObject<TabType>;
  tabIndexMap: Record<TabType, number>;

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

  showToast: (msg: string) => void;
}

export function useNavigationHistory({
  activeTab,
  setActiveTab,
  setTabDirection,
  prevTabRef,
  tabIndexMap,
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
  showToast
}: UseNavigationHistoryProps) {
  // Keep live refs for all states to prevent stale closures in popstate handler
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

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

  const lastExitPromptTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Tab navigation history stack to trace previous tabs gracefully
  const tabHistoryRef = useRef<TabType[]>([activeTab]);

  // Initial history state setup on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      // Guard layer 0: Used for double-back exit confirmation
      window.history.replaceState({ guard: 0, tab: activeTab }, '');
      // Active layer 1: The real working root level
      window.history.pushState({ guard: 1, tab: activeTab }, '');
    }
  }, []);

  // Back action dispatcher: Closes active top-level overlay with history sync
  const goBackOrClose = useCallback(() => {
    window.history.back();
  }, []);

  // Open helper with pushState
  const pushModalState = useCallback((name: string, extra?: Record<string, any>) => {
    window.history.pushState(
      {
        modal: name,
        tab: activeTabRef.current,
        ...extra
      },
      ''
    );
  }, []);

  // Listen to browser popstate (back button / swipe back gesture)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // 1. Check Delete Confirm dialog
      if (deleteConfirmRef.current) {
        setDeleteConfirm(null);
        return;
      }

      // 2. Check Final choice confirm modal
      if (confirmModalRef.current) {
        setConfirmModal(null);
        return;
      }

      // 3. Check Memo edit modal
      if (memoEditModalRef.current) {
        setMemoEditModal(null);
        return;
      }

      // 4. Check Calendar Day Detail modal
      if (calendarDayModalRef.current) {
        setCalendarDayModal(null);
        return;
      }

      // 5. Check Class Edit modal
      if (classEditModalOpenRef.current) {
        setClassEditModalOpen(false);
        return;
      }

      // 6. Check Preset modal
      if (presetModalOpenRef.current) {
        setPresetModalOpen(false);
        return;
      }

      // 7. Check Settings modal
      if (settingsOpenRef.current) {
        setSettingsOpen(false);
        return;
      }

      // 8. Check finalChoiceId selection state
      if (finalChoiceIdRef.current) {
        setFinalChoiceId(null);
        return;
      }

      // 9. Check tab restoration from history state
      const state = e.state;
      if (state && state.tab && state.tab !== activeTabRef.current) {
        const targetTab = state.tab as TabType;
        const oldIdx = tabIndexMap[activeTabRef.current] ?? 0;
        const newIdx = tabIndexMap[targetTab] ?? 0;
        setTabDirection(newIdx > oldIdx ? 1 : -1);
        prevTabRef.current = activeTabRef.current;
        setActiveTab(targetTab);
        return;
      }

      // If we are in another tab other than 'review' without history state, go back to previous tab or 'review'
      if (activeTabRef.current !== 'review') {
        if (tabHistoryRef.current.length > 1) {
          tabHistoryRef.current.pop(); // Remove current
          const prevTab = tabHistoryRef.current[tabHistoryRef.current.length - 1] || 'review';
          const oldIdx = tabIndexMap[activeTabRef.current] ?? 0;
          const newIdx = tabIndexMap[prevTab] ?? 0;
          setTabDirection(newIdx > oldIdx ? 1 : -1);
          prevTabRef.current = activeTabRef.current;
          setActiveTab(prevTab);
        } else {
          const oldIdx = tabIndexMap[activeTabRef.current] ?? 0;
          setTabDirection(-1);
          prevTabRef.current = activeTabRef.current;
          setActiveTab('review');
        }
        return;
      }

      // 10. We are at root (Review tab, nothing open). Guard against accidental exit.
      const now = Date.now();
      if (now - lastExitPromptTimeRef.current < 2200) {
        // Double back pressed within 2.2s -> allow browser to exit / close
        window.history.back();
      } else {
        lastExitPromptTimeRef.current = now;
        showToast('もう一度「戻る」を押すとアプリを終了します');
        // Push guard back so next single press prompts again or exits if immediate
        window.history.pushState({ guard: 1, tab: 'review' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    tabIndexMap,
    setActiveTab,
    setTabDirection,
    prevTabRef,
    setDeleteConfirm,
    setConfirmModal,
    setMemoEditModal,
    setCalendarDayModal,
    setClassEditModalOpen,
    setPresetModalOpen,
    setSettingsOpen,
    setFinalChoiceId,
    showToast
  ]);

  const handleTabChangeWithHistory = useCallback(
    (newTab: TabType) => {
      if (newTab === activeTabRef.current) return;
      const oldIdx = tabIndexMap[activeTabRef.current] ?? 0;
      const newIdx = tabIndexMap[newTab] ?? 0;
      setTabDirection(newIdx > oldIdx ? 1 : -1);
      prevTabRef.current = activeTabRef.current;
      setActiveTab(newTab);
      setFinalChoiceId(null);

      // Track tab stack
      tabHistoryRef.current.push(newTab);
      // Push history state
      window.history.pushState({ tab: newTab }, '');
    },
    [tabIndexMap, setActiveTab, setTabDirection, prevTabRef, setFinalChoiceId]
  );

  return {
    goBackOrClose,
    pushModalState,
    handleTabChangeWithHistory
  };
}
