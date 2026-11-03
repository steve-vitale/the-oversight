# PREREG — WINNABILITY PUSH TRACK 2: intelligence that plays to win
Date: 2026-11-03. Author: Track 2 (win-intel). Base: master at registration time (note actual hash in proof output; sibling arms win-allyjoin / win-drives NOT merged in).

## Question
Do villagers THEMSELVES execute a winning gameplan — party before a hard fight,
gear-check before a wave-4-class beast, seek veteran kills when ready, avoid
unwinnable fights when not ready, build standing on purpose, prepare for the
table — or do they still wander into hard fights solo and under-geared?

## Design (summary; full code comment in src/js/win-plan.js)
Per-villager plan state, NOT a central planner and NOT a scored-rule pile:
each villager carries one ordered plan (gear -> party -> hunt -> standing ->
table). A stage advances only on that villager's OWN events (their gear after
gear-up, a trusted villager they can SEE at Haven, a beast THEY fought/fled,
a kill THEY banked, a System hold/release beat broadcast at Haven while they
are there). Each stage's action is the next stage's precondition, so the
stages compose into a gameplan instead of firing independently.
Perception law: party = self + villagerFightAllies(vid) only (co-tasked or
co-located, trust-ordered); beast strength judged from the beast in front of
them (its bulk/speed in its def) vs the party's SEEN gear; no roster scan,
no global snapshot, no panel read anywhere in a villager decision.
Gating freeze: no standing thresholds, deed gates, readiness numbers, or win
prices change. No second ally-join trigger: party formation feeds the
existing villagerFightAllies / fieldFight opts path (and Arm 1's live-sensing
router when it lands); this track only decides WHEN villagers gather.

## Hooks (all in existing decision points)
1. agencyTick departure: a villager on a win plan is gear-gated (holds the day
   if still weaponless AND armorless after gear-up), party-gated (a veteran
   or a hunter with a known hard target does not depart solo when a trusted
   co-located villager could go with them — the companion is launched on the
   SAME target, so they travel together and the fight engine can find them),
   (hunt/standing-staged villagers depart on the normal chance roll —
   their protection is the fight gate, and seeking requires a party
   present; only the party stage waits, bounded to 3 days, and only a
   table-stage veteran's solo departure is guarded, bounded to 7 days —
   no villager is ever held forever by a plan).
2. expeditionMonster pre-fight: party-strength estimate vs the beast in front
   of them. Unwinnable + not ready -> avoid (no fight, plan falls back to
   gather, counted). Ready + seeking (needs a veteran-class kill they heard
   the village lacks, or standing-staged hunting wave-3+) -> seek contact
   (awareness evade skipped: they walk in on purpose, counted).
3. expedition outcomes: a flee/hurt against a hard beast seeds a gather plan
   for that species/node; a qualifying kill advances hunt -> standing; a
   wave-5 hold/release beat heard at Haven advances standing -> table, and
   living veterans in table stage are guarded (no solo hard departure).

## Proof: decision panel (identical seeds, before/after)
Script scripts/test-win-intel-20261103.js, seeds 11,22,33,44,55,66,77,88 (run once per fixture per seed as separate processes; a driver aggregates)
(8 seeds; each seed loads a fresh game via sim-harness, fixture villagers
placed by hand, then drives the REAL decision code — no mocks of the gate):
  A. PARTY: fighter + trusted ally co-located at Haven, fighter holds a
     gather plan for a hard beast -> departure launches BOTH on the same
     target (partyDepartures +1) and a later fight on that node carries
     allyVids.
  B. GEAR-HOLD: plan villager with no weapon and no armor after gear-up
     (empty own stash, empty armory, wood <=3 so no whittle) -> departure
     held that day (gearHolds +1), villager still at Haven.
  C. AVOID: solo, unarmored, unarmed villager meets a wave-4-class beast
     (gavel-class HP/damage) with no sensed allies -> no fight started
     (avoidances +1, fighter alive, plan back to gather).
  D. SEEK: geared + partied villager who has heard a defer beat (state
     defer-beat set, villager at Haven) and banks no qualifying kill yet,
     meets a wave-3+ beast -> fight starts despite awareness (seekContacts
     +1, awareness evade skipped).
  E. VETERAN-GUARD: living wave-4 killer in table stage, alone at Haven,
     hard target -> solo departure held (veteranGuardHolds +1); with a
     trusted party co-located -> departs with party.
  F. STANDING-ON-PURPOSE: standing-staged villager departs on an expedition
     (not a casual forage) and seeks contact with a wave-3+ beast they meet
     (same mechanism as D, counted separately as standingContacts).
  G. CONTROL (no regression): a geared solo villager with NO plan meeting a
     wave-1 beast behaves exactly as before (fight proceeds through the
     existing awareness path; no plan counters move).
