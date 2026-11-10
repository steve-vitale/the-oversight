# Journey r128 — establishment, leg 1 (days 14–40) — RUN NOTE

- Run: `oversight-playtest-loop`, Lane A, run r128, run_id `playtest-loop-a-20261110T2045Z`
- Rotation read `1` (establishment); write `2` (deepening next) at closeout
- Branch `journey-establishment`, base local master `febe01d6b` (sim-counterclose-a GO + evidence)
- Seeds (fresh band): 2201–2216. Policy: competent + HUNTSTAFF=2. Horizon 42 days.
- Prereg: `evidence/2026-11-10/journey-establishment-r128-prereg.md` (§14 bars bind; no mid-run re-scoring)
- Analysis: `evidence/2026-11-10/journey-establishment-r128-analysis.txt`
- Pre-flight deviations (LOUD, standing state): `git pull --ff-only` FAILED —
  local master diverged from origin/master (ahead 472, behind 156; same
  standing state as r120–r123/r127/r167; ship loop owns reconciliation). Proceeded
  on local master. Main tree clean; disk 32%.
- Lock: created 20:46:34Z, run_id `2026-11-10T20:46:34Z`. Heartbeat loop
  `/tmp/hbloop-r128.sh` (every 10 min); registration took ~3 min (slow
  checkout, no flap).
