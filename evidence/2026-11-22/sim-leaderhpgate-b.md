# sim-leaderhpgate-b — the leader-HP gate (Loop B run fleshout-loop-b-20261122T1330Z)

Finding #2619 kill conversion. The named next lever from the hpgate NO-GO:
hpgate §7 asked whether the flee in 107352 d57 was really the LEADER
collapsing (Patrick 67→44→22 in two rounds) while the trigger, ally Victor
at 23 HP, was never hit. This arm prices a leader-only HP floor
alongside the whole-party floor, door by door.

**Verdict: NO-GO, kind CONCEPT-DEAD (subsumed).** The leader gate never
fired once on the armed leg — its condition is a strict subset of HPGATE's
on the same leg, and HPGATE refuses every door the leader gate could
refuse first. Both legs are trajectory-identical on all 8 seeds. The
mechanism is staged and works in isolation (proof §1a); the metric is
fair; the concept as a separate lever fails on its merits. Do not retry a
leader-HP floor without a new mechanism. The named next lever is the
leader-PROJECTION gate (§9).

## 1. What was built (lever LEADERHPGATE)

- `src/js/villager-agency.js`, `expeditionMonster`, placed AFTER the
  HPGATE block: with `LEADERHPGATE=1`, refuse to open a wave-4+ pinned
  door when the LEADER's live HP is < 25 (strict, same number as hpgate,
  read live at the door). On fire the party gives the monster room (the
  existing avoid verb — no fight, no flee, no death), counter
  `st.leaderhpgateFires` increments, and the note reads "gave \<mid\>
  room — \<Name\> is too hurt to **lead** a door (\<hp\> HP)" (distinct
  verb "lead" so the driver can tell the gates apart). Env-gated, off
  by default, no RNG drawn, off-mode byte-identical.
- `scripts/pinquaddoor-driver-b.js`: each `v4encounters` row gains
  `leaderEntryHp` (leader's live village-health HP read BEFORE the
  fight); the corpus stamp gains `leaderhpgateFlag`,
  `leaderhpgateFires`, `gateAvoidNotes` (gate-avoid encounter notes
  parsed from agency expedition records at end of run: mid, member
  name, kind 'hold'/'lead', HP, verbatim note). Pure reads only.
- `scripts/analyze-leaderhpgate-b.js` (NEW): per-door bars D1–D5,
  secondaries S1–S10 incl. S10 leader-projection census; selftest
  24/24 green.
- `scripts/test-leaderhpgate-b.js` (NEW): **50/50 green**. V1 was
  46/50 on two test bugs (a comment string that wraps across lines;
  a stray `LEADERHPGATE=1` inherited from the test process env into
  a §8 sub-test) — both fixed in the test, not the lever. §6 stages
  the subsumption: with HPGATE=1, hpgateFires 1, leaderhpgateFires 0.

**Subsumption (pre-registered).** HPGATE checks
`[leader, ally1, ally2, ally3]` in order, strict < 25, firing on the
first member below the floor (leader checked first). LEADERHPGATE
checks the leader only, strict < 25, placed after HPGATE. On any leg
carrying HPGATE=1 (both legs — control is the hpgate armed
configuration), every door the leader gate could refuse has already
been refused by HPGATE. Marginal fires expected 0, legs expected
trajectory-identical, D1 pool expected empty.

## 2. Frozen bar — how each clause judged

Prereg: `evidence/2026-11-22/sim-leaderhpgate-b-prereg.md`, frozen
2026-11-22 ~14:46 UTC. Base master `bda6ff495`
(`bda6ff495513688fc1680d671d1e019013dd7a9a`). Policy
`scripts/policies/competent.js` sha256 `1884c8852d38…` (first 12
`1884c8852d38`).

