# sim-craftxp-b — craft-track XP economy census on the courtship road (loop B, 2026-10-16, food-economy axis)

**Verdict: DIAGNOSTIC COMPLETE — GO on the primary; the gap is measured and documented, not filled.**
Read-only instrument; zero src/js changes, zero policy behavior changes. This
arm answers sim-findings #367's ("THE FURNACE HAS NO DOOR") prerequisite: a
precise census of where craft-track XP comes from on the courtship road, how
far any bearer gets toward the first craft level and toward deep_reserves
offer eligibility, and which source class is missing.

## Pre-registration (BINDING, docs/MEASUREMENT.md §§9–12, 14)

Written from the arm brief BEFORE any sims; judged exactly as written.

- **Lever**: none — this is a diagnostic census, not a lever arm. The
  instrument (scripts/craftxp-20261016.js) wraps Game.gainTrackXP as a pure
  observer (records, calls through, never mutates) on the courtship
  substrate, and attributes every scholar-side craft-track XP award to its
  source verb.
- **PRIMARY GO**: >=95% of craft-track XP attributed to source verbs
  (per-bearer segments; succession replaces s.tracks wholesale via
  mantleBecome, so attribution is computed per bearer-lifetime, not
  final-minus-baseline).
- **Pre-registered questions**:
  (1) the XP threshold for the first craft-track level AND for deep_reserves
      offer eligibility;
  (2) the closest any run/bearer came to that threshold — gap in absolute XP
      and as a multiple of the run's own (that bearer's) accrual;
  (3) the single largest missing-XP source class, named.
- **GO** → the census answers (1)–(3) with attribution >=95%.
  **MISS** → report the attribution shortfall honestly under metric review.
- **Horizon**: 180d death-aware (+10d tail max). **Seeds**: 1601–1608 ×
  {leadcourt, belongseek} = 16 fresh-seed runs, single diagnostic side (no
  lever → no control/arm split; the census IS the measurement).
  **Policies**: leadfeast / belongfeast (feastscale-wrapped courtship
  policies). **Substrate**: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (c004b9dd
  flipped the seat default ON; this axis runs the pre-seat substrate).
- **Det-gate**: proof test RED→GREEN before sweep spend; trajectory-identity
  4/4 byte-identical (instrument on vs DETGATE_OFF) on identical seeds.

## Canon

docs/CANON.md, docs/PRESERVATION.md, docs/BALANCING.md, docs/SYSTEMS.md read.
Human-skills-vs-alien-abilities boundary (Steve 2026-10-11) respected:
deep_reserves is a System ability (lane magic), never a learned skill; the
instrument only censuses, it grants nothing. The craft track's SKILLS lane
(triage, steady_hands, preservation_instinct, herbal_remedy, camp_cook —
tracks.json) is the human-competence side; the kit (magic) is the System side.
No canon invented. Note: **no food-distribution canon doc exists** (stated
per the canon rule in sim-bankpath-b); craft-XP mechanics read from src/js
as-is, cited below.

## The instrument

scripts/craftxp-20261016.js (read-only):
- Wraps Game.gainTrackXP immediately after loadGame (before setupGame), plus
  Game.mantleBecome and Game.say (craft-verb lines only, capped 60/run).
  All wraps are pure observers: call the original first, record second.
- Captures the occupation-lean baseline AFTER setupGame (playerTracks seeds
  s.tracks directly from characterGen trackLean, clamped below the first
  threshold — not through gainTrackXP, so it is the baseline, not a verb).
- Per-bearer segments: succession events (exact oldFinalXp/newStartXp around
  the original + a monotonic call seq) bound each bearer's XP series; calls
  are assigned by seq. A villager-side award (who=vid) counts only when that
  vid was the bearer at call time (isPlayerSideCall) — this was a REAL bug
  found mid-run: a day-126 cooking:1 award to visjoin_124-as-villager was
  first misattributed to the scholar's track (133% attribution on that run);
  the bearer-at-call-time rule fixed it to 100% and is fixture-proven
  (E1–E4). A second real subtlety: the naive final−baseline formula read
  −40% on a succession run (D2 RED); per-bearer segmentation reads 100%.
- Emits per-seed JSONs with the FULL wall-metric key set (national/table/
  wins/exiled as numbers, waveReach, wave45, maxArc, maxRank, entered, vests)
  plus the craft census, under evidence/2026-10-16/perseed-craftxp/.

Proof scripts/test-craftxp-20261016.js — ALL GREEN (25 assertions):
- Part A (live engine): RED (no census unwrapped) → GREEN
  (noteDeed('cooking') recorded as craft/1; engine state moved by exactly n
  — behavior-neutral).
