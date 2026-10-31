# sim-departdiag-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-departdiag-b, axis food-economy.
Worktree sim-departdiag-b, branch sim-departdiag-b.
DIAG ONLY (measurement): zero src/js changes, zero policy-default flips,
zero edits to any existing policy file, new files only (driver, splitter,
analyzer, proof test, prereg, evidence, corpora). This worker does NOT
push, bump, or verify live; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/TIME-ECONOMY.md (ticks/day-parts; node
travel free, the steps to the edge already cost; forage 16 ticks +
60 kcal; bridge 96 ticks + 60 kcal). No canon doc covers the departure
gate itself — stated here instead of inventing canon. Standing rules
that bear on it: perception law (Steve 2026-10-28: decisions from what
the villager senses — its own tile, its own pack, its own clock; the
probe reads only those, plus the policy ctx the harness itself hands
the routine, which is the routine's own memory, not a roster feed),
and "no silent actions" (every act narrated; the sense test reads the
Haven-bound days' narration end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-fedevening-b.md + sim-fedevening-b-prereg.md
  (DIAG, strand set empty on its base: 26 legs, 0 creek evenings, all
  evenings at haven, all 30 days survived; the day-7 departure, a
  routine lottery, now lands "stay"; mechanism class proven — shared
  RNG-stream shift from two landed systems — exact shifting draw
  NOT isolated; metric-review doubt #3: a competent policy that
  never departs on 8/8 seeds in 30 days deserves a DIAG of its own.
  THIS ARM IS THAT DIAG.)
- evidence/2026-10-31/sim-windowcarry-b.md + sim-windowcarry-b-prereg.md
  (NO-GO: on the old base the vessel departed on loop-days 1-4 on
  15215, both legs, then stranded; the departure itself is the road
  to the strand. Departure records there are the comparator shape:
  acted departs per loop-day, then not-at-haven days.)
- evidence/2026-10-31/sim-morningcarry-b.md (trace-leg shape: morning
  snaps, evening snaps, say lines, spawn identity).

## The question (fedevening metric-review doubt #3)

On current master, the vessel stays home on the whole old strand band.
What gates the vessel's departure from Haven? Per seed per day: the
departure decision, the routine conditions as the code sees them, and
what the vessel does instead on Haven-bound days. The gate must be
traced to a named code path — a gate that cannot be traced is residue,
stated as an explicit unknown, not a claim.

## What the code says before any sim (reading, not a verdict)

The competent routine's outward leg is gated in scripts/policies/
competent.js, function needTrip(Game, ctx) (exported, called from
competent.daily before forageTripSeedFirst):

    pantry = sum of village pantry kcalEach * units
    s = Game.state.scholar
    if (pantry < 25000 || s.kcal < Game.kcalCap() * 0.5) return true;
    if (ctx) { day = s.day || 0; lastGive = ctx._lastGiveDay || 0;
               if (day - lastGive >= 3) return true; }
    return false;

So needTrip is FALSE — no forage trip — only when ALL THREE hold:
pantry >= 25000 kcal AND vessel kcal >= 50% of cap AND the vessel gave
to the pantry within the last 2 days (day - lastGive < 3). That is the
prime suspect for the stay-home gate, but it is NOT pre-judged here:
the census must show whether haven mornings actually read needTrip
false, and if needTrip reads true on a haven morning with no departure,
the gate is downstream (recovering() — competent.daily skips outward
legs while recovering — or inside forageTripSeedFirst: no stocked
non-haven non-ruin candidate, all candidates blocked/declined, or a
trip that returns 0). The driver therefore records, per loop-day, the
needTrip inputs AS THE CODE SEES THEM by calling the real exported
needTrip(Game, ctx) on the harness ctx at the start of the day's
daily() call, plus recovering(Game, ctx) (also exported), plus the
day's outcome. Caveat, stated now: the in-daily needTrip call happens
after the morning buffer inside competent.daily (sootheTrauma,
channelDevotion, thirst-home, keepPromises) runs; the driver's
pre-daily reading can differ from the in-daily reading if the buffer
changes pantry, vessel kcal, or _lastGiveDay that morning. The driver
also records post-daily _lastGiveDay so a same-day give is visible,
and any day where the pre-daily reading says false but the vessel
departs anyway (or true but it stays with no downstream evidence)
is classified as BUFFER-DIVERGENCE and investigated from that day's
say lines, never smoothed over.

Other outward legs exist besides the forage trip and are recorded,
not assumed away: stoneRun (frontier rubble pushes), counterPlay
(gardens / fishing / traps when the land thins), workTrapline — all
skipped while recovering() is true, all visible in ctx deltas and say
lines. A departure is defined behaviorally (below), not by which leg
caused it; the leg attribution is secondary evidence from ctx deltas
(forageTrips) and say lines.

## Substrate (asserted FATAL in the driver)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON), DAYS=30,
MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING all unset/0
(each FATAL if 1). Seeds: the 8-seed pilot band 15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337. Stack: warmed =
withWoodwarm(withWoodcarry(nighttravel)) exactly as the morningcarry
driver builds it, so evening records (woodcarry bucket/rescued,
nighttravel outcome) compare with the strand censuses. Departure is
upstream of woodwarm, so guard and ON legs are expected to agree
until the first creek evening; on a stay-home band they should agree
entirely, and any divergence is itself a finding, reported, not
averaged away.

## Base commit (pinned)

Base commit for every leg in this arm: f536e3ad33da39ed7c4ed6cc620277287405bed3
(sim-scale-onramp-round-1535-a coordinator evidence, 2026-10-31).
Fedevening's base (19b3e1ae0) is an ancestor of this base; intervening
landings include scale-onramp arms, axefirst, and corpsemove. The
census is therefore a fresh measurement on THIS base, never a reuse
of fedevening's corpora.

## Base-equality check (BEFORE judged legs, NOT judged)

Run scripts/morningcarry-trace-b.js VERBATIM (unmodified, as committed
on this base) on seed 15215, guard + ON legs, DAYS=30, same substrate
env. Record verbatim: creek evenings per leg, evenings at haven, days
survived, spawn vessel id. Expectation from fedevening's driftcheck
(0 creek evenings, stay-home, gen_gyft62f) is a REFERENCE, not an
assertion: whatever the verbatim driver shows on this base IS the
base-equality result. If it shows departures/creek evenings, the
strand road has moved again since fedevening, and the judged census
measures that road — the prereg's verdict clause still applies
unchanged (gate identified + quantified, or residue stated). If it
shows stay-home, the judged census proceeds on a confirmed
stay-home base. The base-equality corpora live in
evidence/2026-10-31/sim-departdiag-b-basecheck-{guard,on} and are
never mixed into judged corpora.

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead villages
stop simulating; the +10d tail is the harness's own end handling).
30 days matches every prior strand arm's census window, so departure
counts compare exactly with windowcarry's loop-day 1-4 departs and
fedevening's 30-day stay-home band. Wall numbers (national / table /
wins) are NOT observable on a 30-day pre-seat census and will be
reported as such, not fabricated.

## Primary metric + DIAG-GO threshold (judged exactly as written)

Primary metric: departures per seed in 30d + departure-decision
records (one per loop-day per seed per leg).

Definitions (analyzer implements exactly these):
- A loop-day's morning state is the state at the START of that day's
  daily() call (loopDay = call index; loop-day 1 uses the spawn
  state, unlike the morningcarry driver which skipped call 1).
- startsAtHaven = morning insideHaven true OR morning tile 'haven'
  OR morning map position equals the village (px, py) node.
- departed = startsAtHaven AND the evening record for that loop-day
  is NOT at haven (evening insideHaven false AND evening tile not
  'haven' AND evening map position not the village node), OR the
  nighttravel evening outcome is a travelled-away outcome recorded
  with an away evening position. A day that starts away is NOT a
  departure day (it is a stranded/away-origin day); a day that
  starts at haven and ends at haven is a STAY day.
- needTrip reading: the driver's pre-daily call of the real
  needTrip(Game, ctx), with its inputs (pantryKcal, vesselKcal,
  kcalCap, lastGiveDay, day) recorded alongside.
- needTrip-false decomposition (only meaningful when the reading is
  false): all three must hold — pantryOK (pantryKcal >= 25000),
  kcalOK (vesselKcal >= kcalCap * 0.5), giveOK (day - lastGiveDay < 3).
  The census counts haven mornings by which of the three fail when
  the reading is true, and confirms all three hold when false.
- stay-day activity class (from ctx deltas + that day's say lines,
  first matching rule): forage-trip (forageTrips delta > 0 but
  evening still at haven — trip returned home same day, NOT a
  departure by the definition above; counted separately as
  day-trip-home), talk (conversation lines), garden/fish/trap
  (counterPlay lines), assign (assignment lines), eat/drink/rest
  only, other (say lines present, no class matched), silent
  (no say lines at all that day — a sense flag, not a class).

DIAG-GO iff ALL of:
  (a) GATE IDENTIFIED: one named code path (needTrip in
      competent.js, recovering() in competent.js, or a named branch
      inside forageTripSeedFirst / stoneRun / counterPlay) accounts
      for the stay-home days, stated with its file + function +
      condition.
  (b) GATE QUANTIFIED: for every haven morning in the judged corpora,
      the decision table shows the gate's reading (needTrip value +
      inputs, recovering value) AND the outcome (departed / stay),
      with counts: haven mornings, departures, stays by gate reading,
      and stays with needTrip true but no departure broken down by
      downstream evidence (recovering true / no-candidate / blocked /
      declined / trip-returned-0 / buffer-divergence / unknown).
      Unknown stays (no gate reading explains them) must be 0 for
      GO; any unknown stay is residue (see below).
  (c) INSTRUMENT INTEGRITY: zero driver errors on judged legs;
      8/8 files per leg present; every seed 30 loop-days or a
      game-over with its day recorded; guard/ON departure counts
      reported per leg (agreement or divergence stated, never
      averaged); determinism re-run of one leg (15215 guard)
      byte-identical.
