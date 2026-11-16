# sim-haventarget-b — evidence (DIAG: expeditions targeting the Haven tile)

Run: fleshout-loop-b-20261116T1130Z (Loop B), axis winnability chain, arm
sim-haventarget-b — DIAG: expeditions targeting the Haven tile (tracker
blank 9, awayhaven finding #2). Branch `sim-haventarget-b` (worktree
`~/workspace/worktrees/sim-haventarget-b`). Frozen prereg:
`evidence/2026-11-16/sim-haventarget-b-prereg.md` (commit cd330b707).
Instrument: `scripts/haventarget-driver-20261116.js`,
`scripts/analyze-haventarget-b.js`, `scripts/test-haventarget-b.js`
(commit 6f1efda2c). Anchor (both legs): `6f1efda2c75d`. Policy: competent
verbatim, sha256 `74a890f0844e…` (full: `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`).
Band 102201–102208 (8 seeds), horizon 150d death-aware, OFF leg first
(recorder off) then ON leg (recorder on). No balanced panel (DIAG, no
game change). No canon doc covers expedition destination picking
(prereg CANON GAP, recorded not invented).

Adoption note: the 1130Z run was killed mid-run by a host write flap.
This run adopted the arm on the same branch: proof re-run green on the
tip, the 2 surviving ON files (s102203, s102208) validated as complete
JSON with 0 instrument errors and reused, everything else re-run.
One write-flap hit during this run: the s102202 OFF write failed all
480 writeRobust retries at ~13:50Z and fell back to stdout
(`@@FALLBACK`); the file was re-run as a single seed and recovered
with byte-identical trajectory fields (survived 150d, standing 150,
regional, 63 deaths, dailySig 148) — the re-run, not the stdout dump,
is the corpus file. The 2 incomplete OFF `.tmp` files from the killed
run were discarded (0 bytes).

## VERDICT — DIAG GO

All 5 frozen GO bars hold (see §GO bars). The instrument is valid and
the table is trustworthy. The verdict is the count table itself:

**Zero Haven-target expeditions on this band: 0 of 103 landed
expeditions (0 of 198 launch attempts).** The awayhaven band-102133
mechanism stands as the existence proof — it was not re-measured
here, per the prereg. On band 102201–102208 the expedition system
never picked home as a destination, by either launch path.

## Count table — Haven-target / all expeditions per seed (ON leg)

| seed | days | end | attempts | landed trips | Haven-target | blocked |
|------|------|-----|----------|--------------|--------------|---------|
| 102201 | 150 | survived | 8 | 0 | 0 | 8 |
| 102202 | 150 | survived | 27 | 27 | 0 | 0 |
| 102203 | 150 | survived | 1 | 1 | 0 | 0 |
| 102204 | 150 | survived | 3 | 0 | 0 | 3 |
| 102205 | 150 | survived | 13 | 0 | 0 | 13 |
| 102206 | 137 | village-lost | 94 | 29 | 0 | 65 |
| 102207 | 121 | village-lost | 31 | 27 | 0 | 4 |
| 102208 | 150 | survived | 21 | 19 | 0 | 2 |
| **total** | — | — | **198** | **103** | **0** | **95** |

## Launch origin of every Haven-target trip

There are no Haven-target trips on this band, so there is no trip to
name a mechanism for. What the corpus does show, per trip class:

- **All 198 launch attempts — landed and blocked alike — are
  `vbrain-party_launch`** (dawn-brain `vbrainExecuteDepart`,
  `src/js/villager-brain.js`). Zero `random-agency` attempts and zero
  `winplan-party_launch` attempts fired on the whole band. H1 (the
  random path cannot target home) is therefore **untested by this
  corpus**, not confirmed: no random launch ever happened to be
  checked. H1 stands as the code read only.
- **Launch-time `plan.node` on all 198 attempts:** null on 186,
  equal to the expedition target on 4, different from the target on
  8. The 4 node==target cases are all Judith on seed 102207
  (days 28/31/36/39, target (3,3), stages party/hunt/hunt/hunt) — a
  real beast node carried into the target, exactly the H2 mechanism,
  but the node was never (4,4). **No launch on the band ever carried
  `plan.node` == (4,4).** H2's mechanism is confirmed as live code
  (node does flow into target); the Haven-target instance of it did
  not fire here.
