# sim-producergate-b — Producer gate / expedition-meeting link (pilot)

**Run:** Loop B, 2026-11-15. **Branch:** `sim-producergate-b`. **Lever commit:** `c3b772173` (reverted on this branch after the NO-GO verdict — see §10).
**Prereg:** `evidence/2026-11-15/sim-producergate-b-prereg.md` (frozen before any judged sweep).
**Seeds:** pilot 100781–100788 (8 seeds, verified fresh). **Horizon:** 150 days, death-aware.
**Policy:** `competent-answercourt-b`, identical seeds both legs. **Instrument errors:** 0 in both legs (8/8 files parsed each leg).

## Verdict: NO-GO

Three of the five frozen bars fail. Per the prereg, a pilot NO-GO is evidence-only: the lever does not merge. The confirm band (100801–100816) is **not** spent.

## 1. The lever, in plain words

The last arm (producerparty) found that villages make plans to hunt the wave-5 beasts — the Producers — but never actually go after them on purpose. The plan exists, the hunt never starts: every time the plan reaches the beast, the village backs off because the hunting party is only two people and the gate demands three for wave 4 and above, and because nobody knows the beast's trick. The fights that do happen arrive by accident, when a beast wanders into the village.

This arm built the meeting link in two halves:

- **Half A (enabling):** when a villager runs from a wild beast, that scare now seeds a hunting plan for that beast — the same seed producerparty tested, re-landed byte for byte. Without it there is no wave-5 plan to meet at the gate.
- **Half B (tested):** a wave-4-or-harder plan now launches with **two** companions instead of one — fighter plus two — so the party that sets out is three. If only one companion is free, the plan waits for a second one instead of setting out short-handed.

Nothing else changed: no gate bar, no standing or readiness number, no win price, no deed gate, no table rule. Game-code diff was only `src/js/game.js`, `src/js/win-plan.js`, `src/js/villager-brain.js`.

## 2. Judgment against the frozen bars

| # | Bar (prereg) | Control | Armed | Result |
|---|---|---|---|---|
| 1 | Field kills per unlocked village ≥ 1.00 (primary) | 0 | **0.50** | **FAIL** |
| 2 | Turn-based (TB) kills per unlocked ≥ 0.5× control | 0 | 0.75 | PASS (control 0, see §9) |
| 3 | Kill:death total ≥ 0.92 (kills with zero deaths pass) | — (0 kills, 0 counted deaths) | **1.00** (5 kills / 5 counted deaths) | PASS |
| 4 | FACED-NOT-KILLED share among unlocked ≤ 0.20 | 0.60 | **0.50** | **FAIL** |
| 5 | Cost: starvation ≤ control + 2 **and** median survival ≥ 0.8× control | starvation 1, survival 150d | starvation **6** (bar ≤ 3), survival 150d | **FAIL** (starvation) |

**Verdict: NO-GO.** Field kills moved 0 → 2, total wave-5 kills 0 → 5, but the primary bar (one field kill per unlocked village) was missed by half, half the unlocked armed villages faced wave 5 and killed nothing, and the armed leg starved six villagers against one in control.

## 3. Per-seed tables

### Control leg (no lever)

| Seed | Class | Unlock day | First faced | Faced distinct | Field kills | TB kills | Kills | W5 deaths* | Vet@unlock → @end | Survival | End |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 100781 | NEVER-FACED | 146 | — | 0 | 0 | 0 | 0 | 0 | 2 → 2 | 150d | survived |
| 100782 | FACED-NOT-KILLED | 139 | 148 | 2 | 0 | 0 | 0 | 0 | 1 → 2 | 150d | survived |
| 100783 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 0 | 150d | survived |
| 100784 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 0 | 150d | survived |
| 100785 | NEVER-FACED | 131 | — | 0 | 0 | 0 | 0 | 0 | 2 → 2 | 150d | survived |
| 100786 | FACED-NOT-KILLED | 79 | 95 | 2 | 0 | 0 | 0 | 0 | 2 → 0 | 118d | village-lost |
| 100787 | FACED-NOT-KILLED | 108 | 116 | 3 | 0 | 0 | 0 | 0 | 2 → 0 | 150d | survived |
| 100788 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 1 | 150d | survived |

Unlocked 5/8. Field kills 0, TB kills 0. Starvation 1 (seed 100788).

### Armed leg (lever on)

