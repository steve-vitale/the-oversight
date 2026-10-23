# journey-deepening r36 — WAVE-2 MECHANIC SURFACING + SHARED FLEE-PORT (2026-10-23)

## Run note (run start)

- Rotation file read 2 (deepening). r35 (wave-3 arrival + signature surfacing,
  18c621cd4-era base) complete; landing-r40 ran after it. This run plays
  deepening as r36 and will write 3 at the end.
- No prior lock at run start. Lock `laneA-deepening-20261023T1742Z` created
  17:43 UTC; worktree `journey-deepening` registered from master 30b6ad6e3,
  heartbeated at registration; re-heartbeat every <15 min for the run.

## Pre-register (§14 BINDING — written BEFORE the first full-leg sim ran;
pilot only: 1 seed x 5d instrument check, green)

**Leg question (fresh; r35 owned wave-3):** Wave 3's arrival is kill-gated and
variable (r35: unlock d47 / d53 / never-by-81) — wave 2 is this leg's
GUARANTEED content (MONSTER-WAVES.md: day 8 + 5 wave-1 ledger points). In
competent d40-80 play, when players fight wave-2's 13 entertainment predators
(voice_mimic_radio, mirror_stag, review_drone, bright_idea, memory_projector,
warranty_caller, understudy, landlord, heckler, paparazzo, union_rep,
moderator, statickite + 2 disease vectors), do their signature mechanics
actually PLAY in the fight — or are fights over before the mechanics surface?
SENSE-TESTING LAW: per-fight line dumps saved for end-to-end reading; the
counts are instruments, not the verdict.

