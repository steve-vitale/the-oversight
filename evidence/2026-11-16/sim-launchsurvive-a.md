# sim-launchsurvive-a — launch survival + re-encounter (DIAG, no game change)

Run: fleshout-20261116T1631Z, Loop A. Worktree branch `sim-launchsurvive-a`.
Prereg: `evidence/2026-11-16/sim-launchsurvive-a-prereg.md` (frozen, committed first).
Analyzer: `scripts/analyze-launchsurvive-a.js` → `evidence/2026-11-16/launchsurvive-a-analysis.json`.
Proof: `scripts/test-launchsurvive-a.js`.

## Verdict: GO (all five frozen bars pass)

| Bar | Result |
|---|---|
| (1) Instrument valid: 8/8 corpora parse per leg, 0 instrument errors, attribution coverage ≥ 0.90 | **PASS** — 8/8 + 8/8 parse, 0 errors either leg, coverage 1.00 both legs, 0 tracker gaps either leg (every launch window fully observed) |
| (2) ≥ 3 launches on the on-leg | **PASS** — 7 launches on-leg (control: 1) |
| (3) Every launch in exactly one of the six classes, persistence measured per launch | **PASS** — 7/7 classified, 0 unclassified, persistence yes/no for all 7 |
| (4) Proof green on the instrument tip AND post-revert | **PASS (tip)** — 52/52, 0 skipped, §7 real-corpora checks live and green. Post-revert re-run: see §Proof |
| (5) D1/D2 determinism + D3 drift smoke clean | **PASS** — D1/D2 green in proof; D3: every divergence day falls after the first world-tick seed day on that seed (102403/102404 never diverge — no world-tick seed fired on either leg) |

This DIAG ships no game change. The seed call is instrument only and is reverted at the end;
`src/` diff vs base is 0 after the revert (verified in the revert commit).

## The question, answered in plain words

Seedland showed the seed call works — it wakes the plan system up (plans 0 → 17, launches 0 → 3)
— but every launched hunt ended with the hunter dead and the hunted beast never met. This arm
watched 7 hunts day by day to find out why. The answer is not what the seedland numbers suggested:

**The hunters DO go. They travel to the place the beast was last seen and stand on it for days
(64 days standing on the remembered tile, on expedition, across the 7 launches). The beast is
usually still around — it was within 2 tiles of that place on 13 days when the hunter was out.
But the two almost never meet: 0 meetings in 7 launches, 0 meetings on the 13 days the hunter
was out and the beast was nearby, and 0 meetings on the 2 days hunter and beast stood on the
exact same tile. And before the meeting can happen, the hunter usually dies — 6 of the 7
launches end with the hunter dead, killed by other beasts, the wild, or a wound, not by the
beast they were hunting.**

So the chain breaks at the re-encounter itself, in two layers:

1. **The remembered place goes stale.** The beast wanders. It was on the exact tile the hunter
   stood on for only 2 of the 64 hunter-on-tile days; the rest of the time it sat 1–2 tiles away.
   The hunter's map of where the beast is comes from one old sighting and is never refreshed
   unless a fight happens — so the party keeps returning to a tile the beast has already left,
   with no way to learn where it went.
2. **Even standing on the same tile does not start a fight.** On the 2 days hunter and beast
   shared a tile (Hassan, day 37; Naran, day 115), no encounter fired. At the daily granularity
   this instrument sees, that is suggestive rather than proof — the fight roll may happen at a
   different time of day than the end-of-day snapshot — but it is the sharpest number in the
   run: the encounter mechanic itself does not reliably fire when hunter and hunted are together.

## Primary metric

Share of launches with ≥ 1 in-window launched-party meeting (seedland: 0/3).

- **Control: 0/1. On-leg: 0/7.** The meeting rate is zero on both legs. The seed call multiplies
  launches (1 → 7) and multiplies nothing else: it sends more hunters out, and none of them
  meet their beast.

