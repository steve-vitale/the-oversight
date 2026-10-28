# sim-lingerfinish-a — the village marches out, drives the treeline off, and still finishes nobody in the field: wound-selective finishing is NO-GO

Run: fleshout loop, run fleshout-20261028T0634Z. Axis: scale-onramp
(the blocking axis). Worker: sim-lingerfinish-a. Tracker blank 1 —
WOUND-SELECTIVE LINGERER FINISHING composed with the
tableseat-nowait substrate, judged on finishes against a FRESH
current-master baseline band (never the old corpus numbers).
Worktree: `~/workspace/worktrees/sim-lingerfinish-a` (branch
sim-lingerfinish-a). Base: master 3cb5f8b82 (world-HP TB rule +
wallwounds lingerer-restore cap already in).
PHASE 1 ONLY (policy-side, zero src/js). No game-code change
lands from this arm, and no game-code change was ever written.
The policy file is DELETED before commit per the binding
prereg (killed arms leave no trace). What lands is the
measurement + instruments + this evidence. No [needs-eyes]
commit exists because no game change lands.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-lingerfinish-a-prereg.md (commit
7081a399, plus the killed-arm driver patch committed with this
evidence — see "Killed-arm cleanup" below).
Corpus: evidence/2026-10-28/perseed-lingerfinish-a/ (control/ +
armed/, 8 rows + summary.json each, plus analysis.json).
Instruments (new this arm): scripts/test-lingerfinish-sweep.js
(sweep driver; baseline mode still runnable post-deletion,
armed mode fails fast with a clear error),
scripts/test-lingerfinish.js (analyzer / proof validator).
DELETED with the killed policy (they require it):
scripts/policies/lingerfinish.js, scripts/test-lingerfinish-proof.js
(unit + mock-daily proof, GREEN 35/35 before deletion),
scripts/test-lingerfinish-sense.js (sense replay, NON-MEASURED).
Detgate: PASS on 75101 before any band (plain days=132,
gameDays=132, tsNationalDay=77; wrapped-all-OFF identical, no
diag surface, no lf surface, no wraps installed — the old
numbers hold exactly on this base for this seed).

## Plain words first

This arm built the acting policy the last arm proved was
missing: when the treeline holds a wounded monster, the
village now does something about it. Twice over. If the whole
treeline is weak enough for villagers to handle — weakest
beast at 80 HP or less, treeline total at 300 or less — the
village musters a sortie: named fighters, real rations, real
blow-by-blow field fights. And the scholar marches out to
the most-wounded beast the village cannot take, to finish it
in a turn-based fight that now starts at the beast's wounded
world health instead of fresh.

The policy acts. Eleven sorties march out across eight
villages and clear nineteen lingerers off the treeline; the
scholar marches twenty-six times. Villages that never sat
the table now sit it (two villages flip from lost to won,
one reaches wave 5 for the first time on this band), and the
win count moves from 3 to 5. But the thing the arm was
judged on — villagers FINISHING a toll-wounded beast in the
field — does not happen even once. (Three villages newly
win armed — 75102 and 75106 flip from lost, 75107 from
survived — and 75101 reaches wave 5.) The sorties do not kill
the treeline. They scare it off. A beast already down to
1 HP does not stand and die when villagers reach it: in
twenty sortie fights, eighteen end with the beast fleeing
in zero rounds, one ends with the village fleeing, and one
ends in a kill — and that one kill is a beast the census
does not count, because its raid-night toll row is not
marked an exact toll. The village can clear its treeline.
It cannot finish a broken beast in the field, because the
field engine lets a broken beast leave instead of dying.
That is not a policy failure; it is a mechanism finding,
and it is why the verdict below is NO-GO on the legs as
pre-registered, with the policy deleted rather than landed
on the strength of its win movement. Wins are not a GO leg
in this prereg, and this run does not re-score them into
one.

## Verdict: NO-GO (binding prereg, no re-score)

GO required ALL legs. Legs (c) and (d) miss; everything
else passes. Judged by scripts/test-lingerfinish.js
(exit 0, bands valid) plus the sense replay and detgate:

- (a) BAND VALIDITY: PASS. 8 rows per band, every recorder
  clean (errs 0, no overflow), analyzer exit 0.
- (b) SUBSTRATE GATE: PASS on both bands (courtship combined
  baseline 110, armed 113; 8/8 seeds active both bands).
