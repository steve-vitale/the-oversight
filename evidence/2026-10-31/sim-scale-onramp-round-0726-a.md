# sim-scale-onramp-round-0726-a — coordinator evidence (PENDING REPO COMMIT — see § Infrastructure)

Run: loop A fleshout-20261031T0726Z, axis scale-onramp (converging, NOT converged).
Lock created 2026-10-31T07:26:21Z. Claim: hidden_files/lever-claims/fleshout-20261031T0726Z.json
(arms: sim-heraldhp-adopt-a, sim-mustercall2-a, sim-pocketcall-a). Rotation left at 3
(convergence work does not cycle it).

## Pre-registered method (this run's header)

- Primary question: does the scale wall move on measured evidence — national / table /
  wins, wave 4–5 unlocks, median survival — on the scale-onramp axis?
- Arms: 1 adoption (stranded B arm, rebase + proof + merge) + 2 DIAG arms, each with its
  own prereg written before judged sims. Pilot 8 seeds before confirm spend (both DIAG
  arms); death-aware horizons matching their parent arms' horizons.
- GO thresholds: per-arm preregs (see arm evidence files). Judge each arm against its
  own prereg only. No metric re-scoring mid-run (§14).
- Panel (§15): both DIAG arms are single-base measurements with no before/after
  comparison — declared NOT APPLICABLE as mustercall-b did, none fabricated.

## Stale-claim recovery (run start)

Loop B's 0436Z claim on scale-onramp was dead by every check: tree heartbeat
2026-10-31T06:14:48Z (75+ min stale at recovery), no B processes running, no B tree
writes since 05:18Z, B lock 3h old. Retired to .DEAD with a note (not a live-loop
touch). Its sighit-b + deadfall-b arms had already landed on master; only heraldhp-b
was stranded. B's own tree/branch were left untouched. B's later 0741Z entry
corroborates the recovery (heartbeat 86 min stale on its read, no processes, no
writes since 04:37Z). Loop B resumed 0741Z on food-economy (jointgate + strandfix2)
and closed clean during this run — untouched throughout.

## Arm 0 (adoption, coordinator) — sim-heraldhp-adopt-a: LANDED 70407e9f4

Stranded B commit 972cd3f73 rebased clean onto master (single commit, no file
overlap), proof 21/21 green on the rebased branch AND on merged master
(scripts/test-heraldhp-20261031.js, synthetic fixtures). Adopt worktree released and
removed, adopt branch deleted. B's own tree/branch left for B's reaper/closeout.
Verdict stands as B wrote it (evidence/2026-10-31/sim-heraldhp-b.md): Herald HP drop
attributed 420/420 = 100% — RAID 350 (palisade wall drafts days 106/123, 175 HP each)
+ FIELD 70 (three field fights 37/20/13). Backlog #1595 CLOSED by this landing.

## Arm 1 — sim-mustercall2-a: INSUFFICIENT-DATA (rebased 8b9911a50, proof 22/22)

Second-cluster mustercall census on FRESH band 86101–86116 (freshness verified four
ways before sims; instrument verbatim from mustercall-b; DIAG only, zero src/js).
Evidence: evidence/2026-10-31/sim-mustercall2-a.md + prereg sim-mustercall2-a-prereg.md.
Corpus: evidence/2026-10-31/perseed-mustercall2/leadfeast/s86101–s86116.json.

- Herald contacts: 0/16 — 0 scholar attempts, 0 field fights, 0 muster snapshots,
  0 muster verbs. Completeness 0/0 (undefined, not 100%).
- Wall: national 9/16, table 13/16, wins 12/16, wave 4 11/16, wave 5 0/16,
  median survival 90d, max 201d (ends: won 12, village-lost 3, survived 1).
- Located-but-unfaced: 5/16 end at omen stage 2 with zero Herald contacts
  (vs 3/16 mustercall-b). Two long seeds located and never met (86105 day 179 ->
  lost 192; 86106 day 158 -> survived 201).
- Censoring mechanism: 8/16 seeds end won on exactly day 90, before the Herald
  window opens. Wave-4 content itself is present (21 TB attempts fought, 7 field
  fights, 5 kills) — the emptiness is Herald-specific.
- #1550 holds on a second band: 0 feast-draw Herald attempts, 0 cast-sourced faces.
- Judgment: mustercall-b's "call 5 early / 9 late, ceilings >= 10 on five days"
  REMAINS A SINGLE-SEED (85106) CENSUS — neither generalized, bounded, nor
  contradicted. Q2 asymmetry vacuous here (no Herald fights on either channel).
  Sense-testing unanswerable on this band (0 transcripts is consistent with
  0 refusals, not instrument failure).
