# sim-restraint-b — the new-scholar restraint window (BUILD arm)

Run: fleshout-20261023T0120Z (adoption) · arm sim-restraint-b · axis scale-onramp · worker sim-restraint-b tree
Date: 2026-10-23 · BUILD arm: policy-side layer, zero src/js. Convergence backlog #825 (claimed).
Builds on: evidence/2026-10-22/sim-mantlechain.md (DIAG — named this window, did not build it).

## The finding being built on

sim-mantlechain DIAG: the mantle-promotion chain is a veteran-death
accelerant. 8/8 in-scope veteran wave-4 deaths were AS THE MANTLE-HOLDER
(0 as plain fighters) — the CHAIR is the accelerant, not the 30d freshness
window. Fresh-scholar per-fight hazard 2.11x (70.2% of wave-4 fights they
join). Succession cascades are real (4 scholars dead in one day,
s65477/leadfeast). 104/116 wave-4 fights happened while the scholar was
fresh (<=30d in chair) — the chair is nearly always fresh because
successions are constant (~10 per 180d config).

## PRE-REGISTRATION (§14 binding — written BEFORE the pilot sweep)

- **Design**: N=30 days after mantle acquisition, the fresh scholar does
  not SEEK wave-4 engagements — no patrols toward wave-4 targets, no
  wave-4 TB staging; the scholar does the control policy's normal
  non-wave-4 beats instead (village work, foraging, wave-3, feasts).
  Forced fights (haven assaults, ambushes) are fought normally —
  restraint is not suicide.
