# sim-refusestaff-confirm-b — huntstaff re-staffing repair CONFIRM (ARM sim-refusestaff-confirm-b)

Lever arm, loop B food-economy axis, run fleshout-loop-b-20261018T175233Z.
CONFIRM of the landed sim-refusestaff-b repair (f4728312d, current master HEAD):
person-level HP gate (wound ledger, min(map,ledger) ≤7d) + refuse re-assignment
within 2d of a wounding resolve (narrated beats, backup-redirect). NO code
changes in this arm — instruments + evidence only.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §§9–12, 14–15)

- **QUESTION:** does the landed repair reproduce its pilot effect on 16 fresh seeds?
- **REPAIR (already landed; verified at setup):** scripts/policies/huntstaff.js
  at master HEAD contains the person-level HP gate + 2d refusal; grep for
  bear/boar code returned ZERO matches — the sim-huntstaff-b5 bear/boar
  lane is NOT in the landed layer (as expected).
- **PRIMARY (binding, mechanism):** re-staff-through-wounds events on the
  armed side = 0/16 — a re-staff within 2d of a wounding resolve (type A),
  or any assignment when person-level health is declining (type B:
  post-wound hp < 40 within 7d while the map read ≥ 40 — the mask case) —
  while control (landed layer from 259e30160, HUNTSTAFF=1 both arms) is
  expected > 0. The repair must reproduce. NO-GO on any miss.
- **ENGAGEMENT (binding, anti-neuter):** hunt duties fired armed ≥ max(53,
  control×0.8) — the pilot's duties bar was 59 ≥ 53 (dutiesFixed ≥
  dutiesControl satisfied trivially). Redirect counting is EXPLICIT this
  run: same-day redirects (a refusal for vid X on day d + a same-day
  assignment to a different hunter Y) are counted as their own instrument.
