# SIM-STACKCENSUS — stacking-channel census: obligated+discretionary co-occurrence on thin pantries (loop B, food-economy)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b (WORKER sim-stackcensus-b) · Worker tree: sim-stackcensus-b
Axis: food-economy (scale-wall lens) — the sim-drawvol-b named next ("measure whether the stacking channel
(obligated+discretionary co-occurrence) is actually a live drain before another volume arm").
Substrate: pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1, policies leadfeast/belongfeast.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the drawvol-b mechanism autopsy found the 2.5k cap engaged almost exclusively as a big-feast
  brake — 12/13 holds fired with dayTotalBefore=0 (a single 2.8–3.2k feast exceeding the cap); only ONE hold
  exercised the obligated+discretionary stacking the #200 hypothesis named. The measurement pre-pass: only
  22/265 thin days had ANY drawdown outflow. Is the stacking channel (obligated tribute/tend payments +
  discretionary aid/feast co-occurring on the same thin day, together draining the pantry past a binding
  bound) a live drain that justifies a targeted volume arm, or is it closed?
- **Instrument**: scripts/census-stack-20261016.js — READ-ONLY, NEW scripts only (zero src/js, zero policy
  changes). Wraps the same four engine verbs at the same points as the drawvol measure/sweep
  (feast@upkeep → tribute/tend/aid@daily) and buckets actual kcal paid per engine day:
  fdStart, obligated (payTribute/tendLink engine returns), aid (answerAidBeg 'give', pendingAidBeg amount),
  feast (hostFeast ok, feastPlan cost).
- **Channel taxonomy** (pure classifyDay, unit-fixtured): OBLIGATED (aid=feast=0), DISCRETIONARY-ONLY
  (obligated=0; sub single vs multi-discretionary), STACKED (obligated>0 AND discretionary>0, same day;
  sub stackBind = obl+disc>2500 while obl<=2500 — the landed cap line; stackOblHeavy = obl>2500;
  stackSmall = total<=2500). UNATTRIBUTED = fd unknown (expected ~0).
- **PRIMARY**: attribution >= 95% of thin-day (fd<6) drawdown-outflow events (event = thin day with
  total>0). The 95% bar is the instrument's GO threshold per §14; the verdict question is measured,
  not thresholded.
- **Verdict inputs**: stacking share of thin-day drawdown-outflow kcal (discretionary kcal on
  STACKED:stackBind days / all thin-day outflow kcal); per-channel drain distribution (events + kcal);
  road split (belongfeast vs leadfeast); fd-band split (1–3 vs 3–6). VERDICT: live drain (a targeted
  volume arm is justified) or closed (then: what remains of the drawdown-volume design space — the
  big-feast brake is landed; what else is there?).
- **Horizon**: 180d death-aware (+10d tail); dead villages stop.
- **Seeds**: 8 FRESH seeds [1501–1508] (verified absent from all evidence/ per-seed filenames
  2026-10-13→16; drawvol-b used 982–989) × {belongfeast, leadfeast} = 16 runs, single side, control
  substrate — no armed side (census, not comparison).
- **Proof**: scripts/test-stackcensus-20261016.js — I. DET-GATE byte-identity (instrument-on vs
  instrument-off, 2 seeds × 40d; the read-only equivalent of before/after on identical seeds),
  II. classifyDay fixture suite (F1–F11), III. SMOKE (probe 2 seeds × 40d, real-data attribution check).
  Probe on 2 seeds × 40d before the sweep.
- **Sense-testing**: ≥10 beat samples around the largest stackBind events — read for meaning/coherence;
  villager-as-people section; NEW defects appended to hidden_files/sim-findings.md in the file's format,
  never chased.











## Proof results

scripts/test-stackcensus-20261016.js — PROOF GREEN, 15/15 (run BEFORE the sweep, independently re-runnable):

- I. DET-GATE: instrument-on vs instrument-off byte-identical over 2 seeds × 40d (40/40 hashes both; the
  instrument recorded 6 day-buckets on-side while perturbing nothing). The read-only equivalent of
  before/after on identical seeds — the instrument does not move the trajectory.
- II. Classifier fixtures F1–F11: pure obligated → OBLIGATED; single feast → DISCRETIONARY-ONLY/single;
  the drawvol-b s983/d118 shape (tribute 2,400 + aid 1,913) → STACKED/stackBind; grief-leverage tribute
  16,875 + aid → STACKED/stackOblHeavy; small obligated + aid → STACKED/stackSmall; aid+feast without
  obligated → DISCRETIONARY-ONLY/multi-discretionary; fd unknown → UNATTRIBUTED; no outflow → NONE.
- III. SMOKE: probe 2 seeds × 40d recorded thin-day events on real data; real-data attribution 100%
  (0/1 unattributed — thin-day outflow is rare, which is the census's subject).

## Sweep results

16 runs, seeds 1501–1508 × {belongfeast, leadfeast}, 180d death-aware, control substrate only.
Per-seed JSONs: evidence/2026-10-16/perseed-stackcensus/. Beats: evidence/2026-10-16/stackcensus-beats/.
Sweep log: evidence/2026-10-16/stackcensus-sweep.log.

| metric | result | pre-reg |
|---|---|---|
| thin-day drawdown-outflow events (PRIMARY) | n=68, attribution 100.0% | **PASS** (≥ 95%) |
| OBLIGATED | 30 events, 250k kcal (75.6% of thin-day outflow kcal) | measured |
| DISCRETIONARY-ONLY | 36 events, 71k kcal (21.5%) — all 36 sub "single" (no multi-discretionary day of any kind) | measured |
| STACKED | 2 events, 10k kcal (2.9%) | measured |
| STACKED:stackBind | 1 day — leadfeast/s1504/d35, fd 1.75, tendLink 1,610 + feast 1,600 | measured |
| STACKED:stackOblHeavy | 1 day — belongfeast/s1503/d62, fd 2.63, tribute 5,211 + aid give 1,310 | measured |
| stacking margin (discretionary kcal through the bind) | 2k kcal = **0.5%** of thin-day outflow kcal | measured |
| road belongfeast | 51 events, 278k kcal; stacked-bind n=0 | measured |
| road leadfeast | 17 events, 53k kcal; stacked-bind n=1 (the only bind) | measured |
| fd band 1–3 | 25 events; stacked-bind n=1 | measured |
| fd band 3–6 | 31 events; stacked-bind n=0 | measured |

Stream split on thin event-days (all 68): aid — 9 days, 14k; feast — 29 days, 60k; obligated — 32 days, 257k.
Big feasts (≥2,800) on thin pantries on this substrate: 4 (s1503/d29 3,600 @fd1.27; s1503/d43 3,200 @fd2.14;
s1503/d63 2,800 @fd1.11; s1506/d29 2,800 @fd0.31) — the landed big-feast brake's own shape, firing here on
the control substrate.

## Verdict

**The stacking channel is CLOSED.** In 16 long runs the obligated+discretionary co-occurrence the #200
hypothesis named produced exactly two thin-day event-days, and only one of them — leadfeast/s1504/d35,
a 1,610 tendLink grant plus a 1,600 feast on a 1.75-day pantry — pushed the day past the landed 2.5k cap
line when the obligated alone would not have. That single bind moved 2,000 discretionary kcal: 0.5% of
thin-day drawdown-outflow kcal. The other stacked day (s1503/d62) was obligated-heavy: a 5,211 weekly
tribute plus a 1,310 aid give — the stacking co-occurs but binds nothing. A targeted volume arm against
stacking would have no coverage to engage; there is nothing to aim it at. The drawvol-b autopsy's
12:1 feast:aid split was not a sampling artifact — it was the whole story. The drawdown-volume design
space now looks like this:

- **The big-feast brake (landed, default-off) is the binding channel.** Every discretionary drain that
  matters on a thin pantry is a single feast or single aid give firing alone (all 36 discretionary-only
  events were sub "single"; zero multi-discretionary co-occurrence of any kind).
- **Obligated dominates and is untouchable by design.** 257k of 331k thin-day outflow kcal (78%) is
  tribute/tend — Steve's bargain discipline; the lever explicitly never holds it. The two roads have
  different rhythms (belongfeast: weekly tribute spikes — 5,211 walking out on d62; leadfeast: frequent
  small tendLink grants — 1,610 on d35), but the census conclusion holds on both.
- **The aid stream on thin days is 9 events / 14k** — the aid trim the landed layer exercised is the
  whole of what discretionary aid can move; the stacking angle adds nothing to it.
- **Named next: none.** The #200 volume hypothesis is resolved: big-feast brake = the binding channel
  (landed), stacking = dead (this census). Do not run another volume arm against obligated+discretionary
  co-occurrence; if volume work resumes, it is about the aid-trim trigger or the lead-road tend rhythm,
  not stacking.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| census (16) | 11/16 | 14/16 | 0/16 | 13/16 | 6/16 | 114.0d | 181d |

Exiled 0/16. Arc 2/3/4: 16/16 / 16/16 / 14/16. four-realm 0/16. starvedDays 85 total. All villages
village-lost except leadfeast s1501 (survived to d151, wave 3). Wins 0/16 is substrate-by-design
(pre-seat courtship, SEATDRIVE=0 — the scale-wall baseline is the full win-side stack; see telemetry).
The scale wall stands where the pre-seat substrate puts it: national reachable (11/16), table
reachable-but-unsat, four-realm unreached, violence-dominated collapses.

## Death-cause shares

combat 327, villager combat 136, monster 85, expedition 25, sickness 17, starvation 11, a wound that
wouldn't close 6, contest 4, the thing with headlights for eyes, standing too still 2, Choir Toad 2,
dehydration 2, ambush 2, The Spoiler 1, The Focus Group 1, The Eulogy 1, Inspiration 1. Violence
dominates; starvation is a tail mode (11 deaths, starvedDays 85 over 16 runs).

## Village assessment (plain words)

Sixteen villages, fifteen of them lost — and every one of them read as a place under siege rather
than a number generator. The two stacking days both belong to villages that died the way almost
everything dies on this substrate: combat attrition with the pantry thin underneath. Leadfeast
s1504 is the fullest picture: d32–33 Ashford's courtship completes (Haven bows, 5,000/week), d33 a
STARVING warning, d34 Haven still sends 1,596 to Stonebridge and 1,596 to Thornfield anyway
("Someone's grandmother over there will remember who fed her"), d35 the bind day itself — and that
night a raid drawn by the feast's smell, d37 Stonebridge raids them back for ~1,245 ("the ground is
theirs too, and they're done asking"), d38 the STARVING warning returns. The village died at d181
to combat, not to the pantry — the bind was a footnote in a long, violent decline. Belongfeast s1503
is the same shape compressed: bow to Emberhold d61, 5,211 tribute walks out d62 alongside a 1,310
aid give to a starving linked fire, then a televised feast d63, dead at d106. Both days read as
triage under a doctrine — obligation first, generosity even when it hurts — not as bugs.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

**PASS — with one instrument caveat.** ~35 beat samples read across both stacking days plus context windows.

- The d35 bind (leadfeast/s1504): the beats around it are the best in the sweep. Carmen opens the
  pantry for a televised feast ("For one evening, nobody is surviving — they're just together"),
  the 1,610 tendLink grant to Stonebridge narrates as anti-tribute ("not tribute, the other way
  around"), the feast draws Sweeps Week ("It followed the feast here"), a night raid hits, and the
  STARVING warning frames the day. A village spending its buffer on joy and obligation with its eyes
  open — coherent, consequential, tragic. Nothing robotic.
- The d62 stackOblHeavy (belongfeast/s1503): the tribute beat is clean ("5,211 kcal walks out of the
  pantry toward Emberhold. The relationship holds."). The 1,310 aid give was engine-narrated (the
  safetynets.js give path always says "You give … kcal from Haven's bins — real food, honestly
  counted") but is absent from the beats file: **my BEAT_RE dropped it** (it matches none of
  feast|tribute|begs at the treeline|bins are full|drawdown… — 'eating bark', 'stands at your fire',
  'fire network' were all unfiltered). That is an instrument-filter limitation, not a game silence —
  but it means this evidence's sense sample understates aid narration. Future census scripts should
  extend the beat regex; noted here, not chased.
- No fabricated shared history, no repeated-identical beats, no menu-like loops anywhere in the
  samples. The feast-play-by-play ("This is a war crime against our nutrient paste") and the raid
  consequences ("Nobody's dead, but the message is clear") read as written for a televised world.

## Villager-as-people sense read

On d35's bind day the room was full: Carmen feeding the televised feast, Fritz/ Ursula/ Quinn eating
"until the fire burns low," Mateo standing down a Cliffhanger bloodied but walking, the Raiders (Lockpick,
Ugly-Eyes, Big Ugly) drawn by the pantry smell that same night, Talia dead at Emberhold with June and
Ibrahim fighting over the fire, June of Thornfield walking in with pack-mules and grain. Everyone has
business, nobody idles: the dying, the eating, the bargaining, the scavenging all run on the same
evening and the beats keep them distinct. On d62's oblig-heavy day the room is thinner (a tribute
walking out, a beg answered — the beg's face unnamed in my sample because of the filter caveat above),
but the d65 sample from the same village shows Priya telling Conaire "the table doesn't fill the
pantry" while half rations are voted — the village talks to itself about the pantry in its own
words, unprompted by any policy. Anything robotic would have been a blank; nothing qualified.

## Blanks filled / documented

- **FILLED (instrument)**: the stacking census — scripts/census-stack-20261016.js (read-only, 16 runs,
  det-gate byte-identical proof + 11 classifier fixtures + SMOKE, 15/15 proof green), PRIMARY
  attribution 100.0% ≥ 95%.
- **DOCUMENTED (no chase)**: green-list drift — `check.js --quick` at run time: 94 passed, 3 failed, all in
  scripts/test-table-trial-fire-20261012.js (`Game.tableTrialResume is not a function`). Pre-existing on master
  a8c804c8 (my tree has zero src/js changes); left for the owning loop.
- **FILLED (verdict)**: the stacking channel is closed — 2 stacked event-days in 16 runs, one true bind
  moving 2k kcal (0.5% of thin-day outflow). The #200 volume hypothesis is resolved; no future volume
  arm against obligated+discretionary co-occurrence. Landed as evidence + scripts only (zero game-code
  changes — nothing to land into src).
- **DOCUMENTED (no chase)**: 4 more ≥2,800 feasts fired on fd≤2.14 pantries on the control substrate
  (the big-feast brake's own shape, unheld here) — the volume lever's engagement floor is real and
  recurring.
- **DOCUMENTED (no chase)**: the beats filter dropped aid-beg/give narration (regex limitation, not a
  game silence) — future census scripts extend BEAT_RE with 'eating bark'/'stands at your fire'/'fire
  network'.
- **DOCUMENTED (no chase)**: instrument buckets are event-lazy — a day without outflow leaves no bucket,
  so the thin-day denominator (the 22/265-style share) is not recomputed; the channel attribution
  question didn't need it. fd is measured at first-event call, not true day start.

## Metric review (§14)

- The PRIMARY was pre-registered as the instrument's GO threshold: attribution 100.0% ≥ 95% — GO.
  No re-scoring: the verdict question (is stacking a live drain?) was pre-registered as measured, not
  thresholded, and is answered honestly (closed).
- The stacking-bind margin uses the landed drawvol cap line (2,500) as the binding bound — the
  lever's own number, not a friendlier one chosen after the fact.
- No armed side exists (census, not comparison) — metric binding applies to the instrument quality
  and the pre-registered verdict inputs, both honored.
- The per-seed JSONs carry exact numeric keys national/table/wins/exiled (the schema-drift LOUD
  class) — telemetry-check ran on the same glob with one LOUD line (wins 16→0), investigated same-run:
  substrate mismatch (baseline is the full win-side stack; this substrate is pre-seat SEATDRIVE=0 where
  wins are impossible by design). No anomaly.

## Convergence state

**converged (diagnostic)** — the stacking line of inquiry is closed. The food-economy axis stays
converging on its remaining questions (lead-road non-engagement of the volume lever, the trust-ledger
bind steve-call #340), but the obligated+discretionary stacking channel no longer belongs on the
lever plan.
