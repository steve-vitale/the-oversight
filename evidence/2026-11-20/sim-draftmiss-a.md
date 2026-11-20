# sim-draftmiss-a — DIAGNOSTIC (pure read, no game code, no new sims)

**Arm:** sim-draftmiss-a · **Loop A run:** fleshout-20261120T1705Z
**Axis:** scale-onramp · **Finding:** #2599 (presence/contact pool; finding #2625)
**Type:** DIAGNOSTIC — classifies the presence arm's 21 draft-miss pairs from
the already-committed corpus. No game code touched, no sims run.
**Corpus:** `evidence/2026-11-20/perseed-presence-a-arm/` (arm leg;
GUNRATE=1 + CELLGATE=1 + PRESENCE=1) and `evidence/2026-11-20/perseed-presence-a-ctl/`
(control leg; PRESENCE off) — band 107051–107058, 150d, competent verbatim
policy. Both legs committed on master before this arm started.
**Source:** `evidence/2026-11-20/sim-presence-a.md` §4/§6/§9/§12 and
`evidence/2026-11-20/sim-presence-a-prereg.md` (read first).

## 0. Prereg (frozen BEFORE the classifying run)

**The question (from the tracker):** the presence arm's pool counters claim
21 distinct draft-miss day|mid pairs on the arm leg, but the counters
overcount ~3x (one tick row per day-part call per fight), count holders the
draft must refuse (sheltered / post-flee-resting, unfiltered in the
recorder's adjacent list), and read pre-tick state that goes stale when an
earlier monster in the same call moves or kills the holder. This arm
classifies each of the 21 pairs. The tracker's follow-up question: does
the lend (the gun to the fighters already going — prereg shape (b)) answer
what the misses ask, or a different question?

**Primary metric (BINDING): classification completeness.**
**GO iff all 21 distinct draft-miss day|mid pairs are classified into (a)–(e)
below, with 0 UNCLASSIFIED (f).** A pair is UNCLASSIFIED only when NO
mechanism below is established for it. A pair with two established
NOT-a-miss mechanisms (both artifact, neither a real miss) is classified
under the better-supported one with the alternate recorded — it is not
UNCLASSIFIED, because its NOT-a-miss status is certain. A pair where the
evidence cannot separate a NOT-a-miss mechanism from a REAL miss is
UNCLASSIFIED, and the run is NO-GO on its primary metric, honestly.

**Horizon:** N/A (existing corpus, no new sims). **Seeds:** 107051–107058.
**Policies:** competent verbatim (as run by the presence arm).

**Reproduction gate (before any classification):** the analyzer reproduces
the presence counter exactly on the committed arm corpus — 64
poolDraftMiss rows collapsing to 21 distinct (seed, day, mid) pairs. If
the reproduction differs, STOP and diagnose; do not classify.

**Classification predicates (frozen; mechanism rules, not pair outcomes):**

The draft (`villagerMonsterTick`, PRESENCE=1, wave ≥ 4) fires only inside a
world-tick fight that was already going to happen, and only when a living
armed searcaster holder (equipped searcaster, ≥ 1 fusion cell, village
health > 20, not sheltered, not post-flee resting, never the scholar) is on
the monster's tile or an adjacent tile AT THE MONSTER'S TURN in the tick
(a live read, not the recorder's pre-tick read). The recorder's
`v4tickPresence` rows are pre-tick reads: one row per living wave-4+
monster per `villagerMonsterTick` call, with an `adjacent` list that does
NOT filter sheltered / post-flee-resting holders (the on-tile list does,
via the engine's candidate set). The analyzer's `encByKey` join matches
tick rows to `v4encounters` rows on (day, mid, origin 'world-tick').

- **(a) SHELTERED HOLDER — NOT a miss.** A tick fight happened at a pooled
  slot (a tick-call row for the fighting instance with nOnTile ≥ 1 and the
  holder pooled), and the holder was sheltered at that call: the holder's
  feasible node region for that call — computed from ALL of the call's
  tick rows (pooled ⟺ within Chebyshev 1 of that monster; the holder is
  armed per the day's census, so pooled ⟺ adjacent) — is exactly the haven
  tile (4,4), AND the muster was in effect that day (estimated below). The
  draft correctly refused a villager behind the barricaded hall door.
- **(b) POST-FLEE RESTING HOLDER — NOT a miss.** A tick fight happened at a
  pooled slot, and the holder fled a same-day earlier fight ending at or
  below 25% of max HP (evidenced by a corpus `v4encounters` row with the
  holder as lead, outcome vFlee, fleeHpFrac ≤ 0.25) — the draft correctly
  refused a resting holder. (The flag is set only by the wild router and
  the expedition branch, never by raid/aid/arena fights; it expires the
  next day.)
- **(c) STALE PRE-TICK READ — NOT a miss.** A tick fight happened at a
  pooled slot, and the holder died or fought an earlier monster in the
  SAME tick call (evidenced by a corpus death row for the holder that day
  plus an earlier same-call encounter, or by an earlier same-call
  encounter with the holder as lead/ally) so the pre-tick pooled read was
  stale at fight time. (Within a call, villager nodes do not change —
  flee does not relocate, allies do not relocate — so the live staleness
  mechanisms are death and the post-flee flag; see §Method.)
- **(d) DUPLICATE-ROW INFLATION — NOT a miss.** Tick fight(s) happened for
  the pair's instance, but at NO pooled slot: every tick-eligible slot
  (a row for the fighting instance with nOnTile ≥ 1) has the holder NOT
  pooled, while pooled rows exist at other slots of the same instance —
  so the counter records n "misses" for fight(s) that never had a pooled
  holder at fight time. The pair is the day|mid join re-counting one
  fight across the day's calls.
- **(e) NO TICK FIGHT AT THE POOLED SLOTS — NOT a miss.** No tick fight
  happened for the pair's instance that day: either every tick row for
  the instance has nOnTile = 0 (a tick fight was impossible at every
  call — the tick's candidate set can only shrink mid-call, never grow —
  so the joined encounter(s) must be raid-path fights, the only other
  origin-'world-tick' path), or the pair's day is a proven raid day and
  the instance shows the raid-teleport signature (below). The draft lives
  in the tick; the raid draft picks defenders, never consults the tick's
  draft. The task's "(0.5 coin flip failed)" gloss covers the tick
  producing no fight at the pooled slots; the raid refinement is the
  mechanism for the all-zero pairs, documented as a finding.
- **(f) UNCLASSIFIED.** None of (a)–(e) is established, or the evidence
  cannot separate a NOT-a-miss mechanism from a REAL miss (an eligible
  holder, pooled at the fight's tick slot, in a tick fight the draft did
  not take — a genuine draft failure, reported loudly as a finding, never
  hidden inside another class).

**Overcount factor (quantified, not assumed):** poolDraftMiss rows (64)
vs distinct joined fights (the count of `v4encounters` rows joined to the
21 pairs) vs distinct pairs (21). Reported as rows-per-fight and
rows-per-pair. The (d) mechanism is the row→fight inflation; the pair
count itself UNDERCOUNTS fights when one (day, mid) key carries 2–3
fights (two monster instances of one type, or repeat fights in a day).

**Muster-state estimate (for (a)):** the game-side muster
(`shelterMusterCheck`, shelter.js) runs once a day inside endDay
(progDaily): it fires when a wave-4+ monster is within Chebyshev 2 of the
haven (4,4) and stands down only when no wave-4+ threat is within
Chebyshev 3. The sim bot never stands a muster down (stand-down is a
Haven-panel player action, app.js only) and the only release path is the
endDay all-clear — so the muster state during day D is set at endDay D−1
and does not change mid-day. The analyzer simulates it from the corpus:
per day, threat radii from the LAST tick call's wave-4+ monster positions
(Chebyshev distance from (4,4)); fire at ≤ 2, stand down only when nothing
is ≤ 3. The model is cross-checked against the holders' feasible regions:
on mustered days the region should be {(4,4)}; the agreement rate is
reported. (a) requires BOTH region = {(4,4)} AND muster predicted ON. A
region of {(4,4)} with the muster predicted OFF means a villager standing
unsheltered at the haven — the draft should fire — so that is NOT (a).

**Raid-day inference (for (e)):** `havenRaidTick` runs inside endDay (after
the muster check); it requires ≥ 3 living world monsters, pantry ≥ 3000
kcal, a 7-day cooldown (`day − lastRaidDay ≥ 7`), and an 18% roll; it
drafts the 3–5 NEAREST monsters to the haven (Manhattan) and TELEPORTS
them onto the haven tile (`m.tx = hx; m.ty = hy`) before the defender
draft. A day is a PROVEN raid day when it carries an all-zero pair (a
tick-impossible fight). Other pairs within 7 days after a proven raid day
cannot be raid fights (cooldown) — they are tick fights if tick-eligible.
The raid-teleport signature is an instance sitting at (4,4) on D+1 (the
teleport cannot be a wander step: wander moves orthogonally, (3,5)→(4,4)
is diagonal). The origin classifier mislabels raid fights: `fightOrigin`
returns 'world-tick' for ANY fight routed through
`resolveWildMonsterEncounter`, including the raid path
(`havenGrowth.js` → `resolveWildMonsterEncounter(d, m, {raid: true})`) —
filed as a finding, not assumed away.

**Tick-call reconstruction:** the day's tick rows, in seq order, segment
into calls — a new call begins when a (tx, ty) repeats (one monster per
tile per call; rows of one call are consecutive in seq). Sanity: 2–4
calls per day. **Instance tracking:** rows across calls link into
instances by same mid + position continuity (Chebyshev ≤ 1 wander step,
or the (4,4) teleport).

**Instrument:** `scripts/analyze-draftmiss-a.js` (corpus analysis +
`--selftest`) and `scripts/test-draftmiss-a.js` (proof test; fixtures
cover every class). No game code, no new sims, no harness load — pure
corpus reads. The analyzer exits nonzero if the reproduction gate fails.

**Canon note:** `docs/CANON.md` (manifest) was consulted. **No canon doc
covers the searcaster, the contest-prize area, or holder presence at
fights** — said here rather than inventing canon (same as the
presence/cellgate arms). The draft, muster, raid, and tick rules are cited
from code, not canon.

## 1. Reproduction gate

<!-- filled by the classifying run -->

## 2. Classification (per pair)

<!-- filled by the classifying run -->

## 3. Counts per class + overcount factor

<!-- filled by the classifying run -->

## 4. Verdict — does the lend answer what the misses ask?

<!-- filled by the classifying run -->

## 5. Village assessment (plain words)

<!-- filled by the classifying run -->

## 6. Metric review

<!-- filled by the classifying run -->

## 7. Files

<!-- filled by the classifying run -->

## 8. Findings for the backlog

<!-- filled by the classifying run -->
