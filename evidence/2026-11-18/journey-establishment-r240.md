# Journey leg ESTABLISHMENT — r240 run note (2026-11-18, Lane A)

## Run
Run id `playtest-loop-a-20261118T134348Z` (scheduled Wed 2026-11-18
07:45 CST). Rotation read `1` (establishment); write `1→2` at
closeout with read-back. **Base:** local master `8709e9f87`
(verified = worktree HEAD at registration). Heartbeat loop running
(9-min cadence, `journey-establishment-hbloop-r240.sh`). Pre-flight:
main tree CLEAN, disk 50%. Lock created by coordinator
2026-11-18T13:43:48Z. No push (ship loop owns pushes).
Registration took ~8 min (box load — a sibling `git reset --hard`
plus several heartbeat flocks contended for REGISTRY.lock; the
worktree registered cleanly at 13:50:08Z).

## Pre-registered bars (r240 prereg)
Q1 FAVORLESS ASK, third fresh-band re-read. Q1b WANT-RAISE,
regression guard + F5 per-seed floor watch. Q1c CASE-THREAD
PRE-EMPTION, report-only (a LOST ask is a defect finding). Q2
SITTING CLOSES, standing bar. Q3 recap paraphrase, report-only.
Q5 EXILE WARNING HEARD (new this run — r233 F1 probe: does the
player hear the d7 freeloader warning before a vote?). Q6 POLICY
FORAGING (new this run — r233 F4: does the competent policy
under-forage when sits are available?). Carried bars: SPOTTER,
LADDER, FASTER-ID, END, TRUST GUARD, VILLAGE, JAM, STRANDED /
TRAVEL / THREAD watches, PEOPLE CHECK, SCHOLAR-DEATH standing
metric, ROSTER-RECONCILIATION watch.

## Pilot (seed 101401, 42d) — gate passes with one recorded deviation
Ran clean in ~14s: endDay 31, over=true, aliveEnd 5, wave 3,
standing 25, pantryEnd 0, wedgeSits 37, bumpCalls 39, codexPlants
24. **The pilot village collapsed at day 31** (game over, 5
survivors, pantry 0 — see F1). Every instrument clause fired:
spotter instruments (bumpLog 39), wedgeSits carry pick wantIds
(37/37) and Q1 trace fields (traceStart/traceEnd on all 37),
standingEnd non-null (25), scholarDawns 31 records, teleTypeCounts
48 keys, rosterDepartures 7 entries, sittingCloses present in the
JSON (empty array), Q5 regex present in the driver source.
**Deviation, recorded not hidden:** the pilot gate's
"≥1 people-check sitting is held" clause could not fire — the
end-of-run people check is skipped by design on game over (r81),
and the transcript file holds the skip note. The pilot forced no
driver or fix change, so per the prereg's restart clause the band
stands and the pilot seed is scored (r233 precedent); the people
check is drawn from a panel seed, as the PEOPLE CHECK bar already
specifies. **Metric-review item for the next run:** the pilot-gate
people-check clause should read "≥1 people-check sitting held OR
game over before the check with the skip note written".
Bit-identical proof: the r240 pilot JSON vs the r233 driver run on
the same seed 101401 — identical except `run` and `exileLines`
(both 0 lines on this seed). The Q5 regex extension is
behavior-neutral, as pre-registered.

## Analyzer verdicts (r240 panel, seeds 101401–101405, 42d)
- **Q1 FAVORLESS ASK: GO — 1/70 raised asks (1.4%) never
  materialized into a committable favor (r233: 1/53 = 1.9%; r232:
  2/77 = 2.6%; r231: 13/82 = 15.9%).** Rate < 20%, stage-0-deflected
  0, every sit classified (E1 1/1). The low rate HOLDS on a third
  fresh band — the r231 fix is not band-specific.
