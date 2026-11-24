# ADOPTION NOTE (run fleshout-loop-b-20261124T2130Z)

The 1930Z worker's analyzer + proof test were wiped by the 21:32Z
machine restart; only the prereg and this evidence file survived
(verbatim, in the coordinator's stranded directory). The instrument
was RE-DERIVED from the frozen prereg on this run
(`scripts/analyze-fleecall-b.js`, commit 72c5839a4; proof
`scripts/test-fleecall-b.js`), and the verdict below is that
re-derived instrument's OWN result, not a copy: every number was
recomputed from the frozen corpus by the new analyzer and checked
against the stranded text before landing. Reproduction verified,
zero diffs: B1 20/20 classified, 0 unclassified; B2 pool 20; B3
1/20 = 5.0% (109505 d118 Network Note, 95 HP remaining); medians
lead HP 19 / monster HP remaining 963.5 / rounds-to-kill 19 finite;
variant split 11 hopeless / 9 floor / 0 learn / 0 committed-floor;
the full 20-row per-meeting table (0 diffs); correlations −0.64 /
+0.45 / −0.64 / +0.52 / −0.57 / −0.57; died comparison median 1059
HP remaining; second sample ctl 1 fled / arm 4 fled + 1 died;
vTaken = lead hit-sum on all 20 (0 mismatches); maxHpEst exactly
100 on all 20. Instrument health on the re-derived instrument:
analyzer selftest 19/19 green; determinism byte-identical across
two runs (16,582-char stdout — the stranded draft's "5279 chars"
described the lost original's shorter output, not this run);
proof test green in-worktree — the live staged flee parses 41 =
engine 41 exactly, so the B4 line below saying the proof was "to
be run" is now satisfied. Prereg commit 65fe22642 (hash recorded in
the prereg's preservation note). Mechanism line citations
re-verified against this branch (fieldFights.js P4 block 1988–1993,
vBreak 1333–1381, game.js:14180 armorReduction, DOORFLEE2 comment
present). Nothing below this note was edited.

# sim-fleecall-b — the flee call, not damage (finding #2602)

Loop B arm sim-fleecall-b, run fleshout-loop-b-20261124T1930Z. DIAG,
corpus re-read — NO new sims, NO game-code change.
Prereg: `evidence/2026-11-24/sim-fleecall-b-prereg.md` (frozen before
judging; commit to be filled when the flap clears).
Corpus: `evidence/2026-11-24/perseed-basedmg-b-ctl/` (8 seeds
109501–109508) + `evidence/2026-11-24/basedmg-b-analysis.json`
(27 launched meetings, 20 vFlee, 7 vDie, kill share 0/27).
Instrument: `scripts/analyze-fleecall-b.js` (frozen),
proof `scripts/test-fleecall-b.js`.

## Verdict: DIAG-GO

All four frozen bars pass:

| Bar | Result |
|---|---|
| B1 classification complete (every fled meeting classified, 0 unclassified) | **20/20, 0 unclassified** |
| B2 pool floor (fled meetings ≥ 10) | **20** |
| B3 within-one-round share stated with its denominator | **1/20 = 5.0%** |
| B4 instrument health (0 parse errors, selftest green, determinism byte-identical, proof test green) | **0 parse errors; selftest 19/19; determinism verified (two runs byte-identical, 5279 chars); proof test (to be run in-worktree after the flap clears — §1/§2 logic verified directly: live staged flee parses 41 = engine 41 exactly)** |

## The answer in one paragraph

Only **1 of the 20** fled launched fights ended with the monster within
one round of death. The typical fled fight ended with the monster at
**963.5 HP** (median; range 95–1253) and **19 rounds from a kill** at
its own damage rate (median; range 1–189) — the party was not one blow
short, it was most of a fight short. The flee call does not track the
monster's remaining HP at all: it fires on the lead's survival, either
the bravery floor (9/20 — the lead is "past holding", median lead HP 19
at flee, range 5–57) or the "hopeless" race (11/20 — "sees how this
ends"). And the hopeless race is judged on an imagined fight: the
engine compares rounds-to-kill against rounds-until-the-lead-drops
**as if the lead wore protection-4 armor** (`fieldFights.js`
FIGHTBLEND-B), while the leads on this band wear protection 27–37.
On live numbers the sharpest case was winning by a wide margin (monster
0.8 rounds from death, lead 5.7 rounds from dropping) and still fled,
because on the imagined protection-4 numbers the lead was already
~195 HP underwater. The flee call is a mechanical tripwire with a real
human face: the lines read like a sensible hurt leader pulling out,
but the decision underneath never looks at the monster's remaining HP
or the party's real armor.

## The per-meeting table (all 20 fled launched meetings)

mHpRemaining = mHpStart − mDealt. roundsToKill = ceil(remaining / dpr);
∞ where dpr = 0. leadHpAtFlee from the transcript's last
`hits <lead> for N (M left)` line (+ heals after it), cross-checked
against `fleeHpFrac` — maxHpEst is exactly 100 on all 20. vTaken is
the LEAD's damage taken (it equals the sum of the lead's logged hits
in all 20 meetings — see "Blanks").

| seed | day | monster | w | rounds | mHp rem | dpr | rtk | ≤1rd | lead HP | frac | variant | vTaken |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 109501 | 36 | algorithm | 4 | 4 | 941 | 53.8 | 18 | – | 39 | 0.39 | hopeless | 46 |
| 109501 | 73 | eater | 4 | 2 | 1036 | 5.5 | 189 | – | 5 | 0.05 | floor | 83 |
| 109501 | 124 | strike | 4 | 7 | 1030 | 18.1 | 57 | – | 8 | 0.08 | floor | 98 |
| 109501 | 129 | network_note | 5 | 3 | 1134 | 38.3 | 30 | – | 10 | 0.10 | floor | 35 |
| 109502 | 51 | algorithm | 4 | 5 | 840 | 59.4 | 15 | – | 28 | 0.28 | hopeless | 67 |
| 109503 | 35 | eulogy | 4 | 9 | 352 | 78.9 | 5 | – | 23 | 0.23 | hopeless | 50 |
| 109503 | 36 | suburb | 4 | 4 | 1100 | 64.3 | 18 | – | 8 | 0.08 | hopeless | 18 |
| 109505 | 55 | eulogy | 4 | 5 | 787 | 40.0 | 20 | – | 41 | 0.41 | hopeless | 59 |
| 109505 | 84 | eulogy | 4 | 2 | 1029 | 0 | ∞ | – | 18 | 0.18 | floor | 20 |
| 109505 | 91 | eater | 4 | 7 | 895 | 24.3 | 37 | – | 10 | 0.10 | floor | 107 |
| 109505 | 105 | congregation | 4 | 5 | 706 | 67.6 | 11 | – | 45 | 0.45 | hopeless | 19 |
| 109505 | 105 | influencer | 4 | 7 | 655 | 39.7 | 17 | – | 57 | 0.57 | hopeless | 34 |
| 109505 | 118 | network_note | 5 | 8 | **95** | 119.0 | **1** | **Y** | 50 | 0.50 | hopeless | 70 |
| 109507 | 126 | reunion | 4 | 6 | 1163 | 25.7 | 46 | – | 10 | 0.10 | floor | 100 |
| 109507 | 145 | eater | 4 | 2 | 1023 | 19.0 | 54 | – | 16 | 0.16 | floor | 58 |
| 109508 | 50 | reunion | 4 | 3 | 1253 | 23.7 | 53 | – | 10 | 0.10 | floor | 81 |
| 109508 | 111 | cancellation | 5 | 6 | 1012 | 117.5 | 9 | – | 23 | 0.23 | hopeless | 82 |
| 109508 | 112 | suburb | 4 | 7 | 950 | 65.7 | 15 | – | 46 | 0.46 | hopeless | 42 |
| 109508 | 113 | strike | 4 | 3 | 977 | 9.3 | 105 | – | 6 | 0.06 | floor | 63 |
| 109508 | 119 | eulogy | 4 | 3 | 916 | 0 | ∞ | – | 20 | 0.20 | floor | 39 |

Within one round: **1/20 (5.0%)**. Within five rounds: 2/18 finite
(the sharpest case + 109503 d35 Eulogy at 5 rounds).

## Distributions

- Lead HP at flee: **median 19, mean 23.7, range 5–57** (n=20). The
  typical flee happens with the lead at about a fifth of max HP.
  Split by variant: floor flees median 10 HP (range 5–20, n=9);
  hopeless flees median 39 HP (range 8–57, n=11). The floor is what
  it sounds like — the lead is nearly down. The hopeless flee fires
  at far healthier HP: it is a judgment, not a collapse.
- Monster HP remaining at flee: **median 963.5, mean 894.7, range
  95–1253** (n=20). 19/20 flees leave the monster above 350 HP.
- Rounds-to-kill at the meeting's own rate: **median 19 (finite,
  n=18), range 1–189**; 2 meetings infinite (dpr 0 — the two
  zero-damage Eulogy fights, which dealt nothing in 2–3 rounds).
- Flee variants: hopeless 11, floor 9, learn 0, committed-floor 0.
  No launched meeting withdrew to learn (fleeLearn false on all 20);
  no committed-finish floor fired.

## Correlations (n=20, Pearson r)

| Pair | r | Read |
|---|---|---|
| lead HP ~ monster HP remaining | **−0.64** | Strong negative: flees with a healthier lead happen when the monster is closer to death; flees at low lead HP happen with the monster nearly untouched. Two mechanisms, not one call: floor flees (low HP, any monster HP) vs hopeless flees (higher HP, monster worn down but the P4 race still lost). |
| lead HP ~ rounds | +0.45 | Longer fights end with a healthier lead — the fights that last are the ones dealing damage and surviving. |
| monster HP remaining ~ rounds | −0.64 | Partly mechanical: more rounds = more damage dealt = less monster left. Do not read as a flee trigger. |
| lead HP ~ dpr | +0.52 | Harder-hitting parties keep their lead healthier (shorter exposure, faster monster wear). |
| monster HP remaining ~ dpr | −0.57 | Partly mechanical (dpr is dealt/rounds; higher dpr eats the monster faster). |
| lead HP ~ rounds-to-kill | −0.57 | The closer the party is to a kill, the more lead HP remains at the flee — the hopeless flee fires *despite* a healthy lead, never because the lead is the only thing left standing. |

What the flee call correlates with is the lead's survival, not the
kill's proximity: the only strong relationships run through lead HP,
and the monster's remaining HP never enters the engine's decision
(see Mechanism). The correlations are descriptive on n=20; the
mechanism below is the causal claim, and it rests on code, not on r.

## Second sample — fightcap-recheck (partial, never pooled)

The recheck corpus (seeds 110101–110108) carries mHpStart / mDealt /
rounds / outcome, so rounds-to-kill IS computable — but its logs are
truncated before the flee decision (the recorder gap the basedmg
driver fixed) and it carries no `fleeHpFrac` and no fighters snapshot,
so lead HP at flee is NOT recoverable there. Reported as a partial
second sample only:

| leg | meeting | rounds | mHp rem | dpr | rtk | ≤1rd | lead HP |
|---|---|---|---|---|---|---|---|
| ctl | 110107 d49 congregation | 6 | 822 | 41.7 | 20 | – | unrecorded |
| arm | 110104 d68 congregation | 4 | 775 | 67.8 | 12 | – | unrecorded |
| arm | 110105 d81 algorithm | 13 | 317 | 57.1 | 6 | – | unrecorded |
| arm | 110105 d88 algorithm | 5 | 844 | 39.2 | 22 | – | unrecorded |
| arm | 110105 d90 strike | 4 | 967 | 44.8 | 22 | – | unrecorded |

None of the five is within one round of a kill (closest: 6 rounds).
Same shape as the primary corpus: flees end fights many rounds short
of a kill. The arm leg is the fightcap lever ON — flagged, not pooled.
(The analyzer parses a mid-fight HP from the truncated log as a
diagnostic only; it is never reported as the HP at flee.)

## Died comparison (7 vDie meetings, descriptive)

- Monster HP remaining at death: median **1059** (range 967–1298) —
  deaths also happen far from a kill.
- Lead HP at death: 0 on all 7 (death is 0 HP by definition).
- Rounds: 1–4. Deaths are fast: the lead is overwhelmed in the
  opening rounds (two are 1-round zero-damage Eulogy fights), while
  flees stretch to 9 rounds. The flee call is what keeps a bad opening
  from becoming a death — and what turns a winning grind into a retreat.

## Sense-test: four transcripts, read whole

**1. The sharpest case — 109505 d118, The Network Note (fled, 1 round
from a kill).** Ines (Rage, wb 12) opens; Tomas (wb 31) charges in
round 2, Daniyar (wb 44) round 3; Blooded 1.5× active. The trio lands
952 damage in 8 rounds. The monster sits at 95 HP after round 8 —
one more round at 119/round kills it. Ines is at 50 HP after the
round-8 hit and runs: "Ines sees how this ends — and runs while
running still works." A hurt leader pulling a winning party out?
No — read as a tripwire: she has 50 HP, the monster has 95, her party
dealt 119 last round. No human who can see those two numbers runs.
The line is honest about fear and wrong about the fight. (Mechanism
section: the live race says winning by 0.8 vs 5.7 rounds; the imagined
protection-4 race says hopeless.)

**2. The floor flee — 109501 d73, The Eater (fled at 5 HP).** Andrés
takes 36 in round 1 (52 left), lands one 11-damage strike, then takes
47 (5 left). Dale answers the shout — and Andrés runs anyway: "Dale
answered Andrés's shout, but Andrés is past holding — they run while
running still works." This one reads as a sensible human call: 5 HP
against a monster at 1036, two rounds in, nothing landed. The floor
flee is the believable flight the design intends.

**3. The long grind — 109503 d35, The Eulogy (fled at 23 HP, monster
at 352, 5 rounds from a kill).** Nine rounds. Jovan strikes every
round; Zoe lands 48/round from round 3; Pedro joins round 4. The
party's late rounds deal ~84/round; the monster's hits are 6–24. At
the end Jovan is at 23 HP and runs: "Jovan sees how this ends — and
runs while running still works." On live numbers this fight is a
coin-flip the party is marginally winning (kill in 4.5 rounds at
78.9/round; the lead drops in ~4.1 rounds at the live incoming rate
— and two healthy allies stand behind him). A human captain with two
fresh fighters and a monster at a third of its health does not call
this off. Tripwire again — the P4 read (see Mechanism) calls a
marginal win hopeless.

**4. The honest hopeless — 109508 d111, The Cancellation (fled at 23
HP, monster at 1012, 9 rounds from a kill).** Mara deals 93/round
herself (Blooded), her War Cry buys a round in round 4, field
medicine buys 20 HP in round 3 — and she still runs at 23 HP with the
monster at 1012. Live race: kill in 8.6 rounds, lead drops in ~1.7.
This flee reads as a sensible human call on ANY reading, live or
imagined: she is about to die and the monster is barely scratched.
The hopeless branch is not always wrong — it is wrong when the
party's real armor makes the imagined damage ~3× the real damage.

Sense verdict: 2 of the 4 read as tripwires (the two high-damage
fights), 2 as sensible (the 5-HP floor flee, the genuinely losing
race). The flee lines themselves are good writing — the defect is in
what the decision looks at, not in what it says.

## Mechanism (code-read, with a worked reconstruction)

`src/js/fieldFights.js`, situational morale (after the round's action
phase, round ≥ 2):

- `rtk = mlead.hp / vDpr` — rounds to drop the lead monster at the
  party's damage rate. This DOES read live monster HP (95 in the
  sharpest case) and live party damage (119/round).
