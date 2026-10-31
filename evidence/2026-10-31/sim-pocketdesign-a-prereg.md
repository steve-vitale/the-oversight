# sim-pocketdesign-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, arm sim-pocketdesign-a, axis scale-onramp, run
fleshout-20261031T0915Z. Arm type: DIAG ONLY — zero src/js changes,
zero policy-default flips, zero edits to existing files (including
scripts/policies/deadfall-b.js and scripts/policies/delegate.js,
reused VERBATIM as layers; the only new files are the PD
instrument, the sweep, the analyzer, the proof test, this prereg,
and the evidence file — plus the CONTINGENT screening layer below,
written only if its trigger fires). The deliverable is a landed
instrument set + census + this evidence. Nothing in this arm
changes the game, so no [needs-eyes] is expected.
Worktree branch: sim-pocketdesign-a. Base anchor at sweep time:
the worktree HEAD when the judged sweep runs (recorded per seed
as anchorCommit in the per-seed JSONs).

## Canon (read first; no invention)

- docs/CANON.md read. docs/MONSTER-WAVES.md wave 4/5 gates read
  (wave 4: village standing >= 100; wave 5: standing >= 200 AND
  wave-4 faced). docs/CONTESTS.md read: contests are the show
  system; patrol/field fights are NOT contests, so no contest
  canon is applied to them here.
- NO canon doc covers a villager pocket-call / home ammo top-up
  design or a cross-node shout range (same statement as
  sim-pocketcall-a-prereg.md, re-verified: the manifest's table
  has no such doc). This is stated here rather than inventing
  canon. The census therefore copies CODE precedent, not a canon
  design: the departure pocketing rule (game.js villagerPocketAmmo,
  gap-ammo 2026-10-27: called ONLY from departure sites —
  resolvePatrol and startExpedition — AFTER gear-up and AFTER the
  sit-out checks, never mid-fight, never for the player), the
  departure gates in code order (below), and the code's own
  sensed-contact channels (pocketcall prereg §Sensed-contact test,
  reused verbatim: C1 same node, C2 same grid within Chebyshev 1
  void when nodes differ, C3 crew shout, C4 party follow).
- Perception law (Steve 2026-10-28): villagers are real people
  with eyes — they know who's around only through their own
  senses. No global roster or "who is around" list is fed into
  any decision here, and none is used even as a census input:
  the shout-input rows read ONLY the fighter's own node/position,
  the scholar's own node/position, the travelling crew the fighter
  is already in, and the fighter's own party membership. Node
  deltas are computed from those two nodes only. A future shout
  range defined from these inputs is a design decision for a
  later arm; this census does not invent one, and adjacent-node
  is NOT counted as contact (pocketcall F4, re-affirmed).

## Background (designed against, not re-proved)

sim-pocketcall-a on the supply band (16 seeds, deadfall-staffed
substrate): 14 wave-4+ fights, 3 ranged, classified 100%
(1 armed volley, 1 never-called unreachable, 1 dry-at-fight
spent); 203 departures, 0 resolvePatrol calls (expedition-only),
95/203 (47%) sat-outs with the firing gate unrecorded. This arm
produces the four design inputs that census left open. It does
NOT re-prove the pocketcall classification and does NOT design
or build the call.

## Departure gates in code order (binding attribution rule)

startExpedition (villager-agency.js) gates, in order, each
before villagerPocketAmmo:
  1. HEAL: villagerHealCheck(vid, first) returns true — HP < 70
     AND no pharmacy dose used AND no healer patched them.
     (Medicine/healer success returns false: the villager goes.)
  2. SICK: (state.village.sick || {})[vid] truthy — the feverish
     stay home at any severity.
  3. RANGE: npcMaxDist(vid) < 1 — homebody profile (maxD 0).
     npcMaxDist is profile-derived (explorer 6, wanderer 3,
     forager 1, homebody 0) and is NOT called by the instrument:
     it writes a cached profile, so the instrument attributes
     RANGE by elimination (see below) and cross-checks against
     the raw cached profile only when one already exists.
resolvePatrol (game.js) gates, in order, before
villagerPocketAmmo:
  1. HEAL only (same villagerHealCheck, no sick/range checks).
     Note the resolution gate one level up: resolveAssignments
     deletes an outdoor assignment without calling resolvePatrol
     when the villager is < 40 HP at resolution, and keeps (not
     deletes) sheltered assignments. That funnel gap is measured
     as assigned-minus-called (see Input 1), never attributed to
     a departure gate, because no departure call exists for it.
