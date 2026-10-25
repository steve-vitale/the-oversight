# sim-boughtstrike-a — wave-4 one-shot cap PLUS a spendable bought round (axis scale-onramp)

Run: fleshout-20261025T0920Z, loop A (oversight-flesh-out-loop).
Arm sim-boughtstrike-a. The SECOND half of the 0730Z next blank (1):
a companion with a SPENDABLE bought round — as an ALTERNATIVE to the
sibling flee arm. At most one of the two lands; this report does not
presuppose the tie-break, it reports this arm's own verdict.

## PRE-REGISTRATION (binding — judged only against this)

- Axis: scale-onramp. Lever: FIELD-fight wave-4 one-shot cap + round-2
  strike-back (2x).
- Substrate (shared): tableseat-nowait — leanlinkrescue courtship
  (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1), no wait leg.
  Seeds 73671–73678, 180d death-aware horizon (dead villages stop,
  +10d tail max). The recorder (deathcensus-diag, DEATHCENSUS=1) runs on
  BOTH configs, so the only control/armed delta is the game code.
- Control replication gate: the control re-run must match the published
  0644Z/0730Z controls exactly before any arm is judged (national-ever
  8/8, final 7/8, table invited 5 / entered 4, wins 4/8 lesser seat only,
  wave-4 5/8, wave-5 0/8, kind-filtered villager deaths 27: field 12,
  other 12, raid 1, arena 1, tb 1; wins-excluded median 180d, all-runs
  median 150d; one-round >=50% field deaths 3). Mismatch = STOP.
- THE ARM (exact numbers): in `Game.fieldFight`, when the caller passes
  opts.boughtStrike AND wave >= 4 AND not raid AND not arena AND the
  fighter is not the scholar, (a) a single round's damage to the
  villager is capped at floor((maxHp - 1) / 2) — for the standard 100
  max HP, 49 — applied at the single villager damage-application
  point, AFTER armor, worn avoidance, and ability reductions, and
  accumulating across pack members within the round (abRoundTaken);
  (b) a cap that fires in round 1 arms a boost: the villager's next
  attack, in round 2 ONLY, deals 2x damage (villager's own strike only,
  never the ally's, only when there is a real strike to double, and
  only once — an unspent boost dies at round 3, and a round-2 action
  that is not a strike spends nothing). No other change: a villager
  who still dies in round 2 dies, measured, not hidden.
- SCOPE (flag-gated, fieldguard pattern): the flag is passed ONLY by
  the wild-encounter router (non-raid, non-aid field path) and
  expedition meetings. Raid, arena (noFlee), contest, aid, sortie,
  alien, patrol, and tb routes NEVER carry the flag, and fieldFight
  refuses raid/arena/scholar/wave<4 even if a flag arrived.
  Wave-1/2/3 are NOT softened.
- COUNTING (exact): deaths are KIND-FILTERED (kind person/villager,
  non-scholar) by the analyzer; mixed harness totals are never used
  for cost bars. PRIMARY one-round class = attributed combat-death
  detail rows with context 'field', rounds == 1, vHpStartFrac >= 0.50.
  Field-deaths-per-exposure = field deaths / field fights, reported
  alongside raw counts; the raw count still binds.
- GO requires ALL of:
  - Kind-filtered field villager deaths <= 9 (baseline 12).
  - One-round >=50%-entry field deaths = 0 (baseline 3).
  - Survival, COMPOSITION-PROOF (0730Z metric review, adopted this
    run): the wins-excluded median binds ONLY if there are >= 4
    non-winners in BOTH control and armed; otherwise judge survival
    on the full 8-seed distribution — armed all-8 mean survival days
    >= control all-8 mean AND armed villages dying before day 100
    <= control count + 1. The full 8-seed survival-day distribution
    is reported for both sides either way.
  - National-ever >= 6/8; wave-4-or-win >= 5/8; kind-filtered raid
    villager deaths <= 2 (baseline 1); starvation+sickness
    (kind-filtered villager deaths, cause starvation or sickness)
    <= control recount + 2.
  - Directed probe: the cap fires AND a boosted strike lands in round
    2 (wave-4 field vKill reported as a diagnostic, NOT a binding
    leg — a kill may be impossible even at 2x against wave-4 HP
    bands, but a boosted strike that never lands is a mechanism
    failure). Probe failure = NO-GO even if band numbers move.
