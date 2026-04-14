function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    throw new Error("Invalid arguments");
  }

  // Config mode
  if (args[0] === "--config") {
    if (args.length !== 2) {
      throw new Error("Invalid arguments");
    }

    return {
      mode: "config",
      configPath: args[1],
    };
  }

  // Single-page mode (keyword OPTIONAL now)
  if (args.length === 1 || args.length === 2) {
    return {
      mode: "single",
      url: args[0],
      keyword: args[1] || null,
    };
  }

  throw new Error("Invalid arguments");
}

module.exports = parseArgs;