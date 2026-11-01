# sim-heraldarr2-a — preregistration: HERALD ARRIVAL, RAID-PIN RIVAL, DRAFT-SELECTION WRAP (DIAG ONLY, zero src/js)

Run: fleshout-loop-a-20261101T1742Z (Loop A, axis scale-onramp).
Worker branch: sim-heraldarr2-a. Arm: DIAG ONLY. Zero `src/js`
changes, no gate threshold moved, no policy-default flip, no
routing built (#1538 still pending — this arm attributes an
arrival, it does not build a route). No `[needs-eyes]` (DIAG
instrumentation only; nothing player-facing changes).

## Prior arm (read first, reused not reinvented)

- `evidence/2026-11-01/sim-heraldarr-a.md` +
  `sim-heraldarr-a-prereg.md` (read-only reference) and its v2
  instrument `scripts/sim-heraldarr-a-{sweep,lib,analyze}.js`:
  follow re-entry DOES check `isSafeTile`, so it CANNOT land a
  monster on a safe Haven tile — the (4,4) arrival needs a
  different landing step. Raid pinning (`havenRaidTick` drafting
  the nearest monsters straight onto the Haven tile, no
  safe-tile check, then lingering re-pins) is the named rival,
  still unproven: 0 pin moves on the heraldarr pilot, which was
  censored (5/8 seeds won days 90–100 before the titan window).
- This arm reuses the v2 instrument by derivation (files below,
  `heraldarr2-a` prefix). Changes from v2, and ONLY these:
  (a) the `havenRaidTick` wrapper now records the DRAFT
  SELECTION itself (pre-call gate state + sorted-nearest list +
  predicted raidN + post-call drafted set), so a non-draft is
  distinguishable from a draft-that-missed; (b) the
  `havenGrowthDaily` wrapper now records EVERY lingering
  re-pin application for the Herald (moved, held-in-place, or
  drift-cleared), not only tile-changing pins; (c) two new
  say-needles (`gorge`, drift already covered by `meltback`);
  (d) the band is longevity-screened (below) instead of the
  fixed 95301–95308 band. All other wrappers (travelTo follow
  classification, wander, spawn, remove, contacts, dawns,
  startCombat, say needles) are carried over UNCHANGED in
  behavior; the v2 "no travelTo-diff move events" rule stands.
- The controlled follow leg is NOT re-run: heraldarr-a proved
  follow-enter / follow-hold / follows:false control on this
  stack family, and this arm's question does not touch follow.
  No new controlled game leg is promised for the raid: forcing
  a raid in a synthetic game needs a fabricated 3000+ kcal
  pantry (`pantryKcalLive` recomputes from pantry items) plus
  beating an 18% roll, i.e. scaffolding, not measurement. The
  raid mechanism is proven by code read (below) + corpus draft
  events, and the classification logic is proven synthetically
  in the test file.

## Primary question

Is RAID PINNING the Herald's Haven-tile arrival step? I.e.,
on a band where runs live past the titan window, does a
fully-chained Herald haven-tile arrival window land via
`raidPin` (draft) or `lingerPin` (lingering re-pin) — and,
when the Herald is NOT drafted, is that a gate block, a roll
miss, a rank-beyond-raidN miss, or Herald-absent? Sub-questions,
in order:

1. DRAFT CENSUS: on every `havenRaidTick` call, what gate (if
   any) blocked, or did the roll miss, or did a draft fire —
   and where did the Herald rank among the living nearest?
2. LINGER CENSUS: on every `havenGrowthDaily` call with the
   Herald lingering at entry, was it re-pinned (moved, held,
   or drift-cleared)?
3. ARRIVAL ATTRIBUTION (pilot): every pilot window in which
   the Herald's tile becomes the haven tile — what wrapped
   event lands it there (raidPin, lingerPin, followEnter,
   wander, spawn, mFleeMove, other, or UNATTRIBUTED)?
4. VERDICT: is raid pinning PROVEN / INSUFFICIENT-DATA as the
   Herald arrival path, with the exact draft-status counts?

## Mechanism read before sims (code, not conjecture)

Read in this worktree (function names are the anchors):

