# sim-funeral-mend-b — PREREG (BUILD: the funeral mend)

Run: fleshout-loop-b-20261115T0411Z (Loop B), arm sim-funeral-mend-b.
Axis: winnability chain. BUILD arm — the funeral mend: at the funeral,
the village mourns together and the shared rite mends the realm's shaken
links. Takes tracker blank #3 (first half), the direct follow-up to
sim-holdbuild-b. Branch: sim-funeral-mend-b — worktree
~/workspace/worktrees/sim-funeral-mend-b. Date: 2026-11-14 (run
2026-11-15Z). Prereg committed BEFORE any judged run; the bars below bind.

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md (the scale-ladder canon — the
only canon doc covering hierarchy/diplomacy). There is NO HIERARCHY.md;
the mechanics are taken from docs/SCALE.md + src/js/hierarchy.js
(`onLeaderDeath`, `successionCrisis`, `_trustGain`, `_markMourning`,
`covenantCrisis`) + src/js/win-plan.js (tending decider, untouched by
this arm), NOT invented. Canon facts used: national = LEAD primary of ≥3
SEASONED subordinates (seasoned = link 30+ days old AND trust 40+); the
succession haircut is −8 trust to ALL links plus a 7-day mourning window
with no trust gains; a seasoned link's gains are +1/week tribute paid in
full and +8 from a tend (1,500 kcal, once per week per link, via
`tendLink` — no seasoned gate in the verb itself); tendLink pays partial
from a thin pantry with proportional trust; the First Court feast is
5,000 kcal, no strings (trust +10 each, proportional if thin). Canon gap
(stated, not invented): no canon doc covers realm holding / dissolution /
upkeep tending (holdbuild prereg); this arm adds the funeral rite to that
same stated gap, it does not invent a canon doc.

## The diagnosis being built on (measured, not guessed)

Source: evidence/2026-11-14/sim-holdbuild-b.md (pilot NO-GO) on the
answercourt-confirm corpus
(evidence/2026-11-14/perseed-answercourt-confirm-b/, 16 seeds × armed
competent-answercourt-b, 150d) + the holdbuild pilot legs
(evidence/2026-11-14/perseed-holdbuild-b-pilot-off/ and -on/, 8 seeds).

- Holdbuild's upkeep + re-climb build FIRED (23 tends: wpUpkeep 6 +
  wpReclimb 17) but went NO-GO at pilot: median national held-days ON 40
  < 48, because ON villages died in combat while national (100207: 5
  held-days, lost d69; 100208: 14 held-days, lost d76) — not by
  dissolution. Dissolutions fell 4 → 3, re-climbs rose 1 → 2,
  national-ever 7/8 → 8/8. The hold mechanism works; held-days alone
  conflates hold quality with combat survival (metric review).
- Succpolity / succgrace were killed at pilot because they repair at
  most ONE link per funeral while all three erode (coordinator brief).
- The death-driven dissolution loop, from the holdbuild sense-test
  (seed 100205 ON): Rafael dies d93 (−8 to all links; Thornfield 42→34,
  below the bar) → realm falls d94 → tends d100 → national again d101 →
  Nina dies d101 (−8 again) → realm falls d102 → tends d108 → national
  again d109 → Zoltan dies d113 (−8 again) → realm falls d114 → village
  dies out d123. EVERY loss is a death, not a tending failure. Each death
  costs EVERY link 8 trust at once, and the realm falls the same day a
  link drops under 40.
- Counted on the pilot OFF leg (linkLines, this arm): Haven funerals
  50 across 8 seeds (3, 5, 5, 4, 13, 8, 5, 7 per seed 100201–100208);
  their-speaker deaths 0. The funeral is where the shakes live on this
  band — the mend hooks there, not in the tending tick.
