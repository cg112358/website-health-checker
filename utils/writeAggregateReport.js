const fs = require("fs");
const path = require("path");

function writeAggregateReport(reportData, runPath) {
  const reportPath = path.join(runPath, "report.json");

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf-8");

  return reportPath;
}

module.exports = { writeAggregateReport };