# journey-landing r155 — Lane A leg 0 LANDING (days 1–14 judged, horizon d28)

Run: `playtest-20261122T2045Z` (Sun 2026-11-22 20:45 CST). Lock
`playtest-loop.lock`, run_id `playtest-20261122T2045Z`. Base master
`895f7a6ee` at registration. Rotation `journey-rotation-a.txt` read `0`
→ write `0→1` at closeout. Hard stop ~05:45Z.

## METHODOLOGY ERRORS — read first, they shape the verdict

**1. The first pilot + full panel ran with the driver's default
DAYS=14 (no env var set). That 14-day corpus is VOID.** r154 ran
DAYS=28 (proven by its census series reaching day 28); this run's
first pass ran 14 by mistake. The void logs are kept, renamed, in
hidden_files (`journey-landing-r155-pilot-d14-misrun.log`,
`journey-landing-r155-panel-d14-misrun.log`); the void corpus dir was
deleted. Its apparent findings (winplan d14 1/10, contests 16→3,
practice 54) were horizon artifacts, not game changes. The corrected
run re-did pilot + panel with `DAYS=28`: pilot exit 0, panel exit 0
in ~265s. **Every number below is from the corrected 28-day panel
unless marked otherwise.**

**2. Instrument finding from the mis-run:** the d14 winplan snapshot
keys on `series.length === 14` (driver ~line 4407), not on game day.
On a 14-day run with any skipped day (a forage trip can roll a day
boundary mid-iteration, so `series` skips days), the snapshot never
fires — 9/10 seeds had null d14 in the mis-run. The d14 snapshot
should key on game day, not snapshot count. See Metric review.

**3. VM restart ~03:23Z killed the first registration mid-checkout**
(exec session SIGTERM'd after ~23 min; uptime showed 1 min at
03:24Z). It left a partial 14G dir (evidence only, no `.git` file, no
registry entry) and branch `journey-landing` at `895f7a6ee`. Recovered:
removed the partial dir, re-ran `scripts/worktree-register.sh
journey-landing` — succeeded on attempt 2 (~12-min checkout, attach
fallback used the existing branch), worktree at `895f7a6ee`, verified
with `pwd`. Heartbeat re-established at registration; hbloop running
detached via setsid nohup (10-min cadence). **Note for the record:**
the post-restart clock reads ~1h behind the pre-restart clock
(uptime 37 min at 04:00Z; the summary's 04:35Z/04:50Z timestamps were
pre-restart clock). All times in this note are the post-restart clock
unless marked.

**4. Master moved during the run.** Sibling `sim-homebody-rejudge-a`
landed `3fd09decc` (evidence + instrument; lever reverted) after this
run's registration. The worktree rebases onto it before merge; proofs
re-run on the rebased tip.

## Prereg (frozen)

Full text: `hidden_files/journey-landing-r155-prereg.md` (copy in this
evidence dir). Q1 is a regression watch carrying r154 bars verbatim.
Policy: r154 control verbatim, DAYCAP=28, seeds fresh 1362–1371
(freshness verified by grep — only incidental hits), pilot 1362–1365.
Fix scope: exactly one blank with a proof test, or document why none.
Gating freeze stands; combat-play gate stands (no toughness/gear/
ability tuning); TEST WITH ENCOUNTER GEAR.

Base delta vs r154 (`be0cfca40` → `895f7a6ee`, src/js 8 files
+254/−22): r154 grief-bridge 2→6; r268 establishment (PLANWAKE GO,
LAUNCHVOICE, day-desync, STRANDED-CLOSE menu fix); r267 succession
(fill-aware retry in topic2Ask); r269 deepening (DRY-COUNT WASHOUT,
MOOT-CLOSE); sim-needwave-a/b guarded needWave copy;
sim-leaderproj-b / sim-leaderhpgate-b NO-GO (watch only);
sim-wornstack-a mantleBecome worn-stack (no player-visible change).

