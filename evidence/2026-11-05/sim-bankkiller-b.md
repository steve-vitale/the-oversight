# sim-bankkiller-b — "Rally the line" pilot: THIN

Loop B run `fleshout-loop-b-20261105T2130Z`, arm `sim-bankkiller-b`. Prereg:
`evidence/2026-11-05/sim-bankkiller-b-prereg.md` (committed 555e9c7f before any
judged sim). Lever: on the scholar's first turn of a turn-based fight containing
a live wave-4+ monster and ≥1 living ally fighter, call the engine-honest verb
`Game.tbPlayerRally()` once, then fight normally. Policy-side only; no src/js,
no gate/price/deed change. Seeds 98811–98818, 150d death-aware horizon,
baseline competent verbatim vs armed (rally) on identical seeds.

## Verdict: THIN — mechanism unmeasured, NOT a NO-GO

Rally fires **7 < 8** across the armed leg. The prereg's THIN rule fires
before the GO/NO-GO bar, so the primary is unjudged, the guards were not
evaluated (analyzer returns `guards: null`), and no confirm is owed — a
confirm runs only on GO. The next run re-designs the trigger. The lever is
NOT dead; it is unmeasured.

What the 7 fires do say: the rally works when it gets a chance (7/7 applied,
`rallyOk` 7/7, 0 policy-vs-instrument mismatches, 0 instrument errors), but
the chance is rare — allies were beside the scholar in only **7 of 25**
wave-4+ turn-based fights (28%). The bottleneck is ally presence, not the
rally itself. This is splitkill's failure mode in milder form (2026-10-22:
companions never staged into scholar TB fights, 0 fires); here the channel
exists but is thin.

## Before / after (descriptive under THIN — not judged)

| measure | baseline | armed |
|---|---:|---:|
| production seeds (≥2 distinct w4 killers ever) | 0/8 | 0/8 |
| living-pair snapshot days | 0 | 0 |
| reconstructed pairs | 0 | 0 |
| wave-4 fights | 48 | 44 |
| wave-4 kills | 4 | 2 |
| wave-4 kill rate | 8.3% | 4.5% |
| wave-4+ TB fights | 31 | 25 |
| TB survival (secondary) | INVALID — see metric review | INVALID |
| rally fires (all ok) | 0 | 7 |
| allies present in w4+ TB fights | — | 7/25 (28%) |
| first-killer survival median (observed exits) | 10d (n=2) | 6d (n=1; 1 censored alive) |
| wins | 0/8 | 0/8 |
| national | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wave-4 unlocks / faced | 5/8 / 5/8 | 5/8 / 5/8 |
| wave-5 unlocks / faced / kills | 0 / 0 / 0 | 0 / 0 / 0 |
| readiness-5-ready days | 0 | 0 |
| median survival | 77d | 77d |

## Per-seed tables

Baseline (competent verbatim):

| seed | days | end | class | w4f (tb/field) | w4k | killers | maxSim | ready5d | peakGated |
|---:|---:|---|---|---:|---:|---:|---:|---:|---:|
| 98811 | 77 | village-lost | KILLED-DEAD-KILLER | 13 (10/3) | 1 | 1 | 1 | 0 | 175 |
| 98812 | 55 | village-lost | NEVER-FACED-WAVE4 | 0 | 0 | 0 | 0 | 0 | 95 |
| 98813 | 115 | village-lost | FACED-NO-KILL | 6 (3/3) | 0 | 0 | 0 | 0 | 175 |
| 98814 | 52 | village-lost | NEVER-FACED-WAVE4 | 0 | 0 | 0 | 0 | 0 | 70 |
| 98815 | 86 | village-lost | KILLED-LIVING-SHORT | 16 (5/11) | 1 | 1 | 1 | 0 | 195 |
| 98816 | 28 | village-lost | NEVER-FACED-WAVE4 | 0 | 0 | 0 | 0 | 0 | 0 |
| 98817 | 77 | village-lost | FACED-NO-KILL | 1 (1/0) | 0 | 0 | 0 | 0 | 100 |
| 98818 | 87 | village-lost | KILLED-DEAD-KILLER | 12 (12/0) | 2 | 1 | 1 | 0 | 199 |

