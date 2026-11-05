# Flee-when-losing probe — NO-GO (arm sim-staypolicy-a)

Run: fleshout-20261105T0915Z (Loop A). Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's next blank: the other half of the
finishing blank — does disengaging from a losing wild wave-4 fight
preserve fighters so the village gets more kill chances later?
Prereg: `evidence/2026-11-05/sim-staypolicy-a-prereg.md` (committed
BEFORE any judged sim). Instrument: `scripts/staypolicy-instrument-
20261105.js` (finishhold record shape verbatim). Driver:
`scripts/staypolicy-driver-20261105.js`. Analyzer:
`scripts/staypolicy-analyze-20261105.js`. Proof:
`scripts/test-staypolicy-20261105.js` 31/31 (re-run green after the
analyzer leg-fix; see Proof). Corpus:
`evidence/2026-11-05/perseed-staypolicy-a/` (16 files: 8 baseline +
8 armed, seeds 99241–99248, 150d, competent policy verbatim vs
flee-when-losing variant). 0 instrument errors on all 16 files.

## Verdict — NO-GO. Lever killed; policy file kept as a measurement tool only (see Keep decision).

Disengaging from a losing wave-4 TB fight saves scholars and still
fails the pre-registered kill bar — and the one armed kill is a
fight the variant never touched.

