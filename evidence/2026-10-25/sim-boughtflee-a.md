# sim-boughtflee-a — a companion with a SPENDABLE bought round (axis scale-onramp)

Run: fleshout-20261025T0920Z, loop A (oversight-flesh-out-loop). Arm
sim-boughtflee-a. The FIRST half of the 0730Z next blank (1): a companion
with a spendable bought round — the "flee" way to spend it, as an
ALTERNATIVE to the sibling strike arm. At most one of the two arms lands;
this arm does not need a tie-break to lose, because it is KILLED at pilot
on its own pre-registered bar (below). Nothing stacks on it.

## PRE-REGISTRATION (binding — judged only against this)

- Axis: scale-onramp. Lever: FIELD-fight bought round (wave-4+ only).
- Substrate (shared): tableseat-nowait — leanlinkrescue courtship
  (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1), no wait leg.
  Seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d
  tail max). The recorder (deathcensus-diag, DEATHCENSUS=1) runs on BOTH
  configs, so the only control/armed delta is the game-code arm.
- Control replication gate: the control re-run must match the published
  0644Z/0730Z controls exactly before any arm is judged: national-ever
  8/8, final 7/8, table invited 5 / entered 4, wins 4/8 (lesser seat only),
  wave-4 5/8, wave-5 0/8, kind-filtered villager deaths 27 (field 12,
  other 12, raid 1, arena 1, tb 1), wins-excluded median 180d, all-runs
  median 150d. Mismatch = STOP, do not judge.
- THE ARM (exact numbers): in `Game.fieldFight`, when the monster's wave
  is >= 4 AND the fight carries opts.boughtflee AND is not a raid
  (opts.raid) AND not a sealed arena (opts.noFlee) AND the fighter is not
  the scholar, the villager's total damage taken in any single round is
  capped at floor((maxHp - 1) / 2) — for the standard 100 max HP, 49
  (the oneshotcap mechanism: a 100-HP villager vs a real wave-4 eater at
  max rolls goes from uncapped 160 to capped exactly 49). The cap is
  applied at the single villager damage-application point, AFTER armor,
  worn avoidance, ability reductions, and sigW4/sigW5 damage wraps
  (which feed the same total), and it accumulates across pack members
  within the round (abRoundTaken). AND after such a capped round the
  villager withdraws before round 2 — monster stays, villager survives
  that fight, 0 further damage in that fight. A villager kill in the
  capped round takes precedence (they won); a villager already dead at
  round end takes precedence (the cap cannot save a villager who entered
  too hurt for even a capped round). The flee is narrated in the fight
  log and in the fight summary (rec.boughtFlee) — never a silent save.
- FLAG ROUTING (exact): only the wild-encounter router
  (resolveWildMonsterEncounter, non-raid, non-aid field path) and
  expedition meetings (villager-agency) pass opts.boughtflee. Raid
  (opts.raid), arena (noFlee), contest, aid, sortie, alien, patrol, and
  tb routes NEVER carry the flag; wave-1/2/3 are NOT softened; the
  scholar is never guarded. Existing vFlee handling in both routers
  already pays the fight's real wounds and narrates it, so no router
  branch changes were needed.
- COUNTING (exact): deaths are KIND-FILTERED (kind person/villager,
  non-scholar); mixed harness totals are never used for cost bars.
  PRIMARY field-death leg counts attributed combat-death detail rows
  with context 'field'. One-round >=50%-entry field deaths count detail
  rows with context 'field', rounds == 1, vHpStartFrac >= 0.50.
- SURVIVAL, COMPOSITION-PROOF (0730Z metric review, adopted this run):
  the wins-excluded median binds ONLY if there are >= 4 non-winners in
  BOTH control and armed; otherwise judge survival on the full 8-seed
  distribution — armed all-8 mean survival days >= control all-8 mean
  AND armed villages dying before day 100 <= control count + 1. The
  full 8-seed survival-day distribution is reported for both sides
  either way.
- GO requires ALL of:
  - Kind-filtered field villager deaths <= 9 (baseline 12).
  - One-round >=50%-entry field deaths = 0 (baseline 3).
  - Composition-proof survival leg passes.
  - National-ever >= 6/8.
  - Wave-4-or-win >= 5/8.
  - Kind-filtered raid villager deaths <= 2 (baseline 1).
  - Starvation+sickness <= control recount + 2.
  - Directed probe proving the cap fires AND the villager flees after
    the capped round with 0 round-2 damage, and proving raid/arena
    routes are untouched.
  - Field-deaths-per-exposure (field deaths / field fights) reported
    alongside raw counts; the raw count still binds.
