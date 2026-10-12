# Long-run sim — LEVER 6 ROUND 7: contest casting repel (2026-10-12)

Canon read first: docs/CANON.md, docs/CONTESTS.md ("the System wants its
stars — picks weighted by notability... never uniform"; "ratings_casting:
notability-weighted, never uniform"). Built on r1–r6 — not re-litigated.
The show side is untouched this round (r6's repel still firing: 4 flips).

Commit: `[needs-eyes]` — new System copy ("The System was going to take
{name} AGAIN. The producers cut it — somebody else takes the arena.").

## The blank

r6 documented: "contest-side casting still uses raw weights (fireContest
weightedPick — the same notability concentration exists for contest
co-stars)." Measured hard this round BEFORE the lever (16 seeds ×
competent + riskAware × 200d, identical-seed harness
scripts/sweep-contests-r7.js, pristine HEAD — one mid-run edit
contamination caught and the baseline re-run clean):

- 27.4% of villager contest-cast slots went to the same face as the
  previous contest's cast
- 6.6% of a villager's consecutive casts came within 3 days
- median run: ONE villager took 50% of all villager co-star slots
- lived example (before, competent seed 22, 140d): james_okonkwo took
  8/23 co-star slots; james+david appeared in 9 consecutive contests
  (d31–d73)

## Lever played — contest casting repel (exact, src/js/contests.js)

The contest-side mirror of r6's show-side repel, in fireContest only:

1. **Recency repel in weightedPick**: the ONE shared `notabilityWeight`
   is untouched (canon: depth + impact, Steve 2026-10-08/09) — the
   repel MULTIPLIES it by days-since-last-contest-pull: ≤2d ×0.25,
   3–5d ×0.5, 6–10d ×0.75, >10d ×1.0. A repel, NOT a ban. The 10% whim
   (uniform, announced) and the player's surest-star first slot skip
   it — only the concentration path (weighted co-star picks + the
   weighted lead fallback when the player isn't castable) gets it. The
   recast path at the grab keeps raw weights (rare exception path,
   already heavily announced — documented, not touched).
2. **Pull-day ledger**: fireContest records `_contestPullDays[who]`
   (bounded 24) for every cast member, player included. SEPARATE from
   r6's `_showPullDays` — shows and contests are different pools; a
   villager can do a show and then a contest, that's fine fiction.
3. **Flip announcement**: when the repel changes a pick, the System
   says, ~40% of flips: "📺 The System was going to take {name} AGAIN.
   The producers cut it — somebody else takes the arena."
   (tele('contest_cast_repel', {star, picked}) fires on every announced
   flip; at most one line per contest.)
4. Ontology `ratings_casting` rule extended with the repel clause
   (validator: 84/84 systems, release permitted).

## Proof

**Mechanism** — scripts/test-contest-casting-repel-20261012.js 25/25
(×4 seeds 424242/777001/999983/20261011). RED-checked on pristine:
exactly the 5 repel assertions failed (T2/T2b/T2c/T6/T7), all
preserved-behavior assertions passed. GREEN after: repel flips the
co-star pick (A cast today → B picked, cut tele names star+picked, the
honest line said on the lucky roll); decay restores A at 6d; a
repelled-only candidate still wins (no ban); whim carries no repel
telemetry; cut line ~40% with tele always, player cut star reads "you";
ledger records player + co-stars, bounded at 24, valid days; a show
pull yesterday does NOT repel contest casting (separate pools);
notabilityWeight still the depth+impact formula.

**Before/after on identical seeds** (16 seeds × competent + riskAware,
200d; raw JSON in goal hidden_files/contests-r7/{before,after}.json):

| metric | before | after |
|---|---|---|
| villager contest casts | 226 | 220 |
| immediate-repeat rate (same face, consecutive contests) | 0.274 | **0.214** |
| near-repeat rate (consecutive casts ≤3d apart) | 0.066 | **0.045** |
| median max co-star share | 0.50 | **0.42** |
| contest repel flips (tele) | 0 | 24 |
| cut lines said (~40% of flips) | 0 | 12 |
| contests / shows / summons | 228/125/27 | 245/123/28 |
| contest deaths | 5 | 4 |
| care packages | 170 | 188 |
| avg / med / max days survived | 67/61/140 | 70.3/66/143 |
| kills / counter kills | 587/259 | 591/254 |
| death causes (combat / villager-combat / monster / starvation) | 231/118/39/30 | 214/110/47/25 |
| wave 2 / wave 3 reach | 29/18→22 | 29/24 |
| arc II / arc III | 32/32 | 32/32 |
| successions / young | 154/10 | 147/11 |
| show repel flips (r6 lever, untouched) | 3 | 4 |

Reads: the lever hit exactly its target — immediate repeats down a
fifth, ≤3d loops down a third, the top co-star's share down, 24 flips
with 12 honest announcements. Everything else is RNG-chaotic noise on
identical streams (the lever changes who gets cast, so trajectories
diverge legitimately — e.g. the 515s seed-33 survivor died on day 107
after instead of day 123 before). No behavior regression: deaths still
combat/attrition, wave/arc reach stable, all 8 contest cats and all 6
canon shows fired both rounds.

**Regressions** (identical before/after): fear 21/21, prize-lanes 52/52,
clubs 18/18, adapt 27/27, freshface 24/24, contest ledger 22/22,
ontology 84/84. No pre-existing failures found.

## Reachability verdict

- All **8 contest categories** fired both rounds (blood 72, puzzle 32,
  weird 27, moot 28, detective 24, forage 22, endurance 21, chance 19).
- All **6 canon shows** aired both rounds (why_eat 4, break_room 2,
  mouth_race 3, ask_human 2, moot_show 2, death_reel 5).
- Waves 1–3 reachable (29/32 wave 2, 24/32 wave 3). Waves 4–5: 0/32 —
  structural walls per completion-sweep-r7 (scale, feast surge),
  lever-10 territory, documented not fixed.
- National / table / win: 0/32 — same documented walls as every round.

## Sense-testing (Steve 2026-10-11 law) — reads

Full contest/show transcript read: competent seed 7, days 8–64
(after run, 3 flips):

- d28: "The System's whim: Wei is *interesting*." → Wei does the
  Confession solo (played watch beat — cheer/heckle, comfort,
  "You go to Wei after. Win or lose, they need a familiar face more
  than applause."). Earned arc: whim → screen time.
- d32: "📺 The System was going to take Wei AGAIN. The producers cut
  it — somebody else takes the arena." → "The System has taken You
  and Sirikanya." Coherent: the cut star was literally on screen 4
  days earlier; the line names the right face; the next line names
  the actual pick. Wei's whim arc is not on a loop.
- d33: the recast honesty (r5) fires on top: "The System was going to
  take Sirikanya. Sirikanya is away from Haven. The show must go on
  — it takes James instead." Two honest production lines in two
  days, no contradiction, no robot voice.
- d34: the Pit is played for real — the player takes the Hunting
  spear into a real arena fight while James fights his off-screen
  ("James WON. You didn't see it — you had your own arena. The
  village will tell you about it for weeks."), winner's share lands
  in the pantry. Co-star arcs are earned: wins → notability →
  casting → more wins.
- Villager behavior: the village watches (watch beats with real
  choices and camera consequences — "the System files you under
  *interesting*"), cheers until throats hurt, winces at shame
  ("They'll be kind about it. And they will never, ever let it
  go."), visits contestants after ("They're quiet. They'll talk
  about it later. Or never."). Nobody is robotic. One repeated
  signature ("The village watches the broadcast. Nobody blinks.")
  reads as an intentional sign-off, not a loop.

## Village assessment (plain words)

Villages look like r6's: struggling settlements dying ~day 50–90 to
combat and hunger, TV a rare weather event. Contrast run (competent
seed 22, 114d after): the co-star rotation is visibly wider — the
top villager took 5 slots (was 8), spread across 5 faces instead of
2, and the d54→d75 gen_d5ke4mq run is the designed repel-not-ban
case (a runaway star still shows up, just not stacked on consecutive
contests). Who thrived: televised winners and their clubs; who died:
everyone eventually, mostly in fights (combat 214,
villager-combat 110, monster 47, starvation 25). Missing
capabilities, still: national/vest/four-realm never form, feast
surge never arms, traps never set — all documented walls outside
this lever.

## Blanks: filled vs documented

- **Filled:** the r6 blank — contest-side repeat rate 0.274→0.214,
  ≤3d loops 0.066→0.045, median max co-star share 0.50→0.42, 24 flips
  announced honestly.
- **Documented:** the recast path at the grab keeps raw weights
  (rare exception path, already announced — future round can decide);
  waves 4–5 / national / table / win / feast / traps walls (lever-10
  / completion territory); mid-run baseline contamination caught and
  re-run clean (loadGame re-reads src from disk per run — never edit
  code mid-sweep again).
