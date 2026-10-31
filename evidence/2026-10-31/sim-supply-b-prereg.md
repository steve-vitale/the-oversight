# sim-supply-b — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop B worker, arm sim-supply-b, axis scale-onramp (wave-4 ammo-supply
blank left open by sim-ammo-a). DIAG ONLY: zero game-code change, zero
policy-default flips, no edits to existing policy files. The deliverable
is a landed instrument + evidence, not a game change.
Worktree branch: sim-supply-b. Base anchor at prereg time: 7a2974684
(worktree HEAD; the sweep records its own anchorCommit per seed).
NOTE ON BASE vs sim-ammo-a: ammo-a ran on base f52f08600. This base has
moved (7a2974684). The seeds + policy stack are identical, so the census
is comparable in kind, but trajectories are NOT claimed byte-identical
to ammo-a's corpus — any fight-count difference vs ammo-a is reported
as a base/substrate difference, never silently as a supply effect.

## What prior work already settled (reconciliation, not re-proof)

- sim-ammo-a (2026-10-31, Loop A): 14/14 ranged wave-4 field fights
  class (a) never-pocketed, strengthened to never-departed (0 departures,
  0 pocket calls on 14/14 dry fights). Pile at fight time: stone
  168-465 on all 14, stick = 0 AND fiber = 0 on all 14, so an arrow/bolt
  craft attempt would fail on materials even if the fighter had
  pocketed. Arrow recipe: stick 2 + stone 1 + fiber 1, makes 5.
  Bolt recipe: stick 2 + stone 1, makes 5 (NO fiber — bolt is NOT
  fiber-blocked; it is stick-blocked). Sling: pile stones full, slings
  empty. Pocketing itself works for villagers it reaches (102 calls /
  49 units band-wide, baseline).
- sim-ammostorage-a (2026-10-26): no code path moved ammo from any
  reservoir into a pack (pre-pocketing-code); stones piled communally,
  never pocketed.
- sim-arroworigin-a (2026-10-27): the village's single arrow(s) came
  from starting stash, never craft/loot/trade in that band.
- Static code reading at prereg time (to be MEASURED, not assumed, by
  the census below): villagerPocketAmmo (game.js) pockets own stash,
  then pile stones for slings, then ONE arrow/bolt craft attempt per
  departure using the pile recipes at blind 35% / learned 85%, and
  returns crafted=0 with no counter when pile materials are short —
  so a pocket-call record alone cannot distinguish "materials short"
  from "no recipe" from "not a bow". Pile inflow in code: the 'stone'
  villager duty adds stone to the pile; the storage inflow wrap adds
  branch/wood/bark/vine/hide only; scholar donateMaterial is a
  player-UI path (no policy donates); no villager task adds stick or
  fiber to the pile. Branch is NOT stick in the recipe system.
  These are hypotheses for the census to confirm or refute, not
  verdicts.

## Question

If the village were ordered to arm every ranged fighter tomorrow,
which SINGLE supply step blocks it first, and what would have to
exist (a source, a path, a call) for arrows to exist at all?
Distinguish, on the SUPPLY side, the ammo-a classes applied to
supply: "never produced" (no stick/fiber ever reached the pile, no
craft ever attempted/succeeded) vs "produced but never carried"
(craft succeeded or arrows/bolts exist somewhere, but no fighter
carries them) vs "carried but spent" (a fighter carried ammo, then
arrived at a wave-4 fight dry).

## Substrate (shared w4field/ammo)

Seeds 85101-85116, policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap (dead villages stop, +10d tail max).
Instrument: scripts/ammo-diag-20261031.js (AMMODIAG=1, read-only,
det-gate proven by sim-ammo-a) PLUS the new supply extension
scripts/supply-diag-20261031.js (SUPPLYDIAG=1, read-only: wraps
villagerPocketAmmo a second time ONLY to capture pile + ammoCraft
pre/post each call, and records a daily pile snapshot from the
sweep's daily hook — draws NO RNG, writes NO game state, calls
neither stashState() nor agencyState()). Sweep:
scripts/supply-sweep-20261031.js (ammo-sweep logic + supply
fields, writes evidence/2026-10-31/perseed-supply-b/<arm>/s<seed>.json
ONCE, on purpose). Analyzer: scripts/supply-analyze-20261031.js.
Proof: scripts/test-supply-20261031.js (det-gate 60d identical
trajectories with/without BOTH instruments, static read-only scan,
wrap fixtures, real-sweep gate byte-identical re-run). The proof
must be green BEFORE judged sims are judged (its scratch 60d sweep
is instrument validation, not judged data).

## Census (per wave-4 field fight, per ranged fighter, per seed)

Per fight (from ammo-diag, unchanged): weapon carried, ammo on hand
by type+units, own-stash ammo, pile stick/fiber/stone at fight time,
ammoCraft[vid], pocket history, departure state, caller class, log.
NEW supply fields per seed:
- Daily pile trajectory: per-day raw pile (stick/fiber/stone/branch),
  aggregated to ever>0, max, first-positive day, days-positive,
  final pile — answering "did stick/fiber EVER enter the pile?"
