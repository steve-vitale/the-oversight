# sim-strikefall-a — strike-after-fall ordering (#2303) + square screams twice (#2304)

Run: fleshout-20261113T1615Z (Loop A), arm sim-strikefall-a
Axis: scale-onramp (sim-findings.md #2303 + #2304, claimed by this run)
Branch: sim-strikefall-a — worktree ~/workspace/worktrees/sim-strikefall-a
Base: master 48ed1ffd753a142286e99201d68124d9aaa0de3f (rebased cleanly at arm start)
Date: 2026-11-13
Coordinator: adoption (worker done; evidence file, gate, rebase and merge are the adoption coordinator's).

## Verdict: GO

Both findings check out on current master — #2303 far bigger than filed
(110 instances, not 2) and #2304's filed mechanism refuted by the replay,
with a real adjacent duplicate found in the same stream instead. Both
fixes land in one commit, narration-only, with survival/wave numbers
byte-identical on all 8 seeds. All five pre-registered GO bars PASS
(bar (b) as revised in Metric review — the filed bar measured an honest
line; the revision is the arm's judgment, recorded there, not a
mid-run re-score of the strike bar).

## Check leg: REPRODUCES (both, bigger than filed)

Driver scripts/strikefall-check-driver-20261113.js, competent verbatim,
150d death-aware, seeds 190391–190398 (matched band). Anchor-guarded
(HEAD must equal the prereg commit f6fb0283b, via EXPECTED_ANCHOR).
The driver wraps Game.say and records every line's day + global
sequence + live-fight id, with a live-fight fighter snapshot at every
line of interest — so the analyzer can tell two kites in one fight from
one kite resolving twice, and can judge falls→STRIKE adjacency exactly
(strike.seq === falls.seq + 1).

| seed | days | end | maxWave | standing | falls | strikes | M1 | dips | dipShort | freeze | apply | bellow |
|------|------|-----|---------|----------|-------|---------|----|------|----------|--------|-------|--------|
| 190391 | 65 | village-lost | 4 | 145 | 5 | 38 | 5 | 0 | 0 | 1 | 1 | 2 |
| 190392 | 143 | village-lost | 4 | 199 | 12 | 107 | 10 | 0 | 0 | 3 | 0 | 1 |
| 190393 | 126 | village-lost | 4 | 199 | 22 | 220 | 20 | 1 | 1 | 3 | 3 | 2 |
| 190394 | 128 | village-lost | 4 | 199 | 17 | 130 | 14 | 0 | 0 | 3 | 0 | 0 |
| 190395 | 150 | survived | 4 | 199 | 15 | 117 | 14 | 1 | 1 | 1 | 0 | 0 |
| 190396 | 140 | village-lost | 4 | 199 | 22 | 127 | 18 | 2 | 1 | 2 | 2 | 28 |
| 190397 | 135 | village-lost | 4 | 199 | 16 | 90 | 14 | 0 | 0 | 0 | 0 | 3 |
| 190398 | 139 | village-lost | 5 | 370 | 16 | 213 | 15 | 1 | 1 | 7 | 3 | 5 |
| TOTAL | | | | | **125** | **1042** | **110** | **5** | **4** | **20** | **9** | **41** |

M1 = snapshot-classified same-monster kills: the struck fighter is DEAD
in the strike line's live-fight snapshot, so the immediately-preceding
falls line is this strike's own kill announcement. M2 (struck fighter
alive — the falls line was another death) = 0; unknown = 0. Every one of
the 110 adjacent falls→STRIKE pairs is the glitch. Label-token matching
alone finds only 49 of them — encSubject (falls) and encShortLabel
(strike) differ by descriptor/veteran prefixes ("The Ugly-Eyes" vs "the
moth", "The Static" vs "the radio", "The Big Ugly (2)" vs "the duck"),
so the snapshot classification is the true count. Both filed
observations reproduce exactly on the observation seed: 190396 d130
"The RERUN ×1 The Congregation falls." → "You STRIKE the congregation
for 18 (Kitchen knife).", and d89 "The Static Kite falls." → "You STRIKE
the kite for 89 (Machete)."

## Root cause — #2303 (strike after fall)

Structural, in game.js. `tbPlayerStrike` calls
`tbDamage(t.key, d, 'you', null, {quiet:true})` and composes its "You
STRIKE for N" line AFTER tbDamage returns — but tbDamage says the
"falls." line inline the moment hp hits 0 (game.js ~40080,
sayOncePerFight). The strike line MUST stay after damage: it states the
number that LANDED, after tbDamage's monster-state modifiers (turtle
bunker x0.15, boar winded x1.5, flyer grounded x1.5, feasted/overcharge
uplift) — the code comments say so twice, and the proof test's G1
demonstrates the inversion exactly (pre-fix: strike@12 falls@11).
Villager strikes do not have the bug: they say their line BEFORE
tbDamage (game.js ~41158/41161). Human-target strikes do not have it
either: the human strike line is composed before tbDamage. Only the
monster-target player strike inverts, because only it needs the landed
number. The same inversion class exists on one other verb —
Retribution (abilityActions.js `retribution.unleash`: tbDamage loop
first, then the "RETRIBUTION: N damage erupts..." line) — filed as a
new finding below, not fixed here (out of the prereg's scope; same
opt-in fix shape, needs its own arm + proof leg). Landslide and the
gristlefit lash already narrate BEFORE their tbDamage call — correct,
untouched.

## Root cause — #2304 (square screams twice)

The filed mechanism is REFUTED. The diagnostic replay
(scripts/strikefall-diag-replay-20261113.js, seed 190396 d89, full
day-89 say stream with per-line kite state) shows the two DIP lines
are TWO HONEST ATTACK CYCLES in one fight with one kite (m_0), 20
say-lines apart (seqs 10402 and 10422), with a fresh declare between
them:

- Cycle 1: declare 10396 ("The kite stops dead... ground lights up",
  telegraph squares turnsLeft 2, attack unnamed), windup 10397–10398,
  resolve 10399–10401 (short SCREAMS line + hit for 5), DIP 10402.
  Player strikes for 96; kite 97 → 1 HP; it climbs back high (10410).
- Cycle 2: declare 10416 ("Scan-grid on the ground — TWO beats. MOVE.",
  telegraph squares turnsLeft 2, attack now named "The Broadcast" —
  learned mid-fight via the Codex line at 10403), windup 10417–10418,
  resolve 10419–10421 ("💥 The Broadcast!", hit for 4), DIP 10422.
  Player strikes for 89 and kills it (10426 falls → 10427 STRIKE —
  the #2303 instance itself, in the same fight).

One kite, two cycles, one dip each. The "in a row" in the filed finding
is an artifact of the sense replay's filtered view — in the full stream
the dips are 20 lines apart with a complete second attack cycle
between them. Deduping the DIP line per fight would be WRONG: it would
silence a real second dip and hide a real melee window ("IT'S YOURS.
NOW." — and the player did strike for 89 off the second dip and kill
it). No per-fight DIP dedup was built.

The REAL duplicate in the same stream, found by the replay: in an
unnamed-attack cycle the generic resolve fallback says "💥 The square
SCREAMS — static made solid." (seq 10399) and the dip block then says
the DIP line (seq 10402), which repeats the same phrase as its opening
— the scream fires twice in ONE resolve. That is the fix: the kite's
branch of the fallback now says nothing (the dip block voices the
scream right after, hit or miss, in the same resolve). Airtight by
construction: the fallback branch is non-direct telegraphs only; the
kite's only non-direct attack is the Broadcast (burst → squares); the
dip block runs for every squares resolve with no early return between
it and the fallback (verified: no `return` in game.js 43680–44000);
the kite's other attack (the Dip) is a direct telegraph and never
reaches the fallback. When the attack is named, the fallback already
says "💥 The Broadcast!" instead — untouched.

## Fix

`src/js/game.js`, commit ff40793a6 [needs-eyes] (narration changes):

1. **#2303 — deferred death narration.** tbDamage takes a new opt
   `deferDeathLines`: when set, the monster-death branch queues its
   narration (falls line, lockpick return, wolf-lead melt lines, rep
   clipboard/scatter lines) on the live fight (`f._deathLines`)
   instead of saying it; all mechanics stay inline (drama, registerDeath,
   snake split, flee flags, death-throes tick). tbPlayerStrike passes
   `{quiet:true, deferDeathLines:true}` and flushes via the new
   `tbFlushDeathLines()` immediately after its STRIKE say — the blow
   first, its kill second. Falls lines keep their sayOncePerFight dedup
   on flush. Fail-open: no live fight, or a fight already over, says
   immediately — a kill is never silent. The death-throes line stays
   inline deliberately: its tick is mechanical damage with its own say
   lines, so deferring the text alone would split one beat in two
   (documented remainder — sweep-pattern monsters only).
2. **#2304 — kite short SCREAMS line dropped.** The fallback's
   `statickiteIs` branch is now an empty branch with the comment (not
   a deletion — deleting it would fall through to "💥 It erupts!").
   The DIP line still fires once per resolve, named or not.

## After leg: M1 110 → 0, short screams 4 → 0, nothing silenced

Same driver, same 8 seeds, run on the fix commit (anchor override via
EXPECTED_ANCHOR env). Per-seed M1 / dipShort, check → after:

| seed | M1 | dipShort | dips | falls | strikes | freeze | apply | bellow |
|------|----|----------|------|-------|---------|--------|-------|--------|
| 190391 | 5 → 0 | 0 → 0 | 0 → 0 | 5 → 5 | 38 → 38 | 1 → 1 | 1 → 1 | 2 → 2 |
| 190392 | 10 → 0 | 0 → 0 | 0 → 0 | 12 → 12 | 107 → 107 | 3 → 3 | 0 → 0 | 1 → 1 |
| 190393 | 20 → 0 | 1 → 0 | 1 → 1 | 22 → 22 | 220 → 220 | 3 → 3 | 3 → 3 | 2 → 2 |
| 190394 | 14 → 0 | 0 → 0 | 0 → 0 | 17 → 17 | 130 → 130 | 3 → 3 | 0 → 0 | 0 → 0 |
| 190395 | 14 → 0 | 1 → 0 | 1 → 1 | 15 → 15 | 117 → 117 | 1 → 1 | 0 → 0 | 0 → 0 |
| 190396 | 18 → 0 | 1 → 0 | 2 → 2 | 22 → 22 | 127 → 127 | 2 → 2 | 2 → 2 | 28 → 28 |
| 190397 | 14 → 0 | 0 → 0 | 0 → 0 | 16 → 16 | 90 → 90 | 0 → 0 | 0 → 0 | 3 → 3 |
| 190398 | 15 → 0 | 1 → 0 | 1 → 1 | 16 → 16 | 213 → 213 | 7 → 7 | 3 → 3 | 5 → 5 |
| TOTAL | **110 → 0** | **4 → 0** | **5 → 5** | **125 → 125** | **1042 → 1042** | **20 → 20** | **9 → 9** | **41 → 41** |

The one remaining dup DIP group (190396 d89, 2 DIP lines in one fight)
is the two honest cycles — preserved by design, per the metric review.
Label-matched strike-after-fall is 49 → 0 as well. Every falls line
and every strike line is still said (falls 125 → 125, strikes 1042 →
1042): the fix reorders, never silences.

## GO bars (pre-registered)

- (a) STRIKE-AFTER-FALL count 0 on the after leg: PASS (M1 110 → 0;
  label-matched 49 → 0).
- (b) DUPLICATE SQUARE-SCREAM count 0: REVISED in Metric review (the
  filed bar measured an honest line). Revised bar (b'): short SCREAMS
  lines 4 → 0 with DIP count unchanged 5 → 5: PASS.
- (c) Survival/wave numbers BYTE-IDENTICAL on all 8 seeds: PASS
  (analyzer: SURVIVAL-DIFFS none — days, gameDays, endReason, won,
  over, villageLost, scaleRank, maxWave, unlockedWave, standing,
  endPantryKcal, FULL deaths arrays identical check vs after).
- (d) Proof test scripts/test-strikefall-a.js RED→GREEN: PASS (below).
- (e) Controls unchanged: PASS (freezeline 20 → 20, applyStatus 9 → 9,
  bellow 41 → 41; CONTROL-DIFFS none).

## Proof

`node scripts/test-strikefall-a.js` — **28 passed, 0 failed**
(instrument legs: regexes, label matching, adjacency judge,
snapshot M1/M2/unknown classification, DIP grouping, prereg pins).
`node scripts/test-strikefall-a.js --game` — **20 passed, 0 failed**
(game-level legs, re-run on the fix commit):
- G1 killing player strike: STRIKE line precedes falls line. RED on
  pre-fix code (strike@12 falls@11 — the only failing assertion, all
  else green), GREEN after.
- G2 non-killing strike: STRIKE line, no falls line — unchanged.
- G3 kite unnamed-attack resolve: SCREAMS phrase fires once per
  resolve (in the DIP line); DIP line still fires once. RED evidence
  is the diag replay on pre-fix code (seq 10399 short + seq 10402 DIP
  in one resolve); GREEN on the fix commit.
- G4 deferral mechanism: tbDamage with deferDeathLines queues one
  line, says nothing before the flush, flush announces exactly once,
  second flush is a no-op.

## Gate

`node scripts/check.js --quick` in this tree: **335 passed, 5 failed
in 705s** (log evidence/2026-11-13/sim-strikefall-a-gate.log,
run by the adoption coordinator — the worker's gate was killed
mid-flight by the run timeout; its truncated log was overwritten
by this complete run). Gate GO after adjudication — 0 failures
attributable to the fix (which touches game.js narration only):

- Staleness (3, pre-existing standing failures, fail identically
  without the fix): test-measurement-proof-update +
  test-measurement-workflow ("Proof source inputs are not
  current" / retained neutrality proof stale) and
  test-phone-frame-proof (stale phone receipt). The neutrality
  proof and phone receipt need a refresh before they can be
  trusted as gates again (standing item, filed by
  sim-combatdedup-b).
- Timeouts (2, exact-120s caps, the documented pre-existing
  timeout class): living-garden-deed-attainment +
  one-person-army-deed-attainment. Both also timed out in the
  sim-steeple-a gate on the same day; neither touches narration
  ordering, strikes, falls, or the kite.
- No failure mentions strike, falls, kite, SCREAMS, DIP, or the
  deferDeathLines mechanism. The proof test itself
  (scripts/test-strikefall-a.js) is a green-list job with no quick
  tag, so it runs in the FULL check.js, not --quick; it was
  verified directly instead (28/28 + 20/20 above, on the fix
  commit).

### Adoption addendum (2026-11-13, coordinator)

Gate run + this section + the after-leg corpus commit are the
adoption coordinator's; the worker's evidence, fix, and proof
were complete at timeout. Proof re-verified on the final tip
before merge: 28/28 + 20/20.

## Metric review

Bar (b) as pre-registered ("0 duplicate square-screams", judged as 0
dup DIP groups per fight) proved WRONG: the one dup group is two
honest kite attack cycles in one fight (fresh declare between the
dips), and the DIP line is the player's melee-window cue — silencing
the second dip would hide a real opportunity. The bar is WITHDRAWN
and replaced by (b'): 0 short SCREAMS lines with DIP count unchanged
(4 → 0, 5 → 5) — the duplicate that actually existed in the stream.
This is the prereg's own metric-review path: the strike bar (a) was
never re-scored, and the after leg is judged on (a), (b'), (c), (d),
(e) above. A future analyzer pass could judge "duplicate DIP without
an intervening fresh declare" directly instead of grouping by fight.

Note: the check driver's fight ids are process-scoped (its WeakMap
counter runs across all 8 seeds in one process), so absolute fight
numbers differ from the single-seed diag replay (check fight 160 =
diag fight 21) — the same fight, proven by identical DIP seqs
10402/10422. Grouping by (seed, fight) is valid within a corpus.

## Sense-testing carried finding (worker-filed, out of arm scope)

- RETRIBUTION NARRATED AFTER ITS KILL: abilityActions.js
  `retribution.unleash` runs its tbDamage loop over adjacent enemies
  first, then says "RETRIBUTION: N damage erupts outward — K enemies
  caught in it." — if the shockwave kills, "X falls." precedes the
  Retribution line. Same inversion class as #2303, different verb.
  Fix shape is the same opt-in (pass deferDeathLines, flush after
  the RETRIBUTION say). Needs its own arm + proof leg (the fixture
  needs the build-around engine with stored damage). Filed in
  sim-findings.md by this arm.

## Files

- src/js/game.js — the fix (commit ff40793a6, [needs-eyes]).
- scripts/test-strikefall-a.js — proof test (28 instrument + 20 game).
- scripts/strikefall-check-driver-20261113.js — check/after driver.
- scripts/strikefall-check-analyze-20261113.js — analyzer (judge;
  snapshot M1/M2/unknown classification via fighter snapshots +
  monsters.json shortNames).
- scripts/strikefall-diag-replay-20261113.js — #2304 diagnostic replay
  (full day-89 stream + per-line kite state).
- evidence/2026-11-13/perseed-strikefall-a-check/ — 8 check-leg JSONs.
- evidence/2026-11-13/perseed-strikefall-a-after/ — 8 after-leg JSONs.
- evidence/2026-11-13/strikefall-diag-replay.json +
  strikefall-diag-replay.log — replay output.
- evidence/2026-11-13/sim-strikefall-a-prereg.md — prereg.
- evidence/2026-11-13/sim-strikefall-a.md — this file.

## Commits (branch sim-strikefall-a, base master 48ed1ffd7)

- f6fb0283b — prereg + check driver/analyzer + proof test (RED: G1
  strike@12 falls@11).
- b3b234ae7 — snapshot-classification analyzer (M1/M2/unknown).
- 9fc4b7363 — check-leg corpus, 8 seeds.
- ff40793a6 — the fix [needs-eyes] + proof test G3/G4 + diag replay.
- (to come) after-leg corpus + this evidence file.
- Note: safe-commit's known index clobber struck on all three
  fix-branch commits (committed files staged-as-deleted / MM); each
  was repaired with the `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe and verified with
  `git status --short` empty + `git diff HEAD` empty before
  continuing. All four commits verified correct by `git show --stat`.

## Finding

sim-findings.md #2303 and #2304 marked [fixed 2026-11-13 by Loop A
arm sim-strikefall-a, run fleshout-20261113T1615Z: ...] — see the
findings updates in the worker's final report; the coordinator applies
them at merge.
