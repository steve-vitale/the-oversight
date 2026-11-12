# sim-bisect-mournblooded-a — survival-collapse bisect, ARM B (the suspect)

- **Run:** fleshout-20261111T2317Z, arm sim-bisect-mournblooded-a
- **Prereg:** `evidence/2026-11-11/sim-bisect-mournblooded-a-prereg.md` (committed `590e13b4e` before any judged sim)
- **Base:** this branch `sim-bisect-mournblooded-a`, pinned at `13e6f40ae` (the sim-mournblooded-b commit: hold beat mourns the blooded, standing.js +140/−21). Verified with `git log --oneline -1` at run start; branch did not move during the run.
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — already at this base, verified byte-identical to master's copy by diff) + `scripts/bisect-mournblooded-driver-20261111.js`, `scripts/bisect-mournblooded-analyze-20261111.js`, `scripts/test-bisect-mournblooded-a.js` (committed `47e3360b3`, **50/50 green**)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as the vetphantom fix leg and the survivalcontrol leg (a bisect re-runs the same seeds on the suspect commit; not a freshness violation, stated in the prereg), competent verbatim, SINGLE leg on the suspect commit (fix-only; the roster-check marker verified present at standing.js:233 and :283, and the driver refuses to run without it)
- **Canon note:** docs/CANON.md read first; docs/MONSTER-WAVES.md design call #4 (combat readiness gates the standing unlock; VETERANS = living roster members with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10 scholar-counts ruling ground the veteran-bar reads. No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-mournblooded-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-mournblooded-a-summary.json`
- **Run notes (infrastructure):** the `safe-commit.sh` index-clobber struck on BOTH commits in this arm (prereg + instrument); repaired both times with the `git ls-tree -r HEAD -- <dir> | git update-index --add --index-info` pipe, verified `git status --short` empty + `git diff HEAD` empty. No work lost. One service restart mid-run wiped /tmp (re-extracted the survivalcontrol driver/analyzer/test from master via `git show` and re-did the copies — the copies were verified clean afterward). The write-flap probe (`git update-ref refs/heads/probe HEAD`) passed before every write phase; the 8-seed driver pass landed 8/8 files with no `@@FALLBACK` and no `.tmp` leftovers. The worktree heartbeat landed (hb exit 0, ~7.4 min — slow, as survivalcontrol-b also found).

## Verdict: MOURNBLOODED IMPLICATED

The analyzer (`scripts/bisect-mournblooded-analyze-20261111.js`, exit 0) classifies **1/8 survived** under the prereg decision rule (≤2/8 → MOURNBLOODED IMPLICATED). The suspect commit reproduces the survivalcontrol collapse on identical seeds — and it does so EXACTLY: all 8 trajectories are byte-identical to the survivalcontrol leg's (same days, standing, maxWave, deaths, death lists, daily snapshots, kill-call counts, and vetSays lines — verified programmatically, 8/8 exact). The collapse is not a statistical resemblance; it is the same code producing the same villages dying on the same days.

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → MOURNBLOODED EXONERATED | **not met: 1/8** |
| ≤2/8 survive → MOURNBLOODED IMPLICATED | **MET: 1/8** |
| 3–4/8 → INCONCLUSIVE | not met |

## §1 The bisect table — same seeds, suspect commit

| Seed | Vetphantom fix leg (old base) | Survivalcontrol (master d33ca69f9) | This bisect (suspect 13e6f40ae) | Δ vs vetphantom |
|---|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4 | **103d village-lost**, standing 165, maxWave 4 | **103d village-lost**, standing 165, maxWave 4 | −47, exact match to control |
| 190392 | 150d survived, standing 199, maxWave 4 | **126d village-lost**, standing 199, maxWave 4 | **126d village-lost**, standing 199, maxWave 4 | −24, exact match to control |
| 190393 | 150d survived, standing 325, maxWave 5 | **149d village-lost**, standing 199, maxWave 4 | **149d village-lost**, standing 199, maxWave 4 | −1 (and loses wave 5), exact match |
| 190394 | 150d survived, standing 199, maxWave 4 | **91d village-lost**, standing 199, maxWave 4 | **91d village-lost**, standing 199, maxWave 4 | −59, exact match to control |
| 190395 | 109d village-lost, standing 199, maxWave 4 | **65d village-lost**, standing 199, maxWave 4 | **65d village-lost**, standing 199, maxWave 4 | −44, exact match to control |
| 190396 | 85d village-lost, standing 199, maxWave 4 | **150d SURVIVED**, standing 360, maxWave 5 | **150d SURVIVED**, standing 360, maxWave 5 | **+65, exact match to control** |
| 190397 | 150d survived, standing 325, maxWave 5 | **142d village-lost**, standing 370, maxWave 5 | **142d village-lost**, standing 370, maxWave 5 | −8, exact match to control |
| 190398 | 150d survived, standing 375, maxWave 5 | **103d village-lost**, standing 199, maxWave 4 | **103d village-lost**, standing 199, maxWave 4 | −47, exact match to control |
| **band** | **6/8 survived, median 150d** | **1/8 survived, median 126d** | **1/8 survived, median 126d** | **median −24d** |

