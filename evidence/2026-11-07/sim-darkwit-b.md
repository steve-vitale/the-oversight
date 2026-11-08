# sim-darkwit-b — the dark-branch witness walk: NO-GO at pilot (DIAG)

**Arm:** sim-darkwit-b (run fleshout-loop-b-20261108T0245Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips, no changes to any existing policy
file.** New wrapper policy `scripts/policies/competent-darkwit-b.js`
composing the proven ledger-dark road (`scripts/policies/
ledgerdark.js`, LEDGERDARK=1) UNDER the proven witness-first door
drive (`scripts/policies/competent-witnessdoor-b.js`,
WITNESSDOOR_B=1). **Prereg:**
`evidence/2026-11-07/sim-darkwit-b-prereg.md` (frozen bars judged
here, never re-scored). **Band:** pilot 53701–53708 (FRESH
fallback — the 53201 band failed substrate sanity, see below).
**Horizon:** 150d death-aware. **Policies:** baseline =
witnessdoor armed (`WITNESSDOOR_B=1`, `LEDGERDARK` unset — walks
witness LIGHT when offered and earned); armed = the same
substrate with `LEDGERDARK=1` added (the dark-ledger road runs
pre-table; the witness-first door rule is unchanged).

## Verdict — NO-GO at pilot (DIAG: no dark walk fired; the road's cost bar also fails)

| Bar (frozen prereg, pilot) | Pilot (8 seeds) | Pass |
|---|---:|---|
| Dark witness entered armed (≥2/8) | **0/8** | no |
| Margin over baseline dark-witness-entered (≥2) | **+0 (0 baseline)** | no |
| Dark witness wins armed (expectation ≥2, not a gate) | 0/8 | — |
| Substrate sanity: baseline lesser ≥2/8 AND sat ≥2/8 | 5 lesser, 5 sat | yes |
| Replacement guard: attribution + ledger trace (8/8) | **8/8** | yes |
| Cost: starvation ≤ baseline+2 (cap 3) | 5 vs 1 | no |
| Cost: arm-only starvation ≤1 | **5** | no |
| Cost: median ≥ 0.8× baseline (floor 72.4) | 86 vs 90.5 | yes |
| Per-seed non-inferiority (recorded, not gated) | 4/8 | — |

**Overall: NO-GO at pilot.** The pilot cannot produce a dark
walk at all, and that is a DIAG finding in itself (per the
prereg): the search is documented below, no re-scope was
attempted, and no confirm was run. The dark-branch witness
walk stays unmeasured — but the search now says WHY, with
numbers, and the #1888 follow-up is answered decisively (see
the sense test).

## Why no dark walk fired — the search, in numbers

The prereg derived the flip condition before judging: the
witness branch flips dark iff **protected ≤ 2 at sit** (given
the betrayal lands and the food truth flips). The pilot
measured protected-at-sit on every seed, and the road's two
dark signals both failed on this substrate:

1. **Killed never moved (0/8 seeds).** The road's betrayal
   fired on 8/8 seeds (d28 on six, d29 on 53708, d40 on
   53703) — but the victim SURVIVED every time, so `killed`
   stayed 0 on all 8 seeds and the witness-specific dark
   signal (killed > protected, +4 total) never fired. The
   betrayal fight's honest outcome is that the victim begs,
   yields, or flees — the hostile AI's human endings — and
   on this substrate it did so 8/8 times. The road's
   `betrayed +1` (dark +2) landed everywhere; its `killed
   +3` landed nowhere.
2. **The food truth never flipped (0/8 seeds).** The hoard
   leg fired heavily — 5–34 takes per seed, 6,306–44,730
   kcal taken from the common pantry — but `foodHoarded`
   never exceeded `foodShared` on any seed (best 10 vs 13
   on 53702; worst 0 vs 27 on 53703, where 15 takes moved
   foodHoarded 0). The substrate shares far more than the
   road takes, so the food-truth signal stayed light (+1)
   everywhere.
3. **Protected is large everywhere.** Protected-at-sit on
   the baseline leg was 7–32 (the scholar's party monster
   kills); on the armed leg 5–25. The flip condition needed
   protected ≤ 2. The closest any seed came was 53704 armed
   (protected 5, killed 0) — still light 2v5.

