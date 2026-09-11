import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../api';
import '../App.css';

export default function Dashboard({ onBackToGame }) {
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // 1. Kiểm tra trạng thái máy chủ & MongoDB khi bấm làm mới
  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/status');
      setServerStatus(res.data);
    } catch (err) {
      console.error('Lỗi khi gọi /api/status:', err);
      setError(
        `Không thể kết nối đến Backend (${API_BASE_URL || 'http://localhost:5000'}). Vui lòng kiểm tra server Render hoặc backend local.`
      );
      setServerStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // 2. Tải danh sách items từ API
  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const res = await api.get('/api/items');
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Lỗi khi lấy items:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api
      .get('/api/status')
      .then((res) => {
        if (!ignore) {
          setServerStatus(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Lỗi khi gọi /api/status:', err);
          setError(
            `Không thể kết nối đến Backend (${API_BASE_URL || 'http://localhost:5000'}). Vui lòng kiểm tra server Render hoặc backend local.`
          );
          setServerStatus(null);
          setLoading(false);
        }
      });

    api
      .get('/api/items')
      .then((res) => {
        if (!ignore) {
          setItems(res.data.items || []);
          setItemsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Lỗi khi lấy items:', err);
          setItemsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // 3. Thêm item mới
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setActionMessage('');
    try {
      await api.post('/api/items', { title, description });
      setActionMessage('✓ Đã thêm dữ liệu thành công!');
      setTitle('');
      setDescription('');
      fetchItems();
    } catch (err) {
      setActionMessage(
        '✗ ' + (err.response?.data?.message || 'Không thể tạo item. Vui lòng kiểm tra kết nối MongoDB.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Xóa item
  const handleDeleteItem = async (id) => {
    if (!serverStatus?.database?.isConnected) {
      setActionMessage('⚠ Dữ liệu mẫu không thể xóa trong chế độ mô phỏng.');
      return;
    }
    try {
      await api.delete(`/api/items/${id}`);
      fetchItems();
      setActionMessage('✓ Đã xóa item.');
    } catch {
      setActionMessage('✗ Lỗi khi xóa item.');
    }
  };

  const isDbConnected = serverStatus?.database?.isConnected;
  const hasConfiguredUri = serverStatus?.database?.hasConfiguredUri;

  return (
    <div className="container">
      {/* Nút quay lại Trò chơi Rắn săn mồi */}
      <div className="top-nav-bar">
        <button className="back-btn" onClick={onBackToGame}>
          ← 🎮 Quay Lại Trò Chơi Rắn Săn Mồi
        </button>
      </div>

      {/* Header */}
      <header className="header">
        <div className="badge">Full-Stack Template</div>
        <h1>Node.js + Express + MongoDB & React</h1>
        <p className="subtitle">
          Hệ thống cơ bản đã được thiết lập sẵn sàng cho dự án của bạn
        </p>
      </header>

      {/* Grid Trạng Thái Hệ Thống */}
      <div className="status-grid">
        {/* Backend Card */}
        <div className={`card status-card ${error ? 'border-error' : 'border-success'}`}>
          <div className="card-title">
            <span className={`status-dot ${error ? 'dot-red' : loading ? 'dot-yellow' : 'dot-green'}`}></span>
            Backend Node.js / Express
          </div>
          {loading ? (
            <p className="card-desc">Đang kiểm tra kết nối...</p>
          ) : error ? (
            <div>
              <p className="status-badge badge-red">Chưa kết nối (Offline)</p>
              <p className="card-note">{error}</p>
            </div>
          ) : (
            <div>
              <p className="status-badge badge-green">Đang hoạt động (Online)</p>
              <p className="card-note">{serverStatus?.message}</p>
              <p className="card-note" style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                🔗 API: <code>{API_BASE_URL || 'http://localhost:5000'}</code>
              </p>
            </div>
          )}
          <button className="btn btn-secondary" onClick={checkStatus} disabled={loading}>
            {loading ? 'Đang làm mới...' : '🔄 Kiểm tra lại'}
          </button>
        </div>

        {/* MongoDB Card */}
        <div
          className={`card status-card ${
            isDbConnected ? 'border-success' : hasConfiguredUri ? 'border-warning' : 'border-neutral'
          }`}
        >
          <div className="card-title">
            <span
              className={`status-dot ${
                isDbConnected ? 'dot-green' : hasConfiguredUri ? 'dot-yellow' : 'dot-gray'
              }`}
            ></span>
            Cơ sở dữ liệu MongoDB
          </div>
          {loading ? (
            <p className="card-desc">Đang tải trạng thái...</p>
          ) : isDbConnected ? (
            <div>
              <p className="status-badge badge-green">✓ Đã kết nối thành công</p>
              <p className="card-note">Database sẵn sàng ghi và đọc dữ liệu thật.</p>
            </div>
          ) : (
            <div>
              <p className="status-badge badge-gray">Chưa gắn link kết nối</p>
              <p className="card-note">
                Chưa có <code>MONGODB_URI</code> trong <code>backend/.env</code>.
              </p>
            </div>
          )}
          <div className="env-guide">
            <code>backend/.env ➔ MONGODB_URI=...</code>
          </div>
        </div>
      </div>

      {/* Hướng dẫn kết nối MongoDB nếu chưa kết nối */}
      {!isDbConnected && (
        <section className="guide-box">
          <h3>📌 Cách gắn link MongoDB của bạn:</h3>
          <ol>
            <li>
              Mở file <code>backend/.env</code> trong dự án.
            </li>
            <li>
              Dán chuỗi kết nối MongoDB của bạn vào dòng <code>MONGODB_URI=...</code>
              <br />
              <em>
                (Ví dụ Atlas: <code>mongodb+srv://user:pass@cluster.mongodb.net/ten_db?retryWrites=true&w=majority</code>)
              </em>
            </li>
            <li>
              Lưu file. Backend (nodemon) sẽ tự động khởi động lại và kết nối ngay lập tức!
            </li>
          </ol>
        </section>
      )}

      {/* Khu vực Test API & Thao Tác Dữ Liệu */}
      <section className="card item-section">
        <h2>Kiểm Tra Thao Tác Dữ Liệu (Demo CRUD)</h2>
        <p className="section-desc">
          {isDbConnected
            ? 'Bạn đang ở chế độ kết nối cơ sở dữ liệu thật! Dữ liệu nhập dưới đây sẽ được lưu trực tiếp vào MongoDB.'
            : 'Hiện tại đang ở chế độ mô phỏng mẫu. Bạn có thể xem giao diện và thêm link MongoDB bất cứ lúc nào.'}
        </p>

        {/* Form thêm item */}
        <form onSubmit={handleAddItem} className="item-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Nhập tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nhập mô tả (không bắt buộc)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi Thử Nghiệm'}
            </button>
          </div>
        </form>

        {actionMessage && <div className="action-feedback">{actionMessage}</div>}

        {/* Danh sách items */}
        <div className="items-container">
          <h3>Danh sách bản ghi ({items.length})</h3>
          {itemsLoading ? (
            <p className="loading-text">Đang tải danh sách...</p>
          ) : items.length === 0 ? (
            <p className="empty-text">Chưa có bản ghi nào.</p>
          ) : (
            <div className="items-list">
              {items.map((item) => (
                <div key={item._id} className="item-row">
                  <div className="item-info">
                    <h4>{item.title}</h4>
                    <p>{item.description || 'Không có mô tả'}</p>
                    <span className="item-time">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {isDbConnected && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteItem(item._id)}
                      title="Xóa bản ghi"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bảng tóm tắt các Package đã cài đặt */}
      <section className="card packages-section">
        <h2>Các Package Đã Được Cài Đặt</h2>
        <div className="packages-grid">
          <div className="package-col">
            <h3>Backend (Node.js)</h3>
            <ul>
              <li><strong>express</strong>: Web server & API routes</li>
              <li><strong>mongoose</strong>: Kết nối & Schema MongoDB</li>
              <li><strong>dotenv</strong>: Quản lý biến môi trường (.env)</li>
              <li><strong>cors</strong>: Phân quyền chia sẻ tài nguyên cross-origin</li>
              <li><strong>nodemon</strong> <em>(dev)</em>: Tự động reload server khi sửa code</li>
            </ul>
          </div>
          <div className="package-col">
            <h3>Frontend (React + Vite)</h3>
            <ul>
              <li><strong>react</strong> / <strong>react-dom</strong>: Thư viện giao diện UI</li>
              <li><strong>axios</strong>: Gửi HTTP Request sang backend</li>
              <li><strong>vite</strong>: Công cụ build và dev server siêu tốc</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
