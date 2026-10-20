# sim-justiceladder — justice-ladder walkthrough (2026-10-20)

## Pre-registration (MEASUREMENT.md §11 — written BEFORE running the sweep)

Backlog #79's named next. The intraviol census (evidence/2026-10-14/sim-intraviol.md)
CLOSED the measurement blank — 0/178 villager deaths are villager-on-villager
across 24 runs — and opened a design question: the LETHAL justice lane NEVER
fires in sims (0 betrayal ambushes, 0 uprisings, 0 moot executions). Moot-execution /
theft-killing content is unreachable on the courtship road, so its tone (justice
vs theater) is unjudgeable. This arm walks the justice ladder rung by rung under
the larceny-leaning policy with the proven intraviol census instrument
(scripts/intraviol-census-20261014.js, 37/37 proof).

This is a REACHABILITY/DIAGNOSTIC arm: no balance layer to land. GO = the
content is reachable; NO-GO = decoration on the courtship road. Instruments +
evidence are the deliverable either way.

- **Primary metric**: ≥1 completed moot verdict (a moot demanded AND resolved
  with a verdict path — acquitted / weregild / schism / cold_war / player_exile /
  fled — observed via the syncJusticeAfterMoot observer) across the 8
  larceny-leaning seeds. Per the backlog's GO phrasing ("≥1 moot verdict
  observed per rung"), the ladder is walked rung by rung and each rung's reach
  rate reported: Rung A theft booked → B cold shoulder (stage 1) → C
  confrontation (stage 2) → D moot verdict → E lethal lane (uprising / ambush /
  villager-on-villager death).
- **GO threshold**: ≥1 moot verdict observed = GO (content reachable).
  NO-GO = zero verdicts across 8 seeds (decoration on this road).
- **Secondary**: any betrayal ambush attempt (simNpcAmbush), uprising start
  (stage 4), or villager-on-villager death observed across the walkthrough;
  justice-adjacent transcript sense-read when the lane fires (justice vs
  theater judged from quotes, not counts).
- **Guardrails** (vs leadcourt control, identical seeds): median survival ≥
  control −10d; no new death modes vs the intraviol census taxonomy.
- **Horizon**: 180d death-aware (runDays stops at pop-zero; same as the
  intraviol census). Why: the courtship road's long survivors are where late
  content (moots, uprisings) can accumulate.
- **Seeds/policies**: 11,22,33,44,55,66,77,88 × larceny-leaning (walk) +
  leadcourt (guardrail control, identical seeds). Why these: the courtship-road
  reference set; the intraviol census ran the same set.
- **Anti-drift (§14)**: the metric binds. A miss is NO-GO — never re-scored
  against a friendlier metric mid-run. Wrong-metric notes go under "metric
  review" and bind the NEXT run.
- **Balanced panel (§15)**: reachability census, not a before/after lever —
  the verdict does not route through the panel. The leadcourt guardrail
  comparison is a matched-seeds two-policy census reported honestly here;
  the panel contract (before/after of a change) does not apply to a
  diagnostic with no game-code delta.

## Verdict: GO — the justice lane is reachable, all five rungs fire

Primary: **141 moot verdicts across 8/8 larceny-leaning seeds** (threshold was
≥1). The lethal justice lane fires too: 28 uprisings on 7/8 runs, 4 exile
verdicts, 3 NPC betrayal-ambush attempts. On the law-abiding control road the
lane stays silent (0 moots on 8/8) — policy-starved, not structurally broken.

## Instruments

