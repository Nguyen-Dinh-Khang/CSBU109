/**
 * TÊN FILE: stage.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho các API quản lý chặng (Stage Management) và tự động gom mục tiêu vào chặng.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as stageService from '../../services/customer/stage.service.js';

/**
 * Tiếp nhận request tạo mới một chặng trong đầu việc.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function createStage(req, res) {
  try {
    const { work_id } = req.params;
    const {
      stage_name,
      stage_order,
      stage_start_date,
      stage_end_date,
      stage_description,
      stage_color,
    } = req.body;

    if (!stage_name || stage_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tên chặng là bắt buộc.',
      });
    }

    const userId = req.user.id || req.user._id || req.user.userId;
    const result = await stageService.createStage(userId, work_id, {
      stage_name,
      stage_order,
      stage_start_date,
      stage_end_date,
      stage_description,
      stage_color,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo chặng thành công! Hệ thống đã tự động sắp xếp thứ tự và gom mục tiêu vào chặng.',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo chặng.',
    });
  }
}

/**
 * Tiếp nhận request cập nhật thông tin chặng.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function updateStage(req, res) {
  try {
    const { work_id, stage_id } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    const result = await stageService.updateStage(userId, work_id, stage_id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật chặng thành công! Đã tự động đồng bộ lại thứ tự và mục tiêu.',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật chặng.',
    });
  }
}

/**
 * Tiếp nhận request xóa một chặng.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function deleteStage(req, res) {
  try {
    const { work_id, stage_id } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    const result = await stageService.deleteStage(userId, work_id, stage_id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa chặng thành công. Các mục tiêu liên quan đã được tự động phân bổ lại.',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa chặng.',
    });
  }
}

/**
 * Tiếp nhận request tự động gom mục tiêu vào các chặng tương ứng theo mốc ngày.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function autoAssignGoals(req, res) {
  try {
    const { work_id } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    const result = await stageService.autoAssignGoalsToStages(userId, work_id);

    return res.status(200).json({
      success: true,
      message: 'Tự động phân bổ mục tiêu vào các chặng thành công!',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tự động phân bổ mục tiêu.',
    });
  }
}
