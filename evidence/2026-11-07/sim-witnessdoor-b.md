# sim-witnessdoor-b — the witness-door arm: walk witness when offered (GO)

**Arm:** sim-witnessdoor-b (run fleshout-loop-b-20261107T1830Z, adopted
20261107T2030Z after the parent run died; axis scale-onramp /
winnability chain) · **Policy-side only, zero src/js, zero default
flips, no changes to any existing policy file.** New wrapper policy
`scripts/policies/competent-witnessdoor-b.js` composing the
witness-first door rule onto the doorwalk policy.
**Prereg:** `evidence/2026-11-07/sim-witnessdoor-b-prereg.md` (frozen
bars judged here, never re-scored). **Band:** 53201–53212, JUDGED
comparison band reused deliberately (see prereg band note — comparison
reuse, NOT fresh-ground confirmation). **Horizon:** 150d death-aware.
**Policies:** baseline = doorwalk rotation (`DOORWALK_B=1`,
`WITNESSDOOR_B` unset); armed = same substrate with `WITNESSDOOR_B=1`
(witness walked when offered and earned, else the rotation exactly).

## Base judged on — rebase + re-sweep (read this first)

The predecessor's tree was cut on master **c88df9d25** with a pilot
corpus swept there; master had moved to **a2e005cbe** by adoption time
(24 commits). The movement was judged **substrate-relevant**, so the
frozen corpus was NOT judged stale — it was discarded and re-swept:

- `src/js/table.js`, `src/js/table-witness.js`,
  `scripts/policies/competent-doorwalk-b.js`, `scripts/sim-harness.js`:
  **zero changes** across c88df9d25..a2e005cbe.
