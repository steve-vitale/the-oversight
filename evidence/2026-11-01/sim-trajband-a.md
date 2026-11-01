# sim-trajband-a — band trajectory-safety check (DIAG ONLY, zero src/js)

Run fleshout-loop-a-20261101T0715Z, axis scale-onramp. Question (0615Z
closeout blank 1): is the seed-87135 pattern general — early-gate
acceleration + muster episode — or a one-seed story?
Preregistration: `evidence/2026-11-01/sim-trajband-a-prereg.md` (committed
before any judged sims). Proof: `scripts/test-trajband-a.js` — **51/51
passed**. Analyzer: `scripts/trajband-a-analyze.js` →
`evidence/2026-11-01/trajband-a-analysis.json` (band summary; per-seed
corpora under `evidence/2026-11-01/trajband-a-baseline/` and
`evidence/2026-11-01/trajband-a-lever/`).

## Verdict: DIAG-GO (all three preregistered bars met)

1. **8/8 fresh seeds produce a classifiable trajectory outcome** — zero
   UNCLASSIFIED.
2. **Recorder neutrality holds on all 8 seeds** (zero neutrality fails).
3. **Falsified alternatives** for the band-level patterns claimed (below).

Judged exactly against the prereg bar; no re-scoring.

## The band answer, in plain words

**The 87135 acceleration does NOT generalize. The shelter mechanism
does — but as an ordinary part of the game, not as a lever effect.**

- Early-gate acceleration: **0/8 seeds**. Kill-only: 0/8. Absent: 8/8.
- The contact-finish rule fires on only **1/8 seeds** (91408). On the
  other 7, the lever leg is **byte-identical** to the baseline leg —
  the rule never engages at all, so those trajectories cannot differ.
- Muster episodes occur on **4/8 seeds — identically on both legs**.
  The shelter collapse follows shelter on 3 of those 4, rule or no
  rule. The 87135 story (rule → early wave 4 → shelter → collapse) is
  a real mechanism, but in this band the trigger almost never fires
  and the shelter half happens on its own schedule anyway.
- End rank understates peak rank on **0/8 seeds** on either leg — the
  87135 lever shape (peak global, end regional) does not recur.
- Trajectory-SAFE: **0/8** — vacuous, since SAFE requires ACCEL and
  there is no ACCEL anywhere in the band.

## Per-seed numbers (baseline → lever)

| seed | div | B w3kill / w4spawn | L w3kill / w4spawn | L attempts | muster (both legs) | collapse | B end/peak | L end/peak | outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 91401 | – | 82 / never | 82 / never | 0 | none | N/A | regional/regional | regional/regional | ABSENT/NO-MUSTER |
| 91402 | – | never / never | never / never | 0 | none | N/A | national/national | national/national | ABSENT/NO-MUSTER |
| 91403 | – | 56 / 64 | 56 / 64 | 0 | MAJOR 65–90, max 9 | PRESENT 1.9→0 opps/d, 1.37→0 fights/d | national/national | national/national | ABSENT/MUSTER-MAJOR |
| 91404 | – | never / never | never / never | 0 | none | N/A | regional/regional | regional/regional | ABSENT/NO-MUSTER |
| 91405 | – | 118 / 122 | 118 / 122 | 0 | MAJOR 123–158, max 7 | ABSENT 1.27→0.47 opps/d (37%, above the 25% bar), 1.1→0.22 fights/d | national/national | national/national | ABSENT/MUSTER-MAJOR |
| 91406 | – | 81 / 94 | 81 / 94 | 0 | MAJOR 95–180, max 6 | PRESENT 2.27→0.53 opps/d, 1.43→0.28 fights/d | global/global | global/global | ABSENT/MUSTER-MAJOR |
| 91407 | – | 172 / 174 | 172 / 174 | 0 | MAJOR 175–180, max 7 | PRESENT 1.3→0 opps/d, 1.1→0 fights/d | global/global | global/global | ABSENT/MUSTER-MAJOR |
| 91408 | 47 | 58 / 71 | 59 / never | 3 (1 kill) | none (B: MAJOR 72–93, max 10) | N/A | global/global@86 | regional/regional@50 | ABSENT/NO-MUSTER |

