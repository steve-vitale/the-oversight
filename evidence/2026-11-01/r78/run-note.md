# Journey social r78 — RUN NOTE (lane B, 2026-11-01)

Leg 5 (social life), seeds 6801-6804, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 00b1f1da7.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout (verified
by reading the file back). Driver: scripts/journey-social-r78-20261031.js
(r77 verbatim except the r78 arms + SAY TV exclusion + broken-scan
wedge, below). Wedge: scripts/journey-social-r78-outing-wedge.js
(r77 verbatim + promise-broken-seen scan). Proof test
scripts/test-journey-social-r78-outing-wedge.js 56/56 on SEED=42 and
SEED=7 BEFORE seeds ran. Smoke 6805 (30d) PASS. Measurement seeds ran
with ZERO src/js changes; the one src/js change in this run (the
nonverbal case-menu gate, below) was developed and proof-tested AFTER
the seeds, on fixtures only, and is committed separately — it is
UNMEASURED in natural runs and is reported as such, not as a measured
improvement.

## Pre-flight

- Main tree `git status --short` empty; disk 21%. Reap: nothing
  removed; sibling dirty trees left untouched (including the
  journey2-succession-r86 tree with a stale heartbeat and
  uncommitted changes — not mine, left alone; same as r77's note).
  Lock: none held at start (no stale-lock recovery needed).
  Worktree journey2-social registered + heartbeated (registry read
  back; heartbeat re-run at each major step).
- Canon: docs/CANON.md + docs/CONVERSATIONS.md read before judging;
  the moot/betrayal code paths (betrayal.js betrayalChoices,
  betrayalCaseFrame, nvOpen, trialVoteTick) read for the language
  gate and the vote-count reading below. No canon doc covers moot
  convening in full; the code is the source, cited by function name.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored. Arms differ by
construction (hands-off vs probe), so arm comparisons are
descriptive, NOT a balanced-panel before/after claim against r77
or between arms.

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers |
| 6801 | handsoff | 142 | 7 | 55 | 26 | 25 | 22 | 12 | 21 | 21 | 20 |
| 6802 | handsoff | 141 | 7 | 61 | 36 | 36 | 36 | 10 | 36 | 36 | 36 |
| 6803 | mootprobe | 143 | 1 | 63 | 18 | 19 | 15 | 18 | 11 | 11 | 11 |
| 6804 | mootprobe | 140 | 6 | 35 | 5 | 5 | 4 | 4 | 3 | 3 | 3 |
| POOLED | — | — | 21 | 214 | 85 | 85 | 77 | 44 | 71 | 71 | 70 |

Starts 77/85 accepts (91%, r77: 69%). Delivers 70/77 starts (91%,
r77: 81%). Blocked decomposition: no-micro-pos 22, away 16,
micro-far 2, node-elsewhere 4. Three villages stood to the horizon
(6801, 6802, 6804); 6803 stood with 1 alive at d143.

## Q1: hands-off control — AUTONOMOUS CONVENING OBSERVED (first clean proof)

Hands-off pick audit: ZERO case-menu picks on both hands-off seeds
(binding holds — the arm was genuinely hands-off, including no votes:
ambush survival and invitation picks stayed pickable by design and
are not case picks).
- 6801: 4 eligible cases (all ambush, NPC accused, target present,
  observed 'open', no probe, no driver case pick, playerConvened
  false), ALL 4 convened: case_2 opened d8 (trial snap d12),
  case_4 d10 (d14), case_6 d14 (d18), case_8 d21 (d25). MootIn field
  null on all four; tick default 3 puts mootIn-day ~3 days after
  opening, and every trial snapped 1-4 days past it.
- 6802: 0 cases formed at all — UNISOLATED on that seed alone, as
  in r76/r77's control seeds.
This closes r77's B2 open item: the village DOES call its own moots
without the player. The r77 letlie mechanism is untouched — no
hands-off case was shelved, because the hands-off player never
touches a case.
Vote-count reading (correcting the analyzer's label): trialDetail
playerVoter means the player MAY vote (trial creation: 90% unless
player-convened), NOT that the player voted. All four 6801 trials
ended playerVoter=false with finalGuilty == npcGuilty: the silent
player never voted, and trialVoteTick's backstop counted all four
without the player (the SAY lines "The moot doesn't wait forever.
Two days of silence from the fire's edge — the count is taken
without you." on d13/d15 are that backstop firing in prose). All
four acquitted (NPC guilty 2, 2, 3, 3 against needs 5, 5, 5, 5).

## Q2: acquittal lean — CUMULATIVE BAR REACHED (n=10), lean stated

r78 trials: 8, all acquitted. Cumulative with r77's 2 (1 acquittal,
1 conviction-by-exile): 9 acquitted, 1 convicted in 10 trials.
- r78 rooms: NPC guilty 0-3 against needs 3-5; acquit score means
  +21 to +44, guilty score means -19 to -63 on 0-3 guilty votes.
  The player's guilty vote (+1 on all four probe trials) never
  flipped a room.
- The single conviction (r77 case_4, murder) was a unanimous-guilty
  room (NPC 7/7, mean -32.1).
Lean, stated descriptively at n=10: the moot acquits by default
when the village is not convinced, and convicts when belief +
affinity are overwhelmingly guilty — the same mechanism r77 named
(belief/affinity doing the work, not the ±12/±70 swing). This is
not a defect claim: an acquittal-leaning village that still exiles
on a unanimous-guilty room reads as a working justice story, and
the sample is still small (10 trials, 2 villages' worth of probe
trials in the count).

## Q3: broken-origin by log trace — ANSWERED (gate does NOT block)

The wedge's promise-broken-seen scan caught 16 broken favors in
the log (r77's final-ledger method caught 1 across 4 seeds and no
window). Later same-villager starts followed 10 of them:
- 6801: Yara d12 -> d39 (27d), Emma d54 -> d80 (26d), Elena d59 ->
  d85 (26d); Heidi d107 -> none.
- 6802: Bessie d35 -> d131 (96d), Raj d41 -> d51 (10d), Pavel d50
  -> d69 (19d), Raj d52 -> d62 (10d); Raj d139 -> none (2d left,
  horizon artifact).
- 6803: Yara d23 -> d43 (20d), Ofelia d27 -> d95 (68d), Ofelia d35
  -> d95 (60d); Saul d8/d73, Luis d112 -> none.
- 6804: Jesse d23 -> none (no later start in that village's 4-start
  run; not a gate proof either way).
A broken promise does not close the villager's outing future: the
same villager asks, is accepted, and starts again 10-96 days later.
The 6 non-windows are absence of a later start, not evidence of a
gate — two sit at the horizon, the rest had no later started
outing in their village's run. B5 holds as a measurement (every
broken-seen entry got its later-start check); the "gate freed"
question is answered YES by the 10 positive windows.

## Q4: SAY TV exclusion — WORKS, and the pollution was real

mootSayTvExcluded: 6801 0, 6802 7, 6803 0, 6804 0. The 7 excluded
lines on 6802 are all 📺/contest show announcements ("TONIGHT:
The Moot", "CONTEST: The Moot", "Grace is on television") — the
exact class that inflated r77's SAY count. Pooled mootSayLines is
now 52 with 0 TV lines in it (r77's count carried TV noise, e.g.
6804-style "TONIGHT: The Moot" show lines). The convening lines
themselves are clean (e.g. 6801 d11 "Elena calls the moot. The
fire gets built up", "The moot turns to you").

## Q5: away return timing — REPLICATED

16/16 away blocks carry awayComputedReturnDay (B4 holds).
Computed-return minus block day: +1 on 3, +2 on 7, +3 on 2, +4 on 4
(r77: +1/+2/+3 only — the +4 tail is new, same mechanism, no
contradiction: partners out up to 4 days).

## Q6: end-blocked repetition — STILL NO DATA

0 end-blocked entries on all four seeds, as in r77. The question
(should a permanently unavailable partner close an outing out
instead of re-blocking weekly) stays open for a run where it
actually occurs. No wedge change made.

## Village assessment (plain words)

- 6801 (142d, standing, 7 alive): the justice village. 29 deep
  bonds, 20 delivers, 4 autonomous trials (all acquitted, all
  counted without the silent player). Deaths: stranger 1, monster
  2, wild 1. Bonded and tried at the horizon.
- 6802 (141d, standing, 7 alive): the quiet village. 19 deep bonds,
  36 delivers (the strongest outing village of the four), no cases
  at all — a full social life with the justice story entirely
  absent, as in r77's 6703. Deaths: wound 1, alien 1, monster 1.
- 6803 (143d, standing, 1 alive): the near-extinct village. 29 deep
  bonds, 11 delivers, 1 probe trial (acquitted), 12 deaths
  (stranger 3, combat 4, wild 3, starvation 1, sickness 1) — the
  social fabric outlived nearly everyone in it.
- 6804 (140d, standing, 6 alive): the probe village. 39 deep bonds,
  3 delivers, 3 probe trials (all acquitted, player's guilty vote
  +1 each, never decisive), 1 case that died with its accused
  (case_4, accused_died, no trial). Deaths: ambush 1, stranger 2,
  monster 1, contest 1.

## People check (sense reads, full transcripts)

Five reads (binding: 5, >= 2 outing-related — this run: 2
outing-related, 2 moot-probe, 1 late). 0 fabricated-history flags,
0 weak endings. PEOPLE PASS.
- David, 6801 d8 (favor accept, outing-related): pantry-bare ask,
  concrete plan (south slope below the meadow, sunup, two packs),
  gossip with real uncertainty, one NPC question in return
  ("What's the kindest thing someone's done for you out here?"),
  ends on the plan line ("First light. The pantry's counting on
  us."). Real.
- Grace, 6802 d10 (favor accept, outing-related): pantry-bare ask,
  plan (south slope, before the dew dries, big pack), gossip
  ("Reuben is back"), one honest dry line mid-convo ("...Sorry,
  lost my train of thought.") recovered from, ends on the plan
  line. Real.
- Sam, 6804 d9 (moot probe): 1-turn probe — recall callback
  ("we left it mid-thought, 3 days back"), case framing, moot
  called, convo ENDS there. Real — and the hygiene proof.
- Lena, 6803 d11 (moot probe): grief beat ("They'd tell me to
  keep working"), case framing, moot called, convo ENDS there.
  Real — and the hygiene proof.
- Tom, 6801 d100 (late): wound ask opened, then the player's
  subject change to gossip defers it without resolution — the
  want is deferred by a player choice, not broken by the game;
  the repeated "Who told you that?" (driver re-pick after a
  non-answer) gets a characterful deflection ("Alright — I
  should get back to it."). Ends naturally. Real, weakest of the
  five, not weak by the bar.

## LANGUAGE-BARRIER GATE — investigated, fixed post-measurement

r77's nit, confirmed as a gate gap (not intended behavior):
- Mechanism: betrayal.js wraps convoChoices to PREPEND
  betrayalChoices(vid) to every menu, with no thread gate — while
  betrayalCaseFrame explicitly returns early on nonverbal threads
  ("Never in nonverbal or ambush-thread"). So a German-only
  speaker's convo offers press/site/witnesses/investigate/moot in
  English and executes them in English (r77 Xavier transcript),
  although nvOpen states the barrier as total and the interpreter
  mechanic (nv:translate) exists precisely to bridge it.
- Fix (separate commit, fixtures only, UNMEASURED in natural runs):
  betrayalChoices returns the invite/ambush picks only when
  thread is nonverbal and no interpreter is present
  (c.interpreter, set by the nonverbal menu build via
  findInterpreter). Ambush survival and invitation picks are
  untouched; with an interpreter the case menu returns.
- Proof: scripts/test-betrayal-nonverbal-gate-20261031.js — RED
  before the fix (case picks offered in a nonverbal, no-interpreter
  convo), GREEN after, on SEED=42 and SEED=7. Fixture note: the
  first SEED=7 run failed its own premise (an interpreter WAS
  found) because the fixture zeroed trust — and findInterpreter
  reads (trust || 10), so 0 reads as the default 10. The fixture
  now sets trust 5 (below the bar, truthy). A direct betrayalTurn
  with an unoffered case id is out of scope (no menu offers it,
  per the conversation contract).
- Design question delivered, NOT decided here: whether a letlie-
  shelved (dormant) case should ever come back to the fire
  (r77 item 2). Mechanism attached: open -> letlie -> dormant ->
  npcMootTick skips dormant outright; only mootAdvisoryTick touches
  it, advisory only.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (91% of accepts start, 91% of starts
  deliver) and now YES for autonomous moots — the village calls
  its own moots (4/4 eligible on 6801) and the backstop counts a
  silent player's trial without them. Player-called moots also
  still work (4 probe trials, votes end-to-end).
- FUN: yes — the justice story now plays without the player
  pulling every string (feud -> case -> village-called moot ->
  verdict, with the silence priced in prose: "the count is taken
  without you"), and broken promises do not brick a villager's
  social future.
- WINNABLE: not this leg's question to close — social life feeds
  the win (116 deep bonds pooled, 70 delivers, 8 trials) and three
  villages stood bonded at the horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
LOUD lines, all three the same artifacts as r73-r77, all explained:
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled 116 =
  29+19+29+39), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT — current field is top-level mootsConvened (0 on
  all four seeds, itself the v.moots metric artifact fixed by B1's
  trial count of 8). Not a game bug.
- LOUD `alive newly appeared: baseline 0 -> current 21`:
  BASELINE-SHAPE ARTIFACT — pooled alive 21 = 7+7+1+6. Not a bug.
- l3.bonds and dryRate: quiet. Pooled dryPerConvo 0.28 / 0.38 /
  0.26 / 0.29, inside the [0.20, 0.40] guardrail.
Baseline NOT rolled forward: the stored baseline is a
different-era shape, and rolling it would launder the artifacts
into the baseline.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree AFTER the gate fix (so the fix is covered by the
same run): 284 passed, 6 failed in 420s — the SAME six pre-existing
failures as r73-r77, adjudicated by name, zero new:
1. godpath/test-measurement-proof-update.js — stale balanced-panel proof.
2. godpath/test-measurement-workflow.js — retained neutrality proof
   does not cover current inputs.
3. godpath/test-mobile-combat-cadence.js — Continue wraps the round twice.
4. godpath/test-occupation-panels.js — real CLI workflow.
5. godpath/test-phone-frame-proof.js — 3 fails (retained browser
   inputs vs current source; boot-input coverage; stale phone receipts).
6. test-establishment-r20-fixes-20261020.js — racks-full voice gate
   does not reset daily as the test expects.
Full output in check-quick.log in this directory. (An earlier
tail-only run of the same suite gave the identical 284/6 counts.)

## Metric review

- Bindings B1-B6 judged as written. B1 holds (caseSnaps +
  mootSayLines on all four seeds; trials by first-trial-appearance
  = 8). B2 holds as OBSERVED (4/4 eligible on 6801; 6802
  UNISOLATED on its own, no cases formed). B3 holds as census
  (8 trials, descriptive + cumulative lean at n=10: 9 acquitted,
  1 convicted). B4 holds (16/16 away blocks timed). B5 holds as
  ANSWERED by log trace (16 broken-seen, 10 later-start windows).
  B6 holds (5 reads, 2 outing, 0 fabricated, 0 weak; probe reads
  end at convening).
- Guardrails: pooled dryPerConvo 0.28 / 0.38 / 0.26 / 0.29 — all
  inside [0.20, 0.40].
- Revisions proposed for the NEXT run (r79), not applied
  retroactively:
  1. MEASURE THE GATE: re-run the social leg's case census with
     the nonverbal gate in master (it changes which convos can
     press/investigate — a real trajectory change, so it needs a
     fresh baseline, not a silent fold into r78's numbers).
  2. ACQUITTAL BATCH: keep accumulating; the lean (9/10 acquit)
     wants a convicted-room replication before anyone calls it a
     balance question.
  3. DORMANT RE-ENTRY: still a design question for Steve (see
     above), not a worker decision.
  4. END-BLOCKED: still no data; the question stays open until a
     run actually produces an end-blocked outing.
  5. BROKEN-ORIGIN CLOSED: no further runs needed on this question
     — 10 positive windows settle it.
- Watch items carried: terse case-action prose ("The ground
  remembers."); the analyzer's "playerVoter true but no driver vote
  pick" line misreads playerVoter as "voted" — it means "may vote"
  (trial creation, 90% unless player-convened); final trial states
  must be read from the LAST snap, not the first-trial snap (the
  first snap shows finalGuilty null while the vote is still open).

## Decision note (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold into
policies/competent.js — still owed, still not taken here for the
same reason as r77 (panel re-baseline required).

## Files

- Driver: scripts/journey-social-r78-20261031.js (r77 verbatim +
  r78 arms + SAY TV exclusion; zero game-behavior change in src
  during measurement).
- Wedge: scripts/journey-social-r78-outing-wedge.js (r77 verbatim +
  promise-broken-seen scan).
- Proof tests: scripts/test-journey-social-r78-outing-wedge.js
  (56/56, SEED=42 and SEED=7, before seeds ran);
  scripts/test-betrayal-nonverbal-gate-20261031.js (RED before the
  fix, GREEN after, SEED=42 and SEED=7).
- Fix: src/js/betrayal.js betrayalChoices nonverbal gate (separate
  commit; fixtures only; unmeasured in natural runs).
- Analyzer: scripts/analyze-journey-social-r78-outing-20261031.js.
- Evidence: evidence/2026-11-01/r78/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/, r78-analysis.txt,
  r78-verdicts.json, run.log, check-quick.log).
- Driver post-run patch (filename only, no seed output affected):
  the final verdicts write still used the r77 filename, duplicating
  r78-verdicts.json byte-identically as r77-verdicts.json; the
  string is fixed to r78 and the duplicate deleted. The per-seed
  verdicts write already used the r78 name throughout the run.