- **Write flap (LOUD, infrastructure):** an EPERM flap struck mid-run
  (~21:42–22:23Z, ~40 min): O_EXCL file creation refused
  filesystem-wide; a `/tmp` concat failed twice and the pre-write probe
  (`git update-ref refs/heads/probe-r128 HEAD`) failed at 21:46Z. Per the
  flap skill I stopped writing, kept the heartbeat fresh, and waited on a
  60s-probe watcher — flap cleared 22:23:33Z after 38 probes; re-probe
  OK 22:23:57Z. No work lost: panels, analyzer and proof test all
  completed before the flap; the gate log wrote cleanly after it cleared.
  A leftover `zz-probe-1.lock` (sibling's probe) was seen in the main
  `.git/refs/heads/` during cleanup and left untouched.

## The leg's question

r127 judged the flat halving dial NO-GO (moves 6/16 — it braked the
marginal movers as hard as the racers) and named the next dial: **halve
only above the first 5 XP — the first rung at full rate**. This run IS
that dial: `grantFoodXpCredit` credits the first 5 XP of a task 1:1,
then 1 XP per 2 units above it, the odd unit carried on the person
record (`foodXpRemainder`), so no work is ever lost. askSpecialist (+1)
and the rung (5/15/30) unchanged; no gate/price/threshold change.
Second question: do the invitation and null-line standings hold on a
fresh band?

## Verdicts

| Check | Bar | Measured | Verdict |
|---|---|---|---|
| Q1 pace (moves) | ≥8/16 seeds | **11/16** | **GO** |
| Q1 pace (pace03) | ≤4/16 | **3** | **GO** |
| Q1 before-validity | BEFORE pace03 ≥3 (revised per r127) | **BEFORE pace03 = 9** | **VALID** |
| Q2(a) game offer | accept+decline on every invite menu | **22/22 menus** | PASS |
| Q2(b) driver answer | ≥80% answered | **22/22 = 100%** (20 accept, 2 decline) | PASS |
| Q3 null THEM lines | 0 | **0** | PASS (holds) |
| M3 villages surviving to day 42 | ≥12/16 | **16/16** | pass |
| M4 villages with no starvation death | ≥12/16 | **15/16** | pass |

**Q1 GO — dial (a) lands.** The dial keeps the marginal movers AND
removes most racers: moves 11/16 (r127's flat halving: 6/16), pace03
9 → 3, food XP total 759 → 470 (preserver 676 → 399, butcher 83 → 71).
BEFORE-validity is met with room: the regression reproduced at 9 racers
on this band, stronger than r127's 3. The three AFTER racers are all
preserver, all just over the 30 rung (33–36 XP): Aaliyah (2204, 36 XP),
Greivis (2205, 33 XP), Linda (2210, 33 XP). The fix ships.

The moves (11 seeds): Yevgenia 2201 preserver 0→2 (27 XP); Brooklyn
2203 preserver 0→1 (6) + Ethan butcher 0→1 (7); Aaliyah 2204 butcher
0→2 (15) + preserver 0→3 (36) + Leo butcher 0→1 (5); Greivis 2205
preserver 0→3 (33); Asher 2208 preserver 0→2 (15) + Tariq preserver
0→1 (13); Giuseppe 2209 preserver 0→2 (23); Linda 2210 butcher 0→1
(5) + preserver 0→3 (33); Norman 2212 preserver 0→1 (10); Ricardo
2213 butcher 0→1 (7) + Alejandro preserver 0→2 (18) + Tumelo
preserver 0→1 (13); Dwayne 2214 preserver 0→2 (19) + Seymour
preserver 0→2 (24); Ruby 2216 preserver 0→2 (21). Non-moving seeds:
2202, 2206, 2207, 2211, 2215. Moves by window (AFTER): d1–d14 5 seeds,
d14–d28 10, d28–dEnd 1 (2212) — the race is still usually decided by
day 28. Every move is still preserver or butcher; cook, spotter and
builder move nowhere (foodXp totals preserver 399 / butcher 71 /
rest 0) — the known gap: the ladder still moves only through
preserving and butchering.

**Q2 PASS.** The game offers accept + decline on every invitation-owned
menu (22/22); the driver answered 22/22 = 100% (20 accept, 2 decline).
Spoken invite lines 14; the other 8 answers came from pending-at-start
menus with no spoken line — the denominator fix keeps paying. The two
declines are the rule working as designed: Dale (2202), trust 8, and
Zoltan (2207), trust 21 — both "Not this time." / "Another time, then.
A small thing, pocketed." The lowest accepted trust is 49 (Amina,
2209, Emberhold link carried on the accept).
**Q3 PASS.** 0 null THEM lines; navTurns 0. The r116 fix holds on the
full panel.
**M3/M4 PASS.** All 16 villages alive at dEnd (8–12 people); 15/16 with
zero starvation deaths — the single starvation death is on 2214 AFTER
only (BEFORE 0; deaths 97 → 91 overall, pantry 70,450 → 87,630), a
diverged-trajectory flip, not a dial effect (see below).

## Diverged trajectories (not dial defects)

Two seeds diverge enough that BEFORE/AFTER is not a clean pair:
- **2205 (Greivis racer, confounded).** BEFORE foodXpEnd=5, no moves,
  10 alive, 30 deaths; AFTER foodXpEnd=38, Greivis races preserver
  0→3 (33 XP), 11 alive, 29 deaths. The dial cannot remove a racer
  that only exists on the AFTER trajectory: one extra villager alive
  on AFTER did the preserving BEFORE never had. Same class as r127's
  Ornella — reported, not scored.
- **2213 (pantry doubling).** BEFORE 8 alive, 79 deaths, pantry
  47,623; AFTER 10 alive, 76 deaths, pantry 97,557. The dial's XP
  change propagates through skill-gated preserve yields and survival,
  so the panels diverge downstream. It drives most of the panel pantry
  delta (+49,934 of the +53,956 total). The verdict bars are
  trajectory-robust (moves/pace03 count movers, not kcal), and the
  panel-level survival/pantry means barely move (deaths 49.4 → 48.5,
  popAlive 10.1 → 10.4, pantry 59,905 → 63,277 per seed).

## Village assessment (plain words)

Sixteen villages, all alive at day 42–43, 8–12 people each. The food
work is happening at scale: 94 hunt kills, 252 rack resolutions
granting preserver XP, pantries from 6,250 kcal (2203, the leanest) to
110,704 (2205, the fullest). Everyone reached wave 3 of the monsters;
11 of 16 reached wave 4. The villages that hunt hardest eat best —
2205 ends with 110,704 kcal, while 2203 ends lean at 6,250 — but even
the lean village survives with 10 people alive and no starvation
death. The ladder moves on 11 of 16 villages and only through
preserving and butchering. The quiet villages this time are 2207 (5
foodXp total on AFTER) and 2215 (7 foodXp total). Nobody starved
except one villager on 2214. The dial's footprint is visible in the
totals (food XP 759 → 470) but invisible in the villages' fortunes:
pantries, survival and waves are unchanged between panels — the brake
slows who becomes a specialist, not whether the village eats.

## People check (all 64 held convos read in full)

The conversations read like people, and the invitations keep paying off
— accepts lead somewhere real: Felipe (2210) presses a kept tool into
your hand; Pablo, Erich, Ricardo and Kevin (2211/2209/2213/2215) share
a stockpile (+4 wood, +4 fiber to the village stash); Tumelo (2213)
digs up a buried food bundle (+920 kcal); James (2203) teaches
slope-reading for water; Duc (2212) teaches the player Food
Preservation itself; link proposals are carried (Aaliyah → Stonebridge,
2204; Amina → Emberhold, 2209, accepted; Scott → Thornfield, 2210;
Asher/Eabha → Emberhold/Stonebridge); party namings are picked twice
(MEAT AND FRIENDS ×2, APEX SNACKS ×1) with roles picked after them;
Erich (2209) proposes a bond on his own ("we should be bonded. Not
just neighbors."). The no-shared-language threads stay the strongest on
the panel — 4 villagers (Filipp 2202 Russian, Greivis 2205 Spanish,
Tariq 2208 Hindi, Berhane 2210 Amharic), all winding down cleanly,
including two speak-back beats (Filipp, Berhane). The Devon thread
lives across a seed: Pablo and Minh (2211) both warn "Watch yourself
around Devon" word-for-word, and Amara adds "Something's off with
Devon" in her own words. Stalls: 2 (Gearoid 2208, Seymour 2214 — both
"(no pick)" into a stall menu, both still close with a line).
Accept-then-bail "fire's got me": 0×. Water-haul "3 liters": 0×.

Defects and watches, all read in full (counts grep-verified across the
16 AFTER convo files):
1. **Grant-rate dial (a) judged GO** — see Q1. The fix lands.
2. **Taken-kin template still repeats, tail first.** The pod-dream
   closing sentence appears in 12 of 64 convos in three fixed wordings —
   "Some nights I swear I hear them before I sleep -- the pods, rows
   deep, humming. Then morning comes and I can't say whether it was
   real." (7×: Siobhan, Gertrude, Scott, Felipe, Alejandro,
   Nomthandazo, Virgínia), "Some nights I dream about the pods --
   rows of them, humming. I wake up and I can't tell if it was a
   dream or a broadcast." (2×: Eli, Mabel), and "Row on row of them,
   humming like a held note -- and I wake up reaching for something
   that isn't there." (3×: Regina, Eabha, Dwayne) — the third wording
   is a variant, not the template, but it is itself fixed. The
   openings keep varying well, and the "eighty-one years old and they
   called her boring. Eighty-one years." beat repeats 3× (Regina's
   Halyna, Gertrude's Siobhan, Alejandro's Esther) with "Boring. That
   is what they wrote down." (Scott) and "She laughed like a screen
   door in a windstorm. Boring. Right." 2× (Dwayne's aunt Rachel AND
   Mabel's aunt Rachel — same kin name, same line, two villagers).
