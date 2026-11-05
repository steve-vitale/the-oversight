# Finishing probe/build — NO-GO (arm sim-finishhold-b)

Run: fleshout-loop-b-20261105T0618Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's next blank #1 (finishing). Prereg:
`evidence/2026-11-05/sim-finishhold-b-prereg.md` (committed BEFORE
any judged sim). Instrument: `scripts/finishhold-instrument-20261105.js`
(secondkiller base + finishhold fields). Driver:
`scripts/finishhold-driver-20261105.js`. Analyzer:
`scripts/finishhold-analyze-20261105.js`. Proof:
`scripts/test-finishhold-20261105.js` 26/26 (re-run green after the
revert). Corpus: `evidence/2026-11-05/perseed-finishhold-b/` (16
files: 8 baseline + 8 armed, seeds 99161–99168, 150d, competent
policy verbatim).

## Verdict — NO-GO. Lever reverted, no trace in game code.

Focus fire (a mustered ally joins wild wave-3+ fights from round 1)
did what it was built to do mechanically and still failed the
pre-registered bar — and tripped the survival guardrail.

| | baseline | armed | bar |
|---|---|---|---|
| Wave-4 kill rate (matched kills / wild wave-4 fights) | 11/132 = 8.3% | 3/86 = 3.5% | armed ≥ 15% AND ≥ 3 kills |
| Wave-4 kills | 11 | 3 | ≥ 3 (met on count, failed on rate) |
| Median survival | 121d | 73d | not worse by > 10d — **FAILED (−48d)** |
| Field-fight party deaths (vDie) | 22 | 6 | not up by > 25% — passed (6 ≤ 27) |
| Field fights | 77 | 41 | — |
| Field damage fraction (median) | 2.1% | 9.9% | secondary |
| Field rounds (median) | 2 | 2 | secondary |
| Focus-fire fire rate (armed field fights) | 0/77 | 37/41 (90%) | secondary |
| Field kills | 1 | 0 | secondary |
| TB kills (matched) | 10 | 3 | secondary (lever does not touch TB) |
| Wall: wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wall: wave-4 unlocks / faced | 8/8 / 7/8 | 7/8 / 7/8 | — |
| Wall: wave-5 unlocks / faced | 0 / 0 | 0 / 0 | — |

Per-seed armed (fights / kills / days): 99161 22/0/80, 99162 9/0/63,
99163 7/1/78, 99164 20/1/121, 99165 0/0/54, 99166 4/0/71, 99167
17/1/75, 99168 7/0/60. Baseline per-seed: 99161 20/2/118, 99162
10/0/124, 99163 43/4/134, 99164 19/3/117, 99165 0/0/138, 99166 8/0/100,
99167 15/1/109, 99168 17/1/133.

## What the lever did — and why it still failed