- `rtd = vHpHypo / mDpr` — rounds until the villager drops, where
  `vHpHypo = vHpStart − rec.vTakenP4` and `mDpr = rec.vTakenP4 /
  round`. `vTakenP4` is the parallel total "as if protection were 4"
  (lines 1988–1993: each pre-armor hit, mitigated with
  `armorReduction(4, pierce)`). It never sees the lead's real armor.
- `hopeless = rtd < rtk * 0.85`; `winning = rtk <= rtd * 1.1`. If
  winning, the flee floor drops to 5% and the hopeless branches are
  skipped; if hopeless and no help remains, the party flees
  ("sees how this ends"). Separately, the bravery floor fires when
  `vHp / vHpMax < vBreak` (0.05–0.6 from bravery/temperament/morale
  curve; `fieldFights.js:1333–1381`) — the "past holding" line.
- Neither read looks at live monster HP remaining as a "how close is
  the kill" input: `rtk` carries it only divided by the party's rate,
  and it is compared against the imagined survival, not the live one.

The DOORFLEE2 comment (same file) names this exact failure mode for
door fights — a pinned quad "actually winning (monster 1–3 rounds
from death, three allies nearly untouched) reads as hopeless and
runs" because the imagined damage runs ~3× the real damage — and
holds the flee with a live-numbers re-read. That hold is (a) env-gated
(`DOORFLEE2=1`; default off), (b) door-only (pinned quads), and (c)
not enabled by the basedmg driver (no DOORFLEE2 in
`scripts/basedmg-driver-b.js`). On this corpus the P4 read had no
live-numbers guard anywhere — wild expedition fights included.

