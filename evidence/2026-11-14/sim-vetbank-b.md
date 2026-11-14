# sim-vetbank-b — scholar veteran-banking policy (Loop B, 20261114T1808Z)

**Verdict: NO-GO — evidence-only. Do not merge as a lever; keep as evidence.**
Branch `sim-vetbank-b`, anchor master `81f51c80d`. Prereg: `evidence/2026-11-14/sim-vetbank-b-prereg.md`
(commit `8fa41a7d8`, before any judged sim). Pilot: 8 seeds × 2 legs, 150 days, death-aware.
Seeds 91701–91708 (fresh band). Policies: `competent` (verbatim baseline) vs
`competent-vetbank-b` (`VETBANK=1`; after the scholar's first wave-4+ kill, the
scholar flees wave-4+ fights and never strikes or uses an ability in one; a
successor with no wave-4+ kill fights normally). No src/js change. Proof:
`scripts/test-vetbank-b-20261114.js` 63/63 static + 25/25 game (seed 91701 smoke).

## Verdict against the prereg bars

| Bar | Required | Observed | Result |
| --- | --- | --- | --- |
| STAGE-0 gate | baseline scholar ≥1 wave-4+ kill somewhere on the band | 16 scholar wave-4+ kills on 6/8 baseline seeds | PASS — lever not inert |
| G1 instrument validity | full decomposition, 0 instrument errors, 0 UNCLASSIFIED kills, every seed classified | 0 errors, 0 unclassified, 0 veteran-recount mismatches, 0 banking-day mismatches, all 16 classified | PASS |
| G2(a) the lever — living veterans | armed living wave-4+ killers at end ≥ baseline + 2 AND ≥1 armed seed ends with a living veteran | armed 2 vs baseline 3 (Δ −1); armed seeds with a living veteran 2 (91701, 91703) | **MISS** |
| G2(b) the lever — readiness-5 days | armed readiness-5-ready days > baseline | armed 20 vs baseline 10 (Δ +10) | PASS |
| G3 lever-only | zero src/js changes; proof green | `git diff master -- src/js` empty; proof 63/63 + 25/25 | PASS |
| COST BAR | starvation armed ≤ baseline + 2 AND arm-only starvation ≤ baseline total AND median survival armed ≥ 0.8× baseline | starvation 3 vs 2 (3 ≤ 4 ✓); arm-only 3 ≤ baseline total 2 ✗; median 119 vs 142.5 (ratio 0.84 ✓) | **MISS** (middle clause) |
| ACTIVATION GATE | armed leg: 0 scholar strikes in wave-4+ fights after banking; 0 scholar wave-4+ kills after banking | 0 strikes by any banking scholar while alive; 0 kills by any banking scholar after banking — see succession note | PASS in substance |

G2 needs **both** halves: (a) misses, so the arm is NO-GO. The cost bar also
misses. No confirm run: the prereg allows one only on a clear GO; this is a
clear pilot miss, reported as-is.

## Pooled before/after (8 seeds each leg)

| | Baseline competent | Armed competent-vetbank-b | Δ |
| --- | --- | --- | --- |
| Wins (full seat) | 0/8 | 0/8 | 0 |
| National (final / ever) | 0/8 / 0/8 | 0/8 / 0/8 | 0 |
| Table waiting ever / done | 8/8 / 0/8 | 8/8 / 0/8 | 0 |
| Wave-4 faced | 8/8 | 8/8 | 0 |
| Wave-5 unlocked / faced | 1/8 / 1/8 | 1/8 / 1/8 | 0 |
| Door-open seeds (day) | 1 (91708, d121) | 1 (91703, d107) | 0 |
| Median survival (days) | 142.5 | 119 | −23.5 (ratio 0.84) |
| Survived to day 150 | 2/8 (91706, 91708) | 1/8 (91703) | −1 |
| Readiness-5-ready days | 10 | 20 | +10 |
| Readiness-4-ready days | 605 | 552 | −53 |
| Living wave-4+ killers at end | 3 (3 seeds) | 2 (2 seeds) | −1 |
| Scholar wave-4+ kills | 16 (6 seeds) | 10 (6 seeds) | −6 |
| Scholar classification | NEVER 2 / DEAD 5 / LIVING 1 | NEVER 2 / DEAD 5 / LIVING 1 | 0 |
| Starvation deaths | 2 | 3 | +1 |
| Villager combat deaths | 280 | 284 | +4 |
| All combat deaths | 118 | 104 | −14 |
| Deaths total | 616 | 591 | −25 |
| Best standing (capped, median) | 285 | 247.5 | −37.5 |