- If pilot GO: confirm on 12 fresh seeds 73679–73690, same policy /
  horizon, pro-rata legs: one-round >=50% deaths = 0, field deaths
  <= 13, composition-proof survival leg, national-ever >= 9/12,
  wave-4-or-win >= 8/12, raid villager deaths <= 3, starvation+sickness
  <= confirm-control recount + 3. The confirm control runs on the same
  fresh seeds (game code stashed, then restored) — never judged
  against the pilot baseline.
- If KILLED at pilot: revert ALL game-code changes, do NOT land, report
  the kill with numbers.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  waves 4–5 are escalation on standing, never pure calendar; wave-4
  gate is standing >= t4(100) with combat-readiness bars). No
  combat/field-fight canon doc exists beyond the fieldFights.js header
  (Steve 2026-10-08: fights are blow-by-blow, never a table) — the arm
  preserves that: it trims a round's damage and ends the fight by
  flight, it never replaces a fight with a roll.
- Balanced panel (§15): per-seed recorder corpora are not panel pairs
  (the known error class established 0535Z/0644Z/0730Z); the
  sweep-compare table on identical seeds below IS the comparison. No
  panel file is attached for that reason, not as a verdict input.

## VERDICT: KILLED at pilot (NO-GO) — game code reverted, nothing to land

The mechanism works exactly as designed and seven of eight legs pass —
including the one the 0730Z arms could not both pass — but the field-
death leg it was built to move fails by one death (10 vs bar <= 9), and
the binding pre-registration requires ALL legs. Per §14, a miss is
NO-GO, never re-scored against a friendlier metric mid-run. No confirm
run was spent (confirm is pilot-GO-only). The game-code change
(fieldFights.js cap + flee + summary, game.js router flag,
villager-agency.js expedition flag) is FULLY REVERTED in this tree —
`git diff` empty for src/js after revert, all three files node-checked,
and the reverted diff is saved as
evidence/2026-10-25/perseed-boughtflee-a/boughtflee-reverted.patch for
any future revisit. What remains committed is the measurement record
only: this evidence file, scripts/test-boughtflee-sweep.js, and the
16-row corpus. The sibling strike arm is UNBLOCKED by this kill (at most
one lands; this one does not).

## CONTROL REPLICATION (gate: PASS, zero mismatch)

The control re-run (recorder-armed tableseat-nowait, seeds 73671–73678,
before any game edit) matches the published 0644Z/0730Z controls EXACTLY:

| Headline | Published | This control |
|---|---|---|
| won | 4/8 | 4/8 |
| national-ever / final | 8/8 / 7/8 | 8/8 / 7/8 |
| table invited / entered | 5 / 4 | 5 / 4 |
| wave-4 / wave-5 | 5/8 / 0/8 | 5/8 / 0/8 |
| median all / wins-excluded | 150d / 180d | 150d / 180d |
| villager deaths (kind-filtered) | 27 (field 12, other 12, raid 1, arena 1, tb 1) | 27, same split |
| one-round >=50% field deaths | 3 (eater 103, suburb 87, suburb 69) | 3, same trio |
| raid fights / vDie / vKill | 342 / 1 / 20 | 342 / 1 / 20 |
| death teles (mixed) / starvation | 261 / 3 | 261 / 3 |
| field fights / vKill / mFlee | 985 / 71 / 664 | 985 / 71 / 664 |
| starvation+sickness recount | 6 (fieldguard 0730Z) | 6, same method |
| recorder errors / orphan evidence | 0 / 0 | 0 / 0 |

The control was judged, then the game edit applied, then the armed run
— never the reverse. Per-seed control days: 73671: 93, 73672: 106,
73673: 134 (win), 73674: 180, 73675: 180, 73676: 174, 73677: 98 (win),
73678: 150 (win). Wins are seeds 73672, 73673, 73677, 73678.

## PILOT RESULTS (identical seeds, control vs armed)

Sweep-compare table (the §15 comparison):

| Leg (pre-registered) | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| PRIMARY: kind-filtered field villager deaths | <= 9 (base 12) | 12 | 10 | FAIL |
| One-round >=50% field deaths | 0 (base 3) | 3 | 0 | PASS |
| Survival, composition-proof | see below | — | — | PASS |
| National-ever | >= 6/8 | 8/8 | 8/8 | PASS |
| Wave-4-or-win | >= 5/8 | 6/8 | 6/8 | PASS |
| Kind-filtered raid villager deaths | <= 2 (base 1) | 1 | 1 | PASS |
| Starvation+sickness | <= 8 (recount 6 + 2) | 6 | 6 | PASS |
| Directed probe | cap + flee + gates | — | PASS (below) | PASS |
| Field-deaths-per-exposure (reported, raw binds) | — | 12/985 = 1.22/100 | 10/994 = 1.01/100 | reported |
| Wins / table entered / national-final | — | 4/8 / 4 / 7/8 | 4/8 / 4 / 7/8 | reported |

