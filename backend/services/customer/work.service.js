/**
 * TÊN FILE: work.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý đầu việc lớn (Work Management): tạo mới, lấy danh sách, cập nhật và xóa theo mô hình Embedded MongoDB.
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
 * Function 1: Tạo đầu việc mới gán cho người dùng hiện tại.
 * @param {string|number} userId - ID người dùng
 * @param {object} workData - Dữ liệu đầu việc gồm work_name, work_start_date, work_end_date, work_color, work_description
 * @returns {Promise<object>} - Object đầu việc vừa được tạo
 */
export async function createWork(userId, workData) {
  const user = await findUserById(userId);

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

  return user.works[user.works.length - 1];
}

/**
 * Function 5: Lấy toàn bộ danh sách đầu việc của người dùng kèm cờ trạng thái hết hạn.
 * @param {string|number} userId - ID người dùng
 * @returns {Promise<Array>} - Danh sách các đầu việc
 */
export async function getWorks(userId) {
  const user = await findUserById(userId);

  const now = new Date();
  return user.works.map((work) => {
    const workObj = work.toObject();
    workObj.is_expired = new Date(work.work_end_date) < now;
    return workObj;
  });
}

/**
 * Function 6 (Edit): Cập nhật thông tin của một đầu việc.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID của đầu việc cần sửa
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} - Dữ liệu đầu việc sau khi sửa
 */
export async function updateWork(userId, workId, updateData) {
  const user = await findUserById(userId);

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
  return work;
}

/**
 * Function 6 (Delete): Xóa đầu việc cùng toàn bộ các mục tiêu con bên trong nó.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID của đầu việc cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteWork(userId, workId) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  user.works.pull(workId);
  await user.save();

  return true;
}
