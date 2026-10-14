# TRUST-GAIN CENSUS — arm verdict (scale-onramp r31 ARM 2/3, diagnostic, 2026-10-14)

Axis: scale-onramp, trust lens (lever 5 as lens, lever 0 food as context).
Blank: r30's open finding — "TRUST-GAIN CHANNELS ARE THE MISSING HALF."
r30's ledgerpenalty arm was KILLED AT PILOT: routing the per-take −2 through
the trailing-7d rate ledger was proven correct (proof 10/10 RED→GREEN) but
the primary was saturated — trust<30 scholar-day share 0.9938→0.9978; trust
never reaches 30 on the courtship road (max trustEnd 23). Removing the
penalty stops the bleeding but only GAINS can heal. The gain channels
(gifts, deeds, tribute, teaching) were unmeasured and apparently too weak.
This arm measures them — no lever, no game-code change, a census.

**VERDICT: GO — census complete, and it CORRECTS r30's premise.** The gain
side is not the bind. The village earns +95 trust/100 village-days against
−32 drains; the scholar lineage reaches trust 52–90 (median 69) with a
trust<30 day share of 0.36, not r30's 0.99. r30's "trust never reaches 30"
was a SUCCESSION-MASKING artifact: it read the dead original scholar's
frozen trust entry. The live finding is stranger and more important: **the
sitting scholar earns almost no trust at all** (+200 gains vs −448 drains
while sitting across 16 combos). The lineage trust climbs only through
succession inheritance — villagers earn trust through work, and 40% of it
carries into the scholarship when they take office. The scholar's own heroic
deeds don't move the scholar's trust; the trust economy is NPC-to-NPC and
the sitting scholar stands outside it.

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **INSTRUMENT**: scripts/trustgain-20261014.js — harness-side trust census.
  Wraps Game.trustGainProgressive (base vs applied, caller-attributed),
  installs a Proxy on state.village.trust (every write, delta + caller),
  wraps _trustGain (link-trust currency, separate from villager trust),
  bumpTrust (reason capture), resolveConsequence (channel `name` field),
  and say buffers (ring + per-day archive) for sense-testing. Read-only by
  construction: every wrap returns the original value, the proxy passes
  writes through, no RNG draws inside the instrument. SUCCESSION-AWARE per
  the r30 lesson: no per-vid ledger reads — every write is recorded as an
  event, and the per-day sampler tracks Game.villagerId so scholar-lineage
  gains join by day (strict per-day: a successor's NPC-era gains don't count
  as sitting-scholar gains).
- **SEEDS/POLICIES**: 11/22/33/44/55/66/77/88 x belongseek/leadcourt = 16
  combos, 180d death-aware, det-gate required 16/16 identical before
  trusting the census (scripts/sweep-trustgain-20261014.js --invocations=2).
- **PRIMARY**: ranked gain-channel contributions — total trust gained per
  channel per 100 village-days; which channels fire at all on the courtship
  road; gains vs penalty-drain balance (village-wide and scholar-lineage,
  strict per-day).
- **GO**: complete census with the binding channel named in numbers.
  DIAGNOSTIC arm — verdict = the ranked census + the named next lever.
- **PROOF**: scripts/test-trustgain-20261014.js — instrument proof with a
  REAL RED phase (silence on the nothing baseline; per-channel synthetic
  GREEN: bumpTrust ±, donateToPantry, takeFromPantry sting, comfort,
  giveFood, applyRep, _trustGain link) and GREEN on honest runs
  (classification completeness on a live run). 28/28 PASS.
- **GO on census completeness, else KILL per §14.** A miss is NO-GO, never
  re-scored against a friendlier metric mid-run.

## Proof test (scripts/test-trustgain-20261014.js) — 28/28 PASS

- **RED on nothing**: fresh census, no acts → zero writes, zero progressive
  rows, zero link rows. (Caught one real phantom mid-build: the test's own
  trust seeding after install recorded a −5 — the scholar starts at 15,
  not 10; the instrument was honest, the test was sloppy; seeding moved
  before install.)
