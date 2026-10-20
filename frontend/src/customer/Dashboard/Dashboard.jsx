/**
 * TÊN FILE: Dashboard.jsx
 * CÔNG DỤNG: Giao diện thứ nhất (Mặc định) - Bảng điều khiển tổng quan hiển thị 5 mục tiêu sắp tới hạn và 3 ngày đặc biệt sắp diễn ra.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/providers/AuthContext.jsx';
import { fetchDashboard, toggleCheckGoal } from '../../shared/services/work.service.js';
import { formatDisplayDate, getDeadlineBadgeInfo } from '../../shared/utils/dateFormat.js';
import styles from './Dashboard.module.scss';

const DEMO_OVERVIEW = {
  upcoming_goals: [
    {
      goal_id: 'demo-g1',
      goal_name: 'Hoàn thiện báo cáo phân tích yêu cầu CSBU109',
      goal_end_date: new Date(Date.now() + 86400000).toISOString(),
      goal_color: '#EF4444',
      goal_range: 4,
      work_id: 'demo-w1',
      work_name: 'Đồ án Công nghệ Phần mềm',
    },
    {
      goal_id: 'demo-g2',
      goal_name: 'Thiết kế giao diện 3 phân trang React + SCSS',
      goal_end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      goal_color: '#3B82F6',
      goal_range: 3,
      work_id: 'demo-w1',
      work_name: 'Đồ án Công nghệ Phần mềm',
    },
    {
      goal_id: 'demo-g3',
      goal_name: 'Ôn tập chương 4: Truy vấn MongoDB Embedded',
      goal_end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      goal_color: '#10B981',
      goal_range: 2,
      work_id: 'demo-w2',
      work_name: 'Cơ sở dữ liệu nâng cao',
    },
  ],
  upcoming_dates: [
    {
      date_id: 'demo-d1',
      date_name: 'Nộp báo cáo tiến độ giữa kỳ',
      date_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      date_color: '#F59E0B',
    },
    {
      date_id: 'demo-d2',
      date_name: 'Thuyết trình nhóm trên lớp',
      date_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      date_color: '#8B5CF6',
    },
  ],
};

/**
 * Component Dashboard tổng quan hiển thị bức tranh chung về các hạn chót và ngày kỷ niệm sắp tới.
 * @param {object} props - Gồm onOpenAuth, onNavigateTab, onSelectWorkFromDashboard
 */
