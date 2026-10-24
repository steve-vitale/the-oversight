# sim-tablepaths-a — table path-diversity on the tableseat-nowait substrate (axis scale-onramp)

Run: fleshout-20261024T2115Z. Worktree: `~/workspace/worktrees/sim-tablepaths-a`
(branch sim-tablepaths-a). Sibling lanes NOT touched: loop-B food-economy arms,
gap-w4-narr, panel-contract-rulings. Zero `src/js` changes — policy-side only.
NEVER edited: `scripts/policies/tableseat-nowait.js`, `scripts/policies/leanlinkrescue.js`.

## Canon read first

- docs/CANON.md, docs/TABLE.md. Seat contract: full seat keeps the national bar;
  lesser seat priced without national; indispensable is FULL-only; relay qualifies
  by integration depth (stage ≥ 3, or stage 2 + relay office), not territory.
  Branches are ledger-earned, never a menu choice — this arm never overrides
  `tableBranch`. No canon invented.
- Prior round (evidence/2026-10-24/sim-tableseat-round-1955.md + sim-tableseat-nowait-a.md):
  tableseat-nowait (leanlinkrescue courtship + seat legs, no wait leg) takes the
  lesser seat 3/8 and wins 3/8 — but every seat resolved to the Feared path
  because the seat legs always answer the FIRST table option. Path diversity is
  untested. This arm is that test.

## OPTION -> PATH MAPPING (from code, NOT guessed — read before any sweep)

- `src/js/table.js` `tableOfferPaths()` (line ~850): the paths-phase modal offers
  ONLY earned paths, as options `{ id: 'path:' + p.id, label: 'Walk the path of
  <name>' }`. Unearned paths are shown priced in the prompt text but are NOT
  options — a driver can never take an unearned door.
- `tableEarnedPaths()` iterates `Object.keys(PATHS)` = registration order =
  `index.html` script order: feared, indispensable, beloved, witness, assimilated,
  defiant, relay. Indispensable is `minSeat: 'full'`, so at a lesser seat it is
  never offered. Lesser-seat offered order (among earned): feared → beloved →
  witness → assimilated → defiant → relay.
- `chooseTableOption(id)` routes `path:<id>` in phase `paths` to
  `tableStartPath(id)`; `downgrade:<id>` in phase `downgrade` to a lesser path;
  challenge/finals/conscript/demand-price ids route to their own phases.
  This arm's override touches ONLY the paths phase (options all `path:*`).
  Every other phase answers the FIRST option, exactly like the baseline.
- Why the baseline always walks Feared: feared registers FIRST and its prereq
  is easy (ledger might+killed ≥ 6, `src/js/table-feared.js`), so whenever
  feared is earned it IS `options[0]`, and the nowait answer rule always picks
  `options[0]`. The other doors' prereqs (from their `table-<path>.js`):
  beloved needs showmanship+protected ≥ 6 AND (viewership ≥ 12 or fan favor > 0);
  witness needs exposed ≥ 3; assimilated is always earned at a seat; defiant
  needs defiance ≥ 4; relay needs stage ≥ 3 or stage 2 + relay office.
- FILENAME COLLISION (found before writing code): `scripts/policies/tablepaths.js`
  ALREADY EXISTS — the 2026-10-19 seatdrive-substrate path-forcing driver
  (plus `tablepathdriver.js`, 2026-10-20). Overwriting it would destroy prior
  work on a different substrate. This arm's policy is therefore named
  `scripts/policies/tablepaths-nowait.js` (same job, tableseat-nowait substrate).
  The coordinator may rename on landing; the evidence header records the
  collision so the file is never silently clobbered.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Arm: `scripts/policies/tablepaths-nowait.js` = tableseat-nowait wrapped with
  a paths-phase answer override ONLY. `TABLEPATHS=1` gate; gate OFF delegates
  to tableseat-nowait daily exactly (det-gate proof on seed 73641).
- Baseline: tableseat-nowait (`TABLESEATNOWAIT=1`, leanlinkrescue courtship
  shared exactly), identical seeds, same instrument. OWN baseline replication
  (8) + armed (8) = 16 configs. No reuse of the 1955Z corpus.
