/**
 * fix-nft-symlinks.mjs
 *
 * Post-build script run as part of the Vercel buildCommand (after `bun run build`).
 *
 * Problem:
 *   bun workspace installs symlink every @midday/* package into
 *   node_modules/@midday/<pkg> → ../../packages/<pkg>.
 *   Next.js output-file-tracing follows those symlinks and writes the
 *   symlinked paths into .next/**\/*.nft.json manifests.
 *   Vercel's function packager rejects bundles that reference files inside
 *   symlinked directories with:
 *     "The framework produced an invalid deployment package for a Serverless
 *      Function. Typically this means that the framework produces files in
 *      symlinked directories."
 *
 * Fix:
 *   Walk every .nft.json under .next/, resolve each listed path to its real
 *   (symlink-free) location via fs.realpathSync, and rewrite the entry if the
 *   real path differs from the nominal path.  Duplicate entries are deduplicated
 *   after rewriting.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Locate the dashboard project root (works whether CWD is apps/dashboard or
// the monorepo root).
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, ".."); // apps/dashboard
const nextDir = path.join(projectRoot, ".next");

if (!fs.existsSync(nextDir)) {
  console.log("fix-nft-symlinks: .next directory not found, skipping.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively collect every *.nft.json path under `dir`. */
function findNftFiles(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      // Don't descend into symlinked directories.
      continue;
    }
    if (entry.isDirectory()) {
      findNftFiles(full, results);
    } else if (entry.isFile() && entry.name.endsWith(".nft.json")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Given an absolute path, return the real (symlink-free) absolute path.
 * Returns null if the file does not exist or cannot be resolved.
 */
function tryRealpath(absPath) {
  try {
    return fs.realpathSync(absPath);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const nftFiles = findNftFiles(nextDir);

let filesInspected = 0;
let filesRewritten = 0;
let pathsFixed = 0;

for (const nftFile of nftFiles) {
  filesInspected++;

  let raw;
  try {
    raw = fs.readFileSync(nftFile, "utf8");
  } catch {
    continue;
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch {
    console.warn(`fix-nft-symlinks: failed to parse ${nftFile}, skipping.`);
    continue;
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    continue;
  }

  const nftDir = path.dirname(nftFile);
  let changed = false;
  const seen = new Set();
  const rewritten = [];

  for (const relEntry of manifest.files) {
    // Each entry in .nft.json is a path relative to the .nft.json file itself.
    const absEntry = path.resolve(nftDir, relEntry);
    const realAbs = tryRealpath(absEntry);

    if (realAbs !== null && realAbs !== absEntry) {
      // Path went through one or more symlinks — replace with real path.
      const fixedRel = path.relative(nftDir, realAbs);
      if (!seen.has(fixedRel)) {
        seen.add(fixedRel);
        rewritten.push(fixedRel);
      }
      changed = true;
      pathsFixed++;
    } else {
      // Path is already real (or file missing — keep as-is).
      if (!seen.has(relEntry)) {
        seen.add(relEntry);
        rewritten.push(relEntry);
      }
    }
  }

  if (changed) {
    manifest.files = rewritten;
    try {
      fs.writeFileSync(nftFile, JSON.stringify(manifest));
      filesRewritten++;
    } catch (err) {
      console.error(`fix-nft-symlinks: failed to write ${nftFile}: ${err.message}`);
    }
  }
}

console.log(
  `fix-nft-symlinks: inspected ${filesInspected} .nft.json file(s), ` +
  `rewrote ${filesRewritten} file(s), fixed ${pathsFixed} symlinked path(s).`
);
