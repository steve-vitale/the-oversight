# sim-vetkill-a — decompose the standing-99 veterans lock with a waveKillLog diag (axis scale-onramp)

Run: fleshout-20261024T2315Z. Worktree: `~/workspace/worktrees/sim-vetkill-a`
(branch sim-vetkill-a). Axis: scale-onramp (standing directive — still
stands: wins only via default-OFF instruments, lesser seat only, wave 5
still 0).

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (wave 4: Mirror Draft, standing >=
  100; wave 5 gate: standing >= 200 AND wave 4 faced; readiness demands
  table: wave 4 = armored 3 @P>=10, armed 5, tricks 3, veterans 1 (killed
  wave-3+); wave 5 = armored 4 @P>=15, armed 6, tricks 3, veterans 2
  (killed wave-4+)), docs/MEASUREMENT.md §§9-12, 14-15 (pilot gate,
  death-aware horizons, pre-registration, metric binding, balanced panels).
- NOTE on the brief's TABLE.md pointer: docs/TABLE.md itself carries no
  combat-readiness gate section (it covers pricing, branches, trial by
  combat). The gate lives in src/js/standing.js (combat-readiness
  deferral, design call #4 2026-10-16) and the demands table in
  docs/MONSTER-WAVES.md — read there, not invented.
- Code authority for the mechanism under test: src/js/standing.js —
  `waveCombatReadiness(w)` counts veterans as DISTINCT killer vids with
  wave-(w-1)+ kills in `state.waveKillLog`, LIVING only by default
  (VETSHAPE=1 is the separate default-OFF living-OR-DEAD instrument,
  NOT flipped here); src/js/game.js `recordWaveKill` /
  `recordPyrrhicKill` append `{d, mid, w, by, via, trick}` entries
  (dedupe on exact (day, monster, killer, via, trick); 1000-entry cap);
  `state.village.fallen` entries carry `{villagerId, day, cause, name}`
  — the death-day source, investigated from code, not invented.
- Prior run: evidence/2026-10-24/sim-standing99-diag-a.md (seeds
  73671-73678, tableseat-nowait substrate): standing 99 is a defer4
  VETERANS lock (living wave-3 killer 0/1) — but its daily trajectory
  CANNOT distinguish (a) stuck seeds never kill a wave-3+ monster, vs
  (b) they kill one but the killer dies, including same-day intraday
  cases like seed 73676 (kill + link collapse between daily samples,
  only the peak ratchet remembers). The waveKillLog is append-only, so
  it survives the killer's death: recording it directly settles (a)
  vs (b). That is this arm's entire job.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait
  leg. Seeds: 73671-73678 — the SAME band as standing99, reuse
  intentional here: this is a re-measurement of those seeds with a new
  recorder, not a fresh band.
- Baseline: tableseat-nowait, `VETKILL` unset. Own baseline replication
  (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with scripts/policies/vetkill-diag.js
  (`VETKILL=1`). The recorder is PURE-READ: it never calls
  `villageStandingTotal()` during a run (side-effecting peak release +
  hold beats); it copies `state.waveKillLog` and reads
  `waveUnlockReady(4/5)` veteran counts (pure reads, same class as the
  standing99 recorder's reads). It writes nothing to game state and
  draws no RNG; read errors are counted, never silently swallowed.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- DIAG-GO requires ALL of:
  1. G1 det-gate: recorder unset == unwrapped tableseat-nowait on one
     seed (days/gameDays/ts counters identical, no `_vetkilldiag`
     surface);
  2. G2 neutrality: baseline vs recorder identical on days/gameDays/ts
     counters/starvation on all 8 seeds;
  3. G3 corpus integrity: 16/16 rows, every armed row carries the full
     kill-log classification + daily veteran trajectory, every baseline
     row carries a post-run pure-read kill-log snapshot;
  4. Classification completeness: EACH focus seed 73674, 73675, 73677,
     73676 classified with log evidence quoted as NEVER-KILLED,
     KILLED-DEAD-KILLER, or KILLED-LIVING-KILLER. A seed that cannot be
     classified from log+roster is UNCLASSIFIED with the reason stated,
     and fails (4) for that seed — do not guess.
- The classification verdict itself (which class wins) is a FINDING, not
  a pass/fail: NEVER-KILLED points the next lever at wave-3
  encounter/kill opportunity; KILLED-DEAD-KILLER points it at killer
  survivorship.
- Do NOT move readyDemand numbers, do NOT flip VETSHAPE, do NOT change
  any default — this arm is diag only.
- Cost bar (diagnostic, reported): starvation totals and median days,
  baseline vs recorder.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare` on
  the corpus; if it throws (known failure on per-seed rows), record
  exactly why and use sweep-compare tables as the comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a
  stuck seed (73675 preferred, else 73674) — judge meaning,
  coherence, relevance, consequences, never just counts: does the game
  ever tell the village WHAT deed counts as a veteran, or who died
  bloodied?

## Instrument

- `scripts/policies/vetkill-diag.js` (new recorder, `VETKILL=1` gate).
- `scripts/test-vetkill-diag-sweep.js` (sweep + --detgate + --sense
  modes), modeled on `scripts/test-standing99-diag-sweep.js` (loadGame/
  setupGame/runDays, per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`).
- `scripts/test-vetkill-diag.js` (proof test: log classification on
  synthetic logs incl. dead-killer, living-killer, empty-log,
  intraday-fleeting cases; purity on a mock Game).
- Corpus: `evidence/2026-10-24/perseed-vetkill-a/` (16 rows + summary.json).

## RESULTS — DIAG-GO (pilot 8+8, seeds 73671–73678, horizon 180d, death-aware)

Sweep: `node scripts/test-vetkill-diag-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-vetkill-a/` (16/16 rows +
summary.json, per-config incremental writes via the chunked writer
subprocess).
G1 det-gate: PASS (seed 73671, VETKILL unset: baseline 93/93 days ==
wrapped 93/93 days, ts counters identical
`{"tsNationalDay":83}`, no `_vetkilldiag` surface).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
261 = 261 with the same counts in every cause, same as standing99).
G3 corpus integrity: PASS (16/16 rows, all days > 0; every armed row
carries the full kill-log classification + daily veteran trajectory
(92–180 points, 0 recorder errors on every armed row, 0 log-copy
errors on all 16 rows); every baseline row carries a post-run
pure-read kill-log snapshot).
Classification completeness (G4): PASS — all four focus seeds
classified, none UNCLASSIFIED. Baseline and armed classifications agree
on all 8 seeds (the post-run snapshot is recorder-independent, as it
must be: the log is engine state, not recorder state).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ vetkill-diag) |
|---|---|---|
| n | 8 | 8 |
| won | 4 | 4 |
| median days / median gameDays | 150 / 150 | 150 / 150 |
| max days | 180 | 180 |
| national ever / national-or-higher final | 8 / 7 | 8 / 7 |
| table invited ever (tableWaiting) | 5 | 5 |
| table entered (tableDone) | 4 | 4 |
| wave 4 / wave 5 reach | 5 / 0 | 5 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 3 | 3 |
| death total | 261 | 261 (identical breakdown) |
| seat attempts / taken / failed | 4 / 4 / 0 | 4 / 4 / 0 |
| preview seen / not-ready | 17 / 7 | 17 / 7 |
| table answers | 20 | 20 |