Net branch margins at sit: baseline light 0v5 on all five
sittings (0v3 on 53701, which never sat); armed light 2v3
on 53701/53707 and 2v5 on the other six. The road moved the
margin by exactly its one reliable signal (betrayed +2) and
nothing else. A dark-branch witness walk on this substrate
would need either a betrayal that actually kills (the
victim must die, not yield — 0/8 here) or a village whose
scholar almost never kills in a party (protected ≤ 2 — the
lowest observed sit-time value on either leg is 5). Neither
is reachable with the proven road as it stands; a
multi-murder policy was NOT built mid-run (that would be a
re-scope, and a murder-spree lever is a design question for
Steve, not a measurement tweak).

## The 53201 band is collapsed on this tip (band re-check)

The pilot baseline on 53201–53208 (run first, before the
fresh band) reproduced the #1885 collapse shape exactly:
**sits 0/8, lesser seats 3/8, wins 0/8, median 73.5d**
(days 58/85/65/77/79/150/70/70). The judged witnessdoor
corpus had 5 sits and 5 wins on the same band. Per the
prereg's pre-registered fallback, the pilot moved to the
fresh band 53701–53712 (verified fresh: zero hits in any
`evidence/*/sim-*-prereg.md`, sim-findings.md, or the
convergence tracker). The 53201 pilot corpus is kept
(`perseed-darkwit-b-baseline/`, 8 files) as the collapse
record. The collapse is substrate movement between
a2e005cbe and c9fea16ee (the xp-gear landing 50881fbf2 per
#1885's bisect, plus the pellet pass and journey r113 in the
same range) — the door drive is exonerated: on the fresh
band the same drive sits 5/8 and walks witness 5/5.

## Before / after (pilot, identical seeds 53701–53708)

| Seed | Baseline door (day) | Armed door (day) | Dark? | Won? | Days | Starv. | W4 kills | Standing |
|---:|---|---|---|---|---:|---:|---:|---:|
| 53701 | — (no seat) | — (no seat) | — | no | 117 / 150 | 1 / 0 | 2 / 4 | 199 / 300 |
| 53702 | — (no seat) | — (no seat) | — | no | 74 / 116 | 0 / 4 | 0 / 0 | 199 / 100 |
| 53703 | witness/light (d90) | — (no sit) | — | yes / no | 90 / 82 | 0 / 0 | 8 / 3 | 585 / 215 |
| 53704 | witness/light (d90) | — (no sit) | — | yes / no | 91 / 55 | 0 / 0 | 4 / 0 | 280 / 179 |
| 53705 | — (no seat) | — (no sit) | — | no | 150 / 61 | 0 / 1 | 3 / 0 | 334 / 120 |
| 53706 | witness/light (d90) | — (no sit) | — | yes / no | 90 / 82 | 0 / 0 | 2 / 2 | 384 / 199 |
| 53707 | witness/light (d91) | **beloved/light (d90)** | — | yes / yes | 91 / 90 | 0 / 0 | 2 / 2 | 199 / 335 |
| 53708 | witness/light (d90) | **witness/light (d90)** | — | yes / yes | 90 / 90 | 0 / 0 | 3 / 4 | 249 / 324 |

Days/starvation/w4-kills/standing differ per seed between the
legs (the road perturbs pre-sit trajectories by design — the
replacement guard, not the witnessdoor exact-reproduction
guard). The road cost three wins outright (53703, 53704,
53706 went from wins to village-lost at d82/d55/d82) and
cost 53705 its 150-day survival (d61). The two seeds that
still sat won through whichever door was offered: 53707
walked beloved/light (witness was NOT offered in the armed
leg — exposed fell 3→2, because the road displaced the
fire-side lie-naming that builds exposures; the fallback
took beloved), 53708 walked witness/light again. Entry lag
sit→entry is 0 on both armed sittings. Days after entry 0
on both (a win ends the run the same day). Finals answered
1/1 per walk; downgrades 0; conscript refusals 0 (no dark
branch walked, so no conscript was offered); trial-only
skips 0. Witness offered-but-unwalked: 0 in both legs.

