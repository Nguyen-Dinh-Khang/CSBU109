/**
 * TÊN FILE: auth.controller.js
 * CÔNG DỤNG: Tiếp nhận HTTP request cho các luồng đăng ký, đăng nhập, làm mới token và đăng xuất.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

import * as authService from '../../services/common/auth.service.js';

/**
 * Hàm hỗ trợ thiết lập Cookie HttpOnly chứa Refresh Token.
 * @param {object} res - Response object của Express
 * @param {object} req - Request object của Express
 * @param {string} token - Chuỗi Refresh Token
 */
function setRefreshTokenCookie(res, req, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = isProduction || (req && (req.secure || req.headers['x-forwarded-proto'] === 'https'));
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: Boolean(isSecure),
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
}

/**
 * Xử lý yêu cầu đăng ký tài khoản người dùng mới.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function register(req, res) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email, username và mật khẩu.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.',
      });
    }

    const result = await authService.register({ email, username, password });
    setRefreshTokenCookie(res, req, result.refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi đăng ký tài khoản.',
    });
  }
}

/**
 * Xử lý yêu cầu đăng nhập tài khoản.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email/username và mật khẩu.',
      });
    }

    const result = await authService.login({ identifier, password });
    setRefreshTokenCookie(res, req, result.refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Đăng nhập thất bại.',
    });
  }
}

/**
 * Xử lý yêu cầu cấp lại Access Token mới dựa trên Refresh Token lưu trong Cookie.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy Refresh Token trong cookie.',
      });
    }

    const result = await authService.refreshAccessToken(token);
    setRefreshTokenCookie(res, req, result.refreshToken);

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    return res.status(error.statusCode || 403).json({
      success: false,
      message: error.message || 'Không thể làm mới token.',
    });
  }
}

/**
 * Xử lý yêu cầu đăng xuất và xóa Refresh Token trong Cookie và Database.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function logout(req, res) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = isProduction || (req && (req.secure || req.headers['x-forwarded-proto'] === 'https'));
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: Boolean(isSecure),
      sameSite: isSecure ? 'none' : 'lax',
    });

    if (req.user?.id) {
      await authService.logout(req.user.id);
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng xuất tài khoản.',
    });
  }
}

/**
 * Lấy thông tin tài khoản hiện tại của phiên đăng nhập.
 * @param {object} req - Request object từ Express
 * @param {object} res - Response object từ Express
 */
export async function getMe(req, res) {
  try {
    const user = await authService.getUserProfile(req.user.id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thông tin người dùng.',
    });
  }
}
