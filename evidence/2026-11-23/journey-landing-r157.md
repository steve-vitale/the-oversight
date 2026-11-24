# Journey landing r157 — leg 0 LANDING (days 1–14 judged, horizon d28)

Run `playtest-20261123T2245Z`, scheduled Mon 2026-11-23 15:45 CST (started
16:45 CST — late start, no schedule change). Lane A leg 0.
Base master `1a7a5b647` (fleshout 20261123T2015Z adoption round record;
scale r276 + endgame r275 merges already in). Lock
`playtest-loop.lock` run_id `playtest-20261123T2245Z`, created
2026-11-23T22:45:00Z. Rotation read `0` → write `0→1` at closeout.
Worktree `~/workspace/worktrees/journey-landing`, branch `journey-landing`.
Heartbeat via setsid nohup hbloop, 10-min cadence (registry field
`heartbeat_at`).

**Machine restart ~22:58Z:** the VM was replaced mid-run (uptime 7 min at
23:05Z), killing the first hbloop and the first heartbeat at 22:50:58Z.
Work re-verified intact on the new boot (fix, proof test, driver, prereg
all present, mtimes 23:03–23:04). New hbloop started 23:05Z (pid 4951);
first beat landed 23:06:19Z. A write flap often follows a restart — the
watchdog read ALL-OK through run start and the heartbeat writes land, so
no flap is active at this writing; the panel, analyzers and telemetry all
ran clean after the restart.

**Pre-flight:** main tree clean (verified via `git status --short`, empty
at 22:41Z). Disk 49%. `git pull --ff-only`: already up to date.
`worktree-reap.sh`: ran, removed nothing; 11 LOUD lines, all active trees
with uncommitted changes, never auto-removed (active 12/16).

## Prereg summary

`evidence/2026-11-23/journey-landing-r157-prereg.md`. Seeds fresh **1382–1391**
(full-evidence grep; only incidental hits: PID 13820, commit-hash fragment
d0ed41382). DAYCAP=28, pilot seeds 1382–1385. Policy: r156 control verbatim.

**The blank this run fills — M-PR1 residual (r156 filed):** one sitting on
r156 (seed 1375, Landon d26) asked plainly for help with the pantry run
and never offered any way to say yes. Mechanism pinned by transcript +
code trace (refined this run by reading the Landon transcript in full):
the sitting opens pre-empted by a linkraise + betrayal offer, so the
want sits at stage 0 with no favor attached, thread 'request', the favor
living only in the ledger. The player picks [dlg:help] at stage 0;
engageBeat's deferred branch calls the opener, whose follow-up branch
sets stage 2 directly — then `convoWantEngage('engage')` runs with the
stage already 2, so the r156 flip inside the `stage < 2` guard is
skipped. The [dlg:more] depth path never flips either. Fix shape: move
the flip out of the guard (flip whenever engage lands at stage 2).

**Metric-review decisions made BEFORE this run (prereg §14, r156 items
adopted):** (1) Namebeast day-late pinned to the r152 defect (vote
opening a DIFFERENT beast); day-late RIGHT-beast vote = investigation
item, not failure. (2) Told-but-never-named reported as watch. (3)
FIGHTALLY2 restated as "ends with the scholar contributing nothing (no
strikes, no moves)". (4) HEED legacy counter dropped; HEED-V alone. (5)
Resume-takes watch DROPPED as uninstrumented. (6) StatedAfterPick ≥6
watch only. (7) Pool-variety watch added (distinct link-accept / heed
lines per panel). (8) Contest-death ledger stays filed for a builder
arm (one blank per run). (9) Q1b deflect 13th carry.

**Base delta vs r156 merge `4cd566b21`** (src/js, 3 files): endgame r275
dead-whisper fix + Voice-collapse fix-the-fix (registerDeath dead-mark,
godBefore capture); succession r268 stage-2 prefixed retry in topic2Ask;
crisis r274 DOWNEDTWICE dedup + FIGHT-STALL flee.

## Panel

Driver `scripts/journey-landing-r157-20261123.js` (r156 driver verbatim
except OUTDIR, header, default seeds — fresh band 1382–1391). DAYS passed
explicitly as 28 (default is 14 — the r155 mis-run lesson). Analyzers
`evidence/2026-11-23/journey-landing-r157-analyzers.sh` (15 analyzers).

