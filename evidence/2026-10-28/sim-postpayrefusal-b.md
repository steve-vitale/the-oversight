# sim-postpayrefusal-b — re-proof of the landed post-payment refusal fix
(loop-B run fleshout-loop-b-20261028T1330Z, axis food-economy)

Prereg: evidence/2026-10-28/sim-postpayrefusal-b-prereg.md
(committed ab51f772c BEFORE any judged run — binding).

## Verdict: GO (re-proof) — no new game change

The assigned blank is confirmed fixed on current HEAD. This run
landed no src change, because there was nothing left to fix:
the prechecks already exist and already refuse before payment.
GO here means "the blank is closed and proven on HEAD", not
"this run landed a fix". The two fixing commits, both ancestors
of HEAD (verified with `git merge-base --is-ancestor`):

- 10ef1e627 (sim-refusalprecheck-b): world-state prechecks for
  the three actions — audience for war_cry.challenge and
  intimidating_presence.end_it_before, kill record for
  trophy_room.mark.
- 8118c0be1 (sim-onceaday-b): day-roll-aware once-a-day
  prechecks (challengeDay / postureDay), closing the residual
  the first arm disclosed.

## The re-proof (new script, own fixtures, shared harness only)

scripts/test-postpayrefusal-b.js, seeds 9981-9988, 9 fixtures
per seed, 72 total — PASS, all 72. Dump:
evidence/2026-10-28/sim-postpayrefusal-b-corpus.json.

- Leg A (world-state refusals at the day boundary, F1-F3):
  24/24 refuse pre-payment. Day unchanged, dayTicks
  unchanged (509->509 challenge/end_it, 507->507 mark),
  scholar kcal unchanged (5000->5000), village pantry kcal
  unchanged (47250->47250). Pantry unchanged is the meal
  proof: endDay draws the night's meals from the pantry, so
  a tap that fired endDay could not leave it untouched.
  Before the fix (published spandraw probe), every one of
  these crossed the day; now none does.
- Leg B (once-a-day non-boundary refusals, F4-F5): 16/16
  refuse pre-payment with the same full zero-payment
  assertion (ticks 100->100, kcal and pantry unchanged).
  Before sim-onceaday-b these refused post-payment with
  ticks consumed plus a silent 40 kcal tier burn; that
  residual is now closed too.
- Leg C (success invariance, F6-F9): 32/32 as pre-registered.
  F6-F8 cross the day (day 1->2) with the success narration
  intact; F9 (flag preset, boundary position) succeeds and
  stamps the NEW day — the tap lands on the new day, so it
  is that day's challenge, exactly as the onceaday arm
  proved. Success fixtures DO draw pantry meals (e.g.
  47250->42460), which is the control that makes the
  refusal fixtures' untouched pantry meaningful: the
  instrument can see a meal draw, and refusals show none.

Tripwire: scripts/test-onceaday-b.js in assert mode, run on
HEAD in this run: PASS, all 160 fixtures behave as
pre-registered (day-roll-aware once-a-day precheck,
including the 508/509 straddle). The prior arm's full
fixture set is invariant on HEAD.

Green-list check: `node scripts/check.js --quick` run twice
on HEAD in this run: 284 passed, 6 failed both times
(log: evidence/2026-10-28/sim-postpayrefusal-b-check-quick.log).
The 6 are pre-existing HEAD drift, none touches this arm:
test-measurement-proof-update, test-measurement-workflow
(retained neutrality proof vs current inputs),
test-mobile-combat-cadence (Continue wrap),
test-occupation-panels (CLI workflow),
test-phone-frame-proof (retained browser-input / phone
receipt freshness — it lists abilityActions.js among boot
inputs because the retained proof hashes predate HEAD's
source, not because any behavior changed), and
test-establishment-r20-fixes-20261020 (next-day voices
gate). This run changed zero src lines, so none of the 6
can be a regression from it; they are reported, not fixed,
because they belong to other lanes.

## Pilot guardrail (Leg D): competent, seeds 9981-9988, 60d

Sweep: evidence/2026-10-28/sim-postpayrefusal-b-guardrail.json
(scripts/sweep-compare.js, competent, 60d death-aware).

Per-seed: 7 villages survive to the 60d cap; seed 9983 is
lost on day 12 — the same seed, same day, as the landed
arms' det-gate. Headlines: won 0/8, median survival 60
(at cap, guardrail >= 48 PASS), max wave 3, national 0/8,
table 0/8, wins 0/8, vests 0, deliberations/day 21.
Death-cause shares: monster:combat 22, monster:villager
combat 53, monster:expedition 8, player:the arena 7,
villager:sickness 9, villager:a wound that wouldn't close 5,
person:ambush 4, villager:starvation 3, player:contest 2,
villager:monster 2, player:starvation 1, villager:Choir Toad 1.
Starvation total 4 (guardrail <= 6 PASS). No NEW death-cause
category vs the published det-gate (PASS). Small count drift
vs the 2026-10-27 det-gate (monster:combat 19->22, villager
combat 51->53, arena 6->7; villager:The Paparazzo 1->0) is
HEAD drift from other arms landed since, not movement from
this run — this run changed no game code, so it cannot have
moved these numbers; the drift is disclosed, not hidden.

## Wall numbers (guardrail band)

Competent, 8 seeds, 60d death-aware: national 0/8, table 0/8,
wins 0/8, wave 4-5 reach 0/8 (max wave 3), median survival 60
at cap, max 60. The scale wall is unchanged by this run, as
expected: a refusal-timing fix moves no village outcome in
this band (competent policy never taps these three actions
through useAbility in the guardrail — the same identity-gate
finding the landed arms reported).

