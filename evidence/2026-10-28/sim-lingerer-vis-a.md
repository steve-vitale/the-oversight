# sim-lingerer-vis-a — naming the wall's wounds does not finish anyone: visibility alone moves nothing

Run: fleshout loop, run fleshout-20261028T0527Z. Axis: scale-onramp
(the blocking axis). Worker: sim-lingerer-vis-a. Tracker blank 1 —
visibility for toll-wounded lingerers (the open half of the
wallwounds fix).
Worktree: `~/workspace/worktrees/sim-lingerer-vis-a` (branch
sim-lingerer-vis-a).
VISIBILITY ARM: one small game-code narration change, measured
before/after on identical seeds, then REVERTED byte-clean on a
NO-GO verdict (see below). No game-code change lands from this
arm. What lands is the measurement + instruments + this evidence.
No [needs-eyes] commit exists because no game change lands.

Preregistration (binding, committed BEFORE any judged sweep and
BEFORE the game-code change):
evidence/2026-10-28/sim-lingerer-vis-a-prereg.md (commit
76de411dd, plus the instrument-fix amendment committed as
9001918b1 before the armed band ran — see "Instrument fix"
below).
Corpus: evidence/2026-10-28/perseed-lingerer-vis-a/ (control/ +
armed/, 8 rows + summary.json each, plus analysis.json).
Instruments (new this arm): scripts/test-lingerer-vis.js
(analyzer / proof validator), scripts/test-lingerer-vis-proof.js
(unit + composability proof), scripts/test-lingerer-vis-sense.js
(sense replay, NON-MEASURED, clause-presence only). Sweep driver
+ recorder stack reused VERBATIM from the w4damage arm
(test-w4damage-sweep.js via its EVID env override — no copy, no
transcription drift).
Detgates: PASS on unmodified code AND on armed code, both on
the old numbers exactly (seed 75101: days 132/132,
tsNationalDay 77 both, no diag surface, no wraps installed).

## Plain words first

The wall wounds monsters that come over it — a quarter of their
health in one night — and the monsters nobody meets stay at the
treeline, wounded, gorging every night. Until this arm, the
village never said so out loud about any particular monster:
the raid beat said "the palisade's stakes take their toll" once
per raid, and the birth line for each lingerer said only
"Nobody met it — it's still out there." This arm gave the
village that one sentence: when a wounded raider becomes a
lingerer, the line now adds "The stakes cut it on the way over
the wall — it carries the wound at the treeline."

The sentence works. In a replay it fires 14 times, naming
Spool, The Eulogy, The Big Beast, and others, always and only
when a palisade stood and the monster was actually wounded —
and a lingerer born on a wall-less night (d8, Lockpick) still
gets no clause, exactly as gated. And it changes nothing at
all about what any village does. On identical seeds, the armed
villages live the same days, die the same deaths, meet the same
lingerers, and finish the same 11 of them as the control
villages — the two corpora are byte-identical, row for row.
That is not a broken experiment; it is the answer to the
question this arm asked. Words are not an input to any decision
in this game. No policy reads narration, the scholar's march
reads hit points, and the village's own finishing trip — the
sortie — has no driver in this substrate at all. Naming a wound
cannot finish a monster. Only a policy that chooses wounded
monsters as targets can, and that policy does not exist yet
for this substrate. It is the named next blank below, not a
silent pivot and not re-judged here.

## Verdict: NO-GO for landing (binding prereg, no re-score)

GO required ALL legs. Leg (c), the deciding leg, misses;
everything else passes. Judged by scripts/test-lingerer-vis.js
(exit 0, bands valid) plus the sense replays and detgates:

- (a) CONTROL PARITY vs wallwounds AFTER: EXACT. Per-seed
  days, gameDays, won, waveReach, nationalEver/Final, table,
  entered, deathTotal, courtship combined — zero diffs on all
  8 seeds (analyzer parity.exact = true). The base's only
  src/ change since the wallwounds band is a build.js version
  stamp, and trajectories confirm it moves nothing.
- (b) BEAT FIRES: PASS. Armed-code sense replay (75106, 180d,
  NON-MEASURED): 14 clause lines. Control-code sense replay
  (same seed): 0 clause lines. Presence only, never counts.
- (c) ENGAGEMENT DELTA: FAIL — the deciding miss. Engaged
  toll-wounded lingerer instances: CONTROL 36, ARMED 36
  (delta 0, need >= +1). Finished instances: CONTROL 11,
  ARMED 11 (delta 0, need >= 0 — this half passes, but the
  leg needs both). The corpora are BYTE-IDENTICAL on all 8
  row files (cmp clean), so the delta is not "small" — it is
  structurally zero, exactly as the prereg's structural
  prediction said: say() is output-only and no policy reads
  narration.
