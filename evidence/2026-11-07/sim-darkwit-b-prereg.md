# sim-darkwit-b — prereg (the dark-branch witness walk: measure it)

**Arm:** sim-darkwit-b (run fleshout-loop-b-20261108T0245Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js
preferred; zero default flips, no changes to any existing policy
file.** New wrapper policy `scripts/policies/competent-darkwit-b.js`
composing the proven ledger-dark road (`scripts/policies/
ledgerdark.js`, LEDGERDARK=1, required never edited) UNDER the
proven witness-first door drive (`scripts/policies/
competent-witnessdoor-b.js`, WITNESSDOOR_B=1, required never
edited). **Base:** master c9fea16ee (read fresh at run start,
2026-11-08T02:53Z). **Band:** pilot 53201–53208, confirm
53201–53212 (JUDGED comparison band reuse — see band note; the
substrate-move warning below is why the pilot judges the band
too). **Fallback band (pre-registered, not a re-scope):** if the
pilot baseline fails substrate sanity on 53201–53208, the pilot
re-runs on FRESH band 53701–53708 and the confirm on 53701–53712
(see band note). **Horizon:** 150d death-aware. **Policies:**
baseline = witnessdoor armed (`WITNESSDOOR_B=1`, `LEDGERDARK`
unset — walks witness LIGHT when offered and earned); armed =
the same substrate with `LEDGERDARK=1` added (the dark-ledger
road runs pre-table; the witness-first door rule is unchanged).
Both legs run through the NEW darkwit driver (same instrument,
ledger recording, modal-prompt capture) so the corpora are
comparable.

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, the light/dark axis earned
through play, the witness trial) and `docs/CONTESTS.md` (the show
is played, not rolled — the trial's beats are played through the
engine's real door-choice verb). **No canon is invented here.**
Every mechanism claim below is read from `src/js/table.js`
(`tableBranch`) / `src/js/table-witness.js` / `src/js/ledger.js`
and cited to it.

## The blank (from sim-witnessdoor-b)

The witness door is now fully measured on the LIGHT branch —
all seven doors walked on band 53201–53212 (witness entered
5/12, won 5/5) — but the DARK-branch witness walk is still
unmeasured: no dark walk fired on that band, as the witnessdoor
prereg predicted. THIS arm measures it: find a band/seed set
where dark-branch witness walks fire, or drive them with the
policy-side ledger-dark road, and measure offered / walked /
won, the cost bars vs the same-seed baseline, and the
transcripts (do the dark-branch beats narrate?). It also
follows up finding #1888 (witness beats 1–2 silent, defense
witnesses never testify) — see the #1888 section below.

**STEVE-CALL behind this arm (do not re-decide it):** only the
player chooses the village's path and who takes the seat (Steve
2026-10-26). This arm MEASURES whether a dark-branch witness
walk works, not whether bots should sit or which path a player
should take. The road + door drive are measurement instruments,
default OFF, policy-side only. They never pick a sitter, never
answer a seat-taker choice. Trial-by-combat stays for later
runs; this arm walks witness only.

## Band note (JUDGED comparison band reuse + substrate-move warning + fresh fallback)

Band 53201–53212 is named in these prior preregs (checked this
run by grep over `evidence/*/sim-*-prereg.md`):

- `evidence/2026-11-07/sim-doorwalk-b-prereg.md`,
  `sim-doorwalk-confirm-b-prereg.md`,
  `sim-feareddoor-b-prereg.md`,
  `sim-feareddoor-rejudge-b-prereg.md`,
  `sim-feaststopspend-b-prereg.md`,
  `sim-pairoverlap-b-prereg.md`,
  `sim-witnessdoor-b-prereg.md` — JUDGED there (witnessdoor:
  12-seed confirm, 5/5 doors entered, 5/5 won, on base
  a2e005cbe).

