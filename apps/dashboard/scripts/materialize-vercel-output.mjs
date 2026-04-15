import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(".vercel/output");

function collectSymlinks(currentDir, symlinks = []) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const entryPath = path.join(currentDir, entry.name);

    if (entry.isSymbolicLink()) {
      symlinks.push(entryPath);
      continue;
    }

    if (entry.isDirectory()) {
      collectSymlinks(entryPath, symlinks);
    }
  }

  return symlinks;
}

if (!fs.existsSync(rootDir)) {
  process.exit(0);
}

const symlinks = collectSymlinks(rootDir).sort(
  (left, right) => right.length - left.length,
);

for (const symlinkPath of symlinks) {
  const realPath = fs.realpathSync(symlinkPath);
  const tempPath = `${symlinkPath}.__materialized__`;
  const realStats = fs.statSync(symlinkPath);

  fs.rmSync(tempPath, { force: true, recursive: true });
  fs.cpSync(realPath, tempPath, {
    dereference: true,
    force: true,
    recursive: realStats.isDirectory(),
  });
  fs.rmSync(symlinkPath, { force: true, recursive: true });
  fs.renameSync(tempPath, symlinkPath);
}
