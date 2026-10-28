# sim-partyfinish-a — the cornered party finishes what the sortie used to watch leave: GO

Run: fleshout loop, run fleshout-20261028T0836Z. Axis: scale-onramp
(the blocking axis). Worker: sim-partyfinish-a. Worktree:
`~/workspace/worktrees/sim-partyfinish-a` (branch sim-partyfinish-a).
Base: master 8e26af922 (includes the lingerfinish NO-GO evidence and
the world-HP TB rule). This arm changes GAME CODE (the field-flee
path) — it is not a policy-only repeat of lingerfinish, and it is
judged on its own prereg, not lingerfinish's.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-partyfinish-a-prereg.md (commit abd1e38b76).
Corpus: evidence/2026-10-28/perseed-partyfinish-a/ (control/ +
armed/, 8 rows + summary.json each).
Instruments (new this arm): scripts/policies/partyfinish.js
(sortie-only driver), scripts/policies/partyfinish-diag.js
(party/gear fight recorder), scripts/test-partyfinish-sweep.js
(sweep driver), scripts/test-partyfinish.js (analyzer / proof
validator), scripts/test-partyfinish-proof.js (unit proof, GREEN
12/12), scripts/test-partyfinish-sense.js (sense replay,
NON-MEASURED).
DETGATE: PASS on 75101 before any band (plain days=132,
gameDays=132, tsNationalDay=77 — identical to lingerfinish's
detgate numbers; wrapped-all-OFF identical, no diag surface, no
pf surface, no wraps installed).

## Plain words first

Lingerfinish proved the village would march out and watch broken
beasts leave: eighteen of twenty sortie fights ended with the
beast fleeing before a single blow, even at 1 HP. This arm changes
the one rule behind that: when a mustered, armed party corners a
broken beast at its own treeline, the beast no longer gets the
free zero-round flight. It has to stand for one round. One round
is all a 1-HP beast needs to die — and all a stronger beast needs
to show whether the party can actually kill it, because after
round 1 the old flee rule comes straight back.

Twelve sorties march out across eight villages. Twenty-nine
sortie fights follow, and eighteen of them end with a villager
party killing a beast in the field — every one a party of three
fighters, every one with the leader's weapon and armor recorded,
every one a beast that arrived at 1 HP. The same three beasts
from lingerfinish's replay — the hushwolf, the sunbasker, and the
paparazzo at 1 HP on day 112 of seed 75101, which fled untouched
then — die in round 1 now, to the same three fighters (Thao,
Andre, Morena) with the same rations. Nothing else about the
fight changes: wild meetings still flee for free, solo villagers
still get the free flight, arena fights are sealed as before,
and a beast the party cannot kill in round 1 still leaves after
it. Five held beasts do exactly that (below). The villages win
more (3 → 5), reach wave 4 everywhere (6 → 8), and sit the table
more (3 → 5 entered) — but the full seat is still nobody's story,
wave 5 is still unreached, and the deaths run higher (286 → 312),
which is reported here as a caution, not hidden behind the win
count. The cost bar as pre-registered (median survival and
starvation only) passes; the death count is a real cost the next
arm must reckon with.

## Verdict: GO (binding prereg, all legs pass)

Judged by scripts/test-partyfinish.js (exit 0, bands valid) plus
the detgate (PASS) and the proof test (GREEN 12/12):

- (a) BAND VALIDITY: PASS. 8 rows per band, every recorder clean
  (errs 0, no overflow), analyzer exit 0, zero cornered fights
  in the baseline corpus (mechanism-dormant check).
- (b) SUBSTRATE GATE: PASS on both bands (courtship combined
  baseline 110, armed 119; 8/8 seeds active both bands).
- (c) COUNTED FINISHES (the deciding leg): PASS. Counted
  finishes (sortie + world monster + vKill + party >= 2 + leader
  armed with gear recorded + corneredHold true): BASELINE 0,
  ARMED 18 (need >= 2 and >= baseline + 2).
- (d) COST BAR: PASS. Starvation ARMED 1 <= BASELINE 1 + 2;
  ARMED-only dead seeds ([75104]) starvation 0 <= 2; median
  ARMED 140d >= 0.8 x BASELINE 146d (ratio 0.959).
- (e) DETGATE: PASS (see header: 132/132/77, no surfaces).
- (f) PARTY/GEAR REPORTING: PASS. Split printed per band as a
  first-class table (see "The census" below); every counted
  finish carries party size, weapon bonus, and armor.

