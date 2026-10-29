# sim-raidname-b — PRE-REGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-raidname-b
(run fleshout-loop-b-20261029T1730Z, axis food-economy).
Claims findings-backlog item #1445 (the coordinator marks it —
this arm does not edit the backlog file). Adjacent backlog
#1380 ("eyes on your bedroll" for never-slept players) is
NOTED ONLY, not built, per the arm brief.

## Canon status (stated, not invented)

READ docs/CANON.md first: no canon doc covers raids or
palisade sleep. The raid rule lives only in a
havenGrowth.js header comment (reactive raids: 3+ world
monsters, 3k+ pantry kcal, 7-day cooldown, 18% roll;
wealth draws teeth; without a palisade one raider can
reach the sleeping player via pendingEncounter; with a
palisade the watch holds the wall — safe sleep is real).
This arm invents no canon: the wording change (Phase 2,
only if Phase 1 confirms the gap) names a mechanism the
code already implements; it adds no mechanism, balance,
or policy change.

## Background (read first)

evidence/2026-10-29/sim-fightorigin-b.md +
sim-fightorigin-b-prereg.md. That arm proved, on band
10710–10725, 30 days, substrate COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=
insideevening: dawn fights behind morningpersist misses
are haven-raid-born pending encounters (murkcap
10712/21, hushwolf packs 10720/18, 10713/28), set by
havenRaidTick, resolved by the harness pending block
into fights inside the hall, then fled through the
doors. Its sense finding, now item #1445: the fight
announces only the generic BREACH line (progression.js
CRISIS_BEATS 'breach', fired by startCombat for ANY
haven fight — game.js startCombat, fireCrisis('breach')
when playerAtHaven), never that the arrival was a
haven raid; and 10713/28's creation say window
interleaves night-raid casualty narration with
fight-start lines without flagging it as raid
aftermath. WARNING from backlog #1446, adopted here:
the morningpersist miss set DRIFTED on current master
(10722/30 no longer reproduces; new miss 10713/28).
This arm does NOT quote the old miss set as current:
it pins its base commit and re-derives raid mornings
on current master first (Phase 1 census).

## Base commit (pinned before judging)

6dccc8b5a (Version bump 07c440b05-20261029-172450,
batch ship) — this worktree's HEAD at arm start.
All census and before/after numbers are on this base
unless a Phase 2 change lands, in which case the
post-change corpus is compared against the Phase 1
corpus on identical seeds (see neutrality gate).

## Instrument (reused, unchanged)

Driver: scripts/fightorigin-trace-b.js, run with
OUTDIR=evidence/2026-10-29/sim-raidname-b-corpus.
It is measurement-only (read-only tracing layers;
every wrapped verb / startCombat call invokes the
original exactly once) and already proven on this band
by sim-fightorigin-b. Analyzer: new
scripts/analyze-raidname-b.js (census + tail
classification over the corpus). Proof: new
scripts/test-raidname-b.js (census assertions +
post-change unit + neutrality checks, when Phase 2
runs). No other driver, no policy change, no
substrate change. If the driver crashes or corpora
are incomplete, the run stops and reports — no
substitute instrument is improvised mid-run.

## Phase 1 — census definition (fixed here)

Band: seeds 10710–10725 (16 seeds, ≥8 for any judged
census band), 30 loop-days, same substrate and policy
as sim-fightorigin-b. Death-aware horizon: instances
run 30 loop-days or to game-over, never a fixed 200d.

