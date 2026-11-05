// Builds dist/style.css: the CSS for the classes the library uses, for apps
// that do not use Tailwind CSS. Run after rollup (it scans dist).
//
// - Tailwind's reset (preflight) is kept, but only for the library's own
//   elements, so the app's styles are left alone. It weighs as much as one
//   class, so the app's tag rules (`button { … }`) do not get in.
// - Tailwind's variables are set on those elements, not on :root.
// - Cascade layers are removed. In a layer, the styles would lose to any
//   style of the app outside a layer (even `button { … }`).
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { transform } from "lightningcss";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist", "style.css");

/** The outer elements of the library's components. */
const ROOTS = [
  '[data-teppen-part="table"]',
  '[data-teppen-part="file-uploader"]',
  '[data-teppen-part="file-list"]',
  '[data-teppen-part="rejected-files"]',
];
const scope = `:where(${ROOTS.join(", ")})`;

// Gives a selector the weight of one class, whatever it is. The reset then
// wins over the app's tag rules (`button { … }`, `table td { … }`), and the
// library's own classes, which come later in the file, win over the reset.
const ONE_CLASS = ":not(.teppen-never)";

const input = `
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities) source(none);
@source "./esm";
`;

/** Limits the reset to the library's elements, with the weight of a class. */
function scopeBase(layer) {
  layer.walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    const selectors = [];
    for (const s of rule.selectors) {
      if (s === "html" || s === ":host") {
        // Page-wide settings: the line height and tab size the layout
        // assumes, on the component itself. The font stays the app's.
        selectors.push(scope);
        continue;
      }
      // "button" → inside a component; "*" and "::x" also the component
      // itself, there with no weight, so the app's className on it wins.
      const at = s.indexOf("::");
      const element = (at < 0 ? s : s.slice(0, at)) || "*";
      const pseudo = at < 0 ? "" : s.slice(at);
      selectors.push(`:where(:is(${ROOTS.join(", ")}) ${element})${ONE_CLASS}${pseudo}`);
      if (element === "*") selectors.push(`${scope}${pseudo}`);
    }
    rule.selectors = [...new Set(selectors)];
    if (rule.selectors.length === 1 && rule.selectors[0] === scope) {
      rule.walkDecls((decl) => {
        if (/^font-(family|feature-settings|variation-settings)$/.test(decl.prop)) decl.remove();
      });
    }
  });
}

const unlayer = () => ({
  postcssPlugin: "unlayer",
  OnceExit(css) {
    css.walkAtRules("layer", (at) => {
      if (!at.nodes) return at.remove(); // `@layer a, b;`
      if (at.params === "base") {
        scopeBase(at);
        // Text inside the components takes the component's size, line height
        // and color, not the app's tag rules (`p { font-size: … }`). The
        // component's own element is left out, so a className on it works.
        at.prepend(
          postcss.rule({
            selector: `:where(:is(${ROOTS.join(", ")}) *)${ONE_CLASS}`,
            nodes: [
              postcss.decl({ prop: "font-size", value: "inherit" }),
              postcss.decl({ prop: "line-height", value: "inherit" }),
              postcss.decl({ prop: "color", value: "inherit" }),
            ],
          })
        );
      }
      if (at.params === "theme") {
        // Tailwind's variables (--spacing, --color-…) only where they are
        // used, so they do not meet the app's own variables of those names.
        at.walkRules((rule) => {
          rule.selectors = rule.selectors.map((s) => (s === ":root" || s === ":host" ? scope : s));
          rule.selectors = [...new Set(rule.selectors)];
        });
      }
      at.replaceWith(at.nodes);
    });
  },
});
unlayer.postcss = true;

const result = await postcss([tailwind({ optimize: false }), unlayer()]).process(input, {
  from: join(root, "dist", "style.input.css"),
});

const { code } = transform({
  filename: "style.css",
  code: Buffer.from(result.css),
  minify: true,
});

const banner = `/* @teppen/react-ui ${JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version} — for apps without Tailwind CSS */\n`;
writeFileSync(out, banner + code.toString());
console.log(`dist/style.css: ${(code.length / 1024).toFixed(1)} KiB`);
