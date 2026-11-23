# Journey landing r156 — leg 0 LANDING (days 1–14 judged, horizon d28)

Run `playtest-20261123T0545Z`, scheduled Mon 2026-11-23 05:45 CST. Lane A leg 0.
Base master `fdd7042b8` (batch ship `db2e9a3df-20261123-112449`). Lock
`playtest-loop.lock` run_id `playtest-20261123T0545Z`, created
2026-11-23T11:48:09Z. Rotation read `0` → write `0→1` at closeout.
Worktree `~/workspace/worktrees/journey-landing`, branch `journey-landing`.
Heartbeat via setsid nohup hbloop, 10-min cadence (registry field
`heartbeat_at`).

**Write flap 11:49–11:56Z:** first registration failed mid-checkout
("unable to write file", "Could not reset index file to revision 'HEAD'");
probe `git update-ref refs/heads/probe HEAD` FAILED 11:53Z and 11:54Z, OK
11:56:05Z. Retried registration succeeded; branch already existed from the
failed attempt and the register script attached to it. Nothing lost.

**Pre-flight:** main tree clean (verified via `git status --porcelain
--untracked-files=no` + `git ls-files --others` + `git diff --stat`, all
empty — the full `git status --short` hung 4+ min under sibling load).
Disk 47%. `git pull --ff-only`: already up to date.
`worktree-reap.sh` skipped (registry lock held by a sibling reaper).
10 stashes present — never dropped.

## Prereg summary

`evidence/2026-11-23/journey-landing-r156-prereg.md`. Seeds fresh **1372–1381**
(freshness grep found only incidental hits). DAYCAP=28, pilot seeds 1372–1375.
Policy: r154 control verbatim.

**The blank this run fills — M-PR1 commit-menu defect (r155 filed):** on seed
1370, Lucas (d10) and Lena (d11) asked plainly to forage together tomorrow
and the player was never offered any way to say yes; the favor hung and the
outing never happened. M-PR1 went NO-GO on r155 (4/20 = 20% > 15%).

**Metric-review decisions made BEFORE this run (prereg §14):** (1) M-PR1
settled-counting DECIDED — settled established sittings do NOT count as
never-offered (adopt the R122 analyzer exclusion; r155 read 2/20 = 10% under
it vs 20% under the r154 hand count). (2) d14 snapshot keyed on game day
(`gd >= 14`), not `series.length === 14`. (3) silentTurns/dry-line bars
restated as proxies: 0 empty THEM lines, nodloop LOOP=0, mimeShown=0.
(4) r267/r268 watches (topic2Ask, LAUNCHVOICE) DROPPED as uninstrumented;
mechanisms carried by their own proof tests. (5) Contest endDay ≤ d29
possible on a d28 horizon. (6) Carried r154/r155 metric-review items 1–8
unchanged.

**Base delta vs r155 base `895f7a6ee`** (src/js, 7 files): r268 Arm B
convoLiveBeat resume-pick dry fall-through; r272 GONE-BEARER;
sim-homebody-metric-a handoff (villager-agency.js); sim-wornstack-equip-a;
sim-gateavoid-b durable log; version bump only.

## Panel

Driver `scripts/journey-landing-r156-20261123.js` (seeds 1372–1381, OUTDIR
`hidden_files/evidence/2026-11-23/landing-r156-after`, d14 snapshot fix
`if (!ctx._winPlanD14 && gd >= 14)`). DAYS passed explicitly as 28 (default
is 14 — the r155 mis-run lesson). Analyzers
`evidence/2026-11-23/journey-landing-r156-analyzers.sh` (15 analyzers).

- **Pilot:** exit 0, seeds 1372–1375, systemDay=8 on all, over=no, d14
  winplan snapshots SET on all 4 (instrument fix works; r155's void run had
  9/10 null), 0 error lines, census rows present.
- **Panel:** exit 0, all 10 seeds (spawns: Arturo, Diego, Sergio, Rebecca,
  Cameron, Joseph, Miguel, Emily, Jordan, Lamar), systemDay=8 on all,
  over=no everywhere, 164 files in corpus. Log:
  `hidden_files/journey-landing-r156-panel.log`.
