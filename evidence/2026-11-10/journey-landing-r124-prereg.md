# journey-landing r124 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261110T1345Z (scheduled Tue 2026-11-10 13:45 CST, started ~19:44Z).
Rotation read 0 → leg 0 LANDING; write 0→1 at closeout (verified by read-back).
**Base:** local master `70e3af870` (sim-diplo-a, pending ship). Branch: `journey-landing` (worktree).
**Lock:** created 19:44:22Z, run_id `2026-11-10T19:44:22Z`. Heartbeat loop `/tmp/hbloop-r124.sh` (every 10 min).
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r123, so this run is r124.
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (ahead 457 / behind 156, merge-base d229b58f5; same standing state as r120–r123; ship loop owns reconciliation, and a Steve-approved reconcile branch exists but is BLOCKED on person-trust errand-mix, not landed — main-session owned, untouched by this run). Proceed on local master, no merge/push/rebase of origin; landing is ff-only into local master. Main tree clean at run start; disk 35%. Registration took ~9 min (registry-lock contention + slow checkout, cf. r123 ~155s). Tendexact adoption: NOT owed — the fix already landed as e6911eb80 + evidence 46459ac83; the dangling be3fb880c is the pre-rebase copy. r123's observe fix is on master (57e0eb67b).

## Seed band — DELIBERATE REUSE (defect seeds)

**Seeds 1142–1151 (the r121 band, reused on purpose).** The Issue 2 defect
reproduces on this band (1142 d6 Jenny sitting, r123). The judge is the
WITHIN-RUN before/after delta on identical seeds (§15), never a cross-run
comparison, so the reuse cannot contaminate the verdict. The band is not in
the forbidden-band list.

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the
SAME seeds 1142–1151, DAYS=28. BEFORE = r123-before driver verbatim except
seeds/OUTDIR/header (r121 driver: press-stop + stepping hop, flee gates OFF).
AFTER = the same driver verbatim except seeds/OUTDIR/header — the ONLY delta
between the legs is the Q1 src fix (no driver-env change). Drivers:
- scripts/journey-landing-r124-before-20261110.js (OUTDIR landing-r124-before)
- scripts/journey-landing-r124-20261110.js (OUTDIR landing-r124-after)
Analyzers: scripts/analyze-landing-r122-fleeloop.js (Q1-flee retired, not
run); scripts/analyze-landing-r118-outingchain.js; scripts/analyze-landing-r121-presshop.js;
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js
(WITH the r122 settled-favor exclusion); scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js; scripts/analyze-landing-r120-scholar-turns.js;
plus transcript greps for the want-bridge lines (see Q1).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r123's Issue 2.
A game-code fix is in scope ONLY for Q1 (root cause established pre-panel
by reading the code and the r123 transcript).

## Canon

docs/CANON.md read at run start. docs/CONVERSATIONS.md is the canon doc for
Q1 (dialogue) — read before building the fix. It promises "No repeats,
ever" — `convoPick` tracks said lines by TEXT across ALL threads per
villager; generic pools "cycle in varying order". A 2-line pool cycling
A,B,A,B inside one sitting is not varying order in any sense the player
can hear. No canon doc covers the far-hop geometry (Q4) or the doorstep
trigger (Q5) — those are code reads + panel, not invented canon.

## Q1 (PRIMARY) — ISSUE 2: THE WANT-BRIDGE REPEATS VERBATIM (r123 Issue 2)

