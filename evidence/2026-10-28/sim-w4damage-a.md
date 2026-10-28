# sim-w4damage-a — the unrecorded inter-fight damage source, traced: it is the palisade toll (plus one TB-restore write-back)

Run: fleshout loop, run fleshout-20261028T0320Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4damage-a.
Worktree: `~/workspace/worktrees/sim-w4damage-a` (branch
sim-w4damage-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no game fix proposed. The deliverable is knowledge:
the cause of the five world-HP drops the 0221Z lethality
re-measurement found with no recorded fight row between them.
No [needs-eyes] applies (measurement only, no narration or
behavior added — the sense script only READS beats on a replay).

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-w4damage-a-prereg.md (commit bd8cd3df1).
Corpus: evidence/2026-10-28/perseed-w4damage-a/ (8 rows +
summary.json + analysis.json). Instruments (new this arm, plus
the rebase stack reused verbatim): scripts/policies/w4damage-diag.js
(fieldFight choke-point rows with caller classification, per-object
havenRaidTick toll rows, daily world-HP snapshots),
scripts/test-w4damage-sweep.js (copy of the rebase sweep, diff
verified to contain only label/corpus/mode/w4damage-layer changes),
scripts/test-w4damage.js (analyzer / proof validator),
scripts/test-w4damage-sense.js (non-measured replay only).
Detgate: PASS (seed 75101, baseline vs recorders-OFF: days 132/132,
gameDays 132/132, tsNationalDay 77 both, no diag surface, no wraps
installed, post-setup world 0) — on the OLD numbers exactly, so no
detgate amendment was needed.

## Plain words first

There was no secret damage source. There was a wall, and a
homecoming.

Four of the five mystery drops are the palisade doing exactly what
the village built it to do: when raiders come over the wall, the
stakes take a quarter of each raider's health — 250 off a 1,000-HP
monster, 225 off a 900-HP one, 300 off a 1,200-HP one. The old
census never saw it because it only read fight rows, and a wall is
not a fight: the toll lands during the raid night, between one
field meeting and the next, and the fight record has no row for it.
This run's recorder watched the raid night object by object and
caught the toll red-handed, at the exact amount, on the exact
monster, on the exact night, four times out of four.

The fifth drop only looked like a drop. A Eulogy came over the wall
for 225 damage (900 down to 675), and then the village's champion
fought it in a turn-based fight and lost — and a losing lingerer
goes back to the treeline carrying the fight's ending health, not
the wall's. The fight ended with the monster at 740, so the world
monster went back out at 740: toll -225, homecoming +65, net -160.
The "same-day wobble" is the same story told twice: the fight's
start read the pre-fight 675, the field fights later that day read
the post-fight 740. Nothing was damaged off the books; the books
just never recorded the wall or the homecoming.

And the other suspect is dead: there are NO hidden patrol, aid, or
sortie fights on this band. Every wave-4 world fight in the new
recorder already appears in the old fight record — the bypass
census is empty. The village's fights are all on the books; only
the wall and the homecoming were off them.

What this means for the wave-4 story: the wall is now the biggest
single wound-maker on wave-4 monsters (up to 300 in one night,
against a field-fight cap of about 33 and a typical turn-based
fight of a few percent) — and it never finishes anything, because
the toll floors at 1 HP and counts for nobody's kill. Worse, a
lost turn-based fight against a toll-wounded lingerer can hand
some of the wall's work back: the homecoming writes the fight's
ending health over the wall's damage. The village can wound a
wave-4 monster badly without ever being able to say it did — and
can then watch a lost fight un-wound part of it.

## Verdict: GO (binding prereg, no re-score)

GO required a source named with a trace for at least 4 of 5
re-derived drops (or all, if fewer re-derive) + a named next
step. All five re-derived, all five traced:

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, every recorder
  clean (errs 0 on all eight recorders, no overflow), w4damage
  snapshots present on every seed.
- (b) Parity vs the rebaseline corpus: PASS, EXACT. Per-seed
  days, gameDays, won, waveReach, nationalEver/Final, table,
  entered, deathTotal, courtship combined, wave-4 defwound rows
  by context, and wave-4 nonworldkill starts all match
  evidence/2026-10-27/perseed-w4channel-rebaseline/ exactly.
  Detgate PASS proves recorder neutrality.
- (c) Drops re-derived: 5/5 known drops recur on the current
  base (same seed, same seq, same delta — see drop table).
- (d) Sources traced: 5/5, each with event rows on the same seq
  inside the drop's interval (see per-drop traces).
- (e) Named next step: see "Named next step" below.
- (f) SENSE: PASS (with the prereg's fallback applied, disclosed
  below).

VERDICT: GO. The gap class is closed on this band: every
inter-fight drop has a named mechanism with event rows.

ANALYZER-FIX DISCLOSURE (read this before trusting the verdict):
the analyzer's FIRST run judged NO-GO (3/5 traced, 2 partial).
That was an instrument bug, not a measurement failure, and it
was fixed and re-proved without touching the corpus or
re-sweeping: (1) the first analyzer summed whole raidTick-window
HP changes, but a raidTick window contains the defender fight
(havenRaidTick drives the defense beat inside the tick), so a
toll + fight window read as one -319 instead of toll -300 plus
fight -19; (2) the first analyzer had no TB-restore join at all,
so the +65 homecoming was invisible to it. The fixed analyzer
splits raidTick windows by their in-window fights and joins NWK
starts to tbdmg ends to oldcore re-entries for lingerer
restores. The re-run judges GO (5/5). The GO rule itself was
NOT changed, the prereg was NOT re-scored, the corpus was NOT
re-swept, and the original NO-GO run is disclosed here rather
than hidden. The analysis.json in the corpus is the re-run's
output (GO).

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~15 min for 8 seeds (plus detgate ~2 min
  and sense replays).
- Base: 3264dbb80, POST-lethality-rebase (e7e7e3472 is an
  ancestor). Master did not move under this run; no rebase was
  needed.
- Substrate-activation gate: band courtship combined = 121
  (courtCounters 0, courtAccords 24, courtNational 9, courtGlobal
  5, tended 59, defenseCalls 0, proposedLead 24), seeds active
  8/8 — GATE PASSES (combined > 0 and >= 6/8 active). No inactive
  seed on this band. The courtship total is identical to the
  rebaseline band's (121, 8/8), as exact parity requires.

## Wall numbers (THIS band only, never pooled)

| field | this band (75101-75108) | rebaseline band |
|---|---|---|
| national ever / final | 7/8 / 5/8 | 7/8 / 5/8 |
| table invited / entered | 6/8 / 3/8 | 6/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 5/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 162d upper / 154d conventional (days: 90, 114, 132, 146, 162, 177, 180, 180) | 162d upper / 154d conventional |
| starvation deaths | 2 (both 75108) | 2 |
| deaths total | 299 | 299 |

Per-seed ends: 75101 won lesser d132 (wave 4, national); 75102
village-lost d177 (wave 4, global); 75103 survived d180 (wave 4,
regional, table invited, never entered); 75104 won lesser d90
(wave 3, national); 75105 won lesser d162 (wave 3, global); 75106
village-lost d146 (wave 4, regional); 75107 survived d180 (wave 3,
global, never tabled); 75108 village-lost d114 (wave 4, regional).
Arc IV (table entered): 3/8. All three wins are lesser-seat wins.
The full seat is still nobody's story; wave 5 is still unreached.

## The drop table (the judged measurement)

Defwound-chain gaps on THIS band: exactly 5, and they are the 5
known drops (same seed, same seq, same delta). No other wave-4
inter-fight gap exists on this band.

| # | seed | seq | monster | prev (day, HP) | next (day, HP) | delta | trace | verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | 75106 | 47 | algorithm | d96, 991 | d97, 741 | -250 | raid toll d96: 991 -> 741, wall 250, tollExact | TRACED |
| 2 | 75106 | 55 | eulogy | d127, 900 | d129, 740 | -160 | raid toll d127: 900 -> 675 (-225) + TB lingerer restore d129: 675 -> 740 (+65) | TRACED |
| 3 | 75106 | 57 | eulogy | d140, 900 | d144, 675 | -225 | raid toll d141: 900 -> 675, wall 225, tollExact | TRACED |
| 4 | 75108 | 28 | reunion | d95, 1154 | d100, 854 | -300 | raid toll d98: 1154 -> 854, wall 300, tollExact | TRACED |
| 5 | 75108 | 29 | reunion | d89, 1170 | d98, 870 | -300 | raid toll d98: 1170 -> 870 (wall 300); the raidTick post-read 851 adds the defender fight 870 -> 851 (19), which is the next row's own damage, not gap damage | TRACED |

### Per-drop traces (event rows, same seq, inside the interval)

- Drop 1 (75106 seq 47 algorithm, -250): w4damage raidTick d96,
  preHp 991, maxHp 1000, postHp 741, wall 250, tollExact true,
  pre-tile (4,5) -> post-tile (4,4) (drafted to Haven). No
  in-window fight for this seq. Daily snapshots: d95 1000,
  d96 991 (after the d96 field fight), d97 719 (after the d97
  field fight's 22 damage: 741 - 22). The toll is the whole gap.
- Drop 2 (75106 seq 55 eulogy, -160): w4damage raidTick d127,
  preHp 900, maxHp 900, postHp 675, wall 225, tollExact true,
  pre-tile (5,4) -> post-tile (4,4), lingering set. Then NWK
  start d129 (fightId fmgpspipy_49dzce, world-origin, tileHp
  675) -> tbdmg tbEnd d129 (same fightId, result lost, monster
  fighter 740/914) -> oldcore tbEnd d129 (seq 55, kind re-entry,
  restored true, lingering true). Restore value = min(900, 740)
  = 740, delta +65. Net: -225 + 65 = -160. Daily snapshots
  confirm the shape: d127 900, d128 675, d129 740. The d130 TB
  start for the same seq reads 740 — the restored state
  persists into the next day, which is the independent check
  that the restore, not a second toll, produced the 740.
- Drop 3 (75106 seq 57 eulogy, -225): w4damage raidTick d141,
  preHp 900, maxHp 900, postHp 675, wall 225, tollExact true,
  pre-tile (3,4) -> post-tile (4,4). Daily snapshots: d141 900
  (snapshot before the raid night's sleep), d142 675. The toll
  is the whole gap.
- Drop 4 (75108 seq 28 reunion, -300): w4damage raidTick d98,
  preHp 1154, maxHp 1200, postHp 854, wall 300, tollExact true,
  pre-tile (5,5) -> post-tile (4,4). The toll is the whole gap.
- Drop 5 (75108 seq 29 reunion, -300): w4damage raidTick d98,
  preHp 1170, maxHp 1200, postHp 851, wall 300, tollExact false
  — because the window contains the defender fight: ffInWindow
  shows the seq-29 resolve fight (mDealt 19, stack through
  havenRaidTick), and the defwound d98 raid row for seq 29
  reads start 870, left 851, dealt 19. Split: toll 1170 -> 870
  (-300) + fight 870 -> 851 (-19). The gap's next row IS that
  fight row (start 870), so the gap is exactly the toll. The
  first analyzer's -319 was the unsplit window total; the
  split is proven by the fight row itself, not by arithmetic
  alone.

### The same-day wobble, resolved (not a sixth source)

75106 seq 55 reads 740 in the field and 675 in TB on d129.
Both readings are true, at different moments of the same day:
the TB start (monsterTurn bump) reads the pre-fight world HP
(675, post-toll), and the field fights (aid via resolve, vid
visjoin_102) read the post-restore world HP (740, after the
lost TB fight's lingerer restore). Intra-day order, not a
second damage source: TB start 675 -> TB end fighter 740 ->
restore world 740 -> field fights 740 -> snapshot 740. The
lethality analyzer compared a pre-TB read with post-TB reads
under one day label and called the difference a wobble; the
event rows dissolve it.

### The bypass census (the killed suspect)

Wave-4 world fights in w4damage fieldFight rows that do NOT
match a defwound row (by day + seq + start HP): ZERO, by every
caller class (resolve / patrol / aid / sortie / other all 0).
Aid fights DO occur on this band (the seq-55 d129 fights are
caller 'aid'), but they route through resolveWildMonsterEncounter
and are therefore already in defwound — they are not bypasses.
Patrol fights (resolvePatrol -> fieldFight directly) and sortie
fights (lingererSortie -> fieldFight directly) simply do not
occur against wave-4 world monsters on this band: the direct
callers exist in code, but no wave-4 world instance meets one
here. The direct-router hypothesis for the gap class is dead
on this band — the toll + restore account covers all five
drops without it. (A future band where a patrol DOES meet a
wave-4 monster would need this census re-run; the recorder
already captures that case by caller class.)

## Parity (exact)

The analyzer's parity table (this band vs the rebaseline corpus,
same seeds/policy/substrate) matches EXACTLY on all 8 seeds:
days, gameDays, won, waveReach, nationalEver/Final, table,
entered, deathTotal, courtship combined, wave-4 defwound rows by
context, and wave-4 nonworldkill starts. Per-seed days:
132/177/180/90/162/146/180/114 on both sides. The detgate
(132/132, tsNationalDay 77 both) proves the w4damage layer is
trajectory-neutral when ON as well as OFF: the armed rows match
a corpus recorded without it.

## Sense-testing read

Seed rule per this prereg: fixed seed 75104 first, with the
supplement rule. Non-measured narration replays (say/sysSay
taps); replay text proves wording and presence only, never
counts — and the replay trajectory can shift from the judged
run, so beats below are the village's story in words, not
day-exact claims about the corpus.

### 75104: the absence (window d60-d90, 465 hits)

Corpus facts for 75104 on this band: 0 wave-4 arrivals, 0 faced
types, won lesser d90 at wave 3. The replay agrees in shape:
the window reads as people with routines (Emilio and Pamela
cooking, pantry checks at ~41 days fresh, garden tending,
teaching — "Emilio taught David Food Preservation"), rival
villages at the treeline (The Bloodied demanding kcal), and
the treeline chorus ("stops at the treeline — pacing,
unwilling. The walls end the argument. It's still out there.")
for pre-wave-4 monsters. No wave-4 thread, no Mirror Draft
beat in the sampled window — the same absence the rebaseline
sense read found. The village wins before wave 4 exists for
it, again.

### 75106: the supplement (window d69-d146, 862 hits in one replay pass)

Corpus facts for 75106 on this band: 13 wave-4 spawns from d79,
25 wave-4 fights in the lethality vocabulary, 0 kills. The
replay carries a real wave-4 thread, and — the point of this
arm's sense question — it DOES name the toll, once per raid,
in the raid beat itself:

- d72 (replay): "🐗 RAID — 4 raiders (Ad Break, The Redactor,
  Spool, The Ugly Beast) hit Haven in the night, drawn by the
  smell of the pantry! The palisade's stakes take their toll
  as they come over the wall." Followed by the escalation
  beat ("One of them is bigger than the usual teeth at the
  door — Ad Break came with this raid, and the wall was not
  built for its kind.") and the lingerer beats ("Nobody met
  Spool — it's still out there at the treeline. It'll gorge
  every night until it's driven off.").
- d85 (replay): the same beat with the wave-4 raiders named:
  "🐗 RAID — 4 raiders (The Eulogy, The Reunion, The Redactor,
  Ad Break) hit Haven in the night... The palisade's stakes
  take their toll as they come over the wall." Then nightly
  gorge beats with kcal amounts ("The lingering The Eulogy
  gorges at the treeline — 1,595 kcal gone from the stores.
  Endure it (they drift off within ~6 nights — the gorge is
  the price), or send a sortie: fighters, rations, real risk.")
- d79 (replay): "📯 MUSTER — scouts report The Eulogy hunting
  near Haven, and it is beyond us. Everyone inside. No one
  walks the treeline alone."

What the replay does NOT show: any beat naming the toll's
effect on a specific monster ("the Eulogy came over the wall
hurt"), any beat naming a TB restore ("it came back carrying
the fight's wounds"), or any villager routing to finish a
toll-wounded lingerer. The sense gap and the census gap were
the same gap, and both close the same way: the village knows
the wall takes a toll and knows lingerers gorge — it has no
language, and no behavior, for the wall as a wound-maker on a
named monster, or for finishing one. The toll is announced;
its wounds are not tracked aloud.

Sense findings (not verdict items): the cook-line chorus and
treeline chorus repeat as in prior arms (same class, not
re-judged here); the raid beat's toll sentence is the one
line in the game that names this arm's mechanism, and it
names it without numbers or victims.

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and go
home — one of them (75104) in just 90 days, without ever meeting
a wave-4 monster. Three more die (75102 after a long wave-4 war
at day 177, 75106 at day 146, 75108 at day 114), and two survive
the horizon without ever sitting the table (75103, invited but
never entered; 75107, never even invited). Five reach wave 4,
none reaches wave 5, and the full seat is still nobody's story.
The villages that DO reach wave 4 fight it hard and kill
nothing — and now we know one more reason the kill count stays
zero while the wound count does not: the biggest wounds on
wave-4 monsters in this band come from a wall, not a weapon,
and walls don't get kill credit, don't finish, and can even
have their work partly undone by a lost fight's homecoming.
If the village is ever going to finish a wave-4 monster, it
needs a way to SEE the wall's wounds and go after them — or
the wall will keep wounding monsters that nobody finishes.

## Blanks filled or documented

- FILLED (answered, with event rows): the 0221Z round's named
  next blank — the unrecorded inter-fight damage source for
  wave-4 monsters: the palisade raid toll (4/5 drops whole, 1/5
  as the toll minus a TB lingerer restore), with the same-day
  wobble dissolved into intra-day TB ordering; the direct-router
  (patrol/aid/sortie) suspect killed on this band by an empty
  bypass census; the herald item stays NOT FOUND (zero herald
  fights on this band too — the gap class, not the herald, was
  the right frame, and the class is now closed).
- FILLED (mechanism, read from code + corpus): havenRaidTick
  drives defender fights INSIDE the tick (the ffInWindow fight
  stack proves it), so any raidTick-window HP total conflates
  toll + fight unless split by the fight row; lingerer TB
  restores write the fighter's end HP over the world HP, so a
  lost TB fight can RAISE a toll-wounded lingerer's world HP
  (675 -> 740 here) — a write-back, not damage, and the reason
  the -160 drop is not a -225 drop.
- DOCUMENTED, NOT FIXED (named next blanks): see "Named next
  step" below — the restore-over-toll interaction and the
  wall-wounds-are-invisible problem are design questions for
  a fix arm, not conclusions of this DIAG arm.
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the panel corpus-ingest mode (tooling blank,
  see below); the live rule-(3) firing band (per the 2026-10-27
  16:02 call, no more low-defiance substrates are burned).

## Named next step (fix arm or instrument gap — required by GO)

FIX ARM (no game change lands from this DIAG arm; this is the
brief for the next arm, not a proposal smuggled in): "wall
wounds, finished" — decide, from Steve's standing intent, one
of: (a) lingerer TB restore takes min(pre-fight world HP,
fighter end HP), so a lost TB fight can never heal a
toll-wounded lingerer (the restore then only ever preserves
or deepens wounds, never undoes the wall); or (b) keep the
restore as-is and record it as intended (the fighter's end HP
IS the monster's wound state, and the wall's damage is
supposed to be re-rolled through the fight) — in which case
the fix is visibility, not mechanics: name toll-wounded
lingerers in the village's language (a treeline report, a
muster note) so a finishing trip is a real choice. Either
way, the arm must measure on identical seeds whether
toll-wounded lingerers get finished more often, and must not
re-score this arm's GO. INSTRUMENT GAP (closed here, kept for
the record): any future raidTick-window measurement must split
toll from in-window fights by the fight row, and any future
TB-restore measurement must join NWK starts to tbdmg ends to
oldcore re-entries — the two joins this arm had to add after
its first analyzer run.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg GO rule: source named with a trace for at
least 4 of 5 re-derived drops (or all, if fewer re-derive) +
a named next step. The verdict is GO (5/5 traced + named next
step). Two judgment notes, both disclosed, neither a re-score:

1. ANALYZER FIX, NOT A METRIC CHANGE. The first analyzer run
   judged NO-GO (3/5) because of two instrument bugs (unsplit
   raidTick windows; no TB-restore join). The fix changed the
   instrument, not the GO rule, the prereg, or the corpus: no
   re-sweep, no new seeds, no threshold moved. The original
   NO-GO run is disclosed in this file's Verdict section
   rather than overwritten. A future prereg that wants to
   forbid post-hoc analyzer fixes should say so explicitly —
   this run's prereg explicitly allowed instrument-bug fixes
   with disclosure (pilot-gate clause), and that clause was
   followed.
2. PARITY VOCABULARY. Parity is judged under the rebaseline
   corpus's row vocabulary (defwound rows by context +
   nonworldkill starts), applied identically to both corpora.
   The rebaseline evidence's headline 69 vs the lethality
   census's 67 is a different counting rule (2 raftdraft rows
   with no seq join), reconciled in the rebaseline arm, not
   re-litigated here. This band's defwound wave-4 counts match
   the rebaseline corpus exactly under the shared vocabulary.

Doubts recorded for the NEXT run, never applied here:

1. PATROL/SORTIE ABSENCE. The bypass census is empty on THIS
   band (8 seeds, tableseat-nowait). A band where a patrol or
   sortie meets a wave-4 monster could still produce a
   direct-router gap; the w4damage recorder already captures
   that case by caller class, so a future arm need only re-run
   the census, not rebuild the instrument.
2. RESTORE SEMANTICS. Whether the lingerer restore SHOULD be
   able to raise world HP above its pre-fight value is a design
   call (see Named next step), not something this census
   decides. The census proves the mechanism and its size
   (+65 here); the ruling belongs to Steve or a fix arm
   deciding from his standing intent.
3. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (standing exception,
   fifth-plus round): the tool builds panels from live roots
   and compares panel files (`compare --before <panel.json.gz>
   --after <panel.json.gz> --out <prefix>`), not census rows.
   No panel artifact was faked; the paired sweep tables +
   analyzer outputs (parity EXACT) are the comparison of
   record, as the section-15 substitute.
4. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-28/perseed-w4damage-a/*.json' --metrics
   national,table,wins,exiled` → 3 LOUD lines (national 12→0,
   table −62% 16→6, wins 16→0, n=10 files). Verdict: KNOWN
   ARTIFACT, no investigation, baseline NOT rolled. Two
   independent reasons, both documented (same as the census
   family): (a) the baseline's own regime note forbids this
   comparison (a ~100%-win winseat suite vs a tableseat-nowait
   census substrate); (b) the field-shape artifact repeats
   (per-seed rows carry nationalEver/entered/won, not top-level
   national/table/wins paths; summary.json + analysis.json are
   the 9th and 10th files). The corpus's real wall numbers are
   nationalEver 7/8, table entered 3/8, wins 3/8. No exiled LOUD
   line.

## Infrastructure notes

- Sweep: scripts/test-w4damage-sweep.js, 8 seeds, ~15 min wall
  + detgate ~2 min + sense replays. Corpus:
  evidence/2026-10-28/perseed-w4damage-a/ (8 rows + summary.json
  + analysis.json). Analyzer: scripts/test-w4damage.js (proof
  validator; exit 0 on the re-run, GO 5/5). Sense:
  scripts/test-w4damage-sense.js (NON-MEASURED replay only;
  75104 window d60-d90, 75106 window d69-d146).
- Run logs kept alongside the evidence (not in the corpus dir):
  evidence/2026-10-28/sim-w4damage-a-sweep.log.
- EPERM FLAP (loud, with recovery): during instrument build,
  exec-process writes to this worktree failed with EPERM
  (cp of the 28KB sweep copy truncated to 0 bytes; python
  buffered writes flushed to 0 bytes; `git update-ref` for a
  probe ref failed on the shared .git lock) while small shell
  writes and file-tool writes still worked. Recovery, per the
  local_write_flap_response skill: probe first, then rebuild
  the sweep copy through the file tools in chunks and verify
  with `diff` against the original (96 changed lines, all
  intended — labels, corpus dir, mode label, w4damage layer —
  no transcription drift) plus `node --check`. The original
  rebase sweep was never moved or edited (verified by the
  diff itself). If the flap recurs mid-sweep, the sweep's
  writeFileRetry (8 attempts, backoff) is the first defense;
  per-seed rows are written incrementally, so a crash keeps
  partial data.
- Safe-commit index clobber hit BOTH worker commits (bogus
  staged deletions, commits themselves correct — verified by
  stat + hash before continuing) — repaired via HEAD-blob
  cacheinfo, verified status empty + diff HEAD empty, before
  any sweep ran (prereg) and before judging (instruments).
  The evidence commit below must be checked the same way
  before this run is called done.
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the sense
  script only READS beats on a replay, it adds none to the game).
- Commit: sim-w4damage-a, GO 5/5, zero src/js diff. Branch
  ready, pending coordinator merge; NOT pushed, NOT bumped,
  live NOT verified (coordinator/ship-loop line, not this arm's).
- Heartbeats: tree heartbeat after registration, mid-sweep,
  and after analysis — all landed ("heartbeat sim-w4damage-a").

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-28 — lingerer TB restore can heal a
  toll-wounded monster — a lost TB fight against a lingerer
  writes the fighter's end HP over the world HP, so a
  toll-wounded lingerer (675) can come back at 740 (+65 here);
  fix arm brief in "Named next step" (min() restore vs
  visibility), measured on identical seeds before landing.
- [open] 2026-10-28 — wall wounds are invisible to the village
  — the raid beat names the toll once per raid but never per
  monster, and no beat routes a finishing trip to a
  toll-wounded lingerer; the wall is the largest wave-4 wound
  source on this band (up to 300/night) with zero kill credit.
- [open] 2026-10-28 — raidTick windows conflate toll + defender
  fight — any future raidTick-window measurement must split
  by the in-window fight row (havenRaidTick drives the defense
  beat inside the tick); the w4damage recorder already records
  ffInWindow for this.
