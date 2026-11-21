# journey-scale r249 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261121T1645Z` (lock run_id).
**Run:** scheduled Sat 2026-11-21 10:45 CST (16:45Z).
**Rotation read 3 → leg 3 SCALE.** Closeout (rotation write 3→0) is this
run's job at the end.
**Base:** local master `e0bd9688d` at prereg time (Loop B poolfirstfail
re-freeze DIAG-GO landed; deepening r248 evidence-only landed
`df4867134`).
**Pre-flight:** main tree clean, disk 47%. **Stale-lock recovery (this
run's preflight, not the leg):** the 1345Z deepening run
(`playtest-20261121T1345Z`) died in the ~16:22Z machine restart
(heartbeat stopped 16:21:08Z, uptime 21 min at check, no live
coordinator, no file writes after 16:00Z) — its merge `df4867134` was
already on master, so this run finished its closeout tail first:
rotation-a 2→3 written, lock deleted (same-call verify), worktree
`journey-deepening` released + removed, branch deleted, main tree
verified clean. This run then plays scale per the advanced rotation.
**Worktree `journey-scale` registered ~16:46Z; registration slow
(~4.3 min, sibling load) but clean. Heartbeat landed 16:51:09Z,
hbloop `journey-scale-hbloop-r249.sh` (5-min loop) running for the
whole run.
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
**Time-box (stated up front):** hard stop ~18:45Z (2h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit; the full gate runs
before the merge and its result is reported from the log, not the note.

## Standing context (read before scoring)

- **r248 scale (landed 2026-11-21 as 36d694f13):** Q1 PLAYTEST PANEL
  VERDICT QUIET — national 0/8, lesser seat priced 8/8 (days 34–59),
  full seat 0/8, wave-4 kills 23, wave-5 faced 2/8, standing-199 stall
  4/8 seeds / 52 days, survival 5/8, lived-days mean 133.1. Blocker
  taxonomy: FORMATION-FEW dominant; no NATIONAL, no RUNG, no UNKNOWN.
  The stall split (r248 revision, seed-level): all 52 stalled days sit
  on otherwise-ready seeds — the stall is "earned but unreleased" lag,
  never a village blocked for lack of veterans or readiness. Tribute
  2/8 DELIVERED (third straight run with deliveries); feast embassy
  103913 d99. W5-INSTANCE: no village FACED the wave-5 door as a door
  — only roaming wave-5 beasts. Blank filled: raise-opener variety by
  lore-how (bond-initiation.js; proof test; flagged [needs-eyes], no
  phone check done). Recorded, not fixed: Onni's "come see what I
  found" payoff shrug (invitation promises something unbelievable,
  delivers nothing); Daniyar's 3-nod NV loop (middle empty after the
  first nod); orphaned invitations in 4/14 raise talks. Q6 echo
  ABSENT again; closing-line duplication ABSENT on this leg.
- **r247 scale (landed 2026-11-20 as b6a551691):** Q1 QUIET — national
  1/8, lesser seat priced 8/8, full seat 1/8 (first on the control
  policy since r244, via the TRADE road, seed 103892), wave-4 kills 31,
  wave-5 faced 1/8, standing-199 stall 4/8 seeds / 192 days, survival
  6/8. Blocker taxonomy: FORMATION-FEW 3, COLLAPSE 2, FORMATION-LATE 1,
  SNAP 1, NATIONAL 1. First field wave-5 kill on the scale leg
  (103894, d120). Blank filled: settled-help names the favor.
- **r246 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  27, w5 faced 2/8, stall 1/8 (15d).
- **Loop B poolfirstfail re-freeze (landed 2026-11-21 as e0bd9688d):**
  DIAG-GO, 0 src/ changes — the re-freeze amendment only. No behavior
  change on this leg; this run measures the leg on the merged master.