## Per-seed table

`days` = run length; `vets` = living wave-4+ killers at end; `schK` = scholar
wave-4+ kills; `w4+` = all wave-4+ kills in the run; `r5` = readiness-5-ready
days; `starv` = starvation deaths; `vComb` = villager combat deaths.

| Seed | Leg | Days | End | MaxW | r5 | Door | Vets | SchK | Scholar class | w4+ | Starv | vComb |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 91701 | base | 113 | lost | 4 | 0 | — | 0 | 1 | KILLED-DEAD-KILLER | 1 | 0 | 27 |
| 91701 | armed | 112 | lost | 4 | 0 | — | 1 | 1 | KILLED-LIVING | 1 | 1 | 29 |
| 91702 | base | 123 | lost | 4 | 0 | — | 0 | 0 | NEVER-KILLED | 1 | 0 | 31 |
| 91702 | armed | 123 | lost | 4 | 0 | — | 0 | 0 | NEVER-KILLED | 1 | 0 | 31 |
| 91703 | base | 148 | lost | 4 | 0 | — | 1 | 2 | KILLED-DEAD-KILLER | 3 | 1 | 36 |
| 91703 | armed | 150 | survived | 5 | 20 | d107 | 1 | 2 | KILLED-DEAD-KILLER | 3 | 0 | 41 |
| 91704 | base | 137 | lost | 4 | 0 | — | 0 | 1 | KILLED-DEAD-KILLER | 1 | 1 | 41 |
| 91704 | armed | 137 | lost | 4 | 0 | — | 0 | 1 | KILLED-DEAD-KILLER | 1 | 1 | 41 |
| 91705 | base | 83 | lost | 4 | 0 | — | 0 | 0 | NEVER-KILLED | 0 | 0 | 33 |
| 91705 | armed | 83 | lost | 4 | 0 | — | 0 | 0 | NEVER-KILLED | 0 | 0 | 33 |
| 91706 | base | 150 | survived | 4 | 0 | — | 1 | 4 | KILLED-LIVING | 4 | 0 | 38 |
| 91706 | armed | 90 | lost | 4 | 0 | — | 0 | 2 | KILLED-DEAD-KILLER | 2 | 0 | 39 |
| 91707 | base | 149 | lost | 4 | 0 | — | 0 | 3 | KILLED-DEAD-KILLER | 4 | 0 | 33 |
| 91707 | armed | 130 | lost | 4 | 0 | — | 0 | 2 | KILLED-DEAD-KILLER | 2 | 1 | 32 |
| 91708 | base | 150 | survived | 5 | 10 | d121 | 1 | 5 | KILLED-DEAD-KILLER | 6 | 0 | 41 |
| 91708 | armed | 115 | lost | 4 | 0 | — | 0 | 2 | KILLED-DEAD-KILLER | 2 | 0 | 38 |

Guardrail (§14c): villager combat deaths armed vs baseline per seed — worst
is 91703 (+14%, 41 vs 36); no seed exceeds +50%. Guardrail holds.

## The banking scholars — what actually happened to them

Banking is per-person: it protects the scholar who made the kill, and it dies
with them. Six scholars banked on the armed leg; five of the six died anyway.

