# sim-gatehorizon-reprereg-b — pilot verdict (Loop B run fleshout-loop-b-20261123T2130Z, adoption)

**Verdict: NO-GO kind CONCEPT-DEAD** (pilot, 8 seeds, frozen bars judged as written).

The re-prereg'd gate does what it claims — it saves leaders — and still fails.
It refused all eight staged doors, every one of them winnable on control
(8/8 fought, 8/8 killed, 0 leader deaths), and the armed villages came out
worse where it counts: 3 fewer downstream wave-4 kills than the frozen
tolerance allows, wave-5 kills collapsed 20 → 7, one village never unlocked
wave 5 at all, and the village lost 58 more people overall. The gate's
projection refuses fights a geared party of four wins. Saving 5 leaders at
the pool level cost 3 wave-4 kills, 13 wave-5 kills, and 58 villagers. That
is the concept failing, not the instrument.

## §0 Prereg header (frozen — judged against these bars only)

- **Frozen prereg:** `evidence/2026-11-23/sim-gatehorizon-reprereg-b-prereg.md`
  (frozen 2026-11-23 ~19:10 UTC; anchor commit `7cedb55d60a188f36e0eef7f6908b79bbf9bdd7e`).
- **Base:** worktree HEAD `dbe748d46` at arm start; prereg commit `7cedb55d6`
  adds only the prereg + spec JSON (zero code changes vs base). Anchor
  verified on every corpus file (D5 PASS).
- **Arm:** `gatehorizon-reprereg-b` — 150-day horizon re-judge of LEADERPROJ
  (the leader-projection gate: refuse a pinned-quad wave-4+ door when the
  leader is projected ≤ 25 HP after two rounds at 25/round, i.e. leader
  HP ≤ 75), with deaths-log H1a attribution (the 1730Z metric-review §7
  defect fix), relaxed quad staging, and boundary logging.
- **Band:** 109201–109216; **pilot 109201–109208** (this verdict), confirm
  109209–109216 only on pilot GO. Freshness verified in the frozen prereg.
- **Policy:** `capable` (sha `4c4d1535d76c`, first 12) over base `competent`
  (sha `1884c8852d38`). Substrate both legs: `SENSEEXPED=1 PARTYSIZE4=1
  VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1
  PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`; armed adds
  `LEADERPROJ=1` only. Zero `src/` changes in this arm.
- **Legs:** control (gate OFF) + armed (`LEADERPROJ=1`), one staged pool
  door per scored seed, 150d horizon, death-aware (runs end at
  `Game.over`). Legs ran 2026-11-23 19:57–21:00Z, both exit 0
  (`gatehorizon-reprereg-b-legs.log`).
- **Instrument:** `scripts/gatehorizon-reprereg-driver-b.js`,
  `scripts/analyze-gatehorizon-reprereg-b.js` (NEW), `scripts/test-gatehorizon-reprereg-b.js`
  (NEW, M3m). Panel builder `scripts/build-pinquaddoor-b-panels.js` reused verbatim.
- **What this arm fixed vs gatehorizon-b (1730Z):** (a) H1a attribution via
  the deaths log, not the synchronous `p.dead` flag; (b) relaxed quad
  (any living non-scholar villager, ranging first) + a boundary log at
  every 10-day chunk; (c) organic unpinned doors counted in H1a; (d) the
  door-10 armor pre-check retained; (e) unscored reasons split
  (`won`/`lost`/`no-unlock`/`no-quad`/`unstageable`).

## §1 Frozen-bar table (M1–M5; a miss is NO-GO, never re-scored)

