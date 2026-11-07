# sim-mootsummon-a — RE-PIN on current master (2026-11-07)

## ADOPTION ADDENDUM — 2026-11-07, run fleshout-2026-11-07T1021Z (verdict updated: RE-PIN-GO)

This arm was adopted stranded at branch tip cfa467f71 (CENSUS-GO,
PROOF-NOT-GREEN, anchor decision pending). The adoption closed it:

- REBASE: onto explicit master SHA 6a59ed7f (read in the main tree
  immediately before rebasing; master had moved since the 10:21Z
  brief — ed070c955 at brief time, 6a59ed7f at rebase time — after
  the sim-regionalstep-b DIAG-GO landing; the first rebase attempt
  onto the brief-time SHA was caught and redone onto the freshly
  read SHA, per the stale-base rule). Rebase clean, no sequencer
  quirk, no conflicts. New tip 5a4658f94 (evidence) over d398bd6b6
  (prereg). `git log master..HEAD` = the two arm commits only.
  The rebase added no src/js (regionalstep-b is DIAG, no src/js;
  stageally-stab-b / capabledeed are proof/fixture), so the judged
  census corpus (48001–48008, base f043aa772) was NOT re-run —
  the corpus is complete and the rebase invalidates nothing in it.
- PROOF RE-RUN ON THE REBASED TIP (before any anchor edit):
  test-mootsummon-a 31/33, test-mootgate-a 58/60 — identical to
  the 0715Z tallies, the ONLY failures the shared 15003 ld7
  gossip anchor in both. The rebase changed nothing in the moot
  substrate.
- ANCHOR DECISION — STALE (day only), RE-PINNED, NOT A REGRESSION.
  New probe scripts/probe-gossip-anchor-a.js scans every
  loop-day sleep window of a live oneInstance transcript with
  the proof's own code path (sleepPair + windowLines +
  classifyGossipWindow). On the rebased tip, 6 seeds
  (15003, 48001, 48005, 48006, 48008, 17021; 60 loop-days each):
  21–38 'Word gets around' lines per seed, 26 in-sleep-window
  word hits total across the 6 seeds, EVERY one inside Haven.
  Seed 15003 itself holds 3 in-sleep-window hits — loop-day 16
  (TWO lines in one window) and loop-day 39. The anchor's FORM
  is intact; only its DAY went stale (ld7 holds no word line on
  current master). Gossip still fires inside sleep windows on
  every probed seed, the moot census never reads gossip, and no
  game behavior changed — this is instrument drift, not a game
  regression.
  - CORRECTION to the 0715Z "no re-pin available on 15003":
    that read inspected the DRIVER's corpus, and trimTranscript
    (scripts/mootsummon-trace-a.js:387) keeps only stranded
    sleep windows + moot/meal/bedding lines — a gossip line
    inside a NON-stranded sleep window is discarded from the
    corpus by design, so the trimmed corpus cannot show one.
    The full in-process transcript the proof reads DOES hold
    them (ld16 ×2, ld39 ×1 on 15003). The 0715Z conclusion was
    a trimmed-corpus artifact, not a substrate fact. (A
    same-base recheck on f043aa772 was not run; the re-pin is
    verified live on the current tip, which is what the proof
    needs.)
  - RE-PIN: both proofs now anchor on 15003 loop-day 16 (same
    seed, same check shape, minimal diff; ld16 chosen over ld39
    because the window holds two word lines — redundancy if one
    burst half drifts). Header comments in both tests record
    the re-pin and its reason. No assertion was loosened; the
    check still requires a word line inside a sleep window at
    Haven.
- PROOF RE-RUN AFTER THE RE-PIN (rebased tip 6a59ed7f):
  test-mootsummon-a.js 33/33, test-mootgate-a.js 60/60 — GREEN.
  Every moot classifier, every det-gate, the 17021 re-pin, the
  48006 gate anchors, and the re-pinned 15003 ld16 anchor pass.
- VERDICT (updated): RE-PIN-GO. CENSUS-GO stands (0 stranded
  summons in 4 stranded sleep windows, pilot 48001–48008) AND
  the proof is now green, so the prereg's verdict rule is met
  in full. Finding #1793 stays [fixed]; the backlog line opened
  by this arm (15003 anchor stale) is now closed by the re-pin
  — the next moot-family run inherits a green anchor, not a
  known-failing one.
