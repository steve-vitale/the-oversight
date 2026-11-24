# Journey landing r158 — leg 0 LANDING (days 1–14 judged, horizon d28)

Run `playtest-loop-a-20261124T0759Z`, scheduled Tue 2026-11-24 01:45 CST.
Lane A leg 0. Base master `612872ae2` (scale r279). Lock
`playtest-loop.lock` run_id `playtest-loop-a-20261124T0759Z`, created
2026-11-24T07:59:17Z. Rotation read `0` → write `0→1` at closeout.
Worktree `~/workspace/worktrees/journey-landing`, branch `journey-landing`.

**Write flap 08:00–08:03Z:** first registration failed on refused writes
(`unable to write file tools/mobile-sim.html`, `version.json`,
`Could not reset index file`) — a flap window. Probed, waited for a
sustained clear (3 consecutive git+file probes, 08:06:26Z), re-registered;
checkout then took ~16 min under heavy sibling load (sibling gates +
registrations), registered 08:07:30Z heartbeat, verified at 612872ae2.
Leftover branch `journey-landing` from the failed attempt was at master tip
(no unique commits); the register script attached to it. Nothing lost.

**Registry-lock jam (ongoing at closeout):** heartbeat 08:26:05Z landed, then
every beat since failed on `registry lock held > 120s` — a Loop B release
reap (08:07–08:47) followed by flesh-out registrations/reaps. The hbloop
retries every 10 min; the lock is held by live sibling work, so per the
standing rule it was waited out, never killed. Heartbeat went stale during
the run; the lock file (own run_id) is the liveness record instead.

**Pre-flight:** main tree clean (`git status --short` empty). Disk 52%.
`git pull --ff-only`: already up to date. `worktree-reap.sh`: removed
nothing; LOUD on dirty trees (journey-scale-attr, sim-inffight-ab,
sim-redactor-a, sim-saycap-a, sim-secondlink-a, sim-siegedialog-a,
sim-gunholder-b, sim-retarget-a, sim-holdspeak-a, journey2-7); active 15/16.

## Prereg summary

`hidden_files/evidence/2026-11-24/journey-landing-r158-prereg.md`.
Seeds **1362–1371** — the r155 band, re-run deliberately for a before/after
on identical seeds. DAYS=28, policy competent verbatim, driver
`scripts/journey-landing-r158-20261124.js` (r157 driver verbatim except
OUTDIR/header/seeds).

**The blank this run fills — contest-death ledger gap (r155 filed, both
defects unbuilt; the commit-menu one was built in r156/r157, this one
remained):** seed 1364, Tanya died d27 in a Duel, ledger endDay still null
at d28 (`_contestDie` never emits `contest_end`).

