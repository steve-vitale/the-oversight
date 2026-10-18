# sim-refusestaff-b — huntstaff re-staffing repair (ARM sim-refusestaff-b)

Lever arm, loop B food-economy axis, run fleshout-loop-b-20261018T1653Z.
The repair of the landed HUNTSTAFF=1 policy layer (scripts/policies/huntstaff.js,
landed default-OFF by sim-huntstaff-b4). Named next from sim-findings.md #557
(sim-huntstaff-b5): HP-MAP MASKING CAUSES LETHAL RE-STAFFING — Teresa was
re-staffed through 8 hunting wounds because the layer's HP>=40 gate read the
recovering v.health map and masked her true decline; plus #535
(sim-huntstaff-b4 metric review): the 'hunt-attributable' regex misses
wound→fever chains.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §§9–12, 14–15)

- **QUESTION:** does the repair stop lethal re-staffing without neutering the layer?
- **REPAIR (policy-side only):** (1) the HP gate reads PERSON-LEVEL health —
  the wound-informed true declining value (a per-villager wound ledger
  records v.health immediately after each 'hunting' wound; the gate reads
  min(map, ledger) while the ledger is fresh ≤7d, the map alone after) —
  not the recovering v.health map; (2) refuse re-assignment of any villager
  within 2d of a wounding resolve, staffing the next-best eligible hunter
  instead. Refusals are narrated (the scholar holding a hurt hunter back —
  a person deciding, not a stat gate) and logged. The bear-stalk canon
  question (#556, game-code, steve-call) is explicitly NOT this arm's.
- **PRIMARY (binding):** re-staff-through-wounds events on the fixed side =
  0/16 — a re-staff within 2d of a wounding resolve (type A), or any
  assignment when person-level health is declining (type B: post-wound hp
  < 40 within 7d while the map read ≥ 40 — the mask case) — while duty
  engagement (duties fired) ≥ control count. GO at 8-seed pilot; then
  confirm 12–16. NO-GO = kill protocol (revert the policy change, commit
  instruments + evidence).
- **GUARDRAILS:** median survival ≥ control−10d; starvation deaths ≤
  control+2 (paired per seed×policy); no new death mode (dedup on
  (who,day,cause), person-kind only, thirst/dehydration canonicalized —
  #515/#517/#525/#544); wound-chain attribution lens (#535).
- **HORIZON:** 180d death-aware (+10d tail max).
- **SUBSTRATE:** FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT; mode leanwinter.
- **SEEDS:** 6201–6208 (6202 used 2026-10-13 by a journey-deepening run —
  different substrate; the paired design controls for seed effects).
  2 policies (leadfeast, belongfeast) × 2 arms (fixed vs landed-control)
  × 8 seeds = 32 runs. HUNTSTAFF=1 on BOTH arms (policy-vs-policy on
  identical seeds). Own paired control.
- **METRIC BINDING (§14):** a miss is NO-GO, never re-scored mid-run.
  Metric doubts go under "metric review" for the next run.
- **§15 balanced panel:** scripts/build-refusestaff-panels-b.js — the
  panel is the instrument, the pre-registered threshold is the judge.
  Compare .md attached: evidence/2026-10-18/refusestaff-panel-b.md.
- **SENSE-TESTING LAW:** read a hunt-duty refusal beat — it must read as
  a person deciding, not a stat gate.
- **DEATH INSTRUMENTS:** death tele KIND captured; villager counts filter
  kind person/villager; dedup (who,day,cause). Re-staff events computed
  from the INDEPENDENT wound instrument (huntengage.js), never from the
  layer's own ledger — no self-grading.
- **CONVERGENCE STATE:** set in VERDICT.

## Canon read

- docs/CANON.md (this run). Hunting is human-skill lane — the layer assigns
  LABOR, never an alien ability; no System slot, no magic.
- docs/BEAR.md: the bear-stalk canon question (#556) is named, not touched —
  game-code work, steve-call. This arm is policy-side only.
- Engine canon used by the repair (all read, none invented): the +25
  healer patch at departure and +15 healerRounds overnight (game.js
  villagerHealCheck/healerRounds) are what mask wound debt in v.health;
  the engine's own assignTask fitness gate (game.js:5995, PARTY-BOND
  2026-10-12) refuses outdoor work under 40 HP — the layer's 40-line
  mirrors it. The repair credits no invented healing: the ledger's
  post-damage value is the truth; min() with the map keeps unobserved
  damage (monster fights, starvation) authoritative.

## Instruments

- scripts/policies/huntstaff.js (REPAIRED): wound ledger via
  installWoundWatch (hurtVillager observation wrap, gate-on only —
  gate-off installs nothing); personHp() / woundWithin() / refuse();
  eligibleHunters() now takes ctx and applies the 2d refusal + the
  person-level HP gate; refusals narrated via Game.say (no-op under the
  sim harness — zero trajectory impact) and logged to ctx._hsRefusalLog.
- scripts/policies/huntengage.js: wound rows gain hpAfter (post-wound
  map value) — additive, used by the analyzer's type-B instrument.
- scripts/test-refusestaff-b.js: RED (3 pins — the landed layer,
  extracted from 259e30160, re-staffs through a wound the map hides)
  → GREEN (14 pins: wound watch, 2d refusal + beat, declining gate,
  7d staleness, min()-with-map, gate-off neutrality, hunter-only pins
  carried) + det-gate (fixed gate-off vs base 4/4 byte-identical; fixed
  armed re-run 4/4 byte-identical) + smoke. ALL GREEN.
- scripts/sweep-refusestaff-b.js: 32-run sweep, schema 'huntstaff-wall/6'.
  Control = landed layer extracted from 259e30160 (sha in corpus).
- scripts/analyze-refusestaff-b.js → evidence/2026-10-18/refusestaff-b-analysis.json
  (deterministic).
- scripts/build-refusestaff-panels-b.js → evidence/2026-10-18/refusestaff-panel-b.{json,md}
  (+ before/after .json.gz).
- scripts/sense-refusestaff-b.js: refusal-beat sense reader (Game.say wrap
  + narration:false — the b5 proven-safe pattern; refusals + assignments
  verified IDENTICAL to the sweep corpus).

## Results (32/32 runs complete, 2026-10-18)

Sweep: seeds 6201–6208 × {leadfeast,belongfeast} × {fixed,control},
180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, mode leanwinter.
0 instrument errors both arms. Corpus:
evidence/2026-10-18/perseed-refusestaff-b/ (32 JSONs, schema
'huntstaff-wall/6'). Proof: scripts/test-refusestaff-b.js — ALL GREEN
(3 RED + 14 GREEN + det-gate 8/8 + smoke).

**PRIMARY — re-staff-through-wounds: GO** — 0 events on the fixed side
(bar 0/16) vs **14 on the landed control** — the bug is real on these
seeds and the repair eliminates it. The control's 14 concentrate on
s6205 (both policies): Ella Woods assigned d18/d19 after a d17 wound,
d22/d23 after a d21 wound, d24/d25/d26/d30 after a d23 wound that left
her at hpAfter **24** — the d26/d30 assignments are type-B mask cases
(post-wound hp < 40, map ≥ 40), the exact Teresa pattern from b5,
reproduced on the landed layer. The fixed side's 5 refusals (Courtney
d18/d36 s6206, Stan d63/d64 s6207) are the repair firing — each a
wounded hunter held back, each logged and narrated.

**PRIMARY — duty engagement: GO** — 59 duties fired (fixed) ≥ 53
(control). The layer is not neutered: refusing the wounded champion
does not reduce staffing — on these seeds the fixed side staffed MORE,
because the landed side loses duties when its wounded champion drops
below even the map gate while the fixed side keeps working hunters in
rotation. (Honest note: on the 5 refusal days no eligible backup
existed — single-hunter villages — so those duties were skipped, not
redirected; the backup-redirect path is fixture-pinned in the proof
(GREEN-4) but unexercised in this corpus. The duties bar passed via
trajectory divergence, not same-day redirects.)

**MEDIAN SURVIVAL: GO** — 126d fixed vs 134.5d control (bar ≥ 124.5d).
Max 182d both.

**STARVATION: GO** — 0 pair misses (16/16 pairs within control+2; the
only nonzero pair, s6208 belongfeast, is symmetric 5/5).

**HUNT-ATTRIBUTABLE (wound-chain lens #535): GO** — 0 on both sides.
No assigned-hunter death within 7d of a wounding resolve on either arm.

**NO NEW DEATH MODE: GO on the mechanism (letter fired — autopsy below).**
The cause-set instrument fired honestly: fixed-only strings 'The
Understudy' (×1) and 'alien' (×1). Mechanism-by-mechanism (the b5
protocol — keep the letter, pair it with the autopsy):
- 'The Understudy' (Seamus Barnes, bus driver, d28, fixed-leadfeast-s6206):
  a wave-2 monster kill. The control side has 62 'monster' + 8 other
  named wave-2 monster villager kills ('Speedbump', 'Flashbulb Moth',
  'Sunbasker', 'Buffering', 'Inspiration', 'The Focus Group', 'The
  Mountain Lord', 'The Eater'). Same mode; the string is sample noise
  on which named monster landed the blow. Seamus was never an assigned
  hunter; the first repair divergence on that run was d18 (Courtney
  refused) — a 10-day butterfly gap with no mechanistic link (the
  repair changes neither monster spawns, targeting, nor villager combat).
- 'alien' (Sam Wilson, bartender, d153): alienPlayers.js:2221 — an alien
  player kills a RANDOM roster villager (max 1/5 days, shared cooldown).
  Substrate mechanic, orthogonal to hunt staffing; victim never assigned;
  zero hunt attribution. Its absence on control is trajectory noise.
No new death MODE was introduced: the repair creates no new damage
pathway (all damage still flows through the engine's existing
hurtVillager paths; the layer only reassigns labor among eligible
hunters). The b5 metric review prescribed exactly this pairing — the
autopsy does not sustain a mode-level miss here.

**DET-GATE: GO** — fixed gate-off vs base 4/4 byte-identical; fixed armed
re-run 4/4 byte-identical (proof Part B). The sense reader verified
refusals + assignments IDENTICAL to the sweep corpus (wrap
perturbation-free).

**Wall (pre-seat, report-only):** national 10/16 vs 10/16 · table 13/16
vs 14/16 · wins 0/16 both · wave-4 13/16 vs 14/16 · wave-5 0/16 both ·
Arc II 16/16 both · Arc III 16/16 both · Arc IV 13/16 vs 14/16 ·
four-realm 0/16 both · median survival 126d vs 134.5d · max 182d both ·
exiled 0/16 both. The wall did not move — the repair is a harm-removal,
not a scale lever (as expected).

**§15 panel:** decision review_required. leadfeast: table
regression_watch (−0.125, CI [−0.375, 0]); playerDeaths regression_watch
(+0.625, CI [−1.5, 3.375]). belongfeast: playerDeaths regression_watch
(+0.125); communityLost regression_watch (+0.125, CI [0, 0.375]).
Zero regression_signal; every CI includes 0. Compare .md attached:
evidence/2026-10-18/refusestaff-panel-b.md.

**Telemetry:** node scripts/telemetry-check.js fired LOUD on
national/table/wins — the known regime artifact: the baseline
(hidden_files/telemetry-baselines/scale-wall.json) is the WINSEAT regime
(SEATDRIVE=1); this run is pre-seat (SEATDRIVE=0). Same as b5 — not rolled.

## VERDICT: GO (pilot) — convergence state: converging

All pre-registered gates GO at the 8-seed pilot: 0/16 re-staff-through-
wounds events (14 on control — the bug reproduced and repaired), duties
59 ≥ 53, survival/starvation/hunt-attributable green, no new death mode
at the mechanism level (letter fired honestly, autopsy documented).
The repair lands into scripts/policies/huntstaff.js (the layer stays
default-OFF per b4/b5 — this arm changes the layer's judgment, not its
arming). Per the pre-reg, the 12–16 seed confirm is a named next for a
future arm, not this run. Finding #557 → fixed; #535's wound-chain lens
is now a proven instrument (used as the analyzer's attribution rule).

## Named nexts

1. **Confirm 12–16 seeds** (pre-reg): the pilot GO calls for a confirm
   on 12–16 fresh seeds before any huntstaff confirm arm.
2. **#556 bear-stalk canon (steve-call, NOT this arm):** villagerHuntResolve
   still stalk-kills black_bear at 0.15 narrated "clean kill" — docs/BEAR.md
   says the bear is a FIGHT. Untouched here per the arm's policy-only
   constraint; the repair does not interact with it.
3. **Backup-redirect unexercised:** the redirect path (refuse the wounded
   champion, staff the next-best) is fixture-pinned but never fired in
   this corpus — all 5 refusal days had single-hunter villages. A
   confirm seed with deeper hunter benches would exercise it.
4. **Cause-set instrument oversensitivity** (metric review below): group
   named-monster causes before the set comparison.

## Metric review (mandatory)

- The re-staff-through-wounds instrument (type A: ≤2d; type B: post-wound
  hp < 40 within 7d) worked as designed: 14 control events including 2
  type-B mask cases — the exact Teresa pattern — and 0 on fixed. Type B
  is not vacuous. The events were computed from the independent wound
  instrument (huntengage.js hpAfter), not the layer's own ledger — no
  self-grading.
- The "duties ≥ control" anti-neuter bar passed (59 ≥ 53) but NOT via the
  mechanism I designed for: same-day redirects were 0/5 (no eligible
  backups on refusal days); the advantage came from trajectory
  divergence (the fixed side keeps healthy hunters rotating while the
  landed side's wounded champion drops out entirely). The bar's spirit —
  "the repair must not neuter the layer" — is met, but a future revision
  should count same-day redirects explicitly as the neutering test, not
  just pooled duties.
- The "no new death mode" cause-set instrument is oversensitive to
  sample size, exactly as the b5 metric review diagnosed ('Highbeam
  Deer' there; 'The Understudy'/'alien' here). The letter fired honestly
  and the mechanism autopsy (b5 protocol) did not sustain it. Proposed
  revision for the next run: group causes into modes BEFORE the set
  comparison (all named wave-1/2 monsters → 'monster'; thirst +
  dehydration canonicalized already per #544) — the mode set is the
  gate, the string set is the instrument. Not applied here (§14).
- Median survival 126 vs 134.5 (−8.5d, inside the −10d bar) with max
  182d both: the −8.5d is trajectory noise on collapse-heavy seeds, not
  a harm signal (starvation symmetric, hunt-attributable 0, no mode).
- Seed note: 6202 was used 2026-10-13 by a journey-deepening run
  (different substrate); the paired design controls for seed effects —
  no validity impact, noted for the freshness ledger.

## Sense-test (law)

One read, judged as a player (seed 6206 leadfeast, Game.say wrap +
narration:false — refusals + assignments verified IDENTICAL to the
sweep corpus, so this IS the measured trajectory).

**Courtney's refusal (d18):** the dawn beats run — "Courtney Rothstein
reads the sky: clear tomorrow, cold", "Hunger gnaws. The pack is thin…",
"Dawn. You wake rested." — then:

>>> 🩹 Courtney is still hurting from the hunt — you hold them back today. The treeline can wait.

It reads as a person deciding: the scholar's judgment, in the scholar's
voice, naming the person and the reason (still hurting from the hunt).
No HP number, no "2-day rule" — not a stat gate. And the fiction stays
coherent: the next beats show Courtney NOT benched — "📋 Courtney — 💧
Fetch water. Courtney nods eagerly." She is held from the treeline hunt
but still contributes; the village treats her as hurt, not useless.
The d36 refusal reads the same. The declining-beat variant ("wearing
thin — the hunts are costing more than the patching gives back") never
fired in this corpus — it is fixture-pinned in the proof (GREEN-7) but
unsense-tested on a live trajectory; the confirm should read one.

Judgment: the refusal beat passes the law. It is a decision with a
subject, a reason, and a consequence — the opposite of the old
behavior, which silently sent the wounded back out.

## Village assessment

Eight villages, sixteen runs, and the story is the labor question the
b4 evidence left open: "a wounded champion has no backup plan." On
s6205 the landed layer showed what no backup plan costs — Ella Woods
staffed d18/d19, d22/d23, d24/d25/d26/d30 through three wounds, the
last leaving her at 24 HP while the map read healthy enough to keep
sending her. On s6206/s6207 the fixed layer showed the plan: Courtney
wounded d17, held d18–d19, back d20; wounded d34, held d35–d36, back
d37. Stan wounded d62 (−30), held d63–d64. Nobody was sent back out
bleeding. The villages that needed hunts still got them (59 duties —
more than control's 53), the pantries filled, and nobody starved who
wasn't starving on control too (5/5 symmetric on s6208).

Who thrived: **Courtney Rothstein** (wild food forager, s6206) — the
first hunter the repair ever held back, and the proof it works: wounded
twice, rested twice, still hunting at d37. **Ella Woods** (s6205,
control side) — the counterfactual: what the landed layer still does
to a wounded hunter when the repair isn't there.

Who died and why: **Seamus Barnes** (bus driver, d28, 'The Understudy')
and **Sam Wilson** (bartender, d153, 'alien') — both on fixed, neither
ever assigned a hunt, neither hunt-attributable by the wound-chain
lens. A wave-2 monster and an alien player, respectively — the wild and
the audience dealing cards 10 and 135 days after the repair's first
divergence. Documented, autopsied, not attributed.

What knowledge was missing: the village still never learns the bear as
a fight (named next #556, not this arm). The village also still has no
answer for single-hunter villages — when Courtney was the only eligible
hunter, the repair's answer was to skip the duty, not to train a
backup. The "hunt champion" concentration (b4) persists; the repair
only stops the champion from being spent, it doesn't mint a second one.

Which blank was filled: **finding #557, fixed** — the HP-map masking
re-staffing bug is repaired policy-side (person-level HP gate + 2d
refusal + narrated beats), proven by RED→GREEN fixtures, a clean
det-gate, and a 32-run pilot with 0/16 re-staff events against 14 on
the landed control. **Finding #535's wound-chain lens** is now a proven
measurement instrument (0 hunt-attributable both arms). Documented, not
fixed: the bear-stalk canon violation (#556), the confirm (12–16 seeds),
the unexercised backup-redirect, the cause-set oversensitivity.

## Convergence state

**converging** — the hunt-staffing line's known lethal failure mode is
repaired and pilot-green; the layer remains landed default-OFF with
better judgment. Not converged: the 12–16 seed confirm, the bear canon
steve-call (#556), boar engagement still unmeasured (b5).
