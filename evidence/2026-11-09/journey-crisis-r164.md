# Journey crisis r164 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start (written by the r163-social
closeout; the r156 closeout's 7-write was superseded by r163's later
6-write — the file is the authority); this run writes 7 (succession
next) at closeout. Run r164 follows crisis r156 (landed 2026-11-08/09).
Base: master 2215e22d4 (r117 establishment adoption closeout). Prereg:
goal hidden_files/evidence/2026-11-09/journey-crisis-r164-prereg.md
(seeds 14101–14105, fresh band, verified). Policy oracleV2, 120d
death-aware +10d tail. 5-seed panel, sequential — no pilot gate (the
5-seed panel IS the minimum Q1 instrument per r155's metric review via
r156). Driver scripts/journey-crisis-r164-delayed-20261109.js, analyzer
scripts/analyze-crisis-r164-delayed-20261109.js (r156 verbatim except
r164 names/seeds/labels + Q1 missed-window split + Q2 medic-duty census
with live holder, spans, stash pharmacy).

## PRE-FLIGHT / INFRASTRUCTURE

- No lock at run start (r163's closeout deleted it); new lock
  2026-11-09T17:55:36Z written. Main tree clean, disk 29%.
- `git pull --ff-only` FAILED (standing divergence — local master ahead
  262, behind 156 vs origin/master; Steve's Cursor PRs #118–#121 pushed
  directly to GitHub master, bypassing the ship loop; ship blocked 4
  times, Steve's reconciliation answer still pending since Nov 8).
  Proceeded on local master per the loop body's procedure (r156
  adoption precedent), reported LOUDLY. No push, no bump — the ship
  loop owns reconciliation.
- Worktree journey2-crisis registered 17:59:31Z, heartbeated 18:08:11Z
  and 18:22:36Z (standing <15min rule; the C3 read ran long between
  heartbeats — noted, not repeated).

## BASE MOVEMENT (since r156)

Master db7fb1c6a → 2215e22d4 (106 commits). Game-code changes (src/, 8
files): conversation.js +122 (r156 no-words fix itself, r163 coach
prior-deflect fix, r120 secret-response fix); convo-wants.js +16;
fieldFights.js +51 (fightblend numerator-aware); food.js +22; game.js
+86 (wideduty, sametick, tenddrive re-apply, r121 first-reveal guard);
progression.js +23; truth.js +18; villager-agency.js +15. NOT a pure
re-measurement — cross-panel deltas are confounded; the panel judges
the current base on its own bars. Canon read: docs/CANON.md +
docs/DISEASES.md (two pools; medic-duty cures are mundane medicine for
mundane disease — no canon conflict).

## INSTRUMENT VALIDATION (before any scored seed)

- Analyzer validated on r156's post-fix JSONs: attempts 21, ok 19,
  refused 2, corrected 18, per-day 11, C7b buried lists per seed — all
  reproduce exactly. NEW split reproduces the r156 hand-tally:
  valve-expiry 12 / drawn-off 6, plus per-day 5 / 6 (new information:
  the 13903-d96 four-set day was valve-expiry).
- Smoke: SEED=14101 DAYS=5, exit 0, no instrumentErrors; medicDuty
  live-holder read works (holderId gen_334vucq, rawField matches,
  spans recorded, stashMedicine {} at d5).
- Determinism proof: seed 14101 re-run BYTE-IDENTICAL JSON.
  Instrument is trajectory-neutral. Panel judged.
- Panel speed note: 5 seeds ran in ~90s (r156 took ~11 min). All 5
  reached the full 120d horizon with plausible counts (raids 5–10,
  sorties 3–6, convos 7–8, JSONs 1.5–1.9MB); the determinism proof
  and the analyzer's sanity counts rule out a truncated run. Most
  likely explanation is CPU contention during r156's run (many
  sibling loops live then); recorded, not investigated further.

## PANEL (judged)

Seeds 14101–14105, oracleV2, 120d +10d tail. Ran 18:13–18:15Z.
instrumentErrors [] on all 5 seeds. Per-seed .err files carry only the
benign retired-feastBurn notice.

