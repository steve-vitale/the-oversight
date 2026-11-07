# sim-armorcap-b — armor-cap test re-baseline from a fresh field corpus (finding #1832)

Run: fleshout-loop-b-20261106T2300Z, arm sim-armorcap-b. Worktree
`~/workspace/worktrees/sim-armorcap-b`, branch `sim-armorcap-b`, base
`987766c0c` (local master at arm start). Test maintenance, **zero `src/js`**
(`git diff 987766c0c -- src/js/` is empty). No gate / price / deed change.

## Prereg

`evidence/2026-11-06/sim-armorcap-b-prereg.md` (committed `61480c01e`
BEFORE any judged run; one pre-corpus addendum clarifying zero-hit tank
batches, committed `5fd1ffb94`). Derivation rule, corpus protocol, green
bar, and stop rules are all in the prereg — this file judges against them.

## What was stale

`scripts/test-armor-cap-20261009.js` read **287 passed, 6 failed** on the
landed armor-retune tip (`ba6d89846`, K=20→6), reproduced verbatim at arm
start on base `987766c0c` (same 6 lines, 41s). Five failures were
PRE-EXISTING on master (old test file on master code: 290 passed, 5 failed):
unarmored-baseline bands hushwolf 7% not in [60,95], belltoad 0% not in
[10,30], bulldozer 0% not in [2,12], plus hide-strictly-better 0% vs 0%
(belltoad, bulldozer). P=0 paths cannot move under any K. The sixth
(bulldozer tank: 0 hits in 4 fights) was a brittle guard on a ~1-hit
sample. Full finding: sim-findings.md #1832.

## Fresh corpus (the instrument)

Driver `scripts/armorcap-corpus-20261106.js` — a line-for-line mirror of the
cap test's own harness (same script list, `Math.random` seeded BEFORE eval,
same `freshScholar` / `runPlayerFight` / `runTank` / Part 4 `fieldFight`),
parameterized only by SEED and the tank fight count (12, per the prereg).
Mirror fidelity verified: the corpus seed-`20261009` first-4 tank fights
reproduce the test's own numbers EXACTLY (hushwolf 31 hits, avg 10.1,
identical absorb list).

- Seeds (8): `20261009` (the test's own default — its run is one corpus
  batch), `7`, `424242`, `20261106`, `555`, `12345`, `999`, `31337`.
- Part 2: N=6 fights per (gear, monster) — 48 fights per cell.
- Part 2b tank: 12 fights per monster — 96 tank fights per monster.
- Part 4 characterization: 4+4 `fieldFight`s per seed.
- Output: `evidence/2026-11-06/perseed-armorcap-b/` — 8 per-seed JSONs +
  `armorcap-corpus-summary.json` (one driver bug found and fixed mid-run:
  `runTank` was called without `Game`, so the monster id landed in the
  `Game` param; fixed in `6d3f23d`, all 8 seeds re-collected after the fix).

Corpus results (unarmored batch-mean HP cost, %):

| monster | batch means (8 seeds) | mean | band (rule) | old band |
|---|---|---|---|---|
| hushwolf | 7, 14, 4.83, 2.17, 0, 7.67, 1.17, 11.67 | 6.06 | **[0,17]** | [60,95] |
| belltoad | 0 ×8 | 0 | **[0,10]** | [10,30] |
| bulldozer | 0, 0, 0.67, 0, 0, 0, 0, 0 | 0.08 | **[0,11]** | [2,12] |
| lockpick_raccoon | 0 ×8 | 0 | **[0,10]** | [0,10] |

Tank avg-absorbed (landed hits only; zero-hit batches excluded):

| monster | batches w/ hits | pooled mean | band (rule) |
|---|---|---|---|
| hushwolf | 8/8 (1113 hits) | 8.24 | **[6,11]** |
| belltoad | 7/8 (106 hits) | 10.49 | **[7,12]** |
| bulldozer | 4/8 (10 hits) | 12.10 | **[0,13]** |

Direction preservation (prereg stop rule): hushwolf pooled mean absorbed
8.24 > K=20 ref 6.2 ✓; belltoad 10.49 > K=20 ref 4 ✓. The re-baseline
preserves the retune's direction — it does not erase it. No leg hit the
stop rule, so no real regression was re-baselined away.

What the corpus says about the fights (characterization, not bands):
- Belltoad and bulldozer take 0% HP cost unarmored in 47–48 of 48 fights:
  the spear kills them in ~1–3 rounds before they act. Their unarmored
  bands are therefore [0,~10] — the bands now say "this monster barely
  touches an unarmored spear fighter", which is what the fights show.
- Bulldozer in tank mode: 10 hits in 96 fights. It almost never attacks a
  waiting player. The per-hit tank checks are vacuous for it by design now
  (see below), and its avg band [0,13] is wide because 4 hit-bearing
  batches include seed `999` (7 hits, mean 15.86).
- Belltoad tank hits are highly variable by seed (0–74 hits per 12 fights;
  seed `999` alone contributed 74 of 106 hits). The band [7,12] absorbs
  that spread via the 2-point margin floor.
