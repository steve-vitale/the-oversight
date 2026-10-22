# sim-armorydrive — "weapons in hands" POLICY pilot (axis scale-onramp, backlog #793/#714b)

Run fleshout-20261022T0715Z, arm sim-armorydrive. Worker tree sim-armorydrive,
base 568999eac926da14160504912422f400a050b38c (= master at run start).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 roster +
bands, the readiness gate, VILLAGER XP LAW). No canon doc covers
armor/equipment — stated, not invented.

The question (named next of killed-at-pilot sim-wave4engage-r2, finding
#793): the veterans bar is a companion-DAMAGE (capability) problem, not an
opportunity problem. Wave-4 HP pools (850-1500) outscale companion fight
output. This arm raises companion damage-per-fight: the VGEAR armory drive,
weapons in hands — on the NON-SEAT long substrate (finding #714b: the seat
win at ~d90-134 truncates the veteran channel; the channel needs the long
game).

Scope vs the sibling arm (sim-splitkill, same run): the sibling owns the TB
fight discipline (scholar softens into the yield band, companions close).
This layer owns CAPABILITY ONLY — armory drive + fighter staging. NO fight
wrapper (finding #790: fight-aborting protection costs the veteran bar its
kills). The split is deliberate and disjoint.

## Seed verification (recorded per brief)

- wave4engage-r2 consumed: 65451–65458 (32-JSON corpus, evidence/2026-10-22/perseed-wave4engage-r2/).
- Sibling sim-splitkill proof (in-memory, no corpus): 65411–65414.
- Verified UNUSED across evidence/ + scripts/ on master: 65461–65468 (0 filename hits).
- This pilot uses 65461–65468. Proof det-gates use 65411–65420 (in-memory only, no corpus writes).

## PRE-REGISTRATION (§14 binding — written BEFORE any sweep)

- Design: 8 fresh seeds × {leadfeast, belongfeast} × {control, armorydrive} =
  32 paired configs, 180d death-aware (dead villages stop +10d tail max), on
  the non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/
  VETREL/VGEARBEATS/TWOVETS/VGEAR/WAVE4ENGAGE; KILLDISC=1 v2).
- control = AD.substrateFor(base) (seatdrive prebuilt; SEATDRIVE=0 =
  delegation; ARMORYDRIVE unset)
- armorydrive = AD.armedFor(base) (ARMORYDRIVE=1 OUTSIDE the same substrate)
- PRIMARY: villager wave-4 kills (kill-time attribution, killdisc v2:
  wave==4, by != bearer-on-the-kill's-day, by != 'player') summed over the 16
  armed configs: armed total >= control total + 2 AND >=2/8 armed configs
  with >=1 villager wave-4 kill. A seed counts if EITHER policy config
  reaches it.
- GO = primary met. A miss is NO-GO, never re-scored mid-run (§14).
- GUARDRAILS (all binding):
  - median survival: |armed − control| <= 10d (matched per-seed);
  - starvation deaths <= control + 2;
  - no new death mode (>=2-event rule);
  - wave-4 unlock count not reduced (armed >= control);
  - armor not bled (finding #735 catch-22): end-run armored count (wave-4
    readiness ARMORED bar, P>=10) — armed median >= control median − 1;
  - no channel laundering >2x: a villager wave-4 kill is LAUNDERED if the
    scholar dealt >80% of the damage in that kill's fight (killdisc per-
    source dmg table); armed laundered kills <= control laundered kills + 2.
- MECHANISM CHECK (diagnostic, not binding): companion damage per wave-4
  fight (killdisc per-source attribution, fights with a wave-4 monster
  engaged) — armed >= 1.25x control. If the primary GOes but damage doesn't
  move, the verdict records the kills as staging/attribution luck, not the
  drive — the anti-laundering honesty clause.
- Instruments: killdisc-instrument-20261021.js (KILLDISC=1 v2: read-only
  per-source tbDamage attribution on wave-3+ monsters + daily readiness
  census + startCombat engagement census) + daily w5-readiness sample +
  ad layer counters (adDonations/adCraftDonations/adInvitesOk, counts only)
  + daily bearer census (kill-time attribution — the scholar is a role, not
  a person; sim-killtime MANDATORY) + daily armory/armory-unit + armed-
  companion census. Before/after through the balanced panel
  (scripts/balance-panel.js) per §15 — the panel is the instrument, this
  header is the judge.

## Proof gates — GREEN 2026-10-22 ~08:35Z (23/23 PASS, 0 fail)

