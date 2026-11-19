# Journey social life r238 — PRE-REGISTRATION (Lane B, 2026-11-19)

## Run

- Lane B occurrence 03:00 CST Nov 19, 2026 (run_id `2026-11-19T09:00:00Z-loop2-leg5-r238`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: `18dae3a93` (master at registration; sim-bowopen-a
  adoption closeout). Master moved during registration (sim-bowopen-a
  adoption + correction `7235e2102`); the worktree branch was fast-
  forwarded to `7235e2102` before the panel (note-only correction, no src
  change) — panel base `7235e2102`.
- Leg 5 (social life). Run number r238 follows r237 (Lane B social, landed `3fdd5bc21` 2026-11-19, OUTING-SEEK driver + TRAIL HOLD GO + F6 HOLD GO, gate 339/5).
- **ADOPTION NOTE:** r237's adoption completed before this run (gate + telemetry done, merged `3fdd5bc21`; worktree `journey2-5` released). No held work to adopt. Rotation-b was left at 5 by the r237 adoption (its 5→6 step never landed — the r245 succession adoption later set 7→4, r246 endgame advanced 4→5); this run plays the 5 the file reads and advances 5→6 at closeout.

## Leg question (carried from r226 + r229 + r231 + r234 + r235 + r236 + r237)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, the r234 DRY2 fix, the r235 DRY3 fix, the r236 TRAILTALK fix, and
the r237 OUTING-SEEK driver hold in the wild?

## Fix arm: F5 TARGETED HARNESS — owed since r231, sixth thin panel

The settled-favor F5 branch (`src/js/conversation.js` ~7330–7360, r225)
serves one of three variants when a settled favor is re-asked:

- V1: `"No, really — it's handled. Thanks for asking, though."`
- V2: `"It's taken care of, I swear. You don't need to worry about that one anymore."`
- V3: `"Honestly? It's done. Finished. Thank you for checking — it means something that you did."`

Wild counts by grep (r231: 1, r234: 3, r235: 0, r236: 0, r237: NOT COUNTED —
the three r225 variant texts were not re-located before closeout). The
r237 metric review bound this run: "the next run must either locate the
r225 variants or build the harness". The variants are now located
(above, verified in source this run); the harness is this run's arm.

**Harness** (`scripts/test-journey-social-life-r238-f5-harness-20261119.js`,
godpath-lib pattern, modeled on the r226 F6 proof
`scripts/test-journey-social-life-r226-f6-dry-opener-20261116.js`):
stage a settled favor (`state: 'thanked'`, `ask_favor` want, stage 0) on a
test villager, then re-ask via `convoTurn(vid, 'alive:want')` in fresh
sittings, poisoning variants through ANOTHER villager's sitting first
(cross-villager run ledger, never the test villager's own said lists).
Cases:

1. FRESH-ALL: ask a fresh settled favor 3+ times across fresh sittings —
   all three variants serve at least once, 0 dry.
2. ONE-BLOCKED: poison V1, re-ask — serves V2 or V3, never V1, 0 dry.
3. TWO-BLOCKED: poison V1+V2, re-ask — serves V3 (r226 case 4 re-proven
   as the harness's core case), 0 dry.
4. ALL3-BLOCKED (characterized, not pass/fail): poison V1+V2+V3, re-ask
   — record exactly what serves (kept pick? dry line?) and the dry count.
   This is the known r226 residual ("all three blocked keeps the pick");
   the harness measures its real behavior. If it dries, the fix is the
   NEXT run's arm, filed here with the measured rate — not built here.
5. CROSS-VILLAGER: variant spoken by villager A, re-ask villager B's
   settled favor — B skips the ledger-blocked variant for a fresh one.
6. REPEAT-ASK EXHAUSTION (characterized, not pass/fail): ask the same
   settled favor 6 times in rapid succession across fresh sittings —
   record the serving sequence per variant + dry count. The 48-entry run
   ledger holds all three variants after three servings, so asks 4+ are
   EXPECTED to hit the all-3-blocked residual and dry in this minimal
   shape (in real play, dozens of other lines intervene and evict the
   variants between re-asks). The exhaustion point is the measurement.

**Analyzer counter (owed since r231):** the analyzer gains a
settled-favor counter — counts F5 variant servings in the panel JSONs by
matching the three variant texts above (same texts as the harness), per
seed + panel-wide. No more grep-only counts.

**NOT this arm:** the M4 split (proposal, carried); the Zinhle
creek-pocket strand (design look, r237); Olivia triple re-ask (driver
pestering, filed); repay.engageBeat broken/open pools; all-3-blocked F5
fix (characterized here, fixed next run if it dries).

## Proof / validation for the arm

- Harness runs standalone: cases 1–3 + 5 must serve honestly with
  0 dry; cases 4 and 6 are recorded, not judged. A harness that cannot stage a
  settled favor or cannot poison is a NO-GO — fixed first, not papered
  over.
- The r226 F6 proof stays green
  (`scripts/test-journey-social-life-r226-f6-dry-opener-20261116.js`);
  the r236 TRAILTALK proof stays green.
- Determinism: one panel seed re-run to a separate OUTDIR, JSONs diffed
  identical before judging (r237 precedent).

## Metrics (binding)

- **F5-HARNESS-GO:** cases 1–3 + 5 serve honestly, 0 dry servings
  in the harness. Bar is binary.
- **F5-ALL3-OUTCOME:** recorded (served text + dry count). Not a
  pass/fail bar.
- **F5-EXHAUSTION:** recorded (serving sequence over 6 rapid re-asks).
  Not a pass/fail bar — the exhaustion point is the measurement.
- **F5 WILD CHECK:** settled-favor variant servings in the wild, now
  counted by the analyzer counter (per seed + panel-wide). Bar: none —
  report-only; the wild count is no longer the judge, the harness is.
- **TRAIL WILD HOLD:** per-seed trail-talk lines by grep (same method
  as r234/r235/r236/r237). Bar, per seed where trail talk fires: max
  recurrence of any single trail-talk line ≤ 4; distinct trail-talk
  lines panel-wide ≥ 6. If <2 seeds fire trail talk, the bar is judged
  on the seeds where it fires and the thinness is recorded, not
  re-scored.
- **F6 WILD HOLD:** dry-line count on the fresh panel. Bar: 0 dry
  servings panel-wide (r237: 0, r236: 0, r235: 0).
- **OUTING CHAIN TALLIES:** per-seed outings started / completed /
  kept, haul kcal delivered, trail-talk presses per outing (r237
  baseline: 33 attempts / 6 kept / 14 talks / 2,990 kcal).
- **M1–M12:** same bars as r235/r236/r237 (see
  evidence/2026-11-17/journey-social-life-r235.md and
  evidence/2026-11-18/journey-social-life-r237.md).
- **B5 instrumentation:** per-funeral partial-vs-full split (kept).
- **B6 instrumentation:** want-resolution rows (kept).
- **WATCH TALLIES (carried, read-only):** re-offer max, dropped
  threads, NARR scan, react shape, scattering capture, player-side
  greeting repetition; M1 hot-accomplice pattern; HEED warn_you
  engagements; M2 combined-proposal bar (design-look at >= 20);
  MOOTS; DRY3 site-1 wild hold; F1/F3; BOND ANSWERED; CONFESS.

## Metric review (proposals for the NEXT run, not this one)

- **M4 split:** the near-dup count is still dominated by instructional
  lines (Haven-door cluster + live-want re-asks + teach templates).
  Split M4 into instructional vs conversational dups next run.
- **F5-ALL3:** if the harness shows all-3-blocked dries, the fix
  (4th fallback phrasing or structural exemption, same class as F6)
  is the next run's arm.
- **OUTING conversion:** r237 attempt-to-kept conversion was 18%
  (6/33). If it stays <25%, the dawn-positioning step is the suspect
  — the chain must be re-tuned, not the bar.

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45749–45752**. Backup band **45753–45756**.
- Check (2026-11-19 ~09:05Z): `git grep -l -E "45749|45750|45751|45752"
  -- 'evidence/*/*prereg.md' 'evidence/*/sim-*-prereg.md'` → 0 hits.
  Backup `45753|45754|45755|45756` → 0 hits. Band FRESH.
- Rejected first: **45741–45744** — named in
  `evidence/2026-11-01/journey-scale-r66-prereg.md`,
  `journey-scale-r67-prereg.md`, `sim-vet2mfg-a-prereg.md`, and
  `evidence/2026-11-16/journey-establishment-r230-prereg.md` (45741
  named). Rejected second: **45745–45748** — named in
  `evidence/2026-11-16/journey-social-life-r226-prereg.md` (backup
  band). Both recorded so the next worker does not repeat them.
- Full-tree `git grep` for 45749–45752 hits old Oct JSONs only
  (`evidence/2026-10-14/predcond-r30-sweep.json`,
  `evidence/2026-10-15/perseed-bearercombat/leadfeast-s55-full.json`,
  crumbdefault census JSONs) — checked: these are numeric coincidences
  (e.g. `"pantryKcal":45752`), not seed-band usage. The prereg scope
  above is the binding reservation check (r237 precedent).
- No forbidden/contaminated band list names this band (searched
  `evidence/` for forbidden/contaminated lists; only
  `evidence/2026-11-06/drive-practice-contaminated-baseline`, unrelated).
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237). r237's named backup
  45737–45740 is RESERVED (named = used) and is NOT used here.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r237-20261118.js` →
  `scripts/journey-social-life-r238-20261119.js` (seeds 45749–45752,
  OUTDIR evidence/2026-11-19, filenames r238; OUTING-SEEK carried
  verbatim; everything else verbatim).
- Analyzer: `scripts/analyze-journey-social-r237-20261118.js` →
  `scripts/analyze-journey-social-r238-20261119.js` (reads r238 JSONs;
  PLUS the settled-favor counter — counts the three F5 variant texts
  per seed + panel-wide).
- Harness (new): `scripts/test-journey-social-life-r238-f5-harness-20261119.js`
  (godpath-lib pattern, modeled on the r226 F6 proof).
- Helpers: `scripts/journey-social-r226-helpers.js` (reuse, no clone).

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (read 2026-11-18 by r237;
  no commits to either since — verified `git log --since=2026-11-18`
  empty this run). The joint-forage contract, the no-repeat invariant,
  and the dry-line contract live there + in conversation.js header
  comments. The settled-favor branch was re-read in source this run
  (`conversation.js` ~7330–7360, base `d30ed3e6b`).

## Jobs this run

(A) F5 HARNESS + ANALYZER COUNTER: build the harness (cases 1–6 above),
    run it standalone to GO; add the settled-favor counter to the
    analyzer. NO game-code change in this arm.
(B) CONTINUITY PANEL: the leg-5 panel on fresh seeds 45749–45752,
    same metrics as r237 (M1–M12, B5 split, B6 rows) + outing-chain
    tallies + F5 counter. The panel runs on the CURRENT base (all prior
    fixes native) — the wild holds are judged directly.
(C) NEW-BASE READS (watches): F5 wild count via the counter; F6
    dry-line hold (0); B5 funeral-mend voice with the per-funeral
    split; B6 stage-0 is-not-live; trail-talk depth; M4 instructional
    cluster; DRY3 site-1 wild hold.
(D) NOT THIS RUN: M4 split; Zinhle creek-pocket strand (design look);
    Olivia triple re-ask; repay.engageBeat pools; F5 all-3-blocked fix
    (characterized here, fixed next run if it dries); proof refresh
    round 21 (no src/js change this run).
(E) STRETCH (only after panel + gate are green): none — the gate is
    the long pole and the occurrence budget is 3600s; if the gate does
    not finish in-run, the adoption path (r235/r236/r237 precedent)
    closes it out and the run note states so plainly.

## Gate / closeout (standard)

- Proof tests + `node scripts/check.js --quick` (use
  `--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r237 gate note; standalone re-run
  any timeout before attributing). Commit via safe-commit.sh in the
  worktree, ff-merge in main tree, release tree, rotation-b 5 → 6,
  delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r237 noted
  QUIET with the baseline NOT rolled — stale-era l3.* keys the driver
  never emits; do not roll the baseline over schema drift without
  adjudication).
- Heartbeat the registered worktree before each major phase
  (registration ~09:04Z; re-heartbeat at prereg, harness, panel, gate,
  landing). No background heartbeat loop (the runtime reaps
  long-lived backgrounded exec sessions — r234/r235/r236 precedent).
- Infra note: registration took ~5.4 min (queued on REGISTRY.lock
  behind the sibling worktree-reaper's 9–14 min scan + Lane A's
  concurrent journey-landing registration). The reaper's consecutive-
  skip alert (5 skips) is the designed behavior while its scan holds
  the lock — not a jam.
