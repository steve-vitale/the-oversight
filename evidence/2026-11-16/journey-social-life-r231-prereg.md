# Journey social life r231 — PRE-REGISTRATION (Lane B, 2026-11-16)

## Execution addendum (23:00 CST occurrence, run_id loop2-20261117T045549Z)

This occurrence EXECUTED the r231 prereg below (finalized by the two
blocked 21:00/22:00 CST occurrences). Registration succeeded on the first
attempt (8.5 min foreground, 11/16 active, 5 slots free). Base at
execution: 7199f371f (master moved 2ac3052b0 → f7128f9f3 → 7199f371f since
the draft; substantive movement: companionguard shipped unconditional,
nightcarry INCOMPLETE, expignite DIAG GO, nationalsticky DIAG-NO-GO on
power, rumortarget PILOT NO-GO, winnability-round adoption closeouts —
none touch convoRecapLine; the C3d fix shape stands). Write flap hit at
05:23–05:24Z (EPERM on the pilot JSON write; watcher log confirms the
window); cleared by 05:25Z; pilot re-ran clean. Panel ran on the
C3d-fixed code. Determinism proof: seed 45705 re-run to a scratch
OUTDIR, JSONs identical except the `ms` timing field. Proof-test
correction at execution: the case-1 assertion matched the favor short
case-sensitively, but ask_favor.staleOpener capitalizes the sentence-
initial short ("The creek water run — ..."); the assertion is now
case-insensitive (discrimination re-verified: base 31/4, fix 35/0).

## 22:00 CST occurrence — BLOCKED, no run (run_id loop2-20261117T035603Z)

Nothing was played, fixed, or committed. Rotation-b left at 5; lock deleted
at closeout (run_id verified first). Main tree clean, disk 49%.

Registration failed twice on infrastructure, not on the cap:
- Attempt 1: killed by a 110s timeout on the registry `flock` (Lane A's
  `journey-deepening` register held the lock since 03:46Z). Retry queued
  04:04Z with a 1200s timeout; waited behind Lane A, got the flock at
  04:09, then died at 04:24Z (exit 124) inside `git worktree add` — the
  checkout (`git reset --hard`) ran >12 min under load and never finished;
  the orphaned git cleaned up the partial dir. No registry entry.
- Attempt 2: launched 04:28Z, 1500s timeout, backgrounded with `&` inside
  the exec shell — died silently before 04:36 with no output, no dir, no
  processes. The `&`-backgrounded job did not survive its parent exec
  session's output-drain timeout (contrast attempt 1, launched as a
  foreground command, whose processes survived 20 min). Sibling heartbeat
  loops were also gone at 04:36 — the runtime reaps orphaned background
  process groups. LESSON: launch long registers as FOREGROUND execs (long
  yield_ms) so the runtime tracks them as sessions; never `&`-background
  them inside a shell that exits.
- Box load at block time: load average 3.52/5.64/9.00 on 1.5 shared CPUs;
  the checkout of this repo (498M partial tree) takes >12 min under that
  load. The next run should register FIRST, as a foreground session, and
  expect 15–20 min for reap + checkout.
- Branch `journey2-sociallife` still exists (points at 96d7d1d8b, an
  ancestor of master 2ac3052b0 — safe; the register script attaches with
  `-f`, then ff-merge origin/master inside the worktree).
- HANDOFF (all in this directory): this prereg (finalized), the C3d fix
  design (`journey-social-life-r231-c3d-fix.md` — helper
  `convoRecapLiveLine` + empty-log branch change, both fully written),
  the proof test (`test-journey-social-life-r231-c3d-recap-live-20261116.js`
  — 6 cases, godpath-lib pattern, def via seed+select on a donor; UNRUN,
  never executed on base or fix), and the run-note skeleton
  (`journey-social-life-r231-run-note-SKELETON.md`). Next run: register,
  ff-merge, copy the proof test into scripts/, run it on BASE first
  (cases 1–2 should fail, 3–6 pass), apply the fix, re-run (all pass),
  then clone the r226 driver/analyzer and run the panel.

## Adoption addendum (22:00 CST occurrence, run_id loop2-20261117T035603Z)

This run ADOPTS the r231 draft prereg written by the 21:00 CST occurrence
(run_id loop2-20261117T025541Z), which was BLOCKED on the worktree cap
(16/16 active) and closed out without playing, fixing, or committing
anything. The draft's leg question, fix arm, metrics, seeds, and tooling
stand unchanged; this addendum records only what moved between the draft
and this run's start.

