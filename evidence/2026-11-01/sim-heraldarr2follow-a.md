# sim-heraldarr2follow-a — Herald arrival instrument follow-ups: day-120 step, twin lookup, remaining windows + mismatches (DIAG ONLY, zero src/js)

- Run: fleshout-loop (Loop A, axis scale-onramp).
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved,
  no policy-default flip, no routing/muster/gate built (#1538
  still pending — untouched). No `[needs-eyes]` (DIAG
  instrumentation only; nothing player-facing changes).
- Verdict: **DIAG-GO — all three follow-ups closed.** The
  95404 day-120 step is a travelTo follow-enter leg plus a
  nested wander, now recorded stepwise; the `draftedPost`
  twin lookup is corrected by a pre-call reference snapshot
  (and the old by-id rows are proven harmless twin
  artifacts on all 99 affected rows); the pilot's remaining
  windows and all 12 follow-taxonomy mismatches are closed
  by the analyzer fixes, with nothing smoothed. The confirm
  band replicates every finding on fresh seeds.
- Stack (named exactly; numbers NEVER compared across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Same stack
  family as heraldarr2-a.
- Band: the heraldarr2-a LONGEVITY SCREEN reused, not re-run
  (selection on survival/won only, never on any Herald
  field; audit trail `evidence/2026-11-01/sim-heraldarr2-a-screen/`).
  Pilot = qualifiers 1–8: 95401, 95404, 95405, 95408, 95409,
  95413, 95415, 95417. Confirm = qualifiers 9–16: 95419,
  95421, 95423, 95425, 95428, 95429, 95431, 95434 — run
  because the pre-stated live signal held (all pilot bars
  1–9 passed), as a replication, including the original
  twin seed 95429 and the original spawn-filing seeds
  95419, 95425, 95429.
- Horizon: `DAYS=180`, death-aware.
- Corpus (capture ON): pilot `evidence/2026-11-01/sim-heraldarr2follow-a/`
  (8 JSONs), confirm `evidence/2026-11-01/sim-heraldarr2follow-a-confirm/`
  (8 JSONs). Analyses: `sim-heraldarr2follow-a-analysis.json`,
  `sim-heraldarr2follow-a-confirm-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-heraldarr2follow-a-prereg.md`
  (commit `2bf23d5d1`, before any judged sim; instrument
  commit `e45a07f7c`). Judged exactly against that header;
  no bar moved after seeing results.
- Instrument files (this arm only, copied — NOT edited —
  from heraldarr2-a): `scripts/sim-heraldarr2follow-a-sweep.js`,
  `scripts/sim-heraldarr2follow-a-lib.js`,
  `scripts/sim-heraldarr2follow-a-analyze.js`,
  `scripts/test-sim-heraldarr2follow-a.js`. Changes from
  heraldarr2-a, and ONLY these: (1) travelTo wrapper pushes
  a stepwise `followEnter` move (heraldBefore → dest, the
  code's assignment tile, never heraldAfter); (2)
  havenRaidTick wrapper snapshots drafted ENTITY REFERENCES
  pre-call and records `draftedPostList` (per entity, not
  per id), keeping the old by-id `draftedPost` alongside
  for comparison; (3) havenRaidTick wrapper pushes a
  stepwise `raidPin` move (heraldBefore → haven), not a
  net before → after record; (4) analyzer chains with
  order-independent linking, suppresses synth legs covered
  by primitive followEnter rows, decomposes
  followEnterDidNotLand synth legs, splits net raidPin
  moves for old-style corpora, files spawns only to the
  window they open, and reclassifies mismatches via
  `reclassifyTravel`.

## (a) The day-120 step — found, wrapped, step-exact

Seed 95404, window dawn 120 → dawn 121, on the RE-RUN leg
(new instrument, same seed, same stack). Dawn 120 tile
(4,4), lingering true; dawn 121 tile (3,3), lingering
false. The move rows for day 120, in link order:

1. `followEnter` (4,4) → (4,3) — travelTo follow-enter
   leg, game.js travelTo follow re-entry assignment
   (`oldMonster.tx = x; oldMonster.ty = y`). This is the
   step the v2 instrument never recorded as a move row:
   its travelTo wrapper pushed no move events, so the
   leg existed only as a travelEvent, and the analyzer's
   collapsed synth leg then orphaned the next step.
2. `followEnter` (4,3) → (3,4) — second travelTo
   follow-enter leg, same call path, landing exactly on
   the travel dest (3,4).
3. `wander` (3,4) → (3,3) — nested worldTick wander
   inside the second travelTo call (wanderWorldMonsters),
   recorded by the wander wrapper.

Chain-continuous, no gap, no other mover: the window's
only steps are follow + follow + nested wander. The
predecessor's candidate ("a combat/fight displacement
outside resolve") is DISPROVEN for this window — no
fight, no resolve row, no mFlee row on day 120; the
day-121 fight-flee is a different day's step and is
itself now stepwise (see below). The step CAN be wrapped
and HAS been wrapped: the travelTo wrapper now pushes
the follow leg stepwise, and the analyzer suppresses
its synth leg for covered travels, so no double count
(95404's day-120 travelEvents still read
followEnterDidNotLand on the second leg — correctly,
because heraldAfter (3,3) ≠ dest (3,4) — while the move
rows now carry the true stepwise path).

The neighboring window closes too: day 121 is now
stepwise `raidPin` (4,3) → (4,4) (draft landing) +
`mFleeMove` (4,4) → (3,5) (defender fight, villager
`app_mgpspiwk456`, outcome `mFlee`), replacing the old
net raidPin (4,3) → (3,5) that duplicated the flee.

## (b) The draftedPost twin lookup — corrected, old rows proven harmless

Correction: `draftedPostList`, one entry per drafted
ENTITY, read off the pre-call entity reference (the raid
code mutates tx/ty in place on those same objects, so
the reference still describes the drafted entity
post-call even when a twin shares its id). On the pilot:
564 drafted-list entries, ZERO present entries with
raidBorn false. On the confirm: 408 entries, ZERO
present entries with raidBorn false. Combined: 972
entries, 0 false. The reference snapshot also recovers
cases the by-id lookup reported as null: drafted
entities removed during the raid call now keep their
last tile (e.g. 95404 day 118 `congregation`, preTile
(4,4) → tile (4,4), present false — drafted in place,
then removed in the raid fight — instead of a null).

The exact original rows, re-run: confirm seed 95429
day 136 — by-id `eulogy` STILL reads (6,0), raidBorn
false, hp 900 (the wrong twin, deterministically, since
the by-id code is kept for comparison), while
`draftedPostList` for the same call reads the drafted
eulogy as preTile (4,3) → tile (4,4) on Haven, raidBorn
true, hp 675, lingering true. Day 163 repeats the
pattern: by-id (5,0)/false/900, list (5,5) → (4,4),
raidBorn true, hp 649. The drafted twin was always on
Haven; only the lookup described the wrong twin.

Harmlessness of the OLD rows, proven on all affected
rows (not sampled): across both old corpora, 99
by-id draftedPost rows carry raidBorn false — and all
99 sit on ids appearing ≥2 times in the same call's
pre-call sorted list (pilot 42/42, confirm 57/57, 0
unique-id false rows). Classification was never touched
by the bug: `heraldStatus`/`draftedIds` derive from the
pre-call sorted list + lastRaidDay, never from
`draftedPost`, and the Herald id is unique in every old
sorted list (0 duplicates) — so no Herald record is
affected, on either band. The one caveat that survives:
any consumer that read `draftedPost` by id for a
duplicate-id monster (not the Herald) was reading a
twin; that object is now retained only for comparison
and must not be used for per-entity claims.

## (c) Remaining windows and mismatches — closed, not smoothed

Change-window coverage: pilot 79/79 attributed (old:
75/79), confirm 119/119 (old: 116/119). Combined
198/198, 0 unattributed. The fixes, each verified on
the old corpus BEFORE the new sweep was judged (new
analyzer over the old pilot corpus: 79/79, 11/11
nested, 42/42 twin-explained):
- Spawn filing: a spawn move now enters exactly the
  window it opens (day == cur.day AND herald absent at
  prev dawn). All 13 old spawn rows are dawn spawns
  (same-day dawn tile equals the spawn tile), so the
  old day-range rule's double-filing into the following
  window was purely a filing error. Pilot spawn windows
  95408 d138 and 95413 d170, confirm 95419 d136,
  95425 d127, 95429 d101: all attributed now.
- Raid-net collapse: stepwise raidPin (above) plus, for
  old-style corpora, `splitRaidNet` (net raidPin +
  same-day mFleeMove haven → net.to → landing leg).
  95404 d121 attributed on both the old-corpus
  re-analysis and the new stepwise sweep.
- Mismatches: pilot 11 raw → 11 nestedWander, 0
  unexplained; confirm 1 raw → 1 nestedWander, 0
  unexplained. Combined 12/12. Every one names its
  explaining primitive move: followEnterDidNotLand
  cases have a same-day wander move dest → heraldAfter
  (95404 d120: wander (3,4) → (3,3); 95429 d157:
  wander (3,4) → (3,3)); movedDespiteHold cases have a
  same-day wander move heraldBefore → heraldAfter
  (95404 d110: wander (4,4) → (5,4); d135: wander
  (4,3) → (4,2)). The branch lines were right every
  time ("It followed you" / boundary line spoken); a
  nested worldTick wander inside the same travelTo call
  moved the Herald one more step before the wrapper's
  after-state. The old taxonomy counted those as
  contradictions; the new taxonomy counts them as
  nestedWander with the explaining move attached, and
  any mismatch WITHOUT such a move would still surface
  as unexplained (none did).

## Draft / linger census (carried, still complete)

Pilot: 1,400 `havenRaidTick` calls, 1,400 draft records,
0 `unknown`. By class: blocked-cooldown 784, roll-miss
449, draft 129, blocked-pantry 38. Herald status: absent
1,214, gate-or-roll 169, rank-missed 11, drafted 6.
Linger: 18 re-pin records (17 moved, 1 held), 0 missing
days. Confirm: 1,346 calls, 1,346 records, 0 `unknown`
(blocked-cooldown 688, roll-miss 513, draft 107,
blocked-pantry 38); Herald status: absent 1,085,
gate-or-roll 245, rank-missed 15, drafted 1; linger 0
records, 0 missing (no Herald lingering at any daily
entry — the confirm's drafted Herald was met promptly,
so it never entered the lingering state).
Haven windows: pilot 4 (all raidPin, all
chain-continuous — the same 4 as heraldarr2-a: 95404
109→110, 113→114, 134→135; 95408 172→173), confirm 1
(95429 136→137, raidPin). The raid-pin arrival finding
is reproduced, not just the instrument fixes.

## Per-seed end fields (this band, this stack — not wall numbers)

Pilot:

| seed | class | days | end | rank | wave | table | won | drafts | haven windows |
|---|---|---|---|---|---|---|---|---|---|
| 95401 | LOCATED-UNFACED | 181 | survived | global | 4 | 0 | 0 | 0 | 0 |
| 95404 | CONTACTED | 140 | village-lost | regional | 5 | 1 | 0 | 5 | 3 |
| 95405 | LOCATED-UNFACED | 181 | survived | national | 4 | 0 | 0 | 0 | 0 |
| 95408 | CONTACTED | 180 | survived | national | 4 | 0 | 0 | 1 | 1 |
| 95409 | LOCATED-UNFACED | 181 | survived | regional | 4 | 0 | 0 | 0 | 0 |
| 95413 | LOCATED-UNFACED | 180 | survived | national | 4 | 0 | 0 | 0 | 0 |
| 95415 | NEVER-LOCATED | 181 | survived | global | 3 | 0 | 0 | 0 | 0 |
| 95417 | NEVER-LOCATED | 181 | survived | national | 2 | 0 | 0 | 0 | 0 |

Confirm:

| seed | class | days | end | rank | wave | table | won | drafts | haven windows |
|---|---|---|---|---|---|---|---|---|---|
| 95419 | LOCATED-UNFACED | 147 | village-lost | regional | 4 | 1 | 0 | 0 | 0 |
| 95421 | NEVER-LOCATED | 181 | survived | global | 3 | 0 | 0 | 0 | 0 |
| 95423 | CONTACTED | 181 | survived | global | 4 | 0 | 0 | 0 | 0 |
| 95425 | LOCATED-UNFACED | 180 | survived | regional | 4 | 0 | 0 | 0 | 0 |
| 95428 | LOCATED-UNFACED | 122 | village-lost | regional | 4 | 0 | 0 | 0 | 0 |
| 95429 | CONTACTED | 181 | survived | regional | 4 | 0 | 0 | 1 | 1 |
| 95431 | LOCATED-UNFACED | 181 | survived | regional | 4 | 0 | 0 | 0 | 0 |
| 95434 | LOCATED-UNFACED | 181 | survived | global | 4 | 0 | 0 | 0 | 0 |

## Pre-registered DIAG-GO bars (judged exactly as written)

1. 8 pilot seeds, each complete — PASS. 8/8 JSONs
   present, capture errors 0 on all 8, end fields present.
   (Confirm likewise 8/8, errors 0.)
2. 100% of pilot raid calls classified, zero `unknown`;
   every Herald-living call carries a draft status —
   PASS. 1,400/1,400 records; proof re-derives every
   record independently (pilot proof 2,240 checks green).
   (Confirm: 1,346/1,346, proof 1,970 green.)
3. 100% of pilot daily calls with the Herald lingering
   at entry carry a linger re-pin record — PASS.
   Linger-missing days 0 (pilot 18 records; confirm 0
   lingering entries, 0 missing).
4. Day-120 window attributed step-exactly on the re-run
   leg — PASS. 95404 dawn 120 → 121:
   followEnter (4,4) → (4,3), followEnter (4,3) →
   (3,4), wander (3,4) → (3,3), chain-continuous via
   order-independent linking. No other mover.
5. DraftedPost twin lookup corrected — PASS. Pilot
   draftedPostList 564 entries, 0 present entries with
   raidBorn false; confirm 408 entries, 0 false; every
   by-id raidBorn-false row twin-explained (pilot 42/42,
   confirm 57/57, 0 unique-id anomalies).
6. Pilot unattributed windows = 0 — PASS. 79/79
   attributed (confirm 119/119).
7. Pilot travel mismatches: 0 unexplained — PASS.
   11/11 nestedWander with explaining moves named
   (confirm 1/1).
8. Recorder-neutrality leg — PASS. Seed 95404 ON vs
   OFF end fields IDENTICAL on all 8 fields (days 140,
   gameDays 140, won 0, national 0, table 1, maxWave 5,
   endScaleRank regional, endReason village-lost).
   The instrument does not move the run.
9. Determinism leg — PASS. 95404 ON re-run reproduces
   the judged per-seed JSON except `anchorCommit` (in
   fact byte-identically including the anchor — no
   commit landed between the judged sweep and the
   re-run).
10. Proof test green — PASS. Synthetic 35/35 before
    the pilot; synthetic + corpus legs 2,240/2,240
    (pilot) and 1,970/1,970 (confirm) after, 0 failed;
    old-corpus re-analysis leg 40/40 (new analyzer
    over the heraldarr2-a pilot corpus: 79/79 windows,
    11/11 nested, 42/42 twin-explained).
11. Sense-test — PASS (read below).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base
DIAG census, no before/after comparison exists in this
arm; none fabricated.

## SENSE-TESTING: what the transcripts actually say

Day 120 on 95404 now reads as a single intelligible
beat, not a ledger gap: the scholar walks off the Haven
tile and the Herald trails them — "It followed you. The
Herald is here." — twice, once per step, and then pads
one tile further on its own to (3,3) while the scholar
walks on. A player watching this sees a titan that
follows people, not a teleport: the follow lines and
the wander step are the same story, and the instrument
now tells it stepwise instead of collapsing the second
follow and the wander into one impossible jump. The
twin correction reads the same way: the raid list names
the drafted eulogy, and the corrected record puts it on
the Haven tile where the raid put it (4,4, raidBorn,
gorging price to follow), instead of describing a
different, undrafted eulogy standing at (6,0) with full
health — the old row described a real monster, just the
wrong twin, which is why it never corrupted the Herald
finding. The remaining wrinkle is honest, not hidden:
the second day-120 travelEvent still reads
followEnterDidNotLand, because heraldAfter (3,3) is not
the dest (3,4) — that mismatch label is now a pointer
to the nested wander, not a contradiction, and the
evidence names the wander that explains it.

## Wall numbers (orientation only — screened band, never pooled)

Pilot: won 0/8, national 6/8, table 1/8, wave-4 reach 6/8,
wave-5 reach 1/8 (95404), median survival 181d.
Confirm: won 0/8, national 3/8, table 1/8, wave-4 reach
7/8, wave-5 reach 0/8, median survival 181d.
Combined screened band: won 0/16, wave-5 reach 1/16.
These numbers describe a band SELECTED to survive past
day 120 un-won — by construction every seed here lived
past 120 — so they must never be trended as if
representative, and the 0 wins here say nothing about
the win rate (the screen excludes wins by design).
What they do show, for the scale wall: even on
long-lived runs, wave 5 is reached once in 16 and the
full seat never (the two table flags accompany
regional-rank, village-lost ends — 95404, 95419 —
tables that did not become full-seat wins). The arrival
mechanism is no longer the blocker in this story — the
Herald DOES arrive, by raid, on 5 of 16 long runs — but
the climb past wave 4 to a full seat still does not
complete.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the committed header: 8 pilot seeds, draft
  census complete, linger census complete, day-120
  window step-exact, twin lookup corrected, pilot
  unattributed 0, mismatches 0 unexplained, neutrality
  on 95404, determinism on the same seed, proof green,
  sense beats read. No re-scoring, no bar moved after
  seeing results. The confirm ran because the pre-stated
  live signal held (all pilot bars 1–9 passed) — it
  replicated the fixes (119/119 windows, 1/1 nested,
  408 list entries 0 false, 57/57 twin-explained)
  rather than rescuing a miss.
- **Doubts filed, not resolved by re-scoring.**
  (a) Dawn snapshots miss intra-day position changes —
  the move-event log is the guard; the follow-leg push
  closes the one gap class the v2 wrapper left open,
  but any mover outside the wrapped set still surfaces
  as an UNATTRIBUTED window, by design — none did on
  either band. (b) The roll-miss inference reads
  lastRaidDay + drafted set + RAID line, not the RNG
  draw itself — carried from heraldarr2-a, unchanged.
  (c) The drafted set is recomputed from the pre-call
  sorted list when the raid fires — carried, unchanged;
  the reference snapshot changes only the POST state
  read, never the draft classification. (d) The screen
  selects on survival/won only, never on any Herald
  field — but it still selects: screened bands must
  never be pooled with unscreened bands or trended as
  if representative. (e) This arm reuses the
  heraldarr2-a band, so its counts are judged on their
  own base, never pooled with heraldarr2-a counts —
  even though the seeds are the same, the instrument
  differs (follow legs and stepwise raid pins add move
  rows by design: pilot moves 83 on 95404 vs the old
  corpus's follow-less rows, while raid/linger/contact
  counts reproduce exactly). (f) Order-independent
  chain linking can, in principle, link a wrong event
  pair when two same-day events share tiles; the
  day-120 bar was step-exact (named tiles, named
  classes), not end-tile-only, so a wrong link could
  not pass it without reproducing those exact steps.
  (g) NEW: `draftedPost` by id is retained for
  comparison and still describes the wrong twin on
  duplicate-id rows — any future consumer must read
  `draftedPostList`, never `draftedPost`, for
  per-entity claims. (h) NEW: a drafted Herald killed
  or removed inside the raid call with no
  removeWorldMonster row would leave a landing leg to
  Haven followed by a dawn absence; no such case
  occurred on either band (the 4 removed-list entries
  on 95404 all carry last tiles), but the window
  would surface as unattributed, not silently pass.
- **Revisions for the NEXT run, not this one.** (1)
  Retire `draftedPost` (by id) from future instruments
  once no consumer compares against it — the list is
  strictly more informative. (2) The followEnterDidNotLand
  label now means "follow + nested move" whenever a
  nestedWander reclassification exists; a future
  taxonomy could rename the reclassified cases outright
  instead of carrying the mismatch label alongside its
  explanation. (3) The heraldplace episode itself (old
  base, old corpus) is still NOT re-attributed by this
  arm: this arm proves the mechanism class and closes
  the instrument gaps on fresh windows, it does not
  replay that episode's own seed.

## Blanks filled or documented

- Filled (measured): the 95404 day-120 step — follow +
  follow + nested wander, stepwise and chain-continuous;
  the draftedPost twin lookup — reference snapshot,
  972 list entries 0 false, 99/99 old false rows proven
  twin artifacts; the remaining windows — spawn filing
  and raid-net collapse fixed, 198/198 change windows
  attributed across both bands; the 12 mismatches — all
  nestedWander with explaining moves named.
- Documented, not filled (for later arms, NOT this
  one): (a) #1538 (refused-face routing) still pending
  and untouched; (b) the old heraldplace episode's own
  attribution (mechanism proven, episode not replayed);
  (c) whether the full seat is reachable at all on
  long-lived bands (0/16 here, but this band excludes
  wins by construction — a different question from this
  arm's).

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis loses one more blocker — the Herald arrival
instrument is now gap-free (every move attributed, every
draft described by the right entity, every mismatch
explained) — while the climb past wave 4 to a full seat
still does not complete on long-lived bands. No game
change landed (DIAG only).

## Readiness

Ready for coordinator merge ('merged locally, pending
ship' is the coordinator's call) — NOT pushed, NOT
version-bumped, NOT live-verified. No `[needs-eyes]`
(DIAG instrumentation only; nothing player-facing
changed). Worktree clean after commit (see commit
message for the file list); scratch leg dir removed,
not committed.
