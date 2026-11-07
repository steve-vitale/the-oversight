# Journey — Landing r113 (2026-11-07, Lane A leg 0)

Run id `laneA-20261107T0559Z`, scheduled Sat 2026-11-07 05:45 CST, started ~12:00Z.
Leg 0 LANDING. Branch `journey-landing`, base `0d63b5985` (master at run start;
master moved 5198d1056 → 0d63b5985 DURING pre-flight — the ship loop landed
sim-winnability-round-1021 adoption evidence; the worktree branches from the
fresh tip, no stale-base risk).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 8d9997ce2, before any seed ran)

Q1 (PRIMARY): the "(no line)" is navigation, not silence — driver-only fix
(NAV logging for menu:more) + classifier; bar: proof test passes, back-compat
on the r112 corpus gives nav=86 genuine=0, panel gives THEM:(no line)==0
with menu:more picks > 0 and NAV: lines == menu:more picks. Q2 (standing):
practice movement repeats + hunt/forage watch; bar GO if ≥1 attributed moved
cell pooled. Q3–Q6 + carried bindings as in r112, with the r112 metric-review
proposal ADOPTED for M-PR1 (count only ≥3-turn sittings toward the per-seed
bar). Seeds 1063–1072 (fresh — full-scope grep over ALL dated preregs plus
the forbidden-band lists; only incidental numbers hit).

## Infrastructure notes (loud first)

