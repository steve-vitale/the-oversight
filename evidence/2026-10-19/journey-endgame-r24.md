# Journey ENDGAME R24 (2026-10-19) — BELOVED-LIGHT VIA THE PROTECTION-FIRST PLAYBOOK

**Run id:** playtest-loop-2-20261019T2255Z (oversight-playtest-loop-2, lane B). Worktree: `journey2-endgame`.
**Base:** master edd3021d1 at registration (rev-parse verified match). Rotation file read 4 (endgame); advances to 5 at end of run.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** BELOVED-LIGHT — r23's named next. r23 wired `arenaAct`
(heroic contest picks → `protected` +1..+3) but found `protected` = 0 on all
runs: the seat-driver's reward-scorer never picks heroic acts and fights solo.
This run composes the protection-first playbook on the r23 stack:
(1) HEROIC=1 picks heroic contest choices (notability sacrifice/gallant/
principled → protected +3/+2/+1), refusing optional non-heroic contests;
(2) party maintenance (2 trusted villagers invited, placed at the player
daily) so party-present monster kills accrue protected+1 via the fixed
ledger.js channel; (3) PATHFORCE=beloved.

**Interesting-finding bar:** branch flip (beloved light) on ≥1 of 2 pilot
seeds = the r22 blank #2 filled; otherwise the ledger gap
(showmanship vs protected) named numerically = the mechanism measured.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 instrument GO: 100% of runs record seatAtAnnounce + seatAtEnd +
  heroic/party counters on 100% of runs.
- M2 branch GO: beloved branch = light on ≥1 of 2 seeds (tableBranch rule:
  `showmanship > protected*2 → dark`; needs protected ≥ showmanship/2 and
  betrayed = 0).
- M3 people GO: ≥2 sense-reads of r24 endgame beats; 0 senseless flags.
- M4 census GO: all runs end cleanly (win / honest loss / extinction);
  no crash/softlock.
- M5 guardrail GO: table announce ~d90+ (day-90 floor), no crash,
  shape consistent with r23.

**Seeds:** pilot 9031–9032 (fresh — unused by r19–r23). **Horizon:** 260
loop-days, death-aware. **Stack:** r21/r22/r23 seat-driver tip + titan
driver with stand-down hook (TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1
BELONG_V3=1) + HEROIC + party maintenance + PATHFORCE=beloved.

## DECISION LIST (my calls — Steve corrects)

1. **R24's question: beloved-light** — r23 blank #2's named next. Not a
   code bug to fix first; a playbook question the r23 arenaAct wiring
   made answerable.
2. **Fixed the party channel in game code** (src/js/ledger.js): the
   registerDeath wrap read `this.state.party` — never written outside
   debug-scenarios — so party-present monster kills could NEVER accrue
   `protected`. Now reads `state.village.party`. Proof RED→GREEN
   (test-party-protect-channel-20261019.js, 5/5). Sibling instance noted:
   alienPlayers.js:2822 `apReadinessCheck` reads the same wrong path —
   documented, not fixed here (alien-player spawn gating is not this leg).
3. **Heroic picks override QUIET, they don't replace it**: HEROIC=1 picks
   the heroic choice when one exists; optional contests without a heroic
   option are refused. Entering a contest voluntarily to do heroics is the
   honest protection-first play.
4. Kept the r23 stack byte-identical otherwise (titan driver + stand-down,
   windefer, tribfloor) so the only confound is the playbook.

## RESULTS

### The branch flip (arm A pilot, seeds 9031–9032, PATHFORCE=beloved + HEROIC)

| seed | days | won | door | branch | show | prot | heroics | refusals | invited |
|------|------|-----|------|--------|------|------|---------|----------|---------|
| 9031 | 69 | no | — | — | 12 | 4 | 0 | 2 | 7 |
| 9032 | 169 | yes | beloved | **light** (light=3, dark=2) | 26 | 8 | 0 | 4 | 5 |

