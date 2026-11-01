# sim-heraldhp2-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-11-01)

Run: Loop A worker, axis scale-onramp, arm sim-heraldhp2-a.
Arm type: DIAG ONLY — zero src/js, zero policy-default flips, zero
edits to existing policy files, zero edits to the 20261031 instrument
files (they are copied, not modified, into new heraldhp2-dated files).

## Question (from sim-heraldhp-b, NOT re-proved here)

Heraldhp-b (evidence/2026-10-31/sim-heraldhp-b.md, DIAG-GO) closed
backlog #1595 on its base: the seed-85106 refusal-window drop
525 -> 105 = RAID wall 350 (two palisade drafts, 175 each, days
106/123) + FIELD 70 (3 fights, 37/20/13), 420/420 = 100%. Its own
next-step 3 stays open: FREQUENCY — only 1 of 4 located-Herald
seeds took any draft damage, so is wall-chipping a normal titan
tax or a one-seed story? This arm answers that on CURRENT master,
in two parts: (1) CONTROL — reproduce the 85106 refusal window
on current master with the landed instrument (verbatim reuse,
copied into new heraldhp2-dated files); (2) CENSUS — a wider band
of located-Herald seeds, counting per seed: Herald located?,
raid drafts on the Herald?, wall HP lost?, field fights vs the
Herald?

Out of scope (recorded only, NOT built): the titan-in-raid-draft
design question (is drafting a placed titan as an ordinary raider
intended?). It needs a design ruling, not a build.

## Ground facts (from heraldhp-b, re-verified against code only if
## the control diverges; not re-quoted as current until reproduced)

- Spawn HP fixed: herald def hp [700, 900] -> placed Herald
  spawns at exactly 700/700 (spawnWorldMonster sets hp = maxHp =
  full.hp[0]; titanPlace adds {titan:true}, no hp override).
- Wall toll: havenRaidTick (src/js/havenGrowth.js) drafts the
  NEAREST monsters to Haven when 3+ living world monsters, 3,000+
  pantry kcal, >= 7 days since last raid, ~18% roll; if the
  palisade stands (havenTier >= 2) each drafted monster loses
  round(maxHp * 0.25) = 175 for the Herald, floored at 1 HP.
- The titan gate (titanWrapCombat, titans.js) refuses startCombat
  before any fight, so a refused TB attempt cannot damage the
  Herald; fieldFight has no titan gate.
- Canon docs: docs/MONSTER-WAVES.md mentions "heralds" only as
  wave-6 network hearts (a different sense of the word) and
  docs/CONTESTS.md has no herald/titan content; there is NO
  titan-specific canon doc. The operative Herald canon is
  src/data/titans.json plus src/js/titans.js, as heraldhp-b
  recorded. No canon doc is invented or rewritten here.

## Instrument (verbatim reuse, new dated files)