- Part B: canon readouts — thresholds [18,48,96,192,384]; deep_reserves =
  craft kit index 11/20; offer window 6; occupationLean(line_cook).craft = 12;
  eligibility arithmetic (6-of-first-11 ⇒ eligible; 5 ⇒ not).
- Part B2: buildSegments fixtures incl. the succession-confound RED (naive
  final−baseline = −40%) → GREEN (per-bearer 100%), the future-bearer
  exclusion E1–E4, and the honest-zero-attribution edge D3.
- Part C det-gate: 30d × 2 seeds × 2 policies, instrument-on vs DETGATE_OFF
  — 4/4 byte-identical canonical fingerprints.

## Results

### PRIMARY GO: attribution ≥95% — GO (100% on all 16 runs)

Mean attribution 100%, min 100%. Every scholar-side craft XP award across
111 bearer-lifetimes is attributed to its source verb.

### (1) Thresholds

- **First craft-track level: 18 XP.** Thresholds [18, 48, 96, 192, 384]
  (tracks.json; one scale for player and villagers, tracks.js).
- **deep_reserves offer eligibility** — structural, two conditions:
  (a) deep_reserves is craft kit index 11 (0-based); a level-up sheet draws
  from the next `window` = 6 unheld kit entries (godpaths.json rules.offers),
  so it can enter a sheet only when **≥6 of the first 11 kit entries are
  already held** (any source: level-ups, arrival, poison aid, contest prizes);
  (b) a craft level-up sheet must actually fire, which needs a threshold
  crossing during the bearer's tenure. **The 5 thresholds cap the craft track
  at level 5 = 5 lifetime sheets; 5 front-loaded picks hold at most 5 of the
  first 11 — so deep_reserves is unreachable via craft XP alone. At least one
  off-road craft-kit grant is required even at L5.** XP target for the last
  possible sheet: **384**.

### (2) Closest approach — the gap, precisely

- **Zero threshold crossings during any bearer tenure in 16 runs** → zero
  player craft level-up sheets fired → deep_reserves was never offerable.
  (The bankpath probe's 0/33 sheets is confirmed on 16 fresh seeds.)
- **L1 (18 XP):** the closest any bearer came was **17/18 — 1 XP short**
  (belongseek s1601; that bearer accrued 0 XP in tenure — they arrived at 17
  and died there). The most any bearer EARNED in a single tenure was
  **14 XP** (leadcourt s1606), 4 short of L1. No bearer earned their way to
  Craft 1; the single observed L1 (leadcourt s1605, final bearer at 18) was
  inherited via succession, not earned.
- **deep_reserves:** 0/16 runs eligible (max first11Held = 2, via off-track
  sheets: the_touch + green_whisper). Max craft XP any bearer ever held:
  **165** (leadcourt s1606 — inherited from a duty cook's villager life,
  Craft 3). Gap to the last possible sheet (384): **219 XP absolute**;
  13.7× that run's total scholar-side accrual (16 XP). Sharper: that same
  bearer's NEXT threshold was 192 — **27 XP away, with 0 XP accrued in
  tenure**. At the observed scholar-side pace (~0–14 XP per lifetime), the
  next sheet is not merely far, it is off the lifetime horizon.
- Note on the summary JSON's `closestToL1` (gap 0, maxXpReached 93): that
  field counts inherited XP. The tenure-framed numbers above are the honest
  reachability read; the per-seed JSONs carry both.

### (3) Largest missing-XP source class — COOKING

Scholar-side craft XP by source, 16 runs (111 bearer-lifetimes):

| class | XP | runs with >0 | per-run cap | verdict |
|---|---|---|---|---|
| hunger_trial | 48 | 16/16 | 3 (once/lifetime) | SATURATED — every run |
| crafting | 50 | 7/16 | 360 (2/day) | thin but alive (tools/traps) |
| cooking | **0** | 0/16 | 180 (1/day) | **MISSING** |
| healing | 0 | 0/16 | 360 (2/day) | missing (runner-up) |
| occupation-lean | 0–12 | baseline | once | background grant, not a verb |

**Cooking is the single largest missing source class.** It is the craft
track's signature practice verb — the entire PRESERVATION.md ladder (cook →
smoke → render → pemmican) runs through the cookpot — and the scholar
performed it **zero times in 16 runs** while the village's duty cook does it
daily. This is the division-of-knowledge mechanism documented in
sim-bankpath-b, now measured: the cook's craft XP is real (villagers reached
Craft 1–3; 8 villager craft level-ups observed: Michael, Raj, Luigi, Fritz
taking beard_moss, battlefield_grace, pyrokinesis, green_whisper), but none
of it flows to the bearer. Healing (0/360) is the quantitative runner-up;
the scholar never heals either — the bearer is a forager-fighter, not a
maker, on the courtship road.

