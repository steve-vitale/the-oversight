# sim-hpgate-b — HP-gating door parties (Loop B run fleshout-loop-b-20261122T0930Z)

**Verdict: NO-GO — P2 and B1 miss on the frozen bar. Kind: METRIC-BROKEN.**
The gate did exactly what it was built to do — fired once, on the one
sub-floor door in its pool, and the flee it was built to avoid did not
happen on the armed leg (F1 passes, 25pp drop, 0 armed flees). But the
pilot cannot price the lever: P2 and B1 count leg-total doors, and a
single gate fire rewrote seed 107352's entire future, so the armed leg
fought 2 doors instead of 4 and the missing kill is a door the gate
never touched. Finding #2619 (kill conversion) stays open. No confirm
run (a pilot NO-GO spends no confirm seeds).

**Plain words:** the rule is "don't walk into a monster's door with
someone below 25 health in the party." It worked the one time it got
the chance — the hurt party gave the monster room instead of fighting
and running. But one chance in eight villages is too thin to prove
anything, and avoiding that one door changed that village's whole
future so much that the comparison broke: the village lived 69 days
longer and the later door it would have fought never happened. The
lever isn't dead; the ruler is wrong for a lever whose whole job is
avoiding doors. The next arm should price it door by door, not by
counting whole-leg totals — and should ask whether the rule reads the
right person's health, because the door that ran away was really about
the leader collapsing, not the hurt bystander.

## 1. What was built (lever HPGATE)

A pinned-door party does not open a wave-4+ door with any member
below 25 HP (leader + all three pinned allies, read live at the
door-open decision in `src/js/villager-agency.js` `expeditionMonster`,
+43/−0). When it fires, the party gives the monster room (the
existing avoid verb — no fight, no flee, no death) and the counter
`st.hpgateFires` increments. Env-gated OFF by default; no RNG drawn;
off-mode byte-identical. Floor derivation: 25 HP = one round of
focused wave-4 damage (hypofloor-b §4: the d110 monster hits 22–25
a round; the leader at 21 HP "dies next round"); the number is the
prior arms' named number (doorflee2-b §7: "a pin that refuses a
member below ~25 HP would stop the 25/26-HP leaders"). Whole-party
coverage because the original exhibit is an ally (doorflee-b §6 S7:
third ally at 3 HP). The 25/26-HP edge cases sit at the line and
stay (strict `< 25`).

Design scope decision (from the prereg): the gate is door-scoped on
the pinned-door terms, not global. No port from the held
`sim-pinquaddoor-b` branch was needed — fresh env-gated addition on
current master, like hypofloor. The held branches were not touched.

Instrument: `scripts/pinquaddoor-driver-b.js` (stamp gains
`hpgateFlag` + `hpgateFires`), `scripts/analyze-hpgate-b.js` (the
hypofloor analyzer with the flag renamed + S8 gate-fire census + S9
avoided-doors census; selftest 21/21), `scripts/test-hpgate-b.js`
(M3g, 43 checks).

## 2. Frozen bar — how each clause judged

Base `4681e740f` (full `4681e740f89ae76adb00d14bebd35668e587ee19`).
Band 107351–107358 (fresh; three earlier fresh bands probed and
rejected for pool sizing — see §3). Policy `competent.js` sha256
first-12 `1884c8852d38`. Horizon 150d death-aware. Control =
substrate + `DOORFLEE2=1 HYPOFLOOR=1`; armed = control +
`HPGATE=1`. Same seeds, same policy. Prereg frozen 2026-11-22
~10:45Z, before any judged sim (`sim-hpgate-b-prereg.md`).

