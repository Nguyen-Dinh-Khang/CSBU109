/**
 * TÊN FILE: work.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho các API quản lý đầu việc lớn (Work Management): Function 1, 5, 6.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as workService from '../../services/customer/work.service.js';

/**
 * Function 1: Tiếp nhận request tạo đầu việc mới.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function createWork(req, res) {
  try {
    const { work_name, work_start_date, work_end_date, work_color, work_description } = req.body;

    if (!work_name || !work_start_date || !work_end_date) {
      return res.status(400).json({
        success: false,
        message: 'Tên đầu việc, ngày bắt đầu và ngày kết thúc là bắt buộc.',
      });
    }

    const userId = req.user.id || req.user._id;
    const work = await workService.createWork(userId, {
      work_name,
      work_start_date,
      work_end_date,
      work_color,
      work_description,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo đầu việc thành công',
      data: work,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo đầu việc.',
    });
  }
}

/**
 * Function 5: Tiếp nhận request lấy danh sách đầu việc của người dùng hiện tại.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getWorks(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const works = await workService.getWorks(userId);

    return res.status(200).json({
      success: true,
      data: works,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách đầu việc.',
    });
  }
}

/**
 * Function 6 (Edit): Tiếp nhận request cập nhật thông tin đầu việc.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function updateWork(req, res) {
  try {
    const { work_id } = req.params;
    const userId = req.user.id || req.user._id;
    const updateData = req.body;

    const updatedWork = await workService.updateWork(userId, work_id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật đầu việc thành công',
      data: updatedWork,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật đầu việc.',
    });
  }
}

/**
 * Function 6 (Delete): Tiếp nhận request xóa đầu việc theo ID.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function deleteWork(req, res) {
  try {
    const { work_id } = req.params;
    const userId = req.user.id || req.user._id;

    await workService.deleteWork(userId, work_id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa đầu việc thành công',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa đầu việc.',
    });
  }
}
