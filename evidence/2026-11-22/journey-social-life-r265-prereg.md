# Journey social life r265 — PRE-REGISTRATION (Lane B, 2026-11-22)

Run ID `playtest-loop-2-20261122T0055Z` (leg 5, r265). Lane B occurrence
19:00 CST Nov 21, 2026. Rotation-b read 5 at run start (social life);
this run plays 5 and writes 6 at closeout. Base at run start: master
`a8c2c201c` (endgame r264 adoption merge — tribute-first VOID, gate
339/5, 0 attributable). Prior Lane B social runs: r256, r260, r261
(landed 3e13d63d8, all binding bars GO). Endgame r264 adoption is
complete (commits on master, rotation 4→5 written 00:54Z, lock
deleted, no journey2-endgame tree in registry, no live adoption
processes) — this run does not collide with it.

## Leg question (carried from r238 + r239 + r256 + r260 + r261)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, r238 repay-fallback, r256
Arm C gossip-ask fix, r260 M4 discourse-opener strip, and the r262
M12 escalator cap + "You asked me that before" strip hold in the
wild on FRESH seeds?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45801–45804**. Backup band **45805–45808**.
- Check (2026-11-22 ~01:10Z): `grep -rln -E "45801|45802|45803|45804"
  evidence/ --include='*prereg*'` → 0 hits. Backup
  `45805|45806|45807|45808` → 0 hits. Bands FRESH.
- Full-tree grep for the chosen numbers found 10 October JSONs only
  (sim-killroad-r18-b, sim-scale-wall-r17, predation-b-leadfeast,
  spiralcond/spiralverb sweeps, belongfeast-s66, crumbguard census);
  spot-checked: the matches are incidental numeric values
  (e.g. `"pantryKcal":45802`), not seed namings. No prereg, forbidden
  list, contaminated list, screen, or extension band names this band.
- No forbidden/contaminated band list file exists under evidence/ or
  hidden_files (only `evidence/2026-10-13/drive-practice-contaminated-baseline`,
  a drive-practice baseline dir, not a band list).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256), 45785–45788 (r260),
  45793–45796 (r261). Named backups reserved: 45769–45772 (r239),
  45781–45784 (r256), 45789–45792 (r260), 45797–45800 (r261).

## Arms

### Arm A: OUTING drop-reason diagnosis (r261 metric review — the re-tune question, root-cause first)

Outing conversion has missed the ≥25% watch five panels running
(r239 16%, r256 13.0%, r260 12.9%, r261 12.5% on 56 attempts).
This run does NOT redesign the chain — it diagnoses WHY attempts
drop. The driver already records an `outcome` per attempt
(blocked-positioning / blocked-readiness / blocked-depart /
blocked-forage / blocked-deliver / blocked-combat /
delivered-promise-kept / attempt-error); the r265 analyzer adds a
per-seed and panel-wide OUTING OUTCOMES tally.
Binding deliverable: the outcome distribution, named in plain words
(e.g. "most attempts die at deliver-readiness because…"). If one
blocker dominates (>50% of non-kept attempts), the NEXT run's
re-tune targets that blocker; if drops spread evenly, the watch
itself (≥25%) is the thing to re-judge. Watch: conversion ≥25%.

### Arm B: F5 V3 — why never served (6 panels running)

F5 settled-favor variants: V1 and V2 serve; V3
("It's done. Finished. Thank you for checking") has served 0 times
across six panels. This run counts V1/V2/V3 as before (report-only)
AND reads the source that picks the variant to name the gate: which
code path serves V3, what condition it requires, and whether that
condition can occur in the wild panel at all. If V3's trigger is
unreachable in ordinary play, the finding is "dead content — serve
path never fires", not "rare content".

### Arm C: continuity holds (binding)

- **M12-native:** threeTimes maxPerSitting ≤1, sittings2plus = 0,
  exits ≥1 (r262 cap holds on fresh seeds — r261 closed r260's
  NO-GO; this run confirms it is not a one-panel fluke).
- **M4-SPLIT:** conversational near-dup flags panel-wide ≤12
  (r261: 8 with the r262 strip).
- **F6:** dry-line count 0 panel-wide (bar 0).
- **TRAIL:** distinct trail-talk lines panel-wide ≥6; max recurrence
  per seed ≤4. Report distinct with AND without template variants
  (r261 de-templated distinct was exactly 6 — the pool-depth
  question: if de-templated distinct is still ≤6, the next content
  arm is new trail lines, not counting).
