# sim-bisect-firstparent-a — first-parent leg, own policy (Loop A)

- **Run:** fleshout-20261112T0332Z, arm sim-bisect-firstparent-a
- **Prereg:** `evidence/2026-11-11/sim-bisect-firstparent-a-prereg.md` (committed `b69991084` before any judged band sim)
- **Base:** the reconcile merge's first parent `203a32775` ("sim-wave5kill-a: blooded damage/survivability lever for wave-5 kills", 2026-11-10 11:37:12 UTC), with the r131 vetphantom roster-check fix swapped into `src/js/standing.js` and `203a32775`'s OWN `scripts/policies/competent.js` (`a7ff5c516440`)
- **Verdict: INCONCLUSIVE — survived 4/8** (pre-registered rule: ≥5/8 = FIRSTPARENT_SURVIVES, ≤2/8 = FIRSTPARENT_COLLAPSES, 3–4/8 = INCONCLUSIVE). The rule binds; 4/8 is reported as-is, not re-judged.
- **Instrument / driver / analyzer / proof:** `scripts/bisect-firstparent-driver-20261111.js`, `scripts/bisect-firstparent-analyze-20261111.js`, `scripts/test-bisect-firstparent-a.js` (committed `a5a1cc37a`, proof 60/60 green on the branch, re-run green after restore — see §9)
- **Corpus:** `evidence/2026-11-11/perseed-bisect-firstparent-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-firstparent-a-summary.json`
- **Run notes (infrastructure):** the host write flap (EPERM waves) was quiet during the band — checkout, fix-swap, all 8 seeds, and restore each landed on attempt 1. Heartbeat current at band end (registry `heartbeat_at` 2026-11-12T05:02:19Z). The guard fired live before the swap (exit 2, unswapped standing.js refused). Full band ran in one driver invocation, ~8 min, 0 instrument errors.

## §1 Band table — first parent vs the four reference legs

Seeds 190391–190398, horizon 150d, competent policy throughout. `days / end / standing / deaths`.

| seed | firstparent `203a32775` + fix, own policy | vetphantom fix leg `5157782a4` | merge-cut `e4dbe581b` | policyswap `3f136f07e` + `5157782a4` policy | anchor `3f136f07e` |
|---|---|---|---|---|---|
| 190391 | 86d lost / 199 / 88 | 150d surv / 199 / 109 | 103d lost / 165 / 87 | 69d lost / 199 / 64 | 103d lost / 165 / 87 |
| 190392 | 144d lost / 199 / 77 | 150d surv / 199 / 102 | 150d surv / 199 / 70 | 126d lost / 199 / 73 | 126d lost / 199 / 73 |
| 190393 | 150d surv / 325 / 66 | 150d surv / 325 / 66 | 115d lost / 395 / 76 | 134d lost / 199 / 72 | 149d lost / 199 / 80 |
| 190394 | 43d lost / 150 / 52 | 150d surv / 199 / 89 | 140d lost / 199 / 100 | 91d lost / 199 / 80 | 91d lost / 199 / 80 |
| 190395 | 150d surv / 199 / 96 | 109d lost / 199 / 94 | 76d lost / 199 / 53 | 118d lost / 199 / 59 | 65d lost / 199 / 51 |
| 190396 | 87d lost / 199 / 80 | 85d lost / 199 / 81 | 126d lost / 199 / 93 | 150d surv / 360 / 98 | 150d surv / 360 / 98 |
| 190397 | 150d surv / 275 / 74 | 150d surv / 325 / 88 | 115d lost / 199 / 72 | 150d surv / 445 / 93 | 142d lost / 370 / 87 |
| 190398 | 150d surv / 199 / 96 | 150d surv / 375 / 78 | 136d lost / 265 / 70 | 109d lost / 199 / 70 | 103d lost / 199 / 59 |
| **survived** | **4/8** | **6/8** | **1/8** | **2/8** | **1/8** |
| **median** | **150d** | **150d** | **126d** | **126d** | **126d** |
| **deaths** | **629** | **707** | **621** | **609** | **615** |
| **wave 5** | **2/8** | **3/8** | **2/8** | **2/8** | **2/8** |
| **blooded** | **4/8** | **5/8** | **1/8** | **2/8** | **1/8** |
| **tribute ready** | **1/8** | **2/8** | **0/8** | **0/8** | **0/8** |

