# sim-scale-onramp-round-0320 — coordinator evidence (run fleshout-20261030T0320Z)

Axis: scale-onramp (blocking axis, converging, NOT converged).
Loop B live on food-economy at run start (0230Z claim: raidname-fix +
woodshort-ledger, NOT touched) -> this run worked scale-onramp.
Direction from run fleshout-20261030T0215Z (sim-partycounter-a,
DIAG-GO, NOT-BRIDGEABLE): the next arm must change what a fight is
for — NOT re-count heads on the tile, NOT re-narrate endings, NOT
lower win-prices to match broken behavior. Both arms below are DIAG,
measurement only, zero src/js changes, no default flip.

Band (both arms, shared): seeds 75101–75108, 180d death-aware,
tableseat-nowait substrate VERBATIM (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1). Each arm re-derived its own
before leg on current master; no shoutrec/partycounter band number is
quoted as current (finding #1457 substrate drift, honored).

## Arm 1 — sim-flipshape-a: survival gap by mechanism class (DIAG-NO-GO on coverage; NOT-BRIDGEABLE pooled)

Commits (rebased onto master 5963fcf4d, analyzer re-run post-rebase
reproduces the verdict exactly): prereg bdd15694b, instruments
dd12c1570, evidence 8b9ad86ca. Worker evidence:
evidence/2026-10-29/sim-flipshape-a.md + perseed-flipshape-a/.

Question: instead of damage, price the survival gap three ways for
lost shout-joined fights — (A) extra rounds the fighter must stay
past the shout, (B) damage-mitigation factor needed, (C) extra rounds
past the actual flee. Floor-branch (zero-window) fights and
active-zero-dealt deaths kept separate, partycounter discipline.

Verdict (binding prereg, no mid-run re-scoring): DIAG-NO-GO, failing
leg coverage only. Joint pricing 8/12 = 66.7% (bar 80%); the 4 misses
are one shape — incoming leader damage after the shout exactly zero
(the ally tanks every post-shout hit while the leader still flees on
trajectory), so class B has no denominator. Join integrity PASS,
sense PASS (6 transcripts), determinism PASS (seed 75106 byte-
identical), addressable-lost size 12 (>= 8) PASS.

Substance on the 8 jointly priced fights, all pooled readings
non-bridgeable: staying (A) median 18.84 rounds, flee-window (C)
median 21.36 rounds, mitigation (B) median f 0.85 with exactly 50%
already at f = 1.0 (pre-registered NOT-THE-LEVER guard). Wave split:
wave 1 BRIDGEABLE (A 0.38 / C 1.46 rounds, 3 of 4 within 2 rounds);
wave 3 single priced fight 35.60 / 37.60 rounds; wave 4 wall
(A 38.54 / C 38.32 rounds, n = 3). A 1–2 round hold (Rally / War Cry
size) flips 3 of 8 priced lost fights — all wave 1 — and touches no
priced wave-3/4 fight.

Ranked next (worker, no behavior built here): (1) DO NOT build a
staying/hold mechanism for the pooled gap; (2) DO NOT build a
mitigation mechanism for the pooled gap (half the priced fights were
already above the flee floor when they ran; a third of
addressable-lost fights took no leader damage after the shout);
(3) the wave-1 slice is the only bridgeable mechanism finding, and
it is small — it must not be sold as closing the scale wall;
(4) floor branch (7/20 shout-joined lost, 35.0%) and the new
ally-tanking shape remain separate Steve-call questions (floor:
ally gets one strike / suppress the futile shout / leave the honest
tragedy; ally-tanking: should the hopeless judgment still fire on
the old trajectory once the ally holds the monster?);
(5) THE NEXT ARM MUST CHANGE WHAT A MEETING IS, NOT WHAT A FIGHT
IS — candidate directions in order: (a) wave-4 meeting shape (who
meets wave-4 monsters, alone or warned; whether readiness bars
should gate the meeting rather than the wave), (b) the hopeless
threshold as a perception question, (c) the ally-tanking morale
question.

## Arm 2 — sim-w4shape-a: wave-4 meeting shape re-baselined (DIAG-GO)

Commits (rebased onto master 5963fcf4d, then onto 8b9ad86ca after
the flipshape merge; analyzer re-run green after both rebases):
prereg aca3a608d, instruments 28287fbbc, evidence 838e2384b. Worker
evidence: evidence/2026-10-29/sim-w4shape-a.md +
perseed-w4shape-a/.

Question: finding #1437 ordered a wave-4 re-baseline before any
wave-4 lever judgment (W4DPR2 band no longer reproduced: wave-4 wild
meetings 24 -> 9). This arm is that re-baseline, on current master.

Verdict: DIAG-GO. Completeness PASS (8/8 seeds, joins 975/975, 0
errors, OTHER = 0), determinism PASS (seed 75102 byte-identical),
sense PASS (all 13 fought wave-4 logs read, not just the 3 the bar
required), fixtures PASS (28 checks). Stale-band verdict: REPAIRED
— a complete, deterministic, citable current-master baseline now
exists; the breakline-era picture is superseded, not reproduced.

Findings: 13 wave-4 meetings, ALL on one seed (75102), days 55–79,
all fought (no pre-contact scatter at wave 4 — beasts arrive at
700–1,200 HP, far above break lines). By shape: wild 11, raid 2,
other 0. Outcomes: kills 0, drive-offs 0, flees 7, deaths 6 (46%).
Wave-4 unlock 5/8 seeds but wave-4 contact on 1/8 — unlocking wave 4
is not meeting wave 4. The 13 meetings are 5 beasts met repeatedly
(eulogy 4x, algorithm 5x, audit 2x, herald 1x, reunion 1x); wounds
persist across meetings (eulogy 900 -> 877 -> 853 HP) but at
observed damage it would take ~70 more meetings to finish the
eulogy, ~90 for the algorithm. 4/13 meetings deal zero damage.
Tile mates present in 10/13, allies join in 3, dealing 6, 5, 4
against 853–1,008 HP remaining. Ammo gap audible in 8/13 transcripts
("the string stays drawn, useless"), 0 volleys fired.

Ranked next (worker, no lever built here): (1) CHAIN-FINISH /
ZERO-DEALT measurement, wild shape only (LICENSED, n = 11):
decompose the zero-dealt class per cause and price how many
re-meetings finish each beast — a re-meeting that finishes vs one
that re-loses; (2) join effectiveness at wave-4 scale; (3) raid
shape INSUFFICIENT-DATA (n = 2) — no raid lever judgment from 2
meetings; (4) ammo at wave 4, ranked below chain work (a volley is
small against 900+ HP); (5) other-shape wave-4 absence (n = 0) is
itself an encounter-rate finding, not a lever target.

## Wall numbers (this band, both corpora agree exactly)

Won 6/8, all lesser seats (full 0). National ever 6/8, national
final 6/8. Table reached 7/8, entered 6/8. Wave reach: 1: 8/8,
2: 8/8, 3: 6/8, 4: 5/8, 5: 0/8. Median survival 114d (analyzer
upper-middle convention; statistical median 107.5d). Deaths 232
total, starvation 2. Death causes: villager:combat 90,
villager:villager combat 73, player:the wild 23,
villager:expedition 15, villager:monster 11, rest small. This band
does not starve; it is killed in combat. Wall numbers identical to
the 0215Z run's band — no substrate drift this run.

## Reachability verdict

Waves 1–4 reachable as unlocks; wave 5 reached 0/8, full seat 0/8.
Wave-4 contact is the narrower gate: unlocked on 5 seeds, met on 1.
Wave-4 kills on the band: 0. The scale wall is now a meeting
question, not a fight question: lone fighters meet fresh wave-4
monsters at full HP, and no hold, shield, or softening priced in
either arm turns those fights into drive-offs.

## Village assessment (plain words)

Picture a village that holds together and even wins — through the
lesser seat, six times out of eight — but never grows into the full
seat, and never meets the monsters the next wave would demand it
beat. Its fighters lose the fights that matter not because they
break too early but because the monster still has most of its
health left when they run: the median lost fight ends with about
180 hit points still standing, and the fighter deals about 10 a
round. Against the smallest beasts, one more round of courage
would flip the fight — but those are not the fights blocking the
climb. Against wave-4 beasts, the village would need to stand
about 38 more rounds, which is not a fight anymore, it is a siege
nobody signed up for. The same five beasts keep coming back,
wounded but never finished, because every meeting starts almost
from scratch and some meetings deal no damage at all. Nobody
starves on this band. They die in combat, or in fights with each
other, while the table stays in reach but the full seat stays
empty.

## Blanks filled or documented

- FILLED (measurement): mechanism-class pricing of the survival
  gap — no pooled class bridges; wave-1 slice only (flipshape).
- FILLED (measurement): current-master wave-4 meeting baseline —
  stale #1437 band repaired and superseded (w4shape).
- DOCUMENTED (not built): ally-tanking morale perception question
  and floor-branch options — Steve-call questions, not silent
  builds. Chain-finish / zero-dealt measurement — ranked next for
  the following arm. Raid-shape wave-4 and other-shape wave-4 —
  insufficient data, no judgment offered.

## Metric review (nothing re-scored this run)

- FLIPSHAPE mitigation denominator (worker proposal for the NEXT
  run): price B = 1.0 with an "incoming-post-zero: window already
  survived" flag when incomingPost = 0. Sensitivity (labeled, NOT
  the verdict): joint coverage would be 12/12, pooled B median
  1.00 (f = 1.0 share 8/12), A/C medians over the full 12 would be
  8.16 / 14.54 rounds — still above the 4-round PARTIAL line. The
  revision would move the instrument verdict to DIAG-GO without
  moving any substance reading; it belongs to the next run's
  prereg, not to this run's verdict. The binding DIAG-NO-GO on
  coverage stands in the worker evidence.