Baseline and armed agree on EVERY aggregate, and the wall numbers
replicate standing99 exactly (won 4, wave 4 reach 5, wave 5 reach 0) —
this is a re-measurement of the same seeds, and it reproduces them.
Death causes (identical both arms): villager combat 106 +
villager-vs-villager combat 71 + player arena 38 = 215/261 (82%)
combat; starvation 3; expedition 16, monster 11, rest small.

### The verdict: (a) AND (b) — three seeds never killed, one seed killed and lost the killer the same day

| seed | days | end | won | wave | w3+ kills | first w3 day | verdict (w3) | verdict (w4) | living w3 killer at end |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | 93 | village-lost | 0 | 4 | 2 | 65 | KILLED-DEAD-KILLER | NEVER-KILLED | none (both dead) |
| 73672 | 106 | over-other | 1 | 4 | 4 | 63 | KILLED-DEAD-KILLER | NEVER-KILLED | none (both dead) |
| 73673 | 134 | over-other | 1 | 4 | 2 | 105 | KILLED-DEAD-KILLER | NEVER-KILLED | none (both dead) |
| 73674 | 180 | survived | 0 | 2 | 0 | — | NEVER-KILLED | NEVER-KILLED | — |
| 73675 | 180 | survived | 0 | 3 | 0 | — | NEVER-KILLED | NEVER-KILLED | — |
| 73676 | 174 | village-lost | 0 | 4 | 1 | 116 | KILLED-DEAD-KILLER | NEVER-KILLED | none (dead same day) |
| 73677 | 98 | over-other | 1 | 3 | 0 | — | NEVER-KILLED | NEVER-KILLED | — |
| 73678 | 150 | over-other | 1 | 4 | 2 | 93 | KILLED-LIVING-KILLER | NEVER-KILLED | nadia_khoury (alive) |