| seed | days | end | raids | gorge | sorties | convos | alive | pantry |
|------|------|-----|-------|-------|---------|--------|-------|--------|
| 14101 | 120 | horizon | 9 | 48 | 3 | 8 | 9 | 9161 |
| 14102 | 120 | horizon | 5 | 13 | 3 | 7 | 8 | 3944 |
| 14103 | 120 | horizon | 10 | 12 | 6 | 8 | 3 | 200 |
| 14104 | 120 | horizon | 9 | 22 | 5 | 8 | 5 | 0 |
| 14105 | 120 | horizon | 8 | 13 | 4 | 8 | 6 | 0 |

Attempts 21, ok 17, refused 4, cleared(remaining0) 7, deltaExact 17,
deltaBad []. Gorge nights 108, gorgeKcal 122,721. Convos 39,
fabricHits 0. Sortie fights 27. D1 delayed>=3: 21/21. D2 clear rate
ok 7/17. D3 drift unknown []. Missed-window corrected 4, per-day 3
— SPLIT (new): valve-expiry 2 / per-day 1, drawn-off 2 / per-day 2.
C7b buried: 14101 Victor Zhang / Vivian; 14102 Rosa Dubois / Mario
Llosa / Theo Vega; 14103 Elias Brown / Nancy Weinstein / Oscar;
14104 none; 14105 Silas. G-ID watch: 14th panel at zero id-matched
gorge-after-clear (name-matched 3). WRAP: 39 transcripts, 39 marked,
unmarked 0 (36 engine-ended, 2 driver-cap break — both long good
conversations, 12 turns, not loops; 1 refused/ended). SOFTLOCK: 0
seeds. BENCH (watch): 4 refusals, ALL gate-one-short
(musterAvailable 1, livingBesidesPlayer 2) — and ALL 4 are ALIVE-bench
(first panel with alive-bench data; see below). W1: no same-set
re-musters, no ok sorties / full clears after a refusal — count stays
66/4/4/1. Fight-1: okSorties 17, brokeAfterFight1 4, cleared 13;
clearedOpeners {mFlee:7, vKill:6}, brokeAfter1Openers {vFlee:4};
broke vTaken [45,89,8,41], cleared vTaken [12,23,25,25,19,2,27,40,
26,30,36,48,22]. Multi-monster set clear 8/10. R59 TRUE early count 0.
Phoenix burns 0 everywhere. Q10 leader-death gap: does NOT recur (no
vDie in any sortie fight; deathsDuring all []). D3 drift labels:
player-drawn-off 28, sortie-clear 17, moved-on-valve 20, unknown 0.

MEDIC DUTY census (new instrument — live holder + spans + stash):
- 14101: holder David (d69–122); spans Vivian d5–68, Patrick d20–65,
  David d69–122 (duty passes between eligible villagers — overlapping
  spans are real handoffs, not an instrument bug); blocked 91, cures
  ability 13 / medicine 0, stash {}.
- 14102: holder Valeria (d107–122); spans Chantal d3–105, Valeria
  d107–122; blocked 108, cures 17/0, stash {}.
- 14103: holder Oliver (d56–122, the ONLY holder all run — no holder
  before d56); blocked 43, cures 2/0, stash {}.
- 14104: holder Omar (d120–122); spans Clarence d3–11, Elif d13–117,
  Omar d120–122; blocked 99, cures 9/0, stash {}.
- 14105: holder Ingrid (d83–121); spans Cormac d2–36, Nora d38–81,
  Ingrid d83–121; blocked 95, cures 16/0, stash {}.
- Live holder == raw field on all 5 seeds (the r156 stale-field case
  does not recur). No holder died on a sortie (canary clear).
  Medicine cures 0/5 with the pharmacy EMPTY at census on 5/5 seeds
  — the 0 is now ATTRIBUTED: the channel is starved of supply, not
  broken (caveat: census-time stash only; medicine could have been
  present and spent mid-run — but 5/5 empty at census + 0 cures
  across the panel is a supply story, not a channel story).

## VILLAGE ASSESSMENT (plain words)

Five villages, 120 days each, played by a competent bot that forages,
waits, drinks, answers every lingerer set with a sortie, and talks to
whoever is standing by the fire. **All five reached the horizon** —
the first 5/5 panel in the crisis leg's recent sequence (r156: 2/5).
31 of roughly 70 starters alive at the end (r156: 8). The villages
held: no game-overs, no scattering, no famine deaths at all (one
starvation corpse, Ella d117 on 14103; the rest of the dying was
thirst and the wild).

