# sim-heraldsteer-adopt-a — preregistration: LIVE-SEED ADOPTION VERIFICATION OF THE HERALD STEER (DIAG ONLY, zero new src/js)

Run: fleshout-loop-a-20261101T2315Z (Loop A, axis scale-onramp).
Worker branch: sim-heraldsteer-adopt-a. Arm: DIAG ONLY. Zero new
`src/js` changes — the treatment under test is build 3056aeb4f,
already on this branch's history (see below). No gate, stage,
deed-bar, or win-price retune. Nothing from the #1538
steve-call queue is built. No `[needs-eyes]` (DIAG
instrumentation only; nothing player-facing changes beyond the
already-landed steer build itself, which carried its own flag).

## Treatment under test (read, not re-measured)

Build 3056aeb4f (commit message verified in this tree):
`wanderWorldMonsters` in `src/js/game.js` biases Herald steps
Haven-ward — for a world monster whose id is `herald`, half
the time a step is drawn from the Haven-ward directions
instead of all four. Same 0.35 move chance, same one-tile
step, same edge / safe-tile / occupied-tile blocks, never
onto Haven's own tile. Target is Haven's map tile
(`state.village.px/py`), a place, never a roster or list of
people. Verified in this tree: 3056aeb4f IS an ancestor of
this worktree's HEAD, and the steer branch in `game.js`
(`m.id === 'herald'`) is present. Other monsters are
untouched by construction (the branch only runs for
`m.id === 'herald'`); a control leg (below) re-checks this
on this tree rather than trusting the build note.

## Canon read before sims

docs/CANON.md (manifest) + docs/MONSTER-WAVES.md (wave law,
escalation, tiers — the Herald is a wave-6 herald per
MONSTER-WAVES.md:248 context, a titan, not a wave monster).
No canon doc covers Herald arrival/raid drafting (as the
heraldarr2 prereg recorded); governing sources are the
heraldarr2 code reads (havenGrowth.js `havenRaidTick` /
`havenGrowthDaily`, raid pinning with no safe-tile check)
plus the steer build's own evidence
(`evidence/2026-11-01/build-herald-steer.md`). Nothing here
invents canon.

## Prior arms (reused, not re-measured)

- heraldplace (95301–95308, pre-steer, fixed band):
  contact-seed rate 1/8 (95304, 30 contacts = 29 scholar +
  1 villager); lairs 3–4 tiles east of Haven; wander steps
  symmetric (approach 35 = retreat 35 on unfaced seeds).
- heraldarr2 (longevity-screened, pre-steer): pilot
  contacted 2/8 (95404, 95408), confirm 2/8 (95423, 95429),
  pooled 4/16; Haven windows pilot 4 + confirm 1, ALL
  raidPin, ALL chain-continuous; drafts pilot 6 + confirm 1.
- Build fixture (3000 wander ticks, 8 seeds, pre/post on
  identical seeds): mean distance to Haven 4.55 → 1.77,
  contact ticks 295 → 3589 (12.2×), first passage to
  distance ≤ 1 at most 714 → at most 44 ticks, 0 teleports,
  0 Haven entries, non-Herald control reproduces the old
  numbers exactly.

## Primary question

Does the drift raise REAL Herald contact and Haven-window
arrivals in full sims — not just fixture ticks? I.e., on a
longevity-screened long-run band on current master (with the
steer), is the shared-tile contact-seed rate clearly above
the 1/8 heraldplace baseline, and do Haven arrival windows
still land via the proven raid-pin path, chain-continuous,
with the movement guardrails intact?

