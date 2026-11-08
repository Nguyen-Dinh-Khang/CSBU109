/**
 * TÊN FILE: StageModal.jsx
 * CÔNG DỤNG: Hộp thoại biểu mẫu thêm mới hoặc chỉnh sửa thông tin của một Chặng (Stage) trong đầu việc.
 * PHẠM VI DÙNG: Phân hệ Customer (WorkView).
 */

import { useState, useEffect } from 'react';
import { toInputDateValue } from '../../../../shared/utils/dateFormat.js';
import styles from './StageModal.module.scss';

const STAGE_COLOR_PRESETS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#6366F1'];

/**
 * Component Modal thêm mới hoặc chỉnh sửa Chặng.
 * @param {object} props - Gồm isOpen, onClose, onSave, initialData, defaultOrder
 */
export function StageModal({ isOpen, onClose, onSave, initialData = null, defaultOrder = 1 }) {
  const [stageName, setStageName] = useState('');
  const [stageOrder, setStageOrder] = useState(1);
  const [stageStartDate, setStageStartDate] = useState('');
  const [stageEndDate, setStageEndDate] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [stageColor, setStageColor] = useState('#3B82F6');

  useEffect(() => {
    if (initialData) {
      setStageName(initialData.stage_name || '');
      setStageOrder(initialData.stage_order || 1);
      setStageStartDate(initialData.stage_start_date ? toInputDateValue(initialData.stage_start_date) : '');
      setStageEndDate(initialData.stage_end_date ? toInputDateValue(initialData.stage_end_date) : '');
      setStageDescription(initialData.stage_description || '');
      setStageColor(initialData.stage_color || '#3B82F6');
    } else {
      setStageName('');
      setStageOrder(defaultOrder);
      setStageStartDate('');
      setStageEndDate('');
      setStageDescription('');
      setStageColor('#3B82F6');
    }
  }, [initialData, defaultOrder, isOpen]);

  if (!isOpen) return null;

  /**
   * Xử lý gửi biểu mẫu lưu chặng.
   * @param {object} e - Form event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stageName.trim()) return;

    onSave({
      stage_name: stageName.trim(),
      stage_order: Number(stageOrder) || 1,
      stage_start_date: stageStartDate || null,
      stage_end_date: stageEndDate || null,
      stage_description: stageDescription.trim(),
      stage_color: stageColor,
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{initialData ? 'Chỉnh sửa Chặng' : 'Thêm Chặng mới'}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.rowTwoCols}>
            <div className={styles.fieldGroup}>
              <label>Tên chặng *</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Ví dụ: Nền tảng, Ôn thi giữa kỳ..."
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Thứ tự chặng (1, 2, 3...)</label>
              <input
                type="number"
                min="1"
                className={styles.inputField}
                value={stageOrder}
                onChange={(e) => setStageOrder(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.rowTwoCols}>
            <div className={styles.fieldGroup}>
              <label>Ngày bắt đầu chặng</label>
              <input
                type="date"
                className={styles.inputField}
                value={stageStartDate}
                onChange={(e) => setStageStartDate(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Hạn chót / Kết thúc chặng</label>
              <input
                type="date"
                className={styles.inputField}
                value={stageEndDate}
                onChange={(e) => setStageEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Mô tả / Mục tiêu của chặng</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Tóm tắt yêu cầu cần đạt được..."
              value={stageDescription}
              onChange={(e) => setStageDescription(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Màu đại diện chặng</label>
            <div className={styles.colorPickerRow}>
              {STAGE_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorSwatch} ${stageColor === c ? styles.selected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setStageColor(c)}
                />
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {initialData ? 'Cập nhật Chặng' : 'Lưu Chặng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StageModal;
