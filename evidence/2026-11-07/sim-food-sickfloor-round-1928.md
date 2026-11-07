# sim-food-sickfloor-round-1928 — coordinator evidence (Loop A, food-economy)

Run fleshout-20261107T1928Z, Loop A, axis food-economy. The coordinator
TIMED OUT at ~21:30Z before finishing; the main session adopted the run
(INSPECT HELD WORK) and closed it out. All three arms are resolved below.
Master tip at adoption: ece67e0b2 (Loop B 2030Z round evidence).

## Arm 1 — sim-sickfloor-a: PILOT NO-GO, KILLED

Game-code lever (env-gated SICKFLOOR=1: a production floor for sick /
low-health villagers, softening the health/100 multiplier in
villagerExpectedDaily). The coordinator killed it at pilot and deleted the
branch before timing out; its evidence file died with the branch. The
numbers below were verified by the main session from the coordinator's
surviving /tmp logs (sickfloor-armed-analysis.log,
sickfloor-baseline-analysis.log, plus sweep/panel/check logs) — not taken
from any worker's word.

Pilot, 8 seeds 96301–96308, competent, 150d, identical seeds:

- Baseline: produced/need 0.992, starvation 1, median 128d, empty-pantry
  114/990 (11.5%), wave-5 reach 3/8. Per-seed days:
  127/150/124/61/129/134/121/145. 3 collapse episodes, all HEALTH-primary.
- Armed (SICKFLOOR=1): produced/need **1.041**, starvation **0**, median
  **85.5d**, empty-pantry 30/776 (3.9%), wave-5 2/8. Per-seed:
  150/66/75/89/142/113/82/61 — deltas vs baseline +23/−84/−49/+28/+13/−21/
  −39/−84 (**5/8 seeds died earlier**). 1 collapse episode (96306,
  KNOW-primary — the floor did remove HEALTH as the collapse driver).
  Throttle-engaged 72.7% vs 56.6%.
- Wall: national 0/8, table 0, wins 0, both legs.

Verdict: NO-GO at pilot. The mechanism worked (production up, starvation
gone) but the per-seed guardrail failed: median 85.5d < 102.4d bar. Same
shape as tendsick below: helping the sick/fever side still loses villages
early to other causes. Lever killed; game code reverted with the branch.
Nothing merged.

## Arm 2 — sim-feveranat-a: DIAG-GO, LANDED

