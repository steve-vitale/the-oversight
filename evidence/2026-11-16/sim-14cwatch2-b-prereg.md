# sim-14cwatch2-b — PREREG (rerun of the §14c watch, fresh band, fresh baselines)

Run: fleshout-loop-b-20261116T1730Z (Loop B), arm sim-14cwatch2-b
Axis: winnability chain. Tracker blank #6 second half / 0430Z blank #4:
§14c watch — does the courtship leg's villager-death excess reproduce?
Branch: sim-14cwatch2-b — worktree ~/workspace/worktrees/sim-14cwatch2-b
Base: worktree HEAD 5a9e13719 at arm start (sim-trickteach-b instrument
follow-ups; the coordinator merges to local master). The driver records
its own anchorCommit per per-seed file.
Date: 2026-11-16 (run starts 2026-11-16T17:30Z).

## Canon note (read first)

docs/CANON.md was read in full. **No canon doc covers
courtship/diplomacy death effects** — the manifest's nearest docs are
docs/CONVERSATIONS.md (dialogue/talk/gossip) and docs/MAP.md (travel);
neither says anything about whether courtship or diplomacy changes
who dies in combat. Nothing is invented to fill the gap. The prior
arm (evidence/2026-11-16/sim-14cwatch-b.md) established the same
gap; this rerun inherits that note.

## The question

The 0430Z courtship re-confirm (band 100621–100636, 200d) tripped
the §14c guardrail on seed 100633: villager deaths 68 armed vs 39
control (+74%). The stopped 1530Z arm (sim-14cwatch-b) re-derived
the classifier and the band-wide context from the re-confirm corpus
before stopping at D1 tip drift:

- The driver's `villagerCombatDeaths` field counts ALL non-player
  deaths, not combat deaths. True combat on 100633 is 66 vs 36
  (+83%). Band-wide on the re-confirm band the pooled combat ratio
  was 0.88 (armed kills FEWER villagers in combat overall); only
  2/16 seeds ≥1.5.
- The control leg on seed 100633 does NOT reproduce the re-confirm's
  numbers on the current tip (gameDays 167→171, standing 199→455,
  maxWave 4→5) — tip drift across 18 src/js commits. No judged sim
  ran in the stopped arm; no band was spent.

This rerun answers the question on FRESH baselines on the CURRENT
tip: same two legs, same driver, same policy, one fresh 8-seed band.
The re-confirm numbers are motivation only, never the judge.

## Primary metric + decision rule (FROZEN — §14 binding)

- **Classifier (frozen):** combat deaths = death records with
  kind `monster` AND player false. The driver's
  `villagerCombatDeaths` field is reported alongside as
  ALL-VILLAGER deaths (player false, any kind) — never as combat
  deaths. Exposure = sum of daily roster size (`pop`) from the
  per-seed series. Edge case, recorded not re-defined: records
  with kind `villager` + cause `monster` + player false exist
  (1 on re-confirm seed 100633 control) and count as NON-combat
  under the frozen rule; the analyzer reports their count per leg
  as a sensitivity note.
- **Primary metric:** pooled combat-death ratio armed/control
  (pooled counts across the 8 seeds; exposure reported alongside
  as combat deaths per 1000 villager-days per leg).
- **Decision rule (frozen):** ratio ≥1.5 = **REPRODUCED**;
  0.8–1.2 = **NOT REPRODUCED**; between = **INCONCLUSIVE**
  (report per-seed ratios too). A miss is the verdict, never
  re-scored against a friendlier metric mid-run.
- **Cost/context (reported, not a second bar):** starvation deaths
  (cause/kind matching /starv|hunger/i, answercourt precedent)
  + median survival per leg. Wall numbers every run: national by
  standing ≥200 AND by scaleRank ≥2, table (seat taken), wins,
  wave 4/5 unlocks, median survival — both legs.
- **D1 (frozen, instrument gate):** determinism SELF-REPEAT on
  this tip — same seed/policy/driver twice in separate fresh
  processes, byte-identical per-seed record JSON. D1 compares
  the two reruns to EACH OTHER, never to the re-confirm numbers.
  D1 runs on seed 102221, control leg, before the band is spent.
  D1 FAIL (the two reruns differ) = STOP, report, do not spend
  the band. D1 is drift-vs-nondeterminism insurance only: the
  stopped arm already proved the driver self-repeats on this tip
  (seed 100633 control twice, exact match).

## Seed band (verified fresh BEFORE any judged sim)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
whole-token (`\b10222[1-8]\b`) rg over all dated preregs
(`evidence/*/sim-*-prereg.md`), all `evidence/2026-11-16/*.md`,
`scripts/`, the goal `hidden_files/convergence-tracker.md` and
`sim-findings.md`, plus an unfiltered rg over `evidence/`,
`scripts/`, goal `hidden_files/` (substring hits inspected
individually):

- **102221–102228 (8 seeds): FRESH.** Whole-token hits only in
  (a) `evidence/2026-11-16/sim-trickteach-b-prereg.md:232` —
  the trickteach arm's own freshness check naming 102221 and
  102231 as "checked-fresh for the next arm, NOT reserved"
  (it spent 102211–102218); and (b)
  `evidence/2026-11-16/sim-14cwatch-b.md` — the stopped arm's
  verification of this same band and its assignment to this
  rerun. Unfiltered-substring hits elsewhere are coincidental
  digit runs inside 64-hex case hashes (2026-11-09 ove-* panel
  cases) and float literals — not seed reservations, not
  corpora. No per-seed file, no panel, no judged corpus exists
  on any seed in the band. This prereg spends it.
