# sim-shoutrec-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261029T2115Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-shoutrec-a.
Backlog #1452 (claimed by this run). Follow-up to sim-allydpr-a
(evidence/2026-10-29/sim-allydpr-a.md, DIAG-NO-GO / INSUFFICIENT-DATA:
the exact shout-time price was priced for 0/24 joined fights because
the corpus carried none of its inputs).

DIAG / INSTRUMENTATION ONLY. No game-code behavior change, no default
flips, no joining rewire, no change to the one-ally rule or to entry
strength on proxy evidence alone. The src/js change in this arm is
ADDITIVE RECORD FIELDS ONLY (see below) plus a policy-side recorder;
both are proven behavior-neutral by the neutrality leg before any
verdict is judged. The floor branch (joins where the ally never
strikes) is a separate Steve-call question, NOT a DPR question: it is
reported separately and never folded into the DPR verdict. No
w5counts / fullseat-diag files are touched (sibling arm's files).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law: earlier waves
never leave; wave 2+ monsters hold longer — mBreak 0.15 vs wave-1
0.25, see engine note below), docs/TABLE.md (the table prices the
run; scale-onramp is the blocking axis), docs/PROGRESSION.md (wave
ledger, scale transitions). No CANON-registered doc covers field-fight
joins or ally DPR pricing — the mechanism below is derived from code,
stated exactly so it can be checked (src/js/fieldFights.js
fieldFight, morale block): at round >= 2 the engine computes
vDpr = rec.mDealt / round, mDpr = rec.vTaken / round,
rtk = mlead.hp / max(1, vDpr), rtd = vHp / max(1, mDpr),
hopeless = rtd < rtk * 0.85. On a hopeless round with help uncalled,
allies > 0, allyVids non-empty and intent not learn, the fighter
shouts and one ally charges in (rec.calledHelp, rec.allyVid); the
shout replaces that round's hopeless flee. On the NEXT hopeless round
(or on the flee floor, vHp/vHpMax < fleeAt) the fighter flees anyway
unless Rally/War Cry fires. mBreak (the monster drive-off line) is
wave >= 2 ? 0.15 : 0.25 of the lead's max HP; the fight ends mFlee
when members[0].hp / members[0].maxHp < mBreak. The flee floor
fraction vBreak is computed before the rounds loop from bravery,
temperament and holdBonus (armed +0.08, allies +0.04 each capped
0.12, day >= 7 +0.08, bond/godpath bonuses), clamped to [0.05, 0.6];
at a hopeless shout round, fleeAt = vBreak (winning is false by
construction of the shout branch, so the winning 0.05 line does not
apply).

## Instrument: what is added, exactly

### src/js/fieldFights.js — additive record fields only, no behavior

Inside fieldFight, at the hopeless-shout branch only, snapshot:
- rec.shoutRound = round (the round after which the shout fires;
  the ally first acts in round round+1)
- rec.shoutMhp = mlead.hp at the shout moment (first live member)
- rec.shoutMmax = mlead.maxHp at the shout moment
- rec.shoutVhp = vHp at the shout moment (after that round's action
  phase, including any field-medicine +20 that round)
- rec.shoutVhpMax = vHpMax
- rec.shoutMdealt = rec.mDealt at the shout moment
- rec.shoutVtaken = rec.vTaken at the shout moment
- rec.shoutAllyDealt = rec.allyDealt at the shout moment (expected 0
  for shout joins; non-zero only if an allyFromStart ally already
  fought, which the shout branch excludes by helpCalled)
- rec.shoutMbreak = mBreak (fraction, 0.15 or 0.25)
- rec.shoutFleeAt = fleeAt at the shout moment (= vBreak; recorded
  from the variable, not recomputed)
- rec.shoutVbreak = vBreak

And, at morale entry each round (after the action phase, before the
hopeless/winning computation), push one cumulative entry to
rec.roundTotals: { round, mDealt, vTaken, allyDealt, allyTaken }.
Per-round damage = differences of successive cumulative entries.
Rounds that end in the action phase (leader death at line ~1511,
lead kill / break checks before morale) have no morale entry for
that round; the analyzer assigns any residual (rec total minus the
sum of morale-entry diffs) to the final round and flags it
"residual-final-round". Per-round sums must reconcile exactly to
rec.mDealt / rec.allyDealt / rec.vTaken, or the fight is flagged
parse-mismatch and excluded from per-round tables (its snapshot
prices still stand, since they need no per-round split).

No RNG draw is added, no stat, outcome, log line, or decision input
is touched, and no existing rec field is read differently by any
caller (verified by grep: callers consume outcome/rounds/totals/log;
the new fields are read only by the shoutrec recorder). The
neutrality leg (below) proves recorder-off == recorder-on on the
band: the fresh band is re-run with fieldFights.js reverted to HEAD
into a scratch dir, and every corpus row except the shoutrec store
must be byte-identical. A mismatch is an instrument failure: no GO
is judged until it is explained.

