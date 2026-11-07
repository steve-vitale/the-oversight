# sim-bypass-b — EVIDENCE (bypass-damage mitigation lever)

- Run: `fleshout-loop-b-20261106T2300Z`, arm sim-bypass-b, axis scale-onramp /
  winnability chain (Steve 2026-11-03 re-point)
- **Verdict: NO-GO — lever KILLED.** Primary 10.5 < 12. Cap reverted;
  measurement tooling + corpus + evidence kept (see §7).
- Adoption: the 2300Z run was killed mid-run by the main session; its
  coordinator never wrote evidence. The pilot sweep had COMPLETED (16 valid
  JSON files, seeds 88001–88008 × baseline/armed) but the analyzer never
  ran. This file is the recovery: rebase, proof re-run, analyzer run, hand
  recomputation, verdict. No new sims were run — the pilot corpus is the
  whole measurement.
- Base: prereg `4a60f7f56`; rebased onto explicit master SHA
  `eabf00dbae92c8508e2799a03b6918eaa244e517` (sim-grind-a evidence+corpus;
  zero file overlap — rebase clean, no conflicts). Rebased tip
  `bab86497d`; proof re-run green 39/39 on the rebased tip before analysis.
- Revert commit (branch tip): `053bd3ed3012125334534e31816e33a4eca40b48`
  — game code byte-identical to master `eabf00dba`, proof 39/39 green
  post-revert, worktree clean after the commit.
- Policy: competent verbatim, BOTH legs (game-code lever; no policy file).
- Horizon: 150d death-aware. Seeds: 88001–88008, identical on both legs.
- Corpus: `evidence/2026-11-06/perseed-bypass-b/` (16 files). Leg anchors
  recorded in the files: baseline `1c70f2f3817f` (prereg commit, pre-cap
  code), armed `b4e9a8d8a556` (build commit, cap code). The leg difference
  is confirmed by the hit log itself (below), not only by the anchors.
- Instruments: `scripts/bypass-instrument-20261106.js`,
  `scripts/bypass-driver-20261106.js`,
  `scripts/bypass-analyze-20261106.js`. Proof:
  `scripts/test-bypass-20261106.js` (rewritten post-revert to assert the
  cap is ABSENT; green 39/39 — see §7).
- Prereg: `evidence/2026-11-06/sim-bypass-b-prereg.md` (binding).

## The lever (what was played)

A scripted lethal hit could take at most half the target's max HP in one
blow. In `Game.tbDamage`, after ALL mitigation and before HP removal, a hit
flagged `opts.bypassDamage` was capped at `max(1, floor(0.5 * maxHp))`.
Only two call sites flagged it: the Eulogy's narrated ending (9999, every
monster turn once the 5 verses run out) and the Finale's title card
([150,200]). No wave-4 band change, no gate/price/deed change, no new
system. The doom still kills within two firings; the cap only removed the
one-shot from full health.

## Before / after (identical seeds, 8 + 8)

Analyzer: `node scripts/bypass-analyze-20261106.js
evidence/2026-11-06/perseed-bypass-b/` — legs split by `run.run`
(bypass-baseline / bypass-armed), verified real. Classification complete:
0 unclassified, 0 instrument errors, traces present 67/67 baseline,
64/64 armed.

| Metric | Baseline | Armed | Prereg bar | Verdict |
|---|---|---|---|---|
| **PRIMARY: median rounds, LOST wave-4 TB fights** | **10** (n=49) | **10.5** (n=46) | **≥ 12** | **MISS** |
| Median rounds, lost wave-4-only fights | 9.0 (n=44) | 9 (n=41) | ≥ 12 | MISS |
| Median rounds, ALL traced w4+ fights (analyzer) | 10 | 11 | — | not the primary |
| Wave-4 TB kill rate (matched kills / traced) | 16/67 = 23.9% | 16/64 = 25.0% | ≥ 10% | HOLD |
| Wave-4 log kills / traced fights | 17/67 | 17/64 | — | — |
| Median survival (village days) | 117 | 117 | ≥ 0.8× baseline (93.6) | HOLD |
| Starvation deaths | 6 | 6 | ≤ baseline + 2 (8) | HOLD |
| Scholar deaths per wave-4 log kill | 77/17 ≈ 4.5 | 75/17 ≈ 4.4 | reported | — |
| Traced wave-4+ TB fights | 67 | 64 | — | — |
| Endings: scholar-death / kill / rout | 49 / 16 / 2 | 46 / 16 / 2 | — | — |
| Median monster applied / round, lost fights | 14 | 15 | — | — |
| Median player dmg / round, all traces | 34 | 36 | — | — |

