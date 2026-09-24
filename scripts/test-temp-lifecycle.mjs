import { spawn } from 'node:child_process';
import { lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

function groupAlive(pid) {
  try { process.kill(-pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}

function signalChild(child, signal) {
  if (!child?.pid) return;
  try {
    if (process.platform === 'win32') child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) { if (error.code !== 'ESRCH') throw error; }
}

async function stopDescendants(child) {
  if (!child.pid) return true;
  if (process.platform === 'win32') return false;
  if (!groupAlive(child.pid)) return true;
  signalChild(child, 'SIGTERM');
  for (let i = 0; i < 20 && groupAlive(child.pid); i++) await delay(50);
  if (groupAlive(child.pid)) signalChild(child, 'SIGKILL');
  for (let i = 0; i < 20 && groupAlive(child.pid); i++) await delay(50);
  return !groupAlive(child.pid);
}

function processStart(proc) {
  const record = readFileSync(`${proc}/stat`, 'utf8');
  return record.slice(record.lastIndexOf(')') + 2).split(' ')[19];
}

function snapshotProcesses() {
  if (process.platform !== 'linux') return null;
  try {
    const result = new Map();
    for (const pid of readdirSync('/proc').filter(name => /^\d+$/.test(name))) {
      try { result.set(pid, processStart(`/proc/${pid}`)); }
      catch (error) { if (!['ENOENT', 'ESRCH'].includes(error.code)) throw error; }
    }
    return result;
  } catch { return null; }
}

function hasDetachedReference(root, preexistingProcesses) {
  if (process.platform !== 'linux') return false;
  if (!preexistingProcesses) return true;
  // Tests can create their own process groups. Never remove their data merely
  // because the runner's group has exited. A later host sweep can recover it.
  try {
    for (const pid of readdirSync('/proc').filter(name => /^\d+$/.test(name))) {
      if (Number(pid) === process.pid) continue;
      const proc = `/proc/${pid}`;
      try {
        // Existing services cannot be descendants of this invocation. Compare
        // start ticks as well as PID so a reused PID is still inspected.
        if (preexistingProcesses.get(pid) === processStart(proc)) continue;
        if (lstatSync(proc).uid !== process.getuid()) continue;
        for (const name of ['cmdline', 'environ', 'maps']) {
          if (readFileSync(`${proc}/${name}`).includes(root)) return true;
        }
        for (const entry of ['cwd', 'exe', ...readdirSync(`${proc}/fd`).map(fd => `fd/${fd}`)]) {
          try { if (readlinkSync(`${proc}/${entry}`).includes(root)) return true; }
          catch (error) { if (!['ENOENT', 'ESRCH', 'EINVAL'].includes(error.code)) throw error; }
        }
      } catch (error) { if (!['ENOENT', 'ESRCH'].includes(error.code)) throw error; }
    }
    return false;
  } catch {
    // Unavailable process inspection is not evidence that fixtures are unused.
    return true;
  }
}

// Keep the root short: integration tests create Unix-domain sockets below it.
export async function withTestTemp(callback, { instanceId, tempParent } = {}) {
  const preexistingProcesses = snapshotProcesses();
  const parent = tempParent ?? (process.platform === 'win32' ? os.tmpdir() : '/tmp');
  const root = realpathSync(mkdtempSync(path.join(parent, 'pv-')));
  const identity = lstatSync(root);
  const marker = { schema: 1, kind: 'test', created_at: Math.floor(Date.now() / 1000), state: 'running' };
  const markerPath = path.join(root, '.paperclip-test-temp.json');
  const saveMarker = () => writeFileSync(markerPath, JSON.stringify(marker) + '\n', { mode: 0o600 });
  saveMarker();
  mkdirSync(path.join(root, 'h'));
  mkdirSync(path.join(root, 't'));
  const env = {
    ...process.env, NODE_ENV: 'test',
    PAPERCLIP_HOME: path.join(root, 'h'),
    PAPERCLIP_CONFIG: path.join(root, 'h', 'config.json'),
    PAPERCLIP_INSTANCE_ID: instanceId ?? `vt-${process.pid}`,
    TMPDIR: path.join(root, 't'),
  };
  let currentChild;
  let interrupted;
  let descendantsStopped = true;
  let success = false;
  let killTimer;
  const onSignal = (signal) => {
    interrupted = signal;
    signalChild(currentChild, signal);
    killTimer ??= setTimeout(() => signalChild(currentChild, 'SIGKILL'), 2000);
    killTimer.unref();
  };
  const onTerm = () => onSignal('SIGTERM');
  const onInt = () => onSignal('SIGINT');
  process.on('SIGTERM', onTerm);
  process.on('SIGINT', onInt);
  const run = async (command, args, options = {}) => {
    if (interrupted) throw Object.assign(new Error('Test run interrupted'), { exitCode: 128 + os.constants.signals[interrupted] });
    // util-linux flock holds the directory while the command runs. After SIGKILL,
    // the surviving command remains protected until it exits; a janitor can recover it later.
    const executable = process.platform === 'linux' ? 'flock' : command;
    const commandArgs = process.platform === 'linux' ? ['--shared', root, command, ...args] : args;
    const child = spawn(executable, commandArgs, {
      ...options, env: { ...env, ...options.env }, stdio: 'inherit', detached: process.platform !== 'win32',
    });
    currentChild = child;
    let result;
    try {
      result = await new Promise((resolve) => {
        let spawnError;
        child.once('error', error => { spawnError = error; });
        child.once('close', (status, signal) => resolve({ status, signal, error: spawnError }));
      });
    } finally {
      descendantsStopped = (await stopDescendants(child)) && descendantsStopped;
      currentChild = undefined;
      clearTimeout(killTimer);
      killTimer = undefined;
    }
    if (interrupted) throw Object.assign(new Error('Test run interrupted'), { exitCode: 128 + os.constants.signals[interrupted] });
    return result;
  };
  try {
    const result = await callback({ root, env, run });
    success = true;
    return result;
  } finally {
    process.off('SIGTERM', onTerm);
    process.off('SIGINT', onInt);
    clearTimeout(killTimer);
    const current = lstatSync(root);
    if (!current.isDirectory() || current.dev !== identity.dev || current.ino !== identity.ino) {
      throw new Error('Test temporary directory identity changed; cleanup refused');
    }
    if (success && descendantsStopped && !hasDetachedReference(root, preexistingProcesses) && process.env.PAPERCLIP_KEEP_TEST_TEMP !== '1') {
      // A just-exited test worker can leave a final async fixture write racing
      // recursive removal. Retry the whole tree, then retain it for inspection
      // rather than turn a passing suite into a cleanup failure.
      let removed = false;
      for (let attempt = 0; attempt < 3 && !removed; attempt++) {
        try {
          rmSync(root, { recursive: true, maxRetries: 10, retryDelay: 100 });
          removed = true;
        } catch (error) {
          if (error.code !== 'ENOTEMPTY') throw error;
          if (attempt < 2) await delay(100);
        }
      }
      if (!removed) {
        marker.state = 'retained';
        marker.finished_at = Math.floor(Date.now() / 1000);
        saveMarker();
        console.error(`[test:run] Retained temporary fixtures after cleanup race: ${root}`);
      }
    } else {
      marker.state = success ? 'retained' : 'failed';
      marker.finished_at = Math.floor(Date.now() / 1000);
      saveMarker();
      console.error(`[test:run] Retained temporary fixtures: ${root}`);
    }
  }
}
