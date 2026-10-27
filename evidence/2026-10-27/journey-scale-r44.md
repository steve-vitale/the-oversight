# journey-scale r44 — THE LABEL WAS THE BUG, THE LEG IS FROZEN (2026-10-27, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261027T1058Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@2097f7f04 (journey-deepening r56) at run start.
**Pre-register:** `evidence/2026-10-27/journey-scale-r44-prereg.md` (written before
any sim; no src/js change planned — measurement + tooling first, r43's discipline).
**Arms (zero src/js):**
1. **BETRAYAL-LABEL** — r43 item (b): is a betrayal:accept pick a betrayal?
2. **DIVERGENCE TOOL** — r43 item (a): `scripts/journey-divergence.js`, validated
   on r42→r43, then run on r43→r44-pilot.
3. **PILOT PARITY** — seed 85001, r43 driver with labels/EVIDIR only
   (`scripts/journey-scale-r44-20261027.js`), policy scalecourt-nogate, DAYCAP 180.
4. **SEASONED-BAR** — analysis-only on r43's 85003 trust evidence (no new sim).

## Infrastructure (read first — registration fought back twice)
- The first register attempt died in a service restart mid-checkout: branch
  `journey-scale` was created at master, but the worktree path was NOT created —
  it already held an unregistered 2026-10-14 evidence orphan (presentation PNGs,
  raidration/rotcal/sharepol per-seed dirs). The register script's
  existing-branch fallback then failed on the non-empty path (it reports the
  first error, the branch error, masking the real one).
- Recovery: the orphan dir was MOVED, not deleted, to
  `~/workspace/worktrees/journey-scale-orphan-20261014-preserved` (nothing
  removed; if its owner needs it, it is intact there), and registration then
  succeeded via the existing-branch fallback — base verified 2097f7f04,
  worktree clean. The register script's fallback does not handle a non-empty
  path; that gap is worth a script note, not a silent workaround.
- Standing heartbeat loop verified landing (registry heartbeat_at fresh at
  registration + after the manual heartbeat). Worktree-reap at run start:
  nothing removed; 9/16 active; 8 LOUD dirty trees left untouched
  (sim-leg2drift-b, sim-belongcost-b, panel-contract-rulings,
  sim-fullpantry-casecount-b, sim-finalloss-a, sim-raidcallers-b,
  sim-raidday100-b, journey2-endgame).
- Main tree at run start: clean, disk 28%. `git log a33fe3c74..HEAD -- src/js/`
  is EMPTY (22 commits, all evidence/scripts) — the base is game-frozen since
  r43, which is why this run is a pilot + instrument run, not a full batch.

## Verdicts (binding — none re-scored)
- **DIVERGENCE-VALIDATION: GO (with a convention note).** The tool on r42→r43
  reports first-diff lines (1-based) 7130 / 2377 / 3425 / identical — exactly
  r43's reported 7129 / 2376 / 3424 / none, plus one, on all three diverging
  seeds. r43's ad-hoc numbers were 0-based; the tool counts lines the way a
  reader does. Same lines, same identical seed: the tool is validated, and
  r43's numbers are confirmed, not contradicted.
- **BETRAYAL-LABEL: REPORT — LABEL-MISLEADING, with a second instrument defect.**
  See below.
- **SEASONED-BAR: REPORT — trust-short only, never age-short.** See below.
- **PILOT-PARITY: GO.** Pilot capture-85001 byte-identical to r43's (17,823
  lines), transcripts d90 + d120 byte-identical, betray file identical, and
  every census field compared identical (day 181, over false, pop 2/2, pantry
  0, global, nationalDay 88, globalDay 89, lesser seat, proposedLead 1,
  proposedPeer 4, pilgrimages 4). Per the prereg, the full batch is therefore
  SKIPPED — four identical seeds would have added nothing. One console-print
  quirk, not a divergence: the per-seed line prints `ctx.proposedLead` (0)
  while the summary prints the census `proposedLead` (1) under the same name
  `proposed=` — two counters, one label. The evidence JSONs agree with r43.
- **PEOPLE-SENSE: GO.** Both pilot transcripts read in full this run
  (byte-identical to r43's, re-verified, not assumed): Irving d90, solitude
  as a resource — "Scarcer than food, some days"; Irving d120, belief talk —
  "the small ones held." Want named, engagement honest, endings resolve. No
  fabricated shared history, no new filler loop, no Dorothy-circling
  involvement on this seed.

## Betrayal-label answer (r43 item b — answered, not just named)
The choice id `betrayal:accept` is the betrayal module's namespace for the
OUTING-INVITATION channel, not a claim that a betrayal happened:
- `betrayal.js betrayalChoices()` offers `betrayal:accept` ("All right. Let's
  go.") whenever the villager holds a pending invite — the same channel plot
  lures travel, indistinguishable by design (conversation.js SPOKEN LURE fix:
  the NPC now speaks the invite as its own beat first, so the menu never asks
  the player to accept an invitation never extended).
- `acceptInvite()` springs an ambush ONLY if an active, unsprung plot names
  this villager as inviter; otherwise it resolves the walk via `resolveInvite()`
  (teaching, retreat, and the rest). An accept is therefore "yes to a walk"
  that is SOMETIMES a lure — not a betrayal.
- r43's evidence, counted completely: TWO accepts on 85003 (Joshua d90
  teaching walk — slope-water reading, grandmother's method; Joshua d120
  retreat walk — fresh big tracks, "We go back now. Quietly."), ZERO sprung
  plots, ZERO betrayals. Both walks are good content; neither is a betrayal.
- Second defect, in the instrument (not the game): the r43 driver registers
  only the FIRST accept per villager (`!betraySubjects[vid]` guard), so the
  betray file shows ONE accept for Joshua while the transcripts show two.
  The instrument undercounts accepts 2→1 on this seed. Fix direction for the
  next run's driver (not applied here — this run's driver stays labels-only
  so pilot parity stays meaningful): record EVERY accept, and record whether
  the pending invite carried a plot (armed vs ordinary) — that split is the
  honest version of this label.
