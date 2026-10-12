# Journey leg 5 — social life, r8 (2026-10-12, run 2026-10-12T21:25:03Z)

**Leg:** social life (conversations, gossip, moots, friendships, rivalries across a full run). Rotation 5→6 (succession next).

**Note on numbering:** a sibling journey-social run landed "r7" at 16:05 UTC (30a60617: NPC moots, speech pools, de-parroting). This run is r8. Its justice-ladder findings are complementary, not duplicative: the sibling proved natural-fire under normal play (11 trials); this run proves the full ladder under crime pressure + sense-tests the promise system.

## Play
Two probes via `scripts/journey-social-r7-20261012.js` (new):
- **POLICY=larceny** (seeds 20261012/111/222, DAYCAP=140): the crime-pressure
  policy (steals, provokes, cold) + social conversation driving, on the r6
  seeds. Instruments the full justice ladder: armPlot → openCase/openPlayerCase
  → callMoot → conductTrial → finishTrial → verdict, with full trial
  transcripts via sayLog spans.
- **POLICY=promise** (seeds 30303/40404, DAYCAP=100): the promiser policy
  (makes formal vows, keeps them) for the promise-system sense test.

## Findings

### 1. Justice ladder fires end-to-end under crime pressure (r6 blank #2 RESOLVED)
| seed | end | player cases | moots | verdicts |
|------|-----|--------------|-------|----------|
| 20261012 | survived d134 (exiled) | 2 | 2 | 2 (weregild → exile) |
| 111 | village-lost d36 | 3 | 3 | 3 (weregild → exile → exile) |
| 222 | village-lost d32 | 4 | 3 | 3 (weregild → exile → weregild) |

The arc: theft crimes recorded (day 6+) → accuser (the victim) → case →
moot in 2-4 days → verdict. First offense: weregild ("You pay. And stay —
this time."). Repeat: exile, with the full schism ceremony. The ladder is
NOT structurally dead — r6's zero trials was competent play producing zero
crimes, working as designed. NPC-vs-NPC plots stayed at 0 (motive≥45 never
reached; the beloved-village gate held). One NPC "accused" verdict per run is
the mantle passing to a new bearer after exile/death — village-as-protagonist
continuity, not a bug.

### 2. Trial transcripts read TRUE (sense-tested, 2 full)
Trial 0 (theft, weregild): the summons, the count ("8 for guilty. 0 against."),
the pause ("Someone's breath catches. Then: 'Guilty.' Nobody looks at
anybody."), the sentence, the price paid in the open. Trial 1 (theft,
exile): "You — take what you can carry and go." + the schism crisis beat +
"Linda doesn't gloat. Nobody thanks them out loud. But the nods they get by
the fire, later — those are real." Coherent, ceremonial, consequential.

**Fix:** the System broadcast said "TONIGHT: YOU stands accused" (whoTag
returns 'you' for the player, uppercased). Fixed to "YOU stand accused" in
`callMoot` (betrayal.js). Proof `scripts/test-moot-broadcast-grammar-20261012.js`:
8/8 green, RED-checked (2 fails on pristine). NPC-accused path unchanged
("NAME stands accused").

### 3. Gossip volume (r6 blank #3 RESOLVED — was a measurement artifact)
Gossip entries expire after 3 days (`v.gossip.filter(day - g.day < 3)`,
game.js:14618), so r6's end-of-run count (1–6) measured only the surviving
tail. Instrumented seedGossip calls tell the real story: **306–404 seeds per
140-day run** under larceny (theft/bully/ambush cover stories), 112 in the
7-day smoke test. The rumor mill is loud; the design ("information spreads by
gossip, not broadcast") holds. Quiet villages = few events = few rumors, which
is honest.

### 4. Promise system sense-tested (landed after r6 — first social-leg coverage)
- Vow arc (scripted probe `scripts/probe-vow-menu-20261012.js`): goal thread
  asked → depth 2+ sets sticky `goalOpenedUp` → NEXT conversation's menu
  offers `offer_help` → vow taken. The transcript reads like people: the NPC
  asks "Have you ever hurt someone? Since all this started.", hears the
  honest answer, says "Thank you for telling me. That couldn't have been easy
  to say.", then "...Thank you. Really." on the vow. The vow is correctly
  gated (trust≥35 or relAge≥8 before ask:goal appears; the goal thread must be
  walked, not menued).
- Lifecycle in the wild (promise probe, 6 promises): kept ×3, broken ×2,
  released ×1. Keep copy: "catches your eye across the fire. You kept your
  word. That meant everything." Break copy: "doesn't say anything. But they
  stopped looking at you the way they used to. Promises rot." Release copy
  (villager removed): "isn't broken — it's just unkeepable now. You carry that
  differently." All read true.
- **Design note (documented, not a bug):** `offer_help` only appears in the
  off-thread menu AFTER the subject pivot resolves — the choosingSubject
  branch early-returns before the earned-verb gate, and the vow is a
  cross-conversation arc by design (sticky goalOpenedUp). A single sitting
  can't reach it; that's the intimacy model working.

### 5. Speech pools (sibling's r7 fix) — verified, not redone
`scripts/test-petition-moot-speeches-20261012.js`: 15/15 green (cannibal /
famine-flight / other × for / against, 3–4 variants, no-repeat rotation).

## Village assessment (plain words, larceny run seed 222)
Day 32: 6 alive (Deirdre the soldier and Petro the line cook at trust 84 —
they never trusted the thief; Judith the 911 dispatcher at 55; Emma the vet
at 33; Lena the ER nurse at 0). 4 fallen: Kieran and Marcus to combat,
DeShawn to sickness, Sofia to a monster. The player stole from Minh and
Deirdre repeatedly, was tried and exiled twice (as Kieran, then as Lena after
the mantle passed), and kept stealing. The village didn't collapse from the
crime — it held moots, passed sentences, and kept living. 17 plants in the
codex, pantry at 0 — the food wall, not the crime wave, is what will kill
them. Rivalries are real: the thief is known, remembered, and unwelcome.

## Verdict
- **Reachable: YES.** Justice trials (9 across 3 runs), petition-moot speech
  rotation, promise vows/keeps/breaks, gossip chains — all fire organically.
- **Fun: YES.** The trial ceremonies and the vow arc read like theater with
  teeth. The exile sequence is the strongest social content in the game.
- **Winnable: PARTIAL.** Same binding constraint as every leg: combat
  attrition + the food wall (villages die d32–d134; only the exiled run
  "survived"). Social content is proven on villages that don't live long
  enough for it to compound. Not this leg's fight — noted for the record.

## Regressions (all green)
- test-justice.js 61/61, test-moot-justice-aftermath 27/27,
  test-moot-grammar ALL GREEN, test-petition-moot-speeches 15/15,
  test-moot-broadcast-grammar (new) 8/8 (red-checked).

## Tooling
- `scripts/journey-social-r7-20261012.js` — justice/promise probe harness
  (POLICY=larceny|promise, lad
...[truncated 1464 chars]