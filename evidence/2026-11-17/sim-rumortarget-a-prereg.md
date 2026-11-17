# sim-rumortarget-a — PREREG (binding)

Run: fleshout-20261117T0215Z (Loop A), axis scale-onramp, arm
sim-rumortarget-a — BUILD: rumor-born hunt-stage plans acquire a
target from the heard rumor itself — the beast named in the fire
talk — gated by the drive brief's rumor rules. Claims tracker
0825Z blanks #5/#6 (rumor-born plans + world-tick seeding design
calls). Branch `sim-rumortarget-a` (worktree
`~/workspace/worktrees/sim-rumortarget-a`). Base: master
`5d5293972` (verified at arm start, worktree HEAD, clean tree).
Binding prereg: THIS file — frozen before any judged sim. The
lever + instrument are built AFTER this commit; no judged numbers
exist yet.

## The question, in plain words

When villagers gather at the fire at night, they hear about
monsters the village has killed. That talk plants a plan in a
villager's head: go out and hunt the wave-4 beasts, win the
village a seat at the table. But the plan is born with no beast
named in it — the holder heard a rumor, fought nothing
themselves, so there is nothing to attach the plan to. Rumorplan-a
(DIAG-GO, `evidence/2026-11-16/sim-rumorplan-a.md`) proved the
shape: 20 of 33 hunt-stage plans are rumor-born, 0 of 20 ever
convert to a named-beast launch, and 27 of 48 wave-4+ launches
are rumor-born parties marching out with no beast named. The
seed cannot help: it writes a target only from a fight the
holder fought (`winPlanSeedFromFight`), and a rumor-born holder
fought nothing. The design call the tracker leaves open: rumor-born
plans need a DIFFERENT attachment rule, not just more seed call
sites. This arm builds that rule: when a rumor-born plan is
created from fire talk — and while it still names nothing — attach
the beast named in the rumor, gated by the drive brief's rumor
rules (a rumor is not knowledge: source trust, staleness, and
distance gate it).

## Prior art (read first)

- `evidence/2026-11-16/sim-rumorplan-a.md` + prereg — the
  lifecycle this arm changes: 0/20 conversions, the origin
  buckets, the creation / launch / bounce / census recorder,
  the any-commit launch lesson.
- `evidence/2026-11-15/sim-seedattach-a.md` + prereg — the
  8/10 heard-at-fire decomposition, the seed's party-stage-only
  reach, the 82% world-tick seed-coverage gap (NOT this arm:
  no world-tick seed call is re-landed).
- `evidence/2026-11-16/sim-planignite-a.md` — sibling arm, the
  plan-store catch-22 fix. NOT touched by this arm.
