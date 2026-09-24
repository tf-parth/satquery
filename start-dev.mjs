import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🚀 Starting SatQuery AI (India-Wide Multimodal Satellite Intelligence Assistant)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function resolvePython() {
  if (isWindows) {
    if (fs.existsSync('C:\\Python314\\python.exe')) return 'C:\\Python314\\python.exe';
    try {
      execSync('python --version', { stdio: 'ignore' });
      return 'python';
    } catch {}
    try {
      execSync('py -3 --version', { stdio: 'ignore' });
      return 'py';
    } catch {}
  }
  return 'python3';
}

const pythonCmd = resolvePython();

// Load environment variables from .env
const envFile = path.resolve('.env');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// 1. Python FastAPI Remote Sensing AI Service (Port 8000)
console.log('🛰️  Starting Python FastAPI AI Microservice on http://127.0.0.1:8000...');
const aiService = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--app-dir', 'backend/ai_service', '--host', '127.0.0.1', '--port', '8000'], {
  cwd: path.resolve('.'),
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// 2. Node.js Express API Gateway (Port 5000)
console.log('📡 Starting Node.js API Gateway on http://localhost:5000...');
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('./backend'),
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// 3. Vite React Frontend (Port 5173)
console.log('💻 Starting Vite Frontend on http://localhost:5173...');
const frontend = spawn(npmCmd, ['run', 'dev', '--', '--host'], {
  cwd: path.resolve('./frontend'),
  stdio: 'inherit',
  shell: true,
  env: process.env
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
