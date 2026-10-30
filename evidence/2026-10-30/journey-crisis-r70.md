# Journey crisis r70 — re-baseline on moved master: 9408 flips, 9411's bargain re-framed (lane B, leg 6)

Successor to crisis r69 (post-armor pilot). This run does NOT re-litigate
r69. It re-baselines the crisis leg on current master and applies the
metric revision r69 proposed for the NEXT run.
Pre-registration:
`hidden_files/evidence/2026-10-30/journey-crisis-r70-prereg.md`
Base: master 2bfa0c426. Since the r69 base, src/js moved materially:
joinendlines honest end lines, raidguard removal, party-formal
name/role picks, knower ledger, hierarchy rework, fieldFights
changes. No src/js change in this run (measurement only; tooling:
2 new scripts, r69 clones + additive phoenix burn recorder).

## Run setup (done first, per the body)
- No Lane B lock present at run start — no stale-lock recovery
  needed. New lock written run 2026-10-30T01:55:46Z.
- Main-tree pre-flight: clean at first check (no sibling wait
  needed). Disk 19%, `git pull` already up to date, worktree-reap
  ran clean (active 6/16).
- Worktree journey2-crisis (body slug), registered 02:01Z (the
  register command took ~4.5 min against a registry flock jam;
  the worktree sat "locked initializing" until its checkout
  finished — no work was done inside it before the registry
  entry existed). Heartbeat verified in registry (02:01:43Z)
  and re-heartbeated every 10 min by a logged loop (log:
  goal hidden_files/journey2-crisis-heartbeat-r70.log).
- Canon: docs/CANON.md read in full before playing. Gating freeze
  (2026-10-27) untouched. Rotation-b read 6 at run start.

## Fresh panel (r69 driver/analyzer verbatim -> r70, names only,
## PLUS the burn recorder)
Instrument: `scripts/journey-crisis-r70-delayed-20261030.js` +
`scripts/analyze-crisis-r70-delayed-20261030.js`, policy oracleV2,
120d death-aware (+10d tail). EVID exported:
`hidden_files/evidence/2026-10-30/r70-panel/`.
Diff r69 -> r70 is names/dates PLUS the burn recorder (verified:
every other differing line is an r69 -> r70 rename);
node --check clean on both scripts. Seeds 9407 / 9408 / 9411,
sequential, never concurrent, all exit 0. Analyzer output:
`hidden_files/evidence/2026-10-30/r70-panel-analysis.txt`.
Burn recorder: Game.phoenixResolveBurn wrapped; each actual burn
records {day, bearer, victim, willing, fight} where fight is the
enclosing fieldFight invocation id (stack-tracked), or null
outside a fight. LinkBeat narration is NOT counted (a 'protest'
beat starts a struggle, not a burn).

## C1 (bend, not break) — MIXED, one flip with a named cause
- 9407: horizon, 7 alive, 36,452 kcal (r69: 8 alive, 8,626 kcal).
  Fewer survivors, a far fuller pantry.
- 9408: game-over day ~103/104, 0 alive, 0 kcal (r69: horizon,
  7 alive, 2,951 kcal). FLIP — cause named below, not averaged.
- 9411: game-over again (days field 99, Game day 107, 1,800 kcal;
  r69: day 97, 7,236 kcal). Same clause, third shape.

## The 9408 flip — a d88 wild-death cluster plus a starvation spiral
Day 88 is the catastrophe: the d88 sortie itself works (Nora
stands down the Grief Counselor, "bloodied but breathing"), but
the same day the wild kills four villagers — Jada, Quinn, James,
and Nora herself, all "the wild" d88. Nora surviving the sortie
and dying in the wild hours later is coherent, not a
contradiction, but it guts the village in one day. After that:
STARVING from d88 on, gorge draining the last stores (Big Beast
1,017 + 815 + 200 kcal), triage honestly refused for lack of
800 kcal ("The bins can't cover broth and bandages"), the d99
raid kills Sharmila at the door, Sanne dies in the wild d101,
the d103/d104 sorties are refused 'no-fighters' (no able
fighters left), and Nour dies in the arena d104. Gorge nights
double vs r69 (42 vs 20) because lingerers keep forming while
the village starves — and the gorge lines stay honest at the
end, reporting "0 kcal gone from the stores" when the stores
are empty. The flip is food + wild attrition, not a siege
mechanic failure: gates held throughout (see C2).

## C2 (episodes fire + gates hold) — GO, with two composition notes
- Raids fire on all seeds: 11 / 10 / 9. Fought resolutions on
  all seeds (9407 d15-d121; 9408 d9-d91; 9411 d16-d86).
