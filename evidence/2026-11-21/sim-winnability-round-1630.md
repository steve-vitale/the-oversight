# sim-winnability-round-1630 — Loop B lever round, axis winnability-chain — ADOPTION CLOSEOUT

- Round: `fleshout-loop-b-20261121T1630Z`, axis winnability-chain, base master `c7be183e0`
- Closeout: adoption (the round timed out mid-closeout during the write flap); all three arms finished below. No new round started.
- **No src/js changed on master this round.** All three merges are evidence / instrument only. No game change, no default flip, no version bump, no push (ship loop owns that).
- Master tip after this round: this record's merge (see log); arm merges `c8a2d61fa` (d3refreeze), `3fff9fd62` (dmgpin evidence), `5accf69db` (costbar).

## Arm 1 — sim-d3refreeze-b: NO-GO (LANDED `c8a2d61fa`)

D3 re-freeze + re-judge of the profilegate-confirm B5 clause, no new sims. Proof 28/28.

- Frozen corrected bound (first needWave>=4 pool row): **14/16 CLEAN/IDENTICAL + 2 DRIFT**. The 106751 flag this arm was built to clear IS cleared (bound 74, first divergence 75).
- The two flags are the same class of false positive (the lever acted at mid-day scorings the pool rows never observe): **106759** (bound 97, div 96) and **106764** (bound 64, div 56).
- Verdict: NO-GO under the frozen corrected bound; the confirm verdict stays NO-GO on B5/D3. Instrument verdict, not a lever verdict — the lever passes B1–B4.
- Finding #2639 updated (line 2659). Next blank, in order: the dawnbidScore bound re-freeze + D3 re-run on the same corpora, no new sims.
- Evidence: `evidence/2026-11-21/sim-d3refreeze-b.md`.

## Arm 2 — sim-dmgpin-report-b: GO (evidence LANDED `3fff9fd62`; port HELD)

Re-judge of #2619 / #2636: the damage lever (DMGPIN x2.0 on pinned-quad damage) carried with the pin, via a control-only scout pre-screen + paired re-judge on pin-forming seeds. Frozen prereg `sim-dmgpin-report-b-prereg.md` (base `cb20cd650`, policy `1884c8852d38`).

- **Scout (24 seeds 106809–106832, control-only): SCOUT-GO — 8 designate** (106809, 106812, 106816, 106817, 106820, 106824, 106829, 106830), 13 fought doors. Ran through the write flap: 23 corpora recovered byte-identical from `@@FALLBACK` blocks, 106832's file wrote cleanly. All 24 parse, all anchor to the frozen base.
- **Paired legs (8 designated seeds): every frozen bar passes.** P1: 3 armed FRESH door kills (106816 d146 audit, entry 1,166; 106829 d115 algorithm, entry 1,100; 106830 d97 influencer, entry 858 — all roundsDetail-derived, dealt bound below entry, mHpStartRec agrees exactly). P2: 170.88 dealt/round pooled (control 85.85) — the x2.0 multiplier is legible pair by pair (106809 cancellation 408 → 816 in the same 3 rounds). B1: ally3Vid 11/11 armed vs 13/13 control. B2: armed ally3Dealt total 2,162, max 404. B3a: kill conversion 6.7% → 7.2% (+0.5pp). B4: 0 bad files across 40. M5: panel `review_required`, 0 `regression_signal` (deaths/run 87 → 85.125, deaths/100d 65.21 → 64.59; one `regression_watch` on community loss 0.625 → 0.75 — one extra village lost, recorded not waved away). M6: evidence + panel + sense-test transcript (106816 d146, quoted blow by blow).
- Proofs green before legs: M1 18/18, M2 35/35, M2w 16/16, M3 29/29, M3b 30/30, M3c 16/16. Gate on the ported tree (pre-legs): `check.js --quick` 336 passed, 8 failed — all classified (standing measurement-proof staleness pair, stale phone receipt, two 120s deed-attainment timeouts, three flap-caused EPERM writes); 0 attributable to the port.
- **Verdict GO on the frozen bars — with the honest caveat in the evidence:** the control leg already killed 2 fresh doors, and 8 of 11 armed fought doors still end in flight. Damage doubles; kills move 2 → 3. Damage was never the binding constraint on this band, and doubling it proves it. The next question is the flee/engagement side, not more damage.
- **What ships:** instrument + prereg + evidence + analyses + panel (merged `3fff9fd62`). **What does not ship:** the src/ port (6 files) + instrument scripts stay on branch `sim-dmgpin-report-b` at `c48854921` (HELD, env-gated OFF — same precedent as `sim-pinquaddoor-b`). The DMGPIN default flip is a design call, not this arm's.
- Wall (designated band): wins 0 → 0, national 0 → 0, table 0 → 0, wave-5 3 → 3, survived 3 → 2, median survival 144d → 139d, deaths 696 → 681. Scout wall (24 seeds): wins 0, national 0, table 0, wave-5 7/24, median survival 141d.
- Findings: **#2636 ANSWERED / FIXED** — the re-registered P1 instrument is now kill-judged, not just proof-proven. **#2619 re-judged GO on a pin-forming band, stays OPEN** — the pin delivers (third ally on all 13 control fought doors), but the kill still mostly doesn't happen.
- Evidence: `evidence/2026-11-21/sim-dmgpin-report-b.md` (+ prereg, legs log, analyses, panel, 40 corpora).

## Arm 3 — sim-costbar-b: instrument delivered, COST PASS (LANDED `5accf69db`)

