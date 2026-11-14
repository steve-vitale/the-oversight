# sim-retribution-b — retribution narrated after its kill (sim-findings.md #2313)

Run: fleshout-loop-b-20261113T2230Z (Loop B), arm sim-retribution-b
Axis: winnability chain (backlog open item RETRIBUTION NARRATED AFTER ITS
KILL, filed by Loop A arm sim-strikefall-a; see evidence/2026-11-13/
sim-strikefall-a.md §Sense-testing)
Branch: sim-retribution-b — worktree ~/workspace/worktrees/sim-retribution-b
Base: master 95dbf07f3 (prereg commit 53659af89; fix commit 59fa40913)
Date: 2026-11-13

## Verdict: GO (with a substrate caveat — read the check leg)

The inversion is real and the fix lands it: on pre-fix code a killing
retribution unleash narrates its falls lines BEFORE the RETRIBUTION
summary line (proof-test G1 summary@11 falls@10, G2 summary@12
falls@10,11); on the fix commit the summary precedes every falls line
(G1/G2 GREEN, 18/18 instrument + 29/29 game). Mechanics are untouched
(damage, kill counts, the 25% self-hit, battery drain — all pinned by
G5/G6). Survival/wave numbers are byte-identical check vs after on all
8 seeds, controls unchanged.

The caveat: the band sims never touch retribution at all — zero contact
on 16 seeds across two bands (see Stage 0 probe below). The band is
therefore a regression check only; the staged fixture is the primary
proof, exactly as the prereg's substrate rule provides. The fix is
still worth landing: any player who does hold retribution and kills
with it hears the kill before the blow today.

## Check leg: SUBSTRATE FINDING — zero contact (§14b)

