# sim-retarget-a — hunt-lock upward retarget (finding #2720)

**Arm:** sim-retarget-a · **Loop A run:** fleshout-20261124T0715Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2720
**Type:** LEVER (one game-code change, flag-gated default-OFF) ·
**Base master:** `60f6e7436` · **Prereg commit (FROZEN_BASE):**
`75b19b2046b3734ccd9ea4a5ec1abc0ff3180acd` (evidence/2026-11-24/sim-retarget-a-prereg.md)
**Verdict: NO-GO at pilot — the lever fires (11 retargets, 0 defects)
but wave-4 kills FALL (19 vs 24). No confirm spend. Game code
reverted; nothing lands.**

## 1. Verdict against the frozen bars (pilot, 8 seeds/leg)

| # | Bar (frozen) | Control | Arm | Verdict |
|---|---|---|---|---|
| 1 | PRIMARY — retargets >= 5 (pilot arm leg) | 0 | **11** (9 wave-4, 2 wave-5) | PASS |
| 2 | PRIMARY — wave-4 kills arm > control (band totals) | 24 | **19** | **FAIL** |
| 3 | COST — starvation arm <= control + 2 AND median survival arm >= 0.8x control | starv 2, median 150 | starv 4, median 150 | PASS (starvation exactly at the +2 line) |
| 4 | DEFECT — 0 downward/sideways retargets, 0 suburb retargets | 0 | 0 | PASS |
| 5 | INSTRUMENT — proof test green, analyzer selftest green, 0 instrument errors | — | proof 66/66, analyzer 38/38, 0 errors, 0 tick mismatches | PASS |
| 6 | PILOT GATE — bars 1–5 on the pilot | — | bar 2 missed | **NO-GO at pilot** |

Per the frozen metric binding (MEASUREMENT.md §14): a miss is NO-GO,
never re-scored against a friendlier metric mid-run. The pilot gate
fails on bar 2 alone. No confirm band was run (prereg §7 step 3 runs
determinism + panel only "if it passes"). The balanced panel (§15)
was therefore not run — it is gated on a passing pilot the same way.

## 2. The numbers (pilot, band 109411–109418, 150d death-aware, competent verbatim)

