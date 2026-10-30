# sim-titanexcl-a — castMonster titan exclusion (GO)

Run: flesh-out loop, run fleshout-20261030T1924Z, worker sim-titanexcl-a
(Loop A). Axis: scale-onramp (blocking axis, converging, NOT converged).
Backlog #1550 (claimed by this run) + evidence/2026-10-30/sim-muster-a.md
(layer three: a cast-sourced Herald face survives its muster-gate refusal
as a pending encounter and re-faces the same day).

ONE game-code change, one function: src/js/game.js castMonster now
excludes titan monster ids from its pool (every titans.json key minus
`_` entries, plus every def's `.monster` value — the_network's monster
is network_heart, wave 6, never unlocked, but the superset is the honest
complete titan set). Read from `this.data.titans` inline, so the fix does
not depend on titans.js load order or Game.isTitan. NOT a gating change:
monsterWavePool, titans.js gate logic, and the muster UI verbs
(soundTitanCall / titanCommitOwn) are untouched, per the gating freeze.
No [needs-eyes]: a pool-exclusion parity fix changes no feel, combat
tuning, or UI surface a player should playtest.

## Verdict: GO

Every pre-registered leg passes against
evidence/2026-10-30/sim-titanexcl-a-prereg.md (committed before any sims,
960a28312):

| Leg | Bar | Result |
|---|---|---|
| F1 pilot gate | Control wave-4 titan draws > 0 (leak demonstrates) | PASS — 125/2000 Herald |
| F1 GO | Armed titan = 0 at wave 4 AND wave 5, pool still casts | PASS — 0/2000 both waves, non-titan draws 2000/2000 |
| F2 feast channel | Armed titan draws = 0; control >= 1 (channel proven) | PASS — control 29/500 Herald, armed 0/500 |
| S sense | Before transcript shows the nonsense; after shows no titan face | PASS — chains below |
| W guard (pilot) | Armed deaths <= control x 1.10 AND median survival >= control - 15d | PASS — identical: 255 = 255 deaths, median 131d = 131d (pilot convention) |
| W guard (confirm) | Same guard on 16 seeds | PASS — identical: 551 = 551 deaths, median 136d = 136d |
| Panel (§15) | Compare .md attached; prereg threshold judges | PASS — every measured paired delta exactly 0 (see below) |
| Fixtures | scripts/test-titanexcl-a.js green | PASS — exit 0, TITANEXCL PASS (seed 4242) |
| Scope | No gate/muster-verb change | PASS — diff touches castMonster only |

## Before/after numbers (identical seeds, same base)

### Fixture (scripts/test-titanexcl-a.js, seed 4242, stubbed wave input — disclosed in the test)

| Measure | Control (pre-fix) | Armed (post-fix) |
|---|---|---|
| castMonster wave 4, 2000 draws, titan | 125 (all Herald, 6.25% — matches 60% newest-wave x 1/10 pool share) | 0 |
| castMonster wave 5, 2000 draws, titan | 256 (Nielsen 100, Herald 46, Finale 110) | 0 |
| castMonster natural wave 1, 2000 draws, titan | 0 | 0 |
| Feast draws wave 4, 500 draws, titan | 29 (all Herald) | 0 |

### Wild sweep (scripts/sweep-titanexcl-a.js, 180d death-aware, tableseat-nowait policy + titancast recorder, seeds 75131–75146)

| Measure (16 seeds) | Control | Armed |
|---|---|---|
| Wins | 9 | 9 |
| National ever / final | 16 / 11 | 16 / 11 |
| Table reached / entered | 11 / 9 | 11 / 9 |
| Wave 4+ reached / wave 5 reached | 13 / 0 | 13 / 0 |
| Median survival / max days | 136d / 180d | 136d / 180d |
| Total deaths | 551 | 551 |
| Wild castMonster titan / casts | 0 / 53 | 0 / 53 |
| Wild feast titan draws / draws | 0 / 37 | 0 / 37 |
| Pending titan-face episodes | 0 | 0 |
| Per-seed rows identical control vs armed | — | 16/16 identical (every field) |