| Seed | Banking scholar | Banked | Died | Cause | Days banked | Policy fights / turns | Strikes after banking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 91701 | visjoin_89 | d105 | — (lived) | — | to end (d112) | 2 / 6 | 0 |
| 91703 | ruth_goldstein | d81 | d126 | the arena | 45 | 4 / 14 | 44, all after her death |
| 91704 | catalina_reyes | d107 | d110 | contest | 3 | 0 / 0 (never engaged) | 22, all after her death |
| 91706 | gen_2lnq8dm | d63 | d66 | a stranger | 3 | 3 / 3 | 25, all after death |
| 91707 | gen_5vd3bj6 | d90 | d92 | the arena | 2 | 5 / 12 | 27, all after death |
| 91708 | gen_b594jw4 | d60 | d86 | the wild | 26 | 3 / 136 | 25, all after death |

Succession note (activation gate, read carefully): the raw counter
`strikesAfterBanking` on the armed leg totals 143, and scholar wave-4+ kills
after the banking day total 4. **All 143 strikes and all 4 kills were made by
successors after the banking scholar's death** — verified per strike/kill
against the fallen list and the daily scholar-of-record. Zero strikes and zero
kills by any banking scholar while alive. The gate holds in substance: the
banked scholar never fought wave-4+ again. What the raw counter actually
measures is the successor re-rolling the arena unbanked — which is the policy
working as specified (a successor with no wave-4+ kill fights normally), and
also the finding that kills the lever: the protection does not survive the
person. On 91704 the policy never engaged at all (banking scholar dead 3 days
later in a contest); the two legs are identical in every summary number.

The deaths are the point: the arena (×2), a contest, a stranger, the wild —
none of them is a wave-4+ turn-based fight the policy can flee from. Banking
guards one door and the scholar dies through another. And while the scholar
sits out wave-4+ fights, the village loses its best sword: armed wave-4+
kills fall 19 → 11 across the band (baseline 19 total? — per-seed w4+:
baseline 1+1+3+1+0+4+4+6 = 20; armed 1+1+3+1+0+2+2+2 = 12), and the second
living veteran the readiness bar needs never arrives from the scholar's side.

## Full kill decomposition (wave-3+ kills, final log authoritative)

Format per killer: `vid — kills (w3×n, w4×n, w5×n), first kill day, lived/died
day + cause, days from first kill to death`. Every kill is attributed; 0
unclassified on all 16 runs. No kill-before-death inversion anywhere in the
band (the vetkill-a ethan_hunt class does not recur).

### 91701
- Baseline (113d, lost): gen_633kikh 1×w3 d27, died d54 the wild (27d);
  ruth_goldstein 2×w3 d35, died d76 the wild (41d); adaeze_nwosu 1×w3 d71,
  died d71 the wild (0d); katarina_novak 1×w3 d101, died d105 the wild (4d);
  **visjoin_89 (scholar) 1×w4 d105, died d106 the wild (1d)**.
- Armed (112d, lost): same four villagers, same days; **visjoin_89 (scholar)
  2 kills (w3×1, w4×1) d105, LIVED** — the one clean lever firing: same
  scholar, same kill, alive on armed, dead on baseline.

### 91702
- Both legs identical (123d, lost): gen_30jejw5 1×w3 d63, died d65 the arena
  (2d); chen_wei 2×w3 d67, died d122 the wild (55d); maya_singh 2×w3 d68,
  died d100 the wild (32d); hassan_ali 1×w3 d75, died d104 the wild (29d);
  sanne_bakker 1×w3 d99, died d100 monster (1d); visjoin_110 2 (w3×1, w4×1)
  d112, died d120 "a wound that wouldn't close" (8d). Scholar never killed
  wave-4+; the policy never had anything to bank.