Hand recomputation of the primary (the binding cross-check): median
`rounds` over traces with ending `scholar-death`, wave ≥ 4, read straight
from the corpus — baseline sorted rounds
[4,5,6×13,7,7,8,8,9×5,10,11×3,12×3,13,14,15,15,16×3,17,17,18,19,22×3,24,
28,29,49] → median **10**; armed
[4,5,6×8,7×4,8,8,9×5,10,11×3,12×3,13,14,15,16×3,17,17,18,19,22×3,24,28,
29,49] → median **10.5**. Matches the analyzer's leg counts (49/46 lost)
and confirms the split. The analyzer's own `medianRounds` (10 → 11) is
over ALL traces, kills included — it is NOT the primary (see Metric
review).

## Doom-hit accounting (what the cap actually did)

True doom hits = `req` 9999, source 'the narrated ending', target maxHp 100
(the scholar). All of them are Eulogy fights, rounds 6–7.

- Baseline: 7 of 49 lost fights contain a doom hit; 7 doom hits total,
  applied 1307–3352 (median ~1695). The doom one-shots from full health.
- Armed: 5 of 46 lost fights contain a doom hit; 7 doom hits total, ALL
  capped at exactly **50**. The cap bit 7 times, every time it could.
- Eulogy fights, lost only — rounds before/after: baseline 7 fights,
  rounds 6,6,6,6,6,7,6 → median **6**; armed 5 fights, rounds 6,7,7,7,6
  → median **7**. Exactly the prereg's prediction (+1 round on doom
  fights): two armed Eulogy fights (88002 day 116, day 124) took a second
  capped doom on round 7 and died on round 7 anyway. One armed fight
  (88001 day 108) survived its capped doom at round 6 and died the same
  round on ordinary damage.
- The Finale card half of the cap is UNMEASURED: no Finale fight occurs
  anywhere in this corpus (wave 5 faced only on seed 88007, and only the
  Editor / Network Note / Timeslot). The cap's card effect was never
  observed in play.
- Filter warning: the prereg's capped-hit definition ("req ≥100 with
  dmg ≤ 50") catches 2 extra hits per leg that are NOT cap bites — the
  Editor's "editor's Cut" (req 106/109 → dmg 42/39 through armor) on
  88007 days 95/119, identical on both legs. The honest cap-bite count
  is req 9999 → dmg exactly 50: 0 baseline, 7 armed. The other "≥100
  hits" in the corpus are player-side damage (the scholar hitting a
  850–1500 HP monster for 100–185) — big numbers on the wrong side of
  the ledger, not doom.
- Why the median barely moved: the cap touches only the 7 doom fights.
  The other 39–42 lost fights die on ordinary damage (median 14–15
  applied/round, p90 33). A doom fight gains ~1 round; the median over
  46 fights gains half a round. This is precisely the ceiling the prereg
  sized before the pilot (7 → 7 or 8 on the old numbers).

## The scale wall (reported every run)

| | Baseline | Armed |
|---|---|---|
| National / table / wins | 0 / 0 / 0 of 8 | 0 / 0 / 0 of 8 |
| Wave-4 unlocks / faced | 7 / 7 of 8 | 7 / 7 of 8 |
| Wave-5 unlocks / faced | 1 / 1 of 8 (88007) | 1 / 1 of 8 (88007) |
| Wave-4 log kills / wave-5 kills | 17 / 0 | 17 / 0 |
| Median survival | 117d | 117d |
| Village end: lost / survived to 150d | 5 / 3 | 5 / 3 |
| Readiness-5 days (≥2 living veterans) | 3 (all 88007) | 14 (88002: 11, 88007: 3) |
| Living wave-4 killers at end (all seeds) | 15 | 14 |
| Standing at end | 199 on 5 seeds, 260 (88007), 175, 75 | identical |

Five seeds sit at standing exactly **199** — one short of the wave-5 door
(t5 = 200), held by the readiness gate, not by standing. Only 88007
reached 260 and unlocked wave 5. The veterans bar is the hold: villages
bank wave-4 killers (15 living at end across 8 seeds) but rarely hold two
alive in one village at once — 88002 armed held two for 11 days mid-run,
then lost one. Nobody has banked two living wave-4 killers and sat; the
chain still binds at veterans → readiness-5 release.

