# Recoverylong test — Loop B, arm sim-recoverylong-b

Axis: scale-onramp / winnability chain (the recovery leg of the
polityfrag diagnosis). This arm tested ONLY the HELD
zombie-clear rule, never tend-through, never bundled.
Gates, win prices, and deed gates stay UNTOUCHED.

## Pre-registration (committed before any verdict sim)

Full text: `evidence/2026-11-04/sim-recoverylong-b-prereg.md`
(commit 1d5781e86). In short:

- Question: on a FRESH seed band, does any village survive
  a zombie clear long enough — >= 35 days, with pantry
  >= 12,000 kcal at re-seasoning — for a re-proposal or
  re-link to land?
- Policy: `scripts/policies/leadcourt.js` {leadcourt}
  VERBATIM, default env. Same substrate as the 0930Z
  zombie pilot: same policy, same diplo instrument
  reused verbatim, 300d death-aware horizon.
- Seeds: 99801–99808 — FRESH, verified before the prereg
  as 0 hits in evidence/2026-11-04/*.md and 0 hits in
  evidence/2026-11-04/perseed-*/ corpus filenames (the
  99xxx bands used today are 991, 993, 994, 995, 996,
  997; 992 was excluded because it is named in today's
  standacc/diplo preregs). The band is the next free
  block in the 99xxx series, chosen BEFORE any verdict
  sim — not selected for long life, not swept for a pass.
- Legs: TWO runs on identical seeds — ARMED (rule on,
  current HEAD) and CONTROL (rule off: hierarchy.js
  swapped for its HEAD~1 pre-rule version for the
  control run only, then restored; restoration verified
  with `git diff HEAD -- src/js/hierarchy.js` empty).
- PRIMARY METRIC + GO BAR: GO iff at least 1 armed seed
  has ALL of: (a) a clear, (b) a re-proposal OR re-link
  after the clear, (c) survival after clear >= 35 days
  (snapshot days, conservative by the 1-day say/snapshot
  lag), AND (d) a post-clear diplomacy recovery whose
  snapshot pantryKcal >= 12,000. Otherwise NO-GO. If the
  pilot yields zero clears surviving 35+ days, that IS
  the NO-GO result — no sweeping unregistered seeds to
  hunt a pass, no expansion to 12–16 on this worker's
  authority.
- COST BAR (paired, same seeds): starvation deaths armed
  <= control + 2 on totals AND on per-seed excess, AND
  armed median survival >= 0.8 x control median.

## The lever (cherry-picked, not re-invented)

ONLY commit c42730d4d from branch sim-recovery-zombie-b
was cherry-picked onto this branch (clean, no conflict;
2 files: src/js/hierarchy.js + its proof): in linkTick's
Haven-primary branch, a link with `primary === 'haven'`,
`status === 'active'`, NOT conquered, with `trust <= 0`
is said aloud and broken via `breakLink(id, 'faded')`.
Its proof suite ran green on this branch before any
verdict sims (scripts/test-recoveryzombie-20261104.js,
34/34). This arm's own analyzer proof
(scripts/test-recoverylong-20261104.js) is 14/14.

## Pilot legs — per-seed before/after table

0 instrument errors on all 16 legs (8 armed + 8 control).
Armed and control are IDENTICAL on every seed — same
days, same trajectories, same death totals to the death.
The rule never fires on this band, so it cannot move
anything, and the identical legs prove it.

| seed | armed days/traj | control days/traj | clears | firstDiplo | hold | scaleRank | maxWave |
|------|-----------------|-------------------|--------|------------|------|-----------|---------|
| 99801 | 104 holds-to-death | 104 holds-to-death | 0 | 59 | 1.000 | national | 4 |
| 99802 | 84 holds-to-death | 84 holds-to-death | 0 | 70 | 1.000 | global | 4 |
| 99803 | 103 collapses | 103 collapses | 0 | 56 | 0.979 | global | 4 |
| 99804 | 27 never | 27 never | 0 | — | — | village | 2 |
| 99805 | 69 holds-to-death | 69 holds-to-death | 0 | 60 | 1.000 | regional | 3 |
| 99806 | 29 never | 29 never | 0 | — | — | village | 3 |
| 99807 | 48 never | 48 never | 0 | — | — | village | 3 |
| 99808 | 161 never | 161 never | 0 | — | — | regional | 4 |