- **Unknown origins: 0. Re-derivation mismatches (D3): 0.**

## Matched cost table — Haven-target vs same-seed non-home expeditions

Haven-target denominator is 0, so the Haven side is null by
construction; the non-home side is the matched reference (same 8
seeds, same policy, same horizon).

| per-leg rate | Haven-target (0 trips) | non-home (103 trips) |
|--------------|------------------------|----------------------|
| trips | 0 | 103 |
| legs | 0 | 1241 |
| finds per leg | — (no trips) | 0.1442 |
| kcal per leg (finds) | — | 159.27 |
| encounters per leg | — | 0.2095 |
| kills per leg | — | 0.0629 |
| monster encounters per leg | — | 0.199 |
| deaths per trip | — | 0.0194 |
| party-days per trip | — | 3.17 |
| pantry kcal per trip | — | 2129.86 |

Non-home trip totals: 1241 legs, 179 finds (197,651 kcal), 78 kills,
156 evades, 2 flees, 6 gave-room, 5 stood-down, 13 hurt, 2 expedition
deaths, 326.5 party-days, 219,376 pantry kcal banked, 21,725 meat
kcal. XP tracking/survival recorded 0 across all trips (xpN 0 — the
recorder's XP read returned nothing countable; see metric review).

Per the prereg, the verdict for a 0 count is "none on this band",
with the awayhaven band-102133 mechanism (emma_larsen, adaeze_nwosu,
somchai_prasert; destination (4,4), node home throughout) cited as
the existence proof, not re-measured.

## Blocked launches — the other half of the corpus

95 of 198 attempts never landed an expedition, by startExpedition's
own gates (block reason re-derived in the recorder): medic-duty 26,
hurt-no-care 64, sick 5, unknown-block 0. Three seeds launched **zero**
expeditions all run because the dawn brain kept picking the same
medic-duty holder as its candidate: Kyle on 102201 (8 attempts),
Franz on 102204 (3), Kenneth on 102205 (13). Seed 102206's 65 blocks
were mostly Liam hurt-no-care (51 of 65). This is outside the DIAG's
question and was not chased mid-run; it is appended to the findings
backlog (medic-duty candidate starves expeditions on whole seeds).

## Wall numbers — both legs (scale wall)

| | OFF leg | ON leg |
|--|---------|--------|
| national by standing ≥200 | 2/8 (s102203: 295, s102207: 420) | 2/8 (same seeds) |
| national by scaleRank | 0/8 (all regional) | 0/8 |
| national or global | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave 4 unlocked | 8/8 | 8/8 |
| wave 5 unlocked | 2/8 (s102203, s102207) | 2/8 |
| median survival | 150d | 150d |
| wave-4 kills (total) | 21 | 21 |
| deaths (total) | 554 | 554 |

Per-seed OFF/ON wall fields agree exactly (days, standing,
scaleRank, deaths, w4kills identical per seed). **D2 full-band: 0
divergences** — the recorder moved nothing. Standing 199 recurs on
5 of 8 seeds on both legs (102201/102204/102205/102206/102208) — a
ceiling-looking value, appended to the findings backlog as an
observation, not chased here.

## Sense-testing

**No Haven-target trip fired on this band, so no departure or return
line for one exists to quote.** H4 (the fiction does not notice a
home trip) is untestable here — there was no home trip for the
fiction to fail to notice. For contrast, real off-home trips do get
the exact lines H4 names, and they read correctly against a real
journey:

- Departure, seed 102202 day 80 (Natalia): `🎒 "Natalia shoulders a
  pack. 'Going far this time. Don't wait up.'"`
- Departure, seed 102202 day 61 (Liam): `🎒 "'Out past the ridge,'
  Liam says, already walking. 'If I'm not back in a few days...
  well. I'll be back.'"`
- Return, seed 102201 day 18 (Sari): `🧭 "Sari is back from the
  east. 'It's... different out there. I'll tell you about it.' (Ask
  them what they saw.)"`

38 return lines in the corpus name a real compass direction; the
"back from past the <dir>" template never fired for a zero-distance
trip because no zero-distance trip happened. The awayhaven band
remains the only evidence of what the fiction says on a home trip.

## Village assessment

The villages on this band look like the standing wall, not the
expedition system, is the binding constraint: 6/8 survive to 150d,
wave 4 unlocks everywhere, wave 5 on 2/8, but standing stalls at
199 on five seeds and national-by-rank never moves off regional.
Expeditions themselves are busy and productive when they launch
(103 trips, 1241 legs, ~198k finds kcal) — but on 3 of 8 seeds the
dawn brain's candidate choice plus the medic-duty gate means the
village launches nothing at all for 150 days. Nobody died on an
expedition to home; the two expedition deaths were ordinary
off-home trips.

## GO bars (frozen prereg §Primary metric)

1. **100% classified, unknown 0** — PASS. 103/103 landed trips
   classified by destination + origin; 198/198 attempts origin-
   classified; unknowns 0, D3 re-derivation mismatches 0.
2. **Corpus 16/16 files parse** — PASS. 8 OFF + 8 ON, one file per
   seed per leg; all parse as JSON, 0 instrument errors on every
   file (the 2 reused ON files re-validated before reuse).
3. **Proof green** — PASS. `node scripts/test-haventarget-b.js`:
   **48 passed, 0 failed** on the instrument tip (commit
   6f1efda2c), re-run at adoption before any judged sim. D1
   determinism + D2 neutrality green inside the proof; D2 full-band
   0 divergences confirmed by the analyzer.
4. **Wall numbers reported, both legs** — PASS. Table above; ON
   national-by-standing 2, national-by-rank 0, table 0, wins 0,
   wave 4/5 8/2, median survival 150d, wave-4 kills 21, deaths 554;
   OFF identical.
5. **Measurement bar** — PASS. Every Haven-target trip carries a
   named launch mechanism with launch-time `plan.node` shown —
   vacuously complete at 0 trips, with the per-attempt origin and
   plan.node census above (all 198 attempts vbrain-party_launch;
   node (4,4) never carried); matched cost table reported with
   denominators even at a 0 Haven count.

## Metric review (do NOT re-score; for the next run)

- **H1 untested, not confirmed.** No random-agency launch fired on
  198 attempts, so the code-read claim "the random path cannot
  target home" got no corpus check. A band (or a forced-launch
  harness) that actually exercises `startExpedition` with no opts
  is needed before H1 is called measured.