| Bar | Frozen threshold | Result | Judged |
| --- | --- | --- | --- |
| M1 allyslot3 | 18/18 | 18/18 | PASS |
| M2 pinquaddoor | 35/35 | 35/35 | PASS |
| M2w pinquaddoor-wide | 16/16 | 16/16 | PASS |
| M3 dmgpin | 29/29 | 29/29 | PASS |
| M3d doorflee2 | 49/49 | 49/49 | PASS |
| M3e downedtwice | exit 0, 25/25 | exit 0, 25/25 | PASS |
| M3f hypofloor | 48/48 | 48/48 | PASS |
| M3g hpgate (NEW) | 43/43 | 43/43 | PASS |
| Analyzer selftest | 21/21 | 21/21 | PASS |
| **F1 flee (PRIMARY)** | armed rate ≤ control − 20pp | armed 0/2 (0%) vs control 1/4 (25%) — **drop 25pp** | **PASS** |
| **P2 door kills** | armed fresh kills ≥ control | armed **2** vs control **3** | **FAIL** |
| **P3 damage** | armed total dmg/door ≥ 0.9× control | armed 970 vs control 867.5 (**1.12×**) | **PASS** |
| **B1 pin delivery** | armed ally3Vid rate ≥ control − 10pp AND ≥ 3 armed rows | rate 1.0 vs 1.0 passes; **rows 2 < 3** | **FAIL** |
| **B2 ally3Dealt** | armed total > 0 AND a fight ≥ 10 | 702 total, max 500 | **PASS** |
| **B3a kill conversion** | armed corpus-wide vKill rate ≥ control − 2pp | 5.08% vs 5.42% (**−0.34pp**) | **PASS** |
| **B4 substrate** | flags + anchor + policySha on every file | 8/8 control, 8/8 armed, no bad files | **PASS** |
| **SUPPLY** | control fought doors < 4, or 0 control flees → SUPPLY-THIN | control 4 fought, 1 flee | does not trigger |
| **M5 panel + cost** | compare `review_required`, no `regression_signal`; starvation ≤ control+2 (totals AND arm-only) AND median ≥ 0.8× control | review_required, no regression_signal; starvation 5 vs 5, arm-only 0, median 144d vs 116d (1.24×) | **PASS** |
| M6 deliverable | this file + panel + analysis JSON | this file, `hpgate-b-panel.md`, `hpgate-b-analysis.json` | PASS |

**GO requires ALL of M1–M5. P2 and B1 miss → NO-GO.**

Why the two misses are a metric failure, not a lever failure:

- **P2:** the armed leg fought 2 doors and killed both (100% kill
  rate on fought doors, both fresh). The control fought 4 and
  killed 3. Per door the armed leg is better; in total it is worse
  — because it fought fewer doors. The missing kill is the 107352
  d77 algorithm door (party entered at [78,80,89,60], min 60 HP —
  healthy; the gate never touched it). It vanished because the
  gate's single fire on d57 rewrote seed 107352's whole future
  (see §4). P2's shortfall is 100% trajectory divergence, 0%
  lever action. A bar that prices leg-total kills punishes a
  door-avoiding lever for its own action.
- **B1:** the rate half passes (1.0 vs 1.0). The ≥3-row floor fails
  because the armed leg fought only 2 doors total — the floor is
  unreachable even at a perfect rate. The floor exists to guard
  against thin samples; here the thin sample is itself caused by
  the gate's avoid plus the divergence. Same metric-design flaw:
  the bar requires the armed leg to produce ≥3 pinned rows while
  the lever's action removes doors.

## 3. Band, probes, determinism

**Frozen band 107351–107358** — fresh (0 hits in all preregs and
all evidence .md for every seed). Three earlier fresh bands were
probed with the control config and rejected before freezing:

- 107321–107328 (full 8 seeds): 10 meetings, 3 fought doors (all
  vKill), 0 flees, 0 sub-floor (min entry HP 48). F1 unmeasurable.
- 107331–107338 (4 seeds): 0 door meetings. Abandoned.
- 107341–107348 (2 seeds): pinFights 0/0. Abandoned.
- **107351–107358 (chosen): 10 meetings, 4 fought doors (1 vFlee,
  3 vKill), 1 sub-floor door** — 107352 d57 reunion, ally2 at 23 HP,
  fled R2. Thin (n=4) and the verdict turns on a single door —
  stated in the prereg before freezing, not discovered after.

**Determinism tripwire HELD:** the judged control leg reproduced
the probe exactly on all 8 seeds (days, standing, deaths,
pinFights identical — e.g. 107351: 142d, standing 545, deaths 133;
107352: 81d, standing 375, deaths 129). The code did not move
under the run. Nothing was committed before the judged legs; HEAD
stayed `4681e740f` throughout.

## 4. The legs — what actually happened

