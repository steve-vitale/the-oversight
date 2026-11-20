# journey-scale r246 — RUN NOTE (lane A, leg 3 SCALE, playtest leg)

**Run id:** `playtest-20261120T0545Z`. **Leg:** SCALE, days 80–140, single arm B
(r244/r245 control policy verbatim). **Seeds:** fresh band **103881–103888**.
**Base:** master `0d925556a`. **Commit:** `5ec9c8d25` (journey-scale branch;
see below). **Worktree:** `~/workspace/worktrees/journey-scale`.

## Prereg (binding, written before the panel)

- Full prereg: `evidence/2026-11-20/journey-scale-r246-prereg.md` (committed).
- Q1: can a competent village reach national standing / the table approach
  in days 80–140, and what blocks it? Binding metrics: national /8, table
  offered (lesser priced) /8, full seat /8, wave-4 kills, wave-5 faced,
  standing-199 stall, survival to 140d. **Interesting iff** ≥3/8 national,
  OR a new blocker class (outside r245 set), OR a fixable defect in the
  table-approach path. Else QUIET.
- Q3 guards: spoken-raise, vetbar, trap-line, betrayal-sibling, nod-loop,
  lived-days mean within ±25% of 123, lesser priced ≥4/8.
- This is a PLAYTEST leg, not a lever round. The sub-cap lever is NOT
  re-run (r245 PARTIAL; composition stays a branch). One blank, fixed with
  a proof test, or documented why it cannot be fixed.

## Pilot (seeds 103881–103883, arm B, exit 0)

- 103881: day 141, alive, pop 4/4, regional, lesser seat, w4 kills 5,
  w5 fights 9, 20 deaths (monster 8, wild 6).
- 103882: COLLAPSE day 110, pop 0/0; `phantomDays4=15`, `phantomDays5=15`
  (days 96–110) — standing-199 stall visible in its last 15 days.
- 103883: COLLAPSE day 109; 15 deaths (stranger 4, wild 5).
- Pilot verdict: interesting (2/3 collapses + stall + w5 fights) → expand.

## Panel (seeds 103884–103888, arm B, exit 0)

- 103884: day 141, alive, pop 9/9, regional. 103885: day 140, alive,
  pop 8/8, regional. 103886: day 140, alive, pop 4/4, regional.
  103887: day 138, alive, pop 10/10, regional. 103888: day 141, alive,
  pop 5/5, regional.
- All 8 seeds: regional (peak stage 3), lesser seat priced 8/8
  (days 42–112), full seat 0/8, national 0/8.

## Q1 PLAYTEST PANEL VERDICT: QUIET

```
PANEL national: B=0/8 tableOffered(lesser)=8/8 fullSeat=0/8
PANEL fights: wave-4 fights=231 wave-4 kills=27 wave-5 faced=2/8
PANEL stall: standing-199 stall seeds=1/8 stallDays=15 survival=6/8
PANEL blockers B: 103881 FORMATION-FEW, 103882 COLLAPSE, 103883 COLLAPSE,
  103884 FORMATION-FEW, 103885 FORMATION-FEW, 103886 FORMATION-FEW,
  103887 FORMATION-LATE, 103888 FORMATION-LATE
Q1 PLAYTEST PANEL VERDICT: QUIET — the wall stands as measured
```

No new blocker class (all in the r245-observed set); national 0/8 is below
the ≥3/8 interesting bar. The finding is the blocker taxonomy.

### Q1 NATIONAL (per-seed blockers)

- 103881: LEAD 1/3 seasoned (1 active) — needs 2 more. 103882: COLLAPSE
  d110 (final LEAD 2/3, COV 0/3, TRADE 0/3). 103883: COLLAPSE d109
  (LEAD 0/3). 103884: LEAD 1/3 (2 active) — needs 2 more. 103885: LEAD
  0/3 (2 active) — needs 3 more. 103886: LEAD 2/3 (2 active) — needs 1
  more. 103887: LEAD 0/3 (4 active) — needs 3 more. 103888: LEAD 2/3
  (3 active) — needs 1 more; belong not good.
