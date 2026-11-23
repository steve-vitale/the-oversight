# journey-scale r273 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-loop-20261123T1007Z` (lock run_id).
**Run:** scheduled Mon 2026-11-23 03:45 CST (09:45Z).
**Rotation read 3 → leg 3 SCALE.** Rotation 3→0 was written at run start
(09:45Z leg claimed; next run gets leg 0 landing) and read back.
**Base:** local master `9c458f55a` at prereg time.
**Pre-flight:** main tree has ONE untracked file,
`evidence/2026-11-23/sim-scale-onramp-round-0815.md` — the
fleshout-20261123T0815Z coordinator's round record, no live owner (its
lock was deleted at its closeout, no registry tree, no coordinator
process). It is another run's real work, never to be committed by this
run; it does not touch this run's worktree branch. Noted loudly here
and in the run note; the run proceeds under the worktree discipline
(the file cannot be swept into a worktree safe-commit or an ff-merge).
Disk 50%. Worktree `journey-scale` registered by this run; heartbeat
loop (10-min cadence) alive; manual heartbeat re-landed after every
long step.
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
**Time-box (stated up front):** soft stop ~13:15Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit.

## Standing context (read before scoring)

- **r251 scale (landed 2026-11-22 as a4603add1):** Q1 PLAYTEST PANEL
  VERDICT INTERESTING — national 1/8 + 1 would-convert on d141 (the
  RUNG horizon artifact: 106273's trade rung completed on d140, the
  final day; national flips a day after the rung, so it would have
  converted d141). Lesser seat priced 8/8, full seat 0/8, wave-4
  fights 85 / kills 27, wave-5 faced 3/8, survival 5/8, lived-days
  mean 127.0 (control 123, +3.3%). Blocker taxonomy: NATIONAL 1,
  FORMATION-LATE 1, COLLAPSE 3, FORMATION-FEW 2, RUNG 1 (the horizon
  artifact). Standing-199 stall: 0 days stalled-while-ready on the
  per-day split (120 phantom days, all stalled-while-not-ready) — the
  stall is NOT binding on this band. WinPlan: 179 departures, trios=0
  quads=0. Blank documented, not fixed: orphaned raise-talk invite
  lines (2 of 7 raise talks; root cause narrowed to the raise-talk
  menu/held-beat plumbing; filed for a builder arm). Q3 guards all
  HOLD/GO. DOWNEDTWICE: no recurrence. Gate 331/13, 0 attributable
  (5 standing + 8 flap EPERM, all 8 re-ran green). Telemetry 3 LOUD
  lines explained as regime artifact; baseline NOT rolled.
- **r250 scale:** QUIET — national 0/8, lesser 7/8, full 0/8, w4 kills
  20 (82 fights), w5 faced 0/8, stall 1/8 seeds (49d, peak-based),
  survival 5/8. Blank filled: broken-favor resolution lines
  (convo-wants.js). Orphaned invitations 10/18 in raise talks.
- **r249 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  25, w5 faced 1/8, stall 4/8 / 113d, survival 6/8.
- **r248 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  23, w5 faced 2/8, stall 4/8 / 52d, survival 5/8.
- **r247 scale:** QUIET — national 1/8, lesser 8/8, full 1/8 (first
  on the control policy since r244, via TRADE, seed 103892), w4 kills
  31, w5 faced 1/8, stall 4/8 / 192d, survival 6/8.
- **r246 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  27, w5 faced 2/8, stall 1/8 (15d).
- **Deepening r272 (landed 2026-11-23 as 9c458f55a):** Q1 GO, wave-5
  1/8 unlocked 0 faced; GONE-BEARER fix — a dead bearer's joint run
  is never urged as finishable + proof 35/35. Gate 338/6, 0 attributable.
- **Establishment r271 (landed 2026-11-23 as 80e7da0bc):** SLEEP-RETRY
  works (29/29); Q1/Q2 NO-OPPORTUNITY (0 stranded, 0 evictions).
