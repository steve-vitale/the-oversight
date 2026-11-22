# sim-launchfield-refreeze-b — fresh-band re-judge of the launchfield recorder (DIAG-NO-GO on supply)

- **Arm:** sim-launchfield-refreeze-b, Loop B run `fleshout-loop-b-20261122T1330Z`, arm 2 of 2
- **Axis:** winnability chain. **Base:** master `bda6ff495` (frozen — current tip at freeze, 2026-11-22 ~13:51 UTC)
- **Band:** 107383–107390 (fresh, verified before freezing — zero namings in every scope)
- **Substrate:** competent verbatim, policy sha `1884c8852d38`; flags `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`; 150d death-aware, MODE vre. `allyslot3InSrc: true`.
- **Instrument only:** `scripts/` + `evidence/` only. No `src/js` change. The launch-engine lever (trusted villager at Haven as a wave-4+ companion) is NOT built here — it lives in `villager-brain.js`/`win-plan.js` and is blocked on the held `sim-pinquaddoor-b` branch.
- **Prereg:** `evidence/2026-11-22/sim-launchfield-refreeze-b-prereg.md` (frozen before any judged sim; this is a FRESH judgment on a fresh band — the §7 re-freeze rule governs re-running the same judgment, and no amendment applies).
- **Corpora:** `evidence/2026-11-22/perseed-launchfield-refreeze-b-107383-107390/` (8 files). Legs log: `evidence/2026-11-22/launchfield-refreeze-b-legs.log`. Analysis: `evidence/2026-11-22/launchfield-refreeze-b-analysis.json`.
- **Proof:** `node scripts/test-launchfield-refreeze-b.js` **52 passed, 0 failed**. Analyzer selftest 71/71 green.

## Verdict: DIAG-NO-GO on supply (instrument unexercised on fresh data)

Frozen bar (a)+(b)+(c)+(d) — (d) fails. A miss is NO-GO, never re-scored.

| Clause | Result |
|---|---|
| (a) completeness — day-level unknown (B′ + H) | **PASS** — unknown = 0; 0 assessed days, 0 not-bid instances, 2 churn instances, all closed |
| (a) completeness — Leg S unexplained parts | **PASS** — **0 unexplained parts of 16** (scored 0, explained 16) |
| (b) Leg R reproduces the 10 launcheng unknown days exactly | **PASS** — exact, 10/10 |
| (c) instrument validity | **PASS** — 8/8 files, 0 instrument errors, substrate clean on all 8, 864 holder-state rows, 22 gate rows |
| (d) fresh-band supply — field-encounter fallback fires ≥ 1 fresh-band part | **FAIL** — **0 field-encounter parts** (not in the Leg S whyNot tally at all; 0 `field-encounter-day` at day level either) |

**SUPPLY, stated plainly (frozen supply rule):** the fresh band supplied **zero field-consumed parts** — the new `field-encounter` fallback fired 0 times on band 107383–107390, exactly as on the held band. Per the frozen rule the verdict is therefore **DIAG-NO-GO on supply**, and the old DIAG-GO is NOT re-asserted. The §H4 staged fixture and the §3b old-band regression remain proof-test evidence only, not fresh evidence.

**Why zero, and it is not an instrument miss.** The band supplied almost no ledger window at all: **0 candidate-not-bid instances** (held band: 5), so the Leg S ledger ran over only the 2 churn instances — 16 parts total, against the held band's 464. Both churn holders DID meet field encounters on their instance days — `devon_okafor` (107385) met `network_note`, his own plan target, on day 69, fled at 20 HP with an ally's help, and died of thirst the same day; `visjoin_107` (107385) met `timeslot`, her target, on day 111 (fled) and again day 113 (died) — but the fallback correctly refused both: day 69 and day 111 are seed days (excluded by rule 4), and neither holder was at Haven on any of those days (devon at node 7,1; visjoin at 0,0 then 1,1), so the Haven-rows-absent condition (rule 7) fails. The trigger shape the fallback exists for — a holder at Haven for part of the day, a field encounter consuming the missing part — never occurred on this band. Band-wide there were 72 `v4encounters` rows, none inside a ledger window.

**Completeness caveat, stated plainly:** the (a) pass this time rests on a 16-part ledger, not the held band's 464-part one. Zero unexplained of 16 is a much weaker completeness statement than zero of 464 — the band was too thin to stress the ledger. The verdict's operative clause is the supply failure; the completeness pass should not be quoted as equivalent to the held band's.

