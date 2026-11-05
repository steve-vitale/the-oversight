# Journey crisis r128 — BENCH names the lever: the gate, not the drain (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: r128 follows r127; filenames stay unique; the rotation
file, not the number, is the authority.

## Run setup — lock, clean tree, fast registration, fresh heartbeats

- No lock at run start. Fresh lock written (run_id 2026-11-05T08:55:30Z).
- Pre-flight clean on first check: main tree empty, disk 29%.
  `git pull` already up to date (52471f9ca). Reaper ran, 10/16 trees active,
  no cap pressure.
- Registration: the plain body slug journey2-crisis registered cleanly
  (no stale branch, no existing path), checkout fast this run (~80s, vs
  r127's ~17 min under sibling load). Heartbeat landed at registration and
  was refreshed after every seed (09:00:36Z, then per-seed); never stale
  past the 15-minute line.
- Canon: docs/CANON.md + docs/DIRECTIVES.md re-read; the leg's systems are
  covered by DISEASES.md, MONSTER-WAVES.md, and CONTESTS.md — none
  reinvented, none changed. No canon doc covers crisis-as-a-leg directly
  (same standing note as r122/r126/r127).
- Smoke test first, into a scratch subdir (not the panel dir):
  SEED=12801 DAYS=5 proved the doAction wrap runs (588 say lines,
  43 tick-part samples, favorNoLongerCalls [], instrumentErrors [])
  before the panel launched. 0 convos in 5 days is expected — the
  convo triggers fire after raids, not in the opening days.
- Instrument: r127 driver/analyzer verbatim EXCEPT filenames r128, seeds
  12801-12805, and the BENCH snapshot below (diff reviewed: only r127 ->
  r128 substitutions, plus the bench block). node --check clean on both.
- Seed runs use the r115/r116/r117/r122 retry harness pattern (3 attempts,
  parse + census acceptance), run inline this time. All five seeds
  ACCEPTED on attempt 1 (parses, no `error`, carries a census).

## Pre-registration (binding, written before any scored seed)

Prereg file: goal hidden_files/evidence/2026-11-05/journey-crisis-r128-prereg.md.
The leg's questions, in the prereg's words: (1) W1 — does a re-muster
after a refusal ever FULLY clear? (two-panel count: 21 refusals, 0 full
clears after a refusal); (2) BENCH — the sharpened question r127 named:
at a stable 62% refusal rate, is the bench bare because fighters died,
or because the gate asks for two besides the player when one would do?
(3) WRAP-CHECK, unchanged wording; (4) refusal pile-up, descriptive.
Bars: C1 every game-over has a named non-siege-mechanic cause; C2 raids
on all seeds, fought resolutions present, D1 snapshots all delayed >= 3,
deltaBad empty, D3 drift unknown = 0 (MISSED-WINDOW descriptive only);
C2b every boundary-firable case fires or is refused with a recorded
reason, W1 reported as a count with no GO/NO-GO bar; BENCH descriptive
with the prereg's own rule — name a lever shape only if it covers ≥80%
of refusals, otherwise "mixed, no single lever"; C3 all transcripts
read in full, fabricHits = 0, meaning bar met, with a fourth naming-stance
wobble sighting graduating it to a fix item; WRAP-CHECK GO iff analyzer
R128 WRAP reports unmarked = 0.

## Instrument change: BENCH snapshot (driver-only, pure reads)

Every sortie attempt now records a bench snapshot taken BEFORE the call:
musterAvailable (what Game._musterAway(3,'defense') returns, 0..3),
livingBesidesPlayer, and the exclusion breakdown for living roster
members the muster skips (away = loaned/away-party/wounded-until,
nodeAway, withYou, engaged, nonMember) — reusing the game's own
predicates, so the snapshot classifies exactly as the game sees it.
No Game call, no RNG, no state mutation. The analyzer gains an R128
BENCH section plus same-set W1 counts (matched on id|episode in
episodeInfo, so a re-muster of the same lingerer set is distinguished
from an ok sortie on a different set). The gate itself is NOT changed
here — changing it is a Steve-call; the bench data only names the lever.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds 12801 / 12802 / 12803 / 12804 / 12805, sequential, all exit 0 first attempt, all parse-verified)

