# sim-wave3enc-a — wave-3 encounter census: avoided, fled, or lost? (DIAG ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1535Z.
Worktree branch: sim-wave3enc-a.
Base anchor: worktree HEAD at sweep time 9f22a0838
(sim-scale-onramp-round-1415-a coordinator evidence commit) — the
prereg's base pin, and every judged JSON carries its anchorCommit.
This base is NEWER than the wavegate sweep anchor (4c92bbb04);
trajectories on the same seeds differ, sometimes sharply (see
Base-difference headline below). This arm judges ONLY its own
corpus on THIS base; wavegate numbers are quoted as prior-base
context, never as current data.
Pre-registration: evidence/2026-10-31/sim-wave3enc-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/policies/wave3enc-diag.js (WAVE3ENC=1, NEW) +
scripts/wave3enc-sweep-20261031.js (stdout-only runner) +
scripts/wave3enc-split-20261031.js (idle splitter) +
scripts/wave3enc-analyze-20261031.js.
Proof: scripts/test-wave3enc-20261031.js — 156 checks green (42
synthetic + 114 corpus legs: 6 per seed x 19 seeds — split sums,
recorder errors, derived-vs-engine uw, kill-log coverage, daily
sortedness, hashes present).
Corpus: evidence/2026-10-31/perseed-wave3enc/leadfeast/
s<seed>.json (19 seeds, all non-empty) + evidence/2026-10-31/
wave3enc-analysis.json (analyzer output).
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after comparison exists in this arm; none fabricated (same
declaration as wavegate-a). The det leg compares recorder-on vs
recorder-off trajectories of the SAME stack; it is a neutrality
proof, not a panel comparison, and its numbers never enter the
census tables.

## Verdict: DIAG-GO (with one stated strict-reading note)

Judged exactly against the prereg's band verdict:

- Completeness: 5/5 named stall seeds fully reported (meeting
  table whose six buckets sum to its meeting total, days-lived-
  with-wave-3 + warPts + p3 stated, recorder errors 0, derived-
  final-uw>=3 == engine-final-uw>=3). Every judged seed's split
  sums: bucketSum + unclassified-fight-rows == meetings on
  19/19 seeds (analyzer `sumOk` true everywhere; proof corpus
  leg machine-checks it).
- Cross-check (i): det-gate byte-identical hashes + identical
  end fields on both det seeds (87104, 87127) — PASSED.
- Cross-check (ii): corpus determinism leg — judged 87104 is
  BYTE-IDENTICAL to its det-ON scratch run (148,758 bytes,
  `cmp` clean).
- Cross-check (iii): kill-log coverage — every wave-3
  waveKillLog entry has a matching kill event on 19/19 seeds
  (unmatchedLogEntries 0 everywhere). Kill events (19) exceed
  log wave-3 entries only by the 2 routed-fight orphans below;
  no kill missed, none invented.
- InstrumentErrors = 0 on all 19 seeds. Usable judged seeds
  19 >= 8. Verdict sections (a)–(e) all present below.
- Pilot gate: 8/8 pilot seeds fired with zero recorder errors,
  per-seed JSONs valid, meeting tables computable on every
  pilot seed (including the instrument demonstrably firing:
  120 pilot meetings, 5 pilot kills, all on contrast road seeds
  as well as stall seeds) — pilot GO, confirm spend justified.
  The pilot was NOT thin and NOT instrument-failed.

### Strict-reading note on the 2 unclassified items (read this before reusing the verdict)

Two kill events are UNCLASSIFIED in the analyzer's strict sense
(87121 day 89 focus_group, via companion, delta 1; 87138 day 59
focus_group, via player, delta 1) — kill events with no matching
'won' fight row. Both are EXPLAINED, not hidden, by a code-grounded
mechanism (see Orphan-kill explanation below): each shares its
day + monster type with a TB fight that ended 'routed', and
tbEnd settles kills for non-lost results — a routed party can
still leave a dead monster behind (companion killing blow on
87121, player killing blow on 87138). The six-bucket split is
unaffected either way (orphans are not fight rows; the splits
sum on both seeds with or without them), and the prereg's NO-GO
clause names "unclassified > 0 unexplained" — here an
explanation exists and is verified against code + same-day
fight rows. Strict-reading note, stated plainly so the
coordinator can overrule: if the GO bullet "unclassified == 0"
is read literally with no explanation exception, this arm
would be DIAG-NO-GO on that bullet alone — and every census
value in sections (a)–(d) would be unchanged either way. The
verdict above follows the prereg's NO-GO exception clause plus
this verified read-only explanation, exactly as wavegate-a did
for its row-series disclosure. Metric-review item 1 carries
the classifier fix for the next arm (join kills to routed rows
too).