- **M1–M12, B5, B6:** same bars as r261 (see
  evidence/2026-11-21/journey-social-life-r261.md).
- **Determinism:** one panel seed re-run to a separate OUTDIR,
  JSONs diffed identical before judging.

## Panel

- Fresh seeds **45801–45804**, DAYCAP 140.
- Driver `scripts/journey-social-life-r265-20261122.js` (r261 driver
  verbatim except seeds, OUTDIR evidence/2026-11-22, filenames r265,
  mode string r265). Analyzer
  `scripts/analyze-journey-social-r265-20261122.js` (r261 analyzer
  verbatim except DIR/pattern r265 + the Arm A OUTING OUTCOMES
  tally, per-seed and panel-wide). Helpers
  `scripts/journey-social-r226-helpers.js` unchanged.
- People check: read full transcripts in the 5 social contexts
  (day-1 nudge, first meeting, friendship, talk request, moot) —
  SENSE-TESTING LAW. Village assessment in plain words.
- Reachable / fun / winnable verdict for the leg.

## Metrics (binding)

- **M12-NATIVE:** threeTimes maxPerSitting ≤1, sittings2plus = 0,
  exits ≥1.
- **M4-SPLIT-GO:** conversational near-dup flags panel-wide ≤12.
- **TRAIL WILD HOLD:** distinct ≥6 panel-wide AND max recurrence
  per seed ≤4 (plus de-templated distinct reported).
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5 WILD CHECK:** report-only (V1/V2/V3 counts + the V3
  trigger read).
- **OUTING (Arm A):** report-only diagnosis — outcome distribution
  is the deliverable; conversion watch ≥25%.
- **M1–M12, B5, B6:** same bars as r261.
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, outing conversion.
  Hunger-plea pool: 0 of 8 on r261 (was 2 of 12 on r260) — watch
  clears unless it dominates again.

## Metric review (for the NEXT run, not this one)

- If one outing blocker dominates, the re-tune targets it; if
  drops spread evenly, re-judge the ≥25% watch.
- If V3's trigger is unreachable in the wild, the next arm is a
  serve-path fix (or a deliberate cut), not another count.
- If TRAIL de-templated distinct is still ≤6, the next arm writes
  new trail lines.
- If M4 conversational still reads >12, the next question is the
  remaining template families, not the classifier.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-22 by
  this run). No-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments.
- `~/workspace/the-scattering/AGENTS.md` read at run start (repo
  house rules; worktree copy verified byte-identical).

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `a8c2c201c`;
  disk 47%.
- Lock: `playtest-loop-2.lock` run_id `playtest-loop-2-20261122T0055Z`
  (no prior lock present at 00:55Z).
- Registration SLOW: `worktree-register.sh journey2-social` ran
  00:57–~01:29Z (~32 min). Lane A's `journey-establishment`
  registration held the registry flock 00:58–~01:12Z; each `git
  worktree add` took ~13 min on this loaded box (load avg 7–9 on
  1.5 shared CPUs; machine restarted ~00:25Z, up 1:02 at 01:27Z).
  Registration completed cleanly; worktree at `a8c2c201c`.
  Heartbeat `bash scripts/worktree-heartbeat.sh journey2-social`
  landed at registration and before panel launch.
- Write flap: /tmp fresh-file probe OK 01:08Z; no flap window
  observed this occurrence so far. The r261 lesson applies if one
  opens: verify every exec-written file by size + content, never
  trust the exit code alone; `muse.write` writes reliably.
- The panel is launched in the worktree with OUTDIR
  evidence/2026-11-22 (no /tmp staging needed — registration
  completed before launch). Per-seed JSONs land as each seed
  finishes, so a timeout mid-panel still leaves completed seeds
  for adoption (SEEDS env supports subsets).

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r261 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256/r260/r261 precedent).
  Commit via safe-commit.sh in the worktree, ff-merge in main tree,
  release tree, rotation-b 5 -> 6, delete lock (same-call run_id
  verification).
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; r261 built an ad-hoc /tmp baseline
  from the r260 panel — this run builds the same from the r261
  panel and does NOT roll a baseline without adjudication).
