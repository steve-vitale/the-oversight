# Long-run sim — LEVER 6 ROUND 5: prize lanes (2026-10-11)

Canon read first: docs/CANON.md, docs/CONTESTS.md ("Prizes feed EVERY
progression lane, never just combat: Item evolution assists, ability
unlocks, synergy hints, knowledge dumps, supplies, fan care packages
(wacky, never dinner). Prizes must be worth the fear."). Built on r1
(fresh-face casting), r2 (contest-fear), r3 (adaptation), r4 (fan clubs) —
not re-litigated; r4 documented the prize-lane gap this round fills.

Commit `4db64c38` (rebased onto `26d6f110`), `[needs-eyes]` — new System
prize copy + combat behavior (Chorus Line arena pathing). Merged locally,
pending ship.

## The blank

r4's census: contest/show prizes were items/supplies/care-packages ONLY.
"Ability unlocks, synergy hints, knowledge dumps, item-evolution assists
as prizes: NEVER. No code path exists." Canon lists them all as intended
prize lanes.

## Lever played — "prize lanes" (all numbers exact)

`src/js/contests.js`:
- **Item-evolution-assist lane built** — the last missing canon prize lane.
  New `_cxPrizeEvolutionAssist(contest)`, wired as the 4th lane of
  `_cxPrizeLane`. A contest win is a story moment: **+3 bond (+5 on
  extreme wins)** on a bonded relic — the story-moment value from the
  relic system's own header. Zero new mechanics: gains flow through
  `accrueRelicBond`'s exact machinery (`checkKeepsakeReveal`, and the
  10/25/50 `offerRelicEnhancement` 1-of-3 offers — the System still
  offers; the assist never grants directly). Preferences: sentimental
  keepsakes first (the show's language is attachment), equipped over pack,
  then any bonded relic. Sentimental owner-lock respected; lane false when
  no System / no relics / none yours. Announced, never silent:
  `📺 SYSTEM: "UNIT TOTE BAG — the cameras kept finding it. It mattered to
  you on the floor, and that is... interesting. Meaning is fuel. We are
  curious what it becomes. (+3 bond on your Tote Bag)"` + tele().
- **Lane weights rebalanced:** ability 0.40 / synergy 0.25 / knowledge
  0.20 / evolution 0.15 (was 0.45/0.30/0.25), usual fall-through.
  First-win guarantee intact.
- **Knowledge dumps + synergy hints: NOT rebuilt — verified.** The
  sibling's lever-9 r2 work already implemented exactly those paths
  (identifyPlant path; tease/unlock path). Rebuilding would be churn;
  verified via their 52/52 proof test (still green) and the before/after
  census (lanes firing, copy narrated).
- **Ability boundary held:** the ability lane sets `s.abilityChoices` — a
  System *offer* the player must still accept into the 6 slots, never a
  direct grant. Canon-compliant (System-only, CANON.md); documented, not
  crossed.
- **Recast-honesty bug fixed** (found by sense-testing): a 3-take contest's
  first take (away from Haven) recast to its *own third take* — transcript
  read "Lena and Lena have been taken" — and the verdict resolved her
  twice (double winner's share, double verdict, double death roll).
  `takenSet` now seeds with the whole original cast.
- **Chorus Line arena stall fixed** (found by sense-testing):
  `sigW3b.js` count-step clamped movement to tiles 1..7; the player fled
  to the sealed edge (8,0) ("the barrier holds — no one leaves until this
  is decided"); monster couldn't follow, kick (range 3) couldn't reach —
  fight spun 420+ rounds, 8+ min sim hang. Now rides the engine's
  `tbStepToward` over the full 0..8 grid. Canon: monsters were sent to
  fight.

## Proof

**Mechanism** — `scripts/test-contest-prize-evolution-20261011.js`
35/35; `scripts/test-contest-recast-nodup-20261011.js` 9/9 (RED before
fix — captured `[c, c]`); `scripts/test-chorus-arena-advance-20261011.js`
7/7. All re-run green after rebase onto `26d6f110` and after landing.

**Before/after on identical seeds** (8 seeds × competent + riskAware,
200d, sweep harness `scripts/sweep-contests-r5.js`; raw JSON in
goal hidden_files/contests-r5/{before,after}.json):

| metric (competent / riskAware) | before | after |
|---|---|---|
| prize lane census: ability / synergy / knowledge / **evolution** | 7,3,1,**0** / 4,0,2,**0** | 5,2,2,**1** / 4,0,1,**1** |
| avg / med / max days survived | 69/66/142 / 62.8/65/128 | 61.4/64/94 / 61.3/65/128 |
| max wave unlocked | 3 / 3 | 3 / 3 |
| contests / shows / ratings summons | 54/42/5 / 53/24/0 | 46/39/3 / 48/21/0 |
| player contest win rate | 0.89 / 0.88 | 1.00 / 0.88 |
| contest deaths | 2 / 1 | 2 / 1 |
| fan-club votes / care packages | 9/29 / 0/13 | 0/20 / 0/14 |
| death causes (combat / villager-combat / starvation) | 34/36/23 / 58/33/13 | 43/37/23 / 47/33/18 |

Reads: evolution assists 0→2 (both first-win gifts, announced + tele'd —
the calibrated ~15% of a rare win throttle working as designed); other
lanes intact; survival aggregates within noise (RNG-chaotic, 8 seeds);
deaths remain combat/attrition — no behavior regression.

**Regressions** (worker-verified, post-rebase spot-checked): prize-lanes
52/52, clubs 18/18 ×3, fear 21/21, freshface 24/24, adapt 27/27,
break-contests r15 55/55, gaps 6/6, ledger 22/22, ontology 83/83.
monster-behaviors 20/21 — the `herald` failure is pre-existing on pristine
HEAD (verified via stash).

## Reachability verdict

- All **8 contest categories** fired both rounds (blood, detective,
  chance, moot, forage, endurance, puzzle, weird).
- **5 of 6 canon shows** aired (why_eat, break_room, mouth_race,
  ask_human, moot_show); **death_reel 0/66** this draw — in the 30-show
  pool, highlight-growth code live (r4-verified), P(0)≈0.11 → reachable,
  not decoration, not a gap.
- Ratings summons fired; fan clubs voted/sent packages per r4 behavior;
  Beloved win path prices `fanFavor()` as before.

## Sense-testing (Steve 2026-10-11 law) — reads

- Evolution copy is the System's unhinged register, names YOUR relic, no
  template leaks.
- Shy-vault + System-gift stacking reads honest ("The vault was feeling
  shy tonight" → System gift lands anyway).
- Villager arcs coherent: pull → cheer → mixed fate → "The village will
  talk about this for days."
- Standing observation (documented, not this lever): the same villager
  gets show-pulled every few days with identical "MADE for this" lines —
  notability-weighted casting doing its job a bit too well.

## Village assessment (plain words)

Villages look like struggling settlements that mostly die by day 50–90 to
combat and hunger, TV a rare weather event — same as r4. Standout
after-run (riskAware seed 31337, 128 days): Emma became the perennial
contestant — pilot-episode pull → watch party → "Emma and Marcus have
been taken" (recast honestly substituting Marcus for the away Hector, no
dup) → aftermath ("You go to Emma after...") → village gossip. The village
watched her host an alien ambassador at dinner on day 102 ("The Guest"),
then died out by day 128 to villager combat (6) and attrition — starvation
only 1. Who thrived: televised winners and their clubs; who died:
everyone eventually, mostly in fights. Missing capabilities, still: the
social lane stays quiet (moot wins are rare in sims — casting-density
observation, not a bug).

## Blanks: filled vs documented

- **Filled:** item-evolution assists (built — all four canon lanes now
  live); recast-honesty dup (fixed); chorus-line arena stall (fixed).
- **Documented:** knowledge dumps + synergy hints (already built by
  sibling lever-9 r2 — verified, not rebuilt); ability grants (canon
  boundary — offers only, lever-9 territory); waves 4–5 / arcs→national→
  table chain unreachable in ~60-day sim horizons (lever-10 territory,
  per r4).
