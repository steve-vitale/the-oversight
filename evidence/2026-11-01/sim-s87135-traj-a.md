# sim-s87135-traj-a — the s87135 trajectory mechanism (DIAG ONLY, zero src/js)

Run fleshout-loop-a-20261101T0615Z, axis scale-onramp. Seed 87135 only.
Preregistration: `evidence/2026-11-01/sim-s87135-traj-a-prereg.md` (written
before any verdict). Proof: `scripts/test-s87135traj-a.js` — **27/27 passed**.
Corpora: `evidence/2026-11-01/s87135traj-{baseline,lever}-v{2,3}/leadfeast/s87135.json`
(v3 judged; v2 = determinism chain). Analyzer:
`scripts/s87135traj-analyze.js` → `s87135traj-analysis-v3.json`.

## Verdict: DIAG-GO (all three preregistered bars met)

1. Divergence day identified: **day 85**, first differing field = world-monster
   roster only (the d85 Spool at 7 HP on lever vs 17 HP on baseline).
2. Every reproduced baseline wave-3 row classified: **47 = 12 converted-beast
   lineage + 35 other beast + 0 other cause** (see table below).
3. Mechanism statement below, with **four alternatives falsified** on stated
   evidence ((a), (b), (c), (e)) and (d)/(f) confirmed as links in the chain.

## The mechanism, in plain words

The contact-finish rule does not reroute this village by removing Spool
meetings. It reroutes it by **handing the village the key to wave 4, 48 days
early — and wave 4 makes the whole village hide indoors for weeks.**

The chain, each link measured:

1. **d85 — the wounded Spool.** Sigrun meets a 17-HP Spool and, under the rule,
   strikes with her crowbar for 10 (7 left; the beast breaks away). On the
   baseline leg the same meeting ends with the beast fleeing untouched and
   the log lying about a bow ("Sigrun drove Spool off with the bow").
   The d85 snapshot differs from baseline in exactly one field: that Spool's
   HP. The strike also spends one seeded roll the baseline leg never spends.
2. **d87 — the kill that counts.** Francisco meets a 7-HP Spool and kills it
   with the fire-hardened spear (16 damage). Ledger: wave-3 points 0→1, war
   points 0→1, kill log gains its **first wave-3+ kill of the run**. On the
   baseline leg, the village has no wave-3 kill at all until day 135 — and
   there the first wave-3 kill is also a Spool, and wave 4 unlocks the same
   day. The pattern repeats exactly: **the first wave-3 kill is the wave-4
   key** (the readiness veterans bar: 1 living villager with a wave-3+ kill;
   see docs/MONSTER-WAVES.md, combat-readiness gates). The rule manufactures
   that key from a beast that would otherwise have fled.
3. **d88 — wave 4 opens.** The hash unlock level flips 3→4 on lever day 88
   (baseline: day 135). Wave-4 monsters enter the spawn pool at the 60%
   newest rate. An Algorithm (wave 4, 1000 HP) spawns at (3,3) — Chebyshev
   distance 1 from Haven (4,4), inside the muster radius of 2.
4. **d89 — the village musters.** The game-side auto-muster
   (src/js/shelter.js, shelterMusterCheck, daily from progDaily) fires:
   all 10 non-scholar villagers shelter behind the barricaded hall door.
   First sheltered snapshot day 89; sheltered count stays 10 through day 120,
   easing to 6 by day 130 and 2 by day 150 as threats wander off (hysteresis:
   muster at radius 2, stand down only past radius 3). Baseline never
   shelters once in 144 days.
5. **d89 on — the meeting stream dies.** Sheltered villagers are filtered out
   of villagerMonsterTick (the wild-encounter router). Measured at the tick:
   baseline post-87 wild opportunities 192 → 95 wild fights; lever post-87
   wild opportunities **5** → 4 wild fights. The tick itself is healthy on
   lever (0.80 fights per opportunity vs 0.50 baseline; pre-88 rates match
   at ~0.57–0.59) — there is simply nobody out on the treeline to be jumped.
   On baseline wave-3 days after day 88, the lever village's fight list is
   almost always empty (e.g. d89, d90, d93, d95, d97, d103, d106, d110, d112,
   d115: no fights at all).
6. **The bill.** The sheltered village lives longer (163d vs 144d, both
   village-lost) because nobody walks the treeline — but it stops producing
   and stops scaling: it ends at regional where baseline ends at national.
   Correction to the confirm's framing: "no national on lever" is an
   **end-state** measure only. Mid-run the lever village peaks HIGHER than
   baseline — daily rank hits **global on day 125** (baseline: national) —
   then falls back to regional by day 163 as the long shelter drags on.
   Sheltered villagers work nothing and still eat; that is the documented
   shelter cost (shelter.js header), playing out over ~60 days.

