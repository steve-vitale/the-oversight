# TB-HOLD: player decisions inside turn-based wave-4 fights — Loop A, run fleshout-20261103T1945Z, arm sim-tbpolicy-a

Axis: scale-onramp (standing directive: the scale wall). Policy-side
arm ONLY: zero src/js changes (scripts/policies + scripts +
evidence only). No gate/price change, no field-fight change, no
ally-join change, no gear change.

## Verdict — KILLED (pilot NO-GO, no confirm spent)

Prereg `evidence/2026-11-03/sim-tbpolicy-a-prereg.md` (commit
b159a111b) fixed GO as BOTH bars on the 8-seed pilot band
(99101–99108, 140d death-aware): kills per TB exposure ≥ 0.50
AND median % monster HP dealt ≥ 38.8. The variant passes the
damage bar by a wide margin and fails the kill bar outright:

| pooled (8 seeds) | baseline (competent verbatim) | variant (TB-HOLD) | GO bar | met? |
|---|---|---|---|---|
| TB started | 26 | 33 | — | — |
| TB kills | 7 | 8 | — | — |
| kills per TB exposure (PRIMARY) | 0.2692 | 0.2424 | ≥ 0.50 | NO |
| median % HP dealt (secondary) | 23.8 | 58.4 | ≥ 38.8 | YES |
| median player turns / TB fight | 7 | 6 | — | — |
| flee share (tbEnd 'fled') | 0.000 | 0.000 | — | — |
| villages lost / survived | 7 / 1 | 6 / 2 | — | — |
| median survival | 118.5d | 116.5d | — | — |

Per prereg, a miss on either bar is NO-GO with no re-scoring,
no confirm is spent, and the variant policy file is DELETED
before the final commit (this evidence file + prereg +
instruments + proof test + corpora remain; the proof test is
archived — it passed 10/10 while the module existed, and now
requires the removed module, which is stated in its header).

## What TB-HOLD was, and why it was the lever the code offers

Reading `scripts/policies/competent.js` `fight()` in full, the
competent bot's inside-fight decisions are: start walk-away
when outmatched, 35% eject, ability press, beast trick for
KNOWN counters only, strike weakest. Measured on the baseline
band, three of those are vacuous for wave 4 and one is broken:

- Beast tricks: wave-4 monster defs carry NO counter field
  (verified in src/data/monsters.json) → 0 trick turns in both
  legs. Not a lever; not chased.
- Target selection: all 26 baseline TB fights (and all 33
  variant fights) are single-monster → "strike weakest" =
  "strike the only one". Not a lever.
- Flee: in the DEFAULT env the policy's flee() NEVER pushes
  through the barrier — the push branch is gated on
  COMPETENT_DPS_RACE (off by default) — so flee turns walk to
  the edge and stand there. Baseline: 71 flee turns (31.7% of
  234 player turns in wave-4 TB fights), EVERY substantive
  fight opens with the walk-away (fledBad = 1 on 25/26 fights),
  yet 0 fights end fled and 0 barrier pushes ever fire. Four
  audit fights end with ZERO strikes landed: the scholar
  ping-pongs between flee-walking and closing distance and
  dies without landing a blow.

TB-HOLD (`scripts/policies/tbhold.js`, now deleted per the
killed-arm rule) was therefore: in any TB fight containing a
wave-4+ monster, never take the flee path — no start walk-away,
no 35% eject, at any HP — and instead press combat abilities
(same cascade order/guards as competent, same dinner reserve)
then strike via competent's exported beastStrikeTarget
(interior tiles only). Everything else — daily, upkeep,
contest, pending, and fight() for non-wave-4+ fights —
delegated to competent by object spread. Field fights never
call policy.fight, so they are untouched by construction.

## Baseline table (competent verbatim, this worktree HEAD)

