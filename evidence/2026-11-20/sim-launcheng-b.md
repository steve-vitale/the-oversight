# sim-launcheng-b — the launch engine, DIAG (finding #2605)

**Arm:** sim-launcheng-b · **Loop B run:**
fleshout-loop-b-20261121T0030Z · **Axis:** winnability chain
**Branch:** `sim-launcheng-b` · **Base:** master `faa5d65a9`
**Band:** 106241–106248 (8 seeds, existing strikeband4 corpora —
no new sims) · **Horizon:** 150d, death-aware, competent policy
**Verdict: DIAG-NO-GO** — on the completeness bar only (10 of 268
instance-days unclassified, 3.7%). The binding gate, the launch
accounting, and the instrument all pass. The substantive
diagnosis is complete; the miss is ten days on which a plan
holder was never assessed at all, not ten rejected bids.

## 0. What changed since the freeze (read this first)

The prereg froze a per-DAWN taxonomy: a holder was assumed to
be scored at most once a day, at dawn. The first judged run
returned 89 `unknown-not-scored` dawns and exposed that premise
as false. Scoring happens at any of the 4 day-parts, and the
pick phase drifts (prereg CORRECTION 2026-11-21, appended to
`sim-launcheng-b-prereg.md` — the frozen body is untouched, the
correction supersedes the unit and two totals):

- A `party_wait` pick sets an indoor Haven chore with a clock of
  2–4 parts (3–5 when the core pick was a visit). The chore
  finishes after that many day-parts, and the holder picks again
  at the next part where the chore is seen finished — at dawn
  only when the finish lands exactly on a dawn boundary. A pick
  made today also blocks a same-day re-pick while its commitment
  is fresh. So the re-pick lands mid-day about as often as at
  dawn, and a "not-scored dawn" usually means "scored at
  mid-day instead".
- Scored-dawn total 143 → **141**: two pool rows were
  retarget-boundary dawns (the dawn pick belonged to the
  predecessor instance; the plan retargeted mid-day).
- The unit is now the **instance-day**: 268 days across the 19
  not-bid instances. The DIAG-GO bar itself (0 unknown) is
  UNCHANGED — this correction fixes the instrument, it does not
  relax the bar.

## 1. The judged numbers

### 1.1 Classification completeness (bar 1 — FAILS, 10 unknown)

268 instance-days across the 19 candidate-not-bid instances:

| | Days | Share |
| --- | --- | --- |
| Assessed (a score row exists that day, any part) | 223 | 83% |
| — of which at dawn (part 0) | 141 | |
| — of which mid-day only (part 1–3) | 82 | |
| Zero-row (no score row all day) | 45 | 17% |
| Unknown (`unknown-no-signal`) | 10 | 3.7% |

**Assessed days — the reason, all 223 of them:**

| Reason | Days |
| --- | --- |
| `party-no-companion` (stage `party`, `party_wait` picked, `findCompanion` found nobody) | **223** |
| every other reason | 0 |

226 score rows back those 223 days (3 days have two mid-day
rows). Every single assessed day, dawn or mid-day, ends the
same way: the holder waits for a companion who never exists.

**Zero-row days — the 45, classified:**

| Reason | Days | What it means |
| --- | --- | --- |
| `seed-day` | 12 | the plan was seeded by a fight mid-day; no dawn pick could exist before it |
| `holder-scholar` | 7 | the holder had become the player character (the scholar) — the scholar never runs the villager brain, so no score row can exist |
| `retarget-boundary` | 4 | the dawn pick that day belonged to the predecessor instance (the plan retargeted mid-day) |
| `holder-away` | 4 | a pool member row that day reads `away: true` — the dawn re-pick requires the holder not-away |
| `holder-off-haven` | 4 | census node one step from Haven — away-return in progress |
| `field-encounter-day` | 3 | the holder fought (or allied in) a wave-4/5 field encounter that day — the fight ate their parts |
| `phase-edge` | 1 | the previous pick was at part 3 with a visit core (the only no-skip shape whose chore finishes on the last part of the day, so no re-pick fires that day; the next pick lands at the next dawn, as observed) |
| `unknown-no-signal` | **10** | at Haven, alive, not away at dawn, not the scholar, no encounter, no phase-edge shape — yet the phase model predicts a pick |

