# sim-tbovertime2-a — tier-2+ overtime scaling: does it behave the same as tier 1?

Run: fleshout loop, run fleshout-20261029T1615Z. Axis: scale-onramp
(the blocking axis, converging, NOT converged). Worker:
sim-tbovertime2-a. Answers the verdict tbovertime-a left
explicitly open: TIER-2+ OVERTIME UNMEASURED.
Worktree: `~/workspace/worktrees/sim-tbovertime2-a` (branch
sim-tbovertime2-a). Base: pinned HEAD
ca9a7569e0fae7ff2b62f50f952edc5a69e495ce at prereg time
(the prereg commit a9863885e and instrument commit b3f440de
sit on top of it; the judged corpus was swept on that
base). MEASUREMENT ONLY — zero src/js changes, zero
game-behavior changes, zero default flips, zero roster /
list feed into any decision (PERCEPTION LAW: this arm
records only). Documentation IS the deliverable. This arm
does NOT re-score the tbovertime-a verdict or any other
verdict or corpus; tbovertime-a's tier-0/1 table stands
untouched, and this arm extends it to tier 2+.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-29/sim-tbovertime2-a-prereg.md (commit
a9863885e). Corpus:
evidence/2026-10-29/perseed-tbovertime2-a/ (8 rows +
summary.json + analysis.json + sense-75101.txt).
Instruments (copies only, originals untouched, recorder
reused verbatim): scripts/test-tbovertime2-sweep.js
(copy of the tbovertime sweep: corpus dir, labels, mode
label, require renames, and the substrate env — see
below), scripts/test-tbovertime2.js (copy of the
tbovertime analyzer: corrected identity logic carried
over verbatim, wave>=4 unit, tier-split aggregates,
--control mode), scripts/test-tbovertime2-sense.js
(copy of the tbovertime sense script, labels + beat
filter + one disclosed substrate fix, see Metric
review 1), scripts/policies/tbovertime-diag.js reused
verbatim (not copied).
Control reproduction: PASS, exact (see Verdict leg b).
Detgate: PASS (seed 75101, 157/157 days, 156/156
gameDays, ts {} both, no diag surface, no wraps
installed — on THIS base; the numbers differ from
tbovertime-a's 132/132 because the base moved AND the
substrate changed, and the detgate only requires the
two sides to match each other, which they do).

## Plain words first

Yes — tier-2+ overtime behaves exactly like tier 1, only
bigger. The fight itself still never grows a monster:
across 16 tier-2+ fights, in-fight maxHp growth is 0 on
every single one, and the fights only ever deal damage
(or nothing) to the monster. All of the growth happens
before the first turn, in the overtime wrapper: the
longer the village waits at the table without sitting,
the bigger the multiplier — double health at tier 4,
two-and-a-half times at tier 6 — and from tier 2 up,
the monster no longer walks in alone: it brings a pack
of fresh, full-health copies of itself, one extra at
tier 2 and 3, two at tier 4, three at tier 6. The pack
is the real step-change from tier 1 (which brings
nobody): at tier 6 the village is not fighting one
monster at two-and-a-half health, it is fighting one
wounded monster at two-and-a-half health plus three
fresh ones. And the fights get short as the tiers
climb: tier-0 fights last about 6 rounds, tier-6
fights about 2.4, and the village barely scratches
the rerun before losing — 250 total damage across all
7 tier-6 fights, against monsters whose ceilings sum
past 17,000. The scaling is announced every time, in
plain words, with the remedy named (sit and stop the
clock) — but the exact numbers (900 became 1,575) are
never stated, and the pack, though announced, never
visibly acts in the fight transcript this arm read:
the packmates arrive fresh and full and leave
untouched, because the fight is over before anyone
gets to them.

## Verdict: DIAG-GO (binding prereg, no re-score)

DIAG-GO required (a) 8/8 seeds complete with clean
recorders AND substrate gate AND (b) control
reproduction exact AND (c) detgate PASS AND (d)
tier>=2 join with n >= 3, >= 95%, 0 unexplained gaps
AND (e) decomposition table by tier + sentence AND
(f) sense read of a tier>=2 fight. All pass:

- (a) 8/8 seeds complete, clean recorders: PASS. 8
  rows, days > 0, errs 0 on all ten recorders
  (including tbovertime), no overflow. Summary
  CORPUS: PASS. Substrate gate: courtship combined
  181, 8/8 seeds active — PASS.
- (b) Control reproduction: PASS, EXACT. This
  analyzer in --control mode on the tbovertime-a
  corpus (wave-4 filter) reproduces the published
  result on every number: 24/24 joined, tier counts
  0x22 / 1x2, preFightScalingMax 463, overtimeHpGain
  345, openingDamage 71, inFightChange -3187,
  inFightMaxGrowth 0, scaled fights 2, scales-up set
  2 with constrToEnd +288, crew 0, 0 tier
  disagreements, 0 opening disagreements, 0 identity
  failures, 0 unexplained gaps, mechanical PASS.
  The identity derivation agrees with tbovertime-a's
  corrected analyzer on all tier-1 control cases —
  the mandatory gate before any tier-2+ judgment.
- (c) Detgate: PASS (above).
- (d) Tier>=2 join: PASS. Judged set n = 16 (>= 3);
  overall unit join 22/22 (100.0% >= 95%); 0 tier
  disagreements, 0 opening disagreements, 0 failed
  sum identities, 0 unexplained gaps. The 315
  same-call tbovertime rows are the explained
  non-unit class (see below), not gaps.
- (e) Decomposition table by tier: PASS (below, per
  fight and in aggregate, plus crew start -> end).
- (f) Sense read: PASS. 75101 d134/d136 tier-3
  fights read end to end in a NON-MEASURED replay
  (window d124-d144; the replay's fight days
  coincide with the measured rows, but the replay
  trajectory is still NON-MEASURED and its text
  never enters any count).

## Why the substrate changed (disclosed, not hidden)

tbovertime-a used tableseat-nowait, which SITS when
the seat is ready — so the overtime clock (which runs
only while the table exists, the seat is not none, and
the village has NOT sat) almost never survived past
tier 1. This arm uses the leanlinkrescue courtship
with NO seat drive: tableseat-nowait with
TABLESEATNOWAIT UNSET, whose daily delegates to
leanlinkrescue with no seat behavior at all. That is
a POLICY-SIDE measurement substrate only (env unset
in normal play, zero src/js): the village reaches
the table and waits, so the clock runs. Trajectories
diverge from tbovertime-a after the seat point, by
design. Wall numbers on this band are substrate
artifacts by construction (wins require sitting, so
wins = 0 is the substrate, not a regression; table
entered = 0 likewise) and are reported with that
caveat, never pooled with seated bands.

## The extension sentence

tbovertime-a's sentence was: on current master, a
turn-based fight NEVER grows a monster's health
ceiling, and the only construction-to-end increases
are pre-fight overtime fights. Extended to tier 2+
on this band: the same holds at every tier observed
(2, 3, 4, 6) — in-fight maxHp growth is 0 on all 16
tier>=2 fights and on all 22 unit fights, in-fight HP
change is net damage or zero on all 22, and every
one of the 16 tier>=2 fights ends HIGHER than it
started (constrToEnd > 0 on 16/16) by pre-fight
scaling alone: +10,760 overtime HP gain against
-684 in-fight damage, for a net +10,076. The new
thing at tier 2+ is not a new mechanism but the
pack: floor(t/2) fresh full-health packmates, scaled
by the same multiplier as m_0, arriving with the
fight and leaving essentially untouched (crew HP
89,152 -> 89,081 across the judged set, the entire
-71 in a single tier-4 fight). Tier 5 is the one
tier this band does not measure (0 fights — villages
pass through tier 5 without a world-origin wave-4/5
TB fight landing in it); tier 5 stays documented-
unmeasured, never inferred from tiers 4 and 6.

## The census table (the judged measurement)