- **Analyzers:** 15/15 exit 0, 1795 lines. Log:
  `hidden_files/journey-landing-r156-analyzers.log`.

| seed | spawn | systemDay | over | villager deaths | pantry/person d28 |
|---|---|---|---|---|---|
| 1372 | Arturo | 8 | no | Emily d18 monster | 5,045 |
| 1373 | Diego | 8 | no | — | 4,532 |
| 1374 | Sergio | 8 | no | Jovan d17 ambush | 4,363 |
| 1375 | Rebecca | 8 | no | — | 3,063 |
| 1376 | Cameron | 8 | no | Elena d10 ambush, Sigrun d18 ambush | 564 |
| 1377 | Joseph | 8 | no | Henry d22 The Ugly Beast | 2,776 |
| 1378 | Miguel | 8 | no | Jamal d26 monster | 10,027 |
| 1379 | Emily | 8 | no | — | 3,254 |
| 1380 | Jordan | 8 | no | Dietmar d18 monster | 8,214 |
| 1381 | Lamar | 8 | no | Mateo d14 ambush, Necla d28 monster | 2,630 |

All villager deaths REGISTERED (census). Scholar deaths 0. Contests: fired
22, ended 19, open at horizon 3 (1373 moot, 1375 pantry_raid, 1380
gauntlet), outcomes won 17 / lost 2. Monster kills 415 (huntpractice
count). Fights 14, all with known triggers.

## Q1 adjudication — GO

- **M1 ALIVE-D14: PASS** — 10/10 alive at d28.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9 (systemDay 8 on all seeds).
- **M3 FIGHT-LOG: PASS** — 0 unknown triggers (14 fights: feastFightRoad 3,
  driveContestsImpl 6, contestArena 3, monsterTurn 2).
- **Zero-DMG refused-turns: PASS (BINDS)** — 0. Raw zero-DMG 1/14 fights:
  1377 d19, S-struck-0-dmg, others-killed (scholar struck twice at a flying
  Static Kite with a Sharpened stick — "It's high overhead — out of
  Sharpened stick reach", honestly narrated; allies Benoit + Halil killed
  it; scholar moved twice, took 0 damage, fight won). stoodThroughByChoice
  0; refusedTurnsAllFights 0. Scholar-turn verbs: wait 0, move 17, barrier
  0, ability 0; fightsWithVerbData 8. Move-refusals: 17 moves, 0 failed,
  0 movedLie, stuckFights 0.
- **Practice: PASS** — movedCells d1→d28 = 92 (bar ≥50), seedsWithMove
  10/10, skill0→pos 54, practiceReps 3006. By task: wood 30, stone 30,
  water 17, cook 8, deadfall 6, forage 1, hunt 0. Huntpractice
  H0-ESTABLISHED (huntReps 21, huntMax 7, huntVillagers>0 12, huntMoves 0
  — first rung out of reach in 28d).
- **Pocket: PASS (BINDS)** — 0 pocket fights, stuckTurns 0.
- **D1: PASS** — 0 garbled-label renders.
- **HEED: legacy 0, HEED-V: PASS (BINDS)** — 0. WARNED-BUT-UNRESOLVED 0.
  D2 verbatim warning repeats 0. D3 0. All 5 warn_you sittings end
  resolution=heeded (1372 d17, 1374 d12/d13/d14, 1381 d12) and all 5 name
  the danger (see People check). Note: the legacy HEED counter reads 0
  while 5 heeded sittings exist in the transcripts — the counter keys on
  a marker this shape doesn't emit; HEED-V (binding) is 0 and the
  substance is verified by reading. See Metric review item 7.