### Worked reconstruction — the sharpest case (estimate, not a corpus field)

`rec.vTakenP4` / `rec.vHpHypoLeft` are NOT copied into the driver rows,
so the imagined totals are reconstructed here from the code formula
and the log lines, not read from the corpus. `armorReduction(p, pierce)
= effP / (effP + 6)`, `effP = p × (1 − pierce)` (`src/js/game.js:14180`).
Network Note pierce 0.45; Ines armorP 37 → live reduction
20.35/26.35 ≈ 0.772; P4 reduction 2.2/8.2 ≈ 0.268.

Per hit, the log's "gear absorbs N" pins the pre-armor total to ±1
(absorbed = round(total × 0.772)), and the Blooded 0.75× on the
remainder confirms it (taken = round((total − absorbed) × 0.75)
matches all five hits: 10, 17, 16, 12, 15):

| round | absorbed | pre-armor total | P4-taken (×0.732) |
|---|---|---|---|
| 1 | 46 | 59–60 | 43–44 |
| 2 | 74 | 96 | 70 |
| 4 | 70 | 91 | 67 |
| 5 | 55 | 71 | 52 |
| 8 | 66 | 86 | 63 |

P4 total ≈ **295–296** over 8 rounds (live taken: 70). Imagined HP:
100 − 295 ≈ **−195**. Imagined survival: −195 / (295/8) < 0 rounds.
Live survival: 50 / (70/8) ≈ **5.7 rounds**. Kill: 95/119 ≈ **0.8
rounds**. Live race: winning (0.8 ≤ 5.7 × 1.1). Imagined race:
hopeless (−5.3 < 0.8 × 0.85). The engine fled a fight its own live
numbers called winning, on an imagined fight the lead had already
lost twice over. That is the whole finding in one fight — and the
corpus says it is the exception (1/20 within one round), not the rule:
most flees end fights that were genuinely far from a kill on any
reading.

