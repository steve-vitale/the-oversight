# sim-arrears-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0605Z, arm sim-arrears-a, axis scale-onramp.
Worktree branch: sim-arrears-a. POLICY-SIDE ONLY — zero `src/js` changes,
no gates, stages, deed bars, win prices, quota, or need values touched.
Diagnosis only: this arm lands measurement + evidence, never a game change.
No [needs-eyes] (diagnosis alone, nothing player-facing ships; the sibling
arm tests the route policy).

## Canon read

docs/CANON.md first, then docs/SCALE.md (scale ladder; BELONG bar is
trust >= 50, arrears 0, link >= 14 days; LEAD is a live trust/tribute
relationship). There is NO titan-specific canon doc in docs/ — stated
here instead of inventing one (the 0445Z round established the same).
The in-code design source is `src/js/titans.js` (soundTitanCall refusal
rule; `Game.titanCallReadiness` in the sumdeploy landing) plus
`src/js/hierarchy.js` (linkTick / payTribute / primacy flip / break-relink).

## Question (tracker blank 1, from the 0445Z round)

The 0445Z sumconfirm (evidence/2026-11-02/sim-scale-onramp-round-0445.md)
found the scale-onramp binding constraint is arrears: 4 of 12 confirm
seeds never reached a defined muster trigger because allied links
refused over arrears (`Game.titanCallReadiness` in src/js/titans.js:
a link with arrears > 0 contributes 0 blades; trust < 25 or
opinion < -10 also refuse). This arm answers, on measured sims:
what clears arrears in time, what it costs, and whether a muster
can wait for / route around an indebted fire — the diagnosis half
(the sibling arm tests the route policy).

## Code-path hypothesis under test (read from code BEFORE any sim — the
## sims test whether any of these paths actually fire in practice)

In src/js/hierarchy.js, exactly two sites ever zero arrears:
(1) `payTribute` (line ~1045) — only for links where Haven is the
SUBORDINATE (`link.subordinate === HOME`); a full week's payment
sets `arrears = 0` and grants +3 trust. (2) `bidForPrimacy` flip
(line ~1631) — "the old books burn": when Haven becomes primary,
old arrears clear. Break-and-relink does NOT clear: `_formLink`
inherits the latest broken link's outstanding arrears and says so.
For Haven-PRIMARY links, the weekly `linkTick` subordinate-payment
branch never zeroes arrears: a full payment grants +1 trust and
notes "paid", a partial payment adds the shortfall to arrears
(-1 trust), nothing at all adds the full week's tribute (-2 trust),
and the DEPOSITGATE waiver counts the week paid without touching
pre-existing arrears. Renegotiation cuts the future weekly rate
only. So the hypothesis is asymmetric: Haven-subordinate arrears
is payable off in one full week; Haven-primary arrears may be
sticky for the life of the link (or until a break/relink cycle
that inherits it, i.e. never). The 30-day traces below test this
against real trajectories, including whether the frozen policy
ever pays tribute at all on the relevant links.

## Seeds

Blocked (from the 0445Z confirm band, old corpus anchor 489ce5e90e7e):
95447, 95464, 95478, 95512 — first-refusal days on the old corpus
94, 128, 104, 73 respectively; max faithful totals 7, 9, 6, 3
(need 10). Contrast (sounded seeds, same confirm band): 95448
(first refusal day 89, total 19) and 95453 (day 95, total 13).
All six re-run in-run on current code (see Control below); no
verdict rests on the old corpus alone.

## Policy stack (frozen from quotatrigger/sumtrigger/sumconfirm)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) + `muster-diag` recorders. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. DAYS=180 death-aware cap (same
rationale as sumconfirm: 150-200d reachability band, room past
day 100 for the trust race; a cap, not a target). NO call is ever
sounded in the trace runs: sounding charges every refusing link
-8 trust and perturbs the timeline (measured in 0445Z), which
would corrupt the "does arrears clear unprompted" question.

## Instrument (new, diagnosis-only)

`scripts/arrears-trace-20261102.js` (stdout runner, same pattern
as muster3-sweep: prints one JSON line per seed, writes nothing
itself; a splitter writes per-seed JSONs under
evidence/2026-11-02/perseed-arrears-a/):
- Daily census (policy daily hook): every active link, every day:
  direction (Haven primary / Haven subordinate / peer kind),
  trust, opinion, arrears kcal, tribute kcal/week, subordinate
  pantry kcal (the `pantryKcal` scalar linkTick itself reads),
  link age days (current day minus link.day), status, kind.
  Reading link fields only — it NEVER calls
  `Game.titanCallReadiness` or any roster generator mid-run, so
  the trace timeline stays a pure no-call timeline (the 0445Z
  lesson: generation consumes seeded RNG and moves tails).
  Refusal reasons are computed from the link fields by the
  exact soundTitanCall rule (trust < 25, opinion < -10,
  arrears > 0), no game call needed.