| Bar | Frozen target | Measured | Result |
|---|---|---|---|
| M1 port gate (`test-allyslot3-b.js`) | 18/18 | 18/18, exit 0 | PASS |
| M2 staged pin proof (`test-pinquaddoor-b.js`) | 35/35 | 35/35, exit 0 | PASS |
| M2w wide-instrument proof (`test-pinquaddoor-wide-b.js` + analyzer selftest) | 16/16 | 16/16, exit 0 | PASS |
| M3 damage proof (`test-dmgpin-b.js`) | 29/29 | 29/29, exit 0 | PASS |
| M3d staying proof (`test-doorflee2-b.js`) | 49/49 | 49/49, exit 0 | PASS |
| M3e downedtwice regression (`test-downedtwice-b.js`) | 25/25, exit 0 | 25/25, exit 0 | PASS |
| M3f floor proof (`test-hypofloor-b.js`) | 48/48 | 48/48, exit 0 | PASS |
| M3g whole-party gate proof (`test-hpgate-b.js`) | 43/43 | 43/43, exit 0 | PASS |
| M3h leader-gate proof (`test-leaderhpgate-b.js`) | 50/50 | 50/50, exit 0 (battery 1, pre-rebase) | PASS |
| M3i projection-gate proof (`test-leaderproj-b.js`) | 55/55 | 55/55, exit 0 (standalone, post-rebase battery 2); also 55/55 nested in M3m §6, twice | PASS |
| M3j durable-log proof (`test-gateavoid-b.js`) | 36/36 | 36/36, exit 0; also 36/36 nested in M3m §6 post-rebase | PASS |
| M3k screen proof (`test-gateavoid-screen-b.js`) | 11/11 | 11/11, exit 0 | PASS |
| M3m re-prereg proof (`test-gatehorizon-reprereg-b.js`) | count at build | **47/47, exit 0** (final run, post-rebase, after the two instrument fixes below) | PASS |
| Analyzer selftest (`analyze-gatehorizon-reprereg-b.js --selftest`) | all green | 20/20, exit 0 | PASS |
| Supply (pilot) | scored ≥ 6 of 8 | 8/8 both legs | PASS |
| H1a pool-door leader deaths (deaths-log) | armed ≤ control − 1 | control 10 → armed 5 (Δ −5) | PASS |
| H1b downstream wave-4 kills | armed ≥ control − 1 | control 26 → armed 23 (Δ −3) | **FAIL** |
| D5 substrate sanity | all fields/flags/shas | no errors either leg | PASS |
| D6 durable-log completeness | log length = fires, kinds match | no errors either leg | PASS |
| M5 guardrail — starvation | armed ≤ control + 2 | 1 vs 5 | PASS |
| M5 guardrail — village deaths | armed ≤ control + 2 | 982 vs 924 (+58) | **FAIL** |
| M5 guardrail — median survival | armed ≥ 0.8 × control | 91 vs 90 | PASS |
| M5 panel compare | `review_required`, NO `regression_signal` on village deaths | `review_required`; village deaths `regression_watch` (not a signal) | panel part PASS, cost bar FAIL |
| **Verdict** | **all of M1–M5** | **H1b + village-deaths guardrail fail** | **NO-GO kind CONCEPT-DEAD** |

The analyzer's verdict logic checks in order: supply → D6 → D5 →
control-pool-deaths-zero → H1a/H1b → guardrails. H1b fails first, so the
kind is CONCEPT-DEAD. The village-deaths guardrail is a second,
independent NO-GO cause (it would be kind GUARDRAIL had H1b passed).

### Proof-run notes (adoption, 2130Z — read before judging M3i/M3m)

- **Rebase after the legs.** Local master moved past the arm's base
  (`dbe748d46` → `36ea1b9fb`, journey-scale r276 + journey-endgame r275
  landings, incl. a `registerDeath` dead-mark fix) while the legs were
  already run. Per the brief the branch was rebased onto `36ea1b9fb`;
  the prereg commit replayed as `a05776929` (same content, new hash).
  The legs' anchor is unchanged in the corpora (`7cedb55d60a1`) and the
  analyzer derives its expected anchor from the corpora, so D5 still
  passes. Proof counts below are split pre/post-rebase where they differ.
- **M3m spawnSelf bug (fixed, driver untouched).** The proof test's
  `spawnSelf` spawned `scripts/test-gatehorizon-b.js` (the OLD arm's
  test) instead of itself — a copy-paste error from cloning. First pass:
  40/47, all 7 fails from that one line (§3b ×4, §4 ×3). Fixed to spawn
  `test-gatehorizon-reprereg-b.js`; the driver, analyzer, and corpora
  were not touched. Second pass (post-rebase): 46/47.
