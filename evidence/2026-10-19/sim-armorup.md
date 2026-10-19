# sim-armorup — armor-donning discipline (flesh-out loop, 2026-10-19, ARM sim-armorup)

Run: fleshout-20261019T1115Z, arm sim-armorup. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/armorup.js (default OFF).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, combat-readiness ARMORED bar —
worn armor at P >= demand; the scholar via armorBonus()). The settled ARMOR MODEL
(AGENTS.md 2026-10-09): pieces additive into P, r = P/(P+20) diminishing returns,
absorbed = min(hit-1, round(hit*r)) — the hit-1 clamp guarantees at least 1 always
lands, so armor is never immunity but always helps.
Named context: the window-survival taxonomy (evidence/2026-10-19/sim-windowsurvive.md +
windowsurvive-taxonomy.md) measured state-at-death arm=0/1 for a large share of
raid/wild combat deaths (mean armored=1) — villagers fight and die under-armored.
The wave-5 door legs at stall show armor short 16/16. Both prior avenues are CLOSED:
veteran-production (0-for-11) and window-support (6 variants NO-GO). Raid defense
that never moves people is the named next.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY:** combat deaths (raid + wild + patrol channels — the taxonomy's field-combat
bucket) per run, armed vs control on IDENTICAL seeds.
**GO threshold:** >= 25% fewer combat deaths on the armed arm.
A miss is NO-GO, never re-scored mid-run (§14). Metric doubts go under "metric review".

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).
**Seeds:** pilot 8 seeds (63801–63808, comparability with the taxonomy) x
{leadfeast, belongfeast} x {control, armed} = 32 runs. Confirm (only on pilot GO): 12–16 seeds.
**Policies:** competent-player policy; substrate flags to match the taxonomy comparability:
pre-seat + windefer, VETREL=1, SEATDRIVE=0 (env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0).
**Guardrails:** wave-4 unlocks within ±2/16 runs of control; median survival no worse
than -10d; no new death mode; starvation deaths <= control+1 (paired per run).
**Watch item (not guardrail):** encumbrance/action-failure rate ("too heavy" SAY lines —
the findings-backlog weight-spam item is real; report it, don't hide it).
**§15:** before/after comparison through the balanced panel (scripts/balance-panel.js) —
the panel is the instrument, the GO threshold is the judge. Compare .md attached.

## Lever played

ARMOR-DONNING DISCIPLINE (scripts/policies/armorup.js, ARMORUP=1 opts in, default OFF):

Doctrine: on raid alarm (and before any fight the policy can foresee), villagers don
their best armor; nobody fights at arm 0 when armor exists in the village.

The real donning mechanism (read from code, not invented):
- armorOf(v, items)/armorBonus() read WORN armor; packs don't count.
- Villagers re-equip via S.equipment.autoEquip (deterministic, no RNG) from their OWN
  property (carried + personal stash). Canon Steve 2026-10-09 INDIVIDUAL OWNERSHIP: no
  communal armory, nobody else's gear touched. Villagers already get this daily at
  endDay via villagerGearDay.
- THE SCHOLAR NEVER RE-EQUIPS: autoEquip runs once at character creation, never again.
  The scholar — who dies more than the village (42 vs 30 in the taxonomy) — answers aid
  crises and defends Haven raids in day-1 clothes.
- Equipping moves the item OUT of inventory (worn, not carried): donning LIGHTENS the
  pack (packWeight counts inventory only).
- Raids fire on world state, never a schedule (havenRaidTick: 3+ world monsters, 3k+
  pantry kcal, 7-day cooldown, 18% roll). "Raid alarm" = the policy reading the same
  conditions the tick reads (the scouts report the horde).

The drill (armor-pure — weapon and accessory slots snapshotted and restored; keepsakes
grow bond only while worn, never reshuffled):
  (a) RAID-NIGHT DRILL (daily, BEFORE base.daily and before tonight's havenRaidTick):
      when a raid is foreseeable (cooldown out, 3+ world monsters, pantry >= 3k, table
      not sitting), scholar + healthy fighters at home don best armor from own property.
      Preempts base.daily deliberately: the base policy's aid answers happen inside
      daily, and the drill must land before anyone departs.
  (b) AID-CRISIS DRILL: same drill when Game.aidCrisis() is live.
  (c) Idempotent (autoEquip deterministic; no-op when best already worn), bounded
      (once/day/trigger). Narrates when it changes something (no silent actions).
  (d) FIGHT-SIDE RECORDER (record only): scholar armorBonus + party mean worn P at
      fight open — the direct lever-effect instrument.

Exact numbers: drill trigger = raidRipe() (cooldown 7d incl. live overtime knobs,
worldMonsters >= 3, pantryKcal >= 3000, table sanctity) OR aidLive(). No tick/calorie
cost charged (equipping is a UI moment in the real game; the drill models the player
donning armor at dusk — documented design call).

Proof: scripts/test-armorup-20261019.js — DON fixtures (real equipment module),
GATE (layer-off == bare w5path stack byte-identical), DET (armed repeat
byte-identical), SMOKE (both policies x both arms; armor-economy diagnostic).

## Results

32/32 pilot sweep complete (8 seeds 63801–63808 x {leadfeast, belongfeast} x
{control, armed}, 180d death-aware, pre-seat + windefer substrate with VETREL=1,
ARMORUP=1 on the armed arm). 0 bad files. (A mid-sweep host service restart
wiped /tmp and killed the sweep processes; 26/26 completed per-seed JSONs
validated clean — atomic tmp+rename writes — and the 6 missing armed seeds
were re-run deterministically. Recovery noted per the /tmp-wipe lesson.)

**PRIMARY — NO-GO.** Combat deaths (raid + wild + patrol channels): control=156,
armed=165 — a **5.8% INCREASE**, vs the >=25% reduction GO bar. Paired per-run
deltas (armed−control): 0, 0, −2, +1, −2, 0, 0, +4, 0, 0, +4, 0, −4, +10, −2, 0 —
noise around zero with two positive outliers, no systematic reduction.

**Guardrails:** wave-4 unlocks 16→16 PASS (±2 band); median survival 122.5→108.5
**FAIL** (−14d, worse than the −10d band); new death modes **FAIL**
("Ugly-Eyes", "the expedition" appear on armed only); starvation deaths PASS
(0 on both arms).

**Wall numbers:** national 13/16→14/16, table 13/16→11/16, wins 0/16→0/16,
wave-4 16/16→16/16, wave-5 0/16→0/16, median survival 122.5d→108.5d.

**Armor effect (the lever moved, but thin):** the drill fired a mean 63.8
drill-days/run; scholarChanged=29, villagerChanged=**1** across 16 runs (406
fights recorded, mean scholar fight-open P=17.9). Villagers essentially never
had donnable armor — the daily villagerGearDay already captures everything
worth wearing; the drill's only delta was same-day acquisitions (≈zero).
The scholar donned occasionally (pack armor is rare: mean unwornScholar ≈0.1–0.2
pieces/day) — a few P points, never enough to move deaths.

**Watch item — encumbrance (honest cost):** "too heavy" SAY lines control=1275,
armed=**2207** (+73%). The drill does not cause this directly (donning lightens
the scholar's pack — worn, not carried); it is trajectory divergence — the
armed runs' loot/take patterns hit pack limits more, and the "Too heavy.
Carrying X/Y kg" line has no cooldown (the known backlog spam item, confirmed
live: 468 identical lines on leadfeast-s63803).

**§15 panel:** control→armed compare decision=review_required; table shows
regression_watch (−0.125 on both policies). Panel JSON+MD attached
(evidence/2026-10-19/armorup-panel-primary.{json,md,json.gz pair}). The panel
is the instrument; the pre-registered GO bar is the judge: NO-GO.

**Verdict: KILLED AT PILOT.** Layer deleted zero-trace per kill protocol
(scripts/policies/armorup.js removed; instruments + evidence land). Kill proof:
scripts/test-armorup-20261019.js (KILLED-VERDICT) 17/17 green post-kill.

**Diagnosis:** donning discipline cannot don armor that does not exist. The
taxonomy's "arm=0/1 at death" is an armor-SCARCITY signal, not a donning
failure: villagers already re-equip daily via villagerGearDay (own property +
spares gifts); the scholar — the one fighter who never re-equips — almost
never HAS armor in their pack (unwornScholar ≈0). The transcript shows why:
loot armor is LEFT BEHIND — "Too heavy for the rest — left where it lies:
...Good Boots x1, Work Gloves x1..." — the scholar can't carry it. The gap is
armor PRODUCTION/acquisition (crafting, carry capacity for loot), not donning
discipline. Named next: an armor-production arm (lever 0 lens), not a
donning arm.

## Metric review

The pre-registered bar is met exactly as specified and missed honestly: 156→165
combat deaths, −5.8% vs the +25% GO bar — NO-GO, never re-scored (§14). No
metric doubt changes the verdict; two notes for the NEXT run on this axis:
1. **Paired deltas are the right primary** (not arm totals): the +9 total is
   carried by two outlier pairs (+4, +10); per-run deltas show noise, not harm.
   A future arm should pre-register on paired deltas with a significance bar.
2. **The "too heavy" watch item needs a rate, not a count**: counts scale with
   run length and loot patterns; per-day or per-take rates would be comparable.
3. The panel's "Unmatched flags" invalid (fixed mid-run: the AUARM label must
   not differ between before/after — arm identity belongs in the panel label,
   not flags) is an instrument fix, not a re-score; the rebuilt compare is
   review_required with table regression_watch.

## Village assessment

What the villages looked like: 16 paired villages on the pre-seat full
win-side stack (leadfeast/belongfeast, 180d death-aware). They reach national
(13–14/16) and the table (11–13/16), unlock wave-4 (16/16), win 0/16, open
wave-5 0/16 — the scale wall's shape is unchanged by the lever. Median survival
122.5d control, 108.5d armed.

Who thrived and who died and why: the combat-death mix is unchanged — raids at
haven and wild/expedition field combat, scholars dying in defense and aid
answers, villagers in the field. The drill's 29 scholar donnings (P typically
+4–9, e.g. 12→21) did not move who dies: armor is never immunity (hit-1 clamp)
and a few P points don't change fight outcomes against wave-3/4 verbs.