EVID: goal hidden_files/evidence/2026-11-05/r128-panel/
(analyzer output saved there as analyzer-output.txt).

- 12801: GAME OVER (scattering, fifth hungry day), 105 loop days. 8 raids,
  22 gorge events, 2 sorties (both ok, 1 broke), 8 convos. Ends 3 alive /
  0 kcal. 14 corpses.
- 12802: GAME OVER (extinction), 85 loop days. 6 raids, 10 gorge events,
  0 sorties, 8 convos. Ends 0 alive / 0 kcal. 16 corpses.
- 12803: GAME OVER (extinction), 94 loop days. 7 raids, 43 gorge events,
  9 sorties (2 ok, 7 refused), 8 convos. Ends 0 alive / 650 kcal.
  17 corpses.
- 12804: HORIZON, 120 loop days. 13 raids, 4 gorge events, 1 sortie
  (ok, FULL CLEAR d80), 8 convos. Ends 8 alive / 67,985 kcal. 10 corpses.
- 12805: GAME OVER (scattering, fifth hungry day), 97 loop days. 7 raids,
  51 gorge events, 6 sorties (4 ok, 2 refused), 7 convos. Ends 1 alive /
  0 kcal. 20 corpses.

HEADLINE, stated plainly: the bench question is answered, and the answer
is the gate, not the drain. Of 9 refusals, 6 had exactly one living
fighter besides the player — musterAvailable 1, livingBesidesPlayer 1 —
and the gate demands two. The other 3 had nobody (musterAvailable 0,
living 0, or the one living person out on node-travel). Availability
exclusions across all 9 refusals total ONE (a single nodeAway); away,
withYou, engaged, and nonMember are all zero. People are not being kept
from the bench by errands, wounds, or travel — there is one person, or
none, and the gate wants two. A gate of one would have fired 6 of these
9 sorties; it would not have saved the 3 supply-empty ones. The refusal
rate itself eased to 9/18 (50%) from 62% on r126/r127, but the pile-up
shape is unchanged: refused sets still never get a later ok call, and
W1 is still unanswered (three-panel count: 30 refusals, 0 same-set
re-musters, 0 ok sorties after a refusal, 0 full clears after a refusal).

## C1 (bend, not break) — GO

- Gates hold per C2, and every game-over has a named cause that is NOT
  a siege-mechanic failure:
  - 12801: scattering — "Haven couldn't hold. On the fifth hungry day,
    people started walking" (day ~105, 3 alive, pantry 0).
  - 12802: extinction — "No one is left to pick up the Codex. The
    village dies out" (day ~85, 0 alive, pantry 0).
  - 12803: extinction — same line (day ~94, 0 alive, pantry 650).
    This village died with food in the stores — attrition across
    monsters, the wild, and wounds, not famine.
  - 12805: scattering — same fifth-hungry-day line (day ~97, 1 alive,
    pantry 0).
  - 12804: no game-over — horizon with 8 alive.
