# sim-returns2 — verdict: grudge GO (landing held), trail NO-GO, hunthold NO-GO

## Provenance — read this first

The gaps2-returns worker (agent e4304c93) was killed at 2026-10-29 23:59Z by a
runtime restart drain, before writing this file. Everything below was either
committed by that worker or re-run and verified by the gaps coordinator (#2)
after its death. No prereg was changed, no judged number re-scored, no
sweep re-run on an old band. The hunthold pilot sweeps (seeds 75201–75208)
were run by the coordinator under the worker's frozen prereg, on the
worker's committed code, because the worker died before running them.

Branch: gaps2-returns. Commits: port e0c6e600a; preregs 64c5d2a8a (THREE
preregs, frozen 21:52Z, before any judged leg); analyzer 3fa336813;
corpora d3ccf59cd (grudge-control + shared pilot); trail-control
09bb04d06 (byte-identical copy of the control tree's original, verified
with diff -r); clearing cdbbbb920 (9 lines, villager-objectives.js only).
Control branch gaps2-returns-control (37278d461, grudge-only state) kept
as backup; its corpus is the byte-identical source of the trail-control
copy above. Nothing on this branch is merged to master by this file.

## 1. Grudge lottery, larger band (16 seeds 75101–75116) — GO per prereg

Prereg: evidence/2026-10-29/sim-returns2-grudge-prereg.md. Design: shared
pilot (grudge+trail) vs neither-mechanism control; meetings are
DIAGNOSTIC ONLY in this prereg (the shared pilot confounds grudge with
trail arrivals), picks are the judged grudge signal. This is a NEW run
under a NEW prereg frozen before any judged leg — the §14-sanctioned path
after the old pilot's metric review, not a re-score of the old pilot.

Coordinator re-runs (judge-grudge-lottery.js --band confirm, collapse
check, test-grudge-lottery.js) reproduce the worker's numbers exactly:

- G-P1 picks: candidate deliberate wave-4 HUNT picks 1 > 0 → PASS.
  (Control 1, candidate 1; candidate cell dry/age3, the weakest cell.)
- G-P2 fixture: weight table exact; mild HUNT 136/300 vs dry 70/300,
  gap 22pp ≥ 10pp → PASS.
- Collapse rule: control total 1, pilot total 1; C=1 < 4 → does NOT fire.
  Sim legs judgeable.
- Cost bars, all PASS: starvation pilot 3 ≤ control 3+2=5;
  need-override 0; wins 10 ≥ 9; nationalEver 16 ≥ 14.
- Diagnostics (not judged): deliberate wave-4 meetings 0 both bands
  (under the PRIOR prereg's meetings leg this band would be NO-GO);
  candidate-present picks fell 14 → 5 (opportunity pool shrank as
  trajectories diverged); deliberate all-wave meetings rose 17 → 30
  (trail's domain); true drops 325 → 323 (flat).

VERDICT: GRUDGE GO per prereg. LANDING DECISION (coordinator call,
Steve can overrule): GO recorded, landing HELD pending a confirm run.
The GO rests on 1 pick vs 1 pick with zero lift, in the weakest cell,
on a shrunk opportunity pool. Landing live game code on no demonstrated
improvement would be forcing a thin mechanism past its evidence. A
confirm run needs a lift-based bar, not just "> 0". The mechanism is
held, not killed: the lottery works (fixture exact, gap 22pp) and the
pilot shows no harm on any cost bar.

## 2. Trail-follow, fresh band, grudge held constant — NO-GO (cost bar)

Prereg: evidence/2026-10-29/sim-returns2-trail-prereg.md. Design:
trail-control (grudge-only) vs shared pilot (grudge+trail) isolates
trail; grudge is identical in both bands.

Coordinator re-run (judge-trail-follow.js --band confirm) reproduces
the worker's numbers exactly:

- PRIMARY 1: arrival-arising deliberate meetings 25 > 14 → PASS.
- PRIMARY 2: 25 ≥ 1 → PASS.
- Follows: 71/1103 firings (followed 71, aged-out 686, tightness
  246, no-trail 95, cap 3, no-next 2); empty-tile rate 0.903 → 0.812;
  linger repeats 709 vs control 754.
- COST BARS: starvation 3 ≤ 5 PASS; wins 10 ≥ 7 PASS; nationalEver
  16 ≥ 14 PASS; need-override follows 3 > 0 → FAIL.
- The 3 flags: s75101 murkcap follow 1 part after a departure with
  hunger 57, energy 100, pantry 17500; s75102 living_wire two follows
  off one departure (hunger 57.5, energy 100, pantry 17019). All three
  are marginal hunger just over 55 with full energy — departure-time
  needs, not pick-time needs (funnel picks do not cover wave-1/2
  beasts, so pick-time needs are unverifiable for these cases).

VERDICT: TRAIL NO-GO on the need-override cost bar only. Nothing
lands from it. METRIC REVIEW (next prereg, never a re-score of this
run): the need-override join should use pick-time needs, or the bar
must be redefined — departure-time hunger is not a pick-time
pre-gate violation, since needs decay between pick and departure.
Primaries passing with wall improvement means the mechanism is alive
and worth a corrected re-test, not killed.

## 3. Hunthold (pickdepart) revised prereg — PILOT NO-GO (H-P1 only)

Prereg: evidence/2026-10-29/sim-returns2-hunthold-prereg.md. Pilot
bands: fresh seeds 75201–75208, OFF (HUNTHOLD unset) vs ON (HUNTHOLD=1),
substrate grudge+trail present in both (only HUNTHOLD varies), 180d,
tableseat-nowait verbatim. Lever: a villager whose hunt faces moderate
danger WAITS (ask 2–3, tighten 4–5, max 6 holds ≈ two days) instead of
quietly swapping to housework; severe danger still sends them home.
A GO verdict means GO CANDIDATE as a default-OFF instrument only —
landing as live behavior is a coordinator/Steve call, never this arm's.

### Proof tests (all required before judging)

1. Revised fixtures: 15/15 PASS (13 old + 2 new guard-draft cases),
   re-run by the coordinator. Guard-drafted class works; HUNT-kind
   departures still class departed-pick-linked.
2. Check-quick, clearing commit vs merge-commit baseline: baseline
   284 pass / 6 fail; post-clearing 284 pass / 6 fail, failure sets
   IDENTICAL (measurement-proof-update, measurement-workflow,
   mobile-combat-cadence, occupation-panels, phone-frame-proof,
   establishment-r20 — all pre-existing classes, none in the
   knowledge/diplomacy area). ZERO NEW failures → proof passes,
   sweeps unblocked. (Process note: the worker's first
   post-clearing attempt died silently at 64 dots and its re-run
   was killed by the restart drain; the coordinator re-ran with
   the prereg's exact command — --quick with
   --cacheDirectory=/tmp/jest-cache-gaps2-returns — after a
   sibling's check-quick finished, to avoid concurrent jest.
   An earlier coordinator attempt with the wrong command — full
   run, no --quick, no cache directory — died with its session
   and is discarded; its 38-byte log was overwritten by the
   correct run.)
3. Analyzer determinism: two runs over the pilot corpora produce
   BYTE-IDENTICAL analysis JSON (analysis-1 vs analysis-2).
   (Analyzer exit 1 on both runs is the NO-GO verdict signal,
   not a crash. The --drift diagnostic was not passed, so the
   drift section reports ENOENT; drift is not a judged leg.)

### Pilot legs (binding; a miss is NO-GO)

Corpora: perseed-returns2-hunthold-off/ and
perseed-returns2-hunthold-on/, 8/8 rows each, corpusOk true.
Analyzer: scripts/test-hunthold-a.js (revised) --off/--on
--seeds 75201–75208.

- H-P0 CLEARING: stale-provenance departures (kind != HUNT carrying
  non-null huntMid) OFF 0, ON 0 → TRUE. The clearing fix works:
  on the OLD corpora the same analyzer counts 70 (OFF) / 101 (ON)
  stale rows; on fresh corpora under cleared code, zero in both.
  Provenance clearing is PROVEN, independent of the pilot verdict.
- H-P1 MECHANISM: FALSE → the miss. ON primary picks: 3 total —
  1 held-then-overwritten (6 holds, see sense chain below),
  1 guard-drafted (companion converted it; correctly never
  satisfies H-P1), 1 departed-pick-linked with 0 holds.
  heldThenDeparted = 0. The lever fires at scale (see secondary
  census) but the narrow primary-universe chain — a wave-4 pick
  held and then departed — did not occur on this band. Primary
  universe is tiny: OFF 1 pick, ON 3 picks.
- H-P2 COUNT NOT WORSE: ON primary HUNT-kind departed 1 ≥ OFF 0
  → TRUE.
- H-P3 COMPLETENESS + INSTRUMENT: unknown 0; unexplained
  other-held 0 in both corpora; overwrite verdicts present
  → TRUE.
- H-P4 HYGIENE: hygieneOk true; recorder/lever errs 0 in both
  corpora → TRUE.
- Guards (reported, NOT re-scored into PILOT GO): H-G1 starvation
  FAIL (ON 9 > OFF 6; bar ON ≤ OFF); H-G2 wall FAIL (wins ON 0 <
  OFF 2; wave-4 reach ON 5 < OFF 7; bar ON ≥ OFF on both);
  H-G3 no-held-starvation PASS (heldStarvation empty). Deaths
  ON 334 vs OFF 295; median days ON 180 vs OFF 155 (reported).

VERDICT: HUNTHOLD PILOT NO-GO on H-P1 only. The lever stays
default-OFF, NOT killed: it fires 486 times on the band (see
below) and its chains read as honest waiting; the primary pattern
is unobserved on a 3-pick universe, not disproven. NO confirm run
(confirm runs ONLY after a pilot GO).

### Secondary census (evaluation-based, all waves)

OFF: recorder held evals 0, lever holds 0, exhausted 0, narrated 0.
ON: recorder held evals 486, lever holds 486, exhausted 24,
narrated 163. The lever works at scale; the old pilot's 209 holds
are exceeded. The funnel-based census is NOT judged (known
blindness, per prereg).

### Sense bar — verbatim chain (ON corpus, seed 75201)

Villager visjoin_157 picks a wave-4 herald hunt on day 174
(pick part 694). At haven, day 175: three held-ready evaluations
(ask/2, parts 696–698). Day 176: three more (tighten/4, parts
700–702) as danger grows. Day 177, part 704, budget spent (6
holds): the engine overwrites HUNT → HAVEN_CHORE (indoor),
sub tighten-overwrite, danger ask/2. Full evalChain JSON is in
returns2-hunthold-analysis-1.json (primaryOn[0]).

Judgment: this reads as a person waiting out danger for two days
and then giving up — honest waiting, not an errand queue idling.
The chain is exactly the lever's design working, ending in
overwrite rather than departure. It is the H-P1 near-miss in
miniature: had danger eased within budget, this chain would have
been held-then-departed.

### Comparison to the old pilot

Same verdict shape (P1 FAIL, G1/G2 FAIL, P2/P3/P4 pass) with MORE
holds (486 vs 209) and P0 now TRUE (clearing works). The NO-GO
reproduces across two bands — the primary leg, not the mechanism,
is what fails. Next-run metric review (not re-scores): the primary
universe (wave-4 picks only) may be too narrow for an 8-seed band
— a future prereg could judge held-then-departed on all-wave
picks as secondary, or widen the band; MAX_HOLD=6 budget vs days
and guard-drafted-lever questions stay carried from the prereg.

## Landing summary (item 3)

- Grudge: GO per prereg; LANDING HELD pending a confirm run with
  a lift-based bar (coordinator call, Steve can overrule).
- Trail: NO-GO; HELD, nothing lands.
- Hunthold: PILOT NO-GO (H-P1 only); lever stays default-OFF,
  NOT killed; clearing fix PROVEN but NOT landed separately
  (it is part of this NO-GO arm's code; landing it alone would
  be a game change from a NO-GO run).
- No game change lands from item 3. Evidence, corpora, analyses,
  and this verdict live on branch gaps2-returns (held backup).
