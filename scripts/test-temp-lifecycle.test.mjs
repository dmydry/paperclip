import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { withTestTemp } from './test-temp-lifecycle.mjs';

test('successful command removes only its temporary root', async () => {
  let root;
  const outside = mkdtempSync(path.join(os.tmpdir(), 'temp-lifecycle-keep-'));
  try {
    writeFileSync(path.join(outside, 'keep'), 'source');
    await withTestTemp(async context => {
      root = context.root;
      const result = await context.run(process.execPath, ['-e', 'require("fs").writeFileSync(process.env.TMPDIR+"/fixture", "data")']);
      assert.equal(result.status, 0);
      assert.ok(existsSync(path.join(root, 't', 'fixture')));
    });
    assert.equal(existsSync(root), process.platform === 'win32');
    assert.equal(readFileSync(path.join(outside, 'keep'), 'utf8'), 'source');
  } finally {
    if (root) rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true });
  }
});

test('Linux detached child keeps its fixtures until it has stopped', { skip: process.platform !== 'linux' }, async () => {
  let root;
  let child;
  let completion;
  try {
    await withTestTemp(async context => {
      root = context.root;
      child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], {
        cwd: root, detached: true, stdio: 'ignore', env: context.env,
      });
      completion = new Promise(resolve => child.once('exit', resolve));
      await new Promise((resolve, reject) => {
        child.once('spawn', resolve);
        child.once('error', reject);
      });
      const result = await context.run(process.execPath, ['-e', 'process.exit(0)']);
      assert.equal(result.status, 0);
    });
    assert.equal(JSON.parse(readFileSync(path.join(root, '.paperclip-test-temp.json'))).state, 'retained');
    assert.equal(child.exitCode, null);
  } finally {
    if (child?.pid) { process.kill(-child.pid, 'SIGKILL'); await completion; }
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

test('failed command preserves a dated fixture and original exit code', async () => {
  let root;
  try {
    await assert.rejects(withTestTemp(async context => {
      root = context.root;
      const result = await context.run(process.execPath, ['-e', 'process.exit(7)']);
      throw Object.assign(new Error('fixture failure'), { exitCode: result.status });
    }), error => error.exitCode === 7);
    const marker = JSON.parse(readFileSync(path.join(root, '.paperclip-test-temp.json')));
    assert.equal(marker.state, 'failed');
    assert.ok(marker.finished_at > 0);
  } finally { if (root) rmSync(root, { recursive: true }); }
});

test('command-start failure returns an error and preserves diagnostics', async () => {
  let root;
  try {
    await assert.rejects(withTestTemp(async context => {
      root = context.root;
      const result = await context.run('/nonexistent/test-command', []);
      assert.ok(result.error || result.status !== 0);
      throw new Error('cannot start');
    }), /cannot start/);
    assert.ok(existsSync(root));
  } finally { if (root) rmSync(root, { recursive: true }); }
});

test('Linux command holds the root flock until it exits', { skip: process.platform !== 'linux' }, async () => {
  await withTestTemp(async context => {
    const result = await context.run(process.execPath, ['-e', `
      const r=require('child_process').spawnSync('flock',['--exclusive','--nonblock',process.env.PAPERCLIP_HOME+'/..','true']);
      process.exit(r.status === 1 ? 0 : 9);
    `]);
    assert.equal(result.status, 0);
  });
});

test('SIGTERM stops the owned command and retains a failure marker', { skip: process.platform === 'win32' }, async () => {
  const scratch = mkdtempSync(path.join(os.tmpdir(), 'test-temp-signal-'));
  const info = path.join(scratch, 'root.txt');
  const entry = path.join(scratch, 'run.mjs');
  writeFileSync(entry, `
    import { withTestTemp } from ${JSON.stringify(new URL('./test-temp-lifecycle.mjs', import.meta.url).href)};
    import fs from 'node:fs';
    try {
      await withTestTemp(async c => {
        fs.writeFileSync(${JSON.stringify(info)}, c.root);
        await c.run(process.execPath, ['-e','setInterval(()=>{},1000)']);
      });
    } catch(e) { process.exitCode=e.exitCode ?? 1; }
  `);
  const child = spawn(process.execPath, [entry], { stdio: 'ignore' });
  const completion = new Promise(resolve => child.once('exit', (code, signal) => resolve({ code, signal })));
  let root;
  try {
    for (let i = 0; i < 100 && !existsSync(info); i++) await delay(20);
    root = readFileSync(info, 'utf8');
    await delay(100);
    child.kill('SIGTERM');
    const result = await completion;
    assert.equal(result.code, 143);
    const marker = JSON.parse(readFileSync(path.join(root, '.paperclip-test-temp.json')));
    assert.equal(marker.state, 'failed');
  } finally {
    child.kill('SIGKILL');
    if (root) rmSync(root, { recursive: true, force: true });
    rmSync(scratch, { recursive: true });
  }
});
