// Compares versions of @teppen/react-ui in a real browser.
//
//   npm run bench -- 1.8.15 2.12.0 local
//
// A version is a published version (downloaded with npm pack) or "local",
// the build in ../dist (run `npm run rollup` in the repository first).
// Each one gets the same app (bench/app.jsx), React 18 and the Tailwind CSS
// generated from its own files, so that layout costs are real.
//
// Each time is from the action until the next frame is painted, measured
// inside the page; the median of REPEAT fresh page loads is shown.
// Environment: REPEAT (default 5), ONLY (run the scenarios whose name
// contains this text), PLAYWRIGHT (path of a Playwright module to use).

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const work = join(here, ".work");
const bin = (name) => join(here, "node_modules", ".bin", name);

const versions = process.argv.slice(2);
if (versions.length === 0) {
  console.error("Usage: npm run bench -- <version|local> [<version|local> ...]");
  process.exit(1);
}
const REPEAT = Number(process.env.REPEAT ?? 5);
const ONLY = process.env.ONLY;
const { chromium } = await import(process.env.PLAYWRIGHT ?? "playwright");

// ---- build one page per version ------------------------------------------

function prepare(version) {
  const pkg = join(work, "packages", version);
  const out = join(work, "out", version);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  if (version === "local") {
    const dist = join(here, "..", "dist");
    if (!existsSync(dist)) throw new Error("No ../dist: run `npm run rollup` first");
    rmSync(pkg, { recursive: true, force: true });
    mkdirSync(pkg, { recursive: true });
    cpSync(dist, join(pkg, "dist"), { recursive: true });
  } else if (!existsSync(join(pkg, "dist"))) {
    mkdirSync(pkg, { recursive: true });
    const file = execFileSync("npm", ["pack", `@teppen/react-ui@${version}`, "--silent"], { cwd: pkg })
      .toString()
      .trim();
    execFileSync("tar", ["xzf", file, "--strip-components=1"], { cwd: pkg });
  }

  writeFileSync(
    join(out, "in.css"),
    `@import "tailwindcss" source(none);\n@source "${join(pkg, "dist")}";\n`
  );
  execFileSync(bin("tailwindcss"), ["-i", join(out, "in.css"), "-o", join(out, "style.css"), "--minify"], {
    stdio: "ignore",
  });
  execFileSync(bin("esbuild"), [
    join(here, "app.jsx"),
    "--bundle",
    "--minify",
    "--jsx=automatic",
    "--log-level=warning",
    `--define:process.env.NODE_ENV="production"`,
    `--alias:LIB=${join(pkg, "dist", "esm", "src", "index.js")}`,
    `--outfile=${join(out, "app.js")}`,
  ]);
  writeFileSync(
    join(out, "index.html"),
    `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="style.css"></head>` +
      `<body><div id="root" style="width:1200px"></div><script src="app.js"></script></body></html>`
  );
}

for (const version of versions) {
  console.log(`preparing ${version}...`);
  prepare(version);
}

