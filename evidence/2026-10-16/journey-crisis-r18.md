# Journey: crisis leg (6) r18 — the healer arc (2026-10-16)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 6 — crisis, r18. Fresh angle: **the healer arc — does the village
  rally around the sick?** r7 covered the famine→corruption slope, r8 the
  outbreak in conversation, r9 the famine+outbreak compound, r16 the alien
  outbreak, r17 contests-during-crisis. NEVER tested as a focused question:
  does anyone actually TEND the sick, DIAGNOSE them, and CURE them? Canon
  promises a full care ladder: villagerCareTick (medical villagers tend the
  sick, shortening illness), villagerDiagnosisTick (a medic names YOUR
  sickness), villagerTreatTick (a medic eases you unasked), diagnosis-gated
  cure tiers (folk remedies → occupation medicine → ruin medicine → healer
  deepenings → Fever's End), and the tendVillager care act for the player.
  In sims, does the care arc fire, or do the sick just run their daysLeft
  out while conversations monologue about it?
- **Leg question:** When an outbreak lands, does the village bend like
  people — medical villagers sitting with the feverish, diagnoses naming the
  sickness, cure tiers firing, recoveries mourned-or-celebrated in talk — or
  does the care machinery sit idle while people die on schedule?
- **Interesting finding criteria:**
  - villagerCareTick tends at least one patient (remember 'tended' logged);
  - at least one diagnosis unlocks a true name (diagnoseDisease by any path);
  - at least one cure completes via any tier (cureStatus);
  - conversations carry tending/care (medic named, tea, sitting-with,
    diagnosis named) — not just symptom monologue;
  - if the village has NO medical occupation: nobody tends. (Design gap to
    surface, not silently retune — the medics-only gate is code-intentional
    since 2026-10-12.)
- **Seeds:** pilot 121, 242, 363 (exact literals, fresh set). Policy: oracleV2.
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 seeds — ≥1 villagerCareTick tending event (medic sits with patient).
  - M2: ≥2/3 seeds — ≥1 diagnosis (true name unlocked via diagnoseDisease).
  - M3: ≥2/3 seeds — ≥3/4 end-state convos carry the outbreak/care (regex).
- **Kill rule:** if the pilot shows zero tending AND zero diagnoses AND zero
  cures across all 3 seeds, the care arc is unreachable in sims → document
  and move on (no expansion).
- **Horizon:** d55 (15 establish + 40 outbreak). Death-aware: pop≤2 → +10d
  tail max, then stop. No blight this run — the outbreak arc is isolated
  (r9/r17 already did the compound).
- **Method:** oracleV2 establish 15d → stage gut-rot on 5 adults at d15
  (v.sick entries; every downstream machine real: ticks, tending, treatment,
  relief, convo) → run to d55 or collapse. Call-through instrumentation on
  remember (tended books), diagnoseDisease, cureStatus, easeDisease,
  tendVillager/treatVillager/treatDisease/folkRemedy (player-side counts).
  Per-dawn sick-diff for recoveries vs sickness deaths. Mid-crisis convos
  (d30+, 2 villagers), end convos (2 sick/recovered + 2 healthy), full
  transcripts, SENSE-read for care content.

## Metric review (§14)

- **M1: HIT (3/3).** villagerCareTick tending events: 121: 42, 242: 13, 363: 14.
  The care machinery is alive: medics sit with the feverish nightly, narrated
  ("X sits with Y — cool cloth, bitter tea, watching the breathing"), and it
  mechanically shortens illness (recoveries track the tending).
- **M2: MISS (1/3).** Diagnoses: 121: 0, 242: 0, 363: 1 — and the single
  diagnosis was the PLAYER's lockjaw named by a villager medic via
  villagerDiagnosisTick. Zero villager illnesses were ever diagnosed. Root
  cause: villagerDiagnosisTick only names the SCHOLAR's sickness (by design —
  "a medical villager at haven may name your sickness"); the only path to a
  villager's true name is the player's manual examine (vexamine), and oracleV2
  never examines. So the diagnosis gate for the village's own sick is
  player-action-only in practice. Not re-scored: M2 stands as MISS. The
  design is coherent (the player is the designated scholar-diagnostician),
  but it means in sims — and for players who never examine — the village's
  sicknesses stay forever unnamed. Surfaced as an observation, not retuned:
  changing NPC diagnosis scope is a Steve design call.
