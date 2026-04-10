const fs = require("fs");
const path = require("path");

function loadConfig(configPath) {
  if (!configPath) {
    throw new Error("Missing config path");
  }

  const absolutePath = path.resolve(configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  let rawContent;

  try {
    rawContent = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read config file: ${configPath}`);
  }

  try {
    return JSON.parse(rawContent);
  } catch (error) {
    throw new Error(`Invalid JSON in config file: ${configPath}`);
  }
}

module.exports = loadConfig;