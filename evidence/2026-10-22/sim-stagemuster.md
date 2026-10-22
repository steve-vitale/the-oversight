# sim-stagemuster — muster/patrol redesign POLICY pilot (axis scale-onramp)

Run fleshout-20261022T1215Z, arm sim-stagemuster (the staging half of the
splitkill named next; sibling arms: sim-depositgate-b2 = food-economy game-
code work, zero file overlap — this arm is scripts/policies/ ONLY).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; bands damage 35-95, HP 850-1500; the readiness gate's
VETERANS bar = 2 living roster members with wave-4+ kills in
state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger
exactly like the player's; titan hard gate). No canon doc covers
armor/equipment — stated, not invented (same as the armorydrive arms).

## The question

sim-splitkill was KILLED AT PILOT (evidence/2026-10-22/sim-splitkill.md):
the scholar-softens/companion-closes TB discipline fired ZERO times in 59
wave-4 TB fights — companions NEVER stage into the scholar's wave-4 TB
fights on this substrate (partyMembers=[], w4EngageEvents=0/32). Per
Steve's kill discipline (2026-10-21), the TB-discipline THEORY is dead but
the root cause is established (wrong channel — no companions in the
fight), and the named next is the STAGING half: muster/patrol redesign to
stage 1-2 ARMED companions into the scholar's wave-4 TB engagements. The
sibling sim-armorydrive (GO at pilot, CONDITIONAL GO at confirm,
evidence/2026-10-22/sim-armorydrive.md, sim-armorydrive-confirm.md)
proved the channel is manufacturable policy-side: fire-side staging
(invites at the haven + travel glue) put companions in 128 wave-4
engagements over 32 configs and produced 8 villager wave-4 kills on 5/16
seeds. This arm closes the two gaps in that staging shape:

- GAP 1 (muster): armorydrive's fighterStaging invites ONLY at the fire
  (playerAtHaven), once per day. A scholar who stays on the field for days
  while the party disperses is never re-staged until a haven return.
- GAP 2 (patrol): no deliberate engagement manufacture. The base policy
  AVOIDS danger (competent fleeDirScore: danger -= 6); the wave4engage
  patrol (174 patrol days, 36 staged wave-4 fights, KILLED on its no-finish
  discipline) proved deliberate patrols manufacture the conjunction.

The layer (scripts/policies/stagemuster.js, STAGEMUSTER=1, zero src/js),
composed OUTSIDE armorydrive's armedFor (ARMORYDRIVE=1 on both arms —
unarmed staging is pointless):

1. MUSTER beat (daily, out of combat): when the veterans bar is live
   (wave-4 unlocked, w5 bar unmet) and the party holds < 2, invite
   combatScore-ranked armed companions (non-veterans first, trust >= 20,
   alive), consent-based via Game.inviteToParty. NOT haven-gated: the fire
   is not the only muster point. Never dismisses.
2. FORMATION beat (daily, out of combat): when the party is staged and the
   scholar is on the field, re-glue formal party members whose grid
   positions drifted (missing or > 4 squares) via Game.placePartyAtPlayer —
   the engine has NO per-step party follow (placePartyAtPlayer fires only
   on door/node arrivals), so grid walking silently leaves the party
   behind. Bounded, field only (never pulls anyone through the haven
   door). Design call: the formation discipline — the party keeps up.
