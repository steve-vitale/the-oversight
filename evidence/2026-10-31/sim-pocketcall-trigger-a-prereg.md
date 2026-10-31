# sim-pocketcall-trigger-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, arm sim-pocketcall-trigger-a, axis scale-onramp, run
fleshout-20261031T1107Z. Arm type: POLICY-SIDE LEVER (not a DIAG census):
one NEW policy file under scripts/policies/, default-OFF
(POCKETCALL_TRIGGER=1 arms it; unset = pure pass-through, zero Game
reads, zero RNG, byte-identical to the pocketdesign S-PATROL stack).
Zero src/js changes, zero edits to existing files (delegate.js and
deadfall-b.js reused VERBATIM as layers; pocketdesign instruments
reused VERBATIM). If the arm fails its bars, the policy file is
deleted before commit (killed arms leave no trace); the prereg,
evidence, corpora, and standalone analyzer stay, per the
morningcarry killed-arm precedent.
Worktree branch: sim-pocketcall-trigger-a. Base anchor at sweep time:
this worktree's HEAD when the judged sweep runs (recorded per seed
as anchorCommit in the per-seed JSONs). NOTE: this base DIFFERS from
the pocketdesign census anchor (003a9c2f391e) — so the authoritative
baseline for this arm is a FRESH baseline sweep run in THIS worktree
(S-PATROL stack, policy layer present but OFF), on identical seeds.
The pocketdesign corpus is a cross-base reference only, never the
judge.

## Canon (read first; no invention)

- docs/CANON.md read. No canon doc covers a villager pocket-call /
  home ammo top-up design or a cross-node shout range (same statement
  as sim-pocketcall-a-prereg.md and sim-pocketdesign-a-prereg.md,
  re-verified against the manifest's table). Stated here, not invented.
- Code precedent (not canon design): game.js villagerPocketAmmo
  (gap-ammo 2026-10-27): sling tops up to 6 stones from the communal
  pile; bow/crossbow get ONE craft attempt per call from the pile
  using the EXISTING arrow/bolt recipes and the player's craft odds
  exactly (blind 35%, learned 85%); caps 6 stones / 5 arrows-or-bolts;
  own stash first, then pile. Its header comment says "Called ONLY
  from departure sites (patrol, expedition) AFTER gear-up and AFTER
  the sit-out checks — never mid-fight, never for the player."
- THIS ARM'S DELIBERATE, DOCUMENTED EXTENSION: the policy calls the
  SAME engine function (same caps, same odds, same pile accounting,
  never for the player, never mid-fight) from a NEW call site — a
  Haven co-location, scholar present, pile present — instead of a
  departure site. The mechanic is unchanged; the caller and the
  moment are the experiment. As a default-OFF policy instrument it
  changes no shipped game. If it ever lands as game behavior, the
  departure-only comment needs updating by the landing arm, and a
  game-code version needs its own design review. The arm does not
  smuggle a game-code change in through the policy file: no src/js
  file is touched.
- Supply/ammo rules read from code: arrow recipe = 2 stick + 1 stone
  + 1 fiber, makes 5; bolt recipe = 2 stick + 1 stone, makes 5. A
  craft attempt deducts materials BEFORE the roll, so a failed roll
  still costs the pile — hence the once-per-fighter-per-day throttle
  below. When any recipe material is short (notably fiber 0, the
  pocketdesign B3 drought), the attempt does not run at all and
  costs nothing — T1 can neither fix nor worsen a fiber drought.

## Design inputs (measured, designed against — not re-proved here)

From sim-pocketdesign-a (S-PATROL band, 16 seeds): 7 wave>=4 ranged
fights, 1 ARMED, 5 NEVER-CALLED, 1 DRY-AT-FIGHT; dry-at-fight total
6. (1) 5/6 dry fighters were NEVER-CALLED — a departure-only top-up
cannot help them; they need a FIRST call. (2) 2/6 dry fighters were
ALREADY reachable (Nikolai on the scholar's own node, Nadia marching
in the crew) and still fought dry — reachability is NOT the binding
constraint; a TRIGGER is. (3) The pocket-failed case broke on fiber
(pile fiber 0 days 120-130, stone 2,002), not sticks. (4) The Jovan
spent-in-outing pattern (proven on the supply band, 0 on this band)
must still be covered: T1 covers it at RETURN (fighter back on the
Haven node, quiver empty, scholar present), never mid-outing — a
mid-outing pile draw would teleport Haven pile ammo to the field,
which is the magic resupply the brief forbids.

## Perception law compliance (Steve 2026-10-28, binding)

The policy reads NO global roster and feeds NO "who is around" list
into any decision. The trigger's entire input set:
- The scholar's own node: Game.map.px/py (the scholar's position).
- The Haven node: state.village.px/py.
- The people ON the scholar's node: Game.npcsOnNode(hx, hy) — the
  engine's own place query ("which NPCs are on a given world node").
  This is the scholar seeing the people standing at the fire with
  him, not a roster scan: the returned set is exactly the
  co-present set, and nobody off-node is ever considered.
