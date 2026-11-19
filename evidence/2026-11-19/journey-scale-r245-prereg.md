# journey-scale r245 — PRE-REGISTER (lane A, leg 3 SCALE, sub-cap lift lever panel)

**Run id:** `2026-11-19T14:46:29Z` (lock run_id).
**Run:** scheduled Thu 2026-11-19 08:45 CST (14:45 UTC); lock created 14:46:29Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3). NOTE: r244's note
said it would write 3→0 on success, but the rotation file still read 3
at this run's start — either r244's closeout did not write it or a
later run re-set it. This run plays scale as the rotation says and
writes 0 at its own closeout; the discrepancy is recorded, not
"fixed" by guessing.
**Base:** local master `de9bb3c22` at prereg time (journey-succession
r248 merged; r244 scale merged).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 49%, no lock present (no stale-lock recovery needed). `git pull`
already up to date. Reap ran (exit 0; 12/16 active, all with
uncommitted changes — reaper correctly leaves them). Worktree
registration took ~10.3 min (slow checkout under load, no flap error).
Heartbeat landed at registration and a 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r245.sh`) runs for the
whole run.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs), zero `src/js` change.
**TEST WITH ENCOUNTER GEAR (Steve 2026-11-13):** the policy fights with
the party and gear the competent player has by the leg — the muster/march
steps are that policy, not a fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01) + ROOT-CAUSE FIRST (2026-10-16):**
r244's metric review ordered the next scale run to test the formation
wall, naming the r113 sub-cap guard as the prime suspect. This run
carries that lever — diagnosed from r244's own corpora first (below,
no new sims spent on it). The lever is POLICY-ONLY (zero `src/js`):
the guard lives in the policy file, not the engine.
**Time-box (stated up front):** hard stop ~16:46Z (2h from the 14:46Z run
start). The panel is 8 fresh seeds × 140d × 2 arms; each sim ~2.5 min,
2 concurrent. The `--quick` gate is launched in the background right after
the build commit; the analyzer proof tests are the binding suite for a
driver/policy-only change, and the gate result is reported if it lands
before closeout — if it does not, the run note says so and the merge waits
for it (no landing over an unfinished gate).

## Standing context (read before scoring)

- **r244 scale (landed 2026-11-19):** Q1 NO-GO — answermail fires (8/8
  seeds, 60 tends, 27 renegotiation answers) but national stays 1/8
  both arms (delta 0). The answermail composition stays a branch. The
  blocker taxonomy is identical on both arms — FORMATION-FEW 3,
  COLLAPSE 3, FORMATION-LATE 1, NATIONAL 1. The wall is formation,
  not trust. The tend pantry gate (20,000 kcal) blocked 945 tend
  attempts vs 60 paid (94%) — a future lever with its own prereg, NOT
  tuned here (it is a game-code gate; the gating freeze stands).
- **r243 scale (landed 2026-11-18):** Q1 GO — the raise-accept echo fix
  landed. Q2: **0/8 national**, all blocked on the LEAD seasoned-link
  shortage; lesser seat priced 8/8. r239: 2/8 national. r242: 1/8.
  The national wall is now the finding, four runs deep.
- **r243 deepening (landed 2026-11-19, master 800405556):** Q1-STANDDOWN-GO
  (staged probe), Q2 FAIL 1/8 (muster tops out at 9 blades; Haven cap of
  3 is the binding blade), F2-HAVE-GO. Wave-5 door 0/8. The winnability
  wall stands at coalition + launch, not at the scale leg alone.
- **Answermail prior (evidence/2026-11-10/answermail-panel-confirm.md):**
  on the competent BASE policy (16 paired cases), answermail moved
  national 0→0. Two confirmations now; NOT re-tested here. ANSWERMAIL
  is OFF on both arms this run.

## Diagnosis — the wall, from r244's own corpora (no new sims)

Linkraise counters from the r244 trust JSONs
(`census.linkraise`, goal hidden_files/evidence/2026-11-19,
seeds 103861–103868), control arm B:

| Seed | seen | answered | linked | skipped-sub-cap | skipped-not-ready |
|---|---|---|---|---|---|
| 103861 | 27 | 1 | 1 | 26 | 0 |
| 103862 | 24 | 1 | 1 | 23 | 0 |
| 103863 | 7 | 1 | 1 | 6 | 0 |
| 103864 | 14 | 1 | 1 | 10 | 0 |
| 103865 | 9 | 0 | 0 | 9 | 0 |
| 103866 | 6 | 0 | 0 | 1 | 3 |
| 103867 | 22 | 2 | 2 | 18 | 0 |
| 103868 | 8 | 2 | 2 | 2 | 0 |
| **Total B** | **117** | **8** | **8** | **95** | **3** |

Arm C (answermail): seen 143, answered 7, linked 7, sub-cap 124,
not-ready 3. Same shape — the answermail arm answered nothing extra
about raises.

Read: **81% of the control's raise-sightings (95/117) were refused by
the r113 sub-cap guard** — the policy-side rule in
`scripts/policies/scalecourt-traderoad-r113-linkraise.js` that holds
Haven-primary subordinates at 1 while the trade window is open
(unsealed, before day 120), "keeping the village budget for trade
routes". On 6/8 control seeds the policy answered exactly ONE raise
all run — the first sub, on day 10–17 — and refused every later raise
until the window closed. The only 2nd links on the band (103867,
103868, 2 each) formed after d120, when the guard lifted — too late
to season by d140. Villagers kept raising (a raise re-fires after the
14-day cooldown; 103861 saw 27 sightings); the policy kept saying no.
The formation-few wall is, on this evidence, a POLICY wall: the
villagers offer the 2nd and 3rd links and the competent player
refuses them by rule.

The r113 rationale (trade budget) is the trade-off this run measures:
lifting the cap may cost the trade road. The panel watches TRADE
national on the arm vs the control alongside LEAD.

## Seed-band freshness

- **Band: FRESH 103871–103878.**
- Searched before the run: all `evidence/*/journey-*-prereg.md` +
  `evidence/*/sim-*-prereg.md` — **0 hits** for any of 103871–103878.
  Searched goal `hidden_files/evidence/` (.md) — **0 hits**. The
  three preregs that name a forbidden band list (sim-shoutgate-a,
  sim-fullseat-recheck-a, sim-trajband-a) were not re-grepped this
  run; the numbers 103871–103878 are 3 above r244's band and appear
  in no prereg read for this run.
- **Collision record (so the next worker does not repeat it):**
  103801–103808 and 103811–103818 reserved (r242 prereg); 103821–103828
  and 103831–103838 spent (r239); 103841–103848 spent (r242);
  103851–103858 spent (r243 scale); 103861–103868 spent (r244 scale).
  Do not reuse.

## Pre-registered questions

- **Q1 — THE LEVER: LIFT THE SUB-CAP (decides the composition's verdict).**
  The defect is POLICY, not game: the r113 sub-cap guard refuses
  every 2nd-sub raise while the trade window is open, and the 2nd/3rd
  subs that do form arrive after d120, too young to season by d140.
  **Lever:** a sub-cap-off variant of the linkraise policy
  (`scripts/policies/scalecourt-traderoad-r113-linkraise-subcapoff.js`
  + `-sit` wrapper): the guard block is replaced by a counted
  pass-through — raises for a 2nd/3rd Haven-primary sub are answered
  exactly like the 1st (courtship-ready ≥55, in conversation,
  link:accept only when offered, at most one answer per day, same
  skip rules otherwise). Zero `src/js` changes; the accept is the
  same engine path a player clicks.
  Balanced panel (§15): CONTROL arm B (r244 control verbatim:
  `scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON,
  MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off) vs ARM C
  (B with the sub-cap-off policy), same 8 fresh seeds 103871–103878,
  DAYCAP 140.
  - **GO iff (a)** the mechanism fires — the arm answers a raise
    for a 2nd or 3rd sub (raisesLinked ≥2, or a sub-cap-off
    pass-through followed by a link) on ≥6/8 seeds (else the panel
    is INCOMPLETE on Q1: a lever that never fires proves nothing);
    **AND (b)** arm national **≥3/8** AND arm − control **≥2**.
    **PARTIAL** iff arm > control but below 3/8 (the lever moves the
    wall but does not clear it — composition stays a branch,
    documented).
  - **What Q1 does NOT prove:** that the trade road survives the
    lift (Q2 watches TRADE national on the arm), or that sub-cap-off
    moves national on other policies.
