# sim-survivalcontrol-b — survival-collapse control leg (Loop B)

- **Run:** fleshout-loop-b-20261111T2030Z, arm sim-survivalcontrol-b
- **Prereg:** `evidence/2026-11-11/sim-survivalcontrol-b-prereg.md` (committed `805404e69` before any judged sim)
- **Base:** local master `d33ca69f9` (read fresh from the main tree at run start; master did not move during the run — re-verified `d33ca69f9` before analysis). Sims ran at anchor `b702d603a403` (instrument commit on top of `d33ca69f9`).
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified) + `scripts/survivalcontrol-driver-20261111.js`, `scripts/survivalcontrol-analyze-20261111.js`, `scripts/test-survivalcontrol-b.js` (committed `b702d603a`, **41/41 green**)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as the vetphantom fix leg (a control re-runs the same seeds on new code; not a freshness violation, stated in the prereg), competent verbatim, SINGLE leg on current master (fix-only; the vetphantom roster-check fix is on master, verified present, and the driver refuses to run without it)
- **Canon note:** docs/CANON.md read first. No canon doc covers survival-collapse attribution; the veteran-bar rule comes from docs/MONSTER-WAVES.md design call #4 and Steve's 2026-11-10 scholar-counts ruling, same as vetphantom-b and tributedeliv-b. Nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-survivalcontrol-b/` — 8 per-seed JSONs; summary `evidence/2026-11-11/survivalcontrol-b-summary.json`
- **Run notes (infrastructure):** a host write flap (intermittent EPERM on large writes) hit this run hard. The first full driver pass landed only 3/8 files (190391–190393); seeds 190394–190398 fell back to `@@FALLBACK` stdout after 60 retries each (0-byte `.tmp` files left behind). Recovery per the write-flap skill: probe before writing, wait for the flap to clear, rebuild deterministically. A 1.5 MB probe failed at ~21:02Z, cleared at 21:04Z; the re-run of 190394–190398 then landed 3/5 (190394–190396) and flapped again on 190397–190398; a second probe-wait cleared at 21:29Z and the final re-run of 190397–190398 landed both. Determinism cross-checks passed: 190398's re-run reads identical to its first-run stdout line (d103, village-lost, maxWave 4, standing 199, deaths 59, errors 0), and the 190393/190397 re-runs reproduce the tributedeliv re-trace days exactly (d149/d142). No seed's sim was ever run twice onto a file — every file present is the first successful write of that seed's deterministic trajectory. The heartbeat script also failed twice during the flap (registry write EPERM) and is slow even when it works (~9 min); it eventually landed (hb=0). The `safe-commit.sh` index-clobber struck on BOTH commits in this arm (prereg + instrument); repaired both times with the `git ls-tree -r HEAD -- <dir> | git update-index --add --index-info` pipe, verified `git status --short` empty + `git diff HEAD` empty. No work lost.

## Verdict: MASTER_CHANGE