GO judge: passing seeds [] (no seed has a clear, so legs
(b), (c), (d) are all untestable), clear seeds [],
bad seeds 0 → NO-GO. Judged exactly as pre-registered;
no metric moved, no extra seeds swept.

## Finding 1 — zero clears: the survival-after-clear distribution is empty

There is no survival-after-clear distribution to report
because there is no clear: 0 clears on 8 armed seeds and
0 on 8 control seeds. The 0930Z question — "does the
village live 35+ days past the clear?" — never gets
asked on this band, because the precondition (a
Haven-primary link at trust 0 in life) never occurs.
This is a stronger NO-GO shape than 0930Z's: 0930Z had
1 clear with a 1-day window; this band has no window
at all.

## Finding 2 — why no clear: Haven-primary trust never reaches 0 here

Haven-primary link minima across the band: 30 (the
formation trust — most links never decay below where
they started), one dip to 24 (99802), and 99808's two
Haven-primary links ending at trust 83 and 50, seasoned
and tended to the grave. The one collapse, 99803, drops
on its death day (d103, pantry 0) by unseasoning — a
link falling 45 → 32 trust — not by a break and not at
trust 0. A Haven-primary bond on this band either holds
to the village's death, or unseasons and dies with it;
it does not bleed to zero while the village lives.
Across both pilots, Haven-primary trust 0 in life has
now been observed on exactly 1 of 16 seeds (99402).

## Finding 3 — the trust-0 shape on this band is BELONG, out of scope

99808 carries THREE links at trust 0 — all BELONG links
(primary = another village, subordinate = haven), the
same shape as 99401 in 0930Z. They sit at 0 and break
on the village's death day (d161), never cleared by
this rule (which scopes to Haven-primary only), and
never re-proposed in life: 99808's five proposals are
its original courtships (d39/d41/d52/d54/d56), and its
diplomacy never goes positive (never-3-seasoned-at-once,
max 2 seasoned). The scope guard holds in the wild a
second time — but the finding sharpens the next lever:
on this band, the ONLY trust-0 trap that exists is the
BELONG-direction one this arm deliberately does not
touch. Naming it, not fixing it mid-run: a BELONG-clear
arm (same rule shape, other direction) is the concrete
next lever for the next run. The other named next step
is a survival-first substrate: a recovery question
cannot be answered on bands whose villages die at a
median of 76.5 days, so a future recovery arm must
pre-register a substrate chosen for survival (>= 200d
life) BEFORE any clear measurement — selection on
survival alone, never on clears.

## Cost bar — PASS, vacuously

Starvation deaths: armed 7 = control 7 (99801: 1,
99804: 3, 99806: 3; per-seed excess 0). Median survival:
armed 76.5 = control 76.5 (sorted days 27, 29, 48, 69,
84, 103, 104, 161). Bar: 7 <= 7 + 2, excess 0 <= 2,
76.5 >= 0.8 x 76.5 → PASS. Stated plainly: the bar
passes because the legs are identical, not because the
rule was exercised — a cost bar cannot distinguish
anything when the rule never fires. The informative
cost result is the identity itself: zero measured cost,
zero measured benefit, on this band.

