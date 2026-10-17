# sim-yieldwin — deepening the vetrel yield window (finding: the yield fired thin)

**Run**: flesh-out loop, 2026-10-17, run fleshout-20261017-044712, axis SCALE-ONRAMP (blocking).
**Question**: vetrel made the companion-veteran channel reliable (18–0
companion w3 kills, 40 runs/side) but its yield protocol fired thin (17/40)
— the ≤20%-HP window is structurally narrow because scholar strikes
(40–100) overshoot it. Can a deepened yield window (companion-first
engagement, ≤40% scholar yield, soften-but-don't-finish anti-steal) land
wave-3 killing blows for companions more reliably?
**Layer**: scripts/policies/yieldwin.js (YIELDWIN=1, default OFF) — NEW
file, zero src/js, zero changes to existing policies. Composes ON TOP of
vetrel (VETREL=1 required): withYieldWin wraps vetrelLead/vetrelBelong
(the feastscale composition pattern). When YIELDWIN=1 the wrapper owns
ALL yield decisions for the fight; vetrel's own ≤20% check is subsumed
(the wrapper exhausts vetrel's yield counter via the shared ctx
convention when it closes the window — bound stays 8 turns/fight).
Companion-survival is NOT duplicated: hurt-companion turns delegate to
vetrel's breakoff/rescue.
**Proof**: scripts/test-yieldwin-20261017.js — 17/17 GREEN (RED→GREEN;
13 fabricated-harness unit + 4 real-harness det-gate; gate-off
byte-identical to vetrel policies on the real harness, gate-on
deterministic, gate-ON non-vacuous on real fights). Final run captured in
evidence/2026-10-17/test-yieldwin-final.log.

## PRE-REGISTRATION (written before the pilot; binds per MEASUREMENT.md §14)

- **Primary metric (binding)**: companion wave-3 kills (waveKillLog entries
  with w>=3 AND via='companion' — the tricktag channel, finding #405):
  **armed ≥ 1.5× paired control AND armed ≥ 6** across the 32-run pilot.
  (vetrel baseline ≈0.45/run; the yield must move the needle, not just exist.)
- **GO**: both bars → arm confirmed, lands.
- **KILL**: miss either bar → delete scripts/policies/yieldwin.js
  zero-trace per kill protocol; keep instruments + evidence.
- **Guardrails**: no new death mode (n≥3); median survival ≥ control−10d
  (per policy pair); scholar deaths ≤ control; national ≥ control−2.
- **Secondary (report-only)**: vet=2-peak rate, wave-4 unlocks, yield
  telemetry (ywFirstBlood, ywYields, ywKillRangeHolds, ywStealRefusals).
- **Horizon**: 180d death-aware (dead villages stop; +10d tail max via
  runDays — the scale wall needs the full clock: wave 3 fires ~d25–75,
  Standing crosses 100 ~d60–120).
- **Seeds**: 8 fresh (1251–1258; verified 0 filename/content hits across
  evidence/ before use).
- **Policies**: control = vetrel-lead/vetrel-belong (VETREL=1);
  armed = yieldwin-lead/yieldwin-belong (VETREL=1, YIELDWIN=1).
- **Substrate**: pre-seat courtship — SEATDRIVE=0 EXPLICIT,
  FEASTSCALE_R13=1 (per the 0215Z method note: unset != active).
- **Own paired control** on identical seeds (in-sweep).

## The lever

Three pushes, all policy-side, all engine-honest (full design in
scripts/policies/yieldwin.js header):

(a) **Companion-first engagement** — on the first player turn of a
    committed vet fight (round 1, fresh per-fight state), the scholar
    HOLDS (the real tbPlayerWait) instead of striking: the companions'
    turns land first and the companion engages the target before the
    scholar draws its focus. One turn, guarded (scholar hpPct≥0.5).
(b) **Earlier scholar yield** — the yield threshold moves from vetrel's
    ≤20% to ≤40% of the weakest live wave-3 monster's maxHp. Same bounds
    as vetrel (6 hold-turns/fight, 2-consecutive-no-damage stall cap,
    scholar hpPct≥0.5, round≥2), same guard (veteran scholar only — a
    non-veteran still needs their own kill; vetrel's 12% commit floor
    stands).
(c) **Softens-but-doesn't-finish** — the companion's expected kill range
    = 2.0 × Σ E[strike] over engaged companions, where E = 6 +
    round(wbonus/2) is the engine's own NPC strike mean (game.js
    tbVillagerAct: dmg=roll([4+wb, 8+wb])). The yield window is
    tgt.hp ≤ max(0.40×maxHp, killRange) — the floor makes the window
    adaptive to companion strength. Anti-steal on resume: when the 6-turn
    window is spent and the monster sits within killRange with companions
    engaged, the scholar refuses the killing blow for up to 2 more
    hold-turns (the companion's next turns are the expected closers).
    Bounded; then the scholar finishes honestly.

## Results

### Pilot (8 seeds 1251–1258, 16 runs/side, 180d death-aware)

| policy | n | companion w3 kills | w4 unlocks | vet=2 peak | scholar deaths | median survival | ywYields | ywFirstBlood |
|---|---|---|---|---|---|---|---|---|
| vetrel-lead (control) | 8 | 6 | 0 | 1 | 23 | 180d | — | — |
| vetrel-belong (control) | 8 | 0 | 0 | 0 | 22 | 180d | — | — |
| yieldwin-lead (armed) | 8 | 3 | 0 | 0 | 18 | 180d | 0 | 8 |
| yieldwin-belong (armed) | 8 | 3 | 0 | 0 | 17 | 180d | 0 | 8 |
| **control total** | **16** | **6** | 0 | 1 | 45 | 180d | — | — |
| **armed total** | **16** | **6** | 0 | 0 | 35 | 180d | **0** | 16 |

**PRIMARY: NO-GO — armed 6 vs control 6 (ratio 1.0×; bars were ≥1.5× AND
armed ≥6).** Both bars missed. Per MEASUREMENT.md §14 the pre-registered
metric binds: the arm is KILLED. scripts/policies/yieldwin.js deleted
zero-trace per kill protocol; instruments (this file, the proof test, the
sweep, the sense scripts) kept.

**Guardrails ALL PASS** (irrelevant to the verdict, recorded honestly):
scholar deaths 35 ≤ 45 (FEWER — the holds don't buy kills with lives);
median survival 180 ≥ 170; national 0 ≥ −2; no new death mode
("unknown" village-lost both sides — the standard wall cause).

### What actually happened (honest decomposition)

The deepened yield NEVER FIRED: ywYields = 0 across all 16 armed runs
(ywKillRangeHolds = 0, ywStealRefusals = 0). Vetrel's own ≤20% yield fired
1× on control across 16 runs. The companion-first engagement (a) fired
16× and reads beautifully in the fiction — but it does not convert to
kills by itself: armed 6 = control 6, and the armed kills came through
vetrel's existing (a)+(c)+(d) machinery (ranked companions, deliberate
hunts, survival breakoffs), not the yield.

Why the window never opens — three stacked starvers:
1. **Few committed fights**: 0–4 vetHuntFights per 180d run (33 total
   across 32 runs). The yield needs a committed vet fight; the substrate
   barely produces them.
2. **The scholar-veteran gate**: the yield fires only for a veteran
   scholar — but on the runs where companions blood first (exactly the
   runs the yield is for), the scholar has no w3 kill yet. Armed s1253
   (belong, 2 companion kills, scholar 0 kills): the yield was
   structurally ineligible on the run that needed it most.
3. **The window itself rarely materializes**: scholar strikes overshoot
   from above 40% (the vetrel finding, unchanged), or companions close
   organically before any window opens. Widening 20%→40% widened a window
   that never had anything in it.

The 40%-window hypothesis is dead, not the implementation: the proof
test (17/17 GREEN, RED→GREEN, det-gate byte-identical, gate-on
deterministic and non-vacuous on real fights) shows the layer does
exactly what it says. It says something the substrate never asks for.

Road-dependence note: vetrel-belong scored 0/8 on these seeds while
vetrel-lead scored 6/8 — the lead/belong asymmetry from sim-vetrel
replicates (lead is the stronger road). Armed belong matched armed lead
(3/8 each): the (a) hold fires on both roads, but neither converts.

## Village assessment

The villages look like vetrel's villages — because they are: the layer
changed nothing measurable about how villages live or die. Median
survival 180d both sides; deaths are the standard wall ("unknown"
village-lost); scholar deaths actually fell (35 vs 45), consistent with
the hold turns keeping the scholar out of the monster's focus for a
turn here and there — a consolation effect, not a mechanism.

Who got the kills: companions, all of them, on both sides — Sanne
(s1253 lead, the Big Ugly/chorus_line), and five others across the
armed/control runs. Who died: the wall took villages at d9/d45 on
s1251/s1252 identically on both arms (seed-driven, not arm-driven).

The blank this run fills is a negative result with a sharp edge: **the
yield is not the lever — fight volume is.** The companion-veteran
channel's binding constraint is the number of committed wave-3 fights
(0–4/run), not the finesse of the finish. Any future work on this
channel should buy more fights (more hunts, more engagements), not
better yields. The scholar-veteran gate on the yield is also
self-defeating and should not be inherited by any successor design.

## Sense-reads (SENSE-TESTING LAW)

**yieldwin-lead s1253, d96** — the Big Ugly (chorus_line, wave 3).
Round 1: "You hold still, watching." — the companion-first hold, firing
exactly as designed. Then the scholar spends rounds 2–16 failing to
path ("No path there.") while Sanne (9–12/hit) and Dorothy (22–26/hit)
grind the monster down over 17 rounds — Sanne binds a wound mid-fight,
patches the scholar ("Hold still!"), and lands the killing blow round
17: "Sanne strikes the Big Ugly... The Big Ugly falls. Sanne whoops.
'That's how it's done!'" Then: "📺 Hannah, Dorothy, Sanne, Aki brought
down Big Ugly. Together. (The village watches the broadcast. Nobody
blinks.)" — people fighting together, a deliberate fight in the
fiction. The yield did NOT drive this kill (ywYields=0 on the run);
the (a) hold opened it and the ranked companions closed it. Full
transcript: evidence/2026-10-17/yieldwin-sense-yieldwin-lead-s1253.txt.

**yieldwin-belong s1253, d76** — the Redactor (wave 3). Round 1: "You
hold still, watching." — the companion-first hold again. Then a straight
4-round brawl: Hannah (the ranked companion) hits 43/48/44/45, the
scholar strikes for 30/20, Priya chips 16–20, Rosa harries for 3–5.
Round 4: "Hannah strikes the Redactor. Hannah hits redactor for 45. The
Redactor falls." / "📺 Hannah, Priya, Rosa brought down The Redactor.
Together. (The village watches the broadcast. Nobody blinks.)" The
scholar was not veteran here — no yield holds after round 1, just
honest strikes; Hannah's ranked-companion damage closed it. Full
transcript: evidence/2026-10-17/yieldwin-sense-yieldwin-belong-s1253.txt.

SENSE VERDICT: PASS on fiction (both fights read as people fighting
together — the round-1 "You hold still, watching." is the yieldwin
layer's visible signature, and it lands), FAIL on mechanism attribution
— no transcript contains a yield-driven kill because none occurred. The
sense reads confirm the numbers: the fiction is sound, the lever is not.

## Metric review (§14)

- **PRIMARY judged NO-GO (binding).** Armed 6 vs control 6, ratio 1.0× —
  both bars (≥1.5×, ≥6) missed. No re-scoring: the metric stood, the arm
  is killed, the layer deleted. The guardrails passing does not rescue
  a missed primary.
- **The metric was the right metric.** Companion w3 kills is the channel
  the arm claimed to deepen; the arm didn't deepen it. A softer metric
  (e.g. "yield firings") would have shown 0 anyway.
- **Seed bad luck is real but not exculpatory**: s1251/s1252 died at
  d9/d45 on both arms (4 runs each side produced nothing). The paired
  design absorbs it; the miss is 6-vs-6 on the surviving 24 runs, not a
  seed artifact.
- **Vetrel's 17/40 yield firings did not replicate** (1/16 control here):
  the yield was already thin, and these seeds show it can go to zero.
  Any successor should treat the yield as unproven, not as a foundation.
- **For the next run**: the pre-registration to beat is fight volume, not
  finish finesse. If a successor arm targets the channel, pre-register on
  committed vet fights per run (the actual starver) with kills as the
  binding primary.
