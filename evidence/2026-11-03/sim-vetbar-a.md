# Veterans-bar autopsy — Loop A recovery + verdict (run fleshout-loop-a-20261103T1715Z)

Axis: scale-onramp (standing directive: the scale wall). This is a
STALE-LOCK RECOVERY of dead run fleshout-loop-a-20261103T1415Z, not a
fresh arm: the 1415Z coordinator died after its vetbar worker finished
its pilot and census but before any analysis, evidence, or landing.
Recovery triple-check (recorded on the retired claim's .DEAD.note):
lock run 1415Z; its tree sim-vetbar-a heartbeat 2026-11-03T15:27:40Z
(109 min stale at recovery); last worktree file write 16:18Z (58 min
stale); no vetbar/gearbar process. Sibling Loop B live on food-economy
(1630Z claim, fresh heartbeats, running processes) was NOT touched;
its lock was NOT touched. The win lanes (ally-join, field-damage,
national) were NOT touched — they are part of this arm's baseline,
already on master, not this arm's change. The 1415Z second arm
sim-gearbar-a never started (no tree, no branch) and is NOT landed
here; it is carried as next blank 2 below.

## Pre-registration (committed before any judged sim, 9bfce6637)

Full text: `evidence/2026-11-03/sim-vetbar-a-prereg.md`. In short:

- Question: is the readiness-5 veterans shortfall a COUNTING bug
  (living killers not counted) or a production/attrition shortfall?
  Grounding: the w5faced-competent corpus (e534dc00f, 20 seeds) showed
  veterans short at end on 20/20 seeds, met transiently only on the one
  releasing seed; readiness-5 release is the wall.
- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. Seeds: 8 fresh seeds 99101–99108 (no overlap with the
  w5faced 989xx band). Horizon: 140 days, death-aware (dead villages
  stop simulating; the one survivor ran to the cap).
- Instrument: wrap `recordWaveKill` + `recordPyrrhicKill`; daily
  snapshots of wave-4+ kills, per-killer liveness, and
  `waveCombatReadiness(5)` bars. A second census instrument recorded
  wave-4 spawns, fight starts, field fights, and outcomes.
- Phase 1 (diagnostic) succeeds iff: 0 instrument errors, every
  wrapped kill row reconciles to a log entry or a named drop, and
  every wave-4+ kill classifies into exactly one loss class.
- Phase 2 (fix + identical-seed rerun) triggers ONLY on a mechanism
  bug (class 5, alive-but-uncounted, or another counting/attribution
  defect). A numbers shortfall (classes 1–4 dominating, gate counting
  correctly) is a CLEAN KILL of this arm: no fix is forced, the blank
  is documented precisely, and the run ends.
- Phase 2 GO (fixed, judged later, never applied here): fixed arm
  beats baseline by >= 1 distinct living veteran on >= 2/8 pilot
  seeds AND no pilot seed loses a veteran vs baseline.
- Hard limits (binding, honored): no `readyDemand`, t4/t5, or
  `plentyCapT5` change; no win-price/deed-gate change; no wild-router
  ally-join code, no field-fight damage/staying code, no
  national-standing code, no equipment/armor/weapon wearing code
  (sibling gearbar territory).
- Balanced panel (§15): inapplicable per prereg — this corpus is a
  custom kill-attribution instrument, not a sweep output. The binding
  comparison is the paired identical-seed diff in the analyzer, and
  no fix was triggered, so no comparison was fabricated.

## Phase 1 results — pilot (analyzer: scripts/vetbar-analyze-20261103.js)

Per-seed chain (days / end / maxWave / standing / wave-4 kills /
distinct killers / living killers at end / readiness-5 veterans /
ready-5 days):

| seed | days | end | maxWave | standing | w4 kills | killers | living | vet | ready5d | chain |
|------|------|-----|---------|----------|----------|---------|--------|-----|---------|-------|
| 99101 | 101 | village-lost | 4 | 145 | 0 | 0 | 0 | 0 | 0 | — |
| 99102 | 115 | village-lost | 4 | 199 | 2 | 2 | 0 | 0 | 0 | rosa_mendez died-same-fight; wanjiru_kamau died-later |
| 99103 | 140 | survived | 3 | 99 | 0 | 0 | 0 | 0 | 0 | — |
| 99104 | 107 | village-lost | 4 | 175 | 1 | 1 | 0 | 0 | 0 | gen_f71dv42 died-later |
| 99105 | 92 | village-lost | 4 | 125 | 0 | 0 | 0 | 0 | 0 | — |
| 99106 | 139 | village-lost | 4 | 199 | 2 | 2 | 1 | 1 | 0 | leo_martin died-later; visjoin_133 counted |
| 99107 | 90 | village-lost | 4 | 175 | 0 | 0 | 0 | 0 | 0 | — |
| 99108 | 123 | village-lost | 4 | 165 | 0 | 0 | 0 | 0 | 0 | — |

Aggregate: 8 seeds, 5 wave-4+ kills, 5 distinct killers, 1 living
killer at end, readiness-5 veterans at end max 1 (never the 2 the
gate needs), readiness-5-ready days 0/8. Instrument errors 0,
unreconciled seeds 0, gate-mismatch seeds 0, gate-mismatch days 0.

Loss-class table (per killer, mutually exclusive, prereg order):

| class | count | meaning |
|-------|-------|---------|
| counted | 1 | alive at end and inside the readiness count (visjoin_133) |
| died-same-fight | 1 | normal kill, killer died the same day |
| died-later | 3 | killer alive on kill day, dead by end |
| pyrrhic | 0 | only kill(s) via lost-fight record |
| alive-but-uncounted (class 5) | 0 | — |
| unattributed | 0 | no null/unknown killer id |
| never-killed (seed level) | 5/8 seeds | no wave-4+ kill exists at all |

Phase 1 verdict: SUCCEEDS as a diagnostic. Every kill classified,
zero instrument errors, zero gate mismatches. The gate counts exactly
what the instrument recounts on all 8 seeds.

## Census — spawns vs kills (scripts/vetbar-census-driver-20261103.js)

| seed | wave-4 spawns | TB starts | field fights | kills |
|------|---------------|-----------|--------------|-------|
| 99101 | 14 | 7 | 9 | 0 |
| 99102 | 12 | 11 | 5 | 2 |
| 99103 | 0 | 0 | 0 | 0 |
| 99104 | 8 | 10 | 5 | 1 |
| 99105 | 2 | 6 | 0 | 0 |
| 99106 | 21 | 3 | 8 | 2 |
| 99107 | 4 | 0 | 2 | 0 |
| 99108 | 10 | 0 | 4 | 0 |
| TOTAL | 71 | 37 | 33 | 5 |

Wave-4 beasts are NOT scarce in this band: 71 spawns, 70 fight
exposures (37 turn-based starts + 33 field fights), 5 kills — about
1 kill per 14 exposures. The one seed with no wave-4 activity at all
(99103) is the survivor that never got past wave 3 (standing 99 at
the 140-day cap). Spawn scarcity is not the veterans story here;
kill conversion and killer survival are.

## Verdict — CLEAN KILL, no fix, no confirm

Class 5 = 0. There is no counting bug to fix: living killers ARE
counted (the one living killer, visjoin_133, is counted), dead
killers are correctly excluded, and the gate never disagrees with
the instrument recount. Per the prereg, Phase 2 does NOT trigger and
no confirm run is spent. This arm is KILLED cleanly, with the blank
documented precisely instead of a forced fix:

1. PRODUCTION: 5/8 seeds produce zero wave-4 kills at all, despite
   wave-4 fights on most seeds. Villagers meet wave-4 beasts and do
   not kill them.
2. ATTRITION: 4 of the 5 killers are dead by end of horizon (1 same
   fight, 3 later). Even when a kill happens, the veteran usually
   does not survive to count.
3. No mechanism excuse remains: attribution is clean (0
   unattributed), the liveness filter is correct, and the one
   counted killer proves the path works end to end.

## Village assessment (plain words)

Picture eight villages playing competently for up to 140 days.
Seven die; one limps to the horizon without ever reaching wave 4.
Median survival 111 days. Wave-4 monsters show up plenty — 71 of
them across the eight villages, and villagers fight them about 70
times — but they only manage 5 kills, and four of those five killers
are dead by the end, so the village almost never has two living
veterans at once, which is what the wave-5 door requires. Nobody
reaches readiness-5 on any day in any seed. The door is not jammed;
the village just does not kill wave-4 beasts often enough, and its
killers do not live long enough, for the door to open. That is a
fighting-and-survival problem, not a counting problem — and it sits
squarely on the winnability chain (wave-4 kills → veterans →
readiness-5 release → wave-5 facing), one link past the ally-join
and field-damage work already in the baseline.

Villagers act like people in the traces that matter here: killers
are named individuals (a scholar-successor chain on 99102, a joiner
on 99106 whose kill counts), not anonymous counters, and deaths
follow fights rather than appearing from nowhere. Nothing robotic
was flagged by this arm; the sense-test failure, if any, is the
opposite — villagers fight, die, and are succeeded, and still the
village cannot bank veterans.

## Wall numbers (this pilot, not wall movement)

Wins 0/8. Villages lost 7/8, survived to horizon 1/8. National /
table: not instrumented by this arm (it instruments readiness-5,
the gate before them); readiness-5-ready days 0/8 is the wall proxy,
and it did not move. Wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4
faced on 7/8 seeds. These are the baseline the next arm measures
against, not a claim that the wall moved.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The 140-day horizon was adequate for this question: 7/8 villages
  died before the cap, and the survivor's story (stuck at wave 3)
  is itself informative. No horizon change proposed.
- The loss-class scheme worked exactly as pre-registered; no class
  was added or reinterpreted after seeing the data. The one
  pre-registered doubt (death-day approximation from snapshot
  cadence) never mattered: death CLASS is terminal and unambiguous
  in all 5 cases.
- Proposed revision for the NEXT arm's prereg (not applied here):
  judge wave-4 kill conversion per exposure (kills per TB start +
  field fight) and killer survival separately, since this pilot
  shows they are two different failures. Do not re-score this pilot
  against that metric — its verdict stands on its own prereg.

## Next blanks, in order

1. Wave-4 kill conversion + killer survival, with its own prereg:
   why 70 exposures yield 5 kills, split by fight type (turn-based
   vs field), party size, and gear — and why killers die (same-fight
   wounds vs later deaths). Coordinate with, do not duplicate, the
   win-fielddmg lane (damage/staying) and the win-allyjoin lane.
2. Gearbar arm (1415Z claim, never started): armored/armed bars
   autopsy + wear/equip fix — the other half of the readiness-5
   shortfall named in the w5faced corpus (armor, weapons AND
   veterans short).
3. Readiness-5 release still 0 days: after blanks 1–2, re-measure
   release on identical seeds before any gate/price discussion
   (gates and prices stay untouched unless Steve orders otherwise).

## Proof and landing

- `scripts/test-vetbar-20261103.js`: 10/10 (fixture classes 1–6,
  gate-mismatch flag, dedupe drop, alive-but-uncounted detection,
  census instrument rows, live-harness kill→gate smoke).
- Arm commits on branch sim-vetbar-a: prereg 9bfce6637, instruments
  a30cd2704, census 73513b772 (scripts + evidence only, zero
  src/js). This evidence file + the 16 per-seed JSONs
  (perseed-vetbar-a, perseed-vetbar-census-a) commit on the same
  branch, rebased onto current master, merged --ff-only, pending
  ship (the ship loop owns version bumps, pushes, live verification).
- check.js --quick NOT re-run in full: zero src/js changed, same
  standing caveat as prior tooling-only landings; the arm's own
  proof (10/10) was re-run post-rebase.
- Telemetry deviation check: see the run closeout note (run by the
  coordinator after this evidence file; baseline NOT rolled on a
  refusal, per prior runs).