- **M1 GO:** seatAtAnnounce + seatAtEnd + heroic/party counters recorded on
  2/2 runs (100%).
- **M2 GO:** beloved light on 1 of 2 seeds (9032). Branch math:
  `showmanship 26 > protected*2 = 16 → dark+2`, but the SHARED light
  signals fired because protected finally > 0: "the protected outnumber the
  killed" (+2), "the food truth was shared" (+1) → light 3 > dark 2.
  r23's mechanism confirmed: with protected=0 the light channel is
  dead-on-arrival; with protected=8 it carries.
- **Where the protected came from:** party-present monster kills
  (partyDays 61–162, invited 5–7). heroics=0 on BOTH seeds — no heroic
  contest choice (`do.notability` in sacrifice/gallant/principled) was
  offered in 238 run-days. The arenaAct wiring (r23) works when triggered;
  the options simply never surfaced.
- **9031** died honestly at d69 (village collapsed to Maya the ER nurse and
  Rosa the line cook before the day-90 floor; no table). protected=4 was
  accruing but the run never reached the leg's window.
- **M5 GO:** 9032 announced d169 (lesser seat: w1/w2/w3 = 15/8/3 distinct,
  13 contests, 3 crises, regional, stage 3, food deeds true). Later than
  r23's ~d90–100 (the 3rd wave-3 distinct fight came late); inside the honest
  envelope. Full seat still blocked on the wave-4/5 wall (w4=0, w5=0) —
  r23's finding re-confirmed on the fixed code.
- **M4 GO:** both runs ended cleanly (win / honest pre-table death). No
  crash, no softlock. check.js --quick: 96/96 green.

### Village assessment (census in plain words)

- **9032** (won d169, beloved/light): all 9 alive — Cesar (dockworker),
  Emmanuel (lawyer), Ivy (journalist), Mara (army medic), Valeria (pottery
  instructor), Ella (ESL teacher), Emma (Veterinarian), Daniel (hunter),
  Greta (Sailor). A whole village at the table — the beloved path's
  fiction, played straight.
- **9031** (fell d69): collapsed to 2 — Maya (ER nurse), Rosa (line cook).
  The pantry/food engine decided this one early; the protection playbook
  was mid-build when the village ran out of people.

### People check (M3 GO — 2 sense-reads, 0 senseless flags)

