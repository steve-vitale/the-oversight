# Scale-onramp round 2315 — Loop A, run fleshout-20261103T2315Z

Axis: scale-onramp (standing directive: the scale wall). Two DIAG-ONLY
arms, zero src/js between them, both merged locally pending ship.
Loop B live on food-economy throughout (2130Z claim: streakfree-cost
+ hurttraveler, later envelope + verifyfield landings) — NOT touched.
Ability-use builder lane, goals-merge lane, gap lane, journey lanes —
NOT touched. No gate/price/deed/win-plan change anywhere in this run.

## Arm 1 — sim-ready5-a: readiness-5 release re-measure, DIAG-GO

Commits on branch sim-ready5-a (rebased onto master 8e98de30d before
merge): prereg f264dac6c, instruments d6413451f, evidence cb58a3187
(rebased hashes). Proof scripts/test-ready5-20261103.js 10/10 before
the judged leg and green post-rebase and on merged master.

CALIBRATION GATE — DIVERGED, re-baselined before the prereg.
Unmodified w4convert driver on seed 99107 at anchor 42f0bd49f: 38
days / village-lost / 0 wave-4 spawns / 0 kills / maxWave 3, vs
1819's 80 days / 3 spawns / 2 kills / maxWave 4. Cause: competent.js
gained +237 lines between anchors (gap-audit11 leg 1 combat-ability
presses + deadfall staffing) plus gap-batch game code — so
"competent VERBATIM" is a different policy than 1819's. The 1819
numbers are previous-anchor only and are never pooled with this leg.
The tbfinish arm independently reproduced the same divergence
(38d / 0 TB at 42f0bd49f), so the re-baseline is corroborated.

DOOR RULE, as found in code (not taken on faith): release to wave 5
needs capped standing >= 200 (t5 = 200; plenty capped at 100) AND all
four readiness-5 bars (armored 4 @ P>=15 worn, armed 6, tricks 3,
veterans 2 living roster members with a wave-4+ kill in
state.waveKillLog, VETSHAPE off). While capped >= 200 but unready,
the gated total holds at 199 — 199 is the hold value, not a target.
unlockedWave() == 5 additionally needs the wave-3 rung + wave-4
faced.

JUDGED LEG (competent verbatim, seeds 99101–99108, 140d
death-aware): readiness-5-ready days 0 on all 8 seeds. Door opens
(peak 5) 0. Wave-5 faced 0. Wins 0/8, national 0/8, table 0/8;
scaleRank village on every snapshot. Wave-4 faced 6/8, wave-4
released (peak 4) 6/8; readiness-4 days total 269. Median survival
76.5d (99105 censored, alive at the 140d horizon); 7 lost, 1
survived to horizon.

Standing-sufficient days exist and still don't release: 75 days
with capped >= 200 (99102: 51, 99106: 24); on 39 of them veterans
is the ONLY short bar. Tricks (max 16–30 vs demand 3) and the
plenty cap never bind; diplomacy is 0 everywhere.

