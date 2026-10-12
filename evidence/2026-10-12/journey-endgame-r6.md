# Journey Endgame r6 — Leg 4 (Endgame): Food-Thesis Deed Earnability

**Run:** 2026-10-12 · Worktree `journey-endgame` (base `bd5a634a`) · Seeds 70001–70009 · DAYCAP=140
**Harness:** `scripts/journey-endgame-r6-20261012.js` (feastseek policy: honest foraging/cooking/feasting, keepsake channeling when taught, combat when it comes)

## Question
Are the LESSER seat's two food-thesis deeds actually EARNABLE by a competent player?

- **Deed 1 `sentimentTaught`**: `slotMoment(60)` — scholar integration crosses 60 → System's wrong-theory sentiment lesson (`teachSentiment`) → live keepsake demo.
- **Deed 2 `feastSurgeUsed`**: channel keepsake while feasted with surge armed (mastery 3×L3 OR devotion `surgeResonance≥35`) → feast → buff → strike/ability while feasted+inCombat.

## Verdict: YES — both deeds are earnable. 8/8 and 6/8 across seeds.

| Seed | End (day) | Deed 1 (day) | Deed 2 (day) | Notes |
|------|-----------|--------------|--------------|-------|
| 70001 | village-lost 16 | 12 | — | Starved before chain finished |
| 70002 | village-lost 101 | 16 | 21 | Long run; both deeds |
| 70003 | village-lost 55 | 15 | 18 | Both deeds |
| 70004 | village-lost 60 | 16 | 21 | Both deeds |
| 70005 | village-lost 47 | 14 | 19 | Both deeds |
| 70006 | village-lost 16 | 16 | — | Starved before chain finished |
| 70007 | village-lost 42 | 16 | 17 | Deed survived bearer death (mantle) |
| 70008 | village-lost 28 | 16 | 17 | Both deeds |
| 70009 | survived 33 | 18 | 22 | Both deeds (post-fix) |

**Deed 1** fired day 12–18 in **8/8** seeds. Integration→60 is reachable in honest play (cooking, teaching, feasting all feed it).
**Deed 2** completed day 17–23 in **6/8** seeds, always via the **devotion lane** (`surgeResonance` 35–142 at arm; mastery lane never won — every mastery path feeds resonance 1:1 so devotion always leads). The 2 failures were villages starving at day 16 before the chain finished — a food wall, not a deed bug.

## Deed-chain diagnosis (where it breaks, and doesn't)

1. **Integration→60**: No break. Reachable by day 12–18 via normal play.
2. **Surge arming**: No break. Devotion lane hits 35 reliably (resonance 35–142 observed). The 3×L3 mastery lane is unreachable in practice (fired 0/180 pre-rework; still never wins because XP feeds resonance first) — but the devotion lane carries, so this is not a blocker.
3. **Buff grant→armed→spent**: No break *once armed*. The buff grants, the arm holds, and combat use marks the deed. r3's "grants but never used" was a policy artifact (the old sim never struck while feasted); the feastseek policy strikes while feasted and the deed marks.
4. **Bearer death**: The deed survives via the mantle (seed 70007: Bearer died in the draw fight the same day the deed marked; deed persisted).

## Sense-testing (transcripts read in full)

