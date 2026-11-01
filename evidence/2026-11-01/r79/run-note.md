# Journey social r79 — RUN NOTE (lane B, 2026-11-01)

Leg 5 (social life), seeds 6901-6904, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 5f2d17bf7.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout (verified
by reading the file back). Driver: scripts/journey-social-r79-20261101.js
(r78 verbatim except the r79 gate census + fresh seeds, below).
Wedge: scripts/journey-social-r79-outing-wedge.js (r78 verbatim,
rename only). Proof test scripts/test-journey-social-r79-outing-wedge.js
56/56 on SEED=42 and SEED=7 BEFORE seeds ran. Smoke 6905 (30d) PASS.
Measurement seeds ran with ZERO src/js changes; this run measures
the r78 nonverbal gate already in master, it does not change the game.

## Pre-flight

- Main tree `git status --short` empty; disk 19%. Reap: nothing
  removed; sibling dirty trees left untouched (including the
  journey2-crisis-r90 and journey2-succession-r86 trees with stale
  heartbeats and uncommitted changes — not mine, left alone, flagged
  for main-session inspection as r90 did). Lock: none held at start
  (no stale-lock recovery needed). Worktree journey2-social
  registered + heartbeated (registry read back; 10-minute heartbeat
  loop with a readable log for the whole run).
- Canon: docs/CANON.md + docs/CONVERSATIONS.md + docs/DIRECTIVES.md
  read before judging; the moot/betrayal code paths (betrayal.js
  betrayalChoices nonverbal gate, npcMootTick) read for the gate
  census. No canon doc covers moot convening in full; the code is
  the source, cited by function name. Gating freeze (2026-10-27)
  untouched.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored. Arms differ by
construction (hands-off vs probe), so arm comparisons are
descriptive, NOT a balanced-panel before/after claim against r78
or between arms. This run is a FRESH baseline for the gate era,
not a fold into r78's numbers.

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers |
| 6901 | handsoff | 143 | 7 | 49 | 19 | 19 | 18 | 15 | 17 | 17 | 16 |
| 6902 | handsoff | 127 | 0 | 48 | 16 | 16 | 11 | 16 | 10 | 10 | 10 |
| 6903 | mootprobe | 70 | 5 | 46 | 8 | 8 | 5 | 10 | 5 | 5 | 5 |
| 6904 | mootprobe | 142 | 6 | 56 | 31 | 28 | 19 | 30 | 19 | 19 | 19 |
| POOLED | — | — | 18 | 199 | 74 | 71 | 53 | 71 | 51 | 51 | 50 |

Starts 53/71 accepts (75%, r78: 91% — descriptive only; different
seeds, and the dip sits in the two short/dying villages: 6902's
death spiral and 6903's 70-day scatter). Delivers 50/53 starts
(94%, r78: 91%). Blocked decomposition: no-micro-pos 25, away 30,
micro-far 5, node-elsewhere 10, non-adjacency 1. Two villages stood
to the horizon (6901, 6904); 6902 died out at d127; 6903 scattered
at d70 with 5 alive.

## Q1: GATE (B7) — HOLDS, measured in natural runs

Pooled: 30 nonverbal convos, 24 without interpreter, 6 with
interpreter, ZERO case-menu offers while thread=nonverbal with no
interpreter (badOffers empty on all four seeds).
- 6901: 24 nonverbal convos, all without interpreter, 0 bad offers
  — the gate's main evidence this run.
- 6903: 6 nonverbal convos, all WITH interpreter, 0 case offers
  in them — no case existed in those convos to offer, so this is
  absence of cases, not gate evidence either way (reported, not
  claimed).
- 6902/6904: 0 nonverbal convos — UNMEASURED on those seeds per
  the prereg, not passed.
The r78 fix does what its proof test promised on fixtures: in a
no-shared-words conversation with no interpreter, the case menu
is never offered in real play. B7 HOLDS.

## Q2: acquittal batch (B3) — cumulative 17/18 acquit, lean stands

r79 trials: 8, all acquitted. Cumulative with r77 (1 acquit,
1 conviction-by-exile) and r78 (8 acquit): 17 acquitted,
1 convicted in 18 trials.
- r79 rooms: NPC guilty 0-2 against needs 3-5; the player's
  guilty vote (+1 on all four probe trials) never flipped a room.
- The single conviction remains r77 case_4 (murder, unanimous-
  guilty room). No convicted-room replication this run — still
  wanted before anyone calls the lean a balance question.
- Player-vote reading fixed in the analyzer: playerVoter means
  MAY vote (trial creation, 90% unless player-convened). On the
  two hands-off trials where playerVoter=true and no driver vote
  was cast, the player's seat went unused (the backstop counted
  without them, as r78 showed in prose).

