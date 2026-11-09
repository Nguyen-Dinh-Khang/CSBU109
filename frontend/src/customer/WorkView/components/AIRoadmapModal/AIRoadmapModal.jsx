/**
 * TÊN FILE: AIRoadmapModal.jsx
 * CÔNG DỤNG: Hộp thoại tạo lộ trình thông minh qua Gemini AI, hiển thị xem trước các chặng và mục tiêu gợi ý, cho phép người dùng gửi phản hồi comment để AI tinh chỉnh trước khi lưu thành đầu việc thật.
 * PHẠM VI DÙNG: Phân hệ Customer (WorkView).
 */

import { useState } from 'react';
import { generateAIRoadmap, refineAIRoadmap, applyAIRoadmap } from '../../../../shared/services/ai.service.js';
import styles from './AIRoadmapModal.module.scss';

const DURATION_OPTIONS = [
  { value: 2, label: '2 tuần (Nửa tháng)' },
  { value: 4, label: '4 tuần (1 tháng)' },
  { value: 6, label: '6 tuần (1.5 tháng)' },
  { value: 8, label: '8 tuần (2 tháng)' },
  { value: 12, label: '12 tuần (3 tháng - 1 học kỳ)' },
  { value: 16, label: '16 tuần (4 tháng)' },
  { value: 24, label: '24 tuần (6 tháng - Nửa năm)' },
  { value: 36, label: '36 tuần (9 tháng)' },
  { value: 52, label: '52 tuần (1 năm toàn diện)' },
];

/**
 * Component Modal tạo lộ trình học tập bằng AI với chu trình phản hồi tinh chỉnh (Feedback Loop).
 * @param {object} props - Gồm isOpen, onClose, onRoadmapApplied
 */
