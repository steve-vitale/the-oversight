# Journey crisis r103 — three villages that bent and stood, and the favor ladder's repeat closed as designed (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: last Lane B run is r102 (social, wrote rotation
5 -> 6). This run takes r103 in the Lane B series so filenames
stay unique; the rotation file, not the number, is the authority.

Substrate r99 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r99 driver/analyzer verbatim EXCEPT filenames r103,
pilot seeds 10301/10302/10303, evidence dir 2026-11-02 panel subdir
r103-panel. Diff r99 -> r103 reviewed: only renames.
node --check clean on both scripts. Determinism leg: seed 10301
re-run BYTE-IDENTICAL (panel JSON, r103-panel/determinism/), so the
fork is trajectory-neutral.

## Run setup — clean registration, slow start, fast seeds
- No lock file existed at run start, so no stale-lock recovery was
  needed; fresh lock written (2026-11-02T07:01:35Z), to be deleted at
  closeout.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  and the directory still holds orphan evidence from Oct 14-25 runs.
  Same class as r88/r90/r93/r96/r99. This run uses
  journey2-crisis-r103 (unique, still the lane-B journey2- prefix,
  never the lane-A journey- prefix). The orphan dir is left
  untouched.
- Registration was slow but clean: `git worktree add` + reset took
  ~11 minutes under sibling load, then the registry entry and
  heartbeat landed (07:13:33Z, re-verified after registration; the
  standing 10-minute heartbeat loop's landing was verified by
  registry read-back, 07:15:04Z, with a readable log, never
  /dev/null). No EPERM flap this run.
- Pre-flight: main tree clean (`git status --short` empty), disk
  26% (df -h ~), `git pull` already up to date (d35e5550f).
  `worktree-reap.sh` ran clean: 9/16 active, held dirty trees
  (journey2-crisis-r90, journey2-succession, journey2-succession-r86)
  LOUD-protected and untouched.
- Smoke test first, into a scratch dir (not the panel dir, so the
  panel stays pristine; scratch dir removed after): SEED=10301
  DAYS=5 proved the doAction wrap runs (JSON parses, seed present,
  favorNoLongerCalls [], instrumentErrors [], 43 tick-part samples
  with forage/wait/drink verbs) before the panel launched.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; DISEASES.md, MONSTER-WAVES.md,
  CONTESTS.md heads re-read. Gating freeze (2026-10-27) untouched.
  No canon doc covers crisis-as-a-leg directly; the leg's systems
  are covered by DISEASES.md (sickness deaths here), MONSTER-WAVES.md
  (raider sets), and CONTESTS.md (moots) — none reinvented, none
  changed.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 10301 / 10302 / 10303, sequential, all exit 0 first attempt, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-02/r103-panel/.
