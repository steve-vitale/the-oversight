# sim-partycounter-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-partycounter-a.
Tracker-directed question (from run fleshout-20261030T0015Z): the next
arm on scale-onramp must either change what a join is for or prove
with a simulated counterfactual that a bridgeable gap exists — NOT
re-price the pooled single-ally median (sim-shoutrec-a already did
that exactly: median kill 7.34x, survival 4.70x, wave-4 217.81x /
157.64x) and NOT re-narrate endings.

MEASUREMENT ONLY. Zero src/js changes, no game-code lever, no default
flip, no one-ally-rule or entry-strength change proposed or built on
this evidence. The verdict is DIAG-GO / NO-GO on whether a bridgeable
gap exists, plus a ranked next step. No panel artifact (standing
exception as in tilejoin / shoutrec: the comparison here is
before-vs-counterfactual on identical fights, the same discipline —
the counterfactual is computed from the same fight's own recorded
state, never from a different band).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law: earlier waves
never leave; mBreak 0.25 wave 1 / 0.15 waves 2+; wave-4 bands HP
850–1500, damage 35–95) and docs/PARTY.md (parties are a System
unlock, day 7; party members auto-join fights — the fiction this
counterfactual tests against wild fights, where the engine's help
comes from the crew list, never from the tile). No CANON-registered
doc covers field-fight joins, ally DPR pricing, or party
counterfactuals — the mechanism below is derived from code, stated
exactly so it can be checked (src/js/fieldFights.js): at round >= 2
the engine computes vDpr = rec.mDealt / round, mDpr = rec.vTaken /
round, rtk = mlead.hp / max(1, vDpr), rtd = vHp / max(1, mDpr),
hopeless = rtd < rtk * 0.85. On a hopeless round with help uncalled,
allies > 0, allyVids non-empty and intent not learn, the fighter
shouts and ONE ally charges in (allyVids.shift(); line 843 slices
allyVids to 2). On the NEXT hopeless round (or on the flee floor,
vHp/vHpMax < fleeAt) the fighter flees anyway unless Rally / War
Cry fires. The shout branch and the floor check fire in the SAME
morale pass, floor after shout — so a zero-window fight ends
before any party round, whatever the party size.

## The question, precisely

If EVERY villager standing on the same tile at shout time had
joined the fight — with real per-round damage as observed — do the
kill-flip and survival-flip multipliers become bridgeable? That is,
does party formation (not stronger single allies) close the
shoutrec gap?

## Shout-time tile presence (perception-lawful, no roster feed)

Party members must be provably on the same tile at shout time in
the sim's own recorded state. The source is the tilejoin row's
`tileAll`: roster members (not the fighter) whose nodePos exactly
equals the monster tile at fight start, excluding known-dead
entries — a pure nodePos read, never a roster/crew feed, never a
snapshot feed into a decision (this arm makes no decision; it
prices a counterfactual from recorded state).

Fight-start tile presence EQUALS shout-time tile presence here,
by a mechanism fact, not an assumption: fieldFight is a single
synchronous call, and a grep of src/js/fieldFights.js shows NO
advancePart call and NO nodePos write inside it — no villager
changes tile mid-fight, so the tile list at fight start is the
tile list at the shout (round >= 2, same call). Validation, not
trust: the joined ally vid must belong to tileAll in every joined
fight (the engine picks from fed, fed is a subset of tileAll). Any
violation is a join error and blocks GO.

Crew-list joins are NOT tile mates and are never counted: the
universe below requires the tilejoin prototype feed (pre.fed),
and any joined fight whose joined ally is not in tileAll is
excluded as a join error, not priced.

Party size N = tileAll.length, UNCAPPED. This is the point of the
arm: the prototype fed at most 2 mates (trust-ordered, engine
slices to 2), but the counterfactual asks about EVERY mate on the
tile — breakline-a counted up to 10 villagers on one fight tile.
N is reported as its own distribution, never averaged away.

## Population (fixed before judging)

Universe U, verbatim from tilejoin / breakline: fieldparty channel
== 'field', caller in {resolve, patrol, aid}, wave 1..4, leader NOT
the scholar (fieldparty leader.isScholar !== true), fought
(rounds >= 1). Rows are index-joined per seed across fieldparty /
tilejoin / shoutrec stores with day / vid / mid agreement asserted
(exactly as test-shoutrec-a.js); any mismatch is a join error.

Joined: tilejoin joinedAllyVid non-null. Split BEFORE pricing:
- SHOUT-JOINED: shoutrec shoutRound non-null (the shout branch
  fired). This is the priced population.
- NO-SHOUT JOINED: shoutRound null. Sub-split by shoutrec
  allyFromStart (ally-from-start join, no shout — not a pricing
  case) vs unexplained null (instrument failure; any unexplained
  null blocks GO until explained).