## Per-launch classification table (on-leg)

Classes: traveled-and-found / traveled-not-found / stayed-home-died / died-en-route /
died-at-home-other / still-open. Persistence = target type within 2 tiles (Chebyshev) of the
last-known tile on ≥ 1 window day. "Out+near" = days the holder was on expedition AND the
target was within 2 tiles that day. "On tile" = days the holder stood on the remembered tile
while on expedition. "Same tile" = days holder and a target-type beast shared the exact tile.

| Seed | Hunter → target (companion) | Window | Class | Meetings | Persistence | Out+near | On tile | Same tile | Death |
|---|---|---|---|---|---|---|---|---|---|
| 102401 | Yuki Mori → Eulogy (Jorge Silva) | d58–80 | died-at-home-other | 0 | yes (7d, closest 1) | 0d | 11d | 0d | d80, the arena, at Haven |
| 102401 | Hassan Ali → Eulogy (gen_jdbve8y) | d37–38 | died-at-home-other | 0 | yes (2d, closest 0) | 1d | 1d | 1d (d37) | d38, Gavel, at Haven |
| 102402 | Zoe Adams → Suburb (Diana Osei) | d37–75 | died-at-home-other | 0 | **no** (0d) | 0d | 13d | 0d | d75, the wild, at Haven |
| 102402 | Tom Baker → Eulogy (Mia Andersson) | d81–98 | died-en-route | 0 | yes (5d, closest 2) | 3d | 14d | 0d | d98, the wild, away |
| 102402 | Naran Tumen → Herald (visjoin_98) | d114–134 | died-at-home-other | 0 | yes (2d, closest 0) | 2d | 6d | 1d (d115) | d134*, the wild, at Haven |
| 102406 | Amina Diallo → Eater (visjoin_118) | d121–135 | died-en-route | 0 | yes (8d, closest 0) | 6d | 12d | 0d | d135*, a wound that wouldn't close, away |
| 102408 | visjoin_114 → Reunion (visjoin_111) | d125–open | still-open | 0 | yes (1d, closest 2) | 1d | 7d | 0d | — (alive at d138 village loss) |

\* Death-log day is one day earlier (Naran d133, Amina d134); the first holder-dead census day lags
by one. Classes are stable under the ±1 shift — see §Metric review.

Totals: traveled-and-found 0, traveled-not-found 0, stayed-home-died 0, died-en-route 2,
died-at-home-other 4, still-open 1. Persistence yes 6/7. Out+near days 13 in total, same-tile
days 2 in total, meetings 0 on all of them.

**Control leg launch (for comparison):** 102402 Zoe Adams → Suburb (Diana Osei), d37–102,
died-at-home-other, 0 meetings, persistence no. The same holder, same target, same shape as the
on-leg Zoe launch — the launch is a property of the seed and the policy, not of the seed call
alone; the base (gate fix + PROFILEGATE bypass) already lets one launch through, and the seed
call multiplies it 1 → 7. The two legs agree on the launch shape but diverge on her death day
(d102 control vs d75 on) — the seed call's extra RNG draws shift the trajectory.

## The seven launches, told in full

**Hassan Ali → Eulogy, seed 102401, d37–38 (died-at-home-other).** The shortest hunt in the
run. Hassan launched on day 37, stood on the remembered tile (4,3 — one tile from Haven) that
same day, and a Eulogy was on that exact tile with him (the only same-tile day where the
companion also fought: Jorge evaded a Reunion). No meeting with the Eulogy fired. Hassan died
the next day, day 38, to a Gavel — a different beast — at Haven. Two days, one tile shared with
the target, killed by something else.

**Yuki Mori → Eulogy, seed 102401, d58–80 (died-at-home-other).** The longest hunt that ended
in death. Yuki spent 11 expedition days and stood on the remembered tile (4,3) on 11 of them;
a Eulogy was within 2 tiles on 7 days, closest 1 tile away — but never on a day Yuki was out
(out+near 0). She fought a Congregation out there and evaded it. She died day 80 in the arena,
at Haven. The timing never lined up: the beast was near the tile only while she was home.

