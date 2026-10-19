# Journey ENDGAME R22 (2026-10-19) — PATH BREADTH: all seven doors

**Run id:** playtest-loop-2-20261019T1300Z (oversight-playtest-loop-2, lane B). Worktree: `journey2-endgame`.
**Base:** master 43e61a81c (fresh at registration; no mid-run sibling landing). Rotation file read 4 (endgame); advances to 5 at the end of this run.
**Stale-lock recovery:** lock from `playtest-loop-2-20261019T1055Z` (~2h old, no registry entry for its run_id) deleted per the 90-min fallback; this run created its own lock.
**Service restart mid-run:** the VM service restarted during batch-2; /tmp logs wiped (lesson re-confirmed), batch-2 sims died with no evidence written — re-ran from workspace logs. No evidence lost.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** PATH BREADTH at the table. Every r19–r21 run entered feared/light (DOORS preference order). TABLE.md promises all seven paths are played challenges, each a different game. Can competent play enter each door and play its challenge to a resolution?

**Interesting-finding bar:** the instrument records offered doors, picked door, beat frames, branch, and resolution on 100% of sits; either ≥3 non-feared doors enter their played challenge on ≥1 seed — or the instrument files exactly why not (seat gating, unearned doors named and priced).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 instrument GO: 100% of sits record offer list, pick, door entry, frames, resolution.
- M2 breadth GO: ≥3 distinct non-feared doors enter their played challenge (frames beyond the path choice) on ≥1 seed.
- M3 people GO: ≥2 sense-reads of path beats across runs; 0 senseless flags.
- M4 census GO: all runs end cleanly with real censuses; no crash/softlock.
- M5 guardrail GO: the feared baseline reproduces r21's shape (table announce ~d90, win).

**Seeds:** pilot 8993 × 7 doors; expand each entered door × 2 more seeds (9006, 9013). **Horizon:** 260 loop-days, death-aware. **Stack:** r21 baseline (seat-driver tip + titan driver with stand-down hook; env TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1 BELONG_V3=1) + PATHFORCE door steering. Capable's `scoreTableOption` (reads stakes, light-leaning, never volunteers trial-by-combat) plays the rest of each challenge.

## DECISION LIST (my calls — Steve corrects)

