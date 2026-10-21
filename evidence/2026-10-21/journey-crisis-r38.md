# Journey — crisis leg r38 (lane B): the siege aftermath (2026-10-21)

Run: oversight-playtest-loop-2, 09:00 CDT. Rotation-b read 6 at start → leg 6
(crisis). Base 5446354e6. Worktree journey2-crisis. Commit: (see landing).

Prior art: r32 (outbreak, clean bill), r34 (famine), r35 (siege social-fabric:
M1/M2/M3/M5 GO, M4 NO-GO instrumented-wrong; named nexts: revised per-death
grief-reach metric + lingering-raider fate), r36 (compound: the scattering is
the break; first-grave fires once), r37 (aftermath: scattering end-screen,
dead-proposer, hunger-pool fixes; named nexts: M3a/M3b, M4 thin).

## PRE-REGISTER (written before any play)

**Leg question:** The siege aftermath. (1) Do the siege dead get mourned
SPONTANEOUSLY — no driver-forced grief beats, only the game's own channels?
(2) What becomes of lingering raiders — do they drift off within ~6 nights
as the narration promises, or stick?

**Canon:** docs/MONSTER-WAVES.md (fights not rolled), design call #8
2026-10-16 (lingerers: endure-default 6-day valve or real sortie),
death-liturgy 2026-10-21 (griefLine codas, presence-gated). Steve:
"violence desperate and traumatic."