### 91703
- Baseline (148d, lost): leo_martin 1×w3 d28, died d72 the wild; chloe_dubois
  1×w3 d36, died d78 the wild; ethan_hunt 3×w3 d39, died d73 the wild;
  gen_3f2tdoy 1×w3 d46, died d78 the wild; nikolai_volkov 1×w3 d46, died d80
  the wild; gen_3afy355 2×w3 d65, died d71 the wild; **ruth_goldstein
  (scholar) 1×w4 d81, died d99 the wild (18d)**; ursula_weber 1×w3 d84, died
  d111 the wild; app_mgpspkdk939 1×w3 d84, died d132 contest; visjoin_85 2×w3
  d109, died d127 starvation; visjoin_81 2 (w3×1, w4×1) d111, died d119 the
  wild; **visjoin_103 2 (w3×1, w4×1) d112, LIVED** (the end living veteran).
- Armed (150d, survived, door d107, wave-5 faced 3×): same early killers;
  **ruth_goldstein (scholar) 3 kills (w3×2, w4×1) d81, died d126 the arena
  (45d)** — banking kept her alive 45 days, long enough for the door to open
  at d107 while she and app_mgpspkdk939 were both living veterans; she then
  died in the arena anyway. **app_mgpspkdk939 2 (w3×1, w4×1) d84, LIVED**
  (the end living veteran). onni_korhonen 2 (w3×1, w4×1) d113, died d130 the
  wild — the day-130 w4 kill is the successor scholar's, after Ruth's death.
  visjoin_85 1×w3 d113, LIVED. visjoin_81 1×w3 d129, died d136 the arena.
  sari_wulandari 1×w3 d150, LIVED. No wave-5 kills on either leg.

### 91704
- Both legs identical (137d, lost): gen_7bkvz2f 1×w3 d35, died d68 the wild;
  **catalina_reyes (scholar) 5 (w3×4, w4×1) d41, died d110 contest (69d)**;
  gen_psjwwv2 1×w3 d51, died d61 the wild; gen_ryfw1s2 2×w3 d51, died d69 the
  wild; zoe_adams 2×w3 d52, died d113 the wild; visjoin_96 2×w3 d99, died
  d116 monster. Banking scholar dead 3 days after banking; policy never fired.

### 91705
- Both legs identical (83d, lost): jovan_milic 3×w3 d33, died d80 the wild;
  gen_uxjp2ij 2×w3 d42, died d79 the wild; gen_ff4qqrq 1×w3 d61, died d81 the
  wild; wanjiru_kamau 3×w3 d62, died d78 the wild. No wave-4+ kill at all on
  either leg; the village died young (d83) before the Mirror Draft mattered.

### 91706
- Baseline (150d, survived): james_okonkwo 3×w3 d44, died d111 the wild;
  gen_qp0q7ez 2×w3 d46, died d106 the wild; elijah_scott 1×w3 d51, LIVED;
  **gen_2lnq8dm (scholar) 6 (w3×3, w4×3) d58, died d102 the wild (44d)**;
  **tashi_sherpa 1×w4 d149, LIVED** (the end living veteran; a later scholar).
- Armed (90d, lost): james_okonkwo 3×w3 d44, LIVED; gen_qp0q7ez 1×w3 d46,
  died d67 the wild; elijah_scott 1×w3 d51, died d83 the wild;
  **gen_2lnq8dm (scholar) 4 (w3×3, w4×1) d58, died d66 "a stranger" (8d)**;
  gen_0bl4did 3 (w3×2, w4×1) d65, died d79 the wild — the successor scholar's
  wave-4 kill, 2 days after the banking scholar's death; nikolai_volkov 1×w3
  d79, died d82 the wild. The village collapsed 60 days early on the armed
  leg: it lost its scholar to a stranger 3 days after banking, then its
  successor too, and never recovered.

### 91707
- Baseline (149d, lost): **gen_5vd3bj6 (scholar) 4 (w3×3, w4×1) d33, died
  d92 the arena (59d)**; ruth_goldstein 2×w3 d41, died d43 a stranger (2d);
  gen_qeqzssh 1×w3 d44, died d114 the wild; app_mgpsphqt565 1×w4 d108, died
  d114 the wild; victor_lopez 3 (w3×2, w4×1) d111, died d147 the wild;
  gen_5fn2voi 1×w4 d116, died d124 the wild.
