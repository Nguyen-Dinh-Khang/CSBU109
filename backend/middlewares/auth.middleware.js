/**
 * TÊN FILE: auth.middleware.js
 * CÔNG DỤNG: Middleware xác thực quyền truy cập thông qua Access Token gửi trong Authorization Header.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import jwt from 'jsonwebtoken';

/**
 * Middleware kiểm tra và giải mã Access Token từ request headers.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 * @param {function} next - Hàm next middleware
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy Access Token. Vui lòng đăng nhập.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'csbu109_jwt_access_super_secret_key_2026_secure'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access Token đã hết hạn hoặc không hợp lệ.',
      expired: error.name === 'TokenExpiredError',
    });
  }
}
