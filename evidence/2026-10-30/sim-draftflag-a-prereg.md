# sim-draftflag-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1015Z, worker sim-draftflag-a.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Ranked-next #2/#5 from run fleshout-20261030T0855Z
(evidence/2026-10-30/sim-scale-onramp-round-0855.md) and stalkertick
ranked-next #2: the DRAFT / SIEGE-FLAG LIFECYCLE RECORDER.

DIAG ONLY, measurement only, zero src/js game changes, no default
flip, no gate move, no deed-bar move. No [needs-eyes]: this arm
changes no feel, combat, or UI — it only records.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md — Wave 4: The Mirror Draft
(standing >= 100 gate; bands damage 35-95, HP 850-1500; a 4-6 round
fight for a godhood build). NO CANON-registered doc covers a siege
draft or a palisade toll specifically — the mechanism below is read
from code (src/js/havenGrowth.js havenRaidTick, never invented),
stated exactly so it can be checked, and is NOT canon.

## Mechanism, read from code (havenGrowth.js havenRaidTick)

- havenRaidTick runs from the progDaily wrap (i.e. every endDay).
  It returns early unless: village alive, table not sitting, >= 7
  days since last raid (overtime-adjusted), >= 3 living world
  monsters, pantry >= 3000 kcal, and the ~18% roll passes.
- On a raid: v.lastRaidDay = day; palisade = havenTier() >= 2;
  haven tile (hx, hy) = village (px, py), default (4, 4); raiders =
  the raidN nearest living world monsters to the haven tile
  (3 base, +1 above 12k pantry kcal, +1 above 24k, cap 5).
- Per raider, in one loop: m.raidBorn = true; m.tx = hx, m.ty = hy;
  IF palisade: wall = round(maxHp * 0.25); m.hp = max(1, hp - wall).
  The toll is charged on maxHp, not current hp.
- Lingering flips false→true in the SAME function, later, for
  raiders nobody meets (the defenders loop: no defender left, or
  the pendingEncounter collision branch). raidBorn is set ONLY in
  this function (grep: the sole `raidBorn =` in src/js).
  havenGrowthDaily re-pins already-lingering raiders to the haven
  tile each dawn and clears lingering after ~6 nights (the drift
  valve); it never sets lingering true.
- Consequence for instrumentation: wrapping havenRaidTick with a
  before/after world-monster diff captures the draft, the toll,
  and the lingering flip in ONE recorded call, with the call's
  day + a per-seed monotonic sequence stamp. No other hook is
  needed for the draft step. If a draft step ever fired outside
  havenRaidTick, this recorder would miss it — the analyzer
  checks that by comparing draft events against census
  lingering-flip + toll-shaped-drop transitions (any census
  transition with no matching draft event is reported as
  UNEXPLAINED-TRANSITION, never papered over).

## Band and substrate (binding, verbatim from the assignment)

- Seeds 75101-75116 (16), 180d death-aware horizon (dead villages
  stop, +10d tail max).
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1.
- Recorder stack, reused verbatim, never edited: fieldparty-form-diag,
  w4dpr-diag, breakline-diag, tilejoin-diag, shoutrec-diag,
  joinendlines-diag (the chainclose stack) PLUS scholarmelt-diag
  PLUS removal-diag, PLUS the new draftflag-diag (record-only,
  DRAFTFLAG=1). The enriched removal census (uid, wave, maxHp,
  veteran, lingering, titan, stance, lostSight, mx, my) is written
  to census-s<seed>.json beside (never inside) the row, exactly as
  in the removal sweep.
- New code, this arm only: scripts/policies/draftflag-diag.js
  (record-only havenRaidTick + tbEnd wraps), scripts/sweep-draftflag-a.js
  (verbatim copy of scripts/sweep-removal-a.js + the scholarmelt
  recorder install/field from scripts/sweep-scholarmelt-a.js +
  the draftflag recorder install/field, disclosed deltas only),
  scripts/analyze-draftflag-a.js (pure analyzer: reads corpus JSON,
  never touches game state), scripts/test-draftflag-a.js (fixtures
  + determinism + substrate-identity legs).

## Targets (re-derived from the committed corpus, never from memory)

Target 1 — s75116 suburb, uid 29 (removal corpus):
spawned d140 (1300/1300) at (6,4), lingering false; met d140
(1300→1285); census d141-158 at 1285, lingering false, roaming
tiles; removal d159 hp 960, tile (4,4), lingering true, uid 29.
Inferred (removal-a) bridge: draft between the d158 census and
the d159 removal, toll 325 = round(1300 x 0.25), tile → (4,4),
lingering false→true, then scholar fightSeq 23 (d159, lift 960,
lost, no restore). The draft event itself was NEVER recorded.

