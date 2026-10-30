# sim-uidmatcher-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1015Z (coordinator-assigned
worker sim-uidmatcher-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #2 from run fleshout-20261030T1015Z
(evidence/2026-10-30/sim-scale-onramp-round-1015.md).
DIAG ONLY, measurement only, zero src/js game changes, no default flip,
no gate move, no deed-bar move. No [needs-eyes] (diag only, nothing
for Steve to playtest).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft;
bands damage 35-95, HP 850-1500). NO CANON-registered doc covers chain
matching, uid trajectories, or drop classification — the matcher below
is measurement-defined from recorded engine events, stated exactly so
it can be checked, and is NOT canon. Governing canon rules: CANON.md
"Monster encounters are fought, not rolled" and the perception law
(Steve 2026-10-28): tile-mate presence is REPORTED from recorded state
only, never fed into any decision.

## Question (verbatim from the assignment, never re-worded into a verdict)

Prior arms established: hp-exact matching misses drafted instances
(suburb 1285→960 toll bridge) and a twin-pair drop (s75102 reunion
1200→1185); uid-trajectory matching classified 29/29 drops vs 28 by
per-id (sim-removal-a). Question: does a uid-first matcher (census
uid first, hp second) re-judge the 4 band chains (s75102 eulogy,
s75116 suburb, s75102 algorithm, s75116 audit) and the band drops
consistently, and what does it change vs hp-exact — without smuggling
one prereg's identity proof into another prereg's verdict window?

## Band and substrate (binding)

- Seeds 75101-75116 (16, the chainclose/recurrence/scholarmelt/
  removal/sameday/draftflag band), 180d death-aware horizon (dead
  villages stop simulating; +10d tail max per MEASUREMENT.md §10).
- Policy: scripts/policies/tableseat-nowait.js VERBATIM, exactly as
  chainclose used it.
- Game substrate env (verbatim from chainclose/sameday): LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1, BREAKLINE=1, TILEJOIN=1,
  SHOUTREC=1, JOINENDLINES=1, plus the record-only switches
  SCHOLARMELT=1, REMOVAL=1, SAMEDAY=1 (no game behavior reads any of
  the three — proven non-perturbing by the prior arms' substrate
  legs, and re-proven here by the row byte-identity leg).
- JUDGED CORPUS (no new sweep, no new recorder): the COMMITTED
  evidence/2026-10-30/perseed-sameday-a/ corpus (row + enriched uid
  census per seed). It already carries, in ONE run, everything the
  matcher needs: w4dpr field meetings, fieldparty logs, scholarmelt
  scholar fights, removal spawn/removal events with object-identity
  uid, sameday part/sequence stamps, and the uid census. Reusing it
  is the point of this arm: the matcher is an ANALYZER over existing
  recorded events, not a new instrument.
- GAP ASSESSMENT (explicit, as the assignment requires): NO new
  recorder is needed, because no question below requires an event
  the existing corpus lacks. Chain identity comes from the census
  uid + spawn events; chain ends come from removal events with the
  same uid; scholar-fight linkage comes from a removal event for
  that uid on the fight's day at the fight's lift hp; same-day
  order comes from sameday stamps. Draftflag events are NOT needed
  here (draft dating is draftflag's job; this matcher links through
  the removal uid, never through a draft event). If the judged run
  finds a chain whose identity cannot be resolved from these events,
  it is reported as UNRESOLVED with the missing link named — never
  filled from another corpus's verdict.
- This arm's ONLY new code: scripts/analyze-uidmatcher-a.js (pure
  analyzer: reads corpus JSON, never touches game state; chains via
  the REQUIRED buildChains from scripts/analyze-chainclose-a.js —
  never re-implemented, never edited there; fates via the REQUIRED
  censusMatch/classifyFate/opportunity from
  scripts/analyze-recurrence-a.js — never re-implemented; scholar-
  fight classification via the REQUIRED classifyFight from
  scripts/analyze-scholarmelt-a.js — never re-implemented; removal
  classification via the REQUIRED classifyRemoval/classifyDrop/
  uidTrajectories/uidDrops/perIdDrops from
  scripts/analyze-removal-a.js — never re-implemented, never edited
  there; same-day stamp joins via the REQUIRED meetingJoinOk/
  fightJoinOk comparators from scripts/analyze-sameday-a.js —
  never re-implemented), and scripts/test-uidmatcher-a.js
  (fixtures + determinism check). Prior recorder/policy/analyzer
  files are reused VERBATIM and never edited — the final worktree
  diff must show zero changes to them.