- **M-PR1: PASS — 1/27 = 3.7% ≤ 15% bar (decided rule).** R107
  commit-offer: sittings=31, offered=24, picked=24, promised=18,
  statedAfterPick=6, neverOffered=5, settled=2. Established = 31 − 4
  unestablished = 27. Never-offered among established (settled excluded
  per the decided R122 rule) = 1: 1375 d26 (Landon) — see The blank,
  residual shape. Raw analyzer rate 5/31 = 16.1% (watch); max per-seed
  never-offered 1 (1375). The 6 statedAfterPick are all honest away-guard
  refusals ("I'm away from Haven right now, out on the road… find me when
  I'm back"), each naming the remedy. The 2 settled sittings (1374 d7,
  1381 d7) speak the engine's own settled lines ("we got it handled.
  Thanks anyway.", "All sorted. Some things just work out."). The 4
  unestablished sittings (1372 d6, 1373 d14, 1379 d12/d13) never surface
  the favor — the sitting is about something else (linkraise + betrayal
  case on 1373 d14) and the want stays stage 0; correctly excluded.
- **Bridges: PASS** — 0 repeats in every pool. Personal 14 servings, grief
  0, village 6, plans 4, small 11. (Grief served 0 times this panel —
  no grief bridge was offered; the pool exists, it just never fired.)
- **R66 HUNGRY: NOT-HUNGRY** — starvationDeaths 0, slideSeeds 0,
  bandSeeds 5, noSlideSeeds 5. Hungry-at-horizon 1/10 (seed 1376,
  564/person — the r58 one-seed outlier shape, watch continues).
  All other seeds FED (2,630–10,027/person).
- **Scholar deaths: PASS (≤2)** — 0 on the panel.
- **silentTurns / dry lines (restated proxies, adopted bars): PASS** —
  0 empty THEM lines in the corpus, nodloop LOOP=0, mimeShown=0.
  Nodloop: 144 sittings, 6 NV.
- **Q1 panel watch (resume-takes re-pose): UNMEASURED** — no instrument
  output in the analyzers log or any census JSON (no resume-take count,
  no verbatimRepeat lines). Reported as unmeasured, not passed. See
  Metric review item 8.
