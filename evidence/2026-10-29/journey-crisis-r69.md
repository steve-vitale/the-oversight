# Journey crisis r69 — post-armor pilot: bends healthier, breaks on the same bargain (lane B, leg 6)

Successor to crisis r66 (re-baseline GO: 2/3 horizon, episodes fire,
gates hold, 9411 phoenix-wipe documented as drama not defect). This
run does NOT re-litigate r66. It asks the one new question current
master poses: does the village still bend without breaking under
siege NOW THAT ARMOR IS LIVE?
Pre-registration:
`hidden_files/evidence/2026-10-29/journey-crisis-r69-prereg.md`
Base: master bf0f14f60 (r66 base 9d96bb738 + fix-all armor landing
9c650f840/062e07a7a + measurement-only commits + coordinator
evidence bf0f14f60). The ONLY src/js delta since the r66 base is
the armor landing: NPC armor craft live-enabled, armory pile draw
live-enabled, bark inflow 15% -> 30%, up to three staying bark
wearers seeded at village creation.

## Run setup (done first, per the body)
- No Lane B lock present at run start — no stale-lock recovery
  needed. New lock written run 2026-10-29T15:57:13Z.
- Main-tree pre-flight: 1 untracked file at first check
  (evidence/2026-10-29/sim-food-economy-round-1530-b.md, a sibling
  coordinator's round note written 15:55 UTC). Per the body, a
  sibling mid-landing gets a 10-minute wait and re-check before
  any fail-loudly abort. The re-check (15:59 UTC) found the tree
  CLEAN: the sibling coordinator had landed the file itself as
  bf0f14f60 while this run waited. No abort, no main-tree write
  by this run. Disk 19%, `git pull` already up to date, stashes
  listed and untouched, worktree-reap ran clean (active 6/16).
- Worktree journey2-crisis (body slug), registered 16:01:26Z,
  heartbeat verified in registry (16:05:46Z) and re-heartbeated
  every 10 min by a logged loop (log:
  goal hidden_files/journey2-crisis-heartbeat-r69.log).
- A runtime restart killed the 10-minute wait command mid-sleep
  (2m52s in); the re-check above is what the wait was for, and
  it passed on the sibling's own landing, not on this run's
  action.
- Canon: docs/CANON.md read in full before playing. Gating freeze
  (2026-10-27) untouched. Rotation-b still 6 at run start (r63
  and r66 both recorded "advance 6 -> 7 on this landing" yet the
  file still read 6 — this run writes 7 itself and verifies it).

## Fresh panel (r66 driver/analyzer verbatim -> r69, names only)
Instrument: `scripts/journey-crisis-r69-delayed-20261029.js` +
`scripts/analyze-crisis-r69-delayed-20261029.js`, policy oracleV2,
120d death-aware (+10d tail). EVID exported:
`hidden_files/evidence/2026-10-29/r69-panel/`.
Diff r66 -> r69 is names only (verified: every differing line is
an r66 -> r69 rename); node --check clean on both scripts.
Seeds 9407 / 9408 / 9411, sequential, never concurrent, all
exit 0 (16:06-16:09 UTC). Analyzer output:
`hidden_files/evidence/2026-10-29/r69-panel-analysis.txt`.

## C1 (bend, not break) — GO (2/3 horizon, as r66)
- 9407: horizon, 8 alive, 8,626 kcal.
- 9408: horizon, 7 alive, 2,951 kcal.
- 9411: game-over day 97 (days field 90 — tail lag, see below),
  0 alive, 7,236 kcal. Cause named below, not averaged away.

## C2 (episodes fire + gates hold) — NO-GO as pre-registered, on
## one clause only, with a named non-defect cause
- Raids fire on all seeds: 10 / 10 / 8. Fought resolutions on
  all seeds: 9407 d15/d29/d37/d47/d54/d64/d79/d83/d94/d110;
  9408 d8/d17/d26/d38/d47/d65/d83/d101/d116/d120;
  9411 d16/d24/d37/d44/d63/d72/d84.
- Gates hold: TRUE early 'fought' resolutions = 0 on all seeds
  (r60 definition, corpse-excluded); drift unknown []; D1
  snapshots 6/6 (delayed >= 3 attempts); D2 clear rate 5/5
  (all ok sorties cleared); deltaBad []; sortie attempts 6,
  ok 5, refused 1 (9407 d36 Big Big — a refusal, not a failure).
- Gorge nights + sortie attempt: 9407 14 nights / 4 sorties;
  9408 20 nights / 2 sorties; 9411 ZERO nights / ZERO sorties.
  Per the prereg, a 0-episode seed is NO-GO for that clause
  and is investigated, not averaged away. Investigation: 9411's
  episodes all resolved by tick fights AT THE DOOR (7x
  fought(tick)); no lingerer set ever formed, so the
  delayed-sortie instrument had no substrate to intervene on.
  Nothing failed to fire — the village fought everything
  immediately, so there was nothing left lingering to gorge or
  sortie against. That is a trajectory property, not a broken
  episode system. The miss is recorded as NO-GO per §14 (never
  re-scored mid-run); the metric revision is proposed below
  for the NEXT run, not applied here.

## C3 (people check) — GO
Read in full: all 22 new transcripts (7x 9407, 8x 9408, 7x 9411).
fabricHits 0 panel-wide.
- NPCs want concrete things: Mara (9408 d48/d102) refuses to
  choose who eats and wants the plantain patch worked ("The
  stores won't stretch past tomorrow"); Asher (9411 d17) wants
  a festering wound cleaned and wrapped ("If it festers I'm no
  good to anyone — can't haul, can't hunt, can't watch"); Anh
  (9408 d18) wants a persimmon run ("I did the count twice.
  The count doesn't change."); Jada (9408 d39) is burning up
  and begs for someone who knows sickness.
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" / "Still
  the same thing —" / "I've told you three times now —" and
  then close ("Right. I get it." / "Go. But sit with what I
  said." / "Okay. That's — I need a minute."). Doubt escalates
  (careful → choosing words → rattled → done talking). Recap
  escalates then closes ("Okay. We'll pick this up later.",
  "I should get back to it.").
- Grief reads as people: Mara on Jada (d66: "I dreamed Jada was
  still here. Woke up angry at the dream."; "Nobody says Jada's
  name right yet. We will."); Amanda on Pavel/Luis (9407 d84:
  "Pavel is gone and Luis is gone and the world just...
  continues. That's the part I can't stand." — then "I'm
  picking up Luis's share of the work. Someone should, and it
  might as well be me."); Asher on Yuying ("We bury, we grieve,
  we keep going. There's no step four.").
- Invitations are sometimes taken, in this leg too: Asher
  (9411 d25) "I'd love to. Lead the way"; Mara (9408 d66)
  refuses twice, then "Okay. Yeah. I trust you."; betrayal
  accepts carry real consequences (Leo's buried bundle +1,221
  kcal, d64; Amanda's stockpile +4 wood/+4 fiber, d75; Ava
  teaching slope-reading for water, Codex-noted, d85).
- No fabricated shared history flagged. The "(conversation
  ended by the engine)" marker appears in all 22 transcripts —
  per r66 it is the RECORDER's annotation, never player-facing
  text, and every transcript's last NPC line already resolves
  the thread. Not re-litigated as a defect.

## C4 (post-armor band vs r66) — movement reported, not judged
Same seeds, same instrument, only armor changed. Band movement
in either direction is reported; causation is NOT isolated
(armor changes play, play changes RNG consumption, so
trajectories diverge for many reasons — no armor-off control
arm in this run, so no "armor saved the villages" claim):
- 9407: 3 -> 8 alive, 2,100 -> 8,626 kcal, raids 11 -> 10,
  gorge 22 -> 14, sorties 5 -> 4. Healthier, fewer gorge nights.
- 9408: 2 -> 7 alive, 0 -> 2,951 kcal, raids 11 -> 10,
  gorge 7 -> 20, sorties 2 -> 2. Healthier AND more gorge
  nights — the gorge-heavy village still held.
- 9411: game-over both runs, but a different story. r66: day-83
  wipe, 64,083 kcal, TEN burns chained in ONE fight. r69:
  day-97 wipe, 7,236 kcal, NINE burns across THREE fights
  (Giulia + Katarina d78, Ava d95, then Alejandro, Saul,
  Greta, Emma volunteered + Klaus, Kentaro chosen by the fire
  d97), village starving at the end ("STARVING: health and
  energy falling" d95/d96; fireside "8,364 of 14,000 kcal"
  d95). The clause's per-fight chain is still uncapped in this
  record — the final fight chained SIX burns — which sharpens
  r66's Steve-call with a second observation rather than
  answering it.
- Days-counter tail lag persists and grows: r69 days field 90
  vs wipe day 97 (r66: 77 vs 83). Same instrument-wobble class;
  judge bands, not the counter.

## C5 (armor shows up) — YES, concretely (observation, not a gate)
- SUPPLY: 9407 bark strips flow into the stash ~20 times across
  the run (Emma, Pavel, Sanne, Naran, Amanda, Augustin, Linh —
  1-3 strips each, "No announcement. That's how it works
  here."). The widened inflow is visible as a habit, not a
  number.
- CRAFT, success AND failure, both narrated: 9408 Nora sews a
  bark armor d55 ("Nora wears it now"); Quinn's d57 attempt
  comes apart ("The bark strips are wasted"); 9411 Leo fails
  d47, succeeds and wears d52; Alejandro fails d85. The NPC
  craft loop is firing in play, not just in flag-on sims.
- PLAYER: 9408 equips looted bark armor d98 ("Equipped Bark
  armor (torso).").
- GAP (recorder/instrument, not a defect claim): seeded wearers
  (creation kits) are never narrated as such — no line says a
  villager starts wearing bark armor; only crafted pieces get
  "spent the afternoon" lines. No armory-pile-draw line matched
  either (pile mentions are weapons-pile dominated). So the
  craft loop is proven firing; pile-draw and seeding effects
  are not directly visible in this record.

## Village assessment (plain words)
- 9407: survives 120 days with 8 people (Amanda, Emma, Nora,
  Naran, Linh, Wibke, Nikita, Sholpan) and 8,626 kcal — the
  healthiest crisis village in this leg's recent record, after
  10 raids, 14 gorge nights, and 4 sorties. Its dead include
  two to dehydration and one to its own contest, alongside the
  wild and monsters — a village that bent and kept its shape.
- 9408: survives 120 days with 7 people (Sanne, Nora, Quinn,
  James, Gonzalo, Waimarie, Riley) and 2,951 kcal after 10
  raids and 20 gorge nights — the gorge-heavy village that
  still held, ending with Mara refusing to choose who eats
  and then trusting the player enough to follow.
- 9411: dies on day 97 with no one left and 7,236 kcal. It
  fought all 8 of its raids at the door, starved through its
  last days, and was eaten by its hero's bargain in three
  installments: two burns on day 78, one on day 95, six in the
  final fight against the Loud Beast — after which the fire
  found no one left and Nikolai Volkov's death stuck. The
  village that fed itself thin was eaten by the clause, not
  by famine alone.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights (2/3 seeds), sorties,
  aid resolutions, refusals, driven conversations, AND the
  armor craft loop all fire on current master.
- FUN: yes — the siege still reads as a real dilemma,
  conversations escalate instead of looping, the 9411 wipe is
  again the most memorable single story (now a starvation
  grind under the bargain, not a rich village's blowout), and
  armor crafting adds a visible making-and-wearing thread
  where failure wastes real bark.
- WINNABLE: the leg itself is not a win path; two villages
  survive it healthier than r66, one breaks on the phoenix
  bargain again. No win verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2
LOUD lines as r60/r62/r63/r66 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not
a bug: the baseline's field names describe an older
instrument; current records carry defendedFights (35 / 32 /
30 across the panel), not defenderFights. No NEW loud line.
Baseline NOT rolled.

## Test-suite call (documented, not silent)
No src/js changed in this run (measurement only; tooling-only
change: 2 new scripts, names-only clone of r66). Verification
run: r69 driver on 3 seeds (all exit 0), r69 analyzer (panel
verdicts above), node --check on both new scripts. A full
check-quick was NOT run, per r63/r66 precedent for tooling-only
changes: it re-verifies the base, not a tooling-only change,
the two new scripts are not in the quick list, and sibling
jest load is heavy. The next run that changes src/js runs the
full suite as normal.

## Metric review (§14)
- C2 judged as pre-registered: NO-GO on the gorge/sortie
  clause for 9411 only; all other C2 clauses (raids,
  resolutions, gates) GO on all seeds. The miss is NOT
  re-scored mid-run. Proposed for the NEXT run's prereg, not
  applied here: make the gorge/sortie clause
  lingerer-conditional — judge gorge nights + sortie attempts
  only on seeds where a lingerer set forms, and judge
  "episodes fire" on raids + fought resolutions for every
  seed. A seed that fights everything at the door should pass
  "episodes fire" without owing gorge nights it never had a
  chance to produce.
- C4 judged on outcome band, not byte-equality (r66 review
  carried): both horizon seeds moved band upward; 9411 stayed
  game-over but changed shape. Causation explicitly not
  claimed — an armor-off control arm is the follow-up if
  Steve wants the armor effect isolated.
- Carried (unchanged): instrument wobble in the tail (days
  field lags the wipe day: 90 vs 97 here); telemetry mapping
  proposal defenderFights -> defendedFights; dead discoverer's
  orphaned fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); phoenix-wipe frequency (needs a phoenix
  instrument, not crisis seeds); whether one fight should
  chain six-plus burns (Steve-call on the clause's design,
  now with two observations: 10 burns r66, 6 burns r69 final
  fight); gating freeze (2026-10-27) untouched.
- "Presentation only" caveat (r62, confirmed r63): a spoken
  beat moves seeded outcomes only where it fires.

## Blanks filled / held
- FILLED: post-armor crisis check (C1 GO, C3 GO, C4 band
  movement documented, C5 armor firing proven with quotes);
  9411's break re-characterized (same clause, different shape:
  spread burns + starving village, not one rich-village
  blowout); C2's gorge/sortie clause miss investigated to a
  named non-defect cause (no lingerers formed).
- HELD (not this run's): C2 metric revision (lingerers-
  conditional clause, proposed above); phoenix per-fight chain
  cap (Steve-call, two observations now); days-counter tail
  lag (instrument note); seeded-wearer / pile-draw narration
  gap (recorder note); armor causation (needs an armor-off
  control arm); phoenix-wipe frequency (phoenix instrument).
- No game change follows from this run. Rotation-b advances
  6 -> 7 (succession) on this landing, verified by re-reading
  the file.
