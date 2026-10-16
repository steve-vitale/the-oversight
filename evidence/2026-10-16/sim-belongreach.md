# sim-belongreach — road-aware wave-5 pursuit on the PRE-SEAT stack (flesh-out loop, 2026-10-16)

Worktree: `~/workspace/worktrees/sim-belongreach`. POLICY-SIDE ONLY — ZERO src/js changes. Branch: sim-belongreach, based on current master.

Axis: scale-onramp (standing scale directive). The tracker's named next from the sim-w5reach3 metric review: "a road-aware wave-5 pursuit — hunt only where the base's own verbs aren't already unlocking".

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law), docs/TABLE.md (sanctity). Canon facts the layer is built on:
- Wave-5 gate (standing.js): villageStandingTotal() >= t5(200) AND waveUnlockReady(5).ready = waveEngaged(4) >= 2 distinct wave-4 types faced blow-by-blow (FLEEING COUNTS — "you stood on the grid"); bread counts at most 100 toward t5; the rungs sit on top of the wave-3 rung.
- The wave5reach hunt/commit mechanism (scripts/policies/wave5reach.js, LANDED — not refactored): counter-learning expeditions every 3rd day (healthy hp>=60%, fed kcal>=200), _huntCommit (wave-3, holds to 12%) and _w5Commit (wave-4+ at >=50% HP, overrides start-of-fight walk-away ONLY; the mid-fight 35% eject is unchanged).
- sim-w5reach3 road heterogeneity (evidence/2026-10-15/sim-w5reach3.md): armed moved belong road 0/8 → 4/8 wave-5 unlocks but regressed lead road 8/8 → 5/8 with median −11.5d (scholar-absence + fight-risk cost where the base already wins).

## The arm (the only new thing)

scripts/policies/belongreach.js — the wave5reach mechanism copied/adapted, gated to the BELONG road only:
- Env gate BELONGREACH=1 (default OFF). Gate off = pure delegation, byte-identical to the seatdrive composition (det-gate pinned).
- Road gate: lead ids get pure delegation EVEN with the layer opted in (huntLive's road check + the roadEnabled closure in withBelongReach).
- The landed tableBusy(tableDone||tableWaiting) heuristic is preserved verbatim — this arm is the ROAD gate, not the table gate (the w5reach3 tableActive refinement was reverted per kill protocol; wave5reach.js itself is untouched).
- Same ids as the armed side uses ('leadfeast-windefer', 'belongfeast-windefer'); BELONGREACH is the only switch.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep)

**Question:** does gating the wave-4 counter-learning hunts to the belong road keep the belong-road unlock gain (0/8 → 4/8) while removing the lead-road regression (8/8 → 5/8, −11.5d)?

