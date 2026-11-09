# sim-linkdecay-a — the 76408-class pre-national link-decay diag

Run: fleshout-20261108T2315Z (Loop A). Worktree:
`~/workspace/worktrees/sim-linkdecay-a` (branch sim-linkdecay-a, cut at master
93e7bea26). Axis: scale-onramp / winnability chain (converging, NOT
converged). Prereg: evidence/2026-11-08/sim-linkdecay-a-prereg.md (commit
722b602f7, BEFORE any judged sweep). DIAG ONLY — zero src/js, no default
flips.

## Verdict: DIAG-GO — and a sizing NO-GO with numbers

All nine prereg bars hold: (a) 8/8 armed configs with a full daily corpus
(tend log + trust trajectories + trust-move attribution); (b)
actor-presence per day in the corpus (0 null days on 709 trajectory
points); (c) a decay census per link between qualification and
beat-staging/death; (d) per-seed classification complete; (e) a sizing
verdict computed from the corpus — **NO-GO on sizing a number, with the
numbers** (see below); (f) G1 det-gate PASS; (g) G2 recorder neutrality
PASS 8/8; (h) G3 corpus integrity PASS; (i) cross-check PASS 8/8.

## Canon + code read first

- docs/CANON.md, docs/SCALE.md.
- Prior decomposition, NOT re-measured: sim-tendtrust-b.md (the gate
  exactly; succession shakes −8/link/leader-death are the dominant drag;
  the engine drive fires ~1 week in 3 on an UNMEASURED actor-presence
  throttle) and sim-tenddrive-a.md (the downstream failure: seed 76408
  qualifies d58 with 4 subs and trust 49–65, links decay d60→99,
  seasoned subs 4→1, NO national beat ever stages; 11 policy tend
  attempts, all 11 mourning-refused; 5 engine tends).

## STEP 0 — ROOTS RE-VERIFIED ON CURRENT MASTER (before binding to 76408)

The baseline leg on base 93e7bea26 reproduces tenddrive-a's baseline
(base 6680d7924) **exactly, per seed and in aggregate** — no drift on
this band between those bases:

| seed | tenddrive baseline (6680d7924) | this run baseline (93e7bea26) |
|---|---|---|
| 76401 | 69d village-lost, never | 69d village-lost, never |
| 76402 | 89d over-other won 1, national d77 held | 89d over-other won 1, national d77 held |
| 76403 | 82d village-lost, starvation 1 | 82d village-lost, starvation 1 |
| 76404 | 66d village-lost, never | 66d village-lost, never |
| 76405 | 97d over-other won 1, national d77 held | 97d over-other won 1, national d77 held |
| 76406 | 103d village-lost, never | 103d village-lost, never |
| 76407 | 107d over-other won 1, national d106 held | 107d over-other won 1, national d106 held |
| 76408 | 100d village-lost, never | 100d village-lost, never |

Aggregates identical to tenddrive: won 3, median 97d, max 107d, national
ever/final 3/8, global ever 2, table seen 7 / entered 3 / full 0, wave 4
8/8, wave 5 2/8, starvation 1. **76408 still shows the shape** —
qualifies d58, no national beat ever stages — so the diag binds to it as
preregistered. (Tendtrust-b's base 715c2918d told a different per-seed
story — e.g. 76401 qualifying d89 and national d90 — and does NOT
reproduce here; the drift happened between 715c2918d and 6680d7924, not
between 6680d7924 and this base.)

## RESULTS — DIAG-GO (pilot 8+8, seeds 76401–76408, horizon 180d, death-aware)

