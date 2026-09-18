/**
 * TÊN FILE: auth.service.js
 * CÔNG DỤNG: Xử lý logic nghiệp vụ đăng ký, đăng nhập, làm mới token và quản lý phiên người dùng.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import jwt from 'jsonwebtoken';
import { User } from '../../models/common/User.js';

/**
 * Sinh cặp Access Token và Refresh Token cho người dùng.
 * @param {object} user - Thực thể User từ MongoDB
 * @returns {object} - Gồm accessToken và refreshToken
 */
export function generateTokens(user) {
  const payload = {
    id: user._id,
    userId: user.userId,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || 'csbu109_jwt_access_super_secret_key_2026_secure',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'csbu109_jwt_refresh_super_secret_key_2026_secure',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Thực hiện đăng ký tài khoản người dùng mới.
 * @param {object} param0 - Thông tin đăng ký gồm email, username, password
 * @returns {Promise<object>} - Gồm thông tin user đã tạo và cặp token
 */
export async function register({ email, username, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    const error = new Error('Email này đã được đăng ký trong hệ thống.');
    error.statusCode = 400;
    throw error;
  }

  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    const error = new Error('Username này đã có người sử dụng.');
    error.statusCode = 400;
    throw error;
  }

  const newUser = new User({
    email: normalizedEmail,
    username: normalizedUsername,
    password,
  });

  await newUser.save();

  const tokens = generateTokens(newUser);
  newUser.refreshToken = tokens.refreshToken;
  await newUser.save();

  return {
    user: newUser.toJSON(),
    ...tokens,
  };
}

/**
 * Thực hiện xác thực đăng nhập người dùng bằng email hoặc username.
 * @param {object} param0 - Gồm identifier (email hoặc username) và password
 * @returns {Promise<object>} - Gồm thông tin user và cặp token
 */
export async function login({ identifier, password }) {
  const cleanIdentifier = identifier.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
  });

  if (!user) {
    const error = new Error('Tài khoản hoặc mật khẩu không chính xác.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Tài khoản hoặc mật khẩu không chính xác.');
    error.statusCode = 401;
    throw error;
  }

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    ...tokens,
  };
}

/**
 * Kiểm tra Refresh Token từ cookie và cấp lại Access Token mới.
 * @param {string} token - Chuỗi Refresh Token nhận từ cookie
 * @returns {Promise<object>} - Gồm accessToken mới và thông tin user
 */
export async function refreshAccessToken(token) {
  if (!token) {
    const error = new Error('Không tìm thấy Refresh Token.');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'csbu109_jwt_refresh_super_secret_key_2026_secure'
    );
  } catch (err) {
    const error = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    error.statusCode = 403;
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    const error = new Error('Refresh Token không hợp lệ hoặc đã bị thu hồi.');
    error.statusCode = 403;
    throw error;
  }

  const newTokens = generateTokens(user);
  user.refreshToken = newTokens.refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  };
}

/**
 * Thu hồi phiên đăng nhập của người dùng bằng cách xóa refreshToken trong database.
 * @param {string} userId - ID của người dùng cần đăng xuất
 * @returns {Promise<boolean>} - Trạng thái thành công
 */
export async function logout(userId) {
  if (!userId) return false;
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  return true;
}

/**
 * Lấy thông tin chi tiết người dùng theo ID.
 * @param {string} userId - Mongo ID của người dùng
 * @returns {Promise<object>} - Thông tin user an toàn
 */
export async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Không tìm thấy thông tin người dùng.');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
}