- Metric review (for the NEXT run, never a re-score): the pilot passed on
  omen-stage-2 alone (4 pilot seeds) and the confirm found zero contact — the
  next second-cluster arm must require a Herald CONTACT signal on >= 1 pilot
  seed, not omen stage, and prefer seeds lasting past day 120 un-won.

## Arm 2 — sim-pocketcall-a: DIAG-GO (rebased 90bd93f6f, proof 41/41)

Pocket-call census on the supply band 85101–85116, deadfall staffing ON (policy
reused verbatim, zero src/js). Evidence: evidence/2026-10-31/sim-pocketcall-a.md +
prereg sim-pocketcall-a-prereg.md. Corpus:
evidence/2026-10-31/perseed-pocketcall-a/census/s85101–s85116.json.

- 14 wave-4+ fights, only 3 ranged, classified 100% with zero instrument errors.
- ARMED 1: Maya Singh, s85103 d41, crude bow, 4 arrows, 4 shots / 48 dmg, vFlee —
  the band's only volley, reproducing deadfall-b exactly (same seed/day/fighter/
  weapon/shots/damage; fight identity 14/14, deadfall ledger exact, wall exact).
- NEVER-CALLED 1: Chloe Dubois, s85101 d87, crossbow, pile at fight time 209 sticks
  / 73 fiber / 164 stone — CALL-blocked, not supply-blocked.
- DRY-AT-FIGHT 1: Jovan Milic, s85106 d61, sling, carried 0, evade, pile 225/79/280
  — CALL-blocked.
- NEVER-DEPARTED 0, DRY-AT-HOME 0 (clean zeros with reasons in evidence).
- Sensed-reachable never-called subset: 0 of 1 — a clean zero. All four channels
  (same-node, same-grid <= 1, crew shout, party-follow) absent; scholar one node
  away is NOT sensed contact under the code's channels.
- Supply-blocked 0 on this staffed substrate. Wall: national 12/16, table 11/16,
  wins 11/16, wave 4 10/16, wave 5 0/16, median 95d, max 202d.