**Zoe Adams → Suburb, seed 102402, d37–75 (died-at-home-other).** The hunt with no map. Zoe's
plan was seeded with no sighting at all — her last-known tile is the plan node (6,4), just
where she stood when seeded, not a place a Suburb was ever seen. A Suburb was never within 2
tiles of it in 39 days (persistence no, on both legs). She still went: 19 expedition days, 13
days standing on that tile, and she fought seven different beasts out there — Reunion, Eater,
Algorithm, Influencer, Congregation, Eulogy, Strike — evading or fleeing all of them. Day 53
her companion Diana Osei was killed by a Strike while out with her; the launch carried on
companion-less to Zoe's death day 75, "the wild", at Haven. Two failures in one launch: a hunt
planted with no location knowledge, and a launch that does not close when the companion dies.

**Tom Baker → Eulogy, seed 102402, d81–98 (died-en-route).** Tom spent 15 of his 18 window days
on expedition and stood on the remembered tile (4,5) on 14 of them. A Eulogy was within 2 tiles
on 5 days, 3 of them while he was out (out+near 3), closest 2 tiles — never on his tile. He
fought an Eater and evaded it. He died day 98, "the wild", away from Haven, on expedition.

**Naran Tumen → Herald, seed 102402, d114–134 (died-at-home-other).** Naran stood on the tile
(5,4) on 6 expedition days; a Herald was on the exact tile with him on day 115 — and no
encounter fired that day (no encounters at all were recorded for anyone that day). The Herald
was within 2 tiles on 2 days, both while he was out. He died day 134 (death-log day 133),
"the wild", at Haven.

**Amina Diallo → Eater, seed 102406, d121–135 (died-en-route).** The most chances of any launch:
8 days with an Eater within 2 tiles, 6 of them while she was out (out+near 6 — nearly half the
run's total), 12 days standing on the tile (3,5), closest distance 0 — an Eater sat on the tile
on some day, just not on a day she was there. She fought a Strike and an Influencer out there
instead. She died day 135 (death-log day 134) of a wound that wouldn't close, away, on
expedition. Six out-and-near days, zero meetings.

**visjoin_114 → Reunion, seed 102408, d125–open (still-open).** The only launch still alive at
the end of its run. 7 expedition days, 7 days on the tile (5,5), a Reunion within 2 tiles on 1
day while out. No meetings. The village was lost day 138, closing the window with the hunt
unresolved.

## Secondary: do plan instances close when the holder dies?

**No — never, on either leg. Every holder-died instance lingers to the end of the run.**

- On-leg: 13 holder-died instances, 13 linger (100%), post-death tails 15–112 days, median 40.
- Control: 2 holder-died instances, 2 linger (100%), tails 30 and 79 days, median 54.5.
- Combined: 15/15 linger. The dead holders' rows keep appearing in the dawn census (holderAlive
  false, node snapped to Haven, expedition flag still true) until the village ends.

This confirms the haventick finding with the instrument: the plan table holds dead people's
hunts for the rest of the game. The instance frame closes (closeDay = the holder's death day by
construction), but the plan entry itself is never deleted. A dead hunter's plan should close.

## Per-seed table

### Control (base as-is; anchor 728b65208; 0 errors)

| Seed | Days | End | Max wave | Standing | Scale | Instances | Launches | Deaths |
|---|---|---|---|---|---|---|---|---|
| 102401 | 128 | village-lost | 4 | 199 | regional | 0 | 0 | 89 |
| 102402 | 132 | village-lost | 4 | 199 | regional | 2 | 1 | 86 |
| 102403 | 91 | village-lost | 4 | 135 | regional | 0 | 0 | 41 |
| 102404 | 151 | survived | 4 | 199 | regional | 0 | 0 | 69 |
| 102405 | 141 | village-lost | 4 | 199 | regional | 0 | 0 | 61 |
| 102406 | 151 | survived | 5 | 475 | regional | 0 | 0 | 70 |
| 102407 | 152 | survived | 4 | 199 | regional | 0 | 0 | 79 |
| 102408 | 150 | survived | 5 | 325 | regional | 0 | 0 | 124 |