- `evidence/2026-11-16/sim-vetreengage-a.md` — the env-gate
  precedent (`VETREENGAGE=1`, default OFF) this arm mirrors.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (wave 4 "The Mirror Draft", wave 5 "The Producers"),
  `docs/VILLAGER-BRAIN.md` §2 (heard sightings: "a rumor
  recorded with its teller named, its age, and its distance,
  never merged into fight memory") and §7 phase 1 (the seek /
  scout half is scored "trust-in-teller × staleness ×
  distance — over heard sightings in the belief state").

## Code facts the lever is built on (read from src, frozen)

Verified on this tree before this prereg (`src/js/win-plan.js`,
`src/js/game.js`):

1. `plan.target` is written in EXACTLY TWO places:
   `winPlanSeedFromFight` (`win-plan.js:292-296`, `plan.target
   = mdef.id`, ONLY when stage is `gear` or `party`, wave-gated
   ≥ 3) and `winPlanDepart.launchParty` (`win-plan.js:439` —
   companion copy, null copies as null). NOTHING ever writes
   `target` back to null. This arm adds the THIRD write site.
2. Rumor-born plans are created in `winPlanHavenTick`
   (`win-plan.js:355-376`): a ranger (`wanderer`/`explorer`)
   at Haven with no plan, engaged either by personally fought
   species (`know.fought`, `win-plan.js:363`) or by the
   village's slain count (`state.villageSlain`,
   `win-plan.js:367-370`, the fire-talk channel — "the deed
   talk tells everyone"). The two legs are NOT distinguished
   in the plan record today: the plan is born `{stage:
   'gear', target: null, ...}` either way. This arm stamps
   `plan.origin` (`'heard'` | `'fought'`) at creation so the
   refresh path can tell them apart.
3. The rumor itself lives in `state.killerTales` /
   `state.vetKillerTales` (`game.js:23352-23390`,
   `queueKillerTale` / `queueVetKillerTale`): one entry per
   (type[, killer]) — `{mid, killer, day, told}` — queued
   when a VILLAGER kills a type (scholar kills never queue:
   `game.js:34899-34901` gates on killer ≠ scholar). The
   night fireside beat (`killerTaleBeat`, `game.js:23400`,
   dayPart 3) tells each untold tale in the killer's words
   and stamps `played = true` on tales actually told (vs
   `told = true` + moot when the teller died before nightfall
   or the news got out another way). First tales cover ANY
   wave (the first kill of a type); vet tales cover repeat
   wave-4+ kills of known types only
   (`queueVetKillerTale` wave gate, `game.js:23384`).
   The tale names the beast (`mid`), the teller (`killer`),
   and its age (`day`) — the drive brief's rumor record, in
   state today, with NO new write at the kill choke point.
4. What the tale does NOT carry: a location. `waveKillLog`
   entries (`game.js:34952-34968`: `{d, mid, w, by, via,
   trick}`) and tale entries carry no coordinates, and no
   per-villager heard-list exists for tales (the tale is told
   at Haven's fire; `sayHavenNews` relays it to the scholar
   if present, else queues it — there is no per-villager
   heard record). See "Distance" under Gating for how the
   prereg handles both gaps honestly.
5. `monsterDisplayName(mid)` (`game.js`) is the
   knowledge-gated beast name (descriptor or village name,
   never the true name) — the voice line uses it, never
   `mdef.name`.
6. The fight gate already withholds SEEK for a trick-less
   wave-4 beast and demotes OUTMATCHED parties
   (`win-plan.js` `winPlanFightGate`): attaching a wave-4
   target does NOT force a suicide fight — the safety nets
   stay the judge of any single encounter. The lever changes
   what the plan NAMES, not what the gate ALLOWS.

## The lever (frozen design)

New Game method `winPlanRumorAttach(vid)` in `src/js/win-plan.js`
(env-gated by `RUMORTARGET=1`, default OFF — the
`vetreengageOn()` precedent), called from `winPlanHavenTick` in
exactly two places:

- (a) AT CREATION, in the `if (!plan)` block, right after the
  plan is born (stage `gear`, target null); and
- (b) AS A REFRESH, on every later Haven tick, while the plan
  is target-null, origin `'heard'`, and stage `gear` /
  `party` / `hunt` (never `standing` / `table` — the kill is
  banked there; re-purposing a standing plan is out of scope).

Why both: plan births are front-loaded — a ranger's plan is
usually born days after the village's first kills, long before
any wave-4 tale can exist. Creation-only attach would test a
straw man (the window is ~0 by construction). The rule is ONE
rule at ONE site (the heard path of `winPlanHavenTick`): a
villager standing at Haven, holding a rumor-born plan that
names nothing, hears a fresh told tale and takes its beast as
the quarry. Creation-time attaches are reported as a secondary
split, so the coordinator can read the creation-only number
too. No world-tick seed call is added; no seed call is moved;
the seed itself is untouched.

### Gating (the drive brief's rumor rules, in code terms)

A tale is ELIGIBLE for attachment iff ALL hold:

- **Source trust** — the tale was actually told at the fire
  (`played === true`, not merely queued or moot) by a teller
  who is ALIVE on the roster now (roster member, not in
  `village.fallen`). The tale was told firsthand by the killer;
  a dead teller's tale is retold, weaker — excluded. (The
  teller is always a villager by construction — fact 3.)
- **Staleness** — the tale is fresh: `today - tale.day ≤ 30`
  days. A month-old kill is stale news at the fire. 30 is a
  prereg choice, not canon (no canon doc gives a number);
  the analyzer records the age distribution at attach time
  so the pilot can inform tuning.
