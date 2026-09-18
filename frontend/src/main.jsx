/**
 * TÊN FILE: main.jsx
 * CÔNG DỤNG: Điểm khởi động ứng dụng React, nạp style toàn cục và kết nối với DOM element root.
 * PHẠM VI DÙNG: Toàn hệ thống Frontend.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles/global.scss';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