- The wall is still formation: the 3rd seasoned link never forms in time
  (too few, or too late — 103887's 3rd link formed d125, 103888's d128).

### Q2 BLOCKER TAXONOMY

FORMATION-FEW 4, COLLAPSE 2, FORMATION-LATE 2. No TRUST-LOW, no NATIONAL,
no SNAP, no RUNG, no UNKNOWN this run — the trust wall r245 saw on the
subcap arm does not appear on the control policy; formation is the
control-policy wall, as in r244.

## Q5 CENSUS (plain words)

- 8 villages, 1060 lived days (mean 132.5/seed). 80 deaths total.
  Biggest killers: the wild (30), monsters (20), strangers (8).
  Starvation killed 2 villagers across the band — food pressure is present
  but not the leg's killer.
- Fighting: 316 fights total; wave-4 fights 231, kills 27. Wave-5 faced
  on 2/8 seeds (103881: 9 fights, 2 with the scholar; 103887: 1 fight).
  No wave-5 kills. Living-veteran peak 6 (103881, 103884).
- The outlier is 103887: 149 fights (140 of them wave-4), only 2 deaths,
  all 10 people alive at day 138 — a village that fights constantly and
  survives, yet still never forms the 3rd seasoned link (FORMATION-LATE).
  Fighting is not the bottleneck; forming the national road is.
- 103885 fought 63 fights (50 wave-4) and killed 6, with 4 deaths.
  103886 fought only 11 times and lost 12 people — the spread between
  villages is wide, but every village reached regional and priced the
  lesser seat.
- Tribute: 2/8 READY-UNPAYABLE (103881 ready d101, 29 attempts;
  103887 ready d77, 44 attempts — all refused veterans-short),
  6/8 NEVER-READY, 0 delivered.
- Muster (measurement only): 3 titans slain, 5 called, 185 refused
  meetings, 11 committed, 7 committed deaths. March: 3 slain on-march,
  9 arrived.
- W5-INSTANCE: 103881 MIXED (editor lingers d102–d113, then rerun
  d114–d140); 103887 SUCCESSIVE (1 fight, fresh full-HP); the other six
  UNANSWERED (no wave-5 fights). No village FACED the wave-5 door as a
  door — only roaming wave-5 beasts.
- ANSWERMAIL: 0/8 (off by design). SUBCAP guard (lever OFF): fired 1/8
  (103887), 103 skipped — control behavior, as preregistered.

## Q3 REGRESSION GUARDS — all HOLD/GO

- VETBAR: GO (0 disagreements across all 8 seeds).
- Lived-days: HOLD (mean 132.5 vs control 123, +7.7%, guardrail ±25%).
- Lesser seat priced: HOLD (8/8, bar ≥4/8).
- SPOKEN-RAISE: GO (20 raise talks: 5 properly-answered, 1 counter,
  0 not-offered-spoken [defect], 14 not-offered-unspoken [correct hold]).
- BETRAYAL SIBLING: HOLD (4 turn-0 offers with the invite label in the
  opening, 0 defects).
- NOD-LOOP: HOLD (0 sittings with a ≥4 identical nv: react streak;
  worst 3x).
- TRAP-LINE: SILENT (no mime shown in the band — nothing to regress-check).
- DAILY-PLAY MIME (read-only): 34 daily-play mimes in the capture, 0
  driver-sitting accepts proven in daily play; lane decision still owed
  (teach the shared chooser to take betrayal:accept + nv:accept when
  offered, or keep proving fixes only where the driver looks).

## Q4 PEOPLE CHECK — villagers act like people, with one real blank

Read in full: pilot transcripts d90/d120 (103881, 103882, 103883) and panel
transcript 103887-day120, plus the nonverbal sittings and all 20 raise talks.

- **Hanan, 103881 day 120 (curious want): GOOD.** A real question —
  "Has this changed you? Like, fundamentally?" — answered in character
  by a rail conductor: "Same worry, bigger font." It resolves.