The lever worked as designed. Gate fixtures (9 checks, run live
before the armed pilot, 35/35 with the lever in) proved it fires
exactly where specified — wild wave-3+ mustered fights, never wave
1–2, sealed, cornered, or solo, never via the pre-existing
allyFromStart path — and the ally strikes in round 1 (round-1
allyDealt 10 in the probe fight; the focus-fire line reads "X
fights beside Y from the first blow — the party came together").
On the armed leg it fired in 37 of 41 field fights (90%), and the
field damage fraction jumped 2.1% → 9.9% (nearly 5×). The party
fought together from the opening, as built.

It did not convert. Zero kills in 37 focus-fire fights (baseline:
1 kill in 77 field fights; the one baseline field kill came from a
no-joiner fight). The damage went up but the kill stayed at zero
because the fights still end the same way: armed field endings were
flee 34 / death 6 / kill 0, median 2 rounds. The party deals ~10%
of a wave-4 beast's HP and then the fight ends — the damage×survival
product the prereg warned about. The prereg's honest expectation
("kills likely stay near zero") was right.

And the survival guardrail failed hard. Armed villages died a median
48 days sooner (73d vs 121d), 7 of 8 seeds worse than their identical
baseline pair (99164 was the one exception, +4d). The mechanism is
visible in the fight records: the party-HP pool enters the round-2
hopeless math from the start (WINFIELD-DMG), so 'hopeless' triggers
later and parties hold losing fights they would have fled. In joined
fights the leader died 5 times on the armed leg vs 0 on the baseline
leg (joined 37 vs 28 fights). One armed fight tells it in a line:
seed 99161, day 58, the leader died in round 1 of a focus-fire fight
against a eulogy after dealing 5.5%. Villages lose people sooner and
die sooner. Focus fire converts flees into deaths, exactly as the
prereg predicted it might — without converting any fight into a kill.

## Sense-testing (narration)

The focus-fire line and the round-1 ally strike read coherently in
the live gate probe (the ally's strike is narrated in round 1, the
party reads as fighting together). The failure is mechanical, not
nonsensical text. The corpus fight records carry no full logs, so
no end-to-end transcript read was possible from the persisted data;
the live probe's opening rounds stand as the narration check.

## Metric review

- The kill-rate GO was not reachable for a staying lever at this
  damage×survival product: the best armed field fight still dealt
  ~10% of a wave-4 beast's HP. A damage-fraction or rounds-held
  threshold would have been the honest primary for a staying lever;
  the kill-rate bar judged the lever against a bar it could not
  move, and the guardrail caught the real harm (survival).
- The focus-fire fire rate matched the mustered share (37/41 field
  fights; the 4 non-firing fights were solo/no-ally fights the gate
  correctly excludes).
- 8 seeds / 150d gave enough wild wave-4 fights to judge (132
  baseline, 86 armed). The band was not too thin; the effect was
  visible in both directions (damage up, survival down).
- TB spillover: TB kills fell 10 → 3 and TB damage fraction rose
  11.3% → 14.8%. The lever does not touch TB; the kill fall is
  most plausibly the same survival collapse (fewer, shorter runs
  mean fewer TB fights: 55 → 45), not a TB mechanism.

## Next blank (per the prereg's diagnostic-intermediates rule)

The diagnostic intermediates decide the next blank: **damage-per-
round or survival, not the flee decision.** Focus fire proved the
flee decision is not the binding constraint — parties already stay
long enough to die; what they lack is damage per round (a 5×
damage jump still lands at ~10% of a wave-4 beast) and the HP to
survive the monster's 35–95/round. The next lever must raise
damage dealt per round or survivability per round, not move the
ally's entry round. Do NOT re-run focus fire.

## Revert

The game-code change is reverted in full: `src/js/fieldFights.js`
is byte-identical to its pre-lever state (verified: `git diff
<instrument-fix> -- src/js/fieldFights.js` empty). The lever's gate
fixtures were removed with it (they test the reverted lever). The
instrument, analyzer, driver, proof (26/26), prereg, and both
corpora stay as the killed-verdict record. The prereg's shout
wording was corrected in the lever commit (the shout cannot call a
further ally after a focus-fire join — helpCalled is set by the
join; see the prereg's Correction section).

## Closeout provenance

The arm's worker timed out with the lever uncommitted and the
armed pilot unrun. The main session finished the arm per the
prereg: corrected the shout wording (code comment + prereg),
added the 9 gate fixtures, ran them live (35/35), committed the
lever, ran the armed pilot on identical seeds 99161–99168, judged
NO-GO against the pre-registered bar, reverted the lever, and
wrote this evidence. No gate, price, deed-gate, readyDemand, or
VETSHAPE change was made at any point.

## Files

- Prereg + instrument + driver + analyzer + proof: f40bcfb4a,
  381ae01c6 (landed with this run).
- Lever commit (reverted by this commit): 1b3f04280 — kept in
  history so the killed verdict is auditable; its game-code change
  is fully undone by this commit.
- Evidence + corpora (16 files) + revert: this commit.