- If pilot GO: confirm on 12 fresh seeds 73679–73690, same policy /
  horizon, pro-rata legs: one-round >=50% deaths = 0, field deaths
  <= 13, composition-proof survival leg (same rule), national-ever
  >= 9/12, wave-4-or-win >= 8/12, raid villager deaths <= 3,
  starvation+sickness <= confirm-control recount + 3. The confirm
  control runs on the same fresh seeds (game code stashed, then
  restored) — never judged against the pilot baseline.
- If KILLED at pilot: revert ALL game-code changes, do NOT land,
  report the kill with numbers. No confirm run is spent
  (confirm is pilot-GO-only).
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  waves 4–5 are escalation on standing, never pure calendar; wave-4
  gate is standing >= 100). No combat/field-fight canon doc exists
  beyond the fieldFights.js header (Steve 2026-10-08: fights are
  blow-by-blow, never a table) — the cap trims a round's damage and
  the boost doubles one strike; neither replaces a fight with a roll.
- Balanced panel (§15): per-seed recorder corpora are not panel pairs
  (the known error class established 0535Z/0644Z/0730Z); the
  sweep-compare table on identical seeds below IS the comparison. No
  panel file is attached for that reason, not as a verdict input.

## VERDICT: KILLED at pilot (NO-GO) — game code reverted, nothing to land

The mechanism works exactly as designed — the cap fires, the boosted
strike lands and doubles damage in the probe AND in a real sim fight —
but the field-death leg it was supposed to move fails outright, and
the binding pre-registration requires ALL legs. Per §14, a miss is
NO-GO, never re-scored against a friendlier metric mid-run. No
confirm run was spent (confirm is pilot-GO-only). The game-code
change (fieldFights.js cap+boost + game.js router flag + villager-
agency.js expedition flag) is FULLY REVERTED in this tree — the diff
is saved as evidence/2026-10-25/perseed-boughtstrike-a/
boughtstrike-reverted.patch for any future revisit, and the committed
tree contains measurement record only: this evidence file,
scripts/test-boughtstrike-sweep.js, the patch, and the 16-row corpus.
The sibling flee arm is UNBLOCKED by this kill (at most one lands;
this one does not).

## CONTROL REPLICATION (gate: PASS, zero mismatch)

The control re-run (recorder-armed tableseat-nowait, seeds 73671–73678,
before any game edit) matches the published 0644Z/0730Z controls
EXACTLY:

| Headline | Published | This control |
|---|---|---|
| won | 4/8 | 4/8 |
| national-ever / final | 8/8 / 7/8 | 8/8 / 7/8 |
| table invited / entered | 5 / 4 | 5 / 4 |
| wave-4 / wave-5 | 5/8 / 0/8 | 5/8 / 0/8 |
| median all / wins-excluded | 150d / 180d | 150d / 180d |
| mean all / deaths before day 100 | — | 139.375d / 1 |
| villager deaths (kind-filtered) | 27 (field 12, other 12, raid 1, arena 1, tb 1) | 27, same split |
| one-round >=50% field deaths | 3 (eater 103, suburb 87, suburb 69) | 3, same trio, same seeds |
| field fights / field deaths per exposure | 985 / 0.01218 | 985 / 0.01218 |
| wave-4 field fights / wave-4 field vKill | 5 / 0 | 5 / 0 |
| raid fights / vDie / vKill | 342 / 1 / 20 | 342 / 1 / 20 |
| death teles (mixed) / starvation+sickness | 261 / 6 | 261 / 6 |
| recorder errors / orphan evidence | 0 / 0 | 0 / 0 |

