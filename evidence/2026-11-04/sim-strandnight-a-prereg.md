# sim-strandnight-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261105T0115Z, arm
sim-strandnight-a, axis food-economy. Worktree
sim-strandnight-a, base c28f447de (master has since moved one
evidence-only commit to bd32597b8 — do NOT rebase unless the
coordinator asks). Measurement on current master; NO game-code
change is planned in Phase 1, NO policy-default flip, NO edit
to any existing policy file. Sibling trees never touched
(especially sim-upkeepbf52-a and any Loop B tree); main tree
never touched; never touch
~/workspace/goals/.../hidden_files (the coordinator owns the
backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Blank and why this run exists

Open sim-finding from Loop A arm sim-bankretain-substrate-a
(run fleshout-20261104T2230Z, evidence/2026-11-04/
sim-bankretain-substrate-a.md §Out-of-scope findings):
"STRANDED NIGHT ITSELF HAS NO LINE ON NO-GATHER-TARGET FLIPS"
— seed 17021 loop-days 51–53, a thicket strand where the
evening flip takes 0 actions (skip reason 'no-gather-target')
— the day record says nothing about bedding down or the
carried food; the day record just ends (voice-only). This arm
is the named next blank for a stranded-narration arm.

## Canon read first

docs/CANON.md, docs/MAP.md (travel / way home / stranded
positions), docs/TIME-ECONOMY.md (day parts, sleep). NO canon
doc covers "stranded-night narration" as a named rule — stated
plainly instead of inventing one, as in the prior strand arms.
One engine fact matters and is NOT invented: Game.sleep()
already speaks a bedding-down line when sleep actually happens
("You settle into <place>. Sleep takes you.", plus a
"Sleeping rough means ..." warning away from Haven) and a dawn
wake line that can carry "You spent the night out here, away
from Haven". Whether those lines reach a stranded 0-action
night is exactly what this census measures — it is not assumed.

## Pre-prereg substrate probe (disclosed, NOT judged evidence)

Before writing this prereg, a throwaway probe (deleted, never
committed) ran seed 17021 on the same policy stack with a
sleep-phase say capture. It showed, for loop-days 51, 52, 53
alike: sleep-phase lines exist and include BOTH "Sleeping
rough means the cold ground — heal ~16." AND "You settle into
the cold ground. Sleep takes you." The prior arm's corpus
records only daily-phase lines (its day record is built from
lines spoken inside daily()), so sleep-phase lines fall
outside its day record by construction. This probe motivates
the dual-channel census below; it does NOT pre-judge the band
— other seeds/nights may refuse sleep, be interrupted, or
sleep elsewhere, and only the band census decides the verdict.

## Census instrument (new, committed with this prereg)

- scripts/strandnight-trace-a.js: a bankfood-trace-b.js
  adaptation with ONLY these changes: (a) every Game.say line
  is captured with its loop-day segment and phase (daily |
  sleep | postdaily | postsleep), Game.sleep wrapped to mark
  the sleep phase; (b) after runDays, each evening row gains
  daySayFull (full daily-phase lines, bankfood-evening days
  only), nightSay (sleep-phase lines for that loop-day), and
  sleepFired. The driver records, never judges. EPERM-safe
  write transport reused from the bankfood driver (write +
  readback verify).
- scripts/analyze-strandnight-a.js: pure analyzer (stdout
  only, never writes into the repo). It reads strandnight
  corpora and extracts DISTINCT 0-action stranded nights.
- scripts/test-strandnight-a.js: pure proof, 15/15 GREEN
  before any judged sim (see §Instruments). One test-design
  note, disclosed: the corpus tests use analyzeCorpora
  (parsed objects, no disk) rather than analyzeDir, because
  fixture writes into a fresh /tmp dir failed deterministically
  with EPERM (0-byte file, write denied) across 6 runs in this
  worktree's process while identical inline writes passed —
  the Nov 4 evening write flap. analyzeDir is a thin loader
  over analyzeCorpora and is exercised by the real census run.

## Night definition (binding)

A DISTINCT stranded night is a bankfood evening record with:
mode 'flip', skip 'no-gather-target', actions.length == 0,
AND clockAfter == clockBefore AND kcalAfter == kcalBefore.
A record meeting the first three but moving clock/kcal is an
ANOMALY: excluded from the count and listed separately.
Stranded is by construction: bankfood evening records fire
only on stranded-away evenings (strandedEveningDecision).
Count DISTINCT nights (seed + loopDay), never leg-instances.
Single leg only: guard-variant (BANKFOOD=1, WOODWARM=0) —
no OFF leg is owed in Phase 1 because no game or policy
change is being measured; the guard-variant corpus IS the
measurement. If Phase 2 lands a hook, its proof uses matched
seeds with bit-identical trajectories (see Phase 2).

## Bedding-down line definition (binding)

BEDDING_RE (analyzer + proof test, identical):
/you settle into|sleeping rough|bed down|beds down|make camp|camp wild|spend the night/i
A night CARRIES a bedding-down line iff BEDDING_RE matches
any line in the FULL night transcript for that loop-day:
daily-phase lines (row.daySayFull, falling back to
row.eveningSayTail) OR sleep-phase lines (row.nightSay).
Tallies reported separately: carrying (full transcript,
PRIMARY), carrying-daily-only, carrying-sleep-only.
The dawn wake line is NOT a bedding-down line: a line matching
/spent the night out here/i is reported separately as
nightOut, never counted as bedding. The morning meal / carried
food mention is out of scope here (separate filed blank:
silent upkeep breakfast) and is NOT counted either way.

## Primary metric (binding)

Number of DISTINCT 0-action stranded nights observed in the
screened band, and how many of them carry a bedding-down line
in the full night transcript.

GO bar for the hook (Phase 2): >= 3 distinct 0-action
stranded nights observed AND 0 of them carrying a
bedding-down line.
- GO: land the minimal hook in Phase 2 (below).
- NO-GO: >= 3 distinct nights AND >= 1 carrying a
  bedding-down line. The blank is an artifact of the
  single-seed / daily-slice sample; document the lines found
  and land NO hook. (Per §14a this is not CONCEPT-DEAD: no
  mechanism was staged and failed; it is a measurement
  correction of the finding itself.)
- INSUFFICIENT-DATA: < 3 distinct nights after the full band
  below. Land NO hook, report it, propose the wider screen
  (seeds 17041+ in seed order, same leg) for a follow-up arm.
  Do NOT lower the bar.

## Screen design (the pilot for the hook decision)

Screen the strand-screened band seeds 17001–17040 (the
substrate arm's band; re-screened with the new instrument
rather than assuming its corpus, since the old corpus has no
sleep-phase lines), guard-variant leg only, 60d, in blocks of
8 in seed order (17001–17008, 17009–17016, 17017–17024,
17025–17032, 17033–17040). The screen IS the pilot for this
rare phenomenon: a first-block-only pilot would be
substrate-inadequate (the substrate arm found 0 judged events
in 17001–17008 and its pool only appeared in later blocks).
No early stop: the full 40-seed band runs, because the GO bar
needs both a count AND a zero-carrying result, and stopping
early on count alone could hide a carrying night in a later
block. Seeds are cheap; the band is the pilot.

## Horizon, seeds, policy

- Horizon: 60 days, death-aware (dead villages stop
  simulating; +10d tail max per §10). WHY 60: identical to
  the substrate arm, so night rates are comparable. Never a
  fixed 200d.
- Policy: competent-player policy (nighttravel stack) +
  bankfood wrapper, unchanged. Env gates asserted FATAL by
  the driver: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, POLICY=nighttravel, WOODCARRY=1, WOODWARM=0,
  BANKFOOD=1. No gate, price, deed bar, or win price changes.
  No new policy file is introduced in Phase 1.

## Phase 2 hook (ONLY on GO, design fixed here)

If and only if the GO bar is met, land ONE minimal narration
hook: in the bankfood evening flip path, when a stranded
scholar's flip skips with 'no-gather-target' (0 actions) and
that loop-day's full night transcript otherwise carries no
bedding-down line, Game.say one plain-words bedding-down line
for that night (tile-aware where the tile is known, e.g.
thicket). Voice-only by construction: no kcal/time/stat
change, no duplicate line when a line already exists, no line
on flips that take actions. LIMITATION, stated now so a GO
does not oversell: the flip path lives in the sim policy
wrapper (scripts/policies/bankfood-diag.js), which is NOT
loaded by index.html and therefore NOT player-facing; a GO
hook there fixes the sim's day record, and a player-facing
port (e.g. in Game.sleep()'s stranded path) would be a
separate coordinator decision, not claimed here. If GO nights
turn out to be sleep-refused nights (no sleep-phase lines at
all), the hook must NOT be placed where it would contradict
the refusal line — that case is reported as a mechanism note
and the hook placement is re-decided with the coordinator
rather than landed blindly.
Proof on GO (fixtures + matched seeds, in
scripts/test-strandnight-a.js, extended before the hook
commit): a 0-action stranded flip gains exactly one
bedding-down line; a night that already has such a line is
unchanged; a flip that takes actions is unchanged;
trajectories otherwise bit-identical on matched seeds
(kcal/tile/mx/my/gameDay per loop-day). The hook commit MUST
include [needs-eyes]: spoken lines are a feel change.

## Panel note (§15)

scripts/balance-panel.js cannot express the nighttravel+
woodcarry+woodwarm strand stack, the 60-day evening census, or
a night-transcript bedding judgment (same declaration as
every prior strand arm). Phase 1 is a single-leg census, not
a before/after comparison, so no panel comparison is owed.
Phase 2 proof is fixture + matched-seed bit-identity, not a
panel comparison, and is never labeled one.

## Sense-testing law

Quote the actual bedding lines found (or their absence) from
the census corpus and judge whether they read as a person
bedding down for a stranded night — plain words, no
system-note phrasing. A counted night whose transcript never
mentions bedding down is reported as silence, not as a pass.
The hook line, if any, must be quoted in the evidence.

## Wall numbers (observed, NOT attributed)

Report median survival and wave reach read from the corpus,
and state plainly what it does NOT read: wins / national /
table are not read by a 60-day strand census and are not
fabricated.

## Metric review (for the NEXT run; filled at end)

- (filled at end of run; revisions never apply mid-run)

## Instruments (committed with this prereg, before any judged sim)

- NEW scripts/strandnight-trace-a.js (driver; node --check
  clean).
- NEW scripts/analyze-strandnight-a.js (analyzer; node
  --check clean).
- NEW scripts/test-strandnight-a.js (pure 15/15 GREEN before
  any judged sim).
- Reused, unchanged: scripts/policies/bankfood-diag.js,
  scripts/policies/nighttravel.js, scripts/policies/
  woodcarry.js, scripts/policies/woodwarm.js, scripts/
  sim-harness.js.