- "Fifth hungry day" vs r127's "third hungry day" is EXPLAINED, not
  drift: the scattering clock is famineLimit 3, or 5 when the granary
  reserve bins exist (game.js: the bins open on hungry day 4 — "Two
  more days. Make them count."). 12801 and 12805 both carry granary
  lines; their reserves bought two extra days. 12802 has no granary
  lines. The mechanic works as designed.
- Census-flag quirk, noted not failed (same shape as r117 / r122 /
  r126 / r127): 12802's and 12803's censuses say scattered False /
  extinct False although the closing lines are extinction. The closing
  line is the authority; no metric reads that flag.

## C2 (episodes fire + gates hold) — GO

- Raids fire on all seeds: 8 / 6 / 7 / 13 / 7. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds (corpse-excluded;
  R59 legacy count also reported: 3, all corpse-counting artifacts,
  same class as r122/r126/r127).
- D1 snapshots all delayed >= 3 attempts: 18/18.
- deltaBad empty (18 attempts, 9 ok, 9 refused, deltaExact 9). D3 drift
  unknown = 0 (labels panel-wide: player-drawn-off 21, moved-on-valve 11,
  sortie-clear 9).
- MISSED-WINDOW total = 3 (r127: 5, r126: 12, r122: 12). Per the
  prereg this does NOT fail C2: it quantifies the boundary sampler's
  blind spot. All three are moved-on-valve drifts with tick-part
  waited>=3 samples in the window (12801 d96 Herald; 12805 d77 Herald
  and Eulogy).
- Days-tail wobble persists, same class as every panel since r70: loop
  days vs max Game say-day (12801 105 vs 109; 12802 85 vs 86; 12803 94
  vs 95; 12804 120 vs 125; 12805 97 vs 105). Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, and W1 still open

- Lingerer sets form on all seeds. Gorge events: 22 / 10 / 43 / 4 / 51
  (130 total, 104,212 kcal eaten at the treeline — the biggest gorge
  panel yet, because the villages lived longer and 12803/12805 gorged
  for weeks while their benches were bare).
- Sorties: 18 attempts, 9 ok, 9 REFUSED — all 9 with the recorded reason
  'no-fighters' ("Not enough fighters to send — a sortie needs at
  least two besides you, and the bench is bare"). Every
  boundary-firable case fired or was refused with a recorded reason;
  no boundary-firable case went unfired.
- Clear rate on ok sorties: 2/9 full clears. The clears are 12804 d80
  (1 target, The Terms of Service, remaining 0, paid, deltaExact) and
  12805 d36 (1 target, giant mosquito, remaining 0) — both FIRST-attempt
  clears: neither seed has any refusal before its clear, so neither can
  answer W1.
- W1 (does a re-muster ever FULLY clear?) stays UNANSWERED, now with a
  three-panel count: r126 16 + r127 5 + r128 9 = 30 refusals, 0 same-set
  re-musters, 0 ok sorties after a refusal, 0 full clears after a
  refusal. r128 adds no same-set re-muster trial at all: the refused
  sets (12803 Herald+Big Loud d69-d71, Big-Eyes+Influencer d94-d95;
  12805 Big-Eyes d100-d101) never got a later ok call before their
  villages died. The next run inherits the count (30 refusals, 0 clears),
  not a shrug.
- Cross-check classes: every ok/refused target reads 'waited-ge3'
  EXCEPT 12801 d85's Big Ugly + The Ugly Beast and 12805 d46's
  Cliffhanger + Paparazzo + Chorus Line and d56's Loud-Eyes, which read
  'sampled-lt3' — boundary-joined sets, same class as r126's d104 clear
  and r127's d55/d113 clears. No target reads 'none' this panel.
- G-ID watch: gorgeAfterIdMatched = 0, gorgeAfterReturn = 0, against
  gorgeAfterNameMatched = 2 (12805 Paparazzo, same-name gorge after its
  d46 clear — but id-matched 0, so attribution cannot say it was the
  same individual). FOURTH panel running at zero id-matched; the watch
  stays open, not closed, on 4 panels.
- Same-night same-name groups (multiGroups) are reported as counts
  only and NOT cited as evidence either way, per the adopted rule:
  12801 d82 has two ambiguous-attribution pairs (The Redactor x2, The
  Ugly Beast x2 — keys null, two events each, attribution cannot say
  one monster or two).
- deadInMusterLines = 0. Self-convo targets: none observed across the
  39 transcripts (every NPC distinct, player voice consistent).

## BENCH (prereg descriptive) — the gate, not the drain; no single shape ≥80%

- Refused sorties by musterAvailable: 1 in 6 cases, 0 in 3 cases.
  By livingBesidesPlayer: 1 in 6 cases, 0 in 2 cases, 1 in the
  nodeAway case.
- Shape counts: gateOneShort 6, supplyEmpty 3, availabilityDrain 0,
  other 0. Per the prereg's own ≥80% rule (6/9 = 67%), NO single lever
  shape is named — the verdict is "mixed" by that bar. But the panel
  rules one hypothesis OUT cleanly: availability-drain is 0/9, with a
  single exclusion (one nodeAway) across all refused sorties. The bench
  is not drained by errands, wounds, travel, or conversation — it is
  empty (3) or one short of the gate (6). The gate is the majority
  shape: a gate of one besides the player would have fired 6 of 9
  refused sorties. Whether that is the right change is a Steve-call;
  this run only names the numbers.
- Bench snapshots were present on all 18 attempts (benchMissing false
  on every refused row); the instrument worked first try.

## WRAP-CHECK — GO

- Analyzer R128 WRAP section: 39 transcripts, 39 marked, 0 unmarked.
  Marker counts: '(conversation ended by the engine)' 33,
  '(driver cap break:' 3, '(conversation refused/ended)' 3. No
  leave-break, choices-throw, or convoGet-throw marker fired this
  panel — those paths exist and are marked, but this panel did not
  exercise them.
- The 3 cap-break transcripts (12801 d63 Dmitri, 12804 d25 Mabel,
  12804 d35 Mabel) are NOT cut mid-thought: d63 ends on "Alright — I
  should get back to it." and d35 on "I should go. You know where to
  find me." before the marker. d25 ends mid-loop on a complete
  requirements line ("I've told you three times now — They are out on
  the road...") — the driver stopped asking, the NPC's line is whole.
  The cap is a driver budget (12 turns), not a game cut — but a future
  cap-break transcript could in principle cut a live thread. The marker
  makes that check possible; before r127 it was invisible.
- The 3 refused/ended transcripts (12802 d43 Colleen, 12804 d15 Bessie,
  12805 d32 Rachel) are all defender-after-resolution opens where the
  NPC declines at the door — recorded, not fabricated. Whether
  defenders refusing right after a fight is character (exhaustion) or
  a gate is not answered by this panel; it is a descriptive note, not
  a finding.

## C3 (people check) — GO

Read in full: all 39 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).

- NPCs want concrete things: a festering cut ("If it festers I'm no
  good to anyone — can't haul, can't hunt, can't watch"), a spreading
  cut ("The cut's gone hot and it's spreading — I can feel it
  moving"), a fever ("I'm burning up and there's nothing left in me.
  Someone who knows sickness — please."), a ridge above the creek to
  fill packs before dark ("Another day like today and we're choosing
  who eats."), 7 liters of drinking water ("We walk together and each
  carry two liters back. Creek water still needs boiling."), an empty
  stomach ("My stomach's been empty so long I've stopped feeling it,
  and that's worse.").
- Grief is grounded in real deaths of each seed: Sal sets out extra
  portions for Priya and Valentina, dreams Valentina is still here
  ("Woke up angry at the dream. Stupid."); Giulia sets out extra
  portions for Vignesh and Victor ("Nobody says Victor's name right
  yet. We will."); Hassan for Yerkezhan and Onni; Mabel expects Saul
  at the fire; Leo picks up Otto's share ("The fire feels smaller
  without Otto."); Milo turns over Lucas's last words; Victor keeps
  thinking about collecting Heritier's owed favor ("Stupid."); Henry
  the same for Amir. The "We bury, we grieve, we keep going. There's
  no step four." line family recurs — shared grief script, still
  anchored to that seed's actual dead.
- Invitations are sometimes taken, with character: TAKEN seven times —
  Leo d17 ("Someone should watch your back. Might as well be me."),
  Milo d40 ("Okay. Yeah. I trust you."), Sal d37 (deflects, then takes
  on the second ask: "...Fine. This had better be worth it."), Mabel
  d35 ("Someone should watch your back."), Victor d61 (same second-ask
  take), Giulia d63 ("Okay. Yeah. I trust you."), Hassan d72
  ("Someone should watch your back."). DEFLECTED with character —
  Colleen d34 ("...Think about it? I'll be around."), Sal d21/d22
  (soft no, then "Not right now. I've got my own things to handle."),
  Henry d98 (hesitation about the player leading: "Out there? With
  YOU leading? ...Let me think about it."). Panel-wide taken 7,
  deflected several: the sometimes-taken shape holds, matching r127's
  7 exactly.
- Reveals land with shame and specificity: Dmitri "I wasn't a
  blacksmith. I was an appliance repair tech. It's safer if people
  don't know."; Sal "I wasn't a bush pilot. I was a postal worker. I
  was ashamed of the truth." and "I'm not from Denver. I'm from
  Columbus, Ohio. I was embarrassed."; Henry the same Denver family
  from Beijing. The "not from Denver" family repeats across seeds
  with different cities — a shared script family, not a fabrication;
  each reveal is that villager's own.
- Confrontation honesty: Milo d39 and Dmitri d63 refuse to re-confess
  ("You're really going to make me say it again?" / "I confessed
  that already. I'm not confessing it twice for dramatic effect."),
  Sal d21 the same twice over — the anti-loop behavior working.
  Chloe's Lena thread holds across a long conversation ("Her name was
  — is — Lena. She'd laugh at me for saying 'was'. She's fine. She
  has to be fine." / "I'd trade every comfortable day left in my life
  for one hour with them." / "I ask every traveler. Every one.").
- Teaching fires: Mabel teaches Wood Sorrel AND Wild Ginger in one
  conversation (d25), Water Chestnut and Cassava in the next (d35);
  Leo teaches Loquat (d17). Lessons land as short, specific lines.
- Repeated asks escalate, then close — never loop: favor requirements
  climb plain -> "As I said —" -> "Like I said —" -> "Still the same
  thing —" -> "I've told you three times now —" on Rosa, Colleen,
  Chloe, Victor, Greta, Sosuke, Lorenzo, Leroy, Lena, Mabel, Fatima
  alike; the details variant closes the same way. Cap-line repeat,
  noted not failed (same class as r126/r127): a sixth ask repeats
  "I've told you three times now" — a cap, not a loop; the driver
  asks a sixth time, the game caps.
- Naming-stance wobble: NO fourth sighting. Chloe d20 reports the
  naming debate (Choir Toad, 'Ugly-Eyes' shouted down) and asks the
  player's vote without pushing a name and then disavowing it. The
  wobble stays a three-panel wrinkle (r122 Brendan, r126 Dwayne,
  r127 Felipe); it does NOT graduate this run. The watch continues.
- Wrinkles, noted not fixed:
  - Nonverbal vocabulary repeats verbatim across turns AND
    conversations: "They answer at length. They nod back, slowly." /
    "They answer at length. They nod, holding your gaze a beat
    longer." appear in Tashi d84 (12802) and Mo Thai d24/d43/d55
    (12804), in the same order variants. The signing NPCs do carry
    character (Mo Thai: "Talk to ME, not through it" — irritated at
    the player's distraction; "No?" / "Thank you?" — proud of the one
    English they know), but the nod pool is small and a player who
    talks to signing NPCs often will see identical lines. A content
    wrinkle, not a loop — every conversation ends properly.
  - The [dlg:react] listen path is thin ("So." / "Well." / "Anyway.")
    on David d60 and Meera d67 — but coherent as a guarded NPC who
    has confided something and isn't ready to go on ("They hear the
    warmth in it. They're not ready to let it in." / "Let me sit with
    all that."). Observed-thin, not a defect.

## F1-inherited (favor call-time cause) — zero occurrences, stays CLOSED

- The call-time wrap installed cleanly; entries [] on all seeds. No
  second dead-id path, no second stale-flag path. The r116 ledger fix
  + driver guard hold on fresh seeds.

## Q2/Q3 — no reopening

- No succession-picks-a-dead-member case, no dead ambient speaker this
  panel. The analyzer's death mismatches resolve cleanly: Dmitri d85
  and Abylai d64 are muster-explained (sortie death lines, same class
  as the closed Dina case — muster-aware mismatches []), and the
  unattributed death lines are monster Codex page-turns ("Big Ugly is
  dead. You didn't ask. It knew." etc. — a Codex page-turn on a monster
  kind, not a villager death) plus one grief-delay hierarchy line
  (Emberhold installing their own speaker). Q2/Q3 stay closed per r114.

## C7 (famine/disease pressure census, descriptive, no bar)

- 12801: pantry low-water 0 kcal (gameDay 21), ended at 0. 14 corpses:
  see JSON for the exact split; 0 famine, 0 sickness in the deaths list.
- 12802: pantry low-water 0 kcal (gameDay 82), ended at 0. 16 corpses.
  0 famine, 0 sickness.
- 12803: pantry low-water 0 kcal (gameDay 65), ended at 650. 17 corpses.
  1 sickness corpse (Shanice Traore d12). 0 famine.
- 12804: pantry low-water 1,800 kcal (gameDay 51), ended at 67,985.
  10 corpses. 0 famine, 0 sickness — the only seed that never touched
  empty, and the only horizon.
- 12805: pantry low-water 0 kcal (gameDay 51), ended at 0. 20 corpses.
  0 famine, 0 sickness.
- Panel totals: 77 corpses, 0 starvation corpses, 1 sickness corpse.
  The famine clock, not starvation deaths, ends the hungry villages
  here — same shape as r126/r127, with the one exception (Shanice)
  proving the death causes still fire when they should. 12803 is the
  sharper case: a village that died with food in the stores.

## C4 (burn observation, Steve-call, no bar) — no observation

- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107/r111/r113/
  r114/r116/r117/r122/r126/r127: also 0). The phoenix per-event respawn
  cascade did not recur. The Steve-call stands unchanged.

## BLANK STATUS: BENCH delivered and answered, W1 still open with a three-panel count, two new wrinkles

- BENCH DELIVERED (instrument, not game code): every sortie attempt
  carries a bench snapshot, the analyzer classifies gate vs supply vs
  availability, and this panel answers the sharpened question: the
  gate is the majority shape (6/9 one-short), supply-empty is the
  rest (3/9), availability-drain is ruled out (0/9, one exclusion
  total). No shape hits the prereg's 80% bar, so no single lever is
  named by that rule — but the gate is where a change would bite,
  and the drain hypothesis is dead. Changing the gate is a Steve-call.
- W1 still open (see C2b): 30 refusals across r126+r127+r128, 0 ok
  sorties after a refusal, 0 full clears after a refusal. r128's 2
  full clears are first-attempt clears and cannot answer W1.
- Naming-stance wobble: no fourth sighting; stays a wrinkle, watch
  continues. G-ID watch stays at zero (fourth panel). W4 stays closed.
  F1 stays closed. Q2/Q3 stay closed.
- New wrinkles (see C3): nonverbal nod vocabulary repeats verbatim
  across conversations; the listen/react path is thin but coherent.

## Village assessment (plain words)

- 12801 — the village that held five hungry days and still walked.
  Three people alive at the scattering after 105 days, pantry empty,
  the granary's reserve bins bought two extra days and then ran out.
  Its people still taught, grieved by headcount, and took invitations
  — Leo hoping to be asked, Milo trusting the player — but the bench
  went bare and the village walked.
- 12802 — the village that died out quietly. Eighty-five days, six
  raids fought, ten gorge nights, and not one sortie ever got off —
  its lingerer sets never survived three nights at a boundary. No
  granary, no reserve, nobody left to pick up the Codex. Its people
  still asked the sky questions and kept lists, and Chloe still asks
  every traveler about Lena — but asking is not surviving.
- 12803 — the village that refused seven times and died anyway. Its
  Herald and Big Loud lingered for weeks while the bench held exactly
  one person — four refusals on the same set across three days — and
  the village still went extinct with 650 kcal in the stores. Clearing
  the treeline was never the question; there was nobody left to send,
  and the food outlived the people.
- 12804 — the village that held. Eight people alive at the horizon
  with 67,985 kcal in the stores, after thirteen raids and a full
  clear of The Terms of Service on day 80. Its people taught four
  plants across two conversations, mourned Saul properly, and took
  invitations with trust. This is the crisis leg working at its best:
  besieged, grieving, still standing — and the only seed that never
  touched an empty pantry.
- 12805 — the village that cleared its siege twice and still walked.
  Two full clears (a giant mosquito on day 36, a four-monster set on
  day 46) and the village still scattered on the fifth hungry day with
  one person left, after 51 gorge nights. Clearing the siege is not
  the same as surviving the crisis.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes. Raids, gorges, sorties, refusals, re-musters
  attempted, two full clears, mourning, teaching, confrontation
  reveals, and both scattering-clock outcomes (fifth-hungry-day
  scattering x2, extinction x2, horizon x1) fire in ordinary competent
  play on fresh seeds with no staging — the panel needed no
  hand-holding beyond the driver's sortie answers.
- FUN: yes, with the usual crisis-leg weight. The villages read like
  people under pressure (a bench that holds exactly one person and
  says so plainly, a village that clears its siege twice and still
  dies, a village that dies with food in the stores, invitations
  taken with trust and deflected with character, a woman who will not
  confess twice for dramatic effect, a signing villager irritated at
  being talked through), and the refusal rate holding near half across
  three panels makes the late game feel besieged in a specific way:
  not "can we go out?" but "is there anyone left to send — and if
  they go, will they come back?"
- WINNABLE: the leg's horizon is reachable (1/5 here, 1/5 on r127,
  2/5 on r126, 1/3 on r113/r114/r116/r117/r122) but the breaking side
  is still the majority, and it breaks on the famine clock and
  attrition, not on siege mechanics. A real player can reach the
  horizon; most villages will not. That is the crisis leg working as
  designed, not a verdict against it. The new question the next run
  inherits is the gate itself: at a stable ~50-60% refusal rate, with
  two-thirds of refusals one fighter short of a two-fighter gate, is
  one besides the player enough? That question is named, not answered,
  here — changing the gate is a Steve-call, not a loop fix.

## Metric review (§14)

- No metric was re-scored mid-run. C1/C2/C2b/C3/WRAP verdicts use the
  preregistered bars exactly; the missed-window 3 is reported under
  the prereg's own instrument-gap reading, not folded into a game
  verdict; the G-ID watch (id-matched 0) is reported as a watch, not
  a bar; the multiGroups counts are reported as counts only, not as
  evidence either way, per the adopted rule.
- BENCH is judged on the prereg's own ≥80% rule: no single shape hits
  it (gateOneShort 6/9 = 67%), so the run reports "mixed" by that bar
  while also reporting the two sharper facts the bar doesn't capture
  — availability-drain ruled out (0/9), and the gate as the majority
  shape. The prereg's bar was written for naming a single lever; the
  next run's prereg should keep the bar but add a second line: report
  the majority shape and the ruled-out shapes alongside it, so a 67/33
  split with a dead third hypothesis isn't flattened to "mixed".
- The "fifth hungry day" wording is explained by the granary mechanic
  in code (famineLimit 3 vs 5), not treated as drift — the prereg's
  base-drift note does not apply to it.
- Carried forward, unchanged: telemetry metric list for this leg is
  defendedFights,playerFights,latelyDefenseCount; defendedCount stays
  out until a correspondence is proven.

## Determinism

- Seed 12801 re-run BYTE-IDENTICAL (panel JSON and all 8 of its
  transcripts) to its own first run, proving the r128 bench snapshot
  (pure reads) and the analyzer classification inject no
  nondeterminism. Identity is judged against this run's own first
  run, not against any r127 file.

## Regression

- This run changes NO game code: the repo commit adds only the r128
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
  reason (same scope call as r117/r122/r126/r127, preregistered): the
  commit touches no game code and no existing file, so there is no
  regression surface for the full gate to cover beyond the targeted
  suites above (which are the suites for the two fixes the panel
  depends on). The next run that touches src/js should run the full
  gate. Worktree git status at commit time shows exactly the 3 added
  files, nothing modified, no sibling files swept in.

## Telemetry deviation check (§14)

- Command: telemetry-check.js --baseline
  telemetry-baselines/crisis.json --current
  'journey-crisis-r128-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount (run from the
  r128-panel dir).
- Result: QUIET (exit 0, 5 files, 3 metrics, no large deviations). No
  LOUD lines to investigate. Baseline NOT rolled (a single 5-seed
  panel's variance must not be baked in).