- **Distance** — the tale is told at Haven's fire to a
  villager STANDING at Haven (`winPlanHavenTick` already
  requires `atHaven`): delivery distance is zero by
  construction. The kill's LOCATION is not recorded in
  state (fact 4), so no location gate is possible without a
  new write at the kill choke point — recorded here as a
  BLANK, not invented. Consequence, stated plainly: the
  plan gets a target SPECIES but no node (`plan.node` stays
  null) — the party ranges as before, and the fight gate
  can SEEK the named beast when it is met.
- **Wave** — the beast is wave ≥ 3 (the seed's own wave
  gate; a rumor-born plan is about wave-3+ quarry). Pick the
  HIGHEST wave among eligible tales; tie-break by FRESHEST
  tale day; then by queue order (deterministic).

On attach: `plan.target = mid`, `plan.needWave = wave`
(mirrors the seed), plus provenance stamps
`plan.targetSource = 'tale'`, `plan.targetTeller = killer`,
`plan.targetTaleDay = tale.day` (the analyzer reads these;
no reader consumes them in game logic). ONE voice line on
the attach transition (null → named), via `Game.say`,
naming the beast by `monsterDisplayName` and the teller by
`firstRef` — the attach must be voiced/honest (SENSE-TESTING
LAW): the line is sampled in the proof test and quoted in
the evidence. The attach fires once per plan (target
non-null blocks re-attach); a tale going stale later never
clears a target (consistent with the seed's no-clearing
rule, fact 1).

### Scope discipline

- Do NOT touch the plan-store catch-22 fix (sibling arm
  planignite-fix-a, live in another worktree).
- Do NOT re-land the vetparty seed call as a lever, and do
  NOT add a world-tick seed call. Live-master sites only
  (`winPlanHavenTick` + the new helper in `win-plan.js`).
- No instrument seed call is needed: the attach IS the
  lever; the recorder wraps `winPlanRumorAttach` directly.
- Env gate: `RUMORTARGET=1` in node sims only; in the
  browser `process` is undefined, so the lever is OFF
  there (same as `VETREENGAGE` / `VETKILLTALE_OFF`).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; 10, re-read live by the driver):
  `algorithm`, `audit`, `congregation`, `eater`, `eulogy`,
  `herald`, `influencer`, `reunion`, `strike`, `suburb`.
- **Wave-5 monster ids** (from `src/data/monsters.json`,
  wave 5; 10, re-read live by the driver): `cancellation`,
  `editor`, `finale`, `finale_crew`, `finale_opening`,
  `network_note`, `nielsen`, `rerun`, `spoiler`, `timeslot`.
- **Rumor-born** = a plan whose HavenTick creation had
  `know.fought` EMPTY and `villageSlainTotal > 0` at
  creation (the rumorplan-a `heard-at-fire` rule), recorded
  in this arm as `plan.origin === 'heard'`. The recorder
  captures the same creation reads independently
  (seedattach creation rows), so origin is classified from
  the corpus too — the two must agree (analyzer cross-check).
- **A tale-attach** = one `rumortargetAttaches` row with
  `result` non-null: `{day, vid, mid, wave, teller,
  taleDay, taleAge, atCreation, stage, origin}` plus the
  `considered` list (every played tale at that moment with
  its eligibility verdict + reason). A row with `result`
  null is a failed attempt (no eligible tale) — counted as
  an opportunity, not an attach.
- **A launched rumor-born plan carrying a target** = a
  `rumorplanLaunches` row (rumorplan-a definition: one per
  participant per real expedition start, any commit) whose
  vid's plan origin is `heard-at-fire` and whose
  `targetAfter` is non-null. Hunt-stage launches are
  reported separately from all-stage launches.
- **Cost bars** (binding, from the task): deaths/run within
  +2 of control, median survival ratio ≥ 0.9, starvation
  deaths within +2 of control. Starvation = deaths with
  kind/cause naming starvation/hunger in the per-seed
  `deaths` rows (same reading as the rumorplan-a corpus).

## Primary metric + GO bar (frozen)

PILOT GO iff ALL hold:

1. **Primary — rumor-born plans acquire a named wave-4/5
   target on ≥4 of 8 seeds (armed leg).** Counted per seed:
   ≥1 tale-attach row with `wave` 4 or 5 on a
   rumor-born (`heard-at-fire`) plan. The bar is the
   task's: 4/8 seeds.