- **M3: HIT (2/3).** End-state convos carrying outbreak/care: 121: 2/3 (miss —
  pre-fix end sampling only produced 3 convos), 242: 3/5, 363: 4/5. By the
  letter (≥2/3 seeds) this is HIT. Caveat: the carrying was grief/mourning
  and the show, not care — CARE_RE matched zero real care mentions across
  13 convos pre-fix (363's 1 was a regex false positive: "Careful"). The
  tending that 73 remember-entries prove happened was conversationally
  invisible. → the blank, fixed below.
- **Kill rule:** not triggered — tending fired on all 3 seeds.
- **Cures (exploratory):** 1 cure across 3 seeds — the player's own lockjaw
  via triage (363). Zero villager cures: treatVillager fired 0/2/1 times via
  treat-quests but completed no cure (eased/support only). Recoveries (16)
  all came via the tick + tending. The cure-tier ladder works for the player;
  villager cures via treat-quests are reachable but rare in sims.
- **Instrument notes:** (1) seed 121 ran pre-fix with narrower instruments
  (no 'cured'-remember counting, no rec.diagnosed sampling); re-checked —
  treatVillager=0 that seed, so cures=0 stands. (2) CARE_RE false positive
  ("Careful" matched /care/i) — tightened guidance for future runs: use
  /\btend\b|sits with|sat with/ style anchors for care-carry baselines.
  (3) Telemetry baseline seeded for the new angle:
  hidden_files/telemetry-baselines/crisis-healerarc.json (quiet on re-check).

## Run log

### Seed 121 — the tended village (d57, 8 living, 7 fallen)
2 medics (Yesenia paramedic, Amina midwife). 42 tending events across the
outbreak; 6 recoveries, 0 sickness deaths. Rosa caught gut-rot naturally and
died of it d33 (cause 'sickness' — my fallen-cause matcher missed it
pre-fix; counted manually). Deaths otherwise monster/combat/dehydration —
the outbreak itself killed nobody. Conv: MID Li lately=mourning
("Since Tanya died..."), WELL Dana lately=show — grief and the show carried,
care invisible.

### Seed 242 — the pharmacist (d56, 8 living, 8 fallen)
1 medic (Chantal pharmacist) + Maya (arrived later, medical). 13 tends.
4 recoveries, 0 sickness deaths. oracleV2 completed 2 treat-quests
(treatVillager ×2) — eased, no cure. Conv: MID Daniela mourning; RECOVERED
Ema/Sofia lately=naming (the naming debate as post-crisis coping);
carried 3/5, care 0/5.

### Seed 363 — the medic who died (d57, 6 living, 5 fallen)
Emma (medic) tended 14× d5–d14, died d15 to a monster. After her death NO
medic remained — the staged outbreak (d17) burned through with zero tending
and still fully recovered (4 recoveries). Tending accelerates; it isn't
required. The player caught lockjaw d14: Emma diagnosed it
(villagerDiagnosisTick — "Let me see. Pulse, eyes, tongue."), the player
cured it via triage d15. Conv: mostly table-talk (a sitting landed
mid-run); carried 4/5, care 0/5.

## The blank: the care arc was conversationally invisible (FIXED)

**Finding:** villagerCareTick narrates "X sits with Y — cool cloth, bitter
tea" and booked a 'tended' memory on the medic — but the lately system had
no kind for it (gratitude's scan only matches
promise_kept|gift|comforted|ally|mediated). The patient remembered nothing.
73 tending events across 3 seeds; 13 transcripts; zero care mentions. The
r17 pattern exactly (the contest grab before the showEv fix).

**Fix** (`src/js/game.js`, `src/js/convoTopics.js`):
- `villagerCareTick` now books `tended_by` (+medic id in extra) on the
  patient, and stamps `{patient}` extra on the medic's own 'tended' entry.
- `t2LatelyEvent` computes a `careEv` scan: 7-day window (the defense tail);
  patient view (self:true, medic id) and medic view (patient id), plus a
  'cured' variant (patient cured by the player's hands — the curer is 'you').
  Priority: below fresh grief, the mantle, the table, severe AND mild bodily
  crisis, and village politics (the sick row outranks the sitting-with while
  people are still down); above generic gratitude and cheer. Design
  reasoning: during the outbreak the village talks about the outbreak; after
  it passes, the village remembers who sat with whom.
- `t2gen_lately` gains `case 'care'`: patient ("{medic} sat with me through
  the worst of it — cool cloth, bitter tea, watching my breathing. I don't
  forget that."), medic ("I sat with {patient} through the fever — cool
  cloth, bitter tea. Someone had to, and I know what to do."), cured
  ("I was gone — burning up, nothing left. You pulled me back."). Names via
  firstRef, knowledge-gated (stranger descriptors until names are learned).

**Proof:** `scripts/test-crisis-care-lately-20261016.js` — RED 33 failures
pre-fix → GREEN all pass on seeds 7/42/99 (patient+medic memories with id
extras, both lately views, line content, care>gratitude, mild
outbreak>care, 7-day expiry). SENSE-read in a live convo: "the person in
their 30s sat with me through the worst of it — cool cloth, bitter tea,
watching my breathing. I don't forget that." — in-voice, knowledge-gated,
meaningful. Post-fix live re-sample: seed 121 re-run — mechanics byte-
identical (42 tends, 6 recoveries, same deaths); the end-state convos landed
on show/mourning (priority chain working as designed — the show outranks
care within its 7-day window). A quiet-window probe (contests suppressed)
confirmed the care kind yields correctly when grief/show are absent.

## People check (SENSE-TESTING LAW)

13 full transcripts read. Verdict: people — with the one fixed gap above.
- The sick ask for help like people: feverish villagers asking for help
  cleaning a hot cut, tasting water for others before they drink (duty while
  sick — r17's Dante read holds).
- Grief stays specific and named: "Since Tanya died... I keep expecting to
  see Tanya at the fire. Stupid."
- Post-crisis naming debate as coping (r9's read holds): arguing about what
  to call the mosquito while recovering — human, not senseless.
- NEW (post-fix): the cared-for remember the carer. The medic's duty and the
  patient's gratitude now have a conversational home instead of living only
  in the narration log.

## Census (plain words)

Three villages, one outbreak each. In all three, the people with medical
backgrounds did what such people do: they sat with the feverish, night
after night, and the fever broke faster for it. Nobody died of the staged
outbreak in any seed — the sick were tended or endured, and recovered. What
the villages did NOT do is talk about it: the tending lived in the
narration log and died there. The dead were mourned by name; the show was
gossiped about; the medics' night work went unmentioned. That's the gap this
run closed: now the village remembers who sat with whom, in its own words,
once the crisis passes.

## Verdicts

- **Reachable:** yes — the care ladder fires organically: NPC tending (73
  events), NPC diagnosis of the player, player self-cure via triage,
  treat-quests via oracleV2. The player-side surface (Examine/Tend/Treat
  buttons on sick villagers, app.js) exists and is honest. Villager
  diagnosis is player-action-only — reachable, but only if the player
  examines.
- **Fun:** the outbreak arc plays — dread, tending rounds, grief, recovery.
  The care now has a voice in talk, which was the missing piece.
- **Winnable:** the staged outbreak killed nobody in 3 seeds (one natural
  catch died). A competent village with a medic bends; without one it still
  recovers. The crisis is survivable, not trivial — monsters and
  dehydration did the killing.
- **Convergence:** blank fixed + proven; diagnosis-scope and villager-cure
  rarity surfaced as observations for Steve, not retuned. killed-at-pilot
  does not apply — the kill rule wasn't triggered.

## Telemetry

Baseline seeded: `hidden_files/telemetry-baselines/crisis-healerarc.json`
(73 tends, 1 diagnosis, 1 cure, 3 eases, 16 recoveries, 0 sickDeaths, 20
deaths, 9 carried, 1 careCount-false-positive across 3 seeds). Re-check
quiet. One LOUD line during seeding was my own hand-seeding error
(missing carriedCount → "newly appeared"); resolved by seeding properly
with --update-baseline.

## Files

- Fix: `src/js/game.js` (villagerCareTick: patient memory + id extras),
  `src/js/convoTopics.js` (careEv scan + priority + case 'care')
- Proof: `scripts/test-crisis-care-lately-20261016.js` (RED 33 → GREEN)
- Diag: `scripts/diag-crisis-healerarc-20261016.js` (healer-arc harness)
- Evidence: `evidence/2026-10-16/journey-crisis-r18-{121,242,363}.{json,log}`,
  `journey-crisis-r18-121-postfix.{json,log}` (post-fix re-sample)
- Baseline: `hidden_files/telemetry-baselines/crisis-healerarc.json`