- No game change follows: the walks, the spoken invites, and the lure channel
  all work as designed. The fix belongs to the instrument's naming, and it is
  a Steve-call-free driver change for a later run, not a silent relabel here.

## Seasoned-bar answer (r43's 85003 blocker — trust-short, and the binding village is Ashford)
- Rule (`hierarchy.js _linkSeasoned`, Steve 2026-10-11: a season is 30 days):
  a covenant counts toward a polity only at age 30+ days AND trust 40+.
  Links form at trust 30 — tending required.
- 85003 at day 181: 3 covenants, all age-seasoned (Stonebridge 58d, Thornfield
  57d, Ashford 56d — formed d123–125), NONE trust-seasoned at end (34 / 36 /
  31). The bar failure is 100% trust, 0% age.
- Trajectories: Stonebridge peaked at 40 (d163–167, 5 days); Thornfield peaked
  at 42 (d159–169, 11 days); Ashford NEVER reached 40 (peak 37). Two covenants
  were simultaneously seasoned only d163–167 — never all three. Ashford is
  the binding constraint, 3 points short at its best.
- Late-game shape: repeated leader-death crises (d167, 170, 176, 179) each
  concede better terms (+8 trust) yet trust still slides — the drift notes
  ("Trust crossed below the seasoned bar") fire d167/170/176. Concessions
  do not hold against the leader-death drain. Next lever question (for a
  later run, not a change here): what raises covenant trust to 40 and HOLDS
  it through a leader death — the +8 concession is not enough, and Ashford
  never gets there at all. Note also: opinions run 39–53 while covenant
  trust sits at 31–36 — opinion is not trust (canon: trust ≠ reputation),
  and no amount of liking substitutes for tending.

## Pilot parity (the leg, in plain words — seed 85001, unchanged from r43)
- **85001 — the village of two, living on the network.** Ends day 181 with 2
  living people, global rank (national day 88, global day 89), a lesser seat
  waiting, arc 4 — byte-identical to r43, including the empty home pantry (0)
  carried by the league pool. Same village, same seat, same story: the pilot
  proves the leg is frozen because the base is frozen, not because the
  instrument stopped looking. The other three r43 villages (85002's priced-out
  tragedy, 85003's thin-but-living eight, 85004's comfortable nine) are
  carried forward unchanged — no src/js change could have moved them, and
  the pilot confirms the determinism that claim rests on.

## People check
- See verdicts: Irving d90 + d120 read in full above. Both talks are people
  talking, not menus reciting: solitude as a scarce resource, belief in
  small provable things after the big beliefs broke. Endings land
  ("Steady as she goes. See you at dinner.").

## Reachable / fun / winnable (leg 3 — carried from r43, pilot-confirmed)
- **Reachable:** YES for the approach — the pilot re-proves a lesser seat
  in-window, voiced. The full seat is NOT reached (standing gap, unchanged).
- **Fun:** YES — the pilot's talks are the leg's best register, and the
  r43 tragedies/triumphs stand behind it unchanged.
- **Winnable:** YES for the approach, NOT YET for the full seat — the
  binding constraints are now named precisely: the price itself (85002) and
  seasoned trust (85003, Ashford 3 short), not evaporation bugs.

## Telemetry deviation check (step 14 — NOT rolled, third confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-27/journey-scale-r44/journey-scale-r44-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=1 files)" — the
same vacuous shape mismatch as r42 and r43 (the journey trust JSONs do not
carry those fields at all; tableTele, the sixth metric, stayed quiet in
both runs, so the LOUD set matches r43's exactly). Verdict: NOT a real
deviation. NOT rolled. This is now the third run confirming the gap: the
telemetry step for journey runs needs an owner to either seed a
journey-shaped baseline deliberately (contract area) or drop the step for
journey runs and say so plainly. Rolling it would launder a shape mismatch
into a number.

## Tests
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **278 passed, 9 failed in 722s — exactly r43's numbers.** The visible
  failure is the same pre-existing racks-full voice-gate case r43 named
  (next-day gate expectation). This run modifies zero tracked game files
  and adds no files to the check list, so all 9 are pre-existing on base,
  not caused here. Zero regressions from this run.
- Divergence tool + pilot driver are node --check clean; the pilot itself
  exited 0.

## Metric review
- DIVERGENCE-VALIDATION's +1 convention: r43's first-diff numbers were
  0-based. The tool's 1-based numbers are the ones to quote henceforth, with
  the convention stated — no re-scoring, just a counting rule written down.
- PILOT-PARITY as designed did its job: because the base is game-frozen, the
  pilot (not a full batch) is the right spend, and the run's value moved to
  the two r43 open items instead of burning four identical seeds.

## LANDING STATUS
- (pending)