Wall numbers (this band, both legs): won 4/8 baseline (91401, 91402,
91403, 91408) vs 3/8 lever (91408 drops out); national-end 6/8 baseline
vs 5/8 lever; wave 4 reached 5/8 baseline (91403, 91405, 91406, 91407,
91408) vs 4/8 lever (91408 drops out); wave 5 reached 0/8 both legs;
full seat 0/8 both legs (not instrumented per-seed here — the fullseat
lane's verdict stands). Median survival: baseline 93.5d, lever 91.5d
(both legs' runs end 89–181d; 180d death-aware cap).

## Why the rule never fires on 7/8 seeds

The rule engages only in villager field-fight CONTACT meetings with a
close instrument against a low-HP wave-3 beast — a narrow window, and
this band mostly never opens it:

- 91404, 91405: **zero baseline wave-3 field fights at all** (91405's
  wave-3 kill on day 118 comes through the player channel, not a
  villager field fight; 91404 never kills wave 3 at all). No villager
  wave-3 meeting, no contact finish.
- 91401, 91402, 91403, 91406, 91407: baseline wave-3 field fights exist
  (21, 11, 6, 3, 4) but **no meeting is finishable at contact**: across
  all five seeds, only ONE baseline wave-3 meeting has
  mHpAtContact ≤ 40 (91403 day 63, callback at 36 HP, outcome mFlee) —
  and on the lever leg that same meeting still produces no attempt
  (legs byte-identical), so low HP alone is not the trigger; the
  meeting shape (contact vs volley/evade/flee) and the fighter's close
  instrument gate it.
- 91408 is the exception: three chorus_line meetings at 39/27/2 HP
  trigger attempts (see sense reads). The band's rule-engagement rate
  is therefore 1/8 seeds, 3 attempts, 1 kill — not a lever that
  routinely reroutes trajectories.

## Seed 91408: the one seed where the rule fires — and it decelerates

Lever attempts: day 46 (kitchen knife vs 39-HP chorus_line, beast
flees), day 54 (machete vs 27-HP, flees), day 59 (hatchet vs 2-HP,
**kill** — the lever leg's first wave-3 kill, wild, Luis Fernandez).
Baseline's first wave-3 kill is day 58 (terms_of_service, player
channel) — **one day earlier** than the lever's finish kill
(killAccelDays = −1). The attempts spend seeded rolls (divergence
day 47, the day after the first attempt), rerouting the trajectory:
baseline's day-58 player kill never happens on lever, and the lever
leg's later wave-3 kills (day 63 ad_break, day 71 spool) never build
the standing baseline builds. End state: lever standing 95, **below
the t4 bar of 100**, engine unlockedWave 3, **no wave-4 spawn ever**;
baseline standing 199, unlockedWave 4, first wave-4 spawn day 71
(Algorithm at (5,4)), first wave-4 fight day 71, and its own muster
episode days 72–93 (max 10) that the lever leg never gets to have.
Lever ends regional (peak regional day 50, 90d, over-other) where
baseline ends global (peak global day 86, 93d, over-other). The one
firing seed is an anti-acceleration: the rule's RNG reshuffle plus a
standing shortfall, not an early key. (Standing decomposition — which
component of blood/bonds/bread accounts for 95 vs 199 — is NOT
instrumented here; the claim is only the measured totals and the
t4 bar they sit either side of.)

## Muster episodes: the mechanism generalizes, the trigger does not

On 91403, 91405, 91406, 91407 the muster episode is **byte-identical
on both legs** — same start day, same max, same collapse shape. The
pattern is always the same: first wave-4 spawn, then muster the next
day (91403: spawn day 64 → muster day 65; 91405: 122 → 123; 91406:
94 → 95; 91407: 174 → 175), with a wave-4 monster 1 tile from Haven
at episode start (91403: Reunion at (3,5), Haven (4,4)). Shelter depth
decides the collapse depth: full shelter (max 9–10) zeroes the wild
stream (91403: 0 opps, 0 fights over 26 days; 91407: 0/0 over 6 days);
partial shelter (max 6 on 91406) reduces it but does not zero it
(24 wild fights over 86 episode days, across 12 types). 91405 is the
honest borderline: opps fall 63% (1.27 → 0.47/d) and fights fall 80%
(1.1 → 0.22/d), but the preregistered <25% opps bar is not met, so it
is classified COLLAPSE-ABSENT — the fall is substantial, the bar is
strict, and both facts are reported rather than re-scored.

## Hypotheses: falsified and confirmed (in prereg order)

- **(a) Spool-removal cascade — FALSIFIED for muster-episode
  collapses.** During 91403/91407 episodes wild fights go to ZERO
  across every type, not just Spool; during 91406 they fall 81%
  across 12 types (nightcourt, hushwolf, influencer, understudy,
  warranty_caller, congregation, callback, nightlight_catfish,
  strike, eulogy, suburb, heckler — no Spool among them). A
  Spool-removal story cannot suppress non-Spool meetings; shelter
  filtering every villager regardless of beast type can and does.
- **(b) RNG reshuffle alone — FALSIFIED for the muster pattern,
  CONFIRMED as trigger on 91408.** The muster episodes on 91403/05/
  06/07 are byte-identical with and without the rule — an RNG effect
  cannot be present identically on both sides of a rule swap. On
  91408, RNG shift is the trigger (divergence day 47 after first
  attempt day 46) but the effect is anti-acceleration, and the
  downstream cause of no wave 4 is the standing total (95 < t4),
  not the reshuffle alone.
- **(c) Survival-length artifact — FALSIFIED.** Collapse windows
  fall inside the shared survival window on every muster seed
  (episodes start days 65/95/123/175 within runs of 90/180/159/181
  days; pre/during windows are same-run comparisons, not tail
  artifacts). The 91407 episode is short (6 days, at run end) but
  its 30-day pre-window is full and the fall is total (1.3 → 0).

## Sense-reads (meaning, not counts)

- **91408 lever attempts (the band's only rule firings):** day 46 —
  "Atuq closes in and strikes with the kitchen knife for 12 (27 left)
  — but Chorus Line breaks away all the same." Day 54 — "Elif closes
  in and strikes with the machete for 25 (2 left) — but Chorus Line
  breaks away all the same." Day 59 — "Luis does not let it slip
  away — they close in and strike with the hatchet for 14 — Chorus
  Line falls. (Contact finish)" All three are honest on weapon,
  damage, remainder, and flight — the same honesty fix the 0615Z
  reads showed, now with kitchen tools, not just crowbars and
  spears. The day-54 line is the painful one: 2 HP left, beast gone.
  A reader feels the near-miss; the rule does not fudge it.
- **91403 muster episode (the band's cleanest shelter case):** the
  nearest narrative record is thin, and that thinness is itself the
  finding. `sayLines` for days 60–70 are EMPTY — no wave-3-named line
  fires in the episode window, and the MUSTER beat itself (which
  names a wave-4 threat noun) is filtered out by the recorder's
  wave-3-only say-line filter, exactly the 0615Z gap, now confirmed
  on a second episode. What the record does show is coherent: last
  wild fights day 63, an expedition evade day 65, then nothing —
  the stream stops the day after a wave-4 Reunion spawns 1 tile from
  Haven and 9 villagers shelter. State-level, that reads as people
  hiding from a real, proximate threat, not a freeze: the trigger is
  named (Reunion, 1 tile away), the response is immediate (next
  day), and the depth matches the threat (9 sheltered while it
  paces). But the human texture — fear talk, doubling up, hunters
  standing down, the words the MUSTER beat itself uses in code —
  is NOT in this band's record to judge, and this arm does not
  pretend otherwise. Dialogue texture during shelter is UNJUDGEABLE
  from these corpora; it is a recorder gap, not evidence of robotic
  behavior. (Partial shelter on 91406 — max 6, fights continuing at
  a reduced rate — is the counter-shape: the village does not
  always hide everyone, and the stream does not always zero.)

## Reproduction protocol (as run)

- Baseline leg: fieldFights.js swapped to the pre-rule blob (commit
  `759dd7263^`), verified byte-identical to the `1a6dce59d` version
  (`cmp`) and differing from HEAD by the rule block only (105
  deletions + 2 restored lines). Restored from a BACKUP COPY (never
  `git checkout`); `git diff HEAD` verified empty before the lever
  leg and after restore. Lever leg on the restored HEAD file.
- Both legs: `scripts/s87135traj-sweep.js` UNMODIFIED, env
  `FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 CONTACTFINISH=1 S87135TRAJ=1`, `DAYS=180`, seeds
  91401–91408. All 16 corpora: recorderErrs 0, trajErrs 0, overflow
  empty. 7/8 lever legs byte-identical to baseline; 91408 differs.
- Calibration: the analyzer reproduces the 0615Z 87135 verdict under
  this arm's definitions (ACCEL, kill +48d, spawn 88 vs never, muster
  89–163 max 10, collapse present, peak global day 125 vs end
  regional) — see the proof test (case 9). Definitional delta carried
  from the prereg: post-87 lever opps 8 / wild fights 5 under this
  arm's definitions vs 5/4 in the 0615Z text; baseline 192/95 matches
  exactly under both.

## Metric review (for the NEXT run, not this verdict)

- The collapse bar (<25% of pre-episode opps/day) is strict: 91405
  falls 63% on opps and 80% on fights yet classifies ABSENT. A future
  band may want a graded collapse scale (total / severe / partial)
  instead of a binary bar — proposed for the next run, not applied
  here.
- The contactfinish say-line filter (wave-3 names only) misses the
  muster beat on a second episode. A future trajectory arm should
  capture MUSTER / ALL-CLEAR lines regardless of monster wave, or
  the sense check for shelter will stay unjudgeable.
- The rule-engagement question is now the sharper blank: on 7/8
  seeds the rule never fires, and the band cannot say whether that
  is correct narrowness (contact finishes SHOULD be rare) or a
  missed window (finishable meetings that never become contact).
  A future arm should instrument CONTACT-meeting eligibility
  itself (meeting shape × instrument × HP at contact) rather than
  counting attempts alone.
- Peak-vs-end rank: 0/8 understatement here does not overturn the
  0615Z finding — it bounds it. Understatement happens when a
  trajectory peaks then falls; this band's villages mostly hold
  their peak to the end (or never peak high). Report both, always.

## Infrastructure notes (loud)

- **EPERM write flap, three windows this run.** (1) `/tmp` writes
  EPERM from ~07:32, blocking `safe-commit.sh` (hardcoded
  `/tmp/idx-safecommit-*` index) on 4 attempts; the prereg commit
  was made instead as a manual private-index commit replicating
  safe-commit.sh line-for-line except the index path (workspace
  location, deleted after): read-tree from HEAD, stage exactly the
  listed paths via hash-object + update-index --cacheinfo, src
  mass-deletion guard 0, HEAD-stability check, commit-tree +
  update-ref with old-value guard — commit `3c2feb37a`, verified
  (status clean, diff empty, worktree hashes match HEAD blobs).
  (2) The flap spread to workspace evidence writes ~07:43–07:56 and
  again ~07:58–08:22, stalling the lever sweep's resilient writer
  (s91402, then s91404; retries to attempt 130+) and zeroing a
  redirected analyzer output. The sweep was killed once (first
  window, s91402 in-memory result lost, recomputed on resume) and
  left to ride out the second window (it landed all remaining seeds
  when the window cleared). No corpus was silently truncated: every
  committed corpus is verified parseable with recorderErrs 0, and
  the analysis JSON is written only with size + re-parse
  verification. (3) The main-index clobber struck the manual commit
  (3 files shown staged-deleted after a correct commit); repaired
  with `git update-index --add --cacheinfo` from HEAD blobs, same as
  the loop's standing repair, verified clean before continuing.
- The 0-byte `trajband-a-analysis.json` left by the flapped
  redirect is regenerated with verification before commit; if it
  still verifies 0-byte at commit time, the coordinator should
  regenerate it from the corpora with
  `scripts/trajband-a-analyze.js --baseline-dir … --lever-dir …`
  (stdout works even when file writes flap).
- No src/js change, no policy change to the judged stack, no merge,
  no push, no version bump, no live verification. Committed on
  branch sim-trajband-a; coordinator merges --ff-only.

## What this arm does NOT claim

- No trajectory-safety verdict for the contact-finish rule beyond
  this 8-seed band; no claim that a long shelter is a bug (shelter
  is working-as-designed; whether its duration tuning is intended
  is a Steve design question).
- No standing decomposition for 91408 (95 vs 199 by component is
  unmeasured); no claim about why other seeds' wave-3 meetings are
  not contact-shaped (eligibility instrumentation is the next
  arm's blank, above).
