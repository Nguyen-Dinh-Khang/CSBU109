/**
 * TÊN FILE: date.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý ngày đặc biệt và sự kiện lịch trình (Date Management): tạo mới, lọc theo tháng/năm, cập nhật và xóa.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { User } from '../../models/common/User.js';

/**
 * Tìm kiếm thực thể người dùng theo Mongo _id hoặc numeric userId.
 * @param {string|number} userId - Định danh người dùng
 * @returns {Promise<object>} - Document User
 */
async function findUserById(userId) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const user = await User.findOne(query);
  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

/**
 * Function 3: Tạo ngày đặc biệt mới cho người dùng.
 * @param {string|number} userId - ID người dùng
 * @param {object} dateData - Dữ liệu ngày đặc biệt gồm date_name, date_date, date_color
 * @returns {Promise<object>} - Object ngày đặc biệt vừa tạo
 */
export async function createDate(userId, dateData) {
  const user = await findUserById(userId);

  const { date_name, date_date, date_color } = dateData;

  const newDate = {
    date_name,
    date_date: new Date(date_date),
    date_color: date_color || '#3B82F6',
  };

  user.dates.push(newDate);
  await user.save();

  return user.dates[user.dates.length - 1];
}

/**
 * Function 9: Lấy danh sách ngày đặc biệt theo tháng và năm để hiển thị lên giao diện Lịch.
 * @param {string|number} userId - ID người dùng
 * @param {number|string} month - Tháng cần xem (1 - 12)
 * @param {number|string} year - Năm cần xem (ví dụ: 2026)
 * @returns {Promise<Array>} - Danh sách ngày đặc biệt trong tháng được sắp xếp theo thời gian
 */
export async function getDatesByMonthYear(userId, month, year) {
  const user = await findUserById(userId);

  let dates = user.dates;

  if (month && year) {
    const targetMonth = Number(month);
    const targetYear = Number(year);

    dates = dates.filter((item) => {
      const itemDate = new Date(item.date_date);
      // Sử dụng cả Local và UTC để linh hoạt múi giờ
      const m = itemDate.getMonth() + 1;
      const y = itemDate.getFullYear();
      return m === targetMonth && y === targetYear;
    });
  }

  return [...dates].sort((a, b) => new Date(a.date_date) - new Date(b.date_date));
}

/**
 * Function 10 (Edit): Cập nhật thông tin ngày đặc biệt theo ID.
 * @param {string|number} userId - ID người dùng
 * @param {string} dateId - ID ngày đặc biệt cần sửa
 * @param {object} updateData - Dữ liệu cập nhật mới
 * @returns {Promise<object>} - Dữ liệu ngày đặc biệt sau khi sửa
 */
export async function updateDate(userId, dateId, updateData) {
  const user = await findUserById(userId);

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
        dateItem[field] = new Date(updateData[field]);
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
 * @param {string|number} userId - ID người dùng
 * @param {string} dateId - ID ngày đặc biệt cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteDate(userId, dateId) {
  const user = await findUserById(userId);

  const dateItem = user.dates.id(dateId);
  if (!dateItem) {
    const error = new Error('Không tìm thấy ngày đặc biệt cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  user.dates.pull(dateId);
  await user.save();

  return true;
}
