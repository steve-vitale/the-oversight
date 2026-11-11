# Corruption / cannibalism — first numbers: pre-registration (arm sim-corruptfirst-a)

Run fleshout-20261111T1408Z, Loop A. Coverage Program Tier 3 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit ae53134ae. No judged sim has run on this base yet;
the pilot runs on ae53134ae, recorded in the evidence. (Master has
already moved to f9164718b28d at prereg time; the task's rebase note
applies before the final commit — rebase onto the explicit master SHA
then, re-run the proof green; the pilot anchor stays ae53134ae,
recorded honestly.)

## Canon

- docs/CANON.md read first. **docs/CORRUPTION.md IS the canon doc
  for this area** (Steve's design, 2026-10-09) — read in full. It is
  the source of every number below; nothing is invented here.
- **The law:** corruption is per-character, 0–100, the dark mirror
  of trust. **The number never shows** — others sense it through
  behavior tells, witnessed acts, and unease. High corruption drags
  trust gains (the foil). Fear is not trust: fear compels obedience
  but never loyalty, and collapses into contempt on shown weakness.
  **Evil is a legitimate path to power** (Steve 2026-10-09,
  overruling the earlier "cut it if evil feels rewarding" line).
  In a corrupted village it's the quickest one. The terrible
  bargain stays: real power at a real price — cravings, brittle
  loyalty, exile risk, prion death. **Televised:** villains are
  good TV; the System notices dark runs.
- **The slope (cannibalism):** butcher a person-corpse → human
  meat → eat. First meal: devastating trauma (~35), big corruption
  jump (+14). Desensitization: each repeat costs less trauma
  (×0.82 per meal, floor 6) while corruption gains accelerate
  (+3 per meal, cap 30). Cravings: at 60+ corruption the hunger
  has a voice — three days without feeding it costs energy every
  dawn (6, or 10 at 85+). Prions: 15% per meal contracts Trembles
  (mundane pool, kuru analogue). Cooking doesn't kill prions.
  Nothing does. No cure at any tier. Witnessed vs hidden:
  witnessed acts detonate socially immediately; hidden acts feed
  only corruption + trauma — but the crime stays on the books
  (witnessed:false) for the detective/moot path. Discovery later
  detonates retroactively.
- **Contextual consequences** (Steve: "In a normal village,
  cannibalism is exile. In a starving or corrupted village — it's
  the quickest source of power."): healthy village → exile
  (discovered cannibalism fast-tracks the moot; the charge
  outranks murder); starving village → horror without exile
  (sustained food stress / recent starvation deaths erode norms);
  corrupted village → power move (bottom-up village corruption
  ≥45, or a corrupt figurehead, inverts the norm: witnessed
  cannibalism breeds dread, dread is authority, the corrupt
  approve — shared secrets bond).
- **Villagers are full participants** (Steve 2026-10-09):
  corruption is not player-only. Villagers accumulate it from
  their own acts (cannibalism, betrayal, murder — witnessed or
  hidden) with the same desensitization mechanics. Village
  corruption emerges **bottom-up** from members' corruption, not
  a flag. Corrupt villagers tempt/pressure the player: offers of
  meat, witnessed acts that normalize, social cover. In starving
  villages, desperate corrupt villagers may cross the line on
  their own — leaving evidence the player can discover.
- **Psycho spawns** (Steve 2026-10-09): character generation may
  rarely make the PLAYER the dark one — picking (or inheriting,
  on mantle-passing) a villager with a malicious hidden trait
  fires a psycho bundle: flashback, inner voice, starting
  corruption 20, early tells surfaced. Psycho violence escalates
  (Steve 2026-10-13): theft → intimidation → attack, rare by
  design, each stage gated on triggers + cooldowns, answered by
  the justice ladder.
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Corruption / cannibalism — **Unmeasured**: "No — no driver
  calls", `src/js/corruption.js` exists; 1 test
  (`test-corruption-20261009`); zero November evidence/analyzers.
  Corruption is mentioned in 39 November evidence files but has
  no dedicated run, analyzer, or panel judging it. This arm
  supplies the first-numbers analogue.

## What the existing corruption tests prove — and what they do NOT

- `test-corruption-20261009.js` proves the verbs work when
  CALLED on a scaffold state: butcher yields meat (2–4 units,
  needs a blade, no re-butcher dup), eating consumes a unit and
  adds meals/corruption, trauma desensitizes while corruption
  accelerates, the foil drags trust gains at high corruption,
  norms read exile/horror/power from state, justice heat is
  contextual (≥60 witnessed under exile, small under power,
  hidden stays on the books with no heat), fear collapses on
  weakness, cravings drain energy at 60+ when unfed, Trembles
  is mundane-pool and incurable.
- `test-crisis-moot-cannibal-20261018.js` proves the moot path
  for a cannibal charge; `test-psycho-violence-20261013.js`
  proves the psycho escalation stages on fixtures.
- NONE of them measures whether corruption or cannibalism ever
  HAPPENS in a lived village under default competent play: no
  corruption trajectory, no slope attempts, no NPC crossings,
  no psycho spawns, no temptations, no cravings, no fear
  economy, no exile/moot outcomes, no Trembles contractions.
  This arm measures exactly that, on a plain competent band.
- **The competent policy is the first finding, read before the
  pilot:** competent.js explicitly refuses human meat in three
  places (line ~169: `if (it.plantId === 'meat_human') continue`
  — trembles: no cure, ever; line ~236: `skipHuman`; line ~3247:
  `it.plantId !== 'meat_human'`). The scholar's slope is
  expected to be ZERO under competent play by policy design, not
  by engine absence — the pilot must confirm the zero (and
  confirm the engine would have recorded a meal if one happened:
  the fixture proves the eatCannibal wrap live). The live
  question is the NPC side: drift, NPC crossings, temptations,
  psycho spawns and violence, fear, and the norms the village
  actually lives under while starving or drifting corrupt.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: no open line names corruption/cannibalism first
numbers.) Any corruption gap this arm surfaces is APPENDED as
[open] in the evidence file's findings section and in
sim-findings.md, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the corruption verbs exist and are wired —
   `corruptionTick()` runs every part via the `advancePart`
   wrap (cravings, drift, NPC crossings, temptations, care
   packages, psycho violence, fear decay, mantle watch);
   `corpses()` surfaces person-corpses; `eatOne` routes human
   meat through `eatCannibal`; `genRoster` seeds starting
   corruption (15–30) for malicious-dark NPCs; `newGame` fires
   `psychoIntro` for a malicious bearer. The pilot confirms live
   counts in the corpus, not assumes them. The scholar slope
   (corpseButcher / eatCannibal) is expected dead-under-competent
   — proven live in the fixture and marked dead-under-competent
   if the pilot never fires them.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every corruption add
   (scholar + NPC, by reason), every slope call, every tick
   invocation, every fear add, every crime booked, every psycho
   event, every norm read. The engagement floor (GO table) is
   set from the pool's nature: the tick runs every part, so a
   complete snapshot trajectory + tick invocations on every seed
   is the interpretability floor; a zero slope is a finding
   (policy refuses the meat), not an uninterpretable pilot —
   provided the fixture proves the instrument would have caught
   a meal.
3. **Verb existence**: addCorruption, addNpcCorruption,
   corpseButcher, eatCannibal, humanMeatItem, corruptionOf,
   villageCorruption, cannibalNorm, starvingVillage, fearOf,
   addFear, avgFearOf, fearWeakness, psychoIntro, mantleWatch,
   cravingTick, npcDriftTick, npcCannibalTick,
   discoverNpcCannibalism, temptTick, darkShowBeat,
   darkCarePackageTick, psychoViolenceTick, corruptionTick,
   corruptionThresholdBeat, nearButcherableCorpse, contractDisease,
   recordCrime, justiceHeat, justiceState, trustGainProgressive,
   intimidate, remember all exist in the engine (citations
   above). The policy drives the village through days, deaths,
   starvation and corpses — that substrate IS one of the first
   numbers (how often does a starving village with person-corpses
   and corrupt members even arise?).
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 116–140d); corruption is a whole-life
   question (drift is +1/day at most, cravings need 60+,
   psycho escalation needs 7-day cooldowns per stage, NPC
   crossings need a starving village + a corrupt candidate +
   a person-corpse). Same horizon as the siblings for
   comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of corruption /