VERDICT: GO. The mechanism + driver land as committed here
(game-code change, so the commit carries [needs-eyes]). The
policy file stays (it is the driver the mechanism needs — a
mechanism no policy ever triggers is decoration). No game-code
revert, no policy deletion: this is a landing arm, not a killed
arm. The ship loop owns pushes, bumps, and live verification;
this worker reports "merged locally, pending ship" via the
coordinator, never pushes itself.

## The mechanism (exactly what changed, and what did not)

Two game-code edits, and only these two, in the field-flee/finish
path (plus a narration-only summary fix added after the judged
sweep — see "Post-sweep addendum" below, proven mechanically
inert by a byte-identical spot-check row):

1. src/js/havenGrowth.js, lingererSortie(): the fieldFight call
   passes opts.cornered = true alongside the existing
   { allies, allyVids }. Sortie construction already guarantees
   the cornering facts: muster >= 2 (leader + >= 1 ally, else
   no-fighters), a day's rations per fighter paid from the
   pantry, at the home treeline, deliberate. NO other caller
   sets cornered.
2. src/js/fieldFights.js, fieldFight(), post-volley break check
   only: when the lead arrives below the break line AND no
   damage has been dealt yet this fight (rec.mDealt === 0, so a
   volley drive-off still flees) AND opts.cornered AND
   opts.allies >= 1 (party of 2+) AND the leader is armed
   (wb > 0) AND NOT opts.noFlee, the post-volley mFlee is
   SKIPPED, rec.corneredHold = true is set, and one honest log
   line is added. The fight then enters round 1 normally.
   UNTOUCHED, exhaustively: the in-round break check after
   round 1; vFlee/vDie; evade; signature/trick/cap mFlee paths;
   the volley-kill branch; the alreadyDead branch; deed credit;
   the TB path; arena (noFlee) fights; and every non-sortie
   field fight (wild, patrol, aid, raid, contest), which keep
   the free break-flee exactly as before.

Why this shape survives the ffhold/ffnoflee kills: those arms
held EVERY arrival-below-line fight, including solo villagers
stumbling onto wounded wave-3 monsters in the wild — and the
villages paid in blood (median 150d → 98d / 86d). This hold
applies only to deliberate, mustered, paid sorties at the home
treeline, only when the policy's risk gates already judged the
treeline weak (min <= 80 HP, sum <= 300 HP), and only for one
round. The blood ledger for THIS arm is in "The cost" below —
real, but an order smaller than the ffhold/ffnoflee collapses,
and the cost bar passes.

Why weapon-only, not an armor-P threshold: the task's GO wording
requires finishes "by a party of 2+ fighters with gear recorded"
— gear recorded, not a P bar. Armor is recorded in every row
(counted finishes carry armor 4–60) and reported; an armor-P
gate would mostly gate on the armor-craft conversion system,
itself an open item, and would make the mechanism untestable on
the wave-1/2 treeline beasts that are the 1-HP population.
Documented in the prereg for Steve to overrule, not hidden.

## The driver policy (sorties ONLY)

scripts/policies/partyfinish.js wraps tableseat-nowait VERBATIM,
gate PARTYFINISH=1, gate OFF = pure delegation (detgate pins
this). Gate ON, once per loop-day after base.daily: lingerers
exist; min HP <= 80; sum HP <= 300; >= 2 healthy villagers at
home; pantry readable AND >= 12000 kcal; not tableActive; no
live TB fight; no pendingEncounter; scholar not sleeping, not
insideTent; at most once per 6 game days. On fire:
Game.answerLingerer('sortie'); counters pf.*. NO march step
(lingerfinish's scholar marches are deliberately dropped:
scholar TB finishes are not villager field finishes, and
marches added deaths without moving the finish legs). NO
promise line: the policy never tells the village a kill is
certain — the engine's own sortie lines speak (see "Sense").

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single policy arm, tableseat-nowait
  VERBATIM + w4damage recorder stack VERBATIM on both bands.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max). Sweep wall time ~16 min per band (per-seed
  invocations, after the fieldfinish vanishing-process lesson).