## Q3: autonomous convening (B2) — OBSERVED again, with one explained non-trial

- 6901: 2 eligible cases, 2 convened -> AUTONOMOUS CONVENING
  OBSERVED (replication of r78's 6801).
- 6902: the analyzer prints PARTIAL (2 of 3 convened), but the
  third case (case_2, ambush, accused Ezra/Tyler/Thabo) resolved
  d13 with resolution=accused_died — Ezra died d13 (ambush), and
  the case died with him, the same class as r78's 6804 case_4.
  Convenable cases: 2/2 convened. This is a justice-story path,
  not a convening failure.
- 6904 (mootprobe): no betrayal cases at all — a full social
  life with the justice story entirely absent, as in r78's 6802.
  Its one justice beat is a walk-away visitor case: Rafael Khan
  waits three days at the fire's edge, nobody calls the moot,
  and they walk (SAY d33/d36).

## Q4: away return timing (B4) — HOLDS, with a new bimodal split

30/30 away blocks carry awayComputedReturnDay (a number). The
gap histogram is bimodal, and the split is EXPLAINED, not a bug:
- 18 blocks: trips returning in +1..+5 days (r78 saw +1..+4;
  the +5 tail is new, same mechanism).
- 12 blocks: LEAVERS, not trips — awayPurpose "leave",
  awaySinceDay 1, awayDuration 999 (the game's no-return
  sentinel), computed return day 1000. Two villagers, both gone
  from day 1: Brian (6903, blocks at d20/21/54/55/60/61) and
  Aurora (6904, blocks at d10/11/53/54/112/113).
The r78 panel never sampled a leaver, so its +1..+4-only picture
was incomplete, not wrong. The analyzer's gap histogram mixes
trips and leavers — the next fork should split them (see
named-next). Leaver-blocks resolve by favor-deadline expiry
(2 attempts per favor in these samples: meet day + deadline
day), not a runaway weekly loop — but a favor whose partner
left on day 1 still burns its two dawn attempts on someone who
will never come back. Descriptive, not a defect claim.

## Q5: end-blocked repetition — STILL NO DATA

0 end-blocked entries on all four seeds, as in r77/r78. The
question (should a permanently unavailable partner close an
outing out instead of re-blocking weekly) stays open for a run
where it actually occurs. The leaver blocks in Q4 are the
start-stage cousin of this question, not the end-stage case
itself. No wedge change made.

## Q6: broken-origin (descriptive; CLOSED by r78, consistent here)

Log-trace windows: 6901 1/1 (Tariq d42 -> d65, 23d), 6902 1/4
seen (Tanisha d55 -> d76, 21d; the other 3 broken-seen had no
later start — absence, not a gate), 6903 0/3 seen, 6904 5/11
(Mateo 20d/12d, James 18d, Ana 15d, Luis 47d). Broken promises
still do not brick a villager's outing future.

## Village assessment (plain words)

- 6901 (143d, standing, 7 alive): the justice village, again.
  36 deep bonds, 16 delivers, 2 autonomous trials (both
  acquitted). Deaths: Katarina d7 (ambush — the murder the
  village never settled), 2 strangers, 1 arena, 2 wild. Murugan
  asks for the yarrow patch at first light and means it.
- 6902 (127d, died out, 0 alive): the village that ended.
  29 deep bonds, 10 delivers, 2 autonomous trials (both
  acquitted) plus the case that died with Ezra d13. Fourteen
  dead: the wild took 4, monsters 2, combat 2, aliens 2, and
  one each to ambush, starvation, contest, dehydration — and
  the last four deaths fell on d125-126, the player dying with
  the village. Its social fabric (29 deep bonds) outlived its
  pantry and its people.
- 6903 (70d, scattered, 5 alive): the sickness village.
  7 deep bonds, 5 delivers, 4 probe trials (all acquitted,
  player's guilty vote +1 each, never decisive). Sickness took
  4 (Metin and Wei both d41, Austin d45, Gina d67), wounds
  that wouldn't close took 2, and the village broke apart at
  day 70 with five people still living — scattered, not wiped
  out. Its scatter cause is not instrumented by this driver;
  reported as recorded, not guessed.
- 6904 (142d, standing, 6 alive): the quiet village, again.
  30 deep bonds, 19 delivers (the strongest outing village of
  the four), no betrayal cases at all — the justice story
  absent, the walk-away visitor its only moot-adjacent beat.
  Deaths: 2 aliens, 1 contest, 1 dehydration, 2 wild, 1 combat.

## People check (sense reads, full transcripts)

Five reads (binding: 5, >= 2 outing-related — this run: 2
outing-related, 2 moot-probe, 1 late). 0 fabricated-history flags,
0 weak endings. PEOPLE PASS.
- Murugan, 6901 d10 (favor accept, outing-related): pantry-bare
  ask, concrete plan (yarrow patch past the treeline, first
  light, pack light), the unsettled murder of Katarina named
  (she died d7, ambush — grounded), gossip with real
  uncertainty, an invitation declined with character ("I don't
  know you well enough for that. Ask me again when we've
  survived something together"), ends on the plan line. Real.
- Boris, 6903 d17 (favor accept, outing-related): recall
  callback opening ("we left it mid-thought"), one honest dry
  line ("...Sorry, lost my train of thought.") recovered from,
  concrete plan (ridge above the creek, big pack), gossip,
  warm close. Real.
- Wei, 6903 d8 (moot probe): 1-turn probe — grief-tinged opener
  ("Something big. I keep watching the sky since you said it"),
  case framing (murder of Yara, d7 ambush — grounded), moot
  called, convo ENDS there. Real — and the hygiene proof.
- Brian, 6903 d19 (moot probe): forage accept, then case
  framing (ambush of Wei — Wei survived that ambush, died
  later of sickness d41; the case names a real event, not a
  fabricated death), moot called, convo ENDS there. Real —
  and the hygiene proof.
- Yash, 6901 d100 (late): teaching ask, honest exhaustion
  ("I'm talked out on that topic. It's not you. It's the
  topic."), roles list with scout held by Tariq (a real roster
  fact), the driver's repeated "what were we talking about?"
  escalates then closes ("As I said —" -> "That's still where
  we are." -> "Go. But sit with what I said."), natural end.
  Real, weakest of the five only in the repeated recall pick —
  the NPC handles it with character each time, not weak by
  the bar.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (75% of accepts start, 94% of
  starts deliver — the start dip sits in the dying/scattering
  villages, not in the outing mechanic) and now YES for the
  gate: a no-shared-words conversation with no interpreter
  never offers the case menu in natural play (24/24 convos
  clean). Autonomous moots replicate (6901 2/2; 6902 2/2
  convenable, third ended by the accused's death).
- FUN: yes — the justice story still plays without the player
  pulling strings, broken promises still don't brick villagers,
  and the two probe reads show the moot call landing cleanly
  at the end of a real conversation. The audible gaps are now
  precise: the leaver-block shape (favors burning dawn attempts
  on someone gone since day 1) and the still-open end-blocked
  question.
- WINNABLE: not this leg's question to close — social life feeds
  the win (102 deep bonds pooled, 50 delivers, 8 trials) and
  two villages stood bonded at the horizon; the other two
  ended by death and scattering, both with named causes.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
LOUD lines, all three the same artifacts as r73-r78, all explained:
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled 102 =
  36+29+7+30), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT — current field is top-level mootsConvened (0 on
  all four seeds, itself the v.moots metric artifact fixed by
  B1's trial count of 8). Not a game bug.
- LOUD `alive newly appeared: baseline 0 -> current 18`:
  BASELINE-SHAPE ARTIFACT — pooled alive 18 = 7+0+5+6. Not a bug.
- l3.bonds and dryRate: quiet. Pooled dryPerConvo 0.24 / 0.21 /
  0.29 / 0.23, inside the [0.20, 0.40] guardrail.
Baseline NOT rolled forward: the stored baseline is a
different-era shape, and rolling it would launder the artifacts
into the baseline.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 731s — the SAME six
pre-existing failures as r73-r78, adjudicated by name, zero new:
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
to r79.

## Metric review

- Bindings B1/B2/B3/B4/B6/B7 judged as written. B1 holds
  (caseSnaps + mootSayLines on all four seeds; trials by
  first-trial-appearance = 8). B2 holds as OBSERVED on 6901
  (2/2) and as convenable-2/2 on 6902 (third case ended by
  accused_died; the analyzer's PARTIAL wording is mechanical).
  B3 holds as census (8 trials, descriptive + cumulative lean
  at n=18: 17 acquitted, 1 convicted). B4 holds (30/30 away
  blocks carry the field; the gap histogram is bimodal —
  trips +1..+5, leavers duration-999 — see Q4). B6 holds
  (5 reads, 2 outing, 0 fabricated, 0 weak; probe reads end at
  convening). B7 holds (badOffers 0; 6902/6904 UNMEASURED for
  nonverbal, 6903's 6 interpreter convos had no cases to offer).
- Guardrails: pooled dryPerConvo 0.24 / 0.21 / 0.29 / 0.23 — all
  inside [0.20, 0.40].
- Analysis clarifications, not bar changes: (1) the analyzer's
  away gap histogram mixes trips and leavers — the 999
  sentinel must be split out before any "return timing"
  reading; (2) 6902 case_2's PARTIAL is accused_died, not a
  convening miss; (3) 6904's 114 betrayal-offer convos with 0
  cases are invitation (accept/decline) offers, not case
  offers — the offer census counts all betrayal:* ids.
- Instrument hazard, same class as r90: the analyzer's stdout
  redirected to a file came back 0 bytes twice (once into the
  evidence dir, once into /tmp) with exit 0, then succeeded on
  retry (54,715 bytes, verified by grep). Empty outputs must
  be size-verified, never trusted — the retry-then-verify
  pattern from r90 applies to analyzer output as well as
  driver JSON.
- Revisions proposed for the NEXT run (r80), not applied
  retroactively:
  1. AWAY SPLIT: split the away census into trips vs leavers
     (purpose=leave, duration=999) before reporting return
     timing; the leaver-block shape (dawn attempts burned on
     someone gone since day 1) is named as a watch item, not
     a defect.
  2. ACQUITTAL BATCH: keep accumulating; the lean (17/18
     acquit) still wants a convicted-room replication before
     anyone calls it a balance question.
  3. DORMANT RE-ENTRY: still a design question for Steve, not
     a worker decision.
  4. END-BLOCKED: still no data; the question stays open until
     a run actually produces an end-blocked outing.
  5. ANALYZER LABELS: the away/broken/end-blocked/TV section
     headers still say R78 (cosmetic; only the trial +
     convening headers were renamed in the r79 fork) — rename
     in the next fork.
- Watch items carried: terse case-action prose ("The ground
  remembers."); final trial states must be read from the LAST
  snap, not the first-trial snap; 6903's scatter cause is not
  instrumented by this driver.
- Decision note (delivered, not implemented): whether the r75
  target-aware walk + dawn step-first retry fold into
  policies/competent.js — still owed, still not taken here
  (panel re-baseline required).

## Files

- Driver: scripts/journey-social-r79-20261101.js (r78 verbatim +
  r79 gate census; zero game-behavior change in src during
  measurement).
- Wedge: scripts/journey-social-r79-outing-wedge.js (r78
  verbatim, rename only).
- Proof tests: scripts/test-journey-social-r79-outing-wedge.js
  (56/56, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r79-outing-20261101.js
  (r78 verbatim + gate census section + playerVoter label fix).
- Evidence: evidence/2026-11-01/r79/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/, r79-analysis.txt,
  r79-verdicts.json, run.log, check-quick.log,
  r79-analyzer.stderr.log).

## Closeout

- Commit 6032c23be (210 files: 4 scripts + 206 evidence files)
  on base 5f2d17bf7; safe-commit index clobber hit (staged
  deletions, the known class) and was repaired via HEAD-blob
  cacheinfo before any rebase (verified: status empty, diff
  empty). Lane A landed mid-run (7c8745741 journey-deepening
  r79); branch rebased onto it cleanly (new commit 0a66ca387,
  my files verified byte-identical across the rebase, post-rebase
  wedge proof 56/56 on SEED=42 and SEED=7), then merged locally
  via --ff-only, pending ship — no version bump, no push (the
  ship loop owns those).
- Rotation-b advanced 5 -> 6, verified by re-read. Next Lane B
  leg is 6 (crisis).
- Lane B lock deleted at closeout. Worktree journey2-social
  released and removed; branch deleted.
- INFRA HAZARD (heartbeat loop): the 10-minute background
  nohup heartbeat loop died after its first beat — the exec
  session that spawned it reported output_drain_timeout and its
  teardown killed the loop (log holds 1 entry; the registry
  read 10:12:41 stale for ~37 min mid-run). Manual re-heartbeats
  at major steps (registration, driver launch, closeout) are
  what actually kept the tree fresh. A background loop spawned
  from a timed-out exec session must be verified alive, not
  assumed — same class as r53's silenced-loop lesson, new
  trigger. No harm this run (the lock file held, no successor
  started), but the next run should heartbeat manually at each
  major step and read the registry back every time.