| Seed | Class | Unlock day | First faced | Faced distinct | Field kills | TB kills | Kills | W5 deaths* | Vet@unlock → @end | Survival | End |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 100781 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 1 | 150d | survived |
| 100782 | **KILLED** | 123 | 124 | 3 | 1 | 2 | 3 | 3 | 3 → 2 | 150d | survived |
| 100783 | FACED-NOT-KILLED | 127 | 131 | 1 | 0 | 0 | 0 | 0 | 1 → 0 | 150d | survived |
| 100784 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 0 | 150d | survived |
| 100785 | **KILLED** | 95 | 129 | 2 | 1 | 1 | 2 | 2 | 2 → 2 | 150d | survived |
| 100786 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 0 | 145d | village-lost |
| 100787 | LOCKED | — | — | 0 | 0 | 0 | 0 | 0 | — → 1 | 150d | survived |
| 100788 | FACED-NOT-KILLED | 110 | 111 | 2 | 0 | 0 | 0 | 0 | 2 → 1 | 150d | survived |

Unlocked 4/8. Field kills 2, TB kills 3, total 5. Starvation 6 (seed 100783: 4, seed 100787: 2).

\* "W5 deaths" is the preregistered count: deaths whose killer is recorded as a wave-5 monster. It misses field deaths recorded the other way round (see §9, point 1). The field-fight death toll from the encounter rows is in §6.

**Veteran attrition.** The wave-5 readiness bar needs 2 living veterans (villagers with wave-4+ kills). Armed villages at unlock: 100782 had 3, 100783 had 1, 100785 had 2, 100788 had 2. By the end, 100783's only veteran was dead (1 → 0) and 100788 dropped to 1. Control lost all veterans on both its faced-not-killed seeds that survived long enough (100786 2 → 0, 100787 2 → 0). Veterans are being spent faster than they are made, on both legs.

**Readiness.** Days ready after unlock (armed): 100782: 28, 100783: 2, 100785: 46, 100788: 1. Days short after unlock (armed): 100782: 1, 100783: 23 (dominant short: veterans), 100785: 10 (weapons), 100788: 41 (veterans). Two of the four unlocked armed villages spent almost the whole post-unlock window short on veterans.

## 4. Mechanism decomposition — what the lever actually did

In order: seeds → launches → gate → kills.

**(a) Seeds (Half A fired).** Wave-5 plan seeds: win-plan counter 10 → 75. Plans: 12 → 81. Plans naming a wave-5 target: 0 → 4. Brain win-plan commits: 57 → 662. Recorder seed rows: control 2 (both "evaded", from a pre-existing call path), armed 5 (all "fled" — the re-landed call site). Half A works: the lever's extra plans are real, not a reporting artifact.

**(b) Launches (Half B mostly did not fire as designed).** Armed departures: 128 attempts, 71 launches, 57 holds (control: 53 attempts, 51 launches, 2 holds).

| Launch party size (fighter + companions) | Control | Armed |
|---|---|---|
| 1 (fighter alone) | 0 | 22 |
| 2 | 51 | 47 |
| 3 | 0 | **2** |

Of launches for plans that needed a full party: **2 at size 3, 1 at size 1**. The brain waited for a second companion 561 times (party_wait bids 18 → 561; party_launch 39 → 92) and recorded only 7 second-companion waits. The waits almost never convert: when a wave-4+ plan wants to launch, a second launchable companion is almost never free at Haven — companions are away, busy, unarmed, unarmored, sick, or out of range. The plan then sits in `party_wait` while the window passes.

The 22 size-1 launches are a side effect: with 81 plans chasing the same companion pool, non-full plans launch with no companion at all (the brain bids launch whenever the plan does not need a full party, even with zero companions available). Control never launched solo; the armed leg launched solo 22 times.

**(c) Gate (the SEEK still never fired).** Wave-5 gate rows — times the gate was actually consulted about a wave-5 beast:

- Control: 3 rows — 1 `avoid:outmatched` (party 2), 2 null (party 3, trick unknown).
- Armed: 2 rows — both `avoid:outmatched` (party 1, trick unknown).
- **SEEKs: 0 in both legs.** Trick known at the gate: 0/3 control, 0/2 armed.

The gate is consulted about wave 5 only 2–3 times per 8-seed leg. The two size-3 launches never produced a wave-5 gate row. The gate path is nearly unreachable: plans and beasts almost never meet inside it.

**(d) Kills (not through the designed mechanism).** Both armed field kills came through the ordinary world-tick path, not the gate:

| Field kill | Seed/day | Beast | Fighter | Party at fight | Gate | Fight |
|---|---|---|---|---|---|---|
| 1 | 100782 / day 149 | finale_crew (The Commercial Break) | Ella (visjoin_139) | 3 (2 allies joined at the fight) | none | 0 rounds, 8 damage dealt — a contact finish on a beast already at 8 HP, fought the day before (7 rounds, 211 dealt, fled) |
| 2 | 100785 / day 144 | finale_crew (The Commercial Break) | Emily (visjoin_115) | 3 (2 allies joined at the fight) | none | 4 rounds, 187 dealt, 11 taken — a genuine fight win, opened at range |

Both kills are the same beast (finale_crew). Both arrived with allies joining **at the fight** (`allyFromStart: False`), not as a launched expedition. In fact, across all 45 wave-5 field fights in both legs, **not one** started with expedition companions (`allyFromStart: False` on 28/28 control and 17/17 armed). The expedition-meeting link never once delivered a party that started a wave-5 fight together.

## 5. Encounter decomposition (field fights, wave 5)

| | Control | Armed |
|---|---|---|
| Wave-5 field fights | 28 | 17 |
| Kills (vKill) | 0 | 2 |
| Flees (vFlee) | 16 | 14 |
| Villager deaths in the fight (vDie) | 10 | 1 |
| Evades | 2 | 0 |
| Fights with a party of 3 at the fight | 21 | 16 |
| Fights with no gate evaluation (world-tick path) | 23 | 17 |
| Trick learned during the fight | 3 | 4 |

Control: 21 of 28 wave-5 fights were already fought as 3 — the world-tick path assembles up to 2 allies at the fight itself — and still killed nothing while losing 10 villagers. Armed: fewer fights (17), fewer deaths (1), 2 kills. The armed leg faced wave 5 less often in the field and lost fewer people to it, but the numbers are small and the trajectories diverged (see §9, point 5), so this is a description, not a claim that the lever made field fights safer.

Wave-4 field fights for reference: control 106 (11 kills, 6 deaths), armed 165 (11 kills, 12 deaths). The armed leg fought wave 4 far more often — the plan volume (Half A) drives more departures and more fights — without killing more.

## 6. Wall numbers

| | Control | Armed |
|---|---|---|
| National scale, final | 6/8 | 6/8 |
| Table (seat taken) | 0 | 0 |
| Wins | 0 | 0 |
| Wave 4 unlocked (maxWave ≥ 4) | 8/8 | 8/8 |
| Wave 5 unlocked (maxWave 5) | 5/8 | 4/8 |
| Median survival | 150d | 150d |
| Village-lost | 1 (100786, d118) | 1 (100786, d145) |
| Total deaths | 562 | 616 |
| Deaths per run (panel) | 70.25 | 77.0 |
| Starvation deaths | 1 | 6 |

## 7. Balanced panel (§15)

`scripts/build-producergate-panels-20261115.js` → `evidence/2026-11-15/producergate-b-panel.md` (and `.json`, `-before.json.gz`, `-after.json.gz`).