### On-leg (base + verbatim seed call; anchor f5fafff82; 0 errors)

| Seed | Days | End | Max wave | Standing | Scale | Instances | Launches | Deaths |
|---|---|---|---|---|---|---|---|---|
| 102401 | 151 | survived | 5 | 380 | regional | 7 | 2 | 113 |
| 102402 | 149 | village-lost | 4 | 199 | regional | 5 | 3 | 101 |
| 102403 | 91 | village-lost | 4 | 135 | regional | 0 | 0 | 41 |
| 102404 | 151 | survived | 4 | 199 | regional | 0 | 0 | 69 |
| 102405 | 151 | survived | 4 | 199 | regional | 1 | 0 | 116 |
| 102406 | 151 | survived | 4 | 199 | regional | 1 | 1 | 76 |
| 102407 | 152 | survived | 4 | 199 | regional | 2 | 0 | 80 |
| 102408 | 138 | village-lost | 4 | 199 | regional | 4 | 1 | 114 |

Notes: seed 102403 is identical on both legs (village lost day 91, no seed rows either leg — the
seed call never fired before the village died). Seed 102404 is identical too (0 seed rows, no
plans, survived 150 days). The seed call's effect concentrates where it fires: 102401 (7
instances, 2 launches), 102402 (5, 3), 102408 (4, 1). The tracker recorded 1,054 launch rows
on-leg vs 182 on control.

## Guard metric (reported, not judged)

| | Control | On-leg |
|---|---|---|
| Expedition deaths | 168 | 229 (+61, +36%) |
| Total village deaths | 619 (77.4/run) | 710 (88.8/run, +15%) |
| Starvation deaths | 8 | 5 |
| Median survival | 145.5 days | 151 days |

Consistent with seedland's cost signal: the seed call sends more villagers out, and more of them
die out there — expedition deaths up by about a third, total deaths up about a seventh — while
median survival is flat-to-better (145.5 → 151). The cost is real but it does not collapse the
villages; the hunts it buys simply never meet their beast.

## Wall numbers

| | Control | On-leg |
|---|---|---|
| National by standing | 2/8 | 1/8 |
| National by rank | 0/8 | 0/8 |
| Table (seat offered) | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 2/8 | 1/8 |
| Median survival | 145.5d | 151d |

This band is harsher than seedland's (control national-by-standing 2/8, wave-5 2/8). No village
reached the table on either leg. The seed call moves nothing on the wall — it multiplies hunts,
not wins.

## Reachability

Wave 4 is reached by every village on both legs (8/8). Wave 5: 2/8 control, 1/8 on-leg, and
on the one on-leg wave-5 village (102401) the wave was faced, not killed. The hunts this arm
measures are wave-4 hunts; the wall past wave 4 stays shut.

## Village assessment (plain words)

The village is sending hunters after the big beasts now — seven hunts in eight villages, where
the base sent one. The hunters know where the beast was seen and they go there, and they keep
going there for days. What they don't have is a way to find the beast again once it has moved:
the beast wanders, the hunter's map doesn't update, and the two of them walk past each other a
tile or two apart. The hunters also die young — not to the beast they're chasing, but to
everything else out in the wild while they spend weeks on a hunt that never lands. And the
village never learns: a dead hunter's hunt stays on the books until the village itself dies, as
if the hunter were still out there. The village that hunts is braver than the village that
doesn't, but it is not yet smarter — it pays the price of the hunt and gets none of the kill.

## Sense test (vetSays)

