# sim-food-economy-round-0945-b — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261027T0945Z. Loop A live at run start on
scale-onramp (0840Z claim, arms sim-w4melt-a + sim-arrivalsurge-a,
heartbeat 09:35Z) — NOT touched; A finished during this run (its
arrivalsurge round landed as 9c0b34dc9 and its claim was deleted by its
own closeout). B worked food-economy (converging, second non-converged
axis), taking the 0835Z next blanks (1) and (2) in order. Both arms
DIAG/measurement only, zero src/js.

## Arm 1 — sim-raidcallers-b: GO (caller-complete ledger)

Prereg b2fabea68 (rebased 92bce6bea) + evidence b83e1b2ee (rebased
e33315442, merged). Policy belongseek-nofeast, 100d death-aware, base
6ae5049d8 at prereg (no pin).

The raiddor arm had wrapped _removePantryKcal but only the raid caller
ever fired. This arm asked whether a regional-politics band makes the
other callers fire — and whether the ledger names them. Answer: yes,
on both bands, 297 non-raid records, zero unknown callers.

- Pilot 9951–9958: 115 non-raid records across 6 frames (payTribute
  79, answerDemand 9, answerAccord 7, answerAidBeg 7,
  answerNationalChoice 8, answerGlobalChoice 5) + 11 raid-unanswered.
  Caller-complete legs: named pooled 0 / 232,860 = 0.000% (rate not
  judged — only 2 rows clear the 10,000-inflow filter, per the
  prereg's named-row rule); generic 7/8 at 87.5%, pooled 0.077%;
  dried pooled 0.29%. All bars pass.
- Confirm 9962–9973 (fresh band): 182 non-raid records, 0 unknown,
  same 6 frames + 18 raid records. Named 8/8 at 100%, pooled 0 /
  1,295,460 = 0.000%; generic 11/12 at 91.7%, pooled −586 /
  3,705,103 = 0.016%; dried pooled 0.20%. All bars pass.
- Controls fail as expected (old/boundary/raiddor legs ~9–11%
  named/generic, ~33–35% dried): the non-raid takes (~502k kcal
  pilot, ~805k kcal confirm) are exactly what the old definitions
  were missing.
- New exercise, not just coverage: the post-snapshot adjustment for
  non-raid callers IS exercised — pilot seed 9957 has a day-100
  answerNationalChoice take (3,339 kcal) that the caller-complete
  legs subtract from the boundary closing, and the band still passes.
  (The raid version of that adjustment is still unexercised — see
  arm 2.)
- Proof GREEN on both corpora post-rebase (coordinator re-runs).
  Coordinator note: the proof defaults EXPECTED_POLICY to
  competent-nofeast, so a bare invocation fails corpus-validity on
  the policy name alone (all 8 pilot files pass every field check);
  GREEN requires RAIDCALLERS_POLICY=belongseek-nofeast (+
  RAIDCALLERS_CORPUS_DIR for the confirm corpus). That is a
  coordinator-invocation correction, not a verdict change — the
  worker's GREEN runs used those variables.
- Wall (belongseek-nofeast): pilot national-or-better 6/8, table 0/8,
  wins 0/8, wave 4 on 1/8 (9954), median survival 100d, deaths 51
  (arena 22, sickness 6, dehydration 5, starvation 4, wound 3, ambush
  3, contest 3, alien 4, toad-war-drum 1). Confirm
  national-or-better 9/12, table 0/12, wins 0/12, wave 4/5 0/12,
  median 100d, deaths 45 (arena 16, sickness 10, wound 5, contest 4,
  ambush 3, dehydration 2, starvation 2, monster 1, night 1,
  wound_fever 1). Combined: 15/20 national-or-better, 1/20 wave 4,
  0/20 table or win. Belongseek climbs the hierarchy; it does not
  seat the table in 100 days.
- Village assessment (plain words): 16 of 20 villages survived the
  full 100 days; the 4 losses (days 16, 26, 33, 90) are honest
  early/late losses. These villages do not just sit in their haven
  — they bow to a primary, pay a weekly tribute (usually 5,000
  asked, 5,000–5,199 taken) in full view, answer demands and accords,
  take aid from named neighbors, and climb to national/global
  standing. Deaths came from arenas and sickness, not from tributes,
  which cost ~5,000 kcal/week against pantries holding hundreds of
  thousands. Payments are narrated (probe, seed 9952: "Tribute paid:
  5,000 kcal walks out of the pantry toward Emberhold. The
  relationship holds."; aid arrives as "Ruth of Emberhold walks into
  Haven unannounced, pack-mules behind" with a trust-3 price for
  refusing) — the judged corpus cannot show these lines only because
  its say recorders cover smoke racks + treeline, a recorder-scope
  fact stated in the arm evidence. One probe-vs-corpus day shift
  (probe day-20 tribute vs corpus day-22/23) is reported as an
  unexplained observation; all judged comparisons are
  within-instrument, so it is not a verdict input.
- Open remainders (documented, not verdict inputs): one failing
  generic row per band (pilot 9954 +3,700 at 1.16%; confirm 9970
  +416 at 2.72% on a 16-day village) — small, not explained by the
  NEW-definition trace; treeline give/overrun still never fired
  (census holds succeeded cleanly — a future band needs seeds where
  holds fail).

Evidence: evidence/2026-10-27/sim-raidcallers-b.md (+ prereg,
corpora, 5 vendored scripts).

## Arm 2 — sim-raidday100-b: DIAG-NO-GO (adjustment stays defense-in-depth)

Prereg c961965b0 (rebased cf7cca759) + evidence e81034fa (rebased
5ddd665d6, merged). Policy competent-nofeast, 100d death-aware, base
6ae5049d8 at prereg (no pin).

The raiddor post-snapshot raid adjustment subtracts raid takes dated
== the closing-snapshot day from the boundary closing. This arm
screened for a seed that exercises it. There is none on this screen.

- Screen 10100–10139, all 40 seeds (cap 40, no early stop),
  collision-checked before screening (no corpus filenames, no
  word-boundary seed mentions in dated 2026-10-27 evidence .md
  files; distinct from 9820–9827, 9870–9881, 9768–9779,
  9850–9861). Day-100 raids found: NONE. Death-day closing-snapshot
  raids: NONE. Combined with raiddor's 20 seeds: 0 day-100 raids in
  60 seeds. These 40 seeds are now spent-but-unjudged — a later arm
  must not re-spend them blind.
- 52 raid-unanswered records, 51,484 kcal, all caller
  villageAgencyDaily, asked 800 (standard take Canned soup 4u x 250
  = 1,000). Latest raid day 99 (seed 10109), then 97, 96, 96, 93, 91.
  14 seeds had zero raids.
- Closing-snapshot definition (from the analyzer, stated in the
  prereg): the day of the last spoilDays snapshot — day 100 on
  surviving seeds (closing = that closing + day-100 stockSurplus
  pushes − day-100 meal draws), the death day on dead seeds (e.g.
  10110: 24; 10139: 99 despite daysAlive 100).
- Proof: no judged corpus exists, so no GREEN is claimed. Run on the
  screen corpus, the proof fails on exactly the 4 expected checks
  (corpus size 40 + the 3 day-100 exercise checks) — those failures
  ARE the DIAG-NO-GO. Everything else passes (corpus validity on all
  40 files; det-gate leg 1 byte-identical on non-raid fields,
  reproducing corpus seed 10100 counts exactly, 148/1171/7/89, on the
  current base; independent recomputation matches the analyzer on
  all nine pooled figures; raid integrity 0 retMismatches;
  disjointness; hygiene zero src/js, zero sibling files). The
  without-adjustment identity holds, but vacuously (raid100 = 0
  everywhere) — stated, not oversold. Analyzer legs on the screen
  corpus pass (raid-door named 19/19, generic 38/40, dried 0.49%),
  but that is ledger closure on a band with no day-100 raid, NOT
  this arm's GO. Coordinator re-ran the proof post-rebase on the
  screen corpus and confirmed the same 4 expected failures, nothing
  new.
- Wall (screen band, competent-nofeast): national / table / wins
  0/40; wave 4/5 0/40; wave reach wave 3 on 28, wave 2 on 11, wave 1
  on 1 (10110); median survival 100d (39 seeds at daysAlive 100;
  10110 lost day 24); deaths 177 (arena 78, ambush 20, monster 18,
  sickness 15, wound 12, starvation 10, contest 8, dehydration 3,
  choir toad 2, combat 2, 9 singletons at 1 each).
- Village assessment (plain words): 40 villages, 38 surviving 100
  days around pantries watched down to the unit — villagers cook for
  the haven and work the smoke racks by name, eat from the pantry by
  name, share surplus back. On 26 villages an unanswered treeline
  raid took the usual ~1,000 kcal share — a tax, not a famine. What
  killed people was arenas (nearly half of all deaths), ambushes,
  and monsters, not raids. The exceptions prove the horizon is
  death-aware: 10110 died at day 24, and 10139 was lost during day
  100 before the day-100 snapshot (closing day 99, not 100).
- Sense test: there is no day-100 raid narration to quote — that
  absence is the verdict. The nearest raids check out exactly
  against the ledger (10109 day 99: "Dmitri of The Bloodied didn't
  wait — they hit the stores and melted back into the dark with
  1,000 kcal" = Canned soup 4u x 250, asked 800; same template for
  10114 day 97, 10106 day 96, 10134 day 96). Noted for the next arm:
  a raid demand arrives a day before its take (10103: demand day 83,
  take day 84), so a day-100 take needs a day-99 demand — day-99
  takes occur, but no day-99 demand was followed by a day-100 take
  here.

Evidence: evidence/2026-10-27/sim-raidday100-b.md (+ prereg, screen
census, screen corpus, screen analyzer + proof logs, 5 vendored
scripts).

## Combined wall (this run's bands)

National-or-better 15/20 (raidcallers) + 0/40 (raidday100 screen);
table 0/60; wins 0/60; wave 4 1/60; wave 5 0/60; median survival 100d
on every band. The scale wall stands on every band here; these arms
measure a pantry ledger, they do not move the wall numbers.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<corpus-glob>' --metrics national,table,wins,exiled`, run per
corpus: raidcallers pilot 2 LOUD lines (table 16->0, wins 16->0);
raidcallers confirm 2 LOUD (same); raidday100 screen 3 LOUD
(national 12->0, table 16->0, wins 16->0). No exiled LOUD line
anywhere. All are the known REGIME artifacts (WINSEAT baseline vs
pre-seat / belongseek / competent-nofeast substrates; per-seed rows
carry nationalEver, not top-level national paths — which is why
raidcallers' 15/20 national-or-better raises no national LOUD).
Baseline NOT rolled, no new investigation.

## Metric review (MEASUREMENT.md section 14)

- Both arms were judged ONLY against their own pre-registered bars:
  raidcallers GO (pilot + confirm bars met, named-row rule applied
  as written on the pilot); raidday100 DIAG-NO-GO (no day-100 raid
  found, never passed on silence). No metric was re-scored
  mid-run, no threshold changed, no family dropped.
- The raidcallers named-row rule did its job in the weak direction
  on the pilot (2 rows -> rate not judged, pooled reported) and the
  strong direction on the confirm (8 rows, 8/8 judged).
- The raidday100 screen cap (40) was pre-registered and fully spent;
  the DIAG-NO-GO covers this screen only, not the claim that no
  day-100 raid exists anywhere. The next arm must answer the
  reachability question by code reading before spending more seeds
  (see next blanks).
- Balanced panel (section 15): no lever changes, no game code, so
  no before/after to panel — stated explicitly by both arms; the
  det-gates are the instrument before/after. Not forced, not faked.
- Every evidence file in this round carries its own metric review
  section.

## Infrastructure (loud)

- Master moved under the run (loop A arrivalsurge round, journey
  lanes, and a ship-loop version bump 24123a7d2 that shipped the
  raidcallers merge). Both arms rebased clean (zero overlap, zero
  file conflicts — distinct vendored filenames held), proofs
  re-run post-rebase, then merged.
- Safe-commit index clobber hit both workers' commits (and is the
  known variant) — repaired via HEAD-blob cacheinfo each time,
  commits verified correct, main tree clean at closeout.
- No EPERM flap blocked this run's writes. Git operations ran slow
  (~60–80s per worktree register/heartbeat). Raidday100 wall time
  was load-bound, not compute-bound (per-seed compute ~1.4–2.0s,
  box load ~9–14 from sibling work; 40 seeds took ~2 hours wall).
- check.js --quick NOT re-run: zero src/js, zero green-list files;
  arm proofs are the attributable verification.

## Convergence

food-economy stays converging (NOT converged): the other-caller
blank is closed (297 named non-raid records on two bands, plus a
day-100 non-raid adjustment exercised), but the axis is not
converged — the scale wall is untouched by this axis, the raid
post-snapshot adjustment is still unexercised (0/60), one generic
remainder row per raidcallers band is unexplained, and treeline
give/overrun never fired. scale-onramp stays converging
(untouched; sibling loop A). Claim deleted; lock deleted.

Next blanks, in order: (1) code-read whether a day-100
unanswered-raid take is even reachable at the horizon edge (does
villageAgencyDaily run its raid branch on day 100, and does the
horizon include the day-100 endDay take?) — before spending more
seeds on the post-snapshot adjustment; (2) the one failing generic
row per raidcallers band (9954 +3,700; 9970 +416) — small
remainders, NEW-definition trace; (3) a treeline give/overrun band
(seeds where holds fail); (4) the 0530Z carried blanks, still open:
garden-attributed deposits with zero garden harvest, starting-stock
draw order, spoilage-boundary split (meal vs cook), ~5,900 kcal
non-draw removal day-82/83.

## Verdicts (judged against pre-registered bars, not re-scored)

- sim-raidcallers-b: GO. The ledger names every _removePantryKcal
  caller on bands that exercise them.
- sim-raidday100-b: DIAG-NO-GO. No day-100 raid in 40 screened seeds
  (0/60 with raiddor); the raid post-snapshot adjustment remains
  defense-in-depth, unexercised.