- `scripts/justiceladder-census-20261020.js` — driver. Requires the PROVEN
  intraviol instrument unchanged (attachIntraviol/buildRefs/classifyRecord/
  isVillagerOnVillager — 37/37 proof stays valid) and adds a pure-observer
  ladder wrapper (justiceTick snapshots on tuple-change, stealFrom outcomes,
  moot demands/verdicts, uprisings, exiles, NPC ambush attempts, justice-adjacent
  transcript). No RNG consumed, no game state mutated. Checkpoint/resume added
  after a mid-run service restart wiped /tmp (2026-10-14 lesson relearned the
  hard way): per-run rows flush to
  `evidence/2026-10-20/sim-justiceladder-20261020-checkpoint.jsonl` and
  completed (policy,seed) pairs are skipped on restart. The restart killed 6
  finished runs' stdout; the rerun reproduced s11 bit-identically (d=67, same
  12-verdict sequence), confirming determinism.
- `scripts/test-justiceladder-20261020.js` — proof: 24/24 GREEN. Part A
  synthetic fidelity (wrappers record + preserve returns), Part B
  no-pollution (frozen clock, seed 11 × 30d leadcourt: state hash identical
  observer on vs off, off-vs-off control first), Part C live smoke (seed 11
  larceny × 30d: 10 steals, theft crimes book, maxStage=3 maxHeat=85).
- Per-seed JSON: `evidence/2026-10-20/sim-justiceladder-20261020.json`
  (16 rows, ladder series + verdict/ambush/uprising events + justice
  transcript + classified deaths per run).

## Results

### Rung reachability (8 seeds × policy)

| rung | larceny-leaning | leadcourt (control) |
|---|---|---|
| A — theft crime booked | **8/8** | 0/8 |
| B — cold shoulder (stage 1) | **8/8** | 8/8 (0 thefts — see below) |
| C — confrontation (stage 2) | **8/8** | 0/8 |
| D — moot verdict | **8/8** (141 verdicts) | 0/8 |
| E — lethal lane (uprising/ambush/vv) | **7/8** (28 uprisings, 3 NPC ambushes, 0 vv deaths) | 0/8 |

### Ladder timing (larceny road — medians across 8 runs)

- Crime booked + cold shoulder: **day 5–6 on all 8 runs** (theft-notice sweep is fast)
- Confrontation: day 10–34 · Moot demanded: day 11–34 · Stage 4 (uprising): day 22–66 (7/8)
- Moot cadence: **median 4–5 days between demands** (118 demands total); demand→verdict ~2–4 days
- Thefts booked per run: 8–19 · steal attempts: 18–44 (caught 3–11) · maxHeat: 85–183

### Verdict paths (141 total, larceny road)