- Sense: Chloe "withdraws to report back" (post-fight contact exists, pre-fight call
  doesn't); Maya's volley scene has a crew shout that IS answered — the contrast is
  the census in miniature. Post-confirm probe (not judged): Jovan's day-60 pocket of
  6 stones spent through three same-day low-wave volleys before the wave-4 meeting
  — sling ammo is one-day-deep, so a departure-only top-up systematically misses
  late-outing wave-4 meetings.
- Caveat: 3 ranged fights in 3 villages, 13/16 seeds contribute zero — classes
  exact, generality not. DRY-AT-HOME unmeasured, not refuted.
- New findings (appended to the backlog by this run): patrol silence (0
  resolvePatrol in 203 departures — census is expedition-only); sat-out gate
  unrecorded (95/203 sat-outs, gate unrecorded — gate-attribution census needed
  before fixing departures); sling one-day-deep (call brief needs a top-up moment,
  not just a first-call moment); cross-node shout undefined (call design must
  define a shout range or accept node-locality).

## Wall (this run's judged corpora, 32 configs)

National ever 21/32 across bands, table 24/32, wins 23/32, wave 4 21/32,
wave 5 0/32, full seat 0. Overall wall UNCHANGED: full seat 0, wave 5 reached 0
stands. No food-economy default flipped, no scale default flipped, no game-code
change landed anywhere in this run (all three arms measurement-only).

## Village assessment (plain words)

The villages climb well — roughly two in three win, most reach national — and the
Herald barely enters their stories: on a fresh band of sixteen villages it never
meets anyone at all, even on seeds where scouts found its lair and the village
lived another month. The one seed where the Herald did arrive, in the older census,
still stands as the only story we have of it: a neighbor that keeps walking onto
the scholar's tile while the village holds nine answerable blades and a button it
never presses. On the supply side, the village finally has sticks in the pile and
a bow that sings once — one volley, in one fight, on one seed — while the other
two bow fighters in the whole band fight dry or never get called at all, one of
them standing a single node away from the scholar with no shout that reaches her.
The wall, seen from this run, is not a pile problem anymore and not a numbers
problem: it is a decision problem — nobody calls, nobody marches — plus a
contact problem — the titan and the village keep missing each other.

## Telemetry deviation check (step 10)

Run on both corpora against hidden_files/telemetry-baselines/scale-wall.json
(--metrics national,table,wins,exiled): REFUSED by the tool itself on both
("recorder-corpus input: all 16 rows carry top-level anchorCommit ... compared
with sweep-compare tables, never against a run baseline here") — same class as
the 0342Z stickfiber refusal. No comparison performed, no LOUD lines, baseline
NOT rolled. Forcing it with --allow-recorder-corpus was NOT done: the baseline
is a run baseline, not recorder shape, and the tool's refusal is a design guard.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. Second-cluster hunts must gate their pilot on a Herald CONTACT signal, not
   omen stage (mustercall2 lesson above).
2. Pocket-call classes must stay mutually exclusive with a sensed-contact test
   defined before sims; adjacent-node must not silently count as contact.
3. Any future call arm wanting a bigger ranged sample needs a substrate that
   produces more ranged meetings, not just more seeds (pocketcall caveat).

## Convergence state

scale-onramp stays converging (NOT converged): the muster-call headline is still
a one-seed census, the pocket-call hole is now sized (1 never-called unreachable
+ 1 dry-at-fight spent against 1 armed volley) but no call design is built, and
wave 5 is still 0 everywhere. Next blanks, in order: (1) a second-cluster hunt
with a CONTACT-signal pilot gate + seeds lasting past day 120 un-won; (2) the
pocket-call design inputs — patrol silence, sat-out gate attribution, a top-up
moment for one-day-deep sling ammo, a cross-node shout definition — design
decision first, then build; (3) the #1538 ruling still pending before any
muster-routing build; (4) the unrun SPEAR slot proof + XBOW top confirm variants
(partyvolley ranking). food-economy stays converging (untouched; sibling Loop B
lane, 0741Z closed clean).

## Infrastructure

- Master moved under the run (journey landing r78 5cd3184ef, loop B 0741Z
  coordinator evidence b000ff356) — zero file overlap with any arm.
- ff-only correctly refused both diverged worker branches; both rebased clean in
  their own worktrees, proofs green after every rebase and on merged master
  (mustercall2 22/22, pocketcall 41/41, heraldhp 21/21).
- Safe-commit index clobber hit both worker commits (repaired via cacheinfo,
  commits verified correct, trees clean).
- check.js --quick NOT re-run (zero src/js, zero policy-default flips; arm proofs
  green on merged master — same disclosure class as 0643Z/0342Z).
- EPERM flap on .git ref writes ACTIVE at closeout (see below). No ref surgery
  forced at any point.
- Worktrees released as merged, branches deleted: sim-heraldhp-adopt-a,
  sim-mustercall2-a. sim-pocketcall-a tree removed, branch LEFT (merged).
- Claim retired to .DEAD; lock deleted. Merged locally, pending ship.

## Infrastructure (closeout flap — READ THIS FIRST on recovery)

At closeout the container EPERM flap blocked .git ref writes: pocketcall branch
deletion failed twice ("couldn't write packed-refs.new: Operation not
permitted") and coord-0726-a worktree registration failed three times on the
same write class (no stale .lock files present, no git processes running — a
live flap, not debris). NOTHING was forced. Consequences, both harmless but
both needing a later pass when writes clear:

1. Branch sim-pocketcall-a still exists although FULLY MERGED (tip 90bd93f6f is
   an ancestor of master). Recovery: cd ~/workspace/the-scattering &&
   git branch -d sim-pocketcall-a ; verify with git branch --list sim-pocketcall-a
   (empty). Do NOT re-merge: the content is already on master.
2. THIS coordinator evidence file could not be committed into the repo during
   the flap. It is staged at
   ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/coord-evidence-pending/sim-scale-onramp-round-0726-a.md
   (this file). Recovery when writes clear: register a coord worktree
   (bash scripts/worktree-register.sh coord-0726-a oversight-flesh-out-loop
   "longsim: coordinator evidence round 0726Z"), copy this file to
   evidence/2026-10-31/sim-scale-onramp-round-0726-a.md inside it, commit with
   scripts/safe-commit.sh "Loop A round 0726Z: scale-onramp coordinator evidence
   (heraldhp adopt + mustercall2 INSUFFICIENT-DATA + pocketcall DIAG-GO, merged
   locally pending ship)" -- evidence/2026-10-31/sim-scale-onramp-round-0726-a.md,
   merge --ff-only coord-0726-a from ~/workspace/the-scattering, release +
   remove the worktree, delete the branch, verify git status --short empty.
   Until then, the tracker entry + this pending file are the run's record, and
   the worker evidence files (already on master) carry the judged numbers.
