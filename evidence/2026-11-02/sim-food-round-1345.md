# Loop B 1345Z round — food-economy: vetobudget confirm (DIAG) + homeward substrate (DIAG-NO-CANDIDATE)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T1345Z,
axis food-economy (second non-converged axis). Claim written before
any sims; deleted at closeout (see closeout section). Pre-flight:
main tree clean, disk 21%, reaper removed nothing sibling-owned
(active 5/16 at pre-flight; dirty trees belonged to other owners and
were correctly left alone). Sibling Loop A live on scale-onramp
throughout (1340Z claim: sim-bearerorder-a, sim-musterupkeep-a, then
1424Z natflag/rosterreturn) — NOT touched; Loop A landed twice
mid-run and the build lane landed loot-taper + monster-commitment
mid-run. Zero file overlap with either arm. Zero src/js changes in
either arm.

## Arm sim-vetobudget-confirm-b: DIAG (pilot GO unconfirmed, not overturned)

Worker commits (rebased onto master, proof re-run, merged --ff-only):
prereg e87756603, instruments 10f1e8eb3, evidence 520c307d8.
Proof re-run green on rebased tip and on merged master: pilot
scripts/test-vetobudget-b.js 27/27, confirm
scripts/test-vetobudget-confirm-b.js 14/14. This arm answers 1233Z
food-economy blank 1 (vetobudget confirm: 12–16 seeds, longer
horizon, route-reopen rate).

Prereg (committed before any judged sim): fresh band 66001–66016,
60 loop-days, death-aware, guard-only vs guard+budget on identical
seeds, pilot substrate flags. Primary P2+P3 (pilot metric review:
P1 is weak because baseline per-day was already 3 = budget, so P1
reported only, never carrying the verdict). No-harm bars as in the
pilot plus player-flagged deaths reported separately and a stronger
identity check (pantry kcal + roster count/ids + positions + kcal +
forage counts, not just day snapshots).

Judged numbers (60d, identical seeds, DEPOSITGATE=0):
- Baseline vetoes band-wide: 3 total, 1 silent, all on seed 66006
  only (day 34: two spoken vetoes on two steps; day 35: one silent
  veto on (3,3)->(5,3)). Repetition definition (>=6 total silent
  OR >=4 distinct days) returns 0 repetition seeds. Budget
  engagement: 0 abandonments, 0 suppressions.
- P2/P3 pass vacuously (no step over 3 days or 3 total silent
  armed); P1 moot. No-harm bars all pass at exactly 1.00x: median
  survival 60d = 60d; deaths 236 = 236 identical modes;
  player-flagged deaths 18 = 18 (new separate bar works);
  failed-trip share 0.421 = 0.421; mean daily haul 318.1 = 318.1,
  worst per-seed ratio 1.00x; away day-ends 28 = 28; forageTrips
  2086 = 2086; veto-created pockets 0.
- Identity: 0 divergent day-records across 960 day-records, all
  16 seeds. Transcripts byte-identical on all 16 seeds. Scope
  stated: snapshots, not full game state (no codex/trust/
  inventory/monster comparison).
- Route-reopen: UNTESTED — 0 abandonments, so 0 later baseline
  passes and 0 structural violations, both vacuously. The
  permanent-abandonment cost remains an open question after
  two runs.
- Wall (60d, in-window only): national / table / wins 0 both
  legs (expected pre-seat profile, not a regression); median
  survival 60d; driver wave reach 1–3, wave 4–5 unlocks 0,
  full seat 0.

