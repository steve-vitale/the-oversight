# sim-overtime-pacing-l887 — L887 overtime-pacing sweep (pilot + confirm)

**Type:** lever arm, instrument + measurement record only — NO game-data change
lands from this run (kill protocol, see Verdict).
**Anchor:** `1b912cd9ca8a` (master at run start; worktree branch `sim-l887-sweep`).
**Pre-registration (BINDING, MEASUREMENT.md §14):**
`evidence/2026-10-24/l887-overtime-pacing-prereg.md` (commit `3f95ccd7d`).
**Runner:** `scripts/sweep-overtime-pacing-l887.js` (wallseg-sweep substrate +
postunlock-instrument + daily door poll; one process per arm so the post-load
override can never leak into control).
**Analyzer:** `scripts/analyze-overtime-pacing-l887.js` (judges ONLY the header).
**IV proof:** `node scripts/test-overtime-pacing-l887.js` — 12/12 green on this
tree before the sweep.

## Pre-registered header (as written, not re-scored)

- **Substrate:** pinned wallseg substrate — FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1
  VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2. Runner shape wallseg-style with
  postunlock-instrument (postunlockDeaths / postunlockFights / waveKillLog /
  unlock), 180 days, policies lead + belong.
- **Lever (single, data-only, post-load override — no repo data change):**
  armed configs override `Game.data.titans._overtime.daysPerTier` 7 → 14
  after load. Control is the identical substrate with no override. `maxTier`
  stays 6 in both arms.
- **Door definition:** wave-5 unlock day (first day `unlockedWave() >= 5`,
  daily poll with postunlock endDay-poll fallback) — the postunlock2
  definition.
- **PRIMARY (binding):** post-door survival days (door-open day →
  village-lost day, or 180d cap): armed median ≥ control median + 20d AND
  seats-taken (armed) ≥ seats-taken (control).
- **Guardrails (all binding):** wins (armed) ≥ wins (control); national rate
  not lower; table reach not lower.
- **Secondaries (reported, not judged):** tier at death / tier at seat;
  Eulogy-cascade deaths (cause-attributed); veteran counts at door.
- **Pilot population:** seeds 70201, 70202, 70204, 70209 × lead/belong (8
  configs). **Confirm population:** full wallseg band 70201–70212 ×
  lead/belong (24 configs), same bars.
- **Kill rule:** pilot NO-GO → arm deleted per kill protocol. A GO pilot does
  NOT land a data change: a titans.json `daysPerTier` change lands only
  through the coordinator after the confirm run.

## Pilot stage: GO (thin — n=2 distinct door seeds)

Control post-door survivals (door configs): [7, 7, 5, 5], median 6.
Armed: [7, 7, 62, 62], median 34.5. Bar: 34.5 ≥ 6 + 20 = 26 — MET.
Seats 0 ≥ 0 — MET. Guardrails all MET (wins 0 ≥ 0, national 6/8 = 6/8,
table 4/8 = 4/8). The pilot GO authorized the confirm. Note the pilot's
thinness, recorded here and not hidden: lead/belong pairs are byte-identical
(LINKFORM=2 inert dim, as wallseg documented), so the pilot's door
population is effectively 2 distinct seeds (70204: 7d, 70209: 5d control).

## Confirm stage (full band, 24 configs/arm): NO-GO — misses by 2 days

| | control | armed |
|---|---|---|
| configs | 24 | 24 |
| doors (configs / distinct seeds) | 12 / 6 (70203, 70204, 70207, 70208, 70209, 70212) | 12 / 6 (70204, 70206, 70208, 70209, 70211, 70212) |
| post-door survivals | [21, 21, 7, 7, 11, 11, 79, 79, 5, 5, 16, 16] | [7, 7, 23, 23, 79, 79, 62, 62, 40, 40, 3, 3] |
| median post-door survival | 13.5 | 31.5 |
| bar: armed median ≥ control median + 20 | — | 31.5 ≥ 33.5? **FALSE (miss by 2d)** |
| seats-taken | 0 | 0 (≥ — MET) |
| wins | 0 | 0 (≥ — MET) |
| national | 22/24 | 22/24 (not lower — MET) |
| table reach | 18/24 | 18/24 (not lower — MET) |

