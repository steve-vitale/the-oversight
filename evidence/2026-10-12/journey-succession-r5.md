# journey-succession r5 (2026-10-12, 05:30 CDT run) — leg 7

## What this run covered (fresh vs r4 + the 05:00 crisis run)
- r4 (yesterday): single-death mechanics — death beat, corpse, invariants, promise release, inherited naming, opener coherence, ghost-trial dedup.
- crisis r4 (05:00 today): multi-death chain under siege, mourning topic 10-day keep-alive, mourning news names the dead, acute-mourning corpse fix.
- **This run (r5)**: the new bearer's life as a person — full successor conversations audited for fabricated shared history; second-death chain honesty; count honesty in player-facing lines.

## Village assessment (seed 301, 42 days)
Sofia Chen (bearer, gardener) died on the hunt day 24 with trust 8; Marcus Webb (electrician, trust 65) took the mantle at trust 5 (discounted ×0.6). 18 days later: Marcus held the office, codex grew 16→21 plants, pantry hit 0 kcal twice (villagers survived on foraging), Lena Ruiz fell to a monster d40. Village: 6 standing of 12, pantry empty but alive, knowledge economy intact.

## People check (SENSE read, full transcripts)
- Death beats (2 generations, seeds 777/779): "You're not Bill" / "You're not Manuel" name the right predecessor each time; Shannon mourns Bill by name 10 days later ("Since Bill died... I keep expecting to see Bill at the fire. Stupid.").
- Bearer-2 opener names the predecessor honestly: "Mario and I never finished talking about what's been happening — we left it mid-thought. You're wearing Mario's shoes now — want to pick it up?"
- Favor re-ask names the predecessor: "I asked Luis about the forage sweep — Luis's gone. Still need hands. Are you in?"
- **Audit result: zero fabricated shared history across 3 seeds × 7 conversations.** The inheritedName machinery (stamps + mantleOf) holds through organic + scripted interleaved deaths.
- Two audit regex hits were false positives ("You asked me that before" = same-sitting reference) — script now excludes them.
- Minor filler note (not fixed): conversation wind-down can stack 4–5 empty beats ("And... scene. Good talk." / "That's where things stand." / "Thanks for being here. That's all." / "Actually, forget it." / "Sorry, lost my train of thought."). Reads as trailing off, acceptable, but chatty.

## Blanks filled
### F1 — Hardcoded "we're twelve people" (characterGen.json warm exit line)
An NPC said "This was nice. Don't be a stranger — we're twelve people, it's hard." to a 6-person village. The line now carries a {people} token; Game.convoFillPeople() renders the living roster count in words ("six people", "one person"). Wired at the single exit-line point in endConvo. Proof: scripts/test-succession-people-count.js — 10/10.
### F2 — Hardcoded "twelve people inside" (app.js Haven hall description)
Same class: the lodge tile description stated the starting twelve as current fact. Now renders the living roster count. (Same fix shape as F1.)

## Documented, not fixed
- **Succession after the scattering**: if the village scatters (famine game-over, villageLost=true, save wiped), playerDeath still runs the full succession among the remnant if a death is scripted afterward. In real play the scattering ends the run first, so this only surfaced in the sim (seed 778: game over during organic play). Design call for Steve/other loops: is the scattering final, or can the remnant carry on?
- **Bearer trust decay**: Marcus's trust fell 5→1 while non-bearers climbed to 90 via deed bonuses. Trust here reads as successor-potential; the current bearer's number is inert. If a low-trust Bearer <redacted> rival challenges (heat), that's emergent content working — but a Bearer <redacted> perpetually at trust ~1 while villagers sit at 90 looks odd on the census. Flag for the sim loop's lever rotation.
- test-succession-inheritance has 2 pre-existing failures on pristine tip (resume-opener/memory naming on seed 4242) — verified not caused by this run's diff.

## Reachable / fun / winnable
- Reachable: yes — death, both mantle passes, inheritance naming, count honesty all fire through real paths (seeds 777/779/780 + 301/302 baseline).
- Fun: yes — the death beats and inherited lines are the good stuff; the twelve-people lies were the only false notes.
- Winnable: yes for the leg — the mantle chain survives interleaved organic + scripted deaths; the village keeps everything it earned.

## Regressions
- New proofs: test-succession-people-count 10/10; journey-succession-r5.js all-green seeds 777/779/780 (mantle chain, no-fabricated-history, count honesty).
- journey-succession.js baseline (301/302): 19/19 checks + village-lost path.
- test-betrayal: 80/80 · test-dialog-gating: ALL GREEN · test-dialog-coherence: 37/37 · test-convo-deflect-cycle-r6: 13/13 · validate-ontology: 84/84 "Release permitted."

## Tooling added
- scripts/journey-succession-r5.js — chain + fabricated-history audit harness (reuses sim-harness + competent policy; now guards against Game.over mid-play).
- scripts/test-succession-people-count.js — proof test for the {people} fix.