What the village does while the drill fires: it functions — the drill is a
dawn beat among water hauling, gossip, and raid defense. Villagers act like
people throughout (monster-naming arguments, tribute presses, fire gossip in
the transcripts); nothing about the drill made them robotic. The drill's own
fiction is thin but sensible (see sense-testing).

## Sense-testing (SENSE-TESTING LAW)

Read: 2 armed-arm transcripts — leadfeast-s63803 (16,367 SAY lines, drills=83,
sch=2, vil=1, tooHeavy=468) and belongfeast-s63806 (drills=106, sch=4,
182 days). Armor-filtered + full-day spot reads.

**The drill reads as sensible preparation.** "Dawn. You wake rested." →
"Equipped Work Gloves (hands)." → "Equipped Good Boots (shoes)." → "🛡️
Armor-up (raid-ripe): Quinn dons armor (P 12→21); 0 fighters at Haven do the
same." — a dawn donning beat before a raid-ripe day. Aid-crisis firings read
the same ("🛡️ Armor-up (aid-crisis): Austin is already armored; 1 fighter at
Haven does the same."). "Armor absorbs N" lines show the mechanic working in
fights. No villager weight complaints about armor — the weight fiction is all
pack-encumbrance.

**Blanks / noise:**
1. "0 fighters at Haven do the same" narrates a non-event — the villager drill
   changed something exactly ONCE in 16 runs; the tail is dead weight in the
   other 1,019 drill-days. In a real game this reads as noise.
2. Per-piece "Equipped X (slot)." + the summary line is redundant (3 lines for
   one beat) — honest, but the summary alone would do.
3. The "Too heavy. Carrying 23.7/22 kg." spam fires 468× on one run — the
   known backlog item, confirmed live and loud. No cooldown.
4. Probe artifact (not a game bug): one SYSTEM line rendered "the Bearer
   <redacted>" — the content pipeline's bearer-token redaction on the tool
   output path, not game text (AGENTS.md 2026-10-13).

**Does anyone fight unarmored anyway, and why?** Yes — everyone, most of the
time. The drill only fires when a raid is foreseeable (raid-ripe) or an aid
crisis is live; wild encounters, expeditions, and unforeseeable raids happen
at day-1 P. And there is usually nothing to don: the scholar's pack holds no
armor, villagers' stashes are already optimally worn by gear-day. The
unarmored fighter is not undisciplined — unequipped.

## Named nexts

1. **Armor PRODUCTION/acquisition arm (lever 0 lens)** — the diagnosed gap:
   villagers/scholars lack armor to wear. Levers: crafting drive (bark/hide
   armor recipes exist — are they crafted?), loot carry capacity (armor left
   behind "too heavy"), the scholar's pack triage. Out-of-arm; appended below.
2. **"Too heavy" cooldown** (text/ux, backlog item, confirmed 468× spam).
3. **Paired-delta significance bar** for future combat-death primaries
   (metric review).

## Out-of-arm findings

(Appended to hidden_files/sim-findings.md; not chased.)
- Armor scarcity, not donning, is the binding constraint (this run).
- "Too heavy" spam has no cooldown (confirmed 468 identical lines, leadfeast-s63803).
- Loot armor left behind for weight ("Too heavy for the rest — left where it
  lies: ... Good Boots x1, Work Gloves x1 ...") — acquisition gap.
- Probe artifact: bearer-token redaction renders "the Bearer <redacted>" in
  transcript tool output (display only, not game text).

## Convergence

**killed-at-pilot.** The arm is dead: NO-GO on the primary (−5.8% vs +25% bar),
2 guardrail fails (median survival −14d, new death modes), watch-item cost
(+73% "too heavy"). The axis stays converging: the scale wall does not move on
donning discipline — the diagnosis (armor scarcity, not donning) is the
handoff. National reached 13–14/16 on this substrate (the STANDING DIRECTIVE's
lift condition remains a coordinator/Steve call).

## Files

- scripts/probe-armorup-20261019.js — sweep probe (fork of the windowsurvive
  probe: identical substrate guard + death capture; adds armor census,
  "too heavy" say-hook, au ctx counters). Requires the deleted layer to run —
  kept as instrument evidence.
- scripts/analyze-armorup-20261019.js — before/after judge (GO test, guardrails,
  wall numbers, armor effect, watch) + §15 panel compare builder
- scripts/armorup-transcripts-20261019.js — SAY-line transcript probe
  (sysSay restored)
- scripts/test-armorup-20261019.js — KILLED-VERDICT proof (17/17 green
  post-kill). Pre-kill layer proof was 52/52 green (DON fixtures on the real
  equipment module incl. the worn-wipe bug the fixtures caught; GATE:
  layer-off == bare stack byte-identical; DET: ARMORUP=1 repeat byte-identical;
  SMOKE both policies x both arms).
- evidence/2026-10-19/perseed-armorup/{control,armed}/{leadfeast,belongfeast}/s63801–63808.json — 32 per-seed sweep JSONs
- evidence/2026-10-19/armorup-analysis.json — pilot verdict JSON
- evidence/2026-10-19/armorup-panel-primary.{json,md,json.gz pair} — §15 panel compare
- evidence/2026-10-19/armorup-transcripts/ — 2 full + 2 armor-filtered transcripts
- evidence/2026-10-19/sim-armorup.md — this file
- DELETED zero-trace per kill protocol: scripts/policies/armorup.js (the lever).
  Zero src/js changes (K4 pinned).

## Files

- scripts/policies/armorup.js — the lever (ARMORUP=1 gate, default OFF; zero src/js)
- scripts/probe-armorup-20261019.js — sweep probe (fork of the windowsurvive probe:
  identical substrate guard + death capture; adds armor census + "too heavy" hook +
  au ctx counters)
- scripts/analyze-armorup-20261019.js — before/after judge (GO test, guardrails,
  wall numbers, armor effect, watch) + §15 panel compare builder
- scripts/test-armorup-20261019.js — proof (DON fixtures + GATE + DET + SMOKE)
- evidence/2026-10-19/perseed-armorup/{control,armed}/{leadfeast,belongfeast}/s63801–63808.json
- evidence/2026-10-19/sim-armorup.md — this file