- `havenRaidTick` (havenGrowth.js), gates IN CODE ORDER:
  (1) `over` or table active → return false (no new raids
  while the table sits); (2) cooldown: `day - lastRaidDay`
  must reach the overtime-knob cooldown (tier 0 = 7 days);
  (3) living world monsters (`hp > 0`) must number 3+;
  (4) pantry (`pantryKcalLive`) must reach 3000;
  (5) roll: `R() < skip` (tier 0 skip = 0.82) → return false,
  i.e. the raid fires on ~18% of gate-passing calls.
  On fire: `lastRaidDay = day`; monsters sorted by Manhattan
  distance to the Haven tile (village px/py, default 4,4);
  `raidN = min(5, 3 + (pantry > 12000) + (pantry > 24000))`;
  the first raidN are drafted: `raidBorn = true` and
  `tx/ty = haven tile` DIRECTLY, with NO safe-tile check
  and NO occupied-tile check. Defenders then meet drafted
  raiders in order (fights via `resolveWildMonsterEncounter`
  with `{raid: true}`); raiders nobody meets LINGER
  (`lingering = true`, `lingerSince` stamped once).
- `havenGrowthDaily` (havenGrowth.js), lingering loop: EVERY
  lingering living monster is re-pinned `tx/ty = haven tile`
  each dawn, unconditionally, BEFORE the drift valve
  (`day - lingerSince > 6` → `lingering = false` + meltback
  line) and before the gorge (skipped while the table sits).
  A lingering Herald is therefore re-pinned to the Haven tile
  every dawn it lingers, whether or not it moved.
- Consequence (pre-registered, not a verdict): a Herald
  drafted by a raid lands on the Haven tile even though the
  tile reads safe — raid pinning is the ONLY wrapped mover
  with no safe-tile check. A Herald already lingering is
  re-pinned to the Haven tile every dawn. Both classes are
  wrapped here; wander/spawn/mFlee all exclude safe tiles
  (heraldarr-a code read, unchanged).
- No canon doc covers Herald arrival/raid drafting:
  docs/CANON.md's manifest lists no titan/raid-arrival doc;
  docs/MONSTER-WAVES.md covers wave gates only, docs/MAP.md
  covers the Haven tile (village px/py is the authority,
  default 4,4). Governing sources read before sims:
  havenGrowth.js `havenRaidTick` / `havenGrowthDaily` above.
  Nothing here invents canon.

## Stack (named exactly — numbers NEVER compared across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Same stack
family as heraldarr-a (arrival attribution does not need
vet2/muster recorders).