- The row minus the three additive fields (`sameday`,
  `scholarmelt`, `removal`) must be byte-identical to chainclose's
  row per seed (recomputed here over the sameday corpus with the
  same strip transform sameday used).

## The uid-first matcher (binding, fixed here)

Universe: joined rows with fieldparty wave == 4 AND channel ==
'field' (wild shape only), all callers — joined exactly as sameday
joins them (fieldparty/w4dpr/breakline/shoutrec/tilejoin index-
aligned, mid/vid/day verified at every index). Chains are
buildChains over that universe. Chain ends are the BEAST-VANISHED
chains under censusMatch/classifyFate on THIS corpus's census.

### Step 1 — chain → uid resolution (uid first, hp second)

For a chain (seed, mid, meetings with day/mHpStart/mHpLeft), a
census uid trajectory is a RESOLUTION CANDIDATE iff ALL hold:
(a) the trajectory's id == mid and its census wave == 4;
(b) a spawn event for that uid exists in the seed's removal
    events with id == mid (the object's birth is recorded; a
    fled re-entry spawn also counts as a spawn event, but the
    FIRST spawn event for the uid is the birth used here);
(c) for EVERY chain meeting day D on which the census carries
    an entry for that uid, entry.hp == meeting.mHpStart
    (census snapshots are start-of-day state, so the day-D
    snapshot is the pre-meeting hp — this is hp as a CHECK on a
    uid trajectory, never as the identity);
(d) at least one chain meeting day has a census entry for that
    uid (otherwise the trajectory is uncheckable and cannot
    resolve the chain).
Resolution verdicts: exactly one candidate → RESOLVED(uid);
zero candidates → UNRESOLVED (reason: no-spawn / no-census-hit /
hp-check-failed, named per chain); more than one candidate →
AMBIGUOUS (all candidate uids listed, never picked by hp).
A chain with no resolution gets NO end verdict from this
matcher — it gets the named missing link instead. Hp is never
used to choose between two uid candidates.

### Step 2 — uid-linked scholar fight (identity from the removal uid)

A scholar fight f (same seed, from the seed's scholarmelt
meetings) is UID-LINKED to a resolved chain iff ALL hold:
(a) f.lift.id == chain mid and f.lifted === true;
(b) a removal event e exists for the chain's uid with
    e.day == f.dayStart, e.monster.hp == f.lift.hp, and a
    startCombat stack (the uid's own lift record — the removal
    event IS the identity proof, not the chain hp);
(c) f.dayStart lies in the chain's uid window [lastDay,
    windowUpper], where lastDay is the chain's last meeting day
    and windowUpper is the uid-based first absence: the first
    census snapshot day after lastDay on which the uid is
    absent (for a vanished chain the uid never returns, so
    this equals the hp-based firstAbsentDay in practice; both
    are reported and any disagreement is flagged, never hidden);
(d) if f.dayStart == lastDay (same-day fight), the sameday
    stamps must prove order: the last meeting's stamp seq <
    the fight's stamp seq AND meeting dayPart <= fight dayPart
    (stamps resolved by the sameday join-index method: meeting
    stamp by w4dpr index, fight stamp by scholarmelt non-orphan
    index). A same-day fight without ORDER-PROVEN stamps is NOT
    a match — it is a near-miss with the failed rule named.
