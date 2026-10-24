import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { readFileSync } from "fs";

// Bundled dependencies (react-icons, tslib) are loaded without a source map,
// so their sources are not copied into the published .map files. This keeps
// the package small; source maps for this library's own code are kept.
const skipDependencySourcemaps = () => ({
  name: "skip-dependency-sourcemaps",
  load(id) {
    if (id.startsWith("\0") || !id.includes("/node_modules/")) {
      return null;
    }

    return { code: readFileSync(id, "utf8"), map: { mappings: "" } };
  },
});

// Each source file is its own output file (preserveModules), so a file that
// starts with "use client" gets the same directive at the top of its output.
// Using banner keeps the source maps correct.
const useClientBanner = (chunk) => {
  const id = chunk.facadeModuleId;
  if (!id || id.startsWith("\0") || !/\.[jt]sx?$/.test(id)) {
    return "";
  }

  const source = readFileSync(id, "utf8").trimStart();
  return /^["']use client["']/.test(source) ? '"use client";' : "";
};

// Rollup strips module-level directives and warns about it; the banner above
// adds "use client" back, so the warning is expected.
const onwarn = (warning, warn) => {
  if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
  warn(warning);
};

export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "dist/cjs",
        format: "cjs",
        sourcemap: true,
        preserveModules: true,
        banner: useClientBanner,
      },
      {
        dir: "dist/esm",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
        banner: useClientBanner,
      },
    ],
    plugins: [
      peerDepsExternal(),
      skipDependencySourcemaps(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: true,
        inlineSources: true,
      }),
      // Keep the "use client" directive added by the banner.
      terser({ compress: { directives: false } }),
    ],
    external: ["react", "react-dom"],
    onwarn,
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts.default()],
  },
];
