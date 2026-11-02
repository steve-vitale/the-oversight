# Journey social r102 — RUN NOTE (lane B, 2026-11-02)

Leg 5 (social life), seeds 7201-7204, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master
351382038 at worktree registration. Rotation-b read 5 at run
start (social; the r79 gate run, r80/r81 outing-wedge runs and
the crisis/succession/endgame legs since all advanced it
consistently — no anomaly). Driver:
scripts/journey-social-r102-20261102.js (r81 verbatim except
fresh seeds, evidence dir, REPO default repointed at this run's
worktree). Wedge: scripts/journey-social-r102-outing-wedge.js
(r81 verbatim, rename only). Proof test
scripts/test-journey-social-r102-outing-wedge.js 67/67 on
SEED=42 and SEED=7 BEFORE seeds ran. Smoke 7205 (30d) PASS.
Measurement seeds ran with ZERO src/js changes; this run
measures the r81 fixes already in master, it does not change
the game.

## Pre-flight

- Main tree `git status --short` empty; disk 27%. Reap: active
  12/16, nothing removed; sibling dirty trees left untouched
  (including the journey2-succession, journey2-succession-r86
  and journey2-crisis-r90 trees with stale heartbeats and
  uncommitted changes — not mine, left alone, flagged for
  main-session inspection as r79/r90 did). Lock: none held at
  start (no stale-lock recovery needed). Worktree
  journey2-social-r102 registered + heartbeated (registry read
  back at every major step; heartbeat script itself takes
  ~60-150s in this container, so beats were manual, not a
  background loop — the r79 silenced-loop lesson applied).
- Canon: docs/CANON.md + docs/CONVERSATIONS.md + docs/PARTY.md
  read before judging; the partner-death ending
  (src/js/favor-forage.js forageFavorAction /
  performForageFavor, end_without_partner rule) and the
  accused_died closure (src/js/betrayal.js:1119) read in code
  for the two mechanism questions below. Gating freeze
  (2026-10-27) untouched.

## Pre-registration

See `prereg.md` in this directory (written before any seed
ran). Bindings judged as written; no metric re-scored. Arms
differ by construction (hands-off vs probe), so arm
comparisons are descriptive, NOT a balanced-panel
before/after claim against r81 or between arms. This run is
a fresh panel on the fixed build, not a fold into r81's
numbers.

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers | endedStuck |
| 7201 | handsoff | 34 | 1 | 11 | 2 | 2 | 1 | 2 | 0 | 0 | 0 | 1 |
| 7202 | handsoff | 141 | 1 | 49 | 15 | 15 | 11 | 10 | 9 | 9 | 9 | 1 |
| 7203 | mootprobe | 140 | 7 | 57 | 25 | 25 | 19 | 28 | 19 | 19 | 19 | 0 |
| 7204 | mootprobe | 143 | 1 | 43 | 13 | 12 | 8 | 10 | 7 | 7 | 7 | 0 |
| POOLED | — | — | 10 | 160 | 55 | 54 | 39 | 50 | 35 | 35 | 35 | 2 |

Starts 39/54 accepts (72%); delivers 35/39 starts (90%).
Blocked decomposition: no-micro-pos 19, away 18,
node-elsewhere 10, micro-far 2, non-adjacency 1. Dawn
step-first retries: 19 attempted, 19 stepOk, 19
stepAssigned, 17 retryStarted. Two villages reached the
horizon with one bearer standing (7202 Elena, 7204
Somchai); 7203 stood with 7 alive; 7201 scattered at d34.

## F1: WILD PARTNER-DEATH ENDING — GO as written, haul caveat stated

Two stuck-endings fired in the wild, and exactly one of
them is the r81 partner-gone path:

- 7201 David (favor-david_kim-14-4): started d15 (with a
  step-first retry), David died d17 (monster), outing ended
  stuck d22 via the fixed path — "You unload your share:
  0 kcal into the pantry. David's share is lost with
  them." Favor state broken, returnedDay 22,
  deliveredPlayerKcal 0, deliveredPartnerKcal 0. Every
  F1 clause as written is met (closes via
  outing-ended-stuck, player share = matched share,
  partner share 0, broken + returned, lost line).
