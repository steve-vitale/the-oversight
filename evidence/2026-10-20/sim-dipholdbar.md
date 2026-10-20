# sim-dipholdbar — bill-current good-standing bar, SECOND VARIANT (flesh-out loop A, 2026-10-20, ARM sim-dipholdbar)

Run: fleshout-20261020T0215Z, arm sim-dipholdbar. Axis: scale-onramp (the blocking axis).
Backlog charter: the sim-diphold DIAG's named next #1 (evidence/2026-10-19/sim-diphold.md),
second variant — the 2026-10-19 run (commit e7bfc346c, evidence/2026-10-19/sim-diphold-bar.md)
killed a DIFFERENT variant (7-day grace from first arrears posting: s64207 dip 26d→32d,
primary 1.231x vs 1.3x GO bar, all guardrails pass). This run tests the coordinator-approved
bill-current variant per the run brief. GAME-CODE ARM — src/js/hierarchy.js only.

Canon: docs/CANON.md (read first), docs/SCALE.md (the BELONG road, the good-standing bar:
trust >= 50, arrears 0, age >= 14 — the bar this arm reworks; the valued-subordinate bar).
No canon doc covers the bond/standing/tribute internals beyond SCALE.md — the
tribute/arrears mechanics are read from the engine (src/js/hierarchy.js), not invented.
steve-call #668 (grief-leverage ratchet once-per-primary) was NOT implemented — that is
Steve's call and stays untouched (pinned by proof F4).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the armed sweep)

**THE BAR FORMULA (verbatim):** the arrears leg of the BELONG good-standing bar
(`polityOf`, src/js/hierarchy.js) becomes **BILL-CURRENT**: the trailing-7d tribute
ACTUALLY PAID on the link covers at least one full current weekly bill —
`sum(link.tributePaidLog[k].kcal for k with day in [d-6, d]) >= link.tributeKcalPerWeek`,
where `tributePaidLog` is stamped in `payTribute` with ACTUAL kcal moved (paid, not
requested), tagged by scholar day, pruned to the trailing 7 days on every write.
Legacy arrears may stand — the leg does not read `l.arrears` at all. Bootstrap: a bond
with no recorded payments and clean books (arrears==0) reads current (the bar can't
judge payment behavior it never saw; covers pre-change saves). Bill <= 0 is vacuously
current. Trust leg (`_succTrustOf >= 50`) and age leg (`>= 14d`) UNCHANGED.
`kingdomEndingEligible` (70/0/21) UNCHANGED — the doorway moves, not the room.

**Reasoning:** the diphold arm proved reactive arrears-clearing can't hold a bar that
dies at first arrears posting (117 clears bought zero dip-days). The honest game-code
variant rewards the ongoing payment behavior instead of demanding a pristine ledger: a
village that keeps a full bill's worth of tribute moving within any rolling week holds
good standing even while working down legacy arrears; a village that stops paying loses
it within 7 days of its last full bill's worth of payments. A week-block reading of
"trailing-7d" would be a PROVEN NO-OP (payTribute zeroes arrears when the week's bill is
paid in full, so under week blocks arrears>0 already implies not-current and vice versa —
verified by fixture on pristine code); the rolling window is the only literal reading
that is behaviorally real: payments straddling a settlement boundary count once,
together, so dribs across the boundary can hold the bar where a lump sum can't. Prior:
the grace variant measured 1.231x — this variant is mechanically different (rewards
ongoing dribs rather than forgiving after posting), so the measurement is not redundant;
expectation set honestly: on s64207-like seeds the pantry cannot sustain ~1 bill/7d
(the ratcheted bill vs the pantry, steve-call #668), so the primary may still NO-GO.

**PRIMARY:** dip-days-held per seasoned belong bond = the count of dip=1 days from the
bond's first seasoned day (age >= 30 && trust >= 40 — the probe's `seasoned` flag) until
the first dip-0 day for that bond (a broken/vanished bond counts as dip-0 from the break
day), capped at run end. Bond-death vs village-death recorded as SEPARATE outcomes per
bond (the recourt named next).
**GO:** armed mean >= 1.3x control mean over seasoned belong bonds.