3. **"Something in them almost softens — then doesn't. Not yet."** 5×
   (r127: 9×) — down.
4. **Deflect pivot** "Sorry — I shouldn't load that on you. What's up?"
   4× (r127: 9×) — down. "They hear the warmth in it. They're not
   ready to let it in." is the new holder of that class at 9×.
5. **The favour-requirements line still reads like a system
   instruction**: "Move next to them, on the same side of the Haven
   door, to help." 9× (r127: 7×) — up, still the worst repeater. The
   variants read better ("Your partner is inside the Haven hall. Go
   through the door to meet them." — Yevgenia; "Move next to your
   partner, on the same side of the Haven door." — Michelle, Everett)
   and the favour-aware variants are genuinely good ("Finish the
   current event before foraging together." — Marcus; "You need
   edible, unspoiled food in your pack." — Javier; the away-from-Haven
   road variant — Michelle, Marcus), but the Haven-door phrasing is
   the one that repeats.
6. **Trust answer down to 1×** (r127: 4×). "I'll tell you what I tell
   everyone: watch what I do when nobody's watching..." (Aaliyah
   only). Its neighbour "That's the right answer. The wrong one
   would've been 'yes' too fast." also 1×. "We're all doing math that
   doesn't add up. You're still here. That counts." 1× (r127: 2×).
