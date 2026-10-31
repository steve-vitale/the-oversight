# sim-heraldhp-b — the Herald HP drop, attributed: it was the palisade wall (MEASUREMENT ONLY)

Run: Loop B worker, axis scale-onramp, arm sim-heraldhp-b, run
fleshout-loop-b-20261031T0436Z. Worktree branch: sim-heraldhp-b.
Base anchor: see per-seed JSONs (`anchorCommit` field; worktree
HEAD at sweep time b2518ece2863 — re-anchored on THIS base,
mustercall-b's anchor NOT assumed).
Pre-registration: evidence/2026-10-31/sim-heraldhp-b-prereg.md
(written BEFORE any judged sims; judged against it below,
with one instrument refinement documented in § Instrument v2).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1,
verbatim reuse) + scripts/policies/muster-diag.js (MUSTER=1,
verbatim reuse) + scripts/heraldhp-instrument-20261031.js
(HERALDHP=1, new) + scripts/heraldhp-sweep-20261031.js +
scripts/heraldhp-analyze-20261031.js.
Proof: scripts/test-heraldhp-20261031.js — 21/21 green
(synthetic fixtures only; no band seeds).
Corpus: evidence/2026-10-31/perseed-heraldhp-b/leadfeast/
s85101–s85116.json + heraldhp-analysis.json
(heraldhp-analysis-pilot.json is the v1 pilot snapshot,
superseded by the v2 full-band analysis).
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same
declaration as mustercall-b).

## Verdict: DIAG-GO

Judged exactly against the prereg:

- Attributed share across the seed-85106 refusal window:
  420/420 = 100% (>= 90% required), every chunk named by
  cause (RAID 350 + FIELD 70, table below).
- Drain mechanism identified AND reproduced in a minimal
  instrument leg: the v2 leg (raid wraps added, same base,
  same band, same seed) shows the identical window with
  havenRaidTick rows carrying the 175-HP deductions — the
  prereg's alternative DIAG-GO clause is also satisfied.
- instrumentErrors: 0 on all 16 seeds (herald + muster +
  heraldhp ledgers all clean).
- Usable seeds: 16/16.
- Required sections (a) chunk table, (b) field cross-check,
  (c) replacement verdict, (d) wall numbers, (e) ranked next
  step: all present below.

## Answer in one paragraph

The missing 350 HP was never fight damage the old instrument
missed — it was the village's own palisade wall. On seed
85106 the Herald is drafted as a raid raider three times
(days 91, 106, 123); each draft moves it to Haven's tile and,
because the palisade stands (havenTier >= 2), subtracts
round(700 x 0.25) = 175 HP as it "comes over the wall"
(src/js/havenGrowth.js, havenRaidTick). Two of those drafts
fall inside the refusal window (days 106 and 123: 350 HP)
and one falls before it (day 91: the spawn-700 to
first-refusal-525 step). Add the three captured field fights
(37 + 20 + 13 = 70) and the whole story closes exactly:
700 spawned → 525 → 350 → 313 → 293 → 118 → 105, with
zero HP unaccounted for anywhere in the run. The Herald was
never replaced (one entity tag from spawn to last refusal),
never TB-fought (0 fought, 35 refused), and never touched
by a dawn/titan tick. The open 350 in backlog #1595 is
closed as a measurement question: RAID 350, FIELD 70.

## (a) Chunk table — seed 85106, window days 95–130

| Day | Cause (deepest row fn) | Before → After | Delta | Evidence |
|---|---|---|---|---|
| 91 | RAID (havenRaidTick) | 700 → 525 | −175 | pre-window; entity moved (7,4) → (4,4), raidBorn false → true |
| 106 | RAID (havenRaidTick) | 525 → 350 | −175 | in-window; moved (5,3) → (4,4), raidBorn true |
| 111 | FIELD (fieldFight) | 350 → 313 | −37 | visjoin_105, vFlee, mDealt 37 = delta |
| 113 | FIELD (fieldFight) | 313 → 293 | −20 | visjoin_105, vFlee, mDealt 20 = delta |
| 123 | RAID (havenRaidTick) | 293 → 118 | −175 | in-window; moved (4,5) → (4,4), raidBorn true |
| 128 | FIELD (fieldFight) | 118 → 105 | −13 | visjoin_126, vFlee, mDealt 13 = delta |

