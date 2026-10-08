/**
 * TÊN FILE: date.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho các API quản lý ngày đặc biệt và sự kiện lịch trình (Date Management): Function 3, 9, 10.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as dateService from '../../services/customer/date.service.js';

/**
 * Function 3: Tiếp nhận request tạo ngày đặc biệt mới.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function createDate(req, res) {
  try {
    const { date_name, date_date, date_color } = req.body;

    if (!date_name || !date_date) {
      return res.status(400).json({
        success: false,
        message: 'Tên sự kiện và thời gian diễn ra là bắt buộc.',
      });
    }

    const userId = req.user.id || req.user._id;
    const newDate = await dateService.createDate(userId, {
      date_name,
      date_date,
      date_color,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo ngày đặc biệt thành công',
      data: newDate,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo ngày đặc biệt.',
    });
  }
}

/**
 * Function 9: Tiếp nhận request lấy danh sách ngày đặc biệt theo tháng và năm.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getDates(req, res) {
  try {
    const { month, year } = req.query;
    const userId = req.user.id || req.user._id;

    const dates = await dateService.getDatesByMonthYear(userId, month, year);

    return res.status(200).json({
      success: true,
      month: month ? Number(month) : null,
      year: year ? Number(year) : null,
      data: dates,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách ngày đặc biệt.',
    });
  }
}

/**
 * Function 10 (Edit): Tiếp nhận request cập nhật ngày đặc biệt theo ID.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function updateDate(req, res) {
  try {
    const { date_id } = req.params;
    const userId = req.user.id || req.user._id;
    const updateData = req.body;

    const updatedDate = await dateService.updateDate(userId, date_id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật ngày đặc biệt thành công',
      data: updatedDate,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật ngày đặc biệt.',
    });
  }
}

/**
 * Function 10 (Delete): Tiếp nhận request xóa ngày đặc biệt theo ID.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function deleteDate(req, res) {
  try {
    const { date_id } = req.params;
    const userId = req.user.id || req.user._id;

    await dateService.deleteDate(userId, date_id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa ngày đặc biệt thành công',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa ngày đặc biệt.',
    });
  }
}
