/**
 * TÊN FILE: GoalModal.jsx
 * CÔNG DỤNG: Hộp thoại biểu mẫu dạng nổi (Modal Dialog) để tạo mới hoặc chỉnh sửa mục tiêu (Goal), hỗ trợ chọn trực tiếp Chặng và thang đo Quy mô 1-5.
 * PHẠM VI DÙNG: Phân hệ Customer (WorkView).
 */

import { useState, useEffect } from 'react';
import { toInputDateValue } from '../../../../shared/utils/dateFormat.js';
import styles from './GoalModal.module.scss';

const COLOR_PRESETS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const SCOPE_LEVELS = [
  { value: 1, label: '1 - Rất nhỏ', desc: 'Vài giờ / trong ngày' },
  { value: 2, label: '2 - Nhỏ', desc: '1 - 2 ngày' },
  { value: 3, label: '3 - Vừa', desc: 'Tiêu chuẩn (3 - 5 ngày)' },
  { value: 4, label: '4 - Lớn', desc: 'Kéo dài 1 - 2 tuần' },
  { value: 5, label: '5 - Rất lớn', desc: 'Quy mô dài hạn & phức tạp' },
];

/**
 * Component Modal nổi phục vụ Thêm mới hoặc Chỉnh sửa Mục tiêu.
 * @param {object} props - Gồm isOpen, onClose, onSave, initialData, initialStageId, stages
 */
export function GoalModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  initialStageId = null,
  stages = [],
}) {
  const [goalName, setGoalName] = useState('');
  const [goalEndDate, setGoalEndDate] = useState('');
  const [goalColor, setGoalColor] = useState('#EF4444');
  const [goalRange, setGoalRange] = useState(1);
  const [goalDescription, setGoalDescription] = useState('');
  const [stageId, setStageId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setGoalName(initialData.goal_name || '');
      setGoalEndDate(initialData.goal_end_date ? toInputDateValue(initialData.goal_end_date) : '');
      setGoalColor(initialData.goal_color || '#EF4444');
      setGoalRange(Math.min(5, Math.max(1, Number(initialData.goal_range) || 1)));
      setGoalDescription(initialData.goal_description || '');
      setStageId(initialData.stage_id ? initialData.stage_id.toString() : '');
    } else {
      setGoalName('');
      setGoalEndDate(toInputDateValue(new Date()));
      setGoalColor('#EF4444');
      setGoalRange(1);
      setGoalDescription('');
      setStageId(initialStageId ? initialStageId.toString() : '');
    }
    setValidationError('');
    setIsSubmitting(false);
  }, [initialData, initialStageId, isOpen]);

  if (!isOpen) return null;

  /**
   * Xử lý xác thực và gửi dữ liệu biểu mẫu lên hàm cha onSave.
   * @param {object} e - Form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goalName.trim()) {
      setValidationError('Vui lòng nhập tên mục tiêu.');
      return;
    }
    if (!goalEndDate) {
      setValidationError('Vui lòng chọn hạn chót cho mục tiêu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');
      await onSave({
        goal_name: goalName.trim(),
        goal_end_date: goalEndDate,
        goal_color: goalColor,
        goal_range: Number(goalRange) || 1,
        goal_description: goalDescription.trim(),
        stage_id: stageId || null,
      });
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Không thể lưu mục tiêu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* HEADER MODAL */}
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <span className={styles.headerIcon}>🎯</span>
            <h3>{initialData ? 'Chỉnh sửa Mục Tiêu' : 'Thêm Mục Tiêu Mới'}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng cửa sổ">
            ✕
          </button>
        </div>

        {/* THÔNG BÁO LỖI NẾU CÓ */}
        {validationError && <div className={styles.errorAlert}>{validationError}</div>}

        {/* FORM NHẬP THÔNG TIN */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.fieldGroup}>
            <label>Tên mục tiêu *</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ví dụ: Hoàn thành bài tập tuần 1, Viết tài liệu..."
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.rowTwoCols}>
            <div className={styles.fieldGroup}>
              <label>Hạn chót hoàn thành *</label>
              <input
                type="date"
                className={styles.inputField}
                value={goalEndDate}
                onChange={(e) => setGoalEndDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Chặng trực thuộc</label>
              <select
                className={styles.inputField}
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
              >
                <option value="">-- Chưa phân chặng (Chung) --</option>
                {stages.map((stg) => (
                  <option key={stg._id} value={stg._id}>
                    Chặng {stg.stage_order || 1}: {stg.stage_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHỌN QUY MÔ CÔNG VIỆC (THANG 1 - 5) */}
          <div className={styles.fieldGroup}>
            <div className={styles.labelWithHint}>
              <label>Quy mô công việc</label>
              <span className={styles.hintText}>Ước lượng thời gian & độ khó hoàn thành</span>
            </div>
            <div className={styles.scopeSelector}>
              {SCOPE_LEVELS.map((scope) => {
                const isSelected = goalRange === scope.value;
                return (
                  <button
                    key={scope.value}
                    type="button"
                    className={`${styles.scopePill} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setGoalRange(scope.value)}
                  >
                    <span className={styles.scopeValue}>{scope.value}</span>
                    <span className={styles.scopeDesc}>{scope.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Màu nhận diện</label>
            <div className={styles.colorPickerRow}>
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorSwatch} ${goalColor === color ? styles.selectedSwatch : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setGoalColor(color)}
                />
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Hướng dẫn chi tiết / Ghi chú</label>
            <textarea
              className={styles.textAreaField}
              rows={3}
              placeholder="Ghi chú các bước thực hiện, link tài liệu hoặc yêu cầu cụ thể..."
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
            />
          </div>

          {/* ACTIONS FOOTER */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? '⏳ Đang lưu...'
                : initialData
                ? 'Lưu thay đổi'
                : '✓ Tạo mục tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalModal;