- (c) VILLAGER FIELD FINISHES (the deciding leg): FAIL.
  Toll-wounded instances finished via the field channel
  with a non-scholar killer: BASELINE 0, ARMED 0 (need
  >= baseline + 2 = 2). Sortie-caller field finishes of
  toll-wounded instances: 0 on both bands.
- (d) WAVE-4 FINISHES: FAIL. Wave-4 toll-wounded instances
  finished via any channel: BASELINE 4, ARMED 3 (need
  > baseline). Armed wave-4 finishes exist (75101: 2,
  75105: 1, all scholar TB) but the total falls because
  the armed trajectories change the instance pool itself
  (see "The pool shrinks" below).
- (e) COST BAR: PASS. Starvation ARMED 2 <= BASELINE 1 + 2;
  ARMED-only dead seeds (75103, 75105) starvation 1 <= 2;
  median ARMED 152d >= 0.8 x BASELINE 146d (ratio 1.041).
- (f) DETGATE: PASS (see header: 132/132/77, no surfaces).
- (g) KILLER-IDENTITY REPORTING: PASS. Split printed per
  band as a first-class table (see "The census" below);
  scholar-TB is the only finishing channel on both bands.

VERDICT: NO-GO. Per the prereg, scripts/policies/
lingerfinish.js is DELETED before commit (plus its
policy-bound proof and sense scripts; the sweep driver is
patched so its baseline mode still runs cleanly and its
armed mode fails fast with a clear error — verified, see
"Killed-arm cleanup"). Evidence + analyzer + corpora land;
no policy commit, no [needs-eyes] commit. Phase 2 (the
narration clause re-proposal) is NOT triggered and NOT
judged here: phase 1 COULD act without a hook (37 actions:
11 sorties + 26 marches), so no hook was missing. Phase 1
vs phase 2 are reported separately, as tasked; phase 2
remains an unjudged re-proposal for a future arm, not this
arm's rescue.

## The policy (written, measured, then deleted — exact design)

File (deleted): scripts/policies/lingerfinish.js, wrapping
tableseatNowait, gate LINGERFINISH=1, gate OFF = pure
delegation (detgate-pinned). Per loop-day, after base.daily,
in order:

STEP 1 — SORTIE (villager field channel). At most once per
6 game days (one muster per siege cohort; lingerers drift
off within ~6 nights), only if ALL held: lingering monsters
exist; min current HP <= 80; sum of current HP <= 300;
>= 2 healthy villagers at home (health > 40, not away, not
the scholar); pantry readable AND >= 12000 kcal (2x max
sortie cost 6000 — the policy is the only affordability
check, since lingererSortie pays whatever it can and
proceeds regardless); not tableActive; no live TB fight; no
pendingEncounter; scholar not sleeping, not insideTent.
On fire: Game.answerLingerer('sortie'); a sortie that BROKE
(vFlee/vDie) skips Step 2 that day.
STEP 2 — MARCH (scholar TB channel). Re-scan lingerers.
Target = most-wounded by HP fraction (hp < maxHp required;
maxHp from the entity or the monster def's base HP;
tie-break: haven-tile first, then lowest absolute HP) —
RESTRICTED to lingerers that are first-on-their-tile
(monsterAt(tx, ty) === the entity), because startCombat
fights playerMonster() = the FIRST world monster on the
scholar's tile, and marching to a stacked-behind lingerer
would fight the wrong entity. (Found while proof-testing:
the naive most-wounded pick failed verification on stacked
haven tiles; the fightable-set restriction keeps the
no-wrong-entity guarantee while staying wound-selective
among what the engine can actually fight.) Gates:
scholar HP >= 50% for wave-5 targets, >= 35% otherwise;
party gate as gorgedrive (invite up to 2 honestly, hold if
help exists but nobody comes, engage alone only when
nobody exists); one answer per monster id per game day
(gorgedrive's id-keyed pattern, disclosed limitation);
tile re-verification after travel (monsterAt === target,
else verify-failed and stop); same sanctity/guards.
On fire: travelTo + triggerEncounter + one honest march
line (knowledge-gated display name, never a stat).
DISCLOSED LIMITATION (from code, drove the gates):
lingererSortie takes NO target — it fights ALL lingering
raiders in world order. The sortie gate is therefore a
whole-treeline gate (min + sum), never a single-target
gate. A policy controls WHEN a sortie fires, never WHOM it
fights first.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single policy arm, tableseat-nowait
  VERBATIM + w4damage recorder stack VERBATIM on both bands.
- Horizon 180d DEATH-AWARE (runDays stops on death/win;
  +10d tail max). Sweep wall time ~17 min per band
  (baseline ~17 min, armed ~8 min — armed villages end
  earlier on average).
- Base: 3cb5f8b82. Full env: LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset, RAFTDRAFT=1,
  SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1,
  NONWORLDKILL=1, TBDMG=1, W4DMG=1; armed adds
  LINGERFINISH=1.
- Fresh-baseline drift (why the task forbade judging
  against old corpus numbers): the fresh baseline does NOT
  reproduce linger-vis (median 162d, starv 2, deaths 299,
  wins 3). It gives median 146d, starv 1, deaths 286, wins 3
  — and per-seed fates moved on 75102 (lost d177 -> lost
  d180 at horizon), 75103 (survived d180 never-entered ->
  won lesser d132), 75105 (won lesser d162 -> survived
  d180 never-tabled), 75108 (lost d114 -> lost d102).
  The world-HP TB rule (in base since linger-vis) plausibly
  drives much of this drift: scholar TB fights now start
  wounded instead of fresh, so TB outcomes — and everything
  downstream — change. The fresh baseline, not the old
  corpus, is the judge throughout this file.

## Wall numbers (THIS band only, never pooled)

| field | BASELINE | ARMED |
|---|---|---|
| national ever / final | 7/8 / 6/8 | 7/8 / 5/8 |
| table invited / entered | 4/8 / 3/8 | 6/8 / 5/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 5/8 (5 / 0) |
| wave-4 unlock | 6/8 | 7/8 |
| wave-5 unlock | 0/8 | 1/8 (75101) |
| median survival | 146d (days: 90, 102, 132, 132, 146, 180, 180, 180) | 152d (days: 116, 129, 133, 135, 152, 153, 156, 161) |
| starvation deaths | 1 (75108) | 2 (75103, 75108) |
| deaths total | 286 | 340 |

Per-seed ends, baseline -> armed: 75101 won lesser d132
(w4, national) -> won lesser d161 (w5, global); 75102
village-lost d180 (w4, global) -> won lesser d153 (w4,
global); 75103 won lesser d132 (w4, global) ->
village-lost d156 (w4, regional); 75104 won lesser d90
(w3, national) -> won lesser d152 (w4, global); 75105
survived d180 (w4, global, never tabled) ->
village-lost d133 (w4, regional); 75106 village-lost d146
(w4, regional) -> won lesser d135 (w4, national); 75107
survived d180 (w3, global, never tabled) -> won lesser
d129 (w3, global); 75108 village-lost d102 (w4, regional)
-> village-lost d116 (w4, regional). Arc IV (table
entered): 3/8 -> 5/8. All wins are lesser-seat wins; the
full seat is still nobody's story on this band. Wave 5 is
reached once, armed only.
READING THE WIN MOVEMENT HONESTLY: wins 3 -> 5, table
entered 3 -> 5, and wave 5 0 -> 1 are real policy effects
(the policy acts 37 times and trajectories diverge on
every seed), but they are NOT GO legs in this prereg and
are not used to rescue the verdict. Two seeds also flip
the wrong way (75103 won -> lost, 75105 survived -> lost)
and total deaths rise 286 -> 340, including one broken
sortie (75105). A policy that moves wins while killing
more villagers overall is a mixed instrument, not a
landing candidate on this evidence. The deaths rise is
reported here as a caution, not hidden behind the win
count — the cost bar as pre-registered covers starvation
and median survival only, and both pass, but the next arm
must reckon with the death count.

## The census (toll-wounded lingerers, binding definitions)

Population (pre-registered definition): a spawnsrc seq with
an observed raidTick toll row (tollExact=true, wall > 0)
AND a later daily snapshot with lingering=true.

| band | instances | engaged | finished |
|---|---|---|---|
| BASELINE | 29 | 29 | 14 |
| ARMED | 17 | 17 | 11 |

Killer split (first-class field, per prereg leg g):

| band | villager-field | scholar-field | scholar-TB | sortie-field (sub-count) | finish events |
|---|---|---|---|---|---|
| BASELINE | 0 | 0 | 14 | 0 | 14 |
| ARMED | 0 | 0 | 11 | 0 | 11 |

Wave-4 toll-wounded instances: BASELINE 14 instances, 4
finished (75102: 3, 75108: 1, all scholar TB); ARMED 8
instances, 3 finished (75101: 2, 75105: 1, all scholar TB).
Per-seed finished (baseline -> armed): 75101 0 -> 4;
75102 6 -> 0 (no instances: the village won d153 before
those toll lingerers ever formed); 75103 1 -> 1; 75104
1 -> 2; 75105 1 -> 3; 75106 4 -> 0 (no instances: won
d135, treeline cleared by sorties); 75107 0 -> 0 (no
instances either band); 75108 1 -> 1.

## The pool shrinks (why absolute counts mislead here, disclosed not re-scored)

Armed instances fall 29 -> 17 even though armed raids rise
88 -> 95. The policy itself shrinks the census pool: armed
villages win earlier (75102, 75106, 75107 end 20-50 days
sooner), clear treelines by sortie/march (so fewer raiders
persist to a lingering snapshot), and die earlier on two
seeds. Finish RATE rises (baseline 14/29 = 48%, armed
11/17 = 65%) while absolute finishes fall (14 -> 11) —
but the prereg counts ABSOLUTE instances, and the verdict
above is judged on absolute instances exactly as written.
A rate-based revision belongs to the NEXT run's prereg
(see "Metric review"), never to this run's verdict.

## Why sorties clear but never finish (the mechanism finding)

Sortie-caller field fights in the ARMED corpus (all
instances, not just toll-wounded): 20 fights — mFlee 18,
vKill 1, vFlee 1. By starting HP: 1 HP -> 16 mFlee + 1
vKill; 25 HP -> mFlee; 35 HP -> mFlee; 157 HP -> vFlee.
The pattern is the finding: a lingerer already at 1 HP
does not stand and die when villagers reach it — the field
engine resolves the fight in ZERO rounds as a flee (the
monster is already below its break line; it leaves instead
of taking a blow). The sortie's "cleared" counter (19)
counts vKill AND mFlee together in the engine — the
treeline goes quiet and the gorge stops either way — but
the census counts only vKill as finished, and the engine
almost never deals one to a broken beast. The single
sortie vKill (75102 d82 hushwolf, 1 HP, 0 rounds) is
correctly EXCLUDED from leg (c): its raidTick rows carry
tollExact=false (d24 wall 0; d71 wall 13 but tollExact
false — the recorder's exactness flag, not wall > 0 alone,
gates the census population, as pre-registered).
Villagers DO kill in the field through other channels
(armed: resolve 72 + other 66 field vKills across all
instances; baseline: resolve 80 + other 48) — just never
a toll-wounded instance, whose HP profile is either
0.75-fraction wave-3/4 bulk (600-975 HP for wave 4, far
above party damage) or 1-HP break-line fleers. The
policy's core premise — "a 1-HP lingerer is trivially
finishable by a party" — is WRONG for the field channel:
1 HP means already-broken, and already-broken means fled,
not finished. The next blank is therefore the field-flee
mechanism itself (does a broken beast deserve a flee
outcome when a mustered party corners it at the treeline?
is a 1-HP floor a real wound or a bookkeeping artifact?),
NOT another targeting policy and NOT more words. That
question is documented here, not answered here — it needs
a design call before any work (see "Named next step").

## Policy counters (armed band, from sweep rows' lf.*)

Sortie calls 11, cleared 19, broke 1, paid 54976 kcal
across the band. March engagements 26. Sortie held
reasons: minHp 19 (weakest lingerer above 80 HP — the
common hold), sumHp 10, muster 5, pantry 6 (the pantry
gate fired on 75108 five times: a hungry village does not
march, as designed). March held reasons: verifyFailed 6
(tile drift during travel — the target moved before the
scholar arrived), notfirst 2 (no fightable first-on-tile
wounded lingerer), alone 4, hp 2; invites refused 6,
invites ok 11. Lingerer-days seen 51, all wounded.
Per-seed sorties/marches: 75101 3/4; 75102 1/1; 75103
0/9 (march-heavy, sortie never gated in — minHp held 8
times); 75104 1/3; 75105 2/6 (one broke); 75106 2/0;
75107 1/0; 75108 1/3.

## Sense-testing read

Non-measured replay only (scripts/test-lingerfinish-sense.js,
SEED=75101, 180d, on the armed policy — script deleted with
the killed policy; its output is quoted here, never
counted). Clause lines: 9 — three sorties (d112, d129,
d145) and four marches (d142, d143, d144, d153), matching
the judged armed corpus on this seed (3 sorties, 4
marches, same days). Replay trajectory matches the corpus
on this seed; that match is stated, not assumed, for other
seeds.

What the replay shows: the sorties read like people
deciding, not robots dispatching. "SORTIE — Thao, Andre,
Morena take up arms and a day's rations (6,048 kcal from
the stores) and walk out to the treeline. Nobody's coming
back the same." Named fighters, a real price said aloud,
a sober last line. The marches read the same way:
"Desmond marches out to finish the wounded The Living
Wire at the treeline — 1 at their back." One honesty
wrinkle, disclosed: the policy's muster-watch line ("the
treeline is weak enough to finish") OVERCLAIMS against
the engine — the fights that follow mostly end in flight,
not finishing. The village's words promise a kill the
field engine will not deal. Since the policy is deleted,
this is moot for landing, but the next arm must not reuse
that line's promise without fixing the mechanism it
promises about. No line contradicts the wound itself, the
ration cost, or the risk — the sortie line is explicit
that nobody comes back the same, and one sortie in the
band does break (75105).

