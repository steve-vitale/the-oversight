# Journey crisis r180 — Lane B, leg 6 (ADOPTED after timeout)

Leg 6 (crisis). Rotation-b 6 at run start, 7 written at closeout (succession next).
Base: master a61f2c0a6 (sim-convfirst-a pilot 2). Lock: playtest-loop-2.lock run_id
2026-11-11T10:55:39Z. Prereg: goal hidden_files/evidence/2026-11-11/journey-crisis-r180-prereg.md
(driver r176 verbatim except seeds/paths; analyzer likewise). Canon read: docs/CANON.md +
docs/DISEASES.md (re-read 2026-11-11; medic-duty cures remain mundane medicine for mundane
disease — no canon conflict).

ADOPTION: the run timed out ~11:56Z with the post-fix panel 4/5 done — seed 14405's JSON
was 0 bytes (killed mid-write; transcripts through d51 present). Adopted in the main
session: re-ran 14405 post-fix only (exit 0, 1.83 MB JSON, 150d horizon), ran the analyzer
on the postfix dir, determinism proof (14401 re-run byte-identical JSON + 8/8 identical
transcripts), C3 read of all 40 post-fix transcripts, telemetry check, gate, commit,
rebase, merge. Nothing from the dead coordinator was re-judged; the 14405 re-run used the
identical driver + policies. Pre-fix panel numbers below are the dead run's own analysis
(journey-crisis-r180-analysis.txt); post-fix numbers are the completed panel
(postfix/journey-crisis-r180-postfix-analysis.txt).

## Panel (binding)

Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14401–14405, sequential.

- Pre-fix: 14401 114d game-over, 14402 92d game-over, 14403 150d horizon, 14404 78d
  game-over, 14405 126d game-over. Attempts 20, ok 9, refused 11, cleared(remaining0) 2.
- Post-fix: 14401 143d game-over, 14402 93d game-over, 14403 116d game-over, 14404 105d
  game-over, 14405 150d horizon. Attempts 20, ok 14, refused 6, cleared(remaining0) 0.
  gorgeNights 93, gorgeKcal 102,460, convos 40, fabricHits 0, sortieFights 19.
- TRAJECTORY NOTE (metric review): pre/post day counts differ on every seed despite the
  fixes being dialogue-only. Mechanism: the Q3 fix SKIPS voiceLine calls for reframed
  lines, and voiceLine draws from the shared seeded RNG — skipping a draw shifts the
  whole RNG stream, so trajectories diverge from the first reframe onward. The fixes are
  therefore NOT trajectory-neutral. Consequence: pre/post panel comparisons are
  descriptive only; the post-fix panel is judged on its own bars. (The determinism proof
  confirms same-code determinism: 14401 re-run byte-identical.)

## Verdicts vs prereg bars

- C1 (bend not break) GO: 4 game-overs + 1 horizon, 0 softlocks. Causes named: 14401 /
  14402 villages died out (0 alive, pantry 0 — the wild / arena / monster deaths dominate
  the corpse lists); 14403 / 14404 scattered below viability (2 / 1 alive); 14405 reached
  horizon with 6 alive. No siege-mechanic failure.
- C2 GO: raids fire all seeds (13/9/8/8/9); fought resolutions present; D1 snapshots
  20/20, missing 0; deltaBad=[]; D3 drift unknown=[].
- C2b GO: every seed lingererSetFormed with gorge+sorties; no boundary-firable case unfired.
- C3 GO: all 40 transcripts read in full; fabricHits=0; Q3 stacking 0 in live play (20
  reframes + 9 change lines served clean); Q10 0 (no F4 regression); double confession 0
  (r172 guard fired twice, correctly refusing — Ruth d81, Belgin d22); naming-stance
  wobble 0 (stays at 3, no graduation); party-name pick varies (The Unlost / The Company /
  The Firetenders); betrayal beats fire (site / witnesses / press / moot once on 14403).
- WRAP GO: 40/40 marked, 0 unmarked.
- C7b GO: buried lists reported per seed (2,2,1,0,2); corpse-cause counts reported
  (famine / disease / wound / thirst).
- Q1: corrected missed-window 7 (< 8, no instrument look); split valve 5 / drawn 2;
  valve per-day 3 (< 8, no design finding).
- Q2: pharmacy EMPTY 5/5 again (daysWithPharmacy 0, maxPharmacy 0); medicine cures 0;
  ability cures 0–22. Fourth panel with zero medicine acquisitions of any kind — the
  supply-origin finding carries: no reachable medicine source fired in normal play.
  Filed, not fixed here (no preregistered fix plan).
