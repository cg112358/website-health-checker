# Website Health Checker

CLI-based website health checker built with Playwright.

Performs automated QA-style validation on a given URL, measuring performance, verifying page content, and generating structured reports with optional failure screenshots.

---

## 🚀 Features

- ✅ HTTP status validation
- ✅ Page title extraction
- ✅ Load time measurement
- ✅ Keyword presence check (optional)
- ✅ JSON report generation
- ✅ Automatic failure screenshots

---

## 💡 Why This Exists

Modern applications require fast, reliable validation of web experiences.

This tool provides a lightweight, automated way to:

- validate website health
- catch performance issues early
- generate reproducible QA artifacts
- simulate real-world testing workflows

---

## 📦 Installation

```bash
npm install
npx playwright install
```

---

## ▶️ Usage

```bash
node index.js <url> [keyword]
```

### Examples

```bash
node index.js https://example.com
node index.js https://example.com Example
```

## 📊 Output

Each run generates:

- JSON report → `/artifacts/report-<timestamp>.json`
- Screenshot (on failure) → `/artifacts/failure-<timestamp>.png`

## 🧠 Checks Performed

- Status Code OK (200)
- Title Present
- Load Time under threshold (10,000ms)
- Keyword Found (if provided)

## 📁 Project Structure

```text
checks/        # Page validation logic
utils/         # Helper utilities
artifacts/     # Generated reports and screenshots (ignored by git)
index.js       # CLI entry point
```

## 🎯 Purpose

This project simulates real-world QA validation workflows using Playwright.

Designed to:

- demonstrate automated testing principles
- generate deterministic artifacts
- provide a foundation for scalable validation tools

## 📄 License

**MIT License © 2026 Christopher Galvez**
