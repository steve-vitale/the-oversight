# sim-allydpr-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, follow-up to run fleshout-20261029T1715Z, landed by
adoption run fleshout-20261029T1915Z. Axis: scale-onramp (blocking axis,
converging, NOT converged). Worker: sim-allydpr-a.
DIAG-ONLY ARM: zero src/js changes, zero default flips, zero game-code
changes, zero rewiring of joining, zero change to any ally rule. The queued
narration fix (joined drive-off ends have no end line) is NOTED, not built,
in this arm.

Assignment: PRICE THE ALLY-DPR FLIP THRESHOLD per joined fight, following
up the landed tile-join arm (evidence/2026-10-29/sim-tilejoin-a.md,
DIAG-NO-GO: tile-feed prototype converted 24/24 shouts to joins but joined
fights killed only 2/24 and the band worsened wins 6→3, deaths 240→311).
Question: is the gap ~1.5x (entry strength is the live question, needs a
Steve-call before any one-ally change) or ~3–5x+ (one ally cannot carry
this gap)?

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law). No CANON-registered
doc covers field-fight joins or ally DPR pricing — the mechanism below is
derived from code, stated exactly so it can be checked
(src/js/fieldFights.js fieldFight, morale block): at round >= 2 the engine
computes vDpr = rec.mDealt / round, mDpr = rec.vTaken / round,
rtk = mlead.hp / max(1, vDpr) (rounds to drop the lead),
rtd = vHp / max(1, mDpr) (rounds until the villager drops),
hopeless = rtd < rtk * 0.85. On a hopeless round with help uncalled,
allies > 0, allyVids non-empty and intent not learn, the fighter shouts
and one ally charges in (rec.calledHelp, rec.allyVid); the shout replaces
that round's hopeless flee. On the NEXT hopeless round (or on the flee
floor, vHp/vHpMax < fleeAt) the fighter flees anyway unless Rally/War Cry
fires. An ally that joins on a round where the leader is already below the
flee floor therefore never strikes: the fight ends in the same morale pass
(FLOOR-BRANCH), allyDealt = 0, allyTaken = 0. That shape is a timing/floor
problem, not a DPR problem, and no DPR multiplier over a zero window can
price it.

## Corpus (step 1 inventory, before judging)

Source: evidence/2026-10-29/perseed-tilejoin-a/on/s75101–s75108-fresh.json
(8 seeds, ON leg only for joined fights; OFF leg used only for the
addressable-pool counterfactual, below). Worktree HEAD at cut: ef9219748.
Joined fights are identified EXACTLY as in scripts/test-tilejoin-a.js:
universe U = fieldparty channel == 'field', caller in {resolve, patrol,
aid}, wave 1..4, leader NOT the scholar; fought = rounds >= 1;
joined = tilejoin joinedAllyVid non-null, joined to the fieldparty row by
call index with day/vid/mid agreement asserted. Count reproduced in
inventory: 29 tilejoin joined rows in total, 5 outside U (channel 'other'),
24 inside U — matching sim-tilejoin-a.md's 24. Band seeds: 75101–75108.

### Fields the corpus rows DO carry per joined fight (joined rows)

- Identity/outcome: seed, day, fighter vid, monster mid, wave, caller,
  rounds (total), outcome (vKill / vFlee / mFlee / vDie), intent,
  everHopeless, calledHelp, joinedAllyVid, fedVids.
- Monster damage totals: mHpStart (fieldparty row), mHpLeft (fieldparty
  row), mDealt (TOTAL damage to the monster, leader + ally), allyDealt,
  allyTaken, vTaken (leader damage taken).
- End state: vHpLeft, allyHpLeft, allyFirst (first NAME only, no round),
  minHpFrac, breakline branch (DRIVE-OFF / KILL / HOPELESS-BRANCH /
  FLOOR-BRANCH / PARTY-DEATH / CAP).
- Transcripts: tilejoin sense slots per seed (joined = first fed+calledHelp
  fight, shouted = second fed+calledHelp fight) — 13 of the 24 U joined
  fights have a verbatim log; 11 have no log at all. Sense logs carry
  per-round strike lines with monster HP after each strike and the shout
  line position, but they are NOT corpus row fields and are not a
  substitute for row fields (see field gaps).

### Fields the corpus rows DO NOT carry (field gaps — the pricing blockers)

- NO shout round (the round after which the shout fired).
- NO target HP at shout (monster HP at the shout moment).
- NO leader HP at shout, NO leader HP max (so no rtd at shout).
- NO per-round damage: no ally damage per round, no leader damage per
  round, no DPR at shout for either side.
- NO rounds remaining / flee horizon at shout (no rtd, no fleeAt, no
  mBreak fraction for the fight).
- NO ally strike count or ally active-round count (derivable only as
  rounds minus an unknown shout round, or 0 when the floor ends the fight
  in the shout pass).
- Tilejoin rows ALONE lack mHpStart/mHpLeft entirely; those come only
  from the index-joined fieldparty row.

Consequence, stated before any judged number: the exact shout-time price
below cannot be computed from corpus rows for ANY joined fight, because
every one of its inputs is in the missing list. Sense-log reconstruction
covers at most 13/24 fights, partially (monster HP before the shout is
readable only when a strike line precedes the shout; leader HP at shout
is confounded by field-medicine +20 lines with no running total), and
hand-parsing logs is not a corpus-row price. The analyzer therefore
reports the exact price as UNPRICEABLE per fight and computes ONLY the
pre-registered end-state proxy below, labeled proxy everywhere, never
presented as the shout-time price.

