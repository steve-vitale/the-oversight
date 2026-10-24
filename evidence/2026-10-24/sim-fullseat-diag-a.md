# sim-fullseat-diag-a — full-seat reachability diagnostic on the tableseat band (axis scale-onramp)

Run: fleshout-20261024T2115Z. Worktree: `~/workspace/worktrees/sim-fullseat-diag-a`
(branch sim-fullseat-diag-a). Axis: scale-onramp (standing directive — still stands:
the 1955Z round took 6 lesser seats, 0 full seats, so full-seat reachability is
decoration-or-real unknown).

## Canon read first

- docs/CANON.md, docs/TABLE.md. Seat contract: full seat keeps the national bar in
  the audit's terms but `deedGateReady()` itself (src/js/progression.js:613, the
  code authority) prices waves/contests/crises/stage/food-deeds; scale is reported,
  not gating, since the 2026-10-13 Standing change. Lesser seat: waves 4/4/3,
  2+ contests, 2+ crises, regional+, stage ≥ 2, food-thesis deeds. No canon invented.
- The 1955Z round's blank: all 6 table seats taken were lesser; no run has ever
  taken a full seat. This arm does NOT chase the full seat blindly — it measures,
  on the tableseat band, exactly which component blocks it and by how far, at run
  end and at the win (wins truncate the window).

## Composition choice (decided before sweeping, documented per brief)

REUSE `scripts/policies/fullseat-diag.js` unmodified — it composes cleanly on top
of `tableseat-nowait`: `withFullseatDiag(inner)` delegates to the inner daily and
only records after it, and only when `FULLSEAT=1`; with the gate unset it delegates
byte-identically. No new policy file was written. NEVER edited: fullseat-diag.js,
tableseat-nowait.js, leanlinkrescue.js, any src/js file. The recorder is PURE-READ:
it writes nothing to game state and draws no RNG (it writes only into the probe's
own ctx surface).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait leg.
- Baseline: tableseat-nowait, `FULLSEAT` unset. Own baseline replication (8),
  NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with fullseat-diag (`FULLSEAT=1`).
