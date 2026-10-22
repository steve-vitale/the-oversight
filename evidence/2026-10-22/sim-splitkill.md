# sim-splitkill — scholar-softens/companion-closes TB discipline POLICY pilot (axis scale-onramp)

Run fleshout-20261022T0715Z, worker sim-splitkill (arm 2 of 3; siblings:
sim-armorydrive = weapons-in-hands on its own tree, zero file overlap;
sim-armorsink-r2 = worn-armor mortality ledger DIAG).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; bands damage 35-95, HP 850-1500; the readiness gate's
VETERANS bar = 2 living roster members with wave-4+ kills in
state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger
exactly like the player's; titan hard gate — no solo titan fights).

## The question

The just-landed sim-wave4engage-r2 (KILLED-AT-PILOT,
evidence/2026-10-22/sim-wave4engage-r2.md) proved the veterans bar is a
companion-DAMAGE (capability) problem, not an opportunity problem: 174
patrol days manufactured 36 wave-4 fights with engaged companions dealing
~half the party's damage, yet 0/16 armed configs produced a villager
wave-4 kill (control: 7 kills on 3/8 seeds). Its no-scholar-finish
discipline removed the only reliable finisher — companions could not
close wave-4 HP pools alone. Its SECOND NAMED NEXT is this arm: SPLIT
THE KILL — the scholar softens the target INTO THE YIELD BAND, then
holds while the companions close. This is NOT the killed blanket
no-finish discipline: the scholar's softening is the mechanism under
test, and the hold is bounded (a stalled hold hands the finish back to
the scholar — a zero-kill fight is the wave4engage failure mode, never
repeated).

Design constraints honored: finding #790 — NO per-companion withdrawal
verb exists; the design never withdraws companions (the scholar
holds/strikes only). Finding #749 — titan class split (herald/nielsen/
finale excluded from soften/hold targets; herald solo entries never
start a TB fight anyway). Finding #714 — substrate is the NON-SEAT long
substrate (SEATDRIVE=0, 180d horizons): the seat win truncates the
veteran channel (~d90-134 wins before villagers blood themselves).

## The yield band (honest definition, probe-anchored)

"Target HP at or below the maximum damage the engaged companions can
plausibly land as a finishing blow" = p75 of per-(fight,round)
companion damage vs wave-4 non-titan monsters, measured on the CONTROL
substrate by scripts/probe-splitkill-damage-20261022.js (seeds
65501-65502 x {leadfeast,belongfeast}, pre-seat substrate, VGEAR unset —
the same substrate the pilot runs on):

- companion per-round vs wave-4: p50=10, p75=12, p90=12, max=12 (n=5)
- companion max single hit: p50=10, p90=12, max=12
- scholar max single hit: p50=170, p90=192, max=202 (n=21)