Focus seeds, with log evidence quoted (armed arm; baseline identical):
- **73674 — NEVER-KILLED.** Log 18 entries, 0 wave-3+, daily rd4
  veterans 0 on all 180 sampled days. No wave-3+ kill ever happened;
  the daily samples told the truth here.
- **73675 — NEVER-KILLED.** Log 22 entries, 0 wave-3+, daily rd4
  veterans 0 on all 180 sampled days. Same: no kill, not a lost
  killer.
- **73677 — NEVER-KILLED.** Log 14 entries, 0 wave-3+, daily rd4
  veterans 0 on all 98 sampled days. Same.
- **73676 — KILLED-DEAD-KILLER (the intraday case, proven).** Log 21
  entries, exactly 1 wave-3+: day 116, `buffering` (w3), killer
  `nadia_khoury`, via `player`. Killer dead at end, death day 116
  (fallen: cause `the arena`, observed) — killed and died THE SAME
  DAY. Daily rd4 veterans: 0 on all 173 sampled days, including day
  116's end-of-day sample — the daily trajectory missed this kill
  entirely, exactly as standing99 suspected. The log is the only
  witness, and it is decisive: (b) is real, not hypothetical.
  (Standing99's day-115→116 war 0→25 jump + peak ratchet trip are the
  same event seen from the ledger side.)

The non-focus seeds sharpen both halves of the answer:
- 73671/73672/73673 are KILLED-DEAD-KILLER too: they killed wave-3+
  (2/4/2 kills), opened wave 4 (rd4-ready 27/20/13 days), and then
  every killer died — so "living veterans 0 at end" on those seeds
  was NEVER "never killed" either. Only 73678 ends with a living
  wave-3 killer (nadia_khoury, kill day 93, alive at end; rd4-ready
  58 days).
- **Wave-4+ kills: 0 on all 8 seeds, wave-5 kills: 0.** The rd5
  veterans bar (2 living wave-4 killers) is 0 on every day of every
  seed — daily rd5 veterans never exceed 0 anywhere. The wave-5 block
  is not a measurement artifact: nobody has ever killed a wave-4
  monster in this band, so there is nothing for the bar to count.

### Killer-by-killer ledger (armed arm; baseline identical)

| seed | killer | kills (first day) | alive at end? | death day (observed?) | fallen cause |
|---|---|---|---|---|---|
| 73671 | jorge_silva | 1 (d65, terms_of_service, companion) | no | 92 (yes) | the arena |
| 73671 | gen_ffi6aqq | 1 (d79, terms_of_service, player) | no | 86 (yes) | the arena |
| 73672 | gen_yg1x0kp | 3 (d63 ad_break, d77/d78 spool, player) | no | 82 (yes) | the arena |
| 73672 | ethan_hunt | 1 (d103 ad_break, player) | no | 56 (yes, BUT see anomaly) | monster |
| 73673 | gen_6smm84l | 1 (d105 chorus_line, player) | no | 112 (yes) | the arena |
| 73673 | gen_vt9nswl | 1 (d113 chorus_line, player) | no | 118 (yes) | the arena |
| 73676 | nadia_khoury | 1 (d116 buffering, player) | no | 116 (yes) | the arena |
| 73678 | nadia_khoury | 1 (d93 focus_group, companion) | YES | — | — |
| 73678 | miguel_santos | 1 (d132 spool, player) | no | 133 (yes) | the arena |

Two patterns in this ledger, both reported as recorded, not inferred:
1. **Killers die in the arena, not to monsters.** 7 of the 8 dead
   killers carry fallen cause `the arena`; only 1 carries `monster`.
   The veterans bar is drained by show fights, not by the wilds — the
   same arena that the table seat legs drive the village toward. (The
   fallen cause is the engine's recorded cause; what exactly an
   "arena" death means in fiction is a question for the contest lane,
   not a claim made here.)
2. **Killer lifespans after first blood are short.** Excluding the
   living nadia (73678): 27, 7, 19, 7, 5, 0 (same-day), 1 days from
   first kill to death. A veteran is a fleeting state in this band —
   the bar demands a LIVING killer, and the killers keep dying within
   days of earning the title.

### Cross-validation against standing99's daily trajectories

