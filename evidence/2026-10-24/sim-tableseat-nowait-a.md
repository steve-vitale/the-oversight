# sim-tableseat-nowait-a — seat WITHOUT wait (arm 2 of 2, axis scale-onramp)

Run: fleshout-20261024T1955Z. Worktree: `~/workspace/worktrees/sim-tableseat-nowait-a`
(branch sim-tableseat-nowait-a; sibling arm sim-tableseat-a tests seat WITH wait — untouched).

## Canon read first

- docs/CANON.md, docs/TABLE.md. Seat contract: full seat keeps the national bar;
  lesser seat priced without national; seat taken from Haven via `tableTakeSeat`;
  table sanctity suspends ambient monster pressure while it sits. No canon invented.
- Baseline mechanism (backlog #906 + run 1822Z next blank): no beat-answering policy
  ever took the table seat. sim-tablesit proved the seat/wait legs are never
  exercised against competent (0 attempts — competent never reached national),
  while leanlinkrescue reaches national reliably (confirm: final 6/8, ever 8/8).
  Paired with the sibling seat+wait arm, this arm decides whether waiting is
  load-bearing or dead weight.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Arm: `scripts/policies/tableseat-nowait.js` = leanlinkrescue courtship
  (`scripts/policies/leanlinkrescue.js`, LEANLINKRESCUE=1) wrapped with the
  tablesit SEAT legs ONLY (`tsDriveSeat` + `tsAnswerTableChoices` +
  rank-national+ gating, copied from `scripts/test-tablesit-sweep.js`).
  The wait leg is OMITTED entirely (no Haven-ending while tableWaiting).
  Wraps `leanlinkrescue.daily`, NOT `competent.daily` — courtship is shared
  exactly with the baseline. Default-OFF env gate (TABLESEATNOWAIT=1);
  gate off delegates to leanlinkrescue-only.
- Baseline: leanlinkrescue-only, identical seeds, same instrument. Own baseline
  (8) + armed (8) = 16 configs.
- Seeds (pilot): 73601–73608. Re-verified: no 7360x filenames in
  evidence/2026-10-24, no 7360x hits in scripts/ (grep -l, scripts only),
  no pre-existing tableseat-nowait script/policy.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary: table entered (tableDone ever) armed vs baseline.
  GO requires armed entered >= baseline entered + 2.
- Deciding cost bar (from sim-scalemetric, binding — all three must pass
  WITH the primary or the arm is NO-GO):
  1. starvation deaths armed total <= baseline total + 2;
  2. arm-only starvation (armed starvation deaths on seeds where the paired
     baseline row had none) <= 2;
  3. median days armed >= 0.8 x baseline median days.
  Starvation matcher: death cause matching /starv|hunger/i (game cause
  'starvation' / 'hunger').
- Secondary (reported, not judged): table invited ever, national final/ever,
  wins, wave 4/5 reach, max arc, death-cause shares, seat attempts/taken/kind/day,
  median/max survival.
- Proof gates: G1 det-gate (TABLESEATNOWAIT unset: 1 seed, armed days ==
  leanlinkrescue-only days); G2 pre-national read-only (seeds where neither arm
  reached national must match on days/gameDays); G3 corpus integrity (16/16 rows,
  days > 0, counters present).
- GO → policy file lands as its own commit, default-OFF only, NO default flips
  (a GO means GO CANDIDATE as an instrument, not competent play).
  NO-GO → DELETE the policy file, land only instruments + evidence
  (seat logic inlined into the sweep instrument so the NO-GO stays reproducible,
  per the tablesit precedent).
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the corpus;
  attach the compare .md if the panel ingests it, else record exactly why not
  + sweep-compare tables.
- Sense-testing law: one NON-MEASURED narration-on replay read of a seated/table
  run — judge meaning/coherence/consequences, never numbers.

## Instrument

- `scripts/test-tableseat-nowait-sweep.js` (sweep + --detgate + --sense modes),
  reusing sim-harness conventions of `scripts/test-tablesit-sweep.js` and
  `scripts/sim-leanlink-rescue-sweep.js` (loadGame/setupGame/runDays, per-seed rows).
- Per-config INCREMENTAL corpus writes via the chunked writer subprocess
  (`scripts/sim-postunlock2-b-writer.js`) to
  `evidence/2026-10-24/perseed-tableseat-nowait-a/` (the tablesit first attempt
  died silently mid-run with no corpus — never batch-write at the end).

## RESULTS — GO (pilot 8+8, seeds 73601–73608, horizon 180d, death-aware)

Sweep: `node scripts/test-tableseat-nowait-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-tableseat-nowait-a/` (16/16 rows + summary.json,
per-config incremental writes via the chunked writer subprocess).
G1 det-gate: PASS (seed 73601, TABLESEATNOWAIT unset: baseline 179/179 days ==
armed 179/179 days, ts counters empty).
G2 pre-national read-only: PASS (seeds 73602/73603/73608 identical days/gameDays).
G3 corpus integrity: PASS (16/16 rows, all days > 0, counters present).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (leanlinkrescue-only) | armed (seat, NO wait) |
|---|---|---|
| n | 8 | 8 |
| won | 0 | 3 |
| median days / median gameDays | 173 / 173 | 161 / 161 |
| max days | 180 | 180 |
| national ever / final | 5 / 1 | 5 / 4 |
| table invited ever (tableWaiting) | 5 | 5 |
| table entered (tableDone ever) — PRIMARY | 0 | 3 |
| wave 4 / wave 5 reach | 7 / 0 | 6 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 5 | 5 |
| arm-only starvation | — | 0 |
| seat attempts / taken / failed | 0 / 0 / 0 | 3 / 3 / 0 |
| preview seen / not-ready | 0 / 0 | 5 / 2 |
| table answers | 0 | 15 |

Verdict against the pre-registered bar: **GO**.
- Primary: armed entered 3 >= baseline entered 0 + 2 — PASS.
- Cost 1: starvation armed 5 <= baseline 5 + 2 — PASS.
- Cost 2: arm-only starvation 0 <= 2 — PASS.
- Cost 3: median days armed 161 >= 0.8 x 173 (= 138.4) — PASS.
GO means GO CANDIDATE as an instrument, default-OFF only — NOT competent play.
No default flips. The policy file lands as its own commit.

### Per-seed detail (what actually happened)

- Seated + won (3/3 seated runs won): 73601 (seat day 129, lesser, path feared,
  5 table answers, end over-other), 73604 (day 142, lesser, feared, won),
  73605 (day 161, lesser, feared, won; 3 previews, 2 not-ready before the
  ready one — the seat leg kept checking without forcing it).
- Baseline proves the invitation is NOT the bottleneck: baseline rows show
  tableWaiting ever on the same 5 seeds (73601–73605) with entered 0 — the table
  sat waiting and nobody sat down. The seat leg is what converts waiting into
  entered, and every conversion won.
- National reached but no table (armed 73606 day-85 national, 73607 day-77
  national): no preview ever seen — both runs stalled at arc 3, so tableWaiting
  never set. National alone does not summon the table; Arc IV gates it.
  (Baseline 73606/73607 match: same arcs, same national, same days — the seat
  leg changed nothing where there was no table to sit at.)
- All three seated runs took the FEARED path — first-option answering (the
  tablesit answer policy), not a player choice. Path diversity is untested by
  this arm; a first-option bot will always walk the same door.
- Wave 5: 0/8 both arms — untouched by this arm. Wave 4: armed 6 vs baseline 7
  because seated seed 73601 ended at its day-129 win before wave 4 unlocked
  (baseline 73601 reached wave 4 by dragging to day 179 and losing). Winning
  early costs a wave-4 count; that is a win, not a regression.
- Median-days drop (161 vs 173) is the same effect: seated runs end at the win
  (129/142/161) instead of dragging to village-lost. The cost bar still passes
  with margin (161 vs the 138.4 floor).
- Death causes both arms: combat/arena-dominated (villager combat + arena
  deaths dwarf everything); starvation identical seed-for-seed (73602: 3,
  73603: 1, 73608: 1; 0 elsewhere). The seat leg adds no starvation anywhere.

### Village assessment (plain words)

The village that sits down wins; the village that waits at the door loses.
On these seeds the leanlinkrescue village climbs to national, the table gets
set, and without a seat-taker the run grinds on until the village is lost —
five invitations sat unanswered in the baseline. Give the same village a
policy that sits when the seat is ready, and three of those five invitations
turn into wins on the same seeds, with no extra starvation and no shorter
median life than the bar allows. The two national runs that never got a table
show the other gate: reaching national is not the same as reaching Arc IV,
and the table does not come before Arc IV. The wait question this arm was built
to isolate is still open until the sibling seat+wait arm reports — but the
no-wait seat alone already converts invitations to wins, so waiting is not
required for the conversion.

### Sense-testing read (NON-MEASURED replay, seed 73601, armed, narration on)

File: `evidence/2026-10-24/sim-tableseat-nowait-a-sense.txt` (240-line ring;
seat day 129 matches the measured run — narration did not diverge the timing).
Judgment — meaning, coherence, consequences:
- The seat scene reads sensibly end to end. Day 128: "The table is being set
  — a lesser seat, priced for what you built." Day 129: the ring of pale
  light, the audit reading the REAL run back ("lesser seat — global standing,
  waves 1–3 faced (11/7/3), 10 contests survived, 3 crises weathered"), and
  the war-path bars honestly showing wave 4/5 unmet (0 of 1 / 0 of 2 veterans)
  instead of pretending. Sanctity is voiced ("EVERYONE. SIT. WATCH. The teeth
  and the weather can WAIT").
- Villagers react inside the scene, not just the audience: "Behind you, your
  own people go still too — a different stillness" at the deer kill; "Your
  people stand a little straighter" when the terror is spent as a shield.
  The ledger earns the light road (protected outnumber killed, food truth
  shared), the calibration beats spend shield-not-sword, and the final live
  choice ("Show mercy") resolves into a consequence that lasts: terror pledged
  as a shield over every village, named bearer Nina Petrova walking out alone.
- One wrinkle, not a defect: routine village chatter (Anjali muttering,
  forage/cooking assignments) resumes immediately after the finale inside the
  same day's ring, which slightly undercuts the finale's finality. The sting
  epilogue ("the little ones are still napping… you never asked") reads as
  intentional — the oversight as looking away — not incoherence.
- Mechanism visible in the replay: no wait discipline anywhere — the seat is
  taken at the first ready preview, and the run ends at the win. The no-wait
  arm's behavior is exactly what it claims to be.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before <summary.json>
--after <summary.json> --out /tmp/panel-attempt`. Result: the compare threw
`TypeError: Cannot read properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels`, and wrote no output.
Why, exactly: panel `compare` requires `--before`/`--after` panel outputs
(panel.json.gz produced by the panel driver itself, carrying observer digests,
contract digests, per-policy panel records and community-exposure histories) —
not per-seed sweep rows. My corpus rows carry days/gameDays/endReason/rank/
table/starvation/ts counters but none of the panel record shape, so the panel
cannot ingest them. The sweep-compare tables above are the before/after
comparison for this run, on identical seeds, judged against the pre-registered
bar. (Running full panel-driver runs for both policies would be a separate
instrumentation job, not a reformat of this corpus.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. One note
  for the NEXT run, not this one: "table invited ever" as a secondary is now
  known to be a non-discriminating metric for seat arms (baseline already
  invites 5/8) — future seat arms should pre-register on entered/won only, and
  should pre-register a path-diversity check, since first-option answering
  walks the same door every time.
- "Median days" as a cost bar is confounded by wins ending runs early (a good
  arm lowers it); the 0.8x floor absorbed that here, but a stronger future
  arm (more wins) could trip it while being better. Consider median days among
  non-winning runs as the cost metric next time.

### Findings outside this arm (reported, NOT touched)

- None new. Wave 5 remains 0/8 both arms (the standing scale-wall gap, not this
  arm's question). First-option path answering always walks Feared (see above).

### Convergence state

Axis scale-onramp: this arm GOES as a GO CANDIDATE instrument (seat without
wait converts table invitations to wins 3/5 on leanlinkrescue seeds). The
sibling seat+wait arm still decides whether waiting adds anything. National
reach itself is unchanged by the seat (5/5 ever both arms) — the seat moves
table conversion, not scale.