## Wall numbers (this corpus, 8 seeds — restated from sim-basedmg-b)

- National standing: **0/8**. Full-seat wins: **0/8**. Wave 4 unlocked:
  8/8. Wave 5 unlocked: 4/8.
- Median survival: **142.5 days**. Villages lost: 5/8. All 8 seeds ended
  at regional standing (best 595; two seeds stalled at 199).
- Kill share 0/27 launched meetings; win share 0/8 seeds.
- The flee call is not the whole wall — 19/20 flees end fights that
  were far from a kill on live numbers too — but it is the last wall
  on the one fight the band came closest to winning, and the P4
  misread is a live lever for the next build arm (a live-numbers guard
  on the hopeless read, of the kind DOORFLEE2 already sketches for
  doors). This DIAG builds nothing; the arm that builds it is a
  separate decision.

## Lever played

None — DIAG only.

## Blanks filled / documented

- **`vTaken` is lead-only damage taken.** Verified: it equals the sum
  of the lead's logged hit lines in all 20 fled meetings (and the
  sharpest case: 10+17+16+12+15 = 70 = vTaken, while Tomas took 17
  and Daniyar 28 more). Any reading of vTaken as party damage is
  wrong; the analyzer reports it beside the log-derived lead HP, never
  as a substitute. (Candidate correction for the basedmg evidence,
  which does not define vTaken.)