DIAG only, zero src/js. Branch files: prereg +
scripts/sweep-feveranat-a.js + scripts/analyze-feveranat-a.js +
scripts/test-feveranat-a.js only. Base 018295600. LANDED ac64c644c
(merged --ff-only; proof 11/11 green on the rebased tip and on merged
master; gate 284/6 — the same 6 as the r154 gate: 4 standing + 2
measurement-proof staleness from r154's src changes, not this branch).

The fever now has an anatomy (pooled, 8 seeds 96301–96308, competent,
150d): 167 episodes (NPC 160, scholar 7); 74 distinct villagers;
**521 sick villager-days / 990 village-days = 52.6%**; vectors: tick 105,
wound 45, unsafe food 9, raw food 3, dirty water 2, food 3 (disease ids:
disease 108, wound_fever 45, bad belly 9, food poisoning (raw) 3, gutrot
2); duration median 3d / mean 3.1 / max 10; outcomes: recovered 140, died
of sickness 14, +9 died of other causes while sick (reconciled via
deathRows); treatment: 105 events (villagerCare 104, sickRest 1), treated
75/167 episodes, **treated deaths 0/75 vs untreated 23/92**; diagnoses 1,
**cures 0 in the wild**; healer present at onset: 87 episodes / 3 deaths
vs absent 80 / 20; F5 production: fever-wave days 382 (produced/need
0.961, healthFrac 0.801) vs non-wave 608 (1.017, 0.871), HEALTH
counterfactual **522,371 kcal**; villager-day contrast: sick mult 0.968 vs
healthy 0.943 — the cost runs through health, not sickness directly; F6:
11 multi-onset days, lag ratio 1.084, **no contagion path exists in
code** — clustering is shared conditions. Wall: national 0/8, table 0,
wins 0, wave-5 3/8, median 128d. G1/G2/G3/G4 all PASS (G3 on the revised
check; see metric review in the arm evidence). Sense lines read clean.

Evidence: evidence/2026-11-07/sim-feveranat-a.md.

## Arm 3 — sim-tendsick-a: PILOT NO-GO, KILLED (tooling landed)

Policy-side only (scripts/policies/tendsick-a.js wraps competent; zero
src/js). Base 018295600. The worker's pilot sweep was complete but the
worker was cancelled before analyzing; the main session judged the arm
from the corpora on disk. LANDED (merged --ff-only; proof 15/15
green on the rebased tip f05ef89db; gate 284/6 — the same 6 as the r154
gate: 4 standing + 2 measurement-proof staleness from r154's src changes,
not this branch).

Prereg + Phase-B amendment (finalized BEFORE the pilot sweep; GO:
PRIMARY sick-days ≤0.90× baseline, STARVE_MAX 1, SURV_MINFRAC 0.80,
PERSEED_MAXREG 1 @ >30d, ENGAGE_MIN_ACTS 10, ENGAGE_MIN_SHARE 0.25;
confirm band 96309–96324 fresh, NOT run).

Pilot, 8 seeds 96301–96308, competent, 150d, identical seeds:

- PRIMARY: sick-days 0.065 → **0.053** (400/7,607), ratio **0.815**
  ≤ 0.90 PASS. Duration 3.2d → 2.1d. Episodes 157 → 205 (unpaired
  trajectories — NOT tending creating episodes). Sickness deaths 14 → 10.
  **Cures 0 → 27.**
- ENGAGEMENT: 275 acts (248 tended, 98 no-effect, 27 cured) on 294
  sick-at-Haven days = 93.5% share PASS.
- **STARVATION: 1 → 5 FAIL** (bar ≤1; s96302: 1, s96303: 1, s96308: 3).
- SURVIVAL: median 128d → 114d PASS (≥102.4d). Per-seed armed:
  150/67/113/116/125/92/115/113.
- **PER-SEED: 3 regressions >30d FAIL** (bar ≤1): s96302 −83 (150→67),
  s96306 −42 (134→92), s96308 −32 (145→113).
- Empty-pantry 114 → 58 (over fewer village-days — villages died
  earlier). Wall: national 0/8, table 0, wins 0, wave 4: 7/8, wave 5: 3/8.

Forage cost (main session, from flowSeries `stocked` dicts; method
validated — baseline reproduces the amendment's numbers to the kcal):
foraged food 407,478 → 296,259 (**−27%**); fish catch 381,301 → 207,503
(**−46%**); duty-stocked all names 1,054,133 → 679,948 (**−35%**). The day
has no slack: tending trades fever for food, and on this band the trade
loses. Caveat: pooled comparison, not paired (trajectories diverge).

G3 on the armed corpus: FAIL (letter + revised) — s96307 daySeries
114/115, missing day 115 = village-lost end (endReason `village-lost`,
finalPop 3, last death d99) — NOT covered by the analyzer's
death-recorded-that-day excuse. Corpus judged valid for the verdict (all
GO inputs are per-seed totals from complete rows). Proposed G3 revision
for the next run: excuse the final day on mid-day ends (village-lost /
game over), not only recorded deaths.

Verdict: PILOT NO-GO. The medicine works (cures 27, sick-days −18%) but
the price is food (forage −35%, starvation 1→5). The policy file stays as
dormant tooling (feaststopspend precedent: killed policy arms land their
tooling; policies are loaded only by sweeps, never by the game).

Evidence: evidence/2026-11-07/sim-tendsick-a.md.

## Wall (this run's judged corpora, 8 seeds, competent-only, 150d)

national 0/8, table 0/8, wins 0/8, wave-5 unlocks 3/8 (feveranat/tendsick
legs; sickfloor 2/8), median survival 128d baseline. The scale wall
stands; the fever/wound → production link from 1820Z is now answered
three ways: the anatomy (feveranat), the floor (sickfloor), and the
tending (tendsick) — all three move the fever side, none moves the wall.

## Metric review

- G3-style corpus-letter checks need the final-day excuse to cover
  village-lost / mid-day game-over ends, not only recorded deaths
  (tendsick s96307).
- Analyzer/sweep naming must agree on the policy string BEFORE the sweep
  runs (tendsick: sweep registered `tendsick-a`, analyzer expected
  `tendsick` — one-line fix, proof 15/15 after).
- Starvation caps relative to baseline (baseline+1) are nearly vacuous at
  high baseline starvation — tendsick used an absolute arm-only cap (≤1)
  and it bit correctly.
- Winner-removal artifact, again: a cost bar computed over non-won seeds
  punishes a lever that wins — use per-seed survival non-inferiority or
  count wins at horizon (sickfloor: median fell while starvation hit 0).

## Infrastructure

Coordinator timed out ~21:30Z with sickfloor killed (branch deleted),
feveranat diagnosed (evidence unwritten), tendsick swept (unanalyzed).
Main-session adoption: verified sickfloor numbers from /tmp logs, wrote
+ committed feveranat evidence (b86a02554), rebased feveranat twice
(onto 8232914518, then ece67e0b2; rebase stop-at-pick quirk 3× on the
second rebase), gate 284/6, merged ac64c644c; fixed the tendsick analyzer
regex, judged the pilot NO-GO, wrote + committed tendsick evidence
(4caadaaf2), rebased onto ece67e0b2 (quirk 1×, on the amendment pick —
verified unapplied via `git diff <pick>` before continuing), proof 15/15
on tip, gate 284/6, merged (branch tip f05ef89db + this round file). Safe-commit index clobber hit
both evidence commits — repaired via `git ls-tree -r HEAD` pipe (the `-r`
is REQUIRED for directory paths; without it the repair writes bogus
slash-less index entries — see AGENTS.md). Master moved once under the
adoption (Loop B 2030Z ece67e0b2 was already tip at adoption start).
Both trees heartbeated through the adoption; lock + claim deleted at
closeout after re-reading the lock.

food-economy stays converging (NOT converged): the fever/wound →
production link is now fully answered (anatomy + floor + tending), but no
food-economy fix has landed from this round — all three arms moved the
fever side and none moved the wall. Next blanks, in order: (1) a cheaper
tending shape (tend only when the trip wouldn't range / cap below 3/day)
with a forage-cost bar, or a village-side care lever (more medics, not
more scholar time); (2) the villager cure channel design question (0
cures in 167 fever episodes in the wild — the channel never fires); (3)
the DOUBLE-NIGHT BUG entry in sim-findings.md is deduped in this
closeout (was two identical lines); its fix shape is still unbuilt and
needs its own prereg. scale-onramp stays converging (untouched by this
run).

Evidence: evidence/2026-11-07/sim-food-sickfloor-round-1928.md (this
file; arm 2 ac64c644c; arm 3 f05ef89db + this round-file commit).