Unit: one world-origin TB fight, wave 4 or 5 (in
fact all 22 are wave 4 — wave 5 never unlocks on this
band, 0/8, so no wave-5 world-origin TB fight exists
to measure), not refused, not a table trial. Tile =
world monster HP at lift. Construction =
fighterconstruct snapshot. Start = nonworldkill
post-startCombat snapshot (post-opening-turns AND
post-overtime-scaling). End = tbdmg pre-tbEnd
snapshot. Tier = direct tbovertime-diag record
(pre == post == end on every fight; inferred tier
from the maxHp ratio agrees on every fight).
ScalingMax = startMax - constrMax. OvertimeHpGain =
startHp - (constrHp - opening), i.e. the scaling
applied to the post-opening HP (opening turns run
BEFORE the overtime wrapper). Opening =
fighterconstruct opening sum for m_0 (0 on all 22
fights here). InFight = endHp - startHp. MaxGrowth =
endMax - startMax (0 on every row). Crew = m_crew_*
fighters at start (count; their start -> end HP is
in the crew table below).

| seed | day | monster | tile | constr | start | end | tier | scalingMax | overtimeHpGain | opening | inFight | maxGrowth | result/rounds | crew |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 75101 | d134 | eulogy | 900/900 | 900/900 | 1575/1575 | 1527/1575 | 3 | 675 | 675 | 0 | -48 | 0 | lost/2 | 1 |
| 75101 | d136 | algorithm | 1000/1000 | 1000/1000 | 1750/1750 | 1750/1750 | 3 | 750 | 750 | 0 | 0 | 0 | lost/3 | 1 |
| 75101 | d155 | eulogy | 675/900 | 675/900 | 1688/2250 | 1678/2250 | 6 | 1350 | 1013 | 0 | -10 | 0 | lost/2 | 3 |
| 75103 | d141 | reunion | 900/1200 | 900/1200 | 2250/3000 | 2170/3000 | 6 | 1800 | 1350 | 0 | -80 | 0 | lost/2 | 3 |
| 75103 | d173 | algorithm | 727/1000 | 727/1000 | 1818/2500 | 1668/2500 | 6 | 1500 | 1091 | 0 | -150 | 0 | lost/4 | 3 |
| 75103 | d173 | algorithm | 727/1000 | 727/1000 | 1818/2500 | 1818/2500 | 6 | 1500 | 1091 | 0 | 0 | 0 | lost/2 | 3 |
| 75103 | d173 | algorithm | 727/1000 | 727/1000 | 1818/2500 | 1818/2500 | 6 | 1500 | 1091 | 0 | 0 | 0 | lost/2 | 3 |
| 75103 | d173 | algorithm | 727/1000 | 727/1000 | 1818/2500 | 1818/2500 | 6 | 1500 | 1091 | 0 | 0 | 0 | lost/2 | 3 |
| 75103 | d173 | algorithm | 727/1000 | 727/1000 | 1818/2500 | 1808/2500 | 6 | 1500 | 1091 | 0 | -10 | 0 | lost/3 | 3 |
| 75104 | d122 | eulogy | 675/900 | 675/900 | 844/1125 | 819/1125 | 1 | 225 | 169 | 0 | -25 | 0 | lost/4 | 0 |
| 75104 | d122 | eulogy | 675/900 | 675/900 | 844/1125 | 712/1125 | 1 | 225 | 169 | 0 | -132 | 0 | lost/5 | 0 |
| 75104 | d123 | eulogy | 675/900 | 675/900 | 844/1125 | 676/1125 | 1 | 225 | 169 | 0 | -168 | 0 | lost/4 | 0 |
| 75105 | d119 | eater | 214/950 | 214/950 | 428/1900 | 373/1900 | 4 | 950 | 214 | 0 | -55 | 0 | lost/3 | 2 |
| 75105 | d119 | eater | 214/950 | 214/950 | 428/1900 | 428/1900 | 4 | 950 | 214 | 0 | 0 | 0 | lost/3 | 2 |
| 75105 | d119 | eater | 214/950 | 214/950 | 428/1900 | 345/1900 | 4 | 950 | 214 | 0 | -83 | 0 | lost/4 | 2 |
| 75105 | d120 | eater | 214/950 | 214/950 | 428/1900 | 324/1900 | 4 | 950 | 214 | 0 | -104 | 0 | lost/3 | 2 |
| 75105 | d120 | eater | 214/950 | 214/950 | 428/1900 | 428/1900 | 4 | 950 | 214 | 0 | 0 | 0 | lost/4 | 2 |
| 75105 | d120 | eater | 214/950 | 214/950 | 428/1900 | 399/1900 | 4 | 950 | 214 | 0 | -29 | 0 | lost/3 | 2 |
| 75106 | d139 | eater | 466/950 | 466/950 | 699/1425 | 584/1425 | 2 | 475 | 233 | 0 | -115 | 0 | lost/4 | 1 |
| 75108 | d94 | suburb | 975/1300 | 975/1300 | 975/1300 | 832/1300 | 0 | 0 | 0 | 0 | -143 | 0 | lost/5 | 0 |
| 75108 | d95 | suburb | 799/1300 | 799/1300 | 799/1300 | 507/1300 | 0 | 0 | 0 | 0 | -292 | 0 | lost/7 | 0 |
| 75108 | d95 | suburb | 507/1300 | 507/1300 | 507/1300 | -27/1300 | 0 | 0 | 0 | 0 | -534 | 0 | won/6 | 0 |

