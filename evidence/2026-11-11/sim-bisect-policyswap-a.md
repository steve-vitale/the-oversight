# sim-bisect-policyswap-a — survival-collapse bisect POLICY-SWAP leg (Loop B)

- **Run:** fleshout-20261111T2317Z, arm sim-bisect-policyswap-a
- **Prereg:** `evidence/2026-11-11/sim-bisect-policyswap-a-prereg.md` (committed `0c41265e9` before any judged sim)
- **Base:** `3f136f07e` game code (journey-landing r126) with the `5157782a4` competent policy swapped in uncommitted (the cross term: old policy + new code)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master, sha256 `311f105b…`) + `scripts/bisect-policyswap-driver-20261111.js`, `scripts/bisect-policyswap-analyze-20261111.js`, `scripts/test-bisect-policyswap-a.js` (committed `0ee2a0d3c`, **50/50 green**)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom, survivalcontrol, anchor-a, anchor2-a, and merge-a (a control/bisect leg re-runs the same seeds; stated in the prereg), competent as of `5157782a4` verbatim, SINGLE leg, mode `fix` only (the roster-check fix is on this base, verified present at standing.js:233, sha `f8fda4295a99` recorded per seed — the same sha the vetphantom fix leg recorded). In-use policy sha `0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05` recorded per seed — the analyzer confirms all 8 seeds ran on it.
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar: `Game.waveCombatReadiness(w)` reads four named bars from LIVE village state — never a policy lever, never a fake number) and Steve's 2026-11-10 scholar-counts ruling. No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-policyswap-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-policyswap-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The 8 seeds ran one per node process, sequentially, in ~11 min total (46s–2min per seed; survivors take longest). The driver refused the unswapped file live first (exit 2, "Refusing to run unswapped") before the swap was performed — the leg guard was exercised, not just proven. The swap was restored byte-identical afterwards (sha `3c40151e8dd4…` verified, `git status` shows no `scripts/policies` modification). The `safe-commit.sh` index-clobber struck on BOTH commits in this arm (prereg + instrument); repaired both times with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe, verified `git status --short` empty + `git diff HEAD` empty. No work lost.

## Verdict: POLICY_EXONERATED

The analyzer (`scripts/bisect-policyswap-analyze-20261111.js`, exit 0) classifies **2/8 survived** under the prereg decision rule (≤2/8 → POLICY EXONERATED). The old policy on the new code does **not** restore the vetphantom fix leg's 6/8. The garden-appointment reorder is **not** the collapse — the collapse is game-code-only, and the bisect proceeds into game code. Per the prereg this is a verdict, never re-scored — and §2 sharpens it: on 3 of 8 seeds the old policy produces trajectories bit-identical to the new-policy anchor-a runs, so the hunk is a literal no-op on those paths.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → POLICY HUNK IMPLICATED | **not met: 2/8** |
| ≤2/8 survive → POLICY EXONERATED | **MET: 2/8** |
| 3–4/8 → INCONCLUSIVE | not met |

## §1 The swap table — same seeds, old policy, new code, collapse stands

| Seed | Vetphantom fix leg (`5157782a4` code + old policy) | This swap (`3f136f07e` code + old policy) | Anchor-a (`3f136f07e` code + new policy) |
|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4, deaths 109 | **69d village-lost**, standing 199, maxWave 4, deaths 64 | 103d, 165, 4, 87 |
| 190392 | 150d survived, standing 199, maxWave 4, deaths 102 | **126d village-lost**, standing 199, maxWave 4, deaths 73 — **identical to anchor-a** | 126d, 199, 4, 73 |
| 190393 | 150d survived, standing 325, maxWave 5, deaths 66 | **134d village-lost**, standing 199, maxWave 4, deaths 72 | 149d, 199, 4, 80 |
| 190394 | 150d survived, standing 199, maxWave 4, deaths 89 | **91d village-lost**, standing 199, maxWave 4, deaths 80 — **identical to anchor-a** | 91d, 199, 4, 80 |
| 190395 | 109d village-lost, standing 199, maxWave 4, deaths 94 | **118d village-lost**, standing 199, maxWave 4, deaths 59 | 65d, 199, 4, 51 |
| 190396 | 85d village-lost, standing 199, maxWave 4, deaths 81 | **150d SURVIVED**, standing 360, maxWave 5, deaths 98 — **identical to anchor-a** | 150d, 360, 5, 98 |
| 190397 | 150d survived, standing 325, maxWave 5, deaths 88 | **150d SURVIVED**, standing 445, maxWave 5, deaths 93 | 142d, 370, 5, 87 |
| 190398 | 150d survived, standing 375, maxWave 5, deaths 78 | **109d village-lost**, standing 199, maxWave 4, deaths 70 | 103d, 199, 4, 59 |
| **band** | **6/8 survived, median 150d, deaths 707** | **2/8 survived, median 126d, deaths 609** | **1/8, median 126d, deaths 615** |