The 10 unknown days: 106241 `visjoin_91` d97, d103; 106243
`visjoin_116` d122; 106246 `visjoin_125` (strike) d129, d131,
d135; 106246 `visjoin_96` (editor) d146; 106247 `david_kim`
(eulogy) d72; 106247 `fatima_hassan` (reunion) d98; 106247
`app_mgpspki2526` (spoiler) d127. The only remaining mechanism
in code is skipped day-parts (a mid-day conversation engaging
the holder, or a mid-day step away from Haven and back) —
neither is sampled by the strikeband4 recorder. Closing them
needs a per-part holder-state recorder (objective kind/state/
clock, away flag, engaged flag, node) on a fresh band; that is
the next run's instrument item (see §7). A probe cannot
retroactively classify these 10 days — events re-roll — so no
probe was run in this stage.

The 7 churned instances are fully classified (0 unknown):
their zero-row days are `seed-day` 5, `holder-away` 25,
`holder-off-haven` 8, `field-encounter-day` 3,
`holder-on-expedition` 1, `holder-dead` 2, `plan-not-in-census` 1.

### 1.2 The binding gate (bar 2 — PASSES)

**`party-no-companion`: 223 of 223 assessed days (100%).**
The pool is empty on every single dawn: eligible companions
0 of 141 dawns. First-fail counts over those dawns
(`selfOrScholar` 282 is the holder + scholar themselves):

| First fail | Count |
| --- | --- |
| `notRanger` (profile is forager/homebody, not wanderer/explorer) | 446 |
| `away` (ranger, but out of Haven) | 250 |
| `dead` / `trustLow` / `notAtHaven` / `engaged` / `onExped` | 0 each |

Roster census over all 216 pool dawns (1,072 member-slots):
forager 766, homebody 207, wanderer 44, explorer 55.
Rangers (wanderer + explorer) are 99 slots — 9.2% of the
roster — and 79 of those 99 are away at any dawn (80%).
Rangers at home: 20 (wanderer 16, explorer 4). Holders
themselves are foragers 207 times out of 216. So the typical
not-bid dawn is a forager holder waiting at Haven while every
ranger is either out ranging or does not exist, and every
forager/homebody at home is disqualified by profile alone.
Trust never binds (0 `trustLow`); nobody is engaged or on an
expedition at dawn; death never binds.

In plain words: **a villager with a wave-4 plan waits for a
hunting partner, and the game only counts wanderers and
explorers as partners. Almost nobody is a wanderer or
explorer, and the few who are spend four days in five away
from Haven. So the wait never ends.** The plan holder then
re-picks the same wait the next day — and the next — for as
long as the plan lives (up to 43 days in this band).

### 1.3 Launch accounting, §7.3 decision (bar 3 — PASSES)

Counting rule (frozen): a launch is any `v4departs` row with
result `launch` whose target's wave in `monsters.json` is ≥ 4,
regardless of `targetWave`. **22 wave-4-target launches: 7
counted + 15 uncounted**, reconciling to strikeband4 §2 (15).
Realness: all 22 have a same-day `startExpedition` call for
the holder (0 `launch-no-start-call` — no phantom launches).
Copy-link: all 15 uncounted launches link to an earlier launch
where the holder rode as a companion/party member against the
same target (0 `uncounted-no-copy-link`). The copy mechanism
is the companion plan-copy path (`winPlanDepart` /
`vbrainExecuteDepart` copy `target` but never `needWave`).
First fights after a launch: 3.

### 1.4 Instrument validity (bar 4 — PASSES)

Proof test `scripts/test-launcheng-b.js` 44/44 green;
analyzer selftest 39/39 green; the corrected run reproduces
every frozen total (31 instances, 19 not-bid, 7 churned, 22
wave-4-target launches, 15 uncounted, 141 scored dawns, 268
instance-days, 223 assessed days, 45 zero-row days, 10
unknown, 0 instrument errors on 8/8 files, clean substrate
on all 8).

## 2. Wall numbers (recomputed from the corpora, not copied)

| | |
| --- | --- |
| Wins | 0 |
| National by scaleRank ≥ 2 | 0 / 8 |
| National by standing ≥ 200 | 3 / 8 |
| Table seats | 0 |
| Wave 4 reached | 8 / 8 |
| Wave 5 reached | 3 / 8 |
| Median survival | 142.5 days |
| Survived (150d) | 3 / 8 |
| Total deaths | 758 |
| Starvation deaths | 3 |
| Standing-199 stall | 4 / 8 |

Per seed: 106241 — 137d, village-lost, standing 199, 2
not-bid, 0 churn, 0 launches; 106242 — 151d, survived,
standing 199, 1 not-bid, 1 churn, 5 wave-4-target launches;
106243 — 148d, village-lost, standing 705, 1 not-bid, 0
churn, 0 launches; 106244 — 136d, village-lost, standing
199, 0 not-bid, 0 churn, 6 launches, 1 first fight; 106245
— 127d, village-lost, standing 150, 1 not-bid, 1 churn, 2
launches, 1 first fight; 106246 — 150d, survived, standing
465, 7 not-bid, 0 churn, 9 launches, 1 first fight; 106247
— 150d, survived, standing 570, 7 not-bid, 5 churn, 0
launches; 106248 — 105d, village-lost, standing 199, 0
instances at all.

