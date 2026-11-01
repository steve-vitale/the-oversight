# sim-death17549-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-death17549-b, run
fleshout-loop-b-20261101T0545Z, axis food-economy (17549
death-cause trace). Worktree sim-death17549-b, branch
sim-death17549-b. This arm is DIAG ONLY (measurement):
zero src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New files
only: this prereg, one new analyzer
(scripts/analyze-death17549-b.js), one pure proof test
(scripts/test-death17549-b.js), evidence, censuses.
The absencehunt driver, creekseek driver, absencehunt
analyzer, confirmednight analyzer, strandtile analyzer,
and awayeve analyzer are REUSED VERBATIM from the base
(no edits). This worker does NOT push, bump, verify live,
or merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across
the map; the way home runs through the same travelTo
pipeline as walking out, orthogonal steps only; NO
TELEPORT ever) and docs/TIME-ECONOMY.md (one clock;
node travel is free; the day has a fixed 512-tick
budget; day-parts derive from ticks) — the prior arm's
anchors — plus docs/DISEASES.md for the sickness thread
only: wound_fever is MUNDANE (infected wound: open cuts
left dirty), never mixed with the alien pool. No canon
doc covers a village-death causal chain — stated here
instead of inventing canon. Standing rules that bear on
it: perception law (Steve 2026-10-28: every census field
is read from the villager's own snaps and day lines —
never from a roster or list feed) and "no silent actions"
(the sense test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-awayeve-b.md + prereg
  (DIAG-GO, run 0330Z, base 6409c1312): seed 17549 is
  village-lost on P1 (day 24), creekseek (day 24), and
  BARE (day 18), and survives on P3. Its P1/creekseek
  episode [9-11] ends WALK-HOME — the villager gets
  home — and the village still dies about two weeks
  later. The death cause was explicitly NOT investigated
  by the census; this arm picks it up without re-hunting.
  The awayeve corpora for these legs are already
  committed under evidence/2026-11-01/
  sim-awayeve-b-corpus-pilot-<policy>-30d.
- Tracker closeout for run 0435Z (goal hidden_files/
  convergence-tracker.md tail): this arm takes that
  closeout's next blank (2): 17549 death-cause. No other
  blank is chased mid-run; no lever or default is flipped.

## Base and corpus note (pinned, stated before any judged leg)

The analysis source is the COMMITTED awayeve corpora
(base 6409c1312), which carry complete per-day records:
morning/evening snaps (vessel, tile, kcal, pantry
items), ctx deltas, evening outcomes, and the FULL
say-line stream including sleep processing (the driver
wraps Game.say for the whole run, so sleep narration —
village meals, hungry-day markers, the scattering line —
is in the corpus, not just daily() lines). NO new sim
leg is planned: the transcripts needed for a dated chain
are already committed. Contingency only: if a chain link
lacks transcript evidence in the corpus, ONE targeted
leg may be run on THIS worktree's base (2debb6756) and
must be reported as a new-base leg, never as a
reproduction of the awayeve legs (a base move re-rolls
the shared RNG stream and voids cross-base identity).
The P1 leg is traced FIRST (pilot gate, §§9-12); the
other policies are traced only after the P1 chain is
complete with dated quotes.

## The question

What kills the village on seed 17549? Trace day by day
on each dying policy (P1, creekseek, BARE): pantry/food
state, who dies and of what, succession cascade,
starvation vs disease vs combat vs exposure, and what
happens in the two weeks between the day-11 walk home
and the day-24 loss. Then explain the P3 contrast: what
does P3 do differently on this seed that avoids the
death (patrol rhythm? food? the villager being out
instead of home?). Quote transcript lines for each link
in the chain; a cause with no dated transcript evidence
is not a finding.

## Definitions (exact)

- Village-lost paths in code (game.js / ledger.js /
  havenGrowth.js), distinguished by their narrated line:
  (a) SCATTERING: endDay finds the pantry empty
  (v.pantryKcal <= 0) for famineLimit consecutive days
  and fires "Haven couldn't hold. On the third hungry
  day, people started walking…" (famineGraceDays():
  havenTier >= 3 → 5 days, else 3 days; the narrated
  "third" vs "fifth" states the limit in-run).
  (b) EXTINCTION: the whole roster dead — "Nobody is
  left. Not scattered, not gone looking for food —
  dead, every one…".
  (c) NO-SUCCESSOR: the player vessel dies with no
  candidates — "No one is left to pick up the Codex…".
  The analyzer classifies the game-over ONLY by which
  of these three lines (if any) appears in the
  sleep-after-final-day slice; a deaths-list tally
  alone never classifies it.