- **M3m §3b widenedN measurement (the 1 remaining fail, then fixed).** The probe
  kills every ranging-profile villager, then expects the staged party
  to be fully widened (widenedN 4). It measured 0 — not because staging
  failed (the quad stages: ok=true, ranging pool empty), but because
  `pickQuadLive` sets `potential=true` for the whole roster and drops
  the profile cache before measuring, and `npcRangeProfile` adds +2
  when potential is set, so every survivor re-profiles as
  wanderer/explorer after the call. The driver's `widenedN` is measured
  on those post-boost profiles and understates widening; the same
  caveat applies to the `widenedN` values in the legs' corpora (S3).
  The probe now snapshots profiles BEFORE the call (the pool as the
  village had it) — the honest measure — and the final run is 47/47.
  The driver is deliberately untouched: the legs ran on it, and the
  proof must prove the instrument that staged them. (A machine restart
  killed the first final attempt mid-§6; it was re-run clean from
  scratch, log `gatehorizon-reprereg-b-m3m-final.log`.)
- **M3i standalone flakiness (load, not code).** The standalone
  `test-leaderproj-b.js` run failed 53/55 on its §8 nested re-runs
  (nested `test-hpgate-b.js` reported 38 passed / 2 failed with 3
  checks never run — its §6 driver smoke never wrote its corpus file,
  the signature of the 10-minute spawn timeout being hit under load;
  box load was 5.4–7.6 on 1.5 shared CPUs with a sibling loop running
  sims). The same test passed 55/55 nested inside M3m §6 twice, and
  the post-rebase standalone re-run passed 55/55, exit 0 — the
  flakiness is confirmed as load, and M3i is PASS.

## §2 Before/after (pilot, 8 scored seeds per leg)

| Metric | Control (gate OFF) | Armed (LEADERPROJ=1) | Δ |
|---|---:|---:|---:|
| Attributed pool-door leader deaths (H1a) | 10 | 5 | −5 |
| — of which pinned / unpinned | 2 / 8 | 0 / 5 | gate saw 2, missed 8→5 |
| Downstream wave-4 kills (H1b) | 26 | 23 | −3 |
| Wave-4 kills total | 32 | 28 | −4 |
| Wave-5 kills total | 20 | 7 | −13 |
| Staged-door leader deaths | 0 | 0 | 0 |
| Staged doors fought / refused | 8 fought | 8 refused | — |
| Projection-gate fires | 0 | 76 | — |
| Whole-party-gate fires | 15 | 2 | — |
| Village deaths (150d) | 924 | 982 | +58 |
| Starvation deaths | 5 | 1 | −4 |
| Median survival (gameDays) | 90 | 91 | +1 |
| Staged leader alive at end | 5/8 | 6/8 | +1 |
| Wins | 8/8 | 8/8 | 0 |
| National+ reach (scaleRank ≥ national) | 8/8 | 8/8 | 0 |
| Table entered / waiting at end | 8 / 0 | 8 / 0 | 0 |
| Wave-4 unlocks / wave-5 unlocks | 8 / 8 | 8 / 7 | w5 −1 |

## §3 Staged-door table (S3 — one pool door per scored seed)

Every staged door was fought on control and refused on armed. Every control
fight was a kill with no leader death — the gate refused eight winnable doors.