- The holdbuild sense gap: the tend that causes a re-climb is SILENT
  (no linkLine voices the representative's tending). This arm's mend
  MUST be voiced — the funeral names the dead, names the mended links,
  and says why the fire holds.

## FIRST: where the funeral shakes links (established by this arm)

`onLeaderDeath(vid)` (src/js/hierarchy.js:1845, wired into registerDeath):
when Haven's speaker (the player or the representative) dies, it says the
funeral line ("🕯️ {name} is dead — and the dead hold no treaties. Every
link Haven has shakes.") and loops over Haven's links, calling
`successionCrisis` per vassal/lead link and `covenantCrisis` per peer
(covenant/trade) link. `successionCrisis` per link: −8 trust, 7-day
mourning (`_markMourning`, gagging all gains via `_trustGain`), tribute
moves (grief leverage ×1.5 up when Haven is subordinate, tribute pressed
down ×0.75 when Haven is primary), neglect snap only for trust < 20 with
no upkeep for 14+ days. Returns 'shaken' (haircut landed, no beat),
'grace' (young link <21d, or SUCCGRACE sub-bar link — a renegotiation
beat staged), 'grieving' (GRIEF COALESCES: already grieving, no new
haircut), 'broken' (neglect snap). `covenantCrisis` cuts −10 and stages
its own played crisis beat (CONCEDE/HOLD/RELEASE) — a different shake
with its own repair path. The realm dissolves later, in the daily
national check, when no qualifying polity remains and no beat is pending
— so a mend that restores trust inside the funeral itself, before the
next daily check, can keep the realm from ever falling.

## SUCCGRACE / SUCCPOLITY state in the corpus env (verified, not assumed)

The per-seed corpus files carry NO `env` field (checked:
perseed-answercourt-confirm-b + perseed-holdbuild-b-pilot-off — no `env`
key, no SUCCGRACE/SUCCPOLITY strings in any file). Verified instead from
the drivers + the gates: the corpus drivers
(scripts/answercourt-driver-20261114.js, scripts/holdbuild-driver-20261114.js)
set NO SUCCGRACE/SUCCPOLITY env vars, and both gates are opt-in
(`process.env.SUCCGRACE === '1'` / `SUCCPOLITY === '1'`,
hierarchy.js:311/320; browser `process` undefined → OFF). The corpus
therefore ran with BOTH OFF, and this arm's legs run the same way
(SUCCGRACE/SUCCPOLITY unset = OFF on both legs). Composition is designed
in anyway, so the mend stays correct if either is ever turned on — see
"The build".

## The build (src/js/hierarchy.js ONLY — `onLeaderDeath` + one helper)

One component, one flag. Flag `FUNERALMEND` (default ON; `FUNERALMEND=0`
disables, restoring the old funeral exactly — no mend, no feast, no
line, no counter).

- **THE MEND — at the funeral, after the shake loop.** `onLeaderDeath`
  records each link's `successionCrisis` return. After the loop, the
  funeral mend runs over the links that returned `'shaken'` — the ones
  that took the −8 haircut this funeral with no beat staged. For each:
  the funeral feast pays 1,500 kcal from the pantry via
  `_removePantryKcal(1500)` (the tend price — a fed fire is a fed fire),
  and the link regains `round(8 * paid/1500)` trust — the full haircut
  when the pantry pays in full, proportional from a thin pantry, nothing
  when the pantry is empty. The gain routes through `_trustGain` (the
  single choke point, stamping `lastKeptDay`) with the mourning window
  temporarily lifted for the rite itself — the same pattern as the
  SUCCGRACE beat answers (save `mourningUntil`, clear, gain, restore).
  Mourning itself stands: the 7-day gag on ordinary gains, the tribute
  moves, and the neglect snap are untouched.
- **VOICED, always.** One funeral line names the dead, names every
  mended village, states the feast kcal spent, and says why the fire
  holds ("the village mourns together — one feast, every fire fed, the
  links hold because the dead are honored, not because the grief was
  forgotten"). A second line names any shortfall honestly ("the pantry
  could not feed {village}'s fire — the mend waits"). A `_linkNote` is
  written per mended link. No silent tend, ever.
- **COUNTERS.** `state.village.funeralMendStats = { funerals,
  linksMended, kcalSpent }`, created ONLY inside the mend path (never by
  a recorder). `funerals` = funerals where ≥1 link was mended;
  `linksMended` = links mended with paid > 0; `kcalSpent` = total feast
  kcal paid. The driver reads this RAW from
  `state.village.funeralMendStats` — never through a method (recorder
  lesson: a recorder must never call a game accessor that creates state).
- **SCOPE (recorded, not silent).** The mend covers ONLY the −8
  succession haircut on links that returned 'shaken':
  - 'grace' links (young-link beat, or SUCCGRACE sub-bar beat) are
    SKIPPED — the beat IS their repair path; a link gets the beat OR
    the mend, never both. No double-count with SUCCGRACE.
  - Covenant/trade links are SKIPPED — their −10 shake stages the
    played crisis beat (CONCEDE/HOLD/RELEASE); the beat's answers are
    their repair path.
  - 'grieving' links (GRIEF COALESCES) are SKIPPED — they took no new
    haircut this funeral, so there is nothing to mend.
  - 'broken' links are gone — nothing to mend.
  - `theirLeaderDied` shakes (word of ANOTHER village's speaker dying)
    are OUT OF SCOPE — no funeral at Haven, the other village holds its
    own funeral; and the corpus pilot OFF leg has 0 such lines against
    50 Haven funerals.
- **COMPOSITION with SUCCGRACE / SUCCPOLITY (both OFF in the corpus
  env, designed-in anyway).** SUCCGRACE: stages a renegotiation beat
  for a sub-bar Haven-primary link; the mend skips any link with
  `pendingRenegotiation`, so a link is repaired by the beat OR the mend,
  never both, and never silently stacked. SUCCPOLITY: stamps pre-death
  standing (`_succDay`/`_succTrust`) and the polity-membership bars read
  the INHERITED standing for 14 days — it adds ZERO trust, it only
  changes which number the bars read; the mend changes real `link.trust`,
  visible in the link roll. The two never stack: during the window the
  bars read the inheritance, after the window they read the mended
  trust. The mend does not touch `_succTrust` (the inheritance is the
  pre-death standing, as designed).
- **NOT changed:** the −8 haircut itself, mourning, tribute moves,
  neglect snap, GRIEF COALESCES, `tendLink` pricing/cadence, the seasoned
  bar (40 / 30d), national staging, win prices / deed gates / readiness
  bars, the answermail drive, the policies, `winPlanBondsTick` (the
  holdbuild build stays REVERTED — win-plan.js byte-identical to
  master), `theirLeaderDied`, `covenantCrisis`. No new system (Steve:
  root-cause first; this is one rite inside the existing funeral).

PRIOR ART (read before judging this build): arm sim-holdbuild-b
(2026-11-14, Loop B; evidence/2026-11-14/sim-holdbuild-b.md) built
upkeep tending + re-climb relief in `winPlanBondsTick` and went NO-GO at
pilot — mechanism fired (23 tends) but median held-days fell 43.5 → 40
because ON villages died in combat while national. This arm attacks the
other end of the same loop: the funeral itself, where every dissolution
in the holdbuild sense-test began. The retained specification test
scripts/test-holdbuild-b.js currently FAILS 4/9 on the reverted tree by
design (the build legs); it is NOT edited and NOT re-run as a gate here
— the holdbuild build is not this arm's build.

## Baseline + control (identical seeds by design — NOT a fresh band)

The pilot/confirm bands REUSE the answercourt-confirm band (100201–100216)
on purpose, the holdbuild prereg precedent: the before leg is the
committed corpus, and the judged control is the OFF leg (same armed
policy, FUNERALMEND=0) on identical seeds. Seed-band freshness does not
apply — re-use IS the paired before/after design; a fresh band would
confound the build with new seeds.

- HISTORICAL BASELINE: the committed corpus (32 per-seed files; armed leg
  numbers in "The diagnosis" above). Pilot-band corpus median national
  held-days 43.5; full-band 38.5; dissolutions 7 (series-counted).
- JUDGED CONTROL: the OFF leg, run in this arm (armed policy,
  FUNERALMEND=0). It must reproduce the corpus (Stage 0); the ON-vs-OFF
  contrast on identical seeds is the verdict.

## Instrument (recovered + adapted; changes are instrument-only)

- POLICIES: competent-scaleclimb-b / competent-answercourt-b, already in
  this branch (recovered byte-identical in the holdbuild arm, committed
  0a1282119). Byte-identical; NOT re-run through recovery.
- DRIVER `scripts/funeralmend-driver-20261114.js` (copy of
  scripts/holdbuild-driver-20261114.js, the FIXED driver, with renamed
  RUN/OUTDIR/arm literals + ONE additive snapshot field (`fm` = the
  funeralMendStats counters read RAW from
  `state.village.funeralMendStats`, never through a method) — the
  holdbuild additive fields (pd/wpHolders/wpUpkeep/wpReclimb) are kept
  as-is. Pure reads; no game-behavior change. The driver is verified
  with a repro script before the pilot (RECORDER LESSON below).
- ANALYZER `scripts/analyze-funeralmend-b.js` (copy of
  scripts/analyze-holdbuild-b.js with renamed literals + mend
  attribution: per-seed funerals / links mended / kcal spent from the
  `fm` series field + mend-all funerals from linkLines + verbEvents).
  The holdbuild analyzer stays byte-identical.
- PANEL BUILDER `scripts/build-funeralmend-panels-20261114.js` (copy of
  scripts/build-holdbuild-panels-20261114.js, renamed literals only;
  pseudo-panels per the confirm precedent — the §15 compare is built for
  the record and attached; the pre-registered bars below are the judge).
- PROOF TEST `scripts/test-funeral-mend-b.js` (new): static legs (flag
  gates default-ON / '0'-OFF; diff confined to src/js/hierarchy.js +
  scripts + evidence) + game legs on the holdbuild fixture pattern
  (`Game.mshipState()` links, stocked pantry, `Game.onLeaderDeath`
  driven directly with the player's id): (a) three shaken links all
  mended +8 at one funeral, 4,500 kcal charged, counters +1/+3/+4500,
  voiced line names the dead + all three villages; (b) flag off = old
  behavior exactly (trust −8 each, pantry untouched, no counters, no
  mend line); (c) thin pantry = proportional mend, shortfall voiced;
  (d) beat-pending link skipped (young-link grace) while the others
  mend; (e) grieving link skipped (no double-mend inside the mourning
  window); (f) covenant link skipped (crisis beat is its repair path);
  (g) mourning window + tribute moves + neglect snap untouched after
  the mend. Test fixtures stage the average gear + party a player
  actually has at the content (Steve 2026-11-13 rule) — the pilot runs
  the full-village competent policy, which satisfies this; the proof
  fixture's links are seasoned (40+ days old) at encounter-realistic
  trust (42/45/48), not fresh.
- RECORDER LESSON (holdbuild): a recorder must never call a game
  accessor that creates state — read RAW fields (never
  `Game.winPlanStats()` in a snapshot; read
  `state.village.winPlanStats`). Same rule for the mend counters: read
  `state.village.funeralMendStats` raw. Verify the driver with a repro
  script before the pilot.

## Seed bands, horizon, env

- STAGE 0: seeds 100201, 100203, 100212, armed policy, FUNERALMEND=0,
  with the UNMODIFIED recovered driver (scripts/repro-holdbuild-driver.js,
  the holdbuild arm's own repro vehicle) against the committed corpus
  files. Judged fields must reproduce exactly; if they don't, STOP and
  report — do not silently re-baseline.
- PILOT: seeds 100201–100208, 150d, armed policy, ON leg + OFF leg
  (16 runs). 100203 is the holdbuild re-climb target; 100205 is the
  funeral-dense seed (13 funerals OFF).
- CONFIRM: seeds 100201–100216, 150d, armed policy, ON leg + OFF leg
  (32 runs).
- HORIZON 150d, death-aware (dead villages stop simulating, +10d tail
  max), matching the corpus. 150d because links need 30 days to season
  after a day-10 start, plus a season for the national beat, plus hold
  time after the court.
- ENV: FUNERALMEND unset (= ON) on the ON leg, '0' on the OFF leg.
  HOLDBUILD_UPKEEP / HOLDBUILD_RECLIMB unset on both legs (the build is
  reverted in this branch — no-ops). COUNTER_ANSWER,
  COMPETENT_FLEE_REPAIR, ANSWERMAIL_DRIVE unset (as in the corpus).
  SUCCGRACE / SUCCPOLITY unset (= OFF, as in the corpus — verified
  above). No other env.
- If the pilot shows the components diverging (the mend fires but the
  bars don't move, or vice versa), NO single-component legs exist for
  this arm — the mend is one rite; attribute from the `fm` counters +
  per-seed dissolution/held-days tables instead.

## Primary metric + GO bars (binding, §14)

Definitions: NATIONAL HELD-DAYS = days with scaleRank national/global in
the per-day series (per seed). DISSOLUTION = a national/global →
regional transition in the series (series-counted events, never end-state
arithmetic), per the holdrealm analyzer. MEND-ALL FUNERAL = a funeral
where every link that took the −8 haircut this funeral was mended
(`linksMended` increment equals the shaken-link count that funeral;
read from the `fm` counters + the funeral's linkLines).

- STAGE 0 REPRODUCTION (gate before any judged run): re-run 100201,
  100203, 100212 armed with the UNMODIFIED recovered driver and
  FUNERALMEND=0, and confirm the judged fields reproduce the corpus
  files (series scale/dip/links roll, verbEvents, deaths, days,
  endReason, scaleRank, maxWave, standing). If they don't reproduce,
  STOP and report — do not silently re-baseline.
- PILOT GATE (proceed to confirm iff ALL hold): (i) the mechanism fires
  (mend counter > 0 on the pilot band — `linksMended` summed > 0 — AND
  at least one funeral mends ALL shaken links on the band); (ii) the
  cost bar is clean on the pilot (starvation pooled ON ≤ OFF + 2 AND
  median survival ON ≥ 0.8× OFF); (iii) dissolutions ON < OFF AND pilot
  median national held-days ON ≥ 48 (pilot-band corpus median 43.5 ×
  1.1 = 47.85). The dissolution companion is REQUIRED per the holdbuild
  metric review — held-days alone conflates hold quality with combat
  survival. A pilot-gate miss = NO-GO at pilot: revert the game change,
  report the measurement, no confirm spend.
- CONFIRM GO (all three, on the 16-seed confirm):
  - P1 DISSOLUTIONS: dissolutions ON < OFF (corpus 7).
  - P2 HOLD: median national held-days across the 16 seeds, ON leg,
    ≥ 47 (corpus median 38.5 × 1.2 = 46.2).
  - COST: starvation deaths pooled ON ≤ OFF + 2 (totals AND arm-only
    per-seed) AND median survival ON ≥ 0.8× OFF median.
  A miss on any leg = NO-GO: REVERT the game change in the branch
  (killed arms leave no trace) and report the measurement as the result.
  Do NOT land a failing build. A GO keeps the change live (default
  behavior) with game tests green + `node scripts/check.js --quick`
  green on the branch (once at the end; if it times out with zero output
  under concurrent sibling sweeps, record that + targeted suites instead,
  per loop precedent).
- Alongside reads (never re-scored as the judge): re-climb count (2 in
  corpus), national ever (13/16), funerals / links mended / kcal spent
  per seed, engine tends by component (holdbuild counters, expected 0 —
  the build is reverted), policy tends, starvation per seed, villager
  combat deaths per seed, wall numbers (national / table / wins, wave
  4–5, median survival).

## Balanced panel (§15)

Pseudo-panels built from the driver per-seed JSONs (same builder pattern
as the holdbuild precedent); the compare .md is attached to the evidence
file. The pre-registered bars above are the judge, not the panel.

## Sense-testing (SENSE-TESTING LAW)

Read the funeral/mend transcripts in the ON leg and QUOTE the lines:
does the funeral name the dead, name the mended links, state the feast
cost, and say why the fire holds — and does a thin-pantry funeral say
the shortfall aloud instead of mending silently? Judge meaning and
coherence, never just counts. Note any funeral whose mend line is still
missing.

## Evidence

- Prereg: this file.
- Build: src/js/hierarchy.js (onLeaderDeath + _funeralMend + flag gate
  + stats).
- Proof: scripts/test-funeral-mend-b.js.
- Driver: scripts/funeralmend-driver-20261114.js (copy + `fm` field).
- Analyzer: scripts/analyze-funeralmend-b.js (+ reuse
  scripts/analyze-holdrealm-b.js for dissolutions).
- Panel builder: scripts/build-funeralmend-panels-20261114.js.
- Repro: scripts/repro-funeralmend-driver.js (driver verification).
- Per-seed JSON: evidence/2026-11-14/perseed-funeralmend-b/ (pilot 16 +
  confirm 32 files, ON + OFF legs).
- Panel: evidence/2026-11-14/funeralmend-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-funeral-mend-b.md (per-seed tables,
  mend attribution, wall numbers, sense-testing, metric review).

## Convergence state

BUILD — verdict GO/NO-GO against P1 + P2 + COST above (or NO-GO at pilot
on the pilot gate). A GO lands the funeral mend as default game
behavior; a NO-GO reverts the game change and the measurement stands as
the result. Either way the axis line updates from this run's numbers
only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did P1/P2 measure the hold, or did the
metric prove wrong (bad proxy, blind channel)? Note in particular
whether the OFF leg reproduced the corpus (Stage 0), whether the
dissolution companion bar fixed the holdbuild conflation, and whether
the per-funeral feast cost (1,500 kcal/link) was affordable or itself
the binding constraint.
