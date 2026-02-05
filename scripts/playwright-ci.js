const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');
const axeSource = require('axe-core').source;

const PAGES = ['index','color-contrast','typography','structure','forms','images','video-audio','animations','navigation-interaction'];
const BASE = process.env.BASE_URL || 'http://localhost:8000';
const OUT_DIR = path.join(process.cwd(), 'artifacts', 'playwright');
fs.mkdirSync(OUT_DIR, { recursive: true });

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function simpleHtmlReport(axeResults) {
  const violations = axeResults.violations || [];
  let html = `<html><head><meta charset="utf-8"><title>Axe Report</title><style>body{font-family:Arial,Helvetica,sans-serif}h1{font-size:18px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}</style></head><body>`;
  html += `<h1>Axe Report — ${violations.length} violation(s)</h1>`;
  if (!violations.length) {
    html += '<p>No violations found.</p>';
  } else {
    violations.forEach(v => {
      html += `<h2>${v.id} — ${v.impact || 'unknown'}</h2><p>${v.description}</p>`;
      html += `<details><summary>Nodes (${v.nodes.length})</summary><ul>`;
      v.nodes.forEach(n => {
        html += `<li>${(n.target || []).join(', ')} — ${n.html}</li>`;
      });
      html += '</ul></details>';
    });
  }
  html += '</body></html>';
  return html;
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const pageName of PAGES) {
      const page = await (await browser.newContext()).newPage();
      const url = `${BASE}/${pageName}.html`;
      console.log('Visiting', url);
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });

      // Desktop screenshot
      const desktopPath = path.join(OUT_DIR, `${pageName}-desktop.png`);
      await page.screenshot({ path: desktopPath, fullPage: true });

      // Mobile screenshot (iPhone 12)
      const mobileContext = await browser.newContext({ ...devices['iPhone 12'] });
      const mobilePage = await mobileContext.newPage();
      await mobilePage.goto(url, { waitUntil: 'load' });
      const mobilePath = path.join(OUT_DIR, `${pageName}-mobile.png`);
      await mobilePage.screenshot({ path: mobilePath, fullPage: true });
      await mobileContext.close();

      // Axe accessibility scan
      await page.addScriptTag({ content: axeSource });
      const results = await page.evaluate(async () => (await axe.run()));
      writeJson(path.join(OUT_DIR, `${pageName}-axe.json`), results);
      fs.writeFileSync(path.join(OUT_DIR, `${pageName}-axe.html`), simpleHtmlReport(results));

      await page.close();
    }

    console.log('Playwright CI: done. Artifacts written to', OUT_DIR);
    process.exit(0);
  } catch (err) {
    console.error('Error during Playwright CI run:', err);
    process.exit(2);
  } finally {
    await browser.close();
  }
})();
