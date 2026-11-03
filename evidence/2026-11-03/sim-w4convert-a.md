# Wave-4 kill-conversion split — Loop A, run fleshout-20261103T1819Z, arm sim-w4convert-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js, zero game-code change. This arm SPLITS the
vetbar conversion failure; it does not fix it.

## Pre-registration (committed before any judged sim)

`evidence/2026-11-03/sim-w4convert-a-prereg.md` (commit
7d837a4c7). Policy `scripts/policies/competent.js` `{competent}`
VERBATIM, default env. Seeds 99101–99108 (the vetbar band).
Horizon 140 days, death-aware. Balanced panel (§15):
INAPPLICABLE — a pure diagnostic with no before/after change, so
no comparison is fabricated; the binding check is the census
reconciliation below.

## What the prereg assumed, and what actually happened

The prereg assumed the 99101–99108 band would reproduce the
vetbar census exposures (71 spawns / 37 TB starts / 33 field
fights / 5 kills) so the split would describe those exposures.
It did NOT reproduce them — and the reason is proven, not
assumed (see "Reconciliation"): the game moved between the
vetbar anchor and this arm's anchor. The split below is
therefore the CURRENT-ANCHOR split (28 exposures, 2 kills), NOT
a re-description of the vetbar census. Any next fix arm must
re-baseline on the current anchor, not on vetbar's 70 exposures.

## Reconciliation — diverged, with cause (proven by control)

| seed | vetbar census (spawns/TB/field/kills/days) | this arm (spawns/TB/field/kills/days) | unmodified census driver at THIS anchor |
|------|--------------------------------------------|----------------------------------------|------------------------------------------|
| 99101 | 14 / 7 / 9 / 0 / 101 | 10 / 10 / 2 / 0 / 71 | 10 / 10 / 2 / 0 / 71 — MATCHES this arm |
| 99102 | 12 / 11 / 5 / 2 / 115 | 5 / 5 / 0 / 0 / 108 | 5 / 5 / 0 / 0 / 108 — MATCHES |
| 99103 | 0 / 0 / 0 / 0 / 140 survived | 0 / 0 / 0 / 0 / 85 lost | 0 / 0 / 0 / 0 / 85 — MATCHES |
| 99104 | 8 / 10 / 5 / 1 / 107 | 2 / 0 / 0 / 0 / 97 | 2 / 0 / 0 / 0 / 97 — MATCHES |
| 99105 | 2 / 6 / 0 / 0 / 92 | 3 / 0 / 3 / 0 / 100 | 3 / 0 / 3 / 0 / 100 — MATCHES |
| 99106 | 21 / 3 / 8 / 2 / 139 | 9 / 5 / 0 / 0 / 95 | 9 / 5 / 0 / 0 / 95 — MATCHES |
| 99107 | 4 / 0 / 2 / 0 / 90 | 3 / 2 / 0 / 2 / 80 | 3 / 2 / 0 / 2 / 80 — MATCHES |
| 99108 | 10 / 0 / 4 / 0 / 123 | 3 / 1 / 0 / 0 / 71 | 3 / 1 / 0 / 0 / 71 — MATCHES |
| TOTAL | 71 / 37 / 33 / 5 | 35 / 23 / 5 / 2 | identical to this arm, all 8 seeds |

Cause: `git diff` between the vetbar census anchor
(73513b77) and this arm's anchor shows game-code changes in
`src/js/win-plan.js` (new, 664 lines), `src/js/table.js`,
`src/js/villager-agency.js`, `src/js/villager-objectives.js`,
and `src/js/ledger.js` — landed via the journey-landing r74
rebase onto current master after vetbar ran. The harness mode
string is ruled out as a cause: `sim-harness.js` seeds
`Math.random` from the seed alone, and vetbar's own pilot vs
census (different mode strings) matched identity exactly.
Instrument perturbation is ruled out as a cause: the
unmodified census driver reproduces this arm's numbers exactly
on all 8 seeds at this anchor (days, end reason, spawns, TB
starts, field fights, kills — all identical), so this arm's
instrument is trajectory-neutral on this band.

Known definitional gap, no effect here: the census counted
`startCombat` CALLS, this arm counts STARTED fights. On this
band tbCalls == tbStarted on all 8 seeds (23 == 23), so the gap
contributes zero to the divergence.