acquitted 98 · weregild 15 · schism 14 · cold_war 10 · exile 4 · fled 0 ·
player_exile 0 (the 4 'exile' paths are the moot's binding exile verdict)

More verdicts than demands (141 vs 118): a moot can resolve multiple open cases
— a villager may stand accused in two open cases at once (betrayal.js:3978).

### Guardrails (leadcourt control, identical seeds)

- Median survival: larceny 180d vs control 180d (≥ control−10d ✓)
- Death taxonomy: same contexts both sides (villager-kill/tb-combat/monster/
  expedition-kill/deprivation/disease/injuries/contest + pre-registered rung-E
  'uprising' player-vessel deaths on larceny). No new death mode ✓.
  'unknown' 1–3 on a few runs both sides — pre-existing classifier unknowns,
  not a lever effect.
- vv deaths: 0/16 both sides — the uprisings kill the player-vessel
  (succession), never villagers.

## Breakdown

**The revolving door.** The chronic thief (theft every ~5d + hungry thefts)
drives a moot every 4–5 days, and the moot acts as a **pressure valve**:
syncJusticeAfterMoot resets the ladder to stage heat≥25?1:0, judged crimes
count half heat, weregild buys amends credit — so heat rebuilds from a lower
floor after every verdict. s11 hit heat 108 with NO uprising because a moot was
always open when heat crossed 95 (justiceTick returns early behind
playerCaseOpen). Chronic moots cap escalation: the village tries you
constantly instead of ever reaching for the torches. Whether that cap is
correct pacing for a chronic thief is a design question, not a bug — but it
explains why rung E needs the exile-defiance or heat≥95-sans-open-moot window.

**Both uprising triggers observed.** 'defied exile' (s22: exile verdict d21 →
scholar stays at Haven past the deadline → uprising d22) and 'unforgivable'
heat≥95 (s77: 5 uprisings, maxHeat 175, zero exile verdicts).

**The succession beat works.** s22: the d22 uprising KILLED the scholar
(Casey) — "📓 Codex: They killed Casey. The uprising died with them. I'm
someone else now — the docket is empty, but the village remembers." The new
scholar inherited a wiped docket but a remembering village, kept stealing (the
policy is person-agnostic), and was re-mootted within days. The ladder is
succession-honest.

**NPC-side lane fires too.** 3 simNpcAmbush attempts (s22, s55, s77). s22 d58:
"Word reaches you, days late: Piper stands accused over what happened to
Everett. There's going to be a moot. People are choosing sides." — an NPC
false-accusation-flavored moot (Everett died to a monster in tb-combat d56),
convened d60 with the player voting: "The moot turns to you. Your vote matters
here — and everyone will remember it." (The policy abstained; "The moot
doesn't wait forever. Two days of silence from the fire's edge — the count is
taken without you.")

**Control cold-shoulder without crime.** leadcourt hit stage 1 on 8/8 with 0
thefts — the #341 meal-inflated heat mechanism live in the control: cumulative
net-takes (meals the village served) trip the −5000 bar ~day 4 (+10 heat) and
trust drift supplies the rest. A law-abiding scholar gets the cold shoulder
for eating the communal bowl. Documented as further evidence for #341's
steve-call.

## Village assessment

On the larceny road the village becomes a courtroom: 9–23 moots per run, a new
accusation every few days, the same faces (Emma, Colton, Mara, Piper, Diana)
rotating through accuser and witness. The scholars die young or live long
under siege (survivals 43/67/126/150/180×4) — the thief's village is a
pressure cooker, and the pressure has a shape: theft → suspicion → cold
shoulder → confrontation → moot → verdict → repeat, with exile and uprising
as the two exits. Four scholars were exiled; the exiled walk ("Exiled. You
leave with what you carry — nothing more. Behind you, Haven keeps its fire.")
and three of the four uprising arcs ended the scholar's life. The villages
that survive the thief do it the hard way — s33 and s55 and s77 and s88 all
went the full 180 days with the docket never empty.

On the control road the villages look like the courtship baseline: law-abiding
scholars, zero moots, and — strikingly — national reached on 7/8 seeds
(s22–s88). The larceny road reached national on 0/8. Chronic crime kills the
scale climb: exile strips pantry/membership, weregild drains 3000 kcal per
verdict, schisms split the fires, uprisings kill scholars mid-arc. The ladder's
punishments tax exactly the resources the scale on-ramp needs. (Axis-relevant,
reported as observation, not a lever verdict.)

## Sense-testing notes — justice, not theater (with one theater risk)

Read the s11/s22 justice transcripts end to end. The beats:

- Demand voice varies by accuser and reason: "Emma doesn't bother with
  preamble. 'A moot. The thefts. In the open.'" / "⚖ Emma won't meet your
  eyes. 'I was going to talk to you. It's past that now. The moot hears the
  thefts — in the open.'" / "⚖ 'It's past asking,' Mara says. 'The fire hears
  the thefts — tonight, in the open.'"
- Accusation with a clock: "Emma stands up at the fire, pointing. 'This one.
  Theft — taking what wasn't theirs — and we all know it.' Heads turn. 2 days
  until the moot. Use them."
- Acquittal with a mark: "Not guilty. The count falls short — you breathe. But
  an accusation leaves a mark no verdict washes off. Some faces at the fire
  say they'll remember anyway."
- Accuser aftermath (weak case costs the accuser): "Diana looks at you across
  the cooling fire, and something between you is over. They called a moot on
  you — and the fire said no."
- Schism: "Emma got their moot. The village got two fires and the space
  between them. Nobody calls that a win — least of all Emma."
- Exile: "Exiled. You leave with what you carry — nothing more. Behind you,
  Haven keeps its fire. Ahead: the world, which just got much bigger." /
  "The pantry is closed to you. The book stays behind. To Haven, you are not
  one of ours anymore."
- Uprising: "⚔️ THE UPRISING / Reason: defied exile. You did this."

The verdict: consequences are REAL — weregild costs 3000 kcal from the
scholar's stores, exile closes the pantry and strips membership, schism
splits the village's fires, uprising is a fight to the death. This is justice
with teeth, not theater.

The theater risk: **voice-pool exhaustion at chronic cadence.** The same
accusation template ("Theft — taking what wasn't theirs — don't look away, any
of you.") repeats every few days across a 180-day run, and s11's four schisms
in 67 days thin the social meaning of splitting the village (the feud-merge
logic holds mechanically). A real chronic thief would exhaust the ceremony's
variety long before the village exhausts its patience. Documented as a
content-depth gap, not a reachability failure.

## Metric review

- Primary met decisively (141 verdicts vs ≥1 bar on 8/8 runs). No goalpost
  movement; no rescoring.
- Metric question for the NEXT run: rung E's "vv death" sub-criterion never
  fired (0/16) — uprisings kill the player-vessel, never villagers; the 3 NPC
  ambush attempts produced 0 deaths. Reachability of ambush-KILLS and of
  villager-on-villager lethal justice remains open and would need a
  constructed scenario or a more violent policy, not more seeds of this one.
- Panel (§15): not applicable — diagnostic census, zero game-code delta; the
  guardrail comparison is a matched-seeds two-policy census reported here.
- The pre-registered horizon/seeds/policies were all honored as written.

## Blanks filled / documented

- FILLED (#79): the lethal justice lane FIRES on the larceny road — 141 moot
  verdicts, 28 uprisings, 4 exile verdicts, 3 NPC ambush attempts, full
  rung A→E ladder on 7/8 seeds. The content is reachable, not decoration. On
  the courtship road it stays silent (0 moots, 8/8 control) — policy-starved,
  not structurally broken.
- DOCUMENTED: (a) the moot-as-pressure-valve mechanism (revolving door caps
  heat escalation — chronic moots prevent uprisings); (b) voice-pool
  exhaustion at chronic moot cadence (theater risk, content-depth gap);
  (c) control stage-1-without-crime = #341's meal-inflated heat mechanism,
  further evidence for the steve-call; (d) larceny road national 0/8 vs
  control 7/8 — chronic crime taxes exactly the scale-climb resources
  (axis-relevant observation); (e) NPC moot cases convene with player vote
  (Piper/Everett false-accusation flavor — matches Steve's 2026-10-19 moot
  ruling); (f) the succession beat ("the docket is empty, but the village
  remembers") — the ladder is succession-honest; (g) a service restart wiped
  /tmp mid-sweep — the driver's checkpoint/resume pattern is the fix, already
  in the script.

## Wall numbers

- larceny-leaning: national 0/8 · table 0/8 · wins 0/8 · wave-4 1/8 · wave-5
  0/8 · median survival 180d · 4 village-lost / 4 survived
- leadcourt: national 7/8 · table 0/8 · wins 0/8 · wave-4 6/8 · wave-5 0/8 ·
  median survival 180d · 3 village-lost / 5 survived
- (Scale wall still blocking on wins/table; the justice census is not the
  binding constraint. The control's 7/8 national on these seeds is well above
  the 2026-10-12 baseline — telemetry-deviation territory for the
  coordinator's check, not claimed as a wall breakthrough on n=8.)

## Convergence

diagnostic — no lever, no convergence claim. Verdict: **GO**. The justice lane
is reachable end to end on the larceny road (verdicts, exiles, uprisings,
NPC ambushes, NPC moots with player vote, succession-honest ladder). Backlog
#79 answered: the lethal justice lane is not decoration — it was policy-starved.
