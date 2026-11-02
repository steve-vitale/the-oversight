# Loop A 0605Z round — scale-onramp: arrears-route pilot(s) UNDER-POWERED, arm killed

Run: fleshout-loop-a-20261102T0605Z, arm sim-arrears-route-a, axis scale-onramp.
Worktree branch: sim-arrears-route-a. POLICY-SIDE ONLY — zero `src/js`
changes. Prereg committed BEFORE any judged sim (commit 561f9701,
below). Sibling Loop B trees/branches NOT touched. No titan canon
doc exists in docs/ — stated, none invented (same finding as 0445Z).

## Verdict: UNDER-POWERED (both pilots) — killed, nothing to merge

The waiting rule was never exercised in sim — not failed, never
reached. Across TWO fresh pilot bands (16 seeds, baseline vs armed
in-run on identical seeds), ZERO seeds showed an arrears-only block
at first readiness check, ZERO deferrals fired, ZERO sounds, ZERO
stand-downs, and arrears were 0 on all 168 readiness check rows.
Bar (a) requires >= 3/8 blocked seeds; both pilots scored 0/8. Per
the prereg, that is UNDER-POWERED, not NO-GO-by-effect, and no
confirm was run (confirm requires all bars passed). The policy
variant file, replay, split, and test scripts are DELETED in the
closing commit; this evidence, the prereg, and the corpus remain.
The coordinator merges nothing from this arm.

## What was built (then deleted on kill)

- `scripts/policies/arrears-route.js` — pure deferral state machine
  (unit proof 27/27, `scripts/test-arrears-route-policy.js`): an
  arrears-only block (not ready, every refusing link refuses solely
  on arrears: trust >= 25, opinion >= -10, arrears > 0, at least one
  such link) starts a deferral; weekly re-check ticks at +7/+14/
  +21/+28; sound at the first ready tick; stand down unsounded at
  +28 if still not ready. The module calls NO game mutator and
  never sounds a call the faithful rule says is unready. Armed
  sounds ONLY via the deferral path (isolation choice, pre-reg):
  a seed that is already ready, or never arrears-blocked, never
  sounds here.
- `scripts/arrears-route-replay-20261102.js` — adapts the sumtrigger
  replay UNMODIFIED in stack/recorders/flags/wall fields; readiness
  comes from the DEPLOYED `Game.titanCallReadiness('herald')`, not
  a re-implementation; ticks run from the wrapped daily BEFORE the
  base policy's daily; `ARREARS_ROUTE=baseline` records identical
  check rows but never defers/sounds (the in-run control, per the
  0445Z lesson). `Game.titanStandDown` is never called (it
  dissolves an existing muster; a stood-down deferral has none).
- `scripts/test-arrears-route-a.js` — corpus-only validator
  (bars, walls, drift, death causes). Analyzer exit 2
  (UNDER-POWERED) on both pilots.

## Pilot 1 — fresh band 97101–97108 (verified unspent before prereg)

Band check (same method as prereg): no `*9710*` filename under
evidence/ or scripts/; no 97101–97108 token in any `*.md` evidence
file, any script, or any `SEEDS=` list; no live claim names the
band; the 954xx confirm band NOT reused. (Bare numbers inside
single-line JSON corpora — e.g. a pantry value of 96107 kcal —
are counts, not seed assignments.) DAYS=180 death-aware cap.
Stack frozen as prereg (tribfloor leadfeast + windefer + seatdrive
+ fullseat-diag; herald-v1 + muster-diag). Anchor 561f9701 both
arms (same commit — the prereg/code commit, not a game change).

Per-seed baseline (armed identical on every seed — see Drift):
- 97101: no herald attempt, 90d, over-other, nat 0, table 1, won 1.
- 97102: no herald attempt, 64d, village-lost, nat 0, table 1.
- 97103: no herald attempt, 181d, survived, nat 1, table 0.
- 97104: no herald attempt, 138d, over-other, nat 1, table 1, won 1.
- 97105: first check day 86, total 15, READY, arrears 0 on all
  links (Emberhold t72/o28/a0 -> 6, Stonebridge t67/o21/a0 -> 1,
  Thornfield t71/o28/a0 -> 6); 26 checks days 86–94, arrears 0 on
  every row, totals 9–16; 95d, over-other, nat 1, table 1, won 1.
- 97106: first check day 70, total 16, READY, arrears 0;
  73 checks days 70–92, arrears 0 on every row, totals 14–18;
  96d, over-other, nat 1, table 1, won 1.
- 97107: first check day 80, total 16, READY, arrears 0;
  63 checks days 80–97, arrears 0 on every row, totals 14–16;
  98d, over-other, nat 1, table 1, won 1.