## Formulas (exact, fixed before judging)

### Primary: shout-time flip price (the brief's formula)

For a joined fight, let S = shout round (shout fires after round S,
ally first acts in round S+1), HP_shout = monster lead HP at the shout
moment, vHp_shout = leader HP at the shout moment,
DPR_total@shout = mDealt@S / S, mDpr@shout = vTaken@S / S (engine
definitions at round S).

- rtk_shout = HP_shout / max(1, DPR_total@shout) — rounds to kill at the
  shout-time total damage rate.
- rtd_shout = vHp_shout / max(1, mDpr@shout) — rounds until the leader
  drops: the window the joined fight actually has (the engine's own
  hopeless comparison is rtd_shout < rtk_shout * 0.85).
- required ally DPR = HP_shout / rtd_shout — the ally-alone damage rate
  that drops the monster within the leader's remaining window (brief's
  formula verbatim; conservative by construction, since it credits the
  ally alone and ignores the leader's continuing damage).
- observed ally DPR = allyDealt / allyActiveRounds, where
  allyActiveRounds = rounds - S if the fight continued past the shout
  pass, else 0.
- flip multiplier = required ally DPR / observed ally DPR.
- A fight is PRIMARILY PRICED (finite multiplier) only when S,
  HP_shout, vHp_shout, allyDealt and allyActiveRounds are all known
  from corpus rows and observed ally DPR > 0. Hand-parsed sense logs do
  NOT count toward this bar.

### Secondary (proxy, labeled PROXY in every table and headline)

End-state sufficient price for the kill, over the observed ally window,
requiring no shout-time field:

- outcome vKill: k_proxy = 1.0 (already flipped; the observed ally
  window already sufficed for the kill).
- outcome != vKill and allyDealt > 0:
  k_proxy = 1 + mHpLeft / allyDealt.
  Reading: scaling ally damage by k_proxy over the SAME observed ally
  window adds (k_proxy - 1) * allyDealt = mHpLeft, exactly zeroing the
  monster's remaining HP. Sufficient for the kill ignoring second-order
  effects (an earlier mBreak drive-off, reduced incoming damage as the
  monster weakens — neither is modeled, so k_proxy is a sufficient, not
  a necessary, multiplier for the kill specifically).
- outcome != vKill and allyDealt = 0: k_proxy = infinite / undefined
  (ally never struck; there is no DPR window to scale — timing/floor,
  not DPR). These fights are counted as UNPRICED-BY-PROXY, never as
  k = 1 and never dropped silently.
- Proxy summary: median k_proxy over FINITE proxy prices only, plus
  shares of finite prices with k_proxy <= 1.5, <= 3, <= 5, plus the same
  shares over ALL 24 joined fights (infinite counted as > 5). Both
  denominators reported; neither is hidden.

### Context (report-only, never a verdict leg)

- OFF addressable pool (tilejoin evidence): 11 fights, 11 fled, 0 kills,
  0 deaths — the fight-level counterfactual for joined fights.
- Joined-death share: joined vDie / 24, as a guard read (not a leg).
- Band wall numbers (OFF vs ON: wins 6→3, deaths 240→311) are REPORT-ONLY
  for this diverging prototype per the tilejoin metric review (band
  divergence contaminates attribution); they are never a verdict leg
  here.
- Outcome mix of the 24 joined fights (vKill / mFlee / vFlee / vDie) and
  the branch mix (HOPELESS-BRANCH vs FLOOR-BRANCH vs others) reported,
  because the floor branch is where DPR pricing breaks down.

## Bars (judge against this header; a miss is NO-GO, never re-scored)

- DIAG-GO (primary): at least 20 of the 24 U joined fights PRIMARILY
  PRICED with a finite shout-time multiplier, AND the median multiplier
  and the shares needing <= 1.5x, <= 3x, <= 5x all reported.
- If the corpus rows lack the fields to price a majority with the
  primary formula, the verdict is DIAG-NO-GO / INSUFFICIENT-DATA on the
  corpus — stated plainly, with the field gaps named. The proxy is
  reported as directional context in that case; it does NOT rescue the
  primary bar and does NOT convert the verdict to GO.
- Coverage check (analyzer recomputation, not hand-copy): the analyzer
  must reproduce the tilejoin headline counts from the corpus where
  checkable — 24 U joined fights, joined outcomes 2 vKill / 4 mFlee /
  15 vFlee / 3 vDie, ally totals dealt 137 / taken 296 — or report the
  mismatch as an instrument failure before judging.
- SENSE BAR: at least 3 joined-fight transcripts read end to end and
  judged for meaning/coherence (does the join read as a person
  answering a shout? does the end read honestly?), never just counts.
  The queued drive-off narration blank is noted, not built.

## What this arm does NOT do

No src/js change, no policy change, no default flip, no joining rewire,
no ally-rule change, no narration fix, no push, no bump, no live
verification. No re-judgment of the tilejoin verdict (DIAG-NO-GO stands).
No panel artifact (standing exception as in tilejoin: identical-seed
corpora are the §15 substitute). Instruments: the new analyzer
scripts/test-allydpr-a.js (recompute + price + judge). Never run
concurrent jest; cache dir /tmp/jest-cache-sim-allydpr-a (no jest
expected — node scripts only; the rule is recorded, not waived). Never
touch docs/ONTOLOGY.md. Never touch any other worktree, registry entry,
loop-B tree, or build lane. Never touch the main tree.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
