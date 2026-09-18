/**
 * TÊN FILE: db.js
 * CÔNG DỤNG: Cấu hình kết nối cơ sở dữ liệu MongoDB Atlas với tên database cố định 'csbu109'.
 * PHẠM VI DÙNG: Toàn hệ thống Backend (Config).
 */

import mongoose from 'mongoose';

/**
 * Khởi tạo kết nối tới cơ sở dữ liệu MongoDB Atlas, chỉ định tường minh dbName là 'csbu109'.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('\x1b[33m%s\x1b[0m', 'ℹ [MongoDB] Chưa có chuỗi kết nối MONGODB_URI trong file .env');
    console.log('\x1b[33m%s\x1b[0m', '  -> Bạn có thể dán link MongoDB vào backend/.env khi sẵn sàng.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'csbu109',
    });
    console.log(
      '\x1b[32m%s\x1b[0m',
      `✓ [MongoDB] Kết nối thành công tới database '${conn.connection.name}' trên máy chủ: ${conn.connection.host}`
    );
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `✗ [MongoDB] Lỗi khi kết nối database: ${error.message}`);
  }
};

/**
 * Lấy trạng thái kết nối hiện tại của cơ sở dữ liệu MongoDB.
 * @returns {object} - Gồm mã trạng thái, cờ isConnected, chuỗi mô tả và tên database
 */
export const getDBStatus = () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = {
    0: 'Chưa kết nối (Disconnected)',
    1: 'Đã kết nối (Connected)',
    2: 'Đang kết nối (Connecting)',
    3: 'Đang ngắt kết nối (Disconnecting)',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    code: stateCode,
    isConnected: stateCode === 1,
    statusText: states[stateCode] || 'Không xác định',
    databaseName: mongoose.connection.name || 'csbu109',
    hasConfiguredUri: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== ''),
  };
};

