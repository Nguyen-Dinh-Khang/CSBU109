/**
 * TÊN FILE: User.js
 * CÔNG DỤNG: Định nghĩa Schema và Model người dùng gồm thông tin xác thực và các subdocuments lồng nhau (works, goals, dates) theo kiến trúc MongoDB Embedded.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getNextSequenceValue } from './Counter.js';

/**
 * Schema cho mục tiêu con (Goal Subdocument) thuộc một đầu việc (Work).
 */
const goalSchema = new mongoose.Schema(
  {
    goal_name: {
      type: String,
      required: [true, 'Tên mục tiêu là bắt buộc'],
      trim: true,
    },
    goal_end_date: {
      type: Date,
      required: [true, 'Hạn chót mục tiêu là bắt buộc'],
    },
    goal_color: {
      type: String,
      default: '#EF4444',
      trim: true,
    },
    goal_range: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    goal_description: {
      type: String,
      default: '',
      trim: true,
    },
    goal_check: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Schema cho đầu việc lớn (Work Subdocument) thuộc về người dùng.
 */
const workSchema = new mongoose.Schema(
  {
    work_name: {
      type: String,
      required: [true, 'Tên đầu việc là bắt buộc'],
      trim: true,
    },
    work_start_date: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    work_end_date: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    work_color: {
      type: String,
      default: '#10B981',
      trim: true,
    },
    work_description: {
      type: String,
      default: '',
      trim: true,
    },
    goals_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    goals: [goalSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * Schema cho ngày đặc biệt / sự kiện lịch trình (Date Subdocument) của người dùng.
 */
const dateSchema = new mongoose.Schema(
  {
    date_name: {
      type: String,
      required: [true, 'Tên sự kiện/ngày đặc biệt là bắt buộc'],
      trim: true,
    },
    date_date: {
      type: Date,
      required: [true, 'Thời gian sự kiện là bắt buộc'],
    },
    date_color: {
      type: String,
      default: '#3B82F6',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Schema chính cho tài khoản người dùng (User Document) chứa các mảng nhúng works và dates.
 */
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Định dạng email không hợp lệ'],
    },
    username: {
      type: String,
      required: [true, 'Username là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username phải có ít nhất 3 ký tự'],
      maxlength: [30, 'Username tối đa 30 ký tự'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    works: [workSchema],
    dates: [dateSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * Middleware tiền xử lý trước khi lưu: Tự động gán userId tự tăng nếu là user mới và băm mật khẩu nếu có thay đổi.
 */
userSchema.pre('save', async function () {
  if (this.isNew && !this.userId) {
    this.userId = await getNextSequenceValue('userId');
  }

  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Phương thức so sánh mật khẩu người dùng nhập vào với mật khẩu đã băm trong database.
 * @param {string} candidatePassword - Mật khẩu thuần nhập vào
 * @returns {Promise<boolean>} - Kết quả khớp hoặc không khớp
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Phương thức chuyển đổi dữ liệu User sang JSON, tự động loại bỏ các trường nhạy cảm như password và refreshToken.
 * @returns {object} - Dữ liệu user an toàn
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

export const User = mongoose.model('User', userSchema);