**Guardrails:** national >= control-2, median survival >= control-10d, no new death
mode, wave-4 >= control-2.

**Horizon:** 180d death-aware (dead villages stop simulating).
**Seeds:** 64201–64208 x leadfeast/belongfeast, paired control/armed on IDENTICAL seeds
(16 runs per side, 32 total).
**Substrate:** the seasonblock composition verbatim (SD/WD/RP over TF.leadfeast /
TF.belongfeast): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1.
**Control provenance:** FRESH paired sweep on pristine hierarchy.js — the seasonblock
corpus FAILED FIDELITY on current master (engine drifted since 8c055140a: s64201
leadfeast 82d vs corpus 134d, belongfeast 129d vs corpus 85d), so no corpus reuse.
**Instrument:** scripts/probe-dipholdbar-20261020.js (seasonblock instruments reused
verbatim: bond census, beat capture, death capture, flow recording; DET/SMOKE/FIDELITY
gates; per-seed JSON gains the billCurrentArrearsDays counter).
scripts/test-dipholdbar.js (proof: 9/9 GREEN with the change; F1/F5/F6/F7 RED-verified
on pristine, F2/F3/F4/F8 GREEN on pristine).
scripts/analyze-dipholdbar-20261020.js (primary + guardrails + mechanism + bond fates).
scripts/build-dipholdbar-panels-20261020.js (§15 panel compare; panel = instrument,
pre-registered threshold = judge).

**Kill rule:** primary miss at pilot → kill, hierarchy.js hunks reverted zero-trace,
instruments + evidence + proof kept.

## Results

32/32 runs swept (16 control on pristine hierarchy.js + 16 armed), 0 bad files,
0 instrument errors. DET: armed 4/4 byte-identical (both roads, 2 seeds each).
FIDELITY: FAIL vs the seasonblock corpus on current master — the engine drifted
since 8c055140a (s64201 leadfeast 82d vs corpus 134d, belongfeast 129d vs corpus
85d; the journey-deepening r22 src changes landed between), so the control is a
FRESH paired sweep on pristine code, identical seeds, identical substrate. Proof:
9/9 GREEN with the change (F1/F5/F6/F7 RED-verified on pristine, F2/F3/F4/F8 GREEN
on pristine). check.js --quick: 253 passed, 4 failed — all 4 re-verified as
PRE-EXISTING on pristine hierarchy.js (stale maintenance proofs at HEAD:
gossip-resume-beat prose, measurement-proof-update inputs, measurement-workflow
neutrality proof, phone-frame browser inputs; the journey-deepening r22 src
changes landed without refreshing them). Not caused by this arm; not fixed
here (out of scope for a killed lever — flagged as an out-of-arm finding).

**PRIMARY: NO-GO.** dip-days-held per seasoned belong bond: control 18.44 (n=9) |
armed 10.78 (n=9) | ratio **0.585** (GO bar 1.3x). Not a near-miss — the armed
side is WORSE than control.

**Guardrails (all pass):** national 12v12 ok; wave-4 12v13 ok; no new death
channel ok (channels identical both sides, both roads:
alien/disease/expedition/haven/other/raid/wild); median survival belong 128d vs
132d ok, lead 111.5d vs 111.5d ok.

**Mechanism (the new leg never engaged):** currentHeldDays (dip=1 && arrears>0
bond-days — impossible under the old bar, the signature of the new one):
control 0, armed **0**. billCurrentArrearsDays (probe's daily `_billCurrent`
read on upward bonds carrying arrears): control 0, armed **0**. Tribute paid:
control 548,957 kcal vs armed 510,420 kcal. The lenient case the variant was
built for — a village sustaining >= 1 bill/7d in dribs while arrears stand —
never occurred on any of the 16 armed runs. What DID occur is the variant's
strict side (fixture F6): a bond that paid and then stopped loses the bar up to
~6 days BEFORE arrears post (the rolling window ages out while the old
arrears==0 leg still held). The bar change is strictly worse-or-equal on these
seeds: the forgiveness never fires, the strictness fires early.

