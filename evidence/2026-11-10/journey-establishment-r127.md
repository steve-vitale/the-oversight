# Journey r127 — establishment, leg 1 (days 14–40) — RUN NOTE

- Run: `oversight-playtest-loop`, Lane A, run r127, run_id `playtest-loop-a-20261110T1145Z`
- Rotation read `1` (establishment); write `2` (deepening next) at closeout
- Branch `journey-establishment`, base local master `5db4f6fef` (sim-answermail-a ADOPT + LAND)
- Seeds (fresh band): 2101–2116. Policy: competent + HUNTSTAFF=2. Horizon 42 days.
- Prereg: `evidence/2026-11-10/journey-establishment-r127-prereg.md` (§14 bars bind; no mid-run re-scoring)
- Analysis: `evidence/2026-11-10/journey-establishment-r127-analysis.txt`
- Pre-flight deviations (LOUD, standing state): `git pull --ff-only` FAILED —
  local master diverged from origin/master (ahead 401, behind 156; same
  standing state as r120–r123/r167; ship loop owns reconciliation). Proceeded
  on local master. Main tree clean; disk 30%.
- Lock: created 11:43:39Z, run_id `2026-11-10T11:43:39Z`. Heartbeat loop
  `/tmp/hbloop-r127.sh` (PID 54006, every 10 min); registration took ~7 min
  (slow checkout, no flap).

## The leg's question

r118's full 16-seed panel CONFIRMED the pace regression (pace03 7/16) and
named the next dial: the **grant rate** — how much credit a rack batch or a
hunt kill awards — not the rung. This run IS that dial: the fix halves the
routine-work grant rate at the two racing sites (preserver rack resolution
and butcher hunt kill, 2 units of work buy 1 food XP, odd unit carried on
the person record so no work is lost), rung 5/15/30 and askSpecialist +1
unchanged, no gate/price/threshold change. Second question: do the
invitation and null-line standings hold on a fresh band with the r118
analyzer fixes (invite denominator, dEnd foodXp fallback) in place?

## Verdicts

| Check | Bar | Measured | Verdict |
|---|---|---|---|
| Q1 pace (moves) | ≥8/16 seeds | **6/16** | **NO-GO** |
| Q1 pace (pace03) | ≤4/16 | **0** | pass (leg) |
| Q1 before-validity | BEFORE pace03 ≥5 | **BEFORE pace03 = 3** | **UNTESTED on the dial** |
| Q2(a) game offer | accept+decline on every invite menu | **20/20 menus** | PASS |
| Q2(b) driver answer | ≥80% answered | **18/20 = 90%** | PASS |
| Q3 null THEM lines | 0 | **0** | PASS (holds) |
| M3 villages surviving to day 42 | ≥12/16 | **16/16** | pass |
| M4 villages with no starvation death | ≥12/16 | **14/16** | pass |

**Q1 NO-GO — and the run is UNTESTED on the dial as framed.** The fix
works as a brake: it removes every racer on the band (BEFORE pace03 3 →
AFTER 0) and halves total food XP (680 → 379). But it also brakes the
ladder itself: moves fall 8/16 → 6/16, below the ≥8 bar. And the
before-validity bar fires independently — BEFORE pace03 is 3, not ≥5, so
the regression reproduced weaker than designed on this band and the dial
question as framed has no full-strength regression to fix. Either way the
fix does NOT land: it is reverted in the worktree (see Proof test). The
two readings agree on the outcome and disagree only on what the next run
should measure — see Metric review.

The three BEFORE racers, all preserver, all removed by the dial:
Melissa (2108, welder) 31 XP, spec 3 → 17 XP, spec 2; Ananya (2109,
hotel housekeeper) 44 XP, spec 3 → 12 XP, spec 1 (her butcher move held,
spec 1 both panels, 9 → 8 XP — the hunt side of the dial is noisier than
the rack side on this band); Lisa (2115, army medic) 57 XP, spec 3 →
26 XP, spec 2.

The moves the dial costs: Amelia (2105, dentist) preserver 9 XP, spec 1
→ 4 XP, spec 0 — halved below the 5-XP first rung, a clean dial cost;
Sarah (2113, bush pilot) butcher 6 XP, spec 1 → 3 XP, spec 0 AND
preserver 8 XP, spec 1 → 4 XP, spec 0 — both moves halved below their
first rungs, clean dial cost. Ornella (2110, police officer) preserver
15 XP, spec 2 → 0 XP, spec 0 is CONFOUNDED, not a clean cost: the AFTER
run on that seed ended day 42 vs BEFORE day 43, and the seed's total
foodXp actually ROSE 16 → 26 — a diverged trajectory (different villagers
did the preserving), not the halving. The other way, 2112 GAINED a move on
AFTER (Tariq, electrician, preserver 0 → 1, 6 XP) that BEFORE never had.
Moves by window (AFTER): d1–d14 1 seed, d14–d28 5, d28–dEnd 3 (seeds can
move in more than one window; 9 individual moves across 6 seeds).

