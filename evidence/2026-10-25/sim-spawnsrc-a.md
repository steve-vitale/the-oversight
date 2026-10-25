# sim-spawnsrc-a — spawn-source audit for the above-cap raid-time pool (axis scale-onramp)

Run: fleshout-20261025T1615Z (Sun 2026-10-25 ~11:20 CDT onwards).
Axis: scale-onramp (converging). DIAG ONLY — zero src/js changes,
zero game-code changes, zero default flips. Recorder only:
scripts/policies/spawnsrc-diag.js (new) + scripts/test-spawnsrc-diag-sweep.js
(new) + scripts/test-spawnsrc-diag.js analyzer (new). This arm designs
and lands NO fix.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Question (from evidence/2026-10-25/sim-poolpres-a.md blank #3,
  promoted by sim-poolpres-lever-b.md): raid-time pools sit at median 17
  vs the maintainWorldMonsters cap of 8, wave-3+ share only 7.16%
  (107/1,494), and the maintain-weight lever at its 100% ceiling moved
  nothing (byte-identical corpus) because the maintain tap is already
  closed. WHERE does the pool actually come from? Which spawn paths fill
  the pool past the cap, and do they favor wave-1/2?
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 3 = day 25+ and wave-2 ledger; wave 4 = standing >= 100; wave 5 =
  standing >= 200 and wave-4 faced; readiness gates hold waves 4-5).
  No haven/raid canon doc exists (carried) — spawn-path design lives in
  src/js/game.js comments (maintainWorldMonsters, worldTick,
  checkEncounter, castMonster, spawnWaveTarget).
- Spawn-path inventory, READ FROM CODE (never invented) before the sweep:
  all paths funnel through spawnWorldMonster(mdef, tx, ty, opts), which
  pushes one object per spawn onto state.worldMonsters. Callers:
  (1) maintainWorldMonsters — via worldTick on tile entry, ONLY when the
  living pool is below worldMonsterCap (3 base / 5 arrived / 8 deep / +1
  night); (2) checkEncounter tile-entry spawn — on the PLAYER tile when
  no monster is there, chance ~5-15% x night 1.5 x pity, NO cap check;
  (3) checkEncounter wanderer-contact spawn — the cast wanderer
  materializes on the player tile on contact, NO cap check;
  (4) fled-monster recovery — travelTo re-spawns a fled monster on the
  arrival tile (a re-entry, not fresh stock); (5) trap (gwTrap) spawn;
  (6) scripted: hushwolf pack (evQuietWoods, 3), titans / network /
  finale pieces (opts titan:true); (7) titan/lingerer combat restore —
  pushes the SAME object back (not a new spawn; carries its tag).
  The recorder tags each spawnWorldMonster return object at birth and
  classifies by caller flag + mdef/opts shape (see the recorder header);
  a re-entry/restore is never double-counted as a fresh spawn.
