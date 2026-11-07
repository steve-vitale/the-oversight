# sim-killersurvive-b — prereg: census every wave-4 killer's death (all killers, not just first)

**Arm:** sim-killersurvive-b (run fleshout-20261107T0221Z, Loop A, axis
scale-onramp / winnability chain, tracker blank #3: killer survivorship —
pairs die within days, the upstream binding problem).
**Diagnosis only, zero src/js unless a small, clearly-caused fix falls out
of the census (then proof test + before/after).** No gate/price/deed/
readyDemand change in this arm.

## Question

Wave-4 kills remain rare (25 per 64 villages per arm in drive64) and
killers die almost as fast as they are made. Census EVERY wave-4 killer's
death: days from their kill to their death, death cause, location/context
(field vs TB vs road vs haven vs contest), whether they died in the same
chain that made them, whether they ever fought again after the kill, and
whether the pair partner was alive at their death. Arm A (sim-killersurvive-a)
answered the FIRST-killer channels on band 53001–53008 (median 9–9.5d,
next-fight deaths, party persists). This arm extends it: ALL killers,
a band with many more kills (grind 99641–99648: 16 wave-4 kills), the
drive64 aggregates, and a fresh pilot on current master.

## Corpora (mine first, no re-running)

1. **Grind band 99641–99648** (`evidence/2026-11-06/perseed-grind-a/`,
   8 files, competent verbatim, 150d, anchor in each file): primary mine.
   Recorder rows carry waveKillLog, killsLive, fallen, scholarDeaths,
   tbFights, fieldFights (with instId), traces, killerTrack, daily.
2. **drive64** (branch `sim-drive64-measure`, DO NOT merge): panel shards
   `evidence/2026-11-06/drive64-shards/` carry aggregates only
   (extra.w4Kills / w4Killers / pairFormed / livingKillers) — NO
   per-killer records, so no per-killer census is possible there; report
   the aggregates and cite the round-0059 pair finding (8 pair killers,
   all dead within 22d, 6 within 9d) as already-measured, not re-derived.
3. **Fresh pilot band 99681–99688** (below): confirms the shapes on
   current master with the same grind instrument.

## Freshness check (band 99681–99688) — DONE before this prereg

- Searched every dated prereg `evidence/*/sim-*-prereg.md` for each seed
  99681…99688 individually: **0 hits each** (per-seed `grep -rl`).
- Searched the files naming forbidden/contaminated bands for any 9968x
  naming: **none** (the known contaminated band is 99201–99208,
  standacc-b prereg, unrelated).
- Scope recorded here per the seed-band freshness skill: all dated
  preregs + forbidden/contaminated band lists. Band 99681–99688 is fresh.
- Confirm extension, if the pilot GO shows a dominant cause worth sizing:
  99681–99696 (freshness re-checked before use).

## Method

- Analyzer `scripts/killersurvive-b-analyze-20261106.js`: pure function
  over recorder corpora. Reuses `killerdeath-analyze-20261105`
  (`killerFates`: killer identity from waveKillLog w>=4, death day/cause
  split from fallen + scholarDeaths + deadMap) and
  `killersurvive-analyze-20261106` (`deathChannel`: TB-fight / field-fight /
  contest / at-home-not-combat / fallen:<cause> / alive-at-end, record-based,
  never SAY lines). Adds per killer: fought-again-after-kill (fieldFights
  vid == killer, or later TB trace listing the killer as a fighter, day >
  first kill day), same-chain death (death fight vs the SAME mid as the
  first kill AND linked by instance id or exact-HP trail or same-day
  same-mid group; same mid without a link is reported as same-mid-unlinked,
  never forced), partner alive at death (another wave-4 killer living on
  the death day), health/whereabouts after the kill (killerTrack rows).
- Proof `scripts/test-killersurvive-b-20261106.js`: fixtures proving the
  attribution (TB-match, field-match, contest, at-home, same-chain link,
  partner-alive, fought-again) + corpus reproduction on the grind band.
  Analyzer exits 1 on any instrument error or any dead killer unmatched.
- Pilot driver: `scripts/grind-driver-20261106.js` verbatim (competent
  policy, grind instrument), `DAYS=150 SEEDS=99681..99688
  RUN=killersurvive-b-pilot`, out to
  `evidence/2026-11-06/perseed-killersurvive-b/` (new dir; the driver
  refuses overwrites). Death-aware horizon: villages stop at death/win,
  +10d tail max (runDays handles it).
- Sense test: read deathSays for 2–3 killer deaths on the pilot/grind
  corpora and judge whether the death reads as a meaningful consequence.

## Primary metric (pre-registered, binds the run)

**DIAG-GO iff:** (a) every dead wave-4 killer on the grind corpus AND
the fresh pilot is classified by death channel with 0 unmatched, AND
(b) a dominant death cause/context is identified with counts — ≥50% of
dead killers share ONE cause (from the cause-split) or ONE context
(TB-fight / field-fight / contest / at-home / road, from the channel) —
pooled across grind + pilot, AND (c) a named, sized lever for the next
arm follows from the dominant cause (what changes, by how much, what it
would need to move). **Otherwise NO-GO**, reported with the full
distribution (that is still a result).

## Guards / wall numbers

Report every run: national / table / wins, wave 4–5 unlocks and kills,
median survival, living killers at end, max simultaneous living killers.
No gate/price/deed change, so no regression guard beyond instrument
errors 0 and the corpus reproducing its committed headline numbers
(grind: 18 wave-4+ kills, 1 field kill, median 128.5d).

## Balanced panel (§15) / telemetry

No before/after pair exists in this arm (diagnosis only, competent
verbatim, no policy built) — the panel runs its own full panel and takes
no corpus input, so no compare `.md` is fabricated (same outcome as
arm A, baseline9-a, grind-a). Telemetry-check will be attempted on the
pilot corpus and its refusal/recorded result reported honestly.

## Metric review (to fill at closeout)

Pre-registered metrics bind this run; a miss is NO-GO, never re-scored
against a friendlier metric. If the metric proves wrong, write it here
and propose the revision for the NEXT run.
