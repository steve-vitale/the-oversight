# journey-landing r128 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261112T1331Z (scheduled Thu 2026-11-12 06:45 CST, started ~13:31Z).
Rotation read 0 → leg 0 LANDING; write 0→1 at run start (verified by read-back).
**Base:** local master `bff8b86b6` (journey-scale r133 + sim-mcconfirm-refresh-b landed since r127's base d897eab1f). `git pull --ff-only` in main tree: already up to date. Main tree clean at start; disk 40%.
**Lock:** created 13:31:22Z, run_id `2026-11-12T13:31:22Z`. Heartbeat loop `/tmp/hbloop-r128.sh` (every 10 min) after registration. **Delete lock at closeout, even on failure.**
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r127, so this run is r128.

## Seed band — DELIBERATE REUSE (defect band, 6th run)

**Seeds 1142–1151 (the r121 band, reused on purpose).** The Q1 defects were
observed live on this band (r127 run note: 1146 d27 redactor, 3× failed step
to (8,3) while the ally Wanjiru died beside the scholar, fight lost) and on
the fresh band 1200–1209 (1202 gallowdeer, 1208 callback, 1209 statickite).
The judge is the WITHIN-RUN before/after delta on identical seeds (§15),
never a cross-run comparison, so the reuse cannot contaminate the verdict.
**Freshness check (local_seed_band_freshness skill, this run, before any
scored seed):** grepped `evidence/` preregs for `1142` / `1142–1151` — named
in journey-landing r121–r127 preregs and journey-establishment
r117/r118/r127/r128/r131/r132/r133 preregs; no forbidden-band list names
1142–1151. Reuse is sanctioned here by r127's run note, which names this
fix "carried for r128 / the combat-play gate" — this run IS that owning
run (landing leg owns the scholar-turns watch). Reservation explicitly
released for this run's named remainder. Recorded here per the skill.

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the
SAME seeds 1142–1151, DAYS=28. BEFORE = r127 AFTER driver verbatim except
OUTDIR/header + the policy require pointed at the FROZEN pre-fix policy
(`scripts/policies/competent-r127.js`, a byte copy of `competent.js` at base
— the fix lives in the policy file both drivers load, so the freeze is what
makes BEFORE a true baseline) + the r128 move-refusal instrument (driver-
only, both drivers). AFTER = the same driver verbatim except OUTDIR/header,
loading the FIXED `scripts/policies/competent.js`. No other delta between
the drivers.
Analyzers: scripts/analyze-landing-r118-outingchain.js;
scripts/analyze-landing-r126-presshop.js;
scripts/analyze-landing-r125-personal-bridge.js;
scripts/analyze-landing-r126-bridge-pools.js;
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js;
scripts/analyze-landing-r120-scholar-turns.js;
scripts/analyze-landing-r107-commit-offer.js (WITH the r122 settled-favor
exclusion); scripts/analyze-landing-r127-topic-dwell.js;
scripts/analyze-landing-r128-move-refusals.js (NEW — Q1, see below).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r127's named
remainder (the unchecked `tbPlayerMove` call sites). A game-code fix is in
scope ONLY if the instrument shows a defect the policy cannot fix alone —
the fix is policy-only by design (see below).

## Canon

docs/CANON.md read at run start. No canon doc covers the competent-policy
fight movement (Q1) — that is sim-harness policy, not game code; the fix
changes only how the sim player walks, never game rules. MONSTER-WAVES.md
covers the monsters fought (redactor, gallowdeer, callback, statickite are
wave-2/3 beasts); the fix does not touch monster stats, waves, or loot.

## Q1 (PRIMARY) — THE SCHOLAR WHO WALKS NOWHERE, PART 2: unchecked tbPlayerMove at the flee + dodge sites

**Basis (r127 run note, read pre-panel):** the panel's failed moves are NOT
approach moves. `tbPlayerMove` results are ignored at FOUR more call sites
in `competent.js`, all live on the r127 panel:
- Legacy flee walk (`competent.js:~3651`): `Game.tbPlayerMove(tx, py)`
  passes the FAR edge tile in one call — the same "step, don't teleport"
  shape the r6 fix cured in the strike path. Live: 1146 d27 redactor (3×
  failed step to (8,3) while the ally Wanjiru died beside the scholar;
  fight lost), 1202 d19 gallowdeer (2× to (0,3), fight lost), 1208 d29
  callback (3× to (0,4)).
- Trick dodges (`:2532` move_windup, `:2581` sidestep, `:2613`
  keep_distance): `tbPlayerMove` result ignored. Live: 1209 d13
  statickite (4× failed dodge to (5,3) under the scan-grid telegraph;
  scholar survived and won, 12 strikes — wasted turns, not a death).
- The refusal REASON is unknown from the r127 corpus (Game.say is silenced
  by the harness; no say-line reaches the logs). Candidates: far
  destination exceeds moveLeft (legacy flee), destination occupied
  (dodge), moderator mute. NOT asserted — this run instruments the refusal
  before fixing.
- The directional-flee one-step path (`:3544`) and the flee-repair stuck
  counter exist but are env-gated OFF (`COMPETENT_DIRECTIONAL_FLEE`,
  `COMPETENT_FLEE_REPAIR`, `COMPETENT_EXIT_VERIFIED_FLEE` — none set by
  the driver). Out of scope: the fix is in the DEFAULT (legacy) path,
  not a driver flag — a driver flag would leave the defect live for
  every other driver.

**Instrument (driver-only, BOTH drivers, FIRST — before any fix):**
the existing `tbPlayerMove` wrap (r120 scholar-turns instrument) logs
`{turn:'player-move', to, moved: !!r}` — but `moved` is the return value,
which LIES under the moderator mute (returns true without moving), and
carries no refusal line. The r128 wrap records, per call, while a
turn-based fight is live: `from` (scholar position before), `to`,
`ret` (the raw return value), `posMoved` (position actually changed —
the same position check the r127 fix uses), and `lines` (the say-lines
spoken during the call, sliced from the driver's `capture` stream —
the engine's own refusal text: 'No path there.', 'Too far — N squares
left.', "You don't stroll through …", 'No movement left this turn.',
or none under a moderator mute). New analyzer
`scripts/analyze-landing-r128-move-refusals.js` reads the fightLog
player-move entries and tallies refusals by (site-shape, reason):
flee-walk vs dodge (inferred from `to`: an edge tile x=0/8 is a flee
walk; anything else a dodge/approach), reason from the first line, and
the stuck-fight shape (≥3 failed moves, 0 strikes, living scholar).

**Fix (policy, NO src/js change — the r127 fix shape, per site):**
- **Legacy flee walk:** step ONE tile toward the chosen edge (dx =
  sign(tx−px), same py), never the far edge in one call; if that tile
  refuses, try the two diagonal one-steps toward the edge
  (px+dx, py±1); accept a move only when the scholar's position
  actually changes. A moved walk resets the stuck count, counts
  `ctx.fled`, ends the turn, returns true (unchanged turn-ending
  behavior for the working path). A turn where no tile is reachable
  records `ctx.fleeStuckTurns` (+1) and `ctx._fleeStuck = {for: f.id,
  turns}` (the r37 gated-resolution shape, ungated for the legacy
  path); at 3 consecutive no-progress flee turns on this fight, mark
  it unfleeable (`ctx._fleeBlockedFor = f.id`, `ctx.fleeBlocked` +1)
  and return FALSE — so fight() falls through to tricks/strikes in
  the SAME turn, the way the gated directional-flee code already does
  ("the turn is still the player's — do NOT end it"). A real player
  reads the room and fights; the d63 moderator loop (25 no-progress
  rounds, scholar down without striking) is the shape being cured.
  The barrier-push path (dpsRaceOn) is untouched.
- **move_windup / sidestep:** try EVERY free tile (same sort as
  `beastDodgeTile` — nearest first, filtered by the avoid-lane set),
  position-check each; a move that lands counts the trick
  (`trickDone()`), ends the turn, returns true. A turn where no tile
  is reachable records `ctx.dodgeStuckTurns` (+1) and
  `ctx._dodgeStuck = {kind, from, monster}` and ends the turn WITHOUT
  counting the trick — the trick didn't happen, so it must not be
  counted as performed. `tried[m.key]` stays set (the trick was
  attempted this fight; retrying the same failed dodge every round
  is the loop being fixed — next round fight() falls through to
  strike logic).
- **keep_distance:** the candidate loop already exists but `break`s
  after the FIRST affordable candidate's move attempt regardless of
  result — break only when the position actually changes; try the
  next candidate otherwise. If already at the trick's distance
  (d === need), no move is needed and `trickDone()` is honest
  (unchanged). If no candidate moves, record the stuck counters and
  end the turn WITHOUT counting the trick.
- Out of scope, noted for r129: `move_x2` (`:2563`) also ignores the
  result, but it pre-validates path cost ≤ moveLeft, so only a
  moderator mute can strand it — no live case on the r127 panel.
  The directional-flee walk (`:3544`) ignores the result too, but it
  is env-gated OFF and already has fleeRepair stuck counting when
  gated on.

**Proof tests (NEW, one per site, stub Game/fight, separate processes,
modeled on r127's strike-fallback test):**
`scripts/test-journey-landing-r128-flee-fallback.js` (legacy flee walk:
first-tile-blocked moves on the diagonal alternate / all-blocked records
stuck and falls through to fight at 3 turns / control walks one step
and ends the turn), `scripts/test-journey-landing-r128-dodge-fallback.js`
(move_windup + sidestep + keep_distance: first-tile-blocked moves on
the next tile / all-blocked records stuck without counting the trick /
control dodges and counts it). Each MUST FAIL on unfixed code (the
unfixed policy returns 'moved'/counts the trick with the scholar
unmoved) and be ALL GREEN after.

**Pre-registered metrics (binding):**
- M-Q1a (instrument): the refusal table is complete — every
  player-move entry with posMoved:false on BEFORE carries a refusal
  line (or an explicit 'none' count for moderator-mute silences).
- M-Q1b (fix): on the AFTER corpus, ZERO fights with a living scholar,
  ≥3 failed flee/dodge moves, and 0 strikes (the 1146-redactor shape).
  If the shape persists on AFTER, the fix is NO-GO — do not re-score.
- M-Q1c (proof): all proof tests ALL GREEN post-fix AND FAIL on
  unfixed code.
- The 1146 d27 redactor fight is the standing reproduction case (seed
  1146, frozen policy). If it does not reproduce on this base (base
  moved since r127), the metric is judged on the panel's live cases
  plus the fresh-band scan only if a live case appears there — record
  the non-reproduction under metric review, do not re-score Q1 on a
  vacuous panel (r127's Q1 lesson).

## Q2 — PRACTICE (carried)

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (r117 hunt-assignment policy question carries —
eleventh panel running).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122:
103, r123: 95, r124: 95, r125: 96, r126: 100, r127: 97).

## Carried bindings (judged fresh on the post-fix AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r127: 5/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r127: 1 day, non-vacuous).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight
  (this run's Q1 — see above).
- **Deflect-fallback repetition:** worst sitting count (r127: 0 flags on AFTER2).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean (r127: 24.6).
- **Poison re-test:** count live re-tests (r127: 0).
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7 GOAROUND:** R84 prompt arrival ≥80% = GOAROUND-HOLDS; R85 complete == skips = RESCUE-GO.
- **Personal bridge (r125 fix):** 0 repeats in a sitting on the AFTER corpus.
- **Small bridge (r127 Q2 fix):** 0 repeats in a sitting on the AFTER corpus
  (regression check on the r127 fix).
- **Q1 r126 (combat-interrupted evening chain):** presshop farUnreached stays 0 on AFTER (regression check on the r126 fix).

## Seeds, pilot, shape

- Panel: seeds 1142–1151 (deliberate reuse — see above), DAYS=28, OUTDIR
  landing-r128-before (BEFORE driver, frozen policy) and
  landing-r128-after (AFTER driver, fixed policy), both under goal
  hidden_files evidence/2026-11-12/.
- PILOT FIRST: 3 seeds (1142, 1146, 1150 — includes the Q1
  defect-adjacent seeds), BEFORE driver, before expanding. The pilot
  validates (a) seeds run; (b) the practice snapshots present in census
  JSON; (c) the outingchain analyzer runs on the pilot corpus; (d) the
  invariant test passes; (e) ≥1 forage_help favor observed; (f) ≥1
  evening together attempt on a far node (d≥4); (g) the move-refusal
  instrument captures ≥1 failed move WITH its refusal line (the 1146
  redactor case if it reproduces on this base, else any failed move —
  the instrument is the pilot's point, not the defect); (h) the
  move-refusals analyzer runs on the pilot corpus. If the pilot shows
  0 favors, document and still run the panel only if the carried
  bindings need the panel — the pilot decides; do not burn a full run
  on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is. The
  r126 presshop analyzer compares the two corpora for the outing shape
  (r126-fix regression check). The invariant test re-runs on the AFTER
  panel corpus as the after-proof. Q1 is measured by the move-refusals
  analyzer + the scholar-turns analyzer + the 1146 fight-log read.
  The Q2 topic-dwell analyzer runs on BEFORE first, then AFTER (small-
  bridge regression check).

## Amendment 1 (2026-11-12, mid-run — probe finding; binding metrics UNCHANGED)

- The r128 probe (stack trace on the 1209 d13 fight, seed 1209) proved the
  four identical (8,0)→(5,3) failed steps come from fight()'s inline
  CLOSE path (competent.js fight(), "CLOSE THE DISTANCE"), NOT from a
  dodge — a FIFTH unchecked-tbPlayerMove site, outside Q1's named four.
  The r127 strike fix covered beastStrikeTarget (called only from the
  strike tricks), not fight()'s generic close. The fix (closeStep: try
  every adjacent tile, nearest first, position check, honest closed
  counting, stuck recorded) is added to this run's scope; it is judged
  by its own proof test (FAIL on unfixed / ALL GREEN after) + the
  focused scan delta on 1209 as descriptive evidence. M-Q1a/b/c are NOT
  re-scored: M-Q1b's "≥3 failed moves, 0 strikes, living scholar" shape
  occurs on NO corpus (0 on all four), so the fix's verdict rests on
  the proof tests + the repeat-sequence evidence, per the r127 Q1
  precedent ("held on unit proof plus a clean no-regression panel").
- The 'silent' refusal bucket splits by return value (silent-mute vs
  silent-noline) after the probe showed the 1209 4th attempt's silence
  is a driver cap() dedupe artifact (an identical refusal line spoken
  back-to-back in one turn is dropped), not a distinct refusal. The
  analyzer was updated and re-run on all four corpora; the underlying
  move records are unchanged.
- The AFTER panel + focused scan-after are re-run with the final policy
  (flee + dodge + close fixes); the BEFORE panel is re-run with the
  final BEFORE driver (fold key closeStuckTurns added) so the committed
  driver matches the corpus it generated. The frozen policy is untouched
  by all three re-runs.

## Metric review (filled at closeout, never mid-run)

- (to be filled)
