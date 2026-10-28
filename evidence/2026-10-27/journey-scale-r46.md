# journey-scale r46 — THE BATCH MOVED THE LEG (2026-10-27, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261028T0144Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@bcae76cb2 at run start (sim-w4lethality evidence + corpus).
**Pre-register:** `evidence/2026-10-27/journey-scale-r46-prereg.md` (written before
any sim; no src/js change planned — measurement + instrument first, r43/r44/r45
discipline). Zero src/js changed in this run. Zero game behavior changed.
**Driver:** `scripts/journey-scale-r46-20261027.js` (r45 driver, labels/EVIDIR
only — verified: the r45↔r46 driver diff contains ONLY r45/r46 label lines)
plus `scripts/journey-scale-r46-compare.js` (parity compare with the r45
stripping rules: driver labels, worktree paths, ISO dates).

## Infrastructure (read first)
- No lock at run start; lock created (2026-10-28T01:44:04Z), main tree clean,
  disk 18%, reap: 5/16 active, 3 LOUD dirty trees left untouched
  (panel-contract-rulings, gap-social, sim-refusalprecheck-b) plus 2 clean
  active siblings (tackle-armor, journey2-endgame). The 19:43 CDT cap block
  (16/16) has cleared.
- Registration took ~3.5 min (same 2.7 GB checkout class as r45). Standing
  heartbeat loop: the first heartbeat queued ~3 min behind a sibling's
  registry flock (a second loop, journey2-endgame, queued with it), then
  landed — registry heartbeat 01:51:23Z verified in the registry, not
  assumed from a silent loop (2026-10-25 lesson). The loop then DIED
  silently mid-run (no heartbeat process by 02:02Z, 11 min stale, under
  the 15-min threshold) and was restarted and re-verified fresh at
  02:02:50Z. Lesson re-confirmed: a loop that fired once is not a loop
  that lives — re-verify heartbeat_at on every long poll, not just at
  registration.
- Rotation discrepancy, recorded not resolved (third sighting): r45's
  landing note claims it wrote 3→0, yet this run reads 3 — same as r45
  recorded about r44. The file, not the prior run's claim, is the
  authority; this run plays the file as read and writes 3→0 again.

## Verdicts (binding — none re-scored)
- **TACKLE-PARITY: DIVERGED (not parity, and not a driver artifact).**
  Both pilot seeds diverged from r45 on the new base:
  - 85001: day 181 over=false → **day 104 over=true** (game over in the
    arena, see below); nationalDay 88→99, globalDay 89→103, firstCourt
    87→98, pilgrimages 4→5, league pool 44,754→0 (run ended before the
    pool rebuilt), covenant end trusts 63/55/67→42/42/42. Lesser seat and
    arc 4 in both runs; maxWave 4 in both.
  - 85003: day 181 over=false in both; but pop 8/8→**9/9**, regional→
    **national** (nationalDay null→141, firstCourt null→140), pantry
    9,596→52,519, pilgrimages 4→8, covenant end trusts 34/36/31→**60/54/54**,
    Joshua betrayal accepts 2→0. Lesser seat and arc 4 in both.
  - Per the prereg, the remaining r43 seeds (85002, 85004) are SKIPPED:
    two diverged seeds already answer the question, and the divergence
    itself is the finding.
  - **Ruled out as causes:** the driver (labels-only diff, and r44→r45
    already proved label changes inert on both seeds); the harness and
    the scalecourt-nogate policy (zero commits in range); the manifest
    date (stripped in comparison).
  - **First divergence, pinned:** 85001's capture first differs at the
    ~day-10 meal roll — r46 fires the 10% "Your chewing echoes off the
    trees" line (`Math.random() < 0.1 * hear_mult`, game.js:26968) where
    r45 did not. Both lines are old (last touched by a version bump), so
    this is an RNG-stream cascade, not a changed narration: some earlier
    random consumption shifted by the batch. The cascade, not any single
    mechanism, explains the downstream differences — including the
    different gossip names, different counter-learn sources, and the
    different villagers who talk on day 90.
  - **What the batch contains** (src/js commits 60e260dc0..bcae76cb2):
    gap landings (seat-taker choice, dry-fallback grammar exemption,
    monster-meat channel, routing to known monsters, pocketed ammo) +
    tackle 5 (invite, outing, teach, succession, wound2) + woundmill A1
    and its revert. A single-item bisect would cost a pilot per
    candidate and is NOT done here; the named next work is a bisect
    only if a future run needs single-item attribution. The honest
    claim is batch-level: the leg's reference trajectories moved, and
    r46 IS the new scale reference on this base.
  - **Succession explicitly cleared:** tackle-succession touched only
    kit/languages in villager-build.js (verified in its diff) — no
    eligibility change. 85001's game-over is roster state downstream
    of the cascade, not a succession-logic regression (see below).