- Seeds (pilot): 73641–73648. Freshness verified: no 7364-named files in
  evidence/2026-10-24, no 73641–73648 content hits in evidence/2026-10-24, and
  the only older hits are incidental numbers, not seeds (73647 = a pantryKcal
  value in a 2026-10-15 raidassess file; 73642 = a float fragment in a
  2026-10-17 feastvoice file). No prior per-seed corpus used these seeds.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- ANSWER RULE (pre-registered, deterministic, implemented exactly as written):
  at a paths-phase offer (all options `path:*`), let ASSIGNED =
  ROTATION[(seed − 73641)] with ROTATION =
  ['defiant','assimilated','beloved','relay','defiant','assimilated','beloved','relay'].
  (1) If ASSIGNED is offered, take it. (2) Else take the first offered door
  that is NOT 'feared', in engine order. (3) Else (only feared offered) take
  feared. A door never offered is NEVER taken. Downgrade, conscript,
  demand-price, challenge beats and finals all take the first option, exactly
  like the baseline, so the delta is ONLY the door choice. Branches stay
  ledger-earned. The offer (offered ids + earned snapshot + why-strings) is
  recorded per seating for the NO-GO report.
- Primary: table entered PER PATH. GO (reachability) requires ≥ 1 NON-FEARED
  path entered on the pilot AND the full cost bar passing. If the rule still
  walks only Feared, that is NO-GO — the evidence reports which options were
  actually offered (with why-strings) on every seating.
- Deciding cost bar (from sim-scalemetric, binding — all three must pass WITH
  the primary or NO-GO): (1) starvation deaths armed total ≤ baseline total + 2;
  (2) arm-only starvation (armed starvation deaths on seeds where the paired
  baseline row had none) ≤ 2; (3) median days armed ≥ 0.8 × baseline median days.
  Starvation matcher: death cause matching /starv|hunger/i.
- Secondary (reported, not judged): national ever/final, entered per path, wins
  per path, wave 4/5 reach, max arc, death-cause shares, seat attempts/taken/kind/day.
- Proof gates: G1 det-gate (TABLEPATHS unset, TABLESEATNOWAIT=1: seed 73641,
  my-policy days == tableseat-nowait days, no tp counters); G2 pre-national
  read-only (seeds where neither arm reached national match on days/gameDays);
  G3 corpus integrity (16/16 rows, days > 0, counters present).
- GO → policy file lands as its own commit, default-OFF only, NO default flips
  (GO means GO CANDIDATE as an instrument, not competent play).
  NO-GO → DELETE the policy file, land instruments + evidence only.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the corpus;
  attach the compare .md if the panel ingests it, else record exactly why not
  + sweep-compare tables. Do NOT chase the panel-contract lane.
- Sense-testing law: one NON-MEASURED narration-on replay read of an
  entered/table run — judge meaning/coherence/consequences, never numbers.

## RESULTS — GO (pilot 8+8, seeds 73641–73648, horizon 180d, death-aware)

Sweep: `node scripts/test-tablepaths-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-tablepaths-a/` (16/16 rows + summary.json,
per-config incremental writes via the chunked writer subprocess).
G1 det-gate: PASS (seed 73641, TABLEPATHS unset: baseline 180/181 days ==
armed 180/181 days, tp counters empty).
G2 pre-national read-only: PASS (seed 73647, the only seed where neither arm
reached national: 18/18 days both).
G3 corpus integrity: PASS (16/16 rows, all days > 0, counters present).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (tablepaths-nowait) |
|---|---|---|
| n | 8 | 8 |
| won | 2 | 2 |
| median days / median gameDays | 180 / 181 | 180 / 181 |
| max days | 180 | 180 |
| national ever / final | 7 / 6 | 7 / 6 |
| table invited ever (tableWaiting) | 2 | 2 |
| table entered — total | 2 | 2 |
| entered per path — PRIMARY | feared 2 | assimilated 1, relay 1 |
| won per path | feared 2 | assimilated 1, relay 1 |
| non-Feared entered / won — GO CHECK | 0 / 0 | 2 / 2 |
| wave 4 / wave 5 reach | 3 / 0 | 3 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 5 | 5 |
| arm-only starvation | — | 0 |
| seat attempts / taken / failed | 2 / 2 / 0 | 2 / 2 / 0 |
| preview seen / not-ready | 7 / 5 | 7 / 5 |
| table answers | 10 | 11 |