Food XP totals: BEFORE 680 → AFTER 379. By task: preserver 587 → 331,
butcher 93 → 48; cook/spotter/builder 0 both panels (no grant sites —
the known gap: the ladder still moves only through preserving and
butchering). Grant events AFTER: 236 rack resolutions granted preserver
XP (382 XP via racks), 142 hunt kills, 66 of them granting butcher XP.

**Q2 PASS.** The game offers accept + decline on every invitation-owned
menu (20/20); the driver answered 18/20 = 90% (17 accept, 1 decline).
The two unanswered spoken invites are both closing-line cases — the
invite is the last THEM line before the convo closes, same shape as
r118's Nikolai case, not a game defect: Ananya (2109, "Come see what I
found. You won't believe it.") and Aisling (2116, "Help me haul
something back? Too much for one."). The single decline is the rule
working as designed: Chloe (2110), trust 30, "Not this time." /
"Another time, then. A small thing, pocketed." 6 of the 18 answers came
from pending-at-start menus with no spoken line — the denominator fix
resolves the old absurdity (the old count would have read offered=14,
answered=18).
**Q3 PASS.** 0 null THEM lines; navTurns 2. The r116 fix holds on the
full panel.
**M3/M4 PASS.** All 16 villages alive at dEnd (7–12 people); 14/16 with
zero starvation deaths — one starvation death on 2103 (day 42) and one on
2108 (day 33), identical villager-count and day on BEFORE and AFTER
(trajectory-identical, not a fix effect).

## Village assessment (plain words)