- First failure per seed: the first muster-diag refusal snapshot
  day on which >= 1 active link refuses on arrears (falling back
  to the first census day with arrears > 0 on an active link if
  no such snapshot exists; reported as a fallback, not silently).
- 30-day trace per blocked link: daily arrears series from first
  failure through first failure + 30 days (or run end, if sooner),
  every arrears change (day, old -> new, delta) correlated with
  same-day transcript lines (tribute paid / short / waived /
  flip / break / relink / renegotiation) and link-status changes.
  Clearing event classification, in priority order: subordinate
  tribute payment via membershipDaily/linkTick; Haven waiver
  (DEPOSITGATE); renegotiation; primacy flip burning the books;
  break/relink inheritance; other (named with evidence); never
  (end-state numbers quoted).
- Transcript capture: all `Game.say` lines matching
  arrears|tribute|waiv|debts|old books|REFUSES, per seed, capped
  per line, for the sense-test read.
- Wall fields per seed (same definitions as sumconfirm): end
  scale rank, table, won, maxWave, gameDays, endReason — for the
  control comparison only, never pooled across bands.

`scripts/arrears-probe-20261102.js` (separate, labelled probe
run, NOT part of the trace): one seed (95447, the lowest-arrears
blocked seed on the old corpus) run to its first-failure day + 2
with a single forced sound at the first refusal, capturing the
exact refusal `Game.say` lines. Its timeline is discarded for
every measured claim; it exists only so the sense-test quotes a
real spoken refusal line, not a code template.

Validator: `scripts/test-arrears-a.js` — reproduces the verdict
from the corpus alone (no game load): per-seed first-failure
tables complete, 30-day traces complete, contrast seeds present,
control drift section present, transcript line present.

## PRIMARY QUESTION

For each blocked seed, what clears its arrears in time, what it
costs, and whether a muster can wait for / route around the
indebted fire?

## GO (diagnosis — all must hold)

(a) First-failure tables complete for all 4 blocked seeds AND
    both contrast seeds: every allied link at first failure with
    direction, trust, opinion, arrears, tribute/week, subordinate
    pantry, link age, and refusal reason(s) applying.
(b) Determinate clearing answer for >= 3 of the 4 blocked seeds:
    either a named clearing event with day + kcal cost to whom +
    trust effect, OR a proven never-clears verdict in 30 days
    with end-state numbers AND the code-path reason no event
    can zero it (the asymmetry above, verified against the
    trace, not assumed from the code read).
(c) In-run current-code control re-run for all 6 seeds, with any
    drift vs the old sumconfirm corpus (anchor 489ce5e90e7e)
    reported explicitly (first-failure day, per-link arrears,
    max faithful total, wall fields). No verdict rests on a
    stale corpus.
(d) Sense-test: at least one real transcript line quoted (from
    the probe run for refusals, from trace runs for tribute /
    arrears lines) and judged for whether it names the debt
    honestly and reads humanly.
(e) Guardrails: trace runs sound no call (sound count 0 on all
    6 seeds), instrument errors 0, worktree clean at end apart
    from committed files.

A miss on any bar is NO-GO / partial as stated in the report,
never re-scored against a friendlier metric mid-run
(MEASUREMENT §14). Doubts go under "metric review" in the
evidence file.

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this
is a trigger-moment census with a no-call trace, not a
sweep-compare policy run — same declaration class as
sumconfirm / sumtrigger / quotatrigger. Before/after is done
directly on identical seeds against the old corpus (control
named above), with wall metrics reported per band, NEVER pooled.
No panel fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
median / max survival (gameDays), endReason mix — for the
in-run control band, kept separate from the old-corpus band.

## OUT OF SCOPE (task bounds)

No src/js change (policy-only). No route-policy test (sibling
arm). No sibling trees or branches touched (Loop B live on
sim-roadguard-b / sim-gatedepth-b — not touched). No
hidden_files (tracker/claims/findings — coordinator-owned).
No push, no bump, no live verification — report "merged
locally, pending ship" readiness; the coordinator merges.

## METRIC REVIEW (to be filled at end of run)

(Blank until the evidence file is written.)
