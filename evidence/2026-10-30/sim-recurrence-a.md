# sim-recurrence-a — WAVE-4 CHAIN RECURRENCE DECOMPOSITION, WILD ONLY

Run: flesh-out loop, run fleshout-20261030T0641Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-recurrence-a.
Ranked next #1 by run fleshout-20261030T0533Z (sim-chainclose-a).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no gate change, no deed-bar move, no damage buff. This arm
DECOMPOSES chainclose's recurrence finding; it builds nothing.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-30/sim-recurrence-a-prereg.md (commit ae1a4b5af,
plus pre-sweep correction 5669fe527: the new sweep is a verbatim copy
of the chainclose sweep with three disclosed deltas, because the
chainclose sweep exports nothing to delegate to).
Instruments: commit 483dfa0b1 (census sweep copy + recurrence analyzer
+ fixtures; the sweep-copy diff shows only the disclosed deltas).
VERDICT: DIAG-GO — all six legs pass (see "Header vs result"). The
measurement is complete; the game verdict is a decomposition, not a
fix.

## Plain words first

Chainclose found that only 2 of 10 wild wave-4 chains ever meet twice.
This run asks why the other 8 never re-meet — and, with a new daily
census of every living world monster, it can now answer with the
beast's own movements instead of guessing. The answer splits three
ways, and no single cause dominates. Four of the ten chains end with
the beast VANISHING from the world while the village lives on: the
beast is in the census one day and gone the next, with no villager
fight killing it, no finale wipe (neither host village entered the
table), and no other instance of the type to confuse it with. The
code leaves one family of explanations standing: the scholar met it
in turn-based combat, which removes an ordinary wild monster from
the world whether the scholar wins, flees, or loses (only titans and
lingering raiders are put back). Four chains end NEVER-CROSSED: the
beast is alive in the census on the village's last day, the village
went out into the field, and they simply never stood on the same
tile at a moment the world rolled a meeting — in the two starkest
cases the village went out only 2–3 days in a 45–61 day window while
the beast drifted 4–5 tiles away. Two chains end VILLAGE-GONE: the
village died within a week of first contact, beast still alive. Zero
chains finish (0 kills in 16 wild meetings, as in chainclose), zero
chains are still present at the horizon (no contact seed survived
with a live chain — the survived contact seed's two chains both
vanished), and zero chains are unclassified. The binding constraint
is therefore two-headed: beasts the village never re-crosses, and
beasts the scholar's own encounters silently delete. Either head
alone explains at most 4 of 10 chains; a lever that moves only one
leaves the other standing.

## Header (pre-registered) vs result

- COMPLETENESS: 16/16 valid seeds AND all six recorders errs 0 with
  overflow empty AND joins 100% AND mDealt agreement breakline==w4dpr
  at every row AND shoutrec prefix-consistency at every row AND
  census files present/parseable for 16/16 seeds, snapshots sorted
  by day, final snapshot day within 1 of the seed's days.
  RESULT: 16/16 rows valid; all six recorders errs 0, overflow empty;
  joins 2257/2257, 0 errors; breakline-vs-w4dpr mDealt agreement
  2257/2257 (0 wild wave-4 mismatches); shoutrec prefix-consistency
  751/751 checked, 0 violations; census 16/16 present, sorted, final
  day within 1 (s75102: 85 vs 86 days; s75104: 101 vs 102; all others
  exact) → PASS.
- SUBSTRATE-EQUIVALENCE: all 16 s<seed>-fresh.json rows
  byte-identical to chainclose's corpus rows.
  RESULT: 16/16 byte-identical (per-seed all true) → PASS. The census
  wrapper did not perturb the game, and this corpus IS the chainclose
  substrate. Wall numbers reproduce exactly (see below).
- CLASSIFICATION (primary metric): EVERY wild wave-4 chain assigned
  exactly one fate, 0 UNCLASSIFIED, all opportunity measures computed.
  RESULT: 10/10 chains classified, 0 UNCLASSIFIED; every opportunity
  measure computed (beastTileDrift null only for the two chains gone
  by the first post snapshot, with the reason stated) → PASS.
- DETERMINISM GATE: one seed re-run into a scratch EVID dir; row JSON
  byte-identical AND census JSON byte-identical; scratch removed.
  RESULT: seed 75102 re-ran byte-identical in full (row + census);
  scratch dir removed after the diff → PASS.
