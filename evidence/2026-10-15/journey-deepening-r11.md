# journey-deepening R11 — the wave-3 gate from the competent player's view (2026-10-15)

## PRE-REGISTER (from script header, MEASUREMENT.md §§9–12, 14)
Leg question: R10 found 5/8 competent seeds NEVER saw wave 3 by day 100. For a
competent player who fights-but-survives: (a) which rung of the wave-3 gate
binds — the day-25 floor, or the 4-point KILLS-ONLY wave-2 ledger? (b) within
the ledger, what binds: breadth (2-per-type cap), the counter bonus (2 pts),
or low kill throughput — and how many wave-2 near-misses does the gate
discard? (c) in the wave-3 fights that do come, do signature mechanics fire
legibly, and does the scholar survive?
Seeds: 9101–9104 pilot, expanded to 9105–9108 (pilot hit the bar: 9102 faced
ONE wave-2 monster in 94 days — the bind is encounters, not kills).
Policy: competent (pinned; measurement only per race guard). DAYCAP=100,
death-aware stop. Race guard: no fight-execution/counter mechanics
(villcounter territory), no food levers (loop B), no tribute/hierarchy
changes. Game-code fixes only for blatant blanks outside their claims.

## Metric scorecard (§14 binding)
- M1 gate composition — MET. Gate stories recorded per seed (see below).
  The day-25 floor NEVER bound (earliest gate day 47). The per-type cap
  bound visibly once (9105: alien_tick killed at cap → +0 points, breadth
  enforced live). The counter bonus fired on 3/8 seeds (9101:
  voice_mimic_radio+2, heckler+2; 9104: voice_mimic_radio+2; 9105:
  voice_mimic_radio+2, moderator+2) — the mastery pat pays, but never
  unlocked the gate early on its own.
- M2 meetings re-measure — MET. 2/8 seeds with ≥1 player wave-3 fight by
  end of run (9101: 1, 9104: 3). R10 baseline 3/8. Below-pilot-bar would
  have been regression-worthy; it held.
- M3 legibility — MISS (NO-GO per §14, never re-scored). 4 player wave-3
  fights; signature mechanics fired legibly in ALL 4 (sigHits: chorus_line
  downbeat ×2, buffering afterimage/will-step, terms_of_service clause) —
  telegraph honesty (the actual law) held 4/4. But only 1/4 fights' type
  had its counter discovered afterwards (9104 buffering, via 'observed');
  the other 3 types were fought without a learned counter. Bar was ≥50%.
- M4 people — MET. 8 transcripts sense-read (5 fully: r10 Mia/Theo/Brendan,
  r11 Michael/Gladys; 3 more: r11 Mai/Terry + r10 8101-day60 re-read), 0
  senseless flags. One real blank found and FIXED (see below).
- M5 death honesty — MET. 0 mislabels across all 8 seeds.
- M6 winnable — MET. 5/8 villages alive at end (9101, 9103, 9104, 9105,
  9108); 3 village-lost (9106 d63 sickness+starvation, 9107 d26
  thirst/starvation/sickness/wound).

## The gate stories (per seed)
- 9101: gate day 77. Five scoring events across 5 types; the 4th point came
  from a counter-bonus kill (voice_mimic_radio +2). Breadth natural, cap
  never bound. One wave-3 fight (chorus_line, 5 rounds, WON).
- 9102: gate NEVER. ONE wave-2 engagement in 94 days (day 88, lost), 0
  points. The village never fought wave 2 — the bind is ENCOUNTERS, not
  kills. The deepening window played as establishment-continued: wave-1
  fights only, all the knowledge economy, zero escalation.
- 9103: gate missed by ONE point (3/4, all from villager field kills; the
  player never fought wave 2). One more wave-2 kill anywhere opens wave 3.
- 9104: gate day 47 (fastest). 7 types, counter bonus twice. The fighter
  village: 3 wave-3 fights, pop bled to 5 by day 86, all steady.
- 9105: gate day 58. alien_tick killed at the per-type cap scored +0 —
  the breadth rule enforced live, narrated honestly by the ledger beat.
  Player never fought wave 3 (engagedW3=3 = villager engagements only).
- 9106: gate never (0 pts). Village-lost day 63: 4 sickness deaths days
  34–49, then starvation 62–63. All 7 survivors 'grieving'.
- 9107: gate never (0 pts). Village-lost day 26: dehydration 12, wound 18,
  starvation+sickness 24. Early logistics collapse, wave 1.
- 9108: gate never (1 pt, day-80 mosquito). Survived to 102 at wave 2 —
  a full deepening window with no deepening.

FINDING: the wave-3 gate sits behind a wave-2 ENCOUNTER rate that can be
~1/94 days on some seeds. The kills-only ledger is the designed bind, but
the encounter faucet upstream of it is the real pacing variable: 9102 and
9108 (2/8) never had a gate to speak of. This is measurement for the
wave-pacing axis — no lever taken (flesh-out territory; race guard held).