Survival leg, in full (both sides have 4 non-winners, so the
wins-excluded median binds AND the full-distribution check is reported):
wins-excluded median 180d -> 180d, PASS; all-8 mean 139.4d -> 143.4d,
PASS; villages dying before day 100: 2 -> 2 (bar <= 3), PASS.
Full 8-seed survival-day distributions — control: 93, 106, 134, 180,
180, 174, 98, 150 (median 150); armed: 93, 106, 168, 180, 180, 172, 98,
150 (median 168). Armed wall: wins 4/8, final 7/8, entered 4/8, wave-5
0/8, full seat 0/8.

Per-seed armed vs control (days / won / field deaths):
73671: 93/0/0 vs 93/0/1 — the eater one-shot is gone; same endpoint.
73672: 106/1/2 vs 106/1/2 — identical trajectory; arm never fired.
73673: 168/1/1 vs 134/1/2 — the seed that SAVES the win this time
  (below): the suburb one-shot becomes a flee, the village still wins,
  34 days later, with one fewer field death.
73674: 180/0/1 vs 180/0/1 — identical.
73675: 180/0/2 vs 180/0/2 — identical (incl. the arena hummice death).
73676: 172/0/2 vs 174/0/2 — same field count, changed composition
  (suburb one-shot 0.52/87 -> suburb flee 0.52/49, then a second suburb
  meeting the same day at 0.03 entry HP dying 49 — see sense read).
73677: 98/1/2 vs 98/1/2 — identical (belltoad pair).
73678: 150/1/0 vs 150/1/0 — identical.

THE MECHANISM, MEASURED: wave-4+ field fights control 5 (vDie 3, vFlee
1, evade 1) vs armed 9 (vFlee 5, vDie 1, evade 3, vKill 0). All five
armed vFlees are textbook bought-flee signatures — exactly 49 taken in
exactly 1 round: eater 0.87 -> 58 HP left; suburb 0.52 -> 3 HP left;
algorithm 0.98 -> 49 HP left; congregation 1.00 -> 51 HP left; suburb
0.52 -> 3 HP left. The single armed wave-4+ field death is the 0.03-
entry villager (3 HP, 49 taken): the cap cannot save a villager who
entered too hurt for even a capped round, and the flee correctly does
not fire for a dead villager. Villagers still never kill a wave-4+
monster in the field (vKill 0 both arms; band field vKill identical at
71, all wave-1/2). No armed wave-4+ fight ran past 1 round in the
flee set — the bought round is spent, never stalled.

WHY 10 AND NOT <= 9: every remaining armed field death is OUTSIDE the
arm's scope. All ten, by seed: understudy w2 (0.45, 4 rounds, 50);
ad_break w3 (0.09, 1 round, 13); gallowdeer w1 (0.07, 1 round, 13);
hushwolf w1 (0.11, 1 round, 20); nevermore w1 (0.07, 1 round, 10);
focus_group w3 (0.11, 1 round, 23); hushwolf w1 (0.06, 1 round, 9);
suburb w4 (0.03, 1 round, 49 — the nearly-dead entrant, the other arm's
problem); belltoad w1 (1.00, 3 rounds, 105); belltoad w1 (0.73, 2
rounds, 76). Nine are wave-1/2/3 deaths the pre-registration
deliberately does NOT soften; the tenth is the nearly-dead-entry class
the companion arm (fieldguard) owns. The arm killed its ENTIRE target
class (wave-4+ one-shots 3 -> 0, wave-4+ field deaths 3 -> 1, and that 1
is a 3-HP entrant) and still missed the aggregate bar by one, because
the bar prices deaths the arm was forbidden to touch. That is a metric
finding for the NEXT pre-registration (see metric review), NOT a
re-score: the bar as written was missed, and the kill stands.

RAID DEFENSE, UNBROKEN (the must-not-break guard, measured twice):
raid fights 342 -> 341, raid vDie 1 -> 1, raid vKill 20 -> 20, raid
mFlee 299 -> 298 (one fight's outcome moved with its trajectory; the
defense record is intact). The armed run's extra arena death (2 vs 1)
is trajectory divergence, not cap action — arena fights never carry
the flag (probe gate G3 proves the cap cannot fire there), and the
arena numbers match control's where trajectories coincide (hummice 58
over 4 rounds, seed 73675, both arms).

