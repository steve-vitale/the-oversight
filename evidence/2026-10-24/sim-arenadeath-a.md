# sim-arenadeath-a — killer survivorship / arena death diag (axis scale-onramp)

Run: fleshout-20261024T2315Z arm sim-arenadeath-a (sibling arm sim-encounter-a
works the NEVER-KILLED group in parallel — not touched here, not duplicated).
Worktree: `~/workspace/worktrees/sim-arenadeath-a` (branch sim-arenadeath-a).
Axis: scale-onramp (standing directive — still stands: wins only via
default-OFF instruments, lesser seat only, wave 5 still 0).

## Canon read first

- docs/CANON.md, docs/CONTESTS.md (contests played not RNG; mandatory
  teleport, sometimes a choice; shows don't kill), docs/MONSTER-WAVES.md
  (wave 4/5 readiness demands, via sim-vetkill-a), docs/MEASUREMENT.md
  §§9-12, 14-15.
- Prior run: evidence/2026-10-24/sim-vetkill-a.md (seeds 73671-73678,
  tableseat-nowait substrate). Its verdict: 3 NEVER-KILLED, 4
  KILLED-DEAD-KILLER, 1 KILLED-LIVING-KILLER, wave-4+ kills 0/8. This arm
  is that run's named next blank (2): killer survivorship / arena death,
  on the KILLED-DEAD-KILLER seeds only. The NEVER-KILLED group belongs
  to sim-encounter-a.
- NOTE on the brief's TABLE.md pointer: as in vetkill-a, the
  readiness gate lives in src/js/standing.js + docs/MONSTER-WAVES.md,
  not in a combat-readiness section of docs/TABLE.md.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait
  leg. Seeds: 73671-73678 — the SAME band as standing99/vetkill-a,
  reuse intentional: this is a re-measurement of those seeds with a new
  recorder, not a fresh band.
- Baseline: tableseat-nowait, `ARENADEATH` unset. Own baseline
  replication (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with scripts/policies/arenadeath-diag.js
  (`ARENADEATH=1`). The recorder is PURE-READ: it never calls
  `villageStandingTotal()` during a run; it copies `state.waveKillLog`,
  the FULL `state.village.fallen` array (all entries per vid — this
  fixes backlog item #949, the vetkill first-wins map), and the
  contest/arena memory surfaces listed under Instrument. It writes
  nothing to game state and draws no RNG; read errors are counted,
  never silently swallowed.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- DIAG-GO requires ALL of:
  1. G1 det-gate: recorder unset == unwrapped tableseat-nowait on one
     seed (days/gameDays/ts counters identical, no `_arenadeathdiag`
     surface);
  2. G2 neutrality: baseline vs recorder identical on days/gameDays/ts
     counters/starvation on all 8 seeds;
  3. G3 corpus integrity: 16/16 rows, every armed row carrying the
     per-killer arena table + full fallen lists, every baseline row
     carrying a post-run pure-read kill-log snapshot;
  4. Classification completeness: EACH killer on KILLED-DEAD seeds
     73671, 73672, 73673, 73676 classified ARENA-MANDATORY /
     ARENA-VOLUNTARY / NON-ARENA / UNRECORDED-DISTINCTION with
     evidence quoted. A killer that cannot be classified is
     UNCLASSIFIED with reason and fails G4 for that killer — do not
     guess.
- The classification verdict itself is a FINDING, not a pass/fail.
- Do NOT move readyDemand numbers, do NOT flip VETSHAPE or any default,
  do NOT change arena/contest rules or any src/js default. Diag only.
- Cost bar (diagnostic, reported): starvation totals and median days,
  baseline vs recorder.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare` on
  the corpus; if it throws (known failure on per-seed rows), record
  exactly why and use sweep-compare tables as the comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a
  killer-death seed (73676 preferred — same-day kill + arena death —
  else 73672) — judge meaning, coherence, relevance, consequences,
  never just counts: does the game ever mourn a bloodied fighter, warn
  that the arena eats veterans, or let the village react to losing its
  only veteran?

## Code findings (investigated from src, not invented — these shape the classifier)

- Fallen cause `the arena` has exactly ONE producer in the codebase:
  `playerDeath('the arena')` (ledger.js playerDeath pushes fallen with
  the passed cause; the arena-fight loss path is game.js tbEnd
  `playerDeath('the arena')` when `state.arenaContest` is set, plus
  the legacy ledger.js `arenaDeath`). It is therefore a SCHOLAR death:
  the killer was the current scholar (mantle bearer) when they died
  in an arena fight, and the mantle passed on. A villager contest
  death can NEVER carry fallen cause `the arena`.
- Villager contest deaths split two ways, and only one leaves a fallen
  entry: (a) contest-engine hurt path — `contestResolveVillager` /
  `contestResolveGroup` blood resolutions call
  `hurtVillager(pid, taken, 'contest')`; lethal → hurtVillager pushes
  fallen cause `contest`. (b) `_contestDie` / `_contestResolveOthers`
  → `_cxKillContestant` → roster removal with NO fallen push at all
  (removeVillager pushes no fallen; the membership/comms wrappers add
  no fallen entry). A villager who dies on camera via path (b) leaves
  roster removal + gossip (`contest_died`) + `village.lastContest.died`
  + `state.contestDeathsById`, but NO fallen entry — so "no fallen
  entry" does NOT mean "did not die in a contest".
- Mandatory vs voluntary, as the code actually structures it:
  - Casting (`fireContest`) takes whoever it takes — no consent at
    casting. Villagers never get a choice screen: watch-mode and
    multi-take co-taken villagers resolve through the engine with no
    participate/refuse step. Villager contest participation is
    MANDATORY by construction.
  - The scholar DOES get a choice screen sometimes:
    `contestInterruption` gives a choice when `contest.givesChoice`
    or a 30% roll; otherwise "you're grabbed. No choice." Even with a
    choice, refusal is a sequence and co-taken others still fight.
    So scholar arena participation is MIXED (choice ~30%+ vs grab
    ~70%) — but the engine records NEITHER the givesChoice flag NOR
    the choice taken for any resolved contest: `state.activeContest`
    is transient (cleared at every end path), and no per-contest
    choice log exists. A scholar arena death therefore CANNOT be
    split mandatory/voluntary from post-run state: that distinction
    is UNRECORDED, and that missing distinction IS a finding.
  - Sim-bot note (scripts/sim-harness.js `driveContests`): the bot
    picks choice 0 until the contest clears, and choice 0 on the
    participate/refuse screen is Participate. So in SIMS, a scholar
    offered a choice always participates; a grabbed scholar never
    chose. The grab-vs-choice split per contest is still unrecorded,
    so sim runs cannot retroactively split scholar arena deaths
    either — the bot's choice-0 behavior is a property of the
    harness, not of the recorded run.
- Arena-history surfaces that DO persist at post-run (all copied by
  the recorder, none invented): `state.village.fallen` (full array);
  `state.village._contestPullDays` (bounded 24 per vid: contest-cast
  days); `state.village._showPullDays` (show-cast days); `village.lastContest`
  ({day, name, ids, died[]} — LAST contest only, overwritten per
  contest); village gossip `contest_died`/`contest_won`/`contest_survived`
  entries (dims {who, contest}, day); `state.contestDeathsById`
  (aggregate counts per contest id, no per-vid); `progState().deathReel`
  (scholar arena deaths, legacy path); `lineage()` (scholar deaths
  with cause + day). No per-villager arena-participation history
  (events entered, opponents, outcomes) exists in the engine — the
  recorder assembles the closest available approximation from the
  surfaces above plus daily `lastContest` snapshots, and says so.
- The 73672 ethan_hunt anomaly, as framed before this arm's data:
  vetkill's first-wins fallen map says ethan died day 56 (`monster`)
  but his wave-3 kill is dated day 103 via `player`. TB kill
  attribution (game.js tbEnd: `_killerVid = this.villagerId`,
  `_killerVia = 'player'` unless a companion landed the blow) means a
  `player`-channel kill is by the CURRENT scholar. So either the
  full fallen list holds a second, later ethan entry that first-wins
  hid (anomaly RESOLVES), or it holds only the day-56 entry (anomaly
  PERSISTS: a kill attributed to a dead vid, or vid reuse across
  lives). This arm's full-list recorder settles it — see Results.

## Instrument

- `scripts/policies/arenadeath-diag.js` (new recorder, `ARENADEATH=1`
  gate; modeled on scripts/policies/vetkill-diag.js).
- `scripts/test-arenadeath-diag-sweep.js` (sweep + --detgate + --sense
  modes), modeled on `scripts/test-vetkill-diag-sweep.js`.
- `scripts/test-arenadeath-diag.js` (proof test: full-fallen-list
  handling incl. the ethan shape, classifier cases incl.
  UNRECORDED-DISTINCTION / ARENA-MANDATORY / NON-ARENA /
  UNCLASSIFIED, purity on a mock Game).
- Corpus: `evidence/2026-10-24/perseed-arenadeath-a/` (16 rows +
  summary.json).

## RESULTS — DIAG-GO (pilot 8+8, seeds 73671–73678, horizon 180d, death-aware)

Sweep: `node scripts/test-arenadeath-diag-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-arenadeath-a/` (16/16 rows +
summary.json, per-config incremental writes via the chunked writer
subprocess).
G1 det-gate: PASS (seed 73671, ARENADEATH unset: baseline 93/93 days ==
wrapped 93/93 days, ts counters identical `{"tsNationalDay":83}`, no
`_arenadeathdiag` surface).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
261 = 261 with the same counts in every cause, same as vetkill-a).
G3 corpus integrity: PASS (16/16 rows, all days > 0; every armed row
carries the per-killer arena table + full fallen lists + daily
lastContest snapshots, 0 recorder errors on every armed row; every
baseline row carries a post-run pure-read kill-log snapshot + full
fallen lists).
Classification completeness (G4): PASS — all 7 killers on KILLED-DEAD
seeds 73671/73672/73673/73676 classified, none UNCLASSIFIED. Baseline
and armed classifications agree on all 9 killers on all 8 seeds (the
post-run snapshot is recorder-independent, as it must be: the log and
the fallen list are engine state, not recorder state).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ arenadeath-diag) |
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
| wave-3+ killers total / dead / living | 9 / 8 / 1 | 9 / 8 / 1 |
| dead killers arena-dead (UNRECORDED-DISTINCTION) | 8 | 8 |

Baseline and armed agree on EVERY aggregate, and the wall numbers
replicate vetkill-a exactly (won 4, wave 4 reach 5, wave 5 reach 0) —
this is a re-measurement of the same seeds, and it reproduces them.
Death causes (identical both arms): villager combat 106 +
villager-vs-villager combat 71 + player arena 38 = 215/261 (82%)
combat; starvation 3; expedition 16, monster 11, contest 2 (1 villager
+ 1 player), rest small.

### The verdict: every dead killer died as the scholar in an arena fight — and the mandatory/voluntary split is unrecorded

| seed | killer | kills (first day, via) | alive? | fallen (FULL list) | lineage (scholar death) | days kill→arena death | class |
|---|---|---|---|---|---|---|---|
| 73671 | jorge_silva | 1 (d65, companion) | no | d92 `the arena` | d92 `the arena` | 27 | UNRECORDED-DISTINCTION |
| 73671 | gen_ffi6aqq | 1 (d79, player) | no | d86 `the arena` | d86 `the arena` | 7 | UNRECORDED-DISTINCTION |
| 73672 | gen_yg1x0kp | 3 (d63/77/78, player) | no | d82 `the arena` | d82 `the arena` | 19 | UNRECORDED-DISTINCTION |
| 73672 | ethan_hunt | 1 (d103, player) | no | d56 `monster` + d104 `the arena` | d104 `the arena` | 1 | UNRECORDED-DISTINCTION |
| 73673 | gen_6smm84l | 1 (d105, player) | no | d112 `the arena` | d112 `the arena` | 7 | UNRECORDED-DISTINCTION |
| 73673 | gen_vt9nswl | 1 (d113, player) | no | d118 `the arena` | d118 `the arena` | 5 | UNRECORDED-DISTINCTION |
| 73676 | nadia_khoury | 1 (d116, player) | no | d116 `the arena` | d116 `the arena` | 0 (same day) | UNRECORDED-DISTINCTION |
| 73678 | nadia_khoury | 1 (d93, companion) | YES | — | — | — | LIVING |
| 73678 | miguel_santos | 1 (d132, player) | no | d133 `the arena` | d133 `the arena` | 1 | UNRECORDED-DISTINCTION |

Three findings in this table, each stated as recorded, not inferred:
1. **ARENA-VOLUNTARY is empty and ARENA-MANDATORY is empty among
   measured killers — not because killers don't die in the arena, but
   because the engine cannot split them.** All 8 dead killers carry
   fallen `the arena` AND a matching lineage entry (they died as the
   scholar in an arena fight — the sole producer of that cause), and
   the grab-vs-participate split for those fights is unrecorded (no
   choice log; `activeContest` transient). Per the pre-registered
   classifier, that is UNRECORDED-DISTINCTION — the missing
   distinction IS the finding. ARENA-VOLUNTARY is structurally
   unemittable from post-run state (it would need an instrument
   wrapping `contestInterruption`/`contestChoose`, not a pure-read
   daily recorder — named as the next instrument below, not built
   here). ARENA-MANDATORY is emittable in principle (villager contest
   deaths via fallen `contest` or no-fallen camera deaths) — and the
   sense replay below actually produced one — but no measured band
   killer died that way.
2. **The arena does not hunt veterans; the mantle does.** 7 of the 8
   dead killers earned their kills as the scholar (`player` channel);
   the 8th (jorge_silva, companion kill d65) later held the mantle and
   died as scholar d92. Every dead killer's lineage entry matches
   their arena death day. The killer population IS the scholar
   population in this band — so "killers die in the arena" restates
   "scholars die in arena fights", with the veterans bar demanding a
   LIVING killer. The lever this points at is scholar arena
   survivorship (and the living-only demand shape), not a veteran-
   specific hazard.
3. **Killer lifespans after first blood are short, as vetkill-a found,
   now with lineage proof:** 27, 7, 19, 1, 7, 5, 0, 1 days from first
   kill to arena death. A veteran is a fleeting state in this band.

### (a) The ethan_hunt anomaly — RESOLVED for timing, with a new open question

Full fallen list for ethan_hunt (both arms identical): d56 `monster`
(monsterId `ad_break`) + d104 `the arena`. The daily scholar-vid
trajectory settles the rest: ethan_hunt held the mantle days 82–103
(scholar runs: gen_iw7d37i → gen_2awrsoi → gen_yg1x0kp → ethan_hunt
d82–103 → ruby_callaghan d104 → aroha_ngata), killed the wave-3 Ad
Break on day 103 as scholar, and died in the arena on day 104.
Vetkill-a's first-wins map hid the d104 entry, so its day-56 date was
the wrong death for survivorship timing. The survivorship timing is
now: kill d103 → arena death d104 (+1 day). Anomaly RESOLVED.
What is NOT resolved: the d56 `monster` entry itself. On day 56 the
scholar was gen_yg1x0kp, not ethan_hunt, and ethan did not hold the
mantle until day 82 — yet a fallen entry names him dead to a monster
26 days before his tenure, a monster he later killed. Candidates
(reported, not determined — this recorder cannot trace death paths):
a fallen push on a non-fatal path that did not remove him, or vid
reuse for a later joiner under the same canonical id. A death-path
trace arm for ethan_hunt on 73672 is the named follow-up; this arm's
verdicts do not depend on it (every killer's arena death day is
independently confirmed by its lineage entry).

### (b) Each killer's arena history — what the engine actually keeps

No per-villager arena-participation history (events entered,
opponents, outcomes) exists in the engine — that absence is itself
reported here. What the recorder assembles per killer:
- **Contest pulls** (`_contestPullDays`, bounded 24/vid): nadia 73676
  was taken 7 times before her kill (d41, 53, 72, 84, 88, 95, 99);
  gen_vt9nswl 5 times (d19, 31, 76, 87, 103); gen_yg1x0kp 3 times
  (d15, 29, 38); gen_ffi6aqq once (d23); jorge_silva, gen_6smm84l,
  ethan_hunt, miguel_santos none recorded (pull history is bounded
  and scholar-era takes record as `player`, not as the vid — see
  limitation below).
- **Daily lastContest timeline** (armed rows only): nadia 73676 as
  CO-TAKEN with the scholar — The Pit d41, The Blood Tithe d53, The
  Exchange d72, Calorie Run d84, Hardened The Pit d88, Hardened Duel
  d95 and d99 (all `died: []` — she survived all seven takes, then
  died as scholar on her kill day). gen_vt9nswl — The Exchange d19,
  Duel d31, Hide and Seek d76, Cooking With Teeth d87, Gauntlet d103.
  gen_yg1x0kp — The Pit d15, Duel d29, Pattern Hunger d38.
- **Opponent/outcome per event: NOT recorded.** lastContest holds
  only {day, name, ids, died[]} for the LAST contest; pull days hold
  only days; gossip holds only contest_died/won/survived + contest
  name. No opponent, no per-event outcome, survives to post-run.
  For killers, gossip yielded NOTHING (0 contest gossip entries for
  all 9 killers — scholar deaths gossip as deaths, not as contest
  outcomes, and gossip is pruned over a run).
- **HP/state at death: NOT recorded.** Fallen entries carry no HP;
  lineage carries no HP; no death-HP surface exists in the engine.
- **Limitation (stated, not hidden):** when a killer held the mantle,
  their takes record under id `player` in lastContest/pull days, not
  under their vid — so scholar-era takes are invisible in a
  per-vid timeline. The timelines above are co-taken takes only.
  A choice/event instrument (next lever below) would need to resolve
  `player` to the current scholar vid at take time.

### (c) Mandatory, voluntary, or mixed — for killers specifically

From code (see Code findings above), not from counts: villager
contest participation is MANDATORY (no choice screen ever exists for
non-scholars); scholar participation is MIXED (choice screen on
`givesChoice` or a 30% roll, else grabbed with no choice; refusal is
a sequence, co-taken others still fight). For the measured killers
— all of whom died as scholars — the applicable class is MIXED in
principle and UNRECORDED in fact: no measured killer can be split
mandatory/voluntary from state. In sims the bot always picks
Participate (choice 0) when offered one, but the grab-vs-choice
split per contest is still unrecorded, so even sim runs cannot
retroactively split scholar arena deaths. Any future claim of a
mandatory/voluntary split for a scholar arena death without a
choice-capturing instrument would be a guess.

### (d) Arena-death rate: killers vs villagers overall

Three denominators, all stated (do not conflate them):
- **Dead wave-3+ killers: 8/8 (100%) died in the arena** (all as
  scholars, fallen `the arena` + lineage). This is the headline, and
  it is a scholar-population effect (see verdict point 2), not a
  veteran-hunting effect.
- **All fallen persons: 41/63 (65%) carry an arena/contest fallen
  entry** (arena-distinct 39 + contest-distinct 2, summed across the
  8 independent runs; fallen entries total 64, distinct vids 63 —
  ethan_hunt has two entries). Per-seed arena-or-contest distinct:
  73671: 10/11, 73672: 6/9, 73673: 3/4, 73674: 1/3, 73675: 2/4,
  73676: 12/19, 73677: 2/5, 73678: 5/8.
- **All harness deaths: 38/261 (14.6%) are scholar arena deaths**
  (`player:the arena`); villager contest deaths are 1/261. The
  fallen denominator (63) is far smaller than the death denominator
  (261) because most death paths leave no fallen entry at all (the
  contest path-(b) finding above is one such path; the gap between
  261 deaths and 64 fallen entries is itself a measurement-surface
  finding for a future arm — fallen is NOT a census of deaths).
- Verdict on (d): the arena IS disproportionately lethal to killers
  (100% vs 65% fallen-based, vs 14.6% death-based) — but the
  mechanism is that killers are scholars and scholars die in arena
  fights, not that the arena selects veterans. A lever aimed at
  "veterans" without touching scholar arena survivorship would miss
  the mechanism.

### Wall numbers (this run, armed arm = baseline arm)

National ever 8/8, national-or-higher final 7/8, table invited 5/8,
table entered 4/8, wins 4/8 (all lesser seat — the full seat remains
unreached), wave 4 reach 5/8, wave 5 reach 0/8, max arc 4, median
survival 150 days, max 180 days. Death-cause shares: combat 82%
(215/261), starvation 3, expedition 16, monster 11, contest 2, rest
small. The standing directive stands: wins come only via default-OFF
instruments and the lesser seat; wave 5 still 0.

### What this means for the next lever (finding, not a change made here)

1. **Scholar arena survivorship is the KILLED-DEAD-KILLER lever, not
   veteran-hazard.** Every dead killer died as the scholar in an
   arena fight within 0–27 days of first blood. The named probes, in
   order: (i) the already-existing default-OFF VETSHAPE instrument
   (living-OR-DEAD killers count — vetkill-a's named probe, still
   unrun); (ii) a choice-capturing instrument wrapping
   `contestInterruption`/`contestChoose` that records, per resolved
   contest, givesChoice + choice taken + participant vids resolved
   against the scholar vid at take time — this is the ONLY way to
   split scholar arena deaths mandatory/voluntary, and to build a
   true per-villager arena history (events, opponents via the
   contest id, outcomes). It is an event hook, not a pure-read daily
   recorder, and must prove its own neutrality before any census
   use.
2. **Do NOT move readyDemand numbers on this evidence:** the problem
   is survivorship + the living-only demand shape, not the number 1
   (vetkill-a's point, confirmed here with lineage proof).
3. **The NEVER-KILLED seeds (73674/73675/73677) are untouched by
   this arm** (sibling sim-encounter-a's group) — no finding here
   changes their lever (wave-3 encounter/kill opportunity).

### Sense-testing read (NON-MEASURED replay, seed 73676, armed, narration on)

File: `evidence/2026-10-24/sim-arenadeath-a-sense.txt` (240-line ring,
days 153–156; outcome class DIFFERS from the measured run — narration
shifts trajectories, as expected: this replay ends over-other with
tableDone, vs the measured village-lost — so nothing here enters the
census, and its own post-run snapshot names a DIFFERENT killer:
mara_vasquez, ARENA-MANDATORY, the one live example of that class in
this arm's data — a villager contest death, not a scholar arena
death).
Judgment — meaning, coherence, relevance, consequences:
- The bar is named but the dead are not mourned, and the arena is
  never warned about. The System says aloud: `📺 SYSTEM: "📡 The
  fifth draft stays in the wings. It wants a village that can fight
  — armor the village (1 of 4 fighters armored); put weapons in
  hands (3 of 6 armed); blood your fighters (0 of 2 veterans)."`
  (and the war-path beat repeats 0 of 1 / 0 of 2 veterans). The
  village hears a headcount, not a history: nothing in the ring names
  a bloodied fighter who died, says the arena eats veterans, or lets
  anyone react to losing the only veteran. The one grief line in the
  ring — "They're burying their speaker — grain can wait a week;
  grief can't" — is about a speaker, not a fighter, and is not tied
  to any veteran, kill, or arena death.
- And the stall is livable, which undercuts urgency (same shape as
  vetkill-a's sense read): the same days show full pantries, garden
  work, teaching moments (Pablo showing Ayi the persimmon), food
  gifts. A player watching these four days would conclude the
  village is doing fine — because by every measure except the gate,
  it is — while the gate's own missing veterans go unmentioned as
  people.
- Coherence note: the replay's own ARENA-MANDATORY killer
  (mara_vasquez) never appears in the 240-line ring at all — her
  death, like the measured killers' deaths, leaves no trace in the
  fiction the player actually sees. The arena takes veterans; the
  village's visible life goes on as if it didn't.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-arenadeath-a/summary.json --after <same>
--out /tmp/panel-arenadeath-attempt`. Result: the compare threw the
SAME error as vetkill-a and earlier runs — `TypeError: Cannot read
properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels` — and wrote no
output. The panel requires panel-driver output (panel.json.gz with
observer/contract digests and panel records), not per-seed sweep
rows. The sweep-compare tables above are the before/after comparison
for this run, on identical seeds, judged against the pre-registered
bar. (Panel-contract work belongs to the live panel-contract-rulings
lane — not touched.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring.
  G2 as specified (ALL seeds identical on days/gameDays/ts/starvation)
  is the right strength for a daily recorder: it fired 93–180 times
  per run and leaked nowhere — and the identical death-cause
  breakdown (261 = 261) plus identical classifications on all 9
  killers corroborate it independently of the ts counters.
- "Median days" as a cost bar is uninformative for a pure-read arm
  (150 vs 150 by construction); the informative neutrality proof is
  the per-seed identity (G2) plus the identical classifications.
- One metric gap found by this run, for the NEXT instrument: the
  daily lastContest snapshot catches co-taken takes but NOT
  scholar-era takes (they record as `player`), and it catches no
  choice, opponent, or per-event outcome at all. A per-villager
  arena history cannot be built from daily pure reads — it needs
  the event hook named above.
- "Fallen" is NOT a death census: 64 fallen entries vs 261 harness
  deaths. Future arms must state their death denominator (fallen
  persons vs harness deaths) or their rates will not compare.

### Findings outside this arm (reported, NOT touched — for the coordinator)

- The 73672 ethan_hunt day-56 `monster` fallen entry (26 days before
  his scholar tenure, for a monster he later killed): either a
  fallen push on a non-fatal path or vid reuse for a later joiner —
  needs a death-path trace arm on 73672. This arm's verdicts do not
  depend on it.
- The fallen-vs-deaths gap (64 entries vs 261 deaths): most death
  paths leave no fallen entry; fallen-based rates must carry their
  denominator.
- The hold/war-path message names the veterans bar but not the dead:
  a player-facing gap, not a measurement gap (see sense read).
- The sense replay's own killer (mara_vasquez, ARENA-MANDATORY) is
  replay-only evidence that the ARENA-MANDATORY class is real and
  emittable — it is NOT census data and does not change the measured
  verdict (0 ARENA-MANDATORY among measured band killers).

### Next arm (precise, documented — no game-code change made here)

**Choice/event instrument + VETSHAPE probe, in this order.**
1. Build a choice-capturing instrument (event hook on
   `contestInterruption`/`contestChoose`, own neutrality proof) that
   records per resolved contest: givesChoice, choice taken,
   participant vids with `player` resolved to the scholar vid at take
   time, contest id, and outcome — the only instrument that can split
   scholar arena deaths mandatory/voluntary and build a true
   per-villager arena history. Run it on seeds 73671–73678 and
   re-classify the 8 UNRECORDED-DISTINCTION killers.
2. Run the ALREADY-EXISTING default-OFF VETSHAPE instrument
   (`VETSHAPE=1`: living-OR-DEAD killers count) as a policy-side probe
   on the KILLED-DEAD-KILLER seeds — it changes no defaults and
   answers whether the living-only demand shape is the binding
   constraint. Do NOT move readyDemand numbers.
3. Death-path trace for ethan_hunt on 73672 (the day-56 entry) and a
   fallen-vs-deaths census-gap note — both backlog items, neither
   blocking the VETSHAPE probe.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (G1/G2/G3/G4
all PASS, classifications on 9/9 killers, baseline-armed agreement on
every aggregate and every classification), and the THING measured is
now DECOMPOSED one level deeper than vetkill-a: the KILLED-DEAD-KILLER
group is not "the arena hunts veterans" but "scholars die in arena
fights within days of first blood, and the veterans bar demands a
LIVING killer" — with the mandatory/voluntary split proven
UNRECORDED rather than guessed, the ethan_hunt anomaly resolved for
timing (kill d103 → arena death d104), and the arena-death rate
measured on three stated denominators (killers 8/8, fallen persons
41/63, harness deaths 38/261). Wave 5 remains 0/8, the full seat
remains unreached, and the standing directive stands — the wall now
has a named next instrument (choice/event capture) and a named probe
(VETSHAPE), and no default flips. No src/js changes; the recorder is
a new default-OFF policy instrument.


