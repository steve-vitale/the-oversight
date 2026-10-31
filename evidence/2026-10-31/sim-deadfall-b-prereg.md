# sim-deadfall-b — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop B worker, arm sim-deadfall-b, axis scale-onramp, backlog
#1594, run fleshout-loop-b-20261031T0436Z. PROTOTYPE + MEASURE, land
only on GO: a villager deadfall/brush source duty prototype, modeled
on the stone duty. The coordinator makes the landing call; a NO-GO
prototype leaves NO trace in any commit (commit evidence + prereg +
proof scripts only, never the prototype code).
Worktree branch: sim-deadfall-b. Base anchor at prereg time:
b2518ece2 (worktree HEAD; recorded per seed as anchorCommit in the
per-seed JSONs). The anchor differs from sim-stickfiber-b's
a1e3a01a9, so judged numbers are compared baseline-vs-prototype
WITHIN this arm on identical seeds, never against stickfiber-b's
corpus as if it were the same run.

## Canon (read first; no invention)

- docs/CANON.md read. NO canon doc covers a villager stick/fiber
  source duty: the manifest's table has no such doc, and no
  stick/fiber duty doc exists in docs/. This is stated here rather
  than inventing canon. The prototype therefore copies CODE
  precedent, not a canon design: the stone duty (game.js
  delegateTasks 'stone' + resolveOneAssignment 'stone' branch +
  villagerCompetence 'stone'), the scholar deadfall precedent
  (gatherFallen: deadfall needs NO tool, so the axe gate does NOT
  apply — felling would need axe tier and is NOT this shape), and
  the brush precedent (storage.js clearBrush: brush yields fiber).
- Perception law (Steve 2026-10-28): the duty is a sensed routine
  (a villager goes out, gathers deadfall/brush, returns with
  material to the communal pile), exactly like the stone duty.
  The sim staffing layer below stands in for the leader's assign
  verb (the shipped game change is the duty itself, staffed in
  real play through the delegateTasks UI); it assigns only free
  villagers at Haven, never pulls anyone off a task, and never
  feeds a "who needs what" list into a decision. The pile-stick
  threshold it reads is the Haven stash the leader can see.

## Prototype (what "on" means; "off" = staffing layer disabled)

Game code (src/js/game.js + src/js/perceive.js), stone-duty shape:
- delegateTasks: new 'deadfall' entry — "Gather deadfall: fallen
  sticks and brush fiber from deadfall. No axe needed — fallen
  wood only." (delegateTasks is the single source of truth for
  task types; an unknown task is rejected by assignTask, so the
  entry is required for the duty to be assignable at all.)
- villagerCompetence 'deadfall': forager/lumberjack/carpenter/
  handyman/builder 1.4; farmer/gardener 1.2 (stone-duty shape:
  occupation keywords, temperament untouched).
- resolveOneAssignment 'deadfall' branch, immediately after the
  stone branch: sticks = max(1, round(R(1,2) * eff)) into
  stashState().materials.stick; fiber = 1 on a 50% roll into
  materials.fiber (brush-stripping half of the duty); one return
  line in the stone/wood voice ("gathers deadfall ... The pile
  grows. (N sticks now.)"); bumpTrust 1, same as stone. No axe
  gate, no new system, no throttle-alt or cistern-rotation change
  (stone routing is left exactly alone, so leg 3 is clean).
- Off-state telemetry only (Game-object fields, never state):
  _deadfallHauls / _deadfallSticks / _deadfallFiber, counted in
  the branch. Saves and state fingerprints untouched.
- perceive.js stash line: add 'stick' to the Haven stash list
  (stickfiber-b metric review trap: the line listed branch/wood/
  stone/fiber only, so pile sticks would otherwise be invisible
  at Haven) + MAT_PLURAL stick: 'sticks'.
- NOT changed: prodThrottleAltTask rotation, cistern redirect
  rotation, checkObedience gates (deadfall keeps stone's trust-20
  gate — it is not food work), recipes, pocket-craft odds.

Policy staffing layer (scripts/policies/deadfall-b.js, DEADFALL_B=1
arms it; unset = pure delegation):
- In policy.daily, when the scholar is at Haven: if pile sticks
  < 6 and fewer than WANT_DEADFALL = 2 villagers are currently
  assigned 'deadfall', assign free villagers (never the scholar,
  never anyone already assigned, never anyone dead) to 'deadfall',
  occupation-preferred (forager/lumberjack/carpenter/handyman/
  builder/farmer/gardener), counting only assignTask {ok:true}
  results. Silent staffing: the engine's own assign + duty lines
  narrate; the layer adds no line of its own.
- The layer wraps the same stack as the baseline sweep (below).

## Substrate (shared supply band, so numbers are comparable)

Seeds 85101-85116, policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, death-aware horizon (DAYS=200 cap; dead villages
stop, +10d tail max, per the harness). Instruments: AMMODIAG=1 +
SUPPLYDIAG=1 + STICKFIBERDIAG=1 (reused, unmodified) + the new
deadfall ledger fields read by the sweep (no new instrument file:
the sweep reads Game._deadfall* at end of run and the daily pile
rows already carry stick/fiber/stone).
Sweep: scripts/deadfall-sweep-20261031.js (stickfiber-sweep logic
+ DEADFALL_B gate + deadfall ledger fields), writing
evidence/2026-10-31/perseed-deadfall-b/<arm>/s<seed>.json ONCE.
Analyzer: scripts/deadfall-analyze-20261031.js. Proof:
scripts/test-deadfall-b.js (fixture: duty branch produces sticks/
fiber + trust + return line, and pile-stick visibility line lists
stick; staffing fixture: assigns only free villagers, never pulls
an assigned one, respects WANT and the pile threshold; live gate:
60d seed 85101 staffing-off pile sticks 0 + hauls 0, staffing-on
hauls > 0 + pile sticks > 0, staffing-on re-run byte-identical).
The proof must be green BEFORE judged sims are judged.

## Primary metric + GO threshold (ALL must hold on the 8-seed pilot
before ANY confirm spend, per the pilot gate)