## Field wave-4 fights (villagers, not the scholar)

Baseline 75 field rows: 49 fled, 13 evaded, 11 villager deaths, 1 kill, 1
monster fled. Armed 72 rows: 48 fled, 12 evaded, 8 villager deaths, 1
kill, 3 monster fled. Villagers meet wave-4 monsters in the field and
mostly run — two in three field meetings end in a flee, and roughly one
in seven ends in a villager death. Field wave-4 kills: 1 per leg. The cap
changed nothing here (it was never scoped to the field), and the field
numbers moved only by the noise of one seed's trajectory.

## Who drove the losses

Lost fights by monster — baseline → armed: Reunion 14 → 13, Eater 9 → 9,
Eulogy 7 → 5, Influencer 6 → 6, Suburb 4 → 4, Congregation 3 → 3, Editor
3 → 3, Algorithm 1 → 1, Network Note 1 → 1, Timeslot 1 → 1. The Reunion
owns the most lost fights (13–14 of ~46) at a flat 6 rounds — it kills
fast and the cap never touches it, because its damage is ordinary
(94–148 requested, 100–185 applied per hit), not scripted doom.
Kills by monster (armed): Strike 4, Suburb 3, Eater 3, Influencer 2,
Congregation 1, Audit 1, Algorithm 1, Eulogy 1.

Best-round composition (lost fights): median best round 40.5 armed (40
baseline) — about 4.5% of a typical 850–900 entry HP. The scholar deals
it alone (median scholar share 1.0); allies contributed in only 12/46
lost fights; an ability fired in the best round in only 3/46. The
sizing bound (best round every round + one 2.5× aimed strike) flips 17
of 46 lost fights armed — ceiling kill rate 51.6% (baseline 52.2%) —
but that bound assumes a repeatable best round the composition says does
not exist: a solo scholar's best round, once, is not a plan.

Death causes (fallen, all villagers): the wild 60 → 57, monster 25 → 22,
sickness 7 → 7, "a wound that wouldn't close" 7 → 7, starvation 6 → 6,
contest 5 → 6, the arena 5 → 5, combat 4 → 4, ambush 2 → 2, the night
1 → 1, lockjaw 1 → 1, dehydration 1 → 1, a stranger 4 → 4, named monsters
3 → 3. Total fallen 131 → 126. Nothing in the death ledger moved except
the ordinary churn of five fewer wild/monster deaths on the armed leg —
no new cause, no cause cured. The cap does not touch how villages die.

## Village assessment (plain words)

Eight villages, same eight stories twice. Seven of eight reach the
fourth wave; one (88005) dies at day 50 still on wave 3, and one (88007)
is the only village that ever sees wave 5. The typical village lives 117
days, loses five of its eight siblings' worth of people to the wild and
to monsters, banks a wave-4 killer or two, and then stalls: standing
frozen at 199, one short of the next door, waiting on a second living
veteran it never quite holds. The scholars who walk into a fourth-wave
fight die in it three times out of four — and when they die, they die
fast, in about ten rounds, to ordinary monster damage, not to the
storybook doom the cap was built for. The Eulogy's narrated ending did
kill seven scholars across the two legs, and the cap did exactly what it
promised for those seven: it gave them one more round, and then they died
anyway, because the monster was still there and still hitting for fifteen
a round and nobody in the fight could kill an 850-HP beast in one round.
The villages feel alive in the small ways — people linger by the fire,
gather deadfall, learn bark armor — and the sampled lines read coherent,
nothing robotic in the slice read. What is missing is not atmosphere; it
is staying power in a real fight. A fighter who survives a scripted
ending still has to survive the next ten ordinary swings, and nothing in
this lever helps with those.

## Verdict

**NO-GO. The lever is KILLED, per the prereg.** Armed median 10.5 < 12,
on both the wave-≥4 and the wave-==4 reading. All three secondaries hold
(kill rate 25.0% ≥ 10%, survival 117 ≥ 93.6, starvation 6 ≤ 8), but the
secondaries were guards, not the judge — the primary binds, and it
missed by 1.5 rounds after a mechanism that worked exactly as designed.
The cap is not broken; it is too small for the job. It bought one round
on seven fights and the median noticed half a round.

## §7 — What happened to the code

