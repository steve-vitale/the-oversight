# Godpath / godhood — first numbers: pre-registration (arm sim-godpathfirst-a)

Run fleshout-20261111T1115Z, Loop A. Coverage Program Tier 3 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit 0be63dbce. No judged sim has run on this base yet;
the pilot runs on 0be63dbce (or the rebased HEAD — recorded in the
evidence; see the rebase note in the task).

## Canon

- docs/CANON.md read first. **There is NO dedicated godpath/godhood
  canon doc in the CANON.md manifest** (manifest lists SYSTEMS.md for
  abilities/slots/deepening, TABLE.md for the Table — neither is a
  godpath doc). The operative canon is docs/godpath/STEVE-ANSWERS.md
  (outranks everything — repo AGENTS.md: "Start every session by
  reading docs/godpath/STEVE-ANSWERS.md"), docs/COHERENCE-SPINE.md
  (the Job → Playstyle → Class → God → Table ladder), and
  docs/godpath/PLAN.md (built state + deed ports), plus the code
  headers that carry Steve's words verbatim (src/js/godpath.js,
  src/js/godhood.js). Nothing is invented here; the code citations
  below are the source of truth. (Canon gap, recorded in the
  evidence: godpath/godhood needs a canon doc the way diseases have
  docs/DISEASES.md. docs/ENDGAME-BUILDS.md holds the founding quote
  — "Paint a path towards functional godhood. If they learn and
  experiment enough, people can get there and it's scary good. Most
  game wins look like that, but not all." — and TABLE.md:62 holds the
  Table rule: "the table prices the run, never gates on godhood;
  reachable by competent non-god play".)
- **The ladder** (COHERENCE-SPINE.md): Job → 5 tracks (combat, field,
  social, craft, strange) → Class (the build your abilities add up
  to; recognised when the kit clearly leans one way; the System names
  it) → God (the path's capstone) → Table (path × god/class ×
  light/dark; THE HOSTS with the key). One source of truth: every
  magic ability carries `track`, `path` (which god it serves) and
  `subclass`. Human skills ≠ alien abilities; abilities are magic
  only, into 6 slots, ~8 natural level-ups per run, each a pick 1 of
  3 from the track's kit, plus a few gifts. Villagers climb the same
  ladder with the same tracks, kits, XP scale and 1-of-3 sheets
  (parity 2026-10-14).
- **The 10 paths** (src/data/godpaths.json, 10 paths × 2 subclasses,
  one god per path): brawler / The One-Person Army (Turn the Pain),
  caregiver / The Shepherd of the Dead (Raise Echo), drifter / The
  Between (Phase Out), explorer / The All-Seeing (No Lies), forager /
  The Living Garden (Feed the Multitude), hunter / The Apex Predator
  (Choose the Terms), miser / The Market God (Name Your Price),
  shieldbearer / The Undying Ward (Take the Wound), socialite / The
  Voice of the Relay (Speak and Be Heard), survivalist / The
  Unkillable (Phoenix). The Farstrider is retired (folded into
  explorer/cartographer) — resolvable by id, never newly reachable.
- **Ascension** (godhood.js header, godpaths.json rules.capstone):
  a player or villager ascends when their recognised CLASS is on the
  path, they hold the subclass payoff and 4+ magic abilities of the
  path, and they have done the god's deed: day 80+ and a discovered
  synergy that uses an ability of the path (or the class held
  deedClassDays=10 days, or the god's authored deed event). Gates are
  data levers: abilitiesNeeded 4, minDay 80, closeAt 3,
  requirePayoff true, requireDeed true, deedClassDays 10. The game
  then plays a 5-beat ceremony, grants ONE qualitative godly verb
  (the capstone item is the System's gift, not a gate), and
  permanently transforms their visual. Each capstone keeps its
  weakness. Knowledge-gated: the capstone is felt only once the
  class is named and 3+ path abilities are held. Death/respawn
  resets it.
- **Authored deeds** (godpaths.json, godpath.js godpathDeedStatus —
  a pure read): 8 of 10 gods have one — caregiver care_survived
  (restore someone beyond critical health, then a later dawn),
  drifter outmatched_escape, explorer field_truth_shared (discover a
  plant by fieldwork, then teach it), hunter apex_hunt, miser
  market_exchange, shieldbearer ward_rescue, socialite relay_office
  (hold the Relay office yourself), survivalist death_refused.
  **Brawler and forager have NO authored deed (deed: null)** — the
  PLAN.md "Two gods remain: Brawler/Forager replacements" — so their
  synergy leg rests on the discovered-synergy / class-days route
  only. The instrument records deed status per god, including the
  two null-deed gods (status null, never complete-by-deed).
- **The wiring** (godpath.js, game.js): recognition rides the
  acquisition wires — `Game.checkPlayerGodhoodAscension` /
  `Game.checkVillagerGodhoodAscension` call `recognizeClass` first,
  then `S.Godhood.checkGodhood` / `checkVillagerGodhood`; a dawn
  check (godpath.js endDay wrap) re-runs both for the player and
  every roster villager with 3+ npcAbilities once
  `systemArrived`. `maybeGrantCapstoneItem` grants the named
  capstone item when the build is complete except the item (fires
  once per godhood, tracked on scholar.godhood / npcGodhood).
  Level-up sheets come from `kitSheet` (player: tracks.js
  levelUpOffers; villager: villager-build.js
  villagerLevelUpOffers) — offers lean to the recognised path, or
  before that to the holder's job path (shapeOffers). Competent
  picks the FIRST offer on the sheet (competent.js:3406–3408:
  `Game.chooseAbility(ch[0].id)`), so sheet order IS the competent
  build. Villagers learn all three offers (`npcLearnAbility(...,
  'system-sheet')` — knowledge), defer up to 3 days if they know too
  little (`_knowsTooLittle`, seekFor), then pick via `buildDecide`
  (villager-build.js:362; tele `villager_level_up`).
  Subclass verbs run through `useAbility` (player) and
  `villagerCast` (villager, via the tbVillagerAbility wrap) and the
  field hooks (fieldBegin/fieldAct/...); every verb tele's
  `godpath_verb`. Deed events tele `godpath_deed`; recognitions tele
  `class_recognized`.
- **Historical measurement** (godpaths.json rules.capstone `_levers`,
  evidence/2026-10-14/godpath-unified.md + godpath-buff.md): 16 seeds
  × 150d, capable bot, all gates on = **0 player / 0 villager
  ascensions**; requireDeed false = 1/1; both false = 3/8 (base
  before the redesign: 6/12). godpath-buff, 64 seeds (original kit
  order): deedClassDays 10 + offers.payoffAnyTrack +
  abilitiesNeeded 4 = **21 player / 24 villager ascensions**. Payoff
  and deed gates stay on. All of that is on the CAPABLE bot. This
  arm is the first measurement on plain COMPETENT play — the
  substrate the scale-wall runs use.
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Godpath / godhood — **Unmeasured** (Nov): "Unknown —
  `godverbs.js`/`godpath.js` exist; no driver verb confirmed. Zero
  Nov sim/journey files named godpath/godhood; 7 unit tests only;
  `sim-trialgod` is Oct". This arm supplies the first numbers.

## What the existing godpath tests prove — and what they do NOT

The godpath test suites (scripts/godpath/test-*.js, validate.js,
ladder.js, test-godpath-unified-20261014.js) prove the verbs work
when CALLED, the data contract holds, the ladder contract holds,
and the deed ports work when STAGED (relay/market/explorer/
caregiver/drifter/ward/hunter/survivalist audits, each with
fixture-level proof). None of them measures whether any of it ever
HAPPENS in a lived village under default competent play: no
level-up sheets leaned or taken, no class recognised, no deed
observed or completed, no ascension, no capstone gift, no god verb
cast in a real fight. This arm measures exactly that, on a plain
competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: no open line names godpathfirst / godpath / godhood
first numbers; the closest lines are the scale-wall lines, not
this census.) Any godpath gap this arm surfaces is APPENDED as
[open] in the evidence file's findings section and in
sim-findings.md, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the road's gates exist and are wired —
   `systemArrived` gates level-ups (tracks.js pumpLevelUps); the
   dawn check re-runs ascension for every roster villager with 3+
   abilities; competent answers level-up sheets (picks ch[0]) and
   casts held abilities in combat (competent.js:2380–2413,
   useAbility). Sibling first-numbers pilots reach day 90+ (median
   survival 122.5–147d), so the day-80 ascension floor is inside
   the band. Whether any class is ever recognised, any deed ever
   observed, or any ascension ever fires under competent is UNKNOWN
   — the pilot measures it; the engagement floor (GO table) is set
   so a band with zero godpath-opportunity is uninterpretable, not
   GO.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every level-up sheet,
   every class recognition, every deed observation/completion, every
   ascension attempt, every capstone gift, every god-verb cast on
   the band. The engagement floor (GO table) is set from the pool's
   nature: if the band produces zero godpath-opportunity events at
   all, the census is uninterpretable, not a GO.
3. **Verb existence**: recognizeClass, godpathClass, classLine,
   kitSheet, shapeOffers, pathLean, godpathDeedStatus,
   godpathDeedHint, holderMagicIds, classify, checkGodhood,
   checkVillagerGodhood, godhoodCloseness,
   villagerGodhoodCloseness, recognitionCeremony,
   villagerRecognitionCeremony, maybeGrantCapstoneItem,
   checkPlayerGodhoodAscension, checkVillagerGodhoodAscension,
   useAbility, villagerCast, chooseAbility, buildDecide,
   npcLearnAbility, tele all exist in the engine (citations above).
   WRAP RISK (secondlink-a / diplo-a lesson, relayfirst-a
   re-confirmed): a wrap records nothing if the engine calls the
   closure instead of the Game/namespace method. The call paths
   here: `S.Godhood.checkGodhood` IS called through the namespace
   (game.js:47478); `Game.checkPlayerGodhoodAscension` /
   `Game.checkVillagerGodhoodAscension` ARE called through Game
   (game.js:25654, 7882, 47371, 47398; tracks.js:232);
   `Game.useAbility` IS called through Game (competent.js:2413);
   `Game.kitSheet` IS called through Game (tracks.js:421,
   villager-build.js:325); `Game.recognizeClass` is called through
   Game only from ledger.js:1132 — the dawn/acquisition path calls
   the godpath.js closure directly, so the recognizeClass wrap
   catches only the ledger path and the tele `class_recognized`
   event is the reliable recognition recorder; `S.Godpath.
   villagerCast` is called through the namespace by NOBODY in the
   engine (godpath.js's tbVillagerAbility wrap calls the closure),
   so the villagerCast wrap catches only external callers and the
   tele `godpath_verb` event is the reliable villager-cast
   recorder; `S.Godhood` capstone verbs (raiseEcho etc.) are
   namespace functions whose live callers are checked in the
   fixture — a wrap with no live call observed is marked dead in
   the evidence and its zero is never treated as evidence. The
   proof (scripts/test-godpathfirst-a.js) verifies EACH wrapped
   method's call path is live on a fixture or live miniature.
4. **Horizon fit**: 150d. The road is mid-to-late-game by
   construction: minDay 80 ascension floor, deedClassDays 10, ~8
   level-ups per run spread across the run, class formation needs
   3+ path abilities. 150d measures class formation + deed
   progress + ascension, NOT post-ascension play (a god ascended
   on day 140 has ~10 days to use the verb — stated here so a 0
   capstone-verb-use count after a late ascension is read as
   horizon-limited, not as a broken verb). Same horizon as the
   siblings for comparability. Death-aware stop (dead villages
   stop, +10d tail max).

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of the godpath /
godhood ladder in a lived village** — every level-up sheet
classified by holder + track + offers + lean; every class
recognition classified by holder + path + subclass; every deed
observation/completion classified by god + holder; every ascension
attempt classified by holder + god + outcome; every capstone gift
classified by holder + god + item; every god-verb cast classified
by ability + verb + holder; every metric in the list below counted
or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every level-up sheet classified, none 'unclassified' | 0 unclassified sheets across the pilot (holder + track + level known, offers recorded with paths, lean flags recorded) |
| Every class recognition classified, none 'unclassified' | 0 unclassified recognitions (tele class_recognized + snapshot godpath diff reconcile; every recognition has holder + path + subclass + day) |
| Every ascension attempt classified, none 'unclassified' | 0 unclassified ascension events (checkGodhood / checkVillagerGodhood returns + ceremony + capstone-gift records reconcile against snapshot godhood diffs; residue 0) |
| Every god-verb cast classified, none 'unclassified' | 0 unclassified verb uses (tele godpath_verb + useAbility wrap reconcile; every use has ability + verb + holder + day) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥1 godpath-opportunity event band-wide (level-up sheet offered OR class recognised OR deed observed OR god verb cast OR ascension attempted), else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Level-up sheets: kitSheet calls by holder (player/villager id)
   + track + level; offers (ids, paths, subclasses) + lean flags
   (_leaned/_jobLeaned); offers on the recognised path share;
   offers on the holder's job path share before recognition; picks
   (chooseAbility for the player — id, path, was it the first
   offer?; buildDecide for villagers — id, path, keep?); sheets
   deferred by villagers (seekFor days); empty shelves
   (track_level_empty).
2. Class recognition: recognitions by holder + path + subclass +
   day (tele + snapshot diff); class changes / lapses; holders
   never recognised (with their max path count); first recognition
   day per seed; class lines as voiced vs as recorded.
3. Path progress: per-holder magic ids by path (snapshot diff);
   max path count per holder; payoff held per subclass; synergies
   discovered per holder (activeSynergies); holders at closeAt (3+
   path abilities) per god; the ladder per god: kit 0–4, payoff,
   deed, day — from godhoodCloseness / villagerGodhoodCloseness in
   the snapshot (pure reads).
4. Deeds: godpathDeedStatus per god for the player + every
   ascension-candidate villager (≥3 npcAbilities); the raw deed
   book (village.godpathDeeds) for every villager; deed
   observations/completions by god + holder + day (tele
   godpath_deed + snapshot book diff); the two null-deed gods
   (brawler, forager) tracked separately — never complete-by-deed.
5. Ascension: checkGodhood / checkVillagerGodhood calls + returns
   (newly completed ids); checkPlayerGodhoodAscension /
   checkVillagerGodhoodAscension attempts (dawn vs acquisition);
   ceremonies played (recognitionCeremony /
   villagerRecognitionCeremony — 5-beat, witnesses); ascended
   holders by god + day; ascensions that never fire despite a
   complete ladder (which gate held: kit/payoff/deed/day).
6. Capstone gifts: maybeGrantCapstoneItem calls + grants (god +
   item + holder + day); capstoneGifted store per holder;
   capstone items in inventory / on persons at run end; gifts
   without a following ceremony (and vice versa).
7. God verbs: useAbility calls for path-tagged abilities (player
   — id, path, verb, return); villager casts (tele godpath_verb
   with who); field casts (field: true); capstone verb calls
   (raiseEcho / chooseTerms / feedMultitude / turnPain /
   noLiesCheck / namePrice / buyOff / walkHorizon / phaseOut /
   takeWound — namespace wraps, fixture-proven); lifeline/ember
   events (godpath_lifeline / godpath_ember); verbs refused (return
   false + why, where the return carries it).
8. Godhood in the fiction: the capstone as felt (hintBeat lines —
   once per godhood, knowledge-gated); mythic form (playerMythicId
   / villagerMythicId in snapshot); godhoodBargaining (table
   leverage — snapshot read where present); the retired Farstrider
   never newly recognised (0 recognitions with god farstrider).
9. Say-line coherence: every godpath say line in the corpus
   classified (recognition line vs recognised class, ceremony line
   vs ascended god, deed-hint line vs deed status, capstone-gift
   line vs gifted item, level-up sheet line vs offers); any line
   whose claim contradicts the live state it describes; the class
   line as voiced vs as recorded.
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: the road is mid-to-late-game (minDay 80 ascension
  floor, deedClassDays 10, ~8 level-ups spread across the run);
  sibling first-numbers pilots ran 150d with median survival
  122.5–147d, so 150d captures the full village life without
  ticking dead villages; the capable-bot godpath measurement used
  the same 150d horizon. The horizon measures class formation +
  deed progress + ascension, not post-ascension play (§14b.4).
- **Seeds: 190361–190368 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 19036*:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all
    eight seeds.
  - Searched ALL dated evidence `.json` (ripgrep word-boundary):
    NOT completed — the full-tree grep over the evidence corpus
    (which holds multi-MB per-seed JSONs) ran past the practical
    window on the first seed with no hit returned before it was
    stopped; the .md scan + perseed-directory scan + used-band list
    below cover the naming surface. Recorded honestly: a stray
    `"totalDraws": 19036x`-style numeric coincidence inside a
    per-seed JSON cannot be excluded by this search — the band
    is fresh as a SEED naming, which is what the skill guards.
    (Same honest caveat as sim-abilityfirst-a and
    sim-relayfirst-a, same scope.)
  - No perseed directory names any seed 190361–190368 (listing
    of evidence/2026-11-11 checked: perseed-abilityfirst-a,
    perseed-relayfirst-a, perseed-titanfirst-a, and the other
    2026-11-11 perseed dirs only).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    190331–190338 (relayfirst-a), 191702, 199585 — none overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
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

scripts/godpathfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- kitSheet: every call — holder, track, level, offers (id + path +
  subclass), _leaned/_jobLeaned, day. (The sheet the engine
  draws; the instrument never calls it.)
- chooseAbility: every call — id, path, return, day. (Player
  picks; competent picks ch[0].)
- buildDecide: every call — vid, offers (ids + paths), decision
  (id / keep), day. (Villager picks.)
- recognizeClass: every call — who, return (path/subclass/since or
  null), day. (Ledger path only; dawn/acquisition path calls the
  closure — tele class_recognized is the reliable recorder.)
- S.Godhood.checkGodhood: every call — scholar day, returns
  (newly completed ids), day. (Namespace wrap: game.js calls
  S.Godhood.checkGodhood through the namespace.)
- S.Godhood.checkVillagerGodhood: every call — vid, returns, day.
- checkPlayerGodhoodAscension / checkVillagerGodhoodAscension
  (Game): every call — attempts (dawn vs acquisition is read off
  the stack), day.
- maybeGrantCapstoneItem (Game): every call — vid/isPlayer,
  capstoneGifted diff (god → item), day.
- S.Godhood.recognitionCeremony / villagerRecognitionCeremony:
  every call — god id, witnesses count, day.
- S.Godhood capstone verbs (raiseEcho, chooseTerms, feedMultitude,
  turnPain, noLiesCheck, namePrice, buyOff, walkHorizon, phaseOut,
  takeWound): every call — args, return, day. (Namespace wraps;
  fixture-proven; expected dead under competent.)
- useAbility (Game): every call — ability id, path (from the data
  def), return, day. (Recorded only for path-tagged magic
  abilities; the rest are out of scope.)
- S.Godpath.villagerCast: every call — vid, return, day.
  (Namespace wrap; engine calls the closure — tele godpath_verb
  is the reliable recorder.)
- npcLearnAbility (Game): every call — vid, id, path, source, day.
  (Villagers learn all three offers; the pick is buildDecide.)
- tele cross-check: 'class_recognized', 'godpath_deed',
  'godpath_verb', 'godpath_bribe', 'godpath_feed_camp',
  'godpath_lifeline', 'godpath_ember', 'villager_level_up',
  'track_level_empty' events only.
- Daily snapshot: pantry kcal, roster, standing, scaleRank,
  nationalLive, wave, bearer; scholar — abilities (ids), tracks
  (level + xp per track), levelUpQueue length, abilityChoices
  pending (ids), trackStats, godpath class (godpathClass pure
  read), godhood store (clone), activeSynergies, capstone items
  in inventory, mythic id (playerMythicId pure read), deed
  status per god (godpathDeedStatus pure read), closeness per god
  (godhoodCloseness pure read); per villager — npcAbilities (ids),
  godpath class, npcGodhood store (clone), npcSynergies, capstone
  items on the person, mythic id, deed status per god (only for
  villagers with ≥3 npcAbilities), closeness per god (same
  subset); village — godpathDeeds book (raw clone), switchboard
  holder (for the socialite relay_office deed), systemArrived;
  table — tableAnnounced/tableWaiting/tableDone (progState raw),
  seat/path (progState().table raw clone).
Driver: scripts/godpathfirst-driver-20261111.js (mirrors
relayfirst-driver; Game.say wrap with a godpath regex for the
sense corpus, 200 lines/seed cap — same early-game-only caveat
as the siblings). Analyzer:
scripts/godpathfirst-analyze-20261111.js (classifiers for sheets,
recognitions, deeds, ascensions, verb uses; snapshot-diff
reconciliation for recognitions / ascensions / gifts / picks).
Proof: scripts/test-godpathfirst-a.js (each wrap proven live on a
fixture or miniature; RED checks on the pre-fix instrument where
a wrap is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-abilityfirst-a,
sim-relayfirst-a, sim-trustfirst-a, sim-fishstaff-b, cookfirst-a,
preserve-a, fishfirst-a, travelfirst-a, tradefirst-a). The
control/neutral legs are the neutrality proof, not a panel. Panel
context: **no panel metric for godpath, class, deeds, ascension,
or capstone verbs** (coverage audit §4) — this arm supplies its
first-numbers analogue (Metrics 1–9); the panel's `table` /
`national` / `entered` fields are the only existing adjacent panel
fields. (Godhood IS adjacent to the table: TABLE.md:62 — the table
prices the run and never gates on godhood — so a godpath arm that
found ascensions changing table reach would be a panel question
for a later arm, not this one.)

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (relayfirst-a: median survival 147d, 2/8 survived,
698 deaths over 965 village-days; trustfirst-a: median survival
133d, 2/8 survived, 651 deaths over 1,150 village-days). If the
instrument changes any numeric field vs the recorder-free
baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