Analyzer output: r103-panel-analysis.txt (same dir).
Pilot-only per §9-12: the pilot answered the leg's questions
(including closing r99's W2 — see C3), so no panel expansion; the
r99 panel seeds were NOT re-run.

- 10301: horizon, 120 loop days (say-day 125). 9 raids, 21 gorge
  nights, 2 sorties, 8 convos. Ends 9 alive / 2,757 kcal.
- 10302: horizon, 120 loop days (say-day 122). 7 raids, 24 gorge
  nights, 2 sorties, 8 convos. Ends 8 alive / 10,392 kcal.
- 10303: horizon, 120 loop days (say-day 122). 9 raids, 48 gorge
  nights, 5 sorties, 8 convos. Ends 7 alive / 5,147 kcal.

## C1 (bend, not break) — GO
- Gates hold per C2, and there is no game-over at all this panel:
  all three villages reach the horizon. C1(ii) is vacuous — no
  siege-mechanic failure anywhere, because no village fell.
- 10303 is the leg's long-siege case: 48 gorge nights, five
  sorties, two sortie deaths, and it still stands with 7 people.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 9 / 7 / 9. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 1 (10303 d91, corpse-counting
  method only — the prereg judges TRUE, so this does not fail C2).
- D1 snapshots all delayed >= 3 attempts: 9/9.
- deltaBad empty (9 attempts, 9 ok, 3 cleared to zero remaining,
  deltaExact 9). D3 drift unknown = 0 (labels panel-wide:
  sortie-clear 9, player-drawn-off 20, moved-on-valve 7).
- Days-tail wobble persists, same class as r70/r71/r82/r85/r88/r90/
  r93/r96/r99: loop-iteration days vs max Game say-day 10301 120
  vs 125, 10302 120 vs 122, 10303 120 vs 122. Judge bands, not
  counters.

## C2b (linger-conditional gorge/sortie) — GO, but W1 unanswered
- Lingerer sets form on all seeds. Gorge nights: 21 / 24 / 48
  (93 total, 107,469 kcal eaten at the treeline).
- Sorties: 9 attempts, 9 ok, 0 REFUSED — the first refusal-free
  panel since r90 (r93: 3 refusals, r96: 2, r99: 5). Full clears
  (remaining 0): 3 — 10302 d86 (Cliffhanger, 1 target),
  10303 d13 (Old Croaker), 10303 d49 (Chorus Line). Partial
  clears (broke, remaining): 6 — 10301 d107 (cleared 1 of 2,
  Big-Eyes 675 HP remains), 10301 d120 (cleared 0 of 1, The
  Herald 525 HP remains), 10302 d116 (cleared 3 of 5, The Eater
  712 HP + The Redactor 195 HP remain), 10303 d90 (cleared 0 of
  1), 10303 d98 (cleared 1 of 3), 10303 d108 (cleared 1 of 3).
- W1 (r99: does a re-muster ever FULLY clear?) is NOT answered
  this panel: with zero refusals there is no re-muster case at
  all. Refusals are seed-dependent (0/9 here vs 5/15 in r99);
  W1 carries to the next refusal panel.
- Sharp cases, named not judged: (a) 10303 d90 — a sortie BROKE
  against a single 16-HP target (The Callback), paid 6,023 kcal,
  cleared nothing. One case, no verdict; worth a look by the
  crisis lane only if it recurs. (b) The two partial clears that
  cost lives: Hannah faced The Eater on the d116 sortie and did
  not come back; Selvi faced The Eulogy on the d98 sortie and
  did not come back. (c) The Loud Beast re-linger-after-clear:
  first seen d95, sortied d98 (not cleared) and d108 (not
  cleared, episode 2) — the same monster id in two sets, never
  cleared across either.
- Boundary-sortie cross-checks read ok:true on all 9 attempts.
  (Several targets show 0 prior waited>=3 samples — the known
  sleep-roll stamping class from r88, not a hidden due sortie.)
- MISSED-WINDOW total = 3 (10301 d110 moved-on-valve, 5 tick-part
  waited>=3 samples from d109; 10301 d122 moved-on-valve, 10
  samples from d121; 10303 d92 player-drawn-off, 5 samples from
  d91): three instrument blind spots, counted here per the
  prereg, not game failures (r99: 3, r96: 2, r93: 1).
- Instrument observation (no game verdict): the driver's
  clearedGorgeAfter name-match reports 13 gorge lines after
  clears — but every matched line names a monster from a LATER
  set (The Ugly Beast d113-115 after cliffhanger@86; The Loud
  Beast d94-110 after chorus_line@49). The check is name-matched
  and secondary by its own comment ("r48 trap acknowledged"), so
  13 reads as name over-match, not "cleared monsters kept
  gorging". Carried as instrument hygiene, not a finding.

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds (R70/R82 sections);
  doActionWrapMissing false on all seeds; instrumentErrors [].
  Tick-part samples: 1091 / 1316 / 1222 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: 18 ending-turn cases
  across the 24 driven transcripts ALL show their outcome lines
  before the '(conversation ended by the engine)' marker. The 6
  transcripts without the marker each carry exactly 12 YOU PICKs
  — the driver's 12-turn cap, not an engine end, so no dump was
  owed (same class as r90's 2 cap-ended; r99 had 24/24 with the
  marker). The r88 fix stands proven again.

## C3 (people check) — GO, and r99's W2 CLOSED
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).
- NPCs want concrete things: Fausto's raid account ("I put down
  mosquito at the treeline. Don't call it brave. Call it awake")
  and his sky-split WHY ("The sky split and nobody wants to talk
  about WHY. I do. I need to know"); Tomas's Taking grief (aunt
  Angela, "Row on row of them, humming like a held note") and his
  teach-me hunger; Aurora's festering wound ("If it festers I'm
  no good to anyone — can't haul, can't hunt, can't watch");
  Jamal Vitale's eat-well goal ("You can tell a lot about a group
  by how they eat. I want us to eat well"); Hannah's control-group
  theory ("we're the control group... we're the ones they just...
  watched"). The favor probes behind every transcript confirm
  the game state: Aurora's heal_help stays 'asked' across
  d18–d77 with the Haven-door reason; Selvi's the same — favors
  that never complete because the positioning never lines up,
  which is the game state, not a defect. No favor ever returned
  'no longer available' (see F1).
- Grief is grounded in real deaths, not generated filler: Atlas
  (d21) mourns Aki — Aki died to a monster on day 20, the day
  before ("Since Aki died... I keep expecting to see Aki at the
  fire"); Carolina (d90) mourns Somchai — Somchai died of
  sickness on day 83 ("Somchai always took the burnt piece...
  Nobody says Somchai's name right yet. We will"); Jamal (d72,
  via lately) dreams Robin is still here — Robin died to the wild
  on day 71, the day before ("I dreamed Robin was still here.
  Woke up angry at the dream").
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —"
  -> "Still the same thing —" -> "I've told you three times
  now —"; recaps climb the same ladder to "We're going in
  circles a bit —" territory and close ("Alright — I should get
  back to it", "They let that thread drop — for now").
- W2 CLOSED (r99's watch item — does the favor ladder repeat its
  cap line on a 6th press again?): YES, and it is bounded BY
  DESIGN, not a polish gap. 10303 d18 (Aurora) presses
  favor_requirements 6 times: plain, "As I said", "Like I said",
  "Still the same thing", cap, cap — and then the driver moves
  to [goon], because the choice has left the menu. That is
  exactly the r35 spend-out as proven by
  test-social-r35-favorreq-spendout-20261020.js ("The 6th firing
  still voices the escalation; the 7th can never be offered"):
  the driver picks from the live menu each turn, so moving on
  after press 6 proves the spend. The recap ladder's distinct
  "circles" rung is not needed here — the favor ladder closes by
  spending the choice instead. r99's "future polish pass" framing
  is superseded; no fix is owed. (The same 5-press recap cap
  appears once each in 10302 d91 and 10303 d46 and then moves
  on — proper cap use, not a repeat.)
- Invitations are sometimes taken, in this leg too: Atlas's ridge
  walk and thinking place ("Don't tell the others. Everyone
  needs one place"), Jamal's ridge walk, Hannah's thinking place,
  Aurora's invite ("Alright. But I'm not carrying your stuff"),
  Carolina's invite, Jamal Vitale's thinking place. Gifts carry
  real consequences: Jamal (d84) and Aurora (d46) each press a
  decent kept tool into the player's hand; Fausto (d68) digs up
  a buried pre-Scattering cache (+1,725 kcal to the pantry).
  Teaching runs both ways: the player teaches Wild Soybean and
  Poison Hemlock ("And I've been walking past it for weeks"),
  Tomas teaches monster cues, plants, and places.
- Lately, observed only (r85 V2 answer stands, Steve-call):
  steered lately fired once on a defender (10302 d42,
  contest-watch content: "They took you — The Vigil, on the
  screens. The whole fire watched. Nobody knew where to look");
  unsteered lately fired once on a sheltered convo (10302 d72,
  the Robin grief dream above). No defense content in lately
  this panel. Steered lately attempts on 2 other defenders hit a
  closed gate (subject pivots exhausted, lately not offered,
  recorded not forced).
- Voice-pool notes, not defects: the wound line is shared across
  speakers (Aurora, Selvi, Tomas's favor voice); the gift-tool
  line is shared (Jamal d84, Aurora d46); the Columbus lines are
  stock pool lines — "Columbus, Ohio is a direction, not a plan"
  appears verbatim in Jamal (d84) AND in r99's Vincent, which
  proves stock, and Jamal's "Mine's Columbus, Ohio, I think"
  first memory (d71), Hannah's "Columbus, Ohio mornings" (d83),
  and Jamal's "Columbus, Ohio in the morning" (d36) are the same
  pool. The driver's own Columbus answer is acknowledged properly
  once (10301 d40: "Columbus, Ohio. I'll remember that").
- Small wrinkle, named not judged: Jamal Vitale (d9) reports the
  naming debate as "Jamal is pushing 'Big Ugly'" — with a single
  Jamal on the roster, the speaker may be naming himself in the
  third person; the debate template does not exclude the speaker
  from the name it inserts. Observation for the conversation
  lane, not a verdict.
- No echo flags beyond the above: every Columbus line traces to
  the stock pool or to the driver's own stated answer.

## F1 (favor call-time cause) — blank stays OPEN, wrap inherited
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos, and no transcript contains the line. Per the prereg,
  zero occurrences keeps the blank OPEN (ninth consecutive zero
  panel: r71/r82/r85/r88/r90/r93/r96/r99/r103). The wrap is
  inherited by the next run.

## C7 (famine/disease pressure census, descriptive, no bar)
- 10301: pantry low-water 0 kcal (iter 34, gameDay 35), ended at
  2,757. 9 corpses: monster ×2 (Domingo d10, Aki d20), the wild
  ×2 (Pablo Wu d43, Fausto Soto d91), a wound that wouldn't close
  ×1 (Valeria Quispe d57), the arena ×1 (Atlas Kong d75), the
  village's own pit trap ×1 (Tomas Jackson d81), sickness ×1
  (Somchai Prasert d83), dehydration ×1 (Carolina Nava d112).
  0 famine deaths, 1 sickness death.
- 10302: pantry low-water 0 kcal (iter 117, gameDay 119), ended
  at 10,392. 8 corpses: contest ×2 (Ellis Martin d60, Salvador
  Acevedo d78), the wild ×2 (Robin Zaitsev d71, Jamal Hennessy
  d117), monster ×2 (Henry d96, Hannah Ndiaye d116 — the d116
  sortie death), the expedition ×1 (Dmitri Sokolov d111), the
  arena ×1 (Sam Wilson d120). 0 famine, 0 disease deaths.
- 10303: pantry low-water 0 kcal (iter 105, gameDay 107), ended
  at 5,147. 8 corpses: a dog-shaped silence at the treeline ×1
  (Diego Kozlowski d4), starvation ×1 (Cheryl Mendelsohn d9),
  monster ×5 (Nicolas d37, Elena d37, Owen d46, Selvi Kadam d98
  — the d98 sortie death, Riwai d106), a wound that wouldn't
  close ×1 (Mara Vasquez d67). 1 famine death, 0 disease deaths.
- Pantry-zero is not starvation, confirmed a third panel running:
  all three villages hit 0 pantry and ended with 7–9 people alive
  (r99's reframe holds). Starvation remains the rarer killer;
  disease bit once (Somchai d83).

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90/r93/r96/r99: also 0). The
  phoenix per-event respawn cascade did not recur. The Steve-call
  stands unchanged.

## BLANK STATUS: no new blank filled, one watch item CLOSED
- This run fills no new game blank: the instrument is unchanged
  from r99, and no src/js fix was in scope. What it does is close
  r99's W2 (favor-ladder cap repeat) as designed behavior — the
  r35 spend-out, proven in transcript — and carry r99's W1
  (re-muster full clear) forward, unanswered for lack of a
  refusal panel. The census 40-cap answer from r99 stands; its
  C7 counting fix remains a post-panel instrument item.

## Village assessment (plain words)
- 10301: the village that held — fought 9 raids, lived through
  21 gorge nights, sent 2 sorties, and ended with 9 people
  (Sofia, Vasyl, Leo, Nadiya, Ines, Yara, Olumide, Conall,
  Carmine) and 2,757 kcal. It buried Domingo and Aki to monsters,
  Pablo and Fausto to the wild, Valeria to a wound, Atlas to the
  arena, Tomas to its own pit trap, Somchai to sickness, and
  Carolina to thirst — and the survivors still talk about them
  by name: Aki at the fire, Somchai's burnt piece.
- 10302: the village that grieved and stood — fought 7 raids,
  lived through 24 gorge nights, sent 2 sorties (one full clear,
  one partial that cost Hannah her life against The Eater), and
  ended with 8 people (Esperanza, Yuki, Chantal, Petra, Fatima,
  Athira, Marco, Rosa) and 10,392 kcal. It buried Ellis and
  Salvador to contests, Robin and Jamal to the wild, Henry and
  Hannah to monsters, Dmitri to the expedition, and Sam to the
  arena on the last day. Jamal still dreams Robin is here.
- 10303: the village that was sieged longest and stood — fought
  9 raids, lived through 48 gorge nights, sent 5 sorties (two
  full clears, three partials, one that cost Selvi her life
  against The Eulogy), and ended with 7 people (Jamal, Aurora,
  Ivy, Adaeze, Farid, Priya, Vusi) and 5,147 kcal. It buried
  Diego to a silence at the treeline on day 4, Cheryl to
  starvation on day 9, Nicolas, Elena, and Owen to monsters,
  Mara to a wound, Selvi to the sortie, and Riwai to a monster.
  Aurora's wound never got treated — the Haven door was always
  between them — and she kept asking anyway.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, fully cleared, partially cleared, and
  valve-resolved), defender conversations, favors with actionable
  answers, grief grounded in real deaths, teaching both ways,
  gifts and buried caches with real consequences, and now a
  refusal-free panel proving sorties fire without refusals too
  — all on current master. The transcript file keeps ending-turn
  outcomes (18/18 engine-ended cases this panel; 6 cap-ended
  need none).
- FUN: yes — favors with concrete wants, grief that names names
  and matches the record (including one-day-old grief for Aki
  and Robin), a confessor who won't confess twice, a village
  that argues about what to call the monsters (and may name
  itself in the third person doing it), a sortie that breaks
  against a 16-HP lingerer, a wound that never gets treated
  because a door is in the way, and a favor ladder that repeats
  itself exactly once and then politely leaves the menu.
- WINNABLE: the leg itself is not a win path; 3 of 3 villages
  survive it this run (r99: 2 of 3, r96: 3 of 3) — and the
  survival includes the longest siege in the series (48 gorge
  nights). No win verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88/r90/r93/r96/r99 on
all 3 seeds — defenderFights 95 -> 0, defendedCount 21 -> 0.
EXPLAINED, not a bug: the baseline's field names describe an older
instrument; current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON lives in r103-panel/determinism/ so
the glob counts each seed once.)

## Test-suite call
Instrument-only change (r103 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0, first attempt),
determinism re-run byte-identical, analyzer, 24 transcripts read in
full, code-reads for the favor-ladder spend-out, the d90 broke-vs-16HP
sortie, the d116/d98 sortie deaths, the d108 re-linger, and the
clearedGorgeAfter name-match.
check --quick: 284 passed, 6 failed in 516s (log:
goal hidden_files/evidence/2026-11-02/r103-panel/r103-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r99's baseline exactly. No new
failure. The capable-bot food-deed proof is green again (it appears
only in the slowest list, not the FAIL list), confirming r99's
stand-down. This run is instrument-only with zero src/js diff, so
no failure is attributable to r103.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. WRAP-CHECK judged as pre-registered (18/18
  ending-turn cases with outcome lines; 6 cap-ended transcripts
  need no dump, same class as r90's 2).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (4 Codex page-turn lines: Cliffhanger
  d86, The Ugly Beast / The Loud Beast / The Understudy d116) are
  sortie kills announced by the Codex, matching D2 clears
  day-for-day — explained, not a gap. (2) The R57 D3 death
  mismatches (Hannah d116, Selvi d98) are sortie deaths announced
  by the Codex, muster-explained, Dina class closed. (3) The
  legacy early count (10303 d91:1) vs TRUE early count 0 is the
  corpse-counting method vs the corpse-excluded definition; the
  prereg judges TRUE. (4) The three MISSED-WINDOW drifts are
  instrument blind spots, counted per the prereg. (5) Days-tail
  wobble (120/125, 120/122, 120/122) read as bands, as before.
  (6) The clearedGorgeAfter name-match (13 lines) is read as
  instrument over-match, not game behavior — see C2b.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as observations:
  steered lately fired once (contest-watch, d42), unsteered
  lately fired once (grief dream, d72), steered attempts on 2
  other defenders hit a closed gate.
- R1 NOT re-investigated (r85 verdict stands).
- Carried (unchanged): F1 favor 'no longer available' blank stays
  OPEN with the call-time wrap inherited; dead discoverer's
  orphaned fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); phoenix per-event cascade (Steve-call); armor
  causation (needs a control arm); telemetry mapping proposal
  defenderFights -> defendedFights; gating freeze (2026-10-27)
  untouched.
- NEW for the next run / for Steve: (1) W1 (re-muster full clear)
  needs a refusal panel — refusals are seed-dependent (0/9 here
  vs 5/15 in r99), so the next run should not expect one; (2) the
  d90 broke-vs-16HP sortie is a single case, no verdict — watch
  for recurrence; (3) the naming-debate third-person wrinkle
  (d9) is a small observation for the conversation lane;
  (4) W2 is CLOSED — the favor ladder needs no polish pass; the
  r35 spend-out is the design, proven in this panel's transcript.
- HELD WORK (not this run's, flagged for the main session):
  journey2-crisis-r90 (stalled run's tree, scripts committed via
  r90 — the tree itself is redundant but left untouched for
  main-session inspection), journey2-succession and
  journey2-succession-r86 (both still carry uncommitted changes,
  untouched throughout this run).

## Closeout
[TO FILL: commit, merge, rotation, lock]
