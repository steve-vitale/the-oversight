# Zombie-clearing recovery test — Loop B, arm sim-recovery-zombie-b

Axis: scale-onramp / winnability chain (the recovery leg of the
polityfrag diagnosis). This arm tested ONLY zombie-clearing,
never tend-through, never both bundled. The sibling worker
tests tend-through separately; this arm used
scripts/policies/leadcourt.js VERBATIM and changed NO
tending behavior at all.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-recovery-zombie-b-prereg.md`
(commit 5887e8e2e). In short:

- Question: if a trust-0 Haven-primary link is CLEARED from
  'active', does the polity recover — fresh proposal, fresh
  link, diplomacy above 0 again — before the village dies?
- Policy: `scripts/policies/leadcourt.js` {leadcourt}
  VERBATIM, default env. No policy file created or edited.
- Seeds: 99401–99404 + 99409–99412, IDENTICAL to the
  polityfrag corpus. The baseline is CITED from
  sim-polityfrag-b.md, not re-derived.
- Horizon: 300 days, death-aware. No seed survived to it
  (max 146d) — the horizon never bound; death did.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim
  via a new driver (scripts/test-recoveryzombie-driver-
  20261104.js, output evidence/2026-11-04/
  perseed-recoveryzombie-b/, RUN=recoveryzombie);
  analyzer scripts/test-recoveryzombie-analyze-20261104.js
  reuses the polityfrag analyzer and adds clear events,
  re-proposals / re-links after a clear, diplomacy
  recovery after a clear, and the GO judge.
- PRIMARY METRIC + GO BAR: per-seed polity trajectory +
  hold-share + clear events + recovery events +
  re-proposal / re-link events after a clear. GO iff
  (1) at least 1 re-proposal + re-link follows a zombie
  clear on a baseline-collapsed seed (99402, 99403, or
  99411); AND (2) diplomacy recovers > 0 on at least 1
  seed; AND (3) no more than 1 seed regresses a survival
  class vs baseline (bands: lost-before-100d /
  lost-100-to-200d / survived-to-300d). Otherwise NO-GO.
  A miss is NO-GO, never re-scored mid-run.
- BALANCED PANEL (§15): the comparison is the PAIRED
  per-seed before/after on identical seeds against the
  cited baseline — that pairing is the panel discipline
  for this corpus. scripts/balance-panel.js's compare
  mode takes scorecard panel files
  (`--before <panel.json.gz> --after <panel.json.gz>`),
  not diplo per-seed JSONs; no panel comparison was
  fabricated from this corpus. Stated, not omitted.
- The 8 seeds ARE the pilot/screening leg; no expansion
  to 12–16 on this worker's authority — the pilot verdict
  is reported and the coordinator decides on confirm.

## Code verification (before the rule — the candidate shape
was checked, not assumed)

- proposeLink's duplicate guard refuses ONLY active links:
  `linkWith()` skips every non-'active' link. A broken
  link does NOT block a fresh proposal. Confirmed.
- leadcourt's proposal gate counts ONLY active links
  (primary === 'haven'). A broken link drops the count
  below 3, so proposals resume. Confirmed.
- The neglect snap is NOT a weekly mechanism: `_linkNeglected`
  is called ONLY from successionCrisis (speaker-death
  paths), never from the weekly linkTick. The zombie's
  real blockers are the active-count gate + the linkWith
  guard — the prereg re-scoped the mechanism name
  accordingly, and the clearing rule removes both at once.
- Trust-0 reach paths for Haven-primary links: weekly
  shortfall charges (-1 partial / -2 nothing, clamped at
  0) and succession haircuts (-8, clamped at 0).

## The lever (ONE engine rule, minimal and scoped)

In linkTick's Haven-primary branch, after the week's
tribute accounting and the speaker-death check, a link
with `primary === 'haven'`, `status === 'active'`, NOT
conquered, with `trust <= 0` is said aloud ("The bond
with X has faded to nothing — no trust left to tend, no
fire left to feed. The bond is gone, and the table is
open again...") and broken via `breakLink(id, 'faded')`
(src/js/hierarchy.js, commit c42730d4d).

Semantics as pre-registered: the clear fires at the
WEEKLY accounting boundary. A link that drops to 0 in a
week's tick breaks at that same boundary; a link that
drops to 0 mid-week via a succession haircut gets until
the next weekly boundary to be tended back above 0.
Conquered links keep their revolt rails; BELONG links
never reach this branch. Trust math, tribute rates,
seasoned bars (30+ days / trust 40+), polity size (3),
gates, win prices, and deed gates are UNTOUCHED; the
tend path and the pantry > 20,000 tend gate are
UNTOUCHED. Known headwinds, not changed: breakLink's
default opinion hit (-15) lowers a re-proposal's
judgeLink score by ~7; a re-formed link INHERITS the
broken link's arrears (existing "debts survive the
break" canon); leadcourt proposes only while pantry >
12,000 kcal; a re-seasoned diplomacy recovery needs a
fresh link + 30 days + trust 40.

## Proof (before the leg — 34/34)

`scripts/test-recoveryzombie-20261104.js` — 34/34 PASS:
analyzer fixtures (clear detection, trust>0 breaks are
not clears, re-proposal / re-link / recovery after a
clear, GO judge legs incl. NO-GO variants and
INSUFFICIENT-DATA) plus a LIVE harness fixture proving
the engine rule: a trust-0 Haven-primary link clears at
the weekly boundary, a healthy (trust 50) link does NOT
clear, a BELONG link at trust 0 does NOT clear (scope
guard), no other link's status changes, the clear is
said aloud (faded line captured), `linkWith()` returns
null after the clear, the proposal gate reopens
(subs < 3), and a fresh proposal to the cleared village
is not refused as a duplicate and not knowledge-gated.

## Pilot leg — per-seed before/after table

Proof ran before the leg (34/34). 0 instrument errors
on all 8 pilot seeds. Columns: baseline days /
trajectory / hold-share → new days / trajectory /
hold-share, clears, re-proposals after clear,
re-links after clear, diplomacy recoveries after
clear, survival band (baseline → new).

| seed | base days/traj/hold | new days/traj/hold | clears | repro | relink | recov | band |
|------|--------------------|--------------------|--------|-------|--------|-------|------|
| 99401 | 98 never / — | 98 never / — | 0 | 0 | 0 | 0 | early → early |
| 99402 | 143 collapses / 0.345 | 141 collapses / 0.354 | 1 (d140, Thornfield) | 0 | 0 | 0 | mid → mid |
| 99403 | 118 collapses / 0.968 | 118 collapses / 0.968 | 0 | 0 | 0 | 0 | mid → mid |
| 99404 | 76 never / — | 76 never / — | 0 | 0 | 0 | 0 | early → early |
| 99409 | 111 holds / 1.000 | 111 holds / 1.000 | 0 | 0 | 0 | 0 | mid → mid |
| 99410 | 107 holds / 1.000 | 107 holds / 1.000 | 0 | 0 | 0 | 0 | mid → mid |
| 99411 | 146 collapses / 0.867 | 146 collapses / 0.867 | 0 | 0 | 0 | 0 | mid → mid |
| 99412 | 64 never / — | 64 never / — | 0 | 0 | 0 | 0 | early → early |

GO judge: leg1 seeds [] (no re-proposal + re-link after
a clear on any baseline-collapsed seed), leg2 seeds []
(no diplomacy recovery after a clear on any seed),
regression seeds [] (0 regressions), bad seeds 0 →
NO-GO. Judged exactly as pre-registered; no metric moved.

## Finding 1 — the clear fires in the wild, exactly once,
exactly where diagnosed

99402's village_2 (Thornfield) link is the pilot's only
clear: trust 0 from the d134 snapshot, faded line said
aloud d140 ("🍂 The bond with Thornfield has faded to
nothing — no trust left to tend, no fire left to feed.
The bond is gone, and the table is open again: a new
bond could be built where this one stood."), first
broken snapshot d141. The mechanism works end to end
in a real run, not just in the fixture: the zombie left
'active', so the proposal gate and the duplicate guard
no longer see it.

Pre-clear determinism holds: 99402's daily diplomacy +
link-trust series match the polityfrag baseline EXACTLY
for all 131 snapshots at or before d133 (0 mismatches).
The lever changes nothing before the clear — the first
divergence in the whole pilot IS the clear.

## Finding 2 — the recovery window does not exist on this
corpus: the village dies the day after the clear, broke

99402's village dies d141 — one day after the clear
(baseline d143; the 2-day-earlier death is post-clear
RNG divergence from breakLink's gossip/event draws, and
the sibling link's trust reads 71 vs baseline 75 at
d141 — same band, no regression). At the clear the
pantry holds 1,000 kcal (d141) and never again reaches
leadcourt's 12,000-kcal proposal gate; the village is
dead before any courtship could start, let alone the
~35 days a fresh link needs to re-season (30 days +
trust 40 from a 30-trust formation). Proposal events on
99402 after the clear: ZERO (the run's only 3 proposals
are the original d25/d26/d30 courtships). So leg1 fails
not on the gate — the gate reopened — but on the
pantry gate + death, and leg2 fails on the calendar:
no village in this corpus lives long enough after a
clear to re-season anything.

The other two collapsed seeds never present a clear at
all: 99403's links sit at 30/36 when the village dies
d118 (one day after its drop), and 99411's weakest
link decays only to 31 by death d146 — neither reaches
trust 0 in life. The hold seeds (99409, 99410) never
approach 0, as expected. The lever is therefore
surgically inert on 7 of 8 seeds: same days, same
trajectories, same hold-shares to three decimals.

## Finding 3 — the BELONG shape reproduces, and the scope
guard holds in the wild

99401's BELONG link (village_1 -> haven) is NOT cleared
by this rule — it is not Haven-primary — and it
reproduces baseline exactly: trust 0 from d85, still
'active' through d96, broken d97 on the succession
path as in polityfrag. A trust-0 link sitting 'active'
for 12 days under this lever is the scope guard working
as designed, not a missed clear: this arm clears
Haven-primary zombies only, and the BELONG zombie is
the sibling arm's / a future arm's problem, not this
one's. LEAD vs BELONG, as the brief requires: LEAD
zombies clear (99402); BELONG zombies do not (99401)
— reported separately, never conflated.

## Wall numbers (pilot leg, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8.
National / table: end-state scaleRank global 2/8
(99409, 99410), national 0/8 at end, regional 5/8,
village 1/8 (99412) — identical to baseline. Table:
not instrumented (stated, not faked); no win flag on
any seed. Wave-5 unlocks 1/8 (99402), wave-5 faced 1/8
(99402), wave-4 faced 8/8, wave-4 unlocks 8/8. Wave
reach: wave 5 on 1 seed, wave 4 on 7 seeds. Arc reach:
not instrumented (stated, not faked). Readiness-5-ready
days: 27 (99402 only), 0 elsewhere — identical to
baseline. Median survival 109 days (sorted 64, 76, 98,
107, 111, 118, 141, 146), max 146 — baseline median
also 109, max also 146 (only 99402 moved, 143 → 141,
same band). Deaths 543 total, same total as baseline:
villager combat 219, combat 104 (baseline 103 — one
death reclassified in the post-clear divergence),
expedition 80, the wild 64, monster 32, sickness 9,
the arena 4, starvation 4, a wound that wouldn't close
4, ambush 3, contest 3, dehydration 2, thirst 2,
named beasts 9, a stranger 2. Combat accounts for
323/543 deaths (59%) — villages die fighting, not
starving, on this band, same shape as polityfrag.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

The faded line reads as a consequence, not a notice: it
names the village (Thornfield), names what ran out
("no trust left to tend, no fire left to feed"), and
names the consequence ("the table is open again: a new
bond could be built where this one stood"). It lands
51 days after the d89 realm-dissolution line on the
same seed ("The realm came apart... The climb starts
over.") — the two beats form a coherent arc: the realm
dissolved when the bond unseasoned, and the bond itself
finally faded seven weeks later. No robotic, static, or
repeated clearing dialogue was found: the line fires
once (one clear in the pilot), and breakLink's generic
line follows it without contradicting it.

One narration gap, documented not fixed: after the
clear, NOTHING says why no new bond follows — the
pantry gate (1,000 kcal vs the 12,000 proposal gate)
and the village's death the next day are visible only
in numbers, not in any line. A player watching this
village would see the table open and then the village
die without a word about why the table stayed empty.
That gap belongs to a future narration pass, not to
this lever.

## Village assessment (plain words)

Picture the one village where the trap actually
snapped shut. Thornfield's bond bled for months after
the realm came apart — tending resumed, grain went
out, and the trust still fell to nothing, because a
starving fire's weekly shortfall eats faster than
grain can heal. Then, one week, the bond faded for
real: the village said so out loud, the table opened
again, and a new bond could have been built where the
old one stood. And nothing happened — not because any
rule blocked it, but because the pantry held a
thousand calories and the village died the next day.
The clearing rule works. The recovery it was supposed
to enable has nowhere to stand: on this band of
villages, by the time a bond fades to nothing, the
village itself is already gone. The other villages
tell the same story from the other side — bonds that
hold to the grave, bonds that collapse and die a day
later, bonds that never reach zero at all. Clearing
the zombie is a real fix to a real trap, and it
changes nothing for any village that cannot live past
its own funeral. What is missing now is not a better
clear. It is a village that lives long enough after
the fall to use the open table — or tending that
never lets the bond reach zero in the first place.

## Metric review (§14 — no in-run re-scoring)

- The prereg's GO legs were judged exactly as written;
  no metric moved. The verdict is NO-GO (leg1 empty,
  leg2 empty, regressions 0, instrument errors 0).
  The NO-GO is informative, not a null: it separates
  the mechanism (proven: 1 clear, said aloud, gates
  reopened, pre-clear determinism exact) from the
  recovery (unproven: 0 re-proposals, 0 re-links, 0
  diplomacy recoveries), and it names the blocker
  precisely — post-clear village life, not the gates.
- Proposed revision for the NEXT run (not applied
  here): split the verdict. A mechanism leg (clear
  fires + gates reopen + no regressions) and a
  recovery leg (re-proposal + re-link + diplomacy > 0)
  should be judged separately, because on this corpus
  they cannot both be satisfied by one seed: the only
  clearable seed dies 1 day after its clear. The
  recovery leg additionally needs longer-lived seeds
  (or a policy that lives longer) — raising the horizon
  cap further buys nothing, since death, not the cap,
  ends these runs.
- Hold-share moved on 99402 (0.345 → 0.354) for no
  diplomacy reason at all: the village died 2 days
  earlier, so the post-first-diplomacy snapshot count
  fell from 84 to 82 while diplo>0 days stayed 29.
  Hold-share is death-sensitive; report it alongside
  post-drop days lived (99402: 54 days baseline, 52
  days with the lever — the 2-day-earlier death) or it
  will misread as improvement.
- Analyzer granularity note: the analyzer's clear day
  (d141, first broken snapshot) lags the said-aloud day
  (d140, the faded line) by one day, because the
  weekly tick runs after the day's snapshot. Future
  instruments could timestamp the break from the say
  line; the one-day lag does not affect any verdict
  here (the window was 1 day either way).
- The 300d horizon was never binding (max 146d); a
  future recovery arm should either accept death as
  the horizon (and say so) or pick seeds/policies that
  live longer, rather than raising the cap.

## Verdict — NO-GO (pilot)

The clearing rule is PROVEN (live fixture 34/34 +
1 wild clear, said aloud, gates reopened, pre-clear
determinism exact, 0 regressions) but the recovery is
NOT PROVEN on this corpus: 0 re-proposals, 0 re-links,
0 diplomacy recoveries after a clear, because the only
clearable village died 1 day after its clear with a
1,000-kcal pantry. The lever lands as a correct
mechanism with no observable recovery benefit on these
seeds. Recommendation to the coordinator: keep the
rule (it removes a real trap at zero measured cost —
no seed regressed, no hold broke, no trajectory
changed except the cleared seed's final 2 days), and
judge recovery on longer-lived seeds or alongside the
tend-through sibling's continuity result — do NOT
re-run this pilot on the same seeds expecting a
different recovery outcome, and do NOT expand to
12–16 on this worker's authority.

## Telemetry deviation check

Attempted: `node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-04/perseed-recoveryzombie-b/*.json'
--metrics national,table,wins,exiled`. The tool
REFUSED for field-shape reasons, recorded verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs. Recorder corpora are
compared with sweep-compare tables, never against a run
baseline here." No compare was fabricated; the
--allow-recorder-corpus escape was NOT used, because
the tool states recorder corpora are never compared
against a run baseline here, and this baseline is a run
baseline. The paired per-seed table above stands as
the comparison.

## Proof and landing

- Proof: `scripts/test-recoveryzombie-20261104.js` —
  34/34 PASS (analyzer fixtures + live engine fixture).
- Arm commits on branch sim-recovery-zombie-b
  (coordinator merges; committed on branch, pending
  coordinator merge — no push, no bump, no live
  verification by this worker):
  - 5887e8e2e sim-recovery-zombie-b prereg (before any
    judged sim)
  - c42730d4d sim-recovery-zombie-b engine: trust-0
    Haven-primary links clear as 'faded' + proof 34/34
  - (this landing) sim-recovery-zombie-b pilot +
    evidence
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-recovery-zombie-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-recoveryzombie-b/` (8
  files); scripts `test-recoveryzombie-driver-20261104.js`,
  `test-recoveryzombie-analyze-20261104.js`,
  `test-recoveryzombie-20261104.js` (reusing
  `diplo-instrument-20261104.js` verbatim — not
  modified, not claimed as this arm's file).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + engine); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Heartbeats: worktree heartbeated during the run
  (registry `sim-recovery-zombie-b` alive through the
  run).
