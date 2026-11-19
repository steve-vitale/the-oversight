# sim-partysurvive-b — FROZEN prereg (Loop B 1230Z run, arm sim-partysurvive-b)

**Frozen:** 2026-11-19 12:54 UTC, BEFORE any judged sim. Base master
`e1f002065` (journey-establishment r243). Branch `sim-partysurvive-b`
(worktree `~/workspace/worktrees/sim-partysurvive-b`, already rebased
onto master `e1f002065` by the coordinator).
**Arm:** the launch-party survival-to-the-fight diagnostic (tracker
blank 1 from the 2026-11-19 0830Z Loop B round, fightcap follow-up).
INSTRUMENT ONLY — zero `src/js` game-code changes. This arm builds a
new analyzer + proof test and runs one diagnostic leg; it judges
nothing about a lever.

## The question, in plain words

A launched party that sets out as four almost never arrives as four.
The fight-ally cap arm (sim-fightcap-b, NO-GO) classified 21
missing-companion causes over 13 missed meetings on its arm leg, and
the biggest class was **Dead 10** — the launch party's members die
before the fight (seed 104771's quad bled out across days 64–83:
Catalina died in the d64 Spoiler fight itself, Rosa and Katarina were
both dead by d83, Naran died d142). The sense works; the party doesn't
survive to the fight. This diagnostic decomposes WHY launch-party
members die before the fight — what kills them on the road — so the
next build arm knows which death to prevent.

## Reference (the number this decomposes)