- Each candidate's OWN records only: dead flag, away flag, health,
  weapon (rangedWeaponOf / equipped fallback, same helper as
  ammo-diag), and carried ammo in their own pack (an empty quiver
  is visible at the fire).
- The pile is NOT read by the policy decision at all: whether the
  pile can arm the fighter is decided inside villagerPocketAmmo,
  the engine's existing accounting. No pile-fed gating, no
  roster-fed need list.
STRICTNESS (deliberate): the scholar must stand EXACTLY on the
Haven node (map == Haven node), not merely within playerAtHaven's
Manhattan <= 1 adjacency. Adjacent-node is not co-location
(pocketcall F4, re-affirmed). A candidate counts only while ON the
Haven node and NOT away (expedition/objective departures move the
candidate's node off Haven; the away flag is a second guard).
The policy file contains no reference to state.village.roster;
the proof test greps for it (npcsOnNode is an engine method, not
a policy roster read, and is named as such in the policy header).

## The trigger (T1, implemented) and the trigger (T2, NOT implemented as policy)

T1 — HAVEN CO-LOCATION FIRST CALL. In policy upkeep (each day-part)
and daily (end of day, scholar may have returned since the last
part), when the scholar stands exactly on the Haven node, for each
person on that node (npcsOnNode), if they carry a ranged weapon and
carry EXACTLY 0 of its ammo, and they have not already had a T1
attempt today (policy-closure throttle: one attempt per fighter per
scholar-day, keyed by vid+day, held in a WeakMap keyed by Game so
sequential seeds cannot leak), the policy calls
Game.villagerPocketAmmo(vid) once. No health gate (a hurt fighter
benched from departures can still fight at home — Nikolai fought
on the Haven node), no assignment gate (a fighter assigned patrol
today is still at Haven pre-departure; arming them IS the first
call), no pile gate (engine decides). The call is logged by the
policy itself onto Game._pocketTriggerCalls (plain JS property, not
game state — same precedent as Game._deadfallHauls) with
day/vid/weapon/ammo/before/after/out, so the sweep persists it and
the analyzer can attribute arming to T1 exactly. Upkeep runs before
the part's villagerTurn, so a T1 arming precedes any same-part
departure, whose own pocket call then no-ops at cap.
T1 covers, by construction: never-called home fighters (first call),
returning spent fighters (Jovan pattern at return), and the two
already-reachable cases (Nikolai/Nadia classes) whenever scholar
and fighter co-locate at Haven before the fight. It does NOT cover:
mid-outing spend (no magic), fighters the scholar never co-locates
with at Haven before fighting, or fiber-drought craft failures
(engine returns 0; logged as such).

T2 — SHOUT-ANSWERED TOP-UP: NOT IMPLEMENTED AS A SEPARATE POLICY
MECHANISM, pre-registered as such. Investigation before writing the
policy (recorded here so the call is auditable): policy hooks are
upkeep (per part), daily (per day), and fight (the SCHOLAR's own
fights only — sim-harness driveFights; NPC fieldFights never call
policy.fight). There is therefore NO policy-visible callback for a
distant NPC fight's shout being answered. Wrapping Game.fieldFight
inside a policy layer could observe it, but that observation would
not be scholar-perceivable: the shout is heard by the answering
ally, not by a scholar who may be at Haven or on another node, and
no report channel carries it to the scholar in code. A wrap-and-
remember list would be a remembered roster of distant dry fighters
learned without a perceivable channel — exactly the list-fed
pattern the perception law forbids. The honest policy-visible
version of T2 already exists inside T1: a fighter whose shout was
answered, who survives and returns to Haven, is topped up by T1 at
the next Haven co-location. T2 is therefore judged THROUGH T1
(T2-attributable arming = a T1 call for a fighter who previously
fought dry with a shout answered, identified from fight logs), not
as a separate trigger, and a true T2 (shout report reaching the
scholar) needs game code (a return/report channel), which this
policy arm must not smuggle in. If T1 lands, T2-as-game-code is a
follow-up design question for the coordinator, not this arm.

## Stacks, seeds, horizon (binding)

- Stack (both arms, identical except the env flag): fullseat stack +
  withDelegate + withDeadfall (the pocketdesign S-PATROL stack,
  verbatim) + withPocketTrigger outermost (upkeep + daily beats).
  Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 AMMODIAG=1 SUPPLYDIAG=1 STICKFIBERDIAG=1
  PCDIAG=1 PDIAG=1 DEADFALL_B=1; armed adds POCKETCALL_TRIGGER=1.
- Baseline arm: same sweep, POCKETCALL_TRIGGER unset. The OFF path
  returns before ANY Game read (env check only), so baseline =
  pocketdesign stack byte-identical modulo the pass-through wrapper
  (proof test verifies OFF vs no-layer day-hash equality on a seed).
- Armed-vs-baseline trajectories are NOT expected byte-identical:
  T1 craft rolls draw Math.random and T1 arming changes fights, so
  the comparison is distributional on identical seeds (the same
  basis as every policy arm), never a byte-identity claim.
- Seeds: pilot 85101-85108 (8 seeds, both arms); confirm 85101-85116
  (16 seeds, both arms) only if pilot GO. Never below 8.
- Horizon: DAYS=200 cap with death-aware stop (runDays stops when
  Game.over; gameDays recorded) — the pocketdesign band's horizon,
  not a fixed 200d claim. Dead villages stop simulating (+10d tail
  max per the loop's rule; the harness's own stop governs).
- Instruments: ammo-diag + supply-diag + stickfiber-diag +
  pocketcall-diag + pocketdesign-diag, all verbatim, installed in
  pocketdesign order. Sweep: NEW scripts/pocketcall-trigger-sweep-
  20261031.js (pocketdesign-sweep logic + T1 log capture).
  Analyzer: NEW scripts/pocketcall-trigger-analyze-20261031.js
  (derives every judged number from the per-seed JSONs only).

## Pre-registered metrics and GO bars (binding; a miss is NO-GO, never re-scored)

Primary metric: DRY-AT-FIGHT COUNT = number of wave>=4 ranged fights
with carriedNeeded == 0 at fight entry (ammo-diag fights joined
1:1 with pocketcall-diag fight rows, classification per
classifyFight; dry = all classes except ARMED). Baseline band
reference (pocketdesign, cross-base): 6 dry / 7 ranged. The judge
uses THIS worktree's fresh baseline, not the reference.

PILOT GO (8 seeds, both arms — all four required to spend confirm):
- P1 instruments clean: 0 errors on all five diags, all pilot seeds,
  both arms; PD pocket-seq pairs 1:1 with AD pocketCalls.
- P2 mechanism fires: armed pilot has >= 3 T1 attempts AND >= 1 T1
  call with carried-delta > 0 (it actually arms someone).
- P3 runs complete: all 8 armed pilot seeds finish without error.
- P4 cost screen: armed pilot starvation-cause death total <=
  baseline pilot starvation total + 2, AND armed pilot median
  gameDays >= 0.8 x baseline pilot median gameDays.
Pilot failure on any bar = arm killed at pilot (policy deleted
before commit; evidence records the kill).

CONFIRM GO (16 seeds, both arms — all required to land):
- C1 primary: armed dry-at-fight count <= floor(2/3 x baseline
  dry-at-fight count) — i.e. at least a one-third reduction
  (baseline 6 -> armed <= 4; formula governs if baseline differs).
  If baseline dry = 0, C1 cannot pass (INSUFFICIENT-DATA, not GO).
- C2 attribution: at least one armed-seed wave>=4 ranged fight
  where the fighter was T1-armed before the fight (a T1 log row for
  that vid with after > 0 on a day <= fight day, and carriedNeeded
  > 0 at fight entry). A count reduction with zero T1 attribution
  is trajectory noise, judged INSUFFICIENT-DATA, never GO.
- C3 cost bars (coordinator's bars, exact): armed starvation-cause
  death total <= baseline starvation total + 2, AND armed median
  gameDays >= 0.8 x baseline median gameDays.
- C4 instruments clean on all 16 seeds, both arms.
- Secondary (reported, no bar): national / table / wins, wave 4/5
  reach, total deaths, T1 attempts / armed / craft-failed counts,
  volley fights/shots/damage, T2-attributable arming count (T1 calls
  for fighters with a prior dry shout-answered fight, from logs).
Verdicts: GO only if C1+C2+C3+C4 all pass. NO-GO if C1 or C3 fails
with clean instruments. INSUFFICIENT-DATA if C1 passes without C2,
if baseline dry = 0, or if instruments fail.

## Balanced panel (§15)

A before/after comparison exists, so §15 is addressed, not skipped:
scripts/balance-panel.js `compare` requires panel.json.gz artifacts
produced by the panel's own driver over sweep-compare registry
policies (capable/risk-aware/...), and its driver cannot run this
arm's custom stack (fullseat+delegate+deadfall+trigger layers are
not registry policies, and its 150d capable-substrate runs would
measure a different substrate, not this arm's before/after). The
panel therefore REFUSES this corpus shape — no compare .md is
fabricated. The honest comparison instrument for this axis is the
pocketdesign analyzer lineage (identical seeds, identical stack,
identical instruments, only the env flag differs), run here as
scripts/pocketcall-trigger-analyze-20261031.js over both corpora.
This declaration matches the pocketcall/pocketdesign arms' panel
statement and is itself part of the judged evidence.

## Sense test (SENSE-TESTING LAW)

Read, in the armed corpus: at least one T1-armed fight transcript
(if any) and at least one still-dry fight transcript (if any),
judging meaning not counts — does the arming read as a person
handed ammo at the fire, does the still-dry case read as a
reachable failure or an uncovered case (never co-located, fiber
drought, mid-outing spend)? Quote both in the evidence file.

## Metric review (for the NEXT run, never a re-score of this one)

To be filled at evidence time. Known pre-run caveats: (1) dry
counts are thin (6 on the reference band) — a one-fight swing moves
the ratio; C2 attribution exists to keep a thin-count GO honest.
(2) Armed trajectories diverge by RNG stream, so per-seed fight
identity will NOT match baseline seed-for-seed; only band totals
are judged. (3) T1 is silent (villagerPocketAmmo narrates nothing;
departure pocketing is equally silent) — arming has no scene line
to sense-test; the fight log's volley line is the visible trace.
