// Turn off the local-identifier mangling OpenClaw added to its root build in 2026.11.5
// (tsdown.config.ts: `minify: … { codegen: false, compress: false, mangle: { toplevel: false,
// keepNames: true } }`). That setting renames every function-scope local, which breaks benbox's
// content-anchored dist ports. Everything else in the build is left exactly as upstream ships it.
//
// Fails (exit 1) unless exactly one such block is found, so a changed upstream config is loud,
// never silently half-applied. A tag that predates the setting (no block) passes with --allow-absent.
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2] ?? "tsdown.config.ts";
const allowAbsent = process.argv.includes("--allow-absent");
const src = readFileSync(file, "utf8");
const re = /minify:\s*typeof declarations === "object" && declarations\.emitDtsOnly\s*\?\s*undefined\s*:\s*\{\s*codegen: false,\s*compress: false,\s*mangle: \{\s*toplevel: false,\s*keepNames: true\s*\}\s*\},/g;
const hits = src.match(re) ?? [];
if (hits.length === 0 && allowAbsent) {
  console.log(`unminify: no mangle block in ${file} (pre-11.5 config); nothing to do`);
  process.exit(0);
}
if (hits.length !== 1) {
  console.error(`unminify: expected exactly 1 mangle block in ${file}, found ${hits.length}`);
  process.exit(1);
}
// Keep upstream's minify pass (its codegen/compress settings change constant inlining: with the
// pass off entirely, 3,131 of 15,045 shipped files differed from npm beyond renaming); turn off
// ONLY the renaming.
writeFileSync(file, src.replace(re,
  'minify: typeof declarations === "object" && declarations.emitDtsOnly ? undefined : ' +
  '{ codegen: false, compress: false, mangle: false }, // benbox: mangle off'));
console.log(`unminify: mangle block removed from ${file}`);