| Seed | Day | Door | Monster | Leader HP | widenedN | Control | Armed |
|---:|---:|---:|---|---:|---:|---|---|
| 109201 | 30 | 1 | audit | 30 | 0 | fought, vKill, leader lived | refused (proj) |
| 109202 | 41 | 2 | reunion | 40 | 2 | fought, vKill, leader lived | refused (proj) |
| 109203 | 61 | 3 | eater | 50 | 1 | fought, vKill, leader lived | refused (proj) |
| 109204 | 61 | 4 | strike | 35 | 1 | fought, vKill, leader lived | refused (proj) |
| 109205 | 52 | 5 | suburb | 55 | 0 | fought, vKill, leader lived | refused (proj) |
| 109206 | 41 | 6 | eulogy | 65 | 2 | fought, vKill, leader lived | refused (proj) |
| 109207 | 41 | 7 | algorithm | 75 | 2 | fought, vKill, leader lived | refused (proj) |
| 109208 | 41 | 8 | congregation | 60 | 3 | fought, vKill, leader lived | refused (proj) |

At-door armor pre-check passed on all 8 (gear at door: all four members
armed + armored, armor P 32–55 at the door). No replacements needed, no
unstageable seed. The relaxed quad mattered: `widenedN` 0–3 (mean 1.4) —
five of eight staged parties drew members from outside the ranging pool,
and all eight still staged (vs gatehorizon-b's 5/8 supply). Caveat (found
in the M3m §3b probe, adoption): `widenedN` is measured on profiles
recomputed AFTER `pickQuadLive` sets potential for the whole roster
(`npcRangeProfile` adds +2 when potential is set), so it understates
widening — the true widened count is at least what is shown, never less.

## §4 Organic pool-door census (S4 / S4b / S4c)

The gate only fires on pinned quads, so the organic census is where its
coverage is tested. All 10 control and all 5 armed attributed deaths are
**organic** (staged=false); the staged door killed no leader on either leg.

- **Control:** 122 organic wave-4+ rows; 77 with leader ≤ 75 HP; 12 of
  those ended vDie; 16 pinned low-HP rows. Attributed deaths 10
  (2 pinned / 8 unpinned). Synchronous-flag deaths: **0** — the 1730Z
  defect reproduced in this fresh corpus: the flag reads 0/0 while the
  deaths log reads 10/5. The attribution fix is doing the work it was
  built for.
- **Armed:** 81 organic wave-4+ rows (fewer fights happen at all — the
  gate refused 76 doors); 41 with leader ≤ 75 HP; 11 ended vDie; 3 pinned
  low-HP rows. Attributed deaths 5 (0 pinned / 5 unpinned).
- **Coverage read (S4b):** the gate eliminated the pinned deaths (2 → 0)
  but the remaining 5 armed deaths are all on doors it cannot see
  (unpinned). The 1730Z prediction holds on the fresh band: leaders die
  on unpinned doors. H1a passed anyway (10 → 5) because the armed
  trajectories happened to carry fewer unpinned deaths — not because the
  gate reached them.
- **vDie unattributed (S4c):** control 2 rows (109202 timeslot, leader
  30 HP, same-day death cause "The Timeslot"; 109204 rerun, 27 HP,
  "The Rerun"); armed 5 rows (109202 strike 73 HP "The Strike"; 109203
  congregation 16 HP "The Congregation"; 109204 reunion 29 HP "The Ugly
  Beast"; 109206 influencer 55 HP "Ugly-Eyes"; 109208 reunion 60 HP
  "The Big Beast"). These are vDie rows whose same-day death carries the
  monster's name as cause, not `'monster'`, so the frozen rule excludes
  them. If they were counted, H1a would read control 12 → armed 10 and
  still pass (10 ≤ 11) — the H1a verdict is robust to that reading (see
  metric review).

## §5 Horizon table per seed (S5/S6)

| Seed | C days | C won | C rank | C deaths | C w4 | C w5 | A days | A won | A rank | A deaths | A w4 | A w5 |
|---:|---:|---|---|---:|---:|---:|---:|---|---|---:|---:|---:|
| 109201 | 90 | ✓ | global | 138 | 4 | 1 | 91 | ✓ | global | 121 | 3 | 0 |
| 109202 | 90 | ✓ | global | 113 | 5 | 3 | 91 | ✓ | global | 141 | 7 | 0 |
| 109203 | 91 | ✓ | global | 97 | 5 | 5 | 94 | ✓ | global | 94 | 4 | 2 |
| 109204 | 90 | ✓ | global | 115 | 6 | 4 | 90 | ✓ | global | 92 | 5 | 1 |
| 109205 | 90 | ✓ | global | 122 | 2 | 3 | 90 | ✓ | global | 120 | 2 | 1 |
| 109206 | 90 | ✓ | global | 92 | 3 | 0 | 90 | ✓ | global | 107 | 3 | 2 |
| 109207 | 90 | ✓ | global | 112 | 2 | 0 | 98 | ✓ | global | 137 | 3 | 1 |
| 109208 | 94 | ✓ | global | 135 | 5 | 4 | 100 | ✓ | global | 170 | 1 | 0 |

