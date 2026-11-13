/**
 * TÊN FILE: CompletionHistoryModal.jsx
 * CÔNG DỤNG: Hộp thoại hiển thị danh sách các mục tiêu đã hoàn thành gần đây và cho phép hoàn tác khôi phục lại mục tiêu nếu bấm nhầm.
 * PHẠM VI DÙNG: Phân hệ Customer (Dashboard).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCompletedGoalsHistory, toggleCheckGoal } from '../../../../shared/services/work.service.js';
import { formatRelativeTime, formatDateTime } from '../../../../shared/utils/dateFormat.js';
import styles from './CompletionHistoryModal.module.scss';

/**
 * Component Hộp thoại Lịch sử Hoàn thành mục tiêu.
 * @param {object} props - Gồm isOpen, onClose, onRestoreGoal
 */
export function CompletionHistoryModal({ isOpen, onClose, onRestoreGoal }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [restoringGoalIds, setRestoringGoalIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Tải danh sách các mục tiêu đã hoàn thành từ backend.
   */
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await fetchCompletedGoalsHistory(40);
      setHistoryList(data);
    } catch {
      setErrorMsg('Không thể tải lịch sử hoàn thành lúc này.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setSearchQuery('');
    }
  }, [isOpen, loadHistory]);

  /**
   * Hoàn tác khôi phục lại một mục tiêu đã hoàn thành nhầm.
   * @param {object} goal - Object mục tiêu cần khôi phục
   */
  const handleRestoreGoal = async (goal) => {
    const goalId = goal.goal_id;
    if (restoringGoalIds.has(goalId)) return;

    // Ghi nhận trạng thái đang xử lý
    setRestoringGoalIds((prev) => new Set(prev).add(goalId));
    setErrorMsg('');

    try {
      // Đảo ngược trạng thái hoàn thành từ true về false
      await toggleCheckGoal(goal.work_id, goalId);

      // Cập nhật trạng thái hiển thị trong danh sách modal
      setHistoryList((prev) =>
        prev.map((g) => (g.goal_id === goalId ? { ...g, is_restored: true } : g))
      );

      // Báo cho Dashboard biết để cập nhật lại danh sách mục tiêu cần làm
      if (onRestoreGoal) {
        onRestoreGoal(goal);
      }
    } catch {
      setErrorMsg('Không thể khôi phục mục tiêu. Vui lòng thử lại.');
    } finally {
      setRestoringGoalIds((prev) => {
        const next = new Set(prev);
        next.delete(goalId);
        return next;
      });
    }
  };

  /**
   * Lọc danh sách mục tiêu theo từ khóa tìm kiếm (tên goal hoặc tên work).
   */
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return historyList;
    const query = searchQuery.toLowerCase().trim();
    return historyList.filter(
      (item) =>
        item.goal_name.toLowerCase().includes(query) ||
        (item.work_name && item.work_name.toLowerCase().includes(query))
    );
  }, [historyList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Tiêu đề Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🕒</span>
            <div>
              <h2 className={styles.modalTitle}>Lịch sử mục tiêu đã hoàn thành</h2>
              <p className={styles.modalSub}>
                Xem lại và khôi phục nhanh các mục tiêu bạn lỡ bấm hoàn thành nhầm
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.btnClose}
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            ✕
          </button>
        </div>

        {/* Thanh tìm kiếm & lọc nhanh */}
        {historyList.length > 0 && (
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Tìm mục tiêu hoặc đầu việc đã hoàn thành..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.btnClearSearch}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Thông báo lỗi nếu có */}
        {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

        {/* Thân danh sách */}
        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <span>Đang tải lịch sử hoàn thành...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div className={styles.emptyBox}>
              <span className={styles.emptyIcon}>📋</span>
              <p className={styles.emptyTitle}>Chưa có mục tiêu nào hoàn thành</p>
              <p className={styles.emptyDesc}>
                Các mục tiêu bạn đánh dấu hoàn thành sẽ được lưu lại ở đây để bạn dễ dàng tra cứu
                hoặc hoàn tác bất cứ lúc nào.
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className={styles.emptyBox}>
              <span className={styles.emptyIcon}>🔎</span>
              <p className={styles.emptyTitle}>Không tìm thấy mục tiêu phù hợp</p>
              <p className={styles.emptyDesc}>Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {filteredList.map((item) => {
                const isRestoring = restoringGoalIds.has(item.goal_id);
                const isRestored = Boolean(item.is_restored);

                return (
                  <div
                    key={item.goal_id}
                    className={`${styles.historyCard} ${
                      isRestored ? styles.historyCardRestored : ''
                    }`}
                  >
                    <span
                      className={styles.colorIndicator}
                      style={{ backgroundColor: item.goal_color || '#10B981' }}
                    />

                    <div className={styles.cardContent}>
                      <div
                        className={`${styles.goalName} ${
                          isRestored ? styles.goalNameRestored : ''
                        }`}
                      >
                        {item.goal_name}
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.workBadge}>📁 {item.work_name}</span>
                        <span
                          className={styles.timeBadge}
                          title={formatDateTime(item.completed_at)}
                        >
                          ✓ Xong: {formatRelativeTime(item.completed_at)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      {isRestored ? (
                        <span className={styles.restoredTag}>✓ Đã khôi phục</span>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnRestore}
                          onClick={() => handleRestoreGoal(item)}
                          disabled={isRestoring}
                          title="Khôi phục mục tiêu này về trạng thái chưa hoàn thành"
                        >
                          {isRestoring ? 'Đang khôi phục...' : '↺ Khôi phục'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chân Modal */}
        <div className={styles.modalFooter}>
          <span className={styles.footerInfo}>
            Tổng cộng <strong>{historyList.length}</strong> mục tiêu đã hoàn thành gần đây
          </span>
          <button type="button" className={styles.btnCloseFooter} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionHistoryModal;
