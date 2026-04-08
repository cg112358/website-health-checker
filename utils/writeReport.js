const fs = require("fs");
const path = require("path");
const { ensureDir } = require("./ensureDir");

function writeReport(report) {
  const artifactsDir = path.join(__dirname, "..", "artifacts");
  ensureDir(artifactsDir);

  const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(artifactsDir, `report-${safeTimestamp}.json`);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  return reportPath;
}

module.exports = { writeReport };