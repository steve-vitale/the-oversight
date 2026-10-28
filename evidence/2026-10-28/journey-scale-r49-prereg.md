# journey-scale r49 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261028T1545Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. (Not a discrepancy this time: r48's recovery did
advance 3→0, and the cycle since — landing 0→1, establishment r51/r52 1→2,
deepening r61 2→3 — brings scale round again.)
**Base:** master@9e3c7f152 at worktree creation.
**No src/js change planned at pre-register time:** measurement first
(r43–r48 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**TACKLE ALL context (2026-10-27 17:07):** the seven villager-rationality
items are pursued elsewhere; this run does not claim them.

## Standing context (read before scoring)
- r48 (scale reference for this run): 85003 in FULL PARITY with r47
  (day 181, 7/7 alive, pantry 46,089, global day 143, lesser seat arc 4);
  85001 DIVERGED from r47 on proven w4tbkill phase-B world-HP (day 117→111,
  pop 6/6→0/0 die-out, covenant trusts 37/32/32→24/19/14), with an ablation
  re-running 85001 to EXACTLY r47. Arena chain: 13 bearer deaths both bases
  on 85001, tail flipping to a day-111 die-out; 85003: 6 arena deaths,
  survived. Both seeds lesser seat, arc 4, wait voiced and priced.
  Full seat still unreached (w5 0 both).
- r48 reference censuses (trust JSON scalars):
  - 85001: day 111, over=true, pop 0/0, pantry 0, rank regional,
    nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
    pilgrimages 5, firstCourt 98, leaguePool 965.
    Covenant trusts: village_1 24, village_2 19, village_3 14.
  - 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
    nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
    pilgrimages 8, firstCourt 141, leaguePool 32,822.
    Covenant trusts: village_1 64, village_2 70, village_3 56.
- Base drift since r48's PLAYED base (5ddd06a84..9e3c7f152, 41 commits):
  only TWO src/js changes — sim-partyfinish-a (37aa0a4fb, cornered-party
  hold mechanism, sortie-only driver, counted-finish GO [needs-eyes]) and
  sim-liveness-b (e1a86b20c, refuse dead-flag challenge/posture targets
  pre-payment [needs-eyes]). Plus one doc correction with no behavior
  change: sim-fullseat-stage-a (TABLE.md full-seat stage ≥3 → ≥2, code
  already ≥2; r48's seeds were stage 3, so r48 outcomes are unaffected).
  Everything else is evidence/tooling/preregs plus the ship version bump.
  This makes r49 a sharp test: any parity break must be pinned to
  partyfinish, liveness, or neither — never blamed on a candidate without
  a first-divergence line. Note the wave4demand census (today, same base)
  found partyfinish DORMANT under tableseat-nowait and reproduced its
  corpus exactly from the partyfinish CONTROL — so a partyfinish move
  under scalecourt-nogate would be new information, not an expectation.

## Leg questions (binding)
1. **SCALE-PARITY-R49:** pilot seeds 85001 + 85003, r48 driver with
   labels/EVIDIR only → new driver `scripts/journey-scale-r49-20261028.js`
   (diff-verified: r48→r49 substitutions only) + compare
   `scripts/journey-scale-r49-compare.js` repointed at the r48 reference
   (evidence/2026-10-28/journey-scale-r48, stripping driver labels,
   worktree paths, ISO dates). Policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop.
   Verdict rule: PARITY iff census scalars + transcripts + captures are
   identical to r48's for both seeds after stripping. If identical, the
   remaining r43 seeds (85002, 85004) are SKIPPED (pilot-first: two
   identical seeds on a moved base already answer the question). If
   diverged, the divergence is investigated before any other claim:
   name the first-divergence line and its mechanism (fight, crisis,
   refusal, once-a-day, TB world-HP, party hold, dead-target refusal) —
   never re-scored as parity.
2. **PARTYFINISH-AT-SCALE (analysis of Q1 captures, zero src/js):**
   count counted-finishes / wave-4 kills / field finishes on both pilot
   seeds vs r48's captures. Verdict rule: ANSWERED iff the note states,
   with counts, whether the cornered-party hold fires at all under
   scalecourt-nogate (vs dormant under tableseat-nowait) and whether
   any wave-4 kill or arena outcome moves with it.
3. **ARENA-CHAIN WATCH (analysis of Q1 captures, zero src/js):** count
   arena bearer deaths and the successor outcome on both pilot seeds.
   Verdict rule: ANSWERED iff the comparison states, with names/days,
   whether 85001's r48 chain (13 deaths, day-111 die-out) recurs, holds,
   or reverses on this base — and whether 85003's arena attrition
   (6 deaths, survived) recurs.
4. **TABLE-APPROACH SENSE (analysis of Q1 wantwatch/captures):** does
   either pilot trajectory voice a table offer, a seat-taker choice, or
   the full-seat price in-window — and does the lesser-seat waiting read
   as a priced wait or a silent stall? Verdict rule: ANSWERED iff the
   note states, per seed, what table-approach voicing fired (seat, arc,
   waiting, announced) with capture lines quoted, not summarized from
   scalars. The full-seat stage bar is ≥2 (not ≥3) per the landed
   TABLE.md correction — read seat detail against ≥2.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces (r48's 85001
day-90 was read in full in r48). Sense-test per the conversation quality
bar: NPC wants something, options engage/deflect, endings resolve/plant/
owe; no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001, 85003 (r49 driver). Pilot gate (r48 driver): seed 85001
  runs first; if it crashes or pilgrimages == 0, STOP.
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-28/journey-scale-r49 (never the live r48 dir;
  a smoke run must not overwrite live evidence).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did SCALE-PARITY-R49 / PARTYFINISH-AT-SCALE /
  ARENA-CHAIN / TABLE-APPROACH hold as pre-registered, and is the
  telemetry-check step still shape-mismatched for journey runs?)
