# Break-it social r13 (2026-10-11): comfort trust bypass + petition phantom vote

Target 3 (social systems) from the break-it rotation. Hostile-player pass, fresh
ground — r1–r12 had already armored: rumor trust-farming (r6), rumor dedupe farm,
comfort farming (r2), applyRep progressivity (r5), moot re-convene/vote stalls/
weregild minting (r11), trial vote backstop (r11), exiled vote (r9), phantom
witness (r9), double exile (r9), promise farms (r4/r7/r8/r10), question-dodge
softlocks (r12), petition ignore→walk, guestMeal (regional r9), bribery (2026-10-08).

Canon applied: docs/CANON.md (Trust ≠ reputation; rumors move REP only),
docs/CONVERSATIONS.md. No canon doc covers moots/petitions directly — the
standing rules (progressive trust, "words only go so far", no silent actions)
were treated as canon.

Proof: scripts/test-break-social-r13-20261011.js — ALL GREEN x 3 seeds
(20261011/777/424242). BEFORE mode (contests.js + villageAgency.js from git
HEAD) fails exactly the 4 new checks (2 comfort + 2 phantom-vote).

## KILL 1 — contest "comfort" paid trust outside the progressive gate (EXPLOIT)

`_contestVerdict` (contests.js) paid a flat +3 trust for comforting a contestant —
the only live trust gain in the codebase bypassing `trustGainProgressive`.
Measured BEFORE via the real verdict path: at trust 95 the engine paid 95→98
where the gate says 0 ("only extraordinary acts move the needle" — baseAmount
3 < 5 at 90+); it also ignored trust.gain_mult debuffs (Hoarder/Chitin
Skin/Fear Aura) and skipped tele telemetry. One click, no kcal cost, ~2
contests/week — a slow, free devotion farm. Fixed: the gain routes through
trustGainProgressive like every other gain. AFTER: 95→95, 30→34 (disposition
mult makes progressive(30,3)=4 — the engine now applies exactly the gate).

Sibling sweep (all trust-gain writes across src/js): game.js gains (donate,
mediator, event trust, teaching) all route through trustGainProgressive;
bumpTrust is the telemetry chokepoint. storage.js stash grants (+2/itemId,
+8 phoenix honor) are flat but each costs a REAL item and were audited by the
miser loop (2026-10-10) — held, not changed (another loop's territory).
villager-agency.js playerDeath mantle bonus is once-per-death. game.js:4760
wake-up finder +5 is once-per-run. contests.js:4812 was the last costless
bypass.

## KILL 2 — petition moot counted a phantom player vote (HONESTY)

`_vaFinishPetition` (villageAgency.js) computed `total = v.present + 1` —
always counting the player even when they never voted (the exiled aren't at the
fire; the beats panel has no exile gate, so an exiled player CAN call the moot).
Measured BEFORE: 9 real voters, 0 accept → announced "0 for taking them in. 10
against." — a vote that doesn't exist; the need threshold was likewise computed
against a phantom voter. Fixed: pet.vote carries playerVoted (set in
conductPetitionMoot=false, flipped true in answerPetition), and total counts
only cast votes. AFTER: "0 for taking them in. 9 against." / "9 for taking them
in. 0 against." — the count names exactly what happened. pet.vote.need is
write-only (nothing reads it) — left alone.

## HELD — and why

- **Exile of the last villager (SOFTLOCK attack)**: exiled every NPC via the
  real removeVillager('exiled') choke point, then ran justiceTick,
  spreadGossip, villageMood, a 0-voter petition moot, advancePart, and the
  3-day petition walk-away. No throws, mood stays finite (10), stale petition
  walks, the 0-voter moot announces "0 for taking them in. 1 against." — the
  player's own real vote. The empty-village social pipeline is sound.
- **Dead-code**: all 63 src/js modules (incl. engine/) are loaded by
  index.html; 28/28 social surface functions (moot/petition/justice/rumor/
  trust chokepoints, bribeVoter, _contestVerdict) are live on Game.
- **Held by prior rounds, re-verified**: rumor rep-nuke bounded ±100,
  promise/consult farms, moot backstops, bribery idempotency — untouched.

## Regressions

- test-break-social-r13-20261011.js: ALL GREEN x3 seeds (BEFORE fails 4/4 new checks)
- test-break-social-r12-20261010.js: ALL GREEN
- test-break-social-r11-20261010.js: 18/18
- test-break-social-r11-exile.js: 2 pre-existing failures (feast exiled/T3, H2b) —
  fail identically on pristine HEAD (verified via stash), not regressions
- test-leadership-challenge.js: 34/34
- validate-ontology.js: 63/63, release permitted

## Files changed

- src/js/contests.js: comfort trust gain through trustGainProgressive
- src/js/villageAgency.js: pet.vote.playerVoted; honest total in _vaFinishPetition
- scripts/test-break-social-r13-20261011.js: new proof suite (+BEFORE mode)
- evidence/2026-10-11/break-social-r13.md: this note

## Design calls made (Steve: decide + document, he can overrule)

- Comfort is "real but ordinary" — it goes through the progressive gate rather
  than getting its own curve. At 90+ trust, comforting a contestant moves
  nothing; devotion needs extraordinary acts.
- A moot's announced count names only cast votes; an empty seat (exiled,
  absent) is not a vote. The threshold follows the count.
- storage.js flat stash grants left as-is: real item cost per gain, audited by
  the miser loop — not this run's bug class to redesign.