The armed daily rd4-veteran trajectories reproduce standing99's
rd4-ready day counts exactly: 73671: 27 days, 73672: 20, 73673: 13,
73678: 58, 73674/73675/73677: 0, 73676: 0 (the missed intraday case).
Where the two instruments agree, the finding is doubly witnessed;
where they disagree (73676 only), the log wins — it records the kill
the samples missed. No other seed's daily trajectory hid a kill:
on 73674/73675/73677 the log confirms the samples (0 kills, not lost
killers).

### The 73672 ethan_hunt anomaly (reported, not smoothed over)

ethan_hunt's fallen entry says died day 56 (`monster`), but his
wave-3 kill is dated day 103 — a death day BEFORE the kill, which is
impossible for a single life. 73672's verdict does NOT depend on him
(gen_yg1x0kp alone: 3 kills days 63–78, died day 82, no living killer
— KILLED-DEAD-KILLER stands either way), and his person record does
read dead at end, so his dead/alive status is sound; only his death
DAY is not credible for survivorship timing. Possible causes: the
`by` attribution for `player`-channel kills may not always name a
person who was alive at kill time, or vids may be reused across
successions — either way, this arm's recorder takes the fallen map
first-entry-wins, and a future arm that needs killer timing should
record the FULL fallen list (all entries per vid), not a first-wins
map. Do not use ethan_hunt's day-56 date for any timing claim.

### Wall numbers (this run, armed arm = baseline arm)

National ever 8/8, national-or-higher final 7/8, table invited 5/8,
table entered 4/8, wins 4/8 (all lesser seat — the full seat remains
unreached), wave 4 reach 5/8, wave 5 reach 0/8, max arc 4, median
survival 150 days, max 180 days. Death-cause shares: combat 82%
(215/261), starvation 3, expedition 16, monster 11, rest small.
The standing directive stands: wins come only via default-OFF
instruments and the lesser seat; wave 5 still 0.

### What this means for the next lever (finding, not a change made here)

The standing-99 lock splits into TWO different problems by seed, and
they need different levers:
- **73674/73675/73677 (NEVER-KILLED): the lever is wave-3
  encounter/kill opportunity.** These villages never blooded anyone
  in 98–180 days. 73674 never even left wave 2 (wave-2 ledger points
  < 5 all run, per standing99). Lowering demand numbers changes
  nothing here — there is no kill for the bar to count.
- **73676/73671/73672/73673 (KILLED-DEAD-KILLER): the lever is killer
  survivorship.** These villages DID blood fighters, then lost them
  — mostly to the arena, within days. The demand shape (living-only)
  vs the already-existing default-OFF VETSHAPE instrument
  (living-OR-DEAD killers count) is the named next probe per
  standing99's step 2 — NOT moving readyDemand numbers, NOT flipping
  VETSHAPE as a default. This arm makes no such change: diag only.
- **Wave 5 needs a wave-4 kill first, and there are none.** Any
  wave-5 lever presupposes wave-4 kills existing; on this band they
  do not. The rd5 bar cannot be the next lever until a wave-4 kill
  happens somewhere.

### Sense-testing read (NON-MEASURED replay, seed 73675, armed, narration on)

File: `evidence/2026-10-24/sim-vetkill-a-sense.txt` (240-line ring,
days 178–181; outcome class matches the measured run exactly —
survived 180/181, max wave 3, no table — and its own post-run kill
snapshot confirms NEVER-KILLED: 22 log entries, 0 wave-3+).
Judgment — meaning, coherence, consequences:
- The stall is named but not explained, same as standing99 found.
  The System says aloud: `📺 SYSTEM: "📡 The next act is still
  waiting — blood your fighters (0 of 1 veterans)."` — the exact
  short bar, with the exact count. But nothing in the ring ever says
  WHAT deed counts as a veteran (which monsters, what "blooded"
  means), that the village sits one point short of 100, or what to
  DO: no scout report, no villager reacting to the System's line,
  no plan forming around it. The village hears a slogan, not an
  instruction — and for a NEVER-KILLED village, there is not even a
  dead fighter to mourn: the game never tells the village WHO died
  bloodied, because on this seed nobody ever was.
- And the stall is livable, which undercuts urgency: the same days
  show full pantries ("~21 days of fresh on hand"), a neighbor
  begging for food and being fed 2,184 kcal with thanks, gossip
  about a killing elsewhere (Sam killed, Kira blamed). The village
  has everything except the one thing the gate wants, and nothing
  in the fiction treats that as a crisis. A player watching these
  four days would conclude the village is doing fine — because by
  every measure except the gate, it is.