### scripts/policies/shoutrec-diag.js — new policy-side recorder (new file)

Wraps Game.fieldFight only (no advancePart wrap, no state writes, no
RNG). Post-call, for every fight, it copies the shout snapshot and
roundTotals from rec plus the identity/outcome fields the analyzer
needs (seed/day via Game.state.scholar.day, vid, mid, wave, caller
class via the same stack classifier as fieldparty-form-diag,
channel, rounds, outcome, intent, everHopeless, calledHelp,
joinedAllyVid, allyDealt, allyTaken, mHpLeft, vHpLeft, fedVids when
the tilejoin wrapper fed them — read from rec only where the
tilejoin row already carries it; the analyzer joins rows by call
index exactly as test-allydpr-a.js does, it never re-derives the
tilejoin feed). Sense: the FIRST joined fight's full log per seed
(capped 500 lines, same cap as tilejoin-diag). Errors are counted,
never thrown into the engine. Env: SHOUTREC=1 installs; unset means
the sweep never installs it (the sweep always sets it).

### scripts/test-shoutrec-a-sweep.js — new sweep (modeled on test-tilejoin-a-sweep.js)

Substrate reused VERBATIM, never edited:
scripts/policies/tableseat-nowait.js + fieldparty-form-diag +
w4dpr-diag + breakline-diag + tilejoin-diag, with env
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
BREAKLINE=1, TILEJOIN=1, SHOUTREC=1. Seeds 75101–75108 (the tilejoin
band), 180d death-aware horizon (same as tilejoin; dead villages
stop simulating, +10d tail max per the harness). Corpus:
evidence/2026-10-29/perseed-shoutrec-a/on/ (ON leg only — the OFF
leg has no joins by tilejoin's finding, shouts 0, so it cannot price
a join). The sweep writes per-seed rows s<seed>-fresh.json plus
summary.json, same shape as the tilejoin sweep plus a `shoutrec`
store section.

## Population (fixed before judging; same join rule as allydpr)

Universe U: fieldparty channel == 'field', caller in {resolve,
patrol, aid}, wave 1..4, leader NOT the scholar, fought
(rounds >= 1). Joined: tilejoin joinedAllyVid non-null, joined to
the fieldparty row by call index with day/vid/mid agreement
asserted (exactly as scripts/test-allydpr-a.js). Joined fights are
then split, BEFORE pricing, into:
- SHOUT-JOINED: rec.shoutRound non-null (the shout branch fired).
  This is the DPR-priced population.
- NO-SHOUT JOINED: shoutRound null. Sub-split by breakline row
  allyFromStart (ally-from-start join, no shout — not a DPR case)
  vs unexplained null (instrument failure; any unexplained null
  blocks a GO until explained).
