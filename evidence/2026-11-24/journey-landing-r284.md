# Journey landing r284 — leg 0 LANDING (days 1–14 judged, horizon d28)

Run `playtest-20261124T1632Z`, scheduled Tue 2026-11-24 09:45 CST.
Lane A leg 0. Base master `8616c6b2f` (includes r283 scale, merged this
run — see Adoption below). Lock `playtest-loop.lock` run_id
`playtest-20261124T1632Z`, created 2026-11-24T16:33:00Z. Rotation read
`0` → write `0→1` at closeout. Worktree
`~/workspace/worktrees/journey-landing`, branch `journey-landing`.

## Adoption first — r283 scale recovered and merged

The 07:45 CST occurrence (r283, scale) died at the VM replacement
~15:26Z before closeout: its branch held 2 verified commits (playtest
leg `b5e081306`, closeout addendum `8616c6b2f`) but no merge, no rotation
write, no release, and its lock `playtest-20261124T1408Z` was still held.
Verified dead before touching it: registry heartbeat 15:28:06Z (40+ min
stale), no coordinator process, no live subagent for the run, worktree
clean, no writes in the last 15 min; the only live process was the
orphaned hbloop (pid 2022), killed after the release. The branch was
based on current master (`9810670a0`); its proof test re-ran green on
the tip (`178/178`). Flap window 31 (started 15:48:45Z, per the
watchdog log) blocked the merge — every `git update-ref` failed with
`couldn't write ... .lock` (EPERM on the write step, lock files only;
shell writes landed intermittently) — until a sustained clear at
~16:31:31Z (3 consecutive git ref-write cycles + fresh-file readback).
Merged ff-only `9810670a0..8616c6b2f` (5 files, 4703 insertions),
landing verified (`merge-base --is-ancestor`, master @ `8616c6b2f`),
worktree released as done-merged, removed, branch deleted, rotation
`3→0` with read-back, stale lock deleted (run_id verified in the same
call) and replaced with this run's lock. The r283 run note is
`evidence/2026-11-24/journey-scale-r283.md` on master now. Nothing was
replayed: the scale leg stands as r283 played it.

## Pre-flight

Main tree clean (`git status --short` empty). Disk 49%.
`git pull --ff-only`: already up to date. `worktree-reap.sh`: removed
nothing; LOUD on 12 dirty trees (never auto-removed), active 12/16.
Registration took ~6 min (slow checkout under load); heartbeat
16:36:38Z at registration, hbloop re-established (setsid, 10-min ticks,
first tick 16:44:45Z landed in the registry). Registry-lock contention
recurs (one manual heartbeat failed `lock held > 120s`, waited out per
the standing rule).

## Prereg summary

