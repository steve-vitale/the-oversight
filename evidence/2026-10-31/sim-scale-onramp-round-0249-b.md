# Loop B round 0249Z — scale-onramp triptych (3 DIAG-GO arms, merged locally pending ship)

Run: fleshout-loop-b-20261031T0249Z, axis scale-onramp (topmost,
converging). Loop A NOT live at run start (no fleshout-loop.lock,
no live claim; its 0016Z round had closed via the main session),
so B took the topmost non-converged axis per the
convergence-directed rule instead of its usual second axis.
Claim: hidden_files/lever-claims/fleshout-loop-b-20261031T0249Z.json
(retired to .DEAD at closeout); lock deleted at closeout.

Shared substrate, supply + herald arms: seeds 85101–85116, policy
stack withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap (the killconv/w4field/ammo band).
Volleyfix arm uses a forced-meeting fixture band instead (see its
evidence) — that is the divergence-proof design, not a substrate
deviation. All DIAG ONLY, zero src/js, zero policy-default flips,
zero edits to existing policy files.

## Arm 1 — sim-volleyfix-b: DIAG-GO

Commit a219569de (rebased from dcbc7e898; proof 39/39 on rebased
tree and on merged master). Evidence:
evidence/2026-10-31/sim-volleyfix-b.md (+ prereg).

The divergence-proof volley measurement sim-ammo-a asked for:
forced-meeting fixtures calling the real Game.fieldFight, one
fixed roster fighter reset from snapshot before every fight, each
ON/OFF pair sharing one RNG stream and differing only in ammo on
hand, beasts at exact midpoint HP. Confirm: 128 ON + 128 OFF fights.

- Volley shots > 0 on 128/128 ON fights (100%, bar >= 75%).
- Median volley damage 21.5 (mean 24.5); median volley share of
  total fight damage 60.5%; median volley fraction of beast HP
  2.0% (best single fight 8.0%, crossbow vs congregation).
- Per weapon (median volley / HP fraction): bow 17.0 / 1.7%,
  sling 19.0 / 1.8%, crossbow 38.0 / 3.4%. 1-arrow edge: 1 shot on
  8/8, median 15.5, 0 flips, 8/8 deaths.
- Outcomes, confirm: ON — 83 deaths, 45 flees, 0 kills,
  0 drive-offs; OFF — 94 deaths, 34 flees, 0 kills, 0 drive-offs.
  A lone fighter's whole fight lands a median 35.5 damage against
  950–1200 HP, and the volley does not reduce damage taken
  (median taken 114.5 ON vs 108.0 OFF).
- Outcome flips 27/128 (net −11 deaths / +11 flees) are NOT a
  clean causal count: the volley consumes RNG draws, shifting all
  later draws, and trick-knowledge intent drifts across the
  process. The robust claim is the zero: no flip ever reached a
  kill or drive-off.
- Sense test: a full transcript reads as a person fighting —
  volley announced, every shot accounted for, misses honestly
  spent. Two wording blanks recorded, not fixed (DIAG-only):
  beasts render as "the something" (knowledge-gating, coherent),
  and sling/crossbow volley lines always say "arrow".
- Wall: not observable on this substrate (no village trajectory,
  scale ladder, or win flag) — stated structurally, not as 0s.
  The wall implication is a ceiling: perfect ammo delivery to a
  lone wave-4 fighter buys ~2% of beast HP and zero wins.
- Panel (§15): not applicable, none fabricated (fixture band,
  no policy, ammo ON/OFF pair as the comparison).

Plain words: when a fighter actually has arrows in hand, the bow
works exactly as promised — but a wave-4 beast is ten times too
big for it. The volley is more than half of everything a lone
fighter achieves, and it still never wins the fight.

## Arm 2 — sim-supply-b: DIAG-GO

Commit 72a66dc5f (rebased from 427abf3d2; proof 19/19 on rebased
tree with the documented env, and on merged master). Evidence:
evidence/2026-10-31/sim-supply-b.md (+ prereg).

