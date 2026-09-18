/**
 * TÊN FILE: schedule.service.js
 * CÔNG DỤNG: Xử lý logic nghiệp vụ quản lý lịch trình, môn học, dự án và các giai đoạn nhỏ.
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import { ScheduleItem } from '../../models/customer/ScheduleItem.js';

/**
 * Lấy danh sách toàn bộ môn học, dự án của một người dùng theo userId.
 * @param {number} userId - Mã định danh số nguyên của người dùng
 * @returns {Promise<Array>} - Danh sách các mục lịch trình
 */
export async function getScheduleItemsByUserId(userId) {
  return ScheduleItem.find({ userId }).sort({ createdAt: -1 });
}

/**
 * Tạo mới một môn học hoặc dự án kèm danh sách các giai đoạn nhỏ.
 * @param {number} userId - Mã định danh số nguyên của người dùng
 * @param {object} itemData - Dữ liệu môn học/dự án gồm title, category, description, stages
 * @returns {Promise<object>} - Bản ghi vừa được tạo
 */
export async function createScheduleItem(userId, itemData) {
  const { title, category, description, stages } = itemData;

  const newItem = new ScheduleItem({
    userId,
    title,
    category: category || 'Môn học',
    description: description || '',
    stages: Array.isArray(stages) ? stages : [],
  });

  await newItem.save();
  return newItem;
}

/**
 * Cập nhật trạng thái hoàn thành của một giai đoạn nhỏ trong mục lịch trình.
 * @param {number} userId - Mã định danh người dùng
 * @param {string} itemId - ID của mục môn học / dự án
 * @param {string} stageId - ID của giai đoạn nhỏ
 * @param {boolean} isCompleted - Trạng thái đã hoàn thành hay chưa
 * @returns {Promise<object>} - Bản ghi sau khi cập nhật
 */
export async function toggleStageCompletion(userId, itemId, stageId, isCompleted) {
  const item = await ScheduleItem.findOne({ _id: itemId, userId });
  if (!item) {
    const error = new Error('Không tìm thấy mục lịch trình cần cập nhật.');
    error.statusCode = 404;
    throw error;
  }

  const stage = item.stages.id(stageId);
  if (!stage) {
    const error = new Error('Không tìm thấy giai đoạn nhỏ cần cập nhật.');
    error.statusCode = 404;
    throw error;
  }

  stage.isCompleted = isCompleted;
  await item.save();
  return item;
}

/**
 * Xóa một mục lịch trình khỏi cơ sở dữ liệu.
 * @param {number} userId - Mã định danh người dùng
 * @param {string} itemId - ID của mục cần xóa
 * @returns {Promise<boolean>} - Kết quả xóa thành công
 */
export async function deleteScheduleItem(userId, itemId) {
  const deleted = await ScheduleItem.findOneAndDelete({ _id: itemId, userId });
  if (!deleted) {
    const error = new Error('Không tìm thấy mục lịch trình cần xóa.');
    error.statusCode = 404;
    throw error;
  }
  return true;
}
