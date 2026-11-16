# sim-gatereach2-b — DIAG: which path consults the gate, and do launched arrivals consult it?

**Run:** Loop B, 2026-11-16 (`fleshout-loop-b-20261116T0530Z`), axis
winnability chain. **Branch:** `sim-gatereach2-b`, base master tip
`3322fb0df`. **Prereg:**
`evidence/2026-11-16/sim-gatereach2-b-prereg.md` (frozen before any
judged sim; Corrections C1–C2 appended before any verdict — see §10).
**Seeds:** corpus 102001–102008 (8 seeds, verified fresh).
**Horizon:** 150 days, death-aware. **Policy:** competent verbatim
(`scripts/policies/competent.js`, sha `74a890f0844e…`).
**Instrument errors:** 0 on all 16 files. **Game-code change:** the
vetparty seed call only, re-landed for the instrument leg and
**reverted after measurement** (`git diff <control-anchor> HEAD --
src/` = 0 lines).

**Anchors.** Control anchor (instrument, seed call ABSENT) =
`48af723f9`. Instrument anchor (seed call re-landed verbatim, 13
lines, blob `a66d45a5e`) = `a0ce78df0`. Revert =
`4e61160a4` (game.js blob back to `440ef1b40`, the post-revert blob).

## Verdict: GO (instrument valid)

All five frozen bars hold. GO here means the instrument is valid and
its decomposition stands — it is NOT a verdict on any lever (no lever
was tested in this run).

| # | Bar (prereg) | Measured | Result |
|---|---|---|---|
| 1 | ≥ 90% of gate consultations classified by path, unknown 0 | 56/56 = **1.00**, unknown **0** | **PASS** |
| 2 | ≥ 90% of launched-party arrivals classified, unknown 0 | 98/98 = **1.00**, unknown **0** | **PASS** |
| 3 | Corpus 16/16 files parse | **16/16**, 0 parse errors | **PASS** |
| 4 | Neutrality D1 + D2 + D3 | D1 identical, D2 identical, D3 **CLEAN on all 8 seeds** | **PASS** |
| 5 | Proof test green | `scripts/test-gatereach2-b.js` **4/4 green** on the instrument tip and **4/4 green** post-revert | **PASS** |

## 1. The question, in plain words

Gatereach-b found the gate is consulted only ~2–3 times per 8-seed
leg, and never about a wave-5 beast. This follow-up asks, with the
seed call on so plans exist and launches happen: for every gate
consultation, which path consulted it — and for every launched party
arrival, was the gate consulted, and with what answer? The answer
turns out to be structural, and it is measured, not assumed: the
gate has exactly one caller in the game, and every launched-party
meeting consults it.

## 2. The answer, in one paragraph

Every gate consultation on both legs came through the expedition
path — 39 expedition-launched, 17 expedition-ordinary, **0
world-tick, 0 aid** — because `winPlanFightGate` has exactly one
call site (`expeditionMonster`, villager-agency.js:612), and the
world-tick and aid paths never call it. The seed call raises the
consultation rate from 10 to 46 per 8-seed leg (1.25 → 5.75 per
seed), but the answers do not change shape: **SEEK fired 0 times
in either leg**. Of the 46 instrument-leg consultations, 33 were
`avoid:outmatched` (the party is 2, or unarmed/unarmored), and of
the 13 nulls, 9 were the wrong target (the plan at the gate does
not name the beast in front of it) and 4 were trick-holds (right
target, full party, trick unknown). Every launched-party arrival
consulted the gate — **not-consulted 0 in both legs** — so there is
no missing consultation to hunt for: the gate sees every launched
meeting and turns it away or lets it through on its existing
terms. The 8 launched parties that did fight together in the
instrument leg (0 in control) all fought after a null answer, all
at party size 3, and all ended evade / monster-flee / villager-flee
— 0 kills, 0 deaths.

## 3. Gate consultations by path (the primary metric)