## Key counts

| | Baseline (rule OFF) | Lever (rule ON) |
| --- | --- | --- |
| National (end) / table / won | 1 / 0 / 0 | 0 / 0 / 0 |
| Peak daily rank | national | **global (d125)** |
| Survival | 144d, village-lost | 163d, village-lost |
| Field fights | 265 | 168 |
| Wave-3 rows | 47 | 6 |
| Wave-4 unlock day | 135 | **88** |
| First wave-3+ kill | d135, Spool | d87, Spool |
| Post-87 wild opportunities → wild fights | 192 → 95 | **5 → 4** |
| Sheltered villagers (peak) | 0 | 10 (d89–d120) |
| Total kills | 36 | 47 |

### Baseline wave-3 classification (47 rows, all classified)

- Converted-beast lineage (Spool, day ≥ 85): **12** — type-level by necessity:
  world entities carry no stable instance id, so lineage = Spool type at/after
  the conversions. (Spool before day 85: 3 rows, counted under other beast.)
- Other beast: **35** = Callback 11 + Focus Group 9 + Redactor 9 + Chorus
  Line 3 + pre-85 Spool 3.
- Other cause: **0**. No row needs a per-row cause: the shelter mechanism
  explains all 35 other-beast disappearances, since shelter filters every
  wild meeting regardless of beast type.
- Post-87 split (the collapse window): baseline 43 wave-3 rows (all `wild`
  caller) vs lever 1 wave-3 row (expedition caller) plus the d87 kill itself.
  Total fights post-87: baseline 109 vs lever 17 — the collapse is across
  ALL waves (wave-1 fights 46→11, wave-2 20→4), not a wave-3-only effect.

## Hypotheses: falsified and confirmed (in prereg order)

- **(a) Killed-entity removal cascade — FALSIFIED as the main mechanism.**
  Spool lineage is only 12/47 (26%) of baseline wave-3 rows; 32 other-beast
  post-85 rows vanish too, and the lever roaming population is not depleted
  (25 monsters day 85 → 34 by day 144; spawns lever 56 vs baseline 49).
  The kill matters through the ledger/gate, not through removing Spool
  meetings.
- **(b) Location divergence — FALSIFIED for the scholar tile; reframed for
  villagers.** Scholar tile is identical on every shared-window day (144
  snapshots, zero tile diffs). Villager node positions DO diverge from day
  87 (RNG shift), but that does not explain the collapse: lever's
  day-boundary monster-tile overlap is often HIGHER than baseline's, yet
  tick-time opportunities collapse — because the tick filters sheltered
  villagers, and day-boundary overlap counts sheltered villagers sitting at
  Haven regardless. Opportunity, not position, is the variable that moves.
- **(c) Scholar/roster change — FALSIFIED as the driver.** Roster identical
  until day 119 (late, downstream); scholar HP/kcal identical until the
  day-87 kill aftermath. No roster change at or near the conversions
  explains a day-89 collapse.
- **(d) Gate-timing shift — CONFIRMED as the link.** Ledger p3 0→1 and war
  points 0→1 on day 87; unlock level flips 3→4 on day 88 (baseline: day 135,
  on its own first wave-3 kill). The wave-3 rung itself never differs
  (already unlocked on both legs) — the shifted gate is wave 4, not wave 3.
- **(e) Survival-length calendar shift — FALSIFIED.** Trajectories diverge
  during the shared window (day 85), and the wave-3 collapse lands days
  89+, well before baseline's day-144 end. The extra 19 lever days are a
  consequence of sheltering, not the cause of the divergence.
- **(f) RNG-stream shift — CONFIRMED as the trigger at draw level, but NOT
  sufficient alone.** The d85 strike spends a seeded roll baseline never
  spends; the next fight-level difference is day 86 (baseline's rut_king
  kill, which lever lacks) and the first spawn difference is day 87
  (Callback vs Terms of Service). But an RNG reshuffle cannot by itself
  suppress fights 8× over 76 days — the per-opportunity fight rate stays
  normal on lever. RNG shift is the spark; kill → gate → muster → shelter
  is the fire.

## Sense-reads (meaning, not counts)

- **Conversion day, lever d85 (Sigrun):** "Sigrun closes in and strikes with
  the crowbar for 10 (7 left) — but Spool breaks away all the same." Honest
  on every element: the weapon held, the damage, the remainder, the flight.
  The same meeting on baseline reads "Sigrun drove Spool off with the bow"
  with 0 damage dealt — the old lie, now with a crowbar-armed fighter
  credited with a bow. The rule's honesty fix is visible in the transcript,
  not just the counters.