Run on current master 568999eac9 with the pinned non-seat substrate env
(FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1).
E0 shape, E1a/E1b det-gates (ARMORYDRIVE-off armed == substrateFor,
byte-identical, 60d ×2 bases), E1c (SEATDRIVE=0 seat wrapper delegates —
substrateFor == withWinDefer(TF.leadfeast), byte-identical), E2 env-gate,
E3a–E3f synthetic RED→GREEN fixtures (best-spare-first incl. the
VGEAR-worst-spare RED, keep-one-spare, keepsake/bonded exclusion, best-craft
fallback, stocked-armory no-op, gate-off silence), E3g stagingLive unit
fixtures (bar-met/pre-wave-4/gate-off stand-down), E4 ARMORYDRIVE=1 180d
armed run completes per policy (s65419, death-aware completion at d125) +
deterministic re-run byte-identical (D2), E5 mechanism smoke (120d real run
fires donations).

## Pilot sweep

Launched 2026-10-22 ~08:40Z: ARM=control and ARM=armorydrive, 8 seeds
(65461–65468) × 2 bases = 32 paired configs, 180d death-aware, KILLDISC=1 v2
+ w5census (incl. armored4) + ad layer counters + kill-time bearer census +
wave-4 fight damage tables. Per-seed JSONs →
evidence/2026-10-22/perseed-armorydrive/. 32/32 complete ~09:05Z, 0
instrument errors, anchor 568999eac926. No infra incidents.

## Pilot results (32/32 configs complete, 2026-10-22 ~09:05Z)

Analyzer: scripts/analyze-armorydrive-20261022.js (the pre-registered judge).
Balanced panel: scripts/build-armorydrive-panels-20261022.js →
evidence/2026-10-22/armorydrive-panel-primary.{md,json} (valid compare,
decision=review_required — see the playerDeaths investigation below; the
panel is the instrument, this header is the judge).

PRIMARY (binding): villager wave-4 kills (kill-time, killdisc v2):
armed=7, control=0 (bar: armed >= control+2) → GO
Armed seeds with ≥1 villager wave-4 kill: 3/8 — s65462 (Declan d93
influencer; Gustavo d156 + d157×2 strike), s65464 (Elena + Sigrun d105
strike ×2), s65468 (Chloe d50 algorithm) — (bar ≥2/8) → GO
VERDICT: GO (§14 — not re-scored).

