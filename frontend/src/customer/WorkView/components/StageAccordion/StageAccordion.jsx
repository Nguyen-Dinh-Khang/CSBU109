/**
 * TÊN FILE: StageAccordion.jsx
 * CÔNG DỤNG: Component hiển thị danh sách Chặng theo cơ chế Accordion mở rộng tại chỗ, đẩy các chặng bên dưới xuống và hiển thị chi tiết các mục tiêu con.
 * PHẠM VI DÙNG: Phân hệ Customer (WorkView).
 */

import { useState } from 'react';
import { formatDisplayDate, getDeadlineBadgeInfo } from '../../../../shared/utils/dateFormat.js';
import styles from './StageAccordion.module.scss';

/**
 * Component hiển thị danh sách các chặng dạng Accordion.
 * @param {object} props - Gồm stages, goals, onToggleGoalCheck, onEditGoal, onDeleteGoal, onCreateGoalInStage, onEditStage, onDeleteStage, onAutoAssign, isAutoAssigning, expandedStageIds, onToggleExpandStage
 */
export function StageAccordion({
  stages = [],
  goals = [],
  onToggleGoalCheck,
  onEditGoal,
  onDeleteGoal,
  onCreateGoalInStage,
  onEditStage,
  onDeleteStage,
  onAutoAssign,
  isAutoAssigning = false,
  expandedStageIds,
  onToggleExpandStage,
}) {
  // Sắp xếp các chặng luôn theo thứ tự stage_order tăng dần
  const sortedStages = [...stages].sort(
    (a, b) => (Number(a.stage_order) || 1) - (Number(b.stage_order) || 1)
  );

  // State dự phòng quản lý chặng mở rộng nếu không được truyền từ component cha
  const [internalExpandedIds, setInternalExpandedIds] = useState(() => {
    if (sortedStages.length > 0) return new Set([sortedStages[0]._id]);
    return new Set(['unassigned']);
  });

  const isControlled = expandedStageIds !== undefined;
  const currentExpandedIds = isControlled ? expandedStageIds : internalExpandedIds;

  /**
   * Chuyển đổi trạng thái đóng / mở của một chặng.
   * @param {string} stageId - ID chặng cần chuyển đổi
   */
  const handleToggle = (stageId) => {
    if (onToggleExpandStage) {
      onToggleExpandStage(stageId);
    } else {
      setInternalExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(stageId)) {
          next.delete(stageId);
        } else {
          next.add(stageId);
        }
        return next;
      });
    }
  };

  // Gom các mục tiêu chưa được gán vào chặng nào
  const unassignedGoals = goals.filter((g) => !g.stage_id);

  return (
    <div className={styles.stageAccordion}>
      {/* DANH SÁCH CÁC CHẶNG ACCORDION */}
      <div className={styles.stageList}>
        {sortedStages.map((stage) => {
          const isExpanded = currentExpandedIds.has(stage._id);
          const stageGoals = goals.filter(
            (g) => g.stage_id && g.stage_id.toString() === stage._id.toString()
          );
          const totalGoals = stageGoals.length;
          const completedGoals = stageGoals.filter((g) => g.goal_check).length;
          const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
          const stageColor = stage.stage_color || '#3B82F6';

          return (
            <div
              key={stage._id}
              className={`${styles.stageCard} ${isExpanded ? styles.expanded : ''}`}
              style={{ '--stage-color': stageColor }}
            >
              {/* HEADER CỦA CHẶNG */}
              <div
                className={styles.stageHeader}
                onClick={() => handleToggle(stage._id)}
              >
                <div className={styles.stageHeaderLeft}>
                  <span className={styles.orderBadge}>
                    Chặng {stage.stage_order || 1}
                  </span>
                  <div className={styles.stageTitleGroup}>
                    <h4 className={styles.stageName}>{stage.stage_name}</h4>
                    <div className={styles.stageMeta}>
                      <span>
                        📅 {stage.stage_start_date ? formatDisplayDate(stage.stage_start_date) : 'Chưa đặt'} →{' '}
                        {stage.stage_end_date ? formatDisplayDate(stage.stage_end_date) : 'Chưa đặt'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.stageHeaderRight}>
                  {/* TIẾN ĐỘ CỦA CHẶNG */}
                  <div className={styles.stageProgressWrap}>
                    <span className={`${styles.progressLabel} ${progress === 100 ? styles.done : ''}`}>
                      {completedGoals}/{totalGoals} Mục tiêu ({progress}%)
                    </span>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#10B981' : stageColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* CÁC NÚT THAO TÁC VỚI CHẶNG */}
                  <div className={styles.headerActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.quickAddGoalBtn}
                      title={`Thêm nhanh mục tiêu vào chặng ${stage.stage_order || 1}`}
                      onClick={() => onCreateGoalInStage(stage._id)}
                    >
                      + Mục tiêu
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="Sửa chặng"
                      onClick={() => onEditStage(stage)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.danger}`}
                      title="Xóa chặng (Các mục tiêu sẽ được chuyển về mục chung)"
                      onClick={() => onDeleteStage(stage._id)}
                    >
                      🗑
                    </button>
                    <span className={`${styles.chevron} ${isExpanded ? styles.open : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* THÂN CHẶNG MỞ RỘNG (CHỨA MỤC TIÊU THUỘC CHẶNG ĐÓ) */}
              {isExpanded && (
                <div className={styles.stageBody}>
                  {stage.stage_description && (
                    <p className={styles.stageDesc}>💡 {stage.stage_description}</p>
                  )}

                  <div className={styles.bodyActionRow}>
                    <span className={styles.goalCountText}>
                      Danh sách {stageGoals.length} mục tiêu thuộc chặng này:
                    </span>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => onCreateGoalInStage(stage._id)}
                    >
                      + Thêm Goal vào chặng này
                    </button>
                  </div>

                  {stageGoals.length === 0 ? (
                    <div className={styles.emptyStageGoals}>
                      <p>Chặng này hiện chưa có mục tiêu nào.</p>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => onCreateGoalInStage(stage._id)}
                      >
                        + Tạo mục tiêu đầu tiên cho chặng {stage.stage_order || 1}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.stageGoalsList}>
                      {stageGoals.map((goal) => {
                        const badge = getDeadlineBadgeInfo(goal.goal_end_date);
                        return (
                          <div
                            key={goal._id}
                            className={`${styles.goalItem} ${goal.goal_check ? styles.completed : ''}`}
                          >
                            <button
                              type="button"
                              className={`${styles.checkbox} ${goal.goal_check ? styles.checked : ''}`}
                              onClick={() => onToggleGoalCheck(goal._id)}
                              title="Đánh dấu hoàn thành"
                            >
                              {goal.goal_check ? '✓' : ''}
                            </button>

                            <span
                              className={styles.goalColorDot}
                              style={{ backgroundColor: goal.goal_color || '#EF4444' }}
                            />

                            <div
                              className={styles.goalContent}
                              onClick={() => onToggleGoalCheck(goal._id)}
                            >
                              <div className={styles.goalItemTitle}>{goal.goal_name}</div>
                              {goal.goal_description && (
                                <div className={styles.goalItemDesc}>{goal.goal_description}</div>
                              )}
                              <div className={styles.goalItemMeta}>
                                <span>⚡ Quy mô: {goal.goal_range || 1}/5</span>
                                <span>• Hạn: {formatDisplayDate(goal.goal_end_date)}</span>
                                {!goal.goal_check && (
                                  <span className={`${styles.deadlineTag} ${styles[badge.status]}`}>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.goalItemActions}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                title="Sửa mục tiêu"
                                onClick={() => onEditGoal(goal)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.danger}`}
                                title="Xóa mục tiêu"
                                onClick={() => onDeleteGoal(goal._id)}
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        className={styles.dashedAddGoalBtn}
                        onClick={() => onCreateGoalInStage(stage._id)}
                        title={`Thêm mục tiêu mới vào chặng ${stage.stage_order || 1}`}
                      >
                        <span className={styles.dashedAddPlus}>+</span>
                        <span>Thêm mục tiêu vào Chặng {stage.stage_order || 1}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* MỤC TIÊU CHUNG / CHƯA PHÂN CHẶNG (ACCORDION CUỐI) */}
        {unassignedGoals.length > 0 && (
          <div
            className={`${styles.stageCard} ${currentExpandedIds.has('unassigned') ? styles.expanded : ''}`}
            style={{ '--stage-color': '#64748B' }}
          >
            <div
              className={styles.stageHeader}
              onClick={() => handleToggle('unassigned')}
            >
              <div className={styles.stageHeaderLeft}>
                <span className={styles.orderBadge} style={{ background: '#64748B' }}>
                  Chung
                </span>
                <div className={styles.stageTitleGroup}>
                  <h4 className={styles.stageName}>Mục tiêu chung / Chưa phân chặng</h4>
                  <div className={styles.stageMeta}>
                    <span>Các mục tiêu tự do chưa gán vào mốc chặng cụ thể</span>
                  </div>
                </div>
              </div>

              <div className={styles.stageHeaderRight}>
                <span className={styles.progressLabel}>
                  {unassignedGoals.filter((g) => g.goal_check).length}/{unassignedGoals.length} Mục tiêu
                </span>
                <span className={`${styles.chevron} ${currentExpandedIds.has('unassigned') ? styles.open : ''}`}>
                  ▼
                </span>
              </div>
            </div>

            {currentExpandedIds.has('unassigned') && (
              <div className={styles.stageBody}>
                <div className={styles.bodyActionRow}>
                  <span className={styles.goalCountText}>
                    Danh sách {unassignedGoals.length} mục tiêu chưa gán chặng:
                  </span>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={onAutoAssign}
                    disabled={isAutoAssigning || stages.length === 0}
                  >
                    🔄 Gom vào các chặng tự động
                  </button>
                </div>

                <div className={styles.stageGoalsList}>
                  {unassignedGoals.map((goal) => {
                    const badge = getDeadlineBadgeInfo(goal.goal_end_date);
                    return (
                      <div
                        key={goal._id}
                        className={`${styles.goalItem} ${goal.goal_check ? styles.completed : ''}`}
                      >
                        <button
                          type="button"
                          className={`${styles.checkbox} ${goal.goal_check ? styles.checked : ''}`}
                          onClick={() => onToggleGoalCheck(goal._id)}
                          title="Đánh dấu hoàn thành"
                        >
                          {goal.goal_check ? '✓' : ''}
                        </button>

                        <span
                          className={styles.goalColorDot}
                          style={{ backgroundColor: goal.goal_color || '#EF4444' }}
                        />

                        <div
                          className={styles.goalContent}
                          onClick={() => onToggleGoalCheck(goal._id)}
                        >
                          <div className={styles.goalItemTitle}>{goal.goal_name}</div>
                          {goal.goal_description && (
                            <div className={styles.goalItemDesc}>{goal.goal_description}</div>
                          )}
                          <div className={styles.goalItemMeta}>
                            <span>⚡ Quy mô: {goal.goal_range || 1}/5</span>
                            <span>• Hạn: {formatDisplayDate(goal.goal_end_date)}</span>
                            {!goal.goal_check && (
                              <span className={`${styles.deadlineTag} ${styles[badge.status]}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.goalItemActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title="Sửa mục tiêu"
                            onClick={() => onEditGoal(goal)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.danger}`}
                            title="Xóa mục tiêu"
                            onClick={() => onDeleteGoal(goal._id)}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className={styles.dashedAddGoalBtn}
                    onClick={() => onCreateGoalInStage(null)}
                    title="Thêm mục tiêu tự do mới"
                  >
                    <span className={styles.dashedAddPlus}>+</span>
                    <span>Thêm mục tiêu tự do mới</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StageAccordion;