Window accounting: first refusal 525 − last refusal 105 =
420 = RAID 350 + FIELD 70. Attributed share 420/420 =
100%. Full-run accounting: spawn 700 − last refusal 105 =
595 = RAID 525 (3 x 175) + FIELD 70. Residual: 0 HP.
No OTHER, DAWN, WORLD, TB, or SPAWN damage chunk exists
anywhere in the run's deepest rows, and no gap between
consecutive ledger rows carries an HP change — the
accounting closes from both ends (refusal readings and
ledger rows agree at every step).

## The mechanism, in code (read, not inferred)

- Draft: havenRaidTick (src/js/havenGrowth.js, ~line 493):
  requires 3+ living world monsters, 3,000+ pantry kcal,
  >= 7 days since the last raid, and an ~18% roll; drafts
  the NEAREST monsters to Haven (3 base, +1 above 12k kcal,
  +1 above 24k, cap 5); marks each `raidBorn = true` and
  moves it to Haven's tile (hx, hy) = (4, 4) on this seed.
- Wall toll: `const palisade = this.havenTier() >= 2;`
  `if (palisade) { const wall = Math.round((m.maxHp ||
  m.hp || 20) * 0.25); m.hp = Math.max(1, (m.hp || wall)
  - wall); }` — for the Herald, maxHp 700, wall = 175,
  every draft, floored at 1 HP (105 is above the floor,
  so no floor effect here). The deduction happens if and
  only if the palisade stands, which the deductions
  themselves prove for days 91, 106, 123 (no separate
  tier read was taken — see metric review).
- Call chain (why the v1 instrument missed it):
  endDay → progDaily (havenGrowth.js wraps progDaily at
  load to also call havenGrowthDaily + havenRaidTick) →
  havenRaidTick. It runs in endDay, NOT in sleep, NOT in
  titanDawnTick, NOT in worldTick/monsterTurn — none of
  the v1 wrappers bracket it. Drafted-but-unmet raiders
  are then marked lingering by havenGrowthDaily, which is
  why two of the three field fights arrive through the
  aidFight chain (resolveWildMonsterEncounter →
  aidFight → fieldFight) while the scholar's own contact
  is gate-refused: the village fights its drafted raiders
  at the door; the scholar may not solo-face a titan.
- The titan gate never touches this: titanWrapCombat
  (titans.js) refuses startCombat before any fight, so
  no TB damage exists; tbEnd's titan full-restore never
  runs (no fought fight to restore); titanEscalate touches
  pantry/trust only. All three were checked in the ledger
  (0 rows with HP deltas from startCombat, tbEnd, or
  titanDawnTick on this seed).

## (b) Field cross-check

- Herald field rows (all callers, all waves): 3 rows,
  mDealt sum 70 = FIELD chunk sum 70. Exact.
- Per-fight entry-minus-left equals mDealt on all 3
  (37, 20, 13); fieldMismatches: [].
- No herald field fight exists outside the three rows:
  the instrument records every Game.fieldFight call
  regardless of wave/caller (agency-style world-object
  mdef included), and the corpus holds exactly 3.

## (c) Replacement verdict: one entity, real damage

- Distinct herald entity tags across the whole run: [1].
  Spawn row day 85 (titanPlace → spawnWorldMonster,
  700/700, tag 1); tag 1 is the entity at the first
  refusal (525), every intermediate reading, and the
  last refusal (105). No removal row, no second spawn,
  no tag change. The "drop" is damage to one beast, not
  a fresh beast masquerading as a wounded one.
