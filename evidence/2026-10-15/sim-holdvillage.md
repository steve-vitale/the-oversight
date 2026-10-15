# sim-holdvillage — the village-mortality census on national-hold village deaths (2026-10-15)

Worktree: `~/workspace/worktrees/sim-holdvillage`. Run: oversight-flesh-out-loop
fleshout-a-20261015T0715Z, ARM 3 of 3 (sim-holdvillage) — DIAGNOSTIC INSTRUMENT,
zero game-code changes, zero policy changes (scripts + evidence only).

**Assignment lineage:** the holdloss census (sim-holdloss, evidence/2026-10-15/sim-holdloss.md)
named national-hold LOSS MODES (succession-chain 2/3, other-named 1/3); the succhain
instrument (sim-succhain, evidence/2026-10-15/sim-succhain.md) named bearer-death
CHAINS (27/28 combat, polity holds 22/23). What neither names: the modal loss the
tracker keeps recording — **the VILLAGE DIES WITH THE RANK STILL ON** (r4: 6/13
nationals end by village-death; "the rank doesn't fail; the village does"). This arm
builds the instrument that names WHAT KILLS a national-holding village: death-cause
families, the 30d pantry trajectory before death, raid/succession/contest/arena
co-occurrence ±4d, links/arrears/pantry state at death.

**Canon:** docs/CANON.md read first; docs/SCALE.md read for the scale ladder
(national = live state, not a title; polity = one primary with ≥3 seasoned
subordinates). No canon doc covers succession cascades or village-mortality
attribution — the census taxonomy is this arm's instrument, not canon. Disease
names per docs/DISEASES.md; monster names/descriptors from src/data/monsters.json —
both inherited via scripts/holdloss-lib-20261015.js (classifyDeathFamily), which
this arm imports like the succhain arm does.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** of the runs that reach national AND die with the rank still on, WHAT
KILLS the village? Name the terminal cause-family shares across the last 30d, the
30d pantry trajectory, the polity state at death, and the raid/succession/
contest/arena co-occurrence ±4d.

**DIAGNOSTIC GO (binding):**
- ≥90% of national-hold village deaths ATTRIBUTED — attribution = (1) cause
  family named: death-cause family shares across the last 30d window (every
  death named via holdloss-lib's classifyDeathFamily; unnameable causes named
  raw, trail kept; a zero-death window counts AGAINST — the family is then
  unnameable); + (2) 30d pantry trajectory readable (pantry-days landmarks,
  min, starved-days count); + (3) polity state at death readable (rank, links
  with trust/arrears, total arrears); + (4) co-occurrence named
  (raid/succession/contest/arena/tribute-snap beats ±4d listed, even when
  empty). Any unreadable part counts AGAINST the 90% (the succhain honest-
  remainder convention).
- ≥2 sense-read death narratives in plain words (SENSE-TESTING LAW — read,
  not counted).
