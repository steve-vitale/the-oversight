# sim-fullseatgate-a — full-seat scale-gate census: AUDIT-GO

Run: fleshout loop, run fleshout-20261027T1940Z. Axis: scale-onramp.
Worker: sim-fullseatgate-a. Worktree:
`~/workspace/worktrees/sim-fullseatgate-a` (branch sim-fullseatgate-a).
MEASUREMENT ONLY — zero src/js changes, zero default flips, no game
lever, no game-lever proposal. The deliverable is a counted answer.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-fullseatgate-a-prereg.md (commit 5789ba06).
Corpus: evidence/2026-10-27/perseed-fullseatgate-a/ (8 rows +
summary.json + sense-74503.txt). Instruments:
scripts/test-fullseatgate-a-sweep.js (census),
scripts/test-fullseatgate-a.js (proof validator, ALL PROOFS PASS),
scripts/test-fullseatgate-a-sense.js (non-measured sense replay).

## Plain words

Steve ruled the full seat needs national standing, and asked how much
that rule would actually bite. This run counts it on a fresh band of
eight villages, all chasing the table on the same table-seeking
policy. The answer: the rule bites nothing on this band — zero
entries blocked, zero passing either way — because no village even
reaches the full seat's deed bars. Six villages are invited to the
table; five sit down, all in the lesser seat, all winning as the
Feared; one is invited and dies before ever sitting. Every invited
village arrives exactly one wave-3 fight short of the full bar, and
none ever faces a wave-5 monster, so the full seat's deed bars fail
before standing is even consulted. Standing never decides anything
here — not because villages pass it (four of the six arrive below
national), but because the wave bars decide first. The scale gate
is real and enforced in the code; on this band it is simply never
the binding bar. The binding bar is wave 5, as in every recent band.

## Verdict: AUDIT-GO (binding prereg, no re-score)

AUDIT-GO required (a) the instrument report scale-vs-ok at entry
AND end for every table-reaching village on 8/8 seeds, (b) the
counted entry split, and (c) at least one table entry. All three
hold: entry snapshots present on 6/6 invited seeds, end snapshots
on 6/6 table-reaching seeds, 8/8 rows complete, validator
ALL PROOFS PASS (74 checks). The inconclusive branch does not
trigger (6 table entries, not 0).

## The counted answer (primary metric)

Counterfactual definitions (prereg): barsOnly = waves && contests &&
crises && stageOk && foodDeeds, recomputed from each deed snapshot's
own fields. BLOCKED = barsOnly true and scale false (under the old
code such a village would have entered the full seat). PASS EITHER
WAY = barsOnly true and scale true. Lesser entries are their own
split, unaffected by the full-seat gate by construction.

ENTRY split (first day tableWaiting seen; the counted moment):
invited 6, entry snapshots 6/6, full-seat-eligible 0, BLOCKED 0,
PASS EITHER WAY 0.

END split (end-of-run, table-reaching villages): table-reaching 6,
end snapshots 6/6, full-seat-eligible 0, BLOCKED 0, PASS 0.

ENTERED-moment split (first day tableDone seen; captured, reported
for completeness): entered 5, entered snapshots 5/5,
full-seat-eligible 0, BLOCKED 0, PASS 0.

LESSER-SEAT split: lesser entries 5 (all five entered villages),
full-seat entries taken 0, scale-false full seats 0 (no gate
failure). The five lesser winners are untouched by the full-seat
gate on either reading of it — the gate cannot downgrade what was
never full-eligible.

In one line: 0 blocked, 0 passing either way, 5 lesser entries
unaffected — the scale gate's bite on this band is exactly zero,
because eligibility itself is zero.

## Per-seed gate table (entry / entered / end deed snapshots)

