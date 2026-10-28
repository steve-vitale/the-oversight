# sim-shoutgate-a — PREREGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout loop, axis scale-onramp (blocking axis). Worker:
sim-shoutgate-a. ARM 1, game-code: the shout/hopeless gate that
stops wave-4 field parties from fighting.

## Background (measured, not guessed)

- 1528Z: wild/patrol meetings never saw the party on the tile.
- fieldfeed-a (1628Z): a presence feed formed 4 wave-4 field
  parties of 9 judged on pilot (all retreated), 0/7 on confirm —
  fed fights ended in round 1 before the round>=2 shout branch,
  or were earshot-empty. Change reverted (pilot-GO-only).
- outdoorcrew-a (1628Z): a joint-outings policy fed 633/907
  meetings, but 0/19 judged wave-4 field meetings formed — all
  ended rounds 1–2 with everHopeless false, so the hopeless-shout
  branch never fires at wave 4. At wave 3 the same crew path
  formed 8/16 (rounds 3–5, hopeless fired, all then fled).
- Mechanism (fieldFights.js, read before designing): the morale
  block runs only at round>=2; a round-1 death preempts it
  (vHp<=0 break precedes morale) and a round-1 break-line flee
  follows it, so a villager mauled in the first exchange never
  gets to shout. When hopeless IS evaluated at wave 4 it is
  trivially true (party DPS ~16/round vs 700–1500 HP solo
  beasts; mBreak 0.15 needs 85% of lead HP for mFlee), so the
  binding gate is evaluation TIMING, not the hopeless formula.
  No canon doc covers the shout gate itself (docs/PARTY.md is
  the player-party system, not the wild shout); the design
  record is the fieldFights.js PARTY-UP comment (Steve
  2026-10-09: "when the trajectory turns hopeless and help is
  near, they shout instead of scattering"). This arm preserves
  that rule and only opens the shout earlier — it does not
  invent a new system.

## The change (one small game-code change, gate only)

FIRST-EXCHANGE SHOUT in fieldFights.js: at round 1 only, if the
first exchange already satisfies the existing hopeless formula
(rtd < rtk*0.85, same trick-aware suppression) AND the
villager is already below half health (vHp < 0.5*vHpMax) AND
allies are present under the EXISTING shout conditions
(allies>0, allyVids remain, intent!=='learn'), fire the
existing shout branch (same log line family, same single-ally
join, same trust bump). NOT changed: the round>=2 morale
block, the hopeless-alone flee branch (no new round-1 flee),
the learn-withdrawal, the break-line flee, monster stats,
wave gates, table gates, spawn rates, and everything that
populates allyVids. NOT a new feed, NOT a new system.

## Perception-law note (Steve 2026-10-28 12:48 CDT, landed mid-run)

Steve's NO MAGIC LISTS / PERCEPTION LAW: villagers know who is
around only through their own senses; no global roster or
"who is around" list fed into a decision; the field-feed fix
stays reverted; list-feed arms stop. This arm's relationship
to that law, stated before measuring:
- The gate change itself adds NO list, NO roster read, NO new
  feed: it only changes WHEN the existing shout fires. The
  shout is itself a perception channel (hearing).
- The measurement substrate (below) is scaffolding ONLY: the
  outdoorcrew policy (a NO-GO, deleted policy variant,
  restored from branch history for measurement) populates the
  engine's pre-existing crew snapshot so the gate has fed
  meetings to be judged on. It is DELETED at closeout whatever
  the verdict, is NOT proposed to land, and no landing claim
  is made for it.
- Whether a landed gate fix is compatible with the perception
  law as a whole (allyVids still comes from the engine's crew
  snapshot upstream) is a coordinator/Steve call, recorded
  here, not decided by this arm.

## Substrate (verbatim shared band + measurement feed)

- Seeds pilot 75101–75108; confirm 75109–75116 ONLY on pilot GO.
- tableseat-nowait verbatim, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, 180d death-aware, competent
  policy + outdoorcrew layer (OUTDOORCREW=1) as measurement
  substrate on BOTH bands (control = substrate + base gate,
  armed = substrate + fixed gate, identical seeds).
- Control band runs BEFORE the game edit (base code), so the
  control is uncontaminated; the armed band runs after. The
  only code diff between bands is the gate fix (verified by
  git diff --stat before the armed band).
- Det-gate: control seed 75101 must reproduce outdoorcrew-a's
  75101 row (92d, won lesser, wave 4) — the restored policy
  plus unchanged base code must replay identically. If it
  does not, stop and investigate before any armed run.

## Judged set (identical to outdoorcrew-a)

Wave 4, channel field, caller resolve/patrol/aid, leader a
villager (not the scholar). Per meeting:
- CREWED = filtered crew non-empty (crewRaw minus leader).
- FORMED = CREWED and calledHelp true OR joinedAllyVid
  non-null (predecessor definition, for comparability).
- FORMED-STRUCK = FORMED and allyDealt > 0 (the ally actually
  struck; guards against shout-then-flee inflation).
- NON-RETREATING FOUGHT PARTY = FORMED-STRUCK and outcome in
  {vKill, mFlee} (the monster died or fled; the party did not
  retreat; vDie excluded — death is not a fought success).
- FED-NO-SHOUT = CREWED and not FORMED, reported split by
  fight-end round (1 / 2 / 3+) AND everHopeless (true/false).
  This split is a REQUIRED report section whatever the verdict.

## PRIMARY METRIC + GO THRESHOLD (binding)

PRIMARY: at least 1 non-retreating fought wave-4 field party
OR 1 wave-4 field kill on the pilot band.
GO requires ALL of: primary >= 1, guards pass, judged >= 4
(meeting-floor leg below).

## MEETING-FLOOR LEG

If judged wave-4 field meetings < 4 on the pilot band, the
verdict is INSUFFICIENT-OPPORTUNITY — not GO, even if the
primary count is >= 1 on a thin band, and not NO-GO either:
the band is under-powered, not a failed gate. A thin band
cannot fail or pass a working gate on opportunity alone.

## GUARDS (all must pass for GO; task-specified bars)

- Median survival >= 120d.
- Starvation deaths <= 3.
- No wave-5 unlock claimed (wave 5 is not the metric here).

## SECONDARY (reported, never re-scored against)

FORMED count, FORMED-STRUCK count, FED-NO-SHOUT breakdown,
crewed rate all-waves, wave-3 formed contrast, field kills by
channel, party outcomes, wall numbers (national ever/final,
table invited/entered, wins lesser/full, wave-4/5 reach,
median, deaths, starvation), sense note.

## VERDICT RULES (no re-scoring)

- GO (pilot) → run confirm band 75109–75116 (own control);
  LAND only if confirm also passes primary + guards.
- Primary 0 + judged >= 4 → NO-GO (sub-class from the
  FED-NO-SHOUT breakdown: FED-NO-SHOUT if crewed-unformed
  dominate, else as the breakdown shows).
- Primary >= 1 but guard fail → NO-GO.
- Judged < 4 → INSUFFICIENT-OPPORTUNITY.
- On NO-GO or INSUFFICIENT-OPPORTUNITY: REVERT the game change
  fully before the final commit, DELETE the outdoorcrew
  substrate policy and the proof test for the reverted
  feature (proof lives in git history), leaving instruments +
  evidence + corpora only — the fieldfeed/outdoorcrew
  NO-GO discipline.
- On GO: the game change lands as its own commit with
  [needs-eyes] (combat feel change); the substrate policy is
  still deleted (it never lands).

## CONTROLS TO BEAT (1528Z/1628Z, quoted, not recomputed)

Field meetings 24 all solo, field kills 0, wall natEver 7/8,
wins 3/8 all lesser, full 0/8, wave-4 6/8, wave-5 0/8, median
146d. Direct comparator: this arm's own control band
(substrate + base gate), expected to reproduce outdoorcrew-a
(19 judged, 0 formed, median 118d, starvation 1).

## PANEL NOTE

scripts/balance-panel.js has no census-ingest mode (standing
exception as in 1415Z/1528Z/1628Z); paired before/after tables
(control band vs armed band, identical seeds) are the §15
substitute. No panel artifact faked; the panel verdict, if
runnable on any applicable input, will be reported honestly
including any invalid/quirky result.

## SENSE-TESTING LAW

Read at least one field-fight transcript from the armed band
(a formed meeting if one exists, else a FED-NO-SHOUT meeting)
and judge meaning, coherence, consequences — not just counts.
