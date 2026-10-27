# journey-scale r43 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261027T0643Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. Base master@d9ff6f22a (journey-deepening r55) at run start.
**No src/js change planned at pre-register time:** measurement first (r42's
discipline). A game-code fix is decided ONLY after evidence confirms a
mechanism, and only lands with its own proof test — otherwise the direction
is documented, not driven by.

## Standing context (read before scoring)
- r42 (commit c04d4e0cb, IN this base) fixed the bystander hold: startCombat
  used to lift the player-tile monster on EVERY tb fight, even when the fight's
  monsters were its own waves; a bystander lifted for a contest/trial fight
  was never restored on 'won', silently deleting healthy wave-4 lingerers
  (r41 gauntlet day: s19/s28/s31 on d145, confirmed by removal rows).
- r42's named next work for THIS run: (a) a post-fix removal band re-run —
  does the bystander class go to zero band-wide, not just on 73675?
  (b) whether surviving lingerers change siege/crisis outcomes downstream
  (the 73675 cascade grew wave-4 spawns 7→13 pre-fix).
- r42's blocked-landing note is SUPERSEDED: a successor recovery landed
  c04d4e0cb (verified in HEAD history; registry entry cleaned, worktree
  removed). This run is r43, NOT a recovery replay.
- Infrastructure at run start: container-wide write(2) EPERM flap from
  ~06:44 UTC (new-file writes failed in /tmp, .git/refs/heads, worktrees,
  evidence, goal hidden_files alike), plus a service restart ~06:51 UTC.
  Registration failed 3× on the flap, then a 2.7 GB checkout failed at
  index-reset, then the flap cleared ~07:17 UTC and registration succeeded
  (branch journey-scale had been created by the failed attempt; the
  register script's existing-branch fallback attached to it — base
  verified d9ff6f22a, worktree clean). Heartbeat loop verified landing
  (registry heartbeat_at fresh at run start of sims). If the flap returns
  mid-run, the rule from r42 holds: never force a commit past it; wait,
  retry, and report loudly.

## Leg question (binding)
1. **POST-FIX REMOVAL (r42 item a):** on the SAME wave4enc/spawnfate band
   (seeds 73671–73678, tableseat-nowait policy, same recorders), does the
   bystander-lift removal class go to zero band-wide under the fix?
2. **JOURNEY PARITY + PEOPLE:** on the matched scale seeds (85001–85004,
   scalecourt-nogate policy, r42 driver with labels/EVIDIR only), do the
   leg outcomes still reach regional→national and the table approach, and
   do the leg's transcripts still read as people (same d90/d120 sample slots
   as r42, plus full read of one seed's beats)?
3. **LINGERER DOWNSTREAM (r42 item b, band level):** does the fate
   partition shift toward fought outcomes (survivors now get fought
   instead of evaporating), and do journey outcomes move where bystanders
   survived? A full siege/crisis-outcome comparison is beyond this run's
   scope and stays documented as remaining, not silently claimed.

## What would count as an interesting finding
- Bystander-lift rows = 0 across the whole removal band (not just 73675).
- Any bystander-lift row surviving the fix (a second lift site, or the fix
  missing a path) — that is a NEW bug, not a parity note.
- A vanished-near-player spawn with no matching removal row (recorder gap
  or bypassing splice — reported as unclassified, never silently assigned).
- A journey seed whose outcome moves vs r42 in a way traced to a surviving
  bystander (fought instead of evaporated) — expected direction, verified
  per-seed, not assumed.
- A transcript that is senseless, fabricated, or a filler loop on full read
  (the known Dorothy-d120 circling wart is the control: circling that
  reproduces identically is NOT a new finding; a change in its shape is).

## Seeds, policies, horizons
- REMOVAL: seeds 73671–73678, driver scripts/test-removalsite-r42.js
  UNCHANGED (EVID env → evidence/2026-10-27/journey-scale-r43-removal),
  analyzer scripts/analyze-removal-r42-20261026.js UNCHANGED (EVIDIR arg),
  DAYCAP 180, death-aware stop.
- JOURNEY: seeds 85001–85004, policy scripts/policies/scalecourt-nogate.js
  UNCHANGED, driver scripts/journey-scale-r43-20261027.js (r42 driver,
  labels/EVIDIR only), analyzer scripts/analyze-scale-r43-20261027.js
  (r42 analyzer, labels only), DAYCAP 180, death-aware stop,
  EVIDIR evidence/2026-10-27/journey-scale-r43 (scratch dir, never r42's).
- PILOT GATE: removal 73677 first, journey 85001 first; if either crashes
  or (removal) the recorder is not installed, STOP and diagnose before
  running the batch.

## Pre-registered metrics (binding — §14 anti-drift)
- REMOVAL-BYSTANDER-ZERO: GO iff 0 bystander-lift rows band-wide.
  (A miss is NO-GO, never re-scored against a friendlier class.)
- REMOVAL-PARTITION: GO iff ≥6/8 seeds fully partitioned (same bar as r42).
- REMOVAL-UNCLASSIFIED: any vanished-near-player spawn with no removal row
  is reported LOUD by seed; it does not silently fail the partition bar,
  but it blocks a clean GO on REMOVAL-BYSTANDER-ZERO's interpretation.
- JOURNEY-PARITY: REPORT (not GO/NO-GO) — the fix legitimately changes
  outcomes where bystanders survive, so per-seed deltas vs r42 are listed
  and each is traced or marked unexplained. An unexplained delta is an
  open item, not a re-score.
- JOURNEY-TABLE: REPORT — seeds reaching a lesser seat in-window, vs r42's
  3/4 (85001, 85003, 85004; 85002 blocked on opinion<10).
- PEOPLE-SENSE: GO iff the d90/d120 sample reads show no fabricated shared
  history and no NEW filler loop beyond the known Dorothy-d120 circling
  control; any new senseless transcript is a named blank.

## Metric review (filled at run end)
- (to be filled: whether any metric proved wrong, and the revision proposed
  for the NEXT run — never applied mid-run.)
