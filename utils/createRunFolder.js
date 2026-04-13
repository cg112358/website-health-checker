const fs = require("fs");
const path = require("path");

function createRunFolder() {
  const timestamp = new Date().toISOString();
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const random = Math.random().toString(36).slice(2, 8);

  const runId = `${safeTimestamp}_${random}`;
  const runName = `run_${runId}`;
  const runPath = path.join("artifacts", runName);

  fs.mkdirSync(runPath, { recursive: true });

  return {
    runId,
    runPath,
    checkedAt: timestamp,
  };
}

module.exports = createRunFolder;