- **Sentiment lesson**: reads as the System wrong in the right way. "We do not know why the waveforms taste like grief. We have stopped asking." / "It is not math. It is love." The alien misreading lands; the demo (channeling Grandma's Tin Cup) is coherent.
- **Feast climax**: fixed this run (see Blanks). The grant/draw/announce order now reads causally; the buff-duration promises are honest (2 dawns, via shared `Game.feastDawnWord()`).
- **Channel button copy**: `channelLabel` mirrors the branch order; honest.

## People check (2 transcripts)

1. **Seed 70009 day 25 — David Kim (plumber)**: want=`ask_favor` ("This wound — I can't clean it properly one-handed. Could you clean it out for me? Please."). Meaningful want, BUT the policy picked `leave` on turn 0 — no ENGAGE choice id matched the offered choices. The conversation *system* is fine; the *policy* didn't engage. (Policy-side, not a game bug.)
2. **Seed 70002 day 60 — James Okonkwo (carpenter, trust 90, hungry, mourning Heloísa)**: want=`ask_favor` (needs food, hands shake). The policy engaged (listen → commit), the want resolved ("Thank you. I won't forget who fed me when it mattered."), and the mourning beat was specific and human ("Since Heloísa died... I keep expecting to see Heloísa at the fire. Stupid." / "I braid grass while listening to plans."). **Verdict: villagers act like people.**

## Village assessment (plain words)

The village is a real place with real stakes. People have jobs (carpenter, plumber), they get hungry, they grieve their dead by name, they ask for help and remember who gave it. The food pressure is the binding constraint — villages that don't solve the pantry starve by day 16–60, and every seed ended village-lost except the short post-fix 70009 run. That's the designed apocalypse-parenting pressure, not a bug — but it means the endgame leg is *reached* more often than it is *survived*. The deeds complete before death in most seeds (the village dies *after* the food thesis is proven, which is thematically coherent: they prove the thesis, then starve anyway).

## Blanks filled

### 1. Feast-climax copy (narration dead-ends) — `src/js/game.js`, `src/js/feastBuff.js`, `src/js/progression.js`, `src/js/app.js`, `docs/ONTOLOGY.md`
- Stale "until dawn" promises (buff is 2 dawns since r3): added shared `Game.feastDawnWord()` reading the data lever; all four promises + both buff labels use it.
- Inverted narration: `hostFeast` announced the grant ("FEASTED ×2.03") and the draw *before* "the feast is held"; moved the FEAST broadcast above `grantFeastBuff`.
- Demo wart: "Give me that — the Grandma's Tin Cup" → "Give me that — Grandma's Tin Cup".
- Proof: `scripts/test-feast-climax-copy-20261012.js` **13/13** (RED-verified pre-fix: 9 failed).

### 2. Haymaker re-wind softlock (silent wall) — `src/js/abilityActions.js`
`throw_haymaker` stayed `available` after winding up; re-tapping silently overwrote the loaded 2.5x (burning the turn + 40 kcal), and any every-turn policy softlocked the fight (wind up forever, never swing — seed 70009 spun 274 wind-ups). Added an `ABILITY_ACTION_PRECHECKS` entry: refuses while `haymakerReady` is set ("Already wound up — swing to release it."), before payment. The flag always clears on strike/miss/fight-end, so the refusal can't strand the player. Proof: ad-hoc node check (wind-up ok → re-wind refused → strike consumes) PASS; seed 70009 completes post-fix.

### 3. Winseek `CAUT` ReferenceError (found during regression) — `scripts/policies/winseek.js`
`const CAUT` was block-scoped inside the fight-start `if` but referenced at the near-death check → every call threw into the handler's own catch → the whole winseek fight handler was dead code. Moved to function scope. (Policy-side; unblocks winseek sims.)

### 4. Stale `test-feast-buff.js` expectation — `scripts/test-feast-buff.js`
Asserted 1-dawn expiry (build `bc443c41`) vs shipped 2-dawn lever (`fe3bf337`); now reads the lever. **67/0**.

### 5. Competent-policy distance stall (found during diagnosis) — `scripts/policies/competent.js`
`CLOSE THE DISTANCE` tried to `tbPlayerMove` directly to a tile adjacent to a far target; beyond `moveLeft` the engine refuses ("Too far") → the policy stood still forever (ducks_in_a_row: round 4975, nobody moved, nobody bled, player at full HP at the flee edge). Now steps as far toward the target as `moveLeft` allows via `findPath`. (Policy-side; seed 70009 completes.)

## Proof + regression results

| Suite | Result |
|-------|--------|
| test-feast-climax-copy-20261012.js | **13/13** |
| test-feastdraw-20261012.js | 40 pass / 1 fail (pre-existing `spawnSync node ENOENT` env quirk, part 2) |
| test-feast-buff.js | **67/0** |
| test-feastburn-20261011.js | **18/18** |
| test-feast-ritual-proof.js | **21/21** |
| test-table-core-20261011.js | **31/31** |
| test-tablechain-20261012.js | **15/15** |
| test-feastchain-contribute-20261012.js | 4/5 (absolute-threshold only; relative `fixed>=pristine` green) |
| validate-ontology.js | **85/85** |
| 8-seed deed measurement | 8/8 Deed 1, 6/8 Deed 2, zero spins |

## Reachable / fun / winnable verdict (endgame leg)

- **Reachable**: YES. Both food-thesis deeds fire in honest competent play by day ~12–23, well before the endgame window. Integration→60, devotion→35, feast→buff→combat-use all measure clean.
- **Fun**: YES, with the copy fixes. The sentiment lesson is the System at its best (wrong in the right way); the feast climax now reads causally; the channel demo lands. The haymaker precheck removes a real softlock a human could also hit (double-tapping the button).
- **Winnable**: QUALIFIED. The deeds are earnable, but villages starve on the way — 7/8 seeds ended village-lost (days 16–101), mostly to starvation + monster combat, not deed bugs. The food wall is the binding constraint (consistent with the 2026-10-11 MID-GAME WALL finding). The leg is *provable*; *surviving* it is the lever worker's territory, not this run's.

## Files changed
`src/js/game.js`, `src/js/progression.js`, `src/js/feastBuff.js`, `src/js/app.js`, `src/js/abilityActions.js`, `docs/ONTOLOGY.md`, `scripts/policies/winseek.js`, `scripts/policies/competent.js`, `scripts/test-feast-buff.js`, `scripts/journey-endgame-r6-20261012.js`, `scripts/test-feast-climax-copy-20261012.js`, `evidence/2026-10-12/journey-endgame-r6.*`
