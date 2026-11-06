# sim-baseline9-a — preregistration (why the stageally-confirm baseline killed 9 wave-4 monsters while the staged leg killed 3)

- Run: `fleshout-20261106T1515Z`, Loop A, axis scale-onramp / winnability chain
- Arm: `sim-baseline9-a`, branch `sim-baseline9-a`,
  worktree `~/workspace/worktrees/sim-baseline9-a`
- Band: **53001–53008** (8 seeds) — deliberate reuse of the stageally-confirm
  band, where the armed TB-survival reversal was measured. This is the
  follow-up trace on that band, not a new lever trial. No new seed band is
  consumed.
- Horizon: **150d, death-aware** (reachability lever; §10). The confirm corpus
  already ran 150d death-aware on these seeds; the trace reads that corpus.
- Legs: competent-verbatim baseline vs staged, identical seeds (the confirm
  corpus, `evidence/2026-11-06/perseed-stageally-confirm-b/`, 16 files,
  anchor 2ff11cbf) + fresh verification legs on current master if the trace
  needs re-derivation — see method below.
- Policies: `scripts/policies/competent-stageally-a.js` (landed, verbatim;
  NOT modified). No new policy in this arm. No gate/price/deed/readyDemand
  change. Zero src/js.

## The question (stageally-confirm next blank 3)

Why did the baseline kill 9 wave-4 monsters while the staged leg killed 3
on identical seeds? The confirm evidence names the live split: the
baseline's 9 include 2 non-scholar-channel kills (companion Algorithm kills
with the scholar not in the fight) + 1 wild kill (Influencer, no scholar in
the fight), while all 3 armed kills are scholar-channel; TB survival 29.4%
baseline vs 13.5% armed. Three candidate explanations, to be separated with
numbers:

1. **Channel crowd-out** — the armed policy keeps the scholar always in the
   fight (staged party, rallies), so companion/wild channels that produced
   3 of the baseline's 9 kills never get a chance to fire; the baseline's
   killers sometimes are not the scholar.
2. **Luck / band draw** — the 9-vs-3 split is seed volatility (the pilot
   band read the other way: armed 8, baseline 2), with no systematic
   channel or fight-interior difference once kills are classified.
3. **Rally cost** — the rally's round-1 strike cost bites harder when the
   fights are this fragile (finishprobe's arithmetic: survival × damage vs
   entry HP). NOTE: fightinterior-b (fresh band 51001–51008, landed)
   already measured this suspect DEAD on its band — scholar round-1 damage
   0 in 59/59 fights on both legs; round 1 is a closing round, the rally
   displaces a move, not a strike. This arm checks whether THIS band's
   corpus shows anything different (tbFights rows: scholar strikes in
   round 1, rally fights vs not) and reports it as context; it does not
   re-litigate fightinterior-b's measurement.

## Primary metric and verdict rule (DIAG arm)

This arm builds no policy and pilots nothing, so it is judged as a
diagnosis, not a lever trial:

- **Primary metric:** kill-channel census completeness — every wave-4 kill
  on the band (both legs, 12 total: 9 baseline + 3 armed) classified by
  channel (scholar TB / companion / wild / field), with fighter, monster,
  rounds, allies/party at entry, and entry HP where observable; plus a
  TB-loss anatomy by leg (rounds survived, damage dealt where recorded,
  scholar HP at end) for the 24 baseline + 32 armed lost TB fights.
- **DIAG-GO** iff every wave-4 kill on the band is classified AND the
  channel question is answered with numbers — the 9-vs-3 split is
  attributed, with counts, to channel crowd-out vs luck vs rally-cost
  (one of the three named as the leading explanation, with the numbers
  that rule the others in or out).
- **DIAG-NO-GO** iff the corpus cannot answer the channel question and a
  recorder re-run cannot either (e.g. kill channels unobservable, or the
  fight rows needed to separate the candidates are missing and
  unrecoverable).
- Reported alongside (context, NOT re-judged — the confirm already judged
  it NO-GO): the stageally bar — living pair ≥1 seed OR post-first-blood
  wave-4 kills ≥3. The confirm measured pair 0/8, post-blood 1 (armed) /
  4 (baseline). This arm explains why; it does not re-score the bar.
- Guards (reported, not gated): median survival by leg (confirm: armed
  111.5d vs baseline 108d); no new death mode introduced (the instrument
  records only — it changes no game behavior).

## Method

1. **Analyzer** (`scripts/baseline9-analyze-20261106.js`) over the existing
   confirm corpus (16 files). Sources per kill: `waveKillLog` (kill
   day/monster/via/by — the authoritative kill list, see pyrrhic note
   below), `killsLive` (same rows, channel fields `via` /
   `scholarChannel`), `tbFights` (matched fight row: allies/party at
   entry, rounds, outcome, scholar HP at end), `fights` (field-fight
   channel), `killerTrack` (killer identity per kill), `daily` (party
   state, scholar identity per day — succession boundaries), `deathSays`
   + `fightLines` (sense-test scenes for the 9 baseline kills).