Determinism cross-check (this arm, post-analysis): per-seed JSONs compared field-by-field against the survivalcontrol corpus — headline fields (days, endReason, standing, maxWave, scaleRank, endPantryKcal), the full death lists (day + cause + who, in order), the full daily snapshot arrays, kill-call counts, and vetSays lines are IDENTICAL on all 8 seeds. `standingSha` is `1eec2c9235a8` on both legs — standing.js is byte-identical between the suspect commit and master d33ca69f9, as the archaeology says it should be.

## §2 Wall numbers — identical to the control leg

| | Vetphantom fix leg | Survivalcontrol | This bisect |
|---|---|---|---|
| Survived | 6/8 | **1/8** | **1/8** |
| Median survival | 150d | **126d** | **126d** |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** | **2/8** |
| Wave-4 unlocks | 8/8 | 8/8 | 8/8 |
| Deaths (band) | 707 | 615 | **615** |
| Standing range | 199–375 | **165–370** | **165–370** |
| Blooded | 5/8 | 1/8 | **1/8** |

## §3 Death causes — the same combat-heavy profile, bit-identical

615 deaths, all 8 seeds: villager combat 283, combat 100, expedition 100, the wild 102 — **585/615 (95.1%) combat / expedition / wild**. Starvation 0, sickness 0, thirst 0. The residual 30 are the same named-event causes as the control leg (`monster` 15, `the arena` 7, `a stranger` 2, `ambush` 1, `contest` 1, `The Paparazzo` 1, `The Static Kite` 1, `Gavel` 1, `the night` 1) — the cause-count map is identical to survivalcontrol's, because the death lists are identical. The prereg secondary holds: ≥90% combat/expedition/wild, no cause shift — the commit changed survival, not how villages die.

## §4 Veteran bars — the fix holds, the veterans don't (same as control)

- **Phantom days: 0 on all 8 seeds** (engine ready vs instrument recomputation, every daily snapshot). Shadow old-rule counts also agree everywhere (0 shadow days). The vetphantom roster-check fix still holds on the suspect commit.
- **First veteran day:** d28–d45 across seeds — veterans still form on schedule, same as both prior legs (vetphantom d28–d47; control d28–d45).
- **Living veterans at end:** 0/0 on 7 of 8 seeds. The exception is 190398, which dies d103 holding 3 wave-3 / 1 wave-4 living veterans — the village that died *with* its veterans.
- **Tribute:** ready on 0/8 seeds at end (veterans 0 / payable 0, `veterans-short` everywhere; 190398 has veterans 1 / payable 0). 190396 reached wave-5 readiness on d115 (max ready5 veterans 3) but its veterans all died before d150; 190397's max ready5 veterans is 1 — it never had the pair.
- **Blooded:** 1/8 (190398 only; was 5/8 on the vetphantom leg).

## §5 The eulogy never fires — and the hold beat never speaks its veteran line

This is the evidence the task asked for as context for the mechanism arm — and it rules out the obvious mechanism:

- **Eulogy lines: 0 in the whole corpus.** The analyzer counts vetSays lines containing "cameras lost them": 0 on every seed (verified independently with a corpus grep: no matches). The mournblooded feature's own line never speaks in 8 × 150 days of sims.
- **No "blood your fighters" hold-beat line was captured on any seed either** (0 across 8 seeds). Caveat: `_readinessBarLine` names ONLY the short bars, so a defer hold can fire with the veteran bar satisfied and leave no captured line — zero captured hold lines does not prove zero hold beats fired. But the eulogy count is airtight: the eulogy line contains "blooded", which the SAY_RE filter captures, so 0 eulogies means the mourning path never spoke.
- **The veteran count is provably identical to the pre-suspect code.** I read the suspect diff (`git show 13e6f40ae -- src/js/standing.js`) in full: the old inline veteran block and the new `livingVeteranIds(w)` use the SAME `isLiving` rule (scholar always counts; roster membership required — the ROSTER CHECK marker is in both; `vp && !vp.dead`) and the SAME loop filter (`(e.w|0) < (w-1)` skip, dedupe by vid). The refactor is count-neutral by construction, and the corpus agrees (phantom 0, instrument agreement on every snapshot).

