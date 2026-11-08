# sim-pelletpass-alone-b — prereg

**Arm:** sim-pelletpass-alone-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1230Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-pelletpass-b, base master `715c2918d` · **Prereg:** this file, committed BEFORE any judged sweep.

## The question

Does the pellet pass ALONE heal the frozen band? The bisect (`sim-healerbisect-midpoint15-b.md`) fingered #16 (commit `685dc9ec4`, pellet pass: the pellet moves to hungrier hands at dawn, `src/js/progression.js` +104, Steve's ruling 2026-11-07) as the healer, but #15 (commit `e6ddaf32a`, specialist first rung 10 → 5 XP in `src/js/food.js`) does most of the healing work (53005 + 53003 to healed-exact) and the pellet pass alone on the #14 base was NEVER run. The interval #15..#16 is proven; the minimal flipping set is NOT claimed. This arm runs that counterfactual: **#14 base (commit `2bc17d793`) + ONLY the pellet-pass change.**

## Construction (frozen, by diff — no hand edits)

1. Extract the #14 base read-only with a single `git archive 2bc17d793 src scripts index.html manifest.json version.json | tar -x -C scratch-2bc17d793/` (after `mkdir -p`).
2. Apply ONLY the pellet-pass diff (`git diff e6ddaf32a 685dc9ec4 -- src`) onto it.
3. Verify the resulting src diff vs `2bc17d793` is EXACTLY the pellet pass and nothing else. The interval #15..#16 contains no other game-code change — verified before this prereg: `git diff e6ddaf32a 685dc9ec4 -- src` is `src/js/progression.js` +104 only; `git diff 2bc17d793 e6ddaf32a -- src` is `src/js/food.js` 11 lines only; `progression.js` is identical between #14 and #15 (0 lines) and `food.js` identical between #15 and #16 (0 lines) — so the progression.js diff must apply cleanly. **If it does not apply cleanly, STOP and report; do not hand-edit around it.**
4. Overlay the 3 frozen instrument files from the branch tip via `git show` (driver `scripts/doorwalk-b-driver-20261107.js`, doorwalk policy `scripts/policies/competent-doorwalk-b.js`, analyzer `scripts/analyze-frozenband-bisect-20261107.js`) and verify them byte-identical to the ones used by the #14/#15/#16 runs. Verified before this prereg: all three are byte-identical across branch tip `715c2918d`, mid15 tip `d229b58f5`, and mid14 tip `246ce6dc2`; zero commits in `246ce6dc2..HEAD` touch any instrument file.
5. Verify the full require closure BEFORE the smoke (17 files per the midpoint15 method note — driver + the 5 REPO-joined requires + transitive set incl. `stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`, `competent`, `idle`, `vinebank`, `snareteach`, `conversation-pages`, `competent-feastdrive-b`, `competent-linkdrive-b`, `competent-linkfeast-b`).
6. Smoke one seed first (53004), then the full 8. Scratch dir deleted before finishing (reproducible from `git archive`).

## Substrate (frozen, unchanged from the bisect)

- Driver: `scripts/doorwalk-b-driver-20261107.js`, **BASELINE leg only** (`POLICY=baseline`: `TAKESEAT_B=1`, `DOORWALK_B` off — sits happen, doors never walked). The same frozen instrument that produced both endpoints.
- Horizon: **150d, death-aware** (`runDays` stops on village death / win, +10d tail max). Matches both endpoints.
- Seeds: **53001–53008, FROZEN**, deliberately reused — the frozen band is the instrument here, not a fresh band. NO new seeds. Full 8, no subset (Amendment B rule: the 4-seed screen no longer discriminates).
- Invocation per the prereg: `DAYS=150 SEEDS=53001..53008 RUN=doorwalk-baseline POLICY=baseline OUTDIR=/tmp/pelletpass-alone-b/ node scripts/doorwalk-b-driver-20261107.js` run from inside the scratch dir; corpora then committed under `evidence/2026-11-08/perseed-pelletpass-alone-b/`.
- Analyzer: `scripts/analyze-frozenband-bisect-20261107.js` (reused, runs at branch tip) — per-seed flip table + median + sits + HEALTHY / COLLAPSED / AMBIGUOUS on the 8-seed bars.
- Flap protocol: probe O_EXCL file creation before every sweep and commit; if the probe fails, wait and retry — never force ref surgery during a flap. (Flap active 12:46Z at run start, cleared 12:47:52Z before this prereg commit.)

