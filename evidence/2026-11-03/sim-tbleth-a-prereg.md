# Turn-based lethality decomposition — prereg (Loop A, run fleshout-20261103T1945Z, arm sim-tbleth-a)

Committed BEFORE any judged sim. DIAG-ONLY arm: zero src/js, zero
game-code change. This arm DECOMPOSES why turn-based (TB) wave-4
fights lose; it does not fix them — any fix touches TB engine
code and belongs to a follow-up arm with its own prereg.

## Grounding (read, not assumed)

- `evidence/2026-11-03/sim-scale-onramp-round-1819.md` (coordinator
  evidence) and `evidence/2026-11-03/sim-w4convert-a.md` + its
  prereg. Current-anchor facts at master 77ff4a807, seeds
  99101–99108, competent verbatim, 140d death-aware: 35 spawns /
  23 TB starts / 5 field fights / 2 kills / 8 villages lost /
  median 90d; TB split 2/23 kills, solo 0/15, +ally 2/13; all 28
  leads armed AND armored.
- Canon: `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave law,
  readiness: veterans = living roster members with a wave-(w-1)+
  kill; wave-5 demand veterans 2) + `docs/BALANCING.md` (numbers:
  wave-4 damage 35–95, HP 850–1500, pierce 0.2–0.5 per
  MONSTER-WAVES.md §readiness table context). No canon doc covers
  a TB damage-ledger decomposition; the definitions below are
  this arm's measurement definitions, not canon.
- Scope fence (binding): field fights are win-fielddmg territory
  (landed d8f334da8) — DO NOT touch field-fight code or
  measurement; this arm is TURN-BASED fights only. No ally-join
  code, no gear-wearing code, no gate/price/readyDemand changes,
  no veteran-counting changes. ZERO src/js changes in this arm
  (scripts + evidence only).

## Calibration gate (run BEFORE this prereg was committed)

The UNMODIFIED w4convert census driver was rerun on seed 99107
(the 2-kill seed) at this worktree anchor (HEAD 77ff4a807) with
RUN=tbleth-calib, output
`evidence/2026-11-03/perseed-w4convert-a/w4convert-s99107-tbleth-calib.json`:

- Result: days 80, end village-lost, spawnsW4 3, tbCalls 2,
  tbStarted 2, fieldsW4 0, killsW4 2, unlinked 0, orphans 0,
  errors 0.
- Verdict: MATCHES the 1819 numbers for that seed exactly
  (3 spawns / 2 TB / 0 field / 2 kills / 80d lost). The
  `identity: DIVERGED` / `censusIdentity: DIVERGED` flags in
  that run are vs the OLD vetbar pilot/census files — the known
  anchor move already proven by w4convert, not a new divergence.
- Consequence: the baseline for this arm is the CURRENT anchor
  (1819 numbers), never vetbar's old 70 exposures. If the judged
  leg's totals diverge from 1819, that divergence is reported
  with its cause (instrument perturbation vs base move), never
  silently adjusted.

## Policy, seeds, horizon (fixed now)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
  default env. No policy variant.
- Seeds: 99101–99108 — the SAME band as 1819/w4convert.
- Horizon: 140 days, death-aware (dead villages stop simulating;
  never a fixed 200d).

## Instrument (scripts only)

`scripts/tbleth-instrument-20261103.js` + driver
`scripts/tbleth-driver-20261103.js` + analyzer
`scripts/tbleth-analyze-20261103.js`, following the w4convert
instrument pattern: identity captured at fight START, RNG-neutral
call-through wraps, exact kill linkage, UNRECORDED where the
engine records nothing — never guessed.

Wraps (all RNG-neutral, call-through, errors into
instrumentErrors, never silent):
- `startCombat` / `tbEnd` — same identity-at-start / pre-call
  end-snapshot pattern as w4convert (TB exposures only; field
  fights are NOT exposures here — a fieldFight call during the
  run is counted in wrapCounts only, and any wave-4+ field
  exposure is reported as `field-skipped` in the reconciliation
  note, never decomposed).
- `tbDamage` — the single incoming-damage integration point
  (game.js: returns the ACTUAL damage applied). Per hit, while a
  TB exposure is open, record: fight round (`f.round` at hit
  time), target key/kind/vid/mid, sourceKey + sourceLabel
  verbatim, requested dmg, returned landed dmg, target HP
  before/after (hpDelta = the damage that stuck, after armor,
  brace, holds, and redirects). Hits outside an open TB exposure
  are counted, not recorded. Recursive inner calls (static arc,
  intercept redirect) record as their own hits on their own
  targets; the ledger reconciles on hpDelta sums, not on
  returned values, so redirects cannot double-count.
- `recordWaveKill` / `recordPyrrhicKill` — exact linkage by open
  TB fight identity, as w4convert. A kill row with no open TB
  exposure is `unlinked`, never force-joined.
- `say` / `sysSay` — transcript capture while a TB exposure is
  open (lines stored per exposure, in order, for sense-testing;
  capped at 400 lines per exposure with an overflow flag —
  transcript volume is evidence, not an error).
- `tbPlayerShout` / `tbPlayerOfferFood` / `useAbility` — trick /
  ability USE counts while a TB exposure is open (call counts +
  first/last round). A use that throws or is refused still
  counts as an attempted use only if the wrapped call records
  it; refusals are reported as attempts, never as successes.
- `spawnWorldMonster` — wave-4 spawn census only (reconciliation
  class, as w4convert).

Per wave-4+ TB exposure, record:
- monster kind(s) at start (all monster fighters, mid + maxHp +
  hp at start), party size at start (human fighters at start),
  lead + ally HP / armorP / weapon at start (lead = scholar
  fighter; allies = other human fighters; gear read via the
  w4convert `gearOf` rule, READ-ONLY),
- damage dealt per round by leader / ally / ability-or-trick /
  other (classification rule, fixed now — see below),
- damage taken per round by leader / ally (hpDelta on human
  fighters, by target),
- monster HP remaining at end (per monster fighter, pre-call
  tbEnd snapshot), rounds survived (`f.round` at tbEnd
  pre-call; also distinct rounds with at least one recorded hit),
- outcome: `kill` / `fighter-died` / `fled` / `other` (see
  classes below), flee round + flee flags if recorded,
- trick known for the lead monster kind at start
  (`monsterCounterKnown`, boolean, UNRECORDED if the function
  is absent), tricks USED (shout/offerFood call counts during
  the fight), abilities used (useAbility call ids during the
  fight, if readable),
- food/fullness at start if readable (scholar food state via
  the state fields the engine exposes; UNRECORDED if no such
  field reads cleanly — never guessed from a proxy),
- transcript lines (capped, see above).

Damage-source classification (fixed now, applied to hits ON
monsters only):
- `leader`: sourceKey `p`/`player`, or sourceKey null with
  sourceLabel `you` (the player-strike convention, same rule as
  the engine's own `_tbKilledBy` stamp).
- `ally`: sourceKey is a villager/ally fighter key in the open
  fight (resolved at hit time from the live fighter list).
- `ability-or-trick`: sourceKey is null/other AND sourceLabel
  is not `you` and the hit arrives inside a `useAbility` /
  shout / offerFood call stack — recorded via a stack-depth
  flag set by those wraps (the wrap sets a counter on entry,
  clears on exit; a tbDamage hit while the counter > 0 is
  ability-or-trick). Where the engine routes ability damage
  through the leader's strike path instead, it classifies as
  leader — that routing is reported as a classification caveat,
  not re-labeled post hoc.
- `other`: everything else (monster-on-monster, environmental,
  unresolvable). Reported verbatim with its sourceLabel so the
  residual is auditable, never folded into leader/ally.

Ledger reconciliation (fixed now, per exposure, wave-4
monsters only):
- For each wave-4 monster fighter seen: startHp (first-seen HP
  in the fight; joiners mid-fight get their join HP as startHp
  and are flagged `joined-mid-fight`) + hpDelta dealt to it
  (negative sums) must equal endHp (tbEnd pre-call snapshot),
  up to healing/other-HP-change gaps. Gap = endHp − (startHp +
  dealtSum) where dealtSum is negative; a nonzero gap is
  REPORTED with its sign and size, and explained only if the
  transcript/hits show a cause (heal, hold, maxHp change) —
  never forced to zero. The exposure ledger is `reconciled`
  iff every wave-4 monster fighter's gap is 0 OR every nonzero
  gap is explained from recorded events; otherwise the exposure
  is `ledger-open` and counts against DIAG-GO (see verdict).
- Fighters that disappear without a tbEnd snapshot (dissolved
  fights) are `tb-unended`, not reconciled.

Spawns never fought: recorded as a reconciliation class, as
w4convert did — spawn rows with no exposure sharing the spawn
day+kind are listed per seed with fate UNRECORDED (the engine
records no spawn-fate event).

## Exposure outcome classes (mutually exclusive, fixed now)

Turn-based (`tbEnd` result verbatim + pre-call snapshot):
- `kill`: tbEnd result `won` or `routed` AND at least one
  linked kill row for a wave-4 monster in this exposure.
- `fighter-died`: tbEnd result `lost` (scholar/lead dead at
  end) with no linked kill — includes pyrrhic cases ONLY as
  their own sub-flag: `lost` WITH a linked kill row is
  `pyrrhic` (a body dropped but the scholar died), never
  folded into `kill` or `fighter-died`.
- `fled`: tbEnd result `fled` with no linked kill. Flee round
  = `f.round` at tbEnd pre-call; flee flags (player fled /
  villager fled) recorded from the pre-call snapshot where
  readable; flee REASON is UNRECORDED unless the engine stores
  one on the fight object (checked, not invented).
- `tb-other`: any other tbEnd result verbatim, no linked kill.
- `tb-unended`: a started fight with no tbEnd observed by
  horizon end — named, counted, explained.

No `UNCLASSIFIED` bucket exists: an exposure whose outcome
cannot be read is an instrument error and breaks DIAG-GO.

## Primary metric (pre-registered, judge the arm on this)

Kills per TB exposure (linked killing exposures / TB
exposures), with the damage-ledger decomposition: for every TB
exposure, dealt-per-round by source class, taken-per-round by
target class, rounds survived, monster HP remaining at end,
and the ranked lethality-factor table (see evidence). The
primary metric is descriptive (this is a diagnostic); no rate
threshold is pre-registered as GO/NO-GO on the RATE itself —
inventing a "good" kill rate after seeing the data would
violate §14. The verdict below judges the DIAGNOSTIC.

## Verdict classes

- DIAG-GO iff: 0 instrument errors; 0 orphan TB ends; every TB
  exposure decomposed (or ≥20 if the band yields more — the
  1819 band yields 23 TB starts, so the binding bar is all of
  them); damage ledger reconciled on every exposure (gap 0 or
  gap explained from recorded events); every kill row linked
  or reported unlinked; a ranked factor table is produced;
  and the proof test passes (see below).
- DIAG-NO-GO otherwise: the evidence names the failing leg
  (instrument, reconciliation, classification, or ledger) and
  the run does not claim a decomposition it did not prove.
- No fix, no confirm, no game-code change in this run. The
  evidence names the single next blank precisely: which
  factor, which lever, which lane owns it.

## Proof test

`scripts/test-tbleth-20261103.js` proves, on fixtures plus a
live-harness smoke: (1) the instrument fires on a known TB
fight (wrap fire counts > 0, identity captured at start);
(2) a tbDamage hit records round, source class, requested /
  returned / hpDelta correctly on a fixture fight (including
  an armor-absorbed hit where hpDelta < requested);
(3) ledger reconciles on the fixture (startHp + dealt = endHp,
  gap 0); (4) classification completeness on fixtures (every
  fixture exposure lands in exactly one class, every fixture
  kill links exactly); (5) an unlinked kill row is reported
  unlinked, never force-joined; (6) a mid-fight joiner gets a
  join-HP start and a `joined-mid-fight` flag, not a false gap.

## Balanced panel (§15)

INAPPLICABLE to a pure diagnostic with no before/after change
— there is no candidate arm to compare, so no comparison is
fabricated. The binding check is the calibration gate above
plus the ledger reconciliation in the evidence.

## Hard limits (binding, honored)

- NO src/js changes at all. NO readyDemand, t4/t5, or plentyCap
  change. NO win-price or deed-gate change. NO wild-router
  ally-join code. NO field-fight damage/staying code or
  measurement. NO national-standing code. NO veteran-counting
  code. NO Loop B food-economy code. NO equipment/armor/weapon
  wearing code (read gear state only). No `[needs-eyes]` commit
  (diag only, no feel/combat/UI change).

## Metric review (pre-run doubts, for the NEXT run)

- A TB fight can contain several wave-4 monsters (pack); the
  exposure unit is the FIGHT. Per-monster ledgers are kept
  separately and summed for the exposure ledger, so a pack
  fight's gap is attributable per body, not smeared.
- Ability damage routed through the leader's strike path will
  classify as leader (see classification rule); if the
  ability-or-trick column comes out near-zero on the judged
  leg, that routing — not "abilities are never used" — is the
  first explanation to check, via the useAbility call counts
  recorded per exposure.
- Rounds survived reads `f.round` at tbEnd pre-call; the
  engine's round counter starts at 1 and increments on
  turnIdx wrap, so a fight ending in its opening round reads
  1 — reported as-is, never re-based to 0.
- Food/fullness at start may read UNRECORDED if the scholar
  food state has no clean single-field read; that is a
  reported gap in the instrument, not a reason to proxy it
  from pantry or feast flags.
