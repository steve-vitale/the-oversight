# journey-scale r50 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261028T1845Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion.
**Base:** master@cb30d8f98 at worktree creation (batch ship 3a5c49f49-20261028-232504).
**No src/js change planned at pre-register time:** measurement first
(r43–r49 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**TACKLE ALL context (2026-10-27 17:07):** the seven villager-rationality
items are pursued elsewhere (fixall arms live); this run does not claim them.

## Standing context (read before scoring)
- r49 (scale reference for this run): FULL PARITY with r48 on both pilots.
  - 85001: day 111, over=true, pop 0/0, pantry 0, rank regional,
    nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
    pilgrimages 5, firstCourt 98, leaguePool 965. Covenant trusts 24/19/14.
    Arena chain: 13 bearer deaths, day-111 die-out.
  - 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
    nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
    pilgrimages 8, firstCourt 141, leaguePool 32,822. Covenant trusts 64/70/56.
    Arena chain: 6 deaths, survived. Both seeds lesser seat, arc 4, wait
    voiced and priced. Full seat still unreached (w5 0 both).
- Net src/js drift since r49's PLAYED base (9e3c7f152..cb30d8f98), verified
  by diff before any seed ran: ONLY game.js arena-label work, label-only —
  sim-arenalabel-b (tbEnd lost deaths labeled by fight origin: wild vs
  arena) + sim-arenafallback-b (tbFightDeathCause names fallback origins:
  betrayal, table trial, coalition arena, stranger). The three mechanisms
  that landed and were reverted in the same window (fieldfeed, perceptform,
  shoutgate) leave ZERO residue in the game.js diff. build.js carries only
  the version stamp. Everything else is evidence/tooling/preregs plus ship
  bumps. This makes r50 a sharp test: any move beyond death-cause label
  lines must be pinned to a label change leaking into mechanics, or to
  neither — never blamed on a reverted mechanism without a
  first-divergence line.

## Leg questions (binding)
1. **SCALE-PARITY-R50:** pilot seeds 85001 + 85003, r49 driver with
   labels/EVIDIR only → new driver `scripts/journey-scale-r50-20261028.js`
   (diff-verified: r49→r50 substitutions only) + compare
   `scripts/journey-scale-r50-compare.js` repointed at the r49 reference
   (evidence/2026-10-28/journey-scale-r49, stripping driver labels,
   worktree paths, ISO dates). Policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop.
   Verdict rule: PARITY-EXCEPT-LABELS iff (a) census scalars + trust
   JSONs + transcripts are identical to r49's for both seeds after
   stripping, AND (b) every capture/beat/moment diff is a death-cause
   label line attributable to arenalabel/arenafallback (arena→wild /
   betrayal / table trial / coalition arena / stranger wording on a
   death record). If (a) fails, or any non-label diff appears, the
   divergence is investigated before any other claim: name the
   first-divergence line and its mechanism — never re-scored as parity.
   If PARITY-EXCEPT-LABELS, the remaining r43 seeds (85002, 85004) are
   SKIPPED (pilot-first: two identical seeds on a moved base already
   answer the question).
2. **ARENA-LABEL-AT-SCALE (analysis of Q1 captures, zero src/js):**
   count death records whose cause wording changed vs r49 on both pilots,
   by origin class (arena kept, wild newly named, betrayal, table trial,
   coalition arena, stranger). Verdict rule: ANSWERED iff the note states,
   with counts and quoted lines, which origins the new labels actually
   name on this band — and whether any arena-chain outcome (death count,
   names, days, successor outcome) moves with them. Label-only is the
   hypothesis; any outcome move is a finding, not a re-score.
3. **ARENA-CHAIN WATCH (analysis of Q1 captures, zero src/js):** count
   arena bearer deaths and the successor outcome on both pilot seeds.
   Verdict rule: ANSWERED iff the comparison states, with names/days,
   whether 85001's chain (13 deaths, day-111 die-out) recurs, holds,
   or reverses on this base — and whether 85003's attrition (6 deaths,
   survived) recurs.
4. **TABLE-APPROACH SENSE (analysis of Q1 wantwatch/captures):** does
   either pilot trajectory voice a table offer, a seat-taker choice, or
   the full-seat price in-window — and does the lesser-seat waiting read
   as a priced wait or a silent stall? Verdict rule: ANSWERED iff the
   note states, per seed, what table-approach voicing fired (seat, arc,
   waiting, announced) with capture lines quoted, not summarized from
   scalars. Full-seat stage bar is ≥2 per the landed TABLE.md correction.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces. Sense-test per
the conversation quality bar: NPC wants something, options engage/deflect,
endings resolve/plant/owe; no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001, 85003 (r50 driver). Pilot gate (r49 driver): seed 85001
  runs first; if it crashes or pilgrimages == 0, STOP.
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-28/journey-scale-r50 (never the live r49 dir;
  a smoke run must not overwrite live evidence).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did SCALE-PARITY-R50 / ARENA-LABEL-AT-SCALE /
  ARENA-CHAIN / TABLE-APPROACH hold as pre-registered, and is the
  telemetry-check step still shape-mismatched for journey runs?)
