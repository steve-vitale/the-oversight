# journey-scale r279 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261124T0622Z` (lock run_id).
**Run:** scheduled Mon 2026-11-23 23:45 CST (2026-11-24 05:45Z).
**Rotation read 3 → leg 3 SCALE.** Rotation 3→0 written at closeout
with read-back (next run gets leg 0 landing). Note: r276 wrote 3→0
at its start, but the file read 3 again at this run's start — r278's
closeout wrote 2→3, which is the value this run read; no race this
time (the r272/r275/r278 rotation-race note stands as a standing
hazard: a run that read an older value must not overwrite a newer
write).
**Base:** local master `4e9120c2c` at registration.
**Pre-flight:** main tree clean (0 dirty), disk 44%. `git pull` —
already up to date. No lock existed; lock created 06:23:46Z (run_id
above) before any work. `worktree-reap.sh` ran; 10/16 trees active,
4 dirty trees belong to other owners (fleshout-loop, lane B) — left
alone. Registration took ~11 min under load (registry/index-lock
contention, same shape as r272/r275/r276); heartbeat loop
`journey-scale-r279-hbloop.sh` (setsid/nohup, every 10 min) started
at registration; first beat landed immediately after.
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
**Time-box (stated up front):** soft stop ~09:30Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit.

## Correction — r276 muster-hold deviation (found this run, code + corpus read, before the panel)

r276's prereg and run note both claim `MUSTER_HOLD=sitting`, but
**all 9 r276 corpus seeds (8 panel + probe) record
`musterHold: active`** (`journey-scale-r276-b-muster-<seed>.json`).
Both the r273 and r276 drivers default `MUSTER_HOLD` to `'active'`
when the env var is unset; r273's run passed `MUSTER_HOLD=sitting`
explicitly (its corpus reads `sitting`), r276's run did not — so
r276's panel ran the muster under the arm-A hold predicate (hold
whenever `tableActive()`, mercy window included) instead of the
preregistered arm-B predicate (hold only while a table sequence is
actually live). The deviation went unnoticed in r276's run note.
Consequence: r276's muster/march numbers (called 3, fought 1, slain
1) were measured under a MORE conservative hold than the control
intends — titan fights may be undercounted vs the true control.
**This run passes `MUSTER_HOLD=sitting` explicitly at invocation and
verifies the pilot's muster JSON reads `sitting` before the full
panel runs** (pilot gate addition). Muster/march sub-verdicts are
therefore NOT directly comparable to r276; the Q1 leg verdict
(national / table / wave-4 / wave-5 / stall / survival) remains
comparable as a leg verdict, with this caveat recorded.

## Standing context (read before scoring)

- **r276 scale (landed 2026-11-23):** QUIET — national 0/8, lesser
  8/8, full 0/8, wave-4 fights 47 / kills 12, wave-5 faced 0/8,
  survival 4/8, lived-days mean 110.3 (control 123, −10.3%, HOLD).
  Blocker taxonomy: COLLAPSE 4, FORMATION-FEW 2, SNAP 1,
  FORMATION-LATE 1. **Stand-down measurement VACUOUS:** the r273
  fruitless-march stand-down fired 0 times band-wide (0
  `fruitless-standdown` rows; the 2 `stood-down` rows are the
  pre-existing absent-trigger, musters ending at 3 and 6 fruitless
  days because the herald wandered off first). The fix stays proven
  on its one r273 seed (106282) only. Note for this run: the
  absent-trigger fires first whenever the titan leaves inside a week;
  the fruitless fix only matters for a titan that stays present and
  un-engageable past day 7. People check PASS; orphaned raise-talk
  invite lines carried. Gate 339/5, 0 attributable. Telemetry: 3 LOUD
  lines, r251 regime artifact; baseline NOT rolled.
