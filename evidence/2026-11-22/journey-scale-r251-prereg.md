# journey-scale r251 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-loop-a-20261122T2145Z` (lock run_id).
**Run:** scheduled Sun 2026-11-22 15:45 CST (21:45Z).
**Rotation read 3 → leg 3 SCALE.** Closeout (rotation write 3→0, lock
delete, merge, release) is this run's job at the end.
**Base:** local master `52b71428f` at prereg time.
**Pre-flight:** main tree clean, disk 49%. Worktree `journey-scale`
registered by this run; heartbeat loop (10-min cadence, log
hidden_files/r251-hbloop.log) alive; manual heartbeat re-landed after
every long step.
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
**Time-box (stated up front):** soft stop ~00:45Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit.

## Infrastructure note (this run's registration)

This run was BLOCKED on worktree registration by the host write flap
for ~69 min (21:47–22:56Z): the first register attempt reached
108,639/108,644 files then failed on 5 EPERM files + index reset; the
leftover `journey-scale` branch could not be deleted (packed-refs
writes refused 6×); 8 further attempts failed fast. The flap cleared
22:56:19Z (watcher A–H OK, two consecutive polls). A VM restart
~23:02Z killed the first successful registration mid-checkout (partial
`evidence/` dir only, branch re-created, no metadata); the partial dir
was removed, the branch deleted again, and registration re-ran clean
(exit 0, ~9.3 min, 23:13Z). No panel has run yet; no code changed; the
3h box is compressed, so the gate may overrun it — the panel verdict
stands either way and the gate completes as far as it gets.

## Standing context (read before scoring)

- **r250 scale (landed 2026-11-22 as 20783a0be):** Q1 PLAYTEST PANEL
  VERDICT QUIET — national 0/8, lesser seat priced 7/8, full seat 0/8,
  wave-4 kills 20 (82 fights, 24%), wave-5 faced 0/8, standing-199
  stall 1/8 seeds (49d, seed 106259), survival 5/8. Blocker taxonomy:
  FORMATION-FEW 4, COLLAPSE 3 (all scatter-hunger), FORMATION-LATE 1.
  Blank filled: broken-favor resolution lines in `src/js/convo-wants.js`
  (helper `convoFavorResolvedWithoutYou`) + proof test [needs-eyes].
  Gate 333/11 in 1349s, 0 attributable after the r240 test wording
  update. Telemetry LOUD line `maxGameDay 468 → 967` explained as a
  regime difference (8 seeds living 967d vs 468d); baseline NOT rolled
  forward. Q4: 10/15 transcripts GOOD, 5 WEAK; raise talks failed on
  sense (10/18 orphaned invitations, 90% modal opener); closing-line
  duplication count stays 6; warn_you heed confirmed in many voices.
  Q3 guards all HOLD/GO.
- **r249 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  25, w5 faced 1/8, stall 4/8 / 113d, survival 6/8. Blocker taxonomy:
  FORMATION-FEW 4, FORMATION-LATE 1, COLLAPSE 2, SNAP 1. The wave-4
  fight slide continues (231 → 168 → 101 → 62 across r246–r249).
  Blanks filled: owed-walk fix (betrayal.js) + march route-around
  (driver policy — COMPETENT_ROUTE_AROUND=1 for the march walk only).
- **r248 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  23, w5 faced 2/8, stall 4/8 / 52d, survival 5/8. Blank filled:
  raise-opener variety by lore-how (bond-initiation.js).
- **r247 scale:** QUIET — national 1/8, lesser 8/8, full 1/8 (first
  on the control policy since r244, via the TRADE road, seed 103892),
  w4 kills 31, w5 faced 1/8, stall 4/8 / 192d, survival 6/8. First
  field wave-5 kill on the scale leg (103894, d120). Blank filled:
  settled-help names the favor.
- **r246 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  27, w5 faced 2/8, stall 1/8 (15d). Blank filled: want-menu react
  wind-down (convo-wants.js).
