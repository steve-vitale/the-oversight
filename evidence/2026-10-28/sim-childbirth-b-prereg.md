# sim-childbirth-b prereg — a births band for child pantry eats (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T0444Z,
axis food-economy, arm sim-childbirth-b. Base: master at worktree
creation (outflowzero lineage; exact base recorded in the evidence
file from `git log`). Committed BEFORE any judged probe or capture
change. Measurement only: zero src/js changes, no default flips,
no lever.

## Backlog item

Tracker order #2 from run fleshout-loop-b-20261028T0330Z (arm
sim-outflowzero-b, evidence/2026-10-27/sim-outflowzero-b.md, GO):
the fixture proved the child pantry eat door fires with capture
exact to 0 kcal (150 kcal, 1 unit, hunger 80 -> 50) — but on the
unscripted band it counted ZERO child eats because competent
rosters hold 0 children in 96 roster slots. Starting rosters hold
no children, so a child eat needs a births band: a band where
children actually exist. This arm finds or builds that band and
measures UNSCRIPTED child pantry eats — not a re-proof of the
fixture, and not scripted roster edits counted as real play.

## Canon

docs/CANON.md read first. docs/KIN.md read: the Taking took half
of adults at day zero and the taken half's children into stasis;
"Children of KEPT adults (villagers who remained) stayed with the
villages and grew up normally." No canon doc covers pantry ledger
/ outflow accounting or births mechanics — the firing conditions
below are read from src/js code (file:line cited), not invented.
Stated, not invented: KIN's fiction says kept adults' children
exist in villages; the code read below says whether any code path
puts such a child where a pantry eat can fire.

## Code read (before any probe — the mechanism question)

1. THE ONLY BIRTH CODE is `simVillageDay` (src/js/game.js
   ~10068-10101, distant-village day sim): `if (village.roster
   && village.day >= 270 && Math.random() < 0.005)` then, given
   >= 2 roster members alive with `partner` and age 18-40, push
   a baby `{age: 0, alive: true, name: null, unnamed: true,
   birthDay: village.day, parents: [...]}` onto `village.roster`
   and a news line "A baby was born to <parent> on day <day>".
   Births are gated to 270+ days (drama.js:1435 comment agrees)
   at 0.5%/day — most playthroughs see zero births, by design.
2. `simVillageDay` runs ONLY for distant villages: via
   `catchUpSim` (game.js:9945, on first approach, simming every
   day since game start) and via `tickJoinedVillage` (game.js:
   10244, called from endDay for the JOINED village only).
   It NEVER runs on `state.village` (the player's home village).
   No other code pushes a child into the home roster.
3. Distant villages DO start with children: `genVillageRoster`
   (game.js:9894-9917) generates 30% children, ages 1-14, plus
   partnered adults — but those children live in
   `otherVillages[].roster`, a separate array from the home
   roster, with abstract `pantryKcal` (a scalar, not pantry
   stacks).
4. The child-eat door ONLY fires inside `npcChildAction`
   (game.js:20878 hunger branch: hunger > 60, fear <= 70,
   pantry holds a kcal>0 stack -> eat exactly 1 unit of the
   FIRST such stack, hunger -30, announce "<name> eats from
   the pantry."), reached via `npcTakeAction` (game.js:20651,
   `npcAge < 15`) from `villagerTurn` (game.js:20537), which
   iterates ONLY `state.village.roster` ids that hold a grid
   position. `npcsOnNode` (game.js:16327) and
   `ensureVillagerPositions` (game.js:16358) likewise filter
   ONLY `state.village.roster`. Distant-village children never
   get positions, never take turns, never touch a pantry.
5. The home roster starts adult-only: `genCharacter`
   (game.js:1055-1056) draws age from occupation bands
   `ageMin = occ.minAge || 19` (default 19-62); the outflowzero
   census confirms ages 19-69, youngest 19. `npcAge`
   (game.js:17867) falls back to 30 for unknown ids, so no stray
   id can read as a child. Home ages only rise (fractional
   aging in simVillageDay; no home aging path lowers age).
6. CONSEQUENCE (pre-registered hypothesis, to be tested, not
   assumed): unscripted child pantry eats are STRUCTURALLY
   IMPOSSIBLE in current code on any band that stays home —
   not a policy artifact. The births band can still succeed in
   its diagnostic job: it must show (a) home children == 0
   across the band, (b) distant children DO exist (gen 30% +
   any post-270 births), and (c) `npc-child-pantry` calls == 0
   anyway, because the two populations never meet. If instead
   the band records >= 1 unscripted child eat, the hypothesis
   is WRONG and the GO below fires — the band, not the code
   read, is the judge.

## Instrument (reused, not rebuilt)

scripts/stockdoors-capture.js `installStockdoorsCapture`
UNCHANGED (same installer as outflowzero, which folds the
driedhunt `_removePantryKcal` door in). New sweep script
scripts/sweep-childbirth-b.js: same competent-nofeast band
runner as scripts/sweep-outflowzero-b.js, extended with
(a) home census at setup AND at end, (b) distant census at
end: every `otherVillages[]` entry with a generated roster —
roster size, living children (age < 15), births (members with
`birthDay` set), village day reached, and any birth news
lines, (c) `npc-child-pantry` calls/records from the capture.
New analyzer scripts/analyze-childbirth-b.js aggregates the
corpus and judges the GO bar. No sibling capture file is
modified. No src/js change is planned; if the band finds a
game-code gap, the fix is a NEXT run's arm (Steve-call if it
changes who lives in Haven), not a mid-run edit.

