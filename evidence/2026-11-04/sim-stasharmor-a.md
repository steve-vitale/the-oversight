# sim-stasharmor-a — independent confirm of the vessel stash armor fetch

Run: oversight-flesh-out-loop, run fleshout-20261104T1015Z, axis
food-economy, arm sim-stasharmor-a. Worktree sim-stasharmor-a.
Game-code arm: NONE — see discovery below. Main tree never touched.
Sibling trees never touched. Nothing appended to sim-findings.md or
the convergence tracker in place (coordinator owns both; new findings
are listed at the end of this file for the coordinator to append).

## Discovery (before any judged sim): the arm was already landed

The assigned extension — vests/armor in the vessel's own stash
fetched and worn by the vessel — already exists in this branch's
ancestry as commit 3e94b55cc (Loop B arm sim-armorfetch-b,
evidence/2026-10-30/sim-armorfetch-b.md, GO 3/3 WORN): method
`Game.vesselArmorFetch()` + call site in `villagerBuildDay()` in
src/js/villager-build.js, own day flag `_armorFetchDay`, own-stash
only, nothing granted, wearing on the normal gearUp/UI path. This run
therefore did NOT re-implement it: a second copy would duplicate
landed work and risk a conflicting implementation. Instead this run
is an independent confirm of the landed code on the CURRENT tree,
against the prereg committed before any judged sim
(evidence/2026-11-04/sim-stasharmor-a-prereg.md, commit 1a6fbad75).
No game-code commit exists in this run, so no [needs-eyes] flag
applies to it (the flag rule covers game-code commits; the landed
armor commit already carried it).

## Verdict — GO (confirm): the landed armor fetch reproduces on the current tree

Prereg bar: WORN within 7 game days on >= 2/3 acceptance seeds
(16103, 16101, 16109), cost bar village-lost <= 2 and median
daysAlive >= 48 on band 16101–16116, horizon 60d death-aware,
substrate nighttravel + woodcarry, WOODWARM=0, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1. Instrument:
scripts/armorfetch-verdict-b.js (per-seed table, identical seeds).

| seed | spawn armor (current tree) | narration | stash-loss / kit / worn | verdict |
|------|---------------------------|-----------|-------------------------|---------|
| 16101 | bark_armor | day 1 | day 2 / day 2 / day 2 | WORN |
| 16103 | bloodplate | day 1 | day 2 / day 2 / day 2 | WORN |
| 16109 | (none — no stashed armor spawns) | weapon line only | — | NO-SPAWN (untestable, not a miss) |

Acceptance: 2/3 WORN, meeting the >= 2/3 bar exactly, with the third
seed untestable rather than failing — intervening landings changed
spawn generation (16103's swat_vest is now a bloodplate; 16109's
farstrider_boots no longer spawn at all). The mechanism claim does
not rest on that one seed: the full band is 15/15 WORN wherever spawn
armor exists (pilot 16101–16108: 8/8; confirm 16109–16116: 7/7 plus
16109 no-spawn), every case day-1 narration, day-2 wear.

Cost bar: village-lost 2/16 (16113 day 22, 16115 day 36) — at, not
over, the <= 2 bound; median daysAlive 60 — above the >= 48 bound.
HOLDS on both legs. Wins are not recorded by this driver (it records
survived/village-lost only); max wave reached is 4 on 6/16 seeds
(16104, 16107, 16108, 16109, 16111, 16116) versus armorfetch-b's max
wave 3 — a wall observation about the current tree after five days
of other landings, NOT an effect of this run, which changed no game
code. The scale wall itself is unchanged in kind: national/table
reach were not re-read here and no win is claimed.

## Before/after (identical seeds)

There is no new before/after in this run because there is no new
code: the before-leg is armorfetch-b's (pre-armor code: stashed armor
NEVER entered the kit within 7 days on any acceptance seed, 0/3),
and the after-leg is reproduced twice over here — once live by the
verdict driver (15/15 WORN) and once from the banked corpus below.
The balanced panel (§15) was not re-run as judge, as stated in the
prereg: armorfetch-b already ran a fresh before/after panel on this
band (review_required, NO regression_signal), and a confirm of an
already-paneled change is judged by its prereg bar on identical
seeds. The panel tier-3+ watch (0.5 -> 0.3125, regression_watch,
interval includes 0) is carried forward unchanged, not re-litigated.

## Corpus banked (fills armorfetch-b's documented gap)

armorfetch-b's recorder corpus was lost to the container EPERM flap
(0-byte files, deleted). This run re-ran scripts/armorfetch-trace-b.js
on the healthy container: 16 valid non-zero JSONs committed under
evidence/2026-11-04/sim-stasharmor-a-corpus/. New item-agnostic
analyzer scripts/analyze-stasharmor-a.js reads that corpus: 15/15
WORN, 1 no-spawn seed, band lost 2, median 60, max wave 4 — matching
the verdict driver exactly, from independent files.