## Village assessment (plain words)
Eight villages, five standing at the end. The ones that lived are
recognizably different people: 9101's nine (avg trust 64, 39 plants known
each, mostly lonely) are a knowledgeable, low-morale crew that met one
wave-3 monster and killed it in five rounds. 9104's five are fighters —
steady, plant-poor (15 each), trust 44 — they bled down from twelve
killing wave-2 and wave-3 monsters and held. 9105's eight (trust 80) are
the beloved village: they seasoned a link, fought everything the wild
sent, buried their dead to wounds and contests, and never saw the player
face a wave-3 monster themselves. The dead villages tell honest stories:
9106 grieved itself to death (sickness cluster then starvation — every
survivor 'grieving' at the end), 9107 died of thirst and hunger before
day 26 with a wound untended. Nobody died of anything the game mislabeled
(0 mislabels). The moods track the losses — that system is working.

## People check
Conversations have wants and the wants are usually concrete: Mia's wound
("About this wound — I hate to ask twice, but it's still open. Will
you?"), Theo's pantry run ("Where the sassafras grows thick, dawn. Pack
and knife."), Brendan's hunger ("It's been days since a real meal. I'm
slowing down — stupid, clumsy."), Michael's curiosity ("What do YOU think
actually happened to us?"). Gladys walked away from a sick villager's
ask and the want resolved 'unresolved' — the consequence hangs honestly.

BLANK FOUND + FIXED: resume openers referenced open threads by label only
("We never did finish talking about their secret — that was 9 days back.
Still on your mind? We still owe that personal stuff a proper ending,
too."). The topic ledger HAD a snippet field for the last spoken beat
but nothing ever wrote it — so the resume read as fabricated shared
history even when the conversation really happened (Steve's bar). Fix
(src/js/conversation.js): the three plant sites (walk-away,
unfinished-business, subject-change) now capture the last NPC-spoken beat
via convoLastThreadSnippet and store it on the thread; the resume opener
quotes it. Post-fix: 'We never did finish talking about their secret —
that was 9 days back. "They will not say whose name was on the list." —
still on your mind?' Legacy threads (no snippet) render exactly as
before. Proof scripts/test-convo-resume-quote-20261014.js: 10/10 GREEN
(4 RED on pristine). Regressions: validate-ontology 96/96, test-dialogue
14/14, test-convo-beats 25/25, test-curious-seed-resume ALL GREEN,
test-favor-system 30/30, test-convo-norepeat-fallback 9/9,
test-convo-seed-voice 44/44, test-convo-cycle-norepeat 40/40 clean.
test-dialogue-coherence + test-convo-coherence-choices fail IDENTICALLY
on pristine (partial-module eval, missing resolveConsequence) —
pre-existing, not this change.

Documented (not fixed): teach-reaction pool is 4 lines cycling — 5 teaches
in one conversation repeats a line; the 'walked away from Haven' gossip
template repeats across villagers with only the name changed; the curious
want's resumed 'that question' still doesn't name the question when no
qid was recorded (r14's fix covers the qid-known case).

## Metric review (§14)
- M3's bar (≥50% of wave-3 fights with counter discovered after) was
  miscalibrated: counter discovery is EARNED (observation, survival,
  teaching) — a 5-round win teaching nothing is the design working, not a
  legibility failure. Telegraph honesty (the actual law) held 4/4. Next
  run should bind M3 to sig-fire + codex-naming, not post-fight discovery.
- The M2 pilot bar (≥25%) held at 2/8 — but with 3/8 villages dead, the
  meeting rate is conditioned on survival. Next run should report the
  meeting rate among survivors separately.

## Reachable / fun / winnable (deepening leg)
REACHABLE: partial. Wave-3 content is reachable for fighter villages
(9104 day 47) and persistent ones (9101 day 77, 9105 day 58) — but 3/8
seeds never filled the gate by end of run, and 2 of those for lack of
encounters, not lack of trying. A competent-but-cautious player can play
a full deepening window and never deepen. FUN: the wave-3 fights that come
are the best content in the leg — signature mechanics fire legibly,
counters are learnable, the ledger narrates honestly. The non-deepening
seeds play as a long establishment — pleasant (knowledge economy
compounds: 25–39 plants known) but flat. WINNABLE: 5/8 villages standing
at day ~100; the deaths are honest (sickness clusters, early logistics).
The deepening window doesn't kill villages unfairly — it starves them of
escalation.

## Telemetry
Per-seed JSON: evidence/2026-10-15/journey-deepening-r11-competent-*.json
Transcripts: evidence/2026-10-15/journey-deepening-r11-transcript-*.txt
Pilot log: evidence/2026-10-15/journey-deepening-r11-pilot-run.log
Expansion log: evidence/2026-10-15/journey-deepening-r11-expansion-run.log
Baseline check: telemetry-baselines/deepening.json exists (r10 seeded it).
Run telemetry-check after commit per step 14.
