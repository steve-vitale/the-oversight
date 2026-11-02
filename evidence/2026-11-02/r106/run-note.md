# Journey social r106 — RUN NOTE (lane B, 2026-11-02)

Leg 5 (social life), seeds 7301-7304, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master
777c8a99d at worktree registration. Rotation-b read 5 at run
start (social; the r102 social leg advanced it 5->6 and the
crisis/succession/endgame legs since advanced it consistently
back to 5 — no anomaly). Driver:
scripts/journey-social-r106-20261102.js (r102 verbatim except
fresh seeds, evidence dir, REPO default repointed at this run's
worktree, plus recording-only drySplit + dayDied). Wedge:
scripts/journey-social-r106-outing-wedge.js (r102 verbatim,
rename only). Proof test
scripts/test-journey-social-r106-outing-wedge.js 67/67 on
SEED=42 and SEED=7 BEFORE seeds ran. Smoke 7305 (30d) PASS.
Measurement seeds ran with ZERO src/js changes; this run
measures the r81 fixes already in master, it does not change
the game. Prereg + instrument fork committed as d47644c9b
BEFORE any judged seed ran.

## Pre-flight

- Main tree `git status --short` empty; disk 27%. Reap: active
  12/16, nothing removed; sibling dirty trees left untouched
  (including the journey2-succession, journey2-succession-r86
  and journey2-crisis-r90 trees with stale heartbeats and
  uncommitted changes — not mine, left alone, flagged for
  main-session inspection as r102 did). Lock: none held at
  start (no stale-lock recovery needed). Worktree
  journey2-social-r106 registered + heartbeated (background
  heartbeat loop alive, registry read back at every major
  step; manual beats as well).
- Canon: docs/CANON.md + docs/CONVERSATIONS.md + docs/PARTY.md
  read before judging; the trial verdict/sentence path
  (src/js/betrayal.js finishTrial :1944, sentenceCase :2049,
  ghost-trial closure :1119) and the corpse clock
  (src/js/corpses.js dayDied) read in code for the taxonomy
  and timing questions below. Gating freeze (2026-10-27)
  untouched.

## Pre-registration

See `prereg.md` in this directory (written before any seed
ran). Bindings judged as written; no metric re-scored. Arms
differ by construction (hands-off vs probe), so arm
comparisons are descriptive, NOT a balanced-panel
before/after claim against r102 or between arms. This run is
a fresh panel on the fixed build, not a fold into r102's
numbers — except the acquittal batch, which accumulates
across runs by design (on the CORRECTED baseline, see
B-ACQ).

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers | endedStuck |
| 7301 | handsoff | 118 | 0 | 58 | 11 | 12 | 8 | 14 | 7 | 7 | 7 | 0 |
| 7302 | handsoff | 87 | 0 | 28 | 9 | 9 | 3 | 12 | 3 | 3 | 3 | 0 |
| 7303 | mootprobe | 142 | 3 | 59 | 16 | 14 | 9 | 15 | 9 | 9 | 9 | 0 |
| 7304 | mootprobe | 139 | 5 | 79 | 20 | 20 | 9 | 25 | 8 | 8 | 8 | 0 |
| POOLED | — | — | 8 | 224 | 56 | 55 | 29 | 66 | 27 | 27 | 27 | 0 |

