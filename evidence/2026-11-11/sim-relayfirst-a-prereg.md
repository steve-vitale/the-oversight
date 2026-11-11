# Relay / Network campaign — first numbers: pre-registration (arm sim-relayfirst-a)

Run fleshout-20261111T1115Z, Loop A. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit b09cf584e. No judged sim has run on this base yet;
the pilot runs on b09cf584e, recorded in the evidence.

## Canon

- docs/CANON.md read first. **There is NO dedicated relay/Network
  canon doc in the CANON.md manifest.** The operative canon is
  docs/TABLE.md §7 (THE RELAY — enter the matrix) and §"Overtime,
  the Network, and THE HOSTS" (2026-10-14), plus the code headers
  that carry Steve's words verbatim. Nothing is invented here; the
  code citations below are the source of truth. (Canon gap,
  recorded in the evidence: relay/Network needs a canon doc the
  way diseases have docs/DISEASES.md. docs/TERMINAL-CAMPAIGNS.md
  covers the terminal-campaign DRIVER (the living-bearer cutoff,
  the ten-iteration cap), not the relay road or the Network march
  — it says nothing about either. docs/SCALE.md covers the
  Binding's scale meaning.)
- **The Relay path** (TABLE.md §7, src/js/table-relay.js,
  relay-ext.js, relay-dialogue.js, comms.js): the flagship path —
  "enter the matrix". Distinct from the other six: the System is
  the RELATIONSHIP, not terrain. Earned by integration stage ≥ 3,
  OR stage 2 + a relay office held (stage-3 door most reachable by
  design: integration is earned through play, not territory — the
  door still needs a lesser seat). Four cockpit beats; each offers
  the relay verbs (probe/reroute/deepen/commune); failure is three
  backfires or grounding hitting hollow mid-merge (quarantine).
  Branch resolution is the LEANING GRADIENT (Steve 2026-10-11):
  the relay path resolves on the leaning meter (`relayLean()`,
  −100 total .. +100 tender), NOT the ledger — relay verbs and
  scenes move it ±2–4 a use; tender/light = humanize the System,
  total/dark = System-ize yourself, grey = pragmatist both-hands.
  Relay abilities (communication-field domain — NOT the 6 System
  slots; stored on `scholar.relayAbils`): shared core
  deep-listen / faithful-carry / relay-sight; light translate /
  sanctuary / advocate; dark rewrite / skim / omnipresence.
  `scholar.grounding` 0–100, starts 100; dark relay use erodes
  it; the dark relay literally becomes what forgot food.
- **The switchboard office** (comms.js:884–935+): arrives with
  the regional game — `switchboardAvailable()` is true only while
  `state.networkLive` AND no switchboard exists ("The relay is a
  regional thing — Haven isn't networked yet. (Link a village
  first.)"). `appointSwitchboard(vid)` names a villager Holder of
  the Relay at a real price (Haven loses their hands — no forage,
  no runner duty, no moot vote; best talker costs trial swing −8;
  weakest forager costs resentment). The Bearer may instead
  `claimRelay()` (relay-ext.js:100) — TAKES the relay, same price
  plus grounding erosion while held (`relayTick`).
- **Relay verbs** (relay-ext.js): probe (push a button —
  discovery or backfire), reroute ('honest'/'efficient'),
  deepen (integration step), commune (the scene system in
  relay-dialogue.js — recurring System conversations with real
  choices; first five communes run the curiosity ladder, then
  check-ins/light/dark chains; answers move the leaning needle).
  `relayUnlockCheck()` (relay-ext.js:267) GRANTS abilities on
  thresholds — holderDays ≥ 3 → deep-listen; routed ≥ 10 →
  faithful-carry; sysBond ≥ 2 → relay-sight; communes ≥ 2 + light
  open → translate; sysBond ≥ 3 + light → sanctuary + advocate;
  delayed ≥ 3 / routed ≥ 15 / grounding < 50 → rewrite / skim /
  omnipresence (bond ≥ 4 + dark uses ≥ 2). **It GRANTS — the
  instrument wraps it to record calls but NEVER calls it
  itself** (a snapshot call would grant abilities).
- **The relay road in policy** (scripts/policies/capable.js:828
  `relayRoad`, called from capable daily): claims the relay when
  pantry > 30,000 kcal and roster ≥ 6, else appoints the best
  switchboard candidate; answers pending relay scenes by
  lean+ground; communes daily + reroutes honest. **Competent
  NEVER takes it: `grep -i "relay|integration"
  scripts/policies/competent.js` returns NOTHING.** The relay
  road is capable-only in code; this arm proves it live (the
  relay-verb wraps are dead-in-pilot under competent, proven
  live in the fixture by direct calls).
- **The Binding** (hierarchy.js:2489 `belong: 'The Binding'`,
  docs/SCALE.md; traced by sim-bindingtrace-b, Nov 10): the
  BELONG road's beat (swear/serve/walk), NOT the LEAD road's
  (The First Court). Chain B0–B5 (bindingtrace-b taxonomy, reused
  verbatim): B0 foreign realm forms (foreign polity size ≥ 4);
  B1 Haven becomes a subordinate (a link with subordinate='haven'
  forms — on the measured substrate the ONLY door is the
  counter: a proposal scoring 35–54 stages a counter whose terms
  are "they'll TAKE Haven"); B2 the belong link reaches good
  standing (trust ≥ 50, arrears 0, age ≥ 14); B3 BELONG qualifies
  (good + the primary's foreign polity ≥ 4); B4 The Binding stages
  (`state.pendingNational`, shape 'belong'; LEAD is checked first,
  so simultaneous LEAD qualification MASKS belong); B5 The
  Binding resolves (answered swear/serve, walked, died).
  Bindingtrace-b (tableseat-nowait substrate, 8 seeds): the chain
  fails at B1 on 8/8 — 0 counters staged, 0 subordinate links,
  proposals score 55/71/61 direct-accept; the ladder's free link
  also lands Haven-primary. This arm re-measures the chain under
  plain competent play (no substrate arms).
- **Overtime + THE NETWORK** (TABLE.md §"Overtime, the Network,
  and THE HOSTS"; overtime.js; network-campaign.js header, Steve
  2026-10-14: "Something else on the scale of titan class but
  even bigger. Something that has to be fought across the entire
  map ... Should be almost impossible to get."): the clock starts
  the dawn the Table is announced (never before day 90) and runs
  only while the seat is not taken; every 7 unseated days = +1
  tier, cap 6 (the interval stretches with ladder points: +1 day
  per 4 counted ladder points, overtime.js). Per tier: wave-4/5
  fights become RERUNS (HP/damage/pack stack), roaming cap rises,
  raids come sooner, seat price drops. Tier 2 airs the run's
  uncast apocalypse titan too. **The key: Overtime ≥ keyTier (3)
  AND herald, nielsen and finale all slain** — then THE NETWORK is
  summoned (network-campaign.js): one piece in each 3×3 sector of
  the 9×9 map — 4 masts (network_tower, 2400–2800 HP, armor 16),
  4 limbs (network_limb, 3000–3400, armor 18), the heart in the
  middle (network_heart, 6000–7000, armor 22, the Finale's hunger
  with a [180,240] card on a 3-round fuse). Each mast/limb brings
  one real wave-5 monster (1200–2000 HP) whose counters still
  work; the heart brings the spoiler and the network note. ~33k HP
  of pieces plus ~15k of escorts, fought in data order with ONE
  coalition: 20 blades to start, 1000 kcal/blade/day upkeep, the
  dead stay dead, camp between nodes (+50% / +25%), no new blades
  once the march begins, ≥5 survivors to face a node, ≥10 for the
  heart. A loss leaving fewer than 5 ends it: the key is lost for
  the run. The heart falling sets `pg.networkFallen` (the key),
  which adds THE HOSTS to every Table path (light "An Open Table",
  dark "The New Network"; choosing it brings the Taken home).
  Rarity is a target, not a measurement yet: "almost impossible",
  well under 1% of strong runs — the playing bot will measure it.
- **The Finale march** (finale-campaign.js header, Steve
  2026-10-11: "super special"): three nodes in order —
  finale_crew (THE COMMERCIAL BREAK, 9×9) → finale_opening (THE
  OPENING CREDITS, 12×12, weaker card [100,140], 5-round fuse) →
  finale (THE HEART, 12×12, two parts, bloodied brings sky-fall
  zones + THE ENCORE). 20 blades to start (the largest army in
  the game); the heart demands 10 survivors or a re-muster at
  trust cost; dead allies stay dead across nodes; crew spoils
  become one-shot combat buttons in the heart.
- **Wave-6 kinds** (coverage audit §1/§2): network_heart,
  network_limb, network_tower — reachable ONLY through the Network
  campaign march, never through the wild pool (`unlockedWave()`
  caps at 5, game.js:34184). W6 is **Unmeasured** everywhere — no
  spawn, kill, or faced record found anywhere. The 10 relay tests
  prove the verbs work when CALLED; no sim has ever measured
  whether the road is walked in a lived village. This arm
  supplies the first numbers.
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Relay / network campaign — **Partial**: capable scores/offers/
  uses abilities in fights — no wait, that row reads: played by
  capable only (`relayRoad`); prior sim sim-bindingtrace-b (Nov
  10); 10 relay tests; **no panel metric**. This arm supplies the
  first-numbers analogue. (Note: the audit's "capable only" is
  confirmed in code above — competent.js has no relay call.)

## What the existing relay/network tests prove — and what they do NOT

The 10 relay tests (test-relay-* / the relay suites) prove the
verbs work when CALLED: claim/appoint, probe/reroute/deepen/
commune, scene answers move the lean, unlock thresholds grant,
the switchboard costs are voiced. The Network/finale campaign
tests prove the march rules work when STAGED: summon places nine
pieces, order is enforced (out-of-order refuses aloud), the
coalition musters 20, the dead stay dead, the floor ends the
march, the heart sets networkFallen. None of them measures
whether any of it ever HAPPENS in a lived village under default
competent play: no switchboard availability days, no relay holds,
no communes, no Binding stages, no overtime tiers, no titan
slays, no summons, no W6 faces. This arm measures exactly that,
on a plain competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: no open line names relayfirst / networkfirst / relay
or Network first numbers; the closest lines are the Binding
follow-up (answered by sim-bindingtrace-b) and the scale-wall
lines, not this census.) Any relay/Network gap this arm surfaces
is APPENDED as [open] in the evidence file's findings section
and in sim-findings.md, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the road's gates exist and are wired —
   `switchboardAvailable` gates on `networkLive` (a link makes
   it true); competent answers the table when it waits
   (competent.js ~3289, "ANSWER THE TABLE"); sibling
   first-numbers pilots reach day 90+ (median survival
   122.5–140d), so the table-announcement window (day 90+) is
   inside the band. Titan contact (omens/slays) and overtime
   tiers are UNKNOWN on this substrate — the pilot measures
   them; the engagement floor (GO table) is set so a band with
   zero road-opportunity is uninterpretable, not GO.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every switchboard
   availability day, every relay-verb call, every relay scene,
   every belong-chain stage, every overtime tier day, every titan
   omen/slay, every Network/finale node fight on the band. The
   engagement floor (GO table) is set from the pool's nature: if
   the band produces zero road-opportunity events at all, the
   census is uninterpretable, not a GO.
3. **Verb existence**: claimRelay, appointSwitchboard,
   switchboardAvailable, switchboardCandidates,
   relayHeldByBearer, pendingRelayScene, relayAnswer,
   relayCommune, relayReroute, relayProbe, relayDeepen,
   relayGrant, relayTranslate, relaySanctuary, relayAdvocate,
   relayRewrite, relaySkim, relaySight, relayCarry,
   relayUnlockCheck, networkSummon, networkCampaign,
   networkCurrentNode, networkStatus, soundTitanCall,
   titanMusterReady, titanMusterState, finaleCampaign,
   overtimeTier, overtimeActive, spawnWorldMonster,
   startCombat, tbEnd, ledgerAdd, tele all exist in the engine
   (citations above). The policy drives NONE of the relay verbs
   under competent — that asymmetry (capable walks the road,
   competent never touches it) IS one of the first numbers.
4. **Horizon fit**: 150d. The road is late-game by construction:
   table announces day 90+; keyTier 3 needs ~21–30 unseated days
   after that (7-day interval stretched by ladder points); the
   earliest Network summon is ~day 111–120, and the 9-node march
   after that. 150d measures summon + early-march progress, NOT
   march completion — stated here so a 0 cleared nodes is read
   as horizon-limited, not as a broken march. Same horizon as
   the siblings for comparability. Death-aware stop (dead
   villages stop, +10d tail max).

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of the relay
road + Network campaign in a lived village** — every relay-verb
call classified by verb + outcome; every switchboard availability
day counted; every belong-chain stage classified per seed (B0–B5
taxonomy, 0 unclassified); every Network-gate event (overtime
tier, titan slay) dated; every W6 spawn/face/kill attributed by
kind (spawn wrap + startCombat face + tbEnd outcome + campaign
cleared list + tele cross-check, residue 0); every finale-march
node faced/cleared counted; every metric in the list below
counted or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every relay-verb call classified by verb + outcome, none 'unclassified' | 0 unclassified relay events across the pilot (verb known, return recorded, day known) |
| Every W6 spawn/face/kill attributed by kind, none 'unattributed' | 0 unattributed W6 events (spawn-wrap ids reconcile against world-monster snapshots + campaign cleared list + networkFallen; residue 0) |
| Every seed's belong chain classified, none 'unclassified' | 0 unclassified seeds (each seed gets exactly one first-failing-link class from the B0–B5 taxonomy, or 'binding-answered') |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥1 road-opportunity event band-wide (table announced OR switchboard available OR titan omen stage ≥1 OR overtime tier ≥1), else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Relay road: switchboard availability (days available, first
   day); claimRelay / appointSwitchboard calls + outcomes
   (claimed / refused + why); holder days (bearer-held vs
   appointed); relay verbs by verb (probe/reroute/deepen/commune/
   translate/sanctuary/advocate/rewrite/skim/sight/carry) with
   returns; relay abilities granted (which, when, by which
   threshold); relayLean / grounding / sysBond trajectories;
   integration + integrationStage over time; relayUnlockCheck
   calls (engine-side only — the instrument never calls it).
2. Relay scenes: communes (count, days); pending scenes
   (staged, answered, left waiting); answers by choice id with
   lean/ground deltas; backfires (count, cause); quarantine
   events, if any.
3. Binding chain: per-seed B0–B5 funnel (foreign realm day,
   belong link day, good-standing day, qualify day, Binding
   staged day, Binding answered day); counters staged/answered
   (accept-sub / sweeten-primary / no-link); link forms by role
   (primary/subordinate) and via (counter/direct/ladder);
   LEAD-mask days; first failing link per seed (bindingtrace-b
   taxonomy, reused verbatim).
4. Network gate: overtime tier trajectory (first tier day,
   max tier, days at each tier); titan slays by id with first
   days (herald, nielsen, finale, the_network, others);
   titan omens staged (stage per titan per day); muster calls
   (soundTitanCall by titan + outcome); networkSummoned day;
   summon refusals (startCombat on a piece before summon /
   out of order / under-mustered).
5. Network march: nodes cleared in order (cleared list vs
   data order); W6 spawns by kind (tower/limb/heart);
   W6 faces by kind (startCombat, in-order only); W6 kills by
   kind (tbEnd pieceDead + cleared list + killer_tale);
   blades at march start, survivors after each node, camp
   events; network lost day + node (if any); networkFallen day
   (if any).
6. Finale march: finale campaign state (started/crew/opening);
   finale_crew / finale_opening / finale faced + killed;
   muster size at start, survivors after each node, re-muster
   events (finaleReinforce); heart floor blocks.
7. W6 census: per-kind spawn/face/kill counts across the band
   (the audit's unmeasured row, settled or honestly zero);
   escorts faced/killed per node (cancellation/editor/timeslot/
   rerun/network_note/spoiler); W6 kinds never spawned.
8. Table path: table announced / waiting / done days; seat
   taken (lesser/full/none); path chosen (relay?); branch
   (light/dark/grey); HOSTS offered/taken (needs
   networkFallen); full seat reached (yes/no + why not).
9. Say-line coherence: every relay/binding/Network say line in
   the corpus classified (switchboard line vs availability,
   relay-verb line vs held state, Binding line vs staged beat,
   Network summon line vs summoned state, overtime line vs
   tier); any line whose claim contradicts the live state it
   describes; the lean/grounding numbers as voiced vs as
   recorded.
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: the road is late-game (table day 90+, keyTier ~day
  111–120, 9-node march after); sibling first-numbers pilots ran
  150d with median survival 122.5–140d, so 150d captures the full
  village life without ticking dead villages. The horizon measures
  summon + early march, not march completion (§14b.4).
- **Seeds: 190331–190338 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190331–190338:
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
    `"totalDraws": 19033x`-style numeric coincidence inside a
    per-seed JSON cannot be excluded by this search — the band
    is fresh as a SEED naming, which is what the skill guards.
    (Same honest caveat as sim-abilityfirst-a, same scope.)
  - No perseed directory names any seed 190331–190338 (listing
    of evidence/2026-11-11 checked: perseed-abilityfirst-a,
    perseed-convfirst-a, perseed-trustfirst-a, perseed-vetfirst-b,
    perseed-endgame-r178* only).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    191702, 199585 — none overlap.
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

scripts/relayfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- claimRelay: every call — return ('claimed' / null), holder
  before/after, day.
- appointSwitchboard: every call — vid, return, day.
- relayAnswer: every call — choice id, pending scene id before,
  return ('answered' / other), day.
- relayCommune / relayReroute / relayProbe / relayDeepen: every
  call — mode (reroute), return, day.
- relayGrant: every call — abilId, granted (return), day.
- relayTranslate / relaySanctuary / relayAdvocate / relayRewrite /
  relaySkim / relaySight / relayCarry: every call — args, return,
  day. (Ability USES — the dark/light verbs as played.)
- relayUnlockCheck: every call — grants after (relayAbils diff),
  day. NEVER called by the instrument (it grants).
- networkSummon: every call — return, overtime tier at call, day.
- soundTitanCall: every call — titanId, return, day.
- spawnWorldMonster: every call — monster id (string or {id}),
  tile, networkNode (opts), titan flag (opts); RECORDED only for
  campaign kinds (network_heart/limb/tower, finale,
  finale_crew, finale_opening, herald, nielsen, spoiler,
  network_note, timeslot, cancellation, editor, rerun) or when
  opts.networkNode is set — the wild pool is out of scope.
- startCombat: every call — monster id (arg or pendingMonsterId),
  networkNode (playerMonster), wave (monsters.json), campaign
  tag (state.titans._fight), return (null = refused), day.
- tbEnd: every call — result, campaign tag, fighters summary
  (monster ids + alive/hp at end), pieceDead per network/finale
  node (same rule as network-campaign/finale-campaign: the
  node's piece dead). Read BEFORE the original runs (it mutates).
- ledgerAdd: every call — RECORDED only when kind === 'titan'
  (slew:<titanId>), day.
- tele cross-check: 'network_summoned', 'network_fallen',
  'network_lost', 'overtime_tier', 'killer_tale',
  'vet_killer_tale', 'companion_kill_beat' events only.
- Daily snapshot: pantry kcal, roster, standing, scaleRank,
  nationalLive, wave, bearer; relay — switchboardAvailable,
  switchboard holder (holderId/stage/appointedDay),
  relayHeldByBearer, scholar.relay counters
  (probes/reroutes/deepens/communes/backfires/holderDays),
  relayAbils (unlocked list), relayLean, sysBond, grounding
  (scholar.grounding raw), integration, integrationStage;
  binding — foreignPolities (primary/subs), pendingCounter,
  hierarchyState links (id/status/primary/subordinate/trust/
  arrears/day/kind), pendingNational (shape/day), nationalLive /
  nationalShape / scaleRefused, region stir; network — overtime
  tier + active, progState networkSummoned/networkFallen/
  networkLost, networkCampaign state (summoned/started/idx/
  cleared/lost/done), titans slain map, titan omens (stage per
  titan), finaleCampaign state (started/crew/opening), W6 world
  monsters on the map (id/networkNode/tile); table —
  tableAnnounced/tableWaiting/tableDone, tableSeat() seat,
  tableState() path/phase.
Driver: scripts/relayfirst-driver-20261111.js (mirrors
abilityfirst-driver; Game.say wrap with a relay/binding/Network
regex for the sense corpus, 200 lines/seed cap — same
early-game-only caveat as the siblings). Analyzer:
scripts/relayfirst-analyze-20261111.js (classifiers for relay
events, W6 spawn/face/kill reconciliation, belong-chain
classification per bindingtrace-b taxonomy from snapshot traj +
link diffs). Proof:
scripts/test-relayfirst-a.js (each wrap proven live on a fixture
or miniature; RED checks on the pre-fix instrument where a wrap
is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-abilityfirst-a,
sim-trustfirst-a, sim-fishstaff-b, cookfirst-a, preserve-a,
fishfirst-a, travelfirst-a, tradefirst-a). The control/neutral legs
are the neutrality proof, not a panel. Panel context: **no panel
metric for relay, binding, Network, or W6 kinds** (coverage audit
§4) — this arm supplies its first-numbers analogue (Metrics
1–9); the panel's `table` / `national` / `entered` fields are the
only existing adjacent panel fields.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (abilityfirst-a: median survival to be read from its
evidence; trustfirst-a: median survival 133d, 2/8 survived,
651 deaths over 1,150 village-days). If the instrument changes
any numeric field vs the recorder-free baseline, the arm is NO-GO
on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