Driver: `scripts/journey-landing-r155-20261122.js` (cloned from r154;
diff shows only header/seeds/OUTDIR; `node --check` clean).
Analyzers: `evidence/2026-11-22/journey-landing-r155-analyzers.sh`
(15 analyzers). Corpus:
`hidden_files/evidence/2026-11-22/landing-r155-after/` — 164 files,
0 zero-byte, 10 census. Panel log
`hidden_files/journey-landing-r155-panel.log`; analyzers log
`hidden_files/journey-landing-r155-analyzers.log` (1707 lines, 15/15
exit 0). **One stale line sits at the top of the analyzers log** —
the usage error from a mis-invocation of the analyzers script without
arguments, predating the real run; it is not an analyzer failure.

## Panel

10 seeds, 28 days, all 10 reached d28, over=no everywhere. System
contact by d9 on all 10 (8×d8, 2×d9: 1365, 1371). Spawns: Jordan,
Carlos, Tanya, Evelyn, Sanjay, Marisol, Bill, Cesar, Keisha, Piper.
Wants across 144 sittings: curious 84, none 26, ask_favor 23,
warn_you 5, seek_comfort 4, pocketed 1, repay 1.

## Q1 adjudication — NO-GO on M-PR1 (binding bar)

- **M1 ALIVE-D14: PASS** — 10/10 alive at d28.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9.
- **M3 FIGHT-LOG: PASS** — 0 unknown triggers (17 fights81 stacks,
  all known: feastFightRoad, driveContestsImpl, contestArena,
  monsterTurn).
- **Zero-DMG refused-turns: PASS (BINDS)** — 0. Raw zero-DMG 3/16
  fights (1 no-strikes, 1 S-struck-0-dmg, 1 B-scholar-stood-through);
  stoodThroughByChoice 1; refusedTurnsAllFights 0. Scholar-turn
  verbs: wait 0, move 9, barrier 0, ability 0; fightsWithVerbData 5.
  Move-refusals: 9 moves, 0 failed, 0 movedLie, stuckFights 0.
- **Practice: PASS** — movedCells d1→d28 = 91 (bar ≥50),
  seedsWithMove 10/10, skill0→pos 62, practiceReps 2876. By task:
  wood 27, stone 26, water 17, deadfall 10, cook 10, fish 1.
  Huntpractice H0-ESTABLISHED (huntReps 12, huntVillagers>0 8,
  huntMoves 0 — first rung out of reach in 28d).
- **Pocket: PASS (BINDS)** — 0 pocket fights, stuckTurns 0.
- **D1: PASS** — 0 garbled-label renders.
- **HEED: 2 (legacy count), HEED-V: PASS (BINDS)** — 0. WARNED-BUT-
  UNRESOLVED 0. The 2 HEED sittings (1364 d12 Vasyl, 1371 d9 Devon)
  are long wandering conversations, not filler loops — see People
  check. D2 verbatim warning repeats 0. D3 0.
- **M-PR1: MISS — 4/20 = 20% > 15% bar.** R107 commit-offer:
  sittings=23, offered=16, picked=16, promised=10,
  statedAfterPick=6, neverOffered=5, settled=2. Established = 23 − 3
  unestablished = 20. Never-offered among established = 4: 1370 d10
  (Lucas) and d11 (Lena) — favor asked plainly, commit menu never
  appeared, want ends 'stated'; 1369 d9 and 1371 d11 — settled favors
  (already handled, no offer). The settled two count per the r154
  precedent recorded in this run's prereg ("the only established
  never-offered sitting is a settled favor"). The analyzer-counter
  reading (neverOffered minus unestablished, settled excluded per
  R122) is 2/20 = 10% — reported here for transparency, NOT used:
  re-scoring to the friendlier reading mid-run would violate §14.
  Raw analyzer rate 5/23 = 21.7%; max per-seed never-offered 2
  (1369, 1370). **Q1 is NO-GO on M-PR1.**
- **Bridges: PASS** — 0 repeats in every pool. Personal 17
  servings, grief 2, goal 1, past 1, village 4, plans 4, gossip 2,
  secret 0, small 5; cheer 0 servings. No repeat instances anywhere,
  including grief.
