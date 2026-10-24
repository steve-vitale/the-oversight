# sim-standing99-diag-a — decompose the standing-99 pin and the wave-5 unlock block (axis scale-onramp)

Run: fleshout-20261024T2215Z. Worktree: `~/workspace/worktrees/sim-standing99-diag-a`
(branch sim-standing99-diag-a). Axis: scale-onramp (standing directive — still
stands: wins come only through default-OFF instruments and the lesser seat,
wave 5 still 0).

## Canon read first

- docs/CANON.md, docs/TABLE.md, docs/MONSTER-WAVES.md (wave 4: Mirror Draft,
  standing >= 100; wave 5 gate: standing >= 200 AND wave 4 faced; combat
  readiness gates the standing unlock, design call #4 2026-10-16), and
  docs/MEASUREMENT.md §§9-12, 14-15 (pilot gate, death-aware horizons,
  pre-registration, metric binding, balanced panels).
- Code authority for the mechanism under test: src/js/standing.js —
  `villageStanding()` (war = wave-3+ ledger points x 25; diplomacy = seasoned
  regional+ links x 34; plenty = major feasts x 20), `villageStandingTotal()`
  (the GATED number: plenty cap at 100 toward t5; combat-readiness deferral
  holding the total at t4-1 = 99 / t5-1 = 199; monotonic peak ratchet),
  `waveUnlockReady(w)` / `waveCombatReadiness(w)` (four bars: armored, armed,
  tricks, veterans). Demands (sim starting points, not canon; recalibrated
  2026-10-18): wave 4 = armored 3 @P>=10, armed 5, tricks 3, veterans 1;
  wave 5 = armored 4 @P>=15, armed 6, tricks 3, veterans 2.
- Prior run: evidence/2026-10-24/sim-fullseat-diag-a.md (seeds 73641-73648,
  tableseat-nowait substrate): standing max 172, FOUR seeds pin at exactly 99
  (73641, 73643, 73645, 73648 — one point below t4=100), t5=200, hold kind
  reported `below-bar` everywhere, wave-5 fights 0/8, wave-4 cleared 2/8.

## The starting suspicion (to be proven from trajectories, not code reading alone)

The prior run's `below-bar` label cannot be the whole story. Its own corpus
already shows the gated total BELOW the raw sum on pinned seeds (73641: raw
102, gated 99; 73648: raw 182, gated 99). Per standing.js, `villageStandingTotal()`
itself clamps the gated total to t4-1 = 99 while the wave-4 readiness bar is
unmet (defer4 hold) — so "99" may be a HOLD, not a sum that stopped. The
prior recorder's hold inference only checked cap/defer5, never defer4, which
is exactly why it reported `below-bar` on seeds whose gated total was being
held at 99. This arm tests that hypothesis with daily trajectories: raw vs
gated, component values at the pin, and the rd4 bars over time.

## Composition choice (decided before sweeping, documented per brief)

fullseat-diag.js does NOT compose for this question, so it is NOT reused here
— stated explicitly rather than silently skipped:
- It stores NO trajectory (only end/max snapshots), so it cannot answer
  "when did the pin start, what kept growing, which component stalled".
- It records NO wave-4 readiness bars (only rd5 short list), so it cannot
  answer (c) for wave 4 — the bar that actually binds at 99.
- Its hold-kind inference omits defer4, the very mechanism under test, and
  therefore mislabels a defer4 hold as `below-bar` (proven on the prior
  corpus: raw 102/182 vs gated 99, labelled `below-bar`).
Wrapping it would add a side-effecting `villageStandingTotal()` call per day
without answering (a)-(c). The new recorder below reproduces its standing
definitions (t4/t5, capped total, distT4/distT5) from PURE reads, and the
post-run validation call (after runDays, trajectory-safe) checks the
computed gated total against the engine's gated total on every armed seed.
No src/js changes, no default flips, default-OFF instrument only
(`STANDING99=1` gate; unset delegates byte-identically).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait leg.
- Baseline: tableseat-nowait, `STANDING99` unset. Own baseline replication
  (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with scripts/policies/standing99-diag.js
  (`STANDING99=1`). The recorder is PURE-READ: it never calls
  `villageStandingTotal()` during a run (that function releases peaks and
  emits hold beats — side effects); it computes the gated total from pure
  reads (`villageStanding()`, `waveUnlockReady(4/5)`, `state._standingPeakWave`)
  with the standing.js formula, and validates against the engine's gated
  total only AFTER runDays. It writes nothing to game state and draws no RNG.
- Seeds (pilot): 73671-73678. Freshness verified at run start: 0 hits in
  evidence/2026-10-24/*.md and 0 filenames matching s73671-s73678 anywhere
  under evidence/2026-10-24 (including all perseed-* dirs). NOTE on the
  suggested band: 73661-73668 was REJECTED, not used — the value 73668
  appears inside two unrelated pantrystarve corpus files (a numeric value,
  not a seed filename), so the next fully-clean band 73671-73678 was chosen
  instead to leave zero ambiguity. 73641-73648 and 73601-73608 NOT reused.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary (DIAG-GO, ALL must hold):
  1. 8/8 armed configs produce a standing trajectory with pin decomposition
     (first pin day, days pinned, component values at pin, which component
     stalled — stall = last day each component increased, and its delta from
     first-pin day to end);
  2. recorder neutrality G2: baseline vs armed identical on days/gameDays/ts
     counters/starvation on all 8 seeds (a daily recorder that leaks
     anywhere is NO-GO);
  3. det-gate G1: with the recorder unset, wrapped policy == unwrapped
     policy on one seed;
  4. corpus integrity: 16/16 rows; every armed row carries the full daily
     trajectory + end/max snapshots; every baseline row carries a post-run
     pure-read end snapshot (baselines cannot carry a trajectory without
     the recorder — that would make them armed — so the trajectory clause
     applies to the 8 armed rows, stated here before sweeping).
- Cost bar (diagnostic, reported even for a diag): starvation totals,
  median days, baseline vs armed.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the
  corpus; if it throws (known 1955Z/2115Z failure on per-seed rows), record
  exactly why + sweep-compare tables as the §15 comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a pinned
  seed — judge meaning/coherence/consequences, never just counts: does the
  game ever TELL the village it is one point short, or does it stall silently?

## Instrument

- `scripts/policies/standing99-diag.js` (new recorder, `STANDING99=1` gate).
- `scripts/test-standing99-diag-sweep.js` (sweep + --detgate + --sense modes),
  modeled on `scripts/test-fullseat-diag-sweep.js` (loadGame/setupGame/runDays,
  per-config incremental corpus writes via `scripts/sim-postunlock2-b-writer.js`).
- `scripts/test-standing99-diag.js` (proof test: gated-formula cases, pin
  analysis on synthetic trajectories, recorder purity on a mock Game).
- Corpus: `evidence/2026-10-24/perseed-standing99-diag-a/` (16 rows + summary.json).

## RESULTS — DIAG-GO (pilot 8+8, seeds 73671–73678, horizon 180d, death-aware)

Sweep: `node scripts/test-standing99-diag-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-standing99-diag-a/` (16/16 rows +
summary.json, per-config incremental writes via the chunked writer subprocess).
G1 det-gate: PASS (seed 73671, STANDING99 unset: baseline 93/93 days ==
wrapped 93/93 days, ts counters identical, no `_standing99diag` surface).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
261 = 261 with the same counts in every cause).
G3 corpus integrity: PASS (16/16 rows, all days > 0, every armed row
carries a full daily trajectory + pin analysis + end snapshot, every
baseline row carries a post-run pure-read end snapshot; trajectory lengths
92–180 points, 0 recorder errors on every armed row, end snapshot matches
the last trajectory point on 8/8 armed rows).
Engine-gated validation: PASS (16/16 rows: the recorder's computed gated
total equals the engine's `villageStandingTotal()` at run end — the pure-read
formula reproduces the engine exactly, including the floor cases).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ standing99-diag) |
|---|---|---|
| n | 8 | 8 |
| won | 4 | 4 |
| median days / median gameDays | 150 / 150 | 150 / 150 |
| max days | 180 | 180 |
| national ever / final | 8 / 7 | 8 / 7 |
| table invited ever (tableWaiting) | 5 | 5 |
| table entered (tableDone) | 4 | 4 |
| wave 4 / wave 5 reach | 5 / 0 | 5 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 3 | 3 |
| seat attempts / taken / failed | 4 / 4 / 0 | 4 / 4 / 0 |
| preview seen / not-ready | 17 / 7 | 17 / 7 |
| table answers | 20 | 20 |
| death total | 261 | 261 (identical breakdown) |

Baseline and armed agree on EVERY aggregate — the recorder is provably
neutral. Death causes (identical both arms): villager combat 106 +
villager-vs-villager combat 71 + player arena 38 = 215/261 (82%) combat;
starvation 3 (73672: 1, 73675: 1, 73678: 1); expedition 16, monster 11,
rest small.

### The answer to (b): 99 is a HOLD, not a cap, not a decay equilibrium

Proven from trajectories, not code reading alone:

- On all 7 pinned seeds the gated total sits at exactly 99 while the raw
  sum is ABOVE 100 (102–182 at the pin). A sum that "just stops" cannot sit
  below its own components; a clamp can. The clamp is the defer4 hold in
  `villageStandingTotal()`: raw >= 100 with the wave-4 readiness bar unmet
  pins the gated number at t4-1 = 99.
- Growth continues UNDER the pin. 73671: raw 162 at pin day 63 → 292 at
  end; war 0 → 50, plenty 60 → 140, all while gated reads 99. 73673 and
  73678: pinned 35 and 25 days, then the hold releases the day a living
  veteran appears (rd4 ready day 105 / day 93) and gated jumps to 127 / 147
  — the pin was never a ceiling on the village, only on the number the
  unlock gate reads.
- It is NOT the plenty cap: the cap only bites at t5 (plenty counts at
  most 100 toward 200). On pinned seeds capped == raw (plenty <= 100), so
  no cap is active; where plenty exceeds 100 (73671: raw 292, capped 252)
  the binding hold at end is defer5, not cap.
- It is NOT a decay equilibrium: on the stuck seeds (73674/73675) every
  component is FLAT from the pin day to the end (war 0, diplomacy 102,
  plenty 0 — zero movement for 58 / 92 days), not decaying. Nothing arrives
  to decay. The village is not shrinking; it is standing still in exactly
  the three components the gate reads.

### Per-seed pin table (armed arm; baseline identical on every trajectory metric)

| seed | days | end | won | wave | pin | at pin war/dipl/plenty/raw | pin rd4 short | end gated/raw/hold | max capped (t5 dist) |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | 93 | village-lost | 0 | 4 | day 63, 2d | 0/102/60/162 | veterans | 199/292/defer5 | 252 (0) |
| 73672 | 106 | over-other | 1 | 4 | none | — (never held) | — | 199/262/defer5 | 262 (0) |
| 73673 | 134 | over-other | 1 | 4 | day 70, 35d | 0/102/0/102 | veterans | 172/172/none | 172 (28) |
| 73674 | 180 | survived | 0 | 2 | day 123, 58d | 0/102/0/102 | veterans | 99/102/defer4 | 102 (98) |
| 73675 | 180 | survived | 0 | 3 | day 89, 92d | 0/102/0/102 | veterans | 99/102/defer4 | 102 (98) |
| 73676 | 174 | village-lost | 0 | 4 | day 84, 32d | 0/102/0/102 | veterans | 100/65/floor | 122 (78) |
| 73677 | 98 | over-other | 1 | 3 | day 63, 36d | 0/102/20/122 | armor+veterans | 99/122/defer4 | 122 (78) |
| 73678 | 150 | over-other | 1 | 4 | day 68, 25d | 0/102/20/122 | veterans | 172/172/none | 172 (28) |

### The answer to (a): what the components are at the pin, and which one stalled

At the pin, EVERY pinned seed reads the same shape: war 0, diplomacy 102,
plenty 0–60. Diplomacy 102 = exactly 3 seasoned regional+ links x 34 — the
village has three links and never gains a fourth on any pinned seed
(diplomacy delta pin-to-end is 0 on 6 of 7 pinned seeds; the exception,
73676, LOSES all 102 when the polity collapses). War is 0 at the pin on all
7 pinned seeds: no wave-3+ ledger kill has landed yet. Plenty is 0 on four
pinned seeds, 20–60 on three.

But the component that STOPS the release is not the component that stopped
growing — it is the readiness bar, and on all 7 pinned seeds the short list
at the pin is `veterans` alone (73677 also short armor on pin day, but armor
clears later while veterans never does). Armor, weapons, and tricks all
clear on the stuck seeds (73674 end: armored 4/3, armed 9/5, tricks 17/3,
veterans 0/1; 73675 end: 7/3, 8/5, 26/3, 0/1). The ONLY bar that never clears
on a stuck seed is veterans: a LIVING roster member with a wave-3+ kill.

Stall detail per seed (last day each component increased; pin-to-end delta):

| seed | war lastInc (delta) | diplomacy lastInc (delta) | plenty lastInc (delta) | max living veterans (w4) |
|---|---|---|---|---|
| 73671 | day 79 (+50) | day 63 (0) | day 86 (+80) | 2 (fleeting; 0 at end) |
| 73672 | day 103 (n/a, no pin) | day 89 (n/a) | day 78 (n/a) | 1 (fleeting; 0 at end) |
| 73673 | day 113 (+50) | day 70 (0) | day 133 (+20) | 1 (fleeting; 0 at end) |
| 73674 | day 2 (0) | day 123 (0) | day 2 (0) | 0 — never, all run |
| 73675 | day 2 (0) | day 89 (0) | day 2 (0) | 0 — never, all run |
| 73676 | day 116 (+25) | day 84 (−102) | day 116 (+40) | 0 — never, at any daily sample |
| 73677 | day 2 (0) | day 63 (0) | day 39 (0) | 0 — never, all run |
| 73678 | day 132 (+50) | day 68 (0) | day 60 (0) | 2 (1 alive at end) |

Ranked pin mechanism (what holds 99, in order):
**1. veterans 0/1 — the binding bar on 7/7 pinned seeds (and the only bar
short at the pin on 6/7). 2. diplomacy saturated at 3 links (102) — the
sum cannot climb past ~102–122 without war or feasts, so the pin LOOKS like
a sum. 3. war 0 at the pin on 7/7 — no wave-3+ kill has landed when the
village reaches 3 links.** Armor/weapons/tricks never bind at the pin once
the early days pass.

The veterans bar is fragile in a way the other bars are not: it counts only
LIVING killers, so it un-clears when fighters die. On the releasing seeds
(73671/73673/73678) veterans flickers: 27 / 13 / 58 days rd4-ready, but 0
living veterans at end on 73671 and 73673 (their fighters died after opening
the door — the peak ratchet, not the veteran, is what keeps wave 4 open).
73678 is the only seed ending with a living veteran (1/1).

### The answer to (c): wave-4 and wave-5 readiness bars at end and at max

Wave-4 bars (demand armored 3 @P>=10, armed 5, tricks 3, veterans 1):

| seed | rd4 at end (short) | rd4 at max-raw day | rd4 ready days | first rd4-ready day |
|---|---|---|---|---|
| 73671 | 0/2/17/0 (armor, weapons, veterans) | ready (day 86) | 27 | day 65 |
| 73672 | 4/6/20/0 (veterans) | ready (day 103) | 20 | day 63 |
| 73673 | 7/7/30/0 (veterans) | not ready, veterans 0 (day 133) | 13 | day 105 |
| 73674 | 4/9/17/0 (veterans) | — (max = pin day) | 0 | never |
| 73675 | 7/8/26/0 (veterans) | — (max = pin day) | 0 | never |
| 73676 | 0/1/19/0 (armor, weapons, veterans) | not ready (day 108) | 0 | never (at daily samples) |
| 73677 | 4/8/22/0 (veterans) | — (max = pin day) | 0 | never |
| 73678 | 7/8/19/1 (ready) | ready (day 132) | 58 | day 93 |

Wave-5 bars (demand armored 4 @P>=15, armed 6, tricks 3, veterans 2):
**ready on 0 days on all 8 seeds.** Best-ever rd5 short is `veterans` alone
(73671 day 8: 4/11/3/0; 73672 day 10: 4/11/3/0) — armor, weapons, and tricks
all clear at the best moment, but veterans for wave 5 (demand 2 living
wave-4 killers) is 0 on every day of every seed: max living wave-4 killers
is 0 everywhere (the traj's rd5 veterans column never exceeds 0). At end,
rd5 short is `veterans` alone on 73673/73678, and armor+veterans or
armor+weapons+veterans on the rest (fighters died by end).

### The answer to (d): does any seed approach t5 = 200, and what would have to move

Two seeds reach the t5 bar on the CAPPED total and are held at 199 by
defer5, not by the sum: 73671 (max capped 252, dist 0) and 73672 (max capped
262, dist 0). Both end gated 199 with hold defer5 — the sum is there, the
readiness is not (veterans 0/2 for wave 5). The other six seeds never get
close: max capped 172 (73673/73678, dist 28), 122 (73676/73677, dist 78),
102 (73674/73675, dist 98).

What would have to move, in order:
1. **A living wave-3 killer (veterans 0 → 1)** — releases the 99 pin and
   opens wave 4. This is the whole of the standing-99 problem.
2. **Wave-4 fights converting to war + capped total** — +28 on the 172-seeds,
   +78 on the 122-seeds, +98 on the 102-seeds — to bring capped to 200.
3. **TWO living wave-4 killers (veterans 0 → 2 for wave 5)** — releases the
   199 pin and opens wave 5. Step 3 has never happened on any day of any
   seed in either this run or the prior run: wave-5 fights are 0/8 here,
   0/8 there, and rd5 has never been ready.
4. Note the trap in step 1→2: winning through the lesser seat ENDS the run
   (73672/73673/73678 all won lesser at 106/134/150 days) before wave bars
   fill — the same truncation the prior run found.

### The 73676 caveat (daily sampling can miss an intraday release — documented, not hidden)

73676 is the one seed whose daily samples never show rd4 ready, yet whose
peak ratchet tripped to 4. Between the day-115 and day-116 samples: war
0 → 25 (a wave-3+ kill landed), diplomacy 102 → 0 (all three seasoned links
lost the same day), plenty 20 → 40, and peak 0 → 4 with gated floored at 100
thereafter (end raw 65, gated 100, hold `floor`). The peak's ONLY writer is
the release branch of `villageStandingTotal()`, which requires gated >= 100
at call time — so the engine must have seen a ready moment intraday (a
living veteran, raw still >= 100 before the link loss) that died or broke
before the end-of-day sample. The daily trajectory therefore UNDERSTATES
fleeting readiness: a veteran can open the door and die the same day, and
only the ratchet remembers. This does not weaken the pin finding (the
validation still matches at end, and the pin days themselves are fully
sampled); it means "maxVet4 = 0 at daily samples" on stuck seeds is
consistent with, but does not prove, "no wave-3 kill ever happened" —
kills with same-day killer deaths would be invisible here. The next
instrument should record the waveKillLog directly (see next arm).

### Wave-3 ladder note (why 73674 never left wave 2)

Wave 3 unlocks on day >= 25 AND wave-2 ledger points >= 5 — NOT on standing
(`unlockedWave()` in game.js). 73674 never reaches wave-2 points 5 all run,
so it stays wave 2 despite national rank and raw 102; 73676 reaches wave 3
at day 100 WHILE pinned at 99. Pinned villages CAN reach wave-3 monsters —
the veterans bar is not blocked by wave-3 access. Whether they kill one and
the killer survives is the open question (see the kill-log gap above).

### Village assessment (plain words)

Seven of eight villages climb to exactly three regional links — 102 points
of diplomacy — and then the number on the door freezes at 99. It is not
that the village stops living: pantries fill, feasts happen, people trade
and linger by the fire. It is that the door to the next draft does not open
on bread and handshakes. It opens on a fighter who has killed one of the
new monsters and lived to tell it — and on four of these villages, no such
fighter ever exists at the end of any day. Two villages do produce one, the
door swings open, and they climb to 172 or all the way to the wave-5 door
(199) — where a second, harder version of the same lock waits: two living
wave-4 killers, which nobody has. The four villages that win do it through
the lesser seat, walking out before the fighting that would open the full
seat ever happens. The village that comes closest to breaking through and
then collapses (73676) tells the grimmest version: it finally bloodied a
fighter and lost its whole alliance network on the same day, and the door
it opened stayed open only because the System remembers, not because
anyone lived to hold it.

### Sense-testing read (NON-MEASURED replay, seed 73675, armed, narration on)

File: `evidence/2026-10-24/sim-standing99-diag-a-sense.txt` (240-line ring,
days 178–181; outcome class matches the measured run exactly — survived
180/181, max wave 3, no table — narration did not diverge the shape).
Judgment — meaning, coherence, consequences:
- The stall is NOT silent. The System says aloud, in the broadcast voice:
  `📺 SYSTEM: "📡 The next act is still waiting — blood your fighters
  (0 of 1 veterans)."` — the exact short bar, with the exact count. The
  hold beat fires as designed (standing.js promises the hold is named).
- But it is only HALF-told. Nothing in the ring ever says "you are one
  point short", names the number 99, or explains that diplomacy + feasts
  cannot move the number while the bar is unmet. A player hears "blood
  your fighters" with no translation into what to DO: which monsters, what
  counts as a veteran, whether a dead killer counted. The village hears a
  slogan, not an instruction.
- And the stall is livable, which undercuts urgency: the same days show
  full pantries ("Full shelves, full bellies"), feasts, a fan club growing,
  villagers lingering by the fire — while a raid carries off 1200 kcal and
  a neighbor begs for 1995 kcal. The village has everything except the
  one thing the gate wants, and nothing in the fiction treats that as a
  crisis. The pin feels like weather, not a wall — which is why villages
  can sit at 99 for 92 days and call it a life.
- One coherence note: the ring shows routine chatter and begging beats
  continuing normally around the hold message, with no villager ever
  reacting to the System's "next act is waiting" line. The System speaks;
  nobody answers.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before <summary.json>
--after <summary.json> --out /tmp/panel-standing99-attempt`. Result: the
compare threw the SAME error as 1955Z/2115Z — `TypeError: Cannot read
properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels` — and wrote no output.
The panel requires panel-driver output (panel.json.gz with observer/contract
digests and panel records), not per-seed sweep rows. The sweep-compare
tables above are the before/after comparison for this run, on identical
seeds, judged against the pre-registered bar. (Panel-contract work belongs
to the live panel-contract-rulings lane — not touched.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. G2 as
  specified here (ALL seeds identical, not just pre-national) is the right
  strength for a daily recorder: it fired 92–180 times per run and leaked
  nowhere — and the identical death-cause breakdown (261 = 261) corroborates
  it independently of the ts counters.
- "Median days" as a cost bar is uninformative for a pure-read arm (150 vs
  150 by construction); the informative neutrality proof is the per-seed
  identity (G2) plus the identical death breakdown. Future diag arms should
  judge on G2 identity, not on median days.
- One metric gap for the NEXT diag arm, found by this run: the daily
  trajectory can miss intraday ready moments (73676). A daily recorder
  understates fleeting veterans. The next instrument must record the
  waveKillLog (kills + killer survival) directly, or sample at higher
  frequency around kill days — otherwise "no veteran ever" stays an
  end-of-day statement, not an all-day one.
- "Days pinned" as recorded counts end-of-day pinned samples, not
  intraday holds; a seed pinned 2 days (73671) may have been held intraday
  longer. The pin-day and release-day figures are sample-day figures and
  are reported as such.

### Findings outside this arm (reported, NOT touched — for the coordinator)

- The prior run's `below-bar` hold label was WRONG for the defer4 case:
  fullseat-diag.js omits defer4 from its hold inference and labels a
  defer4-held total (raw 102/182, gated 99) as `below-bar`. Any past
  evidence that cites fullseat holdKind for wave-4 pins should be re-read
  with this correction. (This arm does not edit fullseat-diag.js — that is
  a fix for the owning lane to judge, reported here, not silently made.)
- Winners truncate the full-seat window (same note as the prior run, now on
  fresh seeds: 73672/73673/73678 won lesser before wave bars filled).
- The hold message names the bar but not the number or the deed: a
  player-facing gap, not a measurement gap (see sense read).

### Next arm (precise, documented — no game-code change made here)

**vetshape/kill-log diag on the stuck seeds (73674/73675/73677, plus 73676
as the intraday case).** Numbers: veterans demand 1 (wave 4) / 2 (wave 5);
living veterans at daily samples 0 on 4/8 seeds all run, 0 at end on 6/8
seeds; rd5 ready 0 days on 8/8 seeds. Mechanism to test, in order:
1. Record `state.waveKillLog` per run (kills, killer vid, wave, killer
   alive/dead at end): did stuck seeds ever KILL a wave-3+ monster, or
   never kill one? That single distinction decides the lever — no kills
   means the lever is wave-3 encounter/kill opportunity; kills-with-dead-
   killers means the lever is killer survivorship (armor, retreat, rescue),
   not demand numbers.
2. If kills-with-dead-killers is the pattern, test the ALREADY-EXISTING
   default-OFF instrument in standing.js (`VETSHAPE=1`: living-OR-DEAD
   killers count toward veterans) as a policy-side probe on the stuck
   seeds — it changes no defaults and answers whether the demand shape
   (living-only) is the binding constraint before anyone proposes moving
   the demand numbers.
3. Do NOT move readyDemand numbers on this evidence: armor/armed/tricks
   already clear on stuck seeds, so lowering them changes nothing; only
   the veterans definition or killer survivorship can move the pin.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (8/8 armed configs
with full trajectories + pin decompositions, ranked pin mechanism, G1/G2/G3
all PASS, engine-gated validation 16/16), and the THING measured is now
DECOMPOSED, not just observed: the standing-99 pin is the defer4 hold,
bound solely by living veterans (0/1) on every pinned seed; the wave-5
block is the same mechanism one rung up (defer5 at 199, veterans 0/2, ready
0 days on 8/8 seeds). Wave 5 remains 0/8, full seat remains unreached, and
the standing directive stands — the wall now has a named lock and a named
key (a living veteran), and the next arm is specified above. No default
flips; no src/js changes; the recorder is a new default-OFF policy instrument.


