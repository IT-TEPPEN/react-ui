// Checks the package as it is published: packs it, installs the tarball
// into an empty project and renders the components through both the ESM
// and the CommonJS entry. Run after `npm run rollup`.
// Set REACT_VERSION (e.g. 18) to check against another React version.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const react = process.env.REACT_VERSION || pkg.devDependencies.react;
const work = mkdtempSync(join(tmpdir(), "react-ui-package-check-"));

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"] })
    .toString()
    .trim();

try {
  const tarball = run("npm", ["pack", "--silent", "--pack-destination", work], root)
    .split("\n")
    .pop();

  writeFileSync(
    join(work, "package.json"),
    JSON.stringify({ name: "package-check", private: true }, null, 2)
  );
  run(
    "npm",
    [
      "install",
      "--no-audit",
      "--no-fund",
      "--silent",
      join(work, tarball),
      `react@${react}`,
      `react-dom@${react}`,
    ],
    work
  );

  const check = `
    const rows = [{ id: "1", name: "Taro", born: new Date(2000, 0, 1) }];
    const cols = [
      { key: "name", type: "string", label: "Name" },
      { key: "born", type: "date", label: "Born", render: (v) => String(v.getFullYear()) },
    ];
    const table = renderToString(createElement(Table, { rows, cols }));
    const uploader = renderToString(createElement(FileUploader, {}));
    if (!table.includes("Taro") || !table.includes("2000")) throw new Error("Table did not render");
    if (!uploader.includes("<input")) throw new Error("FileUploader did not render");
    if (typeof useFileUploader !== "function") throw new Error("useFileUploader is missing");
  `;

  writeFileSync(
    join(work, "check.mjs"),
    `import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Table, FileUploader, useFileUploader } from "${pkg.name}";
${check}
console.log("ESM ok");
`
  );
  writeFileSync(
    join(work, "check.cjs"),
    `const { createElement } = require("react");
const { renderToString } = require("react-dom/server");
const { Table, FileUploader, useFileUploader } = require("${pkg.name}");
${check}
console.log("CommonJS ok");
`
  );

  // Fail on any warning too, e.g. Node re-parsing ESM files as CommonJS.
  for (const file of ["check.mjs", "check.cjs"]) {
    const result = spawnSync("node", [file], { cwd: work, encoding: "utf8" });
    if (result.status !== 0 || result.stderr.trim() !== "") {
      throw new Error(`${file} failed:\n${result.stderr}${result.stdout}`);
    }
    console.log(`${result.stdout.trim()} (React ${react})`);
  }

  const installed = join(work, "node_modules", pkg.name);

  // Node must read dist/esm as ES modules (it does not warn about this for
  // packages in node_modules, so check the marker file directly).
  const esmType = JSON.parse(
    readFileSync(join(installed, "dist/esm/package.json"), "utf8")
  ).type;
  if (esmType !== "module") {
    throw new Error(`dist/esm/package.json has type "${esmType}"`);
  }

  // Client components must keep "use client" at the top (needed by e.g.
  // Next.js). The table entry is one of them.
  for (const format of ["esm", "cjs"]) {
    const file = join(installed, `dist/${format}/src/table/table/base.js`);
    if (!readFileSync(file, "utf8").startsWith('"use client";')) {
      throw new Error(`"use client" is missing from ${file}`);
    }
  }
  console.log("Module format ok");

  const types = readFileSync(join(installed, pkg.types), "utf8");
  for (const name of ["Table", "FileUploader", "TTableColumn", "TPropsTable"]) {
    if (!new RegExp(`\\b${name}\\b`).test(types)) {
      throw new Error(`${name} is missing from ${pkg.types}`);
    }
  }
  console.log("Types ok");
} finally {
  rmSync(work, { recursive: true, force: true });
}
