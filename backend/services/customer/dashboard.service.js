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
 * Chỉ nạp các trường cần thiết (works._id, works.work_name, works.goals, dates) và dùng lean object.
 * @param {string|number} userId - ID người dùng
 * @returns {Promise<object>} - Gồm upcoming_goals và upcoming_dates
 */
export async function getDashboardOverview(userId) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const user = await User.findOne(query)
    .select('works._id works.work_name works.goals dates')
    .lean();

  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }

  // 1. Trích xuất tất cả Goal từ các Work của user
  const allIncompleteGoals = [];
  const worksList = Array.isArray(user.works) ? user.works : [];
  worksList.forEach((work) => {
    const goalsList = Array.isArray(work.goals) ? work.goals : [];
    goalsList.forEach((goal) => {
      if (!goal.goal_check) {
        allIncompleteGoals.push({
          goal_id: goal._id,
          goal_name: goal.goal_name,
          goal_end_date: goal.goal_end_date,
          goal_color: goal.goal_color,
          goal_range: goal.goal_range,
          work_id: work._id,
          work_name: work.work_name,
          is_expired: new Date(goal.goal_end_date) < new Date(),
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

  const datesList = Array.isArray(user.dates) ? user.dates : [];
  const upcomingDates = datesList
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

/**
 * Lấy danh sách các mục tiêu đã hoàn thành (Lịch sử hoàn thành) trên toàn bộ các đầu việc của người dùng.
 * @param {string|number} userId - ID người dùng
 * @param {number} [limit=20] - Số lượng mục tiêu tối đa trả về
 * @returns {Promise<Array>} - Danh sách các mục tiêu đã hoàn thành, sắp xếp mới nhất lên đầu
 */
export async function getCompletedGoalsHistory(userId, limit = 20) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const user = await User.findOne(query)
    .select('works._id works.work_name works.goals')
    .lean();

  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }

  const completedGoals = [];
  const worksList = Array.isArray(user.works) ? user.works : [];

  worksList.forEach((work) => {
    const goalsList = Array.isArray(work.goals) ? work.goals : [];
    goalsList.forEach((goal) => {
      if (goal.goal_check) {
        completedGoals.push({
          goal_id: goal._id,
          goal_name: goal.goal_name,
          goal_end_date: goal.goal_end_date,
          goal_color: goal.goal_color,
          goal_range: goal.goal_range,
          goal_check: true,
          work_id: work._id,
          work_name: work.work_name,
          completed_at: goal.updatedAt || goal.createdAt || new Date(),
        });
      }
    });
  });

  // Sắp xếp theo completed_at giảm dần (Mới nhất hoàn thành lên trước)
  completedGoals.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  return completedGoals.slice(0, Number(limit) || 20);
}
