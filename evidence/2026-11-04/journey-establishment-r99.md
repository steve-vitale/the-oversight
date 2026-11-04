# Journey leg ESTABLISHMENT — r99 run note (2026-11-04, Lane A)

## Prereg
`evidence/2026-11-04/journey-establishment-r99-prereg.md` (committed
1938bb05 BEFORE any seed ran; instrument correction committed f2880ee
before any panel scoring — see below). Driver
`scripts/journey-establishment-r99-20261104.js` (clone of the r86
driver + read-only skill-economy instruments), analyzer
`scripts/analyze-journey-establishment-r99-20261104.js`. Seeds
1301–1304 (fresh band), competent policy, 42-day horizon, death-aware
tail (10 all-dead days; never hit — both game-overs were scatters, not
extinctions). Base: master 71041af7d at branch time; branch
`journey-establishment` fast-forwarded to master before any work
(no foreign commits carried: branch HEAD == master after registration,
verified).

## Leg question
Does a specialist economy actually emerge in the establishment window —
villagers learning and teaching real skills beyond their starting
occupations — and do first contests fire and resolve, or does the
village run on starting occupations plus the player alone? (r85/r86
settled waves and armor; this run does NOT re-score them.)

## Panel verdict (BINDING metrics)
- M1 SPECIALIST-EMERGENCE: **INTERESTING 4/4 — specialists emerge,
  villager-to-villager.** skill_lesson rows 16/23/22/18 per seed, every
  single one NPC→NPC (16/16, 23/23, 22/22, 18/18); distinct lesson
  actors 10/9/11/11; skill_taught rows 1/4/4/3, first taught day 5/3/3/3.
  Distinct skills per seed: 31/43/33/40 (preserve_food, wound_care,
  herbal_medicine, gossip_network, diplomat, read_people, steady_hands,
  old_world_cache, mediate, camp_cooking, ...). The teaching loop closes
  without the player: villagers pick lessons that fit each other's
  builds (Addison teaching preserve_food three times on 1301; Ruth
  teaching Elif wound_care + herbal_medicine on 1304). Caveat, stated
  not hidden: the competent policy's player taught NOBODY in this
  panel — zero teacher='player' lessons on any seed. Whether that is
  policy (the driver never holds teaching conversations) or game is
  not separable from this panel; the villager-side economy is proven,
  the player-as-teacher side is untested here.
- M2 FIRST-CONTESTS: **no mid-run stuck contest; the "dangling" count
  is horizon truncation.** Fired 2/5/3/5, ended 1/4/3/4, dangling
  1/1/0/1 by count — but every dangling contest fired on the run's
  last day or the scatter day (1301 fired d21, the scatter day; 1302
  fired d41, run ends d42; 1304 fired d42, the final day). No contest
  sat unresolved mid-run. 1303 also cast repel once (contest_cast_repel).
  The pre-registered interesting-bar ("any seed dangles") is met on
  paper and explained away on inspection — see metric review.
- M3 SURVIVAL-42: **NO-GO 2/4** (need >= 3). 1302 and 1304 alive at
  day 42, not over; 1301 scattered day 21, 1303 scattered day 41.
  Contrast r85/r86 (4/4 both panels): this panel is harsher, and the
  failure mode is specific — see village assessment.
- M4 PANTRY-GUARDRAIL: **NO-GO 2/4** (need >= 3). 1302/1304 zero
  starvation deaths; 1301 one (Ha-na, d20), 1303 three. Same pantry
  story as M3, not a separate failure.
- M5 PEOPLE: **PASS on the 4 available convos; 2 seeds uncheckable
  (game over, driver skips post-collapse samples by design).**
  Felipe's left-behind grief + invite accepted in character; Harold's
  gossip + haul beat that turns back on fresh monster tracks (a real
  consequence); Grigory's Wild Onion teaching ("I've been walking
  past it for weeks"); Shyngys's Russian-only nonverbal conversation,
  played straight through gesture and a faltering translation. No
  fabricated shared history, no filler loops. Detail below.
- M6 ARMOR-REPLICATION (descriptive, NON-binding): **the r85/r86
  zero-craft streak is BROKEN.** NPC beat returns '1' (made) on 1302
  d40/d41 and 1303 d37, and the matTrace shows the pieces arriving
  worn: 1302 ends with Felipe + Hassan in hide armor that appears
  only on the day-42 trace (after the d40/41 beats), 1303 gains
  Tariq in bark armor on the day-39 trace (after the d37 beat; Tariq
  later churns off-roster). Player craft: 1301 bark success d14
  (ret true, piece in pack at end); 1302 one null-return attempt d17.
  Attempts stay rare (NPC 0/2/1/1 across the panel), so this is a
  small-numbers break (3 pieces from 4 attempts), not proof of a
  systematic fix — but "zero pieces crafted in-window" is no longer
  true, and future runs must not cite it.