- The game-code cap is REVERTED: `src/js/game.js` (+23 lines removed),
  `src/js/sigW4.js` and `src/js/sigW5.js` (the `bypassDamage: true` flags
  removed) are back to master `eabf00dba`, byte-identical. No cap, no
  flags, no trace of the lever in the game.
- Kept, and committed on this branch: the prereg, the instrument, the
  driver, the analyzer (its leg-grouping and ±1-day join fixes are real
  and reusable — the survivaltime analyzer merged both legs into one
  bucket), this evidence file, and the 16-file pilot corpus.
- The proof test `scripts/test-bypass-20261106.js` was adjusted to the
  killed state (ragerepress precedent: proof green post-deletion). Its
  cap-behavior sections now assert the cap is ABSENT — a 9999 doom hit
  lands uncapped at 2409 and kills outright, the Finale card lands at
  82, the flag is a no-op, and zero `bypassDamage` occurrences remain in
  `src/js/`. The analyzer-fixture and live-driver sections are unchanged.
  Proof re-run green 39/39 after the revert (see commit line).
- Branch ready for the coordinator: land the tooling + corpus + evidence,
  or delete the branch — the game code carries nothing either way. Do NOT
  re-apply the cap; the ceiling is measured, and re-running it would
  re-prove the same +0.5.

## Metric review (§14 — binding metrics, judged as pre-registered)

- The primary was the right judge and it was judged as written: no
  re-scoring, no friendlier metric. The bar (12) was set from the
  survivaltime sizing, and the prereg itself called it "very likely OUT
  OF REACH" — the pilot confirmed that call, it did not overturn it.
  The metric did not prove wrong; the lever proved too small. No revision
  to the bar is proposed for this metric on this mechanism.
- What DID prove stale was the sizing anchor. The prereg sized the cap
  from survivaltime's armed leg (median 7, n=46 lost). This run's
  baseline leg, on current master, is already median 10 (n=49) with 67
  traced fights — survivaltime's baseline had 20 traced fights, 19 lost,
  median 6, 1 kill. The ground moved between the two runs' anchors
  (survivaltime baseline `53e4f884d2a2` → this run's base `4a60f7f56`,
  K=6 code): more villages reach wave 4 and kill there now, on BOTH
  legs. Cross-run medians are not comparable; the within-run
  seed-matched read (10 → 10.5) is the clean one. PROPOSAL FOR THE NEXT
  RUN: re-anchor sizing on the current run's own baseline leg, never on a
  prior arm's numbers, and record the anchor commits of both corpora
  beside any cross-run comparison.
- Instrument note (not a metric change): the analyzer's `medianRounds`
  is over ALL traces, kills included — the primary (lost-only median)
  lives only in the hand recomputation. Next run: add a lost-only median
  to the analyzer output so the primary is printed, not hand-derived.
- Instrument note: the naive capped-hit filter (req ≥100 with dmg ≤ 50)
  has false positives — the Editor's Cut through armor matches it on
  both legs. The honest cap-bite count is req 9999 → dmg exactly 50.
  Keep the strict definition in future doom accounting.
- Secondary note: the kill-rate secondary (≥10%) no longer
  discriminates on this band — the baseline itself clears it at 23.9%
  (survivaltime's baseline was 5.0%). A future arm that wants kill rate
  as a hold bar should re-base it on the current baseline leg first.

## The next blank (named, not built here)

**Ordinary damage / avoidance — the Reunion first.** Lost fights take
median 14–15 applied/round; reaching 12 rounds needs ~8.3/round, i.e.
roughly another halving of ordinary incoming damage, or the outgoing
damage to roughly double so fights end before the tenth round. The
Reunion owns 13–14 of 46 lost fights at a flat 6 rounds with ordinary
94–148 requested hits — it is the sharpest single target in the corpus.
Any next lever here must move the median ordinary hit, not the scripted
tail: damage reduction that bites at 35–95 requested, avoidance that
fires on ordinary swings, or outgoing damage that turns the scholar's
solo best round (median 40.5, ~4.5% of entry HP) into a repeatable
round. The Finale-card half of this lever stays unmeasured — a future
wave-5 arm inherits that question, not this one.

## Convergence state

- Axis scale-onramp / winnability chain: bypass-damage mitigation —
  **killed at pilot** (primary missed; mechanism ceiling measured).
- The arm's queue item in the Loop B re-point (arm-2 toggle / flee-repair
  / standing-on-gear-ready-seeds) is untouched by this adoption; this run
  recovered the dead 2300Z arm only.
