# Website Health Checker

A deterministic validation engine for AI-built and conventionally built web systems.

CLI-based validation engine built with Playwright, designed to verify multi-page web systems through deterministic checks, artifact generation, and reproducible reporting.

Performs automated QA-style validation on web pages, measuring performance, verifying content, and generating structured, audit-ready artifacts.

---

## 🚀 Features

- ✅ HTTP status validation
- ✅ Page title extraction
- ✅ Load time measurement
- ✅ Keyword presence validation (required in single-page mode)
- ✅ JSON report generation
- ✅ Automatic failure screenshots
- ✅ Multi-page config-based execution

---

## 💡 Why This Exists

Modern applications — especially AI-generated ones — require fast, reliable validation.

This tool provides a lightweight validation engine to:

- validate AI-generated web applications
- ensure correctness across multi-page systems
- generate audit-ready validation artifacts
- provide reproducible execution evidence

---

## 📦 Installation

```bash
npm install
npx playwright install
```

---

## ▶️ Usage

### Single Page Mode

```bash
node index.js <url> "<keyword>"
```

⚠️ Keyword is currently required in single-page mode.

### Example

```bash
node index.js https://example.com "Example"
```

---

### 🧪 Multi-Page Validation

Run multi-page validation using a config file:

```bash
node index.js --config <config-path>
```

#### Example

```bash
node index.js --config configs/galvezcompany.json
```

Multi-page validation is driven by a JSON config file:

```json
{
  "site_name": "galvezcompany",
  "pages": [
    {
      "name": "home",
      "url": "https://example.com",
      "keyword": "Example"
    }
  ]
}
```

Each page is:

- executed independently
- validated using deterministic checks
- collected into a single run result

---

## 🖥️ Example Output

### Single Page Run

```text
Run ID: 2026-04-13T16-31-43-184Z_aabknv
Artifacts: artifacts/run_2026-04-13T16-31-43-184Z_aabknv

=== Website Health Check ===
URL: https://example.com
Status: PASS
HTTP Status Code: 200
Load Time: 365 ms
Title: Example Domain
Keyword Checked: Example
Keyword Found: true

Checks:
- Status Code OK: true
- Title Present: true
- Load Time OK (< 12000 ms): true
- Keyword Found: true

Report saved to: artifacts/run_<id>/report.json
```

### Multi-Page Run

```text
Checked: home -> PASS
Checked: services -> PASS
Checked: contact -> PASS

Run ID: 2026-04-13T16-30-03-621Z_wpgy6g
Artifacts: artifacts/run_2026-04-13T16-30-03-621Z_wpgy6g

=== Multi-Page Summary ===
home: PASS
services: PASS
contact: PASS
```

---

## 📊 Output

Each run generates a structured artifact:

```text
artifacts/run_<id>/
  ├── report.json
  ├── failure.png (if applicable)
```

This artifact acts as a run-level validation record for debugging and analysis.

---

## 🧠 Checks Performed

- Status Code OK (200)
- Title Present
- Load Time under threshold (12,000ms)
- Keyword Found (if provided)

## 📁 Project Structure

```text
checks/        # Page validation logic
utils/         # Helper utilities
artifacts/     # Generated reports and screenshots (ignored by git)
config/        # Config-based multi-page validation
index.js       # CLI entry point
```

---

## 🎯 Purpose

This project represents a deterministic validation system designed for modern web environments.

It demonstrates:

- validation of AI-assisted builds
- production-style QA workflows
- reproducible validation pipelines
- artifact-based debugging systems

---

## 📄 License

**MIT License © 2026 Christopher Galvez**