- **Fleshout round 0815Z (2026-11-23, closeout tip 4ed324733):**
  homebody-metric-a GO + LANDED — a range-0 holder's wave-4+ plan
  moves to a walkable companion at depart time (win-plan.js); detgate
  instrument GO, dawnchoke NO-GO stands on the death cost alone;
  wornstack-equip-a GO + LANDED (scholar equip/unequip carries worn
  stack units). The homebody handoff is IN THIS RUN'S BASE and is the
  live question for Q2's departure sizes.

## Base delta vs r251's base `52b71428f` (src/js, 8 files, +367/−13)

Live behavior changes (from `git log 52b71428f..9c458f55a -- src/js`):
- sim-homebody-metric-a (`f99f9c0c6`): **range-0 holder's wave-4+ plan
  moves to a walkable companion at depart time** [needs-eyes] — the
  handoff lever, certified on a fresh 16-seed band (pool 3, share
  100%, 3 party conversions, 0 solo). Directly relevant to this run's
  Q2 party-size question: does it move departures off pairs?
- journey-deepening r272 (`997654392`): **GONE-BEARER** — a dead
  bearer's joint run is never urged as finishable (convo-wants.js).
  Watch item: a scale transcript urging a dead bearer's joint run
  would be a recurrence, not new behavior.
- sim-wornstack-equip-a (`46370f4d2` + mantle precursor `ff17699c7`):
  scholar equip/unequip carry worn stack units; mantleBecome carries
  them on succession. No player-visible behavior change beyond the
  missing units coming home.
- journey-succession r267 (`970fc5524`): fill-aware retry in topic2Ask
  [needs-eyes] (convoTopics.js / villager-agency.js).
- sim-detgate-order-a (`d0ed41382`): instrument only (order-insensitive
  det-gate bound); no live game change. sim-launchfield-horizonfix-b
  (`39e1a8ec1`): instrument only.
- Largest diffs: win-plan.js +145, villager-agency.js +86,
  convo-wants.js +62, convoTopics.js +41, game.js +19,
  villager-brain.js +15, villager-build.js +10, build.js (version bump).

## Seed-band freshness

- **Band: FRESH 106277–106284. Probe seed: 106285 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- Searched (read-only): evidence/**/*.md, docs/, scripts/**/*.js,
  goal hidden_files/**/*.md, perseed corpus filenames — **0 hits**
  for any of 106277–106285. The 106xxx region is densely used up to
  106276 (r251 spent 106268–106276); 106277–106285 is the next clean
  9-block.
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18); 106259–106267 spent (r250); 106268–106276 spent (r251).

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244–r251 control policy verbatim (below), 8 fresh seeds 106277–
  106284, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (**phantomDays5** — days the readiness gate holds the village at
  the t5−1 cap; the stall finding rests on this measure ONLY, judged
  on the per-day split — stalled-while-ready vs stalled-while-not-ready),
  survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r273-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
  FORMATION-LATE, COLLAPSE, RUNG, RUNG-HORIZON}), OR a taxonomy miss
  (UNKNOWN), OR a fixable defect in the table-approach path. Else QUIET
  — the wall stands as measured and the finding is the blocker taxonomy.
  RUNG was first observed in r251 (where it fired INTERESTING as a new
  class); RUNG-HORIZON is the named r251 horizon artifact (106273) —
  a rung completed on the final recorded day, whose national flip had
  no day to land on. Neither fires INTERESTING again by itself.
