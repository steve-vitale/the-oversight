# sim-heraldarr-a — preregistration: HERALD ARRIVAL PATH, WRAPPED PROOF OF THE FOLLOW RE-ENTRY CANDIDATE (DIAG ONLY, zero src/js)

Run: fleshout-loop-a-20261101T1706Z (Loop A, axis scale-onramp).
Worker branch: sim-heraldarr-a. Arm: DIAG ONLY. Zero `src/js`
changes, no gate threshold moved, no policy-default flip, no
routing built (#1538 still pending — this arm attributes an
arrival, it does not build a route). No `[needs-eyes]` (DIAG
instrumentation only; nothing player-facing changes).

## Backlog grounding (read before sims)

- 1415Z Loop A round (evidence/2026-11-01/sim-scale-onramp-round-1415.md):
  the 1415Z next blank (4) is this arm — Herald arrival path:
  wrapped proof of the follow re-entry candidate.
- sim-heraldplace-a (evidence/2026-11-01/sim-heraldplace-a.md + prereg,
  read-only reference, NOT copied): decomposed Herald placement vs
  wandering — lair rule (+3 east, nearest free tile), symmetric
  random walk (approach == retreat), no steering, shared-tile
  contact requirement. Its one contacted seed (95304) shows the
  Herald on the Haven tile (4,4) at dawns 160–168 with ZERO wander
  steps into (4,4) in the corpus, and named follow re-entry as the
  arrival candidate WITHOUT wrapping it. This arm wraps it.
- #1546 / #1591 (answered): a muster only exists when somebody
  presses 'Sound the call'; muster is structurally zero unless
  somebody presses it. This arm does not re-measure muster.
- #1538 steve-call (route on refused face? re-sound after a lost
  muster-fight?) is STILL PENDING. This arm does NOT answer it
  and does NOT build routing.

## Primary question

Can a villager who has followed a Herald re-enter / arrive via
the follow path — and, precisely, what moved the Herald onto
the Haven tile (4,4) on heraldplace seed 95304 (dawn 159: (6,4)
-> dawn 160: (4,4))? Sub-questions, in order:

1. FOLLOW MECHANICS (controlled + pilot): when the scholar
   leaves a tile carrying a monster, does the follow branch
   fire for the Herald, onto what tiles, and with what lines?
   What are the exact conditions (follows flag value, occupied
   destination, safe destination)?
2. ARRIVAL ATTRIBUTION (pilot): every pilot window in which
   the Herald's tile becomes the haven tile — what wrapped
   event lands it there (follow-enter, raid-pin, linger-pin,
   wander, spawn, mFlee-move, other, or UNATTRIBUTED)?
3. VERDICT: is follow re-entry PROVEN / REFUTED /
   INSUFFICIENT-DATA as the Herald arrival path, with the
   exact condition list?

## Mechanism read before sims (code, not conjecture) + TWO CORRECTIONS to the 1415Z phrasing

Read in this worktree (line numbers drift; function names are
the anchors):

- Follow re-entry lives in `travelTo` (game.js, `travelTo`
  function): when the scholar crosses a map-tile boundary,
  `oldMonster = monsterAt(fromX, fromY)`; if
  `mdef.follows` is truthy, the monster chases through the
  boundary into the NEW tile's detail grid at the entry edge.
- CORRECTION A — the 1415Z phrase "the only code path that
  moves a monster onto the scholar's new tile without a
  safe-tile check" is INCORRECT as a description of the
  follow branch on current code. The follow branch checks
  BOTH guards, in this order: (1) if a monster already sits
  on the destination tile, the follower "stops at the
  boundary"; (2) if `isSafeTile(dest)` is true, it "stops
  at the treeline" and does NOT move. Follow therefore
  CANNOT deliver a monster onto a tile that reads safe at
  that moment. (Haven tiles read safe: `isSafeTile`
  returns true when `tileAt(x,y).type === 'haven'`, plus
  other-village tiles.)
- CORRECTION B — the Herald's `follows` field
  (src/data/monsters.json, herald entry) is the STRING
  "it does not follow. It precedes." — which is TRUTHY in
  JavaScript. The fiction says the Herald does not follow;
  the code treats the string as follows=true, so the follow
  branch FIRES for the Herald. The controlled leg reads the
  def value verbatim and records the branch outcome, so
  this is measured, not asserted.
