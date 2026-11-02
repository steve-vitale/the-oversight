# Journey crisis r99 — the refusal that went out anyway, and the village that died out (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: last Lane B crisis run is r96; r97 succession and
r98 endgame landed since, and the social r81 recovery landing wrote
rotation 5 -> 6. This run takes r99 in the Lane B series so filenames
stay unique; the rotation file, not the number, is the authority.

Substrate r96 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r96 driver/analyzer verbatim EXCEPT filenames r99, pilot
seeds 9821/9822/9823, evidence dir 2026-11-01 panel subdir r99-panel.
Diff r96 -> r99 reviewed: only renames plus the seed change.
node --check clean on both scripts. Determinism leg: seed 9821 re-run
BYTE-IDENTICAL (panel JSON, r99-panel/determinism/), so the fork is
trajectory-neutral.

## Run setup — clean registration, slow start, fast seeds
- No lock file existed at run start, so no stale-lock recovery was
  needed; fresh lock written (2026-11-02T01:58:03Z), to be deleted at
  closeout.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  and the directory still holds orphan evidence from Oct 14-25 runs.
  Same class as r88/r90/r93/r96. The 00:00 Lane B run's
  journey2-crisis-r91 tree had been released at its closeout, so this
  run re-registered journey2-crisis-r91 (fresh branch, same slug);
  run number r99 is carried in filenames, not the slug. The orphan
  dir is left untouched.
- Registration was slow but clean: `git worktree add` + reset took
  ~7 minutes under sibling load, then the registry entry and
  heartbeat landed (02:08:40Z, re-verified after every panel seed).
  Standing heartbeat loop verified landing by registry read-back;
  no EPERM flap this run.
- Smoke test first, into a scratch dir (not the panel dir, so the
  panel stays pristine): SEED=9821 DAYS=5 proved the doAction wrap
  runs (JSON parses, seed present, favorNoLongerCalls [],
  instrumentErrors []) before the panel launched.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; DISEASES.md, MONSTER-WAVES.md,
  CONTESTS.md heads re-read. Gating freeze (2026-10-27) untouched.
  No canon doc covers crisis-as-a-leg directly; the leg's systems
  are covered by DISEASES.md (sickness deaths here), MONSTER-WAVES.md
  (raider sets), and CONTESTS.md (moots) — none reinvented, none
  changed.
- Infra observation (not a data concern): the panel loop sat idle
  ~9 minutes between seed 9822's end (02:22:01Z) and seed 9823's
  start (02:30:55Z) with nothing logged — host scheduling under
  sibling load is the likely cause. Seed 9823 itself then ran 120
  days in 24s (vs 108s/208s for the other two) yet produced a
  complete, parsed, 120-day record; the determinism re-run of 9821
  was likewise fast (~10s) and byte-identical. Runtimes vary with
  host load; outputs are complete and verified, so no re-run.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 9821 / 9822 / 9823, sequential, all exit 0, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-01/r99-panel/.
Analyzer output: r99-panel-analysis.txt (same dir).
Pilot-only per §9-12: the pilot answered the leg's questions
(including the refusal-recovery case r96 asked for — see C2b), so no
panel expansion; the r96 panel seeds were NOT re-run.

- 9821: game-over, 106 days (say-day 106). 8 raids, 15 gorge
  nights, 1 sortie, 8 convos. Ends 0 alive / 0 kcal.
- 9822: horizon, 120 loop days (say-day 124). 11 raids, 69 gorge
  nights, 11 sorties, 8 convos. Ends 4 alive / 4,786 kcal.
- 9823: horizon, 120 loop days (say-day 121). 9 raids, 15 gorge
  nights, 3 sorties, 8 convos. Ends 9 alive / 0 kcal.

## C1 (bend, not break) — GO
- Gates hold per C2, and the one game-over has a named cause that
  is NOT a siege-mechanic failure: 9821's village was ground down
  by monster kills in the wild (Adaeze d95, Mia d96, Quinn d97,
  Aria d98, Miguel and Caleb d104, Jesse d105), and the last
  bearer, Samat Taukenov, fell on day 106 to The Ugly Beast — a
  mimic wearing Miguel's face, stance, and Iron Stomach ("It moves
  like Miguel moved") — in a fight the player was in. The game's
  own line: "No one is left to pick up the Codex. The village
  dies out — quietly, the way villages do." Raids were fought
  through d58 and the last lingerer set resolved via the valve at
  d101; the siege did not kill this village, the wild did.
