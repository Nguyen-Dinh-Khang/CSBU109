/**
 * TÊN FILE: WorkView.jsx
 * CÔNG DỤNG: Giao diện thứ hai - Hiển thị danh sách đầu việc (Work) vắn tắt (tên, tiến độ %, số lượng goal). Khi bấm vào một đầu việc cụ thể mới gọi fetchGoals để lấy và thao tác chi tiết toàn bộ Goal của đầu việc đó.
 * PHẠM VI DÙNG: Phân hệ Customer (WorkView).
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/providers/AuthContext.jsx';
import {
  fetchWorks,
  createWork,
  updateWork,
  deleteWork,
  fetchGoals,
  createGoal,
  updateGoal,
  toggleCheckGoal,
  deleteGoal,
} from '../../shared/services/work.service.js';
import {
  formatDisplayDate,
  toInputDateValue,
  getDeadlineBadgeInfo,
} from '../../shared/utils/dateFormat.js';
import styles from './WorkView.module.scss';

const COLOR_PRESETS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

const DEMO_WORKS = [
  {
    _id: 'demo-work-1',
    work_name: 'Đồ án Công nghệ Phần mềm CSBU109',
    work_start_date: '2026-10-01T00:00:00.000Z',
    work_end_date: '2026-11-15T00:00:00.000Z',
    work_color: '#3B82F6',
    work_description: 'Xây dựng ứng dụng quản lý lịch trình & đầu việc theo chuẩn kiến trúc GEMINI.',
    goals_count: 3,
    completed_goals_count: 1,
    progress_percentage: 33,
    is_expired: false,
  },
  {
    _id: 'demo-work-2',
    work_name: 'Ôn thi Cơ sở dữ liệu MongoDB',
    work_start_date: '2026-10-05T00:00:00.000Z',
    work_end_date: '2026-10-30T00:00:00.000Z',
    work_color: '#10B981',
    work_description: 'Tổng hợp kiến thức thiết kế Embedded Schema và Aggregation.',
    goals_count: 2,
    completed_goals_count: 2,
    progress_percentage: 100,
    is_expired: false,
  },
];

const DEMO_GOALS_MAP = {
  'demo-work-1': [
    {
      _id: 'dg-1',
      goal_name: 'Thiết kế Database Schema (User, Work, Goal, Date)',
      goal_end_date: '2026-10-12T00:00:00.000Z',
      goal_color: '#10B981',
      goal_range: 3,
      goal_description: 'Hoàn thành model Mongoose nhúng',
      goal_check: true,
    },
    {
      _id: 'dg-2',
      goal_name: 'Xây dựng 12 RESTful API Endpoints',
      goal_end_date: '2026-10-22T00:00:00.000Z',
      goal_color: '#3B82F6',
      goal_range: 5,
      goal_description: 'Bảo mật bằng JWT Middleware',
      goal_check: false,
    },
    {
      _id: 'dg-3',
      goal_name: 'Tách giao diện thành 3 phân trang rõ ràng',
      goal_end_date: '2026-10-25T00:00:00.000Z',
      goal_color: '#F59E0B',
      goal_range: 4,
      goal_description: 'Dashboard, Work vắn tắt và Calendar',
      goal_check: false,
    },
  ],
  'demo-work-2': [
    {
      _id: 'dg-4',
      goal_name: 'Thực hành CRUD với toán tử $push và $pull',
      goal_end_date: '2026-10-15T00:00:00.000Z',
      goal_color: '#10B981',
      goal_range: 2,
      goal_description: 'Đã làm bài lab 2',
      goal_check: true,
    },
    {
      _id: 'dg-5',
      goal_name: 'Làm đề thi thử trắc nghiệm 50 câu',
      goal_end_date: '2026-10-18T00:00:00.000Z',
      goal_color: '#8B5CF6',
      goal_range: 3,
      goal_description: 'Đạt 46/50 câu',
      goal_check: true,
    },
  ],
};

/**
 * Component hiển thị trang Quản lý Đầu việc vắn tắt và tải chi tiết Goal khi chọn một đầu việc.
 * @param {object} props - Gồm initialSelectedWorkId, onClearInitialWork, onOpenAuth
 */
