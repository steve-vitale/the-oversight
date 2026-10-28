# sim-tbovertime-a — pre-fight overtime scaling separated from in-fight TB growth: the "TB scales the monster up" reading, corrected

Run: fleshout loop, run fleshout-20261028T0634Z. Axis: scale-onramp
(the blocking axis). Worker: sim-tbovertime-a. Tracker blank 3.
Worktree: `~/workspace/worktrees/sim-tbovertime-a` (branch
sim-tbovertime-a). Base: master 3cb5f8b82, which already
contains the world-HP TB rule (sim-w4tbkill-a phase B,
fa3516cc1 — world monsters enter TB fights at their world
HP, wave 4+ only).
MEASUREMENT ONLY — zero src/js changes, zero policy changes
to game behavior, no game lever, no balance change proposed
or landed. Documentation IS the deliverable. This arm does
NOT re-score the w4convert 0-kill verdict or any other
verdict or corpus; the w4convert tile-to-end comparison AS
MEASURED on its base stands untouched, and only its
mechanism sentence is corrected below.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-tbovertime-a-prereg.md (commit
a44c81c9b2). Corpus:
evidence/2026-10-28/perseed-tbovertime-a/ (8 rows +
summary.json + analysis.json + sense-75106.txt) plus the
same-base neutrality detcheck row
evidence/2026-10-28/perseed-tbovertime-a-detcheck/
s75102-armed.json (see Parity below). Instruments (copies
only, originals untouched, plus one new recorder):
scripts/test-tbovertime-sweep.js (copy of the
fighterconstruct sweep, differing only in corpus dir,
labels, mode label, require renames, and the tbovertime
recorder),
scripts/policies/tbovertime-diag.js (NEW: overtimeTier()
at startCombat pre/post and tbEnd pre, f.otTier and
fighter otTier flags at post),
scripts/test-tbovertime.js (NEW analyzer, proof
validator), scripts/test-tbovertime-sense.js (copy of
the fighterconstruct sense script, labels + beat filter
only).
Detgate: PASS (seed 75101, 132/132 days, tsNationalDay 77
both — the prior-base numbers exactly, so no detgate
amendment was needed).

## Plain words first

Turn-based fights do not grow monsters. Not once, on this
whole band. Every wave-4 monster that walked into a
turn-based fight came out with the same ceiling it walked
in with — or lower health under that ceiling, because the
fight hurt it. The only thing that ever made a monster
bigger was the overtime wrapper, and it does its work
before the fight even starts: the game waits too long to
sit at the table, the season rolls into overtime, and the
monster walks in already multiplied — a quarter bigger
per overtime week. On this band that happened in just 2
of 24 fights, both at the smallest overtime step, and
those two are the only fights where the monster ended
higher than it started. Everything else about the old
"the fight scales the monster up" story turns out to
have been two other things wearing its clothes: on the
old base, a fresh dice roll that replaced the wounded
world monster with a whole new healthy one; on the new
base, the wounded world monster itself walking in hurt,
so the fight starts from its real wounds and only ever
goes down from there.

## Verdict: GO (binding prereg, no re-score)

GO required 8/8 seeds complete with clean recorders AND
the join complete for >= 95% of world-origin wave-4 TB
fights with 0 unexplained recorder gaps AND a
decomposition table (per fight and in aggregate) AND a
corrected sentence for the w4convert reading (or a
separation verdict with the blocker named). All four pass:

- (a) 8/8 seeds complete, clean recorders: PASS. 8 rows,
  days > 0, errs 0 on all ten recorders (including the new
  tbovertime recorder), no overflow. Summary CORPUS: PASS.
- (b) Join complete: PASS. 24/24 world-origin wave-4 TB
  fights joined (100.0% >= 95%) — construction + start +
  end + direct tier record all present, 0 tier
  disagreements, 0 opening disagreements, 0 failed sum
  identities, 0 unexplained gaps. The 6 tbovertime start
  rows with no fightId are same-call start-and-end
  fights (explained, see below), not gaps.
- (c) Decomposition table: PASS (below, per fight and in
  aggregate; analysis.json carries the full rows).
- (d) Corrected sentence: PASS (below, in two versions:
  the old-base correction for the cited 3688 example, and
  the current-master correction this band measures).

## The corrected sentence