- 7202 Wei (favor-chen_wei-13-3): ended stuck d21 with
  the LIVING-partner line — "You unload both shares:
  0 kcal from you, 0 kcal from Wei" — Wei was alive
  until d110. This is the ordinary stuck escalation
  (case F), not the r81 path. Descriptive, not F1.

The caveat, stated plainly rather than hidden by the
GO: both wild endings carried ZERO haul (David's outing
never successfully foraged — 6 node-barren days; Wei's
the same shape). The nonzero-haul accounting — a dead
partner's share stranded while the player's matched share
banks — is STILL fixture-only (r81 case M, 210 kcal),
now the fourth wild datum at 0/0 in a row (r80 Henry
210/210 stranded pre-fix; r81 Sanne 0/0; r102 David
0/0, Wei 0/0). F1 as written did not require nonzero
haul, so the verdict stands as GO — but nobody may cite
this run as wild proof that a nonzero player share
survives a partner's death. That clause belongs in the
next run's prereg (see metric review).

## G1: DRY GUARDRAIL — NO-GO as written (2/4 in band, pooled in band)

Per-seed dryPerConvo: 7201 0.44, 7202 0.27, 7203 0.17,
7204 0.20. Pooled 321/1389 = 0.23, inside [0.20, 0.40].
Binding required pooled in band AND >= 3/4 seeds in
band: pooled passes, per-seed is 2/4 (7202, 7204) — G1
is NO-GO as written. No re-scoring; the mechanism
below explains the miss without changing the verdict.

The fix-relevant seed is 7204: 86 nonverbal convos (84
without interpreter), dry 0.20 — against r81's probe
seeds at 1.042 / 0.932, that is the fix's predicted
drop, landing exactly on the band floor. The two
misses are fix-irrelevant: 7201 (0 nonverbal convos,
a 34-day dying village) sits ABOVE the band at 0.44,
and 7203 (0 nonverbal convos) sits BELOW it at 0.17.
With zero nonverbal convos on both, neither miss can
be the fallback fix's doing — verbal dry rate simply
varies 0.17-0.44 across seeds. The per-seed band as
written mixes two populations (verbal dry rate +
nonverbal deflection counts, which the fix removed
from the census by design). See metric review for the
proposed split.

## B-GATE: HOLDS, strongest replication yet

Pooled: 88 nonverbal convos, 86 without interpreter,
2 with interpreter, ZERO case-menu offers while
thread=nonverbal with no interpreter (badOffers empty
on all four seeds). 7204 alone contributes 84
no-interpreter nonverbal convos with 0 bad offers.
7201 and 7203 had 0 nonverbal convos — UNMEASURED
there per the prereg, not passed. The r78/r79/r81
gate holds on the fixed build.

## B-ACQ: batch grows to 44 — NPC-room convictions replicate (3x, all probe-convened)

r102 trials: 10. Acquitted 4, convicted 4, other 2.
Cumulative: 44 trials, 36 acquitted, 6 convicted
(4 NPC-room, 2 player-tipped), 2 other.

- 7201 case_2 (murder, Petra): autonomous, npcGuilty 0
  -> acquitted.
- 7202 case_2 (murder, Ines): autonomous, npcGuilty 0
  -> acquitted. case_4 (ambush, Andre): autonomous,
  npcGuilty 3 vs need ~4 -> resolved cold_war, NOT
  convicted (other).
- 7203 case_2 (ambush, Theo): probe-convened,
  npcGuilty 7/7 present vs need 5 -> convicted
  (weregild) on NPC votes alone; driver guilty vote
  +1 on top. NPC-ROOM conviction. case_4 (ambush,
  Theo): npcGuilty 6/8 vs need 5 -> convicted
  (weregild), NPC-ROOM. case_6 (ambush, Theo):
  npcGuilty 3 vs need 4 -> resolved exile with
  convicted=null — exile WITHOUT a conviction flag,
  a taxonomy wrinkle (contrast 7204 case_6, exile
  WITH conviction). Reported, not judged a defect:
  the resolution taxonomy, not the vote, decides
  exile here, and the analyzer's convicted flag is
  not the resolution.
- 7204 case_2 (ambush, Meera): npcGuilty 4 vs need 5
  -> convicted (schism) ONLY with the driver guilty
  vote (+1 = 5). PLAYER-TIPPED conviction. case_4
  (ambush, Meera): npcGuilty 2 -> acquitted. case_6
  (ambush, Meera): npcGuilty 5/6 vs need 4 ->
  convicted (exile), NPC-ROOM. case_8 (ambush,
  Meera): npcGuilty 2 -> acquitted.