**Control** (pin+damage+hold+floor, no gate): 10 door meetings, 4
fought doors — 1 vFlee, 3 vKill (all fresh), 0 vDie. 8 seeds, 0
instrument errors, anchor `4681e740f`, policySha `1884c8852d38`.

**Armed** (control + HPGATE=1): **the gate fired exactly once**
(`hpgateFires` total 1, all on seed 107352) — and that one fire
rewrote the seed: 107352 armed survived to **150d** (control: 81d,
village-lost), standing **620** (control: 375), deaths 189
(control: 129 — all +60 from the 69 extra days; deaths/100d 126
vs 159, actually lower per day), v4 encounters 68 (control: 15),
but only **3 door meetings** (control: 10) and 2 fought doors.
The other 7 seeds are trajectory-identical to control (same days,
standing, deaths, pinFights — `hpgateFires` 0). The gate's pool on
this band is one door in eight seeds.

**Door-fight table** (entry HPs from round-1 `*HpStart`, the
doorflee method; dealt from the analyzer):

| Leg | Seed | Day | Monster | R | Outcome | Dealt | Entry HP [L,A1,A2,A3] | Min |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| control | 107352 | 56 | influencer | 5 | vKill | 948 | [71,46,87,84] | 46 |
| control | 107352 | 57 | reunion | 2 | vFlee | 380 | [67,40,23,82] | **23 SUB-FLOOR** |
| control | 107352 | 77 | algorithm | 7 | vKill | 1150 | [78,80,89,60] | 60 |
| control | 107354 | 55 | congregation | 5 | vKill | 992 | [83,96,84,88] | 83 |
| armed | 107352 | 56 | influencer | 5 | vKill | 948 | [71,46,87,84] | 46 |
| armed | 107354 | 55 | congregation | 5 | vKill | 992 | [83,96,84,88] | 83 |

The two armed doors are byte-identical to their control rows
(same rounds, same dealt, same entry HPs). The armed leg has no
d57 reunion row and no d77 algorithm row at all (S9, §5).

