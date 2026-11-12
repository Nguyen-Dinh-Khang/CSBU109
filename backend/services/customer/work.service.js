/**
 * TÊN FILE: work.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý đầu việc lớn (Work Management): tạo mới, lấy danh sách, cập nhật và xóa theo mô hình Embedded MongoDB.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { User } from '../../models/common/User.js';

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
 * Function 1: Tạo đầu việc mới gán cho người dùng hiện tại.
 * Chỉ nạp mảng works thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {object} workData - Dữ liệu đầu việc gồm work_name, work_start_date, work_end_date, work_color, work_description
 * @returns {Promise<object>} - Object đầu việc vừa được tạo (tóm tắt)
 */
export async function createWork(userId, workData) {
  const user = await findUserById(userId, 'works');

  const { work_name, work_start_date, work_end_date, work_color, work_description } = workData;

  const newWork = {
    work_name,
    work_start_date: new Date(work_start_date),
    work_end_date: new Date(work_end_date),
    work_color: work_color || '#10B981',
    work_description: work_description || '',
    goals_count: 0,
    goals: [],
  };

  user.works.push(newWork);
  await user.save();

  const created = user.works[user.works.length - 1].toObject();
  delete created.goals;
  created.completed_goals_count = 0;
  created.progress_percentage = 0;
  created.is_expired = new Date(created.work_end_date) < new Date();

  return created;
}

/**
 * Function 5: Lấy toàn bộ danh sách đầu việc vắn tắt của người dùng kèm tiến độ, số lượng goal và cờ hết hạn (không kèm danh sách goals chi tiết).
 * Hỗ trợ tìm kiếm nhanh theo work_name thông qua tham số search.
 * Chỉ truy vấn các trường cần thiết của works và dùng lean object.
 * @param {string|number} userId - ID người dùng
 * @param {string} [search=''] - Từ khóa tìm kiếm theo tên đầu việc
 * @returns {Promise<Array>} - Danh sách các đầu việc vắn tắt
 */
export async function getWorks(userId, search = '') {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const user = await User.findOne(query)
    .select(
      'works._id works.work_name works.work_start_date works.work_end_date works.work_color works.work_description works.createdAt works.goals._id works.goals.goal_check'
    )
    .lean();

  if (!user) {
    const error = new Error('Không tìm thấy người dùng trong hệ thống.');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  let worksList = Array.isArray(user.works) ? user.works : [];

  if (search && typeof search === 'string' && search.trim() !== '') {
    const keyword = search.trim().toLowerCase();
    worksList = worksList.filter(
      (work) => work.work_name && work.work_name.toLowerCase().includes(keyword)
    );
  }

  // Sắp xếp đầu việc: càng mới càng lên trước (theo createdAt giảm dần)
  const sortedWorks = [...worksList].sort((a, b) => {
    const timeA = new Date(a.createdAt || a._id?.getTimestamp?.() || 0).getTime();
    const timeB = new Date(b.createdAt || b._id?.getTimestamp?.() || 0).getTime();
    return timeB - timeA;
  });

  return sortedWorks.map((work) => {
    const workObj = { ...work };
    const goalsList = Array.isArray(workObj.goals) ? workObj.goals : [];
    const totalGoals = goalsList.length;
    const completedGoals = goalsList.filter((g) => g.goal_check).length;
    const progressPercentage =
      totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    delete workObj.goals;

    return {
      ...workObj,
      goals_count: totalGoals,
      completed_goals_count: completedGoals,
      progress_percentage: progressPercentage,
      is_expired: new Date(work.work_end_date) < now,
    };
  });
}

/**
 * Function 6 (Edit): Cập nhật thông tin của một đầu việc.
 * Chỉ nạp mảng works thay vì toàn bộ User Document.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID của đầu việc cần sửa
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} - Dữ liệu đầu việc sau khi sửa
 */
export async function updateWork(userId, workId, updateData) {
  const user = await findUserById(userId, 'works');

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'work_name',
    'work_start_date',
    'work_end_date',
    'work_color',
    'work_description',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field.includes('date')) {
        work[field] = new Date(updateData[field]);
      } else {
        work[field] = updateData[field];
      }
    }
  });

  await user.save();

  const updatedObj = work.toObject();
  const goalsList = Array.isArray(updatedObj.goals) ? updatedObj.goals : [];
  const totalGoals = goalsList.length;
  const completedGoals = goalsList.filter((g) => g.goal_check).length;
  delete updatedObj.goals;

  return {
    ...updatedObj,
    goals_count: totalGoals,
    completed_goals_count: completedGoals,
    progress_percentage: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
    is_expired: new Date(updatedObj.work_end_date) < new Date(),
  };
}

/**
 * Function 6 (Delete): Xóa đầu việc cùng toàn bộ các mục tiêu con bên trong nó.
 * Sử dụng atomic operator $pull trực tiếp trên MongoDB không cần nạp document vào RAM.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID của đầu việc cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteWork(userId, workId) {
  const query = typeof userId === 'number' ? { userId } : { _id: userId };
  const result = await User.updateOne(
    { ...query, 'works._id': workId },
    { $pull: { works: { _id: workId } } }
  );

  if (result.matchedCount === 0) {
    const error = new Error('Không tìm thấy đầu việc cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  return true;
}