Two cuts, both stated: on VOTE arithmetic the wanted
NPC-room replication is achieved three times over
(r77's unanimous room is no longer the only one).
On CONVENING, all three NPC-room convictions sit on
probe-convened trials; the hands-off autonomous rooms
this run (7201c2 acquit, 7202c2 acquit, 7202c4
cold_war) still never convict. The acquittal lean
(32/34 = 94% entering) falls to 36/44 = 82% — but
that fall is probe-arm-driven (player-convened
trials + driver guilty votes), not a change in how
autonomous rooms judge.

## B-TRIP: split holds, leaver shape repeats

18 away blocks, 100% carry awayComputedReturnDay.
Trips: 15, returns +2..+4 days (4/9/2). Leavers: 3
blocks across 2 leavers (Petra, 7201, gone since day
1, one dawn attempt burned d7; Devon, 7203, gone
since day 93, two dawn attempts d101/d102). The
leaver-block watch item from r79 repeats in miniature:
a favor still burns its dawn attempts on someone who
will never come back — but the attempts stay bounded
(1-2 per favor, then deadline expiry), never a
runaway loop. Descriptive, not a defect claim.

## B2 AUTONOMOUS CONVENING: OBSERVED again (convenable rule)

- 7201: 1 eligible case, 1 convened -> OBSERVED.
- 7202: 2 cases trialed autonomously (case_2
  acquitted, case_4 cold_war); 2 cases resolved
  without trial carrying resolution=accused_died
  (case_6, case_8). By r79's convenable rule (a case
  that dies with its accused is not a convening
  miss), convenable = 2/2 -> OBSERVED again.
  Mechanism confirmed by code read (betrayal.js
  ghost-trial closure: only a dead accused — killed/
  ambushed — closes a case this way; exiled accused
  are still tried in absentia).
- Instrument note (not a game verdict): case_6's
  resolved snap is dated d20 while its accused
  Andre's recorded death is d23 (ambush). The
  resolution label's trigger is confirmed by code,
  but the 3-day snap/death-day skew means either
  the death census lags the case census or the snap
  days are observation days. The next fork should
  check death-day vs snap-day alignment before
  anyone leans on case timing to the day.

## B-PEOPLE: PASS (5 reads, 3 outing-related, 0 fabricated, 0 weak)

- David, 7201 d14 (favor accept, outing-related):
  concrete plan (old burn east of camp, morning,
  pack), the unsettled murder of Petra named (she
  died d7, ambush — grounded), ends on the plan
  line. Real. (This is the outing that later ends
  with David's death d17 and the d22 lost-share
  line — the accept and the ending belong to one
  story.)
- Gulnara, 7201 d34 (late): grieving, grounded —
  "Vanessa is gone and Mateo is gone and the world
  just... continues." (both died d32/d34, real),
  roles list with scout held by Yara, the repeated
  "You asked me that before" frame recurs (standing
  nit from r80/r81) but handled with character
  each time. Real.
