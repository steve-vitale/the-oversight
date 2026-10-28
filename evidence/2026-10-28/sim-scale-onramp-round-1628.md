# Long-run sim loop — scale-onramp round 1628 (2026-10-28)

Run: fleshout-20261028T1628Z. Axis: scale-onramp (converging, topmost
unconverged axis not named in any live claim). Sibling loop B was live on
food-economy the whole run (claim fleshout-loop-b-20261028T1530Z,
onceaday-refresh + grantpersist, heartbeats fresh) — NOT touched.
Standing directive (scale wall) still applies: this run attacks it via
the 1528Z run's named next blank #1, field-party formation on meeting.

## Pre-registration (this round)

- Primary metric (both arms): a fought wave-4 field party on the shared
  band — at least 1 wave-4 field meeting forming a party (>=2 fighters)
  and fighting.
- GO threshold: primary >= 1, with guards median survival >= 117d
  (80% of the 146d control) and starvation <= 2, and no wave-5 claim.
  A game/policy change lands only if its pilot band passes AND a
  confirm band (seeds 75109–75116, own control) also passes the primary.
- Horizon + why: 180d death-aware — the band's villages live to ~146d
  median, so 180d covers the wave-4 window without simulating dead
  villages.
- Seeds / substrate: 75101–75108, tableseat-nowait verbatim,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1 (identical to the 1528Z control).
- Control (1528Z, reproduced exactly by fieldfeed's own no-feed band):
  universe 44, faced 21, engaged 21, killed 2 (both TB scholar-led);
  field wave-4 meetings 24, all solo, field kills 0; demand-met 2/50;
  wall national ever 7/8, final 6/8; table invited 4/8, entered 3/8;
  wins 3/8, all lesser, full seat 0/8; wave-4 reach 6/8, wave-5 0/8;
  median 146d; deaths 286; starvation 1.

## Arm 1 — sim-fieldfeed-a: FEED THE WILD MEETING (game code)

Wired `Game.presentFightAllies(vid)` (party-wiring.js): the existing
`villagerFightAllies` (trust >= 15, cap 2) filtered to villagers on or
adjacent to the fighter's node — the earshot radius that logic already
defines, no new radius, no radar, no teleporting. The
resolveWildMonsterEncounter / resolvePatrol PARTY-UP blocks feed it for
non-raid, non-aid-crisis fights only; raid, aid-crisis, and expedition
channels untouched; no monster stats, wave gates, table gates, or spawn
rates changed. Proof test passed 18/18 on the armed code.

- Pilot (75101–75108, armed): PRIMARY PASS — 4 formed wave-4 field
  parties of 9 judged meetings (all formed-but-retreated, counted as
  formed per prereg), tile-could-form 9, fed 9, fed-but-unanswered 0.
  Own no-feed control reproduced the 1528Z control EXACTLY (wall,
  median, deaths, starvation, judged 18, fed 0, formed 0) — and
  sharpened the diagnosis: earshot trusts run 25–94, so the old feed
  failed on input, not willingness.
- Guards (pilot): median 132d PASS; starvation 7 FAIL (concentrated on
  two early-collapse seeds, 75103/75105); wave-5 0. LAND already blocked
  on the guard.
- Confirm (75109–75116, armed): PRIMARY FAIL — 0 formed of 7 judged
  meetings (2 fed but both ended in round 1, before the round->=2 shout
  branch can fire; 5 earshot-empty; 0 patrol). Own no-feed control: 13
  judged, 12 tile-could-form, fed 0, formed 0 — the seeds do produce
  meetings, so the low armed count is a trajectory effect (faster wins
  ending runs), not feed suppression. Confirm guards all PASS (median
  143d, starvation 0, wave-5 0); confirm wall favourable (national ever
  8/8, final 7/8, wins 5/8 vs control 6/8, 3/8, 1/8; deaths 236 vs 314)
  but a favourable wall cannot rescue a failed primary — no re-scoring.
- Verdict: PILOT-GO-ONLY. Game change REVERTED (commit fb04bac55),
  proof test removed with it; branch merged evidence-only, zero src/js
  diff vs master. Wave-4 field parties are reachable (proven); wave-4
  field kills still 0 on every band (all formed parties retreated);
  wave-5 0 everywhere; all wins lesser, full seat 0.
- Sense: pilot 75106 d118 — Elmarie, losing to the influencer, shouts:
  "Elmarie is losing — shouts for help! Jorge charges in!" — Jorge
  takes a 65-damage hit, and the pair retreats together ("runs while
  running still works"). A party judging a fight, not a mechanism
  firing. Contrast control 75106 d96: Ingrid dies solo in 2 rounds
  with 6 trusted armed villagers in earshot, no shout at all.
- Caveat (disclosed in arm evidence): check.js --quick on armed code
  284 passed / 6 failed, failure names lost (piped through tail -5);
  targeted combat/party tests green (party-wiring 10/10, aid 9/9,
  monsters3 26/26, monsterknowledge 1743); check-wired 0 unwired. Two
  failures (fieldguard-probe, break-monsters5-wavekills
  `Text is not defined`) reproduce identically on base code —
  pre-existing, verified.
- Evidence: evidence/2026-10-28/sim-fieldfeed-a.md (+ prereg),
  corpora perseed-fieldfeed-a{-control,-confirm,-confirm-control}/,
  instruments scripts/test-fieldfeed-a-{sweep,analyze,sense}.js and
  scripts/policies/fieldfeed-diag.js.

## Arm 2 — sim-outdoorcrew-a: OUTDOOR CREW / JOINT OUTINGS (policy only)

Policy variant sent villagers out in forage pairs every part (1,881
pairs, 3,839 sent out, 1,181 honest obedience refusals counted, never
forced) so the crew path would already be populated when a member met
a monster. Zero src/js changes throughout; no radar (policy never
reads monster positions or routes to monster tiles).

- Pilot (75101–75108): PRIMARY FAIL — 0 formed wave-4 field meetings.
  Mechanism check FIRED massively: crewRaw non-empty 633/907 meetings
  all waves (vs 0/1,272 control); judged wave-4 field meetings 19, of
  which CREWED 17, FORMED 0. Judged outcomes: vDie 10, vFlee 9, vKill 0.
  All 17 crewed meetings: rounds 1–2, everHopeless false, intent engage
  (crew flips intent from learn-first — a real effect, just not a
  joining one). Wave-4 field kills 0, as in control.
- Contrast that proves the gate: wave 3 formed parties in 8/16 field
  meetings (rounds 3–5, hopeless fired, mate charged in — then all 8
  still fled). The shout works; wave-4 fights are just too short for it.
- Guards: median 118d PASS by one day (bar >= 117d, control 146d — down
  28); starvation 1 PASS. Wall: national ever/final 6/8 / 4/8 (control
  7/8 / 6/8); table invited/entered 3/8 / 2/8 (control 4/8 / 3/8); wins
  2/8, all lesser, full seat 0/8 (control 3/8); wave-4 reach 7/8,
  wave-5 0/8; deaths 306 (control 286). Outings did not move the wall.
- Verdict: NO-GO, sub-class FED-NO-FORM. Policy variant DELETED per
  NO-GO discipline (survives in branch history for re-runs); branch
  merged evidence + instruments only.
- Sense: replay of 75103 (d60–d107) — outings read like parallel solo
  errands, not joint outings: narration always singular ("Greta heads
  out to forage"), the only joint phrase the engine's throttle line
  ("turns the foraging party back"). When the leader dies in 2 rounds,
  the fiction never mentions the crew-mate who was out there with him
  — fed-but-unjoined is invisible. The trust-sorted pair also makes
  one veteran (Olivia Bennett) the near-permanent partner, which reads
  more like a mechanism sorting than people choosing.
- Evidence: evidence/2026-10-28/sim-outdoorcrew-a.md (+ prereg),
  corpus perseed-outdoorcrew-a/, instruments
  scripts/test-outdoorcrew-a{,-sweep,-proof,-sense}.js (analyzer
  reproduces NO-GO; proof PROOF-GREEN post-rebase).

## The wall, this round (judged corpora)

- Field parties: reachable at last (4 formed, pilot band) but they
  retreat, never kill in the field. Field kills 0 on every band.
- National ever 6–8/8, final 4–7/8; table entered 2–5/8; wins 2–5/8,
  ALL lesser; full seat 0 everywhere; wave-4 reach 4–8/8; wave-5 0
  everywhere; median survival 118–146d.
- The binding step has moved one notch down: the feed is no longer the
  problem — presence is feedable (both arms prove it) — but a wave-4
  field fight ends before help can arrive (round-1 ends, hopeless
  never fires) and, when help does arrive, the party judges the fight
  unwinnable and retreats. The next arm is the shout/hopeless gate
  itself: fight length, the hopeless trajectory, or an earlier join
  for a crew that walked out together — NOT another feed.

## Village assessment (plain words)

The village can now see its own people standing next to a neighbour
in danger, and on the pilot band it acted on it four times — someone
shouted, someone charged in, and the two of them got out alive
together. That is people-like. What it cannot yet do is turn that
moment into a kill: wave-4 beasts hit too hard and too fast for a
second villager to change the ending, so every field party so far is
a rescue, not a victory. The lesser seat still wins through the
table's courtship instruments; the full seat is still untouched, and
wave 5 is still unseen, because the village still has no way to
actually kill a wave-4 beast outside the table's attrition channel.

## Metric review

- The fieldfeed primary (>=1 formed party) is opportunity-sensitive:
  it needs company on the tile AND a fight lasting to round 2. The
  pilot passed on 4 chances, the confirm failed on 7 meetings with
  only 2 fed. Next arm must pre-register a fed-rate or meeting-floor
  leg alongside FORMED, so a thin band cannot fail a working feed on
  opportunity alone — but the fed-rate leg must not be substituted
  for FORMED after the fact (this round did not re-score).
- The pilot wound-load signal (engaged fights wounding two villagers
  vs one) did not replicate on confirm — do not carry it forward.
- Balanced panel: no census-ingest mode fits these instrument corpora;
  paired before/after tables are the §15 substitute (as in 1528Z), no
  panel output faked. Telemetry check below carries the same known
  ingest-artifact class.
- No metric was re-scored mid-run. The starvation guard blocked a
  pilot LAND before the confirm even ran; the confirm primary failure
  sealed pilot-GO-only.

## Telemetry deviation check

Run against hidden_files/telemetry-baselines/scale-wall.json on the
outdoorcrew and fieldfeed-pilot per-seed corpora (see closeout log).
Verdict: LOUD lines are the known WINSEAT-regime + field-shape
artifact class from 1528Z (baseline rows carry top-level
national/table/wins; these corpora carry nationalEver/entered/won
per seed, and the fieldfeed pilot corpus is an armed-band row set, not
a WINSEAT baseline band) — baseline NOT rolled, no new investigation.
True wall numbers are those in the arm sections above.

## Blanks filled / documented

- FILLED (as measurement, not as landed game change): wild meetings
  CAN be fed — presence feed proven working (fieldfeed pilot 4
  formed; outdoorcrew 633/907 crewed). The 1528Z blank #1 question is
  answered: feeding alone does not produce field kills.
- DOCUMENTED (backlog, this round): the wave-4 shout/hopeless gate
  (FED-NO-SHOUT class: crew present, everHopeless false) and the
  formed-but-retreated outcome (parties judge and retreat; no field
  kill path yet) — see sim-findings.md additions.
- NOT chased mid-run (stay on axis): veteran survivorship, TB
  attrition shape (steve-call candidate), tricks-bar saturation,
  raid-draft endings — all still open in the backlog.

## Infrastructure

- Master moved under the run (ship-loop version bump + journey r66);
  both branches rebased clean (zero file overlap with master moves),
  proofs re-run green post-rebase (outdoorcrew analyzer NO-GO +
  proof PROOF-GREEN; fieldfeed analyzer reproduces pilot verdict),
  ff-only merges clean. Safe-commit index clobber hit worker commits;
  repaired via HEAD-blob cacheinfo each time, never reset. No EPERM
  flap this run. check.js --quick NOT re-run by coordinator: zero
  src/js in either merged branch (fieldfeed game change reverted),
  zero green-list files; armed-code check results are disclosed in
  the arm evidence.
- Merged locally, pending ship. No push, no bump, no live verification
  (ship-loop line). Commits: outdoorcrew 958134829 (rebased from
  bd927c1e9); fieldfeed b9d732b51 (rebased from 92ef00881).
- Claim deleted; lock deleted at closeout.

## Next blanks, in order

1. THE SHOUT/HOPELESS GATE — fight length / hopeless trajectory /
   an earlier join for a crew that walked out together. Pre-register
   FORMED on a fought wave-4 field party with FED-NO-SHOUT (crew
   present, everHopeless false) as the named class, plus a fed-rate
   or meeting-floor leg so a thin band cannot fail a working feed on
   opportunity alone.
2. FORMED-BUT-RETREATED — why a formed party never kills in the field:
   damage per round vs 850–1500 HP beasts, retreat thresholds, whether
   a party that stays should be able to finish. Measured against the
   wave-4 demand (party + fully geared), not solo play.
3. Veteran survivorship (0.12 mean at 1415Z; both 1415Z killers dead);
   TB attrition shape design look (steve-call candidate).