- **Other watches (corpus greps + transcript reads):** Miriam line 0
  "That's settled"; deflect-fallback 0 `fellBack`; confide 0 "This stays
  between us" (UNTESTED — no confide fired); volley errors 0 ('v is not
  defined', volley error) and no volley fired, so ammo-name UNTESTED;
  COUNTER LEARNED lines 18, all with specific guarded labels (e.g.
  "Drum-Belly: Strike the taut drum…", "the humming in the grass: Bellow
  at the choir…") — PASS. Warn-heed 5/5 name the danger — PASS.
  Namebeast told-watch: same-day tell→name pairs 56/56 name the told
  beast — PASS (see People check for the day-late lag note).
  Settled-reask / broken-favor: no sitting pressed the pick — UNTESTED
  (as on r154/r155); the `[alive:memory:promise_broken]` option was
  offered once, picked 0 times. FIGHTALLY2: one two-ally fight (1377
  d19, contest-arena), ends won, scholar struck twice at 0 dmg (flying
  kite out of melee reach) — not stuck, not stood-through; the
  failure shape (scholar passive while allies carry) does not occur.
  Door-flee: 0 fled fights (fled=None on all 14 fights) — the single
  fledBadLog entry (1380 d26) is a legacy-outmatched probe sample for a
  fight the scholar WON (The Terms of Service, wave 3, 367 HP — fought
  and won with 2 allies, FEASTED ×2.03 strike for 87). Homeward: no
  scholar stranded homeward 2+ days. Downed-ally: none. Owed-walk: no
  accepted invitation vetoed by illness. React wind-down: no `dlg:react`
  at reactDryCount ≥2 (no reactDryCount marker in the corpus), no ≥3
  identical react streak; WIND-DOWN MORE GO 12/12; WD probe GATE-A/B GO.
  Deduped-vs-silent: no truly-silent refused move. Link-accept: every
  accepted link-raise ends with a voiced accept line, never the player's
  choice label verbatim — PASS; variety is thin (2 templates: "Good —
  the word on them is kind. Go and ask." / "Good. What I've heard of
  them, I believe. Go and ask.", destination village varies:
  Thornfield / Emberhold / Stonebridge). Link-opener: no verbatim
  repeat streak; openers vary by village and line. Profilegate/PLANWAKE:
  d14 planSeeds>0 on 10/10 (hold watch ≥8/10) — HOLDS. Reseed-beat:
  planReseeds 0 on all seeds — none fired. 1130-d6 amnesia shape: 0
  recurrences. "the the" doubling: 0 anywhere in the corpus.
- **Q1 overall: GO.** Every binding bar passes. M-PR1 is 1/27 = 3.7%
  under the decided settled-exclusion rule.

## The blank — M-PR1 commit-menu defect (FILLED this run)

**What was wrong, in plain words:** twice on one village (r155 seed 1370),
someone asked the player plainly to go foraging with them tomorrow and the
player was never offered any way to say yes. The menu never offered "I'll
come back to help." The favor just hung and the outing never happened.

**Mechanism pinned (r155 transcript + code trace):** both sittings opened on
a GRIEF beat, so `convoOpening` returns `thread: 'grief'`. The player picks
[dlg:help]; `engageBeat` states the ask and `convoWantEngage` moves the want
to stage 2 with the favor attached in state `'asked'` — but nothing moved
`c.thread` to `'want'` (`convoWantEngage` was a pure stage transition).
Next menu: `convoWantMenu` returns [] on its thread-coherence gate
(`c.thread !== 'want' && !== 'small'`, convo-wants.js:3084), so the commit
menu never builds; `beatMenuResponses` also drops [dlg:more] because grief
is a no-followup thread, leaving no path to the want at all.

**Fix (this run, in the worktree):** in `convoWantEngage(vid, 'engage')`
in `src/js/convo-wants.js`, when the stage advances to 2, set
`c.thread = 'want'`, with an r156 comment. One place; guarded callers
already engage only on want/small threads, so the only behavioral change
is for pre-empted openers. Diff: 14 insertions, 1 deletion.

**Proof test — RED then GREEN:**
`scripts/test-landing-r156-commit-menu-20261123.js` (godpath lib pattern,
seed 156100). Staging: drain pantry to 0 kcal (at haven the villager's
belief reads the live pantry, so the forage_help need is genuinely live);
repeat-meeting staging (`convoGet(vid).count = 2` — first meetings are
curiosity-led by design); capture the ask_favor def from a natural sitting;
plant the panel-observed state (stage-0 ask_favor, thread `'grief'`).
On old code: 19 passed / 4 failed — the 4 fix assertions failed with the
exact panel menu shape (`dlg:react,recap,dlg:subject,leave,silence`),
thread stayed `'grief'`, `convoWantMenu` returned []. Control (thread
`'small'`) passed on old code. On fixed code: **23 passed, 0 failed**
(grief-thread engage → commit offered; small-thread control; unit
`convoWantEngage('engage')` moves a grief thread to `'want'`).

**Panel as proof:** M-PR1 1/27 = 3.7% (was 4/20 = 20% on r155 under the
old counting; 2/20 = 10% under the decided rule). The fix works for the
filed defect: the grief-thread shape does not recur on this panel — no
never-offered sitting opens on grief. The promised control shape is alive
and well: 18 promised sittings, including 1377 d28 (Panom, request-thread
opener, [dlg:commit] picked → "Good — The bitter manioc patch past the
treeline, dawn. Bring the big pack if you have it." → promised).

**Residual shape — filed for r157 (one sitting, 1/27):** 1375 d26 (Landon)
is the same player-facing shape via a different route, and the fix does
NOT cover it. The favor was already established from an earlier sitting,
so [dlg:help] takes engageBeat's favor-followup path, which sets
`c.want.stage = 2` directly (convo-wants.js ~697, "the menu goes straight
to commit/deflect (stage 2)"). The r156 flip lives inside
`convoWantEngage`'s `stage < 2` guard, so when it runs a moment later the
stage is already 2 and the flip is skipped — the thread stays `'request'`
(driver preThread reads confirm `c.thread === 'request'` at every
[dlg:more] pick). The request-thread [dlg:more] depth path delivers the
favor's depth lines ("Another day like today and we're choosing who eats…",
"The pantry run isn't going away — I need help.") but never flips the
thread either (unlike the deferred-opener path, which does — see the Panom
contrast below), so `convoWantMenu`'s coherence gate stays closed for the
whole sitting and the commit menu never appears. Landon asks, the player
asks for more four times, hears the whole depth ("That's... pretty much
all of it, honestly."), winds down ("I should go. You know where to find
me."), and the favor ends 'stated' with no way to say yes. Fix shape for
r157: move the thread flip out of the `stage < 2` guard (flip whenever
engage lands at stage 2), or flip in the favor-followup branch of
engageBeat. Proof: extend the r156 proof test with a pre-established-favor
+ request-thread staging. One blank per run holds — this is filed, not
fixed here.

**Contrast — the rescue path working (1377 d28, Panom):** same request-thread
opening ("Come get air with me. I need to think out loud."), same
favor-followup engage ("About the pantry run — I hate to ask twice, but
it's still open. Will you?"), same [dlg:more] depth beat on thread=request
— but there the [dlg:more] pick takes the deferred-opener path, which flips
the thread to `'want'` (depth summary: threadsPursued=[request,want]), and
the next menu offers the favor menu with [dlg:commit], picked → promised
("favor promised: forage with Panom tomorrow to rebuild the pantry"). The
difference is which [dlg:more] path runs: deferred-opener flips, depth
doesn't. That is exactly what r157's fix must close.

## Carried investigation item — contest death leaves the ledger open (NOT reproduced this panel)

r155 CONFIRMED: a contest ending by participant death never emits
`contest_end`, so the ledger's endDay stays null (seed 1364, duel, scholar
Tanya died d27, ledger endDay=null at horizon). Proposed fix shape:
emit `contest_end` from `_contestDie` (one line, mirroring `_contestEnd`),
with a proof test driving a contest to a death. On THIS panel the item
does not reproduce: no death-ended contest occurred (contestDeathAutopsies
are all monster-combat deaths with contestId null; deathsWithContext=0,
deathsMissing=0; the 3 open contests are 1373 moot, 1375 pantry_raid,
1380 gauntlet — all still open at the horizon, none death-ended). The
item stays filed for a builder arm with its exact one-line fix shape; the
ledger GO holds (22 fired, 19 ended, 3 open-at-horizon, all accounted).

## People check — do villagers act like people?

Read in full: 1375 d26 (Landon, ask_favor — the residual), 1372 d17 (Nikos,
warn_you — heeded), 1377 d7 (Sofia, ask_favor — away-guard refusal),
1373 d14 (Desmond, ask_favor — unestablished), 1377 d28 (Panom, ask_favor —
promised). Grep-checked: link-accept follow lines, COUNTER LEARNED labels,
tell/name pairs, warn_you resolutions, settled lines.

- **1372 d17 Nikos, warn_you (heeded — the quoted moment):** Nikos warns,
  the player heeds three times, and the conversation earns its ending:
  "Promise me that. Please." → "Last night I laid awake listening. Every
  sound was you not coming back. Please. Just — come back." A person
  afraid for someone, not a warning dispenser. The danger is named
  ("the treeline at dusk. Don't."), the want resolves 'heeded', and the
  sitting flows into a naming debate (Teresa calls it "Big Loud"). This
  is the standard the dialogue is judged against, and it meets it.
- **1377 d7 Sofia, ask_favor (away-guard refusal, honest):** the opening
  menu offers [dlg:commit] immediately ("We're eating through stores
  faster than we replace them. Come forage with me tomorrow — two of us
  can fill packs."). The player commits; Sofia refuses with a reason and
  a remedy: "Wait — I'm away from Haven right now, out on the road. I
  can't promise a dawn meet from out here — find me when I'm back and
  we'll set it then." Resolution 'stated', favor stays open. All six
  statedAfterPick sittings on the panel are this shape — the commit was
  offered, the refusal is specific and names what to do instead.
- **1373 d14 Desmond, ask_favor (unestablished, honest):** the sitting is
  about the Thornfield link and the ambush of Aki — the player accepts
  the link, declines the betrayal invite, asks about something else, and
  leaves. The favor never surfaces; the want stays stage 0. Nothing is
  promised that wasn't asked, nothing asked is left hanging — the sitting
  simply went elsewhere. Correctly excluded from M-PR1.
- **1377 d28 Panom, ask_favor (promised — the fix's rescue path):** see
  The blank above. The commit menu appears, the player picks it, Panom
  answers with a concrete plan (bitter manioc patch past the treeline,
  dawn, big pack). A favor asked, a favor taken. This is what the r155
  defect denied.
- **1375 d26 Landon, ask_favor (the residual):** see The blank above. The
  writing is fine — Landon reads as a person who needs help and keeps
  saying so four different ways. The menu is the defect: no way to say
  yes, ever. One sitting in 27.
- **Naming debates:** 56 same-day tell→name pairs, all 56 name the told
  beast (verified by description match). The haven argues: "The Ugly
  Beast" (Teresa, Arnold, Duc, Emily, Elijah) vs "Big-Eyes" vs "The Loud
  Beast" — a village arguing about a name is a village alive. One
  day-late lag: 1372 d12 Lena tells about "a clipboard. a bullhorn. a
  sense of grievance." and the vote names it on d13 — the debate needs
  three knowers and the tell adds one, so it formed overnight; the d13
  vote opens the RIGHT beast (the r152 defect — opening a different
  beast — does not occur anywhere on the panel). Four other told beasts
  (1372 d8 humming, 1373 d7 displaced water, 1378 d8 drumbeat, 1376 d17
  heron) get no player naming vote inside the 28d window — whether their
  debates kicked and resolved via NPC convergence is not in the census;
  see Metric review item 9. Minor text nit, same sitting: the d12 tell
  line reads "a sense of grievance.." with a doubled full stop.
- **Link-accept:** every accepted link-raise ends with a voiced accept
  line naming the village (Thornfield / Emberhold / Stonebridge). The
  two templates repeat across villages — the same sentence from three
  different people (also true of the heed-beat line "the treeline at
  dusk. Don't.", spoken verbatim in 3 of the 5 heeded sittings). Reads
  fine each time; the pool is thin. Variety note, not a defect.
- **Q1b deflect (12th carry):** no deflect sitting fired this run
  (0 [dlg:subject] picks across the warn_you sittings; 10 [dlg:heed]
  picks). Remains a design question (how forcefully a pending warning
  re-asserts itself); no fix unless a deflect sitting shows a new defect
  shape — else document and carry.

## Village assessment (plain words)

Ten villages, all alive at day 28. Nobody starved. Food is comfortable
almost everywhere — pantries run 2,630 to 10,027 kcal per person at the
horizon — except seed 1376, which is thin (564 per person) after losing
two people to ambushes. The villages are planning from the first week:
every one of them has people holding a plan by day 14 (41 holders across
the panel), and by day 28 they've fought 441 party fights on 135
departures. People are learning to work the land (92 practice moves, wood
and stone leading), testing monster meat and finding it edible (the flesh
channel opens on 9 of 10 villages; seed 1378's arc is stuck at its horizon
of 59 with no exit — the one flesh miss), and holding joint outings that
bring food home (4 kept). Contests run and mostly resolve — 22 fired, 19
ended, 17 won. No scholar died; nine villagers died (ambushes, monsters,
one to The Ugly Beast) and every death is registered with a cause. What
the villages are NOT doing yet in 28 days: killing wave-4 beasts (0 on
the panel), mustering, or reaching the table. That is the landing leg's
horizon, not a verdict — the first fortnight is about surviving and
starting, and the starting is happening. The thin village (1376) is the
one to watch: it lost the most people and its pantry is the thinnest, the
same one-seed shape as r155's 1368.

## Dialogue watch (Q6)

- Topic-dwell: 144 sittings, 10 probe sittings, 123 subject picks, 69
  unknown-thread (probe-only). Dwell turns (probe): want 252, goal 49,
  personal 22, small 14, village 4. Trigger-capable topics: personal,
  want, small. No ask offered on grief/cheer/secret — grief served 0
  times this panel (the bridge pool exists but never fired; want
  dominates the dwell at 252 turns).
- Presshop: 76 attempts, pressFailTotal 1, togetherStopped 18,
  farUnreached 3, hopReached 15, detourReached 1.
- Outingchain: 44 favors, kept 4, broken 8, open 32; CHAIN-COMPLETES-FAR.
  Outing: askSeeds 10/10, waitSeeds 5/10, departSeeds 6/10, keptSeeds
  4/10, OUTING-GO. R73 window: promised=11, askedOnly=31, NARROW=11,
  keptInsideNarrow=4.
- Armor: seedOK 10/10, bark 10/10, craft 7/10, teleLineDisagree=0,
  ARMOR-GO. Party: offered 4, picks 4, spoken 4, dry 0, accepted 4,
  PARTY-GO. Labeling: 14/14 match, LABELING-GO. R94: waitDiagMissing 0.
- R84 kcal: arrivals 3/3 ALL-ARRIVED; R85 kcal rescue 3/3 RESCUE-GO;
  water UNTESTED. R88: EAT-GO 3/3; DOORSTEP-GO (1 triggered);
  ARMOR-SILENT 0; MAEVE qualified 0. WIND-DOWN MORE GO 12/12; WD PROBE
  GATE-A/B GO. BETRAYAL heldOffers=0. Succession: no holder deaths
  (VACUOUS). R106: prims>0 on 9 seeds, muster 0, beat4/5 0, wave4kills 0,
  table 0. R104 winplan: d14 planSeeds>0 on 10/10, holders d14=41,
  d28=36; partyFights 135 d14 / 441 d28; partyTrios=0.
- Contests (per-seed ledger): 1372 duel→20, honey→24, fetch→28; 1373
  guest→19, moot→open; 1374 beastmaster→23, drop→26; 1375 pit→16,
  wheel→20, moot→25, pantry_raid→open; 1376 beastmaster→20, pit→22;
  1377 pit→19, calorie_run→25; 1378 cache→23, whoate→28; 1379
  beastmaster→20; 1380 tithe→23, gauntlet→open; 1381 starve→23,
  fetch→25. (Outcomes: won 17, lost 2, open 3.)
- Villager deaths (census, all REGISTERED): 1372 Emily d18 monster;
  1374 Jovan d17 ambush; 1376 Elena d10 ambush, Sigrun d18 ambush;
  1377 Henry d22 The Ugly Beast; 1378 Jamal d26 monster; 1380 Dietmar
  d18 monster; 1381 Mateo d14 ambush, Necla d28 monster. 1373, 1375,
  1379: no villager deaths.

## Verdicts

- **Reachable:** yes. System contact by d9 on all 10 seeds; plans ignite
  by d14 on all 10; outings complete and keep; contests fire and resolve;
  the commit menu now appears where the favor is asked (18 promised).
  The landing leg's content is all reachable.
- **Fun:** yes, with one cut remaining. Conversations read as people —
  Nikos lying awake listening for the player, the naming debate, the
  link-accept with a voiced line, the away-guard refusal that names the
  remedy. The cut is the residual: one sitting in 27 where a villager
  asks for help and the player is given no way to say yes. It is the
  same cut as r155, narrowed to a single route and filed for r157.
- **Winnable:** not judged on this leg — no wave-4 kills in 28d is the
  landing horizon, not a winnability verdict. The chain beyond landing
  (wave-4 party kills → veterans → table) is Lane B's question. What this
  leg shows is the start of the chain working: plans ignite early and
  hold, parties fight 441 times, outings keep.
- **Q1 overall: GO.** M-PR1 1/27 = 3.7% under the decided rule; every
  other binding bar passes.

## Metric review (proposals, NOT adopted this run)

1. **M-PR1 residual shape (new):** the r156 fix covers the grief-thread
   route but not the pre-established-favor route (favor-followup sets
   stage=2 directly, skipping the `stage < 2` thread flip). Filed as
   r157's blank with the exact fix shape (move the flip out of the
   guard, or flip in the favor-followup branch) and proof-test extension.
   The M-PR1 bar itself needs no change; the residual is 1/27, well
   under it.
2. **Namebeast told-watch wording (new):** the clause "a told beast named
   a day late is a Q1 failure" needs pinning to the r152 defect (the
   vote opening a DIFFERENT beast) vs debate-formation lag (the right
   beast, named the next day because the debate needs three knowers and
   the tell adds one). This run adjudicates the watch on the pair check
   (56/56 name the told beast — the r152 defect absent) and records the
   one day-late vote (1372 d12→d13, right beast) as an investigation
   item, not a failure. If the clause is meant literally, r157 should
   say so and count it.
3. **Told-but-never-named beasts (new):** 4 told beasts get no player
   naming vote inside 28d (1372 d8, 1373 d7, 1378 d8, 1376 d17). Whether
   their debates kicked and resolved via NPC convergence is not in the
   census — add per-beast tell/kick/name days to the census (or a
   codex-monster summary) so "never named" can be adjudicated instead
   of guessed.
4. **FIGHTALLY2 wording (new):** "ends zero-DMG" should say "ends with
   the scholar contributing nothing (no strikes, no moves — the
   stood-through shape)" to match the v4 zero-DMG split. As written it
   would flag the 1377 d19 fight (scholar struck twice at 0 dmg vs a
   flying kite out of melee reach, fight won) — a combat story, not a
   failure.
5. **HEED legacy counter coverage (new):** the legacy HEED counter reads
   0 while 5 heeded sittings exist in the transcripts. The counter keys
   on a marker the current heed shape doesn't emit. Either wire the
   counter to the transcript's `resolution=heeded` or drop the legacy
   count and report HEED-V alone.
6. **Q1 panel watch (resume-takes) uninstrumented (new):** no
   resume-take count in the analyzers log or any census JSON. The watch
   needs an instrument (analyzer lines + census fields) or should be
   dropped from the prereg. Same class as r155's r267/r268 item, which
   was dropped.
7. **Stated-after-pick count at the "interesting if" line (new):**
   statedAfterPick=6 hits the prereg's ≥6 threshold exactly. All six
   are away-guard refusals (honest, remedy-naming). No action; note the
   count is at the line, not over it.
8. **Link-accept / heed-beat pool thinness (new, variety only):** the
   link-accept line has 2 templates and the heed-beat line ("the
   treeline at dusk. Don't.") is a single shared line spoken verbatim
   in 3 of 5 heeded sittings. No bar covers cross-seed pool reuse; D2
   reads 0. A pool-variety watch (distinct lines per pool per panel)
   would catch this class.
9. **Carried r155 items 1–6** (d14 snapshot fragility — FIXED this run
   by the game-day keying, verified: 10/10 snapshots set; M-PR1
   settled-counting — DECIDED this run, see prereg §14; r267/r268
   watches uninstrumented — DROPPED this run; silentTurns / dry-line
   bars uninstrumented — RESTATED as proxies this run; contest endDay
   past horizon — noted, endDay ≤ d29 possible; carried r154 items
   1–8) — unchanged except as noted, see the prereg.

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r156-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**quiet (10 files, 5 metrics, no large deviations).** No LOUD lines, no
investigation needed, baseline NOT re-pinned. Panel values for the
record: monsterKills 415 (baseline 411), villagerDeaths 9 (baseline 10),
starvationDeaths 0. The monsterKills +89% rise that r155 explained as
activity (not lethality) has leveled: 411 → 415 on the same activity
base (partyFights 424 → 441).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r156-gate`
on the rebased tip (`4cd566b21`, on master `7ade8d3bf`): **339 passed,
5 failed in 691s** (log `hidden_files/journey-landing-r156-gate.log`).
The 5 failures are exactly the standing 5, none attributable to this
run's change (a 14-line menu-routing fix + evidence + tooling):
phone-frame stale receipt (`test-phone-frame-proof.js`), two 120s
deed-attainment timeouts (`test-living-garden-deed-attainment.js`,
`test-one-person-army-deed-attainment.js`), measurement-proof staleness
pair (`test-measurement-proof-update.js`,
`test-measurement-workflow.js` — failing identically on r155's
evidence-only run and on r151/r152, i.e. pre-existing staleness, not
newly caused by this change). Gate verdict: PASS on the standing-5
basis. Proof test re-run on the rebased tip before the gate: 23/23
(`scripts/test-landing-r156-commit-menu-20261123.js`).