Note what this deliberately does NOT require: f.lift.hp ==
chain remainingHp. A drafted instance (chain hp bridged by a
toll between the last meeting and the fight) links by uid
even when hp differs — that is the whole point of uid-first.
The hp gap, when present, is reported as a BRIDGE (chain hp →
lift hp, with the toll-shaped amount named if it equals
round(maxHp × 0.25), otherwise as an unexplained gap that the
removal/draftflag corpora may explain but this matcher does
not assume).

### Step 3 — end verdict (this prereg's judgment only)

For a resolved BEAST-VANISHED chain, in priority order:
1. If a uid-linked scholar fight exists in the window (earliest
   dayStart, then lowest fightSeq wins if several): the verdict
   is that fight's classifyFight fate, mapped as: SCHOLAR-
   FLEE-MELT or DISSOLVED-MELT → SCHOLAR-MELT (uid-first);
   SCHOLAR-KILL → SCHOLAR-KILL; SCHOLAR-RESTORED → NOT-AN-END
   (the beast came back — fall through to rule 2, and if no
   later end is found the chain is INSUFFICIENT-DATA with the
   restored fight named, never called vanished by a fight);
   SPAWN-ENDED / BYSTANDER-OR-NONMONSTER / UNCLASSIFIED →
   INSUFFICIENT-DATA with the fight's fate named.
2. Else if a removal event for the uid exists in the window:
   the verdict is classifyRemoval(event, seed fights) — e.g.
   LOSTSIGHT-REMOVE, SCHOLAR-MELT via its linked fight,
   VILLAGER-KILL — reported with the event's seq/day/stack
   class evidence.
3. Else INSUFFICIENT-DATA with the missing link named
   (no uid-linked fight in window / no uid removal in window /
   same-day stamp failed — whichever applies).
ANTI-SMUGGLING RULE (binding): this matcher reads NO prior
arm's verdict file as an input. Prior verdicts (scholarmelt,
removal, sameday) appear ONLY in the evidence file's comparison
table, quoted from the committed evidence files, labeled with
their prereg. If a verdict under THIS prereg differs from a
prior arm's verdict for the same chain, the evidence states it
as a NEW judgment under this prereg and keeps the old verdict
intact beside it — never as a correction, promotion, or
overturn of the old verdict. The old verdicts stand under
their preregs whatever this arm finds.

### Step 4 — band drops, uid-first vs hp-exact (binding)

On THIS corpus's census per seed: uidDrops (adjacent-snapshot
drops on one uid, wave-4 ids) vs perIdDrops (first-entry-per-
day per id, wave-4 ids), both REQUIRED from analyze-removal-a.
Every uid drop is classified with the REQUIRED classifyDrop
(ctx: seed removal events, seed joined meetings, seed
scholarmelt fights). Report: uid drop count, per-id drop
count, the symmetric difference as named items (each drop by
seed|mid|fromDay→toDay|fromHp→toHp with its uid), classification
counts for uid drops, and the uid-drop UNCLASSIFIED count.
The twin-pair case (s75102 reunion 1200→1185, named in the
assignment from removal-a) must appear in the difference
explicitly or the difference is reported as unexplained.
Drafted-instance count (band): uid trajectories whose census
drop is toll-shaped (drop == round(maxHp × 0.25) with a
haven-tile move) AND that later have a uid-linked scholar
fight — counted, not just exemplified. Twin-pair resolution
count: uid drops that per-id misses, counted as items.

## Pilot gate (binding, before the full analyzer run)

Fixtures (scripts/test-uidmatcher-a.js) green, including a
synthetic drafted-instance case modeled on the suburb shape
(chain hp 1285, fight lift 960, removal event for the chain's
uid at lift hp on the fight day → matcher RESOLVES and links,
while an hp-exact matcher on the same fixture does NOT link)
and a synthetic twin-pair case (two same-id uids on one day →
per-id drops miss one, uid drops find both).
Then a PILOT analyzer run on seeds 75102 + 75116 only: the
s75102 row-minus-additive must be byte-identical to chainclose
for the pilot seed, and the matcher must resolve the pilot
seeds' vanished chains (algorithm, eulogy, audit, suburb) or
name the missing link for each. Only then the full 16-seed
analyzer run. A pilot failure stops the run — no judged full-
band numbers are reported from a failed pilot.

