const fs = require("fs");
const path = require("path");

function createRunFolder() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.random().toString(36).slice(2, 8);

  const runName = `run_${timestamp}_${random}`;
  const runPath = path.join("artifacts", runName);

  fs.mkdirSync(runPath, { recursive: true });

  return runPath;
}

module.exports = createRunFolder;