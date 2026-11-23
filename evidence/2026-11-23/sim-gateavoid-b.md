# sim-gateavoid-b — durable gate-avoid log + leaderproj re-judge (Loop B 0030Z adoption)

**Verdict: NO-GO — D1 fails, kind METRIC-BROKEN (bar unpassable on this
pool).** The instrument this arm exists to prove is PROVEN: the durable log
attributes the projection gate's avoid on the only pool door (D6 passes,
projAvoids 1, armed pool doors fought 0). The D1 bar cannot pass on this
band because the control pool collapsed to a single door that was already
GOOD — a −20pp improvement on a 0%-bad pool is mathematically unpassable.
The lever is not concept-dead and the substrate is not missing; the metric as
frozen cannot judge it on this band. Next run needs a door-richer band (see
"Metric review").

**Run:** `fleshout-loop-b-20261123T0030Z`, arm `sim-gateavoid-b`. **Base
(frozen):** `0b3993e80`. **Band (REUSED deliberately — a re-judge):**
107391–107398, the leaderproj band. **Control:** substrate +
`DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`. **Armed:** control + `LEADERPROJ=1`
only. Substrate both legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1
DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`. Policy `1884c8852d38`, horizon 150d
death-aware. Gate stays env-gated OFF; no default flip.

## Frozen-bar table

| Bar | Result |
| --- | --- |
| M1 test-allyslot3-b 18/18 | **18/18 PASS** |
| M2 test-pinquaddoor-b 35/35 | **35/35 PASS** |
| M2w test-pinquaddoor-wide-b 16/16 | **16/16 PASS** |
| M3 test-dmgpin-b 29/29 | **29/29 PASS** |
| M3d test-doorflee2-b 49/49 | **49/49 PASS** |
| M3e test-downedtwice-b 25/25, exit 0 | **25/25 PASS** |
| M3f test-hypofloor-b 48/48 | **48/48 PASS** |
| M3g test-hpgate-b 43/43 | **43/43 PASS** |
| M3h test-leaderhpgate-b 50/50 | **50/50 PASS** |
| M3i test-leaderproj-b 55/55 | **55/55 PASS** |
| M3j test-gateavoid-b 36/36 (NEW) | **36/36 PASS** |
| Analyzer selftest 39/39 | **39/39 PASS** |
| D1 bad-outcome rate, matched projection pool (PRIMARY) | **FAIL** — pool 1, control bad 0/1 (0%), armed bad 0/1 (0%), drop 0pp; bar needs armed ≤ control − 20pp = −20pp. projAvoids 1. |
| D2 kill rate per fought door | **PASS** — armed 1/1 (1.000) vs control 2/2 (1.000) |
| D3 total damage per door | **PASS** — armed 1082 vs control 1196 (0.905× ≥ 0.9×) |
| D4 mechanism engagement (leaderprojFires ≥ 1) | **PASS** — armed 1, control 0 |
| D5 substrate sanity (+ gateAvoidLog array on every file) | **PASS** — 8/8 files both legs, no bad |
| D6 durability (log length == total fires, per-kind == counters) | **PASS** — control 1 == 1 (hold 1); armed 3 == 3 (hold 2, proj 1) |
| M5 guardrail: balanced panel `review_required`, NO `regression_signal` on village deaths; starvation ≤ control+2 (totals AND arm-only); median survival ≥ 0.8× control | **PASS** — `review_required`, no `regression_signal` (village deaths/run 97.75 → 96.5, no_material_signal); starvation 1 armed vs 2 control; median survival 150 vs 150 |
| M6 deliverable | this file + panel + analysis JSON |

## Probe (§14b pool-sizing probe — control config, before the judged legs)

Probe table on THIS base (`0b3993e80`), 8 seeds, 0 instrument errors, anchor
`0b3993e800f4`, policy `1884c8852d38`:

| | Leaderproj probe (base 1c11dbb14) | This probe (base 0b3993e80) |
| --- | --- | --- |
| Fought doors | 3 (vKill 2, vDie 1) | **2 (vKill 2)** |
| D1 matched projection pool | 2 doors, bad 1/2 = 50% | **1 door, bad 0/1 = 0%** |
| S10 bands | dead1 0 / dead2 1 / collapse2 1 / safe 1 | **dead1 0 / dead2 1 / collapse2 0 / safe 1** |
| Pool doors | 107391 d98 reunion vDie (leader 61); 107394 d113 rerun vKill (leader 38) | **107394 d113 rerun vKill (leader 38) only** |

**The table moved.** The 107391 d98 reunion vDie door is gone on this base;
107391's only fought door is now d148 eater vKill (leader 95, safe). The
107394 d113 rerun vKill (leader 38) reproduced exactly. Seeds 107396–107398
added no fought doors on either base.

**Investigation (before the judged legs, per the prereg).** The old and new
107391 probe corpora (both on disk: `evidence/2026-11-22/
perseed-leaderproj-b-probe/` vs this arm's probe dir) start identically —
same first four departures (d6 hold ×2, d6 jorge launch, d7 launch) and the
same early deaths through ~d33 — then diverge at **day 40–41**: the new base
adds an extra `party_launch` depart at d40 (gen_6fs6wo2, no target) and the
d41 xavier launch shifts to d42. Villager deaths: old 21 vs new 5; standing
199 → 690; v4 rows 48 → 15; v4departs 51 → 65. The first divergence is in
companion-plan sync (an extra launch), which is the needwave guarded copy's
exact surface (`054f525bc`: villager-brain.js + win-plan.js companion-plan
sync, landed between 1c11dbb14 and 0b3993e80) — the prereg's named prime
suspect, and the divergence point supports it. No bisect was run (it would
cost a band of sims to confirm what the localization already shows).

**Tripwire (probe → judged control).** The judged control leg re-ran the same
8 seeds under the same config on the same base and reproduced the probe's
door table exactly: fought doors (107391 d148 eater vKill 95; 107394 d113
rerun vKill 38). Seven of eight control corpus files are byte-identical to
their probe files. The eighth, 107398, differs in exactly one field: the
`dawnbidDeparts[].seq` counter (probe 1–19, control 220–238) — a per-process
sequence counter, because the probe's 107398 ran alone in a fresh resume
process after the 03:23Z VM replacement killed the chunk, while the control's
ran fourth in its chunk process. With `seq` stripped, the 19 rows are
identical, and every other key matches. The tripwire HOLDS on its stated
terms (door table reproduced); the `seq` offset is a recorder artifact of the
resume, not game drift. **The tripwire for this run is therefore the probe
table on this base, stated above.**

## Door-fight table (every fought door, both legs)

Control (2 fought doors):

| Seed | Day | Monster | Outcome | Rounds | Dealt | Leader entry HP | Band | projHp2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107391 | 148 | eater | vKill | 4 | 1082 | 95 | safe | 45 |
| 107394 | 113 | rerun | vKill | 6 | 1310 | 38 | dead2 | −12 |

Armed (1 fought door):

| Seed | Day | Monster | Outcome | Rounds | Dealt | Leader entry HP | Band | projHp2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107391 | 148 | eater | vKill | 4 | 1082 | 95 | safe | 45 |

The armed leg fought no other door. Its 107394 d113 rerun door was avoided
by the projection gate (see the matched-pool table), and no other seed
produced a fought door on either leg.

## Matched-pool table (D1 — the one pool door)

| Seed | Day | Monster | Control outcome | Leader HP | Armed outcome | Attribution |
| --- | --- | --- | --- | --- | --- | --- |
| 107394 | 113 | rerun | vKill (6 rounds) | 38 | avoided | **'proj' log entry, same seed + day + monster** |

Control pool: 1 door, bad 0/1 (0%). Armed: 0 bad / 1 (0%), 1 projAvoid, 0
kills, 0 mFlees, 0 flees, 0 dies, 0 divergence, 0 other-gate. D1fought
(reported secondary): control 1 fought pool door, armed 0 — "a working gate
leaves no armed pool door — expected, not a failure."

## Gate-fire census (S8) + the log-vs-notes gap (S8c)

| | Control | Armed |
| --- | --- | --- |
| hpgateFires ('hold') | 1 | 2 |
| leaderhpgateFires ('lead') | 0 | 0 |
| leaderprojFires ('proj') | 0 | 1 |
| gateAvoidLog entries | 1 (hold 1) | 3 (hold 2, proj 1) |
| gateAvoidNotes surviving | 1 (hold 1) | 2 (hold 2) |
| **Log − notes gap** | **0** | **1 — exactly the 'proj' entry** |

The armed leg's durable log carries three entries; the parsed notes carry
only two. The missing one is the projection avoid itself:

- 107391 d148, eulogy, 'hold', Xavier, 17 HP — "gave eulogy room — Xavier
  is too hurt to hold a door (17 HP)" (both legs; the note survived here).
- **107394 d113, rerun, 'proj', Jovan, 38 HP, projHp2 −12 — "gave rerun room
  — Jovan is too hurt to lead a door (projected 38 HP, -12 HP in two
  rounds)" (armed only; NO surviving note — the expedition record was
  deleted on return, exactly the blind channel the leaderproj arm
  diagnosed. The log is the only record.)**
- 107394 d114, congregation, 'hold', Brian, 9 HP — "gave congregation room
  — Brian is too hurt to hold a door (9 HP)" (armed only).

**This is the instrument proof the arm exists for:** on the leaderproj run,
9 fires left 1 surviving note; on this run, the one projection fire that
matters left 0 surviving notes and 1 durable log entry, keyed seed + day +
monster, and the analyzer attributed the pool door from it.

## S10 leader-projection census

- Control fought: dead2 1 (107394 rerun, leader 38, projHp1 13, projHp2 −12),
  safe 1 (107391 eater, leader 95, projHp2 45). Fired: 1 'hold' (Xavier 17
  HP, projected dead after one round, leader not known — 'hold' entries
  don't carry the leader).
- Armed fought: safe 1 (107391 eater). Fired: 3 — the 'hold' above; the
  'proj' (Jovan 38 HP, projHp1 13, projHp2 −12, projected-dead after two
  rounds, leader KNOWN); the d114 'hold' (Brian 9 HP, projected dead).
- Leader-sub-25 fought doors (S7 first half): 0 on both legs. Any-member
  sub-25 doors as read from the log (S7 second half): the three log entries
  above (17, 38-projection, 9 HP).

## Secondaries

- S1 hold census: doorHold 0 rounds both legs, 0 fights with a hold, 0
  everHopeless fights both legs (the holds here are gate avoids, not
  in-fight holds).
- S2 conversions: 0 pairs — there was no control vFlee door to convert
  (both control doors were vKill). Avoided doors: 1 (the pool door, S9
  attribution 'proj').
- S3 leader-death census: 0 vDie doors on either leg.
- S4 pin-subset B1 rate: armed 1/1, control 2/2 (rate-only, floor dropped).
- S6 wall numbers (computed from the corpora, identical on both legs unless
  noted): wins 0/0, national (scaleRank ≥ 2) 0/0, standing ≥ 200 on 5/8
  seeds (107391: 690, 107393: 425, 107394: 355, 107396: 300, 107397: 435;
  the other three sit at exactly 199), table 0/0, wave-4 unlocks 8/8,
  wave-5 unlocks 5/8 (maxWave [5,4,5,5,4,5,5,4]); median survival 150/150;
  deaths 782 control / 772 armed; villages lost 1 control (107392 d142) /
  2 armed (107392 d142, 107394 d120); starvation 2 control / 1 armed.
- S11 D1fought: control 1, armed 0 (unmeasurable on the armed leg when the
  gate works — expected).

## Sense-test transcript read

**The avoided meeting (armed 107394 d113, from the durable log — the only
record, no note survived):** "gave rerun room — Jovan is too hurt to lead a
door (projected 38 HP, -12 HP in two rounds)." Leader Jovan Milic at 38 HP
enters a door against The Rerun; the gate projects −12 HP after two rounds
of focused wave-4 damage and refuses the door. The party never fights.

**The same door fought (control 107394 d113, blow-by-blow):** "Jovan walks
straight into The Rerun. No avoiding it." Lena, Darnell and Brian charge in
with him — a pinned quad. R1–R2 the quad deals ~250/round while the
clapperboard holds ("take 12, 4 rounds to the rewind"). R3: "Take Twelve
hits Jovan for 11 (27 left)". R4: "Cold Open hits Jovan for 11 (16 left)".
R5: "CLAP — 'TAKE 13.' The fight rewinds; the Rerun comes back fresh (+10%
— it remembers)." R6: "Jovan strikes for 60 (… ) (0 left). The lead falls
— the pack's coordination shatters." The party kills The Rerun — and the
deaths list records Jovan Milic dying to the monster the same day. The gate's
forecast was right about the leader: projected −12 HP in two rounds, and the
leader died winning the fight.

**The other fought door (control = armed, 107391 d148 eater):** "Jorge walks
straight into The Eater. No avoiding it." Jorge opens with the Sling at
range (1 of 2 stones hit, 8 damage), then the pinned quad — Jorge, Henry,
Ulzhan, Xavier — deals ~300/round. "Gorge hits Xavier for 15 (54 left)" …
"Gorge hits Xavier for 19 (17 left)" … R4: "Ulzhan strikes for 66 (… ) (0
left). The lead falls." Four rounds, 1082 damage, leader Jorge at 95 HP
(safe band) throughout. The same fight, byte-identical, on the armed leg —
LEADERPROJ never fired on this seed, so the legs never diverge here.

**The d120 loss (armed 107394, single-seed observation, not a bar):** the
armed village was lost at d120, seven days after the avoid; the control
village on the same seed survived to 150. But the loss came with NO deaths
after d114 (Brian died of thirst d114 on both legs), so no causal chain from
the avoid to the loss is visible in the data — it reads as trajectory
divergence after the avoid (the village was already losing people), not as
the avoid killing the village. The avoid did remove the seed's only door
kill (the control's d113 vKill was its only fought door), which is the
honest tension: the gate saved the leader's life and cost the village its
one door kill on that seed. n=1; recorded, not judged.

## Balanced panel (M5)

`RUN=gateavoid-b` panel compare: decision **`review_required`**, no
`regression_signal` anywhere. Village deaths/run 97.75 → 96.5 (paired delta
−1.25, no_material_signal); village deaths/100d 65.83 → 66.47
(regression_watch, not a signal); community loss 0.125 → 0.25
(regression_watch — 1 vs 2 villages lost). Table win rate 0 → 0; national
scale access 0 → 0. Cost bar: starvation 1 armed vs 2 control (≤ control+2
on totals and arm-only); median survival 150 vs 150 (≥ 0.8× control).
M5 PASSES.

## Diag table (§1 of the doorflee evidence — the instrument gap, closed)

| | Leaderproj run (1630Z) | This run |
| --- | --- | --- |
| Gate fires (armed) | 8 leaderproj | 1 leaderproj (+2 hold) |
| Surviving gate-avoid notes | 1 of 9 fires | 2 of 3 fires (both 'hold') |
| Durable log entries | — (did not exist) | 3 of 3 fires |
| Pool doors attributed | 0 of 2 (both scored BAD on "no armed row, no gate note") | **1 of 1 ('proj', seed+day+monster)** |
| D1 verdict | FAIL, METRIC-BROKEN (blind channel) | FAIL, METRIC-BROKEN (bar unpassable on a 1-door 0%-bad pool) |

## Metric review

- **D1's −20pp bar presumes a pool with bad outcomes to reduce.** This
  band's control pool has one door and it was already GOOD (vKill). The bar
  is unpassable before the armed leg runs: armed bad ≤ −20pp. The gate did
  everything it could on the only door it could touch (avoided it via
  'proj', attributed by the log), and D1 still fails. The failure is the
  band's, not the lever's — but the frozen rule is a miss on any of M1–M5
  is NO-GO, never re-scored, so the verdict stands.
- **Divergence stays BAD by design, and it did not bite here** (divergence
  0 — the armed leg's pool door was avoided by the gate itself, not lost to
  trajectory drift). The day-window matching proposal does not return from
  this run: there is nothing to re-match.
- **D2/D3 on a 2-vs-1-door band are noise, not signal** (leaderproj metric
  review, confirmed again): D3 passed at 0.905× — one door's damage swings
  it by ~20%. Do not over-read D2/D3 here.
- **The next run needs a door-richer band** (or a 12–16-seed confirm on a
  band whose control pool has bad outcomes) before D1 can bind. The
  leaderproj band is spent on this base: its pool collapsed from 2 doors /
  50% bad to 1 door / 0% bad under master movement (needwave). Re-running
  this band again will not re-open D1.
- **D4's bar (≥ 1 fire) is still weak as written** — it passed on a single
  fire. D6 now pairs it with the durability check, so a blind gate cannot
  pass D4+D6 together; but a one-fire D4 on a thin band is thin evidence
  for the lever. The next run should keep D4 and add a fires-per-pool-door
  secondary.
- **The 107394 d120 loss** (armed village lost 7 days after the avoid;
  control survived) is the open empirical question about this gate: does
  avoiding a winnable door cost the village more than it saves the leader?
  On this seed the leader died winning in control and lived in armed — yet
  the armed village was lost and the control survived. One seed cannot
  answer it; the door-richer next run must carry a per-seed village-fate
  secondary on avoided pool doors.

## Runs log

- Proof battery (post-freeze, this tree): node-check green on all four
  files; 18/18, 35/35, 16/16, 29/29, 49/49, 25/25, 48/48, 43/43, 50/50,
  55/55, 36/36, analyzer selftest 39/39. Log:
  `~/workspace/proof-battery-gateavoid-0030.log` (coordinator workspace).
- Probe: 8 seeds, control config, 0 errors. Chunk 2's seed 107398 was
  interrupted by the 03:23Z VM replacement and resumed alone (no seed
  re-run; per-seed files persist).
- Judged legs: control 8 seeds (byte-identical to the probe on 7/8; 107398
  differs only in the per-process `seq` counter — see "Tripwire"), armed 8
  seeds (+LEADERPROJ=1). Legs log: `gateavoid-b-legs.log`.
- check.js --quick: run in this worktree after the src change (serialized);
  see the round record for the count and attribution. The worker's claim of
  "6 check.js failures unresolved" was unverified — no check.js log existed
  on disk before the adoption run.

## Files

- Prereg: `evidence/2026-11-23/sim-gateavoid-b-prereg.md`
- Instrument: `scripts/pinquaddoor-driver-b.js` (gateAvoidLog stamp),
  `scripts/analyze-gateavoid-b.js` (NEW), `scripts/test-gateavoid-b.js`
  (NEW, M3j), plus the carried proof tests
- Build: `src/js/villager-agency.js` — GATEAVOID log appends in the three
  gate-fire blocks only (+40/−3)
- Corpora: `evidence/2026-11-23/perseed-gateavoid-b-probe/` (8 files) +
  `perseed-gateavoid-b-control/` (8 files) +
  `perseed-gateavoid-b-armed/` (8 files)
- Analysis: `evidence/2026-11-23/gateavoid-b-analysis.json`
- Panel: `evidence/2026-11-23/gateavoid-b-panel.md` +
  `gateavoid-b-panel-before.json.gz` + `gateavoid-b-panel-after.json.gz`
- Evidence: this file.
