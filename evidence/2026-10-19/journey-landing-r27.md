# Journey LANDING r27 — run note (2026-10-19, run_id 2026-10-19T15:01:11Z)

## Pre-registration (§14)
- **Leg question:** does the landing leg stay GREEN on the current tip
  (dd749bfee) with the r28 gossip-resume fix live (f04363e44)?
  convoGossipBeat is now shared with the ask:gossip topic — the ask
  path must stay green. Do gossip-thread resumes fire in the landing
  window with 0 generic-echo stalls?
- **Interesting / GO gates (binding):** V1'' autonomy GO on ≥3/4 seeds;
  V2 work ≥40% kcal draw on ≥3 seeds; V3 ≥1 social tie/seed; V4' ≥8
  transcripts sense-read + 0 fabric-history + 0 within-convo near-dupes
  + probe gate (r20 ADOPTED: ≥1 natural (mourning|seek_taken|
  seek_comfort) OR probe seed documented deathless); V5' water
  fills>0+boils>0/seed, 0 mislabels, ≥6 names pre-System; V6 villages
  alive day 14; WILD HAUL ARC ≥1 natural arc/4 seeds; DAY-FREEZE 0
  stranded fights; OPEN BOOK (conditional); BEAT-IDENTITY WILD
  (sense-read if fired); R28 WILD: 0 generic-echo stalls on any resume;
  ≥1 resume on ≥2/4 seeds OR document the pinned driver plants no open
  gossip threads in 14 days; ASK-GOSSIP REGRESSION: gossipRenders ≥
  r26's per-seed range.
- **Seeds:** 96, 97 (pilot), 98, 99 (main). Policy: competent, PINNED
  (r14–r26 continuity) + one R27 driver delta: resume-priority pick —
  if 'alive:thread:gossip' is offered, take it (mirrors the r28
  pilot); stall signature = NPC resume line matches the generic-echo
  regex or is near-empty. Horizon 14d, death-aware. Bulk evidence in
  hidden_files/evidence/2026-10-19/landing-r27/.

## Verdicts (binding metrics — no re-scoring)
- V1'' autonomy — GO 4/4. No v1pp fails on any seed; hunger>90 = 0
  villager-readings everywhere.
- V2 work — GO 4/4. Self-sufficiency 0.96–1.19 (bar 0.40); effort
  0.995–1.04.
- V3 structure — GO 4/4. Trust≥40 pairs: 6, 6, 2, 2 (same numbers as
  r26); favor instances on 97; 0 moots in-window this run (r26: 2/4
  seeds — variance, not a regression; the trust-pair gate carries it).
