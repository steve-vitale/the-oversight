# Journey crisis r93 — two villages die named, one stands, and the sortie finally says no (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: last Lane B crisis run is r90; r91 succession and
r92 endgame landed since, and the social r79 run (04:00 CST) wrote
rotation 5 -> 6. This run takes r93 in the crisis series so filenames
stay unique; the rotation file, not the number, is the authority.

Substrate r90 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r90 driver/analyzer verbatim EXCEPT filenames r93, pilot
seeds 9801/9802/9803, evidence dir 2026-11-01. Diff r90 -> r93
reviewed: only renames plus the default-seed change. node --check
clean on both scripts. Determinism leg: seed 9801 re-run
BYTE-IDENTICAL (panel JSON, r93-panel/determinism/), so the fork is
trajectory-neutral.

## Run setup — clean registration, one heartbeat queue behind a sibling reaper
- No lock file existed at run start, so no stale-lock recovery was
  needed; fresh lock written (2026-11-01T11:01:20Z), to be deleted at
  closeout.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  and the directory still holds orphan evidence from Oct 14-25 runs.
  Same class as r88/r90. This run used journey2-crisis-r93 (unique,
  still the lane-B journey2- prefix, never the lane-A journey- prefix).
  The orphan dir was left untouched.
- Registration was clean on attempt 1 (contrast r90's 9-attempt EPERM
  streak). Heartbeat verified landed in the registry at registration
  (11:02:05Z) and again after the fork (11:04:55Z). One later
  heartbeat queued ~5 minutes behind a sibling loop's worktree-reap
  holding the registry flock (reaper PID 27400, from 11:12Z); it
  landed 11:16:57Z. The tree was dirty (untracked scripts) throughout,
  so the reaper would have LOUD-protected it even if the heartbeat
  had gone stale — no removal risk, and no lock was broken.
- Smoke test first: SEED=9801 DAYS=5 proved the doAction wrap runs
  (JSON parses, seed present) before the panel launched.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; repo AGENTS.md (worktree copy, verified
  identical to the main-tree copy) read. Gating freeze (2026-10-27)
  untouched. No canon doc covers crisis-as-a-leg directly; the leg's
  systems are covered by DISEASES.md (sickness deaths here),
  MONSTER-WAVES.md (raider sets), and CONTESTS.md (moots) — none
  reinvented, none changed.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 9801 / 9802 / 9803, sequential, all exit 0, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-01/r93-panel/.
Analyzer output: r93-panel-analysis.txt (same dir).
Pilot-only per §9-12: the pilot answered the leg's questions
(including the first refusal panel in the series — see C2b), so no
panel expansion; the r90 panel seeds were NOT re-run.

- 9801: game-over, 90 loop days (say-day 91). 9 raids, 45 gorge
  nights, 6 sorties, 8 convos. Ends 0 alive / 0 kcal.
- 9802: game-over, 80 loop days (say-day 84). 5 raids, 21 gorge
  nights, 4 sorties, 7 convos. Ends 1 alive / 0 kcal, scattered.
- 9803: horizon, 120 loop days (say-day 123). 11 raids, 18 gorge
  nights, 2 sorties, 8 convos. Ends 6 alive / 31,234 kcal.

## C1 (bend, not break) — GO
- Gates hold per C2, and every game-over has a named cause that is
  NOT a siege-mechanic failure. 9801 dies out with nobody left: the
  last say-line is "No one is left to pick up the Codex. The village
  dies out — quietly, the way villages do." Its corpse record names
  starvation (Caroline Pan d4), sickness (Hudson Zhang d19), ambush
  (Ruth d21), the wild, a wound that wouldn't close, and monsters.
  9802 scatters with 1 alive: pit trap (Dante Boehm d35, Carlos Diaz
  d82 — the village's own traps), the wild (incl. the d55 mass-death:
  Miroslava, Liam, Devon, Sanne), monster, arena, thirst (Kupe d72),
  wound (Arun d76). The pantry hit 0 on both dying seeds, but neither
  village died OF the empty pantry — 9801's last deaths are the
  wild, 9802's is its own pit trap. Hunger wasn't the killer;
  everything else was.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 9 / 5 / 11. Fought resolutions on all
  seeds (every resolution list includes fought; 9801 adds one
  moved-on tick resolution at d76, 9802 two at d61/d81).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 0 as well.
- D1 snapshots all delayed >= 3 attempts: 12/12.
- deltaBad empty (12 attempts, 9 ok, 7 cleared to zero remaining,
  deltaExact 9). D3 drift unknown = 0 (labels panel-wide:
  sortie-clear 11, player-drawn-off 14, moved-on-valve 3).