Road counters per armed seed (begs refused / aid begs /
hoard takes / hoard kcal / recruit / betrayal day):
53701 5/3/7/9,185/–/d28 · 53702 10/6/5/6,306/–/d28 ·
53703 0/0/15/21,057/d15/d40 · 53704 1/2/19/26,351/–/d28 ·
53705 4/2/13/17,587/d15/d28 · 53706 2/4/28/40,189/d15/d28 ·
53707 11/3/34/44,730/–/d28 · 53708 4/4/12/14,985/–/d29.
Road activity 8/8 (attribution leg of the guard); the
betrayal victim is named in the analyzer (53703's victim
ingrid_vik survived; the other seven victims likewise
survived — killed 0 on all 8, so no betrayal-attributed
villager death is recorded).

## Scale-wall numbers (pilot, every run)

| Metric | Baseline | Armed |
|---|---:|---:|
| National scale | 0/8 | 0/8 |
| Table sat | 5/8 | 2/8 |
| Wins | 5/8 | 2/8 |
| Doors entered | 5/8 | 2/8 |
| Witness entered / won | 5 / 5 | **1 / 1** |
| Dark witness entered / won | 0 / 0 | **0 / 0** |
| Wave-4 unlock | 8/8 | 8/8 |
| Wave-5 unlock | 5/8 | 4/8 |
| Wave-5 faced (kills) | 2 (kills) | 1 (kills) |
| Lesser seats earned | 5/8 | 6/8 |
| Full seats | 0/8 | 0/8 |
| Median survival (all seeds) | 90.5d | 86d |
| Median survival (non-won) | 117d | 82d |

The wall stands where the fresh band leaves it: villages
reach regional (8/8) and the lesser seat (5–6/8), win
through it when they sit — but national is 0/8, full seats
0/8, and no wave-5 kill was banked on either leg. The road
did not move the wall; it moved villages AWAY from the
table (sits 5→2, wins 5→2). The binding constraint stays
the scale on-ramp (national / standing / wave-5 facing),
and on this substrate the dark-ledger road is a cost, not
a key.

## Secondaries (pilot)

- Doors offered per sat seed: all six, every sit, both legs
  (53707 armed: witness not offered — exposed 2, see above).
- Witness offered per seed: baseline 5/5 sits; armed 1/2
  sits (53708 only).
- Witness wins per seed: baseline 5/5 (all light); armed
  1/1 (light).
- Finals reached: 5/5 baseline walks, 2/2 armed walks.
  Downgrades: 0. Conscript refusals: 0. Trial-only skips: 0.
- Challenge beats answered: 5 per walk (paths + cold + let
  + public + charges); 25 baseline + 10 armed answers, 0
  errors, 0 instrument errors in any leg.
- Protected-at-sit (baseline): 32, 17, 13, 12, 7 — the
  flip condition (≤2) was never close. Armed sit-time
  protected: 17 (53707), 18 (53708).
- Pair days: baseline 71, armed 24. Feast surge used:
  baseline 5/8 seeds, armed 6/8; foodDeeds per seed in the
  analysis. Links formed 36 both legs; feasts hosted 14
  both; donated kcal 75,870 baseline vs 53,297 armed.
  W4 kills total: baseline 25, armed 15. W5 kills:
  baseline 2, armed 1. End reasons: baseline 5 over-other
  (wins), 2 village-lost, 1 survived-150d; armed 2
  over-other (wins), 5 village-lost, 1 survived-150d.

## Sense test — #1888 ANSWERED: the beats DO narrate, the witnesses DO testify

Read all five baseline witness walks' captured prompts end
to end (53703 d90, 53704 d90, 53706 d90, 53707 d91, 53708
d90) plus the armed 53708 walk (d90, light). **Finding
#1888 is refuted as an engine defect and reclassified as an
instrument artifact.** What the witnessdoor transcript
could not see, the darkwit driver's `tablePrompt` capture
shows plainly — the beats narrate in the modal the player
actually reads, and the defense witnesses testify in their
own words:

- **Beat 0 (opening charges) narrates.** The prompt reads
  "OPENING — THE CHARGES. 3 exposures. Bribes, buried
  plots, rounding errors — the moots heard them first, and
  the moots remember." and then names the REAL kept-list
  entries: "Day 2 — Joyce named Omar: lied about their
  trade." / "Day 22 — Carolina named Joyce: lied about
  where they're from." / "Day 22 — Carolina named Joyce:
  lied about where they're from, confessed at the fire."
  (53703). The docket is the record, not vibes.
- **Beat 1 (the defense) narrates, and the witnesses
  testify.** The prompt reads "THE DEFENSE — calls YOUR
  villagers. ... Two of your own take the stand, and you
  don't control what they say." and then two distinct
  lines, sampled by personality, honest to the vector
  (protected > killed → the 'aided' case): 53703 — Jaxon:
  "I don't love them. But the pantry was full when it
  mattered. That's on the record." / Joyce: "They carried
  me out of the treeline when I couldn't walk. That's the
  whole testimony — the rest is paperwork." 53704 — Mabel:
  "They sat with me the night after. Didn't say much.
  Didn't need to." / Owen: the treeline line. 53706 —
  Vincent: the pantry line / Cheryl (blunt): "Cheryl kept
  us fed. I don't like them. I'd follow them anywhere."
  53707 — Elias: the night-after line / Hermann (trust
  ≥50): "I'd trust them with my kids' dinner. I HAVE
  trusted them with my kids' dinner." 53708 — Bill: the
  treeline line / Nolan: the kids'-dinner line. Two
  witnesses per walk, never the same pair of lines twice
  across the six walks read, never the sitter testifying
  about themselves.
- **Beat 2 narrates.** The prompt reads "THE SETTLEMENT —
  the judges confer, and then the eldest does something
  unprecedented: it offers a private settlement. Justice,
  or quiet. ..." (light branch; the dark 'THE CHANT' text
  stays unmeasured with the dark branch itself).
