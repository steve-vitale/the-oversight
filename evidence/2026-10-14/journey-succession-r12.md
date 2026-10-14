# journey-succession r12 (2026-10-14): "who are you now?"

## Pre-registration (§11; binding per §14)
- **Question:** the new bearer's first hours — does the handoff introduce the
  new person, and does everything that should carry over actually carry over?
- **Continuity metric (binding):** pre/post-death engine-state audit per seed.
  C1 System ability slots (id+level) identical; C2 integrationStage identical;
  C3 state.leadership deep-equal; C4 codexBreadth identical; C5
  s.backgroundAbilities rebuilt for the NEW occupation (granted-list match,
  background:true — regression of the break-it r6 zero-legs bug); C6 npcIds()
  excludes the new bearer while v.roster still contains them (matches the
  game-start invariant — the bearer has always been in the roster).
  GO = all green on all seeds.
- **Orientation (findings):** O1 — any say line introducing the successor's
  background/occupation/past; O2 — raw handoff transcript read (SENSE-TESTING
  LAW); O3 — phantom identity (old name used FOR the player post-death).
- **People check:** one full conversation as the new bearer with the
  highest-trust villager — does the NPC treat the new face as someone who
  must earn it, with honest grief for the dead?
- **Horizon:** 16 days competent play + scripted death (r10 proved natural
  deaths drive the same chain; r11 used the same script) + 3-day successor
  tail. Death-aware: village survived on all seeds.
- **Seeds:** 611, 612, 613, 615. Policy: scripts/policies/competent.js.
- **Interesting-finding bar:** a continuity break; the orientation blank
  confirmed + fixed; a phantom-identity reference.
- **What this run does NOT re-prove:** promise-maker succession (r11, landed),
  mantle inheritance audit / phantom-name scan / wipe / background-kit use
  (r10), mourning-beat survival vs crisis (r11).

## Metric review
- Seed 611's successor varied between harness runs (Ernestine Webb the 911
  dispatcher in the r12 harness; Erich Yang the mason in the proof-test
  process) — sim-harness RNG consumption differs by entry script, so the
  successor pick is entry-dependent. Sample artifact, not a game finding; all
  checks are successor-agnostic.
- O3's first predicate pass flagged 1 "player-addressed" old-name line on
  seed 612; manual read showed it was "You catch fragments by the fire" — the
  `^you ` anchor matching legitimate second-person narration to the NEW
  bearer. False positive in the check, not a phantom. Predicate noted as
  crude; the manual read is the verdict.

## Results (seeds 611/612/613/615)
- **C1–C6: all green on all 4 seeds.** Abilities carry (e.g. 612:
  6 slots incl. eagle_eye@2, gossip_network@2 — identical pre/post);
  integration carries (stage 2 and 3 observed); leadership vector deep-equal;
  codex breadth carries (23–35); background legs rebuild correctly for the
  new occupation every time (firefighter→adrenaline_control,
  truck_driver→pathfinder, lawyer→mediator, 911 dispatcher→eagle_eye —
  the r6 zero-legs regression stays fixed); roster invariant holds.
- **O1: THE BLANK — 0 intro lines on all 4 seeds.** The handoff tells the
  player who they're NOT ("You're not Miriam. … You'll have to earn this
  face."), the System jokes "New face! Same job!", the Codex page turns —
  but the new person is never introduced. The player wakes as a stranger
  (a 41-year-old lawyer, a firefighter, a truck driver, a 911 dispatcher)
  and the game never says who they are; their new background abilities are
  granted silently too. A silent identity swap + a silent kit change — the
  exact class of silent action Steve's rules forbid.
- **Fix (landed):** one orientation beat in playerDeath (ledger.js), fired
  immediately after the Codex page-turn line:
  `🪞 You wake up somebody else. Esther Fischer, 41 — a lawyer. Her hands
  know different work now: Mediator.`
  Name + age + former occupation + the inherited hands (background kit,
  just rebuilt above the beat). Pronouns from the char record; a/an handled;
  kit clause omitted when the occupation grants nothing. Full backstory
  stays on the char record — this is the waking-up line, not the bio.
- **Pronoun data (same fix):** the beat surfaced they/them for Esther,
  Ernestine, and Erich — NAME_GENDER didn't know them (same class as the
  Leonid fix Steve requested 2026-10-06). Added esther/ernestine → 'f',
  erich → 'm' (curated-map additions; only affect future generations).
