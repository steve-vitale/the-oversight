# sim-heraldarr2follow-a — preregistration: HERALDARR2 INSTRUMENT FOLLOW-UPS (DIAG ONLY, zero src/js)

Run: fleshout-loop (Loop A, axis scale-onramp).
Worker branch: sim-heraldarr2follow-a. Arm: DIAG ONLY. Zero `src/js`
changes, no gate threshold moved, no policy-default flip, no routing
built, no muster built (#1538 still pending — untouched). No
`[needs-eyes]` (DIAG instrumentation only; nothing player-facing
changes).

## Prior arm (read first, reused not reinvented)

- `evidence/2026-11-01/sim-heraldarr2-a.md` +
  `sim-heraldarr2-a-prereg.md` (read-only reference) and its
  instrument `scripts/sim-heraldarr2-a-{sweep,lib,analyze}.js`.
  That arm PROVED raid-pin Herald arrival (5 haven windows, all
  raidPin) and left instrument-only follow-ups, which are this
  arm's targets, in order:
  (a) ONE genuinely unrecorded step: pilot seed 95404, window
  dawn 120 → dawn 121 (dawn tile (4,4) → dawn tile (3,3)).
  (b) The `draftedPost` twin-id lookup: on some draft rows it
  describes the wrong twin (raidBorn false, off-Haven) — the
  named case is confirm seed 95429 day 136, drafted `eulogy`
  described as (6,0), raidBorn false, hp 900, while a second
  `eulogy` entity sits in the same pre-call sorted list.
  (c) Time permitting: the remaining unattributed windows (all
  non-haven per heraldarr2) and the 12 follow-taxonomy
  mismatches — reported, not smoothed.
- This arm COPIES the heraldarr2-a instrument into new
  `heraldarr2follow-a` files. It does NOT edit the
  heraldarr2-a files in place.

## Pre-analysis (done BEFORE this prereg, from the old corpus alone)

These are hypotheses to be proven by the new instrument, not
verdicts. The prereg bars below judge the new instrument
against them; a hypothesis that fails on the re-run is a
finding, not a re-score.

(a) DAY-120 STEP. Old corpus, seed 95404, day 120, in order:
dawn tile (4,4), lingering true; travelTo (4,4)→(4,3),
herald followEnter, heraldAfter (4,3) — a follow leg with NO
move-event row, because the v2 travelTo wrapper pushes no
move events by design; travelTo (4,3)→(3,4), herald
followEnter, heraldAfter (3,3) — mismatch
`followEnterDidNotLand`; wander move (3,4)→(3,3) recorded
the same day. Hypothesis: the "unrecorded step" is the
follow leg itself (game.js travelTo follow-enter assignment,
`oldMonster.tx = x; oldMonster.ty = y`), and the window
breaks because the analyzer synthesizes the second travel
as ONE leg (4,3)→(3,3), so the wander's from-tile (3,4)
never appears as any event's to-tile and the chain gaps at
event 0. The step CAN be wrapped: the travelTo wrapper can
push the follow leg stepwise (heraldBefore → dest, the
code's assignment tile), leaving the nested wander to its
own wrapper. If the re-run shows any OTHER mover for this
window (a step not explained by follow + nested wander),
that mover is named in the evidence and bar 4 fails.
(b) TWIN LOOKUP. Across both old corpora, every
`draftedPost` row with raidBorn false sits on a drafted id
that appears ≥2 times in the same call's pre-call sorted
list (99 such rows; 0 with a unique id), and every such
row's described tile/hp matches an undrafted twin, not the
drafted entity. Hypothesis: the post-call
`worldMonsters().find(m => m.id === id)` returns the FIRST
same-id entity, which need not be the drafted one. The
fix CAN be made instrument-side: snapshot the drafted
ENTITY REFERENCES pre-call (the raid code mutates tx/ty in
place on the same objects, so a reference still describes
the drafted entity post-call even when a twin shares its
id), and read post state off the references, never off a
by-id re-find. Classification is untouched by this bug:
`heraldStatus`/`draftedIds` derive from the pre-call
sorted list + lastRaidDay, never from `draftedPost`, and
the Herald id is unique in every old sorted list (0
duplicates) — so no Herald record is affected. The new
instrument must prove both halves: draftedPostList clean
AND the old by-id rows re-explained as twins.
(c) REMAINING WINDOWS / MISMATCHES. Old pilot unattributed
windows: 95404 d120 (see (a)), 95404 d121 (raid-net
collapse: net raidPin (4,3)→(3,5) + mFleeMove
(4,4)→(3,5) describe one draft + one flee twice),
95408 d138 and 95413 d170 (spawn-day-boundary filing:
every old herald spawn move is a dawn spawn — same-day
dawn tile equals the spawn tile on all 13 spawn rows —
so a spawn move belongs to the window it OPENS, never to
the following window, but the day-range rule files it
into both). Old confirm adds 95419 d136, 95425 d127,
95429 d101, all the same spawn-filing class. Old
mismatches (12: 11 pilot + 1 confirm): in EVERY case a
same-day primitive move starts at the branch-expected
tile and ends at heraldAfter — followEnterDidNotLand
cases have a wander move dest→after (e.g. 95404 d120:
wander (3,4)→(3,3); 95429 d157: wander (3,4)→(3,3));
movedDespiteHold cases have a wander move
before→after (e.g. 95404 d110: wander (4,4)→(5,4); d135:
wander (4,3)→(4,2)). Hypothesis: all 12 are
"branch line spoken + nested post-leg move" (a nested
worldTick wander inside the travelTo call), not branch
violations, and the taxonomy must reclassify them as
`nestedWander` with the explaining move named.

## Mechanism read before sims (code, not conjecture)

- travelTo follow-enter (game.js, the follow re-entry
  block): when the scholar moves off a monster's tile and
  the monster follows and the dest tile is not safe and
  not occupied, `oldMonster.tx = x; oldMonster.ty = y`
  (dest tile, exactly). The follow leg's landing tile is
  therefore ALWAYS the travel dest, whatever the
  herald's after-state reads after nested calls inside
  the same travelTo (nested worldTick → wander, which
  the wander wrapper already records stepwise).
- wanderWorldMonsters (game.js): single-step moves to an
  adjacent non-safe unoccupied tile; wrapped stepwise.
- havenRaidTick (havenGrowth.js): drafts are
  `sorted.slice(0, raidN)` of the living list, then
  `m.raidBorn = true; m.tx = hx; m.ty = hy` on those
  SAME objects. Defender fights inside the same call
  (resolveWildMonsterEncounter, mFlee branch) can then
  move a drafted monster off Haven. So the stepwise
  raid record is: draft landing (before → haven), then
  each defender-fight move (already wrapped as
  mFleeMove) — never a net before → after record.
- havenGrowthDaily linger re-pin: `m.tx = hx; m.ty = hy`
  on every lingering monster; wrapped.
- resolveWildMonsterEncounter mFlee (game.js, two sites,
  same branch shape): flee to an adjacent non-safe tile;
  wrapped as mFleeMove.
- No canon doc covers Herald arrival/raid drafting:
  docs/CANON.md's manifest lists no titan/raid-arrival
  doc; docs/MONSTER-WAVES.md covers wave gates only.
  Governing sources are the code functions above.
  Nothing here invents canon.

## Stack (named exactly — numbers NEVER compared across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Same stack
family as heraldarr2-a.

New instrument files only (this arm; `heraldarr2follow-a`
prefix; derived from the heraldarr2-a files):
- `scripts/sim-heraldarr2follow-a-sweep.js` — sweep driver +
  sweep-side wrappers. Capture ON = `SIMHERALDARR2FOLLOW=1`.
  Changes from heraldarr2-a, and ONLY these: (1) travelTo
  wrapper pushes a stepwise `followEnter` move event
  (heraldBefore → dest) when the Herald is the tracked
  old monster and the branch is followEnter; (2)
  havenRaidTick wrapper snapshots drafted ENTITY
  REFERENCES pre-call and records `draftedPostList`
  (per-entity: id, preTile, tile, onHaven, raidBorn, hp,
  lingering, stillPresent) read off those references,
  keeping the old by-id `draftedPost` object alongside
  for comparison; (3) havenRaidTick wrapper pushes a
  stepwise `raidPin` move (heraldBefore → haven) when
  the Herald is drafted and heraldBefore ≠ haven, NOT
  a net before → after record (defender-fight moves
  inside the call are the mFleeMove rows). All other
  wrappers UNCHANGED in behavior.
- `scripts/sim-heraldarr2follow-a-lib.js` — heraldarr2-a
  lib UNCHANGED + new pure helpers: `linkChain`
  (order-independent chain linking: repeatedly take an
  unused event whose from == current tile), `splitFollow`
  (decompose a followEnterDidNotLand synth leg into a
  follow-to-dest leg when a same-day primitive move
  starts at dest), `splitRaidNet` (replace a net raidPin
  with a draft-landing leg when the day's raidDraft
  shows draft-moved-off and an mFleeMove runs
  haven → raidPin.to), `reclassifyTravel` (nestedWander
  explanation for a tracked mismatch when a same-day
  primitive move starts at the branch-expected tile and
  ends at heraldAfter).
- `scripts/sim-heraldarr2follow-a-analyze.js` — analyzer.
  Changes from heraldarr2-a, and ONLY these: (1) window
  chains use `linkChain` over primitive moves + synth
  legs, with synth suppressed for any travel already
  covered by a primitive followEnter move (same day,
  same from, same to-dest) and synth legs decomposed
  via `splitFollow`; net raidPin moves split via
  `splitRaidNet` for old-style corpora; (2) spawn moves
  enter a window ONLY via the dawn rule (day == cur.day
  AND herald absent at prev dawn) — the day-range rule
  no longer files a spawn into the following window;
  (3) travel mismatches are reclassified via
  `reclassifyTravel` and reported as raw count,
  nestedWander count (each with its explaining move),
  and unexplained count; (4) draftedPost audit: per
  draft row, draftedPostList raidBorn-false count,
  removed (stillPresent false) count, and by-id
  raidBorn-false rows with duplicate-id proof.
- `scripts/test-sim-heraldarr2follow-a.js` — proof test
  (synthetic cases always; corpus legs when a corpus
  dir + analysis are passed; plus an old-corpus
  re-analysis leg: the new analyzer run over the
  heraldarr2-a pilot dir must attribute the day-120
  window and the day-121 window and reclassify all 11
  pilot mismatches as nestedWander — the old corpus
  proves the analyzer fixes before the new sweep is
  judged on them).

## Band, horizon

Horizon: `DAYS=180`, death-aware — identical to
heraldarr2-a.

Band: the heraldarr2-a LONGEVITY SCREEN is REUSED, not
re-run: the screen selected on survival/won only, never
on any Herald field, and this arm's target seed (95404)
is in it. Pilot = screened qualifiers 1–8:
95401, 95404, 95405, 95408, 95409, 95413, 95415, 95417.
Screen audit trail remains
`evidence/2026-11-01/sim-heraldarr2-a-screen/`
(audit trail for the band choice, NOT judged corpus).

PILOT GATE: 8 pilot seeds with capture ON before ANY
confirm spend.

CONFIRM BAND (pre-stated now, runs ONLY on a live
signal): the screened qualifiers 9–16:
95419, 95421, 95423, 95425, 95428, 95429, 95431, 95434.
Live signal means ALL pilot DIAG-GO bars 1–9 pass
below — the confirm is a REPLICATION of the fixes on
fresh seeds, including the original twin seed 95429
(days 136/163 eulogy rows) and the original spawn-filing
seeds (95419, 95425, 95429). If any pilot bar fails,
NO confirm runs: the instrument is fixed, not
replicated.

## Counting rules (fixed before sims)

- Follow-leg move events: pushed only when the Herald
  IS the old monster on the from-tile AND the branch is
  followEnter AND heraldBefore ≠ dest. The leg's to-tile
  is dest, never heraldAfter. A tracked travel whose
  branch is NOT followEnter pushes no move event: any
  herald move there is a nested move, recorded by its
  own wrapper (wander/mFlee).
- Synth suppression: the analyzer synthesizes NO leg
  for a travel already covered by a primitive followEnter
  move (same day, from == heraldBefore, to == dest).
  For a travel with NO primitive followEnter cover, the
  synth leg is heraldBefore → dest (via `splitFollow`)
  when a same-day primitive move starts at dest, else
  heraldBefore → heraldAfter as in heraldarr2-a.
- Raid stepwise record: draft landing leg
  (heraldBefore → haven) pushed only when the Herald is
  drafted and heraldBefore ≠ haven. A drafted Herald
  already on haven pushes no move (in-place draft, as
  before). A drafted Herald killed/removed inside the
  raid call pushes the landing leg and its removal is
  the removeWorldMonster row.
- DraftedPostList: one entry per drafted ENTITY (not
  per id — two same-id drafted entities give two
  entries). `present` = the reference is still in the
  post-call worldMonsters list. A present entry with
  raidBorn false is an instrument failure (bar 5). A
  non-present entry is a removed-during-raid case, its
  preTile + last tile named, never smoothed into a
  twin claim.
- Twin proof per by-id row: a by-id draftedPost row
  with raidBorn false counts as twin-explained ONLY if
  the drafted id appears ≥2 times in that call's
  pre-call sorted list. Any by-id raidBorn-false row
  with a unique id is an unexplained anomaly and fails
  bar 5.
- Mismatch reclassification: a tracked mismatch counts
  as nestedWander ONLY if a same-day primitive move
  (any kind) starts at the branch-expected tile
  (dest for followEnter, heraldBefore for hold/blocked
  branches) and ends at heraldAfter. Otherwise it stays
  unexplained.
- Spawn filing: a spawn move enters exactly one
  window — the window ending at the dawn whose snapshot
  first shows the spawned tile (day == cur.day AND
  herald absent at prev dawn). A spawn move with
  day == prev.day is NEVER also filed into the window
  starting at that dawn.
- Wall numbers (orientation only, this band/stack):
  won, national, table, wave-4/5 reach, median survival
  — reported if the band produces them, never pooled
  with other bands/stacks. This band is longevity-
  screened (every seed lived past 120 un-won), so its
  numbers must never be trended as representative.

## Pre-registered DIAG-GO bars (judge exactly against this)

DIAG-GO iff ALL of:
1. 8 pilot seeds, each complete (per-seed JSON present,
   capture errors 0, end fields present).
2. 100% of pilot `havenRaidTick` calls classified (zero
   `unknown`); every call with the Herald living at
   entry carries a Herald draft status.
3. 100% of pilot `havenGrowthDaily` calls with the
   Herald lingering at entry carry a linger re-pin
   record (moved / held / drift-cleared; skipped-over
   counted as a record as in heraldarr2-a).
4. Day-120 window attributed on the re-run leg: seed
   95404, window dawn 120 → dawn 121, chain-continuous
   with steps followEnter (4,4)→(4,3), followEnter
   (4,3)→(3,4), wander (3,4)→(3,3) — in link order,
   whatever the raw move-list order is. Any other
   mover for this window, or a still-unattributed
   window, fails this bar.
5. DraftedPost twin lookup corrected: on the pilot,
   draftedPostList has ZERO present entries with
   raidBorn false, AND every by-id draftedPost row
   with raidBorn false is twin-explained (duplicate
   id in the pre-call sorted list). A unique-id
   raidBorn-false row fails this bar.
6. Pilot unattributed windows = 0 after the analyzer
   fixes (old pilot had 4: 95404 d120, 95404 d121,
   95408 d138 spawn, 95413 d170 spawn). Any remaining
   pilot unattributed window fails this bar — it is
   listed, not smoothed, but the bar is 0.
7. Pilot travel mismatches: 0 unexplained after
   reclassification (old pilot had 11; each must
   reclassify as nestedWander with its explaining
   primitive move named).
8. Recorder-neutrality leg: ON vs OFF end fields
   identical (days, gameDays, won, national/table
   flags, maxWave, endScaleRank, endReason) on seed
   95404 (first Herald-drafted pilot seed).
9. Determinism leg: seed 95404 re-run to a scratch dir
   reproduces its judged per-seed JSON except for
   `anchorCommit` (any other field difference is a
   failure).
10. Proof test green: synthetic cases before the pilot
    + synthetic + corpus legs after the pilot (corpus
    legs run against the judged pilot corpus dir, and
    the old-corpus re-analysis leg attributes the old
    pilot's day-120 and day-121 windows and reclassifies
    all 11 old pilot mismatches as nestedWander).
11. Sense-test: the day-120 step, the twin lookup, and
    (if any) remaining windows read for meaning in the
    evidence file (is the step readable as a follow +
    wander beat, or silent machinery?).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base
DIAG census, no before/after comparison exists in this
arm; none fabricated.

## Verdict mapping (fixed now — no re-scoring mid-run)

- DIAG-GO: all bars 1–11 pass. The day-120 step is
  attributed to a named call path (travelTo follow-enter
  + nested wander), the draftedPost twin lookup is
  corrected (reference snapshot) or proven harmless on
  all affected rows, and the pilot's remaining windows
  and mismatches are closed.
- DIAG-NO-GO: any instrument bar fails (short band,
  unclassified raid calls, missing linger records,
  unattributed day-120 window, twin row unexplained,
  capture errors, neutrality/determinism fail, proof
  red). A NO-GO is a measurement failure, not a finding
  about the game.
- INSUFFICIENT-DATA: the day-120 window does not
  reproduce on the re-run leg (seed behavior diverged
  from the old corpus for a reason outside this
  instrument), or no drafted twin row appears on the
  pilot AND the confirm signal fails — the census
  counts stand, but the named target is unproven.
- Mechanism-only finding (reported under every verdict):
  raid calls by class, Herald draft-status counts,
  linger re-pin counts, follow-enter/hold counts, and
  every remaining mismatch or unattributed window —
  these stand even when the verdict is
  INSUFFICIENT-DATA.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) Dawn snapshots miss intra-day position changes —
  the move-event log is the guard; the follow-leg push
  closes the one gap class the v2 wrapper left open
  (follow legs), but any mover outside the wrapped set
  still surfaces as an UNATTRIBUTED window, by design.
(b) The roll-miss inference reads lastRaidDay + drafted
  set + RAID line, not the RNG draw itself — carried
  from heraldarr2-a, unchanged.
(c) The drafted set is recomputed from the pre-call
  sorted list when the raid fires — carried, unchanged;
  the reference snapshot only changes the POST state
  read, never the draft classification.
(d) The screen selects on survival/won only, never on
  any Herald field — but it still selects: screened
  bands must never be pooled with unscreened bands or
  trended as if representative.
(e) This arm reuses the heraldarr2-a band, so its pilot
  counts are judged on their own base, never pooled
  with heraldarr2-a counts — even though the seeds are
  the same, the instrument differs (follow legs and
  stepwise raid pins add move rows by design).
(f) Order-independent chain linking can, in principle,
  link a wrong event pair when two same-day events
  share tiles; the day-120 bar names the exact steps,
  so a wrong link that still ends at (3,3) would have
  to reproduce those exact steps to pass — the bar is
  step-exact, not end-tile-only.
