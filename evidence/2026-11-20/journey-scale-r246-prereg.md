# journey-scale r246 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261120T0545Z` (lock run_id).
**Run:** scheduled Thu 2026-11-20 05:45 UTC; lock created 05:46:39Z.
**Rotation read 3 → leg 3 SCALE.** Closeout (rotation write 3→0) is the
parent's job, not this run's — do NOT touch the rotation file.
**Base:** local master `0d925556a` at prereg time (batch ship
8cd4c0181-20261120-052438; dmgsurvey GO landed).
**Pre-flight:** main tree clean (verified at merge time; setup done by
parent), disk 50%. Worktree registered 05:52:01Z; heartbeat blocked
~30 min behind a loop-B registration whose `git reset --hard` wrote
16 GB (slow checkout under load, not a flap error) — heartbeat landed
06:22:20Z, hbloop pid 25541 running for the whole run.
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
this is a PLAYTEST leg, not a lever round. The sub-cap lever is NOT
re-run (r245 judged it PARTIAL; composition stays a branch). This run
plays the leg on current master and judges reachable/fun/winnable.
**Time-box (stated up front):** hard stop ~07:45Z (2h from the 05:45Z run
start). Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2
concurrent. The `--quick` gate runs right after the build commit; the
full gate runs before the merge and its result is reported from the
log, not the note.

## Standing context (read before scoring)

- **r245 scale (landed 2026-11-19):** Q1 SUBCAP PANEL VERDICT PARTIAL —
  arm C 2/8 national vs control B 0/8 (bar ≥3/8, delta ≥2). Dominant
  blocker TRUST-LOW (4/8 arm C), then NATIONAL (2/8), SNAP (1/8),
  FORMATION-FEW (1/8). Control blockers: FORMATION-FEW 5/8, COLLAPSE
  2/8, FORMATION-LATE 1/8. Wave-4 kills B=21 C=24; living-veteran peak
  6 both arms; lesser seat priced 8/8 both arms; **0 wins**. The wall
  moved but did not clear; the composition stays a branch.
- **r244 scale:** national 1/8 both arms; blocker taxonomy
  FORMATION-FEW 3, COLLAPSE 3, FORMATION-LATE 1, NATIONAL 1. The wall
  is formation, not trust, on the control policy.
- **r243 scale:** 0/8 national, all blocked on the LEAD seasoned-link
  shortage; lesser seat priced 8/8. r239: 2/8 national. r242: 1/8.
- **dmgsurvey GO landed on master (band 106181–106188).** The damage
  survey is done; this run does not re-measure damage shape.

## Seed-band freshness

- **Band: FRESH 103881–103888.**
- Searched before the run: all `evidence/**/*.md` in the repo — **0
  hits** for any of 103881–103888; goal `hidden_files/evidence/**/*.md`
  — **0 hits**; `scripts/**/*.js` — **0 hits**.
- **Collision note (so the next worker does not repeat the search):**
  the literal `103887` appears as a pantry kcal VALUE in two
  2026-10-19 per-seed JSON corpora
  (`evidence/2026-10-19/perseed-winsupportdecomp/*/leadfeast/s65013.json`)
  — a data value, not a seed-band naming. No prereg, forbidden list,
  screen, or extension band names 103881–103888 as seeds.
- **Collision record:** 103801–103808 and 103811–103818 reserved (r242);
  103821–103828 and 103831–103838 spent (r239); 103841–103848 spent
  (r242); 103851–103858 spent (r243); 103861–103868 spent (r244);
  103871–103878 spent (r245). Do not reuse.

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244/r245 control policy verbatim (below), 8 fresh seeds
  103881–103888, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (seeds with phantomDays5 > 0 + total stall days — days the readiness
  gate holds the village at the t5-1 cap), survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r245-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
  FORMATION-LATE, COLLAPSE, RUNG, UNKNOWN}), OR a fixable defect in
  the table-approach path. Else QUIET — the wall stands as measured
  and the finding is the blocker taxonomy.
- **Q2 — BLOCKER TAXONOMY (measurement, NOT a gate):** per seed, the
  blocker class for the 3rd seasoned link on the closest road
  (FORMATION-LATE / TRUST-LOW / SNAP / COLLAPSE / FORMATION-FEW /
  NATIONAL / RUNG / UNKNOWN), from the analyzer's carried section.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8.
- **Q4 — PEOPLE CHECK:** read 1–2 full transcripts (d90/d120) in full,
  PLUS the nonverbal sittings AND all raise talks. Quote one specific
  transcript moment in the run note.
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r239 Q6 "tell me more" echo
  shape — watched for in the r246 transcripts and recorded; a
  dialogue-content fix belongs to this run only if it is a blank this
  run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244/r245 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 103881–103888.
Pilot: seeds 103881–103883 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r246-20261120.js`, cloned from r245):
  seeds 103881–103888, corpus tags r246, EVIDIR 2026-11-20, single arm
  B only. No behavior change from the r245 control.
- Analyzer (`scripts/analyze-journey-scale-r246-20261120.js`): cloned
  from r245; single-arm (arm B only); the final SUBCAP panel verdict
  is replaced by a PLAYTEST panel verdict (Q1 rule above); the SUBCAP
  section is retitled to the control guard's behavior (lever OFF this
  run). Q2/Q3/Q4/Q5 carried verbatim (paths r246).
- Proof test (`scripts/test-journey-scale-r246-analyzer-20261120.js`):
  cloned from r245's; panel cases (56–60) rewritten for the single-arm
  playtest verdict (INTERESTING / QUIET / INCOMPLETE shapes).
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r245
  control prior (0/8) and arm (2/8): a single flip is noise; three is
  a movement. The r244 national rate (1/8) is the older control prior.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is new this run: phantomDays5 (vetbar
  shadow5 > readiness5 days) is the instrument's own record of the
  hold, read as stall days per seed. If the instrument proves to
  measure something else, the metric review says so and the next run
  revises it — this run is judged on it as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
