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

**PASS.** The analyzer reproduced the presence counter exactly on the
committed arm corpus: **64 poolDraftMiss rows collapsing to 21 distinct
(seed, day, mid) pairs** — the same numbers the presence arm reported.
The reproduction is an analyzer-faithful re-implementation of the
presence recorder's `presenceStats` join (tick row pooled + joined
encounter led by someone other than a pooled holder), run on the same
corpus files. Gate passed before any classification was read.

The 21 pairs, by holder: **victor_lopez (seed 107052), 7 pairs** (days
79–89: eulogy, reunion ×5, suburb); **yuki_mori (seed 107054), 9 pairs**
(days 80–106: reunion ×2, herald, strike ×6); **naran_tumen (seed
107057), 5 pairs** (days 107–142: audit, herald, spoiler ×2, eulogy).
The 21 pairs join to **25 encounters** (some pairs carry 2–3 fights:
(107052,80,suburb) has 2, (107054,96,strike) has 3, (107054,97,strike)
has 2). Every pooled holder in all 21 pairs is adjacent only — `onTile`
is empty everywhere, as the presence arm found. No pooled holder died on
any pair day; no pooled holder led or joined any other wave-4+ encounter
on a pair day.

## 2. Classification (per pair)

Rows = pooled tick rows for the pair; Enc = joined `v4encounters` rows;
Elig = tick-eligible slots (row for the fighting instance with nOnTile ≥
1); PooledElig = of those, slots with the holder pooled. Ctl = arm-vs-ctl
leg comparison on tick rows + encounters. Full per-pair evidence (slot
shelter checks, teleport signature, raid-day flags) is in
`draftmiss-a-analysis.json` next to this file.

