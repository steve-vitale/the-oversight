# Journey LANDING r29 — run note (2026-10-19, run_id 2026-10-19T22:43:34Z)

## Pre-registration (§14 — binding; a miss is NO-GO, never re-scored mid-run)
- **Leg question:** does the LANDING leg stay GREEN on tip 6593bb9b3
  with the conversation-system commits landed since r28's base
  (e035f8e44)? Landed since, with landing-window exposure:
  - 6593bb9b3 journey-succession r28 (lane B): settle-on-speak — favor
    gratitude settles onSurfaced (spoken), not at line-compute; resolve
    replants a repay seed when the no-repeat ledger blocks. EXPOSED:
    favor gratitude beats fire in the landing window (r28: favors on
    2/4 seeds).
  - e374e9a3a journey-social r27 (lane B): 4 dialogue-truth fixes
    (recap/wounds/press/lapse) in conversation.js + betrayal.js.
    EXPOSED: shared conversation code; the landing window is
    dialogue-dense.
  - 25bc4be5d journey-establishment r16: reactive menu-cap hole fix
    (15-choice hybrid) in villager-agency.js. EXPOSED: agency menus
    fire from day 1.
  - f35c96129 journey-landing r28: gossip walk-down — landed by r28;
    regression-checked this run via the V4' near-dupe sub-gate.
  - 270b8f3c3 journey-crisis r30 (lane B): havenRaidTick returns the
    fight record (game.js, caller-compatible) + defender-aloud beat.
    NOT landing-window (raids post-date the leg) — cited only.
  - sim-lever diagnostics (killaudit-b2, seasonblock, recourt,
    diphold, switchtime, wireacquire, trapvoice, snarecatch,
    presence2): instruments + evidence only, zero src/js changes.
- **Interesting / GO gates (binding):** V1'' autonomy GO on ≥3/4 seeds;
  V2 work ≥40% kcal draw on ≥3 seeds; V3 ≥1 social tie/seed; V4' ≥8
  transcripts sense-read + 0 fabric-history + 0 within-convo near-dupes
  + probe gate (≥1 natural (mourning|seek_taken|seek_comfort) OR probe
  seed arm); V5' water fills>0+boils>0/seed, 0 death mislabels, ≥6
  names pre-System; V6 villages alive day 14; WILD HAUL ARC ≥1 natural
  arc/4 seeds; DAY-FREEZE 0 stranded fights; OPEN BOOK (conditional);
  BEAT-IDENTITY WILD (sense-read if fired); R29 SETTLE-SPEAK (new): ≥1
  natural favor-gratitude beat sense-read (the 6593bb9b3 path —
  gratitude must speak before the favor flips; no silent settle), or
  document the absence; R28 WILD (retired): gossipThreadOffered
  instrument stays (0 expected); ASK-GOSSIP (retired): cite unit proof.
- **Seeds:** 105, 106 (pilot), 107, 108 (main); probe seed 100
  (REPEAT_SIT=1, MOURN_PROBE=1). Policy: competent, PINNED
  (r14–r29 continuity). Horizon 14d, death-aware. Bulk evidence in
  hidden_files/evidence/2026-10-19/landing-r29/.
- **Substrate checklist (§14b):** sim-harness.loadGame({seed}) seeded
  before eval; node-only; one process per seed; harness asserts its
  own instrumentation; Game.js untouched by the worker; sense-reads by
  a human (this worker) reading full transcripts.
- **Canon read:** CANON.md (reread); KNOWLEDGE.md; DISEASES.md;
  PRESERVATION.md; CONVERSATIONS.md; PARTY.md; DIRECTIVES.md. No new
  canon invented.

## Pilot verdict
- Seeds 105, 106: GREEN across V1''–V6 (pop 12/12, self-sufficiency
  0.998–1.079, trust≥40 pairs 3 and 6, water fills 4 + boils 16 each,
  systemDay 8 both, 0 deaths mislabeled, 12 names pre-System).
  WILD HAUL ARC absent on the pilot pair (0 hauls seen) — acceptable,
  the gate is ≥1 across 4. Pilot expanded to 107, 108 per §9.

## Main verdicts (binding metrics — no re-scoring)
- V1'' autonomy — GO 4/4. 0 v1pp fails; hungerOver90Frac 0 on all seeds.
- V2 work — GO 4/4. Self-sufficiency 0.998 / 1.079 / 1.088 / 0.935
  (bar 0.40); effort 0.995–1.024.
- V3 structure — GO 4/4. Trust≥40 pairs: 3 (Ming 77, Rebecca 50,
  David 55), 6 (Sergio 80, Logan 50, Gertrude 42, Sofia 51, Vasyl 41,
  Hannah 53), 5 (Noah 41, Michel 49, Nathan 55, Lucas 67, Nikolai 49),
  3 (Rowan 90, Rosa 50, Boris 60); favor instances 2/1/2/1; 0 moots
  in-window (the trust-pair gate carries it, same as r27/r28).
