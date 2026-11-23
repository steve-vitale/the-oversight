# journey-scale r276 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261123T2043Z` (lock run_id).
**Run:** scheduled Mon 2026-11-23 14:45 CST (20:45Z).
**Rotation read 3 → leg 3 SCALE.** Rotation 3→0 was written at run start
(20:43Z leg claimed; next run gets leg 0 landing) and read back.
**Base:** local master `53ae1c2de` at prereg time. Registration story
(recorded because the base moved under the run): the worktree registered
at `dcbaafeb0` (the departsafe-rejudge adoption's ff-merge landed on
master between this run's pre-flight pull at 20:43Z and the register's
`git worktree add` at ~20:49Z), then ff-merged to current master
`53ae1c2de` in the worktree before any work (clean tree, zero local
commits — the ff-merge is the body's prescribed recovery when a lever
loop lands first). The musterask adoption (`53e60a140` + `53ae1c2de`)
landed in the same window; both deltas are instrument/evidence only.
**Pre-flight:** main tree clean, disk 52%. Worktree `journey-scale`
registered by this run; heartbeat loop alive (manual heartbeat re-landed
after every long step). Registration took ~25 min on a loaded box (the
first `git worktree add` checkout died mid-`evidence/` after ~11 min /
19 GB written and the register's fallback re-ran the checkout to
completion; no flap window was observed — write probes OK at 21:05Z).
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
**Time-box (stated up front):** soft stop ~23:45Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit.

## Standing context (read before scoring)

- **r273 scale (landed 2026-11-23 as db2e9a3df):** QUIET — national 1/8,
  lesser 8/8, full 0/8, wave-4 fights 52 / kills 16, wave-5 faced 2/8,
  survival 5/8, lived-days mean 117.9 (control 123, −4.1%, HOLD).
  Blocker taxonomy: COLLAPSE 3, FORMATION-FEW 3, NATIONAL 1,
  FORMATION-LATE 1. Blank filled — fruitless-march stand-down (driver
  policy, no game code): seed 106282 reached national d71/global d72,
  then its muster marched a roaming herald 64 days with no encounter;
  muster hunger (−2 trust/link/day) bled 251 events and dissolved the
  trade league, national lapsed d115. Fix: stand down after 7
  arrived-but-no-pending days + 30-day re-call cooldown. Same-seed
  replay: hunger 251→52, national 45→70 days, ends global with trade
  3/3. Proof test 10/10; analyzer proof 159/159. **This run's panel
  (r276) is the band-wide measurement of that fix, on the fixed driver.**
  People check PASS; orphaned raise-talk invite lines 4 in 11 talks
  (filed for a builder arm, not fixed here). 106284's 18 stalled days
  start on its tribute-delivery day — the delivery's veteran price
  drops readiness below the bar (design tension, noted). Gate 339/5,
  0 attributable. Telemetry: 3 LOUD lines, r251 regime artifact;
  baseline NOT rolled.
- **r272 deepening (landed 2026-11-23 as 9c458f55a):** Q1 GO, wave-5
  1/8 unlocked 0 faced; GONE-BEARER fix — a dead bearer's joint run
  is never urged as finishable + proof 35/35. Gate 338/6, 0 attributable.
- **Deepening r275 (landed 2026-11-23 as b68134225, base of this run's
  parent):** Q1 PRIMARY BAR: GROWTH-LINE-GO — 0 bad lines, 7 growth
  calls, all harvest exactly. Q2 wave-5: unlocked 2/8, BOTH FACED
  (first time on a deepening band), killed 0/2. Wave-4: 22 fights / 7
  kills. Muster called 7, fought 3, slain 3. WINPLAN ignited 8/8, 175
  departures, trios=0, quads=0 — the homebody handoff changed NOTHING
  in launch composition. Coalition reached 10 allies on 2/8 (r272:
  4/8); three seeds sat at 9 allies for 27–41 watch days. Bow watch:
  21 bows equipped, 57 knowers. Q4 people check PASS (Chloe d45,
  Ursula d80 — both read as people). Census: 7/8 survived to day 100.
  Gate 339/5 started, killed at ~100/344 (box load); commit touches
  no game code. Telemetry quiet.
- **Establishment r274 (landed 2026-11-23 as 43ebee38c):** warn-heed
  deepen-arc instrument fix + panel (seeds 109001-109008).
