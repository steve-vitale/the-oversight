# sim-lendfix-a — the borrower-death sink fix + lend-opportunity pool counter (findings #2629, #2628)

- Run: Loop A `fleshout-20261120T2015Z`, axis scale-onramp.
- Prereg: `evidence/2026-11-20/sim-lendfix-a-prereg.md` (commit `d1fea1d7f`, frozen 2026-11-20 ~21:05 UTC, before any judged sim), base master `1fcd7edba`.
- Band: fresh 107081–107088, 8 seeds, 150d, competent verbatim policy, two legs (ctl / fix) differing only by driver — ctl runs the old `scripts/lend-driver-a.js` (no counter), fix runs `scripts/lendfix-driver-a.js` (counter + fix present in the tree). BOTH legs LEND unset, both GUNRATE=1 + CELLGATE=1. Substrate both legs: VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1. SEARSUPPLY, BOWCRAFT, FUSIONCELL, PRESENCE unset.
- Substrate: the lend lever code was never committed (it lived as uncommitted worktree changes, discarded on revert), and GUNRATE/CELLGATE were likewise absent from `src/` — so this arm REBUILDS all three from their frozen in-tree specs as env-gated code, OFF by default (commit `6a46daf2c`), plus the return fix. The lend stays REVERTED in behavior: NOT re-tested, NOT switched on.
- Instrument: `scripts/lendfix-driver-a.js`, `scripts/analyze-lendfix-a.js` (selftest 69/69 after the adoption instrument fix, §9), `scripts/test-lendfix-a.js` (42/42).
- Analysis: `evidence/2026-11-20/lendfix-a-analysis.json`. Corpora: `evidence/2026-11-20/perseed-lendfix-a-ctl/` (8 files), `evidence/2026-11-20/perseed-lendfix-a-fix/` (8 files). Sweep logs: `lendfix-a-sweep-fix.log` (worker), `lendfix-a-sweep-ctl-rerun.log` (adoption, full 8-seed ctl re-run), `lendfix-a-sweep-ctl.log` (adoption, single-seed repair attempt — superseded, see §9).

## Verdict: GO

**All three frozen bars hold** (prereg §14). The fix + counter land (env-gated code + instrument + evidence; no lend re-test, no switch-on).

| Bar | Frozen requirement | Measured | Result |
|---|---|---|---|
| (1) Fixture proof — dead-borrower return, 100% | gun back in the living lender's `items`, same entry object, + unspent lent cells, re-seated, in 3/3 real-fight cases (borrower dies round 1 / dies mid-fight / survives) | `test-lendfix-a.js` 42/42 | PASS |
| (2) Regression — live-borrower return still works | `test-lend-a.js` 41/41, `test-gunrate-a.js` 39/39, `test-cellgate-a.js` 12/12 against the rebuilt lever + fix | 41/41, 39/39, 12/12 (re-run on the adoption tip, §9) | PASS |
| (3) Guardrail — dormant fix changes nothing | fix leg byte-identical to the no-fix control leg on every simulation field except `v4lendPool` rows + run/mode/leg metadata; `v4lends` empty both legs | analyzer `guardrail-identical: true`, 8 seeds, 8 ctl + 8 fix files, 0 diffs; `v4lends` 0 / 0 | PASS |

## The fix, in plain words

When a fighter borrows the village's best gun for a hard fight and dies in it, the gun used to vanish: the return looked for it in the borrower's pack through the village roster, and a dead borrower is no longer on the roster, so the lookup went blind while the gun sat in a dead villager's pack. The fix looks the borrower up directly — dead or alive, on-roster or off it — finds the lent gun by entry identity in the borrower's pack, equipped slots, or the corpse list, takes it out of wherever it sits (so it can never be duplicated), hands it back to the living lender, and re-seats both fighters' gear. If the lender is also dead the borrower keeps the gun; if both are dead it stays with the borrower's gear, still findable. Zero new `Math.random()` calls (the one mention on added lines is a comment: "Zero Math.random()").

**Mechanism correction to the prereg's diagnosis:** the prereg said the field engine "strips a dead fighter's equipped weapon during the fight, before the try/finally return runs." The fix's probe (real deadly field fight, borrower dies round 1, full settlement) found the engine never strips it — the lent gun stays in the dead borrower's `items`, findable by identity. The lend-a sink was the return never looking there, not a strip. The fixture proof (42/42) proves the return from a real dead borrower through real fights.

## The pool finding — 0 lendable moments on all 8 seeds

The counter ran and reported on all 8 fix seeds (`v4lendPool: []` present on every fix corpus; the pool-counter fixtures in `test-lendfix-a.js` prove it fires when a moment exists). The measured pool is **0 moments: 0 gun, 0 cells, 0 tile, 0 adjacent, across 0 distinct fights** — per-seed `{107081: 0, 107082: 0, 107083: 0, 107084: 0, 107085: 0, 107086: 0, 107087: 0, 107088: 0}`.