- Hungry day: a sleep slice containing "Haven's pantry
  is empty. Day N of hunger." The streak is the run of
  consecutive nights carrying that marker without an
  intervening "Haven eats again."
- Pantry trajectory: morning and evening pantry item
  sums (kcal, count) from the corpus snaps, per loop
  day. Morning-minus-prior-evening is the overnight
  delta (village consumption + sleep deposits);
  evening-minus-morning is the daytime delta (deposits
  minus daytime draws). Deposits are quoted gross
  ("returns from foraging the wilds: +N kcal",
  "is back from past the … (+N kcal for the pantry)",
  "unload N kcal into Haven's pantry"); nets come from
  the snapshots, never from summing quoted grosses.
- Deaths: the corpus deaths list (live telemetry death
  events: day, kind, who, cause, player flag) PLUS the
  sleep-slice narration for the same days (Codex
  "X is dead" lines, FIRST GRAVE crisis). A death
  narrated but absent from the list (or vice versa) is
  reported as a mismatch, never silently merged.
- Succession: a morning vesselId differing from the
  prior day's morning vesselId. The awayeve precedent
  stands: a succession morning narrated as a homecoming
  is still a death, not a return.
- Sickness thread: wound-fever lines ("a cut gone hot
  and angry", "feverish") are classified mundane per
  DISEASES.md and tracked as a PARALLEL thread; they
  become the game-over cause only if the game-over
  line is extinction or no-successor, never by tally.

## Policies (existing files only, no edits, no default flips)

- P1 nighttravel-stack (absencehunt driver):
  competent.daily + nighttravel + withWoodcarry +
  withWoodwarm, WOODWARM=1, WOODCARRY=1.
- CREEKSEEK-STACK (creekseek driver):
  scripts/policies/creekseek-b.js, WOODWARM=1,
  WOODCARRY=1, CREEKSEEK_B=1.
- BARE (absencehunt driver): competent.daily ALONE.
- P3 deed-seeking (absencehunt driver): deed-seeking
  policy; WOODCARRY/WOODWARM unset/0.
Substrate env asserted FATAL in both drivers for ALL
legs: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, MORNINGCARRY/WINDOWCARRY/STRANDFIX/
PRESSB/FEDEVENING unset/0.

## Search grid (declared fully, run exactly)

Single seed, four policies, 30d window (the awayeve
window, covering death at day 18-24 plus tail):
17549 x P1, 17549 x creekseek, 17549 x BARE,
17549 x P3 — all from the committed awayeve pilot
corpora, no fresh band. This is a single-seed causal
trace, not a band measurement: n=1 seed by design
(the seed is named because it dies three ways), and
no rate, share, or wall number is generalized from it.
Horizons are death-aware (MEASUREMENT §10): the
harness stops at Game.over; dead villages stop
simulating (+10d tail max is the harness's own end
handling). Never a fixed 200d. No 40d extension is
planned: all three deaths land inside the 30d window
with their game-over lines, so a longer window would
add no link to any chain; if a chain link were found
to need days past a death, the extension would be
pre-registered here first — it is not, because the
deaths are in-window.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: a dated causal chain per dying policy
(pantry trajectory + hungry-day streak + game-over
line + deaths/succession timeline), each link carried
by a quoted transcript line with its day.

GO BARS (ALL must hold):
(a) CHAIN COMPLETE ON >= 2 OF 3 DYING POLICIES: for
  at least two of P1 / creekseek / BARE, every link
  from the first pantry decline to the game-over line
  is dated and quoted, with no link resting on counts
  alone. (P1 and creekseek may share a chain ONLY if
  their corpora are shown identical — see below.)
(b) P3 CONTRAST EXPLAINED: the P3 leg's survival is
  explained in the same terms (pantry trajectory,
  hungry-day streak, meal draws, deposits) with dated
  quotes, stating what breaks the fuse that completes
  on the dying policies — or stating plainly that no
  difference is visible, which fails this bar.
(c) COMPETING CHAINS RESOLVED: if two candidate
  causes both carry dated evidence, the evidence file
  names the winner and why the loser is not the cause
  (e.g. a death thread that ends before the game-over
  line, or a symptom dated after the fuse completed).
  Documented competing chains with no winner is
  NO-GO, never re-scored against a friendlier metric
  mid-run (MEASUREMENT §14).
(d) SENSE PASS: at least one full leg's transcript
  (the P1 days 12-24 stretch, or the BARE days 6-18
  stretch) read end to end and judged as people living
  and dying in a village — meaning, coherence,
  consequences — with quotes. A counts-only report
  FAILS the sense-testing law.

- GO: verdict = DEATH17549 COMPLETE; the dated chains
  per policy, the P3 contrast, and the sense-read are
  reported. A GO here is still DIAG: it authorizes NO
  src/js fix and NO default change.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = DEATH17549 NOT COMPLETE
  on this seed; the failing bar is named exactly, with
  what is missing.
- HELD: instrument blocked (a corpus unreadable or a
  game-over line absent) — the block is stated, no
  verdict is claimed.

Secondary reported facts (every leg, never pooled into
a rate): deaths list verbatim, succession days,
maxWaveUnlocked, waveKills, scholar evening kcal
trajectory, expedition returns (count + kcal), NPC
forage returns (count + kcal), scholar pantry unloads,
village-meal draws quoted, fished-out lines, garden
lines, wounded-rest lines, relief-option lines
(HUNGER WINTER crisis offers) and whether any was
taken.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
  (The judged legs are the awayeve pilot legs, already
  committed by the prior arm; this prereg is committed
  before THIS arm's analyzer, census, or evidence
  judges them. No new leg runs before this commit.)
- INSTRUMENTS: death17549 analyzer + pure proof test,
  committed before the evidence judges the chains. The
  proof test covers: pantry trajectory extraction
  (morning/evening/overnight/daytime deltas), hungry-
  day streak detection (Day N markers, "Haven eats
  again" reset, scattering line), game-over
  classification (scattering vs extinction vs
  no-successor vs none, by narrated line only),
  deaths/succession timelines, deposit-line extraction
  (forage returns, expedition returns, scholar
  unloads), and analyzer wiring on a synthetic corpus.
  Pure proof must pass before the evidence is written.
- PILOT GATE (this arm): the 17549 P1 leg fully traced
  (chain + quotes) before the creekseek, BARE, or P3
  legs are judged. The P1 trace is written into the
  evidence file first; the other policies are added
  only after it is complete.
- SENSE TEST (law): read one full leg's transcript end
  to end from THIS arm's corpus and judge meaning /
  coherence / consequences. Quote the lines. Also
  sample villager behavior generally out of the sims
  (goals, routines, dialogue, reactions) and flag
  anything robotic, static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-death17549-b.md —
  verdict judged against prereg, dated chains per
  policy, P3 contrast, sense-read with quotes, metric
  review section, village assessment in plain words,
  wall numbers reported as "not measured by this
  pre-seat census" (never invented).

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with its
own scorecard and observer contract. It cannot express
a single-seed death-cause trace, a pantry trajectory
with hungry-day streaks, game-over lines, or policies
that are not in the registry (creekseek,
BARE-competent as a census stack) — the same
declaration every prior strand arm made, stated here
before judging. There is no before/after comparison in
this arm (DIAG trace, no lever), so there is no panel
comparison to attach and none is fabricated; the panel
tool is not invoked on this corpus. If a lever
comparison on panel terms arises (none is planned —
this arm's deliverable is a chain, not a survival
lever), it will run through scripts/balance-panel.js
and the compare .md will be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether P1 and creekseek may share one chain: YES
  only if their corpora are byte-identical on
  sayLines and decisions (awayeve reported identical
  transcripts for 17549 on both stacks); the analyzer
  verifies identity mechanically and the evidence
  reports the result — if they differ, the chains are
  written separately.
- Whether the deaths list or the sleep narration is
  authoritative when they disagree: NEITHER alone —
  a mismatch is reported as a mismatch with both
  sides quoted, and the game-over classification rests
  on the narrated game-over line, never on a tally.
- Whether a village-meal draw quoted from sleep lines
  may be summed into the pantry trajectory: NO —
  trajectory numbers come from the morning/evening
  snapshots only; quoted draws are gross flows that
  explain direction, never substitutes for snapshots.
- Whether the "Haven eats again" reset proves food
  arrived: it proves the endDay check found the pantry
  non-empty that night; the morning snapshot is the
  evidence for what arrived, and a reset without a
  named deposit line is reported as an unnamed inflow,
  never attributed to a specific villager or mechanism.
- Carried doubt for the NEXT run: if the chain shows
  supply is expedition-lumpy while demand is steady,
  the next question is which supply leg (expedition
  returns, NPC forage, scholar unloads, garden, fish)
  is the live lever on fresh seeds — but that
  comparison is for the NEXT run; this run is judged
  on the chain it pre-registered.