- **Q1c CASE-THREAD PRE-EMPTION: 1 E1 sit, DEFERRED not lost.**
  Alma d26 (101405): openThread goal, 6/7 case picks
  (`betrayal:*:case_N`) + goon, want opener never ran, `dlg:help`
  never pressed, need forage_help/u2 live. The ask surfaced in
  Alma's end-of-run sitting — she opens it still asking about the
  creek water run (see People check). Same shape as r233, one
  fewer case pick. No LOST ask anywhere on the panel, so no defect
  finding; the precedence question stays with the conversation
  build arm.
- **Q1b WANT-RAISE: GO — 70/269 social sits raised ask_favor
  (26.0%); any-want sits 264/269; zero-raise seeds 0/5.** Per-seed:
  41.4%, 25.9%, 16.4%, 21.8%, 34.5%. **The F5 spread does NOT
  recur:** the thinnest seed this run is 16.4% (r233's thin seeds
  were 5.8–6.2%). No seed under 7%, so no per-seed floor question
  is owed. Kinds: forage_help 45, heal_help 8, sick_help 6,
  food_share 5, water_haul 5, (no-kind) 1.
- **Q2 SITTING CLOSES: 0/8 CUT — GO.** 0 engine-ended WITH closing
  beats (no engine-ended sittings at all on the scored seeds — the
  8 sittings all ran their full 8 turns or closed gracefully).
  Parting pool: 0 serves this panel (reachability question stays
  closed).
- **Q3:** recap paraphrase distinct 2/8 sittings (raw 4) —
  report-only, no second formulation owed. Canned lines: all else
  0 except slope-reading 1/2.
- **SPOTTER GO:** 43 total (8/9/9/15/2), 5/5 seeds > 0.
- **LADDER 4/5** (pace read, report-only under a SPOTTER GO).
  Seed 101405 misses (spotter 2, nobody at 5 XP — see F4).
- **FASTER-ID 5/5:** 99 benefit plays in 143 bump calls.
- **CODEX 123** plants identified at end across 5 seeds (r233: 120).
- **END BAR: 11/14 — MISS (see F1).** The two misses are both on
  the collapse seed 101401 (Benoit broken d9, Elijah broken d28 —
  11 end attempts, all 'end-stranded'). The other 11 opportunities
  close the same day they break. The miss is the F1 defect, fixed
  this run (see below) — the bar is re-read on a fresh band next
  run, not re-scored here.