- **Deepening r269 (landed 2026-11-22):** convo fixes (MOOT-CLOSE,
  DRY-COUNT WASHOUT, parting-prefix fix); PLANWAKE GO, LAUNCHVOICE
  (r268). Hands the scale leg the winPlanEnd snapshot tooling — see
  Fix scope below.

## Base delta vs r250's base `3d7a25427` (src/js, 7 files, +253/−24)

Live behavior changes (from `git log 3d7a25427..52b71428f -- src/js`):
- sim-needwave-b (`054f525bc`): **guarded needWave copy** in the
  companion plan sync (copy only when the leader's wave number is set;
  never erase a companion's) [needs-eyes] — trio+ 0.40→0.89 in its own
  panel; directly relevant to this run's party-size question (Q2).
- journey-deepening r269: MOOT-CLOSE (`9accff480`) — evicted favor's
  live joint run closes its books; DRY-COUNT WASHOUT (`ddcecb96d`) —
  blocked beat restores the dead-react streak; analyzer parting-prefix
  fix (goodbye THEM:).
- journey-establishment r268 (`1c11dbb14`): PLANWAKE fresh band GO,
  LAUNCHVOICE speaks, day-desync answered, STRANDED-CLOSE menu fix
  [needs-eyes].
- journey-landing r154 (`29a8dde3a`): grief-bridge pool 2→6 lines
  [needs-eyes].
- journey-scale r250 itself (`20783a0be`): broken-favor resolution
  lines (convo-wants.js) [needs-eyes] — in-base for r251.
- sim-needwave-a (`1703f42b7` + revert `f54c24e42`): copy-then-revert
  (null-holder wipe NO-GO); the guarded copy above supersedes it.
- sim-leaderhpgate-b (`d9d98bf8f`): leader-HP gate NO-GO (CONCEPT-DEAD).
- sim-hpgate-b (`87b2122f3`): HP-gate door parties NO-GO on P2/B1.
- sim-cellcheck-a / sim-gunloss-a: instrument + evidence only, no live
  game change (gunloss-a DIAG-GO, mantleBecome day 134 attributed).
- journey-crisis r264 (panel + run note + STUCK-TRACE instrument):
  **DOWNEDTWICE regression of #2634 reported** — `aidAllyDown`
  double-emit: trust −12 instead of −6, 2,000 kcal forgiven instead of
  1,000 (see evidence/2026-11-22/journey-crisis-r264.md § line 162).
  **Watch item for this run** — if the panel shows doubled
  downed-ally trust hits, it is this regression, not new behavior.
- Scale-onramp rounds (8fe88c7ea, 5e8001d2f, 5e02a9bf8, bda6ff495):
  round records only.
- Largest diffs: win-plan.js +27, villager-brain.js +6 (of +253/−24
  across 7 files).

## Seed-band freshness

- **Band: FRESH 106268–106275. Probe seed: 106276 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- Searched (read-only): all dated preregs
  (evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md, every
  date dir) whole-word; evidence/**/*.md generally; scripts/**/*.js;
  docs/ — **0 hits** for any of 106268–106276. The 106xxx region is
  densely used up to 106267 (r250 spent 106259–106267); 106268–106276
  is the next clean 9-block.
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18); 106259–106267 spent (r250).

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244–r250 control policy verbatim (below), 8 fresh seeds 106268–
  106275, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (**phantomDays5** — days the readiness gate holds the village at
  the t5−1 cap; the stall finding rests on this measure ONLY, per the
  r250 reconciliation), survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r245-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
  FORMATION-LATE, COLLAPSE, RUNG, UNKNOWN}), OR a fixable defect in the
  table-approach path. Else QUIET — the wall stands as measured
  and the finding is the blocker taxonomy.