- **GREEN per channel**: bumpTrust ±, donateToPantry (gain:donate-unload),
  takeFromPantry sting (drain:pantry-take-sting, delta exactly −2),
  comfort (gain:grief-comfort), giveFood (gain:food-deed), applyRep
  (gain:rep-drift), _trustGain link (applied 5, no village-trust leak).
- **R11 classification completeness**: the honest run's full write stream
  classifies with zero `other:` survivors. (Two rounds of new-channel
  discovery during the build: the objective system family, then
  arrivalTick/visitorInteract/playerDeath/teachPlant/noteSharedFight —
  all classified.)
- **GREEN on honest run**: seed 11 leadcourt 20d — writes captured, lineage
  sampled daily, per-100vd computable, ranked table non-empty.

## Det-gate (scripts/sweep-trustgain-20261014.js --invocations=2)

- **16/16 IDENTICAL** (day-hash A/A per combo, instrument installed).
  In-process A/A spread on every metric is 0. The instrument does not
  perturb determinism; the census numbers are trustworthy.

## The census (16 combos, 180d death-aware, 16,314 village-days)

### Ranked gain channels — village-wide (per 100 village-days)

| channel | +/100vd | fires | combos | what it is |
|---|---|---|---|---|
| gain:assignment-deed | +35.33 | 5536 | 16/16 | haven work assignments ("kept the haven work going", "fetched creek water") |
| gain:rep-drift | +21.12 | 3577 | 16/16 | direct-witness trust ripple (applyRep) — villagers SEEING deeds |
| gain:social-away | +11.92 | 1771 | 16/16 | walking out together, visits, chance meetings |
| gain:work-deed | +6.05 | 983 | 16/16 | hauling water/wood, snare line, garden, fish |
| gain:monster-deed | +7.61 | 927 | 16/16 | stood down a monster / bled together |
| gain:objective-tick | +5.74 | 921 | 16/16 | craft lessons, quiet talks |
| gain:forage-deed | +1.86 | 283 | 16/16 | foraged the wilds for the village |
| gain:npc-initiative | +1.95 | 162 | 16/16 | villagers coming to YOU |
| set:newcomer-trust | +6.99 | 114 | 16/16 | SET to 20 on arrival (not earned) |
| set:succession-inherit | +2.94 | 200 | 15/16 | SET on succession (not earned) |
| gain:event-stranger | +2.24 | 48 | 4/16 | stranger events |
| gain:npc-chat | +0.48 | 74 | 12/16 | NPCs chatting near you |
| gain:expedition-return | +0.36 | 58 | 12/16 | came back from an expedition |
| gain:mentor-slot | +0.26 | 14 | 14/16 | mentored through the slot moment |
| gain:fireside-conflict | +0.08 | 28 | 10/16 | sided with them (+2) / cold-shouldered (−2) |
| gain:blood-bond | +0.07 | 11 | 6/16 | bled together |
| gain:contest-verdict | +0.12 | 8 | 6/16 | played-contest verdicts |
| gain:donate-unload | +0.04 | 6 | 3/16 | pantry donations |
| gain:answered-call | +0.02 | 4 | 4/16 | answered a call for help |
| gain:teaching | +0.02 | 2 | 2/16 | teachPlant (talk-capped at 40) |

**The brief's named channels are absent, not weak:** gain:food-deed
(gifts), gain:grief-comfort (comfort beats), gain:amends — **zero fires
village-wide on 16 combos**. Not underpowered; never invoked. (The proof
test confirms the machinery works when called — the road just never calls
it.)

### Gains vs drains — the balance

| scope | earned gains /100vd | drains /100vd | sets /100vd |
|---|---|---|---|
| village-wide | **+95.26** | −31.55 | +9.93 |
| sitting scholar (strict per-day) | **+1.23** | −13.21 | +0.88 |

The village earns 3× what it loses. The sitting scholar earns essentially
nothing (+1.23/100vd) while losing −13.21/100vd. The scholar's trust does
not come from the scholar's gains.

### Sitting-scholar gains (strict: vid == scholar on that day) — the whole list

social-away +83 · objective-tick +76 · event-stranger +32 · donate-unload
+6 · rep-drift +2 · assignment-deed +1. Total ≈ +200 across 16 combos.
Sitting-scholar drains: pantry-take-sting −441 · fireside-conflict −7 ·
convo-fallout −4. Net while sitting: **−248**.

