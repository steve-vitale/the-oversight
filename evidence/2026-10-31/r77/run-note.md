# Journey social r77 — RUN NOTE (lane B, 2026-10-31)

Leg 5 (social life), seeds 6701-6704, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master b9f0177be.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout (verified
by reading the file back). Driver: scripts/journey-social-r77-20261031.js
(r76 verbatim except the r77 wedge + censuses + probe hygiene +
Amendment A, below). Wedge: scripts/journey-social-r77-outing-wedge.js
(r76 verbatim + away sinceDay/duration in dawnDiag). Proof test
scripts/test-journey-social-r77-outing-wedge.js 51/51 on SEED=42 and
SEED=7 BEFORE seeds ran. Smoke 6705 (30d) PASS. Zero src/js changes.
Arms: 6701/6702 'linger' (r76 policy verbatim + recording-only
additions; probe WITHHELD); 6703/6704 'mootprobe' (linger + one
betrayal:moot pick per case, convo ENDED after the pick).

## Pre-flight

- Main tree `git status --short` empty; disk 22%. Reap: nothing
  removed; sibling dirty trees left untouched (including the
  journey2-succession-r86 tree with a stale heartbeat and
  uncommitted changes — not mine, left alone). Lock: none held at
  start (no stale-lock recovery needed). Worktree journey2-social
  registered + heartbeated (10-min loop, registry read back).
- Canon: docs/CANON.md + the betrayal/moot code paths in
  src/js/betrayal.js read before judging (callMoot idempotence,
  npcMootTick, tallyVotes, letItLie, trialVoteTick backstop) — no
  canon doc covers moot convening in full; the code is the source
  here, cited by function name in this note.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran) plus
Amendment A appended to it after the first sweep (below). Bindings
judged as written, under the amended rules where stated; no metric
re-scored. Arms differ by construction (probe picks consume turns
and convene trials), so arm comparisons are descriptive, NOT a
balanced-panel before/after claim against r76 or between arms.

## AMENDMENT A — first sweep withdrawn, re-run (read this first)

The first sweep (files preserved in first-sweep/) produced a B2
verdict of "AUTONOMOUS CONVENING OBSERVED" on 6701. That verdict is
WITHDRAWN: investigation showed the linger driver's generic fallback
(fresh non-leave pick) picked offered betrayal:moot choices, so
6701's two first-sweep trials were player-called (playerConvened=
true, SAY "You call a moot"), not autonomous. The control arm was
not probe-withheld in practice. Second finding in the same sweep:
the SAY filter's /moot/ substring matched 'smooth' (s-moot-h) in
plant-study lines and 'moot crowd' contest scores — junk lines in
the census. Fixes (driver-only, zero game change): the fallback
never picks betrayal:moot on any arm (moot offers are picked only by
the declared probe; vote picks stay pickable — the player is a
juror); the SAY filter is phrase-anchored. The re-run reuses seeds
6701-6704: 6702/6703/6704 reproduce byte-identically except the two
new census fields (their trajectories never hit a fallback moot
pick), while 6701 diverges (its trajectory ran through the fallback
moot picks) — the re-run is a new measurement with a declared
instrument fix, not a silent overwrite. All findings below are from
the RE-RUN unless marked first-sweep.

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers |
| 6701 | linger | 28 | 5 | 7 | 1 | 2 | 1 | 2 | 0 | 0 | 0 |
| 6702 | linger | 32 | 8 | 10 | 5 | 5 | 3 | 7 | 2 | 2 | 2 |
| 6703 | mootprobe | 137 | 0 | 94 | 18 | 18 | 12 | 19 | 10 | 10 | 10 |
| 6704 | mootprobe | 141 | 5 | 42 | 19 | 20 | 15 | 16 | 13 | 13 | 13 |
| POOLED | — | — | 18 | 153 | 43 | 45 | 31 | 44 | 25 | 25 | 25 |