- 14101 (Seattle), 120 days, horizon, 9 alive. The richest village
  (pantry 9,161) and the busiest gorge (48 nights). Amara's arc
  carries it: the staying question ("I asked Victor about whether
  you're staying — Victor's gone"), the naming debate, the thread
  that resumes days later. Patrick refuses to re-confess ("I
  confessed that already. I'm not confessing it twice for dramatic
  effect.") and mourns Darius ("I dreamed Darius was still here.
  Woke up angry at the dream."). Vivian, the first medic holder,
  spends d8 sick and asking the PLAYER for help. Fatima teaches five
  plants in one sitting and begs a water haul with real math
  ("0 liters, 10 people").
- 14102 (Boston), 120 days, horizon, 8 alive. Lusiana's three
  no-words sittings — real Indonesian with glosses the player
  catches ('Benar' — correct, 'Terima kasih' — thank you, 'Tepat' —
  spot-on), zero fallbacks. The ambush of Rafael is investigated to
  exhaustion ("either it's true, or it's been rehearsed a lot.
  There's nothing more to press here.") while the site and witness
  beats return nothing. Chantal, hungry ("My stomach's been empty
  so long I've stopped feeling it"), takes the player to a hollow
  and dodges a confrontation ("It's... it's complicated. Can we not
  do this right now?"). Two thirst deaths (Nina, Hassan).
- 14103 (Austin), 120 days, horizon, 3 alive. The hardest village:
  no medic holder for the first 55 days, the d113–115 unanswered
  refusals (one fighter short, three days running, while "The Ugly
  Beast" and "The Algorithm" lingered). Oscar's five-sitting arc —
  refusals ("Alone's how I stay alive"), mourning Liam ("Liam owed
  me a favor. I keep thinking about collecting. Stupid.") and
  Michael ("the world just... continues"), the stolen-medicine
  confession, the trust that finally lands ("Okay. Yeah. I trust
  you."), and the party naming itself "The Company" ("It has a
  name, which means it can be lost."). Nancy pushes 'Big Ugly' for
  Drum-Belly. A moot IS called on the ambush of Quinn — the fire
  gets built up.
- 14104 (Chicago), 120 days, horizon, 5 alive. The pods village:
  Mario's uncle Celestin, Clarence's Hugo, Kahina's sister Dina
  ("She was nineteen. Nineteen years of being interesting was not
  enough, apparently.") — three villagers dreaming of rows of
  humming pods, three promises to ask the System, three times "Even
  asking is more than the silence." Clarence wants his name kept in
  the story ("A good story needs a fool who went first. I've applied
  for the job.") — and dies of dehydration on d27. Li Liang
  confesses twice in one sitting (glazier, not veterinarian; Chicago,
  not Denver). Marama asks if anyone still sings ("In the shower.
  Which is now the creek. So yes, badly.").
- 14105 (Phoenix), 120 days, horizon, 6 alive. Cormac's wound arc —
  the favor, the thanks ("You came through on this wound. I won't
  forget it."), the debt that stays on his face. Silas's ambush case
  resolves through leniency ("They talked. Everything changes
  now."). Nora digs up a buried food cache (+1107 kcal to the
  pantry) and names the party "The Company" again. The recap-quote
  glitch fires once (Cormac d48, Divya's closer quoted with its
  stage direction).

Across the panel: villages survive the monsters and the hunger now —
the dying is thirst (7 corpses), the wild, and one wound. The crisis
loop (linger → gorge → sortie) fires reliably and the fight-1 frame
holds. The headline is survival: 5/5 horizons, 31 alive. That is
CONFOUNDED (wideduty, sametick, tenddrive re-apply, fightblend, and
fresh seeds all moved at once) — it is a cross-panel observation,
not a claim about any one landing. A 5/5 horizon panel with 0
game-overs is also the leg's first panel with no bend at all: the
crisis leg's C1 bar ("every game-over has a named cause") passes
vacuously. Worth saying plainly: this panel did not stress the
village hard enough to test bending.

## VERDICTS (prereg bars, §14 binding)

- C1 (bend, not break) GO — vacuously: 0 game-overs, 5/5 horizon.
  (See the assessment: the panel did not stress the village hard
  enough to test bending. A 5/5 horizon panel is itself a prereg
  "interesting finding" trigger.)
- C2 (episodes fire + gates hold) GO: raids fired on all seeds;
  fought resolutions present; D1 21/21 delayed>=3; deltaBad empty;
  D3 drift unknown = 0. Missed-window corrected 4 — the instrument
  look (trigger >= 8) does NOT fire.
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable
  case fired or was refused with a recorded reason (4 refusals, all
  "no-fighters"); no boundary-firable case unfired.
- BENCH (watch): 4 refusals, ALL gate-one-short AND all 4
  alive-bench — the first panel with alive-bench data. The exclusion
  is nodeAway (1 each): the second fighter exists but is at another
  node. The r156 metric review's reason for dropping BENCH ("refusals
  only ever come when the bench is already bare") does NOT hold on
  this panel (livingBesidesPlayer 2 on all 4). The watch now has
  data; the nodeAway question is answerable: nodeAway predicted 4/4
  alive-bench refusals.
- C3 (people check) GO: 39/39 post-fix transcripts read in full
  (below); fabricHits = 0; zero unforced consecutive repeats; Q1c
  fix holds in the wild (0 "They answer at length." fallbacks;
  Lusiana's 3 Indonesian sittings speak real lines with glosses).
  No fourth naming-stance wobble sighting. VoiceLine prefix
  stacking: 0 sightings (does NOT graduate). Recap-quote glitch:
  1 sighting (does NOT graduate — bar was 2).
- WRAP-CHECK GO: 39 transcripts, 39 marked, unmarked = 0.
- C7b (instrument, REVISED BAR) GO: buried list reported per seed
  (above).
- Q1 missed-window split: valve-expiry 2 / per-day 1 vs drawn-off
  2 / per-day 2. The r156 valve-expiry story (12, per-day 5) does
  NOT reproduce — the 13903-d96 cluster looks like a seed artifact,
  not a systemic valve defeat. No game-design finding filed.
- Q2 medic duty: census works (spans, live holder, stash). Blocked
  43–108 per seed (wideduty's widening shows vs r156's 50–91);
  ability cures 2–17; medicine cures 0/5, attributed to an empty
  pharmacy at census on 5/5 seeds. Canary clear (no sortie deaths).
- Q4 fight-1 (SETTLED frame) HOLDS: clears open on vKill (6) or
  mFlee (7); breaks open on vFlee (4/4, no vDie). The vTaken>=~70
  break clause stays untested in isolation (every >=70 break also
  opened vFlee) — kept marked untested.
- Q5 multi-monster set clear: 8/10 — pattern holds and runs hot
  (r154 8/12, r155 3/4, r156 pre 4/9, post 7/14).
- Q6 G-ID watch: 14th panel at zero id-matched. Watch stays open.
- Q7 naming-stance wobble: no 4th sighting (Nancy takes a stance,
  'Big Ugly', without flipping; the two vote-asks end in deferral,
  no stance taken). Watch stays open.
- Q10 recap-quote glitch: 1 sighting (Cormac d48). Below the >=2
  bar — filed, watch continues.
- Q11 filed-item recurrence: betrayal empty beats recur (site 3x,
  witnesses 3x); vote dangle recurs (2x) — now ATTRIBUTED (see C3
  below), not a game defect.

## C3 PEOPLE CHECK (39 transcripts, read in full)

All 39 meet the meaning bar except the filed items below (d106 is a
1-line refusal, counted as marked). What works, seen repeatedly:
debts with memory across days and sittings (Cormac d20 wound favor
→ d37 "You came through on this wound. I won't forget it." /
"...Fine. But I don't like owing."; Oscar's trust arc across four
sittings, refusals → "Okay. Yeah. I trust you."); confidences with
reasons (Kahina's sister Dina, Mario's uncle Celestin, Clarence's
Hugo — three pods dreams, three promises to ask the System);
betrayal investigation that pays off (Silas's leniency approach:
"They talked. Everything changes now."; Andre's press to
exhaustion); the moot that fires (14103 d27, ambush of Quinn);
secrets that get answered (Oscar's stolen-medicine confession —
the r120 fix in action; Li Liang's two confessions); the party
naming itself; teaching both ways (Fatima's five plants, the player
teaching Oscar Prickly Pear); silence as a choice with a cost
(Darius d16's silence "lands wrong"; Silas d10's "the quiet turns
pointed"). The no-words sitting is transformed again: Lusiana
speaks Indonesian, the player catches words, the conversation ends
warm — on a second villager, second language, second panel.

FILED (not fixed here):
1. Betrayal investigation empty beats — RECURRENT (3rd panel):
   [betrayal:site] → "The ground remembers." (3x: 14102 d12, d20;
   14103 d27) and [betrayal:witnesses] → "Names, named." (3x, same
   sittings) return no information, while [betrayal:press] and
   [betrayal:approach] CAN pay off (Silas d10). The investigate beat
   reads as an early-stage placeholder that never names anything.
2. Naming-debate vote dangle — RECURRENT (2x: 14101 d39, 14105 d38)
   but now ATTRIBUTED, not a game defect: the vote IS castable —
   app.js renders "Back a name" buttons per option and calls
   Game.backMonsterName (app.js:14080–14089); the sim driver never
   clicks them (it picks the generic [gq:open:take] "I need a moment
   to think"). Driver gap for the next run: teach pickConvoChoice
   to back a name when a naming vote is open. Do NOT file as a game
   blank.
3. Double confession in one sitting — RECURRENT (2nd panel):
   Li Liang d37 serves two different "truths" back to back with the
   IDENTICAL frame ("A wall comes down, then — surprisingly — a door
   opens behind it." twice) — same family as r163's filed Sylvie
   item. Reads slightly off: two THE-secret reveals in one sitting.
   Design question (one confession per sitting? vary the frame?),
   not fixed here.
4. Recap-quote glitch — 1 sighting (Cormac d48): the thread-resume
   re-serves Divya's closer WITH its stage direction inside quotes
   ("Want to hear where it left off? 'A comfortable quiet settles.
   They smile a little, and let it be.'"). Below the >=2 bar;
   watch continues. (The d40 resume quoting Amara's spoken line is
   legitimate quoting, not the glitch.)
5. Invite-refusal verbatim repeat within a sitting (2x): Oscar d38
   and Lingling d22 serve the identical refusal twice when the
   driver re-picks [dlg:invite]. The refusal doesn't escalate or
   vary on repeat. Soft.
6. Teaching-beat repetition x5 in one sitting: Fatima d85 teaches
   five plants with the identical frame ("This one — X. Leaf, stem,
   smell. You won't forget it now."). Soft — the plants differ, the
   sentence doesn't.
7. "The Company" named on the third straight panel — DRIVER
   ARTIFACT, not a game defect: the driver always picks index 2
   ("The Company (or plain)"). Driver gap for the next run: vary
   the party-name pick. Do NOT file as a game blank.
8. "Debts unpaid just sit there" after a settled debt (r156 #5)
   and "that wound care, settled" after declined favors (r156 #6):
   0 sightings this panel — both do NOT recur.

## REACHABLE / FUN / WINNABLE

Reachable: crises fire on all seeds, sorties answerable (17/21
attempts ok, 4 refused with recorded reasons), conversations rich
and reachable, the medic duty fires and cures (ability channel
2–17/seed), the naming vote is castable on the real UI. Fun: the
conversation system is the star again — debts with memory, the
pods dreams, the party naming itself, the moot that fires, the
leniency that pays off, Oscar's five-sitting trust arc. The crisis
loop fires reliably and the fight-1 frame holds. Winnable: this leg
judges crisis survival, not the win — 5/5 reached the horizon, 0
wins. The survival jump (31 alive vs r156's 8) is the leg's
caution in the other direction: the panel did not stress the
village hard enough to test bending, and a 5/5-horizon panel says
more about the confounded base movement + fresh seeds than about
any one landing.

## METRIC REVIEW (§14 — for the NEXT run)

- MISSED-WINDOW SPLIT: works as designed — the corrected count now
  decomposes (valve 2 / drawn 2 this panel; r156 validation: valve
  12 / drawn 6). The instrument-look trigger (corrected >= 8) did
  not fire. KEEP the split; the per-day split (valve 1 / drawn 2)
  is the headline number going forward, since the valve-expiry
  per-day is the actual "wait defeated" signal and it was 1 here.
- BENCH: the r156 proposal to drop BENCH to a watch was premature
  in one respect — this panel produced the FIRST alive-bench
  refusals (4/4 gate-one-short, nodeAway the single exclusion).
  KEEP BENCH as a watch with the alive-bench subset as its primary
  number; the nodeAway question is now answerable and nodeAway
  predicted 4/4 this panel.
- Q4 frame: SETTLED — the revised frame held on a third panel
  (clears mFlee 7 + vKill 6). The vTaken>=~70 clause remains
  untested in isolation; keep it marked untested.
- Q11: 0 stacks this panel (after 2 + 2). The family persists
  across panels but the count resets here — keep the watch; a panel
  at 3+ still graduates it.
- Q10: 1 sighting (after 2 in r156). Below the bar; keep the watch.
  A second consecutive panel at >= 2 graduates it.
- MEDIC DUTY census: the new instrument works (spans show real
  handoffs; the live read removes the r156 stale-field case; the
  stash read attributes the 0-medicine-cures finding). KEEP. Add
  one refinement: record the stash pharmacy MID-RUN (e.g. at day
  60) as well as at census, so a mid-run spend can't hide behind
  an empty census-time stash.
- C1 on a 5/5-horizon panel: the bar passes vacuously. The next
  run should consider whether the crisis leg needs a harder stress
  (longer horizon, or a seed band chosen for attrition) to test
  bending at all — a panel with no game-overs cannot judge
  "bend, not break". Flagged as a design question for the leg, not
  a bar change in-run.
- DRIVER GAPS (filed, not fixed here — the judged instrument must
  not change mid-run): (a) teach pickConvoChoice to back a name
  when a naming vote is open (Q11 #2 attribution); (b) vary the
  party-name pick (Q11 #7 artifact); (c) the driver cap break at
  12 turns cut two long good conversations (d27, d85) — consider
  raising the cap for sittings that are still progressing.

## INSTRUMENT / TELEMETRY

- Telemetry check (judged panel, 5 JSONs): `node
  scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/crisis.json --current
  '.../journey-crisis-r164-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount` → **quiet (5
  files, 3 metrics, no large deviations)**. Baseline NOT rolled.
- Gate: `node scripts/check.js --quick --cacheDirectory=
  /tmp/jest-cache-playtest2` in the worktree → **296 passed, 4 failed
  in 488s** (log `journey-crisis-r164-gate.log`). Attribution: all 4
  are the standing set — test-mobile-combat-cadence ("Continue does
  not wrap the announced round a second time"),
  test-occupation-panels ("real CLI workflow completed"),
  test-phone-frame-proof (stale retained browser inputs / current
  phone evidence required), test-establishment-r20-fixes-20261020
  ("next day voices once more (gate resets daily): expected 2, got
  1") — the same 4 seen in the r117/sametick/wideduty/r163 gates.
  The measurement-proof staleness pair PASSES this run (no src/js
  change — only new scripts/ + evidence/). **No new attributable
  failure. Gate adjudicated GO.**

## GATE — RE-RUN ON THE REBASED TREE (adoption closeout, main session)

The coordinator timed out before confirming the rebased gate; the main
session adopted the run (heartbeat frozen at 18:51:02Z, execution timed
out, zero processes in the tree — the r117 closeout precedent) and read
the completed log: **296 passed, 4 failed in 760s, zero timeouts**
(log `journey-crisis-r164-gate-rebased.log`). The 4 failures are
exactly the standing set (mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes); the measurement-proof
staleness pair PASSES (no src/js change). **No lever-attributable
failure. Gate adjudicated GO on the rebased tree.**

## CLOSEOUT

[Adoption closeout by the main session: run timed out at its 2h budget
after committing fc39172f9 (run note + driver + analyzer) on the
rebased branch; master had not moved since the rebase (tip 91869f106),
so no second rebase was needed. The evidence corpus (prereg,
analysis, both gate logs, 5 seed JSONs, 39 transcripts) was committed
with this closeout commit — the medheadcount lesson: an uncommitted
corpus leaves the numbers unverifiable. Merge, release, rotation-b
6→7, and lock deletion are recorded in the goal timeline + daily
notes, not here, because they happen after this commit.]
