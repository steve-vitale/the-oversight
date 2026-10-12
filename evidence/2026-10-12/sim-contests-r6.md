# Long-run sim — LEVER 6 ROUND 6: casting variety (2026-10-12)

Canon read first: docs/CANON.md, docs/CONTESTS.md ("the System wants its
stars — picks weighted by notability... never uniform"). Built on r1–r5 —
not re-litigated. Contest casting (fireContest ratings_casting) untouched;
the lever is the SHOW side only, per the documented blank.

Commit: `[needs-eyes]` — new System copy (rotating fans/shame landings,
"producers cut it" casting line). Casting weights changed (show side),
contest weights untouched.

## The blank

r5's sense-test: "the same villager gets show-pulled every few days with
identical 'MADE for this' lines — notability-weighted casting doing its
job a bit too well." Baseline measured it hard (16 seeds × competent +
riskAware × 200d, identical-seed harness scripts/sweep-contests-r6.js):

- 16.4% of villager pulls were the same face as the immediately previous show
- 4.5% of villager pulls came within 3 days of that villager's own last pull
- median run: ONE villager took 67% of all villager pulls
- landing copy: exactly ONE "MADE for this" template, ONE shame template
  (Emma alone: 13 identical "MADE for this" lines across 16 runs)

## Lever played — "casting variety" (all numbers exact, src/js/contests.js)

1. **Recency repel in showCastPull** (the 'star'/'tie' path only — whim
   10% and fresh-face 30% skip it, rare and already announced). The ONE
   shared `notabilityWeight` is untouched (canon: depth + impact,
   Steve 2026-10-08/09): repelled weight = raw weight × days-since-last-pull
   factor — ≤2d: ×0.25, 3–5d: ×0.5, 6–10d: ×0.75, >10d: ×1.0. A repel,
   NOT a ban: Emma-as-regular is fine fiction, just not on a loop. When
   the repel flips the winner, `cast.cutStar` carries the cut star and
   fireShow says, ~40% of flips: "📺 The cameras were going to call
   {name} AGAIN. The producers cut it — somebody else gets a turn."
   (tele('show_cast_repel') fires on every flip for telemetry.)
2. **Pull-day ledger**: fireShow records `_showPullDays[who].push(day)`
   (bounded 24) for every pull, villager AND player — the player on every
   third show is as robotic as any villager. Fresh-face `_showPulled`
   untouched (villagers-only by design).
3. **Fans landing copy**: 1 identical line → 6 rotating templates
   (the signature "was MADE for this" keeps 2/7 weight — plurality voice).
   **Shame landing**: 1 → 3 rotating templates. Side effects identical
   (showmanship +1, favor, gossip, village-wince line, XP).

## Proof

**Mechanism** — scripts/test-contest-casting-variety-20261012.js 21/21
(×4 seeds 424242/777001/999983/20261011): repel flips the winner (B over
today-pulled A, cutStar=A); decay restores A at 6d; a repelled-only
candidate still wins (no ban); whim carries no cutStar; cut line says
~40% while tele fires always; ledger grows once per fireShow pull with
valid days; fans landing rotates ≥3 templates in 60 with identical
showmanship grants; shame rotates ≥2 with rep damage intact;
notabilityWeight still the depth+impact formula.

**Before/after on identical seeds** (16 seeds × competent + riskAware,
200d; raw JSON in goal hidden_files/contests-r6/{before,after}.json):

