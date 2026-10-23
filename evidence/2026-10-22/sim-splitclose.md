# sim-splitclose — scholar-softens/companion-closes discipline on the STAGED channel, POLICY pilot (axis scale-onramp)

Run fleshout-20261022T2125Z, worker sim-splitclose. Worktree sim-splitclose.

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; bands damage 35-95, HP 850-1500; the readiness gate's
VETERANS bar = 2 living roster members with wave-4+ kills in
state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger
exactly like the player's; titan hard gate — no solo titan fights). No
canon doc covers equipment — stated, not invented (same as the sibling
arms).

## The question

The named next of sim-wave4engage-r2 (KILLED-AT-PILOT) and sim-compdamage
("measured bar to beat ~600+/fight companion damage on kill fights, or a
redesigned kill channel"): SPLIT THE KILL — the scholar softens the
wave-4 monster INTO the companion yield band, then holds while the
companions close.

## The two cautions this design routes around

1. sim-splitkill KILLED-AT-PILOT: its TB soften/hold discipline (proven
   correct, 29/29 gates) fired 0/59 wave-4 fights — engagedCompanions()
   was empty in every one; on its substrate the scholar fights wave-4 TB
   battles solo. A discipline with no channel is a dead lever. THIS
   layer composes OUTSIDE armorydrive's armedFor — the substrate where
   companions ARE staged into wave-4 TB fights.
2. sim-drivenofeast KILLED-AT-PILOT (finding #794): companion wave-4
   kills rode the FEASTED x2.53 multiplier — drive alone could not
   close. THIS layer uses the multiplier HONESTLY: the yield band is
   feasted-aware (see probe), the layer reads feastedActive() per turn,
   and kills are attributed by FEASTED-window in the evidence.

## Channel audit (measured, not assumed — this corrects the brief)

The brief said "the discipline belongs on the FIELD-fight channel where
the kills actually happen." Measured against the frozen corpora:

- armorydrive-confirm (64 configs, the substrate this pilot runs on):
  ALL 8 villager wave-4 kills were TB fights, via=companion (TRICKTAG:
  a staged companion landed the killing blow), with per-fight damage
  tables (dmgScholar/dmgCompanion from tbDamage — TB-only
  instrumentation). ZERO wave-4 kills from the patrol/wild field
  channel (0/64 configs).
- sim-splitkill pilot (32 configs, VGEAR/armorydrive UNSET): the one
  "non-TB" villager kill (s65506/leadfeast, Leonard, eater, d53) was a
  MISATTRIBUTED SCHOLAR KILL — via='player', dmgScholar=1059,
  dmgCompanion=0, and the killer vid (gen_m12p3y8) was the bearer
  (scholar) at kill time; the daily bearer census was stale. Zero
  genuine villager wave-4 kills on that substrate.
- Mechanically: Game.fieldFight is atomic — no scholar is present and
  no per-turn policy hook exists. A "scholar softens" discipline is
  inexpressible on the field channel.

DESIGN CALL (Steve 2026-10-07 — made, documented, overrulable): the
discipline goes on the TB channel where the kills actually happen —
wave-4 TB fights with staged companions — which is the armorydrive
substrate. The brief's "FIELD-fight channel" wording is corrected by
the numbers above; the intent (put the discipline where kills happen)
is honored.

## The yield band (honest definition, probe-anchored)

"Target HP at or below the maximum damage the engaged companions can
plausibly land as a finishing blow" = p75 of per-(fight,round)
companion damage vs wave-4 non-titan monsters, measured on the PILOT
substrate by scripts/probe-splitclose-damage-20261022.js (seeds
65601-65602 x {leadfeast,belongfeast}, ARMORYDRIVE=1, SEATDRIVE=0):

- channel: 21 wave-4 TB fights, 13 with companion damage (vs 0/59 on
  the splitkill substrate — the staging is the channel).
- companion per-(fight,round): FEASTED n=25 p50=76 p75=134 p90=162
  max=175; SOBER n=15 p50=26 p75=37 p90=42 max=49.
- companion max single hit: FEASTED p50=46 p90=114 max=134; SOBER
  p50=24 p90=26 max=30.
- scholar max single hit: n=37 p50=76 p90=407 max=412.

YIELD_BAND_FEASTED = 134; YIELD_BAND_SOBER = 37 (probe p75s).
SCHOLAR_EST_INIT = 412 (probe scholar max — the overshoot guard must
never underestimate the strike). HOLD_CAP = 10, STALL_TURNS = 2
(splitkill's proven bounds). The layer picks the band from
Game.feastedActive() each turn — the drivenofeast honesty rule.

The sibling sim-dmg-bands arm has published no numbers as of this
writing — the band is derived from this probe, not guessed.

## The discipline (scripts/policies/splitclose.js, SPLITCLOSE=1, zero src/js)

Composed OUTSIDE AD.armedFor (like feastdiscipline's FEASTDISC=1
layer): control = SC.controlFor(base) = AD.armedFor(base)
(ARMORYDRIVE=1, SPLITCLOSE unset); armed = SC.armedFor(base)
(SPLITCLOSE=1 outside the same stack). The discipline only acts inside
wave-4 TB fights with >=1 engaged party companion; everything else
delegates purely. Softens above band+est, shaves in the overshoot
window, holds in the band; bounded (scholar hp>=50%, round>=2,
<=10 holds/fight, stall<2 hands back the finish); hurt-companion
(<40%) rescue; titan exclusion (herald/nielsen/finale); no breakoff
(#790); no engagement manufacturing (staging is armorydrive's).

## PRE-REGISTRATION (§14 binding — written BEFORE any pilot sims)

- Design: 8 fresh seeds (65611–65618, filename-verified unused in
  evidence/ + scripts/) x {leadfeast,belongfeast} x {control,
  splitclose} = 32 paired configs, 180d death-aware (dead villages
  stop simulating; the harness breaks on Game.over), on the pre-seat
  armorydrive substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 ARMORYDRIVE=1 KILLDISC=1 (SPLITCLOSE=1 for
  the armed side only).
- control = SC.controlFor(base); splitclose = SC.armedFor(base).
- PRIMARY (binding): armed seeds with >=1 kill-time villager wave-4
  kill (waveKillLog w=4, by != bearerAtKill, by != 'player' —
  sim-killtime MANDATORY) >= control+2 AND >=2/8 armed. A seed
  counts if EITHER policy config reaches it.
- GO = primary met. A miss is NO-GO, never re-scored mid-run (§14).
- SECONDARY (reported, not binding — compdamage's metric-review
  proposal): damage-majority villager kills (non-scholar share >= 0.5
  of the kill fight's damage) armed vs control.
- GUARDRAILS (all binding):
  - scholar-combat-mortality/100d (paired, the confirm's
    formulation): mean of per-(seed,policy) paired differences of
    deathCauses.combat x 100/gameDays — armed <= control + 2;
  - median survival (matched per-seed, non-winning) >= control - 10d;
  - starvation deaths <= control + 2;
  - no new death mode (>=2-event rule);
  - no channel laundering: armed laundered kills (scholar dealt >80%
    of that kill's fight damage) <= control + 2;
  - wave-4 unlock count not reduced.
- Horizon: 180d death-aware — the veterans channel needs the long
  game (wave-4 unlocks ~d60-100, staging/arming takes weeks; the seat
  win would truncate the channel — SEATDRIVE=0 per finding #714).
- Bar rationale: on the armorydrive substrate, control produced 8
  villager wave-4 kills on 5/16 seeds (confirm). The discipline's
  mechanism is credit-shift (scholar->companion killing blows) plus
  any kills the extra companion rounds secure; the bar demands a real
  signal (>=2/8 seeds AND >=control+2), not pilot noise.
- Instruments: KILLDISC=1 v2 (per-source tbDamage attribution +
  engagement census + readiness census) + kill-time bearer census +
  splitclose layer counters (feasted/sober holds) + per-fight damage
  tables (w4FightDmg) + FEASTED-window attribution. Before/after
  through the balanced panel (scripts/balance-panel.js) per §15 —
  the panel is the instrument, this header is the judge.
- Metric review: every evidence file carries one (below).

## Proof gates (run BEFORE the pilot — scripts/test-splitclose-20261022.js)

E0 shape; E1 det-gate (SPLITCLOSE unset -> armedFor byte-identical to
AD.armedFor, 60d x2 bases); E2 env-gate; E3 synthetic RED->GREEN
fixtures on the discipline (soften above band, overshoot hold, band
hold, feasted-vs-sober band selection, stall finish, hurt-companion
resume, non-w4 delegate, titan excluded, companion-less delegate,
low-scholar-hp delegate, round-1 delegate, hold cap, gate-off pure
delegation); E4 armed+KILLDISC deterministic; D2 180d armed runs
complete per policy + deterministic re-run.

VERIFIED GREEN 2026-10-22 (run fleshout-20261022T2125Z): the proof was run
EXACTLY per the Usage header env (full substrate env; the env-trap
lesson). 35 PASS, 0 FAIL — E0 (shape, bands feasted=134/sober=37),
E2/E2b env-gate, E3a–E3m synthetic fixtures (soften, band hold,
feasted-vs-sober band selection E3b2, overshoot, stall, hurt-companion
rescue, wave-3/titan/companion-less/low-hp/round-1 delegation, hold
cap, gate-off pure delegation), E1 det-gates (SPLITCLOSE unset ->
armedFor byte-identical to AD.armedFor, 60d x2 bases), E4
armed+KILLDISC deterministic, D2 180d armed completes + deterministic
re-run.

## Pilot sweep

Launched 2026-10-22 ~22:10Z: ARM=control and ARM=splitclose, 8 seeds
(65611–65618) x 2 bases = 32 paired configs, 180d death-aware,
KILLDISC=1 v2 + w5census + sc counters + kill-time bearer census +
w4FightDmg + FEASTED-window attribution. Two shards (one per arm).
Per-seed JSONs → evidence/2026-10-22/perseed-splitclose/.

ADOPTION re-run 2026-10-23 (run fleshout-20261023T0120Z): the 2125Z
coordinator died before analysis. Arm adopted on stale base 4945cf38c;
branch reset to master f2daadf3d (collision-checked, no collisions);
proof gates re-verified 35/35 GREEN on master exactly per the Usage env;
old-base JSONs moved to perseed-splitclose/base-4945cf38c/ (drift
reference); the full 32-config pilot re-run on master with identical
seeds. All results below are the NEW-BASE run unless labeled drift.

IN-FLIGHT FINDING (diagnostic, 2026-10-22): the s65611-lead armed
config's 9 wave-4 fights ALL ended 'lost' with monster HP pools of
1800–3600 (not the 850–1500 monsters.json bands). Root cause:
OVERTIME RERUNS (src/js/overtime.js): on the long substrate
(SEATDRIVE=0) villages that pass the table window without taking the
seat accrue overtime tiers; wave 4–5 monsters get +25% HP per tier
(+12% damage/tier). Suburb 1396 x 1.25^4 ≈ 3433 — matches the
observed 3433-HP suburb. The veterans bar on the long substrate is
chased against INFLATING targets: the longer the village waits, the
harder the kills get. The discipline's soften (22 softens, 0 holds on
that config) cannot bridge 3500→134 HP before the scholar dies. This
is a scale-wall mechanism finding for the axis, recorded here; the
pilot's pre-registered primary remains the judge, and overtime
prevalence across the corpus will be measured in the analyzer
follow-up.

## Pilot results (NEW BASE f2daadf3d — binding, 32/32 configs, identical seeds)

Binding verdict per pre-registered primary: **NO-GO**.

- Armed seeds with >=1 kill-time villager wave-4 kill: **4/8** [65611,65612,65615,65616]
  (leg 1: >=2/8 — MET).
- Control seeds with >=1: **4/8** [65612,65615,65616,65617].
- Armed kill total: **8 vs control 10** (leg 2: >= control+2 = 12 — MISSED).
- A miss is NO-GO, never re-scored mid-run (§14).

Per-seed kill-time villager kills (armed vs control):

| seed | armed (lead / belong) | control (lead / belong) |
|------|----------------------|------------------------|
| 65611 | 0 / 1 | 0 / 0 |
| 65612 | 0 / 4 | 1 / 2 |
| 65613 | 0 / 0 | 0 / 0 |
| 65614 | 0 / 0 | 0 / 0 |
| 65615 | 0 / 1 | 0 / 1 |
| 65616 | 1 / 1 | 3 / 1 |
| 65617 | 0 / 0 | 0 / 2 |
| 65618 | 0 / 0 | 0 / 0 |

- SECONDARY (reported, not binding): damage-majority (non-scholar share >= 0.5
  of kill-fight damage): **armed=5 vs control=2** — the mechanism's credit-shift
  shows in the damage-majority lens even where the kill-total leg missed.
- TRICKTAG cross-check (via=companion): armed=8 control=9.
- Laundered kills (scholar >80% of a villager-credited kill's fight damage):
  armed=0 control=0 (bar <= 2) PASS — no channel laundering.
- FEASTED-window attribution of TRICKTAG villager kills:
  armed {feasted:4, sober:4} vs control {feasted:7, sober:2} — the drivenofeast
  honesty rule holds: armed kills are half sober (the discipline fires the
  discipline's own closes, not just FEASTED surges).
- MECHANISM counters (armed arm, 16 configs): scW4Fights=111 (88 with
  companions staged), scSoftens=387, scHolds=59 (feasted=26, sober=33),
  scOvershootHolds=48, scBandHolds=11, scLastBand=647. The discipline FIRED —
  this is not a splitkill-style dead channel; the TB channel exists and the
  layer acts on it.
- Companion damage per wave-4 fight: armed median=58 mean=135.7 (n=99) vs
  control median=74 mean=210.7 (n=74). Companions deal LESS per fight when
  armed — the scholar softens instead of kill-stealing, and the closes still
  need FEASTED to land (sim-drivenofeast's load-bearing surge, confirmed again).

GUARDRAILS (all binding — all PASS):

- scholar-combat-mortality/100d paired mean diff: +0.75 (bar <= +2) PASS
- median survival diff (matched, non-winning, n=16): 0 (bar >= -10) PASS
- starvation deaths: armed=9 control=12 (bar <= 14) PASS
- new death modes (>=2 armed, 0 control): none PASS
- wave-4 unlocks: armed=14/16 control=14/16 (not reduced) PASS

§15 BALANCED PANEL (scripts/balance-panel.js — instrument, this header is
the judge): compare control->splitclose decision=**review_required**.
leadfeast: table regression_watch (-0.125), national regression_watch
(-0.125), playerDeaths regression_watch (+1/100d +1.05). belongfeast:
playerDeaths100Days regression_watch (+0.58). No material GO signal on the
panel either; the pre-reg verdict stands regardless.

## Drift check: old base (4945cf38c) vs new base (f2daadf3d)

The stale-base corpus was preserved at
evidence/2026-10-22/perseed-splitclose/base-4945cf38c/ (32 JSONs); the
analyzer re-run against it (REPO=/tmp/olddrift shim, script unmodified):

- OLD BASE: armed 2/8 seeds [65612,65618], armed total 4 vs control 2
  (bar = control+2 = 4). **Both primary legs MET — verdict GO on the old
  substrate.** Guardrails passed there too (laundered 0/0, etc.).
- NEW BASE: armed 4/8 seeds, armed total 8 vs control 10 (bar = 12). NO-GO.

The discipline's effect is NOT substrate-robust on the control-relative leg:
**control's own villager wave-4 kill baseline moved 2 -> 10 on IDENTICAL
seeds across the 28 commits between bases** (4945cf38c..f2daadf3d —
incl. indefArt in game.js, journey-social r42, rogue text module,
ledger-beat-combat-defer r26, fallen-memorial, naming-rite). The mechanism
fired MORE on the new base (softens 213->387, holds 32->59, scW4Fights
75->111) and the damage-majority secondary preserved its direction
(2v0 old -> 5v2 new), but the kill-total bar is hostage to a moving
control. Root-cause pinning of WHICH commit moved control's baseline is
open (not chased this run — named in findings as a claimed drift note).
Lesson for the axis: the veterans channel is substrate-sensitive; a
control-relative kill-total primary needs a same-base control (which we
had) AND a drift-stable baseline (which we didn't).

## Overtime prevalence (in-flight finding follow-up)

(instrument scripts/measure-overtime-splitclose-20261022.js — deterministic
re-run of all 32 configs, Game.overtimeTier() sampled at each wave-4 TB fight
start + monsters.json base-HP band vs scaled start HP; read-only hooks, zero
game-code change. Full corpus output:
evidence/2026-10-22/overtime-prevalence-splitclose.json.)

MEASURED on the new-base corpus:

- **119/199 wave-4 TB fights (59.8%) happened at overtime tier >= 1** —
  inflated RERUN targets.
- 21/32 configs had overtime active at end; 26/32 configs had wave-4
  fights.
- Tier histogram at fight start: 0:80, 1:34, 2:11, 3:2, 4:9, 5:15, 6:48.
  **63 fights (31.7%) were at tier 5-6** — monster HP x1.25^5 ~= x3.05 and
  x1.25^6 ~= x3.81 (a 1300-HP suburb becomes ~4000-5000 HP).
- Spot-check: s65611-leadfeast-splitclose (the config that produced the
  in-flight finding): 11/11 wave-4 fights at tiers 5-6 — the diag's
  1800-3600 HP pools confirmed as RERUN tiers 4-5 on suburb 1300-1500.

The finding stands, now measured: **on the long pre-seat substrate, the
majority of wave-4 fights are chased against inflating targets, and a
third of them at the two highest tiers.** The discipline's yield band
(134/37, probe-anchored on un-inflated fights) cannot bridge 4000->134
HP before the scholar dies — the mechanism is aimed at a target that
moves. Any future kill-channel arm must be overtime-tier-aware (band
per tier, or target the pre-overtime window). Appended to sim-findings.md
as the measured version of this run's in-flight finding (cross-ref the
sim-vetwindow RERUN-overtime window entry).

## Wall numbers

(16 configs per arm, 180d death-aware)

| arm | national | table | won | wave4 | wave5 | exiled | w5vets2max | medSurv | maxSurv |
|-----|----------|-------|-----|-------|-------|--------|------------|---------|---------|
| control | 5 | 11 | 0 | 14/16 | 4/16 | 0 | 4/16 | 143 | 181 |
| splitclose | 5 | 11 | 0 | 14/16 | 2/16 | 0 | 2/16 | 138 | 181 |

Zero wins on both arms — the scale wall stands. National 5/16 configs,
table 11/16, wave-4 unlocked 14/16: the on-ramp reaches the table but
nothing sits (SEATDRIVE=0 by design here; the long substrate is where
overtime inflates the targets — see overtime finding).

Death-cause shares (armed): combat 470 (67.6%), villager combat 110
(15.8%), expedition 27 (3.9%), monster 24 (3.5%), sickness 18 (2.6%), a
wound that wouldn't close 10 (1.4%), starvation 9 (1.3%), contest 8 (1.2%).

## Village assessment (plain words)

Across the 32 runs the villages look like the armorydrive substrate we
know: feasts staged, companions armed, wave-4 TB fights happening with
staged companions in 88 of 111 armed wave-4 fights. The scholar's new
discipline is visible in the telemetry and in the transcript: where the
scholar used to strike for the kill, she now softens and holds — "You
hold still, watching." — while Elif, Ava, and Quinn trade blows with the
Mirror Draft monsters. The villages that reached the table and waited
past day 90 accrued overtime tiers and fought RERUN-inflated monsters;
their kills came harder and fewer. Nobody won; villages died of combat
first (67.6%), starvation a distant 1.3%. The discipline did not make
villages weaker (median survival diff 0, starvation 9 vs 12) — it simply
did not move the kill-total bar on a substrate where control kills had
already doubled.

## Sense test (SENSE-TESTING LAW)

VERDICT: PASS — the companions read as people closing a fight.

Re-ran the deterministic armed config s65612-belongfeast (4 kill-time
companion kills) with a fight-end narration extractor
(scripts/sense2-splitclose-20261022.js). The closes:

- d141 The Strike: "Ava hits strike for 79... The Strike falls." The
  scholar holds through the middle rounds ("You hold still, watching.")
  while Ava and Elif trade blows; Elif shouts "Move! MOVE!" when
  Absolution falls; Elif winces "You're bleeding!" and patches the
  scholar mid-fight ("Hold still!").
- d148 The Congregation: "Ava hits congregation for 38... The
  Congregation falls." — under the Absolution telegraphs, companions keep
  striking; the scholar's hold is a legible beat, not a skipped turn.
- d159 The Influencer: "Elif hits influencer for 30... The Influencer
  falls." — after the scholar's soften ("You STRIKE the influencer for
  168"), Elif closes.
- d168 The Influencer ("The Big Loud"): "Elif hits influencer for
  14... The Big Loud falls." — a 14-damage finishing blow, Quinn and
  Elif grinding it down together.

The hold is voiced, the blows are named, the companions react to wounds
and telegraphs. No robotic repetition, no silent turns. BLANK (small):
the killing blow gets no distinct finishing-beat narration beyond "X
falls." — a candidate micro-blank for a future voice pass, not a failure.

## Metric review (§14)

1. The control-relative leg (>= control+2 kills) proved UNSTABLE under
   substrate drift: control's baseline moved 2->10 on identical seeds
   between bases. On the old base this arm would have been GO; on the
   new base it is NO-GO with better armed reach (4/8 seeds vs 2/8) but a
   doubled control. Proposed revision for the NEXT run's pre-reg (NOT
   applied to this verdict): damage-majority (non-scholar share >= 0.5)
   as the binding primary — it is mechanism-true (credit-shift is the
   design), preserved direction across both bases (2v0 -> 5v2), and is
   not hostage to control's kill-total baseline.
2. Overtime inflation is now a measured axis mechanism, not a suspicion
   (see overtime section): the yield band (134/37) was probe-anchored on
   un-inflated fights; on the long substrate the targets inflate by
   1.25^tier. A future arm should either probe the band per-tier or
   target the pre-overtime window.
3. Guardrail set held; no metric misfired. The "no new death mode"
   >=2-event rule did not fire spuriously at n=16/arm.

## Blanks filled / documented

- FILLED (documented, not built): the kill-total primary's drift
  instability is now measured old-vs-new; the damage-majority revision
  is pre-proposed for the next run.
- DOCUMENTED (open): which of the 28 commits moved control's villager
  wave-4 kill baseline 2->10 — named in sim-findings.md as a claimed
  drift note for a future run.
- DOCUMENTED (open): the overtime-inflation mechanism finding — the
  veterans bar is chased against inflating targets on the long
  substrate; overtime prevalence measured across the new corpus
  (appended to sim-findings.md in-file format).
- BLANK (small, voice): no distinct finishing-beat narration on the
  killing blow ("X falls." only).
- Canon note: no canon doc covers equipment — stated in the dead
  worker's header, still true; nothing invented.

## Convergence

**killed-at-pilot** — the binding primary missed on the new base
(armed 8 vs control 10 kills, bar 12). The mechanism is proven working
(35/35 proof gates green on master; 387 softens / 59 holds across the
pilot; sense PASS), so this is a bar-miss, not a mechanism failure.
Named next (NOT chased this run): re-pilot with damage-majority as the
binding primary per compdamage's metric-review proposal, and/or an
overtime-tier-aware yield band. Policy file stays opt-in inert
(SPLITCLOSE=1, zero src/js) per the sim-vetwindow precedent; killed
arms leave no trace — the evidence + policy + instruments commit on the
verdict either way.

(pending items: none — overtime prevalence landed above.)

## Pre-registration header retained