- CONSEQUENCE (pre-registered, not a verdict): on current
  code, follow re-entry cannot be the (4,4) arrival unless
  (4,4) did not read safe at that moment or the arrival
  tile was not the haven tile. The pilot must therefore
  attribute the arrival from wrapped events, not assume
  follow. The live RIVAL candidate, read from code before
  sims, is RAID PINNING: `havenRaidTick` (havenGrowth.js)
  drafts the NEAREST living world monsters (3 base, +1
  above 12k kcal, +1 above 24k, cap 5; requires 3+ monsters,
  3,000+ pantry kcal, 7-day cooldown, ~18% roll) and sets
  `m.tx/m.ty` to the Haven tile directly, with NO safe-tile
  check; raiders nobody meets then LINGER there, re-pinned
  to the Haven tile every dawn by `havenGrowthDaily`, until
  the ~6-night drift valve clears them. A Herald sitting
  2 tiles from Haven is a nearest-monster draft candidate.
  Other wrapped movers: `wanderWorldMonsters` (excludes
  safe + occupied tiles, orthogonal steps only),
  `spawnWorldMonster` (titanPlace excludes safe tiles),
  `removeWorldMonster`, villager-fight mFlee moves
  (8-direction adjacent step, excludes safe tiles),
  `playerMonster` adoption (only for tx-less debug objects;
  a world monster keeps its tx/ty and is never re-adopted).
- No canon doc covers Herald arrival/follow mechanics:
  docs/CANON.md's manifest lists no titan/muster doc, and
  docs/MONSTER-WAVES.md covers wave gates only. Governing
  sources read before sims: src/js/titans.js's header and
  the movement functions cited above. Nothing here invents
  canon; the mechanism is transcribed from those functions
  and then measured.

## Stack (named exactly — numbers NEVER compared across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) — the
titangate / sim-muster-a / sim-heraldplace-a stack family.
Recorders, all REUSED UNMODIFIED (shared repo policies,
not sibling-arm files): `fullseat-diag`, `wavegate-diag`
(end fields + wave only). Deliberate difference from
heraldplace: vet2-diag / vet2mfg-diag / muster-diag are
OMITTED — arrival attribution does not need veteran or
muster counters, and fewer wrappers means fewer
interference surfaces. End fields and wave reach are the
only cross-arm orientation numbers, never pooled.

New instrument files only (this arm; sim-heraldarr-a prefix;
written from scratch, not copied from the sibling sweep):
- `scripts/sim-heraldarr-a-sweep.js` — sweep driver +
  sweep-side wrappers (pure observation: call through with
  identical arguments and return values, never mutate game
  state, never draw RNG, never throw into the engine).
- `scripts/sim-heraldarr-a-lib.js` — shared pure helpers
  (tile keys, Manhattan/Chebyshev, branch classification).
- `scripts/sim-heraldarr-a-analyze.js` — analyzer
  (per-seed + pooled + arrival attribution + screen counts).
- `scripts/sim-heraldarr-a-controlled.js` — controlled
  scenario driver (follow-enter / follow-hold /
  follows:false control, synthetic game, not a seed sim).
- `scripts/test-sim-heraldarr-a.js` — proof test
  (synthetic classification cases always; corpus legs when
  a corpus dir is passed).

## Band, horizon, and the CONTACT-GATED pilot (fixed before sims)

Band (pilot): 8 seeds 95301–95308 — the SAME band as
heraldplace, FIXED here before sims. Justification: this
is the only band with a known contacted seed (95304) AND
located-but-unfaced contrast seeds on the same stack
family, so the (4,4) episode is the pilot's target, not a
hope. This is not band-shopping: the band is chosen
because the episode to attribute lives on it.

Horizon: `DAYS=180`, death-aware — identical to heraldplace.

CONTACT GATE (heraldplace approach reused): the pilot
passes iff >= 1 pilot seed records a Herald CONTACT on
this instrument (scholar `startCombat` with mid 'herald',
OR villager `resolveWildMonsterEncounter` with a herald
monster). Omen stage alone does NOT pass the gate.
- If the gate passes: analyze all 8 pilot seeds and
  attribute every haven-tile arrival window. No confirm
  band is pre-authorized EXCEPT the one below.
