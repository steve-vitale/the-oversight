# Journey — Landing r111 (2026-11-06, Lane A leg 0)

Run id `laneA-20261106T1945Z`, scheduled Fri 2026-11-06 13:45 CST, started ~20:41Z.
Leg 0 LANDING. Branch `journey-landing`, base `408ba9648` (master at run start).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 947a28d2, before any seed ran)

Question: the two r110-named analyzer fixes (Q1 — NO-ARRIVAL split, scholarDeaths
counts ALL scholar deaths) plus the scholar-solo fatality watch (Q2 — is solo
hunting the risk factor behind r110's 3/10 scholar deaths?). Seeds 1043–1052
(fresh band — full-scope grep over ALL dated preregs plus the forbidden-band
files; only incidental numbers hit). DAYS=28. Policies: competent-player driver,
r110-verbatim except seeds/OUTDIR. Carried bindings: M1 ALIVE-D14, M2 SYSTEM
CONTACT, M3 FIGHT-LOG, M5 PEOPLE, M-PR1 per-seed + adjudication, M-PR2 revised,
M7 goaround, M6 doorstep, Q6 water. Bars: Q1 back-compat numbers reproduce
exactly except the two new counts (r110 corpus: scholarDeaths=3/unresolved=1,
noArrivalTested=4/noArrivalUntested=0) and zero bare NO-ARRIVAL on the panel;
Q2 solo-share of fatals vs base solo rate; M-PR1 ≤1 on ≥8/10; M-PR2 ≥80%;
M7 ≥80%; M6 clauses hold. Metric binding applies: a miss is NO-GO, never
re-scored mid-run.

## Infrastructure notes (loud first)

- **Registration hit the EPERM flap.** First attempt failed on checkout writes
  (`error: unable to write file ...`, `fatal: Could not reset index file to
  revision 'HEAD'`); second attempt hit branch-exists (the failed attempt had
  created branch `journey-landing` at master, verified no unique work); branch
  delete refused on `.git/packed-refs.new` (flap still active). Probe-gated
  retry loop (`git update-ref refs/heads/probe-r111 HEAD` every 30s) got its
  first window at 20:48:41Z, deleted the stale branch, and re-ran registration;
  the checkout/reset then ground slowly (~9 min, tree 5.5G → 8.2G) and completed
  ~20:57Z. Heartbeat at registration + 10-min loop (PID 29317 outer).
- **Registry lock jam (7 hours, another loop's).** Lane B's `journey2-social`
  registration held the exclusive registry lock from ~14:00Z while its `git
  worktree add` ground (tree 8.6G, `git reset --hard` child sleeping) — every
  other registry writer queued behind it: my 21:07 heartbeat, my manual
  heartbeat, sim-wanderspawn-a's heartbeat, two reaps. My heartbeat went stale
  20:57:34Z → 21:11:28Z (~14 min, under the 4h reaper threshold and under any
  danger, but over the 15-min liveness threshold — this run LOOKED dead to the
  overlap guard for ~14 min). The jam cleared on its own ~21:10Z when the
  register finished (journey2-social registered 21:02:52Z); my queued heartbeat
  landed 21:11:28Z. NOTHING was killed or touched: killing another loop's live
  register mid-checkout would have been worse than the stale heartbeat. The
  reaper never removes trees under 4h stale, so the exposure was the look of
  it, not the tree. Noted for the record — a 7-hour registry-lock hold is the
  longest seen, and it was a grinding checkout, not a deadlock.
- **Pre-flight clean.** Main tree clean, disk 30%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 9/16 at pre-flight (plus this run's).
- **Safe-commit index clobber struck on all 3 commits** (prereg 947a28d2,
  analyzer fix 97590ffc, driver eb20cebff — known class). Repaired each time
  per the recorded recipe (`git update-index --add --cacheinfo` with HEAD
  blob); verified `git status` clean (0 lines), `git diff HEAD` empty after
  each repair.
- **No lock existed at start.** Lock created 20:41Z, run_id
  `2026-11-06T20:41:43+00:00`. Delete at closeout after read-back of run_id.
- **Context (not this run's work):** the alignment synthesis updated twice
  during the run — Steve ordered one-villager-brain coherence this evening, and
  the self-improvement-drive build is now built and tested (not yet merged):
  on 16 matched villages, pairs of living wave-4 killers formed on 2 seeds
  where the old code formed none, total wave-4 kills rose 5 → 9, but villages
  ran shorter with fewer alive (107 → 92 days, 46 → 32 alive) — a 64-seed run
  is owed before anyone leans on it either way. That is build-coordinator
  territory; this leg's funnel (below) is flat, and the drive may move it when
  it lands.

## Panel

Pilot: 3 seeds (1043–1045), DAYS=28, exit 0 in ~95s (slow box — sibling
check.js runs). All 3 alive, systemDay 8–9, ask_favor sittings present, flesh
arrivals populate, analyzer fixes report on pilot output (first live
NO-ARRIVAL-UNTESTED). Pilot gates passed → expanded to full panel. Full panel:
10 seeds 1043–1052, DAYS=28, exit 0 in ~200s. 10 census files in goal
hidden_files `evidence/2026-11-06/landing-r111/`. Logs:
`landing-r111-pilot.log`, `landing-r111-panel.log` (same dir). Analysis:
`landing-r111-panel-analysis.txt`, `landing-r111-commit-offer.txt`,
`landing-r111-fights.txt` (same dir).

## Panel verdicts

- **Q1 Fix A (NO-ARRIVAL split): VERIFIED ON LIVE PANEL.** R62:
  arrivalSeeds=3/10, testSeeds=9, exitSeeds=3, stuckSeeds=0, openSeeds=3,
  **noArrivalTested=6, noArrivalUntested=1**, CHANNEL OPENS. Zero bare
  NO-ARRIVAL lines anywhere in the analysis (grep: 6 TESTED + 1 UNTESTED,
  0 bare). The split earns its keep: the 6 TESTED seeds tested 1–4 mids each
  and revealed them safe (the channel's test stage works on 9/10 seeds); the
  1 UNTESTED seed is 1043 — 22 monster kills, 0 hauls, 0 deposits, 0
  experiments, 0 tests (see Blank filled). The arrival rate fell (3/10 vs
  r110's 6/10) because flesh rarely sits unknown in the pantry anymore — the
  test stage, not the pantry stage, is where the channel lives now.
- **Q1 Fix B (scholarDeaths counts ALL deaths): VERIFIED.** SUMMARY:
  scholarDeaths=3 (unresolved=0) on 3/10 seeds — and the per-seed lines agree
  exactly (1045 Jessica d13, 1046 Devon d9, 1052 Wolfgang d19; each
  scholarDeaths(seed)=1, each latency 0). No undercount on this panel. The
  back-compat run on the r110 corpus (before the panel) reproduced r110's
  numbers exactly except the two fixed fields: scholarDeaths=3 (was 2) with
  unresolved=1, scholarDeathSeeds=3/10 (was 2/10); R62 identical plus
  noArrivalTested=4/noArrivalUntested=0. The diff between old and new analyzer
  output on the r110 corpus is exactly 8 lines (4 label changes, 1 per-seed
  count, 1 annotation, 2 summary lines) — nothing else moved. Proof test
  scripts/test-landing-r111-analyzer-fixes.js: 16/16 PASS (synthetic corpora:
  TESTED, UNTESTED, experiments-only, TAIL-MOVES, STUCK, mantle death,
  final-holder unresolved, final-holder NO-GO, no-double-count chain,
  aggregate counts).
- **Q1 poison re-test (r109 fix, ongoing proof): 0 re-tests.** One poison
  verdict on the panel (1045, 5 experiments / 5 transitions, the poison mid
  tested exactly once). The fix holds a second panel running.
- **Q2 (scholar-solo fatality): ANSWERED — solo is not the risk factor, it
  is the only mode.** Panel fights: 18 complete, 3 fatal, 0 unknown/mixed
  trigger. Solo share of ALL hunt fights: 18/18 = 100% (allies==0 on every
  fight in `fights81`); solo share of fatal fights: 3/3 = 100%. The base rate
  IS the fatal rate — there is no solo effect to find, because the scholar
  NEVER hunts with allies in the first month, even though parties form
  (partyWaits 31 by d28, invites offered 3, spoken 3) and villagers kill
  monsters in the wild (188 monster kills panel-wide vs 18 scholar fights).
  The real finding is the absence: no ally ever stands beside the scholar in
  a hunt fight. The fatals' shape also changed from r110: r110's scholars died
  with the beast at 1–27 HP (near-kills); r111's died with the beast barely
  hurt — Jessica landed ONE kitchen-knife strike (18 dmg) on the Glow Stag
  (132/150 HP left) and died; Devon landed ONE strike (12 dmg) on the
  Highbeam Deer (152/164 left) and died; Wolfgang killed 2 of 4 Ugly-Eyes and
  died to the other two. Early scholars fight alone, with terrible weapons,
  against eye-beams. No game change this run — adjudication only, as
  pre-registered.
- **Q3 engagement lines (standing bars):**
  sittings=32, offered(commit)=21, picked=21, promised=15, statedAfterPick=6,
  neverOffered(commit)=11.
  - **M-PR2 revised: 15/(21−6) = 100% ≥ 80% — LINE HOLDS.** All 6 stated
    refusals are the R72 away-guard line ("Wait — I'm out on the road…").
    Away-guard share: 6/21 = 29% (r110: 36%).
  - **M-PR1 per-seed: ≤1 on 8/10 seeds — PASS exactly at bar** (1044:3,
    1047:2). Pooled never-offered rate 11/32 = 34% (reported for the record;
    per-panel bar retired per r109's review).
  - Transcript adjudication of all 11 never-offered-commit sittings (read in
    full, below): 5 withdrawn wants, 3 probe-leaves-early, 2 paged-past /
    driver-preferred-other-threads, 1 stated favor with the driver leaving
    immediately — zero live cases of the game hiding engagement or commit.
  - The pooled thread-gate count grows to 6 (r107 Nino, r110 Leo + Stephen,
    r111 Carlos + Chloe + Miriam): engagement picked, want stayed stage 1,
    thread='want' in every case, every want withdrawn in the opener. The
    retired question stays retired.
- **Q4 M7 goaround: UNTESTED (0 cases).** R85 kcal skips=0, water skips=0.
  No ladder to judge this panel.
- **Q5 M6 doorstep: UNTESTED (0 triggered).** R88 DOORSTEP: checks=278,
  triggered=0, ate=0, drank=0 (r110: 280/3/3). No hungry/thirsty Haven day
  triggered the step — the clauses hold vacuously (0 class-E scholar
  starvation deaths; 0 triggered steps ending enterResult===false). The
  step's denominator is the story: 207 of 278 checks skipped as
  fed-and-watered, 62 already-inside, 3 outing-live.
- **Q6 water: UNTESTED (23rd run).** Wild outing iterations=5, hydUnder25=0,
  minHyd=72, waterSkips=0. R84/R85 water both UNTESTED, 0 skips.
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (lowest d14 pop 9).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on five seeds, 9 on five.
- **M3 FIGHT-LOG: PASS.** 18 hunt fights, 18 complete, 3 fatal, 0 with
  unknown/mixed trigger.
- **M5 PEOPLE: PASS.** Wind-down more picks 9, empty 0; WD probe sittings 10,
  surfaced 10, menuMore 9, pageTurns 68, phase2Opened 8, phase2Yielded 5,
  GATE-A GO, GATE-B GO; betrayal 0 held; party invites offered 3, picks 3,
  spoken 3, dry 0, accepted 0 (PARTY-GO — every taken invite outcome spoke;
  0 accepted this panel vs r110's 6/10: the accept rate swings by seed, the
  mechanism works); R67 case labeling 11/11 MATCH (LABELING-GO). Eleven full
  transcripts read for sense (below).
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitDiag
  live={waiting:8, has-run:90, away:1, kept:48, node-not-home:4}; ledger
  promise-favorId=253; sidestepAttempts=18, sidestepOk=14. R70 OUTING:
  waitSeeds 3/10, departSeeds 3/10, keptSeeds 3/10, keptTotal 4, OUTING-GO.
  The 7 never-waited seeds are explained by their action reasons (the
  carried driver-side friction, r106) — the driver never gets adjacent.
- **R73 WINDOW:** promised=10, askedOnly=21, outOfWindow=0, all 10 NARROW,
  keptInsideNarrow=4. NARROW-PATTERN continues (design input).
- **R66 horizon pantry: 9/10 HUNGRY and HUNGRY by the revised gate** —
  starvationDeaths=6, slideSeeds=1 (1048, last3mean 728, min 0), bandSeeds=2,
  noSlideSeeds=7. FED seeds: 1050 only (2,014/person). Deepest hunger: 1043
  and 1049 both end at 0/person. This is the first panel in the r107–r111
  line with starvation deaths (r110: 0, r109: 0) — see Notable events.
- **Mantle:** three passes, latencies [0, 0, 0]. The r107 2-day latency is
  NOT reproduced this run; the owed item stays open.
- **Win-plan (R104, carried):** planSeeds d14 on 1/10 seeds, d28 on 3/10;
  holders 4→9; partyWaits 17→31; partyFights 6→19; gearHolds=0, bondTends=0,
  all later arms 0. **M-A2 re-confirmed STRUCTURALLY-UNREACHABLE** (retired
  metric, consistency check only): prims=0, no muster, no wave-4 kills, no
  table plans on all d28 censuses.
- **Contests:** fired=21, ended=18, openAtHorizon=3, orphanEnds=0. LEDGER GO.
- **Starvation:** 6 deaths, all assigned a cause class (STARVATION GO).
  Grief: 0/31 miss, holds.
- **Kill-mean trend continues down:** per-seed monster-kill mean 18.8 (range
  13–24, total 188) after r107 20.5 → r108 24.4 → r109 28.5 → r110 20.6.
  Seed mixture, not a trend — reported, not chased.

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — but two of them
starve in it. Seed 1043's pantry hits zero and four people die of hunger in
two days (Hamad, Tom, and Rocco on day 27, Eamon on day 28); seed 1049 loses
two more (Naran day 20, Valentina day 21) while its pantry holds a few hundred
calories — not enough for nine people. Only one village in ten ends the month
fed (1050, just over the line at 2,014 calories per person). Everyone meets
the System by day 8 or 9. Three scholars die out in the wild, all alone, all
in their first fortnight of fighting — Jessica to a glowing stag, Devon to the
Highbeam Deer, Wolfgang to a pack of four wolves. The villages hunt hard (13
to 24 monster kills each, 188 in total) and test their meat: nine of ten
taste it, three get it out of the pantry, and nobody re-tastes a poison twice.
People ask each other for help and mostly get it: 21 of 32 sittings offered
the commit, 15 of 21 picks became real promises, and the six refusals were all
honest ("I'm out on the road — find me when I'm back"). Parties form but
nobody says yes this time: three invitations, all spoken, none accepted. Two
villages lose nobody at all (1047, 1050) — one of them never even meets a
monster worth naming. The villages are alive, social, and mostly hungry — and
this panel, hungry turned lethal on two seeds.

Pops end 8, 10, 9, 7, 12, 9, 8, 12, 10, 9 (seeds 1043–1052). Spawns:
Connor, Eric, Jessica, Devon, Ji, Sean, Zoey, Chen, Bessie, Wolfgang.
Monster kills per seed: 22, 24, 14, 13, 16, 19, 14, 18, 24, 24.
Self-sufficiency 0.685–0.934. Villager deaths 31 total: 3 scholars in the wild,
6 starvation, 4 sickness (1046's late-month sweep), 3 ambush, 2 wounds that
wouldn't close, the rest monsters.
**Seed 1043 loses four to hunger:** the pantry slides to zero and Hamad, Tom,
and Rocco starve on day 27, Eamon on day 28. The village stands at 8 — and the
scholar ends the month at 1,619 kcal while they starved (see Blank filled).
**Seed 1046 loses eight, its scholar included:** Devon dies day 9 to the
Highbeam Deer, then sickness sweeps four more (Makpal, Hilda, Leonardo, Aria,
Nadia across days 19–27 — five of the eight are sickness or wounds). The
village stands at 7, the month's worst.
**Seed 1047 loses nobody:** 12 pop all month, 16 kills, hungry at 452/person
— alive, intact, and thin.
**Seed 1050 is the quiet village:** 12 pop, 0 deaths, 18 kills, FED by the
only measure that matters (2,014/person) — healthy, and the only seed where
the flesh channel's haul line ever fired.

## People check (transcripts read in full — all 11 never-offered sittings)

- **1043 d10 Vasyl (unresolved): Real, crowded out by the case.** Vasyl opens
  by withdrawing the want himself ("Never mind the food I needed — we got it
  handled"). The driver takes [dlg:subject] once, gets the ambush-of-Elena
  case menu, and leaves after 1 turn. The want never got established because
  the driver left, not because the game hid the option. The beast-naming vote
  after reads like a real argument ("Ugly-Eyes" wins the village).
- **1044 d7 Miriam (unresolved): Real — the richest sitting on the panel,
  27 turns.** Miriam opens by withdrawing the want; the driver pages
  [menu:more] again and again (many "(no line)" returns), asks personal
  questions, and gets lines that land: "I've started noticing who eats first
  and who waits. Tells you everything about a person." The theorize beats are
  the game's thesis spoken aloud ("The variety is wrong. Too many apex
  designs, not enough prey species. This isn't an ecosystem — it's a bestiary.
  Curated." / "The villages that survive will be the ones that learn fastest,
  not the ones that fight hardest. Knowledge compounds. Start compounding.").
  The engagement option is offered at turns 2, 6, 17, 22, and 26; the driver
  finally picks it at turn 26 and Miriam deflects ("No, really — it's
  handled."). The want stays stage 1 — the sixth pooled thread-gate case, all
  thread='want'. One sense defect in the closing: the wind-down closer says
  "Good — that foraging help, settled. Feels better said out loud." while the
  game's own thread label at turns 17/22/26 says "We never finished — that
  foraging help." The closer asserts settlement of a want the game knows was
  never finished (see Blank filled).
- **1044 d11 Diana (unestablished): Real, case-crowded.** Diana opens on the
  murder of Cheryl ("There's still the matter of the murder of Cheryl.
  Nobody's settled it.") with an edge ("something curdled"); the driver leaves
  after 0 turns. The want never got established — a probe that leaves
  immediately.
- **1044 d12 Stan (unestablished): Real — the invite came first.** Stan opens
  with a betrayal invitation ("Help me haul something back? Too much for
  one."), the driver declines honestly ("Right — another time."), then the
  murder-of-Cheryl case menu crowds the talk and the driver leaves after 2
  turns. Stan never asked for anything (stage 0) — the want stayed
  unestablished because there was no want to establish.
- **1045 d11 Carlos (unresolved): Real — the thread-gate shape, fifth case.**
  Carlos opens by withdrawing the want; the driver takes [goon], then
  [dlg:subject], then picks the engagement at turn 3 — Carlos deflects ("No,
  really — it's handled. Thanks for asking, though."). The [dlg:subject]
  handler cycles the same two lines again ("Forget I said anything. What did
  you want?" / "Sorry — I shouldn't load that on you. What's up?") — the
  polish note from r110 recurs.
- **1046 d6 Rosa (unestablished): Real — a 16-turn wind-down probe.** Rosa
  opens "Can we talk? Just... talk. Like people used to." The driver pages
  [menu:more] repeatedly (three "(no line)" returns), asks who she is, and
  gets real lines ("We should name this place. 'Camp' is what you call
  somewhere you're leaving." / "Belonging means they notice when you're gone.
  I'm working on being noticeable."). The engagement option is offered at
  turns 2, 6, 10, and 14; the driver keeps paging past it. Rosa never asked
  for anything (stage 0) — the want stayed unestablished because she wanted
  company, not a favor. Polish notes: "(no line)" repeats on [menu:more], and
  the transcript flags a verbatim repeat ("Anyway. What did you want?").
- **1047 d10 Catalina (stated): Real — the favor was already voiced.** Catalina
  opens on the ambush of Nikolai ("I trade in what I know. My knowledge for
  yours. Or food, if you're short on secrets.") — the want is stage 2, already
  stated. The driver leaves after 0 turns; the commit option never surfaced
  because the driver didn't stay.
- **1047 d11 Henry (unresolved): Real, same shape as Vasyl.** Henry opens by
  withdrawing the want; the driver takes [dlg:subject] once, gets the
  ambush-of-Nikolai case menu, leaves after 1 turn.
- **1048 d7 Julia (unresolved): Real, probe-left-immediately.** Julia opens by
  withdrawing the want; the driver leaves after 0 turns.
- **1049 d11 Lucas (unresolved): Real — the "against me" framing, and it
  matches.** Lucas opens by withdrawing the want; the driver takes
  [dlg:subject] once and gets the case menu ("Nobody's settled the ambush
  against me yet." — R67 MATCH, the framing line names the target correctly),
  then leaves after 1 turn.
- **1051 d12 Chloe (unresolved): Real — the thread-gate shape, sixth case,
  and the warmest deflection.** Chloe opens by withdrawing the want; the
  engagement is offered at turn 2 and picked — Chloe deflects ("No, really —
  it's handled."), and then a [goon] loosens her ("Their voice loosens. The
  guardedness thins."). A villager can refuse the favor and still warm to the
  player in the same sitting.

## Blank filled / documented

- **Q1 FIXES LANDED (analyzer-only, proof 16/16, back-compat verified).** The
  NO-ARRIVAL split and the scholarDeaths count are in, and both report
  correctly on live panel data. No bare NO-ARRIVAL remains; the headline can
  never again undercount a horizon-day scholar death.
- **1043 NEVER-TESTED FLESH + FAMINE — DOCUMENTED (adjudication, no code
  change).** Seed 1043 killed 22 monsters and tested none of the meat (0
  hauls, 0 deposits, 0 experiments) while four villagers starved with the
  pantry at zero. The channel was never reached on this seed — not stuck, not
  poisoned, never started. Whether villagers haul monster meat when the pantry
  is empty is a lever question for a future run, not a defect claim here: the
  meat was never in the village to test. Note the contrast with 1050, the only
  seed where the haul line fired — and the only FED seed.
- **1043 SCHOLAR FED WHILE VILLAGERS STARVED — SHARPEST INSTANCE OF THE HELD
  QUESTION (documented, not changed).** The scholar ends the month at 1,619
  kcal while Hamad, Tom, Rocco, and Eamon starve with the pantry at zero. This
  is the scholar-eats-first shape (the scholar's villageMeal is drawn BEFORE
  villagers eat in endDay) at its starkest — the same shape as r106 seed 891
  (Chloe/Xiaoli starved with 1,000–1,800 kcal in the pantry while the
  scholar's separate meal kept her fed). It stays Steve's call, documented
  only.
- **VALENTINA (1049) — EXPLAINED (adjudication, no code change).** Valentina
  starved day 21 with pantryAtDeath=600. That is not a doorstep failure: 600
  kcal for nine people is 67 each — the pantry was nearly empty for days
  (d25:200, d26:900, d27:2,100, d28:0) and the village was in famine. A
  nonzero pantry is famine, not a distribution failure, when it cannot feed
  the village (the r106 rule). Class F is honest here.
- **EAMON MISSING AUTOPSY (instrument gap, documented).** Eamon starved day
  28 — the horizon day — and his STARVATION line reads pantryAtDeath='?': no
  autopsy record was found for him. The driver records one autopsy per
  starvation death, but the horizon-day death falls outside the write. A
  future analyzer could read the horizon-day pantry directly instead of
  requiring the autopsy join. Not a game defect, no fix this run.
- **MIRIAM CLOSING LINE — SMALL SENSE DEFECT (flagged, no fix this run).**
  Seed 1044 day 7: the wind-down closer says "Good — that foraging help,
  settled. Feels better said out loud." while the game's own thread label
  (offered at turns 17/22/26) says "We never finished — that foraging help."
  The closer asserts settlement of a want the game knows was never finished.
  Polish-grade: the closer should not claim a want settled when its thread is
  still open. Flagged for a future run; the sitting is otherwise the panel's
  best.
- **Mantle 2-day latency (r107 owed item) NOT reproduced.** Latencies this
  panel are [0, 0, 0]. The owed item stays open.
- **No other blank filled this run.** Water still untested (23 runs); the R70
  never-waited friction recurs on 7/10 seeds (driver-side, carried); M7/M6
  both untested for want of cases.

## Notable events

- 6 starvation deaths in one panel (r110: 0) — the first famine panel in the
  r107–r111 line. Two villages starve; one of them (1043) loses four in two
  days.
- 3 scholar deaths in one panel (r110: 3) — all solo in the wild, all with
  the beast barely hurt (132/150, 152/164, a 4-wolf pack with 2 killed). The
  shape changed from near-kills to walk-ins: two scholars landed a single
  strike each and died.
- 1046's sickness sweep: 5 of its 8 deaths are sickness or wounds (Makpal,
  Hilda, Leonardo, Aria, Nadia, days 19–27) — the village bent under disease
  while its scholar was already dead.
- Party invitations accepted 0/3 (r110: 6/10) — the rate swings by seed; the
  mechanism (offered→spoken→accepted) works, nobody said yes this time.
- Flesh channel: 3/10 seeds get monster meat out of the pantry as unknown
  (r110: 6/10), but 9/10 test it — the channel's test stage is the live one
  now, not the pantry stage.
- 1043 and 1049 share the famine shape (pantry 0 at horizon) but different
  flesh shapes: 1043 never tested a single piece; 1049 tested 2 mids.
- The registry lock jam (7 hours, Lane B's grinding checkout) blocked every
  heartbeat in the window — see Infrastructure notes. No data lost.

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 21 fired, flesh channel
  opens 3/10 (tests 9/10), outings complete and keep (4 kept), win-plans seed
  1/10 by d14.
- **Fun: yes.** Transcripts read like people; Miriam's 27-turn sitting is the
  panel's best — a villager theorizing about the world, teaching, refusing a
  favor warmly. Rosa's "Belonging means they notice when you're gone" and
  Lucas's "ambush against me" land. The villages are mostly hungry this panel,
  which reads as pressure, not ease — 1043's four hunger deaths in two days is
  the month's story.
- **Winnable: not yet — unchanged at this leg.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone. No wave-4 kills, no muster, no table
  plans on any d28 census. (Context from outside this run: the
  self-improvement-drive build is built and tested but not yet merged — on 16
  matched villages it formed pairs of living wave-4 killers on 2 seeds where
  the old code formed none (kills 5 → 9), with villages running shorter and
  fewer alive; a 64-seed run is owed. If it lands, this leg's funnel may move
  for the first time in the r107–r111 line.)

## Metric review

- **Q1 Fix A worked — and the split earns its keep on live data.** The metric
  caught the first true UNTESTED case (1043: 22 kills, 0 tests of any kind)
  and separated it cleanly from the 6 TESTED seeds. The back-compat diff (8
  lines, nothing else moved) is the proof the instrument change is safe.
  Proposal: keep the split as the standing R62 label; the next run need not
  re-prove it.
- **Q1 Fix B worked — the headline now counts what the per-seed lines count.**
  scholarDeaths=3 on this panel with zero unresolved and zero NO-GO; the
  summary and the per-seed lines agree exactly. Proposal: keep the breakout as
  the standing SUMMARY line; a future panel with an unresolved death will
  exercise the breakout the way r110's corpus did.
- **Q2 worked — by killing its own hypothesis cleanly.** The solo-share
  comparison (18/18 base vs 3/3 fatal) shows there is no solo effect to find:
  the scholar never hunts with allies at all. The metric's value was the
  absence it surfaced (0 ally-accompanied hunts in 18 fights), which is now a
  named watch: does the scholar ever hunt with allies in a later leg, and
  does it matter? Proposal: retire Q2 as a question; carry "ally-accompanied
  hunt fights" as a watch number on future panels.
- **M-PR1 per-seed + M-PR2 revised BOTH HOLD for the second panel running.**
  The per-seed bar passed exactly at bar again (8/10) and the adjudication
  found zero hidden cases; the revised M-PR2 is 100% again where the old bar
  (15/21 = 71%) would have under-read the away-guard. Both stand as the lines
  for the next run. The away-guard share (29%, r110: 36%) is the number to
  watch: if it climbs, the commit path's denominator shrinks even as the path
  itself works.
- **M7/M6 untested is a denominator problem, not a metric problem.** Both
  ladders need cases to judge and this panel supplied none (0 kcal skips, 0
  doorstep triggers). The metrics stay as watches; a panel that supplies cases
  will judge them.
- **M-A2 retired, re-confirmed only.** The structural-unreachability finding
  stands; the metric stays retired.
- **Starvation deaths are the panel's new signal, and no metric was
  pre-registered for them.** The R66 revised gate already calls the panel
  HUNGRY (6 deaths), so the signal is captured — but the gate does not
  distinguish a famine panel (1043/1049) from a slide panel (1048). Proposal
  for the next run: report starvation deaths per seed alongside the gate, so a
  famine panel reads as famine, not just HUNGRY.

## Regression + telemetry

- Analyzer-fix proof test: 16/16 PASS (this run, on master and on the
  rebased branch — see closeout). Back-compat run on the r110 corpus: exact
  except the 8 intended lines.
- No src/js change in this run, so no check.js --quick: the relevant suites
  are the analyzer proof (green, above) and the landing panel + analyzers
  (all exit 0). The ship loop runs the full check before pushing.
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r111 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94/r95/r96/r97/r98/r99/r104/r105/r106/r107/r108/r109/r110), baseline NOT
  rolled: (1) systemDay baseline 33 → current sum 86 over 10 files (per-seed
  8–9, mean 8.6; baseline is a 4-seed-run sum); (2) monsterKills baseline
  pooled mean 24 → current sum 188 over 10 files (per-seed mean 18.8, range
  13–24; r110 was 20.6, r109 28.5). Watch, not a verdict: the per-seed kill
  mean fell again (20.6 → 18.8), continuing the post-r109 decline as seed
  mixture, not a trend. No behavior change is indicated.

## Next run (no r112 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are other
legs, so no landing r112 driver is prepared here. The next landing run
prepares its own driver from the r111 driver and re-verifies its seed band
fresh across all dated preregs (next fresh band after 1043–1052 starts at
1053; contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042).
Carried to the next landing run: the NO-ARRIVAL split + scholarDeaths breakout
are the standing lines; Q2 retires as a question (carry ally-accompanied hunt
fights as a watch); M-PR1 per-seed + adjudication and M-PR2 revised are the
standing lines; the Miriam closing-line defect and the Eamon missing autopsy
are instrument/polish items to fix; the mantle 2-day latency stays an owed
item; the R70 never-waited friction stays carried; report starvation deaths
per seed alongside the R66 gate.

## Closeout note

- (to be filled)