No standalone forbidden/contaminated band list file exists in
the goal hidden_files (the strings appear only as references
in `journey-crisis-r154-prereg.md` and `convergence-tracker.md`,
naming no 53xxx band); sim-findings.md names 53201 only inside
finding #1885/#1888 (see below). This run reuses the SAME band
deliberately so the before/after comparison runs on identical
seeds against the judged light-branch legs — BUT the band is
reuse, NOT fresh ground, and the reuse carries a warning:

**SUBSTRATE-MOVE WARNING (recorded before judging):** the
witnessdoor corpus was swept on base a2e005cbe. Master has moved
to c9fea16ee since (alien expansion 2bc17d793, journey r113
specialist ladder, pellet pass 685dc9ec4, mirror cap). A
pre-prereg diagnostic probe on this tip (seed 53201,
witnessdoor armed, driver-verbatim re-run to /tmp) shows the
village DYING d58 village-lost — lesser seat earned d39,
preview never ready, no sit — where the judged corpus had it
sitting d90 and winning. Finding #1885 (frozen band
53001–53008 trajectories collapsed after the xp-gear landing
50881fbf2: median 150→70d, sits 5/8→0/8; "do not lean on it
for the 53201–53212 confirm until the fix lands") says the
same collapse class is live. The old witnessdoor corpus is
therefore STALE and is NOT reused: BOTH legs are re-swept on
this tip. The pilot's substrate-sanity bar judges whether the
band is still live at all — if it fails, the run is NO-GO on
substrate and the dark drive is UNJUDGED (a DIAG outcome, not
a lever verdict).

**FRESH FALLBACK BAND (pre-registered):** 53701–53712. Checked
this run: zero hits for any seed 53701–53712 in any
`evidence/*/sim-*-prereg.md`, zero in `sim-findings.md`, zero
in `convergence-tracker.md`. (Neighbor bands are all taken:
53301–53312 pairoverlap confirm; 53401–53412 its named backup;
53501–53512 pairoverlap-rate confirm; 53601–53612 its named
backup.) If the pilot baseline fails substrate sanity on
53201–53208, the pilot re-runs on 53701–53708 (baseline +
armed) and the confirm, if the pilot goes, on 53701–53712.
The 53201 collapse is reported as a DIAG finding in the
evidence either way.

## Prior art — checked, not rebuilt blind

- `scripts/policies/ledgerdark.js` (2026-10-20,
  sim-ledgerdark-road, JUDGED GO): the dark-ledger road —
  refuse begs (+1 foodHoarded each), refuse aid begs, hoard
  take (~1200 kcal/day at Haven, pantry >15000), recruit a
  party member (d15–27), ONE betrayal (d28–60, betrayed +1,
  killed +3 if the victim dies). On the tribfloor substrate
  it flipped the food truth on 16/16 runs and walked
  beloved/dark 9/9. This arm composes it UNDER the witness
  drive; it is required, never edited.
- `scripts/policies/competent-witnessdoor-b.js` (2026-11-07,
  sim-witnessdoor-b, JUDGED GO): the witness-first door rule
  + first-option drain + conscript refusal. Required, never
  edited.
- `scripts/witnessdoor-b-driver-20261107.js` /
  `scripts/witnessdoor-b-analyze-20261107.js` /
  `scripts/build-witnessdoor-panels-20261107.js`: the driver /
  analyzer / panel-builder patterns this arm mirrors, with
  the ledger-recording and modal-prompt extensions below.

## Mechanism (engine-honest, from src/js/table.js + table-witness.js + ledger.js)

- The sit and the offer work exactly as in the witnessdoor
  prereg (`tableTakeSeat()` → `tableScene()` →
  `tableOfferPaths`, phase `'paths'`,
  `chooseTableOption('path:<id>')` → `tableStartPath`,
  branch read from the ledger via `tableBranch`, never
  overridden by the policy).