## Before / after (the held band vs this re-judge)

| | launchfield-b (107321–107328) | launchfield-refreeze-b (107383–107390) |
|---|---|---|
| Leg S parts | 464 | 16 |
| Unexplained parts | **0** | **0** |
| Field-encounter parts (fresh band) | 0 | **0** |
| Candidate-not-bid instances | 5 | 0 |
| Churn instances | 3 | 2 |
| Day-level unknown | 0 | 0 |
| Leg R reproduction | 10/10 exact | 10/10 exact |

Proof-test §3b re-reads the EXISTING launchstate corpora with the new analyzer and closes exactly the 2 previously-unexplained parts as `field-encounter` with the suburb/vFlee trace (107305 `devon_okafor`/`reunion` + `benoit_lambert`/`eulogy`, d150 p3). That is the instrument check, not fresh evidence.

## What the band shows

- **Instances opened: 7** — launched 3, target-killed 1, selected-blocked 1, plan-churned-before-dawn 2, candidate-not-bid 0, unknown 0. Funnel: launched-killed 0, launched-fought-no-kill 1, launched-no-meeting 2.
- **Instance-days 0; assessed days 0** (no not-bid instance-days at all). Zero-row reasons (churn only): holder-dead 2, seed-day 1, holder-off-haven 1. Churn closings: holder-died 2.
- **Leg S ledger: 16 parts** — scored 0, explained 16, unexplained 0. whyNot: away 9, dead 4, seed-day 3, field-encounter 0.
- **Binding gate (reported, not gating): mechanism UNTESTED** — with 0 assessed days there is nothing for the gate to deny or allow; the analyzer's legacy bindingGate bar reads FAIL on the untested mechanism. The launch gate was never asked on this band.
- **Pool:** eligible pool size 0 on every snapshot; pool dawns 0 on all 8 seeds; first-fail reasons empty (no pool rows were ever assessed). Nobody was ever eligible to stand as companion — same shape as the held band, thinner.
- **Launches (legacy sanity, reported):** counted 3, wave-4-target 4, uncounted 1, noStartCall 0, noCopyLink 0, firstFights 1. The one first fight: 107383 day 78, `chantal_mukendi` vs `herald`, origin world-tick, outcome vFlee, 69 damage dealt — the same day `mara_vasquez` launched a 4-person party against the herald.

### Per-seed

| Seed | Days | End | Max wave | Standing | Holder-state rows | Notes |
|---|---|---|---|---|---|---|
| 107383 | 132 | village-lost | 5 | 250 | 529 | launch-rich: 18 v4seeds, 12 encounters; mara's d78 launch + first fight |
| 107384 | 144 | village-lost | 4 | 150 | 275 | dmitri launched twice vs reunion (d139, d143), no meeting in window |
| 107385 | 150 | survived | 5 | 600 | 51 | both churn holders live here (devon d69, visjoin d111–113); standing 600, still regional |
| 107386 | 104 | village-lost | 4 | 190 | 0 | no wave-4 plan ever reached a holder census |
| 107387 | 85 | village-lost | 4 | 199 | 0 | no plan reached a holder census; standing exactly 199 |
| 107388 | 150 | survived | 4 | 199 | 9 | survived with pantry 19,834 kcal; one selected-blocked (danger-gate) |
| 107389 | 68 | village-lost | 4 | 199 | 0 | earliest loss; 3 starvation deaths d64–68 as the village collapsed |
| 107390 | 139 | village-lost | 4 | 199 | 0 | 35 v4seeds, 154 dawnbidScores, 0 census rows — plans seeded, none reached a holder |

### Scale wall (reported every run)