The swap buys exactly one extra survivor (190397, which dies at 142d under the new policy and survives under the old) and moves individual death days around, but the band outcome barely moves: 2/8 vs 1/8, median 126d on both, deaths 609 vs 615. The old policy does not restore the 6/8 — not even close to the ≥5 threshold.

## §2 Trajectory identity — the hunk rerolls 5/8 seeds and is a no-op on 3/8

A field-by-field comparison of this corpus against the vetphantom fix corpus (`perseed-vetphantom-b/`) and the anchor-a corpus (`perseed-bisect-anchor-a/`), both read-only on master:

| Seed | vs vetphantom | vs anchor-a |
|---|---|---|
| 190391 | different (hash `eb997dcb992f` vs `35a977ec272d`) | different (`fb748d86bb56`) |
| 190392 | different | **daily-hash IDENTICAL (`6f5364d3ebe4`), deaths list identical** |
| 190393 | different | different (`705a31dc1614` vs `b17808e0fb06`) |
| 190394 | different | **daily-hash IDENTICAL (`db911bb5b071`), deaths list identical** |
| 190395 | different | different (`14fa055af3b5` vs `22afa398d394`) |
| 190396 | different | **daily-hash IDENTICAL (`49f54cfe6719`), deaths list identical** |
| 190397 | different | different (`f97ba8d7d457` vs `b54034687698`) |
| 190398 | different | different (`bcc1f69f9a69` vs `5720b0237149`) |

Two findings, both worth stating plainly:

1. **Deterministic chaos is real but small.** On 5/8 seeds the policy hunk rerolls the trajectory — the old policy's different RNG consumption changes what happens downstream, exactly as the prereg hypothesized. The reroll is not nothing: 190397 flips from a 142d death to a 150d survival with standing 445, the highest standing of any post-vetphantom leg. But the reroll does not restore the band: 4 of the 5 rerolled seeds still die, and the band lands at 2/8.
2. **On 3/8 seeds the hunk is a literal no-op.** 190392, 190394, and 190396 produce daily snapshots sha-identical to the new-policy anchor-a runs — same days, same standing, same death lists, same everything. The garden-appointment reorder never manifests on those paths at all: no RNG-order change, no downstream difference. A cause that does nothing on 3/8 seeds and merely reshuffles the other 5 cannot be the collapse. No seed matches the vetphantom trajectory — the old policy does not bring any seed back to its old path.

## §3 Wall numbers — the wall is the anchor-a wall, plus one survivor

| | Vetphantom fix leg | This swap | Anchor-a / survivalcontrol |
|---|---|---|---|
| Survived | 6/8 | **2/8** | 1/8 |
| Median survival | 150d | **126d** | 126d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** | 2/8 |
| Wave-4 unlocks | 8/8 | 8/8 | 8/8 |
| Deaths (band) | 707 | **609** | 615 |
| Standing range | 199–375 | **199–445** | 165–370 |
| Blooded | 5/8 | **2/8 (190393, 190395)** | 1/8 (190398 only) |

The one number that moves in the swap's favor is standing: 190397 ends at 445, above the vetphantom band's own maximum (375). A single seed's prosperity does not move the verdict — the prereg judges survived count, and 2/8 is exoneration — but it is recorded because it shows the post-collapse band still has survivor variance the 8-seed count compresses. Both 1/8 and 2/8 sit in the exonerated band, so no bigger-band re-run is owed for this verdict.

## §4 Death causes — the same combat-heavy profile, one seed at a time

