# Journey LANDING r26 — run note (2026-10-19, run_id 2026-10-19T10:43:29Z)

## Pre-registration (§14)
- **Leg question:** does the landing leg stay green on current tip
  (6143e6cd6) with the game-code changes since r25's base (307958ebe)?
  Do spoil mutters fire sensibly in days 1–14? Do the r26 want-seed /
  r28 refrain fixes hold in the wild? Do moots still convene
  act-0-sensibly?
- **Interesting / GO gates (binding):** V1'' autonomy GO on ≥3/4 seeds;
  V2 work ≥40% on ≥3 seeds; V3 ≥1 social tie/seed; V4' ≥8 transcripts
  sense-read + 0 fabric-history + 0 near-dupes + probe gate (r20 metric
  review ADOPTED: ≥1 natural (mourning|seek_taken|seek_comfort) OR seed
  documented deathless); V5' water fills>0+boils>0/seed, 0 mislabels,
  ≥6 names pre-System; V6 villages alive day 14; WILD HAUL ARC ≥1 natural
  arc/4 seeds; DAY-FREEZE 0 stranded fights; OPEN BOOK (conditional);
  BEAT-IDENTITY WILD (spoil/devotion sense-read); R26/R28 WILD (proof
  tests on tip + in-wild sense-read).
- **Seeds:** 96, 97 (pilot), 98, 99 (main), 100 (REPEAT_SIT=1,
  MOURN_PROBE=1 probe). Policy: competent, PINNED (r14–r25 continuity).
  Horizon 14d, death-aware. Bulk evidence in
  hidden_files/evidence/2026-10-19/landing-r26/.

## Verdicts (binding metrics — no re-scoring)
- V1'' autonomy — GO 4/4. Every living non-holder villager logged
  production on ≥ (observed − 2); hunger>90 = 0 villager-readings on all
  seeds.
- V2 work — GO 4/4. Self-sufficiency 0.96–1.19 (bar 0.40); effort
  0.995–1.04.
- V3 structure — GO 4/4. Trust≥40 pairs: 6, 6, 2, 2 per seed (Marta:80,
  Morgan:81, Riley:60…); favor instances on 97.
- V4' people — GO. 8 sense-reads (7 full transcripts + System cinematic);
  0 fabric-history flags, 0 verbatim repeats, 0 near-dupes, 0 stutters
  across 53 sittings. Probe gate PASSES: seek_comfort fired naturally 2×
  on seed 100 (villager had a day-13 combat death; not deathless).
- V5' regression — GO 4/4. Water fills 4–7 + boils 15–16 per seed;
  0 death mislabels; 12 social names pre-System per seed. Instruments on
  tip: mourning-name 7/7, seek-taken 4/4, succession-seed-inherit 6/6,
  beat-identity GREEN, exile-refrain 8/8.
- V6 winnable — GO 4/4. All villages alive at day 14 (pop 9–12).
- WILD HAUL ARC — GO. 3/4 fresh seeds: villager combat kill → haul →
  unknown-flesh cautious test (96: drumbelly→Huia; 97: mirrormoth→Diana;
  98: nightlight_catfish→Felipe).
- DAY-FREEZE — GO. 0 stranded-AI-turn fights across all runs.
- OPEN BOOK — GO (conditional). Scholar deaths on 98 (Maya→Aria d14)
  and 99 (Judith→Dylan→Kindrat, same-day double mantle d8); lines
  sensible ("The village stops. Somebody screams. Somebody else starts
  digging."); 0 open promises to name — consistent with lane B r26's
  0/4 organic finding (competent players keep their word).
- BEAT-IDENTITY WILD — GO. Spoil mutter fired in-window (seed 99,
  ~d13): "Aria mutters: 'Should've smoked that. Fresh stuff keeps a day
  or two on the shelf — the smoke rack is right there.'" Attributed,
  canon-correct (PRESERVATION.md), non-spam (the paired throw-out had no
  mutter).
- R26/R28 WILD — GO. The r26 want-seed-inherit fix fired NATURALLY on
  the probe (seed 100, Natalie): "Esperanza and I never finished talking
  about that personal stuff — we left it mid-thought, 2 days back.
  You're wearing Esperanza's shoes now — want to pick it up?" The
  predecessor is named; no fabricated shared history.
- Telemetry vs landing baseline: quiet, no LOUD lines.

## Village assessment (plain words)
Four villages, fourteen days. Nobody starved; everyone boiled water by
day 6. Villagers forage, haul, teach plants, and — notably — FIGHT:
seeds 98/99 lost villagers to real wave-1 animal combat (hushwolf,
hummice, rut_king, mirrormoth kills by villagers too). The villages
absorbed the losses and kept producing (self-sufficiency ~1.0 even on
the bloodiest seed). The System arrived on day 8 every seed with its
full unhinged cinematic intact. The taken are on everyone's mind:
Aroha ("I keep expecting to see them by the fire. Then I remember."),
Luis ("Most days I don't think about it. Today I am."). Diana asked
for foraging help when the pantry ran thin and the policy kept its
word; Mara did the same the next day. Two bearers died mid-leg; the
mantle passed with names spoken and the villages didn't blink.

## People check (sense-read highlights)
- Diana (97 d10, ask_favor): "The pantry's nearly bare. Will you forage
  with me tomorrow?" → committed → promised. Namebeast debate live in
  the conversation (Big-Eyes/Loud-Eyes proposals with real villager
  backers). Strong.
- Luis (99 d10, seek_comfort): "It's quiet today. Wrong kind of quiet."
  Grief unnamed but present; natural exit. Strong.
- Aroha (98 d14, seek_comfort): "I keep expecting to see them by the
  fire. Then I remember." The taken, unmistakable, unnamed. Strong.
- Natalie (100 d13, probe): the inherited want-seed — predecessor named,
  no fabrication. Strong.
- Elena (97 d13, share_news): asked "what's the word?" 6×; gave 4 real
  news items, honestly exhausted ("That's everything I've got"), then
  "I just said — did you miss it?" — the fallback firing CORRECTLY as
  an in-character deflection, not a content bug. Sense-read, not a flag.
- Mara (97 d12): favor fromSeed kept; "Mara leans in" narration wrapper
  is the game's voice, not third-person error.
- System cinematic (day 8): unhinged voice intact, KIN canon (boring
  half, napping pods), food irony, fusion-pellet gag, "earn it" hook.

## Blank filled or documented
- INSTRUMENT FIX (harness, no game change): the phantom-"Mara" detector
  false-positived 3× on seed 97 — Mara is a real villager there. Made
  the check name-aware (skips when a roster member carries the name).
- INSTRUMENT LIMIT (documented, not fixed): the harness mantleLog is
  day-granular — seed 99's same-day double mantle (Judith→Dylan→Kindrat)
  logged as Judith→Kindrat. The fiction was correct and fully narrated;
  the log just collapses sub-day passes.
- No game-code blank found. No game-code changes this run.

## Metric review
- r20's probe-gate proposal ADOPTED and PASSED this run (seek_comfort
  2× natural on a non-deathless probe seed).
- No metric re-scored mid-run. No new metric doubts.

## reachable / fun / winnable
- REACHABLE: yes — favors, grief beats, namebeast debates, the wild-haul
  arc, spoil mutters, and the System contact all fired unprompted.
- FUN: yes — promises resolve, grief lands, the double-mantle day reads
  like a story, villagers kill monsters and test the meat.
- WINNABLE: yes for the leg — 4/4 villages alive and producing at day 14.

## Ops
- No game-code changes; harness + analyzer + this note only.
- Merged locally, pending ship. Rotation 0→1 (next: establishment).