- Armed (130d, lost): same scholar, same death (d92, the arena, 2 days after
  banking); app_mgpsphqt565 1×w4 d108, died d129 starvation; victor_lopez
  1×w3 d111, died d115 monster; oliver_moore 1×w3 d126, died d130 the wild.
  Two fewer wave-4+ kills, 19 days shorter.

### 91708
- Baseline (150d, survived, door d121, wave-5 faced 1×): catalina_reyes 5
  (w3×4, w4×1) d27, died d96 the wild; gen_y813v3k 1×w3 d36, died d114 the
  wild; gen_tifuyf6 1×w3 d36, died d150 the wild; dale_hoffman 3 (w3×1, w4×2)
  d37, died d131 the wild; maya_singh 5 (w3×4, w4×1) d43, died d108 the wild;
  gen_w2n4bac 3×w3 d48, died d92 the wild; **gen_b594jw4 (scholar) 1×w4 d60,
  died d80 the wild (20d)**; **app_mgpsphud170 2 (w3×1, w4×1) d108, LIVED**
  (the end living veteran); app_mgpsphnp365 1×w3 d112, died d132 the wild.
- Armed (115d, lost): catalina 3×w3 d27, died d87 the wild; gen_y813v3k
  2×w3 d36, died d110 contest; gen_tifuyf6 1×w3 d36, died d88 the wild;
  dale_hoffman 3 (w3×2, w4×1) d37, died d97 the wild; maya_singh 5×w3 d43,
  died d88 the wild; gen_w2n4bac 3×w3 d48, died d85 "Big Loud";
  **gen_b594jw4 (scholar) 1×w4 d60, died d86 the wild (26d)**. The scholar
  spent 136 turns in banked wave-4+ fights — 134 barrier pushes, 133 held
  turns walking out and waiting — while the village fought the Mirror Draft
  without them: 2 wave-4+ kills vs 6 on baseline, door never opened, village
  lost 35 days early.

## Village assessment, in plain words

The lever works exactly as built and still loses. On the one seed where the
banking scholar would have died in the wild the next day, banking saved them
(91701). Everywhere else the scholar died anyway — in the arena, in a contest,
to a stranger, in the wild — dangers the policy cannot walk away from, because
it only guards wave-4+ turn-based fights. Five of six banking scholars died;
four of them within 3 days of banking or to a cause outside the policy's
reach. And the protection is not inherited: the moment the banking scholar
dies, the next scholar starts unbanked and walks straight back into the same
arena, which is why the armed leg's raw "strikes after banking" count (143)
looks like a breach until you check whose hand held the sword — all
successors, all after the death.

Meanwhile the village pays for the scholar's absence. The scholar is the
village's best sword in the fights that make veterans; sitting those fights
out costs wave-4+ kills (20 → 12 across the band), costs standing (best capped
285 → 247.5), and costs days (median survival 142.5 → 119). Two villages that
survived to day 150 on the baseline died young on the armed leg (91706: d90;
91708: d115). The one armed seed that did better, 91703, opened the wave-5
door — but it opened it while Ruth was still alive to count as the second
veteran, and she died in the arena anyway 19 days later; the village faced
wave 5 three times and killed nothing there.

So the wall stands: the binding shortage is living veterans, and scholar
banking does not manufacture them. It saves one person, sometimes, briefly —
and the village is weaker for it. The next lever, if any, has to make a
*second* killer who lives — a villager, not the scholar alone — or keep the
killer alive against the arena, the contest, the stranger and the wild, not
just against the wave-4 fight they already survived once.

## Sense-testing notes (read, not counted)

Read the recorded narration on 91708 armed, days 58–90 (banking day 60), and
the release lines for the whole run.

- The fiction knows the wall: the System repeats "The fifth draft stays in
  the wings — blood your fighters (1 of 2 veterans)" on d62, d69, d76, d83.
  One veteran short for a month, and the door stays shut. The numbers and the
  words agree.