2. **Secondary launch bar — launched rumor-born plans
   carrying a target ≥1** (any wave, any stage; hunt-stage
   launches counted separately). A named target that never
   launches is a half-answer.
3. **Cost bars hold** (above): deaths/run ≤ control + 2,
   median survival ratio ≥ 0.9, starvation ≤ control + 2.
4. **Proof test `scripts/test-rumortarget-a.js` green**
   (including the old-code-fails control: the same probe
   shows 0 rumor-born targets with the env OFF).
5. **Instrument clean:** 8/8 control + 8/8 armed files
   parse, `instrumentErrors` empty on both legs,
   determinism legs D1 + D2 green, §15 panel compare
   attached to the evidence file.

A miss on (1) is PILOT NO-GO — never re-scored against a
friendlier metric mid-run (§14). The lever is reverted on
the branch (verify `src/` diff vs master is 0 lines) and
the run lands evidence-only.

### Feasibility note (pre-registered interpretation, not a re-score)

The primary can only fire on a seed where a wave-4/5 beast
is killed AND its tale is told AND the teller is alive AND
a heard plan stands at Haven within 30 days. The control
leg measures that supply (told wave-4/5 tales per seed).
If the control shows <4 seeds with ANY told wave-4/5 tale,
the primary is unachievable by construction on this band
and the pilot reads NO-GO with tale supply as the named
cause — the binding constraint is upstream (no wave-4/5
kills to hear about), not the attachment rule. The
mechanism secondary (wave-3+ attaches: count + seeds) is
the judge of whether the RULE works in that case. This
paragraph fixes the interpretation BEFORE any judged sim;
it changes no bar.

## Secondary (reported, not judged)

- Tale supply (control leg): told wave-4/5 tales per seed
  (played, teller alive at telling), told wave-3 tales,
  rumor-born plans formed, attach opportunities (heard
  plan target-null at Haven while ≥1 eligible tale fresh).
- Attach split: creation-time vs refresh attaches; by wave
  (3 / 4 / 5); tale-age distribution at attach; teller-alive
  rejections and stale rejections (from `considered`).
- Wave-3+ attach rate: seeds with ≥1 tale-attach of any
  wave ≥ 3 (the mechanism secondary above).
- Launch table: rumor-born launches by (target null /
  wave-3 / wave-4/5), hunt-stage vs all-stage.
- Voice sample: quote attach lines (≥3, with seed/day/
  villager/beast/teller) and judge honesty against the
  tale they cite (SENSE-TESTING LAW).
- Wall numbers (BOTH legs): national / table / wins,
  wave-4/5 unlocks, median survival.
- Per-seed table: rumor-born plans, attaches (by wave),
  launches with target, tale supply.

## Seed band (verified fresh per the seed-band-freshness skill)

- **103101–103108** (8 seeds), 150d death-aware, shared
  with sibling arm sim-nightcarry-a (same band, different
  worktree/lever — no interaction: separate env gates,
  separate corpora).
- Freshness check (this arm, before this commit): zero
  hits for `103101`–`103108` in (a) all `*.md` under
  `evidence/` (including all dated preregs
  `evidence/*/sim-*-prereg.md` and today's
  `evidence/2026-11-17/*.md`), (b) `scripts/*.js` driver
  band literals, (c) per-seed filenames under `evidence/`,
  (d) the goal `hidden_files/` tracker, lever-claims, and
  findings `.md` (coordinator-verified 2026-11-17T02:38Z;
  re-verified by this arm). The ONLY hits anywhere are
  `.json` corpus VALUES, not seed usage: `pantryKcal`
  103105, `depriKcalCum` 103104 / 103101, tribute kcal
  103104, `cumTakes` 103103, and float substrings
  (`2.5103102…`, `0.0103106…`) — same class as the
  rumorplan-a prereg's kcal-value note. No forbidden-band
  list file exists. Neighbouring used bands: 102011–102018
  (rumorplan-a), 102001–102008 (Loop B) — do not use.