- Seeds (pilot): 73641–73648. Freshness verified at run start: no 73641–73648
  filenames anywhere under evidence/2026-10-24 (including all perseed-* dirs),
  no hits in evidence/2026-10-24/*.md, no hits in scripts/policies/ or the prior
  tableseat/fullseat sweep scripts. (A full-content grep over all of evidence/
  was abandoned as too slow on the giant corpora; filename + dated-md + script
  checks are the 1955Z precedent.)
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary (DIAG-GO, all must hold):
  1. 8/8 armed configs produce an end full-seat snapshot with per-component
     distances (via the recorder + an end-of-run `snapFullSeat` pure read);
  2. every WON armed config additionally produces a win-day snapshot;
  3. a ranked binding-blocker list: which component blocks the most seeds,
     with the median distance per component (end snapshot and max-reach);
  4. det-gate G1 PASSES (see below).
  Any full seat reached is a breakthrough — entered-full count reported prominently.
- Cost bar (diagnostic here, pure-read instrument — but still reported to prove
  recorder neutrality): starvation deaths armed total vs baseline total, and
  median days armed vs baseline. A recorder leak (any divergence) is NO-GO
  regardless of snapshot completeness.
- Proof gates:
  - G1 det-gate: FULLSEAT unset, wrapped tableseat-nowait == tableseat-nowait on
    seed 73641: days/gameDays identical, ts counters identical, no
    `_fullseatdiag` surface on ctx.
  - G2 recorder neutrality: for ALL 8 seeds (stronger than pre-national here —
    the recorder fires daily everywhere, so any divergence anywhere is a leak),
    baseline vs armed days/gameDays/ts counters/starvation identical.
  - G3 corpus integrity: 16/16 rows, days > 0, endSnap with dist present on
    every row, diag block present on every armed row.
- Landing rule: DIAG-GO → this run's commit is instruments + evidence + corpus
  (the recorder policy already landed 2026-10-21, commit 9bb0cf5ce — nothing new
  to land, no default flips). Det-gate failure → NO-GO, instruments + evidence
  only, verdict recorded.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the corpus;
  attach the compare .md if the panel ingests it, else record exactly why not +
  sweep-compare tables (1955Z precedent: the panel throws on per-seed rows).
- Sense-testing law: one NON-MEASURED narration-on replay read of a seated/won
  armed seed — judge meaning/coherence/consequences, never numbers.

## Instrument

- `scripts/test-fullseat-diag-sweep.js` (sweep + --detgate + --sense modes),
  modeled on `scripts/test-tableseat-nowait-sweep.js` (loadGame/setupGame/runDays,
  per-config incremental corpus writes via `scripts/sim-postunlock2-b-writer.js`).
- Corpus: `evidence/2026-10-24/perseed-fullseat-diag-a/` (16 rows + summary.json).

## RESULTS — DIAG-GO (pilot 8+8, seeds 73641–73648, horizon 180d, death-aware)

Sweep: `node scripts/test-fullseat-diag-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-fullseat-diag-a/` (16/16 rows + summary.json,
per-config incremental writes via the chunked writer subprocess).
G1 det-gate: PASS (seed 73641, FULLSEAT unset: baseline 180/181 days ==
wrapped 180/181 days, ts counters identical, no `_fullseatdiag` surface).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — the recorder changes NOTHING, on every seed, not just
pre-national ones).
G3 corpus integrity: PASS (16/16 rows, all days > 0, endSnap with dist on
every row, diag block on every armed row).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ fullseat-diag) |
|---|---|---|
| n | 8 | 8 |
| won | 2 | 2 |
| median days / median gameDays | 180 / 181 | 180 / 181 |
| max days | 180 | 180 |
| national ever / final | 7 / 6 | 7 / 6 |
| table invited ever (tableWaiting) | 2 | 2 |
| table entered (tableDone ever) | 2 | 2 |
| entered FULL | 0 | 0 |
| wave 4 / wave 5 reach | 3 / 0 | 3 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 5 | 5 |
| seat attempts / taken / failed | 2 / 2 / 0 | 2 / 2 / 0 |
| preview seen / not-ready | 7 / 5 | 7 / 5 |
| table answers | 10 | 10 |
| death total | 294 | 294 (identical breakdown) |

Baseline and armed agree on EVERY aggregate — the recorder is provably
neutral, not just approximately so. Death causes (identical both arms):
villager combat 119 + villager-vs-villager combat 81 + player arena 30 =
230/294 (78%) combat; starvation 5 (73646: 3, 73644: 1, 73647: 1);
expedition 18, sickness 11, monster/named 17, rest small.

### Per-seed detail (armed arm; baseline identical on every trajectory metric)

| seed | days | end | won | seat | wave | arc | rank final/max | end binding (dist) |
|---|---|---|---|---|---|---|---|---|
| 73641 | 180 | survived | 0 | none | 3 | 3 | national/national | w3(1) w4(3) w5(2) crises(1) foodDeeds(1) |
| 73642 | 160 | over-other | 1 | lesser, Feared, day 160 | 4 | 4 | global/global | w4(2) w5(2) |
| 73643 | 180 | survived | 0 | none | 3 | 3 | national/national | w3(2) w4(3) w5(2) foodDeeds(1) |
| 73644 | 180 | survived | 0 | none | 4 | 3 | regional/global | w5(2) foodDeeds(1) |
| 73645 | 180 | survived | 0 | none | 3 | 3 | national/national | w3(4) w4(3) w5(2) foodDeeds(1) |
| 73646 | 103 | village-lost | 0 | none | 4 | 3 | national/national | w3(2) w5(2) foodDeeds(1) |
| 73647 | 18 | village-lost | 0 | none | 1 | 3 | village/village | w2(5) w3(4) w4(3) w5(2) contests(2) foodDeeds(1) |
| 73648 | 105 | over-other | 1 | lesser, Feared, day 105 | 3 | 4 | global/global | w3(1) w4(3) w5(2) |

Seated + won (2/2 seated runs won): 73642 (seat day 160, lesser, Feared),
73648 (seat day 105, lesser, Feared). Both wins truncate the window — the
win snapshots below ARE the end snapshots for those seeds (the recorder's
win-day snapshot equals the end snapshot, as expected when the run ends at
the win).

### Per-component distance table + ranked binding-blocker list

Median distances, end snapshot (armed; baseline identical):

| component | bar | median end dist | median max-reach dist | seeds blocked (end) |
|---|---|---|---|---|
| w5 | 2 distinct fought | 2 (FULL bar, 0 fought everywhere) | 2 | 8/8 |
| w4 | 3 distinct fought | 3 (FULL bar on 6 seeds) | 3 | 6/8 |
| w3 | 4 distinct fought | 2 | 2 | 6/8 |
| foodDeeds | sentiment + surge | 1 | 1 | 6/8 |
| w2 | 5 distinct fought | 0 | 0 | 1/8 (73647 only) |
| contests | 3 survived | 0 | 0 | 1/8 (73647 only) |
| crises | 3 | 0 | 0 | 1/8 (73641 only) |
| w1 | 5 distinct fought | 0 | 0 | 0/8 |
| stage | ≥ 2 | 0 | 0 | 0/8 |

RANKED (binding = blocks the most seeds, then largest median distance):
**1. w5 (8/8, median dist 2) — 2. w4 (6/8, median dist 3) — 3. w3 (6/8,
median dist 2) — 4. foodDeeds (6/8, median dist 1) — 5. w2/contests/crises
(1/8 each, early-death seeds only) — 6. w1/stage (0/8, never binding).**

Max-reach distances EQUAL end distances on every component (median and
per-seed): no seed ever got closer to full than its end state, so the
ranking is not an end-state artifact — there is no hidden closer approach
that decay erased.

### The w5 wall, decomposed (the unlock chain behind the bars)

- Wave-5 fights: 0 on all 8 seeds (max w5 reach 0). Wave 5 NEVER UNLOCKED
  (unlockedWave max 4). Standing: t4 = 100, t5 = 200; max standing reached
  172 (73642), then 152, 100, and FOUR seeds pin at exactly 99 (73641,
  73643, 73645, 73648 — one point below the wave-4 bar). Hold kind is
  `below-bar` everywhere — the cap/deferral holds never even trigger,
  because standing never reaches t5. The w5 bar is not "hard to fill", it
  is unreachable on this band: no wave-5 monster exists to fight.
- Wave-4 fights: cleared on only 2/8 seeds (73644: 7 distinct, 73646: 3).
  73642 fought 1 of 3. The other 5 seeds fought 0 wave-4 monsters — because
  4 of them never unlocked wave 4 at all (standing pinned at 99), and 73647
  died day 18.
- FoodDeeds split (the diagnostic the recorder exists to give):
  sentimentTaught lands on ALL 8 seeds (days 12–26); feastSurgeUsed lands
  ONLY on the 2 seated/won seeds (73648 day 52, 73642 day 154). The missing
  half is always the surge, never the sentiment. On the 6 blocked seeds
  the foodDeeds distance is exactly 1 deed.
- Closest seed to full: 73644 — blocked ONLY by w5 (2) + foodDeeds (1).
  It cleared w4 (7 fought), w1–w3, contests, crises, stage, and reached
  global — then decayed to regional and never saw a table (arc 3, no
  preview). Even the closest seed never sat, let alone sat full.
- Win snapshots (the truncation finding): 73642 at the win is blocked only
  by w4(2) + w5(2) — the closest any run gets to full; 73648 at the win is
  blocked by w3(1) + w4(3) + w5(2). Winners stop at 160/105 days and never
  get more fights: winning EARLY is itself a full-seat blocker, because
  the lesser seat converts the run before the wave bars can fill.
- Indispensable sub-gates (for when the seat IS full): indispScore clears
  the 10 bar on 7/8 seeds (72–190; only day-18 death 73647 scores 8).
  foodShared > 0 on 73642 (7), 73645 (7), 73648 (26) — so on a hypothetical
  full seat, the indispensable door would open on the winners but stay
  shut on 73644 (score 190, foodShared 0) for want of one shared meal.
  The indispensable door is NOT the binding constraint; the seat is.

### Reachability verdict: full seat NOT REACHED — 0/8, and not close

No run took a full seat (enteredFull 0/8 both arms). The full seat is
decoration on this band, not merely untested: the binding blocker (w5) is
structurally unreachable — wave 5 never unlocks because standing never
reaches 200 (max 172, four seeds pinned at 99) — and the second blocker
(w4) clears on only 2/8 seeds. The lesser seat, by contrast, converts 2/2
invitations into wins on this band. The gap between lesser and full is not
one more push; it is the entire wave-4/5 unlock chain plus one feast-surge
deed. Any future full-seat arm must attack wave-5 unlocking (standing past
200) first — filling wave bars one fight at a time cannot work while the
waves themselves are locked.

### Village assessment (plain words)

These villages climb further than the 1955Z band — 7 of 8 reach national,
6 end there or higher — and then they stall one point short. Four villages
sit at standing 99, one point below the wave-4 bar, for the rest of their
lives: they have the people, the food, the contests, the crises, and they
simply never get the fourth wave's monsters to fight. The two villages that
do get invited sit down, win through the lesser seat, and walk out with
terror pledged as a shield — while still three wave-bars short of a full
seat, because winning ends the story before the fighting does. The village
that comes closest to full never gets invited at all: it reaches global,
fights seven wave-4 monsters, and then quietly slides back to regional
while the table never comes. The full seat is not a prize these villages
narrowly miss. It is a door in a part of the house they cannot reach yet —
the stairs (waves 4 and 5) are not built on this band.

### Sense-testing read (NON-MEASURED replay, seed 73648, armed, narration on)

File: `evidence/2026-10-24/sim-fullseat-diag-a-sense.txt` (240-line ring;
seat day 105 matches the measured run exactly — narration did not diverge
the timing).
Judgment — meaning, coherence, consequences:
- The seat scene reads sensibly end to end. Day 104: "The table is being
  set — a lesser seat, priced for what you built." Day 105: the audit
  reads the REAL run back ("lesser seat — global standing, waves 1–3
  faced (15/6/3), 9 contests survived, 4 crises weathered") and honestly
  does NOT claim wave 4/5 ("The table does not rise. It prices.").
  Sanctity is voiced ("EVERYONE. SIT. WATCH. The teeth and the weather
  can WAIT").
- Villagers react inside the scene: "Your people stand a little straighter"
  when the terror is spent as a shield, not a sword; the final live choice
  ("Show mercy") resolves into a consequence that lasts — terror pledged
  as a shield over every village, and the audience weeping at mercy from
  a predator. The ledger earns the light road.
- One wrinkle, not a defect: routine chatter (a locket-feast line, a cook
  assignment) resumes inside the same day's ring after the finale, slightly
  undercutting finality — the same post-finale-chatter note as 1955Z.
- Mechanism visible in the replay: the feast-as-weapon line ("The feast
  was the weapon") fires days 103–105, right before the seat — consistent
  with this seed's feastSurgeUsed day 52 and the surge deed being the
  food-thesis half that lesser seats, but not full seats, already clear.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before <summary.json>
--after <summary.json> --out /tmp/panel-fullseat-diag-attempt`. Result: the
compare threw the SAME error as 1955Z — `TypeError: Cannot read properties
of undefined (reading 'days')` in `scripts/lib/balance-scorecard.js`
`comparePanels` — and wrote no output. The panel requires panel-driver
output (panel.json.gz with observer/contract digests and panel records),
not per-seed sweep rows. The sweep-compare tables above are the before/after
comparison for this run, on identical seeds, judged against the
pre-registered bar. (Panel-contract work belongs to the live
panel-contract-rulings lane — not touched.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. G2 as
  specified here (ALL seeds identical, not just pre-national) is the right
  strength for a pure-read instrument: a daily recorder that leaked anywhere
  would have shown up, and it showed nothing.
- "Median days" as a cost bar is uninformative for a pure-read arm (180 vs
  180 by construction); the informative neutrality proof is the per-seed
  identity (G2) plus the identical death-cause breakdown (294 = 294, same
  counts in every cause). Future diag arms should judge on G2 identity,
  not on median days.
- One metric gap for the NEXT full-seat run: the recorder's max-reach
  distances equal end distances here, but on bands where villages decay
  (national → regional, as 73644 did), max-reach vs end divergence would
  matter — keep reporting both, and pre-register which one judges.
- "Entered full" as a metric needs a companion: "closest approach" (the
  ranked blocker list) is what made this run diagnostic even at 0/8 —
  without it, 0/8 would have been a shrug instead of a decomposition.

### Findings outside this arm (reported, NOT touched — for the coordinator)

- Standing pins at 99 on 4/8 seeds (one point below the wave-4 bar) — the
  wave-4 unlock stall, not just wave 5, deserves its own arm.
- Winners truncate the full-seat window: any full-seat chase on a
  seat-taking substrate must reckon with lesser-seat wins ending runs
  before wave bars fill (seat-taking and full-seat-chasing pull opposite
  directions on the same band).
- Post-finale routine chatter resumes immediately after the finale (same
  note as 1955Z) — undercuts ending finality.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (8/8 armed configs
with end + win snapshots, ranked blockers, G1/G2/G3 all PASS), but the
THING measured is still blocked: full seat 0/8, w5 unreachable (standing
never reaches 200), w4 cleared on 2/8. The standing directive stands —
the scale wall past national is now decomposed, not climbed. No default
flips; the recorder already landed 2026-10-21 and is reused unmodified.