- **STRANDED BAR: 12 stranded dawns on 1 run (Benoit's), 0 worked
  on, guard fires 0 — with 1 BAR MISS:** d27 held no social sit
  (accept/start) while Benoit's run stood stranded. The village was
  collapsing that day (3 deaths, pantry 0); the wedge held no
  sitting at all. The miss is the same collapse shape as the END
  miss, not a separate mechanism — the wedge cannot sit with anyone
  when the scholar is stuck out in the wild (F1).
- **TRUST GUARD 0 drops. JAM 2 jam-days (both 101401).**
  **VILLAGE BAR 5/5 by the analyzer's definition** — with the
  honest footnote: aliveAt40 falls back to the last daily record,
  so 101401 counts as "5 alive" from its day-31 end-state. In plain
  words: 4/5 villages played the full 42 days; the pilot collapsed
  at day 31.
- **THREAD 0/0, TRAVEL 0/0 — NO-OPPORTUNITY** (no paged ends, no
  homeward sit hit a clearable blockage per the analyzer's
  homeHit — see F1 for why that read is now suspect: the creek
  overwrote the tree in the blocked record).
- **ROSTER:** 0 unaccounted on all five seeds. Departures logged
  and matched by id everywhere (13 villager deaths, all matched —
  removalLog names the how for each).
- **SCHOLAR DEATHS 2/5 — WATCH, at bar.** Aria d16 (101401,
  sickness) and Arnold d35 (101405, the wild). Both woke AWAY from
  Haven the morning they died (Aria (4,2), Arnold (1,3)) — the
  same shape as r232/r233. No directional move vs r233 (2 = 2):
  the wildavoid + fleerepair base changes did not move the count,
  adjudicated as band noise. Aria's death now has a named mechanism
  (F1) instead of an unexplained outing.

## FINDING F1 — the creek that hid the tree (END BAR miss, FIXED)
The pilot village's scholar Aria woke at (4,2) every dawn d9–d16,
NOT at Haven, and the walk home failed 8 times — then she died
d16 of sickness while still stuck out there. A probe (temp driver
copy in /tmp, travelTo refusal logging, never committed) names
every refusal: south to (4,3) is a **fallen_tree**, south from
(5,2) to (5,3) is a **fallen_tree**, west to (3,2) is a **creek**.
Both trees are clearable by hand; the creek is not. The walk
tried to route around (east to (5,2), back, west at the creek)
and stopped — and `walkHome` reported the **creek**, because
`tryStep` OVERWROTE `blocked` on every refusal. The stopping block
is the last refusal, not the obstacle on the direct route home.
travelHome84's clear-and-retry keys off the reported block, saw
'creek' (not clearable), and never cleared anything. The trees
were never cut, the scholar never got home, Benoit's run never
closed, and the village starved out from day 27.
**Fix landed this run** (src/js/game.js `walkHome` + the r240
driver's `travelHome84`, proof test
`scripts/test-journey-establishment-r240-walkhome-firstblock.js`,
27/27 green, 12/27 RED on the pre-fix tree): `blocked` is now the
FIRST homeward refusal, and walkHome also returns
`clearableBlocked` — the first refusal clearBlockage can handle —
so a walk stopped by a creek on the direct route can still clear a
tree on a sidestep and detour. The proof test covers the r240
geometry (tree named, cleared, home reached), the detour geometry
(creek named AND tree offered, cleared, home via detour), the open
path, all-creek, and the driver source. The r137 clearhome test
stays green (37/37), as do all carried establishment proof tests
(r231 19/19, r230 13/13, r225 18/18, r214 10/10, r139 35/35, r221
7/7) and the scale walkto test (6/6). `[needs-eyes]` on the fix
commit: it changes when a stuck walk gets home — a player can now
get home instead of sitting behind a creek for a week.
**Driver note:** the r240 driver file was updated post-panel as
part of the fix (travelHome84 prefers clearableBlocked). The panel
corpus was produced by the pre-update driver; the fix is proven by
the proof test, not by a panel re-run. The next establishment run
re-reads the END BAR on a fresh band with the fix in.
**Residual, documented not fixed:** walkHome still steps back onto
a tile already on its path when that step is a homeward axis step
((4,2)→(5,2)→(4,2) oscillation) — the sidestep-only path guard
does not cover axis steps. The fix makes the oscillation harmless
in the r240 geometry (the first refusal is cleared), but a walk
with NO clearable refusal still burns steps bouncing. Named for
the build arm; no change in this run.

## FINDING F2 — the acceptance echo, third sighting (watch)
Naoise's sitting (101405, people check) repeats the player's
acceptance back nearly verbatim: YOU "All right. Let's ask them."
→ THEM "All right — let's ask them." Same shape as r239's Walt
line and r233's Paolo line — three runs in a row now. Short and
functional, not a defect by this run's bars, but the pattern is
established: the engine echoes the player's own words as the NPC's
reply on link/raise accepts. Documented for the conversation build
arm, not fixed here (dialogue-content change, outside this run's
panel scope — same call as r239).

## Q5 — EXILE WARNING HEARD: NO-OPPORTUNITY (instrument proven, unexercised)
**No exile fired on any of the 5 seeds** (exileLines 0 everywhere,
removals all `killed`). The Q5 question — did the player hear the
d7 warning before a vote — has no data this run. The instrument
itself is proven: the extended regex is in the driver (grep for
"pull weight"), the pilot re-run is bit-identical with it, and the
analyzer prints the exile-lines line per seed. The r233 F1 probe
stays open for a run where an exile actually fires. Not a pass,
not a fail — NO-OPPORTUNITY, recorded as such.

## Q6 — POLICY FORAGING: the F4 shape does NOT repeat
Per-seed bumpCalls vs wedgeSits vs joint forage_help commits:
101401: 39/37/2; 101402: 27/66/5; 101403: 14/78/2; 101404: 35/60/5;
101405: 28/74/5. **No F4-shape seed** (bumpCalls ≤ 2 with
wedgeSits ≥ 50): the thinnest forager (101403, 14 bumps) still
foraged 14 times with 78 sits. On this band the competent policy
DOES forage when sits are available. r233's 1-bump Willie stays a
seed-level quirk, not a policy rule — but the mechanism (sits
crowding out solo forage) is unprobed, and one thin seed per panel
would still be worth a sim-lane look if it recurs.

## Q4 — census (plain words)
Five villages, 42 days. Four played the full leg; one fell apart
at day 31.
- **101401 — the collapsed one.** Twelve people at dawn, five left
  at day 31, pantry empty from day 27. The dying: Aki d14 (a wound
  that wouldn't close), Aria d16 (sickness — the scholar, stuck
  behind the creek, F1), Theo d27 (monster), Benoit d27 (wound),
  Hiba d27 (sickness), Lucas d30 (starvation), Adaeze d31 (a
  contest). The village ate itself out of food while its scholar
  couldn't get home. Standing 25, wave 3. Spotter 8, codex 24.
- **101402 — the fat, quiet one.** Twelve of twelve alive, pantry
  9,000, standing 75, wave 3. Nobody died. Five joint forage runs
  committed, all returned. Spotter 9, codex 18.
- **101403 — the wave-4 one.** Nine alive at day 40, eight at the
  end, pantry 18,423, standing 125, wave 4. Four villagers died,
  all to monsters, all in the last ten days (d31, d31, d34, d40) —
  the wave-4 unlock brought the monsters to them. Spotter 9,
  codex 22.
- **101404 — the pantry one.** Twelve of twelve alive, pantry
  36,584 (the fattest on the panel), standing 25, wave 3. Nobody
  died; the village cooked and preserved (cook 4, preserver 2 on
  Dalva alone) and banked the most plant knowledge (codex 31,
  spotter 15 — the deepest bench). Standing 25: alive and fed and
  standing still, because standing only counts war, diplomacy, and
  feasts (see r233 F3).
- **101405 — the climber.** Ten of twelve alive, pantry 8,466,
  standing 115, wave 4. Two died: the scholar Arnold d35 in the
  wild, one villager d27 to a monster. Five water hauls committed
  (the only water_haul favors on the panel). Spotter 2 — the
  thinnest bench on the panel, nobody reached 5 XP (the LADDER
  miss). Codex 28.
- **The dying:** 13 named villagers died across the five villages
  (of 179 death events — the rest are monsters the villagers
  killed). Causes: monster ×6, sickness ×3, wound ×2, starvation
  ×1, contest ×1. Nobody was exiled. No village starved except the
  collapsed one.
- **What they knew:** the scholar's plant codex holds 18–31 plants
  per village at end (123 total). Spotter knowledge concentrates
  in one forager per village — except 101405, where it barely
  moved at all (spotter 2).
- **What they carried:** joint favors are almost all forage_help
  (45 commits across the panel; heal_help 8, sick_help 6,
  food_share 5, water_haul 5). Pantries end 0–36,584 kcal. Wave 4
  reached on 2/5 seeds (101403, 101405) — the standing split holds
  at t4=100 (125 and 115 → wave 4; 75 and 25 → wave 3). No wave-4
  kills or party launches in the instrumented records — the
  telemetry type-count map again PROVES the absence rather than
  assuming it: no telemetry type records party launches
  (combat_start/end, contest_fired/end, companion_kill_beat,
  scale_rank are all present; no launch type exists). The
  launch/kill instrument gap is still open.
- **Social life:** wants are raised in 98% of social sits
  (264/269). A villager who says "How can I help?" hears the live
  ask — 1.4% favorless on a third fresh band. And the villages feel
  inhabited: Alma still asking about the creek water run days after
  a trial ate her sitting; Naoise asking the hard question about
  what you've done since the sky changed.

## People check — PASS (seed 101405, Alma + Naoise, read in full)
- **Alma** (community gardener): PASS, with one soft beat. Opens
  resuming a live ask ("About the creek water run — the need hasn't
  gone anywhere. I'm still asking.") — the want is real, and it is
  the SAME ask the Q1c case thread deferred on d26, now surfaced
  in the flesh. The commit lands ("Dawn, then. Bring something to
  carry — and thank you."). The gossip is concrete ("Fatima drank
  the creek water straight. No boiling. Nothing happened. Nothing.")
  and the seedling envy is specific ("The seedlings Sanne touched
  are twice the size of mine. Same soil. Same water."). Closes
  warmly ("This was good." They mean it.). One wrinkle: "The moment
  passes without landing. Not yet." after "I'm listening, I promise"
  — a single dry beat, not a loop.
- **Naoise** (truck driver): PASS — the better of the two. Opens
  with a link proposal, a real want (link with Ashford). The
  player's acceptance is echoed back nearly verbatim ("All right —
  let's ask them." after "All right. Let's ask them.") — the F2
  echo, third sighting. The rest is strong: the Cattail lesson
  lands ("And I've been walking past it for weeks."), the guilt
  question is real ("What's the worst thing you've done since the
  sky changed?"), the NPC's answer is honest and specific ("We're
  all doing math that doesn't add up. You're still here. That
  counts." / "I don't answer that one myself. Not yet. Maybe when
  I've decided whether surviving counts as an excuse or just a
  reason."), the recap names the live thread ("Still on the worst
  thing you've done."). Closes warmly ("Good talk. I feel like I
  know you a little better now." + "Come back anytime.").

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. Four villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire. The
  fifth collapsed — but it collapsed to a named, fixed mechanism
  (F1), not to unreachable content.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; Alma's still-open ask and Naoise's guilt
  question are the game at its best. The one false note left is a
  one-line echo (F2), not a broken beat.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~30 monsters each, bank spotter skill, and reach wave 3 on
  5/5 and wave 4 on 2/5 seeds. No village reached national/table —
  expected at day 42. The binding watch is now a fix with a proof:
  a scholar stuck behind a creek can get home again — the next
  establishment run re-reads the END BAR on a fresh band with the
  fix in.

## Metric review (§14)
- **Q1 GO, and the bar worked on a third fresh band.** The rate
  (1.4%) and the stage-0-deflected count (0) split the verdict
  honestly; the class mix (E1 1/1) named the residual mechanism
  instead of letting the GO hide it. The fix holds on unseen seeds
  — three bands now (2.6%, 1.9%, 1.4%).
- **Q1c bar WORKS.** 1 case-thread E1, deferred (surfaced 1/1),
  and this time the surfacing is visible in a full transcript, not
  just the proxy. Keep as written; the LOST-ask trigger (never
  surfaced) did not fire.
- **Q1b bar WORKS, and the F5 watch CLOSES.** 26.0% panel rate,
  no zero-raise seed, thinnest seed 16.4% — the 5× spread is gone
  this run. No per-seed floor question is owed. If a future panel
  shows a thin seed under 7% again, re-open it then.
- **Q2 bar WORKS on the new base.** 0/8 CUT. Keep as written.
  The TRAILTALK + REL-MOURN + homebody/holder-voice landings did
  not move the close rate.
- **Q3 — report-only, stable.** Distinct 2 (raw 4). No formulation
  owed.
- **Q5 — NO-OPPORTUNITY, instrument proven.** No exile fired, so
  the warning-heard question is unanswered this run. The bar stays
  as written for the next run; the instrument extension is in the
  driver.
- **Q6 — report-only, answered on this band.** No F4-shape seed
  (min 14 bumps). The policy forages when sits are available — on
  this band. The r233 outlier stays a seed-level quirk.
- **END BAR — MISS, fixed, re-read owed.** 11/14 with both misses
  on the collapse seed, mechanism named (F1) and fixed with a proof
  test. The miss is reported as a miss, not re-scored; the fix's
  effect is the next run's measurement, on a fresh band.
- **STRANDED BAR — 1 miss on the collapse seed, same mechanism.**
  Not a separate finding; the d27 no-social-sit dawn is the scholar
  stuck in the wild (F1).
- **Scholar deaths 2/5 — WATCH, at bar.** Fourth straight panel
  with scholar deaths (r231: 3, r232: 4, r233: 2, r240: 2). Both
  away from Haven. The A/B is the sim lane's (already triggered);
  this run names one death's mechanism (F1) instead of adding a
  new escalation.
- **LADDER pace read, again:** the thin seed (101405 spotter 2)
  misses pace while its scholar foraged 28 times — the spotter XP
  concentrates in one villager per village, and on this seed that
  villager never got going. Not a bar failure.
- **Wave 4 on 2/5 (was 1/5).** Not a bar — the standing
  attribution is exact again: t4=100, threshold between 75 and 115
  on this band.
- **Roster watch CLOSED as an instrument gap, answered again.**
  0 unaccounted on 5/5 seeds with departures logged and matched by
  id, AND the how named per departure (removalLog). The open
  question is no longer recording — it is whether a departure is
  narrated to the player (Q5 answers it for exiles when one fires).
- **Telemetry baseline — do NOT roll.** LOUD on guardrails.* is
  the known schema mismatch (prereg-predicted); c3 quiet.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r240 panel's
  deaths / pantry are all in-band in the analyzer (4/5 alive d40,
  pantries 0–36,584, 1 starvation death on the collapse seed).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-18/journey-establishment-r240-gate.log` —
**335 passed, 6 failed in 821s, 0 attributable.** The 6, each
verified pre-existing (the proof pair re-run failing on the
pristine tree with game.js reverted; the rest match r233/r239's
gate exactly):
- 2 load timeouts (exact 120s): living-garden,
  one-person-army — the standing deed-attainment timeout class
  (r233's gate had the same two). Occupation-panels (103s) and
  trust-observer passed in-gate this run.
- `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — the balance-proof manifest is
  STALE on this base ("Proof source inputs are not current"). Same
  pair as r233; the refresh (`scripts/balance-proof-update.js`) is
  measurement-maintenance work, not this run's (r233 precedent).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r233/r142).
- `test-ladder-bundle-20261108.js` — same control fail (200
  monster turns WITHOUT delivery fire the ambient raid — fires 0).
- Separately verified, NOT a gate failure: the creekpath Arm B
  proof test (`test-creekpath-armb-b.js`) fails its determinism
  check (fresh refused=0 vs old refused=6) IDENTICALLY on the
  pristine tree — pre-existing drift since the 2026-10-28 corpus,
  not attributable to the walkHome fix. The r104 rescue-goaround
  test takes a corpus argument and was not run standalone.

## Closeout
- **Commits (branch `journey-establishment`, after rebase onto
  `a468aec09`):** `47e351d0c` prereg + driver/analyzer clones
  (tooling only, as-run driver); `58cb4ad44` walkHome first-refusal
  + clearableBlocked + driver travelHome84 preference + proof test
  27/27 `[needs-eyes]`; `1d51338f2` run note + pilot / panel /
  analyzer / gate logs; this correction commit (rebased hashes —
  pre-rebase tips were `76bc2dca7` / `6095a48ec` / `b2396c2c9`).
  Safe-commit index clobber struck on all three commits
  (staged-as-deleted / stale-blob / purged-entry patterns); repaired
  each time via the `ls-tree -r` pipe, blobs verified against HEAD,
  index == HEAD after each repair.
- **Master moved during the run** (Loop B merged
  sim-handoffrec-retry-b `52c21de71` + `a468aec09`, evidence-only,
  no src/js overlap): rebased clean onto `a468aec09` (3/3, no
  conflicts), proof tests re-run green on the rebased tip (r240
  27/27, r137 clearhome 37/37).
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 1→2 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r240 panel corpus (per-seed JSONs + convo transcripts)
  lives under the goal hidden_files evidence dir for 2026-11-18;
  the repo evidence dir holds the prereg, run note, analyzer log,
  gate log, and pilot/panel stderr logs.
