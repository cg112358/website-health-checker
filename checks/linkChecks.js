async function extractLinks(page) {
  const hrefs = await page.$$eval("a", (anchors) =>
    anchors.map((a) => a.getAttribute("href")),
  );

  return hrefs.filter((href) => href !== null);
}

function classifyLink(href) {
  if (!href || href.trim() === "") return "empty";
  if (href.startsWith("#")) return "fragment";
  if (href.startsWith("mailto:")) return "mailto";
  if (href.startsWith("tel:")) return "tel";
  if (href.startsWith("javascript:")) return "javascript";
  if (href.startsWith("http://") || href.startsWith("https://"))
    return "absolute";
  return "relative";
}

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

async function validateLink(request, url) {
  try {
    const response = await request.get(url, { timeout: 5000 });
    return {
      ok: response.status() < 400,
      status: response.status(),
    };
  } catch {
    return {
      ok: false,
      status: "REQUEST_FAILED",
    };
  }
}

async function runLinkChecks(page, baseUrl) {
  const request = page.request;
  const hrefs = await extractLinks(page);

  let total = hrefs.length;
  let checked = 0;
  let skipped = 0;
  let broken = [];

  for (const href of hrefs) {
    const type = classifyLink(href);

    if (type !== "absolute" && type !== "relative") {
      skipped++;
      continue;
    }

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) {
      skipped++;
      continue;
    }

    const result = await validateLink(request, resolved);
    checked++;

    if (!result.ok) {
      broken.push({
        href,
        resolved_url: resolved,
        reason: result.status,
      });
    }
  }

  return {
    total_links: total,
    checked_links: checked,
    skipped_links: skipped,
    broken_links: broken.length,
    broken,
  };
}


module.exports = {
  extractLinks,
  runLinkChecks
};