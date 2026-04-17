#!/usr/bin/env node
/**
 * Platform-agnostic backend process manager.
 * Usage: node scripts/backend.mjs <start|stop|restart|status>
 *
 * Stores PID file and logs in the /build/ folder (gitignored).
 */

import { execSync, spawn } from "node:child_process";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = resolve(import.meta.dirname, "..");
const BUILD_DIR = join(ROOT, "build");
const PID_FILE = join(BUILD_DIR, "backend.pid");
const LOG_OUT = join(BUILD_DIR, "backend.log");
const LOG_ERR = join(BUILD_DIR, "backend.err.log");
const BACKEND_DIR = join(ROOT, "backend");

function ensureBuildDir() {
  if (!existsSync(BUILD_DIR)) mkdirSync(BUILD_DIR, { recursive: true });
}

function readPid() {
  if (!existsSync(PID_FILE)) return null;
  const raw = readFileSync(PID_FILE, "utf-8").trim();
  const pid = parseInt(raw, 10);
  return Number.isNaN(pid) ? null : pid;
}

function isRunning(pid) {
  try {
    process.kill(pid, 0); // signal 0 = check existence
    return true;
  } catch {
    return false;
  }
}

async function stop() {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    console.log(`Stopping backend (PID ${pid})...`);
    try {
      // On Windows, process.kill sends SIGTERM which doesn't work for child trees.
      // Use taskkill /T to kill the process tree on Windows.
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
      } else {
        process.kill(-pid, "SIGTERM"); // negative PID kills the process group on Unix
      }
    } catch {
      // Process may have already exited
    }
    // Wait briefly for the process to die
    let tries = 10;
    while (tries-- > 0 && isRunning(pid)) {
      await sleep(500);
    }
    if (isRunning(pid)) {
      console.error(`Warning: process ${pid} may still be running.`);
    } else {
      console.log("Backend stopped.");
    }
  } else {
    console.log("Backend is not running.");
  }
  if (existsSync(PID_FILE)) unlinkSync(PID_FILE);
}

function start() {
  const existingPid = readPid();
  if (existingPid && isRunning(existingPid)) {
    console.log(`Backend is already running (PID ${existingPid}).`);
    console.log(`  Logs: ${LOG_OUT}`);
    return;
  }
  // Clean stale PID file
  if (existsSync(PID_FILE)) unlinkSync(PID_FILE);

  ensureBuildDir();

  // Re-invoke this script with _run to act as the long-lived wrapper process.
  const scriptPath = join(ROOT, "scripts", "backend.mjs");
  let pid;

  if (process.platform === "win32") {
    // On Windows, detached:true always opens a visible console window.
    // Use PowerShell Start-Process -WindowStyle Hidden for a truly hidden background process.
    const escaped = (s) => s.replace(/'/g, "''");
    const out = execSync(
      `powershell -NoProfile -Command "(Start-Process -FilePath node -ArgumentList '${escaped(scriptPath)}','_run' -WorkingDirectory '${escaped(ROOT)}' -WindowStyle Hidden -PassThru).Id"`,
      { encoding: "utf-8" },
    );
    pid = parseInt(out.trim(), 10);
  } else {
    // On Unix, detached creates a new process group (needed for kill via -pid).
    const child = spawn("node", [scriptPath, "_run"], {
      cwd: ROOT,
      stdio: "ignore",
      detached: true,
    });
    child.unref();
    pid = child.pid;
  }

  writeFileSync(PID_FILE, String(pid), "utf-8");
  console.log(`Backend started (PID ${pid}).`);
  console.log(`  Stdout log: ${LOG_OUT}`);
  console.log(`  Stderr log: ${LOG_ERR}`);
  console.log(`  PID file:   ${PID_FILE}`);
}

function status() {
  const pid = readPid();
  if (pid && isRunning(pid)) {
    console.log(`Backend is running (PID ${pid}).`);
  } else {
    console.log("Backend is not running.");
    if (pid) {
      console.log(`(Stale PID file found for PID ${pid})`);
    }
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "start":
      start();
      break;
    case "stop":
      await stop();
      break;
    case "restart":
      await stop();
      start();
      break;
    case "status":
      status();
      break;
    case "_run": {
      // Internal: long-lived wrapper that pipes dotnet output to log files.
      const out = createWriteStream(LOG_OUT);
      const err = createWriteStream(LOG_ERR);
      const dotnet = spawn("dotnet", ["run"], {
        cwd: BACKEND_DIR,
        stdio: ["ignore", "pipe", "pipe"],
      });
      dotnet.stdout.pipe(out);
      dotnet.stderr.pipe(err);
      dotnet.on("exit", (code) => {
        out.end();
        err.end();
        process.exit(code ?? 1);
      });
      break;
    }
    default:
      console.log(
        "Usage: node scripts/backend.mjs <start|stop|restart|status>",
      );
      process.exit(1);
  }
}

main();
