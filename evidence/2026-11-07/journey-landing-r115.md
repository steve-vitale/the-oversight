# Journey — Landing r115 (2026-11-07, Lane A leg 0)

Run id `laneA-20261107T1543Z`, scheduled Sat 2026-11-07 09:45 CST, started ~15:43Z.
Leg 0 LANDING. Branch `journey-landing`, base `b667f5a4f` (master at run start;
master moved 7b8ee24bd → b667f5a4f DURING pre-flight — Loop B round-1430
evidence; the worktree branches from the fresh tip, no stale-base risk).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 80bf4ce01, before any seed ran)

Q1 (PRIMARY): zero-DMG fights — bystander or stands-through? Two instrument
bugs found on the r113 corpus BEFORE the panel (driver-only fixes, zero
src/js): (a) R82 drops killing blows (strike wrapper resolved the entry
after the strike; a killing blow ends the fight inside tbPlayerStrike, so
the strike was lost — 4 r113 fights carry 'you' damage with 0 recorded
strikes); (b) allies undercount (kind 'ally' only, but companions join as
kind 'villager' — all 8 r113 zero-DMG fights read allies=0 while villagers
dealt the damage). Bar: invariant test 0 violations on the panel corpus =
FIX-WORKS; one shape ≥80% of others-killed = MECHANISM-ESTABLISHED. Q2:
Miriam closing-line data fix (one steady-pool exit line reworded; proof
test before-FAIL/after-PASS on live data). Q3–Q6 + carried bindings as in
r113. Seeds 1073–1082 (fresh — full-scope grep over ALL dated preregs plus
the forbidden-band lists; only incidental numbers hit).

## Infrastructure notes (loud first)

- **EPERM flap ~16:00Z refused one heartbeat write** (PermissionError on the
  registry write). Retried immediately; heartbeat landed 16:01:10Z. Last
  good heartbeat before it 15:58:12Z — never near the 15-minute staleness
  threshold. Plain writes worked throughout (the probe wrote fine in the
  same minute) — the flap hit the atomic registry write only, briefly.
- **Safe-commit index clobber struck on the prereg commit** (known class).
  Repaired per the recorded recipe (`git update-index --add --cacheinfo`
  with HEAD blob); verified `git status` clean (0 lines), `git diff HEAD`
  empty, all 6 blobs match HEAD. Commit 80bf4ce01 itself is correct (6
  files, +5160 lines).
