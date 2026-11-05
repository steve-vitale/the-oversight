# Journey crisis r129 — the attempt collapse is seed variance, not base drift (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: r129 follows r128; filenames stay unique; the rotation
file, not the number, is the authority.

## Run setup — lock, flap, late registration, fresh heartbeats

- No lock at run start. Fresh lock written (run_id 2026-11-05T19:56:45Z).
- Pre-flight clean on first check: main tree empty, disk 30%.
  `git pull` already up to date (bb703eb19). Reaper ran, removed
  build-finish-instrument (4.1h stale, branch kept, 9 commits ahead);
  9/16 trees active, no cap pressure.
- Registration: BLOCKED by an EPERM flap flare. The first attempt's
  checkout failed on the index reset (unable to write
  tools/mobile-sim.html, version.json); the next ten attempts failed
  at `git worktree add` writing `.git/worktrees/journey2-crisis/locked`
  (Operation not permitted). O_EXCL probes confirmed the flap: 3/3
  refused in .git/worktrees, then plain writes there refused too, while
  /tmp probes passed — the flap is surface-flapping, not path-specific.
  Attempt 11 (20:18:30Z) landed clean once O_EXCL probes passed again
  everywhere. Heartbeat landed at registration and was refreshed after
  every seed; never stale past the 15-minute line. The register script's
  error text is misleading here: it prints the first (`-b`) attempt's
  "branch already exists" even when the fallback fails on the locked
  write — the manual `git worktree add` shows the real error.
- Canon: docs/CANON.md + docs/DIRECTIVES.md re-read; DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md skimmed (leg systems). No canon doc
  covers crisis-as-a-leg directly (same standing note as r122/r126/
  r127/r128). Nothing reinvented, nothing changed.
- Smoke test first, into a scratch subdir (not the panel dir):
  SEED=12901 DAYS=5 proved the doAction wrap runs (708 say lines,
  instrumentErrors []) before the panel launched.
- Instrument: r128 driver/analyzer verbatim EXCEPT filenames r129,
  seeds 12901-12905, and the W1 carried count (30 refusals). Diff
  reviewed: only r128 -> r129 substitutions plus the count line.
  node --check clean on both.
- Seed runs use the r115/r116/r117/r122 retry harness pattern (3 attempts,
  parse + census acceptance), run inline. All five seeds ACCEPTED on
  attempt 1 (parses, carries a census).

## Pre-registration (binding, written before any scored seed)

Prereg file: goal hidden_files/evidence/2026-11-05/journey-crisis-r129-prereg.md.
The leg's questions, in the prereg's words: (1) W1 — does a re-muster
after a refusal ever FULLY clear? (three-panel count: 30 refusals,
0 ok sorties after a refusal, 0 full clears after a refusal); (2) GATE
— does gate-one-short stay the majority refusal shape (r128: 6/9, 67%)?
Does availability-drain stay at zero? (3) WRAP-CHECK, unchanged
wording; (4) refusal pile-up, descriptive; (5) naming-stance wobble
watch (three panels, no fourth sighting in r128); (6) G-ID watch
(four panels at zero id-matched); (7) nonverbal-nod wrinkle (new in
r128): the signing-NPC nod pair repeats verbatim — graduates to a
content fix item if it recurs in >=3 conversations in the C3 read.
Bars: C1 every game-over has a named non-siege-mechanic cause; C2 raids
on all seeds, fought resolutions present, D1 snapshots all delayed >= 3,
deltaBad empty, D3 drift unknown = 0 (MISSED-WINDOW descriptive only);
C2b every boundary-firable case fires or is refused with a recorded
reason, W1 reported as a count with no GO/NO-GO bar; BENCH descriptive
with the prereg's own rule — name a lever shape only if it covers ≥80%
of refusals, otherwise "mixed, no single lever" AND (r128 metric-review
revision) report the majority shape and the ruled-out shapes alongside
it; C3 all transcripts read in full, fabricHits = 0, meaning bar met,
with a fourth naming-stance wobble sighting graduating it to a fix
item; WRAP-CHECK GO iff analyzer R129 WRAP reports unmarked = 0.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds 12901 / 12902 / 12903 / 12904 / 12905, sequential, all exit 0 first attempt, all parse-verified)