- REGISTRATION QUEUED ON THE REGISTRY LOCK: first attempt (~03:57Z)
  killed by a 110s timeout while blocked on `flock` in
  worktree-register.sh — Lane A's `journey-deepening` register (pid
  13910, started 03:46Z) holds the lock, with the reaper cron's
  self-contention in the background (known; fix owed, needs Steve nod).
  Retry launched 04:04Z in the background with a 1200s timeout, queued
  on the same flock. No worktree dir, no registry entry from the killed
  attempt — but branch `journey2-sociallife` EXISTS, pointing at
  96d7d1d8b (master at 03:00Z, when the 21:00 run's attempt ran). The
  register script uses `git worktree add -f`, so the existing branch is
  handled; after registration the worktree branch is fast-forwarded to
  origin/master inside the worktree (`git merge --ff-only origin/master`)
  before any work — no git writes in the main tree.
- BASE MOVEMENT SINCE THE DRAFT (5d5293972 → 2ac3052b0, 6 commits):
  only conversation-relevant change is Lane A establishment r230
  b9300b938 [needs-eyes] (convo-dialogue.js + convo-wants.js):
  dlg:help offered for stage-0 ask_favor wants with a live need (menu
  never offered the ask). Adjacent to the C3d area (wants/stage-0) but
  does not touch convoRecapLine; the C3d fix shape stands. The rest of
  the movement is sim-vetreengage-confirm-a (scripts + evidence only,
  32 files, 0 src/js changes).
- BASE FOR THIS RUN: 2ac3052b0 (master at registration; the worktree
  branch was created at 96d7d1d8b by the 21:00 run's attempt and is
  fast-forwarded to origin/master inside the worktree before any work).
  Registration retry: first attempt killed by a 1200s timeout inside
  `git worktree add` (checkout >12 min under load, orphaned git cleaned
  up the partial dir); retry launched 04:28Z with a 1500s timeout.
- SEED-BAND FRESHNESS: re-verified at this run's start:
  `git grep -l -E "45705|45706|45707|45708" -- 'evidence/*/*prereg.md'`
  → 0 hits (prereg-only check, the binding reservation record). The
  draft's check (2026-11-17 ~03:03Z, 0 hits in all 946 sim preregs)
  stands. A full-tree recursive grep was started and killed as too slow
  (multi-GB evidence tree); the prereg-only grep + the draft's full
  check together establish freshness.
- ROTATION: file reads 5 at run start (r230 endgame adoption closed
  4→5 at ~20:25 CST). This run plays 5 and writes 6 at closeout.

Leg 5 (social life). Run number r231 follows r230 (Lane B endgame
adoption, landed 2026-11-16; Lane A establishment also r230 — run-number
collision convention stands: files differ by leg prefix). Seeds
45705–45708 (fresh band, checked below), DAY CAP 140, policy journey.
Driver scripts/journey-social-life-r231-20261116.js, analyzer
scripts/analyze-journey-social-r231-20261116.js, helpers
scripts/journey-social-r231-helpers.js — all r226 verbatim except
seeds/OUTDIR/filenames/mode label, PLUS the B5/B6 analyzer revisions
below (both driver-side, read-only; determinism proof required before
judging).

## Leg question (carried from r226 + r229 metric reviews)

Does social life hold up across a full run — invitations sometimes
taken, bonds proposed and answered by character, moots firing,
conversations reading as people, wants surviving across sittings without
drying into the "...lost my train of thought." dead line — and do the
r226 F6 fix and the r229 C3d fix hold in the wild?

## Fix arm (pre-planned): C3d — recap-empty pool erases live threads

- **Defect (r229, second sighting; first was 14461 d31):** seed 34312
  d+53 Onni (trust 90): recap "Wait — what were we talking about?"
  answered "We were just talking. Nothing important." while a LIVE favor
  ask (the creek-water run, stated in the opener, requirements just
  discussed) plus a party naming ("The Company") and a role assignment
  (Onni → Scout) were on the table.
- **Mechanism (traced r229):** `convoRecapLine` (`src/js/conversation.js`
  ~2385) reads `c.threadLog` filtered to threads other than 'small' /
  'nonverbal'. The log was EMPTY — stated-but-unengaged wants and
  structural beats (party naming, roles) plant no thread, so the
  empty-log branch serves the recap-empty pool (4 variants via
  `convoPickCycle` 'recapempty').
- **Fix shape:** in the empty-log branch, check the sitting's live want /
  open favor / unanswered question FIRST and name it (e.g. "We were
  talking about that creek water run"); serve the empty pool only when
  nothing is open. The line is drawn at live, unfinished threads: the
  Ruth non-sighting (33998 d+3, all beats CLOSED) must keep serving the
  pool. State to consult on `c`: `c.want` (live want + def; see F6's
  `c.want.def.staleOpener` / `convoWantStaleOpener` precedent), pendingQ,
  open favor. A proof test in the r226 F6 class (real sittings + real
  sayLine ledger) must discriminate: staged live favor + empty
  threadLog → recap names the favor on fix, serves the pool on base.
- **Also filed, not fixed here:** repay.engageBeat broken/open pools
  (same class as F6, unobserved); all-3-blocked F5 residual (r226).
- **Guards to preserve:** the repeat / hammer guards below the pool
  (`_recapSaid` / press-cap logic, conversation.js ~2410+) — the
  live-thread line still flows through them.

## Metrics (binding)

- **C3d PROOF:** proof test green on fix, red on base (discriminator
  assertions: live-favor recap names the favor; closed-threads recap
  still serves the pool).
- **F6 WILD HOLD:** dry-line count on the fresh panel (r226: 21 drops
  pre-fix, 0 on worst-seed confirm). Bar: 0 dry servings panel-wide.
- **M1–M12:** same bars as r226 (see journey-social-life-r226.md).
- **B5 instrumentation (new, from r226 metric review):** per-funeral
  partial-vs-full split (r226 had totals only).
- **B6 instrumentation (new, from r226 metric review):** want-resolution
  rows in the panel JSONs so the direct stage-3-'deflected'-from-stage-0
  count is measurable (r226: no rows, 20/21 next-sitting resurface proxy
  only).
- **F5 WILD CHECK:** settled-favor variant servings in the wild (r226 B1
  GO: 2/3/3 = 8 servings — first real read; r225/r229/r230 vacuous on
  other legs). If vacuous again on the social leg, the targeted harness
  from the r229 metric review is owed.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r195/r200/r206/r215/r220/r226 (M1–M12). FIRST panel with the r226 F6
dry-opener fix AND the r231 C3d fix native in the base (panel runs on
the FIXED code — the fixes land before the panel, per the r228
precedent of running the panel on fixed code and judging the wild
hold directly).
(B) NEW-BASE READS (watches): F5 settled-favor variants in the wild;
F6 dry-line hold (0); F1 drift-note quote (0 resume openers quoting a
drift-note stage direction); F3 commit-refusal-as-memory (watch, not a
fail); B5 funeral-mend voice with the per-funeral split; B6 stage-0
is-not-live (no stage-3 'deflected' close from a stage-0 want).
(C) WATCH TALLIES (carried, read-only): re-offer max, dropped threads
(next-sitting resurface + whether resurfaces name the LIVE favor and
engage the re-posed question), NARR scan, react shape, scattering
capture, player-side greeting repetition; VENDETTA trend only (bar
retired); M1 hot-accomplice pattern; HEED warn_you engagements; M2
combined-proposal bar (design-look at >= 20); MOOTS (investigate the
trigger only if 0 fire across the 4 fresh villages).
(D) NOT THIS RUN: r171 M2b scholar-open proof; measurement-proof
refresh; courtship-rework-b BFS fix (owned by the courtship follow-up
arm).
(E) STRETCH (only after panel + gate are green): telemetry baseline
re-seed with a metric mapping for the current social schema (deferred
since r206 — the social.json baseline carries only stale-era l3.* keys
the driver never emits). If time does not permit, it stays deferred
with the LOUD lines re-explained, not rolled.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 45705–45708. Backup band 45901–45904.
- Draft check (2026-11-17 ~03:03Z): grep over all 946
  `evidence/*/sim-*-prereg.md` files for `45705|45706|45707|45708` →
  0 hits. Grep over `evidence/2026-11-*/` → only incidental numeric
  substrings inside telemetry JSON dumps (floats, not seeds). No prereg,
  forbidden list, contaminated list, screen, or extension band names
  45705–45708 as a seed band. Band FRESH.
- Re-verification at this run's start (2026-11-17 ~04:06Z):
  `git grep -l -E "45705|45706|45707|45708" -- 'evidence/*/*prereg.md'`
  → 0 hits. Band FRESH.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226).

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r226-20261116.js` →
  `...-r231-...`
- Analyzer: `scripts/analyze-journey-social-r226-20261116.js` →
  `...-r231-...`
- Helpers: `scripts/journey-social-r226-helpers.js` (reuse or clone as
  r226 did)
- Proof test pattern: `scripts/test-journey-social-life-r226-f6-dry-opener-20261116.js`
  (godpath-lib pattern, real sittings + real sayLine ledger, poison via
  ANOTHER villager's sitting; base-vs-fix via stash with explicit refs)

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (read 2026-11-17 by the
  blocked r231 run; no canon gap for the C3d area — recap contract
  lives in CONVERSATIONS.md "Structural contract" + conversation.js
  header comments).
- C3d site re-read 2026-11-17: `convoRecapLine` at
  `src/js/conversation.js` ~2382–2480 (master 5d5293972). Recap-empty
  pool at ~2395–2408; repeat / hammer guards below it must be
  preserved by the fix (the live-thread line still flows through the
  `_recapSaid` / press-cap logic).

## Gate / closeout (standard)

- Proof test + `node scripts/check.js --quick` (use
  `--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r226 gate note; standalone re-run any
  timeout before attributing). Commit via safe-commit.sh in the worktree,
  ff-merge in main tree, release tree, rotation-b 5 → 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r226 noted the
  social baselines carry known schema-drift LOUD lines — do not roll the
  baseline over them without adjudication).
