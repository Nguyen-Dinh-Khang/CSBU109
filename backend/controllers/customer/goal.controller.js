/**
 * TÊN FILE: goal.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho các API quản lý mục tiêu con (Goal Management): Function 2, 7, 8.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as goalService from '../../services/customer/goal.service.js';

/**
 * Function 2: Tiếp nhận request tạo mục tiêu mới trong một đầu việc.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function createGoal(req, res) {
  try {
    const { work_id } = req.params;
    const { goal_name, goal_end_date, goal_color, goal_range, goal_description } = req.body;

    if (!goal_name || !goal_end_date) {
      return res.status(400).json({
        success: false,
        message: 'Tên mục tiêu và hạn chót là bắt buộc.',
      });
    }

    const userId = req.user.id || req.user._id;
    const goal = await goalService.createGoal(userId, work_id, {
      goal_name,
      goal_end_date,
      goal_color,
      goal_range,
      goal_description,
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo mục tiêu thành công',
      data: goal,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo mục tiêu.',
    });
  }
}

/**
 * Function 7: Tiếp nhận request lấy danh sách mục tiêu của một đầu việc cụ thể.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getGoalsByWorkId(req, res) {
  try {
    const { work_id } = req.params;
    const userId = req.user.id || req.user._id;

    const result = await goalService.getGoalsByWorkId(userId, work_id);

    return res.status(200).json({
      success: true,
      work_id: result.work_id,
      work_name: result.work_name,
      data: result.goals,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách mục tiêu.',
    });
  }
}

/**
 * Function 8 (Edit): Tiếp nhận request cập nhật thông tin chi tiết của mục tiêu.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function updateGoal(req, res) {
  try {
    const { work_id, goal_id } = req.params;
    const userId = req.user.id || req.user._id;
    const updateData = req.body;

    const updatedGoal = await goalService.updateGoal(userId, work_id, goal_id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật mục tiêu thành công',
      data: updatedGoal,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật mục tiêu.',
    });
  }
}

/**
 * Function 8 (Check): Tiếp nhận request đảo ngược trạng thái hoàn thành (Toggle check).
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function toggleCheckGoal(req, res) {
  try {
    const { work_id, goal_id } = req.params;
    const userId = req.user.id || req.user._id;

    const updatedGoal = await goalService.toggleCheckGoal(userId, work_id, goal_id);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedGoal,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái mục tiêu.',
    });
  }
}

/**
 * Function 8 (Delete): Tiếp nhận request xóa mục tiêu khỏi đầu việc.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function deleteGoal(req, res) {
  try {
    const { work_id, goal_id } = req.params;
    const userId = req.user.id || req.user._id;

    await goalService.deleteGoal(userId, work_id, goal_id);

    return res.status(200).json({
      success: true,
      message: 'Đã xóa mục tiêu thành công',
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi xóa mục tiêu.',
    });
  }
}