barsOnly fails everywhere on waves (w5 = 0 structurally — wave 5
closed — plus the per-seed shortfalls below). Stage is 3 on every
snapshot (stageOk true everywhere), so the stage>=2-vs->=3
discrepancy changes nothing on this band. Scale moves between
entry and sitting on three seeds (regional at invitation,
national/global by sitting) — the seat taken prices the later
scale, not the invitation scale; on this band that movement still
changes no outcome, since waves fail throughout.

| seed | days / end | seat | entry (day): bars / scale | entered (day): bars / scale | end: bars / scale |
|---|---|---|---|---|---|
| 74501 | 106 won | lesser feared | d106: w12/8/3/0/0, scale national | d106: same | same |
| 74502 | 153 village-lost | none (invited, never sat) | d116: w13/6/3/1/0, scale regional | — | w15/6/3/4/0, scale regional |
| 74503 | 90 won | lesser feared | d71: w16/6/3/0/0, scale regional | d90: w16/6/5/1/0, scale global | same |
| 74504 | 180 survived | none (never invited) | — | — | w17/6/1/0/0, scale global, food deeds missing |
| 74505 | 135 won | lesser feared | d135: w16/8/3/0/0, scale global | d135: same | same |
| 74506 | 90 won | lesser feared | d62: w16/7/3/0/0, scale regional | d90: w16/8/5/0/0, scale global | same |
| 74507 | 180 survived | none (never invited) | — | — | w19/10/5/6/0, scale regional, food deeds missing |
| 74508 | 117 won | lesser feared | d75: w16/5/3/0/0, scale regional | d118: w17/6/5/0/0, scale national | same |

Reading the table: at ENTRY, all six invited villages sit at
w3 = 3 — exactly one short of the full bar's 4, and exactly at
the lesser bar's 3. Villages are invited the moment they meet the
lesser bar, so the invitation itself selects for w3 = 3. By
SITTING, three villages grow to w3 = 5, but w5 stays 0 on all of
them, so waves still fail. At END, the closest village to the
full bars is 74502 (w4 = 4 met, w3 = 3 one short, w5 = 0) — and it
is the invited village that died before sitting. 74507, never
invited, meets w3 = 5 and w4 = 6 but lacks food deeds and scale
and, like all, w5 = 0. No village on the band is within one bar
of barsOnly at any counted moment: every village is short on
waves, and waves need w5 faced, which needs wave 5 unlocked.

## Wall numbers (every run needs these)

| field | this band (74501-74508) | w5twokey (74311-74318) |
|---|---|---|
| national ever / final | 8/8 / 6/8 | 7/8 / 4/8 |
| table invited / entered | 6/8 / 5/8 | 5/8 / 3/8 |
| wins | 5/8 (all feared lesser) | 3/8 (all feared lesser) |
| full seat | 0/8 | 0/8 |
| lesser seat | 5/8 | 3/8 |
| wave-4 unlock | 6/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 135d | 156d |
| deaths | 234 | 238 |
| starvation deaths | 1 (0.4%) | 2 (0.8%) |

Death causes (234): villager combat 95 (40.6%),
villager-vs-villager combat 59 (25.2%), player arena 38 (16.2%),
villager expedition 14, villager monster 10, ambush 3, player
contest 3, sickness 4, wound-that-wouldn't-close 2, starvation 1,
singles (Highbeam Deer, Loud-Eyes, The Congregation, experiment,
The Ugly Beast). Combat dominates (82.1% across the three combat
causes); starvation does not — the scale wall here is not food
collapse, same as w5twokey. Wave-4 kills 0 on the band (0 killers,
0 living killers) despite 74507 facing 6 wave-4 types and 74502
facing 4: the faced-vs-killed gap, again.

## Base-state correction (prereg, confirmed in code)

