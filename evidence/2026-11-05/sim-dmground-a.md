# Damage-per-round probe/build — NO-GO (arm sim-dmground-a)

Run: fleshout-20261105T0915Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's next blank: damage-per-round (the
finishhold prereg's diagnostic-intermediates rule). Prereg:
`evidence/2026-11-05/sim-dmground-a-prereg.md` (committed BEFORE
any judged sim). Instrument: `scripts/dmground-instrument-20261105.js`
(finishhold base + gearFull field). Driver:
`scripts/dmground-driver-20261105.js`. Analyzer:
`scripts/dmground-analyze-20261105.js`. Proof:
`scripts/test-dmground-20261105.js` 34/34 with the lever in (27/27
after the revert — the lever's gate fixtures were removed with it).
Corpus: `evidence/2026-11-05/perseed-dmground-a/` (16 files: 8
baseline + 8 armed, seeds 99201–99208, 150d, competent policy
verbatim).

## Verdict — NO-GO. Lever reverted, no trace in game code.

GEARFULL (wild wave-3+ field strikes use the full printed weapon
bonus instead of the halved fold-in) worked exactly as built and
still failed the pre-registered bar — and the kill movement it did
produce came through a channel the lever does not touch.

| | baseline | armed | bar |
|---|---|---|---|
| Wave-4 kill rate (matched kills / wild wave-4 fights) | 0/27 = 0% | 9/74 = 12.2% | armed ≥ 15% AND ≥ 3 kills — **FAILED on rate** (count met: 9) |
| Wave-4 kills (matched; log / unmatched) | 0 (0 / 0) | 9 (9 / 0) | ≥ 3 (met) |
| Median survival | 87d | 116d | not worse by > 10d — passed (+29d) |
| Field-fight party deaths (vDie count) | 2 | 13 | not up by > 25% — **FAILED on the letter** (see guardrail note) |
| Field fights | 4 | 33 | — |
| Field damage fraction (median) | 4.3% | 3.4% | secondary |
| Field rounds (median) | 2 | 2 | secondary |
| Field kills | 0 | 0 | secondary |
| TB kills (matched) / TB fights | 0 / 23 | 9 / 41 (22.0%) | secondary (lever does not touch TB) |
| TB damage fraction (median) | 9.0% | 30.9% | secondary |
| GearFull fire rate (armed field fights) | 0/4 | 33/33 (100%) | secondary |
| Wall: wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wall: wave-4 unlocks / faced | 6/8 / 4/8 | 6/8 / 6/8 | — |
| Wall: wave-5 unlocks / faced | 0 / 0 | 0 / 0 | — |

Per-seed armed (fights / kills / days): 99201 9/0/116, 99202
20/4/136, 99203 10/1/104, 99204 17/1/150 (survived), 99205 0/0/53,
99206 6/0/116, 99207 12/3/127, 99208 0/0/38. Baseline per-seed:
99201 0/0/78, 99202 10/0/131, 99203 0/0/104, 99204 9/0/96, 99205
0/0/53, 99206 1/0/150 (survived), 99207 7/0/76, 99208 0/0/38.

## What the lever did — and why it still failed

The lever worked as built. Gate fixtures (34/34, run live before
the armed pilot) proved it fires exactly where specified — wild
wave-3+ fights, never wave 1–2, sealed, or cornered — and a machete
leader strikes 39–43 gated vs 22–26 halved, a hunting-spear ally
34–38 gated. On the armed leg it fired in 33 of 33 field fights
(100% of recorded wild wave-4+ field fights; wave-3 fights are not
recorded by the instrument, so the wave-3 fire rate is unmeasured).

It did not convert in the channel it touches. Field kills stayed
0/33, and the field damage fraction median went DOWN (4.3% → 3.4%)
despite per-swing damage rising ~1.7×. The reason is mix, not a
broken lever: the armed leg's villages lived longer and sent out far
more wild fighters (33 field fights vs 4), and most of them were
weak — 11 of 33 fights lasted 1 round, 9 dealt zero damage, median
fighter weapon bonus 12 (sharpened sticks and clubs; one 120-bonus
outlier). A bigger swing in a 1-round fight is still one swing. The
field channel cannot kill a wave-4 beast at any honest per-swing
magnitude: the twoblow committed finish fired 0/33 times armed
(0/4 baseline) — two full-bonus strikes (~80) never approach
850–1500 HP — and no field fight was ever in a winning trajectory
(everWinning 0/33).

The 9 kills all came from the TB channel, which the lever does not
touch — and that is the run's real finding, not a spillover artifact
to wave away: **kills are finishes of ground-down beasts, not
duels.** All 9 TB kills entered at a median 14% of the monster's
def-max HP (vs 61% for TB non-kills); 5 of 9 entered below 15%.
The seed-99203 eulogy chain shows the mechanism in the numbers: one
eulogy fought across eight fights — field 900→146, field 773→39,
TB 509→89, TB 420→48, TB 372→267, TB 105→46, TB 59→28, TB 31→KILL
on day 100 — each fight's entry roughly the previous fight's exit,
until the scholar finishes a 31-HP beast. Seed 99207's eulogy
(675→675→450, field 211→82, TB 145→47, TB 98→43, TB 55→KILL) and
seed 99204's (field 153→0, TB 153→KILL) tell the same story. The
field lever contributes bites to the grind, but the kills are TB
finishes of beasts the whole village — field fighters and scholar
together, across days — wore down. The baseline band's 0 kills in 27
fights is the thin, unlucky side of the same coin (the finishhold
band's baseline TB rate was 10/55 = 18%): on this band the grind
never reached a finish.

## Guardrail note (count vs exposure)

The field-death guardrail as written is a COUNT: baseline 2 →
armed 13, +550%, FAILED on the letter. But the count is
exposure-confounded: field fights rose 4 → 33 because armed
villages lived longer and met more beasts. The death SHARE fell
(2/4 = 50% → 13/33 = 39%), joined fights' death share fell with it
(0/2 → 2/16), and median survival IMPROVED by 29 days. The
guardrail's intent — the lever must not get parties killed — is not
supported by the rates; its letter fails only because the denominator
grew. The verdict does not hinge on this reading: the primary rate
(12.2% < 15%) already decides NO-GO, and no re-scoring is attempted.
The count-vs-rate form of this guardrail should be revised for the
next run (rate-based, or normalized per fight).

## Sense-testing (narration)

Read the seed-99203 armed say lines end to end (days 97–100, the
kill's week). The fiction reads coherently and grimly: the village
loses a person a day (Dale, Zoltan, James, Luke, Lina — each named,
keepsakes buried, graves dug by the fire, a succession speech at the
grave: "Dale trusted them. We saw it. Give them the fire's
hearing."), raids hit four times in one night (each named, directed,
and costed), and Dmitri Sokolov finishes the eulogy on day 100. The
mechanics and the fiction agree: the village bleeds people to wear
the beast down, then finishes it. Two notes: (1) the day-100 kill
itself has no spoken triumph beat in the captured say lines — a
wave-4 kill, the village's first blood at that scale, passes
without a "we killed it" line surfacing (the instrument only
captures lines matching its death/fight regex, so a kill beat under
different wording may exist uncounted); (2) four raids in one night
(day 99: Emberhold, Stonebridge, Hungry Road, Hungry Road II) reads
heavy but each is distinct and honest about its cost. The Gear-full
log line itself lives in the field-fight record, not in spoken
narration — off-screen fights are not narrated line by line, which
is the existing convention, not a lever defect.

## Metric review

- The kill-rate GO was not reachable for a per-swing lever at this
  damage×survival product, even at the maximum honest application
  of gear: the best field fight dealt 170 damage in 3 rounds (seed
  99202, algorithm) against 850–1500 HP beasts, and the field
  channel's median stayed ~3–4% while 1-round fights dominated the
  mix. A damage-fraction threshold would have been the honest
  primary for a damage lever — but the field fraction did not move
  either (4.3% → 3.4%), because the mix moved more than the swing.
- The gearFull fire rate matched the recorded share (33/33 wild
  wave-4+ field fights). Wave-3 fights are outside the instrument's
  record, so the wave-3 fire rate is unmeasured — a gap for the
  next instrument revision, not for this verdict.
- 8 seeds / 150d gave enough wild wave-4 fights to judge the GO
  (27 baseline, 74 armed), but the baseline band was thin and
  barren (0 kills in 27 fights; two seeds never unlocked wave 4,
  two more faced none). The armed leg's 74 fights are the usable
  denominator; the 12.2% rate is 9 kills short of the 15% bar by 3
  kills (12 would have been needed at 74 fights). A confirm on a
  fresh band is NOT run: the pilot did not GO, and the field
  channel — the lever's own channel — is 0/33.
- TB spillover was real in count but is the wound-grind mechanism,
  not a TB mechanism change: kills entered wounded (median 14% of
  max HP), and the grind chains are legible fight by fight. The
  lever's field bites are part of the grind, but TB fights do the
  heavy lifting (single TB fights dealt 489 and 267 in the chains).
- The twoblow interaction flagged in the prereg was null:
  committedFinish 0/33 armed. Bigger strikes did not bring the
  two-blow window into reach at wave-4 HP.

## Prereg correction — strike-roll inventory (mechanism unchanged)

The prereg's "Where" says wbFull is "used in the two strike rolls."
The implementation uses it in FIVE weapon-swing rolls: the round
leader strike, the round ally strike, the ambush opening strike,
the contact-finish strike, and the Live Broadcast extra ally strike
— all read the same gated term (`rec.gearFull ? wbFull : wb`). The
volley keeps its own ranged term, untouched. The mechanism — the
leader's and the ally's strikes use the full printed bonus in wild
wave-3+ fights — is unchanged; the inventory in the prereg was
incomplete. The gate fixtures cover the round strikes (leader +
ally) and the ambush opening strike live; the contact-finish and
broadcast rolls share the identical gated term and were verified by
inspection + `node --check`, not by a dedicated fixture.

## Telemetry / balanced panel

- Telemetry check: attempted; the tool REFUSED the recorder corpus
  ("refusing recorder-corpus input: all 16 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not runs.
  Recorder corpora are compared with sweep-compare tables, never
  against a run baseline here."). No LOUD lines, no deviation to
  investigate — the tool declines this corpus shape. No
  `--update-baseline` was run (reseeding a baseline from a killed
  arm's corpus would be wrong). Wall numbers are reported directly
  above, never fabricated into a compare.
- Balanced panel (§15): no compare `.md` is attached. The panel's
  `compare` mode takes panel-generated `.json.gz` inputs produced by
  running the panel itself; it does not consume recorder corpora,
  and running a full panel comparison would be confirm-scale spend
  on a pilot that did not GO. Same limit as finishhold recorded.

## Next blank (per the prereg's diagnostic-intermediates rule)

**Survival / rounds-held, not per-swing damage — and the grind, not
the duel.** Full gear application is the maximum honest per-swing
lever, and the field channel still kills nothing: parties deal ~3%
of a wave-4 beast in ~2 rounds and die or flee. The kills that DID
happen were finishes of beasts ground down across many fights. The
next lever must attack one of: (a) the party's HP pool / rounds
held (survival per round — the other half of the damage×survival
product); (b) the grind itself — making the wound chain convert
faster (e.g. field fights that wound deeper per round held, or
beasts that stay wounded / do not recover between fights — verify
first whether entities heal between fights: seed 99207's eulogy
re-entered at 675 after a 489-damage TB fight, which suggests a
second entity or recovery, and the instrument cannot tell which);
(c) the TB channel's finishing power. Do NOT re-run a per-swing
damage lever: GEARFULL is the ceiling of that family, and it is now
measured.

## Revert

The game-code change is reverted in full: `src/js/fieldFights.js`
is byte-identical to its pre-lever state (verified: `git diff
<prereg-commit> -- src/js/fieldFights.js` empty). The lever's gate
fixtures were removed with it (they test the reverted lever). The
instrument, analyzer, driver, proof (27/27 after the revert),
prereg, and both corpora stay as the killed-verdict record. No gate,
price, deed-gate, readyDemand, VETSHAPE, flee/retreat, or food
change was made at any point; the arm-2 damage+staying toggle was
not touched.

## Files

- Prereg + instrument + driver + analyzer + proof: cc17440dd
  (landed before any judged sim).
- Lever commit (reverted by this commit): dd4c3e71 — kept in
  history so the killed verdict is auditable; its game-code change
  is fully undone by this commit.
- Evidence + corpora (16 files) + revert: this commit.
