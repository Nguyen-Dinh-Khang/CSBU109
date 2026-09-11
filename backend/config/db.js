import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('\x1b[33m%s\x1b[0m', 'ℹ [MongoDB] Chưa có chuỗi kết nối MONGODB_URI trong file .env');
    console.log('\x1b[33m%s\x1b[0m', '  -> Bạn có thể dán link MongoDB vào backend/.env khi sẵn sàng.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log('\x1b[32m%s\x1b[0m', `✓ [MongoDB] Kết nối thành công tới máy chủ: ${conn.connection.host}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `✗ [MongoDB] Lỗi khi kết nối database: ${error.message}`);
  }
};

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
    hasConfiguredUri: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '')
  };
};