Wave-4+ rows only (wave-3 rows recorded separately; see §3.1).

| Path | Control | Instrument | Combined |
|---|---|---|---|
| expedition-launched | 8 | 31 | 39 |
| expedition-ordinary | 2 | 15 | 17 |
| world-tick | 0 | 0 | 0 |
| aid | 0 | 0 | 0 |
| other / unknown | 0 | 0 | 0 |
| **Total** | **10** | **46** | **56** |

Consultation rate: **1.25 per seed (control) → 5.75 per seed
(instrument)** — the seed call raises consultations ~4.6×, because
it raises plans (27 → 137 seed rows) and launches (45 → 106).
Three seeds in each leg record zero consultations (102002,
102003, 102005 control; 102002, 102003, 102005 instrument — the
same three, all villages that never launch a wave-4+ expedition
meeting), and the instrument records them cleanly, with no errors.

### 3.1 Wave-3 rows (secondary)

Wave-3 gate rows: control 25, instrument 63. They are the blind
spot gatereach-b named (its recorder stopped at wave 4) and they
are why the D3 smoke's first-lever-day is the first wave-3+ seed
(prereg Correction C2): the seed call fires on wave-3 flees too,
and the first seed days on this band (25–48) are wave-3 seeds on
five of eight seeds.

### 3.2 Answers (why SEEK is 0)

| Answer | Control | Instrument |
|---|---|---|
| `avoid:outmatched` | 7 | 33 |
| null | 3 | 13 |
| `seek` | 0 | 0 |
| `avoid:veteran-guard` | 0 | 0 |

Fail decomposition of the nulls (gate order: target, party, trick):

| Null reason | Control | Instrument |
|---|---|---|
| `null:not-target` (plan does not name this beast) | 1 | 9 (7 wave-4 + 2 wave-5) |
| `null:trick-hold` (right target, full party, trick unknown) | 2 | 4 |
| `null:party-short` / `null:other` | 0 | 0 |

Party size at the gate (instrument leg): 1 → 3 rows, 2 → 30 rows,
3 → 11 rows. Trick known at the gate: 4/46 (control 2/10). Plan
stage at the gate (instrument): party 33, hunt 9, standing 2.