Per-seed village-death deltas (armed − control): −17, +28, −3, −23, −2,
+15, +25, +35. Mixed signs — three seeds cheaper, five dearer — but the
frozen bar is a total (≤ control + 2) and +58 fails it outright. The
extra deaths are expedition deaths: 539 → 627 (+88), partly offset by
fewer combat deaths (106 → 88) and monster deaths (17 → 13).

## §6 Wall numbers (S6 — scale wall, every run)

- **Wins:** 8/8 control, 8/8 armed. Every village on this band won by
  day 90–100 (`endReason: over-other`), on both legs.
- **National reach:** 8/8 both legs (scaleRank `global` on all 16 runs).
- **Table:** entered 8/8 both legs; waiting at end snapshot 0/8 both legs
  (the villages won before any waiting period — `tableWaiting` false,
  `tableEntered` true on every seed).
- **Wave 4–5 unlocks:** wave 4 8/8 both legs; wave 5 8/8 control, 7/8
  armed (seed 109208 armed never unlocked wave 5; maxWave 4).
- **Median / max survival:** 90 / 94 days control; 91 / 100 armed.
- **Death-cause shares (150d totals):** control — expedition 539,
  villager combat 227, combat 106, monster 17, thirst 6, starvation 5,
  Gavel 4, the wild 4 (924 total); armed — expedition 627, villager
  combat 222, combat 88, monster 13, thirst 6, wound_fever 2, contest 2,
  the wild 2 (982 total).
- **Reachability verdict:** waves 1–5 all reachable (wave 5 reached on
  15/16 runs); regional → national → global reached everywhere; the
  table is entered everywhere; the win flag fires everywhere on this
  band. Nothing here is decoration — the content is reached, and the
  capable policy wins it fast (median day 90–91). The gate is not the
  thing standing between the village and the win: the win rate is 8/8
  with the gate off and 8/8 with it on.

## §7 Gate-fire census (S7)

- Armed: `leaderprojFires` 76, `hpgateFires` 2, `leaderhpgateFires` 0 —
  78 gate fires total; the durable log is complete (D6 PASS: log length
  equals fires, per-kind counts match, no unknown kinds).
- Control: `hpgateFires` 15, projection 0 (gate off), leader-gate 0.
- Log-vs-notes gap: none on either leg (D6 PASS).
- The projection gate is the working gate: 76 of the armed leg's 78
  fires. The whole-party gate fired twice on armed (15 on control —
  the armed trajectories meet fewer doors). The leader gate never fired
  on either leg.

## §8 Unscored seeds + boundary census (S8 / S8b)

- **Unscored: none.** 8/8 scored on both legs — the supply rule passes
  with room (need ≥ 6). The relaxed quad + boundary log fixed the
  gatehorizon-b supply failure (5/8) on this band.
- **Boundary waits (identical on both legs — pre-staging trajectories
  are identical, as designed):** `wait-no-unlock` 26, `wait-no-quad` 2,
  `wait-unstageable` 0, `staged` 8, `ended` 0. Staging waited only on
  the wave-4 unlock (26 boundaries) and twice on quad availability;
  never on unstageability. Staging days: 30, 41, 61, 61, 52, 41, 41, 41
  (same both legs).
- The two `wait-no-quad` boundaries are the only supply friction in the
  corpus, and the relaxed quad absorbed both at the next boundary.

## §9 Pacing (S9)

