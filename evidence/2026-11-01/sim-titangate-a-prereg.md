# sim-titangate-a — preregistration (DIAG ONLY, zero src/js)

Run: fleshout-loop-a-20261101T1235Z, axis scale-onramp (converging, NOT
converged). Worker branch: sim-titangate-a. Base anchor at prereg time:
recorded in every judged JSON as `anchorCommit` (the JSON governs, not
this line, if the coordinator rebases before the sweep).

## Question

The vet2mfg arm (2026-11-01, same stack/band/horizon — see
sim-vet2mfg-a.md) found 36 refused wave-4 audiences, all herald: the
titan gate in `src/js/titans.js` ("no_solo_titans") returns null from
`startCombat` without creating a fight when the muster is incomplete,
and the herald paces onto the player's tile and is refused tick after
tick (29 refusals in 5 days on seed 95304). The refusal IS spoken
via `Game.say` ("This is not courage. This is arithmetic.") but left
NO footprint in vet2mfg's `sysSay` capture — because the gate calls
`Game.say` directly, not the `sysSay` wrapper (which itself delegates
to `say`). This arm captures `Game.say` directly and answers:

1. What fraction of refused audiences yield a captured `Game.say`
   line, and what do the lines say — one refusal reason or several?
2. Is refusal purely muster-completeness, or do other gates refuse too?
3. What happens after a refusal — re-attempted, fought, removed
   (leaves), lingering at run end, or run ends?
4. Does the seed-95312 wave-5 nielsen refusal pattern (147 refused
   starts, wave 5 never unlocked there) match the wave-4 herald pattern?
5. SENSE-TESTING: does at least one refusal transcript beat read as a
   sensible decision in the fiction?

## Stack (named exactly — numbers are NEVER compared across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) — the vet2mfg stack, reused
because this arm's reproduction leg REQUIRES the identical stack: same
substrate, same band, same horizon must reproduce vet2mfg's refusal
counts exactly if the new instrument is neutral.

Recorders, all REUSED UNMODIFIED: `scripts/policies/fullseat-diag.js`
(`FULLSEAT=1`), `scripts/policies/wavegate-diag.js` (`WAVEGATE=1`),
`scripts/policies/vet2-diag.js` (`VET2=1`),
`scripts/policies/vet2mfg-diag.js` (`VET2MFG=1`) — for unlock day,
end fields, and end snapshots only. No existing policy file edited.

