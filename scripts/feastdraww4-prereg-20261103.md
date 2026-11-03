# Pre-registration — sim-feastdraww4-a (Loop A 20261103T0518Z)

Axis: scale-onramp. Arm question: does raising the rate of fresh armed
feasts — the only policy-side rate that moves feast draws — convert the
wave-4 deed gap into wave-4 deeds? Context: wave-4 patrols were KILLED
(evidence/2026-11-03/wave4seek-results.md — variant fought fewer wave-4
kinds than baseline), lingerer-sortie v1 was KILLED
(evidence/2026-11-03/sim-sortie-b.md — delta 0, cost leg failed), and
curious-default escalation was KILLED (evidence/2026-11-03/
sim-curiousw4-a.md — delta 0, fighter-attributed deaths 8). This arm is
the feast-draw rate ONLY — it is NOT bundled with curious-escalation or
sortie changes, and it does NOT repeat patrols, sortie answers, or
sig-verb pressing.

## Grounding: what "feast-draw" is, and why cadence is the knob

Verified in code before this prereg was written (no invented mechanism):

1. A feast draw exists only on a FRESH armed grant. grantFeastBuff()
   (src/js/feastBuff.js) calls drawFeastScavenger() only in the fresh-
   grant branch; the refresh branch (re-feasting while feasted) extends
   the window and takes the better quality but draws nothing ("one draw
   per buff", "never a refresh"). The buff window is 2 dawns
   (src/data/feast-surge.json durationNights 2): a dusk feast buys the
   night plus the next day, and is gone by the second dawn.
2. The per-feast draw rate is already saturated and cannot be raised
   in policy space: src/data/feast-surge.json feastDraw.chance = 1.0,
   and the chance is a data lever, not a policy input. Policy cannot
   raise "the rate at which feasts draw encounters" per feast — it can
   only raise how often a fresh grant happens.
3. The baseline stack's armed feast cadence is 7 days in BOTH of its
   feast layers (competent.js eveningFeast: armed cadence 7, unarmed
   14; feastscale.js scaleFeast: armed cadence 7, unarmed 14). A fresh
   grant on day D therefore cannot recur before ~D+7 even when the
   devotion is re-armed sooner and the pantry can carry a feast —
   roughly 5 idle days per cycle in which no draw can happen. The draw
   itself is castMonster() (feastBuff.js drawFeastScavenger), which
   draws from the unlocked-wave pool at the spawn ratios (game.js
   spawnWaveTarget: 60% newest wave once wave 4 is unlocked), and the
   baseline's feastFightRoad already faces a pending draw while
   feasted. More fresh grants per unit time therefore means more
   wave-4 draws faced, with no new fight, travel, asking, or
   deed-seeking behavior.
4. The contribution gate and affordability are NOT the knob: they are
   kept verbatim (r13 rule: pantry donations + tribute/tend paid in
   the last 7 days >= 1500 kcal; plan.have >= plan.cost x 1.5), as are
   dusk, at-haven, one-feast-per-day, and the fusion-reactor ceiling.
   Lowering the contribution bar would only add feasts on weeks when
   the scholar contributed nothing — the opposite of the gate's
   intent — and would not change the cadence on weeks when the gate
   already passes. The single changed number is the armed cadence:
   7 days -> first dusk after buff expiry (effectively ~every 2 days
   when armed and affordable, since the window is 2 dawns).
5. A known limiter, stated before sims: the devotion arming is
   consumed on first combat use (feastBuff.js _spendFeastedPower), so
   a post-use feast is refused until the keepsake is channeled again
   (competent.js channelDevotion, daily). If re-arming time, not
   cadence, is the real bottleneck, this layer will be inert — the
   pilot's feast/draw counts (baseFeasts, fsFeasts, fdFeasts,
   fdDraws) will show that directly, and the arm dies on its numbers.
   A second limiter: a fresh grant draws nothing when an encounter is
   already pending (drawFeastScavenger's no-silent-clobber guard) —
   the layer does not read that state and accepts the occasional
   wasted feast; the fdFeasts-vs-fdDraws gap measures it.
6. docs/PRESERVATION.md is not engaged: this arm changes feast
   TIMING only. It touches no processing step (cleaned/cooked/smoked/
   rendered/pemmican), no spoilage rule, and no recipe — the feast
   spends the pantry exactly as the baseline's feasts do.

THE KNOB (one, policy-side only, zero src/js changes): wrap the
closecommit stack with scripts/policies/feastdraww4.js
(`withFeastDrawW4`), which overrides ONLY upkeep(): after the base
upkeep, at dusk, at the haven, when the devotion is armed, the buff
is NOT live, the contribution rule passes, the plan is affordable,
and the reactor is not online, it hosts a feast. On success it
records the draw the grant left circling the firelight
(feastDrawPending) for driver attribution. It touches no daily,
fight, travel, sortie, asking, or deed-seeking behavior, and it
consumes no RNG.

## Primary metric

Distinct wave-4 monsters fought per seed = count of deed-feed
(`Game.deedState().wavesFaced`) entries whose wave is 4 at run end.
Judged quantity: number of pilot seeds with >= 1 distinct wave-4
fought, variant minus baseline, on identical seeds. A fight counts
when the engine records it (recordDeedFight on real blow-by-blow
fights; fled fights count — the deed is "faced", not "killed").

## GO threshold (binds the run, MEASUREMENT.md §14)

GO iff BOTH:
  (a) seeds-with->=1-wave-4-fought: variant minus baseline >= +2, AND
  (b) the cost bar is clean, all three legs:
      1. total starvation deaths (deaths in the harness death stream
         whose cause mentions starvation or hunger, summed over the
         pilot): variant <= baseline + 2;
      2. fighter-attributed arm deaths: scholar deaths (death-stream
         entries with the player flag) that occur inside a fight
         that began as THIS layer's feast draw, counted by the
         driver's faceFeastDraw wrap (draw monsterId matched against
         the layer's own fdDraws record, then fight identity + the
         player flag in the tele wrap — NOT by game day, per the
         sortie-b metric review): <= 2 across the pilot;
      3. median survival (game days at run end): variant >= 0.8x
         baseline median.