- NEVER 100521–100536, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568
  (task-forbidden bands).

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating; +10d tail max).
- Policy: **competent verbatim**
  (`scripts/policies/competent.js`, sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  — verified by this arm with sha256sum before this commit).
  No policy flags: default env (competent needs no env
  switch; the rumorplan-a cross-arm lesson about
  tableseat-nowait collapsing to competent does not apply —
  competent IS the policy here).
- Leg 1 (control): competent + recorder, `RUMORTARGET`
  UNSET (lever OFF — the old-code-fails control), seeds
  103101–103108. Leg 2 (armed): competent + recorder,
  `RUMORTARGET=1`, IDENTICAL seeds. Both legs run on the
  SAME branch tip (lever built, env toggles it) — the
  before/after is the env, not the code.
- **§15 balanced panel:**
  `scripts/build-rumortarget-panels-20261117.js` (cloned
  from `scripts/build-rumorplan-panels-20261116.js`, panel
  logic UNCHANGED; only leg dirs, file names, seeds,
  pseudo-policy change) builds panels in the
  `scripts/balance-panel.js` schema from the two legs:
  before=control, after=armed, PAIRED seeds on the same
  tip, pseudo-policy `rumortarget-a`. The scorecard reads
  OFF→ON deltas per contract metric. The panel is the
  instrument; the prereg bars are the judge. The `compare`
  `.md` is attached to the evidence file.
- **Encounter gear (Steve 2026-11-13):** no staged
  solo-scholar fixture is used anywhere in this arm. The
  judged numbers come from full 150d sims under the
  competent policy (a geared scholar with a party, as the
  policy plays it). The proof test's live probe stages a
  villager-side state (a told tale + a heard plan at
  Haven), not a combat fixture — no fight is staged.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed leg tip, seed 103101, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all rumortarget rows
  identical).