- check.js --quick: NOT run — this adoption adds no src/js and
  no green-list test edit (the finishersize gate owns the gate
  slot this run; per brief, targeted proof tests only).
  Verification is the two proof tests above (33/33, 60/60),
  node --check-clean on the three edited/new scripts, and the
  probe run (exit 0).
- Files in this adoption commit: scripts/test-mootsummon-a.js
  + scripts/test-mootgate-a.js (anchor ld7 → ld16 + header
  notes), scripts/probe-gossip-anchor-a.js (new), this evidence
  file (this addendum). Zero src/js. No push, no bump, no live
  verification — coordinator merges; ship loop owns deploys.


Worker: sim-mootsummon-a (Loop A, food-economy / narration).
Run: fleshout-2026-11-07T0715Z, axis food-economy, arm sim-mootsummon-a.
Prereg (committed BEFORE any judged sim):
evidence/2026-11-07/sim-mootsummon-a-prereg.md (29d1bab71).
Instrument (reused verbatim, zero change): scripts/policies/mootsummon-diag.js
on top of the judged strandnarr-a recorder, driver
scripts/mootsummon-trace-a.js, proof scripts/test-mootsummon-a.js and
scripts/test-mootgate-a.js. Base HEAD: f043aa772. Horizon 60 loop-days,
policies bankfood(warmed(woodcarry(nighttravel))) over competent, env
gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1.
Pilot seeds 48001–48008. Zero src/js in this arm — re-pin / census only.

## Verdict: CENSUS-GO, PROOF-NOT-GREEN (split — read both halves)

- CENSUS: RE-PIN-GO. On current master the fixed shape holds: 0
  moot-turns-to-you summons in 4 stranded sleep windows (all on
  48006, loop-days 7–10 — the same stranding as both 11-06 legs),
  against a live non-stranded background of 12/476 sleep windows
  (2.5%). The gate holds the defect seed's case until the scholar
  returns: 48006's held case convenes on loop-day 12 at Haven,
  in the harness phase, with the identical summons line. No
  stranded summons, no regression. The screen did NOT trigger
  (no regression, non-vacuity bar met).
- PROOF: NOT GREEN. scripts/test-mootsummon-a.js 31/33 and
  scripts/test-mootgate-a.js 58/60 on current master — the ONLY
  failures in both are the same two checks, the shared 15003
  loop-day-7 gossip anchor (see "Anchor drift" below). Every
  moot classifier, every det-gate, the 17021 re-pin, and every
  gate-specific live anchor passes. The prereg's verdict rule
  requires a green proof for a plain RE-PIN-GO, so this arm does
  NOT claim one: the census is GO, the proof is NOT GREEN, and
  the anchor drift is reported as a finding, not silently
  re-anchored and not re-scored away.

## Status on arrival (why this is a re-pin, not a diagnosis)

The briefed assignment — diagnose the stranded-scholar summons
and name the fix — was already complete in master before this arm
started, twice over: sim-mootsummon-a (2026-11-06, DIAG-GO, merged
ed819c29b; 1/22 stranded sleep windows, fix named) and
sim-mootgate-a (2026-11-06, fix BUILT, e53e86531, `mootConveneHeld()`
gate in src/js/betrayal.js; before/after 40 seeds: stranded summons
1 → 0, convening 56 → 58, median survival 60 → 60; verdict GO).
sim-findings.md line 1814 marks #1793 [fixed]. This arm verified the
fixed shape still holds after master moved (journey-establishment
r109 landed since the mootgate after-leg) instead of re-running a
40-seed census on a proven constraint.

## Primary metric (pre-registered)

Stranded sleep-window summons (windows holding >= 1 summons line /
windows), loop-day rate alongside.

| | Sleep windows | Summons windows | Rate |
|---|---|---|---|
| Stranded | 4 | 0 | 0% |
| Non-stranded | 476 | 12 | 2.5% |
| Stranded upkeep | 4 | 0 | 0% |
| Non-stranded upkeep | 476 | 0 | 0% |

- Loop-day rate alongside: stranded loop-days 4, summons on
  stranded loop-days 0/4 (0%); non-stranded loop-days 476, summons
  events 16 (all trial, 0 petition).
