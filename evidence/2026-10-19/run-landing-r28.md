# Journey LANDING r28 — run note (2026-10-19, run_id 2026-10-19T18:55:00Z)

## Pre-registration (§14 — binding; a miss is NO-GO, never re-scored mid-run)
- **Leg question:** does the LANDING leg stay GREEN on tip e035f8e44
  with the commits landed since r27's base (dd749bfee, ~10:01 CDT)?
  Landed since: e035f8e44 journey-scale r13 (refuse-demands + layered-arm
  conversation transcripts — lane A leg 3, out of the landing window),
  2d0144950 journey-scale r13 belong-road/table-approach (out of
  window), be6ddad65 sim-wirebootstrap-b2 (killed at pilot, instruments
  only), 4fa442c3c journey-endgame r23 (wire arenaAct broadcast
  consequences into contest choices — endgame surface, no day ≤14
  exposure), 7bc41c35e sim-huntfix-reapply-b2 (panel archives +
  63-line hunt-detector wiring fix, KILLED-at-pilot lineage; 2
  guardrail misses flagged loud on ITS run: starvation +4 one pair,
  median survival −24d — #642; possible landing-window food-finding
  exposure through hunt staffing).
- **Interesting / GO gates (binding):** V1'' autonomy GO on ≥3/4 seeds;
  V2 work ≥40% kcal draw on ≥3 seeds; V3 ≥1 social tie/seed; V4' ≥8
  transcripts sense-read + 0 fabric-history + 0 within-convo near-dupes
  + probe gate (≥1 natural (mourning|seek_taken|seek_comfort) OR probe
  seed documented deathless); V5' water fills>0+boils>0/seed, 0 death
  mislabels, ≥6 names pre-System; V6 villages alive day 14; WILD HAUL
  ARC ≥1 natural arc/4 seeds; DAY-FREEZE 0 stranded fights; OPEN BOOK
  (conditional); BEAT-IDENTITY WILD (sense-read if fired); R28 WILD:
  document gossipThreadOffered counts (0 expected with the pinned
  driver; the in-wild proof stands on leg-5 r28 + unit proof
  scripts/test-gossip-resume-beat-20261019.js — per r27 metric review
  the wild arm was unreachable-by-construction; cite, don't re-run);
  ASK-GOSSIP: cite the unit proof for the shared path (vacuous in the
  wild — ask:gossip never appears with the pinned driver, pre-existing).
- **Seeds:** 101, 102 (pilot), 103, 104 (main). Policy: competent,
  PINNED (r14–r28 continuity; r27 resume-priority instrument dropped —
  R28 WILD arm retired by the r27 metric review). Horizon 14d,
  death-aware. Bulk evidence in
  hidden_files/evidence/2026-10-19/landing-r28/.
- **Substrate checklist (§14b):** sim-harness.loadGame({seed}) seeded
  before eval; node-only; one process per seed; harness asserts its
  own instrumentation; Game.js untouched by the worker; sense-reads by
  a human (this worker) reading full transcripts.

## Pilot verdict
- Seeds 101, 102: GREEN across V1''–V6 (pop 12/12, self-sufficiency
  1.02–1.14, trust≥40 pairs on both, water fills 4 + boils 16 each,
  systemDay 8 both, 0 deaths mislabeled, 12 names pre-System).
  WILD HAUL ARC present (102: white_noise_heron haul → deposit → Liam
  tests → reveal). Pilot expanded to 103, 104 per §9.

## Main verdicts (binding metrics — no re-scoring)
- V1'' autonomy — GO 4/4. 0 v1pp fails; hunger>90 = 0 villager-readings
  everywhere (hungerOver90Frac 0 on all seeds).
- V2 work — GO 4/4. Self-sufficiency 0.98–1.14 (bar 0.40); effort
  0.97–1.0.
- V3 structure — GO 4/4. Trust≥40 pairs: 3, 3, 3, 2 (Willie 61, Aurora
  40, Sofia 44 / Marisol 64, Liam 68, Sanne 57 / Courtney 40, Luke 47,
  Arturo 43 / Salvatore 67, Jayden 42); favor instances on 102, 104;
  0 moots in-window (variance vs r26's 2/4 — the trust-pair gate
  carries it, same as r27).
- V4' people — 10 transcripts sense-read in full; 0 fabric-history
  flags, 0 verbatim repeats; probe gate PASSES (see below). The
  near-dupe sub-gate MISSED (1 — recorded in metric review with the
  fix); all other sub-gates GO. Probe gate PASSES: seek_taken fired
  naturally on 101 (Josefine d9: "About what happened to my taken
  kin — ...about Henrik?"), 102 (Rami d10: "Have you heard anything?
  About the taken. The pods. Anything at all."), 104; seek_comfort
  fired on 103 (Arturo d10: "We gave them a good burial. Doesn't
  feel like enough, does it?").
- V5' regression — GO 4/4. Water fills 4–7 + boils 15–16 per seed;
  0 death mislabels; 12 social names pre-System per seed.
- V6 winnable — GO 4/4. Villages alive at day 14 (pop 11–12).
- WILD HAUL ARC — GO. 2/4 seeds: 102 white_noise_heron (haul → Liam
  "Don't know what this is. Someone at the fire will — or we'll learn
  the hard way." → pantry deposit → cautious test → "It's food, Liam
  tells the fire"); 104 hummice d6 tested by Gamal; 101 Sofia
  experimented ducks_in_a_row flesh → reveal (haul line unrecorded —
  the kill-site line fired out of player presence; the experiment +
  reveal beats are sense-read strong).
- DAY-FREEZE — GO. 0 stranded-AI-turn fights across all seeds
  (no day-freeze instrument hits; all 4 seeds ran to day 14).
- OPEN BOOK — GO (conditional). Mateo d8 sickness → Erin mantle d9
  (103); Jude d11 combat → Hilda mantle d12 (104). 0 scholar favor
  promises open on either (favorInstances 0 on 103; 104's single
  favor instance was villager-to-villager, not the scholar's).
- BEAT-IDENTITY WILD — no spoil mutters or devotion beats fired
  in-window this run; nothing to sense-read (r26 saw one; variance).
- R28 WILD (retired per r27 metric review) — gossipThreadOffered = 0
  on all 4 seeds: the pinned driver never leaves an open gossip thread
  in 14 days. The in-wild proof stands on leg-5 r28 evidence + the
  unit proof (scripts/test-gossip-resume-beat-20261019.js, 12/12 this
  run after the determinism stub — see metric review).
- ASK-GOSSIP (retired per r27 metric review) — cite the unit proof
  for the shared convoGossipBeat path; vacuous in the wild
  (ask:gossip never appears with the pinned driver — pre-existing).
- Telemetry vs landing baseline: quiet, no LOUD lines (4 census
  files, systemDay/deaths/starvAutopsies — exit 0).

## Village assessment (plain words)
Four villages, fourteen days. The fortnight's shape is the same as
r27's but leaner: nobody starved, water was boiled early everywhere
(15–16 boils per seed), and the villages fed themselves at
self-sufficiency 0.98–1.14 while burying their monster kills (12
kills across the seeds: sunbasker, nightcourt, ducks_in_a_row, hummice
×2, white_noise_heron, lockpick_raccoon ×2, murkcap, hushwolf).
Villager knowledge spreads fast: 12 social names pre-System on every
seed, 19–23 known plants in the census rows, fireside lessons passing
identifications around. Trust concentrates on the quiet pairs
(Willie 61, Liam 68, Marisol 64, Salvatore 67) while the loud seeds
build through favors and kept promises (Sanne's "forage with Sanne
tomorrow" — kept, "That meant everything."). The System arrived day 8
every seed. The taken are spoken about by name now — Josefine's
Henrik — and the KIN machinery (takenPromises, podRemember) fires when
the driver commits to asking the System about the pods. Two scholars
died (Mateo, Jude); the mantles passed with names spoken (Erin,
Hilda) and the villages kept working. One villager died to sickness
(a man, maybe 20s, d8) — the disease system touching the landing
window honestly, no mislabels.
What is missing: nothing structural in-window. The comfort pool's
back-to-back verbatim lines (r27's observation) still stands as the
content-expansion candidate — not touched this run; the blank I
filled was behavioral instead (see below).

## People check (sense-read highlights)
- Josefine (101 d9, seek_taken): names her taken kin (Henrik),
  asks the scholar to ask the System about the pods → commit →
  promised. "You'd do that? Ask it? ...Thank you. Really. Even asking
  is more than the silence." Strong — the KIN beat firing as canon
  intends, System never confirming the taken's fate.
- Rami (102 d10, seek_taken): "Have you heard anything? About the
  taken. The pods. Anything at all." → commit → promised. The
  tellbeast/namebeast chain then plays out with real villager
  backers ("Big Big" Valentina vs "Loud-Eyes" Marisol/Rami). Strong.
- Arturo (103 d10, seek_comfort): "We gave them a good burial.
  Doesn't feel like enough, does it?" → five comfort turns, each
  engaging, closing with "Go. But sit with what I said." Grief with
  weight, no filler. Strong.
- Rafael (101 d11, curious → gossip): the gossip chain plays out
  with real stakes (Victor walked away; "The garden listens"),
  namebeast vote with backers. One near-dupe: the same rumor
  re-rendered three times under driver "what else" spam — the
  walk-down fix (this run's blank) addresses it; the re-serve read as
  gossip-cycling ("— anyway.") not a stall.
- Victor (101 d10, ask_favor): sick, fighting it, too proud to accept
  help — "Never mind the sickness I'm fighting — we got it handled."
  The deflection resolves honestly when the player declines. Person.
- Meera (102 d11, ask_favor): same deflection arc, betrayal menu
  declined ("Another time, then." — acknowledged, pocketed). The
  lure:SPOKEN instrument flag fired again — menu-label false-positive
  (r27-documented, instrument-only, unfixed).
- Sofia (101 d5, curious): asks for something funny; the laugh lands;
  then a tellbeast → naming debate with 4 backers. The village
  information network is alive.
- Strangers (101 d1, 102 d1): day-1 sits with unnamed villagers —
  hope/sleep, needing to laugh. Coherent, want-driven, short.

## Blank filled or documented
- FILLED — GOSSIP WALK-DOWN (behavioral): repeated "tell me more"
  on a gossip thread re-served the same rumor verbatim (Rafael d11:
  "Victor just walked away from Haven" ×3 in one sitting — the new
  r28 gossip-thread path had no served-tracking; salience-first always
  picked heard[heard.length-1]). Fix: convoGossipBeat returns the
  gossip entry signature; the conversation accumulates
  c.gossipServedSigs; askAbout takes opts.skipSigs and walks down to
  the freshest UNSERVED item, honestly drying out ("Quiet lately.")
  when all are said. The sigs are PER-SITTING (reset in startConvo,
  like saidLinesConvo) — a resumed thread in a new sitting honestly
  re-delivers its headline gossip, preserving the r28 resume intent.
  Proof: scripts/test-gossip-walkdown-20261019.js — RED on pre-fix
  (beats 2–4 repeat beat1 verbatim), GREEN 11/11 post-fix (three
  distinct beats, honest dry, 3 distinct sigs).
- Regression on the shared path: the r28 resume proof
  (scripts/test-gossip-resume-beat-20261019.js) broke under the fix
  (resume inherited the previous sitting's served sigs and dried out
  on arrival). Root cause: per-vid convo state is persistent, so the
  served ledger had to be scoped per-sitting — the startConvo reset
  fixed it. The same run also exposed the test's own
  nondeterminism (npcGossipAbout 50% / dark-gossip 45% branches made
  the DRY step draw-order dependent); both branches are now stubbed
  in that test — no assertion loosened, 12/12 green.
- DOCUMENTED (not fixed): the comfort pool's back-to-back verbatim
  lines (r27 observation) — a content-expansion candidate for a
  future pass; behavior is correct (cycles, closes naturally).
- DOCUMENTED (not fixed): the lure spoken/gestured instrument
  false-positive on betrayal menu labels — instrument-only, no game
  behavior; r27 already queued the fix (scan THEM lines only).

## Metric review
- V4' near-dupe sub-gate ("0 within-conversation near-dupes"): MISS as
  measured (1 — Rafael d11, seed 101: the same gossip item re-rendered
  3× when the driver asked "what else" four times on a 2-item pool).
  Mechanism: the r28 gossip-thread path (f04363e44, landed since r27)
  had no served-tracking, so salience-first always re-served
  heard[heard.length-1] — a real engine flaw in the leg window, not a
  driver-only artifact. Fixed this run (walk-down + proof test 11/11).
  Recorded as a miss with the fix as the finding — not re-scored.
  All other V4' sub-gates GO (0 fabric-history, 0 verbatim repeats,
  probe gate passes, ≥8 transcripts sense-read).
- R28 WILD / ASK-GOSSIP wild arms retired per r27's metric review —
  the instrument (gossipThreadOffered=0, 4/4 seeds) stands in their
  place.
- No metric re-scored mid-run.

## reachable / fun / winnable
- REACHABLE: yes — the System contact fired day 8 on all seeds and
  reads as first contact; favors, grief beats, seek_taken commits,
  the wild-haul arc, and namebeast debates all fired unprompted.
- FUN: yes — promises kept, grief lands, the d8 mantled village kept
  producing, villagers kill real monsters and test the meat
  ("You know it in your gut. Literally.").
- WINNABLE: yes for the leg — 4/4 villages alive, fed, and producing
  at day 14.

## Ops
- Harness: scripts/journey-landing-r28-20261019.js (new; r27 driver +
  tip bumped to e035f8e44, R28-wild arms retired per r27 metric review).
- Fix: src/js/game.js + src/js/conversation.js (gossip walk-down).
- Proofs: scripts/test-gossip-walkdown-20261019.js (new, 11/11);
  scripts/test-gossip-resume-beat-20261019.js (determinism stub, 12/12).
- No game-code changes yet.
