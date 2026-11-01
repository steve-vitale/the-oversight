# sim-p3reset-b — PRE-REGISTRATION (binding, committed BEFORE any judged table)

Run: oversight-flesh-out-loop-b, arm sim-p3reset-b, run
fleshout-loop-b-20261101T0630Z, axis food-economy (P3 reset
mechanism). Worktree sim-p3reset-b, branch sim-p3reset-b.
This arm is DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing
policy file or existing script. New files only: this
prereg, one new analyzer (scripts/analyze-p3reset-b.js),
one new proof test (scripts/test-p3reset-b.js), one new
instrumented driver ONLY if the corpus gap triggers it
(scripts/drive-p3reset-b.js — new file, wraps Game
methods at runtime; never edits src/js), evidence, flow
tables. The absencehunt driver, creekseek driver, and
death17549 analyzer are REUSED VERBATIM from the base
(no edits). This worker does NOT push, bump, verify
live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending
coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (one continuous
map; the way home runs through the same travelTo
pipeline; NO TELEPORT ever) and docs/TIME-ECONOMY.md
(one clock; 512 ticks/day; node travel free; day-parts
derive from ticks). No canon doc covers a village-death
causal chain or a sleep pantry-flow ledger — stated
here instead of inventing canon. The ledger below is
read off the code (this worktree's base), cited by
function, not invented:

- sleep() (game.js): ticks the night in 32-tick chunks;
  endDay fires mid-sleep at the tick boundary and rolls
  the day; the hunger check runs inside endDay BEFORE
  the day roll (say day fields during endDay still
  carry the old day; the "— DAY N+1 DAWN —" line
  carries the new day).
- endDay order (game.js, ~32113): villageMeal (the
  scholar's meal; skipped when away) → villageLives →
  villageEats → extinction check → day roll.
- villageEats() (game.js, ~31137): the roster meal
  loop (villagerMealDay: each living villager eats AND
  may give), then "keep pantryKcal in sync" (re-derived
  from the item list, never a phantom scalar), then
  the famine block: `if (v.pantryKcal <= 0)` →
  hungryDays += 1 + "Haven's pantry is empty. Day N of
  hunger." (scattering at the famine limit, 3 here);
  else if hungryDays > 0 → "Haven eats again. The
  hollow look fades." + hungryDays = 0. The check
  reads the item-list pantry AFTER that night's meal
  loop, not the evening snapshot.
- villageLives() (game.js, ~27934, runs in endDay
  BEFORE villageEats): ambient foragers deposit via
  stockPantry — routine haul ~400–800 kcal × bold ×
  share mults, big day ~1500–2500 × mults — but the
  say line is gated on `present = playerAtHaven()`.
  Scholar away → the deposit is SILENT. (DEPOSITGATE
  holdback applies only when the pantry reads
  plentiful; on an empty pantry the full haul lands.)
- npcNodeTravel() (game.js, ~16790, runs on every
  day-part transition, including the sleep loop's tick
  chunks and the harness wait cycles): an away NPC
  returning from forage deposits 200–600 kcal ×
  cornucopia via stockPantry, and the say line
  ("returns from foraging the wilds: +N kcal") fires
  ONLY if the scholar stands at Haven. Scholar away
  → the deposit is SILENT.
- membership arrivalTick (membership.js, ~600):
  joiners ("Haven grows by one") add roster + trust
  + a line. They deposit NO pantry food. A joiner
  arrival is never counted as a pantry inflow.
- Scholar-pack lines are NOT pantry inflows, ever:
  the "🎁 small bundle … (N kcal of dried meat and
  clean water. Nothing traceable.)" lines and the
  "🪤 TRAP … About 350 kcal on the bone" lines go to
  the scholar's pack, not the pantry. They are
  excluded from every table in this arm.
- Raids take food OUT (or ~0 when the pantry is
  empty); a raid line is an outflow (or zero), never
  an inflow.

Consequence, stated BEFORE judging: on away-scholar
nights the transcript CANNOT itemize pantry deposits
— the two live deposit paths are silent by the
presence gate. The committed corpus can therefore
prove the bridge (evening → morning snaps) and the
marker/reset lines, but not the per-deposit
breakdown. That breakdown needs instrumented legs
(see below) or stays unitemized. Knowing the
mechanism CLASS (silent away forage returns) does
NOT count as itemization (see "Itemized", below).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-death17549-b.md + prereg
  (DIAG-GO, run 0545Z): seed 17549 dies by a
  three-night pantry-empty scattering on P1/creekseek
  (day 24) and BARE (day 18), and survives on P3.
  P3's pantry collapses just as far (200 on day 22,
  0 on days 25–26) but its hungry streak never
  reaches three nights: Day-1 markers on nights 18
  and 25, each followed by a "Haven eats again"
  reset (nights 19, 26). The away scholar draws no
  pantry meal while burning through successions.
  The reset inflows were OBSERVED (morning snapshots
  + reset lines) but NOT itemized by any deposit line
  — the stated gap this arm closes or fails to close.
