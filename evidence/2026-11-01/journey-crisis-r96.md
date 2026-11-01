# Journey crisis r96 — three villages stand, and the sortie says no to the weakest one (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: last Lane B crisis run is r93; r94 succession,
r95 endgame, and the social r80 recovery landing have all landed
since. This run takes r96 in the Lane B series so filenames stay
unique; the rotation file, not the number, is the authority.

Substrate r93 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r93 driver/analyzer verbatim EXCEPT filenames r96, pilot
seeds 9811/9812/9813, evidence dir 2026-11-01 panel subdir r96-panel.
Diff r93 -> r96 reviewed: only renames plus the seed change.
node --check clean on both scripts. Determinism leg: seed 9811 re-run
BYTE-IDENTICAL (panel JSON, r96-panel/determinism/), so the fork is
trajectory-neutral.

## Run setup — pre-written prereg adopted, clean registration
- No lock file existed at run start, so no stale-lock recovery was
  needed; fresh lock written (2026-11-01T18:57:00Z), to be deleted at
  closeout.
- A r96 prereg already existed before this run started (written
  2026-11-01T17:59Z, author unknown — plausibly a prep step of this
  same scheduled job). It named this run's slug, seeds 9811/9812/
  9813, and panel subdir r96-panel, and its carried bars match r93
  exactly. This run ADOPTED it verbatim rather than writing a
  competing prereg: no panel output, lock, or tree existed for r96
  before this run, and no r96 process was running, so there is no
  collision — but the pre-write itself is noted here because a
  prereg appearing before its run is unusual and the next run
  should say where its prereg came from if it also finds one
  pre-written.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  and the directory still holds orphan evidence from Oct 14-25 runs.
  Same class as r88/r90/r93. This run used journey2-crisis-r96
  (unique, still the lane-B journey2- prefix, never the lane-A
  journey- prefix). The orphan dir was left untouched.
- Registration was slow but clean: `git worktree add` took ~6
  minutes under sibling load (a Lane A deepening run and a Lane B
  patchrot panel were running), then the registry entry and
  heartbeat landed (18:57:56Z, re-verified 19:04Z). Heartbeats
  re-verified landed after every panel seed. No EPERM flap this
  run; no file-write retries needed (all three seeds landed on
  attempt 1 with parse verification).
- Smoke test first, into a scratch dir (not the panel dir, so the
  panel stays pristine): SEED=9811 DAYS=5 proved the doAction wrap
  runs (JSON parses, seed present, favorNoLongerCalls [] ,
  instrumentErrors []) before the panel launched.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; repo AGENTS.md (worktree copy,
  verified identical to the main-tree copy) read; DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md heads re-read. Gating freeze
  (2026-10-27) untouched. No canon doc covers crisis-as-a-leg
  directly; the leg's systems are covered by DISEASES.md (sickness
  deaths here), MONSTER-WAVES.md (raider sets), and CONTESTS.md
  (moots) — none reinvented, none changed.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 9811 / 9812 / 9813, sequential, all exit 0, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-01/r96-panel/.
Analyzer output: r96-panel-analysis.txt (same dir).
Pilot-only per §9-12: the pilot answered the leg's questions
(including the second refusal panel in the series — see C2b), so no
panel expansion; the r93 panel seeds were NOT re-run.

- 9811: horizon, 120 loop days (say-day 122). 12 raids, 4 gorge
  nights, 1 sortie, 8 convos. Ends 7 alive / 156,735 kcal.
- 9812: horizon, 120 loop days (say-day 124). 9 raids, 18 gorge
  nights, 3 sorties, 8 convos. Ends 2 alive / 0 kcal.
- 9813: horizon, 120 loop days (say-day 125). 13 raids, 29 gorge
  nights, 4 sorties, 8 convos. Ends 8 alive / 56,154 kcal.

## C1 (bend, not break) — GO
- Gates hold per C2, and there is no game-over to explain: 3 of 3
  villages reach the horizon (r93: 1 of 3). The bend-not-break
  clause is met vacuously on deaths and positively on survival —
  including 9812, which reaches the horizon with 2 people and an
  empty pantry after 22 corpses. No siege-mechanic failure anywhere
  (see C2).

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 12 / 9 / 13. Fought resolutions on all
  seeds (every resolution list includes fought; 9812 adds one
  moved-on tick resolution at d123).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 1 (9813 d94) — the one legacy
  "remaining lingerer" is a corpse (lingeringAtResolution 1,
  lingeringAtResolutionTrue 0), so the TRUE bar holds. Same class
  as the r60 definition, not a new gap.