## Village assessment, in plain words
Four villages started with 12 people each. Two are still standing at
day 42 (1302 fat at 68,716 kcal with 9 people; 1304 lean at 5,912 kcal
with 7 people). Two scattered — and scattering is the word that
matters: nobody on any final roster was dead (rosterDead 0 on all four
seeds), people walked away alive when the pantry ran dry. 1301 slid
from 5,500 kcal on day 15 to zero on day 20, lost Ha-na to starvation
on day 20, and scattered on day 21 with 8 people still alive. 1303
fought harder and longer — wave 3 on day 26, three starvation deaths —
and scattered on day 41 with 4 people left. The mechanism is the
famine clock in code (pantry at zero for the grace window, then the
"people started walking — in different directions" beat): these are
food collapses, not monster wipes. Wave 3 arrived on 3/4 seeds (d25,
d26, d40 — the d40 arrival on 1304 is the late-ledger case: wave-2
ledger full only d39). Background, not scored: wave scope stays
stale-framing (3/4 reach wave 3), and 1304 is the case r86 named as
interesting but never saw — wave 3 landing on a roster wearing NO
armor at all — and the village still survived it (8 alive at arrival,
7 at end). The gear gap meets the wave gate without a wipe.

## People check (4 convos, read in full — PASS)
- Felipe (1302, truck driver): opens on who you left behind, refuses
  to say it out loud ("saying it out loud makes it real in a way I
  can't afford yet"), accepts the invite with "Finally. I was
  wondering when you'd see my value." A real want, a guarded answer,
  a resolved ending. PASS.
- Harold (1302, crossing guard): gossip names real roster people
  (Gang the infantry soldier, Omar the piano tuner), then a haul
  request with a real consequence — fresh big tracks halfway to the
  cache, turn back quietly: "The wild, reminding you." PASS.
- Grigory (1304, fishing guide): the player teaches Wild Onion;
  "And I've been walking past it for weeks" — the teaching beat from
  M1, visible in dialogue. The post-teach mood beats (mood shifts,
  a silence that stretches) feel slightly mechanical but stay honest.
  PASS.
- Shyngys (1304, tailor): speaks only Russian, no shared words. The
  whole conversation runs on gesture — nod, smile, point-at-self,
  listen hard, ask Daniyar to translate, translation falters — and
  ends where language couldn't reach, without cheating. The unique-
  person law working as designed. PASS.
- 1301/1303: no convo sample (game over before the end-of-run check;
  the driver skips post-collapse samples rather than fabricating
  them). Coverage 4/8 intended, reported as partial, not as a pass
  over 8.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed JSONs carry derived `guardrails` + `c3` blocks (deaths /
aliveEnd / pantryKcalEnd / starvation count, computed from each file's
own fields, same shape as r85/r86 — the r99 driver's first version
omitted them, so the tool initially read 0s; the derivation step is
recorded here, not hidden).
- LOUD: `guardrails.deaths` 41 -> 119 (+190%).
- Quiet: popAlive, pantryKcal, starvationDeaths.
- Verdict: same as r85/r86, now on a third consecutive panel. NOT a
  village-mortality regression — rosterDead 0 on all four seeds, and
  'villager combat' / expedition rows dominate every seed's death
  list, so most death records are fight records, not village deaths.
  Fight volume stays up with wave 3 reached on 3/4 seeds. **Baseline
  NOT rolled forward** in this run; three consecutive panels at this
  level strengthen the case for a re-seed at the next baseline review,
  but that roll needs its own regime note (per the baselines NOTES.md)
  and is not done silently here.

## Metric review (for the NEXT run, not this one)
- M2's "dangling" count must exclude contests fired within 2 days of
  run end or on the scatter day: as written it fires on truncation,
  not on stuck contests. A true stuck contest would be one fired
  >= 3 days before run end with no end row.
- M1's crossing evidence lives in skill_lesson teacher->learner
  pairs, not skill_taught (which carries no actor — see the prereg
  correction). Future runs should also separate player-taught lessons
  by driving a teaching conversation, since competent policy alone
  never teaches.
- The census `equipped` field for the first roster member duplicates
  the player's equipped list on 1301 (Wanda shows the scholar's gear).
  Treat first-row equipped as unreliable until the driver resolves
  whether roster[0] is the scholar; matTrace armor (which matched the
  end census for Leo/Felipe/Hassan) is the reliable armor source.