- The awayeve pilot corpora are committed and are
  reused VERBATIM first: P3 =
  evidence/2026-11-01/sim-awayeve-b-corpus-pilot-p3-30d/
  absencehunt-b-deed-seeking-30d-s17549.json; P1 =
  evidence/2026-11-01/sim-awayeve-b-corpus-pilot-p1-30d/
  absencehunt-b-nighttravel-stack-30d-s17549.json.
  The death17549 censuses (sim-death17549-b-census-
  p3-30d.json, -p1-30d.json) carry the same snaps.
- Perception law (Steve 2026-10-28): every census
  field is read from the villager's own snaps and day
  lines — never from a roster or list feed. The
  instrumented legs below log pantry mutations as
  they happen in the sim (a ledger, not a roster).

## The question

What, night by night, resets P3's hunger streak on
seed 17549? Name the inflow(s) — source + kcal +
night — that make the endDay check pass on each
reset night, and show night by night why no such
inflow arrived on P1's fatal nights 22–24.

## Definitions (exact — the night convention is the whole game)

- NIGHT N = the sleep(N) line-prefix of the
  analyzer's slice(N): from
  evenings[N-1].saySeqAtEvening up to (excluding)
  the "— DAY N+1 DAWN —" line (or the slice end if
  absent). The sleep prefix holds the sleep lines
  (sleep setup, villageEats marker/reset lines,
  trap, raid, joiner lines); everything after the
  dawn line in the slice is the NEXT day's wait-phase
  lines, not sleep. The analyzer's slice(N) is a
  superset; this arm's tables use the prefix.