- **Q2 — NATIONAL / DEED GATE + BLOCKER TAXONOMY (measurement, NOT a
  gate):** on both arms, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? PLUS, per seed, the blocker
  class for the 3rd seasoned link on the closest road, from the link
  lifecycle (formation day, trust at end, seasoned day or never, snaps):
  FORMATION-LATE (3rd link forms after d110) / TRUST-LOW (formed by
  d110, trust <40 at d140) / SNAP / COLLAPSE. Interesting iff the
  taxonomy names a single dominant blocker on ≥5/8 control seeds, OR
  the arm flips the taxonomy. PLUS the trade-road watch: TRADE
  national / trade league size on arm C vs B — if lifting the cap
  kills trade, that is the cost of the lever, reported plainly.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, lived-days
  per-seed mean within ±25% of the control **123** (r233's 8-seed mean),
  lesser seat priced ≥4/8. Both arms.
- **Q4 — PEOPLE CHECK:** read 1–2 full transcripts (d90/d120) in full,
  PLUS the nonverbal sittings AND all raise talks (both arms).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states (M23 shape), survival. The wave-5 door question: did
  any village FACE the door (not just fight roaming wave-5 beasts)?
- **Q6 — DIALOGUE WATCH (carried):** the r239 Q6 "tell me more" echo
  shape — watched for in the r245 transcripts and recorded; a
  dialogue-content fix belongs to this run only if it is the same
  link-accept line (it is not — Q1 is policy-only).

## Policy (frozen)

CONTROL (arm B): `scalecourt-traderoad-r113-linkraise-sit` + muster ON +
march ON (r244 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false. DAYCAP=140,
death-aware stop (+10d tail max). Seeds FRESH 103871–103878.
ARM (arm C): control with the linkraise layer swapped for
`scalecourt-traderoad-r113-linkraise-subcapoff-sit` (same seatdrive +
modalplay composition, same daily order). The ONLY behavioral delta is
the guard: 2nd/3rd-sub raises are answered by the same rule as the 1st.
Pilot: seeds 103871–103873 × both arms first. Pilot gates: driver clean,
mechanism fires (≥1 sub-cap-off pass-through followed by a 2nd-sub link
across the 3 arm seeds, or ≥1 raisesLinked ≥2 on an arm seed), no new
bad-line class, ≥1 musterWatch row on a titan day.
A pilot that shows the guard lifting but zero 2nd-sub links (raises
never courtship-ready, or no raises at all) STOPS the run — the lever
is dead on arrival, document and move on (§9).

## Fix scope (pre-registered — the build is not scope creep)

- NO `src/js` changes. The lever is a policy composition in the driver.
- Policy (`scripts/policies/scalecourt-traderoad-r113-linkraise-subcapoff.js`,
  cloned from the r113 linkraise policy): the sub-cap guard block is
  replaced by a counted pass-through (`raisesPassedSubCapOff`, event
  `raise-pass sub-cap-off`); every other line — raise-answer shape,
  counters, talk recording — is byte-identical to the base. Sit wrapper
  (`...-subcapoff-sit.js`) cloned from the r113 sit wrapper, requiring
  the subcapoff base. Both files carry a header naming the r245 prereg.
- Driver (`scripts/journey-scale-r245-20261119.js`, cloned from r244):
  seeds 103871–103878, corpus tags r245, `SUBCAPOFF=1` arms the C
  composition (default off = control B), `STAGE_CAPSTONE=off`
  default, `MUSTER_HOLD=sitting`, ANSWERMAIL off on both arms
  (answermail ledger still written, null stats — the analyzer's
  ANSWERMAIL section reads zeros).
- Analyzer (`scripts/analyze-journey-scale-r245-20261119.js`): cloned
  from r244; Q1 rewired to the sub-cap lever (SUBCAP section:
  raisesPassedSubCapOff, raisesLinked, sub-formation days, 3rd-sub
  formation day by arm, arm-vs-control national delta); Q2 adds the
  trade-road watch (TRADE national / league size arm vs control);
  Q3/Q4/Q5 carried verbatim (paths r245).
  Proof test `scripts/test-journey-scale-r245-analyzer-20261119.js`:
  cloned from r244's cases, sub-cap verdict cases added
  (mechanism-fires GO / mechanism-dead INCOMPLETE / arm-vs-control
  national delta / trade-cost watch).
- **Landing rule (pre-registered):** the sub-cap-off composition becomes
  the scale policy default ONLY on a Q1 GO. On PARTIAL / NO-GO /
  INCOMPLETE it stays a branch (the driver keeps the `SUBCAPOFF` flag
  for future runs) and the proof test is preserved in the goal evidence
  dir. No `src/js` landing is possible in this run by construction.

## Metric review (carried)

- Q1's bar (arm ≥3/8, arm−control ≥2) is set against the diagnostic:
  on r244's band the guard refused 95/117 control raise-sightings and
  the only 2nd links formed after d120. If the guard is the wall, the
  lift should flip the FORMATION-FEW seeds (3/8 on r244) — 3/8 demands
  the lever do more than rescue one near-miss. The r244 national rate
  (1/8 each arm) is the control prior: a single flip is noise.
- The lived-days control stays **123** (r233's 8-seed mean).
- Q2 is deliberately gate-free: the taxonomy is the finding, and the
  trade-road cost of the lift is the named second read.
- The r244 note said "6 failed" for r243's gate but its log says 7;
  r244's own gate was 335/9. This run's count is taken from the log,
  not the note.
