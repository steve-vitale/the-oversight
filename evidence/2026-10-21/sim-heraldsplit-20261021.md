# sim-heraldsplit — wave-4 engagement census SPLIT BY TITAN CLASS (run fleshout-20261021T1215Z, axis scale-onramp)

Arm: sim-heraldsplit (DIAG-GO). Origin: backlog #749 — "the Herald refuses
solo TB entry 163/168 — wave-4 engagement censuses must split the titan
class" (evidence/2026-10-21/sim-windowreach-r2.md). The veteran-production
line keeps asking "where can villagers actually kill wave-4?" — herald
fights vs monster wave-4 fights are different channels with different entry
mechanics, and every census so far has lumped them.

Instrument-only: ZERO src/js changes, ZERO scripts/policies changes.
`scripts/instr-heraldsplit-20261021.js` layers on killdisc v2
(`scripts/killdisc-instrument-20261021.js`, on master, proven
non-perturbing): calls KD.install first, adds one read-only outer
`Game.startCombat` wrap capturing refusal context (muster have/need/ready
for titan-gate refusals; live-fight check for already-in-fight refusals —
pure reads, zero writes, zero RNG). The census (`attributeRun`) is pure
in-process analysis of the killdisc v2 telemetry (fight ids carry Date.now
and are only joinable live; per-seed JSONs carry no fight ids, so re-runs
are byte-comparable).

Titan class (from `src/data/titans.json`, read LIVE — never hardcoded):
herald (wave-4 tutorial titan) | wave4-monster (the other 9 wave-4:
congregation, strike, influencer, audit, reunion, suburb, eulogy,
algorithm, eater) | wave5-monster (wave-5 non-titans: timeslot, editor,
cancellation, spoiler, rerun, finale_crew) | other-titan (titan-flagged
non-heralds: nielsen, finale, network_heart). Trigger: omen (titans —
titans_never_wander design rule: "They arrive by omen only") / expedition /
raid / other (killdisc v2's killCtx: aid→raid, onExped→expedition).
Outcome: entered / refused-solo / fled / unmet / delegated. Refused-solo end
detail names the MECHANISM: tb-refused (titan hard gate), already-in-fight
(game.js NO SILENT CLOBBER), unknown-refusal (no fight, no live fight).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15)