The stick/fiber supply blank sim-ammo-a left open. The binding
supply block is STICKS: pile stick = 0 and fiber = 0 on every day
of all 16 seeds, while stones pile to 15–848. All 36 bow pocket
calls were material-blocked at the recipe check (15 stick-only,
21 stick+fiber); 0 craft attempts, 0 craft successes, 0
arrow/bolt units in any pack or stash at end of any seed. All 14
ranged wave-4 fights are "never-called-never-produced"
(crossbow 3, sling 7, crude_bow 4), volley 0 shots. Supply class:
never produced — not produced-but-never-carried, not
carried-but-spent. Stones are not a block (sling pocketing works
when called: 9/11 calls took stones; the 2 misses are an early
empty pile and an at-cap fighter). The sling fight step is (i) no
pocket call, 7/7. A sling volley needs only the call fixed; a bow
volley needs a stick/fiber source routine AND a call reaching
home fighters. Fiber is the second block, arrows only (bolts need
no fiber).

- Census completeness 30/30 wave-4 fights (100%, bar >= 95%):
  evade 3, vFlee 20, vDie 7, vKill 0. Instrument errors 0/0.
  Per-seed fight identity reproduces sim-ammo-a's baseline corpus
  on all 16 seeds despite the anchor moving.
- Wall (this band, observable): national 8/16, table 12/16,
  wins 11/16, wave 4 unlocked 9/16, wave 5 0/16, median survival
  111d, max 139d.
