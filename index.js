const { chromium } = require("playwright");
const { runPageChecks } = require("./checks/pageChecks");
const { writeReport } = require("./utils/writeReport");
const createRunFolder = require("./utils/createRunFolder");
const LOAD_THRESHOLD_MS = 12000;
const parseArgs = require("./utils/parseArgs");

const loadConfig = require("./config/loadConfig");
const validateConfig = require("./utils/validateConfig");

async function main() {
  let browser;

  try {
    const args = parseArgs(process.argv);

    if (args.mode === "config") {
      const config = validateConfig(loadConfig(args.configPath));
      const { runId, runPath, checkedAt } = createRunFolder();

      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      const results = [];

      for (const pageConfig of config.pages) {
        const result = await runPageChecks(
          page,
          pageConfig.url,
          pageConfig.keyword,
          runPath,
        );

        results.push({
          name: pageConfig.name,
          ...result,
        });

        console.log(`Checked: ${pageConfig.name} -> ${result.status}`);
      }

      console.log(`Run ID: ${runId}`);
      console.log(`Artifacts: ${runPath}`);

      console.log("\n=== Multi-Page Summary ===");

      results.forEach((result) => {
        console.log(`${result.name}: ${result.status}`);
      });

      return;
    }
    if (args.mode !== "single") {
      throw new Error("Unsupported mode");
    }

    const targetUrl = args.url;
    const keyword = args.keyword;
    const { runId, runPath, checkedAt } = createRunFolder();

    console.log(`Run ID: ${runId}`);
    console.log(`Artifacts: ${runPath}`);

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
