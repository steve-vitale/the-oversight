# Journey crisis r127 — WRAP passes 37/37, the refusal pile-up holds at 62%, W1 still unanswered (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: r127 follows r126 (merged 62a67de7d); filenames stay
unique; the rotation file, not the number, is the authority.

## Run setup — lock, dirty-tree wait, slow registration, clean panel

- No lock at run start. Fresh lock written (run_id 2026-11-04T22:56:06Z).
- Pre-flight dirt, handled per the body's wait clause, not by touching the
  main tree: the main tree was clean at first check, then showed a single
  dirty file (evidence/2026-11-04/sim-approachguard-round-2235.md, staged
  deletion + untracked copy, worktree bytes byte-identical to HEAD) — the
  documented safe-commit index-clobber class, left by a sibling's landing.
  This run ran NO git write in the main tree. After a 10+ minute wait and
  re-check the sibling had repaired its index and the tree was clean again
  (verified: git status empty, then registration proceeded). Disk 31%.
- Registration: the plain body slug journey2-crisis registered cleanly
  (no stale branch, no existing path — unlike r122/r126, no slug deviation
  was needed this run), but checkout was slow under sibling load (~17 min,
  git reset --hard running the whole time; not killed, not retried).
  Heartbeat landed promptly after registration and was kept fresh across
  the run, with two notes: the heartbeat loop's ticks are slow under load
  (a tick started 23:45Z had not finished when read at 23:46Z — the
  read-back, not the loop's silence, is the proof), and two manual
  heartbeats at ~23:50Z hit the container EPERM flap on the registry
  write and were retried rather than trusted. No heartbeat ever went
  stale past the 15-minute line during this run's work.
- Canon: docs/CANON.md + docs/DIRECTIVES.md re-read; the leg's systems are
  covered by DISEASES.md, MONSTER-WAVES.md, and CONTESTS.md — none
  reinvented, none changed. No canon doc covers crisis-as-a-leg directly
  (same standing note as r122/r126).
- Smoke test first, into a scratch subdir (not the panel dir):
  SEED=12701 DAYS=5 proved the doAction wrap runs (402 say lines,
  31 tick-part samples, favorNoLongerCalls [], instrumentErrors [])
  before the panel launched. 0 convos in 5 days is expected — the
  convo triggers fire after raids, not in the opening days.
- Instrument: r126 driver/analyzer verbatim EXCEPT filenames r127 and
  the WRAP marker change below (diff reviewed: only r126 -> r127
  substitutions, plus the marker block). node --check clean on both.
- Seed runs use the r115/r116/r117/r122 retry harness, adapted
  (worktree journey2-crisis, panel dir r127-panel). All five seeds
  ACCEPTED on attempt 1 (parses, no `error`, carries a census).

## Pre-registration (binding, written before any scored seed)

Prereg file: goal hidden_files/evidence/2026-11-04/journey-crisis-r127-prereg.md.
The leg's questions, in the prereg's words: (1) W1 — does a re-muster
after a refusal ever FULLY clear? (r126 count: 16 refusals, 1 same-set
re-muster that broke, 0 full clears after a refusal); (2) WRAP-CHECK
revised — with the driver's silent break paths now carrying explicit
markers, does every driven transcript carry a marked ending?; (3) refusal
pile-up, descriptive — does r126's refusal rate persist on fresh seeds?
Bars: C1 every game-over has a named non-siege-mechanic cause; C2 raids
on all seeds, fought resolutions present, D1 snapshots all delayed >= 3,
deltaBad empty, D3 drift unknown = 0 (MISSED-WINDOW descriptive only);
C2b every boundary-firable case fires or is refused with a recorded
reason, W1 reported as a count with no GO/NO-GO bar; C3 all transcripts
read in full, fabricHits = 0, meaning bar met; WRAP-CHECK (revised
wording) GO iff analyzer R127 WRAP reports unmarked = 0.

## Instrument change: WRAP markers (display-only, trajectory-neutral)

r126's instrument item, delivered here. driveConvo's four silent break
paths now push an explicit marker and set a flag, and the loop's end
pushes a cap marker if no marker fired:
- leave-only break -> '(driver leave break: only leave offered)'
- convoChoices throw -> '(convoChoices threw: ...)'
- convoGet throw -> '(convoGet threw: ...)'
- 12-turn loop completion -> '(driver cap break: 12 turns reached)'
Previously-marked paths (engine-ended, refused/ended, no-choices,
turn-threw, startConvo-threw) set the same flag. No Game call, no RNG.
Analyzer gains an R127 WRAP section: it reads each convosDriven
transcript file in the panel dir and counts marked vs unmarked against
the prereg marker set.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds 12701 / 12702 / 12703 / 12704 / 12705, sequential, all exit 0 first attempt, all parse-verified)

