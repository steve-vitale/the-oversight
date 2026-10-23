# sim-overtime-yield-b — overtime-tier-aware yield band, POLICY pilot (axis scale-onramp)

Run fleshout-20261023T0315Z, worker sim-overtime-yield-b. Worktree sim-overtime-yield-b.
Claims convergence-backlog #828 (OVERTIME INFLATION IS THE VETERANS BAR'S HEADWIND).
Metric-review #829 (damage-majority as the binding primary) ADOPTED — this run's
pre-registered judge.

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The Mirror
Draft; bands damage 35-95, HP 850-1500; the overtime RERUN mechanic is a monster
DEF inflation — +25% HP/+12% dmg per tier — documented in sim-splitclose's
in-flight finding, NOT a wave-definition change). No canon doc covers
equipment — stated, not invented (same as the sibling arms).

## The question

The named next of sim-splitclose (KILLED-AT-PILOT on the control-relative
kill-total leg, direction preserved on damage-majority 5v2): the splitclose
discipline's probe-anchored yield band (134 feasted / 37 sober, measured on
UN-INFLATED fights) cannot bridge 4000->134 HP before the scholar dies —
119/199 wave-4 TB fights (59.8%) on the long pre-seat substrate happened at
overtime tier>=1; 63 (31.7%) at tiers 5-6 (HP x3.05-x3.81). The companions'
per-(fight,round) damage (p75=134 feasted / 37 sober) is tier-independent in
absolute terms — what overtime breaks is the BRIDGE, not the band. So: make
the discipline OVERTIME-TIER-AWARE. At tier>=3 (HP x1.25^3 ~= x1.95 and up)
the scholar fights to kill NORMALLY — no soften/hold, the close can't come,
don't waste scholar HP (sim-splitclose s65611-lead: 22 softens, 0 holds,
scholar died). At tier<3 the splitclose soften/hold discipline runs as-is.

## Design (scripts/policies/tierband.js, TIERBAND=1, zero src/js)

Composes OUTSIDE the splitclose discipline (scripts/policies/splitclose.js,
already on master, UNMODIFIED — new file only):
- control = SC.armedFor(base) — SPLITCLOSE=1 (the discipline WITHOUT
  tier-awareness). Staging, arms, and feasts identical to the armed side.
- armed = withTierband(SC.armedFor(b), AD.armedFor(b)) — SPLITCLOSE=1 +
  TIERBAND=1.
At each wave-4 TB fight START the layer samples Game.overtimeTier() ONCE
(the same sampling point as scripts/measure-overtime-splitclose-20261022.js,
which samples at fight start via startCombat; the tier is per-day, constant
within a fight — never re-sampled mid-fight):
- tier >= TIER_CUTOFF=3: the discipline is BYPASSED — the discipline-free
  stack (AD.armedFor) runs, i.e. the scholar fights to kill normally.
