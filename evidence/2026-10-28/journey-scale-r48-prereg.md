# journey-scale r48 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261028T1103Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. (Fifth sighting of the rotation discrepancy: r47's
landing note claims it wrote 3→0, yet this run reads 3 again — same pattern
r45/r46/r47 recorded. The file, not the prior run's claim, is the authority;
this run plays the file as read and writes 3→0 again.)
**Base:** master@5ddd06a84 at worktree creation (r47 base was a2a2a20f3).
**No src/js change planned at pre-register time:** measurement + instrument
first (r43–r47 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**TACKLE ALL context (2026-10-27 17:07):** the seven villager-rationality
items are pursued elsewhere; this run does not claim them. Ready pieces land
separately and are never reported as the whole list done.

## Standing context (read before scoring)
- r47 (new scale reference): SCALE-PARITY-R47 DIVERGED with a named cause —
  both pilot seeds' first capture difference was the same crisis-r59
  aidFight line (lingerer treeline: door does NOT go quiet until the
  treeline actually clears), delaying not deleting the relief beat.
  Arena chain bent further, did not break: 85001 13 bearer arena deaths
  (r46: 9), mantle Luis→Suda d110, ends day 117 hunger scattering with
  6 alive (r46: day 104, 2 alive); 85003 6 arena deaths (r46: 3), survives
  to day 181 with 7/7 alive. Both seeds: lesser seat, arc 4, wait voiced
  and priced ("ledger still wants: wave-3 monsters faced" on 85003).
  Full seat still unreached on this band (w5 0 both; 85003 maxWave 4→3).
- r47 reference censuses (trust JSONs, scalars only):
  - 85001: day 117, over=true, pop 6/6, pantry 0, rank regional,
    nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
    pilgrimages 5, firstCourt 98, leaguePool 0.
  - 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
    nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
    pilgrimages 8, firstCourt 141, leaguePool 32,822.
- Base drift since r47 (a2a2a20f3..5ddd06a84, 56 commits, 9 src commits):
  tackle-map beyond-edge generation + building tile first slice (game.js);
  sim-calmbeast-b Calm tap target scan (abilityActions/app.js);
  establishment r51 party self-invite guard (betrayal/party/game.js);
  eggomen P2 finale-omen regional gate, wave 5 + regional (was national);
  landing r64 case-framing spoken line (conversation.js);
  barwhy why-visible on disabled buttons (app.js);
  caughtlift trust booking via bumpTrust + observe table entry;
  divedeep day-roll predictor extension;
  w4tbkill phase B: world monsters enter TB fights at world HP.
  The rest is evidence/tooling/preregs plus version bumps. None touches
  table gating, trust math, or hierarchy directly — but w4tbkill (world
  HP in TB fights), the self-invite guard, and beyond-edge generation
  could each move a scale trajectory, so a parity break, if any, must be
  pinned to its first-divergence line before any mechanism is claimed.
  The finale-omen regional gate is the one change that could voice
  differently in-window on a global seed (85003 reached global in r47).

## Leg questions (binding)
1. **SCALE-PARITY-R48:** pilot seeds 85001 + 85003, r47 driver with
   labels/EVIDIR only → new driver `scripts/journey-scale-r48-20261028.js`
   (diff-verified: label/date/EVIDIR/mode lines only) + compare
   `scripts/journey-scale-r48-compare.js` repointed at the r47 reference
   (evidence/2026-10-28/journey-scale-r47, stripping driver labels,
   worktree paths, ISO dates). Policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop.
   Verdict rule: PARITY iff census scalars + transcripts + captures are
   identical to r47's for both seeds after stripping. If identical, the
   remaining r43 seeds (85002, 85004) are SKIPPED (pilot-first: two
   identical seeds on a moved base already answer the question). If
   diverged, the divergence is investigated before any other claim:
   name the first-divergence line and its mechanism (fight, crisis,
   refusal, once-a-day, TB world-HP, self-invite, map edge) — never
   re-scored as parity, never blamed on a single candidate without a pin.
2. **ARENA-CHAIN WATCH (analysis of Q1 captures, zero src/js):** count
   arena bearer deaths and the successor outcome on both pilot seeds.
   Verdict rule: ANSWERED iff the comparison states, with names/days,
   whether 85001's r47 chain (13 deaths, held to a day-117 hunger
   scattering) recurs, holds, or reverses on this base — and whether
   85003's arena attrition (6 deaths, survived) recurs.
3. **TABLE-APPROACH SENSE (analysis of Q1 wantwatch/captures):** does
   either pilot trajectory voice a table offer, a seat-taker choice, or
   the full-seat price in-window — and does the finale-omen regional
   gate voice anything new on the global seed? Verdict rule: ANSWERED
   iff the note states, per seed, what table-approach voicing fired
   (seat, arc, waiting, announced) and whether the lesser-seat waiting
   reads as a priced wait or a silent stall — with capture lines quoted,
   not summarized from scalars.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces (r47's was
Daniyar the paramedic, d90, byte-identical to r46). Sense-test per the
conversation quality bar: NPC wants something, options engage/deflect,
endings resolve/plant/owe; no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001, 85003 (r48 driver). Pilot gate (r47 driver): seed 85001
  runs first; if it crashes or pilgrimages == 0, STOP.
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-28/journey-scale-r48 (never the live r47 dir;
  a smoke run must not overwrite live evidence).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did SCALE-PARITY-R48 / ARENA-CHAIN / TABLE-APPROACH
  hold as pre-registered, and is the telemetry-check step still
  shape-mismatched for journey runs?)
