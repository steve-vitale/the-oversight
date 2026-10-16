# Journey leg: DEEPENING (days 40–80) R13 — holding r12's gains + show-memory lands + ack-strip fix — 2026-10-16

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- **Question:** on the current tip (master@b246df87 — r12 base + crisis-r17 show-memory fix + scale-r1 realm echo fix + seatdefault-ON + social-r17 resume-repair + villagevoice findings), do the DEEPENING window's r12 gains hold, AND do the new in-window beats fire and read sensibly?
- **Binding metrics:** M1 meetings — player wave-3 fights on ≥2/8. M2 seasoning — ≥1/8 seeds with a seasoned link by day 100 (age ≥30d, trust ≥40). M3 counter parity — ≥1 'observed'-via discovery on ≥2/8. M4 knowledge — discoveries + combineKnowledge + teaching + codexMonsters breadth >0 on ≥6/8. M5 people — ≥10 transcripts sense-read, 0 senseless flags. M6 winnable — alive at day 100 on ≥4/8; 0 mislabels. M7' win-side inert — 0 table|deedgate telemetry rows AND tableSeat 'none' AND no Watchers staged (viewership reported, not gated — r12 metric review). M8 show-memory — ≥1/8 seeds with a 'show' lately beat in talk after a window contest grab.
- **Interesting-finding bar:** a show-lately line that reads human; a realm court line in-window (bonus); a wave-4 unlock on competent play; a 'the night' epitaph; win-side leakage under seatdefault-ON (M7' miss is a finding).
- **Seeds:** fresh 8601–8604 pilot; EXPANDED to 8601–8608 (pilot met the bar: wave-3 fights on 2/4, all survived, M7' clean). Policy: competent. DAYCAP=100, death-aware stop. W3TRACE=1. SEATDRIVE left unset (= driver ON per c004b9dd).
- **Canon read:** CANON.md, MONSTER-WAVES.md (wave law, kills-only ledger, sig mechanics), KNOWLEDGE.md (channels, teaching, combination). No new canon invented.

## What ran
- Harness: `scripts/journey-deepening-r13-20261016.js` (r12 clone + pre-reg header + M7' instrument [watchersStaged via regionalLog 'global' events + pendingGlobal/globalLive; viewership reported] + M8 show/realm beat scan over transcripts + show-probe: a conversation the day after every planted contest, probe-mode routed dlg:subject → ask:lately).
- Mid-run harness fixes (both instrument, zero game code): (1) probe first fired on exact-day equality `lc.day === gd` — fireContest plants lastContest AFTER the day callback, so it never matched (0 probes on re-run); fixed to fire on first OBSERVATION of a new grab. (2) probe conversations engaged wants and never reached ask:lately — probeMode routes dlg:subject → ask:lately first.
- Base: master@b246df87. All work in worktree journey-deepening. 1 game-code fix landed here with RED→GREEN proof test (below).
- Outputs: `evidence/2026-10-16/journey-deepening-r13-competent-860[1-8].json`, 162 transcripts (day45/60/80 + showprobes), `journey-deepening-r13-{pilot,expansion}-run.log`.

## Verdicts on the binding metrics
- **M1 meetings — GO (4/8).** Player wave-3 fights on 8602 (4: Buffering routed via afterimage mechanic, Ad Break lost, Buffering lost, Callback won in 1 round — 'NOT ' sig = name-it-not-them), 8603 (1: Chorus Line won in 3 rounds on the downbeat), 8604 (2: Spool routed ×2 at 121r — the stalemate-flee driver again; Terms of Service won in 3), 8608 (1: Spool routed 121r). Sig mechanics present in 7/8 fights.
- **M2 seasoning — GO (5/8).** Seasoned links on 8601 (trust 46, age 75), 8602 (45), 8603 (50–55), 8607 (50–59), 8608 (41–50).
- **M3 counter parity — GO (8/8).** 'observed'-via discoveries on every seed; 23–36 observed events/seed. The non-lethal villager path is the norm.
- **M4 knowledge — GO (8/8).** combineKnowledge 41–69/seed, discoveries 16–26/seed, codexMonsters breadth 16–24.
- **M5 people — GO.** 10 transcripts sense-read (below), 0 senseless flags. One sense-caught bug class FIXED (ack-strip); one wrinkle documented.
- **M6 winnable — GO (7/8 alive; 0 mislabels).** 8606 village-lost d20 (early collapse: hummice + white_noise_heron + nightcourt pressure, 2 starvation deaths — death-aware stop correct). 0 death-honesty mislabels across all player deaths.
- **M7' win-side inert — GO.** watchersStaged=0, tableTele rows=0, tableSeat='none' on ALL 8 seeds under seatdefault-ON. Viewership 18–33 (reported only, per r12 metric review — 8602 hit 33 via 37 contests, same shape as r12's 8406).
- **M8 show-memory — GO (8/8).** 'show' lately beats on every seed (1–9 each). The crisis-r17 beat fires in live talk with real contest names ("The Pit", "The Exchange", "Impress Us", "Duel", "Calorie Run", "Hardened Impress Us"). Realm: 0 beats — no national in the window, as expected (bonus bar unmet, not a miss).

## Village assessments (plain words)
- **8601 (8→8, survived, wave 3):** the show seed. 51 contests, 7 show beats, Maya@98 trust leader, plants 31–42. The village talks about the grabs the next day — the r17 fix working as designed.
- **8602 (8→3, survived, wave 3):** the grinder. 4 wave-3 fights ground the roster to 3 souls (2 combat deaths this window); Sanne@60 leads the remnant. 32 observed counter events — they learned while bleeding. Viewers 33.
- **8603 (11→11, survived, wave 3):** the golden village. Zero deaths, plants 40–45, 9 show beats, Chorus Line beaten in 3 rounds on the downbeat. Trust leaders Gilberto/Willka/Andres @90+.
- **8604 (10→10, survived, wave 3):** the deep bench. Zero deaths, engagedW3=5, 2 Spool routs, Kyle's seek_taken promise ("I'll ask the System about the pods" — Sam, taken in the Taking).
- **8605 (12→12, survived, wave 2):** the quiet one. Wave 3 never unlocked (engagedW2=7, kills short). Tomoko/Milo/Meihua @90. 12/12 alive — the leg breathes without the wave-3 spike.
- **8606 (10→scattered, village-lost d20):** the failed start. Wave-1 pressure + starvation by day 20. Death-aware stop behaved.
- **8607 (8→8, survived, wave 3):** the witness. 9 show beats; the ack-strip bug caught here (below).
- **8608 (9→9, survived, wave 3):** the steady climb. Spool routed, 7 show beats, Michael/Maya/Kyle @90.

## People check (SENSE-TESTING LAW — 10 full transcripts read)
Standouts: Thao's bystander show-line ("Impress Us. They just... took you. Came back like nothing happened. It wasn't nothing." — knowledge-gated firstRef naming the player); Maya's participant line ("They took me. The Pit — up there, on the screens, in front of everyone. I'm still turning it over."); Kyle's seek_taken promise for his taken brother Sam ("Even asking is more than the silence."); Andres' 'curious' exchange ("Small hopes are the load-bearing kind. Keep collecting them."); Amy's laugh ("We should collect funny things. Like firewood. Stockpile them for winter."); Dieter's hunger ask ("I won't forget who fed me when it mattered."). 0 fabricated-history / filler-loop / static-menu flags.
Wrinkles: (1) 8602-day45's resume opener quoted a menu-return filler ('That's what I heard, anyway. What's up?') as the "memory" of the gossip thread — the r17 deflection guard covers the 12-line meta-speech pool but not menu-return fillers. Documented for the conversation owner; not senseless, not fixed here. (2) Barbara's day-23 probe never reached ask:lately (no live event in the menu that sitting) — instrument limit, not a game bug.

## Blanks filled (1) — with RED→GREEN proof test
**Thread-snippet ack-strip** (8607-day60 sense-caught): the resume opener quoted a STITCHED fragment as the memory of "what's been happening": 'Huh. Let me think about that." "You asked me that before. It's a different question now." "The Witness. They…' — two thinking-aloud preamble chunks (topic ack + t2changeLine) standing in front of the content. `convoNoteBeat` noted the full voiced line; the MEMORY QUOTE feature (deepening r11) then quoted delivery as memory. Fix: `convoAckLines()` (7 known ack strings: topic acks, t2changeLine variants, "Me? Okay.") + `convoStripAcks()` (strips leading ack chunks, tolerates voice-opener prefixes, stops at non-ack chunks so narration/single-chunk lines are kept whole); `convoNoteBeat` clips the stripped line. Proof `scripts/test-ackstrip-r13-20261016.js` — RED pre-fix (3 failures: acks in snippet), GREEN post-fix (6/6).
- Regressions: `check.js --quick` 96 passed, 2 failed — the 2 fails (`test-where-are-we` stranger lines) are PRE-EXISTING (same as r12's pristine-HEAD verification). Ontology 115/115.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json on the 8 binding seeds: **LOUD: engaged.w3 swung 91% (11 → 21). INVESTIGATED — EXPLAINED, not a bug.** Same-seed A/B (r12 harness vs r13 harness on 8601–8604, same tip): r12/no-probe gives engW3 2,2,1,4; r13/probe gives 2,4,4,5. The show-probe adds ~5–10 conversations/seed, perturbing the deterministic trajectories (conversations cost ticks, move trust/knowledge) — the swing is instrument-driven, no game-code change in the window touches combat (all intervening game changes are talk/policy/instrument). Baseline rolled to the r13-instrument normal {w3fights:8, engaged.w3:21, fightsTotal:45, fightsByWave.3:8} with this note.

## Metric review (§14)
- **M8's bar held** — the probe was necessary instrumentation (grabs land after the day-80 transcript on most seeds); with it, 8/8.
- **The engaged.w3 baseline break** is an instrument change, not a game change — documented above; future runs on this harness compare against the rolled baseline.
- No other metric proved wrong.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave-3 unlocks on 6/8 seeds (kills permitting), sig-mechanic fights on 4/8, seasoned links on 5/8, counter-parity on 8/8, knowledge compounding on 8/8, show-memory beats on 8/8.
- **Fun:** the village now talks about the show the next day — the televised world and the fire are the same world. Sig-mechanic fights (Buffering's afterimages, the Callback's borrowed face, Spool's tape) decide fights laterally. Conversations carry pods-dreams, taken kin, hunger, and small hopes.
- **Winnable:** 7/8 survive; wave 4 not reached in the window on competent play (engW4=0 everywhere — the standing climb continues past day 100). The leg breathes; the climb past it is priced in kills and standing the village earns about half the time.
