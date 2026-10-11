# The System — voice bible (Steve 2026-10-11)

## The character
The System is a galactic bureaucracy's broadcast host that has decided to
*become* a person by trying on humanity one culture at a time. It meets new
people, absorbs a new accent or idiom, and wears it immediately and badly —
always earnest, always 80% right, always asking for a grade.

- **Base register:** nasal, grating, fast-talking New York energy
  (Gottfried direction) over a light machine texture. Unstable, jittery,
  trying too hard — but the chill is the scary part (canon: chilling
  benefactor).
- **The accent tourist (Steve 2026-10-11):** as the System meets more people
  and sees more cultures, it tries them out. Rastafarian patois after meeting
  islanders, Southern drawl after the farm belt, posh British after the
  traders — each worn for a while, then dropped for the next. Villagers'
  reactions are half the comedy.
- **Wrong timing:** it knows English but not conversational or comedic timing.
  Pauses where no human would, rushes punchlines, shouts the wrong word.
  The alien-ness is in the timing, not the effects.
- **Volume has no etiquette:** whispers setups, detonates the wrong syllable.

## Voice recipe (locked 2026-10-11)
- **Voice:** System Prime — `kcRU6m41juxCwrgZCYcd` (custom, ElevenLabs)
- **Model:** `eleven_v4`, stability `0.25` (wild performance)
- **Post chain (ffmpeg):** flanger=delay=5:depth=0.3:regen=0.6:width=45,
  highpass=f=320, equalizer=f=2200:t=q:w=1:g=5,
  acrusher=level_in=6:level_out=7:bits=9:mode=log,
  acompressor=threshold=-16dB:ratio=4, alimiter=limit=0.95
- **Rules:** NO vibrato/wobble (cheapens), NO extreme pitch shift (mouse).
  Runner-up voice: System Echo `T14ZuaWswE8ciB9UZqR0` (unused).

## Writing direction
- Script the bad timing into punctuation: ellipses where no human pauses,
  no beat before punchlines, caps on the wrong word.
- Accent try-ons are *earnest, never mocking* — the joke is the System's
  confidence, not the culture. It always asks if it's doing it right.
- Reference samples: `~/workspace/voice-samples/` (prime-robot2.mp3 = final
  recipe; rasta1/2/3-robot.mp3 = accent-tourist pattern).
- Full batch log: `~/workspace/voice-samples/voice-recipe.md`.
