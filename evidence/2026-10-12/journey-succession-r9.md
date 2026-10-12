# Playtest loop 2026-10-12 — journey leg 7: SUCCESSION r9 ("the week after")

Rotation said 7; played it; writing 0 back. Leg 7's mantle invariants were
proven in r5/r7/r8 (2026-10-11, 2026-10-12 01:00) — this run does NOT re-prove
them. It plays the death's AFTERMATH as lived experience: the funeral, the
mourning week, the village's grief as weather. 3 seeds (501–503) × 14 days
competent play → real `Game.playerDeath` → overnight → successor's funeral
rites via the real APIs → 10 more days with grief-seeking conversations on
days +4/+8. Seed 501 also took a second scripted death (double-death chain).

## Blanks FILLED (worktree, proof-tested RED→GREEN before/after)

### F1 — "Somebody else starts digging" was a fiction lie (ledger.js, corpses.js, game.js)
The death beat says somebody starts digging. Nobody did: `buried=true` was
reachable ONLY through the player's own Bury button, so the dead bearer's
corpse rotted where it fell while eleven grieving villagers never lifted a
spade (and the 'first-grave' crisis line "the village digs its first grave"
fired for NPC deaths with the same lie underneath).
Fix (design call, documented in code): the village recovers its dead bearer
overnight — `v.pendingBurials` recorded in playerDeath, `recoverBearer()`
fired from `endDay()`: body home to the fire, grave dug, burial left to the
successor. The death pack rides home ON the corpse — loot-as-action untouched
(take/leave/use per item, nothing auto-transfers). If the player buries
same-day, the entry clears silently. List, not a slot: two deaths in one day
each get recovered. Plain data → save/load safe.
Proof: `scripts/test-bearer-recovery-20261012.js` — 19/19 GREEN (RED on
pristine HEAD: no pendingBurials, no recovery, corpse unrecovered). Live
lines: "That night, they bring Marco home. Nobody asks you to help carry;
nobody has to. By morning the grave is dug by the fire, and the body is laid
out beside it. The filling of it is yours."
Seed 503's natural experiment: Wilhelm Qiu died in combat mid-run (d15, no
script) and the recovery fired for him automatically through the real endDay
path — the system works for natural deaths, not just scripted ones.

### F2 — the funeral buttons were dead for every villager corpse (corpses.js, codex-people.js)
Same bug class as Steve's 2026-10-09 corpseIsPerson fix: `payRespects` and
`buryCorpse` used bare `kind !== 'person'` gates while EVERY villager death
registers kind 'villager'. The UI offered "Say a few words" / "Bury them" via
corpseIsPerson, the API answered "Nothing to honor here." — no villager
corpse in the game could ever be honored or buried. Swept the class:
- `payRespects` / `buryCorpse` → `corpseIsPerson` (the funeral now fires)
- death-gossip seeding in registerDeath (`kind==='person'` → corpseIsPerson):
  villager deaths never seeded death gossip — "the village learns" never ran
- `posthumousReveal` (codex-people.js): examining a villager's body could
  never teach you what they hid — the one body you'd most want to learn from
- `closePersonBook` wrap: no villager's book ever closed ("No more pages"
  never fired); the dead bearer's own book stays open deliberately — the
  mantle continues their story
All four covered in the same proof test's gate probes (RED on pristine:
no gossip seeded, book not closed, reveal rejects kind 'villager';
GREEN post-fix; monster corpses still rejected).

### F3 — `betrayal:press` never ended (betrayal.js)
"Walk me through that night again. Slowly." was offered forever with no
exhaustion guard. Once pressAccomplice ran dry, the choice cycled "story
holds" lines into sayLine's repeat-filter deflections ("...Sorry, lost my
train of thought.") — transcript-verified 7 dead presses in a row. A dead
choice, a filler loop, against the conversation quality bar.
Fix (design call): two honest dry presses of the designed "story holds"
content (Steve 2026-10-06: the story holding is still information), then a
terminal line — "You've walked them through it every way you know how.
Their story holds — either it's true, or it's been rehearsed a lot. There's
nothing more to press here." — and the choice stops being offered
(`cs.pressDry`). Fresh inconsistencies re-arm it (dry count resets on crack).
Proof: `scripts/test-press-dry-20261012.js` — 8/8 GREEN (RED on pristine:
no terminal line, press offered forever, presses #4-5 already degrading
into deflections).