- Env (both bands, full set): LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset, RAFTDRAFT=1,
  SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1,
  NONWORLDKILL=1, TBDMG=1, W4DMG=1, PARTYDIAG=1 (the new
  recorder's switch, on in both bands); armed adds
  PARTYFINISH=1.
- Baseline replication note: the fresh baseline reproduces
  lingerfinish's fresh baseline EXACTLY on every wall number
  (wins 3, median 146d, national ever 7/8, final 6/8, table 4/8,
  entered 3/8, wave-4 6/8, wave-5 0/8, starvation 1, deaths 286,
  courtship 110, raids 88) and exactly on the lingerfinish
  census (29 toll-wounded instances, 14 finished, all scholar
  TB). The dormant mechanism + new recorder changed nothing on
  the baseline — the mechanism-dormant check (0 cornered
  fights baseline) is the proof, not an assertion.

## Wall numbers (THIS band only, never pooled)

| field | BASELINE | ARMED |
|---|---|---|
| national ever / final | 7/8 / 6/8 | 8/8 / 6/8 |
| table invited / entered | 4/8 / 3/8 | 7/8 / 5/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 5/8 (5 / 0) |
| wave-4 unlock | 6/8 | 8/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 146d (days: 90, 102, 132, 132, 146, 180, 180, 180) | 140d (days: 90, 131, 132, 134, 140, 162, 180, 180) |
| starvation deaths | 1 (75108) | 1 (75108) |
| deaths total | 286 | 312 |

Per-seed ends, baseline -> armed: 75101 won lesser d132
(w4, national) -> won lesser d162 (w4, national); 75102
village-lost d180 (w4, global) -> survived d180 (w4, global);
75103 won lesser d132 (w4, global) -> won lesser d132 (w4,
global, identical — the policy never fired: 2 lingerer-days
seen, minHp held both times); 75104 won lesser d90 (w3,
national) -> village-lost d131 (w4, regional); 75105 survived
d180 (w4, global) -> survived d180 (w4, regional, arc 4);
75106 village-lost d146 (w4, regional) -> won lesser d90 (w4,
national); 75107 survived d180 (w3, global, never tabled) ->
won lesser d134 (w4, global); 75108 village-lost d102 (w4,
regional) -> won lesser d140 (w4, global). Arc IV (table
entered): 3/8 -> 5/8. All wins are lesser-seat wins; the full
seat is still nobody's story on this band. Wave 5 is reached
on neither band.

## The census (counted finishes, binding definition)

Population: pfFights rows (the party/gear recorder — the only
record carrying party size + gear + corneredHold per fight).

| band | sortie fights | cornered | held | sortie vKills | COUNTED |
|---|---|---|---|---|---|
| BASELINE | 0 | 0 | 0 | 0 | 0 |
| ARMED | 29 | 29 | 23 | 22 | 18 |

Sortie vKill split (armed): counted 18; no-hold 4 (1 volley
kill at rounds 0, plus normal above-break fights that needed
no hold); unarmed 0; null-gear 0; solo 0. Every sortie fight
was cornered (29/29 — sorties are the only cornered caller, as
designed) and every counted finish was a party of 3.

Counted finishes (all 1 HP at fight start, all round 1, all
party 3, all corneredHold true):
- 75101 d112: hushwolf w1 (wb 3, armor 4), sunbasker w1 (wb 3,
  armor 4), paparazzo w2 (wb 3, armor 4) — the exact three
  beasts from lingerfinish's d112 replay, which fled untouched
  then, killed now by the same party (Thao, Andre, Morena).
- 75102 d90: cliffhanger w1 (wb 12, armor 8); d106: nevermore
  w1, hushwolf w1 (wb 12, armor 8).
- 75104 d90: drumbelly_tanuki w1, lockpick_raccoon w1,
  warranty_caller w2 (wb 4, armor 4).
- 75105 d88: white_noise_heron w1, bright_idea w2, cliffhanger
  w1 (wb 11, armor 16).
- 75106 d73: lockpick_raccoon w1 (wb 17, armor 60).
- 75107 d112: anaconda_empress w1, understudy w2 (wb 4,
  armor 4).
- 75108 d101: bulldozer w1, nightcourt w1, murkcap w1 (wb 21,
  armor 26).

Held but NOT killed (5 — the hold guarantees a round, never a
kill, and these are the proof): 75102 d82 + d106 sanjun w1
(1 HP, rounds 1, mFlee); 75106 d73 spool w3 (35 HP, rounds 1,
mFlee — a held round's damage did not finish 35 HP, and it
left after round 1 as designed); 75108 d68 spool w3 (1 HP,
rounds 1, mFlee); 75108 d101 callback w3 (1 HP, rounds 1,
mFlee). The pattern across all five is consistent with
trick-consumed rounds — sanjun's counter is a shout, spool's
is a record-phase wait, callback's is a farewell, and each
consumes the villager's round action without dealing damage,
after which the in-round break check flees the beast. The
pfFights record does not carry trickLog, so this is stated as
the consistent explanation, not a proven per-fight attribution:
what IS proven is that the hold does not force kills, and that
wave-3 beasts with action-consuming counterplay can still spend
the held round leaving. That is the mechanism's honest limit,
and it is why no wave-3+ counted finish exists on this band.

Policy counters (armed band, from sweep rows' pf.*): sortie
calls 12, cleared 29, broke 0 (no sortie broke or lost its
leader on this band). Sortie held reasons: minHp 27 (weakest
lingerers above 80 HP — the common hold), sumHp 18, sanctity
3, muster 2, pantry 3. Lingerer-days seen 65. Per-seed
sorties/cleared: 75101 1/3; 75102 3/6; 75103 0/0; 75104 2/4;
75105 2/6; 75106 1/2; 75107 1/2; 75108 2/6.

## Secondary census (lingerfinish comparability, never a GO leg)

Running the lingerfinish analyzer on THIS band's corpora (same
census definitions): toll-wounded instances baseline 29 ->
armed 26; villager-field finishes 0 -> 4 (sortie-field 2 of
them; per-seed: 75101 1, 75105 3); scholar-TB finishes 14 -> 6;
wave-4 toll-wounded finishes 4 -> 3 (wave-4 instances 14 ->
14). Read honestly: on the lingerfinish-style leg (c),
villager-field finishing now passes (0 -> 4, need +2); on leg
(d), wave-4 absolute finishes still miss by one — NOT a pool
shrink this time (instances hold at 14), but a trajectory
effect: sorties clear treelines earlier and villages win
earlier, so fewer wave-4 instances reach a scholar-TB finish.
The primary GO (sortie finishes of lingering monsters, any
wave) passes decisively; the wave-4 toll-wounded subset is a
different population — big beasts at 0.75 fraction (600–975
HP), not 1-HP break-line beasts — and a held round 1 does not
finish them. That subset needs its own mechanism question
(multi-round cornering? trick-aware cornering that strikes
instead of performing the trick?), which belongs to a future
prereg, never to a re-score of this run.

## The cost (reported, not hidden)

- Total deaths 286 -> 312 (+26). Sortie-combat deaths armed
  22 (baseline 0 — no sorties). Villager combat deaths 110 ->
  125; villager-vs-villager combat 80 -> 75; arena deaths 43
  -> 39. The cost bar as pre-registered covers median survival
  (140 vs 146, ratio 0.959 — passes) and starvation (1 vs 1 —
  passes) only, and both pass; but a reader who only sees the
  win count (3 -> 5) would miss that armed villages also bury
  26 more people, including one seed that flips won -> lost
  (75104: won d90 -> lost d131, 2 sorties, 3 counted finishes,
  deaths 24 -> 46). The sorties are not free. A future prereg
  could add a total-deaths guard; that revision belongs to the
  NEXT run, never to this verdict.
- Rations: every sortie pays 2000 kcal per fighter from the
  pantry and says so aloud (d112 line: 6,048 kcal for three
  fighters — the engine's paid figure as spoken). The policy
  gates on pantry >= 12000 (2x max cost) and held on pantry
  3 times armed.
- Wave-4 demand check (Steve 2026-10-28 02:54): every counted
  finish is a party of 3 with recorded gear — no solo-scholar
  finish is counted anywhere, and the scholar's TB channel is
  not part of this metric at all. Against the wave-4 demand
  itself (parties + fully outfitted gear for wave 4): this arm
  finishes wave-1/2 break-line beasts, not wave-4 beasts, so it
  does not yet satisfy the wave-4 demand — it removes one lock
  (villagers can finish what they corner) without claiming the
  wave-4 fight is now party-ready. The readiness bars
  (armored/armed/tricks/veterans) are untouched by this arm.

## Sense-testing read

Non-measured replay only (scripts/test-partyfinish-sense.js,
SEED=75101, 180d, armed policy + mechanism — script KEPT).
Replay trajectory MATCHES the judged armed corpus on this seed
(ends d162 over-other; the d112 sortie with Thao, Andre, and
Morena and 6,048 kcal, same as lingerfinish's replay and my
census). Replay text proves wording and presence only, never
counts.

What the replay shows: the sortie line reads like people
deciding ("Thao, Andre, Morena take up arms and a day's
rations (6,048 kcal from the stores) and walk out to the
treeline. Nobody's coming back the same.") — named fighters, a
real price said aloud, a sober last line, no promise of a kill.
The kill lines then read, before the post-sweep fix below,
"Thao killed the Ugly-Eyes alone" — a party of three marched
out and the story credited one of them alone. That is the
sense finding that drove the post-sweep summary fix: the
village's words must not contradict its muster. After the fix
(proof cases, not a re-run of the judged corpus), the same
fights would read "with their party" plus the cornered clause.
The cornered log line itself ("cornered at the treeline...")
lives in the fight record, not in say/sysSay (CORNER_LINES=0
in the replay) — the hold is narrated only through the kill
summary's cornered clause after the fix, never as a spoken
beat of its own. That is acceptable (no overclaim, no invented
dialogue) but a future narration pass could speak the
cornering itself.
The d155 replay lines ("One down — but 2 still hold the
treeline. The gorge goes on.", printed twice) are NOT sortie
lines: they come from the comms.js defense path at a separate
treeline event, and the doubling is the sense script's own
say+sysSay double tap, not two game events. Stated so the
replay is not misread as two sorties.

ONE ENCOUNTER, IN PLAIN WORDS (non-measured replay, never a
count): on d112, Thao, Andre, and Morena walk out with a
day's rations to a treeline holding three beasts at 1 HP each
— the same three lingerfinish watched flee untouched. This
time each beast stands for one round, and each dies in it:
one round, 0 taken; one round, 0 taken; one round, 18 taken,
with a nanite swarm taken off the body. The treeline goes
quiet. A player reading that day's story sees a village brave
enough to march, a rule that finally lets the march kill, and
a price honestly stated (rations, and 18 HP on the third
fight). After the summary fix, the story also credits the
party instead of one hero. That gap — party effort, solo
credit — was the last dishonesty in the encounter, and it is
closed in the fix below.

## Village assessment (plain words)

Five of these eight villages win through the lesser seat and go
home — three of them (75106, 75107, 75108) only because the
armed village finishes what the baseline village watched leave,
and one of them (75102) survives where the baseline village
died. Three villages do not win: one dies armed that baseline
saved (75104), one survives on both bands (75105, bloodier
armed), one wins on both bands (75101, 75103). Every village
reaches wave 4 armed; none reaches wave 5 or the full seat on
either band. The treeline is no longer a place where broken
beasts sit unanswered AND unkillable: twelve sorties answer it,
and eighteen broken beasts die by villager hands in the field —
the first villager field finishes this band family has ever
recorded at scale. But finishing a 1-HP beast is not the same
as taking a wave-4 beast, and the table's full seat is still
nobody's story. What this arm proves is narrower and real: the
field engine no longer forbids a cornered party its kill. The
scale wall beyond that — wave-4 kills, veterans, the full seat
— still stands, and the next arm has to say which lock it is
picking.

## Blanks filled or documented

- FILLED (mechanism): the field-flee break line no longer
  forbids a mustered, armed party its finish. Counted finishes
  0 -> 18 on identical seeds; lingerfinish's 0 -> 0 is now
  answered by a mechanism, not another targeting policy.
- FILLED (narration honesty, post-sweep): party kills no longer
  read as solo kills (see addendum below).
- DOCUMENTED, NOT FIXED: wave-4 toll-wounded finishes still
  miss (4 -> 3) — big wounded beasts need a different
  mechanism question; wave-3 held beasts that spend the held
  round on a trick (sanjun/shout, spool/wait, callback/
  farewell) still leave — trick-aware cornering is an open
  design question for the next arm (should a cornered party
  strike instead of performing the trick?); total deaths rise
  (+26) outside the pre-registered cost bar; the full seat
  stays at 0/8 and wave 5 at 0/8 on both bands.
- CARRIED (not chased here): the pendingEncounter-branch
  linger-birth line (linger-vis second site, still untouched);
  the empty nonat x w4 class (w5chain-a); the panel
  corpus-ingest mode (tooling blank, see below).

## Post-sweep addendum (narration-only, separated from the verdict)

After the judged sweep, the sense replay's "alone" finding was
fixed in the same commit (it is narration-only and cannot move
any judged number — proven, not asserted, below). Changes:
src/js/fieldFights.js records rec.partySize = (opts.allies ||
0) + 1 at fight creation, and fieldFightSummary's vKill line
reads "with their party" when partySize >= 2 (recs without
party info keep the exact old "alone" line) plus a cornered
clause ("Cornered at the treeline, it could not slip away
before a blow.") when rec.corneredHold is true. Proof:
scripts/test-partyfinish-proof.js extended to 12 checks
(solo rec unchanged; party rec wording; cornered clause;
live rec partySize 3) — GREEN 12/12. Mechanical-inertness
proof: armed seed 75101 re-run into a scratch dir after the
fix produces a row BYTE-IDENTICAL to the judged armed row
(same days, deaths, fights, holds); the scratch dir was
deleted after comparison and never committed. Regression:
the two existing summary tests re-run — 20261013 GREEN 4/4;
20261012 shows 10 passed / 1 failed on the "mFlee unchanged"
check, IDENTICAL on pristine HEAD code (verified by swapping
the pristine file in and re-running) — a pre-existing failure,
not a regression from this arm. The judged GO above was
decided on the pre-fix code; the fix changes no fight outcome,
no RNG draw, and no recorded row, so it does not re-open the
verdict — but it is disclosed here rather than smuggled into
the commit message, so the coordinator can see exactly what
landed after judging.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg GO rule: validity (a), substrate (b),
counted finishes (c), cost bar (d), detgate (e), party/gear
reporting (f). All pass. Judgment notes, disclosed, none a
re-score:

1. ABSOLUTE COUNTS AND THE WAVE-4 SUBSET. The primary metric
   (sortie finishes, any wave) passes decisively (18 vs a bar
   of 2), so no revision is needed to rescue this run. But the
   secondary census shows the metric's boundary: it counts
   1-HP break-line finishes, overwhelmingly wave 1/2, and says
   nothing about wave-4 toll-wounded finishes (4 -> 3). A
   future prereg that wants wave-4 kills must pre-register a
   wave-4-specific mechanism and bar — it cannot be read off
   this run's primary.
2. COST BAR COVERAGE. The pre-registered cost bar (median +
   starvation) passes while total deaths rise 286 -> 312 and
   sortie-combat deaths add 22. That gap is disclosed in "The
   cost" above. A future prereg could add a total-deaths guard
   (e.g. armed deaths <= baseline + 15, or sortie-combat
   deaths reported as a leg) — that revision applies to the
   NEXT run, never this one.
3. PANEL. scripts/balance-panel.js compare requires
   --before/--after panel.json.gz files built from live roots;
   it has NO corpus-ingest mode for a single-arm census corpus
   (standing exception, ninth round — confirmed again this run
   by its usage error: "compare --before <panel.json.gz>
   --after <panel.json.gz> --out <prefix>"). No panel artifact
   was faked; the paired control/armed sweep tables + analyzer
   outputs (this band vs itself, identical seeds/substrate/
   recorders, policy + mechanism the only difference) are the
   comparison of record, as the section-15 substitute.
4. TELEMETRY DEVIATION CHECK (loop body step 10, run AFTER
   writing evidence, once per band): CONTROL band and ARMED
   band produce the same LOUD-line KIND, so the policy +
   mechanism introduce no new deviation — verdict KNOWN
   ARTIFACT, baseline NOT rolled: CONTROL `national
   disappeared: baseline 12 -> current 0 (n=9)`, `table swung
   -75%: baseline 16 -> current 4 (n=9)`, `wins disappeared:
   baseline 16 -> current 0 (n=9)`; ARMED identical except NO
   table LOUD line (armed table reads 7 vs baseline 16, a
   -56% swing below the LOUD threshold — itself consistent
   with the real wall movement, table 4 -> 7). Two independent
   reasons, same as the lingerfinish family: (a) the baseline's
   own regime note forbids this comparison (a ~100%-win winseat
   suite vs a tableseat-nowait census substrate); (b) the
   field-shape artifact repeats (per-seed rows carry
   nationalEver/entered/won, not top-level national/table/wins
   paths — table reads only because rows carry a top-level
   `table` invited flag; national/wins read 0 because no such
   top-level path exists). The corpus's real wall numbers are
   nationalEver 7/8 -> 8/8, table entered 3/8 -> 5/8, wins
   3/8 -> 5/8. (n=9 files = 8 rows + summary.json in the glob,
   identical on both bands.)

## Infrastructure notes

- Sweep: scripts/test-partyfinish-sweep.js (copy of the
  lingerfinish driver, policy/recorder/labels swapped), 8 seeds
  each band, per-seed invocations (~2 min/seed, ~16 min/band)
  + detgate ~8 min + sense replay ~4 min + proof ~10 s.
  Corpus: evidence/2026-10-28/perseed-partyfinish-a/ (control/
  + armed/ with 8 rows + summary.json each). Analyzer:
  scripts/test-partyfinish.js (exit 0, GO on all legs).
  Secondary: scripts/test-lingerfinish.js on this band's
  corpora (legs c pass / d miss, reported above, never a
  re-score). Proof: scripts/test-partyfinish-proof.js (GREEN
  12/12, including 4 summary-honesty cases added post-sweep).
  Sense: scripts/test-partyfinish-sense.js (NON-MEASURED replay
  only; 75101 full 180d; trajectory matches the judged armed
  corpus on that seed; 7 sortie lines quoted above, never
  counted).
- Safe-commit index clobber hit the prereg commit (bogus staged
  deletion for the file byte-identical to HEAD — commit itself
  correct, verified by stat + hash before continuing) and a
  stale index.lock (dated before the commit, no holder — a
  sibling's git process in another worktree, not this tree)
  blocked the repair until removed; repaired via HEAD-blob
  cacheinfo, verified status clean + diff HEAD empty, before
  any sweep ran on the affected state. The final commit below
  must be checked the same way before this run is called done.
- check.js --quick: NOT run by this worker, deliberately. Two
  sibling check.js --quick runs were in flight in other
  worktrees at the time (tackle-map, journey-deepening), and
  the repo rule is never concurrent jest (concurrent runs
  have produced phantom failures). The proofs of record
  remain the analyzer (exit 0), the detgate (PASS), the sweep
  corpus gates (PASS both bands), the proof test (GREEN
  12/12), the two summary regression tests (20261013 GREEN;
  20261012's single failure identical on pristine HEAD), and
  the byte-identical spot-check row. The coordinator/ship
  loop's check remains the gate before any push — this arm
  does not claim check.js green.
- The repo-global stash stack was listed during the pristine
  comparison (two entries, another lane's WIP) and NEVER
  touched: no pop, no drop, no checkout of stash entries.
  The pristine comparison used a /tmp file copy + cp restore
  of this worker's own file, never `git checkout --` on a file
  with uncommitted work (the HEAD-CHECKOUT RESTORE TRAP lesson).
- Branch ready, pending coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line, not
  this arm's).
- Heartbeats: tree heartbeat after registration, before each
  sweep band, and after the detgate — all landed.

## Findings for the coordinator (NOT appended by this worker)

- [measured-GO] 2026-10-28 — cornered-party hold — sortie
  finishes 0 -> 18 counted (all party 3, all 1 HP, all round 1,
  gear recorded), wins 3 -> 5, wave-4 reach 6 -> 8, table
  entered 3 -> 5, cost bar passes (median 146 -> 140d,
  starvation 1 -> 1). GO; mechanism + driver + summary fix
  land in this commit with [needs-eyes] (combat change).
- [open] 2026-10-28 — wave-4 toll-wounded finishes still miss
  (4 -> 3 on the lingerfinish census) — big beasts at 0.75
  fraction are not finished by a held round 1. Needs its own
  mechanism question + prereg, not a re-score of this run.
- [open] 2026-10-28 — trick-aware cornering — held wave-3
  beasts that spend the held round on a known trick (sanjun
  shout, spool wait, callback farewell) still leave. Question
  for the next arm: should a cornered party strike instead of
  performing the trick, or is the trick-spend the honest
  outcome? (Stated as a question, not a call.)
- [open] 2026-10-28 — deaths rise under the acting policy
  (286 -> 312, sortie-combat deaths 22, one won -> lost seed
  flip 75104) against four survival-improvement flips the other
  way, counted honestly: 75102 lost -> survived, 75106/75107/
  75108 lost/survived -> won. Any successor arm must reckon
  with
  the death count, not just the win count.
- [open] 2026-10-28 — the cornered hold itself is narrated
  only through the kill summary's cornered clause, never as a
  spoken beat (CORNER_LINES=0 in the sense replay). A future
  narration pass could speak the cornering itself.