- Census `skills` per person came back null everywhere
  (p.skills/learnedSkills/knownSkills don't exist on person objects);
  telemetry skill rows are the only skill source. Don't re-add a
  census-skills instrument without finding the real field first.

## Reachable / fun / winnable (establishment)
- Reachable: YES with a food warning — villages survive, wave 3
  arrives and is survived (even unarmored, 1304), contests fire and
  resolve, villagers teach each other constantly, conversations carry
  real wants. But 2/4 villages scatter on empty pantries: the
  establishment window's real killer is food, and it kills the
  village as an entity while its people still live.
- Fun: YES — the specialist economy is visible in play (lessons
  flying villager-to-villager from day 3, a teaching beat you can
  watch in dialogue), the armor chase finally produces pieces
  in-window, and the scatter ending names its loss honestly ("Not
  dead: scattered") instead of pretending a wipe.
- Winnable: PARTIAL — survival, contests, wave progression, teaching
  and now armor crafting all work in-window, but the pantry is the
  binding constraint: a competent player must hold food through the
  window or lose the village to the scatter clock, and this panel
  lost half its villages that way.

## Files
- Driver: `scripts/journey-establishment-r99-20261104.js` (r86 clone +
  skill/contest instruments; telemetry-mapping fix in f2880ee)
- Analyzer: `scripts/analyze-journey-establishment-r99-20261104.js`
- Prereg + per-seed JSON + convos:
  `evidence/2026-11-04/journey-establishment-r99-*`
- Analyzer output: goal hidden_files/r99-analyzer.log (bookkeeping)

## Status
Tooling + evidence only; NO src/js change. To be committed via
safe-commit in the worktree, merged --ff-only locally, pending ship.

## Infra incidents (disclosed, not hidden)
- Worktree registration took ~5 min: `git worktree add`'s hard reset
  on this checkout is slow under load (load avg ~9). Not a failure;
  the register completed and printed the path.
- safe-commit index clobber struck on BOTH commits (first: committed
  files shown deleted + untracked; second: main index stuck on prior
  blobs while worktree == HEAD). Repaired both times via HEAD-blob
  cacheinfo, verified with status empty + diff HEAD empty +
  hash-object matches. The commits themselves were correct.
- Pilot instrument flaw found + fixed pre-scoring: skill rows carry
  no `who` (tele() adds day/type only); driver now maps the real
  emission shapes from src/js (skill_lesson teacher/learner,
  villager_skill vid, skill_taught ability with no actor). Pilot seed
  1301 re-run on the fixed driver; headline fields identical
  (endDay 21, over, aliveEnd 8, wave 2, deaths 13, pantry 0).
- Heartbeat loop verified live (registry heartbeat_at advancing on
  the 10-min cycle; two lock-contention stalls — Lane B's register
  holding REGISTRY.lock through its slow git checkout, then a
  reaper pass holding it — delayed beats to ~15 min age once, but
  the queued beat landed both times; tree is dirty throughout, so
  the reaper could not have removed it in any case).
- Service restart mid-run killed the first check.js --quick run
  (dots only, no summary) and the first heartbeat loop; both were
  restarted and verified (new loop beat 16:19:55Z onward).
- check.js --quick (re-run, `--cacheDirectory=
  /tmp/jest-cache-playtest`): **277 passed, 13 failed in 1559s.**
  The 13 = r96's standing 6 (godpath/test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-establishment-r20-fixes-20261020.js) + 1 load flake +
  6× 120s timeouts. The load flake (test-measurement-cache-flags,
  89.6s in-suite) PASSES solo in 43s (4/4), so it is not a
  regression. The 6 timeouts (test-solo-campaign-endings,
  test-trust-observer-neutrality, test-synergy-stall,
  test-throttlefeast-20261014, test-capable-bot-20261014,
  test-table-endings-20261014 — all exit null at 120s) ran while a
  second agent's check.js and Lane B's endgame probe loaded the
  same box; r97 already showed this timeout class (3 of the same
  files). This run changed zero src/js, so none of the 13 can be
  regressions of r99's files. Full log: goal hidden_files/
  r99-check-quick2.log (bookkeeping).
