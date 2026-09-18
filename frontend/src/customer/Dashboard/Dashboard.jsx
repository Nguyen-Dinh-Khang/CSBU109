/**
 * TÊN FILE: Dashboard.jsx
 * CÔNG DỤNG: Giao diện chính theo dõi lịch trình, môn học, dự án chia nhỏ theo giai đoạn, phân biệt chế độ Khách (Demo) và Thành viên.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../app/providers/AuthContext.jsx';
import {
  fetchScheduleItems,
  createScheduleItem,
  toggleScheduleStage,
  deleteScheduleItem,
} from '../../shared/services/schedule.service.js';
import styles from './Dashboard.module.scss';

// Dữ liệu mẫu tương tác dành riêng cho chế độ Khách xem trước (Guest Demo)
const INITIAL_DEMO_ITEMS = [
  {
    _id: 'demo-1',
    title: 'Môn học: Lập trình Web nâng cao',
    category: 'Môn học',
    description: 'Học phần đồ án ứng dụng web đa người dùng với React và Express.',
    stages: [
      { _id: 'd1-s1', title: 'Thiết kế giao diện mẫu trên Figma', isCompleted: true },
      { _id: 'd1-s2', title: 'Xây dựng Backend Auth với JWT và Cookie', isCompleted: true },
      { _id: 'd1-s3', title: 'Tích hợp SCSS Modules và Dashboard cá nhân', isCompleted: false },
      { _id: 'd1-s4', title: 'Kiểm thử toàn diện và báo cáo đồ án', isCompleted: false },
    ],
    progressPercentage: 50,
  },
  {
    _id: 'demo-2',
    title: 'Dự án: Trợ lý học tập thông minh AI',
    category: 'Dự án',
    description: 'Nghiên cứu mô hình ngôn ngữ lớn để tóm tắt bài giảng môn học.',
    stages: [
      { _id: 'd2-s1', title: 'Thu thập tài liệu và giáo trình tham khảo', isCompleted: true },
      { _id: 'd2-s2', title: 'Tích hợp API Gemini tạo câu hỏi ôn tập', isCompleted: false },
      { _id: 'd2-s3', title: 'Triển khai thử nghiệm cho nhóm sinh viên', isCompleted: false },
    ],
    progressPercentage: 33,
  },
];

/**
 * Component Dashboard chính hiển thị lịch trình và các giai đoạn đầu việc.
 * @param {object} props - Thuộc tính component gồm hàm mở modal xác thực onOpenAuth
 */
