# Standing regional+ filter (sim-standfilter) — 2026-10-14

## PRE-REGISTRATION (§§9–12, 14 — binding)

- **Arm**: implement the regional+ filter on the Standing bar's diplomacy feed (sim-findings #85: spec says "+34 per seasoned regional+ link", `src/js/standing.js` `villageStanding()` counted ALL seasoned links).
- **Design call** (Steve 2026-10-07 make-the-call rule — he can overrule): a seasoned link is REGIONAL+ iff it participates in a regional-scale polity, read from existing APIs only (no new tracking):
  - LEAD: one of Haven's seasoned subordinate links AND `polityOf('haven')` exists (≥3 seasoned subordinates = a realm). Keeps the spec's "3 links = 102: the pure DIPLOMACY path" honest.
  - BELONG: Haven subordinate AND `polityOf(primary)` exists (primary's realm ≥4 villages).
  - LEAGUE: seasoned covenant/trade peer link inside its league polity (`_covenantPolity()`/`_tradePolity()` non-null, link among member links).
  - A lone seasoned bond with a splinter village (a pact of 1–2, no polity) is courtship, not regional power — scores 0. Fail-closed (missing APIs / errors = not regional+).
- **Primary metric**: wave-4 unlock rate on the identical 32-run tuning sweep (seeds 11/22/33/44/55/66/77/88 × competent/winseek/belongseek/leadcourt, 150d death-aware, gates off; `scripts/sweep-standing-tune-20261013.js`).
- **GO**: (1) implementation matches spec exactly — proof test RED→GREEN on pristine vs fixed code; (2) unlock rate stays in the 0.30–0.50 band.
- **Guardrail**: no regression >10pp below the before-side on identical seeds (before-side 5/14 = 0.357, evidence/2026-10-13/sim-standing-tune.md).
- **If filter drops rate < 0.30**: authorized ONE weight re-tune round (spec numbers are starting points, not canon) — regional+ per-link weight upward only, minimum restoring the band. If still out of band → KILL: revert standing.js, leave no trace.
- **Horizon**: 150d death-aware (matches the tuning suite). **Seeds**: 32 (8×4 policies).

## What was built

`src/js/standing.js` (ONLY game-code file touched):
- New `Game._linkRegionalPlus(l)` implementing the three-branch rule above; all reads through existing `polityOf` / `_covenantPolity` / `_tradePolity` / `_linkSeasoned`.
- `villageStanding()` diplomacy loop: `if (seasoned && this._linkRegionalPlus(l)) links++` (was `if (seasoned) links++`).
- `@ontology` header: added `_linkRegionalPlus()` to provides + `standing_regional_plus` rule.
- `scripts/test-standing-regional-filter-20261014.js`: 18-assertion proof — RED-verified on pristine code (4 filter assertions FAILED: lone link, 2-link pact, belong-to-splinter, 2-covenant pact all counted), GREEN after (18/18). Also asserts: 3-link realm = 102, 4th realm link counts, belong-to-regional-fire counts, league counts, unseasoned never counts, waves 1–3 behavior unchanged, war path still unlocks wave 4, wave 5 still needs w4 faced, day-90 win floor intact (89→false, 90→true), weights unchanged (34/link).
- `scripts/validate-ontology.js`: 94/94 systems green.

## Measurement: identical 32-run sweep, after-side

`(a)` **Wave-4 unlock rate (day80+): 0.364 (4/11) — IN BAND (0.30–0.50).** Before-side 0.357 (5/14). Delta +0.7pp → **guardrail clean** (no >10pp regression). No re-tune round needed → **GO, no kill.**

`(b)` Earliest T4 day: **57** (median 58). Before-side: 57 (median 57). Unchanged — the 3-links-season-at-30d seasoning clock still sets timing.

`(c)` Drivers: **diplomacy 4** (before: diplomacy 6, war 1). All 4 after-side unlocks are `[w0 l3 f0]` — 3 realm links = 102, the spec's pure-DIPLOMACY path, preserved exactly by the filter. The driver-count change is trajectory noise, not the filter (see trajectory caveat).

`(d)` Unlocks before day 45: **none.** No speedrun smell.

Wall numbers: national 0/32, table 0/32, won 0/32, wave5ever 0, median survival 46d (before: 71d), exiled 0/32.

## The filter on real trajectories (audited)

- Every run that formed a 3-link realm unlocked at d57–58 with diplomacy 102 — the filter never blocked a real diplomacy path.
- Two single-link counts survived the filter and both audit as legitimate BELONG-to-regional-fire cases: winseek/s88 (Haven subordinate to village_0, whose foreign realm holds 4 villages) and belongseek/s44 (Haven subordinate to a *splinter village that grew into a foreign-realm primary* — emergent validation of the design call).
- Three unseasoned covenant links (trust 26) correctly scored 0.
- leadcourt/s44: realm dissolved after unlocking (end diplomacy 0) — links break, standing falls; honest.

## Trajectory caveat (sibling confound, not arm noise)

Before-side was measured at e7c18b85 (2026-10-13); this run's base is 54a29088 — sibling commits landed between (notably the 2026-10-14 spoilsmoke-laundering fix, worth ~52k phantom kcal on long trajectories). Median survival 71d → 46d; identical seeds diverged hard (e.g. leadcourt/s22 d104 → d45). Fewer day80+ runs (11 vs 14) explains the driver-count drop (the before-side war unlock competent/s22 d125 died d37 here). The primary metric and guardrail are trajectory-robust by construction (rate on day80+ runs), and the filter's own behavior is proven by the 18/18 proof + the per-run audits. A same-base before/after re-run would isolate the filter's pure effect, but the kill/GO decision is already unambiguous.

## Village assessment

The villages in this sweep died younger (spoilsmoke fix bit) — median 46d, mostly starvation/combat attrition on the 150d horizon. The diplomacy road still reads as the working path: leadcourt proposals at ~d27, seasoning at 30d, T4 at d57–58 when the realm holds. Lone bonds (1–2 links, no polity) no longer inflate Standing — on winseek/s88 the single counted link was a real belong-to-a-realm bond, which is exactly the fiction ("you've been noticed" by a regional power, not by a pen-pal). Villagers acted like people throughout (courtship beats, tends, tribute friction all present in trajectories); nothing robotic flagged in this sweep's scope.

## Blanks filled / documented

- **Filled**: finding #85 — spec/implementation discrepancy resolved per spec with a documented design call. marked [fixed] in sim-findings.md.
- **Documented**: the before/after trajectory divergence from sibling mortality fixes — future tuning comparisons on this suite should re-baseline on the same base commit (note for the coordinator: the standing-tune before-side predates the spoilsmoke fix).

## Metric review (§14)

Pre-registered metrics bound the run: GO required (1) spec-exact implementation (proof) and (2) unlock rate in 0.30–0.50. Measured 0.364 — GO, no re-scoring, no revision. Guardrail (no >10pp regression vs 0.357) passed at +0.7pp. The one-sided re-tune authorization was not exercised (rate never left the band). No metric was moved mid-run. Open methodological note for the NEXT run (not this one): pin the before-side base commit when sibling mortality work lands mid-cycle, so identical-seed comparisons stay clean.

## Files

- `scripts/test-standing-regional-filter-20261014.js` — proof (18/18 RED→GREEN)
- `src/js/standing.js` — the filter (+ `_linkRegionalPlus`, ontology rule)
- `evidence/2026-10-14/sim-standfilter-tune.json` — 32 per-run after-side rows
- `evidence/2026-10-14/sim-standfilter.md` — this file

**Verdict: GO — landed, merged locally pending ship.**
