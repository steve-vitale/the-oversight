# Journey social life r277 — PRE-REGISTRATION (Lane B, 2026-11-23)

Run ID `playtest-loop-2-20261123T1700Z` (leg 5, r277). Lane B occurrence
17:00 CST Nov 23, 2026. Rotation-b read 5 at run start (social life);
this run plays 5 and writes 6 at closeout. Base at run start: master
`1a7a5b647` (fleshout-20261123T2015Z adoption). Prior Lane B social runs:
r256, r260, r261, r265 (all binding bars GO; outing 21 attempts, 8 kept),
r266 (NO-GO M4 15 / TRAIL 4 / F6 dry 1; F5 V3 served first time),
r268 (NO-GO M4 24 / TRAIL 0 / F5W 0; F6 GO; Arm B resume-fall-through
fix landed `7a2de2e42`, gate 334/10, 0 attributable; panel evidence +
driver on master, gate-log commit content tracked).

## Leg question (carried from r238 + r239 + r256 + r260 + r261 + r265 + r266 + r268)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, r238 repay-fallback, r256
Arm C gossip-ask fix, r260 M4 discourse-opener strip, the r262 M12
escalator cap + "You asked me that before" strip, and the r268
convoLiveBeat resume fix hold in the wild on FRESH seeds — AND does
the joint-outing chain actually get promised, now that r268 showed
it never even attempting?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45845–45848**. Backup band **45849–45852**.
- Word-boundary check (`git grep -w -E "4584[5-8]" -- 'evidence/*-prereg.md'`):
  0 hits for each seed of both bands. The only substring hit anywhere is
  `4585023` (a kcal total inside `evidence/2026-11-01/journey-scale-r68-prereg.md`,
  line 115, naming the false positive in its own text) — not a seed naming.
- **45841–45844: REJECTED out of caution.** Naive grep showed 2 "prereg"
  hits for 45842, which resolve to data values (`45842` at line 2912 of
  `evidence/2026-11-21/perseed-dmgpin-reprereg-b-{armed,control}/
  dmgpin-reprereg-b-s106729-dmgpin-reprereg-b-pinquaddoor.json`) inside
  directories whose names contain "prereg" — not prereg documents, not
  seed namings. Skipped anyway so the next worker faces no ambiguity.
- **45825–45828: USED** (endgame r178 prereg, crisis r261 prereg).
  **45833–45836: CONTAMINATED** (dmgpin reprereg per-seed files, r268).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256), 45785–45788 (r260),
  45793–45796 (r261), 45801–45804 (r265), 45813–45816 (r266),
  45829–45832 (r268). Named backups reserved: 45769–45772 (r239),
  45781–45784 (r256), 45789–45792 (r260), 45797–45800 (r261),
  45805–45808 (r265), 45821–45824 (r266), 45837–45840 (r268).

## Arms

### Arm A: DRIVER COMMIT FIX (driver fix, binding — THIS run's headline)

r268's 0-attempts mystery, diagnosed in code + probe this run BEFORE
the panel (probe: seed 45829, r277 driver, `evidence/2026-11-23/
journey-social-life-r277-45829.json`):

- The forage_help want IS live: pantryPer min 0 / max 11169,
  live-forage dawns 342/354, live-water dawns 208/354. The want gate
  is NOT the starvation point.
- Favors reach `asked` (ledger states seen: `asked`, `moot`) and
  NEVER `promised`. No promise → no dawn departure → no trail press.
- `dlg:commit` was offered **198 times** in the probe seed's captured
  transcripts and pressed **0 times**. The one r265 commit (James,
  day 14) came only because a confront-first menu put `dlg:commit`
  FIRST; the standard favor menu orders
  `[favor_requirements, commit, ...]` and `favor_requirements` is
  never spent, so `driveConversation`'s fallback (first non-leave
  choice) asks "Why can't I do this now?" forever. The NPC even
  answers with the fix ("Accept the forage request first") — the
  driver never takes it.