- Neighbouring used bands avoided: 102201–102208 (seasoning,
  forbidden), 102141–102148 (Loop A live DIAG — do not touch),
  102211–102218 (trickteach-b, spent today), 102101–102108
  (gatelever-b), 102041–102048, 102011–102018, 102001–102008.
  NEVER use: 100621–100636 (re-confirm), 100601–100608,
  100641–100648, 100761–100768. Loop A live bands 102401–102408
  (sim-launchsurvive-a / sim-profileshadow-a) — do not go near.

## Method (staged, §§9–12, 14–15)

- PILOT = the band itself: 8 seeds × 2 policies = 16 configs,
  200d death-aware, identical seeds, BOTH legs run fresh on
  this tip. Horizon 200d because the re-confirm ran 200d and
  the covenant road needs it. Seeds (exact literals): 102221,
  102222, 102223, 102224, 102225, 102226, 102227, 102228.
  Policies: competent-covenant-b (control — the road walked, no
  courtship lever) vs competent-courtship-b (armed — the same
  road + courtship deeds). The courtship leg is the judged leg;
  the covenant leg is the control.
- DRIVER: scripts/onlylead-driver-20261115.js reused VERBATIM —
  zero driver edits. Invocation per leg (defaults env —
  COUNTER_ANSWER, COMPETENT_FLEE_REPAIR, ANSWERMAIL_DRIVE all
  unset, matching the re-confirm):
  `RUN=14cwatch2-b SEEDS=102221,...,102228 POLICY=competent-covenant-b
  DAYS=200 OUTDIR=perseed-14cwatch2-b-control node
  scripts/onlylead-driver-20261115.js` (control), then the same
  with `POLICY=competent-courtship-b
  OUTDIR=perseed-14cwatch2-b-armed` (armed). OUTDIR lands under
  evidence/2026-11-15 by driver construction; the two dirs are
  MOVED (not re-run) to
  evidence/2026-11-16/perseed-14cwatch2-b-control/ and
  evidence/2026-11-16/perseed-14cwatch2-b-armed/ after both legs
  complete. The driver refuses to overwrite an existing per-seed
  file (exit 3), so an interrupted run resumes from verified
  checkpoints: validate each completed file as complete JSON
  with 0 instrument errors, never re-run a completed config.
- ANALYZER: scripts/analyze-14cwatch2-b.js (new, this arm) —
  reads the two perseed dirs, computes per-seed and pooled
  combat deaths (frozen classifier), all-villager deaths,
  starvation deaths, exposure, per-seed ratios, wall numbers.
  Writes evidence/2026-11-16/14cwatch2-b-analysis.json.
- PROOF: scripts/test-14cwatch2-b.js (new, this arm) — §1
  classifier fixtures (combat vs all-villager vs starvation vs
  player deaths on known records, incl. the kind-villager /
  cause-monster edge); §2 D1 determinism self-repeat (seed
  102221 control twice in separate fresh processes, identical
  record). Proof must be GREEN before the verdict is judged.
- BALANCED PANEL (§15): panels built in the
  scripts/balance-panel.js schema from the two per-seed dirs
  (new builder scripts/build-14cwatch2-panels-20261116.js, same
  construction as the courtship-reconfirm builder — pseudo-policy
  '14cwatch2-b', case identity is the seed, paired design), and
  the compare run through scripts/balance-panel.js
  (`node scripts/balance-panel.js compare --before
  <panel>-before.json.gz --after <panel>-after.json.gz --out
  evidence/2026-11-16/14cwatch2-b-panel`). The panel is the
  instrument; the frozen decision rule above is the judge. Built
  for the record whether the verdict is REPRODUCED, NOT
  REPRODUCED, or INCONCLUSIVE.
- NO second band on this arm's own authority: a confirm band
  only if the verdict is INCONCLUSIVE and the coordinator
  orders it.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Wall numbers (every run)

National by standing ≥200 AND by scaleRank ≥2, table (seat
taken), wins, wave 4/5 unlocks, median survival — both legs,
in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Read the deaths, not just the counts: quote at least one seed's
combat-death kind breakdown (who died, to what, on which days)
and judge whether the deaths make sense as combat — do the
kinds line up with the waves the village actually faced, do
clusters fall on wave days, do the non-combat villager deaths
read as thirst/starvation rather than mislabelled combat?

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-covenant-b.js and
  scripts/policies/competent-courtship-b.js.
- Driver: scripts/onlylead-driver-20261115.js (verbatim, zero
  edits).
- Analyzer: scripts/analyze-14cwatch2-b.js (new).
- Proof: scripts/test-14cwatch2-b.js (new).
- Panel builder: scripts/build-14cwatch2-panels-20261116.js (new).
- Per-seed JSON: evidence/2026-11-16/perseed-14cwatch2-b-control/
  (8 files) and evidence/2026-11-16/perseed-14cwatch2-b-armed/
  (8 files).
- Analysis: evidence/2026-11-16/14cwatch2-b-analysis.json.
- Panel: evidence/2026-11-16/14cwatch2-b-panel.*
- Evidence: evidence/2026-11-16/sim-14cwatch2-b.md (verdict,
  per-seed table, pooled ratio, wall numbers, sense-testing,
  metric review).

## Convergence state

§14c watch rerun on a fresh 8-seed band with fresh baselines on
the current tip. Verdict REPRODUCED / NOT REPRODUCED /
INCONCLUSIVE against the frozen rule above. This is a SWEEP ONLY
— zero src/js expected, zero policy edits. If REPRODUCED, the
§14c guardrail trip stands as a live lever effect and the
coordinator decides the next arm (the courtship lever itself is
already on master — no game change lands from this arm either
way). If NOT REPRODUCED, the 100633 trip reads as a per-seed
outlier against a band-wide pattern, as the re-confirm's own
pooled ratio (0.88) already suggested. Killed arms leave no
trace.