**Secondaries:** S1 hold census — doorHold 0 both legs,
everHopeless 1 control / 0 armed, holdFights 0/0. S2 conversion
census — **pairs 0, conversions 0, later-flees 0, no-change 0**:
the armed leg never re-fought a control door, so there is no
matched pair to convert; the entire effect is in S9. S3
leader-death census — vDie 0 both legs. S4 pin-subset B1 rate 1.0
both legs. S7 sub-floor census — control 1 (d57 reunion), armed
0. S8 gate-fire census — control 0, armed **1** (seed 107352).
S9 avoided doors — **2**: d57 reunion (the gate's fire) and d77
algorithm (trajectory divergence, NOT the gate — named here so
the next worker does not credit it to the lever).

## 5. Sense test — read the doors end to end

### The gate's door: control 107352 d57, The Reunion (vFlee, R2)

Party at the door: Patrick (leader) 67 HP, Zoe 40, **Victor 23**,
Emma 82. Victor is the sub-floor member — the gate's trigger.

> "Patrick walks straight into The Reunion. No avoiding it."
> "Zoe is already at the door too — charges in with Patrick!"
> "Victor is already at the door too — charges in with Patrick!"
> "Emma is already at the door — charges in with Patrick!"
> "R1: Your Move hits Patrick for 23 (44 left)"
> "R1: Patrick strikes for 56 (pinned quad x2) (1192 left)"
> "R1: Emma strikes for 52 (pinned x2) (1140 left)"
> "R1: Zoe strikes for 48 (pinned x2) (1092 left)"
> "R1: Victor strikes for 36 (pinned x2) (1056 left)"
> "R2: Patrick strikes for 52 (pinned quad x2) (1004 left)"
> "R2: Emma strikes for 52 (pinned x2) (952 left)"
> "R2: Zoe strikes for 48 (pinned x2) (904 left)"
> "R2: Victor strikes for 36 (pinned x2) (868 left)"
> "R2: Your Move hits Patrick for 22 (22 left)"
> "Patrick sees how this ends — and runs while running still works."

The party dealt 380 in two rounds (monster 1248 → 868, 30% down)
and then fled. The transcript is coherent: the quad fights as one
(coordinated strikes x2 on every blow), the monster answers, and
the leader runs when he can see the end.

**But the sense test challenges the gate's theory, and this is the
most important paragraph in the file.** The flee's proximate cause
is the LEADER: Patrick took every hit (23 then 22 — the monster
focused him exclusively; Victor took zero hits in either round)
and dropped 67 → 44 → 22 HP. Victor's 23 HP — the gate's trigger —
was never tested by the monster. If Victor had been healthy, the
gate would not have fired and this door would still have fled,
because Patrick still collapses in two rounds. The gate avoided a
flee, but for a different member's reason than the flee's cause:
the trigger (any member < 25) and the mechanism (leader HP
collapse under focused damage) coincided on this one door. The
prereg's rounds-to-kill reasoning assumed focused damage lands on
the near-dead member; the observed targeting is leader-focused.
The floor's coverage (whole party) is wider than the observed
threat (the leader). **Next-arm input: test a leader-HP gate** —
or a projection (leader HP after one round of monster damage) —
which would fire on this door for the right reason (Patrick
67→44→22) and on the hypofloor d110 door (Diana 21 HP), and
would not fire on a door whose only sub-25 member is a bystander
the monster never touches.

### The armed side of the same door: nothing — and that is the gap

The armed leg has **no d57 reunion row at all** — no fight, no
flee, no encounter record — and the gate's note ("gave reunion
room — Victor is too hurt to hold a door (23 HP)") is **not in
the corpus**. The note is pushed into the live agency state's
expedition encounters (`st.exped[vid].encounters`), which the
driver does not serialize; the only persisted evidence of the fire
is the counter (`hpgateFires` 1 on seed 107352) plus the missing
armed counterpart row (S9). The proof test (M3g) stages the gate
directly and asserts the note + counter in live state (43/43), so
the mechanism is proven — but the corpus cannot quote the avoid.
**Instrument gap, recorded:** the next arm should persist the
avoid as an encounter row (or a counter detail) so the sense test
can quote it. The verdict does not rest on the note: the fire is
proven by the counter + the S9 absence + the 7 trajectory-identical
seeds bracketing the one divergent seed.

### A kill door, for contrast: control = armed 107352 d56, The Influencer (vKill, R5)

> "Emma walks straight into The Influencer. No avoiding it."
> "R1: Emma's eyes go red. Next 3 strikes hit twice as hard. (Rage)"
> "R1: Zoe strikes for 50 (pinned x2) (883 left)" … "R1: Ratio hits Emma for 16 (55 left)"
> "R2: Emma stops mid-fight and binds the wound — field medicine, +20 HP."
> "R2: Ratio hits Zoe for 18 (28 left)"
> "R3: Emma strikes for 100 (x2.0) (pinned quad x2) (553 left)"
> "R4: Emma strikes for 92 (x2.0) (pinned quad x2) (313 left)"
> "R5: Callout Post hits Emma for 18 (45 left)"
> "R5: Victor strikes for 44 (pinned x2) (0 left)"
> "The lead falls — the pack's coordination shatters. The rest scatter or die."

A clean pinned-quad kill: 948 dealt over 5 rounds, Rage + field
medicine used, the quad's coordination visible in every round.
Identical on both legs (same rounds, same dealt, same entry HPs
[71,46,87,84]) — the gate does not disturb a healthy door. The
107354 d55 congregation kill is likewise identical (992 dealt, R5).

## 6. Wall numbers

| Metric | Control | Armed |
| --- | --- | --- |
| Wins (full seat) | 0/8 | 0/8 |
| National by scaleRank ≥ 2 | 0/8 | 0/8 |
| National by standing ≥ 200 | 5/8 | 5/8 |
| Table (seat taken) | 0/8 | 0/8 |
| Wave 4 unlocked | 7/8 | 7/8 |
| Wave 5 unlocked | 5/8 | 5/8 |
| Median survival | 116d | 144d |
| Villages lost | 6/8 | 5/8 |
| Village deaths (total) | 836 | 896 |
| Deaths per 100 days | 92.3 | 91.9 |
| Starvation / thirst deaths | 5 | 5 |
| Kill conversion (all fights) | 11/203 = 5.4% | 13/256 = 5.1% |
| Standing (max) | 545 | 620 |
| Scale rank (max) | regional | regional |

Per-seed survival (days) — control: 142, 81, 146, 150, 150, 61,
86, 90; armed: 142, **150**, 146, 150, 150, 61, 86, 90. Deaths
per seed — control: 133, 129, 133, 148, 108, 48, 64, 73; armed:
133, **189**, 133, 148, 108, 48, 64, 73. Starvation/thirst per
seed, identical both legs: 107351: 0, 107352: 0, 107353: 0,
107354: 1, 107355: 0, 107356: 3, 107357: 1, 107358: 0.

**Village assessment, in plain words:** nothing else moved. No
wins, no seats, no national standing on either leg — this band's
villages are regional survivors, not contenders, and the gate
does not change that. The one village the gate touched lived
longer and stood taller (150 days, 620 standing, the band's best)
and did not lose anyone to hunger for it. The extra 60 deaths on
that seed are the price of 69 extra days of living, not a cost of
the gate — deaths per day actually fell. The gate is a small
safety rule with a small pool (one door in eight villages), not a
winnability lever on this evidence: it saves a village from one
bad door, it does not make villages win.

## 7. Balanced panel compare (M5)

`node scripts/balance-panel.js compare` on the paired 8-seed
panel (`hpgate-b-panel.md` attached): decision
**review_required**, exit code as printed by the tool. Village
deaths per run 104.5 vs 112 (paired delta +7.5, 95% interval 0
to 22.5, 8/8 pairs, **regression_watch**); village deaths per 100
calendar days 93.4757 vs 89.3538 (delta −4.1219, interval
−12.3656 to 0, **no_material_signal**). Community loss 0.75 vs
0.625 (−0.125, no_material_signal). National scale access 0 vs 0;
table win rate 0 vs 0. **No metric carries a `regression_signal`.**
The deaths-per-run watch is explained, not alarming: it is
entirely seed 107352 living 69 extra days (deaths per 100 days
fell). **M5 PASSES** on the panel half.

Cost bar (scalemetric deciding bar): starvation/thirst 5 vs 5
(≤ control+2 on totals ✓); arm-only starvation 0 — the divergent
seed 107352 has 0 starvation deaths on both legs (✓); median
survival 144d ≥ 0.8 × 116d = 92.8d (✓). **Cost bar PASSES.**

## 8. Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-22/perseed-hpgate-b-{control,armed}/*.json'
--metrics national,table,wins,exiled --sweep-rows
--allow-recorder-corpus` (run per leg; the tool refuses
recorder-corpus input by default — recorder corpora are compared
with sweep-compare tables, never against a run baseline — and
`--allow-recorder-corpus` is its sanctioned path):

- Control: `wall: won=0/8` — **LOUD: national disappeared:
  baseline 12 -> current 0; LOUD: table disappeared: baseline 16
  -> current 0; LOUD: wins disappeared: baseline 16 -> current 0.**
- Armed: identical lines — `won=0/8`, the same three LOUD lines.

**These LOUD lines are the documented regime artifact, not an
arm effect.** The baseline file itself says: "DO NOT compare
pre-seat / courtship / readiness substrates against this baseline
— wins are structurally ~0 there and telemetry-check will fire a
spurious LOUD 'wins disappeared'." This arm's substrate is a
pre-seat substrate (pinquaddoor, no winseat stack), and the
control leg — the prior arm's configuration, untouched by this
lever — fires the identical lines. The armed leg introduced **no
deviation relative to control** on any of the four metrics.

## 9. Verdict (§14a classification: METRIC-BROKEN)

**NO-GO.** P2 (2 vs 3 fresh kills) and B1 (2 < 3 armed ally3Vid
rows) miss on the frozen bar. The classification is
METRIC-BROKEN, not CONCEPT-DEAD and not SUBSTRATE-MISSING:

- The lever works as designed: it fired once, on the one door in
  its pool (d57 reunion, Victor 23 HP), the flee it was built to
  avoid did not happen on the armed leg, F1 passes with a 25pp
  drop, damage per door rose, and no cost bar moved.
- What failed is the measurement: P2 and B1 are leg-total bars,
  and a single gate fire rewrote seed 107352's future so the
  armed leg fought 2 doors instead of 4. The bars cannot
  distinguish "the gate failed" from "the gate fired once and
  chaos ate a door." The pilot cannot price a 1-door-per-8-seeds
  lever with leg totals.
- The sense test adds a design question that is NOT a bar failure
  but is the next arm's real input: the gate's trigger (any member
  < 25 HP) and the observed flee mechanism (leader HP collapse
  under focused damage) coincided once without being the same
  thing. A leader-HP gate would target the actual mechanism.

**What the next arm should do (not this arm's call):** (a) price
the gate per door-meeting — fired? then did the meeting flee,
kill, or avoid? — using the S8/S9 censuses as the primaries, not
leg totals; (b) persist the avoid as an encounter row so the
sense test can quote it; (c) test a leader-HP floor (or a
leader-projection floor) alongside the whole-party floor, since
the observed flees are leader-driven; (d) run on a door-rich band
if the question is kill conversion — this band's pool (1 door /
8 seeds) bounds the lever's total effect no matter how well it
works. **Finding #2619 stays open.** No confirm run is spent.

## 10. Metric review (for the next run — this run is judged as frozen)

- F1 priced on the flee RATE with the count secondary: held. The
  armed leg fought fewer doors (2 vs 4) and still passed on rate
  — the repricing earned its keep.
- P3 priced on TOTAL damage per door, not per round: held (armed
  970 vs control 867.5; per-round would have told the same story
  here, 194 vs 182.6, but the total is the honest guard).
- **P2 and B1 as leg-total bars cannot price a door-avoiding
  lever.** Propose for the next run: per-meeting primaries (gate
  fired → meeting outcome) and a door-rich band; keep leg-total
  kills as a secondary only. A bar that requires the armed leg to
  produce ≥3 pinned rows while the lever's action removes doors is
  structurally unreachable on a thin band.
- The conversion census (S2) was empty — not because nothing
  happened, but because the armed leg never re-fought a control
  door. Matched-pair conversion needs trajectory stability the
  sim does not provide after a gate fire; S9 (avoided doors) is
  the honest effect census for this lever family.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- Instrument gap (new this run): the gate's avoid note is
  live-only (`st.exped[vid].encounters`) and is not serialized
  into the corpus — the next arm should persist the avoid as an
  encounter row.
- The S7 blank from doorflee2 is now closed as a census (control
  1 sub-floor door, armed 0) — and re-opened as a design question
  by the sense test (leader vs member trigger).

## 11. Files

- Prereg: `evidence/2026-11-22/sim-hpgate-b-prereg.md` (frozen
  2026-11-22 ~10:45Z, before any judged sim)
- Evidence: `evidence/2026-11-22/sim-hpgate-b.md` (this file)
- Analysis: `evidence/2026-11-22/hpgate-b-analysis.json`
  (analyzer --json over both corpus dirs)
- Panel: `evidence/2026-11-22/hpgate-b-panel.md` +
  `hpgate-b-panel.json` + `hpgate-b-panel-before.json.gz` +
  `hpgate-b-panel-after.json.gz`
- Corpora (judged): `evidence/2026-11-22/perseed-hpgate-b-control/`
  (8 files) + `evidence/2026-11-22/perseed-hpgate-b-armed/`
  (8 files)
- Probe corpora (pre-freeze): `evidence/2026-11-22/perseed-hpgate-b-probe/`
  (22 files: bands 107321–107328, 107331–107334, 107341–107342,
  107351–107358) + probe logs `hpgate-b-probe-chunk1.log`,
  `hpgate-b-probe-chunk2.log`, `hpgate-b-probe2-chunk1.log`,
  `hpgate-b-probe3-screen.log`, `hpgate-b-probe4-screen.log`,
  `hpgate-b-probe4-chunk1.log`, `hpgate-b-probe4-chunk2.log`
- Leg log: `evidence/2026-11-22/hpgate-b-legs.log`
- Instrument: `scripts/pinquaddoor-driver-b.js`,
  `scripts/analyze-hpgate-b.js`, `scripts/test-hpgate-b.js`
- Lever: `src/js/villager-agency.js` (+43/−0, HPGATE in
  `expeditionMonster`). No default flip. Base `4681e740f`.
