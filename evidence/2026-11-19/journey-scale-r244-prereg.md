# journey-scale r244 — PRE-REGISTER (lane A, leg 3 SCALE, answermail lever panel)

**Run id:** `2026-11-19T07:46:41Z` (lock run_id).
**Run:** scheduled Thu 2026-11-19 01:45 CST (07:45 UTC); lock created 07:46:41Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `800405556` at prereg time (r243 deepening merged;
contains the r243 scale echo fix, landed + merged locally).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 44%, stale lock recovered (lock read `2026-11-19T05:50:25Z`, no
registry tree for that run_id; the journey-deepening r243 run had already
merged and deleted the lock by 07:46Z — recorded as stale-lock recovery).
`git pull` already up to date. Reap ran (exit 0; 9/16 active, all with
uncommitted changes — reaper correctly leaves them). Worktree
registration took ~5.7 min (slow checkout, no flap error). Heartbeat
landed at registration and a 9-min hbloop
(`~/workspace/worktrees/journey-scale-hbloop-r244.sh`) runs for the
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
r243's metric review ordered the next scale run to carry a lever for
seasoned links or say plainly it is measuring the wall again. This run
carries the lever — but only after diagnosing the wall from r243's own
corpora first (diagnosis below, no new sims spent on it). The lever is
POLICY-ONLY (zero `src/js`): the game already stages the trust verbs;
the competent player never uses them.
**Time-box (stated up front):** hard stop ~09:45Z (2h from the 07:46Z run
start). The panel is 8 fresh seeds × 140d × 2 arms; each sim ~2.5 min,
2 concurrent. The `--quick` gate is launched in the background right after
the build commit; the analyzer proof tests are the binding suite for a
driver/policy-only change, and the gate result is reported if it lands
before closeout — if it does not, the run note says so and the merge waits
for it (no landing over an unfinished gate).

## Standing context (read before scoring)

- **r243 scale (landed 2026-11-18):** Q1 GO — the raise-accept echo fix
  landed. Q2: **0/8 national**, all blocked on the LEAD seasoned-link
  shortage; lesser seat priced 8/8. r239: 2/8 national. r242: 1/8.
  The national wall is now the finding, three runs deep.
- **r243 deepening (landed 2026-11-19, master 800405556):** Q1-STANDDOWN-GO
  (staged probe), Q2 FAIL 1/8 (muster tops out at 9 blades; Haven cap of
  3 is the binding blade), F2-HAVE-GO. Wave-5 door 0/8. The winnability
  wall stands at coalition + launch, not at the scale leg alone.
- **Scale-onramp round 0115 (2026-11-19):** national 0/8 on every arm;
  table null; wins 0/8. Both levers HELD.
- **Answermail prior (evidence/2026-11-10/answermail-panel-confirm.md):**
  on the competent BASE policy (16 paired cases), answermail moved
  national 0→0 (no material signal), community loss 0.875→0.75, village
  deaths/run 84→88 (regression_watch). Decision: review_required. This
  run tests a DIFFERENT configuration — the scale policy, where links
  exist to tend — so the prior tempers the bar but does not decide it.

## Diagnosis — the wall, from r243's own corpora (no new sims)

Script `/tmp/linkdiag.py` over the r243 trust JSONs + trust-events
(goal hidden_files/evidence/2026-11-18, seeds 103851–103858). Per-seed
blocker for the 3rd seasoned link:

| Seed | Blocker | Evidence |
|---|---|---|
| 103851 | TRUST DECAY | subs d25/d29, age 117/113, trust **34/37** — just below 40. succession 10, titan 9, crisis 6, **tended 0**. |
| 103852 | COLLAPSE | over d125; had 2 seasoned subs. |
| 103853 | FORMATION-LATE | 2nd link trade d107, 3rd covenant d121 — too late to season by d140. |
| 103854 | SNAP + LATE | sub broke, re-formed d134 (inherited arrears). |
| 103855 | FORMATION-LATE | subs d120/d124/d125 (burst after the d120 trade-window close); young-link hits stack: succession −8 + silence −6 + titan −5 → trust 13–19. |
| 103856 | TRUST DECAY | sub d23 trust **32** (age 118); trades trust 15/10/10. crisis **33**, succession 14, **tended 0**. |
| 103857 | TRUST, ONE POINT SHORT | TRADE 2/3 seasoned; 3rd trade d59 trust **39/40**. Subs 2/2 seasoned. |
| 103858 | FORMATION-LATE + TRUST | TRADE 1/3 seasoned; 2nd trade d95 trust 23. |

