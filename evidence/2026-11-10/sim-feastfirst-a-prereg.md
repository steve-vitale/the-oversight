# Feast / tribute — first numbers: pre-registration (arm sim-feastfirst-a)

Run fleshout-20261111T0646Z, Loop A. Coverage Program Tier 2 (Steve order
2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE any judged
sim. Base commit b7fe9c03d.

## Canon

- docs/CANON.md read first. **There is NO FEAST.md or TRIBUTE.md in
  docs/** — no canon doc covers the feast ritual or tribute as its own
  system. The feast's standing role is documented in docs/TABLE.md (the
  feast is an optional bundle deed on the Standing ladder, not a seat
  deed) and docs/SCALE.md (national/global feast choices). Nothing is
  invented here; the code citations below are the source of truth.
- Feast mechanics as coded (src/js/game.js, read before pre-registering):
  - `hostFeast(opts)` (game.js:32001): the ritual. Guest list = invited
    ∩ present (sick stay in tents, hostile won't sit); cost
    `max(1500, 400 × (invited+1))` kcal drawn as REAL pantry items via
    `pantryDraw`; 1/day, at the haven, costs an evening (48 ticks).
    Quality 0/1/2: starts 1, +1 variety (4+ distinct items), +1
    centerpiece (cooked/smoked/dried meat), +1 heart (star guest
    showed), +1 turnout (≥90% showed, ≥5 invited), −1 thin (<300
    kcal/head), −1 small (<4 invited); legend gate needs variety or
    a centerpiece AND ≥4 invited; fusion reactors are cold seats (−1
    each, after the clamp). Trust +2+quality per guest, bonds +1
    guest↔guest / +2 host↔guest, gossip seeded, grounding +3 each.
    Writes `state.feastLog` (cap 60): `{day, quality}`.
  - `feastPlan(heads)` (game.js:31887): pure planning read — ok/why,
    cost, have, guests, menu preview (same draw on a pantry COPY),
    bundle preview. Refusals name why (exile, not at haven, one/day,
    nobody here, pantry short).
  - THE BUNDLE (Standing ladder leg 2, game.js:31765): 6 slots, 12
    contributions (crafted centrepiece / monster meat / hunted meat /
    cooked meat / preserved food / garden harvest / medicine brewed /
    explorer's rare / foraged feast / guest of honor / kept recipe /
    keepsake channel); any 6 distinct complete it; one served item
    fills at most one slot. A complete bundle writes
    `bundle:true + bundleStage` on the feast-log entry. `villageLadder`
    (ladder.js) reads +4 per distinct bundleStage, once per stage,
    outside the per-track cap. `feastBundleBuyOut()` (game.js:31854):
    pay 8,000 kcal straight from the pantry — no feast, no guests —
    bundle counts complete (quality 0, so Standing's bread source
    never mints from a buy-out).
  - STANDING BREAD (standing.js:138-146): plenty = 20 × major feasts
    (feastLog quality ≥ 1). Wave-4 unlock needs 5 feasts (or 4 kills /
    3 links / hybrid). `feast_embassy` capstone (table.js:237-240)
    requires a completed feast bundle at ladder stage 3.
  - FEAST SURGE (src/js/feastBuff.js): `grantFeastBuff(feast)` grants
    only when armed (`scholar.prog.feastSurge` OR the feast-carried
    surge). Unarmed → honest refusal ("devotion gate"); an online
    fusion reactor → honest refusal ("reactor ceiling", flat 1.25x
    is all there is). Window = `durationNights` dawns (2); re-feast
    refreshes, never stacks. A FRESH armed grant draws a scavenger
    (`drawFeastScavenger`, chance 1.0) to the haven's edge — faced
    via `faceFeastDraw` or declined via `driveOffFeastDraw`. Real
    combat use marks `feastSurgeUsed` (`noteFeastedCombatUse`).
    Arming comes from the devotion lane: `channelSentiment`
    (progression.js:342) — 3 abilities at L3 OR surgeResonance ≥ 35.
  - PELLET (progression.js:1084 `maybePassPellet`, dawn check): if a
    pellet-fed bearer exists while ≥3 living present villagers sit
    above hunger 70, the pellet passes to the hungriest (30-day
    cooldown; `tele('pellet_pass')`). The bearer never hungers, so
    the village never throws the feast the table counts — the pass
    is the release valve ("The table can hear a feast again").
  - TRIBUTE (src/js/hierarchy.js): `payTribute(linkId, kcal)` — the
    subordinate's due, real food out of the pantry, idempotent per
    week, +3 trust when the week becomes current; `linkTick` charges
    the true shortfall once at the week's end (arrears + trust −6).
    The ONLY caller of `payTribute` in the game is the app.js Haven
    button — the competent policy never calls it. System favor:
    `answerSystemFavor` (comms.js:860) — 1,500 kcal tribute on demand
    or refuse (integration −3). Betrayal deal: `villageDeal(...,
    'tribute')` — 2,000 kcal to make a hostile village back off.
    National choice 'feast' (SCALE.md): 5,000 kcal of theater for
    the cameras; global choice 'feast' likewise. Competent calls
    none of these — the pilot proves the zeros via wraps, not by
    assumption.
- Policy side (scripts/policies/competent.js, food r7): `eveningFeast`
  (dusk, at haven, armed cadence 7d / unarmed 14d, scholar gave
  ≥1,500 kcal in the last 7 days, `feastPlan.have ≥ cost × 1.5`),
  `feastFightRoad` (face the feast draw / patrol while feasted),
  `channelDevotion` (once a day, trauma < 8, channel a ready
  keepsake), `surplusFeast` (env-gated `COMPETENT_SURPLUS_FEAST=1`,
  default OFF — stays off in this run).
- Instrument pattern: evidence/2026-11-10/sim-fishfirst-a.md +
  sim-trapfirst-a.md + sim-travelfirst-a.md (same first-numbers shape).

## Pre-pilot substrate checklist (§14b)

1. **Contact**: eveningFeast fires under competent — proven by the
   feastdisc/feastdrive analyzer family and the food-r7 measurements
   (feasts held on the competent driver); the pilot confirms via the
   hostFeast wrap, not by citation.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio
   to size. The addressable pool is every dusk at Haven over 150d.
3. **Verb existence**: all feast/tribute verbs exist in the engine
   (hostFeast, feastPlan, grantFeastBuff, feastBundleBuyOut,
   payTribute, answerSystemFavor, villageDeal, answerNationalChoice,
   answerGlobalChoice, channelSentiment, maybePassPellet). The policy
   calls only the feast trio — that asymmetry IS one of the first
   numbers.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 137–140d); feasts run from the first affordable
   dusk, so no late-window risk. The bundle needs ladder stage 3 to
   matter as a capstone, which 150d competent runs essentially never
   reach — the pilot measures the bundle as a deed, not as a seat.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of feast/tribute** —
every feast and tribute event classified by verb + caller, every kcal
attributed, every metric in the list below counted or explicitly
marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every feast/tribute event classified by verb + caller, none 'other' | 0 unclassified events across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–8; sense-test scenes quoted |

A miss on any row is NO-GO against the pre-registered bar (metric review
records why; never re-scored mid-run, §14).

## Metrics (all 8)

1. Feasts held: count, day, quality (0/1/2), cost kcal, invited /
   showed / skipped (with why), served items by name + kcal, star
   guest, armed?, buffGranted, mult, draw monster id.
2. Feast refusals + non-fires: feastPlan not-ok whys, hostFeast
   not-ok whys, and — from the daily snapshot — affordable dusk
   days where no feast fired, split by gate (cadence / recent-gives
   < 1500 / buffer < cost×1.5 / not at haven / reactor ceiling).
   Villages that never feast and why.
3. Bundle deed: contributions per feast (by id), count per feast,
   complete bundles (count + stages banked), buy-outs, ladder
   bundleBonus points, feast_embassy readiness.
4. Feast surge / buff: grants (fresh vs refresh), refusals by reason
   (devotion gate / reactor ceiling), mults, combat uses
   (feastSurgeUsed), draw fires + faced/declined outcomes, fights
   won while feasted.
5. Devotion lane: channelSentiment calls, keepsakes ready per day,
   surgeResonance over time, arming day (prog.feastSurge set),
   feastSurge values carried.
6. Tribute: payTribute calls (expected 0), answerSystemFavor calls
   (expected 0) + System favor demands raised, link tribute ledger
   per week (tributePaidWeek / tributePaidKcal / arrears / trust
   per link, by direction), national/global feast choices (expected
   0), villageDeal tribute (expected 0), tribute kcal actually
   leaving the pantry by path.
7. Pellet: reactor holder (who + days held), pellet passes
   (tele pellet_pass: from/to/day), hungry villagers at dawn
   (hunger > 70 count), feasts held while a reactor is online.
8. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale. Feast's share of standing:
   plenty points (20 × major feasts) vs ladder total; bundle bonus
   points banked.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: feast/tribute is a food-economy / reachability question;
  sibling first-numbers pilots (cookfirst-a, preserve-a, fishfirst-a,
  trapfirst-a, travelfirst-a) ran 150d with median survival 137–140d,
  so 150d captures the full village life without ticking dead
  villages. Same horizon as the siblings for comparability.
- **Seeds: 180265–180272 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 18026x/18027x:
    zero hits (grep over all dated preregs; the only 1802xx seeds
    named anywhere are 180201/180208 cookfirst-a, 180209/180216
    preserve-a, 180217/180224 gardening's band, 180225/180232
    preserve reserved confirm band, 180233/180240 fishfirst-a,
    180241/180248 trapfirst-a, 180249/180256 travelfirst-a).
  - Searched all 2026-11-10 dated evidence `.md` + perseed JSONs for
    the standalone seeds 180265–180272: zero hits (one false
    positive: the digit run inside the float 269.5518026724458 in
    evidence/2026-11-10/perseed-preserve-a/preserve-s180209-preserve-pilot-control.json).
  - No perseed directory names any seed 180265–180272.
  - No standalone forbidden/contaminated band list exists in the goal
    hidden_files (listing checked by the fishfirst-a arm; only
    sim-heraldband-pilot-prereg-2018.md matched "band" and it is a
    prereg, not a list).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + all dated evidence `.md` +
    perseed directory names + goal hidden_files listing.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no snapshots;
    end-of-run wall numbers + days + end pantry kcal + deaths only),
    same seeds — must match the instrumented control leg exactly on
    days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/feastfirst-instrument-20261110.js — wraps (record-only, never alter
state, never consume RNG; recording failures go to instrumentErrors,
never thrown into the game):
- hostFeast: every feast report (quality, spent, served, showed,
  skipped, star, surgeSpent, bundle sheet, buffGranted, draw).
- feastPlan: every plan (ok/why/cost/have/armed/bundle preview
  count) — the refusal + affordability record.
- grantFeastBuff: grants/refusals (granted, refreshed, mult, quality,
  draw) + refusal why.
- feastBundleBuyOut: buy-outs (ok/spent/stage).
- noteFeastedCombatUse + drawFeastScavenger + faceFeastDraw +
  driveOffFeastDraw: surge spend, draw fires, faced/declined.
- channelSentiment + channelReadyKeepsakes: devotion channeling.
- payTribute + answerSystemFavor + villageDeal +
  answerNationalChoice + answerGlobalChoice: every tribute verb
  (expected 0 under competent — proven live in fixtures).
- tele: pellet_pass events (+ System-favor demand lines are say
  lines, not tele).
- pantryDraw: every draw by caller frame (feast cost vs buy-out vs
  meals); preview draws (feastPlan's pantry-copy draw) tagged
  `preview: true` and excluded from cost totals.
- _removePantryKcal: tribute / favor kcal actually leaving the pantry
  (caller frame).
- stockPantry: pantry deposits by name (feast-cost share backstop).
- Daily snapshot: feastLog (full entries), prog.feastSurge +
  surgeResonance, feastBuff state, pantry kcal, links ledger
  (id/kind/direction/tributeKcalPerWeek/tributePaidWeek/
  tributePaidKcal/arrears/trust), pellet holder
  (state.fusionReactorHolder), hungry count (hunger > 70, living
  present non-bearer), pendingSystemFavor + systemFavorsOwed,
  ladder stage + bundleBonus + bundleStages, standing total.
Driver: scripts/feastfirst-driver-20261110.js (mirrors fishfirst-driver;
Game.say wrap with a feast/tribute regex for the sense corpus, 200
lines/seed cap — same early-game-only caveat as the siblings).
Analyzer: scripts/feastfirst-analyze-20261110.js. Proof:
scripts/test-feastfirst-a.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b). The control/neutral legs
are the neutrality proof, not a panel.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers corpus
shape (cookfirst-a / preserve-a / fishfirst-a: median survival 137–140d,
6/8 village-lost). If the instrument changes any numeric field vs the
recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