EVID: goal hidden_files/evidence/2026-11-04/r127-panel/
(analyzer output saved there as analyzer-output.txt).

- 12701: GAME OVER (scattering), 50 loop days. 4 raids, 17 gorge events,
  2 sorties (both refused), 8 convos. Ends 1 alive / 0 kcal. 14 corpses.
- 12702: GAME OVER (scattering), 98 loop days. 5 raids, 13 gorge events,
  4 sorties (1 ok, 3 refused), 8 convos. Ends 1 alive / 0 kcal. 15 corpses.
- 12703: GAME OVER (extinction), 73 loop days. 5 raids, 7 gorge events,
  1 sortie (ok, FULL CLEAR), 7 convos. Ends 0 alive / 0 kcal. 13 corpses.
- 12704: GAME OVER (scattering), 48 loop days. 4 raids, 6 gorge events,
  0 sorties, 6 convos. Ends 1 alive / 0 kcal. 16 corpses.
- 12705: HORIZON, 120 loop days. 9 raids, 24 gorge events, 1 sortie
  (ok, broke with 3 remaining), 8 convos. Ends 3 alive / 1,000 kcal.
  10 corpses.

HEADLINE, stated plainly: 1 of 5 villages reaches the horizon, and the
refusal pile-up is not a one-panel fluke — 5 refusals in 8 attempts
(62%), matching r126's 16 in 26 (62%) almost exactly. Combined across
both panels: 21 refusals, 0 full clears after a refusal. The breaking
side is still the majority, and it still breaks on the famine clock and
attrition, not on siege mechanics. The gorge pile-up is smaller this
panel (67 nights, 55,841 kcal vs r126's 244 / 192,428) because the
villages died earlier (389 loop days vs 470) and the surviving seed
gorged less — reported descriptively, not as a verdict; seed variance
on 5 seeds cannot carry a trend claim.

## C1 (bend, not break) — GO

- Gates hold per C2, and every game-over has a named cause that is NOT
  a siege-mechanic failure:
  - 12701: scattering — "Haven couldn't hold. On the third hungry day,
    people started walking" (day ~49, 1 alive, pantry 0).
  - 12702: scattering — same third-hungry-day line (day ~98, 1 alive).
  - 12703: extinction — "No one is left to pick up the Codex. The
    village dies out" (day ~75, 0 alive, pantry 0). Attrition across
    monsters, the wild, wounds, and an ambush; its one sortie fully
    cleared on d55 and the village still died — clearing the treeline
    does not save a village that is bleeding out elsewhere.
  - 12704: scattering — same third-hungry-day line (day ~53, 1 alive).
  - 12705: no game-over — horizon with 3 alive.
- Census-flag quirk, noted not failed (same shape as r117 / r122 /
  r126): 12703's census says scattered False / extinct False although
  the closing line is extinction. The closing line is the authority;
  no metric reads that flag.

## C2 (episodes fire + gates hold) — GO

- Raids fire on all seeds: 4 / 5 / 5 / 4 / 9. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds (corpse-excluded;
  R59 legacy count also reported: 6, all corpse-counting artifacts,
  same class as r122/r126).
- D1 snapshots all delayed >= 3 attempts: 8/8.
- deltaBad empty (8 attempts, 3 ok, 5 refused, deltaExact 3). D3 drift
  unknown = 0 (labels panel-wide: player-drawn-off 18, moved-on-valve 5,
  sortie-clear 2).
- MISSED-WINDOW total = 5 (r126: 12, r122: 12, r117: 11, r116: 0). Per the
  prereg this does NOT fail C2: it quantifies the boundary sampler's
  blind spot, and it tracks the smaller, shorter sets.
- Days-tail wobble persists, same class as every panel since r70: loop
  days vs max Game say-day (12701 50 vs 49; 12702 98 vs 98; 12703 73 vs
  75; 12704 48 vs 53; 12705 120 vs 123). Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, and W1 still open

- Lingerer sets form on all seeds. Gorge events: 17 / 13 / 7 / 6 / 24
  (67 total, 55,841 kcal eaten at the treeline).
- Sorties: 8 attempts, 3 ok, 5 REFUSED — all 5 with the recorded reason
  'no-fighters' ("Not enough fighters to send — a sortie needs at
  least two besides you, and the bench is bare"). Every
  boundary-firable case fired or was refused with a recorded reason;
  no boundary-firable case went unfired.
- Clear rate on ok sorties: 1/3 full clears. The clear is 12703 d55
  (1 target, The Redactor, remaining 0, paid 6,000, deltaExact) — a
  FIRST-attempt clear: 12703 has no refusal anywhere on the seed, so
  it cannot answer W1.
- The other ok sorties broke: 12702 d52 (remaining 1, before any
  refusal on that seed) and 12705 d113 (remaining 3 of 4 targets).
- W1 (does a re-muster ever FULLY clear?) stays UNANSWERED, now with
  a two-panel count: r126 16 refusals + r127 5 refusals = 21 refusals,
  0 ok sorties after a refusal on any seed, 0 same-set re-muster oks,
  0 full clears after a refusal. r127 adds no same-set re-muster trial
  at all: the refused sets (12701 Don't-Look d49, 12702 The Terms of
  Service d93/d94) never got a later ok call before their villages
  scattered. The next run inherits the count (21 refusals, 0 clears),
  not a shrug.
- Cross-check classes: every ok/refused target reads 'waited-ge3'
  EXCEPT 12703 d55's target and 12705 d113's Big Loud, which read
  'sampled-lt3' (29 prior tick-part samples each, none waited>=3) —
  boundary-joined sets, same class as r126's d104 clear. No target
  reads 'none' this panel.
- G-ID watch: gorgeAfterIdMatched = 0, gorgeAfterReturn = 0, against
  gorgeAfterNameMatched = 0 (no name matches at all this panel — the
  cleared sets simply did not gorge again). Third panel running at
  zero id-matched; the watch stays open, not closed, on 3 panels.
- Same-night same-name groups (multiGroups) are reported as counts
  only and NOT cited as evidence either way, per the adopted rule:
  12701 Don't-Look pairs d48–49 (both ambiguous attribution, keys
  null — two events, attribution cannot say one monster or two).
- deadInMusterLines = 0. Self-convo targets: none observed across the
  37 transcripts (every NPC distinct, player voice consistent).

## WRAP-CHECK (revised wording) — GO

- Analyzer R127 WRAP section: 37 transcripts, 37 marked, 0 unmarked.
  Marker counts: '(conversation ended by the engine)' 32,
  '(conversation refused/ended)' 3, '(driver cap break:' 2. No
  leave-break, choices-throw, or convoGet-throw marker fired this
  panel — those paths exist and are marked, but this panel did not
  exercise them; the cap marker is the one new marker proven live.
- The 2 cap-break transcripts (12705 d40 Jasper Hill, d51 Pavel
  Dubinin) are NOT cut mid-thought: both end on an NPC closing line
  ("Alright — I should get back to it." / "Okay. We'll pick this up
  later.") before the cap marker. The cap is a driver budget (12
  turns), not a game cut — but it does mean the driver stops long
  conversations at 12 turns whether or not the NPC has closed, so a
  future cap-break transcript could in principle cut a live thread.
  This panel's two did not. The marker makes that check possible;
  before r127 it was invisible.
- The 3 refused/ended transcripts (12702 d21, 12703 d21, 12705 d19)
  are all defender-after-resolution opens where the NPC declines at
  the door — recorded, not fabricated. Whether defenders refusing
  right after a fight is character (exhaustion) or a gate is not
  answered by this panel; it is a descriptive note, not a finding.

## C3 (people check) — GO

Read in full: all 37 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).