## CONFIRM RESULTS

None — confirm is pilot-GO-only, and the pilot is KILLED. No fresh
seeds were spent.

## DIRECTED PROBE (scripted, real engine, real eater def, max-roll RNG)

Main (flagged, wave-4 eater, 100-HP villager): uncapped round-1 damage
160, capped round-1 damage exactly 49, cap fired once (111 damage
trimmed), outcome vFlee, rounds 1, vTaken 49, rec.boughtFlee true —
0 round-2 damage because the fight ended in round 1. Summary sentence
produced by fieldFightSummary, the exact line the wild router sends
to awayNews: "The eater landed a blow that should have ended Villager
— and Villager ran while running still worked, 1 round, 49 taken.
They're lucky to be breathing, and the village knows why."
Gates (each capFires == 0): G1 unflagged wave-4 eater — cap 0, villager
dies round 1 taking 160 (the default path is untouched); G2 flagged
wave-3 gavel — cap 0 (waves 1–3 never softened); G3 flagged wave-4
arena (noFlee) — cap 0, villager dies round 1 taking 160 (sealed
fights untouched); G4 flagged wave-4 scholar — cap 0, scholar dies
round 1 taking 160 (the scholar is never guarded). PROBE-PASS, all
five checks. One honest caveat: the corpus fight rows' awayNewsLast
tap is null for the bought-flee rows — the recorder taps awayNews
inside the fieldFight wrap, but the router's tell() runs AFTER
fieldFight returns, so the tap cannot see the summary line. The
narration path itself is proven (summary function + vFlee tell()
branch in the router), but a corpus awayNews row showing the sentence
in the wild is NOT in this evidence — a future arm that needs it
should tap awayNews at the router level, not the fight level.

## VILLAGE ASSESSMENT (plain words)

This arm does the one thing the 0730Z arms could not do together: it
buys a round AND spends it. A villager who meets the Eater at nearly
full health and would have died in a single number (103) now takes 49,
staggers, and runs while running still works — and the village keeps
its win on the seed where the old cap alone lost it. The villages end
up with two fewer field deaths, the same four wins, the same national
standing, and a longer median life — and still fail the bar, because
the bar counts nine wave-1/2/3 deaths and one nearly-dead death that
this arm was never allowed to touch. As a companion, the bought flee
is a better tourniquet than either 0730Z half: it stops the specific
bleeding it was built for, spends the round honestly, and narrates the
save. But it is still a tourniquet. The village still loses villagers
to hushwolves at 6% health, to a belltoad at full health over three
rounds, and to a suburb met twice in one day — and wave 5 and the full
seat remain unreached, wins still only through courtship + seat
instruments on the lesser seat.

## SENSE-TESTING (corpus fight rows + probe transcript)

1. Seed 73671, day 89, ursula_weber vs the Eater: control — dead in
   one round, 103 taken at 0.87 entry HP. Armed — fled in one round,
   49 taken, 58 HP left. Read as a story: she took a blow that should
   have killed her twice over, staggered, and ran. The bought round
   reads sensibly in-world because the numbers ARE the story — 49 is
   not a scratch, it is half a life, and the flee is the only sane
   next move.
2. Seed 73673, day 107, gen_in9ciwi vs the Suburb: control — dead in
   one round, 69 taken at 0.52 entry HP. Armed — fled in one round,
   49 taken, 3 HP left. "Barely walked away" is literal here: three
   hit points. The village then kept that villager, still won, and
   lived 34 days longer. A save that costs almost everything but
   keeps the story going is the honest version of this mechanism.
3. Seed 73676, day 171, visjoin_165 vs the Suburb, twice: first meeting
   — fled in one round, 49 taken at 0.52 entry HP, 3 HP left. Second
   meeting, same day — dead in one round, 49 taken at 0.03 entry HP.
   The saved villager walked back into the same suburb at 3 HP and
   died. The bought flee saves the fight, not the day — and a
   villager at 3 HP meeting a suburb again is not a mechanism failure,
   it is a village that does not yet know how to keep its wounded
   home. That blank (post-flee wounded behavior) is documented, not
   fixed, here.
No robotic or repeated dialogue flagged in this arm's sense pass; no
capped fight reads as a stall or a farce (no bought-flee fight ran
past 1 round). Narration replays were NOT used for sense quotes
(0644Z: they diverge from census trajectories 4/4) — the probe
transcript and the corpus fight rows are the sense surface, both on
exact trajectories.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The field-death aggregate bar, as written, prices deaths outside the
  arm's scope. This arm removed its entire target class (one-shots
  3 -> 0) and still failed 10 vs <= 9, because nine of the ten
  remaining deaths are wave-1/2/3 and one is the nearly-dead-entry
  class. A future companion arm should pre-register its aggregate bar
  against the deaths it can actually touch (e.g. wave-4+ field deaths
  <= 1, or field deaths excluding wave-1/2/3 and <15%-entry classes),
  OR accept an aggregate bar knowing it prices the whole village's
  bleeding. This run's verdict is NOT re-scored under that revision:
  the bar as written was missed, and the kill stands.