| metric | before | after |
|---|---|---|
| villager show pulls | 67 | 64 |
| immediate repeat-pull rate (same face as previous show) | 0.164 | **0.109** |
| near-repeat rate (pull ≤3d after own last pull) | 0.045 | **0.000** |
| median max share (one villager's share of villager pulls) | 0.67 | 0.67 |
| repel flips (show_cast_repel) | 0 | 5 |
| star / tie / whim / fresh / debut pulls | 53/12/8/27/11 | 45/9/4/28/11 |
| MADE-for-this templates | 1 | 6 (+3 shame) |
| avg / med / max days survived | 76.4/72/146 | 76.9/73/200 |
| contests / shows / ratings summons | 289/140/20 | 260/127/13 |
| contest deaths | 15 | 9 |
| wave 2 / wave 3 reach | 30/18 | 30/20 |
| kills / counter kills | 577/238 | 594/241 |
| death causes (combat / villager-combat / starvation) | 185/125/46 | 204/127/52 |
| care packages | 127 | 112 |
| successions / young | 177/16 | 180/15 |

Reads: the lever hit exactly its target — repeats down a third,
≤3d loops eliminated, and the flip telemetry fires. The median max
share is unchanged BY DESIGN: stars are still stars (Emma won 4
contests this run and stayed the most-pulled face), they just rotate
through the week instead of stacking on consecutive shows. Everything
else is RNG-chaotic noise on identical streams (the 146→200 max is one
seed whose trajectory diverged after a casting flip — noted, not
claimed). No behavior regression: deaths still combat/attrition,
wave/arc reach stable, traps 0/0 as in r7 (policy gap, not contest code).

**Regressions** (worker-verified): fear 21/21, fresh-face 24/24,
clubs 18/18, adapt 27/27, prize-lanes 52/52, ontology 83/83.

## Reachability verdict

- All **8 contest categories** fired both rounds (blood 58, endurance
  22, moot 19, puzzle 35, forage 30, detective 30, weird 29, chance 37).
- All **6 canon shows** aired: why_eat 4, break_room 4, mouth_race 4,
  ask_human 8, moot_show 7, death_reel 3 — plus 24 more pool shows.
- Ratings summons fired (13); care packages fired (112). Fan-club boons
  are gate-rare by design (25+ lane favor); boon mechanics verified by
  the clubs suite (18/18). `apClubVote` as a named method does NOT
  exist — "votes" in older evidence = apClubBoon fires; documented.
- First-win System gift: untouched this round, prize-lanes suite 52/52
  green (guarantee intact).
- Waves 4–5 / national / table / win: still 0/32 — structural walls per
  completion-sweep-r7 (scale, feast surge), lever-10 territory, not this
  lever.

## Sense-testing (Steve 2026-10-11 law) — reads

Real sequence, competent seed 31337, days 106–128 (transcript read in
full, not counted):

- d106: "📺 The cameras were going to call Sofia AGAIN. The producers cut
  it — somebody else gets a turn." → "📺 The cameras want Emma — won 2
  contests." Coherent: the cut line names the cut face, the next line
  names the actual pick with her earned notability note.
- d127: the repel flipped again (star Emma → David, day-126 Emma pull)
  without the line firing (40% roll) — the flip is silent but the cast
  still rotated. Intended.
- Landings rotate and never repeat back-to-back: "Emma was nervous and
  the galaxy fell in love anyway", "Sofia ate the camera and asked for
  seconds", "Emma was MADE for this", "David ate the camera...".
  Shame variant "Oh no. OH NO. The galaxy has that clip FOREVER." lands,
  followed by the intact village-wince line ("They'll be kind about it.
  And they will never, ever let it go.") — the tone contrast reads
  right, not jarring.
- Villager behavior in my area: the village watches (watch beats with
  real choices), cheers, the System files the player under
  *interesting*, winners come home and get visited ("You go to Emma
  after"), gossip seeds. Nobody is robotic — Emma's arc this run (show
  pull → contest wins → more pulls) is earned stardom, not a loop.
- One scheduling observation (pre-existing, not this lever): d126 one
  show, d127 two shows — weekly-budget boundary, contestTick's 2/week
  window resets between days. Documented, not touched.

## Village assessment (plain words)

Villages look like r5's: struggling settlements dying ~day 50–90 to
combat and hunger, TV a rare weather event. Standout after-run
(competent seed 31337, hit the 200d cap): Emma became the village's
star the honest way — contest wins → notability → pulls → more wins —
while Sofia, David, and Marcus rotated through the other pulls. The
village watched her win the Hardened Gauntlet and Beastmaster back to
back, then watched David lose the Alibi Chain quietly. Who thrived:
televised winners and their clubs; who died: everyone eventually,
mostly in fights (combat 204, villager-combat 127, starvation 52).
Missing capabilities, still: national/vest/four-realm never form,
feast surge never arms, traps never set — all documented walls outside
this lever.

## Blanks: filled vs documented

- **Filled:** the r5 blank — repeat-pull rate 0.164→0.109, ≤3d loops
  0.045→0.000; "MADE for this" 1 template → 6, shame 1 → 3.
- **Documented:** contest-side casting still uses raw weights
  (fireContest weightedPick — the same notability concentration exists
  for contest co-stars; future round); `apClubVote` doesn't exist
  (votes = apClubBoon); waves 4–5/national/table/feast/traps walls
  (lever-10 / completion territory).