OLD-BASE correction (for the w4convert example the flag
cited — 75103 d178 suburb, tile 975 -> TB end 3688/3688,
on the pre-world-HP base): the 3688 was already the
START, not growth inside the fight. Construction rolled
1475, overtime x2.5 (tier 6) scaled it to 3688/3688
before the first turn, and the fight ended at 3688/3688
after 2 rounds — in-fight change 0. Of that fight's
tile-to-end gap (+2713), the fresh roll contributed
+500 (975 -> 1475), pre-fight overtime scaling
contributed +2213 (1475 -> 3688), and in-fight growth
contributed exactly 0. The w4convert sentence "the
turn-based fight scales the monster's health up" is
wrong for this example in the specific way the flag
suspected: the scaling was pre-fight overtime, not
in-fight growth.

CURRENT-MASTER correction (this band's measurement, the
sentence that should replace it going forward): on
current master, a turn-based fight NEVER grows a
monster's health ceiling — in-fight maxHp growth is 0
on all 24 world-origin wave-4 TB fights, and in-fight
HP change is net damage (or zero) on all 24. The only
construction-to-end increases on the band are the 2
overtime fights (75106 d145 eulogy, d146 eater, both
tier 1): their combined +288 HP is 100% pre-fight
overtime HP gain (+345) minus in-fight damage (-57),
with zero opening damage. Across all 24 fights the
monsters end 2,913 HP BELOW the world HP they entered
with, because their wounds now walk in with them and
the fights deal 3,187 net damage against 345 of
overtime gain and 71 of opening damage. "TB scales the
monster up" is therefore false as a general in-fight
claim on current master; what scales is the pre-fight
overtime wrapper, on 2/24 fights, and it never grows a
monster mid-fight.

## The census table (the judged measurement)

Unit: one world-origin wave-4 TB fight, primary fighter
m_0. Tile = world monster HP at lift (nonworldkill
start.tileMonster). Construction = fighterconstruct
first-tbAdvance-entry snapshot. Start = nonworldkill
post-startCombat snapshot (post-opening-turns AND
post-overtime-scaling). End = tbdmg pre-tbEnd snapshot.
Tier = direct tbovertime-diag record (pre == post == end
on every fight; inferred tier from the maxHp ratio agrees
on every fight). ScalingMax = startMax - constrMax.
OvertimeHpGain = startHp - (constrHp - opening), i.e.
the scaling applied to the post-opening HP (opening
turns run BEFORE the overtime wrapper — see Metric
review 1). Opening = fighterconstruct opening tbDamage
sum for m_0. InFight = endHp - startHp. MaxGrowth =
endMax - startMax (0 on every row).