Instrument health: 0 instrument errors on all 8 seeds, 0
orphan TB ends, 0 unlinked kills, 0 dropped kill rows, 0
unclassified exposures, 0 unclassified killers. Wrap fire
counts are non-zero wherever the corresponding event exists
(e.g. 99101: startCombat 17 calls, tbEnd 17, fieldFight 63,
recordWaveKill 45 — all-wave counts; the wave-4 subsets are the
tables below). One bookkeeping note: tbEnd call counts can
exceed start counts by a call (99102: 22 starts, 23 tbEnds)
because the wrap counts repeat/no-op tbEnd calls too; ends are
recorded only from non-over fights, and with 0 orphan ends and
0 unended TB exposures no fight end was missed or double-counted.

## Per-seed split

| seed | days | end | spawns | TB | field | exposures | kills | classes |
|------|------|-----|--------|----|-------|-----------|-------|---------|
| 99101 | 71 | lost | 10 | 10 | 2 | 12 | 0 | TB lost 10; field died 2 |
| 99102 | 108 | lost | 5 | 5 | 0 | 5 | 0 | TB lost 5 |
| 99103 | 85 | lost | 0 | 0 | 0 | 0 | 0 | no wave-4 activity (maxWave 3) |
| 99104 | 97 | lost | 2 | 0 | 0 | 0 | 0 | 2 spawns, never fought (fate UNRECORDED) |
| 99105 | 100 | lost | 3 | 0 | 3 | 3 | 0 | field fled 2, field died 1 |
| 99106 | 95 | lost | 9 | 5 | 0 | 5 | 0 | TB lost 5 |
| 99107 | 80 | lost | 3 | 2 | 0 | 2 | 2 | TB won 2 (see killers) |
| 99108 | 71 | lost | 3 | 1 | 0 | 1 | 0 | TB lost 1 |
| TOTAL | — | 8 lost | 35 | 23 | 5 | 28 | 2 | died 24, fled 2, kill 2 |

No routed, no monster-fled, no evaded, no already-dead, no
tb-unended, no field-unresolved exposures at this anchor.
Every TB fight that started ended (21 lost, 2 won); every
field fight ended in death or flight (3 died, 2 fled, 0 kills).

## Pooled splits (primary metrics)

Conversion overall: 2 kill rows / 28 exposures = 0.0714 kills
per exposure; 2 killing exposures / 28 = 0.0714. (Numerically
identical to vetbar's 5/70 = 0.0714 — the per-exposure rate did
NOT move; the collapse is in exposure count and survival, see
below. With n = 28 vs 70 this equality is descriptive, not a
claim that the rate is pinned.)

By fight type: TB 2/23 = 0.087; field 0/5 = 0.000. The only
kills in the band are turn-based.

By party size at fight start: solo 0/15 = 0.000; +ally 2/13 =
0.154. Split by party AND type: TB solo 0/14; TB +ally 2/9 =
0.222; field solo 0/1 (fled); field +ally 0/4 (died 3, fled 1).
Party is the only split with any kills at all — and even with
allies, 7 of 9 TB +ally fights end lost.

By lead-fighter gear class: the split is DEGENERATE at this
anchor — all 28 lead fighters read armed AND armored (armorP
range 6–67; weapons from Stone knife to Phase blade; the two
null-weapon reads are armed via a carried weapon item). So:
armed 2/28 vs unarmed — no unarmed cell; armored 2/28 vs
unarmored — no unarmored cell. The only gear variance is the
readiness bucket: ready-geared (armorP >= 15 AND armed) 2/23 =
0.087; not-ready-geared 0/5 = 0.000. Gear does NOT differentiate
outcomes for LEADS at this anchor: geared leads still lose 20
of 23 ready-geared fights. (Party members' gear was recorded
per fight but not split here; the lead-gear degeneracy is the
finding, not a reason to re-split on companions post hoc.)

By monster: eater 0/5, algorithm 0/8, reunion 0/4, eulogy 0/5
(all died); suburb 1/4 (1 kill, 1 died, 2 fled); congregation
1/1 (kill); influencer 0/1 (died). The two kills are different
beasts on one seed, not a single farmable type.