Sixteen villages, all alive at day 42–44, 7–12 people each. The food work
is happening at scale: 142 hunt kills, 236 rack resolutions granting
preserver XP, pantries from 6,300 kcal (2112, the leanest) to 187,342
(2109, the fullest). Everyone reached wave 3 of the monsters; 5 of 16
reached wave 4, one (2106) reached wave 5. The villages that hunt hardest
eat best — 2109 ends with 187,342 kcal, while 2112 ends lean at 6,300 —
but even the lean village survives with 12 people alive and no starvation
death. The ladder moves on 6 of 16 villages and only through preserving
and butchering: every move is preserver or butcher; cook, spotter and
builder move nowhere, foodXp totals preserver 331 / butcher 48 / rest 0.
Nobody starved except one villager each on 2103 and 2108. The quiet
villages this time are 2102 (no foodXp at all on either panel — the
village survives without any food-skill movement, same shape as r116's
seed 17107 and r118's 1906/1910) and 2116 (11 foodXp total on AFTER).
The dial's footprint is visible in the totals but invisible in the
villages' fortunes: pantries, survival and waves are unchanged between
panels — the brake only slows who becomes a specialist, not whether the
village eats.

## People check (all 64 held convos read in full)

The conversations read like people, and the invitations keep paying off —
accepts lead somewhere real: Cesar (2106) digs up a buried food cache on
the walk (+1,305 kcal to the pantry); Cheryl (2112) and Eric (2113) press
a kept tool into your hand; Rosa (2107) and Sari (2115) teach slope-
reading for water on the way ("how they read a slope for water, how
their grandmother did it" — the same lesson line from two villagers,
a repeated line, see below); link proposals are carried (Anh → Ashford,
2107; Shanice → Stonebridge, 2113); party namings are picked five times
(FINAL GIRLS CLUB ×3, PLOT ARMOR, APEX SNACKS) with roles picked after
them. The player-initiated party invite is answered every time, with
character: "Someone should watch your back. Might as well be me." /
"Not right now. I've got my own things to handle." / "Okay. Yeah. I
trust you." The no-shared-language threads stay the strongest on the
panel — 4 villagers (Nina 2103 Ukrainian, Eduardo 2105 Portuguese,
Melissa 2108 Portuguese, Alla 2111 Russian), all winding down cleanly,
including Alla's speak-back beat ("They knew all along; they just wanted
to watch you work for it.") and Melissa's one-directional System
translation ("You hear them in English — your extended mind translating
live, cheerful and slightly off."). Stalls: 0 plain no-picks. Accept-
then-bail "fire's got me": 0×. Water-haul "3 liters": 0×.

Defects and watches, all read in full (counts grep-verified across the
16 AFTER convo files):
1. **Grant-rate dial judged NO-GO** — see Q1. The fix is reverted; the
   next dial is named in Metric review.
2. **Taken-kin template still repeats, tail first.** The pod-dream
   closing sentence appears in 10 of 64 convos in two fixed wordings —
   "Some nights I dream about the pods -- rows of them, humming. I wake
   up and I can't tell if it was a dream or a broadcast." (5×) and
   "Some nights I swear I hear them before I sleep -- the pods, rows
   deep, humming. Then morning comes and I can't say whether it was
   real." (5×) — told by Ananya, Michelle, Megan, Sarah, Elias, Stella,
   Lisa, Aisling and others, sometimes twice on one seed (2109: Ananya
   AND Michelle, verbatim). The openings keep varying well ("He taught
   me to swim. The boring half. Sure." / "She made soup from nothing and
   they called that boring." / "I tell everyone they were the
   interesting one. I need that to be true." — the last 3×) and "boring
   half" itself is 5×, but the closing sentence is templated. Two more
   convos open on the same dream (Elias 2113, Stella 2114).
3. **"Something in them almost softens — then doesn't. Not yet."** 9×
   across 64 convos (r118: 12×) — down a little, still once per convo
   where it fires.
4. **Deflect pivot** "Sorry — I shouldn't load that on you. What's up?"
   9× (r118: 8×) — flat. Same class as (3): pivots, not filler loops.
5. **The favour-requirements line still reads like a system
   instruction**: "Move next to them, on the same side of the Haven
   door, to help." 7× (r118: 4×) — up. Variants exist and read better
   ("Your partner is inside the Haven hall. Go through the door to meet
   them." — Finn 2103) but the Haven-door phrasing is the one that
   repeats.
6. **NEW — the trust answer repeats verbatim.** "I'll tell you what I
   tell everyone: watch what I do when nobody's watching. That's the
   whole of me. The rest is just talking." 4× (Samuel 2106, Lucas 2111,
   Tanisha 2112, Dorothy 2114). Same class as the taken-kin template:
   one good line, no per-villager variation. Its neighbours repeat too:
   "That's the right answer. The wrong one would've been 'yes' too
   fast." 4×, "They nod slowly, not quite done, not quite continuing."
   4×, "We're all doing math that doesn't add up. You're still here.
   That counts." 2× (Sandra 2114, Cameron 2116).
7. **The System suggests the same party name.** "FINAL GIRLS CLUB" is
   the System's suggestion 4× (2105, 2109, 2112, 2114) and gets picked
   3×; 19 mentions across the panel. The suggestion pool is thin
   (PLOT ARMOR, THE ENSEMBLE, THE PROTAGONISTS, APEX SNACKS seen once
   each). The driver always picks index 0, so this is partly a driver
   artifact — but the pool itself repeats.
8. **Gossip repeats verbatim.** "Deepa died in The Moot" told word-for-
   word by two villagers on one seed (Axel and Mara, 2102) — same fact,
   identical wording. Watch item, same class as (2).
9. **preserve_food, carried.** HELD-UNUSED, 42 holders, 0 uses — the
   skill's own villager-side read site remains the open gap (r114–r118).
   Same class: the panel's specialist moves are all preserver/butcher,
   yet preserve_food itself still has no job a villager can do on their
   own. Held/notheld kcal ratio 1.68 (85 held kills, 464,941 kcal vs 57
   notheld, 276,807 kcal) — holders hunt more, but the skill itself is
   never the tool.

## Reachable / fun / winnable

- **Reachable: yes.** The ladder moves on 6 of 16 fresh villages inside
  the leg (8 on the unfixed tree), racks fire 236 times, food gets
  stored, wave 3–5 reached. Everything this leg is about is reached by
  a competent player.
- **Fun: yes, same shape as r118.** The invitations keep getting
  answered and the answers lead somewhere — walks with real outcomes,
  lessons, link proposals, party namings. The villages read like people,
  and the leg's stakes — food, water, the wild — are live in every
  conversation. The remaining fun gaps are the repeated lines (taken-kin
  pod sentence, softens beat, deflect pivot, Haven-door line, and now
  the trust answer) — the same carried items, now measured on a fresh
  band with exact counts.
- **Winnable: unchanged by this leg, with the same flag as r118.**
  Establishment is not the binding link (scale r112: the veteran wall
  and the trade-route wall). But the dial matters for the standing path:
  the Standing ladder's Craft track mints from the same practice credit,
  so a dial that brakes the ladder also brakes standing — the next dial
  has to slow the racers without stalling the marginal movers, or the
  standing path stalls with them.

## Metric review

- **The ≥5 before-validity bar was designed for the "no regression at
  all" case, not a weaker reproduction.** This band reproduced the
  regression at 3 racers, not ≥5 — so the run is UNTESTED on the dial as
  framed, while the moves leg independently says NO-GO (6/16 < 8).
  Both readings agree the fix does not land. Proposed revision for the
  next run: lower the BEFORE-validity bar to pace03 ≥3 (the strength
  this band actually reproduced at), or drop the separate validity gate
  and let the moves bar judge — a band that reproduces 3 racers and
  loses 2 moves to the dial has told us what we need. No verdict
  changes here; only the instrument.
- **The halving bites marginal movers as hard as racers.** It removed
  all 3 racers (good) and 2 of the 8 BEFORE moves (Amelia, Sarah —
  both halved below their first rung), plus Ornella (confounded). A dial
  that only bites above the first rung would keep the marginal moves.
  Candidate next dials, for the next run to decide (this run does not
  re-score): (a) halve only above the first 5 XP — first rung at full
  rate. On this band: Lisa 57 → 31 still a racer, pace03 ~1, moves
  restored including Amelia 9 → 7 and Sarah 6 → 5 / 8 → 6 — GO shape;
  but it leaves the historical sharpest racer unheld (Brendan 72 → 38
  on the r118 band). (b) per-day XP cap (+1/day) — bites daily
  grinders, spares sparse marginal movers; needs per-villager XP/day
  sizing from the BEFORE panel's grant timestamps, an owed analysis.
- **Q2 denominator fix verified in production, not just unit-tested.**
  6 of the 18 answers came from pending-at-start menus with no spoken
  line; the old spoken-lines-only count would have read offered=14,
  answered=18. The fix is confirmed working. The bar passed on either
  denominator anyway (90% vs the old absurdity).
- **dEnd foodXp fallback verified working (r118's owed item).** Top-XP
  villagers read full XP at dEnd; remaining zero-fx-with-skill cells
  are all occupation skills (e.g. Regina butcher 3, XP 0).
- **Driver neutrality holds.** The proof test's det-gate (r127 driver
  vs r118 driver, 5d seed 2101, HUNTSTAFF=2) shows identical funnel
  keys — the panel differences are the fix, not the driver.
- **Q1's window shape.** Moves land mostly d14–d28 (5 seeds), then
  d28–dEnd (3), then d1–d14 (1). The race is usually decided by day 28
  — any dial has to bite early, not just at the top (r118's sharpest
  cases already said this; this band confirms it).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/establishment.json
--current 'evidence/2026-11-10/journey-establishment-r127-after-seed*.json'
--metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
fired 3 LOUD lines. All EXPLAINED, no baseline roll-forward:
- guardrails.deaths 123 → 687, popAlive 33 → 160, pantryKcal 101205 →
  1090978: the tool SUMS across files and the baseline is a 4-seed
  gate-off control (r108, 2026-11-06) vs this 16-seed HUNTSTAFF=2
  panel — pure n-mismatch on the sums (the class r120 named). Per-seed
  means: deaths 30.75 → 42.9, popAlive 8.25 → 10.0, pantry 25,301 →
  68,186. The per-seed means track r118's (42.3 / 10.4 / 77,150) within
  noise — the HUNTSTAFF=2 regime, not a new deviation. The baseline
  predates the hunt-staffing regime; rolling a 16-seed HUNTSTAFF=2 panel
  into a 4-seed gate-off control would mix regimes, so the baseline
  stands and a fresh current-policy baseline is an owed item for the
  next run, not a silent roll-forward here.
- c3.starvationDeaths did NOT fire LOUD (baseline 0, current 2 — the
  2103 and 2108 starvation deaths, consistent with M4 passing 14/16).

## Gate

`node scripts/check.js --quick` in worktree (twice; second run with full
output to the log): **294 passed, 6 failed** (first run 677s, second 484s;
exit 1, zero timeouts). All 6 failures are pre-existing on master — the
identical 294/6 was verified on pristine master by journey-succession
r170 the same morning and adjudicated GO there. **No lever-attributable
failure. Gate adjudicated GO.** This run changes zero src/js.
- measurement-proof-update + measurement-workflow (the staleness pair):
  "Proof source inputs are not current" / "retained neutrality proof
  covers the current Game/controller/harness inputs" — the retained
  neutrality proof is stale against the current Game/controller/harness
  inputs because master moved since the proof was last refreshed (other
  loops landed). The pair passed on r118's base and fails on this base
  with no change from this run; the refresh
  (`scripts/balance-proof-update.js`) belongs to whoever owns the proof,
  not this run.
- mobile-combat-cadence (standing): "Continue does not wrap the
  announced round a second time" + "enemy is announced before its action
  runs".
- occupation-panels (standing): real CLI workflow.
- phone-frame-proof (standing): retained browser inputs vs current
  source; phone receipt stale/missing.
- establishment-r20-fixes (standing): racks-full voice gate, "next day
  voices once more" expected 2, got 1.

## Proof test

`scripts/test-journey-establishment-r127-grant-rate.js` — **40 passed,
0 failed (~11s)** on the fixed tree: source checks (helper 2:1, both
sites call it, old grants gone, askSpecialist +1, rung 5/15/30, driver
fallback); live helper (1 unit → 0 XP carry 1; 2 → 1 XP; 5 → 2 XP carry
1; 0/negative → 0; null safe); live rung through helper (10 units → 5
XP → skill 1; 30 → 15 XP → 2; 60 → 30 XP → 3; fisherman holder 10
units → 5 XP → skill 3); live event proofs on real duty resolutions
(1 rack batch → +0 XP carry 1; 2 batches → +1 XP; 5 batches → +2 XP
carry 1; no preserve → +0 carry kept; 1st hunt kill → +0 carry 1; 2nd
kill → +1; failed stalk → +0); analyzer synthetic corpora (Q1 GO at
8/16 + pace03 1; NO-GO at pace03 5; Q2 denominator PASS at 2/2 incl.
pending-at-start answer, FAIL at 1/2 with a silence; Q3 null-line FAIL
case); det-gate (r127 driver vs r118 driver, 5d seed 2101,
HUNTSTAFF=2: funnel keys identical).

The fix is REVERTED per the NO-GO (r115 precedent): `git checkout HEAD
-- src/js/game.js` in the worktree, diff gone, helper count 0. Proof
test re-run on the reverted tree: **17 passed, 12 failed — by design**
(all 12 failures grant-related: helper missing, old grants back;
analyzer-logic checks J–Q and det-gate AL–AN still pass, confirming
the test's verdict logic is intact on the reverted tree). No src/js
change ships from this run.

## Regression check

`node scripts/check.js --quick` in worktree: 294 passed, 6 failed, all 6
pre-existing on master (see Gate — log
`evidence/2026-11-10/journey-establishment-r127-gate.log`). This run
changes zero src/js (fix reverted); the relevant suites are the new proof
test (40/40 fixed, 17/12 by design reverted) and the analyzer (full panel,
both drivers).

## Files

- Prereg: `evidence/2026-11-10/journey-establishment-r127-prereg.md`
- Driver: `scripts/journey-establishment-r127-20261110.js` (r118 clone,
  tag rename + dEnd foodXp fallback)
- Analyzer: `scripts/analyze-journey-establishment-r127-20261110.py`
  (r118 clone: 16 seeds, invite denominator fix)
- Proof test: `scripts/test-journey-establishment-r127-grant-rate.js`
  (new; 40/40 fixed, 17/12 by design reverted)
- Panels: `evidence/2026-11-10/journey-establishment-r127-before-seed{2101..2116}.json`
  + `-convo-seed{2101..2116}.txt` and
  `evidence/2026-11-10/journey-establishment-r127-after-seed{2101..2116}.json`
  + `-convo-seed{2101..2116}.txt`
- Analysis: `evidence/2026-11-10/journey-establishment-r127-analysis.txt`
- Gate log: `evidence/2026-11-10/journey-establishment-r127-gate.log`
  (294 passed, 6 failed — all pre-existing on master)

## Next leg

Deepening (rotation 1→2). Open items carried forward:
- **Next grant-rate dial** for the judged NO-GO (moves 6/16, racers
  removed but marginal moves lost): (a) halve only above the first 5 XP
  (first rung at full rate) or (b) per-day XP cap (+1/day, needs the
  owed per-villager XP/day sizing from the BEFORE panel). Next run
  decides; the BEFORE-validity bar should drop to pace03 ≥3 or be
  folded into the moves bar.
- **Fresh current-policy telemetry baseline** (HUNTSTAFF=2, 16 seeds) —
  owed, not a silent roll-forward; the r108 4-seed gate-off control no
  longer describes the regime.
- preserve_food still has no villager-side job — the leg that gives the
  skill a job owns it.
- The carried repetition items, now with exact counts on a fresh band:
  taken-kin pod sentence (10× in two fixed wordings), softens beat
  (9×), deflect pivot (9×), Haven-door favour line (7×), trust answer
  (4×, new), System party-name pool (FINAL GIRLS CLUB suggested 4×),
  gossip verbatim repeat (Deepa/Moot, 2102).
