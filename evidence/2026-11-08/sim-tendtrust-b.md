# sim-tendtrust-b — sizing the tend/trust lever for the Binding leg

Run: fleshout-loop-b-20261108T1230Z. Worktree: `~/workspace/worktrees/sim-tendtrust-b`
(branch sim-tendtrust-b, cut at master 715c2918d). Axis: scale-onramp /
winnability chain (converging, NOT converged). Tracker blank (5) from the
1030Z tracker: "the Binding-leg tend/trust DIAG". Prereg:
evidence/2026-11-08/sim-tendtrust-b-prereg.md (commit e121e0356, BEFORE any
judged sweep). DIAG ONLY — zero src/js, no default flips.

## Canon + code read first

- docs/CANON.md, docs/SCALE.md.
- Prior decomposition, NOT re-measured:
  evidence/2026-11-08/sim-binddiag-b.md (0230Z): the national pipeline on
  band 76401–76408 (tableseat-nowait substrate, 180d): links 8/8 → subs 8/8
  → seasoned 8/8 → LEAD qualifies 5/8 → beats staged 4/8 (all First Court,
  all day 77) → national held to end 2/8.
- The tend/trust gate, exactly (`src/js/hierarchy.js`, `src/js/win-plan.js`):
  links form at trust 30; seasoned = 30+ days AND trust 40+
  (`_linkSeasoned`); `tendLink` = 1,500 kcal → +8 trust via `_trustGain`,
  once per week per link (`tendedWeek`), refuses during mourning;
  `_trustGain` is the single choke — no gains land while the link's village
  grieves (`mourningUntil`, 7 days after a speaker death); weekly tribute
  tick: full payment +1, partial −1, nothing −2; NO passive weekly trust
  decay — trust moves only through events. The substrate's rescue-tend gate
  (`leanlinkrescue.js:87`): tends ONLY to Haven-primary links with trust <
  40, once per week, and ONLY when Haven's pantry reads > 20,000 kcal.
- **Second tend source, found in code during this run** (not in the prereg's
  gate list — it is the run's central finding, see Instrument fix below):
  the villagers' own win-plan drive, `winPlanBondsTick` (`win-plan.js:539`):
  tends Haven-primary links with trust < 50, once per week, skipping
  mourning — gated on ≥2 primary links, a plan actor AT Haven, pantryDays
  ≥ 3, and **never while `nationalLive` or a beat is pending**. Same +8,
  same 1,500 kcal, same `tendLink`.

## BASE DRIFT — binddiag's per-seed stories do NOT reproduce on current master

Binddiag ran on master e9399e09e. This run's base is 715c2918d (journey
deepening r119 and siblings landed between). The band's trajectories moved:

| seed | binddiag (old base) | this run (current master) |
|---|---|---|
| 76401 | 90d, won lesser, national d77 | 91d, won lesser, national d90 (leadQ d89) |
| 76402 | 72d village-lost, no national | 72d village-lost, no national (same shape) |
| 76403 | 58d village-lost, no national | 90d, won lesser, national d85 (leadQ d57) |
| 76404 | 88d village-lost, no national | 88d village-lost, no national (same shape) |
| 76405 | 151d village-lost, national d77 lost d147 | 75d village-lost, no national |
| 76406 | 135d, won lesser, national d77 lost d88 re-won d134 | 87d village-lost, national d77 held to end |
| 76407 | 101d village-lost, no national | 146d village-lost, national d121 lost d122 |
| 76408 | 100d village-lost, national d77 lost d92 | 100d village-lost, national d77 lost d92 (same shape) |

National day is no longer structural at 77 (now 77, 85, 90, 121); the
"first link day 25 → regional 46 → national 77" clock from binddiag is
superseded on this base (76401's third sub forms day 59, leadQ day 89;
76407's third sub forms day 83, leadQ day 120). The binddiag trio of
non-qualifiers (76403/76404/76407) is now a different trio (76402/76404/
76405). **This diag is judged on ITS OWN corpus, not on binddiag's
per-seed stories** — the prereg's sizing method (computation from the
corpus) is unchanged, and the lever is sized from what THIS run measures.