export function Dashboard({ onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();

  // State dành cho khách xem demo
  const [demoItems, setDemoItems] = useState(INITIAL_DEMO_ITEMS);

  // State dành cho thành viên đã đăng nhập
  const [realItems, setRealItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Tất cả');

  // State mở form thêm mới
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Môn học');
  const [newDesc, setNewDesc] = useState('');
  const [newStages, setNewStages] = useState([]);
  const [stageInputText, setStageInputText] = useState('');
  const [formError, setFormError] = useState('');

  /**
   * Tải danh sách lịch trình thật của người dùng từ API.
   */
  const loadUserSchedules = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsFetching(true);
      const items = await fetchScheduleItems();
      setRealItems(items);
    } catch {
      setRealItems([]);
    } finally {
      setIsFetching(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUserSchedules();
  }, [loadUserSchedules]);

  /**
   * Xử lý chuyển đổi trạng thái hoàn thành giai đoạn trên bản Demo của khách.
   * @param {string} itemId - ID mục demo
   * @param {string} stageId - ID giai đoạn nhỏ
   */
  const handleToggleDemoStage = (itemId, stageId) => {
    setDemoItems((prev) =>
      prev.map((item) => {
        if (item._id !== itemId) return item;
        const updatedStages = item.stages.map((stage) => {
          if (stage._id === stageId) {
            return { ...stage, isCompleted: !stage.isCompleted };
          }
          return stage;
        });
        const completedCount = updatedStages.filter((s) => s.isCompleted).length;
        const progressPercentage = Math.round((completedCount / updatedStages.length) * 100);
        return {
          ...item,
          stages: updatedStages,
          progressPercentage,
        };
      })
    );
  };

  /**
   * Xử lý chuyển đổi trạng thái hoàn thành giai đoạn thật của thành viên qua API.
   * @param {string} itemId - ID môn học/dự án
   * @param {string} stageId - ID giai đoạn nhỏ
   * @param {boolean} currentStatus - Trạng thái hiện tại
   */
  const handleToggleRealStage = async (itemId, stageId, currentStatus) => {
    try {
      const updated = await toggleScheduleStage(itemId, stageId, !currentStatus);
      if (updated) {
        setRealItems((prev) =>
          prev.map((item) => (item._id === itemId ? updated : item))
        );
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật giai đoạn:', err);
    }
  };

  /**
   * Thêm một giai đoạn nhỏ vào danh sách tạm khi tạo mới.
   */
  const handleAddStageToForm = () => {
    if (!stageInputText.trim()) return;
    setNewStages((prev) => [...prev, { title: stageInputText.trim(), isCompleted: false }]);
    setStageInputText('');
  };

  /**
   * Xóa một giai đoạn nhỏ khỏi danh sách tạm.
   * @param {number} index - Vị trí giai đoạn cần xóa
   */
  const handleRemoveStageFromForm = (index) => {
    setNewStages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Gửi yêu cầu lưu môn học / dự án mới qua Service.
   * @param {object} e - Form event
   */
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      setFormError('Vui lòng nhập tên môn học hoặc dự án.');
      return;
    }

    if (newStages.length === 0) {
      setFormError('Hãy thêm ít nhất 1 giai đoạn nhỏ để theo dõi tiến độ.');
      return;
    }

    try {
      const created = await createScheduleItem({
        title: newTitle.trim(),
        category: newCategory,
        description: newDesc.trim(),
        stages: newStages,
      });

      if (created) {
        setRealItems((prev) => [created, ...prev]);
        setNewTitle('');
        setNewDesc('');
        setNewStages([]);
        setShowAddForm(false);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Không thể tạo môn học / dự án.');
    }
  };

  /**
   * Xử lý xóa một mục môn học / dự án.
   * @param {string} itemId - ID mục cần xóa
   */
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa môn học / dự án này?')) return;
    try {
      await deleteScheduleItem(itemId);
      setRealItems((prev) => prev.filter((it) => it._id !== itemId));
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
    }
  };

  // Tính toán thống kê dữ liệu thành viên
  const stats = useMemo(() => {
    const totalItems = realItems.length;
    let totalStages = 0;
    let completedStages = 0;

    realItems.forEach((item) => {
      if (item.stages) {
        totalStages += item.stages.length;
        completedStages += item.stages.filter((s) => s.isCompleted).length;
      }
    });

    const averageProgress =
      totalItems > 0
        ? Math.round(
            realItems.reduce((acc, it) => acc + (it.progressPercentage || 0), 0) / totalItems
          )
        : 0;

    return { totalItems, totalStages, completedStages, averageProgress };
  }, [realItems]);

  // Lọc danh sách theo danh mục
  const filteredItems = useMemo(() => {
    if (filterCategory === 'Tất cả') return realItems;
    return realItems.filter((it) => it.category === filterCategory);
  }, [realItems, filterCategory]);

  // ==========================================
  // RENDER: GIAO DIỆN CHƯA ĐĂNG NHẬP (GUEST VIEW)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className={styles.dashboard}>
        <section className={styles.heroSection}>
          <div className={styles.badgePill}>
            <span>🚀 Quản lý Lịch trình & Đầu việc Thông minh</span>
          </div>
          <h1 className={styles.heroTitle}>
            Theo dõi tiến độ học tập và dự án <span>từng bước một</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Không còn bối rối trước những đồ án lớn hay môn học phức tạp. Hãy chia nhỏ mọi mục tiêu
            thành các giai đoạn rõ ràng và theo dõi tỷ lệ hoàn thành trực quan ngay hôm nay!
          </p>

          <div className={styles.heroCta}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => onOpenAuth('register')}
            >
              Bắt đầu miễn phí (Đăng ký)
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onOpenAuth('login')}
            >
              Đăng nhập tài khoản
            </button>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3 className={styles.featureTitle}>Chia nhỏ giai đoạn (Milestones)</h3>
              <p className={styles.featureDesc}>
                Phân rã môn học hoặc dự án thành từng mốc công việc nhỏ: Nghiên cứu, Báo cáo giữa kỳ,
                Đóng gói đồ án.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Thước đo % trực quan</h3>
              <p className={styles.featureDesc}>
                Tự động tính toán phần trăm tiến độ ngay khi bạn đánh dấu hoàn thành từng giai đoạn.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3 className={styles.featureTitle}>Bảo mật Cookie & Refresh Token</h3>
              <p className={styles.featureDesc}>
                Tài khoản lưu trữ an toàn, phiên đăng nhập tự động duy trì mượt mà và không lo bị đánh cắp thông tin.
              </p>
            </div>
          </div>
        </section>

        {/* BẢNG DEMO TƯƠNG TÁC CHO KHÁCH */}
        <section className={styles.demoContainer}>
          <div className={styles.demoHeader}>
            <span className={styles.demoTag}>Chế độ xem trước tương tác</span>
            <h2 className={styles.demoTitle}>Trải nghiệm ngay bản Demo bên dưới</h2>
            <p className={styles.demoSub}>
              Bạn có thể click vào các ô checkbox dưới đây để thấy thanh % tiến độ thay đổi ngay lập tức!
            </p>
          </div>

          <div className={styles.itemsGrid}>
            {demoItems.map((item) => (
              <div key={item._id} className={styles.itemCard}>
                <div className={styles.itemCardHeader}>
                  <span
                    className={`${styles.itemCategory} ${
                      item.category === 'Dự án' ? styles.project : ''
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className={styles.demoTag}>Demo</span>
                </div>

                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDesc}>{item.description}</p>

                <div className={styles.progressContainer}>
                  <div className={styles.progressLabelRow}>
                    <span>Tiến độ hoàn thành</span>
                    <span
                      className={`${styles.progressPercentage} ${
                        item.progressPercentage === 100 ? styles.completed : ''
                      }`}
                    >
                      {item.progressPercentage}%
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={`${styles.progressBarFill} ${
                        item.progressPercentage === 100 ? styles.completed : ''
                      }`}
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className={styles.stagesHeader}>Các giai đoạn cần hoàn thành:</div>
                <div className={styles.stageList}>
                  {item.stages.map((stage) => (
                    <div
                      key={stage._id}
                      className={`${styles.stageItem} ${stage.isCompleted ? styles.completed : ''}`}
                      onClick={() => handleToggleDemoStage(item._id, stage._id)}
                    >
                      <div
                        className={`${styles.checkbox} ${stage.isCompleted ? styles.checked : ''}`}
                      >
                        {stage.isCompleted ? '✓' : ''}
                      </div>
                      <span className={styles.stageTitle}>{stage.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // RENDER: GIAO DIỆN ĐÃ ĐĂNG NHẬP (MEMBER VIEW)
  // ==========================================
  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeBanner}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Xin chào, <span>{user?.username}</span>!
            <span className={styles.welcomeUserId}>Mã ID: #{user?.userId}</span>
          </h1>
          <p className={styles.welcomeText}>
            Dưới đây là bảng theo dõi lịch trình môn học và các dự án cá nhân của bạn.
          </p>
        </div>
        <button
          type="button"
          className={styles.btnAdd}
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? '✕ Đóng biểu mẫu' : '+ Thêm Môn học / Dự án mới'}
        </button>
      </div>

      {/* THẺ THỐNG KÊ */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalItems}</span>
            <span className={styles.statLabel}>Môn học & Dự án</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {stats.completedStages}/{stats.totalStages}
            </span>
            <span className={styles.statLabel}>Giai đoạn đã hoàn thành</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.averageProgress}%</span>
            <span className={styles.statLabel}>Tiến độ trung bình</span>
          </div>
        </div>
      </div>

      {/* BIỂU MẪU THÊM MỚI (INLINE) */}
      {showAddForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Thêm Môn học hoặc Dự án mới</h2>
          {formError && <div className={styles.emptyState}>{formError}</div>}

          <form onSubmit={handleSaveSchedule}>
            <div className={styles.formGrid}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Tên môn học / dự án (Ví dụ: Cơ sở dữ liệu, Thiết kế UI/UX...)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <select
                className={styles.selectField}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Môn học">Môn học</option>
                <option value="Dự án">Dự án</option>
                <option value="Mục tiêu cá nhân">Mục tiêu cá nhân</option>
              </select>
            </div>

            <input
              type="text"
              className={styles.inputField}
              placeholder="Mô tả ngắn gọn về mục tiêu..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />

            <div className={styles.stageListInput}>
              <div className={styles.stagesHeader}>Các giai đoạn nhỏ của mục này:</div>
              <div>
                {newStages.map((st, idx) => (
                  <span key={idx} className={styles.stageTagItem}>
                    Giai đoạn {idx + 1}: {st.title}
                    <button
                      type="button"
                      className={styles.btnRemoveStage}
                      onClick={() => handleRemoveStageFromForm(idx)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className={styles.stageInputRow}>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Nhập tên giai đoạn (Ví dụ: Làm bài tập tuần 1, Báo cáo đề cương...)"
                  value={stageInputText}
                  onChange={(e) => setStageInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStageToForm();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleAddStageToForm}
                >
                  + Thêm giai đoạn
                </button>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowAddForm(false)}
              >
                Hủy bỏ
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Lưu vào hệ thống
              </button>
            </div>
          </form>
        </div>
      )}

      {/* THANH CÔNG CỤ BỘ LỌC */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['Tất cả', 'Môn học', 'Dự án', 'Mục tiêu cá nhân'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filterBtn} ${filterCategory === cat ? styles.active : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH CARDS THÀNH VIÊN */}
      {isFetching ? (
        <div className={styles.emptyState}>
          <p>Đang tải dữ liệu lịch trình của bạn...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Chưa có mục nào trong danh sách. Hãy nhấn nút thêm mới để bắt đầu theo dõi!</p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setShowAddForm(true)}
          >
            + Thêm môn học / dự án đầu tiên
          </button>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <div key={item._id} className={styles.itemCard}>
              <div className={styles.itemCardHeader}>
                <span
                  className={`${styles.itemCategory} ${
                    item.category === 'Dự án'
                      ? styles.project
                      : item.category === 'Mục tiêu cá nhân'
                      ? styles.goal
                      : ''
                  }`}
                >
                  {item.category}
                </span>
                <button
                  type="button"
                  className={styles.btnDelete}
                  title="Xóa mục này"
                  onClick={() => handleDeleteItem(item._id)}
                >
                  🗑
                </button>
              </div>

              <h3 className={styles.itemTitle}>{item.title}</h3>
              {item.description && <p className={styles.itemDesc}>{item.description}</p>}

              <div className={styles.progressContainer}>
                <div className={styles.progressLabelRow}>
                  <span>Tiến độ thực tế</span>
                  <span
                    className={`${styles.progressPercentage} ${
                      item.progressPercentage === 100 ? styles.completed : ''
                    }`}
                  >
                    {item.progressPercentage}%
                  </span>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={`${styles.progressBarFill} ${
                      item.progressPercentage === 100 ? styles.completed : ''
                    }`}
                    style={{ width: `${item.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className={styles.stagesHeader}>Các giai đoạn:</div>
              <div className={styles.stageList}>
                {item.stages &&
                  item.stages.map((stage) => (
                    <div
                      key={stage._id}
                      className={`${styles.stageItem} ${stage.isCompleted ? styles.completed : ''}`}
                      onClick={() =>
                        handleToggleRealStage(item._id, stage._id, stage.isCompleted)
                      }
                    >
                      <div
                        className={`${styles.checkbox} ${stage.isCompleted ? styles.checked : ''}`}
                      >
                        {stage.isCompleted ? '✓' : ''}
                      </div>
                      <span className={styles.stageTitle}>{stage.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