The control was judged, then the game edit applied, then the armed run
— never the reverse.

## PILOT RESULTS (identical seeds, control vs armed)

Sweep-compare table (the §15 comparison):

| Leg (pre-registered) | Bar | Control | Armed | Verdict |
|---|---|---|---|---|
| Kind-filtered field villager deaths | <= 9 (base 12) | 12 | 13 | FAIL (the kill) |
| One-round >=50% field deaths | 0 (base 3) | 3 | 0 | PASS |
| Survival, composition-proof | see below | — | — | PASS |
| National-ever | >= 6/8 | 8/8 | 8/8 | PASS |
| Wave-4-or-win | >= 5/8 | 6/8 | 6/8 | PASS |
| Kind-filtered raid villager deaths | <= 2 (base 1) | 1 | 1 | PASS |
| Starvation+sickness | <= 8 (base 6) | 6 | 7 | PASS |
| Directed probe | cap + boosted R2 strike | — | PASS (below) | PASS |
| Field deaths per exposure (reported) | — | 12/985 = 0.01218 | 13/994 = 0.01308 | worse, not binding |
| Wave-4 field vKill (diagnostic) | — | 0 | 0 | no wave-4 kill either way |
| Wins / table entered / national-final | — | 4/8 / 4 / 7/8 | 3/8 / 3 / 5/8 | reported |

Survival leg, worked: non-winners number 4 in control (days 93, 174,
180, 180) and 5 in armed (129, 172, 180, 180, 180) — both >= 4, so the
wins-excluded median binds: control 180d, armed 180d, PASS. (For the
record, the full-distribution fallback would also pass: all-8 mean
139.375d → 149.375d, deaths before day 100: 1 → 0.)

Per-seed armed vs control (days / won / field deaths):
73671: 129/0/0 vs 93/0/1 — the eater one-shot is gone; village lived
36 days longer but did not finish national (final 1→0).
73672: 106/1/2 vs 106/1/2 — identical trajectory; arm never fired.
73673: 180/0/4 vs 134/1/2 — the seed that kills the arm (below).
73674: 180/0/1 vs 180/0/1 — identical.
73675: 180/0/2 vs 180/0/2 — identical (incl. the arena hummice death).
73676: 172/0/2 vs 174/0/2 — same field count, changed composition
(suburb one-shot 0.52/87 → suburb death at 0.03 entry HP, 49 taken:
the capped round, but the villager entered nearly dead — the
fieldguard arm's problem, not this one's), plus one extra arena death.
73677: 98/1/2 vs 98/1/2 — identical (belltoad pair).
73678: 150/1/0 vs 150/1/0 — identical.

THE SEED THAT KILLS THE ARM — 73673, and it is the SAME seed, the
SAME divergence, and the SAME wave-4 fight rows as the oneshotcap
armed run, row for row: in control this village WON at day 134
(entered the table, lesser seat). Armed, the suburb one-shot that
killed a villager at 0.52 HP on day 107 is gone — the villager took
a capped 49 and fled in round 1 (mDealt 0: they never reached round
2, so the boost never armed a strike) — and the village does NOT
win: it runs to 180 days, never enters the table, and takes three
further deaths (algorithm 0.98 entry, 2 rounds, 98 taken = two capped
49 rounds, mDealt 0; algorithm 0.34 entry, 1 round, 49; algorithm
0.33 entry, 1 round, 44). Field deaths on the seed: 2 → 4. Net band
effect: the three one-shots removed, ~four trajectory-divergence
deaths added, field deaths 12 → 13 instead of the required <= 9.