| | baseline | armed | bar |
|---|---|---|---|
| Wave-4 kill rate (matched kills / wild wave-4 fights) | 0/43 = 0% | 1/49 = 2.0% | armed ≥ 15% AND ≥ 3 kills |
| Wave-4 kills (matched) | 0 | 1 | ≥ 3 — **FAILED** |
| Wave-4 kills (kill-log rows) | 1 | 1 | — (see Day-boundary note) |
| Median survival | 74d | 77.5d | not worse by > 10d — passed (+3.5d) |
| Field-fight party deaths (vDie) | 8 | 7 | not up by > 25% — passed (−1) |
| TB fights | 23 | 23 | — |
| TB deaths | 21 | 16 | secondary |
| TB flees | 0 | 6 | secondary (the lever's channel) |
| TB damage fraction (median) | 11.1% | 7.3% | secondary |
| TB rounds (median) | 5 | 4 | secondary |
| Field fights | 20 | 26 | — (control channel) |
| Field flees / deaths | 12 / 8 | 19 / 7 | secondary (spillover read) |
| Trigger firings / exits | 0 / 0 | 17 / 6 | secondary |
| Wall: wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wall: wave-4 unlocks / faced | 4/8 / 4/8 | 4/8 / 4/8 | — |
| Wall: wave-5 unlocks / faced | 0 / 0 | 0 / 0 | — |
| Scholars living with a wave-4 kill at end | 0/8 seeds | 0/8 seeds | — |

Per-seed armed (fights / kills-matched / days): 99241 19/1/94,
99242 13/0/111, 99243 0/0/37, 99244 16/0/75, 99245 0/0/62, 99246
1/0/106, 99247 0/0/35, 99248 0/0/80. Baseline per-seed: 99241
17/0/80, 99242 10/0/142, 99243 0/0/37, 99244 15/0/68, 99245 0/0/62,
99246 1/0/106, 99247 0/0/35, 99248 0/0/80. Four of eight seeds never
reach wave 4 on either leg (99243, 99245, 99247, 99248 — all die at
wave 3, days 35–80).

## What the lever did — and why it still failed

The lever worked exactly as specified. The 50/50 trigger fired in 17
of 23 armed TB fights (74%), every firing on-spec (scholar HP 0.15–
0.49, monster HP 0.55–1.00 — no firing outside the line, verified
event by event). The scholar's TB flee count went 0 → 6, TB deaths
21 → 16, in-combat scholar deaths 59 → 56 (63 → 61 total). The
disengage is real: two scholars who entered a fight already hurt
(45–46% HP) fled on turn 1 and exited in one round, and four more
walked out mid-fight at 25–47% HP against monsters at 65–90%.

It did not convert. Exact accounting of the 17 firings: **6 exits,
5 sealed-fallback deaths, 6 died-mid-retreat.** The walk to the edge
is the killer: the trigger fires at below-half HP, but the edge is
up to 4 steps away, and at 25–48% HP the scholar usually dies on the
walk (one fired at turn 5 and died the same round; one fired at 15%
HP and died on the walk). The 5 sealed fallbacks fought it out after
the barrier refused the push and all 5 died — including a 16-round
congregation fight that dealt 51% of the monster's HP before the
scholar fell. Zero of the 17 fired fights ended in a kill.

And the one armed kill is not a conversion: seed 99241, day 86, a
suburb entered at 19 HP, finished in 1 round with 0 scholar swings
by a companion (visjoin_81) — a wounded-entry mop-up the trigger
never fired in (monster HP fraction was ~2%). The baseline's one
kill-log kill is the honest comparison: seed 99241, day 72, a 15-
round influencer fight, 8 swings, 100% damage, war_cry used,
companion kill by meera_reddy — a real fight the village won. It
scores 0 under the matched rule only because the kill was logged on
day 73, the day after the fight (see Day-boundary note). Log kills
are 1 → 1; matched kills are 0 → 1. Either way the bar (≥15%, ≥3)
is nowhere near met: the band would need ~7 kills at this fight
volume, and the lever produced a mop-up.

## Sense-testing (narration)

Read end to end: armed seed 99242, days 88–110 (8 firings, 5
exits). The village reads like people, not robots: deaths are
mourned with keepsake burial ("What Ivy kept close goes into the
ground with them"), succession hearings at the grave ("Ivy trusted
them. We saw it."), raids trample gardens and carry off the pantry,
hunger gnaws, scholars camp wild. Two scholars die the same day
(Ivy Wang + Daniyar, day 89) and the succession churn is narrated,
not silent.

Two narration findings, both honest:

- The disengagements DO have engine narration — the barrier-exit
  lines exist in game.js (`tbBarrierExit`: "🚪 BARRIER CROSSED — you
  crash through to a new area. It can't follow."; refusals: "You hurl
  yourself at the edge — the barrier holds. Sealed: no one leaves
  until this is decided." / "The known world ends here" / "no escape
  that way"). The exits read as a person choosing to live, with the
  chase honestly continuing on the next node for chasers. BUT the
  instrument's say-wrap regex (dead|died|...|killed|pack|scatter)
  never captured a barrier line, so the corpus cannot show a single
  exit in the transcript — a measurement gap, not a silent action.
  Next run's instrument should capture barrier lines so the refusal
  reason is readable (see Next blank).
- The mid-retreat deaths read as ordinary wild deaths — nothing in
  the transcript distinguishes "died while retreating" from "died
  fighting." That is the same gap: the retreat is narrated at the
  exit, not on the walk.

## Metric review

- The kill-rate GO was not reachable for a disengage lever at this
  damage×survival product: baseline TB median damage fraction 11.1%
  over ~5 rounds; a lever that leaves fights early can only cut
  deaths, never add damage. A scholar-survival or exits-per-firing
  threshold would have been the honest primary for a flee lever;
  the kill-rate bar judged the lever against a bar it could not
  move, and the survival guardrail correctly passed while the kill
  bar failed.
- The trigger fired where specified (17/17 on the 50/50 line) and
  the 50/50 line was arguably late, not wrong: 6 of 17 firings died
  on the walk, all below 50% HP. An earlier line (fire while HP is
  high enough to survive the 4-step walk) is the next variant to
  test — as its own arm with its own prereg, never a tune of this
  one. The sealed-fallback lump (5 deaths) also needs splitting:
  sealed-arena vs world-edge vs blocked-far-side are distinct engine
  refusals with distinct say-lines, and this arm cannot say which
  one killed the reunion fights (3 of the 5 sealed fallbacks are
  reunions, all on seed 99244).
- Day-boundary note: the strict same-day kill matching misses real
  kills when a fight spans midnight (baseline 99241: fight day 72,
  kill logged day 73). The matched rule is applied identically to
  both legs so the comparison stays fair, but absolute kill counts
  are undercounted by it. Do NOT change the rule mid-run; propose
  the ±1-day join for the NEXT run's prereg.
- The band was thin: 4 of 8 seeds never reach wave 4, and the whole
  pilot produced only 92 wild wave-4 fights (43 baseline, 49
  armed). The effect was visible anyway (TB flees 0→6, TB deaths
  21→16), but a confirm band would need seeds that actually reach
  wave 4 — the pilot NO-GO ends the arm before that spend, per the
  prereg.
- Field-channel spillover: field flees rose 12 → 19 while field
  deaths fell 8 → 7, on 20 → 26 field fights. The variant cannot
  touch field fights (Step 1); the movement is second-order
  (longer-lived villages fight more field fights) plus seed noise,
  not a lever effect. Reported, never re-scored.
- TB 'routed' ending: baseline seed 99242 has one TB fight ending
  'other' (outcomeRaw 'routed', 5 rounds, 21% damage) — the engine
  has a rout path distinct from 'fled'. It is the only baseline TB
  fight that did not end in death or kill-or-rout, and it is not
  counted as a flee anywhere. Noted for the instrument's ending map.

## Next blank (per the prereg's diagnostic-intermediates rule)

The diagnostic intermediates decide the next blank: **damage-per-
round or survivability-per-round, not the flee decision.** Flee-
when-losing proved the disengage works mechanically (6 exits, TB
deaths down) and still cannot create kills — the party deals ~7–11%
of a wave-4 beast's HP in the rounds it survives, and leaving early
only lowers that. The next lever must raise damage dealt per round
or survivability per round. Two follow-ups are recorded for the next
arm's prereg, neither run here: (a) an EARLIER disengage line (fire
while HP is high enough to survive the walk — the 6 mid-retreat
deaths are the evidence); (b) splitting the sealed-fallback lump
by refusal reason, with barrier lines captured in the instrument.
Do NOT re-run flee-when-losing at 50/50.

## Keep decision — policy file KEPT as a measurement tool

The policy file (`scripts/policies/flee-when-losing.js`) is NOT
deleted. Justification, per the brief's measurement-tool exception:
it is a proven-exact instrument (31/31 proof; 17/17 corpus firings
on the frozen line) and the only way to produce a scholar disengage
on demand; the next blank's follow-ups (an earlier trigger line, a
directional exit) are built by varying this file, not by rebuilding
it. It cannot affect play: it is not a default, not registered in
the panel registry, sets no env gates, and changes no game code.
No game-code change ever existed in this arm, so there is nothing
to revert. The coordinator may delete it if they disagree — the
deletion is one file, no other artifact depends on it except the
proof test (which would go with it).

## Balanced panel (§15)

Stated, not fabricated: no balance-panel compare is attached. The
panel's `scripts/sweep-compare.js` POLICY_REGISTRY is hardcoded and
throws `unknown policy` for unregistered names — a one-off probe
policy cannot run through it without editing the shared registry,
which is out of scope for a policy-side-only probe arm. The
before/after in this arm ran through the shared instrument/driver/
analyzer on identical seeds (the same discipline the sibling probe
arms used). The analyzer output above IS the compare.

## Telemetry deviation check (loop body step 10)

Attempted; the tool refuses recorder corpora:
`telemetry-check: refusing recorder-corpus input: all 16 --current
rows carry top-level anchorCommit, so they are sweep recorder rows,
not runs.` No LOUD lines (no compare ran). The baseline was NOT
rolled forward with `--update-baseline` — reseeding the shared
scale-wall baseline from this thin pilot band is a coordinator call.
Wall numbers are reported directly above, per the prereg.

## Files

- Prereg: 99934ab73. Policy + instrument + driver + analyzer +
  proof (31/31): d4b8c9dcb.
- Evidence + corpus (16 files, 0 instrument errors): this commit.
- Anchor commit for both legs: see per-seed `anchorCommit` in the
  corpus JSON (worktree HEAD at run time).