Panel (§15, context never verdict): combined 32-case campaign,
sourcesStable true, neutrality matched (seed 66001, 0 warnings);
rows identical on 15/16 seeds. Exception: seed 66005 splits
(waveReach 3 vs 2, panel-counted deaths 21 vs 13), and the panel
substrate differs from the driver's on the same seeds (loses
village 66002 day 59 where the driver survives it 60d; waveReach
4 on 66004 vs driver's 3). Reported as-is with the caveat; it
does not overturn the driver's judged identity. Split-panel
compare returns INVALID ("Unmatched policies / Unmatched
cases"), attached as-is, same structural class as the pilot.
Backlog item appended (outside this arm, not chased):
sim-findings line 1826 — panel/driver substrate divergence on
66001–66016 must be isolated before panel rows are pooled with
driver bars.

Sense / village assessment (plain words): villages read as
living places — a struggling 66002 (88% failed trips, 96
kcal/day, fever running through the month, yet alive at day
60), a rich 66012 (773 kcal/day, 4 deaths), 66013 pressed by
Thornfield and The Bloodied runners over shared ground.
Deaths are combat deaths, not starvation. Nothing robotic
flagged; the one silent veto never reaches a line and the
scholar ends that day home and fed.

Verdict: DIAG. A confirm cannot be judged on a band that does
not carry the phenomenon, and a DIAG on an empty band is
neither a GO nor a NO-GO. The 1233Z pilot GO stands
UNCONFIRMED and UNOVERTURNED. Worker recommendation, adopted
as the next blank: do not spend another full two-leg confirm
on an unqualified band — qualify first with a guard-only
screen (band must carry >=1 repetition seed at baseline) and
only then run the armed leg, or re-qualify the pilot band at
60d as a stated horizon extension rather than a fresh confirm.

## Arm sim-homeward-substrate-b: DIAG-NO-CANDIDATE (validation VALIDATED, screen empty)

Worker commits (rebased onto master, proof re-run, merged
--ff-only after a premature-release recovery, see
Infrastructure): prereg 6a863af07, instrument f1c7013db,
results 6e4ba33e9. Proof re-run green on rebased tip:
scripts/test-homeward-substrate-b.js 11/11,
scripts/test-homext-abl-b.js 21/21,
scripts/test-homeveto-screen-b.js 10/10. This arm answers
1233Z food-economy blank 2 (homeward-extension substrate:
approach-clean trip screen, with shadow-vs-armed E validation
first). DIAG vocabulary only — never a GO/NO-GO for the
extension itself.

Validation (prereg bar: matched-prefix agreement 100% on both
seeds — MET): fresh shadow + armed legs on 61807 and 64601,
reused driver unchanged, same substrate (30d, DEPOSITGATE=0).
- 61807 day 4: 6/6 agree — walk-out (4,4)->(2,4)->(1,4)->
  (1,2)->(1,1)->(2,0) all E-pass under both, entry hop
  (2,0)->(3,0) E-fails under both.
- 64601 day 17: 3/3 agree — (4,4)->(2,4)->(1,4) pass both,
  (1,4)->(1,2) E-fails both (vetoed under armed).
- Fresh day logs reproduce the stored predecessor day logs
  hop-for-hop on all four legs.
- The predecessor's divergence claim does NOT reproduce — and
  it contradicts its own run's stored files, which already
  show the 61807 approach hops passing. Provenance left open
  (possibly an older guard version's E), not cited as data.
  No mechanism was needed because there is no disagreement.

Screening ledger (8 bands, 64 seeds, budget spent,
first-qualifier rule — none qualified; bands verified clean at
seed level across all evidence md; the 65001–65701 range was
rejected as used by October arms; no banned band touched):

| Band | Base/armed away | Armed vetoes (silent) | Armed homeV | Base episodes (homeward) | Candidates |
|---|---|---|---|---|---|
| 67001–67008 | 0 / 0 | 0 (0) | 0 | 0 (0) | 0 — dead band |
| 67101–67108 | 13 / 12 | 10 (5) | 4 | 1 (1) | 0 — shape A |
| 67201–67208 | 8 / 5 | 7 (2) | 0 | 1 (1) | 0 — approach E-fails |
| 68001–68008 | 8 / 9 | 11 (6) | 4 | 1 (0) | 0 — shape C |
| 68201–68208 | 14 / 8 | 79 (76) | 0 | 1 (0) | 0 — approach E-fails |
| 68701–68708 | 2 / 2 | 2 (0) | 0 | 1 (0) | 0 — non-homeward only |
| 69101–69108 | 1 / 1 | 0 (0) | 0 | 0 (0) | 0 — dead band |
| 69201–69208 | 1 / 1 | 36 (34) | 0 | 0 (0) | 0 — dead band |
| Total | 47 / 38 | 145 (123) | 8 | 6 (2) | 0 |

The important non-qualifier finding (documented, NOT
re-scored — metric binding): armed homeward vetoes now fire
on natural bands for the first time (8 total, vs 0/80 in all
prior runs), but in shapes the prereg's homeward-entry
definition excludes:
- Shape A (67105): outward entry + homeward escape-attempt
  vetoes (4). Shadow walks out through E-passing ground to
  (7,1), camps days 5–9 failing; armed vetoes the homeward
  escape attempts and keeps it on escapable (7,2). Also
  proves E is time-sensitive: E((7,1)) passes at walk-out
  but the day-end sim fails after foraging depletes lateral
  stock.
- Shape C (68001 day 8): mid-trip homeward fence from
  escapable ground (4 homeV, veto-origin 4/0) — scholar at
  passing (2,8) is vetoed stepping homeward into no-escape
  (4,8).
- Shape B (67204, 68207): approach E-fails (64601 shape);
  homeward step never attempted under guard. 68207 also
  carries the extreme silent-repetition pattern (79 vetoes,
  76 silent).

Wall (30d pre-seat profile, expected not a regression): all
16 screening legs median survival 30d, survived 8/8, maxWave
<= 3, wave 4–5 unlocks 0. Panel context on band 2 (16 cases,
sourcesStable, neutrality matched): identical rows both legs
— survived 8/8, national/table/wins 0, vests 2, wave reach 2
on 8/8, maxArc 3. No split-panel compare claimed (INVALID by
design on policy-split panels).

Sense: on 67105-armed the guard speaks 4 times (days 5–6);
on 68001-armed it speaks at the fence; the shadow legs camp
and fail without a line. The homeward lines that DO exist
(67105, 68001) belong to shapes A/C, not to the entry shape
the extension was defined around — which is why the screen
is empty and why the next design must name shapes A/C.

Verdict: DIAG-NO-CANDIDATE. The instrument question is
answered (shadow E is validated — the divergence does not
reproduce), but no approach-clean entry-shape trip was
found in 8 bands. The extension itself is still unjudged,
and its only firing evidence remains the unjudged 61807
diagnostic plus now the A/C shapes, which are a different
question from the entry shape.

## Wall numbers (this run, in-window only, never pooled across arms)

- Vetobudget-confirm 60d: national / table / wins 0 both
  legs; median survival 60d; wave 4–5 unlocks 0; full seat 0.
- Homeward-substrate 30d screens: national / table / wins
  0; median survival 30d; wave 4–5 unlocks 0; full seat 0.
- Food-economy axis: no gate change landed, no default
  flipped, no game-code change in either arm (both arms are
  policy-side instruments). Scale-onramp untouched (sibling
  Loop A lane).

## Telemetry deviation check (coordinator)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-02/sim-vetobudget-confirm-b-*.jsonl'
--metrics national,table,wins,exiled`, with and without
--sweep-rows: PARSE REFUSAL on the driver JSONL
("Unexpected non-whitespace character after JSON at
position 709761"), the same refusal class as the 1030Z /
1135Z / 1155Z / 1233Z homeward corpora (whole-file JSON
parse vs one-object-per-line driver rows) — NOT a metric
deviation. The worker's own LOUD lines
(national/table/wins disappeared) were investigated by the
worker as the documented winseat-regime artifact (the
scale-wall baseline itself warns pre-seat substrates must
not be compared against it). No LOUD deviation lines
requiring investigation; baseline NOT rolled.

## Metric review (for the NEXT run, never a re-score)

- Confirm design: a confirm band must be QUALIFIED before
  the armed leg is spent (guard-only screen carrying >=1
  repetition seed), or the pilot band must be re-qualified
  at the longer horizon as a stated extension. An
  unqualified fresh band burns a full two-leg confirm for a
  vacuous verdict.
- Homeward-entry definition: the prereg's entry shape
  (homeward hop landing on the entry day-end tile) excludes
  the two shapes that actually fire on natural bands
  (A: escape-attempt vetoes after outward entry; C:
  mid-trip fence from escapable ground). The next run's
  design (worker's metric review, adopted here): screen
  shapes A/C by name, and record hop-time E alongside
  day-end E per trip. Band 2 (67105) and band 4 (68001) are
  the prototypes. Until then, "homeward vetoes fire 0/80"
  is superseded by "8 on natural bands, in shapes A/C".
- E time-sensitivity (67105): E at walk-out time and E at
  day-end can disagree after foraging depletes lateral
  stock. Any future E-based screen must state which clock
  its E uses.
- Panel/driver substrate divergence (backlog line 1826)
  must be isolated before panel rows are quoted as judged
  evidence; the driver legs here are byte-identical while
  the panel splits a seed, so the difference is in the
  panel substrate (flags, policy invocation, RNG stream),
  not in the game.
- The 1233Z divergence claim about shadow-vs-armed E is
  retired as data (does not reproduce, contradicts its own
  stored files); its provenance stays open, not asserted.

## Infrastructure (loud, with recovery)

- Registry-lock contention: pre-flight reap waited ~3.5 min
  and both coordinator registrations waited 9–14 min behind
  sibling Loop A / journey registrations and heartbeat
  flock queues. No failure, no data lost — contention only.
- Coordinator error, repaired, no content lost: after the
  homeward-substrate rebase, a sibling Loop A landing broke
  --ff-only and the coordinator released/removed BEFORE
  verifying the merge, wrongly marking the tree
  done-merged (the same error as 1233Z, repeated despite
  the lesson). Branch was intact at f0ee943dd; tree
  re-registered (script attaches to the existing branch),
  rebased onto the new master (15ac6077c), proofs re-run
  (11/11, 21/21, 10/10), merged ONLY after MERGE-OK
  verification (branch in `git branch --merged master`,
  6e4ba33e9 in master), then released and branch deleted.
  Lesson restated, sharper: the merge command's exit line
  is not verification — `git branch --merged master` naming
  the branch is, and release happens after that check, never
  in the same command chain as the merge.
- Safe-commit index clobber hit worker commits on both arms
  (repaired by workers from HEAD blobs, verified status
  empty + diff empty) and is a standing pattern, not a
  content loss.
- Coordinator evidence committed from its own registered
  worktree (sim-food-round-1345); rebased if a sibling
  landing moves master before merge, proofs re-run, merged
  only after MERGE-OK verification (see closeout).

## Convergence state

food-economy stays converging (NOT converged): the veto
budget is pilot-GO but still unconfirmed (its confirm spent
on an unqualified band), the homeward extension is still
unjudged (its substrate screen is empty for the entry
shape, while shapes A/C now fire and need naming), and no
guard default has flipped. scale-onramp untouched (sibling
Loop A lane). Next blanks, in order: (1) vetobudget
confirm on a QUALIFIED band (guard-only screen first) or
pilot-band 60d horizon extension, with route-reopen
measured on a band where abandonment actually happens;
(2) homeward shapes A/C screen by name (67105, 68001
prototypes) + hop-time vs day-end E recording; (3)
panel/driver substrate divergence isolation (backlog
1826); (4) Haven-breach intent (steve-call candidate) +
place-in-record design question; (5) 60501-shape
roadwork-credit band (still owed); (6) guard +
return-capability pairing (vetobudget now exists as the
pairing half to key off) OR a second veto-budget shape,
decided up front; (7) sensor non-pantry collapse signal;
(8) gatediseng confirm band 76701-76712; (9)
pantry-cap-as-garden-bottleneck (74007); (10)
standing-load remainder; (11) pack-full refusal
narration; (12) HUNGER WINTER relief passivity
(steve-call candidate); (13) shelling default-flip call;
(14) P3 reset follow-ups; (15) patrol-departure
narration; (16) garden/fish/traps early path; (17) creek
clearance wood-bound (evening wood-carrying first; Loop
A creekwood arm landed this cycle — read it before
re-screening); (18) rubble daytime-clearing habit;
(19) washed_out scramble narration; (20) 96-tick bridge
edge; (21) 120d window only on a new horizon-cut episode.
1345Z blank 1 (vetobudget confirm) is now ANSWERED as
DIAG-unqualified (not a verdict on the budget); 1345Z
blank 2 (homeward substrate) is now ANSWERED as
DIAG-NO-CANDIDATE with validation VALIDATED and shapes
A/C named for the next design.

Claim deleted; lock deleted.
Merged locally, pending ship (both arms: DIAG + DIAG-NO-CANDIDATE).
Evidence: evidence/2026-11-02/sim-food-round-1345.md (this file).
Arm evidence: evidence/2026-11-02/sim-vetobudget-confirm-b.md
(commits e87756603, 10f1e8eb3, 520c307d8),
evidence/2026-11-02/sim-homeward-substrate-b.md (commits
6a863af07, f1c7013db, 6e4ba33e9).