- **H2 mechanism live, instance absent.** `plan.node` demonstrably
  flows into the expedition target (4 node==target trips, Judith
  s102207 → (3,3)), but node (4,4) never appeared. The awayhaven
  band-102133 case (wave-3+ beast met at Haven) is the only
  observed instance; reproducing it needs a band or harness that
  stages a wave-3+ beast encounter at the Haven tile.
- **150d horizon was right for the count question** — Haven-target
  trips did not cluster anywhere; there were none at any day. The
  horizon's binding limit was village death on s102206/s102207,
  handled death-aware.
- **D2 full-band: 0 divergences.** The recorder moved nothing
  (identical days/standing/deaths/w4kills per seed, OFF vs ON).
- **"Party-days" was the right cost unit for what existed**, but
  the corpus shows the bigger expedition cost on this band is not
  trip time — it is **blocked launches**: 95 attempts (48%) never
  left, and 3 seeds launched nothing. A cost table that only counts
  landed trips misses the medic-duty starvation. Next DIAG on
  expeditions should pre-register blocked-attempt share as a
  primary metric.
- **XP read returned 0 across all trips** (xpTracking/xpSurvival 0,
  xpN 0) — either expeditions grant no tracking/survival XP in the
  recorder's read path or the read missed the accrual point. Not
  re-scored; flagged for the next instrument pass.

## Corpora

- ON: `evidence/2026-11-16/perseed-haventarget-b-on/` (8 files)
- OFF: `evidence/2026-11-16/perseed-haventarget-b-off/` (8 files)
- Analysis: `evidence/2026-11-16/haventarget-b-analysis.json`
  (analyzer stdout: onFiles 8, offFiles 8, landedLaunches 103,
  havenTarget 0, havenShare 0, blockedAttempts 95, unknowns 0,
  mismatches 0, d2divergences 0)

## Diff check

Zero `src/` changes in the branch diff (`git diff --stat HEAD --
src/` empty) — DIAG, recorder wraps only (scripts-side). No game
change, no lever, no balance change. Nothing to land as gameplay;
the evidence + corpora are the deliverable.