3. PATROL beat (upkeep, dawn-gated): when the bar is live, the party is
   staged (>= 1), the scholar is healthy (health >= 65% — a battered
   scholar doesn't go looking for mirrors), out of combat: ONE travelTo
   hop toward the travel target with a world monster on it (wave-4
   preferred). travelTo is narrated engine travel; the arrival re-glues
   the party. Fires from haven too — a dawn departure IS the patrol (the
   scholar sleeps at home; the field-only gate meant the beat never fired
   in the first smoke). No hop when no dangerous target exists.
4. NO fight wrapper: the scholar fights per base policy, the companions
   per the engine. The splitkill discipline stays OFF — its theory is
   dead; this arm tests staging, not the discipline. Finding #790 honored:
   no breakoff, no withdrawal verbs.

Two mechanism bugs caught and fixed pre-pilot (probe-anchored):
- The patrol's battered-guard read `state.scholar.hp` — the state field is
  `health` (hp lives on TB fighters) — so the guard read 0 and blocked all
  72/72 wave-4-live dawns in the first smoke (probe /tmp/probe-patrol.js).
- daily() runs once per day at NIGHT (pre-sleep) in the sim harness, so a
  dawn-gated patrol in daily could never fire — the patrol lives in
  upkeep() (per day-part). Det-gate re-verified byte-identical after the
  move.

## PRE-REGISTRATION (§14 binding — written BEFORE the pilot sweep)

- Design: 8 FRESH seeds (65531-65538, filename-verified 2026-10-22 — 0
  filename hits across evidence/ + scripts/) x {leadfeast, belongfeast} x
  {control, stagemuster} = 32 paired configs, 180d death-aware (dead
  villages stop simulating; the harness breaks on Game.over), on the
  proven non-seat long substrate: FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1
  (VETREL/REPOSITION/VGEAR unset).
- control = AD.armedFor(base), ARMORYDRIVE=1 (weapons in hands + fire-side
  staging — the proven baseline).
- stagemuster = SM.stagedFor(base) = withStagemuster(AD.armedFor(base)),
  ARMORYDRIVE=1 + STAGEMUSTER=1.
- PRIMARY (mechanism, binding): wave-4 TB fights with
  engagedCompanions() non-empty (SM.stagedCompanionsOf per-fight census —
  splitkill's logic: live villager/ally fighters with a villagerId in the
  formal party) on the ARMED side >= 8 across the 16 armed configs.
  GO = met. If ZERO staged across the pilot, KILL AT PILOT: the staging
  channel cannot be manufactured policy-side — document as a mechanism
  finding and stop; killed arms leave no trace.
- DELTA (layer-judging, binding): the redesign must ADD staging beyond
  the fire-side baseline — armed staged fights >= control staged + 4.
  (The baseline stages ~4/config on the confirm corpus; +4 across 16
  configs is a 25% lift bar.)
- SECONDARY (capability, binding, conditional on staging): villager
  wave-4 kills, damage-majority (>= 50% of the kill's fight damage from
  non-scholar sources, kill-time villager-credited — finding (b): report
  both kill-time AND damage-majority numbers) — armed >= control + 2.
- GUARDRAILS (all binding): median survival within ±10d of control
  (non-winning, per-seed matched); starvation deaths <= control + 2; no
  new death mode (>= 2-event rule); scholar-combat-mortality/100d paired
  <= control + 2 (the patrol seeks danger — its cost is bounded);
  wave-4 unlocks armed >= control; no friendly-fire signature.
- A miss is NO-GO — never re-scored mid-run (§14). Metric doubts go under
  "metric review" for the next run.
- Pilot GO-to-confirm = primary AND delta met. The secondary is reported;
  a secondary miss with primary+delta GO is a capability question for the
  confirm to re-measure (kills are rare events; n=8 seeds is thin).
- Instruments: KILLDISC=1 v2 + daily w5-readiness census + stagemuster
  layer counters (SM.tele) + daily bearer <redacted> (kill-time
  attribution) + per-fight staged-companion census. Before/after through
  the balanced panel (scripts/balance-panel.js) per §15 — the panel is
  the instrument, this header is the judge.

## Proof gates (run BEFORE the pilot — scripts/test-stagemuster-20261022.js)

E0 shape (incl. no fight wrapper — base.fight carries through); E1
det-gate (STAGEMUSTER unset -> stagedFor byte-identical to AD.armedFor,
60d x2 bases, ARMORYDRIVE=1 both sides); E2 env-gate; E3 synthetic
RED->GREEN fixtures (muster invites/party-full/wave-4-locked/w5-met,
formation regroup/fresh/haven/combat, patrol hop-from-field/hop-from-
haven/battered/empty-party/no-target/skip, base.upkeep delegation,
gate-off pure delegation of both daily and upkeep,
stagedCompanionsOf census); E4 armed+KILLDISC deterministic; D2 180d
armed run completes + deterministic re-run.

RESULT 2026-10-22 (adoption worker, pinned base 2a3fc56b9, substrate
env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1 with STAGEMUSTER unset — the script sets it
itself for E2b): **33 PASS, 0 FAIL** — ALL GREEN. (One operator note:
running with STAGEMUSTER=1 pre-exported makes E2 "gate off when unset"
fail by construction; the gate is about the unset case and must be run
with it unset.)

## Pilot sweep

COMPLETE 2026-10-22 — 32/32 configs on pinned base 2a3fc56b9, zero
instrument errors, on the pre-registered substrate (FEASTSCALE_R13=1
TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1;
VETREL/REPOSITION/VGEAR unset). The 26/32 inherited corpus was verified
anchor-pinned; the 6 missing configs (65537/65538 x belongfeast x both
arms + 65538 leadfeast x both arms) were run on the pinned base before
any rebase. Corpus: evidence/2026-10-22/perseed-stagemuster/ (32 JSONs).
Panel compare (§15): evidence/2026-10-22/stagemuster-panel-primary.md
(+ .json, before/after panels).

## Pilot results — verdict NO-GO at pilot (not killed: the staging
channel IS manufacturable — see mechanism finding below)

