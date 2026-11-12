/**
 * TÊN FILE: stage.service.js
 * CÔNG DỤNG: Xử lý nghiệp vụ quản lý chặng/giai đoạn (Stage Management) trong một đầu việc, bao gồm thêm, sửa, xóa và tự động gom mục tiêu vào chặng.
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
 * Tự động phân bổ lại toàn bộ mục tiêu trong đầu việc vào các chặng tương ứng theo mốc ngày.
 * @param {object} work - Đối tượng Work Mongoose subdocument
 */
export function assignGoalsToStagesInternal(work) {
  if (!Array.isArray(work.goals) || work.goals.length === 0) {
    return;
  }

  const stagesList = Array.isArray(work.stages) ? [...work.stages] : [];
  if (stagesList.length === 0) {
    work.goals.forEach((goal) => {
      goal.stage_id = null;
    });
    return;
  }

  // Sắp xếp các chặng theo stage_order tăng dần
  const sortedStages = [...stagesList].sort(
    (a, b) => (Number(a.stage_order) || 1) - (Number(b.stage_order) || 1)
  );

  const stagesWithEndDate = sortedStages.filter((s) => s.stage_end_date);

  work.goals.forEach((goal) => {
    const goalDeadline = new Date(goal.goal_end_date);

    if (stagesWithEndDate.length > 0) {
      // 1. Ưu tiên chặng có cả start_date và end_date bao trọn deadline
      const exactStage = stagesWithEndDate.find((s) => {
        if (!s.stage_start_date) return false;
        const start = new Date(s.stage_start_date);
        const end = new Date(s.stage_end_date);
        return goalDeadline >= start && goalDeadline <= end;
      });

      if (exactStage) {
        goal.stage_id = exactStage._id;
        return;
      }

      // 2. Chặng đầu tiên có stage_end_date >= goalDeadline
      const matchedStage = stagesWithEndDate.find(
        (s) => new Date(s.stage_end_date) >= goalDeadline
      );

      if (matchedStage) {
        goal.stage_id = matchedStage._id;
      } else {
        // Deadline muộn hơn tất cả các chặng, gán vào chặng cuối cùng
        goal.stage_id = stagesWithEndDate[stagesWithEndDate.length - 1]._id;
      }
    } else {
      goal.stage_id = sortedStages[0]._id;
    }
  });
}

/**
 * Chuẩn hóa dãy số thứ tự stage_order của toàn bộ chặng thành liên tục 1, 2, ..., N.
 * @param {Array} stages - Mảng chặng trong Work
 */
function normalizeStageOrders(stages) {
  if (!Array.isArray(stages) || stages.length === 0) return;
  stages.sort((a, b) => (Number(a.stage_order) || 1) - (Number(b.stage_order) || 1));
  stages.forEach((stage, idx) => {
    stage.stage_order = idx + 1;
  });
}

/**
 * Tạo mới một chặng/giai đoạn gán vào một đầu việc chỉ định.
 * Tự động dịch chuyển thứ tự (+1) nếu chèn chặng ở giữa và tự động gom mục tiêu vào chặng.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc cha
 * @param {object} stageData - Dữ liệu chặng gồm stage_name, stage_order, stage_start_date, stage_end_date, stage_description, stage_color
 * @returns {Promise<object>} - Object kết quả gồm stage, stages, goals
 */
export async function createStage(userId, workId, stageData) {
  const user = await findUserById(userId, 'works');

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

  const currentLength = work.stages.length;
  let targetOrder = stage_order !== undefined && stage_order !== '' ? Number(stage_order) : currentLength + 1;

  if (targetOrder < 1) {
    targetOrder = 1;
  } else if (targetOrder > currentLength + 1) {
    targetOrder = currentLength + 1;
  }

  // Dịch chuyển các chặng hiện có có thứ tự >= targetOrder lên +1
  work.stages.forEach((stg) => {
    const currentOrder = Number(stg.stage_order) || 1;
    if (currentOrder >= targetOrder) {
      stg.stage_order = currentOrder + 1;
    }
  });

  const newStage = {
    stage_name,
    stage_order: targetOrder,
    stage_start_date: stage_start_date ? new Date(stage_start_date) : null,
    stage_end_date: stage_end_date ? new Date(stage_end_date) : null,
    stage_description: stage_description || '',
    stage_color: stage_color || '#3B82F6',
  };

  work.stages.push(newStage);

  // Chuẩn hóa dãy số thứ tự 1..N
  normalizeStageOrders(work.stages);

  // Tự động gom mục tiêu vào các chặng
  assignGoalsToStagesInternal(work);

  await user.save();

  const createdStage = work.stages.find(
    (s) => s.stage_name === stage_name && s.stage_order === targetOrder
  ) || work.stages[work.stages.length - 1];

  return {
    stage: createdStage,
    stages: work.stages,
    goals: work.goals,
  };
}

