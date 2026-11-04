# Veterans-encounter diag — Loop B verdict (run fleshout-loop-b-20261104T2125Z, arm sim-vetencounter-b)

Axis: winnability chain, veterans track A (encounter opportunity).
INSTRUMENT ONLY, zero src/js. No default, gate, price, deed, or
readyDemand number changed.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-vetencounter-b-prereg.md`
(commit e2508d7a). In short: competent policy verbatim, default
env, seeds 99101–99108 (the gearbar band re-run on current
master), 150d death-aware horizon, spawn/removal/cast/fight
recorders plus daily world snapshots. Primary metric: whether
the probe names a single dominant failure step (spawn / reach /
trigger-dispatch) consistent across seeds. DIAG-GO iff: (1) all
8 seeds classified into a break step; (2) one step is the
BINDING step on >= 6/8 seeds AND the break step of BOTH
unlocked-but-unmet seeds; (3) instrument errors 0 on all
judged seeds; (4) the per-seed unlock/faced pattern matches
vetprod's. Balanced panel (§15): INAPPLICABLE for a pure
diagnostic — stated, not fabricated.

Chain definitions (prereg, fixed before data): UNLOCK = first
snapshot with unlockedWave >= 4; SPAWN = zero wave-4 world
spawns in [unlockDay, endDay]; REACH = spawns exist but no
instance ever occupies the player's tile, shares a tile with
a villager, or opens a fight; TRIGGER = at least one instance
reaches but zero wave-4 fights; FACED = fights > 0. Binding
step = break step for unmet seeds; for faced seeds, the step
with the largest day-gap in unlock → first spawn → first
reach → first fight (ties toward the earlier step).

## Verdict — DIAG-NO-CANDIDATE (judged strictly against the prereg)

1. All 8 seeds classified, none forced: 2 UNLOCK (99107,
   99108), 2 TRIGGER (99102, 99106), 4 FACED (99101, 99103,
   99104, 99105). Zero SPAWN breaks, zero REACH breaks.
2. Dominant binding step is TRIGGER at 5/8 — one short of
   the 6/8 bar. Binding counts: TRIGGER 5 (99102, 99103,
   99104, 99105, 99106), SPAWN 1 (99101), UNLOCK 2 (99107,
   99108). Both target seeds (99102, 99106) break at TRIGGER,
   but the bar requires 6/8, so the verdict is
   DIAG-NO-CANDIDATE, not re-scored against a friendlier bar.
   The one seed standing between this run and DIAG-GO is
   99101, whose binding is SPAWN only because its first two
   recorded "fights" come from non-world paths (see "The
   99101 contamination" below). A wild-only sensitivity
   recount — NOT this run's verdict — puts 99101 at TRIGGER
   and the count at 6/8; that recount is the next run's
   prereg revision, not a revision of this verdict (§14).
3. Instrument errors 0 on all 8 seeds (760 daily snapshots,
   48 post-unlock wave-4 spawns, 22 post-unlock wave-4 casts,
   42 wave-4 fights).
4. Sanity check PASSED exactly: unlocks 6/8, faced 4/8, and
   the per-seed unlock/faced pattern matches vetprod on all
   8 seeds (see comparison table below).
Proof: `scripts/test-vetencounter-20261104.js` — 15/15 PASS
(13 fixture tests incl. break/binding precedence,
villager-tile reach, pre-unlock anomaly flag, verdict
counting incl. the pattern-flip block, and determinism;
live harness smoke; off/on neutrality leg on seed 99108 at
10d: identical days, endReason, and kill-log length with the
instrument on vs off). No balanced-panel comparison exists
for a diag, so none is fabricated and none is attached
(per §15, stated not omitted silently).

## THE ENCOUNTER ANSWER (plain words)

The door is not the problem. Wave-4 monsters DO come through
it — 48 of them across the band after unlock, 36 spawned
right on the tile the player was standing on, 12 more
wandering in from the wilds. On the two unlocked-but-unmet
villages, 10 wave-4 monsters arrived and nobody ever fought
one. The chain breaks at the last step, not the first two:
not spawn, not reach — trigger. The village meets the
monster and walks away from it.

What "walks away" means mechanically, from the traces: a
tile-entry spawn lands on the tile the player just entered,
and the competent player does not stay there. By the next
daily snapshot the player is back on the home tile (4,4)
and the monster is wandering somewhere else — the 99102
eulogy spawned on day 83 drifted (5,4) → (7,4) → (4,5)
over five days and then lost the trail (removed by
`monsterTurn`'s lost-sight rule: unseen for 7+ turns, it
fades with "It lost your trail"); the second 99102 eulogy
(spawned day 90) wandered the map for 26 days, still alive
when the village died on day 116, never fought. The 99106
influencer spawned on the player's tile on day 55 and was
still wandering, unfought, when the village died four days
later. Villagers shared tiles with these monsters at
snapshot time on 99102 (4 reaching instances) and the
world tick still never produced a field fight for them.
Tile co-location is not a fight: a fight needs detail-grid
contact (adjacent or bumped-into in the 9×9 detail grid),
and on the target seeds that contact never happens — the
player leaves the spawn tile, the monster wanders, and the
trail goes cold.

Two secondary findings, neither of which rescues the chain:
- The world is FULL. On 99102 the world sat at or above
  its monster cap on 38/38 post-unlock snapshots (99103:
  64/64, 99104: 58/58, 99105: 6/6, 99101: 86/87, 99106:
  13/14), and the headcount (up to 13 monsters) exceeds
  the cap (8–9) because tile-entry spawns bypass the cap
  that gates only background top-ups. Background spawns
  still slipped through on intraday dips (12 band-wide),
  but they were never the supply that mattered — the
  tile-entry channel delivered three times as many wave-4
  monsters (36) and still produced zero fights on the
  target seeds.
- Background spawns arrive far away (band median 6.5 tiles
  from the player tile; per-seed medians 4.5–7), so the
  background channel's contribution to the target seeds was
  two far wanderers on 99102 and three on 99106, none of
  which reached a player or villager tile. The reach
  failure that does exist lives in the background channel
  only — and it is not what breaks the targets, because
  the tile-entry channel already put monsters on the
  player's tile.

## Per-seed table

| seed | days | end | unlock day | w4 spawns post (tile-entry / background) | w4 casts post | reached instances (player / villager tile) | w4 fights | w4 kills | break | binding (gaps unlock→spawn / spawn→reach / reach→fight) |
|------|------|-----|------------|------------------------------------------|---------------|--------------------------------------------|-----------|----------|-------|----------------------------------------------------------|
| 99101 | 150 | survived | 65 | 15 (13 / 2) | 9 | 12 / 8 | 13 | 3 | FACED | SPAWN (6 / 0 / −5 — see contamination note) |
| 99102 | 116 | lost | 80 | 6 (4 / 2) | 4 | 4 / 4 | 0 | 0 | TRIGGER | TRIGGER |
| 99103 | 121 | lost | 59 | 12 (8 / 4) | 5 | 8 / 5 | 17 | 1 | FACED | TRIGGER (0 / 1 / 11) |
| 99104 | 150 | survived | 94 | 9 (8 / 1) | 4 | 8 / 8 | 8 | 3 | FACED | TRIGGER (0 / 0 / 13) |
| 99105 | 52 | lost | 48 | 2 (2 / 0) | 0 | 2 / 1 | 4 | 1 | FACED | TRIGGER (0 / 0 / 1) |
| 99106 | 59 | lost | 47 | 4 (1 / 3) | 0 | 1 / 0 | 0 | 0 | TRIGGER | TRIGGER |
| 99107 | 72 | lost | — | 0 | 0 | 0 / 0 | 0 | 0 | UNLOCK | UNLOCK |
| 99108 | 48 | lost | — | 0 | 0 | 0 / 0 | 0 | 0 | UNLOCK | UNLOCK |

Band totals: 48 post-unlock wave-4 spawns (36 tile-entry,
12 background), 22 post-unlock wave-4 casts (all but one
wanderer casts; the exception is a feast-scavenger draw on
99101), 42 wave-4 fights, 8 wave-4 kills. Zero pre-unlock
wave-4 spawns on any seed (the pool gate holds; no anomaly
flag fired on live data).

## Target-seed timelines (the evidence for TRIGGER)

99102 (unlocked day 80, died day 116, peak gated 199):
- Day 83, eulogy spawns on the player's entry tile (5,4).
  Player back home (4,4) by snapshot; monster wanders to
  (7,4), (4,5); removed day 88 by `monsterTurn` (lost trail).
- Day 90, eulogy spawns on the player's entry tile (1,7).
  Wanders (1,6) → (3,8) for 26 days; alive when the village
  dies. Never fought.
- Day 97, algorithm spawns 7 tiles away (background); day
  103, eulogy spawns 7 tiles away (background). Neither
  reaches a player or villager tile.
- Day 108, eater spawns on the player's entry tile (3,4);
  day 110, algorithm spawns on the player's entry tile
  (4,3). Both wander, both alive at village death.
  Zero wave-4 fights, zero wave-4 kills, four wanderer
  casts (suburb, audit, reunion, congregation) that never
  became contacts.

99106 (unlocked day 47, died day 59, peak gated 150):
- Days 50–53, three background spawns 8 / 4 / 7 tiles away
  (eater, reunion, eulogy). None reaches a player or
  villager tile; all alive at village death.
- Day 55, influencer spawns on the player's entry tile
  (8,4). Player back home (4,4) by snapshot; monster
  wanders (3,5) → (2,6); alive when the village dies four
  days later. Zero wave-4 fights, zero wave-4 casts, zero
  wave-4 kills.

## The 99101 contamination (why the verdict is NO-CANDIDATE, honestly)

99101's first two recorded wave-4 "fights" precede its
first recorded wave-4 world spawn (day 71) and cannot be
wild-chain fights: day 66, a field fight with outcome
`evade` (villager hannah_kim vs a congregation with no
world spawn on record — an event/routed monster, not a
world monster); day 69, a player fight vs an influencer
cast the same day by `drawFeastScavenger` (a feast event).
The prereg defines FIGHT as any `startCombat`/`fieldFight`
wave-4 event, exactly as vetprod did — so under the binding
definitions, 99101's gaps are unlock→spawn 6, spawn→reach 0,
reach→fight −5, and the largest gap is SPAWN. That is the
judged binding, and it is what keeps the count at 5/8.
Under a wild-only recount (first wild fight = day 101,
the strike whose world spawn day 94 was removed by
fight-settlement), 99101's gaps become 6 / 0 / 30 and its
binding becomes TRIGGER, taking the count to 6/8. That
recount is reported here as a sensitivity analysis for the
NEXT run's prereg, not as this run's verdict: §14 forbids
re-scoring a miss against a friendlier metric mid-run, and
the miss is the finding the next run must design around.
The other faced seeds' TRIGGER bindings are robust to the
same exclusion (removing early non-world fights can only
lengthen their reach→fight gaps, which are already their
largest: 11, 13, and 1 days).

## Probe numbers vs vetprod's band numbers (sanity check)

| seed | vetprod days / peak gated / w4 fights / w4 kills | this run days / peak gated / w4 fights / w4 kills | match |
|------|--------------------------------------------------|---------------------------------------------------|-------|
| 99101 | 150 / 199 / 13 / 3 | 150 / 199 / 13 / 3 | exact |
| 99102 | 116 / 199 / 0 / 0 | 116 / 199 / 0 / 0 | exact |
| 99103 | 121 / 180 / 17 / 1 | 121 / 180 / 17 / 1 | exact |
| 99104 | 150 / 199 / 8 / 3 | 150 / 199 / 8 / 3 | exact |
| 99105 | 52 / 140 / 4 / 1 | 52 / 140 / 4 / 1 | exact |
| 99106 | 59 / 150 / 0 / 0 | 59 / 150 / 0 / 0 | exact |
| 99107 | 72 / 50 / 0 / 0 | 72 / 50 / 0 / 0 | exact |
| 99108 | 48 / 20 / 0 / 0 | 48 / 20 / 0 / 0 | exact |

Trajectories reproduced exactly on every shared number
(the only src change since vetprod's anchor is a 2-line
table.js narration change, and no seed reaches the table).
The encounter recorder did not perturb the trajectories it
measured — and vetprod's 4/4 split is confirmed, not
drifted: the never-faced half divides into 2
unlocked-but-unmet (now diagnosed TRIGGER) and 2
never-unlocked.

## Wall numbers (this corpus, baseline observations, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on
all 8; no seed leaves village scale; the driver does not
capture table-entry flags, as in vetprod — no seed
approaches the table on this band). Wave-4 unlocks 6/8,
wave-4 faced 4/8 (99101, 99103, 99104, 99105), wave-5
unlocks 0/8, wave-5 faced 0/8. Readiness-5-ready days 0/8.
Median run-days 94 (days sorted 48 / 52 / 59 / 72 / 116 /
121 / 150 / 150; 2 seeds censored at the 150d horizon:
99101, 99104 survived). Death-cause shares for villages
generally: not instrumented by this arm — not reported,
not guessed (as in vetprod).

## Village assessment (plain words)

Picture eight villages playing competently. Two never get
the System's attention (standing peaks 50 and 20 — the
door never opens, nothing to diagnose there). Four meet
the fourth draft and fight it, killing eight times between
them. And two — the ones this arm was sent to explain —
live in a village the fourth draft keeps visiting without
ever being fought: monsters spawn on the very tile the
player stands on, the player walks home, and the monster
paces the map for days or weeks until it loses the trail
or the village itself dies. The 99102 village spent its
last 36 days with wave-4 monsters on the map — a eulogy
wandering for nearly a month — and died without ever
answering one. The 99106 village had four days between
its first wave-4 monster on its own tile and its death,
and spent them elsewhere. What is missing is not
knowledge of the monsters (the villages have fought
dozens of kinds, and the deed feed is full of them) and
not opportunity in the tile sense — it is the last step
of the encounter: closing to contact and choosing the
fight. The competent player, as scripted, does not close
with wave-4 monsters it did not go looking for.

## Sense-test

- The spawn announcement itself is coherent ("Something
  moves out there — The Eulogy", 99103 day 60, followed
  by eulogy fights from day 71), and the treeline dread
  lines read as a village that knows something is out
  there: 99102 day 80, "The village is rattled. Everyone's
  jumpy — eyes on the treeline", "Jawad came back from
  the treeline white-faced. Saw it too. Whatever it is,
  it's still out there." The dread is real; the fight
  that should follow it never comes on the target seeds.
- The lingerer beat is the one wave-4 encounter that
  DOES force a decision, and its wording is a model of
  the missing trigger: 99105 day 50, "The Congregation
  stops at the treeline — pacing, unwilling. The walls
  end the argument. It's still out there", then the
  choice, plainly priced: "Endure it (they drift off
  within ~6 nights — the gorge is the price), or send a
  sortie." That village fought the Congregation the next
  day and killed it. The wild tile-entry spawn, by
  contrast, announces once ("Something moves out there")
  and then goes quiet while the monster wanders — no
  second beat, no priced choice, no muster. The trigger
  gap is also a narration gap.
- No robotic villager behavior was flagged by this arm's
  corpus beyond the trigger gap itself: villagers kill,
  cheer, gossip, and report deaths in coherent voices
  ("Brian killed the Static Kite with their party — 0
  rounds, 0 taken. Word travels fast. The village
  cheers."). The robotic beat here is the player's own:
  a competent script that walks away from every
  fourth-draft spawn it did not seek.
- Instrument limitation, same as vetprod's: the say
  sample cap (150 lines/seed) fills before unlock on
  every seed (say counts 5,334–14,846), so no post-unlock
  spawn announcement was captured for quotation on the
  target seeds — the d60 eulogy line above comes from
  99103, and 99102's treeline lines from day 80, just
  before its unlock. The spawn facts themselves come
  from the recorder, not the transcript.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The break definitions held up: every seed fit exactly
  one break step, and the target seeds' TRIGGER breaks do
  not depend on any ambiguous timing — they have spawns
  on the player tile and zero fights, full stop.
- The binding definition did NOT fully hold up: it mixes
  fight paths. `startCombat`/`fieldFight` events include
  contest fights, feast fights, trap fights, and routed
  event monsters alongside wild world-monster fights, and
  the instrument records no stack class for fight events —
  so 99101's binding is contaminated by two non-world
  fights. Next run's prereg must stack-classify fight
  events (world vs contest vs feast vs trap vs other) and
  judge the wild chain on world fights only, with
  contest/feast fights reported separately (they are real
  facings for the wave-5 gate, but not wild-encounter
  evidence).
- Tile-level reach overstates encounter opportunity: a
  spawn on the player's tile is not detail-grid contact,
  and the player leaving the tile ends the opportunity
  without a fight. Next run's instrument must track
  detail coords (monster mx/my vs player mx/my) and the
  `monsterTurn` contact/lost-trail path, so TRIGGER can
  be decomposed into "player left the tile" vs "monster
  unseen on the tile" vs "player present but never
  engaged".
- Daily snapshots miss intraday reach: a monster that
  wanders onto the player tile and off again between
  snapshots, with no fight, is missed by design. The
  fight-implied-reach fallback catches the fought case;
  the unfought intraday case is a known blind spot, and
  its size is unknown — it can only shrink the TRIGGER
  count, never grow it, so it does not threaten this
  run's target finding (which needs reach, not its
  absence).
- The checkEncounter source merge (tile-entry spawn vs
  wanderer contact, both on the player tile) hid nothing
  on this band: both classes spawn on the player tile and
  behave identically for the chain question. Splitting
  them is not a priority.
- The 6/8 bar was the right strength: at 5/8 it refused
  to crown TRIGGER, and that refusal is what forced the
  contamination analysis above into the open. A next arm
  that wants a GO must carry the wild-only fight
  classification — it must not lower the bar to 5/8 after
  seeing this tie-adjacent result.
- Instance-fight correlation (by monster id + alive
  window, since fight events carry no instance ref) is
  approximate: on 99101, 13 instances correlate as
  "fought" while only 5 wave-4-instance removals carry
  the fight-settlement class, because the same id fought
  repeatedly correlates to every live instance of that
  id. Instance fates are therefore NOT reported as exact
  in this file; the exact numbers are spawns, reached
  counts, fights, and kills. A next arm that needs
  instance fates must correlate fights to instances by
  removal events, not by id.

## Next blanks, in order

1. Wild-only recount (this arm's metric-review item, NOT a
   re-score): re-run the binding analysis with
   stack-classified world fights only, plus detail-coord
   tracking, to confirm or overturn the TRIGGER 6/8
   sensitivity. If confirmed, the build question becomes
   the trigger itself: why does competent play never
   close with an uninvited wave-4 monster — is it the
   policy (walks away), the contact rules (detail-grid
   distance, line of sight), or the missing second beat
   (no priced choice after the spawn announcement, unlike
   the lingerer sortie/endure beat)?
2. Trigger decomposition (follows from 1): split TRIGGER
   into player-left-the-tile vs monster-unseen-on-tile vs
   player-present-never-engaged, using detail coords and
   the `monsterTurn` lost-trail path. The 99102 eulogy
   (lost trail after 5 days) vs the 99106 influencer
   (still wandering at village death) already suggests
   at least two sub-mechanisms.
3. Standing accumulation, part 2 (standaccum blank 3,
   still open): after blanks 1–2, re-measure whether a
   village that both meets wave 4 and keeps two killers
   alive reaches 200 gated AND ready — the release this
   arm, like vetprod, never observed.

## Proof and landing

- Proof: `scripts/test-vetencounter-20261104.js` — 15/15 PASS
  (13 fixture tests + live harness smoke + off/on
  neutrality leg).
- Commits (this worktree branch sim-vetencounter-b;
  coordinator merges via --ff-only; merged locally, pending
  ship — no push, no bump, no live verification by this
  worker):
  - e2508d7a sim-vetencounter-b prereg (before any judged sim)
  - b3b5bf33 sim-vetencounter-b instruments + proof 15/15
    (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-vetencounter-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-vetencounter-b/` (8 files,
  vetencounter-pilot run); scripts
  `vetencounter-instrument-20261104.js`,
  `vetencounter-driver-20261104.js`,
  `vetencounter-analyze-20261104.js`,
  `test-vetencounter-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after both commits (prereg +
  instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status` empty
  + `git diff HEAD` empty. The commits themselves were always
  correct.
- EPERM note: the judged pilot's final seed write (99108)
  hit the host write flap (EPERM, 0-byte file left behind).
  Recovered per the flap lesson: deleted the 0-byte file,
  re-ran seed 99108 alone to /tmp, copied into evidence/
  with a size check (166,424 bytes, parses, days 48 /
  village-lost / standing 20 — exact vetprod match). The
  re-run is deterministic (seeded harness, same code), so
  the recovered file is the same run, not a different one.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