- The other two villages bend and stand: 9822 reaches the horizon
  with 4 people after 69 gorge nights, 9823 with 9 people and an
  empty pantry.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 8 / 11 / 9. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count also 0 this panel.
- D1 snapshots all delayed >= 3 attempts: 15/15.
- deltaBad empty (15 attempts, 10 ok, 5 refused, 6 cleared to zero
  remaining, deltaExact 10). D3 drift unknown = 0 (labels
  panel-wide: sortie-clear 11, player-drawn-off 15,
  moved-on-valve 6).
- Days-tail wobble persists, same class as r70/r71/r82/r85/r88/r90/
  r93/r96: loop-iteration days vs max Game say-day 9821 106 vs
  106, 9822 120 vs 124, 9823 120 vs 121. Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, refusal-recovery answered
- Lingerer sets form on all seeds. Gorge nights: 15 / 69 / 15
  (99 total, 116,963 kcal eaten at the treeline). 9822 lived under
  siege pressure for 69 gorge nights — the leg's long-siege case,
  more than double r96's 29.
- Sorties: 15 attempts, 10 ok, 5 REFUSED — the third refusal panel
  in the series (r93: 3, r96: 2). All 5 refusals are on 9822 and
  all carry the recorded reason 'no-fighters', so C2b's bar is met,
  not missed. The r96 watch item — does a refused seed recover
  fighters and re-muster, or does refusal always precede the
  valve? — is answered BOTH WAYS in one seed:
  - d84 refusal (wave-4 set: Big Loud + The Congregation, 644 HP)
    → d85 RE-MUSTER: the same targets, fired, partial clear
    (cleared 1, broke, 1 remaining, paid 4,200 kcal). It cost a
    life: Ines faced The Congregation on the d85 sortie and did
    not come back. The set then ended via the moved-on valve at
    d87. Refusal did NOT strand the village and did NOT go
    straight to the valve — the village recovered fighters
    overnight and went out again, at a price.
  - d113/d115 refusals (The Big Beast, 64 HP, 4 attempts over two
    days, all 'no-fighters') → d116 moved-on valve, no recovery.
    The village that could re-muster at d85 could not at d113:
    the refusal tracks the village's real decline, not a stuck
    gate.
- Boundary-sortie cross-checks read ok:true except exactly the
  refused attempts (ok:false there encodes the refusal, not
  missing samples — the refused targets show 5–23 prior
  waited>=3 samples). The boundary sampler hides no due sortie
  this panel.
- MISSED-WINDOW total = 3 (9821 d99 player-drawn-off, 9 tick-part
  waited>=3 samples from d99; 9821 d101 moved-on-valve, 4 samples
  from d100; 9822 d70 moved-on-valve, 17 samples from d69): three
  instrument blind spots, counted here per the prereg, not game
  failures (r96: 2, r93: 1).
- No partial clear this panel beyond the d85 case above and the
  d37/d67 partials (broke, remaining 2/1): all other fired sorties
  cleared to zero remaining.

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds (R70/R82 sections);
  doActionWrapMissing false on all seeds; instrumentErrors [].
  Tick-part samples: 1032 / 1404 / 1116 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: all 24 driven
  transcripts carry the '(conversation ended by the engine)'
  marker (r96 had 23/24 with 1 cap-ended; this panel has no
  cap-ended transcript), and all 24 show their outcome lines in
  the driven file. The r88 fix stands proven again, not merely
  code-verified.

