# sim-sortie-b — lingerer-sortie conversion arm (Loop A 20261103T0316Z, axis scale-onramp)

## Prereg summary (binds this run; full text: scripts/sortie-prereg-20261103.md)

- Question: the 1915Z diagnostic found a wave-4 Eulogy lingering at the
  treeline for 6 nights, each night offering "or send a sortie" — never
  taken, because no sim policy ever answered that offer. Does answering
  announced lingerer-sortie offers convert that zero into wave-4 deeds?
  This arm is the sortie link ONLY (not bundled with curious-escalation
  or feast-draw rates). POLICY-SIDE ONLY, zero src/js changes.
- Primary metric: distinct wave-4 monsters fought per seed
  (`Game.deedState().wavesFaced` entries with wave 4 at run end). Judged
  quantity: number of pilot seeds with >= 1 distinct wave-4 fought,
  variant minus baseline, on identical seeds. A fight counts when the
  engine records it (fled fights count — the deed is "faced").
- GO iff BOTH: (a) seeds-with->=1-wave-4: variant − baseline >= +2, AND
  (b) cost bar clean on all three legs: (1) total starvation deaths
  variant <= baseline + 2; (2) sortie-attempt-day deaths in variant
  <= 2 across the pilot; (3) median survival variant >= 0.8× baseline.
  Anything else = KILLED.
- Horizon: 180d death-aware cap (dead villages stop; no fixed-200d tail).
- Seeds: 98401–98408. Baseline: closecommit stack verbatim
  (leadfeast + windefer + seatdrive + fullseat-diag + titanroute +
  musterclose + mustergap), mode herald, env FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1. Variant:
  baseline + scripts/policies/sortie.js (`withSortie`): answers an
  ANNOUNCED gorge offer (say-tap on lines containing both "gorges at the
  treeline" and "send a sortie") with 'sortie' at most once per day, one
  attempt per offer, while the full-seat deed bars are unmet (w4 < 3 OR
  w5 < 2), game not over, no fight open. No RNG consumed by the layer.
- Comparison instrument: the identical-seed driver table (not the
  balanced panel — POLICY_REGISTRY in scripts/sweep-compare.js contains
  neither the closecommit stack nor the sortie wrapper, and editing the
  observer mid-comparison would change the instrument; stated in the
  prereg before any sim, not discovered after).

## Salvage + seed-freshness re-verification (done before any judged sim)

- This run salvages the dead run fleshout-20261103T0203Z's uncommitted,
  never-run arm from ~/workspace/worktrees/sim-sortie-a/scripts/:
  sortie-prereg-20261103.md, sortie-driver-20261103.js,
  policies/sortie.js. Copied VERBATIM (cmp-clean against the source
  tree); the old tree was not modified. Committed as this run's first
  commit e0f0d8e8 BEFORE any judged sim.
- Seed freshness re-verified by exact-token grep over all 71,499 tracked
  scripts/ + evidence/ files in this worktree: 340 raw "9840[1-8]"
  token hits, ZERO with any seed-proximity (no "seed" field, SEEDS list,
  seed filename, or seed mention within 25 chars before the token).
  Every hit inspected in class: pantry-kcal values (e.g.
  pantryFreshBefore 98402), float fragments, hashes, counts — the same
  false-positive class the original prereg noted. The one prereg that
  names 98401–98408 (scripts/wave4seek-prereg-20261103.md) names it only
  as a conditional fallback that was never triggered (that arm ran
  98301–98308). No seed showed prior judged use, so the band stands and
  the prereg was NOT amended; the 98501–98508 fallback was not needed.
- Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave law,
  escalation, tiers). The arm changes no canon and no game code.
- Index-clobber note: after the first safe-commit, the worktree's main
  index showed the three committed files as deleted (the documented
  safe-commit clobber class). Repaired with
  `git update-index --add --cacheinfo` from HEAD blobs; verified
  `git status` empty, `git diff HEAD` empty, hashes match. The commit
  itself was correct throughout.

## Before/after numbers (identical seeds 98401–98408; full table: sortie-compare-b.md)

- Seeds with >=1 wave-4 fought: baseline 5/8, variant 5/8. Delta **0**.
- Total distinct wave-4 kinds (descriptive, NOT judged): baseline 10,
  variant 11.
- Per-seed w4 counts, baseline → variant: 98401: 4 → 3; 98402: 1 → 3;
  98403: 0 → 0; 98404: 2 → 2; 98405: 2 → 2; 98406: 0 → 0; 98407: 0 → 0;
  98408: 1 → 1.
- Cost bar: (1) starvation deaths baseline 1 → variant 0 (PASS, bar
  baseline+2); (2) sortie-attempt-day deaths in variant = **27**
  (98401: 12, 98402: 5, 98405: 9, 98406: 1) — FAIL, bar <= 2;
  (3) median survival 90d → 90d (PASS, bar 0.8×).
