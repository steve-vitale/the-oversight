# sim-partyfinish-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0836Z. Axis: scale-onramp
(the blocking axis). Worker: sim-partyfinish-a. Worktree:
`~/workspace/worktrees/sim-partyfinish-a` (branch sim-partyfinish-a).
Base: master at worktree creation (8e26af922; includes the lingerfinish
NO-GO evidence and the world-HP TB rule).

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; "Monster
  encounters are fought, not rolled", Steve 2026-10-08 — the sortie
  fights below are real blow-by-blow fieldFights, never outcome
  tables; wave-4 demand is standing-gated, and the readiness bars
  in standing.js name armored/armed/tricks/veterans as live village
  state).
- No canon invented. This arm changes no canon doc, no gating
  number, no deed bar, no wave-unlock number, and does not touch
  TABLE.md. Sibling-loop files (sim-calmbeast-b, sim-wave4flip-b)
  are never touched.

## Background this arm answers (read, not re-run)

- evidence/2026-10-28/sim-lingerfinish-a.md: a wound-selective
  policy acted (11 sorties, 19 cleared, 26 marches) but villager
  field finishes stayed 0 -> 0, because 18/20 sortie fights end
  with the beast fleeing in zero rounds, even at 1 HP.
- evidence/2026-10-24/sim-fieldfinish-a.md: a wave-2+ monster below
  15% max HP flees before the first strike (round 0); wounds
  persist, so later meetings repeat the zero-round flight.
- Round-0337 ffhold / ffnoflee arms (evidence/2026-10-24/
  sim-scale-onramp-round-0337.md): both KILLED at pilot. ffhold
  (skip the post-volley break-flee for ANY arrival-below-line
  fight) moved kills 0 -> 4 but median survival 150d -> 98d and
  wave-3+ field deaths 6 -> 15. ffnoflee (no break-flee in any
  field fight) moved kills 0 -> 8 but median 150d -> 86d and
  national-ever 8/8 -> 0/8. Lesson, binding on this arm: an
  unconditional hold trades stalemate for blood, because it
  applies to chance meetings by solo villagers too. This arm's
  mechanism is therefore scoped to DELIBERATE, MUSTERED,
  PAID sorties only — never to wild chance meetings.
- A policy-only repeat of lingerfinish is a KILLED result by
  the task brief and is NOT run here. The judged change is the
  game-code mechanism below; the policy is only its driver.

## Standing rulings applied (not suggestions)

- Steve 2026-10-27: defenders weigh scenario risk and finish a
  crippled beast they meet IF THEY CAN — risk-weighted finish,
  NOT unconditional. This arm implements that literally: the
  policy only sorties when the treeline is weak (gates below),
  and the mechanism only holds the beast for round 1 (the
  in-round break check, vFlee, vDie, and signature paths all
  remain). Nothing here forces a fight to the death.
- Steve 2026-10-28 02:54 CDT (wave-4 demand): wave 4 should
  demand parties and fully outfitted gear, not solo or
  under-equipped play. A solo-scholar finish does NOT count
  toward GO. Every counted finish must be by a party of 2+
  fighters with gear recorded (definition below).

## The mechanism (game code, stated before it is written)

Two edits, and only these two, in the field-flee/finish path:

1. src/js/havenGrowth.js, lingererSortie(): the fieldFight call
   passes opts.cornered = true alongside the existing
   { allies, allyVids }. Sortie construction already guarantees
   the cornering facts: muster >= 2 (leader + >= 1 ally, else
   no-fighters), a day's rations per fighter paid from the
   pantry, at the home treeline, deliberate. NO other caller
   sets cornered: wild meetings, patrols, aid fights, raids,
   contests, and the scholar's TB marches are all untouched
   and keep the free break-flee exactly as before.
