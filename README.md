# Unminified OpenClaw builds (GitHub Actions on a fork)

**Why (Ben 2026-11-19).** OpenClaw 2026.11.5 added one setting to its root build
(`tsdown.config.ts`: `minify: … { codegen: false, compress: false, mangle: { toplevel: false,
keepNames: true } }`) that renames every function-scope local. Structure, property names, string
literals and top-level/function names are unchanged, but 18 of benbox's 20 content-anchored dist
ports lost their anchors, and their insertions name locals that no longer exist stably (lane
NOT-READY 2026-11-19). Ben chose to stay on 11.3 and rebuild each release from its upstream tag
with only that setting turned off — on GitHub Actions, so no new third-party install code ever
runs on benbox (option B; on-box `pnpm install` was refused as a supply-chain risk).

**Where.** Public fork `benjaminclarke/openclaw-unminified-build` of `openclaw/openclaw`. Its
DEFAULT branch is an orphan holding only this directory's `.github/` and `scripts/`, so upstream's
~200 workflows (releases, docs sync, schedules) can never fire there: schedules run only from the
default branch and a push only triggers workflows on the pushed branch.

**What the workflow does** (`workflow_dispatch`, input `tag`): validate the tag → check out
`openclaw/openclaw@<tag>` → `scripts/unminify.mjs` (exactly one mangle block removed, else fail;
`--allow-absent` for pre-11.5 tags) → `pnpm install --frozen-lockfile` (pnpm pinned by
`packageManager`, node 24.22.1 = upstream's npm-release NODE_VERSION) → `pnpm build` →
`npm pack` → artifact `openclaw-<tag>-unminified` (tarball, `SHA256SUMS`, `BUILD-INFO`), 30 days.

**On benbox (next):** download the artifact and prove it is upstream's release minus the
renaming — every `dist/*.mjs` parsed with the `@babel/parser` already shipped inside the release,
local bindings canonicalised, compared file-by-file with the npm tarball — before the lane stages
it. Any difference = NOT-READY.

Edit here, then sync the two files to the fork's default branch.