### Where the lineage trust actually comes from

belongseek-s44 (trustEnd 90, survived 180d):
d1 scholar starts 15 → d24 successor starts 31 → d47 successor starts 40
→ d110 successor starts 75 → d120 successor starts 83 → holds 90.
Every jump is the succession SET (40% of the dead bearer's trust + 40% of
the successor's own villager-built trust + elders' vouching up to +16,
floor 10). Between successions the sitting scholar adds almost nothing
(devon: 83→90 over 60 days). **Trust is inherited, not earned in office.**
The villagers' work deeds (+5,763 assignment-deed) are the fuel — a good
villager's record carries 40% into the scholarship.

### The r30 correction (measured, not argued)

sense3-trustgain-20261014.js on leadcourt-s11: the original scholar's
trust<30 share (r30's metric) = **1.0000** (143/143 days — the corpse's
frozen entry); the lineage trust<30 share = **0.4755**. Suite-wide:
lineage trust<30 share **0.3608** (719/1993) vs r30's 0.9938. Max trust
seen 90; trustEnd median 69 (p10 36). r30's metric review already
suspected it ("dead scholars' frozen 0-trust inflates the control side") —
confirmed in numbers. The penalty-LEDGER finding (rate routing correct)
stands; the "gains are the missing half" conclusion does not: gains were
there all along, accruing to villagers.

### Progressive efficiency (applied/base per channel)

assignment-deed 0.41 · rep-drift 0.50 · social-away 0.75 · monster-deed
0.73 · work-deed 0.84 · objective-tick 0.82. At high trust the progressive
curve shaves hard — the dominant channel keeps only 41¢ on the dollar.
The ceiling is working as Steve designed (2026-10-07); it binds hardest
exactly where the village earns most.

## Currency finding: TWO trusts

_link-trust_ (hierarchy.js `_trustGain`, per-link, the courtship road's
standing bar): +2,867 across 872 calls — tendLink +1,536 x192 · payTribute
+279 x106 · linkTick +242 x337 · answerAccord +290 · answerNationalChoice
+216 · answerDemand +156 · proveWorth +148. _Villager-trust_ (the
half-ration line, the "they don't trust you yet" line): the census above.
**The courtship verbs (tribute, tending, accords, demands) feed LINK
trust; the scholar's villager trust comes from work and inheritance.**
The two never convert. A scholar can hold link-trust 90 with a foreign
fire while their own village trusts them at 30 — and the game never says
so.

## Sense-test (SENSE-TESTING LAW)

Read the beats. The dominant gain channels are **narratively silent**:
the biggest gain day (+29 trust, d54) carries no line about trust at all —
the gains land as mechanical ticks (bumpTrust → tele event, no say).
What HAS voice is the low-trust side: "Why should I listen to you?"
"(Trust too low.)", "You haven't earned that yet", and the drains:
"Someone watches you take food. They say nothing, but you feel it."
The village tells you when it distrusts you and never tells you when
it's learning to trust you. donateToPantry is the exception ("Donated X.
Trust +Z. They'll remember this.") — and it fired 6× in 16 combos.
Verdict: gains read as mechanical ticks, not people-level events. The
fiction knows the penalty; it doesn't know the reward.

## Village assessment

Sixteen villages on the courtship road, median 145 days, 11 reaching
national. The road is alive: 3–12 successions per village (median 6),
scholars dying and the office passing with its discounted trust. What
thrives: villages that work — the assignment engine (fetch water, haul
wood, work the creek, keep the haven fed) is a trust-printing machine for
villagers, and the succession ratchet converts villager records into
leader standing. What dies: scholars — the sitting scholar is a net trust
loser (−248 over the suite while sitting), ground down by the −2
take-sting (−441) while earning +1.23/100vd. The villages that reached
national did it on link-trust (tribute + tending), not on scholar
standing. The half-ration line binds 36% of scholar-days — a real
pressure, not the 99% r30 measured, and it's the take-sting plus
succession resets doing it, not a gain drought.

## Reachability verdict