Sweep: `node scripts/test-linkdecay-a-sweep.js` (exit 0).
Corpus: `evidence/2026-11-08/perseed-linkdecay-a/` (16/16 rows + summary.json).
G1 det-gate: PASS (seed 76401, TENDTRUST unset: baseline 69/69 days ==
wrapped 69/69 days, ts counters identical — `{}` both — no `_tendtrust`
surface).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
570 = 570).
G3 corpus integrity: PASS (16/16 rows, all days > 0, every armed row
carries the tend log + trust trajectories + decay-census inputs,
engine-gated validation matches on every armed row, actor-presence field
non-null on all 709 armed trajectory points — actorNullDays 0).
Cross-check: PASS (8/8 seeds: recorder policy tends + refused attempts
== substrate `ctx.tended` attempts — 16 + 65 = 81 — and every refused
attempt is mourning-explained, `mourningUntil > day`).

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ tendtrust-b, actor field) |
|---|---|---|
| n | 8 | 8 |
| won | 3 | 3 |
| median days / median gameDays | 97 / 97 | 97 / 97 |
| max days | 107 | 107 |
| national ever / final | 3 / 3 | 3 / 3 |
| global ever | 2 | 2 |
| table seen / entered / enteredFull | 7 / 3 / 0 | 7 / 3 / 0 |
| wave 4 / wave 5 reach | 8 / 2 | 8 / 2 |
| max arc | 4 | 4 |
| starvation deaths total | 1 | 1 |
| seat attempts / taken / failed | 3 / 3 / 0 | 3 / 3 / 0 |
| preview seen / not-ready | 10 / 7 | 10 / 7 |
| table answers | 15 | 15 |
| death total | 570 | 570 (identical breakdown) |

Baseline and armed agree on EVERY aggregate — the recorder extension is
provably neutral, same as its parent. Death causes (identical both arms):
villager combat 273 + villager-vs-villager combat 63 + expedition 133 +
player-the-wild 45 + monster 26 + arena 6 + wound 5 + starvation 1 +
named-beast singles + the rest = 570.

### Per-seed detail (armed arm; baseline identical on every trajectory metric)

| seed | days | end | won | seat | wave | rank final | leadQ / national | tends pol/eng | attempts/refused | gateBlocked |
|---|---|---|---|---|---|---|---|---|---|---|
| 76401 | 69 | village-lost | 0 | lesser priced | 5 | regional | —/— | 7 (0/7) | 12/12 | 0 |
| 76402 | 89 | over-other | 1 | lesser d90 | 4 | global | 57/77 | 5 (0/5) | 0/0 | 0 |
| 76403 | 82 | village-lost | 0 | lesser priced | 4 | regional | —/— | 11 (1/10) | 1/0 | 30 |
| 76404 | 66 | village-lost | 0 | none | 4 | village | —/— | 0 (0/0) | 0/0 | 2 |
| 76405 | 97 | over-other | 1 | lesser d97 | 4 | global | 56/77 | 13 (8/5) | 29/21 | 0 |
| 76406 | 103 | village-lost | 0 | none | 4 | regional | —/— | 14 (4/10) | 18/14 | 18 |
| 76407 | 107 | over-other | 1 | lesser d107 | 4 | national | 105/106 | 15 (3/12) | 10/7 | 28 |
| 76408 | 100 | village-lost | 0 | lesser priced | 5 | regional | 58/— | 5 (0/5) | 11/11 | 51 |

### Tend census (the measured numbers)