**Bond fates (separate outcomes, the recourt named next):** control
{bond-broke: 4, village-died: 4, survived-with-bond: 1} | armed {bond-broke: 3,
village-died: 4, survived-with-bond: 2}. The dip-holding question is asked
mostly of bonds that break (7/18) or die with the village (8/18) — the
holding window is short on both sides.

**§15 panel** (evidence/2026-10-20/dipholdbar-panel-primary.md, .json, .json.gz —
attached): decision **review_required**, no material signal on any contract
metric (table: regression_watch, delta −0.125, CI [−0.375, 0] — 1 fewer table
invitation on armed, CI touches 0). The panel is the instrument; the
pre-registered 1.3x threshold is the judge.

**Per-seed notes:** armed s64207 belongfeast died d105 (control: survived 182d)
— trajectory divergence through national flicker (the bar change consumes no
RNG itself; state changes avalanche). The village died before arrears even
posted; the d104–105 say-lines are a neighbor's grain gift (2,432 kcal, "Eat.
We'll settle the books when the green comes back") — fiction-honest, no
robotic behavior. Armed s64203 belongfeast survived 182d with a 55-day dip
(village_spl_27_12965, survived-with-bond) — the longest armed dip, granted
under the new bar while clean-books. The lead road is byte-for-byte unaffected
(nat 8v8, wave4 8v8, survival 111.5v111.5, starvation 4v4 — no upward bonds,
no bar reads).

**Verdict: KILLED-AT-PILOT.** Primary 0.585x vs 1.3x bar (worse than control),
guardrails pass, panel review_required with no material signal. hierarchy.js
hunks reverted zero-trace per kill protocol (this commit keeps instruments +
evidence + proof only).

## Village assessment

