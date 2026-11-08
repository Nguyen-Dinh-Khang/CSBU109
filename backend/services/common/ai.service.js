/**
 * TÊN FILE: ai.service.js
 * CÔNG DỤNG: Dịch vụ trí tuệ nhân tạo (AI Engine) tích hợp Google Gemini API để tự động sinh lộ trình học tập, phân rã môn học thành các chặng và mục tiêu cụ thể.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

/**
 * Sinh lộ trình mẫu dự phòng khi chưa cấu hình GEMINI_API_KEY hoặc khi API gặp sự cố mạng.
 * @param {string} subjectName - Tên môn học hoặc đề tài
 * @param {number} weeks - Số tuần học
 * @param {string} [goalDescription=''] - Kỳ vọng đầu ra của người học
 * @returns {object} - Lộ trình hoàn chỉnh gồm stages và goals
 */
function generateFallbackRoadmap(subjectName, weeks = 6, goalDescription = '') {
  const numWeeks = Math.max(2, Math.min(16, Number(weeks) || 6));
  const stagesCount = numWeeks <= 4 ? 2 : numWeeks <= 8 ? 3 : 4;
  const weeksPerStage = Math.round(numWeeks / stagesCount);

  const stageTemplates = [
    {
      titleSuffix: 'Nền tảng & Kiến thức cốt lõi',
      desc: 'Làm quen với các khái niệm căn bản, cú pháp, cài đặt môi trường và các nguyên lý sơ khởi.',
      color: '#3B82F6',
      goals: [
        'Cài đặt công cụ, môi trường thực hành và tài liệu học tập',
        'Nghiên cứu các khái niệm cơ bản và làm bài tập nhập môn',
        'Tổng hợp ghi chú tóm tắt kiến thức tuần đầu',
      ],
    },
    {
      titleSuffix: 'Thực hành chuyên sâu & Kỹ thuật trọng tâm',
      desc: 'Đi sâu vào các chủ đề nâng cao, giải quyết các bài toán mẫu và các mô hình áp dụng thực tế.',
      color: '#8B5CF6',
      goals: [
        'Hoàn thành bài tập lớn phần kiến thức trọng tâm',
        'Luyện tập các case study thực tế và xử lý lỗi thường gặp',
        'Tham khảo code mẫu chuẩn và tối ưu hóa phương pháp',
      ],
    },
    {
      titleSuffix: 'Đồ án thực chiến & Ứng dụng tích hợp',
      desc: 'Kết hợp toàn bộ kiến thức đã học vào một dự án cụ thể hoặc bộ đề thi thử toàn diện.',
      color: '#F59E0B',
      goals: [
        'Xây dựng kiến trúc đồ án và hoàn thành 50% tính năng',
        'Hoàn thiện đồ án, tự kiểm thử và sửa lỗi logic',
      ],
    },
    {
      titleSuffix: 'Đánh giá, Tổng kết & Tối ưu hóa',
      desc: 'Ôn tập toàn diện, chuẩn bị báo cáo hoặc tự tin bước vào kỳ thi chính thức.',
      color: '#10B981',
      goals: [
        'Luyện đề tổng hợp đạt điểm mục tiêu',
        'Đóng gói tài liệu, slide thuyết trình hoặc báo cáo cuối kỳ',
      ],
    },
  ];

  const now = new Date();
  const stages = [];
  let currentStartOffset = 0;

  for (let i = 0; i < stagesCount; i++) {
    const template = stageTemplates[i % stageTemplates.length];
    const durationDays = weeksPerStage * 7;

    const stageStartDate = new Date(now.getTime() + currentStartOffset * 86400000);
    const stageEndDate = new Date(stageStartDate.getTime() + (durationDays - 1) * 86400000);

    const stageGoals = template.goals.map((gName, idx) => {
      const goalDeadline = new Date(
        stageStartDate.getTime() + Math.round(((idx + 1) / template.goals.length) * (durationDays - 1)) * 86400000
      );
      return {
        goal_name: `${gName} (${subjectName})`,
        goal_description: `Mục tiêu giai đoạn ${i + 1} của môn ${subjectName}`,
        goal_end_date: goalDeadline,
        goal_color: idx % 2 === 0 ? '#EF4444' : '#F59E0B',
        goal_range: Math.min(10, 4 + idx * 2),
      };
    });

    stages.push({
      stage_name: `Chặng ${i + 1}: ${template.titleSuffix}`,
      stage_order: i + 1,
      stage_start_date: stageStartDate,
      stage_end_date: stageEndDate,
      stage_description: template.desc,
      stage_color: template.color,
      goals: stageGoals,
    });

    currentStartOffset += durationDays;
  }

  const workEndDate = new Date(now.getTime() + numWeeks * 7 * 86400000);

  return {
    work_name: subjectName,
    work_description: goalDescription
      ? `Lộ trình học tập ${numWeeks} tuần: ${goalDescription}`
      : `Lộ trình học tập môn ${subjectName} trong ${numWeeks} tuần`,
    work_start_date: now,
    work_end_date: workEndDate,
    work_color: '#10B981',
    stages,
    is_ai_generated: false,
    ai_note: 'Được tạo bởi Bộ tạo lộ trình học tập thông minh',
  };
}

/**
 * Gọi Google Gemini API để tạo lộ trình học tập tối ưu, tự động phân tích thành các chặng và mục tiêu.
 * @param {object} params - Tham số gồm subjectName, weeks, goalDescription, level
 * @returns {Promise<object>} - Lộ trình học tập chuẩn gồm thông tin Work, danh sách Stages và Goals
 */
