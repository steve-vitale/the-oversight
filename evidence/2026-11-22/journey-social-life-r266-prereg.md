# Journey social life r266 — PRE-REGISTRATION (Lane B, 2026-11-22)

Run ID `playtest-loop-2-20261122T1355Z` (leg 5, r266). Lane B occurrence
08:00 CST Nov 22, 2026. Rotation-b read 5 at run start (social life);
this run plays 5 and writes 6 at closeout. Base at run start: master
`bda6ff495` (scale-onramp round 1115). Prior Lane B social runs: r256,
r260, r261, r265 (landed `fc915f94d`, all binding bars GO; outing watch
PASSES 38.1%; F5 V3 zero for the 7th panel, proven honest on both pools).

Rotation note: r265's adoption wrote rotation-b 5→6, but the endgame
r267 adoption (complete ~13:05Z) then wrote 4→5; rotation reads 5 now,
so social life is genuinely next (verified: `fc915f94d` on master, r267
adoption merge `32897eb7a`, no journey2-social tree in registry, no live
adoption processes). No queue jump.

## Leg question (carried from r238 + r239 + r256 + r260 + r261 + r265)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings
without drying — and do the r226 F6 fix, r231 C3d, r234 DRY2, r235
DRY3, r236 TRAILTALK, r237 OUTING-SEEK, r238 repay-fallback, r256
Arm C gossip-ask fix, r260 M4 discourse-opener strip, and the r262
M12 escalator cap + "You asked me that before" strip hold in the
wild on FRESH seeds?

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45813–45816**. Backup band **45821–45824**.
- **45805–45808 (r265's named backup): RESERVED, not used.** Named in
  `evidence/2026-11-22/journey-social-life-r265-prereg.md` as the backup
  band. Per the skill, a band named in any earlier prereg is used even
  with no judged corpus behind it — the name alone reserves it.
  Collision recorded here so the next worker does not repeat it.
- 45809–45812: named in `evidence/2026-11-17/journey-establishment-r231-prereg.md` — used.
- **45813–45816: FRESH.** `grep -rln -E "45813|45814|45815|45816"
  evidence/ --include='*prereg*'` → 0 hits. The only md hits for
  45813 are incidental substrings inside hashes/boot IDs
  (`a4404566ccfee345813469a...` in the 2026-10-20 conversation-structure
  and reconciled-release audits; boot `d4581308` in sim-gap-round-0715)
  — not seed namings. Spot-checked in context.
- 45817–45820: named in `evidence/2026-11-09/sim-sicknessdiag-b-prereg.md` — used.
- **45821–45824: FRESH (backup).** 0 hits in `*prereg*` files.
- No forbidden/contaminated band list file exists under evidence/ or
  hidden_files (only `evidence/2026-10-13/drive-practice-contaminated-baseline`,
  a drive-practice baseline dir, not a band list).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238),
  45765–45768 (r239), 45773–45776 (r256), 45785–45788 (r260),
  45793–45796 (r261), 45801–45804 (r265). Named backups reserved:
  45769–45772 (r239), 45781–45784 (r256), 45789–45792 (r260),
  45797–45800 (r261), 45805–45808 (r265).

## Arms

### Arm A: F5 V3 serve-path staging in the wild (r265 metric review — the next arm)

F5 V3 has served 0 times across seven panels, and r265 proved the
zero honest on both pools (F5W V1=V2=V3=0 in 556 conversations).
The source read (this run, before the panel) names the gate: the
settled re-ask branch (`src/js/conversation.js:7367`) fires only when
the sitting's want is `ask_favor` AND its favor is already settled
(state moot/thanked/acknowledged/fulfilled) — but `ask_favor.pick`
(`src/js/convo-wants.js:674`) returns 0 without a LIVE need, so a
settled favor is never re-selected by the weighted pick. The only
route back is a SEED: `ask_favor.resolve('stated'/'abandoned')`
plants an ask_favor seed with the favorId, and if the favor settles
between the seed planting and the next sitting, that sitting opens
on ask_favor + the settled favor (opener follow-up branch,
convo-wants.js:689; settled states plant nothing — the business is
closed — so the window is seed-planted-while-asked, settled-before-
the-next-sitting). V3 then needs the per-villager
`settledfavor:handled` cycle to reach its 3rd serving on that same
villager (`convoPickCycle` is without-replacement per villager across
sittings, so servings 1–3 are V1/V2/V3 in random order).