What the villages looked like: 16 armed villages on the pre-seat win-side stack,
the bill-current bar reading every upward bond daily. The villages paid 7% LESS
tribute than control (510k vs 549k kcal) — not because the bar asked less of
them, but because trajectories diverged early on two seeds (s64207's d105 death,
s64203's 182d survival with a 55-day dip). Nobody's dip survived arrears: the
mechanism counters are double-zero, the most honest number in this file.

Who thrived and who died and why: the two surviving-with-bond armed dips
(s64203's 55-day village_spl_27_12965, s64206's 41-day village_spl_32_4888) were
granted under the new bar while clean-books — the bar held them exactly as the
old bar would have. The four armed village-deaths with seasoned bonds
(s64202, s64205, s64207, s64208) all died with the dip at 0–1 days: the
succession economy (tribute ratchet → arrears → trust collapse) still schedules
the dip's death, and the new bar's early-strictness shaves a few days off the
front of that schedule rather than adding any to the back.

What was missing: the same thing the diphold arm found — food. The variant's
forgiveness leg requires the village to keep a full bill's worth of tribute
moving per rolling week WHILE in arrears; on the stall seeds the pantry cannot
sustain the ratcheted bill at all (steve-call #668), so payments collapse to
0-kcal the moment arrears post and the rolling sum never reaches the bill. The
holding problem is the ratcheted bill vs the pantry, not the bar — now measured
twice, with two different bars (grace: 1.231x; bill-current: 0.585x).

## Sense-testing (SENSE-TESTING LAW)

Read: the armed s64207 say-stream d104–120 (the window where the control run's
first arrears posted at d113), plus the census-joined dip timelines.

The fiction reads honestly: d104–105, with Haven's bins echoing, Grace of
Emberhold walks in unannounced with pack-mules — 2,432 kcal, no tribute, no
ceremony ("Eat. We'll settle the books when the green comes back."). No arrears
say-lines fire in the window because the village dies d105 before arrears post.
The gift's idiom (aid without ceremony, books settled later) is the neighbor-aid
voice, not the tribute voice — the two are never confused. No robotic, static,
or repeated behavior in the captured beats. The strict-side bar break itself
(the F6 case) has no SAY line — the bar is a silent read inside polityOf, as
before; whether the player can SEE why standing broke (knowledge-gating: "if
you don't know, it doesn't show") is unchanged from the old bar and remains a
UI question for the ship, not this arm.

## Metric review (§14 — honest doubts for the NEXT run, not this one)

1. **The primary's n is small and the ratio is exact-directional, not noisy.**
   9 seasoned bonds per side; the 0.585x comes with a mechanism (double-zero
   engagement + the F6 strictness), not just noise. A re-run would not change
   the mechanism read.
2. **The variant's leniency is unobservable on seeds where the pantry can't
   carry the bill.** Both bar variants now killed (grace 1.231x, bill-current
   0.585x) share one root cause: steve-call #668. Until the ratchet question
   is answered, further bar variants are measuring the same wall from
   different angles — recommend no third bar variant without Steve's call.
3. **Control freshness cost.** FIDELITY-vs-corpus failed on engine drift; the
   fresh paired control (16 extra runs, ~5 min) is the honest price. Future
   arms on this substrate should budget the control re-sweep up front rather
   than assuming corpus reuse.
4. **Table regression_watch is noise-shaped.** 6v7 invitations, CI [−0.375, 0];
   with the primary at 0.585x it does not matter, but on a closer arm this
   would need the 12–16-seed confirm before any claim.

## Convergence

**killed-at-pilot** (the arm), axis **converging**. Two game-code bar variants
are now measured closed: 7-day grace from first posting (1.231x, NO-GO) and
bill-current trailing-7d (0.585x, NO-GO). The mechanism is understood both
ways: grace buys days but not the 1.3x bar; bill-current never engages its
leniency and its strictness fires early. The holding problem is the ratcheted
bill vs the pantry (steve-call #668) — the bar is not the load-bearing lever.
Wall on this arm's corpora (32 runs, both roads): national 24/32, table 27/32,
wins 0/32, wave-4 25/32, wave-5 0/32, median survival ~120d. The scale wall
stands: wins 0, wave-5 0.

## Out-of-arm findings

(none chased; appended to hidden_files/sim-findings.md)
- Third bar variants should wait on steve-call #668 (the succession
  grief-leverage ratchet on the belong road) — two variants measured closed,
  same root cause.
- check.js --quick has 4 PRE-EXISTING failures at HEAD (verified on pristine
  hierarchy.js — stale maintenance proofs, not this arm): gossip-resume-beat
  prose drift, measurement-proof-update inputs, measurement-workflow neutrality
  proof, phone-frame browser inputs. The journey-deepening r22 src changes
  landed without refreshing them; whoever owns those proofs should refresh.

## Files

- scripts/probe-dipholdbar-20261020.js — sweep probe (seasonblock instruments
  reused verbatim; DET/SMOKE/FIDELITY gates; billCurrentArrearsDays counter;
  control+armed side dirs)
- scripts/analyze-dipholdbar-20261020.js — primary + guardrails + mechanism +
  bond-fate (bond-death vs village-death) classification
- scripts/build-dipholdbar-panels-20261020.js — §15 panel builder
- scripts/sense-dipholdbar-20261020.js — SENSE-TESTING LAW replay (s64207 say-lines)
- scripts/test-dipholdbar.js — proof (9/9 GREEN pre-deletion; F1/F5/F6/F7
  RED-verified on pristine hierarchy.js)
- evidence/2026-10-20/perseed-dipholdbar/{control,armed}/{leadfeast,belongfeast}/s64201–s64208.json — 32 per-seed sweep JSONs
- evidence/2026-10-20/dipholdbar-corpus-summary.json — analyzer output
- evidence/2026-10-20/dipholdbar-panel-primary.{md,json,json.gz} — §15 panel compare (attached)
- evidence/2026-10-20/sim-dipholdbar.md — this file
- src/js/hierarchy.js — REVERTED per kill protocol (zero trace of the variant)
