# Long-run sim — CONTEST-FEAR lever (2026-10-11)

Canon read first: docs/CANON.md, docs/CONTESTS.md ("contests must be FEARED";
"contests are played, not RNG" — Steve 2026-10-08). Built on lever-6
(sim-contests.md) which measured the blank: **96%+ contest win rate, ZERO
contest deaths** across 32+ runs — "Death is on the table" never landed.

## Baseline (before) — 8 seeds × competent, 200-day horizon, identical seeds

scripts/sweep-contest-fear.js (new; per-contest id/cat/risk/variant/outcome,
player HP+trauma before/after, deaths, refusals, show outcomes).

| metric | before |
|---|---|
| contests | 35 |
| win rate | 97.1% (34 won / 1 lost) |
| contest deaths | 0 |
| blood share | 1/35 (~3%) |
| extreme-risk record | 4/4 won |
| avg HP lost / trauma per contest | 19.1 / 3.0 |
| refusals | 0 |

Blood (the feared category) was decoration: at wave 1 only pit/duel are
legal and uniform pick buried them; sims never reach wave 2+. Every played
template's climax mapped choice-0 → WIN, so the sim's choice-0 play (and any
literate player) auto-won. Risk display ("People die in this one.
Regularly.") was a boy-who-cried-wolf.

## Lever played — "the billing must mean it" (all in src/js/contests.js)

1. **Blood weight** (`pickContest`): blood contests get 4x scheduling weight
   at wave 1 → ~5% to ~18% of picks. Gauntlet/siege stay wave-gated (Steve
   2026-10-06) — only legal contests weighted. Still an event, not tedium.
2. **High/extreme damage honesty** (`contestChoose` d.dmg choke point):
   phase damage ×1.5 for high/extreme-risk contests (stacks with hardened
   ×1.25), said aloud once per contest ("The billing said HIGH RISK. The
   System doesn't pull its punches."). Played, not RNG: deterministic,
   state-driven; death still comes only from health→0; shows/summons keep
   the no-kill cap ("TV doesn't kill" — canon).
3. **Honest death record**: `state.contestDeathsById` ledgered in
   `_contestDie` (player) and `_cxKillContestant(pid, contestId)` (villagers;
   3 call sites updated). The participate/refuse screen now states: the
   billing, the contest's real death count ("This one has killed 2 before."
   / "No one has died in this one yet. That you know of."), and current
   health.
4. **Shame bites** (`_showVillagerEnd`): villager show shame lands real rep
   damage (`applyRep(pid, {kind:-3, honest:-1}, 1, true)` — REP only, never
   trust, per the standing rule), said aloud ("The village winces on their
   behalf. They'll be kind about it. And they will never, ever let it go.").
   The galaxy still loves the trainwreck (+1 showbiz favor kept — Steve's
   design).
5. **Reward side moves too** (`_contestEnd` prize table): high/extreme wins
   roll hotter — prize chance +0.15/+0.3 (hardened stacks, cap 0.95). The
   lever raised the risk side; the high-risk/high-reward contract requires
   the reward side to move. Tier caps unchanged (tier 4 still extreme+wave 4
   only).

## Proof

**Mechanism** — scripts/test-contest-fear-20261011.js: 21 assertions × 3
seeds, all green. Blood share 400 picks ~18%; ×1.5 applied once per contest
to high-risk (control: medium untouched, shows capped above death);
ledger increments on both death paths; choice screen states billing +
deaths + health; shame applies rep-only damage, said aloud.

**Before/after on identical seeds** (same 8 seeds, 200d):

| metric | before | after |
|---|---|---|
| contests | 35 | 19 |
| win rate | 97.1% | 94.7% |
| **contest deaths** | **0** | **2 (both player)** |
| blood share | 1/35 | 2/19 |
| refusals | 0 | 0 |

(Fewer after-contests: the 2 deaths ended those runs early — seeds 7 and
12345. Seed 12345 before: 26 contests, survived 200d; after: died day 47.)

**The 2 deaths, checked for honesty** (Steve's sensicality law — no gotchas):
- Seed 12345, day 47, **auction** (chance/high): the player chose "Bid a
  memory" → "Raise" → "Everything — win at any cost" (dmg [10,20]×1.5,
  trauma 10). Entered hurt; "win at any cost" cost everything. Every choice
  named its price; "Walk away — keep yourself" was the live option. Honest.
- Seed 7, day 46, **price** (moot/extreme): the player chose "Volunteer —
  take the price" → "Take it, if chosen". Extreme billing ("almost nobody
  walks away from this one") + the new stakes screen stated the risk. They
  volunteered for the price and paid it. Honest.

Win rate stays high because the sim plays well — correct per "played, not
RNG". The fear is in the stakes, not the loss rate: a thinking player now
faces a real dilemma at the choice screen (billing + death record +
current health), and bold play while hurt can kill.

## Regressions

test-contest-fear 21/21 ×3 seeds; break-contests-20261010 50/50;
break-contests-r12/r13/r14 34/34, 23/23, 38/38; break-contests-r15 55/55;
shows-break-20261010 81/81; shows-breakit-r15 486/486; shows-breakit-r16
22/22; fameseeker 41/41; ontology 63/63.
One pre-existing failure in test-break-shows-20261009 (H5 source-grep for
`!it.kcalEach` — absent on master too; behavioral checks pass). Not mine.

## Sense-testing — new copy reads

Choice screen (pit, 2 deaths on record, 58 hp):
"📺 The System waits. The cameras are already rolling. / 📺 The billing
says HIGH RISK — people die in this one. Regularly. / 📺 This one has
killed 2 before. / 📺 You are at 58 health. / Participate — or refuse, and
let the galaxy watch you say no."
Clean record variant: "No one has died in this one yet. That you know of."
— ominous, honest about the ledger's limits.

Fear line: "📺 The billing said HIGH RISK. The System doesn't pull its
punches." — said once per contest, never stacked silently.

Shame: "📺 The village winces on their behalf. They'll be kind about it.
And they will never, ever let it go." — the bite lands; the trainwreck
love stays.

## Village assessment (plain words)

The villages looked the same as lever-6 (struggling early settlements, most
dead by day 50-80) — except twice, the show took someone. Seed 7's village
watched their player volunteer for the Price and not come back; seed
12345's watched the auction take everything. Those villages' gossip now
carries contest deaths — the Death Reel has content, the ledger has
entries, and the next choice screen in a future run will read "This one
has killed 2 before." The fear compounds across runs via the record.

## Blanks documented (not this lever)

- The sim auto-participates (choice-0) — it cannot "think twice". A
  risk-aware policy variant would measure avoidance behavior; the stakes
  display now gives a human the information to do it.
- Hardened variants still replay byte-identical beats (lever-6 finding) —
  the ×1.25/×1.5 multipliers are real but the copy doesn't change.
- No villager countdown reactions (lever-6 finding, lever 3 territory).

## Files

- src/js/contests.js — blood weight, fear damage, death ledger, honest
  stakes, shame bite, hotter high/extreme prizes, ontology rule
- src/js/contestEngine.js — _cxKillContestant(pid, contestId) call site
- docs/ONTOLOGY.md — regenerated by validator
- scripts/sweep-contest-fear.js — before/after measurement sweep
- scripts/test-contest-fear-20261011.js — 21 assertions × 3 seeds

[needs-eyes] in commit msg: feel/combat-adjacent (damage tuning, new
on-screen stakes copy) — Steve should see the choice screen on his phone.
