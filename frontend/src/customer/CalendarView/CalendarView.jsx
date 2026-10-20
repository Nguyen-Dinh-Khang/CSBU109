/**
 * TÊN FILE: CalendarView.jsx
 * CÔNG DỤNG: Giao diện thứ ba - Hiển thị lưới Lịch theo tháng/năm của các ngày đặc biệt đã lưu và cho phép Thêm, Sửa, Xóa ngày đặc biệt.
 * PHẠM VI DÙNG: Phân hệ Customer (CalendarView).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../app/providers/AuthContext.jsx';
import {
  fetchDates,
  createDate,
  updateDate,
  deleteDate,
} from '../../shared/services/work.service.js';
import {
  formatDisplayDate,
  toInputDateValue,
  getDeadlineBadgeInfo,
} from '../../shared/utils/dateFormat.js';
import styles from './CalendarView.module.scss';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const COLOR_PRESETS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const DEMO_DATES = [
  {
    _id: 'demo-date-1',
    date_name: 'Nộp báo cáo tiến độ đồ án',
    date_date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
    date_color: '#F59E0B',
  },
  {
    _id: 'demo-date-2',
    date_name: 'Thi giữa kỳ Cơ sở dữ liệu',
    date_date: new Date(new Date().getFullYear(), new Date().getMonth(), 22).toISOString(),
    date_color: '#EF4444',
  },
  {
    _id: 'demo-date-3',
    date_name: 'Họp nhóm tổng kết Sprint',
    date_date: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
    date_color: '#10B981',
  },
];

/**
 * Sinh danh sách 42 ô ngày cho một lưới lịch tháng (bắt đầu từ Thứ 2).
 * @param {number} year - Năm hiển thị
 * @param {number} month - Tháng hiển thị (1 - 12)
 * @returns {Array} - Mảng các ô lịch
 */
function buildCalendarCells(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Quy đổi getDay() (CN = 0, T2 = 1... T7 = 6) sang chuẩn T2 = 0 ... CN = 6
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  const cells = [];

  for (let i = 0; i < startDayOffset; i += 1) {
    cells.push({ isEmpty: true, key: `empty-start-${i}` });
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      isEmpty: false,
      day,
      dateStr,
      key: dateStr,
    });
  }

  return cells;
}

/**
 * Component hiển thị Lịch các ngày đã lưu (CalendarView).
 * @param {object} props - Gồm hàm mở hộp thoại đăng nhập onOpenAuth
 */
