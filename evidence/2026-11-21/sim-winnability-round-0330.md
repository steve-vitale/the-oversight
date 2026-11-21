# Loop B lever round fleshout-loop-b-20261121T0330Z — ADOPTION CLOSEOUT (axis winnability chain)

- **Run:** `fleshout-loop-b-20261121T0330Z`, axis winnability chain. Base master `a6534c67b` (the 0230Z round record).
- **Adoption:** this record was written by the NEXT Loop B run (`fleshout-loop-b-20261121T0430Z`) as a closeout adoption. The 0330Z coordinator died after merging the expirycount arm and before finishing closeout: its lock (created 2026-11-21T03:41:00Z) sat 107 min old with all three arm heartbeats stale (sim-pinquaddoor-b 04:36:31Z, sim-reseedexpiry-b 04:10:49Z, sim-holderstate-b 03:45:23Z — all >15 min), no live coordinator process, and all three workers already `done` with delivered reports. Stale-lock recovery per the body: lock deleted, claim retired to `.DEAD`, work recovered from the workers' reports + branches, not re-run.
- **Loop A live all run** (0437Z claim, `sim-leadside-a` + `sim-evadebow-a`, axis scale-onramp) — NOT touched. Loop A's 0315Z round landed mid-run as `b5514461c` (rollwall DIAG-GO + holdersupply NO-GO); the reseedexpiry branch had been rebased onto it before its merge, so master moved `a6534c67b` → `b5514461c` → `ffd2b6aa1` with zero file overlap with this round's held arms.

## Outcome: 1 arm LANDED, 2 arms HELD

| Arm | Branch / tip | Verdict | Coordinator call |
|---|---|---|---|
| sim-expirycount-b | (merged) `ffd2b6aa1` | GO (combined) | **LAND** — merged by the dead coordinator before it died; verified by ancestry below |
| sim-dmgpin-b | sim-pinquaddoor-b `191d57fbb` | NO-GO, METRIC-BROKEN + B1 miss | **HOLD** |
| sim-holderstate-b | sim-holderstate-b `d445bde4f` | DIAG-GO, mechanism DENIED | **HOLD** — proof red on the rebased tip (30/31) |

## Arm 1 — sim-expirycount-b: LANDED (finding #2626 / #2633)

The analyzer fix + pooled re-judgment arm. Its commits `0e1d24916` (fix) + `ffd2b6aa1` (evidence) are ancestors of master — verified with `git merge-base --is-ancestor` on both — and master HEAD **is** `ffd2b6aa1`, so the ff-merge of `sim-reseedexpiry-b` is on master. The evidence commit message records "coordinator call LAND": the 0330Z coordinator made the call and merged, then died before the rest of closeout. Nothing left to merge for this arm; the branch was released as done-merged and deleted during this adoption (tree removed, branch deleted, registry `done-merged`).

What landed with it (the whole `sim-reseedexpiry-b` chain, `b5514461c..ffd2b6aa1`, 16 files, 9340 insertions): the #2626 re-seed lever + expiry instrument + fireside beat (#2632, commit `9145db1ef`) + the #2633 analyzer fix (`0e1d24916`). Its own `src/js` delta: `win-plan.js` +424, `villager-brain.js` +18, `fieldFights.js` +13.

Judged result (from `evidence/2026-11-21/sim-expirycount-b.md`, pooled, no new sims): under the re-derived 14-day bar, re-seeded within 14d **4/5 = 0.800** (bar ≥ 2/3, n ≥ 3 floor met), fought again launch-based 4/5, post-expiry targetless launches 0, dead-target launches **0/104** across all five armed legs, guardrail 4/4. The 7-day share (2/5) and encounter-based fight share (0/5) stay demoted secondaries by the re-derivation — they measure rumor restock speed and the fight funnel, not the re-seed.

**Findings closed by this landing: #2626 FIXED** (dissolved plan re-launches targetless — the combined fix is on master, judged GO), **#2632 FIXED** (expired-plan re-seed launch beat — built, proven 30/30, observed live, landed `9145db1ef`), **#2633 FIXED** (expiry analyzer companion-out blind spot — fixed in code, selftest 69/69, landed `0e1d24916`). The findings file was updated in this adoption (marker flipped to `[fixed]` + landing UPDATE on each line). Note: the findings line for #2626 cited tip `96e0677cf` — that was the worker's evidence commit on the branch; the landed evidence commit is `ffd2b6aa1` (same message, recreated when the coordinator rebased the branch onto `b5514461c`).

