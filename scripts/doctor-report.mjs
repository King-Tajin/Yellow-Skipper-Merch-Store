import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { diagnose } from "react-doctor/api";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
};

function severityColor(severity) {
  return severity === "error" ? colors.red : colors.yellow;
}

function severityLabel(severity) {
  return severity === "error" ? "ERROR" : "WARN ";
}

const result = await diagnose(projectRoot, {
  lint: true,
  deadCode: true,
  verbose: true,
});

const byFile = new Map();
for (const diag of result.diagnostics) {
  const key = diag.filePath;
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key).push(diag);
}

const sortedFiles = [...byFile.keys()].sort();

for (const filePath of sortedFiles) {
  const diags = byFile
    .get(filePath)
    .sort((a, b) => a.line - b.line || a.column - b.column);
  const relPath = relative(projectRoot, filePath);
  console.log(`\n${colors.bold}${colors.cyan}${relPath}${colors.reset}`);
  for (const diag of diags) {
    const color = severityColor(diag.severity);
    console.log(
      `  ${color}${severityLabel(diag.severity)}${colors.reset} ` +
        `${colors.dim}${diag.line}:${diag.column}${colors.reset} ` +
        `${diag.plugin}/${diag.rule}`
    );
    console.log(`         ${diag.message}`);
    if (diag.help)
      console.log(`         ${colors.dim}${diag.help}${colors.reset}`);
    if (diag.url)
      console.log(`         ${colors.dim}${diag.url}${colors.reset}`);
  }
}

const errorCount = result.diagnostics.filter(
  (d) => d.severity === "error"
).length;
const warningCount = result.diagnostics.filter(
  (d) => d.severity === "warning"
).length;

console.log(`\n${colors.bold}Summary${colors.reset}`);
console.log(`  ${colors.red}${errorCount} error(s)${colors.reset}`);
console.log(`  ${colors.yellow}${warningCount} warning(s)${colors.reset}`);
if (result.score) {
  console.log(
    `  ${colors.green}Score: ${result.score.score}/100 (${result.score.label})${colors.reset}`
  );
}
if (result.skippedChecks.length) {
  console.log(
    `  ${colors.dim}Skipped checks: ${result.skippedChecks.join(", ")}${colors.reset}`
  );
}
if (result.skippedCheckReasons) {
  for (const [check, reason] of Object.entries(result.skippedCheckReasons)) {
    console.log(`  ${colors.yellow}${check}: ${reason}${colors.reset}`);
  }
}

process.exit(errorCount > 0 ? 1 : 0);