The v2 scalemetric cost bar (finding #2641). Instrument only — no game change, no src/ change. Proof `scripts/test-costbar-b.js` 47/47 PASS (run twice pre-judgment, re-run 47/47 on the rebased tip).

- **The bar corrects the premise it was built on: the headline "+64 expedition deaths" are monster kills, not villagers dead on the road.** Every `cause: 'expedition'` row has `kind: 'monster'` (the `mapmemNoteKill` expedition kill hook); people deaths on the confirm band are 205 → 201 (DOWN).
- Judgment on the profilegate-confirm corpora (16 seeds 106751–106766): B1 median 150.5 → 151d PASS; B3 starvation 10 → 11 PASS; C1 people-death rate 9.24 → 9.95/100d PASS (ratio 1.077, delta +0.71); C2 3 flips / 73 earlier-days PASS; C3 launch-attributed road deaths 27 → 38 (+11), per-launch lethality 0.119 → 0.135 PASS. **Overall: COST PASS.** The real road-death cost is +11 attributed deaths, not +64.
- Wall (judged corpus): national 0/16, table 0/16, wins 0/16, wave-5 6/16 OFF / 5/16 ON, median survival 150.5d OFF / 151d ON.
- Documented, not built: recorder label `cause: 'expedition'` misleads (candidate `expedition-kill`); the §15 panel still mixes death streams (Steve-call to split).
- Finding #2641's premise corrected in the evidence. Evidence: `evidence/2026-11-21/sim-costbar-b.md` (+ prereg, `costbar-b-confirm.json`).

## Telemetry deviation check (coordinator level)

Ran `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current <glob> --metrics national,table,wins --sweep-rows --allow-recorder-corpus` against both dmgpin corpora globs:

- Armed leg (8 seeds): 3 LOUD lines — national 12 → 0, table 16 → 0, wins 16 → 0.
- Scout (24 seeds): same 3 LOUD lines.
- Investigation: these are the SAME 3 lines the 1530Z round got on the profilegate ON corpus — a regime difference between the scale-wall baseline (a scale-run regime where villages reach national/table/wins) and these recorder corpora (0 wins/national/table on every leg, per the arms' own wall numbers). No src/js changed on master this round, so no landing caused them. **Baseline NOT rolled forward.** Recorded as an investigation item, not a regression.

## Gates (round)

| arm | gate / proof | result |
| --- | --- | --- |
| d3refreeze-b | proof 28/28; no full gate (analysis-only re-judge, no code change) | NO-GO 14/16 |
| dmgpin-report-b | `check.js --quick` 336/8 (pre-legs, ported tree; 8 classified, 0 attributable) + proofs M1–M3c green | GO |
| costbar-b | proof 47/47 (×2 pre-judgment, re-run on rebased tip); no full gate (instrument-only, no src/ change) | COST PASS |

## Findings filed / updated this round

- #2639 (D3 bound) — updated by d3refreeze-b (106751 cleared; 106759 + 106764 false positives; next blank dawnbidScore re-freeze).
- #2641 (road-death cost) — premise corrected by costbar-b (+64 expedition deaths are monster kills).
- #2636 (P1 freshness floor) — ANSWERED / FIXED by dmgpin-report-b (kill-judged: 3 fresh door kills, all cross-checks agree).
- #2619 (third ally never reaches a live wave-4+ fight) — re-judged GO on a pin-forming band by dmgpin-report-b; stays OPEN on kill conversion (next question: flee/engagement, not damage).

## Infrastructure notes (this closeout)

- Write flap: active ~18:41–~20:00Z, then a second window ~20:27–~20:35Z after a machine restart (~20:23Z, new boot `f276a0e2`). The adoption's first safe-commit attempt failed on EPERM (including `/tmp` index writes) and printed a false "Committed" with HEAD unmoved — verified by reading HEAD, retried after the clear. `ONTOLOGY.md` truncated to 0 bytes in the dmgpin worktree during the flap — restored byte-identical from HEAD (sha `81f98311…`), never committed.
- Costbar rebase: a stale `rebase-merge` corpse (two 0-byte files from the failed 18:53Z rebase, no picks applied, HEAD untouched) blocked the rebase; `git rebase --abort` could not clear it (missing `onto`); removed the directory per git's own prescription and rebased cleanly.
- Round-record worktree: the full `git worktree add` checked out 107,226 files then failed on "Could not reset index file to revision 'HEAD'" and rolled back; re-added with `--no-checkout` (the record is the worktree's only file).
- Reaper: `worktree-reap.sh` skipped (registry lock held, 4 consecutive skips, ALERT). Holder verified live — two sibling registrations (`sim-tier4access-a`, `sim-doorflee-b`) plus this adoption's orphaned `sim-dmgpin-report-b` heartbeat, which was killed. No dead lock; no recovery taken.
- Held, not merged: branch `sim-dmgpin-report-b` at `c48854921` (port + instrument, env-gated OFF). Merged branches deleted: `sim-costbar-b`, `sim-dmgpin-report-b-evidence`. Worktrees released: `sim-costbar-b`, `sim-dmgpin-report-b`, `sim-winnability-round-1630` (this record's; after merge). Left in place: `sim-dmgpin-scout-b` (the round's read-only scout tree) and `sim-d3refreeze2-b` (arm 1's tree; arm landed).

## Closeout state

Merged `c8a2d61fa` (d3refreeze) + `3fff9fd62` (dmgpin evidence) + `5accf69db` (costbar) + this record; round record `evidence/2026-11-21/sim-winnability-round-1630.md`. Tracker updated (winnability-chain line + review note); findings #2639/#2641/#2636/#2619 updated. Claim deleted; lock deleted.