Judge by the binding pre-registration; the panel is the instrument, not
the judge. Numbers from scripts/analyze-stagemuster-20261022.js.

- PRIMARY (mechanism): armed wave-4 TB fights with staged companions
  = 71/76 (control 75/92). Bar >= 8 -> **GO**. The mechanism works:
  the muster/patrol layer puts armed companions into the scholar's
  wave-4 TB fights — 71 staged fights across 16 armed configs.
  (KILL-AT-PILOT rule would have fired at ZERO; 71 is decisively alive.)
- DELTA (layer-judging): armed 71 vs control 75 -> **NO-GO** (bar >=
  control+4). The redesign adds NO staging beyond the armorydrive
  fire-side baseline — on belongfeast the armed side staged FEWER
  fights (29/30 vs control 45/55) and manufactured fewer wave-4
  engagements (30 vs 55).
- SECONDARY (capability): villager wave-4 kills damage-majority armed=0
  vs control=1 (bar >= control+2) -> **NO-GO**. Kill-time credit:
  armed=0, control=6. Wave-4 kills overall: armed=4 (all scholar) vs
  control=22 (6 kill-time villager, 11 scholar... control also has
  w4kills=22 vs armed=4). The armed side manufactures exposure WITHOUT
  kills: staged companions are being fed to mirrors that kill them.
- GUARDRAILS (binding):
  - median survival (non-winning): control=157d, armed=147d; |diff|=10
    <= 10 -> PASS (exactly on the bar; per-seed matched median diff = 0,
    16 pairs). The SHAPE worsened: armed villages died 15/16
    (village-lost) vs control 11/16; survived 1/16 vs 5/16.
  - starvation deaths: control=9, armed=12 -> FAIL (bar <= control+2=11).
  - new death mode: FAIL — "alien" 14, "thirst" 3, "the phoenix link" 5
    on armed, all 0 on control (>=2-event rule). Phoenix link is a
    pre-existing engine mechanic (phoenix ash deaths); it fired only on
    the armed side this run — the armed policy's shape shifts rare-cause
    exposure. Documented as a binding miss, not a root-caused mechanism.
  - scholar-combat-mortality/100d paired diff: +0.80 <= 2 -> PASS.
  - wave-4 unlocks: control=15, armed=15 -> PASS.
  - friendly-fire: no tracked concept in src/js, no death cause naming
    it in either corpus -> PASS by absence (uninstrumented).
- PANEL (§15, instrument): decision=review_required on both policies —
  national regression_watch (leadfeast -0.125, belongfeast -0.25),
  communityLost up (leadfeast +0.375, belongfeast +0.125),
  npcHungry up (leadfeast +0.125). Consistent with the guardrail misses.
- MECHANISM TELEMETRY (armed totals): musterPasses=494,
  musterInvites=64, musterInvitesOk=24, regroups=22, patrolHops=376,
  patrolSkips=14, beatErrors=0. The layer fired heavily — this is not a
  dead channel; it is a channel that does not convert to staging lift
  or kills. Control smTele all zeros (gate off, byte-identical det-gate).

Verdict: primary GO, delta NO-GO, secondary NO-GO -> **pilot NO-GO**.
Per pre-reg, GO-to-confirm needed primary AND delta. The muster/patrol
redesign does not add staging beyond the fire-side baseline and converts
no staging into villager kills. Not killed-at-pilot (mechanism alive).

## Wall numbers

control (n=16): national=11 table=14 won=0 wave4=15 wave5=2 exiled=0
  medSurv=157 maxSurv=181 w5vets2=4 w4kills=22
armed (n=16): national=8 table=14 won=0 wave4=15 wave5=0 exiled=0
  medSurv=147 maxSurv=181 w5vets2=0 w4kills=4
The STAGEMUSTER pilot does not move the scale wall: wins 0 both sides,
wave-5 reached only by control (2), national reached by armed 8/16 vs
control 11/16. The wave-4 door opened (15/16 both); the readiness VETERANS
bar collapsed on the armed side (w5vets2: 4 -> 0; only 4 wave-4 kills vs
22) — the village walks through the door and dies in the mirror room.

## Village assessment (plain words)