- Hushwolf is the only monster that reliably fights back: 70–185 tank hits
  per 12 fights, mean absorbed 6.68–9.14 per batch — tight, informative.
- Part 4 (all 8 seeds, 32+32 fights): unarmored villager 32/32 `vFlee`,
  33.77 HP/round; hide-armored 32/32 `vKill`, 7.72 HP/round. The armor
  effect in the field is decisive and consistent across every seed.

## Changes to the cap test (`scripts/test-armor-cap-20261009.js`, test-only)

1. `expectBand`: hushwolf [60,95]→[0,17], belltoad [10,30]→[0,10],
   bulldozer [2,12]→[0,11], lockpick unchanged [0,10].
2. Hide-strictly-better check is now conditional: it applies only when the
   unarmored leg took damage (`un.avgC > 0`); otherwise the test logs a
   vacuous skip. 0%-vs-0% is no longer a failure — there is no armor effect
   to compare when the monster landed no hits.
3. Tank guard redesigned: 12 fights per monster (was 4); the per-hit
   checks (every absorbed < max hit, every absorbed >= 1) apply only when
   >= 3 hits landed, else a vacuous skip; the old `> 0 hits in 4 fights`
   check is deleted. New avg-absorbed check against the corpus-derived
   `TANK_AVG_BAND` (hushwolf [6,11], bulldozer [0,13], belltoad [7,12]),
   applied whenever any hit landed.
4. Kit-no-worse-than-hide, Part 1 formula checks, Part 3 party checks,
   Part 4 relational checks: unchanged.

## Proof

`scripts/test-armorcap-20261106.js` — **42 passed, 0 failed**. It
recomputes every band from the RAW per-seed corpus files by the prereg rule
(never trusting the summary — the summary is cross-checked instead),
asserts the test file's bands match the derivation exactly, asserts the
12-fight tank loop + conditional hide check + hit-count gate are present,
asserts direction preservation, and asserts the test's own default-seed
batch values fall inside the derived bands.

`scripts/test-armor-cap-20261009.js` — **291 passed, 0 failed** (was
287/6), run twice with identical output (deterministic at the default
seed, ~50s). Predicted values landed exactly: hushwolf tank 70 hits avg
9.1 ∈ [6,11]; bulldozer tank 1 hit [4], per-hit checks vacuous-skipped,
avg 4.0 ∈ [0,13]; belltoad tank 3 hits [6,9,11], avg 8.7 ∈ [7,12];
hushwolf unarmored 7% ∈ [0,17]; Part 4 unarmored 67 taken (33.4/round),
armored 74 (7.6/round).

`node scripts/check.js --only armor` — 5 passed, 1 failed:
`scripts/proof-armor-recruit-20261013.js` crashes at load with
`ReferenceError: Text is not defined` (its own harness lacks the `Text`
global at `genCharacter`). NOT attributable to this arm: zero `src/js`
files changed, and that script references none of the files this arm
touched. Pre-existing, unrelated — recorded here, not fixed (out of scope:
test maintenance on the cap test, not the recruit proof).

## Metric review (§14)

Judged only against the prereg. The derivation rule held as written — no
mid-run re-scoring. Two things the rule's author (this run) would flag for
the NEXT run, not this one:
- The 10-point margin floor dominates every unarmored band (2·SEM never
  exceeds it for these monsters). The bands are honest but loose for
  belltoad/bulldozer/lockpick ([0,10]/[0,11]/[0,10] say little more than
  "the monster rarely hurts you"). If a future lever needs those legs to
  discriminate, the margin floor should shrink only with a larger N per
  batch — not by hand.
- The bulldozer tank leg is effectively untestable through waiting: ~1 hit
  per 24 fights. The avg band [0,13] is a placeholder that a single hit
  almost always passes. A future run that wants a real bulldozer tank
  signal should change the protocol (e.g. a monster that is forced to
  attack, or a longer tank window), not the band.
- The proof script caught its own parser bug before the judged run (comma
  split inside band literals); fixed and re-run green. No band value
  changed as a result.

## Blanks filled / documented

- Filled: the cap test is green on current master with bands a later
  reader can re-derive from the corpus by the stated rule
  (finding #1832 → `fixed`).
- Documented (open, logged in sim-findings.md): bulldozer and belltoad
  almost never get to act against a spear fighter — their cap-test legs
  measure the spear's kill speed, not armor. If that is a balance problem
  rather than a test artifact, it belongs to a combat-pacing arm, not to
  this re-baseline.

## Rebase record

Arm base `987766c0c` → rebased onto explicit current master
`82e550626` (batch-ship version bump of `987766c0c`, no code change) before
finishing; 4 commits replayed clean, no conflicts. New tip `4228f6d1d`.
Proof re-run green on the rebased tip: `test-armorcap-20261106.js` 42/42,
`test-armor-cap-20261009.js` 291/0 (identical output).

## Scale-wall numbers (standing report)

Not a sim arm — no panel run. The re-baseline changes no game code, so no
wall movement is expected or claimed: national / table / wins unchanged by
this arm by construction.