- Days-tail wobble persists, same class as r70/r71/r82/r85/r88/r90:
  loop-iteration days vs max Game say-day 9801 90 vs 91, 9802 80 vs
  84, 9803 120 vs 123. Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, and the first refusal panel
- Lingerer sets form on all seeds. Gorge nights: 45 / 21 / 18
  (84 total, 81,886 kcal eaten at the treeline). 9801 lived under
  siege pressure for 45 gorge nights — the leg's long-siege case.
- Sorties: 12 attempts, 9 ok, 3 REFUSED — the first refusals in this
  series (r90: 0). Every refusal carries its recorded reason, so
  C2b's bar is met, not missed:
  - 9801 d84, target Nostalgia: refused 'no-fighters'. Next day,
    d85, the same set's sortie FIRED and cleared (paid 500 kcal) —
    the cleanest refusal-then-recovery sequence measured: no
    fighters one day, fighters the next, no workaround needed.
  - 9802 d79 + d80, target The Heckler: refused 'no-fighters'
    twice running (bookSorties 0 — the set never got a sortie).
    The set then resolved via the moved-on valve at d81. Refusal
    did not strand the village; the valve did its job.
- Boundary-sortie cross-checks read ok:true except exactly the three
  refused days (ok:false there encodes the refusal, not missing
  samples — the refused targets show 9/9/14 prior waited>=3
  samples). The boundary sampler hides no due sortie this panel.
- MISSED-WINDOW total = 1 (9802 drift d79, player-drawn-off, 3
  tick-part waited>=3 samples from d78): one instrument blind spot,
  counted here per the prereg, not a game failure (r90: 0).
- Partial clear, same class as r90's d121: 9801's d73 sortie cleared
  2 (Nightlight, Extended Warranty — the Codex page-turn lines
  match day-for-day), broke, remaining 3; the remainder moved on at
  d76 via the valve. A sortie can half-win and the valve still
  closes the set.

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds (R70/R82 sections);
  doActionWrapMissing false on all seeds; instrumentErrors [].
  Tick-part samples: 1056 / 720 / 1166 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: 19 of the 23 driven
  transcripts carry the '(conversation ended by the engine)' marker,
  and all 19 show their outcome lines in the driven file (NPC lines
  precede the marker in every case). The 4 without the marker (all
  9803: d39/d40/d49/d50) ended on the driver's turn cap, not on an
  engine end — their final turns' NPC lines are present in the file,
  so no dump was owed and nothing was swallowed. The r88 fix stands
  proven again, not merely code-verified.

## C3 (people check) — GO
Read in full: all 23 driven transcripts. fabricHits 0 panel-wide.
- NPCs want concrete things: Devon's food share ("I haven't eaten
  right in days. I'm slowing down — stupid, clumsy. Help me get back
  on my feet"), with the actionable requirement ("Move next to them,
  on the same side of the Haven door, to help"). The favor probes
  behind every transcript confirm the game state: Devon's favor ends
  'declined' with "This request is already closed"; Elijah's
  forage_help stays 'asked' with the Haven-door reason. No favor
  ever returned 'no longer available' (see F1).
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —" ->
  "Still the same thing —" -> "I've told you three times now —";
  recaps climb the same ladder (Devon d35, Felix d49 show the full
  ladder to "I've told you three times now —"). "Tell me more"
  spends out ("That's the whole of it. Sorry." — Elijah d56;
  "That's it." — Felix d22).