- (d) COST BAR: PASS (trivially, on identical bands).
  Starvation ARMED 2 <= CONTROL 2 + 2; ARMED-only dead seeds:
  none, starvation 0 <= 2; median ARMED 162d >= 0.8 x CONTROL
  162d (ratio 1.000).
- (e) SUBSTRATE GATE: PASS on both bands (courtship combined
  121, 8/8 seeds active, both bands).
- (f) DETGATE on 75101: PASS on both code versions
  (within-code neutrality; 132/132/77 both — NO base drift;
  the old numbers hold on this base).
- (g) BAND VALIDITY: PASS (8 rows per band, every recorder
  clean, errs 0, no overflow).

VERDICT: NO-GO. The game-code change is REVERTED byte-clean
(git diff for src/js/havenGrowth.js is empty after revert,
node --check clean, proof test back to RED on the clause
assertions — see "Revert proof" below). Evidence + instruments
+ corpora land; no game commit, no [needs-eyes] commit. The
visibility sentence is proven to fire and proven to move
nothing, and it stays out of the game until an acting policy
exists that could use it — landing words that change nothing
would be decoration, and this loop does not land decoration.

## The change (written, measured, then reverted — exact text)

File: src/js/havenGrowth.js, defenders loop else-branch
("Nobody met …" linger-birth line), one say call only. The
original sentence stayed byte-identical; one clause was
appended when the gate held:

  GATE: palisade (local boolean, already in scope) AND
  m.hp < m.maxHp (post-toll wound visible at linger-birth).
  APPENDED: " The stakes cut it on the way over the wall — it
  carries the wound at the treeline."

No new say call, no RNG draw, no state write, no numbers, no
wave names, no true names (mname is knowledge-gated, as the
line already was). The second linger-birth site (the
pendingEncounter branch's generic line) was deliberately NOT
touched — one change, one site, disclosed as a known gap.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max). Sweep wall time ~7 min per band (plus detgates
  ~2 min each and sense replays ~1 min each).
- Base: 5ef4d5bad (wallwounds fix included; src/ diff since
  the wallwounds AFTER band is one build.js stamp line only).
- Substrate-activation gate: band courtship combined = 121
  (8/8 seeds active) on BOTH bands — GATE PASSES twice.

## Wall numbers (THIS band only, never pooled — identical both bands)

| field | CONTROL | ARMED |
|---|---|---|
| national ever / final | 7/8 / 5/8 | 7/8 / 5/8 |
| table invited / entered | 6/8 / 3/8 | 6/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 5/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 162d (days: 90, 114, 132, 146, 162, 177, 180, 180) | 162d (identical days) |
| starvation deaths | 2 (both 75108) | 2 (both 75108) |
| deaths total | 299 | 299 |

Per-seed ends (identical both bands): 75101 won lesser d132
(wave 4, national); 75102 village-lost d177 (wave 4, global);
75103 survived d180 (wave 4, regional, table invited, never
entered); 75104 won lesser d90 (wave 3, national); 75105 won
lesser d162 (wave 3, global); 75106 village-lost d146 (wave 4,
regional); 75107 survived d180 (wave 3, global, never tabled);
75108 village-lost d114 (wave 4, regional). Arc IV (table
entered): 3/8. All three wins are lesser-seat wins. The full
seat is still nobody's story; wave 5 is still unreached.
The visibility sentence moves no village fate on this band —
because it cannot, by construction, and the byte-identical
corpora prove it rather than assert it.

## The census (toll-wounded lingerers, both bands identical)

Population (pre-registered definition): a spawnsrc seq with an
observed raidTick toll row (tollExact, wall > 0) AND a later
daily snapshot with lingering=true. 40 instances across 8
seeds (75107: 0 — its 4 toll raiders never lingered).

| band | instances | engaged | finished |
|---|---|---|---|
| CONTROL | 40 | 36 | 11 |
| ARMED | 40 | 36 | 11 |

Event rows behind "engaged" (instance counted once; a single
TB fight yields both a start and an end row): fieldFight 37,
defwound resolve 37, nonworldkill TB starts 53, oldcore TB
ends 53. Finishes by source: ALL 11 are scholar TB wins
(joined by fightId); ZERO are villager field/resolve vKills.
That split is the sharpest single number in this arm: after a
lingerers is named at the treeline, villagers in the field
never finish it — only the scholar, in a turn-based fight the
scholar walks into, does. The 4 never-engaged instances:
75102 seq 26 influencer (toll d175, linger d176 — the village
died d177, one night of treeline); 75102 seq 28 eulogy (same
window); 75103 seq 46 terms_of_service (toll d127, linger
d128, never met again before the d180 horizon — a wave-3
lingerers that sat 52 days at the treeline unengaged);
75103 seq 51 callback (toll d177, linger d178, horizon d180).
The remaining 25 engaged-but-unfinished instances are the
pool a wound-selective policy would work on — met, fought,
never finished.