- **Pre-flight clean.** Main tree clean, disk 23%, `git pull` already up to
  date. Reaper removed nothing; active trees 2/16 at pre-flight (plus this
  run's). **No lock existed at start.** Lock created 15:43Z, run_id
  `2026-11-07T15:43:41Z`. Deleted at closeout after read-back of run_id.
- **Heartbeat loop held** at registration + ~10-min intervals (plus an
  immediate re-heartbeat after the flap).
- **Context (not this run's work):** the drive build is still unmerged; the
  one-brain program proceeds elsewhere (build-brain-p1 active).

## Panel

Pilot: 3 seeds (1073–1075), DAYS=28, exit 0 in ~15s. All 3 alive, systemDay
8, practice snapshots present (d1/d14/d28), Q1 fields present in census
fights (rounds 2/2/8, turnOrder arrays, villagers arrays), strikes recorded
(1/1/4), invariant test PASS on the pilot corpus (3 fights, 0 violations),
3 hunt fights. All 5 pilot gates passed → expanded to full panel. Full
panel: 10 seeds 1073–1082, DAYS=28, exit 0 in ~32s. 10 census files in goal
hidden_files `evidence/2026-11-07/landing-r115/`. Logs:
`landing-r115-pilot.log`, `landing-r115-panel.log` (same dir). Analysis:
`landing-r115-panel-analysis.txt`, `landing-r115-practice.txt`,
`landing-r115-navlog.txt`, `landing-r115-commit-offer.txt`,
`landing-r115-zerodmg.txt`, `landing-r115-fights.txt` (same dir).

## Panel verdicts

- **Q1 ZERO-DMG: MECHANISM-ESTABLISHED — and the watch re-bases.** Panel:
  16 fights, **2 zero-DMG (2/16, vs r113's 8/20)** — both shape B
  (scholar-stood-through), both trigger pending-face, 2/2 = 100% ≥80%.
  The invariant test PASSES on the panel corpus (16 fights, 0 violations)
  — the R82 fix works on live data: 14/16 fights carry recorded strikes,
  and 5 won fights end on the scholar's strike as the last damage (on the
  r113 corpus those would have read as 0-strike fights). The count fell
  because the 4 phantom killing-blow fights are now correctly recorded as
  scholar kills. The re-based watch is 2/16, and the mechanism is narrower
  than the watch's name: BOTH remaining fights end **routed, not won** —
  lockpick raccoons (w1, 43/44 HP) that take small villager damage (Greta
  10, Kunio 22), steal something (Muscadine Grapes; a Hatchet), and run.
  The scholar had turns (turnPos 0 — scholar goes first; rounds 2–3) and
  never struck; 1082's scholar ends the fight standing on the edge tile
  (8,8), consistent with the policy flee-walking toward the barrier while
  the beast did its steal-and-run routine. So: the scholar is not a
  bystander to allies killing — the beast leaves on its own script after a
  villager nicks it, while the scholar's turns go to fleeing/waiting. The
  "others-killed" label misnames these two; nothing was killed. No S-shape
  (struck-but-0-dmg) on this panel — no Paul repeat. The fixed allies
  count re-bases the ally watch too: **15/16 fights have villager allies
  present** (r113's "0 in 20" was the undercount artifact, retired as a
  measurement, not a finding).
- **Q2 MIRIAM LINE: FIXED, and live on the panel.** Proof test
  `scripts/test-landing-r115-miriam-line.js`: before-FAIL (exactly 1
  settled-asserting line in 96 exit lines) / after-PASS (0, steady pool
  intact at 8). Live check: **zero occurrences of "That's settled"** across
  all 106 panel transcripts, and the reworded line — "Good talk. Onward,
  then." — appears 4 times as a closing line, including 1076 d6 Paisley,
  a sitting whose want stays unresolved: it reads correctly there, no false
  settlement claim. The Miriam defect is closed; the oldest open polish
  item from this line is gone.
- **Q2 PRACTICE: GO — third panel running.** Moved cells d1→d28 = **94
  across 10/10 seeds, all 94 attributed** (d1→d14: 57) — the same pooled
  94 as r113 (r112: 82). Per-seed d1→d28: 9, 8, 11, 13, 10, 10, 7, 10, 9, 7.
  By task: wood 27, stone 25, water 20, cook 9, deadfall 8, **fish 4,
  garden 1**, forage 0, hunt/scout/patrol/tend/teach/mend: 0. The crack
  outside the chores holds (fish 4, garden 1) but does not widen; hunt
  still never moves. Specialist/foodXp 0→positive: **0** — the specialist
  gate is still shut at 28 days. Practice reps at d28: 3,132.
- **Q3 engagement lines (standing bars):**
  sittings=26, offered(commit)=20, picked=20, promised=14, statedAfterPick=6,
  neverOffered(commit)=6.
  - **M-PR1 per-seed (≥3-turn rule): 9/10 — PASS.** The 6 never-offered
    sittings split 4 counted / 2 excluded by turn count: counted — 1075 d8
    Ruby (11 turns), 1076 d6 Paisley (6), 1076 d10 Zoe (5), 1082 d13 Leo
    (7); excluded — 1073 d8 Fatima (1), 1077 d11 David (1). Per-seed
    counted never-offered: 1076 has 2, all others ≤1 — 9/10 seeds pass
    (bar ≥8/10). The unfiltered count gives the same verdict (1076 the
    only seed with 2). Transcript adjudication of all 6 never-offered
    sittings (read in full, below) finds **zero live cases of the game
    hiding engagement or commit**.
  - **M-PR2 revised: 14/(20−6) = 14/14 = 100% ≥ 80% — LINE HOLDS.** All 6
    stated refusals are the R72 away-guard line ("Wait — I'm out on the
    road…"). Away-guard share: 6/20 = 30% (r113: 26%, r112: 29%).
  - Pooled never-offered rate 6/26 = 23% (reported for the record;
    per-panel bar retired per r109's review).
  - The pooled thread-gate count grows to 13 (r113's 9 + 1075 Ruby, 1076
    Paisley, 1077 David, 1082 Leo): engagement never picked, want stayed
    stage 1, thread='want', want withdrawn in the opener. The retired
    question stays retired.
- **Q4 M7 goaround: GOAROUND-HOLDS — 4/4 = 100% ≥ 80%.** R84 kcal:
  arrivals=4, arrived=4 (1074 d10, 1078 d11, 1081 d6, 1081 d10). The r113
  WEAK (2/3) is repaired by a fuller sample, not by re-scoring: the
  snapshot bar is met outright this panel, and the ladder agrees (R85
  RESCUE-GO 4/4).
- **Q5 M6 doorstep: UNTESTED (no trigger).** R88 DOORSTEP: checks=280,
  triggered=0, ate=0, drank=0 (r113: 280/4/4). No hungry/thirsty Haven day
  arose to trigger the step — nothing to judge, and the M6 clauses are
  not claimed as GO on an empty sample. The sibling rung still fires:
  R88 EAT-ON-ARRIVAL 4/4 ate (the four kcal arrivals all ate on arrival).
  0 class-E scholar starvation deaths; 0 triggered steps ending
  enterResult===false (vacuous).
- **Q6 water: UNTESTED (26th run).** Wild outing iterations=5,
  hydUnder25=0, minHyd=78, waterSkips=0. R84/R85 water both UNTESTED, 0
  skips. R86: 1079's d13 haven hyd-0 snap sits inside the hall with
  bottles=5 — MECHANISM MIXED, not a Maeve shape (0 qualifying).
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (d14 pops 11–12).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on nine seeds, 9 on 1080.
- **M3 FIGHT-LOG: PASS.** 16 hunt fights, 16 complete, 1 fatal, 0 with
  unknown/mixed trigger.
- **M5 PEOPLE: PASS.** Wind-down more picks 7, empty 0; WD probe sittings
  10, surfaced 9, menuMore 7, pageTurns 77, page3sittings 9, maxPage 3,
  phase2Opened 9, phase2Yielded 7, GATE-A GO, GATE-B GO; betrayal 0 held;
  party invites offered 7, picks 7, spoken 7, dry 0, accepted 5 (PARTY-GO
  — Ruby, Rafael, Nino, Tashi, Kunio say yes; Zoe and Carlos refuse
  honestly on trust: "I don't know you well enough for that. Ask me again
  when we've survived something together."); R67 case labeling 14/14 MATCH
  (LABELING-GO). Six full transcripts read for sense (below).
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitSeeds
  3/10, departSeeds 5/10, keptSeeds 2/10, keptTotal 2, OUTING-GO. The 7
  never-waited seeds (1074, 1075, 1076, 1077, 1079, 1081, 1082) are
  explained by their action reasons (the carried driver-side friction, r106)
  — the driver never gets adjacent. R94 DAWN-DOOR: opps=418,
  waitDiagMissing=0.
- **R73 WINDOW:** promised=8, askedOnly=30, outOfWindow=0, all 8 NARROW,
  keptInsideNarrow=2. NARROW-PATTERN continues (design input).
- **R66 horizon pantry: 6/10 HUNGRY, NOT-HUNGRY by the revised gate** —
  starvationDeaths=0 (r113: 0), slideSeeds=0, bandSeeds=5, noSlideSeeds=5.
  Starvation deaths per seed: 0 on all 10 seeds. FED seeds: 1075 (3,749),
  1078 (2,014), 1080 (6,499), 1081 (2,390). HUNGRY seeds: 1073 (1,806),
  1074 (1,306), 1076 (486), 1077 (1,917), 1079 (501), 1082 (1,740) — six
  thin villages, no famine deaths. 1076 is the famine seed (486/person)
  and still nobody starves.
- **Mantle:** three passes, latencies [0, 1, 1] (1076 Chris d26 → Dwayne
  d26; 1078 Hattie d8 → Patrick d9; 1078 Patrick d23 → Rocco d24); zero
  unresolved at horizon. The r107 2-day latency is NOT reproduced a fourth
  panel running; the owed item stays open.
- **Win-plan (R104, carried):** planSeeds d14 on 6/10 seeds, d28 on 9/10;
  holders 16→29; partyWaits 10→65; partyFights 33→126. **M-A2
  re-confirmed STRUCTURALLY-UNREACHABLE** (retired metric, consistency
  check only): prims=0, no muster, no wave-4 kills, no table plans on all
  d28 censuses.
- **Contests:** fired=19, ended=17, openAtHorizon=2, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths. Grief: 0/12 miss, holds.
- **Kill-mean trend:** per-seed monster-kill mean 30.2 (range 18–44,
  total 302) after r113 26.2 → r112 27.9 → r111 18.8 → r110 20.6 → r109 28.5.
  Highest of the recent panels, still seed mixture — reported, not chased.
- **R69 ARMOR:** teleLineDisagree=0 — clean this panel (r113's 2 explained
  disagreements do not recur).
- **R88 MAEVE:** snaps=1, qualified=0, MIXED mechanism (1 inside-hall,
  with bottles).
- **Poison re-test (r109 fix, ongoing proof): 2 poison verdicts, 0
  re-tests, both testers SURVIVE.** Seed 1080: Ananya tests belltoad
  (Choir Toad) d10, gets the poison verdict; seed 1082: Lena tests
  belltoad d17, gets the poison verdict ("NOT food," they gasp.
  "Poison."). Both live (1080 loses nobody; 1082's only death is Natalia
  d9, ambush). Each poison verdict is recorded exactly once; no villager
  re-tastes it. The fix holds a fifth panel running — and again neither
  tester pays with her life.

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — and again nobody
starves, though six of the ten end it thin. Four villages end fed (1080
richest at 6,499 calories a person, 1075 at 3,749, 1081 at 2,390, 1078 just
over the line at 2,014); the other six end hungry, the thinnest at 486 a
person — 1076's pantry all but empty on the last day, and still nobody
starves. Everyone meets the System by day 8 or 9. Three scholars die: Chris
on day 26, taken by a contest (The Price); Hattie on day 8 in the wild to a
Highbeam Deer she fought to within 8 HP of killing; Patrick on day 23,
betrayed. The villages hunt hard (18 to 44 monster kills each, 302 in
total) and test their meat: all ten taste it, all ten get it out of the
pantry, and two villagers — Ananya and Lena — prove a toad is poison and
both live to tell it. People ask each other for help and mostly get it: 20 of 26 sittings
offered the commit, 14 of 20 picks became real promises, and the six
refusals were all honest ("I'm out on the road — find me when I'm back").
Parties form and five people say yes. Villagers are getting better at their
work in a way you can count: 94 times in a month a villager's competence
stepped up a rung — cutting wood, breaking stone, hauling water, cooking —
and a few steps landed outside the chores again: four in fishing, one in
gardening. But nobody got better at hunting at all. Only one village loses
nobody (1080). The villages are alive, social, and mostly thin — and this panel, the story is that the silence was never
silence twice over: the "zero-damage" fights were mostly the scholar's own
killing blows the instrument had been dropping, and the two that remain are
a raccoon stealing lunch and running off while everyone watches.

Pops end 11, 11, 11, 10, 10, 10, 11, 12, 11, 11 (seeds 1073–1082).
Monster kills per seed: 25, 21, 44, 18, 38, 42, 22, 43, 21, 28.
Self-sufficiency at d28 ranges 0.837–0.979. Villager deaths 12 total: 3
scholars (Chris, contest; Hattie, the wild; Patrick, betrayal) and 9
others — 5 ambush (Hans d7, Lucas d6, Somchai d11, Natalia d9, Hinerangi
d13), 3 monster (Ivy d15, Bakari d27 to a Highbeam Deer, Kennedy d9), 1
wound-that-wouldn't-close (Jun-chan d14). **Only one village loses nobody:
1080.** **Seed 1076 is the famine village:** the pantry slides to 486 a
person and still nobody starves; Chris dies day 26 in The Price contest
and the mantle passes the same day. Its scholar fights once and loses it.
**Seed 1078 is the double-mantle village:** Hattie dies day 8 to a
Highbeam Deer in the wild, Patrick takes the mantle, then dies day 23 to
betrayal and Rocco takes it the next day — two mantles in one month, both
passing within a day. **Seed 1080 is the fed village:** 12 pop, 0 deaths,
43 kills, FED at 6,499 a person — healthy, and the richest on the panel.
**Seed 1075 is the hunting village:** 44 kills, the panel's most, FED at
3,749; Ruby and Rafael both join the party.

## People check (transcripts read in full — all 6 never-offered sittings)

- **1073 d8 Fatima (stated, 1 turn): Real — the favor was already handled.**
  Fatima opens wanting to talk; the driver takes [dlg:more] and she says
  "Never mind the food I needed — we got it handled. Thanks anyway." The
  want was already resolved before the sitting (stage 2, resolution=
  stated). The driver steers to dlg:subject, gets "Forget I said anything.
  What did you want?", and leaves. The commit option never surfaced
  because there was no open favor to commit to. Excluded from the ≥3-turn
  M-PR1 count (1 turn).
- **1075 d8 Ruby (unresolved, 11 turns): Real — the richest sitting on
  the panel, and the thread-gate shape again.** Ruby opens by withdrawing
  the want ("Never mind the creek water run — we got it handled.") — stage
  1, thread='want', and the want stays there through a party invite
  (accepted: "Someone should watch your back. Might as well be me."), the
  Lucas murder case, and a personal beat ("Someone has to stay hopeful,
  right?"). The [alive:want:ask_favor] option is offered at turn 3 and
  never picked — the driver pages past it for asks, the party invite, and
  case presses. The engagement was offered once; the driver kept paging
  past it. Counts toward M-PR1 (11 turns); the game hid nothing.
- **1076 d6 Paisley (unresolved, 6 turns): Real — thread-gate, and the Q2
  fix's live demonstration.** Paisley opens withdrawing the want; the
  [alive:want:ask_favor] option is offered at turns 2 and 5 and never
  picked, and the [alive:thread:want] "We never finished — that water
  haul." option appears at turn 5 and is paged past too. Between the pages
  the sitting is genuinely good: the sickness going around, honest talk
  about the food ("there's tension about who's in charge"). It closes
  **"Good talk. Onward, then."** — the reworded line, landing on an
  unresolved want without claiming anything is settled. Counts toward
  M-PR1 (6 turns); the game hid nothing.
- **1076 d10 Zoe (unestablished, 5 turns): Real — the sitting had another
  purpose.** Zoe opens on a getting-to-know-you beat ("Have you noticed?
  It never does the same thing twice — except when it does."), the driver
  listens twice ("Anyway." once — the doubled listen beats of r112/r113 do
  NOT recur here), and the party invite gets an honest refusal on trust
  ("I don't know you well enough for that. Ask me again when we've
  survived something together."). Zoe never asked for a favor (stage 0
  throughout). Counts toward M-PR1 (5 turns); the game hid nothing.
- **1077 d11 David (unresolved, 1 turn): Real, probe-left-immediately.**
  David opens withdrawing the want; the driver takes [goon] once (David
  "has an edge today — something curdled") and leaves after 1 turn. The
  want never got established. Excluded from the ≥3-turn count.
- **1082 d13 Leo (unresolved, 7 turns): Real — the gossip thread at its
  best.** Leo opens withdrawing the want; the [alive:want:ask_favor]
  option is offered at turn 2 and never picked — the driver takes the
  gossip thread instead, and it pays off across six deepening beats
  (something's off with Mia; people saying things about you; Elijah's
  story not surviving scrutiny; Lena eating grey meat raw and walking away
  whistling; Zeynep talk). The want stayed stage 1 throughout. Counts
  toward M-PR1 (7 turns); the game hid nothing — the driver chose gossip
  over the favor ask, and the gossip was worth it.

## Blank filled / documented

- **Q1 ZERO-DMG INSTRUMENT BUGS FIXED + MECHANISM ESTABLISHED (driver +
  analyzer, proof: invariant 0 violations on 16 panel fights + back-compat
  8/8 on the r113 corpus + shapes B:2/2).** The r113 watch re-bases from
  8/20 to 2/16: four of r113's eight were the scholar's own killing blows
  dropped by the R82 wrapper, one was Paul's struck-but-0-dmg loss, and
  the remaining shape is a thief encounter that routes, not a kill. The
  ally-accompanied count re-bases from 0/20 to 15/16 (the old 0 was the
  kind-'villager' undercount, retired as a measurement artifact).
- **Q2 MIRIAM LINE FIXED (data, proof before-FAIL/after-PASS + live panel
  0 "That's settled" in 106 transcripts + new line 4×).** The oldest open
  polish item from this line is closed.
- **Q2 PRACTICE STANDS (third panel).** 94 attributed cells, 10/10 seeds;
  the outside-chores crack holds (fish 4, garden 1); specialist gate still
  shut at 28d. The instrument is the standing line.
- **M7 GOAROUND-HOLDS (4/4)** — the r113 WEAK is repaired by a fuller
  sample, not by re-scoring.
- **M6 DOORSTEP UNTESTED (no trigger)** — 0/280 triggered; reported, not
  claimed. The sibling R88 eat-on-arrival rung fires 4/4.
- **PAUL SHAPE NOT REPEATED.** No struck-but-0-dmg fight on this panel;
  the one lost fight is Hattie's honest Highbeam Deer loss (5 strikes, 81
  damage, monster at 8 HP when she fell).
- **R69 ARMOR INSTRUMENT-DISAGREE — GONE.** teleLineDisagree=0 this panel.
- **EAMON FALLBACK — NO LIVE EXERCISE (third panel running).** 0
  starvation deaths, so 0 STARVATION lines and 0 pantryAtDeath lines. The
  fallback stands proven by the synthetic corpus + the exact r111 case; a
  future famine panel exercises it live.
- **No other blank filled this run.** Water still untested (26 runs); the
  R70 never-waited friction recurs on 7/10 seeds (driver-side, carried);
  M-PR1 passes 9/10 with 1076 the only two-count seed.

## Notable events

- 0 starvation deaths in a third panel running — but 6/10 villages end
  hungry and 1076 ends at 486 a person: thin, not famine.
- 3 scholar deaths in one panel (r113: 3) — a contest death (Chris, The
  Price), a wild death (Hattie, Highbeam Deer, 8 HP short), a betrayal
  (Patrick).
- Party invitations accepted 5/7 (r113: 3/8) — Ruby, Rafael, Nino, Tashi,
  Kunio say yes; Zoe's and Carlos's invites are refused honestly on trust.
- Flesh channel: 10/10 seeds get monster meat out of the pantry (r113:
  7/10), 10/10 test it — the channel fully opens this panel. Two poison
  verdicts (Ananya d10, Lena d17), both testers live.
- Practice moves competence on 10/10 seeds a third panel running — the
  pooled count is exactly 94 again, the same as r113.
- 1078 passes the mantle twice in one month (Hattie → Patrick → Rocco),
  both within a day.
- 1080 loses nobody, kills 43, ends FED at 6,499 — the panel's healthy
  village.
- The EPERM flap refused one heartbeat write mid-run; the retry landed a
  minute later. No data from any killed attempt was used (nothing was
  killed this run).

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 19 fired, flesh
  channel opens 10/10 (tests 10/10), outings complete and keep (2 kept),
  win-plans seed 6/10 by d14 and 9/10 by d28.
- **Fun: yes.** Transcripts read like people; Leo's 7-turn gossip sitting
  is the panel's best — six deepening beats from one withdrawn favor, and
  the party invite that lands (Ruby) against the one that doesn't (Zoe,
  on trust). Lena proves a toad is poison and lives. Hattie's last fight
  — five strikes, 81 damage, the deer at 8 HP when she falls — is the
  month's story. The villages are mostly thin this panel, which reads as
  pressure after r113's breather.
- **Winnable: not yet — unchanged at this leg.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone (planSeeds 6/10 d14, 9/10 d28 —
  the best landing panel yet on that line, but no wave-4 kills, no muster,
  no table plans on any d28 census). (Context from outside this run: the
  practice build is the third landed lever to move a landing-leg number —
  competence moves in the first month, now with a crack outside the
  chores — but the funnel has not moved with it. The drive build, still
  unmerged, is the one aimed at the funnel.)

## Metric review

- **Q1 worked — and the back-compat run did the real work.** The analyzer
  run on the r113 corpus BEFORE the panel found both instrument bugs and
  fixed the question before a single new seed ran: 4 of r113's 8 "zero-DMG"
  fights were the scholar's own killing blows, and the allies count was
  blind to kind-'villager' fighters. The panel then proved the fix (0
  invariant violations on 16 fights) and established the mechanism on the
  re-based count (B: 2/2). Proposal: keep the r115 analyzer as the
  standing zero-DMG instrument (it subsumes the r89 classifier for this
  question); the r89 analyzer stays for the M3 fatal-fight checks. The
  "others-killed" label should be retired for routed fights — a future run
  that sees a won others-killed fight should say so explicitly, because
  this panel's two are both routed.
- **Q2 worked — the fix proves itself three ways.** The proof test
  (before-FAIL/after-PASS on live data) plus the panel grep (0 "That's
  settled" in 106 transcripts) plus the new line appearing 4×, once on an
  unresolved want, is the proof the data change is safe and the game
  needed no code change. The test stays as the standing line: any future
  "settled" in the exit pools fails it.
- **M-PR1 passed 9/10 with the only miss concentrated on one seed.**
  1076 carries both counted never-offered sittings (Paisley d6, Zoe d10);
  every other seed has ≤1. The rule binds without re-scoring the past, and
  the unfiltered count agrees (9/10). The rule stays.
- **M-PR2 revised holds a fifth panel running (100%).** The away-guard
  share is 30% (r113: 26%, r112: 29%, r111: 29%, r110: 36%). Both stand as
  the lines for the next run.
- **M7 holds on a fuller sample (4/4).** The r113 WEAK (2/3) needed no
  rule change — the snapshot arrival bar is the honest measure and the
  sample supplied the cases. The bar stays as written with R85 as its
  companion.
- **M6 UNTESTED is the honest verdict on an empty sample.** 0/280
  triggered is not a GO and not a miss — the step never arose. The
  doorstep question needs a panel that supplies hungry/thirsty Haven days;
  the R88 eat-on-arrival rung (4/4) is not a substitute. Proposal: keep
  M6 as written; a future panel with triggers judges it harder.
- **M-A2 retired, re-confirmed only.** The structural-unreachability
  finding stands; the metric stays retired.
- **Kill mean bounced again (26.2 → 30.2).** Seed mixture (r109 was 28.5,
  1075's 44 and 1080's 43 pull this panel up) — reported, not chased. The
  telemetry LOUD lines are the same aggregation artifacts as r94–r115
  (baseline NOT rolled).

## Regression + telemetry

- Proof tests (this run, on the branch tip before the panel): Miriam line
  before-FAIL (1 settled line) / after-PASS (0, steady pool intact at 8);
  zero-DMG invariant before-FAIL on the r113 corpus (4 violations) /
  after-PASS on the r115 panel corpus (16 fights, 0 violations).
- Back-compat run on the r113 corpus: 8/8 others-killed reproduced, shapes
  U:3 B:4 S:1 — exactly the pre-registered split.
- **check.js --quick: 284 passed, 6 failed in 689s — identical to r113.**
  The same six pre-existing failures, no new failure from this run:
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes. The
  phone-frame-proof failure touches characterGen.json but is wholesale
  pre-existing: its retained proof is stale against ALL SEVEN boot inputs
  (index.html, main.css, arrivalText.json, characterGen.json, items.json,
  monsters.json, region) — six of which this run never touched. My one-line
  data change is one stale input among seven, and the test failed on the
  same file in r113. The new proof tests are not in check.js's fixed list;
  they were run directly (see above) and pass.
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r115 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94–r113), baseline NOT rolled: (1) systemDay baseline 33 → current
  sum 81 over 10 files (per-seed 8–9, mean 8.1; baseline is a 4-seed-run
  sum); (2) monsterKills baseline pooled mean 24 → current sum 302 over
  10 files (per-seed mean 30.2, range 18–44; r113 was 26.2, r112 27.9).
  No behavior change is indicated.

## Next run (no r116 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are other
legs, so no landing r116 driver is prepared here. The next landing run
prepares its own driver from the r115 driver and re-verifies its seed band
fresh across all dated preregs (next fresh band after 1073–1082 starts at
1083; contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
1043–1052, 1053–1062, 1063–1072, 1073–1082).
Carried to the next landing run: the practice snapshot is a standing
instrument (report d1→d14 and d1→d28 side by side); the NAV-log classifier
is a standing instrument (any GENUINE "(no line)" is an investigation item);
the r115 zero-DMG analyzer is the standing instrument for the zero-DMG
question (retire the "others-killed" label for routed fights); the
invariant test is the standing after-proof (0 violations on every panel);
M-PR1 per-seed (≥3-turn rule) + adjudication and M-PR2 revised are the
standing lines; the Eamon fallback's live exercise, the R70 never-waited
friction, and the mantle 2-day latency stay carried; report starvation
deaths per seed alongside the R66 gate; M7 stays as written with R85 as its
companion; M6 stays as written — a future panel with doorstep triggers
judges it harder; the Miriam line test is the standing line for exit-pool
wording (any "settled" fails it).

## Closeout note

- **EPERM flap:** one heartbeat write refused ~16:00Z; retried, landed
  16:01:10Z. No run data affected.
- **Rebase:** master moved during the run (b667f5a4f → 4ce3c0c1f, the
  finishing-instrument landing). `git fetch origin master` first: origin
  sits at 2016a7ed (the r113 batch ship) — local master is AHEAD of origin,
  no divergence. Rebased the branch onto the explicit SHA 4ce3c0c1f. The
  known stop-at-pick quirk fired (pick 80bf4ce01 listed in both done and
  todo, tree clean, pick unapplied); recovered per the recorded recipe —
  verified clean + unapplied, `git rebase --continue` — and it sailed
  through: branch tip is now 5b2dd06ed on 4ce3c0c1f. Both proof tests
  re-run on the rebased tip and PASS (Miriam line, zero-DMG invariant).
  `git log master..HEAD` shows exactly one commit. No conflicts, no
  force, nothing dropped.
- **Proof re-run on the branch (all PASS):** Miriam line test PASS;
  zero-DMG invariant PASS on the panel corpus (16 fights, 0 violations).
  check.js --quick on the branch tip: 284 passed, 6 failed in 689s — the
  same six pre-existing failures as r113 (see Regression + telemetry).
- **Telemetry:** 2 LOUD lines, both explained as aggregation artifacts,
  baseline NOT rolled.
- **Index clobber struck on the prereg commit** (known class): committed
  files showed staged-as-deleted + untracked after commit. Repaired via
  HEAD-blob `update-index --add --cacheinfo`; verified status clean +
  diff HEAD empty + blobs match.
- **Registration completed exit 0.** No silent death this run.
- **Rotation re-verified at closeout: reads `1`.** No discrepancy this run.
- Lock (`2026-11-07T15:43:41Z`, created 15:43Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-07.md` for the closeout record.