export function WorkView({ initialSelectedWorkId, onClearInitialWork, onOpenAuth }) {
  const { isAuthenticated } = useAuth();

  // Danh sách Works vắn tắt
  const [works, setWorks] = useState([]);
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State biểu mẫu Tạo / Sửa Work
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workName, setWorkName] = useState('');
  const [workStartDate, setWorkStartDate] = useState(() => toInputDateValue(new Date()));
  const [workEndDate, setWorkEndDate] = useState('');
  const [workColor, setWorkColor] = useState('#10B981');
  const [workDescription, setWorkDescription] = useState('');

  // State khi người dùng bấm chọn 1 Work cụ thể để fetch tất cả các Goal của Work đó
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [selectedWorkGoals, setSelectedWorkGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  // State biểu mẫu Tạo / Sửa Goal trong Work đang chọn
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [goalEndDate, setGoalEndDate] = useState('');
  const [goalColor, setGoalColor] = useState('#EF4444');
  const [goalRange, setGoalRange] = useState(1);
  const [goalDescription, setGoalDescription] = useState('');

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated) {
      Promise.resolve(DEMO_WORKS).then((demoList) => {
        if (!isCancelled) {
          setWorks(demoList);
        }
      });
      return () => {
        isCancelled = true;
      };
    }

    fetchWorks()
      .then((data) => {
        if (!isCancelled) {
          setWorks(data);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setErrorMsg('Không thể tải danh sách đầu việc.');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingWorks(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  /**
   * Gọi API GET /api/works/:work_id/goals để lấy toàn bộ mục tiêu chi tiết khi người dùng bấm vào một Work.
   * @param {string} workId - ID của đầu việc được bấm vào
   */
  const handleSelectWork = useCallback(
    async (workId) => {
      setSelectedWorkId(workId);
      setShowGoalForm(false);
      setEditingGoalId(null);

      if (!isAuthenticated) {
        setSelectedWorkGoals(DEMO_GOALS_MAP[workId] || []);
        return;
      }

      try {
        setIsLoadingGoals(true);
        setErrorMsg('');
        const response = await fetchGoals(workId);
        const goalsList = response?.data || [];
        setSelectedWorkGoals(goalsList);

        // Đồng bộ lại tiến độ & số lượng goal trên thẻ Work vắn tắt
        const total = goalsList.length;
        const completed = goalsList.filter((g) => g.goal_check).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        setWorks((prev) =>
          prev.map((w) =>
            w._id === workId
              ? {
                  ...w,
                  goals_count: total,
                  completed_goals_count: completed,
                  progress_percentage: pct,
                }
              : w
          )
        );
      } catch {
        setErrorMsg('Không thể tải danh sách mục tiêu của đầu việc này.');
      } finally {
        setIsLoadingGoals(false);
      }
    },
    [isAuthenticated]
  );

  // Tự động mở Work nếu được điều hướng từ Dashboard sang
  useEffect(() => {
    if (!initialSelectedWorkId) return;
    let isCancelled = false;

    Promise.resolve().then(() => {
      if (!isCancelled) {
        handleSelectWork(initialSelectedWorkId);
        if (onClearInitialWork) {
          onClearInitialWork();
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [initialSelectedWorkId, handleSelectWork, onClearInitialWork]);

  /**
   * Mở form thêm mới một đầu việc.
   */
  const handleOpenCreateWork = () => {
    setEditingWorkId(null);
    setWorkName('');
    setWorkStartDate(toInputDateValue(new Date()));
    setWorkEndDate('');
    setWorkColor('#10B981');
    setWorkDescription('');
    setShowWorkForm(true);
  };

  /**
   * Mở form chỉnh sửa thông tin một đầu việc.
   * @param {object} e - Sự kiện click
   * @param {object} work - Đối tượng đầu việc cần sửa
   */
  const handleOpenEditWork = (e, work) => {
    e.stopPropagation();
    setEditingWorkId(work._id);
    setWorkName(work.work_name || '');
    setWorkStartDate(toInputDateValue(work.work_start_date));
    setWorkEndDate(toInputDateValue(work.work_end_date));
    setWorkColor(work.work_color || '#10B981');
    setWorkDescription(work.work_description || '');
    setShowWorkForm(true);
  };

  /**
   * Lưu đầu việc (tạo mới hoặc cập nhật) qua API.
   * @param {object} e - Form submit event
   */
  const handleSaveWork = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    if (!workName.trim() || !workStartDate || !workEndDate) {
      setErrorMsg('Vui lòng điền đầy đủ tên đầu việc, ngày bắt đầu và ngày kết thúc.');
      return;
    }

    try {
      setErrorMsg('');
      const payload = {
        work_name: workName.trim(),
        work_start_date: workStartDate,
        work_end_date: workEndDate,
        work_color: workColor,
        work_description: workDescription.trim(),
      };

      if (editingWorkId) {
        const updated = await updateWork(editingWorkId, payload);
        setWorks((prev) => prev.map((w) => (w._id === editingWorkId ? { ...w, ...updated } : w)));
      } else {
        const created = await createWork(payload);
        setWorks((prev) => [created, ...prev]);
      }

      setShowWorkForm(false);
      setEditingWorkId(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi khi lưu đầu việc.');
    }
  };

  /**
   * Xóa một đầu việc và toàn bộ mục tiêu con của nó.
   * @param {object} e - Sự kiện click
   * @param {string} workId - ID đầu việc cần xóa
   */
  const handleDeleteWork = async (e, workId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa đầu việc này cùng tất cả mục tiêu bên trong?')) {
      return;
    }

    try {
      await deleteWork(workId);
      setWorks((prev) => prev.filter((w) => w._id !== workId));
      if (selectedWorkId === workId) {
        setSelectedWorkId(null);
        setSelectedWorkGoals([]);
      }
    } catch {
      setErrorMsg('Không thể xóa đầu việc này.');
    }
  };

  /**
   * Cập nhật lại tiến độ % và số lượng goal của Work đang chọn dựa trên mảng goals mới.
   * @param {string} workId - ID đầu việc
   * @param {Array} updatedGoals - Danh sách goals mới
   */
  const syncWorkProgressFromGoals = (workId, updatedGoals) => {
    const total = updatedGoals.length;
    const completed = updatedGoals.filter((g) => g.goal_check).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    setWorks((prev) =>
      prev.map((w) =>
        w._id === workId
          ? {
              ...w,
              goals_count: total,
              completed_goals_count: completed,
              progress_percentage: pct,
            }
          : w
      )
    );
  };

  /**
   * Mở form thêm mục tiêu mới vào Work đang chọn.
   */
  const handleOpenCreateGoal = () => {
    setEditingGoalId(null);
    setGoalName('');
    setGoalEndDate(toInputDateValue(new Date()));
    setGoalColor('#EF4444');
    setGoalRange(1);
    setGoalDescription('');
    setShowGoalForm(true);
  };

  /**
   * Mở form chỉnh sửa một mục tiêu cụ thể.
   * @param {object} goal - Mục tiêu cần chỉnh sửa
   */
  const handleOpenEditGoal = (goal) => {
    setEditingGoalId(goal._id);
    setGoalName(goal.goal_name || '');
    setGoalEndDate(toInputDateValue(goal.goal_end_date));
    setGoalColor(goal.goal_color || '#EF4444');
    setGoalRange(goal.goal_range || 1);
    setGoalDescription(goal.goal_description || '');
    setShowGoalForm(true);
  };

  /**
   * Lưu mục tiêu (thêm mới hoặc sửa) vào Work đang chọn.
   * @param {object} e - Form submit event
   */
  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    if (!goalName.trim() || !goalEndDate) {
      setErrorMsg('Vui lòng nhập tên mục tiêu và hạn chót.');
      return;
    }

    try {
      setErrorMsg('');
      const payload = {
        goal_name: goalName.trim(),
        goal_end_date: goalEndDate,
        goal_color: goalColor,
        goal_range: Number(goalRange) || 1,
        goal_description: goalDescription.trim(),
      };

      if (editingGoalId) {
        await updateGoal(selectedWorkId, editingGoalId, payload);
      } else {
        await createGoal(selectedWorkId, payload);
      }

      // Fetch lại chi tiết tất cả các goal của Work này để đồng bộ chuẩn xác
      await handleSelectWork(selectedWorkId);
      setShowGoalForm(false);
      setEditingGoalId(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể lưu mục tiêu.');
    }
  };

  /**
   * Đảo trạng thái hoàn thành của một mục tiêu (Check / Uncheck).
   * @param {string} goalId - ID mục tiêu
   */
  const handleToggleGoalCheck = async (goalId) => {
    if (!isAuthenticated) {
      const nextGoals = selectedWorkGoals.map((g) =>
        g._id === goalId ? { ...g, goal_check: !g.goal_check } : g
      );
      setSelectedWorkGoals(nextGoals);
      syncWorkProgressFromGoals(selectedWorkId, nextGoals);
      return;
    }

    try {
      const updatedGoal = await toggleCheckGoal(selectedWorkId, goalId);
      const nextGoals = selectedWorkGoals.map((g) => (g._id === goalId ? updatedGoal : g));
      setSelectedWorkGoals(nextGoals);
      syncWorkProgressFromGoals(selectedWorkId, nextGoals);
    } catch {
      setErrorMsg('Không thể cập nhật trạng thái mục tiêu.');
    }
  };

  /**
   * Xóa một mục tiêu khỏi Work đang chọn.
   * @param {string} goalId - ID mục tiêu cần xóa
   */
  const handleDeleteGoal = async (goalId) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (!window.confirm('Xóa mục tiêu này khỏi đầu việc?')) return;

    try {
      await deleteGoal(selectedWorkId, goalId);
      const nextGoals = selectedWorkGoals.filter((g) => g._id !== goalId);
      setSelectedWorkGoals(nextGoals);
      syncWorkProgressFromGoals(selectedWorkId, nextGoals);
    } catch {
      setErrorMsg('Không thể xóa mục tiêu.');
    }
  };

  const activeWork = works.find((w) => w._id === selectedWorkId) || null;

  return (
    <div className={styles.workView}>
      {/* TIÊU ĐỀ TRANG */}
      <div className={styles.topHeader}>
        <div>
          <h1 className={styles.pageTitle}>📁 Quản lý Đầu việc (Works)</h1>
          <p className={styles.pageSubtitle}>
            Danh sách dưới đây chỉ hiển thị thông tin vắn tắt (Tên, Tiến độ % và Số lượng Goal). Hãy{' '}
            <strong>bấm vào một đầu việc cụ thể</strong> để tải chi tiết các Goal của nó.
          </p>
        </div>
        <button type="button" className={styles.btnPrimary} onClick={handleOpenCreateWork}>
          + Tạo Đầu việc mới
        </button>
      </div>

      {!isAuthenticated && (
        <div className={styles.guestNotice}>
          <span>👀 Bạn đang xem dữ liệu mẫu. Hãy đăng nhập để tạo và lưu Đầu việc của riêng bạn!</span>
          <button type="button" className={styles.btnSmallAuth} onClick={() => onOpenAuth('login')}>
            Đăng nhập
          </button>
        </div>
      )}

      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      {/* FORM TẠO / SỬA WORK */}
      {showWorkForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>{editingWorkId ? 'Chỉnh sửa Đầu việc' : 'Tạo Đầu việc mới'}</h2>
            <button
              type="button"
              className={styles.btnClose}
              onClick={() => setShowWorkForm(false)}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSaveWork}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label>Tên đầu việc *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ví dụ: Đồ án môn học, Học tiếng Anh IELTS..."
                  value={workName}
                  onChange={(e) => setWorkName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Ngày bắt đầu *</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={workStartDate}
                  onChange={(e) => setWorkStartDate(e.target.value)}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Ngày kết thúc dự kiến *</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={workEndDate}
                  onChange={(e) => setWorkEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formRowSecond}>
              <div className={styles.fieldGroup}>
                <label>Mô tả ngắn gọn</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ghi chú phạm vi hoặc mục đích của đầu việc..."
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Màu nhận diện</label>
                <div className={styles.colorPickerRow}>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.colorSwatch} ${workColor === c ? styles.selected : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setWorkColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowWorkForm(false)}
              >
                Hủy bỏ
              </button>
              <button type="submit" className={styles.btnPrimary}>
                {editingWorkId ? 'Lưu thay đổi' : 'Tạo đầu việc'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DANH SÁCH THẺ WORK VẮN TẮT (KHÔNG HIỂN THỊ GOALS BÊN TRONG) */}
      {isLoadingWorks ? (
        <div className={styles.emptyBox}>Đang tải danh sách đầu việc...</div>
      ) : works.length === 0 ? (
        <div className={styles.emptyBox}>
          <p>Bạn chưa có đầu việc nào. Hãy tạo đầu việc đầu tiên để bắt đầu!</p>
          <button type="button" className={styles.btnPrimary} onClick={handleOpenCreateWork}>
            + Tạo Đầu việc đầu tiên
          </button>
        </div>
      ) : (
        <div className={styles.worksGrid}>
          {works.map((work) => {
            const isSelected = work._id === selectedWorkId;
            const totalGoals = work.goals_count ?? 0;
            const completedGoals = work.completed_goals_count ?? 0;
            const progress = work.progress_percentage ?? 0;

            return (
              <div
                key={work._id}
                className={`${styles.workCard} ${isSelected ? styles.activeCard : ''}`}
                style={{ borderTopColor: work.work_color || '#10B981' }}
                onClick={() => handleSelectWork(work._id)}
              >
                <div className={styles.workCardTop}>
                  <div className={styles.workBadges}>
                    <span className={styles.goalCountPill}>
                      🎯 {completedGoals}/{totalGoals} Goal
                    </span>
                    {work.is_expired && (
                      <span className={styles.expiredPill}>Đã kết thúc</span>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="Sửa thông tin đầu việc"
                      onClick={(e) => handleOpenEditWork(e, work)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.danger}`}
                      title="Xóa đầu việc"
                      onClick={(e) => handleDeleteWork(e, work._id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <h3 className={styles.workTitle}>{work.work_name}</h3>
                {work.work_description && (
                  <p className={styles.workDesc}>{work.work_description}</p>
                )}

                <div className={styles.dateRangeRow}>
                  <span>
                    📅 {formatDisplayDate(work.work_start_date)} →{' '}
                    {formatDisplayDate(work.work_end_date)}
                  </span>
                </div>

                {/* Thanh tiến độ vắn tắt */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>Tiến độ hoàn thành</span>
                    <span
                      className={`${styles.progressValue} ${
                        progress === 100 ? styles.done : ''
                      }`}
                    >
                      {progress}%
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={`${styles.progressFill} ${
                        progress === 100 ? styles.done : ''
                      }`}
                      style={{
                        width: `${progress}%`,
                        backgroundColor:
                          progress === 100 ? '#10B981' : work.work_color || '#3B82F6',
                      }}
                    />
                  </div>
                </div>

                <div className={styles.clickHint}>
                  {isSelected
                    ? '▼ Đang hiển thị chi tiết các Goal bên dưới'
                    : '👆 Bấm vào để tải chi tiết các Goal'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KHUNG CHI TIẾT GOALS (CHỈ HIỆN KHI BẤM VÀO 1 WORK CỤ THỂ -> GỬI FETCH) */}
      {activeWork && (
        <section className={styles.goalDetailSection}>
          <div className={styles.goalDetailHeader}>
            <div>
              <div className={styles.detailTag}>Chi tiết các Goal được tải từ máy chủ</div>
              <h2 className={styles.detailTitle}>
                🎯 Danh sách Goal của: <span>{activeWork.work_name}</span>
              </h2>
              <p className={styles.detailSub}>
                Tổng cộng {selectedWorkGoals.length} mục tiêu • Hoàn thành{' '}
                {activeWork.progress_percentage ?? 0}%
              </p>
            </div>
            <div className={styles.detailActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleOpenCreateGoal}
              >
                + Thêm Goal mới
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setSelectedWorkId(null)}
              >
                Đóng chi tiết
              </button>
            </div>
          </div>

          {/* FORM THÊM / SỬA GOAL */}
          {showGoalForm && (
            <div className={styles.goalFormBox}>
              <h3 className={styles.goalFormTitle}>
                {editingGoalId ? 'Chỉnh sửa Mục tiêu (Goal)' : 'Thêm Mục tiêu (Goal) mới'}
              </h3>
              <form onSubmit={handleSaveGoal}>
                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label>Tên mục tiêu *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="Nhập tên mục tiêu cụ thể..."
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>Hạn chót (Deadline) *</label>
                    <input
                      type="date"
                      className={styles.inputField}
                      value={goalEndDate}
                      onChange={(e) => setGoalEndDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>Độ ưu tiên / Độ lớn (1 - 5)</label>
                    <select
                      className={styles.inputField}
                      value={goalRange}
                      onChange={(e) => setGoalRange(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((lv) => (
                        <option key={lv} value={lv}>
                          Mức {lv} {lv === 5 ? '(Rất quan trọng)' : lv === 1 ? '(Nhẹ)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRowSecond}>
                  <div className={styles.fieldGroup}>
                    <label>Ghi chú chi tiết</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="Mô tả các bước thực hiện..."
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>Màu đánh dấu</label>
                    <div className={styles.colorPickerRow}>
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`${styles.colorSwatch} ${
                            goalColor === c ? styles.selected : ''
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() => setGoalColor(c)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setShowGoalForm(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingGoalId ? 'Cập nhật Goal' : 'Lưu Goal'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DANH SÁCH GOALS ĐÃ FETCH */}
          {isLoadingGoals ? (
            <div className={styles.loadingGoals}>
              ⏳ Đang gửi fetch lấy chi tiết các Goal của &quot;{activeWork.work_name}&quot;...
            </div>
          ) : selectedWorkGoals.length === 0 ? (
            <div className={styles.emptyGoals}>
              <p>Đầu việc này hiện chưa có mục tiêu (Goal) nào.</p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleOpenCreateGoal}
              >
                + Tạo Goal đầu tiên cho đầu việc này
              </button>
            </div>
          ) : (
            <div className={styles.goalsList}>
              {selectedWorkGoals.map((goal) => {
                const badge = getDeadlineBadgeInfo(goal.goal_end_date);
                return (
                  <div
                    key={goal._id}
                    className={`${styles.goalItem} ${goal.goal_check ? styles.completed : ''}`}
                  >
                    <button
                      type="button"
                      className={`${styles.checkbox} ${goal.goal_check ? styles.checked : ''}`}
                      onClick={() => handleToggleGoalCheck(goal._id)}
                      title="Đánh dấu hoàn thành / chưa hoàn thành"
                    >
                      {goal.goal_check ? '✓' : ''}
                    </button>

                    <span
                      className={styles.goalColorDot}
                      style={{ backgroundColor: goal.goal_color || '#EF4444' }}
                    />

                    <div
                      className={styles.goalContent}
                      onClick={() => handleToggleGoalCheck(goal._id)}
                    >
                      <div className={styles.goalItemTitle}>{goal.goal_name}</div>
                      {goal.goal_description && (
                        <div className={styles.goalItemDesc}>{goal.goal_description}</div>
                      )}
                      <div className={styles.goalItemMeta}>
                        <span>⚡ Độ lớn: Mức {goal.goal_range || 1}</span>
                        <span>• Hạn: {formatDisplayDate(goal.goal_end_date)}</span>
                        {!goal.goal_check && (
                          <span className={`${styles.deadlineTag} ${styles[badge.status]}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.goalItemActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title="Sửa mục tiêu"
                        onClick={() => handleOpenEditGoal(goal)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.danger}`}
                        title="Xóa mục tiêu"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default WorkView;