| seed | day | monster | tile | constr | start | end | tier | scalingMax | overtimeHpGain | opening | inFight | maxGrowth | result/rounds |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 75102 | d166 | audit | 825/1100 | 825/1100 | 754/1100 | 446/1100 | 0 | 0 | 0 | 71 | -308 | 0 | lost/8 |
| 75102 | d172 | reunion | 300/1200 | 300/1200 | 300/1200 | 171/1200 | 0 | 0 | 0 | 0 | -129 | 0 | lost/6 |
| 75102 | d172 | reunion | 171/1200 | 171/1200 | 171/1200 | 120/1200 | 0 | 0 | 0 | 0 | -51 | 0 | lost/3 |
| 75102 | d172 | reunion | 120/1200 | 120/1200 | 120/1200 | 120/1200 | 0 | 0 | 0 | 0 | 0 | 0 | lost/7 |
| 75102 | d172 | reunion | 120/1200 | 120/1200 | 120/1200 | -24/1200 | 0 | 0 | 0 | 0 | -144 | 0 | won/7 |
| 75102 | d176 | eulogy | 675/900 | 675/900 | 675/900 | 645/900 | 0 | 0 | 0 | 0 | -30 | 0 | lost/4 |
| 75102 | d177 | eulogy | 675/900 | 675/900 | 675/900 | 641/900 | 0 | 0 | 0 | 0 | -34 | 0 | lost/4 |
| 75102 | d178 | eulogy | 675/900 | 675/900 | 675/900 | 619/900 | 0 | 0 | 0 | 0 | -56 | 0 | lost/4 |
| 75102 | d178 | eulogy | 619/900 | 619/900 | 619/900 | 536/900 | 0 | 0 | 0 | 0 | -83 | 0 | lost/5 |
| 75102 | d179 | eulogy | 536/900 | 536/900 | 536/900 | 483/900 | 0 | 0 | 0 | 0 | -53 | 0 | lost/5 |
| 75102 | d180 | eulogy | 483/900 | 483/900 | 483/900 | 433/900 | 0 | 0 | 0 | 0 | -50 | 0 | lost/3 |
| 75103 | d117 | audit | 825/1100 | 825/1100 | 825/1100 | 74/1100 | 0 | 0 | 0 | 0 | -751 | 0 | lost/12 |
| 75103 | d118 | eater | 712/950 | 712/950 | 712/950 | 593/950 | 0 | 0 | 0 | 0 | -119 | 0 | lost/6 |
| 75106 | d89 | eulogy | 675/900 | 675/900 | 675/900 | 595/900 | 0 | 0 | 0 | 0 | -80 | 0 | lost/6 |
| 75106 | d90 | reunion | 900/1200 | 900/1200 | 900/1200 | 842/1200 | 0 | 0 | 0 | 0 | -58 | 0 | lost/7 |
| 75106 | d91 | reunion | 842/1200 | 842/1200 | 842/1200 | 824/1200 | 0 | 0 | 0 | 0 | -18 | 0 | lost/5 |
| 75106 | d99 | algorithm | 719/1000 | 719/1000 | 719/1000 | 719/1000 | 0 | 0 | 0 | 0 | 0 | 0 | lost/5 |
| 75106 | d129 | eulogy | 675/900 | 675/900 | 675/900 | 501/900 | 0 | 0 | 0 | 0 | -174 | 0 | lost/4 |
| 75106 | d130 | eulogy | 501/900 | 501/900 | 501/900 | 478/900 | 0 | 0 | 0 | 0 | -23 | 0 | lost/3 |
| 75106 | d145 | eulogy | 675/900 | 675/900 | 844/1125 | 828/1125 | 1 | 225 | 169 | 0 | -16 | 0 | lost/4 |
| 75106 | d146 | eater | 702/950 | 702/950 | 878/1188 | 837/1188 | 1 | 238 | 176 | 0 | -41 | 0 | lost/5 |
| 75108 | d94 | suburb | 975/1300 | 975/1300 | 975/1300 | 832/1300 | 0 | 0 | 0 | 0 | -143 | 0 | lost/5 |
| 75108 | d95 | suburb | 799/1300 | 799/1300 | 799/1300 | 507/1300 | 0 | 0 | 0 | 0 | -292 | 0 | lost/7 |
| 75108 | d95 | suburb | 507/1300 | 507/1300 | 507/1300 | -27/1300 | 0 | 0 | 0 | 0 | -534 | 0 | won/6 |

Note on the 75102 d172 reunion rows: one wounded reunion
instance fought four times in one day, and the chain
reads like a ledger — tile 300 -> end 171 (lost), then
re-met at 171 -> end 120 (lost), then re-met at 120 ->
end 120 (lost, no damage dealt), then re-met at 120 ->
end -24 (won, overkill). Each fight's construction
equals the tile HP the previous fight left behind, so
the lost fights' end numbers become the next fight's
starting numbers. The fightId-keyed analysis.json is
authoritative (24 distinct fightIds; the same-day
rows are repeat fights, not a double-count).

Aggregate decomposition (m_0, 24 fights):

- tile -> construction: 0 on 24/24. Construction EQUALS
  the tile HP exactly on every fight — the world-HP
  rule, measured, not assumed. The old-base fresh-roll
  gap (tile -> construction) is gone on current master.
- construction below max: 24/24. Every world-origin
  wave-4 monster walked in wounded (tile HP < tile
  maxHp on every fight), so the fighterconstruct
  "always built full" claim does NOT survive the
  world-HP rule: construction is full only when the
  world monster is unwounded, which happened 0 times
  here. Construction maxHp is in the def hp range on
  24/24 (world maxHp is the spawn roll).
- pre-fight overtime scaling: 2 fights (both tier 1):
  maxHp +463 (225 + 238), HP gain +345 (169 + 176).
  Tier counts: tier 0 x22, tier 1 x2, tier 2+ x0.
  Crew fighters: 0 on the whole band (tier 1 injects
  floor(1/2) = 0 packmates; no tier >= 2 fight exists
  to test the packmate injection).
