# sim-scale-onramp-round-1107 — blocked-restore census + uid-first chain matcher

Run: flesh-out loop, run fleshout-20261030T110704Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy at run start (trees sim-lackingline3-b, sim-warmthrestraint-b,
sim-woodshortline-b, plus journey trees) — NOT touched. This run worked
the 1015Z run's ranked-next items in order: (1) the blocked-restore
census, (2) the uid-carrying chain matcher. Not a fight-price arm, not a
damage buff, not a gate move.

Both arms DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. Merged locally, pending
ship. No push, no version bump, no live verification (the batch ship
job owns deploys).

## Pre-registration (binding, per arm)

- sim-blockedrestore-a: prereg 9d872ddd8 (rebased; worker original
  a9f4fc650), committed BEFORE any judged analysis. Primary metric:
  band-wide census of tbEnd restore outcomes over the draftflag corpus.
  GO bars: prereg before judged analysis, pilot gate before the full
  sweep, 16/16 valid seeds, substrate rows byte-identical to chainclose
  minus additive fields, every tbEnd lost/dissolved row classified
  restored vs blocked with blocker uid/hp/wave/tile or honestly
  UNMEASURED with the named missing hook, determinism gate, sense bar.
  Horizon 180d death-aware; seeds 75101–75116; substrate tableseat-nowait
  exactly as chainclose used it. Analyzer only — no new recorder, no new
  sims; the draftflag corpus was left untouched.
- sim-uidmatcher-a: prereg cebdc99cc (rebased; worker original
  41186a838) + correction #1 0c1dfe15a (determinism comparison
  normalizes worktree-absolute harness paths; census still byte-identical
  unmodified) + correction #2 b4db6a371 (spawn-day chain→uid check for
  single-meeting spawn-day chains), all committed BEFORE the judged run.
  Primary metric: uid-first chain-matcher verdicts for the 4 chains +
  band drop classification rate. GO bars: prereg before judged analysis,
  pilot gate before the full sweep, 16/16 valid seeds, substrate rows
  byte-identical to chainclose minus additive fields, every chain gets a
  uid-trajectory verdict or a named missing link, twin-pair and drafted
  instances resolved by uid, determinism gate, sense bar. Anti-smuggling
  rule enforced in fixtures: no prior verdict file is read by the
  matcher; any verdict change vs a prior prereg is stated as a NEW
  judgment under this prereg, with the old verdict left intact.

## Arm 1 — sim-blockedrestore-a: DIAG-GO (LANDED)

Commits (rebased onto 15e86cade, proof re-run green post-rebase,
merged --ff-only): prereg 9d872ddd8, instruments 12a61a397, evidence
4b01a29e7. Proof on merged master: scripts/test-blockedrestore-a.js
FIXTURES-PASS 46/46. Determinism: two full census runs byte-identical,
scratch removed. Substrate: 16/16 byte-identical to chainclose.
Pilot gate passed (seed 75102: 12 tbEnd rows reproduced, reconciliation
MATCH, valid, errs 0). No jest run — analyzer/test are plain node over
committed JSON, so the --cacheDirectory rule was vacuous (recorded in
the prereg, not claimed).

Plain words: when a scholar loses a fight against a besieging beast,
the beast goes back to the wild about half the time and stays stuck in
the siege the other half — because another besieger is standing on its
tile. The barely-living 1-HP blocker from the last run is real, but it
is not the usual story: most blocks are healthy beasts, and sieges
drain one beast per scholar loss until the last one standing goes free.

Numbers (102 tbEnd events, 16/16 valid seeds, reconciliation MATCH 16/16):
- By result: won 66 (all by-design, slain), routed 12 (all by-design,
  routed lingerers), lost 24, fled 0.
- Lost population (the melt question): 11 restored (45.8%) / 13 blocked
  (54.2%) / 0 by-design / 0 unmeasured. Zero unclassified rows anywhere;
  the prereg's named gap (fighter-standing state at tbEnd) never
  materialized — every eligible not-restored row had an occupant.
- Dissolved: 120 scholarmelt meetings (dissolved-no-tbend, concentrated
  on s75102: 32, s75104: 45, s75105: 43) — UNMEASURED by construction
  (no tbEnd call; missing hook: a dissolve-path recorder), counted,
  never folded into blocked.
