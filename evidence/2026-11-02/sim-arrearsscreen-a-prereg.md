# sim-arrearsscreen-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0725Z, arm sim-arrearsscreen-a, axis scale-onramp.
Worktree branch: sim-arrearsscreen-a. POLICY/INSTRUMENT-SIDE ONLY — zero
`src/js` changes, no gates, stages, deed bars, quota, need, or win prices
touched. No [needs-eyes] (screening measurement only, nothing
player-facing ships).

## Canon read

docs/CANON.md first, then docs/SCALE.md (scale ladder; BELONG bar is
trust >= 50, arrears 0, link age >= 14 days) and docs/SCALE-DISCOVERY.md
(no titan/herald/arrears content found in it). There is NO
titan-specific canon doc in docs/ — stated here instead of inventing
one (same finding as the 0445Z and 0605Z rounds). The in-code design
source is `src/js/titans.js` (`Game.titanCallReadiness`, deployed
2026-11-02, sim-sumdeploy-a) plus `src/js/hierarchy.js` (linkTick /
payTribute / primacy flip / break-relink, per the sim-arrears-a code
audit: only `payTribute` on Haven-subordinate links and the
`bidForPrimacy` flip ever zero arrears; the Haven-primary weekly
branch never does).

## Question (tracker blank 1, from the 0605Z round)

The 0605Z round left two combined facts: (a) Haven-primary old debt
NEVER clears (107 blocked link-days, zero decreases, no back-payment
verb — evidence/2026-11-02/sim-arrears-a.md), and (b) the waiting
pilot could not run because fresh bands yield 0 arrears-blocked
seeds (0/16, arrears 0 on all 168 readiness rows —
evidence/2026-11-02/sim-arrears-route-a.md). This arm builds the
SCREENED band the waiting pilot needs: find seeds where the block
actually exists, so a waiting pilot becomes testable. It does NOT
re-litigate (a) and does NOT run a waiting policy — the waiting
observation leg below is measurement on the screened seeds only,
and only if the screen yields enough blocked seeds.

## Seeds (fresh band, verified unspent BEFORE this prereg)

Screening band (24): 97301, 97302, 97303, 97304, 97305, 97306, 97307,
97308, 97309, 97310, 97311, 97312, 97313, 97314, 97315, 97316, 97317,
97318, 97319, 97320, 97321, 97322, 97323, 97324.
Fresh-band verification, done before this prereg was committed, by
the arrears-route band-check method: no `*9730*`/`*9731*`/`*9732*`
seed filename under evidence/ or scripts/ (the `*973*` filename
hits are `s973`/`s8973`/`9973` fragments, not 5-digit seed names);
no 97301–97324 token as a standalone seed mention in any `*.md`
evidence file or any script (word-boundary `git grep` clean) and
no hit in any `SEEDS=` list; no live claim file names the band
(lever-claims grep clean). The single substring hit anywhere is
the commit-hash fragment `3a97301eb` inside
evidence/2026-10-31/sim-food-economy-round-0537-a.md — a hash, not
a seed assignment, documented here per the route arm's precedent
(hash-named panel case file accepted as non-assignment). The
954xx confirm band and the 971xx/972xx pilot bands are NOT reused.

## Policy stack (frozen from quotatrigger/sumtrigger/sumconfirm/route)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) + `muster-diag` recorders. Env:
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. DAYS=180 death-aware cap (same
rationale as sumtrigger/route: 150–200d reachability band; herald
contact ran ~day 70–115 in prior bands; a cap, not a target — dead
villages stop simulating). NO call is ever sounded in the screen
runs: sounding charges every refusing link −8 trust and would
corrupt the waiting observation (the arrears-a lesson). The screen
is observation only.

## Instrument (new, screening-only)