- D1 snapshots all delayed >= 3 attempts: 8/8.
- deltaBad empty (8 attempts, 6 ok, 6 cleared to zero remaining,
  deltaExact 6). D3 drift unknown = 0 (labels panel-wide:
  sortie-clear 7, player-drawn-off 16, moved-on-valve 1).
- Days-tail wobble persists, same class as r70/r71/r82/r85/r88/r90/
  r93: loop-iteration days vs max Game say-day 9811 120 vs 122,
  9812 120 vs 124, 9813 120 vs 125. Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, second refusal panel
- Lingerer sets form on all seeds. Gorge nights: 4 / 18 / 29
  (51 total, 60,035 kcal eaten at the treeline). 9813 lived under
  siege pressure for 29 gorge nights — the leg's long-siege case.
- Sorties: 8 attempts, 6 ok, 2 REFUSED — the second refusal panel
  in the series (r93: 3, r90: 0). Both refusals carry the recorded
  reason 'no-fighters', so C2b's bar is met, not missed:
  - 9812 d121, target The Eulogy: refused 'no-fighters' twice
    (attempts 2 and 3, same day — the driver retried same-day
    after the first refusal). bookSorties 0 — the set never got a
    sortie. The set then resolved via the moved-on valve at d123.
    Refusal did not strand the village; the valve did its job.
  - The d101 sortie on the same seed fired and cleared (Murkcap,
    paid 657 kcal — the village's last 657 kcal, pantry to zero).
    The village that could still muster at d101 could not at
    d121: the refusal tracks the village's real decline, not a
    stuck gate.
- Boundary-sortie cross-checks read ok:true except exactly the two
  refused attempts (ok:false there encodes the refusal, not
  missing samples — the refused target shows 10 prior waited>=3
  samples). The boundary sampler hides no due sortie this panel.
- MISSED-WINDOW total = 2 (9812 d101 player-drawn-off, 4
  tick-part waited>=3 samples from d100; 9812 d123 moved-on-valve,
  6 samples from d122): two instrument blind spots, counted here
  per the prereg, not game failures (r93: 1).
- No partial clear this panel (r93 had one): all 6 fired sorties
  cleared to zero remaining.

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds (R70/R82 sections);
  doActionWrapMissing false on all seeds; instrumentErrors [].
  Tick-part samples: 1115 / 1133 / 1070 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: 23 of the 24 driven
  transcripts carry the '(conversation ended by the engine)' marker,
  and all 23 show their outcome lines in the driven file (NPC lines
  precede the marker in every case). The 1 without the marker
  (9813 d29) ended on the driver's turn cap, not on an engine end —
  its final turns' NPC lines are present in the file, so no dump
  was owed and nothing was swallowed. The r88 fix stands proven
  again, not merely code-verified.

## C3 (people check) — GO
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).
- NPCs want concrete things: Elmarie's forage outing ("The stores
  won't stretch past tomorrow, and I'm not choosing who eats. I
  know the south slope below the meadow — come with me and we'll
  fill packs before dark"), Pavel's burn-ground run ("I did the
  count twice. The count doesn't change. Nobody's worked the old
  burn east of camp in days"), Henry's festering wound ("If it
  festers I'm no good to anyone — can't haul, can't hunt, can't
  watch. Just clean it out and wrap it tight" — the same shared
  wound-voice line r90 saw, a voice line, not a defect). The favor
  probes behind every transcript confirm the game state: Elmarie's
  forage_help ends 'promised' with the Haven-hall reason; Henry's
  heal_help ends 'promised' with the Haven-door reason; Natalie's
  forage_help ends 'moot' with "This forage request is closed."
  No favor ever returned 'no longer available' (see F1).
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —" ->
  "Still the same thing —" -> "I've told you three times now —";
  recaps climb the same ladder to "We're going in circles a bit —"
  (Mason d39, Victor d59, Henry-adjacent recaps show the full
  ladder). "Tell me more" spends out ("That's the whole of it.
  Sorry." — Luis d58; Elmarie's wanting-to-be-needed chain d44
  ends "Home is where they save you a seat.").