export function CalendarView({ onOpenAuth }) {
  const { isAuthenticated } = useAuth();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [savedDates, setSavedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State biểu mẫu Thêm / Sửa ngày đặc biệt
  const [editingDateId, setEditingDateId] = useState(null);
  const [dateName, setDateName] = useState('');
  const [dateValue, setDateValue] = useState(() => toInputDateValue(new Date()));
  const [dateColor, setDateColor] = useState('#3B82F6');

  /**
   * Tải danh sách các ngày đặc biệt đã lưu trong tháng và năm đang chọn từ API GET /api/dates.
   */
  const loadSavedDates = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedDates(DEMO_DATES);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await fetchDates(currentMonth, currentYear);
      setSavedDates(data);
    } catch {
      setErrorMsg('Không thể tải dữ liệu lịch của tháng này.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentMonth, currentYear]);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated) {
      Promise.resolve(DEMO_DATES).then((demoList) => {
        if (!isCancelled) {
          setSavedDates(demoList);
        }
      });
      return () => {
        isCancelled = true;
      };
    }

    fetchDates(currentMonth, currentYear)
      .then((data) => {
        if (!isCancelled) {
          setSavedDates(data);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setErrorMsg('Không thể tải dữ liệu lịch của tháng này.');
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
  }, [isAuthenticated, currentMonth, currentYear]);

  /**
   * Chuyển về tháng trước.
   */
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  /**
   * Chuyển sang tháng tiếp theo.
   */
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  /**
   * Quay về tháng và năm hiện tại.
   */
  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth() + 1);
    setCurrentYear(now.getFullYear());
    setDateValue(toInputDateValue(now));
  };

  /**
   * Khi người dùng bấm vào một ô ngày trên lịch, tự động điền ngày đó vào biểu mẫu lưu ngày.
   * @param {string} dateStr - Chuỗi ngày định dạng YYYY-MM-DD
   */
  const handleClickCalendarDay = (dateStr) => {
    setEditingDateId(null);
    setDateValue(dateStr);
  };

  /**
   * Đưa thông tin một ngày đã lưu lên biểu mẫu để chỉnh sửa.
   * @param {object} item - Bản ghi ngày đặc biệt
   */
  const handleStartEditDate = (item) => {
    setEditingDateId(item._id);
    setDateName(item.date_name || '');
    setDateValue(toInputDateValue(item.date_date));
    setDateColor(item.date_color || '#3B82F6');
  };

  /**
   * Đặt lại biểu mẫu về trạng thái thêm mới.
   */
  const handleResetForm = () => {
    setEditingDateId(null);
    setDateName('');
    setDateValue(toInputDateValue(new Date()));
    setDateColor('#3B82F6');
  };

  /**
   * Lưu ngày đặc biệt (tạo mới hoặc cập nhật) thông qua API.
   * @param {object} e - Sự kiện submit form
   */
  const handleSaveDate = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }

    if (!dateName.trim() || !dateValue) {
      setErrorMsg('Vui lòng nhập tên sự kiện và chọn ngày.');
      return;
    }

    try {
      setErrorMsg('');
      const payload = {
        date_name: dateName.trim(),
        date_date: dateValue,
        date_color: dateColor,
      };

      if (editingDateId) {
        await updateDate(editingDateId, payload);
      } else {
        await createDate(payload);
      }

      handleResetForm();
      await loadSavedDates();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể lưu ngày đặc biệt.');
    }
  };

  /**
   * Xóa một ngày đặc biệt đã lưu.
   * @param {string} dateId - ID ngày đặc biệt cần xóa
   */
  const handleDeleteDate = async (dateId) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa ngày đã lưu này khỏi lịch?')) return;

    try {
      await deleteDate(dateId);
      setSavedDates((prev) => prev.filter((d) => d._id !== dateId));
      if (editingDateId === dateId) {
        handleResetForm();
      }
    } catch {
      setErrorMsg('Không thể xóa ngày đã lưu.');
    }
  };

  // Nhóm các sự kiện theo ngày (YYYY-MM-DD) để hiển thị ngay trên ô lịch
  const eventsByDayMap = useMemo(() => {
    const map = {};
    savedDates.forEach((item) => {
      const key = toInputDateValue(item.date_date);
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(item);
    });
    return map;
  }, [savedDates]);

  const calendarCells = useMemo(
    () => buildCalendarCells(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const todayStr = toInputDateValue(new Date());

  return (
    <div className={styles.calendarView}>
      <div className={styles.topHeader}>
        <div>
          <h1 className={styles.pageTitle}>📅 Lịch các ngày đã lưu</h1>
          <p className={styles.pageSubtitle}>
            Theo dõi trực quan các mốc sự kiện, lịch thi, hạn nộp quan trọng theo từng tháng. Bấm vào
            một ô ngày bất kỳ trên lịch để lưu nhanh sự kiện cho ngày đó.
          </p>
        </div>

        <div className={styles.monthControls}>
          <button type="button" className={styles.navBtn} onClick={handlePrevMonth}>
            ◀ Tháng trước
          </button>
          <div className={styles.currentMonthLabel}>
            Tháng {currentMonth} / {currentYear}
          </div>
          <button type="button" className={styles.navBtn} onClick={handleNextMonth}>
            Tháng sau ▶
          </button>
          <button type="button" className={styles.todayBtn} onClick={handleGoToday}>
            Hôm nay
          </button>
        </div>
      </div>

      {!isAuthenticated && (
        <div className={styles.guestNotice}>
          <span>👀 Bạn đang xem Lịch ở chế độ mẫu. Hãy đăng nhập để lưu các ngày quan trọng của bạn!</span>
          <button type="button" className={styles.btnSmallAuth} onClick={() => onOpenAuth('login')}>
            Đăng nhập
          </button>
        </div>
      )}

      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <div className={styles.mainLayout}>
        {/* CỘT TRÁI: LƯỚI LỊCH THÁNG */}
        <section className={styles.calendarBoard}>
          <div className={styles.weekdaysRow}>
            {WEEKDAYS.map((dayName) => (
              <div key={dayName} className={styles.weekdayCell}>
                {dayName}
              </div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {calendarCells.map((cell) => {
              if (cell.isEmpty) {
                return <div key={cell.key} className={styles.emptyCell} />;
              }

              const dayEvents = eventsByDayMap[cell.dateStr] || [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === dateValue;

              return (
                <div
                  key={cell.key}
                  className={`${styles.dayCell} ${isToday ? styles.todayCell : ''} ${
                    isSelected ? styles.selectedCell : ''
                  } ${dayEvents.length > 0 ? styles.hasEventCell : ''}`}
                  onClick={() => handleClickCalendarDay(cell.dateStr)}
                >
                  <div className={styles.dayCellHeader}>
                    <span className={styles.dayNumber}>{cell.day}</span>
                    {isToday && <span className={styles.todayDot}>Hôm nay</span>}
                  </div>

                  <div className={styles.cellEventsList}>
                    {dayEvents.map((ev) => (
                      <div
                        key={ev._id}
                        className={styles.eventChip}
                        style={{
                          backgroundColor: `${ev.date_color || '#3B82F6'}22`,
                          borderLeftColor: ev.date_color || '#3B82F6',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditDate(ev);
                        }}
                        title={ev.date_name}
                      >
                        {ev.date_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CỘT PHẢI: BIỂU MẪU LƯU NGÀY & DANH SÁCH NGÀY ĐÃ LƯU TRONG THÁNG */}
        <aside className={styles.sideColumn}>
          <div className={styles.formCard}>
            <h2 className={styles.sideTitle}>
              {editingDateId ? '✎ Chỉnh sửa ngày đã lưu' : '📌 Lưu ngày đặc biệt mới'}
            </h2>
            <form onSubmit={handleSaveDate} className={styles.dateForm}>
              <div className={styles.fieldGroup}>
                <label>Tên sự kiện / ngày cần nhớ *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Ví dụ: Bảo vệ đồ án, Sinh nhật, Thi cuối kỳ..."
                  value={dateName}
                  onChange={(e) => setDateName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Ngày diễn ra *</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Màu đánh dấu trên lịch</label>
                <div className={styles.colorRow}>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.colorSwatch} ${dateColor === c ? styles.selected : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setDateColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.formBtnRow}>
                {editingDateId && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleResetForm}
                  >
                    Hủy sửa
                  </button>
                )}
                <button type="submit" className={styles.btnPrimary}>
                  {editingDateId ? 'Cập nhật ngày' : '+ Lưu vào Lịch'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.savedListCard}>
            <div className={styles.savedListHeader}>
              <h2 className={styles.sideTitle}>
                Danh sách tháng {currentMonth}/{currentYear}
              </h2>
              <span className={styles.countBadge}>{savedDates.length} ngày</span>
            </div>

            {isLoading ? (
              <div className={styles.emptySaved}>Đang tải các ngày đã lưu...</div>
            ) : savedDates.length === 0 ? (
              <div className={styles.emptySaved}>
                Chưa có ngày đặc biệt nào được lưu trong tháng {currentMonth}/{currentYear}.
              </div>
            ) : (
              <div className={styles.savedItems}>
                {savedDates.map((item) => {
                  const badge = getDeadlineBadgeInfo(item.date_date);
                  return (
                    <div key={item._id} className={styles.savedItemRow}>
                      <div
                        className={styles.savedColorBar}
                        style={{ backgroundColor: item.date_color || '#3B82F6' }}
                      />
                      <div className={styles.savedInfo}>
                        <div className={styles.savedName}>{item.date_name}</div>
                        <div className={styles.savedMeta}>
                          <span>{formatDisplayDate(item.date_date)}</span>
                          <span className={`${styles.deadlinePill} ${styles[badge.status]}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className={styles.savedActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Chỉnh sửa"
                          onClick={() => handleStartEditDate(item)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.danger}`}
                          title="Xóa"
                          onClick={() => handleDeleteDate(item._id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CalendarView;
