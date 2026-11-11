# Journey succession r177 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r177 (next Lane B number after r176 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master fc0ffb37c (journey-scale r130) at run start ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-11/journey-succession-r177-prereg.md.

## Standing state

No lock at run start; no stale-lock recovery needed. Pre-flight:
main tree clean, disk 35%. `git pull --ff-only` fails (standing
divergence, local master ahead 524 / behind 156; reconciliation
pending since Nov 8) — proceeded on local master per r156/r164/r168/
r176 precedent, no push, no bump. Reap: LOUD lines only for other
owners' dirty trees — not touched. Worktree registered
(journey2-succession), heartbeated immediately and after the panel.
Registration itself took 144s (slow tree op, no error).

This run is the first fresh panel judged under the r170-revised
MANTLE-FINE rules (VILLAGE-OVER exclusion, SAME-DAY-CASCADE
classification). No code change was planned going in; the run's job
was to judge the bars on new ground and watch the carried same-class
dry sites in the wild. No src/js change landed this run.

## Panel

Driver scripts/journey-succession-r177-20261111.js (r169 driver,
rename only), analyzer scripts/analyze-journey-succession-r177-
20261111.js (r170 analyzer, rename only — carries the revised
MANTLE-FINE rules). Seeds: FRESH BAND 34201–34208
(EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998 (EARLY_KILL_DAY=5,
POST_DAYS=25). Pilot seed 34201 ran clean first (41s, exit 0);
the remaining 7 + smoke ran sequentially (~4 min total, all exit 0).
Analyzer: evidence/2026-11-11/journey-succession-r177-analyzer.txt.

Per-seed tele (deaths.bearer / alive / fallen / stage / mentions):

| seed | bearer | alive | fallen | stage | mentions | over |
|------|--------|-------|--------|-------|----------|------|
| 34201 | 4 | 7 | 9 | 3 | 5 | no |
| 34202 | 7 | 7 | 8 | 3 | 4 | no |
| 34203 | 11 | 1 | 16 | 3 | 4 | yes |
| 34204 | 5 | 8 | 8 | 3 | 4 | no |
| 34205 | 3 | 8 | 8 | 3 | 5 | no |
| 34206 | 4 | 7 | 5 | 3 | 5 | no |
| 34207 | 10 | 7 | 14 | 3 | 5 | no |
| 34208 | 4 | 7 | 5 | 3 | 4 | no |
| 33998 smoke | 1 | 11 | 1 | 3 | 2 | no |

Panel means (8 fresh seeds): bearer 6.0, alive 6.5, fallen 9.1,
stage 3.0, mentions 4.5. Against the telemetry baseline (7.6 /
3.8 / 14.3 / 3.0 / 4.2) and the r169 panel means (8.0 / 3.1 /
11.6 / 3.0 / 4.1): this band ran less bloody — two seeds bled
hard (34203: 11 bearer deaths, village over at 1 alive; 34207:
10), the other six held 7–8 alive. Band variance, not a fix
effect: no src change in this run targets deaths, and the two
bloody seeds' deaths are wild/stranger/arena/contest, same as
r169's read.

## Panel verdicts vs pre-registered bars

- **MANTLE-FINE (binding, revised r170 rules): PASS.** Deaths
  observed 49 (village-over excluded: 0; flippedImmediate=false:
  0; fineLatency>=2: 0; fineLatency==1 unexplained: 0;
  held-briefly same-day cascade bearers: 5; coarse>fine sampling
  gaps: 0; day-skips total: 0). Every bearer death with a living
  successor flipped synchronously at return; the 5 held-briefly
  rows are same-day cascades (wrap-proven). The revised bar is
  now confirmed on a fresh panel — the r169 letter-FAIL stays
  standing history, and the revision is the bar going forward.
  All 49 MANTLE-FINE rows classify SAMPLING-or-CLEAN; every
  chain handoff has coarseLatency 0.
- **DRY CENSUS (binding): PASS.** 24 fellBack entries across the
  9 seeds: 22 pick-null foreign-language lines (the r81
  nonverbal-gesture narration, honest by design), 1 deflect_q
  (34206 d105: "Okay." Something shutters, just slightly. — a
  real deflection beat, transcript-verified below), 1
  agency:ask_expedition (34208 d21: "Saw things with too many
  joints. Give them room." — a real expedition answer,
  transcript-verified below). 0 dry lines anywhere (no
  "...Sorry, lost my train of thought." in any fellBack key).
  0 ask:lately fellBack — the r170 fix holds on a fresh panel.
  0 dlg:more fellBack. 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY.
  The carried same-class sites (convoThreadBeat `exh` closers,
  base `more` choice) stayed dry-free in the wild for the third
  straight panel.
- **CAP-NC (descriptive): INSUFFICIENT-DATA.** Bonded-by-deadline
  2/2 eligible seeds (denominator < 3). Descriptive bondedEver
  4/6 probe-opened seeds. CAP-D14: 3 bonded-d14 of 9. OPP:
  unbonded talk-requests 4; FIRST-bearer new bonds on undriven
  days 4; NPC-NPC new bonds 80; newcomer arrivals 28;
  FIRST-bearer newcomer bonds 0 vs pre-existing 5; selfReq
  day-entries 0 (r133 purge holds).
- **CONTROLS (binding): PASS on the 5 named numbers, MISS on
  strict full-file byte-identity — investigated, see below.**
  Smoke 33998 headline: deaths 1, alive 11, fallen 1, stage 3,
  mentions 2 — identical to r161/r165/r166/r169. Pick rank 1 and
  funeral INCALL true on all 9 seeds. selfReq 0 everywhere.
  DeAndre speaks the trapline line (d+7: "an old trapline —
  I'll show you on the map sometime. It's real."). The r161
  agency fix holds.

## The smoke control miss — investigated and pinned (not re-scored)

The smoke tele file is NOT byte-identical to r169's. The moved
second-order counters: pantryEnd 13262 -> 14108,
trustOfficeDelta 11 -> 12, trustVillageDelta 49.9 -> 48.2,
deedCalls 36 -> 30, bumpCalls 754 -> 732, bumpWithReason
744 -> 723, callMovesWithDonation 1 -> 0, callMovesSoloOffice
0 -> 1, callMovesMoverNamed 3 -> 2, armorBarkLast 2 -> 4.
The 5 headline numbers are unchanged.

Bisect (sparse-tree smoke runs, ~25s each; full-tree extracts
took 3–14 min under the EPERM flap, so sparse archives were used
after the first two):

- wave5kill tip 203a32775: OLD numbers (byte-identical to r169).
- pre-r169 72a598bf8^: OLD. r169 fix 1 (72a598bf8): OLD. r169 A1
  (e04480c9f): OLD.
- r170 tip 2147af8a4 (full-tree run): NEW (pantryEnd 15630,
  deedCalls 31, bumpCalls 718, alive 10, fallen 2).
- answermail tip 43c6742e0 (sparse; tree includes r169/r170 via
  merge ancestry): NEW, byte-identical to the r170 tip — the
  ANSWERMAIL_DRIVE hierarchy.js hook contributes nothing to the
  smoke change.
- r176 tip 82450a883 (full-tree run): NEWER numbers,
  byte-identical to r177's smoke tele (deedCalls 30, bumpCalls
  732, headline 1/11/1/3/2).

Verdict: the FIRST move is the r170 ask:lately exemption
(2147af8a4, conversation.js +14 — the only commit in
e04480c9f..2147af8a4). Mechanism: the exemption sets
structuralTurn on every ask:lately turn, which changes
run-ledger state for those turns (blocked or not) and so shifts
the conversation RNG stream and downstream daily decisions —
the chore mix moves (deedCalls 36->31, bumpCalls 754->718) and,
on this seed at that tip, one extra villager died (alive 10,
fallen 2). Later landings (r124/r125/r128/r129/r172/r176) moved
the counters again while the headline recovered to 11/1; the
smoke has been stable since r176 (r176-tip tele == r177 tele
exactly). No game defect: the village still lives, works, talks
and hands the mantle over; the r170 fix's purpose is verified
in the wild on this panel (0 ask:lately fellBack; Maya's
ask:lately answer below is honest shared news). The r169/r170
dialogue fixes are otherwise exonerated (both r169 commits leave
the smoke byte-identical).

Per §14 the strict bar is NOT re-scored: the control is
recorded as a MISS on full-file byte-identity, PASS on the 5
named headline numbers. Proposal for the next run (metric
review): restate the smoke bar as the 5 headline numbers +
MANTLE-FINE + trapline line + selfReq 0, not full-file
byte-identity — second-order counters (pantryEnd, deed/bump
counts) wobble with any conversation-ledgering change and are
not a defect signal. The r176/r177 agreement is the new
reference tele for the smoke.

## Village assessment (plain words)

Eight villages, one story with different endings. Most held
together: seven or eight people alive at the end of the window,
the pantry fed, the mantle passing hand to hand without a
stumble — 49 deaths, every one of them handed over cleanly to
someone still living. Two villages bled hard: on seed 34203 the
bearer died eleven times over and the village ended with a
single soul standing; on 34207 ten bearer deaths left seven
alive but fourteen fallen. The dead are named in the chain
records — Megan to Thao to Aki to Adil, Shannon to Ryan to Buse
to Hannah to Rafael, a long chain on 34207 running Panom through
Shannon, Dhrubo, Leo, Nina, Willie, Finn, Mia, Mara, Raj and
Rodrigo. Nobody was left holding a dead person's job: the one
place a party role could have stuck after a death, it didn't.
What the villages knew: the table is coming, the fire argues
about what to call the Static, the old trapline is real. What
was missing: nothing structural this run — the conversations
spoke honestly, the newcomers arrived (28 across the panel) and
a few found their footing, the bonds formed (80 new NPC-NPC
bonds) even if the bearer's own newcomer bonds stayed thin
(0 newcomer vs 5 pre-existing for first-bearers — the standing
CAP-NC thinness, not a new finding).

## PEOPLE CHECK (sense — transcripts read in full)

- Paul d+3 (34201): a mourning conversation that earns its
  weight. "Meera is gone and Alexandra is gone. The fire
  doesn't care." He takes the scout role from Thao with a real
  handoff ("Thao nods, stepping back. 'Scout is yours now.'"),
  teaches Black Walnut, and winds down honestly ("I should go.
  Before I overthink this conversation too."), then a
  comfortable quiet. Meaningful throughout; no dry line, no
  fabricated history (the "ease between you now" line is a
  bond-depth-2 line, earned at trust 85).
- Adil d+30 (34201): Russian-only, no shared words — the whole
  exchange runs on nods, smiles, pointing, listening hard. "No,
  no." — proud of the one English word he knows. Warm and
  coherent; the language barrier reads as a real encounter,
  not a menu.
- August d+3 (34206): the deflect_q turn, read in full. The
  player dodges his direct question ("What's the most useful
  thing you've learned?"); he says "Okay." Something shutters,
  just slightly — then the recap returns honestly to the
  question, the invite is declined with a reason ("Not right
  now. I've got my own things to handle."), and the closer
  ("Right. Done. Don't look so relieved.") is characterful.
  A deflection that lands as a deflection, not a dry line.
- Maya d+3 (34208): the richest sitting on the panel. An
  expedition answer with real monster knowledge ("too many
  joints"), a skill reveal, an invite accepted, an ask:lately
  that gets honest shared news ("The whole fire was arguing
  about Static last night — what to even CALL it. 'The Loud
  Beast' got shouted down. What's your vote?"), a party named
  ("The Company"), a role taken (scout). The r170 fix is visible
  here in the wild: the lately answer speaks the village's news
  and the talk goes on from there.
- DeAndre d+7 + d+14 (smoke 33998): the trapline line is spoken
  at d+7; at d+14 the night-sounds exchange ("Did you sleep? I
  kept hearing things out past the treeline." / "I heard them
  too." / "So it's not just me. Good.") is a genuine shared-fear
  beat, the scout role transfers from Grace with a real handoff,
  and the ask:you answer ("I'd follow you out past the
  treeline. Don't tell the others — they'd want to come too.")
  is characterful.

No transcript on this panel fabricated shared history, looped
filler, or dried. The conversation quality bar holds.

## Fixes landed this run

None — no src/js change. This run was a fresh-panel judgment
run; its findings are the MANTLE-FINE confirmation, the dry
census pass, and the smoke-control investigation above.

## Gate

PENDING — check.js --quick running at note write; filled at closeout.

## Family proofs

r146/r147/r151/r155/r157/r161/r166/r169/r170 9/9 ALL GREEN on
the final tip (node runs, logs evidence/2026-11-11/
journey-succession-r177-family-*.log; no FAIL in any log).

## Telemetry

Ran on the 8 panel tele files (evidence/2026-11-11/
journey-succession-r177-tele-34*.json). Two LOUD lines, both
the KNOWN summation artifact (r151/r155/r157/r161/r166/r169/
r170 precedent — the checker sums across files while the
baseline holds per-seed means): deaths.bearer 532% (baseline
7.6 -> current 48, n=8) and census.fallen 410% (baseline 14.3
-> current 73, n=8). Per-seed means: bearer 6.0, alive 6.5,
fallen 9.1, stage 3.0, mentions 4.5 — against baseline 7.6 /
3.8 / 14.3 / 3.0 / 4.2. The alive/fallen moves are band
variance (the r169 panel's means were 8.0 / 3.1 / 11.6 / 3.0 /
4.1 on its own bloody band). No real deviation; baseline NOT
rolled forward.

## Rotation

7 -> 4 (endgame next). Advanced at closeout; verified the file reads 4.

## Metric review

- MANTLE-FINE under the revised r170 rules is CONFIRMED on a
  fresh panel (49/49 synchronous handoffs, 0 real deferrals,
  0 day-skips). The revised bar stands for future runs; the
  r169 letter-FAIL stays standing history.
- The day-skip instrument correction stays open (r166/r169/
  r170/r177: zero day-skips across 67 + 49 deaths / 17 seeds /
  ~900 sleeps, no deterministic staging path) — carried, not
  implemented. The instrument has now had four straight panels
  with nothing to detect; a future run may judge whether the
  correction is still worth building or the bar should be
  dropped to a watch.
- CAP-NC denominator: stays descriptive (r177: 2 eligible).
  A decisive verdict needs a longer panel or a band with
  earlier arrivals — a future run's question, not this run's.
- SMOKE BAR REVISION (proposed, from the control miss above):
  restate the smoke control as the 5 headline numbers +
  MANTLE-FINE + trapline line + selfReq 0, not full-file
  byte-identity. Second-order counters wobble with any
  conversation-ledgering change; the r176/r177 tele agreement
  is the new reference. NOT re-scored for this run — the
  strict-identity miss stands as recorded above.
- Same-class dry sites (convoThreadBeat `exh` closers, base
  `more` choice): dry-free for the third straight panel. The
  watch continues; the r170 design call already covers them
  for a future run if one dries.
- The r170 lately exemption's ledger side effect (smoke chore
  mix moves on any conversation-ledgering change) is now a
  known property of the instrument, not a defect: future runs
  should expect second-order counter movement whenever dialogue
  ledgering changes, and judge the smoke on its headline
  numbers.