- **R66 HUNGRY: NOT-HUNGRY** — starvationDeaths 0, slideSeeds 0,
  bandSeeds 4, noSlideSeeds 6. Hungry-at-horizon 1/10 (seed 1368,
  1223/person — the r58 one-seed outlier shape, watch continues).
  All other seeds FED (2144–8964/person).
- **Scholar deaths: PASS at the boundary (≤2)** — 2 on 2/10 seeds,
  both fair shapes with working succession (latencies [1,1]):
  Tanya d27, killed in the duel contest → mantle Marisol d28;
  Bill d23, died on an expedition → mantle Ella d24.
- **silentTurns / dry lines:** no instrument records them this run
  (absent from the analyzers log and from all 10 census JSONs).
  Measurable proxies are clean: 0 empty THEM lines in the corpus,
  nodloop LOOP=0, mimeShown=0. The bars are reported as
  UNMEASURED, not passed — see Metric review.
- **Other watches (corpus greps + transcript reads):** Miriam line
  0 "That's settled"; deflect-fallback 0 `fellBack`; confide 0 "This
  stays between us"; volley errors 0 ('v is not defined', volley
  error); COUNTER LEARNED lines: none fired on the panel, so the
  counter-label watch is UNTESTED. Warn-heed: both heeded sittings
  name the danger (1362 d15 "the treeline at dusk. Don't."; 1364 d12
  same line via the thread-return) — PASS. Namebeast told-watch:
  same-day tell→name pairs name the told beast (1364 d12, 1370
  d10/d11 debates) — PASS. Link-accept: 1363 d26 Andre, link
  accepted + voiced accept line, no verbatim choice label — PASS.
  Reseed-beat: none fired inside 28d. Downed-ally: none. Owed-walk
  veto: none. Settled-reask / broken-favor: no sitting pressed the
  pick — UNTESTED (as on r154). FIGHTALLY2: no landing fight with 2
  allies ended zero-DMG or stuck. Door-flee: 0 fled fights with a
  door-tile last step. Homeward: no scholar stranded homeward 2+
  days. React wind-down: no `dlg:react` at reactDryCount ≥2, no
  ≥3 identical react streak (r269 washout holds). Deduped-vs-
  silent: no truly-silent refused move. Link-opener: no verbatim
  repeat streak (20 transcripts contain link-raise openers).
  Profilegate/PLANWAKE: 10/10 at d14 (hold watch: ≥8/10) — HOLDS.
  Q1 panel watch (resume-takes re-pose): the 1364 d12 thread-return
  re-poses the warning and delivers it — PASS.

## The blank — M-PR1 commit-menu defect (filed, not fixed this run)