- Wei, 7202 d13 (favor accept, outing-related):
  concrete plan (creek bend, past the treeline,
  sunup, two packs), murder of Ines named (died d11,
  ambush — grounded), ends flat ("Hm. Never mind
  — go on") but not weak by the bar: no filler loop,
  the NPC closes. Real.
- Stan, 7203 d9 (moot probe): 3 turns — case
  framing (ambush of Theo, a real event; Theo
  alive at d9), moot called, convo ENDS there.
  Real, and the probe-hygiene proof.
- Meera, 7204 d10 (favor accept, outing-related):
  concrete plan (old burn east of camp, before dew
  dries, big pack), grounded gossip (Consuelo back
  — Consuelo is a case accused on this seed;
  "People are talking about me" — Meera IS the
  case target on all four 7204 cases), ends on the
  plan line + warm close. Real. (Her favor itself
  never started — node-elsewhere twice, then broken
  — but the accept read is the outing promise, and
  a later favor did start d27.)

## Village assessment (plain words)

- 7201 (34d, scattered, scholar Hermann alone): the
  sickness village, compressed. 11 people, then
  sickness took 4 in a week (d25-32), starvation
  took 2 more, and the village broke apart at day
  34 with the scholar standing alone. 1 deep bond.
  Its justice story still played: Petra's murder
  went to an autonomous moot and was acquitted.
- 7202 (141d, Elena last bearer, 16 deaths): the
  long village. 31 deep bonds, 9 delivers, 2
  autonomous trials, 11 bearer changes — the mantle
  passed 11 times, the last 6 in the final week
  (d129-135: the wild, the arena and combat took
  Yara, Stan, Dale, Pablo, Corazon and Petra in
  seven days) until Elena stood alone at the
  horizon. Social fabric outlived the pantry again.
- 7203 (140d, standing, 7 alive, Henry bearer): the
  healthy village. 32 deep bonds, 19 delivers (the
  strongest outing village of the four), 3 probe
  trials, only 5 deaths (combat 1, monsters 3, a
  stranger 1). The justice story here is the
  village judging Theo's ambush three times over.
- 7204 (143d, Somchai last bearer, 12 deaths): the
  many-tongues village. 15 deep bonds, 7 delivers,
  86 nonverbal convos — the seed that proves the
  gesture fallback in the wild — and 4 probe trials
  all naming Meera, who died by betrayal on d140,
  the day the mantle passed to Somchai. The woman
  the village kept putting on trial was killed by
  betrayal at the end; the village did not get to
  judge that one.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (72% of accepts start,
  90% of starts deliver) and yes for the gate (84
  no-interpreter nonverbal convos on one seed, 0 bad
  offers). The partner-death ending now fires in
  the wild instead of hanging — the r81 hang is
  closed as a wild behavior, with the nonzero-haul
  accounting still fixture-only.
- FUN: yes — autonomous moots still convene without
  the player pulling strings, broken promises still
  don't brick villagers (7202 Wei broken d16 -> later
  start d86; 7203 Tariq broken d52 -> start d55),
  and the trial batch finally contains convictions
  the NPC room reached on its own votes. The
  audible gaps are now precise: the dry guardrail
  band mixes verbal and nonverbal populations, and
  the exile-without-conviction taxonomy wants a
  code-level answer before anyone counts exiles as
  convictions or acquittals.
- WINNABLE: not this leg's question to close —
  social life feeds the win (79 deep bonds pooled,
  35 delivers, 10 trials) and one village stood
  bonded at the horizon; two more reached the
  horizon with a single bearer standing, and the
  fourth scattered with its causes named.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four per-seed
JSONs (metrics l3.bonds, l3.deepBonds, dryRate,
l3.mootsConvened, alive). 3 LOUD lines, all the same
artifacts as r79-r81, all explained, baseline NOT
rolled forward:
- `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled 79 =
  1+31+32+15), not deepBonds. Not a bug.
- `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  RETIRED-METRIC ARTIFACT — the baseline's 7 was
  counted through the old unwritten village.moots
  field; true trials this run are 10 in the trial
  census. Not a bug.
- `alive newly appeared: baseline 0 -> current 10`:
  BASELINE-SHAPE ARTIFACT — pooled alive 10 = 1+1+7+1.
  Not a bug.
- l3.bonds and dryRate: quiet.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 623s — the SAME six
pre-existing failures as r79-r81, adjudicated by name, zero new:
1. godpath/test-measurement-proof-update.js — stale balanced-panel proof.
2. godpath/test-measurement-workflow.js — retained neutrality proof
   does not cover current inputs.
3. godpath/test-mobile-combat-cadence.js — Continue wraps the round twice.
4. godpath/test-occupation-panels.js — real CLI workflow.
5. godpath/test-phone-frame-proof.js — 3 fails (retained browser
   inputs vs current source; boot-input coverage; stale phone receipts).
6. test-establishment-r20-fixes-20261020.js — racks-full voice gate
   does not reset daily as the test expects.
Full output in check-quick.log in this directory. The run is
instrument-only (zero src/js diff), so no failure is attributable
to r102. B-REG holds.

## Metric review

- Bindings judged as written. F1 GO (1 wild
  partner-death ending with all clauses met; the
  second stuck ending is the living-partner path,
  reported separately, not counted). G1 NO-GO
  (pooled 0.23 in band, per-seed 2/4 — the binding
  required both). B-GATE holds (88 nonverbal, 0 bad
  offers). B-ACQ descriptive (batch now 44: 36
  acquitted, 6 convicted, 2 other). B-TRIP holds
  (18/18 carry computed return; trips +2..+4,
  leavers 3 blocks / 2 leavers). B-PEOPLE holds
  (5 reads, 3 outing, 0 fabricated, 0 weak).
