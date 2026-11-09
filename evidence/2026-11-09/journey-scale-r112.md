# Journey Scale r112 — run note (Lane A, leg 3)

- Run: `oversight-playtest-loop`, Lane A leg 3 (SCALE, days 80–140), run_id `2026-11-09T02:45:29Z`.
- Prereg: `evidence/2026-11-09/journey-scale-r112-prereg.md` (binding; seeds 97901–97904, fresh).
- Base: local master `db7fb1c6a`. Policy: `scripts/policies/scalecourt-nogate-morntrace3-linkraise-sit.js` (unchanged).
- Driver: `scripts/journey-scale-r112-20261109.js`; instrument `scripts/ladder-instrument-20261109.js`; analyzer `scripts/analyze-journey-scale-r112-20261109.js`; proof test `scripts/test-journey-scale-r112-veteran-20261109.js` (**12/12 passed**, incl. live smoke leg).
- Evidence: `evidence/2026-11-09/journey-scale-r112/` (band log/err, analysis, per-seed trust/ladder/reggate/wantwatch/capture/transcript/raisetalk/vetkill files).

## Verdicts (prereg bars)

- **Q1 VETERAN WALL: WALL-SCHOLAR — unanimous.** Band-wide wave-4+ kills: **5. Scholar: 5 (100%). Villager: 0. Unknown: 0.** Distinct villager killers: 0 on every seed. Living veterans: 0 everywhere (maxVets=0). The scholar fought 59 wave-4 monsters and killed 5; no villager ever killed a wave-4 monster, in a turn-based fight or in the wild (wild.w4 = 0 on all seeds; villagers' wild kills top out at wave 3). The tribute capstone (`military_tribute`, needs 2 living non-scholar wave-4 veterans) is therefore structurally unreachable on this band — and the scholar's own kills do not count toward it, by the leg-3 rule the readiness and delivery agree on.
- **Q2 SEASONING: SEASONS — 4/4.** Seasoned links: 97901 4/5, 97902 5/6, 97903 5/6, 97904 3/3; first seasoned days d37–d80. **Correction to r111's note:** r111 reported "NO link seasoned on any seed" — r111's own analysis file shows `seasoned=true` on links in every seed (97801: 3, 97802: 2, 97803: 4). Seasoning was never the wall. The wall is the **seal**: `trade_charter` is never ready because no **sealed charter** stands (`no-sealed-charter` on all 8 seeds, r111+r112). Sealing is a table event needing three trade routes; the policy forms primary-sub and covenant links only — **no trade route exists on any seed** (reggate `trade=0/0`), so there is nothing to seal. The charter's blocker is the missing trade-route step, not seasoning.
- **Q3 LADDER OPENS: OPENS — 4/4.** National reached d28–d40 (97901 d32, 97902 d34, 97903 d28, 97904 d40), same as r111.

## The seat, in plain words

- Lesser seat won **3/4** (97901 d90, 97902 d91, 97903 d92); 97904's village died out before taking it. Lesser priced d43–d49.
- **Full seat priced 0/4** (0/8 across r111+r112). The full seat needs National peak **and** a delivered capstone deed; National is there on 4/4, the deed is not.
- What paces the lesser seat is **not** sentiment (taught d12–d15) or the ladder (Village by d2–d8) — it is the story arc: the table arc (arc 4) arrives d43–d47, and the seat prices d43–d49, right behind it.
- Capstones ready: **none, on any seed.** Charter: no sealed charter (see Q2). Embassy: no feast bundle (r111's 97803 delivered it once at d33, so the bundle can form — it just didn't here). Tribute: veterans-short (see Q1). Deliveries: 0/0 — nothing was ever ready, so the delivery verb was never exercised; the DRIVER-VERB secondary is not applicable this run.
- Minting gap, confirmed again: explore caps on 4/4 (30–46 points, counted 24) while fight mints 3–4. The ladder still rewards walking around far more than fighting.
- Cash-out: none. No village cashed out as a Respected Village; banked head-start 0 everywhere.
- Pellet radiation: live. On 97901 the bearer boosted 9 times (Radiation +2 each) and the sickness line fired repeatedly ("nausea that doesn't pass, weakness in the limbs"). The health cost is real and voiced. No radiation cure was observed in the captures.

## Census (plain words)

- **97901 — one person left.** 56 dead; the village ends as a single survivor (the scholar, Sofia Chen) with a 2,313-kcal pantry, 5 links (4 seasoned), global rank. Won the lesser seat on the last day, d90.
- **97902 — seven left.** 52 dead; pantry 10,391 kcal; 6 links (5 seasoned); global rank; lesser seat won d91.
- **97903 — ten left.** 57 dead; pantry 8,886 kcal; 6 links (5 seasoned, including two covenant links seasoned d79–d80); regional rank; lesser seat won d92.
- **97904 — nobody left.** 74 dead; pantry 0; the whole village died out by d90 (starvation and sickness appear here and nowhere else). The lesser seat was priced d43 but never taken — the village was still waiting at the table when it died.
- Deaths are dominated by villagers dying in fights in the field ("villager combat": 30–35 per seed). The scholar's own fight deaths ("combat": 6–14) are the smaller share. Villagers meet monsters constantly and lose constantly — and when they win, it is never against a wave-4 beast.

## People check (Q4)

Read in full: both day-90 transcripts (97902, 97903) and all 21 raise talks. No day-120 transcript exists — no seed reached d120 (all ended d90–d92). 97901 and 97904 have no day-90 transcript either (their runs ended exactly on d90).

- **Transcripts: clean, 0 senseless.** Duc (veterinarian, gentle, trust 90) dreams of "rows of pods. Humming." and the player promises to ask the System about it — the exchange lands, the thanks fits, the close is warm. Nina (mechanic, dry, trust 27) asks when the player last really laughed; the deflect ("Laughing feels wrong now") gets a good answer ("It feels wrong because it matters"). Both read like people.
- **Raise talks, re-counted (21 total: 15 accepted, 6 not-offered):** accept echo 15/15 ("All right — let's ask them." repeated back verbatim); post-accept brush-off close 15/15 ("Sure. I'll be around." / "Oh — okay. Later, then." / "Right. Go on, then."); unvoiced raise 3/15 (97902-8: a confession with no raise spoken; 97904-1: a mood line; 97904-3: a wound-care ask — in all three the player answers a link proposal nobody made, and the proposal is carried anyway); unanswered invitation 9/15 ("Walk with me?" / "Walk my trap line with me?" / "Come see what I found" / "Come get air with me" — never answered, the talk jumps straight to the raise). These are the same three defects r111 documented, unchanged. **Fix still owed, not done this run** (conversation-engine change; out of this run's prereg scope).
- **Worth naming:** the six Baraka talks (French-only villager, 97902) are good — the language barrier is played honestly through mime and gesture, with one proud English word ("Fuck you." / "Food?"), and no link is offered to someone the player cannot talk to. That is the design working.

## What this means for winnable

The lesser seat works (3/4). The full seat does not, and r112 names the two walls precisely: (1) the veteran wall — villagers never kill a wave-4 monster, so the tribute deed can never be paid; (2) the trade-route wall — no trade route is ever formed, so the charter can never be sealed. The embassy (feast bundle) is the only capstone that has ever been delivered on this leg (r111's 97803), so the full seat's only live path today is the feast bundle — and it did not form on any r112 seed. A full win on the scale leg needs either villagers who can kill wave-4 beasts, trade routes that actually form, or a feast bundle that forms reliably. None of those is a measurement question anymore; all three are build questions.

## Instrument fixes (pilot-found, proof-tested)

1. **Death watch was blind:** the roster-scan-only watch recorded 0 of 56 deaths (dead villagers leave the roster). Fixed: daily drain of the telemetry ring (primary) + roster scan as backup, each death once, with cause. Band evidence now carries real death records.
2. **killAttr mislabeled past scholar lives:** the same-day rule counted a past scholar life's kills as villager kills (pilot: all 3 wave-4 kills were the scholar's across two lives; the old rule reported scholar 0 / villager 3). Fixed: killAttr now uses the day-joined rule (classifyKill + scholarVidsByDay), matching the analyzer. Regression test added (succession case) — proof test now 12/12.
- Both fixes are instrument-only (zero policy/behavior change). The band re-ran the pilot seed 97901 with the fixed instrument and reproduced the pilot's game outcomes exactly (same ladder rows, same kills) with the corrected classification.
- Minor instrument observation: scholar-vid map covers 87 of 90 days (days 1 and 3 have no snapshot); classifyKill falls back to d−1, which is correct for succession at day boundaries.

## Metric review (§14)

- Q1/Q2/Q3 bars held as written; no mid-run re-scoring. Q1's WALL-SCHOLAR bar fired on the first mechanism checked (scholar share 100% ≥ 70%) — the mortality/thin branches were never reached because no villager kill exists to be mortal or thin.
- **r111 correction (carried):** r111's note said no link seasoned; its evidence shows seasoned links on all four seeds. The prereg's Q2 question was right; the note's reading of it was wrong. This run's Q2 section is explicit (per-link first-seasoned days) so the same misread cannot recur.
- Open sub-question for the next run: do villagers ever *face* wave-4 monsters in the wild and lose, or do wave-4 spawns never reach them? The kill log only records kills; field-fight losses are not in this run's instruments.
- The raise-talk defect counts are stable across r111→r112 (echo 16/16→15/15, unvoiced 3/16→3/15, unanswered 8/16→9/15). A fix, when it lands, should be judged against these counts.

## Telemetry

`node scripts/telemetry-check.js` vs `telemetry-baselines/scale.json` (fightsTotal, fightsByWave.4, maxGameDay): **quiet** — 4 files, 3 metrics, no large deviations. Band totals: fightsTotal 104 (baseline 142), fightsByWave.4 59 (baseline 91), maxGameDay 363 (baseline 365). No LOUD lines; no baseline roll. The fight totals are lower because three seeds ended on a won lesser seat at d90–92 rather than running to the day cap — the horizon, not a regression.

## Tests

- Proof test `scripts/test-journey-scale-r112-veteran-20261109.js`: **12/12 passed** (incl. live smoke leg, seed 97901 DAYCAP 60, 0 instrument errors).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`: **294 passed, 6 failed in 901s** (log: `evidence/2026-11-09/journey-scale-r112-checkquick.log`). All 6 adjudicated **pre-existing, none caused by this run** (this run changed zero `src/js` and zero harness/collector inputs): measurement-proof freshness ×2 (`test-measurement-proof-update`, `test-measurement-workflow` — retained neutrality proof does not cover current Game/controller/harness inputs; master moved under the proof), mobile combat cadence ×1 script / 2 checks (Continue round-wrap), occupation panels CLI ×1, phone-frame proof staleness ×1 script / 3 checks (receipt source stale vs current index.html), establishment racks-voice daily-reset ×1. My proof test passed inside the gate (not among the failures).

## Files (this run, in the worktree)

- `evidence/2026-11-09/journey-scale-r112-prereg.md` (binding prereg + pilot addendum)
- `evidence/2026-11-09/journey-scale-r112.md` (this note)
- `evidence/2026-11-09/journey-scale-r112/` (band log/err, analysis txt/err, pilot log/err/analysis, per-seed trust/ladder/reggate/wantwatch/capture/transcript/raisetalk/vetkill files)
- `scripts/ladder-instrument-20261109.js` (death watch + killAttr day-joined fix)
- `scripts/journey-scale-r112-20261109.js` (band driver)
- `scripts/analyze-journey-scale-r112-20261109.js` (analyzer)
- `scripts/test-journey-scale-r112-veteran-20261109.js` (proof test, 12 checks)

## LOUD items

1. **Master/origin divergence (pre-existing, standing state):** local master is ahead 156, behind 76 vs origin/master (merge-base d229b58f5). This run proceeded on local master `db7fb1c6a`; no merge, no push, no rebase of origin. The ship loop owns pushes and origin reconciliation. Landing is ff-only into local master and cannot revert anything.
2. **Stale-lock recovery:** the previous run's lock (2026-11-09T00:27:22Z, worktree `journey-deepening`, heartbeat 29 min stale) was declared dead per the guard; lock deleted, new lock created. That run's worktree has uncommitted changes — not mine to commit or release; left untouched.
3. **97904: the village died out entirely** (74 deaths, pop 0/0) while waiting at the table for a lesser seat priced d43.
