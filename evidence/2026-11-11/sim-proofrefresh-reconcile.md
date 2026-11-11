# sim-proofrefresh-reconcile — measurement proof regenerated on the reconcile tip

## Why
The retained b4 panel (`evidence/2026-11-11/neutral-proofrefresh-b4.json.gz`)
is stale on this tip: the reconciliation merge (`1f289e2c7`, master `b09cf584e`
into `reconcile-divergence`) brought in manifest inputs it never saw
(Cursor's `villager-brain.js`, `person-trust.js`, `companion-score.js`, plus
the Nov 10–11 landings touching `game.js`, `convo-*.js`, `favor-*.js`), and
the re-pin (`ec7b0bae5`, person-trust EAT 59 / FORAGE 2 / HAUL 0) touched the
person-trust baseline. Per the manifest rule a src/js touch at landing
requires a fresh proof.

## Panel
- Command: `node scripts/balance-panel.js --out .proofrefresh-reconcile-panel --n 16 --days 150`
- Ran 11:35–12:30Z (~55 min) under Loop A + Loop B load; no flap crash, no retry needed.
- Result: `Saved .proofrefresh-reconcile-panel; 64 cases, 0 cached jobs.`
  64 rows, 64 distinct policy/seed combos, `validity.sourcesStable: true`,
  neutrality 4/4 match (capable/risk-aware/socialite/winseek @ seed 7),
  `sourceHeadStart == sourceHeadEnd == ec7b0bae5`.
- Retained panel (byte copy of `.proofrefresh-reconcile-panel/panel.json.gz`):
  `evidence/2026-11-11/neutral-reconcile.json.gz`,
  sha256 `39b5e2826527b0323014fc1e8549028d10a8005d50dfb0bd5495911b302981e6`.
  The `cases/` cache in `.proofrefresh-reconcile-panel/` is NOT committed.

## Proof update
- `node scripts/balance-proof-update.js evidence/2026-11-11/neutral-reconcile.json.gz`
  exit 0; `scripts/balance-proof.json` now points at the new panel with the
  matching panelDigest.

## Test — `scripts/test-proofrefresh-reconcile.js`: 11 passed, 1 failed
- validate passes on the new panel; `test-measurement-proof-update.js` exit 0;
  `test-measurement-workflow.js` 9/9; `validate-ontology.js` 138 systems;
  neutrality 4/4; rows 64/64; neutrality reproduces the b4 panel and the b2
  panel; `sourcesStable` true; stale-input negative checks: the b4 panel AND
  the b2 panel both FAIL `validate()` on this tip with
  "Proof source inputs are not current" (green is not vacuous).
- The 1 failure is `test-measurement-cache-flags.js` 0/4 — adjudicated as the
  known 30s spawn-timeout load artifact (same as r178 gate 2): the test spawns
  `balance-panel.js` three times with `timeout: 30000`, and under the current
  Loop A + Loop B load each spawn exceeds 30s (standalone run took 91.5s of
  three 30s timeouts). Manual replication of all four legs with generous time
  is green: both CLI configs exit 0, 4 jobs / 4 distinct keys, SIMOPT 2+2,
  repeat prints "2 cached jobs". Effective trio: 9/9 + 9/9 + 4/4-manual.

## Verdict
Proof is fresh, current, and neutral on the reconcile tip. Ready for the gate.

## Round 2 — master moved again (r180 src/js touch)
After round 1, master moved b09cf584e → dd28faecc (14 commits: dutyfirst-b,
journey-crisis r180, titanfirst-a, relayfirst-a, kinfirst-b, standfirst-b,
Loop B 1131Z). Merged into the branch as `793f097f3`; the only merge
conflict was `scripts/test-social-r27-recap-repeat-20261019.js` (resolved:
2nd-press check takes r180's case-insensitive reframe pattern, 3rd-press
check keeps HEAD's clearer-exit check — the merged code serves the clearer
exit on press 3; test green on the merged tip). r180 touched
src/js/conversation.js + convo-wants.js (manifest inputs), so the round-1
proof went stale (`validate()` → "Proof source inputs are not current") and
a second regeneration was required.
- Command: `node scripts/balance-panel.js --out .proofrefresh-reconcile-panel-r2 --n 16 --days 150`
- Ran 14:26–15:29Z (~63 min) under heavy load (load avg peaked 21.3); no
  flap crash, no retry needed.