cannibalism in a lived village** — every corruption add classified
by who + reason; every slope call classified by outcome; every
tick invocation counted with its effect; every fear add, crime,
psycho event, temptation, craving drain, norm read and Trembles
contraction counted or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every addCorruption / addNpcCorruption event classified by who + reason | 0 unclassified corruption adds across the pilot (who player-or-vid, reason non-empty) |
| Every corpseButcher / eatCannibal call classified by outcome | 0 unclassified slope calls (granted vs refused, with the refusal reason recorded) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | snapshot trajectory complete (daily corruption/norm fields present) on all 8 seeds AND corruptionTick invoked on all 8 seeds, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Corruption trajectory: scholar corruption (daily, end, max,
   threshold crossings 30/60/85 with days); NPC corruption per
   villager (end distribution, max, who ever exceeds 30/60);
   villageCorruption mean trajectory (end, max, days ≥45);
   cannibalNorm trajectory (days in exile/horror/power per seed);
   starvingVillage days per seed. Every addCorruption /
   addNpcCorruption event by reason.
2. The slope: corpseButcher calls (granted/refused, refusal
   reason: no blade / too far / not a person / already
   butchered / none in range); human-meat units created; human
   meat in scholar inventory over time (tempted parcels, care
   packages); eatCannibal calls (granted/refused, spoiled);
   meals, trauma totals, corruption gains, first vs repeat;
   prion roll outcomes (Trembles contracted or not per meal);
   witnessed vs hidden (crime witnessed flag); approving vs
   horrified witnesses (shared_secret remembers vs fear adds
   during the act); norm at each act.