- Availability: offers arrived on 4/8 variant seeds (64 offers total:
  98401: 17, 98402: 17, 98405: 21, 98406: 9; zero on 98403/98404/98407/
  98408). 47 attempts: 16 ok, 7 "no-fighters" (bench bare), 24 "none"
  (no lingerer present at answer time). Zero-offer seeds have
  byte-identical trajectories to baseline — the layer is inert without
  an announced offer, which is the control working.
- Proof test scripts/test-sortie-b.js PASSED before the pilot (both
  prereg legs: 24 forbidden roster/position API tokens absent from the
  policy file including comments; stub-Game determinism: one offer
  answered exactly once, second daily same day silent, met deed bar
  silent, game-over silent, zero random calls). Per the kill protocol
  the proof test is DELETED with the policy at closeout (see below) —
  its passing result is recorded here, not lost.

## Verdict: KILLED

Leg (a) fails (delta 0, needs +2) and cost leg (b2) fails (27, needs
<= 2). Legs (b1) and (b3) pass. A miss is NO-GO; the 98402 gain (1 → 3
wave-4 kinds) and the +1 total kinds are NOT re-scored as a pass.
Per the prereg kill protocol: the policy file
(scripts/policies/sortie.js) and the proof test
(scripts/test-sortie-b.js) are DELETED at closeout. Kept: prereg,
driver, per-seed JSONs, this evidence file, and sortie-compare-b.md.
No game-code change was ever made, so there is nothing to revert in
src/.

## Sense-test (read transcripts, judged for meaning — SENSE-TESTING LAW)

Read: /tmp/sortie-says-variant-s98402-spilot.json (d83–89),
s98405 (d79–87), s98401 (d54–58).

1. Sortie fights read as real, desperate fights, not tokens. "Priya,
   Meryem take up arms and a day's rations (4,146 kcal from the stores)
   and walk out to the treeline. Nobody's coming back the same." Then
   "The Callback mauled Priya (-47 health) over 3 rounds. They're lucky
   to be breathing. — the party falls back to the palisade, dragging
   their nerve with them. The treeline holds." Named people, real
   costs, retreat without victory — coherent with the game's
   violence-is-desperate law. The same two or three fighters get sent
   day after day (David and Priya mauled on d84, d85, d86, d88) — that
   reads as a thin bench being ground down, not as a narration bug.
2. The engine is honest about empty answers, and the policy does not
   listen. On 98405, after the Reunion offer queue drains, the policy
   keeps answering stale offers for 8 straight days (d80–87) and the
   engine replies each time: "Nothing holds the treeline. (No lingerers
   to sortie against.)" A phone player would stop pressing after the
   first such reply; the policy cannot, because it never reads the
   verb's return as "this offer is dead" — it only marks offers
   answered, never invalidated. 24 of 47 attempts (51%) returned
   "none" this way. The gorge announcements themselves stay honest
   ("0 kcal gone" once the stores are empty / the lingerer is gone).
3. The policy cannot aim. The offered name is only the announcement the
   layer heard; the engine picks the actual sortie target. On 98402
   the d85 attempt's offered name was Reunion, but the fight line says
   "The Callback mauled David" — a wave-3 monster, which earns no
   wave-4 deed. Likewise 98401's d55 attempt (offered Moderator, wave 2)
   fought the Influencer. So "sortie attempts by offered name" must
   never be read as "sortie fights by monster" — the deed record is the
   only honest ledger, and it is what the judged metric uses.
4. Cost is legible and steep: each sortie takes 2,299–6,180 kcal in
   rations on top of nightly gorge losses of 700–1,700 kcal per
   lingerer, and fighters return mauled (-47 to -86 health). The
   village pays this gladly in the transcript's tone — and still gains
   no judged ground. That is the finding, not a narration failure.
5. One soft incoherence, noted not chased: "Not enough fighters to
   send — a sortie needs at least two besides you, and the bench is
   bare" appears on days when the same village still fields other
   fights — the bench rule is sortie-specific, but the line reads as
   if nobody can fight at all. Minor; the engine's meaning is
   recoverable from context.

## Village assessment (plain words)

Picture eight villages, all running the same competent playbook. Every
one of them "wins" by about day 90 — takes a seat at the table, game
over — yet only one of the eight ever becomes national; the other
seven win while still regional. The win the sims keep producing is
not the climb the scale wall is about. Wave 4 unlocks in six of eight
villages (days 30–84) but wave 5 never appears anywhere, and no village
ever fights a wave-5 monster. When the village does hear the treeline
offer — a monster gorging on the stores night after night, offering a
fight — answering it sends real people out with real food, and they
come back hurt, and the village's wave-4 deed list barely moves: one
village gained two new wave-4 kinds (the Strike was already fought;
the Reunion and the Eulogy were added by sorties), another village
actually lost a kind off its list as its whole trajectory shifted,
and the rest stood still. The sortie is not a broken button — it
fires, it fights, it costs — it is a side door that does not lead
toward the scale wall. The wall itself is unchanged by this arm:
national 1/8, wave-5 0/8, in both arms.

