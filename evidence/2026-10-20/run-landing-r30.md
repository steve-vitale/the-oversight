# Journey LANDING r30 — run note (2026-10-20, run_id 2026-10-20T03:43:26Z-playtest-a)

## Pre-registration (§14 — binding; a miss is NO-GO, never re-scored mid-run)
Full text in `scripts/journey-landing-r30-20261020.js` header.
- **Leg question:** does the landing leg stay GREEN on tip f83c41ea6 with the
  dialogue-system commits landed since r29's base (6593bb9b3)? Landing-window
  exposure: 6c93eb9e9 (r29 comfort-pool fix — direct), 1fb6b9140 (r31
  recap/silence wrap fixes — conversation.js/convo-mood.js), 09123a854 (r22
  player-facing copy repair — display layer), b57b21f28 (phone/combat
  reconciliation), b624ba50d (r18 contest-gossip seed — window edge).
- **Binding gates:** V1'' autonomy ≥3/4; V2 ≥40% kcal draw ≥3 seeds; V3 ≥1
  tie/seed; V4' ≥8 transcripts + 0 fabric-history + 0 near-dupes + probe gate
  (≥1 natural mourning/seek_taken/seek_comfort OR probe documented
  deathless); V5' water fills>0+boils>0, 0 mislabels, ≥6 names pre-System;
  V6 alive day 14; WILD HAUL ARC ≥1 natural arc/4 seeds; DAY-FREEZE 0
  stranded; OPEN BOOK conditional; BEAT-IDENTITY WILD sense-read if fired;
  R29 SETTLE-SPEAK (standing): ≥1 natural favor-gratitude sense-read or
  document absence; R30 COPY-REPAIR: 0 literal "<redacted>" display
  artifacts; R30 RECAP-SILENCE: no verbatim recap wraps / silence
  alternations in the wild (document fire counts); R30 LURE-CORRECTION: see
  blank-filled; TAKING-KIN (watch): takingLines counts/seed.
- **Seeds:** 116, 117 (pilot), 118, 119 (main); probe 115 (REPEAT_SIT=1,
  MOURN_PROBE=1). Policy: competent, PINNED (r14–r29 continuity). Horizon
  14d, death-aware. Bulk evidence:
  `hidden_files/evidence/2026-10-20/landing-r30/`.

## Pilot verdict
Seeds 116, 117: GREEN across V1''–V6 (pop 10/12 both, self-sufficiency
0.927/1.03, trust≥40 pairs 3/8, water fills 5/9 + boils 15/17, systemDay 9/8,
0 death mislabels, 11–12 names pre-System). Wild-haul arc fired on the pilot
(Oliver → Diana nightlight tasting). Pilot expanded per §9.

## Main verdicts (binding metrics — no re-scoring)
- V1'' autonomy — GO 5/5 (4 fresh + probe). 0 v1pp fails; hunger>90 = 0
  villager-days on all seeds.
- V2 work — GO 5/5. Self-sufficiency 0.927 / 1.03 / 1.167 / 1.003 / 0.944
  (bar 0.40); effort 0.99–1.024.
- V3 structure — GO 5/5. Trust≥40 pairs: 3, 8, 5, 3, 1 (probe thin but ≥1);
  favor instances 1/1/0/1/1; 0 moots in-window (trust-pair gate carries it,
  same as r27–r29).
- V4' people — GO. 8 transcripts sense-read in full; 0 fabric-history, 0
  verbatim repeats, 0 near-dupes, 0 "I just said", 0 phantom Mara, 0
  comma/punct stutters across 51 sittings. Probe gate PASSES naturally:
  seek_comfort fired 3× unprompted (116 d7 Omar, 116 d9, 119 d12 Daniyar);
  probe seed 115 documented deathless (no villager deaths; repeatSitTaken=11,
  mournProbed never armed).
- V5' regression — GO 5/5. Water fills 4–9 + boils 15–17 per seed; 0 death
  mislabels; 11–12 social names pre-System per seed.