- Only `dlg:commit` creates a promise (`convoFavorCommit`,
  convo-wants.js:2443); only a promise starts an outing
  (`performForageFavor` requires `p.favorId === f.id`).
  `driveConversation` has no commit rule at all.

Fix: extract the pick priority into shared helper
`pickConversationChoice(choices, lastNPCText, recapPresses)` in
`scripts/journey-social-r226-helpers.js`, with a commit rule — press
`dlg:commit` when offered, AFTER answering questions (`gq:`) and
hearing the ask (`dlg:details`), BEFORE the generic first-non-leave
fallback. Wire `driveConversation` to it (same priorities, same
bye-first and recap accounting). The game already refuses unkeepable
commits (away guard R72, open-commitment guard), so the driver
committing when offered matches the competent-player model the panel
claims to play. Proof test
`scripts/test-journey-social-life-r277-driver-commit-20261123.js`:
favor-menu fixtures (commit offered 2nd after requirements; commit
offered 1st; no commit offered; question offered alongside commit) —
RED before the helper exists, GREEN after; driver wiring proven by
the panel (commit YOU-lines appear in transcripts).

Binding bars: **outing attempts ≥ 4 panel-wide** (r265: 21, r266: 8;
a fixed driver must clear 4) AND **TRAIL distinct ≥ 6 AND max
recurrence per seed ≤ 4** (unchanged). Conversion watch ≥ 25%.

### Arm B: F5W SETTLED-FAVOR RE-ASK (binding, unchanged)