YIELD_BAND = 12. Thin sample (n=5 companion rounds) — ballpark 10-15;
the design is robust across that range (shave rounds scale linearly).
SCHOLAR_EST_INIT = 200 (probe scholar max; the overshoot guard must
never underestimate the strike). HOLD_CAP = 10, STALL_TURNS = 2
(the shave from one safe scholar strike to the band takes ~6 companion
rounds at 12/round; the cap gives headroom, the stall rule hands back
the finish if companions aren't closing).

The discipline (scripts/policies/splitkill.js, SPLITKILL=1, zero
src/js): in a scholar TB turn with live non-titan wave-4 monster(s)
and >=1 engaged party companion — SOFTEN (strike via base.fight) while
target HP > band + scholarEst; SHAVE (hold via tbPlayerWait) in the
overshoot window; HOLD in the band; all holds bounded (scholar hp >=
50%, round >= 2, <= 10 holds/fight, stall < 2). A companion below 40%
HP ends the hold immediately — the scholar resumes striking (fastest
end = fastest the companion stops taking damage). No breakoff (#790:
fight-aborting protection costs the bar its kills). No engagement
manufacturing — the layer only acts inside wave-4 TB fights the base
policy already enters (opportunity proven on this substrate:
sim-villagergear pilot 3/8 armed vs 0/8 control).

## PRE-REGISTRATION (§14 binding — written BEFORE any pilot sims)

- Design: 8 fresh seeds (65501-65508, filename-unused in evidence/
  verified 2026-10-22) x {leadfeast, belongfeast} x {control,
  splitkill} = 32 paired configs, 180d death-aware (dead villages stop
  simulating; the harness breaks on Game.over), on the proven pre-seat
  substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1
  (VETREL/REPOSITION/VGEAR unset; SPLITKILL=1 for the armed side only).
- control = stackFor(base) (RP.withReposition > VR.withVetrel >
  WD.withWinDefer > SD.withSeatDrive, all inert/delegating via env)
- splitkill = SK.withSplitkill(stackFor(base)) OUTSIDE the same stack
- PRIMARY: armed seeds with >=1 villager-attributed wave-4 kill
  (waveKillLog w=4, kill-time: by != bearer-on-the-kill's-day, by !=
  'player' — sim-killtime MANDATORY) >= control+2 AND >=2/8 armed.
  A seed counts if EITHER policy config reaches it.
- GO = primary met. A miss is NO-GO, never re-scored mid-run (§14).
- GUARDRAILS: median survival within ±10d of control (non-winning,
  per-seed matched); starvation deaths <= control+2; no new death mode
  (>=2-event rule); scholar-fight mortality watch (scholar combat deaths
  armed vs control — the discipline must not accelerate the scholar's
  death; wave4engage's autopsy: the killer incarnation dies within 30d
  in 9/10); wave-4 unlock count not reduced.
- Instruments: KILLDISC=1 v2 + daily w5-readiness census + splitkill
  layer counters + kill-time bearer census. Before/after through the
  balanced panel (scripts/balance-panel.js) per §15 — the panel is the
  instrument, this header is the judge.
- Bar rationale: the vgear pilot+confirm on this substrate measured
  control 0/16 villager wave-4 kills; the bar demands a real signal
  (>=2/8 and >=control+2), not pilot-scale noise.

## Proof gates (run BEFORE the pilot — scripts/test-splitkill-20261022.js)

E0 shape; E1 det-gate (SPLITKILL unset → armedFor byte-identical to the
base stack, 60d x2 bases); E2 env-gate; E3 synthetic RED→GREEN fixtures
on the discipline (soften above band, overshoot hold, band hold, stall
finish, hold cap, hurt-companion resume, non-w4 delegate, titan
excluded, companion-less delegate, low-scholar-hp delegate, round-1
delegate, gate-off pure delegation); E4 armed+KILLDISC deterministic;
D2 180d armed runs complete per policy + deterministic re-run.

(Result appended after the gates go green — gates must be ALL GREEN before the sweep.)

VERIFIED GREEN 2026-10-22 (recovery worker, run fleshout-20261022T1015Z): the
proof was run EXACTLY per the Usage header env (full substrate env; the env-trap
lesson). 29 PASS, 0 FAIL — E0/E1/E2/E3 (incl. the stall/hold-cap/rescue fixtures),
E4 armed+KILLDISC deterministic, D2 180d armed completes + deterministic re-run.
No layer changes were needed; the dead worker's layer was already correct.

## Pilot sweep

Ran 2026-10-22 (recovery worker): 32/32 configs complete, 180d death-aware,
substrate exactly per pre-reg. Infrastructure note: the two parallel sweep
processes (28/32 configs written) were killed mid-run when /tmp was cleaned by
a sibling's cleanup — the final 4 (seed 65508 x2 policies x2 arms) ran
sequentially from workspace logs; no config was lost or re-seeded. All 32
perseed JSONs under evidence/2026-10-22/perseed-splitkill/.

## Pilot results

`node scripts/analyze-splitkill-20261022.js` — judged against the BINDING
pre-registration above (§14, never re-scored):

PRIMARY — seeds with >=1 villager-attributed wave-4 kill (kill-time):
  s65501 C=0/0 A=0/0 | s65502 C=0/0 A=0/0 | s65503 C=0/0 A=0/0
  s65504 C=0/0 A=0/0 | s65505 C=0/0 A=0/0
  s65506 C=1/1 A=1/1  <- the ONLY seed; byte-identical kill both arms
  s65507 C=0/0 A=0/0 | s65508 C=0/0 A=0/0
  armed=1/8, control=1/8. Bar: >=control+2 (needs 3) AND >=2/8 (needs 2).
  VERDICT: NO-GO.

MECHANISM COUNTERS (armed arm, 32 configs): the layer SAW 59 wave-4 TB
fights (w4Fights=59) and the discipline fired ZERO times —
softens=0, holds=0, bandHolds=0, overshootHolds=0, stallFinishes=0,
rescueStrikes=0, fightErrors=0, holdErrors=0. The layer counted fight
entries, then returned 'fight' (pure delegation) in every single one:
`engagedCompanions(Game)` was empty in all 59 fights. Armed≡control
byte-identical on all 32 configs (E1 det-gate proved gate-off delegation;
here the gate was ON and the mechanism still never acted — the pilot
degenerated to a 32-config reproducibility proof, which passed).

GUARDRAILS (all pass, trivially — nothing moved):
  median survival (non-winning matched, n=16): diff=0, bar ±10 -> PASS
  starvation deaths: control=22 armed=22, bar <=24 -> PASS
  new death mode (>=2 events, absent on control): none -> PASS
  scholarCombatDeaths: control=109 armed=109 (must not accelerate) -> PASS
  wave-4 unlocks: control=9 armed=9 (not reduced) -> PASS

## Wall numbers

| arm | n | national | table | won | wave4 | wave5 | exiled | medSurv | maxSurv | w5vets2 | w4kills |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 16 | 5 | 10 | 0 | 9 | 0 | 0 | 142.5 | 181 | 0 | 2 |
| splitkill | 16 | 5 | 10 | 0 | 5 | 0 | 0 | 142.5 | 181 | 0 | 2 |

(Identical arms; the numbers are one measurement.) Death-cause shares across
32 configs (1208 deaths): combat 56.1% (678), villager combat 19.0% (230),
monster 6.8% (82), sickness 4.6% (56), starvation 3.6% (44), expedition
3.1% (38), "a wound that wouldn't close" 2.2% (26), the phoenix link 1.2%
(14), contest 1.0% (12), alien 0.7% (8), dehydration 0.5% (6), rest <1%.
The scale wall stands: national reached (5/16 — bread/feast substrate),
table invitations 10/16, zero wins, zero wave-5 unlocks, zero configs with
>=2 wave-5-readiness veterans. Wave-4 combat readiness door opens; the
VETERANS bar (2 living wave-4+ killers) stays at 0/16.

## Village assessment (plain words)

These villages live or die on whether the scholar becomes a one-person
army. On this substrate the scholar fights wave-4 monsters ALONE — two
dumped TB fights (s65501 belongfeast) show the scholar at full health
grinding a 1236-HP congregation solo, then facing two 1700+HP
congregations at once (partyMembers=[], no companion fighters in the
fight at all). Companions are out dying in "villager combat" (19% of all
deaths) or starving — they never stage into the scholar's wave-4 TB
fights, so no soften/hold discipline can ever set them up. The one
villager wave-4 kill in the pilot (s65506 leadfeast: Leonard kills an
eater on day 53) happened in a NON-TB context with the scholar having
dealt 1059 damage and companions 0 — the kill credit went to Leonard
(kill-time) on the scholar's damage. Belongfeast villages in particular
bleed out: scholar combat deaths 6-13 per run (succession after
succession), most ending village-lost by day ~130-180. Leadfeast fares
better (survived to 181 on 3/8 control seeds) and is the only policy that
ever reached national here.

## Sense test (SENSE-TESTING LAW)

There is NO softened-then-closed fight to read — the discipline fired zero
holds in 59 wave-4 fights, so the transcript the law asks for does not
exist, and I will not manufacture one. Instead I read what the substrate
actually produced: two real wave-4 TB fights from s65501 belongfeast
(scripts/probe-splitkill-fight2-20261022.js):

  === new TB fight d97 round 1 ===
  tbIsPlayerTurn: true | partyMembers: []
    key=p kind=player hp=100/100
    key=m_0 kind=monster mid=congregation wave=4 hp=1236/1236
  === new TB fight d115 round 1 ===
  tbIsPlayerTurn: true | partyMembers: []
    key=p kind=player hp=100/100
    key=m_0 kind=monster mid=congregation wave=4 hp=1722/1722
    key=m_crew_1 kind=monster mid=congregation wave=4 hp=1745/1745

The scholar reads as a solitary grind, not a setup: full HP against a
1236-HP congregation alone on day 97, then two 1700+HP congregations at
once on day 115 — no companions in the fight, no party members at all.
There is nothing to "set up" and no one to "close." The sense-test finding
is the absence itself: the scholar-softens/companion-closes design is
dramatically coherent only if companions are in the fight, and on this
substrate they never are. A transcript of the scholar holding while an
empty battlefield waits would have read as farce, not deliberation.

## Metric review (§14)

1. The pre-registered primary metric and its bar (armed >= control+2 AND
   >=2/8 seeds with a kill-time villager wave-4 kill) were honest and
   binding. The miss is NO-GO; nothing was re-scored. The metric proved
   diagnostic: it separated "the layer works" from "the layer never acts."
2. ATTRIBUTION SUBTLETY found (not scored, proposed for the NEXT run):
   kill-time attribution (by != bearer-on-that-day) can credit a villager
   for the killing blow even when the scholar dealt ~all the damage —
   s65506: dmgScholar=1059, dmgCompanion=0, by=Leonard, bearer=scholar.
   The VETERANS bar's spirit is companion CAPABILITY; the metric measures
   kill-CREDIT. A damage-majority variant (>=50% of the kill's damage from
   non-scholar sources, or the killer credited AND companion damage > 0)
   would measure the bar honestly. Next run should register that variant.
3. OPPORTUNITY ASSUMPTION failed: the pre-reg inherited "opportunity is
   proven on this substrate" from the sim-villagergear sibling run
   (VGEAR armed). On THIS substrate (VGEAR unset, these fresh seeds),
   w4EngageEvents=0 on all 32 configs — killdisc's startCombat census saw
   zero wave-4 engagements with staged companions, and the layer's own
   engagedCompanions() was empty in all 59 TB fights it entered. Lesson:
   opportunity must be measured on the exact pre-reg substrate in-run,
   never inherited from a sibling variant.
4. The yield band (12 HP, probe-anchored) and the whole soften/hold
   machinery were never exercised — the pilot cannot speak to the band's
   correctness, only to its irrelevance when no companions are staged.

## Blanks filled / documented

- FILLED (mechanism, proven): the splitkill layer is correct policy-side
  code — 29/29 proof gates green (soften/overshoot/band-hold/stall/hurt-
  companion/titan-exclusion/cap/gate-off fixtures + determinism), and the
  32-config pilot proves it is damage-neutral (armed≡control on every
  guardrail). It is NOT a broken lever; it is a lever with no channel on
  the non-seat substrate.
- DOCUMENTED (gap, no chase mid-run): on the proven pre-seat substrate the
  scholar fights wave-4 TB battles solo; companions never stage into them
  (partyMembers=[], w4EngageEvents=0/32). The VETERANS bar's kill channel
  on this substrate is non-TB field kills + scholar-damage-softened kills
  credited at kill-time — a TB-only discipline cannot touch it. Next
  design step (for the convergence tracker, not this run): either stage
  companions INTO wave-4 TB fights (muster/patrol redesign) or move the
  split-kill discipline to the field-fight channel where the kills
  actually happen.
- DOCUMENTED (attribution): kill-time vs damage-majority attribution can
  disagree on who "killed" a wave-4 monster (s65506: Leonard credited,
  scholar dealt 1059). Proposed metric revision above.

## Convergence

killed-at-pilot. The arm's mechanism (scholar softens, companions close)
cannot produce the pre-registered signal on the pre-reg substrate: zero
discipline firings in 59 observed wave-4 fights, primary 1/8 vs 1/8
against a >=control+2 AND >=2/8 bar, the lone kill byte-identical on both
arms. Per Steve's kill discipline (2026-10-21), this is NOT a kill of the
mechanism — the root cause is established (companions never stage into
scholar TB fights; the kill channel is non-TB) and the layer itself is
proven correct-but-inert. A future arm that stages companions into
wave-4 TB fights (or moves the discipline to the field channel) could
revive it; as a standalone policy layer on this substrate it has no
effect. No files land from this arm — the layer, probes, sweep, and
analyzer remain committed in-tree as a proven-inert mechanism with its
proof gates, for that future arm to reuse.