**VERDICT: CONFIRM NO-GO.** The primary is missed by 2 days; under §14 a
miss is NO-GO, never re-scored. The guardrails all pass, but guardrails do
not rescue a missed primary. The arm is KILLED per kill protocol: nothing
lands in titans.json or src/js. The sweep script, analyzer, evidence, and
per-config corpora are the landing (measurement record, not the lever).
Distinct-seed medians are identical to config medians here (control
[21,7,11,79,5,16] → 13.5; armed [7,23,79,62,40,3] → 31.5), so the
lead/belong duplication does not change the verdict.

## Per-config table (full band)

| seed | policy | control door → lost (postDoor) | armed door → lost (postDoor) |
|---|---|---|---|
| 70201 | lead/belong (identical) | — → d36 | — → d36 |
| 70202 | lead/belong (identical) | — → d104 | — → d104 |
| 70203 | lead/belong (identical) | d114 → d135 (21) | — → d113 (door LOST) |
| 70204 | lead/belong (identical) | d86 → d93 (7) | d86 → d93 (7) |
| 70205 | lead/belong (identical) | — → d89 | — → d89 |
| 70206 | lead/belong (identical) | — → d129 | d120 → d143 (23) (door GAINED) |
| 70207 | lead/belong (identical) | d167 → d178 (11) | — → survived (door LOST, village lives) |
| 70208 | lead/belong (identical) | d100 → d179 (79) | d100 → d179 (79) |
| 70209 | lead/belong (identical) | d136 → d141 (5) | d118 → cap (62) |
| 70210 | lead/belong (identical) | — → d132 | — → survived (death → survival) |
| 70211 | lead/belong (identical) | — → survived | d111 → d151 (40) (door GAINED, survival lost) |
| 70212 | lead/belong (identical) | d137 → d153 (16) | d149 → d152 (3) |

All 24 control configs and all 24 armed configs verified: otDays 7 / 14
respectively, 0 instrument errors. National 22/24 both arms (only 70201
misses, both arms). Table reach 18/24 both arms. Seats 0, wins 0, both arms.

## Mechanism: pacing reshuffles trajectories, it does not just stretch them

The headline median (+18d armed) is real but it is NOT a clean post-door
extension, and the per-config table proves it:

1. **Doors turn over.** Only 4 of 6 door seeds overlap between arms.
   Armed LOSES doors on 70203 (door d114 → never opens, dies d113) and
   70207 (door d167 → never opens, but the village SURVIVES to cap).
   Armed GAINS doors on 70206 (never opens → d120, 23d post-door) and
   70211 (survives doorless → door d111, 40d post-door, dies d151).
   A median over door-open configs therefore compares two different
   populations — the confound the metric review below names for the next run.
2. **Where the table never waits, the lever is inert by construction.**
   70204 (door d86, table never waits) and 70208 (door d100, table never
   waits) are byte-identical armed vs control, including death counts.
   The overtime clock runs only while the table waits; villages that die
   before the table waits cannot be helped by pacing. 70201/70202/70205
   are likewise identical.
3. **Where the table waits, the clock bites — in both directions.**
   70209 is the arm's best case: control opens the door already at tier 6
   (d136) and dies 5 days later to tier-6 RERUN fights (Reunion) plus arena
   deaths; armed opens earlier (d118, 2 veterans vs 3), spends its post-door
   window at tiers 5-and-below, reaches tier 6 only at d175+, and survives
   to the cap (62 post-door days, a lower bound — the cap truncates it).
   70212 is the reverse: armed opens later (d149 vs d137) and dies sooner
   post-door (3d vs 16d).
4. **Tier evidence supports the clock mechanism without proving it alone.**
   70202 armed reaches max tier 1 vs control tier 2, yet dies the same day
   with the same death count — lower tiers do not by themselves save a
   village whose death is not tier-driven. 70209 armed still reaches tier 6
   and survives — the gain is timing (when tier 6 arrives), not avoidance.
   Per pre-reg metric-review note 1: do NOT attribute the gain to "the
   clock" alone — fewer tiers by day X also means easier raids and a
   cheaper seat on the calendar.

## Secondaries