- **Service restart killed the first panel attempt.** The full 10-seed panel
  run died mid-seed-1063 (day 12) when the service restarted; the log showed
  only 3 census files (the pilot's) and no driver process survived. Recovery:
  re-heartbeated immediately (12:10:11Z), re-ran the full panel from scratch
  — exit 0 in ~38s, 10/10 census files. The pilot censuses for 1063–1065
  were overwritten by the panel run (same seeds, same driver, per-seed
  deterministic). No partial panel data was used.
- **Master moved mid-pre-flight** (5198d1056 → 0d63b5985, see above). The
  worktree branches from the fresh tip; re-verified before merge.
- **Pre-flight clean.** Main tree clean, disk 27%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 6/16 at pre-flight (plus this run's).
- **Safe-commit index clobber struck on the prereg commit** (known class).
  Repaired per the recorded recipe (`git update-index --add --cacheinfo`
  with HEAD blob); verified `git status` clean (0 lines), `git diff HEAD`
  empty, all 4 blobs match HEAD.
- **Registration completed exit 0 in ~3 min** (reap + checkout). Heartbeat at
  registration + ~10-min loop (plus an immediate re-heartbeat after the
  restart recovery).
- **No lock existed at start.** Lock created 11:59Z, run_id
  `2026-11-07T11:59:46Z`. Deleted at closeout after read-back of run_id.
- **Context (not this run's work):** sim-arena-b / sim-mootsummon-a landed
  in this base; the drive build is still unmerged; the one-brain program
  proceeds elsewhere (build-brain-p1 active).

## Panel

Pilot: 3 seeds (1063–1065), DAYS=28, exit 0 in ~34s. All 3 alive, systemDay
8, practice snapshots present (d1/d14/d28, non-null competence maps), Q1
live check on pilot output (noLine=0, menuMore=30, navLines=30), fights
present. All 5 pilot gates passed → expanded to full panel. Full panel: 10
seeds 1063–1072, DAYS=28, exit 0 in ~38s (second attempt; first attempt
killed by the restart, see above). 10 census files in goal hidden_files
`evidence/2026-11-07/landing-r113/`. Logs: `landing-r113-pilot.log`,
`landing-r113-panel.log` (same dir). Analysis:
`landing-r113-panel-analysis.txt`, `landing-r113-practice.txt`,
`landing-r113-navlog.txt`, `landing-r113-commit-offer.txt`,
`landing-r113-fights.txt` (same dir).

## Panel verdicts

- **Q1 NAV-LOG: GO — the dead air is gone, and the fix proves itself on
  live output.** Classifier on the panel corpus (108 transcript files):
  `noLine=0 nav=0 genuine=0 navLines=90 menuMore=90` — every one of the 90
  menu:more page turns is logged as NAV, none as THEM. The panel MET agrees
  exactly (`navTurns=90`). Proof test `scripts/test-landing-r113-navlog.js`:
  5/5 assertions PASS (synthetic fixtures: menu:more→NAV, ask:gossip→
  GENUINE, no-YOU→GENUINE, winddown 'more'→GENUINE, NAV lines counted).
  Back-compat on the r112 corpus BEFORE the panel: `nav=86 genuine=0` —
  exactly the pre-registered split. The r112 "(no line)" blank is closed:
  the game never said nothing; the driver was mislabeling pagination.
- **Q2 PRACTICE: GO — the movement repeats, and it widens a crack.**
  Moved cells d1→d28 = **94 across 10/10 seeds, all 94 attributed**
  (d1→d14: 62). Per-seed d1→d28: (see practice.txt; pooled 94). By task:
  stone 26, wood 25, water 15, deadfall 10, cook 10, **fish 6, forage 1,
  garden 1** — hunt/scout/patrol/tend/teach/mend: 0. Fish moves for the
  first time (r112: 0), forage and garden move once each — a crack in the
  chores-only shape, not a break: the movement is still 86/94 chores.
  Specialist/foodXp 0→positive: **0** — the specialist gate is still shut
  at 28 days. Practice reps at d28: 3,364. The funnel did not move with
  it: planSeeds d14 4/10 (r112: 4/10), d28 7/10 (r112: 9/10); holders
  12→25 (r112: 15→32); partyWaits 12→82 (r112: 12→63); partyFights
  21→78 (r112: 53→138 — count method differs by run; reported, not
  chased). Practice moving competence is a real first-month effect; it is
  not yet a funnel effect.
- **Q1 poison re-test (r109 fix, ongoing proof): 1 poison verdict, 0
  re-tests, tester SURVIVES.** Seed 1070: Diana tests belltoad (Choir
  Toad) d9, gets the poison verdict ("NOT food," they gasp. "Poison.") —
  and lives (1070 has zero deaths). The poison verdict is recorded exactly
  once; no villager re-tastes it. The fix holds a fourth panel running —
  and this time the tester doesn't pay with her life, unlike r112's Hannah.
- **Q3 engagement lines (standing bars):**
  sittings=32, offered(commit)=27, picked=27, promised=20, statedAfterPick=7,
  neverOffered(commit)=5.
  - **M-PR1 per-seed (adopted ≥3-turn rule): 10/10 — PASS.** The 5
    never-offered sittings split 2 counted / 3 excluded by turn count:
    counted — 1064 d10 Greta (3 turns), 1072 d10 Sari (23 turns);
    excluded — 1063 d8 Vivian (2), 1067 d12 Miguel (1), 1071 d9
    Celestin (2). Per-seed counted never-offered: 1064:1, 1072:1, all
    others 0 — every seed ≤1. The unfiltered count gives the same
    verdict (5 seeds with 1 each) — the adoption changes nothing on this
    panel, which is the right first outing for a rule change: it binds
    without re-scoring the past. Transcript adjudication of all 5
    never-offered sittings (read in full, below) finds **zero live cases
    of the game hiding engagement or commit**.
  - **M-PR2 revised: 20/(27−7) = 20/20 = 100% ≥ 80% — LINE HOLDS.** All 7 stated
    refusals are the R72 away-guard line ("Wait — I'm out on the road…").
    Away-guard share: 7/27 = 26% (r112: 29%, r111: 29%, r110: 36%).
  - Pooled never-offered rate 5/32 = 16% (reported for the record;
    per-panel bar retired per r109's review).
  - The pooled thread-gate count grows to 9 (r112's 8 + 1071 Celestin):
    engagement never picked, want stayed stage 1, thread='want', want
    withdrawn in the opener. The retired question stays retired.
- **Q4 M7 goaround: GOAROUND-WEAK — MISS (2/3 = 66.7% < 80%).** R84 kcal:
  arrivals=3, arrived=2. The one non-arrival (1066 d9, nextTop d10
  atHaven=false, dist=7) was rescued by the ladder (R85: finalArrived
  3/3). The miss stands as a miss (metric binding — never re-scored):
  on n=3 the snapshot-scoped arrival bar is one case short. The system
  as a whole still brought everyone home (R85 RESCUE-GO).
- **Q5 M6 doorstep: DOORSTEP-GO.** R88 DOORSTEP: checks=279, triggered=4,
  ate=4, drank=0 (r112: 279/2/2... r112 was 280/2/2). All four triggered
  steps ate (1063 d13, 1066 d15, 1067 d11, 1069 d13). 0 class-E scholar
  starvation deaths; 0 triggered steps ending enterResult===false.
- **Q6 water: UNTESTED (25th run).** Wild outing iterations=19,
  hydUnder25=0, minHyd=72, waterSkips=0. R84/R85 water both UNTESTED, 0
  skips. R86: 1072's d27 haven hyd-0 snap sits outside the hall with
  bottles=1 — MECHANISM OUTSIDE-HALL, not a Maeve shape (0 qualifying).
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (d14 pops 11–12).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on eight seeds, 9 on two.
- **M3 FIGHT-LOG: PASS.** 20 hunt fights, 20 complete, 2 fatal, 0 with
  unknown/mixed trigger.
- **M5 PEOPLE: PASS.** Wind-down more picks 6, empty 0; WD probe sittings
  10, surfaced 10, menuMore 6, pageTurns 51, page3sittings 5, maxPage 4,
  phase2Opened 7, phase2Yielded 2, GATE-A GO, GATE-B GO; betrayal 0 held;
  party invites offered 8, picks 8, spoken 8, dry 0, accepted 3 (PARTY-GO
  — Giulia d9 and two others said yes; Sari d10 refused honestly on
  trust: "You don't really KNOW Sari yet."); R67 case labeling 7/7 MATCH
  (LABELING-GO). Five full transcripts read for sense (below).
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitSeeds
  5/10, departSeeds 7/10, keptSeeds 5/10, keptTotal 5, OUTING-GO. The 5
  never-waited seeds (1064, 1065, 1066, 1068, 1072) are explained by their
  action reasons (the carried driver-side friction, r106) — the driver
  never gets adjacent. R94 DAWN-DOOR: opps=447, waitDiagMissing=0.
- **R73 WINDOW:** promised=12, askedOnly=21, outOfWindow=1, all 12 NARROW,
  keptInsideNarrow=5. NARROW-PATTERN continues (design input).
- **R66 horizon pantry: 8/10 HUNGRY, NOT-HUNGRY by the revised gate** —
  starvationDeaths=0 (r112: 0), slideSeeds=1 (1066), bandSeeds=4,
  noSlideSeeds=5. Starvation deaths per seed: 0 on all 10 seeds. FED
  seeds: 1064 (3,806), 1067 (4,657). HUNGRY seeds: 1063 (1,465), 1065
  (694), 1066 (89), 1068 (1,961), 1069 (1,474), 1070 (1,279), 1071
  (1,352), 1072 (825) — eight thin villages, no famine deaths. 1066 is
  the famine seed (89/person, SLIDE, 12/25 snaps below 1000) and still
  nobody starves.
- **Mantle:** three passes, latencies [0, 1, 1] (1065 Francisco d10 →
  Ryan d10; 1066 Ashley d27 → Giovanni d28; 1072 Paul d27 → Kennedy
  d28); zero unresolved at horizon. The r107 2-day latency is NOT
  reproduced a third panel running; the owed item stays open.
- **Win-plan (R104, carried):** planSeeds d14 on 4/10 seeds, d28 on 7/10;
  holders 12→25; partyWaits 12→82; partyFights 21→78. **M-A2
  re-confirmed STRUCTURALLY-UNREACHABLE** (retired metric, consistency
  check only): prims=0, no muster, no wave-4 kills, no table plans on all
  d28 censuses.
- **Contests:** fired=19, ended=18, openAtHorizon=1, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths. Grief: 0/18 miss, holds.
- **Kill-mean trend:** per-seed monster-kill mean 26.2 (range 19–38,
  total 262) after r112 27.9 → r111 18.8 → r110 20.6 → r109 28.5. Seed
  mixture, not a trend — reported, not chased.
- **R69 ARMOR INSTRUMENT-DISAGREE (teleLineDisagree=2) — EXPLAINED, not a
  defect.** Seeds 1066 and 1072: telemetry counts 1 ok craft each, the
  narration lines count 0. Both are the R88 ARMOR-SILENT crafts (1066
  d24, 1072 d24, bark_armor, scholar wild) — narration lines are gated
  when the scholar is away, telemetry is not. Same explanation as R88's
  CONFIRMED line. The instrument disagrees by design of the two channels.
- **R88 MAEVE:** snaps=3, qualified=0, MIXED mechanism (1 outside-hall,
  2 inside-hall, all with bottles).

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — and again nobody
starves, though eight of the ten end it thin. Two villages end fed (1064 at
3,806 calories a person, 1067 at 4,657); the other eight end hungry, the
thinnest at 89 a person — 1066's pantry all but empty on the last day, and
still nobody starves. Everyone meets the System by day 8 or 9. Three scholars
die, all three in the wild: Francisco on day 10 to a Highbeam Deer, Ashley
and Paul both on day 27 — Ashley in the wild, Paul to a wave-2 Focus Group
whose eyes marked every strike he made. The villages hunt hard (19 to 38
monster kills each, 262 in total) and test their meat: all ten taste it,
seven get it out of the pantry, and one villager — Diana — proves a toad is
poison and lives to tell it. People ask each other for help and mostly get
it: 27 of 32 sittings offered the commit, 20 of 27 picks became real
promises, and the seven refusals were all honest ("I'm out on the road —
find me when I'm back"). Parties form and three people say yes. Villagers
are getting better at their work in a way you can count: 94 times in a
month a villager's competence stepped up a rung — cutting wood, breaking
stone, hauling water, cooking — and for the first time a few steps landed
outside the chores: six in fishing, one in foraging, one in gardening. But
nobody got better at hunting at all. Four villages lose nobody at all (1063,
1069, 1070, 1071). The villages are alive, social, and mostly thin — and
this panel, the story is that the silence was never silence: ninety times a
player paged for more things to say, and ninety times the game answered
with the page itself.

Pops end 12, 11, 9, 9, 11, 9, 12, 12, 12, 8 (seeds 1063–1072). Scholars
spawned: Vito, George, Francisco, Ashley, LaToya, Grace, Mario, Rafael,
Wanda, Paul. Monster kills per seed: 23, 29, 20, 33, 29, 23, 19, 21, 38, 27.
Self-sufficiency at d28 ranges 0.797–0.979. Villager deaths 18 total: 3
scholars (Francisco, wild fight; Ashley, the wild; Paul, the wild) and 15
others — 3 ambush (Fatima d21, Aroha d8, Onni d7), 6 sickness (Stan d18,
Sam d19, Mateo d21, Mia d23 — all 1065 — plus Ming d27 and Abigail d24), 3
monster (Ava d5, David d22, Meera d22), 3 wound-that-wouldn't-close (Asher
d28, Min d22, Sari d23). **Seed 1065 is the sick village:** its scholar
dies day 10 to a Highbeam Deer, then four villagers die of sickness in six
days (d18–d23) — the village stands at 9, hungry at 694 a person, and the
mantle passes the same day Francisco falls. **Seed 1066 is the famine
village:** the pantry slides to 89 a person and still nobody starves;
Ashley dies day 27 in the wild and the mantle passes next day. Its scholar
fights six times and in five of them the killing is done by others.
**Seed 1072 loses its scholar last:** Paul dies day 27 to the Focus Group
after striking eight times for no damage at all — the beast's eyes marked
his strikes and the deliberation loved his waits — and the mantle passes
to Kennedy on the last day. The village stands at 8, hungry at 825.
**Seed 1067 is the fed village:** 11 pop, 1 death (Ava, monster, day 5),
29 kills, FED at 4,657 a person — healthy, and the richest on the panel.

## People check (transcripts read in full — all 5 never-offered sittings)

- **1063 d8 Vivian (stated, 2 turns): Real — the favor was already handled.**
  Vivian opens wanting to talk; the driver takes [dlg:more] and she says
  "Never mind the food I needed — we got it handled. Thanks anyway." The
  want was already resolved before the sitting (stage 2, resolution=
  stated). The driver steers to dlg:subject, gets "Forget I said anything.
  What did you want?", and leaves. The commit option never surfaced
  because there was no open favor to commit to. Excluded from the ≥3-turn
  M-PR1 count (2 turns).
- **1064 d10 Greta (unestablished, 3 turns): Real — the sitting had another
  purpose, and the listen beats read thin.** Greta opens with a betrayal
  invitation ("Walk with me?") and a confession ("I don't actually know
  how to swim and I'm terrified someone will find out."). The driver
  declines honestly ("Right — another time.", acknowledged ✓), then takes
  [dlg:react] twice: "Anyway." / "Well." — the doubled listen beats read
  as filler, the r112 shape again. Greta never asked for a favor (stage 0
  throughout); the sitting was the invitation and the fear. Counts toward
  M-PR1 (3 turns); the game hid nothing.
- **1067 d12 Miguel (unestablished, 1 turn): Real, case-crowded, probe-left-
  immediately.** Miguel opens on the ambush-of-Chantal case (he is one of
  the accused; the menu is four case presses deep). The driver takes
  [dlg:subject] once ("Sure — what's on your mind?") and leaves after 1
  turn. The want never got established — a probe that leaves early.
  Excluded from the ≥3-turn count.
- **1071 d9 Celestin (unresolved, 2 turns): Real — the thread-gate shape,
  ninth pooled case.** Celestin opens by withdrawing the want ("Never mind
  the food I needed — we got it handled.") — stage 1, thread='want', and
  the want stays there through a [goon] ("Celestin has an edge today —
  something curdled.") and a dlg:subject ("Forget I said anything.").
  The closing line reads "Good. That's settled, then. Onward." while the
  want's resolution is 'unresolved' — a second sighting of the Miriam
  closing-line shape (closer asserts settlement, thread says otherwise),
  flagged with the ambiguity that "settled" may mean the conversation,
  not the favor. Excluded from the ≥3-turn count (2 turns).
- **1072 d10 Sari (unestablished, 23 turns): Real — the richest sitting on
  the panel, and the Q1 fix's live demonstration.** Sari opens "I need
  something to do. Anything. Please." (stage 0 — a mood, not a favor).
  The driver pages [menu:more] EIGHT times — every one now logs `NAV:
  [menu:more] ... — menu paged, no spoken line (navigation, not
  silence)` instead of `THEM: (no line)`. The [alive:want:ask_favor]
  option is offered at turns 3, 8, 13, and 18 and never picked — the
  driver pages past it for asks, the party invite, and case presses.
  Between the pages the sitting is genuinely good: Sari sketches maps in
  the dirt ("Don't go there after rain. And this one's worth the walk."),
  reads faces ("Out here, faces say what words won't."), and the party
  invite gets an honest System refusal ("You don't really KNOW Sari yet.
  Talk to them first — the party UI needs a person, not a stranger.",
  Trust 16/20). Two verbatim repeats are flagged ("That's me, I guess.
  What's on your mind?" and "Anyway. What did you want?" each twice) —
  polish-grade. The engagement was offered four times; the driver kept
  paging past it. Counts toward M-PR1 (23 turns); the game hid nothing.

## Blank filled / documented

- **Q1 NAV-LOG FIX LANDED (driver + classifier, proof 5/5 + back-compat
  86/0 + panel 0/90/90).** The "(no line)" blank from r112 is closed as
  an instrument mislabel, not a game defect: the game returns no line for
  a menu page because paging says nothing, and the real UI just refreshes
  the menu. Transcripts now read NAV lines where dead air used to be.
- **Q2 PRACTICE STANDS (second panel).** 94 attributed cells, 10/10 seeds;
  first movement outside chores (fish 6, forage 1, garden 1); specialist
  gate still shut at 28d. The instrument is the standing line.
- **M-PR1 ADOPTED RULE — FIRST OUTING, NO OUTCOME CHANGE.** The ≥3-turn
  rule passes 10/10 on its first use, and the unfiltered count agrees
  (10/10). The rule binds from here without re-scoring the past.
- **M7 GOAROUND-WEAK — DOCUMENTED (miss stands, no re-score).** 2/3
  snapshot arrivals on n=3; the one non-arrival was rescued by the ladder
  (3/3 final). See Metric review.
- **ZERO-DMG "OTHERS-KILLED" FIGHTS — WATCH GREW (8/20 vs r112's 3/21).**
  Seven fights end won with the scholar striking 0 times while others
  deal all the damage (fled=false on all 20 fights — the scholar never
  runs; the fights resolve in 1–9 log entries, five of them on seed 1066
  alone); the eighth is Paul's real last-day loss (8 strikes, 0 damage,
  against the Focus Group's marked-strike trick). Mechanism not
  established — bystander fights the scholar witnesses vs player fights
  the scholar stands through — so no fix is claimed; the next run should
  instrument the fight's cause/trigger per the analyzer's classification.
- **PAUL vs THE FOCUS GROUP — DOCUMENTED (adjudication, no code change).**
  Seed 1072 day 27: Paul fights a wave-2 Focus Group + eye-heads alone
  (allies 0), strikes 8 times for 0 damage — the eye-heads' lens marks
  his STRIKE ("marked actions get rated harder") and the deliberation
  loves his waits — and dies at 1 HP with the beast unbroken. The trick
  reads clearly in the log and the game teaches it mid-fight; this is
  the trick system working as designed on a hard beast, not a defect: he
  fought the mechanic correctly and still lost to a wave-2 horror solo on
  the last day. Same shape as r112's Ella vs the Buffering.
- **R69 ARMOR INSTRUMENT-DISAGREE — EXPLAINED (adjudication, no code
  change).** The 2 tele-vs-line disagreements are the R88 ARMOR-SILENT
  crafts (scholar-wild days, narration gated when the scholar is away).
- **MIRIAM CLOSING-LINE DEFECT — SECOND SIGHTING (carried).** Celestin's
  sitting closes "Good. That's settled, then. Onward." with the want
  resolution 'unresolved'. Still not fixed; stays flagged for a future
  run. The "(no line)" [menu:more] polish blank is CLOSED by this run's
  fix; the Miriam line is now the oldest open polish item from this line.
- **EAMON FALLBACK — NO LIVE EXERCISE (second panel running).** 0
  starvation deaths, so 0 STARVATION lines and 0 pantryAtDeath lines.
  The fallback stands proven by the synthetic corpus + the exact r111
  case; a future famine panel exercises it live.
- **No other blank filled this run.** Water still untested (25 runs); the
  R70 never-waited friction recurs on 5/10 seeds (driver-side, carried);
  M7/M6 both judged this panel (M7 WEAK, M6 GO).

## Notable events

- 0 starvation deaths in a second panel running (r111: 6) — but 8/10
  villages end hungry and 1066 ends at 89 a person: thin, not famine.
- 3 scholar deaths in one panel (r112: 3) — all three in the wild this
  time (r112: 1 wild fight, 1 disease, 1 betrayal).
- Party invitations accepted 3/8 (r112: 2/11) — Giulia says yes
  ("Someone should watch your back. Might as well be me."), Sari's
  invite is refused honestly on trust.
- Flesh channel: 7/10 seeds get monster meat out of the pantry (r112:
  8/10), 10/10 test it — the test stage is the live one.
- Practice moves competence on 10/10 seeds a second panel running — and
  for the first time a few cells move outside the chores (fish 6,
  forage 1, garden 1).
- 1066's scholar fights six times and in five of them others do the
  killing — the zero-DMG watch's home seed.
- The service restart killed the first panel attempt mid-seed-1063; the
  re-run completed clean. No data from the killed attempt was used.

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 19 fired, flesh
  channel opens 7/10 (tests 10/10), outings complete and keep (5 kept),
  win-plans seed 4/10 by d14 and 7/10 by d28.
- **Fun: yes.** Transcripts read like people; Sari's 23-turn sitting is
  the panel's best — a villager who needs something to do, sketches maps
  in the dirt, reads faces, and turns the party invite down through the
  System with a reason. Giulia accepts a party invite with warmth
  ("Someone should watch your back."). Diana proves a toad is poison and
  lives. The villages are mostly thin this panel, which reads as pressure
  after r112's breather — and Paul's last-day death to the Focus Group
  is the month's story.
- **Winnable: not yet — unchanged at this leg.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone. No wave-4 kills, no muster, no
  table plans on any d28 census. (Context from outside this run: the
  practice build is the second landed lever to move a landing-leg number
  — competence moves in the first month, now with a crack outside the
  chores — but the funnel has not moved with it. The drive build, still
  unmerged, is the one aimed at the funnel.)

## Metric review

- **Q1 worked — and the fix proves itself three ways.** The synthetic
  proof (5/5) plus the back-compat run (exactly 86 NAV / 0 GENUINE on
  the r112 corpus) plus the live panel (0/90/90) is the proof the
  instrument change is safe and the game needed no change. The classifier
  stays as the standing line: any future "(no line)" is classified by its
  pick, and a GENUINE one is an investigation item, not background noise.
  Proposal: keep the classifier in the landing run's standard set; the
  other drivers (convo-probe, journey-deepening) share the old logging
  and are a follow-up, not this run's scope.
- **Q2 worked — and the crack is the finding to carry.** 94 attributed
  cells on 10/10 seeds against a 0-cell pre-practice baseline is not a
  marginal signal; the instrument detects practice movement in the
  landing window on its second use. The task split is the finding to
  carry: stone/wood/water/deadfall/cook move, fish/forage/garden move a
  little, hunt/scout/patrol do not. Proposal: keep the practice snapshot
  as a standing instrument (cheap — three snapshots per seed); the next
  run need not re-prove the instrument, only watch whether hunt ever
  moves and whether the funnel follows. Keep reporting d1→d14 and d1→d28
  side by side (this panel: 62 vs 94).
- **M-PR1 adopted rule worked — and changed nothing this panel.** The
  ≥3-turn rule passes 10/10 and the unfiltered count agrees, so the
  adoption is validated without re-scoring anything. The rule stays.
- **M7 missed — and the miss is informative, not a defect.** The bar
  counts snapshot-scoped arrivals; on n=3, one slow return (1066 d9,
  rescued by the ladder the next day) drops it to 66.7%. The rescue
  ladder is a separate line and it holds (3/3). Proposal for the next
  run: keep M7 as written (snapshot arrival is the honest measure of the
  go-around rung) and keep R85 as its companion; a panel that supplies
  more kcal skips will judge it harder. The miss stands.
- **M-PR2 revised holds a fourth panel running (100%).** The away-guard
  share is flat at 26% (r110: 36%, r111: 29%, r112: 29%). Both stand as
  the lines for the next run.
- **M6 DOORSTEP-GO (4/4 ate).** The metric stays as a watch; a panel
  that supplies more cases will judge it harder.
- **M-A2 retired, re-confirmed only.** The structural-unreachability
  finding stands; the metric stays retired.
- **Kill mean bounced (27.9 → 26.2).** Seed mixture (r109 was 28.5) —
  reported, not chased. The telemetry LOUD lines are the same
  aggregation artifacts as r94–r113 (baseline NOT rolled).

## Regression + telemetry

- Proof tests (this run, on the rebased tip): NAV-log classifier 5/5.
- Back-compat run on the r112 corpus: nav=86 genuine=0 — exactly the
  pre-registered split.
- **check.js --quick ran once on the branch tip (worktree AGENTS.md
  requires it before push; the ship loop runs the full check before
  pushing).** 284 passed, 6 failed in 411s. The 6 failures are ALL from
  r112's adjudicated pre-existing set (one fewer than r112's 7 — the
  capable-bot food-deed test passed this run; the failure set differs
  between runs, run-to-run instability, not a branch regression):
  test-measurement-proof-update.js ("Proof source inputs are not
  current"), test-measurement-workflow.js (retained neutrality proof),
  test-mobile-combat-cadence.js (enemy announcement / Continue
  round-wrap), test-occupation-panels.js (real CLI workflow),
  test-phone-frame-proof.js (retained browser inputs vs current source),
  test-establishment-r20-fixes-20261020.js (racks-full voice gate).
  None touches the landing analyzer, the practice instrument, the
  NAV-log classifier, or any file this branch changed — the branch
  introduces zero src/js changes and no new failure. The new proof test
  is not in check.js's fixed list; run directly it passes 5/5 on this
  tip. Full output: `/tmp/check-r113-quick.log` (kept on this VM; the
  ship loop re-runs the full check before pushing).
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r113 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94–r112), baseline NOT rolled: (1) systemDay baseline 33 → current
  sum 82 over 10 files (per-seed 8–9, mean 8.2; baseline is a 4-seed-run
  sum); (2) monsterKills baseline pooled mean 24 → current sum 262 over
  10 files (per-seed mean 26.2, range 19–38; r112 was 27.9, r109 28.5).
  No behavior change is indicated.

## Next run (no r114 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are other
legs, so no landing r114 driver is prepared here. The next landing run
prepares its own driver from the r113 driver and re-verifies its seed band
fresh across all dated preregs (next fresh band after 1063–1072 starts at
1073; contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
1043–1052, 1053–1062, 1063–1072).
Carried to the next landing run: the practice snapshot is a standing
instrument (report d1→d14 and d1→d28 side by side); the NAV-log classifier
is a standing instrument (any GENUINE "(no line)" is an investigation item);
the NO-ARRIVAL split + scholarDeaths breakout are the standing lines; the
Eamon fallback is the standing line; Q2-retired ally-accompanied hunt fights
stays a watch (0/20 this panel — the scholar still never hunts with
allies); M-PR1 per-seed (≥3-turn rule, adopted) + adjudication and M-PR2
revised are the standing lines; the Miriam closing-line defect (second
sighting: Celestin), the Eamon fallback's live exercise, and the R70
never-waited friction stay carried; the mantle 2-day latency stays an owed
item; report starvation deaths per seed alongside the R66 gate; the
zero-DMG "others-killed" fight shape is a watch that GREW (8/20) — the
next run should instrument the fight's cause/trigger per the analyzer's
classification before any verdict; M7 stays as written with R85 as its
companion.

## Closeout note

- **Service restart:** killed the first panel attempt mid-seed-1063;
  recovered by re-heartbeat + full re-run; no partial data used.
- **Rebase:** clean, both picks applied, no sequencer stop. Master moved
  twice during the run: first 5198d1056 → 0d63b5985 during pre-flight
  (sim-winnability-round-1021 adoption), then 0d63b5985 → 8e5b97779 during
  the analysis (measurement proof refresh r5, via d3132f456 r3 — both
  evidence/instrument commits, no src/js, no overlap with this branch's
  files). The branch was rebased onto the explicit SHA 8e5b97779 before
  merging; proofs re-run on the rebased tip (NAV-log 5/5, classifier
  0/90/90 on the panel corpus). Master verified stable at 8e5b97779
  immediately before the merge.
- **Practice landing vs this panel (read carefully):** this panel IS the
  second landing measurement of the practice build. The panel's
  game-behavior verdicts are for base 0d63b5985; no panel number was
  re-scored after any rebase.
- **Proof re-run on the branch (all PASS):** NAV-log classifier 5/5
  (run directly; not in check.js's fixed list). check.js --quick on the
  branch tip: 284 passed, 6 failed in 411s — all 6 pre-existing base-state
  issues (stale measurement/phone proofs, mobile cadence, occupation
  panels, racks voice), none touching a file this branch changed; the
  branch introduces no src/js change and no new failure. Full log:
  /tmp/check-r113-quick.log.
- **Telemetry:** 2 LOUD lines, both explained as aggregation artifacts,
  baseline NOT rolled.
- **Index clobber struck on the prereg commit** (known class): committed
  files showed staged-as-deleted + untracked after commit. Repaired via
  HEAD-blob `update-index --add --cacheinfo`; verified status clean +
  diff HEAD empty + blobs match.
- **Registration completed exit 0 in ~3 min.** No silent death this run.
- **Rotation re-verified at closeout: reads `1`.** No discrepancy this run.
- Lock (`2026-11-07T11:59:46Z`, created 11:59Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-07.md` for the closeout record.