New instrument files only (this arm; non-overlapping with the
dawnblock arm's files):
- `scripts/titangate-a-sweep.js` — sweep driver + sweep-side wrappers.
- `scripts/titangate-a-analyze.js` — analyzer (per-seed + pooled).
- `scripts/test-titangate-a.js` — proof test (synthetic + corpus legs).
- `scripts/titangate-det-compare.js` — ON/OFF end-field comparison
  (small; mirrors the vet2mfg det-compare shape).
- The vet2mfg splitter `scripts/vet2mfg-split.js` is REUSED UNMODIFIED
  (it is seed-agnostic: it splits any stdout JSONL with a `seed`
  field). No new splitter is written.

Sweep-side wrappers (installed after loadGame+setupGame, removed after
each run; pure observation — call through with identical arguments
and return values, never mutate game state, never draw RNG):
- `Game.say`: records every call's day + text when (a) the text
  matches a refusal needle (`does not notice you`, `This is not
  courage`, `allied blades`, `sound the call`, `muster`), or (b) the
  call happens inside a `startCombat` call (tagged with that call's
  sequence — this is the exact refusal→line join, and it catches
  campaign-gate reasons of unknown wording too). A 12-line ring
  buffer of ALL say lines is kept in memory only; on the FIRST
  refusal of each kind per seed it is dumped into `refusalBeats`
  (the sense-test transcript). Wrapping `say` — not `sysSay` — is
  the whole point: `say` is upstream of `sysSay`, and `emit` dedupes
  consecutive identical lines, so the wrapper sees every spoken
  refusal even when `emit` drops a repeat. The wrapper writes
  NOTHING to game state (sweep-local arrays only).
- `startCombat`: same amended shape as vet2mfg (refusal read from
  the RETURN VALUE null/undefined, plus the live-fight entry check,
  plus a throw capture rethrowing the original error). Each refused
  start records: kind (see below), day, monster wave/type, muster
  snapshot at refusal time (muster allies count, haven count,
  need from the titan def), the `state.titans.outcomes` entry the
  gate appended if any (gate `muster`/`campaign` + have/need
  detail — a pure read of the gate's own record, used as a
  cross-check, never as the definition), the say lines spoken
  during the call, and the world-monster presence of that id at
  refusal time (count/tiles/hp, read-only). Non-refused starts
  advance `fightSeq` for the tbEnd join, exactly as vet2mfg.
- `tbEnd`, `resolveWildMonsterEncounter`, `resolvePatrol`,
  `aidFight`, `fieldFight`: minimal fight records (channel, day,
  type, wave, outcome) — needed ONLY to classify what happens
  after a refusal (fought vs not). Same reentrancy guards as
  vet2mfg (router/aid double-log suppression).
- `removeWorldMonster`: removal records (day, type, wave) — needed
  ONLY to classify leaves vs lingering.
- Every recorded event carries a sweep-global sequence number
  (`eseq`), so "after the last refusal" is an ordering fact, not a
  same-day guess.
- At run end: final `state.titans` summary (outcomes array copy,
  musters raw counts, slain flags), final world-monster types,
  wavegate rows (unlock day), and the vet2mfg end fields
  (maxWave, national, table, won, days, gameDays, endReason,
  endScaleRank, endSnap).

No src/js change. No gate threshold moved. No policy file edited.

## Definitions (fixed before sims)

- Refused audience: a `startCombat` call that creates no fight
  (entry-refused: a fight already live; return-null: `orig` returned
  null/undefined; threw: `orig` threw).
- Kind: `herald` if mid is `herald`; else the titan id itself
  (`nielsen`, `finale`, `the_network`) if `Game.isTitan(mid)`; else
  `other`.
- Titan-gate refusal: a refused audience with a titan kind that is
  NOT entry-refused (i.e. the gate itself answered: return-null or
  threw). Entry-refused audiences are NOT gate audiences — the
  gate never ran because a fight was already live — and they speak
  no refusal line by construction, so they are classified (kind +
  next) but EXCLUDED from the say-coverage denominator. Non-titan
  return-nulls are classified as `other` with reason `unknown`
  (the instrument records refusal, not reason, for non-titans) and
  likewise excluded from the titan-gate coverage denominator.
  Both exclusions are declared here, before sims, not discovered
  after seeing coverage.
- Muster completeness (titan-gate refusals only): `incomplete`
  (have < need), `complete-but-refused` (have >= need yet refused —
  the campaign-gate shape), `no-muster` (no muster entry at refusal
  time), from the outcomes-detail have/need when present, else the
  muster snapshot; `unclassified` if neither source yields have/need.
- What happens next, per (seed, mid) refusal streak (after the LAST
  refusal, by eseq): `fought` (a fight/tbEnd for that mid after),
  else `removed` (a removal for that mid after, no fight after),
  else `lingering` (mid present in final world monsters), else
  `run-ended` (absent at end, no fight/removal after). Flags
  reported alongside, never folded into the primary: `reattempted`
  (streak length > 1), `muster-complete-at-end` (final muster
  alive-approx >= need; approximation documented in the analyzer —
  unique ally keys + unique haven vids, since the gate's exact
  counter is internal), `slain-at-end`.
- Say coverage: titan-gate refusals with >= 1 captured say line
  spoken during the refused call, divided by all titan-gate
  refusals. The distinct refusal line texts are reported verbatim
  (normalized only for have/need numbers when counting distinct
  reasons).

## Band and horizon (reused exactly from vet2mfg)

Band: 16 seeds 95301–95308 + 95311–95318. This is a deliberate REUSE,
not fresh seeds: the reproduction leg requires the identical band.
Horizon: `DAYS=180`, death-aware (runDays ends dead villages early).
No pilot/confirm split: this is a census of a known phenomenon on a
known band, and the instrument smoke test (below) runs on scratch
output first — a single seed to /tmp, never judged, never split into
evidence — before the judged sweep.

## Falsifiable hypotheses (judged, not just described)

- H1 (capture): >= 90% of titan-gate refusals carry a captured
  `Game.say` line, and the muster-gate line is a single text
  ("This is not courage. This is arithmetic.", modulo have/need).
- H2 (purity): every herald refusal is muster-incomplete
  (have < need, gate `muster`); nielsen refusals include at least
  one non-muster gate (campaign) OR are likewise all muster — H2
  is falsified if herald shows a campaign gate or nielsen shows a
  different line text for the same gate.
- H3 (aftermath): after a refusal streak, the monster lingers or is
  re-attempted more often than it leaves — i.e. across (seed, mid)
  streaks, `lingering` + `fought` streaks outnumber `removed`
  streaks. Falsified if removals dominate.
- H4 (wave-5 preview): the 95312 nielsen pattern matches herald on
  all three axes — same gate (`muster`), same line shape, repeated
  re-attempts while pacing — rather than a different gate or a
  one-shot refusal.

## Pre-registered GO bar (judge exactly against this, no re-scoring)

DIAG-GO iff ALL of:
1. 16 seeds, each complete (refusal records + end fields present,
   `captureErrs` 0 on every judged seed).
2. Say coverage >= 90% over titan-gate refusals (definition above),
   with every distinct refusal line text reported.
3. 100% of refused audiences classified: every refused record has a
   kind, a muster-completeness class (or `n/a-entry` / `n/a-other`
   for the declared exclusions), and its streak has a next class
   from {fought, removed, lingering, run-ended} — zero unclassified.
4. Reproduction leg: herald refused total on the band == 36 AND
   seed-95312 nielsen refused total == 147 (vet2mfg's judged
   numbers, same stack/band/horizon). Any deviation is an
   instrument-neutrality failure, not a rounding difference.
5. Recorder-neutrality leg: TITANGATE ON vs OFF end fields
   identical (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 2 seeds (95304, 95308 — the vet2mfg
   leg seeds).
6. Determinism leg: one judged seed re-run to a scratch dir is
   byte-identical to its judged JSON.
7. Proof test `scripts/test-titangate-a.js` green (synthetic
   classifier/join cases + corpus legs re-deriving the verdict
   gates from the judged corpus).
8. Sense-test: at least one refusal beat (ring buffer + refusal
   line) read for meaning in the evidence file.

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base DIAG
census, no before/after comparison exists in this arm; none
fabricated.

## Amendment 1 (appended BEFORE any judged sims, from a scratch smoke run)

A single-seed smoke run (95304, output to scratch only, never judged,
never split into evidence) confirmed the instrument end to end: 29
herald gate refusals, each with exactly 1 captured say line (the
arithmetic line, have 0 / need 10), `captureErrs` 0, and the gate's
own outcomes record reconciling 29 refused of 29. It also surfaced
one refinement, fixed here before any judged data exists:

Non-titan return-nulls are NOT always gate refusals. On 95304 the
moderator (day 129) and murkcap (day 149) return-null starts each
speak a full fight-dissolve narration ("It comes apart — no one in
reach, no one chasing") AND resolve with a joined tbEnd (`routed`)
the same day — a fight that began and dissolved, not a refused
audience. The return-null heuristic is valid for titans (herald
refusals carry no tbEnd), but over-counts for non-titans. Handling:
the analyzer reports `dissolvedSelf` per streak (tbEnds joined to
refused starts) and EXCLUDES dissolved self-resolutions from
`foughtAfter`, so a streak's next-class reflects a genuinely later
event. The reproduction leg is UNCHANGED (it counts by the tbStarts
definition, identical to vet2mfg's counting). The GO bar is
unchanged — this amendment only sharpens what "what happens next"
means for `other` streaks.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance: (a) the
final-muster alive count is an approximation (the gate's exact
counter is internal to titans.js); refusal-time have/need from the
outcomes detail is exact and governs completeness. (b) "Removed"
means a `removeWorldMonster` call for that type after the last
refusal — a monster removed for unrelated reasons (e.g. wave
cleanup) reads the same as "leaves"; the evidence file must say
which removals, if any, look like cleanup vs departure. (c) The
say wrapper records calls, not displayed lines: `emit` may dedupe
a repeat for display, so "captured line" means "spoken by the
gate", not "shown twice on screen".