The armed villages lived like a militia that keeps mustering for a war it
loses: the party kept forming (494 muster passes, 64 invites, 24 taken),
the formation glue re-seated drifted companions 22 times, and the patrol
made 376 dawn hops toward monsters on the travel map. The staging
mechanism is REAL — 71 of 76 wave-4 TB fights had armed companions in
them, announced ("THE EATER! Lena joins you!") — but the fights read as
funerals. The Eater's attention "SNAPS" to staged companions by proximity:
Lena dies at 82 damage while Wei strikes for 30; the scholar goes down;
the village loses the day. Meanwhile the fire-side baseline (control)
staged MORE fights (75) and its staged companions actually land kills
(6 kill-time villager wave-4 kills, 14 wave-4 kills on belongfeast alone
vs 0 on the armed side). The layer's patrol manufactured danger without
leverage: armed belongfeast had 30 wave-4 engagements vs control's 55 —
the scholar is SEEKING mirrors and finding fewer winnable fights.
Deaths spread into new rare causes (alien, thirst, the phoenix link)
while starvation crept up — the militia posture costs food and water
discipline. The village is busier, braver, and deader.

## Sense test (SENSE-TESTING LAW)

Reproduced staged fight, d114 of seed 65537 belongfeast-stagemuster
(probe /tmp/probe-sense-stagemuster.js — say-lines d110-122, 1164 lines,
58 matched): the patrol/muster staged Lena + Wei into the scholar's wave-4
fight vs THE EATER ("⚔ THE EATER! Lena joins you!"). The fight reads as a
REAL fight with real consequences, not a teleport: Wei patches the scholar
(+12 HP, "Hold still!"), Lena binds the wound mid-fight (+20 HP field
medicine), the Eater's attention visibly targets the companions by
proximity ("Too close. The eater's attention SNAPS to Lena — proximity
overrules patience."), Lena dies at 82 damage ("Someone in your party saw
it happen. Lena is dead. They tell you straight."), Wei keeps fighting
(30-31 strikes, takes 46), the scholar goes down to a Smack-Rush for 37.
Then the village moves on by consent: d114 "🤝 Aroha joins your party.
'Someone should watch your back. Might as well be me.'" and d119 the
rebuilt party takes Spool ("📺 You brought down Spool."). SENSE-PASS on
narration honesty — and the read confirms the mechanism finding: staged
companions act like people who fight, heal, die, and get replaced, but the
fight was NOT winnable with them in it. The staging manufactures witnessed
funerals, not kills.

## Metric review (§14)

- The delta metric (armed staged >= control staged + 4) behaved as
  intended: it caught a layer that stages heavily but adds nothing past
  the baseline. No revision proposed.
- The guardrail "new death mode" fired on rare causes (alien/thirst/
  phoenix link) with n=8 seeds per side. Proposed review for the NEXT
  run: raise the threshold to >=3 events AND consider cross-arm causality
  (a pre-existing mechanic firing only on the armed side may be noise);
  NOT applied this run — the FAIL stands as binding.
- Median-survival guardrail: the absolute-median form (|147-157|=10,
  exactly at the bar) vs the per-seed matched median (0, 16 pairs)
  disagreed; both passed. No revision needed — the matched form is the
  more honest instrument and should be the primary read next run.
- Friendly-fire: uninstrumented on both sides (no tracked concept);
  PASS-by-absence recorded, not proven. A confirm-stage arm should
  instrument companion-vs-companion damage if this layer ever advances.

## Blanks filled / documented

- FILLED (mechanism): the splitkill named-next is answered — staging 1-2
  armed companions into the scholar's wave-4 TB fights IS manufacturable
  policy-side (71/76 staged fights). But the muster/patrol REDESIGN adds
  no staging beyond the armorydrive fire-side baseline (75 staged on
  control). The kill-at-pilot question is resolved: staging cannot be the
  reason the TB-discipline failed — companions ARE in the fights.
- DOCUMENTED (capability, evidence only): staging does not convert to
  villager wave-4 kills — 0 damage-majority villager kills on the armed
  side across 76 wave-4 TB fights; the VETERANS readiness bar collapses
  (w5vets2 4->0). The bottleneck for the scale wall is not getting
  companions into the mirror room; it is what happens once they're there.
  This points at the TB discipline itself (still dead per splitkill) and
  at companion damage output vs wave-4 bands (35-95 dmg, HP 850-1500),
  not at any staging channel.
- DOCUMENTED (finding): new rare death causes on the armed side
  (alien=14, thirst=3, phoenix link=5 vs 0 control) + starvation 12 vs 9
  — the patrol posture's cost is food/water discipline and exposure to
  show-machinery deaths. Added to hidden_files/sim-findings.md as open.
- DOCUMENTED (finding): armed belongfeast produced ZERO wave-4 kills in
  8 configs while control belongfeast produced 14 — policy x layer
  interaction worth noting for the next arm's pre-registration.

## Convergence

Scale-onramp axis: NOT converged. The staging layer (a plausible lever-2
lens on the wall) failed the delta and secondary bars; the readiness
VETERANS bar moved the WRONG way. The wall numbers did not move (wins 0,
wave-5 0 on armed, national down). Next on this axis: the TB-discipline
gap is still the open wound — staging exists; killing doesn't. (The next
arm should instrument companion damage-vs-wave-4-bands first, then test
a fight-level intervention, not another staging channel.)

