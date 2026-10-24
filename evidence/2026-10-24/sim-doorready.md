# sim-doorready — wave-5 door-pursuit deferral (policy-side arm)

**Run:** 2026-10-24 (coordinator arm sim-doorready) · **Axis:** scale-onramp (standing directive)
**Type:** lever arm (policy-side ONLY — zero src/js changes) · **Verdict: NO-GO at pilot (KILLED)**
**Anchor:** `ba9e5a7df` (worktree HEAD at run start) · **Prior:** sim-postunlock2-b (2026-10-24): fresh-band door census, 4/32 doors, all four door villages lost 48–63d post-door; postunlock-b: doors at d167 survived to cap (13d window, cap truncation).
**Evidence:** `evidence/2026-10-24/sim-doorready.md` · **Corpus:** `evidence/2026-10-24/perseed-doorready/` (16 pilot configs) + `sim-doorready-analysis.json` + `sim-doorready-sense.txt` + sweep runlog
**Instruments:** `scripts/sim-doorready-sweep.js` (matched sweep, reuses read-only `scripts/postunlock-instrument.js` + read-only `scripts/sim-postunlock2-b-writer.js`) · `scripts/sim-doorready-analyze.js` (matched-pair judge) · `scripts/sim-doorready-sense.js` (narration replay) · **Proof:** `scripts/test-doorready.js` (pre-sweep: 19/19 green incl. mini-run plumbing; post-kill: rewritten as kill-state proof, green)
**Landing:** per the brief, the policy file (`scripts/policies/doorready.js`) is DELETED — killed arms leave no trace. Instruments + evidence land; the sweep/sense scripts are retained marked KILLED (they require the deleted policy and fail loudly without it — method documentation, not runnable code).

