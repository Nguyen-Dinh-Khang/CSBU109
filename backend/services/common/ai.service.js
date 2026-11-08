/**
 * TÊN FILE: ai.service.js
 * CÔNG DỤNG: Dịch vụ trí tuệ nhân tạo (AI Engine) tích hợp Google Gemini API để tự động sinh lộ trình học tập, mở rộng thời lượng đến 52 tuần, và tinh chỉnh lộ trình theo nhận xét của người dùng.
 * PHẠM VI DÙNG: Toàn hệ thống (Common).
 */

/**
 * Sinh lộ trình mẫu dự phòng khi chưa cấu hình GEMINI_API_KEY hoặc khi API gặp sự cố mạng.
 * @param {string} subjectName - Tên môn học hoặc đề tài
 * @param {number} weeks - Số tuần học (2 - 52 tuần)
 * @param {string} [goalDescription=''] - Kỳ vọng đầu ra của người học
 * @returns {object} - Lộ trình hoàn chỉnh gồm stages và goals
 */
function generateFallbackRoadmap(subjectName, weeks = 6, goalDescription = '') {
  const numWeeks = Math.max(2, Math.min(52, Number(weeks) || 6));
  const stagesCount = numWeeks <= 4 ? 2 : numWeeks <= 8 ? 3 : numWeeks <= 16 ? 4 : numWeeks <= 32 ? 5 : 6;
  const weeksPerStage = Math.max(1, Math.round(numWeeks / stagesCount));

  const stageTemplates = [
    {
      titleSuffix: 'Nền tảng & Kiến thức cốt lõi',
      desc: 'Làm quen với các khái niệm căn bản, cú pháp, cài đặt môi trường và các nguyên lý sơ khởi.',
      color: '#3B82F6',
      goals: [
        'Cài đặt công cụ, môi trường thực hành và tài liệu học tập',
        'Nghiên cứu các khái niệm cơ bản và làm bài tập nhập môn',
        'Tổng hợp ghi chú tóm tắt kiến thức giai đoạn đầu',
      ],
    },
    {
      titleSuffix: 'Thực hành chuyên sâu & Kỹ thuật trọng tâm',
      desc: 'Đi sâu vào các chủ đề nâng cao, giải quyết các bài toán mẫu và các mô hình áp dụng thực tế.',
      color: '#8B5CF6',
      goals: [
        'Hoàn thành bài tập lớn phần kiến thức trọng tâm',
        'Luyện tập các case study thực tế và xử lý lỗi thường gặp',
        'Tham khảo tài liệu chuẩn và tối ưu hóa phương pháp',
      ],
    },
    {
      titleSuffix: 'Đồ án thực chiến & Ứng dụng tích hợp',
      desc: 'Kết hợp toàn bộ kiến thức đã học vào một dự án cụ thể hoặc bộ đề thi thử toàn diện.',
      color: '#F59E0B',
      goals: [
        'Xây dựng kiến trúc đồ án và hoàn thành 50% tính năng cốt lõi',
        'Hoàn thiện đồ án, tự kiểm thử và sửa lỗi logic',
      ],
    },
    {
      titleSuffix: 'Mở rộng nâng cao & Tối ưu hóa hiệu năng',
      desc: 'Nâng cấp tính năng nâng cao, tinh gọn kiến trúc và tối ưu hóa kết quả học tập.',
      color: '#EC4899',
      goals: [
        'Nghiên cứu các kỹ thuật nâng cao và triển khai tính năng mở rộng',
        'Thực hiện kiểm thử áp lực và tối ưu hóa toàn bộ hệ thống',
      ],
    },
    {
      titleSuffix: 'Luyện đề tổng hợp & Tự đánh giá năng lực',
      desc: 'Làm các bộ đề thi thử toàn diện, đánh giá lỗ hổng kiến thức và củng cố kỹ năng.',
      color: '#6366F1',
      goals: [
        'Luyện đề tổng hợp đạt điểm mục tiêu kỳ vọng',
        'Rà soát các lỗi sai thường gặp và hoàn thiện lỗ hổng',
      ],
    },
    {
      titleSuffix: 'Tổng kết, Báo cáo & Hoàn tất mục tiêu',
      desc: 'Ôn tập toàn diện, chuẩn bị báo cáo bảo vệ hoặc tự tin bước vào kỳ thi chính thức.',
      color: '#10B981',
      goals: [
        'Đóng gói tài liệu, slide thuyết trình hoặc báo cáo cuối khóa',
        'Tổng kết các bài học kinh nghiệm và định hướng phát triển tiếp theo',
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
        goal_description: `Mục tiêu chặng ${i + 1} của môn ${subjectName}`,
        goal_end_date: goalDeadline,
        goal_color: idx % 2 === 0 ? '#EF4444' : '#F59E0B',
        goal_range: Math.min(5, Math.max(1, 2 + ((idx + i) % 4))),
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
    ai_note: 'Được tạo bởi Bộ tạo lộ trình học tập thông minh (Dự phòng)',
  };
}

/**
 * Chuẩn hóa các chặng và mục tiêu với mốc thời gian thực tế tính từ ngày bắt đầu.
 * @param {object} parsed - Dữ liệu JSON lộ trình trả về từ AI
 * @param {Date} [startDate] - Ngày bắt đầu (mặc định hôm nay)
 * @param {number} [totalWeeks=6] - Tổng số tuần học
 * @returns {object} - Lộ trình chuẩn hóa với ngày bắt đầu, ngày kết thúc và goals hợp lệ
 */
function normalizeRoadmapDates(parsed, startDate = new Date(), totalWeeks = 6) {
  const start = new Date(startDate.getTime());
  let currentStart = new Date(start.getTime());

  const formattedStages = (parsed.stages || []).map((stg, sIndex) => {
    const durDays = Number(stg.duration_days) || 14;
    const stageStart = new Date(currentStart.getTime());
    const stageEnd = new Date(stageStart.getTime() + (durDays - 1) * 86400000);

    const formattedGoals = (stg.goals || []).map((g, gIndex) => {
      const offDays = Math.min(durDays, Math.max(1, Number(g.offset_days) || Math.round(durDays / 2)));
      const gDeadline = new Date(stageStart.getTime() + (offDays - 1) * 86400000);
      return {
        goal_name: g.goal_name || `Mục tiêu ${gIndex + 1}`,
        goal_description: g.goal_description || '',
        goal_end_date: gDeadline,
        goal_color: g.goal_color || '#EF4444',
        goal_range: Math.min(5, Math.max(1, Number(g.goal_range) || 3)),
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

  const finalEndDate = new Date(start.getTime() + totalWeeks * 7 * 86400000);

  return {
    work_name: parsed.work_name || 'Lộ trình học tập',
    work_description: parsed.work_description || '',
    work_start_date: start,
    work_end_date: finalEndDate,
    work_color: parsed.work_color || '#10B981',
    stages: formattedStages,
    is_ai_generated: true,
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
  const numWeeks = Math.max(2, Math.min(52, Number(weeks) || 6));
  const apiKey = process.env.GEMINI_API_KEY;

  // Nếu chưa có API Key, dùng bộ tạo lộ trình dự phòng ngay lập tức
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
1. Chia môn học thành từ 2 đến 6 chặng (stages) có tính lớp lang, nối tiếp hợp lý từ dễ đến khó tùy theo độ dài thời gian (${numWeeks} tuần).
2. Mỗi chặng có:
   - "stage_name": Tên chặng ngắn gọn, ấn tượng (ví dụ: "Chặng 1: Nền tảng...", "Chặng 2: Nâng cao...").
   - "stage_order": Thứ tự số nguyên (1, 2, 3...).
   - "duration_days": Số ngày ước lượng cho chặng này (tổng số ngày các chặng xấp xỉ ${numWeeks * 7} ngày).
   - "stage_description": Tóm tắt mục tiêu cần đạt của chặng này trong 1-2 câu.
   - "stage_color": Mã màu HEX đại diện cho chặng (ví dụ: "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#6366F1").
   - "goals": Danh sách từ 2 đến 5 mục tiêu cụ thể, hành động được (actionable goals) trong chặng này. Mỗi goal gồm:
       + "goal_name": Tên mục tiêu ngắn gọn (bắt đầu bằng động từ hành động).
       + "goal_description": Hướng dẫn vắn tắt cách học hoặc tài liệu gợi ý.
       + "goal_range": Thang điểm từ 1 đến 5 đại diện cho QUY MÔ THỜI GIAN và ĐỘ KHÓ (1: việc nhỏ/ngắn hạn làm trong vài giờ hoặc 1 ngày, 3: vừa phải 3-5 ngày, 5: việc lớn/phức tạp cần nhiều ngày hoặc nỗ lực cao).
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
          "goal_range": 3,
          "offset_days": 7
        }
      ]
    }
  ]
}
`;

  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
        const errorText = await response.text();
        console.warn(`Model ${model} phản hồi mã lỗi ${response.status}:`, errorText);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        continue;
      }

      const parsed = JSON.parse(rawText.trim());
      const normalized = normalizeRoadmapDates(parsed, new Date(), numWeeks);
      normalized.ai_note = `Được tạo bởi Google ${model}`;
      return normalized;
    } catch (err) {
      console.warn(`Lỗi khi gọi model ${model}:`, err.message);
    }
  }

  console.warn('Tất cả models Gemini đều bận hoặc không phản hồi, kích hoạt bộ sinh dự phòng.');
  return generateFallbackRoadmap(cleanSubject, numWeeks, goalDescription);
}

/**
 * Tinh chỉnh lộ trình học tập đã sinh dựa trên nhận xét / góp ý phản hồi của người dùng.
 * @param {object} params - Gồm currentRoadmap và feedbackComment
 * @returns {Promise<object>} - Lộ trình mới sau khi được AI tinh chỉnh
 */
export async function refineRoadmapWithAI({ currentRoadmap, feedbackComment }) {
  if (!currentRoadmap || typeof currentRoadmap !== 'object' || !Array.isArray(currentRoadmap.stages)) {
    const error = new Error('Dữ liệu lộ trình hiện tại không hợp lệ để tinh chỉnh.');
    error.statusCode = 400;
    throw error;
  }

  if (!feedbackComment || typeof feedbackComment !== 'string' || feedbackComment.trim() === '') {
    const error = new Error('Vui lòng nhập nhận xét hoặc yêu cầu tinh chỉnh của bạn.');
    error.statusCode = 400;
    throw error;
  }

  const cleanFeedback = feedbackComment.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  // Nếu chưa có API key, áp dụng tinh chỉnh dự phòng (Fallback Refine)
  if (!apiKey) {
    const cloned = JSON.parse(JSON.stringify(currentRoadmap));
    cloned.ai_note = `Đã tinh chỉnh theo góp ý: "${cleanFeedback}" (Chế độ dự phòng)`;
    if (cloned.stages && cloned.stages.length > 0) {
      cloned.stages[cloned.stages.length - 1].goals.push({
        goal_name: `Bổ sung theo góp ý: ${cleanFeedback.slice(0, 40)}...`,
        goal_description: `Yêu cầu tinh chỉnh: ${cleanFeedback}`,
        goal_end_date: cloned.work_end_date || new Date(),
        goal_color: '#EC4899',
        goal_range: 3,
      });
    }
    return cloned;
  }

  const prompt = `
Bạn là chuyên gia thiết kế lộ trình học tập cá nhân hóa.
Dưới đây là cấu trúc lộ trình học tập hiện tại:
${JSON.stringify(currentRoadmap, null, 2)}

Người học vừa gửi phản hồi / yêu cầu tinh chỉnh như sau:
"${cleanFeedback}"

YÊU CẦU:
1. Hãy phân tích kỹ nhận xét của người học và điều chỉnh lộ trình học tập hiện tại cho phù hợp nhất (ví dụ: bổ sung chặng mới, dãn cách thời gian, thêm bài tập thực hành, giảm tải lý thuyết hoặc điều chỉnh tên chặng/mục tiêu theo đúng yêu cầu).
2. Quy định về "goal_range": Thang điểm từ 1 đến 5 đại diện cho QUY MÔ THỜI GIAN và ĐỘ KHÓ (1: việc nhỏ vài giờ/1 ngày, 5: việc lớn/nhiều ngày/nỗ lực cao).
3. Đảm bảo trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ cấu trúc sau (không kèm markdown \`\`\`json):
{
  "work_name": "${currentRoadmap.work_name || 'Lộ trình học tập'}",
  "work_description": "...",
  "work_color": "${currentRoadmap.work_color || '#10B981'}",
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
          "goal_range": 3,
          "offset_days": 7
        }
      ]
    }
  ]
}
`;

  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  const startDate = currentRoadmap.work_start_date ? new Date(currentRoadmap.work_start_date) : new Date();
  const totalDays = currentRoadmap.stages.reduce((sum, s) => sum + (Number(s.duration_days) || 14), 0);
  const approxWeeks = Math.max(2, Math.round(totalDays / 7)) || 6;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
        const errorText = await response.text();
        console.warn(`Model ${model} phản hồi mã lỗi ${response.status}:`, errorText);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        continue;
      }

      const parsed = JSON.parse(rawText.trim());
      const normalized = normalizeRoadmapDates(parsed, startDate, approxWeeks);
      normalized.ai_note = `Đã tinh chỉnh theo yêu cầu: "${cleanFeedback}" (Google ${model})`;
      return normalized;
    } catch (err) {
      console.warn(`Lỗi khi tinh chỉnh qua model ${model}:`, err.message);
    }
  }

  // Nếu tất cả candidate models đều lỗi, trả về bản sao có ghi chú
  const fallback = JSON.parse(JSON.stringify(currentRoadmap));
  fallback.ai_note = `Đã ghi nhận góp ý: "${cleanFeedback}" (AI đang bận, giữ nguyên lộ trình)`;
  return fallback;
}