The first parent sits exactly between the protected base and the collapsed merge: it survives twice as often as the merge cut (4/8 vs 1/8) and two-thirds as often as the vetphantom fix leg (4/8 vs 6/8). Two seeds flip UP against the vetphantom leg (190395 survives here, lost there at 109d) and two flip DOWN (190391 lost here at 86d, survived there; 190392 lost here at 144d, survived there). No seed is saved or doomed uniformly — the first parent is a different village each time, not a uniformly weaker base.

## §2 Trajectory identity — daily-hash + death-list comparison

Daily-hash = sha256 of the canonical daily-snapshot array (first 12 hex); deaths-hash = sha256 of the deaths list. Control seeds 190392/190394/190396 checked FIRST, per prereg.

| seed | firstparent daily-hash | vs vetphantom | vs merge | vs policyswap | vs anchor |
|---|---|---|---|---|---|
| 190391 | `29aa143c486d` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190392 | `a63f54b3e4e6` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190393 | `a64e61f39747` | diff / **deaths IDENTICAL (`20d1ac46b4d0`)** | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190394 | `7ba2ab8599f4` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190395 | `840f338eeb9b` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190396 | `109489a4a05b` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190397 | `2c30a4726f92` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |
| 190398 | `886325dd834d` | diff / deaths diff | diff / deaths diff | diff / deaths diff | diff / deaths diff |

1. **No seed reproduces any other leg's trajectory on the first parent.** The three policy-insensitive control seeds do NOT carry over: 190392, 190394, and 190396 all take new paths here (144d/43d/87d lost, vs 150d-survived / 150d-survived / 85d-lost on the vetphantom leg). The first parent's own game code — not the policy — reshuffles every seed. The policyswap finding still reproduces where it should: policyswap vs anchor are daily-hash AND deaths-hash identical on all three control seeds (190392 `97691b8334d2`/`e51696f9f763`, 190394 `3ce2d9ad5f28`/`415c29448398`, 190396 `84cb66a0dbbf`/`820f2c43fcf8`), so the control-seed instrument is sound; the first parent simply isn't the same game.
2. **The one near-match is 190393 vs the vetphantom leg: deaths list IDENTICAL** (same 66 deaths, same days, same causes), same 150d survival, same standing 325, same wave-5 unlock — but the daily-hash differs. The first differing daily row is day 64, and the ONLY differing field is `waveKills`: the first-parent village has 29 wave-1 kills to the vetphantom leg's 26 (wave-2/3 identical). Same deaths, same outcome, three extra wave-1 kills by day 64 — the divergence is confined to low-wave kill counts, not to who lives or dies. The first parent can walk the vetphantom leg's exact death path and still survive it.
3. **No seed matches the merge cut either.** The merge's collapse is not already written in the first parent's trajectories: 190395 survives 150d here where the merge dies at 76d; 190397 survives here where the merge dies at 115d. Whatever kills the merge's villages is not doing the same work on the first parent's code.

## §3 Wall numbers

- Wins 0, national 0, table 0 — no village wins, reaches national, or opens the full seat on any leg in this band.
- Wave 5 unlocked 2/8 (190393, 190397); wave 4 reached 8/8.
- Median survival 150d (days sorted: 43, 86, 87, 144, 150, 150, 150, 150; upper median 150d).
- Deaths 629 (88 + 77 + 66 + 52 + 96 + 80 + 74 + 96).
- Standing 150–325; scale regional 7/8, village 1/8 (190394, dead d43).
- End pantry: 8200 kcal (190393), 5798 kcal (190397), 0 everywhere else — the two wave-5 survivors are the only villages that end with food in the pantry.
- Blooded 4/8 (190391, 190393, 190397, 190398) — the highest blooded count of any bisect leg so far (merge 1/8, policyswap 2/8, anchor 1/8; vetphantom 5/8). The first parent bloods villages more readily than the merge does, even while losing half the band.

## §4 Death causes

629 deaths: villager combat 267 (42%), combat 130 (21%), expedition 126 (20%), the wild 74 (12%), monster 13, Spool 2, a stranger 2, the arena 2, ambush 3, contest 3, a wound that wouldn't close 3, the night 1, Big-Eyes 1, alien 1, **starvation 1**. Combat + expedition + the wild = 597/629 (95%) — the same shape as every other leg (merge 621, policyswap 609, anchor 615, all ~95% combat/expedition/wild). The one new case: a single starvation death, seed 190398 day 124, a villager (the player character's party) starving in a village that survived to 150d — the only starvation death across all five legs' bands. One case is a watch item, not a pattern.

## §5 Veteran bars — phantom, shadow, and the ladder's scholar gap