- 97108: no herald attempt, 90d, over-other, nat 1, table 1, won 1.
Bar (a): 0/8 blocked (need >= 3). Bar (b): 0 blocked sounded
(need >= 2). Bar (c): median 95.5d both arms, delta 0 (need
>= -10); death causes identical both arms (250 deaths: combat
109, villager combat 73, the wild 31, expedition 20, monster 5,
the arena 4, a wound that wouldn't close 3, ambush 2, contest 1,
starvation 1, dehydration 1), no new shape. Bars (d)/(e):
vacuous — no sound exists to guardrail, no deferral line exists
to sense-judge (see Metric review: the analyzer's (d)/(e) PASS
lines on zero sounded/deferred seeds must NOT be cited as
passes). Wall pilot 1, both arms identical: national 6/8, table
7/8, won 6/8, wave-4 8/8, wave-5 0/8, median 95.5d, max 181d.
Seat kind (full vs lesser) is NOT recorded in this corpus; "won"
here is any-win, and no full-seat claim is made.

## Pilot 2 (documented second pilot, never pooled) — fresh band 97201–97208

Second pilot authorized by the prereg's bar (a) (a second band,
documented, reported separately). Band check, same method: no
`*9720*` filename (the one hit is a hash-named panel case file,
not a seed); no 97201–97208 token in any `*.md` evidence file or
script; no live claim names the band. Same stack, DAYS=180,
anchor 561f9701 both arms.
- 97201, 97203, 97204, 97205, 97206, 97207, 97208: NO herald
  attempt at all (90–138d; one village-lost, rest over-other).
- 97202: first check day 81, total 16, READY, arrears 0
  (Stonebridge, Thornfield, The Bloodied, all a0); 6 checks, all
  day 81, arrears 0; 90d, over-other, nat 1, table 1, won 1.
Bar (a): 0/8 blocked. Bar (b): 0 sounded. Bar (c): median 100d
both arms, delta 0; death causes identical both arms (254
deaths: combat 100, villager combat 80, the wild 34, expedition
22, monster 4, sickness 2, contest 2, the arena 2, ambush 2,
starvation 1, dehydration 1, a wound that wouldn't close 1,
Murkcap 1, experiment 1, The Eulogy 1), no new shape. Wall
pilot 2, both arms identical: national 7/8, table 8/8, won 7/8,
wave-4 6/8, wave-5 0/8, median 100d, max 138d.

## Drift / harness validation (the positive result in this run)

First-check rows match baseline-vs-armed EXACTLY on all 16 seeds
(total + per-link trust/opinion/arrears/contribution), and
gameDays, wall fields, end reasons, and death-cause counts are
identical across arms on every seed. That is the isolation
choice working as designed: with no arrears-only block, the armed
arm is a pure no-op, so armed-minus-baseline = 0 is the CORRECT
output, not a harness failure. It also confirms the replay
reproduces the deployed readiness rule deterministically. What it
does NOT prove: the deferral machine in sim. Its ticks, sound
path, and stand-down path fired zero times in sim; only the
27/27 stub unit proof covers them. Any future run that DOES reach
a deferral must re-prove those paths in sim before citing them.

## Findings (for the coordinator, not chased mid-run)

1. ARREARS BLOCKS ARE BAND-DEPENDENT, and unselected bands don't
   reproduce the 0445Z finding. The 0445Z confirm's 4/12 arrears
   blocks came from a SCREEN-selected band (long survivors chosen
   for herald reachability). Two unselected fresh bands give
   0/16 blocked, 0 arrears on 168 check rows, and only 4/16 seeds
   with ANY herald attempt. The scale-onramp arrears claim needs
   re-qualification: it may be a property of long-survivor bands,
   not of the game in general.
2. ON THESE BANDS THE BINDING CONSTRAINT IS CONTACT, NOT ARREARS.
   12/16 villages never attempted the herald at all — including a
   181-day survivor and a 138-day winner. And the 4 that did
   attempt were all READY at first check (totals 15, 16, 16, 16)
   with zero arrears: their attempts keep refusing on MUSTER-GATE
   (no muster exists because nothing ever sounds), not on debt.
   The blank on unselected bands is "why no herald contact / why
   no sound", not "why arrears block the sound".
