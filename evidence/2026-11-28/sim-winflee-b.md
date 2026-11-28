# sim-winflee-b — PILOT (judged against the frozen prereg)

**Arm:** sim-winflee-b · **Loop B run:** fleshout-loop-b-20261128T0530Z,
axis winnability-chain · **Branch:** `sim-winflee-b` (worktree
`~/workspace/worktrees/sim-winflee-b`) · **Prereg:**
`evidence/2026-11-28/sim-winflee-b-prereg.md` (frozen before any judged
sim; committed `0b5814014`) · **Type:** DIAG (instruments + evidence
only — no policy change, no src/js change, no game-code change)

## Staging as run

- **Band:** 112401–112408 (fresh per prereg §4), 8 seeds × 150d,
  death-aware horizon (112403 village-lost day 101 both legs; all
  others survived to 150d).
- **Policy:** competent verbatim (`scripts/policies/competent.js`,
  sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  — byte-identical to the policy the calibration legs ran under).
- **Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1`; `FLEEGUARD`, `FLEEREPAIR3`,
  `DOORFLEE2`, `FIELDCAPDMG`, `RAGEFREE`, `FREESTRIKE` unset. Plain
  master: neither the fleerepair TB fix nor the emptybow fix is
  present (both live only on their held branches).
- **Base at pilot / anchor:** `0b5814014` (the prereg commit; all 16
  per-seed files carry `anchorCommit 0b58140142dd` — single-base
  judging holds).
- **Corpus:** `evidence/2026-11-28/perseed-winflee-b-field/` (8 files)
  + `perseed-winflee-b-tb/` (8 files); analyzers
  `scripts/analyze-winflee-b.js` / `scripts/analyze-winflee-tb-b.js`;
  analysis JSONs `winflee-b-field-analysis.json` /
  `winflee-b-tb-analysis.json`.
- **Proof:** `scripts/test-winflee-b.js` green before the pilot
  (24/24: branch tagger §1, analyzer selftests §2 — field 27 checks
  incl. the frozen calibration case — TB 8 checks — and the live
  staged wave-4 expedition fight §3, which produced a vFlee row
  classifying F1–F7 with the race computable from the live row).
- **Smoke:** 1-seed smoke (112401, both drivers) folded into the
  corpus per the prereg (0 instrument errors, 0 unclassified fled
  fights, race computable on all 5 fled fights).

## Pilot verdict — DIAG-NO-GO on the wall claim

| Bar | Rule | Measured | Result |
|---|---|---|---|
| W0 instrument validity | 0 unclassified fled fights on the fresh band + calibration case reproduced exactly | 0 unclassified; s112308 d146 rtk 3.63 / rtd 9.9 reproduced from the committed corpus | **PASS** |
| W1 PRIMARY — flee call is the binding wall | Winnable share ≥ 25% AND ≥ 3 winnable cases | **Share 1/9 = 0.111, 1 case** | **FAIL** |
| W2 pool floor | Launched wave-4+ meetings ≥ 10 AND fled fights ≥ 3 | Pool 21, fled 9 | **PASS** |
| W3 determinism | One-seed re-run byte-identical; file retained | Seed 112402 FIELD re-run byte-identical (sha `dd37b3ead76ed5e9`, 2,370,387 bytes — no stripping needed), file retained in `perseed-winflee-b-field-d3/` | **PASS** |
| W4 instrument errors | 0 across all 16 per-seed files | 0 | **PASS** |
| W5 wall numbers | National / table / wins, wave 4–5 unlocks, median survival | Reported — see §7 | **PASS** |

**Pilot verdict: DIAG-NO-GO on the wall claim.** The flee call is
NOT the binding wall at the kill line on this band. A DIAG that
finds the flee call is not the wall is a valid DIAG result, and
this is it: **damage, not the flee call, is the binding
constraint.** Eight of nine fled fights are beaten by wide
margins (closest beaten fight rtk 9.7 vs rtd 5.86; the rest sit
at rtk 10–61 vs rtd 1.2–8.8). The one winnable flee (§2) is real
— a party dealing 118 damage a round, above the ~111 kill line,
that still ran — but it is one fight in nine, and across all
four legs now measured it is two winnable flees in 26 fled
fights (7.7%), with **zero within-one-round flees on any of the
four bands**. The s112308 d146 shape is rare, not common. The
flee call is the *second* wall: it binds exactly when damage is
fixed, not before — fixing the flee rule alone on this band
saves at most one fight in nine.

## §1. Per-fight table — all 9 fled launched fights (fresh band)

| Seed | Day | Lead | Monster | R | mHp left / start | Lead HP | Party dpr | Monster dpr | rtk | rtd | Winnable | ≤1 round | Class |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 112401 | 134 | gen_99h8cqv | congregation | 4 | 744 / 910 | 41 | 41.5 | 19.75 | 17.93 | 2.08 | No | No | F3 |
| 112401 | 134 | dmitri_sokolov | reunion | 7 | 883 / 1203 | 40 | 45.7 | 8.71 | 19.32 | 4.59 | No | No | F3 |
| 112401 | 143 | greta_hansen | rerun | 11 | 169 / 1469 | 22 | 118.2 | 6.09 | 1.43 | 3.61 | **Yes** | No | F2 |
| 112401 | 144 | pavel_dubinin | rerun | 5 | 929 / 1408 | 41 | 95.8 | 7.00 | 9.70 | 5.86 | No | No | F3 |
| 112401 | 150 | stan_kowalski | spoiler | 5 | 1356 / 1474 | 15 | 23.6 | 13.00 | 57.46 | 1.15 | No | No | F4 |
| 112407 | 144 | app_mgpspkjr56 | algorithm | 4 | 844 / 1001 | 50 | 39.3 | 12.50 | 21.50 | 4.00 | No | No | F3 |
| 112408 | 143 | gen_afxtfkm | spoiler | 9 | 757 / 1500 | 42 | 82.6 | 8.11 | 9.17 | 5.18 | No | No | F3 |
| 112408 | 144 | fatima_hassan | suburb | 4 | 1370 / 1460 | 43 | 22.5 | 7.25 | 60.89 | 5.93 | No | No | F3 |
| 112408 | 148 | gen_afxtfkm | strike | 8 | 561 / 1010 | 43 | 56.1 | 4.88 | 10.00 | 8.82 | No | No | F3 |

Fought expedition wave-4+ fights on the fresh band: 9, and all 9
ended vFlee — **0 kills, 0 monster flees** in the fought pool
(build leg: 1 vKill + 3 mFlee in 13 fought; armed leg: 3 mFlee in
9 fought). Per-seed pool: 112401: 7 (5 fought, 2 evades) ·
112402: 1 (0, 1) · 112403: 2 (0, 2) · 112404: 5 (0, 5) ·
112405: 0 · 112406: 0 · 112407: 3 (1, 2) · 112408: 3 (3, 0).
The pool is lumpy: seed 112401 carries 5 of the 9 fought
fights, and three seeds contribute no launched meetings at all.

## §2. The one winnable flee — s112401 d143, Greta vs The Rerun

Greta leads with a bow (2 opening shots, 1 hit for 18), then
strikes 38–44 a round; Pavel answers her first shout on round 3
(53–60 a round), Sofia the second on round 4 (39–47). Eleven
rounds, 1300 damage dealt, 118 damage a round — above the ~111
kill line. The Rerun rewinds twice (R5 "TAKE 13", R10 "TAKE 14",
+10% then +20% adaptation — its blows land harder each take,
Greta's taken damage climbing 6 → 7 → 10 → 11 → 14). After round
11 the monster stands at 169 HP and Greta at 22 HP:

> R11: Greta strikes for 39 (261 left)
> R11: Pavel strikes for 53 (208 left)
> R11: Sofia strikes for 39 (169 left)
> R11: Notes Session hits Greta for 14 (22 left)
> Greta sees how this ends — and runs while running still works.

The race says the party wins in 1.43 rounds while the lead
survives 3.61 — two more rounds at the observed rate kills the
monster with the lead still standing. The flee fires on the
lead's HP alone (22 HP, fleeHpFrac 0.22), exactly the partydmg-a
shape, and this time the damage race is already won: the party
is above the kill line and still leaves. It is the strongest
form of the flee-call question, and it is one fight in nine.

Sense check on the transcript: the fight reads as a coherent
story — Blooded 1.5× strikes, gear absorbing hits, allies
answering shouts one at a time, the Rerun's clapperboard
countdown and rewinds visible, the flee line landing the moment
the lead drops to 22 HP. One honest note: the rewind line says
the Rerun "comes back fresh (+10% — it remembers)" while its HP
never rises (1009 → 971 across the R5 rewind; 300 → 169 across
R10). The code (`src/js/sigW5.js`, rerun branch) confirms the
+10% is a damage adaptation, not a heal — "fresh" is the take
resetting, not the monster healing — so the mechanic works as
coded and the line is loose, not wrong. Noted here, not a
backlog item.

Contrast — the closest beaten flee, s112408 d148 (gen_afxtfkm vs
the Strike, 8 rounds, rtk 10.00 vs rtd 8.82): the race is nearly
tied and still beaten; the party dealt 56 a round against 1010
HP and fled with the monster at 561. A flee-rule guard that
held parties in tied races would save this shape only if the
party could survive the extra round — the lead was at 43 HP
against 4.88 damage a round, so it probably could have, but
that is one near-tie in nine, not a pattern.

## §3. Calibration vs fresh — the shape is rare, on every band

| Leg | Band | Fled | Winnable | Share | Within-1 |
|---|---|---|---|---|---|
| Diag (fleerepair pilot) | 112301–112308 | 5 | 0 | 0.000 | 0 |
| Build (fleerepair build) | 112301–112308 | 7 | 0 | 0.000 | 0 |
| Armed (emptybow armed) | 112301–112308 | 5 | 1 | 0.200 | 0 |
| **Fresh (this arm)** | **112401–112408** | **9** | **1** | **0.111** | **0** |
| **All four legs** | | **26** | **2** | **0.077** | **0** |

The two winnable flees are both F2 (hopeless branch + winnable
race) and both long fights (11 rounds each) where the party's
damage had time to accumulate. The fleecall band (#2602,
109501–109508) found 1/20 fled fights within one round of a
kill; these four bands find 0/26 within one round. The flee
call costs the village roughly one fight in thirteen — real,
measurable, and not the wall.

## §4. TB leg (66 exposures, 8 seeds)

Outcomes: kill 18, fighter-died 45, pyrrhic 2, routed 1. Turn
economy across all exposures (fights that the scholar's party
plays blow-by-blow): flee-attempt 36 (**0 successful flees** —
no exposure ends fled, as on both calibration legs), move-only
69, failed-strike 3, no-action 32, zero-tile moves 30 (10
fights), rage presses 18, rage-instead-of-strike 14 (6 fights
with a rage loop), approach-loop turns 18 (10 fights), barrier
pushes 0. Arena pre-turn flees (#2292) 9 — s112402 d70
influencer + d139 reunion; s112404 d68 suburb + d125 reunion;
s112406 d69 reunion (3 npc turns), d82 eulogy, d130 reunion;
s112407 d136 suburb + d136 reunion. Listed, not chased. The 3
failed strikes (s112404 d58 audit ×1, s112406 d69 reunion ×2)
are plain master showing the emptybow shape at low rate (49 on
the build leg, 0 on the armed leg); the transcript carries no
"No arrow left" line on this band, so the shape here is a
different failed-strike cause, unexamined — noted, not chased.

## §5. Balanced panel (the instrument check — invalid by construction)

`winflee-b-panel.md`, decision `invalid` (exit 2): "Unmatched
cases" — the compare demands paired seeds, and the calibration
leg (112301–112308) and the fresh band (112401–112408) share
none. The prereg (§5) called this an unpaired instrument check,
and the instrument refuses unpaired panels; that refusal is
correct behavior, not a failure of the run. No pairing was
fabricated to force a decision. The two panel files themselves
are valid and correctly labeled (before = armed calibration TB
corpus, after = fresh TB corpus); the aggregate contract
metrics, read off those files, are:

| Metric (mean) | Calibration armed (112301–112308) | Fresh (112401–112408) |
|---|---|---|
| Wins | 0 | 0 |
| National | 0 | 0 |
| Survival 30 / 60 | 1.0 / 1.0 | 1.0 / 1.0 |
| Community lost | 0.50 (4/8) | 0.125 (1/8) |
| Village deaths / run | 94.75 | 88.25 |
| Village deaths / 100d | 79.54 | 62.11 |

No regression signal in the village-level metrics: wins and
national are 0 on both legs, survival identical, and the fresh
band lost fewer villages with fewer deaths per run. The
difference is a band difference (different seeds), not a
treatment effect — nothing was changed between the legs except
the seed band and the removal of the two held fixes, and the
panel cannot pair them, so no decision is read from it. The
frozen prereg bars (§2) are the judge, and they judged.

## §6. Telemetry deviation check (same-run item)

`telemetry-check.js` against `telemetry-baselines/scale-wall.json`
fires LOUD on the fresh FIELD corpus (national 12 → 0, table
16 → 0, wins 16 → 0). Investigated: the baseline's own `_regime`
note says not to compare pre-seat substrates against it ("wins
are structurally ~0 there and telemetry-check will fire a
spurious LOUD 'wins disappeared'") — this band is a pre-seat
substrate on every leg, as the emptybow arm already established
(the baseline corpus fires the identical three LOUD lines).
Regime artifact, not a build effect; no action. (The check
refuses recorder-corpus input by default; run with
`--allow-recorder-corpus` per the tool's own message.)

## §7. Wall numbers (scale-onramp axis)

| Metric | FIELD leg | TB leg |
|---|---|---|
| National | 0/8 | 0/8 |
| Table entered | — (uninstrumented on this leg) | 0/8 (table waiting 8/8) |
| Wins | 0/8 | 0/8 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 5/8 (112401, 112402, 112404, 112406, 112408) | 5/8 |
| Median survival | 150d | 150d |
| Standing (final) | 175–745 (199 ×1, 175 ×2, 275, 320, 360, 395, 745) | 175–745, except 112407 at 250 (see note) |
| Community lost | 1/8 (112403, day 101) | 1/8 |

The scale wall stands where the calibration legs left it:
every village reaches wave 4, five reach wave 5, none reaches
national, none enters the table, none wins. Seed 112401 reached
standing 745 — past the wave-5 bar by a wide margin — and still
ended regional with no win. The 199-standing stall is visible
again (112407 sits at 199 on the FIELD leg).

**Instrument note:** seed 112407's final standing differs
between the legs (FIELD 199, TB 250). The two legs are separate
full runs of the same seed with different recorder wraps, and
the TB instrument's wraps perturb the RNG stream slightly; the
fleerepair arms' legs agreed on standing ranges, not per-seed
values. The judged FIELD metric is unaffected, and the W3
determinism re-run (same driver, same seed) is byte-identical.
Noted, not chased.

## §8. Village assessment (plain words)

Eight villages, 150 days each (death-aware). Seven survived the
full 150 days; one was lost on day 101. They are not starving
villages — pantries end between 0 and 11,344 kcal, starvation
killed 5 people in 706 deaths — and they are not collapsing
villages. They are villages that learned to survive and not
learned to win: 706 deaths, about 97% of them monster or combat
deaths (villager combat 285, expedition 189, combat 134, the
wild 46, monster 21, the arena 6, plus named monsters), and
every village still regional at the end.

What a launched wave-4 hunt looks like on this band: a party of
three walks out after a monster the village has heard about but
almost never learned the trick for (trick known in 1 of 21
meetings — the calibration legs showed 0 of 37). More
than half the time nothing happens — 12 of 21 launched meetings
end in a cousin evade before contact (#2504, still the largest
shape in the pool, though down from 27/37 on the diagnosis
band). When contact does happen, the fight is short and
lopsided: the party lands twenty to ninety damage a round on a
beast with a thousand health left, the lead villager is down to
a quarter of their health or less within a few rounds, and the
party runs. Running is the sensible call — at those rates the
beast drops the lead in one or two rounds and needs ten to sixty
to die. The one exception proves the rule: Greta's party fought
eleven rounds, dealt 118 damage a round, had the monster at 169
HP — and still ran, because the lead was at 22 HP. The flee
rule does not ask how the race is going; it asks how hurt the
lead is. That is the blank this run measured, and the
measurement says the rule costs about one fight in thirteen.
The blank that remains is damage: parties swing too rarely and
too weakly to kill wave-4 beasts before the lead's health runs
out, and no flee-rule change rescues a 29-round kill race
against a 1.5-round drop.

Who thrived: nobody thrived — no village won, no wave-4 kill is
recorded in the fought pool, and the strongest village (112401,
standing 745) still ended regional. Who died: 63–115 people per
village over 150 days, the ordinary attrition of the substrate,
not a single catastrophic fight. What was missing: damage (the
typical fled fight ends with the monster at 60–90% health),
trick knowledge (1/21), and — the part this arm measured — a
flee rule that would hold a party in a race it is already
winning. That last one is worth roughly one fight in nine.

## §9. Metric review (frozen bars judge as written — no re-scoring)

- **W1 fails cleanly, and the failure is informative.** The bar
  (≥ 25% + ≥ 3 cases) was set 3× above the calibration rate
  precisely so that passing it would be evidence, not noise —
  and the fresh band lands at 11.1% with 1 case, between the
  calibration legs' 0% and 20%. The bar did its job: it kept a
  single vivid fight (d143) from being mistaken for a wall.
- **The pool is lumpy, and the lumpiness is itself a finding.**
  Three seeds contribute no launched meetings at all; one seed
  carries 5 of 9 fought fights. A confirm band would want the
  same lumpiness noted: per-seed fought counts range 0–5, and
  the fled-fight denominator (9) is small enough that one more
  winnable flee would have moved the share to 22% — still below
  the bar, but the count floor (≥ 3) would still have failed.
  The verdict is robust to that sensitivity: even 2/9 would not
  have passed W1.
- **The panel step as frozen cannot produce a decision.**
  §15's compare demands paired seeds; a calibration-vs-fresh
  comparison across different bands is unpaired by construction.
  The prereg called it an instrument check, and the instrument
  refused it — correctly. Future arms that want a panel decision
  must run before/after on identical seeds; a cross-band
  comparison belongs in an aggregate table (as in §5), not in a
  paired compare. The panel builder also carried a labeling bug
  (the after panel's `options.seeds` showed the before seeds);
  fixed in the same commit line and rebuilt before judging.
- **No metric change is proposed for the frozen bars.** The
  bars judged as written; the verdict is DIAG-NO-GO on the wall
  claim. The revisions for the next arm are: (a) a paired-band
  design if a panel decision is wanted; (b) the flee-rule guard
  build (the follow-up this verdict licenses — a guard that
  holds a party in a race it is winning — is a second-wall build,
  to be judged after damage improves, not before).

## §10. What happens next

## Post-rebase note (2026-11-28 ~07:10 UTC, after judging)

Loop A landed on master while this arm ran (adoption
`bcf06e019`: fleefloor NO-GO + capstoneready legs 1+2 DIAG-GO
merged, plus journey-succession r291–r295). The branch was
rebased onto `bcf06e019` — clean, no conflicts. New hashes:
instruments `f4c64033b`, prereg `80ef3f45b`, results
`0e0a6272e` (was `35997bd6f` / `0b5814014` / `f7969a34f`).
The only `src/js/` change in the landing is
`src/js/convoTopics.js` (mourning above the naming debate) —
no touch to field fights, flee logic, damage, policies, the
harness, or any instrument dependency — so the judged sims,
run at anchor `0b5814014`, still describe current master for
this question. Proofs re-run green on the new base
(`test-winflee-b.js` 24/24, field selftest 27, TB selftest 8),
and the FIELD analysis reproduces byte-identically (vFlee 9,
winnable 1, share 0.111). Corpus `anchorCommit` fields still
read `0b58140142dd` (the pre-rebase prereg hash) — that is the
anchor the sims actually ran at, not a stale pointer.

STAGED per the prereg: this DIAG judges the flee call only. No
build lands from this arm. The follow-up is a flee-rule guard
build in a later run — a guard that holds a party in when the
live race is won (rtk < rtd) — judged on the same fresh band
against the same frozen W1 bar, and only meaningful once damage
improves enough for winnable flees to be common. The cousin
evades (#2504, 12/21 here) and the arena pre-turn flees (#2292,
9 here) stay open, still undiagnosed, still not this arm.