export function Dashboard({ onOpenAuth, onNavigateTab, onSelectWorkFromDashboard }) {
  const { user, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState({ upcoming_goals: [], upcoming_dates: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Tải dữ liệu tổng quan từ API /api/dashboard.
   */
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await fetchDashboard();
      setOverview({
        upcoming_goals: data?.upcoming_goals || [],
        upcoming_dates: data?.upcoming_dates || [],
      });
    } catch {
      setErrorMsg('Không thể tải dữ liệu tổng quan lúc này.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isCancelled = false;

    fetchDashboard()
      .then((data) => {
        if (!isCancelled) {
          setOverview({
            upcoming_goals: data?.upcoming_goals || [],
            upcoming_dates: data?.upcoming_dates || [],
          });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setErrorMsg('Không thể tải dữ liệu tổng quan lúc này.');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  /**
   * Đánh dấu hoàn thành nhanh một mục tiêu ngay trên Dashboard và tải lại danh sách.
   * @param {string} workId - ID của đầu việc chứa mục tiêu
   * @param {string} goalId - ID của mục tiêu cần đánh dấu
   */
  const handleQuickCompleteGoal = async (workId, goalId) => {
    try {
      await toggleCheckGoal(workId, goalId);
      await loadDashboardData();
    } catch {
      setErrorMsg('Không thể cập nhật trạng thái mục tiêu.');
    }
  };

  /**
   * Chuyển sang trang Work và mở ngay đầu việc chứa mục tiêu được chọn.
   * @param {string} workId - ID đầu việc cần xem
   */
  const handleJumpToWork = (workId) => {
    if (onSelectWorkFromDashboard) {
      onSelectWorkFromDashboard(workId);
    } else if (onNavigateTab) {
      onNavigateTab('works');
    }
  };

  // ==========================================
  // RENDER CHO KHÁCH CHƯA ĐĂNG NHẬP
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className={styles.dashboard}>
        <section className={styles.heroBanner}>
          <div className={styles.heroBadge}>✨ Không gian quản lý gọn gàng - 3 Phân trang</div>
          <h1 className={styles.heroTitle}>
            Kiểm soát mọi <span>Đầu việc, Mục tiêu & Lịch trình</span> tại một nơi
          </h1>
          <p className={styles.heroDesc}>
            Hệ thống được chia thành 3 giao diện rõ ràng: <strong>Dashboard</strong> tổng hợp hạn chót,{' '}
            <strong>Đầu việc (Work)</strong> quản lý tiến độ vắn tắt và <strong>Lịch ngày nhớ</strong>{' '}
            theo dõi sự kiện quan trọng.
          </p>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => onOpenAuth('login')}
            >
              Đăng nhập ngay
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onOpenAuth('register')}
            >
              Tạo tài khoản mới
            </button>
          </div>
        </section>

        <div className={styles.navPreviewGrid}>
          <div className={styles.previewCard} onClick={() => onNavigateTab('dashboard')}>
            <div className={styles.previewIcon}>📊</div>
            <h3>1. Giao diện Dashboard</h3>
            <p>Tự động lọc ra 5 mục tiêu gần hạn nhất chưa xong và 3 sự kiện sắp diễn ra.</p>
          </div>
          <div className={styles.previewCard} onClick={() => onNavigateTab('works')}>
            <div className={styles.previewIcon}>📁</div>
            <h3>2. Giao diện Đầu việc (Work)</h3>
            <p>Hiển thị vắn tắt tên, thanh tiến độ và số lượng Goal. Bấm vào để tải chi tiết các Goal.</p>
          </div>
          <div className={styles.previewCard} onClick={() => onNavigateTab('calendar')}>
            <div className={styles.previewIcon}>📅</div>
            <h3>3. Giao diện Lịch ngày nhớ</h3>
            <p>Hiển thị lịch theo tháng của những ngày đặc biệt đã lưu kèm màu sắc trực quan.</p>
          </div>
        </div>

        <div className={styles.twoColGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>🎯 Mục tiêu sắp tới hạn (Xem trước)</h2>
                <p className={styles.panelSub}>Tối đa 5 mục tiêu gần nhất chưa hoàn thành</p>
              </div>
              <span className={styles.demoPill}>Chế độ mẫu</span>
            </div>
            <div className={styles.listContainer}>
              {DEMO_OVERVIEW.upcoming_goals.map((goal) => {
                const badge = getDeadlineBadgeInfo(goal.goal_end_date);
                return (
                  <div key={goal.goal_id} className={styles.goalRow}>
                    <span
                      className={styles.colorBar}
                      style={{ backgroundColor: goal.goal_color }}
                    />
                    <div className={styles.goalMain}>
                      <div className={styles.goalTitle}>{goal.goal_name}</div>
                      <div className={styles.goalMeta}>
                        <span className={styles.workTag}>📁 {goal.work_name}</span>
                        <span>• Độ ưu tiên: Mức {goal.goal_range}</span>
                      </div>
                    </div>
                    <div className={styles.goalRight}>
                      <span className={`${styles.deadlineBadge} ${styles[badge.status]}`}>
                        {badge.label}
                      </span>
                      <span className={styles.dateText}>
                        {formatDisplayDate(goal.goal_end_date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>📅 Ngày đặc biệt sắp tới (Xem trước)</h2>
                <p className={styles.panelSub}>3 mốc sự kiện gần nhất trong lịch</p>
              </div>
              <span className={styles.demoPill}>Chế độ mẫu</span>
            </div>
            <div className={styles.listContainer}>
              {DEMO_OVERVIEW.upcoming_dates.map((item) => {
                const badge = getDeadlineBadgeInfo(item.date_date);
                return (
                  <div key={item.date_id} className={styles.dateRow}>
                    <div
                      className={styles.dateBadgeBox}
                      style={{ borderColor: item.date_color }}
                    >
                      <span
                        className={styles.dateDot}
                        style={{ backgroundColor: item.date_color }}
                      />
                      <span>{formatDisplayDate(item.date_date)}</span>
                    </div>
                    <div className={styles.dateInfo}>
                      <div className={styles.dateName}>{item.date_name}</div>
                      <span className={`${styles.deadlineBadge} ${styles[badge.status]}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER CHO THÀNH VIÊN ĐÃ ĐĂNG NHẬP
  // ==========================================
  const { upcoming_goals: upcomingGoals, upcoming_dates: upcomingDates } = overview;

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Bảng điều khiển của <span>{user?.username}</span>
          </h1>
          <p className={styles.welcomeSub}>
            Tổng hợp nhanh các mục tiêu cần ưu tiên xử lý và các sự kiện sắp diễn ra.
          </p>
        </div>
        <div className={styles.quickActionGroup}>
          <button
            type="button"
            className={styles.btnQuickWork}
            onClick={() => onNavigateTab('works')}
          >
            📁 Quản lý Đầu việc
          </button>
          <button
            type="button"
            className={styles.btnQuickCalendar}
            onClick={() => onNavigateTab('calendar')}
          >
            📅 Mở Lịch ngày nhớ
          </button>
        </div>
      </div>

      {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

      {/* Thẻ tóm tắt nhanh */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🔥</div>
          <div>
            <div className={styles.summaryValue}>{upcomingGoals.length}</div>
            <div className={styles.summaryLabel}>Mục tiêu sắp tới hạn (Tối đa 5)</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📌</div>
          <div>
            <div className={styles.summaryValue}>{upcomingDates.length}</div>
            <div className={styles.summaryLabel}>Sự kiện sắp diễn ra (Tối đa 3)</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Đang đồng bộ dữ liệu tổng quan...</div>
      ) : (
        <div className={styles.twoColGrid}>
          {/* CỘT 1: 5 GOALS GẦN HẠN NHẤT */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>🎯 Mục tiêu cần hoàn thành sớm</h2>
                <p className={styles.panelSub}>
                  5 mục tiêu chưa hoàn thành có hạn chót gần nhất từ mọi đầu việc
                </p>
              </div>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => onNavigateTab('works')}
              >
                Xem tất cả Work →
              </button>
            </div>

            {upcomingGoals.length === 0 ? (
              <div className={styles.emptyPanel}>
                <p>Tuyệt vời! Bạn không có mục tiêu nào đang tồn đọng.</p>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onNavigateTab('works')}
                >
                  + Vào trang Đầu việc để thêm mới
                </button>
              </div>
            ) : (
              <div className={styles.listContainer}>
                {upcomingGoals.map((goal) => {
                  const badge = getDeadlineBadgeInfo(goal.goal_end_date);
                  return (
                    <div key={goal.goal_id} className={styles.goalRow}>
                      <button
                        type="button"
                        className={styles.checkTrigger}
                        onClick={() => handleQuickCompleteGoal(goal.work_id, goal.goal_id)}
                        title="Đánh dấu hoàn thành mục tiêu này"
                      >
                        ✓
                      </button>
                      <span
                        className={styles.colorBar}
                        style={{ backgroundColor: goal.goal_color || '#EF4444' }}
                      />
                      <div
                        className={styles.goalMain}
                        onClick={() => handleJumpToWork(goal.work_id)}
                        title="Bấm để mở chi tiết đầu việc này"
                      >
                        <div className={styles.goalTitle}>{goal.goal_name}</div>
                        <div className={styles.goalMeta}>
                          <span className={styles.workTag}>📁 {goal.work_name}</span>
                          {goal.goal_range && <span>• Độ lớn: {goal.goal_range}</span>}
                        </div>
                      </div>
                      <div className={styles.goalRight}>
                        <span className={`${styles.deadlineBadge} ${styles[badge.status]}`}>
                          {badge.label}
                        </span>
                        <span className={styles.dateText}>
                          {formatDisplayDate(goal.goal_end_date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* CỘT 2: 3 NGÀY ĐẶC BIỆT SẮP TỚI */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>📅 Ngày đặc biệt sắp tới</h2>
                <p className={styles.panelSub}>3 mốc thời gian quan trọng gần nhất bạn đã lưu</p>
              </div>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => onNavigateTab('calendar')}
              >
                Mở Lịch →
              </button>
            </div>

            {upcomingDates.length === 0 ? (
              <div className={styles.emptyPanel}>
                <p>Chưa có sự kiện hay ngày đặc biệt nào sắp diễn ra.</p>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onNavigateTab('calendar')}
                >
                  + Lưu ngày đặc biệt trên Lịch
                </button>
              </div>
            ) : (
              <div className={styles.listContainer}>
                {upcomingDates.map((item) => {
                  const badge = getDeadlineBadgeInfo(item.date_date);
                  return (
                    <div
                      key={item.date_id}
                      className={styles.dateRow}
                      onClick={() => onNavigateTab('calendar')}
                    >
                      <div
                        className={styles.dateBadgeBox}
                        style={{ borderColor: item.date_color || '#3B82F6' }}
                      >
                        <span
                          className={styles.dateDot}
                          style={{ backgroundColor: item.date_color || '#3B82F6' }}
                        />
                        <span>{formatDisplayDate(item.date_date)}</span>
                      </div>
                      <div className={styles.dateInfo}>
                        <div className={styles.dateName}>{item.date_name}</div>
                        <span className={`${styles.deadlineBadge} ${styles[badge.status]}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