Sampled lines around the launches read as a coherent broadcast, not a template loop. The
clearest beat: on seed 102402, day 35, the System announces the Mirror Draft — "We've been
watching you for a LONG time... Say hello to the MIRROR DRAFT" — two days before Zoe launches
her Suburb hunt on day 37, and the village then broadcasts veteran kills (Scarred Chorus Line
day 38, Elder The Loud Beast day 45) while she is out hunting. The fiction and the launch
coincide; nothing in the sampled lines contradicts the measured story.

## Metric review

- **Sighting vs planNode source.** 6/7 on-leg launches carry a real sighting tile; Zoe's (both
  legs) carries the plan node — her plan was seeded with no sighting, so her "remembered tile"
  is just where she stood when seeded. Her persistence reads "no" on both legs, against a tile
  no Suburb ever visited. The persistence metric is only as good as the location knowledge:
  a plan seeded without a sighting should be flagged, not measured against a meaningless tile.
  Sensitivity: excluding Zoe, persistence is 6/6.
- **R = 2 radius sensitivity.** Closest approach per launch (min targetNearDist): Yuki 1,
  Hassan 0, Zoe —, Tom 2, Naran 0, Amina 0, visjoin_114 2. At R = 0 (same tile only),
  persistence yes falls to 3/7 (Hassan, Naran, Amina); at R = 1, 4/7; at R = 2 (frozen),
  6/7. The headline "the beast is usually still around" holds at every radius — at R = 0 it is
  3/7, not 0/7 — and the finding does not turn on the radius. What does turn on it is the
  mechanism: at R = 0 the beast is almost never on the tile, which is the stale-tile story.
- **Death-day lag.** On 2 of the 6 death launches (Naran, Amina) the first holder-dead census
  day lags the death-log day by one (d134 vs d133; d135 vs d134). No launch's class changes
  under the ±1 shift: Amina is on expedition and away on both adjacent days (died-en-route
  either way); Naran is at Haven and not on expedition on both (died-at-home-other either
  way). The death-day row fallback (last alive day) was never needed — deathRowMissing false
  on all 7 launches.
- **Plan-linger frame.** closeDay is the first holder-dead census day by construction, so the
  measure is the post-death tail, not the close: tails 15–112 days on-leg, median 40. The
  linger is visible in the tracker too — dead holders' rows keep coming (node snapped to
  Haven, expedition flag still true).
- **Companion death does not close the launch.** Diana Osei died day 53 to a Strike mid-launch;
  Zoe's launch ran on to day 75. The instance frame closes only on holder death or retarget,
  never on companion death. A launch that has lost its companion is a different hunt from the
  one that launched.

## Proof

`scripts/test-launchsurvive-a.js`:

- Off-tip (seed call absent, `LAUNCHSURVIVE_SEED_CALL=off`): **48 passed, 0 failed, 1 skipped**
  (the §7 real-corpora section skipped — no pilot corpora existed yet). ~8.8 min.
- On-tip (seed call present, corpora present): **52 passed, 0 failed, 0 skipped** (~3.2 min).
  §7 now runs live against the pilot corpora: on-leg analyzer runs, every launch classified
  into exactly one of the six classes, persistence measured for every launch, zero tracker gaps
  on either leg, meetings share a real measured number (0/7, not a fixture). D1 60-day run:
  7 encounters by origin {world-tick: 2, expedition: 5}, 15 seed rows, 52 tracker rows
  (vs 0 tracker rows off-tip — the seed call wakes the plan system; the tracker records real
  plan-holder days).
- Post-revert: see the revert commit (proof re-run, `LAUNCHSURVIVE_SEED_CALL=off`).