Per seed, end-of-run reads. `r4` = readiness(4).veterans (fixed standing.js), `i3` = instrument wave-3 living killers; `r5` = readiness(5).veterans, `l4` = ladder living wave-4 veterans (the first parent's OLD inline ladder rule), `i4` = instrument wave-4 living killers. Phantom days = daily engine-vs-instrument disagreement; shadow days = daily old-rule-vs-instrument disagreement (the fix's prevented phantoms).

| seed | end r4/i3 | end r5/l4/i4 | agree w4/w5 | phantom d w4/w5 | shadow d w4/w5 | first vet day | first r4 day | first r5 day | blooded | tribute |
|---|---|---|---|---|---|---|---|---|---|---|
| 190391 | 1/1 | 1/0/1 | Y/N | 0/0 | 0/0 | 31 | 31 | — | true | 0/2 |
| 190392 | 0/0 | 0/0/0 | Y/Y | 0/0 | 0/0 | 37 | 37 | — | false | 0/2 |
| 190393 | 3/3 | 2/1/2 | Y/N | 0/0 | 0/0 | 29 | 29 | 72 | true | 1/2 |
| 190394 | 0/0 | 0/0/0 | Y/Y | 0/0 | 5/0 | 28 | 28 | — | false | 0/2 |
| 190395 | 1/1 | 0/0/0 | Y/Y | 0/0 | 0/0 | 37 | 37 | — | false | 0/2 |
| 190396 | 0/0 | 0/0/0 | Y/Y | 0/0 | 0/0 | 34 | 34 | — | false | 0/2 |
| 190397 | 4/4 | 2/2/2 | Y/Y | 0/0 | 0/0 | 45 | 45 | 104 | true | 2/2 ready |
| 190398 | 2/2 | 1/0/1 | Y/N | 0/0 | 0/0 | 32 | 32 | — | true | 0/2 |

1. **The r131 fix holds on the first parent: 0 phantom days on all 8 seeds.** Readiness(4/5) agrees with the instrument's living-killer counts on every daily snapshot of every seed (w4 agreement 8/8 at end of run). The roster check does its job on 203a32775's code exactly as it does on 5157782a4's.
2. **Shadow-prevented: 5 rows on 190394 only (days 40–43).** The old rule kept counting a dead wave-3 killer for the village's last 4 days; the fixed readiness tracked the instrument exactly (2, 1, 1, 0) and prevented all 5. This is the same seed — and the same villager — as vetphantom-b's phantom seed: Leo (gen_vvjo0p4) makes the identical three wave-3 kills (d28 The Callback, wild, trick `farewell`; d36 The Terms of Service, agency; d38 Ad Break, wild, trick `look_away,look_away`) and dies d40 "combat". On the vetphantom control leg the village survived 150 days and the phantom lived 112 days; on the first parent the village dies d43, so the ghost only gets 4 days. Same arc, shorter village.
3. **The first parent's ladder does NOT count the scholar — and it costs a tribute.** On 190391, 190393, and 190398 the ladder undercounts living wave-4 veterans by exactly 1 (`l4` = `i4` − 1) because the wave-4 killer is the scholar and the old inline rule (`vp && !vp.dead`, scholar never counted) excludes them. The cross-leg check is decisive: the ladder gap is 0 on EVERY other leg on EVERY seed — 5157782a4, the merge, the policyswap base, and the anchor all count the scholar. So the scholar-count fix sits in `203a32775..5157782a4` or on the origin side — NOT in the first parent. The cost is concrete: on 190393 the village has 2 living wave-4 veterans by the instrument's count but the tribute reads 1/2, veterans-short. Had the ladder counted the scholar, 190393's tribute would read ready — the leg would show 2/8 tribute-ready instead of 1/8. (Documented, not fixed: this arm is instrument-only; the ladder is 203a32775's own code, and the fix belongs to whichever leg bisects the 205-commit range.)
4. **First veterans come early and then die.** First veteran day 28–45 on every seed; first ready-4 day equals first veteran day everywhere (the bar needs only 1). But only 190393 and 190397 ever reach ready-5 (d72, d104). 190392 makes veterans from d37 and ends with 0 living; 190396 makes them from d34 and ends with 0 living. The binding failure on this leg is keeping veterans alive, not making them.
5. **Tribute ready 1/8** (190397, 2/2, the only seed where the ladder and the instrument agree with 2 living wave-4 veterans). 190393 would be the second, but for the scholar gap (§5.3).

## §6 Sense test — what the villages actually say

