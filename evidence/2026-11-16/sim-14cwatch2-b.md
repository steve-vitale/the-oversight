# sim-14cwatch2-b — §14c watch rerun: NOT REPRODUCED (pooled combat ratio 1.10)

**Verdict: NOT REPRODUCED.** On a fresh 8-seed band (102221–102228)
with fresh baselines on the current tip, the courtship leg does NOT
kill villagers in combat at a higher rate than the covenant control:
pooled combat deaths 546 armed vs 498 control (ratio **1.096**,
inside the frozen 0.8–1.2 NOT REPRODUCED band), and per 1000
villager-days the rates are effectively identical — 46.54 armed vs
46.81 control (rate ratio **0.994**). The 0430Z re-confirm's seed
100633 trip (66 vs 36 combat, +83%) does not reproduce as a
band-wide effect. It reads as a per-seed outlier, as the
re-confirm's own band-wide pooled ratio (0.88) already suggested.

Run: fleshout-loop-b-20261116T1730Z (Loop B), arm sim-14cwatch2-b
Axis: winnability chain. Tracker blank #6 second half / 0430Z
blank #4: §14c watch rerun.
Branch: sim-14cwatch2-b — worktree ~/workspace/worktrees/sim-14cwatch2-b
Tip: driver anchorCommit 594d2ec38 (this arm's prereg commit;
worktree HEAD at run start 5a9e13719, prereg + instrument landed
first as 594d2ec38).
Date: 2026-11-16.

## Canon note

docs/CANON.md read in full. **No canon doc covers
courtship/diplomacy death effects** — the manifest's nearest docs
are docs/CONVERSATIONS.md and docs/MAP.md; neither says anything
about whether courtship or diplomacy changes who dies in combat.
Nothing was invented to fill the gap (inherited from
sim-14cwatch-b.md).

## Method (frozen prereg — evidence/2026-11-16/sim-14cwatch2-b-prereg.md)

- Band 102221–102228 (8 seeds), verified fresh per the
  seed-band-freshness skill (whole-token rg; only hits the
  trickteach prereg's "checked-fresh, NOT reserved" note and the
  stopped arm's verification/assignment; unfiltered-substring hits
  elsewhere are digit runs inside 64-hex case hashes).
- Horizon 200d death-aware, policy competent-covenant-b (control)
  vs competent-courtship-b (armed), identical seeds, both legs run
  fresh on this tip via scripts/onlylead-driver-20261115.js
  REUSED VERBATIM — zero driver edits. Env defaults
  (COUNTER_ANSWER, COMPETENT_FLEE_REPAIR, ANSWERMAIL_DRIVE unset),
  matching the re-confirm.
- Classifier (frozen): combat deaths = kind `monster` AND player
  false. The driver's `villagerCombatDeaths` field is reported as
  ALL-VILLAGER deaths (player false, any kind) — never as combat.
  Exposure = sum of daily roster size (`pop`) from the series.
- Decision rule (frozen): ratio ≥1.5 = REPRODUCED; 0.8–1.2 = NOT
  REPRODUCED; between = INCONCLUSIVE.
- D1 (frozen instrument gate): determinism SELF-REPEAT on this
  tip — seed 102221 control twice in separate fresh processes,
  byte-identical record. **D1 PASSED** (proof test 25/25; record:
  gameDays 145, standing 199, maxWave 4, deaths 88,
  villagerCombatDeaths 79, 0 instrument errors). The judged
  control file for seed 102221 reproduces the D1 record exactly
  on the headline fields.
- Proof: scripts/test-14cwatch2-b.js **25/25 green** before
  judging (§1 classifier fixtures 23/23 incl. re-derivation of
  the re-confirm's 100633 numbers from its corpus: combat 36/66,
  all-villager 39/68; §2 D1 2/2). No second band was spent — the
  verdict is decisive under the frozen rule, and no confirm band
  is owed.

## Incident during the run (recovered, no data lost)