- **Pilot:** exit 0, seeds 1382–1385, systemDay=8 on all, over=no, d14
  winplan snapshots SET (game-day keying holds), 0 error lines, census
  rows present. Log: `hidden_files/journey-landing-r157-pilot.log`.
- **Panel:** exit 0, all 10 seeds (spawns: Luna, Brunhilde, Amara, Vy,
  Gilberto, Sandra, Willow, Leah, Tao, Arnold), systemDay=8 on all
  except 1389 (9), over=no everywhere, 152 files in corpus. Log:
  `hidden_files/journey-landing-r157-panel.log`.
- **Analyzers:** 15/15 exit 0, 1708 lines. Log:
  `hidden_files/journey-landing-r157-analyzers.log`.

| seed | spawn | systemDay | over | villager deaths | pantry/person d28 |
|---|---|---|---|---|---|
| 1382 | Luna | 8 | no | — | 4,044 |
| 1383 | Brunhilde | 8 | no | Aria d24 sickness; 3× sickness d26; wound d26 | 1,603 |
| 1384 | Amara | 8 | no | d16 "the wild" (also the scholar) | 2,729 |
| 1385 | Vy | 8 | no | — | 1,502 |
| 1386 | Gilberto | 8 | no | — | 5,529 |
| 1387 | Sandra | 8 | no | d12 ambush | 7,651 |
| 1388 | Willow | 8 | no | Luis d6 ambush; d10 monster | 2,314 |
| 1389 | Leah | 9 | no | — | 5,896 |
| 1390 | Tao | 8 | no | — | 3,473 |
| 1391 | Arnold | 8 | no | d6 wound | 6,312 |

All villager deaths REGISTERED (census). Scholar deaths 1 (Amara d16
"the wild" — the village continued under succession to d28; the death
is registered with a cause, mislabels 0). Contests: fired 22, ended 21
(won 19 / lost 2), open at horizon 1 (1388 Siege). Monster kills 393
(huntpractice count). Fights 22, all with known triggers.

## Q1 adjudication — GO

- **M1 ALIVE-D14: PASS** — 10/10 alive at d28.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9 (systemDay 8 on nine
  seeds, 9 on 1389).
- **M3 FIGHT-LOG: PASS** — 0 unknown triggers (22 fights: faceFeastDraw
  9, driveContestsImpl 6, contestArena 5, monsterTurn 2 — classified
  from the fight stacks; the 'G' frames are `G._contestArena`).