- SENSE BAR: EVERY first-meeting transcript of every non-recurring
  chain read end to end, PLUS first-meeting transcripts of recurring
  chains and one later log per recurring chain.
  RESULT: 12/12 logs read (10 firsts + 2 later meetings; all outcome
  classes present: vFlee and vDie; no meeting's story forecloses a
  return) → PASS.
- FIXTURE BAR: fate decision tree in priority order, cross-seed chain
  separation THROUGH the required chainclose buildChains, census
  matching incl. collisions, window/opportunity arithmetic, and the
  byte-identity comparator.
  RESULT: FIXTURES-PASS (45 checks, 0 fails) → PASS.
- INSUFFICIENT-DATA: FINISHED 0, STILL-PRESENT-AT-HORIZON 0,
  VILLAGE-NEVER-OUT 0 — counts only, no lever judgment from empty
  classes. Raid (n=4) and other (n=1) are INSUFFICIENT-DATA, counts
  only, as in chainclose.
- VERDICT: DIAG-GO. Nothing failed. The census instrument worked as
  preregistered: 0 (mid, hp) collisions in any post window, and the
  all-HP cross-check below confirmed every VANISHED verdict (no
  vanished instance reappeared at a different HP).

## Q1 — the decomposition (all 10 wild wave-4 chains)

Fate counts: BEAST-VANISHED 4, NEVER-CROSSED 4, VILLAGE-GONE 2,
FINISHED 0, STILL-PRESENT-AT-HORIZON 0, VILLAGE-NEVER-OUT 0,
UNCLASSIFIED 0. Single-meeting (n = 1) chains only: VANISHED 2,
NEVER-CROSSED 4, VILLAGE-GONE 2. Both recurring (n = 4) chains end
VANISHED — recurrence happened, then the beast vanished; neither
recurring chain is a never-crossed story.

Per chain: first/last meeting day, wounds at last meeting (opening
→ remaining over the chain), first-contact runway (days − firstDay),
days the beast provably lived after its last meeting (lastSeen −
lastDay; 0 = gone by the first post snapshot), fate + evidence.

| Chain | n | First–last | Wounds (open→remain) | Runway1st | Alive-after | Fate |
|---|---:|---|---:|---:|---:|---|
| s75102 algorithm | 4 | d65–d71 | 1000→959 (41 dealt) | 21 | 0 (gone by d72 snap) | BEAST-VANISHED |
| s75102 audit | 1 | d74 | 1066→1008 (58) | 12 | 11 (to d85, final) | NEVER-CROSSED |
| s75102 eulogy | 4 | d55–d59 | 900→853 (47) | 31 | 2 (to d61) | BEAST-VANISHED |
| s75102 herald | 1 | d74 | 700→679 (21) | 12 | 11 (to d85, final) | NEVER-CROSSED |
| s75102 reunion | 1 | d79 | 1200→1185 (15) | 7 | 6 (to d85, final) | VILLAGE-GONE |
| s75110 reunion | 1 | d57 | 1200→1188 (12) | 61 | 61 (to d118, final) | NEVER-CROSSED |
| s75113 audit | 1 | d145 | 1100→1086 (14) | 5 | 4 (to d149, final) | VILLAGE-GONE |
| s75114 audit | 1 | d115 | 1100→1042 (58) | 45 | 44 (to d159, final) | NEVER-CROSSED |
| s75116 audit | 1 | d139 | 825→785 (40) | 41 | 0 (gone by d140 snap) | BEAST-VANISHED |
| s75116 suburb | 1 | d140 | 1300→1285 (15) | 40 | 18 (to d158) | BEAST-VANISHED |

How each fate was proven (not just labeled):