A DAWN-RAID MORNING is a morning interval (evening
snapshot inside the haven → next morning snapshot)
containing a fight creation that satisfies ALL THREE:
  (a) RAID-PENDING: the pending-transition log shows
      pendingEncounter set (or pendingMonsterId set to
      the creation's monster) with havenRaidTick in the
      setter stack frames, at some point after the
      previous fight's end (or instance start) and
      before this creation, AND the creation's caller
      stack names the harness pending-resolution call
      site (driveContestsImpl) — the same
      pending-resolved definition as the fightorigin
      amendment, plus the havenRaidTick setter
      requirement, which is what separates a raid
      pending from a wanderer/feast pending;
  (b) BREACH: the creation's sayTail contains the
      BREACH lines ("It got INSIDE" / "Perimeter
      violated");
  (c) HALL FIGHT: the creation's fighters include the
      player and the raid monster, and the creation
      position reads inside the haven (inside=true).
A creation meeting (a)+(b)+(c) is a DAWN-RAID FIGHT.
Census outputs, per seed and band-total:
  - dawn-raid mornings (count + seed/morning list)
  - dawn-raid fights (count; a morning may hold >1)
  - BREACH-only vs raid-named lines: for each
    dawn-raid fight tail, whether any line names the
    raid as the arrival mechanism (contains "raid" in
    a line attributing the fight's arrival — the
    night's RAID announcement line itself, said during
    havenRaidTick hours earlier, does NOT count: the
    judged window is the creation sayTail, the lines
    a waking player actually sees with the fight);
  - say-window interleaving: for each dawn-raid fight
    tail, whether night-raid casualty/defense lines
    ("didn't come back", "met them at the door",
    "Nobody met") appear interleaved with fight-start
    lines without a raid-aftermath flag line.
Secondary, reported never judged: all morning-interval
creations on the band (denominator context), miss
mornings (evening inside → morning outside) and
whether each miss morning is a dawn-raid morning,
wave/kill/death shape, median survival.

Phase 1 also re-derives the miss set on current
master: the census is judged on what THIS base
produces, not on fightorigin's miss list. Any
difference from fightorigin's set is reported as
drift, not folded into the census numbers.

## Phase 1 — sense bar (fixed here)

Read EVERY dawn-raid fight tail end to end (all of
them; if the census finds >3, at least 3 plus all
interleaved ones), plus the full interval sayTails
(checkpoint + move tails) around each, and judge
meaning/coherence: does a waking player understand
(1) this fight arrived as a haven raid, (2) whether
anyone already fell in the raid before this fight?
Sense PASS requires: the tails read as one coherent
morning story with the raid arrival legible, OR the
gap is precisely located (which lines mislead, which
are missing). A tail that names the monster and the
breach but never the raid is a CONFIRMED GAP, not a
pass — the backlog claim is that the raid mechanism
is invisible at fight time, and "monster named +
breach announced" was fightorigin's already-stated
partial legibility, not a refutation.

## Phase 2 — wording change (ONLY if Phase 1 confirms the gap AND the gates below hold)

Scope, fixed here: NARRATION TEXT + the smallest
flag plumbing needed, nothing else. Concretely: the
BREACH-adjacent fight-start window names the raid
when the fight is raid-born (e.g. a line at
startCombat, after the BREACH beat, stating this
fighter came with the night's raid), and raid
casualty/defense lines already said during the raid
night are flagged as raid aftermath when they land
in a dawn fight's window. No spawn, draft, damage,
crisis, economy, or policy value is touched; no
default flips; no new system. If the minimal
plumbing turns out to require touching mechanism
(e.g. changing who fights, when, or with what HP),
Phase 2 is KILLED and the arm lands DIAG-only.
Draft wording with exact file/line locations is
landed in the evidence file in that case.

## Primary GO bar for the wording change (judged ONLY against this prereg)

GO requires ALL of:
  G1 (raid-named): on the post-change re-run of the
      SAME band/seeds/substrate, 100% of dawn-raid
      fight creation tails contain a raid-naming line
      (a line attributing this fight's arrival to the
      haven raid, said at fight start, inside the
      creation sayTail window).
  G2 (no false positives): 0 non-raid haven fight
      creations on the band gain a raid-naming line.
  G3 (sense PASS): every post-change dawn-raid tail
      read end to end passes the Phase 1 sense test
      (raid arrival legible; raid-aftermath lines, if
      present in the window, flagged as such).
  G4 (neutrality, see gate below): trajectories
      deep-equal OFF/ON except say lines, and the say
      diff is exactly the added raid lines.
  G5 (proofs green): scripts/test-raidname-b.js
      green (unit + census + neutrality), node
      --check clean on changed scripts, and the
      repo quick check (scripts/check.js --quick)
      green on the changed checkout.
GO = wording lands (commit message includes
[needs-eyes]: player-facing text Steve judges on
his phone). Any G-item miss = wording KILLED,
DIAG-only landing (census + sense verdict + draft
wording with file/line locations); DIAG-only
evidence commits do NOT carry [needs-eyes].
DIAG-NO-GO = Phase 1 does NOT confirm the gap
(e.g. raid-named lines already present in ≥ half
of dawn-raid tails, or no dawn-raid mornings on
the band at all — the latter is INSUFFICIENT-DATA
if the band yields zero, not a refutation).
INSUFFICIENT-DATA = zero dawn-raid mornings on the
16-seed band, or the driver/corpus fails such that
no census can be judged.

## Neutrality gate for any wording change (exact definition)

Wording-only changes must not move trajectories.
Comparison: Phase 1 corpus (pre-change, base
6dccc8b5a) vs post-change corpus (same seeds,
substrate, policy, days, driver), field by field:
  - MUST be deep-equal: evenings/mornings positions,
    moves (verb/before/after), deaths, waveKills,
    maxWaveUnlocked, daysAlive, endReason, fighters
    (identities, wave, hp at creation), fight
    outcomes, taps, checkpoints positions.
  - MAY differ, ONLY in say lines: creation
    sayTails, checkpoint/move sayTails, and tap
    sayWindows, and the diff across the whole band
    must consist EXACTLY of the new raid-naming /
    raid-aftermath flag lines (added lines only; no
    line removed, reordered, or reworded; no other
    new line anywhere). The proof test computes this
    diff and fails on any other say change.
  - Any non-say field difference, or any say
    difference beyond the added lines, = wording
    MOVED trajectories (or the game moved under it)
    → wording KILLED, DIAG-only landing. No
    re-scoring: a moved trajectory is never
    re-labelled "narration-only" mid-run.

## Staging

- Pilot is NOT a separate leg here: the census band
  is 16 seeds and sims cost ~3–4s per seed-run, so
  the full band runs once as Phase 1. (The driver
  itself was already piloted + confirmed by
  sim-fightorigin-b on this band.)
- Phase 2 re-run, if any, is the same 16 seeds.
- Corpora: evidence/2026-10-29/sim-raidname-b-corpus/
  (Phase 1), evidence/2026-10-29/sim-raidname-b-corpus-on/
  (Phase 2 post-change, if any). Analyzer output:
  evidence/2026-10-29/sim-raidname-b-analysis.json
  (Phase 1) and -on-analysis.json (Phase 2, if any).

## Wall numbers (30-day legs)

National / table / wins: NOT OBSERVABLE inside
30-day instances — reported as not claimed, never
as zeros. Wave 4–5 reach, median survival reported
from the corpora as observed.

## Metric review (mandatory section in the evidence file)

Every evidence file carries a metric review: whether
the prereg metric proved right, what diverged
(census vs fightorigin, neutrality detail), and any
revision proposed for the NEXT run — never a
mid-run re-score.
