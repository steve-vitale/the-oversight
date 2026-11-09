# sim-medchannel-seed-a — MEDICINE-CHANNEL SEEDED-STASH MEASUREMENT (arm sim-medchannel-seed-a)

Run: oversight-flesh-out-loop, run fleshout-20261109T1815Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medchannel-a, branch sim-medchannel-a.
Substrate: worktree HEAD a81cb2d07 at prereg time; prereg
evidence/2026-11-09/sim-medchannel-seed-a-prereg.md committed as
785bda555 BEFORE any judged computation, with a correction commit
24c785b9 (seed-count miscount — see below) BEFORE the judged 8-seed
run. Policy: competent ONLY (scripts/policies/competent.js,
UNMODIFIED). Env: PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d
death-aware cap. Seeds: 95205–95212 (8 seeds). Zero src/js changes —
DIAG / measurement only.

## Verdict: NO-GO (DIAG)

The medicine channel does not fire even with a stocked pharmacy:
**0 medicine cures on the 8-seed seeded leg** (need ≥ 5). The pharmacy
held 20 antibiotics + 20 antiparasitic on every seed at day 1 and
still held 20 + 20 at the end of every run — not one dose spent, not
one medicine-cure line ever spoken. The before/after trajectories are
bit-identical (same days alive, same deaths, same ability cures per
seed): stocking the pharmacy changed literally nothing.