export async function generateRoadmapWithAI({ subjectName, weeks = 6, goalDescription = '', level = 'Trung bình' }) {
  if (!subjectName || typeof subjectName !== 'string' || subjectName.trim() === '') {
    const error = new Error('Vui lòng cung cấp tên môn học hoặc chủ đề cần học.');
    error.statusCode = 400;
    throw error;
  }

  const cleanSubject = subjectName.trim();
  const numWeeks = Math.max(2, Math.min(24, Number(weeks) || 6));
  const apiKey = process.env.GEMINI_API_KEY;

  // Nếu chưa có API Key, dùng bộ tạo lộ trình dự phòng thông minh ngay lập tức
  if (!apiKey) {
    return generateFallbackRoadmap(cleanSubject, numWeeks, goalDescription);
  }

  const prompt = `
Bạn là chuyên gia tư vấn giáo dục và thiết kế lộ trình học tập cá nhân hóa.
Hãy thiết kế một lộ trình học tập chi tiết cho môn học/kỹ năng: "${cleanSubject}".
Thời lượng: ${numWeeks} tuần.
Trình độ người học: ${level}.
Mục tiêu cụ thể của người học: "${goalDescription || 'Nắm vững kiến thức, qua môn điểm cao hoặc hoàn thành đồ án'}".

YÊU CẦU:
1. Chia môn học thành từ 2 đến 4 chặng (stages) có tính lớp lang, nối tiếp hợp lý từ dễ đến khó.
2. Mỗi chặng có:
   - "stage_name": Tên chặng ngắn gọn, ấn tượng (ví dụ: "Chặng 1: Nền tảng...", "Chặng 2: Nâng cao...").
   - "stage_order": Thứ tự số nguyên (1, 2, 3...).
   - "duration_days": Số ngày ước lượng cho chặng này (tổng số ngày các chặng xấp xỉ ${numWeeks * 7} ngày).
   - "stage_description": Tóm tắt mục tiêu cần đạt của chặng này trong 1-2 câu.
   - "stage_color": Mã màu HEX đại diện cho chặng (ví dụ: "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981").
   - "goals": Danh sách từ 2 đến 4 mục tiêu cụ thể, hành động được (actionable goals) trong chặng này. Mỗi goal gồm:
       + "goal_name": Tên mục tiêu ngắn gọn (bắt đầu bằng động từ hành động).
       + "goal_description": Hướng dẫn vắn tắt cách học hoặc tài liệu gợi ý.
       + "goal_range": Điểm số đánh giá độ quan trọng từ 1 đến 10.
       + "offset_days": Số ngày kể từ ngày bắt đầu chặng để hoàn thành mục tiêu này (phải <= duration_days).
3. "work_description": Mô tả tổng quan kế hoạch học tập này trong 2 câu.

Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ cấu trúc sau (không kèm markdown \`\`\`json):
{
  "work_name": "${cleanSubject}",
  "work_description": "...",
  "work_color": "#10B981",
  "stages": [
    {
      "stage_name": "...",
      "stage_order": 1,
      "duration_days": 14,
      "stage_description": "...",
      "stage_color": "#3B82F6",
      "goals": [
        {
          "goal_name": "...",
          "goal_description": "...",
          "goal_range": 6,
          "offset_days": 7
        }
      ]
    }
  ]
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API phản hồi lỗi, chuyển sang bộ sinh dự phòng:', response.status);
      return generateFallbackRoadmap(cleanSubject, numWeeks, goalDescription);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return generateFallbackRoadmap(cleanSubject, numWeeks, goalDescription);
    }

    const parsed = JSON.parse(rawText.trim());

    // Chuẩn hóa ngày tháng thực tế từ hôm nay
    const now = new Date();
    let currentStart = new Date(now.getTime());

    const formattedStages = (parsed.stages || []).map((stg, sIndex) => {
      const durDays = Number(stg.duration_days) || 14;
      const stageStart = new Date(currentStart.getTime());
      const stageEnd = new Date(stageStart.getTime() + (durDays - 1) * 86400000);

      const formattedGoals = (stg.goals || []).map((g) => {
        const offDays = Math.min(durDays, Math.max(1, Number(g.offset_days) || Math.round(durDays / 2)));
        const gDeadline = new Date(stageStart.getTime() + (offDays - 1) * 86400000);
        return {
          goal_name: g.goal_name || `Mục tiêu ${sIndex + 1}`,
          goal_description: g.goal_description || '',
          goal_end_date: gDeadline,
          goal_color: '#EF4444',
          goal_range: Number(g.goal_range) || 5,
        };
      });

      currentStart = new Date(stageEnd.getTime() + 86400000);

      return {
        stage_name: stg.stage_name || `Chặng ${sIndex + 1}`,
        stage_order: Number(stg.stage_order) || sIndex + 1,
        stage_start_date: stageStart,
        stage_end_date: stageEnd,
        stage_description: stg.stage_description || '',
        stage_color: stg.stage_color || '#3B82F6',
        goals: formattedGoals,
      };
    });

    const finalEndDate = new Date(now.getTime() + numWeeks * 7 * 86400000);

    return {
      work_name: parsed.work_name || cleanSubject,
      work_description: parsed.work_description || `Lộ trình học tập môn ${cleanSubject}`,
      work_start_date: now,
      work_end_date: finalEndDate,
      work_color: parsed.work_color || '#10B981',
      stages: formattedStages,
      is_ai_generated: true,
      ai_note: 'Được tạo bởi Google Gemini 2.5 Flash',
    };
  } catch (err) {
    console.error('Lỗi khi gọi Gemini AI API, tự động kích hoạt bộ tạo dự phòng:', err.message);
    return generateFallbackRoadmap(cleanSubject, numWeeks, goalDescription);
  }
}