- **Deepening r248 (landed 2026-11-21 as df4867134, evidence only):**
  Q1 growth-line GO 8/8 exact; wave-5 wall 1/8 unlocked never faced;
  6/8 villages parked at standing 199; closing-line duplication
  GRADUATES to named defect (4 sightings across 3 runs) — the
  conversation build arm owns the fix. This run watches whether the
  duplication shows on the scale leg too (Q6).

## Seed-band freshness

- **Band: FRESH 103921–103928.**
- Searched before the run: repo `evidence/**/*.md` + `scripts/**/*.js` +
  `docs/` — **0 hits** for any of 103921–103928; goal
  `hidden_files/**/*.md` — **0 hits**; `~/memory/2026-11-*.md` —
  **0 hits**. (Scope matches the r248 search; the unscoped grep over
  all of evidence/ was killed as too slow — the huge census JSONs are
  data values, not seed namings, and the .md/.js scope is the naming
  surface.)
- **Collision record:** 103801–103808 and 103811–103818 reserved (r242);
  103821–103828 and 103831–103838 spent (r239); 103841–103848 spent
  (r242); 103851–103858 spent (r243); 103861–103868 spent (r244);
  103871–103878 spent (r245); 103881–103888 spent (r246);
  103891–103898 spent (r247); 103901–103908 spent (launchparty band,
  Nov 18); 103911–103918 spent (r248). Do not reuse.

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244/r245/r246/r247/r248 control policy verbatim (below), 8 fresh seeds
  103921–103928, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (seeds with phantomDays5 > 0 + total stall days — days the readiness
  gate holds the village at the t5-1 cap), survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r245-observed set {TRUST-LOW, NATIONAL, SNAP, FORMATION-FEW,
  FORMATION-LATE, COLLAPSE, RUNG, UNKNOWN}), OR a fixable defect in the
  table-approach path. Else QUIET — the wall stands as measured
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
- **Q6 — DIALOGUE WATCH (carried):** the r248-recorded flat spots —
  the raise-talk opener (now varied by lore-how in r248 — does the
  variety hold on fresh seeds?), the NV 3-nod cycle (Daniyar), the
  "come see what I found" payoff shrug (Onni), orphaned invitations in
  raise talks. Plus the deepening-r248 closing-line duplication defect:
  does closing line == first winddown line verbatim show on this leg?
  A dialogue-content fix belongs to this run only if it is a blank this
  run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244/r245/r246/r247/r248 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 103921–103928.
Pilot: seeds 103921–103923 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. Master
moved since r248 (poolfirstfail re-freeze + deepening r248 evidence),
the leg's blocker taxonomy needs 8 seeds, and the panel costs ~20 min.
The pilot's interestingness gates nothing except the instrument gates
above.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r249-20261121.js`, cloned from r248):
  seeds 103921–103928, corpus tags r249, EVIDIR 2026-11-21, single arm
  B only. No behavior change from the r248 control.
- Analyzer (`scripts/analyze-journey-scale-r249-20261121.js`): cloned
  from r248; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above). Q2/Q3/Q4/Q5 carried verbatim (paths r249).
  Stall split (r248 revision) carried: stalled days split by whether
  the village was otherwise ready (national reached OR 2+ living
  veterans OR wave-5 unlocked) — seed-level. The as-written total stays
  the binding Q1 metric this run; the split is the carried revision.
- Proof test (`scripts/test-journey-scale-r249-analyzer-20261121.js`):
  cloned from r248's; panel cases carried (single-arm playtest verdict
  INTERESTING / QUIET / INCOMPLETE shapes).
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r248
  control prior (0/8) and the r247 control prior (1/8): a single flip
  is noise; three is a movement.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is carried from r248: phantomDays5
  (vetbar shadow5 > readiness5 days) is the instrument's own record of
  the hold, read as stall days per seed — PLUS the otherwise-ready split
  adopted in r248. r248 answered the "block or lag" question (lag);
  this run carries the split as measurement, not as a new question.
- The vetbar duplicate-day quirk (r247: every seed records some days
  twice; stall total overcounts by ~1 day band-wide) is carried as a
  known instrument quirk; the metric is judged as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