1. **R22's blank target: path breadth.** r19–r21 proved the seat and the coalition; every run took the same door. Six doors were unplayed.
2. **PATHFORCE steering at the paths phase; the scorer plays the challenge.** Forcing is honest: the door choice is the only divergence; everything before is the identical seat-driver run.
3. **Indispensable mechanics probe via direct `tableStartPath()`** (FORCE_START=1), recorded as `mechanicsProbe` — the offer gate (full seat only) blocked earned entry; the probe tests the challenge mechanics, not reachability.
4. **The relay-person fix filters to the LIVE roster**, not merely the not-dead: trust entries outlive the dead by design (they're ledger), so the candidate set is `roster ∩ trust`. An all-dead village routes to the designed stall ("there is no one left to name") instead of naming a corpse.
5. **Sprite test → quarantine, not fixed.** `test-sprites-valid` fails on pristine master (4 missing monster sprites) — visual-content work, out of the endgame leg's scope.

## RESULTS

### Path breadth (pilot 8993 + expansion 9006/9013)

| seed | feared | defiant | beloved | witness | assimilated | relay | indispensable |
|------|--------|---------|---------|---------|-------------|-------|---------------|
| 8993 | light | light | **dark** | light | light | grey | not offered → mechanics probe: light |
| 9006 | light | light | **dark** | light | light | grey | — |
| 9013 | light | light | **dark** | light | light | grey | — |

- **M1 GO:** doorPicks (offer + forced + not-offered flags), doorEntries, frame transcripts, wonTele recorded on 19/19 runs.
- **M2 GO:** 5 non-feared doors entered on all 3 seeds.
- **M3 GO:** 5 sense-reads (defiant, beloved, relay, witness, assimilated); 0 senseless flags.
- **M4 GO:** 19 full runs (7 pilot + 12 expansion + 1 probe), all clean, no crash/softlock.
- **M5 GO:** feared baseline: announce d90, win, on all 3 seeds — r21's shape reproduced.

### What each door actually is (played, not described)

- **Feared:** the known road. Won light ×3.
- **Defiant:** a reverse auction — tribute ships (real pantry kcal), the relay's person (a NAMED villager leaves via `removeVillager`), de-integration (real integration loss). Prices paid in full on all 3 seeds; light ×3. See the blank below for the named-person bug found and fixed.
- **Beloved:** the variety finale — cast the notable, the audience meter can turn, the edit-bay offer ("final cut on your own legend"). Won **dark ×3**: this playbook's showmanship ≫ protected×2 wires the branch dark every time — "The show becomes the government, and the government is *you*, focus-grouped." Legible consequence of a contest-grinding playstyle, not RNG.
- **Witness:** the trial — "the defense doesn't argue the charges. It argues *you*." Villagers testify in their own words (Stephen: "I don't know what they are. None of us do."). The settlement offer: justice in public or quiet. Light ×3.
- **Assimilated:** placement haggling — branch, access tier, intake scan: "WHAT ARE YOU SMUGGLING?" Light ×3.
- **Relay:** the cockpit — probe/reroute/deepen/commune; the System "notices you noticing"; a backfire scatters a day's messages. Grey band ×3 (leaning meter, not a coin flip). Finale: "Stay both-hands. No merge, no champion."
- **Indispensable:** correctly **not offered** on the lesser seat — "the galaxy must actually need you, not just notice you." The mechanics probe (bypassed offer gate) played the full challenge: three clauses with the exit-ramp build option, light win, "Humanity becomes the galaxy's engine: prosperous, entangled, never quite free, but *leavable*."

### Village assessment (census in plain words — seed 8993)

A brutal endgame. Days 80–88 took Oliver, Ruth Goldstein, Olivia Vik, and Maya Singh in combat; the bearer's mantle passed through Olivia → Maya → Tashi. At the table only **Ava** (street artist) and **Ermek** (radio DJ) were still standing — and in the defiant run the village then paid Ermek to the relay, ending with Ava alone. The defiant's price names the highest-trust villager, and on a thinned village that price is existential. Robin Wu — the healer who taught half the village — died day 22 (the first grave); the table still named him (the blank below). The pantry held 0 kcal at table day on this feast-heavy playbook; the defiant's 20,000-kcal tribute was covered by the Long Road build ability — the one honest way out, spent correctly.

## BLANK FILLED: the relay's person named a dead villager

**Found:** `relayPerson()` in `src/js/table-defiant.js` read the trust table and never consulted the roster. Trust entries outlive the dead — so the defiant's Price Two named **Robin Wu, dead 68 days**, as the living price: "You name Robin. They nod — they've known since the price list slid across. The relay gets its hands. The village loses its steadiest." A corpse can't nod; the relay got its hands on someone already buried and the village lost no one. The PRICES-ARE-PRICES law was violated silently.

**Fixed (worktree):** candidates = live roster ∩ trust table. If no living villager is trusted, the id stays null and the price stalls with "there is no one left to name" — the designed failure, not a phantom sacrifice.

**Proof:** `scripts/test-defiant-relay-person.js` — RED on the old code (names dead Gabriel), GREEN on the fixed code (names the highest-trust living villager, Oscar). Verified via patch-revert, no stash. Full defiant path re-run post-fix: won defiant/light, the price named the living **Ermek** — and the final census shows Ermek actually gone to the relay. The price is real now.

## BLANKS DOCUMENTED (Steve's call)

1. **Indispensable unreachable in earned play on this cadence.** Full seat never earned in r19–r22 (the seat-driver sits at the lesser seat, correctly). The offer gate is the design (TABLE.md); the challenge mechanics are green via probe. Question for Steve: is the door being full-seat-only acceptable, or should a competent non-god run ever see it?
2. **Beloved-light unplayed.** The contest-heavy seat-driver playbook wires beloved dark 3/3 (showmanship ≫ protected×2). The "genuine love" light variant has never been played to completion — needs a quieter, protection-first playbook to reach it.
3. **Green-list break: `test-sprites-valid-20261014.js`.** Pre-existing on pristine master (verified failing with and without this run's changes — 4 monsters missing aggro/calm sprites: dustboar, sunback, sweeps_week, cliffhanger). Moved to `green-list-quarantine.txt` with reason per the quarantine convention; un-quarantine when the sprites ship.

## Reachable / Fun / Winnable

- **REACHABLE:** all 6 lesser+ doors entered through the normal player surface; the paths prompt names all seven doors and prices the unearned one ("some open, some priced beyond you") instead of hiding it. The war-council/dead-ledger/audit beats read the real run aloud.
- **FUN:** each door is a different game — the reverse auction's prices have faces (Ermek), the trial's defense argues *you*, the cockpit's machine learns grief, the edit bay sells focus-grouped government. The OUTSHONE beat (Maya Singh did what you would not) fires on every path — NPC heroes are real.
- **WINNABLE:** 18/18 earned-door runs won (branches: defiant/feared/witness/assimilated light, beloved dark, relay grey). The table remains winnable on every door competent play can open.

## Regression

- `node scripts/check.js --quick`: 96 passed, 1 failed (341s). The failure is `test-sprites-valid` — pre-existing on master, quarantined (see above). This run's changes: `src/js/table-defiant.js` (relayPerson roster filter), `scripts/test-defiant-relay-person.js` (new proof), `scripts/journey-endgame-r22-20261019.js` (new driver), `scripts/green-list.txt` + `scripts/green-list-quarantine.txt` (quarantine move).
- Defiant path end-to-end re-run post-fix: won defiant/light, 6 frames, price named a living villager.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`: **LOUD on 5 metrics** (wins, table, tableSceneFired, tableSceneCompleted, seatApproach all "swung 157%": baseline 7 → current 18). **Verdict: explained, not drift** — the swing is a denominator artifact (n=18 runs vs baseline n=7; win rate 18/18 vs 7/8 — up, not down). The endgame axis is healthy: every run reaches the table and wins. Baseline NOT rolled forward (same mixed-horizon reasoning as r21). Evidence: `evidence/2026-10-19/tele-r22-baseline.json`.

## METRIC REVIEW (§14)

- M1–M5 all GO. No re-scoring.
- Pre-observation corrections (not re-scores): (1) the FORCE_START probe logic initially fell back to DOORS order instead of probing — fixed before any probe run counted (the first probe fell back to feared and was discarded); (2) the proof test's expectation tightened mid-run (top-trust living villager, not a fixed one) — RED/GREEN re-verified after.
- Kill taxonomy: no kills this run. The service-restart batch-2 die-off was infrastructure (recovered, no data invented).

## Evidence

- `evidence/2026-10-19/journey-endgame-r22.md` (this note)
- `evidence/2026-10-19/journey-endgame-r22-r22-<path>-s<seed>.{json,txt}` + `-frames.json` (19 full runs: 7 pilot + 12 expansion + 1 mechanics probe)
- `evidence/2026-10-19/tele-r22-baseline.json` (telemetry aggregate)
- `evidence/2026-10-19/logs/r22-*.log` (driver logs)
- `scripts/journey-endgame-r22-20261019.js` (PATHFORCE driver), `scripts/test-defiant-relay-person.js` (proof)

**Game-code changes:** `src/js/table-defiant.js` (relayPerson roster filter). Merged locally, pending ship.