- **Fleshout round 1830Z (2026-11-23, TIMED OUT ~20:30Z, adoption
  owed — NOT this run's work):** sim-cellgate-floor-b, sim-rearm-b,
  sim-gatehorizon-reprereg-b all mid-flight; their worktrees stay
  untouched. Loop A 1815Z adoption finished one arm during this run's
  pre-flight window (sim-departsafe-rejudge-a GO, lever HELD;
  sim-musterask-a DIAG-GO — dawn-scoring gap named 82/82).

## Base delta vs r273's base `9c458f55a` (src/js, 5 files, +127/−13)

Live behavior changes (from `git log 9c458f55a..53ae1c2de -- src/js`):
- journey-succession r268 (`331a9b5ee`): **stage-2 prefixed retry in
  topic2Ask (table-dry fix)** — conversation.js +44, convoTopics.js
  +54. Watch item: a scale transcript hitting a dry table beat would
  be a recurrence, not new behavior.
- journey-social-life r268 Arm B (`7a2de2e42`): **resume-pick dry
  fall-through via convoLiveBeat** (convo-wants.js +15, comms.js +18).
- journey-landing r156 (`4cd566b21`): **M-PR1 commit-menu fix** —
  engage flips thread to 'want'.
- journey-crisis r274 (`a44b47320`): **DOWNEDTWICE dedup
  (aidAllyDown per-ally+day) + FIGHT-STALL nearest-affordable-edge
  flee**; stall 9→2 after-panel, DOWNEDTWICE GO.
- Version bumps only (`build.js`).
- No src/js in the musterask (`53e60a140`, `53ae1c2de`) or
  departsafe-rejudge (`addfcc9a5`, `dcbaafeb0`) deltas — instrument,
  corpora, panel, evidence only. No other live game change in base.

## Seed-band freshness

- **Band: FRESH 106310–106317. Probe seed: 106318 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- Searched (read-only): evidence/**/*.md, docs/, scripts/**/*.js,
  goal hidden_files/**/*.md, perseed corpus filenames — **0 hits**
  for any of 106310–106318.
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18); 106259–106267 spent (r250); 106268–106276 spent (r251);
  106277–106285 spent (r273); **106301–106308 SPENT by
  sim-reseedexpiry-b (Nov 20 prereg, Band A)** — this run's first
  candidate block, rejected on the .md search; 106286 named only in
  sweep .json corpus contents (outside the prereg search scope), but
  the next clean 9-block starts at 106310 regardless.

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244–r251 control policy verbatim (below), 8 fresh seeds 106310–
  106317, DAYCAP 140.
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
  handoff is in base: does it move departures off pairs (r273: 160
  departures, 0 trios)? **Stand-down band-wide (descriptive, the fix
  is already proven — this asks whether it HOLDS):** muster-hunger
  events per national seed vs r273's unfixed 251 on its one national
  seed; national days held per national seed (r273 unfixed: 45, lapsed
  d115); any national lost to a fruitless march (stand-downs fired /
  re-call cooldowns held / fruitless march days per seed).
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch:
  march fights fled at full HP counted; the wave-4 fight slide watch
  (231 → 168 → 101 → 62 → 82 → 85 → 52 across r246–r273): r273's 52
  was decomposed as composition (early collapses, flat per-survivor
  rate), not spawn — **if this band is also <60 WITH no early
  collapses, the next run asks whether spawn/engagement changed on
  master**. Coalition-reach (9-blade shape) reported descriptively.
  DOWNEDTWICE watch (no recurrence in r273 — keep watching).
  GONE-BEARER watch (r272 fix — a dead bearer's joint run urged as
  finishable in a scale transcript is a recurrence). TABLE-DRY watch
  (r268 fix — a dry table beat in a scale transcript is a recurrence).
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (count 6 so far — count
  up), tell-me-more echo, searcaster-volley narration, departbeat,
  warn_you heed. Carried items: orphaned invite LINES in raise talks
  (r273: 4 lines in 11 talks — count LINES per raise talk this run,
  the unit r273's metric review set), 90% modal raise opener, NV 3-nod
  flat spot.
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r250-recorded flat spots —
  the NV 3-nod cycle (My ×3; Somchai/Tariq walk-then-nod), the "come
  see what I found" payoff shrug (orphaned), orphaned invite lines in
  raise talks (r273: 4 lines / 11 talks), the r239 "tell me more" echo,
  closing-line duplication count 6. A dialogue-content fix belongs to
  this run only if it is a blank this run finds.

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
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106310–106317.
Pilot: seeds 106310–106312 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. The
leg's blocker taxonomy needs 8 seeds, the standing-199 question is
live, the homebody-handoff party-size question needs 8 seeds, the
stand-down fix needs 8 seeds, and the panel costs ~20 min. The pilot's
interestingness gates nothing except the instrument gates above.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r276-20261123.js`, cloned from r273):
  seeds 106310–106317, corpus tags r276, EVIDIR 2026-11-23, single arm
  B only. No behavior change from the r273 control (stand-down carried).
- Analyzer (`scripts/analyze-journey-scale-r276-20261123.js`): cloned
  from r273; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above, with the r276-observed set). Q2/Q3/Q4/Q5 carried
  verbatim (paths r276) + the stand-down section (muster-hunger events,
  national days held, stand-downs fired, fruitless march days).
- Proof test (`scripts/test-journey-scale-r276-analyzer-20261123.js`):
  cloned from r273's; panel cases carried (58/70/71 as written).
  **Run BEFORE the panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r273
  control prior (1/8) and the r251 control prior (1/8 + 1
  would-convert): a single flip is noise; three is a movement.
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
- The wave-4 fight slide (231 → 168 → 101 → 62 → 82 → 85 → 52) is
  the carried watch item: r273 decomposed its 52 as composition
  (early collapses, flat per-survivor rate). If r276 is also <60
  WITH no early collapses, the next run asks whether
  spawn/engagement changed.
- Orphaned invitations are counted as invite LINES per raise talk
  (r273: 4 lines / 11 talks). The r250 10/18 and r251 2/7 counts are
  not directly comparable (invitations vs talks vs lines) — the line
  count is the unit now.
- **Stand-down measurement (new):** the fix is proven on one seed
  (r273: hunger 251→52, national 45→70 days); this panel measures it
  band-wide descriptively. A national seed losing national to a
  fruitless march on the FIXED driver would be a fix failure, not a
  QUIET data point — judge it in the run note, not by the Q1 bar.
- **Tribute-delivery stall (new watch, from r273):** the stall
  starting on the tribute-delivery day (veterans leave, readiness
  drops below the bar) — watch whether tribute delivery
  systematically stalls readiness this band.