Pilot band alone (75131–75138): wins 5, national ever 8, table 6,
wave 4+ 7, deaths 255, median 131d — identical both legs. Confirm band
(75139–75146): wins 4, national ever 8, table 5, wave 4+ 6, deaths 296 —
identical both legs.

Why the wild leg shows 0 titans on BOTH sides and still supports GO:
castMonster fires rarely in the wild (53 casts across 16 seeds x 180d —
wanderer casts only), and at ~6% titan share the expected wild titan
count is ~3 spread over both legs; 0 observed is unremarkable. The wild
leg was pre-registered as a GUARD, never the judge — the fixture legs
judge, and they show the leak at 125/2000 and 256/2000 before, 0 after.
This is the muster-a lesson applied: never pass by absence, and never
fail by absence either.

### Wall numbers (16-seed combined, both legs identical)

national ever 16/16, national final 11/16, table reached 11/16, table
entered 9/16, wins 9/16, wave 4+ reached 13/16, wave 5 reached 0/16,
median survival 136d, max 180d, total deaths 551. Note for the wall:
this band's policy (tableseat-nowait / leanlinkrescue courtship) reaches
national and the table far more readily than the competent-policy bands
in older wall reports — the wall numbers here describe THIS policy's
population, not a competent-policy wall update. Wave 5 stays unreached
on all 16 seeds in both legs; the full seat remains unwon in this band's
terms (wins here are the table's lesser-seat / over-other endings — see
per-seed endReason values in the corpus).

### Balanced panel (§15, instrument; prereg threshold judges)

evidence/2026-10-30/titanexcl-panel.{md,json,json.gz} (+ before/after
.json.gz), built by scripts/build-titanexcl-panels.js from the paired
16-seed sweep rows. Every measured paired delta is exactly 0 (win rate
0.5625 = 0.5625, national 1 = 1, table entry 0.5625 = 0.5625, player
deaths/run 4.6875 = 4.6875, village deaths/run 29.75 = 29.75, all other
measured metrics likewise 0-delta, 16/16 pairs). The scorecard's top
decision reads `review_required` because the panel is screen-sized
(`confirmationSized: false`), NOT because any metric moved — no metric
shows a material signal. Unmeasured contract metrics read `unknown`
(not_observed), never invented.

## Sense transcripts (SENSE-TESTING LAW — read, not counted)