| | Control | Arm |
|---|---|---|
| Retargets (locked-plan upward turns) | 0 | 11 (9 w4, 2 w5) |
| Defects (sideways/downward/suburb) | 0 | 0 |
| `planRetargets` stat (game code's own count) | 0 | 11 (agrees with the meeting rows) |
| Wave-4 kills (non-dup killCalls; == w4slainEnd sum on both legs) | 24 | 19 |
| Starvation deaths | 2 | 4 |
| Median survival (days) | 150 | 150 |
| Villages lost | 3 | 4 |
| Total deaths | 727 | 773 |
| Wave-4+ launches (v4departs + dawnbidDeparts) | 18 | 63 |
| Wave-4 meetings (classified / unclassified) | 162 / 0 | 140 / 0 |
| Bounced-hunt-lock (wave-4 meetings) | 35 | 47 |
| Gate-avoid-plan-exists (wave-4 meetings) | 36 | 35 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 reached (seeds) | 2 | 1 |
| Wave-4 reached (seeds) | 8 | 8 |

Per-seed wave-4 kills (control → arm): 109411 4→4, 109412 2→2,
109413 0→0, 109414 0→0, 109415 4→4, 109416 3→3, 109417 5→2,
109418 6→4. The arm never beats control on any seed (six ties, two
losses). The deficit is concentrated on the two seeds whose
trajectories diverged most (109417 −3, 109418 −2); the other six
seeds are identical or near-identical on kills. Seeds 109411 and
109415 are byte-identical between legs (days, deaths, standing all
equal) — the lever never fired there and the trajectories never
diverged, which is itself a neutrality signal: no retarget, no
difference.

## 3. What the lever did (it worked — the kills did not follow)

The design call (prereg §1): in `winPlanSeedFromFight`, when
PLANRETARGET=1 and the holder's plan is hunt/standing/table and the
met monster's wave is strictly greater than the plan's current wave
and >= 4, retarget target + needWave + node, keep stage, keep party,
bump `planRetargets`, speak a deterministic beat. Route: game code,
flag-gated default-OFF — a policy route is infeasible (the seed calls
fire inside engine fight routers, unreachable from a policy module).

All 11 retargets, arm leg (from the analyzer's meeting rows):

| Seed | Day | Holder | Met (wave) | Before | After |
|---|---|---|---|---|---|
| 109412 | 79 | hannah_kim | strike (4) | hunt, targetless, needWave 3 | hunt, strike, 4 |
| 109413 | 52 | catalina_reyes | eulogy (4) | hunt, targetless, 3 | hunt, eulogy, 4 |
| 109414 | 37 | wanjiru_kamau | congregation (4) | hunt, targetless, needWave null | hunt, congregation, 4 |
| 109416 | 37 | henry_zhang | strike (4) | hunt, terms_of_service, 3 | hunt, strike, 4 |
| 109416 | 40 | gen_tpfiibn | audit (4) | hunt, targetless, 3 | hunt, audit, 4 |
| 109417 | 80 | gen_1nrij6r | audit (4) | hunt, chorus_line, 3 | hunt, audit, 4 |
| 109417 | 121 | gen_y17ryop | eater (4) | hunt, buffering, 3 | hunt, eater, 4 |
| 109417 | 133 | lena_ruiz | cancellation (5) | hunt, eater, 4 | hunt, cancellation, 5 |
| 109417 | 138 | gen_1nrij6r | editor (5) | hunt, callback, 4 | hunt, editor, 5 |
| 109418 | 59 | gen_lg0v81o | reunion (4) | hunt, focus_group, 3 | hunt, reunion, 4 |
| 109418 | 59 | thabo_maseko | congregation (4) | hunt, gavel, 3 | hunt, congregation, 4 |

Spread: 10 holders on 6 seeds (not one-village driven). Six of the
eleven were the exact planform sense case — a targetless hunt plan
("had no trail"). All eleven came from expedition meetings
(agency-evade / agency-flee); zero from world-tick — the wild seed
block is vFlee-only and raid/aid-suppressed, so the expedition path
is where retargets live.

Departures followed the retarget: 9 of 11 retargets were followed by
launches on the new target (Hannah 109412 and Waman 109418 are the
two with zero later launches — their plans stayed hunt on the new
target but never went out). The wave-4+ launch count jumps 18 → 63
on the arm leg — partly definitional (once retargeted, a plan is
wave-4+ forever, so all its later departures count), but the
departures are real: Sierra (109417) launched 12 times after her
d80 retarget to the Audit, then twice more after her d138 retarget
to the Editor.

And then nothing. ZERO wave-4 kills were scored by a retargeted
holder after their retarget on the arm leg. The arm leg's single
retarget-holder kill (Lena Ruiz, d130, a Strike) happened BEFORE
her d133 retarget. On the control leg the same villager who
retargeted twice on the arm leg — Sierra (gen_1nrij6r), seed 109417
— killed an Algorithm on d123; on the arm leg she retargeted to the
Audit (d80) and the Editor (d138), launched 14 times, and killed no
wave-4 monster at all. The lever moves the plan and the departures
but not the outcome: the parties go out after the bigger beast and
come home without the kill — and the arm leg pays for the trips
(deaths 773 vs 727, villages lost 4 vs 3).

## 4. Sense-test (frozen §8) — Sierra's story, seed 109417

Sierra (gen_1nrij6r) on the arm leg. Day 80, out on expedition, she
meets an Audit and gives it room — and the fire hears her change her
mind:

> 📺 SYSTEM: "Sierra was hunting Chorus Line — but The Audit they
> just met is the bigger beast, the kind that makes veterans. The
> hunt turns to The Audit instead."

It reads as a person changing her mind for a named reason: the beast
she just met, bigger than the one she was hunting. She launches
after the Audit twelve times over the next two months. Day 121 Esi
turns to the Eater; day 133 Lena turns to the Cancellation; day 138
Sierra herself turns again, to the Editor:

> 📺 SYSTEM: "Sierra was hunting The Callback — but The Editor they
> just met is the bigger beast, the kind that makes veterans. The
> hunt turns to The Editor instead."

She launches after the Editor twice more. The village survives all
150 days at standing 375, reaches wave 5 — and Sierra kills no
wave-4 monster. On the control leg, the same Sierra, never
retargeted, kills an Algorithm on day 123 and her village scores 5
wave-4 kills to the arm leg's 2. The beat is honest; the hunt is
real; the kill is not there. The sense-test verdict: the retarget is
sensible as a decision and senseless as a lever — it sends people
after bigger beasts they cannot yet kill.

All eleven retarget beats survive in the corpus transcript
(`vetSays`, SAY_RE token "veteran"); the wording holds across all
eleven, targetless ("had no trail") and targeted ("was hunting
…") alike. Two knowledge-gated names to note for the voice record:
"Big-Eyes" for Buffering and "Big Loud" for the Focus Group are the
village's own names for those beasts, as the beat renders them.

## 5. Mechanism — why kills fell

The plan was never the binding constraint on the kill; it was the
binding constraint on the TARGET. Once the target moves, the next
constraint in line is the fight itself: a party that goes out after
a wave-4 beast must win a wave-4 fight, and nothing in this lever
touches party readiness, gear, or damage at that fight. The gate's
SEEK/outmatched rules still apply at each meeting, so the retargeted
parties are not walking into fights the gate forbids — they are
fighting the fights the gate allows and losing them (or fleeing
them: the arm leg's bounced-hunt-lock count ROSE 35 → 47 even as 11
retargets fired, because the retargeted plans keep meeting wave-4
monsters at the same wave and bouncing sideways off the lock, which
is the lock working as designed).

In short: the hunt-lock was the formation wall (planform DIAG-GO),
and the retarget pierces it — 11 turns, 0 defects — but the wall
behind it is the wave-4 fight itself. The finding moves downstream:
can launched parties WIN wave-4 fights. That is the same next step
the launchparty sense fix left behind in November (finding #2538):
the gate and the sense now agree on the party, the parties go out,
and the fights kill them.

## 6. Metric review (to fill at evidence time, never mid-run)

- Retarget spread: driven by 10 holders on 6 seeds, not one
  village — the GO bar's spread question answers well. The two
  no-launch retargets (Hannah, Waman) show a retarget does not
  guarantee a departure; 9/11 launched.
- Retargeted plans launched on the new target (9/11) — the
  planform B8 bucket (gate-avoid-plan-exists, 35–36 per leg) is NOT
  touched by this lever and stays the largest remaining formation
  bucket alongside no-call-aid (38 ctl / 12 arm — the aid share
  fell because trajectories diverged, not because the lever
  touches aid). B8 is now the named next formation wall; see the
  findings backlog append.
- Kill attribution: the (absent) kill gain does not come from
  retargeted holders — zero post-retarget wave-4 kills by any of
  the ten holders. The one control-leg kill by a future retarget
  holder (Sierra's Algorithm, d123) vanishes on the arm leg.
- The kill bar's noise: wave-4 kills run ~3/seed, so a 5-kill
  swing on 8 seeds is within noise for this event rate — BUT the
  direction is uniformly non-positive (arm never beats control on
  any seed; six ties, two losses), and the launches/deaths pattern
  corroborates a real non-positive rather than a coin flip. A
  re-judge on a 16-seed band would narrow the noise, not change
  the shape: the lever would need to show kills, and on this
  pilot it shows departures without kills.
- Starvation +2: the cost bar passed exactly at its line (4 vs
  2+2). The tolerance was set on a ~5-per-band base (planform had
  5 starvation deaths on 16 seeds); on an 8-seed pilot the base
  is 2 and +2 is a wide gate. A future cost bar should be set on
  the pilot's own base or as a rate, not an absolute +2.
- Median survival is a weak survival read on a 150d death-aware
  horizon (both legs median 150 — most villages survive the
  horizon). Villages-lost (3 → 4) and total deaths (727 → 773)
  carried the survival signal here, not the median.

## 7. Wall numbers (reported every run, never judged)

| | Control | Arm |
|---|---|---|
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 reached (seeds) | 2 | 1 |
| Wave-4 reached (seeds) | 8 | 8 |
| Median survival | 150 | 150 |
| Max survival | 150 | 150 |
| Villages lost | 3 | 4 |
| Total deaths | 727 | 773 |

The scale wall stands: national 0, table 0, wins 0 on both legs.
The retarget does not move it.

## 8. Instrument (bar 5 evidence)

- Proof test `scripts/test-retarget-a.js`: 66 passed, 0 failed
  (static lever checks; live unit U0–U9 incl. the flag-off
  old-code control, upward/targetless/needWave-null/4→5 retargets,
  sideways/downward/suburb holds, beat determinism + SAY_RE token,
  gear/party regression; analyzer band aggregates; D1
  repeatability + D2 recorder neutrality at 30d on seed 109411).
- Analyzer `scripts/analyze-retarget-a.js --selftest`: 38 passed,
  0 failed (taxonomy rows A1–B8/C plus retarget/defect fixtures
  R1–R9).
- Pilot corpora: 8/8 files per leg, 0 instrument errors, 0
  tick-gate mismatches, 100% wave-4 classification on both legs
  (162/162 ctl, 140/140 arm), 0 unclassified, 0 orphan seeds.
- Anchor: prereg commit `75b19b20` (driver FROZEN_BASE == HEAD at
  run time on both legs); lever code identified by `winPlanSha`
  on every corpus; substrate = planform §3 + PLANRETARGET=1 on
  the arm leg only; policy tableseat-nowait layers-off (competent
  verbatim) on both legs.
- Determinism/neutrality replays on the pilot seeds were NOT run:
  prereg §7 runs them only "if it passes" — the pilot did not
  pass. The proof test's D1/D2 (30d, seed 109411, ctl leg) stand
  as the instrument determinism evidence. The flag-neutrality
  correction (prereg §13) stands: unit-level U0 proves flag-off
  == old behavior.
- Balanced panel (§15): NOT run — gated on a passing pilot.

## 9. Convergence

scale-onramp: converging, NOT converged. The hunt-lock retarget is
killed at pilot: the lever pierces the formation wall (11 turns, 0
defects) but the kills do not follow, so the axis does not advance
on this lever. The wall moves downstream to the wave-4 fight
itself (finding #2538's open next step). The gate-avoid
plan-exists bucket (B8, 35–36/leg) is the remaining formation wall
for a future arm. No tracker update is owed beyond this evidence
(the axis line stays "converging"; the coordinator owns the
tracker write).

## 10. Closeout (what was reverted, what lands)

- Game code REVERTED: `src/js/win-plan.js` restored to HEAD
  (`git checkout` of the lever: planretargetOn gate, retarget
  branch, retargetBeat, planRetargets stat — all removed; the
  hunt-lock early return is byte-identical to before). Verified
  `git diff HEAD -- src/js/win-plan.js` empty before commit. The
  proof test is lever-coupled by design (its static checks assert
  the retarget branch exists); it fails on the reverted code, as
  it should — it is a record of the proof, not a green-list test.
  No `check.js` run is owed on the revert: the net src diff is
  empty, and the proof test already ran green on the lever code.
- NOTHING lands in the game. The lever stays env-gated OFF and
  uncommitted in no tree: no flag default flips, no beat, no stat.
- Committed as the record (this evidence + prereg + analysis
  JSONs + legs logs + pilot corpora + instrument driver/analyzer/
  test, with the game code reverted): branch `sim-retarget-a`,
  head recorded in §11.
- Corpus: `evidence/2026-11-24/perseed-retarget-a-ctl/` (8 files),
  `evidence/2026-11-24/perseed-retarget-a-arm/` (8 files);
  analyses `evidence/2026-11-24/retarget-a-analysis-pilot-ctl.json`
  and `retarget-a-analysis-pilot-arm.json`; legs logs
  `retarget-a-legs-pilot-ctl.log` / `retarget-a-legs-pilot-arm.log`.

## 11. Branch head

Branch `sim-retarget-a`, head: (recorded at commit time — see the
evidence commit message; the prereg commit is `75b19b20`).