Waves 1–4 reachable (max wave 4; wave-5 unlocks 0/16 — the wave-5 content
gate untouched by this arm). Regional→national 11/16. Table 0/16. Wins
0/16. The trust census opens no content gate and closes none — but it
re-times one: the trust<30 half-ration pressure the r30 arm was built to
fix is a 36%-of-days pressure on living scholars, not a 99% stranglehold.

## Blanks filled / documented

- **r30's "TRUST-GAIN CHANNELS ARE THE MISSING HALF" — FILLED, corrected.**
  Gains measured: +95/100vd village-wide. The bind was the metric
  (succession-masking), not the gains. The ledgerpenalty kill stands on
  its own §14 miss, but its motivating blank dissolves.
- **New open blank: THE SITTING SCHOLAR IS OUTSIDE THE TRUST ECONOMY.**
  NPCs earn trust through work (+5,763 assignment-deed); the scholar's
  own deeds don't move the scholar's trust (strict +200 vs −448 while
  sitting). The scholar earns LINK trust through courtship, villager
  trust only by inheritance. Whether leadership deeds should earn
  villager trust is a design question (Steve's call) — the engine
  currently says no.
- **New open blank: SILENT GAINS.** The dominant channels narrate
  nothing; only low trust and drains have voice. Feel work, [needs-eyes]
  class.
- **New open blank: DEAD CHANNELS.** food-deed (gifts), grief-comfort,
  amends fired zero times on 16 combos. Either the road never needs
  them (fine — document) or they're unreachable in practice (fix).
  donate-unload fired 6× — the policy never donates.
- **New open blank: TWO TRUSTS, NO BRIDGE.** Link-trust and
  villager-trust never convert; the game never tells the player which
  one a verb feeds.
- **Instrument blank filled: SUCCESSION-AWARE MEASUREMENT.** The census
  joins by (day, vid) with a strict per-day scholar map; set-based
  lineage scopes inflate sitting-scholar gains with NPC-era records
  (+2,407 → +200 on assignment-deed). Future trust arms must use the
  strict scope or say which they use.

## Metric review (§14, mandatory)

- PRIMARY (ranked gain-channel census per 100vd, channels firing, gains
  vs drains): MET — 26 channels classified, zero `other:` survivors on
  16 combos; det-gate 16/16 identical; proof 28/28. GO.
- The pre-registered GO was "complete census with the binding channel
  named in numbers": the binding channel for scholar standing is
  **set:succession-inherit** (the ratchet), with gain:assignment-deed
  the fuel (+35.33/100vd village-wide, feeding successors' 40%).
- Metric concern for the NEXT run (not this one): the per-100vd
  normalization mixes NPC and scholar gains — the village-wide number
  (+95.26) and the sitting-scholar number (+1.23) tell opposite stories.
  Any future trust lever must pre-register which scope it moves. The
  set-based lineage scope is deprecated by this run's finding (it
  counts NPC-era gains as scholar gains).
- No re-scoring: the diagnostic GO is census completeness, met as
  pre-registered.

## Convergence report

- Convergence: **GO (diagnostic)**. Axis scale-onramp: still the blocking
  axis — converging, not converged (0/16 wins; the trust picture is now
  measured, and it is not the wall's face: the road earns trust fine,
  villages die of the combat bleed before the on-ramp).
- Wall numbers this run (16 combos): national 11/16, table 0/16, wins
  0/16, wave 4-5 unlocks 0/16 (max wave 4), median survival 145d,
  exiled 0/16.
- TELEMETRY: quiet vs scale-wall.json (national 11 vs 8 — inside the
  no-deviation band; no baseline roll).

## Files

- scripts/trustgain-20261014.js — the census instrument (harness module)
- scripts/sweep-trustgain-20261014.js — 16-combo sweep + det-gate mode + SMOKE gate
- scripts/test-trustgain-20261014.js — proof, 28/28 (REAL RED phase)
- scripts/analyze-trustgain-20261014.js — census analysis
- scripts/sense-trustgain-20261014.js, sense2/sense3, dbg-scholar — one-off probes
- evidence/2026-10-14/trustgain-census.json — suite summary
- evidence/2026-10-14/trustgain-perseed/*.json — per-seed (national/table/wins/exiled + channels + trajectory)
- evidence/2026-10-14/trustgain-detgate.log — 16/16 A/A record