1. **Beloved-light frames (s9032):** branch-voiced, not menu'd. Paths
   prompt prices each door honestly (Indispensable: "the galaxy must
   actually need you, not just notice you"). Act 1 pulls REAL villagers
   (Mara, Ella, Tashi). Act 2's YOUR BUILD line reads "It has your name on
   it, in somebody else's handwriting." Act 3 (light): THE QUIET ONES —
   "villages nobody filmed, and dead nobody named — and you have spent this
   whole run learning their names. Spend it here, or keep it." The light
   twist from TABLE.md, voiced on the record. Finals: "Let the audience
   speak / Speak for the quiet ones." The dark edit-bay temptation from
   r23's s9026 is replaced, not reworded — the branch is a different game.
2. **Day-130 conversation with Cesar (s9032):** NPC wants something (news
   of his taken brother Ryan — the Taking, KIN.md honored). He has a goal,
   a grief, a jacket he keeps, dreams about the pods. Options engage it;
   the ending plants the thread ("Whatever door it is — it'll still be
   there tomorrow"). No fabricated shared history; coherent; earned.

## BLANK FILLED: party-present kill channel was dead in real play

**Found:** `Game.registerDeath`'s moral-ledger wrap (src/js/ledger.js:1470)
read `this.state.party` — a path only debug-scenarios ever writes. The real
party lives at `state.village.party` (party.js / party-formal.js). So
`protected+1` on party-present monster kills NEVER fired in real play —
beloved-light's biggest channel was unfireable from the start. r23's
named-next assumed the channel worked.

**Fixed (worktree, src/js/ledger.js +3/-2):** the wrap now reads
`this.state.village.party`; any non-empty party → `ledgerAdd('protected', 1)`
on player-caused monster/hostile kills. Solo kills unchanged (no accrual).

**Proof:** `scripts/test-party-protect-channel-20261019.js` — RED 2/5 on
unfixed code (party formed, protected stayed 0), GREEN 5/5 after. Solo-kill
control stays 0 throughout.

**Sibling instance (documented, not fixed here):** alienPlayers.js:2822
`apReadinessCheck` reads the same wrong path (`this.state.party`) — the
alien-player spawn gate never sees the real party. Alien spawn gating is
not this leg's domain; filing it as a named next for lane A or a lever run.

## BLANKS DOCUMENTED (Steve's call / next runs)

1. **Heroic contest options never surfaced** (heroics=0 across 238 run-days
   on 2 seeds). The arenaAct wiring is proven live (r23's proof), but the
   protection-first playbook currently rides on party kills alone. If heroic
   choices are meant to be a real channel, their offer rate in contest
   generation needs measurement — or the fixture is rarer than intended.
   Named next: measure heroic-option offer rate across 10 seeds (offered /
   contest), pre-register an offer-rate bar.
2. **Full seat = the wave-4/5 wall**, re-confirmed post-fix (w4=0, w5=0 at
   d169 on a winning run). All other criteria clear. The door opens when
   the wave wall falls — owned by the monster/wave lane.
3. **Beloved-light is real and reachable by play**: party fights +
   food-truth sharing flip the branch without a single heroic contest pick.
   The r22 blank #2 is FILLED.

## Regression

- `node scripts/check.js --quick` (`--cacheDirectory=/tmp/jest-cache-playtest2`):
  **96 passed, 0 failed** in 292s (sprites test quarantined per r22).
- Proof test RED→GREEN as above.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`:
6 LOUD lines (wins/table/scene/seatApproach −86%, national disappeared).
**Verdicts: all explained, no real bug.** The pilot is n=2 vs the n=8
baseline — 9031's d69 honest pre-table death contributes zero table metrics
by design; 9032 won at regional rank (lesser seat allows regional, and
national was only 5/8 in the baseline). Baseline NOT rolled forward (pilot,
n=2 — same call as r23). Evidence:
`evidence/2026-10-19/tele-r24-aggregate.json`.

## METRIC REVIEW (§14)

- M1–M5 all GO. No re-scoring.
- Kill taxonomy: no kills this run.

## Reachable / Fun / Winnable

- **REACHABLE:** beloved light now reachable by competent non-god play
  (party + food-truth + promises), without any heroic contest pick ever
  firing. The branch is earned from real deeds, not chosen from a menu.
- **FUN:** the light beloved is a different game from the dark beloved —
  Act 3's QUIET ONES choice and the "spend it on the quiet ones" final read
  as earned television; the frames cast real villagers by name.
- **WINNABLE:** 1/2 won (beloved/light d169); the other died honestly d69
  pre-table. The table remains winnable on every door competent play can
  open.

## Evidence

- `evidence/2026-10-19/journey-endgame-r24.md` (this note)
- `evidence/2026-10-19/journey-endgame-r24-r24-heroic-beloved-s903{1,2}.{json,txt}`
  + `-frames.json` (+ `-convos-s9032.txt`)
- `evidence/2026-10-19/journey-endgame-r24-r24-heroic-beloved-summary.json`
- `evidence/2026-10-19/tele-r24-aggregate.json`
- `evidence/2026-10-19/logs/r24-heroic-beloved.log`, `r24-checkquick.log`
- `scripts/journey-endgame-r24-20261019.js` (heroic/party driver),
  `scripts/test-party-protect-channel-20261019.js` (proof)

**Game-code changes:** `src/js/ledger.js` (party-present kill channel,
+3/-2). Merged locally, pending ship — no bump/push (ship loop owns that).