609 deaths, all 8 seeds: villager combat 261, combat 128, expedition 95, the wild 88 — **572/609 (94%) combat / expedition / wild**. Monster 17, the arena 8, ambush 3, a stranger 3, a wound that wouldn't close 2, contest 1, wound_fever 1, Gavel 1, alien 1. Starvation 0, sickness 0, thirst 0. The profile matches anchor-a (585/615 combat/expedition/wild, starvation 0) and the vetphantom leg (662/707). Villages die fighting, not hungry, with the old policy exactly as with the new one. What the policy swap changes is *which* seed dies when, not *how* villages die.

## §5 Veteran bars — the fix holds, the veterans don't (same as anchor-a)

- **Phantom days: 0 on all 8 seeds** (engine ready vs instrument recomputation, every daily snapshot). Shadow old-rule counts also agree everywhere (0 shadow-prevented days). The vetphantom roster-check fix holds on this base with the old policy — the collapse is not the phantom returning. Note the contrast with anchor2-a §5: there the fix did visible work (112 shadow-prevented days on 190394, the old rule counting an off-roster killer). Here it does no visible work, because on these trajectories no off-roster killer exists to exclude — the trajectories differ, and so does the phantom's footprint. The fix is not a no-op in general; it is a no-op on this corpus.
- **First veteran day:** d27–d45 across seeds (190393 d27, 190394 d28, 190395 d34, 190396 d37, 190397 d38, 190398 d39, 190391 d41, 190392 d45) — same range as survivalcontrol (d28–d45), anchor-a, and anchor2-a. Veterans still form on schedule.
- **Living veterans at end:** ready4 0/0/1/0/1/0/1/0, ready5 0/0/1/0/1/0/0/0 across seeds 190391–190398. The two survivors end with their veterans gone (190396: 0/0; 190397: 1/0) — the villages that live to d150 do so without a banked pair, same pattern as anchor-a.
- **Tribute:** ready on 0/8 seeds at end (veterans 0–1 / payable 0, `veterans-short` everywhere). 190393 and 190395 each hold 1 veteran at end — one short of the pair. Same as anchor-a (0/8); unlike anchor2-a (2/8 tribute-ready on the true base).
- **Blooded:** 2/8 (190393, 190395, from the summary JSON) — between anchor-a's 1/8 and the vetphantom leg's 5/8.

The veteran pipeline is intact at the front (first kills land on time) and broken at the back (nobody survives to bank a tribute pair) — on the old policy exactly as on the new one.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

489 captured veteran-filtered lines across all 8 seeds. The capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains — 146 lines, same instrument quirk flagged in survivalcontrol-b §5, anchor-a §6, and anchor2-a §6; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera:

> 🍽️ Kurt leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190391 d5)
> 🛡️ Raj, Meera, Ingrid and Aria met them at the door — 3 put down, 1 driven off. Raj, Meera, Ingrid, Aria are hurt. (190391 d13)
> 💧 A man, maybe 30s, with a scarred cheek returns with water: +3 clean. (190394 d1)
> 👂 "You haven't earned that yet," A man, maybe 30s, with a scarred cheek says. (Trust too low.) (190394 d2)
> 🍲 A woman, maybe 30s, with a burn-scarred forearm came back with an armful of something edible, unprompted. (+100 kcal pantry) (190398 d1)
> 🛡️ A woman, maybe 30s, with a burn-scarred forearm catches you eyeing the bark plates — claw-scored, vine-laced. "...Want to actually SEE one?" They talk you through it — wide strips dried flat, laced overlapping like s… (190397 d1)