Otherwise DIAG (not NO-GO — this arm judges no lever): the verdict is
DIAG with the residue stated explicitly: which days, which seeds,
which readings are unexplained, and what instrument would close it.
A gate that cannot be traced to a named code path is residue, not a
claim, however suggestive the counts.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: driver + splitter + analyzer + pure proof test,
  committed before judged legs. Pure proof must pass before any
  judged leg runs.
- BASE-EQUALITY CHECK (above): before judged legs, never judged.
- JUDGED LEGS: 8 seeds x 2 legs (guard + ON), stdout-runner
  transport (sim prints one JSON line per seed to stdout; stdout
  -> file in evidence/ in a foreground exec; idle splitter splits
  into per-seed files; jsonl deleted after split). Judged corpora
  are NEVER staged in /tmp.
- DETERMINISM: re-run of the 15215 guard leg, byte-identical
  corpus required.
- SENSE TEST (law): read the vessel's Haven-bound days end to end
  on at least two seeds (15215 + one other, all 30 days' say lines
  skimmed, days 1-7 + first stay week read closely): transcripts,
  dialogue, meaning/coherence. A stay-home village that reads as
  people living days is a PASS on what exists, with the departure
  gap stated, not hidden. A silent day, a repeated loop with no
  variation, or a line that claims travel that did not happen is a
  sense failure, reported as such.