GUARDRAILS (all PASS):
- median survival: control 124.5d, armed 121.3d, diff −3.3d (|diff| ≤ 10) ✓
- starvation deaths: control 25, armed 13 (bar ≤ 27) ✓
- new death modes (≥2 events, 0 control): none ✓
- wave-4 unlocks: control 13/16, armed 14/16 (bar armed ≥ control) ✓
- armor not bled (#735): end-run armored P≥10 median control 0, armed 0
  (bar ≥ −1) ✓ — the substrate has no armor economy to bleed
- laundering: 0 laundered villager kills both arms (scholar >80% of
  kill-fight damage; bar armed ≤ control+2) ✓

MECHANISM (diagnostic): companion damage per wave-4 fight — control 9.8
(n=59 fights), armed 275.1 (n=72) — 28x. The ratio's denominator is the
real story: control had ZERO wave-4 engagements with a companion present
(partySize≥1); armed had 78. The drive fired: 160 donations (129 direct
best-spare + 26 crafted, bonus-sum 2759), 105 staging invites. End-run armed
villagers (wbonus≥12) median 0 both arms — the census is end-of-run and most
villages died; the donations went into fighters who fought and mostly died
or dispersed, which is the honest footprint.

## Root cause / verdict

The #793 capability theory CONFIRMS at pilot: put real edges in companions'
hands (best-spare-first, not worst-spare; best-craft fallback; stock 6) and
stage them into wave-4 fights, and villagers close wave-4 kills — 7 on 3/8
armed seeds vs 0/16 control, zero laundering (the companions dealt the
damage; the scholar contributed but never >80%). The no-fight-discipline
scope held: the scholar fought per base policy throughout (the sibling
sim-splitkill owns the close), so these kills are engine-honest blows, not
manufactured yields.

The headline cost (panel LOUD line, investigated same-run): paired
scholar-combat-mortality +4.4 deaths/100d (12/16 configs positive, median
+3.75). Plausible mechanism: staged companions join the scholar in wave-4
fights (78 party-engagements vs 0 control) — the deadliest damage band in
the game — raising bearer turnover. The village-level outcome is flat
(median survival −3.3d; starvation DOWN 25→13; wave-4 unlocks UP), so this
is turnover, not village death — the village is the protagonist. It is a
real cost of the channel, documented loudly, not a guardrail miss. A
confirm-scale read should re-measure it before the layer is composed with
the sibling's discipline.

Telemetry deviation (loop step 10): telemetry-check LOUD "wins disappeared:
baseline 16 → current 0" — INVESTIGATED, EXPLAINED, not a bug: the baseline
is the winning (seat) substrate; this corpus is deliberately non-seat
(SEATDRIVE=0, #714b) where the seat drive is opted out by construction.
Baseline NOT rolled forward.

## Wall numbers

control (16 configs): national 7, table 13, won 0, wave4 13/16, wave5 0/16,
w5vets2 0/16, median 122d, max 160d
armed (16 configs): national 7, table 12, won 0, wave4 14/16, wave5 1/16,
w5vets2 2/16, median 119d, max 171d
The wave-5 door OPENED on the non-seat substrate: s65464-leadfeast-armed,
d105 — Elena + Sigrun's double Strike kill filled the veterans bar (2
living wave-4 killers) and the door opened the same stretch. s65462-
belongfeast-armed also reached w5vetsMax=2 (Nina + Gustavo's d156–157 Strike
brawl, 8 wave-4 kills in two days) but lost the veterans before the door
could open (w5vetsEnd=0) — the window after the bar fills is still the wall.

## Village assessment (plain words)

On the long substrate the villages live ~120 days, reach national half the
time, and stage the table without taking the seat. Without the drive, their
wave-4 fights are scholar-solo affairs: the scholar lands the killing blows
(7 scholar wave-4 kills on control) and the companions watch. With the
drive, the mornings change: the scholar's spare edges — the hunting spears
and machetes that used to ride in the pack — go to the armory, and the
strongest fighters walk with the scholar. When the mirror draft comes,
companions are in the fight dealing real damage (275/fight), and three
seeds' worth of villagers — Declan, Gustavo, Elena, Sigrun, Chloe — put
wave-4 monsters down. One village walked through the wave-5 door. The price
is visible too: the bearers turn over faster. The village buries more
scholars and keeps walking.

## Sense test (SENSE-TESTING LAW)

Re-ran s65464-leadfeast-armed deterministically (scripts/
sense-armorydrive-20261022.js) and read the d103–107 window around Elena +
Sigrun's double Strike kill. The fight reads: three fighters (you + Elena +
Sigrun) against The Strike, its attention snapping between them
("proximity overrules patience"), its hide absorbing 8 per blow, the rat's
eyes deflating as "the strike lifts — for now. (It will post new demands.)"
and inflating to "THEN WE WALK. — the grid goes on strike." That is The
Strike's canon (MONSTER-WAVES.md: it doesn't attack, it shuts the grid down
— negotiate or scab), played straight. The killing blows are honest work:
Elena and Sigrun strike for 25–38 a blow (FEASTED ×2.53 — see the
composition note below), the scholar for 10–25 with them, nobody holds back
for anybody. Days earlier the System had already voiced Elena's name on
camera for the d99 Loud-Eyes kill ("That's a veteran kill, folks. REMEMBER
the name.") — the televised-fights law holding. Elena and Sigrun read as
people throughout the run-up: Elena asking to just talk "like people used
to," hovering for food, fixing things in the bunks, walking out with Sigrun
("Nobody walks alone today"), wincing "You're bleeding!"; Sigrun fetching
water, pacing restless, her kid asking about the watchers. SENSE-PASS.

Composition note (finding-worthy): every companion blow in the d105 fight
carried FEASTED ×2.53 (feastscale's feast-surge) — base companion damage
was ~13/blow. The drive put edges in hands; the feast policy multiplied
them. A drive-without-feast decomposition is still open.

Narration blank (documented, not filled — game-code/UI territory): the
drive's own beats are silent in fiction — no line marks a weapon going to
the armory or a fighter being asked to stand ready (the same #699 silent-
arming class as VGEAR). Companions just show up armed.

## Metric review (§14)

The pre-registered metric proved right and binding: both primary prongs met
cleanly (7 ≥ 2, 3/8 ≥ 2/8), no re-scoring temptation, no borderline to
argue. The guardrail set held with one honest strain — armor median 0 both
arms makes the #735 guardrail vacuous on this substrate (there is no armor
economy to bleed); a future confirm on an armor-richer substrate should
re-check it. The panel's playerDeaths regression_signal (belongfeast) is not
in the guardrail set — it is reported as the investigated cost above, not
scored. No metric revision proposed; the confirm should pre-register
scholar-combat-mortality/100d as an explicit guardrail.

## Blanks filled / documented

- FILLED: the #793 named next — companion damage-per-fight raised via the
  armory drive (best-spare-first donation, best-craft fallback, staging);
  villager wave-4 kills 0 → 7 at pilot, wave-5 door opened once on the
  non-seat substrate. Layer: scripts/policies/armorydrive.js (ARMORYDRIVE=1,
  default OFF, zero src/js).
- DOCUMENTED: (1) scholar-combat-mortality cost +4.4/100d paired (12/16) —
  turnover, not village death; (2) FEASTED ×2.53 composition effect on
  companion kills (finding appended to sim-findings.md); (3) silent arming
  beats narration blank (#699 class); (4) armor guardrail vacuous on this
  substrate; (5) s65462's lost-veterans window — the bar filled (vets=2)
  but the door didn't open before the veterans died (the post-bar window is
  the next wall).
- NAMED NEXT: confirm at 12–16 fresh seeds with scholar-mortality/100d as a
  pre-registered guardrail; then compose with the sibling sim-splitkill
  discipline (capability × close) — the two named nexts of #793 reunited.
