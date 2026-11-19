# sim-partysurvive-rerun-b — FROZEN prereg amendment (Loop B 1830Z run, arm sim-partysurvive-rerun-b)

**Frozen:** 2026-11-19 18:35 UTC, BEFORE any judged sim on this
branch. This amendment re-uses the frozen prereg
`evidence/2026-11-19/sim-partysurvive-b-prereg.md` (frozen 2026-11-19
12:54 UTC, Corrections 1–2 of 13:07 and 13:21 UTC carried over
intact) with exactly two changes: the seed band and the
descriptive secondary below. Everything else — instrument,
floors, classification bar, horizon, policy, substrate flags,
definitions — is identical to the frozen prereg.

**Arm:** the launch-party survival-to-the-fight diagnostic, RE-RUN
on the launch-rich band. The 1230Z leg was NO-GO, kind
NO-PRE-FIGHT-DEATHS, on a launch-poor band (4 quad launches <
floor 6, 0 pre-fight deaths); the designated band below should
clear the launch floor.

**Branch:** `sim-partysurvive-rerun-b` (worktree
`~/workspace/worktrees/sim-partysurvive-rerun-b`). **Base master:
`17bb496df`** (batch ship bump 18:36Z — wait, 17bb496df IS the
18:36Z batch-ship bump commit itself; base = master tip at run
start, verified `git rev-parse HEAD` = `17bb496df7a1c9167589f8ff6b636f51fb58e8ed`).

## Designated band (launchfunnel-b)

**Seeds: 106081, 106082, 106083, 106084, 106085, 106086, 106087,
106088.** Designated for this re-use by sim-launchfunnel-b
(`evidence/2026-11-19/sim-launchfunnel-b.md`, verdict GO):
**17 wave-4+ launches, 9 quad launches, 4 joined quad meetings
per 8 seeds** on the survey substrate. Per-seed map (survey):
106083: 10 launches (6 quads); 106084: 5 launches (2 quads);
106087: 1 launch (1 quad); 106088: 1 launch (0 quads); 106081 /
106082 / 106085 / 106086: 0 launches. The launches live on
106083 + 106084 (15 of 17) — run the FULL band, never a subset,
and report per-seed launches.

## Seed-band freshness (re-use designation, not virginity)

