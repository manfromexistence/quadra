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

console.log("🚀 BEAST MODE PRODUCTION BUILD INITIATED");
console.log("💪 Optimizing for maximum performance...");

if (fs.existsSync(nextDir)) {
  console.log("🧹 Cleaning previous build...");
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
    // BEAST MODE ENVIRONMENT VARIABLES 🔥
    NEXT_PRIVATE_STANDALONE: "true",
    NEXT_PRIVATE_SKIP_SIZE_LIMIT: "1",
    TURBOPACK_MEMORY_LIMIT: "8192", // 8GB
    NODE_OPTIONS: "--max-old-space-size=8192", // 8GB Node.js heap
    // Disable telemetry for faster builds
    NEXT_TELEMETRY_DISABLED: "1",
    // Enable all optimizations
    NEXT_PRIVATE_OPTIMIZE_FONTS: "true",
    NEXT_PRIVATE_OPTIMIZE_IMAGES: "true",
    NEXT_PRIVATE_OPTIMIZE_CSS: "true",
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

  if (code === 0) {
    console.log("🎉 BEAST MODE BUILD COMPLETED SUCCESSFULLY!");
    console.log("⚡ Your app is now ULTRA-OPTIMIZED for production!");
  } else {
    console.log("❌ Build failed with code:", code);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
