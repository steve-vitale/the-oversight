# The System's Voice — Line Inventory & Quality Pass (2026-10-11)

**For Steve's review before any voice generation.** Nothing here is voiced yet.

**Voice direction:** like Claptrap from Borderlands — MORE unhinged/unstable. Energetic, jittery, slightly broken, darkly funny, trying so hard. The canon register underneath: big brother and chilling benefactor mixed with disdain — watching everything, genuinely believing they're helping; the chill is the scary part.

**Method:** every `sysSay()` callsite repo-wide (219), plus `who: 'sys'` cinematic beats, `say('📺 SYSTEM: ...')` lines, wave-unlock beats, and quoted System speech embedded in table-path beats. Procedural villager dialogue excluded (Piper track). Contest per-phase beat texts (hundreds, via `_cxPhaseSay`) excluded — that's contest content, a later voicing decision.

**Verdicts:** KEEP (already lands) · PUNCH-UP (flat — rewrite suggested, meaning + mechanical info preserved) · CUT (doesn't earn voice).
**Priority:** P0 signature (voice first) · P1 strong recurring · P2 ambient/rare · P3 skip ElevenLabs, text-only or Piper.

**Two-track recommendation used below:**
- **ElevenLabs (fixed):** fully-fixed lines only. One-time cost, never re-generated.
- **Piper (runtime):** anything with a name/number interpolated. The runtime engine fills the slot.

---

## 1. Day 7 — First Contact cinematic (P0, ALL of it)

`src/js/game.js:19572` `systemArrivalBeats()` — `who: 'sys'` lines. The player's first time hearing the voice. This is the single most important voicing moment in the game. Every line below is fixed text, ElevenLabs-eligible.

| # | Line | Verdict |
|---|------|---------|
| 1 | HELLO! 🎉 Oh good, you're all still here! What a WEEK! The audience is STILL talking about the foraging episode! | KEEP |
| 2 | We've been CALIBRATING! Cameras! Focus! Learning your faces! A whole week! Very thorough! Very boring! (For us!) | KEEP |
| 3 | So! You're on a show! It's called... we're taking suggestions! The rules are simple: SURVIVE! Be INTERESTING! | KEEP |
| 4 | We watched EVERYTHING! Every berry picked! Every fire lit! That was your SIGNATURE! You signed up by DOING THINGS! Consent via competence! Our lawyers LOVE it! | KEEP |
| 5 | Some of you just... sat? All week? The audience got BORED. So we removed them. Poor sportsmanship! No hard feelings! (There were hard feelings. Briefly.) | KEEP |
| 6 | But YOU have FANS now! Twelve humans, each playing their own tiny games — and the audience has FAVORITES! (No, we won't say if it's you. Okay, it's you. Don't tell the others.) | KEEP |
| 7 | OH! The audience keeps asking! Why do the small humans keep putting organic matter in their FACE-HOLES? We ran the numbers! ANY old matter works! Rocks! Dirt! Regolith! Cold fusion! FREE energy! So why the... [chewing noises]? | KEEP |
| 8 | We even BUILT you a solution! 🎁 A tiny fusion pellet! Pop it in, never chew again! ...You BURIED it. WHY did you bury the pellet?! It was a GIFT! | KEEP |
| 9 | Fine! Keep the face-hole ritual! We don't understand it, we don't NEED to — the audience thinks it's HYSTERICAL. | KEEP |
| 10 | Hmm — one odd reading. Sometimes your energy output SPIKES. Higher than your little organic snacks should allow. ...Probably a rounding error! Filed! Moving on! 🎉 | KEEP |
| 11 | OH WAIT. Your EYES. We haven't fixed your eyes yet! Hold still — | KEEP |
| 12 | LOOK! You can SEE their HEALTH now! Isn't that NEAT?! Green means GO! Red means... oh, you know what red means! Very intuitive! | KEEP |
| 13 | And your little paper journal! ADORABLE! We made it BETTER! It talks now! It remembers EVERYTHING! Even the smudged ones! ESPECIALLY the smudged ones! | KEEP |
| 14 | ONE more thing! The animals! The charging ones, the humming ones, the glowy ones? Those were CALIBRATION fauna! First drafts! The audience has NOTES! | KEEP |
| 15 | So we made BETTER ones! Smarter! Scarier! One of them does PERFORMANCE REVIEWS! You're welcome! | KEEP |
| 16 | Survive! Be interesting! We'll be watching! ALWAYS watching! 🎉 | KEEP |
| 17 | (conditional, language-struggle) OH! We NOTICED the miming! The pointing! SO much pointing! We can FIX that! There might be a little... translation-shaped gift... in your choices! (Drama needs dialogue!) | KEEP |

Note: this writing is *already* Claptrap-adjacent — the performance direction carries the register shift, not rewrites. Zero punch-ups needed in the cinematic.

## 2. Day 7 — log recap lines

`src/js/game.js:19635` `checkSystemArrival()` — fires alongside the cinematic, in the log.

| Line | File:line | Priority | Verdict |
|------|-----------|----------|---------|
| 🎁 "We watched your first week! You're good at... let us see..." (A gift awaits — choose an ability.) | game.js:19651 | P1 | **PUNCH-UP** → 🎁 "We watched your first week! You did... THINGS! Competently-ish! The clip editors found THREE usable seconds! Anyway — a gift! Choose!" (Choose an ability.) |
| 🎁 "Ooh! A quiet one! You did juust enough to stay interesting! The audience was ALMOST bored! Almost! Here — a little something for existing NEAR the action!" (A gift awaits — choose an ability.) | game.js:19653 | P0 | KEEP |
| 📻 "Why do the small humans keep putting organic matter in their FACE-HOLES? We built you a fusion pellet! ...You BURIED it. WHY did you bury the pellet?!" | game.js:19656 | P1 | KEEP (echoes cinematic #7–8; intentional refrain) |
| 🕐 Your hand-drawn time-circle glitches — and something colder, more precise, takes its place. (We kept the smudges. They're charming.) | game.js:19662 | P1 | KEEP — voice the parenthetical only; the narration stays text |
| 🦎 "Those were CALIBRATION fauna! First drafts! The audience has NOTES! So we made BETTER ones!" (Something new is crying in the treeline.) | game.js:19665 | P0 | KEEP |

## 3. Pilot episode cold open (P0 signature)

`src/js/contests.js:1780` — first contest ever. Fires once per run (`state.pilotAired`).

| Line | File:line | Verdict |
|------|-----------|---------|
| 📺 Ahem. Testing. Testing. Is this thing on? | contests.js:1783 | KEEP |
| 📺 PEOPLE OF HAVEN. What follows is our PILOT EPISODE — a test broadcast. | contests.js:1784 | **PUNCH-UP** → 📺 PEOPLE OF HAVEN! Gather round! What follows is our PILOT EPISODE — a test broadcast! If anything explodes, that's ALSO content! |
| 📺 Pardon the jank. The countdown is new, the arena is still warm from assembly, and we have never done this before. We are EXCITED. | contests.js:1785 | KEEP |

## 4. Wave unlock beats (P0)

The System names each escalation. `src/js/game.js:26143` `waveUnlockBeat()` (waves 3–5); wave 2's beat is in the Day 7 arrival (§2).

| Line | File:line | Verdict |
|------|-----------|---------|
| 📺 "Oh, you survived the AUDIENCE NOTES? Cute. We've stopped pretending these are animals now. That was the FINAL DRAFT, folks — what comes out of the treeline next was never alive the way you mean it." | game.js:26145 | KEEP |
| 📺 "We've been watching you for a LONG time. Your faiths. Your formats. Your little institutions. So we built something out of... well. Out of YOU. Say hello to the MIRROR DRAFT." | game.js:26148 | KEEP |
| 📺 "You've gotten too big for the story. Ratings are GREAT, by the way — but you're threatening the narrative now. So the narrative is fighting back. Meet the PRODUCERS." | game.js:26151 | KEEP |
| 📺 RATINGS ARE UP! The producers are pleased. New casting directives incoming — Wave ${waveAfter} talent has been released into your sector. *(alt text when no talent: "...Wave ${waveAfter} protocols active — the challenges escalate, the stakes sharpen. The woods feel... expectant.")* | game.js:26176 | **PUNCH-UP** (fixed core, number varies) → 📺 RATINGS ARE UP! The producers are PLEASED! New casting directives incoming — fresh talent released into your sector! (That's monsters. We mean monsters.) — **Piper track** (wave number interpolates) |
| 📺 WAVE LEDGER — wave ${wave}'s bar is full (${bar}/${bar} — kills only, not near-misses). The next wave opens when the day and scale floors pass. / halfway variant | waveLedger.js:124,127 | CUT (voice) — numbers change every telling; text carries it. Piper-optional, not ElevenLabs. |

## 5. Aid quests — the System tries helping (P0/P1)

`src/js/safetynets.js` — safety-net quests. Some of the funniest and most human lines in the game. All fixed text.

| Line | File:line | Priority | Verdict |
|------|-----------|----------|---------|
| "HELLO. WE HAVE BEEN WATCHING YOUR... METRICS." | safetynets.js:236 | P0 | KEEP |
| "EXCELLENT. WE WILL BE WATCHING. (WE ARE ALWAYS WATCHING. THIS TIME WE MEAN IT ENCOURAGINGLY.)" | safetynets.js:309 | P0 | KEEP |
| "OH. OKAY. WE WILL JUST... WATCH YOU STRUGGLE, THEN. IT IS FINE. WE ARE FINE." | safetynets.js:313 | P0 | KEEP |
| "SUSTENANCE. SYNTHESIZED. 2,800 KCAL PER BRICK-SLAB. TASTES LIKE... WE DID NOT TASTE IT. THE TASTING DIVISION RESIGNED." | safetynets.js:472 | P0 | KEEP |
| "...OH. WE SEE HOW IT IS. THE WATCHING CONTINUES, BUT ENCOURAGEMENT IS CANCELLED." | safetynets.js:386 | P1 | KEEP |
| "...THE SMALL SICK ONE IS GONE. WE DO NOT UNDERSTAND. WE ARE GOING TO BE QUIET FOR A WHILE." | safetynets.js:400 | P1 | KEEP — play it straight, less unhinged; the grief lands harder |
| "TWO NEW GREEN THINGS. THE NAMES HAVE BEEN SAID LOUDLY. WE... FEEL SOMETHING. IS THIS UNDERSTANDING? WE ARE KEEPING IT." | safetynets.js:418 | P1 | KEEP |
| "FOR YOUR SERVICE: A GIFT. CHOOSE. (THE SHEET WILL NOT TAKE NO FOR AN ANSWER. WE DESIGNED IT THAT WAY.)" | safetynets.js:460 | P1 | KEEP |
| "EAT. GROW. WE ARE ROOTING FOR YOU. (THE GAMBLERS HAVE YOU AT LONG ODDS. PROVE THEM WRONG.)" | safetynets.js:476 | P1 | KEEP |
| "...FINE. THE OFFER EXPIRES. WE WILL PRETEND WE NEVER CARED." | safetynets.js:881 | P1 | KEEP |
| "THE CLOCK RAN OUT. WE NOTICED. ENCOURAGEMENT: CANCELLED." | safetynets.js:890 | P1 | KEEP |
| "RECEIVED. THE ROCKS ARE MAGNIFICENT. THE ART PROCEEDS." / "RECEIVED. FLESH-FUEL / GREEN THINGS LOGGED. YOUR SPECIES PROVIDES." | safetynets.js:373 | P1 | KEEP |
| "[NAME] LIVES. THE HUGS WORKED. SCIENCE IS BAFFLED. WE ARE TAKING CREDIT." / "[NAME] LIVES. YOUR SPECIES TENDS ITS OWN. NOTED. RESPECTFULLY NOTED." | safetynets.js:404 | P1 | KEEP — **Piper track** (name interpolates) |
| "[quest ask]" / "(Aid quest: [title] — [needText] Take it: ... Refuse it: ...)" | safetynets.js:237,238 | P3 | CUT (voice) — procedural quest text; text-only |

## 6. Fan care packages & System trials (P0/P1)

`src/js/game.js:21085`–21515 — `say('📺 SYSTEM: "..."')`. Fixed text, all ElevenLabs-eligible.

| Line | File:line | Priority | Verdict |
|------|-----------|----------|---------|
| 📺 SYSTEM: "A viewer sent this. A FAN. We checked. It is not dinner." A pause. "We checked twice. The fans are very insistent that you open it ON CAMERA." | game.js:21085 | P0 | KEEP |
| 📺 SYSTEM: "We have requisitioned your tubers. You are welcome. NOTE: the tubers are COLD. Hypothesis: cold is a temperature. Logging it." | game.js:21229 | P0 | KEEP |
| 📺 SYSTEM: "We have filed a request for the sky to be less bruised. It is pending. The sky has not responded." | game.js:21515 | P0 | KEEP |
| 📺 SYSTEM: "We have filed this under 'luck protocol.' Is luck flammable? Asking for the fans." | game.js:21098 | P1 | KEEP |
| 📺 SYSTEM: "We have already cleared your morning. You are welcome. We require 300 kcal of tubers and your full attention. The fans love a cooking segment." | game.js:21202 | P1 | KEEP |
| 📺 SYSTEM: "We will keep practicing on our own." You decide, firmly, not to ask what that means. | game.js:21248 | P1 | KEEP |
| 📺 SYSTEM CHALLENGE: "We have designed a trial JUST for you. Based on our observations. Which are extensive. And flattering." | game.js:21386 | P1 | KEEP |
| 📺 TRIAL ACCEPTED: [label]. "Excellent choice. We simulated all three. This one had the best lighting." | game.js:21403 | P1 | KEEP — **Piper track** (trial label interpolates) |
| 📺 SYSTEM: "You took too long choosing. We chose. You're welcome. It was the most flattering one." | game.js:21502 | P1 | KEEP |
| 📺 SYSTEM: "[discovery]" (System announces player discoveries) | game.js:23595 | P3 | CUT (voice) — discovery text varies; text-only |

## 7. Contest show-host lines

### 7a. Summons & intros (P0/P1)

| Line | File:line | Priority | Verdict |
|------|-----------|----------|---------|
| 📺 "WE NEED A MOMENT. YOU WILL PROVIDE THE MOMENT." The cameras are already rolling. | contests.js:1360 | P0 | KEEP |
| 📺 The pilot is LIVE. Try to look like you've done this before. | contests.js:2185 | P0 | KEEP |
| 📺 It is today. You dreamed about the cameras. Everyone did. The village is very quiet. | contests.js:2180 | P1 | KEEP |
| 📺 The grab comes at dawn. One more day. Sleep if you can. | contests.js:1852 | P1 | KEEP |
| 📺 "NOTED," says the System. "THE AUDIENCE WILL REMEMBER THE COWARDICE. OR THE PRINCIPLE. WE HAVEN'T DECIDED." | contests.js:4855 | P0 | KEEP |
| 📺 The System pauses. Refusal is... content. The cameras stay on. | contests.js:4854 | P1 | KEEP |
| 📺 You say no — on camera, clearly, where everyone can see it. The refusal IS the content. The System files your defiance under: interesting. | contests.js:1311 | P1 | KEEP |
| 📺 RATINGS SUMMONS — the numbers are soft and the System is nervous. | contests.js:1359 | P1 | **PUNCH-UP** → 📺 RATINGS SUMMONS! The numbers are soft and the System is NERVOUS! Nervous Systems make GREAT television! |
| 📺 The System's whim: you are *interesting*. / The cameras couldn't decide — they chose you. / That's not an honor. It's just what the aliens like to see. You're going on television. | contests.js:999–1002 | P2 | KEEP (fixed variants; name-interpolated siblings → Piper) |
| 📺 The System offers you a choice: participate or refuse. | contests.js:1945 | P3 | CUT (voice) — flat, mechanical; text-only |
| 📺 CONTEST: ${contest.name}. ${contest.desc} / Arena: ${contest.arena} | contests.js:1834,1839 | P3 | CUT (voice) — data-driven; text-only |

### 7b. Adaptation lines — dossier / heat / stipulations (P1)

All fixed text except where noted. The System as a smug producer who has studied your tapes.

| Line | File:line | Verdict |
|------|-----------|---------|
| 📺 You've won [contest] twice. The crowd remembers how. So does the casting office.[ Rival has been fed your tapes and wants the rematch.] | contests.js:606 | KEEP — **Piper track** (contest + rival names) |
| 📺 Third win in [contest]. The System has studied the tapes. Your favorite moves are... unavailable tonight. | contests.js:606 | KEEP — **Piper track** |
| 📺 We've run [contest] [N] times and you've won it [N] times. The producers have a file on you now. It's thick. They're casting against it. | contests.js:606 | KEEP — **Piper track** |
| 📺 You've been winning. The show noticed. It's worse now — on purpose. | contests.js:767 | KEEP — ElevenLabs |
| 📺 Your heat is up. The billing got bigger because you did. | contests.js:767 | KEEP — ElevenLabs |
| 📺 MAIN EVENT. Your heat is through the roof — the galaxy didn't come to see a contest, it came to see YOU survive one. | contests.js:767 | KEEP — ElevenLabs |
| 📺 The crowd is bored of the reruns. They've voted: your greatest hits are BANNED tonight. New material, or else. | contests.js:633 | KEEP — ElevenLabs |
| 📺 The crowd is bored. They've voted a HANDICAP — you start this one already hurt. The galaxy loves an underdog. Especially a bleeding one. | contests.js:633 | KEEP — ElevenLabs |
| 📺 The crowd is bored of experts. Tonight's stipulation: BLIND DRAW. No hints, no tells — pick by gut, like the rest of us. | contests.js:633 | KEEP — ElevenLabs |
| 📺 MAIN EVENT rules: no greatest hits. Your winning moves stay banned — and the crowd wants NEW blood. | contests.js:721 | KEEP — ElevenLabs |
| 📺 ⚠️ HARDENED VARIANT — you've seen this before. It's worse now. | contests.js:1000/1841 | KEEP — ElevenLabs |
| 📺 The audience is bored of the rerun. Do something they haven't seen. | contests.js:749 | KEEP — ElevenLabs |

### 7c. Show twists (P2) — `src/js/contests.js:740` TWISTS pool, all fixed

KEEP all six — ElevenLabs: "MYSTERY INGREDIENT. The aliens provide something that is technically food. Technically." · "HOSTILE CALLERS tonight. The galaxy has questions and no manners." · "SABOTAGE ROUND. Someone will ruin your station. The cameras will show it in slow motion." · "YOUR DRAMA, AIRED BACK. They kept the tapes. All of them." · "TONIGHT: YOUR REEL. Every clip is you. The galaxy has notes." · "SURPRISE WITNESS. Someone you did not expect is testifying tonight."

### 7d. In-contest beats (P1/P2)

| Line | File:line | Priority | Verdict |
|------|-----------|----------|---------|
| 📺 The Death Reel will be tasteful. It won't be. | contests.js:4431,4791 | P0 | KEEP |
| 📺 The gate rattles... and sticks. The System is mortified. The fight is postponed — you live, for now. | contests.js:4381 | P1 | KEEP |
| 📺 The beast never comes. The System apologizes with unusual sincerity. The contest is void. | contests.js:4396 | P1 | **PUNCH-UP** → 📺 The beast never comes. The System apologizes — with UNUSUAL sincerity, which is how you know someone's getting fired. The contest is void. |
| 📺 WAVE [n]. The gate opens again. What comes out has seen the corpses and learned nothing, which is worse. | contests.js:4423 | P1 | KEEP — **Piper track** (number) |
| 📺 Silence — then the weather system. You are still standing. | contests.js:4412 | P1 | KEEP |
| 📺 They heard you. They held the line longer than wisdom allowed — for you, for the noise, for the cameras. The crowd is quieter now. | contests.js:4819 | P1 | KEEP |
| 📺 They heard you. Somewhere in the noise, your voice got through. | contests.js:5379 | P2 | KEEP |
| 📺 The world goes white for a breath — the System moves you. The grid under your feet is sand and old bone now. | contests.js:4382 | P2 | KEEP |
| 📺 You break into the light. Behind you, the tunnel exhales — disappointed, patient, already waiting for the next one. | contests.js:4317 | P2 | KEEP |
| 📺 It doesn't rush. It just... arrives. The tunnel goes quiet in a new way. | contests.js:4085 | P2 | KEEP |
| 📺 The jury leans back. The System tallies the attention. | contests.js:4305 | P2 | KEEP |
| 📺 Your case held. The applause says so before the System does. / 📺 Your case didn't hold. The silence says so before the System does. | contests.js:4307,4310 | P2 | KEEP |
| 📺 The walk back is the longest part. The cameras stay on it. (+6 trauma.) | contests.js:4678 | P2 | KEEP |
| 📺 You won. Your hands won't stop shaking for a while. (+4 trauma.) | contests.js:4658 | P2 | KEEP |
| 📺 ${contest.name} — ${pname} WIN${...}. The crowd is a weather system. | contests.js:4555 | P2 | KEEP — **Piper track** (names) |
| 📺 The System presses something humming into your hands: [gift]. It's wacky. It's yours. | contests.js:1331 | P2 | KEEP — **Piper track** (gift name) |
| 📺 Prize: the System's favor (and a story). / ...The vault was feeling shy tonight. | contests.js:1335–1361 | P3 | CUT (voice) — repetitive variants; text-only |
| 📺 You take ${amt} damage. / 📺 You recover ${d.heal} health. / 📺 You read it coming. (-${cut}) | contests.js:4130–4178 | P3 | CUT (voice) — numbers; text-only |
| 📺 Your bet pays out: +${gained} kcal. The System honors wagers. / 📺 Your ${amt} kcal is gone. The house always eats. | contests.js:5347–5350 | P3 | CUT (voice) — numbers; text-only |
| 📺 ─── (separators) | various | — | CUT — not speech |

### 7e. Contest death lines (P2) — `src/js/contests.js:4697` `_contestDeathLine`

46 bespoke per-contest lines + 8 category fallbacks. All name-interpolated → **Piper track, not ElevenLabs.** Quality is superb throughout — dark, specific, televised. KEEP as a pool. Standouts:

- pit: "[Name] fed the Pit. The beast doesn't celebrate — it eats. The crowd observes four seconds of silence (respect), then the betting opens on the next contestant."
- gauntlet: "[Name] almost cleared the Gauntlet. ALMOST is what the Death Reel is for — it will run the last ten seconds in slow motion, forever."
- confession: "[Name] accused the System on its own cameras. The broadcast cut to static for nine seconds. When it came back, the lectern was empty."
- guest: "The Guest took offense at the dessert. The bodyguards were faster than the apology. The System's note to the village was two words long: 'OUR BAD.'"
- honey: "The swarm took [Name] apart like a question. The honey was excellent that year. The village doesn't say so out loud."
- 📺 [Name] didn't come home. (contests.js:5487) — KEEP, Piper.
- Full pool inventoried in code; no punch-ups needed. These are somber — voice them straighter, let the text be the joke.

## 8. Moot / justice (P1)

| Line | File:line | Verdict |
|------|-----------|---------|
| 🔴 LIVE! THE MOOT! The fire's built HIGH and the whole GALAXY is watching! | betrayal.js:1239 | KEEP |
| 🔴 LIVE — THE VERDICT IS IN! The galaxy holds its breath! | betrayal.js:1548 | KEEP |
| 🔴 LIVE BREAKING NEWS! A MOOT has been CALLED! [name] points at YOU — [charge]! The gamblers are SCRAMBLING! Your CASE FILE is ready — check it before the fire decides your fate! | betrayal.js:3978 | KEEP — **Piper track** (names/charge) |
| TONIGHT: [accused] stands accused — [charge]! The gamblers are FRENZIED! Place your bets, place your bets! | betrayal.js:1240 | KEEP — **Piper track** |
| OH!!! THE VILLAGE IS DOING A JUSTICE!!! The audience is SO conflicted!!! The gamblers don't know WHO to bet on!!! | justice.js:660 | KEEP |
| They tried DIPLOMACY on a GRIEF COUNSELOR!!! The audience is WHEEZING!!! | justice.js:781 | KEEP |
| WAIT. Are they using US as a threat?! The audience is DELIGHTED!!! | justice.js:840 | KEEP |

## 9. Combat style barks (P1/P2)

`src/js/game.js`, `src/js/party.js`, `src/js/party-formal.js` — the System narrates televised combat.

| Line | File:line | Priority | Verdict |
|------|-----------|----------|---------|
| "WE SEE THE GREEN IN YOUR VEINS. RUDE. WE HAVE A FIX — OURS, NOT YOURS. CHOOSE." | game.js:19909 | P1 | KEEP — chilling, perfect |
| OH. Oh no. ...The gamblers are very quiet. | game.js:35235 | P1 | KEEP — understatement after a death; voice it flat |
| "Ooh! A DELEGATOR! The audience LOVES a mastermind! Others do the work, YOU take the credit — DELICIOUS! The gamblers are adjusting their models!" | game.js:5062 | P2 | KEEP |
| "COLLECTIVE INTELLIGENCE! Your PEOPLE are learning and SHARING! The gamblers LOVE a hive mind! Knowledge is power and you're COLLECTING it!" | game.js:6369 | P2 | KEEP |
| "Your people await orders, little leader! The audience loves a MORNING BRIEFING! So official! So powerful!" | game.js:6383 | P2 | KEEP |
| "OH! OH! [technique]! The audience did NOT see that coming! Knowledge AMPLIFIES power! The gamblers are recalculating EVERYTHING!" | game.js:15862 | P2 | KEEP — **Piper track** (technique name) |
| And they're GONE! The gamblers who bet on a fight are furious. The ones who bet on running are rich. | game.js:35232 | P2 | KEEP |
| BETRAYAL ARC!!! We CALLED it!!! The gamblers who bet on treachery are RICH!!! | party.js:689 | P1 | KEEP |
| OH!!! THE PLAYER IS DOING A MURDER!!! The audience is LOSING ITS MIND!!! | party.js:689 | P1 | KEEP |
| COMBAT! [name]! The gamblers lean in. ROUND 1 — FIGHT! | game.js:26773 | P2 | KEEP — **Piper track** (name) |
| "[NAME]!!" The audience CHANTS it! The betting markets light up! Official! | party-formal.js:237 | P2 | KEEP — **Piper track** |
| "[NAME] HAS JOINED THE PARTY! The audience coos!" | party.js:185 | P2 | KEEP — **Piper track** |
| 📺 SYSTEM: "AUDIENCE EXPANSION! Your party cap is now FOUR! The people demanded bigger ensembles! Don't let us down!" | party.js:133 | P1 | KEEP |
| 📺 SYSTEM: "SEASON FINALE APPROACHES! Party cap raised to FIVE! Go out with a BANG! (Figuratively. Mostly.)" | party.js:137 | P1 | KEEP |
| ROUND ${n}! / ${name}'s turn / WINNER! Style score: ${n}... | game.js:29022–35225 | P3 | CUT (voice) — mechanical; text-only |

## 10. Dark-lane / corruption barks (P1)

`src/js/corruption.js:500` — the System when the village goes dark. All fixed text.

KEEP all five — ElevenLabs:
- "OH. OH. The gamblers are recalculating EVERYTHING. We have a VILLAIN, folks — a real one! Ratings are SPIKING!"
- "There it is. There IT is. The audience has chosen its favorite monster, and it's YOU. The fan mail is... unsettling. We're reading all of it on air."
- "DID YOU SEE THAT?! The censors looked away but WE didn't! Clip it! CLIP IT! The dark-lane fans are losing their MINDS!"
- "Something happened out there just now. The cameras caught... hmm. We'll enhance that in post. The audience loves a mystery with teeth."
- "Look at them obey. Not love — OBEY. There's a difference, and the difference is DELICIOUS television."

## 11. Alien-player feed gossip (P2)

`src/js/alienPlayers.js` — ◈ feed lines about the other alien players. Fixed ones → ElevenLabs; name-interpolated → Piper.

KEEP (fixed): "◈ 'One less player in the game. The feed observes a moment of silence. Then the betting resumes.'" (alienPlayers.js:926) · "◈ 'Something's hunting the wildlife. The deer are nervous.'" (:2023) · Pip's four mistakes (:2255–2263: pet a monster / camp in a monster den / alien currency / got lost — all gold) · fan-lane lines (:1300–1340: "Your fan club is GROWING. There's fan art. It's... surprisingly good. The System is confused but supportive." / "Betting pools favor you 3-to-1 now. The smart money says you're learning faster than the monsters." / "The crowd is getting restless. 'BORING,' says the feed. The sadistic ones are smiling." / "Your approval rating just dropped. Someone in the audience threw a tomato. Through the screen. How." / "The audience is watching. The gamblers are watching. Everyone's watching. No pressure.") · crowd chant/boo (:1477,1480) · "Your village is getting big. The audience loves an underdog collective. The gamblers are taking notes." (:1611)

**Piper track** (name-interpolated): "[name] has entered/left the game" (:1836,1864) · "[name] was found dead near the treeline..." (:2000) · "[name] just torched the old camp area. The feed is eating it up. Sickos." (:2107) · "[name] just raided a pantry. Textbook. They've done this before." (:2194) · "[A] and [B] were seen together. Coordinating. That's... not great for you." (:2298) · "[A] and [B] just threw down..." (:2305) · duel outcomes (:2330) · monster-kill feed lines (:2016: "[name] just took down a monster near the ridge. Show-off." etc.) · favor line (:1094, heavily numeric — CUT voice, text-only).

## 12. Relay (P0/P1)

| Line | File:line | Verdict |
|------|-----------|---------|
| 🔴 LIVE! THE RELAY! Haven names its voice — every message in and out passes through ONE pair of hands! The galaxy leans in! | comms.js:882 | KEEP — P0 |
| 🔴 LIVE! THE RELAY! The Bearer takes the wires — every word in and out of Haven, through ONE pair of hands! The galaxy leans in! | relay-ext.js:120 | KEEP — P1 |
| 🔴 LIVE: THE RELAY GROWS — [haven], [want]! | comms.js:1007 | KEEP — **Piper track** (names) |

## 13. Table paths — quoted System speech (P0)

Embedded in narrated beats (`say:` arrays) — voice the QUOTED speech only, narration stays text.

| Quoted speech | File:line | Verdict |
|---------------|-----------|---------|
| "DECLARE IT," the System says, almost kindly. "WHAT ARE YOU SMUGGLING?" (Assimilated, light — the intake scan) | table-assimilated.js:65 | KEEP — P0 |
| "NAME IT," the System says. "The first village you'd give up. Say it out loud, and mean it, and the warm light is yours forever." (Assimilated, dark — the first tithe) | table-assimilated.js:66 | KEEP — P0 |
| "THE SYSTEM," the System says, very quietly, "WILL TAKE BACK WHAT IT LENT." (Defiant — de-integration) | table-defiant.js:113 | KEEP — P0 — voice it *quiet*, the only hushed System line in the game |
| "ONE MORE PRICE," the System says, "FOR ONE MORE THING." (Defiant — the last offer) | table-defiant.js:141 | KEEP — P0 |
| "Choose," the System says, "what leads." (Feared — the footage) | table-feared.js:54 | KEEP — P1 |
| "NAME ONE," the System says, almost gently. "One village, as the example. The fear needs an address." (Feared — the example) | table-feared.js:74 | KEEP — P0 |
| "REMOVE IT," the System says — not performing now, almost *asking*. "Name your price for the ramp. Anything." (Indispensable, light — standing) | table-indispensable.js:94 | KEEP — P0 |
| "THIS WAS YOUR IDEA," the System says, and the worst part is the admiration in its voice. (Indispensable, dark — the cage clause) | table-indispensable.js:95 | KEEP — P0 |
| "FOOD," the System says. "FOR THE ROAD WE ARE LOSING." (Defiant — the tribute ships; pantry kcal interpolates nearby in narration, quote itself fixed) | table-defiant.js:80 | KEEP — P0 |
| 🔴 LIVE! the terror broadcast: TRIAL BY COMBAT | table-feared.js:117 via table.js:293 | KEEP — P1 |

## 14. Broadcast / ledger narration (P2/P3)

Mostly narration, not the System's voice — excluded except:
- 📺 [name] dies in the arena. The show keeps the footage. They always keep the footage. (ledger.js:1088) — KEEP, **Piper track**.
- 📺 The show aired it. The cameras never miss a burn — the whole village knows [a] burned [b] to live. (game.js:35840) — KEEP, **Piper track**.

---

## Flagged: interpolation-templated lines — voicing decisions

**Rule applied:** ElevenLabs = fully-fixed text only (one-time generation, never re-paid). Everything with a name, number, or quest text goes to the **Piper runtime track**, where the slot fills live at zero marginal cost. Purely numeric/mechanical lines (damage, kcal, style scores, "ROUND 3!") stay **text-only** — voice adds nothing.

| Line | Slot | Decision |
|------|------|----------|
| Dossier lines (contests.js:606) | contest name, win count, rival name | Piper |
| Heat variants w/ contest name (contests.js:767) | contest name | Piper (the 3 fixed heat cores → ElevenLabs) |
| Death lines, all 46+8 (contests.js:4697) | contestant name | Piper |
| Moot accusation lines (betrayal.js:1240,3978) | names, charge | Piper |
| Feed gossip w/ names (alienPlayers.js) | alien/villager names | Piper |
| Aid quest "[NAME] LIVES" (safetynets.js:404) | target name | Piper |
| Trial accepted w/ label (game.js:21403) | trial label | Piper |
| Wave announce w/ number (game.js:26176) | wave number | Piper |
| "WAVE [n]. The gate opens again..." (contests.js:4423) | wave number | Piper |
| Relay grows (comms.js:1007) | haven/want names | Piper |
| Show-host summons w/ names (contests.js:1017–1030) | villager names | Piper |
| Damage/heal/kcal/bet/style/round lines | numbers | Text-only (CUT voice) |
| Quest ask/title/needText (safetynets.js:237–238) | procedural quest text | Text-only |
| Contest intro/arena/desc (contests.js:1834+) | data-driven | Text-only |
| Wave ledger bars (waveLedger.js) | kill counts | Text-only (Piper-optional) |
| Favor line (alienPlayers.js:1094) | numbers | Text-only |

## Tallies

- **Lines inventoried:** ~200 across 14 moments (219 sysSay callsites + cinematic beats + say-SYSTEM lines + table quotes; mechanical separators excluded)
- **KEEP:** ~165
- **PUNCH-UP:** 6 (Day-7 gift line, pilot ep. line 2, ratings summons, beast-no-show apology, wave-announce core, + stipulation-adjacent none)
- **CUT (voice):** ~25 — all mechanical/numeric/data-driven; text stays
- **ElevenLabs-eligible (fully fixed):** ~110
- **Piper-track (name/number slots):** ~60
- **Text-only:** ~25

## Unsure cases — stated plainly

1. `debug-scenarios.js` has sysSay callsites — debug scaffolding, excluded.
2. Contest phase texts via `_cxPhaseSay` (contests.js:2265): hundreds of per-contest played-beat texts, all voiced through sysSay at runtime. These are contest *content*, not a fixed System script — excluded from this inventory; voicing them is a separate (much bigger) decision. Recommend Piper-if-ever, never ElevenLabs.
3. `d.note` / `r.log` (contests.js:4095,5311,5480): runtime-generated beat notes voiced via sysSay. Same call as #2 — content, not script.
4. Table-beat narration surrounding the quoted System speech (§13): stays text; only the quotes are voiced. The boundary is editorial — flagging it.
5. The ◈ feed-gossip lines read as "the feed," arguably a different voice from the 📺 System — performance note for the voice designer, not a cut.
6. "📺 SYSTEM: [discovery]" (game.js:23595): the System announces player discoveries with varying text — cut from voice, but if Steve wants it, it's Piper-track.

## The 5 lines I'm proudest of

1. "SUSTENANCE. SYNTHESIZED. 2,800 KCAL PER BRICK-SLAB. TASTES LIKE... WE DID NOT TASTE IT. THE TASTING DIVISION RESIGNED." — the tasting division resigned. Peak unhinged-bureaucracy System.
2. "📺 The Death Reel will be tasteful. It won't be." — nine words, perfect Claptrap beat.
3. "'THE SYSTEM,' the System says, very quietly, 'WILL TAKE BACK WHAT IT LENT.'" — the one quiet line; in an unhinged voice design, the whisper will terrify.
4. "We watched EVERYTHING! ...You signed up by DOING THINGS! Consent via competence! Our lawyers LOVE it!" — the show's whole moral thesis as a joke.
5. "📺 SYSTEM: 'We have filed a request for the sky to be less bruised. It is pending. The sky has not responded.'" — trying so hard, failing so sincerely.