7. **The System suggests the same party names.** "MEAT AND FRIENDS"
   is the System's suggestion 2× (Gabriel, Rosa) and gets picked both
   times; "APEX SNACKS" 1× (James). FINAL GIRLS CLUB: 0 mentions this
   panel (r127: 19). The pool rotated, not widened — 2 System
   suggestions seen. The driver always picks index 0, so this is
   partly a driver artifact — but the pool itself repeats.
8. **NEW — the quiet-place walk outcome repeats.** "Don't tell the
   others. Everyone needs one place." 6× (Yevgenia, Marthe, Giuseppe,
   Amina, Scott, +1) on the accept-walk outcome; the stockpile outcome
   "Take half. You've got the hands for it." (+4 wood, +4 fiber) 4×;
   the cache walk "Nothing much there — but they talk the whole way,
   and you learn the shape of them a little better." 3×; "It's quiet
   at the [tree line/hollow/trap line]. [Name] doesn't say much.
   Sometimes that's the whole point." 3×. Same class as (2): one good
   outcome line, no per-villager variation.
9. **NEW — the night thread repeats as a cluster.** "Did you sleep? I
   kept hearing things out past the treeline." + "They go still. 'So
   it's not just me. Good. That's... good to know. Bad, but good.'"
   + "I sleep in shifts now — two hours, up, listen, two more."
   fires as a fixed trio on Marisol, Michelle, Asher (sleep-shifts
   3×; the night question + go-still beats 4× with Caleb). "Shock's
   underrated. It's the body's way of buying you time." 4× (Regina,
   Daniyar, Kevin +1); "Spite, mostly. Pure, clean spite at the sky."
   2×; "Good. Anger's fuel. ... Anger's a fire — useful if you cook
   with it..." 2× (Asher, Eabha); "Columbus, Ohio, always. Same
   dream: I'm walking home and the street keeps getting longer." 2×
   (Alejandra, Lena); "Have you ever hurt someone? Since all this
   started." + "I don't keep score on that." 2× (Erich, Ricardo).
10. **NEW — "1 liters" grammar.** "The cistern's nearly dry — 1 liters
    left." 2× (Erich, Yevgenia, both 2201). The cistern amount does
    not pluralize: 1 liter, not 1 liters. Small, fixable.
11. **Gossip repeats verbatim.** "Watch yourself around Devon. I can't
    tell you why. Just... watch." told word-for-word by two villagers
    on one seed (Pablo and Minh, 2211). Watch item, same class as (2).
    (The stray-dog gossip varies its name: Ethan on 2208, Omar on
    2215 — the template with a slot, which reads fine.)
12. **preserve_food, carried.** HELD-UNUSED, 37 holders, 0 uses — the
    skill's own villager-side read site remains the open gap (r114–
    r128). Same class: the panel's specialist moves are all
    preserver/butcher, yet preserve_food itself still has no job a
    villager can do on their own. Held/notheld kcal ratio 2.11 (62
    held kills, 148,718 kcal vs 32 notheld, 70,364 kcal) — holders
    hunt more, but the skill itself is never the tool. (Player-side
    teaching works: Duc teaches the player preserve_food via
    skill_learn on 2212.)

## Reachable / fun / winnable

- **Reachable: yes.** The ladder moves on 11 of 16 fresh villages
  inside the leg, racks fire 252 times, food gets stored, wave 3–4
  reached. Everything this leg is about is reached by a competent
  player.
- **Fun: yes, same shape as r127.** The invitations keep getting
  answered and the answers lead somewhere — walks with real outcomes,
  lessons, link proposals, party namings, a villager-initiated bond.
  The villages read like people, and the leg's stakes — food, water,
  the wild — are live in every conversation. The remaining fun gaps
  are the repeated lines (taken-kin pod sentence, softens beat,
  deflect pivot, Haven-door line, and now the quiet-place walk, the
  stockpile line, and the night-thread cluster) — the same carried
  items, now measured on a fresh band with exact counts.
- **Winnable: unchanged by this leg, with the same flag as r127.**
  Establishment is not the binding link (scale r112: the veteran wall
  and the trade-route wall). The dial matters for the standing path:
  the Standing ladder's Craft track mints from the same practice
  credit, and dial (a) keeps the marginal movers moving (11/16) where
  the flat halving stalled them (6/16) — the standing path keeps its
  feed.