/**
 * Cập nhật thông tin chi tiết của một chặng.
 * Tự động đồng bộ lại thứ tự các chặng khác và tự động phân bổ lại mục tiêu.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} stageId - ID chặng cần sửa
 * @param {object} updateData - Dữ liệu cập nhật mới
 * @returns {Promise<object>} - Object gồm stage, stages, goals sau khi sửa
 */
export async function updateStage(userId, workId, stageId, updateData) {
  const user = await findUserById(userId, 'works');

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

  const oldOrder = Number(stage.stage_order) || 1;
  const currentLength = work.stages.length;

  if (updateData.stage_order !== undefined && updateData.stage_order !== '') {
    let newOrder = Number(updateData.stage_order);
    if (newOrder < 1) newOrder = 1;
    if (newOrder > currentLength) newOrder = currentLength;

    if (newOrder !== oldOrder) {
      work.stages.forEach((stg) => {
        if (stg._id.toString() !== stageId.toString()) {
          const stgOrder = Number(stg.stage_order) || 1;
          if (newOrder < oldOrder) {
            // Chuyển lên trên: các chặng trong khoảng [newOrder, oldOrder - 1] sẽ +1
            if (stgOrder >= newOrder && stgOrder < oldOrder) {
              stg.stage_order = stgOrder + 1;
            }
          } else {
            // Chuyển xuống dưới: các chặng trong khoảng [oldOrder + 1, newOrder] sẽ -1
            if (stgOrder > oldOrder && stgOrder <= newOrder) {
              stg.stage_order = stgOrder - 1;
            }
          }
        }
      });
      stage.stage_order = newOrder;
    }
  }

  const allowedFields = [
    'stage_name',
    'stage_start_date',
    'stage_end_date',
    'stage_description',
    'stage_color',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field.includes('date')) {
        stage[field] = updateData[field] ? new Date(updateData[field]) : null;
      } else {
        stage[field] = updateData[field];
      }
    }
  });

  // Chuẩn hóa dãy số thứ tự 1..N
  normalizeStageOrders(work.stages);

  // Tự động gom mục tiêu vào các chặng
  assignGoalsToStagesInternal(work);

  await user.save();

  return {
    stage,
    stages: work.stages,
    goals: work.goals,
  };
}

/**
 * Xóa một chặng khỏi đầu việc, tự động lùi thứ tự (-1) của các chặng phía sau và tự động gom lại mục tiêu.
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @param {string} stageId - ID chặng cần xóa
 * @returns {Promise<object>} - Object gồm stages và goals sau khi xóa
 */
export async function deleteStage(userId, workId, stageId) {
  const user = await findUserById(userId, 'works');

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

  const deletedOrder = Number(stage.stage_order) || 1;

  // 1. Gỡ bỏ tham chiếu stage_id ở toàn bộ các Goal thuộc chặng bị xóa
  if (Array.isArray(work.goals)) {
    work.goals.forEach((goal) => {
      if (goal.stage_id && goal.stage_id.toString() === stageId.toString()) {
        goal.stage_id = null;
      }
    });
  }

  // 2. Xóa chặng khỏi mảng stages
  work.stages.pull(stageId);

  // 3. Tự động lùi thứ tự (-1) cho các chặng phía sau chặng bị xóa
  work.stages.forEach((stg) => {
    const stgOrder = Number(stg.stage_order) || 1;
    if (stgOrder > deletedOrder) {
      stg.stage_order = stgOrder - 1;
    }
  });

  // Chuẩn hóa lại thứ tự 1..N
  normalizeStageOrders(work.stages);

  // 4. Tự động gom mục tiêu vào các chặng còn lại
  assignGoalsToStagesInternal(work);

  await user.save();

  return {
    stages: work.stages,
    goals: work.goals,
  };
}

/**
 * Tự động quét và gom toàn bộ các mục tiêu vào các chặng phù hợp dựa theo hạn chót (goal_end_date <= stage_end_date).
 * @param {string|number} userId - ID người dùng
 * @param {string} workId - ID đầu việc
 * @returns {Promise<object>} - Danh sách stages và goals sau khi phân bổ
 */
export async function autoAssignGoalsToStages(userId, workId) {
  const user = await findUserById(userId, 'works');

  const work = user.works.id(workId);
  if (!work) {
    const error = new Error('Không tìm thấy đầu việc.');
    error.statusCode = 404;
    throw error;
  }

  // Chuẩn hóa dãy số thứ tự và phân bổ toàn bộ mục tiêu
  normalizeStageOrders(work.stages);
  assignGoalsToStagesInternal(work);

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
  const user = await findUserById(userId, 'works');

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
