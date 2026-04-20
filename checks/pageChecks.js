const path = require("path");
const { runLinkChecks } = require("./linkChecks");
const NAVIGATION_TIMEOUT_MS = 15000;

async function safeCaptureScreenshot(page, screenshotPath) {
  try {
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    return screenshotPath;
  } catch {
    return null;
  }
}

async function runPageChecks(
  page,
  targetUrl,
  keyword,
  runPath,
  pageName = null,
  loadThresholdMs = 12000,
) {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const label = pageName || "single";
  const failureScreenshotPath = path.join(runPath, `${label}_failure.png`);

  let response = null;

  try {
    response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    const loadTimeMs = Date.now() - startedAt;
    const title = await page.title();
    const content = await page.content();

    const linkResults = await runLinkChecks(page, targetUrl);

    const statusCode = response ? response.status() : null;
    const okStatus =
      typeof statusCode === "number" && statusCode >= 200 && statusCode < 400;
    const titlePresent = typeof title === "string" && title.trim().length > 0;

    let keywordFound = null;
    if (keyword) {
      keywordFound = content.toLowerCase().includes(keyword.toLowerCase());
    }

    const checks = {
      navigation_completed: true,
      status_code_ok: okStatus,
      title_present: titlePresent,
      load_time_ok: loadTimeMs < loadThresholdMs,
      keyword_found: keyword ? keywordFound : null,
      links_ok: linkResults.broken_links === 0,
    };

    const passed = Object.values(checks).every((value) => {
      return value === null || value === true;
    });

    let screenshotPath = null;

    if (!passed) {
      screenshotPath = await safeCaptureScreenshot(page, failureScreenshotPath);
    }

    return {
      url: targetUrl,
      status: passed ? "PASS" : "FAIL",
      checked_at: checkedAt,
      load_time_ms: loadTimeMs,
      status_code: statusCode,
      title,
      keyword: keyword || null,
      screenshot: screenshotPath,
      error_code: null,
      error_message: null,
      timeout_ms: NAVIGATION_TIMEOUT_MS,
      navigation_attempt: 1,
      checks,

      link_summary: {
        total_links: linkResults.total_links,
        checked_links: linkResults.checked_links,
        skipped_links: linkResults.skipped_links,
        broken_links: linkResults.broken_links,
      },
      broken_links: linkResults.broken,
    };
  } catch (error) {
    const loadTimeMs = Date.now() - startedAt;

    let errorCode = "NAVIGATION_ERROR";
    if (
      error &&
      typeof error.name === "string" &&
      error.name === "TimeoutError"
    ) {
      errorCode = "NAVIGATION_TIMEOUT";
    }

    const screenshotPath = await safeCaptureScreenshot(
      page,
      failureScreenshotPath,
    );

    return {
      url: targetUrl,
      status: "FAIL",
      checked_at: checkedAt,
      load_time_ms: loadTimeMs,
      status_code: null,
      title: null,
      keyword: keyword || null,
      screenshot: screenshotPath,
      error_code: errorCode,
      error_message: error instanceof Error ? error.message : String(error),
      timeout_ms: NAVIGATION_TIMEOUT_MS,
      navigation_attempt: 1,
      checks: {
        navigation_completed: false,
        status_code_ok: false,
        title_present: false,
        load_time_ok: false,
        keyword_found: keyword ? false : null,
        links_ok: false,
      },
      link_summary: {
        total_links: 0,
        checked_links: 0,
        skipped_links: 0,
        broken_links: 0,
      },
      broken_links: [],
    };
  }
}

module.exports = { runPageChecks };
