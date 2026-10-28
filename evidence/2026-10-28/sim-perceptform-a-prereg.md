# sim-perceptform-a preregistration (BINDING — committed BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T1942Z, axis scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-perceptform-a.
Mechanism: perception-based formation — the wild router passes
allyFromStart=true ONLY for a perception-legitimate ally.

## The change, in plain words (game code, src/js/game.js only)

A wild field fight currently never starts as a party fight: the wild
router (resolveWildMonsterEncounter / resolvePatrol) never passes
allyFromStart — only aidFight sets it — even when a crew-mate stands
on the monster's tile (proven: earlycrew-a 0/19 from-start, 5/19
perception-legitimate, 0 fought; shoutgate-a formed 12/14 parties
that all retreated; forming is not fighting). This arm adds the
missing from-start rule, fed by perception only:

1. CO-DEPARTURE STAMP (new, minimal). In resolveAssignments, at the
   same point the engine already snapshots _outdoorCrew and rebuilt
   every part exactly like it: for each villager holding an outdoor
   assignment (patrol/scout/hunt/forage) in the pre-resolution
   assignments, record on Game._coDepart[vid] = {day, part, task,
   partners} where partners are the OTHER assignees holding the
   SAME task in that same snapshot. Villagers with no outdoor
   assignment that part get no entry; the rebuild clears stale
   entries. The stamp records DEPARTURE only — who walked out
   together, in the leader's own record. It never says where
   anyone is now, and it is never read as presence.
2. PERCEIVED-ALLY RULE (new helper, used by both wild routers).
   perceivedFromStartAlly(vid, m) reads ONLY vid's own stamp entry
   and, for each partner in stamp order, checks that single named
   person: still on the roster, not known dead, and a PURE nodePos
   read (never npcNode(), which creates default entries) equal to
   the monster's tile (m.tx, m.ty). The first partner passing all
   three is returned, else null. No trust gate, no gear gate, no
   adjacent/earshot radius — same tile only, same person only.
3. ROUTER WIRING (both wild routers, non-aid path only). If a
   perceived ally exists, fieldFight is called with
   allyFromStart=true and allyVids=[perceived, ...crew minus
   perceived], allies count unchanged from base. If none, the call
   is byte-identical to base. The aid-crisis path is untouched
   (aidFight sets its own flag). The pre-existing crew list
   survives ONLY in the untouched hopeless-shout fallback; from-
   start eligibility NEVER reads _outdoorCrew.

FORBIDDEN, and not used as the source anywhere in this change:
the _outdoorCrew snapshot, any roster/list scan of "who is
around", the fieldfeed presence feed used as a list, any
tile-pair preference. The stamp is per-person departure memory;
the tile check is a single named-person position lookup, not a
scan. If the audit (below) shows any counted join sourced from
anything else, the verdict is NO-GO.

This is a reachability fix under the gating freeze as clarified
2026-10-28 09:14 CDT (stability while villager rationality is the
work, not a ban on reachability fixes): it changes who fights
together, not any gate number. No monster stat, wave gate, table
gate, spawn rate, shout gate, or damage number changes.

## Canon

- docs/CANON.md read first; docs/PARTY.md (party system) read.
  No canon doc covers the wild-router from-start flag itself;
  the design record is the fieldFights.js PARTY-UP comment
  (Steve 2026-10-09) plus the aidFight from-start precedent
  (comms.js: "they came to fight, not to watch").
- PERCEPTION LAW (Steve 2026-10-28 12:48 CDT): villagers know
  who is around only through their own senses — seeing someone
  in the same place, hearing a shout, following someone they
  have seen. No global roster or "who is around" list fed into
  a decision. This arm complies by construction (above): the
  ally is a remembered outing partner the fighter can SEE on
  the tile, not a list feed. The field-feed fix stays reverted;
  no list feed is revived.

## Substrate (measurement only, deleted at closeout whatever the verdict)

- Seeds, policy, flags: tableseat-nowait verbatim PLUS the
  earlycrew joint-foraging-pair policy (EARLYCREW=1) restored
  VERBATIM from branch history (commit 134bc0dbd, hash-verified
  identical) as the measurement substrate on BOTH bands,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, 180d
  death-aware, competent policy. The substrate policy is a
  NO-GO variant from a prior arm, restored for measurement
  only; it NEVER lands, and is DELETED at closeout.
- Why pairs on both bands: the stamp needs villagers who
  walked out together; without the pair substrate there is no
  same-outing class to judge. The control band therefore
  differs from the armed band ONLY in game code (stamp +
  router wiring), never in policy.

