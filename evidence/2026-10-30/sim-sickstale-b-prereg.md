# sim-sickstale-b — PREREGISTRATION (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z, arm sim-sickstale-b.
Parent: loop-B arm sim-sicktele-b (run fleshout-loop-b-20261030T1332Z),
evidence/2026-10-30/sim-sicktele-b.md, sim-findings #1542 (open).
Related, NOT re-litigated: the contest-death recording fix (commit 06b502d53,
registerDeath + fallen in _cxKillContestant). This arm is ONLY the stale-sick
tick: the day's sickness tick deals hits to already-dead villagers' stale
sick records because removeVillager doesn't clear v.sick[vid] — the parent
trace showed a contest-dead villager taking a 3-point sickness hit
post-mortem (health 52 -> 49 on a corpse's record, elif_demir, seed 9983,
day 32).

Base pin (HEAD at prereg time): 7074478fb (branch sim-sickstale-b, worktree
~/workspace/worktrees/sim-sickstale-b).
Policy: competent (scripts/policies/competent.js), same as the parent arms.
Horizon: 180d death-aware (run ends early on village-lost / over; dead
villages stop simulating). Never a fixed 200d. Why: stale hits need deaths
with sick records, which need long-enough runs for villagers to fall sick
and die; 180d matches the sicktele band for comparability, and the
death-aware stop keeps dead villages from burning the budget.

## Code path + choke-point decision (read before judging)

- The tick: `villageSicknessTick` (src/js/game.js) iterates
  `Object.keys(v.sick)` and calls `hurtVillager(vid, sickDmg, sickCause)`
  BEFORE its dead/off-roster check. The check then silently deletes the
  record. So a stale record costs exactly one real damage row against a
  corpse's health entry (52 -> 49) before it is cleaned up — the hit is
  real code behavior, not a display artefact. A second, player-visible
  consequence: app.js's afflictions panel lists ALL `v.sick` keys with no
  roster filter, so between removal and the next tick a dead/exiled
  villager renders as "sick" with Tend buttons.
- The removal: `removeVillager` (src/js/betrayal.js) is the one removal
  choke point (killed / ambushed / exiled / fled / splinter all land
  here, with the same hygiene family already present: positions, nodePos,
  mentored, heat, challenge, allies, doubts, cases, quests, promises).
  It clears no sick record. `_cxKillContestant` (contests.js) DOES call
  removeVillager before its redundant direct roster filter, so the
  contest-death case is covered by a removeVillager fix, not bypassed
  by it.
- Exiled / fled (alive leavers): under current code their record ALSO
  takes exactly one post-departure hit and is then deleted by the tick's
  own cleanup — no living system can depend on a record the tick itself
  deletes within a day of removal. Readers in the removal-to-tick window
  (afflictions panel, sick_help favor gate, betrayal invite sick -20)
  read a ghost's sickness, which is a bug, not a feature. And no return
  path reuses the id: membership blocks exiles outright, and roster
  re-adds (membership.js arrivals, villageAgency.js hydration) mint new
  ids. Clearing on removal therefore changes nothing for any living
  villager, for any removal kind.
- Old saves: a save written before this fix can already hold a stale
  record, and no removeVillager call will ever fire for it again. The
  removeVillager clear alone cannot fix those. Hence BOTH halves:
  1. PRIMARY: removeVillager deletes `v.sick[vid]` (placed AFTER the
     phoenix early-return, so a phoenix-saved villager keeps their
     record — they never actually left).
  2. DEFENSE: villageSicknessTick skips — and deletes — any record
     whose vid is not on the roster or whose vpOf record is already dead,
     BEFORE hurtVillager. Silence matches the existing _wasDead branch
     (already-mourned deaths say nothing). The post-hurt grief branch
     is untouched: `_wasDead` is computed BEFORE the hurt call, so a
     villager alive at tick start who dies FROM the tick hit still
     gets the grief line exactly as today (the local record reference
     survives the map deletion).
- Canon: docs/CANON.md read first; docs/DISEASES.md for sickness systems
  (two pools, never mix; v.sick is the mundane pipeline — this fix
  touches no disease definition, no pool, no cure, no vector, only
  record hygiene for people no longer in the village). No canon doc
  covers removal hygiene; the pattern above follows the existing
  removeVillager hygiene family, not an invention.

## Instrument (zero game-code change in the instrument itself)

scripts/trace-sickstale-b.js — record-only wrappers, same pattern as
trace-sicktele-b.js, plus PRE-hurt state (the sicktele wrapper only
recorded post-hit state, which cannot separate a stale hit from a
tick hit that itself kills):
- Game.hurtVillager wrapper: captures, per row, day, vid, damage, cause,
  caller, healthBefore/After, AND pre-hurt roster membership +
  pre-hurt vpOf.dead. A row is STALE iff cause is a sickness cause
  ('sickness' or a disease id routed as sickCause) AND (not on roster
  before the hurt OR vpOf.dead true before the hurt). A villager alive
  and on-roster before the hurt who dies from the hit is a LIVE hit,
  never stale.