## Sense test (SENSE-TESTING LAW)

Pre-pilot transcript (probe /tmp/probe-fight-transcript.js, seed 65532
belongfeast, STAGEMUSTER=1): two staged wave-4 TB fights vs The Eulogy
(d77 with Ella + Vasyl, d85 with Vasyl + a villager) read as REAL fights
with consequences, not teleports. The Eulogy's signature narration beats
fire (verses counting down to the Final Chapter); companions act like
people — "Vasyl strikes the Eulogy", "Ella strikes the Eulogy", "Vasyl
patches you up (+12 HP). 'Hold still!'", "Vasyl stops mid-fight and binds
the wound — field medicine, +20 HP", "Ella winces. 'You're bleeding!'"
The scholar goes down in both fights to the doom narration ("...they
ended. The last line lands like a lid."). The patrol manufactured the
encounters; the staging put armed companions in the fight; the fights had
costs. SENSE-PASS. (Minor: "Vasyl strikes the Loud-Eyes" then "Vasyl hits
eulogy" — a naming quirk, documented not fixed.)

## Metric review (§14)

- The delta metric (armed staged >= control staged + 4) behaved as
  intended: it caught a layer that stages heavily but adds nothing past
  the baseline. No revision proposed.
- The guardrail "new death mode" fired on rare causes (alien/thirst/
  phoenix link) with n=8 seeds per side. Proposed review for the NEXT
  run: raise the threshold to >=3 events AND consider cross-arm causality
  (a pre-existing mechanic firing only on the armed side may be noise);
  NOT applied this run — the FAIL stands as binding.
- Median-survival guardrail: the absolute-median form (|147-157|=10,
  exactly at the bar) vs the per-seed matched median (0, 16 pairs)
  disagreed; both passed. No revision needed — the matched form is the
  more honest instrument and should be the primary read next run.
- Friendly-fire: uninstrumented on both sides (no tracked concept);
  PASS-by-absence recorded, not proven. A confirm-stage arm should
  instrument companion-vs-companion damage if this layer ever advances.

## Blanks filled / documented

- FILLED (mechanism): the splitkill named-next is answered — staging 1-2
  armed companions into the scholar's wave-4 TB fights IS manufacturable
  policy-side (71/76 staged fights). But the muster/patrol REDESIGN adds
  no staging beyond the armorydrive fire-side baseline (75 staged on
  control). The kill-at-pilot question is resolved: staging cannot be the
  reason the TB-discipline failed — companions ARE in the fights.
- DOCUMENTED (capability, evidence only): staging does not convert to
  villager wave-4 kills — 0 damage-majority villager kills on the armed
  side across 76 wave-4 TB fights; the VETERANS readiness bar collapses
  (w5vets2 4->0). The bottleneck for the scale wall is not getting
  companions into the mirror room; it is what happens once they're there.
  This points at the TB discipline itself (still dead per splitkill) and
  at companion damage output vs wave-4 bands (35-95 dmg, HP 850-1500),
  not at any staging channel.
- DOCUMENTED (finding): new rare death causes on the armed side
  (alien=14, thirst=3, phoenix link=5 vs 0 control) + starvation 12 vs 9
  — the patrol posture's cost is food/water discipline and exposure to
  show-machinery deaths. Added to hidden_files/sim-findings.md as open.
- DOCUMENTED (finding): armed belongfeast produced ZERO wave-4 kills in
  8 configs while control belongfeast produced 14 — policy x layer
  interaction worth noting for the next arm's pre-registration.

## Convergence

Scale-onramp axis: NOT converged. The staging layer (a plausible lever-2
lens on the wall) failed the delta and secondary bars; the readiness
VETERANS bar moved the WRONG way. The wall numbers did not move (wins 0,
wave-5 0 on armed, national down). Next on this axis: the TB-discipline
gap is still the open wound — staging exists; killing doesn't. (The next
arm should instrument companion damage-vs-wave-4-bands first, then test
a fight-level intervention, not another staging channel.)