- **Tier at death / tier at seat:** no seats in either arm, so tier-at-seat
  is vacuous. Max death/fight tiers per config are in the per-config JSONs
  (analyzer prints them). Highest: tier 6 on 70203/70209/70211/70212 control
  and 70209/70210 armed.
- **Eulogy-cascade deaths:** Eulogy appears but is not the decider on this
  band — control 70203: 1, control 70212: 1; armed 70203: 1, armed 70212: 2.
  No cascade (multi-death single-Eulogy window) fires in either arm.
- **Veteran counts at door:** 70204: 2 both arms; 70208: 2 both arms;
  70203 control: 2; 70206 armed: 2; 70207 control: 2; 70209: control 3,
  armed 2 (earlier door with fewer veterans); 70211 armed: 2; 70212:
  control 3, armed 3. The veteran bar is not what pacing moves.

## Kill classification (§14a)

**NO-GO on the pre-registered bar; closest to CONCEPT-DEAD for the 7→14
cadence-halving as a standalone lever** — the mechanism is staged, the
metric was fair (bar deliberately reused from doorready for comparability),
and the lever as specified does not clear the bar it was designed to clear
(31.5 vs 33.5). This is NOT a METRIC-BROKEN kill (the bar was fair and the
miss is a real 2-day miss, not a measurement artifact — distinct-seed medians
agree) and NOT SUBSTRATE-MISSING (doors reproduce, the clock runs, the
instrument is clean). The cap variant (maxTier 6 → 4) named in the
pre-registration is a SEPARATE follow-up pre-registration, not a retry of
this arm, and it must pre-register against the metric-review notes below.

## Metric review (for the NEXT run, not re-scored here)

1. **Median-over-door-open-configs mixes populations when the lever moves
   doors.** Next arm: pre-register a matched-door-seed median (seeds opening
   doors in BOTH arms) alongside the headline median, or a joint
   door-rate + post-door-survival bar. On this band the matched-door-seed
   medians would be control [7,79,5,16] → 11.5 vs armed [7,79,62,3] → 34.5 —
   a different story from the headline, which is exactly why the headline
   alone must not be re-scored now.
2. **Effective n is distinct seeds, not configs.** Lead/belong pairs are
   byte-identical on this substrate (LINKFORM=2 inert dim). Future bars
   should be set on distinct seeds (here 12, not 24); medians agree here,
   but a future bar could hinge on it.
3. **The "doors by construction" premise failed.** The pilot population was
   described as 8 known door-reaching configs; only 4/8 opened doors on
   current master (2/4 seeds). Full band control: 12/24 configs, 6/12 seeds.
   Next arm: re-pin the door population on current master first (pre-reg
   note 3, partial — the population was non-empty, so this run proceeded
   on the matched subset with the caveat recorded, rather than aborting).
4. **The 180d cap truncates the arm's best case.** 70209-armed survives to
   the cap (62 post-door days is a lower bound); 70207/70210/70211 survivals
   are likewise censored. A longer horizon or a survival-analysis framing
   would sharpen the next run.
5. **Survived configs report gameDays 181, not 180** (runDays day-count
   off-by-one vs the cap). Post-door survival caps at 180 by construction
   in this sweep, consistently in both arms — cosmetic, noted, not judged.
6. **Telemetry regime note honored:** no comparison against the winseat
   telemetry baseline (SEATDRIVE=1 stack) anywhere in this run — armed vs
   control inside this run only.

## Incidents

- **Mid-run session loss (armed pilot):** the background exec running the
  armed pilot died after 6/8 configs (70209 pair unwritten) when its session
  went unknown — no error captured, consistent with a runtime restart. The
  6 finished configs verified byte-consistent with control where the lever
  is inert; the 70209 pair was re-run in a fresh process into the same
  evidence dir (per-config files are independent; no duplication). Final
  corpus is 24/24 per arm, verified.
- **No EPERM flap during this run.** All per-config writes hash-verified
  after write (sha256 readback, wallseg pattern).

## Convergence

`killed-at-confirm` — pilot GO (thin), confirm NO-GO by 2 days on the
pre-registered primary, guardrails all pass, arm killed per kill protocol.
L887's overtime-pacing direction is measured out at 7→14; the cap variant
awaits its own pre-registration.
