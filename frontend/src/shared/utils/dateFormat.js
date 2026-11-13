/**
 * TÊN FILE: dateFormat.js
 * CÔNG DỤNG: Cung cấp các hàm tiện ích định dạng ngày tháng và tính khoảng cách ngày cho các giao diện Dashboard, Work và Calendar.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared Utils).
 */

/**
 * Định dạng chuỗi ngày ISO hoặc đối tượng Date sang chuỗi hiển thị dd/mm/yyyy.
 * @param {string|Date} dateValue - Giá trị ngày đầu vào
 * @returns {string} - Chuỗi ngày định dạng dd/mm/yyyy
 */
export function formatDisplayDate(dateValue) {
  if (!dateValue) return '';
  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Chuyển đổi đối tượng Date hoặc chuỗi ISO sang định dạng YYYY-MM-DD dùng cho thẻ <input type="date" />.
 * @param {string|Date} dateValue - Giá trị ngày đầu vào
 * @returns {string} - Chuỗi YYYY-MM-DD
 */
export function toInputDateValue(dateValue) {
  if (!dateValue) return '';
  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Tính số ngày chênh lệch từ hôm nay tới một ngày mục tiêu (dương là còn hạn, âm là quá hạn, 0 là hôm nay).
 * @param {string|Date} targetDate - Ngày mục tiêu
 * @returns {number} - Số ngày chênh lệch
 */
export function getDaysRemaining(targetDate) {
  if (!targetDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Trả về nhãn văn bản mô tả trạng thái thời hạn dựa trên số ngày còn lại.
 * @param {string|Date} targetDate - Ngày mục tiêu
 * @returns {object} - Gồm label (chuỗi mô tả) và status ('overdue' | 'today' | 'soon' | 'normal')
 */
export function getDeadlineBadgeInfo(targetDate) {
  const days = getDaysRemaining(targetDate);

  if (days < 0) {
    return {
      label: `Quá hạn ${Math.abs(days)} ngày`,
      status: 'overdue',
    };
  }
  if (days === 0) {
    return {
      label: 'Hôm nay',
      status: 'today',
    };
  }
  if (days <= 3) {
    return {
      label: `Còn ${days} ngày`,
      status: 'soon',
    };
  }
  return {
    label: `Còn ${days} ngày`,
    status: 'normal',
  };
}

/**
 * Định dạng ngày giờ hiển thị dạng HH:mm dd/MM/yyyy.
 * @param {string|Date} dateValue - Giá trị ngày đầu vào
 * @returns {string} - Chuỗi ngày giờ
 */
export function formatDateTime(dateValue) {
  if (!dateValue) return '';
  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return '';
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const dateStr = formatDisplayDate(dateObj);
  return `${hours}:${minutes} ${dateStr}`;
}

/**
 * Trả về chuỗi mô tả thời gian tương đối ngắn gọn (ví dụ: Vừa xong, 5 phút trước, 2 giờ trước).
 * @param {string|Date} dateValue - Giá trị ngày đầu vào
 * @returns {string} - Chuỗi mô tả tương đối
 */
export function formatRelativeTime(dateValue) {
  if (!dateValue) return '';
  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return '';

  const now = Date.now();
  const diffSec = Math.floor((now - dateObj.getTime()) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDisplayDate(dateObj);
}