- ZERO-WINDOW (floor) fights are a SUBSET of shout-joined: shout
  fired, but the fight ended in the same morale pass on the flee
  floor, so allyActiveRounds = max(0, rounds - shoutRound) = 0 and
  allyDealt = 0. They are reported as their own line (n, share,
  reason "floor-branch: ally never strikes"), priced infinite for
  both flips in the all-joined table, and EXCLUDED from the DPR
  median/shares denominators (they are a timing/floor question,
  not a DPR question, per the brief's hard constraint). The
  all-joined denominator shares are also printed for transparency
  but are NOT the judged shares.

## Formulas (exact, fixed before judging)

For a shout-joined fight, let S = shoutRound, HPs = shoutMhp,
vHps = shoutVhp, Mmax = shoutMmax, mBreak = shoutMbreak,
DPRtot@S = shoutMdealt / S, mDpr@S = shoutVtaken / S (engine
definitions at round S, including any pre-round volley damage in
shoutMdealt, exactly as the engine's own vDpr does).

- rtdS = vHps / max(1, mDpr@S) — the leader's remaining window in
  rounds at the shout moment (the engine's own hopeless comparison
  is rtdS < rtkS * 0.85, with rtkS = HPs / max(1, DPRtot@S)).
- allyActiveRounds = max(0, rounds - S). allyStrikeRounds = number
  of post-shout rounds (from roundTotals diffs, plus the residual
  final round when it carries ally damage) with ally damage > 0.
- observed ally DPR = allyDealt / allyActiveRounds (allyDealt is
  post-shout ally damage in full for shout joins, since the ally
  first acts after the shout; verified per fight: shoutAllyDealt
  must be 0, else the fight is flagged and excluded from pricing
  with its reason stated).
- KILL-FLIP: required ally DPR = HPs / rtdS (ally-alone, brief's
  formula verbatim; conservative: it ignores the leader's
  continuing damage). kKill = required / observed.
- SURVIVAL-FLIP (drive-off): needS = HPs - mBreak * Mmax (damage
  that brings the lead to the break line; if needS <= 0 the fight
  was already below the line at the shout — flagged, priced 0, and
  counted separately, since the previous round's break check
  should already have ended it). required ally DPR = needS / rtdS.
  kSurv = required / observed.
- A fight is PRIMARILY PRICED (finite) for a flip when S, HPs,
  vHps, Mmax, mBreak, allyDealt and allyActiveRounds are all known
  from the recorder and observed ally DPR > 0. allyActiveRounds =
  0 → infinite with reason "zero-window (floor-branch)".
  allyActiveRounds > 0 but allyDealt = 0 → infinite with reason
  "ally active but dealt 0". Either infinite class is never
  dropped and never counted as 1.0x.
- vKill fights that already flipped: kKill = 1.0 is NOT used — the
  shout-time formula is computed for every shout-joined fight
  regardless of outcome (for a kill, the formula prices the
  observed window; if it comes out <= 1 the observed ally rate
  already sufficed, if > 1 the kill came from the leader's damage
  and/or a longer window than rtdS — reported as computed, never
  overwritten to 1.0). This differs from allydpr's proxy on purpose:
  the proxy overwrote kills to 1.0; the exact price does not.

## Bars (judge against this header; a miss is NO-GO, never re-scored)

- DIAG-GO (primary, recorder coverage): among shout-joined fights
  with allyActiveRounds > 0, at least 80% are PRIMARILY PRICED with
  a finite multiplier for BOTH flips (kKill and kSurv), AND the
  median and the shares needing <= 1.5x, <= 3x, <= 5x are reported
  for BOTH flips over the same priced population. (With an exact
  recorder the only finite-priced failures are allyDealt = 0 over a
  positive window, so the bar tests the recorder, not the game.)
- RECOMPUTE CHECKS (analyzer, not hand-copy): the fresh band must
  reproduce the tilejoin ON corpus on the shared fields — U joined
  fights 24, joined outcomes 2 vKill / 4 mFlee / 15 vFlee / 3 vDie,
  ally totals dealt 137 / taken 296 — or the mismatch is reported
  as a corpus divergence and investigated BEFORE judging (a
  divergence means the substrate moved, and no price is trusted
  until it is explained). Shout-snapshot integrity checks: every
  shout-joined fight has shoutAllyDealt = 0; per-round sums
  reconcile to rec totals or the fight is flagged parse-mismatch.
- SENSE BAR: at least 3 joined-fight transcripts read end to end
  and judged for meaning/coherence (does the join read as a person
  answering a shout? does the end read honestly?), never just
  counts. Shoutrec sense slots (first joined per seed) plus the
  tilejoin sense slots in the same rows are the source.
- NEUTRALITY GATE (blocks GO): the revert re-run (src change
  reverted, same seeds/substrate, scratch dir) must produce rows
  byte-identical to the judged corpus after deleting the shoutrec
  store key. Any diff is an instrument failure, reported loudly,
  and no GO is claimed until it is explained or the src change is
  narrowed.
- If the primary bar is missed, the verdict is DIAG-NO-GO /
  INSUFFICIENT-DATA on the instrument (stated plainly, with the
  failing leg named). The proxy numbers from allydpr do NOT rescue
  this bar. Wave splits (median kKill/kSurv per wave) are reported
  as context, never as a verdict leg. Band wall numbers (wins /
  national / table) are report-only for this diverging prototype
  per the tilejoin metric review, never a verdict leg.

## What this arm does NOT do

No behavior change, no default flip, no joining rewire, no ally-rule
change, no one-ally change, no narration fix, no push, no bump, no
live verification. No re-judgment of the tilejoin or allydpr
verdicts (both stand). No panel artifact (standing exception as in
tilejoin/allydpr: identical-seed corpora are the §15 substitute;
the comparison here is recorder-on vs recorder-reverted on
identical seeds, which is the same discipline). Instruments: the
new recorder scripts/policies/shoutrec-diag.js, the new sweep
scripts/test-shoutrec-a-sweep.js, the analyzer
scripts/test-shoutrec-a.js (fixtures + recompute + price + judge +
neutrality compare). Never run concurrent jest; cache dir
/tmp/jest-cache-sim-shoutrec-a (no jest expected — node scripts
only; the rule is recorded, not waived). Never touch
docs/ONTOLOGY.md. Never touch any other worktree, registry entry,
loop-B tree, or build lane. Never touch the main tree.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
