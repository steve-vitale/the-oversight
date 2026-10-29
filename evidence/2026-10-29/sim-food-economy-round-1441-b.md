# Loop-B round 1441Z — food-economy (2026-10-29)

Run: fleshout-loop-b-20261029T1441Z. Axis: food-economy (converging), the
second axis. Loop A live on scale-onramp (1315Z holdsjoin/pickband claim,
NOT touched) — at run start A's heartbeats were stale (pickband 14:04Z,
holdsjoin 13:35Z) but its claim was still live, so the axis was respected,
not taken. Claim written before any sims; lock + claim deleted at closeout.

Master moved once under the run (journey establishment r58 1c679cdd5,
tooling only, zero src/js, zero overlap). Both arm branches were rebased
clean onto it, proofs re-run post-rebase, then merged --ff-only.

## Arm 1 — sim-woodcarry-b: INSUFFICIENT-DATA (killed at pilot on min-n)

Backlog #1422, the creekremedy follow-up: daytime wood-carrying
precondition for the creek bridge (bridge: 4 wood, 60 kcal, 96 ticks).
Prereg committed before any judged leg (996b219b8 post-rebase).

- 12 seeds (8 pilot + full 4-seed authorized fallback). ON-leg creek
  evenings 3 — bar n >= 8 NOT met, so no confirm legs were run.
- Rescue share 3/3 = 1.000 (bar >= 0.50; Wilson 95% 0.438–1.000). The
  effect never failed; the power ran out. Cause of the thin n: bridging
  is permanent, so each rescued episode contributes only its first
  evening to the ON denominator (OFF 11 evenings -> ON 3). Fallback
  seeds 11728–11731 produced zero creek evenings on either leg. OFF leg
  reproduces creekremedy exactly (11636: 6, 11707: 5, 12027: 0), so the
  collapse is the lever's doing, not base drift.
- Lever (built, proven, reverted per the killed-arm rule — NO policy
  file in the landed commit): morning carry at haven (deficit-only take,
  pile floor 8, morning kcal floor 60, weight-checked) + evening bridge
  attempt on creek refusal. 27 carries acted; skips pile-floor 13,
  already-carrying 290, not-at-haven 30. All 3 bridge attempts built;
  all 3 evenings ended inside.
- Pooled inside evenings OFF 303 -> ON 323 (+20). Player starvation
  deaths OFF 2, ON 2 (same seeds/days). 11636's player dies "the wild"
  day 9 OFF, lives to day 26 ON. Honest cost recorded: 11654 day 30,
  inside OFF but out-of-reach away ON (carry-tick trajectory
  divergence, no creek, no death).
- Post-rebase proof re-run by coordinator: T4 FAILS (min-n only),
  T5–T11 PASS — verdict reproduced exactly. T1–T3 unit tests skip
  gracefully on the reverted landing (they ran green before revert).
- Sense-test: day-2 carry tail opens "You take 4 logs from the woodpile
  for the road home. (10 left for the hearth.)" — a person preparing.
  Day-4 rescued evening reads as a played homecoming (engine refusal
  line, "You lash logs together. A rough bridge spans the gap,"
  "Travel 2 tiles to Haven", arrival home). Caveat: the lacking-line
  was never exercised in a played tail (zero still-refused ON creek
  evenings), so the honesty guard passes vacuously; the narration gap
  is not yet proven closed in play.
- Metric review: promote episode rescue rate (episodes rescued /
  episodes, currently 3/3) to primary with min-n 8 episodes; budget
  from the observed ~0.25 episodes/seed (~30 seeds) or use a
  pre-registered creek-enriched band. Do NOT re-score this run's 3/3
  against a revised bar. Analyzer fix disclosed: the analyzer first
  counted all sampled deaths (OFF 77, ON 78); fixed to player deaths
  only (OFF 17, ON 12 pooled). Guard passes under either count.
- Merged 5eb791252 (post-rebase) + prereg 996b219b8. Evidence-only
  landing, zero src/js, zero game change.

## Arm 2 — sim-blockscreen2-b: BANKED (census complete)

Backlog #1421/#1416, the blockage census. Direct refused-prone screen
(no away-prone proxy, no blind band). Prereg committed before any
judged leg (6759636eb post-rebase). Measurement only: zero src/js,
zero game change, zero policy lever.

- Fresh band 13000–13279, 280 seeds in 7 complete 40-seed blocks,
  stopped at the first block reaching the bar: 12 refused-prone seeds
  banked (qualifier rate 4.29%). Banked: 13012, 13025, 13029, 13067,
  13111, 13157, 13224, 13248, 13255, 13261, 13268, 13276.
- 81 refused evenings, all classified, unclassified 0. Type shares —
  quoted ONLY as "among refused evenings on refused-prone seeds from
  a direct refused-prone screen on fresh band 13000+", never as a
  blind-band rate. Evenings: creek 47 (58.0%), washed_out 14 (17.3%),
  fallen_tree 11 (13.6%), rubble 9 (11.1%). Seeds: creek 4/12,
  washed_out 3/12, fallen_tree 3/12, rubble 3/12 (13111 is the only
  mixed-type seed: fallen_tree 6 + washed_out 6). Evening share alone
  misleads — 45 of 47 creek evenings sit on 3 haven-adjacent-tile
  seeds — so the pair is quoted together.
