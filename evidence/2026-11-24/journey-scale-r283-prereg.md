# journey-scale r283 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261124T1408Z` (lock run_id).
**Run:** scheduled Tue 2026-11-24 07:45 CST (2026-11-24 13:45Z).
**Rotation read 3 → leg 3 SCALE.** Rotation 3→0 written at closeout
with read-back (next run gets leg 0 landing). Rotation-race note:
r279 wrote 3→0, but the file read 3 again at this run's start —
r282 deepening's closeout wrote 2→3 after r279, so 3 is the last
writer's value and scale is legitimately up next; no race this time.
(r280 establishment's closeout DID land — commits e689d4312 +
16b4fe007 on master; its note's PENDING was note-commit-time
status only. See also the r281 orphan note below.)
**Base:** local master `ef0872bfc` at registration.
**Pre-flight:** main tree clean (0 dirty), disk 50%. `git pull` —
already up to date. No lock existed; lock created 14:08:32Z (run_id
above) before any work. `worktree-reap.sh` ran; 13/16 trees active,
dirty trees belong to other owners (fleshout-loop, lane B) — left
alone. Registration took ~4.3 min under load (registry/index-lock
contention, same shape as r272/r275/r276/r279); heartbeat loop
`journey-scale-r283-hbloop.sh` (setsid/nohup, every 10 min) started
at registration; first registry beat 14:14:59Z, ticking.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs), zero `src/js` change unless the
one blank this run fills needs it — and then only that blank's fix.
**TEST WITH ENCOUNTER GEAR (Steve 2026-11-13):** the policy fights with
the party and gear the competent player has by the leg — the muster/march
steps are that policy, not a fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01) + ROOT-CAUSE FIRST (2026-10-16):**
this is a PLAYTEST leg, not a lever round. This run plays the leg on
current master and judges reachable/fun/winnable.
**Time-box (stated up front):** soft stop ~17:10Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit.

## LOUD — r281 establishment orphaned (found this run, before the panel)

Lane A run **r281 (establishment)** is dead with its work lost: its
gate completed (339 passed, 5 failed in 1017s — same standing set
shape as r279/r280) but there is no run note, no prereg, no driver,
no analyzer, no corpus, no merge commit, no worktree, and no branch
for it anywhere in the repo or goal hidden_files (only 4 files
survive: hbloop.sh, hb.log, gate.log, gate.KILLED-restart-1129Z.log
under hidden_files/evidence/2026-11-24/). Last heartbeat 11:53:59Z,
last gate-log write 11:47:55Z, no r281 process alive, no lock held.
Its gate was killed once and restarted at 11:29Z. The reflog shows
no r281 merge; the last journey-establishment merge is r280's
16b4fe007 at 12:00:20Z. What r281 was testing (its blank, its seeds,
its policy) is unrecoverable — no prereg was ever written. This run
does NOT attempt to reconstruct r281; the next establishment run
re-covers the leg. The orphan is recorded here and in the run note so
the loss is visible, not silent. The overlap guard is satisfied for
this run: r281 holds no lock, no live heartbeat, no worktree.

## Standing context (read before scoring)

- **r279 scale (landed 2026-11-24):** QUIET — national 0/8, lesser
  8/8, full 0/8, wave-4 fights 99 / kills 25, wave-5 faced 2/8,
  killed 1/8, survival 5/8, lived-days mean 130.6 (control 123,
  +6.2%, HOLD). Blocker taxonomy: COLLAPSE 3, FORMATION-FEW 3,
  FORMATION-LATE 2. **Muster MOVED under the corrected hold:**
  called 6, fought 5, slain 5 (r276's 1 slain was measured under the
  wrong hold — see r279 prereg correction). **Stand-down VACUOUS**
  third straight band (0 firings). **Departname GO** (161 depart
  beats, 0 descriptors; r276 baseline 2/98). WINPLAN: 161 departures,
  trios=0, quads=0 — eighth run running. Tribute DELIVERED 1/8;
  tribute-delivery stall fired again (106323 stalls d132–139 starting
  on its delivery day). People check PASS; orphaned invite line 1/15
  talks (carried flat spot). Gate 339/5, 0 attributable. Telemetry:
  3 LOUD lines, r251 regime artifact; baseline NOT rolled.
- **r282 deepening (landed 2026-11-24):** matched re-panel vs r278,
  109303 bisect (rearm-witness + worngun-reseat move it), Q6
  seed-isolation wrapper + proof.
- **r280 establishment (landed 2026-11-24):** urgent favor-cancel
  sorts first in the sitting menu (conversation.js +12,
  convo-wants.js +37) [needs-eyes]. Gate GO 339/5.
