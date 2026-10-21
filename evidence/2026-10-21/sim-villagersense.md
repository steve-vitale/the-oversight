# sim-villagersense — VILLAGER-PERSONHOOD SENSE AUDIT (DIAGNOSTIC arm, zero src/js)

Run: fleshout-20261021T0044Z arm sim-villagersense | worker: sim-villagersense tree
Corpus substrate: the winning SEATDRIVE default-on substrate (windowseat 16-run sweep
s66001–s66008 x {leadfeast,belongfeast}), per run fleshout-20261020T2145Z (evidence/2026-10-20/sim-windowseat.md),
plus the vgear composition run (vgear s64301–s64308). DIAGNOSTIC: no game-code changes; file findings.

## PRE-REGISTRATION (written before reading any transcript beyond format samples)

**Primary corpus (named in the brief):**
- `evidence/2026-10-20/windowseat-transcripts/belongfeast-s66006.txt` (seed 66006, belongfeast)
- `evidence/2026-10-20/windowseat-transcripts/leadfeast-s66004.txt` (seed 66004, leadfeast)
- `evidence/2026-10-20/windowseat-transcripts/leadfeast-s66005.txt` (seed 66005, leadfeast)
- `evidence/2026-10-20/vgearseat-transcripts/vgear-leadfeast-s64304.txt` (seed 64304, leadfeast, vgear arm)

**Supplement corpus (same-day committed villager-behavior transcripts, needed for the run-span gate):**
- `evidence/2026-10-20/indispensablediag-transcripts/leadfeast-s64202.txt` (seed 64202, leadfeast, diag substrate)
- `evidence/2026-10-20/glutprobe-sense.txt` (seed 8805, leadfeast, 60d)
- `evidence/2026-10-20/glutcurvecheck-sense.txt`
- `evidence/2026-10-20/journey-deepening-r22-transcript-competent-9501/9502/9503-*` (competent policy, real conversation probes)

**Coverage gate:** ≥40 judged excerpts across categories — dialogue beats (NPC quoted speech),
villager reactions (deaths, wins, contests, raids, table), routine narrations (villager habit/routine lines),
gossip/want lines — spanning ≥8 runs × policies {leadfeast, belongfeast, competent}.
Runs counted: 66006, 66004, 66005, 64304, 64202, 8805, 9501, 9502, 9503 (9 runs ≥ 8 required).