## Answer in one paragraph

FLED — overwhelmingly, on both sides, and almost never lost or
killed. Across the full band (293 wave-3 meetings): fled by
villagers 140 (47.8%), fled by beast 90 (30.7%), fought-lost 36
(12.3%), avoided (evade, no contact) 10 (3.4%), ledger-point
kills 17 (5.8%), fought-won-no-ledger-point 0. The channel split
is the sharp part: villagers in field fights NEVER kill a
wave-3 monster (0 kills in 233 field meetings) and almost never
die to one (2 field deaths in 233); they flee (131 vFlee) or
watch the beast flee (90 mFlee). Every wave-3 kill on the band
is the scholar's turn-based fight (17 bucketed kills in 60 TB
meetings — and even the scholar loses twice as often as he
kills: 34 TB lost vs 17 killed). On the 5 named seeds the
picture is the same shape, sharper: 74 meetings, 57 fled
(77%), 9 avoided, 4 lost, 4 killed — all 4 kills TB, zero
field kills. So wavegate's "warPts 0" was not "no wave-3
monsters met" and not "villagers slaughtered by wave 3": the
villages meet wave-3 monsters constantly (293 meetings on 18
of 19 seeds) and the meetings end in flight, both directions,
before anyone lands a killing blow.

## Base-difference headline (the stall set does not reproduce)

On wavegate's base the 5 named seeds were the never-veteran
stall set (warPts 0, wave 4 never). On THIS base only 2 of the
5 are still kill-less at wave 3 (87124, 87140: p3 0, warPts 0,
engine uw 3) — and both of them WIN (table, 92 and 197 days).
The other 3 blooded fighters and reached wave 4 (87104 won at
wave 4; 87109 died at wave 4 with 2 ledger kills; 87119 won at
wave 4). The wavegate stall phenomenon is therefore
base-sensitive, not a stable property of these seeds — and the
kill drought, where it persists (87124/87140), does NOT block
winning: the table is reachable at wave 3 without a single
wave-3 kill. What persists across bases is narrower and
stronger: villagers never kill wave-3 monsters in field fights
(0/233 here; wavegate's never-veteran set is the same fact
from the kill side). The full band on this base is also much
more successful than wavegate's (won 15/19 here vs 6/19 there,
median survival 90 vs 137 — wins come early, ~day 90, on this
base). That is a base difference, not a lever effect: this arm
moved nothing.

## (a) Per-seed encounter table (all 19 judged seeds)

Meetings = one fieldFight call (wave-3 mdef) + one settled
tbEnd fight containing a wave-3 monster. Buckets in order:
avoided / fled-by-beast / fled-by-villagers / fought-lost /
fought-won-no-ledger / ledger-point-kill. w3days = daily rows
with the wave-3 rung true (day >= 25 AND p2 >= 4); firstW3Day =
first such row; null = never unlocked. warPts = end
villageStanding warPts; p3 = end wave-3 ledger points.
Unclass = unclassified items (see note above; both are routed-
fight orphan kills, not fight rows — splits still sum).