## Metric review

- **The revised BEFORE-validity bar (≥3) worked as designed.** This
  band reproduced the regression at 9 racers, so the revision was
  never load-bearing here — but it would have saved r127's run from
  UNTESTED, and the bar now reads as the strength a band actually
  reproduces at. Keep ≥3.
- **The dial bites exactly where intended.** Above-rung racers fall
  9 → 3 while marginal moves rise 8 → 11 vs the flat halving (r127:
  6/16). The three remaining racers sit just over the rung (33–36
  XP) — the dial's 2:1 above the rung is a brake, not a wall, and the
  heaviest workers still cross 30. If a future run wants pace03 at
  0–1, the next dial is a steeper above-rung rate (3:1) or a per-day
  cap — not a lower rung (the rung is the ladder's contract).
- **The 2205 Greivis case bounds what the dial can promise.** A racer
  that exists only on the AFTER trajectory (diverged survival) is
  outside the dial's reach by construction. Panel verdicts should
  keep reporting diverged seeds separately rather than folding them
  into the pace count.
- **Q2 denominator fix verified again in production.** 8 of the 22
  answers came from pending-at-start menus with no spoken line; the
  old spoken-lines-only count would have read offered=14,
  answered=22. The fix is confirmed working on a second fresh band.
- **Q1's window shape holds.** Moves land mostly d14–d28 (10 seeds),
  then d1–d14 (5), then d28–dEnd (1). The race is usually decided by
  day 28 — any dial has to bite early, not just at the top (r118's
  sharpest cases already said this; this band confirms it again).
- **M4's starvation death is a diverged-trajectory flip.** 2214 AFTER
  has 1 starvation death where BEFORE had 0, while overall deaths
  fall 97 → 91 and pantry rises. One death on a 90-death seed is
  noise-level; the bar passes 15/16. No dial reading follows from it.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/establishment.json
--current 'evidence/2026-11-10/journey-establishment-r128-before-seed*.json'
--metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
against the OLD r108 baseline fired 3 LOUD lines, all EXPLAINED (same
class r127 named): guardrails.deaths 123 → 790, popAlive 33 → 161,
pantryKcal 101205 → 958478 — the tool SUMS across files and the old
baseline is a 4-seed gate-off control vs this 16-seed HUNTSTAFF=2
panel: pure n-mismatch + regime change. Per-seed means: deaths 30.75 →
49.4, popAlive 8.25 → 10.1, pantry 25,301 → 59,905 — the HUNTSTAFF=2
regime, not a new deviation (r127's per-seed means were 42.9 / 10.0 /
68,186; this band runs hotter on deaths, within band noise).
c3.starvationDeaths did NOT fire LOUD (baseline 0, current 0).
**Baseline re-seeded (the r127 owed item, done here):** the old r108
baseline is preserved as
`telemetry-baselines/establishment.json.20261110-pre-r128.bak` and the
live baseline now carries the r128 BEFORE panel sums (deaths 790,
popAlive 161, pantryKcal 958478, starvationDeaths 0; 16 seeds 2201–
2216, competent + HUNTSTAFF=2, 42d, base febe01d6b), with the
`_instrument` label updated to the r128 re-seed. A follow-up
telemetry-check of the AFTER panel against the new baseline is QUIET
(16 files, 4 metrics, no large deviations): deaths 790 → 776,
popAlive 161 → 167, pantryKcal 958478 → 1012434, starvationDeaths
0 → 1 — all inside the tool's tolerance; the 2214 diverged starvation
death is adjudicated above.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
in worktree: **294 passed, 6 failed** (706s, exit 1, zero timeouts).
The failing suites are byte-identical to r127's gate on its base —
measurement-workflow 1, mobile combat cadence 2, occupation panels 1,
Phone frame proof 3 — all pre-existing on master (the identical 294/6
was verified on pristine master by journey-succession r170 the same
morning and adjudicated GO there; this base adds only the counterclose
landing since r127, which introduced no new gate failure). **No
lever-attributable failure. Gate adjudicated GO.** Log
`evidence/2026-11-10/journey-establishment-r128-gate.log`.

## Proof test

`scripts/test-journey-establishment-r128-grant-rate.js` — **48 passed,
0 failed (~62s)** on the fixed tree: source checks (helper with
first-rung headroom + 2:1 above, both sites call it, old grants gone,
askSpecialist +1, rung 5/15/30, driver fallback); live helper (1 unit
at 0 XP → 1 XP; 5 units → 5 XP; 1 unit at 5 XP → +0 carry 1; next
unit → +1; 5 units at 6 XP → +2 carry 1; butcher crosses the rung the
same way; 0/negative → 0, no write; null safe); live rung through
helper (5 units → 5 XP → skill 1; 25 → 15 XP → 2; 55 → 30 XP → 3;
fisherman holder 5 units → 5 XP → skill 3); live event proofs on real
duty resolutions (below the rung: 1 batch → +1 XP, 2 → +2, 5 → +5;
above the rung with XP pinned at 5: 1 batch → +0 carry 1, 2 → +1,
5 → +2 carry 1; below the rung: 1st hunt kill → +1, 2nd → +2; above
the rung: 1st kill → +0 carry 1, 2nd → +1; failed stalk → +0);
analyzer synthetic corpora (Q1 GO at 8/16 + pace03 1; NO-GO at
pace03 5; Q2 denominator PASS at 2/2 incl. pending-at-start answer,
FAIL at 1/2 with a silence; Q3 null-line FAIL case); det-gate (r128
driver vs r127 driver, 5d seed 2201, HUNTSTAFF=2: funnel keys AND
practice snapshots identical).

## Regression check

`node scripts/check.js --quick` in worktree: 294 passed, 6 failed, all 6
pre-existing on master (see Gate — log
`evidence/2026-11-10/journey-establishment-r128-gate.log`). The relevant
suites are the new proof test (48/48) and the analyzer (full panel,
both drivers).

## Files

- Prereg: `evidence/2026-11-10/journey-establishment-r128-prereg.md`
- Driver: `scripts/journey-establishment-r128-20261110.js` (r127 clone,
  tag rename + seed band)
- Analyzer: `scripts/analyze-journey-establishment-r128-20261110.py`
  (r127 clone: 16 seeds; hunt-kills fix + invite denominator fix kept;
  one sed bug found and fixed in-run: seed range `range(2201, 2117)`
  → `range(2201, 2217)`)
- Proof test: `scripts/test-journey-establishment-r128-grant-rate.js`
  (new; 48/48)
- Panels: `evidence/2026-11-10/journey-establishment-r128-before-seed{2201..2216}.json`
  + `-convo-seed{2201..2216}.txt` and
  `evidence/2026-11-10/journey-establishment-r128-after-seed{2201..2216}.json`
  + `-convo-seed{2201..2216}.txt`
- Analysis: `evidence/2026-11-10/journey-establishment-r128-analysis.txt`
- Gate log: `evidence/2026-11-10/journey-establishment-r128-gate.log`
  (294 passed, 6 failed — all pre-existing on master)
- Telemetry baseline re-seeded:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/establishment.json`
  (old r108 baseline preserved as `establishment.json.20261110-pre-r128.bak`)

## Next leg

Deepening (rotation 1→2). Open items carried forward:
- **Next grant-rate dial, if wanted:** the three remaining racers sit
  just over the rung (33–36 XP); a steeper above-rung rate (3:1) or a
  per-day cap would push pace03 toward 0–1. Not required by any bar —
  Q1 passed with room (11/16, pace03 3).
- preserve_food still has no villager-side job — the leg that gives the
  skill a job owns it.
- **NEW small fix:** "1 liters" pluralization in the cistern line
  (2× on 2201) — one-line fix, unowned.
- The carried repetition items, now with exact counts on a fresh band:
  taken-kin pod sentence (12× in three wordings), "eighty-one...
  boring" beat (3×), aunt-Rachel screen-door (2×, same kin name),
  softens beat (5×), "They hear the warmth in it" (9×), deflect pivot
  (4×), Haven-door favour line (9×), trust answer (1×), System
  party-name pool (MEAT AND FRIENDS suggested 2×, APEX SNACKS 1×),
  quiet-place walk outcome (6×), stockpile outcome (4×),
  night-thread cluster (4×), gossip verbatim repeat (Devon, 2211).