`scripts/arrearsscreen-replay-20261102.js` (stdout runner, same
pattern as sumtrigger/route: prints one JSON line per seed, writes
nothing itself; `scripts/arrearsscreen-split-20261102.js`, idle, no
game load, splits the runner output into per-seed corpus files
under evidence/2026-11-02/perseed-arrearsscreen-a/):
- At EVERY refused herald attempt (herald instrument cls REFUSED,
  same-day muster-diag snapshot required, same strictness as
  sumtrigger/route), the startCombat interceptor computes
  `Game.titanCallReadiness('herald')` (the DEPLOYED faithful rule,
  not a re-implementation) and records one check row: day, per-link
  villageId/name/direction/trust/opinion/arrears/quota/contribution/
  wouldRefuse/faces, alliesProj, havenProj, total, ready,
  generatedNow, errors. Direction comes from the same-day
  `Game.hierarchyState()` link for that villageId
  (primary === 'haven' → Haven-primary; subordinate === 'haven' →
  Haven-subordinate; else peer/other). A refused attempt with no
  same-day snapshot records a skipped row with the reason, never
  a fabricated readiness row.
- Daily census (policy daily hook, read-only link fields, same
  pattern as arrears-trace): every active link's direction, trust,
  opinion, arrears, tribute/week, status, kind. The census NEVER
  calls readiness mid-run (the 0445Z lesson: generation consumes
  seeded RNG) — readiness is called ONLY at refused attempts, the
  route pattern. The screen timeline therefore includes readiness
  calls at refused attempts, exactly as the route pilot's did;
  the waiting trajectories are read off that same timeline, so
  screen and waiting leg are consistent with each other.
- Transcript capture: all `Game.say` lines matching
  arrears|tribute|waiv|debts|REFUSES, per seed, for the sense-test
  read. No forced-sound probe run is pre-registered: the sense
  line comes from the screen run's own tribute/arrears lines
  bearing on a blocked link; if the screen yields zero blocked
  seeds there is NO blocked-link line to quote, and the evidence
  says so rather than quoting a routine line (the route arm's
  `/waits/` capture flaw is not repeated — the capture regex here
  is anchored to arrears/tribute/debt vocabulary).
- Wall fields per seed (same definitions as sumtrigger/route):
  end scale rank, national(end), table, won, maxWave, gameDays,
  endReason, deaths.

`scripts/arrearsscreen-classify-20261102.js` — pure classification
(the replay requires it; the unit test proves it on stubs):
`classifyCheck(row)` returns the arrears-only verdict for one
check row (see Definitions). Validator:
`scripts/test-arrearsscreen-a.js` — reproduces the verdict from
the corpus alone (no game load). Unit proof:
`scripts/test-arrearsscreen-classify.js` — the classifier on stub
readiness objects (arrears-only, mixed trust, mixed opinion,
multi-link, ready, no-refusal).

## Definitions (frozen — judged exactly as written)

- REFUSING LINK (one check row): a link with wouldRefuse true
  (the game's own flag: trust < 25 OR opinion < −10 OR
  arrears > 0).
- ARREARS-ONLY BLOCK (one check row): row.ready is false AND at
  least one refusing link exists AND EVERY refusing link refuses
  SOLELY on arrears, i.e. trust >= 25 AND opinion >= -10 AND
  arrears > 0. A refusing link failing trust or opinion anywhere
  makes the row NOT arrears-only. Non-refusing links are not
  blockers. A not-ready row with no refusing link at all (faces
  shortage, Haven-volunteer shortage) is classified
  `not-ready-other`, never arrears-blocked.
- BLOCKED SEED (primary screen): at least one check row on the
  seed is an arrears-only block. FIRST-BLOCK DAY = the day of the
  seed's first arrears-only check row. First-check classification
  is ALSO reported per seed (arrears-only at the first check row
  or not), so the route pilot's denominator (first check) stays
  visible alongside the any-check screen.
- BLOCKED LINK: a link that is a solely-arrears refuser on the
  seed's first-block row, reported with direction, arrears, trust,
  opinion at first block.
- WAITING TRAJECTORY (per blocked link, from the daily census):
  day-by-day arrears/trust/opinion/status from first-block day
  through first-block + 30 days or run end, whichever sooner
  (stated per seed). "Block ever clears" on census evidence
  means: the link reaches a census day with arrears == 0 AND
  trust >= 25 AND opinion >= -10 (no refusal reason remaining on
  that link). CAVEAT, stated in the evidence: census-clearing is
  necessary but not sufficient for readiness-ready — the faithful
  total also needs >= need (10), which the census alone cannot
  confirm. A census-cleared link is reported as "arrears-cleared
  on census", never as "ready", unless a later check row on the
  same seed shows ready true.
