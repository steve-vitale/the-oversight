# SIM-TRIBPLEA — the asked-for tribute relief: renegotiation plea in hunger winters and succession grief (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-20261015T0805Z, ARM 2 of 3 (RE-DISPATCH; prior occupant blocked its assigned arm as a duplicate of sim-tribstreak and committed only evidence)
Worker tree: sim-tribhealth2 · Axis: food-economy (scale-wall lens) — distribution side
Base: tree at b5abb269 (origin/master 7d011395 at run start; siblings may have landed since — control re-measured on THIS tip in THIS sweep per #247).

## Plea design (written BEFORE any sims)

Claims sim-findings #258 (RULED 2026-10-14, Muse per Steve's delegation) and #261
(tribstreak lineage note: the next tribute arm needs a terms-change, not a fifth
early-pay timing variant). The four tribute-timing arms (tribgate, tribdisc,
tribhealth, tribstreak) asymptoted: the current-tip base belongseek discipline
already pays nearly every week in full, so timing has no room left. #258 ruled:
NO automatic relief valve on succession-grief — the new bearer inherits the
obligations with the mantle; that is the weight of the mantle, and the fiction
supports it (the System is alien and out of touch; the hierarchy is extractive).
Relief exists but must be ASKED FOR: renegotiate with the primary through the
existing renegotiation verb (real verb, trust stakes), which also gives the
succession-grief beat somewhere to go.

Canon: docs/SCALE.md — "the climb": renegotiate is the subordinate's eternal
verb, better terms earned; tribute/demands/primacy bids are the unlocks of
belonging. docs/CANON.md read first; nothing invented. The engine verb is
hierarchy.js `Game.renegotiateLink(linkId)`: the subordinate asks, score =
50 + rep.standing/2 + trust/4 ± 10 needs ≥ 55; success cuts tribute ×0.75
(floor 500); BOTH paths cost trust −5 and narrate honestly ("They didn't like
it. They respected it." / "They don't budge — and they note the push."). One
hard conversation per week (`lastTableWeek`); requires link.subordinate ===
HOME — i.e. exactly the belong road's bond. No policy on the substrate ever
calls it (verified: no renegotiateLink in scripts/policies/*) — the verb is
policy-reachable but currently unexercised.

The arm (policy-side, `scripts/policies/tribplea.js`, TRIBPLEA=1, default OFF;
ZERO src/js changes). Each day, after belongseek.daily, the plea qualifies iff
ALL hold:
1. Active Haven-subordinate link (`subordinate === 'haven'`, `!kind`) — the
   verb's own precondition.
2. In arrears: `(link.arrears|0) > 0` — nothing owed, nothing to plead.
3. Crisis OR grief: `progState().hungryStreak >= 3` (the hunger-winter crisis
   threshold — the engine's own individual-hunger signal, proven instrument
   from tribstreak G2b) OR the succession-grief window is open
   (`link.mourningUntil > day`, or `link.pendingRenegotiation` staged).
   Unreadable signal → hold (fail safe).
4. Link-stability gate (proven reusable): age ≥ 14d, trust ≥ 30.
5. The table is free this week: `link.lastTableWeek !== _week()` (calling
   while consumed would only produce the "still chewing" refusal beat — no
   ask, no spam).

The plea IS the existing verb: `Game.renegotiateLink(link.id)`. Beat honesty
(#202 — cause lines only AFTER the verb confirms): the layer says NOTHING
before the call. On success only, one beat names the qualifying context
(arrears owed + hunger streak/grief) — the engine's beat says what happened;
the layer's says why the village asked. On failure the layer stays silent —
the engine narrated the push.

WHAT THE PLEA IS NOT: it does not defer arrears (the verb has no
arrears-deferral path — deferred arrears would be a NEW engine verb; a design
question for Steve, named in metric review). It does not pay tribute. It
touches no other link.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE any sims)

- **Question**: does the asked-for plea (existing renegotiation verb, trust
  stakes) reduce starvation/hunger and the arrears ledger on the belong road?
- **Substrate**: belongseek ONLY (the plea is a Haven-subordinate verb —
  belong-only by construction). Courtship road, NO feast substrate.
- **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 180d death-aware (arrears
  accrue weekly; a successful plea needs weeks to move the ledger; 150d would
  censor late pleas). Dead villages stop simulating (+10d tail max).
- **Baseline**: OWN control in the same sweep (CONTROL BASELINE DRIFT #247 —
  never inherit, even on identical seeds). Control = TRIBPLEA unset wrapper
  (det-gate proved byte-identical to belongseek).
- **PRIMARY**: armed starvation deaths ≤ control AND armed hungryDays ≤
  control × 0.85 (the relief must actually move hunger).
- **CO-PRIMARY**: armed tribute arrears kcal posted ≤ control × 0.70 (the
  asked-for relief actually relieves; arrears kcal = Σ(owed−paid) parsed from
  the engine's 'Tribute short X/Y kcal' history notes).
- **GUARDRAILS**: primary-link trust ≥ control−10 (pleas cost trust — must
  not crater the bond); median survival ≥ control−10d; national ≥ control−2/8;
  rot per-villager-day ≤ control × 1.335 (rotcal band); no new death mode
  (n≥3 per #216).
- **MEASURABILITY**: <2 pleas across the 8-seed pilot → UNMEASURABLE = NO-GO
  (KILL), no confirm spend. A rare-event lever must fire to be judged.
- **SMOKE=1** instrument-honesty gate both sides; det-gate 8/8 both modes
  (off-vs-base transparency AND armed determinism) before trusting
  comparisons; proof scripts/test-tribplea-20261015.js RED→GREEN (+REAL RED
  patch cycles: --red fake-discount, --break broken-gate) before the sweep.
- **Metric binding (§14)**: a miss is NO-GO, never re-scored against a
  friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.
- **Instruments**: scripts/policies/tribplea.js (layer), scripts/test-tribplea-20261015.js
  (proof), scripts/det-gate-tribplea-20261015.js (det-gate), scripts/measure-tribplea-20261015.js
  (sweep; say ring buffer 2000 + plea-line capture for sense-testing).

## Metric review (pre-filled at pre-registration — revisit after results)

- The 0.70 co-primary bar is the lineage's standard for arrears channels
  (tribstreak pre-registered 0.6/0.65 and delivered 0.93/0.88 — the bar is
  deliberately ambitious; a real terms-change should clear what timing could
  not). The plea is RARE by design (arrears + crisis + stability + table-week
  conjunction) — a single successful plea on one seed may not move 8-seed
  totals. If the mechanism fires and the direction is right but the magnitude
  misses, the review calibrates a per-plea / per-affected-bond bar for the
  next run rather than re-scoring this one.
- hungryDays ×0.85: the plea's hunger channel is INDIRECT (reduced tribute →
  less pantry drain → fewer hungry days). The direct channel is the ledger.
  If arrears move but hungryDays doesn't, the metric review owns the split.
- Risk: pleas cost −5 trust even on success; the BELONG valued-subordinate
  bar needs trust ≥ 50. A plea that wins 25% off the tribute but dips the
  link under the standing bar is a harm the trust guardrail must catch —
  the guardrail is a mean; a single-seed dip below 50 is reported honestly
  in the per-seed table either way.
- Deferred arrears: the engine verb cannot do it. If the pilot shows pleas
  firing with the ledger still ratcheting (arrears → 0 only on full weeks,
  and a cut tribute doesn't retro-forgive), that is EVIDENCE for a
  deferred-arrears engine verb — a steve-call, not this arm.

---

## Results — KILLED AT PILOT (primary missed both prongs; co-primary missed; NO-GO per §14)

Det-gate: **8/8 IDENTICAL off-vs-base AND 8/8 armed determinism** (belongseek, 40d, per-day hashes). No seeds dropped. Before/after comparisons trustworthy.
Proof: `scripts/test-tribplea-20261015.js` **RED 4/4 + GREEN 20/20** on the armed tip; REAL RED patch cycles — `--red` (fake policy-side discount in place of the real verb) → 4 mechanism assertions fail → RED OBSERVED (exit 2); `--break` (unreachable crisis gate) → 11 fail → RED OBSERVED (exit 2). Layer restored byte-verified after both cycles; backups cleaned. Post-kill, all three instruments INFO-SKIP.
SMOKE: policy id `tribplea-20261015` ✓ armed / `belongseek` ✓ control; harness drives both.

### Pre-registered metrics (8 seeds × belongseek, 180d death-aware, identical seeds)

| metric | control (TRIBPLEA unset) | armed (TRIBPLEA=1) | pre-reg bar | verdict |
|---|---|---|---|---|
| starvation deaths (**PRIMARY**) | **5** | **6** | ≤ 5 | **MISS** |
| hungryDays (**PRIMARY**) | **18** | **23** | ≤ 15.3 (×0.85) | **MISS** |
| tribute arrears kcal posted (**CO-PRIMARY**) | **139.6k** | **105.6k** | ≤ 97.7k (×0.70) | **MISS** (0.756x) |
| primary-link trust (guardrail) | 65.9 (n=7) | 66.0 (n=7) | ≥ 55.9 | PASS |
| median survival (guardrail) | 106d | 106d | ≥ 96d | PASS |
| national (guardrail) | 4/8 | 4/8 | ≥ 2/8 | PASS |
| rot per-villager-day (guardrail) | 228.1 | 237.4 | ≤ 304.5 (×1.335) | PASS |
| new death mode (guardrail) | — | none | n≥3 | PASS |

Per-seed (plea = attempts s-success/f-failed; trust = end-of-run sub-link trust):

| seed | control (days/end/hungry/starve/arrears) | armed (days/end/hungry/starve/arrears/plea/trust) |
|---|---|---|
| 11 | 34/village-lost/3/1/0.0k | 34/village-lost/3/1/0.0k — plea 0 (no bond) |
| 22 | 180/survived/3/1/52.7k | 138/village-lost/5/1/12.0k — plea 3, 3/0, trust 78 |
| 33 | 42/village-lost/3/1/7.5k | 42/village-lost/3/1/7.5k — plea 1, 1/0, trust 49 |
| 44 | 156/village-lost/0/0/22.5k | 169/village-lost/3/0/29.2k — plea 4, 4/0, trust 68 |
| 55 | 106/village-lost/3/0/39.4k | 106/village-lost/3/0/39.4k — plea 7, 0/7 guard-refused, trust 84 |
| 66 | 103/village-lost/3/1/7.5k | 99/village-lost/3/2/7.5k — plea 1, 1/0, trust 57 |
| 77 | 180/survived/0/0/0.0k | 180/survived/0/0/0.0k — plea 0 (never in arrears) |
| 88 | 78/village-lost/2/1/10.0k | 78/village-lost/3/1/10.0k — plea 0 (crisis gate held) |

### The mechanism reading (why the ledger moved but hunger didn't)

The plea FIRES and SUCCEEDS when it reaches the table: **9/9 real pleas succeeded**
(s22 3, s33 1, s44 4, s66 1) — the stability gate (trust ≥ 30) plus standing makes
the engine's score ≥ 55 nearly certain; the feared score wall never materialized.
The terms genuinely changed: s22 Thornfield 8,438 → 6,329 → 4,747 → 3,560 →
2,670 kcal/week across the engine's own chaos renegotiations + 3 layer pleas.
The ledger moved 139.6k → 105.6k (**0.756x**) — the closest any of the five
tribute arms has come to the 0.70 bar, but a miss is a miss.

Hunger didn't move because the plea's hunger channel is indirect and late: pleas
fire mid-run on mature bonds (arrears + crisis + age ≥ 14d + trust ≥ 30 + free
table-week is a rare conjunction — 16 attempts across 8×180d), while hunger
winters strike early when bonds are young/transient and the stability gate
holds. A 25% cut on future tribute cannot reach a day-34 starvation (s11) or
feed a village whose bond never formed.

s55 is the honest failure mode: the scholar was exiled at d98, and the council
verb refused 7 pleas from the road ("Haven's council doesn't take orders from
the road. Exile means exile."). The layer counted the nulls as failed pleas —
an instrument classification bug (future verb layers must pre-check the council
gate and classify guard-refusal separately from primary-refusal). The ledger
never moved: 39.4k both sides. The plea is a council verb; exile silences it.

s44 shows the other failure mode: four successful pleas bent The Hungry Road's
tribute 11,250 → 5,341/week, but arrears still rose 22.5k → 29.2k — the link
broke and re-formed at higher terms (9,494) between pleas, undoing the cuts.
Terms are not monotonic when the bond itself is unstable.

Note: the engine's OWN succession chaos renegotiation ("In the chaos, Haven
renegotiates — tribute down to X", s22 d98/d119) already occupies part of the
relief space on older links; the policy plea stacks on top during the mourning
window. This is not the forbidden automatic valve (it fires only at real
successions, on older links, with the fiction of chaos) — but it means the
marginal room for an additional asked-for plea is smaller than #258's ruling
assumed.

### Death-cause shares

Control: combat 64, "a wound that wouldn't close" 4, villager combat 10,
starvation 5, sickness 10, lockjaw 1, monster 6, contest 6, Buffering 1.
Armed: combat 53, "a wound that wouldn't close" 4, villager combat 11,
starvation 6, sickness 12, monster 6, contest 5, Buffering 1.
Every armed-side cause key exists on the control side — **no new death mode: PASS.**

### Wall numbers (this suite)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 4/8 | 0/8 | 0/8 | 3/8 | 0/8 | 106d | 180d |
| armed | 4/8 | 0/8 | 0/8 | 3/8 | 0/8 | 106d | 180d |

Exiled: 0/8 both (s55's exile was a mid-run moot exile, resolved in-run). The
scale wall stands: no table, no wins, no wave 5 on either side.

### Sense-testing (SENSE-TESTING LAW — read, not counted)

The beats read as a village humbling itself with real stakes — SENSE PASS:
- s22 d120: engine "Haven renegotiates: tribute down to 4,747 kcal/week. They
  didn't like it. They respected it." → layer "🌾 Haven humbled itself before
  Thornfield — 8,438 kcal of tribute owed, the new bearer still burying their
  dead — and asked the terms to bend. They bent: 6,329 → 4,747 kcal/week. The
  ledger breathes; the debt stands." The cause line names the arrears + grief
  context AFTER the verb confirms (#202 honored); the engine says what
  happened, the layer says why the village asked. Never a knob.
- s33 d43: "7,500 kcal of tribute owed, the hungriest streak running 9 days" —
  the hunger-winter plea reads as desperation, not optimization.
- s55 d101+: the exile refusal "Haven's council doesn't take orders from the
  road. Exile means exile." — honest, and correctly silent from the layer
  (no layer beat on non-confirmed asks).

One honest wrinkle: s22 d138 pleaded on 325 kcal of arrears — the >0 gate is
hair-trigger, consuming the weekly table for a trifle. A minimum-arrears
threshold (≥ 1 week's tribute) would reserve the plea for real shortfalls.

## Village assessment (plain words)

Eight villages on the belong road, and the asked-for plea behaved like a real
village decision: rare, costly, and narrated. It fired on 5 seeds — 9 pleas
reached a primary and all 9 succeeded; 7 died at the exile guard.

s22 is the success story: after Thornfield's speaker died, the engine's chaos
renegotiation cut tribute twice, then Haven humbled itself three more times in
the mourning window and the hungry streak, bending 8,438 → 2,670 kcal/week;
arrears 52.7k → 12.0k. The village still died at 138d (wave 4), 42 days before
its control twin — the relief bought ledger room, not life.

s44 is the emblem: The Hungry Road, the thin subordinate from the griefgift
run. Four successful pleas in the grief window bent 11,250 → 5,341/week — but
the bond broke and re-formed at 9,494 between pleas, and arrears rose anyway.
You can bend the terms of a bond that keeps snapping; you can't bend the
snapping.

s55 is the caution: exile silences the plea entirely. Seven asks died at the
council door.

Who thrived: the pleaded bonds that held — trust rebuilt to a 66 mean, no
cratered bond. Who died: the same as control — wave-3/4 combat, early
starvation on s11/s33 (dead at 34/42d before any bond existed; the plea is
inert where the bond never forms). What's missing: the backward half of the
ledger — the cut touches future weeks, never the debt already posted. That is
a deferred-arrears engine verb, still unbuilt, still Steve's call.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT** (primary missed both prongs, co-primary
  missed 0.756x vs 0.70, §14): the asked-for tribute relief via the existing
  renegotiation verb — scripts/policies/tribplea.js (TRIBPLEA=1, default OFF;
  DELETED per kill protocol), proof scripts/test-tribplea-20261015.js (RED 4/4
  + GREEN 20/20, --red/--break both RED OBSERVED exit 2, kept), det-gate
  scripts/det-gate-tribplea-20261015.js (8/8 both modes, kept), sweep
  scripts/measure-tribplea-20261015.js (kept, INFO-SKIPs post-kill), sense
  (pleaLines in per-seed JSONs, kept), evidence + per-seed JSON
  (evidence/2026-10-15/perseed-tribplea-{base,armed}/, kept), sweep JSONs
  (sweep-out/tribplea-{baseline,armed}.json, kept). Zero src/js changes.
- **DOCUMENTED (not chased, per protocol)**:
  - Exile-guard plea refusal: policy verb layers must pre-check the council
    gate (exiled/joinedVillage) and classify guard-refusal (null) separately
    from primary-refusal (false). The layer's 7/7 "failed" on s55 were
    refusals at the door, never asks. Candidate sim-findings entry.
  - Arrears gate hair-trigger (>0): pleaded on 325 kcal (s22 d138). A
    ≥1-week's-tribute minimum would reserve the plea for real shortfalls.
  - Engine chaos renegotiation already occupies part of the relief space on
    older links at succession — the marginal room for an asked-for plea is
    smaller than #258's ruling assumed.
  - Deferred arrears remains unbuilt: the verb cuts future terms only. The
    pilot evidences the need (arrears posted are never forgiven) — a
    steve-call for a new engine verb, not a policy layer.

## Metric review (§14)

1. **The KILL stands on the header as written — no re-scoring.** The primary
   required starvation ≤ 5 AND hungryDays ≤ 15.3; armed delivered 6 and 23.
   The co-primary required arrears ≤ 97.7k; armed delivered 105.6k. All three
   miss with margin, not rounding. Guardrails all pass — the kill is on the
   primaries alone.
2. **The 0.70 bar was deliberately ambitious** (the lineage's arrears
   standard); 0.756x is the closest of five tribute arms. Post-hoc, on the 4
   seeds where pleas reached the table, arrears moved 90.2k → 56.2k (0.62x)
   — but that is seed-selection after the fact. For a FUTURE run: pre-register
   a per-affected-bond arrears bar, or a minimum-arrears gate that keeps the
   denominator honest — not this run.
3. **The hunger primary was the wrong channel for a terms lever.** The plea
   changes future tribute rates; hunger winters are early and the plea is
   late. A terms-change arm should pre-register on the ledger (arrears) as
   primary and hunger as guardrail, not the reverse. This run's header did the
   opposite per the brief — judged as written, but the next terms arm should
   flip them.
4. **The s55 classification bug is a metric-review item, not a re-score:**
   guard-refusals must not count as failed pleas. The corrected mechanism
   read is 9/9 real pleas succeeded.

## Convergence state

food-economy: **killed-at-pilot** (tribplea). The fifth tribute arm (four
timing + one terms-change) and the closest to moving the ledger: the asked-for
plea via the existing renegotiation verb is REAL (9/9 real pleas succeeded,
terms genuinely bent, beats read as a village humbling itself) but the
8-seed ledger moved 0.756x vs the 0.70 bar and hunger didn't move — the
conjunction is too rare and too late to carry a hunger primary. Lineage note:
the tribute-timing asymptote stands; the terms-change moved the ledger
farther than any timing arm but still missed. The remaining tribute design
space is (a) deferred arrears (new engine verb — steve-call), or (b) the
room-exists constructed scenario from #261. #258's ruled path is now fully
measured.
