function parseArgs(argv) {
  const args = argv.slice(2);

  if (args[0] === "--config") {
    if (!args[1]) {
      throw new Error("Missing config file path");
    }

    return {
      mode: "config",
      configPath: args[1],
    };
  }

  if (args.length >= 2) {
    return {
      mode: "single",
      url: args[0],
      keyword: args[1],
    };
  }

  throw new Error("Invalid arguments");
}

module.exports = parseArgs;