## Instrument fix between run 1 and run 2 (no bar changed, no re-scoring)

Run 1 (same band, same seeds) DIAG-GO'd on G1/G2/G3 + cross-check but its
tend log counted **5 tends** — and its overnight ledger showed **69
'tended' history kinds** (sum +536). A tend log that sees 5 tends while
the history names 69 is a contradiction that names an instrument blind
spot, not a game finding: the villagers' own win-plan drive
(`winPlanBondsTick`) tends links engine-side, between the recorder's post
snapshot and the next pre snapshot, so the pre/post tend detection never
saw them. The fix (`scripts/policies/tendtrust-b.js`, proof test extended
to 24 checks): a 'tended' history entry added overnight promotes into the
tend log with source `engine-winplan`, its lift parsed from the note
("trust +N") — the overnight delta can mix the tend with same-night moves
(19/71 engine tends have mixed deltas: 9, 16, 2, 3, 0), and two nights net
to a delta of 0 (tend +8, succession shake −8) that a delta-only detector
would miss entirely. The fix also records `pantryDays` (the engine's own
estimate, the exact number the villagers' tend gate reads) in every
trajectory point. Run 2 re-ran the full sweep on identical seeds and
**reproduced run 1's trajectories exactly** (all 16 configs identical on
days/gameDays/death totals) while counting **76 tends (5 policy + 71
engine)**. No threshold, seed, or horizon changed; the tend log is now
complete as the prereg wrote it. Run 1's corpus was overwritten by run 2's
(same filenames); run 1's verdict lines are preserved in this file, not in
a second corpus.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait. Baseline: tableseat-nowait,
  `TENDTRUST` unset. Armed: tableseat-nowait wrapped with tendtrust-b
  (`TENDTRUST=1`). Own baseline replication (8), NOT another arm's corpus.
- Seeds (pilot): 76401–76408. **REUSED deliberately — same band as
  binddiag. This is a diag on the same band, reuse stated, not
  contamination.**
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary (DIAG-GO, ALL must hold): (1) 8/8 armed configs produce a full
  daily tend/trust corpus (tend log + trust trajectories + shortfall table
  + national-loss dips) with an end snapshot; (2) a per-seed shortfall
  table; (3) a tend census (counts, mean lift, pantry at tend,
  gate-blocked opportunities); (4) a sized lever spec, computed from the
  corpus (never by simulation); (5) G1 det-gate PASS; (6) G2 recorder
  neutrality PASS; (7) G3 corpus integrity PASS (incl. engine-gated
  validation); (8) cross-check PASS (recorder policy tends + refused
  attempts == substrate attempts, refusals mourning-explained).
- Sizing method (computation, never simulation): additional tends per link
  = ceil(trust shortfall / measured mean lift), capped by the weeks
  actually available (1 tend/week/link) and by the pantry-gate feasibility
  (days the pantry actually read above the threshold the lever would set).
  For each national loss, the buffer = the dip size in trust points,
  expressed as tends.
- Cost bar (diagnostic): starvation totals, median days, baseline vs armed.

## RESULTS — DIAG-GO (pilot 8+8, seeds 76401–76408, horizon 180d, death-aware)