| seed | days | end | spawns | TB | fields | TB kills | kills/TB | median HP% | flee turns |
|---|---|---|---|---|---|---|---|---|---|
| 99101 | 119 | lost | 13 | 5 | 7 | 0 | 0.000 | 0.0 | 17 |
| 99102 | 124 | lost | 13 | 6 | 10 | 1 | 0.167 | 23.3 | 23 |
| 99103 | 102 | lost | 0 | 0 | 0 | 0 | — | — | 0 |
| 99104 | 140 | survived | 7 | 1 | 0 | 1 | 1.000 | 100 | 1 |
| 99105 | 136 | lost | 5 | 3 | 3 | 2 | 0.667 | 100 | 4 |
| 99106 | 118 | lost | 11 | 8 | 2 | 1 | 0.125 | 13.2 | 20 |
| 99107 | 80 | lost | 3 | 2 | 0 | 2 | 1.000 | 100 | 2 |
| 99108 | 71 | lost | 3 | 1 | 0 | 0 | 0.000 | 8.6 | 4 |
| POOLED | — | 7 lost | 55 | 26 | 22 | 7 | 0.2692 | 23.8 | 71 |

Baseline turn anatomy (234 player turns):
123 strikes + 71 flee + 29 close + 5 ability presses + 0
tricks + 6 driver-default turns (fight() returned false and
the harness default struck — counted as turns, not as
competent actions).

## Variant table (TB-HOLD, identical seeds/horizon)

| seed | days | end | spawns | TB | fields | TB kills | kills/TB | median HP% | flee turns |
|---|---|---|---|---|---|---|---|---|---|
| 99101 | 139 | lost | 15 | 11 | 14 | 3 | 0.273 | 81.1 | 0 |
| 99102 | 121 | lost | 11 | 8 | 1 | 1 | 0.125 | 55.0 | 0 |
| 99103 | 102 | lost | 0 | 0 | 0 | 0 | — | — | 0 |
| 99104 | 140 | survived | 7 | 2 | 0 | 1 | 0.500 | 68.5 | 0 |
| 99105 | 112 | lost | 4 | 2 | 0 | 1 | 0.500 | 82.0 | 0 |
| 99106 | 96 | lost | 10 | 5 | 2 | 0 | 0.000 | 6.2 | 0 |
| 99107 | 140 | survived | 10 | 4 | 0 | 2 | 0.500 | 96.0 | 0 |
| 99108 | 71 | lost | 3 | 1 | 0 | 0 | 0.000 | 9.9 | 0 |
| POOLED | — | 6 lost | 60 | 33 | 17 | 8 | 0.2424 | 58.4 | 0 |

Variant turn anatomy (234 player turns, coincidentally the
same total): 179 strikes + 0 flee + 20 close + 28 ability
presses + 0 tricks + 7 driver-default turns. HOLD works
mechanically exactly as preregistered: flee turns 71 → 0,
strikes +46%, ability presses 5 → 28 (more turns available to
press on, same cascade).

## Why kills did not move when damage more than doubled

This is the finding, not a consolation. The damage distribution
of LOST fights moved wholesale, but the kill threshold is 100%
and the last stretch is where fighters die:

- Baseline lost fights (19): HP dealt 0–53.6%; only 1 ≥ 50%,
  none ≥ 80%.
- Variant lost fights (25): HP dealt 0–92%; 10 ≥ 50%, 4 ≥ 80%
  (81.1, 84.9, 86.8, 92%) — yet all 25 still end lost.

Converting flee turns to strikes buys damage, not survival:
the scholar still dies before the monster does in the fights
that matter. Median damage 23.8 → 58.4 is a real, large effect
that does NOT convert, because conversion needs FINISHING
(staying alive through the last 10–50% of a 700–1500 HP
monster that hits 35–95 per turn), not more mid-fight damage.
Two secondary patterns confirm the diagnosis is not "HOLD
made fighters reckless": villages lost barely moved (7 → 6),
median survival barely moved (118.5 → 116.5d), and the
trajectory divergence (33 vs 26 TB fights faced) means HOLD
villages also walked into MORE wave-4 fights — 99101 faces 11
TB fights under HOLD vs 5 under competent — so the rate
denominator grew with harder exposure, not just easier kills.