- W4SHAPE: lever-license threshold (>= 5 meetings/shape) worked as
  a judgment aid (wild licensed, raid/other insufficient) — keep
  it, noting it licenses a shape for judgment, not a lever for
  landing. Future wave-4 preregs must pair reach count AND meeting
  count per seed (unlock 5/8 vs contact 1/8 must never be reported
  as reach alone).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-29/perseed-{w4shape-a,flipshape-a/on}/s*.json'
--metrics national,table,wins,exiled --sweep-rows` — both corpora:
wall nationalEver 6/8, nationalFinal 6/8, table 7/8, entered 6/8,
won 6/8. ONE LOUD line, both corpora: wins swung -62%, baseline 16
-> current 6. VERDICT: explained, KNOWN WINSEAT-baseline regime
artifact (the baseline file itself labels its regime "winseat —
full win-side win stack, ~100%-win suite" and warns not to compare
pre-seat/courtship substrates against it). Baseline NOT rolled.
Table + exiled clean.

## Infrastructure

- Head moved mid-run (journey succession r72 commits ae7c00e6b,
  5963fcf4d, unrelated files): both arm branches rebased cleanly
  onto 5963fcf4d, analyzers re-run post-rebase (flipshape exit 1 =
  its coverage verdict, reproduced; w4shape exit 0 PASS). After the
  flipshape merge, w4shape needed a second rebase onto 8b9ad86ca;
  analyzer re-run green again before its --ff-only merge. No
  conflicts, no force, no sibling files touched.
- No safe-commit index clobber observed on this run's merges or
  (below) the coordinator evidence commit; main tree verified
  clean after each step.
- Sibling loop-B trees (sim-raidnamefix-b, sim-woodshortledger-b,
  sim-lackingline3-b) and journey trees untouched throughout.

## Convergence state

scale-onramp stays converging (NOT converged): two more gap
classes eliminated by measurement (damage, heads, holds,
mitigation — none bridges the pooled gap), the wave-4 baseline is
current and citable, but full seat 0, wave-5 reach 0, wave-4 kills
0. The next arm on this axis is the chain-finish / zero-dealt
measurement (wild shape, licensed) or the meeting-shape question
(who meets wave-4, alone or warned) — not another fight-price arm.
food-economy stays converging (untouched; sibling loop B lane).
Claim deleted; lock deleted. Merged locally, pending ship.