Sweep: `node scripts/test-tendtrust-b-sweep.js` (exit 0, run 2).
Corpus: `evidence/2026-11-08/perseed-tendtrust-b/` (16/16 rows + summary.json).
G1 det-gate: PASS (seed 76401, TENDTRUST unset: baseline 91/91 days ==
wrapped 91/91 days, ts counters identical — `tsNationalDay 90,
tsSeatDay 91 lesser` — no `_tendtrust` surface; re-run after the recorder
fix, same result).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
647 = 647 with the same counts in every cause).
G3 corpus integrity: PASS (16/16 rows, all days > 0, every armed row
carries the tend log + trust trajectories + shortfall table + national-loss
dips, every baseline row carries a post-run pure-read end snapshot,
engine-gated validation matches on every armed row).
Cross-check: PASS (8/8 seeds: recorder policy tends + refused attempts ==
substrate `ctx.tended` attempts — 5 + 27 = 32 — and every refused attempt
is mourning-explained, `mourningUntil > day`).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ tendtrust-b) |
|---|---|---|
| n | 8 | 8 |
| won | 2 | 2 |
| median days / median gameDays | 90 / 90 | 90 / 90 |
| max days | 146 | 146 |
| national ever / final | 4 / 3 | 4 / 3 |
| global ever | 3 | 3 |
| table invited ever (tableWaiting) | 8 | 8 |
| table entered (tableDone) | 2 | 2 |
| entered FULL | 0 | 0 |
| wave 4 / wave 5 reach | 8 / 2 | 8 / 2 |
| max arc | 4 | 4 |
| starvation deaths total | 0 | 0 |
| seat attempts / taken / failed | 2 / 2 / 0 | 2 / 2 / 0 |
| preview seen / not-ready | 4 / 2 | 4 / 2 |
| table answers | 10 | 10 |
| death total | 647 | 647 (identical breakdown) |

Baseline and armed agree on EVERY aggregate — the recorder is provably
neutral. Death causes (identical both arms): villager combat 259 +
villager-vs-villager combat 115 + expedition 158 + player-the-wild 62 =
594/647 (92%) combat/expedition/wild; starvation 0; monster 25, arena 8,
wound 7, sickness 2, thirst 1, rest small.

### Per-seed detail (armed arm; baseline identical on every trajectory metric)

| seed | days | end | won | seat | wave | rank final | first: leadQ/national | tends pol/eng | attempts/refused | gateBlocked | natLost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 76401 | 91 | over-other | 1 | lesser d91 | 5 | global | 89/90 | 7 (2/5) | 2/0 | 0 | — |
| 76402 | 72 | village-lost | 0 | lesser priced | 4 | regional | 57/— | 8 (0/8) | 5/5 | 13 | — |
| 76403 | 90 | over-other | 1 | lesser d90 | 4 | global | 57/85 | 12 (0/12) | 0/0 | 15 | — |
| 76404 | 88 | village-lost | 0 | none | 4 | regional | —/— | 2 (0/2) | 0/0 | 11 | — |
| 76405 | 75 | village-lost | 0 | none | 4 | regional | 57/— | 6 (0/6) | 0/0 | 27 | — |
| 76406 | 87 | village-lost | 0 | none | 4 | global | 76/77 | 14 (0/14) | 7/7 | 0 | — |
| 76407 | 146 | village-lost | 0 | none | 4 | regional | 120/121 | 15 (3/12) | 18/15 | 78 | d122 |
| 76408 | 100 | village-lost | 0 | none | 5 | regional | 58/77 | 12 (0/12) | 0/0 | 9 | d92 |

### Tend census (the measured numbers)

- **76 tends total: 5 policy + 71 engine.** The villagers' own drive does
  93% of the tending; the substrate's rescue-tend policy does 7%.
- **Mean lift per tend: exactly +8.00 (n=76; policy 8.00 n=5, engine 8.00
  n=71).** All 76 lifts are exactly 8; every engine note gain matches its
  lift 71/71. The code value (+8) IS the measured value — there is no lift
  distribution to tune, only the count.
- **Policy attempts: 32, refused 27 (84%).** Every refused attempt is
  mourning-explained (`mourningUntil > day` on the attempt). The substrate
  attempts a tend on a grieving link, `tendLink` refuses it (grief is not
  bought off), and the attempt is spent — the link stays untended that
  week and the policy retries daily until mourning lifts or the village
  dies. 76402's 5 attempts all fell in its final mourning window (link
  mourning until day 74; village died day 72). 76406's 7 attempts likewise.
  76407's 15 refused are the same story repeated across three links.