## Reference points (full-8, doorwalk BASELINE leg, frozen band)

| Point | SHA | Median | Sits | Days 53001–53008 |
|---|---|---|---|---|
| Collapsed control | `cf22937b8` | 70.5d | 0/8 | 88, 84, 68, 73, 54, 66, 63, 92 |
| #14 (alien expansion) | `2bc17d793` | 103d | 4/8 | 67, 139, 45, 150, 54, 150, 59, 150 |
| #15 (first rung 10→5 XP) | `e6ddaf32a` | 119d | 4/8 | 67, 88, 65, 150, 150, 150, 50, 150 |
| #16 (pellet pass, on #15) | `685dc9ec4` | 145d | 4/8 | 105, 140, 65, 150, 150, 150, 50, 150 |
| Healed control | `c9fea16ee` | 145d | 4/8 | 105, 140, 65, 150, 150, 150, 50, 150 |

Per-seed notes for the reading: 53001 and 53002 are the two seeds only #16 heals (67→105d, 88→140d); 53005 is the seed #15 heals (54→150d, exact healed match) and #14 leaves exactly collapsed; 53003 reaches healed-exact at #15 (45→65d). #16 reproduces the healed control exactly on all 8 seeds (0/8 moved death days).

## GO bars (binding, §14)

- **THE PELLET PASS ALONE HEALS:** median **≥120d AND sits ≥4/8** on the full 8 (the bisect flip bars). Then the pellet pass alone HEALS the band, the finger stays #16, and the minimal flipping set is **{#16}** — the #15 step is load-bearing in the staircase but not required for the heal.
- **Anything else → AMBIGUOUS/COLLAPSED per the same rule, and the finger stays with the interval #15..#16.** If the counterfactual reads AMBIGUOUS (e.g. 53001/53002 heal but 53005 stays collapsed, or the median lands short), the minimal flipping set is **{#15, #16}** — both steps required, proven by construction (this arm removes #15 and the heal does not reproduce). No re-scoring, no friendlier metric: not "5 of 8 seeds match the healed endpoint", not "median rounds to 120", not "53005 heals so the landing is the healer".
- **Per-seed moves reported, esp.:** 53001/53002 (the two seeds only #16 heals — do they move under the pellet pass alone?) and 53005 (which #15 heals — does the pellet pass alone heal it too, or does it stay collapsed at 54d?).
- **Proof bars:** `scripts/test-pelletpass-alone-b.js` green (construction by diff + instrument byte-identity + corpus integrity 8/8 with 0 instrument errors + the full-8 bars on fixtures); flip tables vs #14/#15/#16/healed attached to the evidence file (same shape as the midpoint15 file).
- **Panel (§15):** balanced-panel screen attempt via `scripts/balance-panel.js` on the sweep corpora, recorded honestly as a screen (not a panel verdict) exactly as the midpoint15 file does. If the tool cannot consume doorwalk corpora, record that instead of faking a compare.
- **Corpus integrity:** 8/8 seeds present, 0 instrument errors on every seed, anchor reads the worktree tip in every corpus JSON; the SHA under test is recorded in the evidence file (the counterfactual is not a commit — record base `2bc17d793` + pellet-pass diff `e6ddaf32a..685dc9ec4`), not inferred from the anchor.

## Non-goals

- DIAG only: zero src/js changes on the branch. The pellet pass is applied to an extracted scratch copy only; nothing is landed, merged, or built in this arm.
- No fresh band, no confirm sweep on a new band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- If time runs short: COMMIT everything committable right now and report exactly what is done vs pending — the next run adopts (established pattern, not a failure). Do NOT push, do NOT bump versions, do NOT verify live.

## Metric review (pre-registered note)

- The primary metric (median survival + sits on the frozen band) is the collapse/heal signature itself; the flip bars are the judge. The bars name the pellet pass alone as the healer only if BOTH bars pass; a one-day miss is AMBIGUOUS, exactly as #15's 119d was.
- The prereg's bisect narrative assumes a single landing flips the whole band. The completed staircase already shows the heal arriving in two steps — #15 heals the starvation village, #16 finishes the other two. This arm tests whether the second step alone suffices; if it does not, the honest unit of the heal is the pair, and the tracker must record the minimal set as {#15, #16}, not a single finger.
- No metric change proposed. If the counterfactual lands AMBIGUOUS by one day on the median, that is the metric doing its work, not a reason to re-score.