- **Q2 — BLOCKER TAXONOMY (measurement, NOT a gate) + wave-5/party
  sizes (descriptive):** per seed, the blocker class for the 3rd
  seasoned link on the closest road (FORMATION-LATE / TRUST-LOW /
  SNAP / COLLAPSE / FORMATION-FEW / NATIONAL / RUNG / RUNG-HORIZON /
  UNKNOWN), from the analyzer's carried section. Wave-5 in the scale
  window: faced/killed per seed, party sizes on wave-5 fights; does
  the party-of-5 kill shape recur; **win-plan departure sizes (pairs vs
  trios vs quads vs 5+) from the winPlanEnd snapshot** — the
  homebody-metric-a handoff is in base this run: does it move
  departures off pairs (r251: 179 departures, 0 trios)?
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch:
  march fights fled at full HP counted; the wave-4 fight slide watch
  (231 → 168 → 101 → 62 → 82 → 85 across r246–r251): if this band
  doesn't hold ~85+, the next run asks whether spawn/engagement
  changed on master. Coalition-reach (9-blade shape) reported
  descriptively. DOWNEDTWICE watch (no recurrence in r251 — keep
  watching). GONE-BEARER watch (r272 fix — a dead bearer's joint run
  urged as finishable in a scale transcript is a recurrence).
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (count 6 so far — count
  up), tell-me-more echo, searcaster-volley narration, departbeat,
  warn_you heed. Carried items: orphaned invite LINES in raise talks
  (r251: 2 lines in 7 talks — count LINES per raise talk this run, the
  unit r251's metric review set), 90% modal raise opener, NV 3-nod
  flat spot.
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r250-recorded flat spots —
  the NV 3-nod cycle (My ×3; Somchai/Tariq walk-then-nod), the "come
  see what I found" payoff shrug (orphaned), orphaned invite lines in
  raise talks (r251: 2 lines / 7 talks), the r239 "tell me more" echo,
  closing-line duplication count 6. A dialogue-content fix belongs to
  this run only if it is a blank this run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244–r251 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
`COMPETENT_ROUTE_AROUND=1` for the march walk only, restored after.
No gate, threshold, price, or bar changed — the march is policy, the
competent player driving existing game verbs.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106277–106284.
Pilot: seeds 106277–106279 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. The
leg's blocker taxonomy needs 8 seeds, the standing-199 question is
live, the homebody-handoff party-size question needs 8 seeds, and the
panel costs ~20 min. The pilot's interestingness gates nothing except
the instrument gates above.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r273-20261123.js`, cloned from r251):
  seeds 106277–106284, corpus tags r273, EVIDIR 2026-11-23, single arm
  B only. No behavior change from the r251 control.
- Analyzer (`scripts/analyze-journey-scale-r273-20261123.js`): cloned
  from r251; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above, with the r273-observed set). Q2/Q3/Q4/Q5 carried
  verbatim (paths r273). **RUNG-HORIZON split (r251 metric review):**
  when the closest road's 3/3 seasoned count is first reached on the
  final recorded natgate day, classify RUNG-HORIZON (would-convert
  past the horizon) instead of RUNG; the observed set gains RUNG and
  RUNG-HORIZON (UNKNOWN still fires INTERESTING as a taxonomy miss).
- Proof test (`scripts/test-journey-scale-r273-analyzer-20261123.js`):
  cloned from r251's; panel cases carried. Case (58) rewritten:
  RUNG is observed now, so the RUNG panel is QUIET, not INTERESTING.
  New cases: (70) UNKNOWN still fires INTERESTING; (71)
  RUNG-HORIZON (rungDay on the final day) classifies RUNG-HORIZON
  and the panel stays QUIET; `natgateLines` gains optional `rungDay`
  support. **Run BEFORE the panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r251
  control prior (1/8 + 1 would-convert) and the r247 control prior
  (1/8): a single flip is noise; three is a movement.
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
- The wave-4 fight slide (231 → 168 → 101 → 62 → 82 → 85) is the carried
  watch item: if r273's band doesn't hold ~85+, the next run should ask
  whether spawn/engagement changed on master, not just record the slide.
- Orphaned invitations are counted as invite LINES per raise talk from
  this run on (r251 metric review) — the r250 10/18 and r251 2/7 counts
  are not directly comparable (invitations vs talks).