- If the gate fails (0 contacts on all 8 pilot seeds):
  verdict INSUFFICIENT-DATA for the contact-dependent
  arrival question. Report the screen counts and the
  mechanism classification (controlled leg + any pilot
  follow events) and STOP — do not burn a confirm band on
  a contact-free base.

CONFIRM BAND (pre-stated now, runs ONLY on a live signal):
seeds 95309–95316 (second half of the vet2mfg/titangate
band), same stack, same horizon, same bars. Live signal
means EITHER (a) the pilot shows >= 1 follow-enter event
for the Herald AND the (4,4) arrival is unattributed or
ambiguous, OR (b) the pilot shows >= 1 contacted seed but
NO (4,4)-arrival window at all (episodes exist on this
base; a wider band may catch one). If the pilot fully
attributes a (4,4) arrival, or shows no contacted seed,
NO confirm runs.

## Counting rules (fixed before sims)

- Contact (scholar): one `startCombat` call with mid
  'herald'. Outcome subclass: fought (non-null return),
  refused (null return + titan outcomes 'refused' record),
  other.
- Contact (villager): one `resolveWildMonsterEncounter`
  call whose monster id is 'herald'.
- Contacted seed: >= 1 contact of either channel.
- Located seed: herald omen stage >= 2 at any time AND/OR
  a herald spawn event (a disagreement is reported, not
  smoothed).
- Haven-tile arrival window: any dawn-to-dawn interval in
  which the herald tile becomes the haven tile
  (village px,py, default 4,4) — including a dawn snapshot
  whose herald tile equals the haven tile after a previous
  dawn whose herald tile did not.
- Move event: any wrapped call after which the herald's
  (tx,ty) differs from before the call, classified by the
  wrapper: spawn, wander, followEnter, raidPin, lingerPin,
  mFleeMove, remove (departure, not a move), other (a diff
  inside a wrapped call with no branch claiming it — the
  wrapper name is recorded).
- TravelTo branch classification (predicted from
  before-state + destination, then checked against the
  actual after-tile; a mismatch is listed, never smoothed):
  - noTravel: scholar tile unchanged after the call
    (refused/blocked travel).
  - noOldMonster: no monster on the from-tile.
  - oldMonsterNotFollows: monster on the from-tile whose
    def `follows` is falsy.
  - followBlockedOccupied: follows truthy AND a monster
    already on the destination tile (expect: herald stays).
  - followHoldSafe: follows truthy, destination empty,
    `isSafeTile(dest)` true (expect: herald stays +
    treeline line).
  - followEnter: follows truthy, destination empty,
    destination not safe (expect: herald tile == dest +
    'It followed you' line).
  - MISMATCH (any predicted class whose actual after-tile
    contradicts the expectation) — recorded with the full
    before/after tiles and the say-sequence lines spoken
    during the call.
- Attribution chain (per inter-dawn window): collect the
  move events in that window in order; the window is
  ATTRIBUTED iff the chain is continuous (first event's
  from == dawn-N tile, each next event's from == previous
  event's to, last event's to == dawn-(N+1) tile). Otherwise
  the window is UNATTRIBUTED (from/to + events present are
  listed). A (4,4)-arrival window's LANDING STEP is the
  chain event whose `to` equals the haven tile.
- Screen counts (reported whatever the gate does): pool
  size (8), seeds won (and won exactly day 90), seeds
  surviving un-won past day 120, located seeds,
  located-but-unfaced seeds (+ windows), contacted seeds
  (+ contacts per channel), never-located seeds,
  haven-tile arrival windows (count + landing classes).
- Wall numbers (orientation only, this band/stack): won,
  nationalEver/Final, table, wave-4/5 reach, median
  survival — reported if the band produces them, never
  pooled with other bands/stacks.

## Controlled leg (synthetic game, not a seed sim)