Starts 31/45 accepts (69%, r76: 79% — the two short villages drag
it; the long seeds are 12/18 and 15/20). Delivers 25/31 starts
(81%, r76: 78%). Retries: 17 assigned, 15 started (r76: 13/13;
the 2 misses are 6703's, where the retry window closed). Travel-
walked 6, travel-blocked 0 — the walk gate holds. Blocked
decomposition: no-micro-pos 17, away 12, node-elsewhere 8,
non-adjacency 5, micro-far 3. Three villages scattered or extinct
before the horizon (6701 d28, 6702 d32, 6703 extinct by d137);
6704 stood to the horizon.

## Q1: moot metric, FIXED

Trials counted by first-trial-appearance in caseSnaps: 2 pooled
(both 6704, both probe-convened). The legacy mootsConvened reads 0
on all four seeds — the v.moots artifact again, never a count.
SAY convening lines: 16 pooled, but the count still carries TV
noise (6704 d58 "TONIGHT: The Moot" show lines match the THE MOOT
phrase) — the convening lines themselves are clean (d11-d13 on
6704: discovery, "You call a moot", "The moot turns to you"), and
the trial count is the primary metric, so B1 holds with the TV
refinement carried to r78. The 62-offer note: on 6701 the case_2
moot offer appeared in 62 of 63 betrayal convos and was never taken
post-fix — the moot offer is sticky, not one-shot; the driver
investigated (site/witnesses/investigate) and then let it lie.

## Q2: autonomous convening — STILL UNISOLATED (the honest verdict)

Post-fix fallback moot picks: ZERO on every arm (the only moot
picks in the re-run are 6704's two declared probe picks). But the
autonomous test still never got a clean shot:
- 6701's only case (case_2, ambush, Priya/Giulia/Sanne vs Dawit,
  opened d6) was shelved by the PLAYER on d8: the driver picked
  betrayal:letlie in a Grace convo (site/witnesses/investigate/
  letlie), and letItLie sets status dormant. npcMootTick only
  touches status 'open', so the case could never convene after d8
  — the mootIn window (d9, tick default 3, mootIn field null) was
  never reached in 'open' state. The case later died with the
  accused (SAY d27: "Giulia is gone — the moot doesn't try the
  dead"; Giulia starved d28; village scattered d28).
- 6702 formed no case at all.
So under the strict rule (no player case-state action before
mootIn day), eligible control cases = 0: UNISOLATED, not failed.
The analyzer's printed "PARTIAL/UNCONVENED" for 6701 uses a looser
rule (it does not exclude letlie-shelved cases); this note
overrides it with the stricter reading, and the mechanism is named.
Design observation, not a bug claim: letting it lie permanently
kills the moot for that case — nothing re-opens a dormant case
except mootAdvisoryTick (advisory only), and npcMootTick's loop
skips dormant outright. Whether a shelved case should ever come
back to the fire is a design question for r78, not a defect found
here: letlie is a deliberate player choice (trust -15 on the
accused, cold war +1), honestly voiced.
- r78 needs a hands-off-cases control arm (driver picks no case
  actions at all on control) to isolate npcMootTick. That is the
  named-next, not a silent change: it changes what the control
  player does.

## Q3: acquittal lean — DESCRIPTIVE ONLY (n=2, bar is 10)

Both trials are 6704 probe trials; the driver's guilty votes were
cast in LATER convos (Yuki d12, Somchai d13), never in the probe
convos themselves — probe hygiene holds.
- case_2 (ambush): NPC 0/5 guilty, wild day, acquit scores mean
  57.2, player guilty -> final 1, acquitted. A unanimous-acquit
  room on a wild day; the player's lone guilty vote changed nothing.
- case_4 (murder): NPC 7/7 guilty, mean -32.1, player guilty ->
  final 8, convicted, resolution exile. A unanimous-guilty room.
No lean verdict on two unanimous rooms in opposite directions.
Vote-math note for the next batch: the acquit room's scores sit
far from zero (+57) and the guilty room's far the other way
(-32) — belief + affinity, not the swing, is doing the work in
both; the swing (±12 normal, ±70 wild) did not flip either room.
The backstop (trialVoteTick, count without the player after 2
silent days) did not fire on either trial: both have playerVoter
true and a driver vote pick on record.

## Q4: away return timing — ANSWERED, with real numbers

12/12 away blocks carry sinceDay + duration (B4 holds, zero
missing). Computed return minus block day: +1 on 1, +2 on 6, +3
on 5. Purposes: water 4, visit 4, traps 2, explore 1, guard 1.
Partners are out on jobs or visits one node out (Chebyshev 1 on
10/12) and back within 1-3 days: waiting a dawn or two is the
honest play, and the promise window survives it. This closes
r76's B2 gap (returnDay was null because the field is never
written); the r76 away finding stands, now timed.

## Q5: broken-origin restart — STILL UNCAUGHT (method limit named)

Final-ledger method: 6704 has 1 broken favor in the final ledger,
0 later starts from that villager; 6701/6702/6703 have 0 broken
favors in the final ledger, so the window is untestable there
(broken favors that leave the ledger are invisible to this method).
Post-ending windows generally are plentiful (17: delivered and
started-undelivered origins alike, gaps 4-95d), so ended outings do
not block later ones — but the broken-origin subset specifically
still has no caught example. r78 should trace broken endings in
the outing log itself (status/broken transitions as they happen),
not the final ledger.

## Q6: probe hygiene — PROVEN

Both 6704 probe convos end at the convening line ("The moot is
called. The fire gets built up.") with no post-convening fallback
pick and no vote line in the probe convo. The guilty votes arrived
in separate later convos, on the record. The r76 contamination
(fallback votes inside probe convos) is gone.

## Q7: end-blocked repetition — NO DATA THIS RUN

0 end-blocked entries on all four seeds (no outing ever stalled
at its end). r76's question — should a permanently unavailable
partner close an outing out instead of re-blocking weekly — stays
open for a run where it actually occurs. No wedge change made.

## Village assessment (plain words)

- 6701 (28d, scattered, 5 alive): the short village that shelved
  its one case and then starved. 1 deep bond. One outing started,
  none delivered. Deaths: wild 1, sickness 2, starvation 2 (the
  last two on d28, the scatter day).
- 6702 (32d, scattered, 8 alive): the short village with no case
  at all. 4 deep bonds in 32 days, 2 delivers. Deaths: betrayal 1,
  a stranger 1, starvation 1, monster 1, sickness 2.
- 6703 (137d, extinct, 0 alive): the long village that died at
  the horizon. 33 deep bonds, 10 delivers, no cases, no moots —
  a full social life with the justice story entirely absent.
  Deaths: monster 6, wild 5, combat 2, dehydration 2, wound 1,
  sickness 1, arena 1.
- 6704 (141d, standing, 5 alive): the justice village. 27 deep
  bonds, 13 delivers, 2 trials (1 acquittal, 1 exile), 9 deaths
  (ambush 1, monster 4, stranger 2, wild 2). Bonded and organized
  at the horizon, with a feud tried at the fire twice.

## People check (sense reads, full transcripts)

Five reads (binding: 5, >= 2 outing-related — this run: 2
outing-related, 2 moot-probe, 1 late). 0 fabricated-history flags,
0 weak endings. PEOPLE PASS.
- Yuki, 6704 d18 (favor accept, outing-related): pantry-bare ask,
  concrete plan (mango thicket, morning, big pack), a want-thread
  ("running toward the feeling of arriving", "four walls and a
  roof"), one honest recap loop, ends on the plan line ("First
  light. The pantry's counting on us."). Real.
- Tashi, 6702 d7 (favor accept, outing-related): pantry-run ask,
  plan (meadow edge west of the creek, sunup, pack and knife),
  Rosa gossip with real uncertainty, ends resolved ("You're a
  good listener" / plan line). Real.
- Xavier, 6704 d12 (moot probe): press finds cracks in two cases,
  site beat ("The ground remembers." — terse, carried nit), moot
  called, convo ENDS there. Real — and the hygiene proof. Nit:
  the convo opens "Xavier speaks only German, no shared words",
  yet press investigation proceeds — the language barrier does
  not gate investigation beats.
- Sam, 6704 d13 (moot probe): opens on a confession ("I stole
  medicine from the stash once"), the unsettled murder named,
  moot called, convo ENDS there. Real — and the hygiene proof.
- Raushan, 6704 d100 (late): unfinished gossip thread continued
  ("We never finished talking about the gossip"), trap-line
  invitation, roles menu handled, gossip settled ending ("This
  was good. They mean it."). Real. Nit: the driver picked Scout
  though the menu marks it held by Yuki — a driver pick oddity,
  not a game senselessness claim.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (69% of accepts start, 81% of starts
  deliver) and for player-called moots (probe convenes + votes
  end-to-end, twice). NOT YET PROVEN for autonomous moots — the
  village calling its own moot without the player is still
  unobserved, because the one clean candidate was shelved by the
  player first.
- FUN: yes — the outing story completes, the justice story plays
  (feud -> case -> moot -> verdict, with a unanimous acquittal
  and a unanimous exile in one village), and the vote has a price
  (the guilty votes land in the count, out loud, in front of
  everyone, per the game's own copy).
- WINNABLE: not this leg's question to close — social life feeds
  the win (65 deep bonds pooled on the two long seeds, 25
  delivers, 2 trials held) and one village stood bonded at the
  horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four re-run per-seed
JSONs (metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened,
alive).
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT (same as r73-r76) — current field is l3.deep2
  (pooled 65), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT (same as r73-r76) — current field is top-level
  mootsConvened (0 on all four seeds, itself the v.moots metric
  artifact fixed by B1's trial count of 2). Not a game bug.
- LOUD `alive newly appeared: baseline 0 -> current 18`:
  BASELINE-SHAPE ARTIFACT (same as r73-r76) — pooled alive 18 =
  5+8+0+5. Not a bug.
- l3.bonds and dryRate: quiet. Pooled dryPerConvo 0.271, inside
  the [0.20, 0.40] guardrail (per-seed 0.43 / 0.12 / 0.30 / 0.25).
- Baseline NOT rolled forward: the stored baseline is a
  different-era shape, and rolling it would launder the artifacts
  into the baseline.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`:
284 passed, 6 failed in 444s — the SAME six pre-existing failures as
r73/r74/r75/r76, adjudicated by name, zero new:
1. godpath/test-measurement-proof-update.js — stale balanced-panel proof.
2. godpath/test-measurement-workflow.js — retained neutrality proof
   does not cover current inputs.
3. godpath/test-mobile-combat-cadence.js — 2 fails (enemy announcement
   order; Continue wraps the round twice).
4. godpath/test-occupation-panels.js — real CLI workflow.
5. godpath/test-phone-frame-proof.js — 3 fails (retained browser
   inputs vs current source; boot-input coverage; stale phone
   receipts).
6. test-establishment-r20-fixes-20261020.js — racks-full voice gate
   does not reset daily as the test expects.
The run total is 6 failed, so the failing set is exactly these six.

## Metric review

- Bindings B1-B6 judged as written (B2 under the strict rule in
  Amendment A + this note's letlie refinement). B1 holds (trial
  count 2, SAY census present, TV-line refinement carried).
  B2 UNISOLATED (0 strict-eligible control cases; the one
  candidate was letlie-shelved d8). B3 holds as census (2 trials,
  descriptive only, below the 10-trial bar). B4 holds (12/12 away
  blocks timed). B5 uncaught (final-ledger method limit; log-
  tracing proposed). B6 holds (5 reads, 2 outing, 0 fabricated,
  0 weak).
- Revisions proposed for the NEXT run (r78), not applied
  retroactively:
  1. HANDS-OFF-CASES CONTROL: a control arm that picks NO case
     actions (no site/witnesses/investigate/letlie/expose/bribe
     picks) — the only clean npcMootTick test. Declare it as a
     behavior change for that arm, not a silent default.
  2. DORMANT RE-ENTRY QUESTION: should a letlie-shelved case ever
     come back to the fire, or is permanent shelving the design?
     Name it as a design question with the r77 mechanism (open
     -> letlie -> dormant -> npcMootTick skips) attached.
  3. BROKEN-ORIGIN BY LOG TRACE: trace broken transitions in the
     outing log as they happen, not the final ledger.
  4. SAY CENSUS: exclude 📺/contest "Moot" show lines from the
     convening census (phrase list + a TV/contest exclusion).
  5. ACQUITTAL BATCH: keep accumulating trials toward the
     10-trial bar; report score-spread means (belief/affinity
     dominated both r77 rooms) alongside margins.
  6. LANGUAGE-BARRIER NIT: press investigation proceeds through
     a no-shared-words frame (Xavier) — check whether that is
     intended or a gate gap.
- Watch items carried: terse case-action prose ("The ground
  remembers."); driver recap loops, honestly answered; the
  game.js away-record comment shape is stale (returnDay/
  returnPart never written — the record's real shape is
  sinceDay/sincePart/duration, now recorded).

## Decision note (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold
into policies/competent.js — r76 recommended YES as a shared
driver/policy helper with a panel re-baseline, lane decision owed,
NO policy file changed. r77 does not take it, for the same reason:
the fold changes every bot's trajectories and must land with a
panel re-baseline, not mid-cycle inside a measurement run. The
end-blocked question is likewise census-only here (and had no
data this run).

## Files

- Driver: scripts/journey-social-r77-20261031.js (r76 verbatim +
  r77 wedge + censuses + probe hygiene + Amendment A; zero
  game-behavior change in src).
- Wedge: scripts/journey-social-r77-outing-wedge.js (r76 verbatim
  + away sinceDay/duration/computed-return fields).
- Proof test: scripts/test-journey-social-r77-outing-wedge.js
  (51/51, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r77-outing-20261031.js.
- Evidence: evidence/2026-10-31/r77/ (prereg.md + Amendment A,
  this note, per-seed JSONs, transcripts/, summaries/,
  r77-analysis.txt, r77-verdicts.json, run.log, run2.log,
  check-quick.log, first-sweep/ with the withdrawn first sweep).
- No src/js changes. No [needs-eyes] (no feel/combat/UI change
  for Steve to playtest; the findings are measurement +
  instrument corrections, plus one overturned verdict).
