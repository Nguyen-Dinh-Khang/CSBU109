/**
 * TÊN FILE: SnakeGame.jsx
 * CÔNG DỤNG: Giao diện và logic trò chơi Rắn săn mồi cổ điển với đồ họa canvas neon retro.
 * PHẠM VI DÙNG: Phân hệ Components (Cấp 1 - Components).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SnakeGame.module.scss';

const GRID_SIZE = 20; // 20x20 ô
const CANVAS_SIZE = 400; // 400x400 px
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE; // 20px mỗi ô
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Hướng lên trên

/**
 * Component trò chơi Rắn săn mồi Canvas.
 * @param {object} props - Thuộc tính gồm hàm onOpenDashboard để quay lại Dashboard
 */
export function SnakeGame({ onOpenDashboard }) {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 10, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake_high_score') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Ref lưu trữ trạng thái đồng bộ cho animation loop
  const stateRef = useRef({
    snake: INITIAL_SNAKE,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: { x: 10, y: 5 },
    score: 0,
    isGameOver: false,
    isPaused: false,
    hasStarted: false,
  });

  useEffect(() => {
    stateRef.current = {
      snake,
      direction,
      nextDirection: stateRef.current.nextDirection,
      food,
      score,
      isGameOver,
      isPaused,
      hasStarted,
    };
  }, [snake, direction, food, score, isGameOver, isPaused, hasStarted]);

  /**
   * Sinh tọa độ mồi ngẫu nhiên không trùng với thân rắn.
   * @param {Array} currentSnake - Danh sách tọa độ thân rắn
   * @returns {object} - Tọa độ { x, y } của mồi mới
   */
  const spawnFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const collision = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!collision) break;
    }
    return newFood;
  }, []);

  /**
   * Khởi động lại toàn bộ thông số trò chơi về ban đầu.
   */
  const resetGame = useCallback(() => {
    const freshFood = spawnFood(INITIAL_SNAKE);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(freshFood);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);

    stateRef.current = {
      snake: INITIAL_SNAKE,
      direction: INITIAL_DIRECTION,
      nextDirection: INITIAL_DIRECTION,
      food: freshFood,
      score: 0,
      isGameOver: false,
      isPaused: false,
      hasStarted: true,
    };
  }, [spawnFood]);

  /**
   * Thay đổi hướng di chuyển của rắn một cách an toàn.
   * @param {object} newDir - Vector hướng mới { x, y }
   */
  const changeDirection = useCallback((newDir) => {
    const cur = stateRef.current.direction;
    if (cur.x + newDir.x === 0 && cur.y + newDir.y === 0) return;
    stateRef.current.nextDirection = newDir;
    if (!stateRef.current.hasStarted) {
      stateRef.current.hasStarted = true;
      setHasStarted(true);
    }
  }, []);

  // Lắng nghe sự kiện bàn phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      if (stateRef.current.isGameOver) {
        if (key === 'enter' || key === ' ') {
          resetGame();
        }
        return;
      }

      switch (key) {
        case 'arrowup':
        case 'w':
          changeDirection({ x: 0, y: -1 });
          break;
        case 'arrowdown':
        case 's':
          changeDirection({ x: 0, y: 1 });
          break;
        case 'arrowleft':
        case 'a':
          changeDirection({ x: -1, y: 0 });
          break;
        case 'arrowright':
        case 'd':
          changeDirection({ x: 1, y: 0 });
          break;
        case ' ':
        case 'p':
          if (stateRef.current.hasStarted) {
            setIsPaused((prev) => !prev);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, resetGame]);

  // Vòng lặp chính của trò chơi
  useEffect(() => {
    if (!hasStarted || isGameOver || isPaused) return;

    const speed = Math.max(70, 130 - Math.floor(score / 3) * 5);

    const interval = setInterval(() => {
      const current = stateRef.current;
      const head = current.snake[0];
      const dir = current.nextDirection;

      current.direction = dir;
      setDirection(dir);

      const newHead = {
        x: head.x + dir.x,
        y: head.y + dir.y,
      };

      // 1. Kiểm tra va chạm biên
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return;
      }

      // 2. Kiểm tra va chạm thân rắn
      if (current.snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
        setIsGameOver(true);
        return;
      }

      const newSnake = [newHead, ...current.snake];

      // 3. Xử lý ăn mồi
      if (newHead.x === current.food.x && newHead.y === current.food.y) {
        const newScore = current.score + 10;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snake_high_score', newScore.toString());
        }
        const nextFood = spawnFood(newSnake);
        setFood(nextFood);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, isGameOver, isPaused, score, highScore, spawnFood]);

  // Vẽ Canvas đồ họa Neon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Nền sân chơi
    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Lưới mờ
    ctx.strokeStyle = '#1b1e2a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Vẽ mồi phát sáng
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    const foodRadius = CELL_SIZE / 2 - 2;
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      foodRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Vẽ thân rắn
    snake.forEach((segment, index) => {
      ctx.save();
      if (index === 0) {
        ctx.fillStyle = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22c55e';
        ctx.beginPath();
        ctx.roundRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          6
        );
        ctx.fill();

        // Mắt rắn
        ctx.fillStyle = '#0f172a';
        const eyeSize = 3;
        const eyeOffset = 5;
        const cx = segment.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = segment.y * CELL_SIZE + CELL_SIZE / 2;

        if (direction.x === 1) {
          ctx.fillRect(cx + 2, cy - eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(cx + 2, cy + eyeOffset - 3, eyeSize, eyeSize);
        } else if (direction.x === -1) {
          ctx.fillRect(cx - 5, cy - eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(cx - 5, cy + eyeOffset - 3, eyeSize, eyeSize);
        } else if (direction.y === -1) {
          ctx.fillRect(cx - eyeOffset, cy - 5, eyeSize, eyeSize);
          ctx.fillRect(cx + eyeOffset - 3, cy - 5, eyeSize, eyeSize);
        } else {
          ctx.fillRect(cx - eyeOffset, cy + 2, eyeSize, eyeSize);
          ctx.fillRect(cx + eyeOffset - 3, cy + 2, eyeSize, eyeSize);
        }
      } else {
        const greenShade = Math.max(120, 200 - index * 4);
        ctx.fillStyle = `rgb(34, ${greenShade}, 94)`;
        ctx.beginPath();
        ctx.roundRect(
          segment.x * CELL_SIZE + 2,
          segment.y * CELL_SIZE + 2,
          CELL_SIZE - 4,
          CELL_SIZE - 4,
          4
        );
        ctx.fill();
      }
      ctx.restore();
    });
  }, [snake, food, direction]);

  return (
    <div className={styles.snakePage}>
      {/* Nút góc quay lại Dashboard */}
      <div className={styles.cornerNavContainer}>
        <button
          type="button"
          className={styles.cornerNavBtn}
          onClick={onOpenDashboard}
          title="Quay lại Bảng điều khiển Lịch trình & Đầu việc"
        >
          <span className={styles.navIcon}>📋</span>
          <span>Bảng Điều Khiển</span>
          <span className={styles.arrowIcon}>➔</span>
        </button>
      </div>

      <div className={styles.gameWrapper}>
        <header className={styles.gameHeader}>
          <div className={styles.gameBadge}>🎮 Mini Game</div>
          <h1 className={styles.gameTitle}>RẮN SĂN MỒI</h1>
          <p className={styles.gameDesc}>Dùng phím mũi tên hoặc W, A, S, D để điều khiển</p>
        </header>

        {/* Bảng điểm */}
        <div className={styles.scoreboard}>
          <div className={styles.scoreBox}>
            <span className={styles.scoreLabel}>Điểm số</span>
            <span className={`${styles.scoreValue} ${styles.current}`}>{score}</span>
          </div>
          <div className={styles.scoreBox}>
            <span className={styles.scoreLabel}>Kỷ lục</span>
            <span className={`${styles.scoreValue} ${styles.best}`}>🏆 {highScore}</span>
          </div>
        </div>

        {/* Màn hình Canvas */}
        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className={styles.snakeCanvas}
          />

          {/* Màn hình chờ bắt đầu */}
          {!hasStarted && (
            <div className={styles.canvasOverlay}>
              <h2>Sẵn sàng chưa?</h2>
              <p>Nhấn nút bắt đầu hoặc dùng phím bất kỳ để chơi</p>
              <button
                type="button"
                className={`${styles.gameBtn} ${styles.btnStart}`}
                onClick={resetGame}
              >
                ▶ Bắt Đầu Chơi
              </button>
            </div>
          )}

          {/* Màn hình Game Over */}
          {isGameOver && (
            <div className={`${styles.canvasOverlay} ${styles.gameover}`}>
              <h2 className={styles.gameoverText}>THUA RỒI!</h2>
              <p>Điểm đạt được: <strong>{score}</strong></p>
              <button
                type="button"
                className={`${styles.gameBtn} ${styles.btnRestart}`}
                onClick={resetGame}
              >
                🔄 Chơi Lại
              </button>
            </div>
          )}

          {/* Màn hình Tạm dừng */}
          {isPaused && !isGameOver && (
            <div className={`${styles.canvasOverlay} ${styles.paused}`}>
              <h2>TẠM DỪNG</h2>
              <p>Nhấn Phím Cách (Space) hoặc Tiếp tục</p>
              <button
                type="button"
                className={`${styles.gameBtn} ${styles.btnResume}`}
                onClick={() => setIsPaused(false)}
              >
                ▶ Tiếp Tục
              </button>
            </div>
          )}
        </div>

        {/* Nút điều khiển game */}
        <div className={styles.gameActions}>
          {hasStarted && !isGameOver && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setIsPaused((prev) => !prev)}
            >
              {isPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng (Space)'}
            </button>
          )}
          <button type="button" className={styles.actionBtn} onClick={resetGame}>
            🔄 Làm mới trò chơi
          </button>
        </div>

        {/* Bàn phím ảo cho màn hình cảm ứng / chuột */}
        <div className={styles.virtualDpad}>
          <div className={styles.dpadRow}>
            <button
              type="button"
              className={styles.dpadBtn}
              onClick={() => changeDirection({ x: 0, y: -1 })}
              aria-label="Lên"
            >
              ▲
            </button>
          </div>
          <div className={styles.dpadRow}>
            <button
              type="button"
              className={styles.dpadBtn}
              onClick={() => changeDirection({ x: -1, y: 0 })}
              aria-label="Trái"
            >
              ◀
            </button>
            <button
              type="button"
              className={styles.dpadBtn}
              onClick={() => changeDirection({ x: 0, y: 1 })}
              aria-label="Xuống"
            >
              ▼
            </button>
            <button
              type="button"
              className={styles.dpadBtn}
              onClick={() => changeDirection({ x: 1, y: 0 })}
              aria-label="Phải"
            >
              ▶
            </button>
          </div>
        </div>

        <footer className={styles.gameFooter}>
          <p>
            💡 Mẹo: Nhấn nút <strong>Bảng Điều Khiển</strong> ở góc trên bên phải để quay lại giao diện theo dõi lịch trình!
          </p>
        </footer>
      </div>
    </div>
  );
}

export default SnakeGame;