WHY THE BOOST CHANGED NOTHING ON THE KILLING SEED: the fights that
kill villagers are precisely the fights where the villager does not
strike in round 2. The saved suburb villager fled in round 1 at 3 HP
left (below the flee line) — the bought round was spent on flight,
not on the strike. The 0.98 algorithm villager never struck at all
(mDealt 0 over 2 rounds): against the algorithm the villager's move
is the tank — two rounds of deliberately soft predictions (the
algorithm's own counterplay, fieldFights.js villagerTrickAction) —
so round 2 was a wait, not a strike, and the boost expired unspent.
The boost only pays when the villager stands and strikes in round
2, and the killing fights select against exactly that.

THE BOOST DID LAND — in the one fight where the villager stood and
fought both rounds: 73671 day-89 eater, same trajectory both arms.
Oneshotcap armed: vFlee, 2 rounds, 98 taken, mDealt 14. Boughtstrike
armed: vFlee, 2 rounds, 98 taken, mDealt 28. Total damage doubled
(the corpus stores fight totals, not per-round splits, so this is
reported as totals, not as a per-round claim — the per-round doubling
is proven by the probe, below). A boosted strike is real damage, not
a decoration; it is just not a kill against wave-4 HP bands (850–
1500), and it does not turn a flee into a win.

RAID DEFENSE, UNBROKEN (the must-not-break guard, measured twice):
raid fights 342 both arms, raid vDie 1 both, raid vKill 20 both,
raid mFlee 299 → 298 (one fight's outcome moved with its trajectory;
the defense record is intact). The flag-gating works: raid fights
never carry the flag, and the armed run's raid numbers match
control's exactly where trajectories coincide.

STALL SENSE CHECK: no stall. Field vKill identical at 71 both arms
(all wave-1/2); field vFlee 116 → 122; field mFlee 664 → 663; no
armed wave-4+ fight past 2 rounds. The boost manufactured no kills
and no stalls.

## CONFIRM RESULTS

None — confirm is pilot-GO-only, and the pilot is KILLED. No fresh
seeds were spent.

## DIRECTED PROBE (scripted, real engine, real eater def, max-roll RNG)

Flagged fight (opts.boughtStrike), 100-HP villager vs wave-4 eater:
round-1 uncapped damage 160, capped to exactly 49 (cap fired twice
across the fight, 237 total damage trimmed, single biggest capped
blow 175); villager survived round 1; round-1 strike 8, round-2
strike 16 — exactly 2x, carrying the bought-round note; outcome
vFlee in round 2, 98 taken over 2 rounds. PROBE-PASS.

Scope control (same fight, NO flag): the same villager dies in round
1 to the full 160, cap fires 0, boost fires 0. PROBE-PASS. The flag,
not the wave, is the gate — an unflagged route (raid, arena, patrol,
contest, aid, sortie, alien, tb) gets no cap and no boost.

Probe transcript (the narration requirement — the save is not
silent):
- "R1: Smack-Rush's blow would have taken 160 — but no single round
  takes half a villager's health in the wild. Capped to 49.
  (One-shot cap)"
- "R2: the person in their 60s, with a burn-scarred forearm strikes
  back twice as hard — the bought round, spent."
- "R2: the person in their 60s, with a burn-scarred forearm strikes
  for 16 (bought round — strike back x2) (1126 left)"
- "the person in their 60s, with a burn-scarred forearm sees how this
  ends — and runs while running still works."

## VILLAGE ASSESSMENT (plain words)

The bought round is real, and it is spendable — in the one fight
where a villager stood their ground, they hit back twice as hard as
they would have, and the village's own eater fight shows double the
damage. But villages still end up with no fewer field deaths, for
the same reason the plain cap did: saving a villager changes the
village's story rather than saving it. The village that used to win
on seed 73673, with a villager dying to a suburb on day 107, now
keeps that villager — who runs at 3 HP — and loses the win entirely,
wandering into algorithm fights until day 180. The boosted strike
does not answer the actual killing pattern, because the villagers
who die in wave-4 fights usually do not strike in round 2: they run
while they still can, or they tank the prediction on purpose. A
strike-back boost is a good answer to a fight the villager is already
winning; it is not an answer to a fight the villager is losing.
Wave 5 and the full seat remain unreached; wins still come only
through default-OFF courtship + seat instruments on the lesser seat.

## SENSE-TESTING (corpus fight rows + probe transcript)

1. The probe (quoted above): a villager takes a blow that should
   have killed them twice over, staggers, hits back twice as hard,
   and runs while running still works. That reads honestly as a
   bought round spent striking — the narration names both the save
   and the spend, in the fight log where the village can see it.
2. The wild eater fight, 73671 day 89 (corpus rows): capped 49 +
   49, fled in round 2, damage doubled vs the oneshotcap twin (14 →
   28). The probe's story is the wild story here: survive, strike
   back hard, leave. Nothing robotic, nothing repeated.
3. The killing seed's algorithm deaths (corpus rows): 0.98 entry,
   49 + 49 over 2 rounds, zero damage dealt — the villager tanked
   instead of striking and died anyway. Read as a story, this is a
   villager playing the algorithm's own game (lose on purpose) and
   losing it anyway, because two capped rounds still add up to a
   dead villager at 98 HP. The boost is invisible here not because
   it failed but because the villager never chose the strike — and
   that choice, not the damage number, is what the next companion
   design has to answer. No capped fight in the corpus reads as a
   stall or a farce (no wave-4+ fight past 2 rounds; band field
   vKill identical at 71).

Narration replays were NOT used for sense quotes here (0644Z: they
diverge from census trajectories 4/4) — the probe transcript and
the corpus fight rows are the sense surface, both on exact
trajectories.

## WALL NUMBERS (this arm's judged corpora, pilot bands)

Controls: national-ever 8/8, final 7/8, table entered 4/8, wins 4/8
(lesser seat only), wave-4 5/8, wave-5 0/8, full seat 0/8, median
wins-excluded 180d, all-runs 150d.
Boughtstrike armed: national-ever 8/8, final 5/8, entered 3/8, wins
3/8, wave-4-or-win 6/8, wave-5 0/8, full seat 0/8, wins-excluded
median 180d, all-runs median 172d.
Pooled with the 0730Z armed corpora, the cap family now reads:
fieldguard 5 wins / oneshotcap 3 wins / boughtstrike 3 wins, wave-5
0/24, full seat 0/24 — the companion family moves wins by
divergence, not by design.

## TELEMETRY DEVIATION CHECK

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-
baselines/scale-wall.json --current 'evidence/2026-10-25/perseed-
boughtstrike-a/*.json' --metrics national,table,wins,exiled`: 2 LOUD
lines (national 12 → 0, wins 16 → 0). Both are the known path/regime
artifact class (rows lack top-level national/wins paths; actuals are
national-ever 8/8 in every corpus and wins 4/8 control, 3/8 armed).
Baseline NOT rolled, no new investigation. Same artifact class as
0535Z/0644Z/0730Z.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The field-death leg, as written, prices trajectory divergence, not
  just the mechanism — for the third straight companion arm. The
  mechanism's own metrics (primary one-round deaths 3 → 0, probe
  doubling 8 → 16, wild eater damage 14 → 28) all move the right way
  while the aggregate field-death count moves the wrong way (12 →
  13) on one seed's diverged trajectory (73673: win → no-win). A
  future life-saving arm should pre-register a mechanism metric AND
  a divergence-tolerant aggregate (field deaths per exposure is now
  measured: 0.01218 → 0.01308 — still no improvement here, so it
  would not have saved this arm either) — or accept that any
  life-saving lever can fail an aggregate count bar through
  divergence alone. This run's verdict is NOT re-scored under any
  revision: the bar as written was missed, and the kill stands.
- The bought-round finding, refined: a spendable round must be
  spendable in the fights that actually kill villagers — and those
  fights select for round-2 actions that are NOT strikes (round-1
  flight at 3 HP, algorithm tanking). A strike-back boost is the
  wrong spend for the killing pattern; the sibling flee arm bets the
  other way (the bought round spent leaving), and its verdict will
  say whether flight spends better than force. Do NOT bolt a flee
  boost onto this killed arm.
- Wins moved 4 → 3 and table-entered 4 → 3 on the armed run, driven
  by the same 73673 divergence. Wins are not a pre-registered cost
  leg here (national-ever, wave-4-or-win, and the survival leg are),
  so they are reported, not judged — but a future arm should note
  that a life-saving lever can cost a win through divergence, and
  pre-register how win movement is judged before running.
- Metrics held otherwise: the control replicated exactly; the
  primary counting (attributed detail rows, field + rounds == 1 +
  frac >= 0.50) reproduced the 0644Z trio exactly on the control;
  kind-filtering held (mixed death teles 261 → 270 reported
  separately, never used as a cost bar); starvation+sickness is now
  kind-filtered from the analysis (control 6, armed 7); no threshold
  moved mid-run.

## INSTRUMENT NOTES

- New: scripts/test-boughtstrike-sweep.js (sweep + probe + noflag
  scope-control probe + read-only summarize modes; per-seed corpus
  via the shared writer with the same retry discipline as the
  deathcensus sweep; EVID_SUFFIX selects a sibling corpus dir so a
  confirm never mixes into the pilot aggregate). Corpus:
  evidence/2026-10-25/perseed-boughtstrike-a/ (16 rows: 8 control +
  8 armed; never /tmp). Run logs were deleted before commit (they
  duplicate the corpus JSONs).
- Game change (REVERTED — not in this tree): src/js/fieldFights.js
  (cap + boost: flag/ budget/ boost state, cap at the villager
  damage-application point, 2x strike in round 2, round-3 expiry,
  rec fields oneShotCapFires/oneShotCapped/boughtStrikeFires/
  boughtStrikeBonus) + src/js/game.js (router flag: boughtStrike on
  the non-raid, non-aid field path only) + src/js/villager-agency.js
  (expedition flag). The revert was verified (`git diff` empty for
  src/js, all three files node-checked after revert). The full diff
  is saved as perseed-boughtstrike-a/boughtstrike-reverted.patch.
  NOTE for future readers: after this revert, the sweep's --probe
  will FAIL (the flag has no game code to fire) — that is the
  expected state of a reverted arm's proof, not a broken test; the
  PROBE-PASS above was recorded on the armed tree before revert.
- Targeted suite: the fieldfight check script
  (test-break-monsters3-fieldfights-20261008.js) passes on the ARMED
  tree (26 passed, 0 failed; the script fights wave-1 hushwolves
  only, so the wave-4+ flag cannot affect it, and the new rec fields
  flow through harmlessly at 0). The check.js 120s wrapper timeout
  artifact from 0730Z applies to this script as before; the suite
  itself is green when run directly.
- Balanced panel (§15): NOT attached, for the established reason —
  per-seed recorder corpora are not panel pairs (the known error
  class from 0535Z/0644Z/0730Z). The sweep-compare table above, on
  identical seeds with the recorder on both configs, IS the
  comparison. No panel failure is hidden: the tool was not run
  because its input contract does not accept this corpus shape, as
  established three times before.
- What the recorder cannot see (carried from 0644Z/0730Z): cap-fire
  and boost-fire counts per sim fight are NOT in the corpus — the
  recorder stores fight rows, not the rec's cap/boost fields — so
  armed cap/boost fires are proven by the probe plus the 73671
  eater twin (mDealt 14 → 28), not counted across sims. A future
  cap-style arm should record rec.oneShotCapFires /
  rec.boughtStrikeFires into the fight row if it needs a band-wide
  fire count.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. The sibling flee arm's verdict (the other spend of the bought
   round) — at most one of the two lands, and this one does not.
2. Pool-presence lever for raid draft (0644Z blank 2, still
   untested).
3. Defender-fight wound manufacture (0644Z blank 3, still
   undecided).
4. Field-kill / field-save narration beat (carried from
   0337Z/0644Z/0730Z) — the probe's cap/boost lines are narration
   inside fight logs; whether the village ever HEARS about a save
   (gossip/news beat) is still open.
