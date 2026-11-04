# Standing-accumulation diag — Loop B verdict (run fleshout-loop-b-20261104T1830Z, arm sim-standaccum-b)

Axis: winnability chain (standing accumulation on gear-ready seeds —
the 99107 pattern; re-point queue item 3; gearbar "Next blanks" #2).
DIAG ONLY, zero src/js. Gates and prices untouched.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-standaccum-b-prereg.md`
(commit 798a5fe3f). In short: competent policy verbatim, default
env, seeds 99101–99108 (the gearbar band re-run on current master),
150d death-aware horizon, daily standing snapshots (raw + gated,
war/diplomacy/plenty split, ledger per wave, full link roll with
count reasons, feast log, readiness-5 bars). DIAG-GO iff: (1)
trajectory classified on all 8 seeds; (2) top missing
standing-income source named with counts on >= 6/8 seeds; (3)
gear-ready days identified on >= 1 seed, or gear-ready absence
reported with that band's gear bars.

## Grounding verified in code before the pilot (not assumed)

- `src/js/standing.js` `villageStanding()`: war = ledger points
  (waves 3+4+5) × 25; diplomacy = seasoned REGIONAL+ links × 34;
  plenty = qualifying feasts (quality >= 1) × 20. Thresholds
  t4 = 100, t5 = 200. `villageStandingTotal()` is the GATED number:
  plenty counts at most 100 toward T5, and while any readiness-5
  bar is short the total holds at t5-1 (199).
- Seasoned (`src/js/hierarchy.js` `_linkSeasoned`): active, 30+
  days old, trust 40+ (conquered: season only). Regional+
  (`standing.js` `_linkRegionalPlus`): LEAD / BELONG / LEAGUE
  polity participation — a seasoned bond with a splinter village
  scores 0.
- Canon: `docs/MONSTER-WAVES.md` covers the standing gate and the
  readiness gate ("Standing opens the wave door; combat readiness
  decides whether the village walks through"). No canon invented.
- Links are born only through player-driven conversation answers
  (`hierarchy.js` `_formLink` callers: primacy/covenant answers,
  raid/conquest answers; plus debug scenarios). There is no
  autonomous villager link-formation path in the callers found.

## Verdict — DIAG-GO (judged only against the prereg)

1. Trajectory classified on 8/8 seeds: 7 mixed-shortfall,
   1 war-starved (99108). No seed released, none bread-capped
   under the prereg classes (see metric review: the classes did
   not anticipate the actual finding — diplomacy ABSENT, not
   starved — and the finding is reported alongside, not
   re-scored).
2. Top missing source named with counts on 8/8 seeds:
   diplomacy on 7/8 (0 counting links, 0 near-miss links — the
   pool itself is empty), war on 1/8 (99108: 0 ledger points).
3. Gear-ready days identified on 8/8 seeds (14–111 days each;
   gear bars met from day 2 on most seeds — starter gear +
   whittling, as gearbar found).
Instrument errors 0 on all 8 seeds (~860 snapshots). Proof:
`scripts/test-standaccum-20261104.js` — 13/13 PASS (10 fixture
tests, live harness smoke with the breakdown reconciling exactly,
determinism leg). No balanced-panel comparison exists for a diag,
so none is fabricated and none is attached (per §15, stated not
omitted silently).

## THE STANDING ANSWER (plain words)

On gear-ready days, standing is whatever war and bread built —
and bonds contribute nothing, on every seed, because no village
ever forms a single link.

- **Diplomacy is not short. It is absent.** 0 counting links, 0
  seasoned links, 0 young links, 0 broken links — `linkTotal`
  (every link ever created, including broken ones) is 0 on all
  ~860 snapshots across all 8 seeds. There is no near-miss pool
  to tend: no link is a week from seasoning, none is a few trust
  from 40, none is a splinter bond waiting on a polity. The
  diplomacy leg of standing never takes its first step under
  competent play. The competent policy's conversation choices
  never accept a bond, and no village-visit line appears in any
  seed's say sample. (Whether villagers should pursue bonds on
  their own is a design question for the next arm — this diag
  measures that they don't, under this policy.)
- **War carries the climb, bread helps, and both stall short.**
  Peak raw standing per seed: 355 / 215 / 180 / 225 / 140 /
  150 / 50 / 20. At peak, war is 150 / 175 / 100 / 200 / 100 /
  150 / 50 / 0 and plenty is 60 / 40 / 80 / 0 / 40 / 0 / 0 / 20.
  Plenty never nears its 100 gate-cap (max 80), so the bread
  cap is not what holds anyone back.
- **Three seeds clear 200 raw and still sit at gated 199.**
  99101 (raw 355), 99102 (215), 99104 (225) all hold at 199
  because readiness-5 is short — on all three, the ONLY short
  bar at peak is veterans (0 of 2; armored/armed/tricks all met).
  The System says so aloud, honestly: "Standing 210 (war 150 ·
  bonds 0 · bread 60) — wave 4 at 100, wave 5 at 200 — HELD at
  wave 4: the fifth draft waits (blood your fighters (0 of 2
  veterans))". Standing opened the door; veterans kept it shut.
  99102 additionally never faced wave 4, so it would need that
  too — but readiness already blocks it.
- **What moved standing in the 30 days before peak:** war, and
  only war (plus a little bread). Peak-window deltas: war +50 /
  +125 / +50 / +125 / +100 / +150 / +50 / (no window: peak day
  26), diplomacy +0 on all 7 windows with a window, plenty +40 /
  +20 / +20 / +0 / +40 / +0 / +0. Transition events in those
  windows: 2–6 ledger gains per seed, 0–2 feast additions,
  ZERO link events of any kind (no appearance, no seasoning,
  no dissolution — there is nothing to transition).
- **Gear-ready days are not high-standing days.** Gear bars are
  met from day 2 on most seeds (first gear-ready day: 2 / 2 /
  36 / 19 / 2 / 2 / 4 / 2), when standing is 0–20. Standing
  grows later, while gear bars decay with the roster: on 99107
  every gear-ready day sits at standing 0 (peak 50 comes after
  the last gear day, when only 2 people are left). The 99107
  pattern from gearbar does NOT recur on this master: seed
  99107 now peaks at 50, never meets veterans, never faces
  wave 4 — trajectories drift with base moves, so only this
  run's numbers are cited (as preregistered).

## Per-seed table (peak = first day at peak gated standing)

| seed | days | end | peak gated (day) | peak raw | war / bonds / bread at peak | ledger 3/4/5 | feasts qual | ready days | gear days | max armored/armed/tricks/vets |
|------|------|-----|------------------|----------|-----------------------------|--------------|-------------|------------|-----------|-------------------------------|
| 99101 | 150 | survived | 199 (98) | 355 | 150 / 0 / 60 | 6/0/0 | 3 | 0 | 69 | 5/12/29/1 |
| 99102 | 116 | lost | 199 (103) | 215 | 175 / 0 / 40 | 7/0/0 | 2 | 0 | 111 | 6/12/26/0 |
| 99103 | 121 | lost | 180 (95) | 180 | 100 / 0 / 80 | 3/1/0 | 4 | 0 | 46 | 5/11/25/1 |
| 99104 | 150 | survived | 199 (121) | 225 | 200 / 0 / 0 | 6/2/0 | 0 | 0 | 111 | 9/12/24/1 |
| 99105 | 52 | lost | 140 (51) | 140 | 100 / 0 / 40 | 3/1/0 | 2 | 0 | 26 | 7/12/21/1 |
| 99106 | 59 | lost | 150 (52) | 150 | 150 / 0 / 0 | 6/0/0 | 0 | 0 | 42 | 7/12/32/0 |
| 99107 | 72 | lost | 50 (54) | 50 | 50 / 0 / 0 | 2/0/0 | 0 | 0 | 14 | 4/11/21/0 |
| 99108 | 48 | lost | 20 (26) | 20 | 0 / 0 / 20 | 0/0/0 | 1 | 0 | 45 | 7/12/19/0 |

Readiness-5-ready days: 0 on all 8 seeds. The binding bar is
veterans everywhere (max living wave-4 killers: 1 / 0 / 1 / 1 /
1 / 0 / 0 / 0 vs demand 2). Tricks never bind (max 19–32 vs
demand 3); armored/armed bind only at end-collapse (99106's
peak snapshot is short weapons too, 5 of 6, as its roster fell).

## Wall numbers (this pilot, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on all 8;
no seed leaves village scale). Wave-4 unlocks 6/8, wave-4 faced
4/8 (99101, 99103, 99104, 99105), wave-5 unlocks 0/8, wave-5
faced 0/8. Median run-days 116 (2 seeds censored at the 150d
horizon: 99101, 99104 survived). Death causes not instrumented
by this arm — not reported, not guessed. These are the baseline
the next arm measures against, not a claim the wall moved.
Comparison note (band-level only): gearbar's median was 90d
with 0 survivors; this run's 116d with 2 survivors reflects
base moves since 2026-11-03, not a lever — no lever was played.

## Village assessment (plain words)

Picture eight villages playing competently for one to five
months. Nobody ever shakes hands with another village — not
once, not even a failed courtship. They fight, they feast, and
their standing climbs on blood and bread alone: three villages
climb past 200 and still wait at the fifth door, because the
fighters who could walk through it died before they became
veterans twice over. The other five never get close. The
village that feasts most (99103, four feasts, 80 bread) still
sits 20 short of the door with zero bonds. A village can be
fully geared from the second day and still have nothing to
show the System but kills. The missing income is not a number
to tune — it is a whole road nobody walks: bonds.

## Sense-test

- The System's standing line is coherent and honest against
  the numbers on every peak snapshot: it names war, bonds 0,
  bread, both thresholds, and the short bar (veterans 0 of 2)
  when held. No silent gate was found.
- Feast lines are coherent: named host, menu, eaters, cost
  felt ("Nobody says what this cost — everybody knows").
- Say-filter noise (instrument note, not a game finding): the
  standing filter matches pantry "leaves the fish nets standing"
  and "blink" contains "link", so the 150-line cap fills with
  pantry/retelling lines — the same class as gearbar's garden
  noise. Standing-related lines that ARE on-topic (feast
  hosting, the standing line itself) are coherent. A tighter
  filter (Standing \d|FEAST —|HELD|draft waits) is proposed for
  the next arm.
- No robotic villager behavior was flagged by this arm's
  corpus; the sense-test gap is the opposite — villagers never
  talk about other villages at all, matching the zero-link
  numbers. If bonds are meant to be a live road, its absence
  from village talk is itself the tell.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The prereg trajectory classes assumed a near-miss diplomacy
  pool exists to be starved. It doesn't: 0 links on 8/8 seeds
  means "diplomacy-starved" (which requires a near-miss pool)
  never fires, and 7 seeds land in "mixed-shortfall" by
  elimination. Proposed new class for the next arm (not applied
  here): `diplomacy-absent` — zero links ever created
  (`linkTotal` 0 across all snapshots), distinct from starved
  (links exist but none count). The verdict stands on the
  prereg classes plus the counts, which already separate the
  two.
- First-gear-ready anchors fall on day 2–4 on most seeds, so
  their prior-30d window is null by construction. The peak-day
  prior-30d window (added to the analyzer with a proof test
  before the pilot analysis, not as a re-score — the GO clauses
  are unchanged) is the substantive window and is what the
  evidence reports. Next arm: anchor the "what moved it" window
  at peak standing in the prereg itself.
- Snapshot cadence is ~daily (149 snapshots over 150 days on
  99101): policy.daily does not fire every calendar day, so
  windows are snapshot-day windows, not strictly calendar
  windows. A counting link needs 30 days alive, so daily
  snapshots cannot miss one; and `linkTotal` (all links ever
  created, broken included) is 0, so no link formed and
  dissolved between snapshots either.
- Seed-band pairing note: same seeds as gearbar, but the
  branch moved since (two survivors here vs zero there; 99107
  peaks at 50 here vs 150 with all bars met there). Standing
  findings stand on this run alone; cross-arm seed pairing is
  band-level, not trajectory-identical.

## Next blanks, in order

1. Diplomacy-absent (this arm's finding): why competent play
   never forms a link — is it policy conversation choices never
   accepting a bond, villages never met, or both? Needs a
   link-seeking probe (a policy that travels to known villages
   and accepts bonds) before any gate/price discussion. Gates
   and prices stay untouched unless Steve orders otherwise.
2. Veterans-production + killer survival (vetbar blank 1, still
   open, now sharpened): readiness-5's only short bar at peak
   on the three 199-held seeds is veterans (0 of 2). The
   199-hold is a veterans problem wearing a standing costume.
3. Standing accumulation on gear-ready seeds, part 2: after
   blanks 1–2, re-measure whether a bond-forming village reaches
   200 gated AND ready — the release this arm never observed.

## Proof and landing

- Proof: `scripts/test-standaccum-20261104.js` — 13/13 PASS
  (11 fixture tests + live harness smoke + determinism leg).
  Re-run post-commit below.
- Commits (this worktree branch sim-standaccum-b; coordinator
  merges via --ff-only; merged locally, pending ship — no push,
  no bump, no live verification by this worker):
  - 798a5fe3f sim-standaccum-b prereg (before any judged sim)
  - 4b7f3da9d sim-standaccum-b instruments + proof 12/12 (zero src/js)
  - c6c11ae29 sim-standaccum-b pilot + evidence
    (analyzer peak-window + gear-day-standing additions with
    proof now 13/13; per-seed JSONs)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-standaccum-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-standaccum-b/` (8 files,
  standaccum-pilot run); scripts
  `standaccum-instrument-20261104.js`,
  `standaccum-driver-20261104.js`,
  `standaccum-analyze-20261104.js`,
  `test-standaccum-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after both commits (prereg +
  instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status` empty
  + `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
