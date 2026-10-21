# sim-deathcensus-b — autopsy-grade death census (DIAG, instrument-only)

Run: fleshout-loop-b, arm sim-deathcensus-b (the explicit named next of
run fleshout-loop-b-20261021T1630Z's sim-surpluskeep2-b, evidence/2026-10-21/sim-surpluskeep2-b.md).
DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero policy edits. Worker tree: ~/workspace/worktrees/sim-deathcensus-b.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

- **Question**: on the FEASTSCALE_R13=1/SEATDRIVE=0 substrate, 7/8 armed
  leadfeast villages in sim-surpluskeep2-b died with nationalLive still
  true in the d100–150 window — villages starve with loyal subordinates
  and intact realms. The deaths' proximate causes were outside that arm's
  instrument (its Village assessment named the cluster; a death-cause
  census is the named next). This arm builds the autopsy-grade instrument
  (per sim-findings #760: persist death rows) and runs the census.
- **Design**: 16 FRESH seeds (66041–66048, freshness asserted inline in
  the sweep) × {leadfeast, belongfeast} = 16 runs, 180d death-aware (dead
  villages stop; the harness loop ends on Game.over), env
  FEASTSCALE_R13=1/SEATDRIVE=0, on the worktree's commit (no SURPLUSFEED —
  the trim governor's telemetry channel is read and will be 0).
  Per-seed JSONs in evidence/2026-10-21/perseed-deathcensus-b/.
- **PRIMARY (DIAG-GO)**: ≥95% of person deaths attributed to named
  proximate causes (the taxonomy in scripts/deathcensus-instrument-20261021.js:
  starvation | dehydration | combat-<monsterId> | sickness-<disease> |
  wound | raid | contest | other:<raw-cause>), 0 unexplained remainder.
  'unexplained' is instrument failure only (missing fields / classifier
  crash), never a residual bucket.
- **SECONDARY (report-only)**: wall numbers (national/table/wins,
  wave-4/5, median survival), d100–150 cluster reproduction verdict,
  pantry-crash anatomy per village death (final-14d: pantry Δ, feast /
  tribute / trim outflows, implied net inflow — honestly labeled, rot and
  consumption inseparable), national-live-at-death share.
- **Verdict classes**: DIAG-GO (instrument proves out and the census
  attributes the cluster), DIAG-insufficient-data (the instrument proves
  but the runs don't produce the phenomenon), or NO-GO (instrument fails
  its gates or attribution falls short).
- **Instrument proof** (pre-registered, scripts/test-deathcensus-b.js,
  run under the sweep env FEASTSCALE_R13=1 SEATDRIVE=0):
  (a) honesty — death rows reconcile with the engine's own death
  aggregates (harness live tele capture + tele ring) on ≥4 trial runs,
  ≥99% row completeness, 0 unexplained person rows;
  (b) RED-equivalent — instrumented vs pristine byte-identical outcome
  fields on the same commit/seeds;
  (c) det-gate — paired instrumented re-runs byte-identical;
  (d) fixtures — the full cause taxonomy on synthetic rows (every named
  class) and attributeVillageLost on constructed scattering / extinction /
  succession / unknown states;
  (e) village-lost end-to-end — trigger site + verbatim beat on a real
  150d loss.

## Canon

- docs/CANON.md read first. **No canon doc covers village death /
  village-loss triggers** — CANON.md's registry (CORRUPTION, VISION,
  DESIGN, DIRECTIVES, DISEASES, BEAR, PRESERVATION, MONSTER-WAVES,
  CONTESTS, CONVERSATIONS, PARTY, SYSTEMS, BALANCING, TIME-ECONOMY, KIN,
  FANS) contains no village-death design. The three village-lost trigger
  sites are code-grounded from src/js (NOT invented): (1) game.js
  scattering path — `Haven couldn't hold. On the {third|fifth} hungry
  day, people started walking — in different directions. The scattering,
  again.` (pantry empty ≥ famineLimit hungry days); (2) game.js
  extinction path — `Nobody is left. Not scattered, not gone looking for
  food — dead, every one, and the fire has nobody left to warm. The
  village ends here, the way villages end when the teeth find them
  first.` (roster non-empty, zero living persons); (3) ledger.js
  succession path — `No one is left to pick up the Codex. The village
  dies out — quietly, the way villages do. The season ends here.`
  (scholar dies, no successor candidates). The instrument captures the
  beat verbatim from the engine's say stream and the site from
  v.scattered / v.extinct / lineage outcome — never from templates.
- Disease cause vocabulary follows docs/DISEASES.md's two-pool law
  (mundane vs alien never mix) and the engine's own sickness census
  regex (convoTopics.js:516); the classifier names the disease string
  the engine recorded.

## Proof results (pre-sweep)

scripts/test-deathcensus-b.js under FEASTSCALE_R13=1 SEATDRIVE=0: **76 passed, 0 failed** (2026-10-21, re-verified by the adopting run). Part A fixtures (classifyDeath full taxonomy + attributeVillageLost scattering/extinction/succession/unknown) green; Part B instrument honesty 5 seeds x 60d (>=99% row completeness, 0 unexplained, 0 instrument errors, rows reconcile with the engine's own death aggregates); Part C RED-equivalent instrumented == pristine on 2 seeds; Part D det-gate paired re-run byte-identical; Part E village-lost end-to-end on 2 real 150d runs (s66109 succession d122, s66110 scattering d83/84 — trigger site named, beat verbatim from the engine's say stream).

## Sweep results

Sweep complete 16/16 (seeds 66041–66048 x {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, worktree commit 961321a40 — no SURPLUSFEED; trim channel reads 0 as designed). Analyzer: scripts/analyze-deathcensus-b.js.

**PRIMARY (DIAG-GO, as pre-registered)**: 230 person deaths, 230 named (100.0%), unexplained 0 — bar was >=95% named / 0 unexplained. DIAG-GO.

**Death-cause shares (n=230 person deaths)**:
- combat 170 (73.9%) — wave-4 monsters the sharp end (wave-tagged person deaths: wave4 69, wave3 25, wave1 22, wave2 8)
- other 15 (6.5%): experiment 6, alien-alien 3, ambush (villager-on-villager) 2, stripes flowing where no wind blows 2, The Reverend 1, the night 1
- wound 14 (6.1%), sickness 13 (5.7%), starvation 12 (5.2%), contest 3 (1.3%), dehydration 3 (1.3%)
- combat-unknown 40 (17.4%): family-level attribution only — 38x the engine's literal cause "monster" at hurtVillager time (game.js:7695; the fight record's monster id is not threaded through), 1x "Stranger", 1x "the expedition". Honest gap, not a residual bucket — see Metric review + new backlog item.
- Per policy: leadfeast 144 deaths (combat 98), belongfeast 86 (combat 72). Player-vessel deaths 129/230 — the scholar dies and succession continues, village-as-protagonist as designed.
- Contest venue: 21 deaths carried venue=contest.

**The d100–150 cluster (the named question)**: REPRODUCED — 7/12 village losses fall in d100–150 (loss days: 49, 50, 69, 88, 104, 107, 115, 130, 137, 138, 138, 176; median 115d). Loss sites split evenly: scattering 6 (pantry empty >= famineLimit hungry days — "Haven couldn't hold. On the third/fifth hungry day, people started walking"), succession 6 (scholar dead, no successor — "No one is left to pick up the Codex. The village dies out — quietly, the way villages do."). No extinction-path losses in this corpus. national-live-at-death: 5/12 (42%) — the surpluskeep2-b signal (villages dying with intact realms) reproduces.

**Pantry-crash anatomy (final 14d before loss)**: the crashes are real and steep (steepest-7d drops 1,000–42,473 kcal). Two shapes: (a) scattering losses on small pantries (600–11,000 kcal → 0, measured outflows ~0 — the village simply stops eating from an empty pantry and walks); (b) succession losses on LARGE pantries (22,470–60,919 → 3,007–28,977 kcal — the pantry is full while the roster collapses: pop 8→2/3/5, implied net inflow deeply negative −13k to −42k kcal — rot + consumption + unmeasured draws, honestly inseparable). Tribute is a real outflow (up to 10,134 kcal in the final 14d). Starvation as a DIRECT death cause is only 12/230 (5.2%) — the cluster kills via roster collapse (succession) and walking (scattering), not via individual starvation beats.

**Wall (n=16)**: won 0/16, national(end) 7/16, national(ever) 12/16, table 12/16, wave4 14/16, wave5 0/16, exiled 0/16, survival median 137d, max 181d.

## Balanced panel (§15)

Not applicable by design: this is a single-substrate DIAG census (no treatment arm, no before/after). §15 governs before/after comparisons through the balanced panel; there is no comparison here. The corpus is the instrument output itself (per-seed JSONs are the panel-equivalent raw record). No panel file produced; this section documents the §15 consideration as the methodology requires.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read across the corpus, not just the counts:
- **Personhood holds in the rows**: Devon, Landon Boyko, Charlotte, Fatima Hassan — unique names throughout; folk names on monsters (The Algorithm wave 4, Big Big the murkcap, Speedbump). The unique-person law is visible even in autopsy rows.
- **The loss beats read as literature**: "Haven couldn't hold. On the third hungry day, people started walking — in different directions. The scattering, again." / "No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here." These are voiced once per loss, site-correct (scattering vs succession), and match the code-grounded trigger sites in the Canon section. SENSE-PASS.
- **"other: experiment" (6 deaths, incl. Charlotte d38)**: the alien-experiment cause is real in the taxonomy but its in-game voicing was not sampled in this census — filed as a sense follow-up, not a fail (the cause is named, the beat unjudged).
- **combat-unknown honesty**: the 38 "cause=monster" rows are deaths of fight wounds where the engine never threaded the monster id through hurtVillager. The instrument does not invent a monster name — it says combat-unknown and the analyzer breaks it down. That honesty is the point of the instrument; the engine gap is filed as a backlog item.
- **No robotic repetition in the beats**: the two village-lost beats vary by site and hungry-day count (third vs fifth); per-death rows carry distinct who/when/cause triples.

## Metric review (§14)

Judged as written. PRIMARY bar: "≥95% of person deaths attributed to named proximate causes, 0 unexplained remainder," with 'unexplained' defined as instrument failure only. The instrument (written pre-sweep, 20:15Z) operationalizes "named" as the taxonomy in deathcensus-instrument-20261021.js; combat-unknown is a named family class with a documented breakdown, not a residual bucket — 230/230 named, 0 unexplained → DIAG-GO, no re-scoring.

**Metric doubt for the NEXT run** (not this one): 17% of person deaths sit at family-level attribution (combat-unknown). If a future census wants monster-level attribution ≥95%, the instrument needs the hurtVillager monster-id threading first — that's an engine change, filed as a backlog item. The current bar is met as written; the doubt is recorded, not applied.

Trap acquisition by source: NOT instrumented (no trap hooks) — reported as unmeasured per the analyzer's honesty notes, never as zero. Inflow vs rot vs consumption: inseparable, reported as implied net inflow only.

## Village assessment

Sixteen villages on the FEASTSCALE_R13=1/SEATDRIVE=0 substrate. Twelve died, four survived to the horizon. The dead ones died in two clean shapes: half walked (scattering — the pantry hit zero and on the third-to-fifth hungry day people left in different directions), half hollowed out (succession — the scholar died with no successor while the pantry still held tens of thousands of kcal; rosters fell 8→2 as wave-4 monsters did the killing). The living four reached the table (12/16 table overall) but none won and none opened the wave-5 door — the binding wall stands on this substrate too.

What killed people, overwhelmingly, was combat (74%) — and within combat, wave-4 monsters (69 of the wave-tagged person deaths). Starvation barely registers as a direct cause (5%) even in a corpus built around a starvation-cluster question: the famine kills villages, not villagers. The succession shape is the cruel one — s66041/leadfeast died at d115 with 45,386→8,143 kcal still in the pantry and nationalLive true. Food was not the problem; people were.

Who thrived: villages that reached wave-4 with a living scholar and a roster ≥6 held to d130+. Who died: thin rosters after wave-4 engagements, and villages whose scholars took the field. The blank this run fills: the d100–150 death cluster now has an autopsy — it is two distinct mechanisms (scattering vs succession), both fully attributed, both voiced. The blank documented: monster-id threading at hurtVillager (the combat-unknown 40).

## Convergence state

DIAG-GO. food-economy stays converging: the death-cause census the 1630Z run named is now complete — the d100–150 cluster is reproduced and decomposed (scattering vs succession, 6/6), 100% of person deaths attributed, 0 unexplained. The census does not move a lever; it closes a measurement gap. Named nexts: (1) the hurtVillager monster-id threading (backlog, engine-side); (2) the replacement-direction design (villagers deprioritizing production/storage when food is plentiful) can now be judged against a real death baseline — starvation 5.2%, scattering losses on empty pantries, succession losses on full ones.

## Telemetry note

(pending — telemetry deviation check at closeout vs scale-wall baselines; this corpus is a food-economy DIAG substrate, SEATDRIVE=0, so wins/national are expected below the win-stack baseline — regime artifact by design.)
