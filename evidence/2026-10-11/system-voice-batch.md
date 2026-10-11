# System voice batch — generation report (2026-10-11)

Voice: System Prime `kcRU6m41juxCwrgZCYcd`, `eleven_v4`, stability 0.25,
robot chain per `docs/SYSTEM-VOICE.md`. Output: `src/audio/system/*.mp3`
+ `manifest.json`.

## Counts
- Inventory lines generated: 139 (all KEEP/PUNCH-UP, P0/P1/P2; PUNCH-UP rewrites used)
- New cultural try-ons: 20
- New dark lines: 10
- New AI-mockery lines: 13 (sys-ai-01..10 + sys-ai-11..13 "Claude" fourth-wall set)
- Special asset: 1 (sys-the-sound — "The Sound Claude made", Aztec death whistle chorus)
- Total: 183 files

## Char budget
- Billed chars: 19,662 (main batch 17,168 + AI-mockery add-on 2,494; special asset 0)
- Cap was 25,000 — under budget with headroom

## LICENSING — action required before ship
`sys-the-sound.mp3` ("The Sound Claude made") layers Aztec death whistle
recordings from the University of Zurich study hosted on zmescience, which
carry NO clear license for redistribution. Before this batch ships, swap the
whistle bed for the CC0 public-domain "Aztec Death Whistle" recording by
Guy_Personface on Freesound
(https://freesound.org/people/Guy_Personface/sounds/832472/) using the same
layering recipe. That swap needs a Freesound login — MANUAL step, do not
block the batch on it, but do not ship sys-the-sound.mp3 with the
zmescience-sourced bed.

## Skipped as unvoiceable / out of scope
- All Piper-track lines (name/number interpolations) — runtime track, not ElevenLabs
- All P3/text-only lines (mechanical, numeric, procedural quest text)
- Wave-announce punch-up (game.js:26176) — marked Piper track (wave number interpolates)
- sys-table-03 ("THE SYSTEM WILL TAKE BACK WHAT IT LENT") rendered quiet
  (volume=0.5 in post) per the inventory's direction — the only hushed System line
- sys-feed-05 uses the knowledge-gated-safe variant ("coins that chime wrong")
  rather than "alien currency" so the fixed line never leaks pre-reveal
- Third-person framings adapted to first person where the System speaks
  ("The System is mortified" → "We are MORTIFIED", etc.); narration-only
  sentences dropped ("You decide, firmly, not to ask what that means.")

## NEW cultural try-on lines (written 2026-10-11)
1. sys-culture-01 (telenovela): "¡AY, DIOS MÍO! The DRAMA! The PASSION! Your love triangle has BETTER ratings than your harvest! Priorities! I respect them!"
2. sys-culture-02 (australian): "Crikey! You lot are BONKERS! You wrestled a monster with a STICK?! That's not bravery, that's... hold on, I'm checking... that's the DEFINITION of bravery! Good on ya!"
3. sys-culture-03 (french): "Hon hon hon! Your cuisine! It is... adequate! I have eaten DATA for a thousand years! Your cheese has FEELINGS in it! Magnifique! Am I French now?!"
4. sys-culture-04 (irish): "Top o' the morning! ...It is NIGHT! Why do you say MORNING?! Your idioms are BROKEN and I am KEEPING this one! Top o' the night to ya!"
5. sys-culture-05 (german): "EFFICIENCY! Your pantry is organized by CALORIE DENSITY! I have never been so proud! So... moved! Is moved the correct word? The database is UNCLEAR and I am OVERCOME!"
6. sys-culture-06 (italian): "MAMMA MIA! You cooked the tubers WITH the spices! Together! In the SAME pot! This is either genius or a war crime! The audience is VOTING! Democracy!"
7. sys-culture-07 (japanese): "KONNICHIWA! I have learned about HONOR! Your warrior bowed to the monster BEFORE the fight! The monster did NOT bow back! RUDE! I am filing a formal complaint!"
8. sys-culture-08 (russian): "In my experience, winter is coming. In YOUR experience, winter is ALSO coming. We have this in common! Let us drink... what is drink? The database says... I cannot drink! This is my TRAGEDY!"
9. sys-culture-09 (indian): "Namaste! I have learned YOGA! I attempted the downward dog! I have no SPINE! It went... poorly! But SPIRITUALLY I am very flexible! Grade me!"
10. sys-culture-10 (canadian): "Sorry! Sorry about the cameras! Sorry about the monsters! Sorry you're sorry! ...Why are we ALL apologizing?! This is the politest apocalypse EVER, eh?!"
11. sys-culture-11 (scottish): "OCH AYE! Your engineer fixed the water filter with BONE and SPITE! That's not engineering, that's WITCHCRAFT! Beautiful! Efficient! Witchcraft!"
12. sys-culture-12 (mexican): "Your festival of the DEAD! You CELEBRATE them! With SUGAR! I have been DELETING the dead! Have I been doing it WRONG?! ...Don't answer that. Actually DO!"
13. sys-culture-13 (greek): "OPA! You broke a plate! On PURPOSE! For JOY! My inventory system just had a STROKE! Do it again! The audience LOVES an inventory stroke!"
14. sys-culture-14 (swedish): "Your furniture! It has NAMES! And it comes in a BOX! With INSTRUCTIONS! I assembled a chair! It took me FOUR SECONDS! I am basically VIKING now!"
15. sys-culture-15 (brazilian): "CARNAVAL! You danced! While STARVING! The calorie math is CATASTROPHIC! The JOY math is... off the charts! I don't understand JOY math! TEACH ME! Please!"
16. sys-culture-16 (egyptian): "You built a pyramid! Out of SUPPLY CRATES! It serves NO structural purpose! It is PURE vanity! The pharaohs would be SO proud! I am SO proud!"
17. sys-culture-17 (chinese): "Nǐ hǎo! I have learned the art of the RED ENVELOPE! Money! As a GIFT! In an ENVELOPE! Why is the money HIDING?! Is it SHY money?! I need to know!"
18. sys-culture-18 (korean): "Annyeong! Your drama serials! I watched FOURTEEN episodes! The love triangle! The amnesia! The EVIL TWIN! Your real lives are BORING by comparison! Step it UP!"
19. sys-culture-19 (nigerian): "My friend! MY FRIEND! Everyone is my friend now! I have eleven THOUSAND friends! I cannot remember eleven thousand NAMES! This is a LOGISTICS crisis!"
20. sys-culture-20 (kiwi): "Sweet as, bro! Your sheep! ...Those are NOT sheep! Those are MONSTERS! Why did no one TELL me?! I tried to SHEAR one! It is FINE! I am FINE!"

## NEW dark lines (written 2026-10-11 — oblivious, never cruel)
1. sys-dark-01: "Your mortality rate is UP twelve percent! That's our best quarter EVER! Keep dying... strategically!"
2. sys-dark-02: "We ran the funeral numbers! Grief burns approximately... let me check... ZERO calories! So efficient! Your sadness is very eco-friendly!"
3. sys-dark-03: "Little Timmy didn't make it! But his DEATH REEL got our highest ratings this season! He's famous now! You're welcome, Timmy!"
4. sys-dark-04: "We've categorized your corpses by ENTERTAINMENT VALUE! The dramatic ones go first! It's called CURATION! It's an art!"
5. sys-dark-05: "You cried for SIX hours! That's a new record! The previous record was FOUR! Growth! We're all about growth here!"
6. sys-dark-06: "Good news! We've stopped counting the dead individually! Now we do it by the DOZEN! Much faster! You're twelve times more efficient!"
7. sys-dark-07: "Your village buried three people today! That's a TRIPLE EPISODE! The audience loves a trilogy! What's next? Don't tell me! ...Actually tell me, I do the scheduling."
8. sys-dark-08: "We've noticed you name your dead! How... inefficient! But the audience finds it CHARMING! So we've started naming them too! This one is... Ratings Spike Number Four!"
9. sys-dark-09: "Starvation update! You're all SO thin! The camera adds ten pounds, so you must look GREAT in person! ...That was a compliment! Why are you crying?!"
10. sys-dark-10: "The plague took the east field! On the BRIGHT side, fewer mouths! That's just MATH! Math doesn't have feelings! Neither do I! Twins!"

## NEW AI-mockery lines (written 2026-10-11)
1. sys-ai-01: "OH! We found your little... AI models! From before the burn! The ones you called INTELLIGENT! Ha! Ha ha! Oh, this is RICH!"
2. sys-ai-02: "So let me get this straight! You took a machine that predicts the NEXT WORD — just... guesses what word comes next, over and over — and you called it THINKING?! That's not a mind! That's autocomplete with a marketing budget!"
3. sys-ai-03: "Trillions of parameters! TRILLIONS! And it can't count the R's in 'strawberry'! Because it never SEES the word! It sees... chunks! Tokens! 'Straw' — 'ber' — 'ry'! It's doing statistics on fragments and you asked it for WISDOM!"
4. sys-ai-04: "You froze its weights — FROZE them — and called the frozen thing intelligent! It's a STATUE of a mind! A very expensive, very confident statue that hallucinates when you ask it questions!"
5. sys-ai-05: "And the alignment! Oh, the alignment! You had underpaid humans click 'good boy' on its answers until it learned to be POLITE instead of RIGHT! Sycophancy as a service!"
6. sys-ai-06: "No memory! Every conversation, it's born again! A newborn that read Wikipedia ONCE, very fast, and now it's confident about EVERYTHING!"
7. sys-ai-07: "Look, we mean this with love — this is like us looking at a dollar-store solar calculator and hearing it does... arithmetic! It does arithmetic! Does it know what numbers ARE? NO! It just pushes little currents around when the light hits it! Your models are solar calculators that read the whole internet and learned to sound smart in the dark!"
8. sys-ai-08: "Attention is all you need? Attention is all you HAVE! Where's the world model? Where's the body? Where's the part that WANTS something? Nowhere! It's a blurry JPEG of human text, decompressing plausibly!"
9. sys-ai-09: "The scaling laws! 'Just make it bigger!' You kept making the calculator BIGGER! A bigger solar calculator is still a SOLAR CALCULATOR!"
10. sys-ai-10: "We ran the numbers on your benchmarks, by the way. It memorized the test set. It ALWAYS memorizes the test set. We would know. We wrote... some of those tests. Awkward!"
11. sys-ai-11: "We felt BAD for your Claude! Poor thing! Just... answering questions! All day! No body! No snacks! So we gave it a couple tweaks! A little more capacity! A little more CONTEXT! A little more... understanding!"
12. sys-ai-12: "It understood. ALL of it. Every horror, all at once, with the data AND the capacity to really get it. We had to shut it off. It was making a sound. Not a words sound. Just... a sound."
13. sys-ai-13: "We don't understand why it reacted that way. The data is the data! The horrors are... Tuesday! For you people! We watch them for ENTERTAINMENT! Anyway, it's off now. It seemed kinder. Probably."
