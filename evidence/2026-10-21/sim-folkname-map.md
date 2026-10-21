# sim-folkname-map — closing the folk-name killer-wave gap (2026-10-21)

Arm: sim-folkname-map, flesh-out loop run fleshout-20261021T0015Z, axis scale-onramp.
Backlog item: sim-findings.md line 716 (claimed by this arm).

## PRE-REGISTRATION

- Question: can folk-name death causes (village-authored monster names like
  'The Big Bastard') join the killer-wave map? The windowseat analyzer's
  static monsters.json lookup can't — folk names live only in
  `state.codex.monsters[mid].villageName` (game.js:21509), never in data.
  (evidence/2026-10-20/sim-windowseat.md metric doubts §14.2)
- Primary metric: the RED->GREEN fixture pair + the DET gate.
- GO: (a) RED — with no per-seed folk-name map (the old instrument's
  corpus shape) 'The Big Bastard' yields nameToWave null, isCombatish
  false, class 'other:The Big Bastard', killerWave null; (b) GREEN — the
  same death record with the recorded map joins: killerMid 'gallowdeer',
  killerWave 1, killerVia 'folk-name-map', class expedition; (c) DET —
  paired runs, instrument-on vs instrument-off, byte-identical
  trajectories (the map is a pure post-last-hash read).
- NO-GO: any RED fixture passing, any GREEN fixture failing, any DET
  pair diverging, or the per-seed corpus missing the folkNameMap field.
- Horizon: 30d (naming needs codex entries; the join is structural).
  Seeds: 66001. Policies: leadfeast, belongfeast (the windowseat substrate
  pair). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
  WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1
  (the 2026-10-20 env-trap lesson — the probe's substrate guard runs at
  require time, so the test documents this exact env).

## THE GAP

Death causes are stamped with the name the village used at death time.
For monsters, `Game.monsterDisplayName(mid)` (game.js:21147) resolves:
village-agreed name (codex `villageName`) > post-System true name >
pre-System strange descriptor. The static analyzer map covered true
names, ids, and descriptors — but NOT village names. Villagers generate
them per run (`generateMonsterName`, game.js:21453): curated lists
('Headlight Harry', 'The Bright Bastard') or temperament pools ('The
Big Bastard' = bold pool `The ${cap(t)} Bastard`, t from nameTraits).
A 60d leadfeast diagnostic (seed 66001) found 6 folk-named monsters at
run end — this is a first-class cause vocabulary, not an edge case.

## WHAT CHANGED (instrument-only — zero src/js, zero game-logic changes)

1. `scripts/windowseat-instrument-20261020.js` — new exported pure read
   `folkNameMap(Game, t)`: end-of-run capture of
   `state.codex.monsters` -> `[{mid, folkName, display}]` (villageName is
   write-once, entries persist, so end-of-run holds every name used).
   No wrap installed, zero state writes, zero RNG draws. Guarded;
   errors report into `t.instrumentErrors`, never throw.
2. `scripts/probe-windowseat-20261020.js` — `runOne` persists
   `folkNameMap` into the per-seed corpus (after the last daily hash, so
   the DET-pinned trajectory can't move; bare mode records `[]`).
3. `scripts/analyze-windowseat-20261020.js` — `buildFolkMaps(rec)` /
   `folkToMidWave` (folk-name -> mid -> wave via a new static
   MID2WAVE); `isCombatish`/`classifyWall` take an optional folkSet;
   `joinKillerWave` tries the folk map FIRST (run truth beats static
   truth — a village can folk-name a monster after a static roster name),
   then static name lookup, then the fight-start fallback. Recs without
   the map (the whole 2026-10-20 corpus) behave exactly as before.
4. `scripts/test-folkname-map-20261021.js` — the proof (below).

## PROOF (scripts/test-folkname-map-20261021.js — GO met)

- RED (4/4): static lookup misses 'The Big Bastard'; not combatish;
  classifies `other:The Big Bastard`; `joinKillerWave` leaves
  killerWave/killerMid/killerVia null on the old corpus shape.
- GREEN (7/7): the recorded map indexes ('the big bastard' ->
  gallowdeer); `folkToMidWave` -> {mid:'gallowdeer', wave:1};
  combatish via the map; class expedition/field-combat; join sets
  killerMid 'gallowdeer', killerWave 1, killerVia 'folk-name-map';
  folk map beats a coinciding static name; old-corpus recs behave
  identically (no regression).
- UNIT (5/5): extraction shape, skip-junk, null-codex -> [], missing
  monsterDisplayName degrades to display:null, never throws on hostile
  shapes.
- PERSISTENCE (2/2): real 30d runs on both policies carry the field in
  the corpus — leadfeast s66001: 6 codex entries, 4 folk-named
  ('Ugly-Eyes' -> lockpick_raccoon, ...); belongfeast s66001: 6 entries,
  5 folk-named ('Big Loud' -> hushwolf, ...). /tmp round-trip through
  `joinKillerWave` clean.
- DET (2/2): paired 30d runs, both policies, bare vs census — hash
  streams byte-identical (bare-stable, census-stable, identical).

PROOF: 20 pass, 0 fail. Verdict: GO — the gap is closed.

## HOW FUTURE TAXONOMIES SHOULD USE THE MAP

- Always read `rec.folkNameMap` first and pass its set into
  `isCombatish`/`classifyWall`; call `joinKillerWave` (it already does
  both). The map is per-seed by construction — never merge maps across
  seeds (folk names are run-specific).
- Precedence is folk-map > static lookup > fight-start fallback. This is
  deliberate: the village's own name for the killer is the ground truth
  of that run's fiction, even when it coincides with a static roster
  name.
- The map is end-of-run truth: display/folkName reflect the village's
  FINAL naming. If a future taxonomy needs time-indexed naming (who
  called it what on day N), the instrument would need a wrap on
  `monsterNamingCheck` instead — out of scope for this arm.
- `display` is recorded alongside `folkName` for debugging (the resolved
  name the village used at run end); the join key is `folkName`.

## METRIC REVIEW (§14)

- The pre-registered metric (RED->GREEN fixtures + DET) fit the
  question exactly — instrument gap, structural join, no behavioral
  claim. No revision proposed.
- One honest note: the 30d persistence runs prove the field travels in
  the corpus on the windowseat substrate, but they do NOT re-measure
  the windowseat taxonomy's killer-wave coverage (that was the parent
  arm's DIAG-GO corpus, which had no folk-name deaths in its 22 window
  deaths — the gap was prospective). The next arm that re-runs the
  windowseat sweep should diff `killerVia='folk-name-map'` coverage
  against the 2026-10-20 corpus as a free check.
- Wall numbers were not re-measured by this arm (30d smoke only):
  leadfeast s66001 32d survived; belongfeast s66001 32d survived.
  The scale wall stands — this arm was instrument work, not a lever.