## Stack (named exactly — numbers NEVER pooled across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Same stack
family as heraldarr2. Instrument: `scripts/sim-heraldarr2-a-sweep.js`
+ `scripts/sim-heraldarr2-a-lib.js` reused UNMODIFIED (capture
ON = `SIMHERALDARR2=1`; OFF = unset for the screen and the
neutrality leg's OFF side). New files in this arm only
(`heraldsteer-adopt-a` prefix):
- `scripts/sim-heraldsteer-adopt-a-analyze.js` — adoption
  metrics from a judged corpus dir: contact-seed rate,
  contacts per seed/channel, mean dawn distance to Haven
  (located dawns), wander step classes vs Haven
  (approach/retreat/lateral/sit), wander step-size audit
  (every wander step must change exactly one coordinate by
  1), wander Haven-landing audit (0 wander steps landing
  on the Haven tile), plus wall numbers.
- `scripts/test-sim-heraldsteer-adopt-a.js` — proof test
  (synthetic cases always; corpus legs when a corpus dir
  + analysis JSON are passed).
- `scripts/sim-heraldsteer-adopt-a-screen.sh` — screen
  driver (same rule as heraldarr2, extended qualifier cap;
  see Band). Adapted from `sim-heraldarr2-a-screen.sh`,
  selection fields unchanged (seed, days, gameDays, won,
  endReason only — never any Herald field).

## Band, horizon, and the LONGEVITY SCREEN (fixed before sims)

Horizon: `DAYS=180`, death-aware — identical to heraldarr2.

Screen (fixes the heraldarr-a censor, same rule as
heraldarr2): substrate-only (capture OFF) over seeds
scanned sequentially from 95401 upward, cap 72 scanned,
collecting up to 24 qualifiers: pilot = qualifiers 1–8,
confirm reserve = qualifiers 9–24. Screen artifacts live
in `evidence/2026-11-01/sim-heraldsteer-adopt-a-screen/`
(audit trail for the band choice, NOT judged corpus).

Screen rule (fixed now; selection uses ONLY these fields,
never any Herald field):
- Qualifier: `gameDays > 120 AND won == 0`.
- A seed that wins on/before day 120, dies on/before day
  120, or wins at any day is NOT a qualifier.
- If fewer than 8 qualifiers appear in 72 scanned seeds,
  the pilot runs on however many qualified (reported as a
  short band, and pilot-gate bar 1 judges 8 as failed →
  NO-GO on bar 1, not a quiet smaller pilot).

BASE NOTE (fixed now, judged honestly): this worktree's
HEAD differs from the heraldarr2 corpus base — it contains
the steer build PLUS later journey/evidence commits. The
BEFORE numbers above are therefore REFERENCE corpora, not
a seed-identical baseline: if the re-screen reproduces the
heraldarr2 qualifier list exactly, the pilot seeds are
seed-identical and the comparison is as close as a moved
base allows; if it does not, the AFTER band is judged as a
screened-equivalent band and the qualifier-list difference
is reported as base drift, not smoothed. No old code is
checked out to fake a baseline.

PILOT GATE: 8 pilot seeds (screened qualifiers 1–8) with
capture ON before ANY confirm spend.

CONFIRM BAND (pre-stated now, runs ONLY on pilot GO as
defined below): screened qualifiers 9–24 (up to 16 seeds;
12–16 when the screen yields that many — if the screen
yields fewer than 12 confirm qualifiers, the confirm runs
on however many exist and the short confirm is reported,
not padded). Same stack, same horizon, same bars.

## Counting rules (fixed before sims)

- Contact-seed rate = seeds with ≥1 Herald contact
  (scholar + villager channels, from the sweep's contact
  wrappers) / pilot seeds. Contacts per seed and per
  channel reported alongside; a seed with contacts counts
  once for the rate whatever the contact count.
- Haven-tile arrival window = a dawn-to-dawn window whose
  end dawn tile is the Haven tile and whose start dawn tile
  is not (heraldarr2 analyzer definition, reused). Landing
  class = the chain's landing step class from the analyzer.
- Mean dawn distance to Haven = mean of `distHavenMan` over
  located dawns (dawns with a Herald tile) per seed, then
  pooled over located seeds. Reported as a diagnostic
  against the fixture's 4.55 → 1.77 (different instrument
  — fixture ticks vs dawn snapshots — so it is NEVER
  judged as the fixture number itself, only its direction).
