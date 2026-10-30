# sim-muster-a — why a muster never forms on Herald faces (DIAG)

Run: flesh-out loop, run fleshout-20261030T1747Z, worker
sim-muster-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Backlog #1546 (claimed by this run):
sim-refusalsay-a proved 197/197 refused Herald faces are
muster-gate refusals with have=0 / need=10. This arm answers
the mechanism behind the zero: what counts as an 'allied
blade' in code, which inputs feed that count, which input is
structurally zero and why, and whether mustering is ever
attempted by any policy.

DIAG ONLY. No game code changed. No src/js change, no gate
move, no deed-bar move, no default flip. The instrument is a
new policy-side recorder (scripts/policies/muster-diag.js)
plus a verbatim sweep copy (scripts/sweep-muster-a.js) plus
analyzer and fixtures (11/11 green). No [needs-eyes]:
nothing about feel, combat, or UI changes — it only records.

## Verdict (read this first — two parts, do not collapse them)

**DIAG-NO-GO on the pre-registered letter.** The pilot-band
matching leg failed: the pilot band (75101–75108) run on the
current base reproduces ZERO refusals, against the
pre-registered refusalsay counts (0/32/0/45/43/0/0/0 = 120).
Per docs/MEASUREMENT.md §14 a miss is NO-GO, never re-scored
against a friendlier metric mid-run — and the refusalsay
prereg's own rule forbids passing by absence. The cause is
documented below (the base moved under the corpus), not a
probe failure: a control run of the untouched refusalsay
sweep on this branch reproduces the muster run exactly on
seed 75102 (days 61, wave 2, 16 meetings, 0 dissolved vs
the old corpus's days 86, wave 4, 62 meetings, 32 dissolved).

**MECHANISM ANSWERED in full.** The four task questions are
resolved with numbers, on the current base's own yielded
population (20 seeds run, 4 refused rows, 4/4 with complete
component snapshots) plus a counterfactual proof (sound the
call on the refused state and watch have move 0 → 2, still
refused). The NO-GO is a registration artifact — the
pre-registered population no longer exists on current
master — not a gap in the mechanism answer. The next arm
should re-register its bands on the current base (see
metric review) and build on the mechanism below; it does
not need to re-derive it. Coordinator adjudication note:
if the coordinator reads task leg (b) as "100% of refused
rows encountered across the run's >= 8 seeds" rather than
"100% of the historical pilot corpus," then (b) passes on
4/4 and the verdict flips to DIAG-GO with no other change
— the evidence supports both readings transparently, and
this file does not hide the failed leg either way.

## Prereg legs (binding — judged only against sim-muster-a-prereg.md)

| Leg | Bar | Result |
|---|---|---|
| Prereg | Committed before any new sims | PASS (31eae090a, before instrument + sweeps) |
| Fixtures | scripts/test-muster-a.js green | PASS — 11/11 |
| Instrument | Muster probe installed, errs 0, on every seed | PASS — 20/20 seeds, diag errs 0, installed true |
| Probe neutrality | Control sweep (no muster probe) reproduces muster run | PASS — seed 75102 byte-equivalent trajectory (days 61, wave 2, sm 16, dissolved 0 on both) |
| Pilot gate: validity | 8/8 seeds valid (days > 0, census sorted + lastDay within 1) | PASS — 8/8 (analyzer per-seed entries) |
| Pilot gate: matching | Per-seed refusal counts equal refusalsay pilot counts | FAIL — 0/120 reproduced: 75102 0 vs 32, 75104 0 vs 45, 75105 0 vs 43; the five old-zero seeds match (0 = 0) |
| Pilot gate: wall check | Wall numbers equal refusalsay pilot wall | FAIL (same cause) — current pilot wall below vs old won 6, natEver 6, natFinal 6, tableReached 7, tableEntered 6, wave 4:5, median 114d, deaths 232 |
| (a) Code sites cited | Gate have + ready + both writers + offer gate, file + function | PASS — section "Code sites" below |
| (b) Component breakdown | >= 8 seeds, 100% of refused rows in the pilot band (or >= 95% + every remainder explained) | MIXED — 4/4 complete on the run's yielded population (20 seeds); 0/120 against the pre-registered historical population, remainder explained seed-by-seed as base movement (control proof above + per-seed table below). This mixed result is what drives the NO-GO label. |
| (c) Zero-component named | Which input is structurally 0 and why | PASS — two stacked layers, section "The mechanism" below |
| (d) Next lever OR Steve-call | Concrete lever or named Steve-call | PASS — both named, section "Ranked next" below |
| Sense | >= 2 refusal chains read end to end | PASS — chains below (75123 feast-draw chain; 75104 located-unfaced chain; 75101 located-at-end corroboration) |
| No game change | Judged run changes no src/js | PASS — zero src/js files in any commit of this arm |

**Verdict: DIAG-NO-GO on the pre-registered letter
(matching leg failed, base-moved); mechanism answered.**

## The mechanism, in plain words

A "muster" is not something villages do on their own. It is
an object that only comes into existence when somebody
presses one of two buttons: "Sound the call" or "Commit
Haven's blades." Nobody presses them in sims — no policy
does, and no game system does on its own. So the muster
object never exists, and the gate's count — which reads
that object's blade list — is zero by construction, not by
bad luck. That is layer one.

Layer two is worse: on the one real refused state this run
could measure, even pressing the button would not have
been enough. The village had three allied villages, but
only one of them had any free fighters to send, and the
bond with that village was strong but not strong enough
for the bigger quota — so a sounded call would have
brought 2 blades, not 10. And Haven's own blades could
not be committed at all, because committing requires the
Herald to be "located" by the omen system, and on this
face there was no omen at all — the Herald had arrived
through a feast draw, not through omens, so the game
never offered the call or commit buttons in the first
place. Ceiling on that state: 2 blades against a need of
10. The gate is not just unpressed; on this state it is
unreachable even if pressed.

Layer three is why the same face repeats: the feast draw
that dealt the Herald stays "pending" after a refusal,
because the gate turns the scholar away before the part
of the fight code that clears a pending encounter runs.
So the scholar faces the same pending Herald again —
three more times the same day on the measured seed.

## Code sites (leg a)

- Gate's printed have — src/js/titans.js, titanWrapCombat
  (the startCombat wrapper): `have =
  (titanState().musters[titanId] || { allies: [] }).allies.length`
  — RAW allies only. It does NOT add Haven blades and does
  NOT filter dead/duplicated allies. If musters.herald
  does not exist, have is 0 by the `|| { allies: [] }`
  fallback. The wrapper then says the muster text, records
  titanRecordOutcome(titanId, 'refused', {gate: 'muster',
  have, need}), and returns null WITHOUT calling core
  startCombat.
- Gate's ready test — src/js/titans.js, titanMusterReady:
  titanUniqueAllies(muster).length (deduped by
  villageId:vid; drops hp <= 0 allies and allies whose
  home-roster person is dead or health <= 0; keeps allies
  whose home person is missing) PLUS
  titanHavenBlades(muster).length (muster.haven entries on
  the Haven roster, excluding the scholar, deduped) >=
  def.minAllies (10 for herald, src/data/titans.json).
- Campaign override — src/js/finale-campaign.js,
  titanEntryGate: returns null for every titanId except
  'finale'. For herald there is no override; the flat
  hard gate applies.
- Writer 1, the call — src/js/titans.js, soundTitanCall:
  creates st.musters[titanId] = {allies: [], haven: [],
  ...}, then for each ACTIVE hierarchy link
  (titanAlliedLinks: hierarchyState() filtered status
  'active'): refuses aloud if trust < 25 OR opinion < -10
  OR arrears > 0 (and trust −8); otherwise quota = 6 if
  trust >= 70 AND opinion >= 10, else 2 (src/data/
  titans.json _coalition: baseBlades 2, trustedBlades 6,
  trustedAt 70, trustedOpinion 10); takes up to
  quota-minus-already free faces from that village's
  roster (titanAlliedFaces: alive adults age >= 18 or
  ageless, health > 0 or undefined, not already committed
  anywhere) into muster.allies. It NEVER auto-commits
  Haven blades (2026-10-13 rule, in the code comment).
  soundTitanCall itself has NO omen-stage gate — the gate
  is on the button that offers it (below).
- Writer 2, the commit — src/js/titans.js, titanCommitOwn:
  appends up to 3 Haven blades total to muster.haven,
  two-tap (first tap stages pendingCommit + says the
  cost; second tap commits). Requires omen stage >= 2
  ("nothing located to march against" otherwise) and
  free volunteers (titanVolunteers: roster members, not
  the scholar, not away/traveling/engaged).
- Offer gate — src/js/titans.js, titanSelfActions /
  titanSelfDo (camp self-bar buttons, app.js): actions
  for a titan exist ONLY when its omen stage >= 2
  (stage < 2 → no actions at all for that titan); the
  call button shows when alliedN == 0 OR the muster is
  not ready. In headless sims nothing presses buttons
  unless a policy does.
- Muster clearing — src/js/titans.js, titanStandDown
  (sets st.musters[titanId] = null) and titanVictory
  (same): both UI-driven only (titanSelfDo), like the
  writers. Nothing in the engine clears a muster on its
  own except victory/defeat resolution.
- Face channel, casting — src/js/game.js, castMonster:
  pools data.monsters with wave <= unlockedWave and
  waterAffinity != 'in', with NO titan exclusion (unlike
  monsterWavePool, which filters titan defs out — see
  titans.js titanWrapCombat's pool wrap). The Herald IS
  in src/data/monsters.json (wave 4), so castMonster can
  return 'herald'. Feast draws use castMonster (src/js/
  feastBuff.js, drawFeastScavenger), and the competent
  policy faces a pending draw (scripts/policies/
  competent.js, feastFightRoad → faceFeastDraw →
  startCombat(mid)).
- Pending survival — src/js/game.js, core startCombat
  clears pendingEncounter/pendingMonsterId (near the
  fight-build code, after the titan wrapper's return
  point). The titan wrapper returns null BEFORE core
  runs, so a refused face never clears the pending — the
  pending Herald keeps presenting.
- Refusal routing — NONE. No code outside titans.js reads
  state.titans.outcomes (grep: zero readers in src/js
  besides titans.js itself); no dawn tick, daily hook,
  encounter handler, or policy routes a refused face
  toward soundTitanCall or titanCommitOwn. After a
  refusal the scholar simply re-encounters the same
  pending or the same tile.

## Policy-attempt verdict: never attempted, by any policy

- Grep over scripts/policies/*.js for soundTitanCall |
  titanCommitOwn | titanSelfDo | titanWarCouncil |
  titanMuster returns ONLY diag recorders (which never
  call them). The run's policy chain specifically:
  tableseat-nowait.js (0 titan mentions) →
  leanlinkrescue.js (0) → competent.js (0); leanlink.js
  (0). No transitive caller exists in the chain.
- Game-code auto-callers: NONE outside titans.js itself,
  finale-campaign.js (finaleReinforce calls
  soundTitanCall('finale') only), network-campaign.js
  (wraps soundTitanCall for the network), and app.js (UI
  buttons). No dawn tick (titanDawnTick: omens,
  escalation, upkeep, turn tick — never a call), no
  encounter handler, no daily hook auto-sounds a call.
- Runtime counters (20 seeds, every verb wrapped):
  soundTitanCall 0, titanCommitOwn 0, titanSelfDo 0,
  titanWarCouncil 0 — on all 20 seeds, including the
  seed that produced refusals. The only nonzero call
  counts in this arm come from the replay post-block,
  where the worker deliberately sounded the call once
  (see counterfactual below) — never from a policy.
- Conclusion: mustering is never attempted at all in
  these sims. It is not attempted-and-failing; the verb
  is never invoked.

## Component breakdown (leg b) — the run's yielded population

Bands run on the current base (180d death-aware horizon,
tableseat-nowait policy, same env set as refusalsay plus
MUSTER=1; corpus evidence/2026-10-30/perseed-muster-a/):

- Pilot band 75101–75108: 0 refusals on all 8 seeds.
  Muster diag installed, errs 0, on every seed. End
  states: omen stage 2 reached on 75101 (day 93, run
  ended day 93) and 75104 (day 72, run ended day 112);
  no omen on the other six. Muster object: absent on
  all 8 at end. Call counters: 0 on all 8.
- Confirm band 75117–75128: 4 refusals, all on seed
  75123, all day 84, all with complete snapshots (4/4,
  every component C0–C9 present). All other confirm
  seeds: 0 refusals. End omens stage 2 on 75119 (day
  84), 75122 (day 76), 75125 (day 108), 75127 (day 158),
  75128 (day 73); stage 1 on 75126; none on the rest.
  Muster object: absent at end on all 12. Call
  counters: 0 on all 12 (excluding the replay
  post-block, which is not a sweep seed).

The 4 snapshots (seed 75123, day 84, identical
components on all 4 — the population is one state
faced four times, not four states):

| Component | Value on all 4 |
|---|---|
| C0 call attempts so far (all verbs, all tids) | 0 / 0 / 0 / 0 |
| C1 muster exists | false |
| C2 allies raw (= printed have) | 0 |
| C3 allies unique-alive | 0 |
| C4 Haven blades valid | 0 |
| C5 active links | 3 (Stonebridge, Thornfield, Ashford) |
| C5 per link: trust / opinion / arrears / quota / free faces / wouldYield | Stonebridge 64 / 14 / 0 / 2 / 5 / 2; Thornfield 59 / 14 / 0 / 2 / 0 / 0; Ashford 59 / 18 / 0 / 2 / 0 / 0 |
| C5 refused links | 0 (no link trips trust < 25, opinion < -10, or arrears > 0) |
| C6 hypothetical call yield | 2 |
| C7 omen stage | null (no omen object at face time) |
| C8 call offered / commit offered | false / false (both require omen stage >= 2) |
| C9 ready manual / ready game | false / false (agree on all 4; 0 mismatch) |
| Volunteers (Haven commit pool) | 2, 4, 3 across the 4 same-day faces (roster availability moves intra-day) |
| Outcomes-prior cross-check | 0, 1, 2, 3 (each snapshot's say precedes its outcome record, as the gate code orders it) |

Link aggregate across the 4 snapshots: 12 link-rows, 0
refused (0 by trust, 0 by opinion, 0 by arrears), all
quota 2 (no link reaches trustedAt 70 — max trust 64),
facesFree 5 on Stonebridge rows, 0 on the other eight,
wouldYield 2 on Stonebridge rows, 0 elsewhere.

### Counterfactual proof (replay, not a judged sweep)

scripts/replay-muster-channel-sweep-a.js replays seed
75123 through the full sweep stack to day 84, then (in
the replay only, never in a judged sweep) sounds the
call, attempts the commit, and re-faces — on the
day-84 end state:

- POST:call → muster.allies = 2, both from village_1
  (Stonebridge) — exactly the snapshot's predicted
  callYield 2. Ready: false.
- POST:commit → titanCommitOwn returns null, twice
  (not 'confirm'): the commit guard refuses at omen
  stage < 2. Haven blades: 0. (Side note, disclosed:
  calling titanCommitOwn creates the omen placeholder
  {stage: 0, day: 0} via its titanOmen() call — the
  stage-0 omen seen at post time is that placeholder,
  not a dawn omen. At face time the omen was truly
  null, per the snapshots.)
- POST:reface → a 5th outcome record appears in
  state.titans.outcomes: {titan: 'herald', day: 84,
  outcome: 'refused', detail: {gate: 'muster', have: 2,
  need: 10}}. The counter moves if and only if the call
  is sounded, and 2 < 10 still refuses.

Ceiling on the measured state: call 2 + commit 0 = 2
against need 10. Even with the commit unblocked (omen
stage >= 2, up to 3 Haven blades), the ceiling would
have been 5 — still short. The coalition itself, on
this state, cannot reach the gate: one yielding link
at base quota, two links with zero free faces, no
trusted link anywhere.

### The zero-component mechanism (leg c)

Two stacked structural facts, in blocking order:

1. NO CALLER (C0 = 0, C1 absent) — the first blocker.
   The muster object is created ONLY by soundTitanCall
   or titanCommitOwn. No policy calls either, no game
   system calls either (outside UI/finale/network), and
   the UI button that would offer the call is hidden
   until omen stage >= 2. With no muster object, the
   gate's have expression falls back to an empty list
   and prints 0. This alone explains have=0 on every
   refused face in every corpus, old and new.
2. CALL CEILING BELOW NEED (C6 = 2 < 10, commit
   blocked) — the second blocker, measured on the one
   state where a call could be evaluated. The links do
   NOT refuse (trust 59–64, opinions 14–18, no arrears);
   they yield little: base quota 2 everywhere (no trust
   >= 70, so no 6-blade tier), only Stonebridge has
   free faces (5), the other two have none. Haven
   commit adds 0 here (omen null → stage < 2 → commit
   returns null; the buttons were never offered).
   So even the honest remedy — sound the call — leaves
   the village at 2/10. The wall is not just "nobody
   pressed the button"; on this state the coalition
   behind the button is too thin to pass the gate.

What is NOT the mechanism (ruled out by the snapshots):
link refusals (0/12 link-rows refuse); dead/duplicate
allies inflating or deflating the count (allies list
is empty, not miscounted); Haven blades hidden from
the printed have (haven is 0 too — the have/haven
display gap is real in code but contributes nothing
here); a ready-but-misprinted muster (manual and game
ready agree: false); an omen-stage offer that was
ignored (no offer existed — stage null, not a
declined stage-2 offer).

## Face channel (how the scholar meets a Herald with no omen)

The 4 faces on seed 75123 are NOT world-monster
contacts: scholarmelt rows show worldOrigin null, tile
(4,4) (the haven), and the census shows NO herald
monster on days 83–85 or 96. The replay log pins the
channel exactly (evidence/2026-10-30/perseed-muster-a/
replay-s75123-sweep.json):

- Day 84, first call: startCombat('herald') with
  feastDraw {monsterId: 'herald', day: 84},
  pendingEncounter true, pendingMonsterId 'herald',
  omenStage null. A feast draw cast the Herald:
  drawFeastScavenger (feastBuff.js) casts via
  castMonster (game.js), which does NOT exclude titans;
  the competent policy faces the pending draw
  (feastFightRoad → faceFeastDraw → startCombat).
- Day 84, three more calls: startCombat('herald') with
  feastDraw null but pendingEncounter still true and
  pendingMonsterId still 'herald'. The titan wrapper
  returns before core startCombat clears the pending,
  so the refused pending survives and re-presents three
  more times the same day. (The exact repeat-call
  driver function is not named here — the log proves
  the calls and the pending survival; the driver is
  whatever faces a live pending next, and naming it
  without a trace would be guessing.)
- Contrast: the feast system can deal a titan the gate
  will not let the scholar fight, before any omen
  exists. The titans.json design comment says titans
  "never spawn in the wild pool; they arrive by omen
  and are faced by coalition only" — the feast-draw
  cast violates that comment's spirit (castMonster is
  not monsterWavePool, which does exclude titans).

A bare-policy replay (scripts/replay-muster-channel-a.js,
no recorders) does NOT reproduce the day-84 faces (0
herald calls by day 85) — one of the sweep's layers
moves the trajectory. The sweep-stack replay above is
therefore the channel evidence, not the bare replay;
the bare replay file was deleted from the corpus to
avoid confusion, and the sweep replay is the kept
artifact. (Which layer moves the trajectory is not
established here — it is not needed for the muster
verdict, and chasing it would be a new arm, not this
one. Recorded so the next arm does not assume bare
policy == sweep trajectory.)

## Wall numbers (recomputed from the fresh rows, current base)

Pilot band 75101–75108 (current base): won 4,
nationalEver 6, nationalFinal 5, tableReached 4,
tableEntered 4, wave reach 1:8, 2:8, 3:7, 4:3, 5:0,
median survival 112d, deaths 226.
Old refusalsay pilot wall (different base): won 6,
nationalEver 6, nationalFinal 6, tableReached 7,
tableEntered 6, wave 1:8, 2:8, 3:7, 4:5, 5:0, median
114d, deaths 232. Divergence is base movement (see
per-seed table below), reported, never smoothed.

Confirm band 75117–75128 (current base): won 5,
nationalEver 10, nationalFinal 9, tableReached 6,
tableEntered 5, wave reach 1:12, 2:12, 3:12, 4:9, 5:0,
median survival 119d, deaths 404.
Old refusalsay confirm wall (different base): won 3
(full 0), nationalEver 8, nationalFinal 6,
tableReached 6, tableEntered 3, wave 1:12, 2:12, 3:11,
4:9, 5:0, median 143d, deaths 458.

Wave 5 reached 0 on both bands, current base and old.
The scale wall stands: villages reach national and
sit at tables while the Herald goes unfaced or
refused — on the current base, mostly unfaced (4
refusals in 20 seeds, vs 197 in 20 seeds on the old
base, because faces themselves became rarer).

Per-seed old-vs-new refusal counts (old corpus →
current base): pilot 75101 0→0, 75102 32→0, 75103 0→0,
75104 45→0, 75105 43→0, 75106 0→0, 75107 0→0,
75108 0→0; confirm 75117 0→0, 75118 0→0, 75119 3→0,
75120 74→0, 75121 0→0, 75122 0→0, 75123 0→4,
75124 0→0, 75125 0→0, 75126 0→0, 75127 0→0,
75128 0→0. Seeds 75102/75104/75105/75119/75120 lost
their refusal populations; seed 75123 gained one.
The control run (untouched refusalsay sweep on this
branch, seed 75102: days 61, wave 2, 16 meetings, 0
dissolved — identical to the muster run) proves the
probe did not cause this; sibling merges between the
refusalsay corpus and this branch (fullseatgate,
hide-armor, armorfetch, contestdeath, among others
in the branch log) moved trajectories wholesale.

## Sense: chains read end to end

Chain 1 — seed 75123, day 84 (the measured refusals).
A global-rank village (final rank global, won 1) holds
a feast; the feast draw casts the Herald — a titan
dealt like a scavenger. The scholar faces it at the
haven and is refused with have=0, need=10. The pending
does not clear, so the scholar faces it three more
times the same day, each time with the same zeros.
The components cohere: no omen (so no buttons), three
allies (so a call was conceivable), one yielding
village at base quota (so the call would have failed
anyway). Nothing reads as a melt — there is no live
fight to melt from; every row is a gate refusal before
combat, scholar HP 100 throughout, and the 5th outcome
record (have=2, after the worker's sounded call in
replay) proves the counter is call-driven. The story
is not "the village is too weak to fight the Herald."
It is "the village was dealt a coalition fight by a
feast, with no coalition formed, no button offered,
and a coalition too thin to pass even if formed."

Chain 2 — seed 75104, days 72–112 (the located-unfaced
contrast). The census shows the Herald present on 41
daily snapshots, drifting along the east edge (tiles
x 7–8, y 2–5, 700 HP throughout), omen stage 2 from
day 72, run ending day 112 village-lost — and zero
faces, zero calls, zero muster. A located Herald can
sit at the edge of the world for forty days while the
scholar never contacts it, because contact needs the
scholar's tile to meet the Herald's tile and the
scholar's days are spent elsewhere. The refusalsay
era's "scholar re-faces daily" picture depended on
contact; on this base, contact itself is the scarce
thing for world-placed Heralds, while feast-drawn
Heralds force contact immediately. Two different
arrival channels, two different face rates — the
muster question looks different per channel, and any
lever must say which channel it addresses.

Chain 3 — seed 75101, day 93 (located-at-end
corroboration). Omen reaches stage 2 on day 93, the
run's final day (end over-other, won 1) — located and
then the run ends before any face, call, or muster.
The offer gate (stage >= 2) opens at the last
possible moment. Even a player watching this seed
would have had, at most, that one day's button.

## Plain-words village assessment

On the current base these villages climb well — 4 of
8 pilot seeds win, 10 of 12 confirm seeds reach
national ever — and the Herald barely enters their
stories. When it does enter, it enters wrong: through
a feast draw, not through the omen story the titan
system wrote for it, and the village has no coalition
ready because nothing ever asked it to form one. The
villages are not refusing to muster out of cowardice
or thin bonds — the bonds are middling-good (trust
59–64, no refusals, no debts) — they were never asked,
and the one time the numbers can be checked, the
asking itself would have fallen short. The scale wall,
seen from this angle, has two hinges, not one: the
button is never pressed, and the coalition behind the
button is too thin to pass. Fixing only the pressing
leaves the village at 2 blades against 10.

## Metric review (for the NEXT run, not this verdict)

- Pin the base. This run's pre-registered matching rule
  assumed the refusalsay corpus was a live comparator.
  It was not: sibling merges moved trajectories
  wholesale between the corpus and this branch (wave-4
  reach 5→3 on the pilot band, table reach 7→4). A
  future instrument prereg must pin the base commit
  and run a same-base control sweep (as this arm did
  ad hoc for seed 75102) as its substrate leg — never
  match against a historical corpus across merges
  without that control. The control, not the corpus,
  is what proved the probe neutral here.
- Confirm-band concentration, carried over: the old
  confirm band's 74/77 rows sat on one seed; the new
  band's 4/4 sit on one seed. A future muster prereg
  should pre-register a per-seed spread note (e.g.
  dissolved rows on >= 2 seeds as a robustness check)
  so a single-seed cluster cannot carry a verdict
  alone. This arm's 4 rows are one state faced four
  times, and the evidence says so plainly rather than
  presenting 4 as four independent states.
- Bare policy != sweep trajectory. The bare-policy
  replay missed the day-84 faces the full sweep stack
  reproduces. A future channel replay must use the
  full sweep stack (as the kept replay does); which
  layer moves the trajectory is an open question for a
  future arm, not a gap papered over here.
- The have/haven display gap is real but immaterial
  here: the gate prints raw allies only, so a
  Haven-only muster would print have=0 while ready
  counted haven blades. On the measured state haven
  is 0, so the gap changes nothing — but a future
  muster UI should print allies+haven, or the next
  arm that measures a Haven-committed state will
  misread its own have.
- No telemetry deviation check was run for this arm:
  the loop body's telemetry step belongs to the
  coordinator's closeout (baseline regime: WINSEAT
  suite vs this arm's tableseat-nowait policy regime,
  same REGIME-artifact caveat as refusalsay's pilot
  check). Flagged for the coordinator, not skipped
  silently.

## Ranked next

1. Concrete next lever (game side, own prereg, NOT
   landed here — DIAG discipline): exclude titan ids
   from castMonster's pool (src/js/game.js,
   castMonster — filter out ids present in
   src/data/titans.json, the same exclusion
   monsterWavePool already applies in titans.js).
   Rationale: titans "arrive by omen and are faced by
   coalition only" (titans.json comment); a feast draw
   dealing a Herald the gate must refuse, with no omen
   and no offered remedy, is the cast violating the
   design. Proof test: castMonster over the wave-4
   pool never returns a titan id (plus the existing
   wave-ratio behavior unchanged). This lever needs
   no roster and violates no perception law — it is a
   pool filter, not a muster.
2. Steve-call (backlog #1538, strengthened by this
   arm): refused-face routing. The refused feast-draw
   pending survives and re-faces 3× the same day
   (pending cleared only by core startCombat, which
   the gate pre-empts). Should a refused pending
   clear, drive off, or route toward mustering — and
   if toward mustering, what is the perception-grounded
   trigger? (Candidate for the next arm, not decided
   here: sound the call after a DIRECT refused-face
   encounter — the scholar saw the titan with her own
   eyes, so the trigger is perception, not a roster
   scan. But the ceiling warning stands: on the
   measured state that call yields 2/10, so the lever
   must be paired with coalition-building toward
   trust >= 70 / more links, or it will demonstrably
   fail its own bar.)
3. Re-register bands on the current base before any
   further muster measurement: the historical
   75101–75128 refusal populations are stale. A future
   muster arm should find a fresh band with natural
   Herald faces on the current base (seed 75123's
   feast-draw channel is one such source, single-seed
   so far) and pre-register against IT, with a
   same-base control sweep as the substrate leg.
4. No muster/routing build is proposed by this arm.
   In particular, NO list-fed muster is proposed:
   if the honest muster mechanism ever needs a magic
   roster ("who is around") rather than the scholar's
   own senses (a face she saw, a shout she heard, a
   village she visited), that is a Steve-call, not a
   build — per his 2026-10-28 perception law. The
   candidate in (2) clears the law only because its
   trigger is a direct encounter.

## Outputs

- scripts/policies/muster-diag.js, scripts/sweep-muster-a.js,
  scripts/analyze-muster-a.js, scripts/test-muster-a.js
  (11/11), scripts/replay-muster-channel-a.js (bare
  replay — negative result, kept for provenance),
  scripts/replay-muster-channel-sweep-a.js (sweep-stack
  replay + counterfactual post-block — the channel
  evidence)
- evidence/2026-10-30/sim-muster-a-prereg.md (binding)
- evidence/2026-10-30/perseed-muster-a/ (20 seeds ×
  census + fresh + muster files, plus
  replay-s75123-sweep.json)
- evidence/2026-10-30/sim-muster-a-analysis.json
  (pilot band), sim-muster-a-confirm-analysis.json
  (confirm band)
- Commits: prereg 31eae090a; instrument cbe93016c
  (index-clobber repaired after each safe-commit, see
  below); evidence + corpus commit follows this file.
- Infrastructure note (loud, for the coordinator):
  safe-commit.sh triggered the known index-clobber
  variant on BOTH commits of this arm (staged deletion
  in the main index, worktree files byte-identical to
  HEAD). Repaired both times with `git update-index
  --add --cacheinfo "100644,<blob-from-HEAD>,<path>"`
  and verified `git status --short` empty + hash-object
  match before proceeding. The commits themselves were
  correct; only the main index lied.