- Q3: GRADUATED + FIXED in-run. 3 recap-stack + 4 ask:lately-stack sightings pre-fix.
  Fixes: conversation.js — reframed recap lines returned unvoiced (a reframe is a
  complete discourse unit); convo-wants.js — topic ack skipped when the beat already
  opens with an ack / change line. Proof tests GREEN (voiceline-stacking 60 serves,
  0 stacked; instruments; fight1-damage). Post-fix panel: 0 stackings in 40 transcripts.
- Q4: CLOSED. Isolation test 4/4 GREEN (vKill 90 fights on; mFlee 90 does not break;
  vFlee 4 breaks; vDie 90 breaks). Live-play confirmation: 14403 d48 fight-1 moderator
  vKill vTaken 82, fought 2, cleared — a cleared fight-1 with vTaken >= 70. No >= 70
  break clause exists; the mechanism is the fight's break line (flee / death).
- Q5: multiMonsterCleared 5/9 (ret.cleared: killed / drove off >= 1 lingerer); full
  set-wipes (remaining 0) 0/14.
- Q6: gorgeAfterIdMatched 0 — seventeenth panel at zero; watch stays open.
- Q7: 0 sightings — stays at 3.
- BENCH: refused 6 — supplyEmpty 3, availabilityDrain 2, gateOneShort 1, other 0. Mixed,
  no single lever (>= 80% not met); majority shape supplyEmpty (3/6); gateOneShort ruled
  out as the lever (1/6; r176's supplyEmpty 6/8 did not hold). Alive-bench refusals 3,
  nodeAway-dominated (18 exclusions).
- Q12: 1/5 horizons (14405); game-overs d93–143.

## Fixes landed (this run)

1. Q3 recap stacking — src/js/conversation.js (+13/−1): reframed recap returned unvoiced.
2. Q3 ack stacking — src/js/convo-wants.js (+15): skip topic ack when beat opens with
   ack / change line.
3. r27 test regex fix — scripts/test-social-r27-recap-repeat-20261019.js.
Proof tests: test-journey-crisis-r180-voiceline-stacking.js (ALL PASS),
test-journey-crisis-r180-fight1-damage.js (4/4),
test-journey-crisis-r180-instruments.js (ALL PASS). All re-run by the adoption, GREEN.
[needs-eyes] — dialogue feel: reframes now land without a doubled opener; worth
listening for in a real conversation.

## Village assessment (plain words)

- 14401 Seattle: 143 days, died out. Maya / Hank / Nina held medic duty in turns; the
  village fought 9 sorties and cleared none fully; by the end the fire was down to
  nobody — the last deaths came in a cluster on d147–153 (monsters and the wild).
- 14402 Boston: 93 days, died out. Raj / Elena / Benigno held medic duty; 5 sorties; the
  village collapsed in a single terrible stretch on d92–94 when nearly everyone left
  died in the wild and the arena.
- 14403 Austin: 116 days, scattered (2 alive). Ifeoluwa held medic duty for 78 days;
  Hector's party fought well (moderator kill at vTaken 82) but Pavel died to the Eater
  on d86 and the village never recovered its footing.
- 14404 Chicago: 105 days, scattered (1 alive, Giulia). Only one medic span all run
  (Qilla, a single day); ability cures 0 — the village fought 2 sorties and faded.
- 14405 Phoenix: 150 days, horizon, 6 alive. Valeria held medic duty from d51 to the
  end; the village survived the full arc — the only seed where a medic held the post
  long-term and the village lived to the horizon.

## People check (C3 read — 40 transcripts, 1446 lines, read in full)

- Conversations have meaning throughout: NPCs want wound care, forage / water help,
  naming, roles, grief, secrets (Giulia's candy bar), answers about the taken (Hector's
  nephew Kevin and the pods), bonded friendship (Deborah). Options engage or deflect;
  endings resolve ("We're square"), plant (the forage promise, the pods promise), or owe
  (unfinished threads named and carried).
- The reframe escalation works as designed: "Still on that debt." → "that debt — that's
  still where we are." → "As I said — we're still on that debt." — clean, no doubling.
- Hector's Kevin thread is the strongest through-line in the panel: asked on d38,
  promised, carried to d46 ("Still nothing on Kevin... the humming"), and the player owes
  the System a question. That promise is still open at the panel's end.
- Camila's d51 teaching chain (Pupunha → Tucumã → Tiger Nut → Cashew) shows the teaching
  system working across a sitting.
- Declining has consequences that land: Camila on the refused water haul — "No, yeah, of
  course. Forget I asked. They won't forget. They'll just stop asking."

## Blanks filled / filed

- FILLED: Q3 stacking (fixed + proven), Q4 (closed as a non-existent clause).
- FILED (instrument): R57 D3 death mismatch, post-fix only (pre-fix: []) — 14403 d86
  Pavel died to the Eater (vDie, vTaken 128), announced in say lines and present in the
  corpse list ("monster"), but the sortie record's deathsDuring is []. The driver's
  deathsDuring doesn't capture a leader's vDie in the sortie record. Not a game defect —
  the death is real, announced, and recorded — but the driver's death capture has a hole
  for leader deaths. File for the driver, not the game.
- FILED (minor): unfinished-thread reminder names the thread by its raw question text
  ("We still owe What season is it here, do you think? a proper ending") — legible but
  clunky. Same class as noted in r176.
- CARRIED: Q2 medicine supply-origin (fourth empty panel); betrayal beats terse by design
  ("The ground remembers." / "Names, named."); Q6 gorge-after id-match watch (17 panels
  at zero).
- CARRIED (metric review): "D2 clear rate ok" (remaining-0 clears) is 0/14 post-fix vs
  2/9 pre-fix — a trajectory artifact of the RNG shift, not a fix effect; the fight-1
  ret.cleared definition (killed / drove off >= 1) is the comparable clear count (5/9
  multi-monster). Pre/post trajectory comparisons are not fix-effect claims while
  voiceLine draws RNG.

## Reachable / fun / winnable

- Reachable: yes — sorties fire on every seed, the gorge / sortie loop is exercised 20
  times, conversations drive 40 sittings.
- Fun: the conversations carry the leg — grief, naming, roles, secrets, and the pods
  promise land; the crisis pressure (pantry 0 on 4/5 seeds, villages dying out) is the
  intended bend-not-break.
- Winnable: 1/5 horizons this panel; the crisis leg bends villages hard and most break.
  The horizon seed (14405) shows the shape of survival: a long-held medic post + a party
  that clears. Not a winnability verdict on its own — the leg's job is pressure, and it
  applies it.

## Proofs / gate / telemetry

- Proof tests: voiceline-stacking ALL PASS; fight1-damage 4/4; instruments ALL PASS
  (re-run by adoption).
- Determinism proof: seed 14401 post-fix re-run — JSON byte-identical, 8/8 transcripts
  identical. Instrument is trajectory-neutral given fixed code.
- Telemetry: quiet (5 files, 3 metrics, no large deviations); baseline NOT rolled
  (single-panel variance).
- Gate: 286 passed, 14 failed in 1950s (check.js --quick, run 12:24–12:57Z on the
  pre-rebase tip). Standing 6: measurement-proof staleness pair
  (test-measurement-proof-update + test-measurement-workflow — src touch re-staled the
  proof; refresh owed as a separate item), mobile-combat-cadence, occupation-panels,
  phone-frame-proof (stale receipt), establishment-r20-fixes (racks-full next-day voice
  expected 2 got 1). Load artifacts (exact 120s, exit null): solo-campaign-endings,
  time-save-crashes, synergy-stall, throttlefeast, capable-bot, table-endings. Adjudication
  (standalone re-runs, after the reconcile gate finished): ALL 8 GREEN — cache-flags 4/4,
  trust-observer-neutrality 6/6, solo-campaign-endings 15/15, time-save-crashes 5/5,
  synergy-stall green, throttlefeast 17/0, capable-bot 42/0, table-endings 61/0. (One
  misfire in the first adjudication pass: solo-campaign-endings was invoked at the wrong
  path scripts/ instead of scripts/godpath/ — MODULE_NOT_FOUND, not a test failure;
  re-run at the correct path is green.) Verdict GO. NOTE: the reconciliation coordinator
  started its own check.js gate at 12:41Z while this gate was running — concurrent gates
  inflated the 120s-timeout class via CPU contention (load avg hit 13+); standalone
  re-runs ran after its gate finished (331/9 in 2040s).
- Metric review: (1) dialogue-only fixes are NOT trajectory-neutral while voiceLine
  draws RNG — pre/post trajectory comparisons are descriptive, never fix-effect claims;
  judge the post-fix panel on its own bars. (2) "D2 clear rate ok" counts remaining-0
  set-wipes, not ret.cleared sorties — the two clear counts differ by definition; report
  both with their definitions.

## Adoption log

- Run timed out ~11:56Z (post-fix 14405 killed mid-write, 0-byte JSON). Adopted in main
  session: 14405 re-run only, analyzer, determinism proof, C3 read, telemetry, gate,
  commit, rebase, merge. Heartbeat landed 12:18:17Z after ~20 min queued behind
  REGISTRY.lock contention (Loop A 1115Z registrations + reaper + reconcile proof);
  re-heartbeated 12:40:05Z and 13:39:09Z. Determinism re-verified by the adoption at
  13:44Z (the /tmp scratch was wiped, so the 14401 re-run was repeated into goal
  evidence determinism-14401/): JSON byte-identical (2,440,509 bytes), 8/8 transcripts
  identical. Lock deleted after cat-verify; rotation-b 6→7. Merge commit recorded in
  the adoption report to the parent agent.