- Gates hold: TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); D1 snapshots 7/7 (delayed >= 3 attempts);
  deltaBad empty; drift unknown = 0 (sortie-clear 10,
  player-drawn-off 5, moved-on-valve 4); episode resets 0.
- D2 clear rate 2/5 ok sorties (r69: 5/5) is COMPOSITION, not
  regression: the three non-clearing ok sorties each killed or
  drove the small fry but left the heavies lingering (9407
  d108: Big Ugly 179 HP, Algorithm 750 HP stay; 9408 d79:
  Influencer 637, Loud-Eyes 871 stay; 9408 d88: Big Beast 196
  stays). A sortie clears what it can; "remaining" counts what
  it couldn't. r69's 5/5 was small-set luck. Metric review
  proposes judging D2 with set composition attached.
- 9407 d121 sortie is the known unfed-march behavior (r50,
  Steve's call) with a spoken $0 price: the d108 sortie paid
  the pantry's last 5,852 kcal, so at d121 the store held 0 and
  the line honestly says "(0 kcal from the stores)". Price
  honesty holds exactly (pantryDelta == -paid on all 5 ok
  sorties); the march proceeds unfed, as the standing item
  already records.

## C2b (linger-conditional gorge/sortie, r69's revision adopted
## in this prereg) — GO, and the revision works as intended
- 9407: lingerers formed, 28 gorge nights, 3 sorties — judged.
- 9408: lingerers formed, 42 gorge nights, 4 sorties — judged.
- 9411: NO lingerer set ever formed, 0 gorge, 0 sorties — and
  under the revised clause it PASSES "episodes fire" on raids +
  9 fought resolutions alone, instead of failing a gorge bar
  it never had a chance to meet. The revision does exactly
  what r69 proposed.

## C3 (people check) — GO, with two named blanks
Read in full: all 19 new transcripts (6x 9407, 6x 9408, 7x 9411).
fabricHits 0 panel-wide.
- NPCs want concrete things: a festering wound cleaned and
  wrapped (Sanne d101, Asher d17: "If it festers I'm no good
  to anyone — can't haul, can't hunt, can't watch"); food
  (Paul d77: "My stomach's been empty so long I've stopped
  feeling it"; Jada d86: "It's been days since a real meal").
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" /
  "Still the same thing —" / "I've told you three times now —"
  and then close ("Forget I asked", "Okay. We'll pick this up
  later."). Doubt escalates (careful → choosing words →
  rattled → done talking). Recap escalates then closes
  ("We're going in circles a bit").
- Grief reads as people: Paul on Donnacha (d57: "Donnacha is
  gone and the world just... continues. That's the part I
  can't stand." / "I oil boots on rest days. It doesn't bring
  anyone back. It just keeps my hands from shaking."); Asher
  on Yuying ("We bury, we grieve, we keep going. There's no
  step four."); James on Violet ("Violet always took the
  burnt piece. Said someone had to. I take it now.").
- Invitations are sometimes taken, in this leg too: James
  "Alright. But I'm not carrying your stuff."; Paul "Someone
  should watch your back. Might as well be me."; Asher "I'd
  love to. Lead the way."
- BLANK 1 (instrument, proven): the driver's DEFENDER branch
  is structurally dead — zero DEFENDER convos in this panel
  although NPCs fought on EVERY raid day (9407: 9 raid days
  with NPC defenders; 9408: 8; 9411: 9). Cause: raids are
  announced at night and resolve the next day, so by the time
  the day-boundary convo block runs, the raid's say day is
  always block-day-minus-1 and `raidToday` never fires; only
  the raid+2 SHELTERED branch ever triggers. The people check
  has therefore only ever heard sheltered witnesses, never a
  defender fresh off a raid. Fix for the NEXT run (not applied
  mid-run — driven convos intervene in game state, so a fix
  would break panel comparability): trigger the defender
  convo on the resolution day (raid day + 1) and verify a
  DEFENDER file appears.
- BLANK 2 (game text, small, code-grounded): "They are no
  longer available to receive help." fires for three favor
  asks (Paul d77, Jada d86, Sanne d101) — while Asher d17
  gets the actionable version ("Move next to them, on the
  same side of the Haven door"). The code
  (src/js/convo-wants.js convoFavorAction) fires this line
  when the asker is not on the roster, is the player, has no
  person record, or is dead — four states under one wording.
  All three speakers here are alive and talking, so one of
  the non-death disjuncts (roster/person-record mismatch for
  the speaker's id) must be firing, and the player cannot
  tell that from the line. The near-death correlation (all
  three die within days) is noted but not claimed as cause.
  Fix direction: split the wording by disjunct, or prove
  which disjunct fires for living speakers, before wording
  any change.
- Driver artifact, not a defect: Sanne's d98/d119 transcripts
  are 6-7 exchanges of pure nodding (the driver hammering
  [nv:nod]); the game does signal the wind-down ("the
  conversation thinning like light at dusk").

## C4 (burn-chain, third observation for the Steve-call) —
## REFRAMED: not a fight chain, a same-event respawn cascade
- 9407: 0 burns. 9408: 0 burns (the village dies without the
  clause firing). 9411: 10 burns, ALL willing, ALL outside
  any fieldFight invocation.
- The d107 cascade, verbatim from the record: the player
  (Nikolai Volkov) dies in the arena; Emma volunteers and
  burns; the player respawns at Emma's ashes with 1 HP and
  dies again; Chantal volunteers and burns; again — Nurbol;
  again — Andrea; a fifth death finds no one left ("Your
  death sticks") and Nikolai dies in the arena. Four burns
  in one day, one lethal event.
- This reframes r69's "six burns in the final fight": the
  clause does not chain inside a fight invocation at all on
  this instrument — it chains across re-deaths of the same
  bearer inside one lethal event, because each 1-HP respawn
  lands back in the situation that just killed them. The
  Steve-call sharpens from "should one fight chain N burns"
  to "should one lethal event be allowed to re-kill a 1-HP
  respawned bearer until the village is gone." No game change
  follows from this run.
- Second characterization: in r70's 9411 the clause NEVER
  takes a random victim — all 10 burns across the run
  (d79 Giulia + Ava, d89 Alejandro, d95 Paula + Saul, d97
  Greta, d107 Emma + Chantal + Nurbol + Andrea) are
  volunteers (standing >= 40). When the village loves the
  bearer, the volunteer path dominates completely.
- Instrument caveat: burns during raid door fights resolve
  through resolveWildMonsterEncounter, which the recorder
  does not wrap as a fight invocation — so "outside-fight"
  means "outside a wrapped fieldFight call", and the arena
  deaths here are unambiguously outside fieldFight. The
  d107 sequence is narratively one event regardless.

## C5 (band vs r69) — movement reported, not judged
- 9407: 8 -> 7 alive, 8,626 -> 36,452 kcal, raids 10 -> 11,
  gorge 14 -> 28, sorties 4 -> 3.
- 9408: 7 -> 0 alive (flip, cause above), 2,951 -> 0 kcal,
  raids 10 -> 10, gorge 20 -> 42, sorties 2 -> 4.
- 9411: game-over both runs; r69 day-97 wipe, 7,236 kcal,
  9 burns -> r70 Game-day-107 wipe, 1,800 kcal, 10 burns.
  Causation explicitly not claimed — no armor-off control
  arm, and trajectories diverge with RNG consumption changes.

## C6 (days-tail) — wobble persists, gap varies
Loop-iteration days vs Game day at end: 9407 120 vs 123,
9408 103 vs 104, 9411 99 vs 107 (r69: 90 vs 97). Same
instrument-wobble class; judge bands, not the counter. The
d121 sortie and d107 burns both sit past their loop's day
count, which is why "120d horizon" means 120 loop
iterations, not 120 Game days.

## Village assessment (plain words)
- 9407: survives with 7 people (Sanne, Pavel, Lucas, Emma,
  Ingrid, Olayemi, Nora) and a full pantry of 36,452 kcal
  after 11 raids, 28 gorge nights, and 3 sorties — the
  richest crisis village in this leg's recent record, bought
  by marching one sortie out on an empty pantry and paying
  heavy tributes along the way.
- 9408: dies with no one left and nothing in the stores.
  It held through 10 raids and 42 gorge nights, then lost
  four people to the wild in a single day (d88), starved
  through its last two weeks while its last fighters refused
  no more sorties for want of fighters, and ended with Nour
  dying in the arena on day 104. A village that bent until
  its people, not its walls, gave out.
- 9411: dies on Game day 107 with no one left and 1,800
  kcal. It fought all 9 of its raids at the door, never let
  a lingerer form, and was eaten by its hero's bargain in
  installments — two burns, one, two, one, then four in a
  single arena day as its last friends volunteered, one
  after another, for a bearer who kept dying.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights (2/3 seeds),
  sorties, aid resolutions, refusals ('no-fighters' is a
  new honest end-state this run), and the phoenix cascade
  all fire on current master.
- FUN: yes — the d88 cluster and the d107 volunteer
  cascade are the most memorable single stories this leg
  has produced; conversations escalate instead of looping;
  the 0-kcal gorge and 0-kcal sortie lines keep the
  starvation story honest rather than hiding it.
- WINNABLE: the leg itself is not a win path; one village
  survives it richer than r69, two break — one on food and
  wild attrition, one on the bargain. No win verdict is
  drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2
LOUD lines as r60/r62/r63/r66/r69 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not
a bug: the baseline's field names describe an older
instrument; current records carry defendedFights (39 / 31 /
34 across the panel), not defenderFights. No NEW loud line.
Baseline NOT rolled.

## Instrument notes (not defects)
- Death-say regex false-positives on monster names: the
  "Grief Counselor" in Nora's d88 sortie line trips the
  grief alternative, landing a survival line in
  deathsDuringSay. The muster-aware layer already closes
  the mismatch (Nora is in the muster); noted for a future
  regex refinement, not fixed mid-run.
- "Remaining" in a sortie result counts lingerers still
  lingering after the sortie, not a failure flag.

## Test-suite call
Tooling-only change (2 new scripts, r69 clones + additive
recorder). Verification: node --check on both scripts,
3-seed driver runs (all exit 0), analyzer, 19 transcripts
read in full. check-quick run in full per the prereg:
282 passed, 8 failed in 1976s (own cache dir
/tmp/jest-cache-playtest2; a sibling Lane A check ran
concurrently). All 8 failures fall in the standing
families documented by the r65 recovery — measurement x2
(proof-update, workflow), mobile-combat-cadence,
occupation-panels, phone-frame-proof,
establishment-r20-fixes (1 racks-full voice assertion),
plus 120s timeouts on trust-observer-neutrality and
capable-bot (capable-bot shows 40 passed, 0 failed before
its timeout — contention, not an assertion failure). No
failure touches this run's files (zero src/js diff; the 2
new scripts are not in the quick list). No NEW failure vs
the standing families, so the measurement-only landing
proceeds with the failures reported, not hidden.

## Metric review (§14)
- C2 judged as pre-registered, with the C2b revision adopted
  in the prereg (not mid-run): 9411 PASSES episodes-fire
  under the revised clause. No metric was re-scored mid-run.
- D2 clear rate (2/5) is reported with set composition, not
  judged as a sortie-quality failure. Proposed for the NEXT
  run's prereg: attach targets/remaining composition to D2,
  or redefine it as "sortie killed or drove >= 1 target".
- C4 judged on observation, not a gate: the fight-grouping
  hypothesis from r69 is superseded by the fight-grouped
  recorder — burns group by day/event, not by fight
  invocation. The Steve-call is re-framed, not answered.
- C6: days-field vs Game-day gap is an instrument wobble,
  not a game counter bug claim; the mechanism (loop
  iterations vs Game days) is named, not proven.
- Carried (unchanged): dead discoverer's orphaned fireside
  entry (r51, Steve's call); unfed marches proceed (r50,
  Steve's call — re-observed at d121 with a $0 price line);
  stare-down cost as a class (Steve's call); phoenix
  per-event respawn cascade (Steve-call, third observation
  now, re-framed); seeded-wearer / pile-draw narration gap
  (recorder note); armor causation (needs an armor-off
  control arm); telemetry mapping proposal defenderFights
  -> defendedFights; gating freeze (2026-10-27) untouched.
- NEW for the next run: DEFENDER-branch fix (trigger on
  raid day + 1, verify a DEFENDER file appears); "no longer
  available" wording split by disjunct (or proof of which
  disjunct fires for living speakers); D2 composition
  attachment.

## Blanks filled / held
- FILLED: current-master crisis re-baseline (9408 flip with
  named cause; 9407 richer; 9411 re-characterized); C2b
  revision validated in use; phoenix chain re-framed as a
  same-event respawn cascade with a 10/10-willing count;
  unfed march re-observed with a $0 price line; DEFENDER
  branch proven dead with a named cause and a fix proposal.
- HELD (not this run's): DEFENDER-branch fix + re-run
  (next run); phoenix per-event cascade cap (Steve-call);
  "no longer available" cause; D2 redefinition; armor
  causation (control arm); days-tail mechanism proof.
- No game change follows from this run. Rotation-b advances
  6 -> 7 (succession) on this landing, verified by re-reading
  the file.
