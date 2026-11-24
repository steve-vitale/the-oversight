# Wave-5 facing after a LATE unlock — Loop B, run fleshout-loop-b-20261124T1430Z, arm sim-w5lateface-b (DIAG)

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Answers: 1030Z next blank #4 (never started — the 1030Z claim named
this arm but ran linkform in its place) and sim-standingconfirm-b.md
§Next blanks #4 ("wave-5 facing after unlock is now PARTLY open
again: 3/4 faced, 1 un-faced with only 12 days of runway").

## Question

After wave 5 unlocks LATE, does the village actually FACE wave 5
(fight a wave-5 monster / reach wave-5 content), or does the unlock
arrive after the village is already spent?

## "Late", frozen from the data (not assumed)

Unlock (door, peak 4→5) days on the six known unlocks in the named
corpora — gearready pilot 109301 d80, 109306 d92; standingconfirm /
vetpair / bloodcluster band 109313 d65, 109312 d89, 109311 d117,
109314 d138 — are {65, 80, 89, 92, 117, 138}. The largest gap in
the sorted list is 92→117 (25 days; other gaps 15, 9, 3, 21).
**LATE = door day > 100.** The cutoff sits inside that largest
gap, equals the ~100-day target arc end, and equals the end of the
pacing-audit facing window (docs/MONSTER-WAVES.md: a strong run
unlocks w5 ~day 77–93 and faces 2+ Producers ~day 83–99). It also
honors the standingconfirm metric-review suggestion to judge facing
only on seeds whose door opened before day 120 or with ≥ 30 days
of runway — the ≥ 30d runway cut is kept as a pre-registered
SECONDARY split (§Secondary), not the definition of late.

Frozen consequence: late unlocks = {109311 (d117), 109314 (d138)};
early unlocks = {109313 (d65), 109301 (d80), 109312 (d89),
109306 (d92)}. If the judged corpus contains any further unlock,
it is classified by the same frozen cutoff — the cutoff does not
move.

## Corpus and the no-fresh-sims decision rule

STARTING corpus (all committed on master, checked present before
this prereg was written):

- `evidence/2026-11-24/perseed-standing-gearready-b/` — gearready
  pilot seeds 109301–109308 (RUN `standing-gearready-b`) and
  standingconfirm seeds 109310–109325 (RUN `standingconfirm-b`).
- `evidence/2026-11-24/perseed-vetpair-b/` — vetpair replay of
  109310–109325 (RUN `vetpair-b`).
- `evidence/2026-11-24/perseed-bloodcluster-b/` — bloodcluster v2
  of 109310–109325 (RUN `bloodcluster-b-v2`), the only corpus with
  per-fight contact rows (`fieldFights`, `tbStarts`).

BAND-NAME CORRECTION: the brief names "the standingconfirm band
109309–109324". Per sim-standingconfirm-b.md the named band was
NOT fresh (seed 109309 was spent as a probe by
journey-deepening-r278), so the band actually run was 109310–109325
— the same 16 seeds as vetpair / bloodcluster. This arm uses
109310–109325 throughout; no seed 109309 corpus exists.

DECISION RULE (frozen): this arm is a re-analysis. NO fresh sims
run if the judged analyzer classifies every late-unlocked seed
from the corpora above (0 unclassified, §Primary). If any
late-unlocked seed lacks the fields to classify (no daily
`w5faced`, no `killEvents`, no contact rows), the arm stops,
records the gap, and runs a fresh 8-seed pilot with a facing
recorder on a fresh band before judging anything. Exploratory
reads before this prereg established only that the fields EXIST
in the corpora (daily `w5faced`, `killEvents`, `fieldFights` /
`tbStarts`); all judged numbers come from the analyzer run AFTER
this prereg commit.

Substrate of the corpora (as run, not re-run): competent policy
`scripts/policies/competent.js` `{competent}` verbatim, default
env, horizon 150 days death-aware. Anchor varies by corpus
(gearready `f74931e6`, standingconfirm `60f6e7436`, vetpair
`87f6312b4d2c`, bloodcluster v2 `e68ab43a2d3c`); the analyzer
cross-checks door days and first-face days across the corpora
that share a seed and reports any disagreement instead of
pooling silently.

## Definitions (frozen)

- DOOR DAY: first daily snapshot with `peak >= 5`, cross-checked
  against the `releaseLines` day (the release line may stamp the
  day before the first peak-5 snapshot; either is accepted and the
  discrepancy is reported, as the gearready analyzer does).