### Where craft XP comes from, in-canon terms

- **Occupation background grants** seed 0–12 XP (29 of 55 occupations carry a
  craft lean; observed scholars: butcher 6, appliance_repair 12, dentist 12).
- **Practice verbs**: crafting (making tools/traps — the only scholar-side
  practice verb that fires, 50 XP across 16 runs), cooking (0 — the duty
  cook's verb), healing (0 — nobody's verb on this road).
- **Discovery**: hunger_trial (+3, once per lifetime — 3 suspect meals
  survived; fired on 16/16 runs, the single most reliable scholar-side
  source).
- **The track is alive — for villagers.** The census's sharpest refinement
  of #367: the craft track is not dead on the courtship road; it is
  **bearer-dead**. Villagers (duty cooks) earn craft XP daily and level to
  Craft 1–3; their XP becomes scholar XP only through succession inheritance
  (up to 165 XP observed) — and inherited XP never fires a player sheet
  unless the bearer crosses a new threshold in tenure, which happened zero
  times.

### The precise mechanism gap

deep_reserves is unreachable on the courtship road by the conjunction of
three measured facts: (i) the scholar's craft verbs don't fire (cooking 0,
healing 0; crafting thin) → (ii) no bearer crosses a craft threshold in
tenure (0/111 lifetimes) → no craft level-up sheet ever fires → (iii) even
at the L5 cap, 5 sheets can't put 6 of the first 11 kit entries in hand, so
an off-road grant is structurally required. The Furnace build (deep_reserves
→ feast_engine, war_chest) has no live route for the courtship scholar.
Design question for Steve (unchanged from #367): does the courtship scholar
need ANY route — scholar cooking via teaching, a non-craft offer path, or is
the Furnace build meant for other roads only? This arm does not design the
fix.

### Wall numbers (16 runs, courtship substrate, FEASTSCALE_R13=1, SEATDRIVE=0)

- national 14/16 | table 13/16 (invited) | wins 0/16 | exiled 0/16
- wave45: 13/16 runs reached wave 4+; maxWave 5
- median survival 140d, max 180d (2 runs survived the full horizon)
- telemetry-check vs scale-wall baseline: one LOUD — wins 16 → 0.
  Investigated same-run: NOT a regression. The baseline's 16 wins come from
  a win-pursuit policy stack; the courtship substrate (leadfeast/belongfeast,
  SEATDRIVE=0 opts out of seat-taking) doesn't drive the win — 13/16 table
  invitations with 0 sittings is the expected shape here, and the det-gate
  (4/4 byte-identical) proves the instrument changed no trajectory. No
  action; the LOUD is a substrate difference, recorded here.
- Death causes: monster combat dominates (223 monster:combat, 118
  monster:villager combat, 99 player:combat, 98 villager:monster). Villages
  die of monster combat around living scholars — 111 successions across 16
  runs (mean ~7 bearers/run); endReason is usually village-lost with the
  final bearer alive (scholarDead=0 on all 16).

## Sense-testing (SENSE-TESTING LAW)

Read the craft-verb say-lines from the census runs (transcript excerpts
below; judgments on meaning/coherence, not counts).

**1. The cookpot line is a single template with the name swapped — robotic.**
"A woman, maybe 50s, with a missing fingertip is working the cookpot,
tasting, adjusting." / "Lucas is working the cookpot, tasting, adjusting."
/ "Tanisha is working the cookpot, tasting, adjusting." / "A person, maybe
30s, with a nervous tic is working the cookpot, tasting, adjusting." The
person-descriptors are specific and human (missing fingertip, farmer's tan,
tattooed arms); the verb phrase never varies. Same for mending: "A man,
maybe 30s is mending something by the door — patient work." ×N villagers.
And recovery: "🤒 Duc is on the mend — the fever broke." / "🤒 Ava is on the
mend — the fever broke." One template, name swapped. These read as stage
directions, not people doing things — a blank (filed below, not chased:
out of this arm's axis-scope).

**2. Teaching and triage read human.** "📓 Journal: the woman in her 30s,
with a farmer's tan taught the man in his 50s, with tattooed arms Camp
Cooking." — specific people, a real transfer, and it names the skill the
track's SKILLS lane grants. "Triage tents and broth for the sick, or half
rations till it passes, or the healthy hunt hard to keep everyone fed.
Pick — everything costs." — a genuine decision with costs, in a human
voice. The knowledge-transfer verbs are the strongest writing in the
craft-verb surface.

**3. The villager level-up beats read as earned, not vending-machine.**
"◈ THE SYSTEM has been watching Michael — Craft 1. Three offers; they took
Beard Moss. Earned, chosen." The System-as-watcher voice is consistent, the
choice is attributed to the villager's build, and the Codex mirrors it
("Michael chose Beard Moss (beard_moss) at Craft 1"). Coherent across the
two surfaces. (Sense note, not a bug: battlefield_grace/pyrokinesis read as
odd "craft" rewards for a cook — the kit is magic-first by design, but a
cook taking Battlefield Grace from the craft track is the kind of
fiction-mechanics seam Steve may want to look at. Filed as a finding.)

**4. The scholar's craft verbs read honest when they fire.** "You also take
some vine (crafting material)." / "A sturdy stick (crafting material)." —
plain, honest, no silent actions. "The Dried beans was off. Your stomach
knots. (-5 health)" → the hunger_trial path — the gamble is legible before
and after. No complaints on the scholar's side; the verbs simply rarely
fire.

## Village assessment (plain words)

Sixteen courtship villages lived 24–180 days (median 140) on the feastscale
substrate. The bearer is a forager-fighter: scholars haul, fight, and
socialize; the village's makers — the duty cook, the menders, the healers —
do the craft work and level the craft track to Craft 1–3 while the bearer
watches. Bearer turnover is brutal: 111 successions in 16 runs, villages
dying of monster combat (wave-4/5 reach on 13 runs) around a living final
bearer. The scholars who thrived longest were generalists with inherited
craft XP they could never use — petra_novak arrived at exactly Craft 1 (18
XP, inherited) and died with it unspent; a cook-turned-bearer arrived at 165
XP (Craft 3) and earned 0 more. The village looks like what it is: a
courtship-phase settlement with a real division of knowledge, where the
mantle passes to whoever is standing — including the cook, whose craft
mastery dies with them as far as the System's offers are concerned. The
blank I documented instead of filled: the bank-expansion route doesn't exist
on this road, for anyone — and now we know exactly which verbs would have
to fire to open it.

## Metric review (§14)

- PRIMARY GO (≥95% attribution): **GO** — 100% on all 16 runs, per-bearer
  segments, 111 lifetimes. The two mid-run attribution bugs (naive
  final−baseline on succession; villager-side award to a future bearer)
  were found by the metric itself, fixed in the instrument, and fixture-
  proven (D2, E1–E4) before the final sweep. The metric did its job.
- The pre-registered "multiple of the run's own accrual" is reported at
  bearer granularity (the run's accrual mixes 5–16 lifetimes); both framings
  are in the per-seed JSONs.
- The summary JSON's `closestToL1` (gap 0 via inherited XP) is superseded by
  the tenure-framed analysis above — recorded here, not re-scored.
- Telemetry LOUD (wins 16→0): investigated, substrate difference, not a
  regression; det-gate 4/4 proves the instrument is trajectory-neutral.

## New findings filed

- [open] 2026-10-16 — villagers/people — Cookpot/mending/mend-fever ambient
  lines are single templates with the name swapped ("working the cookpot,
  tasting, adjusting" ×N villagers; "mending something by the door — patient
  work" ×N; "X is on the mend — the fever broke" ×N). Person-descriptors are
  specific; verb phrases never vary. Reads robotic on repeat exposure
  (sim-craftxp-b sense-read, evidence/2026-10-16/sim-craftxp-b.md).
- [open] 2026-10-16 — design/canon — Villager craft level-ups grant magic
  from the craft kit that reads off-theme for a cook's track
  (battlefield_grace, pyrokinesis via Craft 1 sheets to Raj, Luigi). The kit
  is magic-first by design, but a cook taking Battlefield Grace is a
  fiction-mechanics seam Steve may want to rule on
  (sim-craftxp-b sense-read).

## Instruments retained

- scripts/craftxp-20261016.js — the census instrument (read-only; pure-
  observer wraps on gainTrackXP/mantleBecome/say).
- scripts/test-craftxp-20261016.js — proof test, ALL GREEN (25 assertions:
  A1–A6, B1–B6, D1–D3, E1–E4, C1–C4 det-gate 4/4).
- evidence/2026-10-16/perseed-craftxp/ — 16 per-seed JSONs (full wall-metric
  key set: national/table/wins/exiled as numbers) + craftxp-summary-20261016.json.

## Convergence

`converging` — diagnostic complete; the #367 design question (does the
courtship scholar need ANY route to deep_reserves?) now has its prerequisite
measurement: the track is bearer-dead, not village-dead; the missing verb is
cooking; the structural bar is ≥6-of-first-11-held plus a sheet that never
fires. No fix designed per the brief (steve-call adjacent).