| Seed | Days/end | W3day | W3days | p3 | war | Meet | Avoid | FledB | FledV | Lost | WonNoLed | LedPt | Uncl | Spawns | Unfought |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 87103 | 60/lost | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 87104 | 159/won | 135 | 25 | 1 | 1 | 13 | 0 | 2 | 9 | 1 | 0 | 1 | 0 | 3 | — |
| 87107 | 90/won | 46 | 46 | 2 | 2 | 21 | 0 | 9 | 9 | 1 | 0 | 2 | 0 | 10 | — |
| 87109 | 146/lost | 50 | 96 | 2 | 3 | 9 | 2 | 0 | 4 | 1 | 0 | 2 | 0 | 3 | — |
| 87115 | 90/won | 52 | 39 | 0 | 0 | 14 | 0 | 6 | 5 | 3 | 0 | 0 | 0 | 3 | — |
| 87119 | 90/won | 54 | 37 | 1 | 1 | 7 | 0 | 0 | 4 | 2 | 0 | 1 | 0 | 1 | — |
| 87120 | 103/won | 64 | 40 | 1 | 2 | 3 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 1 | spool |
| 87121 | 90/won | 41 | 50 | 1 | 1 | 15 | 0 | 4 | 9 | 2 | 0 | 0 | 1 | 4 | — |
| 87123 | 110/won | 51 | 60 | 1 | 1 | 29 | 0 | 17 | 11 | 0 | 0 | 1 | 0 | 4 | — |
| 87124 | 92/won | 32 | 61 | 0 | 0 | 16 | 3 | 7 | 6 | 0 | 0 | 0 | 0 | 4 | — |
| 87126 | 90/won | 50 | 41 | 0 | 0 | 10 | 1 | 2 | 6 | 1 | 0 | 0 | 0 | 4 | — |
| 87127 | 127/won | 121 | 7 | 0 | 0 | 3 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 1 | — |
| 87128 | 91/won | 41 | 51 | 3 | 3 | 23 | 0 | 5 | 11 | 4 | 0 | 3 | 0 | 9 | — |
| 87132 | 90/won | 34 | 57 | 1 | 2 | 16 | 0 | 4 | 9 | 2 | 0 | 1 | 0 | 9 | focus_group |
| 87134 | 90/won | 49 | 42 | 0 | 0 | 7 | 0 | 2 | 1 | 4 | 0 | 0 | 0 | 3 | spool |
| 87135 | 144/lost | 74 | 71 | 1 | 1 | 48 | 0 | 24 | 23 | 0 | 0 | 1 | 0 | 11 | — |
| 87137 | 89/lost | 58 | 32 | 2 | 2 | 21 | 0 | 0 | 7 | 12 | 0 | 2 | 0 | 4 | — |
| 87138 | 90/won | 35 | 56 | 3 | 4 | 9 | 0 | 0 | 6 | 1 | 0 | 2 | 1 | 4 | — |
| 87140 | 197/won | 152 | 46 | 0 | 0 | 29 | 4 | 8 | 17 | 0 | 0 | 0 | 0 | 6 | chorus_line |

Notes: 87103 never unlocked wave 3 (died day 60 at wave 2) —
its zero table is complete, not missing. 87127 lived with wave
3 only 7 days (unlocked day 121, won day 127) and still met it
3 times. 87135 is the meeting-densest seed (48 meetings in 71
wave-3 days, 1 kill). 87137 is the losingest (12 fought-lost
in 21 meetings — the scholar's TB channel, see below).

## (b) The verdict sentence, with numbers

Wave-3 fights are FLED, not avoided and not lost — except in
the scholar's own fights, where they are more often lost than
won. Band totals (293 meetings): fled 230 (78.5% combined:
villagers 140, beast 90), avoided 10 (3.4%), lost 36 (12.3%),
killed 17 (5.8%), won-without-a-ledger-point 0. The
fought-won-no-ledger bucket is EMPTY on all 19 seeds: every
wave-3 kill scored a ledger point (kill events 19 = 17
bucketed + 2 routed-fight orphans, all delta > 0, capped 0) —
types never reach the per-type cap of 2 on this band, so the
"kill that scores nothing" case is unobserved, not refuted.
On the 5 named seeds: 74 meetings, fled 57 (77.0%), avoided 9
(12.2%), lost 4 (5.4%), killed 4 (5.4%), won-no-ledger 0.

## Channel split (the finding inside the finding)

| Channel | Meetings | Avoid | FledB | FledV | Lost | WonNoLed | LedPt |
|---|---|---|---|---|---|---|---|
| Field (villager) | 233 | 10 | 90 | 131 | 2 | 0 | 0 |
| TB (scholar) | 60 | 0 | 0 | 9 | 34 | 0 | 17 |

Field-meeting callers: wild 202, expedition 18, aid 13,
patrol 0, sortie 0, rng-seeded 0. (The pilot corpus recorded
expedition meetings as caller 'other'; the analyzer recovers
the channel from the stored stack string — confirm corpus
records 'expedition' directly. Both normalize identically.)
The two field deaths in the whole band are both round-1
deaths (87128 day 52 redactor, 87137 day 87 buffering — a
villager entering at low HP against a wave-3 monster, not a
fought-to-the-death duel). Villagers do not die to wave 3 in
field fights because they leave first: 131 vFlee vs 2 vDie.
And they do not kill because the beast leaves first or they
do: 90 mFlee vs 0 vKill. The ONLY wave-3 kills are the
scholar's: 17 in 60 TB fights (28.3% of his wave-3 fights end
in a kill; 56.7% end lost; 15.0% fled/routed). Wave-3 kills are
a player-channel phenomenon on this stack, full stop.

