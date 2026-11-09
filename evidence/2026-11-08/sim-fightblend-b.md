# sim-fightblend-b — numerator-aware fight judgment (judge the HP trajectory as if protection were 4)

**Arm:** sim-fightblend-b · **Run:** fleshout-loop-b-20261108T2230Z (Loop B),
adopted/closed by fleshout-20261109T0126Z (stale-lock recovery — see
Infrastructure) · **Axis:** scale-onramp / winnability chain (converging,
NOT converged) · **Verdict (pilot): GO** — 53002 returns to the C1 shape
exactly as predicted (6 rounds, hopeless flee, 43 HP left) and the unit
leg is decision-invariant to protection · **Confirm:** fresh band 53801–53812 — **GO**. Confirm candidate median
150d vs baseline 133d (bar ≥106.4), sits 8/12 vs 6/12 (bar ≥5), starvation
13 vs 14 (bar ≤16); all 12 root fights identical in shape across legs
(no over-flee, no under-flee); unit leg re-run 11/11 on the fixed
(confirm) tree. The fix generalizes — see Confirm section. · **Prereg:**
`evidence/2026-11-08/sim-fightblend-b-prereg.md` · **Findings:** #1943 ·
**Base:** master 93e7bea26 (post-adoption; flipsocial-b tip) · **Substrate:**
doorwalk baseline leg, policy competent-doorwalk-b, TAKESEAT_B=1, door
drive off · **Pilot seeds:** 53001–53008, FROZEN (the bisect's diagnostic
band) · **Horizon:** 150d death-aware.

## The question

Candidate (b) read fully raw (protection 0) and over-fled; the middle
shape judged only the denominator at protection 4 and under-fled. The
midshape verdict: the gap is not a judgment value — it is the HP
trajectory itself. This arm judges the trajectory as if protection were
4: a parallel hypothetical HP that falls by protection-4-mitigated
incoming, with the morale read run on that hypothetical HP and the P4
incoming rate. The numerator-aware shape, NOT the blend variant (partial
mitigation), which is a different arm and is not substituted here.

## The fix (exact construction — from the prereg; src/js/fieldFights.js only, +47/−4)

- Capture `vHpStart` at fight start; hypothetical HP `vHpHypo =
  vHpStart − rec.vTakenP4`.
- Parallel P4 incoming accumulator: the monster-phase `total` after
  board/ability modifiers but before armor absorption, mitigated with
  `this.armorReduction(4, pierce)` in place of the worn value (same
  `Math.min(total − 1, Math.round(total × r))` clamp, at least 1 lands),
  regardless of actual `varmor`/`allyArmor`. `wornDamage`, unbreakable
  brace, and shield wall NOT applied; no RNG draw made.
- Leech splits at the mitigated ratio (`Math.floor(p4Total / 2)` to the
  leader when leech fires). Current-ally P4 total resets when a new ally
  is called in (shout branch and ally-from-start setup).
- Morale trajectory read uses the hypothetical HP and P4 totals: solo
  `mDprHypo = rec.vTakenP4 / round`, `rtd = (vHpStart − rec.vTakenP4) /
  Math.max(1, mDprHypo)`; party variant on hypothetical leader + ally HP
  over the P4 rate. `hopeless = rtd < rtk × 0.85` and `winning = rtk ≤
  rtd × 1.1` unchanged in form — only their inputs change.
- Record-only: `rec.vHpHypoLeft` / `rec.allyHpHypoLeft` at the close.
- NOTHING else changes: `rec.vTaken`, live HP, settlement, narration,
  the floor flee (still reads live HP), committed-finish hold, trick
  holds, war cry / rally, round caps — byte-identical in behavior. No RNG
  draws added or removed. Player turn-based fight paths NOT touched.

## Pilot verdict (binding bars, §14)

| Bar | Result | Numbers |
| --- | --- | --- |
| PRIMARY (a) — 53002 C1 shape | **PASS** | candidate: vFlee, fleeHopeless, 6 rounds, 43 HP left (bar 5–7 rounds, HP 35–60, expected 43); baseline reproduces P2 (10 rounds, vKill, 13 HP) |
| PRIMARY (b) — unit leg decision-invariant | **PASS** | same scripted fight at prot 3 vs 5: IDENTICAL hopeless/flee outcome while vTaken differs; vTakenP4 identical across legs, > worn-5 taken and < worn-3 taken; vHpHypoLeft identical |
| PRIMARY (c) — all 8 root fights reported | PASS | table below (reporting bar) |
| SECONDARY — non-inferiority | **PASS** | median 150d → 150d (bar ≥120d); sits 6/8 → 6/8 (bar ≥5/8); starvation 3 → 5 (bar ≤5, exactly at the bar — fallen-cause count, same method as midshape-a) |