ONE ENCOUNTER, IN PLAIN WORDS (non-measured replay, never
a count): on d112, the village musters Thao, Andre, and
Morena with 6,048 kcal of rations and walks out to a
treeline holding three beasts at 1 HP each — a hushwolf,
a sunbasker, a paparazzo, each one blow from death on
paper. All three flee in zero rounds. Nobody's sword
finishes anything; the treeline goes quiet and the gorge
stops, which is worth something, but it is not a finish.
A player reading that day's story sees a village brave
enough to march and an engine unwilling to let the march
kill. The encounter reads sensically as courage; it reads
nonsensically as finishing. That gap is the arm's result.

## Village assessment (plain words)

Five of these eight villages win through the lesser seat
and go home — two of them (75102, 75106, 75107) only
because the armed village acts where the baseline village
waited, and one of them (75101) reaches wave 5, the first
wave-5 unlock on this band family. Three villages die, and
the deaths run higher than baseline (340 vs 286) — the
policy's marches and sorties cost blood as well as
rations, and two villages that baseline saved (75103,
75105) die armed. Seven villages reach wave 4, none
reaches the full seat, and the table takes five villages
instead of three. The treeline is no longer a place
wounded beasts sit unanswered: eleven sorties and
twenty-six marches answer it. But answering is not
finishing. The beasts leave; they do not die by villager
hands. Until the field engine lets a cornered, broken
beast actually die, the village's finishing trip will
keep clearing treelines without ever filling the census
this arm was judged on.