- opening damage: 71 total, all of it in ONE fight
  (75102 d166 audit — the same opening-turn mechanism
  the fighterconstruct arm traced: faster villagers
  strike before the scholar's first turn). The other
  23 fights have opening sum 0.
- in-fight change: -3,187 total (net damage on 22
  fights, 0 on 2 fights: 75102 d172 reunion 120 -> 120,
  75106 d99 algorithm 719 -> 719). Positive (healing /
  growth) on 0 fights.
- in-fight maxHp growth: 0 on 24/24. No fight's ceiling
  moved mid-fight, by any mechanism.
- tile -> end: -2,913 total = 0 (tile->constr) +
  (+345 - 71) (pre-fight net) + (-3,187) (in-fight).
- construction -> end: -2,913 total, same sum (tile ==
  construction on every fight).
- scales-up set (constrToEnd > 0): exactly the 2
  overtime fights: +288 = +345 overtime HP gain - 0
  opening - 57 in-fight damage. 100% of the increase
  is pre-fight; in-fight change is negative even there.
- TB fight outcomes on this band: lost 22, won 2
  (75102 d172 reunion, end -24; 75108 d95 suburb, end
  -27 — overkill past zero, as the tbEnd snapshot
  records it). These are new-base facts on this band,
  NOT a re-score of the w4convert 0-kill verdict (old
  base, old rule, untouched).

## The two scaled fights, end to end

75106 d145 eulogy: world monster at 675/900 walks in
at 675/900 (construction = tile, wounded, not fresh).
Overtime tier 1 (direct record, pre == post == end;
inferred tier from 1125/900 = 1.25 also 1) scales it
to 844/1125 before the first turn (+169 HP, +225 max).
No opening damage. The fight deals 16 net damage:
end 828/1125, lost in 4 rounds. Construction-to-end
+153, of which +169 is pre-fight overtime and -16 is
in-fight damage.

75106 d146 eater: world monster at 702/950 walks in
at 702/950. Tier 1 scales it to 878/1188 (+176 HP,
+238 max). No opening damage. The fight deals 41 net
damage: end 837/1188, lost in 5 rounds.
Construction-to-end +135, of which +176 is pre-fight
overtime and -41 is in-fight damage.

## Sense note (75106 d145/d146, NON-MEASURED replay)

The prereg's sense anchor (75103 d178) does not exist
on this base — 75103 sits the lesser seat on day 132,
before any scaled fight — so the sense read moved to
the band's actual scaled fights, 75106 d145/d146
(window d135-d146; disclosed in Metric review 3, not
hidden). The replay's fight days coincide with the
measured rows, but the replay trajectory is still
NON-MEASURED and its text never enters any count.

The game DOES tell the player why the monster is
bigger — twice over, in plain words. The day before
the fight (d144), the tier announcement fires:
"OVERTIME x1 — wave 4-5 monsters return as RERUNS
(+25% HP, +12% damage). Raids come sooner. The table
docks your standing -10. Take your seat from Haven to
stop the clock." At the fight itself (d145, d146),
the overtime line fires: "RERUN x1 — you have seen
this episode. It has seen you too. (Overtime: +25%
HP, +12% damage.)" And the monster's own name changes
for the whole fight — every turn is "RERUN x1 The Big
Beast's turn" / "RERUN x1 The Eater's turn." A player
meeting the d145 eulogy at 844/1125 instead of the
675/900 they saw at the treeline has been told the
reason (overtime rerun, +25%) and the remedy (sit and
stop the clock). What the narration does NOT state is
the arithmetic itself — nowhere does it say "675
became 844." The why is narrated; the number is not.
That is a narration-completeness note, not a scaling
finding: the scaling itself is announced, labeled, and
percentage-stated at fight start.

## Parity (diagnostic, NOT a gate — see Metric review 2)

Parity vs the fighterconstruct corpus FAILS on 4 seeds
and passes on 4 (75101: 132d exact; 75104: 90d exact;
75106: 146d exact; 75107: 180d exact). Divergences,
all diagnosed as base drift (fa3516cc1, the world-HP
TB rule, landed between the two corpora — the detgate
PASS and the same-base detcheck below prove the
recorders did not cause them):

- 75102: 180d (was 177d), deaths 44 (was 42), new
  w4world fightId set (11 fights now, incl. 6 eulogy
  fights d176-d180 that did not exist before).
- 75103: 132d (was 180d), won 1 (was 0), entered 1
  (was 0), deaths 28 (was 50) — the village sits the
  lesser seat on day 132 instead of surviving to 180,
  so the old band's scaled suburb fights (d159/d160/
  d178, tiers 4/6) never happen on this base.
