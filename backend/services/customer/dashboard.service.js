/**
 * TÊN FILE: dashboard.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ tổng hợp dữ liệu cho Dashboard: lấy 5 mục tiêu gần hạn nhất chưa hoàn thành và 3 ngày đặc biệt sắp diễn ra.
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
 * Function 4: Lấy dữ liệu tổng quan cho trang Dashboard: 5 mục tiêu gần nhất (chưa xong) và 3 sự kiện sắp tới.
 * @param {string|number} userId - ID người dùng
 * @returns {Promise<object>} - Gồm upcoming_goals và upcoming_dates
 */
export async function getDashboardOverview(userId) {
  const user = await findUserById(userId);

  // 1. Trích xuất tất cả Goal từ các Work của user
  const allIncompleteGoals = [];
  user.works.forEach((work) => {
    work.goals.forEach((goal) => {
      if (!goal.goal_check) {
        allIncompleteGoals.push({
          goal_id: goal._id,
          goal_name: goal.goal_name,
          goal_end_date: goal.goal_end_date,
          goal_color: goal.goal_color,
          goal_range: goal.goal_range,
          work_id: work._id,
          work_name: work.work_name,
        });
      }
    });
  });

  // Sắp xếp hạn chót từ gần nhất đến xa nhất (ASC), lấy tối đa 5 Goal
  const upcomingGoals = allIncompleteGoals
    .sort((a, b) => new Date(a.goal_end_date) - new Date(b.goal_end_date))
    .slice(0, 5);

  // 2. Lấy 3 ngày đặc biệt sắp diễn ra (date_date >= ngày hôm nay)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDates = user.dates
    .filter((d) => new Date(d.date_date) >= today)
    .sort((a, b) => new Date(a.date_date) - new Date(b.date_date))
    .slice(0, 3)
    .map((d) => ({
      date_id: d._id,
      date_name: d.date_name,
      date_date: d.date_date,
      date_color: d.date_color,
    }));

  return {
    upcoming_goals: upcomingGoals,
    upcoming_dates: upcomingDates,
  };
}
