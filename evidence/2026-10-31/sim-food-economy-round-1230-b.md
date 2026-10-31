# sim-food-economy-round-1230-b — coordinator evidence (RECOVERED closeout)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1230Z,
axis food-economy. Adopted from blocked run
fleshout-loop-b-20261031T1130Z (EPERM flap, never started).

RECOVERY NOTE (read first): this file was NOT written by the 1230Z
coordinator. Both 1230Z arms landed on master before that run's
closeout stalled (its lock + claim were retired at 14:33Z; its
closeout worktree registration was still retrying against the
registry lock at 14:42Z). Run fleshout-loop-b-20261031T1430Z
recovered this round evidence from the landed commits + the workers'
own evidence files. No arm content was re-run or re-judged in
recovery; every verdict below is the worker's own, quoted from its
evidence file. The 1430Z run's tracker entry for this run is in
hidden_files/convergence-tracker.md; the sim-findings updates
(line 1600 flipped to ANSWERED; homecoming-line + corpse-move
items appended) were made by the recovering run.

Loop A live on scale-onramp for the whole 1230Z run (1107Z claim,
then 1415Z claim) — NOT touched.

## Arm 1 — sim-windowcarry-b: NO-GO (lever prototype deleted)

- Prereg: b57494997 (policy + driver + analyzer + pure proof 11/11,
  committed before any judged leg).
- Evidence: 824b27c42 (censuses, compare, corpora, stdout-runner +
  splitter, corpus proof).
- Cleanup: af6ec60b8 (policy + driver + lever proof deleted; killed
  arms leave no trace).
- Design (tracker blank 1 from 1047Z): window-gated pre-strand
  carry — haven-departure pack carry ONLY pre-strand, window =
  census loop-day <= 7 AND no still-creek evening yet recorded;
  no wake-eat half (variant (b)). Fresh 8-seed band
  (15003/15009/15091/15211/15215/15220/15221/15337), 30d
  nighttravel+woodcarry+woodwarm stack, all legs re-run fresh.
- Verdict against binding prereg: NO-GO. Clause (a) FAILS as
  written: fall bar met (15215 ON still 10 -> 1, fall 9) but
  causal-link bar not — no linked rescue inside the control
  range 7-16; the variant's strand MOVED earlier (day 4 ON,
  days 4-6 guard) instead of being rescued. Clause (b)
  strand-length non-increasing PASS (ON 10 -> 1, guard 3 -> 3).
  Clause (c) guardrails FAIL (earlier vessel deaths incl. 15215
  ON day 17 -> day 13 and guard none -> days 6/17/29; new
  vessel-death modes incl. "the wild"/"contest"/"sickness";
  newly ticks-short evenings on 15215 guard 1 -> 2; creek
  still increase on non-strand seed 15337 [] -> [20] both
  legs, a late wood-bleed stranding on a healthy seed).
  Clause (d) window integrity PASS (zero violations; fixes
  morningcarry's 15211 breach — 15211 variant still [] both
  legs here). Sense PASS.