The first armed-leg invocation was killed by SIGTERM at 4/8
seeds (runtime-side; no error, no partial file — the driver's
write-then-rename left no `.tmp` behind, no stray process).
Recovery per the re-confirm's resume rule: the 4 completed armed
files were validated as complete JSON with 0 instrument errors,
then the leg resumed with SEEDS=102225–102228 only (the driver
refuses to overwrite, so completed configs were never re-run).
All 16 files validated: complete JSON, 0 instrument errors,
anchorCommit 594d2ec38 throughout.

## Results — per-seed combat deaths (kind `monster`, player false)

| seed | control | armed | ratio | control end | armed end |
|---|---|---|---|---|---|
| 102221 | 74 | 87 | 1.18 | lost 145d, w4 | survived 200d, w5 |
| 102222 | 66 | 96 | 1.45 | lost 102d, w5 | survived 200d, w4 |
| 102223 | 54 | 54 | 1.00 | lost 145d, w4 | lost 194d, w4 |
| 102224 | 56 | 70 | 1.25 | lost 131d, w4 | lost 166d, w4 |
| 102225 | 53 | 57 | 1.08 | survived 200d, w4 | survived 200d, w5 |
| 102226 | 81 | 39 | 0.48 | lost 166d, w4 | survived 200d, w4 |
| 102227 | 64 | 52 | 0.81 | lost 161d, w5 | survived 200d, w5 |
| 102228 | 50 | 91 | 1.82 | survived 200d, w4 | lost 192d, w5 |

Pooled: combat **498 control vs 546 armed, ratio 1.096**;
exposure 10,638 vs 11,732 villager-days; combat per 1000
villager-days **46.81 vs 46.54, rate ratio 0.994**. Only 1/8
seeds ≥1.5 (102228 at 1.82); 2/8 below 0.8 (102226 at 0.48).
Per-seed ratios scatter both sides of 1.0 — no consistent
direction, unlike the re-confirm's single-seed trip.

Driver field (all-villager deaths, for the record — NOT combat):
537 control vs 606 armed (ratio 1.13). Starvation deaths:
0 control vs 3 armed. Median survival: **161d control vs 200d
armed** — the armed leg's villages live longer, which is the
whole story behind the absolute-count gap: +10% more exposure,
+10% more combat deaths, flat rate.

Sensitivity — the frozen rule counts kind `villager` + cause
`monster` + player false as NON-combat (21 control vs 27 armed
band-wide). Counting them as combat instead gives 519 vs 573,
ratio **1.104** — same verdict. The classifier edge cannot flip
the call.

## Wall numbers (both legs)

| | control | armed |
|---|---|---|
| national by scaleRank ≥2 | 0/8 | **4/8** |
| national by standing ≥200 | 2/8 | 4/8 |
| table (seat taken) | 0 | 0 |
| wins | 0 | 0 |
| wave 4 unlocked | 8/8 | 8/8 |
| wave 5 unlocked | 2/8 | 4/8 |
| median survival | 161d | 200d |

The armed leg reaches national and survives longer on this band
— consistent with the re-confirm's GO (the lever works), and
with the NOT REPRODUCED verdict: the lever's villages live
longer and reach further, and their villagers die in combat at
the same rate per day lived. No seat, no win on either leg.

## Balanced panel (§15)

`scripts/build-14cwatch2-panels-20261116.js` (same construction
as the courtship-reconfirm builder) + `scripts/balance-panel.js
compare` → evidence/2026-11-16/14cwatch2-b-panel.* — decision
**review_required**. Panel reads: national scale access 0 → 0.5
(no material signal); village deaths per run 76.5 → 88.25
(+11.75, regression_watch); village deaths per 100 calendar days
51.37 → 45.59 (−5.78, no material signal); community loss
0.75 → 0.375 (no material signal). The panel is the instrument;
the frozen rule is the judge. The per-run deaths flag is an
exposure artifact — deaths per 100 days FALLS on the armed leg,
exactly as the analyzer's flat combat rate (0.994) says. No
re-scoring: the verdict stands on the frozen pooled ratio.

## Sense-testing — read the deaths (SENSE-TESTING LAW)