Pass bar: A,B,C,D,E,F each fire on >=6/8 seeds after, 0/8 before (before =
master code, where the winPlan API does not exist so every counter is 0 and
departures/fights follow the old paths); G unchanged before/after.
Counts are read from village.winPlanStats, written by the game code itself.

## Funnel check (secondary, not the pass bar)
Where the decision panel moves a chain stage, report it: partyFights and
veteran-relevant kills in the panel fixtures, plus a short organic smoke
(fresh game, 30 days via runDays, no crash, no run dying) in the worktree.
A full 180-day competent panel is NOT re-run here: it costs ~19 min / 8 seeds
and the funnel wall (readiness-5 release) is Track 1 / national's to move;
this track's claim is the DECISION, proven where the decision lives. If the
decision panel passes but the organic smoke shows a regression (runs dying,
departures collapsing), the landing is held.

## What is NOT claimed
- No central planner is built. If the ordered-stage composition fails to
  sequence in the panel (e.g. stages advance but departures never pair),
  that is reported as held-with-evidence for a planner decision, not papered
  over with a scheduler.
- No gate/price change. If a gate proves to be the blocker in the funnel
  check, it returns as a Steve decision with evidence.

## Addendum: BONDS DRIVE (Arm 4 natwindow blueprint, villager-side)
Added 2026-11-03 after Arm 4 landed (policy only, no game code). The bot
policy's leg (tend weekly at trust<50 when pantry-days>=3; stand down a
>=3-day-old hungry muster when weakest primary link <55) is the blueprint;
the villager version reuses the same verbs and bars but decides through
villagers: tend actor = a plan-holder home at Haven; stand-down actor =
a plan-holder home at Haven who is committed to the muster themselves.
Inputs: Haven's OWN primary links, OWN pantry-days, the OWN herald
muster and the hunger bleed on the OWN links' histories (plus the
pantry-days<3 hunger proxy), OWN scale flags. No other village's state,
no roster scan (actors come from the plan-holder set), no titan-call
readiness. Costs real: 1,500 pantry kcal per tended link per week
(tendLink's own weekly dedup); stand-down costs -5 per allied link and
abandons the titan road for the run. No gate/threshold/price changes.
Fixtures (same seeds, same driver):
  H. TEND: two marginal primary bonds (trust 42/45), pantry 100,000 kcal
     (4 days), plan-holder home -> both tended in the week (bondTends
     +2, trusts 42->50 / 45->53, tendedWeek stamped); then a third
     marginal bond with pantry nearly bare -> no tend (phase2Tends 0).
  I. STANDDOWN: two seasoned primary bonds (trust 45/48, day-40),
     5-day-old herald muster with a muster-hunger history entry,
     weakest <55, actor committed + home -> muster stood down
     (musterStanddowns +1, muster null, allied link 45->40); then
     rebuilt muster with weakest link at 60 -> muster stands
     (phase2Standdowns 0).
Pass bar H/I: >=6/8 seeds after, 0/8 before (before = master code, where
the bonds ticks do not exist). Bugs the panel caught (kept in the
record, not hidden): (1) the first after-run read all counters as 0
because the panel snapshot held the LIVE stats object — behaviors had
fired, the snapshot aliased; fixed by copying stats by value, after
which the original 7 fixtures pass 8/8. (2) The stand-down actor
search excluded engaged villagers, and muster-committed villagers
count as engaged (isEngaged covers titanCommitted) — so no actor ever
qualified; fixed by allowing engaged actors for the muster tick only,
since commitment is the qualification there.

ADDENDUM 2 — funnel verdict + trick gate + engagement + partial-launch
fix (2026-11-03, after the after2 panel, before the after4 panel).
Funnel verdict (evidence/2026-11-03/sim-winfunnel-a.md, master
e9de0bcd5): arms 1+2 moved the MECHANISM (wild ally-join 0 -> 77.0%,
1137/1476 field fights with an ally) but NOT the funnel — veterans
banked, readiness-5 releases, wave-5 unlocks and facings all still
1/20, wave-5 kills 0/20. Binding constraint still the veterans bar:
2 villager kills in 83 wild wave-4 fights (21 deaths, 55 flees).
Implication taken up here: fight SELECTION and readiness judgment,
not more join/damage mechanics. Two watch items carried, not built:
(a) 104/1476 field fights (7.0%) never consulted the sensing helper
and carry no allies — flagged as a possible arm-1 router follow-up,
the router is NOT rebuilt here; (b) median survival descriptively
fell 110.5d -> 92d with all 20 after-runs ending village-lost, so
any drive that changes fight frequency must watch survival — the
smokes below are that guardrail check.
  J. TRICKHOLD: full party (fighter + 2 sensed allies, all geared),
     hunt plan on a wave-4 beast, village does NOT know its trick ->
     no forced contact (trickHolds +1, seekContacts 0, awareness
     true if the ordinary encounter fights). K. TRICKSEEK: same
     setup with the trick known (state.villagerTricks) -> seek
     (seekContacts +1, awareness false). Why: the field fighter
     opens with the trick on round 1 only when the village knows it
     (villageKnowsTrick: ledger counter or two survived
     observations); a trick-less wave-4 fight is the funnel's flee
     pattern. The gate withholds SEEK only — ordinary encounters
     still happen, and surviving one (flee/evade) teaches the trick
     after two observations, so no plan strands waiting for
     knowledge it can never earn. No gate/threshold/price changes.
  L. ENGAGE (motivated by the smoke, not the fixtures): a geared
     ranger at Haven with no plan, whose village has a slain kill
     to talk about (villageSlain, the deed-talk channel) or who has
     personally fought a beast (agency know.fought) -> Haven tick
     seeds a gear-stage plan and advances it to party in the same
     tick (planSeeds +1, stageAdvances +1). Before this, plans
     only started from surviving a wave-3+ beast, and the first
     30-day organic smoke ran with ZERO plans and ZERO counters —
     the whole system dormant. Fixtures seed plans by hand, so
     they could not have caught this; the smoke did.
  M. PARTIAL (motivated by the 180-day smoke): party launch with a
     SICK companion -> hold, nobody away, invites 0, departures 0.
     Before the fix the inviter launched first and a hurt/sick
     companion's startExpedition returned early after the inviter
     left: 2 invites, 0 departures, inviter solo. Fix: the
     companion's launchability (sick, range, and the sit-out
     predicate — hurt under 70 HP with no medicine and no healer)
     is checked as a pure read BEFORE the inviter launches; the
     heal itself still happens exactly once inside
     startExpedition, so no double-spent medicine.