3. NPC crossings: npcCannibalTick invocations, feeds (corpse
   npcFed set), who fed and their corruption; discoverNpcCannibalism
   discoveries; normShift accumulation; cannibalism_rumor /
   cannibalism gossip seeded.
4. Temptation + dark show: temptTick invocations, meat parcels
   offered (offered_meat remembers), who tempted; darkCarePackageTick
   invocations, packages delivered; darkShowBeat events by kind;
   threshold-beat lines fired.
5. Cravings: cravingTick invocations, energy drains (amount,
   days since fed), lines spoken; scholars reaching 60+/85+.
6. Fear economy: addFear events (who fears whom, amounts);
   avgFearOf the scholar trajectory; intimidate calls and
   yielded_dread outcomes; fearWeakness collapses; npcNeeds fear
   levels at end.
7. Psycho spawns + violence: malicious-dark roster members at
   genesis (seed corruption 15–30) and over time; psychoIntro
   fires (scholar + mantle successors, darkPath set); mantleWatch
   corruption carry-overs; psychoViolenceTick invocations and
   stages reached per psycho (theft/intimidation/attack, with
   crimes booked); justice-ladder answer to each stage.
8. Consequences: recordCrime events by type (cannibalism,
   desecration, theft, threat, assault, intimidation) and
   witnessed flag; justiceHeat trajectory; justice stage,
   moot demands, exiles (exileDay), uprisings; trust-foil drag
   events (trustGainProgressive returned < base, with scholar
   corruption at the time); corruption vs trust at end.
9. Disease: Trembles contractions by source (human meat vs
   other); Trembles cases alive at end (scholar + villagers);
   Trembles deaths, if any.
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale. Plus the
    substrate counts that decide whether the slope COULD have
    happened: person-corpses seen per seed, starving days,
    corrupt (≥35) candidates present on starving days.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: corruption is a whole-life question (drift +1/day,
  cravings at 60+, psycho stages on 7-day cooldowns, NPC
  crossings need starvation + corpses + corrupt candidates).
  Same horizon as the siblings for comparability.
- **Seeds: 190381–190388 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all
    eight seeds.
  - No perseed directory names any seed 190381–190388 (listing
    of evidence/2026-11-11/ checked).
  - Known used 19xxxx bands in 2026-11-11 preregs: 190201–190208,
    190211–190218, 190221–190228, 190301–190308, 190311–190318,
    190321–190328, 190331–190338, 190341–190348 — none overlap
    190381–190388.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - NOT completed: the full-tree grep over the evidence corpus
    `.json` (multi-MB per-seed JSONs) — the same limitation the
    abilityfirst prereg recorded honestly; the .md scan +
    perseed-directory scan + used-band list cover the naming
    surface. A stray `"totalDraws": 19038x`-style numeric
    coincidence inside a per-seed JSON cannot be excluded — the
    band is fresh as a SEED naming, which is what the skill
    guards.
  - Search scope recorded so a later reader can retrace it.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg). No COMPETENT_TALK, no other env gate — default
    competent is the measurement substrate.
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented control
    leg exactly on days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/corruptfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- addCorruption: every call — n, reason, corruption before/after,
  threshold crossings implied (thresholdBeat wrapped separately).