- **Proof:** scripts/test-succession-orientation-20261014.js — RED on
  pristine (4 failures: no orientation line ×2, name-gender ×2; patch-swap,
  no stash), GREEN post-fix (14/14).
- **O2 transcript read (seed 615, post-fix):** the sequence plays —
  Codex foreshadow ("It knows things before you do now. Deaths, especially"),
  the Codex announcing the death itself, village grief, the 🕯️ beat, the
  sync, the System's MANTLE TRANSFER line, the page-turn, then the new
  🪞 orientation line, then life going on (eating, water runs, pantry work)
  and gossip about "you" — correctly the new bearer. The beat lands where
  the page turns; it reads as the next paragraph, not an interruption.
- **O3: no phantom identity.** The old name appears post-death only in
  death/mourning/gossip/memorial contexts — never addressing the player.
- **Regression:** test-blitz-succession 30/30, test-corpses 37/37,
  test-ledger 91/95 (4 pre-existing, byte-identical on pristine),
  test-mantle-memory-20261012 5/9 (4 pre-existing, identical on pristine),
  validate-ontology 96/96.

## Village assessment (plain words, seed 615, day 21 — 3 days after the death)
Ten people alive. Seamus Conti died to a hushwolf on day 18; Ivy Wang was
taken by a monster on day 11 — both on the memorial roll, both grieved by
name. Esther Fischer, 41, a lawyer, picked up the Codex — trust 37, the
office's standing at a discount, exactly as designed, with Jesse's vouching
at the grave ("Seamus trusted them. We saw it."). The pantry holds ~16.5k
kcal; the codex knows 25 plants; integration is at stage 2 (Overlay). The
village is working: water runs, pantry checks, stone hauling, and gossip
about the new bearer that is already half-untrue ("Nobody seems to mind").
Nobody is stuck, nobody is silent, the dead are named. The design is working.

## People check (SENSE-TESTING LAW — full transcript read raw)
- Seed 613 (Hermann Qian → Mario Miller, trust 90): Mario has his own want —
  "I asked LaToya about the pantry run — LaToya's gone. Still need hands.
  Are you in?" — re-asking the new bearer for the dead bearer's favor, by
  name (the r11 F2 mechanism alive in conversation). Grief is specific:
  "I keep turning over the last thing LaToya said to me. I can't tell if I'm
  remembering it right, and that's somehow the worst part." "The fire feels
  smaller without LaToya. The rest of us will have to be bigger." "I'm
  picking up LaToya's share of the work." Honest ending: "I wish there was
  more to tell. That's it." … "I should go. You know where to find me." …
  "This was good." They mean it. No fabricated shared history with Hermann;
  the NPC wants something, the middle is real, the ending is earned.
- Seed 611's conversation was captured mid betrayal-investigation (the
  highest-trust villager had an active case) — the NPC stayed on its thread
  and deflected honestly ("We've covered this one. Ask me something else.");
  the r12 harness now deprioritizes betrayal choices for the people check.

## Reachable / fun / winnable
- Reachable: yes — the full transfer chain (death → corpse recovery → grief →
  sync → System line → page-turn → orientation → vouching → released
  promises → re-asks) fires through real engine paths on every seed.
- Fun: yes, more so now — the successor arrives as a person with a past and
  a named kit, not a blank cursor. Waking up as the lawyer with Mediator
  hands is a moment; waking up as nobody was a gap.
- Winnable: yes for the leg — continuity is total (abilities, integration,
  leadership, codex) and nothing in the transfer blocks progression.

## Flags for other loops
- Convo loop: the people screen (codex-people.js:283) excludes the player
  character — the new bearer can never re-read their own backstory after
  the orientation beat scrolls by. Documented blank, not fixed (UI change,
  out of this run's scope).
- Sim loop: successor pick varies by harness entry script (RNG consumption
  order) — cross-script seed comparisons should pin the entry point, not
  just the seed.

## Files
- scripts/journey-succession-r12-20261014.js — the r12 leg harness (continuity
  audit + orientation findings + people check)
- scripts/test-succession-orientation-20261014.js — proof test (RED→GREEN
  verified via patch-swap)
- src/js/ledger.js — the 🪞 orientation beat in playerDeath
- src/js/game.js — NAME_GENDER: esther/ernestine → 'f', erich → 'm'
