async function runPageChecks(page, targetUrl, keyword) {
  const startedAt = Date.now();

  const response = await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  const loadTimeMs = Date.now() - startedAt;
  const title = await page.title();
  const content = await page.content();

  const statusCode = response ? response.status() : null;
  const okStatus = statusCode >= 200 && statusCode < 400;
  const titlePresent = typeof title === "string" && title.trim().length > 0;

  let keywordFound = null;
  if (keyword) {
    keywordFound = content.toLowerCase().includes(keyword.toLowerCase());
  }

  const checks = {
    status_code_ok: okStatus,
    title_present: titlePresent,
    load_under_10000ms: loadTimeMs < 10000,
    keyword_found: keyword ? keywordFound : null,
  };

  const passed = Object.values(checks).every((value) => {
    return value === null || value === true;
  });

  let screenshotPath = null;

  if (!passed) {
    const safeTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
    screenshotPath = `artifacts/failure-${safeTimestamp}.png`;

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
  }
  return {
    url: targetUrl,
    status: passed ? "PASS" : "FAIL",
    checked_at: new Date().toISOString(),
    load_time_ms: loadTimeMs,
    status_code: statusCode,
    title,
    keyword: keyword || null,
    screenshot: screenshotPath, 
    checks,
  };
}

module.exports = { runPageChecks };