- Policy stack identical to heraldhp-b (so trajectories are
  comparable): withFullseatDiag(withSeatDrive(withWinDefer(TF
  leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1 FULLSEAT=1, plus HERALD=1 + MUSTER=1
  recorders verbatim (scripts/herald-instrument-20261030.js,
  scripts/policies/muster-diag.js — shared instruments, reused
  as-is, not copied).
- NEW scripts/heraldhp-instrument-20261101.js (HERALDHP=1):
  byte-identical code to scripts/heraldhp-instrument-20261031.js
  (v2, raid wraps included); only the header comment names the
  new arm/date.
- NEW scripts/heraldhp-sweep-20261101.js: heraldhp-b sweep stack
  with the instrument require and the output directory changed
  to evidence/2026-11-01/perseed-heraldhp2-a (leadfeast/); no
  other behavioral change.
- NEW scripts/heraldhp-analyze-20261101.js: heraldhp-b analyzer
  (deepest-row attribution, cause taxonomy, window math)
  unchanged, plus a censusSeed() function (see Census measures)
  and a census summary; default input/output paths changed to
  the 2026-11-01 corpus; trajectory-identity comparison now
  targets the heraldhp-b corpus (evidence/2026-10-31/
  perseed-heraldhp-b/leadfeast/) instead of mustercall-b's.
- NEW scripts/test-heraldhp2-20261101.js: proof on SYNTHETIC
  fixtures only (no band seeds): located detection, raid-draft
  counting, wall-loss summation, field-fight counting, frequency
  arithmetic, and the reused deepest-row/attribution helpers.

## Definitions (fixed now, never adjusted to flatter a result)

- LOCATED seed: at least one sleep-exit daily snapshot in the
  heraldhp ledger contains a herald entity, OR at least one
  heraldhp ledger row exists (covers brief placements that
  appear between snapshots, cf. heraldhp-b seed 85107's 2
  snapshots).
- RAID DRAFT on the Herald: a DEEPEST havenRaidTick ledger row
  in which a herald tag's raidBorn goes false -> true, OR a
  herald tag takes an HP delta < 0 in that row. (Repeat drafts
  of an already-raidBorn Herald are counted via their HP
  delta; a re-draft with no palisade and no HP change leaves
  a position-change row but is NOT counted as a draft — it is
  reported separately as a raid row touching the Herald.)
- WALL HP LOST (per seed): sum of -delta over DEEPEST
  havenRaidTick rows for herald tags (damage only; spawn/
  removal kinds excluded).
- FIELD FIGHTS vs the Herald: heraldhp fieldRows with
  mid === 'herald' (count, outcomes, sum of mDealt).
- TOTAL HERALD HP LOST (per seed): first-seen HP (first ledger
  spawn row, else first daily snapshot HP) minus last-seen HP
  (last daily snapshot or last ledger after-HP). Reported for
  context; the judged frequency uses WALL HP LOST only.
- REFUSAL WINDOW (control only): seed 85106's REFUSED herald
  attempts on current master, same definition as heraldhp-b.

## Primary metric

DRAFT-DAMAGE FREQUENCY = (located seeds with WALL HP LOST > 0)
  / (located seeds), on current master, over the census band
  below. Secondary, always reported alongside: draft frequency
  (located seeds with >= 1 RAID DRAFT / located seeds),
  field-fight frequency (located seeds with >= 1 herald field
  fight / located seeds), and the per-seed census table.

Frequency interpretation (reported, NOT a verdict gate):
  >= 50% of located seeds with draft damage -> wall-chipping
  reads as a normal titan tax; 2+ seeds but < 50% -> occasional;
  exactly 1 seed -> the one-seed story stands; 0 seeds -> no
  wall-chipping observed in this band (with the located count
  stated, never as "never happens").

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: instrumentErrors = 0 and heraldhp errors = 0 on all
  usable seeds; >= 8 located seeds in the census band; the
  control outcome (reproduced or not, see below) documented
  with numbers; the per-seed census table complete for every
  located seed; evidence states (a) the control comparison
  (85106 window numbers current vs heraldhp-b, plus trajectory
  keys vs the heraldhp-b corpus), (b) the census table
  (located?, drafts, wall HP lost, field fights, total lost),
  (c) the frequency verdict in the interpretation bands above,
  (d) wall numbers on the full screened band, (e) the ranked
  next step.
- DIAG-NO-GO: instrument errors > 0 with no read-only
  explanation, or the census table incomplete for a located
  seed, or a required section (a)-(e) missing.
- DOES-NOT-REPRODUCE (a finding, not a failure of the arm):
  seed 85106 on current master produces ZERO refused Herald
  attempts, or a zero/negative window drop, or a window whose
  HP readings do not descend. Reported with the numbers
  (attempts, entry HPs, trajectory keys vs heraldhp-b's
  corpus) — no hunt for a friendlier control seed, no
  substitution of another seed's window for 85106's. If the
  control does not reproduce, the census is still judged on
  its own terms and the verdict is DIAG-GO with a
  non-reproduction finding (if the census criteria are met),
  NOT DIAG-GO on the old window.
- INSUFFICIENT-DATA: fewer than 8 usable seeds, or fewer than
  8 located seeds after the full census band is screened.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot = seeds 85101-85108 (the heraldhp-b pilot, re-run on
current master — this doubles as the control seed's band
context). Pilot GO requires: ledger + herald + muster
instruments fire on all 8 pilot seeds with zero instrument
errors; per-seed JSONs valid (days > 0, census sorted,
heraldhp daily snapshots present, ledger rows well-formed);
AND an activity signal on >= 1 pilot seed (a Herald TB
attempt of any class, a Herald field fight, omen stage >= 2
reached, or a located Herald entity). Pilot size is NOT the
verdict: the census carries it. If the pilot fails on
instrument grounds, the verdict is DIAG-NO-GO. Pilot timing
is reported; if a single seed costs so much that the full
band cannot finish in this run, the run stops at pilot and
reports INSUFFICIENT-DATA with the timing evidence — the
band is never silently shrunk.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to heraldhp-b: the refusal
window ran to day 130 there, so a shorter cap would censor
window tails and late placements; the death-aware stop keeps
cost at the survival distribution.

## Seeds (exact literals)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107,
  85108.
- Census (pilot GO only): 85109-85164 (56 further seeds;
  64 seeds total). The band re-runs heraldhp-b's 16 seeds on
  current master (control comparability) and extends 48 fresh
  seeds (85117-85164) for the frequency question. No seed is
  added, dropped, or swapped mid-run for any reason except
  a crashed/unusable seed, which is reported as unusable with
  its error, never silently replaced.

## Policies (single-base measurement; no control leg by design)

Identical to heraldhp-b, every seed (see Instrument).
Policy-side only, no game change. Neutrality note: the HP
ledger wraps with pure reads only; the trajectory-identity
check against heraldhp-b's corpus (maxWave, national, table,
won, gameDays, endReason) is reported, and any divergence is
flagged with its seed, not silently dropped.

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival
(game days) on the FULL screened band (all seeds, not just
located ones — located-only wall numbers would mislead),
plus: Herald TB attempts by class and reason, Herald field
fights by outcome, wave-4 kills by channel (TB vs field)
where observable from the sweep outputs. Numbers that are
not observable from this arm's outputs are NOT reported —
never fabricated.

## Panel (§15)

Single-base DIAG measurement: no before/after comparison
exists in this arm, so scripts/balance-panel.js does not
apply. No panel compare is attached and none is fabricated.
Same declaration as heraldhp-b.

## Sense-testing (SENSE-TESTING LAW)

Read the transcript slices on the control seed and on any
NEW draft-damage seed (the herald instrument's refusal
slices + field-fight logs from this band's own capture).
Judge: does anything in the narration account for the
beast's wounds between sightings — a fight heard, a scar,
a report — or does the beast silently arrive more wounded
each time with no witness? Counts alone do not pass this
arm.

## Metric review

(To be filled at end of run. Doubts about the metric go
here and apply to the NEXT run, never to re-score this
one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement,
not a lever.)