- **D2 (wrap neutrality):** armed leg tip, seed 103101,
  60d, recorder ON vs recorder OFF
  (`RUMORTARGET_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js`
  over the control corpus vs the armed corpus — first
  divergence on/after the first attach day per seed; the
  two legs differ ONLY by the env gate, so any divergence
  BEFORE the first attach on a seed is a nondeterminism
  finding and fails the run. (The driver carries the same
  `v4seeds` rows + T-class fingerprints as rumorplan-a, so
  the same check applies verbatim.)

## The instrument (frozen)

- Driver: `scripts/rumortarget-driver-20261117.js` (new —
  the rumorplan driver cloned, not rebuilt: same vetfirst
  T-class instrument, same WAVE-4 PER-ENCOUNTER RECORDER,
  same DAWNBID CAPTURE, same SEEDATTACH CAPTURE, same
  RUMORPLAN CAPTURE (launches + target-diffs + census),
  PLUS the RUMORTARGET CAPTURE below; `LEG` locked to
  `competent`, `RUMORTARGET` read from env and passed
  through to the game). Recorder wraps are pure reads plus
  writes to driver-local arrays — no game-state writes, no
  RNG. The driver refuses to overwrite an existing
  per-seed file. `RUMORTARGET_RECORDER=off` skips
  installing ALL wraps (used by determinism leg D2).
  Errors are REPORTED into `instrumentErrors` (named, not
  swallowed).
- Rumortarget rows (per seed, in addition to every
  rumorplan row):
  - `rumortargetAttaches` — one row per
    `winPlanRumorAttach` call (wrapped): {day, vid,
    result: mid|null, wave, teller, taleDay, taleAge,
    atCreation, stage, origin, considered: [{mid, wave,
    teller, taleDay, age, played, tellerAlive, eligible,
    reason}]}. The wrap reads the plan's origin/stage
    before the call; the call itself is the lever's.
  - End-of-run `taleSupply`: `{killerTales,
    vetKillerTales}` (each `{mid, killer, day, told,
    played}`) + `killerTaleLog` / `vetKillerTaleLog`
    (voice sample, last 20 each).
  - Output also carries `wave4Ids` / `wave5Ids` (live).
- Analyzer: `scripts/analyze-rumortarget-a.js` (new).
  Reads both corpora, prints the primary per-seed table +
  attach split + launch table + tale-supply table + wall
  numbers for both legs, writes
  `evidence/2026-11-17/rumortarget-a-analysis.json`,
  exits non-zero on any bar failure. Origin
  cross-check: recorder creation rows (fought empty +
  slainTotal > 0) vs `plan.origin` stamps in the census —
  any disagreement is named.
- Panel builder:
  `scripts/build-rumorplan-panels-20261116.js` → cloned as
  `scripts/build-rumortarget-panels-20261117.js` (see §15
  above).
- Drift check: reuse `scripts/vetparty-drift-check.js`
  verbatim.
- Proof: `scripts/test-rumortarget-a.js` (new; see below).
  GREEN on the instrument tip before the armed leg runs.

## Proof test

`scripts/test-rumortarget-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: the wave-4 AND wave-5 id sets match
  `src/data/monsters.json` exactly (10 + 10 ids); the env
  gate reads `RUMORTARGET` (default OFF); the code anchors
  still hold (two pre-existing target-write sites, the
  HavenTick creation block with the two engagement legs,
  the tale queues + `played` stamp, the single
  plan-deletion site).
- Unit (attach rule, synthetic fixtures): picks highest
  wave then freshest; stale tale (>30d) excluded; dead
  teller excluded; untold tale (`played` false) excluded;
  moot tale (told but never played) excluded; wave-2 tale
  excluded; no eligible tale → null with plan untouched;
  env OFF → null; attach sets `target` + `needWave` +
  provenance stamps; voice line names the
  `monsterDisplayName` descriptor AND the teller; origin
  stamping: `heard` vs `fought` at creation; refresh
  attaches to an existing heard plan; fought-origin /
  read-origin / companion plans are NOT attached; standing
  / table stages are NOT attached; a plan with a target is
  never re-attached.
- Live (in-memory run, no staged fight): a told wave-4
  tale + a heard plan at Haven → `winPlanHavenTick` with
  `RUMORTARGET=1` sets the target (and the voice line is
  captured naming the beast the holder heard about);
  the IDENTICAL setup with the env OFF leaves the target
  null — the old-code-fails control.
- Determinism: D1 + D2 as frozen above (seed 103101, 60d).
- GREEN on the instrument tip before the armed leg runs.

## Sense-testing

Quote ≥3 attach lines end to end from the armed leg: what
the villager planned, what the tale said (seed/day/beast/
teller from `taleSupply` + `killerTaleLog`), what the plan
named, and what happened on the trip (launch rows +
`v4encounters[].log[]` where a meeting followed). Do not
invent fight narrative from kill counts. Judge whether the
voice line names the beast the holder actually heard about.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft",
  wave 5 "The Producers". Doc drift noted (rumorplan-a):
  the doc lists 9 wave-4 monsters and 8 wave-5; the data
  has 10 and 10 (`herald`; `finale_crew` /
  `finale_opening`) — the data rules.
- `docs/VILLAGER-BRAIN.md` §2 + §7 phase 1 — the rumor
  rules this lever implements (teller named, age, distance;
  trust-in-teller × staleness × distance). The full
  per-villager trust map + heard-filtered belief state
  (phases 2–3) are NOT built here: this arm uses the
  existing fireside channel (the tale is told at Haven's
  fire; the deed talk tells everyone) and records the
  per-villager heard-list gap as a blank (see "Distance").
- No canon doc covers plan-target attachment or the
  win-plan lifecycle — the win-plan system lives in
  `src/js/win-plan.js` (ontology header) and the dated
  evidence. This prereg says so rather than inventing canon.
- Prior evidence: `evidence/2026-11-16/sim-rumorplan-a.md`
  (§"The answer, in the frozen rule's own terms") and
  `evidence/2026-11-15/sim-seedattach-a.md`.

## Metric review (to be filled in the evidence file)

Pre-registered here: the review will report the primary
per-seed table (attach / no-attach with the reason: no
tale, stale-only, teller-dead-only, no heard plan), the
launch bar, the cost bars against the control leg, and —
if the primary misses — the nearest miss (the seed that
came closest: a wave-3 attach, a wave-4 tale told one day
too late for a heard plan, a teller who died the day
before the attach). If the control shows <4 seeds with any
told wave-4/5 tale, the review will say so with the
per-seed supply table (the feasibility note above). No
re-scoring mid-run: the bars above are the judge.