- **Miguel, 103881 day 90 (just_company want): WEAK — the run's blank.**
  The player taps `dlg:react` 5 times; the NPC cycles "So." / nod /
  "Well." / "Anyway." / "So." again; the transcript itself flags
  `!! VERBATIM REPEATS`. The want advances stage 1→2 on nothing — no
  resolution, no plant, no owe. (See Blank below.)
- **Aria, 103882 day 90 (repay want): fine.** The driver left
  immediately; the ask itself is real (a creek water run by day 92).
- **Josefina, 103883 day 90 (seek_comfort + betrayal): mostly good.**
  A real betrayal:accept beat (+4 wood, +4 fiber to the stash), a real
  comfort exchange, real gossip (Sigrun). BUT the "tell me more" chain
  recites the same template 3× ("Nadia? A radio DJ, back before. Solid
  person." / "Elijah? A Social worker...") — the carried r239 Q6 echo
  watch; still present, not this run's blank.
- **Harold, 103887 day 120 (repay want, panel): GOOD — the citation.**
  A withdrawn veterinarian who takes the player on his trap line:
  "Don't tell the others. Everyone needs one place." Then, in his own
  voice: "I need space the way other people need food. Don't take it
  personally." / "Solitude is a skill. I've been practicing my whole
  life. Finally paying off." One dead react appears ("So." They look at
  the fire for a moment.) — once, and the conversation moves on to more.
  A single "So." is a beat; five in a row is the loop (see Blank).
- Raise talks: Valentina 103881 d16–18 (not-offered, coherent; the
  "ambush of Liam/Hanan" thread recurs — good continuity); Chloe 103883
  d12 (accepted link raise to Emberhold — good).

## THE BLANK — filled: want-menu react wind-down

**Defect (root cause, located precisely).** In a `just_company` sitting
the want-owned menu keeps offering `dlg:react` after the thread is dry.
The `reactDryCount >= 2` wind-down gate in `src/js/convo-beats.js:475`
only filters the generic topic-pool loop; the want options are pushed
first (convo-beats.js:378–387) and `wantOwnsMenu` (line 370) skips the
pool loop entirely. The dead-react pool in `src/js/convo-dialogue.js`
(the `dlg:react` handler) has only 4 lines cycled via `convoPickCycle`,
so the 5th react repeats verbatim. Several wants offer `dlg:react`
(convo-wants.js lines 638, 1290, 1295, 1359, 1478, 1484, 1646), so the
fix belongs in the shared menu, not in one want.