Pass bars J/K/L/M: >=6/8 seeds after, 0/8 before (before = master
code, where none of these exist; the engage/partial fixtures
report apiPresent false on master).
Organic smokes (seed 11, competent policy, smoke script with repo
override for the master control):
  30d worktree pre-engagement: survived, 28 deaths, ALL win-plan
     counters 0 — the dormant-system finding.
  30d worktree post-engagement: survived, 18 deaths, planSeeds 2,
     stageAdvances 2, partyWaits 10 — drives live, no crash.
  180d worktree pre-partial-fix: village lost day 66, 36 deaths,
     invites 2, departures 0 — the partial-launch finding.
  180d worktree post-partial-fix: village lost day 72, 38 deaths,
     planSeeds 3, stageAdvances 3, partyWaits 26, invites 0,
     departures 0 — no partial launch, waits absorb the cases.
  180d master control, same seed: village lost day 161 (75
     deaths), then day 148 (73 deaths) on an identical repeat run
     — the control itself varies run to run, so single-seed day
     counts support NO regression claim either way; the guardrail
     reading is no crash, no instant die-out, deaths not above
     the control band. Open observation, not a blocker: on this
     seed no paired launch completed in 180 days — a launch needs
     a trusted (trust>=15, the party-wiring floor), co-located,
     geared, healthy ranger pair at the same tick, and that
     coincidence never landed; loosening it would be a balance
     change needing its own panel, so it is reported, not tuned.