## Arm 2 — sim-dmgpin-b: NO-GO, HELD (findings #2605 / #2619)

Branch `sim-pinquaddoor-b`, tip `191d57fbb` (evidence commit, 24 files incl. corpora + panel). Verified on the branch; NOT on master. The lever commit `86e96cb38` (DMGPIN x2 coordinated strikes, flag-gated OFF) + prereg `24bfe2506` + timestamp correction `1ae08ee3f` are all on the branch. Worktree clean.

- **P1 MISS (metric-broken):** 0 as frozen — the armed leg HAS a fresh door kill (106722 d115 network_note, 5 rounds, 1,301 dealt) but its `mHpStart` is null; the recorder nulls `mHpStart` on every `vKill` row by design (`recoverMHpStart`, driver line 554 — the killing blow may overkill). No kill row on any band can ever carry `mHpStart ≥ 500`. The kill's entry HP is proven 1,275 by the dealt bound (R1 mHpStart 1,240 post-volley + 35) and by the parallel control fight — diagnostic only, verdict stands on the frozen bar.
- **P2 PASS decisively:** mean door damage 112.4 → **216.8/round** (bar ≥ 111). The 9-round control flee becomes a 5-round armed kill on the same fight (same seed/day/monster/entry HP).
- **B1 MISS:** armed fought-subset ally3Vid rate **5/12 = 41.7%** vs the 50% bar; control 7/15 = 46.7%, also below — a band/pin property, not a DMGPIN regression. One more armed row (6/12) would pass.
- B2, B3(a), B4, M5, M1–M3 all pass. Panel `review_required`, no `regression_signal`. Telemetry: exit-2 designed recorder-corpus refusal; baseline NOT rolled.
- **Wall (8 seeds, 150d, both legs):** wins 0, national 0, table 0, wave-5 3/8 both, survived 3/8 both, median survival 146d both, deaths 625 → 612 (−2.1%, all 13 on seed 106722 — the door kill's seed). Standing-199 stall 4/8 on both legs. Death causes: combat in its three named forms ~81%; starvation 9/1,237 (0.7%).
- **The next wall is survival rounds, not damage:** the armed strike death (137/round doubled, fighter dead in round 3 against 1,114 HP) and the two armed flee doors (235/round for four rounds, fighter's HP ending the fight) — doubled damage converts the fights the party survives, and nothing converts the fights it does not survive.

**Coordinator call: HOLD, not merged.** Verdict NO-GO as frozen; the branch still carries game-code lever changes (DMGPIN + PINQUAD + ALLYSLOT3 port), flag-gated OFF. #2605 and #2619 stay OPEN. The next run on this question needs a **re-registered P1** (freshness on the dealt bound or the roundsDetail-derived entry HP) and a **re-priced B1** (multi-band control rate, or control-vs-armed non-inferiority like B3(a)) — not another measurement of the same bars — then a 12–16-seed confirm. No confirm was run: the pilot did not GO, so no confirm spend per the frozen rule.

**New findings filed by this adoption (from the arm's §8): #2636** — P1's freshness floor is unmeasurable on kill rows (`recoverMHpStart` nulls `mHpStart` on every `vKill`; use the dealt bound or roundsDetail-derived entry HP); **#2637** — the SEEK side effect does not reproduce on this band (armed pinned fighters seek 0/9 vs reprereg 50.0% and wide 9.1%; the pin's gate effect is unproven until a wider band measures it again).

## Arm 3 — sim-holderstate-b: DIAG-GO, mechanism DENIED, HELD

Branch `sim-holderstate-b`, tip `d445bde4f` (rebased tip `9687c2443` + coordinator addendum commit, this adoption). Verified on the branch; NOT on master. Worktree clean, heartbeat fresh.

- **Verdict DIAG-GO** — all five frozen bars pass on the fresh band 106721–106728 (8 seeds, 150d, recorder ON): completeness (B′-unknown 7 → H-explained 7 → 0 remaining), reproduction (Leg R reproduces the 10 launcheng unknown days exactly), binding gate (`party-no-companion` 55/74 assessed days), instrument validity (proof 31/31, analyzer selftest 54/54, 8/8 files parse, 0 instrument errors), launch sanity (27 wave-4-target launches, 0 with no start call, 0 with no copy link).
- **Mechanism DENIED:** all 7 fresh-band unknown-shape days are `hs-gate-pick` — the holder was home at the Haven, reached and re-picked 1–3 times, each pick hitting a hard gate (almost always hunger/EAT). No `hs-engaged-skip`, `hs-away-skip`, `hs-off-haven-skip`, or `hs-expedition-skip` day exists. There is no skipped-parts mechanism to design around; the lever question moves to the hard gate firing on hunger-driven picks.
- **Band picture:** companion pool 0 eligible in all 36 snapshots (first-fails: selfOrScholar 72, away 47, notRanger 69, trustLow 4). Launches 27 (10 counted + 17 uncounted), firstFights 4.
- **Wall (fresh band):** wins 0, national by scaleRank 0/8, national by standing ≥ 200 4/8, table 0, wave-4 8/8, wave-5 4/8, median survival 127d, survived 2/8, deaths 591, starvation 6, standing-199 stall 2/8. Against launcheng-b the wall is in the same place on a slightly shorter-lived band.
- **Proof on the rebased tip: 30/31 — §1 bid-path leg FAILS.** After the clean rebase onto master `ffd2b6aa1`, `src/js/villager-brain.js` differs between corpus base `1fcd7edba` and HEAD: the PLANRESEED commit-time dead-target check and the RE-SEED LAUNCH BEAT hook, both in the `party_launch` commit path, landed with the reseed combined fix. The check is doing its job — the corpora were recorded under pre-reseed bid-path code. Analyzer selftest 54/54, D1/D2 legs pass; the instrument is sound, the evidence is stale to the new code. (The `PROOF-EXIT:0` in the first re-run was the `tail` pipeline's code, not the test's — the test itself reports `30 passed, 1 failed`, exit 1 on re-run.)
- **Coordinator call: HELD, not merged.** Do not land over a red proof leg. Next run on this question: re-anchor §1 to the post-reseed base AND re-record the fresh band under the new code, then re-judge. Do not re-anchor without re-recording — that would defeat the check. #2605's prerequisite is met in substance (7/7 unknown days closed, mechanism DENIED) but the recorder itself is not on master yet; the launch-engine build still waits on the held branches.

## Wall numbers (this round's judged corpora)

| Corpus | Wins | National (rank) | National (standing ≥200) | Table | Wave 4 | Wave 5 | Median survival | Survived |
|---|---|---|---|---|---|---|---|---|
| dmgpin, 8 seeds × 2 legs, 150d | 0 | 0 | 3/8 both | 0 | 8/8 | 3/8 both | 146d both | 3/8 both |
| holderstate fresh band, 8 seeds, 150d | 0 | 0/8 | 4/8 | 0 | 8/8 | 4/8 | 127d | 2/8 |
| expirycount pooled, 40 armed seeds (no new sims) | 0 | 0 | 3, 2, 5, 3, 4 of 8 per leg | — | 8/8 | 3, 2, 5, 3, 4 of 8 per leg | 151 / 147.5 / 157 / 147.5 / 150.5d | 6, 4, 2, 1, 6 of 8 |

No wins, no national rank, no table anywhere. The wall is unchanged in shape.

## Sense test (from the arm evidence)

The villages read as villages: door defenses with named hurt defenders, System callouts of veteran kills on camera ("Oh — OH. Everybody saw that, right? Nina just put down Chorus Line... on CAMERA"), wave-3 monsters announced as the end of pretending they are animals. The holder stories cohere — Aki, Tariq, and visjoin_125 are not vanishing; they are home, eating, and being gated out of the hunt while their villages fight at the door. The dmgpin kill fight reads as a real four-person party fight (volley softens, door opens with all three companions, BLOODED + coordinated line stack honestly, kill lands on the third ally's strike). The door-line order quirk persists (door lines print 2, 3, 1) — cosmetic, in the ported slot code.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../scale-wall.json --current 'evidence/2026-11-21/perseed-dmgpin-b-armed/*.json'` and the holderstate equivalent → exit 2, the designed recorder-corpus refusal, both corpora. Expirycount: not applicable (no new corpora). Baseline NOT rolled. No LOUD lines from either.

## Infrastructure

- **Write flap, 2026-11-21 ~04:47–04:58 UTC** (holderstate legs): the `tee` to `holderstate-b-legs.log` failed on open (0-byte log kept as evidence) and corpus writes for seeds 106721–106723 exhausted their 120s retry windows and fell back to stdout dumps. Re-ran the three seeds deterministically after the flap cleared — all three corpora landed (2.78MB / 2.32MB / 1.28MB). No data lost. Dmgpin legs quiet; no flap.
- **Registry heartbeat blocked, then flap-refused** (holderstate run): `worktree-heartbeat.sh` first blocked on the registry flock (held by sibling journey-lane processes), then failed with the same write-flap EPERM on the registry temp file. Registry intact.
- **Safe-commit index clobber** hit the dmgpin worker after every commit (lever, prereg, timestamp correction — repaired via `ls-tree -r` + `update-index --index-info` each time, commits verified correct by blob hash) and this adoption's holderstate addendum commit (MM variant, same repair, hash verified). No work lost.
- **No check.js --quick on the merged tip in this adoption** (zero `src/js` delta in the round-record commit; the merged expirycount content's proofs are the arm proofs: expirycount 31/31 + analyzer selftest 69/69 on the branch, re-verified as ancestors of master).
- Held trees left registered with FRESH heartbeats: `sim-pinquaddoor-b` (05:34:49Z), `sim-holderstate-b` (this adoption). `sim-reseedexpiry-b` released as done-merged, tree removed, branch deleted.

## Metric review

- **Dmgpin P1 is unmeasurable as frozen — the bar, not the lever, is broken** (see Arm 2). The next prereg must price freshness on the dealt bound or the roundsDetail-derived entry HP, or teach the recorder to record entry HP on kills. This round does NOT re-score P1 on the dealt bound; the verdict stands on the frozen bar.
- **B1's absolute 50% bar is mis-priced for this band** — both legs sit below it, so the shortfall is a band/pin property. Re-price from a multi-band control rate or carry control-vs-armed non-inferiority.
- **Holderstate §1 is a substrate-identity leg, not a judgment leg** — it correctly went red when master moved the bid-path code under the corpora. The failure is the instrument's staleness detector working, not a verdict change: the DIAG-GO stands on the recorded band, but the branch cannot land until the band is re-recorded on the new code.

## Next blanks, in order (for the 0430Z run)

1. **#2619 — dmgpin re-prereg + confirm:** re-register P1 on the dealt bound, re-price B1, then run the 12–16-seed confirm of DMGPIN on the held `sim-pinquaddoor-b` branch.
2. **Companion-pool diagnosis (holderstate finding):** 0 eligible companions in 36/36 pool snapshots; `party-no-companion` is the binding gate on 55/74 assessed days. Diagnose the first-fails (selfOrScholar 72, away 47, notRanger 69, trustLow 4); build a lever only if a named mechanism emerges.
3. **#2634 — downed companion struck again** ("goes down" a second time; 106705 d144 audit). Small combat/narration fix arm.
4. **#2605 — launch engine still BLOCKED** while `sim-pinquaddoor-b` holds `src/js/villager-brain.js` + `win-plan.js` (verified by diff `a6534c67b..191d57fbb`). The holderstate prerequisite is met in substance, but the recorder is not on master yet.
5. **#2628 / #2590 / #2629 / #2635 — Loop A owns this round, do not duplicate.**

Winnability chain stays **converging (NOT converged)**: the re-seed combined fix is landed and three findings close, but the door still converts rarely (2/35 fought doors cumulative), the damage lever is unjudged on a re-registered bar, the launch engine is still blocked on the held pin branch, and no win, national rank, or table appears on any judged corpus. Claim retired to `.DEAD`; lock deleted. Evidence: arm evidence `evidence/2026-11-21/sim-expirycount-b.md` (master `ffd2b6aa1`) + `evidence/2026-11-21/sim-dmgpin-b.md` (branch `sim-pinquaddoor-b` `191d57fbb`) + `evidence/2026-11-21/sim-holderstate-b.md` (branch `sim-holderstate-b` `d445bde4f`).