Mean deliberate verbs/day: 4.90 control, 4.76 armed. The gate's refusals
do not change how busy the village is — the parties it turns back keep
ranging and meeting other doors (which is where the extra expedition
deaths come from).

## §10 Village assessment (plain words)

What the village looked like: on this band the capable village is strong.
Every one of the eight villages won, reached the top of the scale ladder,
and walked into the table by about day 90 — with the gate on or off. The
villages are not struggling to reach the content; they reach it and finish
it.

Who thrived and who died and why: the staged party leaders all lived on
control — the four-person geared party killed every staged wave-4 monster
without losing its leader, at leader HPs from 30 to 75. The leaders who
died died on ordinary doors nobody staged: a leader walked into a
Reunion at 5 HP, another into an Eater at 3 HP, on doors the gate never
saw because the party wasn't pinned. The gate's refusals did not save
those people; they saved the two pinned deaths on control, and in return
the armed villages fought fewer wave-4 monsters, killed fewer of them,
barely touched wave 5 (7 kills against 20), and buried 58 more villagers
— mostly on expeditions, the same ranging the gate keeps sending parties
back out into.

What was missing: not leader protection — the staged leaders never needed
it — but a gate that can tell a winnable door from a deadly one. The
projection assumes the leader eats 25 damage a round for two rounds; the
fights show a geared party of four kills the monster first. The gate is
protecting leaders from fights they win.

## §11 Sense test (transcript read)

The durable gate-avoid log reads like a person making a call, not a
counter firing. Seed 109206, day 41: "gave eulogy room — Benoit is too
hurt to lead a door (projected 65 HP, 15 HP in two rounds)". Day 45:
"gave eater room — Benoit is too hurt to lead a door (projected 56 HP,
6 HP in two rounds)". Day 46: "gave audit room — Terry is too hurt to
lead a door (projected 73 HP, 23 HP in two rounds)". The voice is
coherent and the numbers are honest — the projection is what it says it
is. The problem is not the wording; it is the judgement. Benoit at 65 HP
led the same Eulogy door on control and killed it with his party. The
log's caution reads sensibly and is wrong about the fight. No robotic or
repeated dialogue was sampled beyond the gate's own formulaic notes,
which are the instrument's narration, not villager speech.

## §12 Blanks filled or documented

- **Filled:** the 1730Z metric-review §7 defect is fixed and proven on a
  fresh corpus — deaths-log attribution reads 10/5 where the synchronous
  flag reads 0/0 on the same rows. The fix is real, not asserted.
- **Filled:** the gatehorizon-b supply failure is fixed on this band —
  relaxed quad + boundary log took scored seeds 5/8 → 8/8, and the
  boundary log names exactly where staging waited (unlock, twice quad).
- **Filled:** organic unpinned doors are now counted in H1a, and the
  S4b split shows the gate's coverage plainly: pinned deaths 2 → 0,
  unpinned deaths 8 → 5, all remaining deaths on doors the gate cannot see.
- **Documented (not filled):** the gate's core premise — that a leader
  at ≤ 75 HP should not lead a wave-4 door — is now measured dead on a
  fresh band with a working instrument. Eight winnable doors refused,
  downstream kills lost beyond tolerance, wave-5 kills collapsed, village
  deaths up. This is the verdict, not a measurement gap. The next blank
  is a design question for Steve, not a re-measurement: does the
  projection get retuned (a leader-HP bar the party's actual damage can
  meet), or does the gate go away? No confirm run is warranted — the
  pilot failed two frozen bars, and the prereg forbids burning a confirm
  on a pilot NO-GO.
- **Documented:** the deaths log sometimes carries the monster's name as
  the death cause ("The Strike", "The Rerun") instead of `'monster'`,
  which the frozen attribution rule excludes (7 vDie rows across both
  legs). See metric review.

## §13 Metric review