**Metric-review decision made BEFORE this run:** M-PR1 counts only
TERMINATED-but-open entries (open entry + a participant death joined to
it), not bare endDay-null — a contest legitimately still in progress at the
horizon (r157's 1388 Siege) is not a defect. Recorded in the prereg before
playing.

## The defect, pinned in code before playing

The only `tele('contest_end')` in src lived in `_contestEnd`
(contests.js:5232). Three terminals never touch it:
- `_contestDie` (player + watched death) — the r155 path.
- `_contestRefuse`.
- The arena-lost branch of `_contestArenaAfter` (returns
  `{done:true, outcome:'died'}` directly).
Same class as the held-counter gap the `_cxCountHeld` comment documents
(r12): "every end path flows through here" was false for the counter, and
still false for the end telemetry. `_contestResolveOthers` also emits
nothing for co-taken fates, but those ride the same contest object, so
closing the terminal closes the contest. The ledger builder
(scripts/journey-landing-r62-20261027.js) takes endDay/outcome only from
`contest_end` tele rows; an unclosed entry's span is open-ended, so it
also swallows later deaths into the wrong contest (r155's d28 monster
deaths carried contestId `duel`, outcome null).

## Fix

`src/js/contests.js` (+22 lines): emit `tele('contest_end', {id, outcome})`
— the exact shape `_contestEnd` emits — from the three missing terminals:
- `_contestDie`: outcome `'died'`, placed after the `_dieLanded`
  per-participant guard so a re-entrant death emits nothing twice.
- `_contestRefuse`: outcome `'refused'`.
- `_contestArenaAfter` lost branch: outcome `'died'`; `'lost'` while a
  player-bearing phoenix link holds the death (mirrors the death-ledger
  block in the same branch — the fire holds it, so it is not a death yet).
`_contestEnd` itself is untouched (its per-contestant emission in
multi-take is existing analyzer-visible behavior; the ledger tolerates
multiple ends per contest via its endDays array).

## Proof test

`scripts/test-contest-end-tele-landing-r158.js` (new, sim-harness
loadGame + setupGame, seed 1364): watch-death, player-death (+ re-entry
emits once), refusal, arena-loss, arena-loss-with-phoenix-hold, and a
`_contestEnd` control. **RED on base 2/14** (only the control passes),
**GREEN on the fix 14/14**, exit 0. The player-death path stubs
`maybeCheatDeath` to true so the test game survives; the tele fires before
the cheat check, so the stub changes no assertion.

## Pilot — the r155 reproduction does NOT recur on current code

Seed 1364 alone, DAYS=28, fixed code first: exit 0. Contests are now
lockpick d15, beastmaster d17, tithe d22, cookfight d24 — all closed via
`_contestEnd` (won/won/lost/won). NO duel, NO price, Tanya lives to d28.
The trajectory drifted since r155 (Oct 27): game evolution (r156/r157
convo-wants fixes, endgame r275, succession r268, crisis r274) + driver
lineage changed what contests the seed offers. Per the prereg, the pilot
was then run on BASE (fix stashed): **byte-identical outcome** — same 4
contests, same days/outcomes, deaths 61 = 61, villager deaths 2 = 2,
pantry d28 48814 = 48814, pop 10 = 10. The fix is trajectory-neutral
(telemetry-only), and the base pilot confirms the duel no longer fires on
this seed on either code. The r155 census stands as the base measurement
for the band; the live panel below is the fixed-code measurement.

## Panel

Driver `scripts/journey-landing-r158-20261124.js`, DAYS=28, exit 0, all 10
seeds (spawns: Tanya, plus 9). Corpus 152 files in
`hidden_files/evidence/2026-11-24/landing-r158-after/`. Analyzers
`evidence/2026-11-24/journey-landing-r158-analyzers.sh`, 15/15 exit 0,
1719 lines. Log: `hidden_files/evidence/2026-11-24/journey-landing-r158-analyzers.log`.

| seed | spawn | systemDay | over | villager deaths | pantry/person d28 |
|---|---|---|---|---|---|
| 1362 | Jordan | 8 | no | 0 | 2,298 |
| 1363 | Carlos | 8 | no | 1 | 2,144 |
| 1364 | Tanya | 8 | no | 2 | 4,881 |
| 1365 | Evelyn | 9 | no | 2 | 6,676 |
| 1366 | Sanjay | 8 | no | 0 | 2,435 |
| 1367 | Marisol | 8 | no | 0 | 3,525 |
| 1368 | Bill | 8 | no | 3 | 1,390 |
| 1369 | Cesar | 8 | no | 1 | 2,311 |
| 1370 | Keisha | 8 | no | 2 | 5,100 |
| 1371 | Piper | 9 | no | 0 | 4,616 |

All 10 villages alive at d28. Scholar deaths 1 (1365 d27 "the wild" —
village continued under succession; registered with a cause). Villager
deaths 11, all registered. Contests: fired 22, ended 21 (won 19 / lost 2),
open at horizon 1 (1370 Sorting, fired d29 — still in progress, not a
defect). Monster kills 424 (baseline 411). Fights: 21 total (per-seed
counts 1/0/4/2/1/2/2/1/7/1); triggers classified pending-face/mixed-stack,
0 unknown; stuckFights 0.

**M-PR1 (primary): 0 terminated-but-open ledger entries on the band
(bar 0).** Checker `hidden_files/evidence/2026-11-24/mpr1-check-r158.py`:
TOTAL open=1 (1370 Sorting, fired d29, no participant death joined),
M-PR1-fail=0. Cross-check: the checker on the r155 corpus returns
M-PR1-fail=1 (1364 duel, Tanya died d27, outcome None) — the instrument
sees the defect where it exists. **Caveat, stated plainly:** NO
death/refusal/arena-loss terminal fired in the panel's 22 contests (0
`died`, 0 `refused` outcomes), so the live panel does not exercise the
fix's new code paths — the mechanism proof is the proof test (2/14 →
14/14). Death terminals are rare on this leg: 1 in the last 66 contests
across the r155–r158 bands (r156: 0/22, r157: 0/22, r158: 0/22). M-PR1
passes its bar as written; the live-play exercise is outstanding, not
re-scored.