Seed 102228, the one ≥1.5 seed, quoted in full because it is the
only seed that looks like the re-confirm trip:

- **Control** (survived 200d, wave 4, 50 combat deaths): deaths
  spread across 28 monster species, no species above 3 kills —
  lockpick_raccoon 3, drumbelly_tanuki 3, hushwolf 3, moderator 3,
  redactor 3, then a long tail of 1–2s. A village nibbled by
  everything it met and surviving.
- **Armed** (lost day 192, wave 5, 91 combat deaths): the same
  spread — plus a wave-5 concentration the control village never
  met: **ducks_in_a_row 15**, hummice 9, belltoad 6, paparazzo 5,
  moderator 4. The armed village reached wave 5 (kills
  {1:30, 2:23, 3:15, 4:5, 5:3}) and a wave-5 swarm killed
  fifteen villagers. That reads as combat, not as a bookkeeping
  artifact: the excess sits exactly where the harder content is.
  The control village, capped at wave 4, simply never faced it.

Seed 102221 (both legs, D1 seed) shows the same shape in the
cause labels: combat deaths arrive under three cause strings —
'villager combat', 'combat', and 'expedition' — all with kind
`monster`. The kind-based classifier is robust to that label
variety; a cause-based classifier would have split the same
deaths three ways. Non-combat villager deaths on the band are
thirst/starvation and the 21/27 kind-villager/cause-monster edge
records — no mislabelled combat hiding there in any number that
could move the verdict (see sensitivity above).

Judgement: the deaths make sense as combat. Villagers die to the
monsters of the waves they actually face, in proportion to how
long they live and how far they get. Nothing robotic, nothing
repeated-as-ledger: the armed leg's extra deaths are the price
of reaching wave 5, not a courtship death tax.

## Metric review

- The frozen pooled-count ratio (1.096) and the exposure-adjusted
  rate ratio (0.994) agree on NOT REPRODUCED; the count ratio is
  the noisier of the two because the legs differ in survival
  (median 161d vs 200d). A future §14c watch should freeze the
  RATE ratio as primary when the legs can differ in survival —
  proposed for the next run, not applied to this one.
- The panel's village-deaths-per-run regression_watch is the
  same exposure artifact in panel form; deaths-per-100-days is
  the panel metric that tracks the frozen question, and it shows
  no signal. No panel re-run is owed.
- The D1 design (self-repeat, never comparison to the re-confirm
  numbers) worked as intended: the stopped arm's drift finding
  stands (100633 control differs across tips), and this arm's
  fresh baselines are internally valid on this tip.
- No metric was re-scored mid-run. The INCONCLUSIVE band
  (1.2–1.5) was never entered.

## Files changed (this arm)

- `evidence/2026-11-16/sim-14cwatch2-b-prereg.md` — frozen prereg
  (commit 594d2ec38, before any sims).
- `scripts/analyze-14cwatch2-b.js` — analyzer (same commit).
- `scripts/test-14cwatch2-b.js` — proof test, 25/25 (same commit).
- `scripts/build-14cwatch2-panels-20261116.js` — panel builder.
- `evidence/2026-11-16/perseed-14cwatch2-b-control/` (8 files)
  + `evidence/2026-11-16/perseed-14cwatch2-b-armed/` (8 files).
- `evidence/2026-11-16/14cwatch2-b-analysis.json` — analyzer output.
- `evidence/2026-11-16/14cwatch2-b-panel.*` — balanced panel
  (before/after .json.gz, compare .json + .md).
- `evidence/2026-11-16/sim-14cwatch2-b.md` — this file.
- Zero `src/js`. Zero policy edits. Zero driver edits (driver
  reused verbatim; OUTDIR routing + a file move put the corpora
  under evidence/2026-11-16).

## Convergence state

§14c watch: **NOT REPRODUCED** on a fresh band with fresh
baselines. The 100633 trip was a per-seed outlier. The courtship
lever stands as the re-confirm left it (GO, landed on master) —
this arm changes no game code and no lever. No confirm band is
owed. Tracker blank #6 second half / 0430Z blank #4 closes with
this verdict.