Party split (descriptive only): baseline solo 4/19 kills vs
+ally 3/7; variant solo 4/21 vs +ally 4/12. Allies still help;
HOLD does not change the party story. Field fights: baseline
22 fights / 0 kills; variant 17 / 2 kills — field behavior is
untouched by this policy, so the 2 field kills are trajectory
noise, not a variant effect, and are not claimed as one.

## Village assessment (plain words + sense-testing)

Picture eight villages playing competently for up to 140 days.
Under competent, six of eight villages that reach wave 4 lose
their scholars in fights where a third of all fighting turns
are spent walking away from a monster that cannot be escaped —
four times the scholar never lands a blow at all. Under HOLD,
the same villages fight: strikes nearly double, the monster
loses well over half its health in the typical fight, and the
scholar still usually dies — now with the monster at 50–90%
health instead of 10–30%. One village (99107) that died on day
80 under competent survives to day 140 under HOLD; one
village (99104) survives under both; the rest die on roughly
the same schedule. The wall did not move: wins 0/8, wave-5
unlocks 0/8, wave-5 faced 0/8, national/table not instrumented
by this arm.

Sense-test (SENSE-TESTING LAW — meaning, not counts): a
narration-capture run on seed 99107 (competent, 8519 say/sys
lines, 510 on the two TB-fight days) reads like people, not
counters. On day 74, before the suburb fight: Jesse rehearses
a cover story ("Denver"), Sari calls the lie out at the fire
("Your past story doesn't add up"), Jesse admits Santa Fe
("I lied because the truth felt small"), and the village
"doesn't pounce". Foragers announce intents in their own
words ("Bringing dinner back. One way or another."). The
fight itself narrates its mechanics in fiction: a suppression
field mutes MOVE ("You cannot walk out while MOVE is muted —
STRIKE or WAIT to flip the mute"), which is itself a second,
fictional reason fleeing fails. What reads ROBOTIC is not the
prose but the baseline DECISIONS: the flee/close oscillation
in audit fights (walk away, walk back, die unstruck) is a
policy loop, not a person. HOLD removes that loop — its
fighters commit, strike, and die striking — which reads more
human in commitment even though it does not win more fights.
No static or repeated dialogue was flagged in the sample; the
gossip, intents, and fight narration all vary by speaker and
situation.

## Metric review (§14 — no in-run re-scoring)

- The GO bars were set against the measured baseline and
  honored exactly: damage bar passed (+34.6 points vs +15
  required), kill bar failed (0.2424 vs 0.50 required). No
  metric was swapped mid-run, including when the damage bar
  passed early in analysis.
- Exposure-count drift (26 → 33 TB fights) was preregistered
  as a caveat and is reported, not hidden: kills/TB is a rate
  and survives drift, but the drift itself is informative
  (HOLD villages face more wave-4 fights).
- HP-dealt % uses start-HP sums; pre-damaged mop-ups (e.g.
  the baseline 15-HP influencer, 1-turn win) read 100% under
  the same rule in both legs, so the comparison is fair.
- Proposed revision for the NEXT arm's prereg (not applied
  here): judge finishing separately from damage — e.g.
  "share of lost fights dealing ≥80%" alongside kills — so
  a damage gain that stalls at the finish line is visible in
  the header, not just in post-hoc tables. This arm's tables
  already carry that split; the next prereg should bar it.

## Balanced panel (§15)

INAPPLICABLE, as preregistered: the panel compares full-run
scorecard metrics over sweep-compare registry policies and has
no TB-exposure instrument (no kills/TB, no per-fight HP
dealt, no flee-turn counts); tbhold was never a registry
policy. The comparison used is the paired identical-seed
comparison (same seeds, horizon, driver; only the policy
differs). No panel is fabricated.

## Next blank (precisely, no fix in this run)