2. **Recorder re-run ONLY if the corpus lacks the detail the verdict
   needs** (entry HP / per-round damage for the kill fights, or a channel
   that cannot be read from `via` + matched fight row): build a
   kill-channel recorder (wrap `recordWaveKill` + `tbEnd`, capture entry
   HP and per-round damage; mind the pyrrhic path — see below) and re-run
   ONLY the legs needed on the same band — no new seeds.
3. **Fresh verification legs** on current master if the trace needs
   re-derivation (e.g. a kill channel that only reproduces live): same
   stageally driver, same band, 150d. Compare trajectories to the corpus
   (kill days/monsters/channels, TB survival). If trajectories match, the
   corpus trace stands on current master. If they diverge, the trace is
   re-derived from the fresh legs and the divergence is reported.
4. **Proof** (`scripts/test-baseline9-20261106.js`): analyzer runs on the
   corpus with 0 errors; headline numbers reproduce the confirm evidence
   (kills 3 armed / 9 baseline; TB survival 13.5% / 29.4%; ally presence
   73.0% / 44.1%); every wave-4 kill classified. Green before the
   evidence file is written.
5. **Sense test:** read the kill scenes (deathSays, fightLines) for the 9
   baseline kills — judge meaning, coherence, relevance, consequences,
   never just counts.

## Seed-freshness record (band 53001–53008)

- Reserved by the 0615Z run for the stageally confirms ("extension band
  53001–53008 RESERVED for this run's confirms (0 hits everywhere)",
  claim fleshout-20261106T0615Z.json.DEAD). The confirm prereg verified
  0 hits in ALL preregs and 0 hits in evidence .md except the range
  endpoints.
- Reuse check for THIS arm (2026-11-06): "53001" hits in preregs are
  references to the stageally-confirm band only (killersurvive-a prereg:
  same deliberate reuse for the follow-up trace). No other arm ran judged
  sims on this band. No forbidden-band list names it (no hits in the goal
  hidden_files forbidden lists). The band is REUSED DELIBERATELY for the
  follow-up trace — same seeds, same legs, new questions — not fresh, and
  not claimed fresh.
- Loop B is live in parallel on sim-tableoffer-b (landed). This arm does
  not duplicate it. Killersurvive-a (sibling, landed DIAG-GO) covered
  first-killer death channels + party persistence on this same band; this
  arm covers the kill-channel split only and does not re-derive its
  findings.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE — no armed leg exists in this
  arm (no policy built, no before/after pair). Same outcome as the pilot,
  the confirm, killersurvive-a, and fightinterior-b: the panel runs its
  own full panel and takes no corpus input, so it cannot compare
  competent vs staged on identical seeds. No compare `.md` is fabricated.
- `scripts/telemetry-check.js`: expected REFUSED on the recorder corpus
  (same as the confirm — all rows carry top-level anchorCommit). Record
  the result; the wall numbers in the evidence file are the instrument's
  own.

## Metric review (pre-run note)

- **Pyrrhic kills bypass `recordWaveKill`** (fightinterior-b): pyrrhic
  kills write `waveKillLog` directly and never pass the instrument's kill
  hook, so fight-level kill counts undercount the log. Read
  `waveKillLog`, not only `killsLive` / fight endings. On the confirm
  band the kill list in the evidence file is drawn from the log (9 vs 3);
  the analyzer classifies from the log and cross-checks `killsLive`.
- **`via` is the channel read, `scholarChannel` the scholar-in-fight
  read.** `via: player` = scholar kill; `via: companion` = a companion
  killed it; `via: wild` = no scholar in the fight at all. A companion
  kill with the scholar in the fight (the 51005 day-107 Strike shape:
  rally, grind together, ally lands the last blow) is a different channel
  from a companion kill with the scholar absent — the analyzer separates
  them via the matched `tbFights` row + `scholarChannel`, not by `via`
  alone.
- **wavesFaced is a per-TYPE map** (monster id → count), not a per-wave
  count (fightinterior-b correction). Do not read `wavesFaced[4]` as
  "wave-4 faced"; count distinct faced types per wave from
  `src/data/monsters.json` if a faced number is needed.
- **tbEnd result strings:** the engine emits `'routed'` as well as
  `'rout'` (fightinterior-b D1 miss). The analyzer normalizes both to
  `rout` when classifying TB outcomes.
- **The 1-round solo Congregation kill (53006 day 149, armed)** is a
  stageally-confirm blank (4): the instrument records no per-turn damage
  trace. Fightinterior-b's nearest shape (wounded-entry kill at 123 HP
  on 51005) suggests a deeply-wounded entry, not a one-shot — this arm
  records the kill's channel (scholar TB, solo) and checks whether the
  corpus shows prior field grinding of the same monster type; it does not
  claim to prove the entry HP without a recorder re-run.
- **Entry HP is not in the confirm corpus** (no per-turn damage trace —
  the fightinterior recorder was built for the fresh band, not this one).
  The verdict rule is written so the channel question can be answered
  from the log + fight rows alone; entry-HP detail is a recorder re-run
  (method step 2) only if a candidate explanation turns on it.
