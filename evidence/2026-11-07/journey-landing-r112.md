# Journey — Landing r112 (2026-11-07, Lane A leg 0)

Run id `laneA-20261107T0359Z`, scheduled Fri 2026-11-06 21:45 CST, started ~04:00Z.
Leg 0 LANDING. Branch `journey-landing`, base `0d3c46971` (master at run start;
master moved once during the run — Loop B winnability-0230 `a2f482839` — the
branch was rebased onto it before merging, proofs re-run).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 5254a778c, before any seed ran)

Q1 (PRIMARY): first landing panel on the practice build — does practice move
competence/skill in the first 28 days? Instrument: driver-side
`practiceSnapshot()` (d1/d14/d28 per-villager competence[14 tasks] /
practice / specialist / foodXp / npcSkills), analyzer
`scripts/analyze-landing-r112-practice.js`. Bar (binding): GO if ≥1
attributed moved cell pooled; NO-GO if 0 moved cells on all 10 seeds.
Q2: Eamon autopsy fix (analyzer-only) — horizon-day starvation deaths get
their pantry from the last series snap ≤ death day, labeled
`(series dN, no autopsy)`; proof test synthetic corpora + back-compat on the
r111 corpus before the panel. Q3–Q6 + carried bindings as in r111. Seeds
1053–1062 (fresh — full-scope grep over ALL dated preregs plus the
forbidden-band files; only incidental numbers hit).

## Infrastructure notes (loud first)

- **Registration died silently once.** The first register attempt's session
  was lost with no worktree/branch/registry entry left behind (verified
  before retrying); the retry ground ~10 min (reap + 7.6G checkout) and
  completed exit 0. Heartbeat at registration + 10-min loop.
- **Master moved mid-run** (Loop B winnability-0230, `a2f482839`). Rebased
  onto the explicit SHA before merging; proofs re-run on the rebased tip.