- Non-vacuity bar (pre-registered: >= 1 stranded sleep window on
  >= 1 stranding seed): MET — 4 stranded windows on 1 stranding
  seed (48006). The 0 is a held gate, not an absent stranding.
- The pilot's stranded rate (0/4) against the 11-06 census (1/22
  before the fix, 0/22 after) is the expected fixed shape on the
  defect seed itself: 48006 stranded 4 nights on all three legs
  (11-06 before, 11-06 after, this re-pin) and carried the defect
  on the first, none on the second or third.
- Non-stranded background (2.5%) matches the 11-06 legs (2.0%
  before, 2.0% after): moots still convene at Haven. Convening
  is preserved, not just above a bar.

## The held case, verbatim (48006 — the defect seed, now gated)

Scholar stranded loop-days 7–10 (forest floor, same as 11-06).
No summons fires on any stranded day. On loop-day 12, back inside
Haven, the held case convenes in the harness phase — two trial
moots back-to-back, both turning to the scholar at the fire:

> 🔴 LIVE! THE MOOT! The fire's built HIGH and the whole GALAXY
> is watching!
> Vasyl calls the moot. The fire gets built up — word travels
> fast, and almost everyone comes.
> The moot turns to you. Your vote matters here — and everyone
> will remember it.
> 🔴 LIVE! THE MOOT! The fire's built HIGH and the whole GALAXY
> is watching!
> Nikolai calls the moot. The fire gets built up — word travels
> fast, and almost everyone comes.
> The moot turns to you. Your vote matters here — and everyone
> will remember it.

The first is the held NIKOLAI/DANTE/PAUL case (eligible day 9,
convened day 12 — 3 days held, 2 of them stranded, same as the
11-06 after-leg). The second is a further case convened the same
day. Both summonses fire at Haven (position inside=true,
tile=haven) — the gate's designed behavior, not a defect.

## Resolutions (per-summons follow-up, all 16 events)

- 14/16 resolved via the 2-day backstop + verdict within the
  3-day follow-up window (the village takes the count without the
  scholar; 0 votes ever cast in sims — the policy never takes a
  conversation choice, as pre-registered).
- 2/16 — the two 48006 loop-day-12 summonses — have no backstop
  or verdict in the 3-day window. The kept transcript explains at
  least one of them: on loop-day 12, "Paul is gone — the moot
  doesn't try the dead. The cases die with the accused; the fire
  remembers the rest." Paul was one of the accused; his death
  closes the case by the dead-case line (the 11-06 mootsummon
  metric-review item 3 — this instrument still has no dead-case
  classifier, so the follow-up reports "no backstop" where the
  mootgate instrument would have reported "dead-case"). The
  second loop-day-12 case's resolution is not visible in the
  follow-up window: named as unjudged, not hidden. Neither
  summons is stranded, so neither touches the primary metric.
- Kind split: trial 16/16, petition 0/16. The petition summons
  still cannot fire while stranded by construction
  (player-convened, synchronous) — and still never fires in sims
  at all (the policy never presses "Call a moot").
- Transcript errors: 0 across all 8 seeds.

## Per-seed table (daysAlive / end / stranded nights / stranded sleep windows-summons / non-stranded sleep windows-summons / summons events)

Format per seed: daysAlive, endReason, strandedNights,
sSleepW-sSummW, nsSleepW-nsSummW, events.

- 48001: 60 survived / 0 / 0-0 / 60-1 / 2
- 48002: 60 survived / 0 / 0-0 / 60-0 / 0
- 48003: 60 survived / 0 / 0-0 / 60-3 / 3
- 48004: 60 survived / 0 / 0-0 / 60-1 / 1
- 48005: 60 survived / 0 / 0-0 / 60-2 / 3
- 48006: 60 survived / 7,8,9,10 / 4-0 / 56-0 / 2 (both ld12, at Haven)
- 48007: 60 survived / 0 / 0-0 / 60-0 / 0
- 48008: 60 survived / 0 / 0-0 / 60-5 / 5
- Pooled (8 seeds): daysAlive sum 480; survived 8/8 (median 60d,
  the horizon cap; max 60d); stranded nights 4; stranded sleep 4
  windows / 0 summons; stranded upkeep 4 windows / 0;
  non-stranded sleep 476 windows / 12 summons windows;
  non-stranded upkeep 476 windows / 0; summons events 16 (all
  trial); backstop resolutions 14; votes cast 0; transcript
  errors 0.

