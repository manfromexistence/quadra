import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const projectRoot =
  path.basename(cwd) === "dashboard" && path.basename(path.dirname(cwd)) === "apps"
    ? cwd
    : path.resolve("apps/dashboard");
const sourceDir = path.join(projectRoot, ".next");
const middlewareFile = path.join("server", "middleware.js");
const traceFile = path.join("server", "middleware.js.nft.json");

if (!fs.existsSync(sourceDir)) {
  process.exit(0);
}

const middlewarePath = path.join(sourceDir, middlewareFile);
const tracePath = path.join(sourceDir, traceFile);

if (!fs.existsSync(middlewarePath)) {
  fs.writeFileSync(middlewarePath, "export default {};\n");
}

if (!fs.existsSync(tracePath)) {
  fs.writeFileSync(tracePath, JSON.stringify({ version: 1, files: [] }));
}
