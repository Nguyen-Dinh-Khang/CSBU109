/**
 * TÊN FILE: schedule.controller.js
 * CÔNG DỤNG: Tiếp nhận request cho các API quản lý lịch trình môn học và dự án của khách hàng.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as scheduleService from '../../services/customer/schedule.service.js';

/**
 * Lấy danh sách toàn bộ các môn học và dự án của người dùng hiện tại.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getScheduleItems(req, res) {
  try {
    const items = await scheduleService.getScheduleItemsByUserId(req.user.userId);
    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách lịch trình.',
    });
  }
}

/**
 * Tạo mới một môn học hoặc dự án kèm các giai đoạn nhỏ.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function createScheduleItem(req, res) {
  try {
    const { title, category, description, stages } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Tên môn học/dự án là bắt buộc.',
      });
    }

    const newItem = await scheduleService.createScheduleItem(req.user.userId, {
      title,
      category,
      description,
      stages,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo môn học / dự án thành công!',
      item: newItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo môn học / dự án.',
    });
  }
}

/**
 * Cập nhật trạng thái hoàn thành một giai đoạn nhỏ.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function updateStageStatus(req, res) {
  try {
    const { itemId, stageId } = req.params;
    const { isCompleted } = req.body;

    const updatedItem = await scheduleService.toggleStageCompletion(
      req.user.userId,
      itemId,
      stageId,
      Boolean(isCompleted)
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái giai đoạn thành công!',
      item: updatedItem,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật giai đoạn.',
    });
  }
}

/**
 * Xóa một môn học hoặc dự án theo ID.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function deleteScheduleItem(req, res) {
  try {
    const { itemId } = req.params;
    await scheduleService.deleteScheduleItem(req.user.userId, itemId);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa mục lịch trình thành công!',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa mục lịch trình.',
    });
  }
}