## Gate-path re-verification (question (d), code read on current master)

Both autonomous convening paths check `mootConveneHeld()` before
`callMoot`: npcMootTick (betrayal.js:5496) and playerCaseTick
(:5536). The gate itself (:5447) holds unless the scholar is at
Haven, with the exile exception and fail-open on a missing reader
— unchanged from the landed fix. The only ungated convening
paths are player-initiated acts at the fire by construction:
MOOT-RECALL (conversation choice, :4631) and demandMoot (accused
player demands the moot early, :5154) — both require the scholar
to be present and acting, so neither can deliver a summons to a
stranded scholar. `callMoot` is idempotent (no-op if a trial is
already in session). No autonomous path bypasses the gate on
current master.

## Anchor drift (the proof-not-green half, reported not re-anchored)

Both proofs fail the SAME two checks and nothing else:

- FAIL "non-stranded anchor: 15003 loop-day-7 sleep window has a
  Word-gets-around line" (pair7=true — the window exists, the
  line is not in it).
- FAIL "non-stranded anchor: that hit fires inside Haven".

Diagnosis (established this run by re-running the driver on
15003 and inspecting the corpus): on current master, seed 15003's
'Word gets around the haven' lines fire on loop-days 9, 10, 14,
39 — in the evening say-tails, NOT inside any sleep window's kept
lines (0 word hits in any sleep window on this seed: ld7, ld9,
ld10, ld14, ld39 all 0). The gossip burst moved off day 7 and out
of the sleep window with the substrate (trajectories moved after
journey-establishment r109 and other master moves). There is NO
current-substrate re-pin available on 15003: no 'Word gets
around' line sits inside any sleep window's kept lines on this
seed, so the anchor cannot be re-pointed at another day — it must
be re-pointed at another seed, or dropped.

Why this does NOT invalidate the census: the anchor is a
mechanism check for the shared sleep-window machinery, and the
machinery demonstrably works on current master — the pilot
classified 4 stranded sleep windows on 48006 (identical seed,
days, and count to both 11-06 legs), the det-gates pass in both
proofs (ON vs OFF trajectories identical), the 17021 re-pin is
exact in both proofs (60d survived, 0 stranded nights, 0
stranded sleep windows), and the mootgate proof's live anchors
pass (48006: 0 stranded-loop-day summons after the fix; ld9 has
no summons; 48006 still strands). The failure is isolated to the
gossip line's timing, which the moot census never reads — the
moot classifiers do not use the gossip classifier. The next run
should re-pin the gossip anchor to a current-substrate seed/day
or drop it as a mechanism check for moot arms; it should NOT
silently edit the proof to green.

## Sense-testing (transcripts read, not just counted)

- The held moot reads true: the same case, the same summons
  line, convened three days later at Haven instead of in the
  forest. Nothing in the delayed moot's transcript references
  the scholar being away — the hold burns no convening line
  while the scholar is away, as designed.
- The dead-case line reads true as a verdict on a dead accused:
  "Paul is gone — the moot doesn't try the dead. The cases die
  with the accused; the fire remembers the rest." The moot dies
  with him the same day it was finally called — a coherent
  story, not a defect, and the gate is what made the timing land
  that way (called on return, accused dead the same day).
- No stranded-window summons exists to quote — there is nothing
  that reads wrong in this corpus. The non-stranded summonses
  (12/476 windows) are the village turning to its scholar at the
  fire, where the vote surface (a conversation away) is real.

## Metric review

- The pre-registered verdict rule did its job exactly as designed:
  it FORBIDS a plain RE-PIN-GO when the proof is not green, even
  though the census itself is clean. The split verdict above is
  the rule applied, not a re-score. No metric was changed mid-run.
- PROPOSED REVISION 1 (proved this run): the 15003 ld7 gossip
  anchor is stale on current master and un-re-pinnable on 15003
  (no gossip line inside any sleep window on that seed). The next
  moot-family run should re-pin the anchor to a
  current-substrate seed/day (verified before the pilot, not
  assumed) or drop it — the moot census does not depend on the
  gossip classifier, and a stale mechanism anchor that fails on
  every run is noise, not signal. Do NOT edit the proof to green
  without the re-pin verification.