## Acting-policy finding (task step 2, the durable result)

- EXISTS, UNCOMPOSED, NOT WOUND-SELECTIVE:
  scripts/policies/gorgedrive.js — the only lingerer-answering
  policy in the repo: scholar marches out (travelTo +
  triggerEncounter) to a lingering monster, haven-tile-first,
  scholar-HP-gated, party-gated. It wraps leadfeast, NEVER
  tableseat-nowait, in any sweep. It reads worldMonsters().hp
  directly and sorts haven-first — it does not read narration
  and does not prefer wounded lingerers. Composability over
  tableseat-nowait is PROVEN by the proof test
  (withGorgeDrive builds, gate OFF delegates, gate ON arms) —
  but composition was deliberately NOT judged here: composing
  it into both bands would move both bands equally and still
  yield zero narration-attributable delta, while breaking
  substrate-verbatim parity with the prior bands.
- NO OTHER ACTING ROUTE: no policy in the substrate calls
  answerLingerer('sortie') — the village's own played answer
  (mustered fighters, real rations, blow-by-blow fieldFights)
  has no sim driver. Sortie fieldFights in this corpus: 0.
  No "travel to known monsters" finishing policy exists
  (travelTo uses are forage/expedition routing; the only
  lingerer-targeted travel is gorgedrive's). No policy parses
  say-lines, transcripts, or awayNews to decide anything.
- The honest summary: the village has words for a finishing
  trip (sortie button, gorge-drive march) but this substrate
  has no wound-selective finishing driver. Visibility was
  never the binding constraint; targeting is.

## Sense-testing read

Non-measured replays only (scripts/test-lingerer-vis-sense.js,
SEED=75106, 180d, FROM_DAY=0, on both code versions).
Replay text proves wording and presence only, never counts —
and the replay trajectory shifts from the judged corpus, so
beats below are the village's story in words, not day-exact
claims about the corpus.

What the armed replay shows: 14 clause lines, all in the
same shape — "Nobody met Spool — it's still out there at the
treeline. It'll gorge every night until it's driven off. The
stakes cut it on the way over the wall — it carries the wound
at the treeline." (d72 Spool, d85 Eulogy/Redactor/Ad Break,
d127 Big Beast, d141 Eater/Cliffhanger, among others).
The gate reads honestly in the same replay: the d8 raid has
"No walls. No warning but the noise," and its lingerer
(Lockpick) gets the bare line with NO clause; the palisade
comes online d17, and clauses start only after. What it does
NOT show: any line claiming a lingerer came back healed or
full-strength, any line routing a finishing trip to a named
wounded lingerer, or any line contradicting the wound. The
sense question — when a toll-wounded lingerer is born, does
the village name its wound in its own language? — answers
yes, cleanly, in words a player would read. The gap is not
the sentence. The gap is that no one in the village then
acts on it.

ONE ENCOUNTER, IN PLAIN WORDS (non-measured replay, never a
count): on d127 of the replay, a raid comes over a standing
palisade, and one raider — The Big Beast — is met by nobody.
The village says so out loud, names it, warns that it will
gorge every night until driven off, and adds that the stakes
cut it on the way over — it carries the wound at the
treeline. A player reading that line knows three things a
player could act on: what it is, where it is, and that it is
hurt. What the player is NOT offered in that moment is a
button, a march, or a muster for that wounded beast in
particular — the sortie exists on the beats panel for
lingerers in general, and the scholar's own march (in sims,
nobody's march) is not wound-selective. The encounter reads
sensically; the choice it implies is the blank.

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and
go home — one of them (75104) in just 90 days, without ever
meeting a wave-4 monster. Three more die, and two survive the
horizon without ever sitting the table. Five reach wave 4,
none reaches wave 5, and the full seat is still nobody's
story. Forty toll-wounded lingerers hold the treeline across
these villages; 36 get met again somehow — patrols, defenders,
the scholar stumbling into them — and 11 get finished, every
one of them by the scholar's own sword in a turn-based fight.
Villagers fighting in the field finish none of them. One
wave-3 beast sat wounded at a treeline for 52 days and nobody
ever went for it. Naming the wound did not change any of
that, because naming was never what was missing. What is
missing is someone in the village deciding "that hurt one, at
our treeline, tonight" — and walking out to finish it.