- The other located-Herald seeds generalize the code
  path but not the damage: 85102, 85107, 85109 all hold
  a herald entity (ledger rows exist, all movement/
  placement) with ZERO HP-delta rows — their Heralds
  were never drafted. Drafting is opportunistic
  (nearest monsters + pantry + cooldown + roll), not a
  every-Herald fate; 85106 is the seed where the Herald
  kept wandering into draft range (drafted from (7,4),
  (5,3), (4,5)) three times.

## (d) Wall numbers (fresh band, this base — no old bank quoted)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116,
  single policy stack, 200d death-aware cap; no seed hit
  the cap).
- National: 8/16. Table reached: 12/16. Wins: 11/16.
  Wave 4 unlocked: 9/16. Wave 5 unlocked: 0/16.
- Median survival: 106.5 game days. Max: 139. End
  reasons: won/over-other 11, village-lost 5.
- These match mustercall-b's band EXACTLY (8/12/11,
  9/16, 0/16, 106.5/139), and all 16 seeds reproduce
  mustercall-b's trajectories on every compared key
  (maxWave, national, table, won, gameDays, endReason —
  16/16 identical). The v2 ledger (raid wraps +
  raidBorn snapshot field) did not move any trajectory.
- Herald TB attempts on the band: 35, all seed 85106,
  all REFUSED/MUSTER-GATE. Herald field fights: 3, all
  seed 85106, all vFlee. Wave-4 kills by channel: TB vs
  field as in mustercall-b (Herald kills 0 both).

## Sense-testing: the wall wounds a beast nobody mentions

Read in full: the herald instrument's first-refusal (day
95) and late-refusal (day 125) slices on seed 85106, plus
the three field-fight logs from this band's own capture
(same slices mustercall-b read; the HP ledger carries no
say ring, so no new transcript is claimed here).

- The refusal line is character-identical on day 95 and
  day 125 ("you have 0 ... This is not courage. This is
  arithmetic.") — it never mentions that the beast has
  already been over the village wall twice, that the
  village's own stakes took 350 HP off it, or that
  villagers fought it at the door. A person meeting a
  beast their own wall has bled three times would not
  hear "arithmetic" the same way twice.
- The deeper sense point is now mechanical, not just
  repetitious: the raid system treats the Herald as an
  ordinary raider (drafted, walled, lingered, fought by
  villagers through the normal raider channels) while
  the titan gate treats it as unfightable-alone. Both
  are honest code; together they read as two games
  about the same beast — the door fights it, the
  scholar is refused it, and nothing in the narration
  connects the wall's toll to the refusal's arithmetic.
  Whether that is intended (the gate is about mustering,
  not about the beast's HP) is a design question, not a
  measurement gap — see the ranked next step.

## Instrument v2 (mid-run refinement, stated plainly)

- The pilot (v1, 8 seeds) reproduced mustercall-b's
  window EXACTLY (35 refusals, 525 → 105, 139 days,
  trajectory identity 8/8) but attributed only 70/420
  (16.7%): daily snapshots moved 700 → 525 → 350 → 118
  with NO ledger row covering the 175 steps. That
  negative result is what pointed at an unwrapped call
  path, and code reading found havenRaidTick (endDay
  path, outside all v1 wrappers).
- v2 added havenRaidTick + havenGrowthDaily wraps and a
  raidBorn snapshot field to the arm's own instrument
  file (no existing policy file touched, no game code
  touched). The full band was then re-run with v2 (16
  seeds, overwriting the v1 pilot corpus so the committed
  corpus is one coherent v2 sweep); the v1 pilot numbers
  reproduce exactly under v2, and the v2 leg attributes
  420/420. The prereg's "deepest row" rule was sufficient
  here because every raid row is childless (its parent
  progDaily/endDay chain was not wrapped) — see metric
  review for the general refinement this suggests.

## (e) Ranked next step

1. CLOSE #1595 as a measurement question (coordinator
   action, not built here): the 350-HP gap is RAID wall
   damage, reproduced on the same base/band/seed with
   named rows (days 106, 123 in-window; day 91
   pre-window). No further HP instrumentation is owed
   for this question.
2. DESIGN QUESTION for the coordinator/Steve (out of
   scope for this DIAG arm, listed here — NOT appended
   to the backlog, which the coordinator owns): is
   drafting a placed TITAN as an ordinary raid raider
   intended? Consequences measured here: the titan
   takes wall damage no gate accounts for, is fought by
   villagers as a raider while the scholar is refused,
   and is parked on Haven's tile by the draft (which is
   why the scholar keeps re-facing it there). If
   intended, the refusal line's "arithmetic" should
   reckon with a beast the village is already bleeding;
   if not intended, the draft's monster pool is the
   place to look (titan-flagged entities are already
   excluded from the wander pool by titanWrapCombat but
   NOT from the raid draft's nearest-monster sort).
3. FOLLOW-UP MEASUREMENT (not a claim): raid-draft
   frequency for placed titans across a wider band —
   85106's triple-draft may be rare (3 of 4 located-
   Herald seeds took no damage here). A wider census
   would say whether wall-chipping is a normal titan
   tax or a one-seed story.

