# Long-run sim — LEVER 6: contests & shows (2026-10-11)

Canon read first: docs/CANON.md, docs/CONTESTS.md. Built on break-it shows
r15/r16 (dip re-summon, dead summons commentary, undisclosed show costs —
all fixed there, not re-litigated).

## Baseline (before) — 8 seeds × competent + 8 × leader, 200-day horizon

scripts/sweep-contests-lever.js on current HEAD. Competent = skill-ceiling
policy; leader = idle.leader variant.

| metric (competent, n=8) | before |
|---|---|
| avg days survived | 81.3 (1/8 reached 200) |
| contests / shows / summons per run | 3.9 / 1.9 / 0.5 |
| first contest day / first show day | 17 / 20 (canon 14–21 ✓) |
| contest categories (31 total) | chance 7, puzzle 5, detective 5, moot 4, forage 3, weird 3, endurance 3, **blood 1** |
| show cast | player 13/15 (87%), together 2, **villager 0/15** |
| show "why" | star 12, debut 1, milestone 1, no-cast 1 |
| contest outcomes (choice-0 play) | won 28, lost 1, **deaths 0** |
| TV weeks: at 2/week cap / zero-TV | 15 / 51 of ~77 post-embargo weeks |

Leader policy: died ~day 24 every seed (village-lost) — a policy artifact on
current master (not the lever's business), consistent enough to be useless as
a TV variant; kept for the record, competent is the comparison.

**The gate census** (scripts/diag-contest-gates.js, 4 seeds, 208 post-embargo
dawns): the 2/week budget is NOT the binding constraint — budget-exhausted
killed only 10% of dawns. The killer is **no-eligible: 123/208 dawns (59%)** —
mean eligibleN 0.41. The castable pool is empty because the competent policy
keeps villagers on expeditions ("away from Haven") and the player is off the
board by day 30 in 5/8 runs (exiled or mantle-passed — the eligibility panel
says "exiled — cut off from the village").
Effective TV density: **~0.54 events/week vs the 2/week canon ceiling**.

## Lever played: show cast breadth — the fresh-face path

**The blank:** docs/CONTESTS.md says "Shows are also how the audience meets
non-fighters: the gossip lane has its own celebrities." Baseline: **0 villager
pulls in 16 long runs** — the gossip lane's celebrities never got on screen.
Mechanism: showCastPull required notability (w>1) to be pulled, and notability
required being pulled (addNotability(pid,'showmanship') fires at fireShow).
Chicken-and-egg; the player took 13/15 pulls.

**The change** (src/js/contests.js, showCastPull + fireShow — one lever, small,
exact numbers):
- Once someone is notable (the debut stays the player's — "The cameras don't
  know these people yet. They know YOU"), **30% of non-whim show pulls** go to
  a never-pulled castable villager: "📺 The cameras want a new face. {name} —
  the galaxy is about to learn your name." Announced, legible — the show-side
  cousin of the contest whim (which keeps its pinned 10% priority first,
  break-it shows H3).
- Pulled villagers are tracked in `village._showPulled`; they earn showmanship
  (existing addNotability at fireShow) and enter the notability race for real.
- Ontology header updated (show_fresh_face rule); validator green.

## Proof

**Mechanism** — scripts/test-contests-freshface-20261011.js: 24 assertions × 3
seeds, all green. Highlights: fresh-face share 118/400 = **29.5%** (30%
target); first-ever pull is still the player debut; no fresh picks once every
villager is pulled; rigged fresh pull announces, ledgers, and builds a playable
villager modal that resolves to fans/shame + village gossip + showmanship.

**Before/after on identical seeds** (same 8 competent seeds, 200d):

| metric | before | after (final code) |
|---|---|---|
| villager show pulls | **0/15 (0%)** | **3/15 (20%)** |
| show cast (player/villager/together) | 13/0/2 | 10/3/2 |
| show "why" fresh | 0 | 3 |
| contests/shows/summons per run | 3.9/1.9/0.5 | 3.0/1.9/0.5 |
| first contest/show day | 17/20 | 17/20 |

(Earlier after-run with fresh-before-whim ordering: 8/24 villager pulls,
33%. The 20% vs 30% gap in the final run is small-sample noise — TV is rare,
~15 pulls total; the mechanism test's 29.5% over 400 draws is the clean causal
number.)

All 3 fresh pulls resolved through _showVillagerEnd (distinct villagers per
run: How to Human ×2, The Complaint Box).

**Regressions:** test-shows-break-20261010 81/81, test-break-contests-20261010
50/50, test-fameseeker-20261010 41/41, test-shows-breakit-r16 22/22,
test-shows-breakit-r15 486/486 (1 seed), ontology 63/63.

## Reachability verdict

- **Contests fire by day 14–21** ✓ (first contest 17 avg, several runs day 14
  exactly — the embargo lifts and the System announces immediately).
- **All six canon show types exist in the 30-show pool**; why_eat, ask_human,
  death_reel, break_room, moot_show fired across runs. mouth_race fired 0/39
  pulls — within chance for a uniform 30-show pool (p≈27%), not decoration.
- **Ratings summons fire** (4/16 runs before, 4/16 after) when the dip gate
  arms; the three played choices resolve honestly ("The fans aren't organized
  enough yet — no care package this time. The stunt still counted").
- **Fan clubs**: favor lanes accrue (showbiz hit 11 in one run) and fan care
  packages arrive ("A viewer sent this. A FAN. We checked. It is not
  dinner."), but favor decays — the lifecycle works, never a ratchet.
- **Notability qualifying below the rank cut**: superseded — casting is
  notability-weighted per CONTESTS.md, and the player-first/weighted-villager
  rule holds. The whim fires announced ("The System's whim: You are
  *interesting*").
- **Blood contests**: 1/31 baseline, 1/24 after. The feared category is ~3–4%
  of contests in wave-1 sims — wave-gating (extreme-risk + gauntlet/siege
  excluded below wave 2/3) explains it. Reachable, rare early. Not changed
  (different lever).

## Sense-testing (Steve 2026-10-11 law) — transcript reads

Read 30–60 TV lines from 3 runs (seeds 999983, 777001 baseline; 999983 after).
The dread arc is HONEST — announcement names the grab, the countdown is
visible, the village reacts in ambient dread:

- d17 "📺 You have been chosen. The village holds its breath."
- d17 "📺 The grab comes at dawn. One more day. Sleep if you can."
- d18 "📺 It is today. You dreamed about the cameras. Everyone did. The village is very quiet."

Contests are played, wacky, consequential — the Auction's bids cost real
memory ("You bid the summer afternoon — the whole thing... You remember
remembering it. The shape is gone." / "The tech is extraordinary. You are...
less. But the village eats this winter."). The Secret Deck airs village
secrets with real social cost ("First card: someone in the village has been
lying about their age. The cameras find them. They smile like it's fine. It
is not fine." / "You win. Three secrets aired to the galaxy. The prize is
real. So is the silence at dinner."). Show aftermath becomes legend ("The
silent day enters village legend. Mimes are attempted at dinner for weeks.
All of them worse than yours.").

**New-behavior sense check (after):** "📺 The cameras want a new face. Emma —
the galaxy is about to learn your name." then the watch beat ("You cheer
until your throat hurts. Emma hears it — everyone hears it.") then the dual
landing ("Emma was MADE for this... Emma comes home with fans" + "It went...
badly... Emma comes home with shame — and, somehow, fans anyway. The galaxy
loves a trainwreck.") then "The village will talk about this for days."
Coherent: debut → support → mixed fate → gossip. The 'both' outcome reads
fine.

**Sense issues found (documented, not all fixed):**
1. **Hardened variant replays identical beats** (d36–37: the Hardened Auction's
   played text is byte-identical to the first Auction — "The rules have
   changed" is announced but the beats don't change). Copy-only hardening.
   Documented for a future copy pass; not my lever.
2. **No villager countdown reactions** — canon says "people avoid the
   eligible, or cling to them." Nothing implements it; the dread is ambient
   ("holds its breath") only. Documented — that's lever 3 (villager agency)
   territory, not a from-scratch build here.
3. **Contest win rate 96%+ with choice-0 play, zero contest deaths in 32
   runs** — "Death is on the table" never landed in the sims. Partially a
   policy artifact (choice 0 avoids the deadly paths; blood fired twice
   total), partially the blood rarity above. Documented for the combat/death
   lever (lever 1), not changed here.

## Village assessment (plain words)

The villages looked like struggling early settlements: food pressure real,
expeditions constant, the player frequently off the board by day 30 (exiled
or mantle-passed). Deaths were combat and attrition, never contests. The show was a rare weather event (~0.5/week):
when it came, the village held its breath for real. Who thrived: the player
— every lane's star, which was the problem. Who was missing: everyone else —
villagers had no screen presence, no fans, no shame, no celebrity. After the
lever, four villagers got their debut (Emma, Lena, David, Marcus across
runs) and came home with fans or shame or both, and the village gossiped
about them for days. The blank is filled: the gossip lane has its first
celebrities.

## Files

- src/js/contests.js — fresh-face cast path + announcement + _showPulled
  ledger + ontology rule (1 file changed)
- scripts/sweep-contests-lever.js — long-run measurement sweep (hooks +
  transcript capture + gate diagnostics)
- scripts/diag-contest-gates.js — pre-dawn gate census
- scripts/test-contests-freshface-20261011.js — 24 assertions × 3 seeds
