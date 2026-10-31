# sim-p4sleep-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-p4sleep-b, axis food-economy
(strand/absence thread; the 2030Z closeout's named next blank).
Worktree sim-p4sleep-b, branch sim-p4sleep-b.
DIAG ONLY (instrument): zero src/js changes, zero policy-default flips,
zero edits to any existing policy file or existing script. New files only
(driver, splitter, analyzer, proof test, prereg, evidence, corpora). This
worker does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/TIME-ECONOMY.md (one clock; 512 ticks/day;
upkeep parts driven by the harness's wait loop) and docs/MAP.md (home
board, beyond tiles, way home — a node move is a real move, not a
relabel). No canon doc covers the sleep/upkeep window itself — stated
here instead of inventing canon. Standing rules that bear on it:
perception law (Steve 2026-10-28: decisions from what the villager
senses — the probe reads only the vessel's own tile/node, its pack
state via snaps, and the policy ctx the harness itself hands the
routine, which is the routine's own memory, not a roster feed), and
"no silent actions" (every act narrates; the sense test reads one full
window transcript end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-absencehunt-b.md + prereg (DIAG-GO, 96 legs,
  base a3e57bfc1): P4 nomadseek produced 2/16 genuine overnight
  absences PLUS 25 unexplained away mornings across the grid
  (F1 30d: 8; F2 30d: 6; F1 60d: 11 — the 60d legs include the 30d
  prefix, so the distinct 30d-band total is 14). Worked example,
  17502 F1: day 22 evening haven tile (4,4); day 23 morning ruin
  tile (4,3); days 23-27 at the ruin before returning morning
  day 28. No narrated leg covers the haven->ruin move itself.
  Absencehunt's residue, verbatim: "P4's sleep/upkeep-window moves
  (25 unexplained away mornings) — the genuine count undercounts
  P4's nights away; the window needs its own instrument (sleep
  bracket, as morningcarry did) before P4's away total is citable."
- evidence/2026-10-31/sim-absencehunt-b-census-p4-*.json (old base):
  F1 30d unexplained mornings by seed: 17502:[23], 17503:[18,27],
  17504:[10], 17506:[27], 17507:[20,26], 17508:[22]; 17501 and 17505
  none. These numbers are the OLD-BASE reference only — see
  "Re-derivation" below. They are NOT quoted as current.
- hidden_files/sim-findings.md item #1653 (absence precondition
  satisfied, parking condition lifted) — this arm is the named
  follow-up instrument for the P4 residue, not a strand design.
- docs/MEASUREMENT.md §§9-12, 14-15; docs/SIMULATING.md.

## The question

In the absencehunt harness shape, what moves the P4 vessel out of
Haven between the evening snap (after daily(), before sleep) and the
next morning snap (start of the next daily(), after that loop-day's
3 upkeep parts)? The 25 old-base unexplained away mornings are
attributed only loosely to "sleep/upkeep-window moves, unnarrated".
This arm names the mechanism(s) with traces, or proves how many
stay unexplained under a named instrument. P4's away total is NOT
citable as explained until this instrument says so.

## What the window contains (reading, not a verdict)

Per loop-day the harness (scripts/sim-harness.js runDays) runs, in
order: 3 x [policy.upkeep, driveFights, driveContests, doAction('wait'),
driveFights, driveContests], then policy.daily, then Game.sleep(),
then driveContests. The absencehunt evening snap sits after daily()
and before sleep(); the morning snap sits at the start of the next
daily(), i.e. AFTER that loop-day's 3 upkeep parts. So the window
between an evening snap and the next morning snap contains, in
order:

1. SLEEP: Game.sleep() itself (tickAction chunks to dawn; endDay
   rolls the day; encounter/fight/contest/tent-wreck wakes) plus the
   harness's post-sleep driveContests.
2. UPKEEP 1/2/3: policy.upkeep per part. For P4 (nomadseek over
   capable over competent) this is chooseOffers + competent.upkeep
   (cookPack, competentEat, drinkSafe, checkTicks, workWater,
   gearUp, eveningFeast, feastFightRoad, surplusFeast) + deedHunt.
   Candidate movers inside upkeep, by code reading: deedHunt walks
   to a known world monster up to 4 nodes away and starts a fight
   (and walks home after a sortie on a quiet upkeep); feastFightRoad
   faces the feast's draw while feasted; workWater assigns others
   (no self-move); gearUp/cookPack/eat/drink do not move the vessel.
3. WAIT-BLOCKS between upkeeps: harness doAction('wait') ticks to
   the part boundary (NPC batch turns run) + driveFights/driveContests.
   Candidate movers: a fight driven here can end in a flee-by-barrier
   exit to an adjacent node; a contest grab can relocate the vessel;
   NPC turns do not move the scholar (the scholar is not an NPC).
4. NOMAD ROAD (excluded by construction): nomadseek.daily checks
   canLeave and starts the road INSIDE daily(), i.e. BEFORE the
   evening snap — a road departure shows as an evening road absence,
   never as an unexplained morning. If a window move ever carries
   roadActive, it is classified separately, not as a window move.

## What counts as a sleep/upkeep-window move (definition)

A window move is a change in the vessel's haven-status or position
between two consecutive bracket snaps inside one window, where the
bracket snaps are taken at every hook boundary below. Snap fields
are exactly the absencehunt snapPos fields (inside, insideTent,
tile, mapPx/mapPy, havenPx/havenPy, mx/my, kcal, gameDay, dayTicks,
roadActive, roadOnRoad), plus the harness say-seq at the snap.
Haven-status uses the absencehunt analyzer's atHaven verbatim
(inside true OR tile 'haven' OR map position equals the village
node) — same definition as the census being explained, so the
re-derived unexplained mornings are comparable.

Hook boundaries (every boundary snaps; a move is attributed to the
hook call whose post-snap first differs from its pre-snap):
- daily-pre (morning snap; also the window's closing boundary) and
  daily-post (evening snap; the window's opening boundary).
- sleep-pre / sleep-post (Game.sleep wrapper; includes endDay).
- upkeep-pre / upkeep-post per upkeep call (numbered 1..3 within
  the loop-day by call order; the wrapper also records which loop-day
  the upkeep belongs to).
- doAction-pre / doAction-post for every harness wait call (the
  wrapper records the action argument; only 'wait' calls occur in
  the window, but any other action is recorded, not assumed away).
- fight-pre / fight-post (policy.fight wrapper) and contest-pre /
  contest-post (policy.contest wrapper) for drives inside the window.
The segment of a move is the hook call it falls in, named as:
sleep | upkeep-N | wait-block (doAction wait between upkeep-N-post and
upkeep-(N+1)-pre, or between sleep-post and upkeep-1-pre, or between
upkeep-3-post and daily-pre) | fight-drive | contest-drive. A move
whose pre/post snaps straddle a drive hook is attributed to that
drive hook, not to the surrounding wait-block.

## Classification rule for each P4 away morning

Step 1 — re-derive (from the tracer's own morning/evening snaps,
using absencehunt's definitions exactly): an UNEXPLAINED AWAY MORNING
is a loop-day k whose morning snap is away while loop-day k-1's
evening snap was at haven. (Loop-day 1 mornings have no previous
evening and are never counted.) Genuine transitions, day trips,
sleep-returns, and away-origin days are computed with the same
analyzer code as absencehunt (shared atHaven + classification) so
the re-derived census is auditable against the old one.

Step 2 — explain (only for re-derived unexplained mornings): take
that morning's window (evening snap k-1 through morning snap k)
and collect its move events (haven->away transitions; away->away
position changes inside the same window are listed, not counted
as the explaining event). The morning is classified as:
- EXPLAINED-MECHANISM: the window contains a haven->away move event
  whose hook segment is named AND at least one of (a) a ctx-counter
  delta inside that hook call naming a mover (deedHunt sortie
  counters capHuntSorties/capHuntAmbushed/capHuntAway,
  nomadMoves/nomadRoadDays, feast/fight counters, flee counters),
  (b) say lines inside that hook call showing the move (travel-leg
  lines per the absencehunt regex, fight/flee lines, contest-grab
  lines), or (c) the hook is a fight-drive/contest-drive whose own
  code path is a mover (flee-by-barrier exit, contest relocation)
  with the pre/post position change as the trace. The MECHANISM
  NAME is the code path so evidenced (e.g. deedHunt-sortie,
  fight-flee-barrier, contest-grab, sleep-encounter-flight,
  upkeep-feastFightRoad, other-named-hook with its trace quoted).
  A mechanism name with only (c) and no counter/say line is still
  EXPLAINED-MECHANISM but flagged "trace-only" in the report.
- EXPLAINED-SEGMENT-ONLY: the window contains a haven->away move
  event attributed to a named hook segment, but with neither a
  counter delta nor a say line nor a known mover code path behind
  it. The segment is known; the mechanism is not.
- UNEXPLAINED (residue): the window contains NO haven->away move
  event (snap inconsistency — the morning is away with no traced
  move — reported as a snap/instrument finding, never smoothed
  over), or the move event's hook is unattributed (a boundary the
  tracer failed to hook — reported as an instrument failure).
Narration presence/absence is recorded per explained morning as:
narrated (a say line inside the explaining hook call describes the
move out), unnarrated (no such line), partial (a line describes a
fight/encounter but not the move itself). Narration is a REPORTED
FIELD, never part of the explained/unexplained judgement — an
unnarrated but traced move is explained, and a narrated claim that
contradicts the positions is a sense failure.

## Primary metric + GO threshold (judged exactly as written)

Primary metric: CLASSIFIED FRACTION = (EXPLAINED-MECHANISM +
EXPLAINED-SEGMENT-ONLY) / (re-derived unexplained away mornings
across all judged legs). Secondary: DOMINANT MECHANISM SHARE = the
largest single mechanism's count / the same denominator, and the
MECHANISM-NAMED FRACTION = EXPLAINED-MECHANISM / denominator.

GO if EITHER (a) CLASSIFIED FRACTION >= 0.80, OR (b) one single
mechanism covers >= 0.50 of re-derived unexplained mornings.
A miss is NO-GO, never re-scored mid-run per MEASUREMENT §14; any
metric doubt goes under "metric review" for the NEXT run.
Judgement denominator: judged legs pooled (pilot + confirm — this
is an instrument validation, not a lever effect; the instrument is
frozen after the pilot except for disclosed bug fixes, and per-stage
breakdowns are reported alongside the pooled verdict).
Denominator guard: if the pooled denominator is < 4 unexplained
mornings, the verdict is NOT "GO" but "GAP-NOT-REPRODUCED on current
master" (the old-base gap did not survive the rebase) — reported
plainly, with the re-derived counts, not forced through the bar.

PILOT GATE (§9): 8 seeds before any confirm spend. Pilot pass
requires BOTH (i) the instrument gate (every leg errs 0,
decisions == evenings in count, loop-days contiguous from 1, every
re-derived unexplained morning carries a non-empty window trace
field — moves array present even when empty), AND (ii) the sniff
test: >= 1 re-derived unexplained morning AND >= 1 window move
event captured in the pilot. If (i) fails, STOP and report — no
confirm spend on a broken instrument. If (ii) fails on F1 alone
(0 unexplained mornings), run F2 30d as a pilot extension BEFORE
judging; the confirm grid below then shifts to F1 60d + F2 60d
(16 legs) so no leg is double-judged.

## Base commit (pinned) + re-derivation

Base commit for every leg in this arm: b26777c16 (worktree HEAD at
prereg writing time). The census is a fresh measurement on THIS
base, never a reuse of absencehunt corpora (their base a3e57bfc1
is an ancestor; intervening landings include journey-scale r63).
Old absencehunt bands are NOT quoted as current anywhere in the
evidence except in the "old-base reference" section above. The
re-derived P4 census on this base (genuine, day trips,
sleep-returns, away-origin days, unexplained mornings) is reported
in full for every judged cell.

## Policies (existing files only, no edits, no default flips)

- P4 nomadseek only: capable base + road drive (scripts/policies/
  nomadseek.js, unmodified). The tracer wraps it (upkeep/daily/
  fight/contest wrappers that snap and delegate); wrapping changes
  no game behavior — wrappers take no verbs, write no state, and
  draw no RNG beyond what the routine itself performs.
- Substrate env asserted FATAL in the driver for ALL legs:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  WOODCARRY/WOODWARM unset/0 (no woodcarry bucket on P4 legs —
  stated, not hidden), MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/
  FEDEVENING unset/0. Capable's internal env save/restore is
  policy-internal behavior, not a default flip by this arm.

## Search grid (declared fully, run exactly)

- PILOT: P4 x F1 17501-17508 x 30d = 8 legs.
- CONFIRM (only on pilot GO as defined above): P4 x F2 17511-17518
  x 30d (8 legs) + P4 x F1 17501-17508 x 60d (8 legs) = 16 legs.
  (If F2 30d was consumed as a pilot extension, confirm = F1 60d
  + F2 60d instead, 16 legs.)
- Horizons are death-aware: the harness stops at Game.over (dead
  villages stop simulating; the +10d tail is the harness's own end
  handling). Never a fixed 200d. 30d matches the absencehunt 30d
  bands being re-derived; 60d tests whether window episodes recur
  later and whether episodes lengthen (the old-base 60d legs added
  3 more unexplained mornings on F1: 17505:[37], 17507:[34],
  17508:[34]).
- Seed bands reuse the absencehunt 175xx range deliberately (same
  seeds, new base) so re-derivation is a base comparison, not a
  seed comparison. No seed in either band was used by any strand
  arm before absencehunt.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: driver + splitter + analyzer + pure proof test,
  committed before judged legs. Pure proof must pass before any
  judged leg runs.
- JUDGED LEGS: stdout-runner transport (sim prints one JSON line
  per seed to stdout; stdout -> file in evidence/ in a foreground
  exec; idle splitter splits into per-seed files; jsonl deleted
  after split). Judged corpora are NEVER staged in /tmp, and
  judged legs NEVER write files from a game-loaded process.
- SENSE TEST (law): read one full window transcript end to end
  (all say lines in the explaining hook calls + the surrounding
  evening/morning lines) for one explained morning, plus the
  evening/morning lines of one residue morning if any residue
  remains: transcripts, dialogue, meaning/coherence. A traced move
  whose lines read as a person walking out for a reason is a PASS
  on what exists; a silent move, a repeated loop with no variation,
  or a line claiming travel that did not happen is a sense failure,
  reported as such. Narration gaps are documented as design notes
  with counts — NO narration wording changes land in this arm
  (DIAG only).
- EVIDENCE: evidence/2026-10-31/sim-p4sleep-b.md — per-seed
  away-morning classification counts (explained by mechanism vs
  still-unexplained), citability verdict for P4's away total with
  its definition, village assessment in plain words, wall numbers
  as not-observable where applicable, metric review, §15
  declaration.

## Citability rule (what this arm may and may not conclude)

P4's away total becomes citable ONLY as: genuine transitions +
window-explained episode starts, each with its mechanism, PLUS the
unexplained remainder stated separately. If the residue after this
instrument is > 20% of re-derived unexplained mornings, the away
total is NOT citable as explained: the evidence reports genuine as
a lower bound, explained episodes with mechanisms, and the
unexplained remainder — and the next arm's job is the remainder,
not a re-citation of the total.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nomadseek window-bracket census, a 30/60-day
per-day absence census, or a census with no variant — the same
declaration every prior strand arm made. The comparison here is a
census across seed bands on identical seeds through the window
analyzer, never labeled a panel comparison. No panel result is
fabricated; the panel tool is not invoked on this corpus. If a
lever comparison arises (none is planned — this arm is DIAG only),
it will run through scripts/balance-panel.js and the compare .md
will be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a window move that starts an episode but returns the same
  window (haven->away->haven inside one window, e.g. a sortie that
  walks home in a later upkeep of the same loop-day) should count
  as explained: NO under this prereg — the morning snap is at
  haven, so no unexplained morning exists to explain; such
  round-trips are listed separately if observed.
- Whether sleep-post should be split from post-sleep driveContests:
  the tracer attributes post-sleep contest drives to the contest
  hook when a contest hook fires; a move with no contest hook
  between sleep-post and upkeep-1-pre stays in the sleep segment.
  That conflation is disclosed, not hidden, in the evidence.
- Whether deedHunt's walk-home-after-sortie (a haven-ward move in
  upkeep) can mask a window departure: it cannot create an
  unexplained morning (it moves TOWARD haven), but it can shorten
  an episode — the analyzer lists away->haven window moves so the
  masking is visible.