export function AIRoadmapModal({ isOpen, onClose, onRoadmapApplied }) {
  const [subjectName, setSubjectName] = useState('');
  const [weeks, setWeeks] = useState(6);
  const [goalDescription, setGoalDescription] = useState('');
  const [level, setLevel] = useState('Trung bình');

  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State phản hồi comment để AI tinh chỉnh
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  if (!isOpen) return null;

  /**
   * Gọi API sinh lộ trình AI dựa vào thông tin nhập vào.
   * @param {object} e - Form event
   */
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setErrorMsg('Vui lòng nhập tên môn học hoặc kỹ năng muốn học.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const roadmap = await generateAIRoadmap({
        subjectName: subjectName.trim(),
        weeks: Number(weeks) || 6,
        goalDescription: goalDescription.trim(),
        level,
      });
      setPreviewData(roadmap);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi sinh lộ trình AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gửi phản hồi comment để Gemini AI tinh chỉnh lại lộ trình đã sinh.
   * @param {object} e - Form event
   */
  const handleRefine = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim() || !previewData) return;

    try {
      setIsRefining(true);
      setErrorMsg('');
      const refined = await refineAIRoadmap({
        currentRoadmap: previewData,
        feedbackComment: feedbackComment.trim(),
      });
      setPreviewData(refined);
      setFeedbackComment('');
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tinh chỉnh lộ trình. Vui lòng thử lại.');
    } finally {
      setIsRefining(false);
    }
  };

  /**
   * Lưu lộ trình xem trước vào cơ sở dữ liệu của người dùng.
   */
  const handleApply = async () => {
    if (!previewData) return;

    try {
      setIsApplying(true);
      setErrorMsg('');
      const createdWork = await applyAIRoadmap(previewData);
      onRoadmapApplied(createdWork);
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Không thể lưu lộ trình vào tài khoản.');
    } finally {
      setIsApplying(false);
    }
  };

  /**
   * Đóng modal và reset trạng thái.
   */
  const handleClose = () => {
    setPreviewData(null);
    setFeedbackComment('');
    setErrorMsg('');
    setIsLoading(false);
    setIsRefining(false);
    setIsApplying(false);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <h3>✨ AI Sinh Lộ Trình Học Tập</h3>
            <span className={styles.aiBadge}>Gemini AI</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div className={styles.modalContent}>
          {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

          {isLoading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <div className={styles.loadingText}>
                Trí tuệ nhân tạo đang phân tích môn học &quot;{subjectName}&quot;...
              </div>
              <div className={styles.loadingSub}>
                Đang thiết kế các chặng học tập lớp lang và chia nhỏ các mục tiêu khả thi theo từng tuần.
              </div>
            </div>
          ) : previewData ? (
            /* XEM TRƯỚC LỘ TRÌNH ĐƯỢC SINH RA */
            <div className={styles.previewContainer}>
              <div className={styles.previewHeader}>
                <h4 className={styles.previewTitle}>🎯 {previewData.work_name}</h4>
                <p className={styles.previewDesc}>{previewData.work_description}</p>
                <div className={styles.previewMeta}>
                  <span>⏱️ Tổng thời lượng: {weeks} tuần</span>
                  <span>• 🪜 {previewData.stages?.length || 0} chặng</span>
                  <span>• 💡 {previewData.ai_note || 'Được tối ưu hóa tự động'}</span>
                </div>
              </div>

              <div className={styles.stagesPreviewList}>
                {previewData.stages?.map((stage, idx) => (
                  <div
                    key={idx}
                    className={styles.previewStageCard}
                    style={{ '--stage-color': stage.stage_color || '#6366f1' }}
                  >
                    <div className={styles.previewStageTop}>
                      <h4>{stage.stage_name}</h4>
                      <span>{stage.goals?.length || 0} Mục tiêu</span>
                    </div>
                    {stage.stage_description && (
                      <p className={styles.previewStageDesc}>{stage.stage_description}</p>
                    )}
                    <div className={styles.previewGoalList}>
                      {stage.goals?.map((g, gIdx) => (
                        <div key={gIdx} className={styles.previewGoalItem}>
                          <span className={styles.bullet}>•</span>
                          <span>{g.goal_name}</span>
                          <span className={styles.goalScopeTag}>Quy mô {g.goal_range || 3}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* KHUNG GÓP Ý & TINH CHỈNH LỘ TRÌNH VỚI AI */}
              <div className={styles.refineSection}>
                <div className={styles.refineHeader}>
                  <span className={styles.refineIcon}>💬</span>
                  <div>
                    <h5>Góp ý & Tinh chỉnh lộ trình với AI</h5>
                    <p>Chưa hoàn toàn ưng ý? Gửi nhận xét để Gemini AI điều chỉnh lại chặng và mục tiêu ngay lập tức.</p>
                  </div>
                </div>

                <form onSubmit={handleRefine} className={styles.refineForm}>
                  <textarea
                    className={styles.refineTextarea}
                    rows={2}
                    placeholder="Ví dụ: Thêm 1 chặng làm đồ án thực hành ở cuối, kéo dài thời gian chặng 2, giảm bớt lý thuyết..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    disabled={isRefining || isApplying}
                  />
                  <button
                    type="submit"
                    className={styles.btnRefine}
                    disabled={!feedbackComment.trim() || isRefining || isApplying}
                  >
                    {isRefining ? '⏳ Đang tinh chỉnh...' : '✨ Tinh chỉnh theo góp ý'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* FORM NHẬP THÔNG TIN MÔN HỌC */
            <form onSubmit={handleGenerate} className={styles.inputGrid}>
              <div className={styles.fieldGroup}>
                <label>Tên môn học, kỹ năng hoặc dự án muốn học *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ví dụ: Lập trình ReactJS, Cấu trúc dữ liệu & Giải thuật, IELTS 6.5..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
                <span className={styles.helperText}>
                  AI sẽ dựa vào tên môn để xây dựng khung kiến thức chuẩn xác nhất.
                </span>
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.fieldGroup}>
                  <label>Thời lượng học tập</label>
                  <select
                    className={styles.inputField}
                    value={weeks}
                    onChange={(e) => setWeeks(Number(e.target.value))}
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Trình độ hiện tại</label>
                  <select
                    className={styles.inputField}
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="Mới bắt đầu">Mới bắt đầu (Chưa biết gì)</option>
                    <option value="Trung bình">Trung bình (Đã có nền tảng)</option>
                    <option value="Nâng cao">Nâng cao (Muốn luyện chuyên sâu)</option>
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Kỳ vọng hoặc mục tiêu chi tiết của bạn</label>
                <textarea
                  className={styles.inputField}
                  rows={3}
                  placeholder="Ví dụ: Muốn qua môn điểm A, hoàn thành đồ án cuối kỳ, hoặc ôn phỏng vấn thực tập..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                />
              </div>
            </form>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className={styles.modalFooter}>
          {previewData ? (
            <>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setPreviewData(null)}
                disabled={isApplying || isRefining}
              >
                ← Tạo lộ trình khác
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleApply}
                disabled={isApplying || isRefining}
              >
                {isApplying ? '⏳ Đang lưu vào hệ thống...' : '✓ Chấp nhận & Tạo Môn Học'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleGenerate}
                disabled={isLoading}
              >
                🚀 Bắt đầu sinh lộ trình
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIRoadmapModal;
