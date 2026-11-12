/**
 * TÊN FILE: goal.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý mục tiêu (Goal Management): tạo mục tiêu, xem danh sách theo đầu việc, cập nhật, toggle check, và xóa.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { User } from '../../models/common/User.js';
import { assignGoalsToStagesInternal } from './stage.service.js';

/**
 * Tìm kiếm thực thể người dùng theo Mongo _id hoặc numeric userId.
 * Hỗ trợ tham số projection để chỉ lấy các trường cần thiết.
 * @param {string|number} userId - Định danh người dùng
 * @param {string|object} [projection=null] - Trường cần lấy (ví dụ: 'works')
 * @returns {Promise<object>} - Document User
 */
async function findUserById(userId, projection = null) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  let q = User.findOne(query);
  if (projection) {
    q = q.select(projection);
  }
  const user = await q;
  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

/**
 * Chuẩn hóa đối tượng Goal trả về kèm thuộc tính tính động is_expired (quá hạn chót và chưa hoàn thành).
 * @param {object} goal - Mongoose subdocument Goal hoặc plain object
 * @returns {object} - Goal object hoàn chỉnh kèm cờ is_expired
 */
function formatGoalResponse(goal) {
  const gObj = goal.toObject ? goal.toObject() : { ...goal };
  gObj.is_expired = !gObj.goal_check && new Date(gObj.goal_end_date) < new Date();
  return gObj;
}

/**
 * Function 2: Tạo mục tiêu mới gán vào một đầu việc chỉ định, tự động tăng goals_count.
 * Chỉ nạp mảng works thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc cha
 * @param {object} goalData - Dữ liệu mục tiêu gồm goal_name, goal_end_date, goal_color, goal_range, goal_description
 * @returns {Promise<object>} - Object mục tiêu vừa được tạo
 */
export async function createGoal(userId, workId, goalData) {
  const user = await findUserById(userId, 'works');

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc để thêm mục tiêu.');
    error.statusCode = 404;
    throw error;
  }

  const { goal_name, goal_end_date, goal_color, goal_range, goal_description, stage_id } = goalData;

  const newGoal = {
    goal_name,
    goal_end_date: new Date(goal_end_date),
    goal_color: goal_color || '#EF4444',
    goal_range: Math.min(5, Math.max(1, Number(goal_range) || 1)),
    goal_description: goal_description || '',
    goal_check: false,
    stage_id: stage_id || null,
  };

  work.goals.push(newGoal);
  work.goals_count = work.goals.length;

  // Nếu người dùng không chọn thủ công chặng và đầu việc có chia chặng, tự động gom mục tiêu theo mốc ngày
  if (!stage_id && Array.isArray(work.stages) && work.stages.length > 0) {
    assignGoalsToStagesInternal(work);
  }

  await user.save();

  return formatGoalResponse(work.goals[work.goals.length - 1]);
}

/**
 * Function 7: Lấy danh sách toàn bộ mục tiêu của một đầu việc, sắp xếp theo deadline tăng dần.
 * Sử dụng projection {'works.$': 1} để chỉ nạp đúng đầu việc được yêu cầu và dùng lean object.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @returns {Promise<object>} - Gồm tên đầu việc và danh sách mục tiêu
 */
export async function getGoalsByWorkId(userId, workId) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const user = await User.findOne(
    { ...query, 'works._id': workId },
    { 'works.$': 1 }
  ).lean();

  if (!user || !Array.isArray(user.works) || user.works.length === 0) {
    const error = new Error('Không tìm thấy đầu việc yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  const work = user.works[0];

  const goalsList = Array.isArray(work.goals) ? work.goals : [];
  const sortedGoals = [...goalsList]
    .sort((a, b) => new Date(a.goal_end_date) - new Date(b.goal_end_date))
    .map((g) => formatGoalResponse(g));

  const sortedStages = Array.isArray(work.stages)
    ? [...work.stages].sort((a, b) => (a.stage_order || 1) - (b.stage_order || 1))
    : [];

  return {
    work_id: work._id,
    work_name: work.work_name,
    stages: sortedStages,
    goals: sortedGoals,
  };
}

/**
 * Function 8 (Edit): Cập nhật thông tin chi tiết của một mục tiêu.
 * Chỉ nạp mảng works thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần sửa
 * @param {object} updateData - Dữ liệu cập nhật mới
 * @returns {Promise<object>} - Dữ liệu mục tiêu sau khi cập nhật
 */
export async function updateGoal(userId, workId, goalId, updateData) {
  const user = await findUserById(userId, 'works');

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
    'stage_id',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === 'goal_end_date') {
        goal[field] = new Date(updateData[field]);
      } else if (field === 'goal_range') {
        goal[field] = Math.min(5, Math.max(1, Number(updateData[field]) || 1));
      } else if (field === 'stage_id') {
        goal[field] = updateData[field] ? updateData[field] : null;
      } else {
        goal[field] = updateData[field];
      }
    }
  });

  // Tự động phân bổ lại vào chặng nếu đổi ngày mà không truyền stage_id cố định
  if (updateData.goal_end_date !== undefined && updateData.stage_id === undefined && Array.isArray(work.stages) && work.stages.length > 0) {
    assignGoalsToStagesInternal(work);
  }

  await user.save();
  return formatGoalResponse(goal);
}

/**
 * Function 8 (Check): Đảo ngược trạng thái hoàn thành (goal_check) của một mục tiêu.
 * Chỉ nạp mảng works thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần chuyển trạng thái
 * @returns {Promise<object>} - Dữ liệu mục tiêu với trạng thái mới
 */
export async function toggleCheckGoal(userId, workId, goalId) {
  const user = await findUserById(userId, 'works');

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

  return formatGoalResponse(goal);
}

/**
 * Function 8 (Delete): Xóa mục tiêu khỏi đầu việc và tự động giảm goals_count.
 * Sử dụng atomic operator $pull và $inc trực tiếp trên MongoDB không cần nạp document vào RAM.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} goalId - ID mục tiêu cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteGoal(userId, workId, goalId) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const result = await User.updateOne(
    { ...query, 'works._id': workId, 'works.goals._id': goalId },
    {
      $pull: { 'works.$.goals': { _id: goalId } },
      $inc: { 'works.$.goals_count': -1 },
    }
  );

  if (result.matchedCount === 0) {
    const error = new Error('Không tìm thấy mục tiêu cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  return true;
}
