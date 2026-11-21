# journey-scale r248 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261121T0243Z` (lock run_id).
**Run:** scheduled Fri 2026-11-20 20:45 CST (02:45Z).
**Rotation read 3 → leg 3 SCALE.** Closeout (rotation write 3→0) is this
run's job at the end.
**Base:** local master `f9ed3a851` at prereg time (Loop A fleshout round
0015Z landed; lane B social r260 landed).
**Pre-flight:** main tree clean, disk 43%. Worktree `journey-scale`
registered ~02:48Z; registration slow (~10 min, `git reset --hard` under
heavy sibling load — pinquaddoor driver + journey2-crisis gate running)
but clean: `git status` 0 lines, NO index clobber at creation (unlike
r247). Heartbeat landed 02:58Z, hbloop `journey-scale-hbloop-r248.sh`
pid 43419 (5-min loop) running for the whole run.
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
**Time-box (stated up front):** hard stop ~04:45Z (2h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min, 2 concurrent. The
`--quick` gate runs right after the build commit; the full gate runs
before the merge and its result is reported from the log, not the note.

## Rotation note (why scale again)

r247 LANDED on master as `b6a551691` (verified ancestor of HEAD) but the
rotation file still read 3 at this run's start: r247's closeout missed
the rotation write (its note says the merge was pending at note time;
the adoption merged without writing rotation). This run therefore plays
scale again per the rotation file and writes 3→0 at closeout. No seed
band is re-used: r247's band 103891–103898 stays spent.

## Standing context (read before scoring)

- **r247 scale (landed 2026-11-20 as b6a551691):** Q1 PLAYTEST PANEL
  VERDICT QUIET — national 1/8, lesser seat priced 8/8, full seat 1/8
  (first on the control policy since r244, via the TRADE road, seed
  103892), wave-4 kills 31, wave-5 faced 1/8, standing-199 stall 4/8
  seeds / 192 days, survival 6/8. Blocker taxonomy: FORMATION-FEW 3,
  COLLAPSE 2, FORMATION-LATE 1, SNAP 1, NATIONAL 1. Firsts: first
  tribute deliveries on this leg in recent runs (2/8); first field
  wave-5 kill on the scale leg (103894, d120). Blank filled:
  settled-help names the favor (convo-dialogue.js; proof test 13
  checks; flagged [needs-eyes], no phone check done). NOT fixed
  (recorded): the raise-talk template (11/11 identical opener, 8/11
  identical acceptance, no refusal path in evidence — "the remaining
  flat spot"); the NV 3-nod cycle (Sanne, Vittorio) + thin NV closing
  pool; the Debora heed loop (dlg:heed 4×, player lines repeat verbatim,
  warning never named, no closing line); orphaned invitations in 4/11
  raise talks. Q6 echo ABSENT in r247; closing-line duplication ABSENT.
- **r246 scale:** QUIET — national 0/8, lesser 8/8, full 0/8, w4 kills
  27, w5 faced 2/8, stall 1/8 (15d). Blank filled: want-menu react
  wind-down (convo-wants.js). Formation wall as in r244/r245.
- **Loop A fleshout 0015Z (landed 2026-11-21 as f9ed3a851):** lendpool
  DIAG-GO (finding #2628: holder supply empty — next lever HOLDER
  SUPPLY), fibersupply DIAG-NO-GO (finding #2590: fiber supply binds),
  fiberfetch NO-GO CONCEPT-DEAD (the fetch never fired; remaining served
  gap is the ROLL wall). Those levers belong to lever rounds, not this
  playtest leg; this run measures the leg on the merged master.
- **Lane B social r260 (landed 2026-11-21 as af2320278):** M12-native
  NO-GO by one sitting (repeat-prefix escalator cycles past its cap) —
  filed as r261's fix arm, not this run's.

## Seed-band freshness

- **Band: FRESH 103911–103918.**
- **Collision (recorded so the next worker does not repeat it):**
  first choice 103901–103908 is TAKEN — the launchparty band (Nov 18),
  named in sim-expedroster-b-prereg.md, sim-fightgate-scope-b-prereg.md,
  sim-triodrought-b-prereg.md, sim-wildavoid-a-prereg.md,
  sim-wildavoid-confirm-a-prereg.md, sim-winnability-round-0130.md and
  sim-winnability-round-0430.md. Do not reuse.
- Searched before the run: all `evidence/**/*.md` in the repo — **0
  hits** for any of 103911–103918 as a seed naming; goal
  `hidden_files/evidence/**/*.md` — hits only as pantry-quantity
  substrings (`pantryFreshBefore:103916`) in Oct 16–17 census JSONs —
  data values, not seed-band namings; `scripts/**/*.js` — **0 hits**.
  (Scope matches the r246/r247 search.)
- **Collision record:** 103801–103808 and 103811–103818 reserved (r242);
  103821–103828 and 103831–103838 spent (r239); 103841–103848 spent
  (r242); 103851–103858 spent (r243); 103861–103868 spent (r244);
  103871–103878 spent (r245); 103881–103888 spent (r246);
  103891–103898 spent (r247); 103901–103908 spent (launchparty band,
  Nov 18). Do not reuse.

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244/r245/r246/r247 control policy verbatim (below), 8 fresh seeds
  103911–103918, DAYCAP 140.
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
- **Q6 — DIALOGUE WATCH (carried):** the r247-recorded flat spots —
  the raise-talk template (11/11 identical opener), the NV 3-nod cycle,
  the Debora heed-loop shape (player lines repeating verbatim, unnamed
  warning, missing closing line), orphaned invitations in raise talks.
  A dialogue-content fix belongs to this run only if it is a blank this
  run finds. Also watch the closing-line duplication (absent in r247).

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244/r245/r246/r247 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 103911–103918.
Pilot: seeds 103911–103913 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict).
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. Master
moved since r247 (r247's convo fix + the 0015Z fleshout merges), the
leg's blocker taxonomy needs 8 seeds, and the panel costs ~20 min.
The pilot's interestingness gates nothing except the instrument gates
above.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r248-20261121.js`, cloned from r247):
  seeds 103911–103918, corpus tags r248, EVIDIR 2026-11-21, single arm
  B only. No behavior change from the r247 control.
- Analyzer (`scripts/analyze-journey-scale-r248-20261121.js`): cloned
  from r247; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above). Q2/Q3/Q4/Q5 carried verbatim (paths r248).
  **Stall metric revision ADOPTED (r247 proposed, §14):** alongside the
  as-written stall total, report stalled days split by whether the
  village was otherwise ready (national reached OR 2+ living veterans
  OR wave-5 unlocked) — the current metric conflates "earned but
  unreleased" lag with "blocked". The as-written total stays the
  binding Q1 metric this run; the split is the proposed revision in
  force.
- Proof test (`scripts/test-journey-scale-r248-analyzer-20261121.js`):
  cloned from r247's; panel cases carried (single-arm playtest verdict
  INTERESTING / QUIET / INCOMPLETE shapes).
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r247
  control prior (1/8) and the r245 arm (2/8): a single flip is noise;
  three is a movement. The r244 national rate (1/8) is the older
  control prior.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is carried from r247: phantomDays5
  (vetbar shadow5 > readiness5 days) is the instrument's own record of
  the hold, read as stall days per seed — PLUS the otherwise-ready split
  adopted above.
- The vetbar duplicate-day quirk (r247: every seed records some days
  twice; stall total overcounts by ~1 day band-wide) is carried as a
  known instrument quirk; the metric is judged as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