- Guardrail note: the dry band [0.20, 0.40] was
  calibrated when nonverbal blocked beats counted
  as deflections. The r81 fix deliberately removed
  them from the census, so a nonverbal-heavy seed
  now sits at the floor (7204: 0.20 on 86 nonverbal
  convos) while verbal-only seeds range 0.17-0.44
  on their own. The band is not wrong, but it is
  now a two-population band judged as one.
- Revisions proposed for the NEXT run (r103), not
  applied retroactively:
  1. DRY SPLIT: report dryPerConvo split into
     verbal and nonverbal, and bind the guardrail
     on the verbal rate + pooled, or on pooled
     only — not on a per-seed blend of two
     populations. The r81 probe-seed NO-GO
     (1.042/0.932) must not be re-read as a
     failure of the fixed build: the census
     definition changed under it.
  2. F1 HAUL CLAUSE: require a NONZERO-haul
     partner-gone ending for the accounting claim,
     or name the fixture proof (r81 case M) as the
     accounting evidence. Four wild endings at 0/0
     cannot carry a nonzero-haul claim.
  3. EXILE TAXONOMY: get a code-level answer for
     exile-without-conviction (7203 case_6) before
     counting exiles in any batch — convicted flag
     vs resolution are different fields and they
     disagree here.
  4. CASE TIMING: check death-day vs case-snap-day
     alignment (7202 case_6 skew) in the next
     fork's instrument notes.
  5. DORMANT RE-ENTRY: still a design question for
     Steve, not a worker decision.
  6. The r75 target-aware walk fold into
     policies/competent.js stays owed, still not
     taken here (panel re-baseline required).
- Watch items carried: leaver-blocks stay bounded
  (1-2 dawn attempts per favor); 7204's Meera arc
  (trial target killed by betrayal d140) is a
  story the justice system never got to judge —
  descriptive, not a defect claim.

## Files

- Driver: scripts/journey-social-r102-20261102.js
  (r81 verbatim + fresh seeds + evidence dir + REPO
  default fix; zero game-behavior change in the
  driver itself).
- Wedge: scripts/journey-social-r102-outing-wedge.js
  (r81 verbatim, rename only).
- Analyzer: scripts/analyze-journey-social-r102-outing-20261102.js
  (r81 verbatim + R102 header renames).
- Proof test: scripts/test-journey-social-r102-outing-wedge.js
  (67/67 SEED=42 + SEED=7, before seeds ran).
- Evidence: evidence/2026-11-02/r102/ (prereg.md, this
  note, per-seed JSONs, transcripts/, summaries/,
  r102-analysis.txt, r102-verdicts.json,
  r102-verdicts-7201.json, run-pilot.log,
  run-rest.log, check-quick.log).

## Closeout

- Commit e29b477cf (194 files: 4 scripts + 190 evidence
  files) on base 75c78a805; safe-commit index clobber hit
  (staged deletions, the known class) and was repaired via
  HEAD-blob cacheinfo before any rebase (verified: status
  empty, diff HEAD empty, hash-object matches HEAD blob).
  EPERM flap note: git index-lock writes failed for ~15 min
  mid-closeout (worktree gitdir + /tmp index locks; plain
  writes and object writes kept working) — safe-commit
  succeeded on retry once the flap cleared for git writes.
  No ref surgery was performed during the flap.
- Sibling landings during the run moved master
  75c78a805 -> 6d9dd7193 (sim-sumdeploy-a, Loop A/B
  coordinator evidence, journey-landing r71, loot audit);
  branch rebased onto 6d9dd7193 cleanly (new tip
  4dcd57ecd, my files verified byte-identical across
  the rebase, post-rebase wedge proof 67/67 on SEED=42
  and SEED=7), then merged locally via --ff-only,
  pending ship — no version bump, no push (the ship
  loop owns those).
- Rotation-b advanced 5 -> 6, verified by re-read. Next
  Lane B leg is 6 (crisis).
- Lane B lock deleted at closeout. Worktree
  journey2-social-r102 released and removed; branch
  deleted. Final HEAD verified in the run's memory-log
  entry for 2026-11-02.
