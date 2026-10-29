# sim-funnel-a — SURVIVOR-FUNNEL PICK-TIME DIAG: DIAG-GO

Run: flesh-out loop, run fleshout-20261029T0145Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-funnel-a.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes. This arm decomposes the
returns-a funnel (19 survivor triples -> 1 HUNT departure -> 0
meetings) at PICK time. The blank is a measurement blank, so this
complete, classified decomposition IS the fill.
Preregistration (binding, content frozen BEFORE any judged row
existed): evidence/2026-10-29/sim-funnel-a-prereg.md (commit
831cd186b; content sha256
26c3272f682b12f0d47cbb1933f85502417e68e6be6db176448e888ee40ac515,
frozen 2026-10-29 01:53 UTC — see the infrastructure note for why
the commit timestamp reads 02:45 UTC).
VERDICT: DIAG-GO — all three prereg GO legs pass (19/19 triples
classified, 19/19 losses assigned, determinism byte-identical),
neutrality reproduction exact, sense bars pass. No wall movement
is claimed from re-analysis.

## Plain words first

Nineteen villagers survived a wave-4 fight with a memory to act
on. Here is what actually happened to each of them, in order of
how far they got:

- 5 died before they ever picked another errand — all five on
  the very day of the fight (monster, thirst, starvation). They
  survived the beast and lost the day.
- 9 were OFFERED the hunt back — the game put the trip in front
  of them, fresh memory, armed, in range — and every single time
  they chose something else instead: water, food, chores, a
  visit. Twenty-two offered picks, zero hunts taken. Dinner beat
  revenge, 22 to 0.
- 2 were blocked at the gate while the memory was still fresh:
  one had just fled and was resting off the fright (the game
  will not offer a hunt to someone still catching their breath);
  one is a homebody whose roaming range is zero tiles, so no
  hunt can ever be offered to her at all.
- 1 had her memory pushed out by newer memories after 35 days —
  but the real story there is the range gate again (below).
- 2 actually picked the hunt. One of them walked out two days
  later and found an empty tile. The other's hunt was replaced
  the same day by dinner, and the next day she hunted a
  different beast instead.
- 0 died of staleness alone. Nobody's story is "the memory got
  too old before they could choose" — staleness shows up as a
  phase inside other stories, never as the headline.

So the funnel's binding break is not the one returns-a guessed
first. It is the lottery: the hunt offer exists, it fires, and
it loses to thirst and hunger almost every time. The second
break is the same-day death: more than a quarter of survivors
never live to the next dawn pick. Fixing staleness alone would
move nothing on this band — there is no pure-staleness triple
to fix.

## Header (pre-registered) vs result

- GO LEG 1 — all 19 triples classified: RESULT 19/19 -> PASS.
- GO LEG 2 — at least 18/19 losses assigned a mechanism class:
  RESULT 19/19 assigned, OTHER 0 -> PASS.
- GO LEG 3 — determinism, seed 75106 re-run into a scratch dir:
  RESULT byte-identical (cmp clean) -> PASS.
- NEUTRALITY GUARD (exact before any decomposition is judged):
  returns channels of the funnel corpus deep-equal the
  returns-a corpus per seed (fieldparty meetings, returns
  meetings/departures/drops), wall fields identical, death
  totals identical: judgedA 42, judgedB 31, classes ACCIDENTAL
  39 / MEMORY-ONLY 3 / DELIBERATE 0, chains 13 all STILL-ALIVE,
  HUNT departures 326 (wave-4 1), HUNT true drops 297 (wave-4
  1), per-seed judgedA identical, wall wins 4/16 all lesser,
  full 0/16, nationalEver 13/16, nationalFinal 9/16, table
  10/16, entered 4/16, wave-4 11/16, wave-5 0/16, median 180
  capped, deaths 600, starvation 4, recorder errs 0 (all three
  recorders), overflow 0, join errors 0 -> PASS. The funnel
  recorder drew no RNG and wrote no game state.
- SENSE BAR: >= 1 full survivor-triple trace quoted verbatim
  (S1) AND the HUNT lottery mechanism quoted via the pick
  fixture (S2) -> PASS (both below).
- No re-scoring: no metric was changed mid-run. The one
  correction made during sense review (S3 sub-cause priority,
  superseded outranks later death) changed a SUB-STRING only —
  no class, no count, no GO leg moved. It is documented under
  "metric review" for the next run's prereg to adopt formally.

