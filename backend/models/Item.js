import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề (title) là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt
  }
);

export const Item = mongoose.model('Item', itemSchema);