- FACED: the village fought a wave-5 monster blow-by-blow. First-
  face day = the EARLIEST of (a) first daily snapshot with
  `w5faced > 0` (`Game.waveEngaged(5)` — distinct wave-5 types
  engaged, the standing-gearready analyzer's convention), (b)
  first wave-5 `killEvents` day, (c) first wave-5 contact day
  (`fieldFights` / `tbStarts` with `wave == 5`, bloodcluster
  corpus only). Fleeing counts as faced (canon: engagements feed
  the deed bars; fleeing records a face). A kill with no earlier
  face counts as a face on the kill day (109306: kill day 101,
  first `w5faced` snapshot day 102 — snapshot timing, not a
  contradiction).
- RUNWAY: end day − door day (days left alive / to horizon after
  the door opens).
- DAYS-TO-FACE: first-face day − door day, for faced seeds only.
- POST-DOOR CONTACTS: wave-5 and wave-4 `fieldFights` + `tbStarts`
  with day >= door day (bloodcluster corpus only). The wave-4
  count is the spawn-side control: a village still meeting
  wave-4 monsters after the door is still meeting monsters at
  all. Intended cast share once wave 5 is unlocked is 55% wave 5
  (`Game.spawnWaveTarget`, top wave 5: r < 0.55 → 5).
- POST-DOOR VILLAGE STATE: `readiness5` bars (veterans / armored /
  armed) on the first snapshot after the door, and at end.

## Primary metric (frozen)

**Faced-after-late-unlock share = faced late seeds / late-unlocked
seeds, reported with the counts.** This is a DIAG: the share
itself is the answer, not a lever verdict — no GO/NO-GO on the
share value.

**GO bar (the instrument's bar): classification completeness —
0 unclassified late-unlock seeds.** Every late-unlocked seed
carries exactly one outcome class:

| Class | Definition |
|---|---|
| FACED | a first-face day exists within the runway |
| NO-SPAWN | no wave-5 contact row, no `w5faced > 0`, no wave-5 kill in the whole post-door window, AND wave-4+ contacts continue post-door (spawn-side control > 0) |
| DIED-BEFORE-FACE | village lost before any wave-5 contact |

Any late seed fitting none of these (e.g. window ends with no
contacts of any wave at all, or the corpora disagree on its door
day) is UNCLASSIFIED and fails the bar. A `NO-ENGAGE` class
(spawn arrived but never became a fight) is NOT in the taxonomy:
a spawn that never becomes a fight is recorded nowhere in these
corpora, so it cannot be classified from them — stated here, not
pretended.

## Secondary cuts (pre-registered, not rescues)

1. Adequate-runway split (standingconfirm metric review): the
   share recomputed on late seeds with runway ≥ 30 days.
2. Days-to-face distribution over ALL faced unlocks (early +
   late): values, median, max. The max observed lag is the
   yardstick for whether a no-face window was "long enough".
3. Post-door wave-5 contact rate vs the 55% intended cast share,
   and expected-vs-observed contacts in each no-face window.
4. Post-door village state for each late seed (veterans / armored
   / armed at door+1 and at end; ready days after the door).
5. Scale-wall numbers, per corpus as established (gearready pilot
   0/8 wins, 2/8 unlocks; confirm band 0/16 wins, 4/16 unlocks)
   plus the pooled unlock set (6 unlocks in 24 seeds) labeled as
   this re-analysis's denominator, not a new sim band. No pooling
   of win/national counts across anchors as a new claim.

## Instrument

- Analyzer (new, this arm):
  `scripts/w5lateface-b-analyze-20261124.js` — loads the three
  corpora above, derives door day / first-face day / runway /
  days-to-face / post-door contacts / post-door village state per
  unlocked seed, classifies every late seed, cross-checks door
  days and first-face days across corpora sharing a seed, and
  reports disagreements. Zero src/js.
- Proof test (new, this arm):
  `scripts/test-w5lateface-b-20261124.js` — fixture tests for the
  classifier (FACED incl. kill-before-faced-snapshot; NO-SPAWN
  incl. the spawn-control requirement; DIED-BEFORE-FACE;
  UNCLASSIFIED on a contactless window), cross-corpus agreement
  on the shared seeds, and determinism (analyzer run twice over
  the frozen corpora yields byte-identical output). Green BEFORE
  the judged run.
- Balanced panel (§15): INAPPLICABLE — a diagnostic re-analysis,
  no before/after change; no comparison is fabricated.

## Staging (§9)

No pilot/confirm split applies: there are no fresh sims unless
the decision rule above forces a pilot. The judged leg is the
analyzer run on the committed corpora after this prereg commit.

## Sense-test

Sample villager behavior out of the sims for the late seeds:
`saySample` / `standingLines` around the door days, the pair's
deaths on 109314, and the Spoiler fights on 109311. Judge meaning
and coherence, never just counts.

## Metric review (to be filled in the evidence file)

- Whether the > 100 cutoff held (any unlock landing in 93–116
  would have fallen in the gap and forced a judgment call).
- Whether snapshot timing (kill before first `w5faced` snapshot)
  moved any first-face day by more than the snapshot cadence.
- Whether the 55% cast share is the right expected rate for
  post-door contacts, or whether contact mix (field vs TB,
  wanderer vs feast-draw) needs its own number.
- Whether runway ≥ 30 days is the right adequacy bar, or
  whether the observed first-face lags argue for a different one.