- **Pantry at tend (policy):** [56,305 / 47,800 / 17,180 / 23,060 /
  22,241]. The 17,180 tend (76407 d84) fired BELOW the 20,000 gate: the
  pantry rose mid-day (a big haul donation, `donateHaul` in
  competent.daily — traj pantry 8,546 → 21,460 → 50,300 across days
  82–84), so the gate's own read was >20,000 while the recorder's
  pre-daily read was 17,180. Gate-blocked counts are therefore
  approximate, erring toward OVER-counting blocked days.
- **Engine pantryDays at tend:** 1–295 (morning-after read — the tend
  already debited the pantry and the village ate overnight, so this
  undershoots the gate-time value; the gate itself, ≥3, is satisfied by
  construction at tend time).
- **Gate-blocked tend opportunities (policy gate, pre-daily pantry ≤
  20,000, dipping link, untended this week): 153 entries, 39 distinct
  link-weeks** (76402: 3, 76403: 4, 76404: 4, 76405: 6, 76407: 17,
  76408: 2; 76401/76406: 0). The blocked days are overwhelmingly
  starvation days: median pantry at block 0–7,271 kcal (76405's median is
  0). Lowering the threshold opens days when the village is starving —
  spending 1,500 kcal on a tend then is exactly what the 20,000 gate
  exists to prevent.
- **Engine-tend firing rate: ~1 week in 3 (33/111 traj-weeks, 0.30).**
  Per seed: 76401 4/14, 76402 3/11, 76403 5/13, 76404 1/13, 76405 2/11,
  76406 6/13, 76407 7/21, 76408 5/15. The tends are CLUSTERED: when the
  drive fires it tends ALL dipping links the same days (76402: days 27,
  28, 45 across all three links; 76403: days 29, 35, 42, 74; 76408: days
  35, 42, 49, 63, 73), then silence for 1–3 weeks. The gate that opens
  and closes for all links at once is actor presence (the drive needs a
  plan actor AT Haven; pantryDays ≥3 was open 60–90% of days, so pantry
  is not the throttle). Actor presence is NOT in this corpus — no field
  records it — so the residual throttle is named, not measured.
- **Two double-tend nights (delta +16):** the overnight window straddles
  the day roll, and if the week boundary falls inside it,
  `winPlanBondsTick` tends once in the old week and once in the new week.
  Cadence is one per week, but a week-boundary night can deliver two.
- **19/71 engine tends have mixed overnight deltas** (9, 16, 2, 3, 0) —
  the tend landed the same night as a tribute tick, a Titan strike, or a
  succession shake. The note gain (+8) is the clean lift; the delta is not.

### The trust ledger (all armed rows — every trust point, attributed)

| source | n | sum | mean | what it is |
|---|---|---|---|---|
| accord | 19 | +138 | +7.26 | first gesture: gift +10, visit +8/+4 |
| aid | 14 | +66 | +4.71 | aid verbs (+4/+5/+8) |
| court | 9 | +90 | +10.00 | First Court feast +10 |
| tended (engine, measured deltas) | 69 | +536 | +7.77 | engine tends as overnight deltas (mixed; clean note-gain sum is 71×8 = +568) |
| tended (policy) | 5 | +40 | +8.00 | substrate rescue tends |
| tribute | 143 | +42 | +0.29 | weekly +1/−1/−2 — nearly nets out |
| succession | 89 | −692 | −7.78 | **the dominant drag**: leader-death shake −8 on EVERY link |
| renegotiation | 24 | −89 | −3.71 | table renegotiations −5 (failed ones leave no note) |
| titan | 23 | −107 | −4.65 | Titan strikes a linked village in the night, −5 |
| drift | 3 | −18 | −6.00 | trust-drift crossings |
| unattributed (no history note) | 84 | −57 | — | trust moves that leave no note (failed renegotiations −5, +4 gains); invisible to the village |

