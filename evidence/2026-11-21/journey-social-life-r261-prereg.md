# Journey social life r261 — PRE-REGISTRATION (Lane B, 2026-11-21)

Run ID `2026-11-21T13:55:17Z-loop2-leg5-r261`. Lane B occurrence 08:00 CST
Nov 21, 2026. Rotation-b read 5 at run start (social life); this run plays
5 and writes 6 at closeout. Base at run start: master `b6aad8942`
(r263 endgame adoption merge). origin/master is `9c4ed7a87` (ship-loop
version bump 27a650645-20261121-124229, version files only) — `git pull`
pending the write flap clearing (see Infra). Prior Lane B social runs:
r256 (landed ed19c3d57 + 057bfa60f), r260 (landed af2320278); r262
succession (landed a3fe07b25) carried BOTH arms r260 filed for this run
— see Arms.

## Leg question (carried from r238 + r239 + r256 + r260)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, r238 repay-fallback, r256
Arm C gossip-ask fix, r260 M4 discourse-opener strip, and the r262
M12 escalator cap + "You asked me that before" strip hold in the
wild on FRESH seeds?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45793–45796**. Backup band **45797–45800**.
- Check (2026-11-21 ~14:00Z): `grep -rln -E "45793|45794|45795|45796"
  evidence/ --include='*prereg*'` → 0 hits. Backup
  `45797|45798|45799|45800` → 0 hits. Band FRESH.
- No forbidden/contaminated band list names this band (only
  skill-reference files mention the phrases).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256), 45785–45788 (r260).
  Named backups reserved: 45769–45772 (r239), 45781–45784 (r256),
  45789–45792 (r260). Rejected 45757–45760 (r250 draft / r239
  timestamp coincidence) — named = used.

## Arms

### Arm A: M12-native WILD CONFIRM (r260's NO-GO, fixed by r262)