## Blanks filled or documented

- MEASURED, NOT FIXED (the arm's result): the visibility
  sentence fires (14 lines in replay, 0 on control code) and
  moves nothing (byte-identical corpora, engagement delta 0,
  finish delta 0). The wall-wounds visibility blank is now a
  measured negative, not an open guess: words alone are not a
  lever on this substrate.
- DOCUMENTED, NOT FIXED (named next step): a wound-selective
  lingerer answer composed with this substrate — either
  gorgedrive composed over tableseat-nowait WITH
  wounded-first targeting (lowest hp fraction first, among
  lingerers, within its existing HP/party gates), or a
  sortie-answering policy that calls answerLingerer('sortie')
  when a toll-wounded lingerer is at the treeline. Measure
  on identical seeds whether toll-wounded lingerers get
  finished more often (finishes, not just engagements), with
  the same cost bar. Do NOT re-score this arm's NO-GO.
- CARRIED (not chased here): the full seat at 0/8 and wave 5
  at 0/8 on this band (the scale-onramp axis work continues);
  the pendingEncounter-branch linger-birth line (generic,
  no wound clause — second site, disclosed, not silently
  left); the empty nonat x w4 class (w5chain-a); the panel
  corpus-ingest mode (tooling blank, see below).
- FILLED (mechanism, read from code + corpus): TB fights are
  the ONLY finishing channel for toll-wounded lingerers on
  this substrate (11/11 finishes); villager field finishes
  are 0/40 instances despite 37 field + 37 resolve event
  rows — villagers meet lingerers and do not finish them.

## Named next step (acting-policy arm, not a narration arm)

WOUND-SELECTIVE FINISHING (no game change lands from this
arm): compose gorgedrive over tableseat-nowait with
wounded-first lingerer targeting, or build a sortie-answering
policy for toll-wounded lingerers, and measure finishes on
identical seeds against this arm's control corpus
(40 instances, 36 engaged, 11 finished — all TB). The
visibility sentence from this arm may be re-proposed WITH
that policy (a player-facing sentence plus a driver that
acts on it is a different claim than the sentence alone),
but it must be judged again from scratch, never carried
forward on this arm's firing proof. Do NOT re-score this
arm's NO-GO.

## Revert proof

- git diff for src/js/havenGrowth.js after revert: EMPTY
  (byte-clean; the original line restored exactly).
- node --check src/js/havenGrowth.js: clean.
- Proof test scripts/test-lingerer-vis-proof.js: GREEN on
  armed code (10/10) before revert; RED after revert (3
  clause assertions fail, 7 pass — composability still
  green), proving the revert removed exactly the clause and
  nothing else.
- Armed corpus rows were generated WITH the clause in the
  code and are byte-identical to control rows — the clause
  cannot have changed trajectories, and the revert cannot
  either (it restores the control code exactly).

## Instrument fix (disclosed, pilot-stage)

The analyzer's first smoke run used day >= linger-start as
the engagement window, which collides with the prereg's NEVER
clause when the first lingering snapshot falls on the toll
day itself (toll-day defender fights would count as
"engagements"). The window was corrected to day STRICTLY
AFTER the toll day, the prereg was amended in the same commit
(9001918b1, before the game change and before the armed
band), and the analyzer was re-run on CONTROL: numbers
UNCHANGED (40 instances, 36 engaged, 11 finished) — the
collision was theoretical on this band, but the rule is now
the prereg's rule, not the analyzer's accident. Original
pilot rows were kept, never overwritten.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg GO rule: parity (a), beat fires (b),
engagement delta (c), cost bar (d), substrate gate (e),
detgate (f), band validity (g). The verdict is NO-GO on leg
(c) alone; legs (a), (b), (d), (e), (f), (g) pass. The
structural prediction stated in the prereg (words-only
change predicted to miss leg (c) with byte-identical bands)
is CONFIRMED, not used as an excuse: the prediction was
written before the armed band ran, and the armed band is
what confirmed it. Two judgment notes, both disclosed,
neither a re-score:

1. ENGAGEMENT IS ALREADY HIGH (36/40) WITHOUT VISIBILITY.
   That does not weaken the NO-GO: the GO bar was a DELTA
   (+1 engaged), and the delta is 0. It does reframe the
   next arm's target: the pool is not "unmet lingerers"
   (only 4) but "met, never finished" (25) plus the 4
   unmet — and the finishing channel to fix is the village's
   own (0 field finishes), not the scholar's TB (11).
2. PANEL. scripts/balance-panel.js compare requires
   --before/--after panel.json.gz files built from live
   roots; it has NO corpus-ingest mode for a single-arm
   census corpus (standing exception, seventh round —
   confirmed again this run by its usage error). No panel
   artifact was faked; the paired control/armed sweep tables
   + analyzer outputs (this band vs itself, identical
   seeds/policy/substrate, byte-identical rows) are the
   comparison of record, as the section-15 substitute.
3. TELEMETRY DEVIATION CHECK (loop body step 10, run AFTER
   writing evidence, once per band): CONTROL band and ARMED
   band produce IDENTICAL LOUD lines, so the change introduces
   no new deviation — verdict KNOWN ARTIFACT, baseline NOT
   rolled: `national disappeared: baseline 12 -> current 0
   (n=9)`, `table swung -62%: baseline 16 -> current 6
   (n=9)`, `wins disappeared: baseline 16 -> current 0
   (n=9)`, no exiled LOUD line on either band. Two
   independent reasons, same as the census family: (a) the
   baseline's own regime note forbids this comparison (a
   ~100%-win winseat suite vs a tableseat-nowait census
   substrate); (b) the field-shape artifact repeats (per-seed
   rows carry nationalEver/entered/won, not top-level
   national/table/wins paths — table reads 6 only because
   rows carry a top-level `table` invited flag; national/wins
   read 0 because no such top-level path exists). The
   corpus's real wall numbers are nationalEver 7/8, table
   entered 3/8, wins 3/8, identical on both bands.