## Canon read first

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave law; wave 5 = "The Producers", gate standing >= 200 AND wave-4 faced, 2026-10-13 flexible-route call).
- `docs/MONSTER-WAVES.md` §"Combat readiness gates the standing unlock" (design call #4, 2026-10-16): `Game.waveCombatReadiness(w)` reads four live bars; wave-5 demand (sim starting points, Steve can overrule): armored 4 @ P>=15, armed 6, tricks 3, veterans 2 (living wave-4+ killers). While any bar is short, `villageStandingTotal()` holds at t5-1 — the door is open, the village hasn't walked through. Bread counts at most 100 toward the t5 bar (plentyCapT5).
- No canon doc covers "defer door pursuit" as a policy — this arm's deferral mechanism was defined explicitly below (pre-registration), not invented as canon.

## Pre-registration (binding, MEASUREMENT.md §14)

- **QUESTION:** does deferring wave-5 door pursuit until the village is ready *with margin* extend post-door survival, versus the engine's floor gate alone?
- **ARM (policy-side only):** `scripts/policies/doorready.js` (DELETED on kill) — wrapped competent; while the deferral window was open and any margin bar was short, feast hosting was suppressed (COMPETENT_FEAST=0 around the delegated upkeep call, restored in a finally). Everything else (fights, gear, teaching, talk, aid, devotion) kept running, because it BUILDS readiness.
- **DEFERRAL WINDOW (exact):** wave 4 unlocked AND wave 5 not yet unlocked. Before wave 4: normal competent. After wave 5 opens: normal competent (intervention purely pre-door, so post-door survival is not confounded by feast suppression). Collapse pre-door re-engages deferral.
- **MARGIN THRESHOLDS (exact; engine demand in parens):** armored >= 6 @ P>=15 (4) · armed >= 8 (6) · tricks >= 4 (3) · veterans >= 3 living wave-4+ killers (2) · living roster >= 8 (no engine bar). Read live every upkeep via `Game.waveCombatReadiness(5)` + living-roster count. Fail-closed: any read error = under-threshold.
- **BASELINE (one shared baseline):** the competent-player policy, PLAIN — no env suite (the sweep cleared the known suite gates in-process; baseline wrapper was a pure pass-through + counter stash, behavior-neutral by construction).
- **PRIMARY (GO bar, binding):** (1) at least 2 MATCHED door-open configs (same seed, both arms open wave 5) AND (2) armed mean post-door survival >= baseline mean post-door survival + 20 days, means over matched seeds only. Post-door survival = endDay (result.days; 180 cap = right-censored) − w5Day.
- **If fewer than 2 matched doors, the arm is NO-GO at pilot** (document the door-timing shift as a DIAG finding, do not re-score). A miss is NO-GO, never re-scored mid-run; metric doubts go under "metric review" for the next run.
- **Horizon:** 180d death-aware (dead villages stop; never a fixed 200d).
- **Seeds:** FRESH band 71901–71908 × {competent, doorready} = 16 pilot configs. Verified unused at run start by seed identity: no `s7190x` filename, no `"seed":7190x`, no SEEDS list with 7190x anywhere in evidence/. The only 7190x tokens found are false positives, not seeds: `da71901e` (a tenure-instrument pattern id in sim-succbrake.md) and a kcal figure 71903 (crumbdefault census). No other 71901–71908 seed identity exists in evidence/.
- **If GO,** the policy file lands as its own commit; **if NO-GO,** the policy file is deleted (killed arms leave no trace) and only instruments + evidence land.
- **Balanced panel (§15):** the matched-pair analyzer above is this arm's judge (the brief's GO bar is defined on matched door configs, not on the panel's metric contract). Panel status noted in metric review.

## Results — NO-GO at pilot (0 matched doors; the GO bar's second leg is uncomputable)

Pilot complete: 16/16 configs, 0 instrument errors, anchor `ba9e5a7df` throughout. The sweep itself was killed once by an external SIGTERM mid-run (after 4 configs); resume-skip recovered all 4, and the remaining 12 ran in three chunks — no data lost, no config re-run.

| seed | base w4/w5/end | armed w4/w5/end | door? | note |
|---|---|---|---|---|
| 71901 | —/—/147 lost | —/—/147 lost | no | w3, feasts 0/0, identical |
| 71902 | —/—/180 surv | —/—/180 surv | no | w3, feasts 7/7, identical |
| 71903 | 109/—/153 lost | 109/—/180 surv | no | **the only window** — see below |
| 71904 | —/—/180 surv | —/—/180 surv | no | w3, feasts 0/0, identical |
| 71905 | —/—/180 surv | —/—/180 surv | no | w3, feasts 0/0, identical |
| 71906 | —/—/180 surv | —/—/180 surv | no | w3, feasts 2/2, identical |
| 71907 | —/—/180 surv | —/—/180 surv | no | w3, feasts 0/0, identical |
| 71908 | —/—/34 lost | —/—/34 lost | no | w2, feasts 0/0, identical |

- **Matched doors: 0/8.** GO leg (1) fails. GO leg (2) is undefined (no post-door means exist) — not "zero", undefined. **Verdict: NO-GO at pilot, arm killed.**
- **Door-timing shift (the pre-registered DIAG fallback):** there is no shift to report — no arm opened wave 5 on any seed. The finding is one level up: the door window itself is out of plain-competent reach on this band (see findings).
- **The one window (71903) — the deferral worked exactly as designed, and still no door:** both arms unlock wave 4 on day 109 with byte-identical first window snapshots (bars 4/8/24/0/8 — armored 4, armed 8, tricks 24, veterans 0, roster 8; short: armor, veterans). Baseline then hosts 3 more feasts in-window (3→6) and collapses to bars 1/1/25/0/1, lost day 153. Armed hosts ZERO feasts in-window (feasts frozen at 3 — suppression provable in-sim), ends at bars 6/8/25/0/8 (armor, weapons, tricks, roster all at/above margin), survived to the cap — with **veterans 0 on all 72 window days, both arms**. The village never blooded a living wave-4+ killer, so neither the engine bar (2) nor the margin bar (3) was ever met, and the door never opened in either arm. The 153→180 survival difference is n=1 and confounded by trajectory divergence after the first suppressed feast — a hypothesis (feasts cost pantry + draw fights), not a claim.
- **Baseline-neutrality proof:** 7/8 seeds are trajectory-identical across arms (same end days, same feasts, same waves) — the pass-through baseline is behavior-neutral as designed, and the deferral is the ONLY difference on 71903. The 71903 pair shares its first window snapshot exactly and diverges only after deferral engages.

## Wall numbers

| metric (per arm, n=8 seeds) | baseline competent | armed doorready |
|---|---|---|
| national | 0 | 0 |
| table | 0 | 0 |
| wins | 0 | 0 |
| exiled | 0 | 0 |
| wave 4 unlocks | 1 (71903) | 1 (71903) |
| wave 5 unlocks (doors) | 0 | 0 |
| median survival | 180d | 180d |
| max survival | 180d | 180d |

Death-cause shares (all 16 configs' death rows): combat ~47–50%, villager combat ~30–33%, expedition ~6.5%, monster ~6%, starvation ~2.3%, contest ~2% — combat dominates both arms; the armed arm's combat share is slightly lower (115 vs 129 rows) on the back of the single 71903 divergence, not a pattern.

## Reachability verdict

- **Wave 5 unlock:** NOT REACHED on this band under plain competent — 0/16 configs. (Contrast postunlock2-b's lead/belong suite on 708xx: 4/32 doors. The gap is the substrate, not the band — see findings.)
- **Wave 4:** reached on 1/8 seeds (71903, both arms, day 109).
- **National / table / win:** not reached — 0/16. Under plain competent on this band, villages survive to the cap at wave 3 (6/8 seeds survive) without scaling — the scale wall, from the other side: not starvation mid-ambition, but never attempting the climb at all.
- **Arc II/III/IV, vests:** NOT measured by this pilot (no arc/vest instrumentation in the corpus) — not claimed either way.

## Village assessment (plain words)

Seven of eight villages never leave the village-and-woods stage: they forage, cook, teach, gossip, and survive to the cap at wave 3 without ever earning wave 4 — comfortable, unambitious, doorless. One village (71908) dies young at day 34, still on wave 2. Only 71903 climbs: it earns wave 4 on day 109 and then spends 44–71 days in the window — baseline feasting its way down to a one-person roster and dying at day 153, armed holding its food, armoring up to the margin, and surviving to the cap with a full bench but zero veterans. The village that "almost" gets there doesn't lack armor or tricks or people — it lacks blooded wave-4 killers. Nobody in either arm kills a wave-4 monster and lives to be counted. The door isn't being chased and missed; it's not being approached, because the village that could approach it can't produce the veterans the gate counts.

## Sense-testing (SENSE-TESTING LAW) — PASS, with feel notes

Sense target: **71903-doorready narration replay** (NON-MEASURED — replay trajectory differs from measured; replay also survived, w5Day null). Transcript: `perseed-doorready/sim-doorready-sense.txt` (240 lines, days 177–181, sayLive=true).

- **Villagers act like people.** Distinct routines: Gabriela on water/wood/stone, Miguel on garden/water, Liam cooking, Sari foraging; teaching by the fire (Ginger, Jujube identified and taught village-wide); gossip that mutates as it travels ("The details have shifted. Nobody seems to mind."); social beats (lingering over the fire, "Nobody walks alone today"); an aid beat with consequence (Hana of Thornfield begs, goes unanswered two days, "They'll remember the silence"); a contest PLAYED (The Cache — won, with Farid winning his own parallel arena); villagers refusing surplus work when shelves are full ("Full shelves don't need my little more", "Leave the wild standing").
- **The cap village is prosperous, not desperate:** pantry 40,896 kcal kept, ~10–12 days fresh on hand, villagers turning from hauling to mending and sweeping. The deferral's cost (no feasts in-window) is invisible as an absence — suppression is silent by design — while the devotion keepsake text still calls the feast "the weapon", which is coherent: the lane stays armed while the feasts wait.
- **Feel notes (not failures):** (1) the Dead Phone keepsake text repeats verbatim three nights running — legible, but loopy, same class as postunlock2-b's Eulogy verse repetition. (2) "STARVING: health and energy falling" fires on days the village eats communal meals from a bursting pantry — the scholar's personal spiral reads as alarming against "eating well" lines. (3) The ring covers only days 177–181 (late-life window); the day-109 deferral onset itself is not visible in this tap — the onset is proven by snapshots, not by narration.

## New findings (for the coordinator's sim-findings.md — NOT edited here)

1. **[open] 2026-10-24 — door-window reach — plain competent reaches wave 4 on 1/8 seeds and wave 5 on 0/8 (719xx band), vs the lead/belong suite's 12/16 w4 and 2/16 w5 on 708xx (postunlock2-b). The door window is out of plain-competent reach; a deferral arm cannot be judged on matched doors on this substrate. Next door arm needs a door-reaching baseline (the landed substrate) or a door-rich band — and its GO bar should be set against that baseline's door rate, not against plain competent. (this run)**
2. **[open] 2026-10-24 — veteran binding — the single observed w4 window never fields a living wave-4+ killer (veterans 0 on all 72 window days, both arms), while armor (6/8), tricks (25), and roster (8) all reach margin in the armed arm. Wave-4 kills that survive are the scarce resource for the door, not gear or knowledge. A veteran-formation arm (not a deferral arm) is the next lever on this axis. (this run)**
3. **[open] 2026-10-24 — feast-survival hypothesis (n=1, NOT a claim) — 71903 armed (0 feasts in-window) survived to cap vs baseline (3 feasts in-window) lost d153. Candidate mechanisms: feast pantry cost, feast-draw fights. Needs a dedicated feast-cost arm; do not cite as a door-arm result. (this run)**
4. **[open] 2026-10-24 — baseline neutrality — 7/8 seeds trajectory-identical across the pass-through baseline and the armed arm; the 71903 pair shares its first window snapshot exactly. Pass-through policy wrappers are a clean baseline instrument for future arms. (this run)**
5. **[open] 2026-10-24 — tooling/SIGTERM — the pilot sweep was killed once by an external SIGTERM after 4 configs (piped output lost, per-seed files intact). Resume-skip recovered all 4; chunked re-runs (2 seeds each) completed cleanly. Sweeps should always run chunked with resume-skip, never as one 16-config foreground run. (this run)**

## Metric review (§14)

The pre-registered bar is met as written in the negative direction: matched doors 0 < 2 → NO-GO, judged without re-scoring. No metric was swapped mid-run; the analyzer's endDay convention was corrected before the verdict run (gameDays runs one past the cap on survived runs — 181 vs the 180 cap — so `days` is the endDay, matching postunlock2-b's "survived d180" convention; the verdict is identical under either convention since no doors exist).
**Residual honesty for the NEXT run:** with 0 matched doors, the bar's second leg (post-door survival means) is undefined, not zero — the pilot yields DIAG, not a lever verdict. The bar itself is sound but was set against the wrong substrate: plain competent's door rate on this band is 0, so no deferral arm could pass here. The next door arm should pre-register its bar against a baseline that actually reaches the door.
**Balanced panel (§15):** NOT run — the panel judges matched before/after on its metric contract, and this pilot has no matched door configs to judge; the matched-pair analyzer is the judge for this pilot. If the next door arm uses a door-reaching baseline, panel applicability should be re-checked before sweeping.

## Proof tests

- **Pre-sweep (scripts/test-doorready.js, original): 19/19 green** — T1–T8 decision/threshold unit tests on stub Games (window, margin-vs-engine, fail-closed, roster bar); T9–T11 env-suppression + restore + snapshot/release tracking; T12 sweep plumbing mini-run (2 × 3-day full-game runs, no repo writes).
- **Post-kill (scripts/test-doorready.js, rewritten): kill-state proof, green** — policy file absent; corpus 16/16 with matching anchor; analysis verdict NO-GO with 0 matched doors; no `doorready` string in `scripts/policies/competent.js` or `src/js/standing.js` (game code untouched); analyzer re-run exits 2 with the NO-GO line; sense transcript present, sayLive, marked NON-MEASURED.

## Telemetry deviation check

Not run: the loop body's telemetry check compares national/table/wins/exiled against the scale-wall baseline, but this pilot's baseline is plain competent (national 0, table 0, wins 0 by substrate — the SEATDRIVE=0-style regime is not the scale-wall baseline's winseat regime, and the corpus is a pilot, not a telemetry roll). Rolling the baseline on a 0-door pilot would corrupt it. No LOUD lines claimed, no baseline rolled.

## Convergence

**NO-GO at pilot, arm killed** | the doorready deferral mechanism is proven to engage exactly as designed (71903: feasts frozen at 3 in-window, margin bars reached except veterans, survival 153→180 at n=1) — but the pilot cannot judge the door question, because plain competent never reaches the door on this band (0/16). The axis question moves: the next door arm needs a door-reaching baseline, and the veteran shortage (0 living wave-4 killers in the only window observed) is the named mechanism to aim at first.

## Blanks filled (builder)

1. **Matched pilot corpus on a fresh band** (71901–71908 × competent/doorready, 16/16, 0 instrument errors) with a machine-checked verdict (analyzer exit 2 = NO-GO).
2. **Door-day snapshot instrument** (readiness bars + standing on the first wave-5 day, in the sweep) — built, never triggered (no doors), documented here for the next door arm to reuse.
3. **Pass-through baseline instrument** (behavior-neutral wrapper + counter stash) — proven by 7/8 identical trajectories.
4. **Kill-state discipline:** policy deleted, instruments + evidence landed, kill-state proof green — no dead arm in the policy set.