## Wall numbers (pilot legs, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8.
End-state scaleRank: global 2/8 (99802, 99803), national
1/8 (99801), regional 2/8 (99805, 99808), village 3/8
— identical armed vs control. Table: not instrumented
(stated, not faked); no win flag on any seed. Wave-5
unlocks 0/8, wave-5 faced 0/8, wave-4 faced 4/8 (99801,
99802, 99803, 99808), wave-4 unlocks 4/8. Wave reach:
wave 4 on 4 seeds, wave 3 on 3 seeds, wave 2 on 1 seed.
Arc reach: not instrumented (stated, not faked).
Readiness-5-ready days: 0 on all 8 seeds. Median
survival 76.5 days, max 161 — armed and control
identical. Band note, not a rule effect: this fresh
band dies sooner than the 0930Z band (median 76.5 vs
109, max 161 vs 146) under the identical policy — band
variance dwarfs any rule effect here, and it runs the
wrong way for a "longer-lived" test: a fresh band is
not a longer-lived band. Deaths 409 total per leg,
identical: villager combat 174, combat 81 (combat
share 255/409 = 62%), the wild 44, expedition 35,
monster 25, sickness 14, a wound that wouldn't close
11, starvation 7, ambush 5, the arena 5, contest 3,
named beasts and oddities 5 — villages die fighting,
not starving, same shape as 0930Z.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

No faded line fires on this band — there is nothing to
judge as a recovery beat, and that absence IS the sense
finding: the lever is invisible to a player here. What
the player does see, on the seeds that get anywhere,
is coherent: grief installs a new speaker at the table
("but the bond is young, and they're still deciding
what Haven is"), "The village feels it — the bond
dips, but holds. They endure together." recurs when a
bond dips without breaking, and 99808's long
never-diplomacy run reads as a village that courts,
seasons two bonds, and dies still short of three —
its failure is legible in the courtship count, not in
any line about why two was not enough. Two narration
gaps, documented not fixed: (1) 99803's collapse has
no line naming the unseasoning — its last days are a
haul counter, a feud notice, and a tutorial counter,
then death with pantry 0; a player sees the realm
fall without a word about which bond thinned. (2)
99808's three BELONG bonds sit at trust 0 with no line
naming them (their breaks land on the death day
itself). Both gaps belong to a future narration pass,
not to this lever — and neither gap is an artifact of
the say-line cap (99808 captured 209 lines through
d160; the faded line, which the 0930Z instrument
captured, would have been captured here had it fired).

## Village assessment (plain words)

Picture eight villages that never get to the question
this arm asked. Three of them die before they can
season a single bond — dead at 27, 29, 48 days, their
courts barely begun. Three more hold their bonds to
the grave, faithful to the end, and die at 69, 84, 104
days with their alliances intact. One collapses on the
day it dies, its pantry empty, a bond thinning from 45
to 32 — not to nothing, just to not-enough, on the same
day the village ends. And one lives longest of all,
161 days, courts five villages, seasons two bonds, and
still never gets a third — while three bonds pointing
the other way, into Haven itself, bleed quietly to
nothing and break only when the village dies. Nowhere
on this band does a bond Haven leads fade to nothing
while the village lives to use the open table. The
clearing rule is not wrong — it simply has nothing to
clear here. What is missing is not a better clear. It
is a village that lives long enough for a bond it leads
to rot all the way to zero — or a rule that also
clears the bonds pointing into Haven, which are the
only ones that actually reach zero on this band.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO bar was judged exactly as written;
  no metric moved. The verdict is NO-GO (passing seeds
  [], clear seeds [], bad seeds 0, instrument errors 0).
  The NO-GO is informative in a new way vs 0930Z: it
  separates "the recovery window is too short" (0930Z)
  from "the precondition never occurs" (here). A rule
  that fires on 1 of 16 seeds across two pilots cannot
  be judged as a recovery lever on pilot bands at all.
- Proposed revision for the NEXT run (not applied
  here): split the verdict, as 0930Z already proposed
  (mechanism leg vs recovery leg) — and add a
  precondition leg: a pilot band must first show at
  least one clearable state before its recovery legs
  are scored, or the run reports INSUFFICIENT-PRECONDITION
  rather than NO-GO, so that "no clears" is never
  misread as "clears don't help." The cost bar needs
  the same honesty: when armed == control exactly, the
  cost verdict should read "not exercised," not PASS.
- The 300d horizon was never binding (max 161d); raising
  the cap further buys nothing, since death, not the
  cap, ends these runs — the same lesson as 0930Z, now
  on a second band.
- Fresh-band variance note: median survival moved
  109 → 76.5 between two bands under the identical
  policy. Future arms should pre-register a survival
  expectation for their band, or the band itself
  becomes an unmeasured variable in every verdict.

## Verdict — NO-GO (pilot)

The clearing rule is UNEXERCISED on this corpus: 0
clears, 0 re-proposals after a clear, 0 re-links, 0
diplomacy recoveries after a clear, armed identical to
control on all 8 seeds, cost bar passed vacuously.
The recovery is NOT PROVEN — it is not even tested —
because no village on this band presents a
Haven-primary trust-0 link in life. Recommendation to
the coordinator: do NOT merge the rule commit on the
strength of this run (and do NOT re-run this pilot on
the same seeds expecting a different outcome); keep
the rule on its branch as the proven 0930Z mechanism,
and point the next run at (1) the BELONG-direction
clear — the only trust-0 shape observed here — and/or
(2) a survival-first substrate pre-registered for
>= 200d life before any clear measurement. Do NOT
expand to 12–16 on this worker's authority.

## Telemetry deviation check

Attempted: `node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-04/perseed-recoverylong-b/*.json'
--metrics national,table,wins,exiled`. The tool
REFUSED for field-shape reasons, recorded verbatim:
"telemetry-check: refusing recorder-corpus input: all 16
--current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs. Recorder corpora are
compared with sweep-compare tables, never against a run
baseline here." No compare was fabricated; the
--allow-recorder-corpus escape was NOT used, for the
same reason as 0930Z. The paired per-seed table above
stands as the comparison.

## Balanced panel (§15)

Attempted: `node scripts/balance-panel.js compare
--before <control JSON> --after <armed JSON> --out
/tmp/recoverylong-panel-attempt`. The tool produced a
1-case report titled "Sweep-corpus comparison (not a
balanced-panel verdict)", decision review_required,
every metric unknown or insufficient — because compare
mode expects panel.json.gz corpora, not diplo per-seed
JSONs. That degenerate report is NOT a panel verdict
and is not cited as one. The paired per-seed table
above (armed vs control, identical seeds, one engine
change) stands as the comparison; the cost bar was
judged by the analyzer's paired computation over all
16 legs, not by the panel tool.