So the mechanism is NEITHER the veteran count NOR the eulogy line. What the corpus does show is WHERE the trajectories part from the vetphantom fix leg: **by the day-2 snapshot**. On seeds 190395/190396/190397 the day-2 `ready4`/`ready5` already differ (e.g. 190395: armored 7 vs 5, armed 11 vs 10 on the vetphantom leg) with IDENTICAL rosters and the same scholar id — the villagers' worn/carried gear already differs a day in, before any veteran, hold, or wave-4 event can exist. The first death differs on all 8 seeds (e.g. 190391: d4 expedition vs d7 villager combat on the vetphantom leg). The divergence is in early-game equipment/decisions, not in the veteran pipeline.

Mechanism lead for the follow-up arm (not judged here): the only game-code delta between the bases is standing.js, the harness and competent policy are unchanged (`git log 3f136f07e..d33ca69f9 -- scripts/policies/competent.js scripts/sim-harness.js` is empty; no src/data changes in the range), and the competent policy never reads standing/readiness — so the divergence must come through a standing.js entry point that runs in the first two days: `villageStandingTotal()` (called on every standing read; it evaluates `waveUnlockReady(4/5)` → `waveCombatReadiness` → `livingVeteranIds` on every call and writes the `_standingPeakWave` ratchet + fires hold/release beats), the release-beat path, or a `this`-binding difference between the old closure-based veteran count and the new `this.livingVeteranIds(w)` method call on some call path (all call sites found in standing.js are plain method calls; game.js/other-module receivers were not fully audited). A day-1 instrumented A/B probe on the two bases is the next step — it was not run here because this arm's prereg judges only the survived count, and modifying base files to run it is out of scope.

## §6 Sense test — villagers still act like people

452 vetSays lines across the corpus; 116 match "Elderberry" (the known `/elder/` filter quirk from survivalcontrol-b §5 — the filter regex matches the Elderberry identification chain; the survival read is unaffected, the sense-test sample is diluted the same way). Outside the noise, villagers do people things on camera:

> 🍽️ Greta leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190396 d3)
> 🛡️ Niamh, Ayan, Ines and Greta met them at the door — 4 put down. Niamh, Ayan, Ines, Greta are hurt. (190396 d10)
> ⚠ This one is different — scarred, braced, waiting for your opening. A Scarred veteran. (190396 d26)
> 💧 A woman, maybe 30s, with a burn-scarred forearm returns with water: +2 clean. (190397 d1)
> 🍲 A woman, maybe 30s, with a burn-scarred forearm eats with A woman, maybe 30s, with tattooed arms — bowls side by side, talk low. (190397 d1)
> A woman, maybe 30s, with a burn-scarred forearm shakes their head. "Ask someone who trusts you." (Trust too low.) (190397 d2)

Nothing in the corpus is robotic or incoherent. The same gap survivalcontrol-b noted stands: wave-5 readiness is met on 190396 (d115, three wave-4 veterans) with no line naming the wave door, the veterans, the tribute, or the table — and now we know the hold beat's eulogy, the one new piece of fiction that could have named a veteran loss, never speaks in these trajectories at all.

## §7 Village assessment, in plain words

Eight villages, seven die — and they die on exactly the same days, in exactly the same fights, as they did on current master. The suspect commit doesn't just resemble the collapse, it IS the collapse: the same eight seeds, the same code path, the same dead villages. They don't starve; they get killed in fights and on the road, usually before day 130. The one that lives (190396) is the old band's weakest village, and it lives by losing every veteran it makes. Nobody reaches national, nobody sits at the table, nobody wins. The strange part — the part the next arm has to explain — is that the collapse starts on day two, in the villagers' gear, before any veteran has been blooded and before the new eulogy line ever gets a chance to speak. The veteran count didn't change and the eulogy didn't fire, so the thing that kills these villages is hiding somewhere else in that one standing.js commit.

