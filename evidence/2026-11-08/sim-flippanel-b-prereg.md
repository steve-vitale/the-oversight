# sim-flippanel-b — prereg (BINDING)

**Arm:** sim-flippanel-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1630Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (2) — "a real §15 panel verdict on the flip is still owed" (2026-11-08 1030Z review) · **Branch:** sim-flippanel-b, cut at master `6680d7924` · **Base for panels:** endpoint SHAs extracted read-only, never checked out in the worktree.

## The question

Do REAL §15 balanced panels (not the sweep-corpus screen) confirm the flip between the collapsed tip `cf22937b8` and the healed tip `c9fea16ee` on the frozen band? The 1030Z round's panel attempt was a sweep-corpus compare only (`balance-panel.js compare` cannot read doorwalk corpus directories; its `review_required` is NOT a panel verdict). This arm builds the two real panels and runs the compare to a verdict.

## Endpoints, seeds, horizon, policies

- **BEFORE (collapsed):** `cf22937b8` — healerbisect collapsed control: median **70.5d**, sits **0/8** (full-8, doorwalk baseline leg).
- **AFTER (healed):** `c9fea16ee` — healerbisect healed control: median **145d**, sits **4/8** (full-8, doorwalk baseline leg).
- **Seeds:** 53001–53008, FROZEN, deliberately reused — the flip contrast is defined on this band by the healerbisect controls. 8, not 16: the flip is a large-effect verification on a frozen band, not a small-effect claim (§15's 16/64 sizing is for small effects); the run window cannot fit 16-seed × 2-leg panels before the 19:00Z closeout bound.
- **Horizon:** 150d, death-aware. The flip was defined on the frozen band at 150d; the panel's death-aware stop rule matches.
- **Policies:** `capable,risk-aware` — TWO policies, not four. Cut declared BEFORE any judged leg: box load 14–17 at run start, `git archive` alone costs ~7 min per tree, closeout must finish by ~19:00Z; a 4-policy build (36 jobs/leg) cannot fit with extraction + smoke + compare + closeout. The 2-policy minimum (capable + risk-aware) matches the fightloop precedent. `socialite` and `winseek` are NOT run this run; their columns are owed by a follow-up, not faked here.

## Method (real panels, not corpus conversion)

- Each endpoint is extracted as a FULL tree with `git archive` into `scratch-flippanel/extract-before` / `extract-after` (untracked scratch, deleted before the final commit). `evidence/` is excluded from the extraction only — no panel-loaded code lives there; src/ and scripts/ are extracted whole (0730Z lesson: never a selective file list). Extraction verified by file count + `src/js/game.js` hash vs the endpoint.
- **Frozen-controller overlay (SIMULATING.md, "Freeze the same current scripts/controller/harness tree over both game roots"; MEASUREMENT.md §15: "Overlay the same current controller/harness on both Game roots"):** the worktree tip's `scripts/` tree (`6680d7924`) is overlaid onto BOTH extractions before any panel runs, so the only difference between the legs is `src/` (the intervention). Justification, verified before any judged leg:
  - The four panel policies (`capable`, `risk-aware`, `socialite`, `winseek`) and `scripts/sim-harness.js` are byte-identical across `cf22937b8`, `c9fea16ee`, and the worktree tip (0-line diffs both ranges) — the overlay cannot change any row-producing code.
  - The only manifest-relevant `scripts/` differences between the endpoints are: registration-only `sweep-compare.js` churn (three added registrations for policies outside the panel set — tolerated by the registrationDigest repair, d938321b8), pure policy-file additions (tolerated), and ONE modified policy file `scripts/policies/scalecourt-nogate-morntrace3-linkraise.js` (a read-only transcript-recording change, unused by any panel policy) — which the compare-contract does NOT tolerate and would return `invalid` on the as-is roots. The overlay neutralizes all three without touching row-producing code.
  - The observer (`balance-panel.js`, `gear-usage-audit.js`, `lib/*`, `balance-metrics.json`) is the worktree's on both legs by construction (the tool reads its own files), so `observerDigest`/`contractDigest` agree.
- Panel build per leg: `node scripts/balance-panel.js --root <extracted-tree> --out evidence/2026-11-08/panel-flippanel-b/<before|after> --seeds 53001,53002,53003,53004,53005,53006,53007,53008 --policies capable,risk-aware --days 150` (run from the worktree, so the worktree's panel tool + observer apply to both legs). The `cases/` cache is NOT committed (§15: panel summary only — `panel.json.gz` + compare `.md`/`.json`).
- Compare: `node scripts/balance-panel.js compare --before <before-panel.json.gz> --after <after-panel.json.gz> --out evidence/2026-11-08/panel-flippanel-b/compare`. COMPARE-CONTRACT: both panels must carry identical `options.policies` (they do — same invocation). If the compare returns `invalid`, READ the reason before re-running; never re-run blind and never fake a verdict.
- **Smoke first:** ONE seed (53001) × `capable` per leg, timing + instrument check only (not a judged leg). Gate: if either smoke case exceeds 4 min, the run falls back to the before-leg + written handoff path in the task brief (prereg amended to record that before any judged leg) rather than leaving uncommitted partial panels.
- If you patch an extracted tree, use `patch -p1`, NEVER `git apply` (it silently skips patches on an extracted tree inside a worktree, exit 0, nothing changes).
- Optional diagnostic middle leg #15 (`e6ddaf32a`, specialist first rung 10→5 XP) ONLY if time remains after the primary verdict. It is diagnostic, never part of the primary verdict.

## Primary metric + GO bar (binding)

- **Primary metric:** paired table-sitting rate + median survival **on the capable leg** — the wall metrics the flip moved. Sitting rate is the panel `table` metric (seat taken, ruling 665); median survival is computed from the 8 capable panel rows' `gameDays` (the contract carries no median-survival metric; the computation is stated here, before any numbers).
- **GO iff ALL of:** (a) the compare returns a valid decision (not `invalid`); (b) on the capable leg, healed table-sitting rate ≥ collapsed; (c) on the capable leg, healed median survival ≥ collapsed; (d) NO `regression_signal` or `regression_watch` status on `villageDeaths` or `playerDeaths` in ANY policy.
- **Vocabulary note (pinned):** the compare tool emits only `no_material_signal`, `review_required`, `invalid` — there is no `go` decision. Improvements on directional metrics correctly read `no_material_signal` (only regressions and neutral-metric `won` moves trigger review), so `no_material_signal` with (b)–(d) holding IS a GO. `review_required` driven by a `won` move or another non-guardrail metric is a GO if (b)–(d) hold, recorded as an investigation note. `review_required` driven by a death-guardrail regression is NO-GO. `no_material_signal` with sits or median regressed on the capable leg is NO-GO. `invalid` is NO-GO with cause (instrument failure, not a game verdict).
- Anything else is NO-GO — a miss is NO-GO, never re-scored against a friendlier metric mid-run. If the metric proves wrong, write it under "metric review" and propose the revision for the NEXT run.

## Sits-bar pin (the 2026-11-08 1030Z ambiguity)

The analyzer reads COLLAPSED as sits ≤1/8; the healerbisect prereg text reads ≤2/8. **The analyzer's ≤1/8 bar binds** for any COLLAPSED/HEALED classification in this run (the instrument's own classification is the operative one). Both bars agree on both endpoints anyway (collapsed 0/8, healed 4/8), so the pin changes nothing for this verdict; it binds only so a future in-between leg is classified one way.

## Endpoint-reproduction tolerance (proof)

The panel uses different policies than the doorwalk baseline leg, so exact reproduction is NOT expected — the check is directional, on the capable leg:
- Paired delta healed − collapsed must be positive on BOTH sits (≥ +2/8) and median survival (≥ +30d).
- Absolute sanity bands: collapsed capable median 40–100d (control 70.5d ±30d), healed capable median 115–150d (control 145d, capped at horizon); sits collapsed 0–2/8, healed 2–6/8 (±2/8).
- If the paired deltas hold but an absolute band misses, the verdict follows the GO bar and the band miss is recorded as a finding (panel instrument vs doorwalk instrument disagree on magnitude), not a re-score.

## Proof

`scripts/test-flippanel-b.js` proves: both `panel.json.gz` files exist and are valid panels (schemaVersion, identical options, expected row counts); the compare re-run through `lib/balance-scorecard.js` equals the recorded decision; the capable-leg rows reproduce the control headlines within the tolerance above; the two panels' `registrationDigest` values agree (the overlay made the harness identical). Green on the branch tip.

## Sense-testing

Read at least one day-record per leg for sense: one seed's full sample series + events/endings from the panel rows (what the village looked like under the panel policies), plus one day-record from the committed doorwalk corpora (`perseed-healerctl-collapse-b/` / `perseed-healerctl-healed-b/`) for dialogue/coherence — the panel rows carry no dialogue transcripts. Panels are numbers; the evidence must say what the villages looked like.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — from the panel rows on both legs (capable leg primary, risk-aware supporting).

## Metric review (pre-registered note)

- The primary metric (capable-leg sits + median survival) is the flip signature itself as the balanced instrument sees it; the doorwalk controls are the reproduction anchor, not the judge. If the panel's capable leg shows no flip while the doorwalk controls reproduce, the metric is not wrong — the instruments disagree, and the evidence must say which villages each instrument saw.
- The 2-policy cut trades the socialite/winse ek columns for a fittable run inside the closeout bound. It does not weaken the primary metric (capable leg) or the death guardrails (both policies). A follow-up run may add the two columns; this verdict does not claim them.
- The frozen-controller overlay trades endpoint-native scripts for one frozen harness. The verification above (byte-identical row-producing files) is what makes the trade honest; if the smoke shows the old game code misbehaving under the current harness, that is a finding, not a silent fix.