- The banking itself is fictionally silent. The scholar walks out of wave-4+
  fights 134 times and no line ever says why — no villager remarks on the
  scholar's absence from the big fights, no System line names the choice. The
  scholar is just in camp, holding keepsakes, while Dale dreams of teeth
  twice and the village fights on without them.
- The scholar's death is voiced obliquely: d86, "Stonebridge watches to see
  if Haven holds without its dead — and presses the tribute down to 3,000
  kcal/week while the chair is empty." The chair is empty. That lands.
- One incoherence flag, not pursued: d62, "Aadhya… 'The Static Kite — I put
  it down today.'" Aadhya has no kill in the wave-kill log on this run. The
  fireside line may be trick-sharing phrased as a kill claim; it does not
  match the log as written.
- The daily keepsake refrain ("The feast was the weapon") repeats verbatim
  with small variations day after day, and the feast, the tribute wagons and
  the pantry checks all read coherently. Nothing in the narration contradicts
  the measurement; nothing in it rescues the lever either.

## Metric review (§14)

- §14a (instrument): G1 green — 0 instrument errors, 0 unclassified kills,
  0 veteran-recount mismatches, 0 banking-day mismatches across 16 runs; the
  engine veteran counts and the independent recount agree on every snapshot.
  The NO-GO is a lever miss, not an instrument failure.
- §14b (substrate): contact, pool, verbs and horizon all pass as preregistered.
  The policy used the flee/decline verbs it was given; the 150-day horizon was
  sufficient (banking events d60–107, deaths within 45 days of banking).
- §14c (guardrail): villager combat deaths reported per seed above; worst
  armed-vs-baseline excess is +14% (91703), none above +50%.
- Kill classification (§14a): **LEVER MISS — mechanism fires, effect wrong
  on the binding metric.** Not inert (STAGE-0 passed, policy engaged on 5 of
  6 banked seeds with 0 breaches) and not an instrument failure (G1 green).
  The mechanism protects one person against one danger; the binding metric
  needs two living veterans, and the scholar's absence costs the village the
  kills that would make the second.

## Balanced panel (§15)

`scripts/build-vetbank-panels-20261114.js` → `evidence/2026-11-14/vetbank-panel.md`.
Decision: **review_required** (8 paired cases, screen only). Wins 0 → 0,
national 0 → 0. Village deaths per run 77 → 73.9 (no material signal) but
deaths per 100 days 59.3 → 64.2 (**regression_watch**, 95% exploratory
interval −1.2 to +11.5, includes 0) — the same deaths compressed into shorter
lives. Community loss 0.75 → 0.875 (**regression_watch**, interval −0.25 to
+0.5). First-bearer survival through day 30/60 unchanged (1 → 1). The panel
is the instrument, not the judge; the prereg bars judge, and they say NO-GO.

## Telemetry deviation check

Attempted: `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-14/perseed-vetbank-b/*.json' --metrics
national,table,wins,exiled`.
**Refused**: "recorder-corpus input: all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs." Recorded as a
refusal, as in standing99107. **Baseline NOT rolled.** No `--update-baseline`
was run.

## Files

- Prereg: `evidence/2026-11-14/sim-vetbank-b-prereg.md`
- Policy: `scripts/policies/competent-vetbank-b.js`
- Driver: `scripts/vetbank-driver-20261114.js` (fix: skip same-day final
  snapshot; proof re-green 63/63 + 25/25)
- Analyzer: `scripts/vetbank-analyze-20261114.js`
- Pilot report runner: `scripts/vetbank-pilot-report-20261114.js`
- Proof: `scripts/test-vetbank-b-20261114.js`
- Per-seed JSON: `evidence/2026-11-14/perseed-vetbank-b/` (16 files)
- Pilot logs: `evidence/2026-11-14/vetbank-b-pilot-{a,b,c,d}.log`
- Pooled report: `evidence/2026-11-14/vetbank-b-pilot-report.json`
- Panel: `evidence/2026-11-14/vetbank-panel.md` (+ `.json`, `-before/-after.json.gz`)