- **Lead max HP is 100 on all 20 fled meetings** (leadHpAtFlee /
  fleeHpFrac = 100.0 exactly, every row). The cross-check in the
  analyzer enforces this; a future band with different max HP would
  still pass it (the check is "near an integer in [50, 150]", not
  "= 100").
- **Recheck lead HP is unrecoverable** — truncated logs, no
  fleeHpFrac, no fighters snapshot. The analyzer refuses to report
  the mid-fight HP from the truncated log as the HP at flee (it keeps
  it only as a diagnostic). Do not force the second sample further.
- **The P4 hypothetical totals are not in the corpus.** The driver
  rows do not carry `rec.vTakenP4`, `rec.vHpHypoLeft`,
  `rec.roundTotals`, or the shout snapshots — the imagined race at
  each flee can only be reconstructed (as in the worked example),
  never read off. A future driver that copies `vHpHypoLeft` +
  `vTakenP4` into the row would make this measurement direct.
- **No learn-first withdrawals among launched meetings.** fleeLearn
  is false on all 20; the learn exit exists in the engine but no
  launched party on this band used it. (fleeLearn/fleeWise DO fire on
  non-launched encounters in the same corpus — different population.)
- **Flee-variant split is 11 hopeless / 9 floor.** The floor flee is
  the believable one (median lead HP 10); the hopeless flee fires at
  a median 39 HP and is where the P4 misread lives.