## The taxonomy (19 triples, all assigned)

Counts sum to 19. A pick counts once per triple whose window
contains it, so triple-window pick incidences (210) exceed the
corpus's distinct pick records (183) — a villager with two
triples (catalina_reyes holds two) contributes her picks to
both. Offered incidences (36) are distinct picks (one candidate
per pick, so no double-count there).

- LOTTERY-LOST 9 (47%): fresh candidate offered, HUNT never
  chosen. 22 offered picks, chosen: EAT 8, WATER 7, FORAGE 2,
  HAVEN_CHORE 3, VISIT 2 (across the 9 triples' offered picks).
  Per triple: catalina/influencer 2 offered, both EAT;
  catalina/eulogy 2, both FORAGE; visjoin_102/eulogy 3, all
  WATER; app_mgpsphm923/eulogy 1, WATER; app_mgpsphm923/
  reunion 1, HAVEN_CHORE; ava_garcia/eulogy 3, EAT/VISIT/WATER;
  app_mgpspj23354/algorithm 2, WATER/EAT; app_mgpspj23354/
  reunion 5, EAT 3/HAVEN_CHORE/VISIT; chantal_mukendi/reunion
  3, all EAT.
- DIED-BEFORE-PICK 5 (26%): no pick record after the anchor
  fight; death on the anchor day in all five (monster 3,
  thirst 1, starvation 1). The recorder would have captured any
  intervening pick while the memory was held, and none exists —
  so the same-day flag is a granularity caveat, not a doubt
  (see metric review). diana_osei/reunion d87 thirst;
  visjoin_109/suburb d112 monster; visjoin_156/eulogy d171
  monster; priya_nair/reunion d123 starvation; app_mgpsphcq161/
  reunion d131 monster.
- GATE-BLOCKED-AT-PICK 2 (11%): fresh memory at pick time,
  candidate null. diana_osei/eulogy: pick d86, post-flee
  resting true (she fled that day; the game rests her, it
  does not offer her a hunt). visjoin_174/eulogy: picks d177
  (age 1) and d179 (age 3), maxD 0 — a homebody; the range gate
  (1 <= distance <= maxD) can never pass when maxD is 0.
- MEMORY-OVERWRITTEN 1 (5%): visjoin_138/algorithm — headline
  per prereg (last episode d141..d176 closed by eviction), but
  read the decomposition below: the binding block was the range
  gate in the fresh window, not the eviction.
- PICKED-NEVER-DEPARTED 1 (5%): visjoin_113/eulogy — HUNT
  picked d135 (huntDay 132), superseded the same day by an EAT
  pick, then a gallowdeer HUNT picked d136 and departed d136.
  She hunted — just not the eulogy. (Later died d145.)
- DEPARTED-EMPTY-TILE 1 (5%): visjoin_115/eulogy — the
  returns-a attempt, now with pick time: HUNT picked d135
  (huntDay 132, age 3 — the LAST fresh day), departed d137
  (age 5), drop d137 at (5,3), quarry gone.
- MEMORY-STALE-AT-PICK 0, NO-PICK-RECORDED 0,
  DEPARTED-NO-MEETING 0, DELIBERATE-MEETING 0, OTHER 0.
- Survivor -> pick conversion (new, picks add what departures
  could not show): 2/19 (11%) ever picked a wave-4 HUNT;
  survivor -> departure stays 1/19 (5%); pick -> departure
  1/2; departure -> meeting 0/1.

## The three stories that carry the finding

### 1. The double pick: two women, one beast, one morning (d135)

visjoin_115 and visjoin_113 both fought a eulogy at (5,3) on
d132, both held the (5,3) memory, and both picked HUNT for it
on d135 — the last day the memory was fresh. That is the whole
band's wave-4 HUNT picking, both picks, one morning. What
followed splits them: visjoin_115's pick survived the
departure gates and she walked out d137 to an empty tile;
visjoin_113's pick was replaced the same day by an EAT pick,
and the next day she departed on a gallowdeer hunt instead.
The funnel does not fail here for lack of intent — intent
fired twice, on the same morning, for the same beast — it
fails on departure lag (2 days, past freshness) and on
same-day supersession (a picked hunt is not a promised hunt).

### 2. The lottery losses read as people, not noise (sense)

catalina_reyes, offered the influencer hunt twice, chose EAT
twice. visjoin_102, offered the eulogy hunt three times,
chose WATER three times. chantal_mukendi, offered the
reunion hunt three times, chose EAT three times. The fixture
lottery for a fresh memory-holder (sense S2, verbatim below)
draws HUNT 22/200 (11%) against WATER 90/200 (45%) — the
corpus take rate on offered picks is 2/36 (5.6%), both takes
on d135. Nobody in the band is refusing the hunt out of
cowardice or forgetfulness; they are thirsty and hungry, and
the hunt weight (2.0) is a whisper next to a dry cistern
(WATER weight up to 8.5) and an empty belly. A lever that
raises the HUNT weight without answering thirst/hunger will
move the take rate only a little; a lever that offers the
hunt when needs are met, or that lets the hunt carry its own
water/food logic, is the one this decomposition points at.
(The lever itself is the next arm's decision, not this arm's
build — this arm is diag only.)

### 3. The homebody wall (range gate, 2 triples + 1 shadow)

visjoin_174 (maxD 0) picked twice with a fresh eulogy memory
(ages 1 and 3) and was never offered anything: candidate null
both times, because no distance satisfies 1 <= d <= 0.
visjoin_138 (maxD 0) picked three times with a fresh algorithm
memory (ages 1, 2, 3) and was likewise never offered; then
51 stale picks across 32 days; then, on d176, a nightcourt
note pushed the algorithm entry out of the cap-4 store. Her
headline class is MEMORY-OVERWRITTEN per the prereg's
last-episode rule, but her funnel died in the fresh window
on d142-d144, not at the eviction on d176 — the eviction is
an epilogue 32 days after staleness. The next run's prereg
should rank a fresh-window gate block above an eviction
close (metric review). Design fact, not a bug claim:
homebodies (maxD 0) can never be offered a HUNT, ever, on
any memory. Whether that is intended is a Steve-call; the
number is 2/19 triples whose fresh window was un-offerable
for range alone (138, 174), plus diana_osei's post-flee day.

## Sense-testing law (transcripts read, beats quoted)

Verdict: the funnel reads as played sequences — decisions,
delays, and disappearances with human shapes — and the
pick-time records are what make them readable at all. Without
picks, visjoin_113's story would be invisible (no departure
for the eulogy exists); with picks, it is a person changing
her mind twice in two days.