- **r278 deepening (landed 2026-11-24):** Q1 GO (12 growth calls,
  0 bad). Q2 wave-5: **0/8 unlocked**. Wave-4: 44 fights / 8 kills;
  **w4killsKnown=3 — first time above 0**. Titan 7/8 seeds, slain
  4/8. WINPLAN: 209 departures, trios=0, quads=0 — seventh run
  running. **Determinism drift (major finding):** outcomes are
  position-dependent within one process — panels remain comparable
  only with identical seed order/config.
- **r277 establishment (landed 2026-11-23):** warn-heed latch reset
  per sitting (WARN-HEED GO).

## Base delta vs r279's base `4e9120c2c` (src/js, 6 files, +242/−5)

Live behavior changes (from `git log 4e9120c2c..ef0872bfc -- src/js`):
- `win-plan.js` +28 — **sim-departteach-a: departure beat teaches
  companion names via overheard channel** [needs-eyes]. LIVE:
  a depart beat now teaches the companion's true name to overhearers.
  **CORRECTION (this run, code-read, not a panel result): the
  departteach watch is VACUOUS on this driver.** The teach calls
  `revealName(tVid, 'overheard')`, and `revealName` returns false
  once `systemArrived` (game.js guard; win-plan.js says the teach
  "can only fire in the pre-System window"). The scale window
  (d80–140) is post-System — the System arrives in act 0 — so the
  teach can never fire here and a teach count would be 0 by
  construction, the same trap as REARM/CELLGATE. The fix's proper
  read is its own staged panel (already GO) and pre-System legs
  (landing/establishment). The analyzer states the gate state instead
  of counting zeros. The descriptors bar stays 0 (r279: 0/161).
- `villager-brain.js` +127 — **sim-holdspeak-a: held departures
  speak — hold verdicts voiced with the real reason, once per
  holder-day** [needs-eyes]. LIVE: a held departure now says why it
  is held, in the holder's own voice. Q4 watch: do held-departure
  lines in scale transcripts speak a real reason (not a generic
  hold)?
- `contests.js` +19 — **sim-worngun-reseat-b: contest grantWeapon
  returns the displaced worn gun to the pack** (GO: destroyed 2→0,
  village gun totals 16→18). LIVE: guns stop being destroyed by
  contest grants. Descriptive: village gun totals on the panel
  (r279 did not report gun totals; no bar, record the number).
- `conversation.js` +12, `convo-wants.js` +37 —
  **journey-establishment r280: urgent favor-cancel sorts first in
  the sitting menu** [needs-eyes]. Q4 watch: does a favor-cancel
  sitting show the cancel first / does the menu read sensibly?
- `contests.js` +22 — **landing r158: contest-end telemetry**
  (`_contestDie` / `_contestRefuse` / arena-loss now emit
  `contest_end`; ledger closes; r155 duel defect). Instrument only.
  Q5 watch: no duel-defect recurrence (contest_end emitted, ledger
  closes).
- `build.js` +2 — version churn only.
- No src/js in the sim-linkform-b / sim-bloodcluster-b /
  sim-winnability-round-1030 / sim-scale-onramp-round-1115 deltas —
  instrument, corpora, panel, evidence only. No other live game
  change in base.

## Seed-band freshness

- **Band: FRESH 106328–106335. Probe seed: 106336 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- Searched (read-only): repo `evidence/**/*.md`, `docs/`,
  `scripts/**/*.js`, goal `hidden_files/**/*.md`, perseed corpus
  filenames, plus the 5 files naming forbidden/contaminated bands
  (`evidence/2026-10-25/sim-preserveact-b.md`,
  `evidence/2026-10-28/sim-shoutgate-a-prereg.md`,
  `evidence/2026-11-01/sim-fullseat-recheck-a-prereg.md`,
  `evidence/2026-11-01/sim-scale-onramp-round-0615.md`,
  `evidence/2026-11-01/sim-trajband-a-prereg.md`) — **0 hits** for
  any of 106328–106336 in every scope. The single .md mention of
  106328 is r279's prereg line 168 ("0 hits for any of 106319–
  106328") — a search-range endpoint, not a reservation.
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18); 106259–106267 spent (r250); 106268–106276 spent (r251);
  106277–106285 spent (r273); 106301–106308 SPENT by
  sim-reseedexpiry-b (Nov 20 prereg); 106310–106318 SPENT by r276;
  **106319–106327 SPENT by r279** (panel 106319–106326 + probe
  106327); 106328–106336 is the next clean 9-block (panel
  106328–106335 + probe 106336).

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244–r251 control policy verbatim (below), 8 fresh seeds 106328–
  106335, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (**phantomDays5** — days the readiness gate holds the village at
  the t5−1 cap; the stall finding rests on this measure ONLY, judged
  on the per-day split — stalled-while-ready vs stalled-while-not-ready),
  survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r279-observed set {COLLAPSE, FORMATION-FEW, FORMATION-LATE}
  plus the carried set {TRUST-LOW, NATIONAL, SNAP, RUNG,
  RUNG-HORIZON}), OR a taxonomy miss (UNKNOWN), OR a fixable defect
  in the table-approach path. Else QUIET — the wall stands as
  measured and the finding is the blocker taxonomy.
  RUNG was first observed in r251 (where it fired INTERESTING as a new
  class); RUNG-HORIZON is the named r251 horizon artifact (106273) —
  a rung completed on the final recorded day, whose national flip had
  no day to land on. Neither fires INTERESTING again by itself.