**Fix** (`src/js/convo-wants.js`, `convoWantMenu`, commit `5ec9c8d25`):
drop `dlg:react` when `(c.reactDryCount || 0) >= 2`, mirroring the
existing gate's threshold and the adjacent MORE-EXHAUSTION filter (which
already drops `dlg:more` when spent). After it retires, the player still
has `dlg:more` (until dry), leave, silence — the conversation winds down
instead of looping. A landed beat resets the count, so new content
re-opens react; it retires only while dry. This is the same design intent
stated in the existing comments ("the loop winds down instead of offering
the same dead acknowledgment forever").

**Proof test** (`scripts/test-convo-react-exhaustion-r246-20261120.js`):
- Part A (deterministic core, fail-before/pass-after): on a real repay
  sitting (promise a favor, sit again — the repay menu offers react),
  react is offered at counts 0–1, retired at 2–3, re-opens on reset.
  Verified FAIL on unfixed code (A3/A4 fail, react still offered at
  count 2) via a temporary stash + restore.
- Part B (live): on a real curious sitting, driving react live never
  offers it at count ≥ 2, dryness is actually reached, and no THEM line
  repeats verbatim in the sitting.
- Green on seeds 7, 42, 99. The test header records why just_company
  itself is not staged live (a day-1 harness always draws curious /
  ask_favor; the filter is want-agnostic, so the repay sitting proves
  the shared layer and the driver's Miguel transcript is the wild
  just_company evidence).
- **Phone verification owed:** the fix changes on-screen conversation
  options (a choice disappears once the thread is dry). The commit is
  flagged `[needs-eyes]`; no phone check was done in this run and none
  is claimed.

**What was NOT fixed:** the r239 Q6 "tell me more" echo (Josefina's
3× template) is still present — watched, recorded, not this run's blank.

## Reachable / Fun / Winnable (the leg verdict)

- **Reachable:** YES, to regional and the lesser seat (8/8 priced) — but
  NO to national in this leg (0/8). The road to national is formation,
  not fighting: villages fight well enough (27 wave-4 kills, 2/8 facing
  wave-5) but cannot form the 3rd seasoned link in time.
- **Fun:** MOSTLY. The people are the fun — Harold's trap line, Hanan's
  question, Josefina's comfort exchange read like people. The blank was
  the one place the game stopped feeling like people (Miguel's filler
  loop); it is fixed and proved.
- **Winnable:** NO, not in this leg — 0/8 national, 0/8 full seat, 0 wins.
  Nothing in this run changes a win price or a deed gate (gating freeze
  stands); the winnability wall is the formation bottleneck named above.

## Metric review

- Q1's interesting bar (≥3/8 national) held: 0/8 is QUIET, not noise.
- The standing-199 stall instrument behaved as preregistered: 1/8 seeds
  (103882, 15 days, its last 15 days before collapse) — the stall is real
  but rare on this band; the collapse, not the stall, ended that village.
- The lived-days control (123) held at +7.7%.
- The Q2 taxonomy is the finding: formation, not trust, is the control
  wall this run (r245's TRUST-LOW dominance was the subcap arm's shape).

## Gate result

- `node scripts/check.js --quick` (344 scripts, r245's gate): **RUNNING at
  note time** — see the infrastructure note below. The log is
  `journey-scale-r246-gate.log`. Result to be recorded from the log, not
  from this note. The analyzer proof test passed before the gate
  (138 passed, 0 failed) and the react-exhaustion proof test passed on
  seeds 7, 42, 99.

## Telemetry verdict

- Baseline: `telemetry-baselines/scale.json`
  (`fightsTotal 241, fightsByWave.4 178, maxGameDay 468`, 2026-11-14).
- Current (per-seed rows built from the trust JSONs — the only corpus
  files carrying all three metrics at top level — 8 rows in
  `journey-scale-r246-telemetry-row-*.json`; aggregate source
  `journey-scale-r246-telemetry-rows.json`):
  fightsTotal 316, fightsByWave.4 231, maxGameDay 1060 (sums across rows).
- Tool verdict: **one LOUD line** —
  `maxGameDay swung 126%: baseline 468 -> current 1060`.
  fightsTotal (+31%) and fightsByWave.4 (+30%) are quiet.
- **Investigation (before any roll-forward):** the LOUD line is a regime
  difference, not a defect. The tool sums maxGameDay across rows, so the
  baseline 468 is the 2026-11-14 run's 8 seeds living 468 days total
  (mean ~58.5d/seed); this run's 8 seeds lived 1060 days (mean 132.5d)
  because the leg runs to DAYCAP 140 with 6/8 surviving to the cap —
  the prereg's own lived-days guardrail confirms this regime (132.5 vs
  control 123, HOLD). The +30% fight counts move the same direction for
  the same reason (more lived days → more fights). No anomaly in the
  game code.
- **Baseline NOT rolled forward.** The baseline file records no provenance
  (which run/daycap produced 468), and silently rebasing the reference
  on a regime difference would hide the comparison. Rolling it to
  {316, 231, 1060} is a coordinator decision, not an automatic step.
  (Two earlier LOUD readings were instrument mistakes of mine, not
  signals: a quoted `~` that never expanded, then a glob of all 96
  JSONs whose non-trust files lack the metrics entirely.)

## Infrastructure notes (for the parent)

- **VM restart at ~07:19Z** (`uptime` 1 min when checked 07:20:56Z):
  killed the first gate run (SIGTERM after ~3.5 min, 77/344 scripts done,
  no failures visible in the partial log) and the hbloop (pid 25541).
  Recovered per AGENTS.md: hbloop restarted with setsid nohup
  (new pid 2024), manual heartbeat landed 07:22Z (`heartbeat
  journey-scale`, exit 0), gate relaunched in background
  (proc_4e6a406450a6, started ~07:23Z). No work lost — the commit was
  already landed and the index repaired before the restart.
- **Index clobber on commit:** after `safe-commit.sh` created
  `5ec9c8d25`, `git status` showed the 5 new files as staged-deleted and
  `convo-wants.js` as MM. Repaired with the documented recipe
  (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); status clean, diff HEAD empty, commit verified
  (6 files, +15/-1 on convo-wants.js).
- **Merge not yet done at note time:** it waits on the gate result.
  Branch `journey-scale` is at `5ec9c8d25` on base `0d925556a`.

## Commit

- `5ec9c8d25` — "journey-scale r246: scale leg panel (seeds 103881–103888)
  + want-menu react wind-down fix [needs-eyes]"
  (driver + analyzer + analyzer proof test + react-exhaustion proof test
  + prereg + convo-wants.js fix).

## Evidence paths

- Run note: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-20/journey-scale-r246.md`
- Prereg (committed): worktree `evidence/2026-11-20/journey-scale-r246-prereg.md`
- Analysis: `.../evidence/2026-11-20/journey-scale-r246-analysis.txt`
- Pilot log: `.../evidence/2026-11-20/journey-scale-r246-pilot-b.log`
- Panel log: `.../evidence/2026-11-20/journey-scale-r246-panel-b.log`
- Gate log: `.../evidence/2026-11-20/journey-scale-r246-gate.log`
- Analyzer proof test: worktree `scripts/test-journey-scale-r246-analyzer-20261120.js` (138 pass)
- Fix proof test: worktree `scripts/test-convo-react-exhaustion-r246-20261120.js` (seeds 7/42/99 green)
- Telemetry rows: `.../evidence/2026-11-20/journey-scale-r246-telemetry-row-*.json`

## Adoption addendum (worker 32152056, 2026-11-20 ~08:15Z)

- Run verified dead before adoption: coordinator agent done, no WT_RUN_ID
  process, orphan hbloop PID 2024 killed by exact PID. Registry heartbeat for
  journey-scale re-stamped by the adoption worker until session end.
- Panel numbers verified against the analyzer output itself
  (`journey-scale-r246-analysis.txt`), not just this note: national 0/8,
  lesser seat 8/8, full seat 0/8, wave-4 fights 231, kills 27, wave-5 faced
  2/8, stall 1/8 seeds (15d), survival 6/8. Verdict QUIET stands.
- Proof tests re-run by the adoption worker on the rebased branch tip:
  analyzer 138/138, react-exhaustion PASS (seed 7). Fix confirmed in the
  branch diff (`src/js/convo-wants.js`, `convoWantMenu` drops `dlg:react`
  at reactDryCount >= 2); commit message carries `[needs-eyes]`. No phone
  check done — phone verification still owed.
- Fresh gate (adoption, 2026-11-20 ~08:02–08:13Z): `node scripts/check.js
  --quick` in the worktree, **339 passed, 5 failed in 659s**, log
  `evidence/2026-11-20/journey-scale-r246-gate-adoption.log`. Failures are
  exactly the standing set — measurement-proof staleness pair
  (`test-measurement-proof-update.js`, `test-measurement-workflow.js`),
  phone-frame stale receipt (`test-phone-frame-proof.js`), deed-attainment
  120s timeouts (`test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js`). **0 attributable.** The run's
  own gate was 337/7; its two extra 120s parallel-load flakes
  (`test-occupation-panels.js`, `test-trust-observer-neutrality.js`) did
  not recur on the fresh run.
- Telemetry LOUD line (`maxGameDay` swing) stands as investigated: leg-length
  regime difference, not a defect. Baseline NOT rolled forward.
- Master had moved at adoption time (0515Z adoption landed `59711ccc5`
  during the fresh gate); branch rebased onto current master before merge,
  proofs re-run after the rebase.
