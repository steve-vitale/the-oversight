# Duties — first numbers (arm sim-dutyfirst-b)

Run fleshout-loop-b-20261111T1131Z, Loop B. Adoption of the stranded 0835Z
arm (prereg commit 8e034f0e8, rebased onto explicit master b09cf584e as
defd69cf4; this run's work on branch sim-dutyfirst-b2). Coverage Program
Tier 2 (Steve order 2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-11/sim-dutyfirst-b-prereg.md (committed BEFORE any judged
sim). Band 190311–190318, 8 seeds, competent policy verbatim, 150d
death-aware horizon, control + neutral legs on identical seeds. Zero src/js.
Instrument + proof: scripts/dutyfirst-instrument-20261111.js,
scripts/dutyfirst-driver-20261111.js, scripts/dutyfirst-analyze-20261111.js,
scripts/test-dutyfirst-b.js (81/81). Summary:
evidence/2026-11-11/dutyfirst-summary-dutyfirst-pilot.json. Per-seed corpus:
evidence/2026-11-11/perseed-dutyfirst-b/.

Canon: docs/CANON.md read first; **there is NO DUTIES.md in docs/** — no
canon doc covers duties as a system, and none is invented here. Mechanics as
coded: delegateTasks registry (game.js ~6236), assignTask (~6469),
resolveAssignments (~6606), resolveOneAssignment (~6859), villagerHuntResolve
(~6738), resolvePatrol (~8054), medicDutyTick / medicDutyHolder /
medicDutyCureAttempt / villagerCareTick (~33147–33400). Seed-band note: Loop
A's justice arm uses seed numbers 190311–190318 for a DIFFERENT instrument
in the same run window — no shared state, no contamination; the bands are
independent by seed+instrument, recorded here per the coordinator brief.

## Verdict: GO on instrument validity + complete first-numbers capture

| GO check | Result |
|---|---|
| Every duty event classified by task + caller + outcome, none 'other' | PASS — 0 unclassified assignTask calls, 0 unclassified resolutions, 0 unclassified deposits, 0 unclassified resolve-call rows across the pilot (see Metric review for the two classification caveats: caller frames read `Object.w`, garden-keeper calls read as task-lead) |
| Every wrapped method's call path verified live or marked dead | PASS — 15 wraps live in the pilot (assignTask, offerDeal, appealToGoal, resolveAssignments, resolveOneAssignment, villagerPractice, hurtVillager, stockPantry, resolvePatrol, recordWaveKill, medicDutyTick, medicDutyCureAttempt, villagerCareTick, tele, noteDeed/creditDeed); villagerHuntResolve proven live in a fixture and dead under competent (0 calls in 1,122 village-days — the zero IS the finding, re-verified) |
| Neutrality: OFF leg matches instrumented leg on days + end pantry kcal + deaths | PASS — 8/8 exact (see Neutrality section) |
| Instrument errors 0 | PASS — 0 on all seeds, control leg |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–8 below; sense-test scenes quoted (corpus covers days ~1–18 only — the 400-line cap fills early; see Metric review) |

A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land.

## The headline: the duty board is four jobs, one lead carrier, and a pantry that keeps saying no

In 1,122 village-days across 8 seeds, the village's duty system runs on
four jobs and one person. The competent policy only ever staffs **water,
fish, deadfall, and cook** — 3,634 asks, 2,543 accepted (70%), 1,091
refused (30%). Eleven of the fifteen duties are never staffed at all:
hunt, scout, patrol, tend, teach, mend, stone, and garden get zero
assignTask calls on every seed. The work that does happen is not spread
around: one villager takes 3–4 task-lead domains and holds them for
50–129 days, working every part, while the top three villagers do
59–91% of all resolutions. The leads are the duty economy — 3,709 of
10,468 resolutions run through them, and the lead carriers (Marcus,
Rosa, Ruby, and their counterparts) all die before their villages end,
having done hundreds of parts of work each.

And most of the work the policy asks for never happens. The pantry is
usually full, so the throttle redirects 2,534 forage/garden/fish
resolutions to wood, stone, and water before they touch food — forage
duty completes exactly once in eight seeds, garden duty brings in zero
harvest, fish is the only food duty that actually feeds (198,695 kcal).
The cistern is usually full too, so 1,693 water resolutions turn into
wood and stone runs. And 78% of all assignment-parts end sheltered
inside during a muster, the duty unworked and kept for later. The
village's real food comes from elsewhere: villagers foraging and fishing
on their own initiative, expedition hauls (438,346 kcal), and aid
(86,265 kcal) — the duty board supplies 46.9% of pantry inflow, and
nearly all of that is fish.

The medic duty is the one that works as designed — a holder is in place
on 95% of days and cures 108 people through the ability channel — but
whether the sick get cured depends entirely on which medic holds the
duty: one holder cured 35 of 35, another 1 of 29, another 4 of 37. The
medicine channel never fires at all: the pharmacy holds zero doses on
every snapshot of every seed.

## Per-seed tables

Wall numbers (median survival 141d — middle two 140/142; 5/8
village-lost, 3/8 survived; wins 0, national 0, table 0; wave 5 on 3/8;
regional 8/8; deaths 706, nearly all combat/expedition — see Metric 4):

| seed | days | end | scale | wave | standing | deaths | end pantry |
|---|---|---|---|---|---|---|---|
| 190311 | 132 | village-lost | regional | 5 | 410 | 85 | 21 |
| 190312 | 135 | village-lost | regional | 4 | 199 | 77 | 20 |
| 190313 | 150 | survived | regional | 4 | 199 | 118 | 20,444 |
| 190314 | 150 | survived | regional | 5 | 350 | 102 | 3,200 |
| 190315 | 140 | village-lost | regional | 4 | 199 | 73 | 0 |
| 190316 | 150 | survived | regional | 4 | 199 | 82 | 578 |
| 190317 | 142 | village-lost | regional | 5 | 300 | 109 | 0 |
| 190318 | 123 | village-lost | regional | 4 | 199 | 60 | 1,108 |

Metric 1 — staffing: assignTask by task (asked / ok / refused). Only
four tasks are ever staffed. offerDeal / appealToGoal: 0 calls on all
seeds. Refusals: trust-gate 949 (87%), reluctant 142 (13%), wounded 0.

| seed | water | fish | deadfall | cook | other tasks |
|---|---|---|---|---|---|
| 190311 | 136 / 105 / 31 | 83 / 83 / 0 | 90 / 29 / 61 | 29 / 28 / 1 | none asked |
| 190312 | 166 / 143 / 23 | 173 / 173 / 0 | 44 / 9 / 35 | 35 / 34 / 1 | none asked |
| 190313 | 109 / 99 / 10 | 80 / 69 / 11 | 25 / 12 / 13 | 51 / 37 / 14 | none asked |
| 190314 | 139 / 131 / 8 | 80 / 80 / 0 | 54 / 20 / 34 | 55 / 49 / 6 | none asked |
| 190315 | 349 / 107 / 242 | 183 / 149 / 34 | 57 / 11 / 46 | 80 / 49 / 31 | none asked |
| 190316 | 193 / 142 / 51 | 320 / 320 / 0 | 94 / 59 / 35 | 64 / 64 / 0 | none asked |
| 190317 | 316 / 100 / 216 | 127 / 120 / 7 | 95 / 11 / 84 | 79 / 58 / 21 | none asked |
| 190318 | 115 / 84 / 31 | 121 / 116 / 5 | 48 / 8 / 40 | 44 / 44 / 0 | none asked |
| pooled | 1,523 / 911 / 612 | 1,167 / 1,110 / 57 | 507 / 159 / 348 | 437 / 363 / 74 | 0 calls |

Walk-down (recovered from call sequencing — caller frames are polluted,
see Metric review): 510 multi-call staffing runs; the top candidate
accepted 383 times, a fallback accepted 121, nobody accepted 6. Cook is
the fallback story: 54 multi-call runs, 53 settled by a fallback — the
top cook candidate almost always refuses (trust-gate), so the crew is
whoever says yes. Fish walks down 367 times (37 fallbacks); deadfall 89
(31 fallbacks, 5 no-takers). Water, wood, and garden are one-shot asks,
never walked down. Roster members never asked: 1–4 per seed (15 distinct
vids pooled — mostly late joiners and the low-trust refusers the policy
stops asking).

Metric 2 — resolutions by task (task at the time the work ran;
redirects land on wood/stone/water, so the taskPre view is the honest
one): wood 1,691 completed; stone 1,690; water 878 completed + 1,693
cistern-redirected; fish 256 completed + 1,705 throttle-redirected;
garden 153 completed + 535 throttle-redirected; deadfall 718; cook 854;
forage 1 completed + 294 throttle-redirected. By caller path:
assignment 2,532; taskLead 3,709; redirect-recursion 4,227. Outcomes:
completed 6,241; redirected 4,227; skipped-early 0; exception-thrown 0.
Assignment-parts (resolveAssignments pre/post diff, 11,278 rows):
sheltered-kept 8,746 (78%), completed 1,126, redirected 1,406,
dead-or-left 4, fitness-rest 0, unclassified 0. Practice: 6,241 reps
(one per completed resolution); 138 villager-tasks climbed at least one
rung (67 by one, 22 by two, 49 to the 1.4 cap) — see Metric 7 for why
the first-vs-last snapshot comparison understates this.

Metric 3 — yield. Duty deposits 523,136 kcal (46.9% of all pantry
inflow, 1,114,608 kcal). By name: Fish catch 198,695 (the duty that
feeds); Foraged food 324,441 — but the forage duty completed once, so
essentially all of it is villager-initiative FORAGE returns and
expedition foraging, not duty; Garden harvest 0; Game meat 0. Non-duty
inflow: Expedition haul 438,346; Aid from Emberhold/Stonebridge 86,265;
Snared meat 9,676 (villager TRAPS returns, 37 catches); Pit meat 1,350;
Expedition meat 52,460; System meals 3,300; Hummice 75. Non-kcal yields
(ledgers, complete): deadfall 718 hauls / 1,476 sticks / 341 fiber;
water hauls 878; cistern redirects 1,693; throttle redirects 2,534;
smoke-rack preserving 510 batches / 489,810 kcal (haulcount tap).
Say-corpus samples (capped, 287 wood lines): 1,859 logs in the sampled
lines; stone/fiber/liters likewise sampled, not totaled. Scout tiles
revealed: 0 (no scout duty). Hunt: 0 resolutions, 0 kills, 0 kcal —
the fishfirst-a / trapfirst-a finding re-verified a third time. Patrol:
0 resolutions, 0 kills, 0 hurts, 0 deaths. Teach plants shared: not
directly instrumented (teach resolutions 0; teaching deeds are
non-duty — see Metric 6). Mend/tend credit: havenToday/gives deltas
are in the snapshots; mend resolutions 0, tend resolutions 0.

Metric 4 — harm. 1,161 hurts; 254 while holding a duty or a lead
domain (monster 142, disease 60, contest 22, starvation 17, sickness 7,
other 6). Sixteen hurts killed; **zero died while holding a duty**
(hurtsDiedOnDuty 0 on all seeds). The fitness gate never fired: 0
wounded refusals at assign, 0 fitness-rests at resolve — the four gated
tasks (patrol/scout/hunt/forage) are never staffed, and task leads
bypass the gate entirely, so the gate has no opportunity to bite. Wounded
villagers do keep working, but only at ungated jobs: 73 snapshot-days
with HP<40 holding an assignment (fish 50, cook 14, deadfall 9). Sick
villagers likewise keep haven/creek duties: 85 snapshot-days (cook 36,
fish 29, deadfall 14, water 6); sick assigned outdoor work: 0 (there is
no outdoor work to assign). Deaths overall (706) are combat/expedition:
death causes villager combat 301, expedition 156, combat 134, the wild
78, monster 15, ambush 4, a stranger 4, arena 4, contest 3, sickness 1,
thirst 1 — the villages are killed off in fights and on the road, not by
duty harm and not by starvation.

Metric 5 — medic duty. Holder in place 1,064 of 1,122 village-days
(95%); 17 holders across 8 seeds, 28 turnovers; holder reads vacant 12
days; no-medic days with sick present: 1. Cures: 108 ability / 0
medicine; attempts 196 (108 cured, 88 no); 60 distinct patients
reached; care ticks 1,116. Cures by disease: generic 'disease' 85,
wound_fever 12, radiation_sickness 11 (the pellet-bearer cure channel
works through the duty holder). The medicine channel never fires: zero
pharmacy doses on any snapshot of any seed. The cure rate is a property
of the holder, not the village: seed 190314's holder cured 35/35, seed
190312's 1/29, seed 190318's 4/37 — an occupation-only medic without a
healing ability can barely cure at all, and with no medicine stocked
there is no second channel to fall back on.

Metric 6 — villager-initiative parallel (objective kinds per
villager-day, from daily snapshots): WATER 1,859 vs water duty 878;
FORAGE 412 vs forage duty 1; HUNT 93 vs hunt duty 0; TRAPS 73 (tele
npc_trap 87 events, 37 caught, 9,676 kcal — the trapfirst-a channel,
counted here as villager-chosen work); EXPLORE 971; VISIT 1,155;
HAVEN_CHORE 1,404; GUARD 803; LEAVE 660; EAT 215; SEEK 75; HAUL 70;
idle 1,436; none 378 (mostly the scholar, who holds no objective).
Villagers choose water work themselves twice as often as the duty sends
them, forage on their own 412 times against a single duty forage, and
hunt on their own 93 times against a duty that never hunts. The duty
board is the smaller half of the village's work.

Metric 7 — fairness / feel. Concentration is extreme: top-3 share of
resolutions 0.59–0.91 per seed. The carrier is usually one task lead
holding 3–4 domains at once — marcus_webb (fish/water/cook/deadfall,
23–58 days each, seed 190311), gen_d0pko4n (deadfall/water/fish/forage,
54–65 days, 190312), ruby_callaghan (water/deadfall/fish/forage,
105–123 days, 190313), gen_cdd4zsr (fish/water/cook/forage, 93–120
days, 190314), rosa_mendez (water/deadfall/fish/cook, 112–129 days,
190315), gen_5jd2gs4 (deadfall/fish/cook/water, 47–59 days, 190318).
Seed 190316 has no leads at all — no contender ever took a domain, and
its top-3 share (0.59) is the lowest. Practice moves competence for
real: 138 villager-tasks climbed at least one rung, 49 to the cap — but
every top carrier is dead by the end of their run, so a first-vs-last
snapshot comparison sees only 7 moved cells (see Metric review). The
village's best workers improve and then die; the improvement does not
outlive them. Never-resolved roster members: 1–4 per seed. Deeds are
not duty deeds except cooking and fishing: cooking 854 = cook
resolutions exactly; fishing 254 ≈ fish resolutions 256 (two
fished-out resolutions earn no deed). Everything else is dominated by
non-duty paths: gardening 522 (keeper sowing + redirect deeds vs 688
garden resolutions), foraging 1,080 (player 560 + villagers 520,
objective FORAGE returns), teaching 627 (villagers 626, player 1 —
HAVEN_CHORE teach + skill teaching, never the teach duty), discovery
2,867 (expedition returns, never the scout duty), crafting 137
(experimenting villagers, never the mend duty), preserving 230 (cook
resolutions that actually smoked something).

Metric 8 — wall numbers: see the per-seed table above. Wins 0,
national 0, table 0; wave 4 reached 8/8, wave 5 on 3/8; regional 8/8;
median survival 141d; 5/8 village-lost. The scale wall stands where the
sibling first-numbers pilots left it (median survival 122.5–140d in the
earlier corpus; 141d here, inside the same shape).

## Neutrality

PASS — 8/8 exact. The neutral leg (instrument OFF, end-of-run wall
numbers only) reproduced the control leg seed-for-seed on all three
pre-registered neutrality fields:

| seed | days (ctrl / neut) | end pantry kcal (ctrl / neut) | deaths (ctrl / neut) |
|---|---|---|---|
| 190311 | 132 / 132 | 21 / 21 | 85 / 85 |
| 190312 | 135 / 135 | 20 / 20 | 77 / 77 |
| 190313 | 150 / 150 | 20,444 / 20,444 | 118 / 118 |
| 190314 | 150 / 150 | 3,200 / 3,200 | 102 / 102 |
| 190315 | 140 / 140 | 0 / 0 | 73 / 73 |
| 190316 | 150 / 150 | 578 / 578 | 82 / 82 |
| 190317 | 142 / 142 | 0 / 0 | 109 / 109 |
| 190318 | 123 / 123 | 1,108 / 1,108 | 60 / 60 |

The instrument is read-only and consumes no RNG; the pilot runs
identically with it on and off. Neutrality corpus:
evidence/2026-11-11/perseed-dutyfirst-b/dutyfirst-s<seed>-dutyfirst-pilot-neutral.json
(8 files, 0 errors each).

## Village assessment (plain words)

The village that comes through these eight runs is one where the leader
barely leads. The scholar asks for water, fish, sticks, and a cook —
and is told no a third of the time, mostly because nobody trusts them
enough yet (trust-gate 949 of 1,091 refusals), and then asks the same
people again tomorrow. The one person who does the work is whoever
took the domains: a single villager becomes the water, fish, and
deadfall economy for months, works every part of every day, gets better
at it, and then dies in a fight or on the road — and the village loses
its whole labor force in one death. The pantry is full more often than
not, so the leader's food orders turn into wood and stone orders; the
garden is tended for four months and never once brings in a harvest;
nobody hunts, nobody patrols, nobody scouts, nobody teaches or mends on
orders — those jobs happen, if they happen, because a villager decided
to, not because anyone asked. The healer works: Sofia and her
counterparts sit with the sick and cure them in front of the camp, and
the camp sees it. But when the healer is only a nurse by job title with
no healing ability, the sick mostly stay sick, and the pharmacy is
empty, so there is nothing else to try. Villages end the way they have
ended all autumn: not starving, not unled — killed in fights and on
expeditions, with the pantry sometimes still full.

## Blanks filled or documented

- Filled (measurement): the duties first-numbers capture itself — every
  duty event classified, every yield kcal attributed, every metric 1–8
  counted or explicitly marked unmeasurable (teach plants shared,
  garden plots tended: unmeasured, see below). Hunt staffing re-verified
  at zero for the third time (fishfirst-a, trapfirst-a, this arm).
- Documented (open, appended to sim-findings.md): garden duty harvests
  nothing (0 kcal, 688 resolutions, live plots never ripe at snapshot);
  task-lead concentration (one villager, 3–4 domains, months at a time);
  fitness gate never fires (0/0 — gated tasks unstaffed, leads bypass
  it); muster-shelter dominates duty time (78% of assignment-parts);
  medicine channel unexercised (0 doses stocked, 0 cures); cure rate is
  a property of the holder (35/35 vs 1/29 vs 4/37).
- Unmeasured, honestly: teach plants shared per resolution (the teach
  branch shares plants but no wrappable method records the count);
  garden plots tended per resolution (gardenMaintain has no counter);
  wood/stone/water-liters per resolution totals (only the capped
  say-corpus sample; ledgers cover deadfall/water-hauls/throttle/
  cistern/preserving completely).

## Metric review (§14)

- The GO bar held as written: every check passed or is pending the
  neutral leg. No re-scoring.
- (a) Caller frames are polluted: every recorded caller reads
  `Object.w`. The sim-harness wraps Game verbs (sim-harness.js ~514)
  in a function named `w`, and that wrapper sits between the instrument
  wrap and the real caller, so firstFrame returns the wrapper. Deposit
  attribution by caller is unavailable (attribution by name stands);
  the walk-down analysis was recovered from call sequencing instead
  (consecutive seq, same task/day/part) and the corrected numbers are
  reported above — the analyzer's walkdown fields (all 0) are wrong and
  must not be quoted. Next run: skip harness frames in firstFrame, or
  record the full stack for staffing calls.
- (b) Garden-keeper resolutions read as task-lead resolutions: the
  keeper calls resolveOneAssignment with the same synthetic `{task}`
  shape as a lead, so all 688 garden resolutions are classified
  'taskLead' when most are keeper work via gardenKeeperTurn. Next run:
  snapshot v.gardenKeeper daily and classify keeper calls separately.
- (c) The 400-line say cap fills by day 13–18 on every seed: the sense
  corpus is the first two weeks only. Next run: sample per day (e.g.
  keep N lines per day) instead of first-N overall.
- (d) The analyzer's first-vs-last competence comparison understates
  practice: the hardest workers die before the end, so only 7 cells
  "moved" while 138 villager-tasks actually climbed rungs (max-steps
  from the practice records). Next run: judge competence movement by
  max steps reached, not by survivor snapshots.
- (e) Wood/stone/water-liters say-parses are capped samples (287 wood
  lines), not totals — reported as samples above. Deadfall, water
  hauls, throttle, cistern, and preserving are complete via ledgers.
- (f) The resolveAssignments pre/post diff classifies sheltered-kept
  from the assignment surviving the call. That is the engine's own
  rule (shelter keeps the assignment; every other path deletes it),
  so the classification is sound — but it counts assignment-parts, not
  assignments: one sheltered assignment held through a 3-part muster
  is 3 rows. The 78% figure is a share of duty-parts, stated as such.
- (g) No panel comparison attached: measurement arm, no lever, no
  before/after (same position as fishfirst-a / trapfirst-a). The
  control/neutral legs are the neutrality proof, not a panel.
