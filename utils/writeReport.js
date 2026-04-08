const fs = require("fs");
const path = require("path");

function writeReport(report, runPath) {
  const reportPath = path.join(runPath, "report.json");

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  return reportPath;
}

module.exports = { writeReport };