- **Conversion day, lever d87 (Francisco):** "Francisco does not let it slip
  away — they close in and strike with the fire-hardened spear for 16 —
  Spool falls. (Contact finish)" A real single strike, the held weapon
  named, the beast already at 7 HP. It reads as a mercy blow, and it is
  exactly the blow that later locks the village indoors — a small honest
  kill with a large, legible consequence. (The recorder's fighter id is
  gen_qvswlgr; the log names the person Francisco — id/name mapping, not a
  contradiction.)
- **Divergence day, lever d88–89 (muster):** the muster beat itself was NOT
  captured — the contactfinish recorder's say-line filter keeps only
  wave-3-named lines, and the muster names a wave-4 monster. What the
  transcript record does show is the state it leaves: 10 villagers
  sheltered from day 89, an Algorithm pacing 1 tile from Haven, and empty
  fight lists on days the baseline village fought wave-3 beasts. The
  mechanism is proven by state + code, not by a quoted beat; the recorder
  gap is noted below so a future arm captures the muster line itself.

## Reproduction protocol (as run, three instrument versions)

- Baseline leg: fieldFights.js swapped to the pre-rule blob (commit
  759dd7263^), verified byte-identical to the 1a6dce59d version used in the
  confirm (`cmp`) and differing from HEAD by the rule block only (105
  deletions + 2 restored old lines). Restored from a BACKUP COPY (never
  `git checkout`); `git diff HEAD` verified empty before the lever leg.
- Both legs reproduce the confirm headlines exactly: baseline national 1 /
  144d / 265 fights / 47 wave-3 rows / 36 kills; lever national 0 / 163d /
  168 fights / 6 wave-3 rows / 47 kills; hashes identical to the confirm
  baseline corpus on the baseline leg.
- Instrument versions: v1 (daily snapshots) → v2 (+ villager node positions,
  monster-tile overlap, haven, outdoor crew) → v3 (+ tick-opportunity
  pre-pass, sheltered/rest lists). Each version re-ran BOTH legs.
- Determinism gate, as preregistered, on judged trajectory content: hashes
  identical across v1/v2/v3 on both legs; field-fight rows identical
  excluding log text (and, on v3, the diagnostic `stack` string, which
  differs only by the tick-wrapper frame — an instrument artifact, not a
  trajectory change); spawns identical. Literal whole-file byte identity
  does NOT hold across instrument versions (v2 added snapshot fields; v3
  stack strings carry the wrapper frame) — the trajectory content is
  identical and the instrument change is stated here, not hidden.

## What this arm does NOT claim

- No trajectory-safety verdict for the contact-finish rule in general: one
  seed, one stack. What it establishes is the MECHANISM CLASS a safety claim
  must reckon with: a finish kill can complete a readiness gate early, and
  an early wave unlock can trigger a shelter episode that suppresses wild
  content for weeks. Any future trajectory-safety claim needs a band-level
  check for early-gate acceleration + muster episodes, not just bar passes.
- No standing-arithmetic decomposition: whether the day-87 kill tipped
  standing over t4 via blood, or standing was already over t4 with the
  veterans bar as the sole blocker, is not separately instrumented. The
  kill is the trigger either way — it is the first wave-3+ kill on both
  legs, and wave 4 releases with it on both legs (d87→d88 lever,
  d135→d135 baseline).
- No src/js change, no policy change to the judged stack, no merge, no
  push, no version bump, no live verification. Committed on branch
  sim-s87135-traj-a for the coordinator to merge.

## Metric review (for the NEXT run, not this verdict)

- The contactfinish recorder's say-line filter (wave-3 names only) misses
  the muster beat — the single most consequential narration in this
  trajectory. A future trajectory arm should capture MUSTER / shelter /
  ALL-CLEAR lines regardless of monster wave.
- The day-boundary snapshot overlap metric misleads when villagers shelter:
  it counts sheltered villagers at Haven as "opportunity." The tick-level
  opportunity count (this arm's v3 instrument) is the honest measure of
  wild-encounter opportunity; future arms should use it, not snapshot
  overlap.
- "National reached" as an end-state flag understates mid-run scale: the
  lever leg peaked at global (d125) and ended regional. Trajectory arms
  should report peak rank alongside end rank.

## Out-of-scope gaps (for the coordinator's findings backlog — NOT edited here)

- None new beyond the two metric-review notes above, which are instrument
  notes, not game gaps. The shelter episode itself is working-as-designed
  (auto-muster + shelter cost are documented design, shelter.js header);
  whether a 40+-day shelter from ONE early wave-4 sighting is the intended
  tuning is a design question for Steve, not a bug this arm claims.