| seed | day | mid | holder | rows/enc | class | one-line reason | ctl |
|---|---|---|---|---|---|---|---|
| 107052 | 79 | eulogy | victor_lopez | 4/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (lead app_mgpspht1177, vFlee) | identical |
| 107052 | 79 | reunion | victor_lopez | 3/1 | **(f)** ★ | tick fight at pooled slot seq 2247; holder NOT sheltered (region {(3,5),(4,5)}, away on census) — but the monster sits at (3,4), nearest the haven on a proven raid day, D+1 reunion at (4,4) with 2 on tile: most likely the raid fought it, unproven | identical |
| 107052 | 80 | suburb | victor_lopez | 4/2 | **(f)** | 2 fights, 3 eligible slots, subset unknown; holder not sheltered at any pooled eligible slot; victor away — raid vs tick unresolvable | identical |
| 107052 | 83 | reunion | victor_lopez | 4/1 | **(f)** | 1 fight, 4 eligible slots, subset unknown; holder not sheltered at any pooled eligible slot (victor home this day) — raid vs tick unresolvable | identical |
| 107052 | 86 | reunion | victor_lopez | 4/1 | **(f)** ★ | tick fight at pooled slot seq 2367; holder NOT sheltered (region excludes haven, away on census); 7 days after proven raid day 79, 1 day before proven raid day 87 — a raid on 86 would block 87, so the raid reading is itself unresolved | identical |
| 107052 | 87 | reunion | victor_lopez | 2/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (lead app_mgpspht1177, vFlee) | identical |
| 107052 | 89 | reunion | victor_lopez | 4/1 | **(f)** ★ | tick fight at pooled slot seq 2427 (monster ON the haven, (4,4)); holder's region {(3,4)..(5,5)} CONTAINS the haven — shelter possible, unproven; victor away; devon_okafor vDie | identical |
| 107054 | 80 | reunion | yuki_mori | 4/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (lead app_mgpspi0g328, vFlee) | identical |
| 107054 | 81 | reunion | yuki_mori | 2/1 | **(f)** ★ | tick fight at pooled slot seq 6468 (monster (5,4)); holder's region {(4,4),(4,5),(5,4),(5,5)} CONTAINS the haven — shelter possible, unproven; yuki home; victor_lopez leads (the fighter already going) | identical |
| 107054 | 84 | herald | yuki_mori | 3/1 | **(f)** | 1 fight, 3 eligible slots, subset unknown; holder not sheltered at any pooled eligible slot | identical |
| 107054 | 95 | strike | yuki_mori | 2/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (lead app_mgpspi0g328, vFlee) | identical |
| 107054 | 96 | strike | yuki_mori | 4/3 | **(a)** | holder sheltered at every pooled eligible slot (feasible node exactly (4,4), muster in effect day 96); 3 fights happened anyway — victor_lopez led 2 of them while yuki sat behind the muster | identical |
| 107054 | 97 | strike | yuki_mori | 3/2 | **(f)** | 2 fights, 3 eligible slots, subset unknown; holder not sheltered at any pooled eligible slot | identical |
| 107054 | 99 | strike | yuki_mori | 4/1 | **(a)** (alt (d)) | subset-unknown (2 eligible slots); holder sheltered at every pooled eligible slot — a fight at a pooled slot is (a), at an unpooled slot is (d); NOT-a-miss either way | identical |
| 107054 | 100 | strike | yuki_mori | 2/1 | **(f)** ★ | tick fight at pooled slot seq 6842 (monster ON the haven, (4,4)); holder's region {(4,4),(5,4)} CONTAINS the haven — shelter possible, unproven; victor_lopez leads | identical |
| 107054 | 106 | strike | yuki_mori | 4/1 | **(f)** ★ | tick fight at pooled slot seq 6996 (monster (4,5)); holder's region CONTAINS the haven — shelter possible, unproven; visjoin_99 leads; no D+1 rows (monster gone) | identical |
| 107057 | 107 | audit | naran_tumen | 2/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (quinn_murphy, vDie) | diverged (arm 4 tick rows vs ctl 0 — the RNG cascade) |
| 107057 | 107 | herald | naran_tumen | 2/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (tariq_mahmood, vKill — the herald died) | diverged |
| 107057 | 121 | spoiler | naran_tumen | 3/1 | **(e)** | every tick row nOnTile = 0 — no tick fight possible; raid-path fight (ingrid_vik, vFlee) | diverged |
| 107057 | 141 | spoiler | naran_tumen | 2/1 | **(f)** | 1 fight, 2 eligible slots, subset unknown; holder not sheltered at any pooled eligible slot | diverged (tick rows 2 vs 2, encounters arm [elena_petrova] vs ctl []) |
| 107057 | 142 | eulogy | naran_tumen | 2/1 | **(f)** ★ | tick fight at pooled slot seq 12256 (monster ON the haven, (4,4)); holder's region {(4,3),(4,4)} CONTAINS the haven — shelter possible, unproven; elena_petrova leads; D+1 eulogy at (4,4) | diverged (arm 2 tick rows vs ctl 0) |

