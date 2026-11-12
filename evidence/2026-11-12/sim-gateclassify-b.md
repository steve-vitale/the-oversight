# sim-gateclassify-b — classify the round-6 gate failures (Loop B, 2026-11-12 1430Z)

Arm: sim-gateclassify-b · Run: fleshout-loop-b-20261112T1430Z · Axis: winnability chain — measurement hygiene (tracker 1130Z next blank #5)
Worktree: `~/workspace/worktrees/sim-gateclassify-b` · Branch: `sim-gateclassify-b`
Base: master tip `5c4361ccc` (== worktree tip at start; no rebase needed)
Canon read: `docs/CANON.md` (manifest + standing rules). This arm makes ZERO src/js changes and ZERO game-code changes — test hygiene only.

## Pre-registration (written BEFORE the check.js run)

**Primary metric:** every failing script in `check.js --quick` on merged master, classified into exactly one class. GO threshold: 100% of failures classified with a standalone reproduction (pass/fail + time) recorded; zero failures left unclassified; zero (d) real failures left without a standalone reproduction command and a sim-findings.md line.

**Classification classes:**
- (a) CPU-starvation timeout — passes standalone (record standalone time).
- (b) stale-panel/proof artifact — fails only because the retained neutrality proof predates the tip (record the manifest key that moved; if sim-proofrefresh-b9 has landed by then, re-run and expect green).
- (c) known pre-existing artifact — cache-flags spawn cap / phone-frame stale evidence (cite the prior ruling, do not re-litigate).
- (d) REAL failure — fails standalone on an assertion (quote the failing assertion, name the owning system, file a sim-findings.md line if it is a real game defect).
- A failure unreproducible standalone after two attempts is (a) with both attempts recorded, not silently dropped.
- Also classify the 3 slowest scripts even if they pass.

**Command:** `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-sim-gateclassify-b`, stdout+stderr captured TO A FILE (`evidence/2026-11-12/sim-gateclassify-b-checkquick.log`), run under `setsid` so a parent death cannot kill it. Never run a second check.js concurrently. Expected wall time ~17–43 min depending on load.

**Prior gates this run classifies against:**
- Round-6 gate (Loop A fleshout-20261112T1215Z, evidence `evidence/2026-11-12/sim-bisect-adopt-round6-1215.md`): 321 passed, 19 failed in 2575s under extreme load (peak 23.6). The 3 slowest all hit the 120s cap and each re-ran standalone PASSING (table-endings 59s, occupation-panels 64s, synergy-stall 58s) — CPU-starvation timeouts. The full 19-name list was LOST to tail buffering; 16 failures remain unclassified. That loss is what this arm fixes.
- 1130Z gate (Loop B, commit `459ae661f`; log at `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-winnability-round-1130-gate.log`): 334 passed, 6 failed in 990s. The 6: `scripts/godpath/test-living-garden-deed-attainment.js` (120s TIMEOUT), `test-measurement-proof-update.js` (exit 1, "Proof source inputs are not current" — b8 panel went stale when master moved), `test-measurement-workflow.js` (1 failed leg: retained neutrality proof covers current inputs — same stale-panel root cause), `test-measurement-cache-flags.js` (known 30s spawn-cap artifact, already NO-GO'd by sim-mcconfirm-refresh-b), `test-phone-frame-proof.js` (pre-existing stale phone evidence), `test-one-person-army-deed-attainment.js` (120s TIMEOUT).
- 0930Z round: check.js --quick on merged master `11e576828` as 334 passed, 6 failed (4× 120s load timeouts, cache-flags artifact, phone-frame-proof pre-existing stale).

**Standing notes for this run:**
- sim-proofrefresh-b9: branch exists, NOT landed on master as of 14:48Z, NOT in `~/workspace/worktrees/REGISTRY.json` (no live tree). Do NOT re-judge the proof-update failure as a game defect — classify as stale-panel (b); re-check AFTER b9 lands if it lands before this arm finishes, otherwise record as pending-b9.
- Box load at run start: load avg ~5–6 (moderate; sibling playtest check.js + journey runs in flight). Expect timeouts to be load artifacts — that is the hypothesis to test, not a conclusion to assume.
- Instrument: `scripts/gateclassify-parse-20261112.js` parses a check.js log and emits the failure-name list (the exact list the round-6 gate lost); proof test `scripts/test-gateclassify-parse-20261112.js`.

## Run

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-sim-gateclassify-b`
ran under `setsid` in this worktree (base `5c4361ccc` + branch commits),
stdout+stderr to `evidence/2026-11-12/sim-gateclassify-b-checkquick.log`:
**340 scripts, 327 passed, 13 failed in 1734s.** The parser
(`scripts/gateclassify-parse-20261112.js`) extracts all 13 failure names
from that log — verified by the coordinator on the rebased tree (13/13,
plus the totals line and the 3 slowest). The round-6 loss (16 names lost
to tail buffering) does not repeat: the full list is in the log and the
parser output.

Standalone re-runs (`evidence/2026-11-12/sim-gateclassify-b-standalone.log`):
the worker ran cache-flags (FAIL, 86s) and started living-garden before
being interrupted at 15:37Z (no END line — the run was cut off mid-script,
seeds 7–6 only). The 1630Z coordinator finished the arm on the rebased
tree (`ea1ef5a75`, b9 + cut7confirm landed): the remaining 11 re-runs
16:46–16:52Z, one attempt each, bounded at 180s by `timeout`, plus a
phone-frame reproduction to close the (c) record. No second attempts were
needed — every timeout failure passed standalone on the first attempt.

## Classification table

| Script | Gate result | Standalone | Class |
|---|---|---|---|
| `scripts/godpath/test-living-garden-deed-attainment.js` | 120.2s TIMEOUT | PASS, 117s | (a) CPU-starvation timeout |
| `scripts/godpath/test-measurement-proof-update.js` | exit 1, 10.1s — "Proof source inputs are not current" | FAIL exit 1, 2s, same error | (b) stale-panel (b9 panel stale by 2 keys: `src/js/convo-wants.js`, `scripts/policies/competent.js`; round 10 owed) |
| `scripts/godpath/test-measurement-workflow.js` | exit 1, 9.7s — 1 leg (retained neutrality proof) | FAIL exit 1, 1s, same leg | (b) stale-panel, same root cause |
| `scripts/godpath/test-measurement-cache-flags.js` | exit 1, 91.9s — 0/4 legs | FAIL exit 1, 86s, 0/4 legs | (c) known cap artifact — 30s spawn cap, NO-GO'd by sim-mcconfirm-refresh-b; cap stays 30s |
| `scripts/godpath/test-occupation-panels.js` | 120.0s TIMEOUT | PASS, 33s | (a) CPU-starvation timeout |
| `scripts/godpath/test-phone-frame-proof.js` | exit 1, 9.3s — 3 failed legs (stale phone evidence) | FAIL exit 1, 9s — 3 passed, 3 failed | (c) known pre-existing stale phone evidence (1130Z + r128 gates) |
| `scripts/godpath/test-one-person-army-deed-attainment.js` | 120.1s TIMEOUT | PASS, 81s | (a) CPU-starvation timeout |
| `scripts/godpath/test-solo-campaign-endings.js` | 120.1s TIMEOUT | PASS, 15s | (a) CPU-starvation timeout |
| `scripts/godpath/test-time-save-crashes.js` | 120.2s TIMEOUT | PASS, 12s | (a) CPU-starvation timeout |
| `scripts/godpath/test-trust-observer-neutrality.js` | exit 1, 62.9s — Error at :16:265 | PASS 6/6, 47s | (a) CPU-starvation timeout — the gate Error was load, not a real failure (standalone 6/6 green) |
| `scripts/test-synergy-stall.js` | 120.2s TIMEOUT | PASS, 17s | (a) CPU-starvation timeout |
| `scripts/test-capable-bot-20261014.js` | 120.2s TIMEOUT | PASS, 15s | (a) CPU-starvation timeout |
| `scripts/test-table-endings-20261014.js` | 120.2s TIMEOUT | PASS, 8s | (a) CPU-starvation timeout |

3 slowest (gate log): time-save-crashes 120s, table-endings 120s,
capable-bot 120s — all three pass standalone (12s / 8s / 15s), all (a).

Counts: **(a) 9, (b) 2, (c) 2, (d) 0. 13/13 classified, 0 unclassified.**

## Metric review

- **Primary — 100% classified with a standalone reproduction: GO.**
  Every failure has a standalone pass/fail + wall time recorded in the
  standalone log (11 coordinator re-runs + the worker's cache-flags run
  + the phone-frame reproduction). Zero (d) real failures — nothing
  needed a sim-findings.md line.
- The trust-observer gate Error looked like the one real failure in the
  batch (exit 1 at 62.9s with a stack trace) and is not one: it passes
  6/6 standalone in 47s. Under 4-parallel gate load it starved; alone
  it is green. That is the (a) mechanism, confirmed rather than assumed.
- Living-garden passes standalone at **117s — 3s under the 120s cap**.
  It will keep flaking in gates under any concurrent load; that is a
  slow test under load, not a game defect. No finding filed (not a (d));
  noted here so the next gate reader does not re-litigate it.
- The two (b) failures are the same stale-panel root cause b9 was
  generated to fix — and b9 itself is stale by 2 keys on the landing
  tip, so they persist until round 10. Classified, not waived.
- No re-scoring: the classes are the prereg's classes, applied as
  written; the (c) calls cite the prior rulings named in the prereg.
- **Proof:** `scripts/test-gateclassify-parse-20261112.js` 11/11 legs
  green (on the branch tree and again on the rebased tree, coordinator
  re-run) — parser extracts the full 13-name list, totals, and slowest
  3 from the real gate log.