- V4' people — GO. 8 transcripts sense-read in full; 0
  fabric-history flags, 0 verbatim repeats, 0 near-dupes (instruments
  + read). Probe gate PASSES: seek_taken fired naturally on seed 98
  d14 (Aroha: "I keep expecting to see them by the fire. Then I
  remember.") and seek_comfort naturally on 99 d10 (Luis: "It's quiet
  today. Wrong kind of quiet.") and 99 d11 (Tom: "Have you — sorry. I
  keep thinking about them.").
- V5' regression — GO 4/4. Water fills 4–7 + boils 15–16 per seed; 0
  death mislabels; 12 social names pre-System per seed. Re-offer and
  npc-question instrument counts are BYTE-IDENTICAL to r26 (pilot
  396/116, main 356/94) — the conversation.js refactor moved nothing
  under the pinned driver.
- V6 winnable — GO 4/4. Villages alive at day 14 (pop 9–12).
- WILD HAUL ARC — GO. 3/4 seeds: 96 drumbelly_tanuki→Huia
  ("Maximiliano works the carcass over… 'Don't know what this is.
  Someone at the fire will — or we'll learn the hard way.'"),
  97 mirrormoth→Diana, 98 nightlight_catfish→Felipe. Cautious-test
  lines sense-read (Diana: "Look, smell, touch — then the smallest
  taste, and wait… 'It's food,' Diana tells the fire. 'You know it in
  your gut. Literally.'").
- DAY-FREEZE — GO. 0 stranded-AI-turn fights across all runs.
- OPEN BOOK — GO (conditional). Scholar deaths on 96 (Liam d15,
  out-of-window tail), 98 (Maya d13 → Aria mantle d14), 99
  (Judith→Kindrat d9; Dylan d8). Epitaphs sensible ("The village
  stops. Somebody screams. Somebody else starts digging."); 0 open
  promises at death on all three (98/99: favorPromised=0; 96: 2 kept,
  1 broken-and-resolved, 0 open) — consistent with r26's 0/4 organic
  finding.
- BEAT-IDENTITY WILD — no spoil mutters or devotion beats fired
  in-window this run; nothing to sense-read. (r26 saw one spoil
  mutter; variance.)
- R28 WILD — GO (documented alternative). gossipThreadOffered = 0
  across all 4 seeds: the pinned driver never leaves an open gossip
  thread in 14 days, so the resume branch cannot fire in-wild here.
  0 stalls by construction. The fix's in-wild proof stands on leg-5
  r28 evidence (179 resumes/0 stalls) + the unit proof
  (scripts/test-gossip-resume-beat-20261019.js, which also drives
  ask:gossip through the shared convoGossipBeat path).
- ASK-GOSSIP REGRESSION — gate VACUOUS: gossipAsks = 0 on r26 and r27
  alike (the 'ask:gossip' choice never appears in the landing window
  with the pinned driver — pre-existing). The shared path is covered
  by the r28 unit proof, not by the wild.
- Telemetry vs landing baseline: quiet, no LOUD lines.

## Village assessment (plain words)
Four villages, fourteen days. Nobody starved; everyone boiled water
early. The fortnight's texture is work: water hauling against a
cistern that fills by midday, gossip mutating around the fire
("The truth left this story two fires ago. What's left is better
theater."). Villagers fight for real — 9 monster kills across the
seeds (drumbelly tanuki, mirrormoth, nightlight catfish, lockpick
raccoon, hummice, rut_king, murkcap), and the bloodiest seed (98)
still fed itself at 0.96 self-sufficiency while burying three.
Everyone knows their plants (9–12 villagers at ≥10 known each; Marta
17, Lena 16, Aria 15). Trust concentrates: Morgan 81 and Marta 80 on
the quiet seeds; Riley 60, Brian 55 on the loud ones. The System
arrived day 8 every seed. The taken are on everyone's mind without
ever being named — "I keep expecting to see them by the fire. Then I
remember." Three scholars died (Liam, Maya, Judith); the mantles
passed with names spoken and the villages didn't blink.

## People check (sense-read highlights)
- Aroha (98 d14, seek_comfort): opens on the taken, grief unnamed;
  comfort loop engages and resolves; tellbeast + namebeast beats fire
  (rut_king debate: "The Ugly Beast" vs "Big-Eyes" with real villager
  backers). Closing: "...Thanks for being here. That's all." Strong.
- Luis (99 d10, seek_comfort): "It's quiet today. Wrong kind of
  quiet." Grief unnamed, natural exit. Strong.
- Tom (99 d11, seek_comfort): "Have you — sorry. I keep thinking
  about them." → "...I need to go be quiet for a while." Natural
  exit. Strong.
- Diana (97 d10, ask_favor): "The pantry's nearly bare. Will you
  forage with me tomorrow?" → commit → promised ("forage with Diana
  tomorrow to rebuild the pantry"). Kept. Strong.
- Elena (97 d13, share_news): 4 real news items, honest exhaustion
  ("That's everything I've got"), then the "I just said — did you
  miss it?" fallback firing correctly as in-character deflection
  (same as r26's sense-read). Strong.
- Mia (96 d10, curious): "I'd rather be the cook than the hero.
  Heroes get songs. Cooks get everyone through winter." Strong.
- Ella (98 d8, curious): short sit, deflect handled warmly. Fine.
- Day-1 stranger (96 d1): "Bleak. Probably true. I keep looking for
  the part where it's not." Fine.

## Blank filled or documented
- INSTRUMENT LIMIT (documented, not fixed): the lure spoken/gestured
  check false-positives on the betrayal:accept menu LABEL ("Come see
  what I found") — allText includes the player's choice labels, so
  "lure: SPOKEN ✓" can fire when the NPC never voiced a lure (97-d10).
  Pre-existing (r26 same code). Fix: restrict the scan to THEM lines.
  Not fixed this run — instrument-only, no game behavior at stake.
- OBSERVATION (content depth, not a bug): the seek_comfort pool is
  small — Aroha, Luis, and Tom's sittings share ~4 verbatim lines
  ("A long exhale. 'I'll get there…'", "Most days I don't think
  about it…", "Heh. Nobody's asked me that…"). Reads fine per
  sitting (different people, same hard week), but a player doing two
  grief conversations back-to-back would notice. Candidate for a
  future content-expansion pass, not a fix commit.
- OBSERVATION: a betrayal lure menu ([betrayal:accept] "Sure. Come
  see what I found…") appears inside Diana's favor conversation at
  trust 14. The driver declined it and the fiction stayed coherent.
  Whether lures belong in favor contexts is a design question —
  queued, not adjudicated.
- No game-code changes this run. Harness delta only (r27 script).

## Metric review
- R28 WILD gate's primary arm (≥1 resume on ≥2/4 seeds) proved
  unreachable-by-construction with the pinned driver (0 open threads
  offered in 14 days). The documented alternative — which I
  pre-registered in the gate itself — carries the verdict: the fix's
  wild proof stands on leg-5 r28 + unit proof. If a future run wants
  in-wild resume coverage in the landing window, the driver needs the
  r28 pilot's plant behavior (leave mid-gossip-thread), which changes
  the pinned policy — a Steve/design call, proposed for the next run.
- ASK-GOSSIP REGRESSION gate was vacuous (0 asks on r26 and r27).
  Proposed revision for next run: drop the wild arm, cite the r28
  unit proof for the shared path.
- No metric re-scored mid-run.

## reachable / fun / winnable
- REACHABLE: yes — favors, grief beats, namebeast debates, the
  wild-haul arc, monster-counter learning, and the System contact all
  fired unprompted.
- FUN: yes — promises kept, grief lands, the d8 mantled village kept
  producing, villagers kill monsters and test the meat.
- WINNABLE: yes for the leg — 4/4 villages alive and producing at
  day 14.

## Ops
- Harness: scripts/journey-landing-r27-20261019.js (new; pinned
  driver + r28 resume-priority instrument) + scripts/journey-landing-r27-analyze.js.
- No game-code changes. Merged locally, pending ship. Rotation 0→1
  (next: establishment).