- EVIDENCE: evidence/2026-10-31/sim-departdiag-b.md — census
  tables, gate trace, village assessment in plain words, wall
  numbers as not-observable, metric review, §15 declaration.

## §15 panel (applicability, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack, a
30-day departure-decision census, or a per-loop-day routine-gate
trace — the same declaration every prior strand arm made. The
comparison here is guard-vs-ON legs on identical seeds through the
census analyzer, and is never labeled a panel comparison. If the
panel tool is invoked on this corpus it will be recorded with its
output verbatim; no panel result is fabricated.

## Metric review (open questions noted before any judged leg, not
resolved by re-scoring)

- Whether "departed" should count same-day return trips (forage
  trip out and home before evening) as departures: NO under this
  prereg (departure = ends the day away); same-day trips are
  counted separately as day-trip-home so a future prereg can
  argue otherwise with evidence.
- Whether the pre-daily needTrip reading is the right "as the code
  sees it" moment, given the morning buffer inside competent.daily:
  the buffer-divergence class exists for exactly this; if it is
  non-empty, the next run should read needTrip from inside the
  routine (a wrapper around the routine's own call) rather than
  before it.
- Whether pantry >= 25000 is a sane stay-home threshold at all
  (a full pantry that never empties because the vessel never
  leaves is self-sealing): a design question for the coordinator /
  Steve, not a verdict this census can reach — the census can only
  show whether the threshold is what holds on this band.
- Whether recovering() (post-flee return) explains any stay week:
  recorded per day; if it fires, its span is reported, not assumed
  to be the whole story.