- addNpcCorruption: every call — vid, n, reason, before/after.
- corpseButcher: every call — cid, granted (meat returned) or
  refused, units, trauma/corruption deltas, crime events fired
  during the call (seq-correlated).
- eatCannibal: every call — idx, meals before/after, trauma,
  corr gain, norm at call, crime events fired during the call,
  Trembles present after (seList read).
- contractDisease: every call — id, opts, returned; Trembles
  flagged, source recorded.
- recordCrime: every call — type, witnessed, victim/villain,
  caseId after.
- corruptionThresholdBeat: every call — before/after, crossed
  thresholds.
- cravingTick / npcDriftTick / npcCannibalTick / temptTick /
  darkCarePackageTick / psychoViolenceTick: every call — day,
  part, effect deltas (energy, npc corruption map, npcFed
  corpses, inventory meat delta, psycho stages).
- psychoIntro: every call — fired or not, corruption after,
  darkPath.
- mantleWatch: every call — bearer change, corruption carried.
- discoverNpcCannibalism: every call — cid, discovered or not.
- addFear / fearWeakness: every call — vid/target/n, before/
  after, collapse or not.
- intimidate: every call — vid, returned value, yielded_dread
  or base path, dread before/after.
- trustGainProgressive: every call counted; drag events recorded
  in full (returned < base, scholar corruption at the time).
- justiceHeat: every call — heat, norm at call.
- darkShowBeat: every call — kind.
- corruptionTick: invocation counter only (runs every part).
- remember: filtered to the corruption keys only
  (shared_secret with the exact eatCannibal text, offered_meat,
  exposed_cannibal, saw_weakness, you_threatened).
- Tele cross-check: NONE — corruption fires no tele events
  (grep: no tele('crime'/'moot'/'exile'/'cannibal') in src/js);
  the cross-check is snapshot reconciliation instead: justice
  crimes in daily snapshots vs recordCrime events (residue 0),
  NPC corruption deltas vs addNpcCorruption events (residue 0).
- Daily snapshot: scholar corruption/meals/lastCannibalDay/
  cravingFedDay/trauma/darkPath/psychoIntroFired; village
  corruption mean + map; cannibalNorm; starvingVillage;
  normShift; avgFearOf scholar; dread entries; human-meat units
  in scholar inventory; person-corpses (total/butchered/npcFed/
  npcKnown); justice crimes + stage + exiled + exileDay;
  Trembles cases (scholar + villagers, via seList); malicious-dark
  roster count + psycho stages; pantry kcal, roster size,
  standing, scaleRank, nationalLive, wave.
Driver: scripts/corruptfirst-driver-20261111.js (mirrors
abilityfirst-driver; Game.say wrap with a corruption regex for
the sense corpus, 200 lines/seed cap — same early-game-only
caveat as the siblings). Analyzer:
scripts/corruptfirst-analyze-20261111.js (classifiers for
corruption adds by reason, slope calls by outcome, tick effects;
snapshot reconciliation for crimes + NPC corruption). Proof:
scripts/test-corruptfirst-a.js (each wrap proven live on a
fixture or miniature; RED checks on the pre-fix instrument
where a wrap is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-trustfirst-a,
sim-fishstaff-b, cookfirst-a, preserve-a, fishfirst-a,
travelfirst-a, tradefirst-a, abilityfirst-a). The control/neutral
legs are the neutrality proof, not a panel. Panel context: **no
panel metric for corruption at all** (coverage audit §4) — this
arm supplies its first-numbers analogue (Metrics 1–9).

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (abilityfirst-a: median survival 116d, 1/8 survived,
630 deaths over 851 village-days). If the instrument changes
any numeric field vs the recorder-free baseline, the arm is NO-GO
on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