- One coherence note carried from standing99, confirmed here: the
  hold beat fires and routine life continues around it with no
  villager ever answering the System. The System speaks; nobody
  answers; the pantry stays full.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-vetkill-a/summary.json --after <same>
--out /tmp/panel-vetkill-attempt`. Result: the compare threw the SAME
error as 1955Z/2115Z/2215Z — `TypeError: Cannot read properties of
undefined (reading 'days')` in `scripts/lib/balance-scorecard.js`
`comparePanels` — and wrote no output. The panel requires
panel-driver output (panel.json.gz with observer/contract digests and
panel records), not per-seed sweep rows. The sweep-compare tables
above are the before/after comparison for this run, on identical
seeds, judged against the pre-registered bar. (Panel-contract work
belongs to the live panel-contract-rulings lane — not touched.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring.
  G2 as specified (ALL seeds identical on days/gameDays/ts/starvation)
  is the right strength for a daily recorder: it fired 92–180 times
  per run and leaked nowhere — and the identical death-cause
  breakdown (261 = 261) plus identical classifications on all 8 seeds
  corroborate it independently of the ts counters.
- "Median days" as a cost bar is uninformative for a pure-read arm
  (150 vs 150 by construction); the informative neutrality proof is
  the per-seed identity (G2) plus the identical classifications.
  Future diag arms should judge on G2 identity, not on median days.
- One metric gap found by this run, for the NEXT diag arm: the
  recorder's fallen map is first-entry-wins per vid, and the
  ethan_hunt anomaly (death day before kill day) shows a first entry
  is not always the death that ended the killer's life. A future arm
  that needs killer timing must record the FULL fallen list.
- "Daily veteran trajectory" is now proven to UNDERSTATE fleeting
  veterans (73676: 0 sampled days, 1 real kill) — the log is the
  authoritative source for "did a kill happen", the trajectory only
  for "was a veteran alive at end of day". Future evidence should
  cite the log for kills, never the trajectory alone.

### Findings outside this arm (reported, NOT touched — for the coordinator)

- Killer deaths are arena deaths (7/8 dead killers, fallen cause
  `the arena`): if killer survivorship becomes the lever, the arena
  is where veterans go to die — a contest-lane question, not a
  demand-numbers question.
- The ethan_hunt fallen/kill chronology anomaly (death day 56,
  kill day 103): either `player`-channel kill attribution or vid
  reuse needs a look from the owning lane; this arm's verdicts do
  not depend on it.
- The hold message names the bar but not the number or the deed: a
  player-facing gap, not a measurement gap (see sense read).

### Next arm (precise, documented — no game-code change made here)

**VETSHAPE probe on the KILLED-DEAD-KILLER seeds (73676/73671/73672/
73673, plus 73678 as the living control).** Numbers: veterans demand
1 (wave 4) / 2 (wave 5); living veterans at end 0 on 7/8 seeds, but
the log proves dead killers exist on 4 of those 7. Mechanism to test,
in order:
1. Run the ALREADY-EXISTING default-OFF instrument in standing.js
   (`VETSHAPE=1`: living-OR-DEAD killers count toward veterans) as a
   policy-side probe on the stuck seeds — it changes no defaults and
   answers whether the demand shape (living-only) is the binding
   constraint before anyone proposes moving the demand numbers.
2. Do NOT move readyDemand numbers on this evidence: the
   NEVER-KILLED seeds have no kill for any demand shape to count,
   and the KILLED-DEAD-KILLER seeds' problem is survivorship/shape,
   not the number 1.
3. The NEVER-KILLED seeds (73674/73675/73677) need a separate arm on
   wave-3 encounter/kill opportunity — a different lever from the
   survivorship probe, and the two must not be conflated into one
   "veterans" fix.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (G1/G2/G3/G4
all PASS, classifications on 8/8 seeds, baseline-armed agreement on
every aggregate and every classification), and the THING measured is
now DECOMPOSED one level deeper than standing99: the standing-99
veterans lock is NEVER-KILLED on 3/4 focus seeds and
KILLED-DEAD-KILLER (same-day kill + arena death) on the fourth —
plus the same split across the whole band (3 never-killed, 4
killed-dead, 1 killed-living). Wave 5 remains 0/8, the full seat
remains unreached, and the standing directive stands — the wall now
has two named keys (encounter opportunity for the never-killed,
killer survivorship / demand shape for the killed-dead), and the
next arms are specified above. No default flips; no src/js changes;
the recorder is a new default-OFF policy instrument.