## C3 (people check) — GO
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).
- NPCs want concrete things: Teresa's forage outing ("The stores
  won't stretch past tomorrow, and I'm not choosing who eats. I
  know the far treeline, past the rocks — come with me and we'll
  fill packs before dark"), Wanjiru's burn-ground count ("I did
  the count twice. The count doesn't change"), Colleen's wound
  care ("If it festers I'm no good to anyone — can't haul, can't
  hunt, can't watch"), Luis's food share ("It's been too long
  since a real meal. I can't pull my weight like this"), Violet's
  ridge forage ("Another day like today and we're choosing who
  eats"). The favor probes behind every transcript confirm the
  game state: Teresa's forage_help ends 'promised' with the
  Haven-door reason; Colleen's heal_help ends 'asked' with the
  Haven-door reason; Violet's forage_help stays 'asked' across
  d20–d56 with the Haven-door reason — a favor that never
  completes because the positioning never lines up, which is the
  game state, not a defect. No favor ever returned 'no longer
  available' (see F1).
- Confessions refuse to repeat: Teresa ("I confessed that already.
  I'm not confessing it twice for dramatic effect"), Samat ("I
  told you the truth. You can keep poking it, but it's told"),
  Vincent across three confronts ("I already told you the truth
  about that" → "it's the same truth as last time" → "it's
  told"). Doubt escalates then closes: Vincent's "That doesn't
  quite add up" runs careful → choosing words → rattled → "Done
  talking about it."
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —"
  -> "Still the same thing —" -> "I've told you three times
  now —"; recaps climb the same ladder to "We're going in
  circles a bit —". One wrinkle, named not failed: the
  favor-requirements ladder has no distinct "circles" rung, so a
  6th press repeats the cap line verbatim (Wanjiru d26: "I've
  told you three times now" twice in a row). The conversation
  still ends; it is a repeated line, not a loop. A future polish
  pass could give the favor ladder its own closing rung.
- Grief is grounded in real deaths, not generated filler: Colleen
  (d12) mourns Jian ("Jian always took the burnt piece. Said
  someone had to. I take it now.") — Jian Wieczorek, the player
  character, starved on day 10, two days before. Vincent (d34)
  mourns Ethan ("Ethan is gone and the world just... continues")
  — Ethan died to a monster on day 33, the day before. Violet
  (d20) mourns Hannah the same way — Hannah died to a monster
  on day 18. Colleen (d27) and Luis (d43) carry the Taking:
  brother Renato and nephew Álvaro, "the pods, rows deep,
  humming" — KIN canon, not invention.
- Betrayal investigations spend out and reach a verdict:
  Colleen's case runs site → witnesses → bribery (twice: "Nothing
  you can prove — yet" then "Found something. Follow it to the
  moot") → expose at the moot → "Said. At the moot. Let the fire
  decide what it means."
- Invitations are sometimes taken, in this leg too: Kelsey's
  naming-debate walk accepts ("...Fine. This had better be worth
  it"), Violet's thinking place accepts on d31 ("Don't tell the
  others. Everyone needs one place") after declining the d20 walk
  ("I work alone. Nothing personal. ...It's a little personal"),
  Sarah's ridge walk accepts on d55. Declines carry character:
  Teresa's and Samat's "Not right now. I've got my own things to
  handle."
- Defense content appears in its own slot, not lately: steered
  lately attempts on 3 convos hit a closed gate (subject pivots
  exhausted, lately not offered, recorded not forced); unsteered
  lately fired 0 times this panel (r96: also 0).
- No echo flags this panel: Vincent's "Columbus, Ohio is a
  direction, not a plan" is the NPC's own line (the driver carries
  no Columbus answer), not a driver echo. The panel's audible
  gaps are none.

## F1 (favor call-time cause) — blank stays OPEN, wrap inherited
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos, and no transcript contains the line. Per the prereg,
  zero occurrences keeps the blank OPEN (eighth consecutive zero
  panel: r71/r82/r85/r88/r90/r93/r96/r99). The wrap is inherited
  by the next run.

## C7 (famine/disease pressure census, descriptive, no bar)
- 9821: pantry low-water 0 kcal (iter 77, gameDay 77), ended at 0.
  13 census corpses, none famine/disease: the night ×1, the wild
  ×2, the arena ×1, monsters ×8, a wound that wouldn't close ×1.
  A grind-down, not a famine.
- 9822: pantry low-water 0 kcal (iter 110, gameDay 113), ended at
  4,786. 1 famine death: Jian Wieczorek, the player, starved day
  10 — the run's first death, before the mantle passed. 0 disease
  deaths. The village sat at zero pantry late with 4 people alive
  and nobody else starved: pantry-zero is not starvation while
  foraging and gorge nights (69) still feed people, confirming
  r96's reframe.
- 9823: pantry low-water 0 kcal (iter 105, gameDay 106), ended at
  0. 9 alive at the horizon, 0 famine deaths, 0 disease deaths;
  its corpses are ambush, monster, wild, dehydration (Violet
  Liang d92), and the wild again. Starvation remains the rarer
  killer; disease did not bite this panel (r96 had 2 sickness
  deaths).
- CENSUS-COVERAGE ANSWER (r96's hygiene item, investigated
  read-only): the census corpses list is NOT a full death
  register — it is the surviving tail of a 40-capped list. In
  src/js/corpses.js, every new corpse pushes onto
  state.corpses, and when the list exceeds 40 the game splices
  out the oldest bones-stage (stage 4) corpse. On a heavy-death
  seed the earliest deaths decay to bones and are pruned as newer
  corpses arrive, which is exactly why 9812's pre-d41 deaths
  (Vasyl d9, Rosa d20) were missing from r96's census list while
  present in sayLines. The list "starts counting" nowhere — it
  ends at the 40-cap. Any fix (e.g. counting C7 from the driver's
  own per-day death records instead of the end-of-run list) is a
  separate post-panel instrument change with its own determinism
  re-check, not a mid-panel bar change; no verdict in this run
  depends on it (C7's counts here come from the same list, and
  this panel's famine/disease counts are 1/0 with no early-death
  edge in play).

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90/r93/r96: also 0). The phoenix
  per-event respawn cascade did not recur. The Steve-call stands
  unchanged.

## BLANK STATUS: no blank filled this run, two watch items answered
- This run fills no new blank: the instrument is unchanged from
  r96, and no src/js fix was in scope. What it does is answer
  r96's two watch items: (W1) refused seeds CAN recover fighters
  and re-muster (9822 d84→d85, partial clear at the cost of
  Ines's life) as well as ending via the valve (d113/d115→d116)
  — refusal is neither always-fatal nor always-recovered; and
  (W2) the census-corpses start-count question is answered
  (40-cap bones pruning, see C7), with the fix left as a
  post-panel instrument item.
- Observation carried, not a verdict: the favor-requirements
  ladder repeats its cap line on a 6th press (Wanjiru d26) where
  the recap ladder has a distinct "circles" rung.

## Village assessment (plain words)
- 9821: the village that died out — fought 8 raids, lived through
  15 gorge nights, sent one sortie, and was ground down by the
  wild: Teresa to the night on day 32, Nargiz to the wild on day
  40, Kelsey to the arena on day 55, then monsters took Nina,
  Adaeze, Mia, Quinn, Aria, Miguel, Caleb, and Jesse across days
  74–105, until the last bearer Samat fell to a beast wearing
  Miguel's face on day 106 and nobody was left to pick up the
  Codex. It buried 13 named people and ended at zero.
- 9822: the village that was ground down to four and still stood
  — fought 11 raids, lived through 69 gorge nights, sent 11
  sorties, lost its first bearer Jian to starvation on day 10,
  lost Acheampong on the day-37 sortie and Ines on the day-85
  re-muster, could not muster a fighter for The Big Beast on days
  113 and 115, watched the set move on at day 116, and reached
  the horizon with Lucas, Emma, Dmitri, and Hannah and 4,786 kcal.
  Its people still talk about the dead by name — Jian's burnt
  piece, Ethan at the fire, Renato in the pods.
- 9823: the village that grieved and stood — fought 9 raids,
  lived through 15 gorge nights, ended with 9 people (Pavel,
  Brian, Ava, Tom, Benoit, Zoe, Piyamas, Sam, Jesse) and an empty
  pantry. It buried Katarina to an ambush on day 10, Hannah to a
  monster on day 18, Vera to thirst on day 92, and Desmond to the
  wild on day 106. A village that keeps its people talking is the
  one that stands.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, cleared, partially cleared, refused-with-reason,
  and valve-resolved), defender conversations, favors with
  actionable answers, betrayal investigations that spend out and
  reach a verdict, grief grounded in real deaths, and now a
  game-over with a named, non-siege cause all fire on current
  master. The transcript file keeps ending-turn outcomes (24/24
  this panel).
- FUN: yes — favors with concrete wants, grief that names names
  and matches the record (including two-day-old grief for Jian
  and one-day-old grief for Ethan), a confessor who won't confess
  twice, a village that argues about what to call the monsters,
  a refusal that goes out anyway and costs a life, and a beast
  that wears a dead villager's face — and this panel, no echo
  flags at all.
- WINNABLE: the leg itself is not a win path; 2 of 3 villages
  survive it this run (r96: 3 of 3) — and the one loss is the
  most instructive: a village ground down by the wild, not by a
  broken siege. No win verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88/r90/r93/r96 on all
3 seeds — defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED,
not a bug: the baseline's field names describe an older instrument;
current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON lives in r99-panel/determinism/ so
the glob counts each seed once.)

## Test-suite call
Instrument-only change (r99 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0, first attempt),
determinism re-run byte-identical, analyzer, 24 transcripts read in
full, code-reads for the refusal reasons, the d85 re-muster, the
9821 game-over cause, and the census 40-cap.
check --quick: 284 passed, 6 failed in 447s (log:
goal hidden_files/evidence/2026-11-01/r99-panel/r99-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r96's baseline minus one.
UPDATE vs r96, reported LOUDLY: r96's NEW failure is GONE —
scripts/test-capable-bot-20261014.js passes on current master (it
appears only in the slowest list, not the FAIL list). This run is
instrument-only with zero src/js diff, so the repair came from
another landing between r96's check and this one; this run claims
no credit for it, but the capable-bot food-deed proof is green
again and the main session's r96 flag can be stood down.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. WRAP-CHECK judged as pre-registered (24/24
  ending-turn cases with outcome lines; no cap-ended transcript
  this panel, unlike r96's one).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (Codex page-turn lines: Ugly-Eyes
  d30, Lockpick d37, Big Big + Old Croaker d74, The Reverend d76
  and d85, Old Stare d108, plus a Stonebridge grief-card table
  line d85) are sortie kills announced by the Codex, matching D2
  clears day-for-day — explained, not a gap. The Reverend
  appearing twice is two sets' Reverends, not a resurrection:
  the d76 set and the d85 set each carried one. (2) The R57 D3
  death mismatches (Acheampong d37, Ines d85) are sortie deaths
  announced by the Codex, muster-explained, Dina class closed.
  (3) The boundary cross-check's ok:false on refused attempts
  encodes the refusal, not missing samples — the refused targets
  show 5–23 prior waited>=3 samples. (4) The three MISSED-WINDOW
  drifts are instrument blind spots, counted per the prereg.
  (5) Days-tail wobble (106/106, 120/124, 120/121) read as bands,
  as before.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as an observation:
  steered lately attempts on 3 convos hit a closed gate (subject
  pivots exhausted, lately not offered, recorded not forced);
  unsteered lately fired 0 times this panel (r96: also 0).
- R1 NOT re-investigated (r85 verdict stands).
- Carried (unchanged): F1 favor 'no longer available' blank stays
  OPEN with the call-time wrap inherited; dead discoverer's
  orphaned fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); phoenix per-event cascade (Steve-call); armor
  causation (needs a control arm); telemetry mapping proposal
  defenderFights -> defendedFights; gating freeze (2026-10-27)
  untouched.
- NEW for the next run / for Steve: (1) the d85 re-muster shows
  refusals are recoverable at a price — the next run should watch
  whether a re-muster ever fully clears (d85 cleared only 1 of 2);
  (2) the favor-requirements ladder's repeated cap line (Wanjiru
  d26) is a small polish item for the conversation lane;
  (3) the census 40-cap answer stands as the explanation for
  r96's missing early deaths — a C7 counting fix (driver's own
  death records instead of the end-of-run list) is a post-panel
  instrument item, not this run's.
- HELD WORK (not this run's, flagged for the main session):
  journey2-crisis-r90 (stalled run's tree, scripts now committed
  via r90 — the tree itself is redundant but left untouched for
  main-session inspection), journey2-succession and
  journey2-succession-r86 (both still carry uncommitted changes,
  untouched throughout this run).

## Closeout (merge #1 failed, recovery via cherry-pick)
- Commit 2df36456 (worktree journey2-crisis-r91, rebased to
  c5905f221 onto 978ff20cf) was committed cleanly, but the
  --ff-only merge failed: master had moved again mid-closeout to
  f961b8dba (loop B 0047Z round evidence, docs-only, zero
  src/js). The closeout script then ran worktree-release
  ("merged") and removed the worktree directory before the branch
  delete correctly refused (branch not fully merged) — so the
  branch survived with the commit intact, the registry entry was
  already cleaned, and no work was lost. Nothing was force-pushed
  or ref-surgered; the main tree stayed clean throughout.
- Recovery: fresh registered worktree journey2-crisis-r99 on
  current master f961b8dba, cherry-pick of the run's own commit
  c5905f221 (3 files, blob-identical, verified), node --check on
  both scripts, determinism re-run of seed 9821 post-recovery
  byte-identical to the panel JSON (see determinism-postrebase
  dir — recorded in the recovery commit's verification, not as a
  panel change). The old branch journey2-crisis-r91 is deleted
  after this merge lands, so the commit lands exactly once.
- Lesson carried: verify master HEAD immediately before the
  --ff-only merge AND run release only after the merge succeeds
  — never release-then-merge in one chain.