## Blanks filled or documented

- MEASURED, NOT FIXED (the arm's result): wound-selective
  finishing acts (11 sorties, 26 marches, trajectories
  diverge on all 8 seeds) but does not move the
  pre-registered finish legs (villager-field 0 -> 0,
  wave-4 finishes 4 -> 3). NO-GO; policy deleted.
- MECHANISM FOUND, NOT FIXED: fieldFight resolves
  already-broken (1 HP) monsters as 0-round mFlee, not
  vKill (16:1 flee:kill at 1 HP across 20 sortie fights).
  A mustered party corners a broken beast and watches it
  leave. This is the binding constraint on villager field
  finishes, and it was invisible until a policy actually
  sortied. Needs a design call before work (below).
- DOCUMENTED, NOT FIXED (named next step): see below.
- CARRIED (not chased here): the full seat at 0/8 on both
  bands (the scale-onramp axis work continues); the
  pendingEncounter-branch linger-birth line (linger-vis
  second site, still untouched); the empty nonat x w4 class
  (w5chain-a); the panel corpus-ingest mode (tooling
  blank, see below); the deaths rise armed (340 vs 286)
  as a caution for any successor arm.
- FILLED (mechanism, read from code + corpus): TB fights
  remain the ONLY finishing channel for toll-wounded
  lingerers on this substrate (11/11 armed finishes,
  14/14 baseline finishes, all scholar TB); the march's
  first-on-tile restriction is engine-real (startCombat
  fights monsterAt(scholar tile)); the sortie's
  whole-treeline iteration is engine-real (no target
  argument exists).

## Named next step (mechanism question, not a policy arm)

FIELD-FLEE AT THE BREAK LINE (needs a design call before
any work — Steve-call class, not a silent worker change):
when a mustered sortie corners a lingerer already below
its break line at the treeline, should fieldFight resolve
mFlee (the beast leaves, gorge stops, no kill, no meat,
no ledger point) or should a cornered broken beast die?
Sub-questions for that call: is the 1-HP floor a real
wound state or a bookkeeping artifact of the flee path
(the same 1 HP recurs across days and seeds)? Does the
break line serve a purpose at the treeline that it does
not serve in the wild (where resolve/other villagers DO
kill)? Until that call exists, another targeting policy
will reproduce this arm's result: sorties that clear and
do not finish. Do NOT re-score this arm's NO-GO on win
movement, finish rate, or cleared counts.

## Killed-arm cleanup (verified, not asserted)

- DELETED before commit: scripts/policies/lingerfinish.js,
  scripts/test-lingerfinish-proof.js (was GREEN 35/35 on
  the policy, including mock-daily sortie + march +
  stacked-tile + cooldown cases), scripts/test-lingerfinish-
  sense.js (replay output quoted above, never counted).
- PATCHED, KEPT: scripts/test-lingerfinish-sweep.js —
  lazy-requires the deleted policy; BASELINE mode runs
  cleanly post-deletion (verified: --summary on the
  control dir still prints CORPUS: PASS), ARMED mode fails
  fast with "lingerfinish policy deleted (killed arm
  NO-GO); armed mode unavailable" (verified, no sweep run
  attempted). Detgate is unavailable post-deletion by the
  same guard; it passed pre-deletion and is recorded in
  this file's header, never re-claimed post-deletion.