EVID: goal hidden_files/evidence/2026-11-05/r129-panel/
(analyzer output saved there as analyzer-output.txt).

- 12901: GAME OVER (extinction, d73 closing line), 72 loop days. 5 raids,
  10 gorge events, 1 sortie (ok, broke, cleared 1 of 2, paid the
  village's last 1,500 kcal), 8 convos. Ends 0 alive / 0 kcal.
  15 corpses.
- 12902: GAME OVER (scattering, third hungry day, d86), 83 loop days.
  7 raids, 11 gorge events, 0 sorties, 8 convos. Ends 1 alive /
  0 kcal. 14 corpses.
- 12903: GAME OVER (scattering, third hungry day, d74), 72 loop days.
  5 raids, 7 gorge events, 0 sorties, 6 convos. Ends 1 alive /
  0 kcal. 12 corpses. Scholar Amy Mendoza died d5 ("the wild"); the
  run continued 67 days under a successor.
- 12904: GAME OVER (extinction, d78 closing line), 77 loop days. 6 raids,
  26 gorge events, 2 sorties (both ok, 0 full clears: d43 Buffering
  broke, paid 6,341; d59 Redactor cleared, Ruben died facing The
  Influencer), 8 convos. Ends 0 alive / 0 kcal. 19 corpses.
- 12905: GAME OVER (scattering, third hungry day, d81), 80 loop days.
  7 raids, 1 gorge event, 0 sorties, 8 convos. Ends 1 alive /
  0 kcal. 15 corpses.

HEADLINE, stated plainly: this panel produced almost no sortie
attempts at all — 3 attempts across 5 seeds, all ok, 0 refused — and
no village reached the horizon. The refusal rate did not "collapse"
in any meaningful sense: the denominator collapsed. Lingerer sets
drifted off at 0-2 nights waited in 16 of 23 drifts (70%; r128:
15/41 = 37%), before reaching the 3-night boundary where the driver
answers a sortie. The bench question, the gate question, and W1 are
all unanswerable on this panel — there were no refusals to classify.
What answers the "is it the base?" question is the drift-check below:
r128's seeds on THIS base behave like r128 (20 attempts, 9 refused).
The collapse is seed variance — these five seeds are a harsh,
short-lived set — not a base change.

## Drift-check (same-run diagnostic, NOT preregistered: r128 seeds on the current base)

Because the panel's headline (3 attempts, 0 refusals, 0 horizons)
looked like a base change, this run re-ran r128's seeds (12801-12805)
with the r129 driver on the current base (bb703eb19) before judging
the panel. EVID: goal hidden_files/evidence/2026-11-05/r129-driftcheck/
- attempts=20 ok=11 refused=9 (45% refusal — back in the r126/r127/r128
  band), cleared=4, deltaExact=11, deltaBad=[]. Gorge 143 nights
  (108,554 kcal), convos 39, fabricHits 0. D1 delayed>=3: 20/20.
  Horizons 1/5 (12804 d120, 5 alive, 3,200 kcal). Per-seed days
  104/85/100/120/103 — all longer-lived than any r129 seed.
- BENCH on the drift-check: refused 9 — gateOneShort 3, supplyEmpty 5,
  availabilityDrain 1 (one refusal with 5 nodeAway exclusions). The
  shape split FLIPS from r128 (gate 6 / supply 3) to supply-majority
  (5/3) on the same seeds with a new base — but with n=9 either way,
  this is noise around a split bench, not a new verdict. No shape hits
  the 80% bar on either panel.
- W1 diagnostic: the drift-check contains the FIRST same-set re-muster
  in four panels — seed 12805 refused d99, ok sortie d101 on the same
  set (remaining 2, not a clear). Full clears after a refusal: still 0.
  This is a diagnostic observation, NOT folded into the preregistered
  count: the next preregistered panel must confirm it before the
  "re-musters never happen" streak is declared broken.

## C1 (bend, not break) — GO

- Every game-over has a named cause that is NOT a siege-mechanic failure:
  - 12901: extinction — "No one is left to pick up the Codex. The
    village dies out" (day ~73, 0 alive, pantry 0).
  - 12902: scattering — "Haven couldn't hold. On the third hungry day,
    people started walking" (day ~86, 1 alive, pantry 0).
  - 12903: scattering — same third-hungry-day line (day ~74, 1 alive,
    pantry 0). The scholar died d5 and the village still ran 67 days
    under a successor before scattering — the mantle passing works.
  - 12904: extinction — same line as 12901 (day ~78, 0 alive, pantry 0).
    This village died with 19 corpses, all villager-combat deaths in
    the deaths list — attrition across raids and the wild, not famine.
  - 12905: scattering — same third-hungry-day line (day ~81, 1 alive,
    pantry 0).
- "Third hungry day" on all three scatterings (vs r128's fifth-day
  villages) is EXPLAINED, not drift: the scattering clock is famineLimit
  3, or 5 when the granary reserve bins exist. None of the three
  scattering seeds carries granary lines; their reserves never opened.
  12901 and 12904 are extinctions, not scatterings — the clock never
  got the chance.
- Census-flag quirk, noted not failed (same shape as r117 / r122 /
  r126 / r127 / r128): 12901's and 12904's censuses say scattered False /
  extinct False although the closing lines are extinction. The closing
  line is the authority; no metric reads that flag.

## C2 (episodes fire + gates hold) — GO, thin

- Raids fire on all seeds: 5 / 7 / 5 / 6 / 7. Fought resolutions on all
  seeds (25 fought(tick) + 2 moved-on(tick) across the panel). None of
  the 3 ok sorties produced a (sortie-call) resolution line — none
  fully resolved its crisis (12901 d72 broke on The Reunion; 12904 d43
  broke on Buffering; 12904 d59 cleared The Redactor but The Influencer
  remained), so their outcomes live in the sorties array, not the
  resolutions list; D2 crisis-at-clear table is empty.
- TRUE early 'fought' resolutions = 0 on all seeds (corpse-excluded;
  R59 legacy count also reported: 6, all corpse-counting artifacts,
  same class as r122/r126/r127/r128).
- D1 snapshots all delayed >= 3 attempts: 3/3.
- deltaBad empty (3 attempts, 3 ok, 0 refused, deltaExact 3). D3 drift
  unknown = 0 (labels panel-wide: player-drawn-off 19, moved-on-valve 2,
  sortie-clear 2).
- MISSED-WINDOW total = 2 (r128: 3, r127: 5, r126: 12). Per the
  prereg this does NOT fail C2: it quantifies the boundary sampler's
  blind spot. Both are 12904 (d46 Buffering, moved-on-valve, 2 samples
  waited 6; d59 Redactor, player-drawn-off, 9 samples waited 3).
- Days-tail wobble persists, same class as every panel since r70: loop
  days vs max Game say-day (12901 72 vs 73; 12902 83 vs 86; 12903 72 vs
  74; 12904 77 vs 78; 12905 80 vs 81). Judge bands, not counters.
- THINNESS, stated plainly: C2 passes on the letter with only 3
  attempts. The gate that actually held this panel is the drift-check's
  20/20 — the instrument and the game both still fire sorties at
  waited>=3 on seeds whose sets survive that long.

## C2b (linger-conditional gorge/sortie) — GO, thin

- Lingerer sets form on all seeds. Gorge events: 10 / 11 / 7 / 26 / 1
  (55 total, 43,403 kcal eaten at the treeline — the smallest gorge
  panel since r113, because the villages lived 72-83 days and their
  sets drifted off at 0-2 nights).
- Sorties: 3 attempts, 3 ok, 0 REFUSED. Every boundary-firable case
  fired or was refused with a recorded reason; no boundary-firable
  case went unfired — the only sets that reached waited>=3 were the
  three attempted (12901 d72 Big-Eyes+Reunion; 12904 d43 Buffering;
  12904 d59 Redactor+Influencer).
- Clear rate on ok sorties: 0/3 full clears. The clears are none: 12901
  d72 cleared Big-Eyes but broke on The Reunion (900 HP) and spent the
  village's last 1,500 kcal the day it died; 12904 d43 cleared 0 of 1
  (Buffering broke); 12904 d59 cleared The Redactor but Ruben died
  facing The Influencer.
- W1 (does a re-muster ever FULLY clear?) stays UNANSWERED, now with a
  four-panel preregistered count: r126 16 + r127 5 + r128 9 + r129 0 =
  30 refusals, 0 same-set re-musters, 0 ok sorties after a refusal,
  0 full clears after a refusal. r129 adds no trial at all: no refusal
  means no re-muster to attempt. The drift-check's one same-set
  re-muster (12805 d99->d101, ok, remaining 2) is reported separately
  above and does NOT enter the preregistered count.
- Cross-check classes: every ok target reads 'waited-ge3' EXCEPT 12901
  d72's Big-Eyes, which reads 'sampled-lt3' — boundary-joined set,
  same class as r126's d104 clear and r127's d55/d113 clears. No target
  reads 'none' this panel.
- G-ID watch: gorgeAfterIdMatched = 0, gorgeAfterReturn = 0, against
  gorgeAfterNameMatched = 0. FIFTH panel running at zero id-matched;
  the watch stays open, not closed, on 5 panels.
- Same-night same-name groups (multiGroups) are reported as counts
  only and NOT cited as evidence either way, per the adopted rule:
  12904 d45/d55/d56/d57 has ambiguous-attribution pairs (Buffering x2,
  The Redactor x2 on three nights — keys null, two events each,
  attribution cannot say one monster or two).
- deadInMusterLines = 0. Self-convo targets: none observed across the
  38 transcripts (every NPC distinct, player voice consistent).

## BENCH (prereg descriptive) — unanswerable this panel; drift-check carries the shape

- Preregistered panel: refused = 0. No shape split exists to report.
  The prereg's 80% rule cannot fire, and the majority-shape second
  line has no majority to name. BENCH is UNANSWERED for r129, not
  "mixed" — there is no data, not a split.
- Drift-check (same base, r128 seeds): refused 9 — gateOneShort 3,
  supplyEmpty 5, availabilityDrain 1. By the prereg's rule that is
  "mixed" (no shape ≥80%), with supply-empty the majority shape and
  availability-drain nearly ruled out (1/9, five nodeAway exclusions
  on a single refusal). Against r128's 6/3 gate-majority split, the
  two panels together say the bench is split and seed-dependent, not
  gate-dominated. The gate question stays open for the next
  preregistered panel.

## WRAP-CHECK — GO

- Analyzer R129 WRAP section: 38 transcripts, 38 marked, 0 unmarked.
  Marker counts: '(conversation ended by the engine)' 33,
  '(conversation refused/ended)' 3, '(driver cap break:' 2. No
  leave-break, choices-throw, or convoGet-throw marker fired this
  panel — those paths exist and are marked, but this panel did not
  exercise them.
- The 2 cap-break transcripts (12903 d31 Hector, 12904 d41 Malik) are
  NOT cut mid-thought: d31 ends on "Like I said — Still on that
  personal stuff." and d41 on "I should go. You know where to find me."
  before the marker. The cap is a driver budget (12 turns), not a game
  cut — but a future cap-break transcript could in principle cut a live
  thread. The marker makes that check possible; before r127 it was
  invisible.
- The 3 refused/ended transcripts (12902 d34 Scott, 12902 d48 Nikolai,
  12905 d53 Henry) are all defender-after-resolution opens where the
  NPC declines at the door — recorded, not fabricated. Whether
  defenders refusing right after a fight is character (exhaustion) or
  a gate is not answered by this panel; it is a descriptive note, not
  a finding.

## C3 (people check) — GO

Read in full: all 38 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).

