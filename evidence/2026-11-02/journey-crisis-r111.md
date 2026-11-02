# Journey crisis r111 — three villages that broke, and a dead man who joined twice (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: last Lane B run is r110 (social, wrote rotation
5 -> 6). This run takes r111 in the Lane B series so filenames
stay unique; the rotation file, not the number, is the authority.

Substrate r107 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r107 driver/analyzer verbatim EXCEPT filenames r111,
pilot seeds 11101/11102/11103, evidence dir 2026-11-02 panel subdir
r111-panel. Diff r107 -> r111 reviewed: only renames.
node --check clean on both scripts. Determinism leg: seed 11101
re-run BYTE-IDENTICAL (panel JSON, r111-panel/determinism/, and
its 8 transcripts identical too), so the fork is trajectory-neutral.

## Run setup — clean registration, slow start, fast seeds
- No lock file existed at run start, so no stale-lock recovery was
  needed; fresh lock written (2026-11-02T14:55:37Z), to be deleted at
  closeout.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  and the directory still holds orphan evidence from Oct 14-25 runs.
  Same class as r88/r90/r93/r96/r99/r103/r107. This run uses
  journey2-crisis-r111 (unique, still the lane-B journey2- prefix,
  never the lane-A journey- prefix). The orphan dir is left
  untouched.
- Registration was slow but clean: `git worktree add` + reset took
  ~5 minutes under sibling load, then the registry entry and
  heartbeat landed (15:01:52Z, re-verified; the standing 10-minute
  heartbeat loop's landing was verified by registry read-back,
  15:12:06Z, with a readable log, never /dev/null). No EPERM flap
  this run.
- Pre-flight: main tree clean (`git status --short` empty), disk
  22% (df -h ~), `git pull` already up to date (58069c1b2).
  `worktree-reap.sh` ran clean: 5/16 active, held dirty trees
  (journey2-succession, journey2-succession-r86, journey2-crisis-r90)
  LOUD-protected and untouched.
- Smoke test first, into a scratch dir (not the panel dir, so the
  panel stays pristine; scratch dir removed after): SEED=11101
  DAYS=5 proved the doAction wrap runs (JSON parses, seed present,
  favorNoLongerCalls [], instrumentErrors []) before the panel
  launched.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; DISEASES.md, MONSTER-WAVES.md,
  CONTESTS.md heads re-read. Gating freeze (2026-10-27) untouched.
  No canon doc covers crisis-as-a-leg directly; the leg's systems
  are covered by DISEASES.md (sickness deaths here), MONSTER-WAVES.md
  (raider sets), and CONTESTS.md (moots) — none reinvented, none
  changed.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 11101 / 11102 / 11103, sequential, all exit 0 first attempt, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-02/r111-panel/.
Analyzer output: r111-panel-analysis.txt (same dir).
Pilot-only per §9-12: the pilot answered the leg's questions
(including the first refusal panel and the F1 firing below), so no
panel expansion; the r107 panel seeds were NOT re-run.

- 11101: GAME OVER, 103 loop days. 7 raids, 37 gorge nights,
  5 sorties (2 ok, 3 refused), 8 convos. Ends scattered, 2 alive /
  0 kcal.
- 11102: GAME OVER, 74 loop days. 7 raids, 23 gorge nights,
  6 sorties (2 ok, 4 refused), 8 convos. Ends extinct, 0 alive /
  0 kcal.
- 11103: GAME OVER, 48 loop days. 1 raid, 0 gorge nights,
  0 sorties, 2 convos. Ends scattered, 1 alive / 0 kcal.

HEADLINE, stated plainly: this is the first crisis panel in the
r99/r103/r107/r111 series where NO village reaches the horizon
(r103: 3/3, r107: 3/3). The villages did not fail at the siege
gate — they broke on famine and attrition (see C1). The leg's
question is how the village bends or breaks; this panel shows the
breaking side, on fresh seeds, with named causes.