- **Q2 — BLOCKER TAXONOMY (measurement, NOT a gate) + wave-5/party
  sizes (descriptive) + THE STAND-DOWN MEASUREMENT:** per seed, the
  blocker class for the 3rd seasoned link on the closest road
  (FORMATION-LATE / TRUST-LOW / SNAP / COLLAPSE / FORMATION-FEW /
  NATIONAL / RUNG / RUNG-HORIZON / UNKNOWN), from the analyzer's
  carried section. Wave-5 in the scale window: faced/killed per seed,
  party sizes on wave-5 fights; **win-plan departure sizes (pairs vs
  trios vs quads vs 5+) from the winPlanEnd snapshot** — does the
  ninth run running produce a trio (r279: 161 departures, 0 trios)?
  **Stand-down band-wide (descriptive, the fix is already proven —
  this asks whether it HOLDS):** muster-hunger events per national
  seed vs r273's unfixed 251 on its one national seed; national days
  held per national seed (r273 unfixed: 45, lapsed d115); any national
  lost to a fruitless march (stand-downs fired / re-call cooldowns
  held / fruitless march days per seed). **Departname watch (bar 0):**
  the analyzer counts stranger descriptors in depart beats across
  the panel band (r279: 0/161). **Departteach is NOT watched:** the
  teach is a post-System no-op (see Base delta correction above), so
  no teach count is printed on this driver. The re-arm and CELLGATE
  watches are NOT added: both mechanisms are env-gated off on this
  driver (see r279 prereg correction), so their panel counts would be
  0 by construction.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch:
  march fights fled at full HP counted; the wave-4 fight slide watch
  (231 → 168 → 101 → 62 → 82 → 85 → 52 → 47 → **99** across r246–
  r279): r279 broke the slide upward; **if this band is also <60 WITH
  no early collapses, the next run asks whether spawn/engagement
  changed on master**. Coalition-reach (9-blade shape) reported
  descriptively. DOWNEDTWICE watch (no recurrence in r273/r276/r279
  — keep watching). GONE-BEARER watch (r272 fix — a dead bearer's
  joint run urged as finishable in a scale transcript is a
  recurrence). TABLE-DRY watch (r268 fix — a dry table beat in a scale
  transcript is a recurrence).
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (count 6 so far — count
  up), tell-me-more echo, searcaster-volley narration, departbeat
  (now with TRUE NAMES — the departname fix's second scale-window
  read), warn_you heed (r277
  latch reset: does a FRESH sitting's first heed warn again?).
  **NEW — holdspeak watch:** held-departure lines must speak the
  real reason (the live holdspeak-a behavior) — a generic hold line
  in a scale transcript is a recurrence to note. **NEW — menu-priority
  watch:** a favor-cancel sitting must show the cancel first (the
  live r280 behavior). Carried items: orphaned invite LINES in raise
  talks (r279: 1 line / 15 talks), 90% modal raise opener, NV 3-nod
  flat spot. NEW: debt-label anchor — a repay sitting labeled 'that
  debt' must anchor on the ledger favor (a closer declaring a broken
  favor settled is a recurrence of the r274 wild case).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)? **NEW —
  worngun-reseat descriptive:** village gun totals at panel end
  (its panel: 16→18). **NEW — contest-end telemetry watch:** no
  r155-duel-defect recurrence (contest_end emitted, ledger closes).
- **Q6 — DIALOGUE WATCH (carried):** the r250-recorded flat spots —
  the NV 3-nod cycle (My ×3; Somchai/Tariq walk-then-nod), the "come
  see what I found" payoff shrug (orphaned), orphaned invite lines in
  raise talks, the r239 "tell me more" echo, closing-line duplication
  count 6. A dialogue-content fix belongs to this run only if it is a
  blank this run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244–r251 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