- **Decision: `review_required`** (8 paired cases; same instrument verdict as producerparty's panel).
- National scale access: 0.75 → 0.75, no material signal. Table win rate 0 → 0.
- Village deaths per run: 70.25 → 77.0, delta +6.75, 95% interval −6.875 to +18.375 — `regression_watch`, interval crosses zero (not significant).
- Village deaths per 100 days: 48.79 → 51.31, delta +2.53, interval −8.68 to +11.70 — `regression_watch`, crosses zero.
- Community loss: 0.125 → 0.125, no material signal.
- The panel is an instrument, not the judge: the prereg bars in §2 decide, and they say NO-GO.

## 8. Sense-testing — do the fights read like fights?

Quoted verbatim from the corpora (wave-5 rows only; `w5encounters[].log`/`lines`).

**Control, seed 100786, day 96 — The Editor, Benoit:** the village learns the trick, then Benoit dies to the same beast the same day.
> "💡 COUNTER LEARNED — The Editor: Contradict yourself — break the cut. Every third round the scissors cut your swing — it never happened. Do two contradictory things and it cannot cut cleanly…"
> "R1: the editor's scissors snip — measuring Benoit." / "Benoit's gear absorbs 50." — vDie, 1 round, 0 damage dealt.

**Control, seed 100782, day 147 — Rerun, Jaskaran:** the Blooded bonus shows when the village knows the trick.
> "R1: Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.)" / "R1: Jaskaran strikes for 32 (868 left)" — vFlee after 4 rounds, 165 dealt, 46 taken.

**Armed, seed 100782, day 145 — The Commercial Break, Gonzalo:** trick learned mid-fight, long fight, still fled.
> "💡 COUNTER LEARNED — The Commercial Break: Kill the crew first. It is the venue, not the show — end it fast, before the ratings climb."
> 7 rounds, 211 dealt, 75 taken — vFlee.

**Armed, seed 100782, day 149 — The Commercial Break, Ella (field kill 1):**
> "Ella does not let it slip away — they close in and strike with the kitchen knife for 8 — The Commercial Break falls. (Contact finish)" — 0 rounds, 8 dealt: a mop-up, not a duel.

**Armed, seed 100785, day 144 — The Commercial Break, Emily (field kill 2):**
> "Emily sees The Commercial Break coming and nocks an arrow — the fight opens at range (4 shots)." — 4 rounds, 187 dealt, 11 taken: a real fight win.

**Armed, seed 100783, day 144 — Spoiler, Yahir (death):**
> "R1: Yahir walks in open-handed — and it goes wrong. It doesn't want peace. They're exposed, off-balance. (Walk In — failed)" — vDie, 2 rounds, 15 dealt, 100 taken.

**Judgment.** The fights read like fights: range openers, gear absorbing blows, trick-learning lines landing mid-fight, the Blooded bonus narrated when the village knows the trick. What does *not* read right is the party story: every wave-5 fight in both legs starts with allies joining at the fight, never with a party that set out together — the expedition-meeting link this arm built never shows up in the narration. And one of the two field kills is an 8-HP mop-up of a beast wounded the day before, which flatters the kill count.

## 9. Metric review (mandatory)

1. **The kill:death bar passes on a deaths count that misses field deaths.** Bar 3 counts deaths whose record names a wave-5 monster as the killer (`kind: 'monster', who: <wave-5 id>`). But field deaths are also recorded the other way round — `kind: 'villager', who: <victim id>, cause: 'monster'` — and those never match the filter. Control 100786's two Editor deaths (Benoit, day 96; Buwan, day 99) are recorded that way, so control's counted wave-5 deaths are 0 while 10 villagers actually died in wave-5 field fights. The honest field-death comparison is the encounter rows: control 10 deaths in 28 fights, armed 1 in 17. Bar 3's PASS (1.00) is therefore not evidence the fights got safer per kill — it is an artifact of which shape each death took. The bar should be redefined before any re-test: count field-fight deaths from the encounter rows, not from the death log's killer field.
2. **The TB bar passes vacuously and the TB kills are not a lever effect.** Control TB kills are 0, so armed 0.75 clears "≥ 0.5× control" trivially. The lever has no mechanism that touches turn-based combat — it changes villager plans and departures, not the scholar's arena/TB fights — so the 0 → 3 TB kills should be read as RNG re-roll (see point 5), not as the lever working. A future prereg should bar TB kills against an absolute floor or drop the TB bar, not against a zero control.
3. **The SEEK still never fired — the designed mechanism produced zero observations.** The gate was consulted about wave 5 five times across 16 seed-legs (3 control, 2 armed). Half B's two size-3 launches never met a wave-5 gate row. The kills that did happen came through the world-tick path. The arm proved the seed half works and the launch half almost never fires; it did not test whether a party of 3 with the trick known beats wave 5 through the gate, because that meeting never happened. Any next lever must first make the meeting happen — the gate needs to be consulted when a launched party arrives at the beast, or the treatment must move to the world-tick path where all 45 wave-5 fights actually occur.
4. **The wait is the wrong shape for the companion shortage.** 561 waits produced 7 second-companion waits and 2 size-3 launches. Waiting does not create companions; the pool at Haven is the binding constraint. A next attempt should either widen the pool (companions drawn from villagers out foraging/working, not only those idle at Haven) or stop waiting and do something else with the plan (e.g. send the pair to learn the trick first, which the gate already rewards). Note also the 22 solo launches: the heavier plan load exhausts companions and sends fighters out alone — a regression in party discipline that the launch-by-size table catches and the headline bars do not.
5. **RNG re-roll confounds every per-seed comparison.** The lever consumes RNG draws (the seed call, extra departures), so trajectories diverge: the unlock sets differ (control unlocked 100781/100786, armed unlocked 100788 instead), standings flip (control 100781: 527/national vs armed 199/national), and total deaths rise 562 → 616. The pooled bars are the judge, as preregistered, and per-seed matched pairs are not interpretable as "same village, lever on/off". This also means the starvation gap (6 vs 1) cannot be cleanly attributed: it is concentrated on the two heaviest-departure seeds (100783: 4 starved, 21 departs; 100787: 2 starved, 33 departs), which is consistent with expeditions pulling food-producers out of Haven — but with n = 8 and one village holding 4 of the 6, re-roll remains a live alternative. A re-test would need to separate the two (e.g. cap concurrent expeditions or exempt foragers and see if starvation falls while kills hold).
6. **Field kills 0.50 vs the 1.00 bar is a near miss in absolute terms, not a collapse.** Two field kills on four unlocked villages; the bar needed four. One of the two is an 8-HP mop-up (§8). The direction moved (0 → 2 field, 0 → 5 total) but the primary bar is absolute and it missed. Do not re-score: the prereg binds, and NO-GO stands.
7. **FACED-NOT-KILLED 0.50 vs the 0.20 bar is the wider failure.** Even where the lever moved kills, half the unlocked armed villages faced wave 5 and killed nothing. Facing is no longer the scarce event (4/4 unlocked armed villages faced, vs 3/5 control); converting a facing into a kill is.
8. **Instrument health.** 0 instrument errors, 0 parse errors, 0 negative-TB flags in both legs. The field/TB split behaved: no seed shows TB kills below zero, and the two field kills are visible as named rows with days, fighters, and fight lines. The `w5encounters` array holds wave-4 rows too (the fieldFight wrapper records wave 4+), so any re-use must filter `wave === 5` — the analyzer does; a careless reader of the raw corpora will over-count encounters (182 armed rows vs 17 wave-5).

## 10. What happens to the lever

Pilot NO-GO per the frozen prereg, so the lever does **not** merge. The lever commit `c3b772173` stays in branch history as the tested artifact, and a revert commit on top restores the three game files (`src/js/game.js`, `src/js/win-plan.js`, `src/js/villager-brain.js`) to the anchor `e577ef5f8`. What merges (coordinator's call) is the instrument, prereg, analyzer, panel builder, proof test, corpora, panel outputs, and this evidence file — no game-code change.

## 11. Next lever (for the coordinator, not a claim)

The binding link is still wave-5 kills, and the evidence now names two narrower blockers instead of one:

- **The gate is nearly unreachable.** The SEEK path needs plans and beasts to meet inside `winPlanFightGate`. Next arm should instrument *why* the gate is consulted so rarely (which condition fails: stage, target match, or arrival?) and either route launched parties through the gate on arrival or move the party-of-3 + trick-known treatment onto the world-tick path, where all 45 wave-5 field fights actually happen.
- **The second companion does not exist at launch time.** Widen the companion pool beyond villagers idle at Haven, or make the plan do useful work (trick-learning) while it waits instead of holding indefinitely.

Either way, the starvation cost of heavy departures needs a food guard, and the kill:death bar needs the encounter-row death count (§9.1) before it can be trusted.

## 12. Proof and checks

- **Proof test** `scripts/test-producergate-b.js` — 4/4 green on the lever tip (`c3b772173`): static (exact 3-file diff, no standing/gate/table touches), judge (10 fixtures), recorder (field/TB split, negative-TB flag), determinism (seed 100781, 60d, twice identical, 0 errors).
- **`node scripts/check.js --quick`** on the lever tip: 332 passed, 8 failed in 986s. All 8 attributed, none to this arm: 5 failed identically in today's earlier `journey-endgame-r211-checkquick.log` (measurement-proof-update, measurement-workflow, living-garden timeout, phone-frame-proof, one-person-army timeout), 2 in the adopt2b/r211a3 logs (ladder-bundle, person-trust), and trust-observer-neutrality passes solo 6/6 in 30s (its check.js failure was the 120s wall under 4-parallel load). The measurement-proof staleness predates this arm; no proof refresh was run — the lever is reverted, so the merged content carries no game-code change and the refresh remains owed maintenance, not this arm's.
- **Panel** (§7): `review_required`, no significant regression (both death deltas' intervals cross zero).

## 13. Files

- Prereg: `evidence/2026-11-15/sim-producergate-b-prereg.md`
- Evidence (this file): `evidence/2026-11-15/sim-producergate-b.md`
- Corpora: `evidence/2026-11-15/perseed-producergate-b-control/` (8 files), `evidence/2026-11-15/perseed-producergate-b-on/` (8 files)
- Panel: `evidence/2026-11-15/producergate-b-panel.md`, `.json`, `-before.json.gz`, `-after.json.gz`
- Instrument: `scripts/producergate-driver-20261115.js`, `scripts/analyze-producergate-b.js`, `scripts/build-producergate-panels-20261115.js`, `scripts/test-producergate-b.js`
- Lever (tested, reverted): `src/js/game.js`, `src/js/win-plan.js`, `src/js/villager-brain.js` — commit `c3b772173`, reverted on this branch.
