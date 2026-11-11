# Titans + heralds — first numbers: pre-registration (arm sim-titanfirst-a)

Run fleshout-loop-20261111T1115Z, Loop A. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit b09cf584e. No judged sim has run on this base yet;
the pilot runs on b09cf584e, recorded in the evidence.

## Canon

- docs/CANON.md read first. **There is NO dedicated titan/herald canon
  doc in the CANON.md manifest.** No doc in docs/ covers titans,
  heralds, omens, or the Network as a design. Nothing is invented
  here; the in-code sources below are the source of truth, plus the
  prior measurement arms (see below). (Canon gap, recorded in the
  evidence: titans/heralds need a canon doc the way diseases have
  docs/DISEASES.md.)
- **The titan class** (src/data/titans.json header, Steve 2026-10-11,
  rebuilt 2026-10-12): "Three titans total, 1-2 per run: the Herald
  (wave 4, tutorial), one mid wave-5, the Finale (apocalypse). Titans
  are flagged HERE, not by HP — isTitan() reads this file. They never
  spawn in the wild pool; they arrive by omen and are faced by
  coalition only (hard gate, 10+ allies). The Eater is NOT a titan —
  it's a wave-4 boss."
- **The cast** (src/js/titans.js `titanCast`, Steve 2026-10-12): per
  run, the Herald + ONE apocalypse. Apocalypse pick: showmanship
  >= 20 gets the Nielsen (the ratings titan); otherwise the Finale.
  Overtime (Steve 2026-10-14: "waiting should have a cost") can air
  the third titan as a rerun once the Table waits (overtime tier >=
  keyTier AND herald, nielsen and finale slain for the Network key).
  Data: herald wave 4, monster `herald`, HP [700,900], minAllies 10;
  nielsen wave 5, monster `nielsen`, HP [1100,1400], minAllies 12;
  finale wave 5, monster `finale`, HP [1800,2200], minAllies 20,
  three-node march (finale_crew → finale_opening → finale, heart
  needs 10 survivors); the_network wave 6, monster `network_heart`,
  minAllies 20, one node per 3x3 sector (4 masts, 4 limbs, heart),
  20 blades to start, upkeep 1000 kcal/blade/day, no new blades
  once the march begins.
- **Omens** (titans.js `titanDawnTick` / `titanMaybeOmen` /
  `titanAdvanceOmen`): Herald omen rolls daily once wave >= 4 AND
  scale rank regional+ (p=0.10/day); apocalypse omen once wave >= 5
  AND national+ (finale needs only regional+ since eggomen,
  2026-10-28; p=0.08/day); third-titan omen p=0.25/day. Stages:
  0 (something stirs) -> 1 (named, >=4 days after omen day, p=0.35)
  -> 2 (located, >=9 days after omen day, p=0.40) — at stage 2 the
  titan is PLACED on the map (titanPlace: nearest free tile ~3 east
  of the scholar; finale places its campaign nodes instead).
  Knowledge gates titans: no name before stage 1, no lair before
  stage 2 (ONTOLOGY.md: knowledge_gates_titans).