Fresh game via the shared harness, seed fixed in the
driver (1): place the scholar on a tile, spawn a herald
on the scholar's tile, then:
  (a) `travelTo` an adjacent non-safe, unoccupied tile ->
      expect followEnter (herald tile == dest, 'It followed
      you' line present);
  (b) from there, `travelTo` the Haven tile (4,4) ->
      expect followHoldSafe (herald unchanged, treeline
      line present);
  (c) control: spawn a follows:false monster on the
      scholar's tile, `travelTo` adjacent -> expect the
      monster unchanged (stays on the old tile).
The driver records the herald def's `follows` value
verbatim. A travel refusal/blockage on any step retries
with another adjacent destination once, then reports the
step as BLOCKED (not as a pass or a fail of the branch).

## Pre-registered DIAG-GO bars (judge exactly against this)

DIAG-GO (arrival finding) iff ALL of:
1. 8 pilot seeds, each complete (per-seed JSON present,
   capture errors 0, end fields present).
2. Contact gate judged as written above — if it fails,
   the verdict is INSUFFICIENT-DATA for contact-dependent
   attribution, NOT a failed DIAG-GO, and no confirm runs
   (except the pre-stated live-signal band, which also
   requires a contacted seed).
3. Follow-event classification on 100% of pilot travelTo
   calls where a monster sat on the from-tile (every such
   call carries a predicted branch + actual after-tile;
   mismatches listed, never smoothed).
4. Every herald tile change on the pilot is recorded as a
   move event, OR the uncovered inter-dawn windows are
   listed as UNATTRIBUTED — an UNATTRIBUTED window blocks
   a PROVEN verdict for that arrival, it does not fail the
   instrument bar.
5. Every pilot haven-tile arrival window is listed with
   its chain + landing class (0 such windows is a reported
   zero, not a bar failure).
6. Controlled leg green: follow-enter observed, follow-
   hold observed, follows:false control stays (BLOCKED
   steps reported, not counted as passes).
7. Recorder-neutrality leg: ON vs OFF end fields identical
   (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 1 pilot seed — the FIRST
   contacted seed if any, else 95304 (choice rule fixed
   now; the instrument must not move the run).
8. Determinism leg: one judged seed re-run to a scratch
   dir reproduces its judged per-seed JSON except for
   `anchorCommit` (which records the commit and may
   legitimately change if a commit lands between runs —
   any other field difference is a failure).
9. Proof test green: synthetic cases before the pilot +
   synthetic + corpus legs after the pilot (the corpus
   legs run against the judged corpus dir).
10. Sense-test: follow-enter, follow-hold, and (if any)
    haven-arrival beats read for meaning in the evidence
    file (is the arrival readable to a player, or silent
    machinery?).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base
DIAG census, no before/after comparison exists in this
arm; none fabricated.

## Verdict mapping (fixed now — no re-scoring mid-run)

- PROVEN (follow re-entry IS the Herald arrival path): a
  pilot haven-tile arrival window whose chain's LANDING
  STEP is followEnter, with no UNATTRIBUTED gap in that
  window, AND the controlled leg confirms follow-enter
  mechanics. (If the record shows followEnter landing on a
  tile that read safe at that moment, that is a code
  contradiction to report loudly, not a PROVEN.)
- REFUTED (follow re-entry is NOT the arrival path): a
  pilot haven-tile arrival window fully chained whose
  LANDING STEP is not followEnter (e.g. raidPin or
  lingerPin), OR controlled + pilot evidence jointly
  showing followEnter cannot land on a safe tile while a
  haven arrival is fully chained via another class. The
  verdict names the proven landing class for that episode.
- INSUFFICIENT-DATA: contact gate fails, OR no
  haven-tile arrival window on the pilot, OR the arrival
  window's chain is UNATTRIBUTED/broken.
- Mechanism-only finding (reported under every verdict):
  follow-enter/hold/blocked counts, the follows-truthy-
  string note, and every mismatch — these stand even when
  the arrival verdict is INSUFFICIENT-DATA.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) Dawn snapshots miss intra-day position changes — the
move-event log (before/after per wrapped call) is the
guard: any intra-day move through a wrapped path is a move
event even if the dawn tile is unchanged; a move through
an UNWRAPPED path surfaces as an UNATTRIBUTED window, by
design. (b) The wrapper set covers the code-read movers
(travelTo, wander, spawn, remove, havenRaidTick,
havenGrowthDaily, villager-fight mFlee); any other mover
is unknown until an UNATTRIBUTED window names it — that
is a finding, not a gap to paper over. (c) This worktree's
base differs from heraldplace's anchor commit, so the
95304 episode may not replay identically; the pilot is
judged on its own events, never by matching heraldplace's
corpus. (d) The controlled leg uses direct tile placement
for setup (not a travel path) — setup placement is test
scaffolding, and only the travelTo calls are judged.