Bar: **F5W total ≥ 1 panel-wide** (r268's bar). The driver fix may
unblock settlements (a favor settles when the deed is done; the deed
needs a promise). If F5W still reads 0, the funnel names where it
starves now — the seed-lifetime design (seed survives sittings until
the favor settles, or a settlement-triggered re-ask) is the NEXT
run's arm, with panel evidence. Do NOT redesign the seed lifetime
in this run on speculation.

### Arm C: M4-SPLIT (binding, unchanged — NO template normalization)

Bar: **conversational near-dup flags panel-wide ≤ 12.**
DECISION on r268 metric review #1: do NOT normalize teaching
frames (plant/place) in the scan. A player hearing "crush the leaf,
smell it, taste the stem" for four different plants hears real
repetition; normalizing it away would hide it. The r129/r130
analyzer's place-frame normalization stays in its own tally, not
the M4 scan. The residual is judged as-is. The content arms for M4
— teach-frame rotation survival through the agency-ask path (same
frame twice in one sitting despite per-sitting `teachFramesUsed`),
hunger-plea body variety, mood-beat `up:warm` pool widening — are
the NEXT run's arms, with this panel's flag breakdown as the target.

### Arm D: PANTRY-DAWN (report-only instrument, carried)

The r277 driver snapshots per dawn (before any arm acts): pantry
kcal, roster size, pantryPer, live forage_help / water_haul wants
(pure `convoFavorNeedPresent` reads), favorLedger forage_help /
water_haul entries by state. The probe already answered its first
question (the want gate opens; the promise step starves). The panel
reports the same rows on fresh seeds as a regression watch.

## Continuity panel

- Fresh seeds **45845–45848** (see band check above).
- DAYCAP 140. Same M1–M12, B5 split, B6 rows, F5 counter, F6 dry
  hold (bar 0), outing-chain tallies as r268.
- Determinism: one panel seed re-run to a separate OUTDIR, JSONs
  diffed identical before judging (r237/r238/r239/r256/r260/r261/
  r265/r266/r268 precedent). NOTE: the probe seed 45829 run (r277
  driver, current base) ended village-lost d118 vs r268's d140
  survived — base drift since r268 (master moved 86e5bd38e →
  1a7a5b647) and/or the pantry instrument's belief reads; the
  determinism re-run on the SAME driver + base is the binding check,
  not a match to r268's JSONs. If the re-run differs, the instrument
  is the first suspect (belief reads must be pure).
- Panel runs on the FIXED driver (Arm A proof-green before launch).

## Metrics (binding)

- **OUTING:** attempts ≥ 4 panel-wide (NEW — Arm A bar).
- **TRAIL WILD HOLD:** distinct ≥ 6 panel-wide AND max recurrence
  per seed ≤ 4.
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5W:** total ≥ 1 panel-wide.
- **M4-SPLIT-GO:** conversational near-dup flags panel-wide ≤ 12.
- **M12-NATIVE:** threeTimes maxPerSitting ≤ 1, sittings2plus = 0,
  exits ≥ 1.
- **M1–M12, B5, B6:** same bars as r268 (see
  evidence/2026-11-23/journey-social-life-r268.md).
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, outing conversion
  (watch ≥ 25%), hunger-plea share of M4, teach-frame pairs.

## Metric review (for the NEXT run, not this one)

- If outing attempts clear 4 but conversion stays < 25%, the next
  question is the depart/forage blockers (r266's blocked-positioning
  family), not the commit step.
- If F5W still reads 0 with promises flowing, the seed-lifetime
  design is next (funnel: settlements happening vs seeds gone).
- If M4 still reads > 12, the content arms are teach-frame rotation
  survival, hunger-plea body variety, mood-beat pool widening — in
  that order (rotation is a defect, the other two are variety).
- If TRAIL distinct clears 6 but the pool is still kcal-slot
  variants, the next TRAIL question is new lines (r261 metric
  review), not counting.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r268-20261123.js` ->
  `scripts/journey-social-life-r277-20261123.js` (seeds 45845–45848,
  OUTDIR evidence/2026-11-23, filenames r277, mode string r277;
  + pantryDawnArm snapshot in upkeep + `pantryDawn` serialization;
  + Arm A pick-helper wiring).
- Analyzer: `scripts/analyze-journey-social-r268-20261123.js` ->
  `scripts/analyze-journey-social-r277-20261123.js` (reads r277
  JSONs; + PANTRY-DAWN per-seed + panel rollup).
- Helpers: `scripts/journey-social-r226-helpers.js` (shared exports;
  + `pickConversationChoice`).
- Proof: `scripts/test-journey-social-life-r277-driver-commit-20261123.js`
  (RED before, GREEN after).
- Standing proofs re-run on the worktree: M4-split (extended),
  F5 harness (r238) 50/50, F6 proof (r226) 49/49, TRAILTALK proof
  (r236) 30/30, repay-fallback (r238) 36/36, gossip-dry (r256) 9/9,
  resume-fallthrough (r268) 36/36.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-23 by
  this run; the no-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments). No
  commits to either since 2026-11-18 — verified `git log
  --since=2026-11-18 -- docs/CONVERSATIONS.md docs/CANON.md` empty
  in the worktree at run start.

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `1a7a5b647`;
  `git pull` already up to date; disk 49%.
- VM restart ~23:30Z killed the first worktree-register attempt
  mid-`git worktree add` (partial dir contained only an `evidence/`
  subtree — a checkout copy of master's evidence, deleted as a
  duplicate; master intact) and the first heartbeat loop. Re-registered
  clean (23:02Z); heartbeat re-established after the restart.
- Write flap window ~23:28–~23:37Z (EPERM on writes; the control
  re-run of the r268 driver died at its JSON write, truncating
  `evidence/2026-11-23/journey-social-life-r268-45829.json` to 0
  bytes in the worktree — tracked on master, restore pending when
  writes clear; heartbeat EPERM at 23:38Z, registry heartbeat stale
  23:16:34Z — flap-caused, not death; re-heartbeat on clear).
- Lock `playtest-loop-2.lock` run_id
  `playtest-loop-2-20261123T1700Z` (created 22:55:50Z).

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r268 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256/r261 precedent). Commit via
  safe-commit.sh in the worktree, ff-merge in main tree, release
  tree, rotation-b 5 -> 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; r268 built an ad-hoc /tmp baseline from
  the r266 panel — this run builds the same from the r268 panel and
  does NOT roll a baseline without adjudication).
- Heartbeat the registered worktree before each major phase
  (`bash scripts/worktree-heartbeat.sh journey2-social`).
