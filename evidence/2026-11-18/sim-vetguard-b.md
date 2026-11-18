# sim-vetguard-b — DIAGNOSTIC on the veteran-guard half of the fight gate (finding #2506)

**Arm:** sim-vetguard-b (Loop B, run fleshout-loop-b-20261118T1330Z) ·
**Branch tip:** `sim-vetguard-b` (this worktree; commits below) · **Prereg:**
`evidence/2026-11-18/sim-vetguard-b-prereg.md` (frozen before any
sweep; amended twice pre-judging — see Metric review) · **Band:**
104301–104308 (the fightgate census band, re-run) + staged seed
104301 · **Horizon:** 150d death-aware · **Policy:** competent verbatim ·
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1` (the seekgate
substrate; SEEKGATE unset, WILDAVOID unset) · **Legs:** survey (8
seeds) + staged proof (1 seed, three runs v1/v2/v3 — see below).

## Verdict: DIAG-NO-GO per the frozen prereg — and the question is answered anyway

| Bar | Result | Numbers |
| --- | --- | --- |
| S1 (instrument) | **PASS** | 8 files, exact frozen seeds, 0 instrument errors, complete gate rows; determinism v2-vs-v1 row-identical 8/8; cross-driver (fightgate driver at this base, seed 104308) row-identical |
| S2 (survey population) | **PASS** | Living wave-4 veterans on 7/8 seeds (max 2/seed; 257 veteran-days band-wide) |
| T1 (guard works when staged) | **PASS** | `scripts/test-vetguard-b.js` 42/42 ALL PASS; analyzer `--selftest` 15/15 |
| T2 (staged leg reaches table through game code) | **FAIL** | 0 table-stage veterans in three staged runs (v1/v2/v3); 0 depart-side rows; probe skipped (veteran dead) |
| Survey guard fires | 0 | 0 in 151 wave-3+ gate calls; 0 gate calls with a table veteran |
| Unreachability (frozen mechanism) | **NOT PROVEN** | beat[5] exists on 8/8 seeds; max capped standing 200–425 (frozen bar wanted < 200 everywhere) |

**DIAG-NO-GO because T2 fails** — the staged veteran never reached
stage `'table'` through game code, so the frozen verdict mapping
fires. But read the rest of this file before treating that as a failed
arm: the diagnostic question the arm was asked — *does a table-stage
veteran ever exist in live play, and does the guard fire?* — is
**answered, with the mechanism precisely located**. The guard's CODE
works (T1, 42/42 with all controls). What does not exist is its INPUT:
no table-stage veteran forms in 150 days of organic play on this band
(0 in 8 seeds), and the reason is NOT the one the prereg guessed
(standing never reaching 200 — it reaches 200+ on all 8 seeds and
beat[5] fires on all 8). The reason is downstream, in the table
transition itself — see "The answer".

## The answer (the substance, reported not gated)

**The veteran-guard is unreachable in live play on this band — not
because the guard is broken, and not because standing is short, but
because the table stage itself never forms for a veteran.** The chain,
link by link, on the clean survey corpus:

| Link | Count | What it means |
| --- | --- | --- |
| Living wave-4 veterans (max per seed, summed) | 10 | Veterans exist: 7/8 seeds hold ≥ 1 (104303: 0 — its veteran(s) died) |
| Veteran-days (a living veteran on a day) | 257 | The veteran half of the conjunction is common |
| Days a veteran holds a standing/hunt plan | 23 | Plans form, but veterans rarely hold one (9% of veteran-days) |
| Days a veteran holds a standing/hunt plan AND is at Haven | 2 | The full conjunction: 2 days in 1,200 village-days (0.8% of veteran-days) |
| Table-stage veterans ever | 0 | The conjunction never completes through game code |
| Table-stage plans (anyone) | 1 | Desmond Clarke, 104303, days 122–123 — a NON-veteran |
| Gate calls wave ≥ 3 | 151 | 27 outmatched avoids, 20 seeks, 0 veteran-guard |
| Gate calls with a table veteran | 0 | The guard never even gets an opportunity |
| Depart-side rows for a table veteran | 0 | `veteranGuardHolds` 0 on all 8 seeds |

**The choke point is `winPlanHavenTick`.** Stage `'table'` is reached
ONLY from that tick (win-plan.js:562, 571-573), and the tick runs
almost never: **77 calls in 150 days across the whole village**
(~0.5/day, staged-leg v3 counter) — it lives inside agencyTick's
Haven pass, which requires daytime, at Haven, not on expedition, a
ranger profile, no indoor objective, no danger gate, not engaged.
Veterans live on the road: visjoin_97 (104302), the only veteran who
ever stood at Haven with a hunt plan after the fifth-draft beat, was
home exactly 2 days (138, 146) between long expeditions — and died
of his wounds on day 146 ("a wound that wouldn't close"). The
HavenTick never ran for him on either day (his end-of-day presence
did not align with the tick's daytime pass). The staged leg proves
the same shape three times over (see below).

**The two "almosts" that prove the transition itself works:**
- Desmond Clarke (104303) — a non-veteran — DID reach table stage:
  standing day 121 (after a kill), table days 122–123 (beat[5] live
  since day 117), then launched away day 124 (`launchParty` sets
  stage back to `'hunt'` on departure). The standing→table transition
  fires in live play when the conjunction holds for a plan holder
  actually home at tick time. It just never holds for a veteran.
- The proof test's direct `winPlanHavenTick` call advances a staged
  NPC veteran standing→table immediately (T1). The code path is
  sound; the live-play opportunity is what is missing.

**The three staged runs (seed 104301, same seed, same substrate):**
- **v1** — staged james_okonkwo day 108 (organic wave-4 killer, at
  Haven, plan seeded `'standing'`, beat[5]=108). He sat at Haven 6
  days (108–113) with a standing plan + beat[5] and never advanced —
  because he had JUST become the scholar (succession day 108) and
  agencyTick skips the scholar (`if (rid === this.villagerId)
  continue`), so the HavenTick / depart never run for the player
  character. He died in the wild day 114 as the player. INSTRUMENT
  BUG (driver picked the scholar), not a game finding — driver fixed
  to exclude the current scholar; corpus retained as
  perseed-vetguard-b-stage-v1.
- **v2** — staged nikos_papadopoulos day 120 (NPC veteran, at Haven).
  He flickered in/out of Haven (home days 120/122/124, out 121/123/
  125) with a standing plan + beat[5], never advanced; became the
  scholar day 126, sat at Haven days 126–130 as the scholar (skip
  again), died in the wild day 130 as the player. Corpus retained as
  perseed-vetguard-b-stage-v2.
- **v3** — same staging (nikos, day 120; trajectory identical to v2:
  76 deaths, standing 325 — the new wrap is pure). Added a
  `winPlanHavenTick` wrap logging every tick call for the staged
  veteran: **0 calls for him in 150 days; 77 calls village-wide**.
  The tick never ran for the staged veteran at all. That is the
  availability inspection for T2, and it closes the question: the
  staging path through game code does not fail — it never gets
  invoked for a veteran holding a standing plan.

**The frozen unreachability mechanism was wrong.** The prereg guessed
table stage is unreachable because capped standing never reaches 200.
The survey refutes it: max capped standing is 200–425 across the
band, and beat[5] (the fifth-draft deferral) exists on **8/8 seeds**
(first days 65–128). The standing-199 stall is the RAW total on 5/8
seeds; the CAPPED total (what the beat reads) clears 200 everywhere.
The real wall is one step downstream: the beat exists, veterans
exist, but the tick that would join them almost never runs for a
veteran at home. See Metric review for the corrected bar proposed
for the next run.

## Sense-testing

- The fiction DOES notice veterans: every wave-4+ kill is announced
  on camera — "Oh — OH. Everybody saw that, right? James just put
  down The Focus Group... on CAMERA. That's a veteran kill, folks.
  REMEMBER the name." James (104301) made three veteran kills (days
  51, 58, 75); Nikos made two (days 91, 119). The village celebrates
  its killers by name — and then the plan system never picks any of
  them up. A veteran is a celebrated person with no gameplan.
- visjoin_97's arc reads as the design's own tragedy, stated plainly:
  a hunter who lived on the road for weeks, came home twice, and died
  of his wounds the second time — the day the village finally needed
  him alive for the table. Nothing in the transcript is robotic; the
  gap is structural (no tick), not tonal.
- Desmond Clarke's 2-day table tenure reads correctly as designed:
  he reached the table, and the next morning he launched a hunt —
  table stage is a staging post, not a parking spot, for a
  non-veteran. For a veteran the depart guard would have held him 7
  days instead — but no veteran ever gets there to be held.
- The staged veterans' deaths both came as the player character
  ("the wild", player True) — succession keeps handing the player the
  veteran's life just as the plan system stops ticking for them. The
  scholar-skip is the sharpest single fact in this arm: the most
  storied villagers are the ones the plan machinery ignores.

## Metric review

- **S1 was amended pre-judging (amendment #2) and passes.** The
  original cross-check (match the fightgate census corpus) is
  unachievable: that corpus is base 62b1e749d and seven game-code
  commits landed since (triodrought companion-carry restore,
  wildavoid, fleerepair3, journey pocket repair, trail-talk,
  notickexact). The fightgate driver re-run on 104308 AT THE CURRENT
  BASE gives 77 deaths / village-lost d143 — identical to this
  survey, not to its own corpus (74 / survived) — proving the
  mismatch is the base move, not the recorder. S1 now rests on two
  same-base checks, both clean: (a) the clean re-run reproduces the
  v1 run row-identical on all 8 seeds (the only difference between
  the runs is the recorder's standing reads — so those reads do not
  move trajectories); (b) the fightgate driver at this base
  reproduces this survey row-identical on 104308. LESSON FOR THE NEXT
  RUN: a census corpus goes stale the moment game code lands — a
  cross-check must name its base, and a re-run on a new base needs a
  same-base reference, not the old corpus.
- **The S1 judge itself had a bug, fixed pre-judging:** it counted a
  gate row with `planStage: null` as incomplete. Null planStage is
  valid (the fighter holds no plan — 2 rows: 104301 d49, 104308
  d89). The judge now requires only party / isVeteran / allArmed.
- **unreachableProven's mechanism was wrong (see above).** Proposed
  corrected bar for the next run: unreachable iff tableVeterans == 0
  AND beat[5] exists on ≥ 1 seed AND havenTickStandingAtHaven == 0
  across the band — i.e. the beat is live, veterans exist, but the
  tick-time conjunction never completes through game code. On this
  corpus that bar would read: 0 table veterans, beat5 on 8/8,
  havenTickStandingAtHaven 0 (v3) — unreachable PROVEN. Do not
  re-score this run under it; the frozen verdict stands as
  DIAG-NO-GO (T2) and the correction is for the next run's prereg.
- **T1 is the arm's solid pass.** The proof test (42/42) covers the
  guard firing solo vs wave-3, the plan demotion to `'party'`, the
  avoidances bump, rule order (wave-4 solo is veteran-guard, not
  outmatched), and the three null controls (wave-2, non-table plan,
  armed party beside them) — plus the depart hold (7-day hold, bump,
  holdSinceDay stamp, expiry to `'normal'`). The guard is correct
  code with no live input.
- **T2's three runs are a feature, not churn.** v1 caught an
  instrument bug (scholar pick); v2 caught the succession trap
  (staged NPC becomes the scholar mid-run); v3 added the tick wrap
  and located the mechanism (0 tick calls for the staged veteran).
  Each run answered the question the previous one left open. The
  frozen T2 bar never moved.
- **Say-wrap coverage gap (instrument limitation, not a verdict
  item):** the driver wraps `Game.say`, but `_standingHoldBeat`
  voices through `sysSay` — so the fifth-draft hold line ("The fifth
  draft stays in the wings...") was never captured (0 lines across
  the band) even though beat[5] exists in state on all 8 seeds. Do
  NOT read the 0 as "the beat was never voiced." A future recorder
  that wants the hold beats must wrap `sysSay`.
- **No balanced panel:** no game-code change, no contrast leg — the
  validity gates are T1 + the S1 determinism/cross-driver checks,
  stated in the prereg, not waived silently.
- **Wall numbers (survey band):** national standing 3/8, national
  rank 0/8, table 0, wins 0, wave 4 8/8, wave 5 3/8, median survival
  150d (6/8 survive to 150d; 104306 lost day 110, 104308 lost day
  143). Per-seed: 104301 350/regional/w5; 104302 199/regional/w4;
  104303 199/regional/w4; 104304 505/regional/w5; 104305
  350/regional/w5; 104306 199/regional/w4 (lost d110); 104307
  199/regional/w4; 104308 199/regional/w4 (lost d143).

## Infrastructure notes (for the record, not the verdict)

- **Proof re-runs:** `scripts/test-vetguard-b.js` 42/42 ALL PASS on
  the final tip (re-run after every driver change); analyzer
  `--selftest` 15/15.
- **Driver smoke:** 1 seed (104301) 30d before the survey — 0
  errors, census rows written, 0 v3gates at 30d (maxWave 2 — no
  wave-3 unlocked yet, expected). Smoke output discarded, not judged.
- **Survey:** 8/8 seeds, 150d, 0 instrument errors on every seed
  (per-seed v3gates 3/31/58/28/5/18/1/7 = 151). Staged leg v3:
  trajectory identical to v2 (76 deaths, standing 325) — the
  HavenTick wrap is pure.
- **No check.js run:** per the arm brief, the coordinator runs the
  gate if needed. Zero `src/js` changed, so no green-list file is
  touched.
- **No write flap struck this arm.** Registration/heartbeat were
  slow at times (registry-lock contention with sibling runs) but
  completed.

## Limitations and next arms

1. **The fix shape, for the next run (a BUILD decision, not another
   measurement):** the veteran-guard is correct code guarding a stage
   no veteran ever reaches. Either make table stage reachable — the
   cheapest shapes are (a) advance standing→table at the beat itself
   rather than at the next HavenTick, or (b) run the HavenTick for
   plan holders even while they are out / on expedition return — or
   retire the guard as dead code. The depart-side guard (7-day hold)
   is likewise unexercised (`veteranGuardHolds` 0 everywhere;
   `partyDepartures` 0 on all 9 corpora) and should be exercised by
   the same fix. Which shape is a Steve-call; the numbers for it are
   in this file.
2. **The guard's wild-path half is untouched by this arm.** The
   fightgate census already priced the outmatched half (18/113 wild
   meetings); the veteran-guard half cannot fire on wild paths either
   (the wild routers never consult the gate) — but since no table
   veteran exists at all, there is nothing for a wild veteran-guard
   to protect yet. Revisit after the table fix lands.
3. **The scholar skip is a finding in its own right:** the plan
   machinery (HavenTick, depart, and by extension the fight gate's
   expedition path) never runs for the player character — so the
   scholar's own wave-4 kills never count toward a table veteran in
   live play, even though `hasKillWaveAtLeast` would count them.
   Whether that is intended (the table is a villager system, the
   scholar plays differently) or a gap is a Steve-call. Filed as a
   finding below.
4. **Merge order:** none — this branch changes no game code (driver +
   analyzer + proof test + evidence only). It can merge whenever the
   coordinator wants it; nothing depends on it and it depends on
   nothing.

## Files

- Prereg: `evidence/2026-11-18/sim-vetguard-b-prereg.md`
- Evidence (this file): `evidence/2026-11-18/sim-vetguard-b.md`
- Analysis: `evidence/2026-11-18/vetguard-b-analysis.json`
- Instruments + proof:
  `scripts/vetguard-driver-b.js`,
  `scripts/analyze-vetguard-b.js`,
  `scripts/test-vetguard-b.js`
- Survey corpus (clean re-run): `evidence/2026-11-18/perseed-vetguard-b-survey/`
  (8 files)
- Survey corpus v1 (daily standing reads; retained for the S1
  determinism check): `evidence/2026-11-18/perseed-vetguard-b-survey-v1/`
  (8 files)
- Fightgate-driver repro at this base (seed 104308):
  `evidence/2026-11-18/perseed-fightgate-scope-b-repro-8709e9f87/`
  (1 file)
- Staged corpora: `evidence/2026-11-18/perseed-vetguard-b-stage/`
  (v3, judged), `.../perseed-vetguard-b-stage-v1/` (scholar-pick bug),
  `.../perseed-vetguard-b-stage-v2/` (succession trap)
- Run logs: `evidence/2026-11-18/vetguard-b-survey.log`,
  `evidence/2026-11-18/vetguard-b-stage.log`
