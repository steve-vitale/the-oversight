# sim-teleflag-b — harness tele player-flag repair (loop B, 2026-10-16)

Run: fleshout-loop-b-20261016T0753Z, ARM 3 of 3 (sim-teleflag-b). Axis: food-economy
(measurement infrastructure serving the axis). Fixes sim-findings #400/#403, plus
finding #402's corpses.js remainder (1 literal `<redacted>` comment token).

## Pre-registration (binding, MEASUREMENT §§9–12, 14)

- PRIMARY: 100% of scholar deaths carry player:true in harness teles on a 16-run
  census re-run reusing the existing instrument scripts/succdeath-20261016.js —
  same 16 seeds [307,418,529,640,751,862,973,84] x {leadfeast,belongfeast}, 180d
  death-aware, pre-seat courtship substrate
  (FEASTSCALE_R13=1+TRIBFLOOR=1+SUCCGRACE=1+RAIDDENSITY=1+WINPURSUIT=1+WINDEFER=1,
  SEATDRIVE=0 explicit). GO: flagged/scholarDeaths == 1.0.
  The known belongfeast-s529 instance (Olivia Bennett, d138 — 0630Z census keyed
  'person:combat') must be verified flipped to 'player:combat'.
- DET-GATE (16/16 trajectory-identical vs the 0630Z control on identical seeds):
  successions 143, fast 37, cause classes combat 32/other 5, wall national 13/16,
  table 15/16, wins 0/16, exiled 0/16, wave4 15/16, wave5 9/16, per-seed
  days/endReason/nSuccessions/nFast identical. Death counts must match exactly
  (no double-death).
- Guardrails: no new death mode; SMOKE green before sweep spend.
- Horizon: 180d death-aware (dead villages stop simulating, +10d tail max).
- Policies: the pre-seat courtship substrate (seatdrive leadseat/belongseat).

## The bug

On belongfeast-s529 (0630Z census), a villager-death path registered the scholar's
death (Olivia Bennett, d138, cause 'combat', kind 'person') BEFORE playerDeath did.
corpses.js's double-death guard then no-op'd playerDeath's registerDeath call, so
the death tele never carried player:true — the harness keyed 'person:combat' while
the instrument's registerDeath hook recorded the player:true opts. Same death,
same cause; census attribution unaffected — but harness `player:` death counts
undercount by this mechanism whenever a villager-death path wins the race.

A second, compounding defect: the sim harness's live death capture
(scripts/sim-harness.js runDays) SNAPSHOTS the tele fields at fire time. Any
in-engine repair of the tele record after the fire would be invisible to
samples.deaths — so a corpses.js-only fix could not satisfy the PRIMARY.

## The fix (two parts, both telemetry-only, zero gameplay effect)

1. src/js/corpses.js registerDeath — on the double-death guard's no-op path, when
   opts.player is true, repair the already-fired death tele in place (player:true)
   BEFORE the no-op return. Still exactly one registration, one corpse, one
   fallen entry, one death tele — no double-counting. Comment cites #400/#403.
2. scripts/sim-harness.js runDays live death capture — read `player` LAZILY off the
   tele record (getter bound to the record) instead of snapshotting at fire time.
   day/kind/who/cause are still snapshotted (they never change after the fire).
   Behavior-neutral for every consumer: `d.player` reads identically in all cases
   where no repair occurs.

