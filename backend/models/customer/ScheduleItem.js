/**
 * TÊN FILE: ScheduleItem.js
 * CÔNG DỤNG: Model quản lý môn học / dự án theo dõi lịch trình với các giai đoạn nhỏ (milestones/subtasks).
 * PHẠM VI DÙNG: Phân hệ Customer.
 */

import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề giai đoạn là bắt buộc'],
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: String,
    default: '',
  },
});

const scheduleItemSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Tên môn học/dự án là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Môn học', 'Dự án', 'Mục tiêu cá nhân'],
      default: 'Môn học',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    stages: [stageSchema],
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Middleware tiền xử lý trước khi lưu: Tự động tính toán lại tỷ lệ hoàn thành theo các giai đoạn nhỏ.
 */
scheduleItemSchema.pre('save', function () {
  if (this.stages && this.stages.length > 0) {
    const completedCount = this.stages.filter((stage) => stage.isCompleted).length;
    this.progressPercentage = Math.round((completedCount / this.stages.length) * 100);
  } else {
    this.progressPercentage = 0;
  }
});

export const ScheduleItem = mongoose.model('ScheduleItem', scheduleItemSchema);