1. FINISHING, not damage, is now the binding TB constraint:
   10/25 variant lost fights deal ≥50% and 4 deal ≥80% yet
   still end lost. The next arm must explain why fighters die
   in the last stretch — staying power (armor/HP/healing
   under 35–95/turn monster damage), ally damage share in
   those specific fights, or monster abilities that close
   fights (e.g. the suppression-field mute) — and it belongs
   to the win-fielddmg lane's damage/staying territory or to
   game code, NOT to another TB-decision tweak: the TB
   decision surface for wave 4 is now exhausted (no counters,
   single-monster, flee broken-by-env, abilities already
   pressed every turn they can be).
2. DO NOT re-run a "hold harder" variant: HOLD already removes
   100% of flee turns. There is no further flee to remove.
3. The competent policy's default-env flee() (walk to edge,
   never push without COMPETENT_DPS_RACE) deserves a lane
   decision, not a sim-arm fix: as wired, "flee" in sims is a
   walk-and-die loop. Whether the phone's flee button path
   (direct tbBarrierExit) behaves differently in live play is
   a live-play question for the ship loop, flagged here, not
   answered here.

## Infrastructure notes (for the coordinator, not the verdict)

- ANCHOR DIVERGENCE (same as prereg): this worktree HEAD is
  77ff4a807 + 3 gap-audit commits, so the baseline does NOT
  reproduce w4convert's band; seeds 99107/99108 still MATCH
  w4convert exactly, proving the driver/instrument neutral.
  All comparisons here are within-worktree.
- EPERM WRITE FLAP (host-wide, intermittent, ~20+ min waves):
  the variant leg's computed results were repeatedly lost to
  0-byte files on write(2) EPERM — from the driver process,
  from /tmp, and from the evidence dir — while simultaneous
  short-lived shell/node probes succeeded. The driver gained
  (a) resume-by-skip, (b) verified writes with retries, and
  (c) a TBPOLICY_STDOUT_JSON mode (full per-seed JSON to
  stdout; bash redirect opens the file, not node) validated
  on seed 99108 to reproduce the corpus tbDerived exactly.
  The landed corpora were eventually written by direct node
  writes in a clear window and were verified by re-parsing;
  the STDOUT_JSON path is committed as a tested fallback for
  the next arm, not as the path that produced these files.
- INDEX CLOBBER (known safe-commit class, second sighting in
  this worktree): after the prereg commit b159a111b, the main
  index showed all 21 committed files as staged deletions
  (worktree files byte-identical to HEAD). Repaired with
  `git update-index --add --cacheinfo` per file; verified
  `git status --short` empty + `git diff HEAD` empty. The
  commit itself was correct. Check again after the final
  commit below.
- check.js NOT re-run in full: zero src/js changed; the arm's
  own proof (10/10, re-run after all driver edits) is the
  test record, same standing caveat as prior tooling-only
  landings.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; baseline NOT rolled on
  a killed arm). Note for the coordinator: wall numbers on
  this band are wins 0/8, villages lost 6/8 (variant) — the
  deviation from any older baseline is the anchor move plus
  this arm's trajectory divergence, documented above.

## Proof and landing

- `scripts/test-tbhold-20261103.js`: 10/10, run before the
  judged leg AND re-run after all driver edits (still 10/10).
  Archived with the KILLED note in its header; it requires
  the removed tbhold module.
- Arm commits on branch sim-tbpolicy-a: prereg + baseline
  corpora + variant + proof b159a111b; this evidence file +
  variant corpora + driver hardening + tbhold DELETION commit
  on the same branch, pending coordinator merge --ff-only,
  pending ship (the ship loop owns version bumps, pushes,
  live verification). NOTHING from this arm is landed as a
  game change: the variant is dead by its own prereg.
- Corpora: `evidence/2026-11-03/perseed-tbpolicy-a/` —
  tbpolicy-base (8), tbpolicy-base2 (8), tbpolicy-var (8).
  Analyzer: `scripts/tbpolicy-analyze-20261103.js`.
  Driver: `scripts/tbpolicy-driver-20261103.js`.
