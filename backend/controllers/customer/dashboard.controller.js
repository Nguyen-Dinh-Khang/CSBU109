/**
 * TÊN FILE: dashboard.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho API Dashboard tổng quan: Function 4.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import * as dashboardService from '../../services/customer/dashboard.service.js';

/**
 * Function 4: Tiếp nhận request lấy dữ liệu tổng quan cho trang Dashboard.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getDashboardOverview(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const overview = await dashboardService.getDashboardOverview(userId);

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tải dữ liệu dashboard.',
    });
  }
}

/**
 * Tiếp nhận request lấy danh sách lịch sử các mục tiêu đã hoàn thành gần đây.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getCompletedGoalsHistory(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const limit = req.query.limit || 20;
    const history = await dashboardService.getCompletedGoalsHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tải lịch sử hoàn thành.',
    });
  }
}