3. WAITING IS UNTESTED, NOT REFUTED. Nothing in this run says a
   28-day wait fails — no village ever waited. The question needs
   a band (or a screen) that actually produces arrears blocks
   first; running more unselected bands is the wrong spend.
   Suggested next move (coordinator call, not built here): screen
   for seeds whose refused attempts carry arrears > 0 (resume a
   screen over a fresh range with an arrears filter), THEN run
   the arrears-route pilot on that selected set — or investigate
   why this stack yields arrears 0 everywhere (tribute paid in
   full? link kinds that never carry arrears? tribfloor's floor
   preventing shortfalls on healthy pantries?).
4. WALL NUMBERS (per band, never pooled — identical across arms):
   pilot 1: national 6/8, table 7/8, won 6/8, wave-4 8/8, wave-5
   0/8, median 95.5d, max 181d. Pilot 2: national 7/8, table 8/8,
   won 7/8, wave-4 6/8, wave-5 0/8, median 100d, max 138d. Wave-5
   reached 0/16; full seat unmeasured (seat kind not in corpus).

## Sense-testing

No deferral, tick, sound, or stand-down line exists in either
corpus — there is NO clearest transcript line to quote, and
quoting a routine line would be fabrication. The replay's
transcript capture did catch routine villager lines ("Water
first. Everything else waits.") because the capture regex
`/waits/` matches them — an instrument flaw (see Metric review),
not evidence about the lever. The designed deferral line (never
fired) reads: "⏳ The call waits. <Fire> cannot answer while
<N> kcal of debts unpaid between you — Haven waits, and counts
again in a week, rather than sounding into a refusal." Whether
that line reads humanly is UNJUDGED until a deferral fires.

## Metric review (for the NEXT run, never this verdict)

- Bar (a) needs a contact/arrears screen BEFORE the pilot: an
  unselected band's modal outcome is "no herald contact", so the
  pilot burns two bands proving the sampling frame wrong. Next
  arrears-route run should pre-screen for refused attempts with
  arrears > 0 and pre-register the screen, or reframe bar (a)
  as ">= 3 blocked among seeds WITH a first check" (denominator
  = contacted seeds, not all seeds).
- Transcript capture regex must anchor to the ⏳ marker /
  "The call waits" / "stands down" — bare `/waits/` pollutes the
  transcript with routine villager lines.
- Analyzer bar (e) must REQUIRE >= 1 deferred seed to pass;
  vacuous PASS on zero deferrals must never be citable. Same for
  bar (d) on zero sounded seeds (reported here as vacuous, not
  as PASS).
- "No first check" seeds (no herald attempt) should be a named
  category in the validator output, not silent nulls — they are
  the contact finding, and burying them as nulls understates it.

## Infrastructure notes

- /tmp EPERM flap (known container class) blocked safe-commit's
  private index twice at prereg time; retries passed. No
  workaround was needed and no --force-delete was used.
- Index clobber (known class) struck the prereg/code commit: the
  retry loop in the commit command re-committed 6 times because
  the clobbered index kept showing the files as deleted +
  untracked. Recovered by squashing on this private branch only
  (reflog verified: base 624592b18 + only my commits): single
  commit 561f9701, tree hash verified IDENTICAL to the
  6-commit tip (b97cf6a39f916e73c08b1597a93f2722ece4a0b0), then
  main index repaired via HEAD-blob cacheinfo; status and
  `git diff HEAD` verified empty. The old duplicate commits
  remain in the branch reflog only.
- Telemetry: NOT run. Same refusal class as 0445Z (recorder rows
  carry top-level anchorCommit; telemetry-check refuses this
  corpus shape by design). No baseline rolled, no override.
- check.js NOT run: zero `src/js` changes, new files are not on
  the green list, and concurrent jest is forbidden while sibling
  loops run. Proof rests on: syntax checks (all 5 scripts),
  unit proof 27/27, corpus-only validator on both pilots, and
  exact baseline/armed replication on 16 seeds.

## Convergence state

scale-onramp stays converging (NOT converged): the arrears-route
question is unanswered in sim (untested, not refuted), and the
0445Z arrears finding now carries a band-dependence caveat. The
next move on this axis is a screened arrears band or an arrears-
origin investigation, not another unselected band and not a
confirm on this rule.

## Commits (this branch, coordinator merges —ff-only or not at all)

- 561f9701 prereg + policy module + replay + split + tests
  (pilot bands not yet run at that commit).
- CLOSING COMMIT (this evidence + corpus; policy/replay/split/
  tests DELETED — killed arm lands nothing but its evidence
  note). Corpus: evidence/2026-11-02/perseed-arrears-route-a/
  (baseline/armed pilot 1, baseline2/armed2 pilot 2, plus
  .stdout/.stderr runner logs).

Merged locally, pending ship: NOTHING from this arm — killed.
The branch carries only measurement record.