Spawn-to-exposure (descriptive, not a reconciliation item):
35 spawns vs 28 exposures. Two seeds drive the gap: 99106
(9 spawns, 5 exposures) and 99104 (2 spawns, 0 exposures —
both at tile (4,3), days 83 and 87, village died day 97
without ever engaging them). The engine records no spawn-fate
event, so whether those beasts despawned, wandered off, or
were still roaming at village death is UNRECORDED, never
guessed. Conversely 99101 has 12 exposures from 10 spawns:
some TB fights originate from non-spawn sources (traps,
contests, lingering encounters), so spawns are not a
denominator for exposures.

## Killer survival — the second failure, separately judged

Both killers, both on seed 99107, both ALIVE at horizon end:

| killer | kill | via | fight end | death day | class | cause |
|--------|------|-----|-----------|-----------|-------|-------|
| sam_wilson | day 74, suburb | companion (in ursula_weber's TB fight) | alive | — | alive | UNRECORDED (no death event: still living) |
| ursula_weber | day 76, congregation | player (own TB fight) | alive | — | alive | UNRECORDED (no death event: still living) |

Days kill-to-death: not applicable (no deaths). Killer
survival is NOT a failure at this anchor: 2/2 alive, against
vetbar's 4/5 dead. The failure moved: conversion is still
~1-in-14 per exposure, but exposures halved (28 vs 70) and
villages die earlier (median survival 90 days vs vetbar's
111; 8/8 lost vs 7/8 lost + 1 survivor). Mandatory vs
voluntary arena participation: UNRECORDED for every killer
(the engine records death causes, not participation mode).

Readiness-5 consequence on 99107: veterans 0 → 1 on day 74 →
2 on day 76, readiness-5 ready days 76–80 (armored 4/4, armed
6–7/6, tricks 20/3, veterans 2/2) — the ONLY ready-5 days in
the band — and the village STILL lost on day 80. Banking two
veterans did not save the village; standing/release beyond
readiness was not reached before death. The other near-miss
seed, 99105, ends short on veterans alone (armored 6/4, armed
7/6, tricks 32/3, veterans 0/2).

## Village assessment (plain words + sense-testing)

Picture eight villages playing competently for up to 140
days. All eight die; none reaches wave 5; the median village
lasts 90 days. Wave-4 beasts still show up (35 spawns), but
villagers fight them only 28 times and kill twice — both
times on the same village, both times with allies beside the
scholar, and that village still dies four days after banking
its second veteran. Everywhere else the story is the same:
a geared villager meets a wave-4 beast and loses. Solo
fighters never kill (0 for 15); field fighters never kill
(0 for 5); geared fighters lose anyway (20 of 23
ready-geared fights end lost).

The sense-test passes on coherence and fails on consequence
in exactly the way the numbers say. On 99101 the death spiral
reads like people, not counters: the scholar fights a wave-4
beast on day 57 and dies ("the arena" in the death record),
a successor fights on day 61 and dies ("the wild"), another
successor the same day, another on day 62, then four more
scholars die on day 70 alone — each new adventurer walking
into the next wave-4 fight and losing it, the village
burning through its leaders in two weeks. Nothing robotic
was flagged: killers are named (a companion's killing blow
on 99107 is credited to sam_wilson, not to the scholar),
deaths follow fights with engine-recorded causes ("the
wild", "monster", "sickness", "a wound that wouldn't
close"), and the one village that banks veterans is
narratively legible (companion kill, then the scholar's own
kill two days later, readiness bar filling). The failure is
not that villagers act wrongly — it is that fighting a
wave-4 beast, alone or geared, almost always ends in their
death, so the village cannot accumulate the wins its own
readiness bar demands. One honest caveat from the death
record: 99101's first scholar death is recorded as "the
arena" on the same day as a lost wave-4 TB fight; the death
tele names the cause, not the fight, so arena-vs-wild
attribution for that single death is not proven from this
instrument — participation mode stays UNRECORDED throughout.

## Wall numbers (this run, current anchor — not wall movement)

Wins 0/8. Villages lost 8/8, survived 0/8. National / table:
not instrumented by this arm. Wave-5 unlocks 0/8, wave-5
faced 0/8, wave-4 faced 7/8 (99103 never reaches wave 4).
Readiness-5-ready days: 5, all on 99107. Median survival 90
days (vetbar band: 111 days). These are the current-anchor
baseline the next arm measures against.

## Metric review (§14 — no in-run re-scoring)

- The prereg's "same exposures as vetbar" premise failed on
  a base move, not on the instrument: the control run proves
  it. No metric was re-scored: the split tables above use
  exactly the pre-registered classes and buckets. The
  vetbar-band comparison is reported as diverged-with-cause,
  not adjusted.
- The gear buckets were pre-registered as three splits; two
  came out degenerate (no unarmed/unarmored leads). That is
  reported as a finding (leads are geared at this anchor),
  not re-bucketed post hoc to manufacture variance.
- The kills-per-exposure rate equality with vetbar (0.0714
  both) is a numerical coincidence at n = 28 vs 70 and must
  not be cited as "conversion is stable" — the exposure
  count, the survival distribution, and the killer-survival
  split all moved.
- Proposed revision for the NEXT arm's prereg (not applied
  here): pre-register a calibration gate — rerun the
  previous arm's instrument on one seed at the new anchor
  BEFORE the judged leg, and if it diverges, re-baseline
  explicitly instead of assuming the band reproduces. This
  arm paid that cost after the leg; the next arm should pay
  it before.
- Horizon note: 140 days was adequate (all 8 villages died
  before the cap); no horizon change proposed.

## Verdict — DIAG-GO (current-anchor split)

0 instrument errors; census reconciliation explained
(diverged-with-cause, proven by the unmodified-census-driver
control on all 8 seeds); every exposure classified (0
unclassified, 0 unended, 0 unresolved); every killer
classified (2 alive, 0 unclassified); proof test 8/8. The
GO covers the diagnostic on the current anchor only. It
does NOT re-describe the vetbar census band, and the vetbar
numbers must not be cited as the current baseline.

## Next fix arms, precisely (no fix in this run)

1. TURN-BASED LETHALITY (the binding split): TB fights end
   lost 21/23; solo TB 0/14 kills; TB +ally 2/9. Lever:
   damage/staying inside turn-based fights — why a geared
   party deals too little or dies too fast against wave-4
   beasts. Owner: coordinate with the win-fielddmg lane
   (damage/staying territory); if TB lethality is outside
   that lane's charter, it needs its own named arm — do not
   let it fall between lanes. Next prereg must re-baseline
   on the current anchor first (calibration gate, see metric
   review).
2. PARTY (the only split with kills): solo 0/15 vs +ally
   2/13. Lever: party formation/presence at fight start.
   Owner: win-allyjoin lane — this arm's numbers support
   their direction (kills happen only with allies) but do
   not duplicate their code.
3. NO gear-wearing arm from this split: leads are already
   armed and armored at this anchor and still lose. The
   gearbar question is answered for leads here; a
   companion-gear split would be a new question, not a
   continuation of this one.
4. NO killer-survival arm from this split: 2/2 killers
   alive at this anchor. Vetbar's attrition failure does
   not reproduce here — do not re-litigate it until a
   future band shows killers dying again.
5. HELD, not chased (outside this arm, logged in
   sim-findings.md): what the win-plan/table/agency/
   objectives/ledger changes between anchors did to
   survival and exposure counts (median 111 → 90 days,
   exposures 70 → 28, all 8 villages lost). That is a
   before/after question for the coordinator, not a
   mid-run chase for this diagnostic arm.

## Proof and landing

- `scripts/test-w4convert-20261103.js`: 8/8 (TB/field
  classes, gear buckets, split math + dropped rows, killer
  survival classes, census constants, stub known-fight
  firing + exact linkage + unlinked reporting, live-harness
  smoke).
- Arm commits on branch sim-w4convert-a: prereg 7d837a4c7,
  instruments e742fa57 (scripts only, zero src/js). This
  evidence file + the 8 per-seed JSONs
  (`perseed-w4convert-a/`) + the 8 control census JSONs
  (`perseed-vetbar-census-a/*-w4convert-check.json`) commit
  on the same branch, pending coordinator merge --ff-only,
  pending ship (the ship loop owns version bumps, pushes,
  live verification).
- check.js --quick NOT re-run in full: zero src/js changed,
  same standing caveat as prior tooling-only landings; the
  arm's own proof (8/8) was run before the judged leg.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; baseline NOT rolled
  on a refusal, per prior runs). Note for the coordinator:
  the scale-wall baseline WILL deviate on this band
  (national/table/wins all 0, survival down) — the
  deviation is the anchor move documented above, not an
  instrument artifact; the control run is the evidence.