- Wander step classes vs Haven: for every `wander` move
  event, classify vs the Haven tile at that moment using
  the heraldplace step-class rule (approach / retreat /
  lateral / sit — sit cannot occur in a move event by
  construction, since a move event requires a tile change;
  the analyzer reports approach/retreat/lateral over move
  events and dawn SIT days separately via the heraldarr2
  analyzer's window classes).
- Guardrail audits (from the corpus alone, no new wraps):
  (a) every `wander` move event must have Manhattan step
  exactly 1 (teleport = any other step); (b) zero `wander`
  move events land on the Haven tile (raidPin/lingerPin
  landings are the proven arrival path and are NOT counted
  here — this audit is wander-only); (c) non-Herald
  movement untouched: code read (branch gated on
  `m.id === 'herald'`) + the steer proof test's control
  leg re-run on this tree (see legs).
- Wall numbers (orientation only, this band/stack — never
  pooled): won, national (final rank national/global),
  table, wave-4/5 reach, median/max survival, and whether
  any wave-5 fight chain completes (wave-5 reach + a
  wave-5 contact/fight record in the corpus; absence
  reported as absence).
- Sense-test: read transcripts (sayLines + ring context in
  the corpus) around Herald contact/arrival days. Flag
  anything robotic, teleporting, or off-law (no list feeds
  any decision; Haven's map tile is a place, not a roster).
  The steer itself reads only `state.village.px/py` and the
  Herald's own tile — verified by code read in this tree.

## Pre-registered GO bars (judge exactly against this)

ADOPTION-GO iff ALL of:
1. 8 pilot seeds, each complete (per-seed JSON present,
   capture errors 0, end fields present). A short screened
   band fails this bar.
2. Contact-seed rate ≥ 3/8 on the pilot — clearly above
   the 1/8 heraldplace baseline (and above the heraldarr2
   pilot's 2/8). Exactly 2/8 is NO-GO (no improvement
   shown); 1/8 or 0/8 is NO-GO.
3. ≥ 1 Haven-tile arrival window on the pilot, AND 100%
   of pilot Haven windows are attributed (chain-continuous,
   no UNATTRIBUTED gap) with landing class raidPin or
   lingerPin (the proven pin path; a lingerPin landing is
   a re-pin of an already-lingering Herald, still the pin
   path, not a wander arrival).
4. Guardrails hold: 0 wander teleports, 0 wander landings
   on the Haven tile, control leg green (steer proof test
   control reproduces pre-steer aggregate behavior for a
   non-Herald monster on this tree).
5. Recorder-neutrality leg: ON vs OFF end fields identical
   (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 1 pilot seed — choice rule
   fixed now: FIRST contacted pilot seed if any, else
   first located pilot seed, else first pilot seed.
6. Determinism leg: one judged seed re-run to a scratch
   dir reproduces its judged per-seed JSON except for
   `anchorCommit` (any other field difference is a failure).
7. Proof tests green: `test-sim-heraldarr2-a.js`
   (synthetic + corpus legs on the judged corpus) AND
   `test-sim-heraldsteer-adopt-a.js` (synthetic + corpus
   legs) AND the steer proof test
   `test-build-herald-steer-20261101.js` (mechanism +
   control legs) on this tree.
8. Sense-test: contact/arrival beats read for meaning in
   the evidence file.

Panel (MEASUREMENT.md §15): the before/after comparison
here is a DIAG census vs recorded reference corpora on a
moved base (see BASE NOTE) — the balanced panel
(`scripts/balance-panel.js`) compares before/after runs of
the same instrument on the same base, which this arm does
not have (no old-code checkout is permitted by the brief).
Panel is therefore NOT APPLICABLE to the headline verdict;
none fabricated. If the re-screen reproduces the heraldarr2
qualifier list exactly, that seed-identity is reported as
the closest available panel-equivalent, not as a panel run.

## Verdict mapping (fixed now — no re-scoring mid-run)

- GO (adoption verified): all bars 1–8 pass. The steer
  raises live-seed Herald contact and Haven arrivals via
  the proven pin path, guardrails intact.
- NO-GO: any bar fails — including bar 2 (contact rate
  not clearly above baseline) or bar 3 (no Haven window,
  or a window landing by wander/follow/spawn, or an
  unattributed window). A NO-GO is a finding about the
  adoption (fixture ≠ live seeds), not a measurement
  failure, UNLESS the failure is on bars 1, 5, 6, or 7
  (instrument failure), in which case it is reported as
  such.
- DIAG-GO (bounded): GO on bars 1, 3, 4, 5, 6, 7, 8 but
  bar 2 missed narrowly (exactly 2/8) WITH a directional
  improvement in the diagnostics (mean dawn distance
  down vs the heraldarr2 corpus's dawn distances, or
  contacts per contacted seed up) — reported as DIAG-GO
  with bounds, never upgraded to GO.
- INSUFFICIENT-DATA: short band (bar 1 fails for lack of
  qualifiers, not for capture errors) with no other bar
  decidable — reported as such, not as NO-GO on the game.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) Dawn snapshots miss intra-day position changes — the
move-event log is the guard, as on heraldarr2. (b) The
BEFORE corpora are on older bases; the re-screen is the
honest AFTER band, and any qualifier-list difference is
base drift, reported, not hidden. (c) The contact-seed
rate on a screened band is still a screened-band rate:
it must never be pooled with unscreened bands or trended
as representative. (d) Mean dawn distance is a different
instrument from the fixture's tick-mean; direction only,
never a numeric gate. (e) The raidPin move event records
net before/after tiles across a raid call (heraldarr2
metric review (f)) — chains through draft+flee days need
that caveat carried, not re-litigated. (f) The analyzer's
spawn-filing artifact (dawn-day spawns filed into the
following window, heraldarr2 metric review (j)) can break
non-haven chains cosmetically; haven windows are judged
on their own chain text, not on the pooled attributed
count alone.
