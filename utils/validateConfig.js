function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Config error: root config must be an object");
  }

  if (!isNonEmptyString(config.site_name)) {
    throw new Error(
      "Config error: site_name is required and must be a non-empty string",
    );
  }

  if (
    config.load_threshold_ms !== undefined &&
    !isPositiveInteger(config.load_threshold_ms)
  ) {
    throw new Error(
      "Config error: load_threshold_ms must be a positive integer",
    );
  }

  if (!Array.isArray(config.pages) || config.pages.length === 0) {
    throw new Error("Config error: pages must be a non-empty array");
  }

  const seenNames = new Set();

  config.pages.forEach((page, index) => {
    if (!page || typeof page !== "object" || Array.isArray(page)) {
      throw new Error(`Config error: pages[${index}] must be an object`);
    }

    if (!isNonEmptyString(page.name)) {
      throw new Error(`Config error: pages[${index}].name is required`);
    }

    if (seenNames.has(page.name)) {
      throw new Error(`Config error: duplicate page name "${page.name}"`);
    }
    seenNames.add(page.name);

    if (!isValidUrl(page.url)) {
      throw new Error(`Config error: pages[${index}].url must be a valid URL`);
    }

    if (!isNonEmptyString(page.keyword)) {
      throw new Error(`Config error: pages[${index}].keyword is required`);
    }
  });

  return config;
}

module.exports = validateConfig;