Reading the ledger: a link starts at 30, gains +10 at the accord, then
lives on +8 tends against −8 succession shakes. **One leader death costs
every link a full tend's worth of trust.** With 2–7 shakes per link per
run (76407 village_0: 7 shakes = −56), the drag outruns the tending on
every blocked link. The tribute tick (+0.29/week mean) is noise beside
both. The accord (+10) is the only gain that rivals a tend — and it fires
once, at formation.

### Per-seed shortfall table (LEAD qualification — the blocked seeds)

Deadline for national on this substrate is the village's death (or day 77,
the earliest national day observed here); weeks are counted from link
formation to the deadline at 1 tend/week/link.

| seed | link | trust at death | gap to 40 | tends needed at lift 8 | weeks to deadline | tends landed by deadline | policy-gate-open weeks | engine-gate-open weeks |
|---|---|---|---|---|---|---|---|---|
| 76402 | village_1 | 28 | 12 | **2** | 8 | 3 | 10 | 10 |
| 76404 | village_1 | 33 | 7 | **1** | 8 | 1 | 2 | 10 |
| 76405 | village_0 | 24 | 16 | **2** | 8 | 2 | 7 | 8 |
| 76407* | village_0 | 29 | 11 | **2** | 18 | 7 | — | — |
| 76407* | village_2 | 27 | 13 | **2** | 10 | 5 | — | — |
| 76408* | village_0 | 30 | 10 | **2** | 12 | 5 | — | — |

\* 76407/76408 are NOT qualification-blocked — they qualified (d120/d58)
and then LOST national; their end gaps are the post-loss state, shown
here only so the tend counts are complete. Their sizing lives in the
persistence section below.

- **76402 (died d72, qualified d57, national never):** village_1 sits at
  28 — 2 tends short. It got 3 engine tends in 8 weeks; 5 policy attempts
  all mourning-refused. The cadence allows 2 more (5 spare weekly slots);
  the pantry gates allow them (policy rich 10 weeks, engine open 10
  weeks). They did not fire because of the mourning choke (final week)
  and the engine's ~1-in-3-week firing rate.
- **76404 (died d88, never qualified):** village_1 sits at 33 — 1 tend
  short — BUT the seed never had a third sub (0 subs 27 days, 1 sub 3
  days, 2 subs 58 days; maxSubs 2 all run). **No tend count fixes 76404:**
  even seasoned, it holds 2 of the 3 seasoned subs the realm needs. The
  third link never formed — a courtship failure on a poor pantry (propose
  needs pantry > 12,000; 76404's pantry read > 12,000 on only 14/88
  days). This seed needs a courtship/proposal lever, not a tend lever.
- **76405 (died d75, qualified d57, national never):** village_0 sits at
  24 — 2 tends short (gap 16, drag −42, last kept day 35, mourning until
  67). It got 2 engine tends in 8 weeks; 0 policy attempts (pantry-gate
  blocked 27 entries, median pantry at block 0). Same shape as 76402:
  the tends were feasible within cadence and gates; they did not fire.

### National losses (persistence — the trust dip that caused them)

- **76407, lost national day 122** (reached day 121): TWO links dipped
  the same night — village_1 42→39 (dip 3), village_2 43→36 (dip 7).
  Headroom needed: **1 tend per dipping link** at lift 8. Tends in the 21
  days before the loss: policy 2, engine 0. Pantry > 20,000 on 14/21 days;
  pantryDays ≥ 3 on 21/21 days. The policy tends went to the third link
  (village_0, trust 33→41 on day 120) — the dipping links sat at 42/43,
  ABOVE the policy's <40 bar, so the policy could not have tended them.
  The engine drive was OFF (nationalLive from day 121) — the only
  mechanism that tends links at 40–50 was switched off the day the realm
  was won.
- **76408, lost national day 92** (reached day 77): village_0 42→30
  (dip 12 over the loss week). Headroom needed: **2 tends**. The loss
  night (day 91) was a leader death: **−8 succession shake on ALL THREE
  links the same night**, plus the week's drag. Tends in the 21 days
  before: policy 0, engine 2. Pantry > 20,000 on 6/20 days; pantryDays ≥
  3 on 10/20 days. On day 92 the link sat at ~34 — below the policy's
  <40 bar — but the pantry was too poor to tend (final pantry 5,579) and
  the engine drive was off (nationalLive). The realm died the morning
  after its leader died, with no tend possible.