- sim-fightcap-b arm leg, seeds 104770–104777, same substrate as
  here: 13 missed meetings, 21 missing-companion causes — Dead 10,
  Expedition ended 5, In-plan party but unsensed different tile 3 /
  same tile 1, Different expedition 1, trim-unproven 1.
  (`evidence/2026-11-19/sim-fightcap-b.md`, §2; analyzer
  `scripts/analyze-fightcap-b.js` `senseMisses`, CORRECTED join
  finding #2570.)
- This arm re-runs the SAME substrate on a FRESH band and decomposes
  the Dead class only: every launched party member, tracked day by
  day from launch to meeting-or-death, each pre-fight death classified
  by cause.

## Seed-band freshness

**Seeds (fresh 8-seed pilot band): 105941, 105942, 105943, 105944,
105945, 105946, 105947, 105948.** Freshness check (per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):
grepped all `evidence/*/sim-*-prereg.md` (1022 files) and
`evidence/**/*.md` for the exact seeds 105941–105948 — no file names
any of them; grepped branch names — none names 10594x; the only
nearby band is sim-speargate-a's 105901–105908 (no overlap). One
unrelated data value matched the broad pattern: `105949` appears as
an `"away_wild"` counter value in
`evidence/2026-10-20/perseed-dutyfish-b/control-lead.json` — a count,
not a seed reservation, and outside this band. Band 105941–105948
is fresh.

## Substrate (matches fightcap-b's arm leg EXACTLY — no lever judged)

- Driver: `scripts/fightcap-driver-b.js` UNCHANGED, run as a single
  leg: `MODE=arm`, `RUN=partysurvive-b`,
  `OUTDIR=perseed-partysurvive-b`, `SEEDS=105941,...,105948`,
  `DAYS=150`.
- Env flags (identical to fightcap-b arm): `SENSEEXPED=1
  PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  ALLYSLOT3=1`. Competent verbatim policy, 150-day death-aware
  horizon (dead villages stop simulating, +10d tail max).
- `LAUNCHSURVIVE=1` is additionally set. This is a RECORDER-ONLY
  addition already in the driver: it writes the per-day
  `v4launchTrack` rows (holder/companion nodes, holder health and
  sickness, last-known tile, target persistence) and nothing else.
  No game behavior changes: the launchsurvive-a proof test verified
  recorder-ON vs recorder-OFF trajectory identity (D2) for this
  tracker, and the judged numbers here are read from
  `v4departs` / `v4encounters` / `deaths` / `daily` rows that exist
  with the flag unset. The tracker rows exist only to enrich the
  day-by-day member stories (where a member was, whether the holder
  was sick) — if the flag ever failed, the verdict would still be
  computable from the base rows.

## Frozen definitions

- **Quad launch:** a `v4departs` row with `result === 'launch'`,
  `targetWave >= 4`, party size >= 4 — verbatim
  `quadLaunches()` from `scripts/analyze-fightcap-b.js` (reused,
  not copied). Party = holder (`vid`) + `party` (3 companions).
  Both holder and companions are tracked: the holder can die on
  the road too, and the sense-miss Dead class counts companions
  only, so the holder/companion split is reported separately.
- **Joined meeting of a launch:** the FIRST fought expedition
  `v4encounters` row joined to the launch by the CORRECTED join
  (finding #2570 — fighter must belong to the launch; best-match on
  most sensed allies; 21-day window; target==mid dropped, finding
  #2564). Reused verbatim from `scripts/analyze-fightcap-b.js`.
- **Member outcome** (exactly one per launched member):
  - `alive-at-meeting` — the launch has a joined meeting and the
    member has no villager death row with day <= meeting day.
  - `died-before-meeting` — the launch has a joined meeting and the
    member's first villager death row falls on a day <= meeting day
    AND the member did not die IN the meeting fight (see below).
    Days-from-launch-to-death = deathDay - launchDay.
  - `died-in-meeting` — death day == meeting day AND the member was
    the meeting's fighter (`vid`) or in its `allyVids`. A member who
    dies in the fight they walked into is NOT a pre-fight death;
    counted separately, never in the judged denominator.
  - `died-in-window-no-meeting` — the launch has no joined meeting
    within 21 days and the member's death row falls on a day in
    (launchDay, launchDay+21]. Reported with the same cause
    classification, but NOT in the judged pre-fight denominator
    (no fight ever happened to miss).
  - `survived-window-no-meeting` — no joined meeting and no death
    row in the window.
  - `alive-past-meeting` is folded into `alive-at-meeting` (the
    member's later fate is out of scope — the question is survival
    TO the fight).
- **Death day cross-check:** a member's death day from `deaths`
  (kind `villager`, `who` == vid) must agree with the first day the
  member's `daily[].roster` row reads `dead: true`. Any disagreement
  is an instrument error and is reported, not silently resolved.
- **Pre-fight death cause classes (frozen precedence, exactly one
  per death — classify from the `deaths` row `cause`, linked to a
  recorded fight where the corpus allows):**
  1. `field-fight` — the cause names a monster (matched against
     `src/data/monsters.json` by id or display name, any wave) OR
     the cause is the generic `monster`. Sub-class by linkage:
     `linked-v4` (a `v4encounters` row on the death day with the
     member as fighter or in `allyVids`, same `mid` when the cause
     names one), `wave1-3-unrecorded` (named monster of wave < 4 —
     `v4encounters` records wave >= 4 only, by design, so no fight
     row can exist), `unnamed` (generic `monster` cause with no
     same-day `v4encounters` row for the member).
     The monster name and wave are recorded with the class.
  2. `contest-arena` — cause `the arena` or `contest` (CONTESTS.md:
     the show takes people; the arena/contest is a grab, not a
     field fight).
  3. `starvation` — cause `starvation`.
  4. `thirst` — cause `thirst` or `dehydration`.
  5. `wounds` — cause `a wound that wouldn't close` (disease/wound
     death, DISEASES.md territory — a wound-fever kill, not a fight).
  6. `stranger` — cause `a stranger` (alien-player stranger kill,
     ALIEN-PLAYERS.md).
  7. `the-wild` — cause `the wild` (a wild death with no recorded
     fight row; check the same-day `v4encounters` linkage first —
     if a row links, class 1 `field-fight/linked-v4` wins).
  8. `the-night` — cause `the night`.
  9. `other` — any other cause value, recorded verbatim (specify).
  10. `unclassified` — no `deaths` row for a member the roster
      marks dead (instrument gap), or a cause value the classifier
      does not recognize. Counts AGAINST the classification bar.
- **Survival curve (frozen):** share of launched members alive at
  meeting time = `alive-at-meeting` / (`alive-at-meeting` +
  `died-before-meeting`), over launches WITH a joined meeting;
  plus the share alive at launch+7d and launch+21d over ALL
  launched members (death-censored at the meeting day for met
  launches, at window end for unmet ones); plus the median (and
  quartiles) of days-from-launch-to-death over `died-before-meeting`.

## Primary metric (BINDING, §14)

**Classification completeness of launched-party pre-fight deaths.**
Numerator: `died-before-meeting` deaths classified into classes
1–9 above. Denominator: all `died-before-meeting` deaths.
**GO bar: classified share >= 0.90 AND the top cause named AND the
survival curve reported (share alive at meeting time + median days
launch→death for pre-fight deaths).** Justification: the reference
(fightcap-b arm) left its Dead 10 entirely undecomposed — any
classification below 0.90 leaves the question open the same way;
0.90 tolerates one genuinely unrecorded death in a pool of ~10
(the fightcap reference size) while forcing the instrument to link
fights, not guess. The top cause must be named because the next
build arm needs ONE death to prevent first.

**Pool floor (binding precondition):** >= 6 quad launches AND >= 5
`died-before-meeting` deaths. If launches < 6 or pre-fight deaths
< 5, the pilot is NO-GO, kind METRIC-BROKEN (the band delivered too
thin a pool to decompose — the fightcap reference band delivered
10 dead companions on 24 launches, so 5 is half that with slack
for delivery variance). If there are 0 pre-fight deaths, kind
NO-PRE-FIGHT-DEATHS (a finding in itself — the party survived —
but not a GO: there is nothing to classify).

**Instrument bar:** 0 errors on the leg; 8/8 per-seed files;
frozen seeds 105941–105948; driver determinism (proof test
`test-partysurvive-b.js` §C: one 30d seed in a subprocess, exit 0,
flags self-describing, 0 errors, `v4launchTrack` rows present).
Death-day cross-check (deaths row vs daily roster) must agree on
every launched member, or the disagreement is listed as an
instrument error.

**GO requires the classification bar + the survival curve + the
pool floor + the instrument bar.** A GO here does not endorse any
lever — this is a diagnostic; GO means the deaths are decomposed
well enough to aim the next build arm.

## Secondary (REPORTED, not binding)

- Per-seed launch/quad/meeting/member table (launches, members
  tracked, meetings joined, alive-at-meeting, pre-fight deaths).
- Cause counts with monster/wave breakdown for `field-fight`.
- Holder vs companion split of pre-fight deaths.
- `died-in-window-no-meeting` cause counts (same classes).
- `died-in-meeting` count (members who died in the fight itself).
- En-route evidence for each pre-fight death: fought in a recorded
  encounter between launch and death (yes/no, which), last-known
  node vs Haven from `v4launchTrack` where present (out on the road
  vs at Haven).
- Reference reproduction: the analyzer re-run on the frozen
  fightcap-b arm corpus must reproduce the sense-miss Dead count
  (10) and the by-cause table (Dead 10 / Expedition ended 5 /
  different-tile 3 / same-tile 1 / Different expedition 1 /
  trim-unproven 1) — `test-partysurvive-b.js` §B. A mismatch is a
  loud instrument failure, not a re-score.

## Wall numbers (reported every run)

Wins / national / table reach, wave 4–5 unlocks, median survival,
from the leg's per-seed files (`summarizeLeg` wall via
`scripts/analyze-partyquads-b.js`, same as fightcap-b).

## Panel (instrument, not judge)

`scripts/balance-panel.js` compare via a new builder
`scripts/build-partysurvive-b-panels.js`: before = the frozen
fightcap-b arm corpus (seeds 104770–104777), after = this corpus
(seeds 105941–105948), same substrate, different bands — a
same-substrate REPRODUCIBILITY reference, not a lever before/after
(the seeds differ, so no paired deltas are claimed). If the panel
tool refuses the unpaired comparison, record the refusal verbatim
and report the wall numbers directly.

## Design

- Horizon: 150d, death-aware. Single diagnostic leg — no control
  leg (nothing is being toggled; the fightcap-b arm corpus IS the
  reference).
- Seeds: 105941–105948 (8, pilot gate). Policy: competent verbatim
  only.
- Proof: `scripts/test-partysurvive-b.js` (analyzer selftest §A:
  judge fixtures incl. each cause class, died-in-meeting split,
  same-day ambiguity, death-day cross-check; corpus reproduction
  §B: fightcap-b arm Dead 10 + by-cause table; driver smoke §C:
  30d seed, exit 0, 0 errors, tracker rows present),
  `scripts/analyze-partysurvive-b.js --selftest`.
- Telemetry: `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-19/perseed-partysurvive-b/*.json'
  --metrics national,table,wins,exiled`. If the tool refuses
  recorder corpora, record the refusal verbatim (as fightcap-b
  did) and report wall numbers directly.

## Canon

- docs/CANON.md read first; docs/MONSTER-WAVES.md (wave law, wave
  4–5 bands and gates — the monsters named in death causes are
  read against this + `src/data/monsters.json` for wave);
  docs/CONTESTS.md (contest/arena grabs); docs/DISEASES.md
  (wound-fever deaths are disease-pool, not fight deaths).
- CANON GAP (recorded, not invented): no CANON-registered doc
  covers launch-party road survival, companion-pool departure, or
  the field-fight death-cause taxonomy (the `deaths` row causes —
  `the wild`, `monster`, `the night` — are engine strings with no
  canon definitions). The evidence file states this gap instead of
  inventing canon.

## Metric review

- The judged denominator is `died-before-meeting` ONLY (launches
  with a joined meeting). Deaths on launches that never meet are
  real deaths but answer a different question (did the party even
  get a fight?) — they are classified and reported alongside, not
  folded in, so a band with few meetings cannot inflate the
  classification share with easy no-meeting deaths.
- Death on the meeting day is ambiguous within a day: the
  `died-in-meeting` split (member was fighter/ally in that fight)
  resolves it by participation, not by clock. A member who died
  on the meeting day but was NOT in the fight counts as
  died-before-meeting with a same-day flag — the evidence names
  those rows so a later reader can see the ambiguity's size.
- The 0.90 bar is set against the fightcap reference size (~10
  pre-fight deaths expected). If the pool delivers far fewer (5–6),
  one unclassified death moves the share by ~0.17 — the evidence
  will name the count beside the share, as fightcap-b did for its
  n=2 damage share.
- The survey step is skipped by design: this is a single-leg
  diagnostic on a fresh band, and the pool floor (6 launches, 5
  pre-fight deaths) is set FROM the fightcap reference band's
  measured rate (24 launches, 10 dead companions), not from an
  unjudged survey of this band. Running a survey first would spend
  a second identical leg to measure what the reference already
  measured.