- **H1a passed but the gate did not earn it.** The bar counts the whole
  pool-death population, pinned + unpinned, as the prereg intended — and
  the pass (10 → 5) came from the armed trajectories carrying fewer
  unpinned deaths, not from the gate reaching unpinned doors (it cannot:
  0/5 armed deaths are pinned, and the gate fired only on pinned quads).
  The S4b split separates the two stories: the gate's own effect is the
  pinned 2 → 0; the rest is trajectory noise after the staged refusal
  diverged the RNG streams. A future bar that wants to measure the gate
  itself should judge pinned deaths only — but that bar is for the next
  run's prereg, not this one; this run is judged as frozen.
- **H1b's −1 tolerance was the right size and the miss is real.** The
  legs lost 3 downstream wave-4 kills against a 1-kill allowance, and
  the same direction shows up in the totals (32 → 28) and in wave-5
  kills (20 → 7, not a bar but the same story: refusing wave-4 doors
  starves the wave-5 unlock — one armed village never unlocked wave 5).
  This is not trajectory noise; it is the refusals doing what refusals do.
- **The village-deaths guardrail may be too tight for a 150-day horizon,
  but the miss is too big to wave through.** +58 over 924 is a 6%
  rise, and the per-seed deltas swing −23 to +35 — noisy, but the bar
  (≤ control + 2) is frozen and the miss is not a borderline 3 or 4.
  The driver is visible: expedition deaths +88. A future prereg could
  price the guardrail per 100 days or per seed-pair, but this run does
  not re-score; the bar stands as written and the run fails it.
- **The monster-name death causes are a real instrument wrinkle.**
  Seven vDie rows (2 control, 5 armed) carry the monster's display name
  ("The Strike", "The Rerun", "The Congregation", "The Ugly Beast",
  "Ugly-Eyes", "The Big Beast") as the same-day death cause instead of
  `'monster'`, so the frozen rule excludes them. Counting them would read
  H1a 12 → 10 and still pass — the verdict does not turn on this. The
  next re-prereg should decide whether a monster-named cause counts as
  a monster kill; this one does not.
- **The staged door is the intervention and it showed the gate's whole
  story in miniature:** 8/8 refused, 8/8 winnable. No further staging
  variation would change the verdict — the gate refuses what the party
  can kill.
- **No confirm.** Pilot NO-GO on two frozen bars; the confirm band
  109209–109216 stays unspent. The arm is done; the design question
  (retune the projection or remove the gate) goes to the next round,
  not to a re-run of this one.

## §14 Files

- Prereg (frozen): `evidence/2026-11-23/sim-gatehorizon-reprereg-b-prereg.md`
- Spec: `evidence/2026-11-23/gatehorizon-reprereg-b-spec.json`
- This evidence: `evidence/2026-11-23/sim-gatehorizon-reprereg-b.md`
- Analysis JSON: `evidence/2026-11-23/gatehorizon-reprereg-b-analysis.json`
  (analyzer exit 1, verdict NO-GO kind CONCEPT-DEAD)
- Panel: `evidence/2026-11-23/gatehorizon-reprereg-b-panel.md` +
  `gatehorizon-reprereg-b-panel-before.json.gz` /
  `gatehorizon-reprereg-b-panel-after.json.gz` /
  `gatehorizon-reprereg-b-panel.json`
  (compare decision `review_required`; village deaths
  `regression_watch`, paired delta +7.25/run, 95% interval −7.5 to 20.5)
- Corpora: `evidence/2026-11-23/perseed-gatehorizon-reprereg-b-control/`
  + `...-armed/` (8 files each, anchor `7cedb55d60a1` on all 16)
- Legs log: `evidence/2026-11-23/gatehorizon-reprereg-b-legs.log`
  (CONTROL EXIT 0 2026-11-23T20:42:34Z; ARMED EXIT 0 2026-11-23T21:00:21Z)
- Instrument: `scripts/gatehorizon-reprereg-driver-b.js`,
  `scripts/analyze-gatehorizon-reprereg-b.js`,
  `scripts/test-gatehorizon-reprereg-b.js`
- M3m final run log: `evidence/2026-11-23/gatehorizon-reprereg-b-m3m-final.log`
  (47/47, exit 0, post-rebase)
- `src/` diff: NONE.