BEFORE (control fixture, seed 4242, draw #46 at stubbed wave 4) — the
feast draw deals the Herald and narrates a coalition-only titan as a
hungry scavenger:

> 🌙 The cookfire's smell carried further than the laughter did — smoke
> and grease on the night wind. The sky, with a face in it is circling
> the edge of the light. It followed the feast here. (A scavenger, drawn
> by the feast. Face it while the feast is in you — or let the watch
> drive it off.)

Facing it through faceFeastDraw -> startCombat gives the muster-gate
refusal, and the pending encounter SURVIVES the refusal:

> ⛔ THE HERALD does not notice you the way prey notices a hunter. It
> notices you the way weather notices a field. You cannot face this
> alone — sound the call, muster 10 allied blades (you have 0). This is
> not courage. This is arithmetic.

Post-face state: pendingEncounter=true, pendingMonsterId='herald',
feastDraw marker deleted. The beast is still waiting; the refusal
answered nothing and cleared nothing. That is the #1550 re-face chain,
reproduced end to end in the fixture — a titan that should only ever
arrive by omen, met as if it had followed the smell of dinner, refused
for want of an army, and left standing at the edge of the light.

AFTER (armed fixture, same seed): 500 feast draws, zero titans. The
first draw narrates a beast the narration fits:

> 🌙 The cookfire's smell carried further than the laughter did — smoke
> and grease on the night wind. A toad like a war drum, throat swelling
> is circling the edge of the light. It followed the feast here. (A
> scavenger, drawn by the feast. Face it while the feast is in you — or
> let the watch drive it off.)

A belltoad following a feast is a story that makes sense. A sky with a
face in it following a feast never did. The fix restores the narration's
honesty, not just the pool's arithmetic.

## What the village looked like (plain words)

Across 16 seeds on this policy, villages climb: every one reaches
national standing at some point, most sit at the table, just over half
win their ending. They live a median 136 days inside a 180-day horizon —
these are not starving villages; they are villages with enough surplus
to court, feast, and travel. Wave 4 is common ground here (13/16), wave 5
never arrives (0/16), so the cast pool's titan leak is a wave-4 story in
practice: the Herald, and only the Herald, is the titan a feast or a
wanderer could actually deal in this band. The fix changes nothing about
how these villages live day to day — identical trajectories prove it —
and removes exactly one absurdity: the sky showing up for scraps.

## Blanks filled / documented

- FILLED: castMonster titan leak (#1550's ranked-next arm). Titans now
  reach the player only by omen, as titans.js already promises for the
  wandering pool. The refused-pending survival itself is NOT fixed and
  is NOT claimed fixed: a titan faced through a legitimate omen path and
  refused still leaves its pending encounter set (out of scope under the
  gating freeze; a future arm may take the gate-clearing question with
  its own prereg).
- DOCUMENTED: wild cast volume is tiny (53 casts / 16 seeds / 180d), so
  future cast-pool arms must judge on fixtures, not wild counts.
- DOCUMENTED: monsterWavePool's titan wrapper filters def KEYS only, so
  network_heart (the_network's monster, wave 6) is not filtered there —
  moot today (unlockedWave caps at 5) and covered by this fix's superset
  on the cast side; noted, not changed (out of scope).

## Metric review

- The prereg's fixture-first design held up: the wild leg contributed
  nothing discriminating (0/53 casts both legs) and would have produced
  a false KILL or a false pass if judged. Future cast-pool arms should
  keep the fixture as primary and the sweep as guard — no revision
  needed, just the same shape.
- The sweep's `ms` per-seed timing field is garbage (negative values on
  some seeds — the VM clock jumped mid-run); it is not a judged metric
  and is ignored. Per-seed outcome rows are unaffected (byte-identical
  across legs, which a clock jump cannot produce by accident).
- Panel `review_required` is a sizing label (confirmationSized: false),
  not a signal: all deltas are exactly 0. No threshold revision proposed.

## Files (all committed in this worktree; coordinator merges)

- src/js/game.js — castMonster titan exclusion (the fix)
- scripts/test-titanexcl-a.js — F1/F2/S proof test (green, seed 4242)
- scripts/policies/titancast-diag.js — record-only wild recorder
- scripts/sweep-titanexcl-a.js — wild sweep (pilot + confirm)
- scripts/build-titanexcl-panels.js — §15 panel builder
- evidence/2026-10-30/sim-titanexcl-a-prereg.md (committed before sims)
- evidence/2026-10-30/sim-titanexcl-a.md (this file)
- evidence/2026-10-30/perseed-titanexcl-a-control/s75131–s75146.json
- evidence/2026-10-30/perseed-titanexcl-a-armed/s75131–s75146.json
- evidence/2026-10-30/titanexcl-panel.{md,json,json.gz} + -before/-after.json.gz

Check status: node scripts/check.js --quick — 284 passed, 6 failed
(743s). The 6 are NOT from this arm: targeted subsets on the ARMED tree
(titan 9/9 pass, feast 8/8 pass) and the SAME subsets on PRISTINE game.js
(fix reverted) fail identically — monster 9 break-it tests (20261008/09,
incl. a `Text is not defined` harness failure), wave test-blitz-wave35,
cast test-broadcast-20261009. Pristine monster run additionally timed out
test-monster-math-r1 (121s, exit null) where the armed run passed it in
56s — timing flake, favorable direction. No failure is attributable to
the castMonster filter. Side effect noted: check.js --quick refreshed one
line of docs/ONTOLOGY.md (vesselArmorFetch, a sibling feature's stale
doc line); reverted — not this arm's work, not committed.
