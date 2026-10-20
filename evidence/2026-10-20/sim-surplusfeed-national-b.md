# sim-surplusfeed-national-b — does the SURPLUSFEED trim tax the feast/gift economy that builds standing?

Run: fleshout-loop-b-20261020T2130Z, arm sim-surplusfeed-national-b
(DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero new policy layers). Worker tree: ~/workspace/worktrees/sim-surplusfeed-national-b.
Answers the #702 named next from sim-surplusfeed-curvecheck-b: the landed
default-OFF SURPLUSFEED governor bent the share_surplus curve (1.22x vs
2.12x, GO) but national reach dropped 4/16 armed vs 9/16 control.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: does the governor's trim (~2.9M kcal over 1590 trim-days in
  the curve-check) tax the feast/gift economy that builds standing — and does
  that explain the armed-vs-control national gap? Mechanism chain under test
  (all engine code, read-only): trim at villagerMealDay's share path ->
  leaner pantry -> feasts spend less / land thinner (hostFeast: thin-pickings
  -1 at <300 kcal/head; feastLog quality<1 scores 0 plenty standing, +20 at
  quality>=1) -> gifts/oaths/court ceremonies are kcal-priced (accord gift
  1500-2000, renegotiation gift 1500, oath 3000, feast-court 5000; honor
  proportional to paid) -> less trust per answer -> slower seasoned-link
  accumulation (diplomacy standing) and thinner courts (national itself).
- **DIAG-GO bar** (concrete; mechanism confirmed iff ALL hold):
  1. SPEND-DOSE: Pearson(trimKcal, feastGiftSpendDelta(control-armed per
     paired seed)) >= 0.6 — the trimmed kcal taxes the RECURRING
     standing-economy spend (feasts + accord/renegotiation gifts; court
     ceremony spend EXCLUDED — it is the outcome-scale payment, not the
     recurring mechanism).
  2. STANDING-SLOW: armed standing trajectories materially slower — day-120
     total standing armed < control on >= 75% of paired seeds, AND the plenty
     component shows the deficit (armed mean plenty <= control mean plenty).
  3. GAP-SIGNATURE: 100% of national-gap seeds (control national, armed not)
     show a standing-deficit signature: at the day control's court sat
     (nationalDay), armed standing total <= control's at the same day minus
     10 pts (noise floor).
- **Verdict classes**: DIAG-GO (mechanism confirmed; named next is the
  default-ON call — a Steve/coordinator decision, NOT this arm's) or open
  (mechanism unproven).
- **Seeds/method/horizon**: 8 seeds (8801–8808) × {leadfeast, belongfeast} ×
  {control (SURPLUSFEED unset), armed (SURPLUSFEED=1)} = 32 runs, 180d
  death-aware, FEASTSCALE_R13=1 + SEATDRIVE=0 explicit. PAIRED REUSE of the
  8801-8808 set (not a fresh-seed claim). Control re-measured on the CURRENT
  master tip in the SAME sweep — the curve-check's corpus is irreproducible
  across master movement (see below).
- **CONTROL RE-RUN (same class as the curve-check, §14)**: substrate is
  commit 65b460256 (2026-10-20 21:07Z); the curve-check ran on ea6f64531a and
  11 src/js files changed in between (villager-agency, voice-piper, …) — the
  RNG stream may have shifted again, so the curve-check's re-run control is
  NOT trusted; both arms re-measure on 65b460256 in one sweep.
- **Instrument proof (pre-registered, all must pass before the sweep)**:
  (a) RED: pristine runs carry no standing-instrument state (armed + unset);
  (b) GREEN: dawn standing trajectories (int components war/dip/ple),
  feastEvents recorded with day/paid/quality, feast honesty >= 99% (engine
  feast say-lines "(−X kcal from the pantry)" match recorded paid —
  independent two-source check), named spend channels feast/gift/court;
  (c) ENGAGE: trim telemetry fires on glut days (trimKcal > 0);
  (d) DET-armed: instrumented vs pristine byte-identical canonical
  projection (ALL new wraps RNG-clean: pantryDraw, _removePantryKcal,
  hostFeast, answerAccord, answerRenegotiation, answerNationalChoice, sleep,
  surplusFeedGovernor);
  (e) REPEAT: same armed seed twice in-process byte-identical;
  (f) RED-EQUIVALENT: new-instrument driver unset ≡
  probe-glutcurvecheck-b.js unset on the same commit (new instrument adds
  zero drift to the paired substrate).
- **Honesty bar (binding)**: feast attribution >= 99% (say-line cross-check);
  instrument-honesty on the glut inflow kept from the shared instrument
  (unattributed < 1%).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. Diagnostic: zero game code
  touched, zero policy layers built. "Rot can't be smoked back into food"
  untouched. The feast is the village's social engine (canon: quality>=1 =
  fine or legendary counts as major; a thin quiet meal (0) does not); the
  feast-court path and accord gift scale honor with kcal — the copy always
  says the true amount (break-it regional r4 precedent: no free honor).

