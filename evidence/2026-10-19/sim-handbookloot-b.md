# sim-handbookloot-b — Trapper Handbook book-channel census + loot-placement lever (2026-10-19)

Loop-B food-economy KNOWLEDGE arm, run fleshout-loop-b-20261019T1230Z.
Named next #551(2) — the Trapper's Handbook loot channel (the ONLY book
granting pit_trap; reachable via wild ruin shelves per the 2026-10-10 TRAP
REACHABILITY fix; candidate (1) in sim-findings.md:551's candidate list).

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities — trap skills are HUMAN
  skills (background practice/discovery), never System abilities; no
  silent actions.
- docs/PRESERVATION.md: pit-trap meat (boar/deer) enters the food ladder —
  nothing new invented for it.
- docs/BEAR.md: bear is NOT a trap target — unchanged.
- No hunting/traps canon doc exists (docs/TRAPS.md does NOT exist —
  verified; stated here instead of invented, per protocol).
- Engine mechanics read from the code: books surface in exactly two
  places — (1) the day-24 stalk trial pamphlet (system_manual_traps only),
  (2) the ruin first-search roll: 30% per ruin, first search only; at wild
  ruins (≥3 wild tiles in the 5×5) the roll draws uniformly from the 4-book
  field shelf (trappers_handbook, system_manual_traps, fishers_ledger,
  basket_weavers_primer). readBook grants recipes at L3 via grantKnowledge
  (the engine's own book path); books are pushed with `bookId`.
- Steve's gap-breadth ruling (2026-10-10, in code): "books are treasure,
  not routine" — 30% per ruin, first search only. A books-wide rate change
  would touch every book and is out of scope for this arm (other books are
  forbidden surface).

## Prior art — why this is not a duplicate (stated up front)

sim-traphandbook-b (2026-10-18, evidence/2026-10-18/sim-traphandbook-b.md,
loop-B same axis) already measured this channel and killed a tuning:
probe on seeds 105101–105108 (exhaustive honest ruin tours): 8/8 ruins
reached+searched, 3 book finds (37.5% — the 30% design), 0 handbooks
(handbook = 0.30 × 0.50 × 0.25 = 3.75% per wild-ruin first search;
~0.9% non-wild). Its lever (books.json fieldWeight=3 + game.js weighted
pickFieldBook, handbook 25%→50% of field-shelf draws) was KILLED at the
engagement gate: 0/32 book finds on its sweep (the ruin-touring policies
found nothing to weight), engagement 2 vs bar ≥8, readVia=0. Deleted
zero-trace; the day-0 "your old life" beat SURVIVED and is on master
(game.js:2721, verified this run). The kill left a named next: "why ruin
book finds are ~0 on the competent substrate (find-rate instrument), if
anyone wants the book channel at all."

This run does NOT re-run the killed fieldWeight variant. Substrate since
changed (pitknowledge-b landed + day-0 beat; pithear-b killed today), and
the kill wrote no sim-findings.md entry — the backlog still reads as if
#551's handbook candidate were untested. This run: (1) re-measures the
channel on current master with FRESH seeds, honestly instrumented, and
(2) plays a lever ONLY if the engagement floor is met — a data-side or
placement-policy change DISTINCT from the killed variant.

## PRE-REGISTRATION (binding; written BEFORE any sims — MEASUREMENT.md §14)

- QUESTION: on current master, how often does a competent village acquire
  AND read the Trapper Handbook — and can a smallest-possible placement
  change distinct from the killed fieldWeight variant move that rate?
- PHASE 1 — MEASURE (control substrate only):
  - PRIMARY: handbook acquired+read events per run across the census
    (16 runs: 8 seeds × {leadfeast, belongfeast}) + the honest probe
    (8 fresh seeds, exhaustive ruin tours). Metrics: spawn events (the
    `You find a book: "Trapper Handbook".` say line), acquisition events
    (`bookId === 'trappers_handbook'` in scholar inventory), readBook
    grants (pit_trap via='read' / learnedFrom='Trapper Handbook').
  - ENGAGEMENT FLOOR (binding): ≥1 handbook SPAWN observed across the
    phase-1 corpus (probe + census), or the run is declared "channel
    starved — instrument only": no lever is played, and the deliverable
    is the find-rate instrument + the sim-traphandbook-b named-next
    finding, committed with evidence. This is a measurement outcome, not
    a lever kill — the lever was already killed 2026-10-18.
  - Per-ruin base rate (probe): handbooks per ruin-search, with wild/non-
    wild split — the number any placement tuning multiplies.
- PHASE 2 — PLAY THE LEVER (only if the floor is met): the smallest
  data-side or placement-policy change distinct from the killed variant,
  pre-registered THEN (arms, GO, guardrails, det-gate) before its sims.
  - GO (defended): ≥3/8 armed vs 0/8 control on paired identical seeds —
    the probe base rate says the unarmed channel is ~0–1/8; a lever that
    cannot fire on nearly half the runs cannot move any downstream food
    metric, and re-kill discipline applies.
  - GUARDRAILS: no new death mode attributable to the lever; median
    survival report-only unless the lever moves spawns into danger
    (a placement lever should not move villagers into danger at all);
    det-gate: env-flag-off = byte-identical per-day trajectory hashes on
    feature-quiet seeds (2 seeds × 2 policies × 40d), or a byte-diff
    proving the change is books.json-only.
  - Balanced panel (scripts/balance-panel.js) before/after on identical
    seeds per §15; the compare .md attached to the evidence file. The
    panel is the instrument, the pre-registered threshold is the judge.
- GUARDRAILS (both phases): the day-0 beat is untouched; the L0 craft
  refusal is untouched (proved by the 2026-10-18 fixtures, not re-proved
  here unless game.js is touched — it is not in scope).
- HORIZON: 180d death-aware (dead villages stop; +10d tail max).
- SEEDS: 9409–9416 — freshness verified before any sims via `git grep`
  word-boundary over scripts/ plus evidence-filename scan
  2026-10-16..19 (77xx/78xx/79xx/81xx/83xx/84xx–99xx consumed by prior
  arms; 7605 by shellrevive; 105101–105108 by the traphandbook probe;
  6901–6908 by the traphandbook sweep; 6601–6609 by pitknowledge-b).
- POLICIES: leadfeast, belongfeast (scripts/policies/feastscale.js),
  identical on both phases. The census policies do NOT tour ruins —
  they are the competent substrate as played; ruin-searching is measured
  by the honest probe.
- ENV (asserted up front, SWEEP STOPS on mismatch): FEASTSCALE_R13=1,
  SEATDRIVE=0 explicit, PITKNOWLEDGE unset (landed channel ON — current
  master default), HUNTSTAFF unset, PITSTAFF unset (layer killed).
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Run log

### Phase 1 — MEASURE (control substrate, current master, 2026-10-19)

Proof first: `node scripts/test-handbookloot-b.js` — 5/5 GREEN (RED-1
reproduces the pitstaff probe's itemId false negative; GREEN-1/2/3 prove
the bookId scan, the say-line instrument, and the readBook→grantKnowledge
path; INFO-2 documents that readBook is caller-trusted — the pack check
lives in the UI Read verb, all harness policies check bookId before
calling).

**Probe** (`scripts/probe-handbookloot-b.js`, fresh seeds 9409–9416,
exhaustive honest ruin tours): 8 ruins / 8 searched (exactly 1 ruin per
map, all 8 maps) — 6 wild, 2 non-wild. Book finds: 3/8 (37.5%, the 30%
design firing). **Handbook finds: 0/8.** Combined with the 2026-10-18
probe (8 ruins, 3 books, 0 handbooks): 16 ruins, 6 books, 0 handbooks.
Per-ruin handbook base rate on current master: ~0% observed vs 3.75%
theoretical (0.30 × 0.50 field-shelf × 0.25 handbook share) on wild
ruins, ~0.9% non-wild.

**Census** (`scripts/sweep-handbookloot-b.js`, 9409–9416 ×
{leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1 /
SEATDRIVE=0, PITKNOWLEDGE unset): 16 runs complete.
- handbook spawns: **0** | acquisitions: **0** | readBook grants: **0** |
  pit_trap via='read': **0**
- the landed pitknowledge-b channel fires on these fresh seeds:
  pit_trap acquired on **6/16** (via: taught ×6) — the substrate learns
  through its NPC channels while the book channel stays silent.
- survival: median **152d**; starvation deaths 4; wins 0/16 (pre-seat
  substrate); national 6/16; table 13/16; wave-4 14/16; wave-5 0/16;
  arc: III 3, IV 13.
- deaths: violence 132, monster 75, contest 10, disease 7, wounds 4,
  starvation 4, lockjaw 2, ambush 2, alien 2, dehydration 1, named
  wave-monsters (the eater / the audit / performance review) 1 each. No
  death mode attributable to any lever (no lever was played).

**ENGAGEMENT FLOOR: NOT MET — "channel starved — instrument only."**
≥1 handbook spawn across the phase-1 corpus (8 probe tours + 16 census
runs) was the binding floor; the count is 0. Per the pre-registration,
no lever is played. The 2026-10-18 fieldWeight kill stands unre-run;
the deliverable is the find-rate instrument + the finding below.

### Phase 2 — PLAY THE LEVER

Not entered. The floor fired. Documented, not skipped silently.

### Panel compare (§15)

Not run — there is no "after"; the engagement floor fired in phase 1,
so no before/after pair exists. Documented, not skipped silently
(same posture as sim-traphandbook-b 2026-10-18).

## Reachability verdict

Can the book channel fire? Mechanically YES, in play NO.
- The engine path is complete end-to-end: a held handbook reads to
  pit_trap L3 via grantKnowledge (proof GREEN-3); the read narration is
  a genuine jackpot beat (see sense-test).
- The channel is triple-gated and the binding gate is the SEARCH, not
  the spawn: (1) maps hold ~1 ruin each (16/16 probe maps); (2) competent
  policies never search ruins (0 book finds in 16 × 180d census runs,
  0/32 on the 2026-10-18 sweep); (3) the handbook is 3.75% per wild-ruin
  first search. Yesterday's fieldWeight lever (25%→50% of field-shelf
  draws) died for exactly this reason — it tuned gate (3) while gate (2)
  holds the channel shut.
- Consequence for any future book-channel work: weighting loot is the
  wrong dial. The channel needs books where competent play already goes
  (the haven shelf, the trader's pack, a villager's hands) — a
  placement-surface change, which is a design move, not a loot dial.

## Sense-test (SENSE-TESTING LAW)

No villager or scholar acquired the handbook in 24 runs, so there is no
live read beat to judge. The read narration was captured on a placed
handbook (seed 9413) and read as text:

"You open "Trapper Handbook". Diagrams of knots. Check at dawn. Always."
then, per unlock: Snare L3 ("Bend the stick, tie the vine, set the loop
where they run. Opossums wander into them after dark — the easiest meat
you'll ever trap."), Deadfall L3 ("Balance the stone, set the trigger,
bait it. Check daily."), Pit Trap L3 ("You can dig one. It is a day's
work with a digging stick and it ruins your hands, but a pit on a deer
trail works while you sleep. Check it every morning."), Cottontail
Rabbit L1, Wire Snares skill L1 ("A loop of wire on a game trail.
Simple, effective, ancient."), and the jackpot line "📚 This book taught
you skills, not just facts. Jackpot."

Judgment: sensical. Each grant narrates its own mechanics in voice; the
pit line even prices the work ("ruins your hands"). When the channel
fires, the learning moment is real — the problem is reach, not content.

People-note: only the scholar has a read verb. Villagers never read
books — the channel is scholar-only by design, same as every book.

## Village assessment (plain words)

Sixteen competent pre-seat villages, median 152 days. On 6 of them a
trapper-background villager's knowledge moves: the pit_trap recipe
arrives 'taught' (the landed pitknowledge-b teach beat — trust earned,
a walk to the pit line, "mark it well: your own pit will take you
too"). On the other 10 the pit stays unknown and nobody misses it —
the villages are the same fortified rabbit-trappers the killaudit
watched, dying the same deaths (violence and monsters first, starvation
a distant fourth at 4). Fourteen reach wave 4; none reaches wave 5
(pre-seat substrate: wins structurally 0, same as every baseline this
month). Thirteen sit at arc IV with the table waiting; six touch
national. The Trapper Handbook is a rumor in none of these villages —
no ruin was ever searched, no book ever found. The blank is not "the
book is too weak" (it is a jackpot) but "the book is nowhere the
village walks."

## Blanks filled / documented

- FILLED (instrument): the find-rate instrument the 2026-10-18 kill
  named as its next —
  `scripts/probe-handbookloot-b.js` (fresh-seed honest ruin-tour probe),
  `scripts/sweep-handbookloot-b.js` (16-run census with book-channel
  instruments), `scripts/test-handbookloot-b.js` (5/5 proof). All
  committed with this run.
- DOCUMENTED (finding): appended to
  `hidden_files/sim-findings.md` — the triple-gate diagnosis (ruin
  scarcity × search rarity × handbook lottery), binding gate = the
  search; any future book-channel lever must change the placement
  surface, not the loot weight. The 2026-10-18 kill's missing findings
  entry is noted there too (the backlog read as if #551's handbook
  candidate were untested).

## Metric review (mandatory)

- PRIMARY (handbook acquired+read per 8-run pilot): measured 0/16 —
  the floor clause, not the GO bar, judged this phase. The GO bar
  (≥3/8 armed vs 0/8 control) was never reached because phase 2 was
  never entered; correctly not re-scored as a lever result.
- ENGAGEMENT FLOOR (≥1 spawn across probe + census, else "channel
  starved — instrument only"): FIRED. 0 handbooks in 8 probe
  ruin-searches + 0 in 16 census runs. The floor was the honest
  pre-registered exit and it was honored.
- The probe's 3/8 book finds (37.5%) confirm the 30% design is live —
  the instrument is not deaf; the handbook is simply a 1-in-27
  wild-ruin lottery on a surface competent play never visits.
- Metric doubt for the NEXT run: the "≥1 spawn" floor is the right
  gate for any book-channel lever — but it should be evaluated on the
  PROBE (mechanics, cheap) before any census spend. This run did that
  in the right order.

## Named next

None from this arm — the lever phase was never entered, and the
2026-10-18 kill stands. The open question is the design one in the
finding: where should books live so competent play meets them
(Steve-call sized, not a loop lever).

## Wall numbers (report-only)

16 runs, 180d, pre-seat SEATDRIVE=0, PITKNOWLEDGE unset (landed):
national 6/16, table 13/16, wins 0/16, wave-4 14/16, wave-5 0/16,
median survival 152d, max 180d. (For the coordinator's telemetry check:
per-seed JSONs in `evidence/2026-10-19/perseed-handbookloot-b/`.)