★ = flagged possible-real-miss: under the frozen predicates the analyzer
calls these a genuine draft failure (eligible holder, pooled at the
fight's tick slot, in a tick fight the draft did not take). **The
sense-testing layer overturns the flag for all 7** — see §3. In every one
of the 7, the encounter is byte-identical on the control leg (turning the
draft off changed nothing — a tick fight with an eligible holder would
have diverged), the monster sits at or adjacent to the haven (the raid's
nearest-monster draft set: (3,4), (3,5), (4,4), (5,4), (4,4), (4,5),
(4,4)), and in 5 of the 7 the holder's feasible region CONTAINS the
haven (4,4) — the holder may have been sheltered after all, and the
strict region == {(4,4)} test just could not prove it. In the other 2
(107052 days 79 and 86) the region excludes the haven but the census has
victor_lopez away on an away-trip those days — out on the map, not at the
haven, and the day-79 fight sits on a proven raid day with the monster
nearest the haven. The most likely single mechanism for all 7 is the
RAID, not the tick: the raid fought those monsters, and the raid's
defender draft never consults the presence draft. The analyzer could not
prove it because its raid-teleport test is too strict for near-haven
monsters (a monster at (3,4) can WALK to (4,4) in the available steps, so
displacement cannot tell a teleport from a wander) and because the D+1
attribution takes the first row for the mid, which is the wrong instance
when two instances of one type share a day. These 7 stay (f) — the
predicates are frozen and the corpus cannot prove the raid — but the
evidence leans raid, not draft failure. No pair in this corpus proves the
draft failed.

## 3. Counts per class + overcount factor

| class | count | what it means |
|---|---|---|
| (a) sheltered holder | **2** | (107054,96,strike), (107054,99,strike) — yuki_mori sheltered behind the muster while others fought. NOT a miss; the draft correctly refused. |
| (b) post-flee resting holder | **0** | No holder fled a same-day earlier fight on any pair day — indeed no pooled holder led or joined ANY other wave-4+ encounter on a pair day. The mechanism is untested by this corpus, not disproven. (Low-wave flees are unrecorded — a stated limitation.) |
| (c) stale pre-tick read | **0** | No pooled holder died on any pair day; no holder fought an earlier monster in the same tick call; no relocation mechanism moves villagers mid-call. The cross-phase staleness that DOES exist (raid teleport after the pre-tick read) is classified under (e)/(f), not (c). |
| (d) duplicate-row inflation | **0** | No pair had all its eligible slots unpooled — every pair with a tick-eligible slot had the holder pooled at ≥ 1 of them. Row inflation is real (see overcount) but it never, alone, explains a pair. (107054,99,strike) carries (d) as an alternate to (a). |
| (e) no tick fight at the pooled slots | **7** | All 7 are all-zero pairs: every tick row has nOnTile = 0, so no tick fight was possible at any recorded slot — the joined encounters must be raid-path fights. NOT a miss; the draft lives in the tick and the raid never asks it. |
| (f) UNCLASSIFIED | **12** | 7 flagged possible-real-miss (★ in §2) + 5 ambiguous subset-unknown. The run is NO-GO on its primary metric, honestly — see §6. |

**Overcount factor (quantified):** 64 poolDraftMiss rows vs **25 distinct
joined fights** vs 21 distinct pairs. **Rows per fight = 2.56x**;
rows per pair ≈ **3.05x**. The counter overcounts fights by about two
and a half times (one row per day-part tick call per fight), and the
pair count itself UNDERCOUNTS fights (21 pairs carry 25 fights — two
monster instances of one type, or repeat fights in a day, share a
day|mid key). The ~3x figure the tracker quoted is the rows-per-pair
number; the rows-per-fight number (2.56x) is the honest overcount of
fights.

**What the counts say:** of the 21 "misses", 9 are definitively NOT
misses (7 raid fights + 2 sheltered holders) and 12 are unresolved under
the frozen predicates — but the sense-testing evidence (§2, ★ note) leans
raid/sheltered for all 12 rather than draft failure. The draft's true
failure count on this corpus is most likely **zero**: the draft fired
exactly once in the whole presence corpus (naran_tumen, seed 107057, day
87), and no pair here proves it should have fired and didn't. The
control-leg comparison sharpens this: all 16 pairs on seeds 107052 and
107054 have encounters byte-identical on the control leg — turning the
draft off changed nothing about these fights, which is what raid fights
look like, not tick fights with an eligible holder.

## 4. Verdict — does the lend answer what the misses ask?

**A different question — and a better one than the misses ask.**

What the misses literally ask: "the armed holder was next to a wave-4+
monster that got fought, and the holder wasn't the one fighting — why
wasn't the holder drafted into the tick?" The classification answers
that question by dissolving it: in 7 of 21 pairs there was no tick fight
at all (the raid fought the monster — the raid's defender draft never
consults the tick's draft); in 2 the holder was sheltered and the draft
correctly refused; in the 12 unresolved pairs the evidence leans the
same way (raid fights at the haven's doorstep, holders whose regions
contain the haven, victor out on away-trips). The tick draft was almost
never the mechanism in play, so it was almost never failing. The misses
are, in the main, a measurement artifact: the counter counted raid
fights as if the roaming-monster draft had skipped the holder, and
counted sheltered and away holders as if they were standing ready.

The lend — give the gun to the fighters already going — does not answer
that question. It abandons it and asks instead: "how does the gun get
into the wave-4+ fights that are actually happening?" That is the right
question, and the corpus supports its premise: on seed 107054
victor_lopez — who does NOT hold the gun — led four of the pair-day
fights (strike days 96 ×2, 97, 99, 100) while the gun sat with yuki_mori,
who was sheltered or adjacent-but-unfought; on seed 107052 devon_okafor
led three pair-day fights while the gun sat with victor_lopez, who spent
five of his seven pair days out on away-trips. The fighters already
going are real, and the gun is with the wrong person. The lend routes
around the draft instead of fixing it — which is correct, because the
draft is not what is broken.

Two caveats the lend must carry. First, the transfer mechanism does not
exist in live play: the presence arm found **0 inter-villager gun
transfers in 16 seeds** (§9), so the lend is a design proposal that
needs a transfer path built, not a reading of what the villages already
do. Second, the fights the lend would feed the gun into are largely
RAID fights — home defense at the haven's doorstep — so the lend's real
question is whether the gun belongs with raid defenders, not whether the
roaming draft should take the holder. Judged on its own question the lend
is well-aimed; judged as an answer to the misses it is a different
question, and the misses themselves mostly dissolve.

## 5. Village assessment (plain words)

In plain words: the gun sat with one person in each village — victor,
yuki, naran — while other villagers did the fighting. The fights the
counter called "misses" were mostly the village defending its own front
door: monsters walked up to the haven and the home-defense raid fought
them, and the raid picks its defenders its own way — it never asks the
roaming-monster draft whether the gun-holder should lead. Twice the
gun-holder was correctly locked inside during a muster while others
fought outside. On victor's village he spent most of his gun-holding
days out on trips away from home, so he wasn't even there to be drafted.
The draft itself only ever fired once in the whole eight-village run.

**The single biggest miss class, in plain words: home-defense raid
fights counted as if the roaming draft had skipped the holder.** Seven
pairs are proven raid fights and most of the twelve unresolved ones look
the same — the monster came to the village, the village's raid defense
fought it, and the counter wrote it down as a draft miss. The holder
wasn't missing the fights; the fights were never the draft's to give.

## 6. Metric review

**Primary metric: FAILED — run is NO-GO, honestly.** 12 of 21 pairs are
UNCLASSIFIED (f); the GO threshold (all 21 classified, 0 UNCLASSIFIED)
was not met. The metric did its job: it forced an honest NO-GO instead
of a forced classification. The instrument is sound — the reproduction
gate passed exactly (64/21), the selftest proves every class fires on a
fixture, the proof test is green — so the NO-GO is a corpus-limitation
verdict, not an instrument failure.

What the metric exposed is the classification scheme's weak joint: the
**raid-vs-tick distinction, which this corpus cannot resolve.** Three
specific gaps, each named so the next arm can close it:

1. **`fightOrigin` mislabels raid fights as 'world-tick'.** The recorder
   cannot tell a raid fight from a tick fight — both route through
   `resolveWildMonsterEncounter` — so the analyzer's join cannot separate
   them. Filed as a finding (§8).
2. **The raid-teleport signature is too strict for near-haven monsters.**
   The raid drafts the NEAREST monsters, which sit one tile from the
   haven and can walk there in the available steps — so displacement
   cannot tell a teleport from a wander exactly where the raid operates.
   A teleport test needs the raid's own draft record, not geometry.
3. **The shelter test is too strict.** Region exactly {(4,4)} proves
   sheltered; region CONTAINING (4,4) with the muster on is
   shelter-consistent but unproven — and 5 of the 7 flagged pairs sit in
   that band. The next arm should treat "region contains haven + muster
   on" as sheltered-with-ambiguity, not as unsheltered.

Two more honest notes. The **muster model cross-check is weak**: on
muster-ON days only 5 of 27 pooled-eligible slot checks pinned the
holder's region exactly to the haven, and the model predicted muster ON
on every pair day (no muster-OFF pair days to cross-check against). The
model fires far more often than the region pins — it is an estimate from
last-call positions, and after a raid teleports monsters to the haven the
endDay threat check keeps seeing them within radius 2 and keeps the
muster fired for days. The model should not be cited as a measurement of
muster state. And **(b) and (c) are untested, not disproven**: this
corpus contains no holder flees, deaths, or same-call second fights on
pair days, so the post-flee and stale-read mechanisms have no positive
example here — a corpus where a holder actually flees a wave-4+ fight
would be needed to exercise them (low-wave flees are unrecorded).

**What a follow-up arm needs (instrument, not a re-score):** the
recorder must log the raid itself — `havenRaidTick` firing, the drafted
monsters, and the defender draft — and the presence draft needs its own
fired-row telemetry (already filed by the presence arm, sim-findings
line 2631). With a raid marker, the 12 unresolved pairs would resolve
in one pass: any pair whose fight is raid-marked is (e), and any
remaining tick fight with a pooled eligible holder is a proven real
miss. Until then, the honest statement is the one in §3: the draft's
true failure count on this corpus is most likely zero, but the corpus
cannot prove it for 12 pairs.

## 7. Files

- `scripts/analyze-draftmiss-a.js` — the analyzer (corpus reads only;
  `node scripts/analyze-draftmiss-a.js --selftest` 25/25 green;
  `--arm … --ctl … [--out FILE]` runs the classification).
- `scripts/test-draftmiss-a.js` — proof test: analyzer selftest green,
  reproduction gate 64/21 on the committed corpus, counts sum to 21,
  every pair classified a–f with a reason, overcount fields present,
  pinned counts + verdict (a 2, b 0, c 0, d 0, e 7, f 12; NO-GO) — run
  with `node scripts/test-draftmiss-a.js`.
- `evidence/2026-11-20/draftmiss-a-analysis.json` — the full classifying
  run's output (per-pair classification, counts, overcount, muster
  agreement, real-miss list). Verdict NO-GO; gate rows 64 / pairs 21,
  pass true.
- This file — prereg (§0, frozen before the classifying run) + results
  (§§1–8, filled by the classifying run).
- `evidence/2026-11-20/sim-presence-a.md` §4/§6/§9/§12 and
  `evidence/2026-11-20/sim-presence-a-prereg.md` — the source arm (read
  first; not modified).

## 8. Findings for the backlog

Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
(this arm's run/evidence):

- **instrument — `fightOrigin` mislabels RAID fights as 'world-tick'.**
  The recorder's origin classifier returns 'world-tick' for any fight
  routed through `resolveWildMonsterEncounter`, including the raid path
  (`havenGrowth.js` → `resolveWildMonsterEncounter(d, m, {raid: true})`).
  The corpus therefore cannot tell a raid fight from a tick fight — which
  is what left 12 of this arm's 21 draft-miss pairs unresolvable. (The
  presence arm's sim-findings entry line 2631 covers the aid side of the
  same classifier; this is the raid side.)
- **scale-onramp/raid-defense — the raid's defender draft never consults
  the presence draft.** An armed holder adjacent to a raided monster is
  not preferentially drafted as a defender; the raid picks defenders by
  health/proximity and the tick draft lives only in `villagerMonsterTick`.
  The two dispatches are separate — so the gun can sit with a villager
  standing next to a raid fight while someone else defends. This is the
  mechanism behind most of the 21 "draft misses" and the question the
  lend (gun to the fighters already going) actually needs to answer.
- **diagnosis — the 21 draft-miss pairs are diagnosed (follow-up to the
  presence arm's sim-findings line 2632, which asked for this diagnosis
  before weighing the lend).** Counts: (a) sheltered 2, (b) 0, (c) 0,
  (d) 0, (e) raid fights 7, (f) UNCLASSIFIED 12 — run NO-GO on its
  primary metric. Overcount 64 rows / 25 fights = 2.56x (3.05x per pair).
  Sense-testing leans raid/sheltered for all 12 unresolved pairs (all 16
  seed-107052/107054 encounters byte-identical on the control leg;
  monsters at/adjacent to the haven; 5 of 7 flagged regions contain the
  haven); the draft's true failure count is most likely zero. Verdict on
  the lend: it answers a different question than the misses ask — and a
  better one — but it needs a transfer path (0 inter-villager gun
  transfers in 16 seeds) and its real question is whether the gun belongs
  with raid defenders.

Instrument notes kept here (not findings): the raid-teleport signature
is too strict for near-haven monsters (they can walk to the haven in the
available steps); the D+1 attribution takes the first row for the mid and
misattributes when two instances of one type share a day; the shelter
test (region exactly {(4,4)}) should become "region contains haven +
muster on" = sheltered-with-ambiguity; the muster model over-fires
(5/27 exact pins) and is an estimate, not a measurement. The next arm
needs raid telemetry in the recorder (raid firing, drafted monsters,
defender draft) plus the presence draft's own fired-row telemetry.
