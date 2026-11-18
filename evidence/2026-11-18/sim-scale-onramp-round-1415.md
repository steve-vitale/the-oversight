# Round evidence — run fleshout-20261118T1415Z (axis scale-onramp)

Run-start state: no lock file; main tree clean; disk 51%. Loop B live on
winnability chain (claim fleshout-loop-b-20261118T1330Z, arms partytrios /
vetguard / handoffrec-retry) — NOT touched. Loop A 1315Z closed (claim
.DEAD, evidence 8709e9f87). Registration took ~15 min (box heavily loaded
by sibling sims; 14/16 trees active, so this run got exactly 2 slots).
Claim: hidden_files/lever-claims/fleshout-20261118T1415Z.json.

## Arm 1 — sim-fightcap-a: DIAG-GO (finding #2538)

Cherry-picked onto master as `bcda9cff7` + `0b7a1f524` (analyzer selftest
20/20 re-run green on master). The substrate merge (held
sim-launchparty-sense-a tip d01eaf0a5) was deliberately NOT landed — the
sense fix stays HELD. Evidence: evidence/2026-11-18/sim-fightcap-a.md,
prereg sim-fightcap-a-prereg.md.

In plain words: a launched party of three hits a wave-4 monster for about
50 damage a round while the monster has about 1,200 hit points; at that
pace the fight would take ~39 rounds, and the party gives up and runs
after five. The monster doesn't have to kill them — it just has to still
be standing. They flee while alive (~73 damage taken), not because they
are dying.

- Fresh pilot band 104501–104508, 8 seeds, 150d death-aware, competent,
  substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHPARTY=1. Trio+ primary: arm n=3, 0 wins (pool floor missed,
  frozen DIAG-GO path applies). Pair-inclusive: arm n=22, win share
  0.182, kill share 0.091. Combined both bands: 2 kills / 34 launched
  meetings (kill share 0.059); ctl combined 0/9.