- Per pocket call: pile pre/post + ammoCraft pre/post, so every bow/
  crossbow pocket call classifies as: craft-attempted (out.crafted=1,
  split craftedOk true/false) vs material-blocked (out.crafted=0 AND
  pile short of the recipe at call time) vs not-a-craft-path
  (sling stones, own-stash move, no ranged weapon, player vid).
  A material-blocked call must name WHICH material was short.
- Per ranged fighter ever seen (weaponFirstSeen + pocket history):
  pocket calls, craft attempts, craft successes, ever-carried ammo.
- Per seed, whole-village ammoCraft totals (all vids) and any
  arrow/bolt units existing anywhere at end (fighter packs + own
  stashes + pile-derived? pile holds materials, not ammo — recorded
  as such, never conflated).
- Sling-stone step breakdown per sling fight: (i) no pocket call,
  (ii) pocket call but stones not taken (pile short — impossible if
  pile stone > 0, recorded as contradiction if seen), (iii) pocket
  call capped (carried already at cap 6), (iv) stones not a
  pocketable item (code says they are; a zero-take with pile > 0
  and carried < 6 is recorded as a code contradiction, not assumed).
- Stick/fiber source audit (static + measured): every code path that
  writes pile stick/fiber (from the static reading above: none by
  villager routine; scholar donate; betrayal +4 fiber narrative;
  storage inflow wrap excludes both) checked against the measured
  daily trajectory — if the trajectory ever shows stick/fiber > 0,
  the source must be named from the evidence (donate ledger, inflow
  wrap, or a path the static reading missed, found by grep).

## Verdict (DIAG only — judged exactly as written)

DIAG-GO iff ALL of:
1. Census completeness >= 95%: >= 95% of wave-4 field fights in the
   band carry a complete supply census (fight census + pile-at-fight
   + pocket history with pile-at-call + daily pile ever/max).
   Fights with a null pile read (stash absent) count as INCOMPLETE.
2. The band verdict names ONE binding supply block (sticks, fiber,
   stones, craft path, or carry path) with the per-weapon split
   (sling / crude_bow / crossbow / bow) and the supply-side class
   (never-produced / produced-not-carried / carried-spent) per
   weapon, and states what would have to exist for arrows to exist
   at all (a source, a path, a call — named separately, not blurred).
3. The sling-stone step is named (which of (i)-(iv) above fails).
4. Sense test done (below) and wall numbers stated honestly (below).
DIAG-NO-GO otherwise. A miss is NO-GO, never re-scored mid-run.
Any metric doubt goes under "metric review" in the evidence file
for the NEXT run.

PILOT GATE: 8 seeds (85101-85108) before any confirm spend. Pilot
passes to confirm iff census completeness >= 95% on pilot fights
AND instrument errors = 0 AND the proof test is green. If the pilot
has zero wave-4 fights at all, that is a substrate failure, not a
pilot pass: report it, do not confirm on an empty sample, and do
not claim a supply verdict from zero fights. Confirm: seeds
85109-85116 (band total 16) if the pilot passes.

## Sense-testing (SENSE-TESTING LAW)

Read at least one transcript stretch (fight log copy) where a
fighter carries an empty ranged weapon into a wave-4 fight and judge
whether the narration is honest about it: does the game admit the
weapon is useless, or does it pretend (narrating a volley, a
ranged advantage, or a weapon that never fires as if it mattered)?
Quote the stretch; judge meaning/coherence, never just counts.

## Wall numbers (honest)

National / table / wins / wave 4 unlocked / wave 5 unlocked /
median + max survival for the band, from the per-seed JSONs. If the
band cannot observe scale content, say so structurally (e.g. the
substrate's table/win flags are policy-stack artifacts, or wave-5
unlock is gated on standing the band never reaches) — never present
a policy-stack artifact as a game verdict.

## Panel (§15)

scripts/balance-panel.js is NOT APPLICABLE, none fabricated. It is
a policy-comparison driver on one frozen root; it cannot express
this arm's substrate (the leadfeast + seatdrive + windefer +
fullseat-diag stack is not a registry policy), it has no
before/after root mechanism for a measurement-only arm, and this
arm has no before/after comparison at all (single-base census).
The judge is the pre-registered census-completeness + band-verdict
bar above, exactly as sim-ammo-a declared for its Stage 1.

## Perception law (Steve 2026-10-28)

This evidence must NOT propose a roster/list-fed fix. Any future
supply fix discussed must come through sensed contact and real
routines (a villager seeing, hearing, following, or doing a routine
that moves material) — no magic "who is around / what is needed"
list feeding a decision. A proposal violating this is out of scope
for this arm and must be flagged as such, not recommended.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file after
the run; they do not change this run's verdict.