Primary metric: pile sticks produced by the duty + bow craft
attempts / pocket-call successes attributable to it. Attribution
rule (stated up front): the baseline band's pile sticks are 0 on
every day of every seed and its bow craft attempts are 0, so ANY
pilot-seed pile-stick day with deadfallHauls > 0, and ANY bow
craft attempt in the prototype arm, is attributable to the duty
(it is the only pile-stick source in the arm).

GO iff ALL of:
1. Pile sticks > 0 on >= 6/8 pilot seeds, with deadfallHauls > 0
   on each such seed (duty-attributed, per the rule above).
2. >= 1 bow craft attempt OR pocket-call success attributable to
   duty-produced material in the pilot (a craft attempt on any
   pilot seed, per the attribution rule; a pocket-call success
   counts only if it consumed duty-produced pile material).
3. Stone-duty output NOT regressed vs the identical-seed baseline
   band. Tolerance, stated up front: prototype median stone max
   >= 50% of baseline median stone max across pilot seeds, AND
   no pilot seed with stone max 0 (the stone duty still fires
   somewhere on every seed). Stone consumed by successful arrow/
   bolt crafts (1 per batch) is a success effect, not a
   regression, and is noted, not hidden.
4. No new narration spam — sample transcripts read under the
   sense-testing law: a 60d transcript probe (seed 85101,
   prototype on) must show deadfall duty lines at normal duty
   cadence (<= 4/day, one per day-part at most) and no day with
   > 2 refusal lines for the same villager + task. A refusal
   loop or a per-tick duty line is a leg-4 miss.

A miss on ANY leg is NO-GO, never re-scored against a friendlier
metric mid-run. KILLED-AT-PILOT if leg 1 or leg 2 fails on the
pilot (no confirm spend). Any metric doubt goes under "metric
review" in the evidence file for the NEXT run.

PILOT GATE: 8 seeds (85101-85108), baseline arm then prototype
arm, identical seeds. Pilot passes to confirm iff all four legs
hold. Confirm: seeds 85109-85116 (band total 16) if the pilot
passes; the confirm is judged on the same four legs at band
scale (leg 1: >= 12/16 seeds; leg 2: >= 1 attempt/success band-wide;
leg 3: same tolerance at band scale; leg 4: probe re-read).

## Panel (§15)

The balanced panel (scripts/balance-panel.js) is run as a
NEUTRALITY check, not as the effect instrument, and its compare
.md is attached to the evidence file: the panel driver runs
registry policies only (capable/risk-aware/...), and NO registry
policy staffs the new 'deadfall' task, so a panel before/after
cannot express this arm's staffing effect — under registry
policies the duty is inert by construction, and the panel compare
is expected to show no material signal (proving the duty code
changes nothing when unassigned). The JUDGED before/after
comparison is the paired identical-seed sweep above (same
substrate, same seeds, baseline vs prototype), which is the
panel principle applied to the substrate that can actually staff
the duty. Fabricating a panel effect claim from the neutrality
check would be dishonest; the evidence file reports both
comparisons with their scopes labeled. Panel runs (registry
policy 'capable', pilot seeds 85101-85108, 150d) go to
/tmp/panel-deadfall-b-{base,proto}/; the compare .md is copied
to evidence/2026-10-31/deadfall-b-panel-compare.md.

## Sense-testing (SENSE-TESTING LAW)

Read the 60d transcript probe (seed 85101) as scenes: a deadfall
return line, a bow departure after pile sticks exist, and any
dry-fight line. Judge whether the deadfall villager reads like a
person doing a job (named haul, pile growth, trust) and whether
a bow fighter with new arrows reads as the gap closing — never
just counts. Quote the stretches in the evidence file.

## Wall numbers (honest, same caveats as stickfiber-b)

National / table / wins / wave 4 / wave 5 / median + max
survival from the per-seed JSONs, for baseline and prototype
separately. Table/win flags are the policy stack's substrate
flags, not ordinary-play claims. Arc II/III/IV reach, four-realm
formation, trap acquisition by source, counter discovery/kill
rates, and young-link succession survival are NOT instrumented
in this substrate and are NOT reported.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file
after the run; they do not change this run's verdict.