- `src/js/game.js` (+11) + `src/js/food.js` (+15): journey-establishment
  r112 specialist-ladder fix — village work grants `foodXp`
  (butcher +1 per kill cleaned, preserver +1 per rack resolution) and
  `specialistSkill` now builds from zero (10 XP buys skill 1). Skill
  gates preservation duration ("keeps for weeks" vs "a couple of
  weeks") and butcher yield — that is the food-economy survival
  substrate this arm's cost bar measures (starvation, median survival).
  A survival-relevant `game.js` change, so per the adoption brief the
  corpus had to be re-swept, never judged stale.
- `src/js/conversation.js` (r153): dialogue-repeat fixes only
  (cross-key pool reset, opener-carried skip) — no survival mechanics.
- The sim-prodstore-a PLENTY-WEEK lever in the range was reverted in
  the same range (`game.js` byte-identical to master after the revert).

**Rebase:** branch rebased onto explicit master SHA `a2e005cbe`
(read fresh from the main tree immediately before rebasing; new tip
**a3c6bcfc4**, all 3 picks clean). Stale pilot corpora (base
c88df9d25) and the stale partial 9-seed full baseline were deleted
(untracked, regenerable from the committed driver) and re-swept on
the rebased tip. Proof re-run on the rebased tip: **33/33 green**,
then **38/38 with the LIVE SMOKE leg** (seed 53201 armed walks
witness@d90/light) before the armed pilot leg. Anchor recorded in
every per-seed JSON: `a3c6bcfc43f8`.

## Verdict — GO (pilot GO, confirm GO)

| Bar (frozen prereg) | Pilot (8 seeds) | Confirm (12 seeds) | Pass |
|---|---:|---:|---|
| Witness entered armed (≥2 pilot / ≥4 confirm) | 3/8 | **5/12** | yes |
| Margin over baseline witness-entered (≥2 / ≥3) | +3 (0 baseline) | **+5 (0 baseline)** | yes |
| Witness wins armed (expectation ≥2 / ≥3, not a gate) | 3/3 | **5/5** | yes |
| Substrate sanity: baseline lesser ≥2 / ≥4 AND sat ≥2 / ≥4 | 4 lesser, 3 sat | **8 lesser, 5 sat** | yes |
| Substrate guard (8/8 / 12/12 exact pre-first-entry) | 8/8 | **12/12** | yes |
| Cost: starvation ≤ baseline+2 (cap 8 / 9) | 6 vs 6 | **7 vs 7** | yes |
| Cost: arm-only starvation ≤1 | 0 | **0** | yes |
| Cost: median ≥ 0.8× baseline (floor 76 / 73.6) | 95 vs 95 | **92 vs 92** | yes |
| Per-seed non-inferiority (recorded, not gated) | 8/8 | **12/12** | yes |
| Witness offered-but-unwalked, armed (must be 0) | 0 | **0** | yes |

**Overall: GO.** The witness door is walked whenever it is offered
and earned (5/5 sits), and every walk wins (5/5, all light branch,
all through the engine's real door-choice verb, 5 answers each:
paths + 3 beats + final). The baseline rotation walked witness 0/12
while being offered it on 5/5 sits — the blank this arm was built to
fill is filled. All seven doors have now been walked on this band
across the door arms (defiant, assimilated, beloved, relay by the
rotation; feared by the feareddoor arm; witness here); only the dark
branches and trial-by-combat stay unmeasured.

## Before / after (confirm, identical seeds 53201–53212)

| Seed | Baseline door (day) | Armed door (day) | Witness? | Won? | Days | Starv. | W4 kills | Standing |
|---:|---|---|---|---|---:|---:|---:|---:|
| 53201 | defiant (d90) | **witness/light (d90)** | entered | yes | 90 / 90 | 0 / 0 | 1 / 1 | 199 |
| 53202 | — (no seat) | — (no seat) | — | no | 96 / 96 | 2 / 2 | 1 / 1 | 175 |
| 53203 | — (lesser, never sat) | — | — | no | 94 / 94 | 1 / 1 | 3 / 3 | 365 |
| 53204 | — (no seat) | — | — | no | 69 / 69 | 3 / 3 | 0 / 0 | 25 |
| 53205 | defiant (d103) | **witness/light (d103)** | entered | yes | 103 / 103 | 0 / 0 | 0 / 0 | 195 |
| 53206 | assimilated (d95) | **witness/light (d95)** | entered | yes | 96 / 96 | 0 / 0 | 6 / 6 | 199 |
| 53207 | — (no seat) | — | — | no | 150 / 150 | 0 / 0 | 0 / 0 | 150 |
| 53208 | — (no seat) | — | — | no | 72 / 72 | 0 / 0 | 2 / 2 | 175 |
| 53209 | — (lesser, never sat) | — | — | no | 82 / 82 | 0 / 0 | 0 / 0 | 199 |
| 53210 | — (lesser, never sat) | — | — | no | 69 / 69 | 1 / 1 | 2 / 2 | 199 |
| 53211 | beloved (d96) | **witness/light (d96)** | entered | yes | 96 / 96 | 0 / 0 | 1 / 1 | 199 |
| 53212 | relay (d90) | **witness/light (d90)** | entered | yes | 90 / 90 | 0 / 0 | 4 / 4 | 562 |

Days/starvation/w4-kills/standing are identical per seed in both legs
(the guard proves why: the legs differ ONLY in which door is picked
at the paths offer). Every sat seed was offered all six doors
(feared, beloved, witness, assimilated, defiant, relay); the baseline
took its assigned rotation door, the armed leg took witness-first.
Entry lag sit→entry is 0 on all 5 (by construction — verified). Days
after entry 0 on all 5 (a win ends the run the same day — no
modal stall). Finals answered 1/1 per walk; downgrades 0; conscript
refusals 0 (no dark branch walked, so no conscript was offered);
trial-only skips 0. Witness offered 5/5 sits in both legs;
offered-but-unwalked: baseline 5, armed 0.

## Scale-wall numbers (confirm, every run)

| Metric | Baseline | Armed |
|---|---:|---:|
| National scale | 0/12 | 0/12 |
| Table sat | 5/12 | 5/12 |
| Wins | 5/12 | 5/12 |
| Doors entered | 5/12 | 5/12 |
| Witness entered / won | 0 / 0 | **5 / 5** |
| Wave-4 unlock | 11/12 | 11/12 |
| Wave-5 unlock | 2/12 | 2/12 |
| Wave-5 faced (kills) | 0 (0 kills) | 0 (0 kills) |
| Lesser seats earned | 8/12 | 8/12 |
| Full seats | 0/12 | 0/12 |
| Median survival (all seeds) | 92d | 92d |
| Median survival (non-won) | 82d | 82d |

The wall stands where the doorwalk-confirm left it: villages reach
regional (12/12) and the lesser seat (8/12), win through it (5/12),
unlock wave 4 almost always (11/12) and wave 5 twice (53203, 53212 —
53212 fought 4 wave-5 monsters in its audit) — but national is 0/12,
full seats 0/12, and no wave-5 kill was ever banked on this band.
Walking witness changes which door wins, not whether the village
reaches the table: the binding constraint stays the scale on-ramp
(national / standing / wave-5 facing), not the door menu.

## Secondaries (confirm)

- Doors offered per sat seed: all six, every sit, both legs.
- Witness offered per seed: 53201, 53205, 53206, 53211, 53212 (5/5
  sits); entered 5/5 armed, 0/5 baseline.
- Witness wins per seed: 5/5 armed (all light branch; dark-branch
  witness stays unmeasured — no dark walk fired on this band, as the
  prereg predicted).
- Finals reached: 5/5 walks, first final `final:charges` every time.
- Downgrades: 0. Conscript refusals: 0. Trial-only skips: 0.
- Challenge beats answered: 5 per walk (paths + cold + let + public
  + charges); 25 armed answers total, 0 errors, 0 instrument errors
  in any leg.
- Pair days: 32 both legs. Feast surge used: 8/12 both legs.
  Food deeds: 8/12 both. Links formed: 50 both. Feasts hosted: 20
  both. Donated kcal: 89,945 both. W4 kills total: 20 both. W5 kills:
  0 both. End reasons identical per seed: 5 over-other (wins), 6
  village-lost, 1 survived-150d (53207, no seat ever).

## Sense test — the witness walk, read as a player would see it

Read all three pilot witness transcripts end to end (53201 d90,
53205 d103, 53206 d95) plus the confirm 53212 walk (d90, the
strongest village, standing 562). The walk reads sensibly as a
sequence: the Table is announced, the audit reads the run back
honestly (lesser seat, real wave counts — 53212's audit even names
"7 wave-4 and 4 wave-5 fought"), the Docket ability is granted
("Swing starts at 1"), the branch line matches the ledger ("The
protected outnumber the killed; the food truth was shared. The light
road is open."), the public-defense beat is voiced ("You refuse the
quiet. 'In public,' you say, 'or not at all.'"), the final reads the
charges, and the epilogue lands the theme ("Your own ledger sits in
evidence beside theirs. That's why it worked."). The win line is
plain and earned. **The walk is coherent — but two beats are
silent:** `beat:cold` (the opening charges) and `beat:let` (the
defense — "let the witnesses speak") produce NO narrative lines in
any of the four transcripts read. The defense's two witnesses never
testify in their own words, although TABLE.md canon says they do
("sampled by personality, testifying in their own words about YOUR
leadership"). A player walking witness sees audit → branch line →
one public line → final, with the trial's first two beats invisible.
Documented as a blank below and in `sim-findings.md`; not fixed
here — it is engine text in `table-witness.js`, outside this
policy-side arm, and tuning the drain was pre-registered as a
different lever. All four walks are textually identical apart from
audit numbers (first-option drain on light branch) — expected, but
it means the trial currently has no per-run texture beyond the audit.

## Village assessment — what the villages looked like

Twelve villages on one judged band, and the shape is familiar from
the doorwalk-confirm: the band splits into three kinds of village.
**The five that sat and won** (53201, 53205, 53206, 53211, 53212)
all earned the lesser seat, sat between d90–d103, and won the same
day through whichever door was picked — the door is a choice of
ending, not a test of the village. 53212 is the outlier worth
naming: standing 562 (nearly triple the next village), wave-5
unlocked, 4 wave-4 kills — the strongest village on the band, and
still only a lesser seat and a regional scale. **The three that
earned a lesser seat and never sat** (53203 d58, 53209 d59, 53210
d40) are the substrate's open wound: the seat was earned weeks
before the village died (d94, d82, d69), the preview never became
ready (`previewReadyDays` 0 on all three), and the sit drive never
fired a single attempt. 53203 is the sharpest case — standing 365,
wave-5 unlocked, 3 wave-4 kills, dead d94 with an unearned-visit
seat in its pocket. The sit drive's preview gate, not the door menu,
is what strands these villages. **The four that never earned a seat**
(53202, 53204, 53207, 53208) died or survived without ever reaching
the table: 53204 collapsed d69 at standing 25 with zero wave-4
kills; 53207 alone survived the full 150 days at standing 150 with
no seat — a village that endures without ever being invited. Deaths
are honest (6 village-lost, starvation 7 across both legs, identical
per seed) and the witness arm adds none of them.

## Blanks filled / documented

- **Filled (this arm):** the witness door is walked and wins — the
  last of the seven doors never walked is now measured: 5/5 entered,
  5/5 won, all light, guard 12/12, cost bar clean. The policy
  (`competent-witnessdoor-b.js`, default OFF) is the instrument;
  landing it changes no default behavior.
- **Documented, not fixed:** (1) witness beats 1–2 narrate nothing
  and the defense witnesses never testify in the transcript
  (see sense test; `sim-findings.md` line appended). (2) Three
  lesser-seat villages never sit because the table preview never
  becomes ready — the sit-drive preview gate strands earned seats
  (53203/53209/53210; same pattern in the judged doorwalk-confirm
  corpus). (3) Dark-branch witness and trial-by-combat stay
  unmeasured — no dark walk fired on this band.

## Panel (§15) + telemetry

- Balanced panel built from the two confirm corpora
  (`evidence/2026-11-07/witnessdoor-panel*`): 12 paired cases,
  decision **review_required**; every observed contract metric has
  paired delta 0 (win rate 0.4167 both legs, national 0 both,
  village deaths 61.08 both, community loss 0.5 both) — the panel
  measures the neutral before/after, exactly as expected for a
  policy-side door-pick change with identical pre-entry trajectories.
  The door metrics come from this arm's own driver corpora, not the
  panel. Compare `.md` attached: `witnessdoor-panel.md`.
- Telemetry deviation check: `scripts/telemetry-check.js` **refuses**
  recorder-corpus input by design ("all 12 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not
  runs") — the same refusal as sitstep2/feastdrive/takeseat/doorwalk
  pilot/feareddoor. No LOUD line; zero src/js changed, so no
  Game-telemetry baseline exists to deviate from.

## Metric review

The frozen header judged cleanly and no metric proved wrong, so no
re-score and no revision is proposed from this run — but three notes
for the NEXT run's prereg, recorded here rather than acted on:

1. **The win-delta clause is correctly absent.** As the prereg
   predicted, both legs win 5/5 sittings, so any armed-wins-over-
   baseline-wins gate would have been unreachable (the feareddoor
   run's miss, deliberately avoided here). Witness-wins-vs-baseline-
   witness-wins (5 vs 0) is the right primary shape for door arms
   whose baseline already wins.
2. **The cost bar's median is near-vacuous on this design** (92 vs
   92, identical by construction — both legs win the same sittings
   on the same days). It guards against a catastrophic regression,
   not a real tradeoff; the binding cost signals are starvation
   (identical here) and the per-seed non-inferiority table, which
   is the more sensitive instrument and should stay recorded.
3. **The substrate-sanity bar counts seats earned, but the run's
   real substrate question is seats SAT.** Three of eight lesser
   seats never sat (preview never ready). A future arm that wants to
   measure the table should consider a sat-rate sanity bar, or a
   dedicated preview-gate diagnosis arm — the door arms cannot see
   it, because they only act after the sit.

## Convergence state

**converging** (axis scale-onramp). The door menu is now fully
measured on this band — all seven doors walked, all won when
entered. The axis does not converge on doors: the binding constraint
remains national scale / standing / wave-5 facing (0/12 national,
0/12 full seats, 0 wave-5 kills), plus the preview gate stranding
earned lesser seats. Next work on this axis belongs to the scale
on-ramp and the sit-preview gate, not to another door.

## Evidence + corpora

- Evidence: `evidence/2026-11-07/sim-witnessdoor-b.md` (this file)
- Prereg: `evidence/2026-11-07/sim-witnessdoor-b-prereg.md`
- Pilot corpora (8 seeds, rebased tip): `perseed-witnessdoor-b-pilot-baseline/`,
  `perseed-witnessdoor-b-pilot-armed/`
- Confirm corpora (12 seeds, judged, rebased tip):
  `perseed-witnessdoor-b-baseline/`, `perseed-witnessdoor-b-armed/`
- Panel: `evidence/2026-11-07/witnessdoor-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`)
- Tooling (committed before any judged sim, rebased clean onto
  a2e005cbe): `scripts/policies/competent-witnessdoor-b.js`,
  `scripts/witnessdoor-b-driver-20261107.js`,
  `scripts/witnessdoor-b-analyze-20261107.js`,
  `scripts/build-witnessdoor-panels-20261107.js`,
  `scripts/test-witnessdoor-b-20261107.js` (proof 33/33; 38/38 with
  LIVE SMOKE on seed 53201, rebased tip)