## Balanced panel (§15) — attempted, compare INVALID (attached)

Built on HEAD with the published panel's exact options
(competent, seeds 9981-9988, 60d):
evidence/2026-10-28/sim-postpayrefusal-b-panel/panel.json.gz
(cases/ cache NOT committed, per §15). Compare against the
published refusalprecheck after-panel:
evidence/2026-10-28/sim-postpayrefusal-b-panel-compare.md
(+ .json). Decision: **invalid** — different observerDigest
and contractDigest, and policy/harness files changed since
2026-10-27 (fighterconstruct-diag, partyfinish, tablepaths-
relay, tbdmg/w4tbkill diag policies). This is the known
cross-day panel gap, stated explicitly rather than silently
skipped: the panel cannot compare across an observer change,
so the sweep-compare guardrail above (same harness, same
seeds/policies/days) is the usable instrument for this run,
and it passes. No panel verdict is claimed from an invalid
compare.

## Sense read (SENSE-TESTING LAW — seed 9981, read end-to-end)

- F1 challenge, nobody to challenge: one line, nothing else.
  "A challenge needs someone to challenge — and they have to
  be here, alive, and one of yours. Talk to them first.
  (Issue Challenge)" No night, no food, no day. It reads as
  a refusal now, not as the old receipt for a wasted night
  (the refusalprecheck evidence quotes the before: 22 lines
  of a whole night happening before the same sentence).
- F3 trophy mark, no kills: "Trophy Room: no kills recorded
  yet — hunt something first, then mark it. (Mark Trophy)"
  with nothing taken. A person being told to go hunt first
  is a sensible refusal; a person charged a night for it
  was not.
- F6/F9 successes read as the same public moment (the dare
  pointed at a named villager, "Witnessed", the journal note,
  the honest -40 kcal food-becomes-war-cry line) — the
  boundary once-a-day success (F9) is narratively identical
  to the plain success (F6), which is exactly right: it IS
  the new day's dare, not a second helping of yesterday's.

## Village assessment (plain words)

The 60d competent villages are early-game villages, same
picture as the landed arms: max wave 3, no national reach,
no table, no wins. Seven of eight hold to the cap; one is
lost on day 12. Deaths are dominated by villagers dying in
fights (53 villager-combat + 22 monster-combat), not by
anything a refusal tap does. Nothing in this band taps the
three actions, so the fix's value is not in these headlines
— it is in the single-tap honesty the fixtures prove: a
player who taps a challenge with nobody there, or marks a
trophy with no kills, no longer pays a night and a pantry
draw for being told no. That was the blank; it is filled.

## Blanks filled or documented

- FILLED (verified, not newly built): the spandraw
  post-payment refusal blank — all three actions refuse
  pre-payment on HEAD, including the once-a-day legs.
- CORRECTED in this run's commit: sim-findings line 1280
  (2026-10-27 food-economy/span, POST-PAYMENT REFUSALS THAT
  STILL CROSS THE DAY) still read `[open]` although its fix
  landed 2026-10-27/28. Marked `[fixed ...]` with the two
  commit hashes, so the backlog stops re-assigning a closed
  blank. (Edit confined to that line; no other backlog line
  touched.)
- DOCUMENTED, not chased (out of scope for this run): the
  panel's cross-day invalidity (observer/contract drift)
  — a measurement-infrastructure gap for the loop, not a
  game blank; the sweep guardrail covers this run.

## Reachability verdict

Unchanged from the landed arms: waves 1-3 reached in the
guardrail band, wave 4-5 / Arc II+ / regional / national /
table / win not reached in 60d competent play. The
refusal-timing fix neither opens nor closes any reachability
door — it only stops failed taps from charging a night.

## Metric review (for the NEXT run, not a re-score here)

1. The task's suggested GO assumed a fresh code change with
   a fresh before/after; the prereg replaced that with a
   re-proof against published before-corpora, and the run
   was judged against the prereg. A future re-assignment of
   an already-fixed blank should check `git log` for the
   fix before spawning a worker, or explicitly frame the
   run as a re-proof — the worker should not have to
   discover the duplication mid-run.
2. The panel compare's invalidity on observer drift means
   cross-day panel compares decay within days on this hot
   tree; a same-day panel pair (or a sweep-only guardrail
   with the panel attempt attached, as here) is the honest
   instrument for re-proof runs.
3. The guardrail's small death-count drift vs the
   2026-10-27 det-gate, on a run with zero game changes,
   is a useful calibration point: same seeds + same policy
   + moved HEAD != identical outcomes. Future "identical
   before/after" claims should name the HEAD they ran on.

## Files in this run

- scripts/test-postpayrefusal-b.js (new; own fixtures)
- evidence/2026-10-28/sim-postpayrefusal-b-prereg.md
  (ab51f772c, before any judged run)
- evidence/2026-10-28/sim-postpayrefusal-b.md (this file)
- evidence/2026-10-28/sim-postpayrefusal-b-corpus.json
  (72 fixture rows)
- evidence/2026-10-28/sim-postpayrefusal-b-guardrail.json
- evidence/2026-10-28/sim-postpayrefusal-b-panel/panel.json.gz
  (cases/ cache NOT committed)
- evidence/2026-10-28/sim-postpayrefusal-b-panel-compare.md/.json
- evidence/2026-10-28/sim-postpayrefusal-b-check-quick.log
  (check.js --quick, 284 passed / 6 pre-existing failures)
- sim-findings line 1280: [open] -> [fixed ...] (in the
  goal hidden_files, edited directly — it lives outside
  the repo, so it is not part of this run's commit)