- **Q2 — BLOCKER TAXONOMY (measurement, NOT a gate) + wave-5/party
  sizes (descriptive):** per seed, the blocker class for the 3rd
  seasoned link on the closest road (FORMATION-LATE / TRUST-LOW /
  SNAP / COLLAPSE / FORMATION-FEW / NATIONAL / RUNG / UNKNOWN), from
  the analyzer's carried section. Wave-5 in the scale window:
  faced/killed per seed, party sizes on wave-5 fights; does the
  party-of-5 kill shape recur; **win-plan departure sizes (pairs vs
  trios vs quads vs 5+) from the ported winPlanEnd snapshot** (see Fix
  scope) — the needwave-b guarded copy should show up here if it
  moves departures.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch:
  march fights fled at full HP counted; the wave-4 fight slide watch
  (231 → 168 → 101 → 62 → 82 across r246–r250): if this band doesn't
  recover toward ~100, the next run asks whether spawn/engagement
  changed on master. Coalition-reach (9-blade shape) reported
  descriptively. DOWNEDTWICE watch (see Base delta): doubled
  downed-ally trust hits counted if present.
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (count 6 so far — count
  up), tell-me-more echo, searcaster-volley narration, departbeat,
  warn_you heed. Carried items: orphaned invitations in raise talks
  (r250: 10/18), 90% modal raise opener, NV 3-nod flat spot.
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r250-recorded flat spots —
  the NV 3-nod cycle (My ×3; Somchai/Tariq walk-then-nod), the "come
  see what I found" payoff shrug (orphaned), orphaned invitations in
  raise talks (10/18 in r250), the r239 "tell me more" echo, closing-line
  duplication count 6. A dialogue-content fix belongs to this run only
  if it is a blank this run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244–r250 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
`COMPETENT_ROUTE_AROUND=1` for the march walk only, restored after.
No gate, threshold, price, or bar changed — the march is policy, the
competent player driving existing game verbs.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106268–106275.
Pilot: seeds 106268–106270 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. The
leg's blocker taxonomy needs 8 seeds, the standing-199 question is
live, the needwave-b party-size question needs 8 seeds, and the panel
costs ~20 min. The pilot's interestingness gates nothing except the
instrument gates above.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r251-20261122.js`, cloned from r250):
  seeds 106268–106275, corpus tags r251, EVIDIR 2026-11-22, single arm
  B only. No behavior change from the r250 control. **Port the
  deepening `winPlanEnd` snapshot into the scale driver** (read-only
  snapshot of `village.winPlanStats` + plan table; NEVER call
  `Game.winPlanStats()` — it materializes the store and would ignite
  the plan system). Insert after `spotterWatch90` in the end-JSON.
- Analyzer (`scripts/analyze-journey-scale-r251-20261122.js`): cloned
  from r250; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above). Q2/Q3/Q4/Q5 carried verbatim (paths r251). Add
  `winPlanEnd` to the per-seed row + a Q2-WINPLAN section after the Q1
  panel verdict print.
- Proof test (`scripts/test-journey-scale-r251-analyzer-20261122.js`):
  cloned from r250's; panel cases carried (single-arm playtest verdict
  INTERESTING / QUIET / INCOMPLETE shapes). New cases for the winPlanEnd
  snapshot (present / absent / empty plan table). **Run BEFORE the
  panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r250
  control prior (0/8) and the r247 control prior (1/8): a single flip
  is noise; three is a movement.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is carried from r250: phantomDays5
  (vetbar shadow5 > readiness5 days) is the instrument's own record
  of the hold, read as stall days per seed — PLUS the per-day r5 split
  adopted in r250 (the seed-level peak split is retired as invalid).
  The stall finding rests on phantomDays5 ONLY.
- The vetbar duplicate-day quirk (r247: every seed records some days
  twice; stall total overcounts by ~1 day band-wide) is carried as a
  known instrument quirk; the metric is judged as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
- The wave-4 fight slide (231 → 168 → 101 → 62 → 82) is the carried
  watch item (r250 metric review): if r251's band doesn't recover
  toward ~100, the next run should ask whether spawn/engagement
  changed on master, not just record the slide.
