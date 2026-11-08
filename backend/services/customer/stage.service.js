/**
 * TÊN FILE: stage.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý chặng/giai đoạn (Stage Management) trong một đầu việc, bao gồm thêm, sửa, xóa và tự động gom mục tiêu vào chặng.
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
 * Tạo mới một chặng/giai đoạn gán vào một đầu việc chỉ định.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc cha
 * @param {object} stageData - Dữ liệu chặng gồm stage_name, stage_order, stage_start_date, stage_end_date, stage_description, stage_color
 * @returns {Promise<object>} - Object chặng vừa tạo
 */
export async function createStage(userId, workId, stageData) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc để thêm chặng.');
    error.statusCode = 404;
    throw error;
  }

  if (!Array.isArray(work.stages)) {
    work.stages = [];
  }

  const {
    stage_name,
    stage_order,
    stage_start_date,
    stage_end_date,
    stage_description,
    stage_color,
  } = stageData;

  const nextOrder = stage_order !== undefined
    ? Number(stage_order)
    : work.stages.length + 1;

  const newStage = {
    stage_name,
    stage_order: nextOrder,
    stage_start_date: stage_start_date ? new Date(stage_start_date) : null,
    stage_end_date: stage_end_date ? new Date(stage_end_date) : null,
    stage_description: stage_description || '',
    stage_color: stage_color || '#3B82F6',
  };

  work.stages.push(newStage);
  await user.save();

  return work.stages[work.stages.length - 1];
}

/**
 * Cập nhật thông tin chi tiết của một chặng.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} stageId - ID chặng cần sửa
 * @param {object} updateData - Dữ liệu cập nhật mới
 * @returns {Promise<object>} - Dữ liệu chặng sau khi sửa
 */
export async function updateStage(userId, workId, stageId, updateData) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc chứa chặng.');
    error.statusCode = 404;
    throw error;
  }

  const stage = work.stages.id(stageId);
  if (!stage) {
    const error = new Error('Không tìm thấy chặng yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'stage_name',
    'stage_order',
    'stage_start_date',
    'stage_end_date',
    'stage_description',
    'stage_color',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field.includes('date')) {
        stage[field] = updateData[field] ? new Date(updateData[field]) : null;
      } else if (field === 'stage_order') {
        stage[field] = Number(updateData[field]);
      } else {
        stage[field] = updateData[field];
      }
    }
  });

  await user.save();
  return stage;
}

/**
 * Xóa một chặng khỏi đầu việc, đồng thời tự động chuyển các mục tiêu thuộc chặng này về trạng thái chưa phân chặng (stage_id = null).
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} stageId - ID chặng cần xóa
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function deleteStage(userId, workId, stageId) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc chứa chặng.');
    error.statusCode = 404;
    throw error;
  }

  const stage = work.stages.id(stageId);
  if (!stage) {
    const error = new Error('Không tìm thấy chặng cần xóa.');
    error.statusCode = 404;
    throw error;
  }

  // 1. Gỡ bỏ tham chiếu stage_id ở toàn bộ các Goal thuộc chặng bị xóa để chống orphan ID
  if (Array.isArray(work.goals)) {
    work.goals.forEach((goal) => {
      if (goal.stage_id && goal.stage_id.toString() === stageId.toString()) {
        goal.stage_id = null;
      }
    });
  }

  // 2. Xóa chặng khỏi mảng stages
  work.stages.pull(stageId);

  await user.save();
  return true;
}

/**
 * Tự động quét và gom toàn bộ các mục tiêu vào các chặng phù hợp dựa theo hạn chót (goal_end_date <= stage_end_date).
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @returns {Promise<object>} - Danh sách stages và goals sau khi phân bổ
 */