## C1 (bend, not break) — GO under the prereg wording, with the headline above
- Gates hold per C2, and every game-over has a named cause that is
  NOT a siege-mechanic failure:
  - 11101: the scattering — third consecutive hungry day, day 103
    ("Haven couldn't hold. On the third hungry day, people started
    walking — in different directions. The scattering, again.").
    Pantry had hit 0 on day 50 and kept emptying; the village ate
    again after every earlier 1-day blip ("Haven eats again") until
    the final three-day run.
  - 11102: extinction — "No one is left to pick up the Codex. The
    village dies out" (day 74, after Elena to the arena, Mireille
    and Onur to the wild on the final day). Attrition across
    monster / wild / arena / contest / sickness, not a stuck siege.
  - 11103: the scattering — third consecutive hungry day, day 48,
    after repeated 1-day pantry-empty blips from day 23 on. The
    player character (Rafael Torres) died of sickness on day 12
    and the mantle passed on — the run continued 36 more days
    under successors before scattering, so player death alone did
    not end it.
- C1(ii) is therefore satisfied as written. But 0/3 horizons is a
  real change of picture from r103/r107 and is reported as such,
  not smoothed over: on these seeds the famine clock (3 hungry
  days) and the attrition ledger end villages that the siege
  mechanics themselves never broke.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 7 / 7 / 1. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 0 too this panel.
- D1 snapshots all delayed >= 3 attempts: 11/11.
- deltaBad empty (11 attempts, 4 ok, 7 refused, deltaExact 4).
  D3 drift unknown = 0 (labels panel-wide: moved-on-valve 7,
  player-drawn-off 3, sortie-clear 1).
- Days-tail wobble: loop days vs max Game say-day are equal this
  panel (103/103, 74/74, 48/48) — no wobble to judge as bands.

## C2b (linger-conditional gorge/sortie) — GO, first refusal panel since r99
- Lingerer sets form on 11101/11102 (11103 forms none: judged on
  raids+resolutions alone per the analyzer's R70 verdict).
  Gorge nights: 37 / 23 / 0 (60 total, 47,542 kcal eaten at the
  treeline).
- Sorties: 11 attempts, 4 ok, 7 REFUSED — the first refusal panel
  since r99 (r103: 0, r107: 0). Every refusal carries the recorded
  reason 'no-fighters' ("the bench is bare"). Clear rate on ok
  sorties: 0/4 full clears — every ok sortie broke with monsters
  remaining.
- W1 (does a re-muster ever FULLY clear?) — ADVANCED, still not a
  yes: the analyzer's R58 book check shows 11102's d63 refusals
  (Callback + Loud-Eyes) were followed by a d65 re-muster of the
  SAME set (bookLastSortieDay 65) — and it did NOT clear: cleared
  0, broke, Kevin died to Loud-Eyes. So a re-muster after refusal
  now exists in the record, and it failed to clear. "Ever fully
  clear" stays unanswered in the strict sense (no full clear yet
  on any panel), but it is no longer a case of "no re-muster ever
  happened".
- W3 stays ANSWERED (r107): no weak-target break this panel. Both
  11101 breaks are against strong remainders (260/95 HP, then
  95/280 HP with a 9-HP Big Beast killed first); the 11102 d65
  break leaves 220/73 HP standing. The r103 broke-vs-16HP case
  stays a single, unexplained case, not a class.
- W4 (naming-debate third-person wrinkle, r103 d9) NOT observed
  again: naming debates appear (11101 d8/d40) in normal
  second person ("What's your vote?"). Carried as unobserved.
- Boundary-sortie cross-checks: ok:true on all 4 ok sorties;
  ok:false on the 7 refusals is the expected shape (a refusal is
  not a fired sortie — the check's ok flag tracks firing, and the
  refusals are recorded with reasons in C2b, not hidden).
  One target shows 0 prior waited>=3 samples (11101 d77 Big Beast
  — the known sleep-roll stamping class from r88, not a hidden
  due sortie).
- MISSED-WINDOW total = 2 (11101 d99 Ugly Beast + Big Loud, tick-
  part waited>=3 samples from d99): same instrument blind-spot
  class as r103 (3) / r107 (2), counted per the prereg, not game
  failures.
- gorgeAfterCleared (name-matched) = 0 this panel — no cleared-
  monster-gorging lines at all, and no repeat of the r103/r107
  shared-"redactor"-id over-match class.

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds; doActionWrapMissing false on all
  seeds; instrumentErrors [].
  Tick-part samples: 1140 / 693 / 339 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: all 18 driven
  transcripts carry the '(conversation ended by the engine)'
  marker (18/18, no cap-ended transcript this panel), so every
  closing outcome line is in its driven file. The r88 fix stands
  proven again.