- `tableBranch('witness')` (table.js:534): shared dark signals
  killed>protected +2, betrayed>0 +2, foodHoarded>foodShared
  +1, broken>kept +2, edited+skimmed>routed +2; shared light
  protected>=killed && protected>0 +2, foodShared>foodHoarded
  +1, kept>broken +2, routed>edited+skimmed+delayed +1;
  witness-specific: exposed>=3 && protected>=killed → light
  +2; killed>protected → dark +2. Branch = dark iff dark >
  light.
- Ledger writers (ledger.js): `registerDeath` wrap —
  killerId==villagerId + kind 'villager' → killed +3;
  killerId==villagerId + kind monster/hostile + party present
  → protected +1. Beg-refused → foodHoarded +1
  (LEDGER_EVENT_DIMS). The witness prereq is unchanged
  (lesser+ seat AND ledger.exposed >= 3).
- **The flip condition (derived here, NOT a tuning excuse):**
  the road's betrayal writes killed +3 once; hoard + beg
  refusals flip the food truth (dark +1, light food −1);
  betrayal writes betrayed +1 (dark +2). If the road lands
  fully and killed>protected fires, dark = 2+2+2+1 = 7 vs
  light 0. If killed>protected does NOT fire (protected
  stays >= 3), dark = 2+1 = 3 vs light = 2 (protected) + 2
  (witness-light, exposed>=3 && protected>=killed) = 4 —
  LIGHT. So on this substrate the witness branch flips dark
  iff **protected <= 2 at sit** (given the betrayal lands
  and the food truth flips). The diagnostic probe (53201,
  d58, no sit): protected 25, killed 0, foodShared 24,
  foodHoarded 0 — light 5v0. Protected on this substrate is
  LARGE (the scholar's party monster kills), so a flip is
  predicted UNLIKELY on high-protected seeds and possible
  only on seeds that sit with protected <= 2. The pilot
  measures protected-at-sit per seed; the prediction is
  recorded here so the judged numbers are read correctly.
- The witness challenge on the dark branch (table-witness.js):
  beat 1 'cold' +2, beat 2 'let' −2 when killed>protected
  (the dark-dirty case), beat 3 dark 'blood' +2 /
  'disappoint' +0. Swing starts at 1 (docket) + 2 (gavel,
  dark grant) = 3. Under the frozen first-option drain:
  3+2−2+2 = 5 — the −1 tripwire is unreachable, so dark
  witness wins are expected on every dark entry, exactly as
  on light. 'silence' (the convict path) is never picked
  because it is never the first option. The beat picks are
  NOT tuned here.
- **#1888 mechanism (read from src/js/table.js:1279–1300,
  tableRunBeat / tableChoose — this reframes the finding,
  it does not fix it):** a beat's framing lines (`beat.say`,
  including the opening-charges text and the defense's
  witness testimony) are rendered into the MODAL PROMPT via
  `tablePrompt` — they NEVER pass through `Game.say`, so no
  day-record transcript can contain them. A beat CHOICE's
  `say` lines DO pass through `Game.say` (tableChoose) — the
  witnessdoor transcript missed 'cold'/'let' only because
  its `tableLines` filter regex matched neither ("You read
  them cold…", "You let them speak…"). The darkwit driver
  therefore captures BOTH channels: (1) a `tablePrompt` wrap
  recording the prompt HTML (stripped) + options at every
  beat — what the player actually sees, including testimony;
  (2) an extended `tableLines` filter covering the cold/let/
  cross/subpoena/silence/blood/disappoint choice lines. The
  #1888 follow-up is judged on those two captures: do the
  beats narrate, and do the defense witnesses testify in
  their own words — on dark walks if any fire, else on the
  baseline leg's light walks.

## The door drive (new file scripts/policies/competent-darkwit-b.js)

`withLedgerDark(WIT.witnessdoor, 'competent-darkwit-b', desc)`
— the ledgerdark road's `daily` (road verbs, then the
witnessdoor daily) and `fight` (betrayal-combat hook, then
the witnessdoor fight); `upkeep` passes through from the
witnessdoor wrapper (linkfeast upkeep + witness-door drive).
Env gates: `WITNESSDOOR_B=1` (door drive) and `LEDGERDARK=1`
(road) — BOTH default OFF; with `LEDGERDARK` unset the
policy delegates to the witnessdoor wrapper byte-identically
(pinned by the proof's determinism leg). Zero src/js, zero
changes to any existing policy file. The driver NEVER
overrides `tableBranch`, NEVER answers a `'seat:*'` option,
NEVER calls `tableOfferSeatTaker` / `tableChooseSeatTaker`.

**THE DOOR RULE / THE DRAIN RULE:** the witnessdoor prereg's
rules verbatim (witness-first; first-option beats, trial
never taken; finals first; downgrade re-applies
witness-first; dark conscript REFUSED; demand-price first).
Branches stay ledger-earned.

## Substrate — re-baselined on this tip (both legs)

The baseline leg (`perseed-darkwit-b-baseline/`) is the
witnessdoor armed leg (walks witness light) RE-SWEPT on
c9fea16ee — it is NOT a reuse of the witnessdoor corpus
(stale base; see the substrate-move warning). The armed leg
(`perseed-darkwit-b-armed/`) is the same substrate with
`LEDGERDARK=1`, same seeds, same base, same days.

**BAND RE-CHECK (runs first, before any judging):** the
pilot baseline leg runs first. If the substrate is dead on
the pilot band (0/8 sit — the #1885 collapse shape), the
pilot re-runs on the fresh fallback band 53701–53708 per
the band note above. The armed leg runs only after a
baseline leg passes substrate sanity AND the proof smoke leg
is green on a baseline sat seed.

## Staged run (pilot gate, §9–12)

**PILOT (8 seeds, before/after):** judged on its own frozen
bars before ANY confirm spend. Pilot GO bars: dark-branch
witness entered ≥ 2/8 armed AND (armed − baseline
dark-witness-entered) ≥ 2 AND substrate sanity (baseline
lesser ≥ 2/8 AND sat ≥ 2/8) AND the replacement guard below
AND the cost bar on the 8 pilot seeds. **If the pilot
cannot produce a dark walk at all, that is a DIAG finding
in itself** — document the search (which bands/seeds were
tried, the protected-at-sit values, why no dark walk
fired) and do NOT re-scope mid-run. **CONFIRM (12 seeds,
before/after):** runs only on pilot GO, on the pilot's band
(53201–53212, or 53701–53712 if the fallback fired). The
confirm corpus is the judged corpus; the pilot corpus is a
separate, earlier 8-seed run and is not folded into the
confirm numbers.

## Primary metric (frozen — confirm)

**Dark-branch witness doors entered ≥ 4/12 armed AND (armed
dark-witness-entered − baseline dark-witness-entered) ≥ 3 on
identical seeds.** "Entered" = a seed on which
`tableStartPath` ran via the witness drive for path
`'witness'` with branch `'dark'` (phase `'paths'` →
`'challenge'` with path witness + branch dark, recorded in
the driver's `doorVerbMsgs` + the policy's `walked` list +
cross-checked by the analyzer). "Won" = the seed ends
`won:true` with the walked dark witness door as the winning
path (final answered on witness, no downgrade away from it).
The baseline leg is expected to show dark witness entered
0/12 (the road is OFF in the baseline — the RED-phase pin,
live; a baseline dark walk would mean the substrate itself
reads dark, which the analyzer reports separately if it
ever fires).

**Dark witness wins (secondary with an expectation, not a
gate):** dark witness wins ≥ 3/12 armed is expected (the
mechanism section shows the tripwire unreachable under this
drain) and is reported in the evidence. If entered passes
its bars but wins fall short, the verdict is GO on the
frozen header but the evidence flags the win shortfall
loudly and the landing call goes to the coordinator.

**Substrate sanity (frozen, untestable-if-failed):** the
baseline leg must earn lesser seats on ≥ 4/12 seeds AND sit
on ≥ 4/12 seeds (2/8 pilot). If either fails, the run is
NO-GO on substrate and the dark drive is UNJUDGED — the
substrate moved under the arm, not the drive.

## Cost bar (frozen — the sim-scalemetric shape, per the task brief)

- **Starvation deaths ≤ baseline + 2 total.**
- **Arm-only starvation ≤ 1** (seeds that starve in the armed
  leg but not in their own baseline leg).
- **Median survival (harness `days`, all seeds) armed ≥ 0.8 ×
  baseline median.**
- **Per-seed survival non-inferiority is RECORDED, not gated**
  (`(armed.won ? 150 : armed.days) >= baseline.days` per
  seed).
- **Betrayal-attributed villager deaths are RECORDED, not
  gated** (the road kills its recruit by design — the
  ledgerdark counters + the per-seed fallen list name the
  victim; the count is reported in the evidence as the
  road's honest price, but the frozen cost bar is
  starvation/median per the brief).

A primary hit that breaches the cost bar is NO-GO. A win can
never breach the cost bar.

## Substrate guard (frozen — REPLACEMENT guard; the witnessdoor exact-reproduction guard CANNOT apply)

The armed leg diverges from the baseline pre-sit BY DESIGN
(the road's verbs run from ~d15: beg refusals, hoard takes,
recruit, betrayal), so per-seed exact reproduction before
the first entry is unachievable and is NOT the guard here.
The replacement guard is fourfold, and the run is NO-GO if
any leg fails:

1. **Determinism (proof, pre-pilot):** darkwit with
   `LEDGERDARK` unset reproduces the witnessdoor armed leg
   byte-identically on a probe seed (proof leg D — the same
   determinism shape the ledgerdark road's FIDELITY=1 gate
   pins).
2. **Attribution:** every armed seed shows ledgerdark
   activity (`begsRefused + aidBegsRefused + hoardTakes +
   betrayalDone > 0`) OR a classified non-firing reason
   recorded by the analyzer (died before d15, exiled,
   `tablePreview` staged before the road could act,
   recruit/betrayal skipped with counters). An armed seed
   with zero road activity and no classified reason is a
   guard miss.
3. **Ledger trace:** the driver records the ledger vector
   (`killed/protected/betrayed/foodShared/foodHoarded/
   showmanship/might/exposed`) + `tableBranch('witness')`
   margins on every daily row, so the analyzer can show the
   branch margin at sit per seed and the armed-vs-baseline
   ledger delta. A seed whose sit-time branch cannot be
   reconstructed from its trace is a guard miss.
4. **Baseline shape:** the baseline leg passes substrate
   sanity (above) — it is the re-baselined witnessdoor armed
   leg on this tip, judged on its own shape, not on the
   stale corpus's numbers.

## Secondaries (frozen)

Dark witness offered per seed (branch read at the paths
offer, from the ledger trace) / dark witness entered per
seed (door, branch, day, rule) / dark witness wins per seed
/ light witness entered+wins per leg (baseline shape) /
finals reached / downgrades taken / conscript refusals /
trial-only skips / challenge beats answered / wins per leg,
national, wave 4–5 unlocks, median survival (all seeds, and
non-won, both reported — NEITHER is a gate beyond the
frozen median bar), pair days, starvation deaths per seed,
feast surge + foodDeeds per seed, links formed per seed,
days the run continues after an entry (modal-stall check),
per-seed entry lag (sit day → entry day, 0 by construction
— verify it), witness offered-but-unwalked per seed (must
be 0 in both legs by construction — verify it), ledger
vector at sit per seed (both legs), protected-at-sit
distribution (the flip-condition variable), road counters
per armed seed (begsRefused, hoardTakes/kcal,
recruitDone/day, betrayalDone/day/victim, betrayalSkipped).
Scale-wall numbers (national / table-sat / wins, wave 4–5
unlocks, median survival) reported every run.
**#1888 secondaries:** per walk (light or dark): beat
framing lines captured via the `tablePrompt` wrap (count of
prompt lines per beat; the defense's witness-testimony
lines quoted verbatim); choice say lines for cold/let
present in `tableLines` (yes/no per beat); whether the
defense witnesses testify in their own words (yes/no per
walk, with the lines).

## Judge

The run is judged against this header. A miss is NO-GO,
never re-scored against a friendlier metric mid-run. If a
metric proves wrong, write it under "metric review" and
propose the revision for the NEXT run. Every evidence file
carries a "metric review" section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the
witnessdoor panel-builder pattern
(`scripts/build-darkwit-panels-20261107.js`): panels built
from the two per-seed corpora (paired seeds, pseudo-policy
`'darkwit'`), scorecard compare, the compare `.md`
attached to the evidence file. Unlike witnessdoor, the legs
differ pre-sit by design (the road), so the panel is
expected to show NON-ZERO neutral deltas — the panel
measures the road's survival cost, and its verdict is read
with the frozen cost bar, not against a zero-delta
expectation. Telemetry deviation check:
`scripts/telemetry-check.js` REFUSES recorder-corpus input
by design (same refusal as witnessdoor/feareddoor) —
record the refusal, no LOUD line expected; zero src/js
changed, so no Game-telemetry baseline exists to deviate
from.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Tooling (new this run, committed before any judged sim)

- `scripts/policies/competent-darkwit-b.js` — the darkwit
  wrapper (`withLedgerDark(witnessdoor)`,
  `WITNESSDOOR_B=1` + `LEDGERDARK=1`, both default OFF).
- `scripts/darkwit-b-driver-20261107.js` — the driver
  (mirror of the witnessdoor driver; corpora
  `perseed-darkwit-b-baseline/` and
  `perseed-darkwit-b-armed/`, pilot corpora
  `perseed-darkwit-b-pilot-baseline/` and
  `perseed-darkwit-b-pilot-armed/`; ledger-vector +
  witness-branch recording on every daily row; a
  `tablePrompt` wrap recording beat framing lines +
  options; the `tableLines` filter extended with the
  cold/let/cross/subpoena/silence/blood/disappoint choice
  lines).
- `scripts/darkwit-b-analyze-20261107.js` — the analyzer
  (mirror of the witnessdoor analyzer; judges the frozen
  bars above — dark entered ≥4/12 AND margin ≥3, dark wins
  recorded, replacement guard 4-fold, cost bar starvation ≤
  baseline+2 / arm-only ≤1 / median ≥0.8× baseline,
  per-seed non-inferiority + betrayal deaths recorded;
  writes `/tmp/darkwit-b-analysis.json`, working copy).
- `scripts/build-darkwit-panels-20261107.js` — the panel
  builder (mirror of the witnessdoor builder; seeds per the
  judged band, corpora `perseed-darkwit-b-*`, run names
  `darkwit-baseline/armed`, out prefix `darkwit-panel`).
- `scripts/test-darkwit-b-20261107.js` — the proof
  (RED gate-OFF, GREEN fixtures incl. ledgerdark
  composition + the darkwit door rule, COMPOSITION
  exactly-once fixtures on a real loaded game, LIVE
  neutrality on a probe seed (LEDGERDARK unset reproduces
  witnessdoor armed byte-identically), LIVE SMOKE on a
  baseline sat seed with LEDGERDARK=1 (the road runs: beg/
  hoard/recruit/betrayal counters move, no stall), ANALYZER
  pure-function fixtures incl. darkWin and its
  downgrade-negates variant + the replacement-guard
  attribution fixture).

## Proof (before any judged sim)

`scripts/test-darkwit-b-20261107.js`: sections A/B/C/E
green BEFORE the baseline leg; the live neutrality legs (D)
green before the baseline leg; the live smoke leg (D2) green
before the ARMED leg (it needs a sat seed, which only the
baseline leg can name — the baseline leg is the band
re-check, not the judged comparison). check.js --quick NOT
required: zero src/js in this arm.
