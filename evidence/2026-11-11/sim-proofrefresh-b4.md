# sim-proofrefresh-b4 — measurement-proof refresh, round 4

- **Run:** fleshout-loop-b-20261111T0835Z (adopted from the dead 0630Z run), axis scale-onramp / winnability chain
- **Worktree:** `~/workspace/worktrees/sim-proofrefresh-b4`, branch `sim-proofrefresh-b4`
- **Prereg:** `evidence/2026-11-11/sim-proofrefresh-b4-prereg.md` (binding spec; GO thresholds (a)–(f))
- **Base chain:** original base 6769471ca → rebased 5bb3c595a (zero manifest files touched) → rebased a16ce1cc8 (manifest touch: `src/js/game.js`) → rebased c3d89858 (zero manifest files touched, evidence-only journey-endgame r178)
- **Verdict: GO — all six prereg thresholds (a)–(f) hold on the final tip c3d89858.**

## What was stale, and what this round did

The retained panel (`evidence/2026-11-10/neutral-r172social-panel/panel.json.gz`, pointed at by `scripts/balance-proof.json`) was stale by 9 manifest-file moves since its generation (convo-wants, favor-forage, favor-water, conversation, convo-beats, convo-mood, party-formal, hierarchy, safetynets — see prereg). This round regenerated a fresh 64-case observer-neutral panel on the new tip and re-pointed the proof at it. No source identities rewritten, no unknowns waived, no re-point to an old panel.

## Panel generation (two attempts; the first was superseded by a master move)

- **Attempt r1** (`.proofrefresh-b4-panel/`, base 5bb3c595a): resumed the dead 0630Z run's 20 cached cases, completed all 68 jobs — "Saved .proofrefresh-b4-panel; 64 cases, 59 cached jobs" — and passed every proof leg on that tip (12/12 test legs). Then master moved to a16ce1cc8 touching manifest file `src/js/game.js` (journey-establishment r131), so per the prereg master-move rule the r1 panel is stale and is retained only as a superseded artifact; it was NOT committed as the proof.
- **Attempt r2** (`.proofrefresh-b4-panel-r2/`, base a16ce1cc8): fresh `--out` dir, full regeneration — "Saved .proofrefresh-b4-panel-r2; 64 cases, 33 cached jobs." 64 rows, 64 distinct policy/seed combos, `validity.sourcesStable: true`, sourceHeadStart == sourceHeadEnd == a16ce1cc8. The retained proof file `evidence/2026-11-11/neutral-proofrefresh-b4.json.gz` is the r2 panel (byte copy of `.proofrefresh-b4-panel-r2/panel.json.gz`).
- **Final tip:** master moved again to c3d89858 (journey-endgame r178) while r2 proof legs ran — zero manifest files touched (evidence only) — so per the rule the branch was rebased onto the explicit SHA c3d89858 and all proof legs were re-run there. `balance-proof-update` on the rebased tip returns the identical panelDigest (`3a61a44d…`), confirming the manifest is unchanged across that move.

## EPERM flap (infrastructure, not a verdict failure)

The container write-denial flap hit this run repeatedly; every crash was `Error: EPERM: operation not permitted, write` at `scripts/balance-panel.js:328` while writing a completed case file, leaving a 0-byte `.json.tmp` orphan behind (the known create-succeeds-write-refused flap shape).

- r1: crashed twice (42 cases, then 59), completed on the third restart.
- r2: crashed twice (16 cases, then 33), completed on the third restart.
- Each restart probed a plain write first, removed the orphan `.tmp` files, and re-ran the exact prereg panel command; valid cached cases were reused every time (59 reused in r1, 33 in r2). No case was force-regenerated, no cached case ever threw "Invalid cached case".
- Load average during r2 was 4.7–7.2 (Loop A workers running concurrently), which also slowed case throughput (r2 took ~40 min wall vs ~22 min for r1).
- Registry heartbeat was blocked for ~1.5 h by lock contention (a live Loop A `worktree-register.sh` held `REGISTRY.lock` through a slow `git worktree add`); heartbeat landed 10:09:25Z. The coordinator's own queued heartbeat for this tree was also stuck behind the same lock — not a dead tree, a contended lock.

## Proof legs on the final tip c3d89858 — all GO