## Primary metric (binding)

- JUDGED SET (identical to outdoorcrew-a / earlycrew-a): wave 4,
  channel field, caller resolve / patrol / aid, leader a
  villager (not the scholar).
- PARTY-AT-START-PERCEIVED: a judged meeting with
  allyFromStart=true AND joinedAllyVid equal to a stamp partner
  of the leader whose pure nodePos at fight time equals the
  monster tile — i.e. same outing + same tile + same person,
  all three, audit-passing (see audit leg).
- PRIMARY: PARTY-AT-START-PERCEIVED >= 2 OR >= 1 wave-4 field
  kill on the judged set.
- GO THRESHOLD: primary met AND floor met AND guards met AND
  audit clean (below). A miss is NO-GO, never re-scored
  against a friendlier metric mid-run.

## Meeting-floor leg

- Judged < 4 → INSUFFICIENT-OPPORTUNITY (neither GO nor
  NO-GO). Judged >= 4 → the band judges the mechanism, not
  the opportunity.

## Guards (RELATIVE bars — declared here, per the 1736 metric note)

- Armed median survival >= 0.8 × this run's own control median.
  The absolute 120d bar is NOT pre-registered: it is unpassable
  on this band (the 1528 control median is 146d but the
  outing-substrate control median was 118d in earlycrew-a, and
  wins end runs, pulling medians down). Absolute medians are
  reported alongside for every band.
- Armed starvation deaths <= control starvation + 2.
- No wave-5 unlock claimed (wave 5 is not the metric here).

## Perception-legitimacy audit leg

- The analyzer prints, for EVERY counted PARTY-AT-START-
  PERCEIVED meeting: leader, joined partner, stamp day/part/
  task, monster tile, partner nodePos at fight time, and the
  three checks (same-outing / same-tile / same-person).
- Any allyFromStart judged meeting that FAILS any audit check
  is excluded from the primary count AND caps the verdict at
  NO-GO (mechanism invalid — a join sourced from anything but
  a seen outing partner). Audit-failing meetings are listed,
  never hidden.

## Control gate (judged BEFORE the armed band is judged)

- Control band = substrate + BASE code (no stamp, no router
  wiring), seeds 75101–75108, run BEFORE the game edit.
- Control must reproduce the 1528Z control SHAPE: every judged
  field meeting solo (party-at-start 0, fought-as-party 0)
  and field kills 0. If it does not, STOP and report the
  divergence; do not judge the armed band.
- Control's perception-legitimate count is reported under the
  earlycrew definition (crew ∩ tile, same person) for
  comparison, since base code carries no stamp.

## Bands

- PILOT: seeds 75101–75108, control (base code) then armed
  (stamped code), identical seeds/substrate.
- CONFIRM (ONLY on pilot GO): 12 fresh seeds 75117–75128,
  each with its own substrate+base-code control on the same
  seeds (game files swapped to base with hash verification,
  as fieldfeed-a did). Freshness verified before this prereg
  commit: no 75117–75128 seed appears in any
  evidence/2026-10-28/*.md file or any 2026-10-28 perseed
  corpus filename (75109–75116 are already used by fieldfeed
  confirm and are NOT reused). Confirm GO requires the
  primary + floor + guards (vs its own control) + audit
  clean on the confirm armed band. Pilot GO without confirm
  GO = pilot-GO-only → REVERT, as fieldfeed-a.

## Sense-testing law

- Read a transcript/replay of at least one formed party fight
  and judge meaning, coherence, consequences — never just
  counts. Record party composition and gear in formed parties
  (Steve 2026-10-28 wave-4 demand: party + fully outfitted
  gear; a solo-scholar fight is never claimed as the demand
  met).

## Wall numbers (reported for every band)

National ever/final, table invited/entered, wins (lesser/full),
wave-4/5 reach, median survival, death-cause shares.

## Panel (§15)

Standing exception as in 1415Z/1528Z/1628Z/1736Z:
scripts/balance-panel.js has no census-ingest mode, so the
identical-seed before/after corpora are the §15 substitute.
No panel artifact is fabricated and no panel verdict claimed.

## Kill discipline

- If NO-GO (including pilot-GO-only): revert ALL game code,
  delete the substrate policy file, leave evidence +
  instruments + corpus only (zero src/js diff).
- If GO (pilot + confirm): land as game code only, with
  [needs-eyes] in the commit message (this arm changes
  visible fight outcomes). The substrate policy is still
  deleted — it is measurement, not landing.

## Metric review (filled at judging time, never mid-run)

- (to be filled at judging time)
