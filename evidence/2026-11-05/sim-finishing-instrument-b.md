# Finishing instrument — wild wave-4 fights, round by round (arm build-finish-instrument)

Date: 2026-11-05. Branch: `build-finish-instrument`. Base: master `6b516a7ea`.
Prereg: `evidence/2026-11-05/finishing-instrument-prereg.md` (Amendments 1–2).
Verdict: **GO** — the instrument fires completely, changes nothing, breaks nothing.
The ending distribution below is the finding, not a lever.

## What was built

`src/js/finishLog.js` (new, observe-only, no RNG) records every wild wave-4+
fight into game telemetry as one `fight_finish` event, with a runtime-only
ring (`Game._finishLog`, bounded 200, never saved) holding the same records
for sim drivers. Each record carries: channel (field vs player turn-based),
day, monster, wave, fighter composition (scholar + companions, gear tier,
abilities held), ending, outcomeRaw (the engine's own outcome), damage
fraction, the full `rounds` array, and `last3` (the final three round
records). Per round: HPs at round start/end (fighter, monster, ally),
damage dealt/taken that round (leader/ally split), abilities and tricks
fired that round, and the round's end state. Field rounds are captured
in-engine (`fieldFights.js`); player turn-based rounds are observed via
wraps on `startCombat` / `tbAdvance` / `tbEnd` / `useAbility`.

Ending taxonomy: `kill` (monster died — TB kills only on a strict
waveKillLog match: same monster, same day, killer among the fight's
fighters, scholar counting as `player`, by companion id, or by the
record's fighter id), `rout` (TB `won` with no matching kill row — the
monster broke, nobody's kill is logged), `flee`, `death`, `timeout`
(field 15-round cap), `evade`, `unfinished` (still open at finalize).

## The r1 pilot found two gaps — fixed before the judged run (Amendment 2)

The r1 pilot (same seeds, same policy/horizon) proved coverage on its own
terms (45/45 fights with rounds, 45/45 matching telemetry events, 0
errors), but its analysis found two real gaps:

1. TB round snapshots were HP-only — no per-round dealt/taken/abilities,
   so the last-3 and terminal tables were field-only. Fixed: TB snapshots
   now carry dealt/taken as backward deltas from the previous snapshot
   (the terminal round's dealt is exact; interior rounds carry the
   documented one-snapshot attribution lag of the tbAdvance timing),
   leader/ally taken split, round-start/end HPs, and per-round abilities.
2. The strict kill match missed the scholar: the kill log records the
   scholar's villager id, but the analyzer only accepted `player` or a
   companion id. One r1 kill (seed 99317, eater, day 40) was therefore
   classed `rout` and its kill row left unmatched. Fixed in both the
   instrument and the analyzer: a log row matches when `by` equals the
   record's `fighter` id too. The TB `fighters` list now also names the
   whole human side (scholar first, then companions — it was
   companions-only, so partySize undercounted by one), and TB snapshots
   fill the player entry's vid from the fighter id (was null).

The judged run is R2 (RUN `finish-instrument-pilot-r2`). R1 files are
retained in `perseed-finish-instrument/` as the pilot that found the
gaps. R1 and R2 per-seed trajectories are identical (same days,
endReasons, standings, fight counts, kill counts on all 8 seeds) — the
Amendment-2 changes changed no outcomes.

## Panel (judged leg, R2)

Policy: competent verbatim only. Horizon: 150d, death-aware (every village
died before the horizon — no village reached 150 days). Seeds 99311–99318
(fresh band; first candidate 99301–99308 rejected as the diplo-b band).
Driver: `scripts/finishing-instrument-driver-20261105.js`.
Analyzer: `scripts/finishing-instrument-analyze-20261105.js`.

| seed | days | end | standing | maxWave | fights | kills |
|------|------|-----|----------|---------|--------|-------|
| 99311 | 50 | village-lost | 70 | 3 | 0 | 0 |
| 99312 | 111 | village-lost | 150 | 4 | 7 | 0 |
| 99313 | 65 | village-lost | 100 | 4 | 7 | 0 |
| 99314 | 103 | village-lost | 125 | 4 | 3 | 0 |
| 99315 | 121 | village-lost | 150 | 4 | 10 | 0 |
| 99316 | 68 | village-lost | 199 | 4 | 6 | 1 |
| 99317 | 81 | village-lost | 199 | 4 | 12 | 1 |
| 99318 | 60 | village-lost | 0 | 3 | 0 | 0 |

45 wild wave-4 fights in total (10 field, 35 player turn-based).

## Finding 1 — ending distribution (metric 2)

| ending | all | field | player-TB |
|--------|-----|-------|-----------|
| kill | 2 | 0 | 2 |
| flee | 5 | 5 | 0 |
| death | 38 | 5 | 33 |
| timeout / evade / unfinished | 0 | 0 | 0 |

Kill conversion: **2 / 45 = 4.4%** — in line with secondkiller's 5.2%
(3/58). No fight hit the round cap; nothing ended unfinished.

## Finding 2 — solo vs party is the sharpest split

| composition | fights | kill | flee | death |
|-------------|--------|------|------|-------|
| solo | 17 | 0 | 0 | 17 |
| party (2+) | 28 | 2 | 5 | 21 |

Every solo fight in the panel ended in the scholar's death — 17 of 17,
no kill, no flee. Both kills came from parties. The field channel never
killed: 10 field fights, median 2.6% of monster HP dealt, 5 fled / 5
died. Overall median damage dealt is 11.2% of monster HP; median fight
length is 6 rounds.

## Finding 3 — last 3 rounds (metric 3)

Across all 45 fights (128 last-3 rounds now that both channels carry
per-round damage): median 14 damage dealt per round, fighters entering
the last 3 rounds at a median 55% HP, tricks fired in 0 of the rounds,
abilities fired in 13. Abilities were used somewhere in 13 of the 45
fights.

## Finding 4 — terminal-round signature (metric 4)

| ending | fights | median rounds | median dmg frac | final-round dealt | final-round taken | fighter HP at end |
|--------|--------|---------------|-----------------|--------------------|--------------------|--------------------|
| kill | 2 | 12 | 1.00 | 243.5 | 0 | 1.00 |
| flee | 5 | 3 | 0.05 | 22 | 33 | 0.26 |
| death | 38 | 6 | 0.12 | 0 | 52.5 | −0.14 |

Plain words: the two kills finished at full HP, dealing escalating
damage in the last three rounds (60 → 178 → 341 on the congregation;
65 → 116 → 146 on the eater) while taking nothing — the monster was
already beaten by then. Fights that end in flight end early (median
round 3, 5% damage dealt) with the fighter hurt (26% HP). Fights that
end in death end with the fighter dealing nothing in the final round
while taking ~52 damage — and the fighter's HP at the end is negative
in 33 of the 38 deaths: the killing blow overkills. One of those is
extreme — seed 99314, day 101, eulogy, solo scholar, round 6: the
scholar took **5,235 damage in a single round** from 49 HP (monster HP
unchanged that round, dealt 0). That is a one-shot, not a grind; whether
a wave-4 monster should be able to deal 5,000+ damage in one round is
a design question, not an instrument question.

## Metric review (pre-registered, judged strictly)

1. **Coverage — PASS.** 45/45 fights with rounds ≥ 1 have a
   `roundsDetail` with exactly one entry per round AND a matching
   `fight_finish` telemetry event; 0 coverage problems, 0 unmatched
   kill-log rows, 0 TB kills matched without a log row, 0 instrument
   errors. (R1's 1 unmatched kill / 1 rout was the Amendment-2 gap,
   fixed; R2 has 0.)
2. **Ending distribution — reported** (Finding 1). No bar pre-registered.
3. **Last-3-rounds — reported** (Finding 3). No bar pre-registered.
4. **Terminal-round signature — reported** (Finding 4). No bar
   pre-registered.
5. **Neutrality — PASS.** `FINISHLOG_OFF=1` matches the on-leg exactly
   on days, endReason, and waveKillLog length on both required seeds:
   99311 via the proof test's neutrality leg (10d) and 99312 via a
   manual off/on pair (10d: both `survived`, 0 kill-log rows, 0 fights
   off, 0 errors on). Supporting: R1 vs R2 trajectories identical on
   all 8 seeds at full 150d horizon after the Amendment-2 changes.
6. **Suite — PASS.** `node scripts/check.js --quick` on the final
   code (Run 4): 280 passed / 10 failed in 1697s. All 10 failures are
   from the standing set (7 assertion families + 3 load timeouts);
   `test-sw-audio-cache` passes. No new failures vs the standing
   279 passed / 11 failed profile.

## Proof test

`scripts/test-finishing-instrument-20261105.js`: **35/35 PASS** — live
field fight vs congregation (roundsDetail complete, dealt/taken books
balance, HP chain holds, ring + telemetry present), wave-3 spool fight
correctly not recorded, live player TB fight vs congregation (record
shape correct, per-round dealt/taken present, player vid filled,
dealt sums, telemetry present), analyzer fixtures (good/clean, broken
HP chain flagged, short rounds flagged, TB dealt missing flagged,
scholar kill matched / outsider unmatched), neutrality off/on via
driver subprocesses into /tmp (10 days, seed 99311).

## Check.js

- Standing profile (base `6b516a7ea`, r105): 279 passed / 11 failed.
- Run 1 (pre-offline-regen, this branch): 282 passed / 8 failed — the
  extra failure was `test-sw-audio-cache`, caused by the new script tag
  in `index.html` requiring an offline-asset regen per `docs/OFFLINE.md`
  (fixed by regenerating `sw.js`; `test-offline-assets.js` 192 checks
  green, `test-sw-audio-cache` 7/7 standalone).
- Run 2 (post-regen, pre-Amendment-2): 281 passed / 9 failed — all 9
  from the standing set (7 assertion families + 2 load timeouts);
  `test-sw-audio-cache` no longer failing.
- Run 3 (final code, Amendment 2): ABORTED — the process died at
  287/290 dots with no summary (no exit code recovered; box heavily
  loaded with sibling suite runs at the time). Not citable; superseded
  by Run 4.
- Run 4 (final code, Amendment 2): 280 passed / 10 failed in 1697s.
  Failures: measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, measurement-cache-flags, occupation-panels,
  phone-frame-proof, establishment-r20-fixes (all standing assertion
  families) + solo-campaign-endings, trust-observer-neutrality,
  capable-bot (all 120s load timeouts). `test-sw-audio-cache` passes.

## Balanced-panel note

Single-arm instrument run (DIAG). No Game-root change: the instrument
is observe-only (no RNG, no outcome reads, no state writes except the
telemetry ring and its own runtime ring). §15 does not apply, as in
secondkiller.

## Commits (branch `build-finish-instrument`)

- `12020e986` prereg
- `a5c104af0` instrument (`src/js/finishLog.js`, `src/js/fieldFights.js`,
  `index.html`, `docs/ONTOLOGY.md`) + Amendment 1
- `c4ef66e9e` driver + analyzer + proof test (29/29)
- `c91a94cd7` offline-asset regen for `finishLog.js` (`sw.js`)
- `1956ba4b8` proof-test cleanup (dead line)
- `9e11d8747` prereg Amendment 2
- `65e100beb` Amendment-2 fixes (TB per-round dealt/taken, scholar kill
  match, scholar-first fighters) + proof 35/35
- `5339f891e` evidence: this note + R1/R2 per-seed data + prereg
  metric review
