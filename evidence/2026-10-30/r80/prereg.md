# Journey social r80 — PRE-REGISTRATION (lane B, 2026-10-30)

Leg 5 (social life). Base: master at run start (52df7e732 at worktree
registration). Rotation-b read 5 at run start -> 6 at closeout.
Driver: scripts/journey-social-r80-20261030.js (r75 driver verbatim
except seeds, evidence dir, and the moot census below; zero game
behavior change in the driver itself). Wedge: r75 outing wedge
verbatim. Zero src/js changes planned; any fix follows a failed
binding with its own proof test first.

## Question (r75's named-next #4, escalated from watch item)

Moots read 0 on all 12 seeds across r73+r74+r75 — but the driver's
mootsConvened reads `(Game.state.village || {}).moots`, and no
src/js code ever writes a `village.moots` array (verified by grep
before this prereg: no `moots.push` / `.moots =` in src/js; the
moot record lives in betrayalState: cases + mootConveneCounts +
c.trial). Is a moot convenable at all in natural full runs, and
does the old "0 moots" number mean anything?

## Instrument (new, driver-only)

Per seed, the driver records a moot census:
- SAY-LINES: Game.say wrapped (recording only); convening lines
  counted by pattern: npcMootTick announcement ("answers for what
  happened to"), callMoot NPC line ("calls the moot"), player line
  ("You call a moot"), System broadcast ("THE MOOT!"). Each hit
  records day + line. The driver never convenes a moot itself, so
  player-convened hits are expected to be 0.
- CASE CENSUS (end of run): every betrayalState case: id, charge,
  day opened, status, accused, target, accuser, mootIn, trial
  (day/verdict) or null, resolution path.
- PLOT CENSUS (end of run): every betrayalState plot: id, day,
  leader, target, active/sprung/expired/resolved.
- COUNTS: mootConveneCounts summed (npc convenings); cases with
  trial set (all convenings); village.moots length (expected 0,
  unwritten — reported, never scored).
- DAILY COUNTS (cheap, no RNG): each day, plots armed-total,
  cases open-count, cases-with-trial count — so a mid-run stall
  still decomposes.

## Bindings (a miss is NO-GO, never re-scored)

- B1 INSTRUMENT-TRUTH: the three convening counts must reconcile:
  say-line convenings == npc convenings (mootConveneCounts sum) +
  player convenings (say-line "You call a moot" hits, expected 0);
  cases-with-trial == say-line convenings (every convening sets
  c.trial via conductTrial). A mismatch is an instrument bug to
  fix and re-run, not a finding.
- B2 REACHABLE: moots convene in natural play iff >= 1 NPC moot
  convenes on >= 2/4 seeds. If B2 passes, the r73-r75 "0 moots"
  watch item closes as an instrument artifact (wrong field), and
  the real convening rate is reported.
- B3 DECOMPOSITION (report, scored only if B2 fails): if 0
  convenings, the dominant break stage is named from the census:
  plots armed? plots sprung? cases opened? cases ripened past
  mootIn? convenings blocked at which npcMootTick guard
  (player-accused skip, player-target skip, no living caller,
  mootIn not reached)? No stage may be claimed without its count.
- B4 PEOPLE: 5 sense reads, full transcripts, >= 2 moot/justice
  related IF any moot occurs on any seed, else 5 general social
  reads; 0 fabricated-history flags, 0 weak endings.
- B5 GUARDRAILS (report-only): dryRate pooled in [0.20, 0.40];
  invitation rates reported (party/lure); outing funnel reported
  (r75 carry, not judged here).
- B6 NO-REGRESSION: check.js --quick in the worktree matches the
  r75 baseline 284 passed / 6 failed (same six pre-existing
  failures, adjudicated by name). Only if src/js changes; if this
  run stays instrument-only, --quick is still run and reported.

## Panel

Pilot first: smoke seed 6605 (30d) must PASS (driver aborts on
smoke FAIL, exit 3), then seed 6601 full 140d — instrument check
(moot census fields populate, say-wrap records, no crash) before
6602-6604 run. Full seeds: 6601-6604, DAYCAP=140, death-aware,
competent policy, all linger, seeded-speaker steering ON (r75
verbatim).

## Interesting-finding bar

- A convening rate > 0 with the old field still 0 closes the
  watch item and retires village.moots as a metric.
- A 0-convening panel with cases opened but never ripened (or
  plots armed but never sprung) is a reachability finding with
  a named stage — fix-or-document, not another census run.
- A 0-convening panel with 0 plots armed repeats the r27 gap in
  a new regime (motive threshold / accomplice / beloved-gate
  interaction) and is a design finding, not an instrument one.

## Metric review (carried)

- village.moots is NOT a metric after this run either way: it is
  unwritten by the game. Future runs count convenings from
  mootConveneCounts + cases-with-trial + say-lines.
- The r75 metric-review items (post-ending starts, partner-away
  dawn wall, walk/retry promotion, lure dip) are NOT this run's
  questions; they stay open for their own runs.
