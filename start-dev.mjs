import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting SatQuery AI (India-Wide Multimodal Satellite Intelligence Assistant)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const pythonCmd = isWindows ? 'C:\\Python314\\python.exe' : 'python3';

// 1. Python FastAPI Remote Sensing AI Service (Port 8000)
console.log('🛰️  Starting Python FastAPI AI Microservice on http://127.0.0.1:8000...');
const aiService = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--app-dir', 'backend/ai_service', '--host', '127.0.0.1', '--port', '8000'], {
  cwd: path.resolve('.'),
  stdio: 'inherit',
  shell: true
});

// 2. Node.js Express API Gateway (Port 5000)
console.log('📡 Starting Node.js API Gateway on http://localhost:5000...');
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('./backend'),
  stdio: 'inherit',
  shell: true
});

// 3. Vite React Frontend (Port 5173)
console.log('💻 Starting Vite Frontend on http://localhost:5173...');
const frontend = spawn(npmCmd, ['run', 'dev', '--', '--host'], {
  cwd: path.resolve('./frontend'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Shutting down SatQuery AI services...');
  try { aiService.kill(); } catch (e) {}
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