| Bar | Rule (frozen) | Result | Pass |
| --- | --- | --- | --- |
| D1 PRIMARY (per-door) | Flee rate on leader-sub-25 FOUGHT doors (`leaderEntryHp` < 25): armed ≤ control − 20pp. Either leg's pool empty → UNMEASURABLE and FAILS. | Pool 0 both legs (control 0, armed 0) — unmeasurable | **FAIL** |
| D2 | Kill rate per FOUGHT door: armed ≥ control − 2pp (rate, NOT leg-total kills) | 0.50 = 0.50 (3/6 each) | PASS |
| D3 | Total damage per fought door ≥ 0.9× control | 826.5 = 826.5 | PASS |
| D4 | Armed `leaderhpgateFires` ≥ 1 | 0 (control 0) — subsumption confirmed | **FAIL** |
| D5 substrate | Every file: anchor = frozen base, policySha `1884c8852d38`, pinquad/dmgpin/doorflee2/hypofloor/hpgate flags '1' both legs, `leaderhpgateFlag` null (control) / '1' (armed), fires counters numeric, `gateAvoidNotes` array | 8/8 files each leg, 0 bad | PASS |
| M5 guardrail | Panel compare `review_required` with NO `regression_signal` on village deaths / deaths-per-100d, AND scalemetric cost bar: starvation ≤ control+2 on totals AND arm-only, median survival ≥ 0.8× control median | Panel `review_required`, no `regression_signal`; starvation 3 = 3; median 140d = 140d | PASS |
| M6 deliverable | This file, with frozen-bar table, door table, wall numbers, sense-test transcript read, diag table, panel compare attached, metric review | This file | PASS |
| SUPPLY rule | Control leg 0 fought doors → NO-GO kind SUPPLY-THIN | Control fought 6 doors — rule not triggered | n/a |

**Frozen verdict rule.** If `leaderhpgateFires` = 0 on the armed leg AND
legs are trajectory-identical → **NO-GO kind CONCEPT-DEAD (subsumed)**.
The alternative classification (METRIC-BROKEN: D1's pool empty by
construction) goes in metric review (§10), not a re-score.

## 3. Band, probes, determinism

- **Band 107375–107382 verified fresh.** `git grep` over all
  `evidence/*/sim-*-prereg.md`: 0 hits per seed; over all
  `evidence/**/sim-*.md`: 0 hits. Raw `git grep` over the whole
  `evidence/` tree matches ONLY JSON/.jsonl corpus and panel-case
  files (numeric fragments inside long hashes/IDs/calorie values;
  the only probe-file match is
  `evidence/2026-11-22/perseed-hpgate-b-probe/hpgate-b-s107327-hpgate-b-probe-pinquaddoor.json`,
  seed 107327, not in this band). Coordinator's pre-check
  corroborated.
- **Probe (control config, pre-freeze):** both chunks exit 0, 8/8
  seeds, 0 instrument errors. 167 wave-4+ meetings, **6 fought
  doors: 2 vFlee, 3 vKill, 1 vDie, 0 mFlee**; **0 leader-sub-25
  fought doors (min leader entry HP 42)**; `hpgateFires` total 3
  (all seed 107379) but only **1 gate-avoid note persisted** (see
  §10 instrument note).
- **Determinism tripwire: PASS.** The judged control leg reproduced
  the probe's door table exactly, all 8 seeds: days
  [150, 112, 88, 123, 150, 150, 130, 150], standing
  [460, 199, 150, 560, 225, 475, 199, 380], deaths
  [136, 70, 90, 119, 83, 118, 78, 64]. No drift; the armed leg is
  judged against an undrifted control.
- **Post-freeze proofs, all green** (log
  `evidence/2026-11-22/leaderhpgate-b-proofs.log`): M1 allyslot3
  18/18, M2 pinquaddoor 35/35, M2w wide 16/16, M3 dmgpin 29/29, M3d
  doorflee2 49/49, M3e downedtwice 25/25, M3f hypofloor 48/48, M3g
  hpgate 43/43, M3h leaderhpgate 50/50, analyzer selftest 24/24.