Driver scripts/retribution-check-driver-20261113.js, competent verbatim,
150d death-aware. Stage 0 probed the steeple band 190391–190398; per
the prereg's band rule the fresh band 190441–190448 was then probed too
(verified fresh: no mention in any evidence/*.md, no matching per-seed
filenames). Anchor: prereg commit 53659af89 (both probes).

Steeple band (check corpus evidence/2026-11-13/perseed-retribution-b-check/):

| seed | days | end | maxWave | standing | falls | retrib summary | unleash | stored | no-adj | inversions |
|------|------|-----|---------|----------|-------|----------------|---------|--------|--------|------------|
| 190391 | 65 | village-lost | 4 | 145 | 5 | 0 | 0 | 0 | 0 | 0 |
| 190392 | 143 | village-lost | 4 | 199 | 12 | 0 | 0 | 0 | 0 | 0 |
| 190393 | 126 | village-lost | 4 | 199 | 22 | 0 | 0 | 0 | 0 | 0 |
| 190394 | 128 | village-lost | 4 | 199 | 17 | 0 | 0 | 0 | 0 | 0 |
| 190395 | 150 | survived | 4 | 199 | 15 | 0 | 0 | 0 | 0 | 0 |
| 190396 | 140 | village-lost | 4 | 199 | 22 | 0 | 0 | 0 | 0 | 0 |
| 190397 | 135 | village-lost | 4 | 199 | 16 | 0 | 0 | 0 | 0 | 0 |
| 190398 | 139 | village-lost | 5 | 370 | 16 | 0 | 0 | 0 | 0 | 0 |
| TOTAL | | | | | **125** | **0** | **0** | **0** | **0** | **0** |

Fresh band (corpus evidence/2026-11-13/perseed-retribution-b-check-fresh/):

| seed | days | end | maxWave | standing | falls | retrib summary | unleash | stored | no-adj | inversions |
|------|------|-----|---------|----------|-------|----------------|---------|--------|--------|------------|
| 190441 | 150 | survived | 4 | 175 | 13 | 0 | 0 | 0 | 0 | 0 |
| 190442 | 101 | village-lost | 4 | 150 | 7 | 0 | 0 | 0 | 0 | 0 |
| 190443 | 74 | village-lost | 4 | 199 | 10 | 0 | 0 | 0 | 0 | 0 |
| 190444 | 150 | survived | 5 | 270 | 11 | 0 | 0 | 0 | 0 | 0 |
| 190445 | 145 | village-lost | 5 | 530 | 18 | 0 | 0 | 0 | 0 | 0 |
| 190446 | 125 | village-lost | 5 | 375 | 22 | 0 | 0 | 0 | 0 | 0 |
| 190447 | 79 | village-lost | 3 | 75 | 4 | 0 | 0 | 0 | 0 | 0 |
| 190448 | 94 | village-lost | 4 | 199 | 8 | 0 | 0 | 0 | 0 | 0 |
| TOTAL | | | | | **93** | **0** | **0** | **0** | **0** | **0** |

Not one RETRIBUTION line of any kind in 16 long sims — no summary, no
unleash, no "stored" announcement, no "finds no one adjacent". The
steeple totals reproduce the strikefall check leg exactly (falls 125,
freezeline 20, apply 9, bellow 41), so the instrument is faithful; the
zero is in the game, not the driver.

Why zero — one-seed diagnostics (throwaway script
retribution-diag-1seed.js, deleted at closeout; captures EVERY say line
matching /retribution/i plus end-state scholar abilities):

- 190391 (65d): 0 retribution lines; scholar holds iron_stomach,
  cold_blooded; hasRetribution false; buildaround {}.
- 190445 (145d, standing 530, wave 5): 0 retribution lines; scholar
  holds green_whisper only; hasRetribution false.
- 190444 (150d survived, wave 5): 0 retribution lines; scholar holds
  six abilities (beast_calm, scream_cheese, lucky_rock,
  fusion_reactor, night_eyes, trophy_room — another build-around) but
  NOT retribution; hasRetribution false.

The competent policy's scholar never holds retribution on any probed
seed, so the battery never charges and unleash is never pressed — not
even the "stored" announcement, which fires for any holder who blocks
20+ damage. Retribution is effectively unexercised by competent play
in long sims. (Whether the System ever offers it to the scholar, or
offers it and competent declines, is a separate question for the
ability-offer arms — out of this arm's scope; filed below.)

## Root cause

Structural, in abilityActions.js `retribution.unleash`. The impl calls
`BA.unleash(game)` (which says "RETRIBUTION: N erupts outward — and M
stays with you."), then loops `game.tbDamage(m.key, stored, 'your
retribution', 'p', {quiet:true})` over adjacent enemies, then says the
summary line "RETRIBUTION: N damage erupts outward — K enemies caught
in it." tbDamage says the "falls." line inline the moment hp hits 0 —
so a kill is announced between the two RETRIBUTION lines, before the
line that describes the blow that caused it. Same inversion class as
#2303, different verb. The proof test's G1/G2 demonstrate it exactly
on pre-fix code (summary@11 falls@10; summary@12 falls@10,11).

## Fix

`src/js/abilityActions.js`, commit 59fa40913 [needs-eyes] (narration
changes only, +12/−2):

Same opt-in shape as the strikefall fix (#2303): the tbDamage calls in
`retribution.unleash` now pass `{quiet:true, deferDeathLines:true}`,
and `game.tbFlushDeathLines()` runs immediately after the RETRIBUTION
summary say. Mechanics untouched (damage, kills, counts, the 25%
self-hit identical); only narration order moves. Fail-open behavior
preserved (no live fight, or a fight already over, says immediately —
a kill is never silent). The death-throes line stays inline
deliberately (documented remainder from #2303 — do not touch it). The
"no one adjacent" branch needs no flush (no tbDamage calls, nothing
queued) and is byte-identical.

## After leg: inversions 0, survival byte-identical, controls unchanged

Same driver, same 8 steeple seeds, on the fix commit (anchor override
via EXPECTED_ANCHOR env). Per-seed check → after:

| seed | inversions | falls | retrib summary | freezeline | apply | bellow |
|------|-----------|-------|----------------|------------|-------|--------|
| 190391 | 0 → 0 | 5 → 5 | 0 → 0 | 1 → 1 | 1 → 1 | 2 → 2 |
| 190392 | 0 → 0 | 12 → 12 | 0 → 0 | 3 → 3 | 0 → 0 | 1 → 1 |
| 190393 | 0 → 0 | 22 → 22 | 0 → 0 | 3 → 3 | 3 → 3 | 2 → 2 |
| 190394 | 0 → 0 | 17 → 17 | 0 → 0 | 3 → 3 | 0 → 0 | 0 → 0 |
| 190395 | 0 → 0 | 15 → 15 | 0 → 0 | 1 → 1 | 0 → 0 | 0 → 0 |
| 190396 | 0 → 0 | 22 → 22 | 0 → 0 | 2 → 2 | 2 → 2 | 28 → 28 |
| 190397 | 0 → 0 | 16 → 16 | 0 → 0 | 0 → 0 | 0 → 0 | 3 → 3 |
| 190398 | 0 → 0 | 16 → 16 | 0 → 0 | 7 → 7 | 3 → 3 | 5 → 5 |
| TOTAL | **0 → 0** | **125 → 125** | **0 → 0** | **20 → 20** | **9 → 9** | **41 → 41** |

Analyzer: SURVIVAL-DIFFS none — byte-identical on all shared seeds
(days, gameDays, endReason, won, over, villageLost, scaleRank,
maxWave, unlockedWave, standing, endPantryKcal, FULL deaths arrays).
CONTROL-DIFFS none. The band leg is a pure regression check (zero
contact both legs, as the substrate finding predicts); the inversion
reduction itself is demonstrated by the fixture (below).

## GO bars (pre-registered)

- (a) RETRIBUTION-KILL INVERSIONS 0 on the after leg: PASS — with the
  metric-review note below. On the band the count was 0 before and 0
  after (substrate: zero contact). The reduction is demonstrated by
  the fixture: pre-fix G1 summary@11 falls@10 and G2 summary@12
  falls@10,11 (2 inversions); post-fix G1/G2 GREEN with the summary
  preceding every falls line.
- (b) Falls / retribution counts unchanged: PASS (falls 125 → 125,
  retrib summary/unleash/stored/no-adj 0 → 0 on all 8 seeds).
- (c) Survival/wave numbers BYTE-IDENTICAL: PASS (SURVIVAL-DIFFS none).
- (d) Proof test scripts/test-retribution-b.js RED→GREEN: PASS (below).
- (e) Controls unchanged: PASS (freezeline 20 → 20, apply 9 → 9,
  bellow 41 → 41; CONTROL-DIFFS none).

## Proof

`node scripts/test-retribution-b.js` — **18 passed, 0 failed**
(instrument legs: regexes, unleash→falls→summary judge on synthetic
corpora, prereg pins).
`node scripts/test-retribution-b.js --game` — **29 passed, 0 failed**
(game-level legs, re-run on the fix commit):
- G1 killing unleash (1 kill): summary line precedes the falls line.
  RED on pre-fix code (summary@11 falls@10), GREEN after.
- G2 killing unleash (2 kills): summary precedes BOTH falls lines.
  RED on pre-fix code (summary@12 falls@10,11), GREEN after.
- G3 non-killing unleash: summary present, no falls line — unchanged.
- G4 no adjacent enemy: precheck refuses before anything is spent
  (battery stays 40, no summary, no falls).
- G5 mechanics pinned: summary states "40 damage, 3 enemies hit";
  unleash line states the 25% self-hit ("and 10 stays with you");
  battery emptied by the unleash.
- G6 battery drains once: second unleash refused, no second summary.

Fixture notes (for the next reader): solo scouts get a duel
(partyTactics tbPackSpawnCount), so the pack is staged by cloning the
engine-built hushwolf fighter twice with fresh keys — clones are not
the lead (wolfLead only on wolves[0]; killing the lead routs the pack,
60% per wolf, which would make kill counts nondeterministic) and get
distinct names (the falls line is once-per-exact-text-per-fight, so
identical wolves announce only once). The lead stays alive at full HP
in the kill legs.

## Sense-testing: it reads as one blow now

Post-fix capture (two-kill unleash, staged fixture):

```
RETRIBUTION: 40 erupts outward — and 10 stays with you. Pain has to go somewhere.
RETRIBUTION: 40 damage erupts outward — 3 enemies caught in it.
The dog-shaped silence at the treeline (2) falls.
The dog-shaped silence at the treeline (3) falls.
```

The shockwave is announced, its toll is named, then the dead fall —
one blow, in order. (The "(2)"/"(3)" suffixes are the fixture's
distinct-name staging, not production text; in production two
identical wolves dedup to a single falls line per the COMBATDEDUP
rule.) No other retribution lines changed: the "stored" announcement,
the "nothing stored yet" refusal, and the "finds no one adjacent"
line are untouched.

## Gate

`node scripts/check.js --quick` in this tree: **334 passed, 6 failed
in 871s** (log evidence/2026-11-13/sim-retribution-b-gate.log).
Gate GO after adjudication — 0 failures attributable to the fix
(which touches abilityActions.js narration only):

- Staleness (3, pre-existing standing failures, same class the
  sibling strikefall arm documented earlier the same day):
  test-measurement-proof-update + test-measurement-workflow ("Proof
  source inputs are not current" / "retained neutrality proof covers
  the current Game/controller/harness inputs") and
  test-phone-frame-proof (stale phone receipt: "Phone receipt source
  is stale or missing: index.html"). Verified this arm: the stale
  inputs are src/js/abilityActions.js, src/js/conversation.js and
  src/js/convo-dialogue.js. The proof was refreshed 2026-11-13 22:20Z
  (commit 722539b00); conversation.js / convo-dialogue.js changed
  after that via sibling landings, so the failure class predates this
  arm — strikefall's gate failed the same tests before this fix
  existed. This arm's change adds abilityActions.js as a third stale
  input (its prior change, sim-steeple-a 18:29Z, predates the refresh;
  only this fix postdates it). Refreshing the neutrality proof needs a
  fresh real observer-neutral panel (scripts/balance-proof-update.js)
  — a measurement-workflow job, not part of a narration arm; the
  phone receipt likewise needs a refresh before it can be trusted as
  a gate again. No failure mentions retribution, falls, or the
  deferDeathLines mechanism.
- Timeouts (3, exact-120s caps, the documented pre-existing timeout
  class): living-garden-deed-attainment +
  one-person-army-deed-attainment (both also timed out in the
  sim-steeple-a gate the same day) + test-capable-bot-20261014.js.
  None touches narration ordering, strikes, falls, or retribution.
- The proof test itself (scripts/test-retribution-b.js) is a
  green-list job with no quick tag, so it runs in the FULL check.js,
  not --quick; it was verified directly instead (18/18 + 29/29 on the
  fix commit).

## Metric review

Bar (a) as pre-registered ("0 retribution-kill inversions on the after
leg, was N on the check leg") proved UNDERSPECIFIED for this arm: the
check leg's N was 0, not because the bug is absent but because the
band never exercises retribution (substrate finding). The bar is
therefore judged on the fixture, where N was reproduced (>0 pre-fix)
and is 0 after — the prereg's own substrate rule names the fixture as
the primary proof in exactly this case. The band leg judges (b), (c)
and (e), which all PASS. No bar was re-scored mid-run; the strike bar
was never the band's to judge.

Second instrument gap, for the NEXT run: the check driver captures the
uppercase RETRIBUTION lines (summary / unleash / stored / no-adjacent)
but not the lowercase "Retribution: nothing stored yet" tap line or
the precheck refusal ("Nothing stored yet — ... (Unleash
Retribution)"). A future driver revision should capture those too, so
"zero contact" can distinguish "never held" from "held but never
charged" without a separate diagnostic script. The diagnostics in
this arm close the gap for this verdict (3 seeds, 0 retribution lines
in any case, scholar never holds the ability).

Telemetry deviation check: `scripts/telemetry-check.js` refuses
recorder-corpus input against the scale-wall run baseline by design
("recorder corpora are compared with sweep-compare tables, never
against a run baseline here"), and its --baseline takes a single JSON
file, not a glob — so no recorder-vs-run comparison was forced. The
equivalent check is the analyzer's per-seed byte-identity comparison
(SURVIVAL-DIFFS none, covering scaleRank/won per seed), which is
strictly stronger than the telemetry metric aggregates for this
narration-only fix.

## Scale-wall numbers (every run)

Steeple band, check leg (= after leg, byte-identical): 1/8 survived
(190395, 150d), 7/8 village-lost, median survival 135.5d; maxWave 4
on 7 seeds, 5 on 190398; standing 145–370, all regional, 0 national,
0 table, 0 wins. Fresh band: 2/8 survived (190441, 190444, both 150d),
6/8 village-lost, median survival 113d; maxWave 5 on 3 seeds (190444,
190445, 190446); standing 75–530, all regional, 0 national, 0 table,
0 wins. The wall stands — this narration-only arm was never expected
to move it.

## Findings

- sim-findings.md #2313 RETRIBUTION NARRATED AFTER ITS KILL: fixed by
  this arm (commit 59fa40913) — coordinator marks it [fixed] at merge.
- Carried finding (filed by this arm, out of scope): RETRIBUTION NEVER
  EXERCISED BY COMPETENT PLAY — the scholar never holds the retribution
  ability in 16 long sims (3 diagnostic seeds: 0 retribution lines in
  any case; end-state scholars hold other abilities, including the
  fellow build-around trophy_room on 190444, but never retribution).
  Is the System ever offering it to the scholar, or offering it and
  competent declining? Needs an ability-offer arm, not a narration
  fix. (Filed in sim-findings.md by this arm — see the worker's final
  report; the coordinator applies it at merge.)

## Files

- src/js/abilityActions.js — the fix (commit 59fa40913, [needs-eyes]).
- scripts/test-retribution-b.js — proof test (18 instrument + 29 game).
- scripts/retribution-check-driver-20261113.js — check/after driver.
- scripts/retribution-check-analyze-20261113.js — analyzer (judge).
- evidence/2026-11-13/perseed-retribution-b-check/ — 8 check-leg JSONs (steeple band).
- evidence/2026-11-13/perseed-retribution-b-check-fresh/ — 8 fresh-band probe JSONs.
- evidence/2026-11-13/perseed-retribution-b-after/ — 8 after-leg JSONs (steeple band).
- evidence/2026-11-13/sim-retribution-b-prereg.md — prereg.
- evidence/2026-11-13/sim-retribution-b.md — this file.

## Commits (branch sim-retribution-b, base master 95dbf07f3)

- 9e16c0b40 — prereg + check driver/analyzer + proof test (RED: G1
  summary@11 falls@10, G2 summary@12 falls@10,11).
- 75f37133d — the fix [needs-eyes] + proof test GREEN (18/18 + 29/29).
- 63aaf56e2 — check/fresh/after corpora + this evidence file + gate log.
- Note: the safe-commit index clobber struck on both commits (first:
  all 4 files staged-as-deleted; second: MM on abilityActions.js);
  each was repaired with the `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe and verified with
  `git status --short` empty of tracked changes + `git diff HEAD`
  empty before continuing. Both commits verified correct by
  `git show --stat`.
- Note: the host write flap was active during this arm (EPERM on the
  first safe-commit attempt, retried OK; 3 per-seed check files fell
  back to stdout when the flap emptied their writes — 190395/190396
  recovered by deterministic re-run, 190448 recovered from the
  persisted driver log; the first driver run was killed by a service
  restart mid-seed-190398, re-run cleanly after). No data lost.

## Adoption (Loop B run fleshout-loop-b-20261114T0130Z, 2026-11-14)

The 2230Z run died mid-flight; this arm was adopted, verified
independently, and rebased — not re-run from scratch.

- Hash mapping (verified by the adopter): the run record above cites
  the original commit hashes 53659af89 (prereg) and 59fa40913 (fix).
  The branch as recovered carries the same work under 9e16c0b40 and
  75f37133d — the abilityActions.js fix diff is byte-identical
  (md5 eb521a3ee685c8f86666d01be97cdf7a for both), the prereg commit
  touches the same 4 files with the same line counts. The Commits
  section above now lists the branch's actual hashes.
- Rebase: branch replayed cleanly (no stops, no conflicts) onto
  current master a1d201e8e (sim-transplant-round-2215 coordinator
  evidence), producing ef46c7d87 (prereg) + bdbb40393 (fix
  [needs-eyes]) + e26016b2a (corpora + evidence + gate log).
  origin/master 249da4729 was already an ancestor of the branch,
  so the rebase moved only onto the local-master coordinator
  commits. This adoption record is committed on top of e26016b2a
  as the final tip (see git log).
- Proof re-run on the rebased tree e26016b2a:
  `node scripts/test-retribution-b.js` 18 passed, 0 failed;
  `node scripts/test-retribution-b.js --game` 29 passed, 0 failed.
  Same counts as on the pre-rebase tip 63aaf56e2.
- Mechanism re-verified by reading the code (not just the test):
  `deferDeathLines` queues falls lines on the live fight and
  `tbFlushDeathLines()` drains them in order, fail-open
  (src/js/game.js:40097, 47550) — the fix in abilityActions.js
  (defer on the tbDamage calls, flush right after the RETRIBUTION
  summary say) does exactly what the prereg claims.
- Finding #2313 confirmed in sim-findings.md line 2313
  (RETRIBUTION NARRATED AFTER ITS KILL, filed by Loop A arm
  sim-strikefall-a) — this arm fixes it; coordinator marks [fixed]
  at merge. The carried finding (retribution never exercised by
  competent play) is filed separately — see the adoption report.
- Status: READY TO MERGE, pending coordinator merge. No push, no
  version bump, no live verification (ship loop owns those).
