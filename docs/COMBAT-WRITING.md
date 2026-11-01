# Combat writing maintenance

Warnings describe something the player can see or hear now. Keep costs,
damage, timing and usable counters in the action help and earned knowledge.
Do not substitute a design judgment ("a stat check", "the intended counter",
"the honesty is the horror") for an event. A short warning must still identify
the real committed attack; never invent a visible action to justify the copy.

Trace the consumers before editing a string. `attack` and `attacks` can repeat
the same warning. `Game.tbTelegraphCue` consumes committed attack text, while
bespoke signature hooks may replace it. `Game.tellKillerTale` also turns
attack warnings into a survivor's account. Counter `reveal` is spoken by
`askAbout(..., 'beasttricks')` and shown by discovery; `villagerTrickDefs` feeds
signature discovery and NPC knowledge. These are distinct paths.

NPC lessons speak the explanation once, without repeating the UI's trick
heading. Stage directions stay outside quotes. Test the whole quoted line,
including its introduction: both voice backends use `voiceCleanText` and its
400-character cap. An explanation can fit visually and still be truncated in
speech. Shorten the authored lesson rather than weakening the voice boundary.
Use the actual displayed action labels, never internal method names. Rerun's
margin reminders are combat actions, not arbitrary saved Codex prose.

After changes, run:

```
node scripts/godpath/test-counter-speech.js
node scripts/godpath/test-combat-narration.js
node scripts/godpath/test-conversation-voice-boundary.js
node scripts/godpath/test-ad-break-feedback.js
node scripts/build-offline-assets.js
node scripts/check.js --quick
```

The counter test exercises all authored counter-bearing species through actual
teaching, knowledge acquisition and speech extraction, plus six real fight cue
paths and a Rerun reset. It does not establish prose quality, physical audio,
every signature's truth, or browser usability. Retain failed samples. Follow
BROWSER-PLAYTESTING, PHONE-FRAME and MOBILE-PLAYTEST for actual mobile controls,
rendered text, whole endings and paid Continue. Full verification, current
observer proof, review and ship-loop publication remain separate requirements.

The later native lesson scout found that whole-string speech extraction did
not prove the standalone question UI showed the response at all. Ask about now
uses explicit authored reply observation, free existing beat pagination and a
complete topic checkpoint. See CONVERSATIONS.md and counter-lesson-audit-r1.md.
That path currently proves speech extraction, not actual voice delivery. Long
formal-conversation speech across beat/quote boundaries remains a separate
audit target; do not infer its behavior from a balanced whole-string example.

For future siblings, inspect warnings, discovery, Codex, NPC lessons, naming
stories and runtime signature messages together. Keep a path-level inventory
of changed text; compare all nontext fields to the parent so prose work cannot
silently change attack timing, damage, costs, rewards or spawn behavior.