And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, or the wave door (0 tribute / 0 table / 0 wave-door mentions in the full vetSays capture — the single "unlock" regex hit is an Elderberry identification line, "Use unlocked: food"). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, anchor-a §6, anchor2-a §6, still open). One mild repetition note, same as anchor2-a §6: the foraging-basket line ("The pantry can't take more — sitting with the elders instead.") recurs verbatim across seeds and villagers — a scripted routine line, not incoherent, but the same sentence wearing different names; it appears on 190391, 190392, 190393, 190395, and 190396 alike. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count on old policy + new code vs vetphantom fix leg 6/8: POLICY_EXONERATED (2/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 2/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften it. The secondaries agree (median 126d vs 150d; deaths 609 vs 707; wave-5 unlocks 2/8 vs 3/8; blooded 2/8 vs 5/8). The one secondary that moves toward the vetphantom leg — 190397's standing 445 — is a single-seed number, not a band number, and the prereg binds the run to the count.
- **What the metric set covered that the brief's framing did not:** the prereg promised a trajectory-identity comparison against both reference corpora, and it delivered the sharpest finding in the run (§2): 3/8 seeds bit-identical to anchor-a. The survived-count rule alone would have exonerated the hunk; the identity comparison shows *why* the exoneration is solid — the hunk does nothing at all on nearly half the band.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds; shadow-prevented 0 — the fix does no visible work on these trajectories). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7, anchor-a §7, and anchor2-a §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg (old policy + old code) vs anchor-a (new policy + new code) on identical seeds, with this arm measuring the cross term (old policy + new code) to split the two. Same standing as survivalcontrol-b §7, anchor-a §7, and anchor2-a §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, and anchor2-a ("recorder-corpus input ... compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward on an exonerated policy confound would be wrong.
- **Proof:** `scripts/test-bisect-policyswap-a.js` 50/50 green before any judged sim (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver policy-swap leg guard live on the real old/new competent.js texts; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8; wrong-policy-sha corpus unclassifiable).

## §8 Follow-up owed — the policy hunk is exonerated; the bisect goes into game code (not this arm)

1. **The policy hunk is exonerated.** Old policy + new code gives 2/8, median 126d — the collapse stands. The garden-appointment reorder (OVE-160, Cursor PR #120) does not explain the 6/8 → 1/8 collapse. It is a live illustration of deterministic chaos (5/8 trajectories rerolled) and of a policy change that is a no-op on 3/8 paths — but it is not a cause.
2. **The collapse is game-code-only.** The bisect's search window stays `5157782a4..3f136f07e` with the policy confound removed. The next bisect step is game code inside that range. The sibling merge-a arm cuts the window at the merge commit `e4dbe581b` — its verdict, whichever way it lands, now reads cleanly: no policy confound needs to be controlled for on either side of the merge.
3. **A control the next arm inherits:** seeds 190392, 190394, and 190396 are policy-insensitive — their trajectories are identical under both competent.js versions. A candidate game-code cause for the collapse should be checked against those seeds first: if a game-code change does not move them either, it is not the cause on those paths; if it moves them, it is a live suspect. Conversely, a candidate that only moves the 5 rerolled seeds is confounded with the policy's chaos and needs the swap leg re-run to separate.
4. **No re-run owed.** 2/8 vs anchor-a's 1/8 is within the exonerated band; a bigger band would sharpen 1-vs-2 but cannot change the verdict class, and the prereg's rule binds the run. The 190397 survivor (standing 445) is noted, not chased.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master, sha256 `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver, survivalcontrol-driver, and bisect-anchor2-driver.
- **Driver:** `scripts/bisect-policyswap-driver-20261111.js` (bisect-anchor2-driver copied with corpus dir `perseed-bisect-policyswap-a/`, RUN `bisect-policyswap-pilot`, arm `bisect-policyswap`, MODE hard-coded `fix`, plus the swap-aware policy leg guard: refuses to run unless the on-disk competent.js sha256 is exactly the old sha `0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05`; standing guard requires the roster-check fix sha `f8fda4295a99`; `policySha` recorded per seed — all 8 seeds `0801abd82e52…`).
- **Analyzer:** `scripts/bisect-policyswap-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-policyswap-a-summary.json`).
- **Proof:** `scripts/test-bisect-policyswap-a.js`, 50/50 green.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-policyswap-a/bisect-policyswap-s19039{1..8}-bisect-policyswap-pilot-fix.json` (8 files). Summary: `evidence/2026-11-11/bisect-policyswap-a-summary.json`.
- **Files in this arm:** prereg (`0c41265e9`), instrument (`0ee2a0d3c`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence + corpus commit pending — coordinator merges).
- **No src/js change by this arm. No game-code change, no committed policy change — [needs-eyes] does not apply.**
- **Backlog:** the survival-collapse question is NARROWED, not answered: the policy confound is removed, the collapse is game-code-only inside `5157782a4..3f136f07e`. Coordinator to queue the game-code bisect arm per §8. New items for sim-findings.md: (a) the vetSays `/elder/` filter matches "Elderberry" (instrument quirk, carried from survivalcontrol-b through anchor2-a — now five arms deep, still un-tightened); (b) the foraging-basket routine line recurs verbatim across seeds and villagers (scripted line, not incoherent, noted in anchor2-a §6 and here).