Grepped all `evidence/*/sim-*-prereg.md` for `10608[1-8]`: the
ONLY hit is `evidence/2026-11-19/sim-launchfunnel-b-prereg.md`
— the designating survey's own band list (lines 15, 75) — which
verified zero prior uses of any of the 32 surveyed seeds as sim
seeds before freezing. No other prereg names these seeds. This
band is therefore fresh for re-use AS DESIGNATED: the survey
itself ran these seeds (survey substrate, no ALLYSLOT3 — launch
formation does not depend on it), and the re-run re-verifies the
pool on arrival per its own prereg (launchfunnel-b metric
review: "The re-run must re-verify the designated band's pool
on arrival"). The survey-substrate caveat is carried: quad
fight outcomes on this band will differ from the survey's
because ALLYSLOT3 is ported here (the 4th companion may now
actually fight).

## Policy

Competent verbatim policy. `scripts/policies/competent.js`
sha256: `729af71ccdddff5abf7e8aad555fe820cb2355d6eb9a6ed866e5ac15e94806fd`
(first 12: `729af71ccddd`). This MATCHES launchfunnel-b's
recorded policy sha — the policy has not moved since the
survey. (The 1230Z partysurvive prereg did not pin a policy
sha; the move "since 1230Z" the task notes is the journey
landings r127–r146 recorded by launchfunnel-b, already
absorbed in this sha.)

## Substrate (identical to the frozen prereg)

- Driver: `scripts/fightcap-driver-b.js` UNCHANGED, run as a
  single leg: `MODE=arm`, `RUN=partysurvive-rerun-b`,
  `OUTDIR=perseed-partysurvive-rerun-b`,
  `SEEDS=106081,...,106088`, `DAYS=150`.
- Env flags: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
  FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1`, plus
  `LAUNCHSURVIVE=1` (recorder-only, as frozen).
- **ALLYSLOT3 port (coordinator-authorized, evidence-only):**
  the fightcap driver refuses MODE=arm without the ALLYSLOT3
  slot code, which is absent from master `17bb496df`
  (fightcap was NO-GO; the lever was held, never landed).
  Cherry-pick commit `f4d1100ee` (partysurvive's own port of
  held sim-allyslot3-b `7efbf26a8` via sim-fightcap-b
  `5a5343363`) onto this branch; verified NOT an ancestor of
  master (`git merge-base --is-ancestor f4d1100ee HEAD` =
  no) before cherry-picking. Verify it applies cleanly onto
  current master; re-run `scripts/test-allyslot3-b.js`
  (expect 18/18). The port must NEVER be merged to master as
  a game change — this branch holds it only so the diagnostic
  can run; the coordinator lands evidence-only.

## Frozen bars (unchanged from the frozen prereg)

- **Pool floor (binding precondition):** >= 6 quad launches
  AND >= 3 `died-before-meeting` deaths. If launches < 6 or
  pre-fight deaths < 3, NO-GO, kind METRIC-BROKEN; if 0
  pre-fight deaths, kind NO-PRE-FIGHT-DEATHS.
- **Primary metric (BINDING):** classification completeness
  of launched-party pre-fight deaths, bar >= 0.90, top cause
  named, survival curve reported (share alive at meeting +
  median days launch→death). Definitions, cause classes
  1–10 with frozen precedence, death-day cross-check
  (presence-based, Correction 1), `died-in-meeting` split,
  and the 21-day window rules are exactly as frozen.
- **Instrument bar:** 0 errors on the leg; 8/8 per-seed
  files; frozen seeds 106081–106088; death-day cross-check
  agrees on every launched member.
- **GO** requires the classification bar + the survival curve
  + the pool floor + the instrument bar. A GO here does not
  endorse any lever — this is a diagnostic.

## Secondary (REPORTED, not binding)

All frozen secondaries carry over (per-seed table, by-cause /
by-monster tables, holder vs companion split,
`died-in-window-no-meeting` causes, `died-in-meeting` count,
en-route evidence per pre-fight death, reference
reproduction via `test-partysurvive-b.js` §B).

**NEW secondary (descriptive, never judged — per
launchfunnel-b's recommendation): damage-per-launched-meeting.**
For each quad launch's FIRST joined meeting (CORRECTED join,
finding #2570), the meeting row's `mDealt` (total damage the
launched party dealt in that fight, recorder field): report the
per-meeting list (seed, holder, target, rounds, mDealt,
outcome), the mean, the median, and the count of meetings with
0 damage. Do NOT judge on it. Definition note: `mDealt` is
the whole fighting party's damage in that meeting, not the
launched members' alone — a meeting the party fled in round 2
reads low honestly; the per-meeting list names the rounds
beside the damage so the number is never read bare.

## Wall numbers (reported every run)

Wins / national / table reach, wave 4–5 unlocks, median
survival, from the leg's per-seed files (`summarizeLeg` wall
via `scripts/analyze-partyquads-b.js`, same as fightcap-b and
the 1230Z leg).

## Panel / telemetry

Same as the frozen prereg: `scripts/balance-panel.js`
compare via `scripts/build-partysurvive-b-panels.js`
(before = frozen fightcap-b arm corpus, after = this
corpus — a same-substrate reproducibility reference, not a
lever before/after; if the panel tool refuses the unpaired
comparison, record the refusal verbatim). Telemetry check
against the scale-wall baseline; if the tool refuses
recorder corpora, record the refusal verbatim (as the 1230Z
leg did).

## Canon

docs/CANON.md read first; docs/MONSTER-WAVES.md (wave law,
wave 4–5 bands and gates — the monsters named in death
causes are read against this + `src/data/monsters.json` for
wave); docs/CONTESTS.md (contest/arena grabs);
docs/DISEASES.md (wound-fever deaths are disease-pool, not
fight deaths). CANON GAP carried from the frozen prereg: no
CANON-registered doc covers launch-party road survival,
companion-pool departure, or the field-fight death-cause
taxonomy (the `deaths` row causes — `the wild`, `monster`,
`the night` — are engine strings with no canon definitions).
The evidence file states this gap instead of inventing canon.

## Metric review

- The judged denominator is `died-before-meeting` ONLY
  (launches with a joined meeting), exactly as frozen.
- The +7d/+21d shares do not censor at the meeting day
  (carried from the 1230Z metric review §9.2): the analyzer
  counts ANY death within N days of launch, post-meeting
  deaths included — read as "alive N days after launch",
  not "survived the road N days". Not re-scored (metric
  binding).
- The 0.90 bar on a thin pool: on n≈3 it effectively
  requires classifying all of them; the evidence names the
  count beside the share, as the 1230Z leg did.
- **Band-risk note (new):** the designated band's launch
  rate was measured on the survey substrate WITHOUT
  ALLYSLOT3; the re-run re-verifies the pool on arrival.
  The survey's per-seed map says 15 of 17 launches live on
  two seeds — if the re-run's pool floor still fails, the
  failure is about the band's launch rate under the full
  substrate, not about the survey's designation, and the
  evidence says so.
- **Damage secondary note (new):** the 1230Z leg's two
  meetings both ended vFlee with 0 in-meeting deaths; the
  damage secondary exists because launchfunnel-b showed
  launched parties dealing 0 damage across four meetings
  on this very band (nina→eulogy, seed 106087) — the
  secondary measures whether that reproduces under the full
  substrate. It is descriptive: a 0-damage launched meeting
  is a finding about the damage wall, not a verdict on this
  diagnostic.