- **The engine drive stops at national — verified:** 0 engine tends
  while `nationalLive` on 7/8 seeds. The one exception proves the rule:
  76407's three engine tends on day 136 (all three links, +8 each) came
  14 days AFTER it lost national — the drive resumes when national is
  lost, but the loss already happened.

## THE SIZED LEVER SPEC (the deliverable)

**DIAG verdict: no single NUMBER moves the Binding leg.** The gaps are
1–2 tends per link; the lift is exactly +8 on all 76 tends (no
distribution to tune); the cadence (1/week/link) already allows the
missing tends (5+ spare weekly slots per blocked link); the pantry gates
already allow them (policy rich-weeks 2–10, engine open-weeks 8–10 per
blocked seed). What blocks them is FIRING, not size: the mourning choke
(27/32 policy attempts refused; the engine skips mourning too) and the
engine drive's ~1-in-3-week firing rate (actor-presence throttle,
unmeasured in this corpus). The numbered alternatives, with their measured
weakness:

| candidate number | sized change | why it does not move it (measured) |
|---|---|---|
| trust lift per tend 8 → 12 | 76402's gap closes in 1 tend instead of 2 | the tend still has to FIRE — firing is the binding constraint, not lift |
| rescue-tend pantry threshold 20,000 → 10,000 | opens ~2 more dipping weeks on 76402 (pantry >10,000 on 65/72 days vs >20,000 on 62/72 — nearly identical) | the newly opened days are starvation days (median pantry at block 0–7,271); spending 1,500 kcal on a tend while starving is what the gate exists to prevent |
| tend cadence 1/week → 2/week | on firing weeks the drive could tend twice | the drive already tends ALL dipping links when it fires; a second tend in the same week helps only in firing weeks, and does nothing about mourning or the 2-in-3 silent weeks |
| mourning choke (7d, no gains) | 76402 qualifies with 2 of its 5 refused attempts landing | the choke is CANON ("grief is not bought off", hierarchy.js:1770) — narrowing it is a Steve call, not a tuning knob. Measured size of the choke on this band: 27/32 attempts refused (84%) |

**The lever that DOES move it is a GATE, not a number — the persistence
gate:**

> **Let the villagers' tend drive run while national — and let it tend
> links up to trust 55 while national.**
> (`winPlanBondsTick`, win-plan.js:542: delete the `if (st.nationalLive ||
> st.pendingNational) return null` early return for the tending leg, and
> raise its trust cap from 50 to 55 while nationalLive.)
>
> Sized: the observed national-loss dips are 3, 7, and 12 points — 1, 1,
> and 2 tends of headroom at lift 8. At cap 55 a link banks 15 points of
> headroom above the 40 bar, which holds the largest observed dip (12);
> at cap 50 it banks only 10, which holds the 3- and 7-point dips but NOT
> the 12-point one (50−12=38 < 40). Cost: 1,500 kcal per tend, roughly
> one tend per link per season to top up (the drive fires ~1 week in 3 and
> tends all dipping links when it fires). The policy route cannot do this:
> it only tends below 40, and its pantry gate was closed on the loss weeks
> (76408: pantry > 20,000 on only 6/20 days before the loss); the engine
> route (pantryDays ≥ 3) was open on 10/20 of those days.
>
> For qualification, the same gate change does nothing — the drive already
> runs pre-national. The qualification blockers stay what they are: the
> mourning choke (Steve call) and the drive's firing rate (actor presence
> — the next diag needs an actor-presence field in the corpus before it can
> be sized).

**76404 is excluded from the tend sizing:** it needs a courtship lever
(a 3rd sub), not tends. Any build arm that takes the tend lever must not
claim 76404 as a win.

## Sense-testing read (NON-MEASURED replay, seed 76402, armed, narration on)