**What happens, in plain words:** twice on one village (seed 1370),
someone asks the player plainly to go foraging with them tomorrow —
Lucas on day 10 ("The pantry's nearly bare. Forage with me
tomorrow? I know the creek bend, past the treeline.") and Lena on
day 11 ("We're eating through stores faster than we replace them.
Forage with me tomorrow? I know the far treeline, past the rocks.").
The player listens, comforts them, and leaves after three turns —
and at no point is there any way to say yes. The menu never offers
"I'll come back to help." The favor just hangs: "Think about it?
I'll be around." The outing never happens. Two asked favors, two
dead ends, back to back.

**Reproduction (exact):** transcripts
`journey-landing-r62-transcript-1370-day10.txt` (Lucas, trust 10)
and `...-day11.txt` (Lena, trust 30), in the r155-after corpus.
In promised sittings the commit menu appears in the first menu after
the ask (e.g. 1371 d13, 1362 d11 — `[dlg:commit] "I'll come back to
help."` picked immediately). In these two sittings, across three
turns each, no menu ever contained `[dlg:commit]`,
`[dlg:favor_requirements]`, or the favor `[dlg:details]` — only
generic menus ([dlg:react], [recap], [dlg:comfort], [ask:goal],
[ask:others], [ask:gossip], [menu:more]) — and the `[dlg:more]`
path that leads to the favor menu in promised sittings was never
offered either.

**Mechanism traced:** the favor-commit menu is built by
`convoFavorActionMenu(vid, favor, favor.state === 'asked')`
(convo-wants.js:964, :2530) — `dlg:commit` is pushed only when the
favor record's state is exactly `'asked'` (and the action isn't
unsupported). The ask_favor want's `menuOptions` (convo-wants.js
~942–990) routes to the favor menu only when a favor record exists;
with no favor record at stage ≥2 it falls to the DEFERRED OPENER
branch ("offer engagement, not commitment"). The open question for
the builder is the favor record's state at menu time for these two
sittings — whether the forage_help favor was never created, created
in a non-'asked' state, or created but the menu builder never routed
to the want's menuOptions. The census carries no favor-record state
to settle it; settling it needs a targeted probe that dumps the
favor record (id, kind, state) at menu-build time for a forage_help
ask. Trust is a candidate signal (10 and 30 — the lowest trusts
among the panel's ask_favor sittings) but is not established as the
gate.

**Why no fix this run:** the fix touches the want/favor menu
routing (convo-wants.js) and needs (a) the probe above to pin the
cause, (b) a proof test driving an ask_favor to a commit offer, and
(c) a panel re-run as proof — none of which fits the remaining
time-box after the corrected panel, the extraction, and the gate.
Filed with the exact reproduction and the traced entry points above
for a builder arm or r156. The two settled sittings in the M-PR1
numerator (1369 d9, 1371 d11) are honest "already handled" closes,
not defects — but they count under the loop's established M-PR1
computation; see Metric review item 2.

## Carried investigation item — CONFIRMED: contest death leaves the ledger open

r154 asked whether a contest ending by participant death stamps
endDay. **Confirmed on this panel, with a live reproduction.**
Seed 1364: duel fired d25 (participants Tanya + Meera); Tanya — the
scholar — died in it d27 (cause `contest`, arenaish, contestId
`duel`, autopsy context LEDGER, death carried with context); at
horizon d28 the ledger still shows firedDay=25, endDay=null,
outcome=null. The panel's other two duels closed in 2 days through
the win/loss path (1363 d14→d16 won, 1369 d22→d24 won). The 1364
duel is the only contest open past its window, and it is exactly the
death-ended one. The other two open contests (1362 box d28, 1370
vigil d28) were fired on the horizon day — open is normal for them.

**Mechanism traced:** `contest_end` telemetry is emitted only by
`_contestEnd` (contests.js:5232), the win/loss funnel. Deaths route
through `_contestDie` (contests.js:5472 — reached from the generic
resolver's `DIE` branch at :4710 and the direct death calls), which
sets `ac.phase='done'`, records the outcome via `_cxRecordOutcome`,
counts held, and clears `activeContest` — but never emits
`contest_end` and never stamps the contest record's endDay. The
driver's ledger (driver ~4762) builds endDay/outcome solely from
`contest_end` telemetry, so a death-ended contest stays open
forever in the ledger. The ledger GO still holds (the death carries
its contest context — deathsWithContext=1, missing=0), but the
contest itself is never closed. **Proposed fix shape:** emit
`this.tele('contest_end', { id: ac.contestId, outcome: 'died' })`
from `_contestDie` (one line, mirroring `_contestEnd`), with a proof
test driving a contest to a death and asserting the telemetry (the
`test-contestdeath-b.js` / `test-landing-r46/47/48-contestledger`
pattern exists). Note for the fixer: several other analyzers also
count `contest_end` as "ended" (establishment r99/r101,
analyze-run.js, deepening r100–r106), so death-ended contests are
undercounted as ended everywhere, not just the landing ledger. The
show path (`_showEnd`, contests.js:1487) also emits no `contest_end`
— same gap class, out of this run's scope.

## People check — do villagers act like people?

Read in full: 1371 d9 (Devon, warn_you), 1363 d8 (David,
seek_comfort), 1363 d26 (Andre, linkraise), 1364 d12 (Vasyl,
warn_you), 1370 d10/d11 (Lucas/Lena, ask_favor), 1362 d15 (warn_you
heeded). Grep-checked: 1365 d13, 1366 d19 invite lines; 20
transcripts contain link-raise openers.

- **1371 d9 Devon, warn_you (Q1b deflect, carried design
  question):** the player deflects 5× `[dlg:subject]`; the warning
  opener ("Listen. I need you to hear this before you go back out
  there.") is never answered and the danger is never named; the want
  ends stage 3 unresolved. Reads as a person letting it go —
  "Anyway — that's my problem, not yours. What did you want?" — no
  verbatim bridge repeats. No new defect shape: the deflect is by
  subject-change, the warning is never delivered (so the
  WARNED-BUT-UNRESOLVED counter, which needs a delivered warning,
  correctly stays 0). Carried per prereg; no fix unless a deflect
  sitting shows a new defect shape.
- **1364 d12 Vasyl, warn_you (the recovery path works):** the player
  deflects repeatedly and Vasyl lets it go with a different human
  line each time ("Look, forget it. You wanted something?", "It's
  nothing, really. What were you saying?", "Take it with salt. What
  did you want to ask?", "Never mind. You had something to say?").
  At turn 11 the player picks the thread-return — "We never finished
  — that warning." — and Vasyl delivers it: "You've seen what's out
  there. I'm just saying — the treeline at dusk. Don't." Stage
  advances, the sitting ends engaged, and the conversation flows
  into a naming debate: Marisol calls the thing "The Big Bastard",
  Jamal and Miguel say "Ugly-Eyes", Chadni says "Old Ugly". A
  village arguing about a name is a village alive. The HEED flag on
  this sitting is a false positive in the "loop" sense — 14 turns of
  wandering (party invite accepted, gossip, case votes) that come
  back and finish.
- **1363 d26 Andre, linkraise:** link accepted + haul invite
  declined, both acknowledged at turn 0 (the menu offers
  link:accept/decline and betrayal:accept/decline together); party
  invite accepted ("Someone should watch your back. Might as well be
  me."); first-memory exchange and namebeast debate read as a
  person. **r251 orphaned-raise-lines does NOT reproduce.**
- **1363 d8 David, seek_comfort:** grief + invite ("Walk with
  me?"); player declines, acknowledged; case-framing line fires;
  player leaves after 1 turn. Invite answered, not orphaned.
- **Invite lines generally:** 0 orphans in 4 invite sittings
  checked (1362 d15, 1363 d8, 1365 d13, 1366 d19) — declined +
  acknowledged in every case.
- **1370 d10/d11 Lucas/Lena:** see The blank above. The NPCs read
  as people asking for help; the game gives the player no way to
  answer yes. The defect is in the menu, not the writing.

## Village assessment (plain words)

Ten villages, all alive at day 28. Nobody starved. Food is
comfortable almost everywhere — pantries run 2,100 to 9,000 kcal per
person at the horizon — except seed 1368, which is thin (1,223 per
person) after losing four people including its scholar. The villages
are planning from the first week: every one of them has people
holding a plan by day 14 (37 holders across the panel), and by day
28 they've set out on 106 departures and fought 424 party fights.
People are learning to work the land (91 practice moves), testing
monster meat and finding it edible (the flesh channel opens on 9 of
10 villages), and holding joint outings that bring food home (4
kept). Contests run and mostly resolve — 21 fired, 18 ended, 15 won.
Two scholars died and were succeeded cleanly within a day each
(Tanya → Marisol, Bill → Ella). What the villages are NOT doing yet
in 28 days: killing wave-4 beasts (0 on the panel), mustering, or
reaching the table. That is the landing leg's horizon, not a verdict
— the first fortnight is about surviving and starting, and the
starting is happening. The thin village (1368) is the one to watch:
it lost the most people, its pantry is the thinnest, and it is the
only one where hunger is a live question at the horizon.

## Dialogue watch (Q6)

- Topic-dwell: 144 sittings, 10 probe sittings, 111 subject picks,
  64 unknown-thread (probe-only). Trigger-capable topics: grief,
  personal, want, small. No ask offered on grief/cheer/secret.
  Dwell turns (probe): want 193, goal 30, personal 24, grief 17,
  gossip 5, past 5, small 6.
- r267 topic2Ask + r268 LAUNCHVOICE watches: **no instrument** —
  neither term appears in the analyzers log or in any census JSON.
  The watches were preregistered but unmeasured this run. See
  Metric review.
- Presshop: 55 attempts, pressFailTotal 1, togetherStopped 9,
  farUnreached 1, hopReached 5, detourReached 1 (seed 1368 d2,
  11 steps for a 5-manhattan hop).
- Outingchain: 34 favors, kept 4, broken 4, open 26; CHAIN-
  COMPLETES-FAR. Outing: OUTING-GO. Armor: ARMOR-GO (seedOK 10/10,
  bark 10/10, craft 7/10 — crafts now fire, answering r154's
  ARMOR-SILENT attribution question; teleLineDisagree 0). Party:
  PARTY-GO (offered 11, picks 11, spoken 11, dry 0, accepted 4).
  Labeling: LABELING-GO 13/13. Flesh: CHANNEL OPENS (arrival 9/10,
  test 10/10, exit 7/10, stuck 2). R94: waitDiagMissing 0.
  R84 kcal ALL-ARRIVED 2/2; water UNTESTED. R85 kcal RESCUE-GO 2/2;
  water UNTESTED. R88: EAT-GO 2/2; ARMOR-SILENT 0; DOORSTEP
  UNTESTED; MAEVE none. WIND-DOWN MORE GO 7/7; WD PROBE GATE-A/B
  GO. BETRAYAL heldOffers=0. R106: prims>0 on 9 seeds, muster 0,
  beat4/5 0, wave4kills 0, table 0.
- Contests (per-seed ledger): 1362 lies 18→20 won, alibi 23→25 won,
  box 28→open; 1363 duel 14→16 won, confession 20→22 won, lies
  27→29 won; 1364 price 21→23 won, duel 25→open (death-ended, see
  above); 1365 pit 14→16 lost, pantry_raid 26→28 won; 1366
  informant 21→23 won; 1367 sorting 15→17 won, tithe 24→26 lost;
  1368 price 21→23 won; 1369 pit 16→18 won, duel 22→24 won; 1370
  pit 18→20 lost, riddle 22→24 won, vigil 28→open; 1371 cookfight
  14→16 won, echo 21→23 won.
- Villager deaths (census, all REGISTERED): 1363 Amina d6 ambush;
  1364 Tanya d27 contest (scholar); 1365 Kathleen d6 wound; 1368
  Meera d2 monster, Rafael d6 ambush, Louie d11 combat, Bill d23
  expedition (scholar); 1369 Maja d14 wound; 1370 Moli d9 wound,
  Jovan d27 Gavel. 1362, 1366, 1367, 1371: no villager deaths.

## Verdicts

- **Reachable:** yes. System contact by d9 on all 10 seeds; plans
  ignite by d14 on all 10; outings complete and keep; contests fire
  and resolve. The landing leg's content is all reachable.
- **Fun:** yes, with one cut. Conversations read as people — the
  thread-return delivering a deferred warning, the naming debate,
  the link-accept with a voiced line. The cut is the M-PR1 defect:
  being asked for help and given no way to say yes is the opposite
  of fun, and it happened twice in a row on one village.
- **Winnable:** not judged on this leg — no wave-4 kills in 28d is
  the landing horizon, not a winnability verdict. The chain beyond
  landing (wave-4 party kills → veterans → table) is Lane B's
  question. What this leg shows is the start of the chain working:
  plans ignite early and hold.
- **Q1 overall: NO-GO on M-PR1 (4/20 = 20% > 15%).** Every other
  binding bar passes. The NO-GO is carried, not re-scored.

## Metric review (proposals, NOT adopted this run)

1. **d14 snapshot fragility (new, from the mis-run):** the driver
   keys the d14 winplan snapshot on `series.length === 14`, not on
   game day — a skipped day kills the snapshot (9/10 null on the
   void 14-day run). Propose: key on the snapshot's game day
   (first snapshot at/after day 14). Instrument fix for r156.
2. **M-PR1 settled-counting (new):** the R122 analyzer exclusion
   ("settled sittings do NOT count as never-offered") and the r154
   hand computation (settled established sitting counted in the
   numerator) disagree, and the answer flips this run's verdict
   (10% PASS vs 20% MISS). The loop must decide ONCE, in metric
   review, whether settled established sittings count — and record
   the decision in the prereg before r156 runs. This run
   adjudicates per the r154 precedent (counted; MISS) per §14.
   Separately, the r154 item-4 "stated counted too loosely"
   question now has live instances: the two 1370 'stated'
   never-offered sittings are genuine never-offers (no commit menu
   ever appeared), not a counting artifact.
3. **r267/r268 watches uninstrumented (new):** topic2Ask and
   LAUNCHVOICE appear in neither the analyzers log nor any census
   JSON. The watches need an instrument (analyzer lines + census
   fields) or should be dropped from the prereg.
4. **silentTurns / dry-line bars uninstrumented (new):** both are
   binding Q1 bars with no instrument this run (absent from log and
   census). The measurable proxies (0 empty THEM lines, nodloop
   LOOP=0) are clean but are not the bars. Either wire the
   instruments or restate the bars as the proxies.
5. **Contest endDay can exceed the horizon (new):** 1363 lies fired
   d27, endDay d29 — one day past the d28 horizon (a day-boundary
   roll on the final tick). The ledger tolerates it; the horizon
   wording should note that endDay ≤ d29 is possible.
6. **Carried r154 items 1–8** (zero-DMG bar over-strict; ARMOR-
   SILENT attribution; scholar-deaths bar counts deaths not
   fairness; M-PR1 direction — now answered by item 2 above; R66
   wording; R104 popEnd off-by-one; link-opener wording;
   namebeast pair-count basis) — unchanged, see the prereg.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r155-gate`
on the rebased tip (`78b6c54c4`, on master `3fd09decc`): **339 passed,
5 failed in 758s** (log `hidden_files/journey-landing-r155-gate.log`).
The 5 failures are exactly the standing 5, none attributable to this
evidence-only commit (no src/js change): phone-frame stale receipt
(`test-phone-frame-proof.js`), two 120s deed-attainment timeouts
(`test-living-garden-deed-attainment.js`,
`test-one-person-army-deed-attainment.js`), measurement-proof
staleness pair (`test-measurement-proof-update.js`,
`test-measurement-workflow.js`). Gate verdict: PASS on the standing-5
basis. No re-run needed (no load flakiness in the failures — the two
timeouts are the standing 120s deed-attainment timeouts).

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r155-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**one LOUD line — monsterKills 217 → 411 (+89%). Investigated
same-run, EXPLAINED, not a bug:** kills-per-party-fight is unchanged
at 0.97 (r154: 286 kills / 296 fights; r155: 411 / 424) — villages
fight MORE (departures 78→106, partyFights 296→424, holders 28→36)
on the r268 PLANWAKE regime, and villagerDeaths (10 vs baseline 9)
stayed quiet. Trend 217 (r135/r136) → 286 (r154) → 411 (r155) tracks
activity, not lethality. Baseline re-pinned to (82/10/411/16/0) with
the explanation recorded in its `_note`. All other metrics quiet.

## Closeout

Merged locally, pending ship. Commit `78b6c54c4` (rebased onto
master `3fd09decc`, sim-homebody-rejudge-a) merged ff-only into
master; worktree released and removed; rotation `0→1`; lock deleted;
hbloop killed. No version bump, no push, no live verification — the
ship loop owns those.