## (c) Spawn-vs-fight context (scoped honestly)

The spawn wrap covers ONE spawn channel only
(spawnWorldMonster — maintenance spawns). Meetings (293)
vastly exceed maintenance spawns (84) because most wave-3
meetings come through other generation paths (wanderer casts,
expedition casts, world-monster ticks on already-present
entities) that do not call spawnWorldMonster. The spawn numbers
below are therefore a LOWER-BOUND context, never a generation
total — the meeting census (every fight row) is the complete
count; the spawn count is not.
- Maintenance spawns, wave-3: 84 across 18 unlocked seeds
  (87103: 0 — never unlocked).
- Spawned types never fought (type-level: no meeting row and
  no deed-feed entry for the type): 4 — spool on 87120,
  focus_group on 87132, spool on 87134, chorus_line on 87140.
  Every other maintenance-spawned wave-3 type was fought.
- Deed-feed wave-3 types with no meeting row: 0 on every seed
  (deedOnlyTypes empty everywhere) — every type the deed feed
  says was faced has a fight row to show for it. The deed feed
  and the fight census agree exactly.
- So "avoided" at the spawn level is nearly nonexistent AND
  "avoided" at the fight level is rare (10 evades in 293):
  villages do not fail to meet wave-3 monsters. They meet them
  and the meetings dissolve into flight.

## (d) Wall numbers on the judged band (19 seeds)

| Measure | Judged band |
|---|---|
| National reached | 14/19 (73.7%) |
| Table reached | 16/19 (84.2%) |
| Won | 15/19 (78.9%) |
| Wave 4 reached | 12/19 (63.2%) |
| Wave 5 reached | 0/19 |
| Median survival | 90 days; max 197 |
| Wave-3 meetings | 293 (233 field + 60 TB) |
| Wave-3 kills (kill events) | 19 (17 bucketed + 2 routed-fight orphans), all ledger-point, 0 capped |
| Deaths (all seeds) | 543 total; combat 40.9%, villager combat 25.0%, the wild 12.5%, expedition 8.5%, sickness 3.1%, rest < 2% each |

Scope note (not a gap to hide): Arc reach, four-realm
formation, trap acquisition by source, counter discovery rates,
and young-link succession survival are NOT in this corpus —
the recorder does not read them, so this evidence reports them
as unmeasured, not as zero. Death-cause shares, wave reach,
national/table/win reach, and survival are measured above from
the corpus's own fields.

## Orphan-kill explanation (code-grounded, both items)

tbEnd's settlement loop (game.js, tbEnd path) iterates dead
monster fighters and calls recordWaveKill for every NON-lost
result — 'won' AND 'routed' (and 'fled' in principle). A
'routed' result therefore can carry a kill event, and the
prereg's join rule (kills join only to 'won' rows) leaves it
orphaned. The two items fit exactly:
- 87121 day 89: TB rows focus_group 'lost' AND 'routed' +
  recordWaveKill focus_group via 'companion' delta 1. The
  'lost' fight's kill (if any) would be pyrrhic (recordPyrrhicKill,
  not wrapped here — a separate instrument question, and
  pyrrhic kills score NO ledger points by design); the
  'routed' fight's companion landed the killing blow while the
  party routed — a real ledger-point kill in a lost-shaped
  fight.
- 87138 day 59: TB row focus_group 'routed' + recordWaveKill
  focus_group via 'player' delta 1. Same shape: the scholar's
  party routed, the monster died anyway.
Neither item moves any bucket: the fight rows are already
counted (lost/routed → fought-lost / fled-by-villagers) and
the kills are counted in the kill-event total (19). The
evidence's kill total and bucket total therefore differ by
exactly these 2, on purpose, with the reason stated.

## Repeat-meeting audit (meeting = one fieldFight call, defended)