2. src/js/fieldFights.js, fieldFight(), post-volley break
   check only: when the lead arrives below the break line
   (hp/maxHp < mBreak) AND no damage has been dealt yet this
   fight (rec.mDealt === 0, covering ambush + volley — so a
   volley drive-off, where the bow itself dropped the beast
   below the line, still flees) AND opts.cornered AND
   opts.allies >= 1 (party of 2+) AND the leader is armed
   (wb > 0, weapon bonus from equipped gear, computed by the
   existing gear-up code) AND NOT opts.noFlee (arena sealed
   fights are untouched), then the post-volley mFlee is
   SKIPPED, rec.corneredHold = true is set, and one honest
   log line is added ("cornered at the treeline — it cannot
   simply slip away before a blow"). The fight then enters
   round 1 normally. UNTOUCHED, exhaustively: the in-round
   break check after round 1 (a beast still below the line
   after round 1 flees then, exactly as before); vFlee/vDie
   (the party can still break or die in round 1 — the risk
   is real); evade (contact check); signature/trick/cap
   mFlee paths; the volley-kill branch; the alreadyDead
   branch; deed credit; the TB path; arena (noFlee) fights.

Why this shape, in plain words: a 1-HP beast cornered by a
mustered, armed party at its own treeline does not get to
leave before anyone swings — but it only has to stand for
ONE round. If the party's round-1 blows do not kill it, it
flees after round 1 as before; if the party breaks, the
sortie breaks as before. For a 1-HP beast, one round is the
finish; for a 43-HP beast, one round is a real fight with
real risk and usually still a flight — which is the
risk-weighted reading, not a kill guarantee.

Why weapon-only, not an armor-P threshold: the task's GO
wording requires finishes "by a party of 2+ fighters with
gear recorded" — gear recorded, not a P bar. Armor changes
how much round-1 damage the leader survives (it is recorded
in every row and reported), not whether a mustered party can
credibly corner a beast; an armor-P gate would mostly gate
on the armor-craft conversion system, itself an open item,
and would make the mechanism untestable on the wave-1/2
treeline beasts that are the bulk of the 1-HP population.
An unarmed party (wb === 0) still gets the free flee: no
weapon, no cornering. This choice is documented here for
Steve to overrule, not hidden.

## The driver policy (policy-side, sorties ONLY)

New file scripts/policies/partyfinish.js, wrapping
tableseat-nowait VERBATIM, gate PARTYFINISH=1, gate OFF =
pure delegation (detgate pins this). Gate ON, once per
loop-day, AFTER base.daily, sortie step ONLY (the
lingerfinish Step-1 gates, reused as the driver — the
march step is DELIBERATELY dropped: scholar TB finishes are
not villager field finishes, and marches added deaths in
lingerfinish without moving the finish legs):

- lingering monsters exist; min current HP <= 80; sum of
  current HP over all lingerers <= 300.
- >= 2 healthy villagers at home (health > 40, not away,
  not the scholar); pantry readable AND >= 12000 kcal
  (2x max sortie cost; the policy is the only affordability
  check, as in lingerfinish).
- NOT tableActive; NOT Game.over; no live TB fight; no
  pendingEncounter; scholar not sleeping, not insideTent.
- At most once per 6 game days (one muster per siege cohort).
- On fire: Game.answerLingerer('sortie'); record the return
  in ctx counters (pf.*). If the sortie BROKE, no further
  action that day. The policy adds NO promise line (the
  lingerfinish lesson: never promise a kill the engine may
  not deal); the sortie's own engine lines speak.

## Gear recorder (new instrument, no existing file edited)

New file scripts/policies/partyfinish-diag.js: wraps
Game.fieldFight at sweep install time (same pattern as
w4damage-diag, which is NEVER edited). For EVERY field
fight it records, pre-call: vid, monster type/wave, start
HP/max, opts.allies (party size = allies + 1), opts.cornered,
and the leader's gear computed the same way fieldFight does
(weapon bonus wb = round((melee + ranged) / 2) via
S.equipment.weaponBonusOf, armor P via S.equipment.armorOf,
both nullable when the equipment API is unavailable — a null
gear row can never count toward GO). Post-call: outcome,
rounds, mDealt, mHpLeft, rec.corneredHold. Rows land in the
sweep row as pfFights. The analyzer joins pfFights to the
w4damage fieldFight rows by (day, vid, mid, caller) only as
a cross-check; pfFights is the GO record, because only it
carries party + gear + corneredHold.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Baseline band: scripts/policies/tableseat-nowait.js
  VERBATIM + the w4damage recorder stack VERBATIM
  (raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
  defwound-diag, nonworldkill-diag, tbdmg-rebase-diag,
  w4damage-diag) + the new partyfinish-diag recorder (it
  records; it changes nothing — its neutrality is pinned by
  the detgate, and it is ON in both bands so the bands differ
  only by policy + mechanism activation).
- Armed band: IDENTICAL recorder stack + the partyfinish
  policy (PARTYFINISH=1) composed over tableseatNowait.
  Mechanism note (disclosed, not hidden): the game-code
  mechanism is present in BOTH bands' code, but it can only
  activate when opts.cornered is set, and only lingererSortie
  sets it, and only the armed policy ever calls a sortie on
  this substrate (no substrate policy calls answerLingerer).
  The baseline band is therefore mechanism-dormant; the
  analyzer verifies this by asserting zero cornered fights
  in the baseline corpus. The mechanism-isolation reference
  is lingerfinish (same sortie driver, no mechanism, sortie
  finishes 0) — a design reference, never a re-score of this
  run's GO, which is judged against the fresh baseline below.
- Env (both bands, full set): LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset, RAFTDRAFT=1,
  SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1,
  NONWORLDKILL=1, TBDMG=1, W4DMG=1; armed adds PARTYFINISH=1.
- Sweep driver: NEW file scripts/test-partyfinish-sweep.js
  (a copy of scripts/test-lingerfinish-sweep.js differing
  ONLY in corpus dir, labels, row policy tag, the base
  policy per band, the pf.* ctx capture, and the pfFights
  recorder install — the original is untouched). Rows are
  s<seed>-armed.json in BOTH dirs. CONTROL corpus ->
  evidence/2026-10-28/perseed-partyfinish-a/control/,
  ARMED corpus -> .../armed/.
- NEVER edited: tableseat-nowait.js, any existing recorder
  file, any existing sweep/analyzer file, any gating/deed/
  wave-unlock code, TABLE.md, or any sibling-loop file.
  New files only: scripts/policies/partyfinish.js,
  scripts/policies/partyfinish-diag.js,
  scripts/test-partyfinish-sweep.js,
  scripts/test-partyfinish.js (analyzer / proof validator),
  scripts/test-partyfinish-proof.js (unit + detgate-construction
  proof), this prereg, the evidence file, the corpus dirs.
- Seeds 75101-75108, horizon 180d DEATH-AWARE (runDays stops
  on death/win; +10d tail max). The 8-seed band IS the pilot
  and the judged band (MEASUREMENT.md §§9-12).

## Counted-finish definition (BINDING)

A COUNTED FINISH is a pfFights row with ALL of:
  (a) caller = 'sortie' (stack-classified, same classifier as
      w4damage-diag) AND worldMonster = true;
  (b) outcome = 'vKill';
  (c) party size = opts.allies + 1 >= 2;
  (d) leader armed: gear wb > 0 AND gear recorded (wb and
      armor both non-null in the row);
  (e) rec.corneredHold = true (the mechanism actually held
      this fight; a vKill without the hold is reported
      separately and does NOT count — e.g. a volley kill).
Counted finishes are counted per fight row (one row = one
finish); a sortie that kills two lingerers counts two.
REPORTED SEPARATELY, never counted: sortie vKills without
corneredHold; sortie vKills with wb === 0 or null gear;
non-sortie villager field vKills; scholar TB finishes.
SECONDARY (comparability only, never a GO leg): the
lingerfinish-census villager-field finishes of toll-wounded
instances (analyzer reuses the lingerfinish census logic
verbatim in method), reported so this arm can be read
against lingerfinish's 0 -> 0.

## What counts as a party / geared attempt (BINDING)

- PARTY ATTEMPT: a sortie field fight with opts.allies >= 1
  (leader + >= 1 ally = party of 2+). Muster size is taken
  from opts at call time, never inferred from roster.
- GEARED ATTEMPT: a party attempt whose pfFights row carries
  non-null wb and armor values (gear recorded), with wb > 0
  for a COUNTED finish. Armor P is reported per finish; no
  P threshold is imposed (see "Why weapon-only" above).
- SOLO attempts (allies = 0) and scholar TB fights can
  never be counted finishes, whatever their outcome.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: counted villager field finishes (definition above),
ARMED vs BASELINE on identical seeds.

GO RULE (ALL legs must pass; a miss on ANY leg is NO-GO
and the game-code mechanism is REVERTED before commit —
killed arms leave no trace in src/js; the policy, recorder,
sweep, analyzer, and evidence remain as measurement):

  (a) BAND VALIDITY: 8 rows per band, every recorder clean
      (errs 0, no overflow), analyzer exit 0, zero cornered
      fights in the baseline corpus (mechanism-dormant check).
  (b) SUBSTRATE GATE on both bands (else that band is
      INVALID, not NO-GO, and the run stops for an env fix):
      courtship combined > 0 AND >= 6/8 seeds active.
  (c) COUNTED FINISHES (the deciding leg): counted finishes
      ARMED >= 2 AND ARMED >= BASELINE + 2. Baseline is
      expected to be 0 (no sorties on this substrate) but
      the FRESH baseline is the judge, never an old number.
  (d) COST BAR (the scalemetric rule, verbatim from the
      task): median survival (ARMED) >= 0.8 x median
      survival (BASELINE); starvation deaths (ARMED total)
      <= starvation deaths (BASELINE total) + 2; AND
      starvation deaths among ARMED-only dead seeds (seeds
      with endReason 'village-lost' in ARMED but not in
      BASELINE) <= 2.
  (e) DETGATE: partyfinish OFF + recorders OFF delegates
      byte-identically to plain tableseatNowait on 75101
      (days, gameDays, ts equal, no pf.* ctx surface, no
      wraps installed). The sweep's --detgate mode pins it.
  (f) PARTY/GEAR REPORTING: the analyzer prints, per band,
      the party-size and gear split of every sortie vKill
      as a first-class table; a missing split is an analyzer
      failure, not a pass.

  NO-GO handling: revert BOTH src/js edits (havenGrowth.js
  cornered flag, fieldFights.js hold) before commit, delete
  scripts/policies/partyfinish.js (the driver dies with the
  mechanism it drove — a killed arm leaves no game-facing
  trace), keep the recorder/sweep/analyzer/proof/evidence/
  corpora as measurement, and say NO-GO plainly with the
  failing leg named. Do NOT silently switch to a narration
  clause, a different gate, a wider hold (wild fights), or
  a second policy.

SENSE RULE (binding): non-measured replay only, on the
armed policy + mechanism, one seed, sortie-line presence
and one-encounter plain-words read only; replay text never
enters any count. The sense questions: when a cornered
party holds a broken beast for round 1, does the fight read
like people finishing a hurt beast at their treeline — and
does any line overclaim (promise a kill, hide the risk, or
hide the ration cost)?

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed BASELINE
band is run first and judged for band validity (leg a) +
substrate gate (leg b) + detgate (leg e) before the armed
band is judged. If the baseline band is INVALID, the armed
band is not judged and the run ends INVALID-band, reported
as such.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. Known limitation (standing exception,
ninth round expected): no corpus-ingest mode for a
single-arm census corpus; if it fails the same way, say so
explicitly and use the paired before/after sweep tables +
analyzer outputs as the section-15 substitute. No panel
artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall baseline,
metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-partyfinish-a/control/*.json and
.../armed/*.json), report LOUD lines with verdict, do NOT
roll the baseline on an unexplained LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
