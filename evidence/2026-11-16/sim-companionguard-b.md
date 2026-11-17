# sim-companionguard-b — EVIDENCE (Loop B run fleshout-loop-b-20261117T0330Z, adopted from the 0030Z run)

Run: fleshout-loop-b-20261117T0330Z (Loop B), axis winnability chain, arm
sim-companionguard-b — BUILD: the companion call clobbers a live
expedition (findings backlog #2462). Branch `sim-companionguard-b`
(worktree `~/workspace/worktrees/sim-companionguard-b`). The 0030Z
run's worker died before implementing anything; this run adopted the
frozen prereg and built the arm. Base for the arm: prereg commit
`35ba8eb58`. Guard commit `061b45bdb` (instrument + gated guard +
proof). Gate-removal commit `03b88ebd6` (GO: gate removed, guard
unconditional; proof updated to the shipped behavior).

## The question, in plain words

When a villager launches a party, the leader's call drags a companion
along — but if that companion is already out on an expedition of their
own, the companion call silently erases their trip: the legs they
walked and the food they found vanish, and no return ever fires. On
band 102801–102808 that happened 12 times. The fix: a companion call
skips a villager who is already out — they keep their trip, and the
party goes with whoever is available.

## Prereg header (frozen, evidence/2026-11-16/sim-companionguard-b-prereg.md)

- Policy: competent verbatim — `scripts/policies/competent.js`, sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`.
- Horizon: 150d death-aware (dead villages stop simulating, +10d tail
  max). Seeds: 103021–103028, 8 seeds, identical seeds both legs.
  Band verified fresh (0 hits across preregs, evidence, goal files).
- Legs: CONTROL (guard off — `COMPANIONGUARD` unset, tree at the
  guard commit) vs ARMED (guard on — `COMPANIONGUARD=1`, same tree).
  Both legs run the same recorder (the medicduty recorder, extended
  with the guard-skip capture); the recorder is the instrument, the
  guard is the lever.
- Design decision 1 (frozen): in `startExpedition`
  (src/js/villager-agency.js), env-gated on `COMPANIONGUARD=1`,
  return early BEFORE gear-up/heal-check when a live expedition
  record already exists for vid; increment
  `village.companionGuardSkips`.
- Design decision 2 (frozen): in `vbrainExecuteDepart`
  (src/js/villager-brain.js), after the companion call, verify the
  companion actually left before recording them in `launched` and
  before advancing the companion's plan (`cplan`) to `hunt`. The
  inviter still advances to `hunt` with the honest party (possibly
  solo). This also closes the pre-existing mirror gap for
  sick/hurt-blocked companions (same code path, same lie, same fix).
- Design decision 3 (frozen, not built): wait for the companion's
  return before launching (hold the party until the companion is
  back) is NOT built — coordinator's call under Steve's "figure it
  out yourself" grant: skip, don't wait.
- CANON GAP (recorded in the prereg, not invented): no canon doc
  covers expedition departure guards or the companion-launch rule;
  `docs/PARTY.md` covers party dynamics only. CANON.md + PARTY.md
  read before building.

## GO bars (binding — a miss is NO-GO, never re-scored)

1. Orphan trips 0 on the armed leg.
2. Party launches hold: armed total ≥ control total − 2.
3. Cost bar: starvation deaths armed ≤ control + 2 AND median
   survival armed ≥ 0.8 × control median survival.
4. Proof green: `node scripts/test-companionguard-b.js` (static
   checks + unit tests + D1 determinism + D2 neutrality).
5. Wall numbers both legs.

## Verdict: GO — all five bars pass

| Bar | Armed | Control | Bar | Result |
|---|---|---|---|---|
| 1. Orphan trips | 0 | 2 | 0 armed | **PASS** |
| 2. Party launches (distinct inviter departures) | 57 | 32 | ≥ 30 | **PASS** |
| 3a. Starvation deaths | 1 | 1 | ≤ 3 | **PASS** |
| 3b. Median survival (gameDays) | 151 | 151 | ≥ 120.8 | **PASS** |
| 4. Proof | 115/115 green | — | green | **PASS** |
| 5. Wall numbers | reported below | reported below | reported | **PASS** |

Per the prereg, on GO the env gate is REMOVED and the guard ships
unconditional — done in commit `03b88ebd6` (see "What shipped").
The proof was re-run green (115/115) on the shipped unconditional
code before that commit.

## What shipped (commits on branch sim-companionguard-b)

- `061b45bdb` — instrument + gated guard + proof (115/115):
  `scripts/companionguard-driver-20261116.js`,
  `scripts/analyze-companionguard-b.js`,
  `scripts/test-companionguard-b.js` (new),
  `src/js/villager-agency.js` (the guard, then env-gated),
  `src/js/villager-brain.js` (the mirror's plan-record honesty).
- `03b88ebd6` — GO gate removal + proof update to the shipped
  behavior (115/115): the `COMPANIONGUARD` env read is gone from
  `startExpedition`; the guard fires for any already-out villager,
  in the browser as in the sims. The mirror (decision 2) was already
  unconditional and is unchanged by this commit. Proof updates in
  this commit: the static scope check now diffs against the frozen
  prereg commit (see Instrument notes); the env-gate static check
  became a no-env-read check; the unit scenarios prove the skip
  fires with NO env set (second skip, counter +2); stale
  "control trajectory (guard off)" comments corrected.

## The mechanism, confirmed in the data

Every armed-leg guard skip is a same-part collision — the companion
launched their own trip earlier in the same day-part, and the
party_launch call in that same part would have clobbered it. The
two control orphans are the SAME two calls the armed leg skipped:

- Control orphans: s103025 Arturo (app_mgpspk1h293) day 101 part 2,
  vbrain-party_launch — replaced his own trip since d101/2 (1 leg,
  0 kcal of finds); s103027 Juan (gen_kmxwqb7) day 57 part 2,
  vbrain-party_launch — replaced his own trip since d57/2 (0 legs,
  0 kcal). Both same-part replacements, the shape 10 of 12 took on
  the medicduty band.
- Armed skips (7): s103025 Arturo d101/2 (counter 0→1) and s103027
  Juan d57/2 (counter 0→1) — the identical calls, skipped instead —
  plus 5 more on the diverged s103027 trajectory: Desmond d91/2,
  Desmond d103/0, Juan d113/1, Theo d118/2, Desmond d122/1
  (counters 1→2 … 5→6). Kept trips had 0–1 legs and 0 kcal of finds
  at skip time — the loss prevented is small in kcal, but the trip
  itself and its return are preserved.
- Guard accounting: armed rows 7 skips = village counter 7 (1 on
  s103025, 6 on s103027); control 0/0. Analyzer
  `guardAccounting: pass`.

## Numbers — per-seed table

Control leg (guard off), anchor `061b45bdbaab`:

| seed | days | end | standing | launches | landed | orphans | skips | parties | deaths | starv | w4kills |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 103021 | 150 | survived | 415 | 1 | 1 | 0 | 0 | 0 | 74 | 0 | 5 |
| 103022 | 129 | village-lost | 199 | 17 | 17 | 0 | 0 | 8 | 74 | 1 | 1 |
| 103023 | 150 | survived | 150 | 0 | 0 | 0 | 0 | 0 | 50 | 0 | 0 |
| 103024 | 150 | survived | 300 | 1 | 1 | 0 | 0 | 0 | 76 | 0 | 3 |
| 103025 | 150 | survived | 199 | 31 | 30 | 1 | 0 | 15 | 94 | 0 | 5 |
| 103026 | 150 | survived | 199 | 0 | 0 | 0 | 0 | 0 | 56 | 0 | 2 |
| 103027 | 150 | survived | 345 | 19 | 19 | 1 | 0 | 9 | 85 | 0 | 4 |
| 103028 | 150 | survived | 325 | 4 | 1 | 0 | 0 | 0 | 60 | 0 | 6 |
| **total** | | | | **73** | **69** | **2** | **0** | **32** | **569** | **1** | **26** |

Armed leg (guard on, `COMPANIONGUARD=1`), same anchor:

| seed | days | end | standing | launches | landed | orphans | skips | parties | deaths | starv | w4kills |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 103021 | 150 | survived | 415 | 1 | 1 | 0 | 0 | 0 | 74 | 0 | 5 |
| 103022 | 129 | village-lost | 199 | 17 | 17 | 0 | 0 | 8 | 74 | 1 | 1 |
| 103023 | 150 | survived | 150 | 0 | 0 | 0 | 0 | 0 | 50 | 0 | 0 |
| 103024 | 150 | survived | 300 | 1 | 1 | 0 | 0 | 0 | 76 | 0 | 3 |
| 103025 | 150 | survived | 390 | 37 | 36 | 0 | 1 | 18 | 96 | 0 | 5 |
| 103026 | 150 | survived | 199 | 0 | 0 | 0 | 0 | 0 | 56 | 0 | 2 |
| 103027 | 150 | survived | 199 | 63 | 56 | 0 | 6 | 31 | 76 | 0 | 1 |
| 103028 | 150 | survived | 325 | 4 | 1 | 0 | 0 | 0 | 60 | 0 | 6 |
| **total** | | | | **123** | **112** | **0** | **7** | **57** | **562** | **1** | **23** |

Notes on the totals:

- Six of eight armed seeds are trajectory-identical to control
  (no skip fired before the trajectories settled, or no skip at
  all). The two seeds where the guard fired diverged from control
  exactly as the prereg's RNG-divergence note predicts: the guard
  returns before `startExpedition`'s `R()` draws, so the armed RNG
  stream diverges at the first skip. s103025 armed: 37 attempts vs
  31 control, standing 390 vs 199, wave 5 vs wave 4. s103027 armed:
  63 attempts vs 19 control, standing 199 vs 345, wave 4 vs wave 5,
  w4kills 1 vs 4. The bars are read on totals, as the prereg
  directs — the legs are two draws from nearby distributions, not
  paired trajectories.
- All 112 armed landed launches are `vbrain-party_launch x
  off-home`; 0 `winplan-party_launch`, 0 haven-target trips — the
  same shape as the medicduty band (all 198 launches vbrain).
  Blocked attempts armed: 7 companion-guard, 1 hurt-no-care,
  3 medic-duty. Control: 1 hurt-no-care, 3 medic-duty.
- Classification: 0 unknowns, 0 re-derivation mismatches, 0
  instrument errors on both legs (analyzer `classification: pass`,
  `corpus: pass`, `instrumentErrors: pass`).
- The single starvation death on each leg is the same seed/village
  (s103022, identical trajectory on both legs).
- Medic-duty carryover: Diana (diana_osei) blocked 3× on day 48 of
  s103028, identically on both legs; the seed still launched 1
  expedition, so it is not "starved" by the frozen definition (same
  holder re-picked ≥3 AND 0 launches). Pool on medic-duty blocks:
  n=3, min 1, median 2, max 4 — non-empty every time. No starved
  seeds on either leg.
- Zero-launch seeds on BOTH legs: 103023 and 103026 — the
  medicduty-b open finding ("two seeds never attempt a launch at
  all") recurs on this fresh band. The villages look otherwise
  alive (both survived to 150d, wave 4, standing 150/199). Not new,
  not re-filed; the existing open item stands.

## Wall numbers (GO bar 5) — both legs

| | Armed | Control |
|---|---|---|
| National by standing (≥200) | 4/8 | 4/8 |
| National by scaleRank | 0/8 | 0/8 |
| National or global | 0/8 | 0/8 |
| Table | 0 | 0 |
| Wins | 0 | 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 4/8 | 4/8 |
| Median survival (gameDays) | 151 | 151 |
| Deaths (all causes) | 562 | 569 |
| Wave-4 kills | 23 | 26 |

The scale wall is unchanged by the guard: national by standing 4/8
on both legs, no table, no wins, no national by rank. The guard
removes a trip-clobbering defect; it does not move the wall.

## Village assessment

Seven of eight villages survive to 150 days on both legs; the one
loss is s103022 at 129 days on both legs (identical trajectory —
the guard never fired there). The villages are regional, standing
150–415, wave 4 everywhere, wave 5 on half. Nobody reaches the
table. The two busy villages (s103025, s103027) do nearly all the
expeditioning — 100 of 123 armed attempts, 50 of 73 control
attempts — while two villages never leave Haven at all. Wave-4
kills sit at 23–26 across the band: the chain's kill link is still
the thin one, and this guard was never meant to fix it — it stops
parties from eating their own companions' trips.

## Metric review (no re-score — the bars stand as judged)

- The prereg's predicted direction for per-call landed launches
  did NOT hold: armed 112 vs predicted ≈ control (69) − control
  overwrites (2) = 67. The prediction assumed paired trajectories;
  the prereg's own RNG-divergence note says the legs are not
  paired, and the two skip seeds diverged hard (s103027: 63
  attempts armed vs 19 control). Bar 2 as written (distinct party
  launches, armed 57 ≥ control 32 − 2) passed with a margin that
  comes from divergence noise, not from the guard. The guard's
  clean read is skips (7) + orphans (0 armed vs 2 control) + the
  unit proof (115/115), not the launch totals. A future arm on a
  denser band that wants a paired launch comparison needs a
  divergence-proof unit (e.g., orphans per attempt, or a
  same-seed/same-day matched comparison) — the −2 tolerance on a
  diverged total is loose.
- Whether the party-launch unit for bar 2 was the right unit: it
  was satisfiable and it passed, but it measures the village's
  launchiness more than the guard. The orphan count is the
  guard's own metric and it behaved exactly as designed.
- "Wait for return" (the unchosen alternative, design decision 3):
  skips did not cost parties (57 vs 32) and did not cost survival
  (median 151 = 151, starvation 1 = 1) — no reason to revisit.
- Same-part key collision: the guard removes the collision at the
  source (0 orphans armed; all 7 skips are same-part) — no
  per-call trip id is needed in the instrument.
- Balanced panel (prereg §15) NOT run in this adoption: the base
  panel needs a prereg-commit worktree plus 64 × 150d child sims
  (`--n 16 --days 150`, 4 policies), and the lever panel another
  64 — an estimated 1.5–3 h of panel compute against a run whose
  judged legs already took ~38 min. The five frozen bars are the
  judge and they all pass; the panel is the cross-check. Exact
  follow-up commands for the coordinator (base panel from a
  worktree at the prereg commit `35ba8eb58`; lever panel from the
  guard tip — post-GO the guard is unconditional, so no env is
  needed and it equals the gated tip with `COMPANIONGUARD=1`):
  `node scripts/balance-panel.js --n 16 --days 150 --out <base>`
  then `node scripts/balance-panel.js --n 16 --days 150 --out <lever>`
  then `node scripts/balance-panel.js compare --before <base>/panel.json.gz --after <lever>/panel.json.gz --out <compare>`.
  Recorded here as an open cross-check, not as a verdict input.

## Sense-testing (SENSE-TESTING LAW)

Read the departure and fireside lines out of both corpora (517
control + 660 armed sayLines). Villagers read like people:

- "🎒 Luna shoulders a pack. 'Going far this time. Don't wait
  up.'" (s103021 d25, both legs, identical)
- "'Gone a while,' Aarna says, already walking. 'If I'm not back
  in a few days... well. I'll be back.'" (s103022 d24)
- "🎒 Sam is leaving — not foraging. Really leaving. 'I'll bring
  back something worth the walk.'" (s103022 d32)
- Fireside scene (s103022 d6): a paramedic tells the village about
  putting down a dog-shaped silence at the treeline; Priya says
  quietly "The fire feels smaller now." Named speakers, reactions,
  a beat of silence before the questions. (The line is truncated at
  the recorder's 600-char cap — an instrument limit, not a game
  defect.)
- No companion/party say-lines were captured: the guard skip is
  silent by design. The companion was already out — there is
  nothing to refuse and nothing to announce; the inviter's own
  departure IS narrated, and the skipped companion keeps their trip
  and their plan. Silence is the honest narration here, not a
  missing line. Nothing robotic, static, or repeated was found in
  the expedition lines beyond the intended three-variant departure
  pool (the same three departure lines recur across villagers —
  that is the existing departure voice, not this arm's).

## Instrument notes / run log (for the coordinator)

- Adoption: the 0030Z run's worker died before implementing
  anything. The prereg was already frozen and committed
  (`35ba8eb58`); the instrument scripts existed UNCOMMITTED in the
  tree. Read them in full, verified them against the prereg, and
  committed them with the guard work (`061b45bdb`).
- Two bugs in the proof test as written by the dead worker, fixed
  in `061b45bdb` (recorded, not hidden): (1) the static scope
  check did `git status` output `.trim()` before splitting — trim
  eats the leading space of the first porcelain line (`" M ..."`)
  and `slice(3)` then mangles the first path (`"rc/js/..."`),
  failing the check on a correct tree; (2) `winPlanSrc` was used
  by two code-anchor checks BEFORE its `const` declaration
  (temporal dead zone — the test crashed). Both fixed; proof went
  115/115.
- Proof-ordering note: the task text said commit first, then run
  the proof — but the proof's static scope check reads the src/
  diff, so it can only pass while the guard is uncommitted. The
  proof was therefore run pre-commit (115/115), then committed.
  In the gate-removal commit the scope check was changed to diff
  against the frozen prereg commit (`35ba8eb58`), so it passes at
  both commits; the proof was re-run green (115/115) on the
  shipped unconditional code before committing `03b88ebd6`.
- Bare `node scripts/test-companionguard-b.js` exits immediately:
  the driver defaults `MODE=on` at require time and refuses
  `MODE=on` without `COMPANIONGUARD=1`. Run it as `MODE=off node
  scripts/test-companionguard-b.js` (the test's children set their
  own MODE explicitly).
- `node scripts/balance-panel.js --help` does NOT print help — the
  script has no `--help` handling and starts building a panel with
  default args. A stray invocation was started and killed during
  this run; it wrote nothing into the tree (verified via
  `git status`).
- safe-commit index clobber struck BOTH commits (the documented
  class: after a correct private-index commit, the main index shows
  committed files as deleted `D` / modified `MM` while the
  worktree files are byte-identical to HEAD). Repaired both times
  via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; verified `git status --short` empty and
  `git diff HEAD` empty after each repair. Both commits verified
  correct in `git show`.
- Proof timing varied with box load: first run 326s (CPU-starved
  by the stray balance-panel invocation above), later runs ~28s
  and ~54s on a quiet box. The checks are content-based; timing is
  not a verdict input.
- Driver/analyzer frozen as the judged instrument: post-ship,
  `MODE=off` no longer means guard-off (the guard is
  unconditional). The corpora in
  `evidence/2026-11-16/perseed-companionguard-b-{control,armed}/`
  are the judged record at anchor `061b45bdbaab`. A future re-run
  of the driver would measure shipped behavior on both legs.
- Heartbeats: 03:34Z, 04:24Z (registry `heartbeat_at`).

## Blanks filled / documented

- FILLED (findings backlog #2462, `claimed` → to be marked `fixed`
  by the coordinator on merge): the companion call clobbers a live
  expedition. Guard in `startExpedition` + mirror plan-record
  honesty in `vbrainExecuteDepart`, shipped unconditional.
- DOCUMENTED (not filled): zero-launch seeds recur on a fresh band
  (103023, 103026 — the existing open item from medicduty-b
  stands); the scale wall is unchanged (national by standing 4/8,
  no table, no wins); balanced-panel cross-check outstanding (see
  Metric review).

## Files

- Prereg: `evidence/2026-11-16/sim-companionguard-b-prereg.md`
- Evidence (this file):
  `evidence/2026-11-16/sim-companionguard-b.md`
- Analysis: `evidence/2026-11-16/companionguard-b-analysis.json`
- Control corpus (8 files):
  `evidence/2026-11-16/perseed-companionguard-b-control/`
- Armed corpus (8 files):
  `evidence/2026-11-16/perseed-companionguard-b-armed/`
- Driver logs: `evidence/2026-11-16/companionguard-b-control-driver.log`,
  `evidence/2026-11-16/companionguard-b-armed-driver.log`
- Instrument + guard: `scripts/companionguard-driver-20261116.js`,
  `scripts/analyze-companionguard-b.js`,
  `scripts/test-companionguard-b.js` (115/115),
  `src/js/villager-agency.js`, `src/js/villager-brain.js`
- Commits on branch `sim-companionguard-b`: `35ba8eb58` (frozen
  prereg), `061b45bdb` (instrument + gated guard + proof),
  `03b88ebd6` (GO gate removal + proof update). Merged locally:
  NO — coordinator merges. Report: done, pending merge.