Same-(day, vid, mid) field rows repeat on 14 groups band-wide.
Nearly all are sequential re-engagements with progressing HPs
(a villager meets the same monster again later the same day
and fights again — real meetings, counted separately). ONE row
is a probable double-tap: 87124 day 43, victor_lopez vs spool —
first call 7 rounds, mFlee, vHp 17 / mHp 28; second call
0 rounds, mFlee, IDENTICAL HPs (17/28), intent learn. A
0-round repeat on identical state is not a second fight.
Removing it would move 87124's fled-by-beast 7→6 and its
meeting total 16→15; the band verdict (fled-dominated, zero
field kills) is unchanged. It is left IN the census (prereg
definition: one call = one meeting) and flagged here, not
silently merged.

## Village assessment — what the villages looked like

The band on this base is a winning band (15/19 won, mostly
~day 90 through the table) that nonetheless never learns to
kill wave-3 monsters as villagers. The two still-kill-less
named villages are the clearest picture: 87140 lived 197 days,
won at national rank, met wave-3 monsters 29 times in 46
wave-3 days, and killed none — 17 times its own villagers
fled, 8 times the beast fled, 4 times they saw it and gave it
room. 87124 won in 92 days with 16 meetings and no kill. Who
thrived: the scholar — every wave-3 kill is his, in fights he
more often loses (34 lost vs 17 killed). Who died and why:
combat dominates (65.9% combat + villager combat), starvation
is 3 deaths in 543. What knowledge/capabilities were missing:
not contact (293 meetings), not courage to engage (fights run
real rounds with damage both ways — see sense read), but
CONCLUSION: villager fights against wave-3 monsters never
reach a killing blow in either direction. The blank this arm
fills is the mechanism behind wavegate's warPts 0: it is
flight, not absence and not slaughter.

## Sense-testing read (SENSE-TESTING LAW)

