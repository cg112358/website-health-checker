const { chromium } = require("playwright");
const { runPageChecks } = require("./checks/pageChecks");
const { extractLinks } = require("./checks/linkChecks");
const { buildCrawlDiscovery } = require("./utils/crawlDiscovery");
const createRunFolder = require("./utils/createRunFolder");
const LOAD_THRESHOLD_MS = 12000;
const parseArgs = require("./utils/parseArgs");

const loadConfig = require("./config/loadConfig");
const validateConfig = require("./utils/validateConfig");

const { writeAggregateReport } = require("./utils/writeAggregateReport");

async function main() {
  let browser;

  try {
    const args = parseArgs(process.argv);

    if (args.mode === "config") {
      const config = validateConfig(loadConfig(args.configPath));
      const { runId, runPath, checkedAt } = createRunFolder();
      const loadThresholdMs = config.load_threshold_ms || LOAD_THRESHOLD_MS;

      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      const results = [];

      for (const pageConfig of config.pages) {
        const result = await runPageChecks(
          page,
          pageConfig.url,
          pageConfig.keyword,
          runPath,
          pageConfig.name,
          loadThresholdMs,
        );

        results.push({
          name: pageConfig.name,
          ...result,
        });

        console.log(`Checked: ${pageConfig.name} -> ${result.status}`);
      }

      const pagesChecked = results.length;
      const pagesPassed = results.filter(
        (result) => result.status === "PASS",
      ).length;
      const pagesFailed = results.filter(
        (result) => result.status === "FAIL",
      ).length;
      const overallStatus = pagesFailed > 0 ? "FAIL" : "PASS";

      const aggregateReport = {
        run_id: runId,
        checked_at: checkedAt,
        site_name: config.site_name,
        overall_status: overallStatus,
        pages_checked: pagesChecked,
        pages_passed: pagesPassed,
        pages_failed: pagesFailed,
        results,
      };

      const aggregateReportPath = writeAggregateReport(
        aggregateReport,
        runPath,
      );

      console.log(`Run ID: ${runId}`);
      console.log(`Artifacts: ${runPath}`);

      console.log("\n=== Multi-Page Summary ===");

      results.forEach((result) => {
        console.log(`${result.name}: ${result.status}`);
      });

      console.log("\n=== Aggregate Summary ===");
      console.log(`Site: ${config.site_name}`);
      console.log(`Overall Status: ${overallStatus}`);
      console.log(`Pages Checked: ${pagesChecked}`);
      console.log(`Pages Passed: ${pagesPassed}`);
      console.log(`Pages Failed: ${pagesFailed}`);
      console.log(`JSON report: ${aggregateReportPath.replace(/\\/g, "/")}`);
      console.log(`Load Threshold: ${loadThresholdMs} ms`);

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

    const seedReport = await runPageChecks(
      page,
      targetUrl,
      keyword,
      runPath,
      "seed",
      LOAD_THRESHOLD_MS,
    );

    const extractedLinks = await extractLinks(page);
    const discovery = buildCrawlDiscovery({
      seedUrl: targetUrl,
      links: extractedLinks.map((href) => ({ href })),
    });

    console.log(`\nDiscovered raw links: ${discovery.counts.raw}`);
    console.log(
      `Internal crawl candidates: ${discovery.counts.internal_candidates}`,
    );
    console.log(`Skipped links: ${discovery.counts.skipped}`);

    const discoveredResults = [];

    for (const candidate of discovery.candidates) {
      const result = await runPageChecks(
        page,
        candidate.url,
        null,
        runPath,
        null,
        LOAD_THRESHOLD_MS,
      );

      discoveredResults.push({
        name: candidate.url,
        discovered_from: candidate.discovered_from,
        source_href: candidate.source_href,
        ...result,
      });

      console.log(`Checked discovered: ${candidate.url} -> ${result.status}`);
    }

    const results = [
      {
        name: "seed",
        discovered_from: null,
        source_href: null,
        ...seedReport,
      },
      ...discoveredResults,
    ];

    const pagesChecked = results.length;
    const pagesPassed = results.filter(
      (result) => result.status === "PASS",
    ).length;
    const pagesFailed = results.filter(
      (result) => result.status === "FAIL",
    ).length;
    const overallStatus = pagesFailed > 0 ? "FAIL" : "PASS";

    const aggregateReport = {
      run_id: runId,
      checked_at: checkedAt,
      mode: "single_with_crawl",
      seed_url: targetUrl,
      overall_status: overallStatus,
      pages_checked: pagesChecked,
      pages_passed: pagesPassed,
      pages_failed: pagesFailed,
      crawl_summary: {
        enabled: true,
        depth: 1,
        raw_links_found: discovery.counts.raw,
        discovered_internal_links: discovery.counts.internal_candidates,
        skipped_links: discovery.counts.skipped,
        issue_summary: discovery.issue_summary,
        client_issue_summary: discovery.client_issue_summary,
      },
      discovery: {
        candidates: discovery.candidates,
        skipped: discovery.skipped,
        issue_summary: discovery.issue_summary,
        client_issue_summary: discovery.client_issue_summary,
      },
      results,
    };

    const aggregateReportPath = writeAggregateReport(aggregateReport, runPath);

    console.log("\n=== Website Health Check ===");
    console.log(`Seed URL: ${seedReport.url}`);
    console.log(`Seed Status: ${seedReport.status}`);
    console.log(`Seed HTTP Status Code: ${seedReport.status_code}`);
    console.log(`Seed Load Time: ${seedReport.load_time_ms} ms`);
    console.log(`Seed Title: ${seedReport.title || "(none)"}`);

    if (seedReport.error_code) {
      console.log(`Seed Error Code: ${seedReport.error_code}`);
      console.log(`Seed Error Message: ${seedReport.error_message}`);
    }

    if (seedReport.keyword) {
      console.log(`Keyword Checked: ${seedReport.keyword}`);
    }

    console.log("\nSeed Checks:");
    console.log(`- Status Code OK: ${seedReport.checks.status_code_ok}`);
    console.log(`- Title Present: ${seedReport.checks.title_present}`);
    console.log(
      `- Load Time OK (< ${LOAD_THRESHOLD_MS} ms): ${seedReport.checks.load_time_ok}`,
    );
    console.log(
      `- Navigation Completed: ${seedReport.checks.navigation_completed}`,
    );

    if (seedReport.keyword) {
      console.log(`- Keyword Found: ${seedReport.checks.keyword_found}`);
    }

    if (seedReport.screenshot) {
      console.log(`Screenshot saved: ${seedReport.screenshot}`);
    }

    console.log("\n=== Crawl Summary ===");
    console.log(`Seed: ${targetUrl}`);
    console.log(`Validated pages: ${pagesChecked}`);
    console.log(`Pages Passed: ${pagesPassed}`);
    console.log(`Pages Failed: ${pagesFailed}`);
    console.log(
      `Discovered internal links: ${discovery.counts.internal_candidates}`,
    );

    console.log(`Skipped links: ${discovery.counts.skipped}`);

    if (
      discovery.client_issue_summary &&
      Object.keys(discovery.client_issue_summary).length > 0
    ) {
      console.log("\nIssue Summary:");
      for (const [label, count] of Object.entries(
        discovery.client_issue_summary,
      )) {
        console.log(`- ${label}: ${count}`);
      }
    }
    console.log(`\nJSON report: ${aggregateReportPath.replace(/\\/g, "/")}`);
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
