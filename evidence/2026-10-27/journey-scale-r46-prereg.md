# journey-scale r46 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261028T0144Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. (Note: r45's landing note claims it wrote 3→0, yet
this run reads 3 again — the same discrepancy r45 recorded about r44. The
file, not the prior run's claim, is the authority; this run plays the file
as read and writes 3→0 again.)
**Base:** master@bcae76cb2 at run start (sim-w4lethality evidence + corpus).
**No src/js change planned at pre-register time:** measurement + instrument
first (r43/r44/r45 discipline). A game-code fix is decided ONLY after
evidence confirms a mechanism, and only lands with its own proof test.

## Standing context (read before scoring)
- r45: SCALEGATE-PARITY GO (85001 byte-identical to r44 on the scalegate
  base); BETRAY-INSTRUMENT GO (2 Joshua accepts on 85003, both ordinary);
  TRUST-HOLD ANSWERED second branch — no existing lever holds a covenant
  through the observed burst (four Haven-speaker deaths in 12 days); a link
  needs ≥42 pre-death to survive one death at the bar, ≥48 at burst start;
  rebuild is ~+1/week + sporadic deeds. Named gap: covenant links have NO
  repeatable tending verb (tendLink is LEAD-road only). No canon doc covers
  covenant tending.
- Base drift since r45 (all landed to master): tackle-invite (89d3c1ee4,
  character-driven invitation decisions), tackle-outing (7f0e1dc41, joint
  foraging outings), tackle-teach (957f9c1e3, ledger conversation
  ability-teaches), tackle-succession (20010c093, taken-over villager keeps
  worn gear/stash/tongues), tackle-wound2 (ac9f1987b, field wounds carry
  into turn-based fights), plus sim-w4lethality DIAG (4207ac845, bcae76cb2:
  median losing wave-4 fight deals 1.9% of monster max HP; near-kills do
  not accumulate). Gating freeze (2026-10-27 16:53) still stands — no
  threshold changes in this run.
- Why parity is a REAL check this time, not a formality: unlike r45's
  single full-seat-gate change, FIVE tackle items touched systems the scale
  leg exercises — invitations (walks), outings (pilgrimages), teaching
  (knowledge), succession (takeover kits), wounds (fight outcomes). Any of
  them could move a scale census. If parity holds, the tackle batch is
  scale-neutral; if it breaks, the break IS the finding.

## Leg questions (binding)
1. **TACKLE-PARITY:** pilot seeds 85001 + 85003, r45 driver with labels/EVIDIR
   only → new driver `scripts/journey-scale-r46-20261027.js`, policy
   scalecourt-nogate UNCHANGED, DAYCAP 180, death-aware stop.
   Verdict rule: PARITY iff census scalars + transcripts + captures are
   identical to r45's for both seeds, after stripping (a) driver-path
   stacks in trust JSONs (r45 lesson: stacks name the driver file),
   (b) the mode/policy-id labels (r45→r46), and (c) the manifest date
   (UTC date rolled past midnight between runs). If identical, the
   remaining r43 seeds (85002, 85004) are SKIPPED (pilot-first: two
   identical seeds on a moved base already answer the question).
   If diverged, the divergence is investigated before any other claim:
   name which tackle mechanism explains it (invitation counts, outing
   lines, teach tele, succession kit, wound-carried fight deltas) — never
   re-scored as parity.
2. **SEASONED-BAR RE-CHECK (analysis of Q1 trust JSONs, zero src/js):**
   on 85003, compare the covenant trust peaks + burst behavior to r45's
   (Ashford peak 37, Stonebridge 40, Thornfield 42). Verdict rule:
   ANSWERED iff the comparison states whether the tackle batch moved any
   covenant peak or the burst arithmetic (≥42 / ≥48 thresholds from r45)
   — moved, unmoved, or moved-but-still-short, with numbers.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces. Sense-test per
the conversation quality bar: NPC wants something, options engage/deflect,
endings resolve/plant/owe; no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001, 85003 (r46 driver).
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-27/journey-scale-r46 (never the live r45 dir;
  a smoke run must not overwrite live evidence).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did TACKLE-PARITY / SEASONED-BAR hold as pre-registered,
  and is the telemetry-check step still shape-mismatched?)
