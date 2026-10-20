/**
 * TÊN FILE: run.js
 * CÔNG DỤNG: Khởi chạy đồng thời cả Backend (Node.js) và Frontend (React Vite) từ thư mục gốc chỉ bằng một lệnh duy nhất.
 * PHẠM VI DÙNG: Công cụ hỗ trợ phát triển toàn dự án (Root).
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Khởi chạy một tiến trình con (npm script) cho một thư mục chỉ định và gắn nhãn màu cho log đầu ra.
 */
function startService(serviceName, folderName, scriptName, colorCode) {
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const targetDir = path.join(__dirname, folderName);

  const childProcess = spawn(npmCmd, ['run', scriptName], {
    cwd: targetDir,
    shell: true,
    stdio: 'pipe',
  });

  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim() !== '') {
        console.log(`${colorCode}[${serviceName}]\x1b[0m ${line}`);
      }
    });
  });

  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim() !== '') {
        console.error(`${colorCode}[${serviceName} ERROR]\x1b[0m ${line}`);
      }
    });
  });

  childProcess.on('close', (code) => {
    console.log(`${colorCode}[${serviceName}]\x1b[0m đã dừng với mã thoát: ${code}`);
  });

  return childProcess;
}

/**
 * Hàm chính điều phối việc chạy đồng thời Backend và Frontend, đồng thời xử lý tín hiệu tắt (Ctrl + C).
 */
function runAll() {
  console.log('\x1b[32m==================================================\x1b[0m');
  console.log('\x1b[32m🚀 Đang khởi động đồng thời Backend và Frontend...\x1b[0m');
  console.log('\x1b[32m==================================================\x1b[0m');

  const backendProcess = startService('BACKEND', 'backend', 'dev', '\x1b[36m');
  const frontendProcess = startService('FRONTEND', 'frontend', 'dev', '\x1b[35m');

  process.on('SIGINT', () => {
    console.log('\n\x1b[33mĐang dừng cả Backend và Frontend...\x1b[0m');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
}

runAll();