Target 2 — s75116 audit, uid 28 (removal corpus):
spawned d132 (1100/1100) at (3,4), lingering false; first census
d133 at 825, tile (4,4), lingering true; censused d133-139 at 825
(lingering true d133-138, false d139); met d139 (825→785);
removal d140 hp 785, tile (4,4), uid 28 (scholarmelt fightSeq 21).
Inferred bridge: draft between the d132 spawn and the d133
census, toll 275 = round(1100 x 0.25), tile → (4,4),
lingering false→true. Its draft day was never datable from the
old corpus (no census day shows the pre-draft state after spawn
except the spawn row itself).

Both targets are judged on THIS run's own re-run corpus (same
seeds, deterministic substrate): the draft event for each uid
must appear in the new draftflag events, or the target is
UNMEASURED with the named missing hook (see verdict rule).

## Recorder design (record-only, DRAFTFLAG=1)

- havenRaidTick wrap: BEFORE delegating, snapshot every living
  world monster (uid via the removal store's shared uidFn, so
  draft uids == census uids == removal uids; id, hp, maxHp, tx,
  ty, lingering, raidBorn) plus palisade (havenTier() >= 2),
  haven tile, lastRaidDay, pantry kcal, and living-monster count.
  AFTER delegating, snapshot again and diff per uid. One `raid`
  event is recorded per FIRED call only (return true): day
  (scholar.day at call time), per-seed monotonic seq, palisade,
  haven tile, lastRaidDay before/after, and per-raider draft rows
  (uid, id, wave, hp/maxHp before/after, toll = before - after,
  tollExpected = round(maxHp * 0.25), tollExact bool, tile
  before/after, lingering before/after, raidBorn before/after).
  Unfired calls are counted only (calls, fired, earlyReturn) in
  the diag block — recording every ~180/day no-op call per seed
  would bloat rows with no judged content. The fired-only rule
  is safe because a draft can only happen inside a fired call
  (the draft loop is after every early return).
- Within-day sequence stamps: seq is a single per-seed counter
  shared by raid events and tbEnd events, so any two draftflag
  events order totally within a seed; day is scholar.day at the
  call. "Day/part window" for a draft verdict = the draft
  event's day + seq, bracketed by the census snapshots that
  show the pre-draft state (last census day with the old
  tile/hp/lingering) and the post-draft state (first census day
  with the new tile/hp/lingering). The raid path stamps no
  day-part field, and none is invented: if the draft day's
  census snapshot already shows the drafted state, the verdict
  says so (draft fired in that day's endDay, before the next
  census) rather than naming a part.
- tbEnd wrap (SECONDARY leg only): BEFORE delegating, if
  tbfight.worldOrigin exists, record origin (uid, id, hp, maxHp,
  tx, ty, lingering, titan), the guard inputs exactly as tbEnd
  reads them — worldMonsters().indexOf(origin) and
  monsterAt(origin.tx, origin.ty) (occupant uid/id/hp or null)
  — plus result arg, day, seq. AFTER delegating, record
  originInWorld (restored or not). tbEnd calls with no
  worldOrigin are counted only. This leg answers removal-a's
  open question (why fightSeq 23 was not restored) and is
  reported as secondary, never allowed to dilute the primary
  draft verdicts.
- Neutrality: wraps record AFTER delegating where state is
  read (raid diff) and BEFORE+AFTER for tbEnd guard inputs;
  they write nothing to game state (store arrays + the shared
  uid WeakMap only), draw no RNG, never throw into the engine
  (recording errors counted; an engine throw is recorded and
  RETHROWN unchanged), return the original value untouched.
  Stack frames are recorded on raid events (caller chain
  proves the progDaily/endDay path).