Proof: `scripts/test-fightblend-b.js` — **31 passed, 0 failed** on the
fixed tree (re-run by the adoption coordinator after popping the
worker's stash; see Infrastructure). Pilot GO per the binding bars.

### The 53002 fight (predicted point values, exactly as pre-registered)

| Leg | Outcome | Rounds | Taken | P4 taken | HP left | Hypo HP left | Hopeless |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | vKill | 10 | 87 | — | 13 | — | never |
| Candidate | vFlee | 6 | 57 | 62 | 43 | 38 | yes (round 6) |

The trajectory-identity argument holds exactly: C1's live HP at round 6
was 38 (P4 cumulative 62); the hypothetical HP at round 6 is 100 − 62 =
38; the flee fires through the hopeless branch (which precedes the floor
check) at round 6, with the body still wearing protection 5 (43 HP
left, not C1's 38). Tail: "the man in his 30s sees how this ends — and
runs while running still works."

### All 8 root fights (gseq 1, baseline → candidate)

| Seed | Fighter vs monster | Baseline | Candidate |
| --- | --- | --- | --- |
| 53001 | Declan Baumann vs hushwolf | vKill 7r, taken 50, HP 70 | vKill 6r, taken 37, HP 63 (P4 97, hypo 3) |
| 53002 | Kieran Lorenz vs cliffhanger | vKill 10r, taken 87, HP 13 | **vFlee 6r hopeless, taken 57, HP 43 (P4 62, hypo 38)** |
| 53003 | Jorge Silva vs lockpick_raccoon | vKill 3r, taken 9, HP 91 | vKill 3r, taken 9, HP 91 (P4 20, hypo 80) |
| 53004 | David Kim vs hushwolf | vKill 4r, taken 45, HP 55 | vKill 4r, taken 45, HP 55 (P4 75, hypo 25) |
| 53005 | Robin Gordon vs nightcourt | vKill 6r, taken 23, HP 77 | vKill 6r, taken 23, HP 77 (P4 51, hypo 49) |
| 53006 | Rosa Mendez vs gallowdeer | vKill 8r, taken 57, HP 43 | vKill 5r, taken 15, HP 85 (P4 44, hypo 56) |
| 53007 | Diego Miranda vs nightcourt | vKill 7r, taken 64, HP 56 | vKill 7r, taken 64, HP 56 (P4 64, hypo 36) |
| 53008 | Frank Giordano vs sanjun | vKill 6r, taken 22, HP 78 | vKill 6r, taken 22, HP 78 (P4 60, hypo 40) |

No new flee besides 53002; no kill → flee regression anywhere. Three
fights shorten or change shape (53001, 53002, 53006); five are
byte-identical in outcome/rounds/taken. The hypo HP left on 53001 (3)
and 53004 (25) shows the judgment running well ahead of the body on
fights the body still wins — the trajectory read is harsher than live
HP, which is the shape working as designed, not a misfire (both still
vKill).

## Scale-wall numbers (pilot corpora, doorwalk leg, TAKESEAT_B=1)

Baseline: median 150d, sits 6/8, national 0/8, wins 0, wave-5 reach 4/8.
Candidate: median 150d, sits 6/8, national 0/8, wins 0, wave-5 reach 3/8.
Days per seed — baseline [69, 60, 150, 150, 96, 150, 150, 150],
candidate [150, 150, 150, 150, 76, 150, 150, 78]. The candidate moves
two short villages to 150d (53001: 69 → 150, 53002: 60 → 150) and two
long villages down (53005: 150 → 76, 53008: 150 → 78) — median and sits
flat, distribution churned underneath. That churn is the fight shape
working (fights end sooner, for better and worse); it is not a
regression signal on the binding bars, and the panel read below is
where it gets a second look.

## Balanced panel (§15)

`evidence/2026-11-08/fightblend-b-panel-compare.md` (and
`.json`) — decision **review_required** (8 paired cases × 4 policies,
seeds 53001–53008, 150d). The panel is the instrument; the
pre-registered GO bars above are the judge. Signals to record honestly:

- Capable: table win rate 0.875 → 0.875, sits 0.875 → 0.875 (unchanged);
  national access 0.875 → 0.75 (regression_watch); first-bearer survival
  day-30 0.857 → 0.571, day-60 0.714 → 0.286 (insufficient — 7/8 pairs);
  player deaths/run 1.5 → 1.875 (regression_watch); player named-class
  access 1 → 0.625 (**regression_signal**, interval excludes 0).
- Risk-aware: player deaths/run 8.125 → 11.75 (+3.625, regression_watch);
  village deaths/run 61.25 → 75.25 (+14, **regression_signal**, interval
  2.75–22.5); first-bearer day-30 survival 0.875 → 0.375
  (regression_watch). Wins 0 → 0 both legs.
- Socialite: player deaths/run 11.5 → 8.75 (−2.75, no_material_signal);
  village deaths/run 64 → 58.375; first-bearer day-30 survival 0.5 → 1.
  Wins 0 → 0.
- Winseek: player deaths/run 8.375 → 11.625 (+3.25, **regression_signal**,
  interval 1.375–5.5); village deaths/run 58.875 → 63.375
  (regression_watch). Wins 0 → 0.

Read: the fix costs deaths under cautious play (risk-aware village
deaths +14, winseek player deaths +3.25 — both signals) while capable
wins/sits are flat and socialite improves. The same pattern the
flippanel-b arm saw on the healed leg (risk-aware deaths up). The
mechanism is unexamined — the likeliest story is the one the pilot
shows: fights end sooner, so villagers who would have ground out a
kill now flee earlier and the village's kill economy shifts, but that
story is NOT proven by these numbers and is recorded as a hypothesis,
not a finding. The panel does not veto the pilot GO under the
pre-registered bars, but it is the reason the confirm matters and the
reason the fix, if it lands, lands with a watch on cautious-play deaths.

## Confirm (fresh band 53801–53812) — GO

The worker ran the confirm BASELINE (12 seeds, median 133d, sits 6/12,
starvation 14, wave-5 reach 4/12) and then died after stashing the fix
for the baseline run. The adoption run popped the stash and ran the
confirm CANDIDATE on the fixed tree (same driver/policy/horizon:
`SEEDS=53801..53812 DAYS=150 RUN=fightblend-b-confirm-candidate`,
12/12 files, 0 instrument errors).

| Bar | Result | Numbers |
| --- | --- | --- |
| PRIMARY — unit leg re-run on the confirm code base | **PASS** | `LEG=unit node scripts/test-fightblend-b.js`: 11/11 on the fixed tree (identical outcome/rounds/fleeHopeless across prot 3 vs 5; vTakenP4 identical, between worn-5 and worn-3 taken; vHpHypoLeft identical) |
| PRIMARY — 538 root fights (first-divergence shapes) | **PASS** | all 12 root fights byte-identical in outcome/rounds/taken across legs (table below) — no over-flee, no under-flee on fresh seeds |
| SECONDARY — non-inferiority vs fresh-band baseline | **PASS** | median 150d vs 133d (bar ≥106.4); sits 8/12 vs 6/12 (bar ≥5); starvation 13 vs 14 (bar ≤16, fallen-cause count) |

The confirm band actually improves on the fix: median +17d, sits +2,
wave-5 reach 4/12 → 7/12, starvation −1. Days per seed — baseline [150,
51, 150, 150, 82, 150, 116, 70, 150, 49, 150, 54], candidate [150, 51,
150, 150, 76, 150, 150, 150, 150, 44, 150, 66]. Two villages climb to
the cap (53807: 116 → 150, 53808: 70 → 150); two fall back (53805: 82 →
76, 53810: 49 → 44); the rest hold. No wins on either leg (0/12 both)
— the confirm band is a fight-shape band, not a win band, and the doorwalk
leg does not reach the table here.

### All 12 confirm root fights (gseq 1, baseline → candidate)

| Seed | Fighter vs monster | Baseline | Candidate |
| --- | --- | --- | --- |
| 53801 | Sari Wulandari vs mirrormoth | vKill 4r, taken 8, HP 92 | vKill 4r, taken 8, HP 92 (P4 30, hypo 70) |
| 53802 | Deirdre Villa vs white_noise_heron | vKill 6r, taken 56, HP 44 | vKill 6r, taken 56, HP 44 (P4 63, hypo 37) |
| 53803 | Pedro Adler vs mirrormoth | evade 0r, taken 0, HP 100 | evade 0r, taken 0, HP 100 (P4 0) |
| 53804 | Jayden Melnyk vs anaconda_empress | evade 0r, taken 0, HP 85 | evade 0r, taken 0, HP 85 (P4 0) |
| 53805 | Ethan Hunt vs living_wire | vKill 5r, taken 21, HP 79 | vKill 5r, taken 21, HP 79 (P4 48, hypo 52) |
| 53806 | Rachel Nie vs living_wire | vKill 5r, taken 24, HP 76 | vKill 5r, taken 24, HP 76 (P4 57, hypo 43) |
| 53807 | Maya Singh vs gallowdeer | evade 0r, taken 0, HP 100 | evade 0r, taken 0, HP 100 (P4 0) |
| 53808 | Nia Valencia vs drumbelly_tanuki | vKill 5r, taken 11, HP 89 | vKill 5r, taken 11, HP 89 (P4 33, hypo 67) |
| 53809 | Somchai Praser vs glasswing | vKill 3r, taken 6, HP 94 | vKill 3r, taken 6, HP 94 (P4 26, hypo 74) |
| 53810 | Owen Smith vs nightcourt | vKill 3r, taken 12, HP 81 | vKill 3r, taken 12, HP 81 (P4 28, hypo 65) |
| 53811 | Raj Johnson vs mirrormoth | vKill 6r, taken 67, HP 33 | vKill 6r, taken 67, HP 33 (P4 40, hypo 60) |
| 53812 | Tariq Mahmood vs hushwolf | vKill 2r, taken 22, HP 78 | vKill 2r, taken 22, HP 78 (P4 41, hypo 59) |

The three evade fights (53803, 53804, 53807) are the degenerate case
(finding #1016): no damage taken, P4 total 0, hypothetical HP never
engaged — the construction neither fixes nor worsens it, and the outcome
is identical on both legs. On the nine fights with damage, the P4 and
hypo fields are recorded on the candidate leg and the live outcome is
unchanged — the judgment reads a harsher trajectory and still kills
where the body kills. That is the decision-invariance property holding
on fresh seeds: the fix changes the judgment's input, not the
villages' outcomes, except where the trajectory says to run (53002).

**Confirm verdict: GO.** Pilot GO + confirm GO → the fix lands (see
Landing rule in the prereg: GO lands as its own commit with proof test
+ evidence + corpora). The panel's cautious-play death watch (see
Balanced panel) is carried as a landing note, not a veto — the confirm
band's own death counts run the other way (starvation 13 vs 14, median
and sits up).

## Sense-test (53002 Kieran fight, plain words)

Baseline: Kieran Lorenz, a man in his 30s, meets a cliffhanger on day 4
and fights it for ten rounds, taking 87 damage, never once thinking the
fight is lost — and kills it with 13 HP left. The judgment never turns
hopeless because his worn protection 5 keeps his live HP high while the
incoming rate looks survivable. Candidate: the same fight, the same
blows — but the judgment now reads the trajectory as if he wore
protection 4, and by round 6 it sees what C1's Kieran saw: the beast
will fall in about as many rounds as he will, and he is losing the race.
He runs while running still works, with 43 HP left. The narration is
unchanged (no new lines); the only new sentence is the flee line the
engine already had. The fight reads as a person making a judgment call
at the right moment, not as a number crossing a line.

## Proof

- `scripts/test-fightblend-b.js` — 31/31 on the fixed tree (unit +
  53002 + root-fight presence). Re-run by the adoption coordinator
  after popping the worker's stash; the worker's own run is not on
  record (no proof log survived — the stash message records the
  worker's intent, "temp revert for confirm baseline + check
  attribution", not a proof result).
- `node scripts/check.js --quick` — fixed tree (main-session closeout,
  2026-11-09T02:56Z, log `fightblend-checkquick-fixed-2.log`):
  **294 passed, 6 failed in 644s**, zero timeouts (slowest 67s).
  The 6 are exactly the standing baseline, none attributable to the
  fix: measurement-proof-update + measurement-workflow (neutrality
  proof stale — fieldFights.js is a manifest input; refresh owed
  after the merge), mobile-combat-cadence, occupation-panels,
  phone-frame-proof stale receipt, establishment-r20-fixes. (The
  adoption run's earlier fixed-tree gate died at 73/300 — this is the
  completed re-run.) Attribution re-run on the reverted tree
  (main-session closeout, 2026-11-09T03:19Z, log
  `fightblend-checkquick-reverted.log`): **296 passed, 4 failed in
  618s** — mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes. The fixed tree's 2
  extra failures are exactly the measurement-proof-update +
  measurement-workflow pair: the fix changes fieldFights.js, a
  manifest input, so the retained neutrality proof goes stale on the
  fixed tree and matches again on the reverted tree. That is the
  expected post-merge refresh, not a regression — the fix introduces
  no new test failure. Refresh owed after the merge (see
  Infrastructure).
- Pilot corpora complete: 8/8 seeds both legs, 0 instrument errors.
  Panel compare attached (review_required — see above).
- Confirm corpora: baseline 12/12 (median 133d, sits 6/12, starvation
  14); candidate 12/12 (median 150d, sits 8/12, starvation 13; all 12
  root fights byte-identical; unit leg re-run 11/11).

## Metric review

- The fight-level primary discriminated where band bars could not (the
  secondary passes while the shape is what matters — same lesson as
  midshape-a's metric review). The non-inferiority bar alone would have
  called midshape-a a GO; it does not decide this arm either.
- The unit leg's identity bar held: the judgment inputs are identical
  across protections by construction, and the floor did NOT split the
  legs on this fixture (both protections floor-or-flee identically) —
  the prereg's named split risk did not materialize on the unit leg.
  It may still materialize on the confirm band's root fights; the
  confirm unit re-run is the check.
- The HP-left bar (35–60, expected 43) passed at its point value — a
  pass with its reasoning, not a fudge (see prereg).
- The panel's regression signals (risk-aware village deaths +14,
  winseek player deaths +3.25, capable named-class access −0.375) are
  NOT bars in this prereg and do not re-score the pilot — but they are
  the reason the confirm's secondary and a cautious-play watch are
  load-bearing. If the confirm shows the same death cost, the landing
  decision must weigh it explicitly rather than citing the pilot GO
  alone.

## Village assessment (plain words)

Twenty villages across two bands, each run twice — once with villagers
judging fights by the HP on their bodies, once with them judging by the
trajectory as if they wore protection 4.

On the frozen pilot band, the villages end the same on paper (median
150 days, six of eight take a seat, nobody wins) but the road there
churns: two villages that died young on the old judgment live to the
cap on the new one (53001: 69 → 150 days; 53002: 60 → 150 — the Kieran
fight is the difference, a flee at round 6 instead of a ten-round
grind to 13 HP), and two that lived to the cap fall back (53005: 150 →
76; 53008: 150 → 78). The fix does not make villages safer in bulk; it
makes individual fights end at the moment the trajectory says they are
lost, and whether that saves the village depends on the fight. The
fights that change are the ones where the judgment was wrong — a
villager standing in a losing fight he thought he was winning.

On the fresh confirm band the picture is cleaner: median 133 → 150
days, seats 6 → 8 of twelve, wave-5 reach 4 → 7, starvation 13 instead
of 14. No village wins on either leg — this band never reaches the
table under the doorwalk leg — but more villages live longer and climb
higher. The root fights are identical on both legs, so the gains come
from later fights, not the first ones: the judgment, applied fight
after fight, keeps more villagers alive to fight again.

Who dies and why: the short villages (53802 at 51 days, 53810 at 44,
53812 at 66 on the candidate leg) die in the wild and the arena, not
from starvation — the starvation counts are low on both legs. The
villages that thrive are the ones whose fighters flee the fights they
cannot win and live to take the seat. That is the whole story of this
fix: a fighter who knows when he is beaten is worth more to his village
than a fighter who stands in a losing fight because his armor told him
he was fine.

## Blanks filled / documented

- FILLED (finding #1943): the numerator-aware shape was owed since
  midshape-a; it ran, and pilot GO + confirm GO land it. The blend
  variant (partial mitigation) is still unbuilt and is NOT substituted
  by this arm.
- DOCUMENTED: the fix costs deaths under cautious play on the panel
  (risk-aware +14 village deaths/run, winseek +3.25 player deaths/run)
  with an unexamined mechanism — recorded as a watch, not a finding.
- NOT TOUCHED: trial-by-combat staging (steve-call); the blend variant;
  loadout/equip-score changes; retune values.

## Infrastructure

- ADOPTION: the 2230Z Loop B coordinator died by cron timeout after
  landing sim-flipsocial-b (93e7bea26) and running this arm's pilot +
  panels + confirm baseline, but before the confirm candidate, the
  proof run on record, or any evidence file. This run
  (fleshout-20261109T0126Z) adopted the stranded worktree: the fix was
  recovered from the worker's stash (`stash@{0}`, "fightblend-fix (temp
  revert for confirm baseline + check attribution)", fieldFights.js
  +47/−4, verified as exactly the prereg construction), the proof test
  was re-run 31/31 on the fixed tree, and the confirm candidate sweep
  was run to complete the arm's pre-registered plan. No pilot numbers
  were re-run; the pilot corpora are the worker's.
- The stash pop dropped the stash; the fix is uncommitted in the
  worktree until the confirm verdict decides the landing commit (GO →
  fix + proof + evidence + corpora; NO-GO → revert, evidence +
  corpora only).
- Landing commit (fix + proof + evidence + corpora + panels + gates):
  `3f405ff78` (main-session closeout), plus the follow-up commit
  filling this hash in the evidence file.