Stall-seed meeting, 87140 day 173 — one villager, one monster,
one day, three fights, no ending. gen_qfz98s0 meets Ad Break
three times in a single day (wild channel, no ally, no
narration line captured that day — field meetings are
off-screen by design, and the say capture confirms the silence:
134 wave-3 say lines on this seed, all TB-combat headers, none
for this villager's day). Fight 1: intent learn, 2 rounds,
takes 28, deals 14, flees at 72 HP. Fight 2: intent engage, 2
rounds, takes 25, deals 26, flees at 47 HP. Fight 3: intent
engage, 2 rounds, takes 22, deals 29, flees at 25 HP. The
monster's HP falls across the day (263 → 237 → 208) — the
villager IS hurting it, and IS learning (learn → engage), and
still walks away three times, ending the day at a quarter
health against a monster it has now wounded three times. Read
for meaning: this is not a villager who never engages, and not
a villager who cannot fight — it is a villager whose fight
calculus always resolves to "leave" before the kill, even as
the evidence of the day says the fight is winnable. The
absence around it is the second finding: nobody in the village
narrates these three flights (no say line, no beat captured) —
the village's most common wave-3 experience leaves no story,
only a flee count. A villager would remember the day they
fought the same nightmare three times; the game, on this
evidence, does not say so.

## Det-gate (trajectory neutrality, prereg requirement)

- ON vs OFF on 87104 and 87127 (same stack, same seeds, worktree
  scratch dirs, never the judged corpus): hashes IDENTICAL
  (159 vs 159; 127 vs 127), end fields IDENTICAL (gameDays,
  won, national, table, maxWave, endScaleRank) on both seeds.
  DET-GATE PASSED. The recorder does not move trajectories.
- Label-change note: after the det-gate, the recorder's caller
  classifier gained one label ('expedition' for the
  expeditionMonster frame, previously 'other'). The classifier
  is a pure function of the call stack + opts flag; its result
  is stored only in the recorder's own store — it touches no
  game state and draws no RNG, so it cannot move a trajectory.
  The det-gate's neutrality conclusion stands for the wrap
  mechanism; the pilot corpus's 'other' expedition rows are
  normalized by the analyzer from the stored stack string (no
  re-run, no smoothing — the raw rows are unchanged).
- Sweep I/O discipline, as prereg'd: the sweep printed one JSON
  line per seed to stdout and wrote nothing; the idle splitter
  wrote the per-seed JSONs with a resilient writer (retry +
  full-size verification). stdout/stderr were captured to files
  in single foreground execs, never a backgrounded pipe. No
  judged corpus was staged in /tmp at any point (det scratch,
  pilot/confirm jsonl, and splitter outputs all lived in the
  worktree; scratch dirs were deleted before commit).

## Determinism leg (corpus trust, prereg requirement)

- Pilot seed 87104 re-run equivalence: the judged 87104 JSON is
  BYTE-IDENTICAL to its det-ON scratch run (148,758 bytes both,
  `cmp` clean). The judged corpus is reproducible on this base.

## Metric review (for the NEXT run — mandatory section)

1. The kill-row/kill-event day+type join held without ambiguity
   on 291 of 293 meetings; the 2 exceptions are the routed-
   fight orphans above, and the fix is a classifier rule, not
   a data repair: join kill events to TB rows with result
   'won' OR 'routed' (a routed fight can carry a kill), and
   separately instrument recordPyrrhicKill (lost-fight kills
   score no ledger points by design — a 'lost' row with a
   pyrrhic kill is a third outcome shape this recorder cannot
   see). The next arm should add the routed join + a pyrrhic
   counter, and should re-state the meeting definition to
   name the routed-kill shape explicitly.
2. The det-gate held on both seeds; the label-only classifier
   change after it is documented above and needs no re-run
   (pure function, no state/RNG touch).
3. The pilot gate behaved: 8/8 fired, 0 errors, meeting tables
   computable everywhere including the zero-table seed shape
   (87103, in confirm, proved the zero case for real: 0
   meetings, all buckets 0, complete). The "thin pilot still
   confirms" clause was not needed — the pilot had 120
   meetings — but the confirm added real information anyway
   (the two field deaths, the routed orphans, the 48-meeting
   seed 87135, the zero-table seed 87103).
4. Meeting-definition rewording for the next arm: "one
   fieldFight call = one meeting" should gain the double-tap
   exception (a 0-round row repeating identical HPs of an
   earlier same-day same-vid same-type row is a re-entry, not
   a meeting) — 1 row on this band, verdict-neutral, but the
   rule should exist before a band where it is not rare.
5. Spawn coverage limit, stated not hidden: spawnWorldMonster
   covers maintenance spawns only; most wave-3 meetings arrive
   through other generation paths. A future arm that wants a
   true generation census must wrap castMonster + the
   expedition/wanderer casts as well — or stop reporting spawn
   counts as if they were generation counts (this evidence
   scopes them as lower-bound context only).
6. The 'fought-won-no-ledger-point' bucket went unobserved on
   all 19 seeds (capped kills 0). That is a band property
   (few kills per type per seed), not proof the bucket is
   unreachable — a longer-lived or kill-richer band could fill
   it. Do not delete the bucket; do not claim it impossible.

## Backlog items (for the coordinator — NOT chased mid-run)

1. Villager wave-3 fights never conclude (0 kills, 2 deaths in
   233 field meetings): is the flee calculus tuned so that
   wave-3 HP/damage bands (240–420 HP, 20–70 damage) always
   resolve to flight before round ~6? The sense read's
   three-fight day suggests villagers CAN wound wave-3
   monsters but never stay. Design question, not a lever
   moved here: does the game intend villagers to ever kill
   wave-3 monsters, or is the scholar the only wave-3 killer
   by design (in which case the veteran bar's "living roster
   member with a wave-3+ kill" is scholar-shaped, and
   non-scholar villages stall by construction)?
2. Routed-fight kills (2 on this band) need the classifier fix
   in metric-review item 1 before any arm counts "kills" from
   buckets alone — bucket ledger kills (17) undercount kill
   events (19) by exactly the routed shape.
3. Field meetings leave no narration (87140 day 173: three
   flights, zero say lines): if flight is the dominant wave-3
   experience, should the village hear about it (gossip beat,
   trick observation, or a flee tally) or is the silence
   intended? The trick-observation channel
   (noteVillagerTrickObservation) is the existing candidate —
   whether survived wave-3 encounters feed it is unmeasured
   here. Steve-call if it changes narration.
4. Base sensitivity of the stall set (3/5 wavegate stall seeds
   not stalled here): any follow-up that re-uses wavegate's
   seed labels must re-derive stall status on its own base
   first, as this arm did — seed labels do not transfer across
   bases.