- KEPT: this prereg (committed 7081a399), this evidence,
  scripts/test-lingerfinish.js (analyzer; reads corpora
  only, needs no policy file), both corpora + analysis.json.
- Worktree after commit must contain ONLY committed work
  (verified with git status --short empty before reporting;
  any safe-commit index clobber repaired via HEAD-blob
  cacheinfo, same as the prereg commit).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged
exactly against its prereg GO rule: validity (a),
substrate (b), villager-field finishes (c), wave-4
finishes (d), cost bar (e), detgate (f), killer split (g).
The verdict is NO-GO on legs (c) and (d); legs (a), (b),
(e), (f), (g) pass. Two judgment notes, both disclosed,
neither a re-score:

1. ABSOLUTE COUNTS PUNISH POOL-SHRINKING ARMS. The armed
   policy shrinks the census pool itself (29 -> 17
   instances) by winning earlier and clearing treelines,
   so absolute finishes fall (14 -> 11) while finish rate
   rises (48% -> 65%). A future prereg could judge finish
   RATE (or instances + rate jointly) — but that revision
   applies to the NEXT run, never this one, and it would
   still need a villager-field mechanism that exists,
   which the flee finding says does not.
2. PANEL. scripts/balance-panel.js compare requires
   --before/--after panel.json.gz files built from live
   roots; it has NO corpus-ingest mode for a single-arm
   census corpus (standing exception, eighth round —
   confirmed again this run by its usage error). No panel
   artifact was faked; the paired control/armed sweep
   tables + analyzer outputs (this band vs itself,
   identical seeds/substrate/recorders, policy the only
   difference) are the comparison of record, as the
   section-15 substitute.
3. TELEMETRY DEVIATION CHECK (loop body step 10, run AFTER
   writing evidence, once per band): CONTROL band and ARMED
   band produce the same LOUD-line KIND, so the policy
   introduces no new deviation — verdict KNOWN ARTIFACT,
   baseline NOT rolled: CONTROL `national disappeared:
   baseline 12 -> current 0 (n=9)`, `table swung -75%:
   baseline 16 -> current 4 (n=9)`, `wins disappeared:
   baseline 16 -> current 0 (n=9)`; ARMED identical except
   `table swung -62%: baseline 16 -> current 6 (n=9)`.
   Two independent reasons, same as the linger-vis family:
   (a) the baseline's own regime note forbids this
   comparison (a ~100%-win winseat suite vs a
   tableseat-nowait census substrate); (b) the field-shape
   artifact repeats (per-seed rows carry nationalEver/
   entered/won, not top-level national/table/wins paths —
   table reads 4/6 only because rows carry a top-level
   `table` invited flag; national/wins read 0 because no
   such top-level path exists). The corpus's real wall
   numbers are nationalEver 7/8 both bands, table entered
   3/8 -> 5/8, wins 3/8 -> 5/8. (n=9 files = 8 rows +
   summary.json in the glob, identical on both bands.)

