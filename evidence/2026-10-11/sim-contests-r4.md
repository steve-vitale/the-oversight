# Long-run sim — LEVER 6 ROUND 4: fan clubs grow with highlights + vote (2026-10-11)

Canon read first: docs/CANON.md, docs/CONTESTS.md ("Fan clubs: audience
segments per lane that send care packages, vote, and grow with highlights";
"the audience can vote small favors"; "Prizes must be worth the fear").
Built on r1 (fresh-face casting), r2 (contest-fear), r3 (adaptation) —
not re-litigated.

## The blank

Two canon promises were dead in practice:

1. **"The audience can vote small favors"** — `apClubBoon` existed (a lane
   at 50+ may vote: +10 health / +300 kcal pantry / +1 unity / wacky curio,
   max 1 per 5 days, announced). Baseline: **0 fires in 16 long runs**
   (600 gate failures). Max lane ever: 17. The gate was unreachable.
2. **"Fan clubs send care packages"** — `apCarePackage` at favor 20+.
   Baseline: 0–1 fires in 16 runs. Also unreachable.
3. **"Grow with highlights"** — nothing implemented it. The Death Reel
   (canon's highlight show) aired and moved no club; wins moved a flat
   +4/+2 regardless of stage.

## Lever played — "make the clubs real" (all numbers exact)

`src/js/alienPlayers.js`:
- **Vote gate 50 → 25** (`apClubBoon`). A genuine hot streak, not a drip.
- **Care-package gate 20 → 12** (`apCarePackage`). A good month of TV.
- **Decay −1/day → −1 per 3 days** (`apDailyTick`). The binding constraint:
  gross showbiz gains were 25–55/run but −1/day erased everything before the
  next show (TV ≈ 0.5/week; a +8 win decayed to zero in 8 days). The crowd
  "forgets slowly" per its own comment — now it does.
- **Celebrity feed lines 50 → 25** (`apFeedMessage`): "Your fan club is
  GROWING" + per-lane banner lines now fire at the vote threshold —
  favorite → celebrity, said out loud.

`src/js/contests.js`:
- **Win favor scales with risk** (`_contestEnd`): player +4/+6/+8
  (low-med/high/extreme), villager +2/+3/+4. Bigger stages, bigger highlights.
- **Death Reel airings grow showbiz +2** (`fireShow`): "📺 The Death Reel ran
  your highlights. Somewhere out there, your showbiz fans are making clips."
- **Contest deaths grow the lane +2** (`_contestDie` player path,
  `_cxKillContestant` villager choke point): "📺 The highlight package is
  already cut. {name/contest} will replay forever — the club will remember."
  The galaxy loves a trainwreck (canon: shame moves favor too). Own lines —
  `apAdjustFavor` only announces |n|≥3, and the global threshold was left
  untouched.

Ontology headers updated; validator green (73/73).

## Proof

**Mechanism** — `scripts/test-contests-clubs-20261011.js`: 18 assertions × 3
seeds, all green. Vote gate: 24 → 0/200 fires, 25 → fires, says "voted".
Package gate: 11 → false, 12 → true. Reel airing → showbiz +2 + clips line.
Win scaling: pit/high player +6 fight, windfall/medium +4 showbiz,
price/extreme +8 social, villager pit +3 fight. Death → lane +2 + highlight
line, roster removal intact.

**Before/after on identical seeds** (8 seeds × competent + riskAware, 200d):

| metric | before | after (final) |
|---|---|---|
| club-boon votes fired | **0 / 0** | **3 / 0** ("voted" lines 0→3) |
| care packages fired | 0 / 1 | **28 / 11** |
| max lane ever (showbiz) | 16 / 17 | **36** / 18 |
| max lane (fight/survival/social) | 4/4/0 | 9/6/1 |
| contests / shows / summons | 53/29/3, 56/25/4 | 49/31/6, 42/25/1 |
| contest deaths | 2 / 1 | 2 / 1 |
| avg days survived | 59.5 / 59.5 | 58.3 / 53.1 |
| win rate | 40/61, 44/76 | 37/58, 35/62 |

Mid-step measurement (gates + growth, before the decay fix): votes still 0,
packages 8/2 — which proved decay, not the gates, was the binding constraint.

The lifecycle is now real: packages for good months (12), votes for great
ones (25 — fired on the two hottest runs: showbiz 36 and 22+). No behavior
regressions: contest/show/summons/death volumes and win rates unchanged
within noise; deaths remain combat/attrition.

**Regressions**: clubs 18/18 ×3; contest-fear 21/21; freshface 24/24;
break-contests 50/50, r12 34/34, r13 23/23, r14 38/38, r15 55/55;
shows-break 81/81; shows-breakit-r15 486/486; r16 22/22; fameseeker 41/41;
contest-adapt 27/27; ontology 73/73.

## Prize census — blank 2 measured (documented, not built)

The task's second question, answered on the after-run (16 runs):

- **True player wins: 26** → every win rolls the prize table. ~70% grant
  alien loot ("The System presses something humming into your hands:
  Wrong bandage, Contract Quill, Starfall bow, Audience token, Phase sling,
  Hardlight knife, Gravity hook, Medfoam canister…"); **~30% "the vault was
  feeling shy"** (8/26 whiffs) — shy sometimes, not most of the time.
- **Villager wins: 46** → winner's share pantry rations, always real.
- **Shows** → wacky curio or the shy line.
- **Ability unlocks / synergy hints / knowledge dumps / item-evolution
  assists as prizes: NEVER.** No code path exists — prizes are
  items/supplies/care-packages only. Documented as the remaining blank:
  the ability unlock ladder is lever-9 territory, and inventing new prize
  types here would be new mechanics, not this lever.
- Noted: "Can labeled BEANS" (350 kcal food) granted as a contest prize 3× —
  the never-dinner rule covers fan curio paths, but the contest prize table
  rolls the general alien loot table. Loot-economy territory; not changed.

## Reachability verdict

- All 8 contest categories fired (blood 22, detective 16, chance 12, moot 12,
  forage 10, endurance 7, puzzle 6, weird 6).
- 22 show types aired, incl. all six canon shows (why_eat 0/55 — within
  chance for a ~30-show pool, p≈16%, not decoration).
- Ratings summons: 7. Fan care packages: 39. Wave 2 reached in 13/16 runs.
- **Win-flag path for contests**: the Beloved table path reads
  `fanFavor()` = sum of the four club lanes ("No audience — the show isn't
  watching and no fan club carries your name"; strength += min(20, ff)) —
  clubs now price the path. The full arcs→national→table chain is not
  reachable in ~55-day sim horizons (lever-10 territory).

## Sense-testing (Steve 2026-10-11 law) — new copy reads

- "📺 The Death Reel ran your highlights. Somewhere out there, your showbiz
  fans are making clips." — the club visibly grows from being watched.
- "📺 The highlight package is already cut. The Price will replay this
  forever — the club will remember." (player death) / "…Marcus will replay
  forever — the club will remember." (villager death) — dark, coherent,
  honest about the audience being ghoulish.
- "📈 your fight fans +4 — David won The Blood Tithe on camera (favor: 4)"
  — the scaled win announces; bigger stage, bigger number, same voice.
- Villager TV behavior (seed 7): fresh-face pull → "The cameras want a new
  face. Lena — the galaxy is about to learn your name." → watch party →
  "You cheer until your throat hurts. Lena hears it" → dual landing
  ("Lena was MADE for this… comes home with fans" + "It went… badly…
  comes home with shame — and, somehow, fans anyway") → "The village
  winces on their behalf. They'll be kind about it. And they will never,
  ever let it go." → "The village will talk about this for days." Coherent:
  debut → support → mixed fate → gossip. Villagers act like people.
- Sense issue (pre-existing, not this lever): identical "MADE for this"
  outcome lines repeat when the same villager is pulled two days running
  (David d58/d59, Moshe d32/d33) — show outcome variety, documented.

## Village assessment (plain words)

The villages looked like before — struggling settlements, most gone by
day 50–70 to combat and hunger, TV a rare weather event — except now the
audience is a real presence in the good runs. Seed 8675309's village had a
genuine celebrity arc: a hot streak of televised wins pushed the showbiz
club to 36, the feed announced "Your fan club is GROWING," care packages
started dropping from the sky every few days, and twice the club VOTED —
once for trail rations, once for a curio. The village ate voted rations.
Seed 7's village watched the Price take their player on camera, and the
highlight package line landed the same day as the funeral gossip — the
Death Reel will run it forever, and now the club remembers too. Who
thrived: villages with televised winners — the club economy rewards being
watched, which is exactly the show's deal. Who's still missing: the social
lane (max 1) — moot wins are rare in sims, so the moot crowd never gets
loud. That's a casting-density observation for a future lever, not a bug.

## Files

- src/js/alienPlayers.js — vote gate 50→25, package gate 20→12, decay
  −1/day→−1/3d, celebrity feed lines 50→25, ontology rules
- src/js/contests.js — risk-scaled win favor, reel highlight growth, death
  highlight package (both paths), ontology rules
- docs/ONTOLOGY.md — regenerated by validator
- scripts/sweep-contests-r4.js — prize + club census sweep (hooks:
  rollAlienLoot/alienLootGrant, apClubBoon/apCarePackage/apAdjustFavor,
  contest/show outcomes, tele events)
- scripts/test-contests-clubs-20261011.js — 18 assertions × 3 seeds
- evidence/2026-10-11/sim-contests-r4.md — this file

[needs-eyes]: new on-screen TV copy (reel/death highlight lines, scaled favor
announcements) — Steve should see the club lifecycle on his phone.