- **`check.js --quick`: 338 passed, 6 failed in 684s** (log
  `evidence/2026-11-22/leaderhpgate-b-checkquick.log`). Classified
  by re-running each failure on the pristine base and standalone:
  - **3 pre-existing proof-staleness, fail identically without this
    arm's changes:** `test-measurement-proof-update.js` ("Proof
    source inputs are not current"), `test-measurement-workflow.js`
    ("retained neutrality proof covers the current
    Game/controller/harness inputs"), `test-phone-frame-proof.js`
    (retained browser inputs vs current source; stale phone
    evidence). The retained neutrality proof and phone-frame proof
    are stale on base `bda6ff495` — the loop should schedule a
    refresh (`scripts/balance-proof-update.js`,
    `scripts/phone-frame-proof-update.js`); out of this arm's scope.
  - **3 load/flap-flaky, all pass standalone with this arm's
    changes:** `test-human-combat-parity.js` failed in-check with a
    `writeFileSync` error in `scripts/lib/human-parity-callers.js`
    (the write flap — fresh-file write refused under parallel load);
    standalone 69/69 green. `test-one-person-army-deed-attainment.js`
    and `test-living-garden-deed-attainment.js` hit the 120s
    per-test cap under 4-parallel load; standalone both exit 0.
  - **0 failures attributable to this arm's change.**

## 4. The legs — what actually happened

Both legs exit 0, 8/8 seeds, 0 instrument errors, anchor
`bda6ff495`, policySha `1884c8852d38` (legs log
`evidence/2026-11-22/leaderhpgate-b-legs.log`).

**The armed leg is trajectory-identical to control on all 8 seeds:**
same days, standing, deaths, v4 encounters, pin fights, every
corpus number. `leaderhpgateFires` 0 on every seed;
`hpgateFires` 3 on both legs (all seed 107379); `gateAvoidNotes` 1
on both legs. Analysis:
`evidence/2026-11-22/leaderhpgate-b-analysis.json` (analyzer exit 1
is the NO-GO verdict signal, not a crash — the JSON is complete).

### Door-fight table (every fought door, both legs identical)

| Seed | Day | Monster | Wave | Outcome | Rounds | Dealt | Leader entry HP | Proj band (projHp1 / projHp2) | DoorHold | Ever hopeless |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107375 | 106 | audit | 4 | vFlee | 2 | 326 | 42 | dead2 (17 / −8) | 0 | yes |
| 107375 | 108 | influencer | 4 | vDie | 7 | 955 | 64 | collapse2 (39 / 14) | 2 | yes |
| 107375 | 112 | eulogy | 4 | vKill | 7 | 974 | 75 | collapse2 (50 / 25) | 0 | no |
| 107377 | 65 | influencer | 4 | vKill | 5 | 1044 | 78 | safe (53 / 28) | 0 | no |
| 107379 | 145 | reunion | 4 | vKill | 12 | 1284 | 100 | safe (75 / 50) | 0 | no |
| 107379 | 147 | network_note | 5 | vFlee | 2 | 376 | 51 | collapse2 (26 / 1) | 0 | yes |

Totals both legs: 6 fought, 3 vKill, 2 vFlee, 1 vDie, 0 mFlee;
dealt 4959, 35 rounds, 826.5 dmg/door, 141.7 dmg/round.
Kill rate 0.50, flee rate 0.333 — identical.

### Diag table (secondaries S1–S10, reported not binding)

| # | Measure | Control | Armed |
| --- | --- | --- | --- |
| S1 | Hold census: `doorHold` rounds total / fights with a hold | 2 / 1 (d108) | 2 / 1 (d108) |
| S2 | Matched-pair conversions (door-scoped): pairs / conversions / later flees / no-change | 2 / 0 / 0 / 2 | — |
| S3 | Leader deaths | 1 (Petra, d108) | 1 (Petra, d108) |
| S4 | B1 rate ONLY (≥3-armed-row floor dropped for this arm) | 1.0 (6 rows) | 1.0 (6 rows) |
| S5 | Door table | §4 above | identical |
| S6 | Wall numbers | §6 | identical |
| S7 | Sub-floor census: leader-sub-25 fought doors / any-member-sub-25 from gate notes | 0 / 1 (Eckart 15 HP) | 0 / 1 |
| S8 | Gate-fire census: HPGATE fires / LEADERHPGATE fires / notes (hold / lead) | 3 / 0 / 1 hold, 0 lead | 3 / 0 / 1 hold, 0 lead |
| S9 | Avoided doors attributed (same seed+mid): 'lead' / 'hold' / 'divergence' | — | 0 / 0 / 0 (no avoided door differs between legs) |
| S10 | Leader-projection census (25 HP/round focused damage): fought bands dead1 / dead2 / collapse2 / safe | 0 / 1 / 3 / 2 | 0 / 1 / 3 / 2 |

S2 pairs: 107375 d106 audit (vFlee R2 both legs) and 107379 d147
network_note (vFlee R2 both legs) — both no-change. S10's one fired
door (hold, Eckart 15 HP) was projected dead in 1 round (projHp1
−10) — but 'hold' notes report member HP, never attributed to the
leader, so its leader projection is unknown.

## 5. Sense test — read the doors end to end

The transcripts read as real fights: gear absorption, field medicine,
shouts for help answered by named villagers, door holds, flee calls.
Two doors quoted blow-by-blow, plus the one surviving gate-avoid note.

### The death door: 107375 d108, The Influencer (vDie, R7, leader 64 HP)

Petra leads at 64 HP. She is hit for 14 (50 left), then 15 (35
left), binds the wound (+20), is hit for 17 (38 left) while the quad
holds the door, is hit for 15 (23 left), then 17 (6 left), then 18
(0 left) — dying in round 7 with the monster at 44 HP, one round
short of the kill the quad had nearly finished (955 dealt).

> Petra walks straight into Loud-Eyes. No avoiding it.
> Petra sees Loud-Eyes coming and nocks an arrow — the fight opens at range (2 shots).
> Petra lowers the bow — Loud-Eyes is on them now. (1/2 hit)
> Katarina is already at the door too — charges in with Petra!
> Lucia is already at the door too — charges in with Petra!
> Elif is already at the door — charges in with Petra!
> The pinned quad fights as one — every strike lands with the unit's weight behind it. (Coordinated strikes x2)
> R1: Petra strikes for 42 (pinned quad x2) (942 left) … R1: Ratio hits Petra for 14 (50 left)
> R2: Ratio hits Petra for 15 (35 left)
> R2: Petra stops mid-fight and binds the wound — field medicine, +20 HP.
> Petra holds the door — the fight is theirs on the numbers they can see, and the quad is not leaving it. (Door hold)
> R3: Ratio hits Petra for 17 (38 left)
> R5: Callout Post hits Petra for 15 (23 left)
> R6: Ratio hits Petra for 17 (6 left)
> Loud-Eyes is wounded past its line — and holds its ground. It is not leaving. (Committed)
> R7: Ratio hits Petra for 18 (0 left)

This is a **door-hold story, not a leader-floor story**: the hold
(fired twice, doorHold=2) kept the quad in while the leader bled
out, and the fight's own flee logic never got its say. But it is
exactly the door a leader-PROJECTION gate would have refused —
collapse2, projected 14 HP after two rounds of focused damage
(§9). A flat 25-HP floor would not have touched it: Petra entered
at 64.

### The early flee: 107375 d106, Big Ugly / audit (vFlee, R2, leader 42 HP)

> Elif walks straight into Big Ugly. No avoiding it.
> Petra is already at the door too — charges in with Elif!
> Lucia is already at the door too — charges in with Elif!
> Katarina is already at the door — charges in with Elif!
> Elif's gear absorbs 55.
> R1: Assessment hits Elif for 13 (29 left)
> The pinned quad fights as one — every strike lands with the unit's weight behind it. (Coordinated strikes x2)
> R1: Elif strikes for 28 (pinned quad x2) (1266 left)
> R1: Katarina strikes for 42 (pinned x2) (1224 left)
> R1: Petra strikes for 42 (pinned x2) (1182 left)
> R1: Lucia strikes for 52 (pinned x2) (1130 left)
> Petra's gear absorbs 46.
> R2: Assessment hits Petra for 21 (68 left)
> R2: Elif strikes for 26 (pinned quad x2) (1104 left)
> R2: Katarina strikes for 44 (pinned x2) (1060 left)
> R2: Petra strikes for 42 (pinned x2) (1018 left)
> R2: Lucia strikes for 50 (pinned x2) (968 left)
> Elif sees how this ends — and runs while running still works.

Coherent: the leader at 29 HP after one hit, the party dealing
326 damage in two rounds against a monster still above 950 HP,
fled while fleeing still worked. Projection dead2 (17 after one
round, −8 after two) — the flee was the right call, made by the
fight, not by any gate.

### The one surviving gate-avoid note: 107379, The Congregation

> "gave congregation room — Eckart is too hurt to hold a door (15 HP)"

An HPGATE fire ('hold' kind — a member, not the leader, at 15 HP;
the leader's HP is unknown from the note). The counter says HPGATE
fired 3 times on 107379; only this one note survived to the
end-of-run read (§10). No 'lead' note exists on either leg — the
leader gate never spoke.

### The other flee, for contrast: 107379 d147, The Network Note (vFlee, R2, leader 51 HP)

Vitalina leads at 51 HP, is hit for 15 (36 left), then 20 (16
left), and runs. Projection collapse2 (26 after one round, 1 after
two) — one more hit and the leader is down. The flee logic worked;
no gate was needed.

### Transcript defect (outside the arm)

In the d145 Reunion kill, the "Committed" line names the wrong
monster: *"Loud-Eyes is wounded past its line — and holds its
ground"* appears between R11 and R12 of a fight against The
Reunion. The committed-line label carries a stale monster name.
Flagged for the findings backlog; it does not touch this arm's
verdict.

## 6. Wall numbers

Identical on both legs (every seed byte-identical between legs):

| Seed | Days | End | Standing | Scale | Max wave | Won | Deaths | Starvation-caused | Thirst-caused |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107375 | 150 | survived | 460 | regional | 5 | no | 136 | 0 | 1 |
| 107376 | 112 | village-lost | 199 | regional | 4 | no | 70 | 0 | 0 |
| 107377 | 88 | village-lost | 150 | regional | 4 | no | 90 | 0 | 0 |
| 107378 | 123 | village-lost | 560 | regional | 5 | no | 119 | 2 | 0 |
| 107379 | 150 | village-lost | 225 | regional | 5 | no | 83 | 1 | 2 |
| 107380 | 150 | survived | 475 | regional | 5 | no | 118 | 0 | 0 |
| 107381 | 130 | village-lost | 199 | regional | 4 | no | 78 | 0 | 0 |
| 107382 | 150 | survived | 380 | regional | 5 | no | 64 | 0 | 0 |

Totals: **wins 0/8; national by standing ≥200: 5/8; wave-5 unlocked
5/8; median survival 140d; villages lost 5/8; survived 3/8; deaths
758 total (94.75/run); starvation-caused 3; thirst-caused 3.**
Telemetry "table" metric: 0/8 both legs (§8). In plain words: three
villages lived out the 150 days, five were lost, none won, and the
strongest reached regional standing 560 — the winnability wall is
unchanged by this lever, because the lever never fired.

## 7. Balanced panel compare (M5)

`node scripts/balance-panel.js compare` on the built panels
(`evidence/2026-11-22/leaderhpgate-b-panel-before.json.gz` /
`-after.json.gz`; output `leaderhpgate-b-panel.json` /
`leaderhpgate-b-panel.md`):

**Decision: `review_required`, no `regression_signal` field present.**
Every paired metric has delta 0 on 8/8 pairs: village deaths per run
94.75 = 94.75, deaths per 100 calendar days 73.4777 = 73.4777,
community loss 0.625 = 0.625, national scale access 0 = 0, table win
rate 0 = 0. All observed rows read `no_material_signal`.

Scalemetric cost bar: starvation totals 3 = 3 (≤ control+2 ✓),
arm-only starvation deaths 3 = 3 (≤ control+2 ✓), median survival
140d = 140d (≥ 0.8× control ✓). **M5 passes.**

## 8. Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-22/perseed-leaderhpgate-b-{control,armed}/*.json'
--metrics national,table,wins,exiled --sweep-rows
--allow-recorder-corpus` (run per leg):

- Control: `wall: won=0/8` — **LOUD: national disappeared:
  baseline 12 -> current 0; LOUD: table disappeared: baseline 16
  -> current 0; LOUD: wins disappeared: baseline 16 -> current 0.**
- Armed: identical lines — `won=0/8`, the same three LOUD lines.

**These LOUD lines are the documented regime artifact, not an arm
effect.** The baseline file itself says: "DO NOT compare pre-seat /
courtship / readiness substrates against this baseline — wins are
structurally ~0 there and telemetry-check will fire a spurious LOUD
'wins disappeared'." This arm's substrate is a pre-seat substrate
(pinquaddoor, no winseat stack), and the control leg — the prior arm's
configuration, untouched by this lever — fires the identical lines.
The armed leg introduced **no deviation relative to control** on any
of the four metrics.

## 9. Verdict (§14a classification: CONCEPT-DEAD)

**NO-GO.** D1 fails (leader-sub-25 fought-door pool empty on both
legs), D4 fails (armed `leaderhpgateFires` 0), D2/D3/D5 pass, M5
passes. Per the frozen rule — 0 marginal fires AND legs
trajectory-identical — the classification is **CONCEPT-DEAD
(subsumed)**: the leader gate's condition is a strict subset of the
whole-party gate's condition on the same leg, so with HPGATE=1 there
is no door it can ever refuse that HPGATE has not already refused.
The mechanism is staged (proof §1a refuses a door in isolation with
the flag on and HPGATE off); the metric is fair (D2/D3 priced the 6
fought doors per-door, not leg-total); the concept as a separate
lever fails on its merits. **Do not retry a leader-HP floor without
a new mechanism.** No confirm spend (pilot did not GO on every bar).

**Named next lever (for a future arm, not built here): the
leader-PROJECTION gate.** Refuse a wave-4+ door when the leader is
projected at or below the floor within 2 rounds of focused wave-4
damage (~25 HP/round), not when they are already below it. S10 says
it would have touched 4 of the 6 fought doors (dead2 1 + collapse2
3) — including the d108 leader death, where Petra entered at 64 HP
and died in round 7 with the monster at 44 HP, and the d147 flee,
where Vitalina entered at 51 HP and fled at 16. The before-placement
attribution variant (leader gate first, attributing the
leader-driven share of HPGATE fires) also remains available to a
future arm. Finding #2619 (kill conversion) stays open.

## 10. Metric review (for the next run — this run is judged as frozen)

- **D1's empty pool is the subsumption itself, not a metric
  failure.** The alternative METRIC-BROKEN classification was
  considered and rejected under the frozen tie-break: the mechanism
  deciding the verdict was found in the arm's own logic (the leader
  check sits after HPGATE and is a strict subset of it), so
  CONCEPT-DEAD is the honest classification. D1 fails as
  unmeasurable, which is the frozen rule, not a re-score.
- **The per-door repricing worked.** D2 (kill rate per fought door)
  and D3 (total damage per door) priced cleanly on the 6 fought
  doors instead of punishing the lever for avoiding doors — the
  hpgate leg-total bars (P2/B1 as written) are not the judge here,
  as the prereg required. A future arm reusing this harness keeps
  the per-door bars.
- **Instrument note (carried from the probe): gate-avoid notes
  undercount fires.** 3 HPGATE fires on 107379 (counter) vs 1
  surviving note. Notes live on expedition records, and records
  from ended expeditions do not survive to the driver's end-of-run
  read. The counter remains the direct S8 evidence. A future arm
  that needs per-fire attribution (e.g. the before-placement
  variant) should read notes live at fire time, not at end of run.
- **Proof staleness on the base (§3):** the retained neutrality
  proof and phone-frame proof fail on the frozen base without this
  arm's changes. A proof refresh is owed to the loop, not to this
  arm.
- **Transcript label defect (§5):** the "Committed" line names
  Loud-Eyes during a Reunion fight (d145). Cosmetic, outside the
  arm.

## 11. Files

- Lever: `src/js/villager-agency.js` (LEADERHPGATE block in
  `expeditionMonster`)
- Driver: `scripts/pinquaddoor-driver-b.js` (`leaderEntryHp`,
  `gateAvoidNotes`, `leaderhpgateFlag`/`leaderhpgateFires` stamp)
- Analyzer: `scripts/analyze-leaderhpgate-b.js` (selftest 24/24)
- Proof test: `scripts/test-leaderhpgate-b.js` (50/50)
- Prereg: `evidence/2026-11-22/sim-leaderhpgate-b-prereg.md`
  (frozen 2026-11-22 ~14:46 UTC)
- Evidence: `evidence/2026-11-22/sim-leaderhpgate-b.md` (this file)
- Analysis: `evidence/2026-11-22/leaderhpgate-b-analysis.json`
- Logs: `evidence/2026-11-22/leaderhpgate-b-{probe-chunk1,probe-chunk2,proofs,checkquick,legs}.log`
- Panel: `evidence/2026-11-22/leaderhpgate-b-panel{-before,-after}.json.gz`,
  `leaderhpgate-b-panel.{json,md}`
- Corpora: `evidence/2026-11-22/perseed-leaderhpgate-b-{probe,control,armed}/`
  (8 seeds each)