## Proof and landing

- Rule proof: `scripts/test-recoveryzombie-20261104.js` —
  34/34 PASS on this branch (cherry-picked with the rule).
- Analyzer proof: `scripts/test-recoverylong-20261104.js` —
  14/14 PASS (clear detection, GO pass + each single-leg
  failure, cost-bar pass/fail).
- Arm commits on branch sim-recoverylong-b (coordinator
  merges; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by
  this worker):
  - 9c4cdefc7 cherry-picked rule (c42730d4d from
    sim-recovery-zombie-b; NOT to be merged on a NO-GO
    verdict — coordinator lands instruments + evidence
    separately, rule stays branch-only)
  - 1d5781e86 prereg (before any verdict sim) +
    driver/analyzer + proof 14/14
  - (this landing) pilot corpus + evidence
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-recoverylong-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-recoverylong-b/` (16
  files: 8 armed + 8 control); scripts
  `test-recoverylong-driver-20261104.js`,
  `test-recoverylong-analyze-20261104.js`,
  `test-recoverylong-20261104.js` (reusing
  `diplo-instrument-20261104.js` verbatim — not
  modified, not claimed as this arm's file).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after the prereg
  commit; repaired via HEAD-blob `update-index
  --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commit itself was correct.
- Control-leg note: the control run swapped
  src/js/hierarchy.js for its HEAD~1 (pre-rule) version
  and restored the armed version afterward; restoration
  verified with `git diff HEAD -- src/js/hierarchy.js`
  empty. The pre-rule file does contain other pre-existing
  uses of the word "faded"; the rule itself is exactly
  the 23-line cherry-picked addition (HEAD~1 vs HEAD
  diff), so the control leg differs from the armed leg
  by that rule alone.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
