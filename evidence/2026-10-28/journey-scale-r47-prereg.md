# journey-scale r47 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261028T0544Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. (Note: r46's landing note claims it wrote 3→0, yet
this run reads 3 again — the same discrepancy r45/r46 recorded. The file,
not the prior run's claim, is the authority; this run plays the file as
read and writes 3→0 again.)
**Base:** master@a2a2a20f3 at worktree creation (r46 base was bcae76cb2).
**No src/js change planned at pre-register time:** measurement + instrument
first (r43–r46 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.

## Standing context (read before scoring)
- r46 (new scale reference): TACKLE-PARITY DIVERGED on the tackle batch —
  85001 day 181 over=false → day 104 over=true (arena chain broke at
  Quinn Murphy d102, 9 arena bearer deaths d23–d102); 85003 regional →
  national (nationalDay 141, firstCourt 140, pantry 52,519, pilgrimages 8,
  covenant end trusts 60/54/54). Both seeds: lesser seat, arc 4, maxWave 4.
  First divergence pinned at a ~day-10 meal RNG roll — an RNG-stream
  cascade, not a single changed narration. r46 IS the reference for r47.
- r46 reference censuses (trust JSONs):
  - 85001: day 104, over=true, pop 2/2, pantry 0, rank global,
    nationalDay 99, globalDay 103, seat lesser, arc 4, maxWave 4,
    pilgrimages 5, firstCourt 98, leaguePool 0.
  - 85003: day 181, over=false, pop 9/9, pantry 52,519, rank national,
    nationalDay 141, globalDay null, seat lesser, arc 4, maxWave 4,
    pilgrimages 8, firstCourt 140, leaguePool 34,425.
- Base drift since r46 (src/js commits bcae76cb2..a2a2a20f3, 50 commits
  total, only 4 real game changes): crisis r59 aidFight checks lingerers
  first (comms.js); wallwounds lingerer TB restore capped at pre-fight HP;
  onceaday prechecks for challenge/end_it_before; refusalprecheck
  pre-payment prechecks for the three post-payment refusals. The rest is
  evidence/tooling/preregs plus one version bump. None of the four touches
  table gating, trust math, or hierarchy — so a parity break, if any,
  most plausibly rides an RNG cascade or a fight/crisis-path side effect,
  and must be pinned before any mechanism is claimed.

## Leg questions (binding)
1. **SCALE-PARITY-R47:** pilot seeds 85001 + 85003, r46 driver with
   labels/EVIDIR only → new driver `scripts/journey-scale-r47-20261028.js`
   (diff-verified: label/date/EVIDIR/mode lines only) + compare
   `scripts/journey-scale-r47-compare.js` repointed at the r46 reference
   (evidence/2026-10-27/journey-scale-r46, stripping driver labels,
   worktree paths, ISO dates). Policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop.
   Verdict rule: PARITY iff census scalars + transcripts + captures are
   identical to r46's for both seeds after stripping. If identical, the
   remaining r43 seeds (85002, 85004) are SKIPPED (pilot-first: two
   identical seeds on a moved base already answer the question). If
   diverged, the divergence is investigated before any other claim:
   name the first-divergence line and its mechanism (fight, crisis,
   refusal, once-a-day) — never re-scored as parity, never blamed on a
   single candidate without a pin.
2. **ARENA-CHAIN WATCH (analysis of Q1 captures, zero src/js):** count
   arena bearer deaths and the successor outcome on both pilot seeds.
   Verdict rule: ANSWERED iff the comparison states, with names/days,
   whether 85001's r46 chain-break (9 deaths, broke d102) recurs,
   holds, or reverses on this base — and whether 85003 shows any arena
   bearer attrition at all. A single-seed repeat is a watch item, not
   a mechanism claim.
3. **TABLE-APPROACH SENSE (analysis of Q1 wantwatch/captures):** does
   either pilot trajectory voice a table offer, a seat-taker choice, or
   the full-seat price in-window? Verdict rule: ANSWERED iff the note
   states, per seed, what table-approach voicing fired (seat, arc,
   waiting, announced) and whether the lesser-seat waiting reads as a
   priced wait or a silent stall — with capture lines quoted, not
   summarized from scalars.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces (r46's was
Daniyar the paramedic, d90). Sense-test per the conversation quality bar:
NPC wants something, options engage/deflect, endings resolve/plant/owe;
no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001, 85003 (r47 driver). Pilot gate (r46 driver): seed 85001
  runs first; if it crashes or pilgrimages == 0, STOP.
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-28/journey-scale-r47 (never the live r46 dir;
  a smoke run must not overwrite live evidence).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did SCALE-PARITY-R47 / ARENA-CHAIN / TABLE-APPROACH
  hold as pre-registered, and is the telemetry-check step still
  shape-mismatched for journey runs?)
