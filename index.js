const { chromium } = require("playwright");
const { runPageChecks } = require("./checks/pageChecks");
const { writeReport } = require("./utils/writeReport");
const createRunFolder = require("./utils/createRunFolder");

async function main() {
  const targetUrl = process.argv[2];
  const keyword = process.argv[3] || null;

  if (!targetUrl) {
    console.error("Usage: node index.js <url> [keyword]");
    process.exit(1);
  }

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
    console.log(`- Load Under 10000ms: ${report.checks.load_under_10000ms}`);

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
