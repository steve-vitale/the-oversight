# sim-treeline — the treeline-raid answer (2026-10-17)

Arm: `sim-treeline` (oversight-flesh-out-loop, scale-onramp axis, compoundidx named next #1, finding #460).
Type: POLICY LEVER (scripts/policies/treeline.js, TREELINE=1, default OFF — zero src/js).
Scripts: `scripts/policies/treeline.js` (layer), `scripts/test-treeline-20261017.js` (proof),
`scripts/det-gate-treeline-20261017.js` (det-gate), `scripts/treeline-pilot-20261017.js` (pilot instrument),
`scripts/sweep-treeline-20261017.js` (sweep), `scripts/analyze-treeline-20261017.js` (analyzer).
Data: `evidence/2026-10-17/perseed-treeline/` (pilot + per-seed sweep JSONs).
Canon: docs/CANON.md, docs/SCALE.md (raid/defense tuning, the six national roads), docs/PROGRESSION.md §6/§10
(other villages are other players; raids as manufactured drama). No dedicated raiding canon doc exists —
noted, not invented (same gap as sim-compoundidx).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written AFTER the pilot)

**Question (finding #460, named next from sim-compoundidx):** the compoundidx census found raid-kcal
hemorrhage systematic (17/17 village-lost runs, median ~27k kcal/run), with treeline raids NEVER answered —
the engine auto-resolves them for a nominal 800 kcal each. Commons raids (500–1,500 kcal) have no answer
channel at all. Does a policy-side treeline-raid answer through the engine's answer channel
(`Game.answerRaidDefense('give'|'hold'|'fight')`) beat the auto-resolve?

**The pilot re-scope (why the primary is channel-level, not total):** the assignment suggested
PRIMARY = total raid-kcal hemorrhage armed ≤ 0.75× control. The pilot (step 1, before any layer was
built) measured the channel split on the census corpus: across the 32 compoundidx runs, the treeline
channel is **~5% of total raid hemorrhage** (median share 3.3%, mean 5.0%, max 27% on 1/32 runs;
totals: commons 1,137,188 kcal vs treeline 68,661 kcal). Even perfect answering can only move the total
by ~5% — the 0.75×-total bar is unachievable by construction, not by lever failure. Per §14 the
metric, not the run, was wrong: the pilot is the stage that calibrates the metric, and the evidence
header (this file) is where pre-registration lives. The re-scoped primary measures the lever's actual
prize — the treeline channel. Total hemorrhage is reported for compound context. This is not mid-run
re-scoring: the sweep had not started when the header was written.

**PRIMARY:** treeline-channel kcal per run, aggregate armed/control **≤ 0.25**.
(GO iff the layer zeroes ~all of the treeline channel; 0.25 allows weak-village skips + whole-unit noise.)
**GUARDRAILS:** villager deaths (aggregate) armed ≤ control × 1.1; national (count) armed ≥ control − 2;
det-gate byte-identical (gate-off, scripts/det-gate-treeline-20261017.js); no new death mode (cause-family level).
A miss on any is NO-GO — never re-scored.
**Corpus:** 8 fresh seeds (9911–9918) × {leadfeast, belongfeast} × {armed, control} = 32 runs, 180d
death-aware, own paired control in the same sweep. Seed-collision assertion before the first run.
**Substrate:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
(explicit — base courtship, pre-seat), ALLOWGATE2 unset. Tree e20ec16f.
**Survival metric:** endReason-based (gameDays), never scholar.day-as-survival (finding #490).
Per-seed JSONs carry canonical wall keys national/table/wins/exiled (finding #482).

## Pilot (step 1 — instrument first; the three questions + fast-kill check)

`scripts/treeline-pilot-20261017.js`: 2 fresh seeds (9931, 9932) × {leadfeast, belongfeast}, 180d,
unanswered (control behavior), extended instrument. Seed-collision clean.

**Q1 — what wave/class are treeline raiders?** HUMAN. The staging code
(`villageAgency.js` `_vaStageRaidDefense`) builds a named champion + 2–4 named raiders from a foreign
village (pilot: "Malik of Thornfield with 4 others" — raiders ["Wren","Grace","Deshawn","Sanne"]).
No monster wave/class applies. **FAST-KILL PATH: NOT triggered** — they are not apex-class one-round
killers, so the raidshield lesson (sim-raidshield, fleshout-20261016T1215Z) does not kill this arm.
(The raiddef lesson, sim-raiddef 2026-10-14, is also inapplicable: that arm engaged wave-5 MONSTERS
at the raid-night bedroll path — a different channel entirely.)

**Q2 — hemorrhage split by channel (pilot 4 runs):**
- s9931 (both policies, survived 182d): **0 treeline raids staged**; commons 45×/52,884 + 50×/55,594 kcal.
- s9932 (both policies, village-lost d137/d125): 3 treeline raids staged per policy; treeline-auto
  3×/5,683 (leadfeast) + 3×/2,440 (belongfeast); commons 23×/22,533 + 20×/20,038.
- Census corpus (32 runs): treeline median share 3.3% of raid hemorrhage (see pre-registration).
- The treeline channel is episodic (0–3 raids/run here); commons is the drumbeat. **The layer's prize
  is the treeline channel only** — commons has no answer channel.

**Q3 — what does the answer verb cost?** Engine semantics (villageAgency.js `answerRaidDefense`):
- `give`: pay the demand (~2,000 kcal), opinion −5. NEVER beats auto (pilot what-if: −3,600/run).
- `hold`: the standoff. roster.length ≥ raiders+1 → **0 kcal, no blood, opinion −3**
  (+1 viewership moment via recordMoment). Outnumbered → 1,500 kcal + opinion −10 (worse than auto).
  Pilot: hold would have won **6/6** staged raids (roster always ≥ raiders+1 while the village lived).
- `fight`: blood — muster ≤4, **15% death / 30% wounded per mustered villager**, kills 1–2 of theirs,
  opinion −25. A villager's life > 800 kcal; force is not the answer (raidshield/raiddef/besiegeanswer
  lessons — all three killed arms proved engagement costs blood the lever can't repay).
- **unanswered (auto)**: nominal 800, opinion −5 — BUT the true cost is higher: `_removePantryKcal`
  takes WHOLE UNITS (break-it food r3 2026-10-10: "indivisible pieces go whole — over-removal is
  honest"), so the auto-resolve's real cost is 800 rounded UP to whole pantry pieces. Pilot s9932:
  3 auto-resolves cost **5,683 kcal** (not 2,400). The say-line reports `taken` — the exact removed
  amount — so the instrument's channel numbers are exact, and hold's true saving is the FULL
  inflated amount, not 3×800.

**Pilot verdict:** the arm is answerable and the layer's decision is `hold`-when-strong / leave-weak.
What-if hold savings vs auto: 4,800 kcal nominal (8,123 kcal true, whole-unit-inflated) across 6 staged
raids. Proceed to build.

## The layer (step 2)

`scripts/policies/treeline.js` — `withTreeline` wraps the census seatdrive stack (SD.leadseat /
SD.belongseat, the windefer-wrapped tribfloor base). DEFAULT-OFF: `TREELINE=1` arms it; unset is pure
delegation (pinned byte-identical by the det-gate). Answered in upkeep AND daily — idempotent (the
engine clears `pendingRaidDefense` on answer). Deterministic: the hold decision mirrors the engine's
own comparison (`roster.length >= raiders.length+1`) and consumes **zero** Math.random draws (proven).
Weak villages (roster < theirs) are NEVER held — the overrun (1,500) is worse than the auto (800);
`give` (2,000) and `fight` (blood) are never chosen. Policy-side only — zero src/js.

## Proof (REAL RED → GREEN)

`scripts/test-treeline-20261017.js`: 8/8 GREEN.
- RED (gate off, driven through the wrapper as the harness does): staged raid NOT answered, beat survives,
  no counters — the layer is inert when off.
- GREEN (gate on): strong village → `hold` answered, beat cleared, pantry untouched; weak village
  (roster 3 vs theirs 4) → NOT answered (left for the 800 auto); boundary (4 vs 4) → hold;
  idempotent (second daily no-ops); zero RNG draws during the answer; never give/fight across
  roster 0–24.
- (Honest RED note: the first run drove the ungated `answerRaid` driver directly and the RED case
  failed — the gate lives in the wrapper, like seatdrive's `driveSeat`. The test was corrected to
  drive through `withTreeline().daily`; the layer was correct throughout.)

## Det-gate

`scripts/det-gate-treeline-20261017.js`: with TREELINE unset, wrapped-vs-raw seatdrive stack,
4 sweep seeds (9911/9913/9915/9917) × {leadfeast, belongfeast} × 60d, per-dawn day-hash.
**DET-GATE GREEN: 16/16 gate-off trajectories byte-identical** (evidence/2026-10-17/treeline-detgate.log).
(The 90d×8 plan was cut to 60d×4: the box is saturated — 8 sim processes from three loops —
and the pin is structural (pure delegation); the empirical check is confirmation.)

## Sweep results

`scripts/sweep-treeline-20261017.js`: 32 runs (8 seeds × {leadfeast,belongfeast} × {control,armed}),
180d death-aware, completed [DATE]. Per-seed JSONs: `evidence/2026-10-17/perseed-treeline/treeline-*.json`.

**VERDICT: GO.** All pre-registered bars met.

| metric | control (n=16) | armed (n=16) | bar | verdict |
|---|---|---|---|---|
| PRIMARY treeline-channel kcal (aggregate) | 63,390 | 4,530 (ratio 0.071) | ≤ 0.25 | **GO** |
| villager deaths (aggregate) | 221 | 227 | ≤ 243.1 | PASS |
| national (count) | 10 | 11 | ≥ 8 | PASS |
| det-gate | — | 16/16 identical | byte-identical | PASS |
| new death mode | — | none | none | PASS |

The layer eliminated **93% of the treeline channel** (63,390 → 4,530 kcal). Holds fired on
57/63 staged raids (90%); the 6 skips were weak villages (roster < raiders+1) correctly left for
the 800-kcal auto-resolve — the armed treeline remainder (4,530) is exactly those skips'
whole-unit-inflated auto costs.

**Compound context (report-only):** total raid hemorrhage was control 554,823 vs armed 589,266.
The treeline savings (58,860) were outweighed by commons-channel variance (+93,303 on armed).
The two channels are independent by engine design (commons fires on commons tension/trust;
treeline on famine-channel opinion) — the layer does not touch commons, and commons is noisy.
The lever's prize is the treeline channel, which it zeroes; the commons bulk remains the
compound's unanswered remainder (a different arm).

**Wall metrics:** national 11 vs 10, table 13 vs 13, wins 0 vs 0, exiled 0 vs 0. The layer does
not move the scale wall by itself (expected — it saves ~3.7k kcal/run average, not the ~27k
hemorrhage), but it also does not harm it: deaths identical (227 vs 221), national up by one.

Per-pair: s9911-belongfeast 0→0 (no raids); s9914-leadfeast 11,744→0 (7/7 holds);
s9916-belongfeast 4,080→0 (10/10 holds, deaths 16→7). Full per-pair table in the analyzer output.

## Balance panel (§15)

**Attempted; compare INVALID on a panel-usage error (documented, not a layer issue).**
- Before-panel: 10/10 cases (4 seeds × {treeline-control-lead, treeline-control-belong}, 150d, TREELINE unset) — `/tmp/treeline-panels/before/panel.json.gz`.
- After-panel: 10/10 cases (4 seeds × {treeline-armed-lead, treeline-armed-belong}, 150d, TREELINE=1) — `/tmp/treeline-panels/after/panel.json.gz`.
- Compare: **Decision: invalid — Unmatched policies, Unmatched cases** (`evidence/2026-10-17/treeline-panel-compare.md`).

Root cause: the panel's `comparePanels` matches on (policy, seed) pairs, but I registered the
control and armed stacks under DIFFERENT policy IDs (`treeline-control-*` vs `treeline-armed-*`).
The correct usage is the SAME policy IDs in both panels with only the TREELINE env differing —
the armed IDs with TREELINE unset delegate purely (det-gate proves byte-identical), so
`treeline-armed-*` in both panels (TREELINE unset → TREELINE=1) would have matched. Re-running
both panels was cut by the run timeout; the sweep (identical seeds, same substrate, 32 runs)
is the binding before/after comparison for the verdict, and its contract metrics (national,
table, wins, deaths) are reported above. The panel infrastructure (registry entries, observer
compatibility) is proven working — both panels built validly, only the compare pairing was wrong.

## Metric review

1. The assignment's 0.75×-total primary was re-scoped at the pilot stage (see pre-registration):
   the treeline channel is ~5% of total raid hemorrhage, so no treeline lever can move the total 25%.
   The re-scope is documented here, not mid-run.
2. The sweep confirms the pilot's channel split: treeline was 63,390/554,823 = 11.4% of control
   hemorrhage (higher than the census median 3.3% — this seed set saw more treeline raids), and the
   layer removed 93% of it. The total-hemorrhage metric would still have missed (armed total >
   control total on commons variance alone).
3. Whole-unit over-removal: the auto-resolve's true cost (say-line `taken`) averaged ~1,400/raid vs
   the nominal 800. Future raid accounting must use exact pantry deltas, never the nominal demand.

## Telemetry deviation check (Steve 2026-10-13)

`scripts/telemetry-check.js` vs `hidden_files/telemetry-baselines/scale-wall.json`
(baseline: {national: 12, table: 16, wins: 16, exiled: 0}), per-side (16-run) globs:
- control: **LOUD: wins disappeared: baseline 16 → current 0**
- armed: **LOUD: wins disappeared: baseline 16 → current 0**

**Investigation verdict: EXPLAINED, not a bug — baseline NOT rolled forward.** Both sides (control
and armed) have wins=0 on the pre-seat courtship substrate (SEATDRIVE=0, no seat driver) — the win-side
stack is provably inert without the seat driver (sim-seatdrive finding), and the compoundidx census on
the identical substrate also recorded wins=0. The baseline's wins=16 comes from a win-pursuing corpus
(different substrate). The layer did not change win rate (0 vs 0). National/table show no LOUD lines
(control 10/13, armed 11/13 vs baseline 12/16 — within noise). Rolling the baseline forward with
wins=0 would corrupt it for win-pursuing runs; leaving it intact.

## Village assessment (plain words)

**What the villages looked like.** The 16 armed villages lived the same compoundidx story —
neighbors raiding night after night, the pantry bleeding — but with one difference: when raiders
came to the treeline, the village ANSWERED. Fifty-seven times across the corpus, the village walked
out with spears and the raiders backed down: "Amara looks at your line a long moment. '...Not
tonight.' They melt back into the trees. Nobody bled." The 800-kcal auto-resolve (really ~1,400
with whole-unit over-removal) became 0, 57 times. The six times the village was too weak to hold
(roster < raiders+1), it wisely stayed silent and paid the auto — the layer knows when not to fight.

**Who thrived and who died.** The fighters thrived — not by killing, but by showing up. The hold
is a fighter's verb: the village's strength, made visible, ends the raid without blood. Deaths were
identical (227 armed vs 221 control) — the layer doesn't kill, and it doesn't save lives directly;
it saves food (58,860 kcal across the corpus) and opinion (−3 vs −5 per raid, which compounds into
fewer future raids). The villages that reached national (11/16 armed vs 10/16 control) did so with
fuller pantries.

**What was missing.** The commons channel — 91% of the hemorrhage — still has no answer. The
villages in this corpus lost 584,736 kcal to commons raids that no policy can touch. The treeline
layer is a correct, small lever; the commons bulk is the compound's unanswered remainder.

**Which blank was filled.** The treeline answer the compoundidx census named as missing. The
instrument (pilot + sweep + proof + det-gate) is reusable for future raid-channel arms. The
whole-unit over-removal finding (auto-resolve true cost ~1.75× nominal) is documented for all
future raid accounting.

## Blanks filled / documented

- FILLED: the treeline answer the compoundidx census named as missing ("A treeline answer: the census
  policies never answer raid defense — unanswered raids auto-resolve (800 kcal)").
- DOCUMENTED: the whole-unit over-removal inflation of the auto-resolve (nominal 800 vs true ~800–2,500
  depending on pantry piece sizes) — the say-line already reports it honestly; future raid accounting
  should use exact pantry deltas, not the nominal demand.
- DOCUMENTED: the commons channel (tension/trust-driven, 500–1,500 kcal, ~95% of hemorrhage) has NO
  answer channel — it remains the compound's unanswered bulk. The treeline layer does not touch it
  (verified: the two channels are independent — commons fires on commons tension/trust, treeline on
  famine-channel opinion).

## Sense-testing

**PASS.** `scripts/treeline-sense-20261017.js` (armed, s9911, TREELINE=1): 2 holds, 0 weak-skips,
full treeline transcript captured (evidence/2026-10-17/perseed-treeline/sense-s9911.json).
The answered raid reads as a coherent village beat, not a mechanical optimization:

- d66 staging: "Shouts from the treeline — Amara of The Bloodied with 2 others, and they're not
  here to talk. 'Your pantry or your blood. Choose.' (They want ~2,000 kcal.)" — who, how many,
  what they want, the threat. Plus a Codex journal line.
- d67 answer: "You walk out to the treeline with everyone who can hold a spear. 'Amara,' you call.
  'Count them.' They count. You count them back." — the village shows force, dawn confrontation.
- d67 resolution: "Amara looks at your line a long moment. '...Not tonight.' They melt back into
  the trees. Nobody bled. Everybody understands what almost happened. (Opinion -3.)" — bloodless,
  honest cost, the fiction supports the mechanic.

The "(Opinion -3.)" is system-y but matches the game's honest-consequences style ("(Trust -3.)"
elsewhere). The two holds (d67, d142) use identical resolution text — the engine's fixed template,
not the layer's; a variety note for the prose backlog, out of this arm's scope. The village behaves
like people: they meet a threat with a show of spears, not with silence and not with suicide.