Attribution rule (binding): a sat-out departure call (pocket
invocations for that vid did NOT increase during the call) is
attributed to the FIRST gate in code order observed firing:
heal iff villagerHealCheck returned true during the call;
else sick iff the site is startExpedition and the sick flag was
set at call entry (resolvePatrol has no sick gate, so a patrol
sat-out is never attributed sick); else range iff the site is
startExpedition (the only remaining gate in code order); else
'other'. A patrol sat-out with heal false is
'other' (no further gate exists in code — such a row means the
pocket call threw or the wrapper missed an invocation, and is
reported itemized, never folded into heal). Went <=> pocket
invocations increased during the call (pocketcall definition,
reused). Integrity checks (failures reported loudly, rows never
dropped): a heal-true call with a pocket increase; a went
expedition call without away/exped set afterwards.

A third departure site exists in code and is OUT of the
attribution denominator by construction: objDepart
(villager-objectives.js) moves a villager without calling
villagerPocketAmmo, so its departures never pocket and can
never sat-out at a pocket gate. It is counted band-wide as
context only (how many objective departures occur), so the
denominator's scope stays auditable. The agency loop's
pre-call filters (non-wanderer/explorer, not at home node,
night, indoor objective, expedition_launch trigger, RNG chance)
likewise never invoke a departure call and are NOT sat-outs.

## Stacks and bands (binding)

Instruments, all read-only, installed in this order: AMMODIAG=1
(ammo-diag-20261031.js, verbatim) + SUPPLYDIAG=1
(supply-diag-20261031.js, verbatim) + STICKFIBERDIAG=1
(stickfiber-diag-20261031.js, verbatim) + PCDIAG=1
(pocketcall-diag-20261031.js, verbatim) + PDIAG=1 (NEW
scripts/pocketdesign-diag-20261031.js, this arm). Sweep: NEW
scripts/pocketdesign-sweep-20261031.js (pocketcall-sweep logic
+ PD instrument + PD fields in the per-seed JSON). Analyzer:
NEW scripts/pocketdesign-analyze-20261031.js (derives every
judged number from the per-seed JSONs only, no re-simulation).
Proof: NEW scripts/test-pocketdesign-20261031.js (pure fixtures
+ static read-only scan + live gate on NON-band seed 85901,
60d — band seeds never appear in the proof, so proof runs are
not judged sims). The proof must be green BEFORE judged sims
are judged.

