# Journey succession r104 — SPLIT-RESOLUTION + KEEPSAKE-LINE VERIFICATION (lane B, pre-registration 2026-11-02, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout (succession → endgame wrap 7→4), and VERIFY the file reads
4 afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: last numbered Lane B succession run is r100
(landed; sent-vanish mechanism CLOSED, keepsake burial line added,
proof (e) carried as stale-baseline debt, fresh split case still
unobserved). Last Lane B run overall is r103 (crisis, wrote
rotation 6 → 7). This run is r104. Slug deviation, documented:
the body slug journey2-succession is unusable (done-merged
registry entry + orphan directory on disk, same class as
r83/r87/r89/r91/r94/r97/r100). This run uses
journey2-succession-r104.

Base: local master at registration (b312c404b at pre-flight).
No push, no bump, no live check — ship loop owns those. Gating
freeze (2026-10-27) stands; no gate, deed-bar, standing, wave,
or table-price change is in scope. Perception law untouched.
No canon doc covers succession/mantle (CANON.md manifest;
DEAD-LEDGER.md mentions succession only in passing) — none
invented here.

## Why a 4-seed pilot again

Steve 2026-11-01: deliver real changes, stop re-proving
already-proven constraints. r100 closed the vanish mechanism and
landed the keepsake line; this run spends its panel on the two
items r100 explicitly left open, plus the per-run people check:
(1) the split trigger specified at DAY vs ITERATION resolution —
r100's metric-review ask was to stamp an iteration counter on
chain entries so a same-iteration double is provable from the
record instead of requiring code-order argument; (2) verification
that r100's keepsake burial line fires on fresh seeds (not only
on r100's panel). A 4-seed pilot is proportionate: both items
need handoffs, not a census.

## The questions

1. SPLIT-RESOLUTION: with an iteration counter stamped on every
   chain entry, does any fresh-panel handoff pair share one
   iteration (organic death during runDays + scripted kill after
   that same runDays in one iteration)? If a same-DAY double
   appears with DIFFERENT iteration counters, the split is a
   day-resolution artifact, not a same-iteration double, and the
   trigger is re-specified at day resolution for the next run.
   If a same-iteration double appears, it becomes the seed for
   proof-(e) re-baseline (see below).
2. KEEPSAKE-LINE VERIFICATION: does r100's burial line fire on
   every fresh-panel handoff where a sentimental vanishes (and
   stay silent where none vanishes)? A handoff with a vanish
   and no line is a REGRESSION of r100's fix, investigated
   same-run.
3. PEOPLE CHECK: full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something, options
   engage / deflect, endings resolve / plant / owe), no
   fabricated shared history, no filler loops, no static menus.

## Instrument (r100 files + renames + two declared additions)