- 75105: 180d (was 162d), won 0 (was 1), waveReach 4
  (was 3), table 0 (was 1), deaths 48 (was 36),
  courtship 16 (was 27).
- 75108: 102d (was 114d), table 0 (was 1), deaths 37
  (was 42), new w4world fightId set.

Same-base neutrality proof (the diagnosis, not a
claim): the fighterconstruct sweep (WITHOUT the
tbovertime recorder) re-run on THIS base for seed
75102 reproduces the tbovertime row exactly — days,
gameDays, endReason, won, waveReach, ranks, national,
table, entered, deathTotal, courtship, and the full
fighterconstruct + tbdmg sections byte-equal; the
nonworldkill section differs ONLY in stack-trace audit
lines (the extra tbovertime wrapper frame), never in
a game field. Detgate PASS (132/132, tsNationalDay 77)
plus this detcheck is the recorder-neutrality proof
the prereg's parity rule requires. The parity FAIL
against the old corpus is therefore base drift, stated
with per-seed diffs above — never hidden, never
re-scored against a retired corpus.

## Wall numbers (THIS band only, never pooled)

National ever / final 7/8 / 6/8; table invited / entered
4/8 / 3/8; wins 3/8 (3 lesser / 0 full); wave-4 unlock
6/8; wave-5 unlock 0/8; median survival 146d (days: 90,
102, 132, 132, 146, 180, 180, 180); deaths total 286;
courtship combined 110, 8/8 active — SUBSTRATE GATE
PASSES. The old band's numbers (median 162d, national
final 5/8, table 6/8) are NOT comparable — different
base (world-HP rule), and this evidence does not pool
them.

## Village assessment (plain words)

Same shape of story as the last rounds, with one sharp
difference the new rule bought: three villages win
through the lesser seat, three die, two survive the
horizon without sitting, six reach wave 4, none
reaches wave 5, and the full seat is still nobody's
story. The difference is that fights now bite: two
world-origin wave-4 monsters actually die in
turn-based fights on this band (a reunion and a
suburb, both finished past zero), where the old base's
band killed none — because the monster no longer
walks in with a fresh full roll erasing every toll
and field chip the village already paid to wound it.
The village that sat earliest (75103, day 132) never
even met overtime scaling; the villages that waited
longest met it only at its smallest step. Overtime,
on this band, is a whisper, not a wall: tier 1, twice,
+25%, and both fights still lost — the scaling did
not save those monsters, it only made their losses
slightly less bad.

## Blanks filled or documented

- FILLED (answered, with numbers): the w4convert
  mechanism question — pre-fight overtime scaling vs
  in-fight TB growth, separated on 24/24 fights with
  exact sums. In-fight maxHp growth is 0 everywhere;
  in-fight HP change is damage or zero everywhere;
  the only construction-to-end increases are the 2
  overtime fights, 100% pre-fight.
- FILLED (mechanism, read from code + corpus): the
  world-HP rule's measured consequence — construction
  EQUALS tile HP on 24/24 fights, so the
  fighterconstruct "always built full" claim is
  superseded on current master (construction is full
  only when the world monster is unwounded: 0/24
  here). Future censuses must not assume construction
  hp == maxHp; they must read construction hp AND
  maxHp separately, as this analyzer now does.
- FILLED (narration): the scaling IS told to the
  player (tier announcement + RERUN line + renamed
  fighter + percentage), though the exact HP
  arithmetic (675 -> 844) is never stated.
- DOCUMENTED, NOT MEASURED (named next blank, for
  the coordinator — NOT a lever proposed or built):
  tier 2+ overtime is unobserved on this band (0
  fights, 0 crew packmates) — the packmate injection
  (floor(t/2) extra fighters) and the tier 4/6
  scaling the old band showed have no current-master
  measurement. A future arm that reaches tier 2+
  (a village that waits longer without sitting or
  dying) could measure them; this arm names it and
  stops there. No balance change is proposed from
  this arm, per the task.
- DOCUMENTED, NOT FIXED (instrument limitation):
  the tbovertime recorder cannot snapshot a fight
  that starts AND ends inside one startCombat call
  (6 rows, all non-unit wave-None fights, explained
  by their same-call signature) — the same limitation
  the nonworldkill recorder already carries with its
  'end-row' fightIdSource. It does not touch the unit
  join (24/24).