export async function autoAssignGoalsToStages(userId, workId) {
  const user = await findUserById(userId);

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc.');
    error.statusCode = 404;
    throw error;
  }

  const stagesList = Array.isArray(work.stages) ? [...work.stages] : [];
  if (stagesList.length === 0) {
    return {
      message: 'Chưa có chặng nào để phân bổ mục tiêu.',
      stages: [],
      goals: work.goals,
    };
  }

  // Lọc và sắp xếp các chặng có stage_end_date theo thứ tự thời gian tăng dần
  const stagesWithEndDate = stagesList
    .filter((s) => s.stage_end_date)
    .sort((a, b) => new Date(a.stage_end_date) - new Date(b.stage_end_date));

  if (Array.isArray(work.goals)) {
    work.goals.forEach((goal) => {
      const goalDeadline = new Date(goal.goal_end_date);

      // Tìm chặng đầu tiên có stage_end_date >= goal_end_date
      const matchedStage = stagesWithEndDate.find(
        (s) => new Date(s.stage_end_date) >= goalDeadline
      );

      if (matchedStage) {
        goal.stage_id = matchedStage._id;
      } else if (stagesWithEndDate.length > 0) {
        // Nếu deadline muộn hơn tất cả các mốc, gán vào chặng cuối cùng
        goal.stage_id = stagesWithEndDate[stagesWithEndDate.length - 1]._id;
      } else {
        // Trường hợp các stage không có ngày kết thúc, gán theo thứ tự
        goal.stage_id = stagesList[0]._id;
      }
    });
  }

  await user.save();

  return {
    work_id: work._id,
    stages: work.stages,
    goals: work.goals,
  };
}

/**
 * Áp dụng một lộ trình hoàn chỉnh (Work + Stages + Goals) được AI sinh ra vào tài khoản người dùng.
 * @param {string|number} userId - ID người dùng
 * @param {object} roadmapData - Lộ trình gồm work_name, work_description, work_color, stages (kèm goals)
 * @returns {Promise<object>} - Đầu việc vừa tạo kèm stages và goals
 */
export async function applyRoadmap(userId, roadmapData) {
  const user = await findUserById(userId);

  const {
    work_name,
    work_description,
    work_color,
    work_start_date,
    work_end_date,
    stages = [],
  } = roadmapData;

  const newWork = {
    work_name,
    work_description: work_description || '',
    work_color: work_color || '#10B981',
    work_start_date: work_start_date ? new Date(work_start_date) : new Date(),
    work_end_date: work_end_date ? new Date(work_end_date) : new Date(Date.now() + 30 * 86400000),
    goals_count: 0,
    stages: [],
    goals: [],
  };

  user.works.push(newWork);
  const createdWork = user.works[user.works.length - 1];

  // 1. Thêm từng Stage và lưu lại mapping ID
  stages.forEach((stg, sIndex) => {
    createdWork.stages.push({
      stage_name: stg.stage_name,
      stage_order: stg.stage_order || sIndex + 1,
      stage_start_date: stg.stage_start_date ? new Date(stg.stage_start_date) : null,
      stage_end_date: stg.stage_end_date ? new Date(stg.stage_end_date) : null,
      stage_description: stg.stage_description || '',
      stage_color: stg.stage_color || '#3B82F6',
    });

    const createdStage = createdWork.stages[createdWork.stages.length - 1];

    // 2. Thêm các Goals thuộc Stage này vào work.goals
    if (Array.isArray(stg.goals)) {
      stg.goals.forEach((g) => {
        createdWork.goals.push({
          goal_name: g.goal_name,
          goal_description: g.goal_description || '',
          goal_end_date: g.goal_end_date ? new Date(g.goal_end_date) : createdStage.stage_end_date || createdWork.work_end_date,
          goal_color: g.goal_color || '#EF4444',
          goal_range: Number(g.goal_range) || 5,
          goal_check: false,
          stage_id: createdStage._id,
        });
      });
    }
  });

  createdWork.goals_count = createdWork.goals.length;
  await user.save();

  return createdWork;
}