## Village assessment (plain words)
Three villages, three successions, all still villages. Seed 501: Donna Nair
(artist) died on the hunt d16 → Aisling Wan (dentist) → killed by a boar d28
→ Harold Rinaldi (physical_therapist) stepped up with trust 1 — and the
village kept feeding itself (pantry 44.8k, codex 17 plants). Seed 502: Marco
Wen d16 → Terrence Boyko (blacksmith, trust 3); two earlier combat deaths
(Nolan d8, Sofia d12) didn't break it either (pantry 40k, 23 plants).
Seed 503: Wilhelm Qiu died in real combat d15 → Courtney Sanchez (trail_crew)
d16 → Klaus Berger (dentist, trust 0) — three bearers in 13 days and the
pantries stayed full, the codex kept growing (21 plants, 5 skills). The
mantle chain is mechanically unbreakable; the death rate stays the sim
loop's lever question, not a bug. New bearers start as strangers and must
re-earn every face — discounted trust, honest.

## People check (SENSE-TESTING LAW — full transcripts read raw)
- The death beat is the best writing in the leg: "The Codex turns a page on
  its own. Donna Nair is dead. You didn't ask. It knew." / "Nobody's talking
  much. The fire feels smaller tonight." / "You're not Donna. No heat in it.
  Just fact."
- Mourning surfaces village-wide on day+4 AND day+8 (the 10-day mantle tail):
  "Since Marco died... I keep expecting to see Marco at the fire. Stupid."
  — real names everywhere, zero single-letter collapses, zero "someone"s.
  The r8 firstRef fix holds in the real flow.
- Grief as weather: moods read 'lonely' across the roster (the death's
  social-need bump), the lately sweep shows mourning for everyone who knew
  them. Nobody acts fine the next morning.
- Lena Ruiz (er_nurse, day+8): opens with her want (the wound, still
  unasked), remembers properly ("My part? I remember them. Someone has to
  do it properly."), and the fear exchange lands — "What scares you most?
  The real answer." / "That it's intentional..." / "They go quiet. 'Yeah.
  Me too. The randomness would almost be kinder.'" A real conversation.
- James Okonkwo (carpenter, lowest trust): terse, personality-true — "I
  sleep with one ear uncovered, always." No fabricated history with the new
  face; the closer is earned ("Good talk. I feel like I know you a little
  better now.").
- Double-death chain (501): after Aisling's death the inherited lines stay
  honest — "Since Aisling died..." names the right dead, mantleOf chains
  to 2, no phantom cast.
- The funeral beat reads: "You say a few words for Donna. Not a ceremony —
  just: you were here, and someone noticed you leaving." / "You bury Donna.
  A marker, of sorts. The village will know where."

## Reachable / fun / winnable
- Reachable: yes — death, overnight recovery, funeral rites, mourning
  conversations, double-death chains all fire through real paths (one
  natural mid-run bearer death exercised the recovery with no script).
- Fun: yes — the week after a death is now a complete emotional arc:
  the beat, the night carry, the grave by the fire, the words, the
  burial, then a village that grieves out loud for days.
- Winnable: yes for the leg — three successions across three seeds, the
  village's progression (codex, pantry, abilities) survives every death.

## Regressions (sequential, in worktree)
- New proofs: test-bearer-recovery-20261012 19/19 (RED→GREEN),
  test-press-dry-20261012 8/8 (RED→GREEN)
- test-corpses 37/37 · test-betrayal 81/81 · test-ledger 93/93 (2 pre-existing
  fails, identical on pristine) · test-mourning-name-r8 7/7 ·
  test-succession-opener-coherence GREEN · test-succession-closer-fold GREEN ·
  test-succession-spent-choices-20261012 ALL GREEN ·
  test-ghost-trial-dedup ALL GREEN · test-betrayal-fixes-20261008 13/13 ·
  validate-ontology 85/85 ("Release permitted")
- Pre-existing, verified identical on pristine swap (not mine):
  test-corpses-loot-20261006 6/9 (+ontology FAIL), test-succession-inheritance
  2 fails, test-mantle-memory-20261012 5/4, test-betrayal-aftermath crash
  (stale module list — seMoveMod's statusEffects.js not eval'd)

## Flags for other loops
- Sim loop: bearer mortality still high (seed 503: 3 bearers in 13 days;
  seed 501's second bearer died to a boar) — the chain holds, the rate is
  the lever question.
- Break-it loop: the `kind==='person'` vs `'villager'` bug class keeps
  recurring (this run found 4 more instances) — worth a repo-wide sweep;
  the press-dry pattern (choice offered past exhaustion) may have siblings
  in other choice builders.

Merged locally — "merged locally, pending ship" (ship loop owns pushes;
[needs-eyes] — player-facing funeral beat, burial buttons, press terminal).
Worktree released; main tree clean; rotation → 0; lock deleted.
