# sim-covenantsmoke-b — covenant smoke revision to the new opinion timing + substrate re-check (Loop B, 0130Z run)

**Verdict: SUBSTRATE RE-CHECK GREEN — the courtship re-confirm is UNBLOCKED.**
test-covenant-b is 40/40 on this tip (base master 126382932), test-courtship-b
57/57, test-onlylead-b 29/29, test-onlylead2-b 26/26. The confirm band
100621–100636 was NOT spent by this arm (no judged sim ran; all probes were
in-memory `oneRun` calls that write no corpus) and stays fresh for the
re-confirm. No `src/js` file was touched — test-only arm.

## What this arm was

The courtship confirm (sim-courtship-confirm-b, run 2330Z) went NO-GO on G3
alone: test-covenant-b 32/33 on tip cb00f9818. The §2 live 60d smoke on seed
100401 asserts "propose attempts are prerequisite refusals in the smoke
window" (`proposePrereq > 0 && proposeAccepted === 0`), on the frozen
assumption that the engine's opinion-10 prerequisite "is only met at ~day
150 from a cold start". That assumption is dead: on the current tip
max-known-opinion first reaches 10 on **day 59** and a covenant proposal is
**accepted day 59** (village_1, detPeer 73). Cause, proven by elimination in
the confirm evidence: `src/js/conversation.js` journey r137 (ce0f28a46)
re-opens deflected question-wants, so more questions get answered and
opinion moves earlier. This arm revises the smoke assertion to the new
timing, proves the new assertion still discriminates (negative controls),
re-checks all four substrate suites on the new tip, and reads the road's
opening speed on the covenant leg (confirm metric review #5).

## Old vs new timing (seed 100401, covenant policy, 60d)

| | Old (pre-r137 probe, 2 seeds) | New (this tip, reproduced 3x) |
|---|---|---|
| max-known-opinion first reaches 10 | ~day 150 | **day 59** (village_1: 10, village_0: 7) |
| opinion trajectory (daily series) | 2→4→6→8→10 over 150d | 0 d10, 2 d20, 8 d30, 6 d40–50, 10 d59, 10 d60 |
| propose calls in the 60d smoke | (not recorded) | **51** (days 10–60, one/day) |
| propose outcomes | all prereq, 0 accepted | **50 prereq, 1 accepted** (day 59, village_1, detPeer 73), 0 declined, 0 counter |
| day-60 propose | — | prereq to a NEW village (village_spl_28_28860, opinion 0, detPeer 68) — a fresh village still fails the gate even after the road opens |

The day-59 acceptance is the same day opinion-10 is first met: the
policy proposes daily to the best-scored known village, and on day 59
village_1's opinion is 10, so the engine judges instead of refusing
(detPeer 73 → post-draw ≥ 63, always ≥ 55 accept).

## The revised assertion (test-covenant-b.js §2)

The dead check is replaced by a pure judge, `judgeCovenantTiming(proposes,
op10Day)`, over the policy-classified propose stream
(`capSummary.events`, kind `propose`) split at the day max-known-opinion
first reaches 10 (read from the daily series):

- opinion-10 must be met inside the smoke window (op10Day found);
- every propose before op10Day must be a prerequisite refusal, and at
  least one propose must exist before the gate (the gate must be seen
  refusing);
- no cold decline or shut anywhere in the window;
- at least one acceptance on/after op10Day, within a week of the opening
  (a longer lag means the road opened but the policy could not walk it).

Two new live checks replace the one dead check:

- `opinion-10 first met inside the smoke window` — PASS, op10Day 59,
  opinions {village_0: 7, village_1: 10, village_spl_28_28860: 0}.
- `propose stream splits at opinion-10: prereq until, acceptance after` —
  PASS, {prePrereq: 49, firstAcceptDay: 59, postAccepts: 1, declines: 0}.

The timing number (day 59) is recorded in the test comment and in the
check output; it is NOT hard-pinned as an equality — the assertion is
structural over the split, so a future opinion-timing move fails loudly
only if the road stops opening or stops forming, not on a one-day wobble.
The test file header and the §2 comment record the old number (~day 150),
the new number (day 59), and the cause (journey r137, ce0f28a46).

## Negative controls — the new assertion still discriminates (§1b)

Six static checks on `judgeCovenantTiming` with synthetic streams, all
PASS in the committed test (no live run needed to prove discrimination):

1. Happy path mirroring the live numbers (49 prereq d10–58, accept d59,
   prereq d60, op10Day 59) → accepted.
2. **Acceptance suppressed** (same stream minus the day-59 acceptance) →
   FAILS, "no acceptance after opinion-10". This is what would catch a
   road that opens but never forms a link.
3. **Old-timing shape** (51 prereq, op10Day null — opinion-10 never met) →
   FAILS, "opinion-10 never met in the smoke window".
4. **Acceptance before the gate** (accepted day 30, op10Day 59) → FAILS
   (pre-gate propose judged instead of refused).
5. **Cold decline in the window** (declined day 59) → FAILS.
6. **Acceptance lagging >7d** after the opening (accepted day 67,
   op10Day 59) → FAILS.

The assertion was NOT loosened to go green: it requires strictly more of
the live data than the dead check did (a dated acceptance inside a
one-week window after the gate opens, plus zero declines), and each of
the five failure modes above is exercised.

## Substrate re-check on the new tip (base master 126382932)

| Suite | Recorded baseline | This tip | Verdict |
|---|---|---|---|
| test-covenant-b | 33/33 (dead check) | **40/40** (23 §1 + 6 §1b + 11 §2) | GREEN, revised |
| test-courtship-b | 57/57 | **57/57** | GREEN, unchanged |
| test-onlylead-b | 29/29 | **29/29** | GREEN, unchanged |
| test-onlylead2-b | 24/25 (known drift) | **26/26** | GREEN, drift fixed (below) |

All four suites ran green on the new tip. No `src/js` change was needed
anywhere in this arm.

### The onlylead2 drift — same dead assumption, fixed in the same commit

The "known drift" was exactly one check: `covenant no peer link formed
on the substrate-negative seed` (test-onlylead2-b §2, 200d smoke, seed
100421). Characterization on this tip (reproduced by the suite run and
by an independent in-memory 200d probe):

- Seed 100421 was substrate-negative on the pre-r137 tip under
  competent-only: dead d93, max known opinion 8, never 10.
- On this tip, covenant policy, 200d: village lost **day 135**,
  max-known-opinion first reaches 10 on **day 53**, and the day-53
  propose to village_2 is **accepted** (detPeer 73 — opinion exactly 10
  at propose time). Live numbers: 84 propose calls, 83 prereq,
  1 accepted day 53, 0 declined, 0 counter; the link is tended 5x
  (trust 33 → 70+). Max opinion ever 28.
- The seed's defining property is gone, so the check asserting the
  absence of a link encodes the same dead opinion-timing assumption.
  Fix (in the same commit, its own note): the check is replaced by the
  same timing split as the 60d smoke — `opinion-10 first met inside the
  200d window` (op10Day 53) + `propose stream splits at opinion-10 on
  the 200d leg` (judge OK: 43 prereq before day 53, first accept day 53,
  lag 0, 0 declines). The judge is copied from test-covenant-b.js
  (canonical) with a keep-in-sync comment. The "without prejudging the
  pilot" rationale for this seed is retired in the file header — the
  smoke still proves the 200d instrument on a short-lived village
  (lost day 135, 0 instrument errors, determinism identical), which is
  what the smoke is for.

A replacement substrate-negative seed was considered and rejected: a
200d probe of the most promising candidate (seed 100903 — never 10 in
60d) reaches opinion-10 on day 70 (village lost day 131, 56 prereq,
0 accepted). Opinion-10 is met on every seed probed on this tip
(100401 d59, 100901 d49, 100902 d49, 100903 d70, 100421 d53), so a
never-10 seed would be a cherry-picked outlier, not a substrate. The
timing-split assertion is the honest fix.

## Road-opening speed on the covenant leg (confirm metric review #5)

Question: is opinion-10 also met early on the covenant leg (the
re-confirm's control leg), so the control may now stage covenant beats
on its own? Short in-memory probes (covenant policy, 60d, no corpus
written, no band spent — seeds 100901–100903 verified unnamed in any
prereg before probing):

| Seed | op10Day | First acceptance | Propose stream |
|---|---|---|---|
| 100401 (smoke seed) | 59 | day 59, village_1 | 50 prereq / 1 accepted |
| 100901 | 49 | none by day 60 | 51 prereq / 0 accepted |
| 100902 | 49 | none by day 60 | 28 propose calls / 0 accepted (23 days blocked) |
| 100903 | never in 60d (max 8) | none | 51 prereq / 0 accepted |

**Opinion-10 IS met early on the covenant leg too (day 49 on 2 of 3
probe seeds) — but that alone does NOT stage covenant beats.** On
100901 the opinion-10 village (village_0, opinion 10 on day 49) is
never proposed to after day 39, because the ENGINE formed a plain
`link` with village_0 on day 40 via engine-direct `_formLink`
(verbEvents: `d40 _formLink other=village_0 result=formed via
engine-direct`), and the policy skips linked villages — so it keeps
proposing to village_2 (opinion 2–6, prereq) through day 60. On 100902
the policy is blocked on 23 of 51 days and proposes to a fresh split
village on days 59–60. On 100903 opinion never reaches 10 in 60d.

Read for the re-confirm: the control leg will NOT routinely stage
covenant beats on its own inside 60 days — 0 acceptances on 3/3 probe
seeds, and the one acceptance observed (100401) needed the opinion-10
village to stay unlinked AND best-scored on the opening day. But the
G2 contrast the pilot measured (control staged 1/8) is now thinner
than it looks: opinion-10 is met early on the control leg, and whether
a beat stages turns on which village holds the opinion and whether the
engine links it first — the re-confirm's per-seed opinion trajectories
(already in the prereg) will show it. The G2 bar (≥6/16 armed) still
judges the armed leg; the "lever opens the gate" story needs re-reading
against a faster baseline, exactly as metric review #5 warned.

New backlog item appended for the engine-link diversion (see below):
on 100901 the engine links the opinion-10 village before the covenant
policy can propose to it. Which engine path forms a plain link
engine-direct is NOT established by this arm (no wrapped policy verb
is in progress at formation time) — a question for the onlylead DIAG
lane, not a claim made here.

## Wall numbers

NOT MEASURED this run — no judged sim ran (test-only arm, probes in
memory only). The last measured read remains the courtship-rework2
pilot's (evidence/2026-11-15/sim-courtship-rework2-b.md): armed
national 8/8 ever, 6/8 held; wins 0/8; wave-4 8/8, wave-5 6/8; median
survival 175d vs 150d control. This run adds none.

## Sense-testing

One played line observed in the instrument output: the day-59
acceptance on seed 100401 is a real covenant peer link forming in live
play (link id link_mgpspjiy113, trust 30, tended day 60 +8 trust) —
the road opening early is visible in the game, not just in counters.
No dialogue corpus was produced by this arm (no judged sim ran).

## Metric review

1. **The G3 bar worked as designed — twice.** The confirm's NO-GO
   caught a real substrate drift, and this arm's revision is the
   prescribed follow-up, not a re-score: the dead assertion is replaced
   by a strictly stronger one, and the onlylead2 drift it exposed is
   the same assumption in a second file, fixed with its own note.
2. **The revised smoke is structural, not pinned.** op10Day is read
   from the live series every run and recorded (day 59 here); the
   assertion judges the split, not the date. If journey moves opinion
   again, the test fails only when the road stops opening or stops
   forming — the two things the smoke exists to prove.
3. **The negative controls belong in the committed test, not in a
   scratch probe.** All five failure modes are §1b checks that run on
   every future invocation of test-covenant-b; a future loosening
   would have to delete them visibly.
4. **The control leg's opening speed is a watch item, not a verdict.**
   Opinion-10 by day 49 on the covenant leg does not by itself stage
   beats (0/3 probe seeds accepted in 60d), but the staging now turns
   on engine link formation and candidate ranking — both outside the
   prereg's per-seed opinion trajectories. If the re-confirm's control
   stages often, the G2 bar still stands, but the pilot's "lever opens
   the gate" framing needs the re-read metric review #5 already
   ordered.
5. **Seed 100903 is not a substrate-negative replacement.** It reaches
   opinion-10 on day 70 at a 200d horizon. The never-10 seed class the
   onlylead2 smoke was built on does not survive the r137 timing on
   any seed probed; the timing-split revision replaces the
   absence-assertion rather than hunting a rarer seed.

## What stays open

- The re-confirm: same frozen shape (16 seeds × 2 policies, band
  100621–100636, 200d) once this arm merges — **UNBLOCKED** by this
  arm. Band stays fresh and unspent.
- The findings-backlog item "COVENANT SMOKE OPINION-TIMING ASSUMPTION
  IS DEAD" is [fixed] by this arm (test revision + substrate re-check
  green); the engine-link diversion below is a NEW [open] item.
- The covenant road itself: it opens ~90 days earlier than the old
  probe assumed on every seed measured. Whether that is the intended
  r137 effect is a question for the journey lane, not this arm.
- The engine-direct plain-link formation (100901, day 40, village_0):
  which engine path forms it, and how often it diverts the covenant
  road, is unmeasured — see the new backlog item.

## Files changed (this arm, one commit)

- `scripts/test-covenant-b.js` — §2 smoke revised to the new opinion
  timing (judge + 2 live checks), §1b negative controls (6 checks),
  header/comment updated. 33 → 40 checks, 40/40 on this tip.
- `scripts/test-onlylead2-b.js` — §2 substrate-negative check replaced
  by the same timing split at the 200d horizon (judge copy + 2 live
  checks), header updated, "without prejudging the pilot" rationale
  retired. 25 → 26 checks, 26/26 on this tip.
- `evidence/2026-11-15/sim-covenantsmoke-b.md` — this file.
- `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
  — "COVENANT SMOKE OPINION-TIMING ASSUMPTION IS DEAD" marked
  [fixed]; new [open] item for the engine-direct link diversion.
- Diagnostic probes (NOT committed, in /tmp): probe-covenant-op10.js,
  probe-covenant-op10b.js, probe-covenant-v0.js, probe-op10-200d.js.

## Commit

Single commit via scripts/safe-commit.sh (see the commit message for the
hash). Message names both revisions (covenant smoke timing + onlylead2
substrate-negative seed) and the cause (journey r137 opinion timing).
No src/js, no push, no version bump. Report: "committed, ready for
coordinator merge".
