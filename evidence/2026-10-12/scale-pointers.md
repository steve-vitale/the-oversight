# Scale discoverability beats 4+5 — wave forward pointers (2026-10-12)

Builds the approved beats 4+5 from docs/SCALE-DISCOVERY.md (Steve 2026-10-12).

## The gap
Wave 4 needs wave-3 ledger points at bar AND scaleRank >= regional; wave 5 needs
wave-4 points at bar AND scaleRank >= national (unlockedWave). Both gates were
invisible — a player capped at wave 3 with max kills got zero signal about what
to do next. (Note: `_ledgerAnnounce` already named the gates at 100% in
mechanics-voice — "Wave 4 opens when Haven goes regional" — which this build
upgrades; see below.)

## What was built (src/js/game.js, src/js/waveLedger.js)

**`checkScalePointers()`** — reactive check called at the top of
`checkWaveUnlockBeat()` (every kill, every unlock check — the early returns for
"no new unlock" never skip it). Fires each pointer ONCE via state flags; catches
up old saves on the next kill.

**Beat 4** — fires when wave-3 points >= bar AND scaleRank < regional:
- System: 📺 "CLEARED THE BOARD! Every last one of them — ON CAMERA! The audience is still chanting your name, you beautiful violent overachievers!"
- System: 📺 "But real talk? The next act needs a BIGGER STAGE. I can't stage it with ONE fire — there's not enough of you to REFLECT, you feel me? Get me a NETWORK. More villages. More story. Make it worth escalating."
- Queues a villager echo for dawn next day (`_scalePtrW4EchoDay`, delivered in `endDay()`).

**Beat 4 echo** — one living villager at the fire:
- 🔥 "{first}, at the fire: "Whatever's out there... I don't think one fire faces it. Not alone.""
- Skipped if Haven went regional overnight (premise resolved).

**Beat 5** — fires when wave-4 points >= bar AND regional AND < national:
- System: 📺 "A REGION! Look at you! The ratings department is doing a little DANCE over here!"
- System: 📺 "But finales — FINALES need a NATION, sweetheart. Three seasoned bonds under ONE head. Or bend the knee to somebody who already has one. The producers are WAITING."

**Knowledge gates honored:** never names "Mirror Draft" (it's "the next act" until
earned); never names the Producers wave. The System never talks mechanics
("the wave-4 gate requires scaleRank >= regional" appears nowhere).

**`_ledgerAnnounce` scale-awareness** (waveLedger.js): the 100% gate sentences for
waves 3/4 are now scale-aware. When the scale floor is the binding constraint,
the ledger reports just the bar-full and the pointer carries the message (no
duplicate mechanics-voice). When the floor is already met, it names what's
actually next ("Wave 4's talent is cleared for release — watch the treeline.").

## Proof: scripts/test-scale-pointers-20261012.js — 17/17 green
- RED: no pointer beats without checkScalePointers.
- Beat 4: fires on exact state; silent when regional / bar not full; once-only.
- Beat 4 echo: one fire-side line, living roster speaker; skipped if regional by dawn.
- Beat 5: fires on exact state; silent when national; once-only.
- Knowledge gates: no "Mirror Draft", no "meet the Producers", no mechanics-voice.
- Ledger: no "goes regional/national" when pointer fires; bar-full still reported;
  accurate next-step line when floor met.

## Regressions (on merged base)
- ontology validator: 84/84 (docs/ONTOLOGY.md regenerated).
- dialog-coherence: 37/37.
- gossip-norepeat: 17/17.
- reach-wavebeat: 8/8.

## Sense notes
Read aloud: the System is Claptrap-unhinged producer throughout ("I need", "the
show needs", ratings-obsessed, menacing underneath). "There's not enough of you
to REFLECT" hints at the Mirror without naming it. Villagers speak their own
fear, not hints. The W4 beat follows the ledger's bar-full line in the same
moment — the ledger states the fact, the System sells the story.

## Not built (per brief: beats 4+5 only)
Beats 1/2/3/6 from SCALE-DISCOVERY.md remain future work. No UI changes.

## Retiming 2026-10-12: fire at unlock, not at bar-banked
**Finding** (evidence/2026-10-12/sim-completion-r1.md): both pointers fired 0
times in 26 completion runs. The bar-banked trigger was a nearly unreachable
window — scale-seekers are regional before banking 4 wave-3 points (pointer
correctly silent), non-seekers die in wave-3 combat first. The stuck moment is
at WAVE-3 UNLOCK, not after clearing it.

**Change** (game.js `checkScalePointers`, same copy/flags/gates):
- Beat 4: fires when wave 3 UNLOCKS (`unlockedWave() >= 3 && < 4`) and
  scaleRank < regional. Was: wave-3 bar banked.
- Beat 5: fires when wave 4 UNLOCKS (`>= 4 && < 5`) and regional but <
  national. Was: wave-4 bar banked.
- Rationale: the discoverability question ("what's next?") arises the moment
  a new wave lands. Gates themselves unchanged.

**Proof** (scripts/test-scale-pointers-20261012.js rewritten for unlock timing):
19/19 — RED control, beat 4 fires at wave-3 unlock below regional, silent when
already regional / when bar banked but wave not unlocked (day floor) / when
wave 3 not close, once-only, echo fires at dawn with living speaker, echo
skipped when regional overnight, beat 5 fires at wave-4 unlock below national,
silent when already national / after wave 5 live, once-only, knowledge gates
(no "Mirror Draft", no "meet the Producers"), no mechanics-voice, ledger
scale-awareness unchanged.

**Regressions:** dialog-coherence 37/37, gossip-norepeat 17/17,
reach-wavebeat 8/8, ontology 84/84 (ONTOLOGY.md regenerated).