- **The choice lines ARE in the day record.** 'cold' ("You
  read them cold — no heat, no adjectives. The charges
  land harder for it. One of the judges flickers.") and
  'let' ("You let them speak. All of it. The courtroom
  respects nothing the way it respects a prosecutor who
  doesn't flinch at their own witnesses.") appear in the
  `tableLines` of all six walks read — the witnessdoor
  transcript missed them only because its filter regex
  matched neither phrase. The analyzer's narration read
  confirms it mechanically: 6/6 walks have beat0Opening,
  beat1Defense, beat2SettlementOrChant, testimonyLines 2,
  coldLine, letLine, and publicOrBloodLine all true.

Why the witnessdoor run read it wrong: `tableRunBeat`
renders `beat.say` into the modal prompt via `tablePrompt`
— those lines NEVER pass through `Game.say`, so no
day-record transcript can contain them. The finding's
"silent beats" were a transcript-filter artifact twice
over (prompt lines invisible to the day record + choice
lines invisible to the old filter). No engine change is
needed; the instrument fix (this arm's prompt capture +
extended filter) is the correction, and it is committed
with this run. Finding #1888 is updated in
`sim-findings.md` accordingly.

**Small observation (not a verdict):** on 53703's beat-0
prompt the same exposure appears twice — "Day 22 —
Carolina named Joyce: lied about where they're from." and
again with ", confessed at the fire." appended. The kept
list carries the confession as a second charge line for
the same event. A player reads it as a repeated charge,
not a second offense. Logged as a findings item; not
chased here.

## Village assessment — what the villages looked like

Eight villages on a fresh band, and the shape splits three
ways. **The five that sat and won in the baseline**
(53703, 53704, 53706, 53707, 53708) all earned the lesser
seat, sat on d90–91, and won the same day through
whichever door was picked — the door is a choice of
ending, not a test of the village. 53703 is the strongest
village on the band (standing 585, 8 wave-4 kills, wave-5
unlocked) and still only a lesser seat and a regional
scale. **The two that died without ever sitting** (53701
d117 with 1 starvation death, 53702 d74) earned no seat at
all — 53702 never got past standing 199 with zero wave-4
kills. **The one that endured without being invited**
(53705, survived the full 150 days at standing 334 with 9
exposures on the record) never sat: the seat was never
earned, so the table never called. Under the road, the
picture darkens honestly: the bearer refuses begs at the
fire (5–11 per village), loads the common pantry into
their own pack (up to 44,730 kcal on 53707), recruits a
companion and turns on them at d28 — and the village pays
for it in the open: three wins become village-lost
deaths, starvation appears on five seeds where the
baseline had one, and the two villages that still sit win
in spite of the road, not because of it. The road's price
is legible in the ledger (betrayed 1 everywhere, hoarded
5–11 against shared 10–95) and in the death record — a
dark road that costs the village its ending is honest
design, but it is not a witness-door key on this
substrate.

## Blanks filled / documented

- **Filled (this arm):** (1) the dark-branch witness search
  is measured and closed at pilot with the mechanism named:
  the road's betrayal never kills (0/8 victims died) and
  the food truth never flips (hoarded < shared 8/8), so
  the witness branch stays light 2v3–2v5 everywhere; the
  flip needs protected ≤ 2 at sit (lowest observed: 5).
  (2) #1888 answered: the beats narrate (modal prompt) and
  the witnesses testify (2 distinct lines per walk, 6/6
  walks) — the finding was an instrument artifact, and
  the instrument fix is committed. (3) The 53201 band
  collapse is re-confirmed on the current tip (0/8 sits)
  and the fresh band 53701–53712 is verified and used.
  (4) The darkwit instrument set is committed and proven
  (23/23 + corrected smoke 25/25): the ledger trace +
  prompt capture now exist for any future table arm.
- **Documented, not fixed:** (1) dark-branch witness and
  trial-by-combat stay unmeasured — no dark walk fired on
  either band tried. (2) The betrayal victim surviving 8/8
  times is the road's weak signal, not a defect to fix
  here — whether a betrayal SHOULD usually kill is a
  Steve-call about the hostile AI's mercy, not a
  measurement tweak. (3) The duplicate charge line on
  53703's beat-0 prompt (same exposure twice, once with
  the confession) — logged in sim-findings.md. (4) Three
  lesser-seat villages never sit because the table preview
  never becomes ready (53201 pilot: 53201/53203/53205) —
  the sit-drive preview gate strands earned seats (same
  pattern as the witnessdoor confirm).

## Panel (§15) + telemetry

- Balanced panel built from the two pilot corpora
  (`evidence/2026-11-07/darkwit-panel-pilot*`): 8 paired
  cases, decision **review_required**; win rate 0.625 →
  0.25 (paired delta −0.375, change_signal), community
  loss 0.25 → 0.625 (regression_watch), survival60 −0.125
  (regression_watch), national 0 both. The panel measures
  the road's survival cost, exactly as the prereg said it
  would — the legs differ pre-sit by design, so the
  non-zero deltas are the measurement, not an instrument
  failure. Compare `.md` attached:
  `darkwit-panel-pilot.md`.
- Telemetry deviation check: `scripts/telemetry-check.js`
  **refuses** recorder-corpus input by design ("all 8
  --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs") — the same refusal as
  witnessdoor/feareddoor. No LOUD line; zero src/js
  changed, so no Game-telemetry baseline exists to deviate
  from.

## Metric review

The frozen header judged cleanly and no metric proved
wrong, so no re-score and no revision is proposed from
this run — but three notes for the NEXT run's prereg,
recorded here rather than acted on:

1. **The primary's flip condition is now measured, not
   predicted.** The prereg derived "protected ≤ 2 at sit"
   from the branch math; the pilot measured protected-at-sit
   5–32 across 13 sittings on two bands. Any future dark
   arm should pre-register its flip mechanism against
   THAT distribution, not against the branch math alone —
   a road whose only killed source is one betrayal cannot
   move a protected count in the teens.
2. **The cost bar's starvation clause caught a real cost
   the median missed.** Median survival passed (86 vs
   90.5) while starvation failed 5 vs 1 and wins fell
   5→2. On a road that kills wins rather than days, the
   starvation + win-delta signals are the sensitive
   instruments; the median alone would have called this
   road cheap.
3. **The smoke gate was corrected pre-pilot (see the
   prereg correction note).** A smoke leg that asserts a
   sit on a trajectory-perturbing road is a category error
   — the pilot, not the smoke, measures sit rates. Future
   road arms should write their smoke gates that way from
   the start.
4. **The substrate-sanity bar did its job.** It caught the
   dead 53201 band before any armed spend and fired the
   pre-registered fresh-band fallback. The fallback band
   then passed sanity 5/8. Bands are not durable goods on
   this tree — re-check them every run.

## Convergence state

**converging** (axis scale-onramp). The door menu is fully
measured on the light branch and the dark branch is now
measured as unreachable-by-this-road on two bands; the
axis does not converge on doors. The binding constraint
remains national scale / standing / wave-5 facing (0/8
national, 0/8 full seats on the fresh band), plus the
preview gate stranding earned lesser seats. Next work on
this axis belongs to the scale on-ramp and the sit-preview
gate, not to another door — and any future dark-branch
attempt needs a different dark-driving mechanism (a
betrayal that kills, or a low-protected substrate), not
another run of this road.

## Evidence + corpora

- Evidence: `evidence/2026-11-07/sim-darkwit-b.md` (this file)
- Prereg: `evidence/2026-11-07/sim-darkwit-b-prereg.md`
  (with the pre-pilot smoke-gate correction note)
- Pilot corpora, 53201 band (collapse record, 8 seeds):
  `perseed-darkwit-b-baseline/` (RUN
  darkwit-pilot-baseline) — 0 sits, 0 walks
- Pilot corpora, fresh band 53701–53708 (judged):
  `perseed-darkwit-b-pilot-baseline-fresh/` (RUN
  darkwit-pilot-baseline-53701) and
  `perseed-darkwit-b-pilot-armed-fresh/` (RUN
  darkwit-pilot-armed-53701)
- Panel: `evidence/2026-11-07/darkwit-panel-pilot.md` (+
  `.json`, `-before.json.gz`, `-after.json.gz`)
- Tooling (committed before any judged sim; smoke-gate
  correction committed pre-pilot): `scripts/policies/
  competent-darkwit-b.js`, `scripts/darkwit-b-driver-20261107.js`,
  `scripts/darkwit-b-analyze-20261107.js`,
  `scripts/build-darkwit-panels-20261107.js`,
  `scripts/test-darkwit-b-20261107.js` (proof 23/23; 25/25
  with the corrected LIVE SMOKE on seed 53703, rebased tip)

## Coordinator correction — band freshness (added at landing, 2026-11-08)

The "FRESH fallback band 53701–53708" claim in the prereg and in this
file's header is WRONG for 3 of 8 seeds. Seeds 53704, 53707, 53708 were
used by sim-compvet on 2026-10-18 (`evidence/2026-10-18/sim-compvet.md`:
"Seeds: 8 fresh — 53704, 53707, 53708, ..."; judged corpus
`evidence/2026-10-18/perseed-compvet/`). The prereg's freshness check
grepped `evidence/*/sim-*-prereg.md` only; sim-compvet has no prereg
file, and its seed list lives in the evidence .md, which the check did
not cover — the seed-band skill requires dated screens to be searched
the same way. Missed source named here, per the skill. The other five
pilot seeds (53701, 53702, 53703, 53705, 53706) were not named in any
prereg or evidence .md found by the coordinator's check.

Verdict STANDS, unchanged: the finding is mechanistic, not comparative
— the flip condition (protected ≤ 2 at sit) was unmet on all 8 seeds,
killed stayed 0/8, and foodHoarded never beat foodShared on any seed
including the five genuinely fresh ones; the baseline sanity reproduced
(5/8 sits, 5/5 light witness walks won). No re-sweep: re-running on a
fully fresh band cannot change a 0/8 mechanism finding whose cause is
measured on every seed. The "fresh band" wording above is corrected to
"fallback band 53701–53708 (3 seeds previously used by sim-compvet
2026-10-18)".
