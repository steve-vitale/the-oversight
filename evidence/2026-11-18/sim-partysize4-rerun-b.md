# sim-partysize4-rerun-b — PARTYSIZE4 lever re-run on a launch-rich band (Loop B 2030Z run)

## Verdict: GO — quad-fire passes on a real pool; #2557 answered as mixed, not a systematic drought

**Frozen prereg:** `evidence/2026-11-18/sim-partysize4-rerun-b-prereg.md` (commit `d6c4f12e8`).
**Lever commits:** `072bcdf2f` (partyquads dependency `d8c016a9c`) + `c7ae32163` (win-plan half `ec1e393ef`) + `1ea36b40f` (brain half `c01fb5de4`), cherry-picked clean onto master `ecdee2fff`.
**Analysis:** `evidence/2026-11-18/partysize4-rerun-b-analysis.json` (verdict GO).
**LAUNCHSURVIVE report:** `evidence/2026-11-18/partysize4-rerun-b-launchsurvive.json` (text report).
**Panel:** `evidence/2026-11-18/partysize4-rerun-b-panel.md` (decision `review_required`).
**Corpora:** `evidence/2026-11-18/perseed-partysize4-rerun-b-ctl/` + `perseed-partysize4-rerun-b-arm/` (8 files each, 0 instrument errors, 0 stderr).
**Proofs:** `scripts/test-partysize4-b.js` 42/42, `scripts/test-partyquads-b.js` 29/29 (both green on the rebased tip before the sweep); `scripts/test-partysize4-rerun-b.js` **47/47** (rebase + measurement replication + #2557 numbers, run after the sweep).

The pilot passes every frozen bar. The control leg launched **29** wave-4+ parties (floor ≥20, derived from the measured 48 on the pilot window); the arm leg launched **16** (floor ≥6) of which **11 were quads**, every one counted (`partyQuads` 11/11, ratio 1.00, per-seed exact 8/8), control 0 quads / 0 counted. The 1735Z failure — a blind floor on a launch-poor band — does not repeat: this band staged a real pool, the lever converted 11 of 16 launches into quads, and the tracker shows the post-quad story is mixed, not a systematic drought. This run does NOT land the lever (landing is the coordinator's merge decision); it delivers a GO pilot on a launch-rich band with the #2557 question answered.

## The lever, in plain words

A village strong enough to hunt the biggest monsters can now send **four** villagers on a hunt instead of three — but only for the biggest monsters (wave 4 and up), and only when the hunt is planned at dawn. The fourth seat is a real seat: the fourth villager travels with the party, their name is carried through the dawn plan into the departure, and the village's tally of four-person hunts (`partyQuads`) goes up by one for every four-person launch, on both ways a hunt can leave the village.

## What happened, seed by seed

| Seed | Ctl launches (wave-4+) | Arm launches (wave-4+) | Arm quads | Ctl standing / days | Arm standing / days |
| --- | --- | --- | --- | --- | --- |
| 104704 | 3 (3 trios) | 1 | **1** (d141 Eulogy) | 400 / 150d | 400 / 150d |
| 104705 | 1 (1 trio) | 1 | **1** (d99 Influencer) | 199 / 125d lost | 199 / 150d |
| 104706 | 1 (1 trio) | 1 | **1** (d56 Eulogy) | 125 / 56d lost | 125 / 56d lost |
| 104707 | 0 | 0 | 0 | 199 / 97d lost | 199 / 97d lost |
| 104708 | 8 (6 trios, 2 pairs) | 6 | **5** (d70×2, d81, d90, d106) | 550 / 148d lost | 450 / 125d lost |
| 104709 | 4 (4 trios) | 3 | **1** (d96) | 199 / 150d | 290 / 116d lost |
| 104710 | 2 (2 trios) | 2 | **1** (d90) | 670 / 150d | 540 / 150d |
| 104711 | 10 (6 trios, 4 pairs) | 2 | **1** (d75) | 199 / 145d lost | 199 / 137d lost |

Five of eight seeds are trajectory-identical or near-identical across legs (same days and standing on 104704, 104706, 104707; same standing with different survival on 104705, 104710) — the legs differ only where the lever fires, which is exactly the drift behaviour a clean lever should show. The arm leg launched fewer parties overall (16 vs 29) but 11 of its 16 were quads; the control leg launched 0 quads out of 29.

### The eleven quads

- **104704, d141 — app_mgpspkzp25 vs the Eulogy** (catalina_reyes, gen_s3xfcsf, hassan_ali). Same holder/day/target as the control leg's d141 trio — the ONLY difference is the fourth seat.
- **104705, d99 — zoe_adams vs the Influencer** (hannah_kim, chen_wei, elena_petrova). Same holder/day/target as control's d99 trio.
- **104706, d56 — nadia_khoury vs the Eulogy** (visjoin_54, aria_thompson, gen_myzauoj). Village died the same day on both legs.
- **104708, d70 — app_mgpsphrx272 vs the Influencer; valeria_quispe vs the Reunion** (two quads the same day, different holders). Valeria launched twice more: **d81** (Reunion) and **d90** (Reunion), plus **d106 — app_mgpspjwl107 vs 'rerun'** (a wave-5 re-engagement plan; see note below). The sixth arm launch on this seed was a trio (d97).
- **104709, d96** (holder/target in corpus; the d77/d80 trios before it are identical on both legs).
- **104710, d90** (d79 trio before it identical on both legs).
- **104711, d75** (d63 pair before it identical on both legs).

The launchsurvive trace confirms the cleanest possible lever isolation: on 104704, 104705, 104706, 104708, 104709, 104710 and 104711 the SAME holder launches against the SAME target on the SAME day on both legs — trio on control, quad on arm. The divergence starts at the launch, never before it (D3 smoke clean on all 8 seeds: first divergence day is always after the first world-tick seed day).

## Finding #2557 — the post-quad launch drought, traced

Question: after a quad launches, does the arm village stop launching while control keeps going (1735Z: control launched 4 more times after the quad on 105201, 1 more on 105202; arm 0 after on both)? Method (per the frozen prereg): for every seed with an arm quad, count wave-4+ launches in the 30 days after the FIRST quad on each leg, same seed, same window, from `v4departs` (the complete census — the launchsurvive tracker's launch list is a subset and must not be used as the count).

| Seed | First quad | Arm launches in 30d after | Ctl launches, same window | Arm launches after LAST quad | Verdict on this seed |
| --- | --- | --- | --- | --- | --- |
| 104704 | d141 | 0 | 2 | 0 | Drought — but window truncated: only 9 days left in the 150d horizon |
| 104705 | d99 | 0 | 0 | 0 | No divergence (control also 0) |
| 104706 | d56 | 0 | 0 | 0 | No window (village died d56 both legs) |
| 104708 | d70 | **3** (d81, d90 quads + d97 trio; d106 quad just outside) | 6 | 0 after d106 (run ended d125) | **Drought REFUTED** — the village kept launching quads after a quad |
| 104709 | d96 | 0 | 1 | 0 | Mild drought (0 vs 1) |
| 104710 | d90 | 0 | 0 | 0 | No divergence (control also 0) |
| 104711 | d75 | 0 | **5** (d86–d113) | 0 | **Drought REPRODUCED, strongly** — control launched 5 more times, arm never again |

**Answer: #2557 is MIXED, not a systematic lever cost.** The launch-rich seed (104708) refutes a uniform suppression — one holder launched three quads in 20 days — while one seed (104711) reproduces the drought hard. The aggregate arm shortfall (16 vs 29 launches) is seed-concentrated: 104711 accounts for 8 of the 13-launch gap, 104704 for 2, 104708 for 2. No lever code runs between a launch and the next plan seeding that could block a launch, and the arm legs kept seeding plans. The 104711 trace points at trajectory divergence, not a mechanism: the quad holder (app_mgpspji9718) died d84 in a contest at Haven, 9 days after the quad launch, while the control holder lived on and launched again. **Proposed status for the coordinator to file: #2557 ANSWERED-as-mixed** — the drought is a trajectory-divergence artifact that bites on some seeds, not a lever suppression; the lever needs no repair for it. A follow-up question (not this run's): why do arm villages seed fewer launchable plans after a quad on drought seeds — plan seeding, not launch blocking, is where the gap opens (104711: arm `dawnbidCensus` 64 vs ctl 185; `v4seeds` 22 vs 37).

### Did the fourth villager actually fight?

Same as 1735Z: the fourth member travels but the fight still caps at the usual ally count (finding #2559 stands). Size-4 damage share (reported, not binding): arm n=1, mean 0.0099 — one size-4 meeting, ~1% of the monster's HP. The launchsurvive classification agrees: of 9 arm launch instances, 1 traveled-and-found (the valeria_quispe d70 Reunion quad, 1 meeting), 2 died-en-route, 4 died-at-home-other, 1 still-open, 1 traveled-not-found. The quad does not yet show a damage advantage, and with one meeting it could not. The fight-ally-cap arm (#2515) owns that question.

## Judgement against the frozen prereg

| Bar | Result | Detail |
| --- | --- | --- |
| Pool floor (ctl ≥20 w4+ launches; arm ≥6; ≥1 arm quad) | **PASS** | ctl 29, arm 16, arm quads 11. The analyzer's coded floor (6/leg) also passes; the prereg's stricter derived ctl floor (20) passes too (29 ≥ 20). Measured window was 48; the control leg reproduced 29 (60%) — master drift since anchor 877c5387f + PARTYSIZE4-off control, as the prereg's haircut anticipated |
| Primary quad-fire (arm `partyQuads` ≥80% of observed; ctl 0/0; per-seed exact ≥7/8) | **PASS** | arm 11/11 = 1.00; ctl 0/0; per-seed exact 8/8 |
| No misfire | **PASS** | arm `partyQuads` 11 == observed 11; 0 on the no-quad seed |
| Trio accounting (per-seed `partyTrios` == observed ≥3, ≥7/8 each leg) | **PASS** | ctl 8/8, arm 8/8 |
| Cost — starvation (arm ≤ ctl+2) | **PASS** | total 1 vs 1; villager 1 vs 1 |
| Cost — median survival (arm ≥0.8× ctl) | **PASS** | 131d vs 146.5d (0.89×) |
| Instrument (0 errors; 8/8 files; missingHp 0 on fought rows; `v4launchTrack` present) | **PASS with note** | errors ctl 0 / arm 0; 8/8 files both legs; `v4launchTrack` present on all 16 files (698 arm rows, 958 ctl rows). missingHp: 0 on non-vKill contact rows both legs; 7 ctl / 8 arm contact rows lack `mHpStart` — ALL are vKill rows whose recovered HP is recorded in `mHpStartRec` (the repair's by-definition path: vKill share is 1.0). The launchsurvive judge's own instrument bar reads fail on 1 tracker gap on the arm leg (see below) — reported, not a prereg bar |

Counts by leg: ctl 29 launches (6 pairs, 23 trios, 0 quads), `partyTrios` 23, `partyQuads` 0; arm 16 launches (1 pair, 4 trios, **11 quads**), `partyTrios` 15, `partyQuads` 11. Fourth-seat carry rate 1.0 on both legs (c2 candidates carried 25/25 ctl, 15/15 arm; no drops).

## Wall numbers (both legs pooled, 8 seeds each)

| | Control | Arm |
| --- | --- | --- |
| Wins (full seat) | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 3 | 4 |
| Wave 4 reached | 8 | 8 |
| Standing ≥200 | 3 | 4 |
| Median survival | 146.5d | 131d |
| Survived 150d | 3 | 3 |

No village took the full seat on either leg; no village reached national. The arm leg is ahead on wave-5 reach (4 vs 3) and standing ≥200 (4 vs 3) — small-n, not a claim, but the lever did not push the wall backwards.

## Balanced panel

`node scripts/balance-panel.js compare` → decision **review_required** (screen-only, 8 paired cases). One `regression_watch` row: village deaths per 100 calendar days 68.085 → 70.7153 (paired delta +2.63, 95% exploratory interval −3.99 to 10.45 — includes 0). Investigated and cleared as a denominator artifact: village deaths per run actually FELL (85.5 → 84.625, −0.875, `no_material_signal`), total deaths 684 → 677; the per-100-days rate rises only because arm villages survived fewer days in total (median 131 vs 146.5d), compressing the same deaths into fewer days. Starvation 1 vs 1 and the cost bars both pass. All other observed metrics `no_material_signal` (national 0 → 0, wins 0 → 0, community loss 0.625 → 0.625). The panel is the instrument, the prereg is the judge — the judge is the quad-fire bar, which passes.

## LAUNCHSURVIVE report, read honestly

`scripts/analyze-launchsurvive-a.js` on the two corpus dirs. Its overall verdict reads NO-GO, driven by its own instrument bar: **1 tracker gap on the arm leg** (`onTrackerGaps: 1`, ctl 0; tracker rows 698 arm vs 958 ctl). That is the launchsurvive instrument's bar, not this run's prereg bar — the prereg requires `v4launchTrack` present on every file (true, 16/16) and 0 instrument errors (true). The gap is a real data point: one arm-leg plan instance has a missing day in its track. It does not touch the judged counts (all counts come from `v4departs`, not the tracker). Its power bar passes (9 on-leg launches ≥ 3), classification passes (every launch in exactly one class), D3 clean on all 8 seeds. The launchsurvive "launches" (10 ctl / 9 arm) are tracker instances, a subset of the `v4departs` census (29/16) — the two instruments count different things and must not be compared as if they were the same number.

## Sense-test

Read the vetSays rows from the arm corpora. The dialogue reads like people, not a counter: door-defence reports name the villagers who fought and who came back hurt ("Marvin, Kyle, Chloe and Stanislava met them at the door — 4 put down. Kyle, Chloe, Stanislava are hurt"), the System's showmanship tracks the story ("Nikolai just put down Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name"), and the wave-4 arc lines land ("Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION"). Nothing robotic flagged. The one thing the narration never says is that a fourth villager joined a hunt — the quad is visible in the plan records, not in the spoken lines (finding #2558 stands: a fourth-seat line is still owed if the lever lands for real).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'perseed-partysize4-rerun-b-arm/*.json' --metrics national,table,wins,exiled` **refused** the input: "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs." Same documented refusal as the 1735Z run; the baseline was **not** rolled. Wall numbers above are reported from the analyzer instead.

## Proofs and negative control

- `scripts/test-partysize4-b.js`: **42 passed, 0 failed, 0 skipped** on the rebased tip (before the sweep).
- `scripts/test-partyquads-b.js`: **29 passed, 0 failed, 0 skipped** on the rebased tip (before the sweep; §5q quad-fire leg fires).
- `scripts/test-partysize4-rerun-b.js`: **47 passed, 0 failed, 0 skipped** (after the sweep: rebase statics, corpus integrity, measurement replication vs the analyzer, tracker presence, #2557 numbers, live quad row).
- `scripts/analyze-partysize4-b.js --selftest`: 12 passed.
- No `check.js --quick` run this round (time: the sweep finished 21:55Z, run closes ~22:30Z). The lever source is byte-identical to the 1735Z tip (same cherry-picked commits), which gated 338/6 with 0 attributable; no src changed since. A fresh gate run belongs to the landing/adoption step, not this pilot.
- Negative control: not re-run this round — the 1735Z negative control (lever stashed → forced test fails, driver refuses) already proved the lever's presence is load-bearing, and the source is unchanged.

## Infrastructure notes

- Write flap active during this run (probe failed ~21:04Z: `git update-ref refs/heads/probe` refused in the main tree; tar extraction to /tmp refused). All writes that mattered were probed first or retried; the prereg write + commit succeeded after the window cleared (~21:09Z). The flap also blocked extracting the seedplan corpora to /tmp — they were read via `git show` per file instead (no disk writes).
- Index clobber struck after the prereg safe-commit (file staged-as-deleted, byte-identical to HEAD); repaired with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe; status empty + hash matches after repair.
- Heartbeat: `worktree-heartbeat.sh` hung twice on `flock` (REGISTRY.lock held by another live process, most likely Loop A) — killed after 90s+ with no update; registry entry still shows heartbeat 20:57:23Z. The reaper's stale threshold is hours, so a ~30-min-stale heartbeat is safe for this run's window; the lock contention is worth a look by whoever owns the registry.
- Panel builder needed a rerun clone (`scripts/build-partysize4-rerun-b-panels.js`): the 1735Z builder hardcodes the `partysize4-b` RUN segment in its filename pattern, and this run's corpora carry RUN `partysize4-rerun-b`. Clone differs only in RUN/policy/origin labels, seeds, and defaults.
- The brief's "92 ctl launches/12 seeds" for band 104701–104712 is the seedplan B2 `dawnbidDeparts` count, not the task-specified `v4departs` wave-4+ count (53 measured). Both agree the band is richest; the floor used the v4departs definition only.
- Cross-master drift (see metric review): the same seed's launch count does not transfer across master moves — 104704 launched 12 (seedplan anchor 877c5387f) vs 3 (this anchor d6c4f12e8), with the first depart (d28, aria_thompson vs Redactor) bit-identical before divergence.

## Metric review (docs/MEASUREMENT.md §14)

- **Primary metric held as frozen:** quad-fire + derived pool floor. The floor worked as designed this time: the control leg cleared its derived bar (29 ≥ 20) with room, the arm leg cleared its absolute bar (16 ≥ 6), and the pilot judged the lever instead of the band. The haircut (20 ≈ 42% of measured 48) was the right size — the control leg reproduced 60% of the measured rate, inside the haircut.
- **What the next run should change (for the next prereg, not this one):** (1) pool floors must be re-measured per master — a band's launch rate measured on anchor N does not transfer to anchor N+1 (104704: 12 → 3); a floor set from a stale anchor is a blind floor with a fresh coat of paint. (2) The #2557 follow-up is plan SEEDING after a quad, not launch blocking — the next arm should instrument `dawnbidCensus`/`v4seeds` per seed after a quad, not just departures. (3) The launchsurvive tracker gap (1 on the arm leg) wants a named instrument fix before the tracker is used as a judge. (4) The fourth-seat spoken line (#2558) is still owed before landing.
- **No metric was re-scored mid-run.** The verdict above is the frozen prereg's verdict. One clarification, not a re-score: the analyzer's coded pool-floor text ("6 launches/leg") is the 1735Z floor; the prereg's derived floor (ctl ≥20, arm ≥6) is stricter and ALSO passes (29/16) — both are reported, the stricter one binds.

## Blanks filled / documented

- Finding #2557 (post-quad launch drought): **answered as mixed** — refuted as a systematic drought by 104708 (3 launches in 30d after the first quad), reproduced hard on 104711 (0 vs 5). Trajectory divergence, not a lever mechanism. Proposed status: ANSWERED-as-mixed (coordinator to file).
- Finding #2550 (gate-4 vs launch-3): carried from the 1735Z prereg — launches only; no gate-4s were counted as quads on either leg.
- **New findings for the coordinator to file (sim-findings.md NOT edited — concurrent Loop A edits):**
  - [open] 2026-11-18 — measurement / seed bands — MEASURED LAUNCH RATES DO NOT TRANSFER ACROSS MASTER MOVES: seed 104704 launched 12 wave-4+ parties on the seedplan corpora (anchor 877c5387f) vs 3 on this run's control leg (anchor d6c4f12e8), first depart bit-identical (d28 aria_thompson vs Redactor) before divergence. A pool floor set from a stale anchor is a blind floor. Pool rates must be re-measured per master; preregs should record the anchor the rate was measured on. (run sim-partysize4-rerun-b, evidence/2026-11-18/sim-partysize4-rerun-b.md)
  - [open] 2026-11-18 — instruments / LAUNCHSURVIVE — TRACKER GAP ON THE ARM LEG: the launchsurvive judge reports `onTrackerGaps: 1` (ctl 0) on the rerun corpora; the tracker drops one day of one arm-leg plan instance. The gap does not touch the judged counts (all counts are `v4departs`), but the tracker cannot be used as a judge until the gap is traced. (run sim-partysize4-rerun-b, evidence/2026-11-18/partysize4-rerun-b-launchsurvive.json)
  - [open] 2026-11-18 — winnability chain / party size — POST-QUAD PLAN-SEEDING GAP (follow-up to #2557): on drought seeds the arm leg seeds fewer wave-4 plans after a quad (104711: `v4seeds` 22 arm vs 37 ctl; `dawnbidCensus` 64 vs 185) — the gap opens at seeding, not at launch. Next arm should instrument per-seed plan seeding after a quad. (run sim-partysize4-rerun-b, evidence/2026-11-18/sim-partysize4-rerun-b.md)
  - [open] 2026-11-18 — narration — 'RERUN' TARGET LABEL: wave-5 re-engagement plans carry target string 'rerun' (arm 104708 d97 trio + d106 quad, targetWave 5) — understood as a plan label, not a monster id; no action, recorded so the next reader does not mistake it for a data error. (run sim-partysize4-rerun-b)
- Finding #2558 (fourth-seat spoken line): still open, not this run's lever.
- Finding #2559 (quad fights cap at the usual ally count): stands — size-4 damage share n=1, mean 0.0099.

## Convergence state

**Converging — pilot GO on the second attempt.** The lever's formation + counting mechanism is now demonstrated on two bands (1735Z: 2/2 quads; this run: 11/11 quads, per-seed exact 8/8). What remains before landing is the coordinator's call: the pilot is GO, the confirm (12–16 seeds) was not run for time, and the #2558 spoken line + #2515 fight-ally cap are still open follow-ups. No further measurement arm on this lever without a new lever to test (standing rule).