## 3. Churn — the 7 plan-churned-before-dawn instances

Close kinds: retargeted 4, holder-died 3. Every one carries
its closing evidence (death row, or the closing seed row).

Repeat-target groups (a vid+target launched ≥ 2× with no
meeting in 21 days): 7 groups. The stale-node story is
real and visible in the track rows — grace_obi vs the
algorithm (seed 106242) is the cleanest case (see §4).

| Holder → target | Launches | Meetings in 21d | First fight |
| --- | --- | --- | --- |
| grace_obi → algorithm (106242) | d85, d90, d94 (all counted, party 3/3/2) | 0 | — |
| amina_diallo → algorithm (106242) | d90, d94 (both uncounted, party 2/1) | 0 | — |
| gen_cxyrrf2 → eulogy (106244) | d111, d115 (uncounted) | 3 | d126 |
| sofia_chen → eulogy (106244) | d111, d116, d119 (uncounted) | 3 | d126 |
| gen_i1y66wl → congregation (106246) | d56, d65 (counted) | 0 | — |
| gen_4e5uy98 → congregation (106246) | d61, d70, d75 (uncounted) | 1 | d78 |
| daniyar_askarov → congregation (106246) | d63, d70, d77, d85 (uncounted) | 1 | d78 |

Note the copy-link shape in the table: the uncounted
follow-on launches are companions re-launching the same
target after riding the first launch — the plan-copy path
at work, not new decisions. (The eulogy groups do
eventually meet their target — first fight d126, 15 days
after the last launch — while the algorithm and
congregation groups never meet inside the window.)

## 4. Sense-test — reading the transcripts

### 4.1 grace_obi vs the algorithm, d85–d94 (seed 106242)

Grace Obi fled the algorithm on d78 and has carried the
plan since. She waits at Haven d79–d84, healing (hp 41 →
81), then launches d85 with Maya Singh and Amina Diallo.
The track rows tell the rest plainly: for ten days
(d85–d94) her party sits on expedition at the same tile
(3,5) — the tile of a days-old *sighting* — while the
algorithm drifts away from it (near distance 2 → 4, near
count 1 → 0, alive throughout). Nobody in the party moves
to a fresh tile. Her health falls 84 → 21 across the first
three days of the hunt, recovers to the low 30s, and the
party shrinks: d94 it is only [Amina Diallo]; d95 the
party is empty, the plan has fallen back to stage `party`
with a new target (strike), and Amina is dead — killed d95
by Big-Eyes. Grace herself comes home d98 at 1 hp and dies
d100 to a monster.