**M-PR2:** 0 contest death autopsies with context LEDGER and null
contestOutcome (r155: the d28 duel deaths carried null). The autopsy span
no longer swallows post-contest deaths: 1370's open Sorting entry spans
nothing after d29, and no d28+ death carries a null outcome.

## Q1 adjudication — GO

- **M1 ALIVE-D14: PASS** — 10/10 alive at d28.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9 (systemDay 8 on eight seeds,
  9 on 1365/1371).
- **M3 FIGHT-LOG: PASS** — all fights carry known triggers
  (pending-face 3, mixed-stack 1 in the zerodmg sample; 0 unknown).
  Three shape-B stood-through fights, all refusedTurns 0, all won —
  the scholar repositioned while allies carried the kill (the adopted
  FIGHTALLY2 restatement).
- **Zero-DMG refused-turns: PASS (BINDS)** — refusedTurnsAllFights 0.
- **Practice: PASS** — see analyzer log.
- **Pocket: PASS (BINDS)** — 0 pocket fights, 0 sealed regions.
- **D1: PASS** — 0 garbled-label renders. D2: 0. D3: 0.
- **HEED: legacy 1 (1371 d9, 14 turns — watch only); HEED-V: PASS
  (BINDS)** — 0. WARNED-BUT-UNRESOLVED 0. All 5 warn_you sittings end
  resolved or honestly unestablished (see People check — the Devon d9
  sitting).
- **M-PR1 commit-offer (r156/r157 fix holds): PASS — 0/19 = 0% ≤ 15%.**
  R107: sittings=24, offered=17, picked=17, promised=12,
  statedAfterPick=5, neverOffered=5, settled=2. The 5 never-offered are
  ALL unestablished (1364 d15/d17, 1367 d14, 1368 d11, 1369 d12 — the
  favor never surfaces, correctly excluded); the 2 settled speak settled
  lines. Established = 24 − 5 = 19. No established sitting is
  never-offered. The 5 statedAfterPick are all honest away-guard refusals
  (below the ≥6 watch line).
- **Bridges: PASS** — see analyzer log (0 repeats in every pool).
- **R66 HUNGRY: NOT-HUNGRY** — starvationDeaths 0, slideSeeds 0,
  bandSeeds 6, noSlideSeeds 4. Thinnest village 1368 (1,390
  kcal/person) — watch continues.
- **Scholar deaths: PASS (≤2)** — 1 on the panel (1365 d27).
- **silentTurns / dry lines: PASS** — 0 empty THEM lines, nodloop
  TOTAL sittings=141, LOOP=0, mimeShown=0.
- **Other watches:** CONTEST LEDGER GO, STARVATION GO, OUTING GO,
  COMPLETION GO, ARMOR GO, PARTY GO, LABELING GO, RESCUE GO, WIND-DOWN
  GO, WD PROBE GATE-A/B GO, EAT GO, WINPLAN GOAL-LIVE at d14, PRACTICE GO.

## People check — PASS