- Substrate (shared, landed pattern): tableseat-nowait
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + spawn-source recorder
  (SPAWNSRC=1). Seeds 73671-73678, 180d death-aware horizon (runDays
  stops on death/win; 180 is the cap). Pilot = this 8-seed band; NO
  confirm spend unless this header pre-registers a confirm band first
  (it does not — a confirm is a follow-up run's pre-registration).
- Recorder neutrality (gate, stated before the sweep): this recorder
  draws no RNG, throws nothing into the engine, returns every original
  value untouched, and tags monsters with one extra property the game
  code never reads. Its armed band must reproduce the poolpres control
  band (deaths 234, national-ever 7/8, wins 4/8, raids 85, raiders 361)
  or explain any deviation BEFORE judging; a moved trajectory
  invalidates the audit. A determinism/neutrality gate script
  (scripts/test-spawnsrc-detgate.js) proves delegation-off identity
  plus the spawn-tag classification on a driven game.
- PRIMARY (DIAG-GO requires ALL of):
  (a) >=95% of raid-time pool entities classified by spawn source
  (unknown <= 5% of pooled per-raid living-pool entities);
  (b) per-seed + pooled source shares reported, with the above-cap
  portion (pool beyond cap 8, up to median 17) attributed by source
  under the stated convention: pool entities ordered by spawn sequence
  (the recorder's birth counter; worldMonsters list order is spawn
  order modulo removals), the earliest `cap` living entities are the
  cap stock and the rest is the excess — a defined accounting view,
  NOT an engine label;
  (c) wave mix per source reported, answering whether the filling
  sources favor wave-1/2;
  (d) wave-5 pool presence reported (count + by source).
  If classification <95% or "unknown" >5%, the verdict is DIAG-NO-GO
  (audit incomplete), not a pass. Do NOT design or land a fix.
- Secondary (reported, NOT gated): total fresh spawns by source over
  the band (birth census, not just raid-time samples); pool wave-3+
  share recomputed (must be near poolpres 7.16% on the same band if
  trajectories reproduce); raids with >=1 wave-3+ raider.
- SENSE: at least one raid transcript sample read and judged for
  sense, not just counts (does a raid read sensibly; do villagers read
  as people). One quoted line.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md §14):
  pre-registered metrics bind the run — a miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest per-seed
  recorder corpora (fourth sighting, carried) — the sweep-compare table
  + analyzer output are attached instead, and telemetry-check is NOT
  run on recorder rows (standing instruction: its counts are wrong on
  recorder rows).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) Classification 1,494/1,494 raid-time pool entities (100%,
  unknown 0) — bar >= 95% cleared by 5pp. The tagger missed nothing:
  every entity standing in any raid-time pool carried a birth tag.
- (b) Per-seed + pooled source shares reported below, with the
  above-cap portion attributed by source under both cap views.
- (c) Wave mix per source reported below — the filling sources DO
  favor wave-1/2, and the reason is structural, not a ratio: the only
  source that ever births wave-3+ in quantity is tile-entry, and its
  wave-3+ births arrive late and slow down over time.
- (d) Wave-5 pool presence: 0/1,494, by every source — not one
  wave-5 entity stood in any raid-time pool, and not one wave-5
  entity was even BORN on the band (births w5 = 0 across all sources).
  Wave-5 absence is a births problem before it is a pool problem.

## RECORDER NEUTRALITY — EXACT REPRODUCTION (gate, not a claim)

The armed band reproduces the poolpres control band EXACTLY on every
headline: raids 85, raiders 361, deaths 234, national-ever 7/8,
national-final 6/8, table invited 4/8, entered 4/8, wins 4/8 (all
lesser seat), median survival 135d, wave-3 8/8, wave-4 6/8, wave-5 0/8,
starvation 5, pool total 1,494, pool wave-3+ 107. Per-seed
trajectories match the control seed for seed (73671 survived 180d
16 raids/74 raiders; 73672 won lesser d97 7/28; 73673 won lesser d124
7/30; 73674 survived 180d 14/65; 73675 won lesser d135 13/56; 73676
village-lost d70 7/28 starv 4; 73677 village-lost d143 12/45; 73678
won lesser d116 9/35 starv 1). The detgate also passes (recorders
OFF: days/gameDays/ts identical, no recorder surface, no wraps
installed; post-setup world size 0 — no untagged pre-install stock).
The audit is therefore judged on a trajectory the recorder did not
move. Analyzer cross-check: spawnsrc raid pools and raftdraft raid
pools agree exactly (85 raids, 1,494 entities, wave counts
1,025/362/102/5 on both).

## THE CENSUS — WHERE THE POOL COMES FROM

Pooled raid-time pool, 85 raids, 1,494 entities (each raid drafts from
the pool as it stands that day, so per-raid pools are the denominator,
as in poolpres-a; one entity appears at several raids — 256 distinct
tagged entities account for all 1,494 appearances, ~5.8 appearances
each: the pool is a small long-lived stock, re-drafted, not a flow):

