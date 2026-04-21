function shouldSkipHref(href) {
  if (!href || typeof href !== "string") {
    return { skip: true, reason: "missing_href" };
  }

  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return { skip: true, reason: "empty_href" };
  }

  if (trimmedHref.startsWith("#")) {
    return { skip: true, reason: "fragment_only" };
  }

  if (trimmedHref.startsWith("mailto:")) {
    return { skip: true, reason: "mailto" };
  }

  if (trimmedHref.startsWith("tel:")) {
    return { skip: true, reason: "tel" };
  }

  if (trimmedHref.startsWith("javascript:")) {
    return { skip: true, reason: "javascript" };
  }

  return { skip: false };
}
const CLIENT_REASON_LABELS = {
  missing_href: "Missing destinations",
  empty_href: "Empty link values",
  fragment_only: "Placeholder links",
  mailto: "Email links skipped",
  tel: "Phone links skipped",
  javascript: "JavaScript links skipped",
  invalid_url: "Invalid links",
  external_origin: "External links skipped",
};

function summarizeSkippedIssues(skipped) {
  const summary = {};

  for (const item of skipped) {
    const reason = item.reason || "unknown";
    summary[reason] = (summary[reason] || 0) + 1;
  }

  return summary;
}

function normalizeCandidateUrl(seedUrl, href) {
  const resolvedUrl = new URL(href, seedUrl);

  resolvedUrl.hash = "";

  if (resolvedUrl.pathname !== "/" && resolvedUrl.pathname.endsWith("/")) {
    resolvedUrl.pathname = resolvedUrl.pathname.slice(0, -1);
  }

  return resolvedUrl.toString();
}

function buildCrawlDiscovery({ seedUrl, links }) {
  const candidates = [];
  const skipped = [];
  const seen = new Set();

  const seedOrigin = new URL(seedUrl).origin;
  const rawLinks = Array.isArray(links) ? links : [];

  for (const link of rawLinks) {
    const href = link?.href;

    const skipCheck = shouldSkipHref(href);
    if (skipCheck.skip) {
      skipped.push({ href, reason: skipCheck.reason });
      continue;
    }

    let normalizedUrl;

    try {
      normalizedUrl = normalizeCandidateUrl(seedUrl, href);
    } catch {
      skipped.push({ href, reason: "invalid_url" });
      continue;
    }

    try {
      const urlObj = new URL(normalizedUrl);

      if (urlObj.origin !== seedOrigin) {
        skipped.push({ href, reason: "external_origin" });
        continue;
      }
    } catch {
      skipped.push({ href, reason: "invalid_url" });
      continue;
    }

    if (seen.has(normalizedUrl)) {
      continue;
    }

    seen.add(normalizedUrl);

    candidates.push({
      url: normalizedUrl,
      discovered_from: seedUrl,
      source_href: href,
    });
  }

  const issueSummary = summarizeSkippedIssues(skipped);

  const clientIssueSummary = Object.fromEntries(
    Object.entries(issueSummary).map(([reason, count]) => [
      CLIENT_REASON_LABELS[reason] || reason,
      count,
    ]),
  );

  return {
    seedUrl,
    candidates,
    skipped,
    issue_summary: issueSummary,
    client_issue_summary: clientIssueSummary,
    counts: {
      raw: rawLinks.length,
      internal_candidates: candidates.length,
      skipped: skipped.length,
      deduped: seen.size,
    },
  };
}

module.exports = {
  shouldSkipHref,
  normalizeCandidateUrl,
  buildCrawlDiscovery,
};
