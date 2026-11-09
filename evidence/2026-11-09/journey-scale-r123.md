# Journey Scale r123 — run note (Lane A, leg 3)

Prereg: `evidence/2026-11-09/journey-scale-r123-prereg.md` (binding). Base
`17777346b` (r122-deepening adoption landed). Seeds: matched panel
97901–97904 (the r112/r113/r122 band — NOT fresh). Pilot 97904 +
band 97901/97902/97903, DAYCAP=180 each (death-aware stop), one seed
per process. Policy: the r113 trade-road stack with the r122 walkTo
fix (on master, commit `4b7c7ad47`), unchanged.

## Verdicts (prereg bars)

- **Q1 CHARTER: PARTIAL.** Charter sealed 0/4 (not GO). Trade
  proposals (maxTrade) vs r113's per-seed (3/2/0/0): 97901 **2 < 3**,
  97902 **3 > 2**, 97903 **0 = 0**, 97904 **3 > 0** — meets-or-beats
  on 3/4 seeds, below on only one (not NO-GO). The wall moved: 97904
  went 0 proposals → 3 proposed, 2 seasoned (firstTrade d66); 97902
  went 2 → 3 proposed, 1 seasoned. Both now sit at WALL-SEASON
  (routes form, never season to 3). 97901 regressed 3 → 2 proposed,
  1 → 0 seasoned. 97903 unchanged 0/0 (firstTrade never; subCapSkips
  27 — the lead cap held raises pending). No capstone ever ready on
  any seed (`ready` all null, delivered 0/0, attempts 0) — the
  delivery verb never had anything to deliver.
- **Q2 WILD W4: FACES 4/4.** Villager w4+ field fights per seed:
  97901: 5, 97902: 22, 97903: 14, 97904: 14 — total **55** (bar ≥30,
  ≥1 per seed). Outcomes: vFlee 45, vDie 6, vKill 2, mFlee 2.
  Villagers meet wave-4 beasts in the wild and mostly give them room;
  the two villager w4 kills (97902, 97904, one each) never become a
  veteran bar (needs 2 living; kAttr living villagers 1/0).
- **Q3 LADDER: OPENS + HOLDS.** National (ladder stage 3) reached
  4/4: d33/d32/d29/d39 (r113: d37/d32/d28/d45) — OPENS. Lesser seat
  priced 4/4: d46/d36/d36/d46 (r113: d46/d103/d36/d43) — HOLDS. Full
  seat priced 0/4.