- The only wins (2, one seed, Cooper's party): a Rage fighter hitting
  2.5x as hard, a bow opening (~50–60 damage before melee), all three
  hitting every round — ~111 damage/round, wins in 9–12 rounds. Nobody
  else in either band had that shape.
- The gate never held back a losing party on either band (0 avoids among
  28 arm losses combined). It measures size and gear, never damage — and
  damage is what decides the fight.
- Cost bars all pass: community loss arm 2/8 vs ctl 4/8 (the 1015Z
  arrival price did NOT reproduce — the arm lost fewer villages);
  starvation arm 5 vs ctl 3 (exactly at the +2 boundary, no headroom);
  median survival 150d vs 145d. Panel review_required on a village-deaths
  watch only (interval crosses zero).
- Wall (fresh band): national 0/8, wins 0/8, wave 5 5/8 both legs;
  standing-199 stall persists.
- Caveats (worker's): `mHpStart` null on both vKill meetings (recorder
  gap — kill damage share uncomputed; damage/round uses mDealt/rounds,
  unaffected). Encounter logs cap at ~20 lines, so parsed strike totals
  understate damage in long fights; all damage-rate claims use mDealt.
  Two vDie meetings have unattributed parsed strikes (roster-name
  resolution gap) — flagged, doesn't change any judged number. Commit
  message typo in 0b7a1f524 ("Rage+bown+3") — cosmetic, evidence correct.

Finding #2538 is REFINED, not closed: the arrival price was a band
outcome, not a law; gate calibration is demoted to secondary. The binding
link is fight capability (damage output). Next arm: a damage-multiplier
carrier in launched parties (Rage or equivalent) — measure kill share;
only after a capability arm shows what a winning party looks like, a gate
arm demanding a damage proxy instead of size+gear alone. Do NOT land
another sense/gate tweak.

## Arm 2 — sim-wildavoid-confirm-a: NO-GO (landing NOT confirmed)

Merged ff-only as `6414d7bc9` + `2f5de6260` (rebased clean onto master
after journey-establishment r240 + fightcap cherry-picks moved it; proof
test 90/91 on the rebased tip — the 1 failure is §5 confinement, the
documented stale-base artifact: merge-base diff is empty because the fix
is already on master; verified directly that build commit 5402d4cc3
changed exactly src/js/game.js + src/js/win-plan.js. Analyzer selftest
ALL PASS.) Evidence: evidence/2026-11-18/sim-wildavoid-confirm-a.md,
prereg sim-wildavoid-confirm-a-prereg.md.

Fresh 16-seed band 104431–104446 (verified fresh), 150d death-aware,
competent verbatim, substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1.
Frozen bars B1–B5 from the re-judge + cost bars C1–C3. No src/js changes
— confirm-only.

| Bar | ctl → arm | Verdict |
|---|---|---|
| B1 avoid fires: 67 avoids vs 45 ctl would-avoids (1.49x) | PASS |
| B2 launches: 42 → 32 (76%, bar ≥90%) | FAIL |
| B3 wild deaths 29 → 24, flee damage 9,410 → 8,693 | PASS |
| B4 re-scoped: 0 outmatched-Suburb deaths, but 1 outmatched Suburb meeting fought (104441 d149) | FAIL |
| B5 instrument: 16/16 files, 0 errors, D3 1.0 both legs, stat==rows, say==avoids | PASS |
| C1 median survival 151 → 149.5 (ratio 0.99) | PASS |
| C2 starvation deaths 4 → 4 | PASS |
| C3 community loss 6 → 8 (bar ≤ ctl+1) | FAIL |
| Panel (§15) | review_required, no regression_signal | PASS |

Why each failure happened (decomposed on the fresh band, not re-scored):

- **B2 — the avoid eats the flee-seed (real second-order cost).**
  VETREENGAGE seeds a re-engagement plan only on a `vFlee`; an avoided
  meeting never seeds. Band-wide, world-tick fled seeds fell 141→124
  (−12%), wild vFlees 261→229, launches 42→32, concentrated on the two
  launch-richest seeds (104433: 6→3 audit launches; 104443: 13→6). No
  seed gained a launch. The lever banks the wild-death price but taxes
  the launch funnel the scale wall depends on.
- **B4 — a raid-exempt meeting the analyzer cannot see (instrument gap,
  not a lever miss).** Deterministic replay of seed 104441 logs the
  day-149 meeting as `opts: {"raid": true}` — haven-door defence, exempt
  by design — beast at 1 HP, killed by the opening volley, 0 damage,
  0 rounds. Substance would pass a raid-aware B4; the frozen bar as
  written counts it. The other Suburb death (104445 d103) is verified
  matched-party, identical on both legs, 0 avoids on the seed.
- **C3 — three famine scatterings.** Arm lost 104435, 104440, 104443
  (saved 104438). All three ended with `endPantryKcal` 0 and living
  rosters (3, 4, 7 alive) — scattering, not extinction. Total end pantry
  fell 48,470→33,607 kcal (−31%). Likely fed by the launch tax plus
  foregone monster meat; the food accounting itself isn't instrumented,
  so that link is a named hypothesis. C2 passes only because scattering
  puts no starvation deaths on the log.

Wall (fresh band): national standing (≥200) 8→9/16, national rank 0,
table 0, wins 0, wave-4 16/16, wave-5 8→9/16, median survival 151→149.5d.
The wall is still the standing-to-rank transition.

Sense-testing: Zoltan dodged the same congregation 10x in 25 days (3x on
day 121), Siya the Suburb 27x on one seed — same line every time, and
"going back for help" is still never kept (finding #2545). Fought
transcripts read like people (104435: Lehlohonolo ground down over 3 days
vs the eater, dies at 2 HP; trick-known Suburb leaves still cost a hit).
Small fiction bug: "has Sling but no arrows" — slings take no arrows
(finding #2546).

## Coordinator decision — the confirm NO-GO and the landed fix

The wildavoid fix (95ba293f2) stays in place; this run does NOT revert it.
Reasoning, per kill discipline (don't kill a feature on a missed bar
without establishing the lever itself is wrong): the lever's own mechanism
still works (B1 avoids fire, B3 wild deaths and flee damage fall, panel
shows no regression_signal); B4 is an instrument gap, not a lever miss;
C3's mechanism is a named hypothesis, not a proven link; and B2, the
binding failure, has a named structural repair — the seedplan arm (let a
wild avoid seed a re-engagement plan the way a flee does), which is the
pilot prereg's deferred design question. Revert is held in reserve: if the
seedplan arm fails its bar, the next run reverts the fix instead of
fixing forward. Steve can overrule either way. Finding #2543 records the
confirm NO-GO and this decision.

## Wall (this run's judged corpora, 24 configs)

National 0/8 (fightcap) and 8→9/16 standing / 0 rank (confirm); table 0;
wins 0; wave-4 16/16 confirm band; wave-5 5/8 fightcap, 8→9/16 confirm;
median survival ~150d. Scale-onramp stays converging (NOT converged).

## Telemetry deviation check

REFUSED recorder-corpus input on the confirm corpus (all 16 rows carry
top-level anchorCommit; exit 0 with the refusal message) — same documented
refusal as the 1315Z run. Recorder corpora are compared with sweep-compare
tables, never against a run baseline here. Baseline NOT rolled.

## Infrastructure

- Safe-commit index clobber struck both confirm-worker commits (files
  showed staged-deleted after correct commits); worker-repaired both times
  with the documented `git ls-tree -r HEAD | git update-index --add
  --index-info` pipe. Coordinator's cherry-picks + merge clean.
- Final `worktree-reap.sh` skipped on a registry lock held by another
  reaper run (1 consecutive skip — known reaper lock self-contention,
  needs a Steve nod to fix, not touched).
- Master moved under the run: journey-establishment r240 (6 commits),
  Loop B vetguard-b evidence + instruments (2 commits), fightcap
  cherry-picks (2). Wildavoid-confirm rebased clean once; proofs re-run
  green after rebase (modulo the §5 artifact, verified directly).
- No write flap observed this run.

## Metric review

- Fightcap: the frozen DIAG-GO path fired as designed (trio+ pool floor
  missed at n=3, pair-inclusive decomposition carried the verdict). The
  pool floor (n≥10 trio+ meetings) was too strict for an 8-seed pilot
  band — the next capability arm should pre-register the pair-inclusive
  rate as primary, or budget 12–16 seeds.
- Wildavoid-confirm: the frozen bars judged as written. B4 as written
  counts raid-exempt meetings; the next confirm must re-scope B4 to
  non-raid meetings and record `opts.raid` on encounter rows. B2's bar
  (≥90% launches) is the right bar for the scale wall — the launch funnel
  is the thing being protected, and the lever taxes it. No metric is
  re-scored here; the NO-GO stands.

## Next blanks, in order

1. **sim-wildavoid-seedplan-a** — let a wild avoid seed a re-engagement
   plan the way a flee does (B2 binding failure; pilot prereg's deferred
   design question). Pre-register the launch bar first; revert is the
   fallback if it fails.
2. **Damage-multiplier carrier in launched parties** (Rage or
   equivalent) — measure kill share (#2538 refined; fightcap next arm).
3. #2515 4th seat — 3rd-ally-slot arm in `fieldFights.js`, only after a
   capability arm shows what a winning party looks like.
4. Raid-aware B4: record `opts.raid` on encounter rows, re-scope B4 to
   non-raid meetings.
5. Repeat-avoid memory/cooldown, or make "going back for help" true
   (finding #2545).
6. #2510 steering call — accept the 4 unknowns as closed-by-instrument
   or stage them deliberately (finding #2541).
7. #2542 scholar plan machinery — steve-call whether intended or a gap.

Findings appended: #2543 (confirm NO-GO), #2544 (fightcap decomposition),
#2545 (repeat-avoid), #2546 (sling fiction bug). #2538 refined.
Claim deleted; lock deleted.