`COMPETENT_ROUTE_AROUND=1` for the march walk only, restored after.
**The r273 fruitless-march stand-down is IN the driver (7 fruitless
march days → stand down + 30-day re-call cooldown) — it is the r273
blank fix being measured band-wide, not a new lever.** No gate,
threshold, price, or bar changed — the march is policy, the competent
player driving existing game verbs.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106328–106335.
Pilot: seeds 106328–106330 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict). **Pilot gate
addition (r279, from the r276 deviation): the pilot's muster JSON must read
`musterHold: sitting` — if it reads `active`, the run was invoked
without the env var; STOP, fix the invocation, re-run the pilot.**
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. The
leg's blocker taxonomy needs 8 seeds, the standing-199 question is
live, the homebody-handoff party-size question needs 8 seeds, the
stand-down fix needs 8 seeds, and the panel costs ~20 min. The pilot's
interestingness gates nothing except the instrument gates above.
**Position-dependence (r278 finding):** the panel runs the 8 seeds in
ascending order in one process, same policy, same driver shape as
r279 (r276 order shape) so the panel stays comparable to r279; do not
reorder seeds or split the panel across configs mid-run.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r283-20261124.js`, cloned from r279):
  seeds 106328–106335, corpus tags r283, EVIDIR 2026-11-24, single arm
  B only. No behavior change from the r279 control (stand-down carried).
- Analyzer (`scripts/analyze-journey-scale-r283-20261124.js`): cloned
  from r279; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above, with the r279-observed set). Q2/Q3/Q4/Q5 carried
  verbatim (paths r283) + the stand-down section (muster-hunger events,
  national days held, stand-downs fired, fruitless march days) + the
  departname watch (stranger descriptors in depart beats, bar 0;
  r279: 0/161) + the NEW worngun-reseat descriptive (village gun
  totals, from the driver's new end-of-seed gun census).
  The re-arm / CELLGATE watches are NOT in the analyzer: both
  mechanisms are env-gated off on this driver (see r279 prereg
  correction), so the analyzer states the gate state rather than
  counting zeros.
- Proof test (`scripts/test-journey-scale-r283-analyzer-20261124.js`):
  cloned from r279's; panel cases carried (58/70/71 as written).
  **Run BEFORE the panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r279
  control prior (0/8) and the r273 control prior (1/8): a single flip
  is noise; three is a movement.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is carried from r251: phantomDays5
  (vetbar shadow5 > readiness5 days) is the instrument's own record
  of the hold, read as stall days per seed — PLUS the per-day split
  adopted in r251 (stalled-while-ready = that day's own r5 ≥ 2). The
  stall finding rests on phantomDays5 ONLY, judged on the per-day
  split; the seed-level peak split is invalid as written and is kept
  in the analyzer only for continuity, labeled invalid.
- The vetbar duplicate-day quirk (r247: every seed records some days
  twice; stall total overcounts by ~1 day band-wide) is carried as a
  known instrument quirk; the metric is judged as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
- The wave-4 fight slide (231 → 168 → 101 → 62 → 82 → 85 → 52 → 47
  → 99) is the carried watch item: r273 decomposed its 52 as
  composition (early collapses, flat per-survivor rate). If r283 is
  also <60 WITH no early collapses, the next run asks whether
  spawn/engagement changed.
- Orphaned invitations are counted as invite LINES per raise talk
  (r279: 1 line / 15 talks; r273: 4 / 11).
- **Stand-down measurement (carried):** the fix is proven on one seed
  (r273: hunger 251→52, national 45→70 days); r276 measured it
  VACUOUS band-wide (0 firings), r279 VACUOUS again (0 firings).
  This panel measures it band-wide descriptively again. A national
  seed losing national to a fruitless march on the FIXED driver would
  be a fix failure, not a QUIET data point — judge it in the run note,
  not by the Q1 bar.
- **Tribute-delivery stall (watch, from r273):** the stall
  starting on the tribute-delivery day (veterans leave, readiness
  drops below the bar) — watch whether tribute delivery
  systematically stalls readiness this band (fired r273 and r279).
- **Departname watch:** the analyzer counts stranger descriptors in
  depart beats; the bar is 0 (the staged proof showed 21→0; r279
  held 0/161). A non-zero count is a regression of the fix, not a
  descriptive note.
- **Departteach watch (correction):** the teach is a post-System
  no-op (revealName guard), so no teach count is printed on this
  driver — the analyzer states the gate state. The fix's read is its
  own staged panel + pre-System legs.
- **Position-dependence (from r278):** panels stay comparable only
  with identical seed order/config. This run's seed order is the r279
  order shape (ascending band order, single process, same policy). Any
  mid-run re-run that changes seed position must be recorded as a new
  config, not folded into the panel.
