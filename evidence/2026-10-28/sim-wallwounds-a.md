# sim-wallwounds-a — the wall's wounds, kept: lingerer TB restore capped at pre-fight HP

Run: fleshout loop, run fleshout-20261028T0416Z. Axis: scale-onramp
(the blocking axis). Worker: sim-wallwounds-a. Backlog item #1300
(wall-wounds-finished).
Worktree: `~/workspace/worktrees/sim-wallwounds-a` (branch
sim-wallwounds-a).
FIX ARM: one small game-code change (src/js/game.js, tbEnd
lingerer branch), measured before/after on identical seeds.
No [needs-eyes] applies: the fix adds no narration, no UI, no
feel change beyond the wound number — a monster keeps the
wounds it already had instead of coming home healthier. The
sense read below confirms no village language contradicts it.

Preregistration (binding, committed BEFORE any judged sweep and
BEFORE the fix was written):
evidence/2026-10-28/sim-wallwounds-a-prereg.md (commit 9fa26d68e).
Corpus: evidence/2026-10-28/perseed-wallwounds-a/ (before/ +
after/, 8 rows + summary.json each, plus analysis.json).
Instruments (new this arm): scripts/test-wallwounds.js
(analyzer / proof validator), scripts/test-wallwounds-restore.js
(unit proof on real tbEnd). Sweep driver + recorder stack
reused VERBATIM from the w4damage arm (test-w4damage-sweep.js
via its EVID env override — no copy, no transcription drift).
Detgates: PASS on unmodified code AND on fixed code, both on
the old numbers exactly (seed 75101: days 132/132,
tsNationalDay 77 both, no diag surface, no wraps installed).

## Plain words first

A monster that comes over the wall takes the wall's toll — a
quarter of its health, up to 300 in one night — and then, if it
lingers at the treeline, the village's champion may fight it in
a turn-based fight and lose. Before this fix, losing that fight
could hand the monster some of the wall's work back: the fight's
monster is a fresh copy built at full strength, so a monster
that went into the fight at 675 health could come back out at
740 — healthier than the wall left it. Worse, the same monster
fought twice in one day could ratchet all the way back to full
strength: on this band, a lingerer at 300 health went back to
1,200 across two lost fights. The wall wounded monsters that
nobody finished, and lost fights un-wounded them.

After the fix, a lost or fled fight against a lingering raider
can only keep or deepen the wounds the monster already had when
the fight started. The 675-health monster comes home at 675.
The 300-health monster stays at 300 through five lost fights in
a day. A fight that hurts the monster below its pre-fight wounds
still deepens them — the fix caps the restore, it does not erase
fight damage. Titans are untouched: a titan still comes back at
full strength, by design. A won fight still kills, a routed
lingerers still breaks and runs — no restore either way.

What this means for the wave-4 story: the wall's wounds now
stick. A village that watches a toll-wounded lingerer still
cannot SEE those wounds in its own language (the raid beat
names the toll once per raid, never per monster — that
visibility gap is the named next step, not this arm), but the
numbers no longer lie underneath: the wound the wall took stays
taken, so a finishing trip — when the village gets the language
for one — will find the monster where the wall left it.

## Verdict: GO (binding prereg, no re-score)

GO required ALL four legs. All four pass, judged by
scripts/test-wallwounds.js (exit 0, analysis.json):

- (a) REPRODUCTION on unmodified code matches 900 -> 675 ->
  740: the BEFORE corpus contains the 75106 seq 55 case
  exactly (raid toll d127 900 -> 675, wall 225, tollExact;
  TB d129 result lost, same fightId fmgpspipy_49dzce,
  monster fighter end 740/914; oldcore re-entry d129,
  lingering true; actual post-restore world HP 740 from the
  d129 daily snapshot AND from the d130 fight's start HP
  740 — two independent witnesses, never the old formula's
  recomputation). BEFORE parity vs
  evidence/2026-10-28/perseed-w4damage-a/ is EXACT on days,
  gameDays, won, waveReach, nationalEver/Final, table,
  entered, deathTotal, courtship combined, wave-4 defwound
  rows by context, and nonworldkill starts. BEFORE band
  valid: 8 rows, every recorder clean (errs 0, no overflow).
