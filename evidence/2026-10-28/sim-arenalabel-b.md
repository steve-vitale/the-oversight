# sim-arenalabel-b — tbEnd death labels by fight origin (wild vs arena)

Run: oversight-flesh-out-loop-b, run
fleshout-loop-b-20261028T1730Z, arm sim-arenalabel-b,
tracker next blank #1 (follow-up to sim-grantdeath-b,
DIAG-GO). LABEL-ONLY game change: no damage, HP, death
rule, lifeline, or contest-routing change.

Preregistration: evidence/2026-10-28/sim-arenalabel-b-prereg.md
(committed aeab4d95 BEFORE any judged run). Judged
against that prereg only.

## The lever

src/js/game.js gains Game.tbFightDeathCause(f), called
from the ONE existing tbEnd('lost') playerDeath site
(game.js:44253). Origin is derived at tbEnd time from
live code state — it was NOT already recorded anywhere,
and no new origin field is persisted:

- state.arenaContest present (a Blood pit / gauntlet /
  siege contest arena fight: _contestArena sets it before
  startCombat, and tbEnd's finally-hook clears it only
  AFTER the loss branch runs) → 'the arena' (unchanged).
- Otherwise, PROVEN WILD only — at least one
  kind:'monster' fighter, no kind:'hostile' fighter, and
  none of f.betrayal / f.tableTrial / f.coalitionArena →
  'the wild' (ledger.js's own wild fallback word).
- Otherwise (betrayal, table-trial, titan
  coalition-arena, alien-hostile, or no monster fighter)
  → 'the arena' (unchanged conservative fallback).

All death records derive from the single playerDeath
argument, so one string change moves all five prereg
fields together: playerDeath arg, registerDeath cause,
fallen cause, telemetry cause, narration death line.
(Lineage cause, the sixth derivation, is checked in the
proof harness leg because the grantdeath corpus does not
carry lineage.)

No other playerDeath call site changes. In particular
ledger.js:1421 (abducted-challenge 'the arena') is a
different death path and is untouched. No code anywhere
branches on cause === 'the arena' (checked in ledger /
game / contests / corpses / journal), so relabeling
cannot reroute any system — it only renames the record.

Known limit, documented not hidden: a betrayal,
table-trial, coalition-arena, or alien-hostile tbEnd
loss still reads 'the arena' after this arm. Those
origins were never the grantdeath finding, and silently
renaming them 'the wild' would have been a new lie.
They are follow-up items below, not verdict changes.

## Verdict against the prereg

PILOT-GO — all five pilot clauses hold (8 seeds × 7
loss keys, 56 instances per leg, substrate
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, 2 lead + 5 tap days):

- P1 REPRODUCTION: before leg reproduces all 7
  grantdeath losses — same seeds, keys, bearer pairs
  (10041 animal_ken / fear_aura / molt:
  gen_m82yaz8 → gen_31thg6x; 10042 ambush /
  blood_trail / patient_aim / scarecrow:
  gen_snpynyq → liam_davis), same causes (starvation
  ×1, 'the arena' ×6).
- P2 RELABEL: after leg — all 6 grant tbEnd wild losses
  read 'the wild' in ALL FIVE fields; the starvation
  loss still reads 'starvation' in all five. (Plus 2
  successor-tail tbEnd deaths in the same instances —
  liam_davis, day 9, in the ambush and scarecrow
  instances — also relabeled 'the wild' by the same
  rule: 8 wild relabels total, 0 other cause changes.)
- P3 DETERMINISM: 0 non-deterministic instances across
  all 56; endReason, grant-loss localization, bearer
  pairs, and tap outcomes identical before vs after;
  every other playerDeath cause identical; say lines
  identical except the 8 relabeled death lines, where
  only the cause token changes.
- P4 PROOF GREEN: scripts/test-arenalabel-b.js 13/13
  BEFORE the judged after-band — label-function legs
  for arena / wild / betrayal / tableTrial /
  coalitionArena / hostile / no-monster, plus real-tbEnd
  harness legs: a wild fight forced to 'lost' reads
  'the wild' in playerDeath, fallen, telemetry,
  lineage, and death line; a fight with
  state.arenaContest set forced to 'lost' reads
  'the arena' in all of them.
- P5 ARENA BRANCH: no arena-contest tbEnd loss appears
  in the pilot band (all 8 tbEnd deaths in the band are
  wild fights and relabeled); the arena branch is
  therefore judged by proof leg L8, as the prereg
  disclosed in advance — not by band counts.

CONFIRM-GO — all four confirm clauses hold (16 seeds
10040–10055 × 7 keys, 112 instances per leg, same
substrate; before leg run on the pre-change game.js via
a temporary checkout inside this worktree only, restored
byte-identical to HEAD afterward and re-proven):

- C1: zero before/after cause differences except
  proven-wild tbEnd losses changing 'the arena' →
  'the wild' (0 OTHER cause changes).
- C2: every tbEnd wild loss in the after band reads
  'the wild' in all five fields — 18 relabels across 16
  loss instances (the 7 pilot losses + 9 new losses on
  the wider seeds: 10048 animal_ken, 10052 molt,
  10053 molt, 10054 molt, and 10055 ambush /
  blood_trail / molt / patient_aim / scarecrow —
  plus successor-tail deaths inside the ambush,
  scarecrow, and 10055 molt instances).
- C3: no arena-contest tbEnd loss occurs in the confirm
  band either (every tbEnd death in the band is a wild
  fight and relabeled); the arena branch stays
  proof-leg L8, disclosed as in P5.
- C4: determinism as P3 on all 16 seeds — 0
  non-deterministic instances, 0 field disagreements
  in either leg.
- AMBIGUOUS-UNCHANGED count: 0 — no betrayal /
  table-trial / coalition-arena / hostile tbEnd loss
  appears in either band, so the conservative fallback
  was never exercised by the bands (it is exercised by
  proof legs L3–L6).

## Before/after numbers (pilot)

| instance | before cause (tbEnd) | after cause | fields agree after |
| --- | --- | --- | --- |
| 10041 animal_ken.read_beast (starvation) | starvation (endDay) | starvation | yes, all 5 |
| 10041 fear_aura.menace | the arena | the wild | yes, all 5 |
| 10041 molt.shed_skin | the arena | the wild | yes, all 5 |
| 10042 ambush.lay_wait | the arena ×2 (bearer + successor) | the wild ×2 | yes, all 5 |
| 10042 blood_trail.follow_blood | the arena | the wild | yes, all 5 |
| 10042 patient_aim.clean_shot | the arena | the wild | yes, all 5 |
| 10042 scarecrow.stage_injury | the arena ×2 (bearer + successor) | the wild ×2 | yes, all 5 |

Analyzer: node scripts/analyze-arenalabel-b.js
<beforeDir> <afterDir> — pilot summary: 56 instances
compared, 0 missing after, 8 wild relabels, 0 OTHER
cause changes, 0 non-deterministic, 0 field
disagreements in either leg, 7/7 loss reproduction.

## Sense test (plain words — what the player reads)

Before (seed 10042, ambush, day 7, from the corpus
sayLines): the bearer is hit by the Swarm Hum again
and again — "The Swarm Hum hits you for 8. You go
down." — and then: "🕯️ Kenneth Neumann is dead —
the arena." Nothing in that night was an arena: no
crowd, no gate, no contest framing, just a swarm in
the grass. The mourning beat itself is right; the
place-name is wrong.

After (same instance, same fight, same blows):
"💥 Swarm Hum! The Swarm Hum hits you for 8. You go
down. 🕯️ Kenneth Neumann is dead — the wild." The
beat is unchanged — the village still stops, somebody
still screams, somebody else still starts digging, and
Liam still wakes up somebody else — but the death now
names the place the player actually died. The
successor's own day-9 death reads the same way:
"Liam Davis is dead — the wild." As a player, the
after line answers the question the before line raised
("what arena?") instead of raising it.

## Reachability verdict

Reachability is unchanged by construction and by
measurement: the change moves no gate, no wave, no
scale, no table path — P3 determinism (identical
endReasons, identical grant-loss localization, identical
tap outcomes on all 56 pilot instances) is the evidence
that nothing reachable moved. Waves, arcs, regional →
national, the table, and the win flag are exactly as
reachable as they were before this arm; this arm's job
was a label, and the label is the only thing that moved.

## Village assessment (plain words)

The village in these instances is the grantdeath village:
a bearer who walks out at night, gets woken by wild
things, and dies in the grass while the village keeps
its pantry and its journal. Nothing about that story
changes here — the same people thrive and die for the
same reasons, the same knowledge is missing or present.
The blank this arm fills is narrow and honest: the
village's own record of WHY its bearer died no longer
lies about where. A death record that says "the wild"
when the bearer died in the wild is a record the next
bearer — and the player reading the Codex — can trust.
That trust is the whole point of the mantle's
paperwork; the arena label broke it for the most common
death in this band.

## Guards

- scripts/test-grantdeath-b.js: 8/8 PROOF-GREEN
  (instrument unaffected by the label change).
- scripts/test-abilities-breakit-r4-20261011.js: 36
  passed, 2 failed — the 2 failures are HELD
  tripwires about dead-ability (14 expected, 28 found)
  and undiscoverable-synergy (15 expected, 17 found)
  counts. Verified PRE-EXISTING: the identical 36/2
  result reproduces on the pre-change game.js, and the
  restored game.js is byte-identical to HEAD. They
  count abilities data, not death labels, and this arm
  touches neither.
- node scripts/check.js --quick: STARTED but produced
  no output for 7+ minutes past the two proof suites
  and was killed (SIGTERM) to unblock the arm. That
  stall is reported here, not hidden: the targeted
  death-related guards above are green, but a full
  quick-check pass was NOT obtained in this run. The
  coordinator should treat that as an open item, not
  as a green light — see follow-ups.
- No jest run in this arm (proofs are node scripts);
  no concurrent jest anywhere.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, as
pre-registered: a label-only change has no game leg a
panel can judge, panel metrics (national / table /
wins, wave reach) cannot move under it, and the
determinism clauses (P3/C4) are the binding guard that
they did not. If P3/C4 had failed, a panel compare
would have been run before any landing claim.

## Metric review (MEASUREMENT.md §14)

Judged against the prereg as written, no mid-run
re-scoring. Two disclosures for the next run, neither
a verdict change:

- The prereg's P2 counted "the 6 tbEnd wild losses"
  (the grant losses). The band actually contains 8
  tbEnd deaths (the 6 grant losses + 2 successor-tail
  deaths in the same instances). All 8 relabeled under
  the same rule and are counted in the analyzer's wild
  relabel total; the verdict reads P2 as holding for
  the 6 named losses AND the 2 tail deaths, because
  the rule — not the count — is what was
  pre-registered. A future prereg should count "every
  tbEnd death in the band" explicitly.
- The arena branch remains proof-only, not band-proven:
  no arena-contest loss occurs in either band (pilot
  or, if confirm agrees, confirm). That is a property
  of the substrate (sleep-interruption wild fights),
  not of the code: the arena path is exercised by proof
  leg L8 through the real tbEnd, but a band that
  actually contains a contest-arena loss would be a
  stronger check. Proposed for a future arm: an
  arena-contest substrate that forces a contest loss.

## Proof

- node scripts/test-arenalabel-b.js — 13/13, exit 0
  (proof green BEFORE the judged after-band).
- Pilot: before leg + after leg, 56 instances each,
  corpora evidence/2026-10-28/sim-arenalabel-b-corpus-before/
  and sim-arenalabel-b-corpus-after/; analyzer
  scripts/analyze-arenalabel-b.js.
- Confirm: before leg + after leg, 112 instances each,
  corpora evidence/2026-10-28/sim-arenalabel-b-corpus-confirm-before/
  and sim-arenalabel-b-corpus-confirm-after/; analyzer
  scripts/analyze-arenalabel-b.js (112 compared, 0
  missing after, 18 wild relabels, 0 OTHER changes,
  0 non-deterministic, 0 disagreements).

## Follow-ups (for the coordinator to append to the goal hidden_files/sim-findings.md — this arm does not edit that file from the worktree)

- [open] tbEnd origin fallback: betrayal, table-trial,
  titan coalition-arena, and alien-hostile tbEnd losses
  still read 'the arena' by the conservative fallback
  in tbFightDeathCause. Future arm: name those origins
  honestly (e.g. betrayal → its own cause) once a
  substrate reproduces them. (sim-arenalabel-b)
- [open] check.js --quick stalled with no output for
  7+ minutes in this run (killed to unblock the arm);
  targeted death guards are green but no full
  quick-check pass was obtained. Re-run check.js
  --quick standalone before landing if the ship loop
  requires it. (sim-arenalabel-b)
- [open] Arena-contest loss band: no contest-arena loss
  occurs in the grantdeath substrate, so the arena
  branch is proof-only (leg L8). A future arm should
  build a contest-loss substrate to band-prove it.
  (sim-arenalabel-b)
- [open] Breakit tripwire drift: dead-ability count 28
  vs 14 expected, undiscoverable-synergy 17 vs 15
  expected (pre-existing, verified on pre-change code).
  Somebody owns that drift; it is not this arm's.
  (sim-arenalabel-b)

## Convergence line

tbEnd death-label origin fix — pilot 8 seeds × 7 keys
(56 instances/leg), before/after on identical seeds:
7/7 grantdeath losses reproduce; 6 grant tbEnd wild
losses + 2 successor-tail tbEnd deaths relabel
'the arena' → 'the wild' in all five death-record
fields (playerDeath, registerDeath, fallen, telemetry,
narration line); starvation unchanged; 0 other cause
changes; 0 non-deterministic instances; proof 13/13
including real-tbEnd wild + arena legs and lineage
agreement. Arena-contest losses keep 'the arena'
(proof leg); betrayal / table-trial / coalition /
hostile origins keep 'the arena' by documented
conservative fallback.

## Verdict (judged against the pre-registered bar, not re-scored): PILOT-GO + CONFIRM-GO — ready for coordinator merge, pending ship