- Fled tbEnd population is empty (0 events) — the fled half of
  lingerer-keeps is unobserved, not a zero rate. Scholarmelt linkage
  24/24 (every tbEnd lost event links to a lost meeting).
- Blocker breakdown (13 blocked rows, full uid/hp/wave/tile in the arm
  evidence): all 13 blockers at (4,4), all 13 raidBorn fellow besiegers,
  11/13 lingering (2 with lingering expired by the drift valve but still
  on the tile). By wave: w1: 2, w2: 1, w3: 5, w4: 5. 12 distinct blockers,
  6 seeds.
- 1-HP blockers: 4/13 = 30.8% — hushwolf uid 13 (w1), warranty_caller
  uid 21 (w2), callback uid 33 (w3, blocking twice: d159 suburb and
  d162 eulogy). All four time-order floor-corroborated (draft row ending
  at hp 1 on a raid day before the tbEnd). Per the prereg rule (>50% =
  rule, ≤25% = rarity), 30.8% = COMMON BUT NOT THE RULE. The other 9
  blocks are healthy besiegers (hp 7–850, including a full-HP 850
  influencer). The fightSeq 23 case is the minority pattern, not the
  rule — and not a freak case.
- Mechanism refinement: 2–3 lingerers co-listed at (4,4) at once (raid
  draft + dawn re-pin don't check occupancy), while monsterAt returns
  the first — so "blocked" means "at least one fellow besieger still
  listed at the treeline," and sieges drain one beast per scholar loss
  (s75110 triple chain; s75102 influencer restoring 850→415→229 once
  last standing). The anchor reproduces exactly (s75116 d159, suburb
  uid 29 blocked by callback uid 33, 1 HP; callback restores itself the
  same day at 1 HP and blocks again d162).
- Correction disclosed in the arm evidence: the analyzer's floorDraftRow
  flag is ever-floored, not time-ordered — the anaconda blocker (hp 7 at
  d61) has a floor row dated d64, AFTER its block. Judged time-ordered
  floor count is 4, not 5; pattern verdict unaffected. Time-ordering
  that flag is ranked-next #3 for a future analyzer fix.

## Arm 2 — sim-uidmatcher-a: DIAG-GO (LANDED)

Commits (rebased onto 4b01a29e7, proof re-run green post-rebase,
merged --ff-only): prereg cebdc99cc, corrections 0c1dfe15a + b4db6a371,
instruments 0f1cda50f, evidence 308373afd. Proof on merged master:
scripts/test-uidmatcher-a.js FIXTURES PASS 12/12. Determinism (worker
gate, pre-rebase): 15/15; seed 75102 re-run via the existing verbatim
sweep-sameday-a.js — row path-normalized identical (63 raw diff lines,
all proven worktree-path-only), census byte-identical unmodified,
scratch removed. Substrate 16/16 byte-identical to chainclose (minus 3
additive fields); joins 0 errors; uid conflicts 0. Judged corpus: the
committed perseed-sameday-a corpus, 16 seeds, no new sweep, no new
recorder.

Plain words: matching beasts by who they are, not by how much health
they have left, settles the last disputed chain and finds one extra
drop the old way missed — and changes nothing else. The old
health-matching was nearly right; it was blind exactly where a beast
had been taxed at the palisade or had a twin.

Numbers:
- 4/4 BEAST-VANISHED chains resolved to a uid and judged under this
  prereg (prior verdicts quoted in the arm evidence with their prereg
  labels only; the matcher reads no prior verdict file — fixture-enforced):
  - s75102 algorithm → SCHOLAR-MELT (uid-first), uid 26, fightSeq 21
    d71 lift 959, same-day ORDER-PROVEN (meeting stamp seq 98 < fight
    seq 99, both night).
  - s75102 eulogy → LOSTSIGHT-REMOVE, uid 25, removal seq 41 d62,
    lostSight 7 > 6.
  - s75116 audit → SCHOLAR-MELT (uid-first), uid 28, fightSeq 21 d140
    lift 785.
  - s75116 suburb → SCHOLAR-MELT (uid-first) with toll-shaped bridge
    1285→960 (325 = round(1300×0.25)), uid 29, fightSeq 23 d159 — the one
    verdict hp-exact windows left INSUFFICIENT-DATA; the matcher also
    correctly refuses the other suburb fight (fightSeq 18, uid 25).
  - Uid window (fabUid) equals hp window (fabHp) on all 4 chains.
- Band drops, uid-first vs hp-exact: uid 29 vs per-id 28, difference
  exactly one named item — s75102 reunion 1200→1185 d79→80, uid 34
  (twin-pair artifact). Per-id-only drops: 0. Classification:
  7 DROP-VILLAGER-FIGHT / 4 DROP-SCHOLAR-RESTORED-WOUND /
  18 DROP-RAID-TOLL / 0 UNCLASSIFIED. Twin-pair resolutions: 1.
  Drafted instances: 10 census-visible toll→scholar-fight trajectories
  + 1 chain bridge (suburb uid 29) = 11.
- Uid-first changes exactly two things vs hp-exact on this band — one
  chain verdict (suburb) and one drop (reunion twin) — and leaves
  everything else untouched.

## Wall numbers (this run's judged corpora, report-only)

Substrate-identical to chainclose/draftflag/sameday, so the wall numbers
re-confirm rather than move: wins 9/16 (all lesser, full 0), national
ever 13/16, final 11/16, table 12/16, entered 9/16, wave reach
16/16/14/9/0, median survival 118d, deaths 527. Telemetry check vs
scale-wall baseline: quiet (16 fresh rows from
perseed-sameday-a/s*-fresh.json, 4 metrics, no large deviations) —
baseline NOT rolled forward; nothing deviated. Command:
node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/perseed-sameday-a/s*-fresh.json' --metrics
national,table,wins,exiled --sweep-rows.

## Reachability verdict

Waves 1–4 reachable; wave 5 unreachable on this band (0/16); the table
reachable only through the lesser seat via default-OFF instruments
(entered 9/16); the full seat unreached; wins only lesser, only via those
instruments. The two measurements close two more vanishing-beast blanks
rather than moving the wall: restore-blocking is now a counted
band-wide mechanism (not a single anecdote), and uid-first matching is
now the proven chain discipline (29/29 drops, 4/4 chains). What is
still unmeasured is downstream of the wall: the 120 dissolved meetings
with no tbEnd call (dissolve-path recorder is the named missing hook),
and the time-ordered floor flag fix.

## Village assessment (plain words)

The village in this band no longer watches beasts vanish for no reason,
on any technicality. A scholar who loses now either frees the beast or
leaves it pinned behind a fellow besieger standing on its tile — and
the records can say which, beast by beast, with the blocker named. A
beast taxed at the palisade and then beaten by a scholar is no longer
lost between two snapshots: its identity carries it through the toll,
the siege, and the fight. The wall itself has not moved — no full seat,
no wave 5 — but the comings, joinings, stuck returns, and identities
behind it are now accounted for.

## Metric review

Both preregs bound their runs and were honored: blockedrestore met every
bar (DIAG-GO); uidmatcher met every bar (DIAG-GO). Uidmatcher's two
corrections were committed before the judged run (determinism
path-normalization; spawn-day chain→uid check after the original rule
left the suburb chain UNRESOLVED in pilot — the pilot result is
disclosed in the arm evidence, not hidden). No metric was re-scored
mid-run. Prior verdicts were not re-scored: uidmatcher's suburb
promotion is a new judgment under its own prereg, stated as such, and
the matcher reads no prior verdict file. Proposed for the NEXT run only:
(3) time-order the blockedrestore floorDraftRow flag (analyzer fix, no
new corpus), then (4) a dissolve-path recorder for the 120
dissolved-no-tbend meetings, so the fled/dissolved half of
lingerer-keeps stops being unobserved.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0 on this
band, as on every band this cycle. No axis is converged. No gate number
was moved on this evidence, per the 2026-10-29 gate-sequencing note
(prove behavior normal before tuning gates to it). The rotation file is
NOT advanced: the standing directive suspends rotation until a run
demonstrates national reached. Sibling loop B's food-economy lane was
not touched; sibling journey-succession commits landed mid-run (zero
src/js, zero file overlap) and both arms were rebased onto them with
proofs re-run before merging. Safe-commit index clobber hit both
workers' commits (repaired by the workers, contents verified) and did
NOT hit the coordinator evidence commit. No EPERM flap this run.
Worktrees released as merged, branches deleted. Claim retired to .DEAD;
lock deleted.