## Incidents (infrastructure, not findings)

- Write flap active for the whole run (from ~20:35Z, still active at
  21:06Z): fresh-file writes and git ref writes refused (`git
  update-ref refs/heads/probe HEAD` fails; /tmp fresh-file creation
  fails via exec, leaving 0-byte files). Worktree registration
  (`sim-fleecall-b`) was retried with backoff throughout; all
  analysis was done read-only (analyzer + selftest + proof logic run
  from /tmp drafts against the frozen corpus, stdout only) and all
  files drafted via the file tool into /tmp/fleecall-draft/ pending a
  clear window. Nothing was committed yet at the time of writing;
  the prereg was frozen in text before judging and the analyzer's
  verdict is DIAG-GO on all four bars — the commit order (prereg
  first, then instrument, then evidence) is preserved on landing.
  If the run times out before the flap clears, the drafts in
  /tmp/fleecall-draft/ (prereg, analyzer, proof test, this evidence
  file) are the adoptable work — nothing in them needs re-deriving.

## Village assessment (plain words)

The villages on this band do not mostly lose winnable fights to the
flee call — that is the honest headline, and it matters: only one
fight in twenty was a kill the party walked away from. Most flees end
fights the party was genuinely losing or far from winning, with the
leader hurt and the monster still strong; the "past holding" flee at
5 or 10 HP is exactly the believable flight the game wants. But the
one fight the band came closest to winning — the full Cooper shape, a
raging leader, a blessed village, three well-armed fighters, eight
rounds, the monster at 95 health — ended with the party running one
round short, because the call that decides whether to run judges the
fight as if the leader wore paper armor instead of the real armor she
was wearing. The game already knows this failure mode: its own code
comment describes it for door fights and sketches the fix. The next
step is a build arm, not another measurement: give the hopeless call
the same live-numbers second look the door hold already imagines, and
re-measure on this band.

## Metric review

- **Within-one-round, denominator 20:** the two dpr=0 meetings count
  as NOT within one round (at their own rate they never kill the
  monster). That is the conservative reading and it is frozen in the
  prereg; the alternative (denominator 18 finite only) would give
  1/18 = 5.6% — the same story either way.
- **Ceiled rounds-to-kill:** the median (19) is on ceiled rounds; the
  unceiled median is 18.5. The ceiling is the honest unit (a fight
  ends in whole rounds); both are within a rounding of each other.
- **Correlations are descriptive, n=20:** two pairs are partly
  mechanical (monster HP remaining falls with rounds by construction;
  dpr is dealt/rounds). The causal claim rests on the code read +
  the worked reconstruction, not on r — and the evidence says so
  where the correlations are reported.
- **The share has no threshold by design:** B3 requires the share to
  be stated with its denominator, not to clear a bar. A DIAG-GO here
  means "measured cleanly", not "the flee call is fine" — the
  sense-test and mechanism sections carry the judgment.
- **Instrument limits:** lead HP is log-derived (not a corpus field)
  — but it cross-checks exactly against fleeHpFrac on all 20 rows,
  and the live staged fight in the proof test reproduces the engine's
  own fleeHpFrac × 100 exactly (41 = 41). The P4 reconstruction is an
  estimate for one fight, labeled as such; the corpus cannot support
  a per-meeting P4 table (see Blanks).
- **Metric for the NEXT run:** if a build arm lands a live-numbers
  guard on the hopeless read, the metric to re-measure is the same
  within-one-round share plus the hopeless-flee count on this band —
  the guard should move hopeless flees at high lead HP, not floor
  flees at 5–10 HP. That split (11/9) is the baseline.