r260 read M12-native NO-GO on ONE sitting (seed 45787, Ines Duarte,
day 27: "I've told you three times now" served 3×, "We're going in
circles" 2× — the escalator CYCLED past its cap). r262 landed the
cap in `src/js/convo-dialogue.js` (M12-CAP: `_favorReqCirclesServed`
latch per block reason per sitting; escalator stays at "circles",
never re-serves "three times now") with proof test
`test-journey-succession-r262-escalator-cap-20261121.js` RED→GREEN
and a panel-confirm on the native seed 45787 (max 1 per sitting, 0
sittings 2+, 24 circles exits). THIS run judges the cap on FRESH
seeds — the native-seed confirm proves the fix works where it failed;
the fresh panel proves it holds everywhere else.

Binding bar (unchanged): **threeTimes maxPerSitting ≤1, 0 sittings
with 2+, exits ≥1.**

### Arm B: M4-SPLIT with the r262 strip (r260 metric review, applied)

r260 read conversational 12 vs bar ≤12 — GO at the bar, zero margin,
with the aroha trio ("You asked me that before. It's a different
question now." prefix ×3) named as the next strip. r262 added that
prefix to `stripM4DiscourseOpener` in
`scripts/journey-social-r226-helpers.js`; proof test
`test-journey-social-life-r250-m4-split-20261119.js` extended §6,
**49/49 GREEN**, r238 corpus pins hold EXACTLY at 181 / 174 / 7.
The r260 panel would read 9 with the strip (proof-test prediction).
THIS run judges the M4 count on fresh seeds under the revised scan.

Binding bar (unchanged): **conversational near-dup flags panel-wide
≤12.**

### Arm C: F6 + TRAIL WILD HOLDS

- **F6:** dry-line count 0 panel-wide (bar 0).
- **TRAIL:** distinct trail-talk lines panel-wide ≥6; max recurrence
  of any single trail-talk line per seed ≤4. The 3-press driver
  (r256 Arm B) is carried verbatim. Metric-review watch (r260):
  3 of r260's 10 distinct were "Between us we are carrying X kcal"
  template variants — this run reports the distinct count with and
  without template variants.

## Continuity panel

- Fresh seeds **45793–45796** (see band check above).
- DAYCAP 140. Same M1–M12, B5 split, B6 rows, F5 counter, F6 dry
  hold (bar 0), outing-chain tallies as r260.
- Determinism: one panel seed re-run to a separate OUTDIR, JSONs
  diffed identical before judging (r237/r238/r239/r256/r260
  precedent).

## Metrics (binding)

- **M12-NATIVE:** threeTimes maxPerSitting ≤1, sittings2plus = 0,
  exits ≥1.
- **M4-SPLIT-GO (revised, r262 strip in):** conversational near-dup
  flags panel-wide ≤12.
- **TRAIL WILD HOLD:** distinct ≥6 panel-wide AND max recurrence
  per seed ≤4.
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5 WILD CHECK:** report-only (r260: V1=1 V2=0 V3=0 — watch
  whether V3 stays unserved; 5 panels running).
- **M1–M12, B5, B6:** same bars as r260 (see
  evidence/2026-11-21/journey-social-life-r260.md).
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, outing conversion
  (r260 12.9%, watch ≥25% — the re-tune question stays open;
  this run measures, does not redesign). Hunger-plea pool thinness
  (2 of r260's 12): if it dominates again, it is the next content
  arm.

## Metric review (for the NEXT run, not this one)

- If M12-native misses on fresh seeds, the cap has a hole the
  native-seed confirm did not catch — report the sitting verbatim.
- If M4 conversational still reads >12, the next question is the
  remaining template families (belonging, murder/ambush,
  plant-teaching — same template, different slots), not the
  classifier.
- Outing-chain re-tune stays open (conversion watch).
- F5 V3 still never served in the wild.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r260-20261121.js` ->
  `scripts/journey-social-life-r261-20261121.js` (seeds 45793–45796,
  OUTDIR evidence/2026-11-21, filenames r261, mode string r261;
  everything else verbatim).
- Analyzer: `scripts/analyze-journey-social-r260-20261121.js` ->
  `scripts/analyze-journey-social-r261-20261121.js` (reads r261
  JSONs; everything else verbatim).
- Helpers: `scripts/journey-social-r226-helpers.js` (unchanged —
  the r262 strip is already in it).
- Standing proofs re-run on the worktree: M4-split (49/49),
  escalator-cap (r262), F6 proof (r226) 49/49, DRY2 27/27, DRY3
  37/37, TRAILTALK proof (r236) 30/30, F5 harness (r238) 50/50,
  repay-fallback (r238) 36/36, gossip-dry (r256) 9/9, C3d recap-live
  35/35.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-21 by
  this run; `git log --since=2026-11-18` empty for both — no commits
  since 2026-11-18). No-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments.
- `~/workspace/the-scattering/AGENTS.md` read at run start (repo
  house rules).

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `b6aad8942`;
  disk 48%.
- **Write flap ACTIVE:** window opened 2026-11-21T13:46:06Z (watcher
  pid 9722, already reported to Steve once by the flap watcher).
  `git update-ref` fails EPERM on `.git/refs/heads/*.lock`
  (probed 13:56Z, 13:58Z, 14:00Z, 14:01Z — all fail); `git fetch`
  works (FETCH_HEAD is an existing file) but `git pull --ff-only`
  fails ("no such ref was fetched" — the refspec write is refused).
  Local master `b6aad8942`, origin/master `9c4ed7a87` (bump only).
  Worktree registration + `git pull` both wait on the flap clearing.
- **Flap write behavior mapped this run:** exec/python/node writes
  to fresh files fail at flush with EPERM; `cp`/`sed >`/node
  writeFileSync all fail; BUT brief passing flickers exist (shell
  writes landed ~14:06Z) and `muse.write` (file tool) writes
  reliably through the window. A python write that "succeeds"
  without a read-back is NOT proof — buffered flush failures are
  silent at GC (caught twice: a "py-fresh OK" left a 0-byte file,
  and a truncate test destroyed this prereg's first staging copy).
  Lesson: verify every exec-written file by size + content, never
  trust the exit code alone. The clone landed on retry attempt 10
  at 14:10:03Z (driver 93,683 B, analyzer 48,294 B, diff-verified
  exact); run copies landed attempt 1 at 14:10:36Z.
- **Panel workaround (flap):** the panel runs from the main tree
  READ-ONLY with `OUTDIR=/tmp/r261-panel` — the driver loads game
  code from master `b6aad8942` (which already contains the r262 M12
  fix + M4 strip) and writes only to /tmp. Panel JSONs are staged
  for the worktree once registered; the worktree base will be the
  same code (pull adds only the version-bump commit, no src
  changes), so the panel stays valid. No repo writes are made by
  the panel run. Per-seed runs are independently retryable
  (SEEDS env) if a JSON write hits a failing flicker.
- Worktree-reap at pre-flight failed at the final REGISTRY.json
  save (flap EPERM); 12 worktrees + main = 13 trees, under the
  16 cap — registration fits once writes clear.
- Lock: `playtest-loop-2.lock` run_id
  `playtest-loop-2-20261121T1355Z` (no prior lock present).
  Heartbeat `bash scripts/worktree-heartbeat.sh journey2-social`
  once registered; re-heartbeat before each major phase.

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r260 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256/r260 precedent). Commit via
  safe-commit.sh in the worktree, ff-merge in main tree, release
  tree, rotation-b 5 -> 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; r260 built an ad-hoc /tmp baseline from
  the r256 panel — this run builds the same from the r260 panel and
  does NOT roll a baseline without adjudication).
- If the flap never clears inside this occurrence: stage prereg,
  driver, analyzer, panel JSONs, analysis log and run note in
  /tmp/r261-panel + the run note in ~/memory/2026-11-21.md, and hand
  the adoption the staged paths (r247/r260 precedent: gate + merge
  go to adoption; the panel itself is done read-only).
