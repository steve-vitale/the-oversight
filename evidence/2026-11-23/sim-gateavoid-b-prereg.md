# sim-gateavoid-b — FROZEN prereg (Loop B run fleshout-loop-b-20261123T0030Z)

**Frozen:** 2026-11-23 ~01:40 UTC, BEFORE any judged sim. Base master
`0b3993e80` (full `0b3993e80`, "Journey succession r267: run note proof
re-runs on rebased tip 93b7f628d (r267 + five carried proofs GREEN)").
Branch `sim-gateavoid-b`, worktree `~/workspace/worktrees/sim-gateavoid-b`.
Run `fleshout-loop-b-20261123T0030Z`, arm `sim-gateavoid-b` (the DURABLE
GATE-AVOID LOG + the leaderproj RE-JUDGE — the tracker's topmost next
blank for Loop B, findings #2695/#2696).

## The question (finding #2695, next step after the leaderproj NO-GO)

The leaderproj arm judged the LEADER-PROJECTION gate NO-GO kind
METRIC-BROKEN: the gate fires (8 times on band 107391–107398) and the
armed leg fought ZERO collapse-band doors — the mechanism works — but
the D1 attribution channel is blind. Gate-avoid notes are written to
the leader's expedition record, which `expeditionReturn` deletes when
the leader comes home (`src/js/villager-agency.js:1097`; death path
`:1011`), and avoided meetings write no `v4encounters` row at all. The
end-of-run note census therefore saw 9 fires as 1 note. D1 scored both
pool doors BAD ("divergence — no armed row, no gate note"), not because
the gate failed but because the instrument could not see the gate's
avoids. D2/D3 failed on a 3-vs-5-door band where one door swings the
rate by 13pp+ — thin-band noise, not a lever signal. This arm builds
the durable gate-avoid log the leaderproj §9 names verbatim, then
RE-JUDGES leaderproj on the SAME band with the attribution channel
fixed. The gate itself stays env-gated OFF; NO default flip.

## The mechanism (read from the sources, not taken on trust)

Door parties form at the door-open decision in
`src/js/villager-agency.js` `expeditionMonster`. Three gates sit there,
in order, after the `_pinDoor` computation and before `fieldFight`,
each with the same avoid verb (encounter note + return, no fight, no
flee, no death) and the same counter shape:

- HPGATE (landed): whole party, any member < 25 HP → 'hold' note,
  counter `st.hpgateFires`.
- LEADERHPGATE (landed, subsumed): leader < 25 HP → 'lead' note,
  counter `st.leaderhpgateFires`.
- LEADERPROJ (landed, env-gated): leader projected ≤ 25 HP after two
  rounds at 25/round (leader HP ≤ 75) → 'proj' note, counter
  `st.leaderprojFires`.

All three push their note to `st.exped[vid].encounters`. `expeditionReturn`
(`villager-agency.js:1093`) does `delete st.exped[vid]` first thing
(`:1097`); `expedDeath` does the same (`:1011`). The counters live on
the agency state object (`v.agency`, returned live by `agencyState()`),
which is NOT deleted at return — that is why D4 (counter ≥ 1) passed
while D1 (note attribution) could not see a single fire. The log goes
on the same surviving object.

## THE LOG DESIGN — frozen (the build implements exactly this)

`st.gateAvoids`: an array on the agency state, appended at fire time
inside each of the three gate-fire blocks, one record per fire:

- `{ day, vid, mid, kind, name, hp, projHp2, note }` — day from
  `this.state.scholar.day` (guarded, 0 fallback); vid = the leader's
  roster id; mid = the monster id (null fallback); kind = 'hold' /
  'lead' / 'proj'; name = the fired member's display name; hp = the
  fired member's HP; projHp2 = the two-round projection for 'proj',
  null for 'hold'/'lead'; note = the SAME note string pushed to the
  expedition record (the narrative surface is unchanged — the log
  adds, it does not replace).
- The array is created LAZILY, only inside a gate-fire block
  (`st.gateAvoids || (st.gateAvoids = [])`). With all three flags off
  the key never exists and the game is byte-identical — proved by the
  proof test's §4 (no key after flag-off doors; healthy fight
  identical flag-on vs flag-off).
- The log writes ONLY when a gate fires (LEADERPROJ, HPGATE,
  LEADERHPGATE). No other code path touches it. No RNG is drawn by
  the append (proved by the proof test's §0 source check).
- The driver stamps it verbatim on the corpus file as `gateAvoidLog`
  (a copy at end of run), alongside the kept `gateAvoidNotes` parse.
  The analyzer attributes avoided doors from the LOG (seed + day +
  monster — the log carries the day the notes never had). This is an
  INSTRUMENT fix, not a bar change: the frozen D1 rule (same seed +
  day + monster) is unchanged; only the channel that answers it is.
- The gate itself stays env-gated OFF; NO default flip in this arm.
  Landing the log as a game change is a separate question (it is an
  instrument that also lives in game code); the log's game-code
  footprint is the three appends (+~45 lines, one file).

## THE D1 RULE — carried VERBATIM from the leaderproj prereg

D1 is priced exactly as frozen in
`evidence/2026-11-22/sim-leaderproj-b-prereg.md` (see "The D1 redesign"
there): the pool is the CONTROL leg's fought doors whose leader entered
≤ 75 HP (projHp2 ≤ 25); the armed leg is scored on the SAME door (same
seed + day + monster). GOOD: the projection gate avoided it (a 'proj'
log entry on the same seed + day + monster), the armed party killed the
monster, or the monster fled. BAD: the armed party fled or died, the
door diverged away with no log entry, or ANOTHER gate ('hold'/'lead')
avoided it — not this gate's credit, counted bad conservatively. An
'other' armed outcome is also bad. D1 GO: armed bad rate ≤ control bad
rate − 20pp, where the control bad rate is the vFlee+vDie share of its
own pool. The pool must be non-empty; an empty control pool is
UNMEASURABLE and FAILS. The one change from the leaderproj run is the
attribution channel (durable log, not parsed notes) — see "THE LOG
DESIGN" above. The day-window matching the leaderproj metric review
proposed ("match on seed + monster with a day window") is NOT adopted
here: D1 stays on the frozen same-day rule, and divergence stays BAD
by design; if divergence still dominates, the proposal returns in this
arm's metric review for the NEXT run, not as a re-score of this one.

## Design — paired pilot on the SAME band (a re-judge, deliberately)

**Band (REUSED, not fresh):** 107391, 107392, 107393, 107394, 107395,
107396, 107397, 107398. A re-judge deliberately reuses the identical
band — the point is to judge the SAME doors with the attribution
channel fixed, not to sample new doors. State it plainly: this is the
leaderproj band, reused on purpose. (Seed-band freshness: the band is
NOT fresh — it was the leaderproj band, 2026-11-22. The reuse is the
design, per the arm brief; a confirm, if the pilot GOes, runs on a
FRESH band — see "Confirm rule" below.)

**Band screening (the §14b pool-sizing probe — recorded, not hidden):**
the control config is probed on this band BEFORE the judged legs, to
check door supply on THIS base (master moved 1c11dbb14 → 0b3993e80
since the leaderproj probe, including the needwave guarded copy in
villager-brain.js + win-plan.js — the prime drift suspect if the
table moves).
**Probe (TODO-PROBE — fill from the analyzer before the judged legs):**
control config on 107391–107398, 0 instrument errors expected, anchor
`0b3993e80`, policySha `1884c8852d38`. The leaderproj probe table on
base 1c11dbb14 was: fought doors 3 (vKill 2, vDie 1); D1 matched
projection pool 2 doors, bad 1/2 = 50% (107391 d98 reunion vDie,
leader 61; 107394 d113 rerun vKill, leader 38); S10 dead1 0 / dead2 1
/ collapse2 1 / safe 1. Seeds 107396–107398 added no fought doors.

**Probe determinism tripwire:** the probe runs the control config on
this band (8 seeds, 0 instrument errors, anchor `0b3993e80`,
policySha `1884c8852d38`). The judged control leg re-runs the same
seeds under the same config and MUST reproduce the probe's door table
— the sims are seeded and deterministic. If the judged control differs
from the probe, STOP and investigate (the code moved under the run);
do not judge the armed leg against a drifted control. If the probe
differs from the leaderproj probe table, investigate BEFORE freezing
the judged legs (master movement is the standing suspect — the
needwave guarded copy changes companion-plan sync on the launch path)
and record the cause in the probe section; the tripwire is then the
probe table on THIS base, stated here before the legs run.

- **Control leg:** substrate + `DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`
  (the hpgate ARMED configuration, re-run fresh on current master).
  The leader floor (LEADERHPGATE) is NOT carried on either leg — it
  never fires alongside HPGATE (subsumed), and carrying it would only
  add a dead flag to the substrate.
- **Armed leg:** control flags + `LEADERPROJ=1`, nothing else. Same
  seeds, same policy, same horizon. The only difference between the
  legs is the projection gate.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time. IDENTICAL to the leaderproj band.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail max).
  Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (a 16-seed single call was
  SIGTERMed before; per-seed files persist across kills; resume,
  never re-run completed seeds. The driver refuses to overwrite,
  exit 3).
- **Driver env:** `EVIDENCE_DATE=2026-11-23
  CORPUS_PREFIX=gateavoid-b RUN=gateavoid-b
  OUTDIR=perseed-gateavoid-b-control` / `...-armed` (+
  `LEADERPROJ=1` armed only). Corpus files
  `gateavoid-b-s<seed>-gateavoid-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm on a FRESH band runs ONLY if
  this pilot GOes on every bar. A pilot NO-GO spends no confirm seeds.
  (The confirm band is a next-run decision, not frozen here.)
- **Master movement:** if master moves after the legs start, this arm
  does NOT rebase mid-run — the anchor is frozen at `0b3993e80` and
  the legs judge on it; the coordinator merges afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on both
legs, through the gateavoid analyzer (`scripts/analyze-gateavoid-b.js`,
the leaderproj analyzer with the attribution channel moved to the
durable log + the new D6 durability bar; selftest green — count
recorded at build, see "Instrument"), plus a node one-liner over the
raw corpora for the door table (the dmgpin method). The analyzer is
the leaderproj analyzer with D1/S9 attribution reading `gateAvoidLog`
(keyed seed+day+mid) instead of `gateAvoidNotes`, D5 requiring
`gateAvoidLog` an array on every file, and D6 added. D1–D5 are carried
VERBATIM from the leaderproj prereg; D6 is new in this arm (the
instrument bar — it proves the log works, so a D1 verdict on this run
rests on a proven channel).

**GO requires ALL of:**

- (M1) **Port gate:** `test-allyslot3-b.js` 18/18 on this tree.
- (M2) **Staged pin proof** (`scripts/test-pinquaddoor-b.js`):
  35/35 on this tree.
- (M2w) **Wide-instrument proof**
  (`scripts/test-pinquaddoor-wide-b.js` + analyzer selftest):
  16/16 on this tree.
- (M3) **Damage proof** (`scripts/test-dmgpin-b.js`): 29/29 on
  this tree.
- (M3d) **Staying proof** (`scripts/test-doorflee2-b.js`):
  49/49 on this tree (the hold this arm combines with).
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**, on this tree.
- (M3f) **Floor proof** (`scripts/test-hypofloor-b.js`): 48/48
  on this tree.
- (M3g) **Whole-party gate proof** (`scripts/test-hpgate-b.js`):
  43/43 on this tree (the gate this arm combines with).
- (M3h) **Leader-gate proof** (`scripts/test-leaderhpgate-b.js`):
  50/50 on this tree (the gate this arm sits after).
- (M3i) **Projection-gate proof** (`scripts/test-leaderproj-b.js`):
  55/55 on this tree.
- (M3j) **Durable-log proof** (`scripts/test-gateavoid-b.js`,
  NEW): 36/36 on this tree — HPGATE fire appends a 'hold' entry
  that survives expeditionReturn; LEADERHPGATE fire appends a
  'lead' entry that survives expeditionReturn; LEADERPROJ fire
  appends a 'proj' entry (hp 64, projHp2 14) that survives
  expeditionReturn AND the death path; off-mode identity (no
  gateAvoids key with all flags off; no entry with flags on and
  a healthy leader; healthy fight identical flag-on vs flag-off);
  two fires accumulate in order; driver smoke (gateAvoidLog an
  array, length == total gate fires); base gates re-run green
  (hpgate 43/43, leaderproj 55/55).
- (M4) **Panel bars** (control pin+damage+hold+floor+whole-party
  gate vs armed +LEADERPROJ, same seeds, same policy):
  - (D1) **Bad-outcome rate on the matched projection pool,
    PRIMARY (VERBATIM):** for each CONTROL fought door whose
    leader entered ≤ 75 HP (projHp2 ≤ 25), the armed leg's outcome
    on the SAME door (same seed + day + monster): GOOD = 'proj'
    avoid, vKill, or mFlee; BAD = vFlee, vDie, divergence (no
    armed row, no gate log entry), 'hold'/'lead' avoid, or any
    other armed outcome. Armed bad rate ≤ control bad rate − 20pp,
    where the control bad rate is the vFlee+vDie share of its own
    pool. If the control pool is empty, D1 is UNMEASURABLE and
    FAILS.
  - (D2) **Kill rate per FOUGHT door (per-door, NOT leg-total
    kills; VERBATIM):** armed vKill rate per fought door ≥ control
    rate − 2pp. A RATE — the armed leg may fight fewer doors
    because it avoided some; leg-total kills are NOT the judge.
  - (D3) **Damage guard (repriced, carried; VERBATIM):** armed
    TOTAL damage per door/fight ≥ 0.9× control (total dealt on
    fought doors divided by fought doors — NOT per-round).
  - (D4) **Mechanism engagement (VERBATIM):** armed
    `leaderprojFires` ≥ 1 — the lever must fire at least once to
    be judged a lever at all.
  - (D5) **Substrate sanity (VERBATIM + the log):** every control
    corpus file carries `leaderprojFlag` null AND
    `leaderhpgateFlag` null AND `hpgateFlag` '1' AND
    `hypofloorFlag` '1' AND `doorflee2Flag` '1' AND `dmgpinFlag`
    '1' AND `pinquadFlag` '1'; every armed file carries
    `leaderprojFlag` '1' AND `leaderhpgateFlag` null AND
    `hpgateFlag` '1' AND `hypofloorFlag` '1' AND
    `doorflee2Flag` '1' AND `dmgpinFlag` '1' AND `pinquadFlag`
    '1'; every corpus file carries `leaderprojFires` as a number
    AND `hpgateFires` as a number AND `leaderhpgateFires` as a
    number AND `gateAvoidNotes` as an array AND `gateAvoidLog` as
    an array AND `anchorCommit` equal to the frozen base (§"Anchor
    rule") and `policySha` `1884c8852d38`.
  - (D6) **Durability (NEW — the instrument bar):** per leg, the
    durable log is COMPLETE — `gateAvoidLog` length equals the
    total gate fires (`hpgateFires + leaderhpgateFires +
    leaderprojFires`) AND the per-kind log counts equal the
    per-kind counters (hold == hpgateFires, lead ==
    leaderhpgateFires, proj == leaderprojFires), with no entry of
    unknown kind. A D6 miss means the log itself is broken and the
    re-judge cannot be trusted — verdict NO-GO kind
    METRIC-BROKEN regardless of D1.
  - **SUPPLY rule (frozen):** if the CONTROL leg yields ZERO
    fought doors, D2/D3 are unmeasurable and the verdict is NO-GO
    kind SUPPLY-THIN, not a lever failure. (An empty D1 pool with
    fought doors present is NOT supply-thin — it is judged under
    D1 as above. The distinction is frozen here so the two empties
    are never confused.)
- (M5) **Guardrail — no regression:** the balanced-panel compare
  returns `review_required` with NO `regression_signal` on village
  deaths / deaths-per-100d. **AND the scalemetric deciding cost bar
  (binding for future scale arms, convergence-tracker.md):** GO
  requires starvation ≤ control+2 on totals AND arm-only deaths
  AND median survival ≥ 0.8× control median; death counts
  diagnostic only. A breach of either half is NO-GO.
- (M6) **Deliverable:** evidence file with the frozen-bar table,
  the door-fight table (every fought door, both legs, with flee
  round + party state at flee time + doorHold rounds +
  conversions + gate fires + leader entry HP + projection band),
  the matched-pool table (every control pool door with its armed
  outcome), wall numbers, a sense-test transcript read (at least
  two fought doors quoted blow-by-blow — if a gate avoid happens,
  quote the avoided meeting's persisted log entry and the nearest
  fought door), the diag table (§1 of the doorflee evidence), the
  balanced-panel compare output attached, and a metric-review
  section; corpora under
  `evidence/2026-11-23/perseed-gateavoid-b-control/` and
  `...-armed/`.

A miss on any of M1–M5 is NO-GO, never re-scored against a friendlier
metric. If the metric proves wrong, write it under "metric review" and
propose the revision for the NEXT run. A NO-GO is classified per §14a
(CONCEPT-DEAD / METRIC-BROKEN / SUBSTRATE-MISSING) in the evidence
file's verdict section.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Hold census: `doorHold` rounds per leg, fights with a hold,
  `everHopeless` fights per leg.
- (S2) **Conversion census (the effect metric):** matched-seed door
  pairs (same seed + day + monster): control vFlee → armed vKill
  (conversion), control vFlee → armed vFlee at a later round
  (later-flee), control vFlee → armed identical (no-change), control
  door with NO armed counterpart (avoided — reported with its S9
  attribution, never proof on its own).
- (S3) Leader-death census: `vDie` doors per leg + the leader HP at
  death.
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset) —
  RATE ONLY, no ≥3-row floor (the floor is dropped for this arm; see
  the analyzer header).
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time, leader entry HP,
  projection band.
- (S6) Wall numbers: wins / national (by scaleRank ≥ 2 AND by
  standing ≥ 200) / table, wave 4–5 unlocks, median survival,
  deaths, villages lost, starvation — control vs armed.
- (S7) Sub-floor census: fought doors where the LEADER entered below
  25 HP, both legs (the floor gates' pool) + fought doors where ANY
  party member entered below 25 HP as read from the gate-avoid log
  (the whole-party gate's pool).
- (S8) Gate-fire census: `hpgateFires` + `leaderhpgateFires` +
  `leaderprojFires` summed per leg (the direct evidence each gate
  fired), plus the gate-avoid notes (`gateAvoidNotes`: mid, member
  name, kind, HP, projected HP — the persisted avoid, kept for
  backward compatibility) AND the durable log (`gateAvoidLog`: day,
  mid, member name, kind, HP, projected HP — the attribution
  channel; S8c). The log-vs-notes gap (log entries minus surviving
  notes) is reported as the measured size of the old blind channel.
- (S9) Avoided-doors census: control doors with no armed counterpart
  row (seed/day/monster), ATTRIBUTED via the armed leg's durable log
  (same seed + day + monster): 'proj' = the projection gate fired
  on that door, 'lead' = the leader gate fired on it, 'hold' = the
  whole-party gate fired on it, 'divergence' = no log entry —
  trajectory divergence dropped the row.
- (S10) Leader-projection census: per fought door, the leader's
  projection band (dead1 / dead2 / collapse2 / safe) and projected
  HP after one/two rounds; per fired door (log entry), the fired
  member's projection and whether the fired door's leader was
  projected-dead ('proj' entries carry a known leader HP, as do
  'lead' entries; 'hold' entries do not).
- (S11) D1fought (reported secondary): flee rate on fought
  projection-pool doors per leg — expected unmeasurable on the armed
  leg when the gate works (it refuses every pool door).

## Base + substrate (verified, not assumed)

- Base: master `0b3993e80` at arm start. The worktree HEAD at freeze
  IS the frozen base; the anchor stamped on every corpus file is
  `0b3993e80`. This base is LATER than the leaderproj base
  `1c11dbb14` — the intervening master commits are the leaderproj
  landing (fb0794a44), the needwave guarded copy (054f525bc,
  villager-brain.js + win-plan.js companion-plan sync), dawnchoke /
  homebody / gunloss / needwave evidence + instrument commits, and
  journey r264–r269 work. The probe + judged control leg both run on
  this base, so the comparison is self-consistent; the tripwire
  guards the probe→legs step, and the probe-vs-old-probe comparison
  is recorded before the legs run.
- The substrate (PINQUAD + DMGPIN + DOORFLEE2 + HYPOFLOOR + HPGATE +
  LEADERPROJ) is ON this base: the LEADERPROJ lever is in the tree
  (`src/js/villager-agency.js`, LEADERPROJ block, landed on master
  fb0794a44); the LEADERHPGATE lever is also in the tree but its flag
  is NOT carried on either leg (subsumed — it never fires alongside
  HPGATE). The only `src/` change this arm makes is the GATEAVOID
  log appends in the same file (three blocks, +~45 lines). NO port
  from any held branch was needed; the held branches are NOT merged,
  NOT modified, NOT rebased.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
  Armed leg adds `LEADERPROJ=1` only.
- The log's exact identity is recorded alongside the anchor:
  `src/js/villager-agency.js` diff (GATEAVOID appends in the three
  gate-fire blocks), `node --check` green, no other `src/` file
  touched by this arm's build. Driver diff (gateAvoidLog stamp +
  legs-log line only). Analyzer is a new file
  (`scripts/analyze-gateavoid-b.js`, copied from
  analyze-leaderproj-b.js and adapted — see "Instrument").

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at load
  time. The FROZEN BASE is master `0b3993e80`. **Nothing is committed
  before the judged legs run** — the prereg, the instrument, the log,
  and the proof runs all happen with HEAD still at the frozen base, so
  the stamped anchor IS the frozen base. The final commit happens only
  AFTER the legs + evidence are written.
- The evidence verifies `anchorCommit` on EVERY corpus file against
  the frozen base; a mismatch voids that leg.
- **If anything is committed before the judged legs, the legs must be
  re-run after a dated prereg CORRECTION** — never amend the expected
  anchor post-hoc.

## Instrument (copied from the leaderproj arm, adapted only where the log changes)

- Driver: `scripts/pinquaddoor-driver-b.js` — on master already
  (leaderproj arm's version); this arm's adaptation ONLY: the corpus
  stamp gains `gateAvoidLog` (the durable log, stamped verbatim from
  `st.gateAvoids` at end of run) and the legs-log line gains the log
  length. `gateAvoidNotes` (parsed from live expedition records) is
  kept unchanged. No other driver behavior changes; the M2w wide test
  (which asserts the driver defaults) re-runs green on the edited
  copy.
- Analyzer: `scripts/analyze-gateavoid-b.js` — NEW, copied from
  `scripts/analyze-leaderproj-b.js` and adapted: D1 matched-pool +
  S9 avoided-doors attribution read `gateAvoidLog` (keyed
  seed+day+mid) instead of `gateAvoidNotes`; S10 fired list reads the
  log (with day); new S8c log census; D5 requires `gateAvoidLog` an
  array on every file; new D6 durability bar (log complete vs the
  three counters, per leg, per kind); selftest extended with the
  D6/log sections — 39 checks, verified by grep at build time
  (the development selftest run is the rehearsal; the post-freeze
  run is the judged one).
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f),
  `scripts/test-hpgate-b.js` (M3g),
  `scripts/test-leaderhpgate-b.js` (M3h),
  `scripts/test-leaderproj-b.js` (M3i) — on master already, run
  verbatim;
  `scripts/test-gateavoid-b.js` (M3j, NEW, 36 checks).
- Fixtures (read-only copies of prior judged data, for the proofs
  only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — on master already,
  run verbatim as
  `RUN=gateavoid-b CORPUS_PREFIX=gateavoid-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-23/gateavoid-b-panel --before
  evidence/2026-11-23/perseed-gateavoid-b-control --after
  evidence/2026-11-23/perseed-gateavoid-b-armed --seeds
  107391,107392,107393,107394,107395,107396,107397,107398
  --before-seeds <same>` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file.

## Proofs (to run after freezing, before judged legs, on this tree)

- M1 `test-allyslot3-b.js` **18/18** (target).
- M2 `test-pinquaddoor-b.js` **35/35** (target).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (target).
- M3 `test-dmgpin-b.js` **29/29** (target).
- M3d `test-doorflee2-b.js` **49/49** (target).
- M3e `test-downedtwice-b.js` **exit 0, 25/25** (target).
- M3f `test-hypofloor-b.js` **48/48** (target).
- M3g `test-hpgate-b.js` **43/43** (target).
- M3h `test-leaderhpgate-b.js` **50/50** (target).
- M3i `test-leaderproj-b.js` **55/55** (target).
- M3j `test-gateavoid-b.js` **36/36** (target — NEW; development
  run pre-freeze counts the checks, the post-freeze run is the
  judged one).
- Analyzer selftest `analyze-gateavoid-b.js --selftest` (target:
  39/39 green).

## Expectation (not a bar)

Control (pin+damage+hold+floor+whole-party gate) should reproduce
the probe on this band — report this band's own numbers; do not force
a match to the probe beyond the tripwire. The pilot is expected to
GO on D1 if the durable log attributes the pool doors the gate
refused (the leaderproj armed leg fired on both pool seeds — 107391
×1, 107394 ×1 — and the log will say whether either fire WAS the pool
door), with D2/D3 passing on the remaining fought doors and D4 ≥ 1
and D6 complete. If the pool doors diverged anyway (the gate fired
elsewhere on those seeds and the worlds moved on), D1 still fails on
the frozen rule — the log will have proved the mechanism's fires are
real and attributable, and the metric review will carry the day-window
proposal to the NEXT run. If the armed leg's `leaderprojFires` is 0,
STOP: the gate's condition never met a door on this band, and the
verdict must be re-derived from the mechanism, not from the frozen
expectation. If the control leg yields 0 fought doors, the verdict is
NO-GO kind SUPPLY-THIN per the frozen rule (D2/D3 unmeasurable), and
the projection question stays open for a door-richer band.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-23/gateavoid-b-legs.log` (one JSON
  line per seed + EXIT lines; fallback recovery). The log diff, the
  fixture copy shas, and the proof counts are recorded there.
- Evidence: `evidence/2026-11-23/sim-gateavoid-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party state
  + doorHold + conversions + gate fires + leader entry HP +
  projection band, matched-pool table, wall numbers, sense-test
  transcript read, metric review) + `gateavoid-b-panel.md` + panel
  JSONs + analysis JSON (analyzer --json over each corpus dir).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait until
  none is running; never run two concurrently. (The proof tests are
  plain node, not jest, so they run without adding a jest process.)
- Write flap: intermittent EPERM on fresh-file writes is active this
  week (window from ~01:31Z at arm start; the analyzer copy took
  three attempts). Probes run before writes that matter; the driver
  uses write-robust paths; a blocked final commit leaves files on
  disk intact for coordinator adoption, never forced. Never remove an
  index.lock on a ps grep alone.
- Git slowness: index-touching git commands can run minutes under
  hot-tree load. Prefer commit-to-commit reads (`git show` /
  `git diff <commit> <commit>`) and `git grep`, which stay fast.
- VM replacement: if a process dies or the machine restarts under this
  run, re-establish state from disk and report it — do not redo
  finished work silently.

## Metric review (adopted from leaderproj §8 — this run is judged as frozen)

- **D1 is carried verbatim; only the attribution channel changes.**
  The durable log is the instrument fix the leaderproj metric review
  proposed ("make gate-avoid notes durable — a dedicated agency-state
  array appended at fire time"). D1's bar (armed bad ≤ control bad −
  20pp on the matched pool) is unchanged.
- **Divergence stays BAD by design** — but the consequence stands:
  once the gate fires anywhere on a seed, the world diverges and the
  matched pool doors may never recur, so a working gate can fail D1
  even with durable notes unless the fire IS the pool door. The
  day-window matching proposal ("match on seed + monster with a day
  window") is NOT adopted in this run; if divergence still decides
  D1, it returns in this arm's metric review for the NEXT run.
- **D4's bar (≥ 1 fire) is still weak as written** — D6 now pairs it
  with the durability check the leaderproj metric review proposed
  (log complete vs counters), so D4 cannot pass a blind gate. D6 is
  the durability bar; D4 stays the engagement bar.
- **D2/D3 on a 3-vs-5-door band are noise, not signal** (leaderproj
  metric review). One door swings D2 by 13pp and D3 by ~20%. If this
  band's door supply is again thin, the next run needs a door-richer
  band (or a 12–16-seed confirm) before D2/D3 can bind — do not
  re-score this pilot's D2/D3.
- F1/D1 is priced on the flee RATE with the count as a secondary.
- D2 is priced on the kill RATE per fought door, NOT leg-total kills.
- D3 is priced on TOTAL damage per door/fight, not per round.
- B1's ≥3-armed-row floor is DROPPED for this arm (reported as a
  rate-only secondary).
- The effect metric is conversions (flee→kill, flee→later-flee) PLUS
  attributed avoids (control door with no armed counterpart, with its
  S9 attribution), not hold rounds.
- The door-line order quirk (door lines print 2, 3, 1) persists in
  the ported slot code; cosmetic, no bar.
- The gate-avoid note is persisted as `gateAvoidNotes` on the corpus
  file AND now as `gateAvoidLog` — so the sense test can quote the
  avoid from the durable log, and the projection gate's log entry
  carries its projected HP, so the attribution names the forecast,
  not just the fire.
- The S7 blank from doorflee2 is closed as a census in two halves:
  leader-sub-25 fought doors (the floor gates' pool) and
  any-member-sub-25 doors as read from the gate log (the whole-party
  gate's pool).

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (damage
  35–95, HP 850–1500, "a 4-6 round fight"; no canon doc prices a
  morale read, a hypothetical-HP floor, a commitment hold, or an HP
  gate — the gate is a sim lever, judged door by door; the log is an
  instrument on the same gates).
- `evidence/2026-11-22/sim-leaderproj-b.md` (the NO-GO kind
  METRIC-BROKEN, the 8 fires / 1 note diag, the door-fight and
  matched-pool tables, the tripwire) + its frozen prereg (D1–D5
  carried verbatim here).
- `evidence/2026-11-22/sim-leaderhpgate-b.md` (§§1, 5, 9, 10 — the
  NO-GO kind CONCEPT-DEAD (subsumed), the d108/d147 sense test, the
  S10 projection census, the named next lever) + its frozen prereg.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, §14a kill taxonomy, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` —
  the band is deliberately REUSED (a re-judge), not fresh; stated
  above, not hidden.
- The scalemetric deciding cost bar (convergence-tracker.md):
  starvation ≤ control+2 (totals AND arm-only) AND median ≥ 0.8×
  control median.

## Files

- Prereg: `evidence/2026-11-23/sim-gateavoid-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (gateAvoidLog stamp +
  legs-log line), `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-gateavoid-b.js` (NEW — D1/S9 attribution from the
  durable log + D6 durability + S8c log census, selftest green),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-doorflee2-b.js`, `scripts/test-downedtwice-b.js`,
  `scripts/test-hypofloor-b.js`, `scripts/test-hpgate-b.js`,
  `scripts/test-leaderhpgate-b.js`, `scripts/test-leaderproj-b.js`,
  `scripts/test-gateavoid-b.js` (M3j, NEW, 36 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Probe corpora (pre-freeze substrate/pool check, control config):
  `evidence/2026-11-23/perseed-gateavoid-b-probe/` + probe logs
  `gateavoid-b-probe-chunk1.log`, `gateavoid-b-probe-chunk2.log`
- Corpora (fresh, judged): `evidence/2026-11-23/perseed-gateavoid-b-control/`
  (8 files) + `evidence/2026-11-23/perseed-gateavoid-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-23/gateavoid-b-analysis.json`
  (analyzer --json over both corpus dirs) + `gateavoid-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-23/sim-gateavoid-b.md`
- Leg log: `evidence/2026-11-23/gateavoid-b-legs.log`
- `src/` diff: the GATEAVOID log appends in
  `src/js/villager-agency.js` only (three gate-fire blocks). No
  default flip.