## Proof results (pre-sweep — all green, 2026-10-20)

scripts/test-surplusfeed-national-b.js: **23/23 GREEN** (run with
FEASTSCALE_R13=1 SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- RED: pristine runs carry no standing-instrument state, armed and unset
  (2/2).
- GREEN (8815/8816 × 60d armed): dawn standing trajectories sampled, int
  components war/dip/ple (4/4). Feast-specific checks on 8816 ×
  {belongfeast, leadfeast}: feasts recorded with day/paid/quality (2/2);
  feast honesty >= 99% — the engine's own feast say-lines
  "(−X kcal from the pantry)" match recorded paid (belongfeast 6/6,
  leadfeast 4/4); feast events well-formed; named spend channels
  feast/gift/court present; attribution complete (sum ≤ total) (8/8).
- ENGAGE: trim telemetry fires on glut days — 8815/8816 armed, trimKcal > 0
  (2/2).
- DET-armed (8817/8818 × 40d, instrumented vs pristine): canonical
  projections byte-identical — ALL new wraps (pantryDraw, _removePantryKcal,
  hostFeast, answerAccord, answerRenegotiation, answerNationalChoice, sleep,
  surplusFeedGovernor) are RNG-clean (2/2).
- REPEAT: same armed seed twice in-process byte-identical (1/1).
- RED-EQUIVALENT same-commit (8801/8802 × 60d, SURPLUSFEED unset):
  new-instrument driver ≡ probe-glutcurvecheck-b.js byte-identically on the
  same commit — the standing instrument adds zero drift to the paired
  substrate (2/2).

Two honest findings from the proof phase (instrument bugs caught and fixed
before the sweep, documented per the proof-first discipline):
1. feastPlan runs pantryDraw on a COPY of the pantry (menu preview); the
   first instrument version attributed the preview's taken as real spend,
   double-counting feast paid (3200 vs the honest 1600). Fixed: attribute
   only draws against the real village object. Caught by the say-line
   cross-check — the honesty bar did its job.
2. attachProbe's say capture truncates at 220 chars; the feast's spent kcal
   sit past the cut. The honesty check now uses a full-length feast-line
   capture in the standing instrument.
3. Seed 8815 hosts no feasts on either policy in 60d (feastscale contribution
   gate — policy behavior, not instrument); feast-specific proof checks use
   8816, which feasts on both policies.

## Sweep results (32 runs, substrate 65b460256 — paired control+armed, same commit)

Wall numbers (paired, armed / control, n=16):
won 0/16 / 0/16, national (end-state) 3/16 / 7/16, national (ever-hit) 12/16 / 13/16,
table 13/16 / 12/16, wave-4 13/16 / 16/16, wave-5 0/16 / 0/16,
median 140d / 142.5d, max 180d / 180d.

The wall stands (zero wins, wave-5 0/16, pre-seat) — this diagnostic does not
attack the wall.

### The headline, first: the gap the hypothesis was meant to explain mostly evaporated

The curve-check's motivating gap was end-state national 4/16 armed vs 9/16
control on ea6f64531a. On the current tip (65b460256), paired end-state
national is 3/16 vs 7/16 — and EVER-national is 12/16 vs 13/16, a wash.
National hit-and-loss: control hit 13/16 (lost 6), armed hit 12/16 (lost 9).
The armed end-state deficit comes from POST-COURT REALM DISSOLUTION
(national is a live state — the court sat, then the realm came apart), NOT
from failing to reach the court. That reframes the mechanism question
entirely: the hypothesis under test was a standing-ACCUMULATION tax; the
data points at realm UPKEEP instead (named next below).

### Bar 1 — SPEND-DOSE: MISS (wrong-signed)

Pearson(trimKcal, feastGiftSpendDelta) = **−0.529** (bar ≥ 0.6). Feast-only
r = −0.52, gift-only r = −0.363. The sign is the finding: on high-trim seeds
the armed runs do NOT spend less on feasts+gifts — they spend as much or
MORE (8808 leadfeast: trim 417k, feast 29k armed vs 18k control; 8805 lead:
trim 293k, feast 17k vs 14k). Mechanistically: trimKcal is a proxy for seed
glut-proneness (the governor only fires at pantryFreshDays > 4); on
glut-prone seeds the feastscale layer keeps hosting feasts on both arms,
and the armed pantry cycles instead of sitting at permanent glut — feast
spend follows the policy cadence, not the trim. The hypothesis's core
prediction (trim taxes feast/gift spend in proportion to trim) is rejected
on the sign, not just the magnitude.

### Bar 2 — STANDING-SLOW: MISS

Day-120 total standing armed < control on 8/16 pairs (share 0.50, bar 0.75);
plenty-deficit share 0.625 (bar 0.75). Armed standing is NOT materially
slower — per-pair stand120 (control/armed): 242/267, 372/80, 165/187,
292/272, 392/235, 522/312, 312/85, 252/242, 134/170, 320/105, 199/225,
169/210, 165/205, 154/205, 174/60, 165/195. Mixed in both directions; no
systematic slowdown. The plenty component shows no consistent deficit
either — feast quality counts (q>=1) per pair: 12/7, 12/4, 7/7, 8/7, 7/8,
12/8, 8/3, 5/9, 10/6, 11/4, 10/6, 4/8, 7/9, 8/9, 11/3, 7/6.

### Bar 3 — GAP-SIGNATURE: PASS on n=2, one degenerate

2/2 ever-national-gap seeds show the deficit signature (armed standing at
control's nationalDay ≤ control's − 10). But: 8807 belongfeast's armed run
was DEAD at day 106 (village-lost) before control's day-165 court — the
"deficit" compares a corpse to a court, a fork artifact, not mechanism.
8802 leadfeast is the one honest case (armed survived 180d; aTot 40 vs
cTot 267 at day 77; feast spend 12k vs 28k; trim only 101k). n=1 honest case
does not carry a bar.

### Verdict: open (mechanism unproven)

The hypothesized mechanism — trim taxes the recurring feast/gift economy,
slowing standing accumulation — is NOT supported: wrong-signed dose
correlation, no systematic standing slowdown, and the motivating gap itself
(ev-er national 12/13) is a wash on this substrate. What IS real: armed runs
reach the court just as often but lose the realm more often (9/12 vs 6/13).
That is a post-court UPKEEP question (tribute shortfalls? trust craters
under wave-4 pressure?), not a standing-accumulation question — and it is
NOT tested by this arm's instruments. Named next for the default-ON call:
instrument link-dissolution causes vs trim (tribute/upkeep flows, trust
trajectories post-court) on the same paired substrate. Until that runs, the
default-ON call has a documented open tradeoff signal, not a confirmed
mechanism.

### Instrument honesty across the sweep

Feast honesty ≥99% held on all 32 runs (engine feast say-lines matched
recorded paid on every run; per-pair honest flags 1/1 × 16). Glut inflow
unattributed < 1% kept from the shared instrument. Governor engagement:
trim fired on 16/16 armed runs (27k–417k per run), 0 on controls.

### Per-pair ledger (control / armed)

seed policy days nat(end) rank trim feast gift court feastQ stand120
8801 lead 180/180 1/0 national/regional 318k 33/21k 6/6k 5/5k 12/7 242/267
8802 lead 136/180 1/0 global/regional 101k 28/12k 6/6k 5/0k 12/4 372/80
8803 lead 143/157 0/1 regional/global 265k 17/18k 6/6k 0/5k 7/7 165/187
8804 lead 180/145 0/0 regional/regional 159k 21/15k 6/6k 5/5k 8/7 292/272
8805 lead 81/132 1/0 global/regional 293k 14/17k 6/6k 5/5k 7/8 392/235
8806 lead 142/162 1/0 global/regional 269k 19/19k 6/6k 5/5k 12/8 522/312
8807 lead 136/109 1/0 global/regional 27k 24/7k 8/6k 5/3k 8/3 312/85
8808 lead 162/180 0/1 regional/global 417k 18/29k 6/6k 5/5k 5/9 252/242
8801 bel 180/136 1/0 national/regional 144k 27/12k 2/2k 3/3k 10/6 134/170
8802 bel 141/109 0/0 regional/regional 128k 21/12k 2/2k 3/3k 11/4 320/105
8803 bel 180/168 0/0 regional/regional 117k 27/14k 2/2k 3/6k 10/6 199/225
8804 bel 126/76 1/1 national/national 40k 16/22k 2/2k 3/3k 4/8 169/210
8805 bel 72/100 0/0 regional/regional 176k 11/17k 2/2k 0/0k 7/9 165/205
8806 bel 180/144 0/0 regional/regional 172k 24/20k 2/2k 3/3k 8/9 154/205
8807 bel 177/106 0/0 regional/regional 32k 27/9k 2/2k 6/0k 11/3 174/60
8808 bel 68/127 0/0 regional/regional 98k 14/14k 2/2k 0/0k 7/6 165/195

Notes: 8801 lead armed — court sat d77 (lead feast, paid the full 5,000),
realm dissolved by ~d173 (dip 102→0) while the village survived to 180.
8807 lead — the chaotic fork seed again (armed court 3k partial, died 109).
nat(end) is end-state nationalLive; nationalDay persists as the ever-hit
marker.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 8801 leadfeast transcript (/tmp/sense-court-8801.json, sense-loss
runs): the court ceremony reads as played, not ledger-flipped. The System's
"Four fires. One head. GOVERNANCE LAYER: online — polity tribute routing,
the court calendar, famine reserves. You built a realm. Try not to lose it
the way you found it." The speakers "are measuring you"; the 5,000 kcal
shared-granary feast lands with "count it — and remember who fed them first.
(Trust +10 with each.)" — full honor, honestly voiced. The realm's loss
reads as played chaos too: wave-4 gorging monsters eating 1.4–3.0k kcal from
the stores nightly, THE HERALD striking Stonebridge ("they notice who wasn't
there"), raids carrying off pantry kcal, tribute shortfalls voiced with
arrears. The feast beats read communal and honest ("For one evening, nobody
is surviving — they're just together. (−1,600 kcal from the pantry)").
Nothing robotic; the trim's role in the loss is unproven, not unvoiced.

## Metric review (§14)

- DIAG-GO bars 1 and 2 MISSED as written — NOT re-scored. Bar 1's ≥0.6
  assumed a positive dose-response; the measured −0.529 is a substantive
  rejection of the hypothesis's core prediction, not a calibration miss.
  The honest revision for the NEXT arm: the mechanism question has moved
  from standing accumulation to realm upkeep — pre-register against
  link-dissolution causes and post-court trust/tribute trajectories, not
  feast spend.
- Bar 3's "100% of gap seeds" is vacuous-adjacent at n=2 with one degenerate
  (8807: armed dead before control's court). Future gap-signature bars should
  require n ≥ 4 honest gaps or exclude death-fork pairs.
- The ever-national vs end-state-national distinction belongs in the
  instrument from the start next time: national is a live state, and
  end-state-only reads understate reach on chaotic substrates.
- Tribute/tendLink spending (real pantry kcal for trust) is OUTSIDE this
  arm's spend instrument — the gift channel covers answered beats only.
  The named next (realm-upkeep diagnostic) must instrument tribute flows.

## Balanced panel (§15) — inexpressible, no bogus compare shipped

Same class as the curve-check (documented there): the treatment
(SURPLUSFEED=1, an env var) is not part of panel case identity
(`flagNames` excludes it), the substrate (leadfeast/belongfeast +
FEASTSCALE_R13=1, seeds 8801–8808, 180d) is not the §15 contract substrate,
and the contract metrics don't include the pre-registered primary
(trim→spend Pearson, standing trajectories). No compare shipped; the
before/after is the paired analysis above on identical seeds, commit, and
instruments (scripts/analyze-surplusfeed-national-b.js).

## Telemetry deviation check

Flat aggregate {national:3, table:13, wins:0} vs
hidden_files/telemetry-baselines/scale-wall.json fired LOUD on national
(12→3) and wins (16→0) — both REGIME ARTIFACTS per the baseline's own note
("DO NOT compare pre-seat / courtship / readiness substrates against this
baseline — wins are structurally ~0 there"). This corpus is courtship
(FEASTSCALE_R13=1, SEATDRIVE=0, no win stack); the regime-correct comparison
is armed vs the same-commit control (national end-state 3/16 vs 7/16;
ever-national 12/16 vs 13/16). Baseline NOT rolled — rolling on a regime
artifact is exactly what the brief warned against. (exiled untracked in
this instrument — noted as a gap, not hidden.)

## Convergence state

**open — mechanism unproven.** The standing-accumulation-tax hypothesis is
rejected on its core prediction (wrong-signed dose correlation, no
systematic standing slowdown); the motivating gap is mostly master-movement
noise + post-court realm dissolution on this substrate. One substantive
open item for the default-ON call: armed runs reach the court as often
(12/13 ever-national) but lose the realm more often (9/12 vs 6/13) — the
realm-UPKEEP question is untested. **DO NOT TOUCH src/js; no lever to land —
this was instrument-only on a landed governor.** food-economy stays
converging; the wall is unmoved (wins 0/16, wave-5 0/16).
