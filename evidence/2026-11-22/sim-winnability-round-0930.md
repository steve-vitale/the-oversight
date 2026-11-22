# sim-winnability-round-0930 — Loop B run fleshout-loop-b-20261122T0930Z (axis winnability chain)

**Run:** fleshout-loop-b-20261122T0930Z · **Axis:** winnability chain · **Base at run start:** master `4681e740f`
**Coordinator closeout:** this file. Arm 1 sim-launchfield-b DIAG-GO, HELD unmerged (master moved twice under the landing). Arm 2 sim-hpgate-b NO-GO (METRIC-BROKEN), MERGED `87b2122f3`.

## Run-start closeout (stale-lock recovery)

The previous Loop B run (0530Z) was DEAD: its lock was ~4h old, both its worktrees' heartbeats 59–97 min stale (sim-hypofloor-b 96.8 min, sim-launchfield-b 58.5 min), no live B coordinator process. Deleted the stale lock, retired its flap-emptied empty claim to `.DEAD`. Loop A live on scale-onramp (0815Z claim: gunlife/killrate/crossvoice) — NOT touched. Main tree clean, disk 47%.

The dead 0530Z run left: arm 1 sim-hypofloor-b already LANDED `4681e740f` (NO-GO on F1, env-gated OFF, #2619 open); arm 2 sim-launchfield-b orphaned UNCOMMITTED in its worktree (prereg frozen, driver/analyzer/proof written, no sims run). This run adopted the orphan and took the hypofloor/doorflee2 named next input (HP-gating door parties) as arm 2.

## Arm 1 — sim-launchfield-b: DIAG-GO, HELD (branch `sim-launchfield-b` @ `1602239cb`, NOT merged)

Per-part field-encounter fallback for the Leg S ledger (finding #2605; closes launchstate-b's 2 unexplained parts of 324) + §6 anchor pin (driver records the frozen-base literal, never a run-time merge-base). Instrument only, zero `src/js` changes. Evidence `evidence/2026-11-22/sim-launchfield-b.md`, prereg `evidence/2026-11-22/sim-launchfield-b-prereg.md`.

- **DIAG-GO bar (a)+(b)+(c) — all pass.** (a) Completeness: 0 unknown instance-days (B′+H), **0 unexplained parts of 464** in the Leg S ledger (scored 36, explained 428). (b) Leg R reproduces the 10 launcheng unknown days exactly, 10/10. (c) Instrument validity: 8/8 files parsed, 0 instrument errors, substrate clean on all 8 (policy sha `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`, anchor `4681e740f89a`), 7,534 holder-state rows.
- **Supply, stated plainly:** the fresh band supplied **zero field-encounter parts** — the new fallback fired 0 times on 107321–107328. The verdict rests on the completeness ledger plus the staged §H4 fixture; the old band's 2 closed parts are proof-test evidence only (§3b: new analyzer re-reads the launchstate corpora and closes exactly the 2 parts — 107305 `devon_okafor`/`reunion` + `benoit_lambert`/`eulogy`, d150 p3 — as field-encounter, suburb/vFlee).
- **Proof:** `node scripts/test-launchfield-b.js` **52 passed, 0 failed** (analyzer selftest 71/71). §6 live anchor equals the frozen literal; §6b tripwire fires exit 2 on a non-frozen base. D1/D2 determinism green.
- **Binding gate (reported, not gating):** party-no-companion 36/36 assessed days; pool eligible 0/22 snapshots. Launches: counted 19, wave-4-target 36, uncounted 17, noStartCall 0, noCopyLink 0, firstFights 5.
- **Wall (fresh band 107321–107328):** wins 0/8, national by scaleRank ≥ 2: 0/8, national by standing ≥ 200: 2/8 (107321: 480, 107326: 540, both still regional), table 0/8 (recorder default), wave 4 unlocked 8/8, wave 5 unlocked 2/8, median survival 151d, survived 5/8, deaths 833, starvation deaths 3, standing-199 stall 6/8.
- **Sense-test:** scored day 107321 `app_mgpspkj9857`/`herald` d116 vs skipped day d117 (`hs-gate-pick`) read end to end — recorder matches. 107325 `nikolai_volkov`/`algorithm`: held a plan 60 days, away all 711 sampled parts, fled the algorithm alone twice, died of thirst d131 — the band's `away` dominance has a human cause.
- **Telemetry:** `telemetry-check` returns the designed recorder-corpus refusal (exit 2 by design, same as launchstate). No LOUD lines.

### Why HELD, not merged

Master moved twice under the landing, and the arm's own anchor tripwire (prereg §7, by design) refuses to run on any base but the frozen literal:

1. First move `4681e740f` → `e56ea1383` (Loop A killrate + journey r266; **zero `src/` changes**): the landing worker rebased clean, re-froze the anchor to `e56ea1383` (Amendment 2, commit `1602239cb`), and was about to re-run the band for the identity check.
2. Second move `e56ea1383` → `3d7a25427` (Loop A crossvoice-a landing): **`src/` changed 81 lines**, including `src/js/fieldFights.js` (±35). A re-run on the new tip would no longer be the same game — the task's stop condition, on top of the one-chase bound. The worker stopped, correctly. The re-run never started (the driver also refuses to overwrite existing corpora, exit 3); the judged corpora are hash-verified intact.

**State:** branch `sim-launchfield-b` at `1602239cb`, anchored at `e56ea1383`, worktree clean, heartbeat fresh, registered. The DIAG-GO verdict stands on the Amendment 1 base (`4681e740f`); nothing was re-judged or amended. **Next run's decision:** re-freeze a second time onto `3d7a25427` with a fresh judgment call (src changed, so the identity-check premise no longer holds), or land the arm as-is from its frozen base. A future re-run needs the corpora moved aside or a fresh OUTDIR (driver refuses overwrite). The launch-engine lever itself remains unbuilt, blocked on held `sim-pinquaddoor-b`.

### Adoption addendum — HOLD confirmed empirically (not just on the landing worker's stop condition)

The adoption rebased the branch onto current master `87b2122f3` (clean, 5/5, no conflicts) and re-ran `node scripts/test-launchfield-b.js` on the rebased tip: **50 passed, 2 failed**. The 2 failures are exactly the §1 anchor checks, verified directly: merge-base is `87b2122f3`, not the frozen `e56ea138386d`; and `git diff e56ea1383 HEAD -- src/js` is 2 files, +74/−4 (`fieldFights.js` ±35 crossvoice-a, `villager-agency.js` +43 hpgate-b). The instrument itself still reproduces on the new tip — every live-driver leg passes (150d live run: 2,177 holder-state rows, policy sha still `1884c8852d38`, all 7 flags `1`), and the §6b tripwire fires exactly as designed (`LAUNCHFIELD STOP: merge-base … !== frozen base … — re-freeze, do not amend silently`). Landing would therefore require a re-freeze, and the prereg's own §7 Amendment rule requires `src/` EMPTY between the old and new base to re-freeze — violated by the two src changes above. A band re-run on the new tip would be a NEW judgment on a different game, not a landing of this verdict. The 0330Z adoption's precedent also applies: the §1 anchor test cannot pass on master by construction once merged (launchstate-b's proof is 42/43 on merged master for the same reason). The branch was reset back to `1602239cb` exactly (worktree clean, verified) — the rebase attempt left no trace in the branch. **HOLD stands. Next run's decision is unchanged** (re-freeze with a fresh judgment call as a new arm, or land from the frozen base); the adoption adds one new fact for that call: the instrument reproduces on the current tip, so a re-judge needs only a fresh band + fresh OUTDIR, not an instrument rebuild. Corpora hash-verified intact (8 per-seed JSONs, 2.1–6.0 MB, analysis `verdict: DIAG-GO`, `sUnexplained: 0`, reproduction 10/10 exact).

## Arm 2 — sim-hpgate-b: NO-GO (METRIC-BROKEN), MERGED `87b2122f3`

HP-gate door parties (hypofloor/doorflee2 named next input): a pinned-door party refuses a wave-4+ door when any member (leader + all three pinned allies) is below 25 HP, read live at the door. Lever `src/js/villager-agency.js` +43/−0, env-gated OFF, no default flip. Evidence `evidence/2026-11-22/sim-hpgate-b.md`, prereg `evidence/2026-11-22/sim-hpgate-b-prereg.md`. Band 107351–107358 (fresh), competent verbatim (`1884c8852d38`), 150d, base `4681e740f`.

- **F1 flee (PRIMARY) — PASS:** armed 0/2 (0%) vs control 1/4 (25%), drop **25pp** vs the −20pp bar.
- **P2 door kills — FAIL:** armed fresh kills **2** vs control **3**. **B1 pin delivery — FAIL:** rate 1.0 vs 1.0 passes, but armed rows 2 < 3.
- **P3 damage — PASS:** armed 970 vs control 867.5 dmg/door (1.12×, bar 0.9×). B2 ally3Dealt 702 (max 500), B3a kill rate 5.08% vs 5.42% (−0.34pp), B4 flags/anchor/policySha 8/8 both legs — PASS. M5 panel + cost: `review_required`, no `regression_signal`; starvation 5 vs 5, arm-only 0, median 144d vs 116d (1.24×) — PASS. SUPPLY rule not triggered (control 4 fought, 1 flee).
- **Why METRIC-BROKEN, not CONCEPT-DEAD:** the armed leg fought 2 doors and killed both (100%, both fresh). The missing kill is the d77 algorithm door — healthy party (min 60 HP), never touched by the gate — lost to trajectory divergence after the d57 avoid. P2/B1 are leg-total bars; they cannot distinguish "the gate failed" from "the gate fired once and chaos ate a door," and they punish a door-avoiding lever for its own action. The conversion census was empty (0 matched pairs).
- **The gate fired exactly once** in 8 seeds, on the one sub-floor door in its pool (107352 d57 reunion, ally2 at 23 HP); the flee it was built to avoid did not happen on the armed leg. That one fire rewrote seed 107352's whole future: survived to 150d (control: 81d, village-lost), standing 620 (control: 375), 68 v4 encounters (control: 15).
- **Sense test (the most important finding):** the d57 flee was really the **leader** collapsing — Patrick took every hit, 67→44→22 HP in two rounds ("Patrick sees how this ends — and runs while running still works"), while Victor at 23 HP — the gate's trigger — was never hit. Trigger and mechanism coincided once without being the same thing. **Next-arm input: test a leader-HP (or leader-projection) gate**, which fires on this door and the hypofloor d110 door for the right reason. Instrument gap recorded: the gate's avoid note is live-only (`st.exped[vid].encounters`) and isn't serialized into the corpus — the fire is proven by counter + S9 absence, not a quotable note.
- **Proofs:** M1 allyslot3 18/18, M2 pinquaddoor 35/35, M2w wide 16/16, M3 dmgpin 29/29, M3d doorflee2 49/49, M3e downedtwice 25/25, M3f hypofloor 48/48, M3g hpgate **43/43**, analyzer selftest 21/21 — all green post-freeze, and `test-hpgate-b.js` re-run **43/43 on the rebased tip** `87b2122f3` by the coordinator before merging.
- **Landing:** rebased clean onto master `d2aedf6e6` (Loop A 0815Z adoption record; the only `src/` change across the rebase was crossvoice's narration-only `fieldFights.js` ±35; `villager-agency.js` untouched on master). Merged `--ff-only` as `87b2122f3`. **Correction to the draft's closeout line:** the worktree release was NOT complete when this file was drafted — the branch and the worktree directory still existed. The adoption finished it: tip re-verified as HEAD (`87b2122f3`, ancestor check), registry already `done-merged`, the three key files in the orphaned directory verified byte-identical to HEAD (`sim-hpgate-b.md`, `sim-hpgate-b-prereg.md`, `test-hpgate-b.js` — the directory's `.git` pointer file was missing, flap/admin damage of the same class as the r153 worktree), directory removed by hand, `git worktree prune`, branch deleted (`was 87b2122f3`).
- **Wall (control → armed):** wins 0/8 → 0/8; national by scaleRank ≥ 2: 0/8 → 0/8; by standing ≥ 200: 5/8 → 5/8; table 0/8 → 0/8; wave-4 unlocked 7/8 → 7/8; wave-5 5/8 → 5/8; median survival 116d → 144d; villages lost 6/8 → 5/8; total deaths 836 → 896 (all +60 from 107352's extra days; deaths/100d 92.3 → 91.9); starvation/thirst 5 → 5 (identical per-seed); kill conversion 5.4% → 5.1%; max standing 545 → 620.
- **Telemetry:** `telemetry-check` (with `--allow-recorder-corpus`, its sanctioned path) reports identical LOUD lines on **both** legs: national 12→0, table 16→0, wins 16→0, `won=0/8` — the documented regime artifact (the baseline file itself says not to compare pre-seat substrates against it). **No arm-attributable deviation.**

## Round gate (check.js --quick on merged master)

**Certified: 336 passed, 8 failed in 1173s, 0 attributable** — gate started 2026-11-22T12:00:30Z on HEAD `87b2122f3` (hpgate merge tip), run serialized (waited out the r267 endgame and r250 scale gates; log `hidden_files/check-quick-0930Z-round.log`, gate-exit 1 from the 8 failures). The 8 failures, adjudicated:

- Standing set (5): measurement-proof staleness pair — `test-measurement-proof-update.js` ("Proof source inputs are not current") + `test-measurement-workflow.js` ("retained neutrality proof covers the current Game/controller/harness inputs"); phone-frame stale receipt — `test-phone-frame-proof.js`; deed-attainment 120s timeouts under load — `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-attainment.js`. All pre-existing, none touch this round's arms.
- Load flakes (3), all proven green solo after the gate: `test-measurement-cache-flags.js` 4/4, `test-occupation-panels.js` 25/25, `test-trust-observer-neutrality.js` 6/6. All three timed out at 120s inside the gate while the machine was running the r250 gate tail + worktree registrations; each passes alone on the same tip. Same class as the r264 gate-2 flakes.

Nothing in the 8 implicates the hpgate lever (`villager-agency.js`, env-gated OFF) or the launchfield instrument (not merged, no `src/` change). The proof-staleness pair is the owed re-sign round 22; the phone-frame receipt is stale on master, not on this round.

## Wall (this run's judged corpora)

Both arms: wins 0/16, national (scaleRank) 0/16, table 0/16. Launchfield: wave-5 2/8, median 151d. Hpgate: wave-5 5/8 both legs, median 116d → 144d. The binding constraint stays kill conversion (#2619): doors are fought and mostly fled, and the one lever that fired once changed a village's whole future without moving the leg totals.

## Infrastructure

- **VM replaced ~09:31Z**, just after this run started (uptime 10 min at 09:41Z). No restart struck either worker mid-run.
- **Worktree registration wedged ~20 min:** `git worktree add` for sim-hpgate-b ran two slow `git reset --hard` passes under load (first attempt died, script retried internally) before completing; registry lock held throughout, which also stalled the launchfield heartbeat 09:34–10:20Z. Registration eventually completed clean (exit 0).
- **Registry-lock contention** recurred on heartbeat attempts (lock held >120s); retries landed.
- **Safe-commit index clobber** struck all three worker commits (launchfield evidence commit, launchfield re-freeze commit, hpgate commit) — repaired with the documented `ls-tree -r HEAD | update-index --add --index-info` recipe each time; commits verified correct, worktrees clean after.
- **Band sharing note:** band 107321–107328 was verified fresh at the launchfield freeze (~09:14Z) and judged by launchfield-b; Loop A's gunlife-a later used the same band (its prereg, base `67a87d1b5`) and landed on master. Different instruments, different questions — not contamination for either arm — but the band is no longer fresh for any future arm.
- **No write-flap window** hit either arm after the 10:09Z probe (PROBE_OK). The 0530Z run's flap-emptied claim file was the only flap debris this run.

## Findings updated

- #2619 (kill conversion): hpgate NO-GO METRIC-BROKEN — F1 passes, P2/B1 fail on leg totals; next input is a leader-HP / leader-projection gate. Stays OPEN.
- #2605 (launch gate / companion pool): launchfield DIAG-GO — the recorder is now complete (0/464 unexplained parts); the gate is still denied (party-no-companion 36/36 days) and the lever remains unbuilt, blocked on held `sim-pinquaddoor-b`. Stays OPEN as a lever question.

winnability-chain stays converging (NOT converged): the recorder is complete and the HP gate fires correctly once, but kills still don't convert — doors are fought and fled, wins 0 everywhere, national 0 everywhere on the scaleRank definition. The next lever is the leader-HP gate, not another re-registration of the same bars.

## Adoption closeout (timed-out round finished by the adoption coordinator)

- **hpgate release finished:** see the corrected Landing line under Arm 2 — branch deleted, worktree directory removed, registry already `done-merged`.
- **launchfield HOLD confirmed:** see the adoption addendum under Arm 1 — rebase clean, proofs 50/52 on the rebased tip (the 2 failures are the §1 anchor checks, by design), branch restored to `1602239cb`, worktree clean and registered. No merge.
- **Telemetry:** hpgate re-run by the adoption with `--allow-recorder-corpus`: exactly the 3 LOUD regime lines (national 12→0, table 16→0, wins 16→0), same on both legs, baseline NOT rolled. Launchfield: the designed recorder-corpus refusal (exit 2), no LOUD lines, baseline NOT rolled.
- **Gate:** 336/8 in 1173s, 0 attributable (see Round gate above); the 3 load flakes re-proven green solo.
- **Closeout order:** round record committed from worktree `sim-winnability-round-0930`, merged ff-only to master; worktree released + branch deleted; claim file deleted; lock deleted LAST, same-call per-line run_id verification (`fleshout-loop-b-20261122T0930Z`).
- **Infrastructure notes from the adoption:** the adoption worktree registration took 42 min (registry-lock queue behind Loop A's vanishtile registration, whose `git reset --hard` sat in D-state; the reaper was queued behind the same lock). The round gate waited out the r267 + r250 gates and ran clean serialized on the merged tip. No write-flap window hit the adoption (writes verified clear at 10:07Z; flap window 08:49Z cleared ~09:39Z by machine replacement).