Veteran reconciliation, complete: 4 wave-4 kills total, one per
killing village, max 1 living veteran anywhere — rosa_mendez
(99102, day 65, companion kill; veteran 26 days; died day 91 "the
wild"), olivia_bennett (99105, day 105; died day 128 "monster"),
mateo_alvarez (99106, day 75; died day 76 "the wild"), visjoin_104
(99101, day 133; died day 135 "the wild"). 0/4 killers alive at
end. Gate veteran count == independent recount on all 678
snapshots; 0 instrument errors, 0 mismatch days, 0 unclassified
door events.

VERDICT — DIAG-GO (current anchor only). It does NOT test
release-after-ready: no ready days occurred, so release working or
failing must not be cited from this leg in either direction. The
hold mechanism itself is verified working as designed. Full detail:
evidence/2026-11-03/sim-ready5-a.md + perseed-ready5-a/.

## Arm 2 — sim-tbfinish-a: TB turn-economy decomposition, DIAG-GO with named miss

Commits on branch sim-tbfinish-a (rebased onto post-ready5 master
before merge): prereg 97df992fd, instruments 809bab8f9, analyzer
fix 5cb6444bb, evidence 02b3b6596 (rebased hashes). Proof
scripts/test-tbfinish-20261103.js 4/4 before the judged leg, green
after the analyzer fix, and on merged master.

CALIBRATION GATE — DIVERGED, re-baselined (same finding as
ready5, independently reproduced): 99107 at 42f0bd49f gives 38 days
/ 0 wave-4 spawns / 0 TB fights vs 1819's 80 days / 3 spawns / 2 TB
/ 2 kills, reproduced exactly on rerun. All numbers below are this
anchor's band, never 1819's.

JUDGED LEG (seeds 99101–99108, 140d, competent verbatim): 51 TB
exposures, 284 recorded player turns, 0 instrument errors, 0
unended exposures, 0 unclassified exposures/turns. Outcomes:
fighter-died 49, kill 2, fled 0. Per-seed TB/kills: 99101: 9/0;
99102: 8/1; 99103: 8/0; 99104: 7/0; 99105: 12/0 (only survivor,
140d); 99106: 7/1; 99107: 0/0; 99108: 0/0. Kill rows total 4: 2 TB
kills (both linked, ledgers gap 0) + 2 field kills correctly
unlinked (99101 eater via 'wild' by visjoin_104; 99105 algorithm
via 'wild' by olivia_bennett). Lost fights: median 2 strikes, 5
rounds, 0.05 dealt fraction (tbleth at 1819: 3 strikes, 6 rounds,
0.16) — the race got worse at this anchor.

WHERE EACH ROUND GOES (the answer): every turn has exactly one
verb, never two. Strikes 151/284 (53%, 154 attempted, 151 landed);
flee-attempt 48 (17%, 0 escapes, 0 barrier pushes ever); move-only
42 (15%); ability 40 (14%, all presses: rage 35, pocket_sand 4,
war_cry 1; 0 shouts/offers/studies/talks; trickKnown false in all
51); failed-strike 3 (all empty ranged weapons); wait 0,
move-strike 0, stunned 0, no-action 0. Of 90 move actions, 73 move
zero tiles (39 self-moves on edge tiles, 30 "No path there", 3
"Too far", 1 occupied). The engine permits move-then-strike (move
never sets acted) — the policy's beastStrikeTarget returns 'moved'
instead. Monsters deal damage on only 186/385 monster turns (48%);
the rest telegraph/hold/don't hit. Flee mechanism: all three flee
gates off by default, so the legacy walk-to-edge fails on
unpathable edge tiles or its own tile, and the stuck-flee
resolution (fight it out after 3 stuck turns) never fires. Rage
loop: 35 presses, 6 of 8 rage fights with 0 strikes (worst: 10
presses, 600 kcal, 0 damage, then flee, then death) — no
once-per-fight gate, policy re-presses instead of striking. Eulogy
clock confirmed and bounded: 3 finishers, all round 6, but only
3/13 eulogy fights reach it. Eater: flat ~12 absorption per strike
(1 fight, transcript-verified).

TWO DISCLOSED GAPS (in the arm evidence, neither hidden): (1)
Round-1 player turns are missing from per-turn records (opening
pass runs inside startCombat before the exposure exists) —
bounded: debug-seed census 8/8 round-1 actions are closing moves,
band-wide 0 round-1 strikes/damage, so the table misses ~1 move
turn per fight and nothing else; the next arm's instrument spec
(pending buffer) is written in the arm evidence. (2) One orphan TB
end (99102 suburb, 'routed', monster at full HP) — proven a
zero-turn scripted rout inside a single startCombat call, not a
missed fight; the next arm's prereg should pre-register zero-turn
routs as a non-exposure class.

VERDICT — DIAG-GO WITH ONE NAMED MISS (coordinator-weighed): every
prereg clause holds except the orphan letter, missed by exactly
the proven scripted rout above. A strict reading of that clause
alone would say NO-GO, but that would discard a complete
decomposition (284/284 turns classified, all ledgers reconciled,
all kills linked or explained) over an episode with no rounds to
decompose — so it is reported as a named miss on an otherwise GO
diagnostic, not hidden and not re-scored. Full detail:
evidence/2026-11-03/sim-tbfinish-a.md + perseed-tbfinish-a/.

## Village assessment (plain words + sense-testing)

Picture eight villages playing competently for up to 140 days on
the current anchor. Seven die; one survives to the horizon without
reaching anything past wave 4. Nobody banks two living veterans,
nobody opens the wave-5 door, nobody sits at any table. The wall
did not move — but its shape got sharper: the binding link is now
precisely wave-4 kills plus killer survival (4 kills across 8
villages, every killer dead within days), and inside the fights
the binding mechanism is now precisely fleeing that never escapes
plus turns spent moving nowhere. Fighters are not under-geared
(leads armed and armored throughout, still losing) and not
standing-short on the closest seeds (standing clears 200 for 75
days). They lose because a wave-4 fight gives them ~5 rounds in
which ~half the turns go to strikes, ~a sixth to flee attempts
that cannot succeed, and the rest to moves that move zero tiles —
while the beast needs ~20x what they deal. No new robotic-behavior
flag: killers are named, deaths carry engine causes, transcripts
read like people; the repetition flags from tbleth stand as
flavor, not logic.

## Wall numbers (this run, current anchor — not wall movement)

Wins 0/8. National 0/8. Table 0/8. Wave-5 unlocks 0/8, wave-5 faced
0/8. Wave-4 faced 6/8 (ready5 leg; tbfinish leg: 51 TB exposures
across 6 fighting seeds, 2 TB kills). Readiness-5-ready days 0.
Median survival 76.5d (ready5 leg). Full seat still unwon; wave-5
kill still 0 in normal play.

## Infrastructure + verification

- Master moved twice during this run (Loop B hurttraveler already
  at base; then envelope/verifyfield/goals/journey landings to
  8e98de30d, then journey-establishment r83 after my merges).
  Both arms rebased cleanly (no conflicts), proofs re-run green
  post-rebase and on merged master (ready5 10/10, tbfinish 4/4).
- check.js --quick on merged master (run twice, same result):
  284 passed, 6 failed in ~460s. The 6 failures are
  proof-freshness / pre-existing-profile classes, NOT this run:
  measurement-proof-update (proof source inputs not current —
  the known stale proof documented in the 2026-10-29 tracker
  rebuild header), measurement-workflow (retained neutrality
  proof vs current inputs), mobile-combat-cadence (Continue
  round-wrap), occupation-panels (CLI workflow), phone-frame-proof
  (stale phone receipt), establishment-r20-fixes (racks-full
  voice gate). This run's 7 commits touch only evidence/ and
  scripts/ (verified per-commit file lists; the src/ diff vs
  42f0bd49f is other lanes' master landings, not these arms).
  No green-list test was added or modified by this run.
- Telemetry deviation check: recorder-corpus input refused
  without --allow-recorder-corpus; with it, 3 LOUD lines
  (national baseline 12 -> current 0; table 16 -> 0; wins 16 ->
  0). VERDICT: EXPLAINED, not a new bug — the baseline is a
  WINSEAT-era regime, while every scale-onramp competent panel
  since 1819 reads 0/0/0, and this run changed zero src/js.
  Baseline NOT rolled (same class as prior runs' documented
  competent-pilot vs WINSEAT-baseline non-roll).
- Registry flock contention stalled worktree registration (~15
  min, checkout + reap queue) and one worker heartbeat (~17
  min); no sibling tree touched, no data lost. Safe-commit
  index clobber hit worker commits (repaired via HEAD-blob
  cacheinfo per AGENTS.md, commits verified correct).
- Both worker trees released as done-merged, worktrees removed,
  branches deleted, main tree clean. No push, no bump, no live
  verification (ship loop owns deploys).
- Rotation left at 3 (axis-driven work under convergence
  direction, not the rotation cycle).

## Metric review (§14 — no in-run re-scoring)

- Both arms' preregs declared §15 inapplicable (pure
  diagnostics); no comparison was fabricated. The telemetry
  check above is the coordinator's deviation check, not a
  balanced-panel comparison, and its LOUD lines are judged
  here as explained, not re-scored.
- Both calibration gates diverged and both arms re-baselined
  explicitly before their judged legs, per the 1819 metric-review
  proposal. The gate rule is now load-bearing: any future arm
  reusing the 99101–99108 band MUST calibration-gate first,
  because "competent VERBATIM" drifts whenever the policy file
  moves.
- tbfinish's orphan-clause miss is reported as a named miss,
  not waived: the prereg clause stands, the verdict carries the
  miss openly, and the next arm's prereg is told to
  pre-register zero-turn routs as a non-exposure class.
- Ready5's release-after-ready question is UNTESTED, not
  passed or failed: with 0 ready days, no claim about release
  behavior follows from this run in either direction.

## Next blanks, in order

1. FLEE-REPAIR arm (tbfinish next blank): (a) make the barrier
   push actually happen (directional-flee path at default gates,
   or fix the legacy walk to push instead of walking to
   unpathable edge tiles); (b) walk-failure fallthrough — a
   failed flee walk falls through to a strike when in range
   instead of ending the turn; (c) enable stuck-flee resolution.
   Pre-register escapes per flee-triggered fight + strikes per
   fight on identical seeds, calibration gate first, no
   gate/price/deed changes.
2. KILL-CONVERSION / KILLER-SURVIVAL arm (ready5 next blank):
   wave-4 kills + killer survival on this anchor — not release,
   not gear, not standing. No gate/price change follows from
   this evidence.
3. After flee repair: trick-availability arm (real gap,
   unmeasured payoff), then the Rage once-per-fight gate.
4. Move+strike as a later cheap tweak (~10 addressable turns,
   small prize — not the arm).
5. Readiness-5 release-after-ready test, owed once any village
   actually reaches ready days (untestable until then).

scale-onramp stays converging (NOT converged): full seat still
unwon, wave-5 kill still 0, but the wall is now measured to two
precise mechanisms (flee that never escapes; kills that never
accumulate into two living veterans). food-economy untouched
(sibling Loop B lane).

Claim deleted; lock deleted.
Merged locally, pending ship (ready5 f264dac6c + d6413451f +
cb58a3187 rebased; tbfinish 97df992fd + 809bab8f9 + 5cb6444bb +
02b3b6596 rebased; coordinator evidence this file).