**Blank fill (from r35's documented-not-fixed #2):** r16's consumed-push fix
(truthy-but-consumed tbBarrierExit must not count as a flee) lived only in
the r16 journey driver's own flee. The SHARED competent-policy flee path
(legacy branch, COMPETENT_DPS_RACE=1) had the same class: every truthy return
counted as ctx.barrierPushes+=1 and the push re-fired every turn — barrier
say-line spam + inflated flee telemetry. PORTED into
scripts/policies/competent.js, env-gated COMPETENT_EXIT_VERIFIED_FLEE=1
(default OFF: gate-off block byte-identical, proven by the proof test).
DEFAULT-OFF is deliberate: the competent policy is a balance-measurement
input; un-gating fleet-wide needs a fresh observer-neutral maintenance proof
(per repo AGENTS.md balanced-measurement workflow), which is Steve/fleet's
call, not this run's. This run's sims exercise the gate ON.

**Code read (BEFORE instrumenting):**
- Wave-2 unlock: day 8 + 5 wave-1 ledger points (MONSTER-WAVES.md:360);
  waves 1-3 never readiness-gated.
- Mechanics are engine-spread: data-driven preTurnHooks in
  src/data/monsterBehaviors.json (staticCallOut, droneCrowdOverload,
  landlordEviction, packTactics) + bespoke tbMonsterTurn branches in game.js;
  counterplay learns via the discoverMonsterCounter / villagerTricks channel
  (same "COUNTER LEARNED" narration as wave-3 signatures).
- tbBarrierExit consumed-but-truthy cases (game.js:34447+): sealed
  (f.noFlee / arenaContest), world edge, blocked far side, empty field.

**Interesting-finding bar:** ≥1 wave-2 fight where a signature mechanic is
readable in the line dump (telegraphed windups, bespoke say-lines, hook
events) = the leg's guaranteed content plays. Wave-2 fights that end before
any mechanic line = a blank to root-cause (fights too short? hooks
unreachable? policy over-avoids?) — fix if bug, document if design.
Counter-learned events ≥0 expected; a mid-leg villager knowing a predator's
trick would be evidence the knowledge economy reaches monsters too.

**Binding metrics:**
- P1 (mechanic surfacing, PRIMARY): 4 seeds (10001-10004), competent policy
  + COMPETENT_EXIT_VERIFIED_FLEE=1, DAYCAP=80 (leg horizon), death-aware
  stop. Per wave-2 fight: mid, day, full line dump. Wave-2 fight count per
  seed; counter-learned events. 4/4 seeds complete, 0 wrap errors.
- M1 winnable (stay-green): ≥3/4 villages alive at end (leg standard).
- M2 people (report-only): ≥6 full villager transcripts sense-read end to
  end against the conversation quality bar, 0 senseless expected.
- Panel telemetry (body step 14): per-seed JSON carries literal-key w2fights
  / engaged.w2 / fightsTotal / fightsByWave.2. deepening.json baseline holds
  only w3 keys + fightsTotal (provenance unknown — r35 metric review); run
  the check on the shared key, investigate LOUD, do NOT seed w2 keys into a
  baseline whose provenance is unknown.

**Seeds / horizon / policy:** 10001, 10002, 10003, 10004 (fresh — not the
89xx/99xx corpora), competent pinned, DAYCAP=80, death-aware stop (+10d tail
max). Natural behavior, no probes.

**Race guards:** measurement only — no src/js, no data, no policy defaults
touched (the flee port is a new env-gated branch, default off). If a blank
proves to be a clear bug (not design), a minimal fix + proof test is in
scope; the wave gates and quirk channel stay parked as Steve's calls.

**Metric review:** (to fill after the run)

## RESULTS (to fill)

## RESULTS (completed by adopting run laneA-deepening-20261023T1945Z — stale-lock recovery)

The 17:42Z run died after evidence collection (heartbeat stale 71 min, no
worker writes in the final 15 min, lock deleted per overlap guard). This run
adopted the registered `journey-deepening` tree, completed analysis, fixed
the blank below, and landed the work.

### P1 mechanic surfacing (PRIMARY): GO

7 wave-2 fights engaged across 4 seeds (1/1/0/5); 5 distinct predators
fought; 59 COUNTER LEARNED events (12/15/16/16 per seed). Signature mechanics
readable in line dumps:

- d42 bright_idea (19 lines): spotlight-focus telegraph ("the light fixes on
  Marcus, hardening. Pain gets noticed.") — killed by daylight round 1
  before acting. Telegraph readable; the monster never got a turn.
- d52 + d64 heckler (18 / 39 lines): trash-talk windups, SHAME stacking
  ("SHAME 1"), Codex: Compulsion, broke and ran both times. Mechanic legible.
- d56 giant_mosquito (26 lines): dive windup telegraph ("The whine climbs
  an octave and steadies"), Codex: Drink, blood-drink sequence. Mechanic legible.
- d63 moderator (154 lines): Content Noted telegraph ("CONTENT UNDER
  REVIEW… It is reading everything you have ever done."), Codex: Content
  Noted (undodgeable lock-on). Mechanic legible — BUT the fight is
  DEGENERATE (see blank below): 25 rounds of "No path there." while the
  policy flee-walked into a failed path, scholar went down without striking.
- d77 understudy (13 lines): one-shot round 1 (150 dmg Phase blade). Too
  fast for the copy mechanic to surface.
- d29 moderator (6 lines): dissolved round 1 ("It comes apart — no one in
  reach"). Too fast.

Interesting-finding bar MET 4x over (heckler x2, mosquito, moderator
Content Noted): the leg's guaranteed content plays when fights are engaged.
Short fights (dissolve / one-shot / daylight-kill) end before mechanics
surface — that's fight pacing, not a hook bug.

### The 0-fight seed (10003) — resolved as design working

w2UnlockDay=46, zero engaged w2 fights in 34 days — but the capture shows
the content was THERE: Heckler sighting ("Something moves out there"),
"Devon stood down the Understudy — 5 rounds, bloodied but breathing",
"Jesús killed the Heckler alone — 5 rounds, 64 taken. Word travels fast.
The village cheers.", Codex auto-page ("The Heckler is dead. You didn't
ask. It knew."), Moumita teaching the Heckler counter at the haven
("(Someone at the haven knew the trick.)"), and a campfire storytelling
beat where Jesús recounts the kill and the village reacts. The competent
player avoided predators for 34 days; THE VILLAGE fought them anyway and
the knowledge economy transmitted the counters. Reachable through the
village channel, not just the player's fists. No blank.

### BLANK FILLED: stuck flee-walk loop (r37 fix, this run)

Root cause: the r36 consumed-push port covered only TRUTHY tbBarrierExit
returns consumed without exiting. When the flee-walk's tbPlayerMove fails
("No path there.") the turn ends unmoved and dpsRaceAssess re-flees next
turn — forever. Seed 10004 d63 moderator: 25 rounds, scholar died without
striking. Same class as the r16 4.58M loop and the r36 port, in the
measurement policy (scripts/policies/competent.js), NOT shipped game code.

Fix (env-gated COMPETENT_EXIT_VERIFIED_FLEE=1, default OFF — gate-off
legacy byte-identical, proven by proof tests): count consecutive
zero-progress flee turns per fight; at 3, mark the fight unfleeable
(ctx._fleeBlockedFor) and return false BEFORE endTurn (the failed walk
spent nothing) so fight() falls through to beast-trick play and strikes.
Legit edge-walks never trip it (any movement/exit/push resets). Also
hoisted the unfleeable early-return above the edge/pick logic so it fires
mid-grid — the r36 mark only short-circuited on an edge; a stuck walk at
grid center re-fled every turn after being marked (caught by the new proof
test, turn 4).

Proof tests: scripts/test-competent-flee-stuckwalk-20261023.js (16/16
green: stuck→fights it out at turn 3, keeps striking, legit walks never
marked, gate-off legacy loop preserved) and the r36
test-competent-flee-consumedpush-20261023.js (16/16 re-green after the
hoist — no regression).

Scope note: this run did NOT re-run the 4-seed campaign with the fix
(the r36 evidence stands as the leg measurement under the pre-registered
gate). The next deepening run (r37) exercises the stuck-walk fix in sims.

### M1 winnable (stay-green): 4/4 PASS — all villages survived to day 80-81

Deaths hit hard but villages persist (canon-consistent): 10001 lost 1
villager (ambush), 10002 lost 3 (combat x2, sickness), 10003 lost 8
(combat x3, ambush, sickness x3, wounds x2 — the bloodiest village, trust
range 1-90), 10004 lost 7 (combat x4 incl. the d58 CONTEST death, sickness
x2, the d63 moderator player-death). Player death is absorbed by
village-as-protagonist continuity (respawn as another villager).

### M2 people (report-only): 12/12 transcripts sense-read end to end

10 sensical, 0 senseless. Two documented-not-fixed blanks:
1. Wei (beekeeper, 10004): 9 straight dlg:more → fortune-cookie one-liner
   loop, want stuck at stage 0, resolution=unestablished. Repeat-"tell me
   more" has no turn cap / no beat escalation — an unbounded filler loop
   with no arc. Design blank, not a text bug.
2. Omar (piano tuner, 10004): illiteracy confession met with one "tell me
   more" → shrug → ironic close. The system OFFERED the right verb
   ("teach") at turn 0; the harness never took it — the teach path is
   unverified from this evidence.
Mild roboticism: the exact line "Their friendliness thins — still there,
just held at arm's length." fires for "go on" across 4 different NPCs.
Jesús's Spanish-only conversation is handled well (no fabricated shared
history, mime, a planted future beat).

### Village assessment (plain words)

- 10001 (11 alive): the steady village. Trust 60-100, plants 32-37 each.
  Journalist Earl wants the System asked about the taken; DeShawn the
  aquarium keeper mourns rushed Columbus, Ohio mornings; Colin the bush pilot
  fights a hot cut. One ambush death. Wave 2 arrived day 20; the moderator
  dissolved before fighting.
- 10002 (9 alive): the working village. Blacksmith Hermann deflects help
  with gruff ease; Willie the fisherman's pantry run stays open; Dwayne the
  soldier steals joy where he can. Sickness took Jorge on day 40. Wave 2
  day 21; the heckler came, shamed, and ran.
- 10003 (10 alive): the bleeding village. Eight dead — ambush, sickness,
  wounds that wouldn't close. Trust as low as 1. But: Devon stood down the
  Understudy, Jesús killed the Heckler alone and told the story at the
  fire, Moumita teaches the counter at the haven. Boris the blacksmith
  teaches trust the slow way ("watch what I do when nobody's watching").
  The village carries its dead and keeps the knowledge moving.
- 10004 (8 alive): the tested village. Five wave-2 fights — the bright
  idea, the heckler (twice), the mosquito, the 25-round moderator that
  killed the scholar, the one-shot understudy. A contest death on day 58.
  Omar can't read and is scared it matters; Wei feeds everyone because
  hungry people make bad decisions; Marcus does guilt-math that doesn't
  add up. The village endures.

### Reachable / fun / winnable (leg verdict)

REACHABLE: yes — wave 2 unlocks day 20-46 in 4/4 seeds (MONSTER-WAVES.md
day 8 + 5 ledger points), fights engage naturally or the village handles
them off-camera with full knowledge-economy follow-through. WINNABLE:
yes — 4/4 villages alive at day 80-81; deaths are costly but not terminal.
FUN: yes with one asterisk — the wave-2 fights that land are televised
little horrors with readable tricks and counters worth learning; the
degenerate 25-round moderator loop (now fixed in the policy) was the one
unfun outlier, and it was a measurement artifact, not game code.

## Metric review

- P1 GO (bar met 4x). M1 4/4 PASS. M2 12 transcripts, 0 senseless.
- Telemetry: LOUD fightsTotal -67% (baseline 82 -> current 27, n=4).
  Investigated: EXPLAINED, not a bug. r35's own evidence sums to 33
  (10/6/4/13) — the 82 baseline matches no recent deepening campaign;
  provenance unknown (r35 metric review flagged the same). Baseline left
  UNTOUCHED per the pre-registration (no seeding w2 keys into unknown
  provenance). Recommendation for the next deepening run: re-derive
  deepening.json from a documented campaign, or deliberately adopt w2 keys.
- Metric doubts for next run: w2Fights counts only PLAYER-engaged fights;
  villager off-camera kills (Devon/Jesús) are the leg's real action in
  avoidant seeds — consider a village-engaged w2 metric.
- The d63 stuck-loop death means r36's fightsTotal/winnability carries one
  policy-artifact death (scholar, seed 10004). Flagged, not re-scored:
  the fix lands with proof tests; r37 sims re-measure.