- Result: `Saved .proofrefresh-reconcile-panel-r2; 64 cases, 0 cached jobs.`
  64 rows, 64 distinct combos, `validity.sourcesStable: true`, neutrality
  4/4 match, `sourceHeadStart == sourceHeadEnd == 793f097f3`.
- Retained panel re-pointed (byte copy): `evidence/2026-11-11/neutral-reconcile.json.gz`,
  sha256 `c30bd049b48f9563f17828081a3139e130bd3922f7e557c3a4de6fb81b5a820f`.
- `balance-proof-update.js` exit 0; `scripts/balance-proof.json` re-pointed
  with the matching digest.
- Test `scripts/test-proofrefresh-reconcile.js`: **12 passed, 0 failed** —
  this time including `test-measurement-cache-flags.js` 4/4 (the load had
  cleared enough for its 30s spawns). All other legs green as in round 1;
  stale-input negative checks still fail the b4/b2 panels as required.
- Verdict: proof fresh, current, and neutral on the merge tip 793f097f3.
  Ready for gate #2.

## Round 3 — r131 src/js touch (standing.js)
Master moved again (dd28faecc → 8445ab97f: journey-scale r131 adoption
closeout, phantom-veteran fix touching src/js/standing.js). Merged cleanly
as `94f76882b` (no conflicts). The standing.js touch re-staled the proof
(`validate()` → "Proof source inputs are not current"), so a third
regeneration was required. A runtime restart at ~15:36Z killed the first
r3 panel run at 6 cases; the run was resumed in the same out dir and the 6
cached cases were reused (b4 precedent).
- Command: `node scripts/balance-panel.js --out .proofrefresh-reconcile-panel-r3 --n 16 --days 150`
- Ran 15:31–16:28Z (~57 min incl. the restart resume) under heavy load
  (load avg peaked 21.3, later cleared to 2.3); no flap crash.
- Result: `Saved .proofrefresh-reconcile-panel-r3; 64 cases, 6 cached jobs.`
  64 rows, 64 distinct combos, `validity.sourcesStable: true`, neutrality
  4/4 match, `sourceHeadStart == sourceHeadEnd == 94f76882b`.
- Retained panel re-pointed (byte copy): `evidence/2026-11-11/neutral-reconcile.json.gz`,
  sha256 `c0b5cc839dde6f0e453022412d129e66493d4b87f94d8509770a48d751ee53d3`.
- `balance-proof-update.js` exit 0; digest matches.
- Test `scripts/test-proofrefresh-reconcile.js`: **12 passed, 0 failed**
  (cache-flags 4/4 included). Stale-input negative checks still fail the
  b4/b2 panels as required.
- Verdict: proof fresh, current, and neutral on the merge tip 94f76882b.
  Master moved again during round 3 (488506a47, godpathfirst-a arm —
  scripts/ + evidence/ only, no manifest inputs), so one more
  merge-forward is owed; the proof survives it (validate re-checked after).

## Merge-forward to 965e8d04e (fansfirst-a) + stale MERGE_HEAD
- Master moved twice during round 3 / gate prep: 488506a47 (godpathfirst-a)
  then 965e8d04e (fansfirst-a) — both scripts/ + evidence/ only, no
  manifest inputs, so the r3 proof stays valid (validate PASS re-checked
  after the merge).
- The merge of 965e8d04e first FAILED with "You have not concluded your
  merge (MERGE_HEAD exists)": the 94f76882b merge commit was properly
  created (2 parents, tree correct, 8445ab97f an ancestor of HEAD) but
  its merge-state files (MERGE_HEAD, MERGE_MSG, MERGE_MODE, AUTO_MERGE)
  were left in the worktree gitdir. Verified the merge complete
  (ancestor check + standing.js identical to master's), then removed
  the four stale state files by hand — status returned to clean, no
  reset, no tree/index change. The 965e8d04e merge then auto-committed
  cleanly as `ec5ee00a8` and left NO stale state files behind.
  Lesson: after any merge commit in this worktree, check the gitdir for
  leftover MERGE_* files before the next merge; a leftover MERGE_HEAD
  with a fully-committed merge is safe to remove by hand.
- Gate #2 ran on tip ec5ee00a8: see `sim-reconcile-gate2.md`
  (332 passed, 8 failed in 1240s — GO).
- Master moved AGAIN during gate #2 (7f1c61a6e, journey-succession r181:
  scripts/ + evidence/ only, no manifest inputs) — one final
  merge-forward is owed before the ff-only merge; the proof survives
  it (validate re-checked after).
