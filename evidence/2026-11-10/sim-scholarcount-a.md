# sim-scholarcount-a — run note (Loop A flesh-out; adoption by Lane A r127)

**Arm:** sim-scholarcount-a, run fleshout-loop-b-20261110T1415Z. Branch `sim-scholarcount-a`, base anchor `a80b2d789`. **Ruling:** Steve 2026-11-10 07:39 CST — SCHOLAR COUNTS AS A VILLAGER: the scholar's wave kills count toward the village's living-veteran bar, same as any villager's. The fix: `_ladderLivingVeterans` counts the living scholar (mirrors `standing.js`); readiness return gains additive `payable` (non-scholar veterans); delivery still pays 2 non-scholar veterans and refuses honestly with scholar+1; no price/gate/demand moves. Open item (steve-call, filed in the prereg): what the scholar pays, if anything, when the pair is scholar+1; the refusal wording will read false when scholar+1 stand.

## Prereg bars (binding; full text in sim-scholarcount-a-prereg.md)

- **(a)** Peak living veterans ≥1 on ≥7/8 seeds (control 4/8; predicted 8/8). **(b)** Pooled scholar-veteran days ≥80 (predicted 99). **Guard:** legacy (payable) ever-ready stays 2/8 AND legacy peak per seed identical to control [2,0,0,0,1,1,0,2]; trajectories identical per seed vs control. **Cost bar:** starvation ≤ control+2, median survival ≥0.8× control. GO needs all of them. Band 140201–140208 (deliberate identical-seed reuse vs the vetcount control corpus), plain competent, 150d death-aware.

## Armed-leg results (analyzer `scripts/scholarcount-a-analyze.js`, corpus `evidence/2026-11-10/perseed-scholarcount-a/`)

- **(a) 8/8** — peak living veterans ≥1 on all 8 seeds (new peaks [3,1,1,1,1,1,1,2] per seed: 140201:3, 140202:1, 140203:1, 140204:1, 140205:1, 140206:1, 140207:1, 140208:2). **GO.**
- **(b) 97 pooled scholar-veteran days** (predicted 99). **GO.**
- **Guard HELD:** legacy ever-ready 2/8 (control 2/8); legacy peaks per seed identical [2,0,0,0,1,1,0,2]; trajectories identical 8/8.
- **Cost bar HELD:** starvation 0 vs 0; median survival 125.5d = control 125.5d.
- **Secondaries as predicted:** ever-ready 2/8 (no NEW window — the binding constraint is two killers alive at once, not who counts); ready-days pooled new 38 vs legacy 35 (predicted 38 vs 35 exactly); first-ready days unchanged (d90, d135); wave-5 unlocked 1/8; national/table/wins 0/8.
- **Headline case:** Bridget Crawford (140208) killed THREE wave-4 beasts as scholar (d62, d75, d77) — 87 scholar-veteran days, all counted now; the tribute counter moved where it never had.
- **VERDICT: primary GO | guard HELD | cost bar HELD => GO.**

## Proofs (verified by adopter r127 on the branch, before rebase)

- `scripts/test-scholarcount-a.js`: **16/16 PASS** (all legs; RED before the fix per the commit).
- `scripts/test-capstoneready-b.js`: ALL LEGS PASS (incl. the updated scholar-counts classification leg).
- `scripts/test-vetcount-reconcile-b.js`: ALL LEGS PASS (counter/log agreement untouched).

## Adoption (Lane A r127, this run)

- The arm died before closeout: registry heartbeat 15:48:21Z (~92 min stale at adoption check 17:16Z); last file write 16:17Z (corpus seed 140208); no live processes; no hbloop. No run note existed; this note is the adoption record. Corpus (8 per-seed JSONs) committed here; closeout (rebase onto explicit master, proof re-runs, full gate, measurement refresh, merge, release) is recorded in the r127 run note.

## Metric review

- The prediction was near-exact (97 vs 99 scholar-veteran days; ready-days 38 vs 35 exact; no new window as predicted) — the bars judged what they claimed to judge. No re-scoring: the GO stands as registered.
- The confirm band (140209–140216, prereg) was not run — the arm died before it. It is owed as a follow-up measurement, not a landing blocker: the pilot GO + unit proofs + gate are the landing evidence, and the fix implements a Steve ruling (correctness), not a tuning lever.

## Adoption closeout (Lane A r127, ~18:10Z)

- Rebase onto explicit master `28a3952fd` (r125 adoption, read 17:20:32Z): clean; 4 commits replayed once (tip `5ceed0186`). Proof re-runs on the rebased tree: scholarcount 16/16, capstoneready ALL PASS, vetcount ALL PASS.
- Measurement refresh: neutral panel (seed 7 x 4 policies, 150d) regenerated to `evidence/2026-11-10/neutral-r127scholar.json.gz` (digest `afaa075b...`); `balance-proof-update.js` re-pointed; pair re-run **9/9 + 9/9**.
- Full gate 1 (`check.js --quick`, 728s): **293/7** — THREE NEW failures, all ladder tests pinning the overruled leg-3 rule ("scholar + 1 villager reads NOT-ready"). Diagnosis: stale pins of the pre-ruling behavior, NOT a regression. Fix (commit `a663f3ccf`, adoption): the three tests now assert the ruling — scholar + 1 villager reads READY with veterans 2 / payable 1, delivery still refuses honestly with `veterans-short`. Files: `test-ladder-cashout-20261108.js`, `test-ladder-minting.js`, `test-ladder-bundle-20261108.js`. Each re-run individually green (35/35, 36/36, 79/79).
- Full gate 2 (`check.js --quick`, 926s, on the committed tree incl. test updates): **296 passed, 4 failed** — the standing gate exactly (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20; all pre-existing).
- Merge: `--ff-only` to master (SHA recorded in the r127 run note). Worktree released as done-merged; branch deleted; registry reaped. Rotation 2→3 was advanced by the r125 adoption earlier this run.