- SEED CLASSES (every seed gets exactly one): `no-herald-attempt`
  (no herald attempt at all), `ready-at-first-check`,
  `arrears-blocked` (any-check), `blocked-other` (checks exist,
  never arrears-only: first-check class + reason named, e.g.
  trust-blocked / opinion-blocked / not-ready-other),
  `no-check` (herald attempts exist but no same-day snapshot, so
  no check row — reported, never silently dropped).

## Screening sweep + waiting observation leg

1. SCREEN: run the recorder over all 24 seeds. Per seed record:
   class, blocked y/n, blocked link(s) with direction, arrears
   amount, trust/opinion at block, first-block day, and wall
   numbers (national/table/wins, wave reach, survival).
2. WAITING LEG, ONLY if >= 3 blocked seeds are found: for each
   blocked link, the census trajectory above (up to 30 days after
   first block or run end, stated per seed): any arrears decrease
   y/n + amount, trust trajectory, whether the block ever clears
   (census definition above). The trajectories come from the SAME
   screen runs' censuses — no second run, no re-simulation, so no
   timeline fork.
3. If < 3 blocked seeds are found, DO NOT force a waiting pilot
   on unblocked seeds — the screening yield itself is the verdict:
   reported as UNDER-POWERED for waiting, with the yield as the
   measured fact, not a kill of the arrears finding (the
   sim-arrears-a diagnosis stands on its own band).

## PRIMARY METRIC

Screening yield: blocked seeds / 24, with per-link direction
breakdown — plus, when the waiting leg runs, per-link arrears
trajectories over the 30-day-or-run-end window.

## GO (all must hold; a miss on (a)/(b) is NO-GO, never re-scored)

(a) SWEEP COMPLETE: recorder rows (check rows or a named
    no-check/no-attempt class) on >= 22/24 seeds.
(b) CLASSIFICATION COMPLETE: every blocked seed classified by
    link direction with arrears/trust/opinion numbers at first
    block; every non-blocked seed given its seed class with the
    reason named (no silent nulls — the route arm's metric-review
    lesson).
(c) WAITING LEG: if >= 3 blocked seeds, the waiting leg
    completes with a per-link arrears trajectory (decrease y/n +
    amount, trust trajectory, clears y/n on the census
    definition). If < 3 blocked, (c) is VACUOUS and must be
    reported as vacuous, never cited as a pass.
(d) PROOF GREEN: unit test (classifier stubs) + corpus validator
    green; syntax checks on all new scripts.
(e) ZERO src/js changes (verified by `git diff --name-only`
    against the branch base at evidence time).
(f) WALL NUMBERS reported for the band (national/table/wins,
    wave-4/wave-5 reach, median/max survival, endReason mix),
    never pooled with any other band.

A miss on any bar is NO-GO (or under-powered for waiting when
the screen yields < 3 blocked), never re-scored against a
friendlier metric mid-run (MEASUREMENT §14). Doubts go under
"metric review" in the evidence file and apply to the NEXT run.

## SENSE-TEST

At least 1 real transcript line bearing on a blocked link, read
and judged for meaning (SENSE-TESTING LAW — not just counts):
does it name the debt honestly and read humanly? If zero blocked
seeds, the sense-test is VACUOUS (stated, not faked with a
routine line).

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is
a trigger-moment census + screen, not a sweep-compare policy run
— same declaration class as quotatrigger / muster3 / sumtrigger /
sumconfirm / arrears-route. There is no before/after lever here
to panel; the screen is measured directly on identical-stack runs
with wall metrics reported per band, NEVER pooled. No panel
fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
median / max survival (gameDays), endReason mix, death-cause
shares (from the per-seed deaths arrays).

## OUT OF SCOPE (task bounds)

No game-code change. No tribute/arrears rule change, no new
tribute-payment verb, no waiting policy built or sounded (the
waiting leg observes; it does not intervene). No gate/stage/
deed-bar/win-price retunes. No sibling trees or branches touched
(Loop B live on sim-jumpfaithful-b, sim-stayhome-b — NOT
touched). No hidden_files (tracker/claims/findings/locks —
coordinator-owned). No push, no bump, no live verification —
report "ready for coordinator merge, pending ship"; the
coordinator merges.

## METRIC REVIEW (to be filled at end of run)

(Blank until the evidence file is written.)