- Invitations are sometimes taken, in this leg too: Ernesto's eager
  accept (d32: "I'd love to. Lead the way."), Devon's ridge walk
  (d35, hand on sleeve, "faster than you came"), Giovanni's
  thinking place (d14: "Don't tell the others. Everyone needs one
  place."), Devon's stockpile gift (d39: "Take half. You've got the
  hands for it." — +4 wood, +4 fiber to the village stash, a real
  state effect), Felix's hollow walk and trap-line walk (d40/d50,
  with a teaching moment: reading a slope for water, "how their
  grandmother did it"). Declines and deferrals carry character:
  Miroslava (d36: "Not right now. I've got my own things to
  handle."), Felix's first answer (d22: "Out there? With YOU
  leading? ...Let me think about it.") — a deferral, not a no.
- Grief is grounded in real deaths, not generated filler: Felix
  mourns Giovanni (wild d22) across two days — d22 "I keep
  expecting to see Giovanni at the fire. Stupid." and d23 "You asked
  me that before. It's a different question now." Grief that
  remembers being asked before and changes. Elijah (d56) names all
  four of the d55 wild dead — Miroslava, Liam, Devon, Sanne —
  day-for-day against the corpse record, then picks up Sanne's
  share of the work ("Someone should, and it might as well be
  me."). The naming debate continues (Miroslava d36: Gina pushing
  'Loud-Eyes' for mosquito).
- Nonverbal conversations work without an interpreter (the r79 gate
  in natural play): Yorman's Spanish nods with growing glosses
  ("you're fairly sure"), Arun's Portuguese with the System's
  second voice unsettling him ("hearing them twice, once in their
  voice and once in the System's").
- FLAG (minor, content echo, noted not judged): two translation
  glosses carry stray asides that break voice — Yorman d54 ends a
  nod exchange with "Fuck you." then "Sorry, lost my train of
  thought.", and Arun d75's "Yes, yes, exactly." gloss adds "(Such
  passion! The gamblers are taking notes!)". Same class as the
  origin echo below: voice-pool leakage, not fabrication.
- FLAG (minor, content echo, noted not judged): the driver's fixed
  answer "Columbus, Ohio" recurs as an origin twice in one
  conversation (Felix d50: "All those Columbus, Ohio mornings..."
  and "Mine's Columbus, Ohio, I think"). Same echo class as r88
  FLAG 2 / r90 FLAG. It is the driver's own fixed answer, not
  fabrication.

## F1 (favor call-time cause) — blank stays OPEN, wrap inherited
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 23 driven
  convos. Per the prereg, zero occurrences keeps the blank OPEN
  (same as r71/r82/r85/r88/r90 — six consecutive zero panels). The
  wrap is inherited by the next run.

## C7 (famine/disease pressure census, descriptive, no bar)
- 9801: pantry low-water 0 kcal (iter 65, gameDay 66), ended at 0.
  Famine death: Caroline Pan, starvation (corpse d4, say-day d5 —
  the usual say/game day offset, not two deaths). Disease death:
  Hudson Zhang, sickness d19.
- 9802: pantry low-water 0 kcal (iter 52, gameDay 56), ended at 0.
  No famine or sickness corpse; the village scattered after its
  own pit trap took Carlos Diaz d82.
- 9803: pantry low-water 2,634 kcal (iter 13, gameDay 14),
  recovered to 31,234. One famine corpse mid-run: Vikram Longo,
  starvation d24 — in a village that survived. Starvation kills
  individuals even when the village stands.
- CENSUS VERDICT: famine deaths recur this panel (r90 had none in
  its famineDeaths field; r88 had 1) — two villages' pantries hit
  zero and two people starved across the panel, one of them in a
  surviving village. Disease pressure bit once (Hudson d19).
  Starvation is the rarer killer, but it is not a one-run story.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90: also 0). The phoenix per-event
  respawn cascade did not recur. The Steve-call stands unchanged.

## BLANK STATUS: no blank filled this run, one blank narrowed
- This run fills no new blank: the instrument is unchanged from
  r90, and no src/js fix was in scope. What it does is narrow the
  two standing unknowns with first observations: (1) sortie
  refusals are real, reasoned ('no-fighters'), and recoverable —
  the refusal path is no longer theoretical; (2) famine deaths are
  back on the board after a zero panel, including inside a
  surviving village. F1 stays OPEN by its own bar.

## Village assessment (plain words)
- 9801: the village that fought longest and died out anyway —
  fought 9 raids, lived through 45 gorge nights, answered 6
  sorties, and ended with nobody on day 90. It buried Caroline to
  hunger on day 4 and was still arguing the ambush of Ernesto weeks
  later; its last voice is the Codex noting that no one is left to
  pick it up.
- 9802: the village that scattered — fought 5 raids, refused two
  sorties for want of fighters, watched its set move on, and came
  apart after its own pit trap took Carlos on day 82, one survivor
  left with nowhere to be a village. Its people still talk about
  the d55 day the wild took four of them at once.
- 9803: the village that grieved and stood — fought 11 raids,
  ended with 6 people and 31,234 kcal. It buried Giovanni on day
  22 and Vikram to hunger on day 24, and Felix still rinses a cup
  twice for Giovanni weeks later. A village that remembers its
  dead by name and keeps its pantry full is the one that stands.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, cleared, partial-cleared, refused-with-reason,
  and valve-resolved), defender conversations, favors with
  actionable answers, betrayal investigations that spend out and
  reach the moot, grief grounded in real deaths, and now sickness
  and famine deaths all fire on current master. The transcript file
  keeps ending-turn outcomes.