Secondary (separate commit, done FIRST): src/js/corpses.js held 1 literal
`<redacted>` token in comment bytes (finding #402 remainder; byte-verified with
node charCodes before/after — the DISPLAY layer also redacts "bearer <word>" in
tool output, so only byte checks count). Replaced with a faithful English reading
of the comment's intent (`// the village told the new Bearer they'd brought the
body home`), comment-only. Zero behavior change. The other 10 remainder instances
(relay-dialogue.js x7, nomad-drive.js x5, game.js x2, convo-scene.js/convo-wants.js/
nomad.js/app.js/journal.js x1 each) belong to other workers this run — untouched.

## Proof

scripts/test-teleflag-20261016.js:
- PART A fixtures (live engine): A1 reproduces the s529 race exactly (villager
  path registers first as kind 'person', then the REAL playerDeath runs and its
  registerDeath no-ops) — asserts tele player:true AND 1 tele AND 1 corpse AND
  1 fallen AND mantle passed AND the harness-style lazy capture sees player:true.
  A2 (playerDeath first, duplicate after): 1 tele player:true, 1 corpse, 1 fallen.
  A3 (non-player double registration): 1 tele player:false, 1 corpse — unchanged.
- REAL RED (patch dance, pre-fix code): A1's two player:true assertions FAIL
  (tele player=false, capture player=false) while all count assertions PASS —
  the test detects exactly the bug and nothing else.
- PART B det-gate (2 seeds x 60d, pristine-HEAD control tree vs fixed tree):
  per-dawn state hashes byte-identical, death-tele streams identical with player
  masked, corpse/fallen counts identical, days identical; the only allowed delta
  is player:false->true flips (0 on these windows — no raced scholar death in
  60d; the flip itself is proven by A1).
- SMOKE=1 (fixture A1): GREEN before sweep spend.
- check.js --quick: 96 passed, 2 failed — the 2 failures are the PRE-EXISTING
  test-where-are-we-20261014.js failures (documented in sim-findings; fail
  identically on pristine HEAD, unrelated to this change).

## Census results

Runner: scripts/run-teleflag-20261016.js (per-seed JSONs in
evidence/2026-10-16/perseed-teleflag/; the 0630Z control JSONs in
perseed-succdeath/ were NOT overwritten). 16/16 runs completed.

PRIMARY — 131/131 scholar deaths carry player:true in harness teles
(rate 1.000, GO met). 0 unflagged, 0 multi-tele (no double-counted death
teles). 0 instrument errors.

| run | days | succ | fast | teleflag |
|-----|------|------|------|----------|
| leadfeast-s307 | 148 | 9 | 2 | 8/8 |
| leadfeast-s418 | 141 | 13 | 4 | 13/13 |
| leadfeast-s529 | 149 | 9 | 1 | 8/8 |
| leadfeast-s640 | 88 | 11 | 4 | 10/10 |
| leadfeast-s751 | 99 | 1 | 0 | 0/0 |
| leadfeast-s862 | 132 | 9 | 1 | 8/8 |
| leadfeast-s973 | 149 | 7 | 1 | 6/6 |
| leadfeast-s84 | 133 | 12 | 3 | 12/12 |
| belongfeast-s307 | 93 | 9 | 3 | 8/8 |
| belongfeast-s418 | 141 | 10 | 2 | 9/9 |
| belongfeast-s529 | 160 | 9 | 4 | 9/9 |
| belongfeast-s640 | 135 | 11 | 3 | 11/11 |
| belongfeast-s751 | 178 | 11 | 2 | 10/10 |
| belongfeast-s862 | 117 | 6 | 2 | 5/5 |
| belongfeast-s973 | 155 | 8 | 2 | 7/7 |
| belongfeast-s84 | 132 | 8 | 3 | 7/7 |

DET-GATE (16/16 vs 0630Z control, identical seeds): successions 143/143,
fast 37/37, per-seed days/endReason/nSuccessions/nFast/national/table/wins/
exiled/maxWave ALL identical — zero mismatches across 16 seeds. Death counts
match exactly: no double-death, no new death mode.

Wall (report-only, identical to 0630Z): national 13/16, table 15/16, wins 0/16,
exiled 0/16, wave4 15/16, wave5 9/16, medianSurvival 141d, maxSurvival 178d.

The known instance: belongfeast-s529's death keying went from
'player:combat':8 + 'person:combat':1 (0630Z) to 'player:combat':9 with no
'person:combat' — Olivia Bennett's d138 death now carries player:true.

TELEMETRY DEVIATION CHECK: `telemetry-check.js --baseline .../scale-wall.json`
fires one LOUD line ("wins disappeared: baseline 16 -> current 0") — it fires
IDENTICALLY against the 0630Z control JSONs, so it is a pre-existing substrate
mismatch (baseline is the winning seatdrive-composed substrate; both censuses
are pre-seat, wins 0/16 by design), not a deviation from this change.

## Metric review

1. (Proposed revision for the NEXT census, not this one.) The teleflag join keys
   scholar deaths off the instrument's player:true registerDeath-hook records.
   If a future engine path ever kills the scholar WITHOUT playerDeath (no
   player:true call), such a death would be invisible to the join — the join
   measures "deaths the engine flagged player" not "deaths of bearers". For this
   census the mantle instrument confirms every succession exit had a player-death
   record, so the join is complete; a future revision could cross-check against
   the succession exit list instead.
2. The det-gate compares per-seed days/endReason/nSuccessions/nFast/wall keys
   against the stored 0630Z control JSONs rather than re-running control sims.
   Valid because the fix is telemetry-only by construction (no game-state writes
   outside the tele record) and the per-dawn state-hash gate (PART B) proves
   trajectory identity directly; re-running 16 control sims would measure
   nothing the hashes don't already prove.
3. samples.deaths entries now carry a lazy `player` getter bound to the tele
   record. Any consumer that deep-freezes, structured-clones, or re-keys entries
   before the repair fires would still see the pre-repair value — no current
   consumer does (all read post-run). If a future instrument needs the flag
   mid-run before the racing call lands, it should read state.telemetry, not
   samples.

## Village assessment

The villages live and die exactly as in the 0630Z census — same 143
successions, same 37 fast deaths, same wall numbers, same per-seed days. The
fix changed nothing about the game; it repaired the lens. What the census
could previously only attribute through the instrument hook (the s529 9th
death), the harness teles now say directly: 131/131 scholar deaths flagged.
No village looked different, no one thrived or died differently — the blank
filled was in the measurement, and it is now filled.

## Blanks filled

- #400/#403 FIXED: harness tele player-flag undercount on double-registered
  scholar deaths (corpses.js teleflag repair + sim-harness lazy player).
- #402 corpses.js remainder FIXED (comment-only).
- Commits: a0d58c68 (redaction-comment fix), [teleflag commit] (teleflag fix +
  proof + runner + evidence). Merged locally: NO — worker does not merge;
  coordinator lands.