**Filing rule:** every flagged robotic/static/repeated behavior is APPENDED to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
in the file's exact `- [open] YYYY-MM-DD — area — observation (source).` format, each with
transcript evidence citing file + day. 0 fabricated findings: each cites its source.
Check the backlog FIRST — no duplicates of already-filed items (checked 2026-10-21:
DEATH-LITURGY TEMPLATING BLANKS and FOLK-NAME DEATH CAUSES already filed/claimed — not refiled).
Each flag is marked `fixable` (with named next) or `steve-call` (needs Steve's design ruling).

**GO criterion:** coverage gate met (≥40 excerpts, ≥8 runs, both policies) AND all flags filed with
file+day evidence AND 0 fabricated findings. This arm is DIAGNOSTIC: no src/js changes.

**Instrument:** `scripts/sample-villager-sense.js` — villager-voice sampler (quoted NPC speech,
💬 mutters, 👀 want lines, death/win/contest/raid reaction beats, routine narrations),
stratified across files × categories. Committed under scripts/ with safe-commit discipline.
Script output is a reading aid only — every excerpt quoted in this file was read by the assessor
in the source file.

---

## EXECUTION (reading done after pre-registration)

**Sampler:** `scripts/sample-villager-sense.js` produced 345 villager-voice excerpts across
55 files, plus a repeat-ledger (villager-voice lines repeated >= 5x within one file).
All excerpts quoted below are byte-verbatim from the source files (spot-verified).

**Runs covered (10):** 66006 (belongfeast), 66004 (leadfeast), 66005 (leadfeast),
64304 (leadfeast, vgear composition), 64202 (leadfeast, diag substrate), 8805 (leadfeast,
glutprobe sense), 9501 / 9502 / 9503 / 9504 (competent, journey-deepening-r22 conversation probes).
**Policies:** leadfeast, belongfeast, competent. Coverage gate: 10 runs ≥ 8, all three policies. MET.

**Repeat-ledger highlights (roboticity signal):**
- "They're burying their speaker — grain can wait a week; grief can't. Tending resumes when the mourning lifts." x45 in leadfeast-s66005.txt (3x in a row on d70, d71, d72), x9 in leadfeast-s64202.txt
- "X heads out for water. 'The well won't fill itself.'" — Valeria x26, Omar x22, Tariq x16, Henry x12 in s66005; Elif x8, Caleb x7, Mara x7, Wei x5, Owen x5 in s64304; Selorm x8, Nikolai x8, Soo x7, Jesse x5 in s66006 — EVERY villager, identical line
- "Nobody's talking much. The fire feels smaller tonight." x11 s66005, x9 s66004 (already filed: DEATH-LITURGY TEMPLATING, claimed by sibling arm — not refiled)
- "Word gets around the haven. Whatever that thing was — everyone's talking about it now." x9 s66005, x5 s64202
- "🌿 Ananya checks the pantry before heading out…" x8 glutcurvecheck-sense.txt (same-day repeats)
- "💧 X returns with water: +N clean." — dozens (ledger narration)
- Forage stock lines: "Sofia heads out to forage. 'Gone looking. Don't wait up.'" x5; "Ruby heads out to forage. 'There's food out there. Going to find it.'" x5 (glutprobe-sense)

## JUDGED EXCERPTS (48 — verdict OK or FLAG → finding)

### Dialogue beats (NPC quoted speech)
1. `[d128] 💬 Selorm whispers: "Someone's been leaving food out, and Wren won't admit a thing. Don't ask me how I know it wasn't one of us."` (belongfeast-s66006) — OK. Specific, paranoid, tracks a real recurring event. Variants exist across speakers.
2. `[d129] 💬 Joshua and Soo are hunched over the fire together, voices too low to catch.` (belongfeast-s66006) — OK. Honest about not revealing; ambient, human.
3. `[d132] 💬 Landon mutters: "Found a parcel by the hollow. Dried meat, clean water. That has Wren written all over it."` (belongfeast-s66006) — FLAG → F3. Content is good village folklore; the identical sentence is spoken by 6 villagers across 2 runs (Soo d134, Katarina d96, Caleb d100, Valeria d60 s66005, Anjali d67 s64202).
4. `[d96] 💬 James says: "Do you ever feel it? Like the air leans in when something happens."` (leadfeast-s66004) — OK. Strange, specific, a real voice.
5. `[d101] 💬 Suman has been asking you about Mending Hands — what it does, what it goes with. Planning something.` (leadfeast-s66004) — OK. Synergy-chasing flavor; villagers notice abilities.
6. `[d71] 💬 Ines has been asking you about Purify — what it does, what it goes with. Planning something.` (leadfeast-s64202) — OK. Curiosity ≠ learning; no canon violation (alien ability stays System-granted; the villager is just asking).
7. `[d55] 💬 Henry says: "They said you're doing well. It sounded... proud? Can they feel proud?"` (leadfeast-s66005) — FLAG → F3 (verbatim again from Owen s64304, Omar, Daniyar, Adrian — 3 runs).
8. `[d58] 💬 Valeria mutters: "Smile for the sky, they said. I hate how easy it was to start doing it."` (leadfeast-s66005) — content OK; phrasing FLAG → F3 (Caleb s64304 d65 says it word-for-word).
9. `[d11] Emma mutters: "Should've smoked that. Fresh stuff keeps a day or two on the shelf — the smoke rack is right there."` (glutprobe-sense, pantry discard) — OK. Specific, teachable, sensible.
10. `[d82] 🗣️ Nadia to Raj, by the fire: "It waits. We wait. Somebody should check the snares — the table doesn't fill the pantry."` (glutcurvecheck-sense) — OK. Villager-to-villager beat with a real point.
11. `THEM: "We're eating through stores faster than we replace them. Will you forage with me tomorrow? Two pairs of eyes, twice the ground. — comedy."` (9501-day86) — FLAG → F9. Literal tone-tag "— comedy." inside the quoted spoken line.
12. `Reply: "Useful. Everything useful matters now. I mean that as a compliment. — comedy."` (9502 journey probe) — FLAG → F9 (same; also `NARR: "Like I said — Still on what's been happening. — comedy."`).
13. `THEM: "Quick version — Short version: I don't know. Long version: also that, but slower."` (9502-day57, 9504-day78) — FLAG → F13 (two filler openers merged).
14. `THEM: "I tried the Greenbrier Shoots like you showed me. Didn't poison anyone, so that's a win."` (9503-day96) — OK. Callback to teaching with consequence-awareness. This is the bar.
15. `THEM: "It's my sister, Adriana. Was taken at the Scattering. The boring half, they said — my sister, boring. I think about that every day."` (9501-day45, Jada, seek_taken) — OK. KIN-canon tied (the Taking), personal, specific.
16. `THEM: "Tomas is gone and the world just... continues. That's the part I can't stand."` (9504-day80) — OK. Grief with a real edge.
17. `THEM: "I'm picking up Tomas's share of the work. Someone should, and it might as well be me."` (9504-day80) — OK. Grief expressed as action, not template.
18. `THEM: "Tomas and I never finished talking about that plant lesson — we wandered off it, 6 days back. You're wearing Tomas's shoes now — want to pick it up? 'Sure — what's on your mind?'"` (9504-day73) — OK. Succession continuity inside conversation; thread memory works.
19. `THEM: "Paola speaks only 🇪🇸 Spanish. No shared words at all — just eyes, hands, and patience."` (9504-day25) — OK. Language barrier honored in-voice.
20. `THEM: "Did you hear? Lillian just walked away from Haven. Didn't look back."` (9502-day20) — FLAG → F8 (same template for Giuseppe, Pearl, Mara, Ruth: "walked away from Haven. Didn't look back.").
21. `THEM: "Giuseppe is back. Walked in like they'd never left."` (9502-day22) — FLAG → F8 (same for Ruth, Elena, Mara).
22. `THEM: "Everyone's got a take. Mine's just the one I can live with."` (9501-day45; also d16 as "Permit me: Everyone's got a take…") — FLAG → F8 (verbatim across days/seeds).

### Villager reactions (deaths, wins, contests, raids, table)
23. `[d102] 🕯️ Elif Demir is dead — contest. The village stops. Somebody screams. Somebody else starts digging.` (leadfeast-s66004) — OK. Strong, specific death beat. (Contrast with the claimed templating item — this one is good.)
24. `[d132] Nobody's talking much. The fire feels smaller tonight.` (belongfeast-s66006) — already filed (sibling DEATH-LITURGY claim) — judged, not refiled.
25. `[d132] The Codex doesn't pause for grief. Giulia blinks — and it's already there, overlaying everything, syncing. No pen. No paper. The mantle just... transfers.` (belongfeast-s66006) — FLAG → F5 (verbatim for Elif, Jorge, Suman s66004; Hannah, Anjali s64202).
26. `[d70] They're burying their speaker — grain can wait a week; grief can't. Tending resumes when the mourning lifts.` (leadfeast-s66005) — FLAG → F2 (x45 in this run; 3x in a row on d70, d71, d72).
27. `[d96] Back at the haven the argument starts: James is calling it "Big Ugly." They'll fight it out — weigh in if you want.` (leadfeast-s66004) — FLAG → F4 (template; Marta argues "Big Loud" d54 / "Big Big" d56 / "Loud-Eyes" d58 — same sentence, only names change).
28. `[d128] It's settled. The village is calling it "The Ugly Beast." The Codex keeps it.` (belongfeast-s66006) — FLAG → F4 (pair of the above; "It's settled…" verbatim for Big Loud/Big Big).
29. `[d55] 🐗 RAID — 5 raiders (The Mountain Lord, Inspiration, Spool, Big-Eyes, The Anaconda Empress) hit Haven in the night, drawn by the smell of the pantry! No walls. No warning but the noise.` (leadfeast-s66005) — OK. Formulaic bulletin, but raider names vary and the palisade variant changes wording; bulletins are allowed to be formulaic.
30. `[d101] ⚔️ Jorge killed the Big Big alone — 1 round, 0 taken. Word travels fast. The village cheers.` (leadfeast-s66004) — OK. Specific kill celebration.
31. `[d71] 💬 Ramon says: "That Vex Marlowe... I don't like the way it looks at you. Be careful."` (leadfeast-s64202) — OK. Specific warning about a named threat; villagers watch the show.
32. `[d142] ◈ THE TABLE — it is not a table. It's a ring of pale light, and around it, things with too many angles to be faces. Above it all — the audience. Trillions of eyes, and every one of them knows your name.` (belongfeast-s66006) — OK (System voice, but the win beat is specific and earned).
33. `[d69] 📨 Word came: Owen Smith wants to join Haven. "Word travels: Haven takes people in. I'm people." — they haven't set foot here. The village will judge.` (leadfeast-s64202) — OK. Stranger's voice is specific and funny.
34. `Word gets around the haven. Whatever that thing was — everyone's talking about it now.` (leadfeast-s66005 d96+) — FLAG → F6 (x9; "whatever that thing was" even when the village just named it).
35. `[d64] 🧭 Ricardo is back from the north. "It's... different out there. I'll tell you about it." (Ask them what they saw.)` (vgear-s64304) — OK. Report beat with a real gameplay hook.
36. `[d134] Selorm showed Soo the broad smooth green leaves in spring colonies, strong onion smell when crushed — "remember it." Word gets around.` (belongfeast-s66006) — FLAG → F11 (template; Soo→Nikolai same descriptor same day; fan-leafed-tree descriptor x4 on d69 s64304).
37. Note on #36: the descriptor-first (not the plant's name) is CANON-CORRECT knowledge gating ("if you don't know, it doesn't show") — the mechanic is good, the narrator sentence is stock. OK mechanic, FLAG voice.

### Routine narrations
38. `[d96] Elif heads out for water. "The well won't fill itself."` (leadfeast-s66004) — FLAG → F1. Every villager, every day, every run, identical.
39. `[d127] Joshua heads out to forage. "Bringing dinner back. One way or another."` (belongfeast-s66006) — FLAG → F1 (single-stock per villager; Sofia/Ruby/Tariq same class, x5 verbatim repeats).
40. `[d96] 🚶 Jorge is back — found Elif.` (leadfeast-s66004) — OK. Status line, names vary, honest.
41. `[d101] 🌿 James checks the pantry before heading out — the shelves are full, ~7 days of fresh on hand… leaves the fish nets standing and turns to the wood run instead. The pantry can't take more; the wild will keep.` (leadfeast-s66004) — OK. This is the bar for routine narration: decision-aware, specific numbers, sensible.
42. `[d101] 🪵 James hauls back 4 wood. The pile grows. (19 logs now.)` (leadfeast-s66004) — OK. Ledger, fine.
43. `[d97] 🤒 Caleb is back on their feet — the fever ran its course.` (leadfeast-s66004) — OK. Recovery beat, specific.
44. `[d54] 💧 Marta returns with 14L, but the cistern only holds 13L more.` → `[d54] 💧 Marta returns with 17L, but the cistern only holds 0L more.` (leadfeast-s66005, same day) — FLAG → F12. Nobody notices the cistern is full; Hannah does the same 3x on d63 s64202.
45. `[d63] 🌿 Hannah returns with foraged food: +907 kcal to the pantry.` (leadfeast-s64202) — OK. Clean ledger.
46. `[d2] 🌿 A person, maybe 40s, with a slouched posture checks the pantry before heading out — the shelves are full, ~8 days of fresh on hand… leaves the harvest standing and turns to the wood run instead.` (glutprobe-sense) — judged: instrument-level anonymization (the same beat names villagers in windowseat transcripts and in glutcurvecheck-sense). Not a game bug; see metric review.
47. `[d63] 💬 Elif: "Huh. Never been this way before."` (vgear-s64304, x5 same run) — FLAG → F10.
48. `[d64] 💬 Elif: "Smell that? Something's different here."` / `[d64] 💬 Ricardo: "Smell that? Something's different here."` (vgear-s64304) — FLAG → F10 (shared stock across companions; party.js:358).

### Gossip / want lines
49. `[d96] 👀 James talks about wanting to belong somewhere the way people talk about weather — often, and with no plans to change it. The real wanting is somewhere they keep not looking.` (leadfeast-s66004) — OK. The want system HAS variety: d98 "claims to belong somewhere — then spends the whole evening oriented around something they won't name", d99 "says to belong somewhere is the dream. Funny how the dream never comes up when they're the one choosing what to do with an afternoon." This pool is good.
50. `[d65] 👀 You caught Ivy rehearsing — muttering details about Denver under their breath before the evening fire, like someone cramming for a part.` (leadfeast-s66005) — OK. Specific, plot-loaded, spooky.
51. `[d67] 👀 Someone mentioned Denver and Luna answered to it a beat late — like responding to a name that isn't quite yours.` (leadfeast-s64202) — OK. Same class; good.
52. `[d56] 💬 Omar is sitting with Valeria, talking low. Not business. Just people.` (leadfeast-s66005) — OK. Social life rendered without oversharing.
53. `A cart-driver with flour on their sleeves waits a while, then moves on down the road. Word travels about that, too.` (belongfeast-s66006 d127) — FLAG → F7 (noun-swapped template: weathered trader d130, curious wanderer d132, frightened family d57 s66005).
54. `[d134] 💬 Giulia says: "The voice said 'north.' Just... north. I don't know what it means."` (belongfeast-s66006) — FLAG → F3 (Katarina s66004 d98 verbatim).
55. `[d199→day80] THEM: "Can I tell you something? I can't read, and I'm scared it matters now."` (9501-day80) — OK. Vulnerability, specific, brave.
56. `[d76→day76] THEM: "God. Yes. I dream about soup. Actual soup, with a spoon. You doing okay?"` (9503-day76) — OK. Food-longing as personhood; great.
57. `[d318-ish] THEM: "Nobody is, these days. We're all guessing — some of us just guess louder."` (9504-day45) — OK (mannerism, but content varies across uses).
58. `THEM: "You talk to it -- the System. Have you ever asked? About the taken -- about Zeyu?"` (9504-day45) — OK. Want-driven, name-specific.

Coverage: 58 judged excerpts ≥ 40 required. Gate MET.

## FILED FINDINGS (appended to sim-findings.md)

- F1 [open] 2026-10-21 — villager-voice — ROUTINE DEPARTURE LINES ARE SINGLE STOCK: "X heads out for water. 'The well won't fill itself.'" verbatim for every villager every day (Valeria x26 s66005; Elif x8 s64304; Selorm x8 s66006); forage departures likewise single-stock per villager ("Gone looking. Don't wait up." x5 Sofia; "There's food out there. Going to find it." x5 Ruby — glutprobe-sense d2-9; "Bringing dinner back. One way or another." Joshua; "Out for a forage. If I'm late, start without me." Tariq). Fixable: per-villager voice bank / rotation (named next: villager routine beats; cf. game.js:21420 template family).
- F2 [open] 2026-10-21 — villager-voice — SUBORDINATE MOURNING BEAT REPEATS VERBATIM 3x/SAME DAY: "They're burying their speaker — grain can wait a week; grief can't. Tending resumes when the mourning lifts." x45 in leadfeast-s66005 d70-72 (three in a row each day), x9 s64202 (src/js/hierarchy.js). Distinct from the claimed DEATH-LITURGY TEMPLATING item (that covers Haven death liturgy; this is the linked-village mourning line). Fixable: per-village mourning narration or once-per-day cap.
- F3 [open] 2026-10-21 — villager-voice — GOSSIP LINES ARE VERBATIM STOCK SHARED ACROSS VILLAGERS AND RUNS: "Found a parcel by the hollow. Dried meat, clean water. That has Wren written all over it." (Landon d132, Soo d134 s66006; Katarina d96, Caleb d100 s66004; Valeria d60 s66005; Anjali d67 s64202); "Mara swears she met a stranger who knew things. Things no one should know. I told her she's tired." (Andi d54, Marta d56 s66005; Berna d72 s64202); "They said you're doing well. It sounded... proud? Can they feel proud?" (Henry s66005, Owen s64304, Omar/Daniyar/Adrian across runs); "Smile for the sky, they said. I hate how easy it was to start doing it." (Valeria s66005, Caleb s64304); "The voice said 'north.' Just... north. I don't know what it means." (Giulia s66006, Katarina s66004). Content is often good (the Wren parcel is real village folklore); the word-for-word repetition is the blank. Fixable: rumor pool with per-speaker paraphrase.
- F4 [open] 2026-10-21 — villager-voice — MONSTER-NAMING DEBATE IS A VERBATIM TWO-LINE TEMPLATE: "Back at the haven the argument starts: X is calling it 'Y.' They'll fight it out — weigh in if you want." (src/js/game.js) + "It's settled. The village is calling it 'Y.' The Codex keeps it." — only names change; Marta argues three names in 5 days (Big Loud d54, Big Big d56, Loud-Eyes d58 s66005). Fixable: rotate debate framing; the landed tale-telling beat (4d9c925a) is the model.
- F5 [open] 2026-10-21 — villager-voice — MANTLE-TRANSFER LITURGY IS ONE VERBATIM TEMPLATE: "The Codex doesn't pause for grief. X blinks — and it's already there, overlaying everything, syncing. No pen. No paper. The mantle just... transfers." — Giulia s66006 d132; Elif/Jorge/Suman s66004 d101-102; Hannah/Anjali s64202 d63-64 (src/js/ledger.js, src/js/nomad.js). Same family as the claimed DEATH-LITURGY TEMPLATING item; distinct line. Fixable: rotate per-successor reaction.
- F6 [open] 2026-10-21 — villager-voice — MONSTER REACTION IS ANONYMOUS GENERIC: "Word gets around the haven. Whatever that thing was — everyone's talking about it now." x9 s66005, x5 s64202 (src/js/game.js:21420) — fires after monster events even when the village just named the monster in a debate. Fixable: reference the named monster.
- F7 [open] 2026-10-21 — villager-voice — PASSERBY BEAT IS ONE TEMPLATE WITH A NOUN SWAP: "A cart-driver with flour on their sleeves waits a while, then moves on down the road. Word travels about that, too." (s66006 d127) / "A weathered trader…" (d130) / "A curious wanderer…" (d132) / "A frightened family…" (s66005 d57) (src/js/betrayal.js). Fixable: vary the verbs.
- F8 [open] 2026-10-21 — villager-voice — JOURNEY GOSSIP STOCK: "Did you hear? X just walked away from Haven. Didn't look back." (Lillian 9502-d20, Giuseppe d72, Pearl 9503-d41, Mara 9504-d73, Ruth 9504-d35 — src/js/game.js, src/js/villager-objectives.js); "X is back. Walked in like they'd never left." (Giuseppe/Ruth/Elena/Mara); "Everyone's got a take. Mine's just the one I can live with." verbatim across days/seeds (9501-d16, d45). Fixable: conversation.js gossip pools.
- F9 [open] 2026-10-21 — villager-voice — TONE-TAG LEAK IN SPOKEN DIALOGUE: "— comedy." renders INSIDE quoted spoken lines (7x, journey-deepening-r22 transcripts): THEM "…twice the ground. — comedy." (9501-day86), Reply "…I mean that as a compliment. — comedy.", NPC "…That's still where we are. — comedy.", NARR "…Still on what's been happening. — comedy.". Root cause: convoSpeechMarkers (src/js/conversation.js:2250) appends literal ' — comedy.'/' — anyway.' closers for dry-humor/quick-pace villagers; the dismissal-closer filter (conversation.js:722-729) only strips them on questions/favorHeads, so statements keep the stage direction inside the quote. Reads as a leaked stage direction, not a person. Fixable: render closers outside the quote or replace with natural words.
- F10 [open] 2026-10-21 — villager-voice — EXPEDITION COMPANION BARKS ARE SHARED STOCK: "💬 Elif: 'Huh. Never been this way before.'" x5 same run (s64304 d64); "Smell that? Something's different here." spoken verbatim by Elif AND Ricardo (src/js/party.js:358). Fixable: per-companion bark pool.
- F11 [open] 2026-10-21 — villager-voice — TEACH GOSSIP IS ONE TEMPLATE: "X showed Y the <descriptor> — 'remember it.' Word gets around." — same plant descriptor repeats verbatim down teach chains (fan-leafed tree x4 on d69 s64304; onion-smell descriptor x2 same day s66006). The descriptor-first form is canon-correct knowledge gating (judged good); the narrator sentence is the stock line. Fixable: small narration pool for teach beats.
- F12 [open] 2026-10-21 — villager-behavior — WATER-HAUL INTO A FULL CISTERN, UNNOTICED: s66005 d54 — "💧 Marta returns with 14L, but the cistern only holds 13L more." then "returns with 17L, but the cistern only holds 0L more." (same day); s64202 d63 — Hannah makes three trips into 0L space (13L/12L/16L) in one day. The narrator honestly reports the waste; no villager notices. A person checks the cistern. Fixable: check cistern space before departure / carry less.
- F13 [open] 2026-10-21 — villager-voice — REDUNDANT EVASION TEMPLATE: "Quick version — Short version: I don't know. Long version: also that, but slower." (9502-day57, 9504-day78) — two filler openers merged ("Quick version — " + "Short version:"). Fixable, minor: conversation.js evasion pool.

None of these is a steve-call: all are fixable execution/voice-pool gaps, not design rulings. (The two steve-call backlog entries were not touched.)

## METRIC REVIEW
- Coverage gate met as pre-registered (58 judged excerpts ≥ 40; 10 runs ≥ 8; leadfeast/belongfeast/competent). No re-scoring: the corpus was read as pre-registered; no metric changed mid-run.
- The pre-registration listed supplement corpora to reach the run-span gate; used exactly as planned (indispensablediag, glutprobe/glutcurvecheck sense, journey-deepening-r22 competent probes). No deviation.
- Two flagged behaviors overlapped already-filed items: "Nobody's talking much. The fire feels smaller tonight." and the death-liturgy double-cause lines are covered by the sibling arm's claimed DEATH-LITURGY TEMPLATING BLANKS item (claimed 2026-10-21) — judged, not refiled. F2/F5 are same-family but distinct lines, filed separately with cross-references.
- glutprobe-sense's "A person, maybe 40s, with a slouched posture" anonymization is instrument-level (the same routine beat names villagers in windowseat transcripts and in glutcurvecheck-sense.txt) — not a game finding; noted for the sense-script owner only.
- "— comedy." tag leaks and the F13 template were found ONLY in journey-deepening-r22 conversation probes (conversation.js DNA markers), not in the SEATDRIVE windowseat SAY lines — the winning substrate's ambient villager beats don't show this class; the conversation system's marker pool does.
- Instrument `scripts/sample-villager-sense.js` committed with this run; output is a reading aid, not a verdict — every quoted excerpt was read by the assessor in source.
- DIAGNOSTIC arm: zero src/js changes. All flags filed to the backlog with file+day evidence; 0 fabricated findings.
- GO: coverage met + 13 findings filed with evidence. Arm verdict: GO (diagnostic).
