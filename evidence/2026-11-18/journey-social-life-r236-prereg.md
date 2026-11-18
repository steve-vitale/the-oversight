# Journey social life r236 — PRE-REGISTRATION (Lane B, 2026-11-18)

## Run

- Lane B occurrence 04:00 CST Nov 18, 2026 (run_id `2026-11-18T09:55:45Z`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout (written at run start with read-back: file now reads 6).
- Base at registration: `5fac3cb71` (master; worktree branch `journey2-5`, clean at start).
- Leg 5 (social life). Run number r236 follows r235 (Lane B social, landed 2026-11-17, DRY3 fix `9d5a45fcc`; r234 DRY2 `39eaa043e` also in master).
- **ADOPTION NOTE:** r235's adoption completed (panel, analyzer, telemetry, gate, ff-merge, tree released, branch deleted — verified: `journey2-social` tree and branch both gone, both commits ancestors of master). No held work to adopt. The r234 adoption's pending items are closed.

## Registration (infrastructure)

- Overlap guard: no lock file at run start. Lock created with run_id `2026-11-18T09:55:45Z`.
- Pre-flight: main tree clean, disk 48%. Reaper ran (12/16 active, no journey2-social tree existed).
- Registration took ~11.5 min (foreground exec; `git worktree add` + `git reset --hard` on the 6.9G tree is slow — the reset child ran ~9 min at 18% CPU; not a hang).
- First heartbeat 10:07Z (after registration); re-heartbeat before each major phase (proof, each panel seed, gate, landing). No background heartbeat loop (the runtime reaps long-lived backgrounded exec sessions — r234/r235 precedent). The tree is dirty once work starts, and the reaper never auto-removes dirty trees — second line of defense, not a substitute.

## Leg question (carried from r226 + r229 + r231 + r234 + r235)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, the r234 DRY2 fix, and the r235 DRY3 fix hold in the wild, with
the r236 TRAILTALK fix closing the 2-line trail-talk loop?

## Fix arm: TRAILTALK — the trail-talk pool is 2 lines deep (r234/r235 finding)

The r234 people check found it, r235 confirmed it: during a joint forage
outing the driver (and a real player mashing "Talk on the trail for a
while") hears the same two lines verbatim, alternating — line A
("Two pairs of eyes, twice the ground. That was the deal, and it is
working.") 12x on r235 seed 45720, line B ("Onward — there is more green
ahead.") 12x on the same seed; no other seed exercised trail talk at all.

Mechanism, traced this run from code (not counts):

- `talkLine` (`src/js/favor-forage.js` ~60-80) holds one 2-line pool per
  temperament (bold / warm / cautious / default fallback) and selects
  `pool[n % pool.length]` where n is the outing's talkCount — a
  deterministic 2-cycle.
- The line is spoken through `sayLine(vid, result.line,
  { diegeticAct: true })` (`src/js/convo-dialogue.js` ~281-293), and
  `diegeticAct` exempts it from BOTH no-repeat ledgers
  (`src/js/conversation.js` sayLine, r25 comment) — so the ledger that
  catches every other repeat cannot catch this one. The fix must live
  in the pool/selection itself, not in sayLine.
- The other two "Two pairs of eyes" strings in favor-forage.js (the
  meet-day block line :146 and the departure line :192) are NOT part of
  this loop — they fire once per outing, not per talk press. Untouched.

**Fix** (`src/js/favor-forage.js`, `talkLine` only):

1. Widen every pool 2 → 6 lines. The two existing lines stay first, in
   order, so the first two presses of any outing are byte-identical to
   today. New lines use only live state already in scope (partner first
   name, haul kcal totals, talk/forage counts) or plain trail flavor —
   no fabricated shared history, no named plants, no claims about
   unseen things.
2. Selection becomes no-repeat-until-exhausted within one outing:
   `r.talkUsed` (array of pool indices spoken on THIS outing, persisted
   on the forageRun) — each press takes the first unused pool index;
   the set resets only when the pool is exhausted. Deterministic, no
   RNG, no new state outside the run object.

**NOT this arm:** the F5 targeted harness (owed since r231 — stretch
only); the M4 split (metric-review proposal, needs its own prereg
line); the sayLine choke-point guard (filed r235, needs its own
prereg); repay.engageBeat broken/open pools; all-3-blocked F5 residual
(r226). The diegeticAct exemption itself is NOT removed — trail talk
is a diegetic act by design (r25); widening the pool is the fix, not
re-ledgering the act.

## Proof test

`scripts/test-journey-social-life-r236-trailtk-20261118.js` (godpath-lib
pattern, real outing staged the test-joint-outing way: real favour,
real start, real joint forage, then talk presses through the public
`performForageTalk`). Run with SEED=42 and SEED=7 (two processes).

Discriminators (each: fails on base, passes on fix):

1. First 6 talk presses on one outing are all distinct lines.
2. 12 presses: max recurrence of any single line ≤ 2, distinct lines = 6
   (the pool size). On base: distinct = 2, max recurrence = 6.
3. Press 7 repeats press 1 (pool exhausted → honest reset, then cycles
   in pool order).

Guards (pass on base AND fix): press 1 is one of the four known pool
openers ("Two pairs of eyes…" / "grins. Good ground" / "This is the
part I like" / "Slow. The patch gives more"); press 2 is one of the
four known second lines ("Onward" / "Not bad for two pairs of hands" /
"Tell me what you see" / "Keep together out here"); talkCount
increments per press; kcal-interpolated lines still carry live numbers
when the haul is > 0; the outing still completes (deliver + promise
kept) after the 12 presses. The r235 DRY3 proof test stays green
(`scripts/test-journey-social-life-r235-dry3-20261117.js`).

## Metrics (binding)

- **TRAILTALK PROOF:** proof test green on fix, red on base
  (discriminators only; guards pass on both).
- **TRAIL WILD HOLD:** per-seed JSONs, trail-talk lines counted by
  grep (same method as r234/r235 — the analyzer carries no trail
  counter). Bar, per seed where trail talk fires: max recurrence of
  any single trail-talk line ≤ 4 (r235: 12 on 45720); distinct
  trail-talk lines panel-wide ≥ 6 (r235: 2). Thinness caveat: r235
  exercised trail talk on 1/4 seeds only. If <2 seeds fire it, the
  bar is judged on the seeds where it fires and the thinness is
  recorded, not re-scored.
- **F6 WILD HOLD:** dry-line count on the fresh panel. Bar: 0 dry
  servings panel-wide (r235: first clean panel, 0; r234: 4; r231: 4).
- **M1–M12:** same bars as r234/r235 (see
  evidence/2026-11-17/journey-social-life-r235.md).
- **B5 instrumentation:** per-funeral partial-vs-full split (kept).
- **B6 instrumentation:** want-resolution rows (kept).
- **F5 WILD CHECK:** settled-favor variant servings in the wild
  (r235: 0, fourth thin panel in a row — r231: 1, r234: 3, r235: 0).
  If thin again, the targeted harness stays owed — it is NOT built
  here unless the panel + gate finish with time to spare.
- **WATCH TALLIES (carried, read-only):** re-offer max, dropped
  threads, NARR scan, react shape, scattering capture, player-side
  greeting repetition; M1 hot-accomplice pattern; HEED warn_you
  engagements; M2 combined-proposal bar (design-look at >= 20);
  MOOTS (investigate the trigger only if 0 fire across the 4 fresh
  villages); DRY3 site-1 wild hold (expedition-ask fallback
  collision — unproven in the wild on r235: asked 4x, all teachable).

## Metric review (proposals for the NEXT run, not this one)

- **M4 split:** r235's near-dup count (212) is still dominated by
  instructional lines (Haven-door cluster + live-want re-asks + teach
  templates). Split M4 into instructional vs conversational dups next
  run; the current count punishes the game for re-explaining a
  mechanic. Not implemented here (analyzer change + bar change needs
  its own prereg line).
- **F6 bar:** MET for the first time on r235 (0 dry). If r236 stays
  at 0 with no new sites, the per-site patch program is done and the
  sayLine choke-point question closes as "sites were the whole
  story" — unless a new site appears, in which case the choke-point
  becomes the arm.
- **TRAIL bar thinness:** if trail talk fires on <2 seeds again,
  the panel bar cannot carry the verdict alone — the proof test is
  the binding instrument and the panel is the wild check. A driver
  change that seeks outings deliberately (like the r149 counter-settle
  experiment) is a next-run proposal, not this run's scope.

## Seed-band freshness (local_seed_band_freshness)

Chosen band **45725–45728**. Backup band **45729–45732**.
- Check (2026-11-18 ~10:15Z): `git grep -l -E "45725|45726|45727|45728"
  -- 'evidence/*/*prereg.md'` → 0 hits. Backup
  `45729|45730|45731|45732` → 0 hits. Band FRESH.
- Prior social bands: 44901–44904 (r220), 45701–45704 (r226),
  45705–45708 (r231), 45709–45712 (r234), 45717–45720 (r235).
  r235's named backup 45721–45724 is RESERVED (named = used) and is
  NOT used here.
- No r236 social prereg existed before this file (checked
  `evidence/2026-11-18/` + `git grep journey-social-life-r236`).

## Tooling to clone (in the worktree, before the panel)

- Driver: `scripts/journey-social-life-r235-20261117.js` →
  `scripts/journey-social-life-r236-20261118.js` (seeds 45725–45728,
  OUTDIR evidence/2026-11-18, filenames r236; everything else
  verbatim).
- Analyzer: `scripts/analyze-journey-social-r235-20261117.js` →
  `scripts/analyze-journey-social-r236-20261118.js` (reads r236 JSONs).
- Helpers: `scripts/journey-social-r226-helpers.js` (reuse, no clone).
- Proof test pattern: `scripts/test-joint-outing-20261027.js`
  (outing staging) + `scripts/test-journey-social-life-r235-dry3-20261117.js`
  (godpath-lib proof shape).

## Canon read for this leg

- `docs/CANON.md` + `docs/CONVERSATIONS.md` (read 2026-11-18 by this
  run; no canon gap for the trail-talk area — the no-repeat invariant
  and the dry-line contract live in conversation.js header comments +
  CONVERSATIONS.md; the diegeticAct exemption is documented in
  sayLine, r25).
- Trail-talk mechanism re-traced 2026-11-18 from the r235 panel JSONs
  (evidence/2026-11-17/journey-social-life-r235-45720.json: line A
  12x + line B 12x, all other seeds 0) and the code at master
  `5fac3cb71` (talkLine favor-forage.js:60-80, forage_talk handler
  convo-dialogue.js:281-293, sayLine conversation.js:946-1170).

## Jobs this run

(A) TRAILTALK FIX + PROOF: widened pools + no-repeat-until-exhausted
    selection, proof test green on fix / red on base (discriminators
    only), DRY3 proof stays green.
(B) CONTINUITY PANEL: the leg-5 panel on fresh seeds 45725–45728,
    same metrics as r235 (M1–M12, B5 split, B6 rows). FIRST panel with
    the DRY2 fix, the DRY3 fix, AND the TRAILTALK fix native in the
    base (panel runs on the FIXED code — fixes land before the panel,
    per the r228 precedent; the wild hold is judged directly).
(C) NEW-BASE READS (watches): F5 settled-favor variants in the wild;
    F6 dry-line hold (0); B5 funeral-mend voice with the per-funeral
    split; B6 stage-0 is-not-live; trail-talk depth; M4 instructional
    cluster; DRY3 site-1 wild hold.
(D) NOT THIS RUN: F5 targeted harness (stretch only); M4 split
    (proposal); sayLine choke-point guard (filed, needs its own
    prereg); trail-talk driver seeking (proposal); repay.engageBeat
    pools; all-3-blocked F5 residual (r226).
(E) STRETCH (only after panel + gate are green): F5 targeted harness
    from the r229 metric review (owed — four thin panels in a row).
    If time does not permit, it stays owed with the LOUD lines
    re-explained, not rolled.

## Gate / closeout (standard)

- Proof test + `node scripts/check.js --quick` (use
  `--cacheDirectory=/tmp/jest-cache-playtest2`; expect the standing
  load-artifact/timeout set — see r235 gate note; standalone re-run
  any timeout before attributing). Commit via safe-commit.sh in the
  worktree, ff-merge in main tree, release tree, rotation-b already
  5 → 6, delete lock.
- Telemetry: `telemetry-check.js` vs the social baseline (r235 noted
  the social baselines carry known schema-drift LOUD lines — do not
  roll the baseline over them without adjudication).