- BEAST-VANISHED (4): the (mid, hp) instance is absent from every
  census snapshot after a point, while the run continues — and the
  all-HP cross-check shows NO entry of that type at ANY hp after
  that point (except the algorithm's raid twin, below), so this is
  not a scholar wound changing the HP. Later same-type meetings: 0
  for all four, so no villager fight removed them (a villager kill
  would be a chain meeting). Neither host seed entered the table
  (s75102 entered 0, s75116 entered 0), so the finale campaign wipe
  is excluded; wave-4 mids are not network nodes, so the network
  clear is excluded. What remains in code: a scholar turn-based
  encounter. The scholar's fight lifts an ordinary wild monster out
  of the world at fight start and puts it back ONLY if it is a titan
  or a lingering raider (game.js tbEnd: "Wild monsters still melt
  away (titan-only)") — so a scholar win, flee, or loss all delete
  the beast. Kill vs melt-away cannot be split from this corpus (no
  tb-combat recorder); both are reported as the scholar-encounter
  family, never as a proven kill.
- NEVER-CROSSED (4): the instance is present in the census on the
  run's final census day, and the village had field days in the
  window, but no second meeting with the instance occurred. Detail
  in Q2.
- VILLAGE-GONE (2): the run ended village-lost with windowDays 5
  (s75113) and 7 (s75102 reunion) — inside the preregistered 7-day
  short window — while the census still showed the beast alive on
  the final day (s75113: present d146–149; s75102 reunion: present
  d80–85). The village died with the beast alive; the window, not
  the beast, foreclosed recurrence.

Instance-vs-type warning (proven by the census): s75102's raid
algorithm (986 HP after the d64 raid defense) roamed every day
d72–85, wandering (0,0)→(3,3), while the wild algorithm (959 HP)
vanished after d71. A type-level tracker would have called the
algorithm "present all window" and misclassified its chain. All
fates here are instance-level (mid, hp); type reappearance is
reported separately and is 0 for every chain.

## Q2 — encounter opportunity for NEVER-CROSSED chains (and context for all)

Post-window measures (days > lastDay; field = fieldparty channel
'field', any wave; beastLastTile = the chain's last meeting tile;
revisits = field meetings on that exact tile; adjacent = meetings on
the 8-neighbor tiles). Caveat, stated plainly: revisits count ALL
field-channel meetings on the tile, including aid-crisis fights
against crisis entities — a crisis fight on the beast's tile is NOT
a missed free encounter. The caller split is therefore reported, and
it changes the reading for s75102 (see below).

| Chain | Window | Field days / meetings | Revisits (caller split) | Adjacent | Beast drift | Beast census days |
|---|---:|---:|---|---:|---:|---:|
| s75102 audit | 12 | 4 / 5 | 4, ALL aid-crisis callback fights (d76 ×2, d77, d80) | 1 (d79 reunion) | 4 | 11/11 |
| s75102 herald | 12 | 4 / 5 | 4, ALL aid-crisis callback fights (same 4) | 1 (d79 reunion) | 4 | 11/11 |
| s75110 reunion | 61 | 3 / 5 | 0 | 0 | 5 | 61/61 |
| s75114 audit | 45 | 2 / 4 | 0 | 0 | 4 | 44/44 |

What this means, chain by chain:

- s75102 audit/herald (the shared-window pair): both beasts sat on
  tile (4,4) — the audit through d75, the herald through d80 — and
  villagers fought callback crisis fights ON (4,4) on d76, d77, d80
  without ever meeting either beast. Tile presence did not produce a
  meeting even when villagers were on the tile fighting something
  else. The routing that produces a beast meeting (villager on the
  tile + a worldTick + the 50% roll, with sheltered/resting villagers
  excluded — and worldTick itself runs on player tile entry) never
  fired for these beasts in 12 days, despite 5 field meetings in the
  window. The audit then wandered to (2,6), the herald to (7,2).
- s75110 reunion: the village went out on 3 days in 61 (d72, d93,
  d109), never onto the beast's tile or its neighbors, while the
  beast wandered from (4,3) to (0,8) (drift 5). The crossing never
  had a chance: low outing rate × a drifting target.
- s75114 audit: the village went out on 2 days in 45 (d119, d135),
  never onto the beast's tile or its neighbors, while the beast
  wandered from (3,4) to (2,1) (drift 4). Same shape as s75110, with
  an even thinner outing rate.
- Context (non-NEVER-CROSSED chains): the vanished eulogy's window
  had 11 field days / 18 field meetings with 14 adjacent-tile visits
  and 0 revisits of its last tile — the village was out and NEAR the
  beast's ground (it sat at (4,4) d60–61, one tile from its d59
  meeting tile (3,5)) before vanishing. The vanished s75116 audit's
  window had 10 field days / 15 meetings, 4 revisits, 11 adjacent
  visits — but the beast was already gone by the d140 snapshot, so
  those visits postdate its disappearance and prove nothing about
  crossing. The vanished suburb's window had 9 field days / 13
  meetings while the beast roamed d141–158 (drift 3), then vanished.

The two NEVER-CROSSED shapes are therefore distinct and must not be
averaged: (a) s75102 — village out, beast present, tile shared with
crisis fights, routing never fires; (b) s75110/s75114 — village
almost never out, beast drifts away, no tile overlap at all. A lever
that raises outing rates helps (b) and does nothing for (a); a lever
that touches routing helps (a) and is untested on (b).

## Q3 — sense-test (12/12 logs read end to end)

SENSE-PASS. All 10 first-meeting transcripts plus one later log per
recurring chain were read (10 firsts + 2 laters; outcomes vFlee and
vDie; no log reads as a beast dying, being driven off for good, or
leaving the world). The story in every first meeting leaves return
open, and the fates do not contradict the stories:

- Fighters flee because they are losing, never because the beast
  leaves: "runs while running still works" closes 9 of the 12 logs
  (the other 3 end in the fighter's death). The beasts end their
  first meetings at 679–1285 HP, wounded but standing.
- The two vDie first meetings (s75102 audit, s75116 suburb) kill the
  FIGHTER, not the beast — the beast walks away at 1008 and 1285 HP.
  A dead fighter forecloses nothing about the beast's return; the
  suburb's beast then roams 18 more census days, exactly as the
  story allows.
- The hair's-breadth escape reads coherently with a next-day
  vanishing: s75116's audit first meeting ends with Miguel at 1 HP
  ("runs while running still works") and the beast at 785 — and the
  census shows the beast gone by the next day's snapshot. Nothing in
  the villager's story removes the beast, which is precisely why the
  scholar-encounter family is the remaining explanation (see Q1).
- Caller pattern (unjudged observation): 2 of 10 first meetings are
  aid-crisis fights (s75102 algorithm d65, herald d74), not free
  field encounters — first contact often arrives inside a crisis,
  which matters for any future "send a party back" lever (the
  return-to-fight note is recorded for fought beasts, but a crisis
  first contact is not a planned hunt).
- The "no arrows" line appears in 2 first meetings (s75102 algorithm
  and audit) and, as in chainclose, does NOT predict zero damage:
  both fighters strike in melee anyway (29 and 58 dealt). No new
  zero cause appears in this band's first meetings.

## Wall numbers (this band, own corpus, 16 seeds, 180d, report-only)

Same upper-middle median convention as chainclose; this corpus's
wall numbers are IDENTICAL to chainclose's (a consequence of the
byte-identical rows, reported here as this run's own corpus, never
as a before/after).

- Wins: 9/16, all lesser seats (full 0). National ever: 13/16.
  National final: 11/16. Table reached: 12/16. Table entered: 9/16.
- Wave reach (unlock flag): wave 1: 16/16, wave 2: 16/16, wave 3: 14/16,
  wave 4: 9/16, wave 5: 0/16. (Wild wave-4 CONTACT is 5/16 seeds, so
  unlock still overstates contact.)
- Median survival: 118d (days sorted [31, 86, 90, 99, 102, 114, 115,
  115, 118, 128, 150, 160, 165, 180, 180, 180]; statistical median
  116.5d, noted for comparability).
- Deaths: 527 total. Starvation: 3.
- Death causes (527): villager:combat 219, villager:villager combat
  140, player:the wild 63, villager:expedition 42, villager:monster 18,
  rest small. This band does not starve; it is killed in combat.

## Census counts only (no lever judgment)

- Raid wave-4: 4 (s75102 algorithm d64, audit d73; s75113 influencer
  d127, eulogy d136). INSUFFICIENT-DATA for raid-shape pricing beyond
  the instance-vs-type warning above.
- Other wave-4: 1 (s75110 eater d51, hp null). INSUFFICIENT-DATA.
- Wild wave-4 per seed: 75102: 11; 75116: 2; 75110/75113/75114: 1 each;
  all other seeds: 0. Contact remains concentrated: one seed holds
  11/16 wild meetings.

## RANKED NEXT (with numbers — no lever built here)

1. TB-COMBAT RECORDER (split the vanished 4). BEAST-VANISHED is joint-
   largest (4/10) but kill vs scholar-flee-melt-away is unproven for
   every case. A record-only tb-combat recorder (same pattern as the
   census: read state, feed no decision) that logs scholar-vs-world-
   monster encounters (mid, world HP before/after, tb outcome) would
   prove, per vanished chain, whether the scholar killed the beast
   or merely met it and melted it away — and would measure how large
   a beast sink scholar encounters are band-wide. Until then, no
   lever should claim to "stop beasts vanishing" — the sink is
   unmeasured at its split.
2. ROUTING CENSUS (explain the s75102 never-crossed pair). The herald
   sat on (4,4) through 3 crisis fights on that tile without meeting
   anyone. The next measurement counts worldTick firings (they run on
   player tile entry), villagerMonsterTick routings, the 50% roll
   outcomes, and shelter/rest exclusions, on a band where beasts sit
   on visited tiles — so the next arm can say whether routing never
   fired because the player rarely entered tiles, because the roll
   missed, or because crisis fights consume the routing.
3. OUTING-RATE MEASUREMENT (explain s75110/s75114). 3 field days in
   61 and 2 in 45 are the thinnest outing rates in the band. The next
   arm measures what keeps these villages home (food, safety, policy
   — the tableseat-nowait substrate's own outing logic) before any
   lever claims to "send villagers back" to a beast: a village that
   goes out twice in 45 days will not re-cross anything.
4. SPAWN-HP VARIANCE CENSUS (carried from chainclose F-3, now proven
   real). The s75116 audit's census shows it sitting at 825 HP from
   at least d133 to its d139 meeting — spawn HP for one type is not
   fixed at 1100. A spawn-HP census across wave-4 types pins the
   variance before any target assumes an opening HP.
5. RAID-SHAPE WAVE-4 — INSUFFICIENT-DATA (n=4). Do not judge any
   raid-shape lever from 4 meetings.

## Findings-backlog items found (reported to the coordinator; NOT appended to sim-findings.md by this worker)

- F-1 (mechanism, needs a tb recorder to prove per-chain): scholar
  turn-based combat melts ordinary wild monsters even on flee/loss
  (game.js tbEnd restores only titans/lingering raiders: "Wild
  monsters still melt away (titan-only)"). This is the prime
  candidate behind all 4 BEAST-VANISHED chains (finale wipe excluded
  by entered==0 on both host seeds; villager removal excluded by 0
  later same-type meetings; HP-change excluded by the all-HP census
  check). If the melt-away is real at band scale, scholar encounters
  are a beast sink the loops have never measured.
- F-2 (proven by census): s75116's audit spawned at 825 HP (not 1100)
  and sat at (4,4) for at least 6 days before its only meeting.
  Spawn-HP variance is real, not a wound artifact — chainclose F-3
  confirmed.
- F-3 (measurement caveat, carried into the next prereg): tile
  revisits must split by caller. All 4 (4,4) revisits in the s75102
  never-crossed windows were aid-crisis callback fights, not free
  encounters — a revisit count that pools callers overstates missed
  meetings. Future opportunity tables should preregister the split.
- F-4 (instance discipline): s75102's raid algorithm (986) roamed
  d72–85 while the wild algorithm (959) vanished. Type-level
  presence tracking would misclassify this chain. Future arms must
  track (mid, hp) instances, not types.
- F-5 (carried observation): wild wave-4 contact remains concentrated
  (5/16 seeds, one seed holding 11/16 meetings) while unlock is 9/16
  — the encounter-rate gap bounds every wave-4 claim to a handful
  of villages.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (527 total) and wall numbers are reported above; no
  guard moves under a measurement-only arm.
- No guard can move under a measurement-only arm.

## Metric review (for the NEXT run — nothing re-scored here)

- SHORT-WINDOW THRESHOLD (7 days, preregistered with justification):
  worked cleanly — the two VILLAGE-GONE windows are 5 and 7, the
  shortest NEVER-CROSSED window is 12, so the threshold sits in an
  empty band (8–11) with no borderline case. Keep it; a future band
  with a window of 8–11 would be the first real test of the edge.
- CENSUS (mid, hp) MATCHING: worked — 0 collisions in any post
  window, and the all-HP cross-check caught the one case where a
  naive matcher could have been fooled (the raid algorithm twin).
  Keep instance-level matching; never fall back to type-level.
- REVISIT MEASURE (needs the caller split): as implemented it pools
  aid-crisis and free encounters on a tile. The s75102 pair shows
  the pool misleads (4 revisits, 0 free). Future preregs should
  preregister revisits-by-caller (resolve vs aid vs patrol) instead
  of a pooled count.
- CENSUS SNAPSHOT TIMING (off-by-one, disclosed): the snapshot runs
  before base.daily, and the run can end mid-day after the last
  snapshot — so the final census day trails the seed's days by 1 on
  s75102 (85 vs 86) and s75104 (101 vs 102). Harmless here (presence
  is judged on the last census day, and the completeness leg allows
  within-1), but a future arm judging "present at the exact final
  day" must account for it.
- presentAtEnd FALLBACK (lastDay >= finalDay counts as presence):
  unused in practice — every chain had post snapshots — but kept as
  the honest fallback for a chain met on the run's final day.
- MEDIAN-DAYS CONVENTION (carried): the analyzer reports the
  upper-middle row (118d); the statistical median is 116.5d. This
  evidence quotes 118d for comparability and notes 116.5d here.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number — by design, it is diagnosis — but it replaces chainclose's
"8/10 chains never re-meet" with a measured split on the identical
substrate (byte-identical rows): VANISHED 4, NEVER-CROSSED 4,
VILLAGE-GONE 2, FINISHED 0, UNCLASSIFIED 0. The next arm that claims
movement on this axis must move one of those measured quantities —
a vanished beast kept in the world, a never-crossed beast re-met, a
short-window village kept alive past first contact — not re-describe
them.

## Infrastructure notes

- Sweep wall: ~21 min for 16 seeds under sibling load (~80s/seed
  including the full recorder stack + census; chainclose's 16-seed
  sweep took ~4.5 min under lighter load — the difference is sibling
  load, not the harness).
- Safe-commit index clobber hit all three worker commits so far
  (prereg, prereg correction, instruments) — repaired via HEAD-blob
  cacheinfo each time with hash verification, never reset, never
  forced, commits verified correct. Same clobber class as the
  2026-10-29 loop notes.
- Seed 75102's corpus row is byte-identical to chainclose's, and the
  determinism re-run of 75102 is byte-identical in row + census —
  the base did not move under this run for the shared seed.
- Scratch dir (determinism re-run of s75102) removed after its diff;
  the worktree holds only committed work plus the corpus committed
  with this file.
- Analyzer exits 0 (COMPLETENESS-PASS, CLASSIFICATION-PASS,
  SUBSTRATE-PASS); fixtures FIXTURES-PASS (45 checks, 0 fails);
  determinism DETERMINISM-PASS; sense read 12/12 logs (SENSE-PASS by
  reading).
- No live verification, no push, no bump: this arm reports "branch
  ready for coordinator merge, pending ship" per assignment. The
  batch ship job owns pushes. Sibling loop B may move master under
  this branch; if it does before the coordinator merges, rebase
  cleanly and re-run the proof (rebase conflict = FAIL LOUDLY, no
  force, no merge) — the coordinator owns that step, not this
  worker's final report.

## Files

- Corpus: evidence/2026-10-30/perseed-recurrence-a/s75101–s75116-fresh.json
  (16 rows, byte-identical to perseed-chainclose-a) +
  census-s75101–s75116.json (16 daily world-monster censuses) +
  summary.json (corpusOk true, censusOk true) +
  analysis.json (analyzer output: joins, chains, fates, opportunity,
  wall, substrate).
- Analyzer: scripts/analyze-recurrence-a.js (six-recorder join, chains
  via required chainclose buildChains, census matching, fate tree,
  opportunity measures, wall, substrate byte-compare, sense mode).
- Sweep: scripts/sweep-recurrence-a.js (verbatim copy of the
  chainclose sweep with the three prereg-disclosed deltas; diff shows
  only those deltas).
- Fixtures + determinism: scripts/test-recurrence-a.js (45 checks;
  --determinism <seed> re-runs one seed to scratch and diffs row +
  census, then removes scratch).
- Prereg: evidence/2026-10-30/sim-recurrence-a-prereg.md (ae1a4b5af,
  correction 5669fe527).
- Instruments: scripts/sweep-recurrence-a.js +
  scripts/analyze-recurrence-a.js + scripts/test-recurrence-a.js
  (483dfa0b1).
