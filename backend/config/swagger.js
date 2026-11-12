/**
 * TÊN FILE: swagger.js
 * CÔNG DỤNG: Cấu hình tài liệu trực tuyến OpenAPI 3.0 / Swagger UI cho toàn bộ RESTful API của hệ thống.
 * PHẠM VI DÙNG: Toàn hệ thống Backend (Config / Documentation).
 */

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CSBU109 - RESTful API Documentation',
    version: '1.0.0',
    description: `
Tài liệu trực tuyến chính thức của hệ thống Backend **CSBU109** (Quản lý Lịch trình, Đầu việc & Lộ trình Học tập Thông minh).

### Đặc điểm kiến trúc:
- **Cơ sở dữ liệu:** MongoDB (Mongoose ODM) theo mô hình **Document nhúng tập trung (Embedded Subdocuments)** bên trong Collection \`users\`.
- **Bảo mật:** JWT Authentication qua header \`Authorization: Bearer <token>\`.
- **Trí tuệ Nhân tạo:** Tích hợp Google Gemini AI sinh lộ trình học tập tự động.
    `,
    contact: {
      name: 'Nhóm phát triển CSBU109',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server hiện tại (Relative URL)',
    },
    {
      url: 'http://localhost:5000/api',
      description: 'Môi trường phát triển cục bộ (Local Development)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập mã JWT Access Token của bạn để xác thực API (ví dụ: eyJhbGciOi...)',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Đã có lỗi xảy ra hoặc token không hợp lệ' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6720f4c3a1b2c3d4e5f6a7b8' },
          userId: { type: 'number', example: 1001 },
          username: { type: 'string', example: 'nguyen_van_a' },
          email: { type: 'string', example: 'vana@example.com' },
          role: { type: 'string', example: 'customer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Stage: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6720f500a1b2c3d4e5f6a7c1' },
          stage_name: { type: 'string', example: 'Chặng 1: Thiết kế Cơ sở Dữ liệu' },
          stage_order: { type: 'number', example: 1 },
          stage_start_date: { type: 'string', format: 'date-time', example: '2026-10-01T00:00:00.000Z' },
          stage_end_date: { type: 'string', format: 'date-time', example: '2026-10-15T00:00:00.000Z' },
          stage_description: { type: 'string', example: 'Xây dựng Mongoose Embedded Schema' },
          stage_color: { type: 'string', example: '#3B82F6' },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6720f600a1b2c3d4e5f6a7d1' },
          goal_name: { type: 'string', example: 'Thiết kế Schema User, Work, Goal, Date' },
          goal_end_date: { type: 'string', format: 'date-time', example: '2026-10-12T00:00:00.000Z' },
          goal_color: { type: 'string', example: '#10B981' },
          goal_range: { type: 'number', example: 3 },
          goal_description: { type: 'string', example: 'Hoàn thiện file models/common/User.js' },
          goal_check: { type: 'boolean', example: false },
          stage_id: { type: 'string', nullable: true, example: '6720f500a1b2c3d4e5f6a7c1' },
        },
      },
      Work: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6720f700a1b2c3d4e5f6a7e1' },
          work_name: { type: 'string', example: 'Đồ án Công nghệ Phần mềm CSBU109' },
          work_start_date: { type: 'string', format: 'date-time', example: '2026-10-01T00:00:00.000Z' },
          work_end_date: { type: 'string', format: 'date-time', example: '2026-11-20T00:00:00.000Z' },
          work_color: { type: 'string', example: '#10B981' },
          work_description: { type: 'string', example: 'Xây dựng ứng dụng quản lý lịch trình và đầu việc' },
          goals_count: { type: 'number', example: 5 },
          completed_goals_count: { type: 'number', example: 2 },
          progress_percentage: { type: 'number', example: 40 },
          is_expired: { type: 'boolean', example: false },
          stages: { type: 'array', items: { $ref: '#/components/schemas/Stage' } },
          goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
        },
      },
      SpecialDate: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6720f800a1b2c3d4e5f6a7f1' },
          date_name: { type: 'string', example: 'Báo cáo Giữa kỳ Đồ án CSBU109' },
          date_date: { type: 'string', format: 'date-time', example: '2026-11-15T00:00:00.000Z' },
          date_color: { type: 'string', example: '#3B82F6' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Đăng ký, Đăng nhập, Làm mới Token và Hồ sơ người dùng' },
    { name: 'Dashboard', description: 'Bảng điều khiển tổng quan (Deadline khẩn cấp và sự kiện sắp tới)' },
    { name: 'Works', description: 'Quản lý đầu việc lớn (Tạo, Xem danh sách, Sửa, Xóa)' },
    { name: 'Goals', description: 'Quản lý mục tiêu con (Thêm mới, Đảo trạng thái hoàn thành, Xóa)' },
    { name: 'Stages', description: 'Quản lý chặng lộ trình & Tự động gom mục tiêu theo mốc ngày' },
    { name: 'Dates', description: 'Quản lý các mốc ngày đặc biệt và sự kiện trên lịch' },
    { name: 'AI Roadmap', description: 'Trí tuệ nhân tạo Gemini AI sinh lộ trình học tập tự động' },
    { name: 'Health Check', description: 'Kiểm tra trạng thái kết nối máy chủ và MongoDB' },
  ],
  paths: {
    '/status': {
      get: {
        tags: ['Health Check'],
        summary: 'Kiểm tra trạng thái máy chủ và kết nối MongoDB',
        responses: {
          200: {
            description: 'Máy chủ hoạt động bình thường',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Backend Node.js đang hoạt động bình thường!' },
                    timestamp: { type: 'string', format: 'date-time' },
                    database: {
                      type: 'object',
                      properties: {
                        isConnected: { type: 'boolean', example: true },
                        statusText: { type: 'string', example: 'Đã kết nối (Connected)' },
                        databaseName: { type: 'string', example: 'csbu109' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản người dùng mới (Function 11)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'nguyen_van_a' },
                  email: { type: 'string', example: 'vana@example.com' },
                  password: { type: 'string', example: 'MatKhau123!' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Đăng ký thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đăng ký tài khoản thành công' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Dữ liệu không hợp lệ hoặc Email/Username đã tồn tại' },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập hệ thống & Cấp JWT Token (Function 12)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'nguyen_van_a' },
                  password: { type: 'string', example: 'MatKhau123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Đăng nhập thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đăng nhập thành công' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Sai tên đăng nhập hoặc mật khẩu' },
        },
      },
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Làm mới Access Token khi hết hạn',
        responses: {
          200: {
            description: 'Cấp token mới thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' },
                  },
                },
              },
            },
          },
          401: { description: 'Refresh token không hợp lệ hoặc đã hết hạn' },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin tài khoản người dùng đang đăng nhập',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Chưa xác thực hoặc token không hợp lệ' },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất khỏi hệ thống',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Đăng xuất thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đăng xuất thành công' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Lấy dữ liệu bảng điều khiển tổng quan (Function 4)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        upcoming_goals: {
                          type: 'array',
                          description: 'Tối đa 5 mục tiêu gần hạn chót nhất chưa hoàn thành',
                          items: {
                            type: 'object',
                            properties: {
                              goal_id: { type: 'string' },
                              goal_name: { type: 'string' },
                              goal_end_date: { type: 'string', format: 'date-time' },
                              goal_color: { type: 'string' },
                              work_id: { type: 'string' },
                              work_name: { type: 'string' },
                            },
                          },
                        },
                        upcoming_dates: {
                          type: 'array',
                          description: 'Tối đa 3 ngày đặc biệt sắp tới',
                          items: { $ref: '#/components/schemas/SpecialDate' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/works': {
      get: {
        tags: ['Works'],
        summary: 'Lấy danh sách đầu việc vắn tắt (Function 5)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            description: 'Từ khóa tìm kiếm theo tên đầu việc (hỗ trợ 300ms debounce)',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Danh sách đầu việc của người dùng',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Work' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Works'],
        summary: 'Tạo một đầu việc mới (Function 1)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['work_name', 'work_start_date', 'work_end_date'],
                properties: {
                  work_name: { type: 'string', example: 'Đồ án môn học CSBU109' },
                  work_start_date: { type: 'string', format: 'date', example: '2026-10-01' },
                  work_end_date: { type: 'string', format: 'date', example: '2026-11-20' },
                  work_color: { type: 'string', example: '#10B981' },
                  work_description: { type: 'string', example: 'Ứng dụng quản lý lịch trình và lộ trình học tập' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Tạo đầu việc thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Tạo đầu việc thành công' },
                    data: { $ref: '#/components/schemas/Work' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/works/{work_id}': {
      put: {
        tags: ['Works'],
        summary: 'Cập nhật thông tin đầu việc (Function 6 - Edit)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'work_id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  work_name: { type: 'string' },
                  work_start_date: { type: 'string', format: 'date' },
                  work_end_date: { type: 'string', format: 'date' },
                  work_color: { type: 'string' },
                  work_description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật đầu việc thành công' },
        },
      },
      delete: {
        tags: ['Works'],
        summary: 'Xóa hoàn toàn một đầu việc cùng các mục tiêu/chặng bên trong (Function 6 - Delete)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'work_id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Đã xóa đầu việc thành công' },
        },
      },
    },

    '/works/{work_id}/goals': {
      get: {
        tags: ['Goals'],
        summary: 'Lấy chi tiết toàn bộ mục tiêu và chặng của đầu việc (Function 7 - Lazy Fetching)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'work_id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Danh sách mục tiêu và các chặng của đầu việc',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    work_name: { type: 'string', example: 'Đồ án môn học CSBU109' },
                    stages: { type: 'array', items: { $ref: '#/components/schemas/Stage' } },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Goals'],
        summary: 'Tạo mục tiêu mới thuộc về một đầu việc (Function 2)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'work_id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['goal_name', 'goal_end_date'],
                properties: {
                  goal_name: { type: 'string', example: 'Thiết kế REST API Endpoints' },
                  goal_end_date: { type: 'string', format: 'date', example: '2026-10-25' },
                  goal_color: { type: 'string', example: '#3B82F6' },
                  goal_range: { type: 'number', example: 3, minimum: 1, maximum: 5 },
                  goal_description: { type: 'string', example: 'Bảo mật bằng JWT Middleware' },
                  stage_id: { type: 'string', nullable: true, example: '6720f500a1b2c3d4e5f6a7c1' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo mục tiêu thành công' },
        },
      },
    },

    '/works/{work_id}/goals/{goal_id}': {
      put: {
        tags: ['Goals'],
        summary: 'Chỉnh sửa thông tin mục tiêu (Function 8 - Edit)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'work_id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'goal_id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  goal_name: { type: 'string' },
                  goal_end_date: { type: 'string', format: 'date' },
                  goal_color: { type: 'string' },
                  goal_range: { type: 'number' },
                  goal_description: { type: 'string' },
                  stage_id: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật mục tiêu thành công' },
        },
      },
      delete: {
        tags: ['Goals'],
        summary: 'Xóa mục tiêu khỏi đầu việc (Function 8 - Delete)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'work_id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'goal_id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Đã xóa mục tiêu thành công' },
        },
      },
    },

    '/works/{work_id}/goals/{goal_id}/check': {
      patch: {
        tags: ['Goals'],
        summary: 'Đảo trạng thái hoàn thành của mục tiêu (Function 8 - Check/Uncheck)',
        description: 'Hỗ trợ cơ chế Optimistic UI ở Frontend với phản hồi cập nhật tức thì.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'work_id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'goal_id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Đổi trạng thái hoàn thành thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cập nhật trạng thái thành công' },
                    data: { $ref: '#/components/schemas/Goal' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/works/{work_id}/stages': {
      post: {
        tags: ['Stages'],
        summary: 'Tạo một chặng mới trong đầu việc',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'work_id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['stage_name'],
                properties: {
                  stage_name: { type: 'string', example: 'Chặng 2: Hoàn thiện Giao diện UI' },
                  stage_order: { type: 'number', example: 2 },
                  stage_start_date: { type: 'string', format: 'date', example: '2026-10-16' },
                  stage_end_date: { type: 'string', format: 'date', example: '2026-10-31' },
                  stage_description: { type: 'string', example: 'Thiết kế SCSS Modules và responsive' },
                  stage_color: { type: 'string', example: '#8B5CF6' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo chặng mới thành công' },
        },
      },
    },

    '/works/{work_id}/stages/{stage_id}': {
      put: {
        tags: ['Stages'],
        summary: 'Cập nhật thông tin chặng',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'work_id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'stage_id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  stage_name: { type: 'string' },
                  stage_order: { type: 'number' },
                  stage_start_date: { type: 'string', format: 'date' },
                  stage_end_date: { type: 'string', format: 'date' },
                  stage_description: { type: 'string' },
                  stage_color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật chặng thành công' },
        },
      },
      delete: {
        tags: ['Stages'],
        summary: 'Xóa chặng khỏi đầu việc (Các mục tiêu con tự động chuyển về mục tự do)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'work_id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'stage_id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Đã xóa chặng thành công' },
        },
      },
    },

    '/works/{work_id}/stages/auto-assign': {
      post: {
        tags: ['Stages'],
        summary: 'Tự động phân bổ mục tiêu vào các chặng theo mốc ngày',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'work_id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Tự động phân bổ mục tiêu thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đã tự động gom mục tiêu vào các chặng' },
                    stages: { type: 'array', items: { $ref: '#/components/schemas/Stage' } },
                    goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/dates': {
      get: {
        tags: ['Dates'],
        summary: 'Lấy danh sách ngày đặc biệt theo tháng và năm (Function 9)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', required: false, schema: { type: 'number', example: 10 } },
          { name: 'year', in: 'query', required: false, schema: { type: 'number', example: 2026 } },
        ],
        responses: {
          200: {
            description: 'Danh sách ngày đặc biệt trong tháng',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/SpecialDate' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Dates'],
        summary: 'Tạo ngày đặc biệt mới vào lịch cá nhân (Function 3)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date_name', 'date_date'],
                properties: {
                  date_name: { type: 'string', example: 'Bảo vệ Đồ án tốt nghiệp' },
                  date_date: { type: 'string', format: 'date', example: '2026-11-25' },
                  date_color: { type: 'string', example: '#F59E0B' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo ngày đặc biệt thành công' },
        },
      },
    },

    '/dates/{date_id}': {
      put: {
        tags: ['Dates'],
        summary: 'Cập nhật ngày đặc biệt (Function 10 - Edit)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'date_id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  date_name: { type: 'string' },
                  date_date: { type: 'string', format: 'date' },
                  date_color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật ngày đặc biệt thành công' },
        },
      },
      delete: {
        tags: ['Dates'],
        summary: 'Xóa ngày đặc biệt khỏi lịch (Function 10 - Delete)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'date_id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Đã xóa ngày đặc biệt thành công' },
        },
      },
    },

    '/ai/roadmap': {
      post: {
        tags: ['AI Roadmap'],
        summary: 'Sinh lộ trình học tập thông minh qua Gemini AI',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['topic'],
                properties: {
                  topic: { type: 'string', example: 'Lập trình Web MERN Stack thực chiến' },
                  target: { type: 'string', example: 'Làm chủ React và Node.js Express trong 6 tuần' },
                  durationWeeks: { type: 'number', example: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lộ trình sinh bởi AI',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        work_name: { type: 'string' },
                        work_description: { type: 'string' },
                        stages: { type: 'array', items: { $ref: '#/components/schemas/Stage' } },
                        goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/ai/roadmap/refine': {
      post: {
        tags: ['AI Roadmap'],
        summary: 'Tinh chỉnh lộ trình học tập đã sinh theo góp ý của người dùng',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentRoadmap', 'feedback'],
                properties: {
                  currentRoadmap: { type: 'object' },
                  feedback: { type: 'string', example: 'Rút ngắn thời gian Chặng 1 và thêm bài tập về JWT Middleware' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Lộ trình đã tinh chỉnh bởi AI' },
        },
      },
    },

    '/ai/roadmap/apply': {
      post: {
        tags: ['AI Roadmap'],
        summary: 'Áp dụng lộ trình AI thành một đầu việc hoàn chỉnh trên tài khoản',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roadmapData'],
                properties: {
                  roadmapData: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Áp dụng lộ trình thành công và tạo đầu việc mới',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Đã tạo đầu việc từ lộ trình AI' },
                    data: { $ref: '#/components/schemas/Work' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