Notes on the rows: the 75103 d173 algorithm rows are
five distinct fightIds against the same wounded
instance re-met five times in one day (tile 727 ->
end 1668, then re-met at 727 four more times — the
world keeps the 727 number across the lost fights
that deal 0 damage, exactly the re-meeting shape
tbovertime-a saw on its 75102 reunion chain). The
75105 d119/d120 eater rows are six fights against
the same 214/950 instance re-met across two days.
The 75108 rows are trajectory-identical to
tbovertime-a's 75108 (same days, deaths, fights):
that village dies day 102, before the seat-point
divergence can touch it.

Aggregate decomposition (m_0, 22 fights; analysis.json
carries the full rows):

- tile -> construction: 0 on 22/22. Construction
  EQUALS the tile HP exactly on every fight — the
  world-HP rule, re-confirmed on this base.
- construction below max: 20/22. The two exceptions
  are the unwounded tier-3 fights (75101 d134 eulogy
  900/900, d136 algorithm 1000/1000) — the only
  fights where construction is full, and both are
  the fights where overtimeHpGain equals
  preFightScalingMax exactly.
- By tier: t0 n=3, scalingMax 0, otHp 0, inFight
  -969, constrToEnd -969, crew 0; t1 n=3, scalingMax
  675, otHp 507, inFight -325, constrToEnd +182,
  crew 0; t2 n=1, scalingMax 475, otHp 233, inFight
  -115, constrToEnd +118, crew 1; t3 n=2, scalingMax
  1425, otHp 1425, inFight -48, constrToEnd +1377,
  crew 2; t4 n=6, scalingMax 5700, otHp 1284,
  inFight -271, constrToEnd +1013, crew 12; t5 n=0
  (unmeasured); t6 n=7, scalingMax 10650, otHp 7818,
  inFight -250, constrToEnd +7568, crew 21.
- JUDGED tier>=2 (n=16): scalingMax +18,250,
  overtimeHpGain +10,760, opening 0, inFight -684,
  inFightMaxGrowth 0, constrToEnd +10,076, crew 36,
  scales-up 16/16, maxGrowthNonzero 0.
- All 22 fights: preFightScalingMax +18,925,
  overtimeHpGain +11,267, opening 0, inFight -1,978,
  inFightMaxGrowth 0, tileToEnd +9,289,
  constrToEnd +9,289, scales-up 19/19 scaled fights
  (the 3 tier-0 fights all end below construction).
- Fight length shrinks with tier (mean rounds):
  t0 6.0, t1 4.3, t2 4.0, t3 2.5, t4 3.3, t6 2.4.
  Outcomes on this band: lost 21, won 1 (the tier-0
  75108 suburb win, same fight as tbovertime-a).
  All 16 judged fights are lost.
- The wounded-monster interaction, measured: at
  tier 4 the 214/950 eater's ceiling doubles (+950)
  but its HP gains only +214, because scaling
  multiplies the CURRENT (wounded) HP, not the
  ceiling. OvertimeHpGain equals preFightScalingMax
  only when the world monster is unwounded (the two
  tier-3 fights). A heavily wounded rerun is
  therefore far less scary in HP than its ceiling
  suggests — but it still brings a fresh pack.

## The crew table (the tier-2+ step-change)