**Basis (read pre-panel, not run):** r123's 1142-d6 Jenny sitting serves
the dlg:subject acknowledgment twice verbatim for EACH of two lines:
'"Sorry — I shouldn\'t load that on you. What\'s up?"' ×2 and
'"Forget I said anything. What did you want?"' ×2. I read the code:
both lines are the whole `BRIDGES.want` pool (convo-beats.js:182, 2 lines).
`bridgeLine` draws via `convoPickCycle(vid, 'bridge:want', pool)`
(convo-beats.js:190), which cycles without replacement then reshuffles
keeping the last `min(3, pool.length - 1)` = 1 line (conversation.js:2935).
With a 2-line pool the cycle is strict alternation A,B,A,B — a third
want-bridge in one sitting repeats a line heard two turns earlier.
Deterministic, not a fluke: any sitting that bridges off the want thread
3+ times repeats. (The voiceLine opener/closer sometimes saves it, as in
r123's Q8 turns 13/17 — luck, not design; the r123 repeats were verbatim.)
**Fix (one src change):** expand `BRIDGES.want` from 2 to 6 distinct lines
(same voice — a villager backing off their own want and handing the floor
to the player; the two original lines stay as entries 1–2). No other
call-site change. The other 2-line bridge pools are NOT expanded here:
no repetition was observed for them; if the panel shows another pool
repeating ≥3× in a sitting, it becomes the next voice-pass item, not a
blind expansion.
**Proof test:** new `scripts/test-journey-landing-r124-want-bridge.js` —
drives `Game.bridgeLine(vid, 'want')` 6 times on a live harness game and
asserts all 6 served bridge texts distinct (extracted by substring match
against the known pool lines, since voiceLine may add an opener/closer);
a 12-call case asserts no repeat within any 3-consecutive window (the
keep-3 memory window); a control case asserts `bridgeLine(vid, 'small')`
still serves its 2 lines distinctly. BEFORE (unfixed code): the test must
FAIL (6 calls alternate A,B,A,B,A,B → distinct=2). AFTER: ALL GREEN.
**Panel re-run (r123 pattern):** AFTER driver re-runs on seeds 1142–1151
post-fix. Q1 metric: 0 verbatim want-bridge repeats within any sitting
across the post-fix AFTER transcripts (per-sitting per-line count ≤ 1 for
each of the 6 bridge lines, grep over sitting transcripts), AND the
census JSONs identical except transcript files up to the r123 metric-review
bar ("9/10 identical, any divergence adjudicated by cause" — a
rejection-sampling draw-count shift is possible: convoPick retries until
it finds an unsaid line, and a bigger pool retries less, so the seeded RNG
stream can shift after the first want-bridge even though no game logic
changes; a single-seed shift is not a fix failure).
**Pre-registered metric (binding):** proof test ALL GREEN post-fix AND 0
verbatim want-bridge repeats in a sitting on the post-fix AFTER corpus →
GO. If the pool change moves any non-transcript census number, adjudicate
the movement by cause before calling it done.

## Q1-FLEE — RETIRED AS A PANEL QUESTION (r123 metric review, binding)

The flee-loop defect has not reproduced on ANY band since r121 (r122 fresh
band 0/10, r123 defect band 0/10). Per r123's metric review: RETIRE Q1-flee
as a panel question until a flee-loop death is observed in the wild again
(a census fightLog with 0 strikes + ≥3 moves + scholar death). No panel is
burned on it this run; the flee gates stay OUT of both drivers (r123-before
verbatim); the code-level defect (legacy branch never pushes) stands as a
known, unreproduced shape. This run does not re-litigate it.

## Q2 — M-PR1 / M-PR2 (carried, re-measured on the post-fix corpus)

**Metric (binding):** per-seed (≥3-turn rule) never-offered ≤1 sitting on
≥8/10 seeds; M-PR2: promised/(picked − away-guard) ≥ 80%.

## Q3 — PRACTICE (carried)

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (H1-ESTABLISHED carries — hunt-assignment policy question).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122: 103, r123: 95).

## Q4 — FAR-UNREACHED GEOMETRY (investigation, descriptive, no bar)

r123: far-unreached NOT-MET on two consecutive bands (4 far + 1 near
unreached, same stock-2-node shape — 1150 Henry's favor). This run names
the geometry that defeats the hop on the r124 corpus (edge tiles?
obstacle-locked stock-2 nodes?) from the presshop analyzer output, or
records that the shape did not recur. No fix in this run — naming only.

## Q5 — M6 DOORSTEP-OUTINGLIVE (investigation, descriptive, no bar)

UNTESTED on three consecutive landing runs (r121, r122, r123) — the trigger
(hungry/thirsty Haven day) never fires in the landing window. This run
reads the trigger code (guardEatOnArrival / doorstepSteps) and states why
it never fires in days 1–28: either the trigger needs a leg that exercises
it (then the check moves legs), or the trigger condition itself is the
finding. No code change unless the read finds a defect.

## Carried bindings (judged fresh on the post-fix AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r123: 6/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r123: VACUOUS — zero holder deaths).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting count (r123: 2× — the
  want-bridge fix should move this; report the new worst and whether any
  non-want line still repeats ≥2×).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean.
- **Poison re-test:** count live re-tests.
- **Scholar-eats-first:** held design question, not changed.

## Metric review (placeholder — filled at closeout)

- (to be written in the run note)