- (b) POST-FIX same seed/case restores to 675 with no crash:
  the AFTER corpus contains the same case (same toll, same
  TB d129 lost, same fighter end 740, same fightId,
  oldcore re-entry d129) and its actual post-restore world
  HP reads 675 (d129 snapshot 675 AND d130 fight start HP
  675). The chain gap for seq 55 moves from -160
  (900 -> 740) to -225 (900 -> 675) — the toll, whole, at
  last. AFTER band valid: 8 rows, every recorder clean.
- (c) FULL 8-SEED BEFORE/AFTER on identical seeds 75101-75108
  (tableseat-nowait VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, 180d death-aware): detgate PASSES on
  both code versions (within-code neutrality, same numbers
  132/132/77 — seed 75101's trajectory is untouched by the
  fix); median survival AFTER 162d = BEFORE 162d (ratio
  1.000, need >= 0.8); starvation AFTER 2 <= BEFORE 2 + 2;
  substrate gate passes on both bands (courtship combined
  121, 8/8 seeds active). In fact the two bands are
  identical on every band total (see table) — the fix
  changes restore numbers, not village fates, on this band.
- (d) NO OTHER RESTORE PATH REGRESSED: the unit proof
  (scripts/test-wallwounds-restore.js, real tbEnd) passes
  all 6 cases post-fix (and failed exactly the 2 healing
  cases pre-fix — RED→GREEN, see below); the corpus-level
  census on the AFTER band finds 15 joined lingerer
  re-entries with ZERO whose snapshot HP exceeds its
  pre-fight HP (BEFORE: 15 joined, 6 healing — see census).

VERDICT: GO. The fix lands as its own commit, pending
coordinator merge; NOT pushed, NOT bumped, live NOT verified
(coordinator/ship-loop line, not this arm's).

## The fix (exact, one line plus its guard)

File: src/js/game.js, tbEnd(), lingerer branch (line 43768
before the fix). The titan branch in the same block is NOT
touched (titans return at full strength by design).

BEFORE:
  o.hp = Math.max(1, Math.min(o.maxHp || o.hp,
    (standing[0] && standing[0].hp) || 1));

AFTER:
  const _preHp = (o.hp != null && isFinite(o.hp)) ? o.hp
    : (o.maxHp || 1);
  o.hp = Math.max(1, Math.min(_preHp,
    (standing[0] && standing[0].hp) || 1));

Why o.hp IS the pre-fight world HP: startCombat lifts the
world object off the world list and builds the TB fighter as
a FRESH copy from mdef.hp range (game.js ~line 33045) — never
from the world monster's current HP. Nothing writes the lifted
object's hp during the fight, so o.hp at tbEnd is the value
the fight started from. The fallback to o.maxHp covers only
the impossible case (o.hp not finite) and can never produce
NaN. In plain words: the restore now takes the smaller of
"what the monster had when the fight started" and "what the
fighter had when the fight ended" — so a lost fight can never
give health back, and a hard fight can still take more away.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max). Sweep wall time ~15 min per band (plus detgates
  ~2 min each and sense replays).
- Base: b1eb04456. `git diff 3264dbb80..HEAD -- src/` is EMPTY
  (all intervening commits DIAG/instrument/evidence only), so
  BEFORE parity vs the w4damage band was the expected outcome
  — and it held exactly.
- Substrate-activation gate: band courtship combined = 121
  (8/8 seeds active) on BOTH bands — GATE PASSES twice.

## Wall numbers (THIS band only, never pooled)