## Metric review (§14 — binding, no mid-run re-scores)

No threshold was moved mid-run. The GO rule was judged
exactly as pre-registered (8/8 complete + join >= 95%
+ 0 unexplained gaps + table + corrected sentence).
Judgment notes, all disclosed, none a re-score:

1. PREREG ASSUMPTION FAILURE, CORRECTED IN THE OPEN
   (analyzer fix, not a metric change). The prereg's
   decomposition assumed the fighterconstruct finding
   — construction hp == maxHp always — and defined
   opening damage as startMax - startHp. On current
   master that assumption is FALSE (world-HP rule:
   construction hp = wounded world hp, maxHp = world
   maxHp), and the analyzer's FIRST run failed loudly
   on all 24 fights (24 opening disagreements, 24
   failed identities, 54 gaps) — exactly as a proof
   instrument should. The fix re-derives the identity
   from the code's actual order of operations
   (construction -> opening turns -> overtime scaling
   -> start snapshot): predicted startHp =
   round((constrHp - openingSum) * (1 + 0.25*t_rec)),
   with opening damage taken from the fighterconstruct
   opening sum, not from startMax - startHp (which is
   the scaled world wound plus opening damage). The
   GO rule itself was NOT changed, the prereg was NOT
   re-scored, the corpus was NOT re-swept, and the
   failed first run's output is disclosed here rather
   than hidden (its aggregates — preFightScalingMax
   463, inFightMaxGrowth 0 — already agreed with the
   corrected run; only the opening column was wrong).
   The corrected analyzer re-run passes mechanically
   (24/24 joined, 0 disagreements, 0 identity failures,
   0 unexplained gaps), and the analysis.json in the
   corpus is the corrected run's output. A future run
   should treat "construction is full" as a hypothesis
   to test per base, never as a definition.
2. PARITY, DIAGNOSED NOT HIDDEN. Parity vs the
   fighterconstruct corpus FAILS (4 seeds diverge;
   diffs listed above). The prereg's parity rule
   allows a divergence diagnosed with a detgate PASS:
   detgate PASSES on this base (132/132,
   tsNationalDay 77), and the same-base detcheck
   (fighterconstruct sweep without the tbovertime
   recorder, seed 75102, this base) reproduces the
   tbovertime row exactly except stack audit lines.
   Diagnosis: base drift — fa3516cc1 (world-HP TB
   rule) landed between the corpora, and it changes
   trajectories on exactly the seeds whose wave-4
   fights it touches. The parity FAIL is therefore
   reported as a diagnosis, and the GO legs (which do
   not include parity) are judged on their own terms.
   The analyzer's mechanical gate was also corrected
   to match the prereg's own hard-failure list
   (parity is printed, not gated — commit
   a0128a81424, disclosed here; the prereg lists
   parity under its own rule, not under the GO rule).
3. SENSE ANCHOR MOVED, DISCLOSED. The prereg's sense
   target (75103 d178, tier 6, old base) does not
   exist on this base (75103 sits day 132). The sense
   read therefore used the band's actual scaled fights
   (75106 d145/d146, tier 1, window d135-d146). The
   sense question — does the game tell the player WHY
   — is answered for the tier-1 case, not the tier-6
   case; the tier-6 narration (same RERUN line, larger
   percentage) is the same code path, but this arm
   does not claim a tier-6 trace it did not read.
4. PANEL (§15). NOT attempted, per the task's standing
   exception — scripts/balance-panel.js has NO
   corpus-ingest mode for a single-arm census corpus.
   No panel artifact was faked; the paired
   sweep-compare tables (this analyzer's output,
   analysis.json, parity diagnostic vs the
   fighterconstruct corpus) are the section-15
   substitute, as in the predecessor rounds.
5. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline
   .../telemetry-baselines/scale-wall.json --current
   'evidence/2026-10-28/perseed-tbovertime-a/*.json'
   --metrics national,table,wins,exiled` -> 3 LOUD lines
   (national 12 -> 0, table -75% 16 -> 4, wins 16 -> 0,
   n=10 files). Verdict: KNOWN ARTIFACT, no investigation,
   baseline NOT rolled. Two independent reasons, both
   documented (same as the census family): (a) the
   baseline's own regime note forbids this comparison (a
   ~100%-win winseat suite vs a tableseat-nowait census
   substrate); (b) the field-shape artifact repeats
   (per-seed rows carry nationalEver/entered/won, not
   top-level national/table/wins paths; summary.json +
   analysis.json are the 9th and 10th files). The
   corpus's real wall numbers are nationalEver 7/8,
   table entered 3/8, wins 3/8. No exiled LOUD line.

Doubts recorded for the NEXT run, never applied here:

1. TIER 2+ OVERTIME is the unmeasured half of this
   question: packmate injection, tier 4/6 scaling, and
   whether the RERUN narration stays coherent when
   the monster arrives with a pack. Needs a band that
   actually waits into tier 2+ — a different substrate
   or a longer horizon, pre-registered, not assumed.
2. THE 75102 d172 REUNION REPEAT: one wounded reunion
   instance fought twice in one day (tile 300 -> end
   171, then re-met). Whether repeat fights against
   the same lingering instance should carry the
   lingerer-restore number or the last-fight end
   number is a question for the lingerer work, not
   this arm — the join records both fights under
   their own fightIds and asserts nothing about which
   number the world keeps.

## Infrastructure notes

- Sweep: scripts/test-tbovertime-sweep.js, 8 seeds,
  ~100-260s per seed (detgate ~4.3 min for its two
  runs) + sense replay ~100s. Corpus:
  evidence/2026-10-28/perseed-tbovertime-a/ (8 rows +
  summary.json + analysis.json + sense-75106.txt) +
  detcheck row
  evidence/2026-10-28/perseed-tbovertime-a-detcheck/
  s75102-armed.json. Analyzer:
  scripts/test-tbovertime.js (unit checks pass; exit 0
  on the corrected run, mechanical PASS). Sense:
  scripts/test-tbovertime-sense.js (NON-MEASURED
  replay only; 75106 window d135-d146).
- Safe-commit index clobber hit the prereg commit, the
  instruments commit (all 4 files), and the analyzer
  fix commit (transient status read) — commit itself
  correct in every case, verified by stat + hash
  before proceeding; repaired via HEAD-blob cacheinfo,
  verified status empty + diff HEAD empty. The same
  check runs after every safe-commit in this run.
- Background sweep session loss (infrastructure note):
  the first backgrounded 8-seed sweep loop vanished
  mid-run after seed 75101 (no sweep process left
  running, row safely on disk); the remaining seeds
  were run one at a time in the foreground instead.
  No seed was run twice against the corpus (75101's
  row was kept, not overwritten).
- No jest run: zero src/js changed, and the arm proofs
  are the attributable verification (per the census-
  family precedent for DIAG-only runs). No
  [needs-eyes] flag applies (measurement only, no
  narration or behavior added — the sense script only
  READS beats on a replay, it adds none to the game).
- Commit: sim-tbovertime-a, GO on all legs, zero
  src/js diff. Branch ready, pending coordinator merge;
  NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- Heartbeats: tree heartbeat after registration
  (coordinator), after instruments (this worker), and
  after the sweep — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-28 — TB-end scaling, corrected — the
  w4convert "TB scales the monster up" reading is
  corrected on current master: in-fight maxHp growth
  0/24 fights; the only construction-to-end increases
  are the 2 tier-1 overtime fights (+288, 100%
  pre-fight). The old-base 3688 example decomposes as
  fresh roll +500, pre-fight overtime +2213, in-fight
  0 (this run's verdict, not a re-score of w4convert).
- [open] 2026-10-28 — construction-equals-tile, new
  base fact — on current master every world-origin
  wave-4 TB fighter is constructed at the wounded
  world HP (24/24, all below max); the fighterconstruct
  "always built full" claim is superseded by the
  world-HP rule and future censuses must read
  construction hp and maxHp separately.
- [open] 2026-10-28 — tier 2+ overtime unmeasured —
  no fight on this band reached tier 2+ (0 crew
  packmates); a future arm reaching tier 2+ could
  measure packmate injection and tier 4/6 scaling on
  current master (named, not built, per the task).
- [open] 2026-10-28 — RERUN narration states the why
  but not the number — the overtime scaling is
  announced (tier line + RERUN line + renamed fighter
  + percentage) but the exact HP arithmetic (675 ->
  844) is never stated to the player (sense note, not
  a lever proposal).
