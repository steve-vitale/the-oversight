# Journey crisis r107 — three villages stand, and the sortie spends the last crumb twice (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: last Lane B run is r106 (social, wrote rotation
5 -> 6). This run takes r107 in the Lane B series so filenames
stay unique; the rotation file, not the number, is the authority.

Substrate r103 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r103 driver/analyzer verbatim EXCEPT filenames r107,
pilot seeds 10701/10702/10703, evidence dir 2026-11-02 panel subdir
r107-panel. Diff r103 -> r107 reviewed: only renames.
node --check clean on both scripts. Determinism leg: seed 10701
re-run BYTE-IDENTICAL (panel JSON, r107-panel/determinism/), so the
fork is trajectory-neutral.

## Run setup — clean registration, slow heartbeat start, fast seeds
- No lock file existed at run start, so no stale-lock recovery was
  needed; fresh lock written (2026-11-02T10:56:04Z, run_id aligned
  to the registry's 10:58:24Z at registration), to be deleted at
  closeout.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  and the directory still holds orphan evidence from Oct 14-25 runs.
  Same class as r88/r90/r93/r96/r99/r103. This run uses
  journey2-crisis-r107 (unique, still the lane-B journey2- prefix,
  never the lane-A journey- prefix). The orphan dir is left
  untouched.
- Registration was slow but clean: `git worktree add` + reset took
  ~5 minutes under sibling load, then the registry entry and
  heartbeat landed (10:58:24Z). Standing heartbeat loop verified
  landing by registry read-back (11:05:35Z, with a readable log,
  never /dev/null). One stall, named: the loop's first heartbeat
  blocked ~7 minutes on the registry flock while a sibling reap
  held it; it landed on its own once the reap released, and no
  heartbeat went stale past the reaper's 4-hour horizon. No EPERM
  flap this run.
- Pre-flight: main tree clean (`git status --short` empty), disk
  27% (df -h ~), `git pull` already up to date (cee4041c3).
  `worktree-reap.sh` ran clean: 12/16 active, held dirty trees
  (journey2-crisis-r90, journey2-succession, journey2-succession-r86)
  LOUD-protected and untouched.
- Smoke test first, into a scratch dir (not the panel dir, so the
  panel stays pristine; scratch dir removed after): SEED=10701
  DAYS=5 proved the doAction wrap runs (JSON parses, seed present,
  favorNoLongerCalls [], instrumentErrors []) before the panel
  launched. Seed stderr files (98 bytes each) are only the benign
  retired-feastBurn notice, identical on all three seeds.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; DISEASES.md, MONSTER-WAVES.md,
  CONTESTS.md heads re-read. Gating freeze (2026-10-27) untouched.
  No canon doc covers crisis-as-a-leg directly; the leg's systems
  are covered by DISEASES.md (sickness deaths here), MONSTER-WAVES.md
  (raider sets), and CONTESTS.md (moots) — none reinvented, none
  changed.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 10701 / 10702 / 10703, sequential, all exit 0 first attempt, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-02/r107-panel/.
Analyzer output: r107-panel-analysis.txt (same dir).
Pilot-only per §9-12: the pilot answered the leg's questions
(including the sortie-spends-the-pantry cases below), so no panel
expansion; the r103 panel seeds were NOT re-run.

- 10701: horizon, 120 loop days (say-day 123). 12 raids, 23 gorge
  nights, 3 sorties, 8 convos. Ends 4 alive / 0 kcal.
- 10702: horizon, 120 loop days (say-day 121). 10 raids, 6 gorge
  nights, 0 sorties, 8 convos. Ends 8 alive / 38,564 kcal.
- 10703: horizon, 120 loop days (say-day 122). 13 raids, 2 gorge
  nights, 0 sorties, 8 convos. Ends 6 alive / 27,838 kcal.

## C1 (bend, not break) — GO
- Gates hold per C2, and there is no game-over at all this panel:
  all three villages reach the horizon. C1(ii) is vacuous — no
  siege-mechanic failure anywhere, because no village fell.
- 10701 is the leg's hard case: 23 gorge nights, three sorties,
  the last two each spending the village's entire remaining pantry
  (1,600 kcal, then 200 kcal), and it still stands with 4 people.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 12 / 10 / 13. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 1 (10702 d117, corpse-counting
  method only — the prereg judges TRUE, so this does not fail C2).
- D1 snapshots all delayed >= 3 attempts: 3/3.
- deltaBad empty (3 attempts, 3 ok, 1 cleared to zero remaining,
  deltaExact 3). D3 drift unknown = 0 (labels panel-wide:
  sortie-clear 2, player-drawn-off 9).
- Days-tail wobble persists, same class as r70/r71/r82/r85/r88/r90/
  r93/r96/r99/r103: loop-iteration days vs max Game say-day 10701
  120 vs 123, 10702 120 vs 121, 10703 120 vs 122. Judge bands, not
  counters.

## C2b (linger-conditional gorge/sortie) — GO, second refusal-free panel
- Lingerer sets form on all seeds. Gorge nights: 23 / 6 / 2
  (31 total, 41,225 kcal eaten at the treeline).
- Sorties: 3 attempts, 3 ok, 0 REFUSED — the second refusal-free
  panel in a row (r103: 0, r99: 5). W1 (does a re-muster ever FULLY
  clear?) stays UNANSWERED for lack of a refusal panel, and
  carries again — refusals are seed-dependent (0/3 attempts here
  vs 5/15 in r99).
- The three sorties, all on 10701:
  - d71: The Redactor (167 HP), muster Giulia/Nikolai/Sanne, paid
    6,000 (pantry 37,272 -> 31,272), cleared 1 of 1, no break. The
    fight ends mFlee (monster fled, villager took 28). The whole
    5-raider wave-3 set (The Callback, Big Ugly, Nevermore,
    Sweeps Week, The Redactor, since d67) resolves fought via the
    sortie-call. A full clear.
  - d117: The Big Beast (195 HP) + The Strike (750 HP), muster
    Nikolai/Sanne/Dilara, paid 1,600 — the village's LAST 1,600
    kcal (pantry -> 0). Cleared 1 (Big Beast, mFlee), broke,
    remaining 1 (Strike, villagers fled). A partial clear bought
    with everything in the stores.
  - d123: Highbeam Deer (1 HP) + The Reunion (900 HP), muster
    Giulia/Nikolai/Dilara, paid 200 — again the last kcal in the
    stores (pantry -> 0). Cleared 1 (Deer, vKill — the Codex
    page-turn "Highbeam Deer is dead" on d123 matches day-for-day),
    broke, remaining 1 (Reunion, villagers fled, still lingering
    at the horizon). No sortie death this panel (r103 had two);
    all three musters walk home.
- W3 ANSWERED (r103's broke-vs-16HP single case): no weak-target
  break this panel. Both breaks are against strong remainders
  (750 HP, 900 HP); the 1-HP Deer on d123 died. The r103 case
  stays a single, unexplained case, not a class.
- Why 10702/10703 have zero sorties: their sets never reached the
  3-night boundary. 10702's set (Big-Eyes, Chorus Line, Big Ugly)
  first seen d115, gorged d115-116, fought at the tick on d117
  (waited 2 nights). 10703's Big Loud first seen d120, gorged
  d120-121, still lingering at the horizon — the run ends with
  the village still besieged, not with a missed sortie. No
  boundary-firable case went unfired on any seed.
- Boundary-sortie cross-checks read ok:true on all 3 attempts.
  (One target shows 0 prior waited>=3 samples — the known
  sleep-roll stamping class from r88, not a hidden due sortie.)
- MISSED-WINDOW total = 2 (10701 d117 Bulldozer, 2 tick-part
  waited>=3 samples from d116; 10701 d119 Strike, 2 samples from
  d118): two instrument blind spots, counted here per the prereg,
  not game failures (r103: 3, r99: 3, r96: 2).
- Instrument observation (no game verdict): the driver's
  clearedGorgeAfter name-match reports 4 gorge lines after clears
  — but they are the d113-115 Big Beast lines matched against
  the d71 Redactor clear, and the two monsters share the id
  "redactor" across sets. Same over-match class as r103's 13
  lines, smaller: id reuse across sets, not "cleared monsters
  kept gorging". Carried as instrument hygiene, not a finding.
- Pantry-zero note, third panel running: 10701's gorge lines at
  d117-122 fire with "0 kcal gone" — the monsters gorge on
  nothing because the stores are empty, and the village still
  stands with 4 people. Pantry-zero is not starvation while
  foraging still feeds people (r96/r99/r103 reframe holds).

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds (R70/R82 sections);
  doActionWrapMissing false on all seeds; instrumentErrors [].
  Tick-part samples: 1203 / 1040 / 1192 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: 23 of the 24 driven
  transcripts carry the '(conversation ended by the engine)'
  marker, and all 23 show their closing outcome lines before the
  marker in the driven file. The 1 without the marker (10702
  d16) carries exactly 12 YOU PICKs — the driver's turn cap, not
  an engine end, so no dump was owed (same class as r103's 6
  cap-ended; its final NPC lines are present in the file, so
  nothing was swallowed). The r88 fix stands proven again.

## C3 (people check) — GO
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).
- NPCs want concrete things: Dante's far-treeline forage ("The
  stores won't stretch past tomorrow, and I'm not choosing who
  eats"), Lily's north-treeline count ("I did the count twice.
  The count doesn't change"), Saul's and Cameron's festering
  wounds ("If it festers I'm no good to anyone — can't haul,
  can't hunt, can't watch"), Joseph's field teaching (Ground
  Elder, Bulldozer cues, a spring that runs clear, a ridge with
  a view for miles). The favor probes behind every transcript
  confirm the game state: Lily's forage_help stays 'asked'
  across d36-d44 with the Haven-hall reason; Cameron's heal_help
  stays 'asked' across d48-d61 with the Haven-door reason;
  Dante's forage_help goes 'moot' ("This forage request is
  closed") by d27. No favor ever returned 'no longer available'
  (see F1).
- Confessions refuse to repeat: Joseph's d16 confession ("I
  wasn't a paramedic. I was a Pharmacist. I wanted an edge. You
  were new, you were listening, and I used it") is refused a
  second telling on d28 ("I told you the truth. You can keep
  poking it, but it's told"), and Alfredo's d29 confront gets
  the same refusal. Betrayal investigations spend out: Samuel's
  bribery thread pressed five times with distinct lines ends
  "the favors went out, but nobody's living richer. Either
  nobody was bought — or the price was paid somewhere you
  can't see"; Lily's press ends "either it's true, or it's
  been rehearsed a lot. There's nothing more to press here."
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —"
  -> "Still the same thing —" -> "I've told you three times
  now —"; recaps climb the same ladder to "We're going in
  circles a bit —" (Paola d17, full ladder with the distinct
  circles rung). One bounded repeat, same class as r103's
  closure: Saul's d45 wound favor pressed 6 times repeats the
  cap line on press 6, then the driver declines ("No, yeah, of
  course. Forget I asked") and the favor closes 'declined' with
  "They won't forget. They'll just stop asking." A repeated
  line, then a consequence — not a loop.
- Grief is grounded in real deaths, not generated filler: Lily
  (d44) mourns Dante ("Since Dante died... I keep expecting to
  see Dante at the fire") — Dante died to the wild on day 36,
  eight days before. Saul (d46) mourns Paola ("Paola owed me a
  favor. I keep thinking about collecting. Stupid") — Paola
  died of sickness on day 37, nine days before. Alfredo (d29,
  via lately) mourns Aki ("Aki always took the burnt piece.
  Said someone had to. I take it now") — Aki died to a monster
  on day 28, the day before. The Taking grief is KIN canon, not
  invention: Lily's sister Laboni, Cameron's brother Erich
  ("Row on row of them, humming like a held note").
- Invitations are sometimes taken, in this leg too: Lily's
  watch-your-back accept (d44: "Someone should watch your back.
  Might as well be me"), Alfredo's the same (d19). Declines
  carry character: Saul's "Not right now. I've got my own
  things to handle" (d46).
- Teaching runs both ways in the field sense: Joseph and Saul
  teach plants, monster cues, and places; Alfredo's plan is
  "learn one useful thing a week. This week it's foraging."
  Two nonverbal villagers (Fatma on 10702, Monika on 10703)
  hold whole conversations by gesture — coherent, warm, and
  closed properly, not a fallback voice.
- Lately, observed only (r85 V2 answer stands, Steve-call):
  steered lately attempts on 3 defenders (10701 d9, 10702 d16,
  10703 d9) hit a closed gate (subject pivots exhausted, lately
  not offered, recorded not forced); unsteered lately fired once
  (10703 d29, the Aki grief above). No defense content in lately
  this panel. Steered lately fired 0 times.
- W4 (r103's naming-debate third-person wrinkle): NOT observed
  this panel — no naming-debate walk appears in the 24
  transcripts (10703 d29 offers a party name instead, which the
  driver leaves unpicked). Carried as unobserved, not closed.
- No echo flags this panel: zero driver-answer echoes, zero
  stray gloss asides. The panel's audible gaps are none.

## F1 (favor call-time cause) — blank stays OPEN, wrap inherited
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos, and no transcript contains the line. Per the prereg,
  zero occurrences keeps the blank OPEN (tenth consecutive zero
  panel: r71/r82/r85/r88/r90/r93/r96/r99/r103/r107). The wrap is
  inherited by the next run.

## C7 (famine/disease pressure census, descriptive, no bar)
- 10701: pantry low-water 0 kcal (iter 115, gameDay 117), ended at
  0. 13 corpses, none famine/disease: dehydration ×1, the wild
  ×5, contest ×1, the night ×1, the arena ×2, a wound that
  wouldn't close ×1, The Eater ×1 (Jing Cheng d104 — a monster
  named as the cause), monster ×1. A grind-down with a late
  wild-death cluster (Elijah, Priya, Palesa, Henry across
  d115-117) while the village was besieged.
- 10702: pantry low-water 0 kcal (iter 65, gameDay 65), ended at
  38,564. 8 corpses: dehydration ×1, sickness ×2 (Paola Kamara
  d37, Joseph Jin d52), the wild ×4, monster ×1. 0 famine deaths.
  Disease bit twice on the middle seed; the village recovered
  its pantry and stood with 8.
- 10703: pantry low-water 2,792 kcal (iter 54, gameDay 57), ended
  at 27,838. 10 corpses: monster ×6, the wild ×2, the arena ×1,
  dehydration ×1. 0 famine, 0 disease deaths — a monster-led
  ledger, the heaviest monster toll this panel.
- Pantry-zero is not starvation, confirmed a fourth panel running:
  two villages hit 0 pantry and ended with 4 and 8 people alive.
  Starvation remains the rarer killer (0 this panel); disease
  bit twice (r103: 1, r99: 1, r96: 2).
- Instrument observation (not a game failure): the analyzer's
  R70 lastDeathDay tracks the driver's say-line deaths array, not
  the census — 10701 reads lastDeathDay 9 while its census corpses
  run to d117. C7 here uses the census, the fuller record.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103: also 0). The
  phoenix per-event respawn cascade did not recur. The Steve-call
  stands unchanged.

## BLANK STATUS: no new blank filled, one watch item ANSWERED
- This run fills no new game blank: the instrument is unchanged
  from r103, and no src/js fix was in scope. What it does is
  answer r103's W3 (no weak-target break this panel — both breaks
  against 750/900-HP remainders, the 1-HP target died) and carry
  W1 (re-muster full clear, needs a refusal panel) and W4
  (naming-debate third person, unobserved here) forward.
- Observation carried, not a verdict: gorge lines fire at 0 kcal
  when the stores are empty (10701 d117-122) — the engine
  narrates a gorge on nothing rather than skipping the night
  line; and the clearedGorgeAfter id-match (4 lines) is the
  r103 over-match class, via the shared "redactor" id across
  sets.

## Village assessment (plain words)
- 10701: the village that spent everything and stood — fought 12
  raids, lived through 23 gorge nights, sent 3 sorties, and ended
  with 4 people (Giulia, Nikolai, Sanne, Dilara) and an empty
  pantry. It buried Emmett to thirst, Samuel and Dante to the
  wild, Ariel to a contest, Lily to the night, Ernesto and Tom
  to the arena, Devon to a wound, Jing to The Eater, and Elijah,
  Priya, Palesa, and Henry to the wild and monsters in the last
  week — and still sent its last 200 kcal out the door on day
  123 to kill a deer and face The Reunion. Its people still talk
  about the dead by name: Dante at the fire, eight days on.
- 10702: the village that got sick and recovered — fought 10
  raids, lived through 6 gorge nights, sent no sortie (its one
  set was fought at the tick before the boundary), and ended
  with 8 people (Fatma, Ursula, Ruth, Valeria, Petra, David,
  Vasyl, Flavio) and 38,564 kcal. It buried Arnold to thirst,
  Paola and Joseph to sickness, Saul, Nzilani, Mateo, and Chloe
  to the wild, and Catalina to a monster. Saul still owes Paola
  a favor he keeps thinking about collecting.
- 10703: the village that was still besieged at the horizon —
  fought 13 raids, lived through 2 gorge nights, sent no sortie,
  and ended with 6 people (Monika, Yuki, Mia, Ursula, Yaritza,
  Nicole) and 27,838 kcal, with Big Loud still at the treeline.
  It buried Aki, Hugo, Jamila, Cameron, Yu-ri, and Esperanza to
  monsters, Kyle and Alfredo to the wild, Zoe to the arena, and
  Katarina to thirst. Alfredo still takes the burnt piece, for
  Aki.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, fully cleared, partially cleared, and
  valve-resolved), defender conversations, favors with actionable
  answers, betrayal investigations that spend out and reach a
  verdict, grief grounded in real deaths, teaching both ways,
  nonverbal conversations, and now a sortie that spends a
  village's last food twice over — all on current master. The
  transcript file keeps ending-turn outcomes (23/23 engine-ended
  cases this panel; 1 cap-ended needs none).
- FUN: yes — favors with concrete wants, grief that names names
  and matches the record (including one-day-old grief for Aki),
  a pharmacist who confesses he used the player's trust and then
  refuses to confess twice, a village that argues about what to
  call the monsters, a sortie that clears a five-raider set and
  two more that spend the pantry to zero and still go out, and
  a village that ends the run still besieged with the monster
  at the treeline.
- WINNABLE: the leg itself is not a win path; 3 of 3 villages
  survive it this run (r103: 3 of 3, r99: 2 of 3) — and the
  hardest survival is the most instructive: 4 people, empty
  pantry, still standing. No win verdict is drawn from this leg
  alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88/r90/r93/r96/r99/r103
on all 3 seeds — defenderFights 95 -> 0, defendedCount 21 -> 0.
EXPLAINED, not a bug: the baseline's field names describe an older
instrument; current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON lives in r107-panel/determinism/ so
the glob counts each seed once.)

## Test-suite call
Instrument-only change (r107 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0, first attempt),
determinism re-run byte-identical, analyzer, 24 transcripts read in
full, code-reads for the sortie outcomes, the d117/d123 pantry-zero
spends, the clearedGorgeAfter id-match, the 10702 d16 cap-ended
transcript, and the R70 lastDeathDay field.
check --quick: 284 passed, 6 failed in 899s (log:
goal hidden_files/evidence/2026-11-02/r107-panel/r107-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r103's baseline exactly. No new
failure. The capable-bot food-deed proof is green again (it appears
only in the slowest list, not the FAIL list), confirming r99's and
r103's stand-down. This run is instrument-only with zero src/js diff,
so no failure is attributable to r107.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. WRAP-CHECK judged as pre-registered (23/23
  ending-turn cases with outcome lines; 1 cap-ended transcript
  needs no dump, same clause as r103's 6).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (1 Codex page-turn line: Highbeam
  Deer d123) is a sortie kill announced by the Codex, matching
  the d123 clear day-for-day — explained, not a gap. (2) The
  legacy early count (10702 d117:1) vs TRUE early count 0 is the
  corpse-counting method vs the corpse-excluded definition; the
  prereg judges TRUE. (3) The boundary cross-check's 0-sample
  target is the known sleep-roll stamping class from r88, not a
  hidden due sortie. (4) The two MISSED-WINDOW drifts are
  instrument blind spots, counted per the prereg. (5) Days-tail
  wobble (120/123, 120/121, 120/122) read as bands, as before.
  (6) The clearedGorgeAfter name-match (4 lines) is read as
  instrument over-match via the shared "redactor" id, not game
  behavior — see C2b.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as observations:
  steered lately attempts on 3 defenders hit a closed gate;
  unsteered lately fired once (grief dream class, d29).
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
  needs a refusal panel — two refusal-free panels running, so
  the next run should not expect one; (2) W4 (naming-debate
  third person) unobserved this panel; (3) the 0-kcal gorge line
  at empty pantry is narration of a gorge on nothing — worth
  one line in the conversation lane's backlog, not a verdict;
  (4) the R70 lastDeathDay field tracks say-line deaths, not the
  census — C7 should keep using the census.
- HELD WORK (not this run's, flagged for the main session):
  journey2-crisis-r90 (stalled run's tree, scripts now committed
  via r90 — the tree itself is redundant but left untouched for
  main-session inspection), journey2-succession and
  journey2-succession-r86 (both still carry uncommitted changes,
  untouched throughout this run).

## Closeout
- Commit f9dc428db (worktree journey2-crisis-r107, base cee4041c3)
  committed cleanly. Safe-commit index clobber struck the commit
  (3 files staged-deleted in the worktree index, files intact);
  repaired via `git read-tree HEAD` resync before any rebase or
  merge; verified clean (status empty, diff empty, hashes match).
- Master moved mid-run to 99ec4fcd5 (batch ship version bump):
  branch rebased onto 99ec4fcd5 (306a66f3d, all 3 files verified
  byte-identical across the rebase), and a post-rebase seed-10701
  re-run diffed byte-identical to the panel JSON, so the panel
  stands on the new master.
- Merged locally via --ff-only, pending ship — no version bump, no
  push (the ship loop owns those).
- Rotation-b advanced 6 -> 7, verified by re-read. Next Lane B leg
  is 7 (succession).
- Lane B lock deleted at closeout. Worktree journey2-crisis-r107
  released and removed; branch deleted.