## Infrastructure notes

- Sweep: scripts/test-lingerfinish-sweep.js (copy of the
  w4damage driver, policy-switched per band), 8 seeds each,
  ~17 min wall baseline / ~8 min armed + detgate ~7 min
  + sense replay ~1 min. Corpus:
  evidence/2026-10-28/perseed-lingerfinish-a/ (control/ +
  armed/ with 8 rows + summary.json each, analysis.json at
  top). Analyzer: scripts/test-lingerfinish.js (proof
  validator; exit 0, bands valid, legs (c) and (d) miss).
  Proof: scripts/test-lingerfinish-proof.js (GREEN 35/35
  pre-deletion, then deleted with the policy). Sense:
  scripts/test-lingerfinish-sense.js (NON-MEASURED replay
  only; 75101 full 180d; 9 clause lines matching the
  judged armed corpus on that seed; deleted with the
  policy, output quoted above).
- Safe-commit index clobber hit the prereg commit
  (bogus staged deletions for files byte-identical to HEAD
  — commit itself correct, verified by stat + hash before
  continuing) — repaired via HEAD-blob cacheinfo, verified
  status clean + diff HEAD empty, before any sweep ran on
  the affected state. The final commit below must be
  checked the same way before this run is called done.
- check.js --quick: CORRECTION to the first version of
  this note (which said aborted — see commit history).
  This worker DID issue a kill on its own suite after
  observing a sibling run's check.js --quick in flight in
  another worktree (journey2-endgame; the repo rule is
  never concurrent jest, since concurrent runs have
  produced phantom failures; the sibling's run was not
  touched). The suite nevertheless printed a completion
  summary — evidently racing natural completion — of
  279 passed, 8 failed in 955s, the same COUNTS as
  linger-vis reported (279/8). The tail-only output does
  not name the 8 failures, so their identities are NOT
  asserted here as the pre-existing set, and the
  concurrency caveat stands: the counts match linger-vis
  exactly, but a concurrent-jest run cannot certify the
  failure list. This arm touches no src/ (the policy is
  deleted) and adds no existing-test files, so the proofs
  of record remain the analyzer (exit 0), the detgate
  (PASS), the sweep corpus gates (PASS both bands), and
  the proof test (GREEN pre-deletion).
- Branch ready, pending coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line,
  not this arm's).
- Heartbeats: tree heartbeat after registration, after
  detgate, and mid-sweeps — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [measured-NO-GO] 2026-10-28 — wound-selective lingerer
  finishing — the policy acts (11 sorties, 19 cleared, 26
  marches, wins 3->5, wave 5 0->1, table entered 3->5) but
  misses both finish legs (villager-field 0->0, need +2;
  wave-4 finishes 4->3, need >4). NO-GO; policy deleted
  before commit. The win movement is context, not a
  rescue — the prereg binds finishes, not wins.
- [open, needs-design-call] 2026-10-28 — field-flee at the
  break line — sortie fights vs 1-HP lingerers resolve
  0-round mFlee 16:1 over vKill (20 sortie fights: 18
  mFlee, 1 vKill, 1 vFlee). A mustered party corners a
  broken beast and watches it leave. Until a call exists
  on whether a cornered broken beast should die, another
  targeting policy will reproduce this NO-GO. The 1-HP
  floor's nature (real wound vs flee-path bookkeeping)
  is part of the same question.
- [open] 2026-10-28 — absolute-instance census counts
  punish pool-shrinking arms (instances 29->17 armed while
  finish rate rises 48%->65%). A future prereg could judge
  rate jointly with absolute counts; that revision belongs
  to the next run, never a re-score of this one.
- [open] 2026-10-28 — deaths rise under the acting policy
  (340 vs 286) with one broken sortie (75105) and two
  won->lost / survived->lost seed flips (75103, 75105)
  against three lost/survived->won flips (75102, 75106,
  75107). Any successor arm must reckon with the death
  count, not just the win count.