**Bound metrics (§14):** M1 siege is lived (≥3 raids/seed); M2 defense
organizes (≥50% raids with ≥1 defender); M3a spontaneous mourning,
stable-tail deaths (≥50% get a spontaneous signal within 7d); M4 lingering
resolves (≥80% of episodes resolve within 8d); M5 no theater (0
fabricated-history lines; gorge claims match pillage); M6 schema alignment
(defenderFights, playerFights, defendedCount, latelyDefenseCount;
crisis.json re-seeded — r35's named next). M3b compound deaths: reported,
unbound.

**Substrate:** oracleV2, 20d establish + 70d siege season, 3-day chunks,
death-aware. NO driven grief convos (spontaneity is the question); one
ask:lately convo per death (days 2–7, witness = first living non-player —
the TOPIC is the NPC's own, r37 probe framing). Seeds 101/202/303 pilot,
expanded to 404/505/606.

**Instrument:** scripts/journey-crisis-r38-aftermath-20261021.js (r35 fork:
registerDeath reads o.villagerId + o.kind — r36's lesson; lately-convo per
death; lingering-episode tracker; telemetry schema paths).

## Pilot + expansion results (6 seeds × 90d, post-fix)

| seed | raids | raidFights | personDeaths | M3a | M3b | episodes |
|------|-------|-----------|--------------|-----|-----|----------|
| 101 | 7 | 27 | 11 | 8/8 | 2/2 | 1 (window-end artifact) |
| 202 | 8 | 37 | 6 | 5/5 | 1/1 | 0 |
| 303 | 7 | 31 | 9 | 6/6 | 2/2 | 0 |
| 404 | 6 | 27 | 6 | 6/6 | 0/0 | 0 |
| 505 | 5 | 14 | 18 | 13/13 | 2/2 | 3 |
| 606 | 9 | 23 | 15 | 9/9 | 4/4 | 2 |

### Metric verdicts

- **M1 GO** (5–9 raids/seed, all ≥3).
- **M2 GO** (21/22 raids defended on pilot; 41/42 across 6 seeds).
- **M3a GO — 47/47.** Every stable-tail death got a spontaneous mourning
  signal within 7d: death-liturgy griefLine codas naming the dead
  ("💀 The Choir Toad killed Sam in 1 round. The village mourns."),
  villageEvent('death') beats ("Nobody's talking much. The fire feels
  smaller tonight."), and the witness's own lately/mourning topics
  ("I dreamed Josefine was still here. Woke up angry at the dream.
  Stupid." / "Courtney is gone and Victor is gone and the world just...
  continues. That's the part I can't stand."). Zero silent deaths.
- **M3b 11/11** (unbound, reported).
- **M4 GO — 6/6 episodes resolved within 8d** (details below).
- **M5 GO** — 0 fabricated-history lines in sampled transcripts; gorge
  say-claims match pillage records exactly (0 mismatches across 6 seeds).
- **M6 GO** — schema aligned; crisis.json re-seeded from the 3-seed pilot
  (95/0/21/0); check quiet.

## The lingerer findings (the leg's real question)

Natural siege seasons rarely leave raiders unmet (pilot: defenders meet
~95% — 1 episode in 22 raids). A staged probe (shelterEveryoneBut, the
honest "bar the hall" verb, then the player's explicit endure answer)
exposed three linked blanks, all fixed in the worktree with proof tests:

### 1. Fleeing a lingerer deleted the siege (FIXED — game.js)

startCombat removes the world monster at fight start (game.js:31925) and
break-it combat-2 never restores wild-encounter monsters. A scholar who met
a lingerer and FLED deleted it anyway: the probe's 5-raider siege cleared
in 2 days through incidental contact; the answered endure never got its
~6 nights; the moved-on valve never fired. Proof:
scripts/test-lingerer-flee-20261021.js — RED pre-fix (fled lingerer gone),
GREEN 9/9 post-fix. Fix follows the titan precedent (worldOrigin):
a lingerer the scholar fled from or lost to returns to the treeline,
WOUNDED (the blows landed); a routed one broke and ran (treeline clear);
a slain one is gone. Say line on flee: "It didn't leave — you did. The
treeline holds its shape; the siege goes on."

### 2. The ~6-night drift promise had no clock of its own (FIXED — havenGrowth.js)

The narration promises lingerers "drift off within ~6 nights", but the
only implementation was the crisis-based moved-on valve (comms.js: only
while a raid crisis is open). If the crisis resolved early — or never
raised — a lingerer gorged forever (probe: 8 nights, no clock). Fix:
per-raider drift — lingerSince stamped when the lingering starts (never
re-stamped; a fled fight doesn't reset it); havenGrowthDaily clears the
flag past ~6 nights with "The lingering X paces the treeline one last
night, then melts back into the dark." Proof:
scripts/test-lingerer-drift-20261021.js, 3/3 GREEN. Pre-existing
unstamped lingerers never drift (safe default).

### 3. The 'fought' resolution could fire with a raider still out there (FIXED — comms.js)

Two causes: (a) the threat check required exact haven-tile equality, but
a lingerer mid-map (chasing, or restored after a fled fight before the
next dawn re-pin) isn't on the tile — probe: landlord@2,4 missed while
"the door is quiet" fired; (b) a lingerer lifted off-map for a scholar
fight was invisible to the check (race). Fix: threat = any living
lingerer in the world (the flag MEANS besieging — it's only set on unmet
raid raiders) OR a lingering worldOrigin in an active tbfight.

### Post-fix natural history (staged probe, seed 101)

d23: 5 lingerers, endure answered. d24: gorge night. d25: scholar fights
4 (earned kills/drive-offs), 1 remains. d26–29: the last gorges nightly —
the crisis does NOT resolve early anymore. d30: moved-on valve fires
("Whatever was at the door has moved on — or found easier meat.").
Episode cleared in 7d; gorge total 7,608 kcal, claims exact. The endure
answer now works end-to-end.

### Natural episodes (505/606)

- 505: (d32, 2 raiders) 7d via fought, 9.5k gorge; (d61, 1 raider) 5d via
  moved-on, 3.5k gorge; (d70, Big-Eyes) ~5d, cleared, honest gorge.
- 606: (d46, Understudy) 3d cleared; (d81, 1 raider) 5d via fought.
- All resolved within 8d; none stuck. M4 GO.

## Design calls made (Steve can overrule)

1. Fleeing a lingerer returns it to the treeline (wounded), following the
   titan worldOrigin precedent — rather than preventing scholar–linger
   contact. The scholar's fights stay real and risky; only the flee
   bail-out is closed.
2. Per-raider ~6-night drift clock alongside (not replacing) the
   crisis-based moved-on valve — the narration's promise implemented
   directly.
3. 'fought' threat = any living lingerer in the world (not tile-gated).

## Village assessment (plain words)

Six competent villages, 90 days each, under natural siege seasons. The
villages fight: 41 of 42 raids met organized defenders, and the defense
reads as Steve's "desperate and traumatic" — mFlee-heavy, villagers
driving raiders off more than killing. The dead are mourned without
anyone forcing it: every one of the 47 stable-tail dead got a
spontaneous signal — a grief coda naming them, the fire going quiet, a
witness dreaming about them. Two villages (505, 606) saw real lingering
sieges: raiders at the treeline for 3–7 nights, gorging 3–9k kcal, then
fought off or drifting away. Nobody deserted, nobody panicked. Pantries
held. The villages bent (505 lost 18 over the season, 606 lost 15) and
none broke.

## Reachable / fun / winnable

- **Reachable:** yes — raids fire naturally (5–9/70d); lingering episodes
  arise when defenders are outnumbered; the endure/sortie choice is on
  the beats panel.
- **Fun:** the siege aftermath reads as a living village — the gorge
  nightly price, the drift-off, the grief codas. The mourning writing
  continues to be some of the game's best.
- **Winnable:** all six villages survived to day 90+; the siege is a tax,
  not a wall.

## Metric review (§14)

- M1/M2/M5: GO, no review needed.
- M3a: GO 47/47. The metric worked — spontaneous reach is PROVEN, not
  assumed. Proposed: keep as the standing mourning-reach metric for
  future crisis runs.
- M3b: 11/11 unbound. Compound deaths get the same spontaneous coverage
  in this data; no bar proposed yet.
- M4: GO 6/6. The bar held; the interesting work was the three fixes
  underneath it. Note: natural episodes remain rare (~1/7 raids) —
  future M4 judgments should keep the staged probe in the toolkit.
- M6: baseline re-seeded (r35's named next, done). Old baseline
  (77/3/22/9) vs new (95/0/21/0): playerFights 3→0 and
  latelyDefenseCount 9→0 are EXPLAINED (old baseline counted a
  defense-driving policy's scholar fights and driven defense convos;
  r38's schema counts {raid:true} defense engagements and
  mourning-lately convos). Documented, not a deviation.
- L2' (standing): 0 verbatim repeats in sampled lately/grief transcripts.
- Instrument notes: the episode tracker attributes gorges by chunk
  (lags raids that fire mid-chunk); 'unknown' resolutions in the
  analyzer mean "no aidResolution/lingererAnswer recorded" — the game
  data (deaths, sayLog, gorge records) is consistent; the tracker just
  doesn't see scholar drive-offs as a named path. Next run: record
  scholar fight outcomes against lingering entities.

## Regressions

- New proof tests: test-lingerer-flee-20261021.js 9/9 GREEN (RED verified
  pre-fix); test-lingerer-drift-20261021.js 3/3 GREEN.
- Existing: test-lingerer-20261016.js 36/36 GREEN (sortie path untouched).
- check.js --quick: 284 passed, 3 failed in 755s (--cacheDirectory=
  /tmp/jest-cache-playtest2). The 3 failures are PRE-EXISTING (documented
  in the 2026-10-21 daily log from lane A's r28 run, ~07:58 CDT, before
  this run started): test-measurement-proof-update.js, test-measurement-
  workflow.js ("retained neutrality proof covers the current
  Game/controller/harness inputs"), test-phone-frame-proof.js ("retained
  browser input matches current source"). Caused by sibling src/js
  landings this morning (sim-tributeguard, sim-trustdrift-voice,
  journey-endgame r35); owning loops need to refresh proofs. My changes
  add no new failures (the titan worldOrigin block I refactored is
  covered — no titan/raid/combat/lingerer failures).

## Telemetry

Deviation check vs re-seeded telemetry-baselines/crisis.json: quiet
(3 files, 4 metrics). Seeding LOUD lines vs the OLD baseline
(playerFights 3→0, latelyDefenseCount 9→0) both EXPLAINED above;
baseline rolled per r35's named next.
