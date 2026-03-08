#!/usr/bin/env node
/**
 * Kill process running on port 41522
 * Runs automatically before starting the backend
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const PORT = 41522;

async function killPort() {
  try {
    console.log(`🔍 Checking for processes on port ${PORT}...`);

    // Find process on Windows
    const { stdout } = await execAsync(`netstat -ano | findstr :${PORT}`);

    if (!stdout) {
      console.log(`✅ Port ${PORT} is free`);
      return;
    }

    // Extract PID from netstat output
    const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));

    if (lines.length === 0) {
      console.log(`✅ Port ${PORT} is free`);
      return;
    }

    const pidMatch = lines[0].trim().split(/\s+/).pop();
    const pid = pidMatch ? parseInt(pidMatch) : null;

    if (!pid) {
      console.log(`⚠️  Could not find PID for port ${PORT}`);
      return;
    }

    console.log(`⚡ Found process ${pid} on port ${PORT}`);
    console.log(`🔪 Killing process ${pid}...`);

    // Kill the process
    await execAsync(`taskkill /F /PID ${pid}`);

    console.log(`✅ Successfully killed process on port ${PORT}`);
    console.log('');
  } catch (error) {
    // If error is "process not found", port is already free
    if (error.code === 1) {
      console.log(`✅ Port ${PORT} is free`);
      return;
    }

    console.error(`❌ Error killing port ${PORT}:`, error.message);
    // Don't exit - let the server start anyway
  }
}

killPort();