- The composition-proof survival revision (0730Z metric review item
  1, adopted here) worked as intended: both sides had 4 non-winners,
  the wins-excluded median bound cleanly (180 -> 180), and the
  full-distribution check agreed (mean up, sub-100 deaths flat).
  Keep the revision for the next run.
- Field-deaths-per-exposure (0730Z metric review item 2, reported
  here alongside, never instead of, the band legs): control 1.22 per
  100 field fights vs armed 1.01 — directionally better, same verdict
  as the raw count (the exposure grew 985 -> 994 while deaths fell
  12 -> 10). It separates exposure growth from mechanism failure, as
  intended, but it does not rescue a missed raw bar under §14.
- The bought-round finding from 0730Z is now ANSWERED, not just
  noted: a flee-after-cap spends the round, the 73673 win is preserved
  (unlike oneshotcap-armed, which lost it), and no bought-flee fight
  stalls. What remains is the NEXT blank, not a retry of this one:
  the aggregate field-death rate is now dominated by wave-1/2/3 and
  nearly-dead-entry deaths, which need their own arms (or a scope
  revision), not a bigger cap.
- Cap-fire counts per sim fight are NOT in the corpus — the recorder
  stores fight rows, not the rec's oneShotCapFires/boughtFlee fields,
  so armed cap fires are proven by the probe plus the five exact-49
  one-round vFlee signatures in the corpus, not counted band-wide.
  A future cap-style arm that needs a band-wide fire count should
  record rec.boughtFlee into the fight row (recorder change, both
  configs) or tap awayNews at the router level.

## INSTRUMENT NOTES

- New: scripts/test-boughtflee-sweep.js (sweep + probe + read-only
  summarize modes; per-seed corpus via the shared writer with the same
  retry discipline as the deathcensus sweep). Corpus:
  evidence/2026-10-25/perseed-boughtflee-a/ (16 rows: 8 control + 8
  armed; never /tmp). Run logs were deleted before commit (they
  duplicate the corpus JSONs).
- Game change (REVERTED — not in this tree): src/js/fieldFights.js
  (cap: application-point trim + round-end bought flee + summary
  sentence), src/js/game.js (router flag: non-raid, non-aid field path
  only), src/js/villager-agency.js (expedition flag). Saved as
  perseed-boughtflee-a/boughtflee-reverted.patch. The revert was
  verified (`git diff` empty for src/js, all three files node-checked
  after revert).
- Balanced panel (§15): NOT attached, for the established reason —
  per-seed recorder corpora are not panel pairs (the known error class
  from 0535Z/0644Z/0730Z). The sweep-compare table above, on identical
  seeds with the recorder on both configs, IS the comparison.
- Targeted suites: node --check passed on all three edited files
  before the armed sweep and after the revert. check.js --quick was
  started on the armed tree but killed mid-run (13+ min under box
  contention with a sibling journey-scale --quick; its child scripts
  were still spawning, not failing) — it is NOT a verdict input, and
  no green claim is made from it, because the committed tree contains
  zero game-code changes: the revert restores the pre-arm tree
  byte-for-byte for src/js. The sibling's --quick was left running,
  untouched.
- What the recorder cannot see (carried from oneshotcap-a): cap-fire
  counts per sim fight are NOT in the corpus (see metric review).

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. The sibling strike arm (second half of the 0730Z next blank (1)) is
   the unblocked alternative — this arm's kill does not block it, and
   the two must still never stack.
2. The aggregate field-death problem is now a scope problem, not a
   cap problem: nine wave-1/2/3 deaths + one nearly-dead-entry death
   remain. A future arm needs its own pre-registration against the
   deaths it can touch (see metric review), not a bigger wave-4 cap.
3. Post-flee wounded behavior (73676: a 3-HP villager re-meets the
   same suburb the same day and dies) — documented blank, needs its
   own arm (shelter/rest gating for the freshly fled, or a
   do-not-remeet window), not a bolt-on here.
4. Router-level awayNews tap for narration proof (see probe caveat).
5. Field-kill / field-save narration beat (carried from 0337Z/0644Z/
   0730Z): the summary sentence exists now (reverted with the arm) —
   a future narration arm can land it standalone.