- ONE named next lever filed in sim-findings.md for a follow-up arm.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast}
unlayered, 180d death-aware, FEASTSCALE_R13=1 asserted up front in proof AND
sweep (the #312 lesson). Diagnostic arm on the current tip — own control not
needed (no lever, no policy layer; the instrument is the deliverable).

**Horizon + why:** 180d death-aware (dead villages stop simulating, ≤10d
tail). National holds on this tip reach ~d77–150 and die through d90–180;
the village-death question needs the post-reach months. Death-aware, never
a fixed truncation.

**Instrument:** `scripts/holdvillage-lib-20261015.js` (pure classifier on
persisted run records; zero policy edits, zero src/js changes), built on
scripts/holdloss-lib-20261015.js (classifyDeathFamily, the gday off-by-one
repair, the honest-remainder convention).

Death-window definition (documented, pinned by proof): a national-hold
village death = endReason ∈ {village-dead, village-lost, pop-zero} AND the
final scaleRow rank ∈ {national, global}. deathDay = daysRan; the loss
window = [deathDay−30, deathDay+1] (the +1 is the gday off-by-one repair:
beats/deaths can be timestamped a day after runDays' returned day count).
Co-occurrence = beats ±4d of deathDay bucketed into raids, successions,
contests, tribute-snaps, wave-unlocks. Pantry trajectory = nearest foodRow
≤ deathDay−30/−15/−7/−1, window min + day, starved-day count, first zero-
pantry day. Polity at death = nearest scaleRow ≤ deathDay (links with
trust/arrears/perWeek, total arrears, min trust). Narratives are first-
class deliverables (SENSE-TESTING LAW).

**Proof:** `scripts/test-holdvillage-20261015.js` — REAL-RED (a naive
whole-run cause-grouping misattributes a raid→succession→starvation
entanglement as 'combat' AND misses a final-day+1 death) → GREEN (fixtures:
windowed family shares, pantry trajectory, polity at death, co-occurrence,
the attribution bar's readable/unreadable cases, the death narrative);
trajectory-neutrality (instrument ON vs OFF byte-identical 30d on a real
sim — the sampler is read-only). FEASTSCALE_R13=1 asserted up front (#312).

**Beat-ring repair (#303 lesson):** the sweep's attachBeats uses the 4000
ring buffer from the tworung2 repair (the old 600-cap starved late windows
— wave-4/5 and national-loss beats at d100+ were dropped). BEAT_RE extends
the succhain regex with contest|arena|carried off for the co-occurrence
buckets.

**Metric review (see end of file):** required per §14.

## Results — the 16-run instrumented suite

Substrate: 8 seeds × {leadfeast, belongfeast} unlayered, 180d death-aware,
FEASTSCALE_R13=1 asserted up front. Proof: `scripts/test-holdvillage-20261015.js`
37/37 GREEN (REAL-RED on the naive whole-run grouping + the late-window
death, trajectory-neutrality ON/OFF byte-identical 30d). SMOKE green,
DETGATE green (D1 determinism, D2 ON/OFF byte-identical 60d). Per-seed
packets: `evidence/2026-10-15/perseed-holdvillage/`; summary:
`evidence/2026-10-15/sim-holdvillage-runs.json`; sweep log:
`evidence/2026-10-15/sim-holdvillage-sweep.log`; coordinator telemetry:
`evidence/2026-10-15/telemetry-holdvillage/` (16 records, booleans as 0/1).

**DIAGNOSTIC: attribution GO on the letter (1/1 = 100% ≥ 90%); the ≥2-
narratives bar MISSES (1/2) — the died-holding denominator on this
substrate is n=1.** The instrument is green (proof 37/37, gates green,
repaired and re-proven mid-run); the census is thin. The thinness IS a
finding — see the national-end census below. Per §14 the miss is recorded
in metric review, not re-scored.

### The national-end census (5 reaches)

| run | national span | end | mode |
|---|---|---|---|
| leadfeast s22 | d77–148 | village-lost d151 at regional | rank fell first (succession-chain d149), then the village died |
| leadfeast s33 | d77–180 | survived d180 | held-to-end |
| leadfeast s44 | d77–115 | survived d180 at regional | rank fell d116, village lived |
| leadfeast s66 | d77–180 | survived d180 | held-to-end |
| leadfeast s77 | d77–91 | village-lost d91 **at national** | **died-holding — the census** |

Of 5 national reaches: 2 held-to-end, 2 rank-fell (one then died, one
lived on), 1 died with the rank still on. The tracker's r4 shape ("6/13
nationals end by village-death with the rank still on") does not reproduce
on this tip (1/5): the landed succpolity fix closed succession-collapse as
a loss mode, and the national-end distribution shifted toward holds and
rank-falls. belongfeast reached 0/8 nationals (same as sim-holdloss and
sim-succhain on this tip — the belong courtship isn't seasoning on these
seeds; arm-independent substrate variance, not the instrument).

### The census (n=1): leadfeast s77, d91, ATTRIBUTED

Death window d61–92. Family shares: combat 1/2 (d83 Jesse Cortez, the
bearer), starvation 1/2 (d92 James — the gday off-by-one repair counts
him; a naive window would have missed the terminal death). Pantry
trajectory: 0.0d on d61 → 12.0d on d76 → 5.0d on d84 → 2.0d on d90
(the village rebuilt from the d61 crash to 14d by d75, then bled down
again); 0 starved days by the ate-share<60% rule — the village aggregate
kept eating 78–116% through the window (daily catch, not stores); James
starved individually while the aggregate ate 88.7% — a distributional
death, not a supply death. Co-occurrence ±4d: **3 night raids in 5 days**
(d87 The Bloodied carried off ~940 kcal, d90 The Hungry Road ~0, d91
Stonebridge ~0) + 4 contest/arena beats (d87–88, "You start this one
already hurt") + 1 wave/draft beat. Polity at death: national, 3 links,
trust 96/81/75, total arrears 2,100 kcal — a HEALTHY polity. The rank
didn't fail; the village was raided into hunger during a contest week.

**Wall numbers this run:** national 5/16 (leadfeast 5/8, belongfeast 0/8);
table 8/16; wins 0/16; wave-4 8/16, wave-5 6/16; median survival 151d;
max 180d; exiled 2/16.

## Death narrative (SENSE-TESTING LAW — read, not counted)

**leadfeast s77 — the raid-siege week (died-holding, 16d hold, ATTRIBUTED).**
National since d77 — a 16-day-old polity. d83: Jesse Cortez, the bearer,
dies in combat. The succession drumbeat fires; the subordinates press the
tribute down on the empty chair (the s77 holdloss story). The village
keeps working — the pantry, empty on d61, is rebuilt to ~14d by d75. Then
the siege week: d87 The Bloodied come in the night and carry off ~940
kcal; the same day the System interrupts with a contest ("📺 ═══ CONTEST
INTERRUPTION ═══", "You start this one already hurt"); d90 The Hungry
Road take what's left (~0 kcal — the shelves are bare); d91 Stonebridge
come for the third night in five days. The pantry bleeds 12d → 0d. d92:
James starves — slowly, the aggregate still eating. The polity at the end:
three links, trust 75–96, arrears 2,100 kcal. Nothing political failed.
The village didn't dissolve, wasn't exiled, wasn't out-fought in one
battle — it was stripped night after night while the galaxy watched a
contest. Judge: coherent, consequential, honest. The terminal mechanism is
raid-siege density on a young national, not the succession chain the r4
census named and not the bearer-mortality the succhain census named.

(Second narrative: none — the died-holding denominator is 1 on this
substrate. The ≥2 bar misses on the letter; recorded in metric review.)

## Village assessment (plain words)

Five villages reached national, all on the leadfeast road. Two held it to
the horizon (s33, s66 — 105d holds). One lost the rank on a leader's death
and then died at regional (s22 — the holdloss succession-chain story,
rank-first). One lost the rank and lived on (s44). One died with the rank
still on (s77 — the raid-siege week above). The through-line across all
five is the same as the holdloss census found: the NEIGHBORS. Raids strip
the pantry, subordinates press tribute on empty chairs, and the young
national bleeds. What this census adds: when the village DOES die with
the rank on, the polity is healthy — the failure is material (raids +
hunger), not political. The scale wall's hold face, on the current tip,
is a siege face.

## Blanks filled / documented

- **FILLED:** the village-mortality census instrument itself —
  `scripts/holdvillage-lib-20261015.js` (pure classifier on persisted
  records; zero game-code, zero policy), `scripts/sweep-holdvillage-20261015.js`
  (SMOKE/DETGATE/16-run suite; the #303 4000 ring buffer; the win beat as
  the win authority per the succhain correction),
  `scripts/test-holdvillage-20261015.js` (37/37 GREEN: REAL-RED on the
  naive whole-run grouping and the late-window death + trajectory
  neutrality), `scripts/analyze-holdvillage-20261015.js` (census roll-up).
  Reusable for future mortality arms; the death narrative is a
  first-class output, not just counts.
- **FILLED (instrument repairs, proof-tested, suite re-run
  deterministic-identical):** (1) raid-bucket precision — bare /treeline/
  matched monster-sighting and night-ambience beats (s77 read "8 raids",
  5 were sightings); the bucket now takes only specific raid phrases
  (night-raid template, carried-off, raid-aftermath, the succhain raid
  phrases) — s77 now reads the honest 3; (2) wave/draft label — the regex
  catches mirror-draft MENTIONS including status beats ("still waiting"),
  so the bucket is labeled wave/draft, not wave-unlock; (3) the narrative
  prints all four pantry marks (the mid-window recovery 0→12d is the
  story the endpoints flatten).
- **DOCUMENTED (for the coordinator's findings backlog):** the national-end
  distribution shifted post-succpolity — died-holding is 1/5 here vs the
  tracker's 6/13 (r4/tworung2, pre-fix). The modal national end on the
  current tip is hold-to-end / rank-fall, not village-death-with-rank-on.
  A future mortality census wanting mode SHARES needs a substrate that
  produces died-holding runs (leadfeast-only seeds, or a raid-enriched
  design — a design question, not a measurement fix).
- **DOCUMENTED:** James starved d92 with the village aggregate ate-share
  at 88.7% — the terminal hunger in s77 is distributional (who gets fed),
  not supply-side. Meal-distribution territory (loop B's distrhalf axis);
  not chased here.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **Attribution bar: GO on the letter, thin in substance.** 1/1 = 100% ≥
   90%. The bar is met exactly as pre-registered — no re-scoring. But n=1
   makes the census a case study, not a distribution. The instrument's
   attribution path is proof-tested (F4 pins the unreadable cases); the
   wild denominator is what it is.
2. **Narrative bar: MISS on the letter (1/2).** The ≥2-narratives
   requirement assumed ≥2 died-holding runs; the substrate produced 1.
   Not re-scored, not padded — the single wild narrative is sense-read
   above and the instrument's narrative builder is proof-pinned (F5).
   A NEXT run wanting the narrative bar should enrich the died-holding
   substrate first (see the documented backlog item).
3. **Modal-family on a tie is insertion-order, not a claim.** s77's
   shares are combat 1/2, starvation 1/2; `modalFamily` reports 'combat'
   (stable sort on the tie). The narrative and evidence both show the
   tie; the modal field must never be quoted without the shares.
4. **The raid-bucket repair is a precision fix, not a re-score.** It
   changed the s77 co-occurrence from 8 raids to the honest 3 and did not
   move the attribution verdict (attributed before and after). Applied
   before the final suite; the proof pins the new behavior (F2/E2).

## Convergence

**Attribution GO (1/1), narrative bar MISS (1/2) — instrument green,
evidence only.** The village-mortality census names what kills a
national-holding village on the current tip: on this substrate, exactly
one village died with the rank on, and it died of a raid siege (3 night
raids in 5 days + a contest week) on a 16-day-old national with a healthy
polity — material failure, not political failure. scale-onramp stays the
blocking axis: wins 0/16, belongfeast 0/8 national, median survival 151d.
Recommended next lever: raid-SIEGE DENSITY (a post-raid cooldown — no
second night-raid within N days), filed below — distinct from the killed
younggrace RATE cut, aimed at the s77 terminal shape this census named.