- **Mechanism** (scripts/policies/restraint.js, RESTRAINT=1, zero src/js):
  the control stack's deliberate danger-seeking is competent.js's
  feastFightRoad patrol (up to 3 sweeps/day toward far tiles while
  FEASTED). When the restraint holds, the layer sets ctx._restraintHold
  around base.upkeep/base.daily; feastFightRoad stands the patrol down.
  The feast's own draw is still faced; fighterStaging is NOT suppressed
  (design call #3 — suppressing it ~90% of the time would gut the AD
  substrate's veteran channel); the fight hook is untouched.
- **Seeds**: 8 FRESH seeds (65721, 65722, 65723, 65724, 65725, 65727,
  65728, 65729 — 65726 used by evidence/2026-10-21/perseed-surpluskeep2-b;
  65701/65703/65705/65708/65709 used by 2026-10-20 evidence; verified
  unused by filename + value grep) x {leadfeast, belongfeast} x {control,
  armed} = 32 paired configs, 180d death-aware (dead villages stop).
- **Substrate env**: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 (exactly the mantlechain DIAG
  substrate; KILLDISC=1 pins the env, the KD instrument is not installed).
- **control** = AD.armedFor(base); **armed** = restraint layer composed
  outside it (RESTRAINT=1).
- **PRIMARY (binding)**: chain-accelerated veteran wave-4 deaths —
  in-scope = person with >=1 wave-4+ waveKillLog kill by death day who
  died in a wave-4 fight (fightWave>=4, combat-cause-gated linkage as in
  the DIAG); chain-accelerated = died as mantle-holder at ANY succession
  age (revised per the DIAG's metric review — the chair, not the window).
  GO: armed <= control-2, both policies pooled.
- **ENGAGEMENT (mechanism check, reported)**: fresh-scholar (<=30d in
  chair) wave-4 fight participations armed vs control; the restraint must
  actually reduce exposure.
- **GUARDRAILS (all binding)**: villager wave-4 kills armed >=
  control-2; wave-4 unlocks not reduced; median survival armed >=
  control-10d; starvation deaths <= control+2; no new death mode
  (>=2-event rule); scholar-combat-mortality/100d paired diff <=
  control+2.
- **GO** = primary met + guardrails pass. A miss is NO-GO, never re-scored
  mid-run.
- **Wall numbers reported**: national / table / wins, wave 4-5 unlocks,
  median/max survival, death-cause shares.

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. **N=30**: the DIAG's freshness window — right shape for the restraint
   (veterans-at-succession died <=16d 3/3; fresh per-fight hazard 2.11x),
   even though it was the wrong cut for attribution.
2. **Initial scholar acquires at setup (day 0)**. Harmless: wave-4 is
   standing-gated and never unlocks in the first month.
3. **fighterStaging NOT suppressed** (see above — guardrail protection).
4. **Feast draw still faced** (the feast's own beat at the haven's edge,
   not a patrol).
5. **Fight/pending hooks pure delegation** — the phone offers no honest
   flee for a pending encounter; clearing it silently would be fake.
6. **[needs-eyes]**: this changes feel (the scholar's danger-seeking) —
   flagged per the DIAG's named-next note.

## Convergence state

**KILLED-AT-PILOT** (substrate-missing — the patrol channel doesn't carry
wave-4 fights). scale-onramp stays converging. Backlog #825 closed as
killed; the finding (haven-centric exposure) is appended to
hidden_files/sim-findings.md.

## Results

Corpus: 32 configs (seeds 65721-65725,65727-65729 × {leadfeast,
belongfeast} × {control, restraint}), 180d death-aware, pinned substrate
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1 (+RESTRAINT=1 armed). Instrument errors: 0.
Per-seed JSONs: evidence/2026-10-23/perseed-restraint/. Analyzer:
scripts/restraint-analyze-20261023.js.

### Primary (binding): NO-GO

Chain-accelerated veteran wave-4 deaths (died as mantle-holder, ANY
succession age — the DIAG's revised definition):
- control: **7** chain / 0 baseline (in-scope 7)
- armed: **9** chain / 0 baseline (in-scope 9)
- Bar: armed <= control-2 → 9 <= 5 → **MISSED**.

The armed side had MORE chain deaths (9 vs 7), not fewer. The restraint
did not protect scholars; the delta is noise around a mechanism that
never engaged.

### Engagement (mechanism check): the channel is empty

- Fresh-scholar wave-4 fight participations: control 97, armed 94 (-3%,
  noise).
- Restraint mechanism counters (armed, 16 configs): **patrolSkips=3**,
  holdDays=6055, successions=137.
- Per-fight context (w4ctx, 32 configs): **93/93 wave-4 fights at the
  haven** (atHaven=True), 11 feasted / 82 not.

The restraint HELD (6055 hold-days — the scholar was fresh ~90% of the
time) but the patrol it suppresses essentially never fired (3 skips in
6055 hold-days). Wave-4 exposure is haven-centric — haven assaults and
feast draws at the haven's edge — not patrol-driven. The feastFightRoad
patrol (the control stack's danger-seeking beat) is not the wave-4
channel. Suppressing it cannot reduce exposure because there is no
patrol exposure to suppress.

### Guardrails: all PASS

- villager wave-4 kills: control=2 armed=3 (bar >= 0) — PASS
- wave-4 unlocks not reduced: 14/16 vs 14/16 — PASS
- median survival: 117d vs 117d (bar >= 107d) — PASS
- starvation deaths: 10 vs 9 (bar <= 12) — PASS
- no new death mode (>=2-event rule): none — PASS
- scholar-combat-mortality/100d: 7.86 vs 7.47 (diff -0.39, bar <= +2) — PASS

(The guardrails pass because the restraint changed nothing — a no-op
cannot break anything.)

### Wall numbers (per arm)

- control: national 4/16 table 1/16 won 0/16 wave4 14/16 wave5 1/16
  median 117d max 181d
- armed: national 5/16 table 1/16 won 0/16 wave4 14/16 wave5 1/16
  median 117d max 181d
- Death-cause shares dominated by combat (412/418), villager combat
  (110/112), expedition (33/33), monster (44/47); starvation 10/9.

The wave-5 door remains the binding wall (1/16 each arm).

## Sense test

Read a restrained successor's transcript beats (s65727/belongfeast,
10 successions, 372 hold-days, 3 patrol skips): the days read as normal
village life — foraging, watering, waiting, tribute, trauma-soothing.
The restraint is fictionally INVISIBLE: when the patrol skip fires (3
times in 372 hold-days), nothing is said — the scholar just doesn't
patrol. There is no "village holding someone back" beat, and no idling
either (the scholar does normal beats). If a restraint ever addresses a
real channel, it will need voicing — the village insisting the new
scholar stay home — or the fiction won't know it exists. (This is a
blank for a future arm, not a fix for this one — the channel is wrong.)

## Metric review

The pre-registered primary (armed <= control-2) was the RIGHT metric —
the miss is not metric-design. The mechanism (patrol suppression)
addressed a channel that carries no wave-4 fights. The DIAG's "named
next" assumed the fresh scholar SEEKS wave-4 engagements via patrols;
the pilot proves wave-4 engagements SEEK THE SCHOLAR (haven assaults).
A restraint that could work would need to address haven-defense
exposure — but the task's own design ("forced fights are fought
normally — restraint is not suicide") rules that out. The window is
unbuildable on this substrate as specified. Kill with teeth.

Proposed for the backlog: the haven-assault exposure itself is the
finding — 93/93 wave-4 fights at haven. If the scale wall is about
scholars dying in wave-4 fights, the lever isn't the scholar's
seeking, it's the haven's defensibility (or the assault frequency).
Appended to hidden_files/sim-findings.md.

## Proof

scripts/test-restraint-20261023.js — **28/28 GREEN** (run 2026-10-23,
before the pilot; Usage env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 ARMORYDRIVE=1):
- E0 shape (5/5): module loads, withRestraint/restraintOn/armedFor/
  controlFor exported, N_DAYS=30, competent.feastFightRoad exported.
- E1 env-gate (1/1): off when RESTRAINT unset.
- E2 synthetic RED→GREEN (13/13): E2a RED — control patrols toward
  danger (travelTo>0); E2b GREEN — fresh scholar: flag held, patrol
  skipped (travelTo=0), restraintPatrolSkips=1, flag cleared after;
  E2c old scholar (day 50): no flag, patrol fires; E2d succession resets
  the window (fresh at +5d → skip; expired at +35d → patrol); E2e
  gate-off: pure delegation, ctx untouched, mantleBecome not wrapped;
  E2f fight hook delegates (forced fights fought normally).
- E3 det-gate (3/3): RESTRAINT unset → RS.armedFor byte-identical to
  AD.armedFor (60d × leadfeast s65731 + belongfeast s65732, digests match).
- E4 armed deterministic (2/2): RESTRAINT=1, same seed twice → identical
  digests.
- Seeds 65731/65732/65733 used by the proof (documented here, not in the
  pilot band).

## Kill record (2026-10-23)

KILLED-AT-PILOT per the kill protocol: scripts/policies/restraint.js
deleted, competent.js guard reverted (zero-trace — no diff remains).
Retained as the instrument record: scripts/test-restraint-20261023.js,
scripts/sweep-restraint-20261023.js,
scripts/restraint-analyze-20261023.js (all header-noted MODULE_NOT_FOUND
if executed), evidence/2026-10-23/sim-restraint-b.md (this file),
evidence/2026-10-23/perseed-restraint/ (32 per-seed JSONs). Kill class:
substrate-missing (the patrol channel doesn't carry wave-4 fights).