## Proof

- scripts/test-armorfetch-b.js: Parts A+B 38/38 GREEN (unchanged
  behavior: wiring, own day flag, weapon flag untouched, haven gate,
  11 live-harness fixtures incl. gain ordering, away-blocks,
  one-per-day, no-duplicate, weapon fetch unaffected same day).
- Same test with the new corpus as Part C input: 40/41 — C2 and C3
  cost bars PASS; C1 FAILS on a stale-item artifact, stated not
  hidden: Part C hard-codes armorfetch-b's spawn items (swat_vest on
  16103, farstrider_boots on 16109), which no longer spawn, so it
  reads NO-SPAWN where the item-agnostic analyzer reads WORN
  (bloodplate) and NO-SPAWN-ARMOR respectively. The old test's
  acceptance map needs its item names refreshed to current spawns;
  that is a test-maintenance finding (below), not a game regression
  — no game code changed in this run, and the verdict driver +
  corpus analyzer agree 15/15.
- Instrument anomaly, investigated: the first 8-seed confirm batch
  invocation exited 1 in ~3s with an empty redirected log; every
  per-seed re-run of the same driver then succeeded (16109 single,
  then 16110–16116 in sequence). No game failure is evidenced — the
  batch invocation itself died before producing output. Judged
  numbers come from the successful per-seed runs, which cover all 8
  confirm seeds.
- check.js --only armorfetch matched 0 scripts (the filter does not
  match these test filenames); the direct proof-test runs above are
  the gate for this run, and no src file changed, so no new check
  surface exists. Full check.js was not re-run: it is a ~8-minute
  suite whose failures on this tree are pre-existing per prior arms,
  and this run's footprint is scripts + evidence only.

## Sense-test (law — read, judged for meaning)

16103, day 1, paired lines in the same first-person voice: "You
remember the Crowbar at your space in the haven and fetch it — it
rides in your pack now." / "You remember the Bloodplate at your
space in the haven and fetch it — it rides in your pack now." Day 2
both are worn by the normal path. That reads as a person collecting
their own things from their own space on the first night — the
absurdity stashfetch named (a vest sitting beside a hatchet, never
moving) is closed on the current tree for whatever armor the vessel
actually owns. The back-to-back "remember the X... remember the Y..."
patness armorfetch-b noted is still there; still not a GO blocker,
still noted, not chased. PASS.

## Village assessment (plain words)

Nothing in the village changed because of this run — and that is the
point. The village looks the same as armorfetch-b left it: people who
own armor put it on on the second morning instead of never, on every
seed where they own any. The blank this arm was assigned is already
filled and still filled; this run's contribution is proving it again
on today's tree and banking the corpus the original run could not.
No other blank was chased mid-run.

## Metric review

The prereg bar bound the run and was met with no re-scoring: 2/3
WORN meets >= 2/3 outright, so the FETCHED fallback was never
invoked, and the cost bar held on both legs. One metric revision for
the NEXT run, not applied here: acceptance seeds should be defined
by mechanism ("whatever armor spawns in the vessel's stash") rather
than by hard-coded item names — spawn generation drifts with other
landings, and hard-coded items turn a confirm into a spawn audit
(Part C's C1 artifact above is the demonstration). The 7-day window
remains generous (everything lands day 1–2).

## Blanks filled / documented

- CONFIRMED (no new code): vessel armor-fetch — the stashfetch
  follow-up blank, landed by sim-armorfetch-b, still working 15/15
  on the current tree.
- BANKED: armorfetch-b's lost recorder corpus, re-run (16 seeds).
- DOCUMENTED (for the coordinator backlog, not edited in place):
  (1) test-armorfetch-b.js Part C acceptance map is stale — its
  hard-coded items (swat_vest/16103, farstrider_boots/16109) no
  longer spawn; refresh the map or make it item-agnostic before the
  next confirm, or C1 will false-fail again. (2) Spawn generation
  drift: 16103 swat_vest -> bloodplate, 16109 farstrider_boots ->
  no armor; if a future arm depends on specific spawn items, it
  should re-probe spawns first (scripts/probe-armorfetch-spawn.js
  exists). (3) The panel tier-3+ watch from armorfetch-b
  (0.5 -> 0.3125, regression_watch) is still un-rechecked — a future
  panel, not this confirm, should close it. (4) The 8-seed batch
  verdict-driver invocation that died fast with exit 1 and no
  output (see Proof) — worth one retry observation if it recurs;
  per-seed runs are the workaround.

## Wall numbers (this band, current tree, no code changed)

Recorder band (60d, 16 seeds): village-lost 2/16, median survival
60d (capped), max wave 4 (6/16 seeds), never 5. National / table /
wins not re-read in this driver. Same wall in kind as armorfetch-b,
with wave 4 now appearing in this substrate — attributable to
intervening landings, not to this confirm.