Wins 0/8, national by scaleRank ≥ 2: 0/8, national by standing ≥ 200: 2/8 (107383 standing 250, 107385 standing 600 — both still regional rank, so the rank definition stays 0), table 0/8 (the recorder does not track table seats; 0 is the instrument's default, consistent with wins 0/8), wave 4 unlocked 8/8, wave 5 unlocked 2/8, median survival 135.5 days, survived 1/8 by the analyzer's `gameDays >= 150` definition (107388, gameDays 151), deaths 734, starvation deaths 3, standing-199 stall 4/8. In plain words: every village reaches wave 4, a quarter reach wave 5, two villages pile up standing past 200 without ever leaving regional rank, four villages end at exactly 199, none wins — the same wall as the held band, and on this band the launch gate was never even asked (0 assessed days).

**Survived-count note (observation, not a verdict item):** the driver legs record TWO villages with endReason `survived` at the 150d horizon (107385 and 107388), but the analyzer's wall counts survived as `gameDays >= 150` and 107385's corpus reads `gameDays: 148` against `days: 150` (daily rows 146). The sim's internal day counter drifts ±2 from the driver's run-days on survived runs (107388 reads gameDays 151). The wall number above is the analyzer's definition, as frozen; the drift is flagged for the coordinator (see findings).

Telemetry check: `node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'perseed-launchfield-refreeze-b-107383-107390/*' --metrics national,table,wins,exiled` → **the designed recorder-corpus refusal** ("recorder corpora are compared with sweep-compare tables, never against a run baseline here"). No LOUD deviation lines; the check declines the comparison by design, same as launchfield-b.

## Sense-test: holder-days read as a person would

**The prereg's scored-day read cannot be done on this band — said plainly.** The prereg requires one scored day and one skipped day read end to end from the per-part ledger. This band has **zero scored parts** (`sScored: 0`) and **zero assessed days**, so there is no scored day in the ledger to read. What follows is read from the raw corpora instead: one launch day (a score row that exists, outside the Leg S window) and the two churn holders' days.

**1. Launch day — 107383 `mara_vasquez`, `herald`, day 78.** She does Haven chores through day 77 (HAVEN_CHORE, partsLeft ticking down), finishes the chore at day 78 part 0 (idle/done), and at part 1 the engine scores her: FORAGE 6.25, WATER 10.19, HUNT 2, VISIT 1.7, HAVEN_CHORE 3.6, EXPEDITION 5 — and the pick is EXPEDITION, `party_launch`, with `override: 'win_plan:party_launch'` and `corePick: 'WATER'`. In plain words: she was thirsty enough that fetching water was the strongest ordinary pull, but her live wave-4 plan overrode it and she launched with a 4-person party (diana_osei, chantal_mukendi, gen_x0hank1) instead. She is out at part 1 (EXPEDITION, away), back at Haven by part 2, eating. The same day, her companion chantal meets the herald in the field and flees after dealing 69 damage. The recorder's story — chores, one scored look at midday, plan override beats thirst, launch, home to eat — matches the sim's rows exactly, including the commit carried from day 77 part 0. The override is recorded honestly (corePick WATER preserved beside the override), so a reader can see what the plan cost her.

**2. The holder who fought and died thirsty — 107385 `devon_okafor`, `network_note`, day 69.** His plan is seeded the same day he dies. The encounter log reads like a fight, not a table: "R1: Devon strikes for 12 (988 left)", "the memo underlines something about Devon", "Devon's gear absorbs 38", "Just Fix It hits Devon for 34 (61 left)", "R2: NOTE: \"THE WOLF SHOULD HAVE LASERS NOW\" — and then it does. (+25%.)", "Devon is losing — shouts for help! Claudine charges in!", "Claudine answered Devon's shout, but Devon is past holding — they run while running still works." He flees at 20 HP with two allies present, and dies of thirst the same day, away from Haven (node 7,1). The recorder says exactly that: seed-day, then dead, then away — no Haven row, so no field-encounter attribution, correctly.

**3. The holder with no arrows — 107385 `visjoin_107` (Sunita), `timeslot`, days 111–113.** "Sunita has Bow but no arrows — the string stays drawn, useless." She meets the timeslot monster on day 111 ("RESCHEDULED — THE GREEN ROOM. (The guide showed it coming.)", struck for 39, flees at 18 HP) and again on day 113, where the same blow kills her ("Reschedule hits Sunita for 41 (0 left)"). The recorder's story matches: seed-day, off-haven, dead — a plan-holder who never got home and never got scored.

**Transcripts.** The System's show narration reads as alien-show patter and names real veteran kills: "📺 \"Oh — OH. Everybody saw that, right? Abaynesh just put down Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name.\"" (107385 d29); "◈ ARC IV — THE INEFFICIENCY. SYSTEM: \"ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating.\"" (d46). At day 55 the System tells the village directly what the wall is: "📺 SYSTEM: \"Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION. You've got a region; now make it a REALM.\"" — while the village sits at regional rank with standing 600. Nothing robotic in the sampled lines; the village talks like a village under a show, and the show itself names the scale wall.

## Metric review

Judged only against the frozen bar. Completeness passes on the fresh band (0 unknown instance-days, 0 unexplained parts of 16) but on a 16-part ledger — much thinner than the held band's 464, and not equivalent evidence. Reproduction passes (10/10 exact). Instrument passes (proof 52/52, selftest 71/71, 8/8 files, 0 errors, substrate clean). **Clause (d) fails: the field-encounter fallback fired 0 times on the fresh band, so the verdict is DIAG-NO-GO on supply.** The fallback's trigger shape (Haven rows at other parts + a same-day encounter) is real — the §H4 fixture and the §3b old-band regression both exercise it — but it did not occur in 8 fresh seeds, and both churn holders' encounters fell outside the trigger shape for named, correct reasons (seed-day exclusion, away-from-Haven all day). The next judgment needs a band that actually supplies a not-bid holder-day with a Haven part and a same-day encounter — or a different instrument question, since two consecutive 8-seed bands have now supplied zero. That is the frozen rule working as written, not a gap.

## Blanks filled / documented

- The held DIAG-GO is now re-judged on a fresh band and fresh base: completeness and reproduction hold, the instrument reproduces on the current tip (proof 52/52, D1/D2 green), but the fallback's first live fire on a fresh band is still unobserved — twice running. The verdict is NO-GO on supply, not a re-assertion of GO.
- Seed 107390's 35 seeded wave-4 plans with 0 census rows is a genuine absence (plans seeded, none reached a holder), same class as launchfield's 107328 — recorded, not an instrument failure.
- Seed 107385's two churn holders are documented end to end (Devon fled at 20 HP and died of thirst; Sunita fought twice without arrows and died on the second meeting) — the band's field encounters have named human causes, and the fallback's refusal to attribute them is correct, not a miss.
- The `gameDays` vs `days` drift on survived runs (107385: 148 vs 150) is flagged for the coordinator — it changes the wall's survived count depending on which field is read.
- The win-plan override (`override: 'win_plan:party_launch'` over `corePick: 'WATER'`) is recorded honestly in the score rows and read in the sense-test — the launch engine overriding thirst is visible, not hidden.

## Addendum — §6 anchor pin before/after, pilot sequence, flap log (worker, 2026-11-22 ~14:20 UTC)

### §6 before / after

**BEFORE (launchstate):** §6 compared the recorded anchor against the same run-time `git merge-base HEAD master` computation that produced it — a tautology. The anchor silently followed the landing rebase and the proof could not catch the move.

**AFTER (this arm, ported from the held arm, re-pointed):** the driver records `anchorCommit` as the FROZEN BASE literal `bda6ff495513688fc1680d671d1e019013dd7a9a` and `anchorHead` as run-time HEAD, and still refuses (exit 2) unless the run-time merge-base IS the frozen base (stale-base tripwire). §6 asserts the live run's `anchorCommit` EQUALS the frozen literal; §6b fires the tripwire live with a git shim that answers `merge-base` as `4266e6ccef2a` (a real base that differs) — the driver stops with `LAUNCHFIELD STOP: merge-base 4266e6ccef2a !== frozen base bda6ff495513 — re-freeze, do not amend silently.` Proof on the frozen tip: **52 passed, 0 failed** (incl. §6b's 3 checks; analyzer selftest 71/71; §3b old-band regression green).

