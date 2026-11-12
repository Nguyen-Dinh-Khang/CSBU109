/**
 * TÊN FILE: date.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý ngày đặc biệt và sự kiện lịch trình (Date Management): tạo mới, lọc theo tháng/năm, cập nhật và xóa.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { User } from '../../models/common/User.js';

/**
 * Tìm kiếm thực thể người dùng theo Mongo _id hoặc numeric userId.
 * Hỗ trợ tham số projection để chỉ lấy các trường cần thiết.
 * @param {string|number} userId - Định danh người dùng
 * @param {string|object} [projection=null] - Trường cần lấy (ví dụ: 'dates')
 * @returns {Promise<object>} - Document User
 */
async function findUserById(userId, projection = null) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  let q = User.findOne(query);
  if (projection) {
    q = q.select(projection);
  }
  const user = await q;
  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

/**
 * Chuẩn hóa giá trị ngày đầu vào thành Date object an toàn với múi giờ.
 * Nếu là chuỗi YYYY-MM-DD, đặt vào 12:00:00 UTC để tránh lệch ngày/tháng ở bất kỳ múi giờ nào.
 * @param {string|Date} dateValue - Giá trị ngày đầu vào
 * @returns {Date} - Đối tượng Date đã chuẩn hóa
 */
function normalizeDateInput(dateValue) {
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
    return new Date(`${dateValue.trim()}T12:00:00.000Z`);
  }
  return new Date(dateValue);
}

/**
 * Function 3: Tạo ngày đặc biệt mới cho người dùng.
 * Chỉ nạp mảng dates thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {object} dateData - Dữ liệu ngày đặc biệt gồm date_name, date_date, date_color
 * @returns {Promise<object>} - Object ngày đặc biệt vừa tạo
 */
export async function createDate(userId, dateData) {
  const user = await findUserById(userId, 'dates');

  const { date_name, date_date, date_color } = dateData;

  const newDate = {
    date_name,
    date_date: normalizeDateInput(date_date),
    date_color: date_color || '#3B82F6',
  };

  user.dates.push(newDate);
  await user.save();

  return user.dates[user.dates.length - 1];
}

/**
 * Function 9: Lấy danh sách ngày đặc biệt theo tháng và năm để hiển thị lên giao diện Lịch.
 * Kiểm tra đa múi giờ (UTC, Local, UTC+7) để ngăn chặn lệch ngày đầu tháng hoặc cuối tháng.
 * Chỉ truy vấn duy nhất trường dates và dùng lean object để tối ưu hóa bộ nhớ.
 * @param {string|number} userId - ID người dùng
 * @param {number|string} month - Tháng cần xem (1 - 12)
 * @param {number|string} year - Năm cần xem (ví dụ: 2026)
 * @returns {Promise<Array>} - Danh sách ngày đặc biệt trong tháng được sắp xếp theo thời gian
 */
export async function getDatesByMonthYear(userId, month, year) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const user = await User.findOne(query).select('dates').lean();
  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }

  let dates = Array.isArray(user.dates) ? user.dates : [];

  if (month && year) {
    const targetMonth = Number(month);
    const targetYear = Number(year);

    dates = dates.filter((item) => {
      const itemDate = new Date(item.date_date);
      if (Number.isNaN(itemDate.getTime())) return false;

      // 1. Kiểm tra theo UTC
      const utcM = itemDate.getUTCMonth() + 1;
      const utcY = itemDate.getUTCFullYear();

      // 2. Kiểm tra theo Local Server Timezone
      const locM = itemDate.getMonth() + 1;
      const locY = itemDate.getFullYear();

      // 3. Kiểm tra theo Múi giờ Việt Nam (UTC+7)
      const vnDate = new Date(itemDate.getTime() + 7 * 60 * 60 * 1000);
      const vnM = vnDate.getUTCMonth() + 1;
      const vnY = vnDate.getUTCFullYear();

      return (
        (utcM === targetMonth && utcY === targetYear) ||
        (locM === targetMonth && locY === targetYear) ||
        (vnM === targetMonth && vnY === targetYear)
      );
    });
  }

  return [...dates].sort((a, b) => new Date(a.date_date) - new Date(b.date_date));
}

/**
 * Function 10 (Edit): Cập nhật thông tin ngày đặc biệt theo ID.
 * Chỉ nạp mảng dates thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {string} dateId - ID ngày đặc biệt cần sửa
 * @param {object} updateData - Dữ liệu cập nhật mới
 * @returns {Promise<object>} - Dữ liệu ngày đặc biệt sau khi sửa
 */
export async function updateDate(userId, dateId, updateData) {
  const user = await findUserById(userId, 'dates');

  const dateItem = user.dates.id(dateId);
  if (!dateItem) {
    const error = new Error('Không tìm thấy ngày đặc biệt yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ['date_name', 'date_date', 'date_color'];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === 'date_date') {
        dateItem[field] = normalizeDateInput(updateData[field]);
      } else {
        dateItem[field] = updateData[field];
      }
    }
  });

  await user.save();
  return dateItem;
}

/**
 * Function 10 (Delete): Xóa bản ghi ngày đặc biệt khỏi danh sách của người dùng.
 * Sử dụng atomic operator $pull trực tiếp trên MongoDB không cần nạp document vào RAM.
 * @param {string|number} userId - ID người dùng
 * @param {string} dateId - ID ngày đặc biệt cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteDate(userId, dateId) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const result = await User.updateOne(
    { ...query, 'dates._id': dateId },
    { $pull: { dates: { _id: dateId } } }
  );

  if (result.matchedCount === 0) {
    const error = new Error('Không tìm thấy ngày đặc biệt cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  return true;
}
