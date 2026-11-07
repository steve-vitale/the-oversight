# journey-landing r113 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261107T0559Z (scheduled 05:45 CST 2026-11-07, started ~12:00Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@0d63b5985 at worktree registration (master moved 5198d1056 →
0d63b5985 DURING pre-flight — the ship loop landed sim-winnability-round-1021
adoption evidence; the worktree branches from the fresh tip, no stale-base
risk, re-verified before merge). Main tree clean; disk 27%.
**Seed band 1063–1072 (fresh — see below).**
**Registration:** completed exit 0 in ~3 min (reap + checkout). Heartbeat at
registration + 10-min loop.
**Numbering note:** the Lane A counter is global across legs; r112 (landing)
was last, so this run is r113. The last landing run was r112.
Driver: scripts/journey-landing-r113-20261107.js (r112 driver verbatim except
seeds 1063–1072, OUTDIR landing-r113, header, and the Q1 NAV-log fix below —
driver-only, zero src/js). Analyzer:
scripts/analyze-landing-r104-20261105.js (UNCHANGED; DIR via argv). Practice
analyzer: scripts/analyze-landing-r112-practice.js (UNCHANGED; DIR via argv).
NAV-log classifier (new): scripts/analyze-landing-r113-navlog.js.
Commit-offer: scripts/analyze-landing-r107-commit-offer.js (unchanged).
Fights: scripts/analyze-fights89-20261102.js (unchanged).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test. The Q1
fix is INSTRUMENT-only (driver + classifier, zero src/js) — see the basis for
why the game needs no change. The Q2 instrument is driver-only (zero src/js).
No game-code change is planned.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1063–1072**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `106[3-9]|107[0-2]` over
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md` returns
  only incidental numbers — "1066" as a day/entity reference in
  evidence/2026-10-30/sim-spawnhp-a-prereg.md and "1071" as entry HP in
  evidence/2026-11-06/sim-tbend-a-prereg.md — and zero prereg names any of
  1063–1072 as panel seeds. Forbidden-band lists: no hits.
- No corpus files for these seeds exist.
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062 (r112's band, just used).

## Q1 (PRIMARY) — THE "(no line)" IS NAVIGATION, NOT SILENCE (instrument fix)
**Basis:** r112's note flagged "(no line)" on [menu:more] as a polish blank
(Yousra 6x in 17 turns; Eduardo 2x). This run adjudicated the mechanism BEFORE
writing the fix, and the game is exonerated:
- r112 corpus recount (this run, grep over the r112 transcripts in goal
  hidden_files evidence/2026-11-07/landing-r112/): **86 "(no line)" lines,
  86/86 preceded by a `YOU: [menu:more]` pick — 0 follow any other pick.**
- Mechanism: `convoNextMenu` returns `{navigation:true}` with no `line`
  (src/js/conversation.js; paging a menu is navigation, not a spoken turn),
  and the driver logs every pick's result via `sayThem(r.line)` — a missing
  line prints `THEM: (no line)`.
- The real UI agrees with the game: app.js:13656 — a navigation result just
  refreshes the menu (`chatView.history=false; ... refresh(); return;`). No
  empty bubble, no dead air, no transcript entry. A player paging "More
  things to say" sees the options change — exactly what a pagination control
  should do.
- The defect is the INSTRUMENT mislabeling a pagination tap as an empty
  spoken turn. The r54 precedent (winddown 'more' returning silence) was a
  genuine game fix because 'more' is a SPOKEN choice; menu:more is not.
**Fix (driver-only, zero src/js):** in the r113 driver, when `convoTurn`
returns `navigation:true`, log `NAV: [menu:more] <label> — menu paged, no
spoken line` and skip `sayThem`; count `MET.navTurns`. The opening-path
`sayThem` (startConvo line) is UNTOUCHED — a genuinely empty opening line
still logs "(no line)", as it should. Turn budget UNCHANGED: a menu page
still consumes one loop iteration (the player spends a tap; the r56 sweep +
12-turn cap already bound paging) — recorded as a follow-up observation, not
a change, so sitting dynamics stay comparable with r112.
**Classifier (new, scripts/analyze-landing-r113-navlog.js):** scans transcript
files in a dir, tracks the last `YOU:` pick id, and classifies each
`THEM: (no line)` as NAV (preceded by menu:more) or GENUINE (any other pick
or none); counts `NAV:` lines and menu:more picks.
**Pre-registered metric (binding):**
- Proof test scripts/test-landing-r113-navlog.js (synthetic fixtures, runs
  the REAL classifier): menu:more→(no line) = NAV; ask:gossip→(no line) =
  GENUINE; a (no line) with no preceding YOU = GENUINE; `NAV:` lines counted;
  menu:more picks counted. All cases pass BEFORE the pilot.
- Back-compat run of the classifier on the r112 corpus (BEFORE the panel):
  navNoLine=86, genuineNoLine=0. Any other split is a REGRESSION in the
  classifier — stop and adjudicate before running the panel.
- On the r113 panel: `THEM: (no line)` lines == 0 AND menu:more picks > 0
  AND `NAV:` lines == menu:more picks (every page turn logged as NAV, none
  as THEM). A miss is NO-GO, never re-scored.

## Q2 (STANDING) — PRACTICE: DOES THE MOVEMENT REPEAT, DOES HUNT/FORAGE EVER MOVE?
**Basis:** r112 proved practice moves competence in 28d (82 attributed cells,
10/10 seeds) but ONLY chores (stone 27, wood 22, water 16, deadfall 9, cook
8) — hunt/forage/fish/scout/patrol/garden/tend/teach/mend: 0. Specialist /
foodXp 0→positive: 0. The practice snapshot is now a standing instrument.
**Instrument (unchanged):** practiceSnapshot d1/d14/d28; analyzer r112
verbatim with DIR arg.
**Pre-registered metric (binding):** movedCells(d1→d28) pooled, attributed
as in r112. GO if ≥1 attributed moved cell on the panel; NO-GO if 0. Report
d1→d14 and d1→d28 side by side (r112 metric-review proposal, adopted — mover
deaths shrink the d28 count). Watch (reported, not judged): hunt/forage/
fish/scout/patrol moves; specialist/foodXp 0→positive; npcSkills gained;
funnel numbers vs r112 (planSeeds, partyWaits, partyFights, monster kills,
starvation deaths per seed).

## Q3 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed: **ADOPT the r112 metric-review proposal this run** — count
  only sittings with ≥3 turns toward the per-seed bar (never-offered ≤1
  sitting on ≥8/10 seeds); report the unfiltered count alongside; transcript
  adjudication of every never-offered sitting remains the backstop. (r112's
  6/10 miss was driven by 5 probe-left-early sittings; the proposal was
  deferred to this run for adoption or refusal — adopted, stated here before
  any seed runs.)
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110 closed the thread-gate question — withdrawn-want
  deflection, n=8 pooled after r112). If a picked-but-stage-1 case ever
  appears with a non-'want' thread, that single case reopens it.

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r112: GOAROUND-HOLDS (7/8 kcal, 87.5%; the one non-arrival rescued by the
ladder). Carried as a regression check.
**Pre-registered metric (binding):** M7-r113 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r112: DOORSTEP-GO (280 checks, 2 triggered, ate 2). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E
scholar starvation deaths; 0 triggered steps ending enterResult===false).
Includes the R105-DOORSTEP-DRINK-ENTRY fix.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-four runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r112 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.

## Watch items (not verdicts)
- **Ally-accompanied hunt fights (Q2 retired r111):** r112 found 0 in 21
  fights — the scholar never hunts with allies in the first month. Carry the
  count as a watch: does it stay 0 on this panel?
- **Zero-DMG "others-killed" fights (r112 watch):** 3/21 fights ended won
  with the scholar striking 0 times while others dealt all the damage. Carry
  the count; a repeat is a watch, not a verdict.
- **R73 NARROW-PATTERN:** r112 promised=9, askedOnly=23, outOfWindow=2, all 9
  NARROW, keptInsideNarrow=6. Design input, carried.
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r112 3/10
  HUNGRY with 0 starvation deaths. Report starvation deaths per seed
  alongside the gate.
- **Mantle latency (owed item, r107 seed 1009):** r112 latencies [1, 1] plus
  one honestly unresolved horizon death — the 2-day latency is NOT
  reproduced a second panel running. Watch whether any r113 mantle pass
  exceeds 1 day.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 28.5
  (r109) → 20.6 (r110) → 18.8 (r111) → 27.9 (r112). Seed mixture, not a
  trend. Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107–r112). Re-proving the staging adds
  nothing (DELIVER OVER MEASURE).
- **Miriam closing-line defect (r111, NOT fixed this run):** the wind-down
  closer asserts a want settled ("Good — that foraging help, settled.")
  while the game's own thread label says the want was never finished. A
  src/js conversation fix — needs its own design care; stays flagged for a
  future run.
- **Other drivers share the "(no line)" logging:** scripts/convo-probe-*.js
  and the journey-deepening drivers use the same `${r0.line || '(no line)'}`
  pattern. This run fixes the landing driver only; the other drivers are a
  follow-up, not this run's scope.
- **Context (not this leg's work):** the self-improvement-drive build is
  built and tested but not yet merged; the one-brain program proceeds
  elsewhere (build-brain-p1 active). This run measures master as-is; no
  action here.

## Seeds, pilot, shape
- Panel: fresh seeds 1063–1072, DAYS=28, OUTDIR landing-r113 (goal hidden_files
  evidence/2026-11-07/).
- PILOT FIRST: 3 seeds (1063–1065) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1063+), (b) the practice snapshots present
  in census JSON (d1/d14/d28, non-null competence maps), (c) Q1 on real
  output: 0 "THEM: (no line)" lines AND menu:more picks > 0 AND NAV: lines
  present, (d) the classifier's back-compat run on the r112 corpus done
  pre-pilot (86 NAV / 0 GENUINE), (e) ≥1 hunt fight. If the pilot shows 0
  hunt fights, document and still run the panel only if the carried bindings
  need the panel — the pilot decides; do not burn a full run on a dead
  question.
- Shape: proof test (synthetic fixtures) + back-compat run on the r112 corpus
  BEFORE the pilot; pilot validates the new instrument on real output before
  the panel expands.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