| source | pool n | pool share | birth n | birth share |
|---|---|---|---|---|
| tile-entry (checkEncounter, uncapped) | 933 | 62.4% | 236 | 73.1% |
| maintain (capped top-up) | 393 | 26.3% | 57 | 17.6% |
| scripted-hushwolf (day-16 pack) | 158 | 10.6% | 24 | 7.4% |
| wanderer-contact | 8 | 0.5% | 3 | 0.9% |
| scripted-titan | 2 | 0.1% | 2 | 0.6% |
| trap | 0 | 0% | 1 | 0.3% |
| fled-recovery | 0 | 0% | 0 | 0% |
| unknown | 0 | 0% | 0 | 0% |
| total | 1,494 | 100% | 323 | 100% |

Per-seed pool shares (pool n / tile-entry / maintain / hushwolf /
other): 73671: 342 / 217 / 80 / 45 / 0; 73672: 127 / 101 / 22 / 0 / 4
(2 wanderer + 2 titan); 73673: 104 / 63 / 26 / 14 / 1; 73674: 210 /
96 / 75 / 39 / 0; 73675: 146 / 87 / 45 / 14 / 0; 73676: 121 / 80 / 29 /
12 / 0; 73677: 282 / 185 / 69 / 23 / 5; 73678: 162 / 104 / 47 / 11 / 0.
Tile-entry is the largest source on every seed; maintain second on
every seed. No seed's story changes the ranking.

## THE ABOVE-CAP PORTION — the answer to the brief's blank

Pool size median 17, mean 17.6, min 4, max 31. Under the stated
convention (birth-sequence order; earliest `cap` living entities =
cap stock, rest = excess):

- Raid-time-cap view: cap stock 645 entities, excess 849. Excess by
  source: tile-entry 739 (87.0%), hushwolf 85 (10.0%), maintain 17
  (2.0%), wanderer 6 (0.7%), titan 2 (0.2%). Excess wave mix:
  wave-1 51.8%, wave-2 35.6%, wave-3+ 12.6% (107/849).
