/**
 * TÊN FILE: User.js
 * CÔNG DỤNG: Định nghĩa Schema và Model người dùng với trường userId dạng số nguyên tự tăng, email, username, password.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getNextSequenceValue } from './Counter.js';

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