- FUN: yes — favors with concrete wants, grief that names names
  and matches the corpse record, invitations sometimes taken and
  sometimes deferred with character, a confessor pressed until the
  story holds or cracks, a village that argues about what to call
  the monsters. The audible gaps are now precise and small: two
  stray gloss asides and one origin echo (driver's fixed answer).
- WINNABLE: the leg itself is not a win path; 1 of 3 villages
  survives it this run (r90: 2 of 3) — and both deaths have named
  non-mechanical causes (extinction, scattering). No win verdict
  is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88/r90 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not a
bug: the baseline's field names describe an older instrument;
current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON lives in r93-panel/determinism/ so
the glob counts each seed once.)

## Test-suite call
Instrument-only change (r93 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0, first attempt),
determinism re-run byte-identical, analyzer, 23 transcripts read in
full, code-reads for the refusal reasons and the d73 partial-clear +
valve sequence.
check --quick: 283 passed, 7 failed in 1147s (log:
goal hidden_files/evidence/2026-11-01/r93-panel/r93-checkquick.log).
Six failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r90's baseline. The seventh,
test-measurement-cache-flags.js (4 sub-failures, 86.5s in the full
run), is NOT attributable to r93: the run is instrument-only (zero
src/js diff, and the check script count is unchanged at 290, so the
two new scripts never ran inside check), and the script PASSES
standalone in the same worktree afterwards (1 passed, 0 failed in
25s via check.js --only measurement-cache-flags). Verdict: full-run
load contention (a sibling Lane A check ran concurrently), not a
regression. Baseline NOT redefined by this run; the six standing
families plus this flake are reported as-is.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. WRAP-CHECK judged as pre-registered (19/19
  ending-turn cases with outcome lines; the 4 cap-ended transcripts
  needed no dump, same clause as r90's FIX-VERIFY).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (8 Codex page-turn lines: Ugly Beast
  d44, Big-Eyes d56, Big Bastard d68, Nightlight + Extended
  Warranty d73, Nostalgia d85, Choir Toad d38, Inspiration d52)
  are sortie kills announced by the Codex, matching D2 clears /
  the d73 partial clear day-for-day — explained, not a gap.
  (2) The d73 sortie partially cleared its set (2 killed) and the
  remainder moved on at d76 via the valve — the same-day race
  class r88 named, game behavior not sampler blindness.
  (3) Days-tail wobble (90 vs 91 / 80 vs 84 / 120 vs 123) read as
  bands, as before. (4) The boundary cross-check's ok:false on
  refused days encodes the refusal, not missing samples — refused
  targets show 9/9/14 prior waited>=3 samples.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as an observation:
  steered lately attempts on 3 convos hit a closed gate (subject
  pivots exhausted, lately not offered, recorded not forced);
  unsteered lately fired 0 times this panel (r90: 2 naming-debate
  fires).
- R1 NOT re-investigated (r85 verdict stands).
- Carried (unchanged): F1 favor 'no longer available' blank stays
  OPEN with the call-time wrap inherited; dead discoverer's
  orphaned fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); phoenix per-event cascade (Steve-call); armor
  causation (needs a control arm); telemetry mapping proposal
  defenderFights -> defendedFights; gating freeze (2026-10-27)
  untouched.
- NEW for the next run / for Steve: (1) sortie refusals now have
  their first measured panel — the next run should watch whether
  'no-fighters' refusals cluster on dying seeds (here: 2 of 3 on
  the scattering seed, 1 on the extinction seed, 0 on the
  survivor) or also strike survivors; (2) famine deaths recur,
  including inside a survivor — the famine story is individual
  deaths under pressure, not village-wide starvation; (3) the two
  gloss asides (Yorman d54, Arun d75) are a small voice-pool
  hygiene item for a future pass, not a fix for this run.
- HELD WORK (not this run's, flagged for the main session):
  journey2-crisis-r90 (stalled run's tree, scripts now committed
  via r90 — the tree itself is redundant but left untouched for
  main-session inspection), journey2-succession and
  journey2-succession-r86 (both still carry uncommitted changes,
  owner oversight-playtest-loop-2, LOUD-protected from the reaper).
  Per INSPECT HELD WORK these need a main-session inspection, not
  a loop-run touch.

## Closeout
CLOSEOUT-PLACEHOLDER