| Prereg leg | Result |
|---|---|
| (a) `test-measurement-proof-update.js` exits 0 after `balance-proof-update` | GO — exit 0; `scripts/balance-proof.json` re-points at `evidence/2026-11-11/neutral-proofrefresh-b4.json.gz`, panelDigest `3a61a44df77fb65b226b93610ba00c2da80d2006032ce63c06e1eb94e8d448da` |
| (b) `test-measurement-workflow.js` 9/9 | GO — 9 passed, 0 failed |
| (c) `test-measurement-cache-flags.js` 4/4 | GO — 4 passed, 0 failed |
| (d) Neutrality reproduction vs retained r172social panel (and b2 as second reference) | GO — neutrality tuple identical on all 4 proof cases (capable/risk-aware/socialite/winseek @ seed 7, match, warnings 0); regeneration moved no verdict |
| (e) `scripts/test-proofrefresh-b4.js` (new, 12 legs) | GO — 12 passed, 0 failed: validate passes; trio 9/9+9/9+4/4; ontology green; neutrality match on every proof case; 64 rows / 64 combos; reproduction vs retained + b2; `sourcesStable` true; stale-input negative check — the retained panel AND the b2 panel both FAIL `validate()` on this tip with "Proof source inputs are not current" (green is not vacuous) |
| (f) `scripts/validate-ontology.js` exits 0 | GO — "All 135 systems validated" |

## Scale-wall numbers (from the r2 panel, 64 rows, 150d horizon, 4 policies × 16 seeds)

- **national: 15/64; table: 16/64; wins: 16/64; entered: 16/64; exiled: 0.**
- Per policy: capable won 16/16, table 16/16, national 15/16; risk-aware, socialite, and winseek each 0/16 on all three. The wall is still a policy-shape wall, not a numbers wall: only the capable policy reaches the table at all on this panel.
- Mean survival30 0.516, survival60 0.203; mean living NPCs 7.98; mean village deaths 72.8 per run.
- **Not measured here:** wave 4–5 unlocks and median survival in days are not metrics in the maintenance panel's 23 per-policy metrics, so this round reports no wave-reach or median-survival numbers. (The panel's job is re-proving the instrument, not a balance question.)
- Telemetry check vs `telemetry-baselines/scale-wall.json` (`--metrics national,table,wins,exiled`): **quiet, no large deviations** (aggregate in `evidence/2026-11-11/proofrefresh-b4-telemetry.json`). First run fired a spurious LOUD ("wins disappeared") because the aggregate used the panel's metric id `won` while the baseline reads `wins`; fixed by writing both keys — a key-name mismatch in my aggregate, not a real deviation. The baseline's own regime note applies: it is a winseat-regime baseline and this panel mixes policies; the capable-only 16/16 wins match it exactly.

## Village assessment

This is a measurement-maintenance arm, not a balance arm: no lever was played and no game code changed. The village picture is the panel's: capable-policy villages reach the table and win; the other three policies never do on 150 days. That asymmetry is the standing scale-wall picture, unchanged by this refresh — the refresh only re-proves the instrument that measures it. Blanks filled: the stale proof is current again (9 staling moves absorbed); blanks documented: none new.

## Metric review

- The primary metric (three proof tests + ontology, judged together) judged what it claimed: the proof is current, neutral, and non-vacuous on the final tip. The stale-input negative check (both reference panels fail validate) is what makes the green result trustworthy rather than a tautology.
- Neutrality reproduction found zero deltas: regeneration alone moved no verdict on any proof case, against two reference panels.
- The metric did not judge wave reach or median survival — those are not in the maintenance panel's metric set. If a future round wants wall numbers in days/waves, the panel spec (not this test) needs the new metrics.
- The master-move rule worked as designed twice in one run (r1 superseded, r2 kept across an evidence-only move), but it cost a full second panel generation (~40 min + two EPERM restarts). The churn rate of master this morning (three moves in ~2 h) is the real cost driver for proof-refresh rounds; nothing in this arm can fix that.
- The EPERM flap is the second infrastructure tax on this arm (the 0630Z run died to it too). The resume-from-cache design held up: no completed case was ever lost to a crash.

## Files

- `evidence/2026-11-11/neutral-proofrefresh-b4.json.gz` — the retained r2 panel (64 cases, base a16ce1cc8, re-pointed proof)
- `evidence/2026-11-11/sim-proofrefresh-b4-prereg.md` — binding prereg
- `evidence/2026-11-11/proofrefresh-b4-telemetry.json` — wall aggregates for the telemetry check
- `scripts/test-proofrefresh-b4.js` — 12-leg proof test (12/12)
- `scripts/balance-proof.json` — re-pointed at the new panel
- Superseded r1 working dir `.proofrefresh-b4-panel/` and r2 working dir `.proofrefresh-b4-panel-r2/` (with logs) are NOT committed; they were removed from the worktree after the commit so only committed work remains.