Two walls, not one. **Trust decay (3/8 seeds + the one-point short):**
every speaker death taxes EVERY link −8 (successionCrisis), renegotiation
beats expire in silence (−6), titan strikes −5 — and the policy NEVER
tends (tended 0 on 103851/103853/103854/103856) and NEVER answers a
renegotiation beat. The game stages the answers (grain +8, speaker,
accord gift +10); the player leaves them on the table. **Formation-late
(3/8 seeds):** the r113 trade-first sub-cap guard holds subs at 1 while
the trade window is open (before d120), so the 2nd/3rd subs burst in at
d120+ and cannot season by d140 (30-day clock). This run carries the
TRUST lever (Q1) and records formation-late as the named next question
(Q2 diagnostic) — one lever per run, attribution stays clean.

## Seed-band freshness

- **Band: FRESH 103861–103868.**
- Searched before the run: all `evidence/*/journey-*-prereg.md` +
  `evidence/*/sim-*-prereg.md` — **0 hits** for any of 103861–103868.
  Searched goal `hidden_files/evidence/` (.md) — **0 hits**. Checked the
  three preregs that name a forbidden band list
  (sim-shoutgate-a, sim-fullseat-recheck-a, sim-trajband-a) — none names
  103861–103868; the forbidden bands named there are 73641–73648 etc.
  A full-repo grep matched the numbers only inside JSON corpora as data
  values (same class as r243's recorded caveat) — no prereg, forbidden
  list, contaminated list, screen, or extension band names them.
- **Collision record (so the next worker does not repeat it):**
  103801–103808 and 103811–103818 reserved (r242 prereg); 103821–103828
  and 103831–103838 spent (r239); 103841–103848 spent (r242);
  103851–103858 spent (r243 scale). Do not reuse.

## Pre-registered questions

- **Q1 — THE LEVER: ANSWER-THE-MAIL (decides the composition's verdict).**
  The defect is POLICY, not game: the scale policy never tends a link
  and never answers a staged renegotiation beat, while every speaker
  death taxes every link −8 and unanswered beats cost −6 each.
  **Lever:** compose `answerTheMail` (`scripts/policies/competent-answermail-a.js`,
  Nov 10: pendingAccord → gift; weekly tendLink on active LEAD links
  when pantry > 20,000 kcal; pendingRenegotiation → gift; pendingDemand
  → honor) into the scale policy's daily step, AFTER the base daily.
  Zero `src/js` changes; every verb is an existing engine path a player
  clicks, with real pantry costs.
  Balanced panel (§15): CONTROL arm B (r243 policy verbatim) vs ARM C
  (B + answerTheMail), same 8 fresh seeds 103861–103868, DAYCAP 140.
  - **GO iff (a)** the mechanism fires — the arm's answermail stats
    show ≥1 tend or renegotiation answer on ≥6/8 seeds (else the panel
    is INCOMPLETE on Q1: a lever that never fires proves nothing);
    **AND (b)** arm national **≥3/8** AND arm − control **≥2**.
    **PARTIAL** iff arm > control but below 3/8 (the lever moves the
    wall but does not clear it — composition stays a branch, documented).
  - **What Q1 does NOT prove:** that the formation-late wall is solved
    (Q2 measures it), or that answermail moves national on other
    policies (the Nov 10 prior stands for the competent base).
- **Q2 — NATIONAL / DEED GATE + BLOCKER TAXONOMY (measurement, NOT a
  gate):** on both arms, how many of 8 fresh villages reach national (by
  standing / by scaleRank), open the deed gate (`deedGateReady`), are
  offered the table, take a seat by d140? PLUS, per seed, the blocker
  class for the 3rd seasoned link on the closest road, from the link
  lifecycle (formation day, trust at end, seasoned day or never, snaps):
  FORMATION-LATE (3rd link forms after d110) / TRUST-LOW (formed by
  d110, trust <40 at d140) / SNAP / COLLAPSE. Interesting iff the
  taxonomy names a single dominant blocker on ≥5/8 control seeds, OR
  the arm flips the taxonomy. The deed-gate timing question (r239
  103825 vs 103828) carries: for every national village that delivers
  a capstone and gets no seat by d140, name the discriminator.
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
  shape — watched for in the r244 transcripts and recorded; a
  dialogue-content fix belongs to this run only if it is the same
  link-accept line (it is not — Q1 is policy-only).

## Policy (frozen)

CONTROL (arm B): `scalecourt-traderoad-r113-linkraise-sit` + muster ON +
march ON (r243 policy verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off`. Sortie INERT. SIT false. DAYCAP=140, death-aware
stop (+10d tail max). Seeds FRESH 103861–103868.
ARM (arm C): control + `answerTheMail` after the base daily step
(`scripts/policies/competent-answermail-a.js`, required not copied;
stats captured per seed via `answermailStats()`).
Pilot: seeds 103861–103863 × both arms first. Pilot gates: driver clean,
mechanism fires (≥1 tend or renegotiation answer across the 3 arm
seeds), no new bad-line class, ≥1 musterWatch row on a titan day.
A pilot that shows the tend gate blocking everything (pantry ≤20k all
run) and zero renegotiation answers STOPS the run — the lever is dead
on arrival, document and move on (§9).

## Fix scope (pre-registered — the build is not scope creep)

- NO `src/js` changes. The lever is a policy composition in the driver.
- Driver (`scripts/journey-scale-r244-20261119.js`, cloned from r243):
  seeds 103861–103868, corpus tags r244, `ANSWERMAIL=1` arms the C
  composition (default off = control B), answermail stats captured per
  seed into the corpus (`answermail` JSON), `STAGE_CAPSTONE=off`
  default, `MUSTER_HOLD=sitting`.
- Analyzer (`scripts/analyze-journey-scale-r244-20261119.js`): cloned
  from r243; adds ANSWERMAIL section (tends, renegotiation answers,
  accord answers, demand answers, tendsBlockedPantry per seed, arm
  vs control) and BLOCKER section (per-seed closest-road blocker class
  from the link lifecycle: formation day / end trust / seasoned day /
  snaps, read from the trust JSON + trust-events); Q1 national/deed
  gate → Q2; guards → Q3; census/W5/spotter/mime carried.
  Proof test `scripts/test-journey-scale-r244-analyzer-20261119.js`:
  cloned from r243's cases, answermail + blocker cases added
  (mechanism-fires GO / mechanism-dead INCOMPLETE / blocker
  classification per class / arm-vs-control national delta).
- **Landing rule (pre-registered):** the answermail composition becomes
  the scale policy default ONLY on a Q1 GO. On PARTIAL / NO-GO /
  INCOMPLETE it stays a branch (the driver keeps the `ANSWERMAIL` flag
  for future runs) and the proof test is preserved in the goal evidence
  dir. No `src/js` landing is possible in this run by construction.

## Metric review (carried)

- Q1's bar (arm ≥3/8, arm−control ≥2) is set against the diagnostic:
  on r243's band the lever plausibly flips 103857 (39/40) and 103851
  (34/37 over 110 days of tends/answers) — 2 seeds — so 3/8 demands
  the lever do more than rescue the near-misses. The Nov 10 prior
  (0/16 national on the competent base) is the reason the bar is a
  count, not a rate: a single flip is noise.
- The lived-days control stays **123** (r233's 8-seed mean).
- Q2 is deliberately gate-free: the taxonomy is the finding, and the
  formation-late wall is the named next question.
- The tend pantry gate (20,000 kcal) is leadcourt's, not this run's:
  if `tendsBlockedPantry` dominates the arm stats, the next run's
  question is the gate, not the verb — recorded, not tuned here.