- V6 winnable — GO 5/5. Villages alive day 14 (pop 10/10/12/11/12; combat
  deaths only — villagers killing real monsters and sometimes dying).
- WILD HAUL ARC — GO, strongest yet. 116: Oliver nightlight haul → Diana
  tasting reveal. 118: THREE arcs, all tested by Addison (hummice d9,
  cliffhanger d12, hushwolf d13). 119: hummice d9 → Daniyar tasting. The
  cautious-tasting ritual ("Look, smell, touch — then the smallest taste,
  and wait… 'It's food,' X tells the fire. 'You know it in your gut.
  Literally.'") is the leg's most reliable sense-strong beat.
- DAY-FREEZE — GO. 0 stranded-AI-turn fights; all 5 seeds ran to day 14.
- OPEN BOOK — GO (conditional/vacuous). No scholar deaths on 115–119;
  mantle log empty; nothing to name.
- BEAT-IDENTITY WILD — no spoil mutters or devotion beats fired in-window
  this run; nothing to sense-read (r26 saw one; variance).
- R29 SETTLE-SPEAK — GO. Two natural favor-gratitude beats sense-read
  (115 d5 + d12, Rebecca): "You came through on the creek water run. I
  won't forget it." — gratitude SPOKE before the state flipped; the player
  deflected and Rebecca held the debt honestly ("...Fine. But I don't
  like owing." / "Right. Forget it." — debts unpaid just sit there). No
  silent settle.
- R30 COPY-REPAIR — GO. 0 literal "<redacted>" artifacts in all landing
  transcript text (5 seeds; regex over the full narration stream). The
  r22 display-layer repair holds; no new write-path corruption.
- R30 RECAP-SILENCE — GO (documented absence). recap picked 0×, silence
  picked 0× across 51 transcripts with the pinned driver — the r31
  count-aware fixes cannot fire in-window under this driver. The V4'
  verbatim/near-dupe sub-gate covers the class in the wild (0 flags).
  The fixes' proofs stand on the r31 unit tests.
- R30 LURE-CORRECTION — see "Blank filled".
- TAKING-KIN (watch) — takingLines = 0 on all 5 seeds (villager-side and
  System-side; the System's day-8 boring-half beat — did it fire? systemDay
  8/9 on all seeds, but 0 takingLines. The day-8 System contact fired
  (systemDay recorded), yet the TAKING_RE scan caught nothing. Either the
  boring-half beat didn't fire in these runs or the scan's patterns miss
  its wording. Carried as a watch item with a sharper question: does the
  System's Taking beat fire at all in the landing window, and do villagers
  ever reference the taken unprompted? r27 noted 0/5; r30 confirms 0/5
  more. Worth a targeted instrument pass next run — NOT a game change
  until the firing facts are in.)
- Telemetry vs landing baseline: quiet, no LOUD lines (5 census files;
  systemDay/deaths/folTelemetry.fires/starvAutopsies).

## Village assessment (plain words)
Five villages, fourteen days. Nobody starved; water was boiled early
everywhere (15–17 boils per seed — the cistern rhythm is the fortnight's
metronome). Villages fed themselves at 0.94–1.17 self-sufficiency while
fighting real monsters: hummice, cliffhangers, drumbelly tanuki, hushwolves,
a nevermore — villagers killed 10+ and buried their own (two unnamed dead
on 116, hummice kills on 117). The wild fed the curious twice over: four
monster carcasses became pantry flesh, and three villagers — Diana, Addison
(×3), Daniyar — did the cautious tasting ritual and taught the fire.
Trust concentrates on quiet pairs (Gianna 56, Pavel 57, Hassan 56, Liam
51); favors move through kept promises (4 kept, 1 broken — Somchai's wound,
"Promises rot. (-15 trust)"). The System arrived day 8–9 every seed.
Rebecca (trust 92 by d12) is the fortnight's social center of gravity on
the probe seed. What is missing: nothing structural in-window. The Taking
is the one silence — half of everyone's family, and nobody mentions it in
14 days on these seeds (watch item, not a verdict).

## People check (sense-read highlights)
- Valeria (116 d10, curious + lure): the NPC spoke the trap-line invite as
  a second opener beat (engine-transcript-proven), the menu quoted it
  verbatim, the player declined ("Another time, then." — acknowledged).
  Gossip with teeth (Roman walking away), an honest wind-down ("Anyway. I
  should get back to it."), then the naming debate: "Mister Never"
  (Grayson, Hassan) vs "The Reverend" (Liam, Roman, Vasyl) vs "Old Croaker"
  (Iván, Omar) — real attributions, player's vote asked.
- Omar (116 d7, seek_comfort): opener on the taken ("Have you — sorry. I
  keep thinking about them."). Seven comfort turns, ALL DISTINCT — the r29
  pool fix (2→6) holds in the wild. Closes honest: "Well. My social
  battery is officially dead." Then tellbeast + namebeast — the debate
  includes the player's own earlier suggestion ("Loud-Eyes" (you)).
- Daniyar (119 d12, seek_comfort): the player walked away immediately;
  Daniyar named it — "Sorry. I need a minute." Unestablished, not a stall.
  Deflection has a cost.
- Rebecca (115 d5 + d12, repay): settle-on-speak in the wild twice —
  gratitude spoken, debt held on deflection, distinct lines per sitting
  ("creek water run" vs "pantry run"). "Good. Then we're square." repeats
  as a signature beat at the same stage — acceptable, not a parrot.
- Qiuyue (118 d9, curious): "I wonder if Chengdu, China looks like this
  now. Empty. Quiet. Or if it's worse there." The player fed generic
  reactions and the conversation honestly ran out of gas ("That's...
  pretty much all of it, honestly."). Not a stall — a person with one
  thing on her mind.
- Daniyar (117 d5, curious + lure): "So what's your plan here? Just... get
  through it?" → "Honest. I can work with honest." Lure declined cleanly.
  Close: "I'll be here if you need. No rush, ever."
- Benoit (118 d12, curious): "Have you ever hurt someone? Since all this
  started." The player answered honestly, withheld details; Benoit honored
  the boundary. Hard questions with stakes, handled like people.

## Blank filled or documented
- FILLED — R30 LURE-CORRECTION (instrument + doctrine): the r27–r29
  "lure:SPOKEN menu-label false-positive" diagnosis was WRONG, and this
  run nearly shipped a "fix" that inverted the instrument. Sequence:
  (1) pre-fix pilot: lureSpoken=5/5; (2) I "fixed" the scan to drop themT
  (theory: menu labels contaminated it) → lureSpoken=0/5, lureSilent=5/5;
  (3) root-cause probe (plant pending invite → startConvo → dump engine
  transcript): the inviteBeat IS spoken as a second opener beat and lands
  in the transcript as {who:'them'} — the pre-fix scan matched that
  genuine beat (TRUE positive); menu labels are NEVER pushed to the
  transcript (no transcript.push site pushes choice labels), so the
  menu-label theory was impossible; the harness's THEM: log just doesn't
  print second beats (sayThem only logs r0.line) — that logging gap made
  the spoken beat invisible and created the misdiagnosis; (4) REVERTED the
  "fix" same-run → lureSpoken back to 5/5. The instrument was right all
  along; the lure path is healthy (invite spoken as second beat, menu
  quotes verbatim — INVITATION HONESTY holds in the wild). Documented
  in-code so no future run re-"fixes" it. Lesson: an instrument that
  disagrees with the log stream is not necessarily wrong — check the data
  flow before "fixing" the instrument.
- FILLED — TAKING word-boundary (instrument): TAKING_SYS_MARK_RE's /NAPPING/i
  matched "snapping" (turtle) — "Movement — a snapping turtle the size of a
  manhole cover." counted as a System Taking line. Fix: \b word boundaries
  on the NAPPING/napping alternatives in both TAKING_RE and
  TAKING_SYS_MARK_RE. Validated: takingLines 1→0, takingSystemLines 1→0 on
  the pilot pair re-run.
- DOCUMENTED (not fixed): TAKING-KIN silence — 0 takingLines on 5/5 seeds
  (now 0/10 across r27+r30). Sharpened question for next run: does the
  System's boring-half beat fire at all in-window, and do villagers ever
  reference the taken unprompted? Instrument pass first, no game change.
- DOCUMENTED (not fixed): the harness THEM: log stream doesn't print
  second opener beats (inviteBeat, drift notes, bond beats) — sayThem only
  logs r0.line. Cosmetic (the game UI shows them via the transcript), but
  it misled three runs' worth of instrument diagnosis. Named next: log
  second beats in the harness (small scripts-only change).

## Metric review
- V4' probe gate — 3 natural seek_comfort fires on the pinned-driver
  seeds (116 d7, 116 d9, 119 d12), so the gate passes WITHOUT the probe
  arm this run. The probe seed (115, REPEAT_SIT=1, MOURN_PROBE=1) still
  pulled its weight: 11 repeat sittings, 2 repay beats, 4 ask_favor —
  and documented deathless (no villager deaths → mournProbed never armed,
  correctly).
- R30 RECAP-SILENCE — pre-registered as "document fire counts"; 0/0 is
  the honest outcome under the pinned driver, not a metric failure. The
  r31 fixes' wild proof will need a driver that actually picks recap or
  sits in silence — a future run's design, not a re-score of this one.
- TAKING-KIN — watch item by design (no bar). 0/5 is data, not a miss.
- No metric re-scored mid-run. The lure "fix" was reverted, not re-scored.

## reachable / fun / winnable
- REACHABLE: yes — System contact day 8–9 on all seeds; favors, the
  wild-haul arc (4 arcs), namebeast debates, grief beats all fired
  unprompted. The invite→menu→decline loop works end-to-end.
- FUN: yes — promises kept and broken with faces, grief lands, villagers
  kill real monsters and teach the fire what the meat is. Benoit's
  question ("Have you ever hurt someone?") is the kind of moment the leg
  exists for.
- WINNABLE: yes for the leg — 5/5 villages alive, fed, and producing at
  day 14.

## Infra incidents
- LOCK DELETED MID-RUN (~05:35Z): the playtest-loop.lock vanished and the
  background heartbeat loop had died, leaving the registry heartbeat 27.8
  min stale. Per the overlap guard, a subsequent lane-A run could have
  declared this run dead and started a duplicate. Verified no duplicate
  started (rotation still 0, no second journey-landing tree, no r30 evidence
  in the main tree). Lock re-created with the original run_id; heartbeat
  loop restarted. Root cause of the heartbeat-loop death unknown (possible
  service flap); the lock deleter unidentified (ship loop ran 05:25Z —
  suspect, not proven). Standing lesson holds: the heartbeat loop is
  load-bearing; monitor it, don't just start it.
- CONCURRENT JEST: lane B (journey2-7) started its own check.js --quick at
  ~05:28Z while this run's was in flight. Both progressed (no deadlock);
  treat any failure in either run as suspect-concurrency and re-verify
  serially per AGENTS.md.

## Ops
- Harness: scripts/journey-landing-r30-20261020.js (new; r29 driver +
  tip bumped to f83c41ea6, r30 pre-registration, seeds 116–119 + probe
  115) + scripts/journey-landing-r30-analyze.js (copied from r29,
  generic).
- Instrument changes (scripts-only, zero src/js): TAKING word-boundary
  fix; redactedArtifacts scan (init 0); lure scan REVERTED to original
  after probe disproved the fix theory. No game-code changes this run.
- Proof of instrument correctness: pilot-pair re-run comparisons —
  lureSpoken 5→0→5 across the three harness states; takingLines 1→0.
  Probe script /tmp/probe-lure2.js (planted-invite → startConvo →
  transcript dump) — ephemeral, not committed.
- Regression: node scripts/check.js --quick — PENDING (run before commit).
- Telemetry vs landing baseline: quiet (no LOUD lines).
- Rotation: journey-rotation-a.txt 0→1 after landing (next: establishment).