- **SEASONED-BAR RE-CHECK: ANSWERED — moved, and moved past the bar.**
  85003 covenant peaks: r45 40/42/37 → r46 **60/54/54**; end trusts
  60/54/54. r45's burst-proof bar was ≥48 at burst start. r46's 85003
  absorbed a real burst mid-run — covenantCrisis -10 shakes at d105
  (single), d112 (all three covenants), d128 (all three) via
  hierarchy.js:3344 onLeaderDeath, the same mechanism r45 named — and
  still ended at 60/54/54, 6–12 points above the bar. Trust math itself
  is untouched (zero hierarchy.js commits in range); the lift rides
  the richer trajectory (8 pilgrimages vs 4, first court d140, national
  rank), not a trust-number change. The r45 gap (no covenant tending
  verb) is NOT closed by this — the bar was cleared by trajectory,
  not by a new verb — but the seasoned-bar constraint no longer binds
  on this seed.
- **PEOPLE-SENSE: GO.** 85001 day-90 talk read in full: Daniyar the
  paramedic, gentle, trust 25, want curious (stage 1). He opens with a
  real want — "Did you sleep? I kept hearing things out past the
  treeline." The yes-answer engages it ("So it's not just me. Good.
  That's... good to know. Bad, but good."), the goon follow-up draws
  out the shifts-sleeping detail and the Almaty origin, and the ending
  resolves ("Thanks for listening. I mean that."). No fabricated shared
  history, no filler loop. Shorter than r45's Irving d90, but people
  talking. (The villager differs from r45's Irving because the cascade
  changed who talks — the talk itself is sound.)

## The leg, in plain words
- **85001 — the village of two that the arena finally ate.** Same two
  people alive at the end as r45, same lesser seat, same arc 4 — but the
  story ends at day 104, not day 181. The bearer died in the arena nine
  times across the run (d23–d102, same cast in the same order as r45's
  d39–d159, time-compressed by the cascade); after Quinn Murphy's
  d102 arena death there was no eligible successor, so the game ended
  (playerDeath throw → over=true, game.js:44057) with two villagers
  still living. In r45, Quinn's d159 arena death found a successor and
  the run continued. The arena is a property of this leg's policy, not
  new: r45's 85001 also lost nine bearers to the arena and survived.
  What is new is only that this instance broke the chain.
- **85003 — the thin village that got rich.** Nine of nine alive (was
  eight of eight), national rank with a first court at day 140 (was
  regional, no court), a pantry of 52,519 kcal (was 9,596), eight
  pilgrimages (was four), covenant trusts in the 50s–60s (was 30s),
  and no Joshua walks at all (was two ordinary walks — the betray
  instrument records a real zero, not an unknown). Lesser seat waiting,
  arc 4, same as r45.
- **What did NOT change:** the leg's seat outcome. Both seeds still end
  at the lesser seat, arc 4, maxWave 4. The full seat is still unreached
  on this band — the batch moved trajectories, not the seat.

## Reachable / fun / winnable (leg 3 — re-judged on the new base)
- **Reachable:** YES for the approach — both seeds reach the lesser
  seat in-window, voiced. The full seat is NOT reached (standing gap
  now enforced by scalegate, unchanged outcome on this band).
- **Fun:** YES with a warning — the day-90 talk is people talking, and
  85003's richer trajectory (court, national rank, full pantry) is the
  leg working. The warning is 85001: a scale village whose story ends
  in arena attrition rather than at the table is a leg-shape problem
  worth watching across seeds, even though the chain-break itself is
  cascade luck, not a regression.