What this means: the launch is real — three people did go
out, three times — but the hunt has no live target. The
party navigates to a stale last-known tile and waits there
while the monster wanders off. The "churn" is not
indecision: it is three genuine expeditions to a dead
address, each ending in a return that re-seeds the same
wait. The damage question (#2605) cannot be answered from
fights that never happen; the blocker is upstream of the
fight, in the launch and in the targeting.

The village's own voice that run keeps the scale honest.
Day 12, a door defense: *"Eamon, Esther, Miko, Rafael and
Amina met them at the door — 4 put down, 1 driven off.
Eamon, Esther, Miko, Amina are hurt."* Day 31, the System
announces the Mirror Draft; the same day Amina and Fatima
each put down a Redactor on camera and are named veterans.
The village is fighting and winning small wars the whole
time the wave-4 plan waits for a partner who never comes.

### 4.2 desmond_clarke's retarget chain (seed 106247)

Desmond Clarke, an explorer, carries a wave-4 plan for
forty days (d106–d146) and never launches once. His chain
is four instances: eulogy d106→107, eulogy d109→114,
timeslot d114→117, eulogy d117→146 — each closed by a new
flee re-seeding the plan, and the last by his death d146
("a wound that wouldn't close"). He is away 22 of the 29
days of his last instance and never once at Haven long
enough to be assessed at dawn: his zero-row days are
`holder-away` 22, `holder-off-haven` 5, `field-encounter-day`
1, `holder-dead` 1. He is the mirror image of the waiting
holders: not stuck at Haven waiting, but never *at* Haven
to wait — an explorer ranging while the plan needs a
partner at home. (Fidelity note: the closing seed row the
analyzer attaches to his first instance is the d114
timeslot seed — the next wave-4+ seed — while the immediate
retarget at d107 was to ad_break, a wave-3 target outside
the analyzer's wave-4+ filter. The `retargeted` verdict
itself comes from the frozen classifier, not from that row.)

## 5. Metric review

- **What the metric measured:** classification completeness
  over instance-days, plus the bid-gate distribution. It
  measured what it claimed to: every assessed day carries a
  reason, and the reason is unanimous.
- **What changed mid-run:** the unit (dawn → instance-day)
  and two totals (143 → 141 scored dawns; 9 → 10 unknown
  after the analyzer, not the hand count, settled the
  boundary days). Both changes are recorded as a dated
  prereg correction, with the reasoning and the two boundary
  days named — not a silent edit, and not a relaxation of
  the bar. The bar (0 unknown) was not moved.
- **What the metric cannot see:** the 10 unknown days need
  per-part holder state the recorder never captured. The
  phase-edge rule is a consistency argument (the R() draw
  is unrecorded), flagged as such in the prereg. Target
  matching is by type, not instance (inherited).
- **What would overturn this:** a band where assessed days
  split across gates (gear-hold, veteran-guard, silent
  fall-throughs) instead of unanimity — none did here. A
  band where the pool is non-empty on some dawns would
  change the binding gate's shape, not its name.
- **Verdict honesty:** DIAG-NO-GO is the correct verdict
  under the frozen bar. It is a narrow miss on an instrument
  item (10 non-assessment days), not a failure of the
  diagnosis: the answer to "why are wave-4+ plan candidates
  never bid" is established on 223/223 assessed days.

## 6. The named next lever (diag-only — no build in this stage)

**The lever:** let a trusted villager who is actually at
Haven stand as a wave-4+ hunting companion, not only
wanderers/explorers — or, equivalently, give the plan
holder a way to call a ranger home for the hunt. The
binding constraint is the companion profile gate in
`findCompanion` (`villager-brain.js`): profile must be
wanderer/explorer, plus same-node-as-Haven, trust ≥ 15,
not away, not engaged, not on expedition. On this band
that admits 20 ranger-slots at home against 446
not-ranger first-fails. The natural shape is
trust-gated (the trust bar already exists and never binds
here — 0 `trustLow`) and Haven-gated (the partner must be
physically present, as today), with the profile gate
relaxed for wave-4+ plans only: a forager/homebody the
holder trusts, standing at Haven, is a real hunting
partner in the fiction — villagers already join nearby
fights regardless of profile. A second, smaller lever in
the same family: re-target the hunt when the last-known
tile goes stale (the grace_obi track shows near-distance
drifting 2 → 4 while the party waits on the old tile) —
but the companion gate binds first; retargeting helps
only after a party can form.

**Why no build here:** the lever lives in
`villager-brain.js` (`findCompanion` / `winPlanCands`) and
plausibly `win-plan.js` — both held by the sibling arms
(sim-pinquaddoor-b touches `villager-brain.js`,
`win-plan.js`, `villager-agency.js`, `party-wiring.js`;
sim-reseedexpiry-b touches `villager-brain.js`,
`win-plan.js`). Per the overlap guard, this arm delivers
diag-only and names the lever for the next run. A second
frozen prereg is required before any build (before/after
on identical seeds, guardrail: survival/starvation vs
control).

**The instrument item for the next run:** a per-part
holder-state recorder for plan holders (objective
kind/state/clock, `v.away`, `isEngaged`, node, scholar
flag) on a fresh band, to close the 10 `unknown-no-signal`
days and to confirm the skipped-parts mechanism (mid-day
engagement) behind them.

## 7. Files

- Prereg (+ CORRECTION 2026-11-21):
  `evidence/2026-11-20/sim-launcheng-b-prereg.md`
- Instrument: `scripts/analyze-launcheng-b.js`,
  `scripts/test-launcheng-b.js` (proof 44/44, selftest 39/39)
- Analysis:
  `evidence/2026-11-20/launcheng-b-analysis.json`
- Evidence: `evidence/2026-11-20/sim-launcheng-b.md` (this file)
- Corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- `src/` diff: 0 lines in this stage (DIAG, analyzer only).

## 8. Telemetry check

Attempted with the absolute baseline path
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json`:

```
node scripts/telemetry-check.js --baseline <scale-wall.json> \
  --current 'evidence/2026-11-20/perseed-strikeband4-b-106241-106248/*.json' \
  --metrics wins,national,table,exiled
```

Result: **exit 2 — the designed recorder-corpus refusal**
("refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not
runs"). No comparison was performed, no LOUD line fired, and
the baseline was NOT rolled (no `--update-baseline`). This is
the expected outcome for a recorder corpus; the wall numbers
in §2 are the comparison surface instead.
