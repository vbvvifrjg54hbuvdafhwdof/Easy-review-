import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ConfirmModalData, DeleteConfirmData, Unit } from '../../types';

interface ConfirmDialogsProps {
  confirmModal: ConfirmModalData | null;
  deleteConfirm: DeleteConfirmData | null;
  findUnit: (id: string) => Unit | undefined;
  onCancelFinalChoice: () => void;
  onExecuteFinalChoice: () => void;
  onCancelDelete: () => void;
  onExecuteDelete: () => void;
}

export const ConfirmDialogs: React.FC<ConfirmDialogsProps> = ({
  confirmModal,
  deleteConfirm,
  findUnit,
  onCancelFinalChoice,
  onExecuteFinalChoice,
  onCancelDelete,
  onExecuteDelete
}) => {
  return (
    <AnimatePresence>
      {/* Final Step Choice Confirmation Modal */}
      {confirmModal && (
        <motion.div
          key="final-choice-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-backdrop"
          id="final-choice-confirm-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancelFinalChoice();
          }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.7 }}
            className="modal-card"
            id="final-choice-confirm-card"
          >
            <h3>{confirmModal.type === 'end' ? '本当に終了しますか？' : '本当に継続しますか？'}</h3>
            {confirmModal.type === 'end' ? (
              <p className="desc">
                「{findUnit(confirmModal.unitId)?.name || 'この単元'}
                」の復習をここで終了し、一覧から削除します。この操作は取り消せません。
              </p>
            ) : (
              <p className="desc">
                「{findUnit(confirmModal.unitId)?.name || 'この単元'}」を最後の間隔（
                {findUnit(confirmModal.unitId)?.steps[
                  (findUnit(confirmModal.unitId)?.steps.length || 1) - 1
                ] || 1}
                日）と同じ日数後に、もう一度復習として設定します。
              </p>
            )}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.94 }}
                id="cancel-final-choice-btn"
                className="btn-outline"
                onClick={onCancelFinalChoice}
              >
                キャンセル
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                id="confirm-final-choice-btn"
                className="btn-outline"
                style={{
                  background: confirmModal.type === 'end' ? '#E5707D' : '#6495ED',
                  color: '#fff',
                  borderColor: 'transparent'
                }}
                onClick={onExecuteFinalChoice}
              >
                {confirmModal.type === 'end' ? '終了する' : '継続する'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          key="delete-confirm-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-backdrop"
          id="delete-confirm-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancelDelete();
          }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.7 }}
            className="modal-card"
            id="delete-confirm-card"
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
              <AlertTriangle size={20} color="#C15C7C" strokeWidth={2.4} />
              <h3 style={{ margin: 0 }}>
                {deleteConfirm.kind === 'color'
                  ? '本当にこのカラーを削除しますか？'
                  : '本当に削除しますか？'}
              </h3>
            </div>
            <p className="desc">
              「{deleteConfirm.label || 'この項目'}」を削除します。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.94 }}
                id="cancel-delete-confirm-btn"
                className="btn-outline"
                onClick={onCancelDelete}
              >
                キャンセル
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                id="execute-delete-confirm-btn"
                className="btn-outline"
                style={{ background: '#E5707D', color: '#fff', borderColor: 'transparent' }}
                onClick={onExecuteDelete}
              >
                削除する
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