Transcript S1 — visjoin_115's decision window, verbatim
(full trace in evidence/2026-10-29/funnel-a-sense.json):

- PICK d133 part=528 visjoin_115 chosen=HAVEN_CHORE/indoor
  candidate=eulogy@(5,3)/memDay=132 gates={armed:true,
  sheltered:false, postFleeResting:false, maxD:1}
  pre=[["eulogy",5,4,127,3],["eulogy",5,3,132,2]]
- PICK d133 part=530 chosen=EAT candidate=eulogy@(5,3)/
  memDay=132 (same gates, same memories)
- PICK d133 part=531 chosen=EAT candidate=eulogy@(5,3)/
  memDay=132
- PICK d134 part=532 chosen=HAVEN_CHORE candidate=eulogy@
  (5,3)/memDay=132
- PICK d134 part=535 chosen=EAT candidate=eulogy@(5,3)/
  memDay=132
- PICK d135 part=536 chosen=HUNT/ready hunt=eulogy@(5,3)/
  memDay=132 candidate=eulogy@(5,3)/memDay=132 (same gates)
- DEPART d137 part=544 visjoin_115 HUNT hunt=eulogy @(5,3)
  memDay=132
- DROP d137 part=545 visjoin_115 eulogy @(5,3) dropped=true
- DROP d137 part=546 dropped=false; part=547 dropped=false;
  d138 part=548 dropped=false (lingering at the empty tile)
- PICK d138 part=549 chosen=HAVEN_CHORE candidate=null
  pre=[["eulogy",5,4,127,3]] — the (5,3) memory is spent;
  only the stale d127 memory remains.
- PICK d145 part=576 chosen=VISIT pre=[["eulogy",5,4,127,3],
  ["eulogy",4,4,144,2]] — the d144 haven-door fight wrote a
  new memory; she never hunted on it either (no HUNT pick
  follows it in the window; she died d146, cause "the wild").

Judgment: five offered picks in two days, all refused for
chores and food, then the hunt taken on the last fresh day,
then a two-day departure lag, then an empty tile, then a
lingering day, then home. Every step is a record a player
could in principle have witnessed (the departure line
exists; the empty arrival is silent — the returns-a narration
blank, unchanged). Nothing here reads as a lottery artifact
or a mislabeled accident: the pick, the departure, and the
drop form one continuous decision with a beginning, a delay,
and an ending.