## Infrastructure notes

- Sweep: scripts/test-w4damage-sweep.js VERBATIM via EVID
  override (control/ + armed/ dirs), 8 seeds each, ~7 min
  wall per band + detgates ~2 min each + sense replays ~1
  min each. Corpus:
  evidence/2026-10-28/perseed-lingerer-vis-a/ (control/ +
  armed/ with 8 rows + summary.json each, analysis.json at
  top). Analyzer: scripts/test-lingerer-vis.js (proof
  validator; exit 0, bands valid, leg (c) miss). Proof:
  scripts/test-lingerer-vis-proof.js (RED pre-change 3 fail,
  GREEN post-change 10/10, RED post-revert 3 fail).
  Sense: scripts/test-lingerer-vis-sense.js (NON-MEASURED
  replay only; 75106 window full 180d).
- Safe-commit index clobber hit BOTH instrument commits
  (bogus staged deletions for files byte-identical to HEAD
  — commit itself correct, verified by stat + hash before
  continuing) — repaired via HEAD-blob cacheinfo, verified
  status clean + diff HEAD empty, before any sweep ran on
  the affected state. The final commit below must be checked
  the same way before this run is called done.
- No EPERM flap this run. check.js --quick: 279 passed, 8
  failed in 749s. The 8 failures are a SUBSET of the 9
  wallwounds proved pre-existing by revert-test on this same
  base family (godpath test-hide-discovery,
  test-measurement-comparison, test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-establishment-r20-fixes-20261020); the ninth
  (test-sw-audio-cache-20261012) passes in this run, which
  accounts for 279 vs wallwounds' 278 passes on the same 287
  scripts. The game code here is reverted byte-clean to base,
  so no failure can come from this arm's change; the new
  instrument scripts are not in the quick list (287 scripts
  both runs) and were verified separately (analyzer exit 0,
  proof RED→GREEN→RED, sense 0→14 lines).
- Branch ready, pending coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line, not
  this arm's).
- Heartbeats: tree heartbeat after registration, mid-sweeps,
  and after analysis — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [measured-NO-GO] 2026-10-28 — lingerer wound visibility —
  the linger-birth clause fires (14 lines in replay) and moves
  nothing: control/armed corpora byte-identical, engagement
  delta 0, finish delta 0. NO-GO for landing; change reverted
  byte-clean. Words are not a lever on this substrate.
- [open] 2026-10-28 — wound-selective lingerer finishing is
  the missing policy — gorgedrive exists but is uncomposed
  with tableseat-nowait and not wound-selective; no policy
  calls answerLingerer('sortie'); villager field finishes of
  toll-wounded lingerers are 0/40 while scholar TB finishes
  are 11/11. Next arm: compose + wounded-first targeting,
  judge on finishes vs this arm's control (40/36/11).
- [open] 2026-10-28 — a wave-3 lingerer sat 52 days unengaged
  (75103 seq 46 terms_of_service, toll d127, linger d128,
  horizon d180, zero post-toll engagements) — a pacing
  observation for the finishing-policy arm: long-lived
  treeline wounds are not rare, just unanswered.