Starts 29/55 accepts (53%, down from r102's 72% — this
panel's villages died younger and partners were away more);
delivers 27/29 starts (93%). Blocked decomposition: away
34, no-micro-pos 17, node-elsewhere 12, non-adjacency 3.
Dawn step-first retries: 17 attempted, 17 stepOk, 17
stepAssigned, 15 retryStarted. Two villages reached the
horizon standing (7303 with 3 alive, 7304 with 5); the two
hands-off villages died out (7301 d118, 7302 d87).

## F1-HAUL: NO-DATA (no wild ending to judge)

Zero end-blocked entries and zero ended-stuck outings on
all four seeds. No partner-gone ending fired in the wild
this panel, so the nonzero-haul clause cannot be judged —
NO-DATA per the prereg, not a game verdict and not a fix
verdict. The clause stays open for the next panel; partner
death mid-outing is rare (r102: 2 stuck endings in 4 seeds;
r106: 0). The fixture proof (r81 case M, 210 kcal) remains
the only nonzero-haul accounting evidence.

## G1-SPLIT: NO-GO as written — and the miss is the metric's, not the game's

Per-seed drySplit (dryFamLines basis, same as dryPerConvo):

| seed | total convos | verbal convos / dry | nonverbal convos / dry |
| 7301 | 372 | 360 / 0.264 | 12 / 0.000 |
| 7302 | 263 | 243 / 0.193 | 20 / 0.000 |
| 7303 | 444 | 431 / 0.206 | 13 / 0.000 |
| 7304 | 444 | 387 / 0.240 | 57 / 0.000 |
| POOLED | 1523 | 1421 / 0.228 | 102 / 0.000 |

Binding required pooled nonverbal dry in [0.20, 0.40]:
pooled nonverbal is 0/102 = 0.000 — NO-GO as written. No
re-scoring; the mechanism below explains the miss without
changing the verdict.

The zero is definitional, not a game failure. The r81 fix
replaced English deflections in nonverbal conversations
with gesture narration, and the code states the census
consequence explicitly (src/js/conversation.js:60): the
gesture narration "is not a deflection line for census or
streak purposes". On the fixed build a nonverbal
conversation CANNOT produce a dry line through a blocked
beat — the counted lines were removed by design. The band
[0.20, 0.40] was calibrated on the old census, in which
nonverbal blocked beats counted as English deflections.
Binding a post-fix nonverbal rate to a pre-fix band
guarantees this miss on any panel with nonverbal convos.

The descriptive comparators show the underlying rates are
healthy: pooled verbal dry 0.228 is in band; per-seed
verbal is 3/4 in band (7302 at 0.193 misses the floor by
0.007); pooled overall 0.213 is in band (r102: 0.23),
per-seed overall 3/4 in band (7302 0.179 misses). See
metric review for the proposed next-run binding (pooled
verbal, nonverbal leg retired).

## B-GATE: HOLDS

Pooled: 102 nonverbal convos, 95 without interpreter, 7
with interpreter, ZERO case-menu offers while
thread=nonverbal with no interpreter (badOffers empty on
all four seeds). 7304 contributes 50 no-interpreter
nonverbal convos with 0 bad offers, plus 5 case offers
WITH an interpreter — allowed by design, not gate misses.
The r78/r79/r81/r102 gate holds on the fixed build.

## B-ACQ: batch grows to 54 — one more NPC-room conviction (probe-convened)

r106 trials: 10. Acquitted 9, convicted 1, other 0.
Cumulative (on the CORRECTED baseline from the prereg):
54 trials, 45 acquitted, 8 convicted (5 NPC-room, 3
player-tipped), 1 other.

- 7301 case_2 (ambush, Oliver): autonomous, npcGuilty 2 vs
  need 4 -> acquitted.
- 7302 case_2 (ambush, Adrián): autonomous, npcGuilty 2 vs
  need 4 -> acquitted. case_4 (murder, Javier):
  autonomous, npcGuilty 0 vs need 3 -> acquitted.
- 7303 case_2 / case_4 / case_6 / case_8 (ambush, Olivia /
  Stella): probe-convened, npcGuilty 2/2/1/0, all
  acquitted (driver guilty votes +1 each, none tipping).
  case_10 (murder, Stella): probe-convened, npcGuilty 6/6
  vs need 4 -> convicted (exile), NPC-ROOM — the room
  reached it on its own votes; the driver guilty vote +1
  on top was not needed. Note wildDay=true on this trial.
- 7304 case_2 / case_4 (ambush, Chloe): probe-convened,
  npcGuilty 2/1, both acquitted.

Two cuts, both stated: on VOTE arithmetic the NPC-room
replication extends to five (r77's unanimous room plus
r102's three plus this run's murder conviction). On
CONVENING, all five NPC-room convictions sit on
probe-convened trials; the hands-off autonomous rooms
this run (7301c2, 7302c2, 7302c4 — all acquits) still
never convict. The acquittal lean falls to 45/54 = 83%
(from the corrected 36/44 = 82% — essentially flat; this
run's 9/10 acquits match the corrected baseline rate).

INSTRUMENT NOTE (read before reusing any r102-era trial
table): the r106 analyzer as first written mislabeled
every acquitted case "OPEN:acquitted" (its verdict logic
only recognized status 'resolved', while acquittals carry
status 'acquitted'). Caught during analysis from the VOTE
lines (convicted=false), fixed in the analyzer, and the
analyzer re-run — all verdicts above are read from the
FIXED output. The mid-flight flag was also refined to
fire only when first-snap and final-snap VALUES differ
(trialDetail persists on the case row to run end, so row
inequality alone over-fired on every trial). With the
refined flag, 3/10 first snaps caught a trial
mid-flight (7301c2, 7302c2, 7303c10 — all with
convicted=null/finalGuilty=null at first snap) — which
is exactly why verdicts must be read from final snaps,
as the prereg's taxonomy correction requires.

## B-TIMING: ALIGNED on all four — the r102 skew reads as corpse-seen lag

- 7301 case_4 + case_6 (accused_died): first-resolved snap
  d40; Silas dayDied d39 (seen d40), Donizar dayDied d55,
  Sofia never died. The triggering death (Silas d39)
  precedes the snap — ALIGNED.
- 7302 case_6 + case_8 (accused_died): first-resolved snap
  d44; Hannah dayDied d44 (seen d44), Jovan dayDied d46.
  ALIGNED (same-day triggering death).
- No LEAD flags (no case resolved before every accused's
  dayDied), no LAG beyond 1 day.

And the general clock pattern, visible in every death
record this run: corpse-seen day = dayDied + 0 or 1
(e.g. 7301 Hudson seen d11, dayDied d10). The case clock
runs on the kill event (ghost-trial closure fires at
removal); the death census runs on the end-of-day corpse
sweep. A 1-day lag between them is normal instrument
behavior. Read back onto r102: case_6's resolved snap
d20 against Andre's corpse-seen day d23 is consistent
with a kill around d19-20 whose corpse was first swept
days later (off-site ambush death, body found late) —
the skew was corpse-seen lag, not a case clock running
ahead of death. With dayDied now recorded, future skews
can be adjudicated from data instead of reconstructed.

## B-TRIP: split holds, leaver shape repeats

34 away blocks, 100% carry awayComputedReturnDay.
Trips: 27, returns +1..+15 days. Leavers: 7 blocks across
2 leavers (Somchai, 7302, gone since day 1, three dawn
attempts d14/d54/d55; Naran, 7303, gone since day 1, four
dawn attempts d37/d38/d126/d127). The leaver-block watch
item repeats: favors keep burning dawn attempts on
someone who will never come back — but the attempts stay
bounded per favor (1-2, then deadline expiry), never a
runaway loop. Descriptive, not a defect claim.

## B-CONVENE: OBSERVED per the prereg rule, with a window caveat

Hands-off arm, r79 convenable rule (a case that dies with
its accused is not a convening miss):

- 7301: convenable 1/1 (case_2 trialed; case_4 died with
  Silas before its moot day d40 — excluded; case_6 never
  observed open — excluded) -> OBSERVED.
- 7302: convenable 2/2 (case_2, case_4 trialed; case_6,
  case_8 died with their accused — excluded) -> OBSERVED.

The analyzer's raw counts read PARTIAL (7301 1/2, 7302
2/4) because its eligibility rule counts accused_died
cases observed open as eligible misses; the prereg rule
adjusts them out, as r102 did. Window caveat, stated
plainly: 7302's two excluded cases sat 10-12 days PAST
their moot days (mootInDay ~d32/d34, died d44) before
dying with Hannah — unlike 7301's case_4, which died
before its moot day. The rule forgives both shapes
equally. Whether "died after moot day" should still
count as a miss (or needs a reason — quorum? belief?
a dying village?) is a metric-review question for the
next run, not a re-score here.

## B-PEOPLE: PASS (5 reads, 4 outing-related, 0 fabricated, 0 weak)

- Sofia, 7301 d7 (favor accept, outing-related):
  concrete plan (south slope below the meadow, sunup,
  pack + knife), ends on the plan line ("First light.
  The pantry's counting on us."). Real. (Her outing
  started d8 but found nothing for 8 node-barren days —
  the promise outlived the patch, not the conversation.)
- Donizar, 7301 d24 (favor accept, outing-related):
  concrete plan (meadow edge west of the creek, dawn,
  pack + knife), ends on the plan line. Real. (His
  favor never started — away twice — broke d27, and a
  later favor with him DID start d34: broken promises
  don't brick villagers, again.)
- Ruth, 7302 d11 (favor accept, outing-related):
  concrete plan (south slope, before dew dries, pack +
  knife, travel light); the middle wanders through the
  NPC's own questions (dreams of before, anger at the
  sky) — NPCs asking the player questions is by design
  — and closes deliberately ("I should go before I say
  something sincere."). Real, not weak by the bar.
- Esther, 7303 d14 (favor accept, outing-related):
  concrete plan (jujube patch past the treeline, before
  dew dries, two packs), ends on the plan line. Real.
- Oliver, 7301 d4 (non-outing): opens with a slightly
  awkward meta line (quoting a past silence as a topic),
  then grounded gossip — Dearbhail's origin
  contradiction, told independently in Sofia's convo
  too (cross-convo consistency, not fabrication) — and
  ends resolved ("their skills, settled"). Real, with
  the opener as a standing nit, not a fail.

Fabricated-history flags: 0. Nothing claims shared
history that didn't happen; the Dearbhail thread is
gossip the village actually circulates, told twice
consistently.

## Village assessment (plain words)

- 7301 (118d, died out, scholar dead, 4 bearers): the
  sickness village. 14 deaths, 7 of them sickness, 2
  starvation; 30 deep bonds. Its justice story still
  played: the ambush of Oliver went to an autonomous
  moot and was acquitted. The village talked its way
  through dying — 372 conversations, the most of any
  seed relative to its length.
- 7302 (87d, scattered, 5 bearers): the short hard
  village. 13 deaths across wild, monster, sickness,
  starvation and one ambush; 14 deep bonds; 2
  autonomous acquittals. It scattered before any of
  its justice stories could harden into convictions.
- 7303 (142d, horizon, 3 alive, 5 bearers): the judging
  village. 10 deaths, 28 deep bonds, 9 delivers — and
  five probe trials, four acquits and one murder
  conviction the room reached on its own votes
  (Olivia's ambush-murder of Stella, sentenced to
  exile). The village that most looks like a place
  with law in it.
- 7304 (139d, horizon, 5 alive, 7 bearers): the
  many-tongues village. 57 nonverbal conversations (50
  without an interpreter, 7 with) — the seed that
  proves gesture talk carries a whole social life —
  28 deep bonds, 8 delivers, 2 probe acquittals.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (53% of accepts start, 93%
  of starts deliver) and yes for the gate (95
  no-interpreter nonverbal convos, 0 bad offers). The
  partner-death ending did not fire in the wild this
  panel — no new evidence either way, and none claimed.
- FUN: yes — autonomous moots still convene without the
  player pulling strings, broken promises still don't
  brick villagers (Donizar broken d27 -> start d34),
  and the trial batch finally contains a fifth NPC-room
  conviction, this time for murder. The audible gaps
  are now precise: the dry guardrail band needs its
  nonverbal leg retired (it measures a population the
  fix deliberately emptied), and the convenable rule
  needs a died-after-moot-day split before it can tell
  a forgiven death from a missed moot.
- WINNABLE: not this leg's question to close — social
  life feeds the win (100 deep bonds pooled, 27
  delivers, 10 trials) and two villages stood bonded
  at the horizon; the other two died with their causes
  named (sickness, then everything at once).

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four per-seed
JSONs (metrics l3.bonds, l3.deepBonds, dryRate,
l3.mootsConvened, alive). 3 LOUD lines, all the same
artifacts as r102, all explained, baseline NOT rolled
forward:
- `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled 100 =
  30+14+28+28), not deepBonds. Not a bug.
- `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  RETIRED-METRIC ARTIFACT — the baseline's 7 was
  counted through the old unwritten village.moots
  field; true trials this run are 10 in the trial
  census. Not a bug.
- `alive newly appeared: baseline 0 -> current 8`:
  BASELINE-SHAPE ARTIFACT — pooled alive 8 = 0+0+3+5.
  Not a bug.
- l3.bonds and dryRate: quiet.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 491s — the SAME six
pre-existing failures as r102, adjudicated by name, zero new:
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
to r106. B-REG holds.

## Metric review

- Bindings judged as written. F1-HAUL NO-DATA (0 wild
  end-blocks). G1-SPLIT NO-GO as written (pooled
  nonverbal 0.000 outside [0.20, 0.40] — the band
  measures a population the r81 fix deliberately
  emptied; verbal 0.228 and overall 0.213 are both in
  band descriptively). B-GATE holds (102 nonverbal, 0
  bad offers). B-ACQ descriptive (batch now 54: 45
  acquitted, 8 convicted [5 NPC-room, 3 player-tipped],
  1 other). B-TIMING all ALIGNED (4/4 accused_died).
  B-TRIP holds (34/34 carry computed return).
  B-PEOPLE holds (5 reads, 4 outing, 0 fabricated,
  0 weak). B-CONVENE OBSERVED per the prereg rule
  (raw analyzer PARTIAL adjusted by the convenable
  exclusion, as r102 did).
- Revisions proposed for the NEXT run (r107), not
  applied retroactively:
  1. DRY BAND: bind the guardrail on POOLED VERBAL dry
     in [0.20, 0.40] (r106: 0.228) and report
     nonverbal dry descriptively with the expectation
     stated as ~0 by design (gesture narration is not
     a deflection line for census purposes). Do not
     carry the blended or nonverbal band forward.
  2. F1 HAUL CLAUSE: unchanged — NO-DATA is the honest
     verdict for a rare event; keep requiring a
     nonzero-haul wild ending.
  3. CONVENABLE WINDOW: split accused_died cases into
     died-before-moot-day (not a miss) vs
     died-after-moot-day (report the window length and
     any reason found; decide next run whether it
     counts as a miss). 7302's 10-12 day windows are
     the motivating data.
  4. DORMANT RE-ENTRY: still a design question for
     Steve, not a worker decision.
  5. The r75 target-aware walk fold into
     policies/competent.js stays owed, still not taken
     here (panel re-baseline required).
- Watch items carried: leaver-blocks stay bounded
  (1-2 dawn attempts per favor); the Oliver-opener nit
  (quoting a past silence as a topic) is a standing
  prose nit, not a fail.

## Files

- Driver: scripts/journey-social-r106-20261102.js
  (r102 verbatim + fresh seeds + evidence dir + REPO
  default fix + recording-only drySplit and dayDied;
  zero game-behavior change in the driver itself).
- Wedge: scripts/journey-social-r106-outing-wedge.js
  (r102 verbatim, rename only).
- Analyzer: scripts/analyze-journey-social-r106-outing-20261102.js
  (r102 verbatim + R106 header renames + final-trial
  verdicts with refined mid-flight flag + R106
  case-timing check; plus the during-analysis fix of
  the acquitted-verdict label, re-run before judging).
- Proof test: scripts/test-journey-social-r106-outing-wedge.js
  (67/67 SEED=42 + SEED=7, before seeds ran).
- Evidence: evidence/2026-11-02/r106/ (prereg.md, this
  note, per-seed JSONs, transcripts/, summaries/,
  r106-analysis.txt, r106-verdicts.json,
  run-pilot.log, run-rest.log, check-quick.log).
- Size verification (r79/r90 instrument hazard): all
  four per-seed JSONs non-empty (927KB / 1.26MB /
  1.08MB / 870KB), analysis 58KB, check log complete
  with CHECK EXIT recorded.

## Closeout

- Commit d47644c9b (prereg + 4 scripts) on base 777c8a99d;
  safe-commit index clobber hit (staged deletions, the
  known class) and was repaired via HEAD-blob cacheinfo
  before any further work (verified: status empty, diff
  HEAD empty, hash-object matches HEAD blob).
- (Closeout commit, rebase/merge, rotation and lock
  disposition appended below at closeout.)
- Closeout: evidence commit d0eca184a rebased onto master
  44145372d (sibling journey-landing r87 landed mid-run)
  as 7b037b7b9, files verified byte-identical across the
  rebase (run-note 3e94f286, analyzer d75c1f352, driver
  7d00a9c31a), wedge proof re-run 67/67 on SEED=42 and
  SEED=7 post-rebase, then merged locally via --ff-only
  as 7b037b7b9, pending ship — no version bump, no push
  (the ship loop owns those). Rotation-b advanced 5 -> 6,
  verified by re-read. Next Lane B leg is 6 (crisis).
  Lane B lock deleted at closeout. Worktree
  journey2-social-r106 released and removed; branch
  deleted. Main tree verified clean.