- NPCs want concrete things: festering wounds ("If it festers I'm no
  good to anyone — can't haul, can't hunt, can't watch"), a cut that
  "can't clean it properly one-handed," a far treeline nobody has
  worked in days ("We'll fill packs before dark"), a meal ("It's been
  days since a real meal. I can't pull my weight like this").
- Grief is grounded in real deaths of each seed: Irving d46 headcounts
  Mara, Mariano, Nino, Hayden; Somchai takes Nana's burnt piece ("Nana
  always took the burnt piece. Said someone had to. I take it now.");
  Sofia takes Zoe's; Nadia keeps setting out extra portions for Hattie
  and Jasper ("Stupid."); Ruth dreams Quinn is still here ("Woke up
  angry at the dream. Stupid."); Sofia hums one note for Arnold.
  The "We bury, we grieve, we keep going. There's no step four." line
  family recurs across seeds — shared grief script, still anchored to
  that seed's actual dead.
- Invitations are sometimes taken, with character: TAKEN seven times —
  Irving d46 ("Yes. Absolutely. I've been hoping you'd ask."),
  Somchai d90 ("Alright. But I'm not carrying your stuff."), Maya d91
  (deflects, then takes on the second ask: "...Fine. This had better
  be worth it."), Ethan d53 ("...Fine. This had better be worth it."),
  Vitaly d43 ("Okay. Yeah. I trust you."), Jasper d29 ("Okay. Yeah. I
  trust you."), Nadia d50 ("Someone should watch your back. Might as
  well be me."). DEFLECTED with character — Emma d8 ("I don't know
  you well enough for that."), Sonia d31 (firm, twice: "I work alone.
  Nothing personal. ...It's a little personal."), Ruth d73 (firm, four
  asks), Sofia d42 (hesitation about the player leading: "Out there?
  With YOU leading? ...Let me think about it."), Felipe d9 (party
  invite blocked by the honest System trust gate, 18/20). Panel-wide
  taken 7, deflected several: the sometimes-taken shape holds, stronger
  than r126's 5.
- Repeated asks escalate, then close — never loop: favor requirements
  climb plain -> "As I said —" -> "Like I said —" -> "Still the same
  thing —" -> "I've told you three times now —" on Petra, Stan,
  Hayden, Sonia, Onni, Ethan, Sofia, Jasper, Nadia alike; the details
  variant closes the same way on Brayden ("I just said —" -> "I just
  told you —" -> "We've covered this one."). Cap-line repeat, noted
  not failed (same class as r126's 12602 d22): a sixth ask repeats
  "I've told you three times now" on 12701 d25, 12705 d39, 12705 d57 —
  a cap, not a loop; the driver asks a sixth time, the game caps.
- Confrontation honesty: Nadia d50 refuses to re-confess ("We went
  over this... I already told you the truth about that." / "I'm not
  confessing it twice for dramatic effect.") after her Toronto
  reveal — the anti-loop behavior working. Lucas d13 carries two real
  reveals (protecting someone else; "I wasn't a surgeon. I was a
  Midwife.").
- Generosity without prompting: Jasper d28 presses a tool into the
  player's hand ("Here. I made an extra. ... Useful. Keep it.").
- Teaching fires: Felipe d9 teaches Wood Sorrel; Vitaly d43 teaches
  Shea. Both land as short, specific lessons.
- Wrinkles, noted not fixed:
  - Naming-stance wobble, THIRD sighting of the class (r122 Brendan,
    r126 Dwayne, r127 Felipe d16): Felipe pushes 'Don't-Look' for the
    tick, then says "I'm staying out of the naming fight. For now."
    in the same conversation — generic patter vs event stance. Three
    panels running, still a wrinkle a player could notice, not a
    defect class; if a fourth panel shows it again, it graduates to
    a fix item.
  - No naming-debate self-naming recurrence (W4 stays closed); no
    dead ambient speaker, no succession-picks-dead case (Q2/Q3 stay
    closed).

## F1-inherited (favor call-time cause) — zero occurrences, stays CLOSED

- The call-time wrap installed cleanly; entries [] on all seeds. No
  second dead-id path, no second stale-flag path. The r116 ledger fix
  + driver guard hold on fresh seeds.

## Q2/Q3 — no reopening

- No succession-picks-a-dead-member case, no dead ambient speaker this
  panel. The analyzer's death mismatches resolve cleanly: Sonia d52
  is muster-explained (sortie death lines, same class as the closed
  Dina case), and the one unattributed death line is a monster death
  ("Big Loud is dead. You didn't ask. It knew." — a Codex page-turn
  on a monster kind), not a villager death. Q2/Q3 stay closed per r114.

## C7 (famine/disease pressure census, descriptive, no bar)

- 12701: pantry low-water 0 kcal (gameDay 37), ended at 0. 14 corpses:
  monster 9, wild 2, wound 1, starvation 1 (Mara d43), the wild 1
  counted above — see JSON for the exact split; 0 sickness in the
  deaths list, 1 starvation corpse.
- 12702: pantry low-water 0 kcal (gameDay 70), ended at 0. 15 corpses:
  monster 8, wild 4, contest 1, arena 1, wound 1, sickness 1 (Yaqi
  d96). The scattering walked away hungry rather than starving.
- 12703: pantry low-water 0 kcal (gameDay 72), ended at 0. 13 corpses:
  monster 5, wild 3, wound 3, ambush 1, contest 1. 0 famine, 0 sickness
  in the deaths list.
- 12704: pantry low-water 0 kcal (gameDay 53), ended at 0. 16 corpses:
  monster 12, wild 1, dehydration 1, The Reverend 1, plus 1 more —
  see JSON. 0 famine, 0 sickness.
- 12705: pantry low-water 0 kcal (gameDay 80), ended at 1,000. 10
  corpses: arena 3, monster 4, wild 1, emergency hunt 1, plus 1 more.
  0 famine, 0 sickness — the village hit empty and recovered.
- Panel totals: 68 corpses, 1 starvation corpse, 1 sickness corpse.
  The famine clock, not starvation deaths, ends the hungry villages
  here — same shape as r126, with the two exceptions (Mara, Yaqi)
  proving the death causes still fire when they should.

## C4 (burn observation, Steve-call, no bar) — no observation

- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107/r111/r113/
  r114/r116/r117/r122/r126: also 0). The phoenix per-event respawn
  cascade did not recur. The Steve-call stands unchanged.

## BLANK STATUS: W1 still open with a two-panel count, WRAP delivered, one recurring wrinkle

- W1 narrowed again (see C2b): 21 refusals across r126+r127, 0 ok
  sorties after a refusal, 0 full clears after a refusal. r127's 1
  full clear is a first-attempt clear and cannot answer W1. The
  refusal rate itself is now the sharper finding: 62% on both panels
  (16/26, 5/8) — the bench goes bare at the same rate on fresh seeds,
  so the next run should ask whether the refusal gate or the fighter
  supply is the lever, not whether the pile-up was noise.
- WRAP MARKERS DELIVERED (instrument, not game code): the four silent
  break paths now carry explicit markers, the analyzer counts marked
  vs unmarked, and this panel proves it: 37/37 marked, with the cap
  marker firing twice on transcripts that end on natural closes.
- Naming-stance wobble is now a three-panel recurring wrinkle (see C3).
  Not a fix item yet; a fourth sighting graduates it.
- G-ID watch stays at zero (id-matched 0, returns 0, third panel
  running at zero on the id side; this panel had zero name matches
  too). W4 stays closed. F1 stays closed. Q2/Q3 stay closed.

## Village assessment (plain words)

- 12701 — the village that asked for help and had nobody left to send.
  One person alive at the scattering after 50 days, pantry empty, two
  sorties refused on the same day for want of fighters while
  Don't-Look gorged at the treeline. Its people still taught, grieved
  by headcount, and took invitations — Irving hoping to be asked —
  but the bench went bare and the village walked.
- 12702 — the village that fought, refused, and walked anyway. Nine
  raids' worth of pressure across 98 days, one sortie that broke with
  a single monster left, three refusals for The Terms of Service, and
  a scattering on the third hungry day. Sonia's death is the panel's
  cleanest muster story: she faced The Redactor at the treeline and
  did not come back, and the Codex says so twice.
- 12703 — the village that cleared the treeline and died anyway. Its
  one sortie swept The Redactor outright on d55 — the panel's only
  full clear — and the village still went extinct twenty days later,
  bled out by monsters, the wild, and wounds that would not close.
  Clearing the siege is not the same as surviving the crisis.
- 12704 — the village that never got a sortie off. No lingerer set
  survived long enough to answer across 48 days; sixteen corpses,
  twelve of them to monsters, and a scattering on the third hungry
  day. Its people still revealed themselves — Lucas the Midwife,
  Vitaly picking up Chantal's share — but revelation is not rescue.
- 12705 — the village that held. Three people alive at the horizon
  with food in the stores again (1,000 after touching empty on day
  80), after 24 gorge nights and nine raids. Its one sortie broke with
  three monsters left, its conversations ran long enough to hit the
  driver's 12-turn cap twice, and its people gave tools, taught Shea,
  and set out extra portions for the dead. This is the crisis leg
  working at its best: besieged, grieving, still standing.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes. Raids, gorges, sorties, refusals, re-musters
  attempted, a full clear, mourning, teaching, confrontation
  reveals, and all three scattering-clock outcomes (third-hungry-day
  scattering x3, extinction x1, horizon x1) fire in ordinary competent
  play on fresh seeds with no staging — the panel needed no
  hand-holding beyond the driver's sortie answers.
- FUN: yes, with the usual crisis-leg weight. The villages read like
  people under pressure (a bench that goes bare and says so plainly,
  a village that clears its siege and still dies, invitations taken
  with trust and deflected with character, a woman who will not
  confess twice for dramatic effect), and the refusal rate holding
  at 62% across two panels makes the late game feel besieged in a
  specific new way: not "can we go out?" but "is there anyone left
  to send — and if they go, will they come back?"
- WINNABLE: the leg's horizon is reachable (1/5 here, 2/5 on r126,
  1/3 on r113/r114/r116/r117/r122) but the breaking side is still the
  majority, and it breaks on the famine clock and attrition, not on
  siege mechanics. A real player can reach the horizon; most villages
  will not. That is the crisis leg working as designed, not a verdict
  against it. The new question the next run inherits is the refusal
  gate itself: at a stable 62% refusal rate, is the bench bare
  because fighters die, or because the gate asks for two besides the
  player when one would do? That question is named, not answered,
  here — changing the gate is a Steve-call, not a loop fix.

## Metric review (§14)

- No metric was re-scored mid-run. C1/C2/C2b/C3/WRAP verdicts use the
  preregistered bars exactly; the missed-window 5 is reported under
  the prereg's own instrument-gap reading, not folded into a game
  verdict; the G-ID watch (id-matched 0) is reported as a watch, not
  a bar; the multiGroups counts are reported as counts only, not as
  evidence either way, per the adopted rule.
- WRAP wording changed BETWEEN runs (r126's metric review proposed
  exactly this revision: driver markers + wording counting them), so
  this run's WRAP GO is judged on the revised wording and is not a
  re-score of r126's NO-GO. r126's NO-GO stands on its own wording.
- The prereg's determinism wording is corrected by this run's proof:
  the same-driver re-run is byte-identical (JSON + all 8 transcripts),
  which is stronger than the prereg's "identical except marker lines"
  framing (that framing assumed a cross-driver comparison; the
  within-driver proof is what was actually run). The next run's
  prereg should say so plainly.
- Carried forward, unchanged: telemetry metric list for this leg is
  defendedFights,playerFights,latelyDefenseCount; defendedCount stays
  out until a correspondence is proven.

## Determinism

- Seed 12701 re-run BYTE-IDENTICAL (panel JSON and all 8 of its
  transcripts) to its own first run, proving the r127 driver markers
  (display-only) and the analyzer classification inject no
  nondeterminism. Identity is judged against this run's own first
  run, not against any r126 file.

## Regression

- This run changes NO game code: the repo commit adds only the r127
  driver + analyzer (new files) and this run note.
- Targeted proof suites, all green on this base (the suites that guard
  the fixes this panel relies on):
  - test-naming-debate-self-20261103.js: ALL PASS (r116 W4 fix holds,
    incl. third-person control).
  - test-shelter-succession-20261103.js: ALL PASS (r116 shelter-flag
    fix holds, incl. bystander control).
  - test-crisis-naming-dead-20261021.js: 7 passed, 0 failed.
  - test-crisis-muster-game-20261017.js: 35 pass, 0 fail.
- Full check.js --quick NOT run this run, stated plainly with the
  reason (same scope call as r117/r122/r126, preregistered): the
  commit touches no game code and no existing file, so there is no
  regression surface for the full gate to cover beyond the targeted
  suites above (which are the suites for the two fixes the panel
  depends on). The next run that touches src/js should run the full
  gate. Worktree git status at commit time shows exactly the 3 added
  files, nothing modified, no sibling files swept in.

## Telemetry deviation check (§14)

- Command: telemetry-check.js --baseline
  telemetry-baselines/crisis.json --current
  'journey-crisis-r127-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount (run from the
  r127-panel dir; an earlier attempt with a worktree cwd failed on
  glob expansion and was retried correctly — the retry, not the
  failure, is the reported result).
- Result: QUIET (exit 0, 5 files, 3 metrics, no large deviations). No
  LOUD lines to investigate. Baseline NOT rolled (a single 5-seed
  panel's variance must not be baked in).