- OPENING pantry for night N = evenings[N].pantry
  (after the scholar's day actions, before sleep).
- CLOSING pantry for night N = decisions[N+1].pantry
  (the morning snap, taken at the next day's
  policy.daily start — i.e. AFTER sleep(N) AND
  after the next day's wait-phase part transitions).
- OVERNIGHT BRIDGE for night N = closing − opening.
  It equals sleep(N) net + waits(N+1) net. The corpus
  snapshots ALONE cannot split those two terms.
  Any table row that claims a sleep-only delta from
  corpus snaps alone is wrong; the split needs
  instrumented legs.
- PANTRY-AT-CHECK for night N = the item-list pantry
  at the moment villageEats' famine block runs
  during sleep(N). Observable ONLY on instrumented
  legs (a wrapped villageEats logs it). It is NOT
  the evening snap and NOT the morning snap.
- RESET NIGHT = a sleep slice carrying "Haven eats
  again" while hungryDays > 0 (i.e. following a
  Day-1 marker with no intervening reset). Per the
  committed death17549 census, the denominator is
  TWO: nights 19 and 26 (markers on nights 18 and
  25). If the analyzer recounts a different set, the
  evidence reports the recount and the denominator
  changes ONLY by that mechanical recount, stated as
  a correction — never by redefinition.
- ITEMIZED (FULL, per reset night): every deposit
  that arrived between the evening snap and the
  check (the PRE-CHECK window) is named by source
  (forage return by villager role/path, big-day
  haul, expedition return, scholar unload, granary
  draw, or other named path) + kcal, evidenced by a
  transcript line OR an instrumented stockPantry
  log entry, AND the pantry-at-check value is
  stated, AND the post-check + waits remainder of
  the overnight bridge is named or explicitly
  bounded (named deposits + a stated residual).
  A VERIFIED-ZERO pre-check inflow counts as
  itemized ONLY with evidence: evening snap > 0
  AND an instrumented pantry-at-check > 0 AND no
  pre-check deposit logged (i.e. the check passed
  on food already banked, not on a new inflow).
- OBSERVED-BUT-UNITEMIZED: a reset night whose
  bridge is known (snaps) but whose pre-check
  deposits are not named + kcal'd. Naming the
  mechanism CLASS ("silent away forage returns")
  from code does NOT promote a night to itemized.
- A reset night is NEVER itemized by a scholar-pack
  line, a joiner line, or a raid line (see code
  ledger above: none of those touch the pantry as
  an inflow).

## Policies (existing files only, no edits, no default flips)

- P3 deed-seeking (absencehunt driver): deed-seeking
  policy; WOODCARRY/WOODWARM unset/0. (The awayeve
  pilot P3 stack; the corpus file above.)
- P1 nighttravel-stack (absencehunt driver):
  competent.daily + nighttravel + withWoodcarry +
  withWoodwarm, WOODWARM=1, WOODCARRY=1. (Contrast
  only; no new P1 leg is planned — its nights 22–24
  are tabled from the committed corpus.)
- Instrumented legs (if triggered, see below) run
  the P3 stack above on THIS worktree's base, plus
  runtime wrappers only (stockPantry call log with
  caller hint + kcal + scholar day + phase tag;
  pantry-at-check log via a wrapped villageEats;
  pantry snapshots at sleep entry/exit). Wrappers
  live in the NEW driver file; they change no game
  behavior (log-only, no RNG, no state writes).

## Search grid (declared fully, run exactly)

Single seed, two policies, 30d window (the awayeve
window, covering both P3 resets and the P1 death):
17549 × P3 (primary), 17549 × P1 (contrast) — both
from the committed awayeve pilot corpora, no fresh
band. This is a single-seed flow trace, not a band
measurement: n=1 seed by design, and no rate, share,
or wall number is generalized from it. Horizons are
death-aware (MEASUREMENT §10): P1 ends day 24 (game
over), P3 survives the 30d window; no extension is
planned because both reset nights and the full P1
fatal streak land inside the window.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: itemized reset inflows (source +
kcal + night) for 17549 P3, from the committed
corpora, completed by instrumented legs where the
corpus gap triggers them.

GO BARS (ALL must hold):
(a) ITEMIZATION ≥ 90% OF RESET NIGHTS: with
  denominator 2, this means BOTH reset nights FULL
  (1/2 = 50% fails). A night counts only under the
  ITEMIZED definition above.
(b) COMPLETE TABLES, re-readable from committed
  corpus files: a per-night pantry-flow table for
  17549 P3 nights 18–30 (opening, every overnight
  inflow by source where the corpus names one,
  every outflow the corpus names, closing, hungry-
  marker state, sleep-prefix seq range, corpus file
  + line citations) AND the P1 nights 22–24
  contrast table on the same columns. "Complete"
  means every night's numbers are present and
  checkable from the corpus; a night whose inflow
  source is unknown is tabled with source =
  UNITEMIZED and its bridge stated, never blank and
  never invented. Table completeness (b) does NOT
  imply itemization (a): a complete table can still
  carry UNITEMIZED rows, and then (a) fails.
(c) PROOF TEST GREEN: scripts/test-p3reset-b.js
  passes, asserting the headline itemization counts
  (denominator, FULL count, UNITEMIZED count) by
  re-deriving the tables from the committed corpus
  files (not by hardcoding the verdict).

- GO: verdict = P3RESET ITEMIZED; the itemized
  inflows, the tables, and the sense-read are
  reported. A GO here is still DIAG: it authorizes
  NO src/js fix and NO default change.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = P3RESET NOT ITEMIZED;
  the failing bar is named exactly, with what is
  missing (which night, which window, which kcal).
  A NO-GO on (a) with (b)+(c) green is still NO-GO:
  complete tables that cannot name the inflow are
  the honest finding, not a pass.
- HELD: instrument blocked (a corpus unreadable, or
  the instrumented leg cannot run) — the block is
  stated, no verdict is claimed.

## Staging

- PREREG (this file): committed BEFORE any judged
  table. (The judged tables are built from the
  committed awayeve corpora; this prereg is
  committed before THIS arm's analyzer, tables, or
  evidence judges them. Exploratory code/corpus
  reads used to DESIGN this prereg — the night
  convention, the presence-gate ledger, the
  denominator — are design, not judgment; no table
  is judged before this commit.)
- INSTRUMENTS: p3reset analyzer + pure proof test,
  committed before the evidence judges the tables.
  The proof test covers: sleep-prefix slicing (dawn
  boundary), trajectory extraction (opening/closing/
  bridge), marker/reset detection by sleep slice,
  deposit-line extraction (forage / expedition /
  unload / meal / keep-only, same patterns as
  death17549), UNITEMIZED marking (a night with no
  named pre-check deposit is UNITEMIZED, never
  defaulted to a mechanism class), and analyzer
  wiring on a synthetic corpus.
- CORPUS TABLES FIRST: the P3 nights 18–30 table
  and the P1 nights 22–24 table are built from the
  committed corpora BEFORE any new leg runs. If
  the corpus tables already FULL-itemize a reset
  night (named deposit lines covering the pre-check
  window), no leg is needed for that night.
- INSTRUMENTED LEGS (triggered, not assumed): for
  each reset night the corpus leaves UNITEMIZED, ONE
  targeted leg runs on THIS worktree's base: seed
  17549, P3 stack, 30d, with the sleep-flow
  instrumentation above. REPRODUCTION RULE (fixed
  here, before running): an instrumented leg's
  sub-step values attach to a corpus night ONLY if
  the leg reproduces that night exactly — same
  evening pantry, same morning pantry, same
  marker/reset lines on the same nights (18/19 and
  25/26). Otherwise the leg is reported EXPLICITLY
  as a new-base leg (mechanism evidence only: which
  paths deposit, in which phase, at what sizes) and
  NEVER as a reproduction of the awayeve legs, and
  the corpus night stays UNITEMIZED for bar (a).
  A base move re-rolls the shared RNG stream, so
  exact reproduction is NOT assumed.
- If a reset cannot be itemized even then, it is
  reported as UNITEMIZED with the exact evidence gap
  (which window, which numbers are known, which
  deposit class is suspected from code but unlogged
  for that night) — no source is invented.
- SENSE TEST (law): read the P3 days 24–27
  transcripts end to end (sleep prefixes + wait
  phases + daily lines) and judge meaning /
  coherence / consequences. Quote the sleep lines
  that show (or fail to show) each reset inflow.
  Also sample villager behavior generally out of the
  sims (goals, routines, dialogue, reactions) and
  flag anything robotic, static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-p3reset-b.md —
  verdict judged against this prereg, itemized
  inflows (or UNITEMIZED gaps), both tables, P1
  contrast, sense-read with quotes, metric review
  section, village assessment in plain words,
  wall numbers reported as "not measured by this
  pre-seat census" (never invented).

## §15 panel (non-applicability declaration, checked before judged tables)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express a single-seed sleep-flow trace, pantry-at-
check values, hungry-day streaks, or policies that
are not in the registry (deed-seeking as a census
stack) — the same declaration every prior strand
arm made, stated here before judging. There is no
before/after comparison in this arm (DIAG trace, no
lever), so no panel comparison is attached and none
is fabricated; the panel tool is not invoked on this
corpus. The deliverable is itemized flow tables,
stated explicitly, not silently skipped.

## Metric review (open questions noted before any judged table, not resolved by re-scoring)

- Whether a VERIFIED-ZERO pre-check inflow counts as
  itemized: YES under the definition above, but ONLY
  with instrumented evidence (evening snap > 0 AND
  pantry-at-check > 0 AND no pre-check deposit
  logged). A corpus-only "evening was positive so
  probably no inflow was needed" is NOT itemized —
  the corpus cannot show what villageEats drew
  before the check.
- Whether the mechanism class (silent away forage
  returns) may substitute for per-night kcal: NO —
  see ITEMIZED. If both reset nights land at
  mechanism-class-only, bar (a) fails and the metric
  review for the NEXT run proposes re-generating the
  awayeve corpus with sleep-flow logging on one
  frozen base (so the log and the corpus are the
  same run), rather than re-scoring this run.
- Whether the overnight bridge (evening → morning)
  may be reported as the reset inflow: NO — the
  bridge includes post-check + waits deposits that
  arrive AFTER the check passed and therefore
  cannot have caused the reset. Only the pre-check
  window causes a reset.
- Carried doubt for the NEXT run: if silent away
  deposits are the reset mechanism, the next
  question is their size distribution on fresh seeds
  (routine haul vs big day vs node-return) — but
  that band is for the NEXT run; this run is judged
  on the two corpus nights it pre-registered.
