# sim-killersurvive-a — preregistration (first-killer death channels + party persistence across succession)

- Run: `fleshout-20261106T1415Z`, Loop A, axis scale-onramp / winnability chain
- Arm: `sim-killersurvive-a`, branch `sim-killersurvive-a`,
  worktree `~/workspace/worktrees/sim-killersurvive-a`
- Band: **53001–53008** (8 seeds) — deliberate reuse of the stageally-confirm
  band, where the armed TB-survival reversal was measured. This is the
  follow-up trace on that band, not a new lever trial.
- Horizon: **150d, death-aware** (reachability lever; §10). The confirm corpus
  already ran 150d death-aware on these seeds; the trace reads that corpus.
- Legs: competent-verbatim baseline vs staged, identical seeds (the confirm
  corpus, `evidence/2026-11-06/perseed-stageally-confirm-b/`, 16 files,
  anchor 2ff11cbf) + fresh verification legs on current master (staged 53004,
  staged 53006, baseline 53006, 150d) — see method below.
- Policies: `scripts/policies/competent-stageally-a.js` (landed, verbatim;
  NOT modified). No new policy in this arm. No gate/price/deed/readyDemand
  change. Zero src/js.

## The two questions (stageally-confirm next blanks 2 + 5)

1. **First-killer death channels.** For every first wave-4 killer on the
   band (both legs): WHERE and HOW do they die after their first wave-4
   kill? Census the channels — in-fight (turn-based, matched fight row and
   killing monster) vs in-fight field vs contest vs at home (not in combat,
   at Haven) vs on the road (not at Haven, not in combat) vs other — plus
   days alive after the kill, party beside them at death, and health
   trajectory after the kill. The 0730Z run found killers die at home, not
   in the wild — re-test that on this band with the staged policy.
2. **Party persistence across succession.** When the scholar dies and
   succession passes, does the staged party (allies, gear, readiness)
   persist or scatter? Measure party size / party members before vs after
   each succession, whether the successor inherits the veteran bar (living
   wave-4 killers) and can continue the hunt, and what happens to the dead
   killer's party and gear. Whether a party SHOULD persist is a design
   question, not a measurement one — this arm measures what happens.

## Primary metric and verdict rule (DIAG arm)

This arm builds no policy and pilots nothing, so it is judged as a
diagnosis, not a lever trial:

- **Primary metric:** first-killer death-channel census completeness — every
  first wave-4 killer on the band (both legs) classified by death channel,
  with days-after-kill and party-at-death; plus a party-persistence answer
  (persist / scatter / partial) with the mechanism named.
- **DIAG-GO** iff every first killer is classified (no unclassified
  first-killer deaths) AND the persistence question is answered from the
  records with a named mechanism.
- **DIAG-NO-GO** iff the instrument cannot classify a first-killer death
  or cannot observe party state across a succession.
- Reported alongside (context, NOT re-judged — the confirm already judged
  it NO-GO): the stageally bar — living pair ≥1 seed OR post-first-blood
  wave-4 kills ≥3. The confirm measured pair 0/8, post-blood 1. This arm
  explains why; it does not re-score the bar.
- Guards (reported, not gated): median first-killer survival by leg; no
  new death mode introduced (the instrument records only — it changes no
  game behavior).

## Method

1. **Analyzer** (`scripts/killersurvive-analyze-20261106.js`) over the
   existing confirm corpus (16 files). Sources per killer: `waveKillLog`
   (kill day/monster/via), `killerTrack` (daily post-kill life: health,
   atHaven, onExped, isScholar), `scholarDeaths` (death day/cause/inCombat/
   atHaven/location), `fallen` + `deadMap` (villager deaths with cause and
   killing monster), `fights`/`tbFights` (matched fight row on the death
   day), `daily` (scholarId, partySize, partyIds, w4killers per day —
   succession boundaries and party state).
2. **Fresh verification legs** on current master (tip 04b668512): staged
   53004, staged 53006, baseline 53006, 150d, same stageally driver. Compare
   trajectories to the corpus (kill days/monsters, killer death days,
   succession days, party events). If trajectories match, the corpus trace
   stands on current master. If they diverge, the trace is re-derived from
   the fresh legs and the divergence is reported.
3. **Proof** (`scripts/test-killersurvive-20261106.js`): analyzer runs on
   the corpus with 0 errors; every wave-4 kill in the corpus has a killer
   record; headline numbers reproduce the confirm evidence (kills 3 armed /
   9 baseline; first-killer survival medians); death-day matching is
   complete for classified killers. Green before the evidence file is
   written.
4. **Sense test:** read the death scenes and succession lines for the first
   killers (deathSays, fightLines) — judge meaning/coherence, never just
   counts.

## Seed-freshness record (band 53001–53008)

- Reserved by the 0615Z run for the stageally confirms ("extension band
  53001–53008 RESERVED for this run's confirms (0 hits everywhere)",
  claim fleshout-20261106T0615Z.json.DEAD). The confirm prereg verified
  0 hits in ALL preregs and 0 hits in evidence .md except the range
  endpoints.
- Reuse check for THIS arm (2026-11-06): "53001" hits in preregs are
  references to the stageally-confirm band only (gorge/moot preregs: "Loop
  B is on 53001–53008"; proposefirst prereg lists "53001–53008
  (stageally-confirm)" among used bands). No other arm ran judged sims on
  this band. No forbidden-band list names it (no hits in the goal
  hidden_files forbidden lists). The band is REUSED DELIBERATELY for the
  follow-up trace — same seeds, same legs, new questions — not fresh, and
  not claimed fresh.
- Loop B is live in parallel on the same band with sim-fightinterior-b
  (fight interior with company present, instrument-only). This arm does not
  duplicate it: post-kill survival + succession persistence only.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE — no armed leg exists in this
  arm (no policy built, no before/after pair). Same outcome as the pilot
  and confirm: the panel runs its own full panel and takes no corpus input,
  so it cannot compare competent vs staged on identical seeds. No compare
  `.md` is fabricated.
- `scripts/telemetry-check.js`: expected REFUSED on the recorder corpus
  (same as the confirm — all rows carry top-level anchorCommit). Record the
  result; the wall numbers in the evidence file are the instrument's own.

## Metric review (pre-run note)

- The death-channel taxonomy is record-based (scholarDeaths + matched
  fight rows + fallen), not SAY-based — the finishprobe reclassification
  (SAY "got away" ≠ engine mFlee) applies here too: a death is classified
  by the engine record (inCombat + fight row), never by a narration line.
- `killerTrack` covers only killers (by wave-4 kill); non-killer scholar
  deaths are covered by `scholarDeaths`. A killer who is alive at the
  horizon is "alive at end", not a death — censored, reported as such.
- `atHaven` in scholarDeaths is the scholar's location flag at death;
  mapX/mapY 4,4 is the haven tile. A death with inCombat=True at the haven
  tile is a fight AT Haven, not a "died at home in bed" death — the channel
  taxonomy separates in-combat from not-in-combat first, location second.
- The 1-round solo Congregation kill (53006 d149) is a stageally-confirm
  blank (4), not this arm's: this arm records the killer's subsequent life,
  it does not explain the 1-round kill (no per-turn damage trace exists).