Transcript S2 — HUNT lottery fixture, base code
(scripts/test-funnel-a-sense.js, FUNNEL-SENSE PASS):
seeded villager gen_anixv6h at haven (4,4), fresh armed
in-range memory (influencer at (5,4), day 1), gates all green
(armed=true, maxD=3, candidate=influencer@(5,4)/day 1):

- Lottery, 200 objPick draws: HUNT 22 (11%), VISIT 20,
  HAVEN_CHORE 26, WATER 90, SEEK 37, EXPLORE 5.
- Funnel pick records captured: 200/200 (every pick for a
  wave-4 memory holder is recorded), first record verbatim:
  {"day":1,"part":0,"dayPart":0,"vid":"gen_anixv6h",
  "chosen":{"kind":"HUNT","state":"ready","huntMid":
  "influencer","huntTx":5,"huntTy":4,"huntDay":1},
  "preSightings":[["influencer",5,4,1,0]],
  "candidate":{"mid":"influencer","tx":5,"ty":4,"day":1},
  "gates":{"armed":true,"sheltered":false,
  "postFleeResting":false,"maxD":3}} — pick-time capture
  proven on a live game, not just asserted from unit tables.
- The fixture lottery (11% HUNT) against the corpus take rate
  (2/36 offered picks, 5.6%) is coherent, not contradictory:
  the fixture's villager is fed and watered at day 1 with no
  competing crisis; corpus villagers pick under real thirst
  and hunger, where WATER/EAT weights dominate. The gap
  between 11% and 5.6% is the needs story, not a recorder gap.

## Fresh-band wall (16 seeds; reported, NOT claimed as movement)

Identical to returns-a (neutrality is exact, not approximate):
wins 4/16, all lesser, full seat 0/16. National ever 13/16,
final 9/16. Table invited 10/16, entered 4/16. Wave-4 reach
11/16, wave-5 0/16. Median days 180 — HORIZON-CAPPED (same
caveat as returns-a: the median is the cap, not a survival
gain). Deaths 600, starvation deaths 4. Death-cause shares
match returns-a exactly (villager combat 235,
villager-vs-villager combat 160, player the wild 87,
villager expedition 35, villager monster 32, villager ambush
8, villager wound-that-wouldn't-close 7, player contest 6,
player the arena 6, villager sickness 6, player sickness 2,
villager starvation 2, player starvation 2, villager alien 2,
player a stranger 2, player the night 2, villager thirst 1,
villager a toad like a war drum 1, villager The Heckler 1,
villager The Algorithm 1, villager Loud-Eyes 1, villager
Big Ugly 1).

## Metric review (for the NEXT run — never a mid-run re-score)

- FRESH-WINDOW GATE vs EVICTION-CLOSE (visjoin_138): the
  prereg ranks a last episode closed by eviction as
  MEMORY-OVERWRITTEN even when the episode's fresh window
  was gate-blocked (maxD 0, ages 1-3, candidate null) and the
  eviction came 32 days after staleness. Next prereg should
  rank "gate-blocked during the fresh window" above
  "eviction-closed" — or split OVERWRITTEN into
  OVERWRITTEN-WHILE-FRESH vs OVERWRITTEN-AFTER-STALE. The
  headline count (OVERWRITTEN 1) stands as preregistered;
  the decomposition above is the evidence for the revision.
- S3 SUB-CAUSE PRIORITY (corrected during sense review, class
  unchanged): supersession now outranks a later death, because
  a later pick record proves the villager lived past the HUNT
  pick (visjoin_113: HUNT d135, superseded by EAT d135, died
  d145 — previously mis-subbed as died-while-holding).
  Fixture added (30/30 pass). Next prereg should state this
  order explicitly.
- SAME-(DAY,PART) LATER-MEETING EXCLUSION: laterMeetings
  excludes the anchor by (day, part) equality; diana_osei's
  two d86 eulogy meetings share one part value (same-part
  double fight), so her second meeting counts in
  survivingMeetings (2) but not laterMeetings (0). S5 is
  unaffected (no DELIBERATE meeting exists anywhere in the
  band — returns classes DELIBERATE 0), but the next
  analyzer should key later meetings by fight-order index,
  not (day, part).