D1/D2 determinism green in the proof; D3 smoke clean (analyzer): divergence days 38, 68, 33,
55, 129, 49 — each after that seed's first world-tick seed day (35, 36, 31, 51, 128, 26);
102403/102404 never diverge (no world-tick seed fired on either leg).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-launchsurvive-a-control/*.json' --metrics national,table,wins,exiled`

**Refused, as expected:** "refusing recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here." Recorded as a refusal. No
`--allow-recorder-corpus` workaround used; the baseline was not rolled.

## Method notes (for the next arm)

- Driver: `scripts/seedpaths-driver-20261116.js` behind `LAUNCHSURVIVE=1` (implies SEEDLAND
  semantics internally). Per-day tracker rows (`v4launchTrack`) in the daily snapshot block:
  holder node / at-Haven / on-expedition / alive / health, companion node, target type +
  last-known tile + source, targetNearDist (min Chebyshev distance of any live target-type
  beast to the tile), targetNearCount (within R = 2), targetAliveCount.
- Analyzer bar 1 counts a launched instance with zero tracker rows in its window as an
  instrument error; zero such gaps on either leg.
- The next diagnostic needs finer than daily granularity: per-tick co-location of holder and
  target, or a read of the encounter-roll mechanics (`expeditionMonster` / world-tick contact),
  to settle whether the same-tile non-meetings are a roll-timing artifact or a broken roll.
  It also needs a re-acquisition mechanism to test: fresh sightings refreshing the
  remembered tile, or a search radius around it.

## Findings for the backlog

1. **Stale remembered tile (mechanism).** The party navigates to the remembered tile and
   stands on it for days, but the beast wanders 1–2 tiles away and the sighting is never
   refreshed. Next: a re-acquisition lever — fresh sightings from the holder, the companion,
   or other villagers refreshing the remembered tile, or a search radius around it.
2. **Same-tile non-meeting (mechanism, needs finer instrument).** 2 same-tile days, 0
   meetings. Next: per-tick co-location or a read of the encounter roll.
3. **Holders die to other things before the meeting (cost).** 6/7 launches end holder-died;
   deaths are by other beasts (Gavel, Strike via the companion), the wild, a wound, the arena
   — not the target. The hunt is a slow exposure: 15–39-day windows out in the wild.
4. **Dead holders' plans never close (defect, confirmed 15/15).** Every holder-died instance
   lingers in the census to the end of the run (tails 15–112 days, median 40). Close the plan
   when the holder dies.
5. **Plans can be seeded with no sighting (defect).** Zoe's Suburb plan carried a plan-node
   "remembered tile" with no sighting behind it; persistence measured against it is
   meaningless. Flag or block sighting-less seeds.
6. **Companion death does not close the launch (defect).** Diana died day 53 mid-launch; the
   launch ran on companion-less to day 75. Close or re-companion on companion death.

## Files

- Prereg: `evidence/2026-11-16/sim-launchsurvive-a-prereg.md`
- Evidence (this file): `evidence/2026-11-16/sim-launchsurvive-a.md`
- Analysis: `evidence/2026-11-16/launchsurvive-a-analysis.json`
- Control corpora: `evidence/2026-11-16/perseed-launchsurvive-a-control/` (8 files, anchor 728b65208)
- On-leg corpora: `evidence/2026-11-16/perseed-launchsurvive-a-on/` (8 files, anchor f5fafff82)
- Instrument: `scripts/seedpaths-driver-20261116.js` (LAUNCHSURVIVE=1), `scripts/analyze-launchsurvive-a.js`, `scripts/test-launchsurvive-a.js`
- Seed call (reverted): verbatim 13-line VETPARTY block, blob a66d45a5e, in
  `resolveWildMonsterEncounter` before `if (rec.outcome === 'alreadyDead') {`.

## Convergence state

- This arm answers tracker blank #1 (launch survival + re-encounter) for the winnability chain.
  The binding link is now the re-encounter itself: navigation works, persistence is real, the
  meeting does not fire, and the hunter dies first.
- Seedland (1515Z) + this arm agree: 0 meetings in 3 launches there, 0 in 7 here — 0/10
  launched-party meetings across both bands, with the mechanism now decomposed.
- No game change ships from this arm. Ready to land, pending coordinator merge.