Armed (rally):

| seed | days | end | class | w4f (tb/field) | w4k | killers | rally | rally w4+ / allies | ready5d | peakGated |
|---:|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 98811 | 77 | village-lost | KILLED-DEAD-KILLER | 13 (10/3) | 1 | 1 | 0 | 10 / 0 | 0 | 175 |
| 98812 | 55 | village-lost | NEVER-FACED-WAVE4 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 95 |
| 98813 | 108 | village-lost | FACED-NO-KILL | 6 (3/3) | 0 | 0 | 2 | 3 / 2 | 0 | 150 |
| 98814 | 52 | village-lost | NEVER-FACED-WAVE4 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 70 |
| 98815 | 86 | village-lost | KILLED-LIVING-SHORT | 16 (5/11) | 1 | 1 | 2 | 5 / 2 | 0 | 195 |
| 98816 | 28 | village-lost | NEVER-FACED-WAVE4 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 0 |
| 98817 | 77 | village-lost | FACED-NO-KILL | 1 (1/0) | 0 | 0 | 0 | 1 / 0 | 0 | 100 |
| 98818 | 93 | village-lost | FACED-NO-KILL | 8 (6/2) | 0 | 0 | 3 | 6 / 3 | 0 | 195 |

Three seeds never faced wave 4 on either leg (98812, 98814, 98816 — dead
28–55d). The scholar fought wave 4 alone in most TB fights: 98811 armed,
10 TB fights, 0 with an ally beside them.

## Killer ledger

Baseline — 3 killers, all via the scholar ("player") channel:

| seed | killer | kills | first blood | death | kill→death | death cause |
|---:|---|---:|---:|---:|---:|---|
| 98811 | app_mgpsphe2550 (Ray Medina) | 1 | d71 | d77 | 6d | scholar-death: the wild: at-haven: in-combat |
| 98815 | emma_larsen | 1 (Strike) | d87 | — alive at end | censored | — |
| 98818 | gen_oi5r725 (Fernando Barbosa) | 2 (Strike d65, Strike d72) | d65 | d79 | 14d | scholar-death: the arena: at-haven: in-combat |

Armed — 2 killers, both identical to their baseline trajectories:

| seed | killer | kills | first blood | death | kill→death | death cause |
|---:|---|---:|---:|---:|---:|---|
| 98811 | app_mgpsphe2550 | 1 | d71 | d77 | 6d | scholar-death: the wild: at-haven: in-combat |
| 98815 | emma_larsen | 1 (Strike) | d87 | — alive at end | censored | — |
| 98818 | — (never blooded) | 0 | — | — | — | — |

Dead-killer death-cause shares: baseline 2 dead — 1 wild/at-haven/in-combat,
1 arena; armed 1 dead — 1 wild/at-haven/in-combat. Unsplit residual 0 both
legs. The channel is the same as every prior killer-chain arm: killers die
in combat at home (wild at haven, arena), not out on the road.