- Invitations are sometimes taken, in this leg too: Elmarie's ridge
  walk (d44), Mason's thinking place (d10) and cache spot (d20),
  Klaus's thinking place (d11), Victor's hollow walk (d49, hand on
  sleeve, "faster than you came"), Tom's buried cache (d50: +1684
  kcal to the pantry, a real state effect) and stockpile gift
  (d51: +4 wood, +4 fiber to the village stash), Luis's
  watch-your-back accept (d58: "Someone should watch your back.
  Might as well be me."). Declines carry character: Victor's
  invite (d49: "Not right now. I've got my own things to
  handle.").
- Grief is grounded in real deaths, not generated filler: Victor
  (d49) mourns Mason ("Since Mason died... I keep expecting to see
  Mason at the fire. Stupid.") — Mason died d47 contest, two days
  before, day-for-day. Luis (d58) mourns Henry ("Henry is gone
  and the world just... continues.") — Henry died d51 the night,
  seven days before; "Nobody says Henry's name right yet. We
  will." Mason (d20) mourns Rosa ("Rosa is gone and the world
  just... continues.") — Rosa Mendez, the mantle-bearer, died d20
  the wild, the very day of the conversation (see the census note
  below: her death is in sayLines, not in the census corpses
  list). Pavel (d58) names the dead plainly: "I asked Emily about
  the pantry run — Emily's gone." Emily Justice died d41 the
  wild. Mason (d40) carries the Taking: spouse Karen "taken at the
  Scattering... the pods, rows deep, humming" — KIN canon, not
  invention.
- Betrayal investigations spend out and reach a verdict: pressing
  Mason/Klaus until "either it's true, or it's been rehearsed a
  lot. There's nothing more to press here"; the leniency offer
  ("Talk first. Leniency. The offer expires when I walk away.")
  changes things ("They talked. Everything changes now.").
- Defense content appears in its own slot, not lately: Natalie
  (d10) on the raid — "I stood down White Noise at the treeline
  — it ran. Don't call it brave. Call it awake."
- No echo flags this panel: zero "Columbus, Ohio" origin echoes
  (the driver's fixed answer never surfaced), zero stray gloss
  asides (r93's Yorman/Arun class absent). The panel's audible
  gaps are none.

## F1 (favor call-time cause) — blank stays OPEN, wrap inherited
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos, and no transcript contains the line. Per the prereg,
  zero occurrences keeps the blank OPEN (same as r71/r82/r85/r88/
  r90/r93 — seven consecutive zero panels). The wrap is inherited
  by the next run.

## C7 (famine/disease pressure census, descriptive, no bar)
- 9811: pantry low-water 16,055 kcal (iter 41, gameDay 43),
  recovered to 156,735. 11 corpses, none famine/disease (8 wild, 1
  ambush, 1 monster, 1 player-wild). A squeeze, not a famine.
- 9812: pantry low-water 0 kcal (iter 78, gameDay 81), ended at 0.
  22 census corpses + 2 early say-line deaths (see note): the
  wild, contests, monsters (8 late monster deaths), the village's
  own pit trap (Victor Lopez d75), sickness ×2 (Pavel Dubinin d84,
  Mara Vasquez d106), a wound that wouldn't close (Priya Nair
  d111), the arena (Yara Haddad d115), the night (Hugo Flores
  d85). 0 famine deaths — the village sat at zero pantry for 40+
  days (d81 to horizon) with 2 people alive and nobody starved:
  pantry-zero is not starvation while foraging and gorge nights
  (18) still feed people. That sharpens r93's note: starvation
  kills individuals under pressure, but an empty pantry alone
  does not kill a village that can still eat outside it.
- 9813: pantry low-water 1,800 kcal (iter 46, gameDay 50),
  recovered to 56,154. 10 corpses, none famine/disease except by
  the near-miss classes: dehydration (Giulia Bianchi d47), a wound
  that wouldn't close (Nino Kapanadze d47), the night ×3, monsters
  ×4, the wild ×1 (Luis Fernandez d123, the last day).
- CENSUS VERDICT: disease pressure bit again (2 sickness deaths on
  the weakest seed); famine deaths did not recur this panel (r93
  had 2). The leg's disease episode is not theoretical; starvation
  remains the rarer killer — this panel, zero.
- CENSUS-COVERAGE NOTE (instrument, not a game failure): 9812's
  census corpses list starts at d41, omitting the d9/10 first-grave
  death (Vasyl Shevchenko, ambush) and the d20 mantle death (Rosa
  Mendez, the wild) that sayLines record and the mourning lines
  match. 9811/9813 census corpses start at their first deaths, so
  the omission is specific to 9812's early mantle passes. The
  deaths are real in sayLines; only the census list undercounts
  them. A future instrument pass should say where census corpses
  starts counting; no verdict in this run depends on it (C7's
  sickness/famine counts come from the same list, and both
  sickness deaths here are post-d41).

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90/r93: also 0). The phoenix
  per-event respawn cascade did not recur. The Steve-call stands
  unchanged.

## BLANK STATUS: no blank filled this run, two watch items answered
- This run fills no new blank: the instrument is unchanged from
  r93, and no src/js fix was in scope. What it does is answer
  r93's two watch items: (W1) 'no-fighters' refusals struck the
  weakest seed again (9812: 2 alive / 0 kcal at horizon) — but
  that seed still reached the horizon, so refusals are NOT
  confined to game-over seeds; they strike the weakest village
  whether it ultimately scatters or barely stands. (W2) famine
  deaths did not recur, and 9812's 40+ days at zero pantry with
  zero starvation deaths reframes the famine story: the killer
  is individual starvation under pressure, not the pantry number
  itself. F1 stays OPEN by its own bar.

## Village assessment (plain words)
- 9811: the village that held comfortably — fought 12 raids, ended
  with 7 people (Onni, Elif, David, Minh, Brian, Lucas, Tanya) and
  156,735 kcal. It buried Ruby to the wild on day 20 and Tariq,
  its d55 sortie leader, to the wild on day 119 — the last day of
  the run. Elmarie is its memory: the south-slope forage promise,
  the ridge walk, the seat she is looking for.
- 9812: the village that was ground down to two and still stood —
  fought 9 raids, lived through 18 gorge nights, spent its last
  657 kcal on the d101 sortie that cleared Murkcap, could not
  muster a fighter for The Eulogy at d121, watched the set move
  on at d123, and reached the horizon with Ines and Rosario and
  an empty pantry. It buried 22+ people: its own pit trap took
  Victor, sickness took Pavel and Mara, monsters took eight late.
  Its people still talk about the dead by name — Mason at the
  fire, Emily on the pantry run, Rosa the day she died.
- 9813: the village that grieved and stood — fought 13 raids,
  lived through 29 gorge nights, ended with 8 people (Aki, Nora,
  Nepia, Laura, Fabio, Adélia, Chantelle, Hany) and 56,154 kcal.
  It buried Giulia to thirst and Nino to a wound on the same day
  (d47), lost Tom and Hannah to the night, and Luis — who said
  food is the first promise a group makes to itself — to the wild
  on the last day. A village that keeps its pantry full and its
  promises is the one that stands.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, cleared, refused-with-reason, and valve-resolved),
  defender conversations, favors with actionable answers, betrayal
  investigations that spend out and reach a verdict, grief grounded
  in real deaths, and now sickness deaths all fire on current
  master. The transcript file keeps ending-turn outcomes.
- FUN: yes — favors with concrete wants, grief that names names
  and matches the record (including same-day grief for Rosa),
  invitations sometimes taken and sometimes refused with character,
  a confessor who won't confess twice, a village that argues about
  what to call the monsters — and this panel, no echo flags at all.
- WINNABLE: the leg itself is not a win path; 3 of 3 villages
  survive it this run (r93: 1 of 3) — and the weakest survival is
  the most instructive: 2 people, empty pantry, still standing.
  No win verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88/r90/r93 on all 3
seeds — defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED,
not a bug: the baseline's field names describe an older instrument;
current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON lives in r96-panel/determinism/ so
the glob counts each seed once.)

## Test-suite call
Instrument-only change (r96 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0, first attempt),
determinism re-run byte-identical, analyzer, 24 transcripts read in
full, code-reads for the refusal reasons, the d94 legacy-early case,
and the Rosa/Vasyl census-coverage note.
check --quick: 283 passed, 7 failed in 690s (log:
goal hidden_files/evidence/2026-11-01/r96-panel/r96-checkquick.log).
Six failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r90/r93's baseline. The seventh
is NEW vs r93 and is reported LOUDLY below; it is NOT attributable
to r96 (instrument-only, zero src/js diff, check script count
unchanged at 290, so the two new scripts never ran inside check).

LOUD, NEW vs r93: scripts/test-capable-bot-20261014.js fails the
subtest "real capable player combat earns the food deed at first
use" (39 passed, 1 failed). Reproduced standalone in this worktree
after the full run (check.js --only capable-bot: 0 passed, 1 failed
in 26s, identical subtest) — NOT load contention, unlike r93's
cache-flags flake (which passes this run). Since r93's check, two
src/js landings touched conversation flow: journey-establishment
r72 (2026-11-01 13:45Z, src/js/conversation.js favor-menu goon
continuer, [needs-eyes]) and journey-scale r67 (2026-11-01 15:56Z,
convoPick quote-normalized dedupe fix). One of them is the prime
suspect; this run does NOT bisect or fix it — it is outside the
crisis leg, and a fix belongs to the owning lane with its own
proof. Flagged for the main session: the capable-bot food-deed
proof is red on current master.
Baseline NOT redefined by this run; the six standing families plus
this new failure are reported as-is.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. WRAP-CHECK judged as pre-registered (23/23
  ending-turn cases with outcome lines; the 1 cap-ended transcript
  needed no dump, same clause as r90/r93).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (5 Codex page-turn lines: Murkcap
  d101, Cliffhanger d70, Dustboar + The Loud Beast d102, The
  Reverend d119) are sortie kills announced by the Codex, matching
  D2 clears day-for-day — explained, not a gap. (2) The 9813 d94
  legacy-early count of 1 is a corpse-counted lingerer
  (lingeringAtResolutionTrue 0) — the TRUE bar holds. (3) Days-tail
  wobble (120 vs 122/124/125) read as bands, as before.
  (4) The boundary cross-check's ok:false on refused attempts
  encodes the refusal, not missing samples — the refused target
  shows 10 prior waited>=3 samples. (5) The two MISSED-WINDOW
  drifts are instrument blind spots, counted per the prereg.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as an observation:
  steered lately attempts on 3 convos hit a closed gate (subject
  pivots exhausted, lately not offered, recorded not forced);
  unsteered lately fired 0 times this panel (r93: also 0).
- R1 NOT re-investigated (r85 verdict stands).
- Carried (unchanged): F1 favor 'no longer available' blank stays
  OPEN with the call-time wrap inherited; dead discoverer's
  orphaned fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); phoenix per-event cascade (Steve-call); armor
  causation (needs a control arm); telemetry mapping proposal
  defenderFights -> defendedFights; gating freeze (2026-10-27)
  untouched.
- NEW for the next run / for Steve: (1) refusals are now measured
  on a surviving seed — the next run should watch whether a
  refused seed ever recovers fighters and re-musters, or whether
  refusal always precedes the valve (here: valve both times, r93:
  valve once + recovery once); (2) the census-corpses start-count
  question (9812's pre-d41 deaths missing from the list) is a
  small instrument-hygiene item; (3) the pre-written prereg: if
  the next run also finds its prereg pre-written, it should note
  the writer, not just adopt silently.
- HELD WORK (not this run's, flagged for the main session):
  journey2-crisis-r90 (stalled run's tree, scripts now committed
  via r90 — the tree itself is redundant but left untouched for
  main-session inspection), journey2-succession and
  journey2-succession-r86 (both still carry uncommitted changes,
  owner oversight-playtest-loop-2, LOUD-protected from the reaper).
  Per INSPECT HELD WORK these need a main-session inspection, not
  a loop-run touch.

## Closeout
- Commit [COMMIT-TO-FILL] (driver + analyzer + this note;
  instrument only, zero src/js). Safe-commit index clobber check
  performed before any rebase or merge (see commit step).
- Merged locally via --ff-only, pending ship — no version bump, no
  push (the ship loop owns those).
- Rotation-b advanced 6 -> 7, verified by re-read. Next Lane B leg
  is 7 (succession).
- Lane B lock (2026-11-01T18:57:00Z) deleted at closeout. Worktree
  journey2-crisis-r96 released and removed; branch deleted.