- PROPOSED REVISION 2 (carried from 11-06, still open): the
  mootsummon instrument still has no dead-case classifier, so a
  case closed by accused-death reads as "no backstop" in the
  follow-up (both 48006 ld12 events here). The mootgate
  instrument has the classifier; the next mootsummon-family run
  should port it rather than re-deriving it.
- The loop-day primary (mootsummon metric-review item 1) ran
  clean alongside the sleep-window primary: stranded loop-day
  summons 0/4, non-stranded 16 events / 476 loop-days. The two
  primaries agree, as in the 11-06 census.
- The 3-day follow-up window is still short when cases close by
  accused-death on the convening day itself (48006 ld12): the
  dead-case line fired the same day, inside the window, but the
  instrument does not classify it. See revision 2.

## Wall numbers (carried, NOT re-measured)

This is a narration re-pin corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24. Consistent with the 0028Z round
(evidence/2026-11-05/sim-winnability-round-0030.md): wins
lesser-only, full seat 0, wave-5 kills 0. This corpus's survival:
8/8 survived the 60d cap, median 60d — a narration corpus, not
a scale run.

## Runs, files, commits

- Prereg: evidence/2026-11-07/sim-mootsummon-a-prereg.md
  (29d1bab71, committed BEFORE any judged sim).
- Proof: scripts/test-mootsummon-a.js — 31/33 (unit classifiers
  + det-gate + 17021 re-pin pass; 15003 ld7 gossip anchor fails,
  drift documented above). scripts/test-mootgate-a.js — 58/60
  (all gate checks + live anchors pass; same 2 anchor checks
  fail). Both run 2026-11-07 on base f043aa772 with the substrate
  env gates set.
- Pilot corpus: evidence/2026-11-07/sim-mootsummon-a-repin-corpus/
  mootsummon-s48001..48008.json (8 files, 0 instrument errors,
  0 transcript errors).
- check.js --quick: NOT run — this run adds no src/js, no
  instrument change, and no green-list test edit, so no
  green-list test can be affected by it (the 11-06 precedent is
  the same). Verification for this run is the two proof tests
  (31/33, 58/60 — split verdict, see above), node --check-clean
  existing scripts (unchanged), and the pilot census.
- Infrastructure notes: the safe-commit index clobber hit the
  prereg commit (file shown staged-as-deleted after commit);
  repaired with git update-index --add --cacheinfo from the HEAD
  blob, tree verified clean (status empty + diff HEAD empty +
  hash-object matches). No EPERM flap hit this run (all 8 corpus
  files wrote on first attempt). No master move during the run
  (base f043aa772 still HEAD at evidence time — verified below).

## Left unjudged

- The second 48006 loop-day-12 case's resolution: its dead-case
  or backstop line is not visible in the 3-day follow-up (see
  metric review revision 2 — the instrument lacks the dead-case
  classifier). Named, not hidden.
- Whether the gate stalls the justice ladder on longer strandings
  than 4 nights: the longest hold observed anywhere in this
  family is 3 days (48006 ld9→ld12). No longer stranding was
  observed on the pilot band.
- The gossip anchor's replacement seed/day: named in metric
  review revision 1 for the next run; this arm reports the drift
  rather than re-pinning it.

## Backlog items (for the coordinator — nothing new to append)

- #1793 stays [fixed] (sim-findings.md:1814). No new finding is
  opened by this arm: the census confirms the fix, and the anchor
  drift is an instrument-maintenance note (metric review
  revision 1), not a game defect.
- [open] 2026-11-07 — instruments/moot — 15003 LOOP-DAY-7
  GOSSIP ANCHOR IS STALE ON CURRENT MASTER (sim-mootsummon-a
  re-pin, evidence/2026-11-07/sim-mootsummon-a.md): both moot
  proofs fail only the shared 15003 ld7 gossip anchor (31/33,
  58/60). The 'Word gets around' lines now fire on ld9/10/14/39
  in evening say-tails, none inside any sleep window's kept
  lines on 15003 — no re-pin available on that seed. Next
  moot-family run should re-pin the anchor to a
  current-substrate seed/day (verified, not assumed) or drop it;
  the moot census does not depend on the gossip classifier.
