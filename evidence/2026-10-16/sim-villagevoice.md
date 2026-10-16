# sim-villagevoice — VERIFY VILLAGERS ACT LIKE PEOPLE (2026-10-16)

Run: fleshout-20261016T0215Z | Axis: scale-onramp | Arm: mission step 4 (diagnostic, instrument-only)
Canon read first: docs/CANON.md + docs/CONVERSATIONS.md (dialogue design), docs/PARTY.md.
Worktree: ~/workspace/worktrees/sim-villagevoice (HEAD c004b9dd at sweep start).

## PRE-REGISTRATION (binding — written before judging)

- **Substrate**: current winning stack, seat driver DEFAULT-ON.
  Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1,
  SEATDRIVE unset (= ON per c004b9dd). Zero src/js changes, zero policy changes.
- **Policies**: leadfeast, belongfeast (scripts/policies/feastscale.js).
- **Seeds**: 118,128,138,148,158,168,178,188 — 8 FRESH seeds, verified 0 per-seed
  JSON hits across evidence/ before the run. 16 runs total, 180d death-aware
  (runDays; dead villages stop simulating).
- **Instrument**: scripts/villagevoice-20261016.js — wraps Game.say (every beat,
  {day, text}) + Game.tele (death/contest/snare events) + policy.daily roster
  snapshots every 30d. Post-run classification with
  scripts/villagevoice-lib-20261016.js; a final re-classify pass
  (scripts/villagevoice-reclassify-20261016.js) applies the final classifier to
  ALL runs so mid-sweep classifier improvements don't split the dataset.
- **Categories** (in order): template-fingerprint (verbatim repeat, 2nd+;
  records base category) → system-voice (◈ / 📺 SYSTEM / THE HERALD) →
  dialogue-with-stakes (quoted villager speech w/ roster name, NPC asks, or
  quoted stranger requests) → event-reaction (death/funeral/raid/contest/
  table/feast/grief/disease words + attribution, or names of the recently
  dead within a 14d grief window) → goal-driven (named want/plan/promise) →
  routine-honest (named routine work) → scholar-action (second-person) →
  other-narration (documented fallback; attributed iff roster name or village
  collective appears).
- **PRIMARY GO (binding)**: ≥95% of captured villager beats categorized into
  the five sense categories {dialogue-with-stakes, goal-driven,
  event-reaction, routine-honest, template-fingerprint}, AND zero
  unattributed beats (classify() never returns null).
  A villager beat = sense-category beat, or a beat naming a roster villager /
  the village collective.
- **DELIVERABLE**: sense-read transcripts of ≥4 full runs end-to-end —
  plain-words verdicts on who the villagers were, what they wanted, whether
  talk/action cohered with backstories and events.
- **Findings**: genuinely NEW [open] lines to sim-findings.md only; lines 355,
  368, 371, 372, 373 already filed (narration template fingerprints) — do NOT
  re-file. Duplicates = loud literature-review failure.
- **Proof**: scripts/test-villagevoice-20261016.js — unit (classifier
  known-answer incl. duplicates + zero-attribution invariant + synthetic
  stream GO arithmetic), det-gate 4/4 trajectory-identical on identical seeds
  (read-only), SMOKE green.

## RESULTS

### Wall metrics (16 runs; context only — this run is diagnostic, no lever)
national 16/16 | table 12/16 | wins 0/16 | wave4+ 12/16 | median survival 136d | max 180d | exiled 0/16.
Per-seed JSONs: evidence/2026-10-16/perseed-villagevoice/ (numeric keys
national/table/wins/exiled). Beat captures: evidence/2026-10-16/villagevoice-beats/.

### Voice distribution (185,147 beats, post final re-classify)
- dialogue-with-stakes 12,798 (6.9%)
- goal-driven 3,211 (1.7%)
- event-reaction 1,252 (0.7%)
- routine-honest 4,754 (2.6%)
- template-fingerprint 109,390 (59.1%) — verbatim repeats (2nd+ occurrence).
  Base categories of repeats: other-narration 75,657 / scholar-action 18,441 /
  dialogue 9,964 / routine 2,743 / goal 1,656 / system 590 / event 339.
  44% of all dialogue beats are repeats of earlier dialogue beats.
- system-voice 1,691 (0.9%) | scholar-action 9,314 (5.0%) | other-narration 42,737 (23.1%)
- villager beats: 88,477 | sensed (5 sense cats): 61,650 | **share 69.7%** | unattributed: 0