- DAY-GRANULAR DEATHS: the harness deaths list carries day,
  not dayPart, so DIED-BEFORE-PICK triples all carry a
  SAME-DAY flag (death day == anchor day). The flag is
  honest about granularity but does not weaken the class:
  the funnel recorder captures every pick a memory-holder
  makes, so the absence of any post-anchor pick record IS
  the ordering evidence — no pick intervened between the
  fight and the death. A dayPart-stamped death channel would
  remove the flag; it is not needed for this verdict.
- PICK -> DEPARTURE JOIN: departures join to picks with
  dep.part >= pick.part (not strictly greater), because
  objMaybeDepart can depart in the same part the pick was
  made. A strictly-greater rule would have missed same-part
  departures; none occurred in this band's triple windows,
  but the rule is load-bearing for future bands.
- DEPARTURE GATES NOT SPLIT: PICKED-NEVER-DEPARTED lumps
  danger-gate holds, heal-gate holds, and same-day
  supersession (visjoin_113's d135 EAT re-pick shows a ready
  HUNT can be replaced without departing, by a mechanism the
  pick record alone does not name). A follow-up that wraps
  objHealGate/objDanger would split it.
- TELEMETRY OBSERVATION (not this arm's axis, not chased):
  the deaths list carries player=true for two villager
  "the wild" deaths (visjoin_113 d145, visjoin_115 d146,
  kind villager) — the sim-harness TELEFLAG repair shape
  (double-registration race). Cause counts are unaffected
  and this arm never uses the player flag; noted so a future
  deaths-list consumer does not trust it blindly.
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-seed before/after corpora
  are the section 15 substitute, as in returns-a. No panel
  artifact faked, no panel verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus path
  for the coordinator's check is
  evidence/2026-10-29/perseed-funnel-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in returns-a: the
  baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The band's true wall
  numbers are nationalEver 13/16, entered 4/16, wins 4/16.
  Baseline NOT rolled by this arm; the coordinator judges
  any LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the survivor-funnel blank
  (returns-a ranked next step #1) is now decomposed at pick
  time: 19/19 triples classified, 19/19 losses assigned
  (LOTTERY-LOST 9, DIED-BEFORE-PICK 5, GATE-BLOCKED 2,
  MEMORY-OVERWRITTEN 1, PICKED-NEVER-DEPARTED 1,
  DEPARTED-EMPTY-TILE 1, STALE 0, NO-PICK 0). The headline
  correction to returns-a: survivor -> pick is 2/19, not
  1/19 — picks reveal a second wave-4 HUNT pick
  (visjoin_113) that never departed and therefore never
  appeared in any departure census.
- DOCUMENTED (for the next arm, not built here): (a) the
  lottery-competition lever — HUNT weight 2.0 vs needs
  weights, judged on take rate over offered picks (this
  band: 2/36) and departures; (b) the homebody question —
  maxD 0 villagers can never be offered a HUNT (Steve-call
  whether that is intended); (c) the departure-lag gap —
  pick d135 (last fresh day) -> departure d137 (age 5)
  shows departure gates can push a fresh pick past
  freshness, and same-day supersession (d135 EAT re-pick)
  shows a picked hunt is not a promised hunt; (d) the
  empty-tile arrival (returns-a rank #2) stands unmoved:
  the band's only departure still found nothing.
- NOT re-judged: returns-a DIAG-GO, chainkill DIAG-GO, and
  all prior verdicts stand as published. Returns-a's numbers
  are reproduced exactly, not revised — except the one
  addition picks make visible (the second HUNT pick), which
  is labeled as such.

## Village assessment in plain words

The village does not lack hunters, memories, or courage. It
lacks afternoons when nobody is thirsty. The people who
survive a wave-4 beast come home, and the next morning the
village asks them to choose between going back for the beast
and fetching water or eating — and they choose water and
food, because those are the choices that keep people alive
today. One woman in sixteen villages went back anyway, on
the last day her memory was fresh, waited two days to leave,
and found nothing there. Another picked the same hunt the
same morning and was talked out of it by dinner. Five never
saw another morning at all. Who thrived: the ones whose
needs were met on the morning the offer came — there were
two of those, and one of them still found nothing. Missing
capabilities, in order: a hunt offer that can compete with
thirst and hunger (not a louder weight in a vacuum, but an
offer that survives a dry cistern); a way for homebodies to
ever be offered (or an honest ruling that they never are);
and — still — a way to find a beast that moved, because
even the one departure in sixteen villages arrived to an
empty tile. And a story beat for the picked-but-never-left
hunt: visjoin_113's d135 decision currently exists only in
a recorder, never in a line a player could hear.

## Test and infrastructure notes

- `node --check` clean on all five new files;
  scripts/test-funnel-a-fixtures.js exits 0 with FIXTURES
  PASS (30/30, incl. the S3 sub-priority fixture added
  during sense review); scripts/test-funnel-a.js exits 0
  with MACHINE LEGS (census, join, control-shape,
  neutrality, triples, taxonomy); scripts/test-funnel-a-
  sense.js exits 0 with FUNNEL-SENSE PASS (verbatim attempt
  trace + 200/200 pick capture + lottery quote);
  scripts/test-funnel-a-sweep.js --summary exits 0 with
  corpus 16/16 ok.
- Determinism gate: seed 75106 re-run into a scratch dir
  (/tmp/funnel-det, removed after the diff) byte-identical
  to the corpus row (cmp clean).
- EPERM flap chronology (loud, per the assignment's infra
  notes): safe-commit.sh failed 7x on /tmp index locks,
  manual private-index commits failed 3x on workspace index
  locks, git object writes failed 6/6 probes, node evidence
  writes failed 8/8 retries — then the flap cleared in
  stages (~02:41 UTC objects, ~02:45 UTC evidence/ref
  writes). One full band attempt was SIGTERMed at ~20 min
  while patiently retrying the first row write; it wrote
  nothing but a 0-byte file, so no judged row predates the
  prereg commit. The judged band then ran in four 4-seed
  chunks (~5 min each), all green. Prereg content was frozen
  01:53 UTC (sha256 above) and committed 02:45 UTC as
  831cd186b; the commit delay is flap, not editing — the
  worktree hash of the prereg file equals its HEAD blob
  (9626d6a45a261b6eb2fdb4d0f18d1a1eb1aa666f), proving
  the file did not change between freeze and commit.
- Safe-commit index clobber hit BOTH commits (staged-
  deletion twins of byte-identical files); repaired via
  HEAD-blob `git update-index --add --cacheinfo` with
  status + diff-HEAD-empty + hash-match verification, never
  `git reset`. No ref surgery, no force, no push, no bump,
  no live verification (ship-loop line).
- Zero src/js diff on this branch (verified at closeout);
  zero policy files added or changed except the new diag
  recorder (scripts/policies/funnel-diag.js, FUNNEL=1
  gated, off = no wraps); no other arm's corpus touched
  (predecessor corpora read-only; the funnel corpus lives
  in its own dir, perseed-funnel-a/). No push, no bump, no
  live verification. Ready for coordinator merge, pending
  ship — via the coordinator.

## Commits

- 831cd186b prereg (content frozen 01:53 UTC, before any
  judged row; commit delayed to 02:45 UTC by the EPERM flap
  — see infrastructure notes).
- 8085789d5 instruments (recorder + sweep + analyzer +
  fixtures + sense).
- Corpus + analysis + sense + this evidence: final commits
  on this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the survivor
funnel is now decomposed at pick time (lottery loss 9/19 is
the binding break, same-day death 5/19 second, staleness 0
as a headline) with ranked next levers (offer
competitiveness, homebody range ruling, departure lag) — but
no wave-4 field party has yet killed in the field, the full
seat stays 0, wave 5 stays 0. The directive stands until the
tracker records this axis converged on measured evidence.

## Ranked next step (single first lever, per prereg)

1. LOTTERY-COMPETITION — FIRST. The hunt offer fires and
   loses to needs (22 offered picks, 0 takes, in the 9
   lottery triples; 2/36 takes band-wide in triple windows).
   Judge any lever on take rate over offered picks and on
   departures, not on offer counts — offers are not the
   scarce resource; takes are.
2. HOMEBODY-RANGE RULING — SECOND (Steve-call, not a silent
   build). maxD 0 villagers can never be offered a HUNT.
   Rule whether homebodies should ever hunt before any
   lever assumes they can.
3. DEPARTURE-LAG + EMPTY-TILE — THIRD, unchanged in kind
   from returns-a: a fresh pick can depart stale (d135 ->
   d137) or be superseded same-day (d135 EAT re-pick), and
   the one departure still found nothing. Any return lever
   must answer the arrival question lawfully (perception:
   tracks, sound, following — never a magic roster or
   live-monster lookup).