**PRIMARY (DIAG-GO):** 100% attribution of wave-4 encounters by titan class
with engagement outcome, on every wave-4-reaching run; 0 unexplained, 0
instrumentErrors. Attributed = encounter with known mid + resolvable titan
class + trigger + outcome + (fight-id joined to a kill record OR explicit
unresolved reason: fled/aborted/unrecorded). Unexplained = unresolvable
class OR encounter without fight-id and without day+mid fallback.
instrumentErrors = any entry in the instrument's error sink.
**GO:** every wave-4-reaching run 100% attributed, 0 unexplained, 0
instrumentErrors.
**Minimum:** >= 2 wave-4-reaching runs. Below 2 = insufficient-data:
report-only, NOT a failure.
**Seeds:** 8 FRESH seeds 64871–64878 (verified unused across committed
evidence/*/perseed-* corpora; not 64406/64703/64858 nor 64841–64866) x
{leadfeast, belongfeast} = 16 runs on the pinned substrate (VCE.armedFor
policy from scripts/policies/vgearconfirm.js). No lever, no control arm
(diagnostic).
**Horizon:** 180d death-aware (+10d tail max).
**Env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
VGEAR=1 KILLDISC=1 (asserted up front; SUCCGRACE/RAIDDENSITY/NODEWITNESS/
FULLSEAT unset). Sweep FAILS LOUD unless env matches exactly.
**SECONDARY (report, don't judge):** reproduce the herald solo-TB-entry
refusal rate (windowreach-r2 measured 163/168 refused — report measured
rate); per-channel entry rate, refusal reasons, kill attribution per
channel (killdisc v2 join: who kills in each channel); wave-4 kills by
channel; wall numbers (national/table/wins, wave-4/5 unlocks, median/max
survival, exiled).
**§15 note:** no before/after comparison — diagnostic with no intervention.

## Instrument revision history (documented, not hidden)

- v1: titanClass covered herald / wave4-monster / other-titan only; refusal
  context captured for titan entries only. First sweep (16 runs): 7
  unexplained — all wave-5 monster spawns/engagements (timeslot, editor,
  cancellation, finale_crew) with unresolvable class; 4 refused-solo
  wave-4-monster engagements with reason unknown.
- v2: titanClass generalized to non-titan wave>=4 mids (wave5-monster);
  refusal reason captured for ALL refused startCombat calls. Re-proof all
  GREEN (57), re-sweep.
- v3 (final): refused-solo end detail names the mechanism (tb-refused /
  already-in-fight / unknown-refusal). The 4 non-titan refusals are STALE
  PENDING-ENCOUNTER echoes, proven by diagnostic: feast-drawn suburb fight
  dissolved via "It comes apart — no one in reach, no one chasing", then the
  harness's driveContestsImpl fired the stale pendingMonsterId → startCombat
  created the fight and it instantly dissolved mid-call → `return
  this.tbfight` === null. Not the titan gate, not already-in-fight. The
  instrument records reason 'unknown' + end 'unknown-refusal' honestly; the
  mechanism is documented here, not papered over. Re-proof all GREEN (57),
  final re-sweep.

## Proof gates (all GREEN before the sweep)

`scripts/test-heraldsplit-20261021.js`: E0 shape (10) · E1 det-gate
(instrument-on vs off byte-identical on the armed substrate, 2 seeds × 60d,
noinstr stability pre-check; 7) · E2 RED→GREEN on synthetic fixtures (26:
titanClass incl. wave5-monster + eater-is-not-titan, triggerOf incl.
aid-beats-exped, attributeRun RED cases — unresolvable class /
no-fightId-no-fallback / unresolved-field-no-fallback → unexplained; GREEN
cases — refused-solo w/ titan-gate reason, already-in-fight refusal,
outcome-join, kill-join, field-outcome, unmet-spawn, kill-unjoined,
titan-field-delegated, wave5 entered) · E3 read-only static scan (zero
Math.random(, zero Game.state/this.state writes outside wraps) · E4
armed+instrument determinism · D2 180d armed run through the real sweep +
byte-identical re-run. 57 passed, 0 failed.

## Results

Sweep: 16/16 runs completed, 0 errors, 0 instrumentErrors across the whole
corpus. Seeds 64871–64878 × {leadfeast, belongfeast}, 180d death-aware,
exact substrate env. Corpus: `evidence/2026-10-21/perseed-heraldsplit/`.

### PRIMARY — GO

**13/16 runs reached wave-4** (≥2 minimum met). Every wave-4-reaching run:
100% attributed, 0 unexplained, 0 instrumentErrors → **GO**. 130 wave-4+
census units total (engagements + field fights + unjoined kills + unmet
spawns), 0 unexplained. Attribution resolutions observed: tb-outcome-join
41, tb-refused 45, unmet-spawn 36, field-outcome 8.

### Per-channel table (class | trigger: outcome)

| channel | entered | refused-solo | fled | unmet | delegated |
|---|---|---|---|---|---|
| herald \| omen | 0 | 39 | 2 | 10 | 1 |
| other-titan \| omen | 0 | 2 | 0 | 0 | 0 |
| wave4-monster \| other | 39 | 4 | 4 | 22 | 0 |
| wave5-monster \| other | 1 | 0 | 0 | 6 | 0 |

Refusal reasons: titan-gate 41 (herald 39 + finale/nielsen 2), unknown 4
(the stale-pending echoes), already-in-fight 0.

### SECONDARY

**Herald solo-TB-entry refusal: 39/39 = 100%** (windowreach-r2: 163/168 =
97%). Refusal muster context: have 0/10, need 10, ready 0/39 — no village
ever mustered a single allied blade. The gate holds perfectly; the canon
("no solo fights — hard gate, not a stat check", titans.js:3) is measured,
not assumed.

**The herald's other channels:** 0 scholar TB entries, but the herald is
NOT uninvolved — it acts in the world: 10 unmet spawns (omen-staged, never
engaged), 2 villager field-flees, and **1 delegated field contact where a
villager (visjoin_119) DIED to the herald** (belongfeast s64877 d128). The
herald eats stores and strikes allied villages in the night while the
scholar watches — coalition warfare as designed, just never the duel.

**Wave-5 titans:** the scholar tried to solo the finale (need 20) and the
nielsen (need 12) — both hard-refused, 0/0 muster. Same gate, same result.

**Wave-4 monsters (the killable channel):** 39 scholar TB entries (all
entered normally — the refusal class here is entirely the 4 stale-pending
echoes), 4 fled, 22 unmet spawns. **16 wave-4 kills: scholar 10, villager
6.** By mid: eater 4 (3 scholar + 1 villager), influencer 5 (3+2),
congregation 2 (1+1), eulogy 2 (scholar), audit 1 (scholar), algorithm 1
(villager), suburb 1 (villager). Zero herald kills, zero titan kills.

**Wave-5 monsters:** 1 scholar TB entry (belongfeast s64878 d97, the
Cancellation — LOST, no kill), 6 unmet spawns. The door's own monsters are
barely touched: the wave-5 unlocks (3/16) don't convert to wave-5 fights.

**Wall numbers (16 runs):** national 12/16 · table 13/16 · wins 12/16 ·
exiled 0/16 · wave-4 unlocks 13/16 · **wave-5 unlocks 3/16** · median
survival 94d · max 181d · endReasons over-other 12 / survived 2 /
village-lost 2.

**The answer to "where can villagers actually kill wave-4?":** the
wave4-monster|other channel — 6 of 16 wave-4 kills are villager kills
(influencer ×2, congregation, eater, algorithm, suburb), via TB-companion
damage and field fights. The herald channel produces zero kills by design
(the tutorial titan is a coalition event, not a duel). The census split is
what makes this visible: lumped, the 39 herald refusals read as "wave-4
unentered"; split, wave-4 monsters show 39 entries and 16 kills.

## Village assessment (plain words)

These are winning villages (12/16 wins) on the VGEAR=1 substrate, and
wave-4 is a *lived* experience, not a wall they bounce off. The pattern
across the corpus: villages reach standing 100, the Mirror Draft opens, and
the nine monsters come as weather — scouts report them, the village musters
("it is beyond us. Everyone inside. No one walks the treeline alone"), they
gorge on the stores at the treeline for nights at a time, and then the
fights happen: the scholar plus companions, blow-by-blow, sometimes lost
(the d130 Reunion killed the scholar mid-fight and the mantle passed to
Jovan's successor in the same log). Villagers kill wave-4 monsters too —
the eater, the influencer, the algorithm — which is the veteran channel the
wave-5 door needs.

The herald is the odd one out and it's *supposed* to be: it arrives by omen,
eats the stores, strikes the allied villages at night (Thornfield bled four
times in one run while the coalition talked, trust −5 each time — "they
notice who wasn't there"), and refuses every duel. The village's
relationship with the herald is dread and logistics, never combat. That's
the design working.

What the village looked like at its most herald-haunted (belongfeast
s64877, the 37-unit run, ended village-lost): 26 herald refusals across the
run — the scholar kept walking up to the sky and being told "this is
arithmetic" — while the herald ate ~1,000 kcal a night and struck Thornfield
four times. The village fought the other monsters (the census shows its
field fights) but never solved the herald, because the herald isn't a
problem you solve with a bigger sword. It died village-lost with the herald
still waiting at tile 7,4.

## Sense-testing (narration-live re-runs, scripts/sense-heraldsplit-20261021.js)

**Herald sequence (belongfeast s64877):** the fiction reads as designed.
d92: "Scouts found its lair — tile 7,4. THE HERALD — the sky, getting
bigger. It is WAITING. You cannot face it alone. Sound the call." Then the
pressure campaign: "THE HERALD fed in the night — 1,260 kcal gone from your
stores. It is eating the realm while you deliberate." / "THE HERALD struck
Thornfield in the night. They bled while the coalition talked. (trust −5 —
they notice who wasn't there.)" And the refusal, four times in one day as
the policy keeps trying: "⛔ THE HERALD does not notice you the way prey
notices a hunter. It notices you the way weather notices a field. You
cannot face this alone — sound the call, muster 10 allied blades (you have
0). This is not courage. This is arithmetic." The dread is real, the
refusal is voiced, the villagers' absence has a social cost. Reads like
people under a sky that's getting bigger.

**Monster-fight sequence (leadfeast s64871):** the wave-4 fights read as
real fights with real stakes. d121, before the Reunion arrives: "📯 MUSTER
— scouts report The Reunion hunting near Haven, and it is beyond us.
Everyone inside. No one walks the treeline alone — the garden crews double
up, the hunters stand down. We outlast it." — muster discipline, not
bravado. The Reunion then lingers at the treeline for days, gorging on the
stores (1,000 / 600 / 929 kcal a night): "It's still out there." The d130
fight: Mateo and Desmond fight alongside the scholar, the Reunion's "Your
Move" finds the scholar for 29/32, and the scholar DIES mid-fight — the
very next line is the succession beat: "\"Jovan's gone.\" Mateo looks at
you for a long moment. \"You're not Jovan.\" No heat in it. Just fact.
You'll have to earn this face." The village-as-protagonist continuity made
visible inside a single fight log. The d120 Influencer fight was won; the
d139 Eulogy lost. No filler, no repeated barks — the fights have shape.

Judgment: both sequences read like people. The herald sequence reads as
dread + logistics; the monster sequence reads as discipline + loss. The
sense bar is met.

## Metric review

The pre-registered minimum (≥2 wave-4-reaching runs) was met 13/16 — no
revision needed. One instrument-scope lesson, fixed in-run and re-proven:
the v1 taxonomy covered only wave-4 + titans, so wave-5 monster units were
"unresolvable class" (7 unexplained). The v2 generalization (non-titan
wave>=4 mids classify by wave) is the honest scope — the census is wave-4+,
and the wave-5 door's own engagements belong in it. No metric was re-scored:
the PRIMARY's definitions never changed, only the instrument's class
resolution, and the final sweep re-ran everything from scratch.

## Convergence

**Converged** on the instrument question: the wave-4 engagement census is
now split by titan class with 100% attribution on 13/13 wave-4-reaching
runs, and the split answers the veteran-production line's question — the
killable wave-4 channel is wave4-monster|other (39 entries, 16 kills,
scholar 10 / villager 6); the herald channel is refusal-by-design with
world-pressure instead of duels. #749 can be marked fixed. The remaining
open question for the axis is not the census but the muster: 0/41 refusals
ever had a single allied blade mustered — the coalition path has never
fired in sims, and whether that's a policy gap (bots never sound the call)
or a design gap belongs to the next arm.

## Findings to file (for sim-findings.md — NOT edited by this arm)

- [open] 2026-10-21 — scale-onramp/wave-4 — STALE PENDING-ENCOUNTER ECHOES
  PRODUCE PHANTOM startCombat CALLS (sim-heraldsplit, run
  fleshout-20261021T1215Z, evidence/2026-10-21/sim-heraldsplit-20261021.md):
  4 refused-solo wave-4-monster engagements (suburb ×2, strike, audit) are
  not gate refusals — the harness's driveContestsImpl fired a stale
  pendingMonsterId after the encounter had already resolved through another
  path (proven: feast-drawn suburb fight dissolved via "It comes apart",
  then the stale pending suburb created-and-instantly-dissolved a second
  fight mid-call, `return this.tbfight` === null). The game leaves
  pendingEncounter/pendingMonsterId set when the pending monster is consumed
  by a non-pending path. Census impact: nil (attributed as unknown-refusal);
  but any future "entry rate" analysis must exclude these or the denominator
  lies. Named next: invalidate pendingEncounter when its monster id is
  consumed by a fight started through another path, or have the harness
  check the world entity is still live before firing.
- [open] 2026-10-21 — scale-onramp/wave-4 — THE MUSTER HAS NEVER FIRED IN
  SIMS (sim-heraldsplit, run fleshout-20261021T1215Z,
  evidence/2026-10-21/sim-heraldsplit-20261021.md): 41 titan-gate refusals
  (39 herald + finale + nielsen) across 16 runs, muster have 0/need every
  time, ready 0/41. No sim policy ever sounds the call, commits blades, or
  outfits allies — the entire coalition-warfare system (the herald's
  designed channel) is unexercised. Open question whether this is a policy
  gap (bots don't do the war-council UI) or unreachable-by-design in
  practice. The herald's world-pressure half (store-eating, night strikes,
  trust costs) fires fine; the coalition-fight half has zero sim coverage.
- [open] 2026-10-21 — scale-onramp/wave-5 — WAVE-5 UNLOCKS DON'T CONVERT TO
  WAVE-5 FIGHTS (sim-heraldsplit, run fleshout-20261021T1215Z,
  evidence/2026-10-21/sim-heraldsplit-20261021.md): 3/16 wave-5 unlocks
  produced 1 wave-5 monster TB entry (the Cancellation, lost) and 6 unmet
  wave-5 spawns. Same pattern as windowreach-r2's single unlock (1 evade, 0
  kills). The door opens on winning villages ~9 days before the scheduled
  win; nothing behind it gets fought. Relevant to the w5-door arm.