- **Pre-flight clean.** Main tree clean, disk 27%, `git pull` already up to
  date at 06b2ecb42 (master moved to 0d3c46971 during registration — the
  worktree branches from the fresh base; no stale-base risk). Reaper removed
  nothing; LOUD lines only about other owners' dirty trees (never touched).
  Active trees 6/16 at pre-flight (plus this run's).
- **Safe-commit index clobber struck on the prereg commit** (known class).
  Repaired per the recorded recipe (`git update-index --add --cacheinfo`
  with HEAD blob); verified `git status` clean (0 lines), `git diff HEAD`
  empty after.
- **No lock existed at start.** Lock created 04:00Z, run_id
  `laneA-20261107T0359Z`. Deleted at closeout after read-back of run_id.
- **Context (not this run's work):** sim-arena-b (today, Loop B) closed
  killersurvive blank #6 — the arena death and the stranger death are named
  mechanisms now (Gauntlet contest death; alien-player murder by Vex
  Marlowe), with three instrument fixes named, not built. The drive64
  re-judge (sim-durablepair-a, in this base) is NO-GO on the durable bar.
  The one-brain program proceeds elsewhere (build-brain-p1 active).

## Panel

Pilot: 3 seeds (1053–1055), DAYS=28, exit 0 in ~56s. All 3 alive, systemDay
8, practice snapshots present (d1/d14/d28, 14-task competence maps on every
villager), practice analyzer GO on pilot output alone (23 moved cells, all
attributed). Pilot gates passed → expanded to full panel. Full panel: 10
seeds 1053–1062, DAYS=28, exit 0 in ~103s. 10 census files in goal
hidden_files `evidence/2026-11-07/landing-r112/`. Logs:
`landing-r112-pilot.log`, `landing-r112-panel.log` (same dir). Analysis:
`landing-r112-panel-analysis.txt`, `landing-r112-practice.txt`,
`landing-r112-commit-offer.txt`, `landing-r112-fights.txt` (same dir).

## Panel verdicts

- **Q1 PRACTICE: GO — practice moves competence inside 28 days, on every
  seed.** Moved cells d1→d28 = **82 across 10/10 seeds, all 82 attributed**
  (the villager holds practice reps > 0 in that task at d28). Per-seed:
  8, 8, 7, 6, 13, 10, 9, 7, 4, 10 (d1→d14: 56). Practice reps at d28:
  2,521. Moves are ladder steps (1.0 → 1.2/1.3) with 8–32 reps behind
  them. By task: stone 27, wood 22, water 16, deadfall 9, cook 8 —
  **hunt/forage/fish/scout/patrol/garden/tend/teach/mend: 0**. The movement
  is real but narrow in the landing window: villagers get better at the
  chores they repeat (cutting wood, breaking stone, hauling water,
  deadfall, cooking) and not at all at hunting, foraging, or scouting.
  Specialist/foodXp 0→positive: **0** — the specialist gate the roleform
  census named is still shut at 28 days. But npcSkills spread fast: **429
  skills gained panel-wide** (~43/seed; e.g. Kofi gains 7 social skills in
  a month — generous, mediate, read_people, diplomat, silver_tongue,
  gossip_network, old_world_cache). The skill-spread channel (teaching)
  works; the specialist ladder does not move yet. One counting note: seed
  1061's moved cells fell d14→d28 (7→4) because movers died or left the
  roster — d1→d28 undercounts movement when movers die. The funnel did
  not move with it: planSeeds d14 4/10 (r111: 1/10), partyWaits d14 12
  (r111: 17), partyFights d28 138 (r111: 19 — the count method differs by
  run; see below), kills mean 27.9 (r111: 18.8). Practice moving
  competence is a real first-month effect; it is not yet a funnel effect.
- **Q2 EAMON FIX: PROVEN (synthetic 14/14 + r111 back-compat exact), NO
  LIVE EXERCISE.** Proof test `scripts/test-landing-r112-autopsy-fallback.js`:
  14/14 PASS (horizon NPC death, horizon scholar death → class E,
  autopsy-wins-unlabeled, mid-horizon last-snap, no-pantry-anywhere '?',
  no bare '?' on covered deaths). Back-compat on the r111 corpus: the ONLY
  diff is the Eamon line itself — `pantryAtDeath=?` →
  `pantryAtDeath=0 (series d28, no autopsy)` (0 = famine, consistent with
  r111's finding that 1043's pantry hit zero). Zero other lines moved.
  On this panel: **0 starvation deaths**, so 0 STARVATION lines and 0
  pantryAtDeath lines — the fallback got no live exercise and the panel
  bar (zero bare '?') holds vacuously. The fix stands proven by the
  synthetic corpus + the exact r111 case that motivated it.
- **Q1 poison re-test (r109 fix, ongoing proof): 1 poison verdict, 0
  re-tests.** Seed 1056: Hannah tests belltoad (Choir Toad), gets the
  poison verdict ("NOT food," they gasp. "Poison.") — and dies d22 of the
  experiment itself. The poison verdict is recorded exactly once; no
  villager re-tastes it. The fix holds a third panel running. Note the
  cost: the poison test killed the tester — the honest risk outcome, as
  designed.
- **Q3 engagement lines (standing bars):**
  sittings=32, offered(commit)=21, picked=21, promised=15, statedAfterPick=6,
  neverOffered(commit)=11.
  - **M-PR2 revised: 15/(21−6) = 100% ≥ 80% — LINE HOLDS.** All 6 stated
    refusals are the R72 away-guard line ("Wait — I'm out on the road…").
    Away-guard share: 6/21 = 29% (r111: 29%, r110: 36%).
  - **M-PR1 per-seed: 6/10 — MISS (bar ≥8/10).** Seeds over bar: 1054:2,
    1057:2, 1058:2, 1060:2. The miss stands as a miss (metric binding —
    never re-scored). Transcript adjudication of all 11 never-offered
    sittings (read in full, below) finds **zero live cases of the game
    hiding engagement or commit**: 5 probe-left-early (1–2 turns), 2
    withdrawn-want thread-gate (pooled n=8 now), 2 driver-preferred-other-
    threads, 1 no-want-to-establish, 1 stated-favor-different-purpose
    (party invite accepted instead). The miss is driven by probe
    behavior, not by the game. Metric-review proposal (next run, not this
    one): exclude sub-3-turn probe sittings from the per-seed count, or
    make the probe stay longer — the bar as written counts sittings that
    never stay long enough for a want to exist.
  - Pooled never-offered rate 11/32 = 34% (reported for the record;
    per-panel bar retired per r109's review).
  - The pooled thread-gate count grows to 8 (r107 Nino, r110 Leo +
    Stephen, r111 Carlos + Chloe + Miriam, r112 Chloe + Thabo): engagement
    picked or offered, want stayed stage 1, thread='want' in every case,
    every want withdrawn in the opener. The retired question stays retired.
- **Q4 M7 goaround: GOAROUND-HOLDS (7/8 = 87.5% ≥ 80%).** R84 kcal:
  arrivals=8, arrived=7. The one non-arrival (1060 d14, nextTop wild) was
  still rescued by the ladder (R85: finalArrived 8/8). R85 RESCUE-GO.
- **Q5 M6 doorstep: DOORSTEP-GO.** R88 DOORSTEP: checks=280, triggered=2,
  ate=2, drank=0 (r111: 278/0/0). Both triggered steps ate (1054 d10,
  1061 d13). 0 class-E scholar starvation deaths; 0 triggered steps
  ending enterResult===false.
- **Q6 water: UNTESTED (24th run).** Wild outing iterations=22,
  hydUnder25=0, minHyd=58, waterSkips=0. R84/R85 water both UNTESTED, 0
  skips. R86: 1060's d27 haven hyd-0 snap sits outside the hall with
  bottles=1 — MECHANISM OUTSIDE-HALL, not a Maeve shape (0 qualifying).
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (lowest d14 pop 11).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on eight seeds, 9 on two.
- **M3 FIGHT-LOG: PASS.** 21 hunt fights, 21 complete, 1 fatal, 0 with
  unknown/mixed trigger.
- **M5 PEOPLE: PASS.** Wind-down more picks 7, empty 0; WD probe sittings
  10, surfaced 10, menuMore 7, pageTurns 47, phase2Opened 8, phase2Yielded
  4, GATE-A GO, GATE-B GO; betrayal 0 held; party invites offered 11,
  picks 11, spoken 11, dry 0, accepted 2 (PARTY-GO — Katarina d12 and
  Kindrat d9 said yes; r111's 0/3 was seed swing, the mechanism works);
  R67 case labeling 6/6 MATCH (LABELING-GO). Eleven full transcripts read
  for sense (below).
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitSeeds
  5/10, departSeeds 6/10, keptSeeds 5/10, keptTotal 7, OUTING-GO. The 4
  never-waited seeds (1056, 1058, 1059, 1061) are explained by their action
  reasons (the carried driver-side friction, r106) — the driver never gets
  adjacent. R94 DAWN-DOOR: opps=392, waiting=6, has-run=148, node-not-home=1.
- **R73 WINDOW:** promised=9, askedOnly=23, outOfWindow=2, all 9 NARROW,
  keptInsideNarrow=6. NARROW-PATTERN continues (design input).
- **R66 horizon pantry: 3/10 HUNGRY, NOT-HUNGRY by the revised gate** —
  starvationDeaths=0 (r111: 6), slideSeeds=0, bandSeeds=6, noSlideSeeds=4.
  Starvation deaths per seed (r111 proposal, adopted): 0 on all 10 seeds.
  FED seeds: 1054 (3,332), 1055 (3,909), 1058 (2,853), 1059 (2,197),
  1060 (2,627), 1061 (4,515), 1062 (2,903). HUNGRY seeds: 1053 (649),
  1056 (830), 1057 (1,587) — thin, not famine. No famine panel this run.
- **Mantle:** two passes, latencies [1, 1] (1059 Alejandra d20 → Terry
  d21; 1060 Scarlett d22 → Tamika d23); one unresolved-at-horizon (1061
  Ella d28, honestly unresolved, counted in scholarDeaths). The r107
  2-day latency is NOT reproduced a second panel running; the owed item
  stays open.
- **Win-plan (R104, carried):** planSeeds d14 on 4/10 seeds, d28 on 9/10;
  holders 15→32; partyWaits 12→63; partyFights 53→138. **M-A2
  re-confirmed STRUCTURALLY-UNREACHABLE** (retired metric, consistency
  check only): prims=0, no muster, no wave-4 kills, no table plans on all
  d28 censuses.
- **Contests:** fired=21, ended=20, openAtHorizon=1, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths. Grief: 0/12 miss, holds.
- **Kill-mean trend:** per-seed monster-kill mean 27.9 (range 9–39, total
  279) after r111 18.8 → r110 20.6 → r109 28.5. Seed mixture, not a trend —
  reported, not chased. (Note: r111's panel ran the pre-practice build;
  this panel's higher kill mean is seed mixture, not a practice claim —
  the practice instrument measures competence, not kills.)
- **R84 kcal NON-ARRIVAL PROVEN:** arrivals=8, arrived=7 — one skip never
  reached Haven at the next snapshot (1060 d14). The rescue ladder still
  brought the scholar home (finalArrived 8/8). Not a defect: the arrival
  check is snapshot-scoped, the rescue is not.

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — and this time
nobody starves. Three villages end the month thin (1053 at 649 calories a
person, 1056 at 830, 1057 at 1,587) but the other seven end fed, the
richest at 4,515 a person. Everyone meets the System by day 8 or 9. Three
scholars die, but only one of them in a fight: Ella, on the last day, alone
against a wave-3 Buffering that kept slipping between frames — she landed
three real hits and died with the beast at a third of its health. The other
two die off the battlefield: Alejandra to lockjaw, Scarlett to a betrayal.
The villages hunt hard (9 to 39 monster kills each, 279 in total) and test
their meat: all ten taste it, eight get it out of the pantry, and one
villager dies proving a toad is poison — the only poison on the panel, found
once and never re-tasted. People ask each other for help and mostly get it:
21 of 32 sittings offered the commit, 15 of 21 picks became real promises,
and the six refusals were all honest ("I'm out on the road — find me when
I'm back"). Parties form and this time two people say yes. Villagers are
getting better at their work in a way you can count: 82 times in a month a
villager's competence stepped up a rung — cutting wood, breaking stone,
hauling water, cooking — while nobody got better at hunting at all. Two
villages lose nobody at all (1054, 1058). The villages are alive, social,
and mostly fed — and this panel, the story is that practice works, narrowly.

Pops end 12, 12, 11, 10, 11, 12, 11, 9, 12, 11 (seeds 1053–1062). Scholars
spawned: Kieran, Aidan, Kevin, Daniel, Brooklyn, Soo, Alejandra, Scarlett,
Ella, Wanda. Monster kills per seed: 9, 30, 33, 19, 31, 23, 38, 39, 34, 23.
Self-sufficiency at d28 ranges 0.884–1.06. Villager deaths 12 total: 3
scholars (Ella, wild fight; Alejandra, lockjaw; Scarlett, betrayal) and 9
others — 2 ambush (Adaeze d11, Diana d7), 1 experiment (Hannah d22,
poison), 1 sickness (Remo d24), 2 monster (Tanya d25 Buffering, Iver d28),
1 combat (Oscar d28), 1 alien (Erich d22), 1 monster (Everett d4).
**Seed 1059 loses its scholar to lockjaw:** Alejandra dies day 20 of a
disease, not a fight — the mantle passes to Terry the next day. Iver dies
day 28 to a monster, the horizon-day death. The village stands at 11, fed.
**Seed 1060 loses three, its scholar included:** Diana ambushed day 7,
Erich killed by an alien day 22, Scarlett betrayed day 22 — the village
bends under three different kinds of death in one fortnight, and still ends
fed at 2,627 a person. The month's hardest village.
**Seed 1061 loses two on the last day:** Oscar in combat and Ella, the
scholar, to the Buffering in the wild — both day 28, both registered, the
mantle honestly unresolved at the horizon. The village stands at 12, fed
at 4,515 a person — the richest on the panel, and the one that lost its
scholar last.
**Seed 1054 is the fed village:** 12 pop, 0 deaths, 30 kills, FED at 3,332
a person — healthy, and the only seed on the panel where nobody dies.

## People check (transcripts read in full — all 11 never-offered sittings)

- **1053 d8 Brooklyn (unestablished): Real — the party gets a name.** A
  14-turn sitting. Brooklyn never asks for anything (stage 0 throughout);
  the driver names the party ("APEX SNACKS" — the System suggests it, the
  village watches the broadcast), asks personal questions, gossips. Lines
  that land: "Protection isn't about fighting. It's about making fighting
  unnecessary." / "I sleep lighter than I used to. Someone has to hear
  things first." The want stayed unestablished because there was no want
  to establish — Brooklyn wanted company and a name, not a favor.
- **1054 d13 Thabo (unestablished): Real, probe-left-immediately.** The
  driver takes [dlg:subject] once, gets the ambush-of-Boris case menu, and
  leaves after 1 turn. The want never got established because the driver
  left, not because the game hid the option.
- **1054 d9 Eduardo (unestablished): Real — the engagement was offered,
  the driver chose elsewhere.** Eduardo opens with a gossip question
  ("People are saying things. About you. Is any of it true?"); the driver
  answers yes, takes [invite_party] (declined: "I don't know you well
  enough for that."), then pages [menu:more] twice and gets "(no line)"
  twice. The [alive:want:ask_favor] option was offered at turns 3 and 5
  and never picked. Polish note: "(no line)" repeats on [menu:more]
  (recurs from r110/r111).
- **1055 d9 Chloe (unresolved): Real — the thread-gate shape, seventh
  pooled case.** Chloe opens by withdrawing the want; the driver picks
  [ask:gossip] instead of the offered engagement and pages [dlg:more]
  through a 7-deep gossip thread with named villagers doing real things
  ("Mabel headed out to forage." / "Wolfgang is back. Walked in like
  they'd never left."). The want stays stage 1, thread='want'.
- **1056 d12 Thabo (unresolved): Real — the thread-gate shape, eighth
  pooled case, and the engagement WAS picked.** Thabo opens "Got a minute?
  Something needs doing and I'd rather not do it alone." The driver picks
  [alive:want:ask_favor] at turn 4 — Thabo deflects ("No, really — it's
  handled. Thanks for asking, though."), and a [goon] loosens him ("A
  warmth settles over the conversation — they lean in a little."). The
  want stays stage 1 because the NPC withdrew it, not because the game
  hid the option. The [dlg:react] listen beats read thin ("Anyway." /
  "So.") — polish-grade.
- **1057 d12 Katarina (stated): Real — the favor was already voiced, the
  sitting had another purpose.** Katarina opens "I trade in what I know.
  My knowledge for yours. Or food, if you're short on secrets." (stage 2).
  The driver picks [invite_party] — Katarina ACCEPTS ("...Fine. This had
  better be worth it.") — then leaves after 1 turn. The commit option
  never surfaced because the driver took the party invite and left.
- **1057 d14 Onni (unestablished): Real — the invite came first.** Onni
  opens with a betrayal invitation ("Come get air with me. I need to
  think out loud."), the driver declines honestly ("Not this time."), then
  the murder-of-Katarina case menu crowds the talk and the driver leaves
  after 1 turn. Onni never asked for anything (stage 0).
- **1058 d14 Lena (unestablished): Real, case-crowded.** Lena opens on the
  gossip question; the driver answers yes, takes [dlg:subject] once, gets
  the ambush-of-Amanda case menu, leaves after 2 turns. The want never got
  established — a probe that leaves early.
- **1058 d7 Yousra (unestablished): Real — the richest sitting on the
  panel, 17 turns, and the worst "(no line)" case.** Yousra opens with a
  betrayal invitation ("Come see what I found. You won't believe it."),
  the driver declines, then pages [menu:more] six times and gets "(no
  line)" six times — while the [alive:want:ask_favor] option sat offered
  at turns 3, 7, 11, and 15, never picked. Between the empty pages the
  sitting is genuinely good: "I've started talking to myself. Myself
  gives good advice, mostly." / "If there's a job nobody wants, I'll take
  it. That's how you earn a place, right?" / "I want to be someone's
  first call, not their last resort." One verbatim repeat ("Anyway. What
  did you want?") is flagged in the transcript. The engagement was
  offered four times; the driver kept paging past it.
- **1060 d13 Yuki (unestablished): Real, case-crowded.** Yuki opens "At
  night I count the stars and name them after people." / "Walk with me? I
  want another pair of eyes on something." — then a betrayal invitation,
  declined honestly, the murder-of-Diana case menu, and the driver leaves
  after 2 turns. The want never got established.
- **1060 d15 Somchai (unestablished): Real, thin.** Two turns of [dlg:react]
  listen ("Well." A breath. "That's where things stand." / "They nod
  slowly, not quite done, not quite continuing."), then the driver leaves.
  Somchai's opener is a person ("I used to complain about Bangkok traffic.
  I'd kill for traffic. Orderly, honking traffic.") but the listen beats
  give him nothing to say. Probe-left-early; the listen beats read as
  filler when doubled.

## Blank filled / documented

- **Q1 PRACTICE INSTRUMENT LANDED (driver-only, proof 14/14).** The
  practice snapshots + analyzer are in, and they report real movement on
  live panel data (82 attributed cells). The instrument is reusable by any
  later run that wants competence movement in its window.
- **Q2 EAMON FIX LANDED (analyzer-only, proof 14/14, back-compat exact).**
  The fallback reports correctly on synthetic corpora and on the exact
  r111 case that motivated it. It got no live exercise this panel (0
  starvation deaths) — the next famine panel will exercise it for real.
- **M-PR1 MISS — DOCUMENTED (adjudication, no re-score).** The per-seed
  bar misses at 6/10 (see Metric review for the proposal). The
  adjudication finds zero hidden cases; the miss is probe behavior.
- **"(no line)" ON [menu:more] — POLISH BLANK, DOCUMENTED (no fix this
  run).** The empty-page return recurs and peaks on this panel: Yousra's
  sitting returns "(no line)" six times in 17 turns; Eduardo's twice. A
  player paging for more things to say hits dead air repeatedly. Flagged
  for a future run; the sittings around it are otherwise the panel's best.
- **ELLA vs THE BUFFERING — DOCUMENTED (adjudication, no code change).**
  Seed 1061 day 28: Ella fights a wave-3 Buffering alone (allies 0),
  lands 3 sync-window strikes (45/49/45, feast-doubled), and dies with
  the beast at 123/338 HP. Seven of her ten strikes pass through the
  brightest frame for 0 damage — the trick reads clearly in the log
  ("Your strike passes through the BRIGHTEST frame — light and noise. It
  was already gone; that frame is the past.") and the game teaches it
  mid-fight (Codex: Catch Up). This is the trick system working as
  designed on a hard beast, not a defect: she fought the mechanic
  correctly and still lost to a wave-3 beast solo on the last day.
- **ZERO-DMG "OTHERS-KILLED" FIGHTS — DOCUMENTED (adjudication, no code
  change).** Three fights (1055 d23, 1059 d26, 1060 d23) end won with the
  scholar striking 0 times while others deal all the damage (83/105/49).
  The scholar stands by while allies/others kill the beast — the fight
  resolves, the scholar contributes nothing. Worth one look before the
  next arm treats party fights as scholar fights: the scholar is a
  bystander in their own fight log on 3/21 fights.
- **MIRIAM CLOSING LINE — STILL NOT FIXED (carried).** The r111-named
  defect (wind-down closer asserts a want settled while the thread is
  still open) stays flagged for a future run; this run's scope was the
  practice instrument + the Eamon fix.
- **Mantle 2-day latency (r107 owed item) NOT reproduced a second panel
  running.** Latencies this panel are [1, 1] plus one honestly unresolved
  horizon death. The owed item stays open.
- **No other blank filled this run.** Water still untested (24 runs); the
  R70 never-waited friction recurs on 4/10 seeds (driver-side, carried);
  M7/M6 both GO this panel for want of more cases (7/8, 2/2).

## Notable events

- 0 starvation deaths in one panel (r111: 6) — the first famine-free panel
  since the r107–r111 line's famine panel; the pantry is thin on 3 seeds
  but never lethal.
- 3 scholar deaths in one panel (r111: 3) — but a different shape: 1 wild
  fight (Ella vs the Buffering), 1 disease (Alejandra, lockjaw), 1
  betrayal (Scarlett). r111's three were all solo wild fights.
- Party invitations accepted 2/11 (r111: 0/3) — Katarina and Kindrat say
  yes; the mechanism (offered→spoken→accepted) works, and the accept rate
  swings by seed.
- Flesh channel: 8/10 seeds get monster meat out of the pantry as unknown
  (r111: 3/10), 10/10 test it — the channel's test stage is the live one,
  and the arrival stage opened wider this panel.
- Practice moves competence on 10/10 seeds in the first month — the first
  landing panel to measure the landed practice build, and the movement is
  unambiguous (82 attributed cells, 0 in the pre-practice baseline).
- 1060's scholar dies by betrayal on the same day an alien kills Erich —
  two different death channels on one village in one day.

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 21 fired, flesh
  channel opens 8/10 (tests 10/10), outings complete and keep (7 kept),
  win-plans seed 4/10 by d14 and 9/10 by d28.
- **Fun: yes.** Transcripts read like people; Yousra's 17-turn sitting is
  the panel's best — a villager who talks to herself, takes the jobs
  nobody wants, and wants to be someone's first call. Brooklyn names the
  party APEX SNACKS on camera. Katarina accepts a party invite with
  reluctance that reads as character ("...Fine. This had better be worth
  it."). The villages are mostly fed this panel, which reads as a
  breather after r111's famine — and Ella's last-day death to the
  Buffering is the month's story.
- **Winnable: not yet — unchanged at this leg.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone. No wave-4 kills, no muster, no
  table plans on any d28 census. (Context from outside this run: the
  practice build is the first landed lever to move a landing-leg number —
  competence moves in the first month — but it moves craft chores, not
  hunting, and the funnel has not moved with it. The drive build, still
  unmerged, is the one aimed at the funnel.)

## Metric review

- **Q1 worked — and the movement is unambiguous.** 82 attributed cells
  on 10/10 seeds against a 0-cell baseline is not a marginal signal; the
  instrument detects practice movement in the landing window on its first
  use. The task split is the finding to carry: stone/wood/water/deadfall/
  cook move, hunt/forage/fish/scout/patrol do not. Proposal: keep the
  practice snapshot as a standing instrument on landing panels (cheap —
  three snapshots per seed); the next run need not re-prove the instrument,
  only watch whether hunt/forage ever move and whether the funnel follows.
  One counting refinement for the next run: report d1→d14 and d1→d28 side
  by side (this panel: 56 vs 82) so mover-deaths don't silently shrink the
  d28 count — 1061's 7→4 is the case that proves the need.
- **Q2 worked — by the book.** The synthetic proof (14/14) plus the
  back-compat run (exactly 1 line changed, the Eamon line itself) is the
  proof the instrument change is safe. The panel gave it no live exercise
  (0 starvation deaths) — that is a property of this panel, not a gap in
  the proof. Proposal: keep the fallback as the standing line; a future
  famine panel exercises it live.
- **M-PR1 missed — and the miss is informative, not a defect.** The bar
  counts every never-offered sitting per seed, including 1–2-turn probes
  that leave before a want can exist (5 of this panel's 11). The game
  offered the engagement in the sittings where a want existed and the
  driver stayed (Thabo d12: picked, deflected honestly). Proposal for the
  next run: count only sittings with ≥3 turns toward the per-seed bar
  (probes that leave in 1–2 turns are driver behavior, not engagement
  failures), and keep the full transcript adjudication as the backstop.
  The bar itself is NOT re-scored this run — the miss stands.
- **M-PR2 revised holds a third panel running (100%).** The away-guard
  share is flat at 29% (r110: 36%, r111: 29%). Both stand as the lines
  for the next run.
- **M7/M6 both GO this panel.** M7 7/8 (87.5%) with the one non-arrival
  rescued by the ladder; M6 2/2 ate. The metrics stay as watches; a panel
  that supplies more cases will judge them harder.
- **M-A2 retired, re-confirmed only.** The structural-unreachability
  finding stands; the metric stays retired.
- **Kill mean bounced (18.8 → 27.9).** Seed mixture (r109 was 28.5) —
  reported, not chased. The telemetry LOUD lines are the same
  aggregation artifacts as r94–r111 (baseline NOT rolled).

## Regression + telemetry

- Proof tests (this run, on the rebased tip): autopsy fallback 14/14,
  practice instrument + analyzer 14/14.
- Back-compat run on the r111 corpus: exactly 1 line changed (the Eamon
  line) — nothing else moved.
- **check.js --quick ran twice on the rebased tip (worktree AGENTS.md
  requires it before push; the ship loop runs the full check before
  pushing).** Run 1: 281 passed, 9 failed in 969s (run while a sibling
  loop's check ran concurrently — 3 of the 9 were ~120s timeouts). Run 2
  (no concurrent check): 283 passed, 7 failed in 585s. The failure set
  differs between runs — run-to-run instability, not a branch regression.
  The 7 named failures in run 2, all adjudicated pre-existing on this
  base (zero src/js changes in this branch; the only test surface it
  shares — the r104 analyzer — passes its dedicated tests 16/16 and
  PASS, above):
  - `test-measurement-proof-update.js` — "Proof source inputs are not
    current" (balance proof stale vs Game/controller/harness inputs).
  - `test-measurement-workflow.js` — "retained neutrality proof covers
    the current Game/controller/harness inputs" (same stale-proof class).
  - `test-mobile-combat-cadence.js` — enemy announcement / Continue
    round-wrap (mobile combat cadence).
  - `test-occupation-panels.js` — real CLI workflow.
  - `test-phone-frame-proof.js` — retained browser inputs vs current
    source; receipt source stale (index.html).
  - `test-capable-bot-20261014.js` — capable player combat earns the food
    deed at first use.
  - `test-establishment-r20-fixes-20261020.js` — racks-full voice gate,
    next-day count (expected 2, got 1).
  None touches the landing analyzer, the practice instrument, or any file
  this branch changed. They fail on the base, not on the branch — the
  branch introduces no src/js change and no new failure. Fixing stale
  measurement/phone proofs and mobile cadence is out of this run's scope
  (landing leg); recorded here for the ship loop / next owner, not fixed
  here. Full run-2 output: `/tmp/check-r112-quick.log` (kept on this VM;
  the ship loop re-runs the full check before pushing).
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r112 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94/r95/r96/r97/r98/r99/r104/r105/r106/r107/r108/r109/r110/r111),
  baseline NOT rolled: (1) systemDay baseline 33 → current sum 82 over 10
  files (per-seed 8–9, mean 8.2; baseline is a 4-seed-run sum); (2)
  monsterKills baseline pooled mean 24 → current sum 279 over 10 files
  (per-seed mean 27.9, range 9–39; r111 was 18.8, r109 28.5). No behavior
  change is indicated.

## Next run (no r113 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are other
legs, so no landing r113 driver is prepared here. The next landing run
prepares its own driver from the r112 driver and re-verifies its seed band
fresh across all dated preregs (next fresh band after 1053–1062 starts at
1063; contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
1043–1052, 1053–1062).
Carried to the next landing run: the practice snapshot is a standing
instrument (report d1→d14 and d1→d28 side by side); the NO-ARRIVAL split +
scholarDeaths breakout are the standing lines; the Eamon fallback is the
standing line; Q2-retired ally-accompanied hunt fights stays a watch (0/21
this panel — the scholar still never hunts with allies); M-PR1 per-seed +
adjudication and M-PR2 revised are the standing lines (M-PR1 proposal: count
only ≥3-turn sittings — for the NEXT run to adopt or refuse, not this one);
the Miriam closing-line defect, the "(no line)" [menu:more] polish blank,
and the Eamon fallback's live exercise are instrument/polish items to fix or
watch; the mantle 2-day latency stays an owed item; the R70 never-waited
friction stays carried; report starvation deaths per seed alongside the R66
gate; the zero-DMG "others-killed" fight shape is a watch (3/21 this panel).

## Closeout note

- **Rebase:** clean, all picks applied, no sequencer stop. Rebased onto
  master `a2f482839` (Loop B winnability-0230 landed after this run's
  base). Proof re-run on the rebased tip: autopsy 14/14, practice 14/14.
  Master verified stable at `a2f482839` immediately before the merge.
- **Practice landing vs this panel (read carefully):** this panel IS the
  first landing measurement of the practice build (2b9b0371e in base).
  The panel's game-behavior verdicts (famine-free, solo hunts, engagement
  lines) are for base 0d3c46971 + the rebase's evidence-only Loop B
  commits; no panel number was re-scored after the rebase.
- **Proof re-run on the rebased branch (all PASS):** autopsy fallback
  14/14, practice 14/14. check.js --quick ran twice on the rebased tip:
  281/9 then 283/7; the 7 named failures are pre-existing base-state
  issues (stale measurement/phone proofs, mobile cadence, capable-bot
  food deed, occupation panels, racks voice) — none touches a file this
  branch changed; the analyzer-adjacent tests pass (r111 fixes 16/16,
  r106 starvation-class PASS). Full run-2 log: /tmp/check-r112-quick.log.
- **Telemetry:** 2 LOUD lines, both explained as aggregation artifacts,
  baseline NOT rolled.
- **Index clobber struck on the prereg commit** (known class): committed
  files showed staged-as-deleted + untracked after commit. Repaired via
  HEAD-blob `update-index --add --cacheinfo`; verified status clean +
  diff HEAD empty.
- **Registration died silently once** (session lost, no residue); the
  retry completed exit 0 after ~10 min.
- **Rotation re-verified at closeout: reads `1`.** No discrepancy this run.
- Lock (`laneA-20261107T0359Z`, created 04:00Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-07.md` for the closeout record.