- **GUARDRAILS:**
  - median survival ≥ control−10d
  - starvation deaths ≤ control+2 per seed×policy pair (villager, deduped,
    person-kind only)
  - ZERO hunt-attributable wound-chain deaths (the #535 lens:
    assigned-hunter death within ~7d of a wounding hunt resolve where the
    fatal condition's onset followed the wound — the regex alone is not enough)
  - no new death mode: fixed-side villager cause-set ⊆ control-side
    cause-set at the MODE level (named monsters grouped — metric review
    from the pilot); thirst/dehydration canonicalized (#515/#517/#525).
- **HORIZON:** 180d death-aware (+10d tail max).
- **SUBSTRATE:** FEASTSCALE_R13=1 (env assert; SWEEP STOPS on mismatch);
  SEATDRIVE=0 EXPLICIT (pre-seat); mode leanwinter.
- **SEEDS:** 6701–6708, FRESH (no prior run on this substrate) ×
  {leadfeast, belongfeast} × {control, HUNTSTAFF=1} = 32 runs, IDENTICAL
  seeds both sides, own in-sweep paired control. Control = landed layer
  extracted from pinned sha 259e30160 (same as pilot).
- **METRIC BINDING (§14):** a miss is NO-GO, never re-scored mid-run.
  Doubts go under "metric review".
- **§15 balanced panel:** scripts/build-refusestaff-panels-confirm-b.js —
  the panel is the instrument, the pre-registered threshold is the judge.
  Compare .md attached below.
- **SENSE-TESTING LAW:** read the refusal beats and the backup-redirects —
  the wounded hunter must read as a person being protected, not a flag.
- **DEATH INSTRUMENTS:** death tele KIND captured; villager counts filter
  kind person/villager; dedup (who,day,cause). Re-staff events computed
  from the INDEPENDENT wound instrument (huntengage.js), never from the
  layer's own ledger — no self-grading.
- **CONVERGENCE STATE:** set in VERDICT.

## Results (32/32 runs complete, 2026-10-18)

{leadfeast, belongfeast} × {armed (landed repair at master HEAD f4728312d),
control (landed layer extracted from pinned 259e30160)},
180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 EXPLICIT, mode leanwinter.
Env asserted up front (SWEEP STOPS on mismatch). 0 instrument errors both
arms. Corpus: evidence/2026-10-18/perseed-refusestaff-confirm-b/ (32 JSONs,
schema 'huntstaff-wall/6', redirectEvents added by this arm's sweep).

Infrastructure note: the box rebooted mid-sweep (~24 min in, 15/32 written —
uptime showed 4 min after the session dropped). The 15 completed per-seed
files were intact in ~/workspace (never /tmp); the remaining 17 runs were
resumed in a fresh sweep invocation with identical env + SEEDS/ARMS
scoping. All 32 corpus files validated: schema 'huntstaff-wall/6', runId
fleshout-loop-b-20261018T175233Z, 0 instrument errors.

**PRIMARY — re-staff-through-wounds: GO** — **0 events on the armed side
(bar 0/16) vs 26 on the landed control** (14 type A, 12 type B) — the
repair reproduces on fresh seeds. The bug is real on this corpus: the
control's 26 events include the Teresa mask pattern (type B: post-wound
hp < 40 while the map read ≥ 40) on s6708 (Bárbara: hpAfter 24/31 while
being re-staffed d170–d177) and a wound chain on s6703 (Owen re-staffed
d50–d59 through FOUR wounds). The armed side's 13 refusals (s6703 ×1,
s6706 ×8, s6703-belongfeast ×4) are the repair firing.

**ENGAGEMENT — duties: GO** — 63 duties fired (armed) ≥ bar max(53,
control×0.8 = 56). Honest reading: control staffed 70, armed 63 — the
7-duty gap IS the removed harm (26 re-staff events eliminated; the layer
keeps working hunters in rotation instead of spending the wounded
champion). Redirects: **0/13** — the backup-redirect path never fired on
a live trajectory (same as the pilot's 0/5). All 13 refusal days had no
eligible backup, so those duties were skipped, not redirected. The
redirect instrument works (explicit counting); the corpus simply has no
multi-hunter-bench villages on refusal days. Named next: still
unexercised in the wild.

**MEDIAN SURVIVAL: GO** — 145d armed vs 142d control (bar ≥ 132d). Max
182d both.

**STARVATION: GO** — 0 pair misses (16/16 pairs within control+2).

**HUNT-ATTRIBUTABLE wound-chain (#535): 0 armed vs 2 actual deaths on
control** — the strongest harm signal in the corpus. Control:
- **Bárbara Gutiérrez** (s6708 leadfeast): re-staffed d170–d179 through
  successive wounds (d169 −19 hpAfter 24; d170 −11 hpAfter 31; d177 −12),
  killed by a monster d180 — 16 re-staff events, the last two assignments
  within 2d of a wound. Wound-chain death.
- **Owen Smith** (s6703 belongfeast): re-staffed d50–d59 through four
  wounds (d49/d52/d54/d58), killed by a monster d59 — the SAME DAY as the
  last wounding re-assignment.
Armed pairs: Bárbara died to a monster d172 and Owen d67 — but with 0
re-staff events and no wound within 7d on the armed side, so neither is
wound-chain attributable. Honest note: monsters kill on both arms (the
background risk); the repair removes the wound-chain amplification, not
monsters. The #535 lens counted 28 assign-log rows on control = these 2
deaths × repeated re-assignments — the instrument rows overcount, the
deaths are 2.

**NO NEW DEATH MODE (mode-level): GO** — string-level set also fired
nothing (newModesString: []), so no autopsy needed this run. The
monsters.json-grounded lexicon (name/unknown/id → 'monster') was
validated against the pilot corpus first: all 10 pilot named-monster
strings map to 'monster', all engine modes stay distinct.

**§15 panel:** decision review_required (both policies, 8 cases each).
Zero regression_signal; every metric row was descriptive / no material
signal. The panel is the instrument, the pre-registered threshold the
judge. Compare .md attached:
evidence/2026-10-18/refusestaff-panel-confirm-b.md.

**TELEMETRY:** node scripts/telemetry-check.js fired LOUD on
national/table/wins — the known regime artifact: the baseline
(hidden_files/telemetry-baselines/scale-wall.json) is the WINSEAT regime
(SEATDRIVE=1); this run is pre-seat (SEATDRIVE=0). Same as the pilot and
b5 — not rolled.

**Wall (pre-seat, report-only):** national 13/16 vs 13/16 · table 13/16
vs 13/16 · wins 0/16 both · wave-4 13/16 vs 11/16 · wave-5 0/16 both ·
Arc II 16/16 both · Arc III 16/16 both · Arc IV 13/16 vs 13/16 ·
four-realm 0/16 both · median survival 145d vs 142d · max 182d both ·
exiled 0/16 both. The wall did not move — the repair is harm-removal,
not a scale lever (as expected).

## Metric review (mandatory)

- The re-staff instrument reproduced on fresh seeds: 26 control events
  (14 A / 12 B) vs 0 armed. Type B is not vacuous on a new seed set —
  the mask pattern (hpAfter 24/31 while the map read ≥ 40) recurred on
  s6708. The repair's person-level gate is the difference, not seed luck.
- The duties bar (max(53, control×0.8)) passed at 63 ≥ 56, but the
  explicit redirect instrument came back 0/13 — same as the pilot's 0/5.
  Two runs in, the backup-redirect path has NEVER fired on a live
  trajectory; it is proven only by fixture. The bar's spirit — "refusing
  the wounded must not neuter the layer" — is met (63 ≥ 56, villages
  still hunt), but the redirect design remains theory until a seed with
  a multi-hunter bench exercises it. Do NOT weaken the bar for this —
  the next arm should seed-shop for a bench village instead.
- The mode-level cause grouping worked as designed: zero string-level
  misses this run, so the grouping was untested in anger — but the
  pre-run validation against the pilot corpus (10/10 named monsters →
  'monster', engine modes untouched) holds as the instrument's proof.
  Keep the string-level set firing honestly alongside; the autopsy
  protocol stays.
- The #535 wound-chain lens counts assign-log ROWS (28), not deaths (2).
  The rows are the right harm measure (each row is a lethal staffing
  decision), but the evidence must report both — done above. Consider
  reporting "deaths (rows)" pairs in the next arm's analyzer output.
- Median survival 145 vs 142 (+3d armed): trajectory noise, not a signal
  (starvation symmetric, wound-chain 0 vs 2 actual deaths, no mode).
- Seed freshness: 6701–6708 have no prior run on this substrate. The
  s6702 leadfeast pair ran near-identical trajectories (10 duties each,
  0 refusals, d172 both) — the repair is neutral where it doesn't fire,
  as the det-gate promised.

## Sense-test (law)

Two reads, judged as a player (s6706 leadfeast, Game.say wrap +
narration:false; 182d re-run verified refusals + assignments IDENTICAL
to the sweep corpus — wrap perturbation-free, so this IS the measured
trajectory).

**Wyatt Baek's refusals (d88–d108):** wounded d87 (−23) → held d88, d89
("still hurting from the hunt — you hold them back today. The treeline
can wait."); the 2d window expires but the person-level gate still reads
decline → d91 "wearing thin — the hunts are costing more than the
patching gives back. You hold them back." Wounded again d96 → held
d102, d103 (the declining beat, live this time — the pilot's
unsense-tested variant); wounded d107 (−28) → held d108. Three wounds,
three holds. And the fiction stays coherent every time: the same day's
beats show Wyatt re-tasked — "📋 Wyatt — 💧 Fetch water. Wyatt nods
eagerly" — then "Wyatt showed Naran the colonies of umbrella-like
leaves... 'remember it.' Word gets around." Hurt, never useless:
hauling water, teaching foraging, still a person.

**The declining beat (d102, first live reading):** "wearing thin — the
hunts are costing more than the patching gives back" names the real
mechanism (healer patching masks wound debt — the finding #535/#557
root cause) without a number, without a rule citation. It reads as the
scholar's judgment on a person, not a stat gate. Judgment: both beats
pass the law.

## Village assessment

Sixteen villages, thirty-two runs, and the story is what the pilot
promised to reproduce: the wounded champion. On s6708 the landed layer
showed the cost — Bárbara Gutiérrez staffed d170 through d179, three
wounds deep, the ledger reading 24 HP while the map said send her, dead
to a monster on d180. On s6703 the landed layer showed the chain —
Owen Smith re-staffed through four wounds in nine days, dead d59 the
same day as his last wounding assignment. On the armed side the same
seeds tell the repair's story: Owen held four times (the 4 refusals),
the village staffed 19 duties anyway and survived to 182d; Bárbara's
armed pair ran the layer nearly silent (1 duty) and she died to a
monster d172 — the wild dealing its own cards, not the staffing layer's.

Who thrived: **Wyatt Baek** (wild food forager, s6706) — wounded three
times, held back every time, still teaching foraging and hauling water
at d108. The repair's model citizen.

Who died and why: **Bárbara Gutiérrez** (d180 control / d172 armed,
monster) and **Owen Smith** (d59 control / d67 armed, monster) — the
control deaths are wound-chain attributable (re-staffed through fresh
wounds); the armed deaths are the background monster risk the repair
doesn't claim to fix. Nobody starved asymmetrically; no new death mode.

What knowledge was missing: the village still has no backup-hunter
pipeline — every refusal day across both runs was a single-hunter
village, so the repair's answer was always "skip the duty," never
"train the second." The champion concentration persists; the repair
stops the spending, not the concentration. (Documented, not this arm.)

Which blank was filled: **the confirm itself** — the pilot's GO
reproduces on 16 fresh seeds (0/26 re-staff events armed vs control,
duties 63 ≥ 56, all guardrails green, 0 wound-chain deaths armed vs 2
actual on control). Finding #557 stays fixed; #535's lens is now
field-proven on fresh seeds.

## Named nexts

1. **Backup-redirect still unexercised in the wild** (0/13 redirects
   across two runs; fixture-only proof). Next arm: seed-shop for a
   multi-hunter-bench village to exercise the redirect path live.
2. **#556 bear-stalk canon (steve-call, game-code):** untouched per the
   arm's policy-only constraint.
3. **Backup-hunter pipeline** (finding: single-hunter villages make
   every refusal a skipped duty) — a design question, not a bug.

## VERDICT: GO (confirm) — convergence state: converging → converged-candidate

All pre-registered gates GO on 16 fresh seeds: 0/16 re-staff-through-
wounds events armed (26 on control — 14 type A, 12 type B, the Teresa
mask pattern reproduced), duties 63 ≥ max(53, control×0.8)=56, median
survival 145 ≥ 132, 0 starvation pair misses, 0 hunt-attributable
wound-chain deaths armed (2 actual on control), no new death mode at
the mode level, §15 panel review_required with zero regression_signal.
The repair is confirmed on fresh seeds. It remains harm-removal, not a
scale lever — the food-economy axis stays converging pending the
backup-redirect exercise and the bench-pipeline design question.