This is a finding, not a metric error (prereg: "If the pool is 0, that is a finding"). Guns ARE in the world on this band — 4 searcaster grants per leg, holder-days 87 (arm), 20 armed wave-4+ entries, 449 pool-holder-present ticks, 37 draft misses — but a lendable moment never lines up: a lead going in unarmed-or-empty with a living armed holder (gun + ≥1 cell, not the scholar, health > 20, not sheltered, not resting) standing in earshot at a wave-4+ fight launch. The lend as designed has no pool even with guns in the world. **The next lend re-test prices its participation floor from 0, not from the presence band.** Finding #2628 stays open on the opportunity question; finding #2629 (the sink) is FIXED by this arm — the return is proven, the pool is what is empty.

## Wall numbers (both legs byte-identical — the guardrail)

| | ctl | fix |
|---|---|---|
| survived / 8 | 6 | 6 |
| max wave 5 / 8 | 6 | 6 |
| max wave 4 / 8 | 8 | 8 |
| median days | 150 | 150 |
| standing (per seed) | 150, 199, 350, 350, 400, 450, 515, 635 | identical |
| deaths (sum) | 678 | 678 |
| wave-4+ meetings / engaged / flees | 187 / 156 / 115 | identical |
| lead attributed / flee classified | 187 / 187, 115 / 115 | identical |
| armed entries / armed leads / armed volleys | 20 / 0 / 0 | identical |
| searcaster grants / cell grants | 4 / 0 | identical |
| transfers / vanishes | 0 / 4 | identical |
| `v4lends` / `v4lendPool` rows | 0 / — (no counter) | 0 / 0 |

Per-seed: 107081 150d survived w5 standing 450; 107082 150d survived w5 515; 107083 125d village-lost w5 350; 107084 150d survived w4 **199** (the standing-199 stall, again); 107085 110d village-lost w4 150; 107086 150d survived w5 635; 107087 150d survived w5 400; 107088 150d survived w5 350. National / table / wins: not instrumented by this driver — reported as null, never faked (0 wins both legs; no table instrument).

Fidelity (§14b.4): holder-days 87 > 0 ✓; gun grants 4 (≈6 on the gunrate band — band variance, not the ~1-gun stop condition); `v4lends` empty ✓.

## §9 — adoption repairs (the round timed out before closeout)

The lendfix worker died after the fix sweep (last write 22:30:00Z, registry heartbeat 22:24:58Z, no node processes, no worktree-cwd process) before the analyzer, judge, and writeup. The adoption (Loop A 2015Z) finished the closeout; two repairs were needed, both documented here, neither a re-score:

**Repair 1 — the control leg was 7/8 seeds.** The worker's ctl sweep ran 107081–107087 (22:02–22:17Z) and never ran 107088; the guardrail fails a missing seed outright (`seed missing in ctl`). A single-seed repair run reproduced the 107088 corpus but reset the process-persistent `seq` counter — the fix leg's 107088 runs as the 8th seed in its process (seq 12959–13735) while a fresh single-seed process restarts at 1 (seq 1–777): 925 seq-only diffs, all other fields identical. The adoption re-ran the FULL 8-seed ctl leg in one process into a temp dir (`lendfix-a-sweep-ctl-rerun.log`, exit 0): the 7 regenerated files are **byte-identical to the worker's** (md5 OK 7/7), and the regenerated 107088 carries the fix leg's exact seqs (12959, 12960, 12965, … 13735). The regenerated 107088 was copied into the real ctl dir; the temp dir was removed. `seq` is a process-global write counter shared across recorder rows (dawnbidDeparts, v4tickPresence, …), not a per-seed field — a single-seed re-run of a paired leg is not a faithful reproduction; a paired leg must be re-run whole.

**Repair 2 — the guardrail as written could never pass a two-driver pair.** The as-written analyzer run failed bar 3 on exactly one field per seed: `grantEvents[0].frame` — `"at Game.alienLootGrant (…/scripts/lend-driver-a.js:1268:25)"` vs `"…/scripts/lendfix-driver-a.js:1330:25"`. The same class hides in `v4seeds[].caller`. Both are stack-frame strings captured by the wraps that embed the DRIVER's own file:line — the two legs run different driver files, so those strings differ by construction and record the instrument's identity, not the game. Instrument fix in `firstDiff` (`scripts/analyze-lendfix-a.js`): normalize the driver `file:line:col` out of string comparisons before comparing; any other difference in the same string still fails. Selftest 67 → 69 with two new cases (frame/caller-only difference → identical; a real difference inside a frame string → still caught). The original failed output is preserved here, not hidden: `identical: false, seeds 8, ctlFiles 8, fixFiles 8`, diffs `seed 1070xx.grantEvents[0].frame` on all 8 seeds. After the fix, the corrected analyzer re-run passes the guardrail (identical, 0 diffs) and judges GO.

**Proofs re-run on the adoption tip** (after the analyzer fix, before commit): `test-lendfix-a.js` 42/42, `test-lend-a.js` 41/41, `test-gunrate-a.js` 39/39, `test-cellgate-a.js` 12/12, analyzer `--selftest` 69/69.

## Disposition

GO per the frozen ladder → the fix + counter land env-gated OFF (LEND/GUNRATE/CELLGATE unset = the old game; the dormant code changes nothing, proven by the guardrail). No lend re-test, no switch-on. The next arm on this chain prices the lend's participation floor from the measured 0-moment pool — and must first answer why holders never stand in earshot of an unarmed lead, since the pool is empty while holders exist. Findings #2629 (FIXED — return proven) and #2628 (OPEN — pool is 0) updated in `sim-findings.md`.