- V4' people — 8 transcripts sense-read in full; 0 fabric-history
  flags; 0 within-conversation near-dupes (the r28 gossip walk-down
  holds in the wild — no verbatim re-serves). Probe gate PASSES via
  the probe arm (see metric review).
- V5' regression — GO 4/4. Water fills 4/4/3/4 + boils 16/16/15/16
  per seed; 0 death mislabels; 12 social names pre-System per seed.
- V6 winnable — GO 4/4. Villages alive at day 14 (pop 12/12/11/12;
  107 lost one unnamed villager to a monster d7, honestly labeled).
- WILD HAUL ARC — GO, stronger than r28. 107: sunback killed d11
  (expedition) → unknown flesh in pantry → Noah tests d14: "Noah sets
  aside time with Sunback flesh. Look, smell, touch — then the
  smallest taste, and wait. An hour passes. Calm stomach. Another
  hour. Nothing. 'It's food,' Noah tells the fire. 'You know it in
  your gut. Literally.' The Codex notes it." 108: white_noise_heron
  d11 → Rosa tests d14 → same reveal. (The kill-site haul line fired
  out of player presence both times — same as r28's 101 Sofia; the
  deposit + experiment + reveal beats are sense-read strong.)
- DAY-FREEZE — GO. 0 stranded-AI-turn fights; all 4 seeds ran to day 14.
- OPEN BOOK — GO (conditional). No scholar deaths on 105–108. The
  probe seed did better than the gate: Esperanza died d13 (combat),
  the mantle passed to Wolfgang, and Natalie's inherited-thread
  resume named the dead honestly (see people check).
- BEAT-IDENTITY WILD — no spoil mutters or devotion beats fired
  in-window this run; nothing to sense-read (r26 saw one; variance).
- R29 SETTLE-SPEAK — GO. Probe seed 100 d6 (repay, fromSeed): "You
  came through on the pantry run. I won't forget it." — the favor
  gratitude SPOKE in-conversation before the state flipped; the
  player then deflected follow-through and Natalie held the debt on
  her face ("...Fine. But I don't like owing."). No silent settle.
- R28 WILD (retired) — gossipThreadOffered = 0 on all 4 seeds, as
  expected with the pinned driver.
- ASK-GOSSIP (retired) — vacuous in the wild (ask:gossip never
  appears with the pinned driver — pre-existing); the shared path
  stands on the unit proofs.
- Telemetry vs landing baseline: quiet, no LOUD lines (4 census
  files; systemDay/deaths/folTelemetry.fires/starvAutopsies).

## Village assessment (plain words)
Four villages, fourteen days, and the fortnight's shape holds: nobody
starved, water was boiled early everywhere (15–16 boils per seed), and
the villages fed themselves at self-sufficiency 0.94–1.09. The wild
fed the curious: two monster kills became pantry flesh, and two
villagers — Noah, Rosa — did the cautious tasting ritual and taught
the fire what they'd learned ("You know it in your gut. Literally.").
Trust concentrates on the quiet pairs (Rowan 90, Sergio 80, Ming 77,
Lucas 67) while favors move through kept promises — David's "forage
with me tomorrow" to rebuild the pantry, kept-word lines catching
eyes across the fire. The System arrived day 8 on every seed. One
village (107) buried an unnamed villager killed by a monster on day 7
and kept working. What is missing: nothing structural in-window. The
grief beats want repeat sittings the pinned driver never gives them —
they fired beautifully on the probe seed instead (see below), so the
machinery is healthy; the driver is the bottleneck.

## People check (sense-read highlights)
- Natalie (100 d14, seek_comfort): the day after Esperanza's death.
  "Can I just say — They'd tell me to keep working. So I'm working.
  That's the whole plan." Four comfort turns, each distinct —
  "I'll get there. Just needed a minute where I didn't have to be
  fine." → "Talk to me a bit. That helps more than anything." →
  "You're kind. Don't let this place change that." → "Heh. Nobody's
  asked me that in a while. ...I'm alright. Getting there." — then
  the honest close: "Alright — I should get back to it." Grief with a
  named dead, the mantle honored, no filler. The strongest
  landing-window beat this run.
- Natalie (100 d13, seek_comfort + inherited resume): the resume
  opener fired ahead of the want — "Esperanza and I never finished
  talking about that personal stuff — we left it mid-thought, 2 days
  back. You're wearing Esperanza's shoes now — want to pick it up?"
  Read cold this looks like a self-reference bug (the player spawned
  as Esperanza), but the mantle passed d13: the current Bearer <redacted>
  Wolfgang, and the thread was planted with Esperanza. The
  ledger stamped inh='Esperanza' at the death, inheritedName resolved
  it, and the line is exactly right. Verified against ledger.js:1154
  and the d13 mantle record — not a bug, the system working.
- Natalie (100 d6, repay): the settle-on-speak path in the wild —
  gratitude spoken, debt held honestly when the player deflected.