S-PATROL (screen + confirm candidate): policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))
+ withDelegate + withDeadfall, env FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 DEADFALL_B=1,
death-aware horizon (DAYS=200 cap; dead villages stop, +10d
tail max, per the harness — matching pocketcall's horizon).
Delegate is the existing delegating-player layer (journey r12):
each part, when the scholar is at Haven, idle villagers get
tasks by fit via the leader's own assign verb; combat-able
villagers (HP >= 60 AND a combat record or combat occupation)
draw 'patrol' at 35%. It is a policy variant, not a game
change: no src/js file is touched and no policy default flips.
Deadfall staffing stays ON so the supply rung holds (same
reason as pocketcall's substrate decision).

S-ASSIGN (CONTINGENT screening layer, written ONLY if the
S-PATROL screen fails): a census-only policy layer
scripts/policies/patrolscreen-diag.js that, at each upkeep
when the scholar is at Haven, assigns 'patrol' via assignTask
in-person to at most 2 free living villagers with HP >= 60
and (a combat occupation or a kill record) — delegate's able
rule, without delegate's other task assignments. It exercises
the existing player verb; it changes no game code and never
becomes a default. If written, it is documented as a screening
instrument, not a lever.

S-SUPPLY (fallback confirm band, used ONLY if both screens
fail): the pocketcall stack verbatim (no delegate), seeds
85101–85116, fresh run with the PD instrument added. Fight
identity is checked against the pocketcall corpus (14/14
identity match expected; a mismatch is reported as base
movement, never smoothed).

## Screening procedure (binding order)

1. PILOT + SCREEN on S-PATROL, seeds 85101–85108 (one run serves
   both: the pilot checks the instrument, the screen checks
   patrol firing). Pilot GO requires: PD instrument fires on
   all 8 pilot seeds (per-seed JSONs valid: days > 0, PD rows
   present-or-empty with a reason); instrument errors 0 on all
   8 (ammo + supply + stickfiber + PC + PD); PD volley rows
   join 1:1 with ammo-diag wave >= 4 fight rows on every pilot
   seed (join key vid + day + mid + occurrence index within
   that key; any mismatch is a pilot failure); PD pocket-seq
   row count equals ammo-diag pocketCalls count on every pilot
   seed; AND >= 1 wave >= 4 fight of any kind on the pilot
   (proves fight capture works). If the pilot fails on
   instrument grounds, the verdict is DIAG-NO-GO (no confirm
   spend on a broken instrument).
2. SCREEN BAR (patrol band found) iff, on the 8 screening
   seeds: >= 8 resolvePatrol invocations total AND >= 2
   distinct seeds with >= 1 patrol call (not all on one freak
   seed). If met, CONFIRM = seeds 85109–85116 on S-PATROL;
   judged band = 16 seeds on S-PATROL. Inputs 2–4 are judged
   on that 16-seed band.
3. If the screen bar is missed: run the S-ASSIGN screen, seeds
   85201–85208, same instruments, same bar. If met, CONFIRM =
   seeds 85209–85216 on S-ASSIGN; judged band = 16 seeds on
   S-ASSIGN. If missed: CLEAN NEGATIVE for Input 1 (report
   total screening volume: 8 S-PATROL + 8 S-ASSIGN seeds, plus
   the prior 16-seed supply band at 0/203 departures), and
   CONFIRM for Inputs 2–4 = S-SUPPLY, seeds 85101–85116.

## Inputs + GO thresholds (binding — judged exactly, never re-scored)

INPUT 1 — PATROL BAND. Primary metric: resolvePatrol
invocations on the screening band. GO (band found) iff the
screen bar above is met on S-PATROL or S-ASSIGN. Reported
alongside: patrol outcome split (heal-sat-out / uneventful /
fought, with fought split by wave and by ranged-ness),
assignment funnel (patrol assignTask attempts, assignments
standing after the call, resolvePatrol invocations, and the
assigned-minus-called gap with its known causes: <40 HP at
resolution, shelter, death/roster removal — the gap is
reported as a count, never attributed to a departure gate),
and patrol ranged fights (count + volley if any). A clean
negative (both screens missed) is reported with its screening
volume, not hidden.

INPUT 2 — SAT-OUT GATE ATTRIBUTION. Primary metric:
attributed share = sat-outs with gate in {heal, sick, range}
divided by all sat-outs (pocket-site departure calls with no
pocket increase) on the confirm band. GO iff attributed share
>= 80% AND total sat-outs >= 20 (fewer is INSUFFICIENT-DATA
for attribution, not GO and not NO-GO). Reported alongside:
the gate table (heal / sick / range / other, with n and %),
per-site split (startExpedition vs resolvePatrol), every
'other' row itemized (vid, day, site, heal-observed, sick,
cached profile), integrity-check results, and the objective-
departure context count.

INPUT 3 — TOP-UP MOMENT. Primary metric: timeline
completeness = wave >= 4 ranged fights on the confirm band
whose spend timeline is fully reconstructed (last pocket day +
carried at last pocket + every volley spend since that pocket
with shots + carried at meeting, all present) divided by all
wave >= 4 ranged fights on the band. GO iff completeness is
100% AND every dry-at-meeting fight is classified into exactly
one of {spent-in-outing (a pocket in the same outing was spent
before the meeting), never-pocketed-in-outing (no pocket since
the outing's went departure), pocket-failed (pocket calls in
the outing added 0 carried)} AND the band-wide spend-timing
table is published (shots spent between last pocket and
meeting by weapon; meetings reached armed vs dry; for
spent-in-outing cases, median shots and median fights since
last pocket). A clean zero on any sub-class with its reason
still satisfies GO (sizing, not direction). Fewer than 1
wave >= 4 ranged fight band-wide is INSUFFICIENT-DATA, not GO.
Outing definition (analyzer): an outing starts at a went
departure and ends at the next expeditionReturn for that vid,
the next went departure for that vid, or the run's end;
patrol departures are single-part outings (pocket and any
fight happen inside the call). A pocket from a PREVIOUS outing
never counts as in-outing spend. Departure-only top-up is
already known to miss late-outing meetings (pocketcall F3);
this input PRICES the moment (when pockets empty relative to
the meeting), it does not re-propose departure-only top-up.

INPUT 4 — CROSS-NODE SHOUT INPUTS. Primary metric: shout-row
completeness = wave >= 4 ranged fights on the confirm band
with a complete shout-input row (fighter node, scholar node,
node deltas Manhattan + Chebyshev, scholar-at-haven bool,
fighter distance from haven in nodes, C1/C2/C3/C4, crew size,
alive crew others, party membership, fight optAllies) divided
by all wave >= 4 ranged fights on the band. GO iff
completeness is 100% AND the call-design population (the
never-called + dry ranged fights, classified per pocketcall's
priority order) is tabulated by node-delta value (Manhattan
distance scholar<->fighter: 0, 1, 2, 3+ with n each) AND by
channel (C1/C2/C3/C4 counts + union + unreachable count).
Adjacent-node (delta 1) is tabulated, never counted as
contact. Fewer than 1 wave >= 4 ranged fight band-wide is
INSUFFICIENT-DATA, not GO.

WALL NUMBERS (reported every run, same caveats as pocketcall):
national / table / wins / wave 4 / wave 5 / median + max
survival from the per-seed JSONs on the confirm band. Table/win
flags are the policy stack's substrate flags, not ordinary-play
claims. Arc II/III/IV reach, four-realm formation, trap
acquisition by source, counter discovery/kill rates, and
young-link succession survival are NOT instrumented in this
substrate and are NOT reported.

## Panel (§15)

Single-base DIAG measurement: no before/after comparison exists
in this arm (the S-PATROL/S-ASSIGN/S-SUPPLY bands are alternative
measurement bands, not a before/after pair on one base), so
`scripts/balance-panel.js` does not apply. No panel compare is
attached and none is fabricated — the same declaration
pocketcall-a made. A later lever arm reusing this corpus as its
baseline runs the panel then.

## Sense-testing (SENSE-TESTING LAW)

Read >= 1 fight transcript (the ammo-diag log copy in the
corpus) per ranged-fight class present on the confirm band, plus
>= 1 patrol fight transcript if any patrol fight exists on the
band. Judge meaning, coherence, relevance, consequences — does
a patrol fight read like a person walking a perimeter, does a
dry fighter's scene pretend otherwise, does a sat-out villager's
traced gate read as a human reason (hurt, feverish, homebody)
or as a silent filter? Quote the stretches in the evidence
file. Departure-day narration is NOT in the per-seed corpus
(the sweep captures fight logs, not say-lines), so sat-out
sense reads use the traced gate values (HP/sick/profile at call
time) and say so honestly — no narration is quoted that was not
in the corpus. Counts alone do not pass this arm.

## Addendum (instrument v2, before confirm judgments, 2026-10-31)

The v1 screen run (seeds 85101–85108, S-PATROL) passed the pilot
and screen bars but exposed two instrument gaps, both fixed in v2
BEFORE any confirm judgment; the screen seeds are re-run with v2
so every judged number comes from one instrument version:
1. callerOf misread: the PD fieldFight wrapper (anonymous,
   assigned via a generic helper) showed as Object.<anonymous>
   and callerOf stopped there, so all v1 ranged fights read
   caller other:Object.<anonymous> (the true callers were visible
   deeper in callerFrames: expeditionMonster,
   resolveWildMonsterEncounter, aidFight). Fix: the wrapper is
   now a named `fieldFight` function expression, whose frame
   callerOf skips. Verified in simulation + on the v2 re-run.
2. fought-by-wave missing: v1 departure rows counted fights
   inside a patrol call but not their waves, so Input 1's
   "fought split by wave" could only be caller-based (empty for
   low-wave patrol fights). Fix: departure rows now carry
   volleyDuringWaves / volleyDuringRanged / volleyDuringShots;
   the analyzer reports the departure-based split as primary
   and keeps the caller-based split labeled for comparison.
No prereg bar changes: same seeds, same screen bar, same
thresholds. The v1 screen numbers are superseded, not quoted
as judged data (they are noted here only to explain the re-run).

## Metric review

(To be filled at end of run. Doubts about the metric go here and
apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
