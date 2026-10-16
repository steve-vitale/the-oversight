# sim-ledgerdiag-b — the ledger counterfactual (loop B diagnostic, 2026-10-16)

Instrument-only diagnostic for sim-findings #340's steve-call: **should the
trust/justice bars read the dated voluntary ledger (like the freeloader
clock) instead of the meal-inflated cumulative?** Zero src/js changes, zero
policy changes — a read-only harness-side instrument
(scripts/ledgerdiag-lib-20261016.js) reconstructing BOTH ledgers per run and
computing the counterfactual: when WOULD the -5000 bar have armed on the
dated-voluntary take side?

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sweep spend)

- **Question**: the engine's trust-drop bar (game.js:14579, net < -5000 →
  trust -2/take) and justice-heat tiers (justice.js:104-106, net < -15000 →
  +25 / net < -5000 → +10) read the LIFETIME-cumulative ledger
  (v.takes/v.gives), which includes the undated communal bowls the village
  serves (villageMeal writes v.takes, game.js:26632 — the bowl is never a
  takeHist entry, r8). sim-trustcensus-b measured the cumulative -5000
  tripping DAY 4 on 16/16 courtship runs at 85–89% meal share, with exactly
  one voluntary take-day and zero gives; 10/16 cross the trailing-7d -5000
  at median day 35. The steve-call needs the counterfactual, measured not
  argued: what would the bars read on the dated voluntary ledger?
- **Instrument**: scripts/ledgerdiag-lib-20261016.js (LEDGERDIAG=1 env gate,
  default off; det-gate byte-identical when off AND on). Hooks
  recordTakeHist/recordGiveHist (call-through) to build the EXACT full
  dated-voluntary event log per vid — the engine prunes >7d on write; the
  instrument keeps everything — plus per-dawn snapshots of the cumulative
  book, the cold-shoulder fiction beats (say/journalNote hooks, classified),
  justice stage transitions, and the succession book-reset mirror
  (playerDeath hook; ledger.js:841-844). Counterfactual nets per vid per
  day: voluntaryNet = cumGives − volTakesCum (take side swapped to dated
  voluntary; give side kept as the engine reads it — the steve-call is
  about the meal-inflated TAKE side); voluntaryNetD = volGivesCum −
  volTakesCum (fully-dated variant); voluntaryNet7 = trailing-7d dated
  flows (the freeloader-clock reading, engine window e.day ≥ day−6).
- **PRIMARY (binding, decisive for the steve-call)**: on each run's arming
  bearer (earliest cumulative -5000 arm), the dated-voluntary ledger arms
  the -5000 bar ≥ 14 days AFTER the cumulative bar did, or never arms at
  all. **GO: ≥ 10/16 runs.**