| field | BEFORE (unmodified) | AFTER (fix) |
|---|---|---|
| national ever / final | 7/8 / 5/8 | 7/8 / 5/8 |
| table invited / entered | 6/8 / 3/8 | 6/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 5/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 162d (days: 90, 114, 132, 146, 162, 177, 180, 180) | 162d (identical days) |
| starvation deaths | 2 (both 75108) | 2 (both 75108) |
| deaths total | 299 | 299 |

Per-seed ends (identical before/after): 75101 won lesser d132
(wave 4, national); 75102 village-lost d177 (wave 4, global);
75103 survived d180 (wave 4, regional, table invited, never
entered); 75104 won lesser d90 (wave 3, national); 75105 won
lesser d162 (wave 3, global); 75106 village-lost d146 (wave 4,
regional); 75107 survived d180 (wave 3, global, never tabled);
75108 village-lost d114 (wave 4, regional). Arc IV (table
entered): 3/8. All three wins are lesser-seat wins. The full
seat is still nobody's story; wave 5 is still unreached.
The fix moves no village fate on this band — it moves wound
numbers, which is what it was built to do.

## The traced case, before and after (event rows, same fight)

Seed 75106, seq 55, eulogy — fightId fmgpspipy_49dzce both sides:

| step | BEFORE | AFTER |
|---|---|---|
| raid toll d127 | 900 -> 675, wall 225, tollExact | identical |
| TB start d129 | tileHp 675, tileMax 900 | identical |
| TB end d129 | result lost, fighter 740/914 | identical |
| oldcore tbEnd d129 | kind re-entry, lingering true | identical |
| daily snapshot d129 | 740 | 675 |
| next fight start d130 | tileHp 740 (same fightId family: fmgpspiqs_4jsyll, fighter 1049/1072) | tileHp 675 (same fight, same fighter 1049/1072) |
| chain gap (defwound) | 900 -> 740, delta -160 | 900 -> 675, delta -225 |

