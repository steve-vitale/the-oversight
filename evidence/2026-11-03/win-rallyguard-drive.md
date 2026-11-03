# Drive 1 — RALLY-GUARD: answer a raid with company (Track 3, 2026-11-03)

Plain words: when the village hears that raiders came in the night,
a villager whose own drive is protection or ambition walks out
with the next person who leaves — not because a danger number
told them to, but because they heard about the raid and that is
what they are for. Before this drive, a trip the danger check
called safe always went out solo, even the morning after a raid.

## The drive (framework shape)

- reason: npcGoal 'protect' / 'prove' / 'lead' (loyalty, ambition).
- perception: village gossip with action 'raid' within 3 days —
  the same window objDanger already uses. Both raid channels feed
  it (commonsRaid in game.js, Haven raid defense in
  havenGrowth.js). A raid nobody heard about arms nothing.
- action: on a 'go'-verdict departure, a protect/prove/lead
  villager at haven volunteers as GUARD via the existing
  objAskCompanion path (new opts.rallyOnly filter — no fallback
  to other companions, so every rally guard is attributable to
  this drive). Same solo/HUNT exclusions and heal gates as the
  'ask' path; same trust bumps on a paired departure.
- persists: the GUARD objective is a real trip (same target, same
  clock, targetVid = principal); its return runs the visit/guard
  bond. The next raid's gossip re-arms it.
- proof: fixture 21/21 (below) + identical-seed panel counts
  (below). No new RNG draws on any path: the gossip scan and
  goal filter are pure reads, so games without a fresh raid are
  bit-identical to base.

## What changed (one file, game code)

- src/js/villager-objectives.js:
  - objRallyFreshRaid(): fresh-raid gossip scan (new).
  - objAskCompanion(vid, obj, hx, hy, opts): opts.rallyOnly
    restricts volunteers to protect/prove/lead goals (new).
  - objMaybeDepart 'go' branch: rally-guard attempt before the
    solo departure, mirroring the 'ask' branch's heal gates and
    trust bumps (new).
  - @ontology provides/rules updated for both.
- No gate, price, threshold, or readiness number touched.
  No roster/list feed added: objAskCompanion only considers
  villagers whose node IS haven (co-located, same as before).

## Fixture proof (scripts/test-win-rallyguard.js, seed 4242 + offsets)

21/21, run 2026-11-03 in the win-drives worktree:

- main (raid today + bold principal + protect volunteer):
  verdict 'go', principal departs WITH a picked rally companion
  as GUARD (targetVid = principal, guard goal protect/prove/
  lead). Note: the picked companion is the best-scored rally
  volunteer (warm + protect), not necessarily the first roster
  id — the test asserts on the picked companion.
- noraid: no gossip -> principal departs solo.
- wronggoal: raid + 'family' volunteer -> solo (goal filter).
- stale: raid 4 days old -> solo (3-day window).
- askpath: raid + steady principal -> verdict 'ask' (the
  pre-existing companion path, untouched by this drive).

## Panel proof (identical seeds, competent policy, 120 days)

Driver: scripts/win-rallyguard-panel.js; analyzer:
scripts/win-rallyguard-analyze.js. Seeds 31001-31008 (the Nov 1
audit's seeds). BEFORE = base code at 81cb0cc4a (run from the
pristine content copy); AFTER = this branch. Metric: guard
departures within 3 days after raid gossip, with rally-goal
guards split out; rallyAsks counts objAskCompanion calls with
rallyOnly (only the drive passes that flag, so BEFORE must read
0 on that column by construction AND by measurement).

[PANEL RESULTS — filled when both corpora finish.]

## Limits, stated honestly

- The drive only fires on 'go'-verdict trips: a fresh raid alone
  scores +2, so most principals land on 'ask' (existing company
  path) and only bold/restless principals reach 'go' with a raid
  in the window. If the panel shows no movement, the drive is
  real but too narrow — that is a NO-GO on strength, not a
  reason to widen it silently (widening to 'ask' verdicts would
  change the existing companion path and needs its own case).
- This drive is the ANSWER side of rivalry. The CHOICE side (a
  foreign village choosing raid/beg/talk from its own lore) is
  Drive 2 in the framework note — held by design pending a
  raid-choice-by-lore-rank panel.
- Guard company is not a party and not a win lever by itself:
  it feeds arm 1's join mechanism (company on the ground) and
  Track 2's party formation (co-located, trusted companions),
  but it claims no win movement on its own.