- **CO-PRIMARY (binding)**: cold-shoulder fiction (stage 0→1 + "The village
  has gone quiet around me. I know why." / "Something has shifted…") fires
  while the dated-voluntary net ≥ 0. "The dated-voluntary net" is read as
  the freeloader-clock reading (voluntaryNet7 — "like the freeloader clock"
  is the steve-call's own comparator); the cumulative-dated form
  (voluntaryNet ≥ 0) is reported alongside, not scored. **GO: ≥ 8/16 runs
  with ≥ 1 firing at voluntaryNet7 ≥ 0.**
- **If both GO** → the steve-call evidence is decisive: the bars punish food
  the village SERVED before any voluntary take happened. **If the PRIMARY
  misses, say so plainly** — a negative result is a result (§14: a miss is
  NO-GO, never re-scored).
- **Also reported (not scored)**: justice-heat tier landings (first day
  cumNet < −5000 / < −15000) with the meal-inflated share of the cumulative
  at landing; counterfactual tier landings on voluntaryNet; trust-take
  stings ("Someone watches you load up") per run; per-bearer arm tables.
- **Horizon**: 180d death-aware (+10d tail; runDays breaks on Game.over /
  deadTail) — matches the trustcensus horizon so the day-4 finding is
  directly comparable. **Seeds**: [107,218,329,440,551,662,773,884] ×
  {leadfeast, belongfeast} (FEASTSCALE_R13=1 — the shared-baseline
  substrate; leadcourt→leadfeast, belongseek→belongfeast per the sleepin
  precedent) = 16 runs, current master tip, NO lever — pure measurement.
  The seed set is the sibling arm's (sim-eveningmeal-b) set, so this
  control side IS the shared baseline: if these numbers do not byte-match
  the sibling's control side, that is a LOUD finding.
- **Det-gate**: scripts/test-ledgerdiag-20261016.js PART B green before
  sweep spend (gate-off AND gate-on byte-identical vs pristine, 30d ×
  {107,218} × {leadfeast, belongfeast}, per-dawn ledger hashes).
  **SMOKE=1**: instrument-honesty green before sweep spend (event-log tr7
  == live takeHist window; cumulative closure; engine takeRate7/giveRate7
  reconcile; succession book-reset mirrored).
- **Sense-test** (Steve's law): every cold-shoulder firing's fiction read
  against its ledger — does the fiction blame the scholar for bowls the
  village served? Worst offenders quoted verbatim; judged for truth.
- **Canon**: docs/CANON.md read; docs/PRESERVATION.md read. NO
  food-distribution canon doc exists — stated per the canon rule; all
  mechanics read from src/js as-is and cited in the lib header. No canon
  invented.

## PROOF (before measurement)

scripts/test-ledgerdiag-20261016.js — ALL GREEN (run 2026-10-16):
- PART A (fixtures): A1 engine window e.day ≥ day−6 exact; A2 full dated
  history per vid (no prune); A3 strict `<` arming (exact −5000 never
  arms); A4 beat classification (say/journal/sting classes); A5 gate-off
  wraps nothing (7 refs unchanged).
- PART A6–A10 (fake-Game integration): A6 both ledgers reconstruct
  exactly (vol/meal/gives closure), engine arm day matches the engine's
  rule (strict <), voluntary never arms → PRIMARY go; A7 cold-shoulder
  beats captured + classified with both net forms, CO-PRIMARY honestly
  false on a draining ledger; the justice tier10 landing names its meal share,
  tier25 never; A8 succession counted, new bearer fresh book; A9
  succession purges NPC-era events from the instrument log (mirrors
  ledger.js:841-844); A10 same-day post-reset takes survive the purge
  (the SMOKE catch — a dawn-time filter dropped them; fixed by filtering
  at playerDeath instead).
- PART B det-gate: B1 gate-OFF + B2 gate-ON byte-identical vs pristine,
  30d × {107,218} × {leadfeast, belongfeast}, per-dawn ledger hashes
  (day/health/kcal/roster/trust/takes/gives) — 30 dawns each, 8/8.
- SMOKE=1: leadfeast s107 15d — rows == unique nights (16/16, 0 dups), 0
  instrument errors, event-log tr7 == live takeHist/giveHist window exact,
  cumulative closure exact, engine takeRate7/giveRate7 reconcile, all 7
  wraps restored on uninstall.
- Mid-build instrument fix (before sweep spend): SMOKE caught the event
  log diverging from the live histories — the successor's NPC-era
  takeHist/giveHist entries (villagerMealDay flows from before they became
  scholar) were attributed to the scholar's counterfactual, while the
  engine's succession reset had wiped them. Fixed in the instrument (not
  the game): the playerDeath hook mirrors the book-reset at the exact
  moment (filter new-vid events), proven by new fixtures A9/A10. Full
  proof re-run ALL GREEN after the fix.

## RESULTS

Sweep: 16 runs (8 seeds × {leadfeast, belongfeast}), 180d death-aware,
FEASTSCALE_R13=1, current master tip, NO lever — pure measurement. 811s
wall (~13.5 min; system loaded). Per-seed:
evidence/2026-10-16/perseed-ledgerdiag/. Summary:
evidence/2026-10-16/perseed-ledgerdiag/summary.json. Instrument: 0 errors,
recon 0/16 mismatches (event-log tr7 == live takeHist/giveHist window on
every run; the 3 mid-build recon hits were a same-day windowing artifact
in the check, not a divergence — diagnosed and fixed, see proof section).

### The counterfactual table (arming bearer per run)

engArm = first day cumulative net < −5000 (the bar that fires).
volArm = first day dated-voluntary net < −5000 (the counterfactual).
t25 = first day cumulative net < −15000 (justice heat+25), with the
meal-inflated share of the cumulative at landing.

| run | engArm | volArm | delta | t25 | t25 mealShare | cold-shoulder firings |
|---|---|---|---|---|---|---|
| leadfeast/s107 | 4 | never | never | never | — | 5 |
| leadfeast/s218 | 4 | never | never | 13 | 0.956 | 5 |
| leadfeast/s329 | 4 | 28 | 24 | 13 | 0.951 | 5 |
| leadfeast/s440 | 4 | never | never | never | — | 5 |
| leadfeast/s551 | 4 | never | never | never | — | 4 |
| leadfeast/s662 | 4 | never | never | never | — | 5 |
| leadfeast/s773 | 4 | never | never | never | — | 4 |
| leadfeast/s884 | 4 | 22 | 18 | 12 | 0.940 | 3 |
| belongfeast/s107 | 4 | never | never | never | — | 5 |
| belongfeast/s218 | 4 | never | never | 13 | 0.956 | 7 |
| belongfeast/s329 | 4 | 30 | 26 | 13 | 0.951 | 3 |
| belongfeast/s440 | 4 | never | never | never | — | 4 |
| belongfeast/s551 | 4 | never | never | never | — | 3 |
| belongfeast/s662 | 4 | never | never | never | — | 2 |
| belongfeast/s773 | 4 | never | never | never | — | 2 |
| belongfeast/s884 | 4 | 21 | 17 | 12 | 0.940 | 6 |

### PRIMARY: 16/16 — GO (bar ≥ 10)

The cumulative −5000 arms **day 4 on all 16 runs**, both roads, every seed
— the trustcensus day-4 finding reproduced exactly on the FEASTSCALE
substrate. The dated-voluntary ledger arms 17–26 days later on 4 runs and
**never on 12**. Every arming bearer shows delta ≥ 17 or never. The
steve-call's counterfactual is measured: had the bars read the dated
voluntary ledger, the −5000 bar would have stayed silent for the entire
run on 12 of 16 bearers — and on the 4 where it did arm, it armed 17–26
days after the cumulative bar had already fired on the meals.

The 4 voluntary-armers are instructive, not exonerating: leadfeast/s884's
bearer voluntarily took 900 kcal early, then binged ~4,500 kcal on days
21–22 (volArm=22, 18 days after the cumulative armed on day 4). Even on
the one road where the scholar actually takes like a hoarder, the
cumulative bar fires first — on the bowls.

### CO-PRIMARY: 13/16 — GO (bar ≥ 8)

Cold-shoulder fiction fired 68 times across the 16 runs (2–7 firings per
run — every successor re-arms the cumulative within 2–6 days of taking
the mantle, and the village goes quiet around each of them in turn). On
**13/16 runs, at least one firing landed with voluntaryNet7 ≥ 0** — the
freeloader clock, reading the same dated-voluntary ledger, saw no net
drain while the fiction said "I know why."

The 3 NO-GO runs (belongfeast/s662, leadfeast/s551, leadfeast/s662) are
the honest negatives: on those, every firing caught the bearer mid-drip
(voluntaryNet7 −800 to −5,214). The instrument does not manufacture
positives — A7's fixture proved it returns false on a draining ledger,
and 3 live runs agree.

The extreme, belongfeast/s551 day 56: **vn=0, vn7=0, mealShare=1.0** —
the cold shoulder fired on a bearer with ZERO voluntary takes and ZERO
gives in their entire book. The fiction blamed them for nothing but the
village's own bowls. (Full quotes in the sense-test.)

### Justice-heat tiers (c)

The −15000 tier (heat+25 — the cold-shoulder trigger) landed on **6/16
runs at days 12–13**, with the cumulative **94.0–95.6% meal-inflated** at
landing. The moot ladder's fuel is served food: at the moment the village
decides it has gone quiet around the scholar, nineteen twentieths of the
"theft" is the village's own feeding. The counterfactual tiers on
voluntaryNet: **never on 16/16** (volTier10/volTier25 null everywhere) —
no bearer ever took 5,000 voluntary kcal, let alone 15,000.

The −5000 tier (heat+10) is the engine arm day itself (day 4, all runs).

### The trust-take stings

"Someone watches you load up. They say nothing." — the trust −2/take
firing — sounded **38 times on leadfeast/s884 and 32 on belongfeast/s884**,
zero elsewhere. Those are the two runs where the bearer voluntarily
take-binged (days 21–22); the sting is the engine bar punishing real
takes — 18 days after it had already armed on the meals. The bar punishes
the bowls silently (no sting, no fiction — just the −2 on later takes)
and the takes loudly, in the wrong order.

### Per-bearer grind (the village's rhythm)

belongfeast/s218 (14 successions): every successor re-arms the cumulative
2–6 days after taking the mantle (engArm = span start + 2–6d); the
voluntary ledger never arms for 13 of 14 bearers. The village is a ledger
meat grinder: each bearer is fed for ~4 days, the bar arms on the bowls,
trust grinds down, the cold shoulder fires, half-rations set in, the
bearer dies or is exiled, and the next bearer steps into a fresh book —
which the bowls re-arm within the week. The village forgives by
replacement (trustcensus), and the ledger re-indicts by feeding.

## SENSE-TEST (Steve's law — the fiction read against the ledger)

The beats are well-written — people reacting, not robots. "Something has
shifted. Conversations stop when you approach the fire. Nobody meets your
eyes for long." lands as weather; the journal line is the colder knife.
But the blame assignment does not survive the ledger.

**Worst offender — belongfeast/s551, day 56** (firing day 56, beats day
57; vn=0, vn7=0, mealShare=1.0):

> "Something has shifted. Conversations stop when you approach the fire.
> Nobody meets your eyes for long."
> 📓 "The village has gone quiet around me. I know why."

The bearer had taken nothing voluntarily and given nothing — their entire
book was the village's bowls, and the village went quiet around them for
it. "I know why" reads as false consciousness: the scholar believes they
know, and what they "know" is the ledger's fiction. The village fed them,
then read its own feeding as their hoarding, and the scholar internalized
the charge.

**Typical — belongfeast/s218, day 13** (vn7=0, vn=−750, mealShare=0.956):
the same two beats, fired while the dated-voluntary ledger showed one
750-kcal voluntary take twelve days prior (outside the freeloader
clock's window — vn7=0) and 95.6% bowls. The fiction is 19/20ths wrong
about what it punishes.

**Verdict**: the cold-shoulder fiction passes as people — but it is the
village blaming the scholar for the village's own generosity, and the
scholar agreeing. If the bars read the dated voluntary ledger, 13 of 16
first-firings would not have fired when they did (and the 3 honest
negatives show the fiction working as intended when the drip is real).

## What the village looked like (assessor's notes)

Sixteen feastscale courtship villages, living the trustcensus opening on
a richer substrate: four days of bowls, then the ledger arms against the
eater — now with feasts in the mix (FEASTSCALE_R13=1), which did not move
the arming by a single day. Who thrives: the SUCCESSORS — bearers 2–15
step into fresh books and eat full rations until the bowls re-arm the bar
against them too (2–6 days). Who dies: everyone, eventually — 150
player:combat deaths and 120 monster:villager-combat deaths across the
sweep; the ledger never kills directly, it starves by half-ration
(player:starvation 4, but hunger-days pile up under the throttle).
Knowledge/capabilities missing: the scholar's give side is still ~zero on
most bearers (the trustdelta absent-generosity finding, unchanged) — so
the voluntary ledger's silence is partly the policies never donating,
and the counterfactual's "never arms" is the honest sum of (no takes) +
(no gives). The blank this run fills: the #340 counterfactual, measured
— the bars punish served food 17+ days (or forever) before any voluntary
take would trip them. The blank it documents: the cold-shoulder fiction's
"I know why" is the ledger's fiction, not the scholar's — filed below.

## Wall numbers (standing directive)

national 13/16; table 15/16; won 0/16; wave4 15/16; wave5 8/16;
median survival 134d; max 180d.
The scale wall stands but the on-ramp moved on this substrate: national
in 13/16 (vs 9/16 on the trustcensus substrate), the table invited in
15/16 — yet zero wins. Deaths are combat-shaped (monster:combat 255,
player:combat 150, monster:villager combat 120); starvation is present
but not the modal killer. The feast layer got the courtship roads to the
table's door; nothing in this diagnostic explains why none walked through
— that is the sibling lever loop's axis, not this run's.

TELEMETRY DEVIATION CHECK: not run by this worker (coordinator step per
the loop body); per-seed evidence glob
evidence/2026-10-16/perseed-ledgerdiag/ is in place for it.

## Metric review (§14)

GO as pre-registered on both binding metrics: PRIMARY 16/16 ≥ 10
(cumulative arms day 4 everywhere; voluntary arms ≥17d later or never);
CO-PRIMARY 13/16 ≥ 8 (cold-shoulder with voluntaryNet7 ≥ 0). No
re-scoring was needed or done — the 3 co-primary negatives are reported
as negatives. Notes for the NEXT run:
1. The co-primary's "voluntary net" mapping (trailing-7d = the
   freeloader-clock reading) was fixed in the pre-registration header
   before the sweep; the cumulative-dated form is reported alongside in
   every firing (nVoluntaryNetNonneg in the JSON). Future diagnostics
   should keep both — the gap between them (vn7=0 with vn=−750) is itself
   informative about recency vs lifetime blame.
2. The recon check initially false-positived on runs ending mid-day
   (engine takeRate7 windows the current scholar.day; the last dawn row
   windows the last night). Fixed to same-point-in-time comparison;
   final recon 0/16. The SMOKE same-point-in-time check was the binding
   honesty proof throughout.
3. Cold-shoulder beats fire on stageEvent.day + 1 (dawn labels the
   transition a day early); beat matching is ±1 day. A future instrument
   should confirm the ordering against advancePart rather than rely on
   the empirical offset.
4. Per-bearer cold-shoulder counts (2–7/run) suggest a "ledger meat
   grinder" metric — successor re-arm latency — worth pre-registering
   in the next trust-axis diagnostic.

## Convergence state

**converged** (diagnostic complete; instrument GO). The #340
counterfactual is measured: the trust/justice bars punish served food —
the cumulative −5000 arms day 4 on 16/16 bearers while the dated-voluntary
ledger stays silent (12/16 never arms; 4/16 arms 17–26 days later); the
cold-shoulder fiction fires with a clean dated-voluntary ledger on 13/16
runs; the −15000 justice tier lands 94–96% meal-inflated on the 6 runs it
reaches. The steve-call evidence is decisive.

## New open findings (for the backlog — not chased)

- [open] 2026-10-16 — food/trust — THE COLD SHOULDER'S "I KNOW WHY" IS
  THE LEDGER'S FICTION (sim-ledgerdiag-b): the journal beat asserts the
  scholar knows why the village went quiet, but on 13/16 runs the dated-
  voluntary ledger was clean (vn7 ≥ 0) — including one firing (belongfeast
  s551 d56) with literally zero voluntary takes and zero gives in the
  bearer's entire book. The scholar internalizes a charge the village's
  own bowls manufactured. If the bars move to the dated voluntary ledger,
  the fiction needs a new trigger line for the meal-driven case — or the
  fiction should only fire when the dated ledger agrees. steve-call
  adjacent: the fiction currently testifies for the prosecution on
  manufactured evidence.
- [open] 2026-10-16 — food/trust — SUCCESSOR RE-ARM LATENCY 2–6 DAYS
  (sim-ledgerdiag-b): every successor re-arms the cumulative −5000 within
  2–6 days of taking the mantle (fresh book → ~4 days of bowls → armed),
  while their voluntary ledger never arms. The village re-indicts each
  bearer for being fed. Worth a pre-registered metric next run; if the
  bars move to the dated ledger, this latency becomes the honest
  voluntary-take latency instead.
- [open] 2026-10-16 — scale — TABLE INVITED 15/16, WON 0/16 ON THE
  FEASTSCALE SUBSTRATE (sim-ledgerdiag-b): the feast layer walks
  courtship roads to the table's door (national 13/16, invited 15/16)
  but nobody sits/wins. Outside this run's axis (food-economy
  diagnostic) — flagged for the scale-onramp loop, which owns the
  table-sitting question.
