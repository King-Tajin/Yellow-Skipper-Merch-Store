import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TOP_COUNT = 10;
const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);
const EXCLUDED_DIRECTORIES = new Set(["constants"]);

const parseTopCount = (args) => {
  const value = args
    .map((arg) => arg.replace(/^--top=/, ""))
    .find((arg) => /^\d+$/.test(arg));
  const count = value ? Number(value) : DEFAULT_TOP_COUNT;
  return count > 0 ? count : DEFAULT_TOP_COUNT;
};

const listProjectFiles = () =>
  execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  )
    .split("\0")
    .filter(Boolean);

const isCandidate = (file) => {
  if (!EXTENSIONS.has(path.extname(file))) return false;
  return !file
    .split("/")
    .slice(0, -1)
    .some((segment) => EXCLUDED_DIRECTORIES.has(segment));
};

const countLines = (content) => {
  if (content.length === 0) return 0;
  const total = content.split("\n").length;
  return content.endsWith("\n") ? total - 1 : total;
};

const measure = (file) => {
  try {
    return {
      file,
      lines: countLines(fs.readFileSync(path.join(ROOT, file), "utf8")),
    };
  } catch {
    return null;
  }
};

const topCount = parseTopCount(process.argv.slice(2));
const measured = listProjectFiles()
  .filter(isCandidate)
  .map(measure)
  .filter(Boolean)
  .sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));

const rows = measured.slice(0, topCount);
const rankWidth = String(rows.length).length;
const linesWidth = Math.max(5, ...rows.map((row) => String(row.lines).length));

console.log(
  `Top ${rows.length} of ${measured.length} TypeScript/JavaScript files by line count (constants excluded)\n`
);
console.log(
  `${"#".padStart(rankWidth)}  ${"LINES".padStart(linesWidth)}  FILE`
);
rows.forEach(({ file, lines }, index) => {
  console.log(
    `${String(index + 1).padStart(rankWidth)}  ${String(lines).padStart(linesWidth)}  ${file}`
  );
});
