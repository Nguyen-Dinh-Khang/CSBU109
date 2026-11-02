/**
 * TÊN FILE: useDebounce.js
 * CÔNG DỤNG: Trì hoãn việc cập nhật giá trị (debounce) sau một khoảng thời gian chờ chỉ định (mặc định 300ms).
 * PHẠM VI DÙNG: Toàn hệ thống Frontend (Shared Hooks).
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook nhận vào một giá trị và chỉ cập nhật giá trị debounced sau khoảng delay ms.
 * @param {any} value - Giá trị cần debounce (ví dụ chuỗi tìm kiếm)
 * @param {number} [delay=300] - Thời gian chờ tính bằng mili-giây
 * @returns {any} - Giá trị sau khi đã debounce
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