- Determinism: seed 11101 re-run BYTE-IDENTICAL (panel JSON and
  all 8 of its transcripts).

## C3 (people check) — GO
Read in full: all 18 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).
- NPCs want concrete things: Luigi's / Lucas's / Elena's festering
  wounds ("If it festers I'm no good to anyone — can't haul, can't
  hunt, can't watch"), Landon's cistern count ("I checked the
  cistern three times hoping I misread it. 8 liters"), Landon's
  Taken aunt Elena and the humming pods (KIN canon, not
  invention), Dmitri's field teaching, Arturo's ambush case.
- Confessions refuse to repeat: Gunther's d17 confession ("I'm not
  from Denver. I'm from Columbus, Ohio. I wanted an edge. You were
  new, you were listening, and I used it") is refused a second
  telling in the same conversation ("We went over this. I already
  told you the truth about that"). Betrayal investigations spend
  out: Arturo's press ends "either it's true, or it's been
  rehearsed a lot. There's nothing more to press here" (11103
  d13); Luigi's bribery thread ends "the favors went out, but
  nobody's living richer" (11101 d17).
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —"
  -> "Still the same thing —" -> "I've told you three times
  now —" (Luigi d39, Landon d24, Lucas d40); recaps climb the
  same ladder to "We're going in circles a bit —" (Dmitri d41).
  Luigi's d39 wound favor pressed to the cap line then closes
  'declined' ("They won't ask twice... Forget I asked. I'll
  figure it out").
- Grief is grounded in real deaths, not generated filler: Gunther
  (11101 d27) mourns Aki ("Since Aki died... I keep expecting to
  see Aki at the fire") — Aki died to a monster on day 26, the
  day before. Lucas (11102 d50) mourns Landon ("Landon always
  took the burnt piece. Said someone had to. I take it now") —
  Landon died on day 24. Elena (11102 d60) mourns Dmitri
  ("I rinse the cup twice for Dmitri, now") — Dmitri died to the
  wild on day 50.
- Invitations are sometimes taken, in this leg too: Karen's
  watch-your-back accept (11101 d40: "Someone should watch your
  back. Might as well be me"), Gunther's accept (11101 d27),
  Elena's accept (11102 d60), Lucas's decline-then-accept
  (11102 d50: "Not right now. I've got my own things to handle"
  ... then "Okay. Yeah. I trust you.").
- Lately, observed only (r85 V2 answer stands, Steve-call):
  steered lately attempts on 3 defenders (11101 d8, 11102 d14,
  11103 d13) hit a closed gate (lately not offered, recorded not
  forced); unsteered lately fired 0 times this panel. No defense
  content in lately this panel. Steered lately fired 0 times.
- W4: NOT observed this panel (see C2b).
- No echo flags this panel: zero driver-answer echoes, zero stray
  gloss asides.
- Minor observation, not a verdict item: 11102 d23 closes with
  "Good — that wound care, settled" after a conversation that was
  about Landon's Taken aunt, not the wound — the closing line keys
  off the favor state (heal_help 'fulfilled' by then), not the
  conversation's topic. A topic/closing mismatch worth one line,
  not a finding.

## F1 (favor call-time cause) — BLANK ANSWERED, and the answer is a bug
- The call-time wrap fired for the FIRST time in eleven panels:
  seed 11101, days 94–102, a food_share favor for Sam Wilson
  (favor-sam_wilson-94-13, state 'asked') returned 'They are no
  longer available to receive help.' on engine menu calls, 6 days
  running (calls 2/3/3/3/3/1 per day, deduped by day+vid+favor).
  The disjunct is NAMED by elimination from the wrap's own
  call-time fields: rosterIncludes true, isPlayer false,
  personExists true — leaving person.dead as the only disjunct
  in convo-wants.js:1624's chain that can fire.
- The favor was minted on day 94 for a man dead since day 15.
  That is the bug below, not a stale-favor footnote: the dead
  man's identity had been re-issued as a "new" villager (see
  BLANK STATUS). F1 as a measurement question is now CLOSED —
  the line fires on person.dead, exactly as written — and its
  first firing exposed a real game defect, fixed in this run.

## BLANK STATUS: one blank filled WITH A FIX, one watch item advanced
### The dead man who joined twice (FIXED in this run)
Plain words: Sam Wilson starts in the village, has a foraging
favor on day 5, and dies in an ambush on day 15 — the village's
first grave. On day 45 the village hears "Sam Wilson wants to
join Haven", debates him warmly, and on day 64 he "walks in —
pack light, eyes wide". But it is the same Sam Wilson: the same
name, the same age (19), the same old job (bartender). From day
64 on he lives a second life on his corpse's record — he eats at
feasts, leaves bark and rawhides by the stash, laughs at jokes,
teaches Yara to tie a snare, speaks for the dead at graves —
while every system that checks whether someone is dead still
reads him as dead. He can never be helped (see F1). And on day
102, when Jesse dies, the mantle passes to Sam Wilson and the
player wakes up as him — while his record still says dead in
every lookup (villagers, rosterChars, vpOf, getPerson).
- Root cause, read in code (not guessed): genApplicant() in
  src/js/membership.js builds its exclusion set from current
  roster ids + pending application ids only. A dead villager has
  left the roster, so his background_survivor seed is eligible
  again. arrivalTick() then re-adds the id to the roster, and
  ensureRosterPerson() returns the existing dead record unchanged
  (its have-branch never clears or replaces a dead record).
  The probe (sam-probe-r111.js, replaying seed 11101 to day 103,
  trajectory-neutral: panel JSON tail and say-line count
  identical) shows exactly one sam_wilson record, dead=true, from
  day 90 through the day-102 mantle transfer — and only one
  roster Sam at every probe day.
- Also stale, same record: the day-5 forage_help favor
  (favor-sam_wilson-5-1) is still 'asked' at day 90–94, blocked
  as "partner no longer available" — a 90-day-old favor for a
  dead man that never closed. The fix below stops new cases; it
  does not retroactively close favors on already-joined corpses
  in old saves.
- FIX (src/js/membership.js, genApplicant): dead villagers' ids
  join the exclusion set, so a dead person's seed can never be
  picked as an applicant again. Ten lines, same try/catch style
  as the surrounding code. No other system touched.
- PROOF (scripts/test-applicant-dead-id-r111.js, shared sim
  harness, one loadGame): BEFORE the fix, the dead seed is
  issued 35/50 calls; AFTER, 0/50 (all drifters), the living
  off-roster seed still issues 34/50, and the roster seed is
  still excluded 0/50. 3/3 pass after the fix.
- AFTER-FIX replay (r111-panel/afterfix/, seed 11101, same driver,
  103 days): NO Sam Wilson applicant/arrival/mantle line at all,
  favorNoLongerCalls [], and the village reaches the horizon
  instead of scattering on day 103. One seed, and applicant
  changes shift later RNG draws, so this is a fix check, not a
  balance claim — but the corpse-rejoin path is gone on the
  exact seed that exhibited it.
- What the fix does NOT do: it does not change succession
  selection or ambient-line dead-filtering as separate systems.
  If another path ever puts a dead id back on the roster, the
  same split (acting corpse, blocked favors, mantle to a corpse)
  could recur through that path. The applicant path — the one
  proven here — is closed. The succession-picks-a-dead-member
  and ambient-lines-ignore-dead questions are named here as
  follow-ups, not silently fixed.

## C7 (famine/disease pressure census, descriptive, no bar)
- 11101: pantry low-water 0 kcal (iter 49, gameDay 50), ended at
  0. 16 corpses, 1 starvation (Rose d49), 0 sickness: arena ×2,
  monster ×5, the wild ×6, the night ×1, ambush ×1, starvation
  ×1 — full list in the panel JSON census.
  Scattered with 2 alive (Yara, Guadalupe).
- 11102: pantry low-water 0 kcal (iter 42, gameDay 43), ended at
  0. 15 corpses, 0 famine, 1 sickness (Carlos Diaz d64): the
  night ×1, contest ×1, monster ×5, the expedition ×1, combat
  ×1, the wild ×3, sickness ×1, emergency hunt ×1, the arena ×1.
  Extinct, 0 alive.
- 11103: pantry low-water 0 kcal (iter 22, gameDay 23), ended at
  0. 12 corpses, 0 famine, 1 sickness (Rafael Torres d12, the
  player character): the wild ×6, sickness ×1, ambush ×1, thirst
  ×1, the arena ×1, contest ×1, a wound that wouldn't close ×1.
  Scattered with 1 alive (Daniyar).
- Pantry-zero reframe, qualified by this panel: earlier panels
  established pantry-zero is not starvation while foraging feeds
  people — and that held here for weeks (repeated 1-day blips
  followed by "Haven eats again"). What ends a village is THREE
  CONSECUTIVE pantry-empty days (the scattering clock), which
  both scattered seeds hit at the end. Foraging feeds people;
  it does not stop the scattering clock when the pantry itself
  stays empty. That distinction is the honest version of the
  reframe.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107: also
  0). The phoenix per-event respawn cascade did not recur. The
  Steve-call stands unchanged.

## Village assessment (plain words)
- 11101: the village that buried its first man twice — fought 7
  raids, lived through 37 gorge nights, sent 5 sorties (2 went
  out, 3 found the bench bare), and scattered on day 103 with
  Yara and Guadalupe walking away in different directions. It
  buried Sam to an ambush on day 15, Aki and Sari and Karen and
  Xavier and Kobby to monsters, Rose to starvation, Gunther and
  Luigi and Nora and Jorge and Jesse to the wild and the night,
  Dieter and Gael to the arena — and it welcomed Sam Wilson back
  through the gate on day 64 without noticing he was already in
  its first grave. Its people still talk about the dead by name:
  Aki at the fire, one day on.
- 11102: the village that ran out of people — fought 7 raids,
  lived through 23 gorge nights, sent 6 sorties (2 went out, 4
  found the bench bare, one of the two cost Kevin his life), and
  died out on day 74 with nobody left to pick up the Codex. It
  buried Everett to the night, Lamia to a contest, Taine and
  Olivia and Saravanan and Soo and Kevin to monsters, Landon to
  an expedition, Lucas to combat, Dmitri to the wild, Carlos to
  sickness, Boris to an emergency hunt, and Elena, Mireille and
  Onur on the last day. Landon is still owed his burnt piece,
  and Lucas still takes it for him.
- 11103: the village that scattered young — fought 1 raid, never
  saw a lingerer set, and scattered on day 48 with Daniyar alone.
  It buried Simone and Hermann and Xavier and Lily and Nathan
  to the wild, Rafael (the player) to sickness on day 12, Arturo
  to an ambush, Birgit to thirst, Brian to the arena, Farid to a
  contest, and Giancarlo to a wound that wouldn't close. The
  mantle passed on after Rafael, and the village still could not
  hold its pantry past three empty days.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, broken, and now refused with a recorded
  reason), defender conversations, favors with actionable
  answers, betrayal investigations that spend out and reach a
  verdict, grief grounded in real deaths, teaching, invitations
  sometimes taken — all on current master. And now, for the
  first time, the favor system's 'no longer available' line
  firing in the wild, with its disjunct named.
- FUN: yes — a bribery thread that spends out across two
  conversations, a pharmacist-style confession that refuses a
  second telling, a village that argues about what to call the
  monsters, a sortie that kills a 9-HP beast and breaks on a
  280-HP remainder, a re-muster that goes out after a refusal
  and costs a life, and a village that ends still owing its
  dead their burnt piece. The Sam Wilson case is the opposite
  of fun when seen plainly — a dead man welcomed home as a
  stranger — and it is fixed in this run, not just noted.
- WINNABLE: the leg itself is not a win path; 0 of 3 villages
  survive it this run (r103/r107: 3 of 3) — and the survivals
  that failed did so on famine and attrition, not on any siege
  gate. No win verdict is drawn from this leg alone. The
  after-fix replay reaching the horizon on seed 11101 is a fix
  check, not a winnability claim.

## Telemetry deviation check
`telemetry-check.js` over the three new panel JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88/r90/r93/r96/r99/r103/r107
on all 3 seeds — defenderFights 95 -> 0, defendedCount 21 -> 0.
EXPLAINED, not a bug: the baseline's field names describe an older
instrument; current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism, afterfix, and samprobe JSONs live in panel
subdirs, so the panel-root glob counts each seed once.)

## Test-suite call
Instrument + fix change (driver/analyzer fork, proof test, one
src/js fix). Verification: node --check on all new/changed
scripts, 5-day smoke run (wrap proven running), 3-seed driver
runs (all exit 0, first attempt), determinism re-run
byte-identical, analyzer, 18 transcripts read in full, probe
replays for the Sam finding (trajectory-neutral, then extended
for the roster-Sam table), proof test before/after (35/50 -> 0/50
dead issuance), after-fix seed-11101 replay (no Sam Wilson lines,
favorNoLongerCalls [], horizon), telemetry check (2 known LOUDs).
check --quick: 284 passed, 6 failed in 649s (log:
goal hidden_files/evidence/2026-11-02/r111-panel/r111-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r107's baseline exactly. No new
failure. The capable-bot food-deed proof is green again (it appears
only in the slowest list, not the FAIL list). This run's src/js
change (membership.js applicant exclusion) is covered by its own
proof test (3/3) and the after-fix replay; no failure is
attributable to r111 beyond the standing six.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. WRAP-CHECK judged as pre-registered (18/18
  ending-turn cases with outcome lines; no cap-ended transcript
  this panel, so no cap clause was needed).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (1 Codex page-turn line: Big Beast
  d77) is a sortie kill announced by the Codex, matching the
  d77 clear day-for-day — explained, not a gap. (2) The R58
  book check's refusedDayIsLastSortie=false on 11102 d63 is the
  re-muster signature (a later d65 sortie exists for the same
  book), not a bookkeeping error. (3) The boundary cross-check's
  ok:false rows are refusals, recorded with reasons in C2b, not
  missed firings. (4) The two MISSED-WINDOW drifts are instrument
  blind spots, counted per the prereg. (5) The C1 GO verdict
  reads the prereg literally (named non-siege causes); the 0/3
  horizon count is reported alongside it as the headline, not
  folded into the gate. (6) F1's close is per its prereg clause
  (an occurrence naming its disjunct); the occurrence's cause
  is the dead-identity bug, fixed in this run — the F1
  instrument is inherited unchanged by the next run, which
  should expect zero occurrences again now that the applicant
  path is closed.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as observations:
  steered lately attempts on 3 defenders hit a closed gate;
  unsteered lately fired 0 times.

## Closeout — rebase, post-rebase proof, merge
- Sibling landings mid-run: Lane A landing r72 (c0cf1d401) and
  Loop B 1505Z coordinator evidence (c9b20ac2a) landed on master
  after this branch was cut. Per the loop rules the branch was
  rebased onto c9b20ac2a before merging.
- Rebase quirk, same class as the documented 2026-10-30
  stop-at-pick: the rebase stopped at the single pick with the
  pick in BOTH the done and todo lists, worktree clean, the
  pick's changes unapplied (fix absent, new files absent).
  Recovery per the documented recipe: verified tree clean +
  pick unapplied, then `git rebase --continue` — it sailed
  through. Rebased commit 7776da714; its tree delta vs the
  original 02eda39ac is exactly the sibling landings (my 5 files
  identical in both), no sibling file clobbered.
- Post-rebase proof re-run: proof test 3/3 again on the rebased
  tree; node --check clean on driver/analyzer. Post-rebase seed
  11101 driver run (r111-panel/postrebase/): exit 0, horizon,
  favorNoLongerCalls [], instrumentErrors [], 0 Sam Wilson
  lines — and BYTE-IDENTICAL to the after-fix run. Sibling r72's
  changes do not move this seed's trajectory at all; the fix's
  effect reproduces exactly on the new base. (It differs from
  the pre-rebase panel JSON, as it must: the panel measured the
  unfixed game.)
- Merge: `git merge --ff-only journey2-crisis-r111` in the main
  tree, fast-forwarding master to 7776da714; main tree clean
  after, rotation 6 -> 7 written and re-read, lock deleted,
  worktree released. Merged locally, pending ship — no version
  bump, no push, no live verification (the ship loop owns those).