- **Q4 PEOPLE CHECK: NOT clean — carried defects persist, unchanged.**
  6 day-transcripts read in full (d90/d120; 97901 has no d90
  transcript — see below) + all 14 raise talks read in full. Accept
  echo 8/8 accepted/counter talks, brush-off close 14/14, unvoiced
  raise 6/14 (all Baraka, French-only, mime-only), unanswered
  invitation 1/14 (Stella's trap line) — the same carried family, same
  counts per talk as r122. No NEW senseless moments. Gossip
  voice-break: not seen this run (Ursula's gossip stays in voice).
- **Q5 CENSUS: see below.**

## The survival collapse (the run's second finding)

0/4 seeds alive at the horizon (r113: 2/4). End days: 97901 d103
(pop 1/1 — the scholar Sofia Chen alone), 97902 d121 (0/0), 97903
d131 (0/0), 97904 d133 (0/0). Total band days 488 vs r113's 646
(−24%). The collapse truncates the trade road: villages die before
links can season to 3, so the Q1 PARTIAL is read with this confound
in mind — the charter verdict is about a band that did not live
long enough, not only about the walk.

Roster shape: slow attrition plus sudden multi-death days — 97901:
3 deaths d64; 97903: 8→5 in one day (d130); 97904: 7→3→2 over
d129–d132 (4 deaths d131). Joins partly refill the villages mid-run
(97903 back to 10 at d106, 97904 to 10 at d62), then the late
multi-death days finish them.

What it is NOT, on the evidence in hand: the widened medic duty
cures MORE fevers on this band (97902: 23, 97903: 24 cures vs r113's
22/14), and scholar hunger is DOWN per day (STARVING lines
0.31–0.57/day vs r113's 0.51–0.71/day); pantry ended non-zero on
3/4 seeds (97901 hit 0). So the collapse is not a fever or
starvation story. The witnessed deaths are wild/combat-led (Reunion
kills 3 on 97903; Focus Group, Gavel, Algorithm kills elsewhere),
but the multi-death days are NOT attributed by current instruments
(97904's 4-death day had 0 villager w4 field-fight deaths) — the
death-cause census does not exist yet.

Cause NOT established. The only survival-relevant landed change
since r122's base is the wideduty medic-duty widening (`game.js`,
commit `48c93b22b`), and its mechanism points the other way (more
cures, duty-held 61%→88%). The other four landed changes are
conversation/social/narration. Any of the five moves the RNG stream
(the r122-deepening note's own warning: same-seed outcomes move
when conversation trajectories shift), and 4-seed survival is
fragile — r113 itself lost 2/4. No causation is claimed. The
attribution run is proposed in Metric review, not attempted here.

## Census (plain words)

- **97901 — dead d103, Sofia Chen alone at the end.** Three codex
  studies (d27/d30/d33, first d27), first trade d56, 2 proposed,
  0 seasoned. National d33, lesser priced d46. Pantry hit 0. The
  village bled from 12 to 1 by d89 and lingered as one person to
  d103. One villager w4 death, 5 w4 fights.
- **97902 — dead d121, 0/0.** Three studies (d29/d83, first d29),
  first trade d49, 3 proposed, 1 seasoned. National d32, lesser
  priced d36 (the earliest lesser price in the band). 9 raise talks
  (the most — Baraka's French mime sequence d10–d16, six sittings).
  22 villager w4 fights, 1 villager w4 kill, 2 villager w4 deaths.
  Tribute arrived twice, both short.
- **97903 — dead d131, 0/0.** Studies d28/d40, then the same
  village (village_3) studied ~30 times d70–d128 (see Finding
  below). First trade never; 0 proposed despite 27 sub-cap skips.
  National d29, lesser priced d36. 14 villager w4 fights, 3
  villager w4 deaths (all Reunion). Tribute arrived 5 times, 1
  short. Joins rebuilt the village to 10 at d106 before the d130
  3-death day.
- **97904 — dead d133, 0/0.** Three studies (d38/d54/d60, first
  d38 — later than r122's d29 on the same seed). First trade d66,
  3 proposed, 2 seasoned — the band's best trade line, still short
  of the 3-seasoned charter wall. National d39 (r113: d45), lesser
  priced d46. 14 villager w4 fights, 1 villager w4 kill, 0 villager
  w4 deaths; Nina died of her wounds. The d131 4-death day (7→3)
  is unattributed.

## People check (Q4 detail)

Transcripts read in full (6): 97902-d90 Amina (midwife, trust 89) —
creek-water favor, commit, "Dawn, then. Bring something to carry";
97902-d120 Rangimarie (carpenter, trust 32) — "I asked Rosa about
this wound — Rosa's gone. Still need hands. Are you in?" — the ask
still makes sense with Rosa dead; commit, "Careful with it. And —
thank you." 97903-d90 Ursula (mortician, trust 22) — grief opening,
then a gossip chain (Aroha, Devon, Nathan's return, Ruth fetching
water) that stays in voice; 97903-d120 Nathan (HVAC, trust 90) —
grieving, comfort opens him, ask_favor probe honestly declined
("No, really — it's handled"), easing beat. 97904-d90 Yara
(interpreter, trust 53) — secret offered ("I know who took the
extra rations but won't say"), picker leaves without answering; the
secret hangs, honestly. 97904-d120 Zoltan (mushroom grower, trust
42) — curious want ("Are you angry?"), "Furious. Most days." →
"...Good. Anger's fuel. Just — point it somewhere useful." All
sensical. **97901 has no d90 transcript** (village alive to d103;
the driver emits a transcript only when a conversation fires that
day — no sitting fired on d90; a gap in coverage, not a verdict).

Raise talks (14): accept echo 8/8, brush-off close 14/14. The
Baraka sequence (97902 d10–d16, 6 talks): a French-only villager
mimes "come with me" six times in seven days with no shared words
learned between sittings (the picker catches one word at a time —
'Non', 'Salut', 'rien') — the language barrier is played honestly,
but the same unvoiced raise repeats with no progress, a filler
loop in effect. The counter talks (97902-d13 Tashi, 97903-d13
Nathan) surface a real grievance ("There's still the matter of the
ambush of Baraka/Emma. Nobody's settled it.") — sensical. Stella's
trap-line invitation (97904-d24) is never answered.

## Finding — the repeat-study loop (not a verdict item)

On 97903 the scholar studied village_3 ~30 times in 58 days
(d70–d128, every other day), while other villages went unvisited.
Codex entries still grew on the repeats (78 → 82 over the tail),
so the visits are not empty — but explore is capped on all four
seeds, so the repeats buy no standing, and the pilgrimage never
diversifies to unstudied villages while one village in range keeps
yielding. Worth a look by the next run that touches pilgrimage
choice: prefer an unstudied village when the nearest is already
studied, or say why the repeat is the right call.

## Metric review (§14)

- Q1's bars worked as written: PARTIAL fired on the 3/4
  meet-or-beat rule (97902 3>2, 97903 0=0, 97904 3>0; 97901 2<3).
  One gap the bars don't capture: the survival collapse truncates
  the trade road, so PARTIAL mixes "the walk moved the ladder" with
  "the villages died before seasoning." Next run's prereg should
  carry a survival control (e.g. a minimum lived-days floor per
  seed, or a season-window metric: seasoned links per 100 lived
  days) so a ladder verdict is not silently a survival verdict.
- First-study day (r122 metric-review ask) behaved: 97904 d38 (r122:
  d29, r113: never), 97901 d27, 97902 d29, 97903 d28. The pilot's
  d38 vs r122's d29 on the same seed is trajectory shift, not a
  mechanism regression — 3 studies still landed by d60.
- The prereg's disclosed-delta section was correct and necessary:
  five landed src changes sat between r122's base and this band's
  base, and the survival collapse cannot be read as a clean
  single-lever comparison. The medic-duty confound was named in
  advance; the band's fever-cure counts now argue against it as the
  killer, but that is evidence, not proof.
- Proposed next run: a survival-attribution run — the same 4 seeds
  on the pre-wideduty base vs current base, with a death-cause
  census instrument (multi-death days attributed: raid vs
  field-fight vs wound-fever vs starvation), before anyone leans on
  the collapse either way. Do NOT re-run the ladder band until the
  attribution lands; a second collapsed band adds no information.

## Telemetry

Ran `node scripts/telemetry-check.js` against the `scale.json`
baseline (4-seed r113 band sums 446/289/646) with the r123 band
sums (aggregate JSON in the goal hidden_files evidence dir,
derived from the band logs' ladder lines): **2 LOUD lines.**
- `fightsTotal` 446 → 166 (−63%) LOUD.
- `fightsByWave.4` 289 → 93 (−68%) LOUD.
- `maxGameDay` 646 → 488 (−24%) quiet.
Investigation (same-run, before any baseline roll): NOT an
instrument error — all instruments err=0, rows present on all
seeds. The deviation is the survival collapse (488 vs 646 days)
PLUS lower fight density (0.69 → 0.34 fights/day; w4 0.45 → 0.19
fights/day) — smaller rosters for most of the band and villagers
fleeing wave-4 (45 of 55 w4 encounters). **Baseline NOT rolled
forward** — the band is a different survival regime; rolling
forward would bake the collapse in.

## Tests

- r123 proof coverage: none owed — zero `src/js`, zero
  harness/collector changes (driver clone + prereg + note only).
  Regression cover re-run on this base: the r122 walkTo proof test
  `scripts/test-journey-scale-r122-walkto-20261109.js` — **6/6 pass**;
  the policy file + all three instruments are byte-identical to the
  r122 landed version (`git diff 4b7c7ad47..HEAD` empty on
  `scalecourt-traderoad-r113.js`, `ladder-instrument-20261109.js`,
  `traderoad-instrument-20261109.js`,
  `regionalstep-instrument-20261107.js`).
- `check.js --quick` NOT run this run: the run budget does not hold
  a ~12-minute gate, and this run changes zero `src/js` and zero
  harness/collector inputs. The gate is owed on the next run that
  touches `src/js` or the harness. (Same standing as r122-scale.)
- Band stderr: 0 instrument errors on all 4 seeds (ladder/trade/
  wildW4/regGate rows all present; 97901: 103/103, 97902: 120/120,
  97903: 130/130, 97904: 132/132 rows).

## Gate

- Pilot gate passed: 97904, no crash, 0 instrument errors, 3 studies
  by d60 (d38/d54/d60), zero ≥5-day stalls.
- Band complete: 4/4 seeds, no crashes, 0 instrument errors, all
  rows present. Q1 PARTIAL, Q2 FACES, Q3 OPENS+HOLDS per the prereg
  bars — no re-scoring.
- Telemetry: 2 LOUD lines investigated same-run (survival collapse
  + lower fight density, not an instrument error); baseline NOT
  rolled forward.
- Proof test re-run 6/6 on this base; policy + instruments
  byte-identical to the r122 landed version.
- `check.js --quick` NOT run (zero `src/js`/harness change; budget);
  owed on the next run that touches `src/js` or the harness.
- No `[needs-eyes]` item: no src change, no feel change. The
  survival collapse is the item for Steve's eyes in the executive
  update, not a commit flag.

## Landing

Merged `journey-scale` ff-only to master, merged locally, pending
ship. Rotation 3→0 advanced by this run. Worktree released, branch
deleted. (Merge tip recorded in the run's memory-log entry.)

## Files (this run, in the worktree)

- `evidence/2026-11-09/journey-scale-r123-prereg.md` — binding
  prereg (disclosed delta since r122's base, Q1–Q5, matched band).
- `scripts/journey-scale-r123-20261109.js` — driver clone
  (labels/EVIDIR only; policy require unchanged).
- `evidence/2026-11-09/journey-scale-r123/` — pilot + band
  evidence (4 seeds × 180-day cap: postrace, morntrace, capture,
  raise talks, transcripts, all instrument rows).
- `evidence/2026-11-09/journey-scale-r123.md` — this note.
- Goal hidden_files: `evidence/2026-11-09/journey-scale-r123-aggregates.json`
  (telemetry-check current aggregates with per-seed provenance).

## LOUD items

1. **Survival collapse on the matched band: 0/4 alive (was 2/4 in
   r113); total days 488 vs 646.** Cause not established (see
   above). The attribution run is owed before anyone leans on it.
   The medic-duty widening is the only survival-relevant landed
   change, and the band's own fever-cure counts argue against it —
   but that is evidence, not proof.
2. **Telemetry LOUD on fightsTotal (−63%) and fightsByWave.4
   (−68%)** — investigated, explained by the collapse + lower
   fight density, not an instrument error. Baseline NOT rolled
   forward.
3. **Local master is ahead ~272 / behind ~156 vs origin/master**
   (carried from r122; origin tip `a628aeaf3`, PR #121). No
   reconciliation, no merge of origin/master, no push — the ship
   loop owns it. This run proceeds on local master `17777346b`
   and merges locally only.
4. **Stale-lock recovery at run start (this run):** the Lane A lock
   held r122-deepening's run_id (`2026-11-09T19:07:10Z`, 99 min
   old, heartbeat ~21 min stale, no live process) — the r122
   coordinator died after its fix commit, before gating/landing.
   Adopted and landed its branch this run (rebase onto `d3ec7acc9`,
   then onto `30d95ed8c` after sim-bandfreeze-b landed; proof
   tests 31/31 + 20/20 + 35/35 re-run green; the measurement-proof
   pair failed on the rebased tree because the fix changed Game
   inputs — refreshed with a real neutral panel,
   `scripts/balance-proof.json` re-pointed; `check.js --quick`
   296 passed / 4 failed, the standing set; merged ff-only as
   `17777346b`, pending ship). Rotation advanced 2→3.
5. **Repeat-study loop** (97903: village_3 studied ~30 times in 58
   days while explore is capped) — named above, not a verdict item.
6. **Baraka's unvoiced raise repeats 6 times in 7 days** with no
   shared-words progress — the carried defect, sharpened.