- **Zero-DMG refused-turns: PASS (BINDS)** — 0. Raw zero-DMG 3/22 fights,
  all shape-B stood-through with refusedTurns 0: 1382 d9 (scholar moved
  once, 0 strikes, allies killed), 1386 d16 (moved twice), 1387 d8
  (moved twice). Under the ADOPTED FIGHTALLY2 restatement ("ends with
  the scholar contributing nothing — no strikes, no moves"), none is a
  failure: the scholar repositioned in each while allies carried the
  kill, all three fights won. Same class as r156's 1377 d19 kite fight.
  stoodThroughByChoice 3; refusedTurnsAllFights 0. Scholar-turn verbs
  across the panel: moves 23 (0 failed, 0 movedLie), stuckFights 0.
- **Practice: PASS** — movedCells d1→d28 = 89 (bar ≥50), seedsWithMove
  10/10, skill0→pos 53, practiceReps 3168. By task: wood 24, stone 22,
  water 19, cook 9, deadfall 13, forage 0, hunt 0. Huntpractice
  H0-ESTABLISHED (huntReps 18, huntMax 3, huntVillagers>0 14, huntMoves
  0 — first rung out of reach in 28d).
- **Pocket: PASS (BINDS)** — 0 pocket fights, stuckTurns 0.
- **D1: PASS** — 0 garbled-label renders.
- **HEED: legacy DROPPED (decided), HEED-V: PASS (BINDS)** — 0.
  WARNED-BUT-UNRESOLVED 0. D2 verbatim warning repeats 0. D3 0. All 4
  warn_you sittings end resolution=heeded except 1386 d13 (see People
  check — the warning was never stated, honestly 'unestablished'). The
  heeded sittings all name the danger (see People check).
- **M-PR1: PASS — 0/24 = 0% ≤ 15% bar (decided rule).** R107
  commit-offer: sittings=27, offered=22, picked=22, promised=18,
  statedAfterPick=4, neverOffered=3, settled=2. Established = 27 − 3
  unestablished = 24. The 3 analyzer never-offered ARE the 3
  unestablished sittings (1383 d7, 1385 d6, 1387 d9 — the favor never
  surfaces, correctly excluded); the 2 settled sittings (1383 d10,
  d12) speak the engine's own settled lines. **No established sitting
  is never-offered: the residual route is CLOSED.** Zero ask_favor
  sittings end with threadsPursued=[request] alone (the Landon shape
  does not recur); 12 sittings show the request→want flip. The 4
  statedAfterPick are all honest away-guard refusals (remedy-naming),
  below the ≥6 watch line.
- **Bridges: PASS** — 0 repeats in every pool. Personal 15 servings,
  grief 1, village 4, plans 4, small 9.
- **R66 HUNGRY: NOT-HUNGRY** — starvationDeaths 0, slideSeeds 0,
  bandSeeds 6, noSlideSeeds 4. Hungry-at-horizon 2/10 (1383 at 1,603
  and 1385 at 1,502 per person — the thin-village shape, watch
  continues; 1383 also carries the sickness cluster).
- **Scholar deaths: PASS (≤2)** — 1 on the panel (Amara d16).
- **silentTurns / dry lines (restated proxies, adopted bars): PASS** —
  0 empty THEM lines in the corpus, nodloop LOOP=0, mimeShown=0.
  Nodloop: 132 sittings, 7 NV.
- **Q1 panel watch (resume-takes): DROPPED** (decided pre-run,
  uninstrumented — same class as r155's r267/r268 drop).
- **Other watches (corpus greps + transcript reads):** Miriam line 0
  "That's settled"; deflect-fallback 0 `fellBack`; confide 0 "This
  stays between us" (UNTESTED — no confide fired); volley errors 0
  and no volley fired, so ammo-name UNTESTED; COUNTER LEARNED lines 12,
  all with specific guarded labels. Warn-heed 4/4 heeded sittings name
  the danger — PASS. Namebeast told-watch: 50 same-sitting tell→name
  pairs, all 50 name the told beast (0 true mismatches; the 6 apparent
  mismatches in a naive case-sensitive read are case/punctuation
  artifacts of the extraction, not different beasts — the r152 defect
  absent). Told-but-never-named: 6 told beasts get no player naming
  vote anywhere in the 28d window (1383 d7 moth, 1384 d8 raccoon,
  1385 d13 moth, 1385 d6 crow, 1385 d8 knobs, 1389 d16 blank shape) —
  watch item 2, instrument proposal stands. Settled-reask /
  broken-favor: the `[alive:memory:promise_broken]` option was offered
  once, picked 0 times — UNTESTED (4th run). FIGHTALLY2: PASS under
  the adopted restatement (see Zero-DMG). Door-flee: 0 fled fights
  (fled=None on all 22 fights); the 3 fledBadLog entries are
  legacy-outmatched probe samples for fights the scholar's side WON
  (1382 d26 chorus_line, 1384 d16 anaconda_empress ×2, 1389 d27
  ducks_in_a_row — same class as r156's single entry). Homeward: no
  scholar stranded homeward 2+ days. Downed-ally: none. Owed-walk: no
  "veto" anywhere in the corpus, no accepted invitation vetoed by
  illness. React wind-down: WIND-DOWN MORE GO 7/7; WD probe GATE-A/B
  GO. Deduped-vs-silent: no truly-silent refused move. Link-accept:
  every accepted link-raise ends with a voiced accept line, never the
  player's choice label verbatim — PASS; variety is thin (2 templates:
  8× "Good — the word on them is kind. Go and ask." / 15× "Good. What
  I've heard of them, I believe. Go and ask.", destination village
  varies: Thornfield / Emberhold / Stonebridge). Link-opener: no
  verbatim repeat streak; openers vary by village and line.
  Profilegate/PLANWAKE: d14 planSeeds>0 on 10/10 (hold watch ≥8/10) —
  HOLDS. Reseed-beat: planReseeds 0 on all seeds — none fired.
  1130-d6 amnesia shape: 0 recurrences. "the the" doubling: 0 anywhere
  in the corpus.
- **Q1 overall: GO.** Every binding bar passes. M-PR1 is 0/24 — the
  r156 residual is closed.

## The blank — M-PR1 residual (FILLED this run)

**What was wrong, in plain words:** one sitting on r156 (seed 1375,
Landon d26) asked the player plainly for help and never offered any
way to say yes. The menu never offered "I'll come back to help." The
favor hung and the outing never happened.

**Mechanism pinned (r156 transcript + code trace, refined this run by
reading the Landon transcript in full):** the sitting opens pre-empted
by a linkraise + betrayal offer, so the want sits at stage 0 with no
favor attached, thread 'request'. The player picks [dlg:help] at stage
0; engageBeat's deferred branch calls the opener, whose follow-up
branch sets `c.want.stage = 2` directly (convo-wants.js ~700) and
returns "I still need help with the pantry run." The turn handler then
calls `convoWantEngage(vid, 'engage')` — but the stage is already 2,
so the r156 flip inside the `stage < 2` guard is skipped and the
thread stays 'request'. The request-thread [dlg:more] depth path
delivers the favor's depth lines via the engageBeat fallback
(conversation.js ~4310) without flipping either, so `convoWantMenu`'s
coherence gate stays closed for the whole sitting.

**Fix (this run, in the worktree):** in `convoWantEngage(vid, 'engage')`
in `src/js/convo-wants.js`, move the thread flip out of the `stage < 2`
guard — flip whenever engage lands at stage 2. One place; the only new
behavior is for engages landing when the stage was already 2 (the
pre-established-favor route), which is exactly the defect. All other
engage callers are unchanged (the flip already applied to them when
the stage was < 2). Diff: 10 insertions, 4 deletions (comment + flip).

**Proof test — RED then GREEN:**
`scripts/test-landing-r157-commit-menu-residual-20261123.js` (godpath
lib pattern, seed 157100). Sitting A creates a real favor (natural
ask_favor want, [dlg:help] press, favor 'asked', stored); sitting B
reopens the same villager and plants the panel-observed state (stage 0,
fromSeed, seedFavorId set, NO favor attached, thread 'request'). On
old code: 23 passed / 5 failed — the 5 fix assertions failed with the
exact panel shape (thread stayed 'request', menu
`dlg:more,dlg:react,recap,teach,dlg:subject,leave,silence`, wantMenu
empty). Control (r156 grief route) passed on old code. On fixed code:
**28 passed, 0 failed** (pre-established favor + request thread →
commit offered; grief control; unit engage-at-stage-2 flips the
thread). The r156 proof test re-run on fixed code: **23/23**.

**Panel as proof:** M-PR1 0/24 (was 1/27 on r156 under the decided
rule). The fix works for the filed defect: no ask_favor sitting ends
with threadsPursued=[request] alone, and 12 sittings show the
request→want flip. The promised control shape is alive and well: 18
promised sittings, including 1389 d9 (Luis, fromSeed, "About the
pantry run — still need hands. Are you in?" → [dlg:commit] picked →
"Then it's set. The creek bend, past the treeline, at sunup. Bring
your pack and your knife." → promised "forage with Luis tomorrow to
rebuild the pantry" — and the R75 window shows Luis's favor KEPT,
depart d10, 325 kcal delivered).

## Carried investigation item — contest death leaves the ledger open (NOT reproduced this panel)

r155 CONFIRMED: a contest ending by participant death never emits
`contest_end`, so the ledger's endDay stays null (seed 1364, duel,
scholar Tanya died d27, ledger endDay=null at horizon). Proposed fix
shape: emit `contest_end` from `_contestDie` (one line, mirroring
`_contestEnd`), with a proof test driving a contest to a death. On
THIS panel the item does not reproduce again: no death-ended contest
occurred (all contestDeathAutopsies carry contestId null — monster-
combat deaths; deathsWithContext=0, deathsMissing=0; the 1 open
contest is 1388 Siege — still open at the horizon, not death-ended).
The item stays filed for a builder arm with its exact one-line fix
shape; the ledger GO holds (22 fired, 21 ended, 1 open-at-horizon,
all accounted).

## People check — do villagers act like people?

Read in full: 1389 d9 (Luis, ask_favor fromSeed — promised, the fix's
rescue path), 1388 d26 (Stan, warn_you — heeded), 1386 d13 (Nikos,
warn_you — the first Q1b deflect sitting in 13 runs), 1387 d12 (Mara,
repay — broken promise confronted), 1384 d16 (Aki, nonverbal sitting
on the scholar-death day). Grep-checked: link-accept follow lines,
COUNTER LEARNED labels, tell/name pairs, warn_you resolutions,
settled lines, fledBadLog, promise_broken offers.

- **1389 d9 Luis, ask_favor fromSeed (promised — the fix's rescue
  path):** "About the pantry run — still need hands. Are you in?" The
  commit menu is offered at the opening menu, the player picks it, and
  Luis answers with a concrete plan ("The creek bend, past the
  treeline, at sunup. Bring your pack and your knife."). A favor asked,
  a favor taken — and kept (325 kcal home on d10). Afterward Luis
  refuses a party invite with character: "I work alone. Nothing
  personal. ...It's a little personal." This is what the r155/r156
  defect denied, now working end to end.
- **1388 d26 Stan, warn_you (heeded — the quoted moment):** the sitting
  opens on a linkraise, the player accepts, then [dlg:more] takes the
  request→want path ("Listen. I need you to hear this before you go
  back out there."). The player heeds four times and Stan escalates
  honestly: "the treeline at dusk. Don't." → "Promise me that.
  Please." → "Good. I mean it — watch yourself out there." → "I mean
  it. I've watched people walk out sure and not walk back. Don't be the
  next one I have to stop waiting for." Resolution 'heeded', the danger
  named, the sitting earns its ending. This is the standard the dialogue
  is judged against, and it meets it. (Variety note: "the treeline at
  dusk. Don't." is the same single shared line as r156 — 3 occurrences
  on this panel; see Metric review item 3.)
- **1386 d13 Nikos, warn_you (the first Q1b deflect sitting — 13th
  carry, now TESTED):** the sitting opens on a gossip question
  ("People are saying things. About you. Is any of it true?"), the
  player answers, then picks [dlg:subject] to change the subject — and
  the conversation goes to the betrayal case, then the player leaves.
  The warning is NEVER STATED and the want ends 'unestablished'. That
  is the honest outcome: a warning that was never delivered can't be
  re-asserted, and the want waits (it will resurface as a seed). The
  companion case, 1389 d12, deflects MID-warning (1 subject pick + 4
  heed picks) and the warning re-asserts to 'heeded'. The mechanism
  works both ways: stated warnings re-assert, unstated ones wait. No
  defect shape in either sitting — the 13-run Q1b carry CLOSES as
  tested, no defect.
- **1387 d12 Mara, repay (broken promise confronted):** "You said you'd
  help with the pantry run. It's still open — but that promise is
  dead." The player says "Don't worry about it." Mara: "Right. Forget
  it." They won't forget. Debts unpaid just sit there. A broken promise
  named aloud, with a social cost that persists (resolution
  'deflected', memory written). The sitting works; the `[alive:memory:
  promise_broken]` option was offered in the menu and not picked — the
  settled-reask watch stays untested for a fourth run.
- **1384 d16 Aki (nonverbal, the scholar-death day):** Aki speaks only
  Japanese; the sitting is gestures, a nod, a smile, a held look —
  "«会えてよかった。本当に。» (you catch 'よかった' — glad)" — and the
  player walks away. No shared words, no fabricated understanding. The
  scholar (Amara) died "in the wild" that same day and the village
  carried on; the death is registered with a cause, not a mislabel.
- **Naming debates:** 50 same-sitting tell→name pairs, all 50 name the
  told beast (verified by description match; 0 true mismatches). The
  haven argues: "Big Big" vs "The Ugly Beast" vs "Big-Eyes" vs
  "Loud-Eyes" vs "Big Loud" — a village arguing about a name is a
  village alive. Six told beasts get no player naming vote inside the
  28d window (see Q1 watches) — whether their debates kicked and
  resolved via NPC convergence is not in the census.
- **Link-accept:** every accepted link-raise ends with a voiced accept
  line naming the village (Thornfield / Emberhold / Stonebridge). The
  two templates repeat across villages — the same sentence from
  different people. Reads fine each time; the pool is thin. Variety
  note, not a defect.

## Village assessment (plain words)

Ten villages, all alive at day 28. Nobody starved. Food is comfortable
almost everywhere — pantries run 1,502 to 7,651 kcal per person at the
horizon — except seeds 1383 (1,603) and 1385 (1,502), which are thin.
1383 is the one to watch: it lost five people in four days to sickness
and a wound that wouldn't close (d24–28), the same thin-plus-deaths
shape as r156's 1376, and its pantry is the thinnest. The villages are
planning from the first week: every one of them has people holding a
plan by day 14 (35 holders across the panel), and by day 28 they've
fought 344 party fights on 82 departures. People are learning to work
the land (89 practice moves, wood and stone leading), testing monster
meat and finding it edible (the flesh channel opens on all 10 villages
this run — 1388's belltoad came back poison, honestly named), and
holding joint outings that bring food home (5 kept). Contests run and
mostly resolve — 22 fired, 21 ended, 19 won. One scholar died (Amara,
d16, in the wild) and the village carried on under succession; ten
villagers died and every death is registered with a cause. What the
villages are NOT doing yet in 28 days: killing wave-4 beasts (0 on the
panel), mustering, or reaching the table. That is the landing leg's
horizon, not a verdict — the first fortnight is about surviving and
starting, and the starting is happening. The thin villages (1383,
1385) are the ones to watch.

## Dialogue watch (Q6)

- Topic-dwell: 132 sittings, 10 probe sittings, 117 subject picks, 72
  unknown-thread (probe-only). Dwell turns (probe): plans 20, goal 16,
  gossip 14, personal 10, grief 9, village 6. Trigger-capable topics:
  personal, want, small. Grief served 1 time this panel (vs 0 on r156).
- Presshop: 82 attempts, pressFailTotal 0, togetherStopped 22,
  hopReached 24, detourReached 1.
- Outingchain: favors exist, keptTotal 5, OUTING-GO. R73 window:
  promised=10, askedOnly=27, NARROW=10, keptInsideNarrow=5.
- Armor: seedOK 10/10, bark 10/10, craft 3/10, teleLineDisagree=0,
  ARMOR-GO. Party: offered 6, picks 6, spoken 6, dry 0, accepted 2,
  PARTY-GO. Labeling: 22/22 match, LABELING-GO. R94: waitDiagMissing 0.
- R84 kcal: arrivals 1/1 ARRIVED; R85 kcal rescue 1/1 RESCUE-GO;
  water UNTESTED (0 arrivals). R88: EAT-GO 4/4; DOORSTEP UNTESTED (0
  triggered — no hungry/thirsty Haven day). ARMOR-SILENT 0; MAEVE
  qualified 0. WIND-DOWN MORE GO 7/7; WD PROBE GATE-A/B GO. BETRAYAL
  heldOffers=0. Succession: latencies=[1], noSuccessorNoGo=0,
  unresolvedAtHorizon=0. R106: prims>0 on some seeds, muster 0,
  beat4/5 0, wave4kills 0, table 0. R104 winplan: d14 planSeeds>0 on
  10/10, holders d14=35, d28=34; partyFights 123 d14 / 344 d28;
  partyTrios=0.
- Contests (per-seed ledger): 1382 auction→17, gauntlet→28; 1383
  (1 fired, ended); 1384 (2, ended); 1385 (3, ended); 1386 (2, ended);
  1387 (3, ended); 1388 (3, 2 ended, Siege open); 1389 (1, ended);
  1390 (2, ended); 1391 (3, ended). (Outcomes: won 19, lost 2, open 1.)
- Villager deaths (census, all REGISTERED): 1383 Aria Thompson d24
  sickness, d26 wound, d26 sickness ×3, d28 sickness; 1384 d16 "the
  wild" (the scholar Amara — same death, village continued); 1387 d12
  ambush; 1388 Luis Fernandez d6 ambush, d10 monster; 1391 d6 wound.
  1382, 1385, 1386, 1389, 1390: no villager deaths.

## Verdicts

- **Reachable:** yes. System contact by d9 on all 10 seeds; plans ignite
  by d14 on all 10; outings complete and keep; contests fire and resolve;
  the commit menu now appears where the favor is asked (18 promised,
  0 never-offered among established). The landing leg's content is all
  reachable.
- **Fun:** yes. Conversations read as people — Stan watching people walk
  out sure and not walk back, Luis setting the creek-bend meet at sunup,
  Mara refusing to forget a dead promise, the naming debate, the
  away-guard refusal that names the remedy. The r155/r156 cut is closed:
  no sitting on this panel asks for help without offering a way to say
  yes.
- **Winnable:** not judged on this leg — no wave-4 kills in 28d is the
  landing horizon, not a winnability verdict. The chain beyond landing
  (wave-4 party kills → veterans → table) is Lane B's question. What this
  leg shows is the start of the chain working: plans ignite early and
  hold, parties fight 344 times, outings keep.
- **Q1 overall: GO.** M-PR1 0/24; every other binding bar passes.

## Metric review (proposals, NOT adopted this run)

1. **Q1b deflect — CLOSE THE CARRY (new):** the 13-run carry is now
   TESTED — 2 deflect sittings this run (1386 d13 warning never stated,
   honestly 'unestablished'; 1389 d12 deflect mid-warning, re-asserts
   to 'heeded'). No defect shape in either. Do not carry it a 14th
   time as untested; if a future deflect sitting shows a new defect
   shape, file it then.
2. **DEPARTED-NO-DELIVER breaks (new, candidate blank):** 5 of the 10
   promised narrow-window outings break this way (Benoit, David, Mara,
   Anjali depart, the evening press is blocked — bare patch / door-side
   — nothing is delivered, favor breaks; +1 NO-DEPART). The outing
   departs but comes home empty and the promise breaks on a blocked
   evening press. Worth a blank on a later landing run: is the evening
   press failing for a legible reason the player could have fixed, or
   is the departure itself the trap?
3. **Pool-variety watch — FIRES AGAIN (carried):** link-accept still 2
   templates (8× / 15×); the heed-beat line ("the treeline at dusk.
   Don't.") is a single shared line spoken verbatim 3 times on this
   panel. No bar covers cross-seed pool reuse; D2 reads 0. A
   pool-variety watch (distinct lines per pool per panel) would catch
   this class — still a proposal, not a bar.
4. **Told-but-never-named beasts — 6 this run (carried):** up from 4 on
   r156. Whether their debates kicked and resolved via NPC convergence
   is not in the census — the instrument proposal (per-beast tell/kick/
   name days in the census) stands for a later run.
5. **Settled-reask / broken-favor — UNTESTED, 4th run (carried):** the
   `[alive:memory:promise_broken]` option was offered once, picked 0
   times. The watch needs a sitting that picks it, or it stays
   untested.
6. **Namebeast day-late (carried):** no day-late vote occurred on this
   panel (all 50 pairs are same-sitting). The adopted wording (pair
   check binds; day-late right-beast vote = investigation item) stands.
7. **StatedAfterPick below the line (new):** statedAfterPick=4, below
   the ≥6 watch line (r156 hit it exactly at 6). All four are honest
   away-guard refusals. No action.
8. **1383 sickness cluster (new, watch):** 5 villager deaths in d24–28
   (4 sickness + 1 wound) on the thinnest village. Sickness as the
   landing-leg killer — worth watching whether the cluster recurs on
   the next thin village, and whether the medicine supply (ruin
   medicines, healer presence) ever reaches it in 28d.
9. **Carried r157 prereg decisions 1–11** — unchanged except items 1–8
   above (Q1b closes; pool-variety and told-never-named carry).

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r157-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**quiet (10 files, 5 metrics, no large deviations).** No LOUD lines, no
investigation needed, baseline NOT re-pinned. Panel values for the
record: monsterKills 393 (baseline 411), villagerDeaths 10 (baseline
10), starvationDeaths 0.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r157-gate`
in the worktree (started 23:15Z, finished 23:29Z): **339 passed, 5 failed
in 713s**. The 5 failures are exactly the standing set from r156 (339/5
in 691s) — none attributable to this run's fix, none in the
conversation/favor area:

1. `scripts/godpath/test-phone-frame-proof.js` — stale phone receipt
   (index.html, alienPlayers.json, build-notes.json, foreignSpeech.json,
   regions.json, statusEffects.js).
2. `scripts/godpath/test-living-garden-deed-attainment.js` — TIMEOUT
   after 120s.
3. `scripts/godpath/test-one-person-army-deed-attainment.js` — TIMEOUT
   after 120s.
4. `scripts/godpath/test-measurement-proof-update.js` — measurement-proof
   staleness.
5. `scripts/godpath/test-measurement-workflow.js` — measurement-proof
   staleness (pair).

No new failure. Gate: PASS with the standing 5.

## Adoption closeout — Lane A 2345Z occurrence (playtest-loop-a-20261124T0105Z)

**Adopted the timed-out r157 run.** The r157 run timed out ~00:41Z at its
post-commit rebase; its worktree (`journey-landing`, branch
`journey-landing`, commit `e7e3130ea`) survived unmerged, rotation-a
still 0, lock already absent (main-session check). This occurrence
adopted it per the r157 timeout note's direction.

**Stale-run verification (before touching anything):** registry heartbeat
for `journey-landing` was `2026-11-24T00:27:42Z` — 40+ min stale at
adoption start, no live coordinator (the r157 run's 2h timeout had
killed it). No playtest lock existed; created
`playtest-loop-a-20261124T0105Z` (01:07:34Z). Pre-flight: main tree
clean (tracked status empty + zero untracked — the 0215Z round record
that blocked the 23:45 run is now committed as `8a032676f`), disk 48%,
`git fetch origin` shows origin/master = local master at adoption start.

**Machine restart ~01:31Z (uptime 1 min):** killed the second rebase
attempt mid-flight. Verified no effect: worktree HEAD still
`e7e3130ea`, no rebase state, rebase log empty (the attempt never got
past the slow index phase). Heartbeat loop restarted detached after the
restart (pid 1755, 5-min cadence); writes probed OK throughout the
adoption — no flap window active during adoption work (window 22 had
cleared ~00:49Z).

**Rebase blocker — stale index.lock:** three rebase attempts failed
identically at `could not detach HEAD` with `Unable to create
'.../.git/worktrees/journey-landing/index.lock': File exists`. Root
cause: a stale `index.lock` dated **00:28Z**, left by the r157 run
itself when it died mid-operation. Verified no live git process held
it (no git process in the worktree; the lock predates the restart by
an hour), removed it per git's own recovery instruction, and the
rebase then succeeded on the first try.

**Master moved during the adoption:** Lane B's journey-social r277
finisher landed 3 commits (`2b2239237`, `aa0e9ec6e`, `287ee67f4`,
`f0398bba6`) between the fetch and the rebase. Rebased onto the new
tip `f0398bba6` (not the stale `f5d2c3caa`). Overlap check: the r277
delta touches 15 files (journey-social evidence/scripts only) — zero
overlap with the r157 files. Rebase replayed the single pick cleanly:
`5d3004abd` on `f0398bba6`. Fidelity verified: `git diff e7e3130ea
5d3004abd -- <all six r157 files>` is empty — byte-identical content.

**Proofs re-run on the rebased tip (independent verification, not the
run's word):** r157 proof test 28/28, r156 proof test 23/23, panel
corpus 152 files in `landing-r157-after/` — all match the run note.

**Gate on the rebased tip:** `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r157-adopt-gate`, **339 passed, 5
failed in 614s** — the exact standing-5 from r157's gate (same test
names, same causes): phone-frame-proof (stale receipt), living-garden
+ one-person-army deed-attainment (both TIMEOUT 120s in-gate, both
**green standalone, exit 0** — load artifacts, re-verified this run),
measurement-proof-update + measurement-workflow (staleness pair).
**0 attributable to the r157 fix** (the fix touches only
`src/js/convo-wants.js`; no failing test is in the conversation/favor
area). Gate: PASS.

**Closeout:** merged `journey-landing` ff-only into master, worktree
released + branch deleted, rotation-a advanced 0→1, lock deleted in
the same call as its read (run_id matched). Merged locally, pending
ship. No version bump, no push — the ship loop owns those.