### Pilot sequence

- **Proof test (~14:00–14:05 UTC):** 52/52 green on the frozen tip. §4 live 150d run on screening seed 107383 recorded 529 holder-state rows, 18 gate picks, 18 seed rows, 12 pool rows, 130 census rows — identical counts to the judged 107383 corpus, confirming determinism across processes. D1/D2 at 30d green (repeatability + recorder neutrality).
- **Judged pilot (~14:05–14:24 UTC):** full 8-seed pilot on the frozen base with the frozen substrate; ran to completion, 8/8 seeds, 0 instrument errors each. Driver exit 0. Corpora in `perseed-launchfield-refreeze-b-107383-107390/`.
- **Analyzer (~14:24 UTC):** 8/8 files, 0 errors, verdict per the analyzer's legacy bars DIAG-GO (mechanism UNTESTED) — the frozen bar's clause (d) is judged here, in this evidence, and it fails: **DIAG-NO-GO on supply**.

### Flap + incident log (worker, 2026-11-22)

- No write-flap incidents during this arm: the prereg, instrument, corpora, legs log, and analysis all wrote first-attempt. The band-freshness `grep` over `scripts/` + `evidence/` took ~132s (tree size, not a flap).
- No VM restart, no SIGTERM, no index clobber during this arm.
- One slow spot: the freshness grep's js/json scope listed 10 October JSON files; each was inspected by hand and all are pantry calorie values, not seeds (recorded in the prereg).
