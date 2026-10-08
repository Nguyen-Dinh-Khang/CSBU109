/**
 * TÊN FILE: goal.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý mục tiêu (Goal Management): tạo mục tiêu, xem danh sách theo đầu việc, cập nhật, toggle check, và xóa.
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
 * Function 2: Tạo mục tiêu mới gán vào một đầu việc chỉ định, tự động tăng goals_count.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc cha
 * @param {object} goalData - Dữ liệu mục tiêu gồm goal_name, goal_end_date, goal_color, goal_range, goal_description
 * @returns {Promise<object>} - Object mục tiêu vừa được tạo
 */
export async function createGoal(userId, workId, goalData) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc để thêm mục tiêu.');
    error.statusCode = 404;
    throw error;
  }

  const { goal_name, goal_end_date, goal_color, goal_range, goal_description } = goalData;

  const newGoal = {
    goal_name,
    goal_end_date: new Date(goal_end_date),
    goal_color: goal_color || '#EF4444',
    goal_range: Number(goal_range) || 1,
    goal_description: goal_description || '',
    goal_check: false,
  };

  work.goals.push(newGoal);
  work.goals_count = work.goals.length;

  await user.save();

  return work.goals[work.goals.length - 1];
}

/**
 * Function 7: Lấy danh sách toàn bộ mục tiêu của một đầu việc, sắp xếp theo deadline tăng dần.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @returns {Promise<object>} - Gồm tên đầu việc và danh sách mục tiêu
 */
export async function getGoalsByWorkId(userId, workId) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  const sortedGoals = [...work.goals].sort(
    (a, b) => new Date(a.goal_end_date) - new Date(b.goal_end_date)
  );

  return {
    work_id: work._id,
    work_name: work.work_name,
    goals: sortedGoals,
  };
}

/**
 * Function 8 (Edit): Cập nhật thông tin chi tiết của một mục tiêu.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần sửa
 * @param {object} updateData - Dữ liệu cập nhật mới
 * @returns {Promise<object>} - Dữ liệu mục tiêu sau khi cập nhật
 */
export async function updateGoal(userId, workId, goalId, updateData) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc chứa mục tiêu.');
    error.statusCode = 404;
    throw error;
  }

  const goal = work.goals.id(goalId);
  if (!goal) {
    const error = new Error('Không tìm thấy mục tiêu yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'goal_name',
    'goal_end_date',
    'goal_color',
    'goal_range',
    'goal_description',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === 'goal_end_date') {
        goal[field] = new Date(updateData[field]);
      } else if (field === 'goal_range') {
        goal[field] = Number(updateData[field]);
      } else {
        goal[field] = updateData[field];
      }
    }
  });

  await user.save();
  return goal;
}

/**
 * Function 8 (Check): Đảo ngược trạng thái hoàn thành (goal_check) của một mục tiêu.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần chuyển trạng thái
 * @returns {Promise<object>} - Dữ liệu mục tiêu với trạng thái mới
 */
export async function toggleCheckGoal(userId, workId, goalId) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc chứa mục tiêu.');
    error.statusCode = 404;
    throw error;
  }

  const goal = work.goals.id(goalId);
  if (!goal) {
    const error = new Error('Không tìm thấy mục tiêu yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  goal.goal_check = !goal.goal_check;
  await user.save();

  return goal;
}

/**
 * Function 8 (Delete): Xóa mục tiêu khỏi đầu việc và tự động giảm goals_count.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteGoal(userId, workId, goalId) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc chứa mục tiêu.');
    error.statusCode = 404;
    throw error;
  }

  const goal = work.goals.id(goalId);
  if (!goal) {
    const error = new Error('Không tìm thấy mục tiêu cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  work.goals.pull(goalId);
  work.goals_count = Math.max(0, work.goals.length);

  await user.save();
  return true;
}