Crew fighters (m_crew_*) are injected by the wrapper
AFTER startCombat, so they have no construction row;
this table is start -> end only, and that limitation
is stated, never papered over. Crew counts are
exactly floor(t/2) on every judged fight (t2 -> 1,
t3 -> 1, t4 -> 2, t6 -> 3; 36 crew on 16 fights).
Every crew fighter starts at FULL health (startHp ==
startMaxHp on 36/36) — a fresh def roll scaled by
the same hpM as m_0 (e.g. 75101 d155 eulogy tier 6:
m_0 startMax 2250 = 900 x 2.5; crew startMaxes
2508 / 2385 / 2695, i.e. fresh def rolls x 2.5) —
while m_0 starts wounded (the world HP x hpM). Crew
end == crew start on 15/16 judged fights; the sole
exception is one 75105 d119 eater tier-4 fight where
one crew member takes 71 damage. Judged crew totals:
start HP 89,152 -> end HP 89,081 (delta -71).
The pack, in other words, is measured as present,
fresh, full, scaled — and almost never touched,
because the fights end (lost, 2-4 rounds) before
anyone gets to it.

## Sense note (75101 d134/d136 tier 3, NON-MEASURED replay)

The replay's tier timeline coincides with the
corpus: tier 2 announced d124, tier 3 announced
d131, tier-3 fights d134 (eulogy) and d136
(algorithm) with the RERUN x3 line and renamed
fighters, tier 4 announced d138. The game DOES tell
the player why the monster is bigger — three times
over, as tbovertime-a found at tier 1: the tier
announcement ("OVERTIME x3 — wave 4-5 monsters
return as RERUNS (+75% HP, +36% damage, +1 to every
pack). Raids come sooner. The table docks your
standing -21. Take your seat from Haven to stop the
clock."), the fight-start RERUN line ("RERUN x3 —
you have seen this episode. It has seen you too.
(Overtime: +75% HP, +36% damage, +1 in the pack.)"),
and the renamed fighter on every turn ("RERUN x3
The Eulogy's turn"). Two narration-completeness
notes, not scaling findings: (1) the exact HP
arithmetic (900 -> 1575) is never stated, as at
tier 1; (2) the pack is announced ("+1 in the
pack") but no packmate turn appears in this
replay's excerpt — the player is told a pack exists
but sees only the named monster's turns, which
matches the measured fact that the crew is
untouched. A second, adjacent coherence note from
the same window: the readiness hold beat fires
honestly ("The fifth draft stays in the wings —
blood your fighters (0 of 2 veterans)") while the
village waits — the game names what the village
lacks, not just what it faces.

## The same-call rows, explained (not gaps)

The analyzer counts 315 tbovertime start rows with
no fightId under the same-call signature (fight
starts AND ends inside one startCombat call, so no
post snapshot exists) — up from 6 on the tbovertime-a
band. Per seed: 75101: 19, 75102: 3, 75103: 178,
75104: 35, 75105: 14, 75106: 62, 75107: 3, 75108: 1.
These counts equal, per seed exactly, the
nonworldkill wave-None 'world-origin-unresolved'
start counts, and their args are overwhelmingly
titans (band-wide: herald 231, nielsen 68, plus 16
miscellaneous monster args). They are the same
explained recorder limitation tbovertime-a documented
(a fight resolving inside one startCombat call
cannot be post-snapshotted), now at scale because
no-seat villages live into titan / network territory
(tier >= 2 airs the uncast apocalypse titan).
Crucially, none of them can be unit fights: the unit
universe is defined over nonworldkill wave-4/5
world-origin starts, and all 22 of those join
(22/22, 0 gaps). A future arm that wants titan TB
chains needs a different instrument; this arm names
that and stops there.

## Parity (diagnostic, NOT a gate — see Metric review 4)

Parity vs the tbovertime-a corpus FAILS on all 8
seeds, as the prereg expects: the substrate changed
(no-seat vs seat-when-ready) AND the base moved
(3cb5f8b82 -> ca9a7569e... plus this arm's commits).
Per-seed direction (this band vs tbovertime-a):
75101: 157d (was 132d), won 0 (was 1), entered 0
(was 1), deaths 45 (was 34); 75102: waveReach 3
(was 4), deaths 32 (was 44); 75103: 178d (was 132d),
won 0 (was 1), entered 0 (was 1), deaths 61 (was
28); 75104: 180d (was 90d), won 0 (was 1), waveReach
4 (was 3), deaths 44 (was 24); 75105: 120d (was
180d), table 1 (was 0), deaths 46 (was 48); 75106:
180d (was 146d), deaths 60 (was 40); 75107:
waveReach 4 (was 3), table 1 (was 0), deaths 42
(was 31); 75108: identical (102d, 37 deaths, same 3
fights — dies before the divergence point).
Recorder neutrality on THIS base is proved by the
detgate PASS plus the determinism re-run below, not
by parity with the old corpus.

## Wall numbers (THIS band only, never pooled, substrate caveat applies)

National ever / final 7/8 / 2/8; table waiting /
entered 6/8 / 0/8 (entered is 0 BY CONSTRUCTION —
the substrate never sits); wins 0/8 (0 lesser / 0
full, BY CONSTRUCTION); wave-4 unlock 7/8; wave-5
unlock 0/8; median survival 180d (same convention as
tbovertime-a: sorted days 102, 120, 157, 178, 180,
180, 180, 180, index 4); ends: village-lost 4
(75101 d157, 75103 d178, 75105 d120, 75108 d102),
survived-to-horizon 4 (75102, 75104, 75106, 75107);
deaths total 367; starvation deaths 1 (75108);
courtship combined 181, 8/8 active — SUBSTRATE GATE
PASSES. These numbers describe waiting villages,
not seated ones, and must not be compared to seated
bands as a regression or an improvement.

## Village assessment (plain words)

Four villages die waiting and four survive the
horizon waiting, and none of them sits — that is the
substrate, not the story. The story is what waiting
costs: the villages that wait longest meet monsters
that are no longer single monsters. A tier-6 rerun
with three fresh packmates is a different kind of
fight from the tier-1 reruns tbovertime-a measured:
the village loses in two rounds having dealt 10
damage to a 2,250-ceiling monster while three more
monsters stand behind it untouched. The villages
that wait do keep reaching national (7 of 8 ever),
and two end the horizon at national or global rank
without ever sitting — the table waits, the clock
runs, and the game keeps telling them the remedy
(sit) while they do not take it. That is a coherent
tragedy, not a broken one: the overtime system does
exactly what its announcements say it does, at
exactly the percentages it states, and the villages
that refuse the seat pay for it in reruns.

## Blanks filled or documented

- FILLED (answered, with numbers): tier-2+ overtime
  scaling on current master — pre-fight scaling only
  at tiers 2, 3, 4, 6 (16/16 fights, in-fight maxHp
  growth 0); packmate injection floor(t/2) measured
  (36 crew on 16 fights, counts exact at every tier);
  crew are fresh full-health scaled def rolls, not
  wounded world monsters; crew essentially untouched
  in these fights (-71 HP total).
- FILLED (mechanism, read from code + corpus): the
  wounded-monster interaction — scaling multiplies
  current HP, not the ceiling, so a 214/950 eater at
  tier 4 gains only +214 HP while its ceiling gains
  +950; overtimeHpGain equals preFightScalingMax only
  for unwounded world monsters (2/22 fights).
- FILLED (narration): tier-3 scaling IS told to the
  player (tier announcement + RERUN line + renamed
  fighter + percentages + remedy), though the exact
  HP arithmetic is never stated and the announced
  pack never visibly acts in the read transcript.
- DOCUMENTED, NOT MEASURED (named next blank, for
  the coordinator — NOT a lever proposed or built):
  tier 5 overtime (0 fights — villages pass through
  tier 5 without a world-origin wave-4/5 TB fight
  landing in it); wave-5 overtime scaling (wave 5
  never unlocks on this band, 0/8, so no wave-5
  world-origin TB fight exists to measure — the
  wave>=4 unit is wave-4-only in fact); titan TB
  chains (titan fights resolve inside one startCombat
  call and cannot be post-snapshotted by these
  recorders — 315 same-call rows, 299 titan args).
- DOCUMENTED, NOT FIXED (instrument limitation):
  crew have no construction row (injected after
  startCombat), so crew are start -> end only.

## Metric review (§14 — binding, no mid-run re-scores)

No threshold was moved mid-run. The DIAG-GO rule was
judged exactly as pre-registered (8/8 complete +
control exact + detgate PASS + tier>=2 join n >= 3
at >= 95% with 0 gaps + table by tier + sentence +
sense read). Judgment notes, all disclosed, none a
re-score:

1. SENSE SUBSTRATE FIX, DISCLOSED (instrument fix,
   not a metric change). The prereg described the
   sense copy as differing "labels + beat filter
   only" from the tbovertime sense script — but the
   original sense script sets TABLESEATNOWAIT=1,
   which would make the replay SIT and never reach
   tier 3. The copy was therefore patched to delete
   TABLESEATNOWAIT (same no-seat substrate as the
   corpus) and committed separately (commit
   1ad041e58) BEFORE the sense replay ran. Sense is
   NON-MEASURED and supporting only; no judged leg
   depends on the replay's substrate, and the judged
   corpus is untouched by the fix.
2. SUMMARY CONSOLE LABEL, COSMETIC. The sweep's
   --summary console header still prints the literal
   "sim-tbovertime-a decomposition" (a leftover in
   the copied summaryMode print); summary.json's
   label is correct ("sim-tbovertime2-a TB tier-2+
   overtime decomposition"). Console text only, no
   data affected; the next copy should fix the
   literal.
3. SAME-CALL CLASS AT SCALE. The 315 same-call rows
   are the explained class from tbovertime-a (6
   rows), not gaps — but their frequency jump is
   itself a substrate consequence (no-seat villages
   live into titan territory), and the band-wide arg
   breakdown (herald 231, nielsen 68) is reported
   above rather than assumed.
4. PARITY, DIAGNOSED NOT HIDDEN. Parity vs the
   tbovertime-a corpus FAILS (all 8 seeds diverge;
   diffs summarized above). The prereg's parity rule
   makes parity diagnostic-only for this arm
   (substrate change + base move); recorder
   neutrality is proved by detgate PASS + the
   determinism re-run below. The parity FAIL is
   therefore reported as a diagnosis, and the GO
   legs (which do not include parity) are judged on
   their own terms.
5. PANEL (§15). NOT attempted, per the task's
   standing exception — scripts/balance-panel.js has
   NO corpus-ingest mode for a single-arm census
   corpus. No panel artifact was faked; the paired
   sweep-compare tables (this analyzer's output,
   analysis.json, control comparison vs the
   tbovertime-a corpus) are the section-15
   substitute, as in the predecessor rounds.
6. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline
   .../telemetry-baselines/scale-wall.json --current
   'evidence/2026-10-29/perseed-tbovertime2-a/*.json'
   --metrics national,table,wins,exiled` -> 3 LOUD
   lines (national 12 -> 0, table -62% 16 -> 6, wins
   16 -> 0, n=10 files). Verdict: KNOWN ARTIFACTS,
   no investigation, baseline NOT rolled. Three
   independent reasons: (a) the baseline's own
   regime note forbids this comparison (a ~100%-win
   winseat suite vs a no-seat census substrate);
   (b) the field-shape artifact repeats (per-seed
   rows carry nationalEver/entered/won, not
   top-level national/table/wins paths; summary.json
   + analysis.json are the 9th and 10th files);
   (c) this band's wins/table-entered zeros are
   substrate artifacts (the policy never sits by
   construction). The corpus's real wall numbers are
   nationalEver 7/8, table waiting 6/8, entered 0/8,
   wins 0/8-by-construction. No exiled LOUD line.

Doubts recorded for the NEXT run, never applied here:

1. TIER 5 OVERTIME is the remaining unmeasured tier:
   a band (or a longer horizon) in which a
   world-origin wave-4/5 TB fight actually lands at
   tier 5 would complete the tier table; this arm
   does not infer tier 5 from tiers 4 and 6.
2. WAVE-5 OVERTIME needs a band that unlocks wave 5
   (0/8 here) — the wave>=4 unit is ready for it,
   but no wave-5 fight exists on this band to feed it.
3. THE 75103 d173 REPEAT CHAIN: one wounded
   algorithm instance fought five times in one day
   at tier 6, four of them dealing 0 damage. Whether
   repeat fights against the same lingering instance
   should carry the lingerer-restore number or the
   last-fight end number is the same lingerer
   question tbovertime-a flagged on its reunion
   chain — the join records each fight under its own
   fightId and asserts nothing about which number
   the world keeps.

## Infrastructure notes

- Sweep: scripts/test-tbovertime2-sweep.js, 8 seeds,
  ~1-4 min per seed (detgate ~47s for its two runs)
  + sense replay ~64s. Corpus:
  evidence/2026-10-29/perseed-tbovertime2-a/ (8 rows +
  summary.json + analysis.json + sense-75101.txt).
  Analyzer: scripts/test-tbovertime2.js (unit checks
  pass incl. synthetic tier-2 and tier-6 cases; exit 0
  on the judged run and on the --control run,
  mechanical PASS both).
- Determinism: seed 75101 re-run into a worktree
  scratch dir (NOT /tmp — sibling cleanup wipes /tmp)
  reproduces the corpus row BYTE-IDENTICALLY
  (excluding only the corpusFile path field and
  stack-trace audit lines, neither a game field);
  scratch removed after the diff was recorded.
- Safe-commit index clobber hit the prereg commit,
  the instruments commit (all 3 files), and the sense
  fix commit (transient status read) — commit itself
  correct in every case, verified by stat + hash
  before proceeding; repaired via HEAD-blob
  cacheinfo, verified status empty + diff HEAD
  empty + hash matches. The same check runs after
  every safe-commit in this run.
- No jest run: zero src/js changed, and the arm proofs
  are the attributable verification (per the census-
  family precedent for DIAG-only runs). No
  [needs-eyes] flag applies (measurement only, no
  narration or behavior added — the sense script
  only READS beats on a replay, it adds none to the
  game).
- Commit: sim-tbovertime2-a, DIAG-GO on all legs,
  zero src/js diff. Branch ready, pending coordinator
  merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- Heartbeats: tree heartbeat after registration
  (coordinator), after instruments, after the sweep,
  and after the analyzer — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-29 — tier-2+ overtime behaves like
  tier 1, only bigger — in-fight maxHp growth 0 on
  all 16 tier>=2 fights (and all 22 unit fights);
  all construction-to-end increases are pre-fight
  scaling (+10,760 HP gain vs -684 in-fight damage
  on the judged set); packmate injection floor(t/2)
  measured exact at every tier (36 crew on 16
  fights: t2->1, t3->1, t4->2, t6->3).
- [open] 2026-10-29 — crew arrive fresh and untouched
  — every crew fighter starts full (36/36 startHp ==
  startMaxHp, fresh def roll x hpM) while m_0 starts
  wounded (world HP x hpM); crew HP 89,152 -> 89,081
  across the judged set (entire -71 in one tier-4
  fight); fights end lost in 2-4 rounds before the
  pack is engaged.
- [open] 2026-10-29 — scaling multiplies current HP,
  not the ceiling — a 214/950 eater at tier 4 gains
  only +214 HP while its ceiling gains +950;
  overtimeHpGain equals preFightScalingMax only for
  unwounded world monsters (2/22 fights).
- [open] 2026-10-29 — tier 5 overtime unmeasured —
  0 tier-5 fights on this band (villages pass through
  tier 5 without a world-origin wave-4/5 TB fight
  landing in it); wave-5 overtime unmeasured too
  (wave 5 unlock 0/8 on this band).
- [open] 2026-10-29 — titan fights resolve inside one
  startCombat call — 315 same-call recorder rows on
  this band (299 herald/nielsen titan args); the
  recorders cannot post-snapshot them, so a future
  titan-TB arm needs a different instrument.
- [open] 2026-10-29 — RERUN narration states the why
  and the pack, but not the number, and the pack
  never visibly acts — tier-3 scaling is announced
  (tier line + RERUN line + renamed fighter +
  percentages + sit remedy) but the exact HP
  arithmetic (900 -> 1575) is never stated, and no
  packmate turn appears in the read transcript
  (sense note, not a lever proposal).