Reading: the gate's SEEK needs four things at once — the right
target, a party of 3 armed+armored, the trick known, hunt/standing
stage. On this band no consultation ever had all four. The
binding loss is the avoid branch (33/46): the party in front of
the gate is usually 2 (launches form fighter + 1 companion — 0
size-3 launches in either leg), or unarmed/unarmored. Of the 13
that get past avoid, 9 fail the target test — the meeting is
incidental (the villager's plan names another type, or nothing),
not a hunt — and 4 are trick-holds, one trick away from SEEK.
Zero rows reach `null:other`, so no consultation was ever one
step from SEEK with everything else in place except the trick
plus the target: the 4 trick-holds are the closest the gate ever
gets, and they still need the trick learned first.

### 3.3 The two wave-5 consultations (instrument leg only)

Control consulted the gate about wave 5 zero times. Instrument
consulted it twice, both null, both party 3 armed+armored, both
trick unknown, both stage hunt with target null
(`null:not-target`):

- **d112, Eamon (app_mgpsphu6583) vs Rerun** —
  expedition-ordinary (no covering launch): gate null, then a
  4-round fight, vFlee. Not a launched arrival.
- **d117, Wanjiru Kamau vs Editor** — expedition-launched (two
  covering launches): gate null, then an evade — "Wanjiru saw The
  Editor in time and gave it room." The only launched-party wave-5
  meeting in either leg, and the party walked away.

## 4. Launched-party arrivals (the second metric)

One arrival row per launched-party meeting: a gate row for a
launched holder inside its launch window (consulted), or an
expedition encounter for a launched holder in-window with no gate
row for the same (vid, day, mid) (not-consulted).

| | Control | Instrument |
|---|---|---|
| Arrival rows | 15 | 59 |
| Distinct meetings | 8 | 31 |
| Consulted | 15 | 59 |
| Not-consulted | **0** | **0** |
| Unknown | **0** | **0** |
| By answer: `avoid:outmatched` | 10 | 42 |
| By answer: null | 5 | 17 |
| By answer: `seek` | 0 | 0 |

**The arrival→consultation gap is zero.** Every launched-party
meeting produced a gate row. The gap this DIAG was built to hunt
for does not exist: the gate is consulted on 100% of launched
arrivals, in both legs. (The row-vs-distinct gap is the known
launch-window double count — one meeting falls in several
launches' windows, so 15 rows are 8 meetings and 59 rows are 31;
the distinct count is reported alongside, per the prereg's metric
review.)

Launch→gate→fight, per launched holder:

| | Control | Instrument |
|---|---|---|
| Launched holders | 45 (37 size-2, 8 solo, 0 size-3) | 106 (78 size-2, 28 solo, 0 size-3) |
| Arrived at the gate | 26 | 67 |
| Median days to gate | 3.5 | 3 |
| Launches whose party fought together | **0** | **8** |

The 8 instrument-leg joined fights (distinct meetings: 9 — one
meeting counted under two launches) all follow a null answer, all
at party size 3, and all end **evade / mFlee / vFlee — 0 kills, 0
deaths**. The launched party does reach the beast and does fight
it together now; it never finishes it.

## 5. Per-seed tables

### Control leg (seed call absent)

| Seed | Days / end | maxWave | Standing | Gates w4+ (launched/ordinary) | Seeks | Launches | W5 field enc. | W5 kills |
|---|---|---|---|---|---|---|---|---|
| 102001 | 132 / village-lost | 4 | 199 | 0 | 0 | 0 | 0 | 0 |
| 102002 | 92 / village-lost | 4 | 199 | 0 | 0 | 0 | 0 | 0 |
| 102003 | 63 / village-lost | 3 | 75 | 0 | 0 | 0 | 0 | 0 |
| 102004 | 150 / survived | 5 | 505 | 3 (2/1) | 0 | 13 | 29 | 5 |
| 102005 | 150 / survived | 4 | 199 | 0 | 0 | 0 | 0 | 0 |
| 102006 | 150 / survived | 4 | 199 | 0 | 0 | 0 | 0 | 0 |
| 102007 | 103 / village-lost | 4 | 199 | 7 (6/1) | 0 | 32 | 0 | 0 |
| 102008 | 150 / survived | 5 | 470 | 0 | 0 | 0 | 25 | 5 |

### Instrument leg (seed call on)

| Seed | Days / end | maxWave | Standing | Gates w4+ (launched/ordinary) | Seeks | Launches | W5 field enc. | W5 kills |
|---|---|---|---|---|---|---|---|---|
| 102001 | 142 / village-lost | 4 | 199 | 11 (10/1) | 0 | 18 | 0 | 0 |
| 102002 | 150 / survived | 5 | 310 | 0 | 0 | 5 | 0 | 0 |
| 102003 | 58 / village-lost | 4 | 125 | 0 | 0 | 1 | 0 | 0 |
| 102004 | 141 / village-lost | 5 | 380 | 12 (6/4 + 2 w5) | 0 | 21 | 14 | 1 |
| 102005 | 87 / village-lost | 4 | 125 | 0 | 0 | 2 | 0 | 0 |
| 102006 | 150 / survived | 5 | 430 | 10 (4/6) | 0 | 14 | 4 | 0 |
| 102007 | 150 / survived | 5 | 485 | 8 (6/2) | 0 | 34 | 3 | 1 |
| 102008 | 150 / survived | 4 | 199 | 7 (5/2) | 0 | 11 | 0 | 0 |

Consultations concentrate where launches concentrate: the three
zero-consultation seeds are the three near-zero-launch seeds in
both legs. The seed call moves launches 45 → 106 and gate
arrivals 26 → 67, but launches stay size ≤ 2 and SEEK stays 0.

## 6. Wall numbers

| | Control | Instrument |
|---|---|---|
| National scale, final | 0/8 | 0/8 |
| Table (seat taken) | 0 | 0 |
| Wins | 0 | 0 |
| Wave 4 unlocked (maxWave ≥ 4) | 7/8 | 8/8 |
| Wave 5 unlocked (maxWave 5) | 2/8 | 4/8 |
| Median survival | 141d | 146d |
| Village-lost | 4 (102001, 102002, 102003, 102007) | 4 (102001, 102003, 102004, 102005) |
| Total deaths | 528 | 585 |
| Starvation deaths | 3 | 3 |

Note (secondary, not judged): national is 0/8 in both legs under
competent verbatim, against gatereach-b's 6/8 under
competent-answercourt-b on its band — the policies differ (the
verbatim policy is the shared substrate for this DIAG, not the
scale-climbing policy), so the wall comparison across arms is a
policy difference, not a seed-call effect. The seed call itself
moves wave-5 unlocks 2 → 4 on identical seeds, which is an RNG
re-roll artifact of the extra draws as much as a lever effect —
this DIAG judges the instrument, not the seed call.

## 7. Sense-testing — do the meetings read like meetings?

Quoted verbatim from the instrument leg corpora
(`w5encounters[].log`). 393 wave-4+ encounters scanned across
both legs (control 174, instrument 219); the joined fights below
are where the gate's answer meets the field.

**Seed 102004, day 117 — Wanjiru vs The Editor (the only launched
wave-5 meeting, gate null, evade):**
> "Wanjiru saw The Editor in time and gave it room."
— 0 rounds. The gate withheld SEEK for the unknown trick (and the
plan names no target), awareness did its job, and the launched
party of three gave a wave-5 beast room and went home. The
classification matches what a player would see: a party that set
out together, met the beast, and gave it room. The same shape as
gatereach-b's one launched-party fight (Zoe vs Strike, d107) —
the expedition story still ends in a polite withdrawal.

**Seed 102001, day 41 — Adaeze vs The Suburb (launched, mFlee):**
> "Adaeze walks straight into The Suburb. No avoiding it."
> "R1: Adaeze walks in open-handed, talking — low, steady,
> unafraid. And impossibly, it listens. It stands down.
> (Peacemaker: Walk In)"
— 1 round, the monster stood down. A launched party that met its
beast and talked it down instead of fighting it. Reads like a
party with a peacemaker, not a hunting pack.

**Seed 102008, day 55 — Consuelo vs The Algorithm (launched
party, vFlee):**
> "Consuelo walks straight into The Algorithm. No avoiding it."
> "Consuelo sees The Algorithm coming and nocks an arrow — the
> fight opens at range (2 shots)."
> "Consuelo is losing — shouts for help! Jorge charges in!"
> "R3: Consuelo strikes for 33 (972 left)"
> "Consuelo BELLOWS — not volume, a promise. The Algorithm
> falters. They hold the line a little longer. (War Cry)"
— 4 rounds, 131 dealt into ~1000+ HP left, vFlee. The one fight
that reads like the party the plan promises: range opener, a
shout answered, an ability (War Cry) fired — and then the
fighter walks away from a beast with 900+ HP left. The damage
race is lost before it starts; the party fights together and
still flees.

**Judgment.** The meetings read like meetings: a party that set
out together, a gate turning them away, a shout answered, an
ability fired. What does NOT read right is the hunt the plan
promises: the only launched wave-5 meeting ends in a polite
evade, and the one real party fight ends in flight from a beast
with 900 HP left. The gate is not the meeting's problem — the
meeting happens, the gate answers, and the fight still does not
finish.

## 8. Next lever (named, with a prereg-ready GO bar)

The instrument's sharpest finding: **the gate sees every
launched meeting and still never SEEKs, because the party in
front of it is 2 and the trick is unknown and the plan names
nothing.** The named lever is the one producerparty already
named — the gate/expedition-meeting link — sharpened by this
DIAG's decomposition: the launched party must arrive as 3
(launch with two companions, or count the plan's party in the
gate), the trick must be known before the meeting (the seed
already points at the species; the expedition must wait for the
trick, as the gate's `trickHolds` branch intends), AND the plan
must name the beast at the gate (a hunt-stage plan with target
null can never SEEK — the seed must attach a target, or the gate
must accept a hunt-stage plan whose target is the beast in front
of it). Nothing else changes: no gate bar, no standing or
readiness number, no win price, no deed gate, no table rule.

**Prereg-ready GO bar (for the future run; same band as control
vs the lever, 150d death-aware, policy competent verbatim):** GO
iff ALL hold: (1) gate SEEKs ≥ 1 per 8-seed leg; (2) launched-party
wave-4+ field kills ≥ 1 per 8-seed leg; (3) kill:death ≥ 0.92
where deaths count encounter-row `vDie` PLUS same-day/same-beast
'villager combat' deaths; (4) FACED-NOT-KILLED share among
unlocked ≤ 0.20; (5) starvation ≤ control + 2 AND median survival
≥ 0.8× control.

**Second candidate (not the pick):** the dawnbid gates — seed
only for rangers, or let the departure loop run for any plan
holder — which would raise launches but not SEEKs, since the
gate's party-size and trick bars are the binding ones here, not
the launch count.

## 9. Metric review (mandatory)

1. **D1/D2 at 60d ran over zero gate rows.** Seed 102001 at 60d
   has no wave-4+ encounters, no gate rows, no seeds, no launches
   — neutrality is proven for trajectories (D1/D2 identical), but
   the live gate-wrap proof rests on the 150d corpora: 144 gate
   rows recorded across both legs, 0 path mismatches, 0 missing
   paths (the analyzer recomputes every row's path from its
   caller + launch). A future proof should run determinism at
   150d on a gate-active seed (e.g. 102007, 29 rows in control)
   so the live wrap is proven in the proof test itself, not only
   in the judged corpora.
2. **Arrival rows double-count shared meetings.** One gate row
   falls in several launches' windows (control 15 rows / 8
   distinct meetings; instrument 59 / 31). The distinctMeetings
   count is reported alongside, but the arrival denominator uses
   rows. A next instrument should key arrivals by meeting
   (seed+vid+day+mid) with the covering launches listed, not one
   row per launch.
3. **The `null:other` fail condition never fired.** No
   consultation was ever one step from SEEK with everything else
   in place except the trick plus the target: the 4 trick-holds
   are the closest the gate ever gets (right target, full party,
   trick unknown). The fail taxonomy held — no new fail kind
   appeared on either leg.
4. **The D3 correction (C2) mattered.** As first written (first
   wave-4+ seed day), the smoke misread pre-seed drift on 6/8
   seeds; with the corrected first wave-3+ seed day it is CLEAN
   on all 8 (first divergences 26–71, first seeds 25–48). The
   seed call's wave gate is ≥ 3, and the smoke must match it.
5. **The control leg's 10 consultations are thin.** The
   instrument leg (46) carries the decomposition; the control leg
   mostly proves the instrument records zero-consultation seeds
   cleanly (3 seeds, 0 rows, 0 errors). A future DIAG on a
   thinner band should pre-check that the control leg has enough
   consultations to compare against, or judge the instrument leg
   alone.
6. **No panel compare, by design.** Baseline-vs-subject DIAG
   instrument; the prereg says so, and the prereg bar is the
   judge. The wall numbers in §6 are the comparison point for
   the next lever's control leg.
7. **National 0/8 is a policy artifact, not a finding.** See §6:
   competent verbatim does not climb the way answercourt-b does.
   Do not read it as a seed-call effect.

## 10. Instrument corrections (before any verdict)

- **C1 (prereg, before any judged sim):** the D3 drift smoke is
  gatereach2-native (`scripts/gatereach2-drift-check.js`), not the
  verbatim vetparty script — the gatereach substrate carries no
  T-class `daily` / `v4seeds` fields, so the verbatim script would
  read zero days and report a vacuous IDENTICAL.
- **C2 (prereg, before any verdict):** D3's first-lever-day is the
  first wave-3+ seed, not wave-4+ — the seed call wave-gates at ≥
  3, and the first written smoke misread pre-seed drift on 6/8
  seeds. Fixed in `firstSeedDay`; re-run CLEAN on all 8.

## 11. Proof and checks

- **Proof test** `scripts/test-gatereach2-b.js` — **4/4 green**
  on the instrument tip (static in the on-shape: seed call
  present, verbatim, src diff only `src/js/game.js`) and **4/4
  green** post-revert (static in the off-shape: seed call absent,
  src diff 0 lines). Static (recorder wiring, wave-4 id set exact
  10 ids, wave-5 id set exact 10 ids, driver/analyzer
  classifyGatePath agreement on 11 fixture rows incl. precedence);
  judge (11 fixtures: GO shape, one NO-GO per bar, boundary GO
  0.90/0.90, zero-consultations NO-GO, combined 16/16 GO +
  15/16 NO-GO); recorder (synthetic 2-seed fixtures: 5
  consultations by path/answer, 5 arrivals, direct buildArrivals
  not-consulted case, path-mismatch + path-missing instrument
  errors flagged); determinism (D1 + D2 on seed 102001, 60d,
  identical).
- **Drift smoke** `scripts/gatereach2-drift-check.js` — **CLEAN
  on all 8 seeds, NO PRE-LEVER DRIFT** (first divergences 30/38/
  43/57/36/35/71/26 vs first seed days 28/36/41/48/35/33/25/25).
- **Analyzer** `scripts/analyze-gatereach2-b.js` — combined
  judgment GO (consultations 56/56, arrivals 98/98, corpus
  16/16, errors 0); per-leg judgments GO as well.
- **`node scripts/check.js --quick` NOT run:** this arm touches
  no game code in its final state (`git diff <control-anchor>
  HEAD -- src/` = 0 lines; the seed call was reverted), and
  sibling Loop A workers are running tests concurrently on the
  shared tree — a parallel quick run risks the documented
  concurrent-jest phantom failures. The instrument's own proof
  suite (4/4 green, twice) is the relevant verification; the ship
  loop owns verification of merged content.

## 12. Files

- Prereg: `evidence/2026-11-16/sim-gatereach2-b-prereg.md`
  (incl. Corrections C1–C2).
- Evidence (this file): `evidence/2026-11-16/sim-gatereach2-b.md`
- Analysis (analyzer JSON):
  `evidence/2026-11-16/gatereach2-b-analysis.json`
- Corpora: `evidence/2026-11-16/perseed-gatereach2-b-control/`
  (8 files), `evidence/2026-11-16/perseed-gatereach2-b-on/`
  (8 files)
- Instrument: `scripts/gatereach2-driver-20261116.js`,
  `scripts/analyze-gatereach2-b.js`,
  `scripts/gatereach2-drift-check.js`,
  `scripts/test-gatereach2-b.js`
- Lever: none — diagnostic only, no game-code change in the final
  state (seed call reverted in `4e61160a4`).

## 13. Commits on this branch

- `23633aaf8` prereg (frozen; Corrections C1–C2 appended before
  any verdict)
- `48af723f9` instrument — control anchor (seed call ABSENT)
- `a0ce78df0` instrument anchor — seed call re-landed verbatim
- `4e61160a4` seed-call revert after measurement
- `745a4bff6` evidence + corpora + analysis + prereg Corrections
  C1–C2 (GO: 56/56 consultations, 98/98 arrivals, D3 CLEAN, proof
  4/4; SEEK 0 both legs, arrival-gap 0)

Ready to merge, pending ship. The coordinator merges; the batch
ship job owns all pushes.