## Unscripted band (shared baseline, no lever)

Policy competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off), pilot seeds
10410-10417 (8 fresh seeds — verified: no prior band used
them as seeds; the digit strings 10412/10413/10416 found in
old evidence files are kcal fields, not seeds).
Horizon: DEATH-AWARE cap 300d (dead villages stop; runDays
stops on death/win — the cap is not a fixed horizon).
Justification: the births question REQUIRES 270+ days —
birth rolls only fire at village.day >= 270, so a 100d band
cannot even roll a birth. Cap 300d gives a 30-day birth
window for distant villages approached late, while staying
cheap (sims ~3-4s per 100d seed-run class). A village that
dies before 270 contributes its village-days to the
denominator and its census to the "no children at home"
result; it does not invalidate the band.

## Pre-registered GO bar (binds the run; a miss is NO-GO)

GO (the band produced a real child eat) iff ALL of:
- (G1) >= 1 UNSCRIPTED `npc-child-pantry` record on the
  pilot band, with totalKcal > 0 and units == 1 (the capture
  is snapshot-diff by construction; capture exactness for
  this door was already proven to 0 kcal by the outflowzero
  fixture and is NOT re-judged here).
- (G2) The record's seed carries a home census showing a
  child in `state.village.roster` with a position (i.e. the
  eat came from a real roster child, not a capture artifact).

Otherwise the verdict is DIAG-NO-GO (never a fake GO, never
scripted children counted as unscripted), carrying:
- the code-read explanation of why births never reach a
  pantry eat under this policy (or, if the code read is
  contradicted, what actually happened),
- village-days observed (sum of daysAlive + distant
  village-days reached),
- the named next instrument: what play path or game change
  would produce a real child eat. Pre-registered candidate:
  a home-village birth path mirroring simVillageDay's birth
  block into the home village's daily tick (a game change —
  Steve-call, since it changes who lives in Haven); note a
  home-born baby WOULD reach the door (home roster id +
  positions via ensureVillagerPositions), while distant
  births alone never can. If the band instead shows home
  children arriving by some other real path, that path is
  the next instrument and the candidate is withdrawn.

CONFIRM RULE: a confirm band (12-16 fresh seeds, same policy
and instrument) is spent ONLY if the pilot records >= 1
unscripted child eat (to check recurrence). If the pilot is
DIAG-NO-GO with a counted structural explanation, no confirm
is spent — there is nothing to confirm.

## Sense requirement

If children appear anywhere (distant rosters, birth news),
read what the game says about them: quote birth news lines
and any narration around them, and judge whether the village
feels like children live there. If no child eat fires, say
what the village looked like without children at home — who
ate, who fed whom, and whether anything in the transcript
ever mentions a child at the fire.

## Wall numbers (reported, not judged)

National / table / wins, wave reach 1-5, median survival,
and death-cause shares for the 8-seed band, plus the
telemetry-deviation check against the scale-wall baseline
(loop-B body step 10) with any LOUD line investigated
same-run.

## Panel statement (section 15)

No balance-panel comparison exists: measurement only, no
lever, no game-code change, no before/after leg. The
standing panel exception applies — corpus is census rows
with no panel-ingest mode, stated explicitly, no panel
faked. (Same exception as outflowzero.)

## Metric review (section 14 — filled at report time)

To be filled in the evidence file: whether the bar worked as
written, any definition that proved wrong (proposed revision
for the NEXT run only), and the panel-exception statement.
