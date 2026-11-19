# Journey social life r239 — PRE-REGISTRATION (Lane B, 2026-11-19)

## Run

- Lane B occurrence 14:00 CST Nov 19, 2026 (run_id `2026-11-19T20:00:00Z-loop2-leg5-r239`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout.
- Base at registration: `7e0810eea` (master at registration; sim-winnability-round-1530
  adoption closeout). No rebase during the run (no sibling landing between
  registration and panel; verified at closeout before merge).
- Leg 5 (social life). Run number r239 follows r238 (Lane B social, landed `e7bd782ab`
  2026-11-19, F6 repay-opener fix + F5 all-3-blocked fall-through; adoption
  `629b7847a` full 4-seed panel re-run on fixed code CONFIRMED F6 0 dry,
  `82bfbd751` proof refresh round 21, `ebea87dfb` gate check --quick 341/3,
  0 attributable).
- **Infra note:** a host write flap (~19:56–20:19Z, ~23 min, started minutes after
  a VM replacement) blocked all fresh-file writes at run start (26KB writes EPERM;
  1-byte writes reported OK but landed 0 bytes — silent truncation). Per
  local_write_flap_response: NO worktree registration until a probe passed.
  Probe-verified CLEAR 20:19:16Z (1B size 1, 26K size 26000). Registration then
  took 10.6 min (checkout slow under box load ~16.7). Lock (created 19:56:01Z,
  run_id playtest-loop-2-20261119T1955Z) verified landed by immediate cat.

## Leg question (carried from r226 + r229 + r231 + r234 + r235 + r236 + r237 + r238)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, the r234 DRY2 fix, the r235 DRY3 fix, the r236 TRAILTALK fix, the
r237 OUTING-SEEK driver, and the r238 repay-opener + F5 fall-through fix hold
in the wild on fresh seeds?

## Arm: NONE — continuity panel (this run)

No new fix arm. This run is a fresh-seed confirmation panel: the r238 fix
was proven on the r238 seeds (45752 re-run 0 dry) and the adoption's full
4-seed re-run of THOSE seeds confirmed F6 0 dry panel-wide. This run judges
the wild hold on four NEW seeds. The metric-review items below are proposals
for the NEXT run, not this one (metric binding).

## Metrics (binding)

- **F6 WILD HOLD:** dry-line count on the fresh panel. Bar: 0 dry
  servings panel-wide (r238 adoption: 0; r237: 0; r236: 0; r235: 0).
- **F5 WILD CHECK:** settled-favor variant servings, counted by the analyzer
  counter (per seed + panel-wide). Bar: none — report-only; the harness judges.
- **TRAIL WILD HOLD:** per-seed trail-talk lines by grep (same method as
  r234–r238). Bar, per seed where trail talk fires: max recurrence of any
  single trail-talk line ≤ 4; distinct trail-talk lines panel-wide ≥ 6.
  EXPECTED FAIL on distinct as written (r238 + adoption: distinct 2 both
  times; the bar measures press frequency, not pool depth — see metric
  review). Recorded, NOT re-scored.
- **OUTING CHAIN TALLIES:** per-seed outings started / completed / kept,
  haul kcal delivered, trail-talk presses per outing (r238: 15 attempts /
  6 kept / 6 talks / 3,600 kcal).
- **M1–M12:** same bars as r235/r236/r237/r238 (see
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

- **TRAIL distinct bar — REVISE (r238 proposal, carried):** the bar as written
  measures press frequency, not pool depth. The driver presses talk exactly
  once per outing by design and `talkLine` returns the first unused pool
  index — always 0 on a first press — so distinct caps at the number of
  temperaments that fire. Proposed revision for the next run: count distinct
  per press-opportunity (distinct lines / presses), OR raise presses per
  outing so the pool walks (driver change — a design call, not a bar tweak).
  Distinct is FAIL as written; not re-scored this run.
- **M4 split:** the near-dup count is still dominated by instructional
  lines (Haven-door cluster + live-want re-asks + teach templates).
  Split M4 into instructional vs conversational dups next run.
- **F5 wild count:** keep report-only while the harness judges.
- **OUTING conversion:** r238 6/15 = 40% (r237: 6/33 = 18%). If it stays
  ≥25%, the dawn-positioning suspect is retired; if it drops below 25%
  again, the chain re-tune question reopens.

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45765–45768**. Backup band **45769–45772**.
- Check (2026-11-19 ~20:00Z): `git grep -l -E "45765|45766|45767|45768"
  -- 'evidence/*/*prereg.md' 'evidence/*/sim-*-prereg.md'` → 0 hits.
  Backup `45769|45770|45771|45772` → 0 hits. Band FRESH.
- Rejected first: **45757–45760** — "45757" appears in
  `evidence/2026-11-03/journey-endgame-r118-prereg.md:14` only inside the
  run_id timestamp `loop2-20261103T145757Z` (a numeric coincidence, not a
  seed naming — same class as r238's pantryKcal precedent). Avoided anyway
  to keep the band unambiguous; recorded so the next worker does not repeat it.
- No forbidden/contaminated band list names this band.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235),
  45725–45728 (r236), 45733–45736 (r237), 45749–45752 (r238). r238's named
  backup 45753–45756 is RESERVED (named = used) and is NOT used here.

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r238-20261119.js` →
  `scripts/journey-social-life-r239-20261119.js` (seeds 45765–45768,
  OUTDIR evidence/2026-11-19, filenames r239; OUTING-SEEK carried
  verbatim; everything else verbatim).
- Analyzer: `scripts/analyze-journey-social-r238-20261119.js` →
  `scripts/analyze-journey-social-r239-20261119.js` (reads r239 JSONs;
  settled-favor counter carried).
- Helpers: `scripts/journey-social-r226-helpers.js` (reuse, no clone).
- Standing proofs (re-run on this base, no src/js change expected):
  `test-journey-social-life-r238-repay-fallback-20261119.js` (36),
  `test-journey-social-life-r238-f5-harness-20261119.js` (50),
  `test-journey-social-life-r226-f6-dry-opener-20261116.js` (49),
  `test-journey-social-life-r236-trailtk-20261118.js` (30).

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` read in full this run
  (2026-11-19 ~20:03Z); no commits to either since r237 read them
  (`git log --since=2026-11-18` empty). The no-repeat invariant and the
  dry-line contract live there + in conversation.js header comments:
  "The repeat ledger must not replace a successful promise with 'lost my
  train of thought.'"

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds 45765–45768,
    same metrics as r238 (M1–M12, B5 split, B6 rows) + outing-chain
    tallies + F5 counter. The panel runs on the CURRENT base (all prior
    fixes native) — the wild holds are judged directly.
(B) PEOPLE CHECK: read full transcripts for the leg (dry sittings if any;
    otherwise a sample of sittings incl. one moot-adjacent exchange) —
    SENSE-TESTING LAW.
(C) NEW-BASE READS (watches): F5 wild count via the counter; F6
    dry-line hold (0); B5 funeral-mend voice with the per-funeral
    split; B6 stage-0 is-not-live; trail-talk depth; M4 instructional
    cluster; DRY3 site-1 wild hold.
(D) NOT THIS RUN: M4 split; TRAIL bar revision (proposed, takes effect
    next run); Zinhle creek-pocket strand (design look, r237); Olivia
    triple re-ask (driver pestering, filed); repay.engageBeat pools
    (broken/open); proof refresh round 21 (already done by the r238
    adoption, `82bfbd751` — no src/js change this run).
(E) GATE: `node scripts/check.js --quick` NOT in-run (occurrence budget
    spent waiting out the flap + 10.6-min registration); the adoption
    path (r235/r236/r237/r238 precedent) closes it out and the run note
    states so plainly. Telemetry check runs in-run if budget allows.

## Gate / closeout (standard)

- Proof tests (above) + telemetry check vs the social baseline
  (`telemetry-baselines/social.json`; r238 precedent: LOUD on l3.* is
  known stale-era schema drift — driver emits `bondEnd.bonds` /
  `social.moots`, never `l3.*`; do NOT roll the baseline over schema
  drift without adjudication). Commit via safe-commit.sh in the
  worktree, ff-merge in main tree, release tree, rotation-b 5 → 6,
  delete lock.
- Heartbeat the registered worktree before each major phase. No
  background heartbeat loop (the runtime reaps long-lived backgrounded
  exec sessions — r234/r235/r236 precedent).