The analyzer (`scripts/survivalcontrol-analyze-20261111.js`, exit 0) classifies **1/8 survived** under the prereg decision rule (≤2/8 → MASTER CHANGE). The collapse is NOT band variation: the same eight seeds that survived 6/8 on the pre-reconcile base survive 1/8 on current master. The tributedeliv re-trace stands VINDICATED as a signal (its VOID label was about the re-trace's own standing, not about the numbers — this fresh control reproduces its days exactly on two seeds). The follow-up owed is a bisect; this arm does not attempt it.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → BAND VARIATION | **not met: 1/8** |
| ≤2/8 survive → MASTER CHANGE | **MET: 1/8** |
| 3–4/8 → INCONCLUSIVE | not met |

## §1 The control table — same seeds, new code

| Seed | Vetphantom fix leg (old base) | This control (current master) | Δ days |
|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4 | **103d village-lost**, standing 165, maxWave 4 | −47 |
| 190392 | 150d survived, standing 199, maxWave 4 | **126d village-lost**, standing 199, maxWave 4 | −24 |
| 190393 | 150d survived, standing 325, maxWave 5 | **149d village-lost**, standing 199, maxWave 4 | −1 (and loses wave 5) |
| 190394 | 150d survived, standing 199, maxWave 4 | **91d village-lost**, standing 199, maxWave 4 | −59 |
| 190395 | 109d village-lost, standing 199, maxWave 4 | **65d village-lost**, standing 199, maxWave 4 | −44 |
| 190396 | 85d village-lost, standing 199, maxWave 4 | **150d SURVIVED**, standing 360, maxWave 5 | **+65 (the one improvement)** |
| 190397 | 150d survived, standing 325, maxWave 5 | **142d village-lost**, standing 370, maxWave 5 | −8 (and loses the tribute-ready veterans) |
| 190398 | 150d survived, standing 375, maxWave 5 | **103d village-lost**, standing 199, maxWave 4 | −47 |
| **band** | **6/8 survived, median 150d** | **1/8 survived, median 126d** | **median −24d** |

Seven of eight seeds die earlier; the one seed that improves (190396, the old band's worst at d85) is the exception that proves the rule — it survives only by outliving its own old trajectory, and it still ends the run with **zero living veterans**. The collapse is broad-based, not one bad seed.

## §2 Wall numbers — the scale wall got taller

| | Vetphantom fix leg | This control | Tributedeliv band (190411–190418) |
|---|---|---|---|
| Survived | 6/8 | **1/8** | 1/8 |
| Median survival | 150d | **126d** | 130d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** | 1/8 |
| Wave-4 unlocks | 8/8 | 8/8 | 8/8 |
| Deaths (band) | 707 | 615 (fewer deaths because villages die sooner — fewer days lived) | 637 |
| Standing range | 199–375 | **165–370** | 150–250 |
| Blooded | 5/8 | 0/8 | (not reported) |

Wave 4 still unlocks everywhere, but wave 5 thins (3→2), national/table/wins stay at zero, and the floor drops: the weakest village now dies at d65 (190395, still at village scale — it never even reached regional). The control band's wall numbers sit almost exactly on top of the tributedeliv fresh band's (1/8, median ~130d) — two different seed bands on current master agree with each other and disagree with the old base. That is the shape of a code change, not a band quirk.

## §3 Death causes — the same combat-heavy profile

615 deaths, all 8 seeds: villager combat 283, combat 100, expedition 100, the wild 102 — **585/615 (95%) combat / expedition / wild**. Starvation 0, sickness 0, thirst 0. The residual 30 are named-event causes (`monster` 15, `the arena` 7, `a stranger` 2, `ambush` 1, `contest` 1, `The Paparazzo` 1, `The Static Kite` 1, `Gavel` 1, `the night` 1) — death-cause labels that name a monster or an event rather than a category, same class as the vetphantom corpus. Against tributedeliv's 737 deaths (591/737 combat/expedition/wild, starvation 4, sickness 5, thirst 1): the profile is the same shape, slightly more combat-pure here. Villages die fighting, not hungry — on both bands, on both bases. What changed between bases is not *how* villages die but *how soon*: the same combat-heavy death profile now arrives ~24 median days earlier.

## §4 Veteran bars — the fix holds, the veterans don't

- **Phantom days: 0 on all 8 seeds** (engine ready vs instrument recomputation, every daily snapshot). The vetphantom roster-check fix still holds on current master — the collapse is not the phantom returning. Shadow old-rule counts also agree everywhere (0 shadow days): on these trajectories the old rule would not have counted a phantom either.
- **First veteran day:** d28–d45 across seeds — veterans still form on schedule, same as the old band (d28–d47).
- **Living veterans at end:** 0/0 on 7 of 8 seeds. The exception is 190398, which dies d103 holding 3 wave-3 / 1 wave-4 living veterans — the village that died *with* its veterans, not after losing them.
- **Tribute:** ready on 0/8 seeds at end (veterans 0 / payable 0, `veterans-short` everywhere). On the old band the tribute was ready on 2/8 at end (190393, 190397). The tribute-ready shape has vanished from this band: 190396 reached wave-5 readiness on d115 (max ready5 veterans 3) but its veterans all died before d150; 190397's max ready5 veterans is 1 — it never had the pair, where the old band's 190397 ended with 2 living wave-4 veterans and tribute ready.
- **Blooded:** 0/8 (was 5/8). No village stays blooded to the end now.

The veteran pipeline is intact at the front (first kills land on time) and broken at the back (nobody survives to bank them). The tribute's problem on this base is upstream of the delivery gate: there is no pair to pay with, because the second veteran dies before the village does.

## §5 Sense test — the village still feels like people; the gate still doesn't talk

The veteran-filtered say capture (400-line cap per seed) is noisy in one known way and honest in the rest. The filter regex `/elder/` matches "Elderberry" — on 190393, most of the 148 captured lines are Elderberry identification chains ("Jesse showed Lauren the Elderberry — 'remember it.' Word gets around."). That is an instrument quirk inherited from vetphantom-b, flagged here for the next arm that reuses the filter; it does not touch the survival read.

Outside the noise, villagers still do people things on camera:

> 🍽️ Greta leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190396 d3)
> 🛡️ Niamh, Ayan, Ines and Greta met them at the door — 4 put down. Niamh, Ayan, Ines, Greta are hurt. (190396 d10)
> ⚠ This one is different — scarred, braced, waiting for your opening. A Scarred veteran. (190396 d26)
> 💧 A woman, maybe 30s, with a burn-scarred forearm returns with water: +2 clean. (190397 d1)
> 🛡️ A woman, maybe 30s, with a burn-scarred forearm catches you eyeing the bark plates — claw-scored, vine-laced. "...Want to actually SEE one?" They talk you through it. (190397 d1)
> 👂 Overheard — A woman, maybe 30s, with a burn-scarred forearm: "Correlation isn't cause, but three data points is a pattern. Noted." (190397 d2)

And the gate still doesn't talk: on 190396, wave-5 readiness is met on d115 and the village holds three wave-4 veterans for a stretch — no line in the capture names the wave door, the veterans, the tribute, or the table. The military tribute remains voiceless (tributedeliv-b §5, still open). Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §6 Village assessment, in plain words

Eight villages, and seven of them die. They don't starve — they get killed, in fights and on the road, usually before day 130, exactly like the last band measured. The one that lives (190396) is the old band's weakest village, and it lives by losing every veteran it makes: it reaches the wave-5 door on day 115 with three wave-4 veterans and ends day 150 with none of them alive. The strongest village on paper (190397, standing 370, wave 5 reached) dies on day 142 with one veteran left where it used to have two. Nobody reaches national, nobody sits at the table, nobody wins. The same eight seeds used to give six survivors; now they give one — and a different band of fresh seeds on the same new code gives one too. So the villages didn't get unlucky. Something in the code changed between the two bases that makes villages die about a month earlier, and the prime suspects are the reconcile merge itself, the dawn scorer it brought in, and the mournblooded standing.js work. Which one is a job for a bisect, not for this arm — but the collapse itself is now a measured fact, not a suspicion.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: MASTER_CHANGE (1/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 1/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften it.
- **Secondary — median 126d vs 150d; death causes 95% combat/expedition/wild (tributedeliv: 80% on the same grouping, starvation 4/737 vs 0/615 here); wave-5 unlocks 2/8 vs 3/8; standing 165–370 vs 199–375.** All consistent with the primary: earlier death, same cause profile.
- **What the metric set did NOT cover:** the analyzer does not judge phantom days (computed separately here: 0 on all seeds — the fix holds). The death-cause grouping counts the raw `cause` strings, so named-event causes (`The Paparazzo`, `a stranger`) inflate the tail; the 95% figure groups villager combat + combat + expedition + the wild only. A future analyzer should normalize those named causes into the combat family explicitly rather than leaving the grouping to the evidence writer.
- **VetSays filter quirk:** the `/elder/` alternation in the shared SAY_RE matches "Elderberry", flooding the capture on seeds where the identification chain runs. The next arm reusing the vetfirst instrument should tighten the filter (e.g. `\belder\b` / `elder ` with a word boundary) — the survival read is unaffected, but the sense-test sample is diluted.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base; the before/after IS the vetphantom fix leg vs this control on identical seeds, judged by the analyzer's decision rule. Same standing as tributedeliv-b §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b and tributedeliv-b ("recorder-corpus input ... compared with sweep-compare tables, never against a run baseline"). Recorded, not waived.
- **Proof:** `scripts/test-survivalcontrol-b.js` 41/41 green before any judged sim (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8).

## §8 Follow-up owed — bisect (not this arm)

Per the prereg, MASTER_CHANGE names the candidates **in order: (1) reconcile merge, (2) dawn scorer, (3) mournblooded standing.js**. A bisect arm should:

1. Re-run this same 8-seed control on the pre-reconcile base (the vetphantom anchor code, not just the seeds) to confirm the old base still gives 6/8 — the anchor for the bisect.
2. Bisect the reconcile merge's constituent commits (4,677 src/js insertions across 22 files: villager-brain.js +1,061, villager-objectives.js +613, godverbs +587, titans +427, … — tributedeliv-b §3) against the survived-count metric.
3. Keep the death-cause profile as a secondary: if a bisect step restores survival but changes the cause profile (e.g. starvation appears), that step changed more than survival.

Do NOT re-judge the tributedeliv re-trace (VOID stands); judge only this fresh 8-seed control, which is what this arm did.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — 7 wraps + daily snapshot; vetfirst-b proved it neutral 8/8 exact) + the driver's live shadow old-rule count per snapshot (same as vetphantom-driver).
- **Driver:** `scripts/survivalcontrol-driver-20261111.js` (vetphantom-driver copied with corpus dir `perseed-survivalcontrol-b/`, RUN `survivalcontrol-pilot`, arm `survivalcontrol`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker; sha `1eec2c9235a8` recorded per seed).
- **Analyzer:** `scripts/survivalcontrol-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/survivalcontrol-b-summary.json`).
- **Proof:** `scripts/test-survivalcontrol-b.js`, 41/41 green.
- **Corpus:** `evidence/2026-11-11/perseed-survivalcontrol-b/survivalcontrol-s19039{1..8}-survivalcontrol-pilot-fix.json` (8 files). Summary: `evidence/2026-11-11/survivalcontrol-b-summary.json`.
- **Files in this arm:** prereg (`805404e69`), instrument (`b702d603a`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence + corpus commit pending — coordinator merges).
- **No src/js change by this arm.** Ready to merge, pending ship (coordinator merges; no push, no bump, no live verification by this arm).
- **Backlog:** the survival-collapse question from tributedeliv-b §8 is now ANSWERED (MASTER_CHANGE, 1/8 vs 6/8) — coordinator marks it decided and queues the bisect as the next arm. New items for sim-findings.md: (a) vetSays `/elder/` filter matches "Elderberry" (instrument quirk); (b) write-flap + slow-heartbeat infrastructure notes (see run notes above).
