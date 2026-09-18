/**
 * TÊN FILE: Counter.js
 * CÔNG DỤNG: Quản lý số tự tăng (auto-increment sequence) cho các trường số nguyên như userId.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 1000,
  },
});

export const Counter = mongoose.model('Counter', counterSchema);

/**
 * Hàm lấy số tự tăng tiếp theo cho một chuỗi định danh.
 * @param {string} sequenceName - Tên chuỗi định danh cần tăng (ví dụ: 'userId')
 * @returns {Promise<number>} - Giá trị số nguyên tiếp theo (bắt đầu từ 1001)
 */
export async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  if (counter.seq < 1001) {
    counter.seq = 1001;
    await counter.save();
  }

  return counter.seq;
}