- **r278 deepening (landed 2026-11-24):** Q1 GO (12 growth calls,
  0 bad). Q2 wave-5: **0/8 unlocked — the wall moved back to
  unlocking** (banked2=0 on all seeds; r275 was 2/8 unlocked, 2/2
  faced). Wave-4: 44 fights / 8 kills; **w4killsKnown=3 — first time
  above 0** (trick knowledge now contributes to kills). Titan 7/8
  seeds, slain 4/8. March-flee recurred as short streaks (flee at
  full HP with a full muster, always ending in a slay). WINPLAN:
  209 departures, trios=0, quads=0 — seventh run running.
  **Determinism drift (major finding):** outcomes are
  position-dependent within one process — a seed run 5th vs
  standalone can flip survival (109305 lost d82 standalone,
  survived to d101 5th in panel); same config reproduces
  byte-identical. Panels remain comparable across runs with
  identical seed order/config; cross-config seed comparisons do not
  measure the seed alone. Filed as a driver-arm item: isolate
  per-seed state before the next band judges cross-config
  comparisons. **This run keeps the r276 seed order/config
  verbatim so the panel stays comparable to r276.**
- **r277 establishment (landed 2026-11-23):** warn-heed latch reset
  per sitting (WARN-HEED GO).
- **r278 crisis (landed 2026-11-24):** sealed-pocket strike,
  sealed-arena no-flee + alt-close, partial-progress flee,
  debt-closer gate + proofs. Conversation.js +11: the DEBT-LABEL
  ANCHOR — a repay sitting labeled 'that debt' anchors on the
  ledger favor (r274 wild case: broken water_haul, recap "Still on
  that debt", closer still declared it settled).

## Base delta vs r276's base `53ae1c2de` (src/js, 10 files, +429/−40)

Live behavior changes (from `git log 53ae1c2de..4e9120c2c -- src/js`):
- `win-plan.js` +65 — **sim-departname-a: departure beats use true
  names, not stranger descriptors** [needs-eyes]. **LIVE**: `beatName`
  helper (5 sites: depart/reseed/expiry/launch/homebody beats) names
  the companion by true first name, never the knowledge-gated
  displayName ("A person, maybe 40s, with deep-set eyes"). Staged
  proof: descriptors 21→0, deaths/launches identical. Q2/Q4 watch:
  do scale-window depart beats name true names (a stranger
  descriptor in a depart beat would be a regression of this fix)?
  **BASELINE (measured this run, r276 corpus, read-only):** the
  r276 panel band spoke 98 depart beats with **2 stranger
  descriptors** (106310: "A woman, maybe 30s sets out with Ethan";
  106315: one "A woman, maybe 40s"); probe 106318 adds a third
  ("A person, maybe 30s, with a farmer's tan sets out with Saul").
  The r279 bar is **0 descriptors on the 8-seed panel band**.
- `corpses.js` +296 — **sim-rearm-b: corpse-transfer re-arm**
  (witness take from a fresh corpse + Haven sweep from a dead
  holder's corpse) + **sim-rearm-witness-b: wild-corpse expedition
  witness channel** (REARM_CELLS=1, channel 'expedition'). The
  witness channel was judged NO-GO in its own pilot (16/16 seeds, 2
  expedition takes, 0 volleys) — live but unfired in the wild.
  **CORRECTION (this run, code-read, not a panel result): the re-arm
  watch is VACUOUS on this driver.** `_rearmCellsOn()` returns true
  only when `process.env.REARM_CELLS === '1'` (corpses.js); the
  journey drivers never set it, so re-arm takes are 0 by
  construction on this panel — the same was true of the r278
  deepening watch, which reported no re-arm result. The analyzer
  states the gate state explicitly instead of pretending to measure
  it. Turning REARM_CELLS on would be a behavior change (a lever),
  not a measurement, and is out of scope for this playtest leg.
- `villager-agency.js` +7, `villager-objectives.js` +6 — the
  rearm-witness expedition hooks (node-match scan, no RNG).
- `conversation.js` +25 — **establishment r277: warn-heed latch
  reset per sitting** (a fresh sitting's first heed warns again) +
  **crisis r278: DEBT-LABEL ANCHOR** (see above). Q4 watches both.
- `convo-wants.js` +31 — **landing r157: M-PR1 commit-menu
  residual** (thread flip). Q4 watches commit-menu threads.
- `fieldFights.js` +13 — **sim-cellgate-floor-b: CELLGATE_FLOOR env
  param** (default 4 = current behavior when unset). No default
  flip. **CORRECTION (this run, code-read): the CELLGATE hold is
  env-gated (`CELLGATE=1`, fieldFights.js) and the journey drivers
  never set it, so the hold line cannot appear on this panel and a
  searcaster firing below wave 4 is EXPECTED here, not notable —
  the r278 prereg's "expect 0" reading was wrong on this driver.
  No CELLGATE watch is added to the analyzer; the hold-line watch
  belongs to the killlootbundle driver, which runs with CELLGATE=1.
- `godverbs.js` +20 — **endgame r275: godBefore capture** (a killing
  blow's god is captured before the blow, so the death-triggered
  Voice collapse fires for the just-died holder). Descriptive watch
  only.
- `game.js` +4 — rearm Haven-sweep hook call. `build.js` +2 —
  version churn only.
- No src/js in the musterask / departsafe-rejudge / launchdiag-a /
  gatehorizon-reprereg-b / cellgate-holdout-b deltas — instrument,
  corpora, panel, evidence only. No other live game change in base.

## Seed-band freshness

- **Band: FRESH 106319–106326. Probe seed: 106327 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- Searched (read-only): repo `evidence/**/*.md`, `docs/`,
  `scripts/**/*.js`, goal `hidden_files/**/*.md`, perseed corpus
  filenames — **0 hits** for any of 106319–106328.
- A first, over-broad `grep -rn` over the raw `evidence/` + goal
  corpus JSON returned hits — ALL false positives of the known kind
  (pantry calorie values, e.g. `"pantry":106319`, inside October
  per-seed JSONs — the same shape r278 documented for 109301–
  109308). The prereg search scope is .md files + filenames, as in
  r276/r278; the raw-JSON hits are not seed reservations.
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18); 106259–106267 spent (r250); 106268–106276 spent (r251);
  106277–106285 spent (r273); 106301–106308 SPENT by
  sim-reseedexpiry-b (Nov 20 prereg); **106310–106318 SPENT by r276**
  (this run's first candidate block, rejected on the .md search);
  106319–106327 is the next clean 9-block (panel 106319–106326 + probe 106327).

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244–r251 control policy verbatim (below), 8 fresh seeds 106319–
  106326, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (**phantomDays5** — days the readiness gate holds the village at
  the t5−1 cap; the stall finding rests on this measure ONLY, judged
  on the per-day split — stalled-while-ready vs stalled-while-not-ready),
  survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r276-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
  FORMATION-LATE, COLLAPSE, RUNG, RUNG-HORIZON}), OR a taxonomy miss
  (UNKNOWN), OR a fixable defect in the table-approach path. Else QUIET
  — the wall stands as measured and the finding is the blocker taxonomy.
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
  trios vs quads vs 5+) from the winPlanEnd snapshot** — the homebody
  handoff is in base: does it move departures off pairs (r276: 98
  departures, 0 trios)? **Stand-down band-wide (descriptive, the fix
  is already proven — this asks whether it HOLDS):** muster-hunger
  events per national seed vs r273's unfixed 251 on its one national
  seed; national days held per national seed (r273 unfixed: 45, lapsed
  d115); any national lost to a fruitless march (stand-downs fired /
  re-call cooldowns held / fruitless march days per seed). **NEW
  watch this run:** depart-beat true names — the analyzer counts
  stranger descriptors in depart beats across the panel band (bar:
  0; r276 baseline 2/98, measured read-only this run). The re-arm
  and CELLGATE watches are NOT added: both mechanisms are env-gated
  off on this driver (see Base delta corrections above), so their
  panel counts would be 0 by construction.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch:
  march fights fled at full HP counted; the wave-4 fight slide watch
  (231 → 168 → 101 → 62 → 82 → 85 → 52 → 47 across r246–r276): r273
  decomposed its 52 as composition (early collapses, flat
  per-survivor rate), not spawn — **if this band is also <60 WITH no
  early collapses, the next run asks whether spawn/engagement changed
  on master**. Coalition-reach (9-blade shape) reported descriptively.
  DOWNEDTWICE watch (no recurrence in r273/r276 — keep watching).
  GONE-BEARER watch (r272 fix — a dead bearer's joint run urged as
  finishable in a scale transcript is a recurrence). TABLE-DRY watch
  (r268 fix — a dry table beat in a scale transcript is a recurrence).
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (count 6 so far — count
  up), tell-me-more echo, searcaster-volley narration, departbeat
  (now with TRUE NAMES — the departname fix's first scale-window
  read), warn_you heed (r277 latch reset: does a FRESH sitting's
  first heed warn again?). Carried items: orphaned invite LINES in
  raise talks (r276: carried; count LINES per raise talk, the unit
  r273's metric review set), 90% modal raise opener, NV 3-nod
  flat spot. NEW: debt-label anchor — a repay sitting labeled 'that
  debt' must anchor on the ledger favor (a closer declaring a broken
  favor settled is a recurrence of the r274 wild case).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)?
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
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106319–106326.
Pilot: seeds 106319–106321 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict). **Pilot gate
addition (r276 deviation): the pilot's muster JSON must read
`musterHold: sitting` — if it reads `active`, the run was invoked
without the env var; STOP, fix the invocation, re-run the pilot.**
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. The
leg's blocker taxonomy needs 8 seeds, the standing-199 question is
live, the homebody-handoff party-size question needs 8 seeds, the
stand-down fix needs 8 seeds, and the panel costs ~20 min. The pilot's
interestingness gates nothing except the instrument gates above.
**Position-dependence (r278 finding):** the panel runs the 8 seeds in
the r276 order/config verbatim (same seed order, same policy, same
driver shape) so the panel stays comparable to r276; do not reorder
seeds or split the panel across configs mid-run.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r279-20261124.js`, cloned from r276):
  seeds 106319–106326, corpus tags r279, EVIDIR 2026-11-24, single arm
  B only. No behavior change from the r276 control (stand-down carried).
- Analyzer (`scripts/analyze-journey-scale-r279-20261124.js`): cloned
  from r276; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above, with the r276-observed set). Q2/Q3/Q4/Q5 carried
  verbatim (paths r279) + the stand-down section (muster-hunger events,
  national days held, stand-downs fired, fruitless march days) + the
  departname watch (stranger descriptors in depart beats, bar 0;
  r276 baseline 2/98). The re-arm / CELLGATE watches are NOT in the
  analyzer: both mechanisms are env-gated off on this driver (see
  Base delta corrections), so the analyzer states the gate state
  rather than counting zeros.
- Proof test (`scripts/test-journey-scale-r279-analyzer-20261124.js`):
  cloned from r276's; panel cases carried (58/70/71 as written).
  **Run BEFORE the panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r276
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
- The wave-4 fight slide (231 → 168 → 101 → 62 → 82 → 85 → 52 → 47)
  is the carried watch item: r273 decomposed its 52 as composition
  (early collapses, flat per-survivor rate). If r279 is also <60
  WITH no early collapses, the next run asks whether
  spawn/engagement changed.
- Orphaned invitations are counted as invite LINES per raise talk
  (r273: 4 lines / 11 talks). The r250 10/18 and r251 2/7 counts are
  not directly comparable (invitations vs talks vs lines) — the line
  count is the unit now.
- **Stand-down measurement (carried):** the fix is proven on one seed
  (r273: hunger 251→52, national 45→70 days); r276 measured it
  VACUOUS band-wide (0 firings). This panel measures it band-wide
  descriptively again. A national seed losing national to a
  fruitless march on the FIXED driver would be a fix failure, not a
  QUIET data point — judge it in the run note, not by the Q1 bar.
- **Tribute-delivery stall (watch, from r273):** the stall
  starting on the tribute-delivery day (veterans leave, readiness
  drops below the bar) — watch whether tribute delivery
  systematically stalls readiness this band.
- **Departname watch (new):** the analyzer counts stranger
  descriptors in depart beats; the bar is 0 (the staged proof
  showed 21→0). A non-zero count is a regression of the fix, not a
  descriptive note.
- **Position-dependence (new, from r278):** panels stay comparable
  only with identical seed order/config. This run's seed order is
  the r276 order shape (ascending band order, single process, same
  policy). Any mid-run re-run that changes seed position must be
  recorded as a new config, not folded into the panel.