- ZERO-WINDOW (floor) fights are a SUBSET of shout-joined: shout
  fired, but allyActiveRounds = max(0, rounds - shoutRound) = 0
  and allyDealt = 0. They are reported as their own line (n,
  share, N distribution, reason "floor-branch: ally never
  strikes"), priced infinite for both flips in the all-joined
  table, and EXCLUDED from the party median / shares denominators.
  Party damage cannot fix timing: the floor fires in the same
  morale pass as the shout, before any party round. This stays a
  separate Steve-call question, never folded into the party median.

ADDRESSABLE = shout-joined fights with allyActiveRounds > 0.
The DIAG-GO bar's denominator is addressable fights only.

## Formulas (exact, fixed before judging)

Single-ally prices, shoutrec formulas verbatim (S = shoutRound,
HPs = shoutMhp, vHps = shoutVhp, Mmax = shoutMmax,
mBreak = shoutMbreak, DPRtot@S = shoutMdealt / S,
mDpr@S = shoutVtaken / S):
- rtdS = vHps / max(1, mDpr@S).
- allyActiveRounds = max(0, rounds - S).
- observed ally DPR = allyDealt / allyActiveRounds (allyDealt is
  post-shout ally damage in full for shout joins; shoutAllyDealt
  must be 0, else the fight is flagged and excluded from pricing
  with its reason stated).
- kKill = (HPs / rtdS) / observed.
- kSurv = ((HPs - mBreak * Mmax) / rtdS) / observed, with
  needS = HPs - mBreak * Mmax; if needS <= 0 the fight was already
  below the break line at the shout — flagged, kSurv = 0, counted
  separately (the floor-pre-empts-break ordering finding from
  shoutrec, not a priced fight and not a failure).
- A fight is PRIMARILY PRICED (finite) for a flip when S, HPs,
  vHps, Mmax, mBreak, allyDealt and allyActiveRounds are all known
  and observed > 0. allyActiveRounds = 0 → infinite, reason
  "zero-window (floor-branch)". allyActiveRounds > 0 but
  allyDealt = 0 → infinite, reason "ally active but dealt 0".
  Either infinite class is never dropped and never counted as 1.0x.
- vKill fights are priced as computed, never overwritten to 1.0
  (shoutrec rule: the formula prices the observed window; a kill
  priced > 1 means the leader's damage and/or a longer window won
  it, not the ally alone).

Party counterfactual, PRIMARY (equal-rate party bound):
- Party DPR = N x observed ally DPR. Each mate is credited at the
  joined ally's observed in-fight rate — the ONLY in-fight
  observed mate rate. This is a stated assumption, NOT a per-mate
  measurement: it answers "what if N mates hit like the one who
  did join", and it is neither an upper nor a lower bound in
  general (the joined ally is trust-first, not damage-first).
- pKill = kKill / N. pSurv = kSurv / N. Both are sufficient, not
  necessary, prices exactly as shoutrec's are: they credit the
  party alone and ignore the leader's continuing damage, so the
  true flip multiplier could be lower.
- Party pricing preserves finiteness: N >= 1 for every joined
  fight (joined implies fed, fed is a subset of tileAll), so a
  fight finite on the single-ally price is finite on the party
  price, and vice versa. already-below-break kSurv = 0 stays 0.

Party counterfactual, SENSITIVITY (per-mate observed rates):
- For each tile mate, rate = their own observed DPR from the SAME
  seed's corpus, in this tier order (first tier with data wins):
  - Tier SELF: the joined ally in this fight — their observed
    rate in this fight (always available).
  - Tier A (own ally data): the mate was a joined ally in >= 1
    other U fight in this seed (shout-joined: allyDealt /
    (rounds - shoutRound) summed; allyFromStart: allyDealt /
    rounds summed) — rate = total allyDealt / total active rounds.
  - Tier B (own leader data): no ally data — the mate led >= 1
    other fought U fight in this seed — rate = total mDealt /
    total rounds as leader.
  - Tier C (fallback): no own data anywhere in the seed — the
    joined ally's observed rate in this fight.
- Sensitivity party DPR = sum of mate rates. sKill =
  (HPs / rtdS) / partyDPR_sens. sSurv = (needS / rtdS) /
  partyDPR_sens (needS <= 0 → 0, same flag).
- The tier mix (counts of mates per tier) is reported. Limitation
  stated up front: a mate's DPR against other monsters in other
  fights is observed, but monster-dependent — the sensitivity
  checks whether mates are systematically stronger / weaker than
  the joined ally, it does not measure this fight's true party
  DPR. If the sensitivity median crosses a bridgeability line the
  primary does not (or vice versa), the verdict is MIXED, not clean.

## Bars (judge against this header; a miss is NO-GO, never re-scored)

- DIAG-GO (primary, pricing coverage): among ADDRESSABLE fights,
  at least 80% are PRIMARILY PRICED with a finite multiplier for
  BOTH party flips (pKill and pSurv, primary), AND the median and
  the shares at 1x / <= 1.5x / <= 3x / <= 5x are reported for BOTH
  party flips over the same priced population, overall and
  wave-split 1 / 2 / 3 / 4. (With exact recorders the only
  finite-priced failures are allyDealt = 0 over a positive window
  or a missing tileAll, so the bar tests the instrument, not the
  game.)
- JOIN INTEGRITY (blocks GO): index-join errors 0 across
  fieldparty / tilejoin / shoutrec rows on shared calls, AND
  joined ally vid in tileAll for every joined fight (violations
  counted as join errors), AND no unexplained no-shout joined
  fights, AND shoutAllyDealt = 0 for every shout-joined fight.
- SENSE BAR: at least 3 joined / addressable-fight transcripts
  read end to end and judged for meaning / coherence (does the
  join read as a person answering a shout? does the "mate who
  stood by" shape — a second tile mate present but not joining
  under the one-ally rule — read as the party counterfactual's
  human shape?), never just counts. Sources: this band's sense
  slots (tilejoin sense.joined + shoutrec sense.joined per seed),
  preferring fights with N >= 2.
- DETERMINISM GATE: re-run one seed of this band into a scratch
  EVID dir; its row JSON must be byte-identical to the corpus row.
- RECOMPUTE (diagnostic, NOT a verdict leg): this band's own
  single-ally prices (kKill / kSurv medians, shares, wave splits)
  are recomputed and reported as the BEFORE leg. Published
  shoutrec / joinendlines band numbers are NOT quoted as current
  (substrate drift is real — backlog #1457); any difference
  between this band's before-leg and shoutrec's published table is
  reported as drift diagnostic only. The verdict judges this
  band's before-vs-counterfactual legs only — paired, same fights.
- BAND WALL NUMBERS (report-only, diverging prototype per the
  tilejoin metric review, never a verdict leg): wins / national /
  table / wave reach / median survival / deaths on this band.
- BRIDGEABILITY READING (the substance, pre-registered to avoid
  post-hoc spin; it does not move the DIAG-GO bar, which is about
  pricing coverage):
  - BRIDGEABLE if median pSurv <= 1.5x (party at observed rates
    typically needs at most 1.5x more per-mate strength).
  - PARTIAL if median pSurv <= 3x.
  - NOT BRIDGEABLE if median pSurv > 3x.
  - Wave-split readings use the same lines per wave (with n
    stated; wave splits with n < 3 are flags, not readings).
  - If the sensitivity median crosses a line the primary does not
    (e.g. primary PARTIAL, sensitivity NOT BRIDGEABLE), the
    reading is MIXED with the disagreement stated.
- If the primary bar is missed, the verdict is DIAG-NO-GO /
  INSUFFICIENT-DATA on the instrument (stated plainly, with the
  failing leg named). If the addressable set is too small to read
  (fewer than 8 addressable fights), the verdict is
  INSUFFICIENT-DATA honestly — never lower the bar. If the bar
  passes but the reading is NOT BRIDGEABLE, the verdict is
  DIAG-GO on the instrument with a NOT-BRIDGEABLE finding: the
  gap is measured and party formation does not close it.

## Band (my own before leg — re-derived, never quoted)

Substrate reused VERBATIM, never edited: scripts/policies/
tableseat-nowait.js + fieldparty-form-diag + w4dpr-diag +
breakline-diag + tilejoin-diag (TILEJOIN=1, prototype ON) +
shoutrec-diag (SHOUTREC=1), with env LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1, BREAKLINE=1,
TILEJOIN=1, SHOUTREC=1. Seeds 75101–75108 (the shoutrec /
joinendlines band), 180d death-aware horizon (dead villages stop
simulating, +10d tail max per the harness — death-aware, never a
fixed 200d; the horizon matches the band being re-derived so the
before leg is comparable in shape, while the verdict rests on
paired before-vs-counterfactual legs within this band, not on
cross-band equality).
Corpus: evidence/2026-10-29/perseed-partycounter-a/on/
(s75101–s75108-fresh.json + summary.json), via a new sweep
scripts/test-partycounter-a-sweep.js modeled on
test-shoutrec-a-sweep.js with only the output dir changed.
No new recorder is added (tileAll + shout snapshot already exist
in the reused recorders), so no recorder OFF/ON neutrality leg is
owed; the reused recorders' neutrality was proven by their own
arms. The determinism gate above covers reproducibility.

## What this arm does NOT do

No src/js change, no game-code lever, no default flip, no
one-ally or entry-strength change proposed or built, no list-fed
prototype (no new join mechanism is simulated — the counterfactual
is analytic pricing from recorded state, never a simulated party
fight, because the engine takes exactly one ally per shout and
multi-ally joining would need a game-code change this arm forbids).
No re-judgment of the tilejoin, shoutrec, or joinendlines verdicts
(all stand). No push, no bump, no live verification. Never touch
docs/ONTOLOGY.md. Never touch any other worktree, registry entry,
loop-B tree, or build lane. Never touch the main tree. Never run
concurrent jest; cache dir /tmp/jest-cache-sim-partycounter-a
(no jest expected — node scripts only; the rule is recorded, not
waived).

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
