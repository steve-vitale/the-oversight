# sim-winnability-round-2330 — Loop B 2330Z run (axis winnability chain)

## Run

- Loop B run `fleshout-loop-b-20261118T2330Z`, scheduled Wed 2026-11-18 17:30 CST (23:30 UTC). Axis winnability chain.
- **THIS RUN TIMED OUT** at the 7200s execution horizon before closeout. Both arms had finished with verdicts and committed evidence; the coordinator closeout (merge, gate, tracker, claim/lock) was not done.
- **ADOPTION:** verified every claim below from files/git before trusting it. Both arm branches contained only their own arm's work (checked with `git log --not master` + per-commit file stats). Evidence-only landing: the partysize4-confirm-b branch rebased onto master `be0b90b41` clean (4/4 commits) and merged ff-only; the allyslot3-rerun-b evidence was cherry-picked onto a clean branch from master (7 commits: driver, analyzer, analyzer fix, panel builder, prereg, evidence, survey corpus) — the HELD lever commits `41edabbb2` (ALLYSLOT3 slot) and `1eaff1e00` (LAUNCHPARTY sense substrate) were EXCLUDED and verified NOT on master after the merges. The LAUNCHPARTY substrate `f97f61922` is also NOT on master. Master at adoption closeout: `986cc5584`.
- Arms: sim-allyslot3-rerun-b (#2564 join-rule decision: drop target==mid, launch-richer band, floor from measured launch rate) + sim-partysize4-confirm-b (#2565 PARTYSIZE4 turn-on confirm, 12–16 seeds, 4th-member damage share #2567).

## Arm 1 — sim-allyslot3-rerun-b: NO-GO (field-4 3/7 = 0.43 < 0.80)

Evidence: `evidence/2026-11-18/sim-allyslot3-rerun-b.md` (prereg `3efe51d9c` → rebased `d925724c6`; evidence `661cb28cd` → rebased `4677553bf`; survey corpus `041b5be40` → rebased `986cc5584`). Lever HELD on branch `sim-allyslot3-rerun-b` (tip `041b5be40`).

The 3rd-ally slot fires when staged — 3 of 7 chances on the arm leg (band 104720–104727, 8 seeds, 150d, launches 22 ctl / 24 arm, pool floor PASS). But the launch-party sense returns the full trio in only 5 of 10 meetings, so the slot is starved of chances; and two of the four misses are the analyzer's first-match join misattributing meetings when quad launches overlap (a seed holds 3–5 quads at once). Under a fighter-anchored / best-match join the rate is 4/6 = 0.67 — still below the 0.80 bar, so this is a genuine NO-GO, not a metric artifact. The slot's ceiling is ~0.5 until the sense rate rises, regardless of band richness.

- Fielded fights: 104721 d80 eater (nikolai_volkov, 30 dmg), 104721 d98 influencer (gen_dnv7tkn, 51 dmg — off-target, the #2564 case in live play), 104722 d91 spoiler wave 5 (app_mgpspkqo111 joined, 0 dmg in 4 rounds). 4th-member damage share 12.5% across the two damage-dealing fights (81 of 647).
- Cost bars all PASS (starvation 9 vs 8; median survival 137d vs 136d; community loss 603 vs 602).
- Panel (§15): `review_required` — village-deaths regression_watch (+0.125/run, interval crosses zero; analyzer's own community-loss bar passes). Noise, not a lever effect.
- Findings filed: #2570 (first-match join misattributes overlapping quad launches — next run needs a fighter-anchored / best-match join; d117 editor row is the test case), #2571 (launch-party sense returns the full trio only half the time — next arm measures whether the same-expedition tile guard is too strict or expeditions genuinely split). Finding #2566 CLOSED (floor from measured rate works: floor passed with room).
- Kill classification: NO-GO, kind METRIC-BROKEN (join) + SUBSTRATE-MISSING (sense coverage). Not CONCEPT-DEAD. The lever returns to the queue; it is blocked on its sense substrate (finding #2538, HELD NO-GO).

## Arm 2 — sim-partysize4-confirm-b: NO-GO METRIC-BROKEN (arm pool 11 < 12)

Evidence: `evidence/2026-11-18/sim-partysize4-confirm-b.md` (prereg `6de84c101` → rebased `da9a5c22d`; evidence `829e96904` → rebased `b24549ead`; arm corpus `3efad17d6` → rebased `d9a55ed26`). Lever commits already on master, env-gated OFF (`1032897dc` + `a9a4108fe` + `83db8255f`). No game-code change in this arm — measurement confirm only. Branch merged ff-only; branch deleted after merge (fully merged, nothing held on it).

The confirm does NOT deliver a GO for the turn-on decision (#2565) on its frozen terms: the arm leg launched **11** wave-4+ parties against a frozen arm pool floor of **12** — one short. §14 binds: a miss is NO-GO, never re-scored. But the miss is a pool miss, not a mechanism miss: the arm leg's **9 quads were counted 9/9 (ratio 1.00, per-seed exact 16/16)**, control 0 quads, trio accounting exact 16/16 on both legs, every cost bar passes. Mechanism evidence is now **20/20 quads counted** across pilot + confirm (11/11 + 9/9). The coordinator's call is now: re-run on a richer band, or carry the 20/20 mechanism evidence over a one-launch floor miss.

- Band 104730–104745, 16 seeds, 150d. Control 40 launches (7 pairs, 33 trios, 0 quads); arm 11 launches (0 pairs, 2 trios, 9 quads). Quad conversion 9/11 = 0.82 (pilot 11/16 = 0.69). 104732's two arm launches stayed trios — availability-gated, nobody left to fill the fourth seat.
- Panel (§15): `review_required` — community-loss regression_watch (0.375 → 0.5, interval touches 0). Investigated, NOT established as a lever cost: both flips sit on quad seeds (104742, 104744) but the arm villages died with FEWER total deaths and LOWER monster-combat deaths — no Haven-massacre-while-hunters-were-away smoking gun. Flagged and watched.
- Finding #2557 follow-up: the seeding gap REPRODUCES on the rich seeds (arm dawnbidCensus ~1/3 of control on 104733/104742/104744) but no total launch drought follows — the arm leg keeps launching quads after quads on 3 of 4 quad seeds. #2557 stays ANSWERED-as-mixed (answered by the 2030Z rerun); the seeding-gap mechanism is now a named follow-up diagnostic.
- Size-4 damage share still n=0 on both legs — no launched size-4 meeting was joined to a fought encounter. Finding #2559 stands; the fight-ally-cap arm (#2515) still owns that question.
- New findings filed by this arm: wave-4 plans seed but never launch on most seeds (11/16 control villages launch zero wave-4+ parties in 150d while seeding plans freely); LAUNCHSURVIVE instrument bar hard-codes 8 seeds; quad expeditions and Haven defence (the community-loss flips want a Haven-defence check); background exec SIGTERM at ~25 min (chunk sweeps to ≤8 seeds per exec call).

## Wall numbers (pooled)

| | allyslot3 ctl | allyslot3 arm | partysize4 ctl | partysize4 arm |
| --- | --- | --- | --- | --- |
| Wins (full seat) | 0 | 0 | 0 | 0 |
| National scale | 0 | 0 | 0 | 0 |
| Wave 5 reached | 5 | 5 | 7 | 5 |
| Wave 4 reached | 7 | 7 | 16 | 16 |
| Median survival | 136d | 137d | 150d | 148d |
| Survived 150d | 4 | 4 | 10 | 8 |

No village took the full seat or reached national on any leg of either arm. The wall is unchanged in shape: quads form and count exactly, the third ally fields when the sense stages the trio, but the win chain past wave-4 kills still does not move on these bands.

## Gate

**335 passed, 9 failed in 1662s** on the merged tip `986cc5584` (adoption re-run, full log `evidence/2026-11-18/check-quick-round-2330b.log`). The first gate attempt (336/8, piped through `tail`, no full log) straddled a VM replacement (boot `d6d5f07a` → `a41e3c3d` ~02:11Z) and is discarded as suspect; the tally above is the re-run on the new VM with the box quiet at start. **0 attributable** — every failure adjudicated individually:

- `test-measurement-proof-update.js` (exit 1, 3.3s) + `test-measurement-workflow.js` (exit 1, 6.3s) — the standing measurement-proof staleness pair. Confirmed solo: proof-update throws "Proof source inputs are not current" at load; workflow fails "retained neutrality proof covers the current Game/controller/harness inputs". The retained Nov-17 neutrality proof went stale when the Nov-18 partysize4 landing (`a9a4108fe`) moved `villager-brain.js` — pre-existing master debt, not caused by this evidence-only landing (no src change here).
- `test-phone-frame-proof.js` (exit 1, 11.6s) — the standing stale phone-frame receipt. Confirmed solo: 3 passed / 3 failed; the retained receipt predates ~50 changed src files. Pre-existing.
- `test-measurement-cache-flags.js` (exit 1, 76.6s) — load artifact, verified by A/B: solo on a quiet box **4 passed, 0 failed in 47s**.
- `test-trust-observer-neutrality.js` (exit 1, 119.9s) — load artifact, verified solo: **6 passed, 0 failed in 148s**. The test needs ~2.5 min even alone, so under the 4-parallel gate with the 120s cap it trips and surfaces a load-time error. Not an assertion failure.
- Four 120s timeouts (exit null): `test-living-garden-deed-attainment.js` (120.1s), `test-one-person-army-deed-attainment.js` (120.2s), `test-occupation-panels.js` (120.1s), `test-capable-bot-20261014.js` (120.2s) — load artifacts, verified solo on a quiet box: living-garden 8/8 in 2m37s, one-person-army 7/7 in 2m32s, occupation-panels 25/25 in 39s, capable-bot 40/40 in 32s. Note the two deed tests need ~2.5 min even alone — longer than the gate's 120s cap — so they fail in-gate on time alone, not on assertions.
- **Ladder-bundle control: CLEARED, does not fire on this tip** — the Loop A ladderbase fix holds (the 2030Z adoption already removed it from the standing set; this run confirms: no ladder-bundle failure in the 9).
- No cache-flags failure stands after the solo A/B. No failure touches any file this landing added or changed.

## Proofs (on the rebased tips, before merging)

- partysize4-confirm-b: `scripts/test-partysize4-confirm-b.js` 51/51; `scripts/test-partyquads-b.js` 29/29; `scripts/analyze-partysize4-b.js --selftest` 12/12. (test-partysize4-b.js 41/42 on the arm tip — §1 frozen-diff leg fails on master drift only, documented in the evidence, not chased.)
- allyslot3-rerun-b (clean evidence branch): `scripts/analyze-allyslot3-b.js --selftest` 11/11. (The arm's in-run proofs — test-allyslot3-b 18/18, test-partyquads-b 29/29, test-launchparty-sense-a 12/12 — live on the HELD lever branch, not the evidence branch, and were not re-run here; the evidence branch carries no src change, so they are unaffected.)

## Telemetry

`node scripts/telemetry-check.js` refuses recorder-corpus input by design (both arms hit the same refusal: "all rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). The prescribed check does not apply to this instrument; the §15 panel compares + analyzer wall numbers are the scale-wall reporting instead. Baseline NOT rolled.

## Convergence state

**Not converged — both arms NO-GO, both levers HELD / awaiting a coordinator call.** The quad mechanism is now demonstrated on three bands (1735Z: 2/2; rerun: 11/11; confirm: 9/9; 20/20 pilot+confirm) with per-seed exact counting. What remains before the PARTYSIZE4 turn-on is the coordinator's call on the one-launch floor miss (#2565) plus the open follow-ups: the #2557 seeding-gap diagnostic, the #2558 spoken line, the #2515 fight-ally cap, and the Haven-defence check on the community-loss flips. The allyslot3 slot needs its sense substrate (#2538) and a fighter-anchored join (#2570) before any re-run — re-running on a richer band only buys more of the same 0.5 sense rate. No further measurement arm on either lever without a new lever to test (standing rule).

## Landing

Evidence-only, both arms, merged ff-only to master `986cc5584` (partysize4-confirm-b `d9a55ed26`, allyslot3-rerun-evidence `986cc5584`). Lever commits `41edabbb2` + `1eaff1e00` verified NOT on master. Branch sim-partysize4-confirm-b deleted after merge (fully merged). Branch sim-allyslot3-rerun-b HELD at `041b5be40` (evidence) with the lever commits — preserved, not deleted. Claim `fleshout-loop-b-20261118T2330Z.json` retired to .DEAD; lock deleted; main tree clean at closeout.