The task brief stated scale is "currently reported but not enforced"
in deedGateReady().ok. In this worktree that premise was already
stale: progression.js returns
`ok = waves && contests && crises && stageOk && foodDeeds && scale`
(the sim-scalegate-a change, commit 234d3a825, is in this branch's
base). This arm made no seat-code edit, per the task, and the
counted answer does not depend on which side is current code: it
is computed from the breakdown fields either way, and the validator
checks ok == (barsOnly && scale) on every snapshot (19 snapshots)
and every daily deed tuple (1050 tuples, 0 mismatches). The
enforcement question is therefore settled in code; what this run
settles is its measured bite: zero on a band that reaches the
table six times.

## Stage discrepancy (recorded, NOT adjudicated, per the task)

docs/TABLE.md says the full seat needs stage >= 3; progression.js
enforces stage >= 2. Every deed snapshot on this band shows stage
3, so both bars pass everywhere and the discrepancy is untestable
here. It remains a Steve call, already filed by sim-scalegate-a;
this run neither resolves it nor bundles it with the scale ruling.

## Village assessment (plain words)

Eight villages that all touch national standing at some point —
the strongest national showing of this census family — and six are
invited to the table, five sit and win through the lesser feared
door. The winners are not struggling villages: 74505 sits at
global standing with the full bars' contests, crises, stage, and
food deeds all met, and still holds a lesser seat, because it has
faced three kinds of wave-3 monster and none of wave 5. The one
invited village that does not sit, 74502, is invited on day 116 at
regional standing, faces four kinds of wave-4 monster by the end,
and dies on day 153 with the seat untaken — an invitation is not
a sitting, and the wait can end in death. The two never-invited
villages survive the full 180 days (74504 at global standing with
no food deeds and one wave-3 fight; 74507 at regional with six
wave-4 faces and no food deeds): survival without the table is
common, and the table's invitation still selects on the lesser
bar, not on survival. Nobody on this band is near the full seat,
and nobody is blocked from it by standing — the road to the full
seat runs through wave 5, and wave 5 runs through kills nobody
here makes.

## Sense-testing read (seed 74503, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: highest gated standing at
end (74503 and 74505 tie at 199; wave-4 kills tie at 0; lowest
seed wins: 74503). Replay: scripts/test-fullseatgate-a-sense.js,
seed 74503, 90 days, output saved alongside the corpus
(perseed-fullseatgate-a/sense-74503.txt, 351 lines, 333 life/gate
hits from d60, 10 fight starts d65-88). The replay trajectory
matches the census end state in substance (90 days, lesser seat,
global standing, waves 16/6/5 with 1 wave-4 fought, 7 contests,
2 crises), so the quoted lines are the band's own words in
substance.

What the villagers actually do reads as people living, not
counters ticking:

- Hayden checks the pantry before heading out and leaves the
  harvest standing when the shelves are full ("The pantry can't
  take more; the wild will keep"), turning to the water or wood
  run instead; Shannon cooks for the haven and leaves the fresh
  pile for tonight's dinner rather than smoking it onto the rot
  pile when the racks are already full.
- Nina blows on a spoonful before it goes back in; the Thermos
  beat ("Dad tapped it twice before the first sip, every
  morning... Some mornings it's the only conversation you have")
  carries grief without announcing it.
- Word travels: riders bring talk of Haven, "Out there they call
  you the Indispensable"; the feast beat ("5,009 kcal of theater,
  every fire of the realm at the table") prices the show honestly.

The seat language reads honestly. Quoted audit line, verbatim:
> "◈ THE AUDIT — the System reads your run back to you, and the
> galaxy listens. A lesser seat — global standing, waves 1–3 faced
> (16/6/5), with 1 wave-4 fought, 7 contests survived, 2 crises
> weathered. The table does not rise. It prices."

Plain-words judgement: a global-standing village with lesser deeds
is told it holds a LESSER seat, not a full one, and the line says
plainly what that means. No village is told it holds a full seat
it does not hold, and no stale-seat withdrawal fires. The people
pass the sense test; the full-seat road does not exist for them
to walk — the replay's war-path beat names the wave-4 bar
("armor the village... blood your fighters") as the next step,
and the village wins through the lesser door before taking it.

## Next-arm prereg sketch (the sketch, NOT the change)

For the enforcement change's bite — the arm that can show a
non-zero blocked count. The enforcement itself is already landed
(sim-scalegate-a); what is missing is a substrate on which any
village reaches barsOnly true, so the sketch is conditional on
that substrate existing first (a wave-5-capable substrate, from
the funnel/melt work or wherever wave-5 kills first appear).

- The change under test (future arm only, never this one): leg A
  = current code (scale enforced in ok); leg B = the same tree
  with the scale term temporarily removed from ok (a
  branch-only, measurement-only revert, reverted before any
  landing). No other delta between legs.
- Bands: fresh 8-seed band on the first substrate where a screen
  shows >= 1 seed reaching barsOnly true; 180d death-aware;
  tableseat-nowait or its successor substrate, identical seeds
  and policy on both legs.
- GO bar (pre-registered by that arm, not this one): leg B shows
  >= 1 full-seat entry that leg A downgrades to lesser or none,
  with lesser entries and wins identical on every other seed;
  NO-GO if the legs are identical (bite still unproven) or if any
  lesser entry or win regresses on leg A. Until such a substrate
  exists, enforcement-bite arms will keep showing this run's
  shape (proof green, counted answer zero) and should keep being
  reported as AUDIT-GO-with-zero-bite rather than mistaken for
  "the gate does nothing."
- Method note carried from this run: report the entered-moment
  split alongside the entry split (three seeds moved
  regional → national/global between invitation and sitting, so
  the seat taken prices later scale, not invitation scale).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg: AUDIT-GO iff instrument complete on 8/8 seeds
with >= 1 table entry (6 entries, instrument complete — AUDIT-GO).
Two method notes, each a proposal for the NEXT run, never a
revision of this one:

1. THE ZERO-BITE SHAPE NEEDS ITS OWN NAME. AUDIT-GO with
   blocked = 0 and pass = 0 is not "the gate works" or "the gate
   fails" — it is "the gate is never reached." The prereg's GO
   rule correctly separates instrument success from bite size,
   but the next run's prereg should name the bite-size question
   explicitly (eligible count first, blocked/pass second), so a
   zero-eligible band is not misread as a zero-blocked finding
   about scale. Here the finding about scale is: scale decided
   nothing because waves decided everything first.
2. THE INVITATION SELECTS FOR w3 = 3. All six invited villages
   arrive at exactly the lesser bar's wave-3 count, so entry
   snapshots will always show w3 = 3 on this substrate unless
   the invitation path changes. A future arm that wants entry
   snapshots with w3 >= 4 must use a substrate that delays
   invitation or grows deeds between invitation and sitting —
   or it must count the entered-moment split as primary, where
   w3 does move (three seeds reached w3 = 5 by sitting).

## Findings (not chased mid-run; for the backlog)

- [open] 2026-10-27 — wave-4 kills at zero again — band w4kills
  0/8 seeds, 0 killers, despite 74507 facing 6 wave-4 types and
  74502 facing 4. The faced-vs-killed gap persists; the
  funnel/melt arms own the why. (sim-fullseatgate-a)
- [open] 2026-10-27 — invited but never sat, died waiting —
  74502 invited d116, died d153 with the seat untaken. Whether
  the waiting period voices the risk honestly (and whether a
  village should be able to sit faster) is unexamined here; the
  seat-waiting honesty work owns it. (sim-fullseatgate-a)
- [carried] 2026-10-27 — full-seat stage bar — TABLE.md says
  stage >= 3, code enforces stage >= 2 (filed by
  sim-scalegate-a; untestable on this band since every snapshot
  is stage 3). (sim-fullseatgate-a)
- [carried] 2026-10-27 — fullseat-diag test mock — the mock
  fixture in scripts/test-fullseat-diag-20261021.js still computes
  old-ok without scale (filed by sim-scalegate-a; a mock, not
  production). (sim-fullseatgate-a)

## Balanced panel (§15) and telemetry deviation check

- Balanced panel: ATTEMPTED and honestly not applicable, not
  faked. scripts/balance-panel.js has no corpus-ingest mode for
  a single-arm census corpus: its `compare` mode requires two
  panel.json.gz artifacts built by its own observer runs, and
  its main mode builds panels from observer cases, not from
  census rows. No panel artifact was produced; the sweep table +
  validator output are the comparison of record (same standing
  exception as the w5block/w5twokey corpora).
- Telemetry deviation check (loop body step 10):
  `node scripts/telemetry-check.js --baseline .../telemetry-baselines/
  scale-wall.json --current 'evidence/2026-10-27/perseed-fullseatgate-a/*.json'
  --metrics national,table,wins,exiled` -> 3 LOUD lines (national
  12->0, table -62% 16->6, wins 16->0, n=9 files). Verdict: KNOWN
  ARTIFACT, no investigation, baseline NOT rolled. Two
  independent reasons, both documented (same as w5twokey): (a) the
  baseline's own _regime note forbids this comparison (a ~100%-win
  winseat suite vs a tableseat-nowait census substrate — wins are
  structurally lower here); (b) the field-shape artifact repeats
  (per-seed rows carry nationalEver/entered/won, not top-level
  national/table/wins paths; summary.json is the 9th file). The
  corpus's real wall numbers are nationalEver 8/8, table entered
  5/8, wins 5/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-fullseatgate-a-sweep.js, 8 seeds, ~6 min
  wall. Corpus: evidence/2026-10-27/perseed-fullseatgate-a/
  (8 rows + summary.json + sense-74503.txt). Validator:
  scripts/test-fullseatgate-a.js — ALL PROOFS PASS (74 checks:
  G1 corpus integrity, G2 deed identity on 19 snapshots + 1050
  daily tuples, G3 deed agreement, G4 recount).
- Validator bug found and fixed in the validator only (no corpus
  field changed): the first G3 compared deed counts against
  gate.wavesFaced as if it were a mid->wave map, but the sweep's
  wavesFacedCounts already counts it once into counts-per-wave —
  the double-count trap the w5twokey validator note warns about.
  G3 now compares deed counts directly against the counts, and
  passes on all 8 seeds.
- Post-policy entry capture: the sweep's daily wrapper takes the
  entry/entered deed snapshot AFTER the policy daily as well as
  before it, so a table that opens inside a day's policy beat is
  captured the same day (a pre-policy-only snap would miss it on
  a winning day). Still pure reads only.
- Safe-commit index clobber hit the prereg commit (5789ba06) —
  the known class: commit correct, main index showing a bogus
  staged deletion + untracked twin. Repaired via HEAD-blob
  cacheinfo, verified with git status --short empty + git diff
  HEAD empty, before any sweep ran.
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the w5twokey precedent for
  DIAG-only runs). No [needs-eyes] flag applies (measurement
  only, no narration or behavior added — the sense script only
  READS beats on a replay).
- No push, no version bump, no live verification — merging to
  local master is the coordinator's job. This worktree reports
  committed on branch, pending coordinator merge.

## Files

- Prereg: evidence/2026-10-27/sim-fullseatgate-a-prereg.md
- Evidence (this file): evidence/2026-10-27/sim-fullseatgate-a.md
- Corpus: evidence/2026-10-27/perseed-fullseatgate-a/ (8 rows +
  summary.json + sense-74503.txt)
- Sweep: scripts/test-fullseatgate-a-sweep.js
- Proof validator: scripts/test-fullseatgate-a.js
- Sense replay: scripts/test-fullseatgate-a-sense.js
- Changed: zero src/js files, zero policy files (all new files
  are instruments + evidence + corpus)