## §8 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8 and survivalcontrol 1/8: MOURNBLOODED_IMPLICATED (1/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 1/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften it. The verdict is strengthened beyond the prereg by the exact-reproduction check (8/8 byte-identical trajectories vs survivalcontrol), which the prereg did not require.
- **Secondary — median 126d vs 150d (vetphantom) / 126d (survivalcontrol); death causes 95.1% combat/expedition/wild (prereg bar ≥90% held, no cause shift); wave-5 unlocks 2/8 vs 3/8; standing 165–370 vs 199–375; eulogy lines 0 (context for the mechanism arm, not a verdict input).** All consistent with the primary.
- **What the metric set did NOT cover:** the analyzer does not judge phantom days (computed separately here: 0 on all seeds — the fix holds). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; the 95.1% figure groups villager combat + combat + expedition + the wild only. The analyzer's eulogy counter depends on the driver's SAY_RE capturing "blooded" lines — verified: the eulogy line contains "blooded", so a fired eulogy would have been captured.
- **VetSays filter quirk:** the `/elder/` alternation in the shared SAY_RE matches "Elderberry" (116/452 lines) — same as survivalcontrol-b §7. The next arm reusing the vetfirst instrument should tighten the filter (e.g. `\belder\b`).
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base; the before/after IS the vetphantom fix leg vs this bisect leg vs the survivalcontrol leg on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b and survivalcontrol-b ("recorder-corpus input ... compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was run (no LOUD lines to investigate; the refusal is not a deviation).
- **Proof:** `scripts/test-bisect-mournblooded-a.js` 50/50 green before any judged sim (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8; eulogy counting + combat-family share on synthetic rows).

## §9 Follow-up owed — mechanism arm (not this arm)

Per the prereg, MOURNBLOODED_IMPLICATED narrows the bisect to standing.js, but §5 rules out the two obvious mechanisms (count, eulogy). The mechanism arm should:

1. Run a day-1/day-2 instrumented A/B probe on the two bases (vetphantom base vs suspect commit) to find the first divergent evaluation — the corpus here says the divergence is already visible in the day-2 armored/armed counts with identical rosters.
2. Audit every `villageStandingTotal` / `waveUnlockReady` / `waveCombatReadiness` / `villageBlooded` call path for a receiver change between the old closure-based veteran count and the new `this.livingVeteranIds(w)` method call, and for any early (pre-day-25) hold/release beat firing.
3. Keep the death-cause profile as a secondary: it stayed combat-pure here, so a mechanism that changes the cause profile is the wrong one.

Do NOT re-judge the survivalcontrol verdict (MASTER_CHANGE stands) or the vetphantom fix leg; judge only this fresh 8-seed bisect leg on the suspect commit, which is what this arm did. An EXONERATED verdict would have cleared only this commit, not the reconcile merge or the dawn scorer — that caveat is now moot for this commit, but it stands for whatever the mechanism arm finds next.

## §10 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — 7 wraps + daily snapshot; vetfirst-b proved it neutral 8/8 exact) + the driver's live shadow old-rule count per snapshot (same as survivalcontrol-driver).
- **Driver:** `scripts/bisect-mournblooded-driver-20261111.js` (survivalcontrol-driver copied with corpus dir `perseed-bisect-mournblooded-a/`, RUN `bisect-mournblooded-pilot`, arm `bisect-mournblooded`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker; sha `1eec2c9235a8` recorded per seed).
- **Analyzer:** `scripts/bisect-mournblooded-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-mournblooded-a-summary.json`; verdicts renamed for the bisect: MOURNBLOODED_EXONERATED / MOURNBLOODED_IMPLICATED / INCONCLUSIVE; adds eulogy-line counting and the combat-family share secondary).
- **Proof:** `scripts/test-bisect-mournblooded-a.js`, 50/50 green.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-mournblooded-a/bisect-mournblooded-s19039{1..8}-bisect-mournblooded-pilot-fix.json` (8 files). Summary: `evidence/2026-11-11/bisect-mournblooded-a-summary.json`.
- **Files in this arm:** prereg (`590e13b4e`), instrument (`47e3360b3`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence + corpus commit pending — coordinator merges).
- **No src/js change by this arm; no `[needs-eyes]` applies** (no feel/combat/UI change — nothing for Steve to playtest). Ready to merge, pending ship (coordinator merges; no push, no bump, no live verification by this arm).
- **Backlog:** the survival-collapse bisect step 1 is ANSWERED (MOURNBLOODED_IMPLICATED, 1/8 vs 6/8, 8/8 exact reproduction) — coordinator marks it decided and queues the mechanism arm (§9) as the next step. New items for sim-findings.md: (a) vetSays `/elder/` filter matches "Elderberry" (instrument quirk, carried over from survivalcontrol-b); (b) the day-2 divergence puzzle — trajectories part in armored/armed counts before any veteran/hold event, mechanism unknown.