// ---- serve the pages -----------------------------------------------------

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = createServer((req, res) => {
  const path = join(work, "out", decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!existsSync(path)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
  res.end(readFileSync(path));
});
await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

// ---- scenarios ------------------------------------------------------------

// Runs in the page before the app.
const helpers = () => {
  window.__next = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  window.__time = async (fn) => {
    const t = performance.now();
    fn();
    await window.__next();
    return performance.now() - t;
  };
  window.__cell = (r, c) => document.getElementById(`ReactUI:Table:B:Cell-${r}-${c}`);
  window.__sortButton = (label) =>
    [...document.querySelectorAll("p")]
      .find((p) => p.textContent === label)
      .closest("div")
      .parentElement.querySelector(".cursor-pointer");
  window.__nextPageButton = () =>
    [...document.querySelectorAll("button")].find((b) => [">", "次へ›"].includes(b.textContent.trim()));
  window.__select = (r, c) => {
    const cell = window.__cell(r, c);
    cell.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    cell.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  };
};

const editAndSave = (page) =>
  page.evaluate(async () => {
    window.__select(5, 0);
    await window.__next();
    window.__cell(5, 0).dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    await window.__next();
    await window.__next();
    const editor = document.getElementById("ReactUI:Table:B:Editor");
    if (!editor) return null;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setValue.call(editor, "edited");
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    await window.__next();
    // Every version saves when the editor loses the focus.
    const ms = await window.__time(() => editor.blur());
    await window.__next();
    return window.__cell(5, 0).textContent.includes("edited") ? ms : null;
  });

const SCENARIOS = [
  ["Mount, 10,000 rows (50 per page)", "rows=10000&per=50", (p) => p.evaluate(() => window.__mount)],
  ["Mount, 1,000 rows (all shown)", "rows=1000&per=all", (p) => p.evaluate(() => window.__mount)],
  ["Mount, 3,000 rows (all shown)", "rows=3000&per=all", (p) => p.evaluate(() => window.__mount)],
  ["Sort, 10,000 rows (50 per page)", "rows=10000&per=50", (p) => p.evaluate(() => window.__time(() => window.__sortButton("年齢").click()))],
  ["Sort, 1,000 rows (all shown)", "rows=1000&per=all", (p) => p.evaluate(() => window.__time(() => window.__sortButton("年齢").click()))],
  ["Next page, 10,000 rows", "rows=10000&per=50", (p) => p.evaluate(() => window.__time(() => window.__nextPageButton().click()))],
  ["Update 1 row, 10,000 rows (50 per page)", "rows=10000&per=50", (p) => p.evaluate(() => window.__time(() => window.__updateOne(3)))],
  ["Update 1 row, 1,000 rows (all shown)", "rows=1000&per=all", (p) => p.evaluate(() => window.__time(() => window.__updateOne(3)))],
  ["Update 1 row, 1,000 rows (all shown, cols memoized)", "rows=1000&per=all&stable=1", (p) => p.evaluate(() => window.__time(() => window.__updateOne(3)))],
  ["Reload all rows, 10,000 rows (50 per page)", "rows=10000&per=50", (p) => p.evaluate(() => window.__time(() => window.__replaceAll()))],
  ["Select a cell, 1,000 rows (all shown)", "rows=1000&per=all", (p) => p.evaluate(() => window.__time(() => window.__select(5, 1)))],
  ["Edit a cell and save, 10,000 rows (50 per page)", "rows=10000&per=50", editAndSave],
  ["Edit a cell and save, 1,000 rows (all shown)", "rows=1000&per=all", editAndSave],
];

// ---- run ------------------------------------------------------------------

const browser = await chromium.launch();
const rows = [];
for (const [name, query, run] of SCENARIOS) {
  if (ONLY && !name.includes(ONLY)) continue;
  const row = [name];
  for (const version of versions) {
    const samples = [];
    for (let i = 0; i < REPEAT; i++) {
      const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
      await page.addInitScript(helpers);
      await page.goto(`${base}/${version}/index.html?${query}`);
      await page.waitForFunction(() => window.__mount !== undefined, null, { timeout: 120000 });
      await page.waitForTimeout(300);
      const ms = await run(page);
      if (typeof ms === "number") samples.push(ms);
      await page.close();
    }
    samples.sort((a, b) => a - b);
    row.push(samples.length ? String(Math.round(samples[Math.floor(samples.length / 2)])) : "n/a");
  }
  rows.push(row);
  console.log(`${name}: ${row.slice(1).join(" / ")}`);
}
await browser.close();
server.close();

console.log(`\nMedian of ${REPEAT} runs, in ms\n`);
console.log(`| Scenario | ${versions.join(" | ")} |`);
console.log(`|---|${versions.map(() => "---:").join("|")}|`);
for (const row of rows) console.log(`| ${row.join(" | ")} |`);