- UNMEASURED honesty: if a draft step has no hook, the analyzer
  reports that step UNMEASURED and names the missing hook —
  it never infers a timestamp from endpoints. Concretely: the
  draft loop's per-raider mutations are NOT individually
  hooked (one wrap covers the whole loop); the per-raider
  order inside a single raid call is therefore UNMEASURED
  (all raiders in one call share the call's day + seq), and
  the verdict granularity is per-call, not per-raider-step.
  That granularity is sufficient for both targets (each target
  is a single-raider question: which raid call drafted it).

## Primary metrics (binding)

- PRIMARY: direct draft dating for BOTH target drafts. For each
  target uid, the analyzer must find a draftflag raid event
  whose draft row carries that uid with tile → haven tile,
  lingering false→true (or already-true with raidBorn
  false→true), and hp drop equal to round(maxHp x 0.25) when
  palisade is true — or report the target UNMEASURED with the
  named missing hook. A toll-shaped census transition with no
  matching draft event is UNEXPLAINED-TRANSITION, not a draft.
- PALISADE/TOLL CONDITION: for each target, the recorded
  palisade flag + havenTier-derived expectation must confirm
  or refute the toll from recorded state (palisade true and
  toll == round(maxHp x 0.25) confirms; palisade false with a
  toll-shaped drop refutes the palisade story and must be
  reported as a refutation, not smoothed over). The condition
  is judged from the event's recorded fields, never inferred
  from endpoints.
- BAND-WIDE (counts, not just the two targets): (a) how many
  wild wave-4 instances flip lingering false→true mid-life
  (census transitions + draft events, uid-counted, both
  numbers reported); (b) how many census HP drops match the
  toll shape exactly (drop == round(maxHp x 0.25) with a
  haven-tile move, uid-counted) and how many of those have a
  matching draft event. Wild = wave 4, not a titan, not
  lingering AT THE FATE OBSERVATION (stalkertick correction
  #1 definition, carried verbatim).
- SECONDARY (reported separately, never judged with the
  primary): tbEnd origin-tile occupancy for the fightSeq 23
  match (origin uid 29, day 159): occupied (with occupant) or
  unoccupied at tbEnd, and whether the origin was restored.
  If no tbEnd event matches, the secondary leg is UNMEASURED
  with the reason stated.

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS required.
- Pilot gate (before the full 16-seed sweep): fixtures green
  + 1-seed determinism + substrate identity on the pilot seed.
  A failed pilot gate stops the run (no judged sweep on a
  broken instrument).
- Seeds: 16/16 valid (days > 0, all recorder errs 0, overflow
  empty, census present/sorted/within-1 on all 16).
- Substrate: every row minus the additive fields (draftflag,
  scholarmelt, removal) byte-identical to chainclose's corpus
  rows. (Chainclose rows carry none of the three fields; the
  comparison strips all three from this run's rows.)
- Targets: each target draft dated to a day + seq + bracketing
  censuses, or honestly UNMEASURED with the named missing
  hook. UNMEASURED on either target is DIAG-NO-GO for the
  primary metric (the instrument exists to date them).
- Determinism: seed 75102 re-run into a scratch EVID dir; its
  row JSON byte-identical AND its census JSON byte-identical
  to the corpus; scratch removed after the diff.
- Sense: the judged chains' villager logs + matched scholar
  traces + draft events read end to end (suburb chain, audit
  chain, and the d158-159 / d132-133 windows). Judgment is
  meaning/coherence (does the draft story cohere with the
  raid narration window and the census), not counts.
- Fixtures: scripts/test-draftflag-a.js green before the
  judged sweep is analyzed: synthetic havenRaidTick before/after
  diff (draft row fields, tollExact math incl. the maxHp-not-hp
  rule and the max(1, ...) floor, lingering flip, raidBorn
  flip, unfired-call counting), synthetic tbEnd guard capture
  (occupied vs unoccupied origin tile, restored vs not),
  uid sharing (draftflag uidFn == removal uidFn on the same
  object), and the analyzer's target-matching + toll-shape
  rules on synthetic corpora.

## Verdict rule

- DIAG-GO iff prereg PASS + pilot gate PASS + 16/16 seeds +
  substrate PASS + both targets dated + band-wide counts
  reported + determinism PASS + sense PASS + fixtures PASS.
- DIAG-NO-GO on any failed leg. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run; metric doubts
  go under "metric review" for the NEXT run. Every evidence
  file carries a "metric review" section.
- NO lever verdict: this arm does not propose a damage buff,
  gate move, deed-bar move, or any game change. Its verdict is
  about the measurement (drafts dated, condition confirmed or
  refuted), not about building to anything.
- Scholarmelt's and removal's verdicts are carried, never
  re-judged: this arm dates the drafts those arms inferred; it
  does not re-score their melts.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (draftflag-diag + sweep + analyzer + fixtures),
   committed before the judged sweep is analyzed (fixture bar
   green first).
3. Pilot: 1 seed (75102) — fixtures + determinism + substrate
   identity — before the full sweep.
4. Sweep (16 seeds), determinism gate (seed 75102, scratch dir,
   removed after diff), sense reads per the bar above.
5. Evidence evidence/2026-10-30/sim-draftflag-a.md with a
   prereg-legs table, per-target draft verdicts (day + seq +
   bracketing censuses + palisade/toll fields), band-wide
   counts, secondary tbEnd verdict (labeled secondary), wall
   numbers (report-only, substrate-identical), plain-words
   village assessment, metric review, and ranked next.
6. No src/js change, no push, no bump, no live verification.
   Report 'committed on branch, pending coordinator merge'
   (coordinator merges; sibling loop B may move master under
   this branch — rebase cleanly at the end and re-run the
   proof; rebase conflict = FAIL LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the
shared sim-harness (loadGame seeds Math.random BEFORE eval). Never
stub Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-draftflag-a (no jest is run
by this arm — the sweep/analyzer/test are plain node scripts).
