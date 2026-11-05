# Journey endgame r138 — PRE-REGISTRATION (lane B, 2026-11-05 06:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135 precedent.
Run number basis: latest completed Lane B endgame run is r135 (2026-11-04,
reproduction exact on the r131 substrate). r136 (social life) and r137
(succession) completed since; r137 timed out after finishing its panel
and was salvaged by THIS run before the leg work began (4 commits on
branch journey2-succession-r137, rebase onto master running at prereg
time — evidence/scripts only, zero src/js, so the substrate below is
unaffected by the salvage either way).

Run-start incidents (infrastructure, not measurement):
- STALE-LOCK RECOVERY: lock present with run_id 2026-11-05T09:55:51Z
  (the dead r137 run's lock). No registry tree carries that run_id; the
  only candidate Lane B tree (journey2-succession-r137, run_id
  2026-11-05T10:00:10+00:00) last heartbeated 2026-11-05T10:40:54Z,
  ~75 min stale while sibling loops heartbeated within minutes — dead
  by the 15-minute rule, and the lock itself was ~120 min old (past the
  90-minute fallback). Lock read before deletion per the closeout rule,
  deleted, new lock written (run_id 2026-11-05T11:55:54Z).
- Main tree: `git status --short` 0 lines, `git pull --ff-only` already
  up to date, master 0ad94e023 at pull time. Disk 31% (fail line 85%).
- Reaper: nothing removed; active 11/16 at pre-flight. LOUD preserved
  (never touched): sibling dirty trees sim-sortie-a,
  sim-awayrationfix-b, sim-awayration2-b, sim-streakfree-b,
  sim-fleerepair-a, sim-fracchoice-b, sim-tendfloor-guard-b,
  sim-rolecensus, journey2-succession-r137 (this run's salvage),
  sim-sweepcount-a, journey-scale.
- Worktree journey2-endgame registered (run_id 2026-11-05T11:55:54Z);
  standing heartbeat loop beats every 300s (detached setsid, pid
  recorded in-run). Registration itself was slow under sibling load.

SUBSTRATE: r135 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max on a dead village,
never ticked to fill the leg). Probe:
scripts/probe-endgame-r138-20261105.js (r135 probe verbatim EXCEPT
renames r135->r138, evidence dir 2026-11-05/perseed-endgame-r138,
header). Analyzer: scripts/analyze-endgame-r138-20261105.js (r135
analyzer verbatim EXCEPT input dir, r135->r138, plus the
PRIMARY-BINDINGS headline r135 landed). No policy change, no new
instrument at pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r138-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r135 BASE (12c72ddc2 -> 27c9839c8, src only,
verified by git diff --stat): 6 files, 153 insertions, 14 deletions
— build.js (stamp only), conversation.js is NOT in range;
convo-wants.js (+59, deepening r104 favor-record repay select +
repay stale-opener voice fix), fieldFights.js (+34: establishment
r103 ffFired('ambush') instrument + triggerbuild-b THE PARTING TURN
in travelTo — a wave-4+ world monster gets one monsterTurn before
the player leaves its tile [needs-eyes]; the dmground GEARFULL and
finishhold focus-fire levers touched this file and were REVERTED, net
zero from those arms), game.js (+43), telemetry-hooks.js (+27, r103
actor-attributed skill-use instrument), food.js (+2/−1, sweepcount
GO LAND: the dawn spoil sweep line now states the unit count, e.g.
"Overnight, 12 unknown berries went bad" [needs-eyes]). NO gate,
price, deed, seat, or table change; gating freeze (Steve 2026-10-27
16:53) stands.
This pilot is a NEAR-REPRODUCTION check under that delta: expected
headlines identical to r135 EXCEPT five named text/mechanic deltas —
(a) hurt-return lines may gain the hurt clause where a returnee is
hp 1..7 at return, (b) the FRAG-FRAME pride framing may appear in
no-words sittings, (c) departure lines may LOSE a stale goalLine
annotation (a fix-shaped delta, not a flip), (d) THE PARTING TURN
may add one monster turn on wave-4+ world-monster tile departures —
wave-seed fight counts/anatomy may shift by a turn, (e) dawn spoil
sweep lines may now carry a unit count ("12 unknown berries went
bad" where r135 had the bare line). Any OTHER
headline difference is a same-run investigation item, never a road
claim, and is attributed first to this delta before any wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 4 pre-registered seeds):
89701 (waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Plan is keyed by seed value in the probe, so the subset
keeps correct plans. Seed reuse is DELIBERATE (matched before/after
per the r118/r135 precedent: same seeds, same probe policy, only the
game code changed) — no fresh band is needed or claimed for the pilot.

R135 PILOT BASELINE (per-seed, from the r135 run note; judged on
these 4 only):
- 89701 waves: announced d90, sat d92, WON LESSER (feared/light,
  final:mercy), 5 fights, uw4, standing 199, peakVet 1@d91, alive 9.
- 89702 waves: NO window, end survived, uw4, standing 199, 21
  fights, 3 kills, peakVet 2@d88 (end 0), alive 2.
- 89704 forcedrift: village-lost (no-successor d45), uw3, standing
  0, 0 fights, alive 0.
- 89705 wavesnw: village-lost (scattering d110, third hungry day),
  uw3, standing 99, 0 fights, alive 1.

R138 QUESTION: (1) does the pilot reproduce r135 modulo the four
named deltas? (2) NEW — the dark side of the table, never played
end-to-end in a pilot: in PREPARED state (lesser seat, dark ledger),
does the feared/DARK walk play through — dark twist (name the
example), trial by combat (real blow-by-blow fight vs the Finale),
final live choice, recorded ending — and read as people? (3) people
check: does the sitting seed's finale read as people, and do the
r135-carried polish items recur?

DARK PROBE (prepared state, scripts/probe-darktable-r138-20261105.js):
built on the table-sense test's lesserSeat pattern (no new engine
calls): lesser seat + dark ledger (might 8, killed 12, protected 2,
betrayed 2, foodHoarded 8, foodShared 1, defiance 6) — branch math
verified in code (table.js tableBranch: dark 7 vs light 0). Seven
walks, each a fresh game at seed 777, scholar.day set to 90 except
V5 (the table does not price a win before ninety dawns):
- V1a-loss: kill opening, trial, fresh gear — the bearer dies, the
  mantle passes, name curdles (horror 2+3=5), the walk downgrades
  to Assimilated and plays out there.
- V1b-honest: mercy opening, trial, Apex Bow (loot tier 4, +95,
  range 9) + 200 arrows + the real 100-HP pool — can an honestly
  geared endgame bearer win the trial?
- V1c-tank: mercy opening, trial, Apex Bow + 5000-HP pool — does
  the WIN branch work mechanically at all?
- V2-notrial: mercy opening, trial skipped (hold) — the door not
  taken; name fires, dark final records.
- V3-sitter: villager sitter — the seat-taker guard must withhold
  the trial aloud and the walk must continue without it.
- V4-conscript: day 90 — the dark conscript is offered and refused;
  the refusal must be voiced and the challenge must resume.
- V5-dayfloor: day 1 — the win-day floor must withhold the win
  (THE TABLE WAITS) instead of recording it.
The trial fight is driven by the harness driveFights (default
driver: strike nearest monster, wait out the turn — never flees).
Instrument corrections from the smoke run (judged run is the
re-run after these fixes; the smoke's trajectories are quoted as
the bugs' evidence, not verdict input, per the r136 precedent):
(a) the 'p' fighter's HP re-syncs from scholar.health, so the pool
must be set on the scholar BEFORE the fight, not on the fighter
mid-fight; (b) tbEnd clears tbfight, so "fight over" is "no live
fight", not tbfight.over; (c) beat-1 labels are modal text, never
said aloud — the probe checks effect say-lines; (d) kill-then-name
always curdles by design (the tightrope), so the main walks open
with mercy and V1a documents the curdle→downgrade instead;
(e) every dark walk at day > 7 opens with the pods conscript
before the beats — all day-90 variants refuse it as a matter of
course (V4 tests the offer explicitly).
Smoke findings carried as observations, not verdicts: the trial
death path works end-to-end (mantle passes mid-table, Benoit
Lambert wakes as the new bearer); the Finale grows and one-shots
a fresh bearer; a day-1 dark final resolves but the win is
withheld by the ninety-dawn floor.

INTERESTING FINDING (what would count): any pilot-vs-r135-pilot
headline difference other than the four named deltas; any full-seat
win; any wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind (monster-commitment violation); any hurt-return misfire;
any ambush death missing from fallen; any dark-probe step failing to
fire, resolving silently, or stranding the walk with no modal and no
fight; any transcript passage senseless, robotic, or
self-contradictory; a named Scout mechanism; a named "experiment"
cause (both carried from r135, still open).

BINDINGS (pilot-scaled from r135; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r135).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; control-dead-before-window + zero relay finals
  in block = INFO/vacuous, not NO-GO (r124 rule, kept).
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (r130 revised rule: seat-kind pass — lesser despite full bars
  met is a named gap, not NO-GO).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the expected road reading, not pilot
  failures (same reading as r121/r124/r128/r130/r131/r135).

BINDINGS (dark probe — a miss is NO-GO, never re-scored mid-run):
- D1-dark-branch: the walk resolves branch 'dark' (tableBranch read
  on the prepared ledger) and beat three offers name/refuse, not
  spend/keep.
- D2-dark-twist: choosing 'name' (Exemplum) fires its say line and
  moves the meters (terror +3, horror +3, curdle-guarded).
- D3-trial: choosing 'trial' starts a real fight (tbfight live vs a
  finale fighter); the fight resolves to a tbEnd result; the resume
  fires (terror 10 on win; weakened+1 and the mantle line on loss).
- D4-finals: the dark final ('example') resolves to a recorded ending
  (table_won carries the ending, or a downgrade is offered and taken
  — never a silent strand, never a missing modal).
- D5-sense: the full dark transcript, read in full, has no fabricated
  shared history, no filler loop, no self-contradiction (judged by
  reading, not counts).
- D6-withdrawal: V2 refusal keeps the trial door shut for the rest of
  the walk; V3 sitter-guard withholds aloud and the walk continues.

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs. The "teeth fix" (r130) still stands on its
proof test, not pilot text — the war-path remainder branches did
not fire in r135 either.