- Fixed-cap-8 view (the brief's framing): cap stock 665, excess 829.
  Excess by source: tile-entry 731 (88.2%), hushwolf 83 (10.0%),
  maintain 7 (0.8%), wanderer 6 (0.7%), titan 2 (0.2%). Excess wave
  mix: wave-1 50.7%, wave-2 36.4%, wave-3+ 12.9% (107/829).
- The cap stock itself is wave-3+ FREE under both views: 0/645 and
  0/665. Every single wave-3+ entity in the census (107/107) stands
  in the excess, never in the cap stock. The old core of the pool —
  the earliest-born entities that never die — is pure wave-1/2, and
  all escalation lives in the later-born excess.

## WAVE MIX PER SOURCE — do the filling sources favor wave-1/2?

| source | raid-time wave mix | wave-3+ share |
|---|---|---|
| tile-entry | w1 52.9%, w2 35.8%, w3 10.9%, w4 0.3% | 11.3% (105/933) |
| maintain | w1 92.9%, w2 7.1%, w3+ 0% | 0% (0/393) |
| scripted-hushwolf | w1 100% | 0% (0/158) |
| wanderer-contact | w1 100% | 0% (0/8) |
| scripted-titan | w4 100% | 100% (2/2) |

Yes — with one qualification that matters. Tile-entry is the ONLY
source that births wave-3+ at scale (45 of 323 births, 19.1% of its
births; every other source combined births 0 wave-3+ except the 2
titans). But tile-entry births SLOW DOWN over the run while their
wave-3+ share rises: births by day bucket <30: 82 (w3+ 0%), 30-59: 63
(3.2%), 60-89: 37 (37.8%), 90-119: 28 (42.9%), 120+: 26 (65.4%). The
escalating source is decelerating — late runs get the highest
wave-3+ birth share from the fewest births. And the maintain source
is wave-3-free for a structural reason, not a ratio reason (next
section).

## WHY MAINTAIN IS WAVE-3-FREE — the two compounding reasons

1. No maintain BIRTH after day 16 on this band (maintain fires only
   below cap, and a below-cap pool at any tile entry would birth
   unless no tile is free — zero births across ~100+ days of tile
   entries is the measured fact). All 57 maintain births fall on
   days 3-16 (days 3, 4, 8, 9, 10, 14, 15, 16 — the pool
   building to cap at run start, then never below cap again). Wave 3
   cannot unlock before day 25 (MONSTER-WAVES.md day floor), so no
   maintain birth COULD be wave-3+ even at the lever-b 100% weight:
   the tap closes nine days before wave 3 exists. This is the
   mechanism behind lever-b's byte-identity, measured at birth level
   rather than inferred from the ceiling test.
2. The 393 maintain entities at raid time are those same 57 early
   births re-appearing (~6.9 appearances each). Maintain's 26.3% pool
   share is longevity, not flow: early wave-1 stock that survives the
   whole run and stands at every palisade. A maintain lever aimed at
   wave-3+ would need maintain to fire late, which needs the pool to
   fall below cap late, which never happens while tile-entry keeps
   the pool at 17.

## THE OTHER SOURCES, EACH IN ONE LINE

- Hushwolf: all 24 births on day 16 (the scripted evQuietWoods pack,
  3 per seed × 8 seeds), all wave-1, lingering to 158 raid-time
  appearances — a one-day injection of permanent wave-1 stock that
  dilutes every later pool share by ~10%.
- Wanderer-contact: 3 births, 8 appearances — the cast wanderer
  almost never materializes as a world entity on this band (its
  contact is usually a fight, not a pool addition).
- Scripted-titan: 2 births, 2 appearances, both wave-4 — the only
  non-tile-entry wave-3+ entities in the census, and a rounding error
  in the pool.
- Trap: 1 birth, 0 raid-time appearances. Fled-recovery: 0 births —
  no fled monster was ever re-spawned on the arrival tile on this
  band, so re-entries contribute nothing to the pool.

## POOL COMPOSITION OVER TIME (by source)

| raid-day bucket | raids | pool n | maintain | tile-entry | hushwolf | other | w3+ |
|---|---|---|---|---|---|---|---|
| <60 | 32 | 444 | 157 | 233 | 52 | 2 | 2 |
| 60-89 | 20 | 374 | 91 | 247 | 34 | 2 | 12 |
| 90-119 | 17 | 314 | 74 | 206 | 31 | 3 | 32 |
| 120+ | 16 | 362 | 71 | 247 | 41 | 3 | 61 |

The maintain share of the pool FALLS over time (35% → 20%) while
tile-entry holds ~55-68% throughout — the pool's escalation is
entirely tile-entry's late wave-3+ births plus the survival of
everything born early.

## WALL NUMBERS (this run's band, armed rows = poolpres control)

- national-ever 7/8, national-final 6/8, table invited 4/8, entered
  4/8, wins 4/8 — all lesser seat. Full seat 0/8.
- wave reach: wave-3 8/8, wave-4 6/8, wave-5 0/8. Median survival
  135d; max 180d. Deaths 234 total, starvation 5.
- The scale wall above national/table is untouched by a diag, as it
  should be: this run changed no game code.

## SENSE-TESTING READ (transcript, not just counts)

Sense replay: seed 73671, 60d horizon (the 180d replay's 240-line ring
covers only the last days — the lever-b method note, reused). File:
evidence/2026-10-25/sim-spawnsrc-a-sense.txt. The day-60 raid line is
the same line lever-b quoted — a wave-2 apex gets no special billing,
and nothing in it marks wave or escalation:

> [d60] 🐗 RAID — 5 raiders (Ugly-Eyes, The Moderator, Loud-Eyes,
> Inspiration, Flashbulb Moth) hit Haven in the night, drawn by the
> smell of the pantry! The palisade's stakes take their toll as they
> come over the wall.

Villagers read as people in the same transcript — Landon hauling
water and wood and cooking for the haven, Daniela standing down the
Moderator and walking home bloodied ("⚔️ Daniela stood down the
Moderator and kept walking — 6 rounds, bloodied but breathing. It's
still out there, somewhere."), fire-side gossip fragments ("You catch
fragments by the fire — Grace telling Theo about Daniela. Half of
it's true anymore."). One carried wrinkle, stated not hidden: the
player-wait line repeats verbatim ("You wait. The light changes.
Nothing asks anything of you.") — the bot waiting, also seen by any
human waiter; carried from lever-b, not chased here. The sense
judgment stands: the pool audit's numbers are about real villages,
and the palisade-escalation narration blank (blank #4, carried)
remains open.

## VILLAGE ASSESSMENT (plain words)

The villages are the poolpres villages again — literally, trajectory
for trajectory — so this run's news is entirely about what stands in
their woods. The woods at raid time are not a crowd that gathers for
the raid: they are a small tribe of about forty monsters per village
that mostly never dies, plus a slow trickle of newcomers. The first
sixteen days fill the woods with small animals through the
maintenance tap, and then that tap shuts forever — the pool never
drops back below the cap, so nothing ever tops it up again. From
then on the only thing adding monsters is you walking into new
ground: every step into a fresh tile has a small chance to put a
monster on it, with no cap at all, and those are the monsters that
pile the pool up to seventeen. That is why the pool is seventeen
while the cap is eight, and why turning the maintenance tap all the
way up changed nothing — you cannot top up a cup that is already
overflowing, and the overflow is what you meet at the wall. The
overflow is also where all the big monsters live: every wave-3
monster in the census arrived by walking into new ground, never
through maintenance, and the old wave-1 animals from the first two
weeks never leave — they stand at every palisade for the whole run,
diluting every later pool. The hushwolf pack from day sixteen is the
same story: three small wolves per village, still standing at the
wall on day 180. Nothing wave-5 was ever even born.

## THE LEVER (named with numbers — a candidate for the NEXT run, not implemented here)

The binding constraint is now precise: tile-entry is the only
escalating source, it is UNCAPPED, and it decelerates (82 births
before day 30 → 26 after day 120) while the wave-1/2 old core never
dies. Any next arm must move a measured tile-entry quantity, not a
maintain weight (killed) and not a draft rule (raftdraft-a killed).
Candidate, with a pre-registration sketch for the NEXT run (not
tested here):
- Lever: tile-entry spawn chance and/or its wave targeting once wave
  3 is unlocked — the candidate mechanism is the checkEncounter
  tile-entry roll (chance ~5-15% by tile type, pity-amplified) and/or
  its spawnWaveTarget call, which already yields 65.4% wave-3+
  births after day 120 but on only 26 births. The arm pre-registers
  its exact change; it does not invent it here.
- Substrate: tableseat-nowait, seeds 73671-73678, 180d death-aware,
  spawnsrc-diag recorder (this run's instrument, reused verbatim).
- PRIMARY METRIC: band pool wave-3+ share (same pooled per-raid
  denominator as poolpres-a) AND tile-entry wave-3+ births per run.
- GO BAR (carried from poolpres-a, unchanged): pool wave-3+ share
  >= 23% AND wave-3+ per raid >= 0.9, on the pilot band of 8 seeds.
- GUARD (carried): wins >= 3/8, national-ever >= 6/8, death total
  within ±20% of 234.
- Companion blanks (separate, not bundled): wave-5 births are zero
  across all sources — a standing/readiness-gates question, not a
  spawn-weight question; the palisade-escalation narration beat;
  why tile-entry births decelerate late (player-tile occupancy vs
  travel volume — the recorder's spawn log plus a travel census
  would separate them, and that census is a diag, not a lever).

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. DIAG-GO is judged exactly as
  pre-registered: classification >= 95% (achieved 100%), per-seed +
  pooled source shares, above-cap attribution, wave mix per source,
  wave-5 presence — all reported above.
- Above-cap convention (stated before the sweep, applied as stated):
  birth-sequence order, earliest `cap` living entities = cap stock.
  Both cap views (raid-time cap and fixed cap 8) agree on every
  qualitative finding: tile-entry dominates the excess (~87-88%),
  maintain is ~1-2% of it, and the cap stock is wave-3-free. The
  convention is an accounting view, not an engine label, and no
  finding depends on which cap view is used.
- Pool-share pooling choice (carried): per-raid pool counts are
  summed across raids, so long-lived entities contribute repeatedly.
  Right for "what does a raid draft from"; the birth census (323
  fresh spawns) is reported alongside it so the stock-vs-flow
  distinction is never hidden. Birth shares and pool shares answer
  different questions and are never merged.
- Sense divergence (stated, not hidden): the narration replay
  trajectory differs from the census trajectory (its raids: 6, first
  day 8; the census seed-73671 raids: 16), so the day-60 raid line is
  from the replay's own run, not from any census raid. The judgment
  (no escalation beat exists in the raid line format) is about the
  transcript surface, which the replay does show.
- Analyzer correction during this run (stated, not hidden): the
  first analyzer pass reported pool min 0 because of a
  `concat([0])` in the min computation; the corpus was unaffected
  (pool sizes are 4-31, median 17). Fixed in the analyzer and
  re-run; the corrected summary is the committed one.
- None of these change the verdict. DIAG-GO stands.

## CONVERGENCE + NEXT BLANKS

scale-onramp stays converging (NOT converged): this run is a diag,
not a lever — it answers blank #1 (spawn-source audit) on current
master but tests no lever, the full seat is still unreached, wave 5
is still 0/8, and wins are still lesser-seat only. The standing
directive stands until the tracker records this axis converged on
measured evidence.

Next blanks, in order:
1. Tile-entry lever for wave-3+ at raid time (sketch above; GO bar
   pool share >= 23% + w3+/raid >= 0.9). PROMOTED: tile-entry is the
   only escalating source, and it is uncapped.
2. Wave-5 births are zero across all sources (0 births, 0 pool) —
   separate standing/readiness question, not a spawn-weight question.
   (Carried, sharpened: from "pool presence zero" to "births zero".)
3. Palisade-escalation narration beat for wave-3+ raids — confirmed
   a third time by the day-60 raid line. (Carried.)
4. Why tile-entry births decelerate late (82 → 26 across day
   buckets) — player-tile occupancy vs travel volume; needs a travel
   census diag, not a lever guess. (NEW.)
5. Defender-fight wound manufacture (carried).
6. Field-kill narration/gossip beat (carried).
7. Wait-narration repetition (carried minor observation).

## INFRASTRUCTURE + CORPUS

- No EPERM flap blocked this run; all 8 rows wrote first try.
- No sibling tree, branch, claim file, tracker, or lock touched.
  Telemetry-check NOT run, per the standing instruction (recorder
  rows are not panels). Balanced panel NOT run: balance-panel.js
  cannot ingest per-seed recorder corpora (fifth sighting, carried)
  — the sweep-compare table + analyzer output are attached instead.
- Corpus (committed with this run): per-seed armed rows +
  summary.json + spawnsrc-summary.json in
  evidence/2026-10-25/perseed-sim-spawnsrc-a/ (8 rows); sense
  transcript evidence/2026-10-25/sim-spawnsrc-a-sense.txt; this file.
  Recorder: scripts/policies/spawnsrc-diag.js. Sweep:
  scripts/test-spawnsrc-diag-sweep.js (--one armed, --summary,
  --detgate). Analyzer: scripts/test-spawnsrc-diag.js (--summary).
  Classifier unit proof: scripts/test-spawnsrc-classify.js (13/13).
- Game code: ZERO src/js changes from this run (DIAG ONLY).
  Recorder neutrality proven by exact band reproduction above, plus
  detgate PASS, plus classifier unit proof — no check.js suite is
  attributable to this run, and no claim about check.js is made here
  beyond the proofs listed.
