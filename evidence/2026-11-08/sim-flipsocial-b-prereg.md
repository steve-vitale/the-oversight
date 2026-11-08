# sim-flipsocial-b — prereg (BINDING)

**Arm:** sim-flipsocial-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1930Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (2) — follow-up to sim-flippanel-b: the `socialite` and `winseek` panel columns for the flip, owed by the flippanel prereg ("`socialite` and `winseek` are NOT run this run; their columns are owed by a follow-up, not faked here") · **Branch:** sim-flipsocial-b, cut at master `6680d7924` (worktree tip `1ee592573`, the sim-flippanel-b commit) · **Base for panels:** endpoint SHAs extracted read-only, never checked out in the worktree.

## The question

Do the two remaining §15 balanced-panel policy columns (`socialite`, `winseek`) confirm the flip between the collapsed tip `cf22937b8` and the healed tip `c9fea16ee` on the frozen band 53001–53008? The flippanel run (evidence/2026-11-08/sim-flippanel-b.md) ran only `capable` + `risk-aware` and returned NO-GO (capable flip absent, risk-aware death guardrails). This arm adds the two owed columns with the identical method, endpoints, seeds, and horizon — no new extraction route, no re-scored bar.

## Endpoints, seeds, horizon, policies

- **BEFORE (collapsed):** `cf22937b8` — healerbisect collapsed control: median **70.5d**, sits **0/8** (full-8, doorwalk baseline leg).
- **AFTER (healed):** `c9fea16ee` — healerbisect healed control: median **145d**, sits **4/8** (full-8, doorwalk baseline leg).
- **Seeds:** 53001–53008, FROZEN, deliberately reused — the flip contrast is defined on this band by the healerbisect controls. 8, not 16: the flip is a large-effect verification on a frozen band, not a small-effect claim (§15's 16/64 sizing is for small effects).
- **Horizon:** 150d, death-aware. The flip was defined on the frozen band at 150d; the panel's death-aware stop rule matches.
- **Policies:** `socialite,winseek` — TWO policies. Policy ids verified from the files before pre-registering: `scripts/policies/socialite.js` line 72 `id: 'socialite'`; `scripts/policies/winseek.js` line 902 `id: 'winseek'` (exports `{ winseek, accordRoad, fedseek, tableRoad }`). Both policies are byte-identical across `cf22937b8`, `c9fea16ee`, and the worktree tip (they do not appear in the endpoint `scripts/policies/` diff, which is 8 files: 7 pure additions + the `scalecourt-nogate-morntrace3-linkraise.js` read-only transcript change the flippanel prereg already documented).

## Method (real panels, not corpus conversion — copied from flippanel)

- Each endpoint is extracted as a FULL tree with `git archive` into `scratch-flipsocial/extract-before` / `extract-after` (untracked scratch, deleted before the final commit). `evidence/` is excluded from the extraction only — no panel-loaded code lives there; src/ and scripts/ are extracted whole (0730Z lesson: never a selective file list). Extraction verified by file count + `src/js/game.js` hash vs the endpoint (flippanel verified before 5cf0cbe6… == cf22937b8; after 47f9bd10… == c9fea16ee — re-verified here, not taken on trust).
- **Frozen-controller overlay (SIMULATING.md, "Freeze the same current scripts/controller/harness tree over both game roots"; MEASUREMENT.md §15):** the worktree tip's `scripts/` tree is overlaid onto BOTH extractions before any panel runs, so the only difference between the legs is `src/` (the intervention). Justification, verified before any judged leg:
  - The two panel policies (`socialite`, `winseek`) and `scripts/sim-harness.js` are byte-identical across `cf22937b8`, `c9fea16ee`, and the worktree tip (0-line diffs both ranges) — the overlay cannot change any row-producing code.
  - The only manifest-relevant `scripts/` differences between the endpoints are the same three classes flippanel documented (registration-only `sweep-compare.js` churn, pure policy-file additions, the one modified `scalecourt-nogate-morntrace3-linkraise.js` transcript-recording change) — the overlay neutralizes all three without touching row-producing code.
  - The observer (`balance-panel.js`, `gear-usage-audit.js`, `lib/*`, `balance-metrics.json`) is the worktree's on both legs by construction (the tool reads its own files), so `observerDigest`/`contractDigest` agree.
- Panel build per leg: `node scripts/balance-panel.js --root <extracted-tree> --out evidence/2026-11-08/panel-flipsocial-b/<before|after> --seeds 53001,53002,53003,53004,53005,53006,53007,53008 --policies socialite,winseek --days 150` (run from the worktree, so the worktree's panel tool + observer apply to both legs). The `cases/` cache is NOT committed (§15: panel summary only — `panel.json.gz` + compare `.md`/`.json`). Do NOT overwrite `evidence/2026-11-08/panel-flippanel-b/`.
- Panel builds are launched DETACHED with nohup into the out dirs (backgrounded exec kills panel builds at 8/16 with no output — a known finding from sim-flippanel-b); resume from the cases/ cache if killed.
- Compare: `node scripts/balance-panel.js compare --before <before-panel.json.gz> --after <after-panel.json.gz> --out evidence/2026-11-08/panel-flipsocial-b/compare`. COMPARE-CONTRACT: both panels must carry identical `options.policies` (they do — same invocation). If the compare returns `invalid`, READ the reason before re-running; never re-run blind and never fake a verdict.
- **Smoke first:** ONE seed (53001) × `socialite` per leg, timing + instrument check only (not a judged leg), into `evidence/2026-11-08/panel-flipsocial-b-smoke/<before|after>`. Gate: if either smoke case exceeds 4 min wall, the run falls back to the before-leg + written handoff path (prereg amended to record that before any judged leg) rather than leaving uncommitted partial panels. **Precedent for override:** the flippanel smoke-gate amendment (committed BEFORE judged legs) overrode the wall gate on compute ~36s/case when the wall excess was box contention, not case cost. Any override here follows the same rule — a prereg amendment committed before judged legs, transparently, never silently.
- If you patch an extracted tree, use `patch -p1`, NEVER `git apply` (it silently skips patches on an extracted tree inside a worktree, exit 0, nothing changes).

## Primary metric + GO bar (binding, per policy column)

- **Primary metric:** paired table-sitting rate + median survival **on each policy leg** — the wall metrics the flip moved. Sitting rate is the panel `table` metric (seat taken, ruling 665); median survival is computed from the 8 panel rows' `gameDays` per policy (the contract carries no median-survival metric; the computation is stated here, before any numbers).
- **GO iff ALL of, per policy column:** (a) the compare returns a valid decision (not `invalid`); (b) on that policy leg, healed table-sitting rate ≥ collapsed; (c) on that policy leg, healed median survival ≥ collapsed; (d) NO `regression_signal` or `regression_watch` status on `villageDeaths` or `playerDeaths` in ANY policy column. A `review_required` driven by a death-guardrail regression is NO-GO. Each policy column gets its own GO / NO-GO verdict; the arm verdict is GO only if both columns are GO.
- **Vocabulary note (pinned, from flippanel):** the compare tool emits only `no_material_signal`, `review_required`, `invalid` — there is no `go` decision. Improvements on directional metrics correctly read `no_material_signal` (only regressions and neutral-metric `won` moves trigger review), so `no_material_signal` with (b)–(d) holding IS a GO. `review_required` driven by a `won` move or another non-guardrail metric is a GO if (b)–(d) hold, recorded as an investigation note. `review_required` driven by a death-guardrail regression is NO-GO. `no_material_signal` with sits or median regressed on a policy leg is NO-GO for that column. `invalid` is NO-GO with cause (instrument failure, not a game verdict).
- Anything else is NO-GO — a miss is NO-GO, never re-scored against a friendlier metric mid-run. If the metric proves wrong, write it under "metric review" and propose the revision for the NEXT run.

## Sits-bar pin (carried from flippanel)

The analyzer reads COLLAPSED as sits ≤1/8; the healerbisect prereg text reads ≤2/8. **The analyzer's ≤1/8 bar binds** for any COLLAPSED/HEALED classification in this run. Both bars agree on both endpoints anyway (collapsed 0/8, healed 4/8), so the pin changes nothing for this verdict; it binds only so a future in-between leg is classified one way.

## Endpoint-reproduction tolerance (proof — the flip-signature check, same as flippanel)

The panel uses different policies than the doorwalk baseline leg, so exact reproduction is NOT expected — the check is directional, per policy leg:
- Paired delta healed − collapsed must be positive on BOTH sits (≥ +2/8) and median survival (≥ +30d).
- Absolute sanity bands: collapsed median 40–100d (control 70.5d ±30d), healed median 115–150d (control 145d, capped at horizon); sits collapsed 0–2/8, healed 2–6/8 (±2/8).
- If the paired deltas hold but an absolute band misses, the verdict follows the GO bar and the band miss is recorded as a finding (panel instrument vs doorwalk instrument disagree on magnitude), not a re-score.

## Proof

`scripts/test-flipsocial-b.js` proves: both `panel.json.gz` files exist and are valid panels (schemaVersion, identical options, expected row counts); the compare re-run through `lib/balance-scorecard.js` equals the recorded decision; the per-policy rows reproduce the control headlines within the tolerance above; the two panels' `registrationDigest` values agree (the overlay made the harness identical). Green on the branch tip.

## Sense-testing

Read at least one day-record per leg for sense: one seed's full sample series + events/endings from the panel rows (what the village looked like under the panel policies), plus one day-record from the committed doorwalk corpora (`perseed-healerctl-collapse-b/` / `perseed-healerctl-healed-b/`) for dialogue/coherence — the panel rows carry no dialogue transcripts. Panels are numbers; the evidence must say what the villages looked like.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — from the panel rows on both legs (both policies reported).

## Metric review (pre-registered note)

- The primary metric (per-policy sits + median survival) is the flip signature itself as the balanced instrument sees it under social/winseek play. The flippanel NO-GO already showed the flip does not survive the change of instrument under capable/risk-aware; these columns test whether it survives under social/winseek play. If the panel shows no flip while the doorwalk controls reproduce, the metric is not wrong — the instruments disagree, and the evidence must say which villages each instrument saw.
- The 2-policy cut (socialite + winseek, no capable/risk-aware re-run) stands as pre-registered. The capable/risk-aware columns are the flippanel record, not re-run here; this verdict claims only the socialite/winseek columns.
- The frozen-controller overlay trades endpoint-native scripts for one frozen harness. The verification above (byte-identical row-producing files) is what makes the trade honest; if the smoke shows the old game code misbehaving under the current harness, that is a finding, not a silent fix.