## Wall numbers (pilot)

- National / table / wins: baseline 1 / 8 / 8; variant 1 / 8 / 8
  (table = tableDone, seat taken; national = rank national/global).
- Wave 4–5 unlocks: wave 4: 6/8 both; wave 5: 0/8 both.
- Median survival: 90d both (max 97d both). Caveat: all runs ended by
  win near day 90, so this is days-to-win, not days-to-death; the 180d
  death-aware cap never bound in this band.

## Required metrics (as far as this pilot band supports them)

- Win rate: 8/8 both arms (won flag; see the national caveat above —
  these wins are not national-scale wins).
- Vesting / national reach: national 1/8 both; vesting is not a field
  in this driver's output and is not claimed.
- Arc reach: not recorded by this driver (no arc field) — not claimed.
- Wave reach: wave 1–3 all seeds; wave 4 unlocked 6/8, fought 5/8;
  wave 5 unlocked 0/8, fought 0/8.
- Four-realm formation, trap acquisition by source, counter
  discovery / counter-kill rate, young-link succession survival,
  tier-2 and wave-3 reach: not instrumented in this driver — not
  claimed. Wave-3 fought is visible only incidentally (the Callback,
  wave 3, was fought via sorties on 98402).
- Median / max survival: 90d / 97d both arms.
- Death-cause shares: see sortie-compare-b.md (baseline 370 deaths,
  variant 377; villager combat ~55%, combat ~21%, the wild ~10%,
  expedition 5%; starvation 1 → 0; sortie combat 4 in variant).

## Metric review (for the NEXT run — never re-scored in this one)

1. Cost leg (b2) as written joins deaths to attempt records BY GAME
   DAY, so every death in the village on a sortie day counts — even
   deaths with nothing to do with the sortie. The day-join says 27;
   the death stream's own cause field says only 4 deaths carry cause
   "sortie combat". The leg still fails on either lens in spirit
   (4 > 2 as well), so this review does not rescue the verdict — but
   the next run should define the cost bar as fighter-attributed
   (cause "sortie combat" or deaths of the sortie party), not
   day-joined, or a busy village will always trip it.
2. The judged quantity (seeds with >=1 wave-4 fought) is coarse on a
   band where baseline already sits at 5/8: a +2-seed move needs
   converting two of the three zero seeds, and two of those three
   (98403, 98407) never received a single offer — no answer policy
   could have moved them. The next run should either pre-screen for
   offer availability or judge on offer-receiving seeds only.
3. The 'none' flood (51% of attempts) is a policy-design finding, not
   a metric problem: a 'none' return should invalidate the queued
   offers (the treeline is empty) until a fresh gorge line arrives.
   Worth one arm in a future round, but NOT bundled into this verdict.
4. All runs ending by win near day 90 means this band cannot speak to
   late-game survival or the post-day-90 lingerer window; a band whose
   villages do not win early (or a longer, win-deferred policy) would
   be needed to test sorties as a late-game deed source.
5. Balanced-panel limitation stands as preregistered (see prereg
   summary). No panel compare is attached; the identical-seed driver
   table is the comparison.

## Reachability verdict (content in this arm's area)

- Lingerer-sortie offers: REACHABLE — arrived on 4/8 seeds, 64 offers.
- Sortie fights: REACHABLE and played (real blow-by-blow fights with
  named fighters, rations, wounds) — 16 successful sorties.
- Wave-4 deeds via sortie: PARTIALLY reachable — 98402 gained Reunion
  + Eulogy via sorties, but the judged seed-level conversion did not
  happen, and the engine (not the policy) chooses the sortie target,
  so wave-4 targeting is luck, not aim.
- Wave 5, national scale, full-seat climb: NOT reached by this arm
  (0/8 wave-5, national 1/8 both arms, unchanged).

## Files

- Prereg / driver / policy (policy deleted at closeout per kill
  protocol): scripts/sortie-prereg-20261103.md,
  scripts/sortie-driver-20261103.js, scripts/policies/sortie.js (DELETED).
- Proof test (passed, then DELETED per kill protocol):
  scripts/test-sortie-b.js.
- Compare: evidence/2026-11-03/sortie-compare-b.md (the prereg's
  compare attachment, B-run name to distinguish it from the dead
  A-run's never-written compare).
- Per-seed JSONs: evidence/2026-11-03/perseed-sortie-a/ (driver's
  directory name, retained verbatim).
- Evidence: evidence/2026-11-03/sim-sortie-b.md (this file).