New instrument files only (this arm; sim-heraldarr2-a prefix;
derived from the heraldarr-a v2 files, not copied from any
sibling arm):
- `scripts/sim-heraldarr2-a-sweep.js` — sweep driver +
  sweep-side wrappers (pure observation: call through with
  identical arguments and return values, never mutate game
  state, never draw RNG, never throw into the engine).
  Capture ON = `SIMHERALDARR2=1`; OFF = unset (substrate-only;
  the screen runs and the neutrality leg's OFF side).
- `scripts/sim-heraldarr2-a-lib.js` — shared pure helpers
  (heraldarr-a lib UNCHANGED + `classifyRaidCall` +
  `classifyLingerPin` pure classifiers).
- `scripts/sim-heraldarr2-a-analyze.js` — analyzer
  (per-seed + pooled + arrival attribution + draft/linger
  census + screen counts).
- `scripts/test-sim-heraldarr2-a.js` — proof test
  (synthetic classification cases always; corpus legs when a
  corpus dir is passed).

## Band, horizon, and the LONGEVITY SCREEN (fixed before sims)

Horizon: `DAYS=180`, death-aware — identical to heraldarr-a.

Screen (fixes the heraldarr-a censor: 5/8 seeds won days
90–100, before the titan window): the pilot band is the
first 8 seeds, in scan order, meeting the longevity screen
below. The screen runs SUBSTRATE-ONLY (capture off) over
seeds scanned sequentially from 95401 upward, cap 48 scanned,
collecting up to 16 qualifiers: pilot = qualifiers 1–8,
confirm reserve = qualifiers 9–16. Screen artifacts live in
`evidence/2026-11-01/sim-heraldarr2-a-screen/` (audit trail
for the band choice, NOT judged corpus).

Screen rule (fixed now; selection uses ONLY these fields,
never any Herald field — the screen parser reads seed,
days, gameDays, won, endReason and nothing else):
- Qualifier: `gameDays > 120 AND won == 0` (lived past day
  120 un-won; a seed surviving to the 180 horizon un-won
  qualifies, censored at horizon but past 120).
- A seed that wins on/before day 120, dies on/before day
  120, or wins at any day is NOT a qualifier.
- If fewer than 8 qualifiers appear in 48 scanned seeds,
  the pilot runs on however many qualified (reported as a
  short band, and the pilot-gate bar below judges 8 as
  failed → NO-GO on bar 1, not a quiet smaller pilot).

PILOT GATE: 8 pilot seeds (the screened qualifiers 1–8)
with capture ON before ANY confirm spend.

CONFIRM BAND (pre-stated now, runs ONLY on a live signal):
the screened qualifiers 9–16, same stack, same horizon,
same bars. Live signal means EITHER (a) the pilot shows
>= 1 Herald DRAFTED by a raid (drafted set contains the
Herald on any call), OR (b) the pilot shows >= 1 Herald
haven-tile arrival window that is UNATTRIBUTED or ambiguous.
If the pilot fully attributes a Herald haven arrival (any
landing class), or shows 0 Herald drafts AND 0 arrival
windows, NO confirm runs.

## Counting rules (fixed before sims)

- Raid-call pre-state (recorded on EVERY `havenRaidTick`
  call): day, over flag, tableActive, lastRaidDay, cooldown
  (overtime knobs or 7), living monsters (id, tile, hp,
  Manhattan distance to haven), pantry kcal, haven tile,
  sorted order (stable sort by distance, as the code sorts),
  predicted raidN from pantry, Herald entry (present?,
  tile, distance, rank, tie flag if another living monster
  shares its distance).
- Raid-call classification (pure, code order — first failing
  gate wins; post-state: lastRaidDay, drafted set, RAID say
  line presence):
  - `blocked-over`: over true at entry.
  - `blocked-table`: table active at entry.
  - `blocked-cooldown`: day - lastRaidDay < cooldown.
  - `blocked-few`: living monsters < 3.
  - `blocked-pantry`: pantry < 3000.
  - `roll-miss`: all gates pass, lastRaidDay unchanged, no
    drafted monster, no RAID line.
  - `draft`: lastRaidDay changed to day (raid fired);
    drafted set = first raidN of the pre-call sorted living
    list. Each drafted monster's post state is recorded
    (tile, raidBorn, hp, lingering); a drafted monster NOT
    on the haven tile post-call is flagged `draft-moved-off`
    (defender fight inside the same call can move it — the
    nested resolve wrapper's mFlee events are the check).
  - `unknown`: anything else (e.g. gates pass but
    lastRaidDay changed with no drafted set, or a gate read
    failed). `unknown` on ANY pilot call FAILS bar 2.
- Herald draft status per raid call (recorded whenever the
  Herald is a living world monster at entry):
  - `drafted`: Herald in the drafted set.
  - `rank-missed`: call class `draft`, Herald rank >= raidN
    (sorted nearest but beyond the draft cut — the
    draft-that-missed case).
  - `gate-or-roll`: call class is a block or `roll-miss`
    (non-draft, with the reason named by the class).
  - `absent`: Herald not a living world monster at entry
    (recorded separately — absent is NOT a miss).
- Linger re-pin record (on EVERY `havenGrowthDaily` call
  where the Herald is lingering at entry): entry tile,
  lingerSince, day; outcome class:
  - `repin-moved`: post tile == haven, entry tile != haven.
  - `repin-held`: post tile == haven, entry tile == haven
    (re-pinned in place — the v1 wrapper missed this class).
  - `repin-drift-cleared`: lingering cleared by the >6-night
    valve during this call (post tile stays haven, post
    lingering false).
  - `repin-table-gorge-skipped`: table active (pin applied,
    gorge skipped) — combined with moved/held as a flag, not
    a separate class, so the pin class is never hidden.
  A `lingerPin` move event is pushed only when the tile
  changes (moved class); held/drift classes live in the
  lingerPins record, which the analyzer pools. A
  `havenGrowthDaily` call with the Herald lingering at entry
  and NO lingerPins record FAILS bar 3.
- Move events: heraldarr-a v2 rules unchanged (travelTo
  wrapper pushes NO move events; follow legs synthesized by
  the analyzer; raidPin/lingerPin pushed only on tile
  change; spawn/wander/mFlee as v2). Drafts that land the
  Herald on a tile it already occupies (already on haven)
  produce no move event — the raidDrafts record, not the
  move list, is their evidence.
- Haven-tile arrival window, attribution chain, contact,
  located, and screen-count definitions: heraldarr-a prereg
  UNCHANGED (contact is NOT a gate on this arm — raid
  pinning needs no contact; the gate here is arrival-window
  presence, see the verdict mapping).
- Screen counts (reported whatever the verdict does): pool
  size (8), screen scanned/qualified counts, seeds won,
  seeds surviving un-won past day 120, located seeds,
  located-but-unfaced seeds (+ windows), contacted seeds
  (+ contacts per channel), never-located seeds,
  haven-tile arrival windows (count + landing classes),
  raid calls by class, Herald draft status counts
  (drafted / rank-missed / gate-or-roll by class / absent),
  linger re-pins by class.
- Wall numbers (orientation only, this band/stack): won,
  nationalEver/Final, table, wave-4/5 reach, median
  survival — reported if the band produces them, never
  pooled with other bands/stacks.

## Pre-registered DIAG-GO bars (judge exactly against this)

DIAG-GO (raid-pin finding) iff ALL of:
1. 8 pilot seeds, each complete (per-seed JSON present,
   capture errors 0, end fields present). A short screened
   band fails this bar.
2. 100% of pilot `havenRaidTick` calls classified (zero
   `unknown`); every call with the Herald living at entry
   carries a Herald draft status (drafted / rank-missed /
   gate-or-roll / absent — absent only when the Herald is
   not a living world monster at entry).
3. 100% of pilot `havenGrowthDaily` calls with the Herald
   lingering at entry carry a linger re-pin record
   (moved / held / drift-cleared).
4. Every herald tile change on the pilot is recorded as a
   move event, OR the uncovered inter-dawn windows are
   listed as UNATTRIBUTED — an UNATTRIBUTED window blocks
   a PROVEN verdict for that arrival, it does not fail
   the instrument bar.
5. Every pilot haven-tile arrival window is listed with
   its chain + landing class (0 such windows is a reported
   zero, not a bar failure).
6. Recorder-neutrality leg: ON vs OFF end fields identical
   (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 1 pilot seed — choice rule
   fixed now: FIRST Herald-drafted pilot seed if any, else
   first located pilot seed, else first pilot seed (the
   instrument must not move the run).
7. Determinism leg: one judged seed re-run to a scratch
   dir reproduces its judged per-seed JSON except for
   `anchorCommit` (any other field difference is a failure).
8. Proof test green: synthetic cases before the pilot +
   synthetic + corpus legs after the pilot (the corpus
   legs run against the judged corpus dir).
9. Sense-test: raid-draft, linger re-pin, and (if any)
   haven-arrival beats read for meaning in the evidence
   file (is the arrival readable to a player, or silent
   machinery?).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base
DIAG census, no before/after comparison exists in this
arm; none fabricated.

## Verdict mapping (fixed now — no re-scoring mid-run)

- DIAG-GO (raid pinning PROVEN as the Herald arrival path):
  a pilot haven-tile arrival window whose chain's LANDING
  STEP is raidPin or lingerPin, with no UNATTRIBUTED gap in
  that window. (If the record shows a raidPin landing on a
  tile that read safe at that moment, that is the expected
  raid behavior — no safe-tile check — not a contradiction.)
- INSUFFICIENT-DATA: no Herald haven-tile arrival window
  on the pilot, OR the arrival window's chain is
  UNATTRIBUTED/broken — even when the draft/linger census
  itself is complete. The census counts stand as the
  mechanism finding under this verdict.
- NO-GO: any instrument bar fails (short band, unclassified
  raid calls, missing linger re-pin records, capture
  errors, neutrality/determinism fail, proof red). A NO-GO
  is a measurement failure, not a finding about the game.
- Mechanism-only finding (reported under every verdict):
  raid calls by class, Herald draft-status counts, linger
  re-pin counts, follow-enter/hold counts carried from v2,
  and every mismatch — these stand even when the arrival
  verdict is INSUFFICIENT-DATA.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) Dawn snapshots miss intra-day position changes — the
move-event log is the guard, as on heraldarr-a; a move
through an UNWRAPPED path surfaces as an UNATTRIBUTED
window, by design. (b) The roll-miss inference reads
lastRaidDay + drafted set + RAID line, not the RNG draw
itself — a gate-passing call with no raid is a roll miss
by elimination (all other gates are read live). (c) The
drafted set is recomputed from the pre-call sorted list
when the raid fires, because the code mutates tx/ty in
place and defender fights inside the same call can move a
drafted monster off the haven tile before the wrapper's
after-state; `draft-moved-off` flags exactly that case.
(d) The screen selects on survival/won only, never on any
Herald field — but it still selects: screened bands must
never be pooled with unscreened bands or trended as if
representative. (e) This worktree's base differs from
heraldarr-a's anchor (rebased ff to 7f327aed5 before this
prereg — Loop B evidence + multisweep tooling, no game
change to this stack), so counts are judged on their own
base, never pooled with heraldarr-a.