This run stages the path deliberately in the wild: the driver adds a
daily F5-REASK arm (after the day's social play, max 2 visits/day).
Each day it scans the roster for villagers holding an ask_favor seed
(`convoCheckSeeds`, pure except deleting already-expired seeds) on a
settled favor with a speakable short (`convoGetFavor`), opens a
sitting, records `c.want.id`, presses the OFFERED want choice
(`alive:want:<wantId>` — never a direct turn call when the menu does
not offer it), and records the served line + variant by the F5W
shape cores. The arm is a visit, like the driver's day-1 nudge /
talk-request / friendship visits; the favor, seed, want, and served
line are all natural — only the visit is deliberate.
Binding deliverable: the FUNNEL, named in plain words —
ask_favor seeds seen (by favor state at first sight) → seeds on
settled favors → sittings opened → want was ask_favor → want choice
offered → re-asks pressed → variants served (V1/V2/V3). If ≥1
re-ask lands, the panel rate is the story; if 3 land on one
villager, V3 is the verdict. If the funnel starves at want
selection, the finding is "the gate is want selection, not the
re-ask branch" — a serve-path question for the NEXT run, not a
re-count. Report-only (diagnosis, no GO/NO-GO bar).

### Arm B: r152 harness fallout — the fix (test-side only, no src/js change)

The r152 named-favor landing (`de0cb73c8`) broke 3 standing proofs,
all the same cause, verified on this base BEFORE the fix:
- F5 harness (`test-journey-social-life-r238-f5-harness-20261119.js`):
  **46 passed, 4 failed.** The harness stages favors with short
  `'spare food for the little ones'` (named pool) but its cores match
  only the generic pool, so every named serving reads
  `variant=null`; and it poisons with the GENERIC strings, which
  cannot block the named variants (different text = different
  ledger entry). Failure text proves the game right (fresh named
  variants served, 0 dry in every case).
- F6 dry-opener (`test-journey-social-life-r226-f6-dry-opener-20261116.js`):
  **48 passed, 1 failed.** Section 4 poisons generic V1+V2 and
  asserts `"It's done. Finished"` — the named V3 reads
  `"Honestly? It's done — spare food for the little ones. Finished. ..."`.
  The served line IS V3; only the matcher is wrong, and the
  poisoning leaves the pick order-dependent.
- repay-fallback (`test-journey-social-life-r238-repay-fallback-20261119.js`):
  **35 passed, 1 failed.** Section 3 poisons generic V1+V2+V3 and
  expects the structural fallback — the game serves named V1
  (unblocked), so `'Okay. Here'` never appears.
- Controls still green on this base: r225 F5 test 22/0 (its
  shape-based MARKERS already match both pools — the model for
  this fix); r152 named test covers the generic pool (shortless
  favor).

Fix: in all three files, (a) shape-based variant detection using
the r265 analyzer's F5W cores (V1 = line contains "it's handled"
AND "Thanks for asking"; V2 = case-insensitive "taken care of, i
swear"; V3 = "Finished. Thank you for checking"), and (b) poison
by VARIANT SLOT — the NAMED variant strings interpolated with the
staged short — so the ledger blocks the exact text the game serves.
The all-blocked expectations then test the real residual (fallback
speaks, never dry). Proof: all three green after the fix, plus
r225 F5 (22/0) and the r152 named test still green. No src/js
change — the game behavior is correct in every failure line.

### Arm C: continuity holds (binding)

- **M4-SPLIT:** conversational near-dup flags panel-wide ≤12
  (r265: 7 with the r262 strip).
- **F6:** dry-line count 0 panel-wide (bar 0).
- **TRAIL:** distinct trail-talk lines panel-wide ≥6; max recurrence
  per seed ≤4. Report distinct with AND without template variants
  (r265 de-templated distinct 12 — the pool IS deepening; the next
  TRAIL question is recurrence on the thin seeds, not pool size).
- **M12-native: CLOSED, watch-only this run** (r265: third fresh
  panel GO — max≤1, 0 sittings 2+, exits≥1; the next social run
  judges new arms, not this one). Recorded, not a binding bar.
- **M1–M12, B5, B6:** same bars as r265 (see
  evidence/2026-11-22/journey-social-life-r265.md).
- **OUTING (report-only):** attempt-volume volatility across seed
  bands (r265: 21 attempts, 8 kept, 38.1% — the watch passes; kept
  held flat 8 vs 7 while attempts fell 56→21). No re-tune.
- **Determinism:** one panel seed re-run to a separate OUTDIR,
  JSONs diffed identical before judging.

## Panel

- Fresh seeds **45813–45816**, DAYCAP 140.
- Driver `scripts/journey-social-life-r266-20261122.js` (r265 driver
  verbatim except seeds, OUTDIR evidence/2026-11-22, filenames r266,
  mode string r266, + the Arm A F5-REASK daily arm and its record in
  the per-seed evidence). Analyzer
  `scripts/analyze-journey-social-r266-20261122.js` (r265 analyzer
  verbatim except DIR/pattern r266 + the Arm A F5-REASK funnel
  rollup). Helpers `scripts/journey-social-r226-helpers.js`
  unchanged.
- People check: read full transcripts in the 5 social contexts
  (day-1 nudge, first meeting, friendship, talk request, moot) —
  SENSE-TESTING LAW. Village assessment in plain words.
- Reachable / fun / winnable verdict for the leg.

## Metrics (binding)

- **M4-SPLIT-GO:** conversational near-dup flags panel-wide ≤12.
- **TRAIL WILD HOLD:** distinct ≥6 panel-wide AND max recurrence
  per seed ≤4 (plus de-templated distinct reported).
- **F6 WILD HOLD:** dry-line count 0 panel-wide.
- **F5 WILD CHECK:** report-only (V1/V2/V3 counts, legacy + widened).
- **F5-REASK (Arm A):** report-only funnel — the diagnosis is the
  deliverable.
- **ARM B FIX:** F5 harness, F6 dry-opener, repay-fallback all
  green after the fix; r225 F5 + r152 named test still green.
- **OUTING:** report-only (attempts/kept/conversion + outcome
  distribution).
- **M1–M12, B5, B6:** same bars as r265.
- **WATCH:** re-offer max, dropped threads, NARR scan, scattering,
  M2 rate, moots, BOND ANSWERED, CONFESS, M12-native (watch-only).

## Metric review (for the NEXT run, not this one)

- If the F5-REASK funnel starves at want selection, the next arm
  is a serve-path question (seed the re-ask, or give settled favors
  a want), not another count. If re-asks land but V3 never serves,
  the next question is the cycle across sittings on one villager.
- If M4 conversational still reads >12, the next question is the
  remaining template families (plant-teaching, "Something eases",
  belonging), not the classifier.
- If TRAIL recurrence on thin seeds stays max 3, the pool question
  closes; the next content arm is elsewhere.

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (re-read 2026-11-22 by
  this run). No-repeat invariant + dry-line contract live in
  CONVERSATIONS.md and the conversation.js header comments.
- `~/workspace/the-scattering/AGENTS.md` read at run start (repo
  house rules; worktree copy verified byte-identical).
- Source read for Arm A (this run, main tree, read-only):
  `src/js/conversation.js:7367` (settled branch), `7361-7415`
  (variant pools), `3499` (convoPickCycle);
  `src/js/convo-wants.js:674` (ask_favor.pick), `689` (seed
  follow-up), `1020-1060` (ask_favor.resolve seeds),
  `2709-2800` (convoSelectWant), `3366` (convoCheckSeeds),
  `3411` (convoResolveWant); `src/js/convo-scene.js:470`
  (alive:want menu choice id).

## Infra (this occurrence, pre-panel)

- Pre-flight `git status --short` clean (0 files) at tip `bda6ff495`;
  disk 49%.
- Lock: `playtest-loop-2.lock` run_id `playtest-loop-2-20261122T1355Z`
  (no prior lock present at 13:55Z).
- Registration SLOW: `worktree-register.sh journey2-social` queued
  on the registry flock (live Lane A journey-landing holds it);
  r265's registration took ~32 min on the same queue.
- Write flap: no window observed this occurrence so far; /tmp
  fresh-file probe OK at run start (prereg drafted to /tmp, copied
  into the worktree after registration). The r261 lesson applies if
  one opens: verify every exec-written file by size + content, never
  trust the exit code alone; `muse.write` writes reliably.
- The panel is launched in the worktree with OUTDIR
  evidence/2026-11-22. Per-seed JSONs land as each seed finishes,
  so a timeout mid-panel still leaves completed seeds for adoption
  (SEEDS env supports subsets).

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick`
  (`--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r265 gate note; standalone re-run
  any timeout before attributing). Gate goes to adoption if the
  occurrence budget runs out (r239/r256/r260/r261/r265 precedent).
  Commit via safe-commit.sh in the worktree, ff-merge in main tree,
  release tree, rotation-b 5 -> 6, delete lock (same-call run_id
  verification).
- Telemetry: `telemetry-check.js` vs the social baseline (no
  canonical baseline exists; r265 built an ad-hoc /tmp baseline
  from the r261 panel — this run builds the same from the r265
  panel and does NOT roll a baseline without adjudication).