- **70 tends total: 16 policy + 54 engine.** The villagers' own drive
  does 77% of the tending (tendtrust-b measured 93% — the policy share
  rose because the policy route fired 16 times on this base vs 5 on
  tendtrust's).
- **Mean lift per tend: exactly +8.00 by note gain (n=70).** The
  pre→post delta mean is 7.94 — and the gap is a MEASUREMENT artifact,
  not a lift distribution: five policy tends have delta lifts of 0 or 18
  while their notes all read +8. The 18s (76403 d26, 76405 d25) are a
  tend (+8) landing the same day as a +10 accord/first-gesture; the 0s
  (76405 d37, all three links) are a tend (+8) landing the same night as
  a −8 succession shake on every link. **Future censuses must size from
  the note gain, not the delta** — the delta mean understates the lift
  and would have sized this diag's offset at 21 tends instead of 20.
  (The sweep's own census used the delta mean 7.94 and printed 21; the
  corrected number from the note gain is 20. The sizing verdict does not
  turn on 20 vs 21 — see below — but the evidence file corrects it
  rather than repeating the sweep's printout.)
- **Policy attempts: 81, refused 65 (80%).** Every refused attempt is
  mourning-explained. 76401's 12 attempts all refused; 76405's 21 of 29;
  76406's 14 of 18; 76408's 11 of 11.
- **Gate-blocked tend opportunities: 129 entries** (76403: 30, 76406: 18,
  76407: 28, 76408: 51, 76404: 2). Same shape as tendtrust-b: the blocked
  days are starvation days; lowering the 20,000 threshold opens days
  when the village cannot afford the 1,500 kcal.

### The decay census (deliverable c) — seed 76408, the only decay-no-beat seed

Window: qualification day 58 → death day 100 (42 days). Four links,
trust at qualification 53 / 53 / 65 / 56, at death 18 / 20 / 45 / 16.
Total trust change across the four links: **−128**. Total drag by source:

| source | sum | what it is |
|---|---|---|
| succession | **−120** | 15 leader-death shakes × −8, spread across all four links |
| titan | −40 | 8 Titan strikes × −5 |
| tended-engine | +8 | 1 engine tend in the whole 42-day window (d61, village_1) |
| unattributed | +24 | net +24 of gains with no history note (the +4 gains tendtrust-b found; village_2 alone +20) |
| tribute | 0 | the weekly tick nets out exactly in this window |
| **total drag** | **−160** | succession + titan |

Per link:

| link | trust 58 → 100 | succession | titan | tended | unattributed |
|---|---|---|---|---|---|
| village_0 | 53 → 18 (−35) | −30 | −5 | 0 | 0 |
| village_1 | 53 → 20 (−33) | −30 | −15 | +8 | +4 |
| village_2 | 65 → 45 (−20) | −30 | −10 | 0 | +20 |
| village_3 | 56 → 16 (−40) | −30 | −10 | 0 | 0 |

The decay is a staircase, not a slope (village_0's daily trace): trust
sits flat at 53 from d58 to d63, then −7 on d64 (shake −8, tribute +1),
flat at 46 through d76, −8 on d77, flat at 38 through d84, −7 on d85,
flat at 31 through d94, −8 on d95, −5 (Titan) on d99 to 18. Between
drops the link does not decay at all — there is no passive trust decay,
exactly as the code says. What kills the realm is fifteen bad nights,
not forty-two bad days.

### Actor presence in the window (deliverable b — the field this arm added)

- **Sampled actor-days in 76408's window: 3/42 by post snapshot
  (days 59, 66, 67), 4/42 counting pre-or-post (adds day 63).** The
  village holds 2 plan-holders all window; they are almost never home.
- **Firing opportunities by my metric: 2 days; engine tends on those
  days: 0.** The single in-window engine tend (d61, village_1, +8 with
  a same-night −5 Titan mixed in, measured delta +3) fired on a day with
  **zero sampled actor presence** — neither the pre nor the post snapshot
  shows an actor at Haven. The drive fires mid-daily; the snapshots
  bracket it and miss the actor's mid-day presence.
- Band-wide, the same undershoot: **17 of 30 engine tend-days show no
  actor at either snapshot** (13/30 show one). Actor-days by post
  snapshot are 99/709 (14%); on the 38 days my metric calls firing
  opportunities, the drive fired 6 times (16%).
- **The field is a lower bound on presence, not a measurement of it.**
  It proves the throttle is real (an actor is home ~1 day in 7 at best,
  and the drive fires once in 42 days on 76408) but it cannot size the
  gate precisely, because tend-time presence is what the drive reads and
  the snapshots don't see it. The next instrument must record the actor
  count INSIDE the tend event. (Recorded in sim-findings.md.)

### The mourning choke in the window

- **11 policy tend attempts in 76408's window (d77–81), all 11 refused.**
  Every one hits `mourningUntil` 83.
- village_0's link grieves nearly continuously from d64 to death: the
  mourning windows chain 71 → 76 → 83 → 92 → 95 → 102 — each speaker
  death re-arms grief for 7 days before the last window lifts. The
  policy route is not unlucky on 76408; it is closed for the whole
  window. (The mourning choke is CANON — "grief is not bought off" —
  so narrowing it is a Steve call, not a tuning knob.)

### Per-seed classification (deliverable d)

| seed | shape | dominant decay source in window | sizing call |
|---|---|---|---|
| 76401 | never-qualified (69d, died) | — (12 policy attempts, all refused; 7 engine tends pre-qualification) | n/a |
| 76402 | beat-staged (leadQ 57 → beat 77) | succession −24 in a 20-day window; court +30 at staging offsets it (total −24, tends 0 in window) | n/a |
| 76403 | never-qualified (82d, starvation 1) | — | n/a |
| 76404 | never-qualified (66d, never a 3rd sub) | — (courtship failure, not a tend failure — same as tendtrust-b) | n/a |
| 76405 | beat-staged (leadQ 56 → beat 77) | succession −24 in a 21-day window; court +30 at staging offsets it (total +19) | n/a |
| 76406 | never-qualified (103d) | — | n/a |
| 76407 | beat-staged (leadQ 105 → beat 106) | — (1-day window; court +30, total +33) | n/a |
| 76408 | **decay-no-beat** (leadQ 58, no beat, died d100) | **succession −120 of −160 drag** (titan −40; 1 engine tend +8) | **nogo-firing-throttle** |

Only 1 of 8 seeds is the decay-no-beat shape. The other two
qualification stories on this band are beat-staged seeds whose windows
are short (20, 21, 1 days) and whose First Court feast (+10/link at
staging) heals the succession drag the moment the beat lands — the beat
itself is the tend the decay never gets. 76407 qualifies and stages the
next day: there is no decay window at all.

## THE SIZING VERDICT (deliverable e): NO-GO on sizing a number

The arithmetic, computed from the corpus at the true lift (+8.00 by note
gain):

- Drag to offset on 76408: **−160 points → 20 tends** (ceil(160/8)).
- Weekly tend slots in the 42-day window: 6 weeks × 4 links = **24
  slots** — 20 fits. **Cadence is NOT the binding constraint.** (The
  sweep printed 21 tends vs a 3-link cap of 18 — both numbers are the
  delta-mean/cap artifacts corrected above; with the note-gain lift and
  the 4-link cap the arithmetic says the tends fit.)
- What actually fired in the window: **1 engine tend, 0 policy tends.**
  The engine drive fired once in 42 days; the policy route's 11 attempts
  all hit the mourning choke; a plan actor was sampled at Haven on 3–4
  of 42 days.
- Even at perfect firing on every sampled actor-day, the drive could
  deliver at most 4 firing days × 4 links = **16 tends — fewer than the
  20 needed** — and the policy route delivered 0 through a mourning
  window that never lifts. (16 is a lower bound, since tend-time presence
  exceeds sampled presence — but the fired count, 1, is the hard fact,
  and no lift/cadence/threshold number multiplies a drive that fires
  once in 42 days into 20 tends.)

**No number moves it.** Lift is exactly +8 everywhere (no distribution
to tune); cadence already allows the missing tends; the pantry gates
already allow them (pantryDays < 3 on only 1 of 41 window days). What
blocks them is FIRING — the actor-presence throttle and the mourning
choke — and both are GATES, not numbers. The next lever must change who
can tend or when tending is allowed (a plan actor home more often, a
tend that survives a leader's death, or a second tend source that does
not need an actor at Haven), and its size cannot be computed from this
corpus: the instrument that would size it needs tend-time actor presence,
which this corpus does not carry. That is the sizing NO-GO, with the
numbers that force it.

The numbered alternatives, with their measured weakness:

| candidate number | sized change | why it does not move it (measured) |
|---|---|---|
| trust lift per tend 8 → 12 | 20 tends → 14 tends | the tends still have to FIRE — 1 fired in 42 days |
| tend cadence 1/week → 2/week | 24 slots → 48 | the slots already exceed the need (20 ≤ 24); firing is the constraint |
| rescue-tend pantry threshold 20,000 → 10,000 | opens ~0 more days (gate-blocked entries are starvation days; 76408's pantry >20,000 on only 6/20 days before its loss week per tendtrust-b, and the 51 blocked entries here sit on thin pantries) | the newly opened days are starvation days; and the 11 attempts that DID pass the gate were all mourning-refused |
| mourning choke (7d, no gains) | 76408's 11 refused attempts land | the choke is CANON — a Steve call, not a tuning knob. Measured size on this seed: 11/11 attempts refused, link grieving d64→d102 nearly continuously |

## Sense-testing read (NON-MEASURED replay, seed 76408, armed, narration on)

File: `evidence/2026-11-08/sim-linkdecay-a-sense.txt` (242 lines; outcome
class matches the measured run exactly — 100d, village-lost, max wave 5,
regional, tableWaiting true, tableDone false — narration did not diverge
the shape).
Judgment — meaning, coherence, consequences:
- The ring is only the last 240 lines, all of day 100: a wave-5 arena
  fight (Big Ugly, the Director's Cut, rounds 45–56+, Otto and Zoltan
  falling, "No one is left to pick up the Codex. The village dies out —
  quietly, the way villages do."). The fight narration is vivid and
  coherent — cuts, dodges, style points, deaths with deeds recorded —
  and the death itself is honest: the village dies mid-show with the
  lesser seat priced and waiting (`tableWaiting=true`, never taken).
- **The decay is SILENT.** Across the whole ring, NOT ONE line mentions
  tending, trust, a bond cooling, grain sent to another village, grief
  blocking a gesture, or a realm that qualified and never sat its court.
  The ring covers only the final day, so it cannot show the d58→d100
  window directly — but that is itself the finding: the only narration
  retained is the death-fight, and the 42 days in which four bonds fell
  from 49–65 to 16–45 leave no trace in what the village hears. (The
  Binding-wait silence was already recorded by binddiag in
  sim-findings.md; this replay confirms the tend/decay side is silent
  too, on the seed where it matters most.)
- One wrinkle, not a defect: "No path there." repeats through the fight
  rounds, and "You wait. The light changes. Nothing asks anything of
  you." is the same idle texture binddiag and tendtrust-b already
  recorded — pre-existing, not this arm's finding to chase.

## Village assessment (plain words)

This village does everything right and still loses the country level —
not in a battle, but in the quiet weeks after it earns it. On day 58 it
has four allied villages and every bond strong, between 49 and 65. Then
leaders start dying — fifteen times in forty-two days, and every time
one dies, every bond loses eight points at once. The villagers themselves
tend the bonds only once in those forty-two days, because the people who
do the tending are almost never home — the village holds two people with
a plan, and they are at Haven three days out of forty-two. The scholar's
own rescue tries eleven times and is turned away eleven times, because
the villages are grieving and grief cannot be bought off. So the bonds
sit, then drop, then sit again: 53, then 46, then 38, then 31, then 23,
then 18 — a staircase down, with a week of mourning after every step.
By the time the village dies on day 100, the bonds it qualified with are
at 16 to 45, and the country level was never even offered. The cruelest
part is that the arithmetic says it was fixable: twenty tends would have
held all four bonds, and there were twenty-four weekly chances to tend
them. The chances were there. Nobody was home to take them, and the ones
who tried were told the village was grieving. The other villages on this
set of seeds tell the same story from the other side: the ones whose
court day comes quickly get ten points of trust each the moment the court
sits, and that feast is the tend the slow village never gets.

## Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-11-08/perseed-linkdecay-a/summary.json --after
evidence/2026-11-08/perseed-linkdecay-a/summary.json --out
/tmp/panel-linkdecay-a-attempt`. Result: the command printed only
`review_required`, exit 0, and wrote NO output file or directory — no
compare was performed and no panel was ingested. (The 1230Z tendtrust-b
run hit the same shape on the same kind of corpus; the panel-contract
lane owns that, not this arm.) The sweep-compare tables above are the
before/after comparison for this run, on identical seeds, judged against
the pre-registered bar.

## Metric review

- The pre-registered bars worked as written; no mid-run re-scoring. G2
  as specified here (ALL seeds identical, plus the identical death-cause
  breakdown 570 = 570) is the right strength for a daily recorder.
- **The sweep's printed sizing number (21 tends) is wrong in a stated
  direction and corrected here, not re-scored:** it used the pre→post
  delta mean (7.94), which same-day events mask (five policy tends read
  0 or 18 while their notes all read +8). The true lift is exactly 8.00
  by note gain (n=70), giving 20 tends. The sizing verdict (NO-GO) does
  not turn on 20 vs 21 — both exceed what the drive fired — but the
  evidence file states the corrected number. A future sweep should size
  from the note-gain mean.
- **The sweep's sizing cap (weeksAvailable × 3) assumes 3 links; 76408
  has 4.** The corrected slot count is 6 weeks × 4 links = 24. Same
  conclusion (the tends fit the slots; firing is the constraint), stated
  with the right numbers.
- **Instrument gap FOUND, not fixable in-run:** the actor-presence field
  samples at snapshot boundaries and misses mid-daily presence — 17/30
  engine tend-days show no actor at either snapshot, including 76408's
  only in-window tend (d61). The field is a lower bound. The next
  instrument needs the actor count recorded inside the tend event (or a
  mid-daily sample at the agency tick). The firing-rate conclusion (1
  tend in 42 days) is a hard count and does not depend on the field.
- "Median days" as a cost bar is uninformative for a pure-read arm (97
  vs 97 by construction); the informative neutrality proof is the
  per-seed identity (G2) plus the identical death breakdown. Same note
  as tendtrust-b.
- The prereg's step-0 re-verification earned its keep again: tendtrust's
  per-seed story (76401 national d90) does not reproduce on this base,
  but tenddrive's does exactly. The band is seed-frozen, not
  trajectory-frozen, and the diag bound to the shape that actually
  occurs on current master — which, on this base, is the same shape
  tenddrive named.

## Findings outside this arm (reported, NOT touched — appended to sim-findings.md)

- Actor-presence boundary sampling misses mid-daily presence (17/30
  engine tend-days show no actor at either snapshot): the next
  instrument should record actor count at tend time.
- Policy-tend lift by pre→post delta is masked by same-day events (0/18
  lifts with noteGain 8): future censuses must size from the note gain.
- 76408's mourning chain keeps a link grieving d64→d102 nearly
  continuously (windows 71 → 76 → 83 → 92 → 95 → 102): the mourning
  choke in extreme form; the policy route goes 0/11.
- The decay window is silent in narration: the sense ring covers only
  the final-day fight; nothing names bonds cooling between qualification
  and the beat that never comes.

## Wall numbers (pilot, tableseat-nowait, 180d, 8 seeds)

National/table/wins: national ever 3/8, final 3/8, global ever 2, table
seen 7, entered 3, enteredFull 0, won 3 (all lesser seat). Wave 4–5
unlocks: wave 4 reached 8/8, wave 5 reached 2/8. Median survival 97d,
max 107d. Starvation 1 (seed 76403). The Binding (BELONG) never fires on
either leg. The full seat remains unreached (0/8).

## Convergence state

Axis scale-onramp / winnability (converging, NOT converged). This arm
DIAG-GOs as a measurement and closes the question tendtrust-b left open:
the actor-presence throttle is now MEASURED, not named — a plan actor is
sampled at Haven ~1 day in 7 on the band (99/709 post-snapshot days),
3–4 of 42 days in 76408's window — and the decay it gates is sized:
succession drag −120 of −160 on the one decay seed, offset by 20 tends
that the firing rate (1 in 42 days) and the mourning choke (11/11
refused) cannot deliver. The next lever is a gate (who tends, when
tending is allowed), not a number — and it cannot be sized until an
instrument records tend-time presence. No default flips; no src/js
changes; the recorder extension is a new field on a proven-neutral
default-OFF policy instrument.

## Files / commits (branch `sim-linkdecay-a`, base `93e7bea26`)

- `722b602f7` prereg. `236fb5e54` recorder extension (actor-presence
  field only) + proof test (11 checks). `c06bf132a` sweep + decay-census
  analysis + extended proof test (17 checks). Corpus + sense + this
  evidence file: to commit below.
- Evidence: `evidence/2026-11-08/sim-linkdecay-a.md` (this file),
  `sim-linkdecay-a-prereg.md`, `sim-linkdecay-a-sense.txt`,
  `perseed-linkdecay-a/` (16 rows + summary.json).
- Instruments: `scripts/policies/tendtrust-b.js` (actor-presence field),
  `scripts/test-linkdecay-a.js` (17 checks), `scripts/test-linkdecay-a-sweep.js`
  (sweep + --detgate + --sense + decay census).
- Worktree contains only committed work. Ready to merge via --ff-only
  (no game-code change lands).