- tier < 3: the splitclose soften/hold discipline as-is.
Titans excluded exactly as in splitclose (SC.liveWave4's titan exclusion,
#749). Non-wave-4 fights delegate. No engagement manufacturing. Namespace
`tierband` (tb*), disjoint from splitclose's sc*. Env gate TIERBAND=1,
default OFF; gate off = pure delegation, byte-identical to SPLITCLOSE-only
(the proof's E1 pins that).

DESIGN CALL (Steve 2026-10-07 — made, documented, overrulable): give up the
hold at tier>=3 rather than scaling the band per tier. The band was
probe-anchored on the companions' TRUE closing power (per-round p75 —
companions don't inflate with overtime); what tier breaks is the BRIDGE
(4000->134 costs the scholar too many hits). A per-tier band would aim the
scholar at an even more hopeless shave. The honest move is the judgment
call: this one is too big to soften — fight it straight.

## PRE-REGISTRATION (§14 binding — written BEFORE any pilot sims)

- Design: seeds 65611–65618 (the splitclose pilot seeds — direct
  comparability) x {leadfeast,belongfeast} x {control,armed} = 32 paired
  configs, 180d death-aware.
- Substrate env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=0 ARMORYDRIVE=1 KILLDISC=1 (SPLITCLOSE=1 both arms;
  TIERBAND=1 armed only).
- control = TB.controlFor(base) = SC.armedFor(base); armed = TB.armedFor(base).
- PRIMARY (binding, #829 metric-review): damage-majority villager wave-4
  kills — kill-time villager kills (waveKillLog w=4, by != bearerAtKill,
  by != 'player') with non-scholar share >= 0.5 of the kill fight's damage.
  GO = armed total >= control+2 AND >=2/8 armed seeds with >=1
  damage-majority kill (a seed counts if EITHER policy config reaches it).
- MECHANISM (reported): tier>=3 fights armed: scholar-kill share vs
  control; tier<3 fights: softens/holds counters vs the splitclose
  baseline; FEASTED-window attribution of closes.
- GUARDRAILS (all binding):
  - scholar-combat-mortality/100d paired mean diff <= control+2;
  - median survival (matched, non-winning) >= control-10d;
  - starvation deaths <= control+2;
  - no new death mode (>=2-event rule);
  - laundered kills (scholar >80% of a villager-credited kill's fight
    damage) <= control+2;
  - wave-4 unlocks not reduced.
- GO = primary met + guardrails pass. A miss is NO-GO, never re-scored.
- Instruments: KILLDISC=1 v2 + w5census + sc counters + tb counters +
  kill-time bearer census + w4FightDmg + FEASTED-window + read-only
  overtime-tier sampler (fightId->tier at fight start, both arms).
  Before/after through the balanced panel (scripts/balance-panel.js) per
  §15 — the panel is the instrument, this header is the judge.

## Proof gates (run BEFORE the pilot — scripts/test-tierband-20261023.js)

E0 shape; E1 det-gate (TIERBAND unset => byte-identical to SPLITCLOSE-only,
SPLITCLOSE=1, 60d x2 bases); E2 env-gate; E3 synthetic RED->GREEN fixtures
(tier-3+ fight => no hold/scholar finishes via the discipline-free stack;
tier-0/2 fight => discipline active; tier sampled ONCE at fight start =
the measure-overtime sampling point, never re-sampled mid-fight;
non-w4 delegate; titan excluded; gate-off pure delegation; the SAME
in-band tier-3 fight under the discipline ALONE holds (RED) vs under
tierband fights to kill (GREEN)); E4 armed+KILLDISC deterministic; D2 180d
armed completes per policy + deterministic re-run.

VERIFIED GREEN 2026-10-23 (run fleshout-20261023T0315Z): the proof was run
EXACTLY per the Usage header env (full substrate env; the env-trap lesson).
38 PASS, 0 FAIL.

NOTE (telemetry-only): after the proof run, one cosmetic edit to
scripts/policies/tierband.js restructured the per-turn delegate-counter
branches (tbLowTierDelegates vs tbNonW4Delegates accounting). No routing
change; no proof assertion touches those branches; the E1/E3/E4 gates
stand as measured. The pilot sweep runs the committed version.

## Pilot sweep

Launched 2026-10-23: ARM=control and ARM=tierband, 8 seeds
(65611–65618) x 2 bases = 32 paired configs, 180d death-aware,
KILLDISC=1 v2 + w5census + sc+tb counters + kill-time bearer census +
w4FightDmg (+fight outcome + tier) + FEASTED-window + overtime-tier
fight-start sampler. Two shards (one per arm). Per-seed JSONs →
evidence/2026-10-23/perseed-tierband/.

## Pilot results (32/32 configs, identical seeds)

Binding verdict per pre-registered primary: **NO-GO**.

- Armed seeds with >=1 damage-majority kill: **3/8** [65612,65615,65616]
  (leg 1: >=2/8 — MET).
- Control seeds with >=1: **3/8** [65612,65615,65616].
- Armed damage-majority total: **5 vs control 5** (leg 2: >= control+2 = 7
  — MISSED).
- A miss is NO-GO, never re-scored mid-run (§14).

Per-seed damage-majority kills (armed vs control — identical on every seed):

| seed | armed (lead / belong) | control (lead / belong) |
|------|----------------------|------------------------|
| 65611 | 0 / 0 | 0 / 0 |
| 65612 | 0 / 3 | 0 / 3 |
| 65613 | 0 / 0 | 0 / 0 |
| 65614 | 0 / 0 | 0 / 0 |
| 65615 | 0 / 1 | 0 / 1 |
| 65616 | 0 / 1 | 0 / 1 |
| 65617 | 0 / 0 | 0 / 0 |
| 65618 | 0 / 0 | 0 / 0 |

- SECONDARY (reported): kill-time villager wave-4 kills armed=8 control=8;
  TRICKTAG (via=companion) armed=8 control=8.
- Laundered kills: armed=0 control=0 (bar <= 2) PASS.
- FEASTED-window attribution of damage-majority closes: armed
  {feasted:3, sober:2} vs control {feasted:3, sober:2} — identical.

MECHANISM (reported) — the mechanism FIRED, the effect is NULL:

- Armed tierband counters: tbW4Fights=111, tbHighTierFights=39,
  tbLowTierFights=72, tbHighTierBypasses=106 (turns), tbFightErrors=0.
  The layer routed 39/39 tier>=3 wave-4 fights to the bypass and kept the
  discipline on all 72 tier<3 fights.
- tier<3 fights: scSoftens armed=321 vs control=387; scHolds armed=59 vs
  control=59 (identical holds — the discipline's low-tier behavior is
  untouched); scStallFinishes 0 both.
- Control's discipline at tier>=3 never held either (59 holds both arms —
  the holds all happened at tier<3; at tier>=3 the targets never reach
  the band). The 66 extra control softens (387-321) are the wasted
  scholar strikes on inflated targets the bypass skips.
- tier>=3 wave-4 kills: armed scholar=0 villager=0 | control scholar=0
  villager=0. **The tier>=3 wave-4 kill-free zone: 39 fights, 0 kills on
  EITHER arm** (join verified: 22 kill rows corpus-wide, 0 ambiguous
  day+mid joins, 0 kills with min-tier>=3).
- tier<3 wave-4 kills: armed scholar=3 villager=8 | control scholar=3
  villager=8 — identical.
- Overtime tier histogram (fight-start sampler, both arms identical —
  deterministic): 0:47, 1:17, 2:8, 4:7, 5:9, 6:23. 39/111 (35.1%) of
  wave-4 fights at tier>=3.

The arm's theory of change is falsified at the mechanism level: the
scholar fighting to kill normally at tier>=3 kills NOTHING (0 scholar
kills in 39 fights) — the fights are unwinnable by either route, and the
scholar dies in them either way (scholar-combat-mortality diff +0.00).
The "holding kills the scholar" causal story from sim-splitclose's
in-flight finding is not lever-actionable: bypassing the holds saved no
scholar lives and won no fights.

GUARDRAILS (all binding — all PASS):

- scholar-combat-mortality/100d paired mean diff: +0.00 (bar <= +2) PASS
- median survival diff (matched, non-winning, n=16): 0 (bar >= -10) PASS
- starvation deaths: armed=9 control=9 (bar <= 11) PASS
- new death modes (>=2 armed, 0 control): none PASS
- wave-4 unlocks: armed=14/16 control=14/16 (not reduced) PASS

§15 BALANCED PANEL (scripts/balance-panel.js — instrument, this header is
the judge): compare control->tierband decision=**review_required**, zero
material deltas on every metric on both policies (all
no_material_signal/descriptive). No GO signal on the panel either; the
pre-reg verdict stands regardless. Panel artifacts:
evidence/2026-10-23/tierband-panel-primary.{json,md,json.gz}.

## Wall numbers

(16 configs per arm, 180d death-aware — identical on both arms)

| arm | national | table | won | wave4 | wave5 | exiled | w5vets2max | medSurv | maxSurv |
|-----|----------|-------|-----|-------|-------|--------|------------|---------|---------|
| control | 5 | 11 | 0 | 14/16 | 2/16 | 0 | 2/16 | 138 | 181 |
| tierband | 5 | 11 | 0 | 14/16 | 2/16 | 0 | 2/16 | 138 | 181 |

Zero wins on both arms — the scale wall stands. The tierband layer is
outcome-neutral at the village level: national 5/16, table 11/16, wave-4
14/16, wave-5 2/16, median survival 138d on both arms.

Death-cause shares (armed): combat 470 (67.6%), villager combat 110
(15.8%), expedition 27 (3.9%), monster 24 (3.5%), sickness 18 (2.6%),
a wound that wouldn't close 10 (1.4%), starvation 9 (1.3%), contest 8
(1.2%).

## Village assessment (plain words)

Across the 32 runs the villages are the armorydrive-substrate villages we
know: feasts staged, companions armed, wave-4 TB fights with staged
companions. At tier<3 the scholar's discipline is visible — "You hold
still, watching." — while Ava, Elif, Mia and Sandugash close with FEASTED
blows. At tier>=3 the scholar fights straight at RERUN ×5-×6 monsters
(3000-5000 HP) and goes down: on s65611-lead the mantle passed Lena ->
Caleb -> Boris -> Jimena across two days of tier-5 reunion fights. The
villages that reached the table and waited accrued overtime and fought
their wave-4 kills exclusively in the pre-overtime window — every one of
the 22 wave-4 kills across the corpus happened at tier<3. Nobody won;
combat deaths dominate (67.6% + 15.8% villager combat). The layer changed
nothing about how villages live or die — it only removed 66 wasted
soften strikes per 16 configs.

## Sense test (SENSE-TESTING LAW)

VERDICT: PASS with a micro-blank — the two modes read as different
judgment calls, not mode-flipping.

- Tier-0 hold/close (s65612-belongfeast d141, the Strike, Ava kill —
  scripts/sense-tierband-20261023.js): the scholar holds ("You hold still,
  watching.") while Ava and Elif trade FEASTED ×2.03 blows; Ava closes
  for 79, "The Strike falls." Reads as trust — the scholar letting the
  companions close. (Deterministic reproduction of the splitclose sense
  corpus — same config, same beats.)
- Tier-5 bypass (s65611-leadfeast d153, RERUN ×5 The Reunion, outcome
  lost — scripts/sense3-tierband-20261023.js): no holds anywhere. Boris
  strikes for 16; the reunion's "Your Move" hits for 50-70 through armor;
  "You go down." The Codex turns its own page; the mantle passes. The
  tier is VOICED in the monster name ("RERUN ×5") — the fiction already
  marks these fights as different. The scholar fighting straight and
  dying reads as the only call available, not a mode flip.
- The bypass adds no narration of its own: there is no beat marking "the
  scholar chose not to soften this one." MICRO-BLANK (voice): a future
  pass could voice the judgment call at the first bypassed turn — same
  class as sim-splitclose's finishing-beat blank. Not a failure.

## Metric review (§14)

1. The binding primary (damage-majority, #829's metric-review proposal)
   behaved EXACTLY as designed: it measured the mechanism (companion
   credit) and was drift-stable — the splitclose pilot's armed-arm number
   (5) reproduced to the kill on identical seeds as this run's control-arm
   number (5). The metric is vindicated; the LEVER is what failed. This
   is a substantive null, not a metric-design miss: the mechanism fired
   fully (39/39 high-tier fights bypassed) and moved nothing, because the
   tier>=3 fights are unwinnable by any scholar-side strategy (0 kills
   either arm). No friendlier honest metric would pass — any kill-based
   metric is 0v0 at tier>=3; the only measurable delta is 66 fewer wasted
   softens, which moved no outcome (mortality +0.00).
2. Consequence for the axis: the veterans kill channel's addressable
   window is tiers 0-2 (the pre-overtime window). All 22 wave-4 kills in
   this corpus happened at tier<3. Any future kill-channel arm must target
   the pre-overtime window (earlier kills, faster closes) — NOT the
   high-tier fights. The high-tier fights are a kill-free zone; the
   design question they pose is survival/escape, not kills.
3. Guardrail set held; no metric misfired. The >=2-event new-death-mode
   rule did not fire spuriously at n=16/arm.

## Blanks filled / documented

- FILLED (measured): the tier>=3 wave-4 kill-free zone — 39 fights, 0
  kills on either arm (join-verified, 0 ambiguous). The kill channel's
  addressable window is tiers 0-2. Named next for the axis: a
  pre-overtime-window arm (earlier kills / faster closes), not a
  high-tier-fight arm.
- FILLED (measured): the splitclose damage-majority effect REPLICATED —
  control (SPLITCLOSE=1) scored 5 damage-majority kills on identical
  seeds, exactly the splitclose pilot's armed-arm number. The
  discipline's effect is substrate-stable under #829's metric; the
  tierband layer added nothing on top.
- DOCUMENTED (falsified): the "holding kills the scholar at high tier"
  causal story — bypassing holds at tier>=3 saved zero scholar lives
  (mortality diff +0.00) and won zero fights. Scholars die in tier>=3
  fights either way; the lever is not actionable on mortality.
- BLANK (small, voice): no narration marks the scholar's bypass judgment
  call at tier>=3 ("this one's too big to soften") — same class as
  sim-splitclose's finishing-beat blank.

## Convergence

**killed-at-pilot** — the binding primary missed (armed 5 vs control 5,
bar 7; the 3/8 seed leg met). The mechanism fired perfectly (39/39
high-tier fights bypassed, 106 bypass turns, discipline intact at
tier<3), but the effect is a substantive null: the tier>=3 fights are
unwinnable by any scholar-side strategy, so the lever cannot move kills.
Per the arm brief ("NO-GO -> kill with teeth"), scripts/policies/tierband.js
is DELETED zero-trace (the kill). Instruments stay as the evidence trail:
scripts/test-tierband-20261023.js (38/38 GREEN pre-kill — now historical,
requires the deleted module), scripts/sweep-tierband-20261023.js,
scripts/analyze-tierband-20261023.js,
scripts/build-tierband-panels-20261023.js,
scripts/sense-tierband-20261023.js, scripts/sense3-tierband-20261023.js,
the per-seed corpus (evidence/2026-10-23/perseed-tierband/), and the
panel artifacts. Zero src/js changes throughout. #828's claim is closed
by this kill (verdict appended to sim-findings.md).

## Pre-registration header retained

(the binding pre-registration above was written before any pilot sims)