`evidence/2026-11-24/journey-landing-r284-prereg.md`. Seeds **1392–1401**
(fresh band; searched all preregs under evidence/ and
hidden_files/evidence/ — the only "1392" hits are kcal values in old
transcripts and finding #1392, no seed reservation). DAYS=28, policy
competent verbatim, driver `scripts/journey-landing-r284-20261124.js`
(r158 driver verbatim except OUTDIR/header/seeds).

**Question:** (1) Q1 GO re-check on a fresh band with the r158
contest-ledger fix in place; (2) live exercise of the death-terminal
fix (r158's owed item) via an unscored DAYS=56 probe on 2 panel seeds.

**Pilot:** seeds 1392–1394, exit 0. System contact d8 on all three;
1394 ended d18 (pantry collapse — see Census). Pilot gate passes;
full panel ran.

## Panel

Driver exit 0, all 10 seeds, 152 files in
`hidden_files/evidence/2026-11-24/landing-r284-after/`. Analyzers
`evidence/2026-11-24/journey-landing-r284-analyzers.sh`, 15/15 exit 0,
1719 lines. Log:
`hidden_files/evidence/2026-11-24/journey-landing-r284-analyzers.log`.

| seed | spawn | systemDay | over | villager deaths | pantry/person d28 |
|---|---|---|---|---|---|
| 1392 | Walt | 8 | no | 0 | 1,290 |
| 1393 | Molly | 8 | no | 0 | 1,523 |
| 1394 | Penelope | 8 | d18 | 4 | 35 |
| 1395 | Andres | 8 | no | 3 | 2,200 |
| 1396 | Saul | 8 | no | 1 | 1,351 |
| 1397 | June | 8 | no | 3 | 1,500 |
| 1398 | Carolina | 9 | no | 0 | 1,336 |
| 1399 | Vincent | 9 | no | 0 | 1,606 |
| 1400 | Darnell | 8 | no | 2 | 1,093 |
| 1401 | Mason | 9 | no | 1 | 2,280 |

9/10 villages alive at d28. Scholar deaths 5 (1394 Penelope d10 "the
wild"; 1395 Andres d15 "a stranger" + Francesca d25 lockjaw; 1397 June
d20 "the wild" + Valentina d28 "the arena") — every one followed by a
mantle with latency 0–1; villages continued under succession.
Villager deaths 14, all grief-registered (griefMiss 0/14, unexplained
0). Contests: fired 17, ended 16 (won 11 / lost 4 / died 1), open at
horizon 1 (1398 Lottery, fired d28 — still in progress, not a defect).
Monster kills 386 (r158 baseline 411). Fights: 24 total (triggers:
pending-face 12, wild field 6, contest-arena 6; 0 unknown);
stuckFights 0, pocketFights 0, sealed regions 0.

**M-PR1 (primary): 0 terminated-but-open ledger entries on the band
(bar 0).** Checker `hidden_files/evidence/2026-11-24/mpr1-check-r284.py`:
TOTAL open=1 (1398 Lottery, fired d28, no participant death joined),
M-PR1-fail=0.

**M-PR2: 0 contest death autopsies with context LEDGER and null
contestOutcome (bar 0).** Every LEDGER-context autopsy carries its
outcome.

**THE LIVE DEATH TERMINAL FIRED — in the panel itself.** Seed 1397's
Siege (fired d26, participants Valentina + Ruth): Valentina died d28
in the arena, and the ledger entry closed with outcome `'died'` — the
r158 `_contestDie` path emitting `tele('contest_end')` live. The
fix's live exercise is delivered for the death path; the r155 defect
(a death that never closes its contest) does not recur. Refusal and
arena-loss terminals did NOT fire in the panel or the probe (see
Probe) — still proof-test-only.

## Probe (unscored, DAYS=56, seeds 1392 + 1393)

Exit 0, both alive to d56. 10 more contests (1392: 6, won 4 / lost 2;
1393: 4, won 3 / lost 1), 0 open, M-PR1-fail=0. No death, refusal, or
arena-loss terminal fired — consistent with the ~1-in-66 rate (0.15
expected in 10 contests). The probe adds nothing to the ledger verdict;
it is recorded as the attempt, not as evidence of absence.

## Q1 adjudication — GO, with two watches firing

- **M1 ALIVE-D14: PASS** — 10/10 alive at d14.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9 (d8 on seven seeds, d9 on
  three).
- **M3 FIGHT-LOG: PASS** — all 24 fights carry known triggers
  (pending-face 12, wild 6, contest-arena 6); 0 unknown; stuckFights 0.
- **Zero-DMG refused-turns: PASS (BINDS)** — refusedTurns 0 in the one
  zero-DMG fight (1392 d22, no-strikes, pending-face, routed). Watch
  count refusedTurnsAllFights=1 (1395 d17 vs Hushpuppy: a failed MOVE,
  not a refused strike; fight won).
- **Practice: PASS** — 10/10 seeds moved (45 cells d1→d14, 84 d1→d28,
  attributed 84, skill0→pos 68, 2803 reps).
- **Pocket: PASS (BINDS)** — 0 pocket fights, 0 sealed regions.
- **D1: PASS** — 0 garbled-label renders. D2: 0. D3: 0.
- **HEED: legacy 0; HEED-V: PASS (BINDS)** — 0. WARNED-BUT-UNRESOLVED 0.
  All 3 warn_you sittings end resolved.
- **M-PR1 commit-offer (r156/r157 fix holds): PASS — 3/35 = 8.6% ≤ 15%.**
  R107: sittings=39, offered=29, picked=29, promised=21,
  statedAfterPick=8, neverOffered=7, settled=3. The 3
  established-but-never-offered (1392 d11, 1401 d13, 1401 d14) are all
  sittings where the want stayed at the goal-thread level or the
  sitting ended at turn 0 — no concrete favor was ever articulated, so
  there was nothing to commit to (read in full; see People check). The
  rate rose from r158's 0/19, but within the bar; the fix holds.
  statedAfterPick=8 are all honest refusals (7 away-guard, 1 polite
  close); the rate is flat vs r158 (28% vs 29%) — the count rose with
  panel size (39 vs 24 sittings), not with worse behavior.
- **Bridges: PASS** — 0 repeats in every pool. Topics with no ask pick
  in corpus: grief, cheer, secret (same shape as r158's watch).
- **R66 HUNGRY: FIRES** — starvationDeaths=1, slideSeeds=0, bandSeeds=3,
  noSlideSeeds=7. The one starvation death is Clara, 1394 d18 (see
  Census). Final pantry/person is thin on most seeds (8/10 below 2000)
  but only 1394 starved.
- **Scholar deaths: WATCH MISSES (bar ≤2)** — 5 on 3/10 seeds (r158: 1).
  Causes: wild ×2, stranger ×1, lockjaw ×1, arena ×1. Two are the
  scholar dying in a contest or to a monster the village then faced;
  none is a harness artifact (all 5 have registered causes and
  mantles). The band is deadlier for scholars than r158's; the
  succession seam held every time (latency 0–1).
- **Other watches:** CONTEST LEDGER GO, OUTING GO (42 favors, 11 kept,
  4 broken, 27 open, 13 departs, 11 hauls delivered), R68 PARTY GO
  (offered 3, spoken 3, dry 0, accepted 1), NOD-LOOP 0, silentTurns /
  dry lines 0, WINPLAN GOAL-LIVE at d14, HUNTPRACTICE kills 386.

Q1 is GO because the binding metrics (M-PR1, M-PR2, M1, M2, M3,
zero-DMG, pocket, HEED-V, commit-offer) all pass; the two firing
watches (HUNGRY, scholar deaths) are reported loudly as the band's
news, not re-scored into a pass.

## Q4 — people check: PASS

Six full transcripts read in full (plus all 6 NV sittings and the R107
rows). No dry lines, no filler loops, no fabricated history. No dead
villager speaks.

- **1401 d13 (Omar, goal thread, depth 0→8):** the best sitting of
  the run. A betrayal offer declined honestly, then seven "tell me
  more" turns that actually deepen: "Home's a feeling, not a place.
  I'm chasing the feeling." … "Someone saved me a seat by the fire
  yesterday without thinking. That's the closest I've felt." The
  tell-me-more pattern works here — the want stays at the goal level
  and the exchange still resolves. (The sitting also carries the
  orphaned invite line, see below.)
- **1392 d11 (the sky-questioner):** same deepening shape ("I asked
  the sky a question this morning. It didn't answer. I'm keeping a
  list." … "The not-knowing is a splinter. I'm getting it out or
  it'll fester."). A person with a project.
- **1394 d10 (Christian, the day Penelope died):** the succession seam
  working in the open — "I asked Penelope about the pantry run —
  Penelope's gone. Still need hands. Are you in?" The dead scholar is
  named the same day she dies, and the favor transfers to the new
  bearer. A betrayal case (Victor's ambush, unsettled) surfaces in
  the same sitting.
- **1397 d17 (Ella, curious):** "Are you angry? At whoever did this.
  At the sky. At anything." → "Furious. Most days." → "Good. Anger's
  fuel. Just — point it somewhere useful." Short, real, ends engaged.
- **1401 d12 (Meera):** link proposal accepted, pantry favor promised
  concretely ("forage with Meera tomorrow to rebuild the pantry"),
  beast-naming vote follows. A sitting that does three jobs and ends
  clean.
- **1401 d14 (Benoit):** opens busy and hostile ("What do you want?
  I'm busy."), the bot leaves at turn 0, beast-naming follows. The
  NPC's boundary is respected; nothing is forced.
- **NV sittings (6):** LOOP=0 on all six (maxSameStreak=1); every one
  surfaces wind-down and leaves via Leave. The 3-nod cycle from r283's
  scale band does not appear on landing.
- **Orphaned invite lines — the carried blank, same rate:** 9 lines in
  9 of 39 ask_favor sittings (23%; r283 scale: 5/19, 26%): "Come get
  air with me. I need to think out loud." ×4, "Walk my trap line with
  me? Extra hands, extra eyes." ×5 (in ask_favor sittings; 14 lines
  across all 132 transcripts). Each is spoken and never answerable —
  no menu ever offers to take it up. The fix (offer the invite as a
  choice) is still a conversation-engine change, still owed to a
  conversation build arm, not this run.
- **Watches with no wild test this band:** warn_you heed — 3 sittings,
  all resolved. Debt-label anchor — no 'that debt' sitting appeared.
  Menu-priority (r280) — no favor-cancel sitting appeared. Closing-line
  duplication — no sitting shows a duplicated closing line.

## Census in plain words

Ten villages, nine alive at day 28. They are thin — most end the month
with less than 2,000 calories per person — but they talk, grieve, and
keep promises: 17 contests fired and all but one closed, every death
carries its cause and its grief, and when the scholar dies somebody
picks up the mantle the same day. One village didn't make it: Penelope's
people ran their pantry to zero by day 17, lost two to sickness, one to
starvation, and scattered on day 18 with nine people still alive. The
sharpest news is the death that closed a contest honestly — Valentina
died in the Siege on day 28 and the ledger says so, which is the first
time the new death-recording has been caught working live. The cost of
the month is five dead scholars across three villages, where the last
band lost one.

## Reachable / fun / winnable

- **Reachable: YES.** The landing leg plays end to end on all 10 seeds;
  System contact by d9 everywhere; contests fire from d14 and close.
- **Fun: HOLDS, with the same crack.** People talk well (Omar's sitting
  is the run's best; the succession seam names the dead the same day);
  the visible crack is the orphaned invite lines, now 9/39 sittings.
- **Winnable: not judged on this leg** (landing horizon d28; the win
  chain is a later-leg question).

## Fixes (this run's blank)

- **None — no src/js change.** The run's blank is the r158 owed item
  (live exercise of the death terminal), which the panel delivered
  itself: the 1397 Siege. The orphaned invite lines are documented as
  the carried dialogue blank, not fixed here (conversation-engine
  change, bigger than a playtest run's one blank — same judgment as
  r279/r283, with the rate now measured on landing too: 23%).
- **Tooling forked for this run:** driver
  `scripts/journey-landing-r284-20261124.js` (r158 verbatim except
  header/seeds/OUTDIR), analyzers
  `evidence/2026-11-24/journey-landing-r284-analyzers.sh`, M-PR1
  checker `hidden_files/evidence/2026-11-24/mpr1-check-r284.py`.
  Diffs verified: only the intended lines differ; `node --check` clean.

## Metric review (standing)

- M-PR1/M-PR2 hold as written (0/0 this run). The one open entry (1398
  Lottery, fired d28) is legitimately in progress; the death-join rule
  correctly excludes it.
- The live-exercise gap is now half-closed: the death terminal fired
  live (1397 Siege); refusal + arena-loss terminals are still
  proof-test-only. The probe design (longer horizon on 2 seeds) added
  10 contests and caught none — at ~1/66, a longer horizon is a weak
  instrument for these terminals. Proposal for the NEXT run (not this
  one): a staged contest-heavy probe (drive contests at higher
  frequency in a dedicated driver) if a live refusal/arena-loss read
  is wanted; do NOT narrow M-PR1/M-PR2 to the proof test alone.
- R107's "established" accounting: the 3 stated-but-never-offered
  sittings are not fix misses (no concrete favor was articulated).
  The 8.6% rate is within the 15% bar; if the bar ever tightens, the
  definition of "established" (want engaged vs favor articulated)
  needs to be written down first.
- Scholar-death watch (≤2/band): 5 this band vs 1 on r158's. Band
  variation or a deadlier regime is undecidable on one band; the watch
  stays as written and the next landing run re-reads it.
- R66 HUNGRY fired on 1 starvation death with 0 slide seeds — the
  gate's letter (starvation death OR slide). The thin-pantry shape
  (8/10 below 2000/person) is a watch, not a fail, per r61.

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r284-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**quiet (10 files, 5 metrics, no large deviations).** No LOUD lines,
baseline NOT rolled. Panel values: monsterKills 386 (baseline 411),
villagerDeaths 14 (baseline 10).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r284-gate`
in the worktree: **336 passed, 8 failed in 1244s** (GATE_EXIT 1). The 8
are the standing 5 pre-existing failures (2 deed-attainment 120s
timeouts; stale neutrality-proof failure in
test-measurement-proof-update + test-measurement-workflow; stale phone
receipt in test-phone-frame-proof — all identical to the r158/r283
runs, none touching anything this run changed) PLUS 3 load flakes:
test-measurement-cache-flags, test-trust-observer-neutrality,
test-capable-bot — all three **re-run standalone on a quiet box and
passed green** (cache-flags 4/4, trust 6/6, capable-bot 40/40).
Nothing in this run changed src/js or harness inputs; no failure is
attributable to r284. Log:
`hidden_files/evidence/2026-11-24/journey-landing-r284-gate.log`.

## Closeout record (filled as the closeout proceeds)

- Run note written: evidence/2026-11-24/journey-landing-r284.md (this file).
- Telemetry check: quiet (see above).
- Gate: 336 passed, 8 failed in 1244s — standing 5 (pre-existing) + 3
  load flakes, all three re-run green standalone (cache-flags 4/4,
  trust-observer-neutrality 6/6, capable-bot 40/40). 0 attributable.
- Commit: `10e88df1` (4 files). Safe-commit index clobber struck after
  the commit (4 files staged-deleted in the main index, commit
  correct); repaired with `git ls-tree -r HEAD | git update-index
  --add --index-info` — status empty, `git diff HEAD` empty, 0 deleted.
- Merge / rotation / release / lock: [PENDING]