405 vetSays lines across the band (33 + 36 + 155 + 16 + 39 + 16 + 74 + 36). Read, not just counted.

- **Tribute: 0 mentions. Table: 0. Wave 5: 0. Seat: 0.** On all 8 seeds. The tribute is still voiceless — no village ever talks about sending veterans to the table, even 190397, whose tribute IS ready. The one tribute-ready village in the band never says the word.
- **Feast: 1 mention per seed on 7 seeds (0 on 190394)** — but every one is the same System ARC IV announcement, not a village feast: *"◈ ARC IV — THE INEFFICIENCY. SYSTEM: 'ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output… The thing they laughed at — needing to EAT — is the engine.'"* (d48–d73). The village feast as an event is still unvoiced; the only "feast" word is a System arc about feasted buffs.
- **The endgame IS voiced, through the Mirror Draft.** 7/8 seeds hear it (all but 190394, dead d43): *"📺 'But finales — FINALES need a LEGEND, sweetheart. More STANDING — blood, bonds, or bread — and look the Mirror Draft in the eye. The producers are WAITING.'"* (190391 d49, 190392 d74, 190393 d60, 190395 d58, 190396 d48, 190397 d64, 190398 d64). The table's absence is named by the System even when no village reaches it.
- **Veteran kills are celebrated on camera, every seed, d28–d149.** The formula never varies: *"📺 SYSTEM: 'Oh — OH. Everybody saw that, right? Kurt just put down Ad Break... on CAMERA. That's a veteran kill, folks. REMEMBER the name.'"* (190391 d31; the same frame names Ingrid d35, Raj d36, Leo d49, Javier d37/d40/d49/d58, Bessie d28, Dale d28/d31, Priya d45, Sofia d59/d64, Boris d32, Amine d129/d137.) The village hears every veteran kill. It hears nothing about the killers' deaths.
- **Blooded is announced when it lands.** 190393, the strongest village: *"Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.)"* (d80, d100 ×2, d117). No other seed's transcript carries the line.
- **Veteran monsters warn before they kill.** *"⚠ This one is different — old, patient, unhurried — it has seen your kind before. A Elder veteran."* (190391 d24, 190395 d65); *"⚠ This one is different — bigger, and it didn't come alone. A Pack-leader veteran."* (190391 d43, d73); *"⚠ This one is different — scarred, braced, waiting for your opening. A Scarred veteran."* (190392 d77, d84).
- **The `/elder/` filter noise is concentrated on one seed.** 190393 carries 137 elder lines, 121 of them "Elderberry" (the known instrument quirk — the filter matches the foraged item, not elders); the other 7 seeds have 1–17 elder lines and 0 Elderberry. The quirk inflates one long-lived seed's count, not the band's.
- **The story in miniature — Javier, 190392.** Four veteran kills on camera (Chorus Line d37, The Callback d40, Spool d49, The Redactor d58), the village hears his name four times — and the village ends d144 with ZERO living veterans. The killers are celebrated and then die unremarked, and the village that heard them is lost. Leo's arc on 190394 is the same shape compressed: three kills, dead d40, village dead d43.

## §7 Metric review

The pre-registered decision rule binds and the run is reported under it: **4/8 = INCONCLUSIVE, not re-scored.** Two notes for the NEXT run's design, not this run's verdict:

1. **The count rule cannot split a split collapse.** 4/8 sits exactly between the merge cut (1/8) and the vetphantom fix leg (6/8), and the per-seed flips run both ways (190395 up, 190391/190392 down). The first parent carries real survival capacity the merge lacks (it walks the vetphantom leg's exact death path on 190393 and survives; it saves 190395 where the vetphantom leg loses it) — but it also loses villages the vetphantom leg saves. A wider band (16 seeds) on the first parent would narrow the gray zone; a bisect step into the 205-commit range would pin the protective commit(s) if the coordinator judges the first parent protective enough to pursue. Either is the coordinator's call; this arm makes no claim beyond INCONCLUSIVE.
2. **The tribute count understates this leg by construction.** The first parent's ladder never counts the scholar (§5.3), so tribute-ready reads 1/8 where the instrument's living-veteran count says 2/8. Any future leg that compares tribute readiness across bases must carry the ladder rule as a named confound, or the first parent will always look one tribute short of what its villages actually earned.

## §8 Follow-up owed

1. **Coordinator's call: next bisect step.** Either (a) bisect the 205-commit range `203a32775..5157782a4` — the scholar-count fix is a known marker inside it (present in 5157782a4, absent in 203a32775), and the range may hold the protective commit(s) the first parent lacks; or (b) step into the origin side (PR #118 villager-brain, #119 phone-refresh, #120 garden, #121 capable-seed) per the prereg's H1 branch. The 4/8 verdict does not select between them; the sibling swap leg (vetphantom-base policy on 203a32775) adds the second first-parent data point before the call is made.
2. **Sibling leg in flight:** `sim-bisect-firstparent-swap-a` (first parent, vetphantom-base policy) was observed active during this run. Its number, combined with this leg's 4/8, is the pair the coordinator compares.
3. **Tribute voiceless, again:** 0 mentions in 405 lines, even on the tribute-ready seed. Carried, not this arm's to build.
4. **Starvation death, 190398 d124:** a single case across five legs' bands. Watch on wider bands; if it recurs, it is a food-economy signal, not a bisect signal.
5. **Water economy:** the cistern-never-fills follow-up from the reconcile probe remains pre-existing on both trees and separate from this bisect; not re-litigated here.
6. **`tbVillagerFalls` vp.dead lie:** still carried (it is what makes the shadow count a dead killer for 5 rows on 190394). The fix prevented the phantom; the lie itself is a wider fix, not this arm's to build.

## §9 Instrument, files, reproducibility

- **Checkout pattern (merge-a replication):** HEAD stayed on branch `sim-bisect-firstparent-a` (`a5a1cc37a`); first-parent game code entered by pathspec checkout `git checkout 203a32775 -- src/js src/data index.html scripts/policies/competent.js`. Three files that do not exist at 203a32775 (`src/js/companion-score.js`, `src/js/person-trust.js`, `src/js/villager-brain.js`) were removed from the worktree for the run (tracked at HEAD; 203a32775's `index.html` does not reference them, so they could not load — removal was belt-and-braces). After the band the worktree matched 203a32775 exactly on the four pathspecs (0 differing files) before the swap, and was restored from HEAD afterwards: `src/js/standing.js` sha back to branch `1eec2c9235a8…`, `scripts/policies/competent.js` back to `3c40151e8dd4…`, `git status` clean except the corpus, `git diff HEAD` empty.
- **Guard live-fire:** the driver run on the unswapped tree exited 2 with `BISECTFIRSTPARENT STOP: mode=fix but standing.js LACKS the roster-check fix` — the guard works on live code, not just in the proof. The fix swap was then verified by sha (`f8fda4295a99…`) before any seed ran, and every per-seed file records `standingSha: f8fda4295a99`, `policySha: a7ff5c516440`, 0 instrument errors.
- **Restore hazard found and fixed in the run:** `git checkout -- <paths>` restores from the INDEX, which the pathspec checkout had set to 203a32775 — the first restore attempt silently left all 37 files at first-parent content. The correct restore is `git checkout HEAD -- <paths>`. Future arms: verify by sha after restore, never by the command's exit code alone.
- **Proof:** `node scripts/test-bisect-firstparent-a.js` — 60/60 green on the branch before the band; re-run green after restore (see below). Guards read from PINNED commits, enforced at the run entry point, wrong-sha swap exits 2.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, and anchor2-a ("recorder-corpus input … compared with sweep-compare tables, never against a run baseline"). Command: `node scripts/telemetry-check.js --baseline evidence/2026-11-11/bisect-merge-a-summary.json --current 'evidence/2026-11-11/perseed-bisect-firstparent-a/*.json' --metrics won,national,table` → exit 2. Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward is the coordinator's call, and this arm makes no claim that needs a new baseline.
- **Files (this arm):** prereg `evidence/2026-11-11/sim-bisect-firstparent-a-prereg.md` (`b69991084`); instrument `scripts/bisect-firstparent-driver-20261111.js`, `scripts/bisect-firstparent-analyze-20261111.js`, `scripts/test-bisect-firstparent-a.js` (`a5a1cc37a`); this evidence file + corpus `evidence/2026-11-11/perseed-bisect-firstparent-a/` (8 files) + summary `evidence/2026-11-11/bisect-firstparent-a-summary.json` (to be committed with this file).
- **Reproducibility:** `DAYS=150 SEEDS=190391,190392,190393,190394,190395,190396,190397,190398 RUN=bisect-firstparent-pilot node scripts/bisect-firstparent-driver-20261111.js` on the checked-out first parent with the fix swapped in; `node scripts/bisect-firstparent-analyze-20261111.js` reproduces the verdict and wall numbers from the corpus alone.