- David (105 d12, ask_favor): "The pantry's nearly bare. Come forage
  with me tomorrow — two of us can fill packs." Specific, grounded
  ("the meadow edge, west of the creek"), commit → promised, closes
  "This stays between us, right? Right." A person asking for help.
- Michel (107 d8) / Yerlan (107 d9, curious): betrayal lures declined
  cleanly ("Right — another time." / "Fair enough. Rain check.").
  The lure:SPOKEN instrument flag fired on both — the known r27/r28
  false-positive (menu-label scan; instrument-only, queued fix
  unchanged).
- Jorge (105 d10, curious): the player fed it only generic reactions
  and the conversation honestly wound down ("That's... pretty much
  all of it, honestly." → "Anyway." → "So."). Not a stall — a
  conversation that ran out of gas because the player gave nothing.
- Strangers (105 d1): short, want-driven, coherent.

## Blank filled or documented
- FILLED — COMFORT POOL DEPTH (content): the r27/r28-documented
  candidate. The seek_comfort engage pool was 2 lines, so a
  multi-turn comfort exchange cycled verbatim (A,B,A,B — the R18
  3-turn memory window cannot save a 2-pool: keep = pool.length-1 =
  1). Fix: engage pool 2→6, opener pool 2→4, same spare physical
  register ("My hands stopped shaking. That's — that's something.";
  "Saying it out loud makes it smaller. Still there. Smaller.").
  Proof: scripts/test-comfort-pool-depth-20261019.js — RED on
  pre-fix (verbatim alternation fails both the R18-window and
  pool-depth bars), GREEN 8/8 post-fix.
- DOCUMENTED (not fixed): the lure spoken/gestured instrument
  false-positive on betrayal menu labels — instrument-only, no game
  behavior; queued fix unchanged (scan THEM lines only).
- DOCUMENTED (not fixed): the wild-haul kill-site line fires out of
  player presence (haul unrecorded when the player isn't there) —
  same as r28; the deposit/experiment/reveal beats carry the arc.

## Metric review
- V4' probe gate — 0 natural (mourning|seek_taken|seek_comfort) fires
  on the 4 pinned-driver seeds. Mechanism, verified in code: the
  pinned driver never repeats sittings and never picks the mourning
  option; seek_taken's natural path needs curious-exhaustion on a
  repeat sitting (the STRANDED-WANT GUARD zeroes curious only when
  canOpen fails — with 11 villagers × 1 sitting each, curious never
  exhausts, and the first-meeting floor holds it at ≥3 vs seek_taken's
  2). None of the landed commits touched want selection
  (e374e9a3a: recap/lapse line fixes only; 6593bb9b3: favor-gratitude
  settle only; 25bc4be5d: menu caps only — diff-verified). The probe
  arm fired seek_comfort 2× naturally on repeat sittings and the
  favor-gratitude beat; the mourning beat is unit-proof-covered
  (test-mourning-name-r8.js). Verdict: driver-policy variance, not a
  game regression. Recorded as a qualified pass via the probe arm —
  not re-scored.
- The probe seed doubled as a mantle stress test: scholar death d13,
  mantle → Wolfgang, inherited thread resumed honestly, grief beats
  fired for the named dead. The village-as-protagonist continuity
  held under the exact conditions it was built for.
- No metric re-scored mid-run.

## reachable / fun / winnable
- REACHABLE: yes — System contact day 8 on all seeds; favors, the
  wild-haul arc, namebeast debates, and grief beats all fired
  unprompted (the grief beats need repeat sittings — a real player
  behavior the pinned driver skips).
- FUN: yes — promises kept, grief lands, villagers kill real monsters
  and teach the fire what the meat is.
- WINNABLE: yes for the leg — 4/4 villages alive, fed, and producing
  at day 14.

## Ops
- Harness: scripts/journey-landing-r29-20261019.js (new; r28 driver +
  tip bumped to 6593bb9b3, r29 pre-registration, probe seed 100) +
  scripts/journey-landing-r29-analyze.js.
- Fix: src/js/convo-wants.js (comfort pool 2→6 engage / 2→4 opener).
- Proofs: scripts/test-comfort-pool-depth-20261019.js (new, 8/8,
  RED-verified); gossip walkdown 11/11, gossip resume 12/12,
  settle-on-speak 13/13 (regression, all green).
- Regression: node scripts/check.js --quick — 96 passed, 0 failed.
- Infrastructure notes: (1) `git pull --ff-only` failed — local
  master and origin/master diverged from the 17:51 UTC ship base:
  origin carries the ship loop's 5 reconciled phone/combat commits
  (13:40 CDT push), local carries 22 loop landings since. No history
  rewrite; the ship loop owns push reconciliation — reported, not
  touched. (2) The standing 10-minute heartbeat loop ran for the
  whole run; lock/registry run_ids agreed (WT_RUN_ID set at
  registration).
- Rotation: journey-rotation-a.txt 0→1 after landing.