## Determinism gate (binding)

Re-run the EXISTING scripts/sweep-sameday-a.js (verbatim, no
edits) for seed 75102 into a worktree-local scratch dir
(never /tmp — sibling cleanup wipes /tmp), then compare its
row + census byte-for-byte against the committed sameday
corpus for 75102. The scratch dir is removed in a finally
block (never exit inside try — the removal-a instrument
lesson); the gate passes only if row IDENTICAL, census
IDENTICAL, and scratch-removed is true.

## GO bars (all must pass for DIAG-GO)

| Leg | Bar |
|---|---|
| Prereg | committed before judged analysis |
| Pilot gate | fixtures green + pilot-seed substrate identity + matcher resolves (or names the missing link for) all 4 pilot vanished chains before the full run |
| Seeds | 16/16 valid (days > 0, all recorder errs 0, overflow empty, census present/sorted/within-1, every census entry carries a uid) |
| Substrate | every row minus `sameday`, `scholarmelt`, `removal` byte-identical to chainclose, 16/16 |
| Chains | all 4 BEAST-VANISHED chains get a uid-first verdict or a named missing link; vanished set agrees with recurrence's 4 pairs |
| Drops | uid-drop classification rate reported with counts; uid drops vs per-id drops differenced item by item; twin-pair + drafted-instance resolutions counted |
| Uid consistency | one uid never carries two monster ids, band-wide (0 conflicts) |
| Determinism | seed 75102 re-run row + census byte-identical, scratch removed |
| Sense | sample chain narratives (fieldparty/w4dpr logs + scholar traces) for the judged chains read end to end for meaning, not just counts |
| Fixtures | test script green before judged sweep analyzed |
| No-smuggling | matcher code contains no read of any prior arm's verdict/analysis file; comparison table quotes prior verdicts with their prereg labels only |

Failure of any leg → DIAG-NO-GO with the failed leg named.
A corpus that cannot answer a chain (no spawn, no census hit,
no removal) is INSUFFICIENT-DATA for that chain, not a run
failure — but it must be named, never silently dropped, and
if all 4 chains land there the verdict is INSUFFICIENT-DATA
overall.

## Wall numbers (report-only, this corpus)

Wins, national ever/final, table reached/entered, wave reach
1-5, median survival, deaths — reported from this corpus as
its own numbers (a consequence of substrate identity, never a
before/after). Telemetry vs the scale-wall baseline is the
coordinator's step, not this worker's.

## Sense bar (binding)

Read the judged chains' villager logs + matched scholar traces
end to end (analyzer --sense mode prints them) and judge
meaning: does the uid story read as one beast's story, or as
two records stapled together? Report the sense verdict per
chain in plain words, including the node-sim limitation
(Game.say stubbed to no-op, so no say transcript exists —
evidence is the structured trace).

## PREREG CORRECTION #1 (committed before the pilot run and before
any judged analysis — determinism comparison only)

The determinism gate as first written ("row + census byte-
identical") cannot hold literally across worktrees: removal and
fieldparty stack frames embed the WORKTREE-ABSOLUTE harness path
(e.g. .../worktrees/sim-sameday-a/scripts/policies/... in the
committed corpus vs .../worktrees/sim-uidmatcher-a/... in this
worktree's re-run). Removal-a disclosed exactly this limitation
(determinism holds within one worktree). The gate is therefore
restated, before any judged analysis, as: the scratch re-run's
row, with the two worktree-absolute harness path strings (the
committed corpus's worktree path and this worktree's path)
normalized to one placeholder, must be byte-identical to the
committed sameday row for seed 75102; the census must be
byte-identical UNMODIFIED (it carries no paths); and the
scratch dir must be removed. The test script reports raw
equality AND normalized equality separately, and fails unless
every raw difference is a path-string difference. No metric,
window, matcher rule, or GO leg changes — this is a comparison
normalization for a known path artifact, not a verdict change.