This is NOT a supply failure. It is a shadowing failure (see "Why it
never fired"): the ability channel is tried first in every cure
attempt, and the duty holder essentially always holds a curing ability
for the diseases that actually present. The channel's live firing
condition — a wound-fever/gutrot patient meeting a holder who holds NO
curing ability for that disease — never occurred in 8 seeds, 878
village-days, 225 NPC sick-days, 103 ability cures. The fix is not
more medicine. It is a design question (filed to the backlog below):
is this narrowness intended, or should medicine be reachable some
other way?

## Gates (prereg binding)

- G1 PRIMARY — FAIL. Medicine cures (seeded) = 0 (need ≥ 5). Clean
  sub-conditions all pass: alien-pool medicine cures 0, trembles 0,
  table violations 0, anomalies 0; dose balance reconciles
  (removed 0 = cures 0 + non-duty takes 0).
- G2 GUARDRAILS — PASS. Median survival seeded 132d vs 0.8× before
  105d; starvation deaths seeded 2 vs before+2 = 4.
- G3 BALANCED PANEL (§15) — PASS. Compare
  evidence/2026-11-09/medchannel-seed-a-panel-compare.md: decision
  `review_required`, zero `regression_signal` / `regression_watch`
  lines, 20 `no_material_signal` rows, every paired delta 0. The two
  panels are identical by construction on a zero-src/js arm (the panel
  cannot express the driver-side seeder); its role here was confirming
  the source carries no regression, which it does.
- G4 PROOF — PASS. scripts/test-medchannel-seed-a.js: 21 passed,
  0 failed (seeder, live medicine cures both kinds, doses decrement
  only on a cure, classifier incl. trichinosis, dose-balance join,
  recorder neutrality on seed 95205 150d seeded, corpus integrity).

## Before / after (identical seeds 95205–95212, competent, 150d)

| Metric | Before (unseeded) | Seeded (20+20) |
| --- | --- | --- |
| Medicine cures | 0 | 0 |
| Ability cures | 103 | 103 |
| Median survival | 132d | 132d |
| Max survival | 150d | 150d |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave 4 unlocks | 8/8 | 8/8 |
| Wave 5 unlocks | 4/8 | 4/8 |
| Starvation deaths | 2 | 2 |
| Duty-held share | 81.0% (711/878 village-days) | 81.0% (identical) |
| Pharmacy doses day 1 | 0 + 0 | 20 + 20 every seed |
| Pharmacy doses at end | 0 + 0 | 20 + 20 every seed |
| Doses spent | 0 | 0 |
| Stash medicine takes | 0 | 0 |

Per-seed (before = seeded on every seed — trajectories identical):
95205: 67d, ab 16; 95206: 70d, ab 1; 95207: 85d, ab 16; 95208: 137d,
ab 24; 95209: 89d, ab 12; 95210: 132d, ab 9; 95211: 150d survived,
ab 23; 95212: 150d survived, ab 2. Deaths per seed identical too
(13/8/19/18/9/18/16/9). End reasons: 6 village-lost, 2 survived.

## Why it never fired (the finding)

`medicDutyCureAttempt` tries channel 1 (ability) before channel 2
(medicine) in the same call, and returns on the first cure. Medicine
fires only when the ability channel FAILS for that patient — i.e.
the holder holds no ability that cures that disease (with the
diagnosis gate where it applies). Two facts together close the door:

1. **Holders always hold a cure.** Of the 103 ability cures, 96 were
   by holders holding all three abilities (herbal_remedy,
   field_medicine, triage), 5 by herbal-only holders, 2 by
   field+triage holders curing wound_fever (field_medicine cures it).
   101/103 holders held herbal_remedy, which cures both reachable
   diseases (wound_fever and gutrot). No wound-fever patient ever met
   a holder without a curing ability.
2. **Gutrot never presented.** Ability cures by disease: generic
   fever ('disease') 79, wound_fever 24, gutrot 0. No gutrot patient
   ever reached the duty holder's cure attempt in 8 seeds — the dirty-
   water vector is suppressed by triage hygiene tents and the
   competent policy boiling water, so the one disease where medicine
   is the ONLY cure for a triage/field holder (gutrot: herbal cures,
   field/triage only ease) never shows up to be cured.

And the trichinosis story closes completely: trichinosis has no
ability cure (medicine's unique coverage on paper), but no NPC
patient can ever present it — lockjaw/trichinosis contract only on
the scholar via `contractDisease`, never as NPC `v.sick` records
(`villagerDiseaseId` maps only wound fever / gut rot / tick fever /
radiation sickness). Medicine-unique coverage is 0 by construction,
not by rarity. If a future build ever lets NPCs contract trichinosis
or lockjaw, the medicine channel would be their only cure — today it
is a door with no room behind it.

## Sense-testing

- **No medicine-cure line exists to judge.** Zero medicine-cure
  say-lines were spoken on either leg (cureLines empty on all 16
  per-seed files). The line itself ("`X` gives `Y` the antibiotics
  from the pharmacy stores. The wound fever breaks within the day.
  (`Y` is going to make it.)") is proven only by the prepared-game
  unit leg (proof L2a/L2b) — it has never been spoken live. That is
  the point of this arm, and it stands unexercised.
- Ability-cure lines (the contrast — these DO fire, 103 times):
  "Herbal remedy on Breasal: the right plants, brewed dark — the
  feverish breaks and doesn't come back. Breasal is going to make
  it. (Chantal cured them — and the camp saw it.)" The line reads
  well for a fever. Minor note: the SAME flavor serves wound_fever
  ("Herbal remedy on Nino: the right plants, brewed dark — the
  feverish breaks and doesn't come back.") — an infected wound is
  described as "the feverish" breaking, with no mention of the wound
  itself. It reads acceptably (wound fever IS a fever) but the flavor
  does not distinguish a wound cure from a fever cure. Filed as a
  soft observation, not a defect.
- 14 of the 103 ability cures were on undiagnosed patients — correct
  for these diseases (needsDiagnosis false for wound_fever/gutrot/
  generic fever), so no gate is being skipped.

## Village assessment (plain words)

Eight villages, all stuck at regional — none reached national, the
table, or a win. Six villages died (median 132 days alive, two
survived the full 150 days). The wild killed most people (66 of 110
deaths: "the wild" 66, monster 15, ambush 3, combat 2). Villages
reached wave 4 on every seed and wave 5 on half — the monsters keep
coming, the villages don't keep up. The duty holder was home and
holding the post 81% of village-days, and the camp's healers cured
103 sick villagers with their own hands and herbs — the ability
channel is the workhorse, and it works. What the villages lacked was
not medicine on a shelf: with a full pharmacy sitting untouched for
up to 150 days, nothing changed. The missing thing is a patient the
pills are needed for — gutrot never arrives, and every wound fever
meets hands that already know the cure.

## Reachability verdict

- Waves 1–5: reachable (wave 5 unlocked on 4/8 seeds).
- Regional → national: NOT reached on any seed (0/8). Table: NOT
  reached (0/8). Win: NOT reached (0/8). The scale wall stands —
  this arm measured a cure channel, not the wall, and the wall numbers
  are unchanged from the standing picture.
- Medicine channel: reachable in code (unit leg proves it fires on a
  prepared game) but UNREACHABLE in live play on this substrate —
  0/8 seeds, 0/320 seeded doses spent.

## Wall numbers (every run)

national 0/8, table 0/8, wins 0/8, wave 4 unlocks 8/8, wave 5
unlocks 4/8, median survival 132d (max 150d).

## Pilot note (the 4-seed miscount — recorded in the prereg correction)

The prereg as first committed listed 95205–95208 (four seeds) while
saying "8 seeds". The 4-seed before + seeded legs ran before the
miscount was caught at the panel step (4 cases). Those numbers —
before: medicine 0, ability 57, median 85d; seeded: medicine 0,
ability 57, identical trajectories — are DEMOTED to pilot. The
judged 8-seed sweep re-ran all 8 seeds fresh; the 4 pilot seeds
reproduced bit-identically, and the 4 new seeds (95209–95212) agree:
0 medicine cures, ability cures 12/9/23/2, two seeds surviving 150d.
The correction (prereg + seed lists) was committed as 24c785b9
before the judged 8-seed run; G1's threshold is unchanged.

## Corpus integrity

- Daily rows: no missing days except seed 95209, where the game day
  itself skipped (3→5 and 24→26; scholar.day reached 91 while
  daysAlive counted 89 loop-days) — a game-clock jump, identical on
  both legs, reported by the analyzer as missingDays, not recorder
  loss. Final counters (finalDutyCures, finalMedDoses) are read after
  runDays, so cure counts are complete regardless.
- Duplicate-day rows: policy.daily called twice on one game day on
  s95205 d61, s95207 d72/d75 — a harness artifact, identical on both
  legs, reported as dupDays.
- Bare fingerprints: recorded vs bare identical on every seed and
  leg (proof L6 on 95205; the sweep's bare pass on all 8 seeds
  matches the recorded pass on days/deaths/cures).
- Anomalies: 0. Counter cross-checks (event counts vs
  finalDutyCures): 0 mismatches. Dose balance: reconciles on all
  16 per-seed files.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-09/medchannel-seed-a-corpus/medchannel-seed-a-seeded-s*.json'
--metrics national,table,wins,exiled --sweep-rows` → 3 LOUD lines:
national 12 → 0, table 16 → 0, wins 16 → 0 (n=8 seed rows).
VERDICT: explained regime artifact, NOT a bug. The baseline's own
_regime note labels it the "winseat — full win-side win stack"
regime and says DO NOT compare pre-seat substrates against it —
"wins are structurally ~0 there and telemetry-check will fire a
spurious LOUD 'wins disappeared'." These runs are plain competent
policy on the default substrate (no win-stack flags); the before leg
shows the identical 0/0/0, so nothing disappeared within this run.
Baseline NOT rolled forward (no coordinator approval; rolling would
corrupt the winseat baseline).

## Metric review

- G1's threshold (≥5 medicine cures across 8 seeds) was the right
  bar for "the channel fires repeatedly" — and the channel failed it
  cleanly (0, not 3–4). No re-scoring: the miss stands as NO-GO.
- The metric that would have caught the shadowing earlier is not a
  cure count but an OPPORTUNITY count: medicine-eligible patients
  meeting a holder without a curing ability. This run measured it
  implicitly (0 opportunities: 0 gutrot presentations + 0
  ability-less holders on wound_fever) but did not pre-register it.
  PROPOSAL for the next run: pre-register an opportunity census
  (count cure attempts where the ability channel fails, by disease)
  as the primary for any re-test of this channel — if opportunities
  are 0, the channel cannot fire no matter how much medicine is
  stocked, and the question becomes a design call, not a measurement.
- The seed-band miscount (4 seeds listed as 8) is a process miss:
  the prereg's "8 seeds" claim was never checked against the listed
  band. Next runs should count the listed band explicitly in the
  prereg ("Seeds: NNN–MMM (N seeds)") and have the sweep FATAL on a
  count mismatch (it already FATALS on the exact list — the list
  itself was short).
- The coordinator-assigned band 94001–94008 was burned by pdvalue-b
  (2026-10-24) despite being "coordinator-verified fresh". The
  freshness check in this prereg caught it; the collision is recorded
  in the prereg so the next worker does not repeat it.

## Findings for the backlog

- [filed in hidden_files/sim-findings.md] Medicine channel shadowed,
  not starved (steve-call): the ability channel is tried first and
  duty holders essentially always hold a curing ability, so stocking
  the pharmacy changes nothing (0/8 seeds, 0/320 doses). The design
  question: is this narrowness intended, or should medicine be
  reachable another way (e.g. medicine tried when the holder's
  ability is exhausted, or the scholar's useMedicine path for NPCs)?
- [filed] Gutrot never presents under competent play (0 presentations
  in 8 seeds / 225 sick-days): hygiene tents + boiled water suppress
  the dirty-water vector, so the one disease where medicine is the
  only cure for a non-herbal holder never arrives.
- [filed, soft] Wound-fever cure flavor does not mention the wound:
  the herbal cure line says "the feverish breaks" for wound_fever
  exactly as for generic fever.

## Files

- Prereg: evidence/2026-11-09/sim-medchannel-seed-a-prereg.md
  (785bda555; correction 24c785b9)
- Corpus: evidence/2026-11-09/medchannel-seed-a-corpus/
  (medchannel-seed-a-{before,seeded}-s<seed>.json × 8,
  medchannel-seed-a-bare-{before,seeded}-s<seed>.json × 8,
  sweep-medchannel-seed-a-{before,seeded}.json)
- Panel: evidence/2026-11-09/medchannel-seed-a-panel-before/,
  medchannel-seed-a-panel-after/ (panel.json.gz only; cases/ dropped per AGENTS.md §15 — per-case data lives in panel.json.gz and the corpus),
  medchannel-seed-a-panel-compare.md + .json (review_required)
- Sweep: scripts/sweep-medchannel-seed-a.js
- Analyzer: scripts/analyze-medchannel-seed-a.js
- Proof: scripts/test-medchannel-seed-a.js (21/21)
- `node scripts/check.js --quick`: 296 passed, 4 failed in 803s
  (slow under sibling contention). The 4 failures are PRE-EXISTING on
  this master and unrelated to this arm (zero src/js; none of the four
  failing tests references medchannel): test-mobile-combat-cadence.js,
  test-occupation-panels.js, test-phone-frame-proof.js (stale phone
  receipt for index.html), test-establishment-r20-fixes-20261020.js
  (racks-full voice gate). Not fixed here — out of this arm's scope.
