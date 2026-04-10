const { chromium } = require("playwright");
const { runPageChecks } = require("./checks/pageChecks");
const { writeReport } = require("./utils/writeReport");
const createRunFolder = require("./utils/createRunFolder");
const LOAD_THRESHOLD_MS = 12000;
const parseArgs = require("./utils/parseArgs");

const loadConfig = require("./config/loadConfig");

async function main() {
  const args = parseArgs(process.argv);

  if (args.mode === "config") {
    const config = loadConfig(args.configPath);
    console.log(config);
    process.exit(0);
  }

  if (args.mode !== "single") {
    throw new Error("Unsupported mode");
  }

  const targetUrl = args.url;
  const keyword = args.keyword;

  const runPath = createRunFolder();

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const report = await runPageChecks(page, targetUrl, keyword, runPath);
    const reportPath = writeReport(report, runPath);

    console.log("\n=== Website Health Check ===");
    console.log(`URL: ${report.url}`);
    console.log(`Status: ${report.status}`);
    console.log(`HTTP Status Code: ${report.status_code}`);
    console.log(`Load Time: ${report.load_time_ms} ms`);
    console.log(`Title: ${report.title || "(none)"}`);

    if (report.keyword) {
      console.log(`Keyword Checked: ${report.keyword}`);
      console.log(`Keyword Found: ${report.checks.keyword_found}`);
    }

    console.log("\nChecks:");
    console.log(`- Status Code OK: ${report.checks.status_code_ok}`);
    console.log(`- Title Present: ${report.checks.title_present}`);
    console.log(
      `- Load Time OK (< ${LOAD_THRESHOLD_MS} ms): ${report.checks.load_time_ok}`,
    );

    if (report.keyword) {
      console.log(`- Keyword Found: ${report.checks.keyword_found}`);
    }

    if (report.screenshot) {
      console.log(`Screenshot saved: ${report.screenshot}`);
    }

    console.log(`\nReport saved to: ${reportPath}`);
  } catch (error) {
    console.error("\nHealth check failed.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
