# journey-landing r115 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261107T1543Z (scheduled 09:45 CST 2026-11-07, started ~15:43Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@b667f5a4f at worktree registration (master moved 7b8ee24bd →
b667f5a4f during pre-flight — Loop B round-1430 evidence; the worktree
branches from the fresh tip, no stale-base risk, re-verified before merge).
Main tree clean; disk 23%. No lock existed at start. Lock created 15:43Z,
run_id `2026-11-07T15:43:41Z`.
**Seed band 1073–1082 (fresh — see below).**
**Registration:** completed exit 0. Heartbeat at registration + ~10-min loop
(one brief EPERM flap ~16:00Z refused a heartbeat write; retried, landed
16:01:10Z — last good heartbeat before it 15:58:12Z, never near the 15-min
staleness threshold).
**Numbering note:** the Lane A counter is global across legs; r114
(deepening) was last, so this run is r115. The last landing run was r113.
Driver: scripts/journey-landing-r115-20261107.js (r113 driver verbatim except
seeds 1073–1082, OUTDIR landing-r115, header, and the Q1 instrument fixes
below — driver-only, zero src/js). Analyzer:
scripts/analyze-landing-r104-20261105.js (UNCHANGED; DIR via argv). Practice
analyzer: scripts/analyze-landing-r112-practice.js (UNCHANGED; DIR via argv).
NAV-log classifier: scripts/analyze-landing-r113-navlog.js (UNCHANGED).
Commit-offer: scripts/analyze-landing-r107-commit-offer.js (unchanged).
Fights: scripts/analyze-landing-r115-zerodmg.js (NEW — Q1, replaces
analyze-fights89-20261102.js for this run's zero-DMG question; the r89
analyzer stays untouched and its counts are the back-compat check).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test. The
Q1 fixes are INSTRUMENT-only (driver + analyzer, zero src/js). The Q2 fix is
a one-line DATA change (characterGen.json) with its proof test — see Q2.
**Canon:** docs/CANON.md read at run start. No canon doc covers farewell-line
wording (CONVERSATIONS.md has no winddown/settlement rule) — the Q2 fix rests
on the SENSE-TESTING LAW, not on invented canon; recorded here, not invented.
The Q1 fight work touches the "monster encounters are fought, not rolled"
rule (MONSTER-WAVES.md) only as measurement: the instrument must record
fights honestly.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1073–1082**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for `107[3-9]|108[0-2]` over
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md` returns
  only incidental numbers — "1081" as a food.js line-number reference in
  evidence/2026-10-10/forager-smoke-fuel-attack-20261010.md and "1071" as
  entry HP in evidence/2026-11-06/sim-tbend-a-prereg.md — and zero prereg
  names any of 1073–1082 as panel seeds. A second broad grep over ALL
  `evidence/**/*.md` for word-boundary 1073–1082 found only incidental hits
  (line numbers, kcal figures, function line numbers — e.g. food.js:1081,
  truth.js:1074, "1082.3k" tribute figures). No range "1073–1082" is named
  anywhere.
- No corpus files for these seeds exist (no landing-r114 dir; goal
  hidden_files evidence/2026-11-07 holds landing-r112 and landing-r113 only).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062, 1063–1072 (r113's band, just used).

## Q1 (PRIMARY) — ZERO-DMG FIGHTS: BYSTANDER OR STANDS-THROUGH? (instrument fixes + classification)
**Basis:** r113's watch GREW to 8/20 fights ending won with the scholar
striking 0 times while others dealt all the damage, and r113 explicitly
ordered the next run to "instrument the fight's cause/trigger per the
analyzer's classification before any verdict." This run did the back-compat
work BEFORE the panel and found the question was mis-measured twice — both
instrument bugs, zero src/js:
- **BUG 1 — R82 drops killing blows.** The strike wrapper resolved the
  current fight entry AFTER the strike, but a killing blow ends the fight
  inside tbPlayerStrike (tbEnd sets endResult), so the entry was already
  closed and the strike was lost from the log. Proof on the r113 corpus:
  4 fights carry damage entries sourced 'you' — game.js:37329, inside
  tbPlayerStrike, the ONLY tbDamage call with that label — with 0 recorded
  strikes (1065 d10 youDmg=75, 1066 d17 youDmg=60, 1066 d17 youDmg=91,
  1066 d23 youDmg=53; all end=won). The scholar struck the killing blow
  in at least 4 of the 8 "zero-DMG" fights. The invariant test
  scripts/test-landing-r115-zerodmg-invariant.js FAILS on the r113 corpus
  with exactly those 4 violations (recorded before the panel).
- **BUG 2 — allies undercount.** The driver counted kind 'ally' ONLY, but
  party companions join as kind 'villager' fighters (party.js
  tbHumanFighter(pid,'villager'); the game counts ally+villager at
  game.js:41614). All 8 r113 zero-DMG fights read allies=0 while
  villagers dealt the damage (v_wanjiru_kamau 206, v_hassan_ali 38,
  v_gen_pl2zbrj 53, v_gen_ivbigcz 36, v_gen_7w1ehst 29, v_giulia_bianchi
  84, v_ursula_weber 6; m_0 48 is monster-on-monster damage).
- **Back-compat (r115 analyzer on the r113 corpus, BEFORE the panel):**
  20 fights, 8 zero-DMG, all 8 class others-killed — matches r113's
  fights.txt exactly. Shapes with the corrected taxonomy: U-unknown-no-rounds
  3, B-scholar-stood-through 4, S-struck-0-dmg 1 (Paul d27: 8 strikes, 0
  damage, lost — the scholar fought and could not hurt it, no bystander).
  Triggers: monster-approach 5, pending-face 2, contest-arena 1. The r113
  corpus carries no rounds/turnOrder fields, so its 3 U-shapes stay unknown
  — reported, never re-scored.
**Fix (driver-only, zero src/js):** in the r115 driver, (a) the strike /
monster-turn / damage wrappers capture the current fight entry BEFORE the
call, so a blow that ends the fight still logs; (b) the start snapshot
counts allies as kind 'ally' OR 'villager' and records the villager
fighters' names; (c) the start snapshot records turnOrder (fighter keys in
turn order) and the end snapshot records rounds (f.round) — a 0-strike
fight lasting >=2 rounds is provably one the scholar stood through, not
one that ended before their first turn.
**Analyzer (new, scripts/analyze-landing-r115-zerodmg.js):** classifies every
zero-DMG fight by shape — A allies-before-scholar-turn (strikes 0,
monsterTurns 0, rounds <=1), B scholar-stood-through (strikes 0,
monsterTurns >=1 or rounds >=2), S struck-but-0-dmg (strikes >0, dealt 0),
U unknown-no-rounds (old corpus only) — with trigger class (r89 classifier
verbatim), pendingFace, allies + villager names, scholar turn position and
allies-before-scholar, killer sources (damage by sourceKey/sourceLabel),
scholar damage taken, end result. The r89 class split is reproduced on the
r113 corpus (8/8 others-killed) as the back-compat gate.
**Pre-registered metric (binding):**
- The invariant test scripts/test-landing-r115-zerodmg-invariant.js on the
  r115 panel corpus: 0 violations = FIX-WORKS; >=1 violation = FIX-FAILED
  (the driver fix did not hold on live data — stop, adjudicate, no verdict).
- MECHANISM-ESTABLISHED if one shape (A/B/S) covers >=80% of the panel's
  others-killed fights; otherwise MECHANISM-OPEN with the split reported
  and no verdict claimed. The shape split, trigger split, and killer
  sources are reported for every others-killed fight either way.
- The panel's others-killed count is reported against r113's 8/20 — if the
  killing-blow fix removes the U-shape entirely, the count falls and the
  r113 watch is re-based, not re-scored.

## Q2 (SECONDARY) — MIRIAM CLOSING-LINE FIX (data, one line, proof-tested)
**Basis:** r111 first sighting, r113 second (seed 1071 Celestin): a sitting
closes "Good. That's settled, then. Onward." while the want's resolution is
'unresolved'. Mechanism established this run: the line is a generic goodbye
from the `steady` exit pool in src/data/characterGen.json (convo.exits,
steady[4]), and the goodbye picker (conversation.js ~7079, endConvo path)
draws blind to thread state. The honest settlement beat already exists
separately (convoCloseLine, fires ONLY when a thread was genuinely closed
this conversation). So no exit-pool line may assert settlement.
**Fix (data only, zero code):** reword the one line to "Good talk. Onward,
then." — pool size unchanged (8), voice kept, no other line touched.
**Proof (before/after, both run before the panel):**
- scripts/test-landing-r115-miriam-line.js scans all 96 exit lines in all 12
  temperaments for /settled/i and asserts the steady pool keeps 8 lines.
  BEFORE (unfixed data): FAILS — exactly 1 settled-asserting line, the
  steady-pool line. AFTER (fixed data): PASSES — 0 settled-asserting, steady
  pool intact at 8. characterGen.json re-validated as JSON after the edit.
- The panel is the live check: any sitting closing with a settlement claim
  on an unresolved want is a fresh defect, reported, not chased by changing
  the panel.

## Q3 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed (adopted r113, >=3-turn rule): never-offered <=1 sitting on
  >=8/10 seeds; report the unfiltered count alongside; transcript
  adjudication of every never-offered sitting remains the backstop.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) >=80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110). If a picked-but-stage-1 case ever appears with a
  non-'want' thread, that single case reopens it.

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r113: GOAROUND-WEAK (2/3 kcal, 66.7%; the one non-arrival rescued by the
ladder, R85 3/3). Carried as a regression check.
**Pre-registered metric (binding):** M7-r115 kcal: arrived / kcal-skips >=80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r113: DOORSTEP-GO (279 checks, 4 triggered, ate 4). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E
scholar starvation deaths; 0 triggered steps ending enterResult===false).

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-five runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r113 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.
- **Q2 PRACTICE (standing instrument):** r113 proved movement repeats (94
  attributed cells d1→d28, 10/10 seeds; first movement outside chores: fish
  6, forage 1, garden 1; specialist/foodXp 0→positive still 0). This run
  reports d1→d14 and d1→d28 side by side; GO if >=1 attributed moved cell
  pooled. Watch: hunt/forage/fish/scout/patrol moves; specialist/foodXp
  0→positive; funnel numbers vs r113.
- **NAV-log classifier (standing instrument):** any GENUINE "(no line)" is an
  investigation item; panel must show THEM: (no line) == 0 with menu:more
  picks > 0 and NAV: lines == menu:more picks.

## Watch items (not verdicts)
- **Ally-accompanied hunt fights (Q2 retired r111):** r113 found 0 in 20
  fights by the OLD allies count — the count was under-measured (kind
  'villager' missed). With the fixed count this run re-bases the watch:
  report villager-accompanied fights (allies>0 at start) fresh; do NOT
  compare against r113's 0.
- **R73 NARROW-PATTERN:** r113 promised=12, askedOnly=21, outOfWindow=1, all
  12 NARROW, keptInsideNarrow=5. Design input, carried.
- **R66 HUNGRY horizon pantry + starvation deaths per seed:** r113 8/10
  HUNGRY with 0 starvation deaths. Report starvation deaths per seed
  alongside the gate.
- **Mantle latency (owed item, r107 seed 1009):** r113 latencies [0, 1, 1];
  the 2-day latency is NOT reproduced a third panel running. Watch whether
  any r115 mantle pass exceeds 1 day.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 26.2
  (r113) after 27.9 (r112) → 18.8 (r111) → 20.6 (r110) → 28.5 (r109). Seed
  mixture, not a trend. Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a
  famine the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107–r113). Re-proving the staging adds
  nothing (DELIVER OVER MEASURE).
- **Eamon fallback (standing line):** r113 had 0 starvation deaths, so 0
  STARVATION lines live. A future famine panel exercises it live.
- **Other drivers share the "(no line)" logging:** scripts/convo-probe-*.js
  and the journey-deepening drivers use the same `${r0.line || '(no line)'}`
  pattern. This run fixes the landing driver only; the other drivers are a
  follow-up, not this run's scope.
- **Context (not this leg's work):** the self-improvement-drive build is
  built and tested but not yet merged; the one-brain program proceeds
  elsewhere (build-brain-p1 active). This run measures master as-is; no
  action here.

## Seeds, pilot, shape
- Panel: fresh seeds 1073–1082, DAYS=28, OUTDIR landing-r115 (goal hidden_files
  evidence/2026-11-07/).
- PILOT FIRST: 3 seeds (1073–1075) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1073+), (b) the practice snapshots present
  in census JSON (d1/d14/d28, non-null competence maps), (c) the Q1 fix on
  real output: the new fields present in census fights (rounds non-null,
  turnOrder array, villagers array) AND >=1 fight with a recorded strike,
  (d) the invariant test's before-proof recorded on the r113 corpus (4
  violations — done pre-pilot), (e) >=1 hunt fight. If the pilot shows 0
  hunt fights, document and still run the panel only if the carried bindings
  need the panel — the pilot decides; do not burn a full run on a dead
  question.
- Shape: proof tests (Miriam: before-FAIL/after-PASS on live data; invariant:
  before-FAIL on the r113 corpus) + back-compat analyzer run on the r113
  corpus (8/8 others-killed, shapes U:3 B:4 S:1) BEFORE the pilot; pilot
  validates the new instrument fields on real output before the panel
  expands; the invariant test re-runs on the r115 panel corpus as the
  after-proof.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