The d130 second fight is itself a witness: BEFORE, the d129
restore's 740 is the d130 fight's start HP; AFTER, the d129
fix's 675 is. The d130 restore itself has no snapshot witness
on either side (no later snapshot contains seq 55 — the
lingerer's later fate is off the snapshot record), so it is
reported as unwitnessed, not as 675 or 1049.

## The restore census (all joined lingerer re-entries)

Join: NWK start (tileMonster seq, pre-fight HP) -> tbdmg end
(same fightId, lost/fled only) -> oldcore re-entry (same day,
same seq) -> actual restored HP from the first w4damage daily
snapshot on/after the re-entry day containing the seq. The
snapshot is an end-of-day value: for a seq fought twice in one
day it reflects the day's LAST restore, and the day's
pre-fight HPs are non-increasing (each restore caps at its
own pre-fight HP, and the next fight starts from the restored
value) — so the gate "snapshot HP <= pre-fight HP" is sound
for every fight of the day, not just the last.

BEFORE: 15 joined lingerer re-entries, 6 healing (snapshot HP
above pre-fight HP):

| seed | seq | day | pre-fight | fighter end | snapshot | healed by |
|---|---|---|---|---|---|---|
| 75102 | 21 | 172 | 300 | 1074 | 1200 (= maxHp, after a second same-day fight: 1074 -> 1200) | 900 |
| 75102 | 21 | 172 | 1074 | 1264 | 1200 | 126 |
| 75103 | 50 | 118 | 712 | 844 | 844 | 132 |
| 75106 | 45 | 90 | 900 | 1150 | 1150 | 250 |
| 75106 | 47 | 99 | 719 | 1002 | 1000 | 281 |
| 75106 | 55 | 129 | 675 | 740 | 740 | 65 |

The 75102 seq 21 pair is the ratchet in full: a lingerer at 300
health, fought twice in one day and lost to both times, ended
the day at 1,200 — full strength — because each restore capped
at maxHp instead of at the wounds it went in with.

AFTER: 15 joined lingerer re-entries, 0 violations. The same
six rows now read: 75102 seq 21 d172: pre 300, fighter 1074,
snapshot 300 (all five same-day fights start at 300 and restore
to 300); 75103 seq 50: 712 (was 844); 75106 seq 45: 900 (was
1150); 75106 seq 47: 719 (was 1000); 75106 seq 55: 675 (was
740). No titan re-entries joined on this band (titan full
restore is gated by the unit proof, not the census).

## Unit proof: RED -> GREEN on real tbEnd

scripts/test-wallwounds-restore.js drives the REAL tbEnd on a
loaded game (shared sim-harness, seed 42, real eulogy mdef).
Scaffolding, stated: 'lost' cases set state.phoenixLink so the
'lost' tail skips playerDeath/succession (the flag is read
nowhere in the restore block, so it cannot change the asserted
behavior — it only keeps the test game alive to read the
assertion). The world object sits on a monster-free tile, NOT
in the world list at tbEnd time (lifted, as startCombat leaves
it).

Pre-fix run (unmodified code): cases 1-2 FAIL (restored 740 and
800 against expected 675), cases 3-6 PASS. Post-fix run: ALL 6
PASS — lingerer lost above pre-fight -> pre-fight (675);
linger­er fled above pre-fight -> pre-fight (675); lingerer
lost below pre-fight -> fighter end (500, wounds deepen);
titan lost -> full maxHp (1200, unchanged); lingerer won ->
not re-pushed; lingerer routed -> not re-pushed. No case threw.

## Sense-testing read

Non-measured replay only (scripts/test-w4damage-sense.js
VERBATIM, SEED=75106, DAYS=180, FROM_DAY=69), on the FIXED code.
Replay text proves wording and presence only, never counts —
and the replay trajectory SHIFTS from the judged corpus (its
d127 raid carries different raiders than the corpus's seq-55
toll case), so beats below are the village's story in words,
not day-exact claims about the corpus.

What the replay shows: the raid beat still names the toll once
per raid ("The palisade's stakes take their toll as they come
over the wall") with no numbers and no victims, exactly as the
w4damage arm found; lingerers gorge nightly with kcal amounts
("The lingering The Big Beast gorges at the treeline — 1,600
kcal gone"); the treeline chorus holds ("stops at the
treeline — pacing, unwilling. The walls end the argument. It's
still out there."). What it does NOT show: any beat claiming
a monster came back healthier after a lost fight, any beat
naming a TB restore, or any beat routing a finishing trip to a
toll-wounded lingerer. The fix changes no words, and nothing in
the village's language contradicts the new behavior: the wall
takes its toll, the wounds stay taken, and the story never
claims otherwise. The sense question — does a lost fight
against a toll-wounded lingerer read sensically after the fix?
— answers yes, by absence: no line in the game ever said the
monster healed, so the numbers now agree with the words. The
remaining gap is visibility, not coherence (see Named next
step).

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and go
home — one of them (75104) in just 90 days, without ever meeting
a wave-4 monster. Three more die, and two survive the horizon
without ever sitting the table. Five reach wave 4, none reaches
wave 5, and the full seat is still nobody's story. The fix
changes none of that on this band — and that is the honest
result: one line that stops lost fights from healing monsters
does not, by itself, get any village to wave 5 or the full seat.
What it does is stop the numbers from lying underneath the
story: the wall is still the biggest single wound-maker on
wave-4 monsters (up to 300 in one night), and now its wounds
are wounds that stay. The villages that fight wave 4 and kill
nothing still kill nothing — but the monsters they wound no
longer quietly heal between meetings, and a village that learns
to finish a toll-wounded lingerer will find it where the wall
left it.

## Blanks filled or documented

- FILLED (fix, proven before/after on identical seeds): the
  w4damage arm's named next blank, option (a) — lingerer TB
  restore takes min(pre-fight world HP, fighter end HP), so a
  lost TB fight never heals a toll wound. Proven on the traced
  case (740 -> 675), on the full 15-row restore census (6
  healing restores -> 0), and on real tbEnd (RED->GREEN, 6/6).
- FILLED (mechanism, read from code + corpus): TB fighters are
  fresh copies from mdef range, NOT from world HP — that is
  why a 675-HP lingerer can fight as a 914-HP fighter and why
  the old maxHp cap healed; and same-day repeat fights could
  ratchet a lingerer back to full strength (300 -> 1200 across
  two lost fights on 75102). Both are now closed by the same
  one-line cap.
- DOCUMENTED, NOT FIXED (named next step): wall wounds are
  still invisible to the village — the raid beat names the
  toll once per raid but never per monster, and no beat routes
  a finishing trip to a toll-wounded lingerer. That is the
  w4damage arm's option (b), the visibility alternative: name
  toll-wounded lingerers in the village's language (a treeline
  report, a muster note) so finishing one is a real choice.
  This arm chose option (a) per its brief; option (b) is the
  next arm's work, not this arm's silent pivot and not
  re-judged here.
- CARRIED (not chased here): the full seat at 0/8 and wave 5
  at 0/8 on this band (the scale-onramp axis work continues);
  the empty nonat x w4 class (w5chain-a); the panel
  corpus-ingest mode (tooling blank, see below).

## Named next step (fix arm or instrument gap)

VISIBILITY ARM (no game change lands from this arm beyond the
min() cap): name toll-wounded lingerers in the village's
language so a finishing trip is a real choice — a treeline
report naming the wounded monster, a muster note, or a raid
beat that names victims and toll amounts. Measure on identical
seeds whether toll-wounded lingerers get finished more often
(finishes, not just wound counts), and whether the village's
language ever claims a healed lingerer. Do NOT re-score this
arm's GO.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg GO rule: all four legs (a) reproduction
900 -> 675 -> 740, (b) post-fix restore 675 with no crash,
(c) 8-seed before/after gates (detgate, median >= 0.8x,
starvation <= control+2, substrate gate), (d) no other restore
path regressed. The verdict is GO (4/4 legs). Two judgment
notes, both disclosed, neither a re-score:

1. ANALYZER REFINEMENT, NOT A METRIC CHANGE. The analyzer's
   first run judged GO with 17 joined lingerer re-entries,
   including 2 rows that paired a won/routed TB end with a
   sibling fight's same-day re-entry row (same seq, same day)
   — a join artifact, since a re-entry can only come from a
   lost/fled end. The join was tightened to lost/fled ends
   only and re-run: 15 joined, BEFORE healing still 6, AFTER
   violations still 0, legs unchanged. The GO rule, the
   prereg, and the corpora were NOT changed; the first run's
   output is disclosed here rather than hidden.
2. SNAPSHOT WITNESS. Actual restored HP is read from the first
   w4damage daily snapshot on/after the re-entry day, never
   recomputed from the old formula (the w4damage analyzer's
   min(worldMax, fighterHp) recomputation would report 740 on
   BOTH sides and is NOT a measurement of restored HP). For
   same-day repeat fights the snapshot reflects the day's last
   restore; the gate is still sound because the day's pre-fight
   HPs are non-increasing under the fix. Rows with no snapshot
   witness (e.g. the seq-55 d130 restore) are reported as
   unwitnessed, never as passing values.

Doubts recorded for the NEXT run, never applied here:

1. TRAJECTORY IDENTITY. The AFTER band is identical to BEFORE
   on every band total, including per-seed days. That is
   consistent with the fix (restore numbers move, village fates
   don't, on this band) but it also means this band cannot show
   whether keeping toll wounds ever changes a village's fate —
   a band where a kept wound tips a later fight would be needed
   for that claim, and this arm does not make it.
2. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (standing exception, sixth
   round): its `compare` takes --before/--after panel.json.gz
   files built from live roots, not census rows. No panel
   artifact was faked; the paired before/after sweep tables +
   analyzer outputs (this band vs itself, identical
   seeds/policy/substrate) are the comparison of record, as
   the section-15 substitute.
3. TELEMETRY DEVIATION CHECK (loop body step 10, run AFTER
   writing evidence, once per band): BEFORE band and AFTER band
   produce IDENTICAL LOUD lines, so the fix introduces no new
   deviation — verdict KNOWN ARTIFACT, baseline NOT rolled:
   `national disappeared: baseline 12 -> current 0 (n=9)`,
   `table swung -62%: baseline 16 -> current 6 (n=9)`,
   `wins disappeared: baseline 16 -> current 0 (n=9)`, no
   exiled LOUD line on either band. Two independent reasons,
   same as the census family: (a) the baseline's own regime
   note forbids this comparison (a ~100%-win winseat suite vs
   a tableseat-nowait census substrate); (b) the field-shape
   artifact repeats (per-seed rows carry nationalEver/entered/
   won, not top-level national/table/wins paths — table reads
   6 only because rows carry a top-level `table` invited flag;
   national/wins read 0 because no such top-level path exists).
   The corpus's real wall numbers are nationalEver 7/8, table
   entered 3/8, wins 3/8, identical on both bands.

## Infrastructure notes

- Sweep: scripts/test-w4damage-sweep.js VERBATIM via EVID
  override (before/after dirs), 8 seeds each, ~15 min wall per
  band + detgates ~2 min each + sense replays. Corpus:
  evidence/2026-10-28/perseed-wallwounds-a/ (before/ + after/
  with 8 rows + summary.json each, analysis.json at top).
  Analyzer: scripts/test-wallwounds.js (proof validator; exit
  0, GO 4/4 on the refined run). Unit proof:
  scripts/test-wallwounds-restore.js (RED pre-fix 2 fail,
  GREEN post-fix 6/6). Sense:
  scripts/test-w4damage-sense.js VERBATIM (NON-MEASURED
  replay only; 75106 window d69-d146).
- Safe-commit index clobber hit the prereg commit (bogus staged
  deletion, commit itself correct — verified by stat + hash
  before continuing) — repaired via HEAD-blob cacheinfo,
  verified status empty + diff HEAD empty, before any sweep
  ran. The fix/instruments/evidence commit below must be
  checked the same way before this run is called done.
- No EPERM flap this run. check.js --quick: 278 passed, 9
  failed in 584s — and all 9 failures were PROVEN pre-existing
  by re-running exactly those 9 scripts on the fix reverted
  (all 9 still exit 1 on unmodified code): godpath
  test-hide-discovery, test-measurement-comparison,
  test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-sw-audio-cache-20261012,
  test-establishment-r20-fixes-20261020. None touches the
  lingerer restore; the measurement-proof failures are the
  retained-proof freshness gate (inputs not current), which
  the base's own DIAG/instrument commits already trip. The
  fix was re-applied after the revert-test and re-verified
  (identical 12-insertion diff, unit proof 6/6, node --check
  clean) before committing.
- Branch ready, pending coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line, not
  this arm's).
- Heartbeats: tree heartbeat after registration, mid-sweeps,
  and after analysis — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [fixed] 2026-10-28 — lingerer TB restore healed toll-wounded
  monsters — fixed by min(pre-fight world HP, fighter end HP)
  in tbEnd (game.js lingerer branch only); proven GO 4/4 on
  identical seeds, 6 healing restores -> 0, unit RED->GREEN.
- [open] 2026-10-28 — wall wounds are invisible to the village
  — the raid beat names the toll once per raid but never per
  monster, and no beat routes a finishing trip to a
  toll-wounded lingerer; visibility arm is the named next step
  (see above).
- [open] 2026-10-28 — same-day repeat TB fights can stack
  restores — closed for healing by this fix (pre-fight HPs are
  now non-increasing through the day), but a lingerer fought
  five times in one day (75102 seq 21) is itself a pacing
  observation for a future arm: the sim policy re-engages the
  same treeline monster without limit.