- NPCs want concrete things: a festering cut ("If it festers I'm no
  good to anyone — can't haul, can't hunt, can't watch"), 3 liters for
  6 people ("We walk together and each carry two liters back. Creek
  water still needs boiling."), a ridge above the creek to fill packs
  before dark ("Another day like today and we're choosing who eats."),
  a wound that needs hands ("About this wound — still need hands. Are
  you in?").
- Grief is grounded in real deaths of each seed: Shannon expects
  Marisol at the fire and picks up her share; Jesse on Greta and
  Shannon ("The fire doesn't care. That's what gets me — the fire
  doesn't care."); Yuki turns over Jianguo's last words ("Nobody says
  Jianguo's name right yet. We will."); Debbie on Darnell ("The fire
  feels smaller without Darnell."); Yara on Kyrylo, Scott, and
  Catalina; Huia takes Yara's burnt piece; Malik does the headcount
  for Scott and Mara without thinking, then thinks, and oils boots
  for Mara on rest days; Judith on Luigi, Quinn, Natalie, and Saul.
  The "We bury, we grieve, we keep going. There's no step four." line
  family recurs — shared grief script, still anchored to that seed's
  actual dead.
- Invitations are sometimes taken, with character: TAKEN eight times —
  Shannon d22 (deflects, then takes on the second ask: "Alright. But
  I'm not carrying your stuff."), Jesse d34 ("Finally. I was wondering
  when you'd see my value."), Yuki d22, Debbie d37 ("...Fine. This had
  better be worth it."), Huia d63 (deflects, then takes on the second
  ask), Yara d35, Malik d34, Judith d25 ("Someone should watch your
  back. Might as well be me."). DEFLECTED with character — Shannon d22
  first ask, Huia d63 first ask ("Not right now. I've got my own
  things to handle."). Panel-wide taken 8, deflected 2 first-asks that
  both turned into takes: the sometimes-taken shape holds, matching
  r128's 7 and r127's 7.
- Teaching fires: Pavel teaches Greenbrier Shoots (d18), Yuki teaches
  slope-reading for water on the walk (d22). Lessons land as short,
  specific lines.
- Confrontation resolves: Saul's betrayal case (12905 d10) — pressed
  three times ("their story holds — either it's true, or it's been
  rehearsed a lot"), then leniency offered and taken ("They talked.
  Everything changes now." / "The ground remembers."). A real arc
  with a planted consequence, not a loop.
- Gifts with consequences: Scott digs up a buried food bundle (+1,115
  kcal, 12904 d22), then presses an oiled tool into the player's hand
  (d33); Malik shares a hidden stockpile (+4 wood, +4 fiber, d34).
- Repeated asks escalate, then close — never loop: favor requirements
  climb plain -> "As I said —" -> "Like I said —" -> "Still the same
  thing —" -> "I've told you three times now —" on Jesse, Debbie,
  Malik, Amina alike. Cap-line repeat, noted not failed (same class as
  r126/r127/r128): a sixth ask repeats "I've told you three times now"
  (Malik d21) — a cap, not a loop; the driver asks a sixth time, the
  game caps.
- Naming-stance wobble: NO fourth sighting. Four naming debates fire
  (Scott 12902 d9 Cliffhanger, 'The Big Beast' shouted down; Darnell
  12903 d8 Anaconda Empress, 'Big Ugly' shouted down; Scott Colombo
  12904 d14 pushes 'Ugly-Eyes' for The Living Wire; Saul 12905 d9
  pushes 'The Big Bastard' for Rut King) — all coherent stances: the
  reporters ask the player's vote without pushing a name, the pushers
  hold their push without disavowing it. The wobble stays a
  three-panel wrinkle (r122 Brendan, r126 Dwayne, r127 Felipe); it does
  NOT graduate this run. The watch continues.
- Columbus-cohort echo: CHECKED, by design, not a defect. Scott (12902
  d25: "Me? Columbus, Ohio."), Hector (12903 d31/d9: old songs from
  Columbus; "Columbus, Ohio is a direction, not a plan"), and Judith
  (12905 d41: "Columbus, Ohio didn't prepare me for checking the
  treeline every night") all name Columbus as their origin right after
  the scholar's own Columbus answer — it reads as parroting, but the
  lines are {origin}-filled from each NPC's own record
  (characterGen.json) and genRoster deliberately gives the first four
  villagers the SCHOLAR's origin (game.js genRoster: "The character IS
  the player, not a stranger wearing their hometown. Plus 2 extra
  villagers from random origins"). The sim scholar always defaults to
  Columbus (sim-harness.js:256), so the echo is systematic in sims and
  occasional in real play (only for a Columbus-picking player). No fix
  filed: the actionable bit is an instrument note — vary the sim
  scholar's origin across seeds so the cohort echo doesn't read as
  parroting in sim transcripts.
- Wrinkles, noted not fixed:
  - Nonverbal nod vocabulary repeats verbatim: Olga d69 (12901) carries
    all three signing-nod variants in one conversation ("They answer at
    length. They nod back, a little quicker this time." / "They nod,
    holding your gaze a beat longer." / "They nod back, slowly.") plus
    the proud "Food?" — the signing NPCs carry character (Olga's grin
    at the one English she knows), but the nod pool is small. Per the
    prereg's graduation rule (>=3 conversations in the C3 read) this is
    ONE conversation this panel, so it does NOT graduate. The watch
    continues (r128: Mo Thai across 3 conversations).
  - The [dlg:react] listen path is thin ("So." / "Well." / "Anyway.")
    on Jesse d60, Hector d31, Scott Colombo d15/d33, Judith d17 — but
    coherent as a guarded NPC who has confided something and isn't
    ready to go on ("They hear the warmth in it. They're not ready to
    let it in." / "Let me sit with all that."). Observed-thin, not a
    defect.

## F1-inherited (favor call-time cause) — zero occurrences, stays CLOSED

- The call-time wrap installed cleanly; entries [] on all seeds. No
  second dead-id path, no second stale-flag path. The r116 ledger fix
  + driver guard hold on fresh seeds. (Malik's wound favor went asked
  d40 -> moot d41 with the honest reason "This request is already
  closed" — a state transition, not a call-time failure.)

## Q2/Q3 — no reopening

- No succession-picks-a-dead-member case, no dead ambient speaker this
  panel. The analyzer's death mismatches resolve cleanly: Ruben d59
  (12904) is muster-explained (sortie death line, same class as the
  closed Dina case — muster-aware mismatches []), and the unattributed
  death line is a monster Codex page-turn ("Big-Eyes is dead. You
  didn't ask. It knew." — a Codex page-turn on a monster kind, not a
  villager death). Q2/Q3 stay closed per r114.

## C7 (famine/disease pressure census, descriptive, no bar)

- 12901: pantry low-water 0 kcal (gameDay 73), ended at 0. 15 corpses.
  0 famine, 0 sickness in the deaths list.
- 12902: pantry low-water 0 kcal (gameDay 43), ended at 0. 14 corpses.
  0 famine, 0 sickness.
- 12903: pantry low-water 0 kcal (gameDay 67), ended at 0. 12 corpses.
  0 famine, 0 sickness.
- 12904: pantry low-water 0 kcal (gameDay 61), ended at 0. 19 corpses.
  0 famine, 0 sickness.
- 12905: pantry low-water 0 kcal (gameDay 76), ended at 0. 15 corpses.
  0 famine, 0 sickness in the deaths list; 1 wound death (Quinn
  Murphy d25, "a wound that wouldn't close"); 1 starvation corpse
  (Stepan d81).
- Panel totals: 75 corpses, 0 starvation deaths in the deaths list
  (1 starvation corpse), 0 sickness, 1 wound death. The famine clock,
  not starvation deaths, ends the hungry villages here — same shape as
  r126/r127/r128, with the one starvation corpse proving the death
  cause still fires when it should. 12904 is the sharper case: a
  village that died with 19 corpses and zero famine — attrition across
  raids, the wild, and wounds, not hunger.

## C4 (burn observation, Steve-call, no bar) — no observation

- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107/r111/r113/
  r114/r116/r117/r122/r126/r127/r128: also 0). The phoenix per-event
  respawn cascade did not recur. The Steve-call stands unchanged.

## BLANK STATUS: no blank filled this run; two watches continue, one diagnostic first

- BENCH unanswered (0 refusals to classify); the drift-check carries
  the shape instead (mixed, supply-majority, n=9).
- W1 still open (preregistered count 30/0/0/0); the drift-check's one
  same-set re-muster + ok sortie after a refusal (12805 d99->d101) is
  the first of its kind and needs a preregistered panel to confirm.
- Naming-stance wobble: no fourth sighting; stays a wrinkle, watch
  continues. G-ID watch stays at zero (fifth panel). Nod vocabulary:
  1 conversation this panel; stays a wrinkle, watch continues.
  Columbus echo: checked, by design — instrument note only (vary the
  sim scholar's origin across seeds).
- W4 stays closed. F1 stays closed. Q2/Q3 stay closed.
- No game-code change this run: the commit adds only the r129 driver
  + analyzer (new files) and this run note.

## Village assessment (plain words)

- 12901 — the village that spent its last meal on a sortie and died
  anyway. Three monsters at the treeline on day 69, one fighter
  besides the player on the bench, and the sortie on day 72 cleared
  Big-Eyes, broke on The Reunion, and ate the last 1,500 kcal. The
  village died out that same night with nobody left to pick up the
  Codex. Its people still taught, grieved by headcount, and took
  invitations — Shannon hoping to be asked, Jesse finally seen for his
  value — but the bench went bare and the food ran out together.
- 12902 — the village that never got a sortie off and walked on the
  third hungry day. Eighty-three days, seven raids fought, eleven
  gorge nights, and not one lingerer set survived three nights at the
  boundary — every set drifted off at 0-2 nights, drawn away after the
  scholar. Its people still asked the sky questions, kept lists, and
  took Yara's burnt piece for her — but asking is not surviving.
- 12903 — the village whose scholar died on day 5 and kept going. Amy
  Mendoza died in the wild on the fifth day; the village ran 67 more
  days under a successor, fought five raids, and still scattered on
  the third hungry day with one person left. Its people taught, sang
  old songs from Columbus, and walked the treeline with Debbie — the
  mantle passing works, and it still wasn't enough.
- 12904 — the village that fought hardest and died with the most
  dead. Nineteen corpses, twenty-six gorge nights, two sorties — one
  that broke on Buffering, one that cleared The Redactor and cost
  Ruben his life facing The Influencer — and the village still went
  extinct with the pantry empty. Its people buried a food cache,
  shared a hidden stockpile, oiled boots for the dead, and dreamed
  the dead were still here. Clearing the treeline is not the same as
  surviving the crisis.
- 12905 — the village that pressed a traitor and still walked. Saul's
  story held under three pressings, then broke under leniency — "They
  talked. Everything changes now." — and the village still scattered
  on the third hungry day with one person left, after a single gorge
  night all run. Its people counted meals instead of days and followed
  the scholar past the treeline anyway.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes, with a caveat this panel. Raids, gorges, refusals
  (none this panel — see the drift-check), sorties, mourning, teaching,
  confrontation, and both game-over closings (third-hungry-day
  scattering x3, extinction x2) fire in ordinary competent play on
  fresh seeds with no staging — but the sortie instrument itself barely
  fired (3 attempts), so the leg's central beat was thin on these
  seeds. The drift-check on r128's seeds shows the beat fires fine on
  the same base: reachable, seed-dependent.
- FUN: yes, with the usual crisis-leg weight. The villages read like
  people under pressure (a sortie that spends the last meal, a
  scholar who dies on day 5 and a village that carries on, a traitor
  pressed three times before talking, a woman who oils boots for the
  dead, a signing villager proud of the one English she knows), and
  the refusal rate holding near half across four panels — with this
  panel's zero a denominator artifact, not a change — keeps the late
  game feeling besieged in a specific way: not "can we go out?" but
  "is there anyone left to send — and if they go, will they come back?"
- WINNABLE: the leg's horizon is reachable (1/5 on r128 and on the
  drift-check, 2/5 on r126, 1/5 on r127) but this panel reached it
  0/5 — the first zero-horizon crisis panel in the r122-r129 run.
  The breaking side is still the majority, and it breaks on the famine
  clock and attrition, not on siege mechanics. A real player can reach
  the horizon; most villages will not. That is the crisis leg working
  as designed, not a verdict against it — but a 0/5 panel on top of a
  3-attempt panel is the thinnest crisis read in eight runs, and the
  next run inherits a sharper question than the gate: is the
  early-drift shape (sets leaving at 0-2 nights) itself seed luck, or
  is there a drift-rate lever worth naming? The drift-check says seed
  luck; the next preregistered panel is the confirmation.

## Metric review (§14)

- No metric was re-scored mid-run. C1/C2/C2b/C3/WRAP verdicts use the
  preregistered bars exactly; the missed-window 2 is reported under
  the prereg's own instrument-gap reading, not folded into a game
  verdict; the G-ID watch (id-matched 0) is reported as a watch, not
  a bar; the multiGroups counts are reported as counts only, not as
  evidence either way, per the adopted rule.
- The prereg's pilot-gate trigger ("refusal rate collapses below 20%
  of attempts") fired on the letter (0/3 = 0%) — and this run
  investigated it in-run rather than reporting it flat: the
  drift-check (r128 seeds, current base, 20 attempts, 9 refused, 45%)
  shows the rate is alive and the collapse is a 3-attempt denominator
  artifact. The interesting finding is the ATTEMPT collapse (3 vs 18),
  explained by seed variance (early drift at 0-2 nights), not base
  drift. The prereg's bar was written for the refusal rate; the next
  run's prereg should add an attempt-count floor to the pilot gate, so
  a 3-attempt panel can't trip the "collapse" reading.
- BENCH is judged on the prereg's own ≥80% rule plus the r128
  metric-review second line: the preregistered panel has no refusals
  (UNANSWERED, not "mixed"), and the drift-check is reported as
  "mixed" with its majority shape (supply-empty 5/9) and ruled-out
  shape (availability-drain 1/9) alongside it.
- W1's count rule is kept strict: the drift-check's re-muster is
  reported separately and does NOT enter the preregistered count. The
  next run inherits the preregistered count (30 refusals, 0 re-musters,
  0 ok-after, 0 clears) plus the diagnostic note (9 refusals, 1/1/0).
- The "third hungry day" wording is explained by the granary mechanic
  in code (famineLimit 3 vs 5), not treated as drift — the prereg's
  base-drift note does not apply to it. The drift-check is the base
  check: r128's seeds on the current base reproduce r128's band, so
  no base drift is claimed for any shift.
- Carried forward, unchanged: telemetry metric list for this leg is
  defendedFights,playerFights,latelyDefenseCount; defendedCount stays
  out until a correspondence is proven.

## Determinism

- Seed 12901 re-run BYTE-IDENTICAL (panel JSON and all 8 of its
  transcripts) to its own first run, proving the r129 driver and the
  analyzer classification inject no nondeterminism. Identity is judged
  against this run's own first run, not against any r128 file.

## Regression

- This run changes NO game code: the repo commit adds only the r129
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
  reason (same scope call as r117/r122/r126/r127/r128): the commit
  touches no game code and no existing file, so there is no regression
  surface for the full gate to cover beyond the targeted suites above
  (which are the suites for the two fixes the panel depends on). The
  next run that touches src/js should run the full gate.
- CLOSEOUT CORRECTION (main session, 2026-11-05 ~21:30Z): the run's
  coordinator did start a full gate at ~21:00Z but the run timed out
  before it returned, and its result was lost with the coordinator.
  The closeout re-ran it in the worktree:
  `node scripts/check.js --quick` — **284 passed, 6 failed in 659s**
  (log: goal hidden_files `crisis-r129-checkquick-20261105.log`). The
  6 failures are the standing set (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes), identical to r99/r100/
  r106/r141. No new failures. The scope call above stands as the run's
  reasoning; the gate result is recorded here so the record is complete. Worktree git
  status at commit time shows exactly the 3 added files, nothing
  modified, no sibling files swept in.

## Telemetry deviation check (§14)

- Command: telemetry-check.js --baseline
  telemetry-baselines/crisis.json --current
  'journey-crisis-r129-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount (run from the
  r129-panel dir).
- Result: QUIET (exit 0, 5 files, 3 metrics, no large deviations). No
  LOUD lines to investigate. Baseline NOT rolled (a single 5-seed
  panel's variance must not be baked in).

## Held-tree note (not this run's work)

- The pre-flight reaper keeps flagging journey2-succession LOUD: the
  tree is git-detached (its .git pointer file is gone; `git worktree
  list` does not show it), 34 top-level entries last modified Oct 30
  22:55, 4.5 GB on disk, registry status done-merged. The branch
  journey2-succession NO LONGER EXISTS (deleted at its Oct 30 closeout
  after merging, per the loop's release step) — so anything committed
  is in master, and only uncommitted files in the tree are at risk:
  its evidence/ holds dated dirs Oct 16-30 plus region-wave1, and
  there are playtests/, scratch-bal/, and loose scripts. Main-session
  job, not this run's: confirm no unique uncommitted work in its
  evidence/scratch dirs, then remove the directory to reclaim 4.5 GB.
  This run did not touch it.