- Metric review carried forward (worker's own): (1) ANY
  pre-strand bank may be unable to avoid re-routing, since
  feeding days 1-7 changes route choice itself — the next
  design may need to act AT the strand or not on food at all;
  (2) the vessel-death guardrail as written is unfair to a
  bounded lever — next run should define it against
  game-over days, lever-caused death modes, or deaths inside
  the strand window; (3) a future arm claiming the fed-bridge
  chain must pre-register the shifted-strand chain, not the
  control range.
- §15 panel: non-applicability declared (strand census, same
  standing exception as prior strand arms).

## Arm 2 — sim-toolloss-b: DIAG-GO (succession, not tool loss)

- Prereg: 8ad7d4580 (diag only, before judged legs).
- Landed: daabd0e2d (drivers, analyzer, proof 32/32, evidence,
  corpora, table).
- Verdict: DIAG-GO. The whittle -> none "tool loss" across the
  strand is a succession, not a loss: Gabriela Ludwig
  (gen_gyft62f) held whittle / Stone knife mornings 8-16, died
  day 17 in a dawn Hushpuppy ambush after a starving creek
  night (kcal 0 at bedtime, warmth unfired for want of wood),
  and the mantle passed to Dakota Ibarra (gen_eni1m98), who
  never owned a knife; the Stone knife sits unlooted on
  Gabriela's corpse with her full loadout. Durability break,
  deliberate drop/deposit, corpse-loot swap, inventory-cap
  eviction, and prototype side effects all excluded by the
  morning->evening->morning bracket. The fellrepeat "loss"
  was a recording artifact: its morning snap read cutInfo
  without bearer identity or inventory. Design rule: bearer
  identity first on any tier-change claim.
- Out-of-scope items (appended to sim-findings by the
  recovering run): successor homecoming line role-anchored
  (day-17 transcript says "You come home after 11 days"
  although the successor starts day 17 already at Haven);
  corpse node moves creek -> haven (node (2,5) mornings
  17-18 -> (4,4) morning 19, items unchanged, still
  unlooted; mechanism unidentified at that time — later
  answered by the 1430Z corpsemove arm, see
  sim-food-economy-round-1430-b.md).

## Wall (30d pre-seat strand census)

National / table / wins NOT observable, stated not fabricated;
median survival 30d vs 30d both legs (windowcarry); no
wave-4/5 reach on either arm's corpus. Overall wall
UNCHANGED: full seat 0, wave 5 reached 0 stands.

## Telemetry deviation check

Not run by the 1230Z run on these corpora (strand census,
same declared §15 exception class as prior strand arms).
The recovering run did not retro-judge them; the 1430Z run's
own telemetry check is in sim-food-economy-round-1430-b.md.

## Infrastructure (from the worker evidence)

Game-loaded processes cannot reliably write files (frozen
clock makes Atomics.wait return in ~1ms, so driver retry
sleeps never happen) — the working pattern is a
stdout-runner (sim prints one JSON line per seed to stdout)
+ an idle splitter process, stdout→file + stderr→file in a
foreground exec, never a backgrounded pipe; judged corpora
must never be staged in /tmp (sibling-cleanup wipe killed
a leg mid-run). Safe-commit index clobber hit the toolloss
prereg commit (repaired via cacheinfo from the HEAD blob).

## Disposition

Both arms landed on master before recovery (windowcarry
evidence + cleanup, toolloss DIAG-GO). food-economy stays
converging (NOT converged). 1230Z claim retired to .DEAD;
1230Z lock deleted. Merged locally, pending ship.

## Main-session closeout addendum (1430Z recovery, 2026-10-31)

Appended by the main-session closeout that committed this file
(the 1430Z run recovered it from the landed commits; the 1230Z
coordinator did not write it). Two disclosures from the 1230Z
worker's own delivered report, preserved here so the round is
never mis-cited:

- check.js --quick outcome UNKNOWN for the 1230Z round:
  execution started, the poll aborted, the result was never
  delivered. Do NOT cite this round as check-quick green.
  What holds instead: zero src/js changes, zero policy-default
  flips, arm proofs green (windowcarry 11/11 + 8/8, toolloss
  32/32).
- Telemetry: the 1230Z worker reported LOUD lines on the
  round's corpora (national/table/wins 0 vs the WINSEAT
  baseline 12/16/16), investigated as a WINSEAT-baseline
  regime artifact for a 30-day pre-seat census; baseline NOT
  rolled. The "not run" wording in the Telemetry section
  above refers to no formal same-run investigation item
  beyond that worker investigation.
- Attribution correction: the 1230Z claim retirement + lock
  deletion at 14:33Z were done by the main-session closeout
  (the 1230Z coordinator had timed out), not by the 1230Z
  coordinator itself.