- **Winnable:** YES for the approach, NOT YET for the full seat — the
  binding constraints are now: the arena chain (85001) and the price
  itself (r43's 85002, carried), NOT the seasoned bar (85003 cleared
  it on this base).

## Telemetry deviation check (step 14 — NOT rolled, sixth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-27/journey-scale-r46/journey-scale-r46-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" — the
same vacuous shape mismatch as r42, r43, r44, and r45 (the journey trust JSONs
do not carry those fields at all; tableTele, the sixth metric, stayed quiet
in all six runs). Verdict: NOT a real deviation. NOT rolled. Sixth
confirmation: the telemetry step for journey runs needs an owner to either
seed a journey-shaped baseline deliberately or drop the step for journey
runs and say so plainly. Rolling it would launder a shape mismatch into a
number.

## Tests
- `node --check` clean on both new scripts (r46 driver + r46 compare).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **278 passed, 9 failed in 497s** — the same total (287) and the same
  count as the r45 landing pass. Classification, done rather than assumed:
  - 8 of the 9 are the r45 landing set, failing identically: hide-discovery
    (counter butchering), the three measurement-* scripts (proof freshness /
    collector-contract coverage), mobile-combat-cadence, occupation-panels,
    phone-frame-proof (proof-hash freshness), establishment-r20 (racks-full
    voice gate). This run changed zero src/js, zero test files, and zero
    data files, and added no file to the check list — all pre-existing.
  - The 9th differs from r45's set, in the good direction and the bad:
    parity-20261014's gear failure ("they still wear their spear and
    jacket") is GONE — spot-checked alone: 60 passed, 0 failed, consistent
    with tackle-succession keeping worn gear on takeover (not claimed as
    single cause, but the named failure no longer fails). In its place,
    test-sw-audio-cache-20261012 fails standalone with "Stale offline
    assets: node scripts/build-offline-assets.js" — a proof-freshness
    failure on the base (assets not regenerated after src changes),
    unrelated to this run's files. Net: zero regressions from this run;
    one named failure fixed on the base, one freshness failure present
    on the base.
  - Check-run byproduct, discarded not committed: the suite regenerated
    one docs/ONTOLOGY.md line (the tackle-succession mantle bullet, to
    match the new villager-build.js comment). It is not this run's work,
    so it was reverted with `git checkout --` and left for the owning
    area; this commit contains only r46 files.

## Metric review
- TACKLE-PARITY as designed did its job in the negative direction: the
  prereg's stripping rules (driver stacks, labels, manifest date) kept
  the comparison honest, and the first-divergence pin (a 10% meal roll)
  is what separates a real mechanism claim from a cascade claim. A
  future parity run should ALSO record the first-divergence line and
  its mechanism before comparing censuses — census diffs alone invite
  over-claiming a single cause.
- The naive "census equal" compare is doubly a footgun now: trust JSONs
  embed driver-path stacks AND the run's day-104 vs day-181 horizons
  differ, so scalar tables (not whole-object compares) are the unit.
- SEASONED-BAR's verdict rule held: peaks + burst behavior, with numbers,
  decided it — "moved past the bar" is a trajectory claim, and the note
  says so rather than crediting a trust change that never landed.
- The rotation-file discrepancy (r44→r45→r46 all reading 3 after a
  claimed 3→0 write) is now a three-time pattern: some later run
  re-sets it, or the write does not persist. It costs nothing (the
  file is played as read), but it should be owned, not re-noted
  forever. Candidate owner: whichever loop writes the file last in
  the ship cycle — left for the coordinator, not chased here.

## LANDING STATUS
- Commit 28373b7c4 (evidence + r46 driver + r46 compare, zero src/js) merged
  --ff-only to master in the main tree; main tree verified clean after.
  Safe-commit index clobber hit commit 28373b7c4 (all files staged-as-deleted
  post-commit) — repaired via HEAD-blob cacheinfo, verified status + diff
  HEAD empty before merging. No version bump, no push — the batch ship loop
  owns bumps, pushes, and live verification. Merged locally, pending ship.
  Rotation 3→0 written, lock deleted, worktree released at closeout.