## Blanks section (out-of-scope gaps found, NOT chased)

- Titan-in-raid-draft design question: see next step 2
  (coordinator/Steve decision; no build attempted).
- Lingering-flag churn around the day-111/113 fights
  (field rows show lingering False → True on day 111
  and False → False on day 113): observed, not
  investigated — the flag's lifecycle is outside this
  arm's HP question and no HP delta rides on it.
- Palisade tier was not independently read on the raid
  days (the deduction itself proves palisade per code;
  a tier read inside the sleep wrapper was avoided per
  herald-b's sleep-hygiene rule). A future arm that
  wants tier numbers should read them outside sleep.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. Deepest-row attribution under-partitions in general:
   a parent row whose HP delta exceeds its children's
   (e.g. a sleep row containing both a wander step and
   an HP change in its own code) would hide its own
   remainder under the deepest-only rule. This run is
   unaffected — the accounting closes exactly (420/420
   in-window, 595/595 full-run, 0 residual, 0 field
   mismatches, 0 inter-row gaps) — but the next ledger
   arm should use own-delta partition (row delta minus
   children's deltas, attributed to the row itself) plus
   inter-row gap detection, so completeness is structural
   rather than verified by a zero residual after the
   fact.
2. The v1→v2 instrument change mid-run is a method
   note, not a verdict threat: the pilot's role (prove
   the instrument fires and the window reproduces) was
   met on v1, and the judged corpus is the single v2
   full-band sweep. Future arms should still pilot
   before refining, as was done here — the refinement
   came from the pilot's negative result, which is the
   pilot working as designed.
3. The single-seed caveat stands (mustercall-b's metric
   review 4, carried forward): the window is one village's
   story. The mechanism (raid draft + wall formula) is
   code-general, but its frequency is not yet band-wide:
   1 of 4 located-Herald seeds took damage. Do not quote
   "titans lose 175 per raid" as a band rate — quote it
   as the per-draft formula with 85106 as the measured
   instance.
4. Daily-snapshot granularity bounded the v1 gap hunt:
   snapshots at sleep exit bracketed each 175 drop to a
   multi-day span (91–93, 106–108, 122–125); the v2 leg
   then dated them exactly (91, 106, 123). Sleep-exit
   snapshots are a good bracketing tool but not a dating
   tool — the leg, not the snapshots, dates the drops.

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis now has the #1595 gap closed — the Herald's HP
story is fully attributed (raid wall + field fights),
the refused-state census stands, and the remaining work
on this channel is the design question in next step 2,
not another measurement of the same window.