- Genuinely-uncovered set: EMPTY (0/81, every refused evening has a
  BFS route-around). The eveningdetour lever's coverage claim holds
  on this bank. One qualification kept in the verdict: one "covered"
  route is 12 steps (13224 rubble days 4–5, around the map's top
  edge) vs 2–5 steps for all other 79 evenings.
- Proof PROOF-GREEN post-rebase (coordinator re-ran with corpus args):
  prior-corpus reproduction exact (blockscreen-b 48 evenings: creek
  23 / washed_out 17 / fallen_tree 8 / rubble 0), staging, OFF-vs-ON
  deep-equal 0 diffs on the 4-seed validation subset, partition sums,
  recorder errors 0, determinism byte-identical on 3 re-run seeds.
- Sense-test: three refused traces read end to end (13025 creek,
  13224 rubble, 13261 washed_out) — refusals read as real blockages
  with honest engine lines, types matching visible tiles. Recurring
  gap is absence: no line ever names the way around, no line marks
  the night away (third sighting of un-narrated episode exits:
  13224 wakes day 6 still camped at the creek with 182 kcal; 13261
  wakes day 24 inside at haven with no return line).
- 13261 correlation note, NOT causation: 6-night washed_out episode
  days 18–23, then starvation deaths days 25–27 and village loss
  day 27 — but that village had deaths since day 4.
- Merged e93bf6fb9 (post-rebase) + prereg 6759636eb. First arm in the
  blockage-census chain to reach a census verdict instead of
  INSUFFICIENT-DATA — because the screen finally selected directly
  on the census's own conditioning variable.

## Wall numbers

National / table / wins: NOT OBSERVABLE on 30-day pre-seat legs —
reported, not claimed, for both arms. Wave 4–5 unlocks 0 (blockscreen2:
0/280 scanned, 0/12 banked; wave 3: 11/280 scanned, 0/12 banked).
Median survival 30d capped on both corpora (blockscreen2 banked: 11/12
villages survived 30 days; 13261 village-lost day 27). No wall movement
claimed.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--metrics national,table,wins,exiled` on all three corpora (woodcarry
pilot ON n=8, extension ON n=4, blockscreen2 ON n=280): 3 LOUD lines
each (national 12->0, table 16->0, wins 16->0) — the KNOWN field-shape +
regime artifact class (pre-seat legs record no national/table/wins
fields vs a WINSEAT baseline), same as the 1330Z run. Exiled: no LOUD
line. Baseline NOT rolled.

## Village assessment (plain words)

The village's creek problem finally has a working answer and a honest
price tag. When villagers carry logs out in the morning, every creek
evening they hit gets bridged and they sleep at home — the one village
that died in the wild on day 9 lived to day 26 with logs on its back.
But creek evenings are rarer than the old count suggested, because a
bridge, once built, stays built: the rescue eats its own evidence.
The census underneath is now solid for the first time: on villages
prone to refused evenings, all four blockage types show up, and every
single refused evening has a way around — none is truly stranded by
geometry. What the village still lacks is words: nobody ever says
which way around, nobody marks a night spent away, and nobody says
what is missing when a bridge cannot be built. Those are narration
blanks, not geometry blanks, and they are the next cheap wins.

## Infrastructure

- Reap at start left 8 active trees alone (held B trees with
  uncommitted changes untouched; journey2-social likewise at closeout).
- Safe-commit index clobber hit both workers' commits (bogus staged
  deletions in the main index, commits correct); both workers repaired
  via HEAD-blob cacheinfo and verified status empty + blobs matching.
  Safe-commit also rejects directory paths (blockscreen2's first
  census commit attempt failed on that, retried with expanded file
  lists, nothing lost).
- check.js --quick NOT re-run at coordinator level (zero src/js, zero
  game-loaded code in either landing; arm proofs are the landing gate).
  Woodcarry's worker started it and killed it mid-run (290 scripts,
  still progressing past 4 min); not claimed green.
- No EPERM flap blocked this run.

## Next blanks, in order

1. Wood-carry retry under a NEW prereg: episode rescue rate primary,
   min-n 8 episodes, ~30 seeds or a creek-enriched band; include a
   still-refused ON creek evening tail to prove the lacking-line
   in play. (Backlog: wood-carry episode-rate item, open.)
2. Eveningdetour vs the 12-step route: does the detour lever walk the
   full BFS path, and should a 12-step night walk be offered? (13224.)
3. Narration pass: name the way around on refused evenings; mark
   nights away; name the lacking item on bridge refusals. (Third
   sighting of un-narrated exits.)
4. The banked 12 refused-prone seeds are published for the next pilot
   run — the census chain's next pilot no longer needs a screen.

food-economy stays converging (NOT converged): no food-economy fix
landed as game code this run (woodcarry INSUFFICIENT-DATA with lever
reverted; blockscreen2 BANKED is a census, not a fix). scale-onramp
stays converging (untouched; sibling loop A lane). Claim deleted;
lock deleted.

Evidence: this file (coordinator) + sim-woodcarry-b.md +
sim-woodcarry-b-prereg.md + sim-woodcarry-b-analysis.json +
sim-woodcarry-b-corpus-off/ + sim-woodcarry-b-corpus-on/ +
sim-woodcarry-b-corpus-off-ext/ + sim-woodcarry-b-corpus-on-ext/
(all on master) + sim-blockscreen2-b.md + sim-blockscreen2-b-prereg.md
+ sim-blockscreen2-b-scan.json + sim-blockscreen2-b-corpus-off/ +
sim-blockscreen2-b-corpus-on/ (all on master).