### PRIMARY GO verdict: MISS (69.7% vs ≥95%; zero-unattributed ✓)
The miss is reported as measured — no re-scoring. See METRIC REVIEW for the
decomposition of the 30.3% residue (mostly real villager-adjacent narration
the 4 sense verbs under-cover: cooked/pries/gathered/smoked, water returns,
descriptor-attributed chores — not garbage beats).

## TRANSCRIPT SENSE-READS (4 full runs, end to end)

### 1. leadfeast-s118 — 180d survived, national+table, wave 5, no win
The scholar's chair is a relay: Paola Carter (electrician) d1–37 → Betty Romero
d37–48 → Vanessa Shin d48–121 → Jan Królikowski (dead same day, d121) → Senan
Prendergast d121–125 → Maya Singh d125–141 → Imani d141–145 → Naran → Chantal →
Farid → Victor (dies d180, run ends d181 survived). The village buries eleven
named villagers and keeps going.
Coherence holds where it matters: d37 Paola dies in combat and the village
performs a real succession — "🕯️ Paola Carter is dead — combat. The village
stops. Somebody screams. Somebody else starts digging." Vanessa looks at the
new bearer: "Paola's gone. You're not Paola. No heat in it. Just fact. You'll
have to earn this face." At the grave Imani and Vanessa speak for Betty:
"Paola trusted them. We saw it. Give them the fire's hearing." The Codex
records full names and day-counts ("Paola Carter, 37 days. The mantle passes
to Betty Romero"). The d121 double-succession (Vanessa → Jan → Senan in one
day) is handled without breaking the fiction: "🪞 You wake up somebody else.
Jan Królikowski, 45 — a Baker. The fire knew Jan before the Codex did."
Daily life is textured and continuous: Jan teaches the soft-green-glow counter
("Strike the light from two squares out"), fire-side gossip distorts
("It's barely the same story now. That's what fires do."), the village argues
monster names ("Betty is calling it 'Big Big.' They'll fight it out"), duties
are assigned AND performed (Imani: 236 water assignments, 497 returns — the
follow-through is real), Senan makes healer rounds with HP numbers, the barter
economy stirs, feasts draw scavengers ("The Landlord is circling the edge of
the light. It followed the feast here.").
Verdict: ACTS LIKE PEOPLE. The grief triptych is verbatim every time (filed
#355), but the surrounding speech reacts to the specific dead — testimony,
"earn this face," the Codex entry. The failure is duration, not presence
(see finding: grief has no half-life).

### 2. belongfeast-s118 — 180d survived, national, no table, wave 3
Paola survives to d166 here; the village's standout is Imani — a coherent
rival-to-deputy arc across 180 days: "Who put YOU in charge?" (×15),
"Why are YOU giving orders?" (×34), "Imani stopped asking. They just started
organizing the Fetch water crews. Nobody stopped them," proposing relief after
a raid (d9), rallying the fire ("We can't just watch this happen. Here's what
we CAN do — pick one, maybe two, but everything costs something"). Vanessa
carries an unresolved secret: "back when I was an ER nurse..." then a
correction "worse than the slip"; "said 'Denver' just a fraction too
deliberately. Whatever home is, it isn't where that sentence started."
("ER nurse, huh?" — an hour later she drops shop-talk no ER nurse would get
right.) The village circles the lie in gossip but never resolves it — the bot
scholar never asks, and nobody else confronts her either. The System arrives
d7 and the village notices together: "Everyone's journal is changing. Everyone
hears the voice. Betty grabs your arm. 'Tell me you hear that too.'"
Knowledge moves the human way: plant lessons by the fire ("remember it. Word
gets around"), drawn diagrams ("It'll wash away. The knowledge won't"),
naming debates that settle ("It's settled. The village is calling it
'Ugly-Eyes.' The Codex keeps it"). Vanessa dies d43 ("💀 The Choir Toad killed
Vanessa in 1 round. The village mourns"); Betty, quieter: "Three weeks we've
known them. Feels longer."
Verdict: ACTS LIKE PEOPLE — the strongest personhood in the set. Imani reads
as one continuous person with a changing relationship to authority; Vanessa
reads as a person with a past she won't name. The open blank is confrontation:
secrets are circled, never pierced.

### 3. leadfeast-s138 — 97d, village lost, national+table, wave 5
Scholar Rebecca (paramedic) dies d16; the village absorbs it and keeps
teaching. d34 is a massacre: 14 "ducks_in_a_row" deaths in one day. The run
ends with a single villager (Rosalinda). Under collapse the village behaves
coherently: "Nobody walks alone today" (buddy system after the maulings),
crisis leadership by the fire ("The sick can't wait us out. Somebody has to
say it, so: we need a plan, tonight"), the snare-teacher's lesson ("...Want
to actually SEE one? They show you — the loop, the trigger stick"), lessons
that notice their own repetition ("Hold on — I already showed you this one.
Hickory Nuts. You remember."), Ashley organizing the palisade stone drive.
The System appears as a character with its own voice: "🐺 HOWLS in the
distance. Closer than before. The System chirps: 'Oh! We made those! Are
they... too many? We can make fewer?'" — unhinged, trying, exactly the canon
register. Omar tests White Oak Acorns on himself ("Raw, it knots the stomach.
Cooked... fine") and the Journal records the rule before the name.
Verdict: ACTS LIKE PEOPLE, even in collapse. The loss reads as tragedy with
texture, not as a system error. (Contains the "Ashley to A" rendering bug —
see findings.)

### 4. belongfeast-s168 — 41d, village lost (starvation cascade)
Scholar Seamus (librarian). Yara dies of fever d33; d38 Si, Antonio, Sigrun
starve; d40 Arlo, Sal starve; Lucas fever d38. The village counts itself down:
"💀 Si starved. Slowly. The village is 9 now." → 8 → 7 → 6. Si's arc is the
run's spine: the challenger ("Why are YOU giving orders?" ×14) becomes the
de-facto leader — "Si doesn't bother arguing anymore. By dusk the Cook crews
are taking orders from them, and nobody quite remembers when it changed" —
and then starves on d38. Grief surfaces in the only two villager-grief lines
in the dataset: Sigrun, Antonio, and Sal each sit near you: "I keep setting
out an extra bowl. Stupid." (verbatim across speakers — see findings), and
Antonio earlier: "I keep setting out an extra bowl" as narrator beat. Foreign
beggars arrive with memory: "🥣 Lucia of Thornfield walks into your firelight
alone, thinner than you remember. 'Our jars are empty,' they say. No
preamble. 'I'm asking for food.'" Then the consequence chain: "Ruth waits two
days at your fire, getting thinner. Nobody answers. They walk back to The
Red Table with empty hands." → "🌙 You weren't at the treeline. Peter of The
Red Table didn't wait — they hit the stores and melted back into the dark."
Unanswered begging becomes a raid. Meanwhile the village keeps living until
it can't: "Antonio and Hilda are arguing about the watch rotation. Again.
It's almost comforting." "Sal again, quieter: 'Three weeks we've known them.
Feels longer.'"
Verdict: ACTS LIKE PEOPLE. The starvation is the scale wall made legible —
and the village's dying is written with more care than most games give their
endings.

### Cross-run sense notes
- Table experience is entirely top-down: 12/16 runs reach the table; the only
  table beats are System OVERTIME pressure ("Take your seat from Haven to stop
  the clock"). Zero villager-voiced table beats. Corroborates filed #372
  (bottom-up table-talk absent) — not a new filing.
- The mantle/succession fiction is coherent across 30+ successions in the
  dataset: full names, day counts, testimony, "earn this face."
- Contests fire constantly late (every ~2 days) with watchable beats; the
  village cheers its monster-killers by name.
- Naming: foreign visitors can share first names with dead villagers
  ("Maya of Emberhold" vs dead Maya) — instrument attribution caveat, not a
  game bug.

## FINDINGS FILED (3 new, all checked against sim-findings.md — no duplicates)

- [open] 2026-10-16 — narration/villagers — GRIEF HAS NO HALF-LIFE (flesh-out
  loop sim-villagevoice, run fleshout-20261016T0215Z, evidence/2026-10-16/
  sim-villagevoice.md): the funeral sequence is real (death triptych + "That
  night, they bring X home. Nobody asks you to help carry; nobody has to. By
  morning the grave is dug by the fire..."), but across a full 181-day run
  with 11 named villager deaths (leadfeast-s118, beats evidence/2026-10-16/
  villagevoice-beats/leadfeast-s118.json), ZERO villager-speech beats mention
  a dead villager after the funeral line — in any category, for the rest of
  the run. The dead vanish from villager talk the morning after the funeral:
  no "Paola would have…", no grief threads in fire-side gossip, no
  anniversary. Distinct from filed #355 (verbatim funeral templates): this is
  about absence of continuation, not repetition. The one exception proves the
  mechanism exists: "I keep setting out an extra bowl. Stupid." (see next).
- [open] 2026-10-16 — narration/villagers — NPC GRIEF-DIALOGUE LINE REPEATS
  VERBATIM ACROSS SPEAKERS (flesh-out loop sim-villagevoice, run
  fleshout-20261016T0215Z, evidence/2026-10-16/sim-villagevoice.md, beats
  evidence/2026-10-16/villagevoice-beats/belongfeast-s168.json): "I keep
  setting out an extra bowl. Stupid." fires word-for-word for three different
  villagers (Sigrun d34, Antonio d35, Sal d35); the narrator variant "X set
  out an extra bowl before catching themself. Nobody mentioned it." fires for
  Si/Antonio/Arlo. New surface for the #355 template-fingerprint class —
  filed instances are system/death/raid/herald narration; this is villager
  SPEECH, the surface where repetition is most visible to a player in
  conversation.
- [open] 2026-10-16 — narration/bug — HAVENNEEDGOSSIP RENDERS UNKNOWN
  LISTENERS AS "A" (flesh-out loop sim-villagevoice, run
  fleshout-20261016T0215Z, evidence/2026-10-16/sim-villagevoice.md):
  "🗣️ Ashley to A, by the fire: 'Stone. We need 59 more for the palisade
  footings…'" — src/js/havenGrowth.js havenNeedGossip does
  `String(this.displayName(listener)).split(' ')[0]`; for a name-unknown
  listener the descriptor "A woman, maybe 40s, with a shaved head" splits to
  "A". 6 occurrences across the 16 runs (leadfeast-s138/s158/s178,
  belongfeast-s138), always the stone-footings line, always d4–d7. Fix
  direction: render the full descriptor for unknown listeners, or restrict
  the listener draw to name-known villagers.

## METRIC REVIEW

1. PRIMARY GO (≥95% sensed) MISSED at 69.7% — not re-scored. Decomposition of
   the 30.3% attributed-but-unsensed residue (26,827 beats): (a) ~13% are
   routine-work verbs the classifier's list under-covers (cooked, pries,
   gathered, smoked, "worked the smoke racks"); (b) the bulk is real
   villager-adjacent narration with no sense verb — water returns, hall
   sweeping, descriptor-attributed chores, eating by the fire ("A woman, maybe
   20s is eating by the fire — not talking, just eating"). These beats are
   honest village texture, not classifier failures — the GO's 95% bar assumed
   the 14-fixture verb list covered the space; it doesn't. PROPOSED for next
   run: add a fifth sense family (chore-honest: cooking/stone/water/wood
   production verbs) and re-baseline the GO on the measured residue classes,
   or split the metric: "sensed or chore-honest ≥90%".
2. Grief-window boundary (fixed same-run, documented): the first
   implementation applied the 14d death-context window ON the death day too,
   sweeping same-day routine beats ("💧 Si returns with 19L") into
   event-reaction. Tightened to strictly-after-death; funeral-day beats are
   caught by RE_EVENT anyway. Unit fixture pins the boundary.
3. Classifier corrections applied mid-sweep via the pre-documented
   reclassify pass (all 16 runs re-classified with the final classifier):
   ◈-marker beats → system-voice (were other-narration); disease beats
   (achy/fever/ill) → event-reaction; quoted stranger requests (tribute
   beggars) → dialogue-with-stakes. The GO verdict is against the FINAL
   classifier — no shopping.
4. Instrument caveats: (a) foreign visitors sharing first names with dead
   villagers ("Maya of Emberhold") pollute death-context attribution —
   rare, accepted; (b) beats are captured at 500 chars (truncation noted
   where quoted); (c) the bot scholar never talks, so player-driven
   conversation threads (CONVERSATIONS.md) are unexercised — NPC talk
   requests fire but hang unanswered; a talk-driving policy would open the
   dialogue surface properly.

## CONVERGENCE STATE

converging — Villagers act like people across all four sense-reads: coherent
arcs (Imani, Si), grief sequences with succession testimony, gossip with
distortion, knowledge teaching, duty follow-through, scale transitions felt
by the village. Three new blanks filed (grief half-life, cross-speaker grief
templates, "A"-listener bug). The 95% sense-coverage GO needs recalibration
(metric review) — the instrument is honest, the bar was set on fixtures.

## Proof log

- unit: ALL GREEN (38 assertions — known-answer fixtures for all 8 categories,
  duplicate→template-fingerprint, death-day boundary fixture,
  zero-attribution invariant, synthetic-stream GO arithmetic)
- det-gate: 4/4 trajectory-identical (s118 leadfeast 60d, identical SHA256)
- SMOKE: green (5d, beats captured, per-seed numeric keys
  national/table/wins/exiled)