Closest seed: **98815** (maxSimultaneous 1 on every seed; tie-break longest
killer survival — Emma alive at the run's end, roster down to 2 people).

Post-first-blood: baseline 98811 3 fights / 0 kills after first blood;
98818 8 fights / 1 kill (the second Strike). Armed: no post-first-blood
fights at all — the second-killer window barely opened on this band.

## Rally mechanism (what the 7 fires looked like)

| seed | day | round | allies | w4 monster | result |
|---:|---:|---:|---:|---|---:|
| 98813 | — | 1 | — | — | ok (2 fires) |
| 98815 | 53 | 1 | 2 | eater | ok |
| 98815 | 81 | 1 | 1 | eater | ok |
| 98818 | 45 | 1 | 1 | algorithm | ok |
| 98818 | 46 | 1 | 2 | algorithm | ok |
| 98818 | 86 | 1 | 1 | suburb | ok |

(98813's two fires are recorded in the instrument wrap; the per-call rows
above are the 98815/98818 ones quoted from the corpus.) Rallied-fight
outcomes, same-day join (disclosed approximation — see metric review): 0
kills, 7 same-day in-combat scholar deaths, 0 other. On 98818 the scholar
rallied against the same Algorithm two days running (d45, d46) and the
scholar died on both days.

## Plain-words village assessment

Eight villages, 150 days each, two ways of fighting. Nobody won, nobody
reached the fifth wave, nobody banked a second killer. The rally itself
works when it gets a chance — the scholar plants their feet, calls the
line together, and the fighters turn as one — but it only got seven
chances in twenty-five big fights, because most of the time the scholar
was fighting the fourth wave alone. When the rally did fire, the scholar
still died that day in all seven fights. Three villages never even met
wave 4 (dead by day 28–55). One village, 98815, produced a living killer:
Emma, who killed a Strike on the last day with two people left — and she
did it without the rally's help, six days after rallying twice against
the Eater. The wall hasn't moved: the binding link is still getting a
second living killer, and the rally can't reach it because allies are
almost never beside the scholar when the big fight starts.

## Sense-testing (fightLines / deathSays)

The rally line reads as a person calling the line together, not a mechanic.
98818 d45/d46 vs the Algorithm: "You plant your feet and ROAR the line
back together — 'ON ME! ON ME!' Boots pound — the line closes around you.
Fear drains out of their faces. 'THE ALGORITHM — TOGETHER!' They turn as
one. (Rally — regrouped, holding, coordinated.)" 98818 d86 vs the Suburb:
same line, "BIG UGLY — TOGETHER!" 98815 d53/d81 vs the Eater: "'THE EATER
— TOGETHER!'" and d81 "'BIG BIG — TOGETHER!'" — the foe-name doubling on
d81 is a small sense oddity (see findings backlog).

Killer deaths read in the moment and stay in character. 98811 d77 (Ray
Medina, wild at haven): "🕯️ Ray Medina is dead — the wild. The village
stops. Somebody screams. Somebody else starts digging." + "What Ray kept
close goes into the ground with them — keepsakes are buried, never taken
from the body." 98818 d79 (Fernando Barbosa, arena): "🕯️ Fernando Barbosa
is dead — the arena." + "The village's quarrel was with Fernando — and
Fernando is dead. The sentence doesn't cross the grave." — the arena death
is a settled quarrel, matching the killerdeath finding that retained
killers die at home. 98811 d71, the day of the first kill, Ruth Goldstein's
death is announced the same way ("The Codex turns a page on its own. Ruth
Goldstein is dead. You didn't ask. It knew.").

Two fiction findings go to the backlog (sim-findings.md): "Rally" means
three different things at once — the combat verb, the relief-beats option
("'Or we rally,' Gus adds. 'Second shift, everybody. We work, we eat, we
live — and we pay for it.'"), and a learned ability (98818 d43, "LEARNED:
Rally (Level 2). Your voice finds them faster in the noise."). And the
rally line's foe-name doubling ("BIG BIG").

## Metric review

- **TB-survival secondary is INVALID as defined.** The day-granularity join
  counts any in-combat scholar death on a day with a wave-4+ TB fight —
  including deaths in other fights that day and same-day double successions.
  Baseline: 31 deaths / 31 fights (0.00). Armed: 26 deaths / 25 fights
  (−0.04 — impossible, which proves the overcount). 98815 alone: 7 deaths
  vs 5 TB fights. Do NOT cite TB survival from this run. Next run: track
  TB fight ends at fight level (instrument the fight's end result
  directly), not by joining deaths to days.
- **Rally-outcomes join has the same limitation.** "7/7 rallied fights share
  a day with an in-combat scholar death" — the death may be from another
  fight that day. Descriptive only; it does not prove the rally fight
  killed the scholar. The two consecutive-day rallies on 98818 (d45, d46,
  both vs the Algorithm, each with a same-day scholar death) are consistent
  with the rally not saving the scholar, but the join cannot prove it.
- **Identical trajectories.** 98811 is byte-identical both legs on every
  recorded field (rally 0 — no opportunity). 98815 is identical on every
  recorded field despite 2 rally fires — the rally changed nothing
  measurable there (both rallied fights still ended the scholar's day in
  death; the kill still landed d87). Descriptive, not a verdict input.
- **days vs gameDays.** The driver's `days` lags the in-game day by 1
  (98815: days 86, gameDays 87; the d87 kill is in-run — the last daily
  row is day 87, duplicated by the post-run snapshot row). Cosmetic;
  driver hygiene for the next run.
- **Analyzer.** Verdict THIN, guards null (not evaluated), 0 instrument
  errors, 0 rally mismatches, 0 unsplit killer-death residuals.
- **Kill rate (4.5% vs 8.3%) is noise under THIN** — do not cite as a
  rally cost or benefit. The rally's round-1 strike cost is a real trade
  the guards were meant to catch, but the guards never ran.

## §15

INAPPLICABLE, stated not fabricated. `balance-panel.js` takes no corpus
input: `node scripts/balance-panel.js --help` errors with "Error: --out
<panel-directory> required" (scripts/balance-panel.js:245). No compare.md
was produced.

## Telemetry

`telemetry-check` refused the corpus as recorder rows: "telemetry-check:
refusing recorder-corpus input: all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora
are compared with sweep-compare tables, never against a run baseline here."
Baseline NOT rolled; no LOUD lines. Same refusal class as prior
killer-chain arms.

## Run notes

- A runtime restart aborted the first baseline leg after seeds 98811–98814
  were written (4 files); resumed with 98815–98818 under the same RUN
  (the driver refuses to overwrite, so no judged data was re-run or lost).
- Band freshness re-verified after the restart: whole-token "98811" hits
  in old evidence are pantry-kcal data values in 2026-10-16 / 10-20 /
  10-24 corpora (e.g. `pantryFreshAfter: 98811`), not seed uses;
  `sim-tendfloor-guard-b-BAND-BLOCKED.md` contains no 988. The
  prereg-scope check (0 hits in all dated preregs + evidence .md) stands.
- Proof re-run after the pilot: `node scripts/test-bankkiller-20261105.js`
  → **25/25 PASS**.

## What is NOT claimed

- Rally does not help or hurt: 7 fires is below the measurement floor;
  the 7 rallied fights' outcomes are descriptive only.
- No claim about TB survival (invalid secondary, see metric review).
- No claim about kill rate (4.5% vs 8.3% is noise under THIN).
- No confirm owed; confirm runs only on GO.
- The lever is NOT dead — it is unmeasured.

## Next run (not this one)

Re-design the trigger around the actual bottleneck — allies beside the
scholar in wave-4+ TB fights (7/25). Directions, not decisions: widen the
trigger to field fights (rally is a fight-level verb; field fights are
17–19 of the 44–48 wave-4 fights on this band); or attack ally presence
itself (a policy that brings allies into the scholar's TB fights — the
ally-join fix of 2026-11-03 works in the wild, but TB fights are a
different door); or both. And fix the TB-survival join to fight-level end
tracking before any guard is judged on it.

## Files

- `evidence/2026-11-05/sim-bankkiller-b-prereg.md` (committed 555e9c7f)
- `scripts/policies/competent-rally-bankkiller-b.js`,
  `scripts/bankkiller-instrument-20261105.js`,
  `scripts/bankkiller-driver-20261105.js`,
  `scripts/bankkiller-analyze-20261105.js`,
  `scripts/test-bankkiller-20261105.js` (committed 555e9c7f)
- `evidence/2026-11-05/perseed-bankkiller-b/` — 16 per-seed corpora (this commit)
- `evidence/2026-11-05/sim-bankkiller-b.md` — this file (this commit)