- Driver: scripts/journey-succession-r100-20261101.js cloned
  with ONLY r100→r104 renames (filename, mode succession-r104,
  probe strings, tele/transcript filename patterns), EVID dir
  2026-11-02, date 20261102. POST_DAYS=70, EARLY_KILL_DAY=40
  (r100 values). CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  Forced seeds: SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20,
  FOURTH_KILL_DPLUS=10, FIFTH_KILL_DPLUS=10 (r100's 20/20/10/10).
  Controls: all four 0.
- Declared addition A (driver): stamp an iteration counter on
  every chain-recorder entry (the driver's own loop counter for
  the runDays/scripted-kill iteration in which the handoff was
  recorded). Additive output field only — no game-state write,
  no RNG touch, no policy change. Determinism leg (below) must
  still hold byte-identical apart from the new field; if the
  counter changes any game trajectory byte, that is a
  stop-and-explain item.
- Main analyzer: r100 analyzer cloned with ONLY renames +
  seed list changes (SEEDS [30401..30404], forced [30401,30402],
  young [30401,30402], mature [30403,30404]) + ONE declared
  addition: SPLIT-RESOLUTION section (for every pair of chain
  entries on one seed, print day gap and iteration-counter gap;
  flag same-day pairs and same-iteration pairs separately).
  VANISH-CLASSIFY carried verbatim.
- Naming analyzer: r100 file cloned with ONLY renames
  (defaults seeds 30401..30404, tag r104).
- Proof test: r100 file cloned with ONLY renames (driver path,
  scratch patterns r104-) + keepsake-line check carried: the
  scripted-handoff line assertion from r100 stands, re-run
  against current master. NO edit to (e)'s old r91-split
  expectations UNLESS a genuine same-iteration double is
  observed on this panel — in that case, and only then, (e)
  is re-baselined on that seed's trajectory with the split
  asserted structurally, and the re-baseline is documented as
  its own commit section.
- Diff verification: strip r100/r104 tokens, old/new seeds,
  the iteration-counter block, and the SPLIT-RESOLUTION block;
  the remaining files must be identical. Any other diff is a
  stop-and-explain item.
- Pilot seeds: 30401, 30402 (chain-forced), 30403, 30404
  (controls). Fresh numbers, never used by a succession panel
  (verified by evidence-dir grep before launch).
- Determinism leg: seed 30401 re-run BYTE-IDENTICAL (panel
  JSON, iteration-counter field included — the counter is a
  pure function of the loop index and the game trajectory, so
  any byte difference is a stop-and-explain item), so the
  fork is trajectory-neutral. (Correction made before the
  panel launched: the draft said "apart from the new field";
  that was wrong — the counter adds no nondeterminism, and
  exempting it would hide exactly the drift the leg exists
  to catch.)
- Expansion trigger (pre-declared, same shape as r100):
  pilot expands to 6 (adding 30405 chain-forced, 30406 control)
  if ANY pilot seed shows a same-iteration double handoff OR
  scores silent under BOTH naming metrics. A week-1 second
  death alone does NOT trigger expansion.

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer deaths on 4/4
  pilot seeds (true count from game records; a collapse on any
  seed is a NO-GO for the recorder, not re-scored).
- CHAIN5-READABLE: full fifth handoff recorded on every forced
  seed that reaches its fifth-kill window; a recorder miss on
  such a seed is NO-GO (a seed that ends before the window is
  not a recorder miss — reported as such).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on every
  recorded fifth handoff; affinityDiff5 = 0 on every one.
- V1 (vanish mechanism, re-confirmation): every vanished id at
  a handoff snapshot has class 'sentimental' in
  src/data/items.json. A vanished non-sentimental id (or
  UNKNOWN class) is a BUG finding: investigate the
  gearPack/corpse path same-run.
- V2 (vanish mechanism, re-confirmation): no sentimental id
  shows corpseN > 0 at any handoff snapshot.
- KEEPSAKE-LINE: the burial line fires on every handoff with
  ≥1 vanished sentimental, and the line's wording names
  keepsakes buried with the body. A vanish without the line
  is a REGRESSION finding, investigated same-run.
- SPLIT-RESOLUTION (descriptive, not a bar): every same-day
  handoff pair is classified same-iteration vs
  different-iteration from the stamped counters. No bar is
  staked on observing a same-iteration double — it has stayed
  unobserved since r97; absence is reported as absence, not
  re-scored.
- M3v2b ≥3/4 on the pilot panel (≥4/6 if expanded), same
  allowance shape as r100.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM: every invite outcome spoken.
- PROOF: (a)–(d) and (f) must pass; (e2) must pass; (e) is
  EXPECTED to fail on its stale r91 expectation (carried debt,
  not re-scored, not edited) UNLESS a genuine same-iteration
  double is observed on this panel, in which case (e) is
  re-baselined as declared above. A NEW failure in
  (a)–(d)/(f)/(e2) is a stop-and-explain item.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-02/journey-succession-r104-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r94/r97/r100 precedent): a forced-chain
panel must NOT roll the unforced baseline forward — LOUD lines
from forced deaths are regime, not drift, unless investigation
shows a real bug. Baseline NOT rolled on LOUD lines without a
same-run investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r100: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) are the baseline; re-observe the
capable-bot food-deed proof status here and report it. Any NEW
failure is a stop-and-explain item. The run's own proof test is
run standalone (see PROOF bars above).