**The lever:** scripts/policies/belongreach.js — env-gated BELONGREACH=1, default OFF. Wraps SD.leadseat / SD.belongseat (same ids). On the belong road after wave-4 unlock and before wave-5 unlock (and never while a table invitation pends — the landed tableBusy heuristic):
1. Counter-learning expeditions (hunt legs): every 3rd day, healthy (hp>=60%) and fed (kcal>=200), travel to thicket/ruin/forest/grove nodes, engage visible wave-3/4+ monsters (facing fills waveEngaged — fleeing counts), come home. The win-side verbs run FIRST and fully — the hunt is additive, never preempting.
2. Fight commitment: wave-3 in fight → ctx._huntCommit (courtkill's proven mechanism, holds to 12%); wave-4+ in fight + scholar >=50% HP → ctx._w5Commit, honored by the extended legacy flee block in scripts/policies/competent.js (start-of-fight walk-away overridden ONLY; the mid-fight 35% eject is UNCHANGED).
3. No free knowledge, no combat cheats, no deed-bar reimplementation: reads Game state, issues player verbs — never writes engine state.

**Arms:** control = pre-seat stack (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE NEVER set) with BELONGREACH unset; armed = the same + BELONGREACH=1. Identical seeds both sides, 180d death-aware (dead villages stop simulating, +10d tail max), own control in the same sweep. Belong road ONLY.

**Seeds:** 8 FRESH [181,292,403,514,625,736,847,958] (verified: zero prior per-seed files in evidence/ as seed values) x belongfeast x {control, armed} = 16 runs.

**Horizon + why:** 180d death-aware. Wave-5 unlocks land d69–d163 on measured pre-seat sets; the pre-seat stack's runs live long (w5reach3: median ~110–118d), so the full horizon is the honest surface.

**Proof:** scripts/test-belongreach-20261016.js — RED→GREEN on the layer: (a) gate-off byte-identity (BELONGREACH unset → byte-identical trajectories on identical seeds, both roads); (b) road gate: lead ids pure delegation with BELONGREACH=1 — fabricated mid-game state shows zero hunt state touched AND lead-armed vs plain-seatdrive byte-identity; (c) belong ids with BELONGREACH=1 fire hunts post-wave-4-unlock (mechanism test on a fabricated mid-game state: w5Hunts>=1, cadence-gated); (d) 35% eject preserved: the layer's code contains no threshold/eject/flee logic, and competent.js's eject line reads `_huntCommit ? 0.12 : 0.35` — _w5Commit never enters it. Full file: scripts/test-belongreach-20261016.js (GREEN: 34 pass, 0 fail).

**PRIMARY (binding):** belong wave-5 unlocks armed >= control+2.

**SECONDARY:** mean per-seed paired wave-5 unlock-day delta (armed − control) <= −4d over both-unlocked pairs (reported even at n<4 — no-coverage is a finding, not a failure). Wave-5 unlock days via DAILY unlockedWave() sampling (finding #360).

**GUARDRAILS (binding):** median survival >= control − 10d; national >= control − 2; exiled 0; no new death mode at n>=3.

**EXERCISE GATE (binding):** >= 10 hunt engagements across the sweep (contact, not no-contact — w5reach2 was nearly opportunity-starved).

**PILOT GO → CONFIRM:** 16 seeds [181..958 + 192,303,414,525,636,747,858,969] (192/303/414/525/636/747/858/969 checked: no collision with loop B's live [171,282,393,504,615,726,837,948]; note seed 303 was used by the unrelated rfconfirm instrument (run-belongseek/run-leadcourt-s303) — different policy pair, noted not fresh there but outside this run's pairing structure). Kill per kill protocol: layer deleted, evidence+instruments kept, proof INFO-SKIPs.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY is NO-GO (binding).** Belong wave-5 unlocks: armed 1/8 vs
   control 1/8 (bar: armed >= control+2). The arm did not move the needle.
2. **EXERCISE GATE is NO-CONTACT (binding).** 1 hunt engagement across
   the sweep (bar: >= 10). The hunts fired 9 times (9 legs over 17 live
   days) but almost never contacted a monster — the landed tableBusy
   heuristic strands the hunt for the whole pending-invitation window
   (pre-seat stack: invitations pend ~constantly, 0 sittings), so the
   road-aware layer is starved of live days the way the landed wave5reach
   was stranded for 419 days in finding #369. This is a genuine
   mechanism-starvation, not a no-opportunity stack: w5reach3 with the
   tableActive refinement got 18 engagements on the same road.
3. **SECONDARY is no-coverage — a finding, not a failure.** Zero
   both-unlocked pairs: s181 unlocked control-only (d98), s403 armed-only
   (d127). The paired-delta surface cannot be computed on this road with
   n=8.
4. **The armed-only unlock (s403, d127) is not a mechanism win.** The
   run shows hunts=1, legs=2, engagements=0, bloodFights=0,
   facingFights=0 — the base's own verbs filled waveEngaged(4) >= 2 and
   greenlit the fifth draft; the single hunt leg was incidental. The
   control twin died d128 still wave-4-locked. A 1-day near-tie, not a
   lever effect. Reported honestly, not claimed.
5. **Guardrails all GO.** Median survival 123.5d vs 120.0d (+3.5d, bar >=
   control−10d); national 5/8 = 5/8 (bar >= control−2); exiled 0/0;
   wins 0/16 (expected); no new death mode at n>=3 (armed-only modes:
   none; "the night" x2 control-only; contest 4 vs 2 is the same mode at
   higher count).
6. **Named next (for the NEXT run, not this one):** the w5reach3 belong
   gain (0/8 → 4/8) came from the *combination* of the engine-honest
   tableActive gate (397 recovered days) AND the hunt mechanism. The
   road-aware gate alone, on the landed stranding heuristic, starves. A
   road-aware + tableActive-gated arm would test the real combination —
   but it touches wave5reach.js's tableBusy, which this arm was forbidden
   from refactoring, and the w5reach3 review ruled the refinement "must
   not be re-landed as-is." That combination is a new arm with its own
   pre-registration, not a revival of this one.

## Results

16 runs (8 fresh seeds x belongfeast x {control, armed}), 180d
death-aware, pre-seat substrate, own in-sweep control. Per-seed JSONs:
evidence/2026-10-16/perseed-belongreach/ (16/16 present, 0 schema-bad).
Beat captures: evidence/2026-10-16/belongreach-beats/ (16/16).
Sweep log: evidence/2026-10-16/belongreach-sweep.log.

| metric | control (n=8) | armed (n=8) | bar | verdict |
|---|---|---|---|---|
| wave-5 unlocks (PRIMARY) | 1/8 | 1/8 | armed >= control+2 | **NO-GO** |
| paired unlock-day delta (SECONDARY) | — | no both-unlocked pairs | <= −4d | no-coverage (finding) |
| wins | 0/8 | 0/8 | expected 0, LOUD if any | GO |
| national | 5/8 | 5/8 | >= control−2 | GO |
| table invites | 6/8 | 6/8 | — | — |
| wave-4 unlocks | 6/8 | 6/8 | — | — |
| exiled | 0/8 | 0/8 | 0 | GO |
| median survival | 120.0d | 123.5d | >= control−10d | GO (+3.5d) |
| engagements (EXERCISE) | 0 | 1 | >= 10 | **NO-CONTACT** |

Wave-5 unlock days (daily unlockedWave() sampling — finding #360's fix):
- control: s181 d98
- armed: s403 d127

Mechanism counters (armed): 9 hunts, 17 liveDays, 1 engagement,
21 bloodFights (wave-3 commits), 8 facingFights (wave-4+ commits).
Control: all zero (gate off, as designed). Zero scholar deaths to
committed fights (the 35% retreat discipline held, per the E3 pin).

Death modes: control dominated by combat (133), villager-combat (67),
monster (53), expedition (18); armed: combat (156), villager-combat
(70), monster (29), expedition (17). Sickness 4 vs 5, starvation 1 vs 1
(the food economy holds on this stack). No new death mode introduced.

Wall numbers on the pre-seat stack (this arm's measurement): national
5/8, table invites 6/8, wins 0/8, wave-4 6/8, wave-5 1/8, median
~120–123.5d, exiled 0. (For the tracker: this fresh seed set is harder
than w5reach3's — belong control unlocked 0/8 there, 1/8 here; the
pre-seat substrate reaches national and occasionally wave-5 in sims, but
wins stay 0/8 — the seat driver is the win-side difference; unchanged.)

## Village assessment

Sixteen belong-road villages on the pre-seat stack. Two never saw wave
3 (s292, s625 — dead by d44/d36, before the Mirror Draft was a rumor).
Six reached the Mirror Draft; one of them (s181 control) stood before
enough champions to greenlight the fifth draft on its own verbs; one
(s403 armed) greenlit d127 the same way. The arm's hunts were a whisper
in those arcs — 17 live days across 8 villages, a single engagement.

The s736 armed village is the parable of the stranded hunt: wave 4
opens d88, the System names the price — "look the Mirror Draft in the
eye. The producers are WAITING" — and the scholar walks out 5 times,
faces the Nielsen once, holds 8 wave-4 fights to the honest 35% line,
and the village still bleeds out d134 with the fifth draft ungated.
The mechanism is not wrong; it is rationed to homeopathic doses by a
heuristic that treats a pending invitation as a sitting table.

On the belong road the villages die the way they die out here: combat,
combat, combat — villagers falling to the Mirror Draft's champions,
funerals stacking up in the wave-4 window. The scholar's absence is not
the story here (median +3.5d); the story is that 9 hunts in 8 villages
is not a pursuit, it's a hobby. The road gate did its one job — lead
was never in scope — but the gate it kept (the landed tableBusy) is the
thing that starved it.

## Sense-testing

Read end to end: (1) s736 armed d87–134 (the engagement arc: 5 hunts,
1 engagement, the Nielsen named d122); (2) s403 armed d80–144 (the
armed-only unlock arc).

- The beats are alive. Villagers are people here: Yuki "has been asking
  about the strange leaves all week" and gets an answer; Silas checks a
  full pantry and turns harvest into wood/water/stone runs ("the pantry
  can't take more"); funerals narrate ("The village stops. Somebody
  screams. Somebody else starts digging."); the System's voice carries
  the wave fiction ("We've been watching you for a LONG time... Say
  hello to the MIRROR DRAFT"). The scholar's hunts read as the named
  order executed — "look the Mirror Draft in the eye" — not as farming.
- The single engagement (the Nielsen, d122) reads as the System's own
  dramaturgy: "The producers name it: the Nielsen. Ratings embodied. It
  fights boring — and the crowd adores it for that." The scholar stands
  before it, faces it blow-by-blow, and the village buries people anyway.
  Meaning and coherence pass; the failure is throughput, not sense.
- Judgment: the lever is sensible where it fires. It fires ~once per
  village per lifetime. A scholar working a problem the System named,
  every third day, for a few days — that is not a pursuit. The w5reach2
  "d91 hold → engagement → d97 greenlight" arc remains the quality bar
  this arm could not reach at 1 engagement.

## Blanks (filled / documented)

- **FILLED:** scripts/test-belongreach-20261016.js (RED→GREEN proof,
  34/34 GREEN on the new base: G2 road gate RED→GREEN, det-gate
  byte-identity both roads + lead-armed road-gate byte-identity,
  belong hunt firing on a fabricated mid-game state, 35% eject
  preserved; now INFO-SKIPs since the layer is killed).
- **FILLED:** scripts/sweep-belongreach-20261016.js (the 16-run sweep:
  daily unlockedWave() sampling, gate-liveness tracking, beat captures,
  per-seed JSONs with the exact numeric keys national, table, wins,
  exiled, wave5, wave5Day).
- **FILLED:** the 16-run pre-seat road-gate census —
  evidence/2026-10-16/perseed-belongreach/*.json (16/16 present, 0
  schema-bad) + belongreach-beats/ (16/16 beat captures) +
  belongreach-sweep.log.
- **KILLED:** scripts/policies/belongreach.js DELETED per kill protocol
  (PRIMARY NO-GO + EXERCISE NO-CONTACT). No trace left — evidence and
  instruments kept, proof INFO-SKIPs.
- **DOCUMENTED:** the stranding interaction — the landed tableBusy
  heuristic strands the hunt for ~13x the live days (17 live days vs
  w5reach3's 397 recovered days under the refined gate), so a road-aware
  layer on the landed heuristic is starved by construction. The belong
  gain needs the engine-honest gate AND the road gate together — a new
  arm with its own pre-registration, not a revival of this one.
- **DOCUMENTED:** the s403 near-tie — an armed-only wave-5 unlock with
  hunts=1, engagements=0 is the base's own verbs, not a lever effect.
  Claim nothing from one-sided pairs without the mechanism firing.
- **DOCUMENTED (pre-existing, not mine):** check.js --quick at this
  commit is 96/98 — the 2 failures are test-where-are-we
  ("stranger conversation offers 'where'", "stranger says a flavour line
  from the data"), unrelated to this arm (the layer was never in its
  import graph; zero src/js changes this run).