- Daily snapshots at villageEats entry: roster, v.sick keys.
- Game.say wrapper: filtered lines (succumb | on the mend | is gone)
  for the sense read — the fix must change no narration.
scripts/analyze-sickstale-b.js — per seed: staleHits, liveSickHits
(sickness-cause rows with live+on-roster pre-hurt state), liveSickVids,
days, endReason, and the stale rows themselves.

scripts/test-sickstale-b.js — deterministic reproduction + pilot proof:
- REPRO (live, shared kit scripts/sim-harness.js, one process): load a
  fresh game, pick a roster villager (not the scholar), plant a sick
  record + known health, then (a) removeVillager(vid, 'killed') +
  villageSicknessTick, (b) removeVillager(vid, 'exiled') + tick on a
  second villager, (c) a stale record for a never-rostered id (old-save
  shape) + tick, (d) a LIVE control: sick record on a roster villager
  + tick. Asserts post-fix: (a)(b)(c) zero sickness hurts for the
  removed/stale vids and no sick record remaining; (d) the live
  villager still takes the normal tick hit. Pre-fix this script must
  show the stale hits (run once before the fix and keep the output
  in the evidence file as the BEFORE record); post-fix it must pass.
- PILOT proof: reads the committed pilot traces + summary JSONs and
  asserts the numbers in the evidence file.

## Primary metric (pre-registered, binds the run)

Per seed, over the full run: staleHitCount = number of STALE sickness
hurt rows (definition above). Neutrality guardrail, per seed:
liveSickHits (sickness rows with live+on-roster pre-hurt state) must be
IDENTICAL before vs after on identical seeds — the fix touches only
records of people no longer in the village, so any live delta is a
regression, not noise.

## GO / NO-GO bar (judge against this header, never re-score)

GO requires ALL of:
(a) Deterministic reproduction: post-fix stale hits 0 in cases
    (a)(b)(c), live control hit preserved in case (d).
(b) Known-event leg, seed 9983: pre-fix trace shows the elif_demir
    day-32 post-mortem sickness row (52 -> 49, off-roster pre-hurt);
    post-fix trace shows 0 stale hits on the same seed.
(c) Pilot band, seeds 10301-10308, competent, 180d death-aware:
    post-fix stale hits 0 on all 8 seeds.
(d) Neutrality: liveSickHits identical per seed before vs after on
    the pilot band AND on seed 9983. Any live delta is NO-GO pending
    an explanation that traces it to a non-fix cause (none expected).
(e) Panel compare attached: `scripts/balance-panel.js` built before
    (base commit) and after (fix commit) on the pilot seeds with
    policy competent, compared with `balance-panel.js compare`; the
    compare .md is attached to the evidence file. Per MEASUREMENT.md
    §15 the panel is the instrument, not the judge: its decision is
    reported, and a regression_signal on a secondary metric is an
    investigation note — unless the investigation traces it to the
    fix changing live outcomes, in which case (d) already fails.
A miss on any clause is NO-GO. No re-scoring against a friendlier
metric mid-run; metric doubts go under "metric review" in the
evidence file and apply to the NEXT run only.

## Legs

1. REPRODUCTION (before fix): run test-sickstale-b.js repro cases on
   unfixed code; keep the output as the BEFORE record.
2. KNOWN-EVENT: seed 9983, competent, 180d death-aware, before fix
   (expect the elif row) and after fix (expect 0 stale hits).
3. PILOT: 8 fresh seeds (10301-10308), competent, 180d death-aware,
   BEFORE any confirm spend. If the pilot shows 0 stale hits before
   AND after, the pilot proves neutrality only, and the effect proof
   rests on legs 1-2 — stated honestly, not inflated. No confirm is
   spent: the effect is deterministic (legs 1-2), the pilot is a
   neutrality + no-regression band.
4. PANEL: before/after panels on the pilot seeds, policy competent,
   days 180; compare attached. Panel cases/ cache is NOT committed
   (only panel.json.gz + compare .md/.json).

## Sense test (SENSE-TESTING LAW)

Read the say lines around the 9983 elif event before and after. The
fix must remove only a silent post-mortem damage row (and a ghost
afflictions-panel row in the removal-to-tick window); the village's
story — the contest-death line, grief, gossip — must read identically.
If any say/tele delta appears, the fix commit carries [needs-eyes];
otherwise it does not (a silent hygiene fix is not a player-feel
change, and the narration must prove that).

## Out of scope (do not touch)

Contest-death recording (landed 06b502d53); disease definitions,
pools, vectors, cures (DISEASES.md); gear, vest, courtship, warmth
code. No pushes, no version bumps, no live verification — coordinator
merges; this arm reports 'committed on branch sim-sickstale-b,
pending coordinator landing'.

## Metric review (placeholder — filled at run end, §14)

Filled in the evidence file at run end. No revisions apply to this
run's numbers.