- Sense test: narration is honest ("the string stays drawn,
  useless," no volley pretended) but mislabels slings as missing
  "arrows" — appended to the findings backlog by the coordinator
  as an open wording nit (same class as ammo-a's dry-line blank).
- Panel (§15): not applicable with reason in the evidence, none
  fabricated.

## Arm 3 — sim-herald-b: DIAG-GO

Commits cf2f8ab8e (prereg + instrument + proof 20/20) and
3d2b7ba5f (evidence + corpus), rebased clean onto the moving
master; proof 20/20 re-run on the rebased tree and on merged
master. Evidence: evidence/2026-10-31/sim-herald-b.md (+ prereg).

The heraldic-refusal census from the findings backlog. Wave-4
startCombat attempts: 63 = 28 fought + 35 refused (completeness
100%, tbEnd join 96.4%, game-side refused-record match 100%,
0 instrument errors). Herald: 35/35 refused, 100%, all
MUSTER-GATE (0/10 allied blades vs need 10). Non-titan wave-4:
28/28 fought, 0 refused. No other titan was ever attempted (wave
5 never unlocked).

- Corrected counts: TB "meetings" 63 → 28 fought (2 wins); field
  meetings 30 → 27 fought (20 fled, 7 died, 0 killed). The
  0-field-kill headline SURVIVES the correction — refusals were
  never field fights. Combined fought meetings: 55, not 93.
- Quotation corrections: killconv's "40 Herald refusals" is 35
  reproducible + 5 from irreproducible seed 85112; its "3 TB wins
  in 28" corrects to 2 in 28 (the third win sat on 85112).
- What refusal IS (code-read): the titan hard gate in
  titanWrapCombat (src/js/titans.js) returns before startCombat's
  body, so the monster stays on its tile and no pending is
  cleared. All 35 refusals are engine contact, not driver
  hunting: the Herald walks onto the scholar's tile on its own
  monster turn (game.js monsterTurn hungry-contact branch) and
  the engine re-fires, up to 9 times in one day. The prereg's
  deedHunt hypothesis is refuted by the stack traces. Nobody ever
  attempts the prescribed remedy — 0 muster events on all 16
  seeds — so the loop repeats until the monster wanders off or
  the village dies.
- Sense test: the refusal line is honest and legible once, then
  repeats identically 35 times; and the gate binds only the
  scholar's channel, since lone villagers fight the same Herald
  3 times via fieldFight (all flee). No roster/list-fed fix is
  proposed (perception law). The channel asymmetry is appended to
  the findings backlog as an open item by the worker.
- Wall (this band, observable): national 8/16, table 12/16,
  wins 11/16, wave 4 unlocked 9/16, wave 5 0/16, median survival
  106.5d, max 139d.
- Caveats carried: the second of two same-day same-monster
  (day 134 reunion) fights on s85109 carries end=null in the
  corpus because the sweep joins tbEnd by (day,mid) queue rather
  than fight id; that seed's 134 day-hashes are byte-identical to
  killconv's, which records it 'lost'. Metric review recommends
  fight-id joining next time. Replay reproduces killconv on 15/16
  seeds exactly; s85112 matches w4field exactly (90d, won,
  national, 3 TB, 3 FF), confirming killconv's s85112 corpus as
  irreproducible on a third instrument.
- Panel (§15): not applicable (single-base measurement, no
  before/after); none fabricated.

## Wall numbers (this run)

Supply + herald bands (observable scale content, identical
substrate): national 8/16, table 12/16, wins 11/16, wave 4
unlocked 9/16, wave 5 0/16, median survival ~106–111d. Volleyfix
fixture band: scale content structurally not observable.
Overall wall UNCHANGED: full seat 0 on the wave-4 question that
matters here (no wave-4 field kill anywhere, fought-only or
otherwise), wave 5 reached 0 stands. The decomposition sharpens
again: damage shortfall + solo + no supply + gate-refused titans
— and now with ceilings: even perfect ammo buys 2% of beast HP
for a lone fighter.

## Telemetry deviation check

Ran on both run corpora (supply baseline, herald leadfeast):
the tool REFUSED both by design — "recorder-corpus input: all 16
rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs." Same refusal class as the w4field/ammo corpora.
Baseline NOT rolled, per standing rule. No LOUD lines were
produced because no comparison was performed; the refusal itself
is the recorded outcome.

## Metric review

No metric was re-scored mid-run. Each arm judged exactly against
its own prereg (all three DIAG-GO). Carried for the NEXT run's
pre-registrations (not substituted here): (1) volleyfix's
flip-count caveat — an ON/OFF pair sharing one RNG stream cannot
yield a clean causal flip count when the volley consumes draws;
future fixture preregs must pre-register either a
draw-compensated design or a zero-only claim. (2) herald's
fight-id join recommendation for tbEnd. (3) The volleyfix
party-volley fixture (party + gear) is the next question on the
damage ceiling, not another lone-fighter ammo measurement.

## Infrastructure

Master moved 3 times under the run: journey-social r80
(168db1ea3) before the first merge, then the three arm merges in
order (volleyfix → supply → herald, each rebased clean + proof
re-run after its rebase and again on merged master), then
journey-scale r60 (e9d6494f9) during release. All three arm
commits verified as ancestors of the final master. Safe-commit
index clobber hit all three workers' commits (worker-repaired
via HEAD-blob cacheinfo; commits verified correct). Release slow
(~2 min per register/release step, reap contending with sibling
git-status processes); no sibling work touched — reap's LOUD
notes about journey2-succession / journey-scale uncommitted
changes were honored (never auto-removed). check.js --quick NOT
re-run (zero src/js, zero policy-default flips, sibling loops
live). Worktrees released as merged, branches deleted:
sim-volleyfix-b, sim-supply-b, sim-herald-b. Claim retired to
.DEAD; lock deleted. Merged locally, pending ship.

## Village assessment (plain words)

The village can see the wave-4 beast, can stand next to it, and
cannot hurt it. Its archers carry bows with no arrows because the
village never brings a stick or a strand of fiber into the pile;
its slingers walk past a mountain of stones with empty slings
because nobody ever tells them to pick one up. Give one fighter a
perfect quiver and the bow sings — for about two percent of the
beast. And when the great Herald arrives, the scholar is told to
sound a call nobody has ever sounded, so the beast just keeps
arriving, day after day, while the village dies around it. The
blanks are no longer "why doesn't the bow fire" — they are: who
brings sticks, who sounds the call, and who stands beside the
fighter when the beast comes.