Verdict against the pre-registered bar: **GO**.
- Primary: armed non-Feared entered 2 ≥ 1 — PASS.
- Cost 1: starvation armed 5 ≤ baseline 5 + 2 — PASS.
- Cost 2: arm-only starvation 0 ≤ 2 — PASS.
- Cost 3: median days armed 180 ≥ 0.8 × 180 (= 144) — PASS.
GO means GO CANDIDATE as an instrument, default-OFF only — NOT competent play.
No default flips. The policy file lands as its own commit.

### Per-seed detail (what actually happened)

- Seated + won, paired identically except the door: 73642 (seat day 160,
  lesser; baseline walked feared/light, armed walked ASSIMILATED/light via the
  `assigned` rule — assigned was 'assimilated' for seed index 1 — and won;
  5 table answers both arms) and 73648 (seat day 105, lesser; baseline feared/
  light, armed walked RELAY/grey via `assigned` — assigned was 'relay' for seed
  index 7 — and won; the relay walk took one more table answer than the
  feared walk, 11 vs 10 armed total).
- The full lesser menu was offered on BOTH seatings, in engine order:
  feared, beloved, witness, assimilated, defiant, relay (indispensable
  correctly absent — full-seat floor). The earned snapshots prove the old
  first-option rule was hiding five earned doors, not that the doors were
  locked: 73642 offered witness (4 exposures), beloved (viewership 44, fan
  favor 89), defiant (12), relay (stage-3 neural), assimilated (always open);
  73648 offered witness (3 exposures), beloved (viewership 33, fan favor 20),
  defiant (6), relay (stage-3), assimilated. Witness IS earned on this road —
  the 2026-10-20 tablepathdriver note that witness is never earned does not
  hold on the leanlinkrescue substrate (see findings).
- No other seed seated: 73641/73643/73645 reached national but never saw a
  preview (arc 3 — Arc IV gates the table, as in 1955Z); 73644 reached global
  but decayed to regional with no table; 73646 died day 103 (village-lost,
  starvation 3, both arms); 73647 died day 18 (village-lost, both arms, the
  G2 seed). Paired rows are IDENTICAL on every seed except the door walked:
  same days, same end reasons, same death maps, same seat days.
- Death-cause shares are identical between arms (294 deaths each): combat
  40.5%, villager combat 27.6%, arena 10.2%, expedition 6.1%, monster 4.8%,
  sickness 3.4%, starvation 1.7% (5 deaths: 73644 player 1 + 73646 villager 3 +
  73647 villager 1 — same both arms). The door rule adds no death anywhere.
- Wave 5: 0/8 both arms — untouched by this arm. Wave 4: 3/8 both arms.
  National reach itself is unchanged by the door rule (7/8 ever, 6/8 final,
  both arms) — the door moves WHICH ending the seat converts to, not scale.

### Village assessment (plain words)

The village that sits down wins — and now it can win through a door other
than terror. On these seeds the leanlinkrescue village climbs, gets invited,
and the old rule walked it through the Feared door every time, because Feared
registers first and its bar is easy. The menu was never empty: beloved,
witness, assimilated, defiant, relay were all earned and waiting, priced in
the prompt text, just never chosen. Give the same village a rule that picks
its assigned door — or, failing that, the first door that isn't Feared —
and the same two invitations turn into an Assimilated win (going inside
carrying the truth, light road) and a Relay win (the grey middle road, both
hands, no merge, no champion), with no extra starvation, no shorter life,
and not one death moved. The door is a choice now, not a funnel. What the
door does NOT do: it does not create invitations, move scale, or open wave 5
— those walls stand exactly where they stood.

### Sense-testing read (NON-MEASURED replay, seed 73648, armed, narration on)