Three full transcript reads (sense-testing law):
- **1364 d15, Marisol:** wants a Stonebridge link (accepted — "Go and
  ask"), declines a betrayal offer honestly ("Another time, then. A
  small thing, pocketed."), then the murder of Jamal surfaces with a
  press/approach/site/witnesses menu, and the sitting ends naming the
  mosquito beast ("The Ugly Bastard" / "Loud-Eyes" / "Ugly-Bane").
  Closing "Remember what we said. Hold me to it." is honest — it refers
  to the accepted link proposal. The ask_favor want ends unestablished
  because the sitting had other business, not because the menu failed.
- **1364 d17, Diana:** grieving — "Have you — sorry. I keep thinking
  about them." / "my head's still at the burial." She deflects the
  player's "something else" because her head is at the burial; grief
  shapes the conversation. A tellbeast beat follows ("A clipboard. a
  bullhorn. a sense of grievance.") with "word travels fast around a
  fire." Short sitting, coherent.
- **1371 d9, Devon (the flagged HEED sitting):** opens with a warning
  ("Listen. I need you to hear this before you go back out there.") that
  the bot never takes — it roams through party invite (accepted),
  personal story ("We should name this place. 'Camp' is what you call
  somewhere you're leaving."), gossip about Aaliyah, Devon's peacemaking
  ("I've talked down three fights this month"), and a wind-down beat
  ("Most fights start because nobody asked what the other person actually
  wanted. I ask."), ending on a beast-naming vote ("The Bailiff" /
  "Judge Hoot" / "Old Gavel"). The warning stays offered, never forced;
  the sitting ends unresolved because the player dodged the lecture, not
  because the NPC broke. The legacy HEED flag measures the bot's
  wandering; HEED-V (binding) is 0. Correctly not a failure.

No dead villager speaks. No fabricated shared history. No filler loops
(the RE-OFFER markers are instrument noise — menu re-offers across turns,
not dialogue repetition).

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r158-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**quiet (10 files, 5 metrics, no large deviations).** No LOUD lines, no
investigation needed, baseline NOT re-pinned. Panel values for the record:
monsterKills 424 (baseline 411), villagerDeaths 11 (baseline 10),
starvationDeaths 0.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r158-gate`
in the worktree: **339 passed, 5 failed in 941s** — exactly the standing-5
set, 0 attributable to this fix:
- test-phone-frame-proof.js (stale receipt — index.html; pre-existing)
- test-living-garden-deed-attainment.js (120s timeout — load flake;
  green standalone per r157)
- test-one-person-army-deed-attainment.js (120s timeout — load flake)
- test-measurement-proof-update.js + test-measurement-workflow.js
  (staleness pair — pre-existing)
Gate PASS. The new proof test is not in the gate's 344 (green-list net —
same as r156/r157's proof tests); it was run standalone red→green
(2/14 → 14/14) and re-run green after the panel with the fix in place
(see Proof test).

## Verdicts

- **Reachable:** yes — the landing leg plays end to end on all 10 seeds;
  System contact by d9 everywhere; contests fire from d14.
- **Fun:** yes — see People check; villages stay alive, thin, and
  storied; no softlocks, no silent turns.
- **Winnable:** not judged on this leg (landing horizon d28; the win
  chain is a later-leg question).
- **Q1: GO. M-PR1: PASS on its bar (0 failures), live exercise
  outstanding (no death/refusal terminal fired in 22 contests).**

## Metric review

- M-PR1's pre-run refinement (terminated-but-open, not bare endDay-null)
  was necessary and correct: the panel's one open entry (1370 Sorting,
  fired d29) is legitimately in progress, and the checker excludes it.
  Without the refinement the run would have false-failed.
- The live-exercise gap is a measurement-design finding, not a re-score:
  death/refusal terminals fire ~1 in 66 contests on the landing leg, so
  a 10-seed panel usually cannot exercise a death-terminal fix. Proposal
  for the NEXT run (not this one): a contest-heavy probe — drive a band
  with contest frequency raised, or run the panel to a longer horizon —
  to catch a death terminal live. Do NOT narrow M-PR1 to the proof test
  alone; the live exercise stays owed.
- The r155→r158 band comparison conflates game evolution with the fix
  (trajectories drifted since Oct 27). The proof test isolates the fix;
  the panel measures live behavior. Both are reported; neither is
  presented as the other's evidence.

## Closeout

- Commit 1: `5f2e5477d` (6 files, contests.js +22, proof test, driver,
  analyzers, prereg, run note). Safe-commit index clobber struck (5
  new files showed D); repaired via ls-tree -r + update-index
  --index-info; status clean, all hashes match HEAD.
- Master moved during the run (sibling sim-retarget-a merged to
  `a77a5a749`); rebased cleanly (1/1, no conflicts) to `223af1090`;
  proof test re-run green 14/14 on the rebased tip. Remote origin/master
  (`e5dd61e96`, batch ship) is an ancestor of the local tip — no
  divergence, no revert risk.
- Gate 339/5 (standing-5, 0 attributable), merged via
  `git merge --ff-only journey-landing` from the main tree; worktree
  released + removed; rotation 0→1; lock deleted (run_id verified in
  the same call); hbloop killed. Merged locally, pending ship.