File: `evidence/2026-11-08/sim-tendtrust-b-sense.txt` (274-line ring, days
70–73; outcome class matches the measured run exactly — village-lost day
72/73, max wave 4, regional, no table — narration did not diverge the
shape).
Judgment — meaning, coherence, consequences:
- The village dies of hunger on day 73 — the third hungry day — with a
  lesser seat priced and waiting (`tableWaiting=true`) and the LEAD realm
  qualified since day 57. The death is honest and coherent: three
  lingerers gorge 630–1,750 kcal a night from the stores, the pantry
  empties, people walk in different directions.
- **The stall is SILENT on the tend/trust story.** Across the whole
  240-line ring (days 70–73), NOT ONE line mentions tending, trust, a
  bond cooling, grain sent to another village, or grief blocking a
  gesture. The only "tending" is the garden ("your Purslane needs
  tending, or the harvest halves"); the only grief is the wedding ring.
  Meanwhile the measured run says: one bond sat at trust 28 for weeks,
  five tend attempts were refused in mourning, and the realm qualified
  but never sat its court. The village hears about the hunger, the
  lingerers, the wedding ring, the Herald's arithmetic — and nothing
  about the bond that is 12 points from a realm. (The Binding-wait
  silence itself was already recorded by binddiag in sim-findings.md;
  this replay confirms the tend side is silent too.)
- Villagers react like people inside the dying: Yesenia fishes, gets
  pulled onto Hot Take and comes home with fans; the wedding ring is held
  and the shaking eases; a trader's cart waits and moves on. The fiction
  is alive around a death the measurement calls "village-lost".
- One wrinkle, not a defect: the Herald's "muster 10 allied blades (you
  have 0)" refusal stamps ~10 times on day 73 alone, and "You wait. The
  light changes. Nothing asks anything of you." repeats through the idle
  hours — the same lines, not progressing beats. Pre-existing narration
  texture, already in sim-findings.md from binddiag; not this arm's
  finding to chase.

## Village assessment (plain words)

These villages all do the same first thing: on day 25 they start courting,
and by day 55 one of the three bonds has ripened. That part never fails.
What fails is the slow part — keeping three villages' trust above the line
that makes a realm. The villagers ARE tending — 76 times on this band,
every single tend worth exactly 8 points of trust, almost all of it done
by the villagers themselves while the scholar's own rescue-tend policy
mostly watches. But the tending comes in bursts: the villagers' drive
fires about one week in three, tends every dipping bond at once, and then
goes quiet for weeks while the bonds cool. And every time a leader dies —
which happens two to seven times per bond per run — every bond loses 8
points at once, a whole tend's worth, and the grieving bonds cannot be
tended for a week after. So the bonds hover just above the line, at 42 or
43, and then one bad night takes them under: a leader dies, the bonds
shake, the realm quietly stops being a realm, and the village slides back
to regional without a battle. The cruelest part is the timing: the moment
the realm is won, the villagers stop tending — their drive switches off
while the realm stands — so the bonds sit at 42 with nothing topping them
up, waiting for the night that takes them under. One village in eight
never even gets its third bond: too poor to propose, it spends 58 days
with two fires and no third to bind. The full seat is not one wall. It is
two: a fight you have to be ready for, and a realm you have to keep — and
right now the keeping stops the day the realm is won.

## Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-11-08/perseed-tendtrust-b/summary.json --after
evidence/2026-11-08/perseed-tendtrust-b/summary.json --out
/tmp/panel-tendtrust-b-attempt`. Result: the command printed only
`review_required`, exit 0, and wrote NO output file or directory — no
compare was performed and no panel was ingested. (The 0230Z binddiag run
hit the same shape; the 2026-11-08 sim-comparecontract-a repair fixed
wrapper-policy compares, but this corpus still does not ingest — the
panel-contract lane owns that, not this arm.) The sweep-compare tables
above are the before/after comparison for this run, on identical seeds,
judged against the pre-registered bar.

## Metric review

- The pre-registered bar worked as written; no mid-run re-scoring. G2 as
  specified here (ALL seeds identical, not just pre-national) is the right
  strength for a daily recorder — and the identical death-cause breakdown
  (647 = 647) corroborates it independently of the ts counters.
- "Median days" as a cost bar is uninformative for a pure-read arm (90 vs
  90 by construction); the informative neutrality proof is the per-seed
  identity (G2) plus the identical death breakdown. Future diag arms
  should judge on G2 identity, not on median days.
- **Instrument gap FOUND and FIXED in-run (not re-scored):** the tend log
  missed the engine-side tends (run 1: 5 tends vs 69 'tended' history
  kinds). The fix — promoting overnight 'tended' history entries into the
  tend log with the lift parsed from the note — is the only honest way to
  measure "every tend event" when the villagers tend on their own, and
  run 2's exact reproduction of run 1's trajectories proves the fix is
  measurement-only. Any future arm sampling tends must count BOTH
  sources (policy + engine win-plan drive), and must take the lift from
  the note, not the overnight delta — 19/71 engine tends have mixed
  deltas, and 2 net to zero.
- **The gate-blocked count is approximate, in a stated direction:** the
  recorder's pre-daily pantry read can undershoot the gate's own read on
  big-haul days (one observed tend fired with pre-daily pantry 17,180
  after a 33k haul donation during the daily). Gate-blocked entries err
  toward over-counting; the distinct-link-weeks count (39) is the safer
  headline than the raw entry count (153).
- **The engine-tend firing rate (~1 week in 3) is measured but not
  explained:** the residual throttle is actor presence
  (`winPlanBondsTick` needs a plan actor AT Haven), and this corpus
  carries no actor-presence field. The next diag that wants to size the
  qualification lever needs that field recorded (actor-at-Haven per day)
  before it can say whether the drive is starved of actors or of
  something else.
- "Median first-day" for national is no longer uniform (77, 85, 90, 121)
  — report the spread, don't average it away: on this base the ladder is
  no longer clocked off a single courtship start.
- The prereg's G3 cross-check (recorder tends + refused == substrate
  attempts) needed the source split after the fix — policy tends only;
  engine tends never touch `ctx.tended`. The split is in the sweep, and
  the check passes 8/8.

## Findings outside this arm (reported, NOT touched — appended to sim-findings.md)

- The engine tend drive stops at national (see sized lever spec above):
  `winPlanBondsTick` returns null while `nationalLive`, so after the
  First Court nothing tends links at 40–50 — the only mechanism that
  builds headroom above the bar switches off the day the realm is won.
  Both national losses on this band are that shape.
- Trust moves without history notes (84 events, net −57 across the band):
  failed renegotiations cost −5 with no note, and +4 gains land with no
  note — the village cannot hear them, and a recorder that reads only the
  history misses them. The drift warning (`trust_drift_is_voiced`) only
  fires on the crossing below 40, never on the moves themselves.
- The double-tend night across a week boundary (delta +16): the overnight
  window straddles the day roll, so the drive can tend once in the old
  week and once in the new week. Cadence is one per week on average, not
  strictly.

## Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (8/8 armed configs
with a complete tend/trust corpus — 76 tends with source attribution,
daily trust trajectories, per-seed shortfall tables, national-loss dips,
engine-gate accounting — G1/G2/G3 all PASS, cross-check 8/8, engine-gated
validation 8/8, run-2 exact reproduction of run 1), and the THING measured
is now SIZED, not just observed: the tend/trust lever is a GATE (the
engine drive must run while national, tending to 55), not a NUMBER (lift
is exactly +8 everywhere; the gaps are 1–2 tends; cadence and pantry gates
already allow them; firing — the mourning choke and the drive's ~1-in-3
firing rate — is the binding constraint). The full seat remains unreached
(0/8), wave 5 is 2/8, wins come only through the lesser seat (2/2
invitations convert). No default flips; no src/js changes; the recorder is
a new default-OFF policy instrument.