File: `evidence/2026-10-24/sim-tablepaths-a-sense.txt` (240-line ring;
seat day 105 and relay path match the measured run — narration did not
diverge the timing).
Judgment — meaning, coherence, consequences:
- The relay walk reads sensibly end to end. Day 104: "The table is being
  set — a lesser seat, priced for what you built." Day 105: the ring of
  pale light, the audit reading the REAL run back ("lesser seat — global
  standing, waves 1–3 faced (15/6/3), 9 contests survived, 4 crises
  weathered"), the war-path bars honestly showing wave 4/5 unmet, one
  ascension priced into the terms ("Nobody has ever seen that before"),
  sanctity voiced ("EVERYONE. SIT. WATCH.").
- The door grants read as the relationship, not terrain: Deep Listen,
  Faithful Carry, Relay-sight. The ledger line voices the band correctly
  for relay: "The middle road is open" (grey — not the binary road).
- The cockpit's risk is honest, not decorative: three backfires in one
  walk, each with a named consequence — the relay fries (a day's messages
  scatter, everybody assumes the worst), a de-integration jolt (the System
  flinches away, then back), a wrong frequency (a rival village heard
  everything for an hour; their trust in Haven drops; viewership ticks up).
  The probe beat lands ("SUBJECT SHOWS CURIOSITY. CURIOSITY IS
  INEFFICIENT. CURIOSITY IS... NOTED.").
- The final resolves and plants at once: "Stay both-hands. No merge, no
  champion." — "Neither," you say. "Both. Whichever the village needs." —
  the machine ACCEPTS an unclean answer ("I CAN BE BOTH"). The epilogue
  keeps the village's agency: the OUTSHONE beat fires alongside the win
  ("Rosa Mendez did what you would not... The village thrives. The god is
  someone else. The record notes, kindly and accurately, that you
  watched.") — facilitation/outshone architecture working as designed,
  not a contradiction of the win.
- Villagers act like people throughout the run, not just in the finale:
  Dakota waves off the day's share at full shelves ("No more into the
  store — we eat at the fire, and the shelves keep"), Ethan asks for work
  by the fire, gossip visibly mutates as it travels ("It's picking up
  decorations as it travels"), Mia patches the hurting before they head
  out. One thin note, same class as 1955Z: routine assignments (Rosa fish,
  Dakota cook) resume immediately after the finale inside the same day's
  ring, slightly undercutting finality — documented, not a defect in the
  door walk.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-tablepaths-a/summary.json --after <same>
--out /tmp/panel-tablepaths-a`. Result: the compare threw the SAME
`TypeError: Cannot read properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels` as in 1955Z, and wrote
no output. Why, exactly: panel `compare` requires panel-driver output
(panel.json.gz with observer digests, contract digests, per-policy panel
records), not per-seed sweep rows. The sweep-compare tables above are the
before/after comparison for this run, on identical seeds, judged against
the pre-registered bar. (Running full panel-driver runs for both policies
would be a separate instrumentation job, not a reformat of this corpus.)
Not chased — the panel-contract lane owns that fix.

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. The
  per-path primary (not just entered total) was the right call: entered
  total is 2 vs 2 and says nothing — entered per path is the whole result.
- "Median days" as a cost bar was non-binding here (180 vs 180 — the wins
  end at 160/105 but the median seed survives to 180 both arms). The 1955Z
  note stands: median-among-non-winners would be a cleaner cost metric for
  stronger future arms.
- New metric note for the NEXT seat arm: record the OFFERED menu + earned
  snapshot on every seating (this arm's `tpOffers`), not just the walked
  path. The offered menu is what distinguishes "door locked" from "door
  hidden by the answering rule" — the distinction this whole arm turned on.

### Findings outside this arm (reported, NOT touched)

- Witness IS earned on the leanlinkrescue substrate (3–4 exposures on both
  seated seeds) — contradicts the 2026-10-20 tablepathdriver note that
  witness is never earned on this road. A witness-door walk is now a live
  next arm (rotation slot exists: assign 'witness' on a fresh seed band).
- Beloved/defiant/relay all earned at lesser seats on this substrate; only
  indispensable stays locked (full-seat floor, wave 4/5 unreachable).
- Post-finale routine chatter resumes immediately (same note as 1955Z).
- Balance-panel ingestion gap persists (same throw as 1955Z) — live
  panel-contract lane's item, not touched.

### Convergence state

Axis scale-onramp: this arm GOES as a GO CANDIDATE instrument (door
diversity proven: 2/2 seatings walked non-Feared doors and won, at zero
measured cost). The scale wall itself is untouched by the door rule
(national ever/final, wave 4/5 identical both arms) — the directive stands
until the tracker records this axis converged on measured evidence. Next
blanks, in order: (1) a witness-door walk (now known earnable); (2)
full-seat reachability; (3) whether the fallback-non-feared rule (never
exercised — both seatings took their assigned door) matters on a band
where the assigned door is unearned.