Anything else = KILLED. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. If KILLED: DELETE the policy file and
the proof test, keep prereg + driver + per-seed JSONs + compare +
evidence, report KILLED with the numbers. Descriptive only, never
judged: total distinct wave-4 kinds, wave-4 kills by path, feast
counts by layer (baseFeasts, fsFeasts, fdFeasts), draw counts
(fdDraws, fdW4Draws), layer-draw fights and their deeds, wave-4
villagerTricks learned, standing-bread channel (more major feasts
also feed village standing — a secondary channel of the same knob,
reported descriptively, never as a separate arm).

## Horizon + why

180d death-aware cap, matching the prior closecommit bands. Dead
villages stop simulating (harness runDays ends at over/village-
lost); no fixed-200d tail. 180d covers the national/wave-4 window
with room for extra draws to accumulate after unlock.

## Seeds (pilot)

98601–98608. Freshness: verified by exact-token grep before any
judged sim (tracked scripts/ + evidence/: no prior judged sim-seed
use; see the freshness note below). If any seed had shown prior
judged use, the band would have fallen to 98701–98708 and this file
would have been amended BEFORE any judged sim runs.

Freshness note (filled before commit): the only scripts/ hit for
the 9860x tokens is scripts/curiousw4-prereg-20261103.md, which
names 98601–98608 solely as its own conditional fallback band that
was never triggered (that arm ran 98501–98508) — a mention, not a
use, the same class the sortie-b run accepted for 98401–98408.
Evidence/ hits are the known false-positive class (pantry-kcal
values, float fragments, hashes, counts inside long JSON lines —
inspected, not seeds; the seed-field pattern check (`"seed":
9860x`, `s9860x`, `98601-98608`) returned zero judged uses). A
file named s9860.json (seed 9860, four digits) is a different seed
and does not consume this band. No seed showed prior judged use,
so the band stands.

## Policies (POLICY-SIDE ONLY, zero src/js changes, zero default flips)

- BASELINE ("closecommit"): the verbatim stack from
  scripts/fightoutcome-driver-20261102.js — tribfloor leadfeast +
  windefer + seatdrive + fullseat-diag + titanroute + musterclose +
  mustergap. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald. One process per seed.
- VARIANT ("closecommit+feastdraww4"): baseline + ONE new policy
  file, scripts/policies/feastdraww4.js (`withFeastDrawW4`). It
  overrides ONLY upkeep() (after the base upkeep, the fresh-feast
  rule above); otherwise it delegates to the base byte-identically.
  It touches no daily, fight, travel, feast-plan, sortie, asking,
  or deed-seeking behavior beyond hosting the feast itself, and it
  consumes no RNG.

## Perception-law compliance (hard constraint, Steve 2026-10-28)

The layer decides ONLY from:
  1. The scholar's own state (day, devotion arming, buff state) and
     the haven the scholar is standing in (playerAtHaven).
  2. The feast plan the game itself offers (feastPlan) and the
     contribution the scholar personally made (recentGives +
     recentTribute — the scholar's own donations and tribute/tend).
  3. The draw the game itself announces at the scholar's own fire
     (feastDrawPending — the beast circling the edge of the light,
     shown on the phone panel for the pending encounter).
It NEVER reads any creature list, any person's whereabouts, or any
tile the scholar is not standing on. Compliance is proven by a
proof test with two legs: (a) a source scan of the policy file for
the forbidden list/place API tokens (the policy file itself
contains none of them, not even in comments); (b) a determinism
leg (stub-Game: the layer feasts exactly when all gates pass and
never otherwise, records the draw, and makes zero random calls).

## Secondary measures (descriptive, never judged)

Per seed, both arms: feast counts by layer (baseFeasts,
baseArmedFeasts, fsFeasts, fsArmedFeasts; variant adds fdFeasts,
fdDraws, fdW4Draws, fdArmFights, fdDeedFights), distinct wave-4
fought, wave-4 kills by path (kill-ledger `via`, kills only),
wave-4 villagerTricks learned + villageCounterObs counts for wave-4
types at run end, plus the standard wall numbers
(national/tableWaiting/tableDone/wins, wave reach, median
survival, death causes, starvation counts, scholar deaths).
Table flags use the landed split helper
(scripts/fightoutcome-tableflags.js): tableDone = seat taken, never
the collapsed latch.

## Comparison instrument

Balanced panel (scripts/balance-panel.js) §15: NOT applicable to
this comparison as built — POLICY_REGISTRY in
scripts/sweep-compare.js contains neither the closecommit stack
nor the feastdraww4 wrapper, and editing the observer to admit them
would change the instrument mid-comparison. The judged comparison
is therefore the identical-seed driver table
(scripts/feastdraww4-driver-20261103.js), with per-seed wave-4
counts for both arms, attached as
evidence/2026-11-03/feastdraww4-compare.md. This limitation is
stated here, before any sim, not discovered after.

## Sense-testing (SENSE-TESTING LAW)

Read at least one layer-draw wave-4 fight stretch (or, if no
layer draw ever fires, one feast-draw stretch) from the kept say
transcript, and judge meaning, coherence, consequences — not just
counts.

## Metric review

(To be filled at closeout. A miss here is NO-GO; a wrong metric is
proposed for the NEXT run, never re-scored in this one.)
