import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(scriptsDir);
const nextDir = path.join(projectRoot, ".next");
const serverDir = path.join(projectRoot, ".next", "server");
const middlewarePath = path.join(serverDir, "middleware.js");
const tracePath = path.join(serverDir, "middleware.js.nft.json");
const buildCommand = process.platform === "win32" ? "bun.exe" : "bun";
const buildArgs = ["x", "next", "build"];

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
}

function ensureMiddlewareArtifacts() {
  if (!fs.existsSync(serverDir)) {
    return;
  }

  if (!fs.existsSync(middlewarePath)) {
    fs.writeFileSync(middlewarePath, "export default {};\n");
  }

  if (!fs.existsSync(tracePath)) {
    fs.writeFileSync(tracePath, JSON.stringify({ version: 1, files: [] }));
  }
}

const interval = setInterval(() => {
  try {
    ensureMiddlewareArtifacts();
  } catch {
    // Ignore races while Next is still writing the build output.
  }
}, 100);

const child = spawn(buildCommand, buildArgs, {
  cwd: projectRoot,
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  clearInterval(interval);

  try {
    ensureMiddlewareArtifacts();
  } catch {
    // Final best-effort write before exiting.
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