- **Escalation** (titans.js `titanEscalate`): a stage-2 titan whose
  monster still stands strikes every 5 days unanswered
  ((day - o.day) % 5 === 0): 45% pantry raid (2000–4000 kcal from
  the player's stores via playerPackSpend) else a trust strike
  (-5 trust on a random active allied link, booked in the link's
  history as kind 'titan'). Presence, not omen stage, is what
  counts (titanghost 2026-11-02, Layer 1): a field kill removes
  the monster without setting slain, so escalation stops when the
  monster is gone.
- **The muster** (titans.js): `soundTitanCall` — allied fires answer
  aloud or refuse aloud (refusals remembered; answering costs trust
  on later reinforce); `titanCommitOwn` — up to 3 Haven blades march
  (they eat, bleed, can die); `titanMusterUpkeep` — 1000 kcal/day
  per blade (allies + Haven's committed); a hungry muster costs
  -2 trust per allied fire per day (booked in link history as
  'muster-hunger'); `titanStandDown` — the muster breaks, committed
  come home, upkeep stops, each answering fire loses -5 trust, the
  titan stays unanswered. `titanMusterReady`: unique allied blades
  + Haven blades >= def.minAllies. A muster ally can TURN
  (titanTurn): seizes outfitted gear, link trust -> 0.
- **The fight gate** (titans.js `titanWrapCombat`): HARD GATE — no
  solo titans. startCombat on a titan id with no ready muster is a
  REFUSAL (a say line, no fight, outcome 'refused'); the finale
  campaign has its own entry gate (titanEntryGate) instead. A real
  fight injects allied fighters (titanInjectAllies, 12x12 grid,
  coalition arena 24x24 for 10+ blades), resolves at tbEnd
  (titanResolveFight): victory sets slain, removes the world
  monster, 25% relic drop, +10 viewership; defeat breaks the
  muster, the titan remains. Allied deaths cost -10 trust per
  fallen speaker's fire (and -2 cheer per dead Haven blade).
  Outcome log (titanOutcomeLog): one record per encounter —
  'refused' | 'fought' (resolved in place to 'slain' | 'fled') |
  'stood-down', with day + detail; a terminal with no open 'fought'
  record is written standalone (orphan: true).
- **The table-trial bypass**: when the Table summons the champion,
  the finale is fought directly as a single blow-by-blow fight
  (no march, no muster) — flagged via _tableTrialDirect, consumed
  in the wrapper, never leaks into open-world combat.
- **Wave law** (docs/MONSTER-WAVES.md): network nodes
  (network_heart etc.) are "wave 6's heralds — the System's
  infrastructure made [flesh]". Titans never wander
  (monsterWavePool filter in titanWrapCombat).
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Titans / heralds — **Partial**: unknown for base driver
  (late-game; no driver verb found); sim-titangate-a (Nov 1),
  sim-titanroute-a + sim-titanghost-a (Nov 2) with panels; 14 titan
  tests; not in shared panel. This arm supplies the first-numbers
  analogue: titans + heralds as actually played in a lived village
  under competent play, on a plain band.

## What the existing titan tests prove — and what they do NOT

The titan tests (test-titan-*.js, test-herald-*.js, test-titangate-a,
test-titanroute, test-titanexcl-a, test-titanoutcome-20261021,
test-heraldcontact-*, test-heralddepart-a, test-heraldhp*, test-heraldpos-*,
test-heraldmuster-*, test-heraldsplit-*, test-sim-heraldarr*,
test-sim-heraldkill-a, test-sim-heraldplace-a, test-sim-heraldsteer-*)
prove the verbs work when CALLED or FORCED: the gate refuses without
a muster, the call/commit/standdown verbs run, the march places
nodes, the outcome log records. The prior arms measured pieces on
deliberate stacks: titangate-a (16 seeds, vet2mfg stack): 183
titan-gate refusals, 100% say coverage, have 0 / need 10 (herald)
or 12 (nielsen) every time, no partial muster anywhere; titanroute-a
(policy march): 5/8 arrivals → calls, 2 real fights, 1 herald slain;
titanghost-a (ghost presence layer). None of them measures titans +
heralds as PLAYED in a lived village under default competent play:
no omen-stage census, no strike cadence or trust tax in the wild,
no distinct-instance vs startCombat-call accounting on a plain
band, no muster/call/commit/standdown counts under a policy that
never sounds the call, no refusal-line repetition census. This arm
measures exactly that, on a plain competent band.

## Backlog claim

Three open sim-findings.md lines name this arm's questions; none is
claimed — this arm is the census they call for, and its verdict
speaks to each (marked in the evidence, not re-claimed here):

- "HERALD RE-FIGHT SPAM" (2026-11-10, sim-spawncensus-a): one
  herald instance fought 158 times on seed 170202 (261 startCombat
  calls band-wide vs 6 distinct spawned instances). Whether each
  call runs a full TB fight is unmeasured — all player-TB rows carry
  outcome null. Next: a rounds-observed check on herald
  re-encounters. THIS ARM: startCombat calls classified
  refused/fought/dissolved per distinct instance, rounds observed
  at tbEnd per fought encounter.
- "TITAN STRIKES JUMP WHEN THE DRIVE ANSWERS" (2026-11-10,
  sim-answermail-drive-a): titan-event trust losses -20 (4 strikes)
  control vs -125 (25 strikes) armed on identical seeds — most
  plausibly divergent titan spawns (RNG stream diverges after the
  first drive action). A titan census (spawns, stages,
  days-unanswered per leg) would be needed to say more. THIS ARM:
  the spawn/stage/days-unanswered census on a plain band, so a
  later two-leg comparison has a baseline shape.
- "HERALD REFUSAL LINE REPEATS ~15 TIMES IN TWO DAYS" (2026-11-08,
  sim-binddiag-b): the "muster 10 allied blades (you have 0)" stamp
  fires on nearly every move in the 76402 sense ring (days 71-73).
  THIS ARM: refusal-line repeats counted per seed per day, with the
  say-line classification to show whether the stamp is the only
  titan line the village ever hears.

No other sim-findings.md line is claimed by this arm. (Checked
2026-11-11: the three lines above name this census; no line names a
titan first-numbers arm.) Any new titan/herald gap this arm surfaces
is APPENDED as [open] in the evidence file's findings section and in
sim-findings.md, not claimed mid-run.

## Amendment 1 (smoke-driven, BEFORE any judged sim)

One single-seed smoke run (190321, control, RUN=smoke, output to
evidence/2026-11-11/perseed-titanfirst-a/titanfirst-s190321-smoke-
control.json, never judged) confirmed the instrument end to end and
surfaced four refinements, fixed here before any judged data exists
(the titangate-a Amendment 1 pattern). The smoke file will be
DELETED before the judged pilot; the judged pilot re-runs all 8
seeds fresh, including 190321.

- Say-regex leaks: bare 'omen' matched 'moment' in a dozen
  unrelated lines (relief moments, ah-ha moments, plant-study
  'a moment'); bare 'finale' matched 'SEASON FINALE' announcements
  and 'FINALES need a LEGEND' table lines. Fixed: 'omen' →
  \bomen\b, 'finale' → \bthe finale\b. The smoke's 116
  unclassified say lines were ALL such leaks, 0 of them titan
  lines.
- Omen lines carry no keyword: the data-driven omen0 texts ('The
  sky looks wrong...', 'The System's ratings spike...') contain no
  titan/herald/nielsen/finale/omen/muster word, so the smoke's
  omen-created/named dawn events had no say line in range (4 of
  the smoke's 5 unclassified dawn events). Fixed: the regex also
  matches the 🔭/📻 prefixes. That pulls in exactly two other-system
  say lines (the 🔭 scouting line, game.js:7593; the 📻 pellet
  line, game.js:25117), both classified with cited classes
  (scout-map, pellet-radio). The omen1 classifier now matches on
  the 📻 prefix plus a titan title (the data texts), not on the
  code-fallback wording.
- New say classes from the smoke (all cited in the analyzer):
  herald-stirs / herald-here / herald-treeline (the placed titan
  follows and paces the scholar), herald-pack / raid-herald /
  raid-herald-unmet (the placed titan JOINS pantry raids as a
  raider — the smoke's herald rode 3 raids and took 175 HP per
  raid night off the raid defense), muster-scout (the SHELTER
  muster, a different muster from the titan coalition).
- Strike-trust clamp: a link at trust 3 loses 3, not 5 (trust
  clamps at 0). The dawn classifier now accepts strike-trust
  deltas in [-5,-1] and muster-hunger deltas in [-2,-1] when a
  titan link-history entry is present.
- fieldFight instance captured pre-call (was post-call): the smoke
  read the herald at 14 hp for a fight that began at 104, which
  made the wound arithmetic unreadable.
- Smoke finding (not a fix): 9 of the smoke's 10 pantry-raid lines
  read '0 kcal gone from your stores' — the scholar's pack held no
  finished food, so the raid took nothing. A 0-kcal raid leaves no
  dawn-diff; strikes are therefore counted from say lines for
  occurrence and from dawn diffs for effect (analyzer records
  both, cross-checked).

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the titan verbs exist and are wired — titanDawnTick
   is called guarded from game.js dawn (game.js:33829); the omen
   gates read unlockedWave + scaleRank live; titanPlace calls
   spawnWorldMonster; titanWrapCombat wraps startCombat/tbEnd at
   load. The pilot will confirm live counts in the corpus, not
   assume them. The policy side is the known gap: competent.js
   carries NO titan verb (grep: zero 'titan' matches) — competent
   never sounds the call, never commits blades, never marches on a
   lair deliberately. Under competent, the ONLY titan contact path
   is the scholar stepping onto a placed titan's tile (startCombat
   via tile entry / waiting-monster / bump paths, game.js) and
   villagers meeting a placed titan in the wild (fieldFight). That
   asymmetry (a system the policy never drives, only stumbles into)
   IS one of the first numbers. `soundTitanCall`, `titanCommitOwn`,
   `titanStandDown`, `titanWarCouncil`, `titanCallReadiness` are
   expected zero-or-near-zero under competent — proven live in the
   fixture by direct calls and marked dead-under-competent if the
   pilot never fires them.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every titan omen, every
   placed titan instance, every startCombat call on a titan id,
   every fieldFight on a titan, every dawn strike, every muster
   action, every titan say line on the band. The engagement floor
   (GO table) is set from the pool's nature: the herald omen
   precondition (wave >= 4 AND regional+) must appear on >= 1
   pilot seed, else the census is uninterpretable, not a GO.
3. **Verb existence**: titanDawnTick, titanMaybeOmen,
   titanAdvanceOmen, titanPlace, titanEscalate, titanMusterUpkeep,
   titanTurnTick, soundTitanCall, titanWarCouncil, titanCommitOwn,
   titanStandDown, titanMusterReady, titanCallReadiness,
   titanSelfActions, titanSelfDo, titanCast, titanDef, isTitan,
   spawnWorldMonster, removeWorldMonster, startCombat, tbEnd,
   fieldFight, titanOutcomeLog (via Game._titanTest), titanState
   (via Game._titanTest) all exist in the engine (citations above).
   **titanEscalate is closure-internal** — it is NOT a Game method
   and cannot be wrapped (the secondlink-a / diplo-a lesson: a wrap
   records nothing if the engine calls the closure). Strikes are
   therefore detected by dawn-diff (link-trust map + scholar pack
   kcal + village pantry kcal + link-history titan entries,
   before/after each titanDawnTick) joined to the strike say lines
   — never by wrapping the closure. The proof forces a strike in a
   fixture and verifies the dawn-diff + say capture sees it.
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 122.5–140d); titans are late-game (wave 4
   + regional is itself the reach question), so 150d is the floor
   that can see them at all without ticking dead villages. Same
   horizon as the siblings for comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of titans +
heralds in a lived village** — every titan omen classified by
titan + stage + day; every placed titan instance identified
(id + tile + spawn day + hp); every startCombat call on a titan id
classified refused / fought / dissolved, per distinct instance,
with rounds observed per fought encounter; every fieldFight on a
titan classified by outcome + rounds; every dawn strike classified
by kind (pantry raid kcal / trust strike) with its trust delta;
every muster action counted; every titan say line classified;
every metric in the list below counted or explicitly marked
unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every startCombat call on a titan id classified, none 'unclassified' | 0 unclassified titan startCombat events across the pilot (refused / fought / dissolved-self; a refused call carries its gate say line) |
| Every tbEnd of a titan fight classified, none 'unclassified' | 0 unclassified titan tbEnd events (rounds observed, result, titan id) |
| Every fieldFight on a titan classified, none 'unclassified' | 0 unclassified titan fieldFight events (outcome in evade/vKill/mFlee/vFlee/vDie, rounds) |
| Every titan dawn-diff explained, none 'unclassified' | 0 unclassified titan dawn events (strike-pantry / strike-trust / muster-hunger / turn / none / other-cause — a trust, pack, or pantry move with no titan say line AND no titan link-history entry is 'other-cause', never silently titan) |
| Every titan say line classified, none 'unclassified' | 0 unclassified titan say lines across the pilot (classes in the analyzer; known other-system matches — finale-campaign muster line, godverbs 'not titans' — carry their own cited classes) |
| Every outcome-log record classified, none 'unclassified' | 0 unclassified outcome records (refused / fought→slain|fled / stood-down / orphan terminal) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | >= 1 seed reaches wave >= 4 AND regional+ rank (the herald omen precondition), else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Titan cast + omens: cast pick per seed (nielsen vs finale);
   omen stage transitions per titan per seed (stage, day); days
   spent at each stage; seeds where an omen never starts (and why:
   wave / rank gate never met).
2. Titan placement: distinct placed instances (id, tile, day
   placed, hp at placement, spawn source: titanPlace / finale
   campaign / network campaign); presence days per instance;
   instances removed without a fight (removal day + cause where
   the engine records it).
3. Escalation / strikes: strike events per titan (kind: pack raid
   kcal taken from the scholar's stores / trust strike village +
   amount), strike cadence vs the every-5-days rule,
   days-unanswered per stage-2 titan (placed day → slain / removed /
   run end), strikes per unanswered-day.
4. Muster / call / commit / standdown: soundTitanCall calls
   (answers + refusals per fire, trust cost where charged);
   titanCommitOwn calls (Haven blades committed); standdown
   events (fires released, trust charged); war council calls;
   muster size over time (allied + Haven blades); muster-hunger
   days + kcal shortfall; turns (titanTurn) if any.
5. Scholar encounters (the re-fight spam question): startCombat
   calls on titan ids, per distinct instance (instance key: id +
   tile + spawn day): calls, refused vs fought vs dissolved;
   calls per instance per day (the spam shape); rounds observed
   at tbEnd per fought encounter (tbEnd round + result); the
   gate say line captured per refused call (have/need numbers);
   streaks: refusals → fought / removed / lingering / run-ended
   (titangate-a's streak table, on a plain band).
6. Villager field fights vs titans: fieldFight calls with a titan
   mdef (vid, outcome, rounds, vTaken/mDealt, monster hp left);
   which villagers meet a titan, and whether any kill one.
7. Titan outcomes: outcome-log records per titan (refused /
   fought / stood-down / slain / fled / orphan); titans slain
   per seed; relic grants; viewership deltas where recorded;
   finale/network campaign progress if reached.
8. Say-line coherence: every titan/herald/omen/muster say line
   classified (omen0 / omen1 / located / strike-pantry /
   strike-trust / muster-hunger / refusal-gate / call-answer /
   call-refusal / council / commit / standdown / victory /
   defeat / turn / relic / repair / campaign-muster /
   other-system, with source); refusal-line repeats per seed per
   day (the ~15x/2days backlog item); any line whose number
   contradicts the live state it describes (have/need vs live
   muster; trust -5 vs live link trust); omen lines vs live omen
   stage.
9. Trust ledger: total trust delta attributable to the titan
   system per seed, by mechanism (strike -5, muster-hunger -2,
   standdown -5, turn → 0, fight-death -10, call-answer costs);
   net titan trust tax vs the village's other trust movement.
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: titans are late-game (the herald omen needs wave 4 +
  regional); sibling first-numbers pilots ran 150d with median
  survival 122.5–140d, so 150d captures the full village life
  without ticking dead villages. Same horizon as the siblings for
  comparability.
- **Seeds: 190321–190328 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/**/*.md` (full tree, word-boundary
    grep, one seed at a time): zero hits for all eight seeds
    (background grep, ~24s, completed before this prereg was
    committed).
  - Searched `evidence/2026-11-11/sim-*-prereg.md` and
    `evidence/2026-11-10/sim-*-prereg.md` for all eight seeds:
    zero hits.
  - No perseed directory names any seed 190321–190328 (listing
    of evidence/2026-11-11/ and evidence/2026-11-10/ checked).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    191702, 199585 — none overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - NOT completed: the full-tree grep over evidence `.json`
    (multi-MB per-seed JSONs) — same limitation recorded by
    abilityfirst-a; a stray `"totalDraws": 19032x`-style numeric
    coincidence inside a per-seed JSON cannot be excluded. The
    band is fresh as a SEED naming, which is what the skill guards.
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

scripts/titanfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- startCombat: every call — mid, isTitan, placed-instance identity
  (world monster with that id at call time: tile, hp, maxHp),
  say lines spoken during the call (seq range), returned null vs
  fight (fight id), tbfight round at entry.
- tbEnd: every call — result, fight id, round observed, titan-ness
  (state.titans._fight or a titan monster in the fight), allies
  dead/alive at close.
- fieldFight: every call with a titan mdef — vid, monster id,
  instance tile/hp, outcome, rounds, vTaken, mDealt, mHpLeft.
  Non-titan calls counted only (a counter, not events).
- spawnWorldMonster: every call with a titan id — id, tile, hp,
  opts (titan flag, campaign node), spawn day. This is the
  distinct-instance source: one spawn = one instance.
- removeWorldMonster: every call with a titan id — id, tile, hp
  left, day.
- titanDawnTick: every call — before/after diff of titan state
  (cast, omens {stage, day}, musters {allies, haven blades,
  lastUpkeep}, slain, outcome-log length), link-trust map
  (villageId → trust + titan-kind history entries added), SCHOLAR
  PACK kcal (the raid/upkeep target — playerPackSpend draws from
  the scholar's finished-food inventory, never the village pantry)
  and village pantry kcal. One dawnEvent per dawn with any diff,
  classified by the analyzer (strike-pantry / strike-trust /
  muster-hunger / turn / none / other-cause).
- titanSelfDo / soundTitanCall / titanWarCouncil / titanCommitOwn /
  titanStandDown / titanCallReadiness: every call — args, return,
  muster size before/after. (Expected zero under competent;
  proven live in the fixture.)
- Game.say: titan-regex lines only (uncapped, with day + seq) —
  the per-call attribution source and the refusal-repeat census.
  The driver ALSO captures a capped sense corpus (same regex).
- Daily snapshot: titan state (cast, omens, musters, slain,
  outcome log copy), placed titan monsters (id, tx, ty, hp,
  maxHp), link trust map, pantry kcal, roster size, standing,
  scaleRank, nationalLive, wave.
Driver: scripts/titanfirst-driver-20261111.js (mirrors
abilityfirst-driver; Game.say wrap with a titan/herald/omen/
muster regex for the sense corpus, 300 lines/seed cap).
Analyzer: scripts/titanfirst-analyze-20261111.js (classifiers for
startCombat / tbEnd / fieldFight / dawn-diff / say-line /
outcome-log events; distinct-instance accounting by id + tile +
spawn day; streak table; trust-ledger rollup; neutrality + GO
table). Proof: scripts/test-titanfirst-a.js (each wrap proven live
on a fixture or miniature; RED checks on the pre-fix instrument
where a wrap is dead by construction — notably: no direct
titanEscalate wrap exists, by construction, since it is
closure-internal; strikes are proven via the forced-strike
fixture through dawn-diff + say capture).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-trustfirst-a,
sim-abilityfirst-a, sim-fishstaff-b, cookfirst-a, preserve-a,
fishfirst-a, travelfirst-a, tradefirst-a). The control/neutral legs
are the neutrality proof, not a panel. Panel context: **no panel
metric for titans/heralds** (coverage audit §4) — this arm supplies
its first-numbers analogue (Metrics 1–9); the titangate-a /
titanghost-a panels are the closest existing instrument, on
deliberate stacks, not a plain band.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (trustfirst-a: median survival 133d, 2/8 survived,
651 deaths over 1,150 village-days; abilityfirst-a: same band
shape, to be read from its evidence). If the instrument changes
any numeric field vs the recorder-free baseline, the arm is NO-GO
on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
