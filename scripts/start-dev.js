import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const serverEntry = path.join(projectRoot, 'server.js');
const portsToClear = [3000, 24678];

function run(command) {
  try {
    return execSync(command, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function getListeningPids(port) {
  const output = run(`lsof -tiTCP:${port} -sTCP:LISTEN`);
  return output
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function getCommand(pid) {
  return run(`ps -p ${pid} -o command=`);
}

function shouldTerminate(command) {
  return command.includes(projectRoot) && (command.includes('server.js') || command.includes('/vite'));
}

async function waitForPortRelease(port, timeoutMs = 3000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (getListeningPids(port).length === 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function clearProjectPorts() {
  const pids = new Set();

  for (const port of portsToClear) {
    for (const pid of getListeningPids(port)) {
      const command = getCommand(pid);
      if (shouldTerminate(command)) {
        pids.add(pid);
      }
    }
  }

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGTERM');
    } catch {
      // Ignore processes that already exited.
    }
  }

  for (const port of portsToClear) {
    await waitForPortRelease(port);
  }
}

async function start() {
  await clearProjectPorts();

  const child = spawn(process.execPath, [serverEntry], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', forwardSignal);
  process.on('SIGTERM', forwardSignal);

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
